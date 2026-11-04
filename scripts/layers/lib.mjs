// Shared helpers for turning Astra edits of a frozen base photo into registered layers.
// Node only (uses @napi-rs/canvas, a dev dependency).
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

export const W = 1536, H = 1024

/** Loads an image into a W×H canvas (scaled if the model returned another size). */
export async function load(file) {
  const image = await loadImage(file)
  const canvas = createCanvas(W, H)
  canvas.getContext('2d').drawImage(image, 0, 0, W, H)
  return { canvas, width: image.width, height: image.height }
}

export function pixels(canvas) {
  return canvas.getContext('2d').getImageData(0, 0, W, H)
}

export function save(canvas, file) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, canvas.toBuffer('image/png'))
}

/** Grayscale + alpha signature at a reduced size, used for registration. */
function signature(canvas, w, h, transform) {
  const small = createCanvas(w, h)
  const ctx = small.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.scale(w / W, h / H)
  if (transform) {
    const { scale, dx, dy } = transform
    // Scale around the canvas centre, then shift.
    ctx.translate(W / 2 + dx, H / 2 + dy)
    ctx.scale(scale, scale)
    ctx.translate(-W / 2, -H / 2)
  }
  ctx.drawImage(canvas, 0, 0)
  ctx.restore()
  const d = ctx.getImageData(0, 0, w, h).data
  const out = new Float32Array(w * h)
  for (let i = 0; i < out.length; i++) out[i] = .3 * d[i * 4] + .59 * d[i * 4 + 1] + .11 * d[i * 4 + 2]
  // Edge magnitude makes registration insensitive to recolouring.
  const edges = new Float32Array(w * h)
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x
    edges[i] = Math.abs(out[i + 1] - out[i - 1]) + Math.abs(out[i + w] - out[i - w])
  }
  return edges
}

function score(a, b, mask) {
  let sum = 0, n = 0
  for (let i = 0; i < a.length; i++) {
    if (mask && mask[i]) continue
    sum += Math.abs(a[i] - b[i]); n++
  }
  return sum / Math.max(1, n)
}

/** Boolean mask (at w×h) of boxes [l,t,r,b] in full-res coordinates to ignore during registration. */
function boxMask(boxes, w, h) {
  if (!boxes?.length) return null
  const m = new Uint8Array(w * h)
  for (const [l, t, r, b] of boxes) {
    for (let y = Math.floor(t * h / H); y < Math.ceil(b * h / H); y++)
      for (let x = Math.floor(l * w / W); x < Math.ceil(r * w / W); x++) if (x >= 0 && y >= 0 && x < w && y < h) m[y * w + x] = 1
  }
  return m
}

/** Finds scale + shift that best maps `moving` onto `fixed`. Coarse-to-fine grid search. */
export function register(fixed, moving, ignoreBoxes = []) {
  let best = { scale: 1, dx: 0, dy: 0, error: Infinity }
  const levels = [
    { w: 192, h: 128, scales: [.96, .97, .98, .99, 1, 1.01, 1.02, 1.03, 1.04], range: 40, step: 8 },
    { w: 384, h: 256, scales: [-.006, -.003, 0, .003, .006], range: 8, step: 4 },
    { w: 768, h: 512, scales: [-.002, 0, .002], range: 4, step: 2 },
    { w: 1536, h: 1024, scales: [0], range: 2, step: 1 },
  ]
  for (const [index, level] of levels.entries()) {
    const target = signature(fixed, level.w, level.h)
    const ignore = boxMask(ignoreBoxes, level.w, level.h)
    const centre = best
    // Errors from different resolutions are not comparable: each level starts fresh around the previous winner.
    best = { ...centre, error: Infinity }
    const scales = index === 0 ? level.scales : level.scales.map(s => centre.scale + s)
    for (const scale of scales) {
      for (let dy = -level.range; dy <= level.range; dy += level.step) {
        for (let dx = -level.range; dx <= level.range; dx += level.step) {
          const t = { scale, dx: centre.dx + dx, dy: centre.dy + dy }
          const error = score(target, signature(moving, level.w, level.h, t), ignore)
          if (error < best.error) best = { ...t, error }
        }
      }
    }
  }
  return best
}

/** Applies a registration transform, returning a new W×H canvas. */
export function warp(canvas, { scale, dx, dy }) {
  const out = createCanvas(W, H)
  const ctx = out.getContext('2d')
  ctx.translate(W / 2 + dx, H / 2 + dy)
  ctx.scale(scale, scale)
  ctx.translate(-W / 2, -H / 2)
  ctx.drawImage(canvas, 0, 0)
  return out
}

/** Separable box blur of a Float32 mask (radius in px), in place-safe. */
export function blur(mask, radius) {
  if (radius <= 0) return mask
  const tmp = new Float32Array(mask.length), out = new Float32Array(mask.length)
  const pass = (src, dst, horizontal) => {
    const len = horizontal ? W : H, lines = horizontal ? H : W
    for (let line = 0; line < lines; line++) {
      let acc = 0
      const at = k => horizontal ? line * W + k : k * W + line
      for (let k = -radius; k <= radius; k++) acc += src[at(Math.min(len - 1, Math.max(0, k)))]
      for (let k = 0; k < len; k++) {
        dst[at(k)] = acc / (2 * radius + 1)
        acc += src[at(Math.min(len - 1, k + radius + 1))] - src[at(Math.max(0, k - radius))]
      }
    }
  }
  pass(mask, tmp, true)
  pass(tmp, out, false)
  return out
}

/** Grows (positive) or shrinks (negative) a binary mask by r px. */
export function morph(mask, r) {
  const grown = blur(mask, Math.abs(r))
  const out = new Float32Array(mask.length)
  for (let i = 0; i < mask.length; i++) out[i] = r > 0 ? (grown[i] > .001 ? 1 : 0) : (grown[i] > .999 ? 1 : 0)
  return out
}

/** Keeps only connected components of at least `min` pixels. */
export function despeckle(mask, min) {
  const seen = new Uint8Array(mask.length), out = new Float32Array(mask.length), stack = []
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue
    const component = []
    stack.push(start); seen[start] = 1
    while (stack.length) {
      const i = stack.pop(); component.push(i)
      const x = i % W
      for (const j of [i - 1, i + 1, i - W, i + W]) {
        if (j < 0 || j >= mask.length || seen[j] || !mask[j]) continue
        if ((j === i - 1 && x === 0) || (j === i + 1 && x === W - 1)) continue
        seen[j] = 1; stack.push(j)
      }
    }
    if (component.length >= min) for (const i of component) out[i] = 1
  }
  return out
}

export function inBoxes(x, y, boxes) {
  return boxes.some(([l, t, r, b]) => x >= l && x <= r && y >= t && y <= b)
}
