<script>
  // Top bar on wide screens. On phones and tablets: a slim top bar that hides while scrolling down,
  // a "dashboard" bar under the thumb, and a full-screen menu that rises like the workshop door.
  // The menu and the dashboard live outside <header>: a backdrop-filter on the header would
  // otherwise become their containing block and squash them.
  import { base } from '$app/paths'
  import { page } from '$app/state'
  import { Menu, X, ChevronDown, Phone, LayoutGrid, Wrench, Send, Clock } from '@lucide/svelte'
  import Logo from './Logo.svelte'
  import { nav, services, styles, contacts } from './data.js'

  let open = $state(false)
  let submenu = $state('')
  let scrolled = $state(false)
  let hidden = $state(false)
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
      const y = window.scrollY
      scrolled = y > 24
      // Hide the top bar while reading down, bring it back on the first move up.
      if (Math.abs(y - last) > 6) { hidden = y > last && y > 160; last = y }
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

<header class="header" class:scrolled class:hidden={hidden && !open}>
  <div class="bar wrap">
    <a class="logo" href="{base}/" aria-label="Brobobber, на главную">
      <Logo size={38} rev={path} />
      <span class="logo-place">{contacts.addressShort}</span>
    </a>

    <nav class="nav" aria-label="Разделы сайта">
      {#each nav as item}
        {#if item.menu}
          <div class="has-menu" role="presentation" onmouseleave={() => submenu = ''}>
            <a href={base + item.href} class:active={active(item.href)} onmouseenter={() => submenu = item.menu ?? ''} onfocus={() => submenu = item.menu ?? ''}>
              {item.label}<ChevronDown size={14} />
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
      <div class="reach">
        <a class="phone" href={contacts.phones[0].href}><Phone size={15} />{contacts.phones[0].phone}</a>
        <span class="hours"><Clock size={12} />{contacts.hoursShort}</span>
      </div>
      <a class="btn btn-signal cta" href="#zayavka">Обсудить проект</a>
    </div>
  </div>
</header>

<!-- Phone dashboard: the four things people do on a workshop site, under the thumb. -->
<nav class="dash" aria-label="Быстрые действия">
  <a href="{base}/proekty" class:active={active('/proekty')}><LayoutGrid size={20} /><span>Проекты</span></a>
  <a href="{base}/uslugi" class:active={active('/uslugi')}><Wrench size={20} /><span>Услуги</span></a>
  <button class="call" aria-label="Позвонить или написать мастеру" aria-expanded={callSheet} onclick={() => callSheet = !callSheet}>
    <span class="call-ring"><Phone size={22} /></span>
  </button>
  <a href="#zayavka" onclick={() => callSheet = false}><Send size={20} /><span>Заявка</span></a>
  <button class:active={open} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} onclick={() => { open = !open; callSheet = false }}>
    {#if open}<X size={20} />{:else}<Menu size={20} />{/if}<span>Меню</span>
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
      <p class="muted">{contacts.address}<br />{contacts.hours}</p>
    </div>
    <nav class="sheet-nav wrap" aria-label="Меню">
      <a href="{base}/" class:active={path === '/'} style="--i:0"><span>01</span>Главная</a>
      {#each nav as item, i}
        <a href={base + item.href} class:active={active(item.href)} style={`--i:${i + 1}`}><span>{String(i + 2).padStart(2, '0')}</span>{item.label}</a>
      {/each}
      <a href="{base}/konfigurator" style={`--i:${nav.length + 1}`}><span>{String(nav.length + 2).padStart(2, '0')}</span>Конфигуратор V-Rod</a>
    </nav>
    <div class="sheet-foot wrap">
      <a class="btn btn-signal" href="#zayavka" onclick={() => open = false}>Обсудить проект</a>
      <a class="btn btn-line" href={contacts.channel.href} target="_blank" rel="noopener"><Send size={17} />Канал</a>
    </div>
  </div>
{/if}

<style>
  .header { position: fixed; inset: 0 0 auto; z-index: 50; transition: background-color .3s, border-color .3s, transform .35s var(--ease); border-bottom: 1px solid transparent; }
  .header.scrolled { background: #1c1d1bf2; backdrop-filter: blur(10px); border-color: var(--rule); }
  .bar { height: var(--header); display: flex; align-items: center; gap: 28px; }
  .logo { display: grid; grid-template-columns: auto; line-height: 1; gap: 4px; flex: none; }
  .logo-place { font-size: 12px; color: var(--concrete); padding-left: 48px; margin-top: -10px; }
  .nav { display: flex; gap: 4px; margin: 0 auto; }
  .nav a { display: inline-flex; align-items: center; gap: 4px; padding: 10px 12px; white-space: nowrap; font-size: 15px; color: #ece8dfcc; border-radius: 4px; transition: color .2s; }
  .nav a:hover, .nav a.active { color: var(--paper); }
  .nav a.active { box-shadow: inset 0 -2px 0 var(--brass); border-radius: 0; }
  .has-menu { position: relative; }
  .dropdown { position: absolute; top: 100%; left: -8px; min-width: 240px; padding: 8px; background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 6px; display: grid; box-shadow: 0 20px 40px -20px #000c; }
  .dropdown.wide { grid-template-columns: 1fr 1fr; min-width: 520px; }
  .dropdown a { padding: 9px 12px; font-size: 14px; border-radius: 4px; }
  .dropdown a:hover { background: var(--asphalt-3); }
  .actions { display: flex; align-items: center; gap: 18px; flex: none; }
  .reach { display: grid; justify-items: end; gap: 2px; }
  .hours { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; line-height: 1.2; color: var(--concrete); white-space: nowrap; }
  .hours :global(svg) { color: var(--brass); flex: none; }
  .phone { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-variant-numeric: tabular-nums; color: var(--paper); }
  .phone :global(svg) { color: var(--brass); }
  .cta { height: 44px; padding: 0 18px; }

  /* Dashboard bar, call sheet and menu: phones and tablets only */
  .dash, .call-sheet, .scrim, .sheet { display: none; }

  @media (max-width: 1320px) {
    .nav { display: none; }
    .actions { margin-left: auto; }
    .header.hidden { transform: translateY(-100%); }

    .dash { display: grid; grid-template-columns: repeat(5, 1fr); align-items: end; position: fixed; left: 0; right: 0; bottom: 0; z-index: 60;
      padding: 6px 8px calc(6px + env(safe-area-inset-bottom)); background: #1c1d1bf2; backdrop-filter: blur(12px); border-top: 1px solid var(--rule); }
    .dash a, .dash button { display: grid; justify-items: center; gap: 3px; padding: 6px 0; font-size: 11px; color: var(--concrete); min-height: 50px; }
    .dash .active { color: var(--brass); }
    .dash .call { position: relative; padding: 0; }
    .call-ring { width: 58px; height: 58px; margin-top: -26px; display: grid; place-items: center; border-radius: 50%; background: var(--signal); color: #fff;
      box-shadow: 0 0 0 5px var(--asphalt), 0 8px 24px -6px #d23f2a99; transition: transform .2s; }
    .call:active .call-ring { transform: scale(.94); }
    .call[aria-expanded='true'] .call-ring { background: var(--paper); color: var(--asphalt); }

    .scrim { display: block; position: fixed; inset: 0; z-index: 58; background: #0008; }
    .call-sheet { display: grid; gap: 12px; position: fixed; left: 12px; right: 12px; bottom: calc(86px + env(safe-area-inset-bottom)); z-index: 59; padding: 16px;
      background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 10px; animation: rise .3s var(--ease); }
    .person { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .person strong { grid-column: 1 / -1; font-family: var(--display); font-stretch: 88%; font-size: 18px; }
    .person .btn { height: 48px; padding: 0 12px; font-size: 14px; }

    .sheet { display: flex; flex-direction: column; position: fixed; inset: 0; z-index: 55; background: var(--asphalt);
      padding: calc(24px + env(safe-area-inset-top)) 0 calc(96px + env(safe-area-inset-bottom)); overflow-y: auto; animation: door .5s var(--ease); }
    .sheet-top { display: flex; align-items: center; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--rule); }
    .sheet-top p { font-size: 13px; max-width: 30ch; }
    .sheet-nav { display: grid; margin-top: 8px; }
    .sheet-nav a { display: flex; align-items: baseline; gap: 14px; padding: 10px 0; font-family: var(--display); font-stretch: 78%; font-weight: 650;
      font-size: clamp(32px, 9vw, 46px); line-height: 1.05; border-bottom: 1px solid var(--rule); animation: slat .45s calc(.08s + var(--i) * .04s) var(--ease) both; }
    .sheet-nav a span { font-size: 13px; color: var(--brass); font-stretch: 100%; font-weight: 500; }
    .sheet-nav a.active { color: var(--brass); }
    .sheet-foot { display: flex; gap: 10px; margin-top: auto; padding-top: 24px; }
    .sheet-foot .btn { flex: 1; }
    @keyframes door { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
    @keyframes slat { from { opacity: 0; transform: translateY(14px); } }
    @keyframes rise { from { opacity: 0; transform: translateY(12px); } }
  }
  @media (max-width: 640px) {
    .phone, .cta { display: none; }
    .logo-place { display: none; }
    .actions { min-width: 0; }
    .reach .hours { max-width: 128px; font-size: 11px; white-space: normal; text-align: right; }
  }
</style>
