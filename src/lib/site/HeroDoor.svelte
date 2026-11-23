<script>
  // Home hero: the workshop's steel roller door with BROBOBBER painted across its slats in sunset
  // colours. The word and the text sit on the solid door, so they always read; scrolling rolls
  // the door up and opens the full photo behind it.
  import Photo from './Photo.svelte'

  /** @type {{ photo: string, alt?: string, focus?: string, word?: string, children?: import('svelte').Snippet }} */
  let { photo, alt = '', focus = '50% 55%', word = 'BROBOBBER', children } = $props()
  let lines = $derived(word.match(/.{1,3}/g) ?? [word])
  /** @type {HTMLElement} */ let section

  $effect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const apply = () => {
      raf = 0
      const travel = Math.max(1, section.offsetHeight - window.innerHeight)
      const t = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / travel) / .92)
      section.style.setProperty('--lift', (t * t * (3 - 2 * t)).toFixed(4))
    }
    const request = () => { if (!raf) raf = requestAnimationFrame(apply) }
    apply()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  })
</script>

<section class="hero" bind:this={section} style={`--focus:${focus}`}>
  <div class="stage">
    <div class="scene"><Photo base={photo} {alt} sizes="100vw" eager /></div>
    <div class="door">
      <div class="word-box" aria-hidden="true">
        <p class="word">
          {#each lines as line, l}
            <span class="line">{#each line as letter, i}<span class="letter" style={`--i:${l * 3 + i}`}>{letter}</span>{/each}</span>
          {/each}
        </p>
      </div>
      <span class="seams" aria-hidden="true"></span>
      <div class="copy">{@render children?.()}</div>
      <span class="hint" aria-hidden="true">Прокрутите вниз</span>
    </div>
  </div>
</section>

<style>
  .hero { position: relative; height: 210vh; --slat: clamp(34px, 5.4vh, 54px); --gap: clamp(10px, 1.8vh, 18px); }
  .stage { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; background: #0f100e; }
  .scene { position: absolute; inset: 0; overflow: hidden; }
  .scene :global(img) { width: 100%; height: 100%; object-fit: cover; object-position: var(--focus); transform: scale(calc(1.07 - var(--lift, 0) * .07)); will-change: transform; }

  /* The door: painted steel slats, a brass bottom rail and a shadow on the photo below it. */
  .door { position: absolute; z-index: 1; inset: 0 0 var(--gap); display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--header) minmax(0, 1fr) auto;
    transform: translate3d(0, calc(var(--lift, 0) * (-100% - var(--gap) - 8px)), 0); will-change: transform;
    background:
      repeating-linear-gradient(180deg, #ffffff0d 0 1px, transparent 1px 5px, transparent 5px calc(var(--slat) - 3px), #00000066 calc(var(--slat) - 3px) var(--slat)),
      linear-gradient(180deg, #242522, #191a18 70%, #151614);
    border-bottom: 5px solid var(--brass); box-shadow: 0 22px 54px #000d; }

  .word-box { grid-row: 2; container-type: size; display: grid; place-items: center; min-height: 0; }
  .word { margin: 0; white-space: nowrap; text-align: center; font-family: var(--display); font-weight: 700; font-stretch: 75%; line-height: .9;
    font-size: min(22.2cqw, 104cqh); }
  .line { display: inline-block; }
  .letter { display: inline-block; color: transparent; background: linear-gradient(180deg, #fff8e8 8%, #ffe2ae 48%, #ffae62 76%, #ef7c3a 96%); -webkit-background-clip: text; background-clip: text;
    animation: strike .95s calc(.15s + var(--i) * .07s) linear backwards; }
  /* Each letter catches light with a short flicker, like a workshop lamp coming on. */
  @keyframes strike { 0% { opacity: .08; } 28% { opacity: 1; } 38% { opacity: .3; } 56% { opacity: 1; } 64% { opacity: .7; } 100% { opacity: 1; } }

  /* The door seams run over the paint, so the word looks painted on the slats. */
  .seams { position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(180deg, transparent 0 calc(var(--slat) - 2px), #191a18 calc(var(--slat) - 2px) var(--slat)); }

  .copy { grid-row: 3; position: relative; z-index: 2; width: 100%; max-width: var(--max); margin: 0 auto; padding: 0 var(--gutter) clamp(24px, 5vh, 56px); }
  .hint { position: absolute; z-index: 2; right: var(--gutter); bottom: 24px; font-size: 13px; color: var(--concrete); writing-mode: vertical-rl; opacity: calc(1 - var(--lift, 0) * 5); }
  .hint::after { content: ''; display: block; width: 1px; height: 48px; margin: 12px auto 0; background: linear-gradient(var(--brass), transparent); animation: drip 1.8s ease-in-out infinite; }
  @keyframes drip { 0%, 100% { transform: scaleY(.3); transform-origin: top; } 50% { transform: scaleY(1); } }

  /* When the free space is tall, the word stands in three big lines: BRO / BOB / BER. */
  @container (max-aspect-ratio: 3 / 2) {
    .word { font-size: min(62cqw, 33cqh); line-height: .94; }
    .line { display: block; }
  }
  /* Phones on their side: only the heading and buttons stay, so the word keeps its size. */
  @media (max-height: 520px) {
    .copy :global(.lead) { display: none; }
    .copy :global(.hero-copy) { gap: 10px; }
    .copy :global(.hero-title) { font-size: 22px; }
    .copy :global(.hero-actions) { display: flex; }
    .copy :global(.hero-actions .btn) { height: 42px; padding: 0 16px; }
    .copy { padding-bottom: 12px; }
    .hint { display: none; }
  }
  /* Phones and tablets: the dashboard bar takes the bottom of the screen. */
  @media (max-width: 1320px) {
    .stage { height: calc(100svh - 64px - env(safe-area-inset-bottom)); }
  }
  @media (max-width: 640px) {
    .hint { display: none; }
    .copy { padding-bottom: 20px; }
    .copy :global(.lead) { font-size: 16px; }
    .copy :global(.hero-actions) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .copy :global(.hero-actions .btn) { padding: 0 6px; height: 50px; font-size: clamp(12.5px, 3.7vw, 15px); }
  }
  /* Reduced motion: no rolling door, the door panel and the photo simply stack. */
  @media (prefers-reduced-motion: reduce) {
    .hero { height: auto; }
    .stage { position: relative; height: auto; overflow: visible; }
    .door { position: relative; inset: auto; min-height: calc(100svh - 64px); transform: none; }
    .scene { position: relative; inset: auto; height: 70vh; }
    .scene :global(img) { transform: none; }
    .stage { display: flex; flex-direction: column-reverse; }
  }
</style>
