<script>
  // Services as workshop furniture. The title is pressed into a felt letterboard like a shop
  // sign; every service is a drawer of a graphite tool chest with a paper label in a holder and
  // a steel handle (the drawer pulls out under the cursor); then the services on the motorcycle,
  // the builds, the process and the questions.
  import { base } from '$app/paths'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import ProjectTiles from '$lib/site/ProjectTiles.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { ArrowRight } from '@lucide/svelte'
  import { services, contacts } from '$lib/site/data.js'

  const works = ['harley-davidson-v-rod', 'harley-davidson-scrambler', 'yamaha-v-max-1700', 'harley-davidson-heritage-114', 'bmw-k100', 'harley-davidson-sportster-883', 'triumph-rocket-3r', 'harley-davidson-48-nardo-gray']

  // Plastic letters are never pressed in perfectly straight: a small, repeatable tilt per letter.
  /** @param {string} text @param {number} seed */
  const letters = (text, seed) => [...text].map((ch, i) => {
    const h = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453
    const r = h - Math.floor(h)
    return { ch, tilt: ((r - .5) * 3).toFixed(2), lift: ((r * 7 % 1 - .5) * 2).toFixed(1) }
  })
  const lines = [
    { text: 'BROBOBBER · МОСКВА', size: 's', seed: 1 },
    { text: 'УСЛУГИ', size: 'l', seed: 2, h1: true },
    { text: 'МАСТЕРСКОЙ', size: 'l', seed: 3, h1: true },
    { text: 'ОТ ЛАМПОЧКИ ДО КАСТОМА С НУЛЯ', size: 'm', seed: 4 },
  ]
</script>

<svelte:head>
  <title>Услуги — Brobobber</title>
  <meta name="description" content="Кастомизация, тюнинг, обслуживание и ремонт, прошивка ЭБУ, сиденья, электроника, детейлинг, мотоэвакуатор. Мастерская Brobobber в Москве." />
</svelte:head>

