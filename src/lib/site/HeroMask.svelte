<script>
  // Home hero: the workshop picture (or video) is seen only through the giant word BROBOBBER.
  // Scrolling grows the letters until the picture fills the screen. Drawn on canvas so the
  // window follows the real Tektur glyphs. With reduced motion it is a plain photo hero.
  import { photoSrc } from './data.js'

  /** @type {{ photo: string, video?: string, word?: string, children?: import('svelte').Snippet }} */
  let { photo, video, word = 'BROBOBBER', children } = $props()

  /** @type {HTMLElement} */ let section
  /** @type {HTMLElement} */ let copyEl
  /** @type {HTMLCanvasElement | undefined} */ let canvas = $state()
  /** @type {HTMLVideoElement | undefined} */ let videoEl = $state()
  let progress = $state(0)
  let still = $state(false)

  $effect(() => {
    still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still || !canvas) return
    const cnv = canvas
    const ctx = cnv.getContext('2d')
    if (!ctx) return
    const image = new Image()
    image.src = photoSrc(photo).src
    let raf = 0, visible = true, width = 0, height = 0, ready = false, room = 0, center = 0
    const media = () => (videoEl && videoEl.readyState >= 2 ? videoEl : image)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = cnv.clientWidth; height = cnv.clientHeight
      cnv.width = Math.round(width * dpr); cnv.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // The word lives in the free space between the top bar and the text, so they never overlap.
      const top = (/** @type {HTMLElement | null} */ (document.querySelector('.header'))?.offsetHeight ?? 72) + 6
      const bottom = copyEl.offsetTop - 14
      room = Math.max(72, bottom - top)
      center = top + room / 2
    }
    const measure = () => {
      const rect = section.getBoundingClientRect()
      const travel = section.offsetHeight - window.innerHeight
      progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, travel)))
    }
    /** cover-fit draw of the media with a slow push-in */
    const drawMedia = (zoom) => {
      const m = media()
      const mw = m instanceof HTMLVideoElement ? m.videoWidth : m.naturalWidth
      const mh = m instanceof HTMLVideoElement ? m.videoHeight : m.naturalHeight
      if (!mw) return
      const scale = Math.max(width / mw, height / mh) * zoom
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(m, (width - mw * scale) / 2, (height - mh * scale) * .55, mw * scale, mh * scale)
    }
    const frame = () => {
      raf = 0
      if (!ready) return
      const p = progress
      const grow = 1 + Math.pow(p, 2.2) * 26
      ctx.clearRect(0, 0, width, height)
      // 1. The letters first (all lines), then the picture drawn only inside them ('source-in').
      // Masking with 'destination-in' per line would keep only the overlap of the lines.
      ctx.save()
      // On a tall phone screen the word stands in three big lines (BRO / BOB / BER) above the text block.
      const portrait = height > width * 1.2
      const lines = portrait ? word.match(/.{1,3}/g) ?? [word] : [word]
      let size = portrait ? Math.min(width * .4, room / 2.55) : Math.min(width * .235, room / .82)
      ctx.font = `700 ${size}px "Tektur Variable"`
      // @ts-ignore: fontStretch is supported by Chromium and Firefox canvas
      ctx.fontStretch = 'condensed'
      // Keep the word off the screen edges whatever the width of the font turns out to be.
      const widest = Math.max(...lines.map(line => ctx.measureText(line).width))
      if (widest > width * .92) {
        size *= width * .92 / widest
        ctx.font = `700 ${size}px "Tektur Variable"`
        // Setting the font resets the stretch.
        // @ts-ignore: fontStretch is supported by Chromium and Firefox canvas
        ctx.fontStretch = 'condensed'
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.translate(width / 2, center)
      ctx.scale(grow, grow)
      ctx.fillStyle = '#000'
      const lead = size * .86
      lines.forEach((line, i) => ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lead))
      ctx.restore()
      ctx.save()
      ctx.globalCompositeOperation = 'source-in'
      drawMedia(1.12 - p * .12)
      ctx.restore()
      // 2. The whole picture fades in as the letters open up.
      const reveal = Math.min(1, Math.max(0, (p - .45) / .4))
      if (reveal > 0) {
        ctx.save(); ctx.globalAlpha = reveal; ctx.globalCompositeOperation = 'destination-over'
        drawMedia(1.12 - p * .12); ctx.restore()
      }
      if (videoEl && visible) request()
    }
    const request = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const onScroll = () => { measure(); request() }
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request() })

    // Resizing clears the canvas, so the frame is redrawn at once. The text block is watched too:
    // when the body font arrives its height changes, and the word must move out of its way.
    const onResize = () => { if (ready) { resize(); measure(); frame() } }
    const copyWatch = new ResizeObserver(onResize)
    copyWatch.observe(copyEl)
    // Draw as soon as the font is there, and again when the photo arrives (it may load later).
    // The first frames are drawn directly, not via requestAnimationFrame: in a background tab
    // animation frames are paused and the hero would stay empty until the visitor scrolls.
    image.addEventListener('load', () => { if (ready) frame() })
    document.fonts.load('700 100px "Tektur Variable"').catch(() => {}).then(() => {
      ready = true; resize(); measure(); frame()
    })
    io.observe(section)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); copyWatch.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  })
</script>

<section class="hero" class:still bind:this={section} style={`--p:${progress}`}>
  <div class="stage">
    {#if still}
      <img class="photo fallback" src={photoSrc(photo).src} alt="" />
    {:else}
      <canvas bind:this={canvas} aria-hidden="true"></canvas>
      {#if video}<video bind:this={videoEl} src={video} muted loop playsinline autoplay preload="auto" aria-hidden="true"></video>{/if}
    {/if}
    <div class="copy" bind:this={copyEl}>{@render children?.()}</div>
    <span class="hint" aria-hidden="true">Прокрутите вниз</span>
  </div>
</section>

<style>
  .hero { position: relative; height: 230vh; }
  .hero.still { height: auto; }
  .stage { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; display: grid; }
  canvas, .fallback { position: absolute; inset: 0; width: 100%; height: 100%; }
  .fallback { object-fit: cover; opacity: .55; }
  video { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
  .copy { position: relative; z-index: 1; align-self: end; padding: 0 var(--gutter) clamp(32px, 7vh, 72px); max-width: var(--max); width: 100%; margin: 0 auto;
    opacity: calc(1 - var(--p) * 2.6); transform: translateY(calc(var(--p) * -40px)); }
  .still .copy { opacity: 1; transform: none; padding-top: 40vh; }
  .hint { position: absolute; right: var(--gutter); bottom: 28px; font-size: 13px; color: var(--concrete); writing-mode: vertical-rl; opacity: calc(1 - var(--p) * 4); }
  .hint::after { content: ''; display: block; width: 1px; height: 48px; margin: 12px auto 0; background: linear-gradient(var(--brass), transparent); animation: drip 1.8s ease-in-out infinite; }
  @keyframes drip { 0%, 100% { transform: scaleY(.3); transform-origin: top; } 50% { transform: scaleY(1); } }
  .still .hint { display: none; }
  /* Phones: the dashboard bar takes the bottom of the screen, the copy sits above it. */
  @media (max-width: 1320px) {
    .stage { height: calc(100svh - 64px - env(safe-area-inset-bottom)); }
  }
  @media (max-width: 640px) {
    .hint { display: none; }
    .copy { padding-bottom: 24px; }
    .copy :global(.lead) { font-size: 16px; }
    .copy :global(.hero-actions) { display: grid; grid-template-columns: 1fr 1fr; }
    .copy :global(.hero-actions .btn) { padding: 0 10px; height: 50px; }
  }
</style>
