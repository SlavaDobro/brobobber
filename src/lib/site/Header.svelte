<script>
  // Top bar on wide screens. On phones and tablets: a slim top bar that hides while scrolling down,
  // a "dashboard" bar under the thumb, and a full-screen menu that rises like the workshop door.
  // The menu and the dashboard live outside <header>: a backdrop-filter on the header would
  // otherwise become their containing block and squash them.
  import { base } from '$app/paths'
  import { page } from '$app/state'
  import { Menu, X, ChevronDown, Phone, LayoutGrid, Wrench, Send, Clock, MapPin as Pin, House, Users, Motorbike, Tag, Route, MapPin, SlidersHorizontal } from '@lucide/svelte'
  import Logo from './Logo.svelte'
  import { nav, services, styles, contacts, mapLinks } from './data.js'

  /** Phone menu: each section gets its own icon inside the hex nut from the logo. */
  /** @type {Record<string, typeof House>} */
  const sheetIcons = { '/': House, '/o-nas': Users, '/uslugi': Wrench, '/motocikly': Motorbike, '/proekty': LayoutGrid, '/v-nalichii': Tag, '/process': Route, '/kontakty': MapPin, '/konfigurator': SlidersHorizontal }
  const sheetLinks = [{ href: '/', label: 'Главная' }, ...nav, { href: '/konfigurator', label: 'Конфигуратор V-Rod' }]
    .map(item => ({ ...item, icon: sheetIcons[item.href] ?? Wrench }))

  let open = $state(false)
  let submenu = $state('')
  let scrolled = $state(false)
  // "tucked", not "hidden": Tailwind turns a .hidden class into display: none.
  let tucked = $state(false)
  let callSheet = $state(false)

  // The site may live in a subfolder (GitHub Pages): compare paths without it.
  let path = $derived(page.url.pathname.slice(base.length) || '/')
  /** @param {string} href */
  const active = href => path === href || path.startsWith(href + '/')

  $effect(() => {
    path
    open = false
    submenu = ''
    callSheet = false
  })

  $effect(() => {
    let last = window.scrollY
    const onScroll = () => {
      // Phones bounce past both ends of the page; clamp so the bounce reads as no movement.
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(max, 0))
      scrolled = y > 24
      // Hide the top bar while reading down, bring it back after a real move up. Small wobbles
      // of a finger or of momentum scrolling (under 28 px against the direction) change nothing,
      // otherwise the bar would flick in and out and the page looks like it shakes.
      if (y < 160) { tucked = false; last = y; return }
      const d = y - last
      if (tucked ? d > 0 : d < 0) last = y
      else if (Math.abs(d) > 28) { tucked = !tucked; last = y }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  })

  $effect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (!open) return
    /** @param {KeyboardEvent} e */
    const onKey = e => { if (e.key === 'Escape') open = false }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

