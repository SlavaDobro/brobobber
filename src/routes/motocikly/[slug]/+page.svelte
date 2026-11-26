<script>
  // One style, in the gearbox language of /motocikly: the hero shows the style as an engaged
  // gear with shift-down / shift-up to the neighbouring styles; the traits are a datasheet on
  // drafting paper with an engineering title block; the other styles are a row of gears at the end.
  import { base } from '$app/paths'
  import Photo from '$lib/site/Photo.svelte'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import PhotoCredit from '$lib/site/PhotoCredit.svelte'
  import { Armchair, Frame, Wind, Puzzle, ChevronLeft, ChevronRight } from '@lucide/svelte'
  import { styles, projects, cardStyle, plural } from '$lib/site/data.js'
  import { styleFaq } from '$lib/site/faq.js'

  let { data } = $props()
  let style = $derived(data.style)
  let gear = $derived(styles.indexOf(style))
  let prev = $derived(styles[(gear - 1 + styles.length) % styles.length])
  let next = $derived(styles[(gear + 1) % styles.length])
  let shown = $derived(data.own.length ? data.own : projects.slice(0, 3))
  /** @type {Record<string, typeof Frame>} */
  const traitIcons = { 'Посадка': Armchair, 'Рама': Frame, 'Крылья': Wind, 'Детали': Puzzle }
  const hex = '5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96'
</script>

<svelte:head>
  <title>{style.name} — кастом в стиле {style.name.toLowerCase()} | Brobobber</title>
  <meta name="description" content={`${style.name}: ${style.lead} Кастомизация в мастерской Brobobber, Москва.`} />
</svelte:head>

