<script>
  // Real workshop bikes changing on their own: each new photo rises over the last one like the
  // roller door. Runs only while on screen; with reduced motion it stays on the first photo.
  import { base } from '$app/paths'
  import Photo from './Photo.svelte'
  import { photoSrc, projects } from './data.js'

  /** @type {{ items: { slug: string, photo: string }[], interval?: number }} */
  let { items, interval = 3800 } = $props()

  let slides = $derived(items.flatMap(({ slug, photo }) => {
    const project = projects.find(p => p.slug === slug)
    return project ? [{ slug, name: project.name, stem: photo, photo: photoSrc(photo) }] : []
  }))
  let index = $state(0)
  let previous = $state(-1)
  /** @type {HTMLElement} */ let root

  $effect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || slides.length < 2) return
    let visible = false
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    io.observe(root)
    const timer = setInterval(() => {
      if (!visible || document.hidden) return
      const next = (index + 1) % slides.length
      // Load the photo after this one ahead of time, so the door never opens on an empty frame.
      new Image().src = slides[(next + 1) % slides.length].photo.src
      previous = index
      index = next
    }, interval)
    return () => { clearInterval(timer); io.disconnect() }
  })

  let current = $derived(slides[index])
</script>

<div class="slides" bind:this={root}>
  {#if previous >= 0}
    <img class="photo under" src={slides[previous].photo.src} alt="" aria-hidden="true" />
  {/if}
  {#key index}
    <a class="slide" href={`${base}/proekty/${current.slug}`} aria-label={`Проект: ${current.name}`}>
      <Photo base={current.stem} alt={current.name} sizes="(max-width: 760px) 100vw, 50vw" eager={index !== 0} cover />
      <span class="name">{current.name}</span>
    </a>
  {/key}
</div>

<style>
  .slides { position: relative; aspect-ratio: 1.36; overflow: hidden; border-radius: 4px; background: var(--asphalt-2); }
  .under, .slide, .slide :global(img) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .slide { display: block; animation: door .95s var(--ease) both; }
  .slide :global(img) { animation: settle 4.6s var(--ease) both; }
  .slide::after { content: ''; position: absolute; inset: 55% 0 0; background: linear-gradient(transparent, #0f100ecc); pointer-events: none; }
  .name { position: absolute; z-index: 1; left: 18px; right: 18px; bottom: 16px; padding-left: 12px; border-left: 2px solid var(--steel);
    font-family: var(--display); font-stretch: 96%; font-weight: 600; font-size: clamp(17px, 1.6vw, 22px); line-height: 1.15; color: var(--paper); }
  .slide:hover .name { color: var(--steel); }
  @keyframes door { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
  @keyframes settle { from { transform: scale(1.08); } to { transform: scale(1); } }
  @media (prefers-reduced-motion: reduce) { .slide, .slide :global(img) { animation: none; } }
</style>
