// Shared photo output: two WebP files per photo, named by target WIDTH (-1600 and -800).
// A photo is never enlarged. Reducing in halving steps with high-quality smoothing keeps fine
// parallel detail (engine fins, spokes, grilles) from turning into ripple.
import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'node:fs'

export const photoWidths = [1600, 800]
const quality = { 1600: 86, 800: 84 }

/** @param {any} source @param {number} width @param {number} height */
function draw(source, width, height) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  return canvas
}

/** Scales an image to the given width in halving steps. @param {any} image @param {number} width */
export function scaled(image, width) {
  const ratio = image.height / image.width
  let current = image, w = image.width
  while (w / 2 >= width) {
    w = Math.round(w / 2)
    current = draw(current, w, Math.round(w * ratio))
  }
  return draw(current, width, Math.round(width * ratio))
}

/** Writes `<base>-1600.webp` and `<base>-800.webp`; returns the real widths [large, small].
 *  @param {any} image @param {string} base @param {number} [q] override, for quality tests */
export function writePhoto(image, base, q) {
  return photoWidths.map(target => {
    const width = Math.min(image.width, target)
    writeFileSync(`${base}-${target}.webp`, scaled(image, width).toBuffer('image/webp', q ?? quality[target]))
    return width
  })
}
