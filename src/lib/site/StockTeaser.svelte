<script>
  // Home: the bikes for sale as a little showroom. Each photo carries a card price tag on a string,
  // the kind a workshop hangs on a mirror: punched hole, price, year and mileage. The last tile
  // offers to find a bike on the market when none of these fit.
  import { base } from '$app/paths'
  import { ArrowRight, Send } from '@lucide/svelte'
  import Photo from './Photo.svelte'
  import { contacts } from './data.js'
  import { stock } from './stock.js'

  const live = stock.filter(bike => bike.active)
  const shown = live.slice(0, 3)
  const kinds = { project: 'Готовый проект', donor: 'Донор под проект' }
  const money = (/** @type {number} */ n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'
  const km = (/** @type {number} */ n) => n.toLocaleString('ru-RU') + ' км'
</script>

<ul class="showroom">
  {#each shown as bike, i}
    <li>
      <a class="bike" href="{base}/v-nalichii" style={`--swing:${[-7, 5, -4][i % 3]}deg`}>
        <span class="shot"><Photo base={bike.photos[0]} alt={bike.name} sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 26vw" cover /></span>
        <span class="hang" aria-hidden="true">
          <span class="tag">
            <span class="hole"></span>
            <small>{kinds[bike.kind]}</small>
            <strong>{money(bike.price)}</strong>
            <span class="specs">{bike.year}{#if bike.km} · {km(bike.km)}{/if}</span>
          </span>
        </span>
        <span class="name">{bike.name}</span>
        <span class="sr-only">{kinds[bike.kind]}, {money(bike.price)}, {bike.year} год</span>
      </a>
    </li>
  {/each}
  <li class="more">
    <div class="more-in">
      <span class="count"><b>{live.length}</b> в наличии</span>
      <p>Не нашли свой? Подберём мотоцикл на рынке под ваш проект.</p>
      <a class="btn btn-signal" href="{base}/v-nalichii">Все мотоциклы <ArrowRight size={17} /></a>
      <a class="link-steel" href={contacts.channel.href} target="_blank" rel="noopener"><Send size={14} /> Новые — в {contacts.channel.handle}</a>
    </div>
  </li>
</ul>

<style>
  .showroom { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, .85fr); gap: 16px; }
  .bike { position: relative; display: grid; gap: 12px; }
  .shot { display: block; aspect-ratio: 4 / 5; overflow: hidden; border-radius: 3px; background: var(--asphalt-2); }
  .shot :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform .6s var(--ease), filter .5s var(--ease); }
  .bike:hover .shot :global(img) { transform: scale(1.04); }
  .name { font-family: var(--display); font-weight: 650; font-stretch: 100%; font-size: 18px; line-height: 1.2; }

  /* The price tag hangs from a string over the top edge and swings a little on hover. */
  .hang { position: absolute; top: 26px; right: 16px; transform-origin: 50% -26px; transform: rotate(var(--swing)); transition: transform .6s cubic-bezier(.3, 1.6, .5, 1); }
  .hang::before { content: ''; position: absolute; left: 50%; top: -26px; width: 1px; height: 38px; background: #ebebeab3; }
  .tag { position: relative; display: grid; gap: 2px; padding: 22px 14px 12px; min-width: 128px;
    background: linear-gradient(170deg, #f1efe9, #dedbd3); color: #141414; border-radius: 3px;
    clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%, 0 16px);
    filter: drop-shadow(0 8px 10px #000a); }
  .hole { position: absolute; left: 50%; top: 8px; width: 9px; height: 9px; margin-left: -4.5px; border-radius: 50%; background: #131313; box-shadow: inset 0 1px 2px #000, 0 0 0 2px #c9c5bb; }
  .tag small { font-family: var(--display); font-weight: 700; font-stretch: 108%; font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--signal); }
  .tag strong { font-family: var(--display); font-weight: 800; font-stretch: 104%; font-size: 21px; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .specs { font-size: 12.5px; color: #4a4a4a; font-variant-numeric: tabular-nums; }
  .bike:hover .hang { transform: rotate(calc(var(--swing) * -.6)); }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  /* The last tile: a plain plate with the count and the way to the full list. */
  .more { display: flex; min-width: 0; }
  .more-in { flex: 1; display: grid; align-content: end; justify-items: start; gap: 16px; padding: 26px 24px; min-width: 0;
    background: repeating-linear-gradient(135deg, #ffffff06 0 10px, transparent 10px 20px), #171717; border: 1px solid var(--rule); border-radius: 3px; }
  .count { font-family: var(--display); font-weight: 650; font-stretch: 104%; font-size: 15px; letter-spacing: .06em; text-transform: uppercase; color: var(--concrete); }
  .count b { display: block; font-size: clamp(64px, 6vw, 96px); line-height: .9; color: var(--paper); letter-spacing: -.02em; }
  .more p { color: var(--concrete); font-size: 15px; max-width: 24ch; }
  .more .btn :global(svg) { margin-left: 2px; }
  .more .link-steel { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }

  @media (max-width: 1100px) {
    .showroom { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .more-in { min-height: 100%; }
  }
  @media (max-width: 640px) {
    .showroom { grid-template-columns: 1fr; gap: 28px; }
    .shot { aspect-ratio: 4 / 3; }
    .more-in { aspect-ratio: auto; }
    .tag { min-width: 116px; }
  }
</style>
