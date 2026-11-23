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
  import { projects, advantages, contacts } from '$lib/site/data.js'

  const showcase = ['harley-davidson-v-rod', 'harley-davidson-scrambler', 'yamaha-v-max-1700', 'triumph-rocket-3r', 'harley-davidson-heritage-114', 'harley-davidson-48-nardo-gray', 'bmw-k100']
</script>

<svelte:head>
  <title>Brobobber — кастом-ателье мотоциклов в Москве</title>
  <meta name="description" content="Кастомизация, тюнинг и обслуживание мотоциклов: Harley-Davidson, Triumph, Yamaha, BMW и другие. Мастерская в Москве, Марьино, Кнутовская, 14." />
</svelte:head>

<HeroDoor photo="/images/photos/scrambler/04" alt="Два мотоцикла мастерской Brobobber на закате у воды" focus="27% 58%">
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
      <p class="statement">Место, где мотоциклы <span class="brass">превращаются в шедевры</span>. Каждый проект — под характер владельца.</p>
      <PhotoSlides slugs={showcase} />
    </div>
    <ul class="advantages">
      {#each advantages as item}
        <li><h2 class="h3">{item.title}</h2><p class="muted">{item.text}</p></li>
      {/each}
    </ul>
  </div>
</section>

<ProjectRail {projects}>
  <div class="section-head">
    <h2 class="h2">Наши проекты</h2>
    <p>Мотоциклы, которые прошли через мастерскую, — от свежих сборок 2026 года до архивных. Внутри каждого история, список работ и фото.</p>
    <a class="link-brass" href="{base}/proekty">Все проекты</a>
  </div>
</ProjectRail>

<section class="section about">
  <div class="wrap grid">
    <div class="about-photo">
      <Photo base="/images/photos/home/24" alt="Мастера Brobobber в мастерской" sizes="(max-width: 900px) 100vw, 45vw" />
    </div>
    <div class="about-copy">
      <h2 class="h2">Мастерская на Кнутовской</h2>
      <p class="lead">Brobobber объединяет техническое мастерство и стильный дизайн. Детали проектируем в 3D и вытачиваем на станках с ЧПУ, красим сами, шьём сиденья сами.</p>
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
      <a class="link-brass" href="{base}/konfigurator">Соберите свой V-Rod в конфигураторе</a>
    </div>
    <ServiceBike />
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Как создаётся кастом</h2>
      <a class="link-brass" href="{base}/process">Подробнее о процессе</a>
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
      <a class="link-brass" href={contacts.channel.href} target="_blank" rel="noopener">Канал {contacts.channel.handle}</a>
    </div>
    <VideoReel />
  </div>
</section>

<section class="section sale">
  <div class="wrap sale-grid">
    <div>
      <h2 class="h2">Мотоциклы в наличии</h2>
      <p class="lead">Иногда у нас появляются готовые перестроенные мотоциклы — их можно купить и сразу ехать.</p>
    </div>
    <div class="sale-actions">
      <p class="muted">Что сейчас в наличии, публикуем в Telegram-канале. Или спросите мастера напрямую.</p>
      <a class="btn btn-signal" href={contacts.channel.href} target="_blank" rel="noopener">Открыть канал {contacts.channel.handle}</a>
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
  .hero-title { font-family: var(--display); font-weight: 600; font-stretch: 85%; font-size: clamp(26px, 3vw, 40px); line-height: 1.08; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .manifesto-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(24px, 5vw, 80px); align-items: center; }
  .statement { font-family: var(--display); font-weight: 600; font-stretch: 78%; font-size: clamp(32px, 4.5vw, 68px); line-height: 1.03; max-width: 18ch; }
  .brass { color: var(--brass); }
  .advantages { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; margin-top: clamp(40px, 6vw, 80px); padding-top: 28px; border-top: 1px solid var(--rule); }
  .advantages li { display: grid; gap: 10px; align-content: start; }
  .about .grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(28px, 6vw, 96px); align-items: center; }
  .about-photo { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 4px; }
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
