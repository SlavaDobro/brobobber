<script>
  import { base } from '$app/paths'
  import PageHero from '$lib/site/PageHero.svelte'
  import Photo from '$lib/site/Photo.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { ArrowUpRight } from '@lucide/svelte'
  import { contacts } from '$lib/site/data.js'
  import { stock } from '$lib/site/stock.js'
  import { stockFaq } from '$lib/site/faq.js'

  const kinds = { project: 'Готовый проект', donor: 'Донор под проект' }
  const live = stock.filter(bike => bike.active)
  let kind = $state('')
  let shown = $derived(live.filter(bike => !kind || bike.kind === kind))
  /** @type {Record<string, number>} */
  let frame = $state({})

  const money = (/** @type {number} */ n) => n.toLocaleString('ru-RU') + ' ₽'
  const km = (/** @type {number} */ n) => n.toLocaleString('ru-RU') + ' км'
  const day = (/** @type {string} */ d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
</script>

<svelte:head>
  <title>Мотоциклы в наличии — Brobobber</title>
  <meta name="description" content="Кастомные мотоциклы и доноры под проект, которые можно купить в мастерской Brobobber в Москве: фото, пробег, цена и список работ." />
</svelte:head>

<PageHero title="Мотоциклы в наличии" lead="Готовые проекты, на которых можно сразу ехать, и мотоциклы-доноры под ваш будущий кастом. Если берёте донора под постройку у нас, предложим хорошую цену на работы." crumbs={[{ href: '/', label: 'Главная' }]}>
  <div class="actions">
    <a class="btn btn-signal" href="#zayavka">Спросить о мотоцикле</a>
    <a class="btn btn-line" href={contacts.channel.href} target="_blank" rel="noopener">Telegram-канал</a>
  </div>
</PageHero>

<section class="section">
  <div class="wrap">
    {#if live.length}
      <div class="filters" role="group" aria-label="Тип">
        <button class:on={!kind} aria-pressed={!kind} onclick={() => kind = ''}>Все · {live.length}</button>
        {#each Object.entries(kinds) as [key, label]}
          {@const count = live.filter(bike => bike.kind === key).length}
          {#if count}<button class:on={kind === key} aria-pressed={kind === key} onclick={() => kind = kind === key ? '' : key}>{label} · {count}</button>{/if}
        {/each}
      </div>
      <ul class="bikes">
        {#each shown as bike (bike.slug)}
          {@const n = frame[bike.slug] ?? 0}
          <li class="bike">
            <div class="shots">
              <div class="shot">
                <Photo base={bike.photos[n]} alt={`${bike.name}, фото ${n + 1}`} sizes="(max-width: 900px) 100vw, 45vw" />
              </div>
              {#if bike.photos.length > 1}
                <div class="thumbs" role="group" aria-label="Фото">
                  {#each bike.photos as photo, i}
                    <button class:on={i === n} aria-label={`Фото ${i + 1}`} onclick={() => frame[bike.slug] = i}><Photo base={photo} sizes="96px" cover /></button>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="info">
              <span class="kind" class:donor={bike.kind === 'donor'}>{kinds[bike.kind]}</span>
              <h2 class="h3">{bike.name}</h2>
              <dl class="facts">
                <div><dt>Год</dt><dd>{bike.year}</dd></div>
                {#if bike.km}<div><dt>Пробег</dt><dd>{km(bike.km)}</dd></div>{/if}
                <div><dt>Цена</dt><dd>{money(bike.price)}</dd></div>
              </dl>
              <p class="muted">{bike.text}</p>
              {#if bike.works.length}
                <ul class="works">{#each bike.works as work}<li>{work}</li>{/each}</ul>
              {/if}
              <p class="date">Цена и наличие на {day(bike.date)}, уточняйте у мастера.</p>
              <div class="actions">
                <a class="btn btn-signal" href="#zayavka">Узнать о мотоцикле</a>
                <a class="link-steel" href={`${contacts.channel.href}/${bike.post}`} target="_blank" rel="noopener">Объявление в канале <ArrowUpRight size={14} /></a>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="empty">
        <h2 class="h2">Сейчас всё разобрали</h2>
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
  .actions .link-steel { display: inline-flex; align-items: center; gap: 6px; }
  .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; }
  .filters button { padding: 8px 14px; border: 1px solid var(--rule); border-radius: 100px; font-size: 14px; color: var(--concrete); transition: all .2s; }
  .filters button:hover { color: var(--paper); border-color: var(--concrete); }
  .filters button.on { background: var(--paper); color: var(--asphalt); border-color: var(--paper); }
  .bikes { display: grid; gap: clamp(48px, 6vw, 88px); }
  .bike { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 6fr); gap: clamp(24px, 4vw, 64px); align-items: start; }
  .shots, .info { min-width: 0; }
  .shots { display: grid; gap: 10px; }
  .shot { aspect-ratio: 4 / 5; border-radius: 4px; overflow: hidden; background: var(--asphalt-2); }
  .shot :global(img) { width: 100%; height: 100%; }
  .thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(52px, 72px)); gap: 8px; }
  .thumbs button { width: 100%; aspect-ratio: 4 / 3; border-radius: 3px; overflow: hidden; border: 1px solid var(--rule); opacity: .6; transition: opacity .2s, border-color .2s; }
  .thumbs button.on { opacity: 1; border-color: var(--paper); }
  .thumbs :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .info { display: grid; gap: 16px; justify-items: start; }
  .kind { padding: 5px 10px; border: 1px solid var(--signal); border-radius: 3px; font-family: var(--display); font-weight: 650; font-stretch: 108%; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--paper); }
  .kind.donor { border-color: var(--concrete); }
  .facts { display: flex; flex-wrap: wrap; gap: 8px 32px; width: 100%; padding: 14px 0; border-block: 1px solid var(--rule); }
  .facts dt { font-size: 13px; color: var(--concrete); }
  .facts dd { font-family: var(--display); font-weight: 650; font-stretch: 100%; font-size: 21px; }
  .works { display: grid; gap: 6px; }
  .works li { padding-left: 18px; position: relative; color: var(--paper); }
  .works li::before { content: ''; position: absolute; left: 0; top: .7em; width: 8px; height: 1px; background: var(--signal); }
  .date { font-size: 13px; color: var(--concrete); }
  .empty { display: grid; gap: 20px; justify-items: start; max-width: 680px; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; align-items: start; }
  @media (max-width: 900px) { .bike, .two { grid-template-columns: 1fr; } }
</style>
