#!/usr/bin/env node
// Reads the public web preview of the client's Telegram channel (t.me/s/BROBOBBERru) page by page
// and saves posts (text, photos, videos) to .local/telegram/posts.json. With --media it also
// downloads photos and videos into .local/telegram/<post id>/. Re-running skips existing files.
// Usage: node scripts/import-telegram.mjs [--media]
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const channel = 'BROBOBBERru'
const out = '.local/telegram'
const agent = { 'User-Agent': 'Mozilla/5.0 (brobobber-site-import)' }
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
const text = html => decode(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim()

mkdirSync(out, { recursive: true })
const posts = new Map()
let before = ''
for (let page = 0; page < 80; page++) {
  const html = await fetch(`https://t.me/s/${channel}${before ? `?before=${before}` : ''}`, { headers: agent }).then(r => r.text())
  const chunks = html.split('<div class="tgme_widget_message_wrap').slice(1)
  if (!chunks.length) break
  let minId = Infinity
  for (const chunk of chunks) {
    const id = +((chunk.match(/data-post="[^/]+\/(\d+)"/) || [])[1] || 0)
    if (!id) continue
    minId = Math.min(minId, id)
    const body = (chunk.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || ''
    const photos = [...chunk.matchAll(/tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)/g)].map(m => m[1])
    const videos = [...chunk.matchAll(/<video[^>]*src="([^"]+)"/g)].map(m => m[1])
    const thumbs = [...chunk.matchAll(/tgme_widget_message_video_thumb[^>]*background-image:url\('([^']+)'\)/g)].map(m => m[1])
    const date = (chunk.match(/<time datetime="([^"]+)"/) || [])[1] || ''
    // Albums appear as several posts sharing a grouped message; keep each post id.
    posts.set(id, { id, date, text: text(body), photos, videos, thumbs, tooLarge: /Media is too big|message_video_duration/.test(chunk) && !videos.length })
  }
  if (!Number.isFinite(minId) || minId <= 1) break
  before = String(minId)
}
const list = [...posts.values()].sort((a, b) => a.id - b.id)
writeFileSync(path.join(out, 'posts.json'), JSON.stringify(list, null, 1))
console.log(`${list.length} posts, ${list.reduce((n, p) => n + p.photos.length, 0)} photos, ${list.reduce((n, p) => n + p.videos.length, 0)} videos in preview`)

if (process.argv.includes('--media')) {
  let got = 0, skip = 0, fail = 0
  for (const post of list) {
    const dir = path.join(out, String(post.id))
    const media = [...post.photos.map((u, i) => [u, `p${i + 1}.jpg`]), ...post.videos.map((u, i) => [u, `v${i + 1}.mp4`])]
    if (!media.length) continue
    mkdirSync(dir, { recursive: true })
    for (const [url, name] of media) {
      const file = path.join(dir, name)
      if (existsSync(file)) { skip++; continue }
      try {
        const r = await fetch(url, { headers: agent })
        if (!r.ok) throw new Error(r.status)
        writeFileSync(file, Buffer.from(await r.arrayBuffer())); got++
      } catch (e) { fail++; console.warn(`failed ${post.id}/${name}: ${e.message}`) }
    }
  }
  console.log(`media: ${got} downloaded, ${skip} already there, ${fail} failed`)
}
