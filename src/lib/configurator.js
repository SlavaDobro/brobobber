// Option catalogue for the V-Rod configurator.
// `hex: null` means "as photographed": the base photograph is shown unchanged.
// `layer` names a registered image layer (see bike-assets.js); materials are recoloured from masks.

export const paints = [
  { id: 'petrol', name: 'Петроль', description: 'Исходный цвет проекта. Глубокий бирюзовый металлик.', hex: null, swatch: '#1f7a78', finish: 'metallic', price: 0 },
  { id: 'graphite', name: 'Графит', description: 'Тёмный металлик с холодным отливом.', hex: '#41474c', swatch: '#41474c', finish: 'metallic', price: 35000 },
  { id: 'copper', name: 'Медь', description: 'Тёплый металл, оживает в студийном свете.', hex: '#a85b34', swatch: '#a85b34', finish: 'metallic', price: 35000 },
  { id: 'oxide', name: 'Оксид', description: 'Тёмно-красная эмаль с глубоким глянцем.', hex: '#7c1f1d', swatch: '#7c1f1d', finish: 'gloss', price: 38000 },
  { id: 'pearl', name: 'Жемчуг', description: 'Светлая эмаль на фоне тёмной механики.', hex: '#d6d4ca', swatch: '#d6d4ca', finish: 'gloss', price: 40000 },
  { id: 'olive', name: 'Олива мат', description: 'Военная олива без блеска.', hex: '#56603f', swatch: '#56603f', finish: 'matte', price: 45000 },
  { id: 'stealth', name: 'Чёрный мат', description: 'Матовый чёрный, тёмный силуэт целиком.', hex: '#26282a', swatch: '#26282a', finish: 'matte', price: 42000 },
]

export const leathers = [
  { id: 'cognac', name: 'Коньяк', description: 'Исходная кожа. Ромбовидная прострочка.', hex: null, swatch: '#9a5d34', price: 0 },
  { id: 'black', name: 'Чёрная', description: 'Классика, которая подходит к любому цвету.', hex: '#2a2a2b', swatch: '#2a2a2b', price: 12000 },
  { id: 'oxblood', name: 'Бордо', description: 'Тёмно-винная кожа с тёплым отливом.', hex: '#5e1d22', swatch: '#5e1d22', price: 18000 },
  { id: 'tobacco', name: 'Табак', description: 'Глубокий коричневый, винтажный характер.', hex: '#5b3d24', swatch: '#5b3d24', price: 16000 },
]

export const wheels = [
  { id: 'gloss-black', name: 'Чёрный глянец', description: 'Исходные диски. Глубокий чёрный лак.', hex: null, swatch: '#151617', finish: 'gloss', price: 0 },
  { id: 'graphite', name: 'Графит сатин', description: 'Полуматовый графит, спокойный и технологичный.', hex: '#55595d', swatch: '#55595d', finish: 'satin', price: 26000 },
  { id: 'bronze', name: 'Бронза', description: 'Тёплая бронза, контраст с тёмной механикой.', hex: '#8f6a37', swatch: '#8f6a37', finish: 'satin', price: 38000 },
  { id: 'polished', name: 'Полированный', description: 'Зеркальный алюминий с бликами.', hex: '#c4c7c9', swatch: '#c4c7c9', finish: 'polished', price: 44000 },
]

export const rims = [
  { id: 'blade', name: 'Blade', description: 'Исходные диски: семь овальных окон.', layer: null, price: 0 },
  { id: 'disc', name: 'Монолит', description: 'Литой диск без окон — как у первых V-Rod 2002 года.', layer: 'wheels-disc', price: 118000 },
  { id: 'twist', name: 'Twist', description: 'Пять тонких спиц, закрученных как лопатки турбины.', layer: 'wheels-twist', price: 112000 },
  { id: 'split', name: 'Split', description: 'Десять тонких спиц парами, спортивная ковка.', layer: 'wheels-split', price: 104000 },
]

export const exhausts = [
  { id: 'short', name: 'Short Cut', description: 'Исходный выхлоп. Короткие трубы из нержавеющей стали.', layer: null, price: 0 },
  { id: 'drag', name: 'Drag Black', description: 'Длинные прямые трубы в чёрной керамике, косой срез.', layer: 'exhaust-drag', price: 89000 },
  { id: 'shotgun', name: 'Shotgun Chrome', description: 'Длинные хромированные трубы с прямым срезом.', layer: 'exhaust-shotgun', price: 96000 },
]

export const accessories = [
  { id: 'cowl', name: 'Карбоновый козырёк фары', description: 'Компактный обтекатель из карбона над фарой.', layer: 'cowl', price: 24000 },
]

export const categories = [
  { id: 'paint', name: 'Кузов', title: 'Цвет кузова', hint: 'Бак, боковины и оба крыла.' },
  { id: 'leather', name: 'Сиденье', title: 'Кожа сиденья', hint: 'Ромбовидная прострочка остаётся.' },
  { id: 'wheels', name: 'Колёса', title: 'Диски', hint: 'Сначала форма, потом цвет.' },
  { id: 'exhaust', name: 'Выхлоп', title: 'Выхлопная система', hint: 'Трубы справа, слева их не видно.' },
  { id: 'accessories', name: 'Детали', title: 'Аксессуары', hint: 'Можно добавить несколько.' },
]

