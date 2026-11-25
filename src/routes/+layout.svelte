<script>
  import '../app.css'
  import { onNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import Header from '$lib/site/Header.svelte'
  import Footer from '$lib/site/Footer.svelte'
  import Shutter from '$lib/site/Shutter.svelte'
  import RequestForm from '$lib/site/RequestForm.svelte'
  import MapBlock from '$lib/site/MapBlock.svelte'

  let { children } = $props()
  /** @type {Shutter} */
  let shutter

  // The configurator is a full-screen tool with its own top bar.
  // The route id does not depend on the base path, which is relative while pages are prerendered.
  let route = $derived(page.route.id ?? '')
  let bare = $derived(route.startsWith('/konfigurator'))

  // Page width without the scrollbar (100vw includes it): full-width rows use it to stay on screen.
  $effect(() => {
    const root = document.documentElement
    const measure = () => root.style.setProperty('--page-w', `${root.clientWidth}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  })

  // Brand and model names stay on one line: "Harley-/Davidson" must not break at the hyphen.
  $effect(() => {
    const names = /\b(Harley|V|DR)-(Davidson|Rod|Max|Z400)/g
    /** @param {Node} root */
    const glue = root => {
      if (root.nodeType === Node.TEXT_NODE) {
        const fixed = root.nodeValue?.replace(names, '$1-\u2060$2')
        if (fixed !== undefined && fixed !== root.nodeValue) root.nodeValue = fixed
        return
      }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) glue(walker.currentNode)
    }
    glue(document.body)
    const observer = new MutationObserver(records => records.forEach(r => {
      if (r.type === 'characterData') glue(r.target)
      else r.addedNodes.forEach(glue)
    }))
    observer.observe(document.body, { subtree: true, childList: true, characterData: true })
    return () => observer.disconnect()
  })

  onNavigate(navigation => {
    const from = navigation.from?.url.pathname, to = navigation.to?.url.pathname
    if (!to || from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    return new Promise(resolve => {
      shutter.close().then(() => {
        resolve()
        // Lift the door whether the new page arrived or the navigation failed.
        navigation.complete.then(() => shutter.open(), () => shutter.open())
      })
    })
  })
</script>

<a class="skip-link" href="#content">Перейти к содержанию</a>
{#if !bare}<Header />{/if}
<Shutter bind:this={shutter} />

<main id="content">
  {@render children()}
</main>

{#if !bare}
  <RequestForm topic={page.data?.topic ?? ''} title={page.data?.requestTitle} />
  {#if !route.startsWith('/kontakty')}<MapBlock />{/if}
  <Footer />
{/if}
