<script>
  // Bikes for sale, laid out like the workshop's own garage: an inventory board up top, then every
  // bike as a lot with a price tag on its photo, a strip of frames, an instrument row with year,
  // mileage and price, and a checklist of what the workshop did to it.
  import { base } from '$app/paths'
  import Photo from '$lib/site/Photo.svelte'
  import PriceTag from '$lib/site/PriceTag.svelte'
  import Odometer from '$lib/site/Odometer.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { ArrowUpRight, Check, Send } from '@lucide/svelte'
  import { contacts, plural } from '$lib/site/data.js'
  import { stock } from '$lib/site/stock.js'
  import { stockFaq } from '$lib/site/faq.js'

  const kinds = { project: 'Готовый проект', donor: 'Донор под проект' }
  const live = stock.filter(bike => bike.active)
  const count = (/** @type {string} */ k) => live.filter(bike => bike.kind === k).length
  const latest = live.map(bike => bike.date).sort().at(-1)
  let kind = $state('')
  let shown = $derived(live.filter(bike => !kind || bike.kind === kind))
  /** @type {Record<string, number>} */
  let frame = $state({})

  const money = (/** @type {number} */ n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'
  const day = (/** @type {string} */ d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const hex = '5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96'
</script>

<svelte:head>
  <title>Мотоциклы в наличии — Brobobber</title>
  <meta name="description" content="Кастомные мотоциклы и доноры под проект, которые можно купить в мастерской Brobobber в Москве: фото, пробег, цена и список работ." />
</svelte:head>

<section class="garage">
  <div class="wrap garage-grid">
    <div class="copy">
      <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span></nav>
      <h1 class="h1">Мотоциклы в наличии</h1>
      <p class="lead">Готовые проекты, на которых можно сразу ехать, и мотоциклы-доноры под ваш будущий кастом. Берёте донора под постройку у нас — предложим хорошую цену на работы.</p>
      <div class="actions">
        <a class="btn btn-signal" href="#zayavka">Спросить о мотоцикле</a>
        <a class="btn btn-line" href={contacts.channel.href} target="_blank" rel="noopener"><Send size={16} />Telegram-канал</a>
      </div>
    </div>

    <!-- Inventory board on the garage wall. -->
    <aside class="board" aria-label="Сейчас в гараже">
      <span class="rivets" aria-hidden="true"></span>
      <span class="board-title">Гараж · учёт</span>
      <Odometer value={String(live.length).padStart(2, '0')} label={plural(live.length, ['мотоцикл в наличии', 'мотоцикла в наличии', 'мотоциклов в наличии'])} />
      <ul class="tally">
        <li><span class="dot"></span>Готовые проекты<b>{count('project')}</b></li>
        <li><span class="dot donor"></span>Доноры под проект<b>{count('donor')}</b></li>
      </ul>
      {#if latest}<span class="updated">Обновлено {day(latest)}</span>{/if}
    </aside>
  </div>
</section>

<section class="section lots-section">
  <div class="wrap">
    {#if live.length}
      <div class="switch" role="group" aria-label="Тип">
        <button class:on={!kind} aria-pressed={!kind} onclick={() => kind = ''}>Все<i>{live.length}</i></button>
        {#each Object.entries(kinds) as [key, label]}
          {#if count(key)}<button class:on={kind === key} aria-pressed={kind === key} onclick={() => kind = kind === key ? '' : key}>{label}<i>{count(key)}</i></button>{/if}
        {/each}
      </div>

      <ol class="lots">
        {#each shown as bike, i (bike.slug)}
          {@const n = frame[bike.slug] ?? 0}
          <li class="lot" class:flip={i % 2 === 1}>
            <div class="gallery">
              <div class="shot tag-host">
                <Photo base={bike.photos[n]} alt={`${bike.name}, фото ${n + 1}`} sizes="(max-width: 900px) 100vw, 46vw" />
                <PriceTag kind={kinds[bike.kind]} price={bike.price} year={bike.year} km={bike.km} swing={i % 2 ? 5 : -6} size="l" />
              </div>
              {#if bike.photos.length > 1}
                <div class="frames" role="group" aria-label="Фото">
                  {#each bike.photos as photo, j}
                    <button class:on={j === n} aria-label={`Фото ${j + 1}`} aria-pressed={j === n} onclick={() => frame[bike.slug] = j}><Photo base={photo} sizes="110px" cover /></button>
                  {/each}
                </div>
              {/if}
            </div>

            <div class="sheet">
              <div class="sheet-top">
                <span class="lotno">Лот <b>{String(live.indexOf(bike) + 1).padStart(2, '0')}</b></span>
                <span class="kind" class:donor={bike.kind === 'donor'}>{kinds[bike.kind]}</span>
              </div>
              <h2 class="name">{bike.name}</h2>
              <p class="text">{bike.text}</p>
              <dl class="dash">
                <div><dt>Год</dt><dd>{bike.year}</dd></div>
                <div><dt>Пробег</dt><dd>{bike.km ? bike.km.toLocaleString('ru-RU') : '—'}<small>{bike.km ? 'км' : ''}</small></dd></div>
                <div class="price"><dt>Цена</dt><dd>{money(bike.price)}</dd></div>
              </dl>
              {#if bike.works.length}
                <div class="works">
                  <span class="works-title">{bike.kind === 'donor' ? 'Что важно' : 'Сделано в мастерской'}</span>
                  <ul>
                    {#each bike.works as work}
                      <li><span class="nut" aria-hidden="true"><svg viewBox="-12 -12 24 24"><polygon points={hex} /></svg><Check size={11} strokeWidth={3} /></span>{work}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
              <p class="date">Цена и наличие на {day(bike.date)}. Уточняйте у мастера.</p>
              <div class="actions">
                <a class="btn btn-signal" href="#zayavka">Узнать о мотоцикле</a>
                <a class="link-steel" href={`${contacts.channel.href}/${bike.post}`} target="_blank" rel="noopener">Объявление в канале <ArrowUpRight size={14} /></a>
              </div>
            </div>
          </li>
        {/each}
      </ol>
    {:else}
      <div class="empty">
        <span class="rivets" aria-hidden="true"></span>
        <h2 class="h2">Гараж пока пуст</h2>
        <p class="lead">Новые мотоциклы первыми появляются в нашем Telegram-канале. Или расскажите, что ищете, — подберём на рынке.</p>
        <a class="btn btn-signal" href={contacts.channel.href} target="_blank" rel="noopener">Открыть канал {contacts.channel.handle}</a>
      </div>
    {/if}
  </div>
</section>

<section class="section">
  <div class="wrap two">
    <h2 class="h2">Вопросы о покупке</h2>
    <Faq items={stockFaq} />
  </div>
</section>

<style>
  .actions { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: center; }
  .actions .btn :global(svg) { margin-right: 2px; }
  .actions .link-steel { display: inline-flex; align-items: center; gap: 6px; }
  .rivets { position: absolute; inset: 10px; pointer-events: none;
    background: radial-gradient(circle at 3px 3px, #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at calc(100% - 3px) 3px, #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at 3px calc(100% - 3px), #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at calc(100% - 3px) calc(100% - 3px), #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat; }

  /* Garage: title on the left, the inventory board on the right, over a slatted door. */
  .garage { padding: calc(var(--header) + clamp(40px, 6vw, 88px)) 0 clamp(40px, 5vw, 72px);
    background: repeating-linear-gradient(180deg, #ffffff06 0 1px, transparent 1px 44px), linear-gradient(180deg, #181818, var(--asphalt)); border-bottom: 1px solid var(--rule); }
  .garage-grid { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: clamp(28px, 5vw, 80px); align-items: end; }
  .copy { display: grid; gap: 22px; justify-items: start; container-type: inline-size; }
  .copy .h1 { font-size: clamp(34px, min(6vw, 10.5cqi), 84px); }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); }
  .crumbs a:hover { color: var(--paper); }
  .board { position: relative; display: grid; gap: 18px; padding: 30px 28px 26px; background: linear-gradient(155deg, #1f1f1f, #141414); border: 1px solid var(--rule); border-radius: 3px; box-shadow: 0 24px 40px -28px #000; }
  .board-title { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--signal); }
  .board :global(.value) { font-size: clamp(64px, 7vw, 104px); }
  .tally { display: grid; gap: 2px; border-top: 1px dashed #ebebea26; padding-top: 12px; }
  .tally li { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 15px; color: var(--concrete); }
  .tally b { margin-left: auto; font-family: var(--display); font-weight: 700; font-size: 20px; color: var(--paper); font-variant-numeric: tabular-nums; }
  .dot { width: 10px; height: 10px; clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); background: var(--signal); }
  .dot.donor { background: var(--concrete); }
  .updated { font-size: 12.5px; color: var(--concrete); }

  /* Type switch: a toggle with a red hex on the chosen side. */
  .switch { display: inline-flex; flex-wrap: wrap; gap: 4px; padding: 4px; margin-bottom: clamp(36px, 5vw, 64px); background: #0e0e0e; border: 1px solid var(--rule); border-radius: 4px; }
  .switch button { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 3px; font-family: var(--display); font-weight: 650; font-stretch: 104%; font-size: 14px; color: var(--concrete); transition: background-color .2s, color .2s; }
  .switch button i { font-style: normal; min-width: 22px; padding: 1px 6px; border-radius: 3px; background: #ffffff0f; font-size: 12px; text-align: center; font-variant-numeric: tabular-nums; }
  .switch button:hover { color: var(--paper); }
  .switch button.on { background: var(--paper); color: var(--asphalt); }
  .switch button.on i { background: var(--signal); color: #fff; }

  /* Lots */
  .lots { display: grid; gap: clamp(64px, 8vw, 120px); }
  .lot { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(28px, 5vw, 80px); align-items: center; }
  .lot.flip .gallery { order: 2; }
  .gallery { display: grid; gap: 10px; min-width: 0; }
  .shot { position: relative; aspect-ratio: 4 / 5; border-radius: 3px; overflow: hidden; background: var(--asphalt-2); }
  .shot :global(img) { width: 100%; height: 100%; }
  .frames { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; padding: 8px; background: #0a0a0a; border-radius: 3px; }
  .frames button { aspect-ratio: 1; border-radius: 2px; overflow: hidden; opacity: .5; box-shadow: inset 0 0 0 1px #ebebea1a; transition: opacity .2s, box-shadow .2s; }
  .frames button:hover { opacity: .85; }
  .frames button.on { opacity: 1; box-shadow: 0 0 0 2px var(--signal); }
  .frames :global(img) { width: 100%; height: 100%; object-fit: cover; }

  .sheet { display: grid; gap: 18px; justify-items: start; min-width: 0; }
  .sheet-top { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .lotno { font-family: var(--display); font-weight: 600; font-stretch: 112%; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--concrete); }
  .lotno b { color: var(--paper); margin-left: 4px; }
  .kind { padding: 4px 10px; border: 1.5px solid var(--signal); border-radius: 2px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--signal); transform: rotate(-3deg); }
  .kind.donor { border-color: var(--concrete); color: var(--concrete); }
  .name { font-family: var(--display); font-weight: 700; font-stretch: 96%; font-size: clamp(30px, 3.4vw, 50px); line-height: 1.02; }
  .text { color: var(--concrete); font-size: 17px; max-width: 48ch; }
  /* Instrument row */
  .dash { width: 100%; display: grid; grid-template-columns: auto auto 1fr; background: #0e0e0e; border: 1px solid var(--rule); border-radius: 3px; }
  .dash > div { padding: 14px 20px; display: grid; gap: 4px; }
  .dash > div + div { border-left: 1px solid var(--rule); }
  .dash dt { font-family: var(--display); font-weight: 600; font-stretch: 112%; font-size: 10.5px; letter-spacing: .2em; text-transform: uppercase; color: var(--concrete); }
  .dash dd { font-family: var(--display); font-weight: 700; font-stretch: 104%; font-size: 24px; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .dash dd small { font-size: .55em; color: var(--concrete); margin-left: 5px; font-weight: 600; }
  .dash .price dd { color: var(--paper); }
  .dash .price { background: linear-gradient(90deg, #d23f2a1f, transparent); }
  .works { display: grid; gap: 10px; width: 100%; }
  .works-title { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--signal); }
  .works ul { display: grid; gap: 8px; }
  .works li { display: flex; align-items: center; gap: 12px; font-size: 15.5px; }
  .nut { position: relative; flex: none; width: 22px; height: 22px; display: grid; place-items: center; color: var(--paper); }
  .nut svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .nut polygon { fill: #1c1c1c; stroke: #ebebea4d; stroke-width: 1.4; stroke-linejoin: round; }
  .nut :global(svg.lucide) { position: relative; }
  .date { font-size: 13px; color: var(--concrete); }

  .empty { position: relative; display: grid; gap: 20px; justify-items: start; max-width: 720px; padding: 40px 36px; background: linear-gradient(155deg, #1f1f1f, #141414); border: 1px solid var(--rule); border-radius: 3px; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; align-items: start; }

  @media (max-width: 900px) {
    .garage-grid, .lot, .two { grid-template-columns: 1fr; }
    .lot.flip .gallery { order: 0; }
    .board { max-width: 460px; }
  }
  @media (max-width: 560px) {
    .dash { grid-template-columns: 1fr 1fr; }
    .dash .price { grid-column: 1 / -1; border-left: 0; border-top: 1px solid var(--rule); }
    .dash > div { padding: 12px 14px; }
    .switch { display: flex; }
    .switch button { flex: 1 1 auto; justify-content: center; padding: 10px 12px; }
  }
</style>
