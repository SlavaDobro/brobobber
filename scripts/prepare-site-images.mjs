#!/usr/bin/env node
// Astra illustrations (.local/astra/site-*.png) → public/images/site/<name>.webp (1536 px) and <name>-800.webp.
// Usage: node scripts/prepare-site-images.mjs
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('public/images/site', { recursive: true })
for (const file of readdirSync('.local/astra').filter(f => /^site-.*\.png$/.test(f))) {
  const name = file.replace(/^site-/, '').replace(/\.png$/, '')
  const image = await loadImage(`.local/astra/${file}`)
  for (const [suffix, width] of [['', 1536], ['-800', 800]]) {
    const scale = width / image.width
    const canvas = createCanvas(width, Math.round(image.height * scale))
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    writeFileSync(`public/images/site/${name}${suffix}.webp`, canvas.toBuffer('image/webp', 80))
  }
  console.log(name)
}
