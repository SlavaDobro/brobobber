#!/usr/bin/env node
// Rebuilds every site photo from its original in .local/ and writes the real file widths to
// src/lib/site/photo-widths.json as [large, small, aspect], so the browser picks the right size
// and frames know the photo's proportions. Also writes the soft `-blur` copies.
// Usage: node scripts/rebuild-photos.mjs         full rebuild from the originals
//        node scripts/rebuild-photos.mjs --meta  keep the photos, refresh the list and blur copies
import { loadImage } from '@napi-rs/canvas'
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { writeBlur, writePhoto } from './photo-output.mjs'

const target = 'public/images/photos'
const metaOnly = process.argv.includes('--meta')

/** The original file of a stored photo, or undefined. @param {string} dir @param {string} id */
function original(dir, id) {
  if (dir.startsWith('tg-')) {
    const file = path.join('.local/telegram', dir.slice(3), `p${parseInt(id)}.jpg`)
    return existsSync(file) ? file : undefined
  }
  const folder = dir === 'styles' ? '.local/styles' : path.join('.local/old-site', dir)
  if (!existsSync(folder)) return undefined
  const name = readdirSync(folder).find(f => path.parse(f).name === id && /\.(jpe?g|png|webp)$/i.test(f))
  return name && path.join(folder, name)
}

const widths = {}
let done = 0, missing = 0
for (const dir of readdirSync(target).sort()) {
  if (!statSync(path.join(target, dir)).isDirectory()) continue
  const ids = readdirSync(path.join(target, dir)).filter(f => f.endsWith('-1600.webp')).map(f => f.slice(0, -10)).sort()
  for (const id of ids) {
    const stem = path.join(target, dir, id)
    const file = metaOnly ? `${stem}-1600.webp` : original(dir, id)
    if (!file) { console.warn(`no original: ${dir}/${id}`); missing++; continue }
    const image = await loadImage(file)
    const sizes = metaOnly ? [image.width, Math.min(image.width, 800)] : writePhoto(image, stem)
    writeBlur(image, stem)
    widths[`${dir}/${id}`] = [...sizes, +(image.width / image.height).toFixed(3)]
    if (++done % 40 === 0) console.log(`${done} photos`)
  }
}
writeFileSync('src/lib/site/photo-widths.json', JSON.stringify(widths) + '\n')
console.log(`done: ${done} photos, ${missing} without an original`)
