<script>
  // About the workshop, told through workshop paperwork: a sign over the gate, the workshop's own
  // registration document ("техпаспорт") with the facts, a staff pass for the master, the
  // philosophy as a line painted on the wall, then the shared plates, services, builds and reviews.
  // The client's history and Alexey's photo are still to come: the pass and the document are
  // where they will go.
  import { base } from '$app/paths'
  import Photo from '$lib/site/Photo.svelte'
  import Logo from '$lib/site/Logo.svelte'
  import ProjectRail from '$lib/site/ProjectRail.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Reviews from '$lib/site/Reviews.svelte'
  import ServiceIndex from '$lib/site/ServiceIndex.svelte'
  import WhyPlates from '$lib/site/WhyPlates.svelte'
  import { Phone, Send, MapPin } from '@lucide/svelte'
  import { projects, contacts, mapLinks, services } from '$lib/site/data.js'

  const master = contacts.phones[0]
  const passport = [
    ['Наименование', 'BROBOBBER Custom Workshop'],
    ['Местонахождение', contacts.addressShort],
    ['Специализация', 'Кастомизация, тюнинг, обслуживание и ремонт мотоциклов'],
    ['Марки', 'Harley-Davidson, Triumph, Yamaha, Suzuki, BMW, Honda и другие'],
    ['Производство', '3D-моделирование, ЧПУ, покраска, пошив сидений'],
    ['Направлений работ', String(services.length)],
    ['Гарантия', '1 год на работы и запчасти мастерской'],
    ['Связь', `${master.phone} · ${contacts.channel.handle}`],
  ]
</script>

<svelte:head>
  <title>О мастерской — Brobobber</title>
  <meta name="description" content="Brobobber — студия кастомайзинга мотоциклов в Москве. Техническое мастерство и стильный дизайн, 3D-моделирование и ЧПУ, гарантия год." />
</svelte:head>

<!-- The gate: a workshop photo with the club badge and the name like a sign over the door. -->
<section class="gate">
  <div class="gate-photo"><Photo base="/images/photos/home/11" alt="Мастерская Brobobber изнутри" sizes="100vw" eager cover /></div>
  <div class="wrap gate-in">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span></nav>
    <div class="sign">
      <Logo size={132} word={false} />
      <div>
        <span class="since">Custom workshop · Moscow</span>
        <h1 class="h1">Студия кастомайзинга мотоциклов</h1>
      </div>
    </div>
    <p class="lead">Brobobber объединяет техническое мастерство и стильный дизайн, создавая проекты для тех, кто живёт скоростью и свободой.</p>
  </div>
</section>

