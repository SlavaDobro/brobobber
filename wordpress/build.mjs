#!/usr/bin/env node
// Generates the parts of the WordPress theme and plugin that come from the Svelte site, so the two
// stay identical: component CSS, icons, fonts, the content seed and the media pack.
// Usage (from the repository root): node wordpress/build.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import postcss from 'postcss'

const root = process.cwd()
const theme = 'wordpress/brobobber'
const plugin = 'wordpress/brobobber-core'
const media = 'wordpress/dist/media'
const read = file => readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
const write = (file, text) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, text) }

/* ---------- CSS: every Svelte component gets a class prefix instead of a generated hash ---------- */
const components = [
  ['lib/site/Logo.svelte', 'lg'], ['lib/site/Header.svelte', 'hd'], ['lib/site/Footer.svelte', 'ft'],
  ['lib/site/Shutter.svelte', 'sh'], ['lib/site/HeroDoor.svelte', 'hr'], ['lib/site/PageHero.svelte', 'ph'],
  ['lib/site/ProjectCard.svelte', 'pc'], ['lib/site/ProjectRail.svelte', 'rl'], ['lib/site/ProjectTiles.svelte', 'pt'],
  ['lib/site/PhotoWall.svelte', 'pw'], ['lib/site/PhotoSlides.svelte', 'ps'], ['lib/site/PhotoCredit.svelte', 'cr'],
  ['lib/site/ServiceBike.svelte', 'sb'], ['lib/site/ServiceIndex.svelte', 'si'], ['lib/site/ProcessRoad.svelte', 'pr'],
  ['lib/site/Reviews.svelte', 'rv'], ['lib/site/VideoReel.svelte', 'vr'], ['lib/site/Faq.svelte', 'fq'],
  ['lib/site/Odometer.svelte', 'od'], ['lib/site/MapBlock.svelte', 'mp'], ['lib/site/RequestForm.svelte', 'rq'],
  ['routes/+page.svelte', 'hm'], ['routes/+error.svelte', 'er'], ['routes/kontakty/+page.svelte', 'kt'],
  ['routes/o-nas/+page.svelte', 'on'], ['routes/process/+page.svelte', 'pg'], ['routes/politika/+page.svelte', 'pl'],
  ['routes/proekty/+page.svelte', 'pa'], ['routes/proekty/[slug]/+page.svelte', 'pj'],
  ['routes/uslugi/+page.svelte', 'ua'], ['routes/uslugi/[slug]/+page.svelte', 'us'],
  ['routes/motocikly/+page.svelte', 'ma'], ['routes/motocikly/[slug]/+page.svelte', 'ms'],
]
const shared = new Set(['h1', 'h2', 'h3', 'h-display', 'wrap', 'btn', 'btn-signal', 'btn-line', 'link-brass', 'section', 'section-head',
  'lead', 'muted', 'justified', 'fill', 'tight', 'shelf', 'is-dragging', 'photo'])

function scopeSelector(selector, prefix) {
  const kept = []
  let s = selector.replace(/:global\(([^)]*)\)/g, (_, inner) => { kept.push(inner); return `\u0001${kept.length - 1}\u0001` })
  let own = false
  s = s.replace(/\.(-?[a-zA-Z_][\w-]*)/g, (match, name) => { if (shared.has(name)) return match; own = true; return `.${prefix}-${name}` })
  s = s.replace(/\u0001(\d+)\u0001/g, (_, i) => kept[+i])
  return own ? s : `.${prefix} ${s}`
}

function scopeCss(css, prefix) {
  const ast = postcss.parse(css)
  const frames = new Set()
  ast.walkAtRules(/keyframes$/, rule => { frames.add(rule.params); rule.params = `${prefix}-${rule.params}` })
  ast.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return
    rule.selectors = rule.selectors.map(s => scopeSelector(s, prefix))
  })
  ast.walkDecls(/^animation(-name)?$/, decl => {
    for (const name of frames) decl.value = decl.value.replace(new RegExp(`(^|\\s)${name}(?=\\s|$|,)`, 'g'), `$1${prefix}-${name}`)
  })
  return ast.toString()
}

const base = read('src/app.css')
  .replace(/@import[^;]+;\n/g, '')
  .replace('body:has(.dash)', 'body:has(.hd-dash)')
