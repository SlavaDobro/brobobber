#!/usr/bin/env node
// Builds configurator assets from the raw Astra edits in .local/astra/.
//   public/images/vrod/<view>-materials.png        paint / leather / wheels weights (RGB)
//   public/images/vrod/layers/<view>-<part>.png    replacement pixels, cropped
//   public/images/vrod/layers/<view>-<part>-meta.png  cut (alpha) + material weights (RGB)
//   src/lib/vrod-layers.json                       crop boxes and material statistics
// QA images go to .local/qa/. Usage: node scripts/layers/build.mjs
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { views } from './jobs.mjs'
import { extractMask, extractLayer } from './extract.mjs'
import { W, H, load, pixels, save } from './lib.mjs'

// Where each part may change, per camera ([left, top, right, bottom] in base pixels).
const regions = {
  'exhaust-drag': {
    right: [[140, 520, 1000, 800]], 'front-quarter': [[100, 500, 1010, 860]], 'rear-quarter': [[380, 480, 1140, 860]],
    front: [[430, 480, 650, 880]], rear: [[880, 540, 1130, 900]],
  },
  'cowl': {
    right: [[1040, 180, 1270, 430]], 'front-quarter': [[1080, 120, 1340, 470]], front: [[600, 40, 940, 420]],
    left: [[290, 180, 520, 430]], 'rear-quarter': [[1080, 90, 1320, 310]],
  },
}
regions['exhaust-shotgun'] = regions['exhaust-drag']

const raw = name => `.local/astra/${name}.png`
const manifest = { size: [W, H], views: {} }

for (const view of views) {
  const basePath = `public/images/vrod/${view}.png`
  const entry = { materials: null, stats: {}, layers: {} }
  manifest.views[view] = entry

  let materials = null
  if (existsSync(raw(`${view}-mask`))) {
    const mask = await extractMask(basePath, raw(`${view}-mask`))
    materials = mask.canvas
    save(mask.canvas, `public/images/vrod/${view}-materials.png`)
    save(mask.qa, `.local/qa/${view}-materials.png`)
    entry.materials = `${view}-materials.png`
    // Mean luminance of each material in the base: the recolouring reference.
    const B = pixels((await load(basePath)).canvas).data, M = pixels(materials).data
    for (const [c, name] of ['paint', 'leather', 'wheels'].entries()) {
      let sum = 0, n = 0
      for (let i = 0; i < W * H; i++) {
        if (M[i * 4 + c] < 128) continue
        sum += .2126 * B[i * 4] + .7152 * B[i * 4 + 1] + .0722 * B[i * 4 + 2]; n++
      }
      entry.stats[name] = n ? { luminance: Math.round(sum / n * 10) / 10, pixels: n } : null
    }
    console.log(`${view}: materials`, mask.transform, entry.stats)
  } else console.warn(`${view}: no mask edit yet`)

  for (const [part, perView] of Object.entries(regions)) {
    const boxes = perView[view]
    if (!boxes || !existsSync(raw(`${view}-${part}`))) continue
    const own = existsSync(raw(`${view}-${part}-mask`)) ? (await extractMask(basePath, raw(`${view}-${part}-mask`))).canvas : null
    const layer = await extractLayer(basePath, raw(`${view}-${part}`), boxes, materials, own)
    if (!layer.area) { console.warn(`${view}-${part}: no change found`); continue }
    save(layer.content, `public/images/vrod/layers/${view}-${part}.png`)
    save(layer.meta, `public/images/vrod/layers/${view}-${part}-meta.png`)
    save(layer.qa, `.local/qa/${view}-${part}.png`)
    entry.layers[part] = { box: layer.box }
    const { scale, dx, dy } = layer.transform
    console.log(`${view}-${part}: box ${layer.box.join(',')} area ${layer.area} registration ${scale.toFixed(3)} ${dx},${dy}`)
  }
}

// Stage backdrops: compact WebP copies of the Astra originals.
mkdirSync('public/images/env', { recursive: true })
for (const id of ['workshop', 'night']) {
  if (!existsSync(raw(`env-${id}`))) continue
  const { canvas } = await load(raw(`env-${id}`))
  writeFileSync(`public/images/env/${id}.webp`, canvas.toBuffer('image/webp', 82))
  console.log(`env ${id}: webp written`)
}

writeFileSync('src/lib/vrod-layers.json', JSON.stringify(manifest, null, 2) + '\n')
console.log('wrote src/lib/vrod-layers.json')
