// Site content. Texts come from the client's old site (brobobber.moscow) and Telegram channel;
// where the old site had no text, the copy is a plain description of the service, without promises.
import { base } from '$app/paths'
import projectsData from './projects.json'
import photoWidths from './photo-widths.json'

export const contacts = {
  phones: [
    { name: 'Алексей', phone: '+7 925 485-26-61', href: 'tel:+79254852661', telegram: 'OguRechiks' },
  ],
  email: 'brobobber@mail.ru',
  channel: { name: 'Telegram-канал', href: 'https://t.me/BROBOBBERru', handle: '@BROBOBBERru' },
  address: 'Москва, поселение Филимонковское, посёлок Марьино, Кнутовская улица, 14',
  addressShort: 'Москва, Марьино, Кнутовская, 14',
  postal: '108815',
  // The client has not given the working hours yet: replace both lines when they are known.
  hours: 'Часы работы уточняйте по телефону',
  hoursShort: 'Часы работы — по телефону',
}
export const mapLinks = {
  yandex: 'https://yandex.ru/maps/?text=' + encodeURIComponent(`${contacts.postal}, ${contacts.address}`),
  google: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(contacts.address),
  widget: 'https://yandex.ru/map-widget/v1/?z=15&text=' + encodeURIComponent(`${contacts.postal}, ${contacts.address}`),
}

export const nav = [
  { href: '/o-nas', label: 'О нас' },
  { href: '/uslugi', label: 'Услуги', menu: 'services' },
  { href: '/motocikly', label: 'Мотоциклы', menu: 'styles' },
  { href: '/proekty', label: 'Наши проекты' },
  { href: '/process', label: 'Процесс' },
  { href: '/kontakty', label: 'Контакты' },
]

