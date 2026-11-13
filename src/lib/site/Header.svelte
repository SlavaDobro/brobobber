<script>
  import { base } from '$app/paths'
  import { page } from '$app/state'
  import { Menu, X, ChevronDown, Phone } from '@lucide/svelte'
  import { nav, services, styles, contacts } from './data.js'

  let open = $state(false)
  let submenu = $state('')
  let scrolled = $state(false)

  // The site may live in a subfolder (GitHub Pages): compare paths without it.
  let path = $derived(page.url.pathname.slice(base.length) || '/')
  /** @param {string} href */
  const active = href => path === href || path.startsWith(href + '/')

  $effect(() => {
    page.url.pathname
    open = false
    submenu = ''
  })

  $effect(() => {
    const onScroll = () => { scrolled = window.scrollY > 24 }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  })

  $effect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  })
</script>

<header class="header" class:scrolled class:open>
  <div class="bar wrap">
    <a class="logo" href="{base}/" aria-label="Brobobber, на главную">
      <span class="logo-word">Brobobber</span>
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
      <a class="phone" href={contacts.phones[0].href}><Phone size={15} />{contacts.phones[0].phone}</a>
      <a class="btn btn-signal cta" href="#zayavka">Обсудить проект</a>
      <button class="burger" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} onclick={() => open = !open}>
        {#if open}<X size={24} />{:else}<Menu size={24} />{/if}
      </button>
    </div>
  </div>

  {#if open}
    <div class="sheet">
      <nav class="sheet-nav wrap" aria-label="Меню">
        <a href="{base}/" class:active={path === '/'}>Главная</a>
        {#each nav as item}<a href={base + item.href} class:active={active(item.href)}>{item.label}</a>{/each}
        <a href="{base}/konfigurator">Конфигуратор V-Rod</a>
      </nav>
      <div class="sheet-contacts wrap">
        {#each contacts.phones as person}<a href={person.href}>{person.phone}<span>{person.name}</span></a>{/each}
        <a class="btn btn-signal" href="#zayavka" onclick={() => open = false}>Обсудить проект</a>
      </div>
    </div>
  {/if}
</header>

<style>
  .header { position: fixed; inset: 0 0 auto; z-index: 50; transition: background-color .3s, border-color .3s; border-bottom: 1px solid transparent; }
  .header.scrolled, .header.open { background: #1c1d1bf2; backdrop-filter: blur(10px); border-color: var(--rule); }
  .bar { height: var(--header); display: flex; align-items: center; gap: 28px; }
  .logo { display: grid; line-height: 1; gap: 4px; flex: none; }
  .logo-word { font-family: var(--display); font-weight: 700; font-stretch: 75%; font-size: 26px; letter-spacing: .02em; }
  .logo-place { font-size: 12px; color: var(--concrete); }
  .nav { display: flex; gap: 4px; margin: 0 auto; }
  .nav a { display: inline-flex; align-items: center; gap: 4px; padding: 10px 12px; font-size: 15px; color: #ece8dfcc; border-radius: 4px; transition: color .2s; }
  .nav a:hover, .nav a.active { color: var(--paper); }
  .nav a.active { box-shadow: inset 0 -2px 0 var(--brass); border-radius: 0; }
  .has-menu { position: relative; }
  .dropdown { position: absolute; top: 100%; left: -8px; min-width: 240px; padding: 8px; background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 6px; display: grid; box-shadow: 0 20px 40px -20px #000c; }
  .dropdown.wide { grid-template-columns: 1fr 1fr; min-width: 520px; }
  .dropdown a { padding: 9px 12px; font-size: 14px; border-radius: 4px; }
  .dropdown a:hover { background: var(--asphalt-3); }
  .actions { display: flex; align-items: center; gap: 18px; flex: none; }
  .phone { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-variant-numeric: tabular-nums; color: var(--paper); }
  .phone :global(svg) { color: var(--brass); }
  .cta { height: 44px; padding: 0 18px; }
  .burger { display: none; width: 44px; height: 44px; place-items: center; }
  .sheet { position: fixed; inset: var(--header) 0 0; background: var(--asphalt); display: flex; flex-direction: column; justify-content: space-between; padding: 24px 0 32px; overflow-y: auto; animation: drop .35s var(--ease); }
  @keyframes drop { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
  .sheet-nav { display: grid; }
  .sheet-nav a { font-family: var(--display); font-stretch: 80%; font-weight: 600; font-size: 34px; padding: 6px 0; border-bottom: 1px solid var(--rule); }
  .sheet-nav a.active { color: var(--brass); }
  .sheet-contacts { display: grid; gap: 12px; margin-top: 28px; }
  .sheet-contacts a:not(.btn) { display: flex; justify-content: space-between; font-size: 20px; }
  .sheet-contacts span { color: var(--concrete); font-size: 15px; }

  @media (max-width: 1180px) {
    .nav { display: none; }
    .burger { display: grid; }
    .actions { margin-left: auto; }
  }
  @media (max-width: 640px) {
    .phone, .cta { display: none; }
    .logo-word { font-size: 24px; }
  }
</style>
