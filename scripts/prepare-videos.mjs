#!/usr/bin/env node
// Copies chosen Telegram videos to public/video/ with a poster frame (the post's video thumbnail)
// and writes src/lib/site/videos.json. Videos are used as-is (Telegram serves H.264 MP4).
// Usage: node scripts/prepare-videos.mjs
import { copyFileSync, mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from 'node:fs'
import { createCanvas, loadImage } from '@napi-rs/canvas'

// [post id, video index, caption]: picked by watching the channel's videos.
export const picks = [
  [444, 1, 'Сезон открыт: кастомы BROBOBBER на дорогах Москвы'],
  [513, 1, 'Harley-Davidson Fat Boy 2021 — новый проект'],
  [493, 1, 'Как рождается кастомное крыло: из листа металла'],
  [445, 1, 'Фирменная крышка BROBOBBER Custom Club'],
  [384, 1, 'Накладки на бак для Sportster 48'],
  [324, 1, 'Детали крупным планом'],
  [380, 1, 'Indian Scout — проект для клиента'],
  [559, 1, 'Triumph Bonneville Bobber: второй заход и складное пассажирское сиденье'],
  [568, 1, 'Осенняя прогулка, пока позволяет погода'],
]

const posts = new Map(JSON.parse(readFileSync('.local/telegram/posts.json', 'utf8')).map(p => [p.id, p]))
mkdirSync('public/video', { recursive: true })
const list = []
for (const [id, n, title] of picks) {
  const file = `.local/telegram/${id}/v${n}.mp4`
  if (!existsSync(file)) { console.warn(`skip ${id}: ${file} missing`); continue }
  const mb = statSync(file).size / 1e6
  if (mb > 25) { console.warn(`skip ${id}: ${mb.toFixed(1)} MB is too heavy`); continue }
  const name = `tg-${id}-${n}`
  copyFileSync(file, `public/video/${name}.mp4`)
  // Poster: Telegram's thumbnail of this video.
  const thumb = posts.get(id).thumbs[n - 1]
  let w = 720, h = 1280
  if (thumb) {
    const image = await loadImage(Buffer.from(await fetch(thumb).then(r => r.arrayBuffer())))
    w = image.width; h = image.height
    const canvas = createCanvas(w, h)
    canvas.getContext('2d').drawImage(image, 0, 0)
    writeFileSync(`public/video/${name}.webp`, canvas.toBuffer('image/webp', 80))
  }
  const duration = durationOf(readFileSync(file))
  list.push({ id: name, title, src: `/video/${name}.mp4`, poster: `/video/${name}.webp`, w, h, duration, post: `https://t.me/BROBOBBERru/${id}` })
  console.log(`${name}: ${mb.toFixed(1)} MB, ${w}x${h}, ${duration}`)
}
writeFileSync('src/lib/site/videos.json', JSON.stringify(list, null, 1) + '\n')

/** Reads the movie duration from the MP4 'mvhd' box, as m:ss. @param {Buffer} buffer */
function durationOf(buffer) {
  const at = buffer.indexOf('mvhd')
  if (at < 0) return ''
  const version = buffer[at + 4]
  const scale = buffer.readUInt32BE(at + (version ? 24 : 16))
  const length = version ? Number(buffer.readBigUInt64BE(at + 28)) : buffer.readUInt32BE(at + 20)
  const s = Math.round(length / scale)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