// bearing: where the camera stands around the motorcycle, 0° = straight ahead of the front wheel.
export const views = [
  { id: 'right', name: 'Правый профиль', short: 'Справа', bearing: 90 },
  { id: 'front-quarter', name: 'Спереди справа', short: 'Перед ¾', bearing: 45 },
  { id: 'front', name: 'Спереди', short: 'Анфас', bearing: 0 },
  { id: 'left', name: 'Левый профиль', short: 'Слева', bearing: 270 },
  { id: 'rear', name: 'Сзади', short: 'Корма', bearing: 180 },
  { id: 'rear-quarter', name: 'Сзади справа', short: 'Корма ¾', bearing: 135 },
]

// Backdrops behind the motorcycle. focusY keeps the floor line of the photo under the tyres.
export const environments = [
  { id: 'studio', name: 'Студия', image: null, dark: false, focusY: .5 },
  { id: 'workshop', name: 'Мастерская', image: '/images/env/workshop.webp', dark: true, focusY: .7 },
  { id: 'night', name: 'Ночь', image: '/images/env/night.webp', dark: true, focusY: .7 },
]

export const basePrice = 149000
/** @typedef {{ paint: string, leather: string, rims: string, wheels: string, exhaust: string, accessories: string[] }} Configuration */
/** @type {Configuration} */
export const defaults = { paint: 'petrol', leather: 'cognac', rims: 'blade', wheels: 'gloss-black', exhaust: 'short', accessories: [] }
export const storageKey = 'brobobber-vrod-v3'

/** @template {{ id: string }} T @param {T[]} list @param {unknown} id @returns {T} */
export const pick = (list, id) => list.find(item => item.id === id) || list[0]

/** @param {unknown} value @returns {Configuration} */
export function normalizeConfiguration(value) {
  const record = /** @type {Record<string, unknown>} */ (value && typeof value === 'object' ? value : {})
  const valid = (/** @type {{ id: string }[]} */ list, /** @type {string} */ key) =>
    list.some(item => item.id === record[key]) ? String(record[key]) : /** @type {any} */ (defaults)[key]
  const extras = Array.isArray(record.accessories) ? record.accessories
    : typeof record.accessories === 'string' ? record.accessories.split(',') : []
  return {
    paint: valid(paints, 'paint'),
    leather: valid(leathers, 'leather'),
    rims: valid(rims, 'rims'),
    wheels: valid(wheels, 'wheels'),
    exhaust: valid(exhausts, 'exhaust'),
    accessories: accessories.filter(item => extras.includes(item.id)).map(item => item.id),
  }
}

export function readConfiguration() {
  const params = new URLSearchParams(window.location.search)
  if (['paint', 'leather', 'rims', 'wheels', 'exhaust', 'accessories'].some(key => params.has(key))) {
    return normalizeConfiguration(Object.fromEntries(params))
  }
  try {
    return normalizeConfiguration(JSON.parse(localStorage.getItem(storageKey) || 'null'))
  } catch {
    return normalizeConfiguration(null)
  }
}

/** @param {Configuration} configuration */
export function configurationUrl(configuration) {
  const url = new URL(window.location.href)
  for (const [key, value] of Object.entries(configuration)) {
    const text = Array.isArray(value) ? value.join(',') : value
    if (text) url.searchParams.set(key, text)
    else url.searchParams.delete(key)
  }
  return url.href
}

/** Selected items with their prices, in category order. @param {Configuration} configuration */
export function lineItems(configuration) {
  return [
    { category: 'Цвет кузова', item: pick(paints, configuration.paint) },
    { category: 'Сиденье', item: pick(leathers, configuration.leather) },
    { category: 'Диски', item: pick(rims, configuration.rims) },
    { category: 'Цвет дисков', item: pick(wheels, configuration.wheels) },
    { category: 'Выхлоп', item: pick(exhausts, configuration.exhaust) },
    ...accessories.filter(item => configuration.accessories.includes(item.id)).map(item => ({ category: 'Аксессуар', item })),
  ]
}

/** @param {Configuration} configuration */
export function totalPrice(configuration) {
  return basePrice + lineItems(configuration).reduce((sum, line) => sum + line.item.price, 0)
}

/** Layers to draw, in a fixed order so results never depend on click order. @param {Configuration} configuration */
export function selectedLayers(configuration) {
  // Wheels first: the exhaust passes in front of the rear wheel and must stay on top.
  const layers = []
  const rim = pick(rims, configuration.rims)
  if (rim.layer) layers.push(rim.layer)
  const exhaust = pick(exhausts, configuration.exhaust)
  if (exhaust.layer) layers.push(exhaust.layer)
  for (const item of accessories) if (configuration.accessories.includes(item.id)) layers.push(item.layer)
  return layers
}

/** Stable work-order number: the same build always gets the same number. @param {Configuration} configuration */
export function buildNumber(configuration) {
  const text = JSON.stringify([configuration.paint, configuration.leather, configuration.rims, configuration.wheels, configuration.exhaust, [...configuration.accessories].sort()])
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  return 'VR-' + String((hash >>> 0) % 9000 + 1000)
}

/** @param {number} value */
export function money(value) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)
}

/** @param {string} filename @param {Blob} blob */
export function downloadFile(filename, blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
