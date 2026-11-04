#!/usr/bin/env node
// Puts several images (or the right half of QA pairs) on one sheet for review.
// Usage: node scripts/layers/montage.mjs <out.png> <columns> <cell-width> [--right-half] <images...>
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const rightHalf = args.includes('--right-half')
const [out, columns, cellWidth, ...files] = args.filter(a => a !== '--right-half')
const cols = Number(columns), cw = Number(cellWidth)
const images = await Promise.all(files.map(f => loadImage(f)))
const ch = Math.round(cw * (rightHalf ? images[0].height / (images[0].width / 2) : images[0].height / images[0].width))
const rows = Math.ceil(images.length / cols)
const canvas = createCanvas(cols * cw, rows * (ch + 22))
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#e9ebe4'; ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.font = '15px sans-serif'; ctx.fillStyle = '#222'
images.forEach((image, i) => {
  const x = (i % cols) * cw, y = Math.floor(i / cols) * (ch + 22)
  const sx = rightHalf ? image.width / 2 : 0, sw = rightHalf ? image.width / 2 : image.width
  ctx.drawImage(image, sx, 0, sw, image.height, x, y + 22, cw, ch)
  ctx.fillText(path.basename(files[i]), x + 6, y + 16)
})
writeFileSync(out, canvas.toBuffer('image/png'))
