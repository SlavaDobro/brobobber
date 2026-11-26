<script>
  // Workshop bikes in a camera viewfinder: corner brackets, a blinking REC mark, a frame counter
  // and a thin red timer line. All frames stay stacked in place and only cross-fade, so nothing
  // jumps; the next frame is chosen by the timer (only while the block is on screen and not
  // under the cursor) or by the thumbnails underneath. Reduced motion: no autoplay.
  import { base } from '$app/paths'
  import { ArrowRight } from '@lucide/svelte'
  import Photo from './Photo.svelte'
  import { projects } from './data.js'

  /** @type {{ items: { slug: string, photo: string }[], interval?: number }} */
  let { items, interval = 5200 } = $props()

  let slides = $derived(items.flatMap(({ slug, photo }) => {
    const project = projects.find(p => p.slug === slug)
    return project ? [{ slug, name: project.name, stem: photo }] : []
  }))
  let index = $state(0)
  let paused = $state(false)
  let visible = $state(false)
  let still = $state(true)
  // Restarting the timer line: bump the key on every change of frame.
  let run = $state(0)
  /** @type {HTMLElement} */ let root

  /** @param {number} i */
  const show = i => { index = (i + slides.length) % slides.length; run++ }

  $effect(() => {
    still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: .35 })
    io.observe(root)
    return () => io.disconnect()
  })

  $effect(() => {
    if (still || paused || !visible || slides.length < 2) return
    run
    const t = setTimeout(() => show(index + 1), interval)
    return () => clearTimeout(t)
  })

  let current = $derived(slides[index])
</script>

<div class="finder" bind:this={root} role="group" aria-roledescription="слайдер" aria-label="Мотоциклы мастерской"
  onpointerenter={() => paused = true} onpointerleave={() => paused = false} onfocusin={() => paused = true} onfocusout={() => paused = false}>
  <div class="screen">
    {#each slides as slide, i (slide.slug)}
      <a class="frame" class:on={i === index} href={`${base}/proekty/${slide.slug}`} tabindex={i === index ? 0 : -1} aria-hidden={i !== index}>
        <Photo base={slide.stem} alt={slide.name} sizes="(max-width: 760px) 100vw, 50vw" cover eager={i <= 1} />
      </a>
    {/each}
    <span class="shade" aria-hidden="true"></span>
    <!-- Viewfinder overlay -->
    <span class="corners" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="rec" aria-hidden="true"><i></i>REC</span>
    <span class="counter" aria-hidden="true">{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
    <a class="caption" href={`${base}/proekty/${current.slug}`} tabindex="-1">
      <span class="cap-name">{current.name}</span>
      <span class="cap-go">Смотреть проект <ArrowRight size={15} /></span>
    </a>
    {#key run}<span class="timer" class:moving={!still && !paused && visible} style={`--d:${interval}ms`} aria-hidden="true"></span>{/key}
  </div>
  <div class="thumbs" role="group" aria-label="Выбрать мотоцикл">
    {#each slides as slide, i (slide.slug)}
      <button class:on={i === index} aria-label={slide.name} aria-pressed={i === index} onclick={() => show(i)}>
        <Photo base={slide.stem} sizes="120px" cover />
      </button>
    {/each}
  </div>
</div>

<style>
  .finder { display: grid; gap: 10px; }
  .screen { position: relative; aspect-ratio: 1.36; overflow: hidden; border-radius: 4px; background: #0c0c0c; }
  .frame { position: absolute; inset: 0; opacity: 0; transition: opacity .9s var(--ease); }
  .frame :global(img) { width: 100%; height: 100%; object-fit: cover; transform: scale(1.03); transition: transform 6s linear; }
  .frame.on { opacity: 1; z-index: 1; }
  .frame.on :global(img) { transform: scale(1); }
  .shade { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: linear-gradient(180deg, #0008 0, transparent 22%, transparent 60%, #000c 100%); }

  /* Viewfinder marks */
  .corners { position: absolute; inset: 14px; z-index: 3; pointer-events: none; }
  .corners i { position: absolute; width: 26px; height: 26px; border: 0 solid #ffffffd9; }
  .corners i:nth-child(1) { left: 0; top: 0; border-width: 2px 0 0 2px; }
  .corners i:nth-child(2) { right: 0; top: 0; border-width: 2px 2px 0 0; }
  .corners i:nth-child(3) { left: 0; bottom: 0; border-width: 0 0 2px 2px; }
  .corners i:nth-child(4) { right: 0; bottom: 0; border-width: 0 2px 2px 0; }
  .rec, .counter { position: absolute; z-index: 3; top: 24px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .18em; color: #fff; pointer-events: none; }
  .rec { left: 30px; display: inline-flex; align-items: center; gap: 7px; }
  .rec i { width: 8px; height: 8px; border-radius: 50%; background: var(--signal); box-shadow: 0 0 8px var(--signal); animation: blink 1.6s steps(1) infinite; }
  @keyframes blink { 50% { opacity: .15; } }
  .counter { right: 30px; font-variant-numeric: tabular-nums; }
  .caption { position: absolute; z-index: 3; left: 30px; right: 30px; bottom: 26px; display: grid; gap: 4px; }
  .cap-name { font-family: var(--display); font-weight: 700; font-size: clamp(18px, 1.8vw, 24px); line-height: 1.15; color: #fff; }
  .cap-go { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #ffffffb3; transition: color .2s; }
  .caption:hover .cap-go { color: var(--signal); }
  .timer { position: absolute; z-index: 3; left: 0; bottom: 0; height: 3px; width: 100%; background: var(--signal); transform-origin: left; transform: scaleX(0); }
  .timer.moving { animation: fill var(--d) linear forwards; }
  @keyframes fill { to { transform: scaleX(1); } }

  /* Thumbnails: contact frames under the finder. */
  .thumbs { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 8px; }
  .thumbs button { position: relative; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 3px; opacity: .45; transition: opacity .25s; }
  .thumbs button::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--signal); transform: scaleX(0); transform-origin: left; transition: transform .3s var(--ease); }
  .thumbs button:hover { opacity: .8; }
  .thumbs button.on { opacity: 1; }
  .thumbs button.on::after { transform: scaleX(1); }
  .thumbs :global(img) { width: 100%; height: 100%; object-fit: cover; }

  @media (prefers-reduced-motion: reduce) {
    .frame, .frame :global(img) { transition: none; }
    .rec i { animation: none; }
  }
</style>
