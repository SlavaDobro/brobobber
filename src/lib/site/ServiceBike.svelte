<script>
  import { base } from '$app/paths'
  // Services on a real Sportster, drawn like a parts poster: small dots on the parts, thin leader
  // lines out to labels on the wall and the floor. Hovering a dot or a label opens the label into
  // a short description; every label is a link to the service page. Phones get numbered dots
  // and a card under the photo instead of labels.
  import { ArrowRight, GraduationCap, PackagePlus, Truck } from '@lucide/svelte'
  import { services } from './data.js'

  /** @type {Record<string, typeof Truck>} */
  const icons = { kursy: GraduationCap, dopolnitelnye: PackagePlus, motoevakuator: Truck }
  const photo = '/images/photos/tg-453/03'

  const spotted = services.filter(s => s.spot)
  const rest = services.filter(s => !s.spot)
  /** Hovered or focused service; -1 shows the poster at rest. */
  let active = $state(-1)
  /** Phones: the service picked by tap, shown in the card under the photo. */
  let picked = $state(0)
  let current = $derived(spotted[picked])
  const pick = (/** @type {number} */ i) => { active = i; picked = i }
  // Label y-coordinates are percent of height; the SVG uses a 100 × 75 box (4:3 photo).
  const k = .75
</script>

<div class="bike-map">
  <div class="poster" role="group" aria-label="Услуги на мотоцикле" onmouseleave={() => active = -1}>
    <picture>
      <img src="{base}{photo}-800.webp" alt="Harley-Davidson Sportster 1200 из мастерской с отмеченными узлами" width="800" height="600" loading="lazy" decoding="async" />
    </picture>
    <svg class="leaders" viewBox="0 0 100 75" preserveAspectRatio="none" aria-hidden="true">
      {#each spotted as service, i}
        {@const [x, y, lx, ly] = service.spot ?? [0, 0, 0, 0]}
        <line x1={x} y1={y * k} x2={lx} y2={ly * k} class:on={active === i} />
      {/each}
    </svg>
    {#each spotted as service, i}
      {@const [x, y, lx, ly, align] = service.spot ?? [0, 0, 0, 0, 'c']}
      <button class="dot" class:on={active === i} style={`left:${x}%;top:${y}%`} aria-label={service.name}
        onmouseenter={() => active = i} onfocus={() => active = i} onclick={() => pick(i)}>
        <span>{i + 1}</span>
      </button>
      <a class={`tag ${align}`} class:low={ly > 60} class:on={active === i} style={`left:${lx}%;top:${ly}%`}
        href={`${base}/uslugi/${service.slug}`} onmouseenter={() => active = i} onfocus={() => active = i}>
        <span class="tag-name"><b>{String(i + 1).padStart(2, '0')}</b>{service.name}</span>
        <span class="tag-more"><span><small>{service.short}</small><em>Подробнее <ArrowRight size={14} /></em></span></span>
      </a>
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
  .poster img { object-fit: cover; filter: grayscale(1) contrast(1.12) brightness(.92);
    --fade-x: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent); --fade-y: linear-gradient(180deg, transparent, #000 7%, #000 86%, transparent);
    -webkit-mask: var(--fade-x), var(--fade-y); -webkit-mask-composite: source-in; mask: var(--fade-x), var(--fade-y); mask-composite: intersect; }
  .poster::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, transparent 72%, #131313b3 100%); }

  .leaders { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 1; }
  .leaders line { stroke: #ebebea8c; stroke-width: 1; vector-effect: non-scaling-stroke; transition: stroke .2s; }
  .leaders line.on { stroke: var(--signal); stroke-width: 1.5; }

  .dot { position: absolute; z-index: 2; width: 28px; height: 28px; margin: -14px 0 0 -14px; display: grid; place-items: center; border-radius: 50%; }
  .dot span { width: 10px; height: 10px; border-radius: 50%; background: var(--paper); box-shadow: 0 0 0 3px #13131399, 0 0 0 4px #ebebea55; font-size: 0; transition: transform .2s var(--ease), background-color .2s; }
  .dot.on span, .dot:hover span { background: var(--signal); transform: scale(1.35); }

  .tag { position: absolute; z-index: 3; display: grid; max-width: 26cqw; padding: 6px 10px; background: #131313e0; border: 1px solid var(--rule); border-radius: 3px; color: var(--paper);
    transform: translate(-50%, -100%); transition: border-color .2s, background-color .2s; }
  .tag.l { transform: translate(0, -100%); }
  .tag.r { transform: translate(-100%, -100%); }
  .tag.low { transform: translate(-50%, 0); }
  .tag.low.l { transform: translate(0, 0); }
  .tag.low.r { transform: translate(-100%, 0); }
  .tag-name { display: flex; gap: 8px; align-items: baseline; white-space: nowrap; font-family: var(--display); font-weight: 650; font-stretch: 104%; font-size: clamp(11px, 1.15cqw, 14px); letter-spacing: .04em; text-transform: uppercase; }
  .tag-name b { color: var(--concrete); font-weight: 600; font-variant-numeric: tabular-nums; }
  /* The description unfolds under the name (above it for floor labels). */
  .tag-more { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s var(--ease); }
  .tag-more > span { overflow: hidden; display: grid; gap: 6px; min-width: 0; }
  .tag-more small { padding-top: 6px; width: 0; max-width: min(240px, 26cqw); font-size: 13px; line-height: 1.35; color: var(--concrete); white-space: normal; }
  .tag-more em { display: inline-flex; gap: 6px; align-items: center; font-style: normal; font-size: 13px; color: var(--paper); }
  .tag.low .tag-more { order: -1; }
  .tag.low .tag-more small { padding: 0; }
  .tag.low .tag-more em { padding-bottom: 6px; }
  .tag.on { z-index: 4; border-color: var(--signal); background: #131313f5; }
  .tag.on .tag-name b { color: var(--signal); }
  .tag.on .tag-more { grid-template-rows: 1fr; }
  .tag.on .tag-more small { width: max-content; }

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
    .leaders, .tag { display: none; }
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