/** @typedef {{ slug: string, name: string, short: string, lead: string, points: string[], photo: string, spot?: [number, number], projects?: string[], video?: string, gallery?: string[] }} Service */
/** Hotspot positions `spot` are percentages on the V-Rod side photo (public/images/vrod/right.png). */
/** @type {Service[]} */
export const services = [
  { slug: 'kastomizaciya', name: 'Кастомизация', short: 'Проект мотоцикла под ваш характер: от эскиза до готового байка.',
    lead: 'Собираем мотоцикл под конкретного владельца: меняем посадку, обвес, свет, выхлоп и покраску так, чтобы байк выглядел как одно целое.',
    points: ['Консультации и дизайн-проекты: выбор концепции и рекомендации по доработке', 'Замена элементов кузова, создание уникального обвеса', 'Аэрография и графика: рисунки и логотипы на поверхности мотоцикла'],
    photo: '/images/photos/v-rod/03', spot: [52, 27], projects: ['harley-davidson-v-rod', 'bmw-k100', 'harley-davidson-scrambler'] },
  { slug: 'tyuning', name: 'Тюнинг мотоциклов', short: 'Кастомные детали, покраска, тормоза и звук.',
    lead: 'Делаем и ставим кастомные детали, готовим и красим их, дорабатываем тормоза и звук выхлопа.',
    points: ['Изготовление и установка кастомных деталей: выхлопные системы, сиденья, ручки', 'Подготовка деталей: снятие хрома химическим способом, пескоструйная обработка, аквабластинг', 'Покраска деталей разными типами красок: порошковая, акриловая, термостойкая', 'Тюнинг тормозной системы', 'Звуковая модернизация: выхлопные системы и глушители'],
    photo: '/images/photos/rocket/04', spot: [38, 67], video: 'tg-493-1', projects: ['triumph-rocket-3r', 'yamaha-v-max-1700', 'harley-davidson-sportster-883'] },
  { slug: 'obsluzhivanie', name: 'Обслуживание и ремонт', short: 'ТО, диагностика, ремонт двигателя и вилки.',
    lead: 'Плановое обслуживание и ремонт любой сложности: от замены лампочки до капитального ремонта двигателя.',
    points: ['Плановое техническое обслуживание', 'Полная диагностика мотоцикла', 'Капитальный ремонт двигателя', 'Переборка вилки', 'Ультразвуковая чистка топливной системы', 'Шиномонтаж'],
    photo: '/images/photos/home/16', spot: [51, 50] },
  { slug: 'proshivka-ebu', name: 'Прошивка ЭБУ двигателя', short: 'Настройка двигателя под мощность и отклик.',
    lead: 'Настраиваем двигатель под установленные детали: выхлоп, фильтр и карту впрыска, чтобы мотор работал ровно и отдавал мощность.',
    points: ['Настройка двигателя для улучшения мощности и эффективности', 'Установка спортивных компонентов: воздушные фильтры, карты управления'],
    photo: '/images/site/service-ecu', spot: [66, 52], projects: ['yamaha-v-max-1700'] },
  { slug: 'sideniya', name: 'Создание и модификация сидений', short: 'Индивидуальный пошив под посадку и стиль.',
    lead: 'Шьём сиденья под рост, посадку и стиль мотоцикла, в том числе пассажирские и складные.',
    points: ['Индивидуальная форма сиденья', 'Перетяжка премиальными материалами', 'Пассажирские и складные варианты', 'Подогрев сиденья'],
    photo: '/images/photos/tg-350/01', spot: [28, 34], video: 'tg-559-1', gallery: ['/images/photos/tg-350/02', '/images/photos/tg-350/03', '/images/photos/tg-541/01', '/images/photos/tg-591/02'], projects: ['harley-davidson-v-rod', 'triumph-rocket-3r'] },
  { slug: 'nakladki-na-bak', name: 'Накладки на бак Harley-Davidson', short: 'Металлические накладки с гравировкой.',
    lead: 'Делаем накладки на бак Harley-Davidson: форма, металл и гравировка под ваш мотоцикл.',
    points: ['Изготовление по форме бака', 'Гравировка надписи или рисунка', 'Установка без доработки бака'],
    photo: '/images/photos/tg-384/01', spot: [59, 30], video: 'tg-384-1', gallery: ['/images/photos/tg-384/02', '/images/photos/tg-384/03', '/images/photos/tg-384/04', '/images/photos/home/26'] },
  { slug: 'elektronika', name: 'Электроника и освещение', short: 'LED-оптика, сигнализация, проводка.',
    lead: 'Ставим современный свет и электронику и аккуратно переделываем проводку под новые детали.',
    points: ['Установка LED-оптики и светового оборудования', 'Модернизация электроники: сигнализация, GPS-навигация', 'Приборные панели и поворотники', 'Прокладка и обновление проводки'],
    photo: '/images/photos/bmvk100/04', spot: [75, 28], projects: ['bmw-k100', 'harley-davidson-48-nardo-gray'] },
  { slug: 'nadpisi-na-shinah', name: 'Нанесение букв на шины', short: 'Надписи на боковине шины вашего мотоцикла.',
    lead: 'Наносим надписи на боковину шины: шрифт, цвет и расположение согласуем заранее.',
    points: ['Подбор шрифта и цвета', 'Нанесение на установленную шину', 'Подходит для дорожных и кастомных шин'],
    photo: '/images/site/service-shiny', spot: [8, 62] },
  { slug: 'deteyling', name: 'Детейлинг', short: 'Чистка, полировка, удаление мелких царапин.',
    lead: 'Возвращаем мотоциклу блеск: чистим, полируем и убираем мелкие царапины.',
    points: ['Мойка и чистка труднодоступных мест', 'Полировка лакокрасочного покрытия', 'Удаление мелких царапин'],
    photo: '/images/site/service-deteyling', spot: [83, 43] },
  { slug: 'konsultacii', name: 'Консультации по стилю', short: 'Помощь с концепцией, цветом и деталями.',
    lead: 'Поможем определиться со стилем, цветом и деталями, даже если мотоцикла ещё нет.',
    points: ['Помощь в выборе аксессуаров, цвета и стиля', 'Разработка концепции стиля для личного мотоцикла', 'Подбор мотоцикла-донора под задуманный проект'],
    photo: '/images/photos/home/25', spot: [63, 17] },
  { slug: 'kursy', name: 'Технические курсы и мастер-классы', short: 'Обслуживание и тюнинг своими руками.',
    lead: 'Курсы по обслуживанию и тюнингу мотоциклов для тех, кто хочет разбираться в своём байке.',
    points: ['Обслуживание мотоцикла своими руками', 'Основы тюнинга', 'Занятия в мастерской на реальной технике'],
    photo: '/images/site/service-kursy' },
  { slug: 'dopolnitelnye', name: 'Дополнительные услуги', short: 'Возврат к стоку, подбор мотоцикла и другое.',
    lead: 'Работы, которые не попадают в другие разделы. Например, возвращаем мотоцикл к оригинальному состоянию с заменой тюнинговых деталей.',
    points: ['Возврат мотоцикла к оригинальному состоянию', 'Сопровождение покупки и подбор мотоцикла', 'Готовые перестроенные мотоциклы на продажу'],
    photo: '/images/photos/home/11' },
  { slug: 'motoevakuator', name: 'Мотоэвакуатор', short: 'Перевозка мотоцикла по Москве и в другие города.',
    lead: 'Перевезём мотоцикл после поломки, покупки или в мастерскую. Грузим и крепим так, чтобы байк доехал без царапин.',
    points: ['Помощь при поломке в дороге', 'Доставка в мастерскую и обратно', 'Перевозка после покупки', 'Перевозка в другой город'],
    photo: '/images/photos/tg-585/02', gallery: ['/images/photos/tg-585/03', '/images/photos/tg-585/04', '/images/photos/tg-585/01', '/images/photos/tg-585/05'] },
]

