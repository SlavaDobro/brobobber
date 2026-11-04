// Base photographs are 1536 × 1024; the canvas adds space below for the floor shadow.
export const frameSize = { width: 1536, height: 1100 }

/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} Pixels */
/** @typedef {{ content: Pixels, meta: Pixels, box: number[] }} Layer */
/** @typedef {{ hex: string | null, finish?: string }} Material */

/** @param {string} hex */
export function rgb(hex) {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16))
}

/** Replaces the base inside each layer's cut with the layer's pixels and material weights.
 * Layers were extracted from Astra edits of this exact base, so no transform is needed.
 * @param {Uint8ClampedArray} frame @param {Uint8ClampedArray} materials @param {Layer[]} layers */
export function applyLayers(frame, materials, layers, width = frameSize.width) {
  for (const { content, meta, box } of layers) {
    const [left, top, w, h] = box
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4
        if (meta.data[o + 3] < 128) continue
        const i = ((top + y) * width + left + x) * 4
        frame[i] = content.data[o]; frame[i + 1] = content.data[o + 1]
        frame[i + 2] = content.data[o + 2]; frame[i + 3] = content.data[o + 3]
        materials[i] = meta.data[o]; materials[i + 1] = meta.data[o + 1]; materials[i + 2] = meta.data[o + 2]
      }
    }
  }
}

// How each finish treats the photo's shading: contrast of the diffuse light and strength of reflections.
const finishes = {
  gloss: { contrast: 1, specular: .9 },
  metallic: { contrast: 1.1, specular: 1 },
  matte: { contrast: .55, specular: .18 },
  satin: { contrast: .8, specular: .45 },
  polished: { contrast: 1.25, specular: 1 },
}

/** Luminance-preserving recolour of one material channel (0 paint, 1 leather, 2 wheels).
 * The photo keeps its light: target colour × relative shading + the original highlights.
 * @param {Uint8ClampedArray} frame @param {Uint8ClampedArray} materials
 * @param {number} channel @param {Material} material @param {number} reference mean luminance of this material in the base */
export function recolor(frame, materials, channel, material, reference) {
  if (!material.hex || !reference) return
  const target = rgb(material.hex)
  const finish = finishes[material.finish || 'gloss'] || finishes.gloss
  // Light colours scatter more light into the shadows: deep reflections of the dark
  // original would read as grey metal, so their shading is softened.
  const lightness = (.2126 * target[0] + .7152 * target[1] + .0722 * target[2]) / 255
  const contrast = finish.contrast * (1 - .55 * Math.max(0, lightness - .35) / .65)
  const specular = finish.specular
  const highlight = Math.max(150, reference * 1.9)
  for (let i = 0; i < frame.length; i += 4) {
    const weight = materials[i + channel] / 255
    if (weight <= 0 || !frame[i + 3]) continue
    const r = frame[i], g = frame[i + 1], b = frame[i + 2]
    const y = .2126 * r + .7152 * g + .0722 * b
    let shade = y / reference
    // Highlights above the diffuse range become reflections instead of brighter paint.
    shade = shade > 1 ? 1 + (shade - 1) * .35 : shade
    shade = 1 + (shade - 1) * contrast
    const gloss = Math.max(0, y - highlight) / (255 - highlight) * 255 * specular
    for (let c = 0; c < 3; c++) {
      const value = Math.min(255, Math.max(0, target[c] * shade + gloss))
      frame[i + c] = frame[i + c] * (1 - weight) + value * weight
    }
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y
 * @param {number} rx @param {number} ry @param {number} opacity */
function ellipseShadow(ctx, x, y, rx, ry, opacity) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(rx, ry)
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
  gradient.addColorStop(0, `rgba(24, 32, 25, ${opacity})`)
  gradient.addColorStop(.35, `rgba(24, 32, 25, ${opacity * .6})`)
  gradient.addColorStop(1, 'rgba(24, 32, 25, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(-1, -1, 2, 2)
  ctx.restore()
}

/** Soft floor shadow under the tyre contact points. @param {CanvasRenderingContext2D} ctx @param {number[][]} contacts */
export function drawFloor(ctx, contacts) {
  if (contacts.length === 2) {
    const [a, b] = contacts
    ctx.save()
    ctx.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 3)
    ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]))
    ellipseShadow(ctx, 0, 0, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + 155, 50, .22)
    ctx.restore()
  } else {
    ellipseShadow(ctx, contacts[0][0], contacts[0][1] - 14, contacts[0][2] * 2.5, 80, .22)
  }
  for (const [x, y, radius] of contacts) {
    ellipseShadow(ctx, x, y + 1, radius * 1.7, 24, .28)
    ellipseShadow(ctx, x, y, radius, 9, .64)
  }
}

/** Pure drawing entry point, shared by the browser and the asset tests.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ base: CanvasImageSource, materials: Pixels | null, layers: Layer[], stats: Record<string, { luminance: number } | null>,
 *   paint: Material, leather: Material, wheels: Material, contacts: number[][], floor?: boolean }} options */
export function renderBike(ctx, { base, materials, layers, stats, paint, leather, wheels, contacts, floor = true }) {
  const { width, height } = frameSize
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(base, 0, 0, 1536, 1024)
  const image = ctx.getImageData(0, 0, 1536, 1024)
  const weights = materials ? new Uint8ClampedArray(materials.data) : new Uint8ClampedArray(image.data.length)
  applyLayers(image.data, weights, layers)
  recolor(image.data, weights, 0, paint, stats.paint?.luminance || 0)
  recolor(image.data, weights, 1, leather, stats.leather?.luminance || 0)
  recolor(image.data, weights, 2, wheels, stats.wheels?.luminance || 0)
  ctx.putImageData(image, 0, 0)
  // The floor is independent of every option and stays behind the motorcycle.
  if (floor) {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    drawFloor(ctx, contacts)
    ctx.restore()
  }
}
