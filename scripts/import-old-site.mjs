#!/usr/bin/env node
// One-off import of the client's own material from the old Tilda site (brobobber.moscow):
// page texts and photos into .local/old-site/ (git-ignored). Re-running skips files already there.
// Usage: node scripts/import-old-site.mjs
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const origin = 'https://brobobber.moscow'
const pages = ['', 'v-rod', 'rocket', 'scrambler', 'yamahaxvs100', 'sportster883', 'triumphboneville', 't100', 'hd114', 'suzukim109r', 'bmvk100', '48nardogray', '1200roadster', 'vmax']
const out = '.local/old-site'
const agent = { 'User-Agent': 'brobobber-site-import/1.0' }

const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
const strip = html => decode(html.replace(/<br\s*\/?>/gi, '\n').replace(/<li[^>]*>/gi, '\n• ').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').replace(/\n\s*/g, '\n').trim()

const data = {}
for (const slug of pages) {
  const html = await fetch(`${origin}/${slug}`, { headers: agent }).then(r => r.text())
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, '')
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || slug
  // Text of Tilda atoms and standard blocks, in page order, without duplicates.
  const texts = []
  // Tilda writes class attributes with either quote style.
  const re = /<(div|h1|h2|h3|span|p)[^>]*class=(["'])[^"']*(tn-atom|t-title|t-name|t-descr|t-text|t-accordion__title|t-accordion__text|t-card__title|t-card__descr)[^"']*\2[^>]*>([\s\S]*?)<\/\1>/g
  for (const m of body.matchAll(re)) { const t = strip(m[4]); if (t.length > 0 && !texts.includes(t)) texts.push(t) }
  // Photos: original files, not Tilda's resized previews.
  const images = [...new Set([...body.matchAll(/(?:data-original|data-img-zoom-url|src)="(https:\/\/static\.tildacdn\.com\/[^"]+\.(?:jpe?g|png|webp))"/gi)].map(m => m[1].replace(/\/-\/[^/]+\/[^/]+\//, '/')))]
  data[slug || 'home'] = { title: decode(title), texts, images }
  console.log(`${slug || 'home'}: ${texts.length} texts, ${images.length} images`)
}
mkdirSync(out, { recursive: true })
writeFileSync(path.join(out, 'content.json'), JSON.stringify(data, null, 2))

let downloaded = 0, skipped = 0, failed = 0
for (const [page, { images }] of Object.entries(data)) {
  mkdirSync(path.join(out, page), { recursive: true })
  for (const [i, url] of images.entries()) {
    const file = path.join(out, page, `${String(i + 1).padStart(2, '0')}${path.extname(new URL(url).pathname).toLowerCase()}`)
    if (existsSync(file)) { skipped++; continue }
    try {
      const response = await fetch(url, { headers: agent })
      if (!response.ok) throw new Error(response.status)
      writeFileSync(file, Buffer.from(await response.arrayBuffer()))
      downloaded++
    } catch (error) { failed++; console.warn(`failed ${url}: ${error.message}`) }
  }
}
console.log(`photos: ${downloaded} downloaded, ${skipped} already there, ${failed} failed`)
