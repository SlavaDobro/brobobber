<script>
  import { base } from '$app/paths'
  // Services on a real Sportster, drawn like a parts poster: small dots on the parts, short thin
  // leaders to labels on the wall and the floor. Hovering a dot or a label opens a short
  // description beside the label; every label is a link to the service page. Phones get numbered dots
  // and a card under the photo instead of labels.
  import { ArrowRight, GraduationCap, PackagePlus, Truck } from '@lucide/svelte'
  import { services } from './data.js'

  /** @type {Record<string, typeof Truck>} */
  const icons = { kursy: GraduationCap, dopolnitelnye: PackagePlus, motoevakuator: Truck }
  const photo = '/images/photos/poster/sportster'

  const spotted = services.filter(s => s.spot)
  const rest = services.filter(s => !s.spot)
  /** Hovered or focused service; -1 shows the poster at rest. */
  let active = $state(-1)
  /** Phones: the service picked by tap, shown in the card under the photo. */
  let picked = $state(0)
  let current = $derived(spotted[picked])
  const pick = (/** @type {number} */ i) => { active = i; picked = i }
  // Coordinates are percent of the frame; the SVG uses a 100 × 75 box (4:3 photo).
  const k = .75
</script>

<div class="bike-map">
  <div class="poster" role="group" aria-label="Услуги на мотоцикле" onmouseleave={() => active = -1}>
    <picture>
      <img src="{base}{photo}-1600.webp" srcset="{base}{photo}-800.webp 800w, {base}{photo}-1600.webp 1280w" sizes="(max-width: 1168px) 100vw, 1120px"
        alt="Harley-Davidson Sportster в стиле боббер с надписями BROBOBBER на шинах и отмеченными узлами" width="1280" height="960" loading="lazy" decoding="async" />
    </picture>
    <svg class="leaders" viewBox="0 0 100 75" preserveAspectRatio="none" aria-hidden="true">
      {#each spotted as service, i}
        {@const [x, y, lx, ly] = service.spot ?? [0, 0, 0, 0]}
        <line x1={x} y1={y * k} x2={lx} y2={ly * k} class:on={active === i} />
      {/each}
    </svg>
    {#each spotted as service, i}
      {@const [x, y, lx, ly, side] = service.spot ?? [0, 0, 0, 0, 't']}
      <button class="dot" class:on={active === i} style={`left:${x}%;top:${y}%`} aria-label={service.name}
        onmouseenter={() => active = i} onfocus={() => active = i} onclick={() => pick(i)}>
        <span>{i + 1}</span>
      </button>
      <div class={`pin ${side}`} class:on={active === i} style={`left:${lx}%;top:${ly}%`}>
        <a class="tag" class:up={ly > 50} class:flip={lx > 62} href={`${base}/uslugi/${service.slug}`}
          onmouseenter={() => active = i} onfocus={() => active = i}>
          <span class="tag-name"><b>{String(i + 1).padStart(2, '0')}</b><span>{service.pin ?? service.name}</span></span>
          <span class="card" aria-hidden={active !== i}>
            <strong>{service.name}</strong>
            <small>{service.short}</small>
            <em>Подробнее <ArrowRight size={14} /></em>
          </span>
        </a>
      </div>
    {/each}
  </div>

  <!-- Phones: no hover and no room for labels, so the tapped service shows as a card. -->
  {#key picked}
    <div class="tap-card" aria-live="polite">
      <span class="tap-num">{String(picked + 1).padStart(2, '0')}</span>
      <div><strong>{current.name}</strong><p>{current.short}</p></div>
      <a class="btn btn-line" href={`${base}/uslugi/${current.slug}`}>Подробнее</a>
    </div>
  {/key}
  <ol class="list" aria-label="Услуги">
    {#each spotted as service, i}
      <li><a href={`${base}/uslugi/${service.slug}`}><span class="num">{String(i + 1).padStart(2, '0')}</span>{service.name}</a></li>
    {/each}
  </ol>

  <ul class="extra" aria-label="Другие услуги">
    {#each rest as service}
      {@const Icon = icons[service.slug] ?? ArrowRight}
      <li>
        <a href={`${base}/uslugi/${service.slug}`}>
          <span class="extra-icon"><Icon size={21} /></span>
          <span class="extra-text"><strong>{service.name}</strong><small>{service.short}</small></span>
          <ArrowRight class="extra-arrow" size={18} />
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .bike-map { display: grid; gap: 14px; }
  .poster { position: relative; width: min(100%, 1120px); justify-self: center; aspect-ratio: 4 / 3; container-type: inline-size; }
  .poster picture, .poster img { width: 100%; height: 100%; }
  /* Monochrome and contrast like the rest of the photos; the edges sink into the page. */
  .poster img { object-fit: cover; filter: grayscale(1) contrast(1.04);
    --fade-x: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent); --fade-y: linear-gradient(180deg, transparent, #000 6%, #000 88%, transparent);
    -webkit-mask: var(--fade-x), var(--fade-y); -webkit-mask-composite: source-in; mask: var(--fade-x), var(--fade-y); mask-composite: intersect; }
  .poster::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, transparent 72%, #131313b3 100%); }

  .leaders { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 1; }
  .leaders line { stroke: #ebebea8c; stroke-width: 1; vector-effect: non-scaling-stroke; transition: stroke .2s; }
  .leaders line.on { stroke: var(--signal); stroke-width: 1.5; }

  .dot { position: absolute; z-index: 2; width: 28px; height: 28px; margin: -14px 0 0 -14px; display: grid; place-items: center; border-radius: 50%; }
  .dot span { width: 10px; height: 10px; border-radius: 50%; background: var(--paper); box-shadow: 0 0 0 3px #13131399, 0 0 0 4px #ebebea55; font-size: 0; transition: transform .2s var(--ease), background-color .2s; }
  .dot.on span, .dot:hover span { background: var(--signal); transform: scale(1.35); }

  /* Labels like a parts poster: black plate, thin light frame, short leader into the middle of an edge. */
  .pin { position: absolute; z-index: 3; width: 0; height: 0; }
  .pin.on { z-index: 5; }
  .tag { position: absolute; display: block; width: max-content; max-width: 15em; padding: 6px 10px 7px; background: #0b0b0bf0; border: 1px solid #ebebeacc; border-radius: 2px; color: var(--paper);
    font-family: var(--display); font-weight: 650; font-stretch: 104%; font-size: clamp(10.5px, 1.12cqw, 13.5px); line-height: 1.2; letter-spacing: .05em; text-transform: uppercase; transition: border-color .2s; }
  .t .tag { left: 0; bottom: 0; transform: translateX(-50%); }
  .b .tag { left: 0; top: 0; transform: translateX(-50%); }
  .l .tag { right: 0; top: 0; transform: translateY(-50%); }
  .r .tag { left: 0; top: 0; transform: translateY(-50%); }
  .tag-name { display: flex; gap: 7px; align-items: baseline; }
  .tag-name b { flex: none; color: var(--concrete); font-weight: 600; font-size: .85em; font-variant-numeric: tabular-nums; }
  .pin.on .tag { border-color: var(--signal); }
  .pin.on .tag-name b { color: var(--signal); }
  /* The description opens beside the label, towards the middle of the photo. */
  .card { position: absolute; top: calc(100% + 6px); left: -1px; width: min(250px, 30cqw); display: grid; gap: 6px; padding: 12px 14px; background: #0b0b0bf5; border: 1px solid var(--rule); border-left: 2px solid var(--signal); border-radius: 2px;
    font-family: var(--text); font-weight: 400; font-stretch: 100%; letter-spacing: 0; text-transform: none; line-height: 1.35;
    opacity: 0; visibility: hidden; transform: translateY(-4px); transition: opacity .2s, transform .2s var(--ease), visibility 0s .2s; }
  .tag.up .card { top: auto; bottom: calc(100% + 6px); transform: translateY(4px); }
  .tag.flip .card { left: auto; right: -1px; }
  .card strong { font-family: var(--display); font-weight: 650; font-size: 15px; }
  .card small { font-size: 13px; color: var(--concrete); }
  .card em { display: inline-flex; gap: 6px; align-items: center; font-style: normal; font-size: 13px; color: var(--paper); }
  .pin.on .card { opacity: 1; visibility: visible; transform: none; transition: opacity .2s, transform .2s var(--ease); }

  .list { display: none; }
  .num { font-family: var(--display); font-stretch: 104%; font-size: 13px; color: var(--concrete); font-variant-numeric: tabular-nums; }
  .tap-card { display: none; }

  .extra { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-top: 22px; }
  .extra a { display: grid; grid-template-columns: 46px minmax(0, 1fr) 18px; gap: 14px; align-items: center; height: 100%; padding: 15px 16px; background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 6px; color: var(--paper); transition: background-color .22s, color .22s, border-color .22s, transform .22s var(--ease); }
  .extra-icon { width: 46px; height: 46px; display: grid; place-items: center; border-radius: 50%; background: var(--asphalt-3); color: var(--paper); transition: background-color .22s, color .22s; }
  .extra-text { display: grid; gap: 2px; min-width: 0; }
  .extra-text strong { font-family: var(--display); font-stretch: 100%; font-weight: 650; font-size: 18px; line-height: 1.15; }
  .extra-text small { font-size: 13px; line-height: 1.3; color: var(--concrete); }
  .extra a :global(.extra-arrow) { color: var(--concrete); transition: color .22s, transform .22s var(--ease); }
  .extra a:hover { border-color: var(--signal); transform: translateY(-2px); }
  .extra a:hover .extra-icon { background: var(--signal); color: #fff; }
  .extra a:hover :global(.extra-arrow) { color: var(--signal); transform: translateX(3px); }

  @media (max-width: 960px) {
    .leaders, .pin { display: none; }
    .dot { width: 40px; height: 40px; margin: -20px 0 0 -20px; }
    .dot span { width: 22px; height: 22px; display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--asphalt); }
    .dot.on span, .dot:hover span { color: #fff; transform: scale(1.1); }
    .tap-card { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; align-items: start; padding: 16px; background: var(--asphalt-2); border: 1px solid var(--rule); border-left: 2px solid var(--signal); border-radius: 6px; animation: show .3s var(--ease) both; }
    .tap-card strong { font-family: var(--display); font-stretch: 100%; font-size: 19px; }
    .tap-card p { font-size: 14px; color: var(--concrete); margin-top: 2px; }
    .tap-num { font-family: var(--display); color: var(--signal); font-size: 22px; line-height: 1.1; }
    .tap-card .btn { grid-column: 1 / -1; height: 44px; }
    .list { display: grid; gap: 2px; }
    .list a { display: flex; gap: 12px; align-items: baseline; padding: 9px 0; border-bottom: 1px solid var(--rule); color: var(--concrete); }
  }
  @keyframes show { from { opacity: 0; transform: translateY(6px); } }
</style>
