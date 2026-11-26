<script>
  // The process page as a route sheet for a ride: the nine stages drawn as a route from the start
  // flag to the finish flag, split into three legs; the key numbers on instrument drums; the
  // detailed road with the tachometer; the workshop photos as a photographer's contact sheet
  // with a grease-pencil mark; the clips on film; the result and the questions.
  import { base } from '$app/paths'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import Photo from '$lib/site/Photo.svelte'
  import Odometer from '$lib/site/Odometer.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import VideoReel from '$lib/site/VideoReel.svelte'
  import { Flag } from '@lucide/svelte'
  import { process, projects, cardStyle } from '$lib/site/data.js'
  import { processFaq } from '$lib/site/faq.js'

  // Short names for the route; full titles and texts are in the road below.
  const short = ['Консультация', 'Материалы', 'Концепция', 'Донор', 'Техзадание', 'Договор', 'Работы', 'Выдача', 'Сервис']
  const legs = [
    { name: 'Идея', from: 0, to: 2 },
    { name: 'Проект и договор', from: 3, to: 5 },
    { name: 'Постройка и после', from: 6, to: 8 },
  ]
  const hex = '5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96'
  const sheet = ['/images/photos/home/16', '/images/photos/home/11', '/images/photos/48nardogray/04', '/images/photos/rocket/03', '/images/photos/tg-453/02', '/images/photos/tg-384/02']
</script>

<svelte:head>
  <title>Процесс: от идеи до готового мотоцикла — Brobobber</title>
  <meta name="description" content="Девять этапов кастомизации в Brobobber: консультация, референсы и концепция, подбор мотоцикла-донора, техзадание и смета, договор, работы, проверка и передача, обслуживание после." />
</svelte:head>

