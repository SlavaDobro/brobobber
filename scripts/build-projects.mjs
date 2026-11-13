#!/usr/bin/env node
// Builds src/lib/site/projects.json from the imported old-site pages (.local/old-site/content.json)
// and the prepared photos (src/lib/site/photos.json). Run after import-old-site and prepare-photos.
import { readFileSync, writeFileSync } from 'node:fs'

const content = JSON.parse(readFileSync('.local/old-site/content.json', 'utf8'))
const photos = JSON.parse(readFileSync('src/lib/site/photos.json', 'utf8'))

// Editorial data per project: clean name, brand, style tag for filters, key specs, cover photo.
// Specs come from the old project pages; Scrambler, Sportster 883 and 48 had identical
// copy-pasted numbers there, so those three show the work list only.
const meta = {
  'v-rod': { cover: '05', name: 'Harley-Davidson V-Rod', brand: 'Harley-Davidson', style: 'maskl', year: null, specs: [['1130', 'см³', 'объём двигателя'], ['115', 'л. с.', 'мощность'], ['300', 'мм', 'заднее колесо']] },
  rocket: { cover: '08', name: 'Triumph Rocket 3R', brand: 'Triumph', style: 'maskl', specs: [['2458', 'см³', 'объём двигателя'], ['182', 'л. с.', 'мощность'], ['225', 'Н·м', 'крутящий момент']] },
  scrambler: { name: 'Harley-Davidson Scrambler', brand: 'Harley-Davidson', style: 'skrembler', specs: [] },
  yamahaxvs100: { name: 'Yamaha XVS 1100 Ripe Cherry', brand: 'Yamaha', style: null, specs: [['1063', 'см³', 'объём двигателя'], ['62', 'л. с.', 'мощность'], ['17', 'л', 'бак']] },
  sportster883: { name: 'Harley-Davidson Sportster 883', brand: 'Harley-Davidson', style: 'bobber', specs: [] },
  triumphboneville: { cover: '08', name: 'Triumph Bonneville Bobber Black', brand: 'Triumph', style: 'bobber', specs: [['1510', 'мм', 'база'], ['690', 'мм', 'высота по седлу'], ['12', 'л', 'бак']] },
  t100: { name: 'Triumph Bonneville T100 Bobber', brand: 'Triumph', style: 'bobber', specs: [['1500', 'мм', 'база'], ['740', 'мм', 'высота по седлу'], ['16', 'л', 'бак']] },
  hd114: { name: 'Harley-Davidson Heritage Classic 114', brand: 'Harley-Davidson', style: null, specs: [['1868', 'см³', 'объём двигателя'], ['93', 'л. с.', 'мощность'], ['155', 'Н·м', 'крутящий момент']] },
  suzukim109r: { name: 'Suzuki Boulevard M109R', brand: 'Suzuki', style: 'maskl', specs: [['1710', 'мм', 'колёсная база'], ['160', 'Н·м', 'крутящий момент'], ['300', 'мм', 'заднее колесо']] },
  bmvk100: { name: 'BMW K100', brand: 'BMW', style: 'kafe-reyser', specs: [['987', 'см³', 'объём двигателя'], ['90', 'л. с.', 'мощность'], ['810', 'мм', 'высота сиденья']] },
  '48nardogray': { cover: '03', name: 'Harley-Davidson 48 Nardo Gray', brand: 'Harley-Davidson', style: 'bobber', specs: [] },
  '1200roadster': { name: 'Harley-Davidson 1200 Roadster', brand: 'Harley-Davidson', style: null, specs: [['1202', 'см³', 'объём двигателя'], ['785', 'мм', 'высота по седлу'], ['250', 'кг', 'сухой вес']] },
  vmax: { cover: '03', name: 'Yamaha V-Max 1700 Black Edition', brand: 'Yamaha', style: 'maskl', specs: [['1679', 'см³', 'объём двигателя'], ['240', 'л. с.', 'после прошивки'], ['233', 'км/ч', 'без ограничителя']] },
}
// Display order on the site: strongest pictures first.
const order = ['v-rod', 'rocket', 'bmvk100', 'scrambler', 'vmax', 'sportster883', 'triumphboneville', 'yamahaxvs100', 'hd114', '48nardogray', '1200roadster', 't100', 'suzukim109r']
const slugs = { 'v-rod': 'harley-davidson-v-rod', rocket: 'triumph-rocket-3r', scrambler: 'harley-davidson-scrambler', yamahaxvs100: 'yamaha-xvs-1100', sportster883: 'harley-davidson-sportster-883', triumphboneville: 'triumph-bonneville-bobber', t100: 'triumph-bonneville-t100', hd114: 'harley-davidson-heritage-114', suzukim109r: 'suzuki-boulevard-m109r', bmvk100: 'bmw-k100', '48nardogray': 'harley-davidson-48-nardo-gray', '1200roadster': 'harley-davidson-1200-roadster', vmax: 'yamaha-v-max-1700' }

const pages = order
// Which image URLs are other projects' thumbnails: they repeat on almost every project page.
const where = {}
for (const p of pages) content[p].images.forEach((url, i) => (where[url] ||= []).push([p, String(i + 1).padStart(2, '0')]))

const tidy = s => s.replace(/\s+/g, ' ').replace(/^[•\-–]\s*/, '').trim().replace(/^./, c => c.toUpperCase())
const projects = pages.map(page => {
  const texts = content[page].texts
  const a = texts.findIndex(t => /т[юЮ]НИНГ/.test(t)), b = texts.findIndex(t => /ФОТОГРАФИИ/.test(t))
  const works = texts.slice(a + 1, b > a ? b : undefined).flatMap(t => t.split('\n')).map(tidy).filter(t => t.length > 2)
  const kept = new Map((photos[page] || []).map(p => [p.id, p]))
  // Own photos only appear on this page (or also once on the home grid).
  const own = content[page].images.map((url, i) => ({ url, id: String(i + 1).padStart(2, '0') }))
    .filter(({ url, id }) => kept.has(id) && where[url].length === 1)
    .map(({ id }) => ({ src: `/images/photos/${page}/${id}`, ...dims(kept.get(id)) }))
  // Only the project's own photos: thumbnails of other projects are never mixed in.
  const first = meta[page].cover ? own.findIndex(p => p.src.endsWith('/' + meta[page].cover)) : -1
  const gallery = first > 0 ? [own[first], ...own.filter((_, i) => i !== first)] : own
  return { slug: slugs[page], source: page, ...meta[page], works, gallery }
})
function dims(p) { return { w: p.w, h: p.h } }

writeFileSync('src/lib/site/projects.json', JSON.stringify(projects, null, 1) + '\n')
for (const p of projects) console.log(`${p.slug}: ${p.works.length} works, ${p.gallery.length} photos, cover ${p.gallery[0]?.src}`)