const reset = `@layer base {
  *, ::after, ::before, ::backdrop { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; }
  html { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; }
  h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
  a { color: inherit; text-decoration: inherit; }
  b, strong { font-weight: bolder; }
  small { font-size: 80%; }
  ol, ul, menu { list-style: none; }
  img, svg, video, canvas, audio, iframe, embed, object { display: block; vertical-align: middle; }
  img, video { max-width: 100%; height: auto; }
  button, input, select, optgroup, textarea { font: inherit; letter-spacing: inherit; color: inherit; border-radius: 0; background-color: transparent; opacity: 1; }
  textarea { resize: vertical; }
  ::placeholder { opacity: 1; color: color-mix(in oklab, currentcolor 50%, transparent); }
  summary { display: list-item; }
  [hidden]:where(:not([hidden='until-found'])) { display: none !important; }
}
`
let css = ''
for (const [file, prefix] of components) {
  const source = read(path.join('src', file))
  const style = source.match(/<style>([\s\S]*?)<\/style>/)
  if (style) css += `\n/* ${path.basename(path.dirname(file))}/${path.basename(file)} */\n${scopeCss(style[1], prefix).trim()}\n`
}

/* ---------- Fonts ---------- */
const fontCss = []
for (const [dir, file] of [['tektur', 'wdth.css'], ['golos-text', 'index.css']]) {
  const from = `node_modules/@fontsource-variable/${dir}`
  for (const block of read(`${from}/${file}`).split(/(?=\/\* )/)) {
    if (!/-(cyrillic|latin)-(wdth|wght)-normal/.test(block.split('\n')[0]) && !/ (cyrillic|latin)-/.test(block)) continue
    const url = block.match(/url\(\.\/files\/([^)]+)\)/)
    if (!url || !/-(cyrillic|latin|latin-ext|cyrillic-ext)-/.test(url[1])) continue
    mkdirSync(`${theme}/assets/fonts`, { recursive: true })
    copyFileSync(`${from}/files/${url[1]}`, `${theme}/assets/fonts/${url[1]}`)
    fontCss.push(block.replace(/url\(\.\/files\//, 'url(../fonts/').trim())
  }
}
write(`${theme}/assets/css/site.css`, `/* Generated by wordpress/build.mjs from the site's Svelte components. */\n${fontCss.join('\n')}\n${reset}${base}${css}`)

/* ---------- Icons ---------- */
const iconNames = ['phone', 'clock', 'map-pin', 'navigation', 'send', 'mail', 'menu', 'x', 'chevron-down', 'chevron-left', 'chevron-right', 'check', 'arrow-right', 'plus', 'play', 'wrench', 'layout-grid', 'graduation-cap', 'package-plus', 'truck']
const icons = {}
for (const name of iconNames) {
  const data = JSON.parse(read(`node_modules/@lucide/svelte/dist/icons/${name}.svelte`).match(/__iconData = (\{.*\});/)[1])
  icons[name] = data.node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('')
}
write(`${theme}/inc/icons-data.php`, `<?php\n// Generated by wordpress/build.mjs from the Lucide icon set (ISC licence).\ndefined('ABSPATH') || exit;\nreturn ${phpArray(icons)};\n`)
function phpArray(object) {
  return `array(\n${Object.entries(object).map(([k, v]) => `  '${k}' => '${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`).join('\n')}\n)`
}

/* ---------- Service bike picture ---------- */
mkdirSync(`${theme}/assets/images`, { recursive: true })
for (const f of ['right-site.webp', 'right-site-800.webp']) copyFileSync(`public/images/vrod/${f}`, `${theme}/assets/images/${f}`)

/* ---------- Content seed: data.js is loaded with SvelteKit's $app/paths replaced ---------- */
const temp = path.join(root, 'wordpress/dist/.seed-data.mjs')
mkdirSync(path.dirname(temp), { recursive: true })
const dataDir = pathToFileURL(path.join(root, 'src/lib/site/')).href
write(temp, read('src/lib/site/data.js')
  .replace("import { base } from '$app/paths'", "const base = ''")
  .replace(/import (\w+) from '\.\/([\w-]+\.json)'/g, (_, name, file) => `import ${name} from '${dataDir}${file}' with { type: 'json' }`))
const data = await import(pathToFileURL(temp).href)
rmSync(temp)
const videos = JSON.parse(read('src/lib/site/videos.json'))
const policy = JSON.parse(read('src/lib/site/policy.json'))
const images = {
  about: '/images/photos/home/24', philosophy: '/images/photos/home/26', about_hero: '/images/photos/home/11',
  process_hero: '/images/photos/home/16', services_hero: '/images/photos/home/16', projects_hero: '/images/photos/rocket/03',
  styles_hero: '/images/photos/vmax/04',
  workshop: ['/images/photos/home/16', '/images/photos/home/11', '/images/photos/48nardogray/04', '/images/photos/rocket/03'],
  showcase: [
    { slug: 'harley-davidson-v-rod', photo: '/images/photos/v-rod/01' }, { slug: 'harley-davidson-scrambler', photo: '/images/photos/scrambler/01' },
    { slug: 'yamaha-v-max-1700', photo: '/images/photos/vmax/04' }, { slug: 'harley-davidson-heritage-114', photo: '/images/photos/hd114/01' },
    { slug: 'harley-davidson-48-nardo-gray', photo: '/images/photos/48nardogray/07' },
  ],
  tiles: ['harley-davidson-v-rod', 'harley-davidson-scrambler', 'yamaha-v-max-1700', 'harley-davidson-heritage-114', 'bmw-k100', 'harley-davidson-sportster-883', 'triumph-rocket-3r', 'harley-davidson-48-nardo-gray'],
}

/* Stored photo path → file in the media pack. */
const files = new Map()
const asset = stem => {
  if (!stem) return ''
  const rel = stem.replace('/images/', '') + '.webp'
  const from = stem.startsWith('/images/photos/') ? `public${stem}-1600.webp` : `public${stem}.webp`
  if (!existsSync(from)) throw new Error(`missing photo ${from}`)
  files.set(rel, from)
  return rel
}
const clip = file => { const rel = file.replace(/^\//, ''); if (!existsSync(`public/${rel}`)) throw new Error(`missing ${rel}`); files.set(rel, `public/${rel}`); return rel }

const seed = {
  contacts: { ...data.contacts, hours_short: data.contacts.hoursShort, address_short: data.contacts.addressShort },
  process: data.process, faq: data.faq, reviews: data.reviews, advantages: data.advantages, policy,
  styles: data.styles.map(s => ({ slug: s.slug, name: s.name, lead: s.lead, traits: s.traits, image: asset(s.image), credit: s.credit ?? null })),
  services: data.services.map(s => ({ slug: s.slug, name: s.name, short: s.short, lead: s.lead, points: s.points, photo: asset(s.photo), spot: s.spot ?? null,
    projects: s.projects ?? [], video: s.video ?? '', gallery: (s.gallery ?? []).map(asset) })),
  projects: data.projects.map(p => ({ ...p, gallery: p.gallery.map(g => asset(g.src)) })),
  videos: videos.map(v => ({ id: v.id, title: v.title, duration: v.duration, post: v.post, src: clip(v.src), poster: clip(v.poster) })),
  images: { ...Object.fromEntries(['about', 'philosophy', 'about_hero', 'process_hero', 'services_hero', 'projects_hero', 'styles_hero'].map(k => [k, asset(images[k])])),
    workshop: images.workshop.map(asset), showcase: images.showcase.map(s => ({ slug: s.slug, photo: asset(s.photo) })), tiles: images.tiles },
}
seed.media = [...files.keys()].sort()
write(`${plugin}/data/seed.json`, JSON.stringify(seed))

rmSync(media, { recursive: true, force: true })
let bytes = 0
for (const [rel, from] of files) {
  mkdirSync(path.dirname(`${media}/${rel}`), { recursive: true })
  copyFileSync(from, `${media}/${rel}`)
  bytes += readFileSync(from).length
}
console.log(`css ${Math.round((css.length + base.length) / 1024)} KB, fonts ${fontCss.length}, icons ${iconNames.length}`)
console.log(`seed: ${seed.projects.length} projects, ${seed.services.length} services, ${seed.styles.length} styles, ${seed.videos.length} videos`)
console.log(`media pack: ${files.size} files, ${Math.round(bytes / 1048576)} MB`)