<section class="route-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span></nav>
    <div class="intro">
      <div class="intro-copy">
        <span class="kicker">Маршрутный лист</span>
        <h1 class="h1">От идеи до готового мотоцикла</h1>
      </div>
      <div class="intro-side">
        <p class="lead">Девять этапов, на каждом вы знаете, что происходит с мотоциклом. Свой мотоцикл не обязателен: подберём донора под концепцию.</p>
        <a class="btn btn-signal" href="#zayavka">Обсудить проект</a>
      </div>
    </div>

    <!-- The route: start flag, nine nodes in three legs, finish flag. -->
    <ol class="route" aria-label="Этапы">
      <li class="flag start" aria-hidden="true"><Flag size={18} /><span>Старт</span></li>
      {#each legs as leg, l}
        <li class="leg">
          <span class="leg-name"><b>{['I', 'II', 'III'][l]}</b>{leg.name}</span>
          <ol>
            {#each process.slice(leg.from, leg.to + 1) as step, k}
              {@const i = leg.from + k}
              <li>
                <a href={`#step-${i + 1}`} title={step.title}>
                  <span class="node"><svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points={hex} /></svg><b>{i + 1}</b></span>
                  <span class="node-name">{short[i]}</span>
                </a>
              </li>
            {/each}
          </ol>
        </li>
      {/each}
      <li class="flag finish" aria-hidden="true"><span class="checker"></span><span>Ключи</span></li>
    </ol>

    <div class="gauges">
      <Odometer value="09" label="этапов от идеи до ключей" />
      <Odometer value="1–2" unit="мес." label="постройка, когда детали на месте" />
      <Odometer value="1" unit="год" label="гарантии на работы и запчасти" />
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap"><ProcessRoad /></div>
</section>

<!-- A photographer's contact sheet from the workshop, one frame marked with a grease pencil. -->
<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Из мастерской</h2>
    <div class="contact-sheet">
      <span class="sheet-label" aria-hidden="true">BROBOBBER · WORKSHOP · ROLL 07</span>
      <ul>
        {#each sheet as photo, i}
          <li class:marked={i === 0}>
            <span class="frame"><Photo base={photo} alt="Работа в мастерской Brobobber" sizes="(max-width: 700px) 46vw, 30vw" cover /></span>
            <span class="frame-no" aria-hidden="true">{i + 12}<i>▸</i>{i + 12}A</span>
            {#if i === 0}
              <svg class="pencil" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M50 4 C 82 2, 98 22, 96 52 C 94 82, 72 98, 46 96 C 18 94, 2 74, 4 46 C 6 22, 24 6, 56 7" />
              </svg>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
    <h3 class="h3 reel-title">Как это выглядит в работе</h3>
    <VideoReel />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Наш результат</h2><a class="link-steel" href="{base}/proekty">Все проекты</a></div>
    <ul class="justified fill">{#each projects.slice(0, 3) as project}<li style={cardStyle(project)}><ProjectCard {project} /></li>{/each}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap two"><h2 class="h2">Вопросы о процессе</h2><Faq items={processFaq} /></div>
</section>

<style>
  .head { margin-bottom: 32px; }
  .reel-title { margin: 56px 0 20px; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }

  /* Hero: a route sheet */
  .route-hero { padding: calc(var(--header) + clamp(36px, 5vw, 72px)) 0 clamp(48px, 6vw, 88px); border-bottom: 1px solid var(--rule);
    background: radial-gradient(circle at 1px 1px, #ffffff0d 1px, transparent 1.5px) 0 0 / 26px 26px, linear-gradient(180deg, #181818, var(--asphalt)); }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); margin-bottom: 22px; }
  .crumbs a:hover { color: var(--paper); }
  .intro { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: clamp(24px, 5vw, 72px); align-items: end; }
  .intro-copy { display: grid; gap: 14px; container-type: inline-size; }
  .intro-copy .h1 { font-size: clamp(34px, min(6vw, 10.5cqi), 84px); }
  .kicker { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--signal); }
  .intro-side { display: grid; gap: 22px; justify-items: start; }

  /* The route line: flags at the ends, legs with their roman numbers, nodes as hex nuts. */
  .route { display: grid; grid-template-columns: auto minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr) auto; align-items: end; gap: 0; margin-top: clamp(44px, 6vw, 80px); position: relative; }
  .route::before { content: ''; position: absolute; left: 20px; right: 20px; bottom: 27px; height: 2px;
    background: repeating-linear-gradient(90deg, var(--signal) 0 14px, transparent 14px 22px); opacity: .85; }
  .flag { position: relative; display: grid; justify-items: center; gap: 10px; padding-bottom: 6px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--concrete); }
  .flag :global(svg), .checker { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; background: #0e0e0e; border: 1px solid var(--rule); padding: 10px; color: var(--signal); }
  .checker { padding: 0; background: conic-gradient(var(--paper) 25%, #131313 0 50%, var(--paper) 0 75%, #131313 0) 0 0 / 12px 12px; border: 3px solid #0e0e0e; box-shadow: 0 0 0 1px var(--rule); }
  .flag > span:not(.checker) { order: -1; }
  .leg { display: grid; gap: 18px; padding: 0 8px; }
  .leg-name { display: flex; align-items: baseline; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--rule); font-family: var(--display); font-weight: 650; font-stretch: 100%; font-size: 15px; color: var(--paper); }
  .leg-name b { font-weight: 800; font-stretch: 112%; color: var(--signal); font-size: 13px; letter-spacing: .1em; }
  .leg ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .leg ol a { display: grid; justify-items: center; gap: 10px; padding: 4px 2px 6px; text-align: center; }
  .node { position: relative; width: 44px; height: 44px; display: grid; place-items: center; order: 2; }
  .node svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .45s var(--ease); }
  .node polygon { fill: #121212; stroke: #ebebea66; stroke-width: 1.2; stroke-linejoin: round; transition: fill .25s, stroke .25s; }
  .node b { position: relative; font-family: var(--display); font-weight: 700; font-size: 14px; color: var(--paper); }
  .node-name { order: 1; font-size: 13px; line-height: 1.2; color: var(--concrete); transition: color .2s; }
  .leg ol a:hover .node svg { transform: rotate(60deg); }
  .leg ol a:hover .node polygon { fill: var(--signal); stroke: var(--signal); }
  .leg ol a:hover .node-name { color: var(--paper); }

  .gauges { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: clamp(40px, 5vw, 64px); }
  .gauges > :global(*) { padding: 20px 22px; background: #0e0e0e; border: 1px solid var(--rule); border-radius: 3px; }

  /* Contact sheet */
  .contact-sheet { position: relative; padding: 38px clamp(14px, 2vw, 26px) 26px; background: #ebe8e1; border-radius: 3px; box-shadow: 0 30px 50px -30px #000; }
  .sheet-label { position: absolute; left: clamp(14px, 2vw, 26px); top: 12px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .2em; color: #141414; }
  .contact-sheet ul { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px 14px; padding: 12px; background: #0b0b0b; border-radius: 2px; }
  .contact-sheet li { position: relative; display: grid; gap: 6px; }
  .frame { display: block; aspect-ratio: 3 / 2; overflow: hidden; }
  .frame :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .frame-no { display: flex; gap: 8px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 10px; letter-spacing: .16em; color: #d23f2ab3; }
  .frame-no i { font-style: normal; color: #ebebea80; }
  /* The grease-pencil circle around the pick of the roll. */
  .pencil { position: absolute; left: -4%; top: -6%; width: 108%; height: 104%; overflow: visible; pointer-events: none; }
  .pencil path { fill: none; stroke: var(--signal); stroke-width: 2.4; stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: .9; }

  @media (max-width: 1000px) {
    .intro { grid-template-columns: 1fr; }
    .route { grid-template-columns: 1fr; gap: 26px; }
    .route::before, .flag { display: none; }
    .leg { padding: 0; }
  }
  @media (max-width: 700px) {
    .gauges { grid-template-columns: 1fr; }
    .contact-sheet ul { grid-template-columns: 1fr 1fr; }
    .two { grid-template-columns: 1fr; }
  }
</style>
