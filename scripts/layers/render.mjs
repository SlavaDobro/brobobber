// Renders configurator frames in Node with the same renderer the site uses.
// CLI: node scripts/layers/render.mjs <out.png> <view> '<config json>' ['<config json>' ...]
//   config: { "paint": {"hex":"#a85b34","finish":"metallic"}, "leather": {...}, "wheels": {...}, "parts": ["exhaust-drag"] }
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderBike, frameSize } from '../../src/lib/bike-renderer.js'
import { cameras } from '../../src/lib/cameras.js'

export const manifest = JSON.parse(readFileSync(new URL('../../src/lib/vrod-layers.json', import.meta.url), 'utf8'))
const root = new URL('../../public/images/vrod/', import.meta.url)

async function pixelsOf(file) {
  const image = await loadImage(fileURLToPath(new URL(file, root)))
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  return ctx.getImageData(0, 0, image.width, image.height)
}

/** Same inputs as asset-cache.js loadView, read from disk. */
export async function loadViewNode(view, parts = []) {
  const assets = manifest.views[view]
  const available = parts.filter(part => assets.layers[part])
  return {
    base: await loadImage(fileURLToPath(new URL(`${view}.png`, root))),
    materials: assets.materials ? await pixelsOf(assets.materials) : null,
    layers: await Promise.all(available.map(async part => ({
      content: await pixelsOf(`layers/${view}-${part}.png`),
      meta: await pixelsOf(`layers/${view}-${part}-meta.png`),
      box: assets.layers[part].box,
      over: !!assets.layers[part].over,
    }))),
    stats: assets.stats,
  }
}

const none = { hex: null }
export async function renderNode(view, { paint = none, leather = none, wheels = none, parts = [], floor = true } = {}) {
  const canvas = createCanvas(frameSize.width, frameSize.height)
  const camera = cameras.find(item => item.id === view)
  renderBike(canvas.getContext('2d'), { ...(await loadViewNode(view, parts)), paint, leather, wheels, contacts: camera.contacts, floor })
  return canvas
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [out, view, ...configs] = process.argv.slice(2)
  const cols = Math.min(2, configs.length), cw = 960, ch = Math.round(cw * frameSize.height / frameSize.width)
  const sheet = createCanvas(cols * cw, Math.ceil(configs.length / cols) * ch)
  const ctx = sheet.getContext('2d')
  ctx.fillStyle = '#eff1e9'; ctx.fillRect(0, 0, sheet.width, sheet.height)
  for (const [i, json] of configs.entries()) {
    const frame = await renderNode(view, JSON.parse(json))
    ctx.drawImage(frame, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch)
  }
  writeFileSync(out, sheet.toBuffer('image/png'))
}
