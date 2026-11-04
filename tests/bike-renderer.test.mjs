import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { bikeAssets, frameSize } from '../src/lib/bike-assets.js'
import { renderBike, drawFloor, inRegions } from '../src/lib/bike-renderer.js'

const { width, height } = frameSize
const output = process.env.BIKE_QA_OUTPUT
if (output) await mkdir(output, { recursive: true })

for (const camera of bikeAssets) {
  test(`${camera.id}: high-resolution base, stable geometry, saddle and floor`, async () => {
    const base = await loadImage(`public/images/vrod/${camera.id}.png`)
    const overlay = camera.overlay ? await loadImage(`public/images/vrod/${camera.overlay}.png`) : undefined
    assert.equal(base.width, 1536)
    assert.equal(base.height, 1024)
    const render = (exhaust, seat = '#29292a', floor = true) => {
      const canvas = createCanvas(width, height)
      renderBike(canvas.getContext('2d'), { base, overlay, camera, paint: '#b8653c', seat, exhaust, floor })
      return canvas
    }
    const short = render('short'), twin = render('twin')
    const a = short.getContext('2d').getImageData(0, 0, width, height).data
    const b = twin.getContext('2d').getImageData(0, 0, width, height).data
    let changes = 0
    for (let i = 0; i < a.length; i += 4) {
      if (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2] && a[i + 3] === b[i + 3]) continue
      changes++
      const x = (i / 4) % width, y = Math.floor(i / 4 / width)
      assert.ok(inRegions(x, y, camera.exhaustRegions), `Exhaust changed unrelated pixel at ${x},${y}`)
    }
    assert.ok(camera.id === 'left' ? changes === 0 : changes > 100, 'Visible exhaust change missing')

    const leather = render('short', '#9a5d34')
    const c = leather.getContext('2d').getImageData(0, 0, width, height).data
    let leatherChanges = 0
    for (let i = 0; i < a.length; i += 4) {
      if (a[i] === c[i] && a[i + 1] === c[i + 1] && a[i + 2] === c[i + 2]) continue
      leatherChanges++
      const x = (i / 4) % width, y = Math.floor(i / 4 / width)
      assert.ok(inRegions(x, y, camera.seatRegions), 'Saddle colour leaked onto mechanical parts')
      assert.ok(a[i + 3] < 250 || (Math.abs(a[i] - a[i + 1]) <= 1 && Math.abs(a[i + 1] - a[i + 2]) <= 2),
        'Warm marks remain on black saddle')
    }
    assert.ok(leatherChanges > 100)

    const floor = createCanvas(width, height)
    drawFloor(floor.getContext('2d'), camera)
    for (const [x, y] of camera.contacts) {
      const alpha = floor.getContext('2d').getImageData(x, y + 2, 1, 1).data[3]
      assert.ok(alpha > 90, 'Contact shadow missing at tyre')
    }
    assert.equal(floor.getContext('2d').getImageData(0, 0, 1, 1).data[3], 0)

    if (output) {
      // Render the actual application compositor against its light showroom colour.
      const comparison = createCanvas(1536, 1100)
      const ctx = comparison.getContext('2d')
      ctx.fillStyle = '#eff1e9'; ctx.fillRect(0, 0, 1536, 1100)
      ctx.drawImage(short, 0, 0, 768, 550)
      ctx.drawImage(twin, 768, 0, 768, 550)
      ctx.drawImage(leather, 0, 550, 768, 550)
      ctx.drawImage(render('twin', '#9a5d34'), 768, 550, 768, 550)
      await writeFile(path.join(output, `${camera.id}.png`), comparison.toBuffer('image/png'))
    }
  })
}
