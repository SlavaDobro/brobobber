<script>
  import { base } from '$app/paths'
  import HeroDoor from '$lib/site/HeroDoor.svelte'
  import ProjectRail from '$lib/site/ProjectRail.svelte'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Reviews from '$lib/site/Reviews.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import Photo from '$lib/site/Photo.svelte'
  import VideoReel from '$lib/site/VideoReel.svelte'
  import PhotoSlides from '$lib/site/PhotoSlides.svelte'
  import { projects, advantages, contacts, photoAspect } from '$lib/site/data.js'

  // Wide shots where the whole motorcycle is in frame.
  const showcase = [
    { slug: 'harley-davidson-v-rod', photo: '/images/photos/v-rod/01' },
    { slug: 'harley-davidson-scrambler', photo: '/images/photos/scrambler/01' },
    { slug: 'yamaha-v-max-1700', photo: '/images/photos/vmax/04' },
    { slug: 'harley-davidson-heritage-114', photo: '/images/photos/hd114/01' },
    { slug: 'harley-davidson-48-nardo-gray', photo: '/images/photos/48nardogray/07' },
  ]
</script>

<svelte:head>
  <title>Brobobber — кастом-ателье мотоциклов в Москве</title>
  <meta name="description" content="Кастомизация, тюнинг и обслуживание мотоциклов: Harley-Davidson, Triumph, Yamaha, BMW и другие. Мастерская в Москве, Марьино, Кнутовская, 14." />
</svelte:head>

<HeroDoor>
  <div class="hero-copy">
    <h1 class="hero-title">Кастом-ателье мотоциклов в Москве</h1>
    <p class="lead">Строим, тюнингуем и обслуживаем мотоциклы. Harley-Davidson, Triumph, Yamaha, BMW — и любой байк, который вы привезёте.</p>
    <div class="hero-actions">
      <a class="btn btn-signal" href="#zayavka">Обсудить проект</a>
      <a class="btn btn-line" href="{base}/proekty">Смотреть проекты</a>
    </div>
  </div>
</HeroDoor>

<section class="section manifesto">
  <div class="wrap">
    <div class="manifesto-top">
      <p class="statement">Место, где мотоциклы <span class="accent">превращаются в шедевры</span>. Каждый проект — под характер владельца.</p>
      <PhotoSlides items={showcase} />
    </div>
    <div class="why">
      <h2 class="h2">Почему Brobobber</h2>
      <ul class="advantages">
        {#each advantages as item, i}
          <li><span class="num">{String(i + 1).padStart(2, '0')}</span><h3 class="h3">{item.title}</h3><p class="muted">{item.text}</p></li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<ProjectRail {projects}>
  <div class="section-head">
    <h2 class="h2">Наши проекты</h2>
    <a class="link-steel" href="{base}/proekty">Все проекты</a>
  </div>
</ProjectRail>

<section class="section about">
  <div class="wrap grid">
    <div class="about-photo" style={`--a:${photoAspect('/images/photos/home/24')}`}>
      <Photo base="/images/photos/home/24" alt="Мастера Brobobber в мастерской" sizes="(max-width: 900px) 100vw, 45vw" />
    </div>
    <div class="about-copy">
      <h2 class="h2">Кастом-мастерская в Москве</h2>
      <p class="lead">Brobobber — мастерская кастомных мотоциклов в Москве, в Марьино (Новая Москва). Объединяем техническое мастерство и стильный дизайн. Детали проектируем в 3D и вытачиваем на станках с ЧПУ, красим сами, шьём сиденья сами.</p>
      <p class="muted">На связи с вами {contacts.phones[0].name}. Ведём проект от первого разговора до передачи мотоцикла, а потом обслуживаем его.</p>
      <a class="btn btn-line" href="{base}/o-nas">О мастерской</a>
    </div>
  </div>
</section>

<section class="section services">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Что делаем</h2>
      <p>Выберите отметку на мотоцикле — покажем, какие узлы мы дорабатываем.</p>
      <a class="link-steel" href="{base}/konfigurator">Соберите свой V-Rod в конфигураторе</a>
    </div>
    <ServiceBike />
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Как создаётся кастом</h2>
      <a class="link-steel" href="{base}/process">Подробнее о процессе</a>
    </div>
    <ProcessRoad />
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Отзывы</h2>
      <p>Что пишут те, кто уже ездит на мотоциклах из мастерской.</p>
    </div>
    <Reviews />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Жизнь мастерской</h2>
      <p>Короткие ролики из нашего Telegram-канала: новые проекты, детали и поездки.</p>
      <a class="link-steel" href={contacts.channel.href} target="_blank" rel="noopener">Канал {contacts.channel.handle}</a>
    </div>
    <VideoReel />
  </div>
</section>

<section class="section sale">
  <div class="wrap sale-grid">
    <div>
      <h2 class="h2">Мотоциклы в наличии</h2>
      <p class="lead">Готовые проекты, которые можно купить и сразу ехать, и мотоциклы-доноры под будущий кастом.</p>
    </div>
    <div class="sale-actions">
      <p class="muted">Актуальный список с фото, ценой и описанием. Новые мотоциклы первыми появляются в Telegram-канале {contacts.channel.handle}.</p>
      <a class="btn btn-signal" href="{base}/v-nalichii">Смотреть мотоциклы в наличии</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap faq-grid">
    <h2 class="h2">Частые вопросы</h2>
    <Faq />
  </div>
</section>

<style>
  .hero-copy { display: grid; gap: 20px; max-width: 640px; }
  .hero-title { font-family: var(--display); font-weight: 600; font-stretch: 94%; font-size: clamp(26px, 3vw, 40px); line-height: 1.08; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .manifesto-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(24px, 5vw, 80px); align-items: center; }
  .statement { font-family: var(--display); font-weight: 600; font-stretch: 96%; font-size: clamp(32px, 4.5vw, 68px); line-height: 1.03; max-width: 18ch; }
  .accent { color: var(--signal); }
  .why { display: grid; gap: clamp(24px, 3vw, 40px); margin-top: clamp(40px, 6vw, 80px); padding-top: clamp(28px, 4vw, 48px); border-top: 1px solid var(--rule); }
  .advantages { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(28px, 3vw, 44px) 28px; }
  .advantages li { display: grid; gap: 10px; align-content: start; padding-top: 16px; border-top: 2px solid var(--rule); }
  .advantages .num { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 13px; letter-spacing: .1em; color: var(--signal); }
  .about .grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(28px, 6vw, 96px); align-items: center; }
  .about-photo { aspect-ratio: var(--a); width: min(100%, calc(82svh * var(--a))); justify-self: center; overflow: hidden; border-radius: 4px; }
  .about-photo :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .about-copy { display: grid; gap: 22px; justify-items: start; }
  .sale-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: end; }
  .sale-actions { display: grid; gap: 18px; justify-items: start; }
  .faq-grid { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; align-items: start; }
  @media (max-width: 760px) { .manifesto-top { grid-template-columns: 1fr; } }
  @media (max-width: 960px) {
    .advantages { grid-template-columns: 1fr 1fr; }
    .about .grid, .sale-grid, .faq-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) { .advantages { grid-template-columns: 1fr; } }
</style>
