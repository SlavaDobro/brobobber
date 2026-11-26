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
  import StockTeaser from '$lib/site/StockTeaser.svelte'
  import { projects, advantages, contacts, photoAspect } from '$lib/site/data.js'
  import { Cog, Motorbike, PencilRuler, Drill, Shapes, ShieldCheck } from '@lucide/svelte'

  // "Почему Brobobber": each reason is a stamped steel plate from the workshop wall, its icon in the
  // logo's hex nut. Icons follow the order of `advantages` in data.js.
  const whyIcons = [Cog, Motorbike, PencilRuler, Drill, Shapes, ShieldCheck]

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
      <ul class="plates">
        {#each advantages as item, i}
          {@const Icon = whyIcons[i] ?? Cog}
          <li class="plate">
            <span class="rivets" aria-hidden="true"></span>
            <span class="serial" aria-hidden="true">BB<i></i>{String(i + 1).padStart(2, '0')}</span>
            <span class="ruler" aria-hidden="true"></span>
            <span class="nut" aria-hidden="true">
              <svg viewBox="-12 -12 24 24"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg>
              <Icon size={22} strokeWidth={1.9} />
            </span>
            <h3 class="h3">{item.title}</h3>
            <p class="muted">{item.text}</p>
          </li>
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
    </div>
    <Reviews />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Жизнь мастерской</h2>
      <a class="link-steel" href={contacts.channel.href} target="_blank" rel="noopener">Канал {contacts.channel.handle}</a>
    </div>
    <VideoReel />
  </div>
</section>

<section class="section sale">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Мотоциклы в наличии</h2>
      <a class="link-steel" href="{base}/v-nalichii">Все мотоциклы в наличии</a>
    </div>
    <StockTeaser />
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
  /* Reasons as steel plates: rivets in the corners, a punched number tag and a measuring scale,
     the icon in a hex nut that takes a sixth of a turn when the plate is under the cursor. */
  .plates { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .plate { position: relative; overflow: hidden; display: grid; align-content: start; gap: 12px; min-height: 250px; padding: 30px 28px 28px;
    background: linear-gradient(155deg, #1f1f1f, #161616 55%, #121212); border: 1px solid var(--rule); border-radius: 3px;
    box-shadow: inset 0 1px 0 #ffffff0d, 0 18px 30px -24px #000; transition: border-color .3s, transform .35s var(--ease), box-shadow .35s; }
  .plate::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--signal); transform: scaleY(0); transform-origin: bottom; transition: transform .35s var(--ease); }
  .rivets { position: absolute; inset: 10px; pointer-events: none;
    background: radial-gradient(circle at 3px 3px, #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at calc(100% - 3px) 3px, #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at 3px calc(100% - 3px), #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at calc(100% - 3px) calc(100% - 3px), #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat; }
  /* Engine-number plate: a small recessed tag with the number punched into it. */
  .serial { position: absolute; right: 22px; top: 22px; display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px 4px;
    background: #0c0c0c; border: 1px solid #2b2b2b; border-radius: 2px; box-shadow: inset 0 1px 3px #000, 0 1px 0 #ffffff0a;
    font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .22em; color: #7d7f82;
    text-shadow: 0 -1px 0 #000, 0 1px 0 #ffffff12; transition: color .3s; }
  .serial i { width: 4px; height: 4px; border-radius: 50%; background: #3a3a3a; box-shadow: inset 0 1px 1px #000; }
  /* A measuring scale along the bottom edge: fine ticks every 8 px, long ones every 40 px. */
  .ruler { position: absolute; left: 28px; right: 28px; bottom: 12px; height: 9px; pointer-events: none; opacity: .55;
    background: repeating-linear-gradient(90deg, #ebebea40 0 1px, transparent 1px 40px) bottom left / 100% 9px no-repeat,
      repeating-linear-gradient(90deg, #ebebea26 0 1px, transparent 1px 8px) bottom left / 100% 5px no-repeat;
    -webkit-mask: linear-gradient(90deg, #000 70%, transparent); mask: linear-gradient(90deg, #000 70%, transparent); transition: opacity .3s; }
  .nut { position: relative; width: 54px; height: 54px; display: grid; place-items: center; color: var(--paper); margin-bottom: 14px; }
  .nut svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .5s var(--ease); }
  .nut polygon { fill: #0e0e0e; stroke: #ebebea4d; stroke-width: 1; stroke-linejoin: round; transition: fill .3s, stroke .3s; }
  .nut :global(svg.lucide) { position: relative; }
  .plate .h3 { position: relative; max-width: 15em; }
  .plate p { position: relative; max-width: 34ch; }
  .plate:hover { border-color: #ebebea33; transform: translateY(-3px); box-shadow: inset 0 1px 0 #ffffff12, 0 26px 40px -26px #000; }
  .plate:hover::after { transform: none; }
  .plate:hover .serial { color: var(--paper); }
  .plate:hover .serial i { background: var(--signal); }
  .plate:hover .ruler { opacity: 1; }
  .plate:hover .nut svg { transform: rotate(60deg); }
  .plate:hover .nut polygon { fill: var(--signal); stroke: var(--signal); }
  .about .grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(28px, 6vw, 96px); align-items: center; }
  .about-photo { aspect-ratio: var(--a); width: min(100%, calc(82svh * var(--a))); justify-self: center; overflow: hidden; border-radius: 4px; }
  .about-photo :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .about-copy { display: grid; gap: 22px; justify-items: start; }
  .faq-grid { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; align-items: start; }
  @media (max-width: 760px) { .manifesto-top { grid-template-columns: 1fr; } }
  @media (max-width: 960px) {
    .plates { grid-template-columns: 1fr 1fr; }
    .about .grid, .faq-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) { .plates { grid-template-columns: 1fr; } .plate { min-height: 0; padding: 24px 20px 32px; } .ruler { left: 20px; right: 20px; } .serial { right: 18px; top: 18px; } .nut { width: 48px; height: 48px; margin-bottom: 8px; } }
</style>
