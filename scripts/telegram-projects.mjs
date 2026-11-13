// Projects and photos from the client's Telegram channel (imported by scripts/import-telegram.mjs).
// prepareTelegramPhotos() converts post photos to WebP; mergeTelegram() adds new projects and
// extra photos to existing ones. Both are called from scripts/build-projects.mjs.
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const source = '.local/telegram'
const target = 'public/images/photos'

/** New projects told in channel posts. `posts`: first id has the write-up, all ids give photos. */
export const telegramProjects = [
  { slug: 'triumph-neo-cafe', name: 'Triumph Neo Cafe', brand: 'Triumph', style: 'kafe-reyser', posts: [576], year: 2026 },
  { slug: 'suzuki-dr-z400', name: 'Suzuki DR-Z400', brand: 'Suzuki', style: 'skrembler', posts: [580], year: 2026 },
  { slug: 'harley-davidson-fat-boy', name: 'Harley-Davidson Fat Boy 2021', brand: 'Harley-Davidson', style: null, posts: [513], year: 2026 },
  { slug: 'suzuki-boulevard-m50', name: 'Suzuki Boulevard M50', brand: 'Suzuki', style: 'bobber', posts: [480], year: 2026 },
  { slug: 'triumph-bobber-total-black', name: 'Triumph Bonneville Bobber Total Black', brand: 'Triumph', style: 'bobber', posts: [532], year: 2026 },
  { slug: 'indian-scout-bobber', name: 'Indian Scout Bobber', brand: 'Indian', style: 'bobber', posts: [488], year: 2026 },
  { slug: 'harley-davidson-sportster-48-2026', name: 'Harley-Davidson Sportster 48', brand: 'Harley-Davidson', style: 'bobber', posts: [470], year: 2026, cover: 1 },
  { slug: 'harley-davidson-sportster-883-2008', name: 'Harley-Davidson Sportster 883, 2008', brand: 'Harley-Davidson', style: 'bobber', posts: [505], year: 2026 },
  { slug: 'harley-davidson-sportster-1200-full-back', name: 'Harley-Davidson Sportster 1200 Full Back', brand: 'Harley-Davidson', style: null, posts: [453], year: 2026 },
  { slug: 'harley-davidson-sportster-1200-2019', name: 'Harley-Davidson Sportster 1200, 2019', brand: 'Harley-Davidson', style: null, posts: [464], year: 2026 },
]

/** Channel posts about bikes that are already on the site: their photos extend the galleries. */
export const extraPhotos = {
  'harley-davidson-v-rod': [111],
  // Post 248 (a sale) repeats the old-site Rocket photos; posts 28 and 32 show a different, black XVS.
  'triumph-rocket-3r': [17],
  'bmw-k100': [89],
  'yamaha-v-max-1700': [10],
  'triumph-bonneville-bobber': [13, 14, 139],
  'yamaha-xvs-1100': [40, 49],
  'harley-davidson-heritage-114': [114],
  'suzuki-boulevard-m109r': [179],
}

const posts = () => new Map(JSON.parse(readFileSync(path.join(source, 'posts.json'), 'utf8')).map(p => [p.id, p]))

/** Converts the photos of every listed post; returns { [postId]: [{ src, w, h }] }. */
export async function prepareTelegramPhotos() {
  const ids = [...telegramProjects.flatMap(p => p.posts), ...Object.values(extraPhotos).flat()]
  const result = {}
  for (const id of ids) {
    const dir = path.join(source, String(id))
    if (!existsSync(dir)) { console.warn(`telegram post ${id}: media not downloaded`); continue }
    const files = readdirSync(dir).filter(f => /^p\d+\.jpg$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
    const out = path.join(target, `tg-${id}`)
    mkdirSync(out, { recursive: true })
    result[id] = []
    for (const file of files) {
      const stem = file.replace('.jpg', '').replace('p', '').padStart(2, '0')
      const image = await loadImage(path.join(dir, file))
      for (const size of [1600, 800]) {
        const dest = path.join(out, `${stem}-${size}.webp`)
        if (existsSync(dest)) continue
        const scale = Math.min(1, size / Math.max(image.width, image.height))
        const canvas = createCanvas(Math.round(image.width * scale), Math.round(image.height * scale))
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        writeFileSync(dest, canvas.toBuffer('image/webp', 80))
      }
      result[id].push({ src: `/images/photos/tg-${id}/${stem}`, w: image.width, h: image.height })
    }
  }
  return result
}

// Lines that belong to the channel, not to the story of the bike.
const noise = /^(📞|BROBO|Обсуждаем|Каждый проект создается|Мы работаем практически|Изготовлен под заказ|Строим мотоциклы, которых|Для наш|Поздравим|Вам интересны|Если давно|💰|⚫|Год выпуска|Пробег|https?:|Fat Boy, Breakout|Поэтому, если вам кажется)/i
const clean = s => s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F000}-\u{1F2FF}]/gu, '').replace(/\s+/g, ' ').trim()

/** Splits a post into a title, story paragraphs and a list of works. */
export function parsePost(text) {
  const lines = text.split('\n').map(l => l.trim())
  const works = [], story = []
  // A short first line is the post's headline; a long one is already part of the story.
  for (const line of lines[0].length > 80 ? lines : lines.slice(1)) {
    if (!line || noise.test(line)) continue
    if (/^(—|–|-|▪️|•)\s*/.test(line) || line.includes('▪️')) {
      for (const part of line.split('▪️')) {
        const item = clean(part.replace(/^(—|–|-|•)\s*/, ''))
        if (item.length > 2 && !/^и ещё/.test(item)) works.push(item.replace(/^./, c => c.toUpperCase()))
      }
    } else if (!/:$/.test(line) || line.length > 60) {
      const paragraph = clean(line)
      if (paragraph.length > 25) story.push(paragraph)
    }
  }
  return { story, works }
}

/** Moves the photo at `index` to the front (the cover). @template T @param {T[]} list @param {number} index */
const coverFirst = (list, index) => index > 0 && list[index] ? [list[index], ...list.filter((_, i) => i !== index)] : list

/** Adds new projects (newest first, after the strongest old ones) and extra photos. */
export function mergeTelegram(projects, photosByPost) {
  const all = posts()
  for (const [slug, ids] of Object.entries(extraPhotos)) {
    const project = projects.find(p => p.slug === slug)
    if (project) project.gallery.push(...ids.flatMap(id => photosByPost[id] || []))
  }
  const fresh = telegramProjects.map(meta => {
    const post = all.get(meta.posts[0])
    const { story, works } = parsePost(post.text)
    return {
      slug: meta.slug, source: `telegram:${meta.posts[0]}`, name: meta.name, brand: meta.brand, style: meta.style, year: meta.year,
      specs: [], story, works, post: `https://t.me/BROBOBBERru/${meta.posts[0]}`,
      gallery: coverFirst(meta.posts.flatMap(id => photosByPost[id] || []), meta.cover ?? 0),
    }
  }).filter(p => p.gallery.length)
  return [...projects.slice(0, 2), ...fresh, ...projects.slice(2)]
}