<section class="hero">
  <div class="hero-photo"><Photo base={style.image} alt={`Мотоцикл в стиле ${style.name.toLowerCase()}`} sizes="100vw" eager cover /></div>
  <div class="wrap hero-in">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span><a href="{base}/motocikly">Мотоциклы</a><span aria-hidden="true">/</span></nav>
    <div class="engaged">
      <span class="gear" aria-hidden="true"><svg viewBox="-12 -12 24 24"><polygon points={hex} /></svg><b>{gear + 1}</b></span>
      <span class="gear-label">Передача {gear + 1} из {styles.length}</span>
    </div>
    <h1 class="name">{style.name}</h1>
    <p class="lead">{style.lead}</p>
    <div class="hero-actions">
      <a class="btn btn-signal" href="#zayavka">Обсудить проект</a>
      <nav class="shift" aria-label="Соседние стили">
        <a href={`${base}/motocikly/${prev.slug}`} rel="prev"><ChevronLeft size={18} /><span><small>Ниже</small>{prev.name}</span></a>
        <a href={`${base}/motocikly/${next.slug}`} rel="next"><span><small>Выше</small>{next.name}</span><ChevronRight size={18} /></a>
      </nav>
    </div>
    {#if style.credit}<div class="credit"><PhotoCredit credit={style.credit} /></div>{/if}
  </div>
</section>

<!-- Datasheet on drafting paper -->
<section class="section">
  <div class="wrap">
    <div class="sheet">
      <div class="sheet-head">
        <h2 class="h2">Особенности стиля</h2>
        <!-- Engineering title block -->
        <dl class="title-block" aria-label="Штамп листа">
          <div><dt>Наименование</dt><dd>{style.name}</dd></div>
          <div><dt>Разработал</dt><dd>BROBOBBER</dd></div>
          <div><dt>Лист</dt><dd>{gear + 1} / {styles.length}</dd></div>
        </dl>
      </div>
      <dl class="traits">
        {#each style.traits as [term, value]}
          {@const Icon = traitIcons[term] ?? Puzzle}
          <div>
            <dt><span class="t-icon" aria-hidden="true"><Icon size={18} /></span>{term}</dt>
            <dd>{value}</dd>
          </div>
        {/each}
      </dl>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">{data.own.length ? `Наши проекты в этом стиле` : 'Наши проекты'}</h2>
      {#if data.own.length}<p>{data.own.length} {plural(data.own.length, ['мотоцикл', 'мотоцикла', 'мотоциклов'])} из нашей мастерской.</p>{:else}<p>Проектов именно в этом стиле на сайте пока нет — вот что мы строили недавно.</p>{/if}
      <a class="link-steel" href="{base}/proekty">Все проекты</a>
    </div>
    <ul class="justified fill">{#each shown as project}<li style={cardStyle(project)}><ProjectCard {project} /></li>{/each}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Что можно доработать</h2></div>
    <ServiceBike />
  </div>
</section>

<section class="section">
  <div class="wrap two">
    <h2 class="h2">Вопросы о стиле {style.name.toLowerCase()}</h2>
    <Faq items={styleFaq[style.slug]} />
  </div>
</section>

<!-- All gears, the current one engaged -->
<section class="section">
  <div class="wrap">
    <h2 class="h3 others-title">Переключить стиль</h2>
    <ol class="gears">
      {#each styles as item, i}
        <li><a href={`${base}/motocikly/${item.slug}`} class:on={item.slug === style.slug} aria-current={item.slug === style.slug ? 'page' : undefined}>
          <span class="g-no">{i + 1}</span><span class="g-name">{item.name}</span>
        </a></li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }

  /* Hero: the photo full-width, the style as an engaged gear. */
  .hero { position: relative; min-height: min(88svh, 860px); display: grid; align-items: end; overflow: hidden; border-bottom: 1px solid var(--rule); }
  .hero-photo { position: absolute; inset: 0; }
  .hero-photo :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .hero::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, #131313f2 0, #131313b3 38%, #13131320 70%), linear-gradient(180deg, #131313cc 0, transparent 28%, transparent 60%, #131313 100%); }
  .hero-in { position: relative; z-index: 1; display: grid; gap: 18px; justify-items: start; padding-top: calc(var(--header) + 40px); padding-bottom: clamp(40px, 6vw, 80px); container-type: inline-size; }
  .crumbs { display: flex; gap: 8px; flex-wrap: wrap; font-size: 14px; color: var(--concrete); }
  .crumbs a:hover { color: var(--paper); }
  .engaged { display: flex; align-items: center; gap: 14px; }
  .gear { position: relative; width: 52px; height: 52px; display: grid; place-items: center; }
  .gear svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 4px 8px #000); }
  .gear polygon { fill: var(--signal); }
  .gear b { position: relative; font-family: var(--display); font-weight: 800; font-size: 22px; color: #fff; }
  .gear-label { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--paper); }
  .name { font-family: var(--display); font-weight: 800; font-stretch: 104%; font-size: clamp(48px, min(9vw, 14cqi), 140px); line-height: .92; letter-spacing: -.01em; }
  .hero .lead { max-width: 46ch; }
  .hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; margin-top: 6px; }
  .shift { display: flex; gap: 8px; }
  .shift a { display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; border: 1px solid #ebebea40; border-radius: 3px; background: #131313b3; backdrop-filter: blur(6px); transition: border-color .2s, color .2s; }
  .shift a:hover { border-color: var(--signal); color: var(--paper); }
  .shift span { display: grid; font-family: var(--display); font-weight: 650; font-size: 15px; line-height: 1.15; }
  .shift small { font-family: var(--text); font-weight: 400; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--concrete); }
  .credit { font-size: 12px; }

  /* Datasheet on drafting paper with a title block. */
  .sheet { position: relative; padding: clamp(24px, 3vw, 40px); border: 1px solid #ebebea2e; border-radius: 3px;
    background: linear-gradient(#ebebea0a 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, #ebebea0a 1px, transparent 1px) 0 0 / 24px 24px,
      linear-gradient(#ebebea12 1px, transparent 1px) 0 0 / 120px 120px, linear-gradient(90deg, #ebebea12 1px, transparent 1px) 0 0 / 120px 120px, #151515; }
  .sheet-head { display: flex; justify-content: space-between; align-items: start; gap: 24px; flex-wrap: wrap; margin-bottom: clamp(24px, 3vw, 40px); }
  .title-block { display: grid; grid-template-columns: repeat(3, auto); border: 1px solid #ebebea4d; background: #131313; }
  .title-block div { padding: 8px 14px; display: grid; gap: 2px; }
  .title-block div + div { border-left: 1px solid #ebebea4d; }
  .title-block dt { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--concrete); }
  .title-block dd { font-family: var(--display); font-weight: 700; font-size: 14px; }
  .traits { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .traits div { display: grid; gap: 12px; align-content: start; padding: 20px; background: #131313e6; border: 1px solid #ebebea26; border-top: 2px solid var(--signal); }
  .traits dt { display: flex; align-items: center; gap: 10px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--concrete); }
  .t-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #d23f2a1f; color: var(--signal); }
  .traits dd { font-size: 18px; line-height: 1.4; }

  /* Gear row */
  .others-title { margin-bottom: 16px; }
  .gears { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 8px; }
  .gears a { min-width: 0; display: grid; gap: 6px; justify-items: start; padding: 14px 14px 16px; background: #0e0e0e; border: 1px solid var(--rule); border-radius: 3px; transition: border-color .2s, background-color .2s; }
  .gears a:hover { border-color: #ebebea59; }
  .g-no { font-family: var(--display); font-weight: 800; font-size: 26px; line-height: 1; color: #ebebea4d; }
  .g-name { font-family: var(--display); font-weight: 650; font-size: 14px; color: var(--concrete); min-width: 0; overflow-wrap: anywhere; }
  .gears a.on { background: var(--signal); border-color: var(--signal); }
  .gears a.on .g-no, .gears a.on .g-name { color: #fff; }

  @media (max-width: 1000px) {
    .traits { grid-template-columns: 1fr 1fr; }
    .gears { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  @media (max-width: 900px) { .two { grid-template-columns: 1fr; } }
  @media (max-width: 560px) {
    .gears { grid-template-columns: 1fr 1fr; }
    .traits { grid-template-columns: 1fr; }
    .title-block { grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; }
    .title-block div { min-width: 0; padding: 8px 10px; }
    .title-block dt { font-size: 9px; letter-spacing: .06em; }
    .title-block dd { overflow-wrap: anywhere; }
    .shift { width: 100%; }
    .shift a { flex: 1; }
    .shift a:last-child { justify-content: flex-end; }
  }
</style>
