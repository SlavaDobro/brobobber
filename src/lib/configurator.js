export const paints = [
  { id: 'graphite', name: 'Графит', description: 'Глубокий тёмный металлик', hex: '#3c4247', price: 0 },
  { id: 'petrol', name: 'Петроль', description: 'Холодный оттенок с характером', hex: '#247875', price: 35000 },
  { id: 'copper', name: 'Медь', description: 'Тёплый металл в студийном свете', hex: '#b8653c', price: 35000 },
  { id: 'pearl', name: 'Жемчуг', description: 'Светлая эмаль, тёмная механика', hex: '#d4d3ca', price: 40000 },
]

export const seats = [
  { id: 'black', name: 'Чёрная кожа', description: 'Классическая ромбовидная прострочка', hex: '#29292a', price: 0 },
  { id: 'cognac', name: 'Коньячная кожа', description: 'Тёплый акцент на тёмном силуэте', hex: '#9a5d34', price: 16000 },
]

export const exhausts = [
  { id: 'twin', name: 'Twin Black', description: 'Две длинные трубы. Лаконичная линия.', price: 0 },
  { id: 'short', name: 'Short Cut', description: 'Короткий выхлоп. Открытый задний диск.', price: 48000 },
]

export const views = [
  { name: 'Правый профиль', short: 'Справа', bearing: 90 },
  { name: 'Спереди, три четверти', short: 'Перед ¾', bearing: 45 },
  { name: 'Вид прямо спереди', short: 'Анфас', bearing: 0 },
  { name: 'Левый профиль', short: 'Слева', bearing: -90 },
  { name: 'Вид прямо сзади', short: 'Сзади', bearing: -180 },
  { name: 'Сзади, три четверти', short: 'Корма ¾', bearing: -225 },
]

export const defaults = { paint: 'graphite', seat: 'black', exhaust: 'twin' }
export const storageKey = 'brobobber-vrod-v1'

/** @param {unknown} value */
export function normalizeConfiguration(value) {
  const record = value && typeof value === 'object' ? value : {}
  return {
    paint: 'paint' in record && paints.some(item => item.id === record.paint) ? String(record.paint) : defaults.paint,
    seat: 'seat' in record && seats.some(item => item.id === record.seat) ? String(record.seat) : defaults.seat,
    exhaust: 'exhaust' in record && exhausts.some(item => item.id === record.exhaust) ? String(record.exhaust) : defaults.exhaust,
  }
}

export function readConfiguration() {
  const params = new URLSearchParams(window.location.search)
  if (['paint', 'seat', 'exhaust'].some(key => params.has(key))) {
    return normalizeConfiguration(Object.fromEntries(params))
  }
  try {
    return normalizeConfiguration(JSON.parse(localStorage.getItem(storageKey) || 'null'))
  } catch {
    return { ...defaults }
  }
}

/** @param {typeof defaults} configuration */
export function configurationUrl(configuration) {
  const url = new URL(window.location.href)
  for (const [key, value] of Object.entries(configuration)) url.searchParams.set(key, value)
  return url.href
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
