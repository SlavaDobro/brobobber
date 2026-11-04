// Turns an Astra edit of a frozen base photo into pixel-registered assets.
//
// extractMask:  the edit painted body panels #FF00FF, leather #00FF00, wheel rims #0000FF.
//               Returns an RGB weight map (paint / leather / wheels) aligned to the base.
// extractLayer: the edit changed one part inside the given boxes [[l,t,r,b],...].
//               Returns `content` (new pixels, edge pre-blended with the base) and `meta`
//               (alpha = hard cut where the base is replaced, RGB = material weights there).
//
// CLI (for one-off checks):
//   node scripts/layers/extract.mjs mask  <base> <edited> <out.png>
//   node scripts/layers/extract.mjs layer <base> <edited> <out-prefix> '<boxes json>' [materials.png]
import { createCanvas } from '@napi-rs/canvas'
import { fileURLToPath } from 'node:url'
import { W, H, load, pixels, save, register, warp, blur, morph, despeckle, inBoxes } from './lib.mjs'

const PALE = '#e9ebe4'

async function aligned(basePath, editPath, ignoreBoxes) {
  const base = await load(basePath)
  const edit = await load(editPath)
  const transform = register(base.canvas, edit.canvas, ignoreBoxes)
  return { base, transform, B: pixels(base.canvas).data, E: pixels(warp(edit.canvas, transform)).data, editSize: [edit.width, edit.height] }
}

export async function extractMask(basePath, editPath) {
  const { base, transform, B, E } = await aligned(basePath, editPath, [])
  const paint = new Float32Array(W * H), leather = new Float32Array(W * H), wheels = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) {
    if (B[i * 4 + 3] < 8) continue
    const r = E[i * 4], g = E[i * 4 + 1], b = E[i * 4 + 2]
    // The base itself must agree with the key colour, so a fill that spills onto
    // neighbouring black frame or chrome is ignored: teal paint, warm leather, dark neutral rims.
    const br = B[i * 4], bg = B[i * 4 + 1], bb = B[i * 4 + 2]
    const max = Math.max(br, bg, bb), min = Math.min(br, bg, bb)
    const teal = Math.min(bg, bb) - br > 6 || (max > 200 && Math.min(bg, bb) >= br)
    const warm = br - bb > 8
    const neutral = max - min < 40
    // Flat key colours: classify by dominance so antialiased edges still count.
    if (r > 150 && b > 150 && g < 110 && Math.abs(r - b) < 90) paint[i] = teal ? 1 : 0
    else if (g > 150 && r < 120 && b < 120) leather[i] = warm || max < 70 ? 1 : 0
    else if (b > 150 && r < 110 && g < 110) wheels[i] = neutral ? 1 : 0
  }
  const clean = m => blur(despeckle(morph(morph(m, -1), 1), 400), 1)
  const P = clean(paint), L = clean(leather), K = clean(wheels)
  const canvas = createCanvas(W, H), ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  const counts = { paint: 0, leather: 0, wheels: 0 }
  for (let i = 0; i < W * H; i++) {
    const a = B[i * 4 + 3] / 255
    img.data[i * 4] = P[i] * a * 255
    img.data[i * 4 + 1] = L[i] * a * 255
    img.data[i * 4 + 2] = K[i] * a * 255
    img.data[i * 4 + 3] = 255
    if (P[i] > .5) counts.paint++
    if (L[i] > .5) counts.leather++
    if (K[i] > .5) counts.wheels++
  }
  ctx.putImageData(img, 0, 0)

  // QA: base dimmed with the three masks tinted on top.
  const qa = createCanvas(W, H), q = qa.getContext('2d')
  q.fillStyle = PALE; q.fillRect(0, 0, W, H)
  q.globalAlpha = .55; q.drawImage(base.canvas, 0, 0); q.globalAlpha = 1
  const overlay = q.getImageData(0, 0, W, H), o = overlay.data
  for (let i = 0; i < W * H; i++) {
    const p = P[i], l = L[i], k = K[i]
    if (p + l + k < .05) continue
    o[i * 4] = o[i * 4] * (1 - p) + 255 * p
    o[i * 4 + 1] = o[i * 4 + 1] * (1 - l) + 220 * l
    o[i * 4 + 2] = o[i * 4 + 2] * (1 - k) + 255 * k
  }
  q.putImageData(overlay, 0, 0)
  return { canvas, qa, counts, transform }
}

