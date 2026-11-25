<script>
  import { base } from '$app/paths'
  import { nav, contacts, services } from './data.js'
  import Logo from './Logo.svelte'
</script>

<footer class="footer">
  <div class="wrap top">
    <div class="brand">
      <a class="badge" href="{base}/" aria-label="Brobobber, на главную"><Logo size={132} word={false} /></a>
      <a class="word" href="{base}/">Brobobber</a>
      <p class="muted">Кастом-ателье мотоциклов. Строим, тюнингуем и обслуживаем.</p>
    </div>
    <nav aria-label="Разделы">
      <h2>Разделы</h2>
      <ul>
        {#each nav as item}<li><a href={base + item.href}>{item.label}</a></li>{/each}
        <li><a href="{base}/konfigurator">Конфигуратор V-Rod</a></li>
      </ul>
    </nav>
    <nav aria-label="Популярные услуги">
      <h2>Услуги</h2>
      <ul>
        {#each services.slice(0, 6) as item}<li><a href={`${base}/uslugi/${item.slug}`}>{item.name}</a></li>{/each}
        <li><a href="{base}/uslugi">Все услуги</a></li>
      </ul>
    </nav>
    <div class="contact">
      <h2>Связаться</h2>
      <ul>
        {#each contacts.phones as person}<li><a href={person.href}>{person.phone}</a> <span class="muted">{person.name}</span></li>{/each}
        <li><a href={`mailto:${contacts.email}`}>{contacts.email}</a></li>
        <li><a href={contacts.channel.href} target="_blank" rel="noopener">Telegram {contacts.channel.handle}</a></li>
        <li class="muted">{contacts.address}</li>
      </ul>
    </div>
  </div>
  <div class="wrap bottom">
    <span>© {new Date().getFullYear()} Brobobber{#if contacts.legal}. {contacts.legal}{/if}</span>
    <a href="{base}/politika">Политика конфиденциальности</a>
  </div>
</footer>

<style>
  .footer { border-top: 1px solid var(--rule); padding: 56px 0 28px; background: #0e0e0e; }
  .top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.2fr; gap: 32px; }
  .word { font-family: var(--display); font-weight: 800; font-stretch: 118%; font-size: 30px; letter-spacing: .04em; text-transform: uppercase; line-height: 1; }
  .badge { justify-self: start; margin-bottom: 8px; }
  .brand { display: grid; gap: 12px; align-content: start; }
  .brand p { max-width: 30ch; font-size: 15px; }
  h2 { font-family: var(--display); font-stretch: 108%; letter-spacing: .08em; text-transform: uppercase; font-size: 12px; font-weight: 600; color: var(--concrete); margin-bottom: 12px; }
  ul { display: grid; gap: 8px; font-size: 15px; }
  a:hover { color: var(--steel); }
  .bottom { display: flex; justify-content: space-between; gap: 16px; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--rule); font-size: 13px; color: var(--concrete); }
  @media (max-width: 900px) { .top { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .top { grid-template-columns: 1fr; } .bottom { flex-direction: column; } }
</style>
