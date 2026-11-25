// Motorcycles for sale (client edits V1.0, page /v-nalichii).
// To update the page: change `active` to hide a sold bike, add a new object for a new one.
// `kind`: 'project' — a finished custom, ready to ride; 'donor' — a base for a future build.
// `post` is the Telegram post id with the full listing. Prices and status are as of `date`;
// these first entries come from the channel's October 2026 list and must be confirmed by Alexey.

/** @typedef {{ slug: string, name: string, kind: 'project' | 'donor', active: boolean, year: number, km: number,
 *  price: number, date: string, photos: string[], text: string, works: string[], post: number }} StockBike */

/** @type {StockBike[]} */
export const stock = [
  {
    slug: 'harley-davidson-heritage-114', name: 'Harley-Davidson Heritage Classic 114', kind: 'project', active: true,
    year: 2019, km: 12000, price: 1700000, date: '2026-08-31', post: 555,
    photos: ['/images/photos/stock/heritage-114-01', '/images/photos/stock/heritage-114-02'],
    text: 'Законченный кастом на 114-м моторе из коллекции нашего клиента: сел и поехал.',
    works: ['Колёсные диски', 'LED-оптика HD Fat Boy последнего поколения', 'Кастомный хвост', 'Сиденье с подогревом', 'Музыка'],
  },
  {
    slug: 'indian-scout-bobber', name: 'Indian Scout Bobber ABS', kind: 'project', active: true,
    year: 2021, km: 7000, price: 2000000, date: '2026-06-14', post: 488,
    photos: ['/images/photos/stock/indian-scout-01', '/images/photos/stock/indian-scout-02', '/images/photos/stock/indian-scout-03', '/images/photos/stock/indian-scout-04'],
    text: 'Низкий, лаконичный, Full Black без хрома. Обслужен и готов к сезону.',
    works: ['Сиденье и подрамник в стиле Triumph Bobber', 'Прямой руль, поворотники MotoGadget в руле', 'Прямоточный выхлоп', 'Кожа с тиснением: седло, ручки, подножки'],
  },
  {
    slug: 'triumph-bonneville-bobber', name: 'Triumph Bonneville Bobber Black', kind: 'project', active: true,
    year: 2019, km: 21000, price: 1800000, date: '2026-06-22', post: 500,
    photos: ['/images/photos/stock/triumph-bobber-01', '/images/photos/stock/triumph-bobber-02', '/images/photos/stock/triumph-bobber-03', '/images/photos/stock/triumph-bobber-04'],
    text: 'Проект 2025 года в исполнении Black Edition. Сезонное ТО пройдено, вложений не требует.',
    works: ['Передние поворотники Motogadget', 'Задние поворотники Rizoma со стоп-сигналом', 'Сезонное ТО'],
  },
  {
    slug: 'harley-davidson-sportster-1200', name: 'Harley-Davidson Sportster 1200', kind: 'project', active: true,
    year: 2019, km: 0, price: 1350000, date: '2026-09-28', post: 561,
    photos: ['/images/photos/stock/sportster-1200-01', '/images/photos/stock/sportster-1200-02', '/images/photos/stock/sportster-1200-03', '/images/photos/stock/sportster-1200-04'],
    text: 'Мотоцикл клиента, весной прошёл у нас доработки, полное ТО и детейлинг: состояние знаем лично.',
    works: ['Покраска бака, боковых крышек и накладок рамы', 'Руль, грипсы, белобокая резина', 'Поворотники по кругу, перемотка проводки', 'Полное ТО и детейлинг'],
  },
  {
    slug: 'yamaha-xv1900', name: 'Yamaha XV1900 (Raider)', kind: 'donor', active: true,
    year: 2009, km: 34000, price: 850000, date: '2026-08-20', post: 537,
    photos: ['/images/photos/stock/yamaha-xv1900-01', '/images/photos/stock/yamaha-xv1900-02', '/images/photos/stock/yamaha-xv1900-03'],
    text: 'Стоковый мотоцикл: можно оставить в оригинале или взять донором под кастом. При постройке у нас — хорошая цена на работы.',
    works: [],
  },
]
