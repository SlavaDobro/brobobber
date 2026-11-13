<script>
  import { nav, contacts, services } from './data.js'
</script>

<footer class="footer">
  <div class="wrap top">
    <div class="brand">
      <a class="word" href="/">Brobobber</a>
      <p class="muted">Кастом-ателье мотоциклов. Строим, тюнингуем и обслуживаем.</p>
    </div>
    <nav aria-label="Разделы">
      <h2>Разделы</h2>
      <ul>
        {#each nav as item}<li><a href={item.href}>{item.label}</a></li>{/each}
        <li><a href="/konfigurator">Конфигуратор V-Rod</a></li>
      </ul>
    </nav>
    <nav aria-label="Популярные услуги">
      <h2>Услуги</h2>
      <ul>{#each services.slice(0, 6) as item}<li><a href={`/uslugi/${item.slug}`}>{item.name}</a></li>{/each}</ul>
    </nav>
    <div class="contact">
      <h2>Связаться</h2>
      <ul>
        {#each contacts.phones as person}<li><a href={person.href}>{person.phone}</a> <span class="muted">{person.name}</span></li>{/each}
        <li><a href={`mailto:${contacts.email}`}>{contacts.email}</a></li>
        <li><a href={contacts.channel.href} target="_blank" rel="noopener">Telegram {contacts.channel.handle}</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap bottom">
    <span>© {new Date().getFullYear()} Brobobber</span>
    <a href="/politika">Политика конфиденциальности</a>
  </div>
</footer>

<style>
  .footer { border-top: 1px solid var(--rule); padding: 56px 0 28px; background: #171816; }
  .top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.2fr; gap: 32px; }
  .word { font-family: var(--display); font-weight: 700; font-stretch: 75%; font-size: 40px; line-height: 1; }
  .brand { display: grid; gap: 12px; align-content: start; }
  .brand p { max-width: 30ch; font-size: 15px; }
  h2 { font-size: 13px; font-weight: 500; color: var(--concrete); margin-bottom: 12px; }
  ul { display: grid; gap: 8px; font-size: 15px; }
  a:hover { color: var(--brass); }
  .bottom { display: flex; justify-content: space-between; gap: 16px; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--rule); font-size: 13px; color: var(--concrete); }
  @media (max-width: 900px) { .top { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .top { grid-template-columns: 1fr; } .bottom { flex-direction: column; } }
</style>
