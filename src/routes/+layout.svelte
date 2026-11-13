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
  let bare = $derived(page.url.pathname.startsWith('/konfigurator'))

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
  {#if !page.url.pathname.startsWith('/kontakty')}<MapBlock />{/if}
  <Footer />
{/if}