<section class="board-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span></nav>
    <div class="letterboard">
      <h1 class="sr-only">Услуги мастерской</h1>
      {#each lines as line}
        <p class={`line ${line.size}`} aria-hidden={line.h1 ? 'true' : undefined}>
          {#each letters(line.text, line.seed) as l}<span style={`--t:${l.tilt}deg;--y:${l.lift}px`}>{l.ch === ' ' ? ' ' : l.ch}</span>{/each}
        </p>
      {/each}
      <a class="line s call" href={contacts.phones[0].href}>{#each letters(`ЗВОНИТЕ ${contacts.phones[0].phone}`, 5) as l}<span style={`--t:${l.tilt}deg;--y:${l.lift}px`}>{l.ch === ' ' ? ' ' : l.ch}</span>{/each}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Все услуги</h2>
    <!-- Tool chest: two stacks of drawers under a lid with the club plate. -->
    <div class="chest">
      <div class="lid"><span class="plate">BROBOBBER · CUSTOM WORKSHOP</span></div>
      <ol class="drawers">
        {#each services as service, i}
          <li>
            <a class="drawer" href={`${base}/uslugi/${service.slug}`}>
              <span class="label"><b>{String(i + 1).padStart(2, '0')}</b>{service.name}</span>
              <span class="inside">{service.short}</span>
              <span class="go" aria-hidden="true"><ArrowRight size={18} /></span>
              <span class="handle" aria-hidden="true"></span>
            </a>
          </li>
        {/each}
        <li>
          <a class="drawer ask" href="#zayavka">
            <span class="label"><b>??</b>Не нашли нужное?</span>
            <span class="inside">Опишите задачу — скажем, беремся ли и сколько это стоит.</span>
            <span class="go" aria-hidden="true"><ArrowRight size={18} /></span>
            <span class="handle" aria-hidden="true"></span>
          </a>
        </li>
      </ol>
      <span class="casters" aria-hidden="true"><i></i><i></i></span>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Услуги на мотоцикле</h2>
    <ServiceBike />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Проекты мастерской</h2><a class="link-steel" href="{base}/proekty">Все проекты</a></div>
    <ProjectTiles slugs={works} />
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <h2 class="h2 head">Как проходит работа</h2>
    <ProcessRoad compact />
  </div>
</section>

<section class="section">
  <div class="wrap faq">
    <h2 class="h2">Вопросы</h2>
    <Faq />
  </div>
</section>

<style>
  .head { margin-bottom: 32px; }
  .faq { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  /* Letterboard: black felt with grooves, white plastic letters, an aluminium frame. */
  .board-hero { padding: calc(var(--header) + clamp(32px, 4vw, 56px)) 0 clamp(48px, 6vw, 88px); border-bottom: 1px solid var(--rule); }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); margin-bottom: 20px; }
  .crumbs a:hover { color: var(--paper); }
  .letterboard { display: grid; justify-items: center; gap: clamp(6px, 1vw, 12px); padding: clamp(28px, 4vw, 56px) clamp(16px, 3vw, 40px); container-type: inline-size;
    background: repeating-linear-gradient(180deg, #0b0b0b 0 5px, #050505 5px 7px), #0a0a0a; border: clamp(10px, 1.2vw, 16px) solid; border-image: linear-gradient(135deg, #d9dcdf, #7e8388 40%, #c4c7cb 60%, #6c7075) 1;
    box-shadow: inset 0 0 40px #000, 0 30px 50px -30px #000; }
  .line { display: flex; flex-wrap: wrap; justify-content: center; margin: 0; font-family: var(--display); font-weight: 700; font-stretch: 100%; color: #f2f0ea; line-height: 1.15; text-align: center; }
  .line span { display: inline-block; transform: translateY(var(--y)) rotate(var(--t)); text-shadow: 0 2px 0 #00000080, 0 0 1px #fff4; }
  .line.l { font-size: min(13cqi, 120px); letter-spacing: .06em; line-height: 1; }
  .line.m { font-size: min(4.2cqi, 34px); letter-spacing: .12em; margin-top: clamp(6px, 1.2vw, 14px); color: #e8e4da; }
  .line.s { font-size: min(2.8cqi, 18px); letter-spacing: .3em; color: #d9d5cb; }
  .call { margin-top: 10px; transition: color .2s; }
  .call span { color: inherit; }
  .call:hover { color: var(--signal); }

  /* Tool chest */
  .chest { position: relative; padding: 0 14px 34px; background: linear-gradient(90deg, #121212, #1e1e1e 50%, #121212); border: 1px solid #2c2c2c; border-radius: 10px 10px 6px 6px; box-shadow: 0 40px 60px -40px #000; }
  .lid { display: flex; justify-content: center; padding: 16px 0 14px; margin: 0 -14px 14px; border-bottom: 3px solid #0a0a0a; background: linear-gradient(180deg, #2a2a2a, #1a1a1a); border-radius: 10px 10px 0 0; }
  .plate { padding: 6px 16px 5px; background: linear-gradient(180deg, #d9dcdf, #9ea3a8); color: #141414; border-radius: 3px; font-family: var(--display); font-weight: 800; font-stretch: 112%; font-size: 12px; letter-spacing: .22em; box-shadow: inset 0 1px 0 #fff8, 0 2px 4px #000a; }
  .drawers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-flow: row; gap: 10px; }
  .drawer { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 20px; grid-template-areas: 'label go' 'inside go'; align-items: center; gap: 8px 14px; height: 100%; padding: 14px 18px 30px;
    background: linear-gradient(180deg, #262626, #1b1b1b); border: 1px solid #333; border-top-color: #444; border-radius: 4px; box-shadow: inset 0 -2px 0 #0008;
    transition: transform .3s var(--ease), box-shadow .3s, border-color .3s; }
  /* Label holder with a paper card. */
  .label { grid-area: label; justify-self: start; display: flex; align-items: baseline; gap: 10px; padding: 6px 12px 5px; background: #ebe8e1; color: #141414; border-radius: 2px;
    box-shadow: 0 0 0 3px #8e9398, inset 0 1px 2px #0003; font-family: var(--display); font-weight: 700; font-stretch: 100%; font-size: 15px; line-height: 1.2; }
  .label b { font-size: 11px; color: var(--signal-deep); letter-spacing: .1em; font-stretch: 112%; }
  .inside { grid-area: inside; font-size: 13.5px; line-height: 1.4; color: var(--concrete); }
  .go { grid-area: go; color: var(--concrete); transition: color .2s, transform .3s var(--ease); }
  .handle { position: absolute; left: 18%; right: 18%; bottom: 10px; height: 7px; border-radius: 4px; background: linear-gradient(180deg, #e3e5e8, #8a8f94 60%, #5f6368); box-shadow: 0 2px 3px #000a; transition: background .3s; }
  .drawer:hover { transform: translateY(6px) scale(1.012); border-color: #555; box-shadow: inset 0 -2px 0 #0008, 0 14px 22px -12px #000; z-index: 1; }
  .drawer:hover .go { color: var(--signal); transform: translateX(3px); }
  .drawer:hover .handle { background: linear-gradient(180deg, #ef6a55, var(--signal) 60%, var(--signal-deep)); }
  .drawer.ask { background: linear-gradient(180deg, #2c1a17, #1f1412); border-color: #5a2a22; }
  .drawer.ask .label { background: var(--signal); color: #fff; box-shadow: 0 0 0 3px #8e9398; }
  .drawer.ask .label b { color: #fff; }
  .drawer.ask .handle { background: linear-gradient(180deg, #ef6a55, var(--signal) 60%, var(--signal-deep)); }
  .casters { position: absolute; left: 0; right: 0; bottom: -14px; display: flex; justify-content: space-between; padding: 0 40px; pointer-events: none; }
  .casters i { width: 28px; height: 28px; border-radius: 50%; background: radial-gradient(circle, #555 0 4px, #1a1a1a 5px 11px, #0a0a0a 12px); box-shadow: 0 4px 6px #000a; }

  @media (max-width: 960px) { .faq { grid-template-columns: 1fr; } }
  @media (max-width: 760px) {
    .drawers { grid-template-columns: 1fr; }
    .line.s { font-size: min(3.6cqi, 18px); letter-spacing: .18em; }
    .line.m { font-size: min(5cqi, 34px); letter-spacing: .06em; }
  }
</style>