/** @param layerMaterials optional mask made from the edit itself (already aligned to the base): exact weights inside the layer. */
export async function extractLayer(basePath, editPath, boxes, materials, layerMaterials = null) {
  const { base, transform, B, E } = await aligned(basePath, editPath, boxes)
  const M = materials ? pixels(materials).data : null
  const LM = layerMaterials ? pixels(layerMaterials).data : null

  // Compare softened images so re-rendered noise does not count as a change.
  const soft = (data, c) => {
    const ch = new Float32Array(W * H)
    for (let i = 0; i < W * H; i++) ch[i] = data[i * 4 + c] * data[i * 4 + 3] / 255
    return blur(ch, 2)
  }
  const sb = [0, 1, 2, 3].map(c => soft(B, c)), se = [0, 1, 2, 3].map(c => soft(E, c))
  const changed = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) {
    if (!inBoxes(i % W, (i / W) | 0, boxes)) continue
    const diff = Math.abs(sb[0][i] - se[0][i]) + Math.abs(sb[1][i] - se[1][i]) + Math.abs(sb[2][i] - se[2][i])
    if (diff > 70 || Math.abs(sb[3][i] - se[3][i]) > 50) changed[i] = 1
  }
  // One solid part: close gaps, drop noise, grow a little.
  let core = morph(morph(changed, 10), -10)
  core = despeckle(core, 600)
  core = morph(core, 4)
  for (let i = 0; i < W * H; i++) if (!inBoxes(i % W, (i / W) | 0, boxes)) core[i] = 0
  // Soft blend weight inside a hard cut: the edge band is pre-mixed with the base,
  // so replacing the cut region reproduces the base exactly at the border (no halo).
  const weight = blur(core, 4)

  let l = W, t = H, r = -1, b = -1, area = 0
  for (let i = 0; i < W * H; i++) {
    if (weight[i] <= .002) continue
    const x = i % W, y = (i / W) | 0
    if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y
    area++
  }
  if (r < 0) return { area: 0, transform }
  const bw = r - l + 1, bh = b - t + 1
  const content = createCanvas(bw, bh), meta = createCanvas(bw, bh)
  const ci = content.getContext('2d').createImageData(bw, bh), mi = meta.getContext('2d').createImageData(bw, bh)
  for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) {
    const i = y * W + x, w = weight[i]
    if (w <= .002) continue
    const k = i * 4, o = ((y - t) * bw + (x - l)) * 4
    const ab = B[k + 3] / 255, ae = E[k + 3] / 255
    const a = ab * (1 - w) + ae * w
    for (let c = 0; c < 3; c++) ci.data[o + c] = a > 0 ? (B[k + c] * ab * (1 - w) + E[k + c] * ae * w) / a : 0
    ci.data[o + 3] = a * 255
    if (LM) {
      // The edit's own mask: blend towards the base mask across the soft edge band.
      for (let c = 0; c < 3; c++) mi.data[o + c] = (M ? M[k + c] * (1 - w) : 0) + LM[k + c] * w
    } else if (M) {
      // Fallback: material weights survive only where the edit kept the base.
      const keep = 1 - w * changed[i]
      for (let c = 0; c < 3; c++) mi.data[o + c] = M[k + c] * keep
    }
    mi.data[o + 3] = 255
  }
  content.getContext('2d').putImageData(ci, 0, 0)
  meta.getContext('2d').putImageData(mi, 0, 0)

  // QA: [base | composite] on the pale floor, edit boxes outlined.
  const qa = createCanvas(W * 2, H), q = qa.getContext('2d')
  q.fillStyle = PALE; q.fillRect(0, 0, W * 2, H)
  q.drawImage(base.canvas, 0, 0)
  const composite = createCanvas(W, H), c = composite.getContext('2d')
  c.drawImage(base.canvas, 0, 0)
  c.globalCompositeOperation = 'destination-out'; c.drawImage(meta, l, t)
  c.globalCompositeOperation = 'source-over'; c.drawImage(content, l, t)
  q.drawImage(composite, W, 0)
  q.strokeStyle = '#e0457b'; q.lineWidth = 3
  for (const [bl, bt, br, bb] of boxes) q.strokeRect(W + bl, bt, br - bl, bb - bt)
  return { content, meta, qa, box: [l, t, bw, bh], area, transform }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [mode, basePath, editPath, out, boxesJson, materialsPath] = process.argv.slice(2)
  if (mode === 'mask') {
    const result = await extractMask(basePath, editPath)
    save(result.canvas, out); save(result.qa, out.replace(/\.png$/, '.qa.png'))
    console.log(result.transform, result.counts)
  } else if (mode === 'layer') {
    const materials = materialsPath ? (await load(materialsPath)).canvas : null
    const result = await extractLayer(basePath, editPath, JSON.parse(boxesJson), materials)
    if (result.area) { save(result.content, out + '.png'); save(result.meta, out + '-meta.png'); save(result.qa, out + '.qa.png') }
    console.log(result.transform, result.box, result.area)
  } else {
    console.error('Usage: extract.mjs mask <base> <edited> <out.png> | layer <base> <edited> <out-prefix> <boxes-json> [materials.png]')
    process.exit(2)
  }
}
