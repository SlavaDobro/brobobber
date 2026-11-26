<script>
  // Styles as a gear shifter. On the left the eight styles sit on a shift track numbered like
  // gears, and a red hex knob slides to the one you pick. On the right the showroom for that
  // style: the photo, the name, the build sheet (seat, frame, fenders, details), how many of our
  // builds are in it, and the way to its own page.
  import { base } from '$app/paths'
  import Photo from '$lib/site/Photo.svelte'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import PhotoCredit from '$lib/site/PhotoCredit.svelte'
  import { ArrowRight } from '@lucide/svelte'
  import { styles, projects, cardStyle, plural } from '$lib/site/data.js'

  let gear = $state(0)
  let style = $derived(styles[gear])
  let own = $derived(projects.filter(p => p.style === style.slug).length)
  const hex = '5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96'
  /** @param {KeyboardEvent} e */
  const keys = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { gear = (gear + 1) % styles.length; e.preventDefault() }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { gear = (gear - 1 + styles.length) % styles.length; e.preventDefault() }
  }
</script>

<svelte:head>
  <title>Мотоциклы и стили кастома — Brobobber</title>
  <meta name="description" content="Боббер, чоппер, кафе-рейсер, скрэмблер, бэггер, маскл, клаб-стайл, чикано: стили, с которыми работает мастерская Brobobber." />
</svelte:head>