// The workshop has no projects of its own in these four styles: open-licence photos from
// Wikimedia Commons show the style, each with its author and licence on the page.
const styleCredits = {
  chopper: { author: 'Chris Phutully', page: 'https://commons.wikimedia.org/wiki/File:1941_Harley-Davidson_Knucklehead_%22Chopper%22_Custom_(2013_Racv_Motorclassica)_(10491974294).jpg', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' },
  begger: { author: 'Lightburst', page: 'https://commons.wikimedia.org/wiki/File:2019_Harley-Davidson_CVO_Road_Glide_in_Red_Pepper_%26_Magnetic_Grey_With_Black_Hole.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  klab: { author: 'Maggi1109', page: 'https://commons.wikimedia.org/wiki/File:Harley_Davidson_FXRS.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  chikano: { author: 'CALChux', page: 'https://commons.wikimedia.org/wiki/File:2004_Harley-Davidson_Road_King_%E2%80%9CLa_Vida_Loca%E2%80%9D_(54381384690).jpg', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' },
}

/** @typedef {{ slug: string, name: string, lead: string, traits: [string, string][], image: string, credit?: { author: string, page: string, license: string, licenseUrl: string } }} Style */
/** @type {Style[]} */
export const styles = [
  { slug: 'bobber', name: 'Боббер', lead: 'Всё лишнее срезано: короткие крылья, одиночное седло, толстые шины и низкая посадка.',
    traits: [['Посадка', 'Низкая, ноги впереди или по центру'], ['Рама', 'Стоковая или с хардтейлом'], ['Крылья', 'Укороченные, заднее над самой шиной'], ['Детали', 'Одиночное седло, минимум хрома']], image: '/images/photos/48nardogray/03' },
  { slug: 'chopper', name: 'Чоппер', lead: 'Длинная вилка с большим вылетом, высокий руль и узкое переднее колесо.',
    traits: [['Посадка', 'Откинутая, руки высоко'], ['Рама', 'Удлинённая, с увеличенным углом наклона'], ['Крылья', 'Минимальные или без переднего'], ['Детали', 'Ape-hanger руль, спинка, бак «капля»']], image: '/images/photos/styles/chopper', credit: styleCredits.chopper },
  { slug: 'kafe-reyser', name: 'Кафе-рейсер', lead: 'Длинный бак, короткое горбатое седло и низкий руль: посадка как на гоночном мотоцикле 60-х.',
    traits: [['Посадка', 'Спортивная, с наклоном вперёд'], ['Рама', 'Укороченный подрамник под одиночное седло'], ['Крылья', 'Короткие'], ['Детали', 'Клипоны, задние подножки, обтекатель фары']], image: '/images/photos/tg-89/02' },
  { slug: 'skrembler', name: 'Скрэмблер', lead: 'Городской мотоцикл, готовый к грунтовке: высокий выхлоп, внедорожные шины и широкий руль.',
    traits: [['Посадка', 'Прямая, высокая'], ['Рама', 'С защитой и увеличенным клиренсом'], ['Крылья', 'Короткие, приподнятые'], ['Детали', 'Шины с шипами, плоское седло, сетка на фаре']], image: '/images/photos/scrambler/01' },
  { slug: 'begger', name: 'Бэггер', lead: 'Большой туринговый мотоцикл с кофрами, опущенными почти до земли, и обтекателем.',
    traits: [['Посадка', 'Комфортная туринговая'], ['Рама', 'Заниженная задняя часть'], ['Крылья', 'Длинные, переднее под колесо 21–23"'], ['Детали', 'Кофры, обтекатель «батвинг», акустика']], image: '/images/photos/styles/begger', credit: styleCredits.begger },
  { slug: 'maskl', name: 'Маскл', lead: 'Мощный круизер с широченной задней шиной и агрессивными формами. Сюда относятся V-Rod, V-Max, M109R.',
    traits: [['Посадка', 'Низкая, длинная база'], ['Рама', 'Расширенный маятник под колесо 240–300 мм'], ['Крылья', 'Короткие, по форме колеса'], ['Детали', 'Драг-руль, мощный выхлоп, крупные радиаторы']], image: '/images/photos/vmax/04' },
  { slug: 'klab-stayl', name: 'Клаб-стайл', lead: 'Стиль американских мото-клубов: обтекатель фары, высокий T-руль и длинноходная подвеска.',
    traits: [['Посадка', 'Прямая, агрессивная'], ['Рама', 'Стоковая, подвеска с увеличенным ходом'], ['Крылья', 'Минимальные'], ['Детали', 'Обтекатель с тёмным визором, T-бар руль']], image: '/images/photos/styles/klab-stayl', credit: styleCredits.klab },
  { slug: 'chikano', name: 'Чикано', lead: 'Низкий и длинный мотоцикл с глубокой «конфетной» покраской, золотым пинстрайпом и белыми боковинами шин.',
    traits: [['Посадка', 'Низкая, вальяжная'], ['Рама', 'Заниженная'], ['Крылья', 'Широкие, длинные'], ['Детали', 'Candy-покраска, гравировка, хромированные спицы']], image: '/images/photos/styles/chikano', credit: styleCredits.chikano },
]

export const process = [
  { title: 'Первичная консультация', text: 'Поделитесь своими представлениями о проекте, стиле и предпочтениях.' },
  { title: 'Обсуждение деталей', text: 'Возможно, понадобится привезти мотоцикл, чтобы мы оценили его состояние и обсудили возможные доработки.' },
  { title: 'Разработка концепции', text: 'По вашему брифу готовим предварительную концепцию: эскизы и предложения по дизайну.' },
  { title: 'Согласование и техзадание', text: 'После утверждения концепции составляем подробное техзадание со сметой и сроками.' },
  { title: 'Договор', text: 'Перед началом работ подписываем договор со всеми деталями проекта, стоимостью и условиями.' },
  { title: 'Кастомизация', text: 'Держим вас в курсе всех этапов работы и при необходимости согласовываем изменения.' },
  { title: 'Проверка и передача', text: 'Вы осматриваете и тестируете готовый мотоцикл, после чего мы передаём или доставляем его.' },
  { title: 'Обслуживание после', text: 'После передачи остаются гарантия и поддержка, а также обслуживание и новые доработки.' },
]

export const faq = [
  { q: 'Сколько времени занимает кастомизация?', a: 'Когда запчасти на месте и техзадание составлено, комплексная кастомизация занимает от 1 до 2 месяцев.' },
  { q: 'Сколько стоит кастомизация?', a: 'Для расчёта нам нужны марка и модель мотоцикла, перечень и бренды тюнинга, фото желаемого результата и фото вашего мотоцикла. Если не знаете, что ответить, напишите нам: поможем разобраться.' },
  { q: 'Можно ли привезти свой мотоцикл?', a: 'Да. И неважно, есть ли у вас мотоцикл или вы только собираетесь его купить: поможем определиться с выбором и воплотим идею.' },
  { q: 'Есть ли гарантия?', a: 'На все технические работы и запчасти, купленные в нашей мастерской, даём гарантию один год.' },
  { q: 'Можно ли менять проект по ходу работы?', a: 'Любые изменения можно внести на этапе согласования технического задания.' },
  { q: 'Работаете ли вы только с определёнными марками?', a: 'Нет. Среди наших проектов Harley-Davidson, Triumph, Yamaha, Suzuki, BMW и другие.' },
  { q: 'Как оставить заявку?', a: 'Позвоните или напишите в Telegram, отправьте письмо или заполните форму на сайте — мы свяжемся с вами.' },
]

export const reviews = [
  { author: 'Александр Кадетов', text: 'Обратился к парням с запросом на кастом HD Sportster с сопровождением от подбора до готового результата «под ключ». По каждому варианту дали своё мнение с фото дефектов, в итоге выбрали оптимальный по цене и качеству. С удовольствием откатал сезон, а перед новым привёз на ТО: установили дуги и поменяли выхлоп. Ребята всегда на связи.' },
  { author: 'Андрей Ж.', text: 'Обратился с проблемами на своём BMW K75RT — в течение недели исправили немало косяков, которые не исправить без опыта и оборудования. Рекомендую тем, кто хочет быть уверенным в своём мотоцикле.' },
  { author: 'BooZY', text: 'Посоветовал знакомый. Договорились сразу, подводных камней не было. По деньгам всё прозрачно, лишних расходов не добавилось, по срокам сделали как договаривались. Проектом очень доволен.' },
  { author: 'Артём Егиазарян', text: 'Мотоцикл — это не просто средство передвижения, ты должен быть уверен в нём на 100%. Ребята делают не только качественный тюнинг, но и надёжное обслуживание.' },
  { author: 'maks p.', text: 'Обслуживаюсь у ребят уже несколько лет, всегда на высшем уровне. Внимание к деталям и ответственный подход — от замены лампочки до постройки кастома.' },
  { author: 'Aren J.', text: 'Отличный сервис, тюнинг бешеный. Профессионалы своего дела, особая благодарность Алексею: быстро решили мой вопрос, всегда на связи.' },
  { author: 'Денис Г.', text: 'Отличный сервис и душевные мастера. Обсудили фронт работ и без лишних слов всё сделали раньше оговорённых сроков.' },
]

export const advantages = [
  { title: 'Свой дизайн для каждого', text: 'Каждый проект разрабатываем с нуля, чтобы мотоцикл отражал характер владельца.' },
  { title: 'Любые марки', text: 'Harley-Davidson, Triumph, Yamaha, Suzuki, BMW и другие.' },
  { title: '3D-моделирование и ЧПУ', text: 'Детали проектируем в 3D и вытачиваем на станках с ЧПУ — точно и аккуратно.' },
  { title: 'Год гарантии', text: 'На технические работы и запчасти, купленные в мастерской.' },
]

/** @typedef {typeof projectsData[number]} Project */
export const projects = projectsData

/** @param {string} slug */
export const projectBySlug = slug => projects.find(p => p.slug === slug)
/** @param {string} slug */
export const serviceBySlug = slug => services.find(s => s.slug === slug)
/** @param {string} slug */
export const styleBySlug = slug => styles.find(s => s.slug === slug)

/** Russian plural: plural(24, ['работа', 'работы', 'работ']) → 'работы'. @param {number} n @param {[string, string, string]} forms */
export const plural = (n, forms) => {
  const a = Math.abs(n) % 100, b = a % 10
  return forms[a > 10 && a < 20 ? 2 : b === 1 ? 0 : b >= 2 && b <= 4 ? 1 : 2]
}

/** Responsive photo sources for a stored photo path (without size suffix), inside the site's base folder. @param {string} stem */
export const photoSrc = stem => {
  const p = base + stem
  if (!stem.startsWith('/images/photos/')) return { src: `${p}.webp`, srcset: `${p}-800.webp 800w, ${p}.webp 1536w` }
  // Real file widths: a wrong number here makes the browser pick a smaller file on sharp screens.
  const [large, small] = /** @type {Record<string, number[]>} */ (photoWidths)[stem.slice('/images/photos/'.length)] ?? [1600, 800]
  return { src: `${p}-1600.webp`, srcset: large > small ? `${p}-800.webp ${small}w, ${p}-1600.webp ${large}w` : `${p}-1600.webp ${large}w` }
}
