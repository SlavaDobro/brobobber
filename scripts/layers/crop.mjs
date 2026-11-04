#!/usr/bin/env node
// Saves a zoomed crop of an image on the site's pale background, for close visual review.
// Usage: node scripts/layers/crop.mjs <in.png> <out.png> <l> <t> <r> <b> [scale]
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { writeFileSync } from 'node:fs'

const [input, output, ...rest] = process.argv.slice(2)
const [l, t, r, b, scale = 1] = rest.map(Number)
const image = await loadImage(input)
const canvas = createCanvas((r - l) * scale, (b - t) * scale)
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#e9ebe4'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.drawImage(image, l, t, r - l, b - t, 0, 0, canvas.width, canvas.height)
writeFileSync(output, canvas.toBuffer('image/png'))
