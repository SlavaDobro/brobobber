<script>
  import { base } from '$app/paths'
  // Services as a drawing: points on the motorcycle's parts. Hovering a point or a list item
  // draws a leader line from the part to a callout with the service.
  import { ArrowRight, GraduationCap, PackagePlus, Truck } from '@lucide/svelte'
  import { services } from './data.js'

  /** @type {Record<string, typeof Truck>} */
  const icons = { kursy: GraduationCap, dopolnitelnye: PackagePlus, motoevakuator: Truck }

  const spotted = services.filter(s => s.spot)
  const rest = services.filter(s => !s.spot)
  let active = $state(0)
  let current = $derived(spotted[active])
  // Callouts open upwards from low parts and downwards from high ones.
  let up = $derived((current?.spot?.[1] ?? 0) > 45)
  let leftSide = $derived((current?.spot?.[0] ?? 0) > 60)
</script>

<div class="bike-map">
  <ol class="list" aria-label="Услуги на мотоцикле">
    {#each spotted as service, i}
      <li>
        <a href={`${base}/uslugi/${service.slug}`} class:active={active === i}
          onmouseenter={() => active = i} onfocus={() => active = i}>
          <span class="num">{String(i + 1).padStart(2, '0')}</span>{service.name}
        </a>
      </li>
    {/each}
  </ol>

  <div class="drawing">
    <img src="{base}/images/vrod/right-site.webp" srcset="{base}/images/vrod/right-site-800.webp 800w, {base}/images/vrod/right-site.webp 1536w" sizes="(max-width: 960px) 100vw, 70vw" alt="Мотоцикл с отмеченными узлами, к которым относятся услуги" width="1536" height="1024" loading="lazy" decoding="async" />
    {#each spotted as service, i}
      <button class="spot" class:active={active === i} style={`left:${service.spot?.[0]}%;top:${service.spot?.[1]}%`}
        aria-label={service.name} onmouseenter={() => active = i} onfocus={() => active = i} onclick={() => active = i}>
        <span>{i + 1}</span>
      </button>
    {/each}
    {#key active}
      <div class="callout" class:up class:left-side={leftSide} style={`left:${current.spot?.[0]}%;top:${current.spot?.[1]}%`}>
        <span class="leader"></span>
        <div class="card">
          <strong>{current.name}</strong>
          <p>{current.short}</p>
          <a class="link-brass" href={`${base}/uslugi/${current.slug}`}>Подробнее об услуге</a>
        </div>
      </div>
    {/key}
  </div>

  <!-- Phones: no hover, so the chosen service shows as a card under the bike. -->
  {#key active}
    <div class="tap-card" aria-live="polite">
      <span class="tap-num">{String(active + 1).padStart(2, '0')}</span>
      <div><strong>{current.name}</strong><p>{current.short}</p></div>
      <a class="btn btn-line" href={`${base}/uslugi/${current.slug}`}>Подробнее</a>
    </div>
  {/key}

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
  .bike-map { display: grid; grid-template-columns: minmax(200px, 260px) minmax(0, 1fr); grid-template-areas: 'list drawing' 'extra extra'; gap: 12px 48px; align-items: start; }
  .list { grid-area: list; display: grid; gap: 2px; counter-reset: s; }
  .list a { display: flex; gap: 12px; align-items: baseline; padding: 9px 0; border-bottom: 1px solid var(--rule); color: var(--concrete); transition: color .2s; }
  .list a.active, .list a:hover { color: var(--paper); }
  .num { font-family: var(--display); font-stretch: 85%; font-size: 13px; color: var(--brass); font-variant-numeric: tabular-nums; }
  .extra { grid-area: extra; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-top: 22px; }
  .extra a { display: grid; grid-template-columns: 46px minmax(0, 1fr) 18px; gap: 14px; align-items: center; height: 100%; padding: 15px 16px; background: var(--asphalt-2); border: 1px solid var(--brass); border-radius: 6px; color: var(--paper); transition: background-color .22s, color .22s, transform .22s var(--ease); }
  .extra-icon { width: 46px; height: 46px; display: grid; place-items: center; border-radius: 50%; background: var(--brass); color: var(--asphalt); transition: background-color .22s, color .22s; }
  .extra-text { display: grid; gap: 2px; min-width: 0; }
  .extra-text strong { font-family: var(--display); font-stretch: 88%; font-weight: 600; font-size: 18px; line-height: 1.15; }
  .extra-text small { font-size: 13px; line-height: 1.3; color: var(--concrete); transition: color .22s; }
  .extra a :global(.extra-arrow) { color: var(--brass); transition: color .22s, transform .22s var(--ease); }
  .extra a:hover { background: var(--brass); color: var(--asphalt); transform: translateY(-2px); }
  .extra a:hover .extra-icon { background: var(--asphalt); color: var(--brass); }
  .extra a:hover .extra-text small { color: #1c1d1bcc; }
  .extra a:hover :global(.extra-arrow) { color: var(--asphalt); transform: translateX(3px); }
  .drawing { grid-area: drawing; position: relative; align-self: center;
    background: radial-gradient(ellipse 55% 45% at 50% 55%, #ece8df12, transparent 70%); }
  .drawing img { width: 100%; height: auto; filter: drop-shadow(0 30px 40px #0009); }
  .spot { position: absolute; width: 34px; height: 34px; margin: -17px 0 0 -17px; display: grid; place-items: center; border-radius: 50%; }
  .spot span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: #121311f0; border: 2px solid var(--brass); color: var(--paper); font-size: 12px; font-weight: 700; box-shadow: 0 0 0 3px #ece8df26, 0 4px 12px #000a; transition: transform .25s var(--ease), background-color .25s; }
  .spot.active span, .spot:hover span { background: var(--brass); color: var(--asphalt); transform: scale(1.15); }
  .spot.active::before { content: ''; position: absolute; inset: 2px; border-radius: 50%; border: 1px solid var(--brass); animation: ping 1.6s var(--ease) infinite; }
  @keyframes ping { from { transform: scale(.8); opacity: 1; } to { transform: scale(2.2); opacity: 0; } }
  .callout { position: absolute; z-index: 2; pointer-events: none; }
  .leader { position: absolute; left: 0; top: 14px; width: 1px; height: 64px; background: var(--brass); transform-origin: top; animation: draw .35s var(--ease) both; }
  .callout.up .leader { top: auto; bottom: 14px; transform-origin: bottom; }
  .card { position: absolute; top: 78px; left: -14px; width: min(270px, 60vw); padding: 14px 16px; background: var(--asphalt-2); border: 1px solid var(--rule); border-left: 2px solid var(--brass); border-radius: 4px; display: grid; gap: 6px; pointer-events: auto; animation: show .3s .2s var(--ease) both; }
  .callout.up .card { top: auto; bottom: 78px; }
  .callout.left-side .card { left: auto; right: -14px; }
  .card strong { font-family: var(--display); font-stretch: 88%; font-size: 18px; }
  .card p { font-size: 14px; color: var(--concrete); }
  .card a { justify-self: start; font-size: 14px; }
  @keyframes draw { from { transform: scaleY(0); } }
  @keyframes show { from { opacity: 0; transform: translateY(6px); } }
  .tap-card { display: none; }
  @media (max-width: 960px) {
    .tap-card { grid-area: tap; display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; align-items: start; padding: 16px; background: var(--asphalt-2); border: 1px solid var(--rule); border-left: 2px solid var(--brass); border-radius: 6px; animation: show .3s var(--ease) both; }
    .tap-card strong { font-family: var(--display); font-stretch: 88%; font-size: 19px; }
    .tap-card p { font-size: 14px; color: var(--concrete); margin-top: 2px; }
    .tap-num { font-family: var(--display); color: var(--brass); font-size: 22px; line-height: 1.1; }
    .tap-card .btn { grid-column: 1 / -1; height: 44px; }
    .spot { width: 40px; height: 40px; margin: -20px 0 0 -20px; }
    .bike-map { grid-template-columns: 1fr; grid-template-areas: 'drawing' 'tap' 'list' 'extra'; }
    .callout { display: none; }
  }
</style>
