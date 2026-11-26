<script>
  // Contacts as the workshop's entrance: the phone number painted across the roller door in the
  // same brushed steel as the home page, then the ways to reach the workshop as key fobs hanging
  // on a pegboard (the board by the door where the bike keys wait for their owners), then the map.
  import { base } from '$app/paths'
  import MapBlock from '$lib/site/MapBlock.svelte'
  import { Phone, Mail, Send, MapPin, Clock, Radio, FileText } from '@lucide/svelte'
  import { contacts, mapLinks } from '$lib/site/data.js'

  const master = contacts.phones[0]
  const fobs = [
    { tone: 'red', no: '01', icon: Send, title: 'Мастеру в Telegram', value: `@${master.telegram}`, note: 'Фото мотоцикла и идея — быстрее всего сюда.', href: `https://t.me/${master.telegram}`, ext: true },
    { tone: 'paper', no: '02', icon: Mail, title: 'Почта', value: contacts.email, note: 'Для заявок, фото и вопросов по проекту.', href: `mailto:${contacts.email}` },
    { tone: 'dark', no: '03', icon: Radio, title: 'Канал мастерской', value: contacts.channel.handle, note: 'Новые проекты, ролики и мотоциклы в наличии.', href: contacts.channel.href, ext: true },
    { tone: 'steel', no: '04', icon: MapPin, title: 'Адрес', value: contacts.addressShort, note: `${contacts.hours}. Индекс ${contacts.postal}.`, href: mapLinks.yandex, ext: true },
  ]
</script>

<svelte:head>
  <title>Контакты — Brobobber</title>
  <meta name="description" content={`Brobobber: ${contacts.address}. ${contacts.phones.map(p => `${p.name} ${p.phone}`).join(', ')}, ${contacts.email}.`} />
</svelte:head>

<section class="door">
  <div class="wrap door-in">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span></nav>
    <span class="kicker">Связь с мастерской</span>
    <h1 class="h1">Контакты</h1>
    <!-- The number painted on the door; the whole sign is the call button. -->
    <a class="sign" href={master.href} aria-label={`Позвонить: ${master.phone}`}>
      <span class="number">{master.phone}</span>
      <span class="sign-foot"><Phone size={16} /><b>{master.name}</b> · звонки и Telegram · <span class="hours"><Clock size={14} />{contacts.hoursShort}</span></span>
    </a>
  </div>
</section>

