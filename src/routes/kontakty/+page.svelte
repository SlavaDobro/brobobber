<script>
  import PageHero from '$lib/site/PageHero.svelte'
  import MapBlock from '$lib/site/MapBlock.svelte'
  import { Phone, Mail, Send, MapPin } from '@lucide/svelte'
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
        <a class="link-brass" href={`https://t.me/${person.telegram}`} target="_blank" rel="noopener"><Send size={15} /> Telegram @{person.telegram}</a>
      </article>
    {/each}
    <article class="card">
      <h2 class="h3">Почта и канал</h2>
      <a class="big" href={`mailto:${contacts.email}`}><Mail size={20} />{contacts.email}</a>
      <a class="link-brass" href={contacts.channel.href} target="_blank" rel="noopener"><Send size={15} /> {contacts.channel.handle}</a>
    </article>
    <article class="card">
      <h2 class="h3">Адрес</h2>
      <p class="addr"><MapPin size={20} />{contacts.address}</p>
      <p class="muted">Индекс {contacts.postal}. {contacts.hours}.</p>
    </article>
  </div>
</section>

<MapBlock />

<style>
  .cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
  .card { display: grid; gap: 14px; align-content: start; padding: 28px; background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 6px; }
  .big { display: flex; align-items: center; gap: 12px; font-family: var(--display); font-stretch: 88%; font-weight: 600; font-size: clamp(22px, 2.4vw, 32px); font-variant-numeric: tabular-nums; }
  .big :global(svg), .addr :global(svg) { color: var(--brass); flex: none; }
  .link-brass { display: inline-flex; align-items: center; gap: 6px; justify-self: start; }
  .addr { display: flex; gap: 12px; font-size: 19px; }
  @media (max-width: 760px) { .cards { grid-template-columns: 1fr; } }
</style>
