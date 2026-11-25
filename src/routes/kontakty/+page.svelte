<script>
  import PageHero from '$lib/site/PageHero.svelte'
  import MapBlock from '$lib/site/MapBlock.svelte'
  import { Phone, Mail, Send, MapPin, Clock } from '@lucide/svelte'
  import { contacts } from '$lib/site/data.js'
</script>

<svelte:head>
  <title>Контакты — Brobobber</title>
  <meta name="description" content={`Brobobber: ${contacts.address}. ${contacts.phones.map(p => `${p.name} ${p.phone}`).join(', ')}, ${contacts.email}.`} />
</svelte:head>

<PageHero title="Контакты" lead="Позвоните или напишите мастеру — согласуем время, и приезжайте в мастерскую." crumbs={[{ href: '/', label: 'Главная' }]} />

<section class="section">
  <div class="wrap cards">
    {#each contacts.phones as person}
      <article class="card">
        <h2 class="h3">{person.name}</h2>
        <a class="big" href={person.href}><Phone size={20} />{person.phone}</a>
        <a class="link-steel" href={`https://t.me/${person.telegram}`} target="_blank" rel="noopener"><Send size={15} /> Telegram @{person.telegram}</a>
      </article>
    {/each}
    <article class="card">
      <h2 class="h3">Почта</h2>
      <a class="big" href={`mailto:${contacts.email}`}><Mail size={20} />{contacts.email}</a>
      <p class="muted">Для заявок, фото мотоцикла и вопросов по проекту.</p>
    </article>
    <article class="card channel">
      <h2 class="h3">Telegram-канал Brobobber</h2>
      <a class="big" href={contacts.channel.href} target="_blank" rel="noopener"><Send size={20} />{contacts.channel.handle}</a>
      <p class="muted">Новые проекты, ролики из мастерской и мотоциклы в наличии.</p>
    </article>
    <article class="card">
      <h2 class="h3">Адрес</h2>
      <p class="addr"><MapPin size={20} />{contacts.address}</p>
      <p class="hours"><Clock size={18} />{contacts.hours}</p>
      <p class="muted">Индекс {contacts.postal}</p>
    </article>
    {#if contacts.legal}
      <article class="card">
        <h2 class="h3">Реквизиты</h2>
        <p class="muted">{contacts.legal}</p>
      </article>
    {/if}
  </div>
</section>

<MapBlock />

<style>
  .cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
  .card { display: grid; gap: 14px; align-content: start; padding: 28px; background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 6px; }
  .big { display: flex; align-items: center; gap: 12px; font-family: var(--display); font-stretch: 96%; font-weight: 600; font-size: clamp(22px, 2.4vw, 32px); font-variant-numeric: tabular-nums; }
  .big :global(svg), .addr :global(svg) { color: var(--steel); flex: none; }
  .link-steel { display: inline-flex; align-items: center; gap: 6px; justify-self: start; }
  .addr { display: flex; gap: 12px; font-size: 19px; }
  .hours { display: flex; align-items: center; gap: 12px; font-size: 16px; }
  .hours :global(svg) { color: var(--steel); flex: none; }
  .channel { border-color: var(--steel); }
  @media (max-width: 760px) { .cards { grid-template-columns: 1fr; } }
</style>
