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
  import WhyPlates from '$lib/site/WhyPlates.svelte'
  import Logo from '$lib/site/Logo.svelte'
  import { Check, Phone, Send } from '@lucide/svelte'
  import { projects, contacts } from '$lib/site/data.js'

  // What the workshop does with its own hands: the clipboard in the workshop block.
  const inHouse = ['3D-моделирование и детали на ЧПУ', 'Покраска', 'Пошив сидений', 'Электрика и свет', 'Прошивка ЭБУ', 'Обслуживание после выдачи']


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
      <!-- A neon sign on the workshop's brick wall. -->
      <div class="wall">
        <p class="statement">Место, где мотоциклы <span class="neon">превращаются в шедевры</span>. Каждый проект — под характер владельца.</p>
      </div>
      <PhotoSlides items={showcase} />
    </div>
    <div class="why">
      <h2 class="h2">Почему Brobobber</h2>
      <WhyPlates />
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
    <!-- A photo of the workshop taped to the wall like a print. -->
    <figure class="print">
      <span class="tape t1" aria-hidden="true"></span><span class="tape t2" aria-hidden="true"></span>
      <span class="print-pic"><Photo base="/images/photos/home/24" alt="Мастера Brobobber в мастерской" sizes="(max-width: 900px) 92vw, 40vw" cover /></span>
      <figcaption>Мастерская · Москва, Марьино</figcaption>
    </figure>
    <div class="about-copy">
      <h2 class="h2">Кастом-мастерская в Москве</h2>
      <p class="lead">Brobobber — мастерская кастомных мотоциклов в Москве, в Марьино (Новая Москва). Объединяем техническое мастерство и стильный дизайн.</p>
      <!-- Clipboard: what is done in-house. -->
      <div class="clipboard">
        <span class="clip" aria-hidden="true"></span>
        <span class="clip-title">Делаем сами</span>
        <ul>{#each inHouse as item}<li><span class="tick" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>{item}</li>{/each}</ul>
      </div>
      <div class="about-foot">
        <a class="master" href={contacts.phones[0].href}><Phone size={16} /><span>На связи — {contacts.phones[0].name}<b>{contacts.phones[0].phone}</b></span></a>
        <a class="btn btn-line" href="{base}/o-nas">О мастерской</a>
      </div>
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
    <!-- The questions as an owner's manual: a cover with the club badge. -->
    <div class="manual">
      <span class="manual-top">Руководство владельца</span>
      <span class="manual-badge" aria-hidden="true"><Logo size={96} word={false} ring /></span>
      <h2 class="h2">Частые вопросы</h2>
      <p class="muted">Не нашли ответ? Спросите мастера напрямую.</p>
      <a class="btn btn-signal" href={`https://t.me/${contacts.phones[0].telegram}`} target="_blank" rel="noopener"><Send size={16} />Написать в Telegram</a>
    </div>
    <Faq />
  </div>
</section>

<style>
  .hero-copy { display: grid; gap: 20px; max-width: 640px; }
  .hero-title { font-family: var(--display); font-weight: 600; font-stretch: 94%; font-size: clamp(26px, 3vw, 40px); line-height: 1.08; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .manifesto-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(24px, 5vw, 80px); align-items: center; }
  /* Brick wall: mortar lines drawn as a small tiling SVG, darkened towards the edges. */
  .wall { position: relative; align-self: stretch; display: grid; align-content: center; padding: clamp(28px, 4vw, 56px); border-radius: 4px; overflow: hidden;
    background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #0c0c0c 100%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='32'%3E%3Cg fill='none' stroke='%230b0b0b' stroke-width='2'%3E%3Cpath d='M0 1H64M0 17H64M1 1V17M33 17V33'/%3E%3C/g%3E%3C/svg%3E") 0 0 / 64px 32px,
      linear-gradient(180deg, #222, #1b1b1b); }
  .statement { position: relative; font-family: var(--display); font-weight: 600; font-stretch: 96%; font-size: clamp(30px, 4vw, 60px); line-height: 1.06; max-width: 18ch; }
  /* Red neon tube: a hot core, a glow on the bricks, one flicker when it is switched on. */
  .neon { color: #ffd9d2; text-shadow: 0 0 2px #fff6, 0 0 8px #ff4b33, 0 0 22px #d23f2a, 0 0 46px #d23f2a99; animation: neon 2.6s .4s both; }
  @keyframes neon { 0%, 8% { opacity: .15; text-shadow: none; } 10% { opacity: 1; } 12% { opacity: .3; } 16%, 100% { opacity: 1; } }
  .why { display: grid; gap: clamp(24px, 3vw, 40px); margin-top: clamp(40px, 6vw, 80px); padding-top: clamp(28px, 4vw, 48px); border-top: 1px solid var(--rule); }
  .about .grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(28px, 6vw, 96px); align-items: center; }
  /* The print: white border, tape on two corners, a caption on the bottom margin. */
  .print { position: relative; margin: 0; padding: 14px 14px 0; background: #ebe8e1; box-shadow: 0 30px 50px -30px #000; transform: rotate(-2deg); justify-self: center; width: min(100%, 520px); }
  .print-pic { display: block; aspect-ratio: 4 / 5; overflow: hidden; }
  .print-pic :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .print figcaption { padding: 12px 4px 16px; font-family: var(--display); font-weight: 700; font-stretch: 108%; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: #2a2a2a; }
  .tape { position: absolute; z-index: 1; width: 96px; height: 28px; background: #d9cfb0b3; box-shadow: 0 1px 2px #0003; }
  .t1 { left: -22px; top: 10px; transform: rotate(-38deg); }
  .t2 { right: -22px; top: 10px; transform: rotate(38deg); }
  .about-copy { display: grid; gap: 22px; justify-items: start; }
  /* Clipboard with the in-house work. */
  .clipboard { position: relative; width: 100%; padding: 30px 24px 20px; background: repeating-linear-gradient(180deg, transparent 0 33px, #1414141a 33px 34px), #ebe8e1; color: #141414; border-radius: 3px;
    box-shadow: 0 0 0 8px #2a2a2a, 0 24px 40px -24px #000; }
  .clip { position: absolute; left: 50%; top: -16px; width: 110px; height: 26px; margin-left: -55px; border-radius: 6px 6px 3px 3px; background: linear-gradient(180deg, #d9dcdf, #8c9196); box-shadow: 0 3px 4px #0008; }
  .clip-title { display: block; margin-bottom: 8px; font-family: var(--display); font-weight: 800; font-stretch: 112%; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--signal-deep); }
  .clipboard ul { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
  .clipboard li { display: flex; align-items: center; gap: 10px; min-height: 34px; font-size: 15px; }
  .tick { flex: none; width: 20px; height: 20px; display: grid; place-items: center; border: 1.5px solid #14141466; border-radius: 3px; color: var(--signal); }
  .about-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; }
  .master { display: inline-flex; align-items: center; gap: 12px; color: var(--concrete); }
  .master :global(svg) { color: var(--signal); }
  .master span { display: grid; font-size: 13px; }
  .master b { font-family: var(--display); font-weight: 700; font-size: 20px; color: var(--paper); font-variant-numeric: tabular-nums; }
  .master:hover b { color: var(--signal); }
  /* FAQ cover: an owner's manual. */
  .manual { position: sticky; top: calc(var(--header) + 24px); display: grid; justify-items: start; gap: 16px; padding: 28px 26px; background: linear-gradient(155deg, #1f1f1f, #141414); border: 1px solid var(--rule); border-left: 6px solid var(--signal); border-radius: 3px 6px 6px 3px; box-shadow: 0 24px 40px -28px #000; }
  .manual-top { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: var(--concrete); }
  .manual-badge { opacity: .9; }
  .manual .btn :global(svg) { margin-right: 2px; }
  .faq-grid { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; align-items: start; }
  @media (max-width: 760px) { .manifesto-top { grid-template-columns: 1fr; } }
  @media (max-width: 960px) {
    .about .grid, .faq-grid { grid-template-columns: 1fr; }
    .manual { position: static; }
  }
  @media (max-width: 560px) {
    .clipboard ul { grid-template-columns: 1fr; }
    .print { width: 92%; }
  }
</style>