<section class="section rack-section">
  <div class="wrap">
    <h2 class="h2 head">Ключи от мастерской</h2>
    <ul class="rack">
      {#each fobs as fob, i}
        {@const Icon = fob.icon}
        <li style={`--swing:${[-4, 3, -2, 4][i % 4]}deg`}>
          <span class="hook" aria-hidden="true"></span>
          <a class={`fob ${fob.tone}`} href={fob.href} target={fob.ext ? '_blank' : undefined} rel={fob.ext ? 'noopener' : undefined}>
            <span class="ring" aria-hidden="true"></span>
            <span class="fob-no" aria-hidden="true">№ {fob.no}</span>
            <span class="fob-icon"><Icon size={22} /></span>
            <span class="fob-title">{fob.title}</span>
            <strong class="fob-value">{fob.value}</strong>
            <span class="fob-note">{fob.note}</span>
          </a>
        </li>
      {/each}
      {#if contacts.legal}
        <li style="--swing:-3deg">
          <span class="hook" aria-hidden="true"></span>
          <div class="fob paper">
            <span class="ring" aria-hidden="true"></span>
            <span class="fob-icon"><FileText size={22} /></span>
            <span class="fob-title">Реквизиты</span>
            <span class="fob-note">{contacts.legal}</span>
          </div>
        </li>
      {/if}
    </ul>
  </div>
</section>

<MapBlock />

<style>
  .head { margin-bottom: clamp(28px, 4vw, 48px); }

  /* The door: steel slats with the number painted across them. */
  .door { padding: calc(var(--header) + clamp(36px, 5vw, 72px)) 0 clamp(48px, 6vw, 90px); border-bottom: 5px solid var(--steel);
    background: repeating-linear-gradient(180deg, #ffffff0b 0 1px, transparent 1px 5px, transparent 5px 42px, #00000066 42px 46px), linear-gradient(180deg, #222, #181818 70%, #131313); }
  .door-in { display: grid; gap: 14px; justify-items: start; container-type: inline-size; }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); margin-bottom: 8px; }
  .crumbs a:hover { color: var(--paper); }
  .kicker { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--signal); }
  .sign { display: grid; gap: 14px; margin-top: clamp(18px, 3vw, 36px); width: 100%; }
  .number { display: block; white-space: nowrap; font-family: var(--display); font-weight: 800; font-stretch: 112%; line-height: .95; letter-spacing: -.01em; font-variant-numeric: tabular-nums;
    font-size: min(10.2cqi, 150px); color: transparent; background: linear-gradient(180deg, #ffffff 6%, #e9ebee 42%, #b3b8be 74%, #80858c 97%); -webkit-background-clip: text; background-clip: text;
    transition: filter .3s; }
  .sign:hover .number { filter: drop-shadow(0 0 18px #d23f2a59); }
  .sign-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 15px; color: var(--concrete); }
  .sign-foot b { color: var(--paper); font-weight: 600; }
  .sign-foot :global(svg) { color: var(--signal); }
  .hours { display: inline-flex; align-items: center; gap: 6px; }

  /* Pegboard with hooks and key fobs. */
  .rack { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(14px, 2vw, 26px); padding: 46px clamp(16px, 2.4vw, 32px) 34px; border-radius: 4px; border: 1px solid var(--rule);
    background: radial-gradient(circle at 12px 12px, #0a0a0a 0 3px, #2b2b2b 3.6px, transparent 4.2px) 0 0 / 24px 24px, linear-gradient(180deg, #1c1c1c, #161616); }
  .rack li { position: relative; display: flex; justify-content: center; padding-top: 18px; }
  .hook { position: absolute; top: -10px; left: 50%; width: 6px; height: 34px; margin-left: -3px; border-radius: 3px; background: linear-gradient(90deg, #8b8f94, #d7d9dc 45%, #6d7176); box-shadow: 0 3px 4px #000a; z-index: 2; }
  .hook::after { content: ''; position: absolute; left: -6px; top: -4px; width: 18px; height: 8px; border-radius: 4px; background: #555; }
  .fob { position: relative; width: 100%; display: grid; justify-items: start; gap: 6px; padding: 54px 20px 22px; border-radius: 22px 22px 14px 14px;
    box-shadow: inset 0 1px 0 #ffffff26, inset 0 -2px 0 #00000040, 0 18px 26px -16px #000; transform-origin: 50% -14px; transform: rotate(var(--swing)); transition: transform .6s cubic-bezier(.3, 1.6, .5, 1); }
  .rack li:hover .fob { transform: rotate(calc(var(--swing) * -.7)); }
  /* Split ring through the hole at the top of the fob. */
  .ring { position: absolute; left: 50%; top: -12px; width: 34px; height: 34px; margin-left: -17px; border-radius: 50%; border: 3px solid #b9bdc2; box-shadow: 0 1px 2px #000; }
  .fob::before { content: ''; position: absolute; left: 50%; top: 12px; width: 16px; height: 16px; margin-left: -8px; border-radius: 50%; background: #121212; box-shadow: inset 0 1px 3px #000; }
  .fob-no { position: absolute; right: 18px; top: 18px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .16em; opacity: .7; }
  .fob-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; margin-bottom: 6px; }
  .fob-title { font-family: var(--display); font-weight: 700; font-stretch: 108%; font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; opacity: .8; }
  .fob-value { font-family: var(--display); font-weight: 800; font-stretch: 100%; font-size: clamp(18px, 1.6vw, 22px); line-height: 1.15; overflow-wrap: anywhere; }
  .fob-note { font-size: 13.5px; line-height: 1.4; opacity: .8; }
  /* Fob colours, like the plastic tags in a real workshop. */
  .fob.red { background: linear-gradient(170deg, #df4a33, #b8301d); color: #fff; }
  .fob.red .fob-icon { background: #ffffff26; }
  .fob.paper { background: linear-gradient(170deg, #f1efe9, #d9d5cc); color: #141414; }
  .fob.paper .fob-icon { background: #1414140f; color: var(--signal-deep); }
  .fob.dark { background: linear-gradient(170deg, #2a2a2a, #161616); color: var(--paper); box-shadow: inset 0 0 0 1px #ebebea1f, 0 18px 26px -16px #000; }
  .fob.dark .fob-icon { background: #ebebea14; color: var(--signal); }
  .fob.steel { background: linear-gradient(170deg, #c9ccd0, #8f9499); color: #141414; }
  .fob.steel .fob-icon { background: #14141414; }

  @media (max-width: 1000px) { .rack { grid-template-columns: 1fr 1fr; row-gap: 44px; } }
  @media (max-width: 560px) {
    .rack { grid-template-columns: 1fr; }
  }
</style>