<header class="header" class:scrolled class:tucked={tucked && !open}>
  <!-- Wide screens: a thin service strip like the sign over a garage door; it folds away on scroll. -->
  <div class="strip">
    <div class="wrap strip-in">
      <a href={mapLinks.yandex} target="_blank" rel="noopener" title="Открыть на Яндекс Картах"><Pin size={13} />{contacts.addressShort}</a>
      <span><Clock size={13} />{contacts.hoursShort}</span>
      <a class="strip-push" href={contacts.channel.href} target="_blank" rel="noopener"><Send size={13} />{contacts.channel.handle}</a>
      <a class="strip-phone" href={contacts.phones[0].href}><Phone size={13} />{contacts.phones[0].phone}</a>
    </div>
  </div>

  <div class="bar wrap">
    <a class="logo" href="{base}/" aria-label="Brobobber, на главную"><Logo size={40} rev={path} /></a>

    <nav class="nav" aria-label="Разделы сайта">
      {#each nav as item}
        {#if item.menu}
          <div class="has-menu" role="presentation" onmouseleave={() => submenu = ''}>
            <a href={base + item.href} class:active={active(item.href)} onmouseenter={() => submenu = item.menu ?? ''} onfocus={() => submenu = item.menu ?? ''}>
              {item.label}<ChevronDown size={13} />
            </a>
            {#if submenu === item.menu}
              <div class="dropdown" class:wide={item.menu === 'services'}>
                {#each item.menu === 'services' ? services : styles as entry}
                  <a href={`${base}${item.href}/${entry.slug}`}>{entry.name}</a>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <a href={base + item.href} class:active={active(item.href)}>{item.label}</a>
        {/if}
      {/each}
    </nav>

    <div class="actions">
      <a class="quick" href={`https://t.me/${contacts.phones[0].telegram}`} target="_blank" rel="noopener" aria-label="Написать мастеру в Telegram">
        <svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg>
        <Send size={16} strokeWidth={2.2} />
      </a>
      <a class="btn btn-signal cta" href="#zayavka">Обсудить проект</a>
    </div>
  </div>
</header>

<!-- Phone dashboard: the four things people do on a workshop site, under the thumb. -->
<nav class="dash" aria-label="Быстрые действия">
  <a href="{base}/proekty" class:active={active('/proekty')}><LayoutGrid size={20} strokeWidth={2.4} /><span>Проекты</span></a>
  <a href="{base}/uslugi" class:active={active('/uslugi')}><Wrench size={20} strokeWidth={2.4} /><span>Услуги</span></a>
  <button class="call" aria-label="Позвонить или написать мастеру" aria-expanded={callSheet} onclick={() => callSheet = !callSheet}>
    <span class="call-ring"><Phone size={22} strokeWidth={2.4} /></span>
  </button>
  <a href="#zayavka" onclick={() => callSheet = false}><Send size={20} strokeWidth={2.4} /><span>Заявка</span></a>
  <button class:active={open} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} onclick={() => { open = !open; callSheet = false }}>
    {#if open}<X size={20} strokeWidth={2.4} />{:else}<Menu size={20} strokeWidth={2.4} />{/if}<span>Меню</span>
  </button>
</nav>

{#if callSheet}
  <div class="call-sheet" role="dialog" aria-label="Связаться с мастером">
    {#each contacts.phones as person}
      <div class="person">
        <strong>{person.name}</strong>
        <a class="btn btn-signal" href={person.href}><Phone size={17} />{person.phone}</a>
        <a class="btn btn-line" href={`https://t.me/${person.telegram}`} target="_blank" rel="noopener"><Send size={17} />Telegram</a>
      </div>
    {/each}
    <p class="hours"><Clock size={13} />{contacts.hours}</p>
  </div>
  <button class="scrim" aria-label="Закрыть" onclick={() => callSheet = false}></button>
{/if}

{#if open}
  <div class="sheet" role="dialog" aria-modal="true" aria-label="Меню">
    <div class="sheet-top wrap">
      <Logo size={52} word={false} rev={1} />
      <p class="muted"><a class="sheet-addr" href={mapLinks.yandex} target="_blank" rel="noopener">{contacts.address}</a><br />{contacts.hours}</p>
    </div>
    <nav class="sheet-nav wrap" aria-label="Меню">
      {#each sheetLinks as item, i}
        {@const Icon = item.icon}
        <a href={base + item.href} class:active={item.href === '/' ? path === '/' : active(item.href)} style={`--i:${i}`}>
          <span class="nut" aria-hidden="true">
            <svg viewBox="-12 -12 24 24"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg>
            <Icon size={16} strokeWidth={2.2} />
          </span>{item.label}
        </a>
      {/each}
    </nav>
    <div class="sheet-foot wrap">
      <a class="btn btn-signal" href="#zayavka" onclick={() => open = false}>Обсудить проект</a>
      <a class="btn btn-line" href={contacts.channel.href} target="_blank" rel="noopener"><Send size={17} />Канал</a>
    </div>
  </div>
{/if}

<style>
  .header { position: fixed; inset: 0 0 auto; z-index: 50; transition: background-color .3s, border-color .3s, transform .35s var(--ease); border-bottom: 1px solid transparent; }
  .header.scrolled { background: #131313f2; backdrop-filter: blur(10px); border-color: var(--rule); }

  /* Service strip: address, hours, channel and phone in small caps of the display face. */
  .strip { height: var(--strip); overflow: hidden; border-bottom: 1px solid #ebebea14; background: #0d0d0d; transition: height .3s var(--ease), opacity .3s, border-color .3s; }
  .header.scrolled .strip { height: 0; opacity: 0; border-bottom-width: 0; }
  .strip-in { height: 100%; display: flex; align-items: center; gap: 26px; font-family: var(--display); font-weight: 600; font-stretch: 104%; font-size: 11.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--concrete); white-space: nowrap; }
  .strip-in > * { display: inline-flex; align-items: center; gap: 7px; }
  .strip-in :global(svg) { color: var(--signal); flex: none; }
  .strip-in a { transition: color .2s; }
  .strip-in a:hover { color: var(--paper); }
  .strip-push { margin-left: auto; }
  .strip-phone { color: var(--paper); font-variant-numeric: tabular-nums; letter-spacing: .06em; }

  .bar { height: calc(var(--header) - var(--strip)); display: flex; align-items: center; gap: 28px; }
  .logo { flex: none; display: flex; }
  .nav { display: flex; gap: 2px; margin: 0 auto; }
  /* Section links: the display face, and a small red hex nut under the current one. */
  .nav a { position: relative; display: inline-flex; align-items: center; gap: 4px; padding: 10px 11px; white-space: nowrap; font-family: var(--display); font-weight: 600; font-stretch: 98%; font-size: 15px; color: #ebebeab3; transition: color .2s; }
  .nav a::after { content: ''; position: absolute; left: 50%; bottom: -2px; width: 9px; height: 8px; margin-left: -4.5px; background: var(--signal);
    clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); transform: scale(0) rotate(-60deg); transition: transform .3s var(--ease); }
  .nav a:hover, .nav a.active { color: var(--paper); }
  .nav a.active::after { transform: none; }
  .nav a:hover::after { transform: scale(.7); background: var(--concrete); }
  .nav a.active:hover::after { transform: none; background: var(--signal); }
  .has-menu { position: relative; }
  .dropdown { position: absolute; top: calc(100% + 6px); left: -8px; min-width: 240px; padding: 8px; background: var(--asphalt-2); border: 1px solid var(--rule); border-top: 2px solid var(--signal); border-radius: 0 0 6px 6px; display: grid; box-shadow: 0 20px 40px -20px #000c; }
  .dropdown::before { content: ''; position: absolute; left: 0; right: 0; top: -10px; height: 10px; }
  .dropdown.wide { grid-template-columns: 1fr 1fr; min-width: 520px; }
  .dropdown a { padding: 9px 12px; font-family: var(--text); font-weight: 400; font-size: 14px; color: var(--paper); border-radius: 4px; }
  .dropdown a::after { display: none; }
  .dropdown a:hover { background: var(--asphalt-3); }
  .actions { display: flex; align-items: center; gap: 12px; flex: none; }
  .cta { height: 44px; padding: 0 20px; }
  /* Telegram in the logo's hex nut: phones and tablets, where the strip is not shown. */
  .quick { position: relative; width: 42px; height: 42px; display: none; place-items: center; color: var(--paper); }
  .quick svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .45s var(--ease); }
  .quick polygon { fill: var(--asphalt-2); stroke: #ebebea59; stroke-width: 1.2; stroke-linejoin: round; transition: fill .25s, stroke .25s; }
  .quick :global(svg.lucide) { position: relative; margin-left: -2px; }
  .quick:is(:hover, :active) svg { transform: rotate(60deg); }
  .quick:is(:hover, :active) polygon { stroke: var(--signal); }
  .hours { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; line-height: 1.2; color: var(--concrete); }
  .hours :global(svg) { color: var(--steel); flex: none; }

  /* Small laptops: a little less air between the sections. */
  @media (max-width: 1400px) {
    .bar { gap: 20px; }
    .nav a { padding: 10px 9px; }
  }

  /* Dashboard bar, call sheet and menu: phones and tablets only */
  .dash, .call-sheet, .scrim, .sheet { display: none; }

  @media (max-width: 1250px) {
    .nav, .strip { display: none; }
    .actions { margin-left: auto; }
    .quick { display: grid; }
    .header.tucked { transform: translateY(-100%); }

    .dash { display: grid; grid-template-columns: repeat(5, 1fr); align-items: end; position: fixed; left: 0; right: 0; bottom: 0; z-index: 60;
      padding: 6px 8px calc(6px + env(safe-area-inset-bottom)); background: #131313f2; backdrop-filter: blur(12px); border-top: 1px solid var(--rule); }
    .dash a, .dash button { position: relative; display: grid; justify-items: center; gap: 4px; padding: 7px 0 6px; font-family: var(--display); font-weight: 650; font-stretch: 106%; font-size: 10.5px; letter-spacing: .07em; text-transform: uppercase; color: var(--concrete); min-height: 50px; }
    .dash .active { color: var(--paper); }
    .dash a.active::before, .dash button.active::before { content: ''; position: absolute; top: 0; left: 50%; width: 22px; height: 2px; margin-left: -11px; background: var(--signal); }
    .dash .call { position: relative; padding: 0; }
    .call-ring { width: 58px; height: 58px; margin-top: -26px; display: grid; place-items: center; border-radius: 50%; background: var(--signal); color: #fff;
      box-shadow: 0 0 0 5px var(--asphalt), 0 8px 24px -6px #d23f2a99; transition: transform .2s; }
    .call:active .call-ring { transform: scale(.94); }
    .call[aria-expanded='true'] .call-ring { background: var(--paper); color: var(--asphalt); }

    .scrim { display: block; position: fixed; inset: 0; z-index: 58; background: #0008; }
    .call-sheet { display: grid; gap: 12px; position: fixed; left: 12px; right: 12px; bottom: calc(86px + env(safe-area-inset-bottom)); z-index: 59; padding: 16px;
      background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 10px; animation: rise .3s var(--ease); }
    .person { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .person strong { grid-column: 1 / -1; font-family: var(--display); font-stretch: 96%; font-size: 18px; }
    .person .btn { height: 48px; padding: 0 12px; font-size: 14px; }

    .sheet { display: flex; flex-direction: column; position: fixed; inset: 0; z-index: 55; background: var(--asphalt);
      padding: calc(24px + env(safe-area-inset-top)) 0 calc(96px + env(safe-area-inset-bottom)); overflow-y: auto; animation: door .5s var(--ease); }
    .sheet-top { display: flex; align-items: center; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--rule); }
    .sheet-top p { font-size: 13px; max-width: 30ch; }
    .sheet-addr { text-decoration: underline; text-decoration-color: #ebebea40; text-underline-offset: 3px; }
    .sheet-nav { display: grid; margin-top: 8px; }
    .sheet-nav a { display: flex; align-items: baseline; gap: 14px; padding: 10px 0; font-family: var(--display); font-stretch: 96%; font-weight: 650;
      font-size: clamp(32px, 9vw, 46px); line-height: 1.05; border-bottom: 1px solid var(--rule); animation: slat .45s calc(.08s + var(--i) * .04s) var(--ease) both; }
    .sheet-nav a { align-items: center; }
    /* The logo's hex nut: outline at rest, red and a sixth of a turn on the current page or a tap. */
    .nut { position: relative; flex: none; width: 40px; height: 40px; display: grid; place-items: center; color: var(--paper); }
    .nut svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .45s var(--ease); }
    .nut polygon { fill: var(--asphalt-2); stroke: #ebebea59; stroke-width: 1.2; stroke-linejoin: round; transition: fill .25s, stroke .25s; }
    .nut :global(svg.lucide) { position: relative; }
    .sheet-nav a:is(:hover, :active, .active) .nut svg { transform: rotate(60deg); }
    .sheet-nav a.active .nut polygon { fill: var(--signal); stroke: var(--signal); }
    .sheet-nav a:not(.active):is(:hover, :active) .nut polygon { stroke: var(--signal); }
    .sheet-nav a.active { color: var(--paper); }
    .sheet-foot { display: flex; gap: 10px; margin-top: auto; padding-top: 24px; }
    .sheet-foot .btn { flex: 1; }
    @keyframes door { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
    @keyframes slat { from { opacity: 0; transform: translateY(14px); } }
    @keyframes rise { from { opacity: 0; transform: translateY(12px); } }
  }
  @media (max-width: 640px) {
    .cta { display: none; }
  }
</style>
