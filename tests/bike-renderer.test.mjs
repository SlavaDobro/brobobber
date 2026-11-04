import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createCanvas } from '@napi-rs/canvas'
import { drawFloor, frameSize } from '../src/lib/bike-renderer.js'
import { cameras } from '../src/lib/cameras.js'
import { exhausts, accessories, paints, leathers, wheels } from '../src/lib/configurator.js'
import { manifest, loadViewNode, renderNode } from '../scripts/layers/render.mjs'

const { width, height } = frameSize
const output = process.env.BIKE_QA_OUTPUT
if (output) await mkdir(output, { recursive: true })

const pixelsOf = canvas => canvas.getContext('2d').getImageData(0, 0, width, height).data
const parts = [...exhausts, ...accessories].map(item => item.layer).filter(Boolean)

test('every option layer exists for the cameras that can see it', () => {
  for (const part of parts) {
    const seen = Object.values(manifest.views).filter(view => view.layers[part]).length
    assert.ok(seen >= 4, `${part} is registered for only ${seen} cameras`)
  }
  // The exhaust sits on the motorcycle's right side: the left profile must not change.
  assert.equal(Object.keys(manifest.views.left.layers).filter(part => part.startsWith('exhaust')).length, 0)
})

for (const camera of cameras) {
  test(`${camera.id}: layers stay inside their cut, colours stay inside their masks`, async () => {
    const assets = manifest.views[camera.id]
    assert.ok(assets.materials, 'materials mask missing')
    const view = await loadViewNode(camera.id)
    assert.equal(view.base.width, 1536)
    assert.equal(view.base.height, 1024)

    const stock = pixelsOf(await renderNode(camera.id, { floor: false }))

    for (const part of Object.keys(assets.layers)) {
      const [left, top, w, h] = assets.layers[part].box
      const { layers: [layer] } = await loadViewNode(camera.id, [part])
      const changed = pixelsOf(await renderNode(camera.id, { parts: [part], floor: false }))
      let inside = 0
      for (let i = 0; i < stock.length; i += 4) {
        if (stock[i] === changed[i] && stock[i + 1] === changed[i + 1] && stock[i + 2] === changed[i + 2] && stock[i + 3] === changed[i + 3]) continue
        const x = (i / 4) % width, y = Math.floor(i / 4 / width)
        const inBox = x >= left && x < left + w && y >= top && y < top + h
        const cut = inBox ? layer.meta.data[((y - top) * w + (x - left)) * 4 + 3] : 0
        assert.ok(layer.over ? cut > 0 : cut >= 128, `${part} changed ${x},${y} outside its cut`)
        inside++
      }
      assert.ok(inside > 1000, `${part} makes no visible change`)
    }

    // Recolouring touches only pixels the masks assign to that material.
    const mask = view.materials.data
    for (const [channel, key, option] of [[0, 'paint', paints[3]], [1, 'leather', leathers[2]], [2, 'wheels', wheels[2]]]) {
      if (!assets.stats[key]) continue
      const recoloured = pixelsOf(await renderNode(camera.id, { [key]: { hex: option.hex, finish: option.finish }, floor: false }))
      let count = 0
      for (let i = 0; i < stock.length; i += 4) {
        if (stock[i] === recoloured[i] && stock[i + 1] === recoloured[i + 1] && stock[i + 2] === recoloured[i + 2]) continue
        assert.ok(mask[i + channel] > 0, `${key} colour leaked to ${(i / 4) % width},${Math.floor(i / 4 / width)}`)
        count++
      }
      assert.ok(count > 1000, `${key} recolour has no effect`)
    }

    const floor = createCanvas(width, height)
    drawFloor(floor.getContext('2d'), camera.contacts)
    for (const [x, y] of camera.contacts) {
      assert.ok(floor.getContext('2d').getImageData(x, y + 2, 1, 1).data[3] > 90, 'Contact shadow missing at tyre')
    }
    assert.equal(floor.getContext('2d').getImageData(0, 0, 1, 1).data[3], 0)

    if (output) {
      // Full build next to the stock photo, on the showroom colour, for visual review.
      const sheet = createCanvas(1536, 550)
      const ctx = sheet.getContext('2d')
      ctx.fillStyle = '#eff1e9'; ctx.fillRect(0, 0, 1536, 550)
      ctx.drawImage(await renderNode(camera.id), 0, 0, 768, 550)
      const build = { paint: { hex: paints[2].hex, finish: paints[2].finish }, leather: { hex: leathers[1].hex }, wheels: { hex: wheels[2].hex, finish: wheels[2].finish }, parts: Object.keys(assets.layers).filter(part => part !== 'exhaust-shotgun') }
      ctx.drawImage(await renderNode(camera.id, build), 768, 0, 768, 550)
      await writeFile(path.join(output, `${camera.id}.png`), sheet.toBuffer('image/png'))
    }
  })
}
