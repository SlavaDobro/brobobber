<script>
  // Home: the bikes for sale as a little showroom. Each photo carries a card price tag on a string,
  // the kind a workshop hangs on a mirror: punched hole, price, year and mileage. The last tile
  // offers to find a bike on the market when none of these fit.
  import { base } from '$app/paths'
  import { ArrowRight, Send } from '@lucide/svelte'
  import Photo from './Photo.svelte'
  import PriceTag from './PriceTag.svelte'
  import { contacts } from './data.js'
  import { stock } from './stock.js'

  const live = stock.filter(bike => bike.active)
  const shown = live.slice(0, 3)
  const kinds = { project: 'Готовый проект', donor: 'Донор под проект' }
  const money = (/** @type {number} */ n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'
</script>

<ul class="showroom">
  {#each shown as bike, i}
    <li>
      <a class="bike tag-host" href="{base}/v-nalichii">
        <span class="shot"><Photo base={bike.photos[0]} alt={bike.name} sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 26vw" cover /></span>
        <PriceTag kind={kinds[bike.kind]} price={bike.price} year={bike.year} km={bike.km} swing={[-7, 5, -4][i % 3]} />
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
  }
</style>
