#!/usr/bin/env node
// Turns the imported old-site photos (.local/old-site/<page>/NN.jpg) into web images:
//   public/images/photos/<page>/NN-1600.webp and NN-800.webp  (longest edge, quality 78)
// and writes src/lib/site/photos.json with sizes, plus contact sheets in .local/qa/photos/.
// Usage: node scripts/prepare-photos.mjs
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'

const source = '.local/old-site'
const target = 'public/images/photos'
const manifest = {}

for (const page of readdirSync(source).filter(d => statSync(path.join(source, d)).isDirectory() && d !== 'video')) {
  const files = readdirSync(path.join(source, page)).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort()
  mkdirSync(path.join(target, page), { recursive: true })
  manifest[page] = []
  const thumbs = []
  for (const file of files) {
    const id = path.parse(file).name
    let image
    try { image = await loadImage(path.join(source, page, file)) } catch { console.warn(`skip unreadable ${page}/${file}`); continue }
    const { width, height } = image
    if (width < 500 || height < 400) continue // logos, icons, tiny decorations
    for (const size of [1600, 800]) {
      const out = path.join(target, page, `${id}-${size}.webp`)
      if (existsSync(out)) continue
      const scale = Math.min(1, size / Math.max(width, height))
      const canvas = createCanvas(Math.round(width * scale), Math.round(height * scale))
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      writeFileSync(out, canvas.toBuffer('image/webp', 78))
    }
    manifest[page].push({ id, w: width, h: height })
    thumbs.push({ id, image })
  }
  // Contact sheet for choosing covers.
  const cols = 6, cw = 220, ch = 160
  const sheet = createCanvas(cols * cw, Math.ceil(thumbs.length / cols) * (ch + 18) || 1)
  const ctx = sheet.getContext('2d')
  ctx.fillStyle = '#222'; ctx.fillRect(0, 0, sheet.width, sheet.height)
  ctx.font = '13px sans-serif'
  thumbs.forEach(({ id, image }, i) => {
    const x = (i % cols) * cw, y = Math.floor(i / cols) * (ch + 18)
    const s = Math.min(cw / image.width, ch / image.height)
    ctx.drawImage(image, x + (cw - image.width * s) / 2, y + 18 + (ch - image.height * s) / 2, image.width * s, image.height * s)
    ctx.fillStyle = '#fff'; ctx.fillText(`${id}  ${image.width}x${image.height}`, x + 4, y + 13)
  })
  mkdirSync('.local/qa/photos', { recursive: true })
  writeFileSync(`.local/qa/photos/${page}.jpg`, sheet.toBuffer('image/jpeg', 80))
  console.log(`${page}: ${manifest[page].length} photos`)
}
mkdirSync('src/lib/site', { recursive: true })
writeFileSync('src/lib/site/photos.json', JSON.stringify(manifest, null, 1) + '\n')