<section class="gearbox">
  <div class="wrap">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span></nav>
    <div class="intro">
      <div>
        <span class="kicker">Коробка стилей</span>
        <h1 class="h1">Стили, в которых строим</h1>
      </div>
      <p class="lead">Восемь стилей кастома. Переключайте передачи — расскажем, что важно в каждом, и покажем наши мотоциклы.</p>
    </div>

    <div class="shifter">
      <!-- The shift track -->
      <div class="track" role="tablist" aria-label="Стили" aria-orientation="vertical" tabindex="-1" onkeydown={keys} style={`--gear:${gear}`}>
        <span class="rail" aria-hidden="true"></span>
        <span class="knob" aria-hidden="true"><svg viewBox="-12 -12 24 24"><polygon points={hex} /></svg><b>{gear + 1}</b></span>
        {#each styles as s, i}
          <button role="tab" aria-selected={i === gear} tabindex={i === gear ? 0 : -1} class:on={i === gear}
            onclick={() => gear = i} onmouseenter={() => gear = i} onfocus={() => gear = i}>
            <span class="notch" aria-hidden="true">{i + 1}</span>
            <span class="s-name">{s.name}</span>
          </button>
        {/each}
      </div>

      <!-- The showroom for the selected style -->
      {#key gear}
        <div class="showroom" role="tabpanel" aria-label={style.name}>
          <a class="shot" href={`${base}/motocikly/${style.slug}`} tabindex="-1">
            <Photo base={style.image} alt={style.name} sizes="(max-width: 900px) 100vw, 58vw" cover eager />
            <span class="gear-big" aria-hidden="true">{gear + 1}</span>
          </a>
          <div class="sheet">
            <h2 class="name">{style.name}</h2>
            <p class="lead-s">{style.lead}</p>
            <dl class="traits">
              {#each style.traits as [label, value]}<div><dt>{label}</dt><dd>{value}</dd></div>{/each}
            </dl>
            <div class="foot">
              <span class="own">{own ? `${own} ${plural(own, ['наш проект', 'наших проекта', 'наших проектов'])} в этом стиле` : 'Соберём первый — под вас'}</span>
              <a class="btn btn-signal" href={`${base}/motocikly/${style.slug}`}>Подробнее о стиле <ArrowRight size={17} /></a>
            </div>
            {#if style.credit}<div class="credit"><PhotoCredit credit={style.credit} /></div>{/if}
          </div>
        </div>
      {/key}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Что дорабатываем</h2><p>Независимо от стиля — эти узлы мы меняем чаще всего.</p></div>
    <ServiceBike />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Наши проекты</h2><a class="link-steel" href="{base}/proekty">Все проекты</a></div>
    <ul class="justified fill">{#each projects.slice(0, 4) as project}<li style={cardStyle(project)}><ProjectCard {project} /></li>{/each}</ul>
  </div>
</section>

<style>
  .gearbox { padding: calc(var(--header) + clamp(32px, 4vw, 60px)) 0 clamp(56px, 7vw, 104px); border-bottom: 1px solid var(--rule); }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); margin-bottom: 20px; }
  .crumbs a:hover { color: var(--paper); }
  .intro { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: clamp(24px, 5vw, 72px); align-items: end; margin-bottom: clamp(32px, 4vw, 56px); }
  .kicker { display: block; margin-bottom: 14px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--signal); }

  .shifter { display: grid; grid-template-columns: minmax(220px, 3fr) minmax(0, 9fr); gap: clamp(20px, 3vw, 44px); align-items: stretch; }

  /* Shift track: a slot with notches, the knob slides along it. */
  .track { --step: 64px; position: relative; display: grid; grid-auto-rows: var(--step); padding: 10px 0; background: #0e0e0e; border: 1px solid var(--rule); border-radius: 4px; align-content: start; }
  .rail { position: absolute; left: 36px; top: 26px; bottom: 26px; width: 6px; margin-left: -3px; border-radius: 3px; background: #050505; box-shadow: inset 0 1px 3px #000, 0 0 0 1px #2a2a2a; }
  .knob { position: absolute; left: 36px; top: calc(10px + var(--step) / 2 + var(--gear) * var(--step)); width: 40px; height: 40px; margin: -20px 0 0 -20px; display: grid; place-items: center; z-index: 2; pointer-events: none;
    transition: top .45s cubic-bezier(.3, 1.4, .5, 1); }
  .knob svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 4px 6px #000); }
  .knob polygon { fill: var(--signal); stroke: #ff8a75; stroke-width: .8; }
  .knob b { position: relative; font-family: var(--display); font-weight: 800; font-size: 15px; color: #fff; }
  .track button { position: relative; display: flex; align-items: center; gap: 22px; padding: 0 18px 0 22px; text-align: left; color: var(--concrete); transition: color .2s, background-color .2s; }
  .notch { width: 28px; flex: none; text-align: center; font-family: var(--display); font-weight: 700; font-size: 12px; color: #ebebea59; }
  .s-name { font-family: var(--display); font-weight: 700; font-stretch: 100%; font-size: 19px; }
  .track button:hover, .track button.on { color: var(--paper); }
  .track button.on { background: linear-gradient(90deg, transparent 60px, #ffffff08); }

  /* Showroom */
  .showroom { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: clamp(18px, 2.4vw, 32px); animation: arrive .45s var(--ease) both; }
  @keyframes arrive { from { opacity: 0; transform: translateX(14px); } }
  .shot { position: relative; display: block; align-self: start; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 3px; background: var(--asphalt-2); }
  .shot :global(img) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  /* The gear number, as on a dash gear indicator. */
  .gear-big { position: absolute; right: 16px; bottom: 6px; font-family: var(--display); font-weight: 800; font-stretch: 112%; font-size: clamp(80px, 9vw, 140px); line-height: 1; color: transparent; -webkit-text-stroke: 2px #ffffffb3; text-shadow: 0 0 24px #0008; pointer-events: none; }
  .sheet { display: grid; align-content: start; gap: 16px; }
  .name { font-family: var(--display); font-weight: 800; font-stretch: 100%; font-size: clamp(36px, 4vw, 60px); line-height: 1; }
  .lead-s { color: var(--concrete); font-size: 16px; }
  .traits { display: grid; border-top: 1px solid var(--rule); }
  .traits > div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 12px; padding: 10px 0; border-bottom: 1px dashed #ebebea1f; }
  .traits dt { font-family: var(--display); font-weight: 600; font-stretch: 112%; font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--concrete); padding-top: 3px; }
  .traits dd { font-size: 15px; line-height: 1.4; }
  .foot { display: grid; gap: 14px; justify-items: start; margin-top: 4px; }
  .own { font-family: var(--display); font-weight: 650; font-size: 15px; color: var(--signal); }
  .foot .btn :global(svg) { margin-left: 2px; }
  .credit { font-size: 12px; }

  @media (max-width: 1100px) {
    .showroom { grid-template-columns: 1fr; }
  }
  @media (max-width: 900px) {
    .intro { grid-template-columns: 1fr; }
    .shifter { grid-template-columns: 1fr; }
    /* Phones: the track turns into a row of gears. */
    .track { --step: auto; display: flex; overflow-x: auto; gap: 6px; padding: 6px; scrollbar-width: none; }
    .rail, .knob { display: none; }
    .track button { flex: none; gap: 8px; padding: 10px 14px; border-radius: 3px; border: 1px solid var(--rule); }
    .track button.on { background: var(--signal); border-color: var(--signal); color: #fff; }
    .track button.on .notch { color: #fff; }
    .notch { width: auto; }
    .s-name { font-size: 15px; }
  }
</style>