<!-- Workshop registration document and the master's pass. -->
<section class="section">
  <div class="wrap papers">
    <article class="passport">
      <header>
        <span class="doc-title">Технический паспорт мастерской</span>
        <span class="doc-no">Серия BB <b>№ 000001</b></span>
      </header>
      <dl>
        {#each passport as [label, value]}
          <div><dt>{label}</dt><dd>{value}</dd></div>
        {/each}
      </dl>
      <footer>
        <span class="seal" aria-hidden="true"><Logo size={74} word={false} ring /></span>
        <a class="link-steel" href={mapLinks.yandex} target="_blank" rel="noopener"><MapPin size={14} /> Мастерская на карте</a>
      </footer>
    </article>

    <article class="pass" aria-label={`Мастер: ${master.name}`}>
      <span class="clip" aria-hidden="true"></span>
      <span class="pass-head">Пропуск · Мастерская</span>
      <span class="avatar" aria-hidden="true">
        <svg viewBox="-12 -12 24 24"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg>
        <b>{master.name[0]}</b>
      </span>
      <strong class="pass-name">{master.name}</strong>
      <span class="pass-role">Ведёт проекты от идеи до выдачи</span>
      <p>Обсуждает идею, смету и сроки. Сюда же вы приезжаете на обслуживание.</p>
      <div class="pass-actions">
        <a class="btn btn-signal" href={master.href}><Phone size={16} />{master.phone}</a>
        <a class="btn btn-line" href={`https://t.me/${master.telegram}`} target="_blank" rel="noopener"><Send size={16} />Telegram</a>
      </div>
      <span class="stripe" aria-hidden="true"></span>
    </article>
  </div>
</section>

<!-- Philosophy, painted on the wall. -->
<section class="section wall">
  <div class="wrap">
    <div class="creed-in">
      <span class="kicker">Наша философия</span>
      <p class="creed">Мотоцикл — отражение <em>характера владельца</em>. Мы не тиражируем решения: каждую деталь подбираем, проектируем или делаем под конкретный байк.</p>
    </div>
    <div class="creed-photo"><Photo base="/images/photos/home/26" alt="Гравированная накладка на бак" sizes="(max-width: 900px) 100vw, 40vw" cover /></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Почему к нам едут</h2>
    <WhyPlates />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Услуги мастерской</h2><p>От замены лампочки до мотоцикла, собранного с нуля.</p></div>
    <ServiceIndex />
  </div>
</section>

<ProjectRail {projects}>
  <div class="section-head"><h2 class="h2">Что мы построили</h2><a class="link-steel" href="{base}/proekty">Все проекты</a></div>
</ProjectRail>

<section class="section tight">
  <div class="wrap">
    <h2 class="h2 head">Процесс создания кастома</h2>
    <ProcessRoad compact />
  </div>
</section>

<section class="section tight">
  <div class="wrap"><h2 class="h2 head">Отзывы</h2><Reviews /></div>
</section>

<style>
  .head { margin-bottom: 32px; }

  /* Gate */
  .gate { position: relative; min-height: min(86svh, 820px); display: grid; align-items: end; overflow: hidden; border-bottom: 1px solid var(--rule); }
  .gate-photo { position: absolute; inset: 0; }
  .gate-photo :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .gate::after { content: ''; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(90deg, #131313f0 0, #131313b3 40%, #13131300 75%), linear-gradient(180deg, #131313e6 0, #13131340 30%, #13131399 62%, #131313 100%), repeating-linear-gradient(180deg, #0000 0 46px, #00000040 46px 48px); }
  .gate-in { position: relative; z-index: 1; display: grid; gap: 22px; padding-top: calc(var(--header) + 40px); padding-bottom: clamp(40px, 6vw, 80px); container-type: inline-size; }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); }
  .crumbs a:hover { color: var(--paper); }
  .sign { display: flex; align-items: center; gap: clamp(18px, 3vw, 36px); }
  .sign :global(.logo-mark) { flex: none; }
  .since { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--signal); }
  .sign .h1 { margin-top: 8px; font-size: clamp(34px, min(6vw, 9cqi), 84px); max-width: 14em; }
  .gate .lead { max-width: 52ch; }

  /* Papers: the registration document and the pass, side by side. */
  .papers { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: clamp(20px, 3vw, 40px); align-items: start; }
  .passport { position: relative; overflow: hidden; display: grid; gap: 0; background: linear-gradient(160deg, #1d1d1d, #151515); border: 1px solid var(--rule); border-radius: 4px; }
  /* A faint guilloche pattern like on a printed document. */
  .passport::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .5;
    background: repeating-radial-gradient(circle at 85% 20%, #ffffff05 0 2px, transparent 2px 9px), repeating-linear-gradient(115deg, #ffffff04 0 1px, transparent 1px 7px); }
  .passport header { position: relative; display: flex; justify-content: space-between; align-items: baseline; gap: 16px; flex-wrap: wrap; padding: 22px 28px; border-bottom: 1px solid var(--rule); }
  .doc-title { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 13px; letter-spacing: .2em; text-transform: uppercase; color: var(--paper); }
  .doc-no { font-family: var(--display); font-weight: 600; font-stretch: 108%; font-size: 12px; letter-spacing: .14em; color: var(--concrete); }
  .doc-no b { color: var(--signal); margin-left: 4px; }
  .passport dl { position: relative; display: grid; grid-template-columns: 1fr 1fr; }
  .passport dl > div { display: grid; gap: 6px; padding: 16px 28px; border-bottom: 1px dashed #ebebea1f; }
  .passport dl > div:nth-child(odd) { border-right: 1px dashed #ebebea1f; }
  .passport dt { font-family: var(--display); font-weight: 600; font-stretch: 112%; font-size: 10.5px; letter-spacing: .2em; text-transform: uppercase; color: var(--concrete); }
  .passport dd { font-size: 16px; line-height: 1.4; }
  .passport footer { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 28px; }
  .seal { display: grid; place-items: center; opacity: .55; transform: rotate(-10deg); filter: grayscale(1); }
  .passport footer .link-steel { display: inline-flex; align-items: center; gap: 6px; }

  /* The pass: a lanyard clip, a hex-nut avatar until Alexey's photo arrives, a red stripe. */
  .pass { position: relative; display: grid; justify-items: start; gap: 12px; padding: 40px 26px 30px; background: linear-gradient(170deg, #ece9e2, #d9d5cc); color: #141414; border-radius: 10px; box-shadow: 0 30px 50px -30px #000; transform: rotate(1.5deg); }
  .clip { position: absolute; left: 50%; top: 12px; width: 54px; height: 9px; margin-left: -27px; border-radius: 6px; background: #131313; box-shadow: inset 0 1px 2px #000; }
  .pass-head { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--signal-deep); }
  .avatar { position: relative; width: 92px; height: 92px; display: grid; place-items: center; margin: 6px 0; }
  .avatar svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .avatar polygon { fill: #141414; }
  .avatar b { position: relative; font-family: var(--display); font-weight: 800; font-stretch: 112%; font-size: 40px; color: var(--paper); }
  .pass-name { font-family: var(--display); font-weight: 800; font-stretch: 104%; font-size: 30px; line-height: 1; }
  .pass-role { font-family: var(--display); font-weight: 600; font-stretch: 104%; font-size: 13px; letter-spacing: .06em; text-transform: uppercase; color: #555; }
  .pass p { font-size: 15px; color: #3a3a3a; }
  .pass-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
  .pass-actions .btn { height: 46px; padding: 0 16px; gap: 8px; }
  .pass-actions .btn-line { color: #141414; border-color: #14141440; }
  .pass-actions .btn-line:hover { background: #1414140d; border-color: #141414; }
  .stripe { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; border-radius: 0 0 10px 10px; background: repeating-linear-gradient(135deg, var(--signal) 0 12px, #141414 12px 24px); }

  /* Philosophy on the wall */
  .wall .wrap { position: relative; display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: clamp(24px, 5vw, 72px); align-items: center; }
  .creed-in { display: grid; gap: 20px; }
  .kicker { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--signal); }
  .creed { font-family: var(--display); font-weight: 700; font-stretch: 96%; font-size: clamp(28px, 3.4vw, 52px); line-height: 1.12; text-wrap: balance; }
  .creed em { font-style: normal; color: var(--signal); }
  .creed-photo { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 3px; transform: rotate(-2deg); box-shadow: 0 30px 50px -30px #000; border: 6px solid #e6e2da; }
  .creed-photo :global(img) { width: 100%; height: 100%; object-fit: cover; }

  @media (max-width: 960px) {
    .papers, .wall .wrap { grid-template-columns: 1fr; }
    .pass { max-width: 420px; }
    .creed-photo { max-width: 360px; }
  }
  @media (max-width: 640px) {
    .sign { flex-direction: column; align-items: flex-start; }
    .sign :global(svg) { width: 92px; height: 92px; }
    .passport dl { grid-template-columns: 1fr; }
    .passport dl > div:nth-child(odd) { border-right: 0; }
    .passport header, .passport dl > div, .passport footer { padding-left: 18px; padding-right: 18px; }
  }
</style>
