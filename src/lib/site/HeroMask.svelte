<script>
  // Home hero: the workshop picture (or video) is seen only through the giant word BROBOBBER.
  // Scrolling grows the letters until the picture fills the screen. Drawn on canvas so the
  // window follows the real Tektur glyphs. With reduced motion it is a plain photo hero.
  import { photoSrc } from './data.js'

  /** @type {{ photo: string, video?: string, word?: string, children?: import('svelte').Snippet }} */
  let { photo, video, word = 'BROBOBBER', children } = $props()

  /** @type {HTMLElement} */ let section
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
    let raf = 0, visible = true, width = 0, height = 0, ready = false
    const media = () => (videoEl && videoEl.readyState >= 2 ? videoEl : image)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = cnv.clientWidth; height = cnv.clientHeight
      cnv.width = Math.round(width * dpr); cnv.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
      ctx.drawImage(m, (width - mw * scale) / 2, (height - mh * scale) * .55, mw * scale, mh * scale)
    }
    const frame = () => {
      raf = 0
      if (!ready) return
      const p = progress
      const grow = 1 + Math.pow(p, 2.2) * 26
      ctx.clearRect(0, 0, width, height)
      // 1. The picture, clipped to the letters.
      ctx.save()
      drawMedia(1.12 - p * .12)
      ctx.globalCompositeOperation = 'destination-in'
      const size = Math.min(width * .2, height * .42)
      ctx.font = `700 ${size}px "Tektur Variable"`
      // @ts-ignore: fontStretch is supported by Chromium and Firefox canvas
      ctx.fontStretch = 'condensed'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      // On tall phone screens the text block takes the lower half: keep the word above it.
      ctx.translate(width / 2, height * (height > width * 1.2 ? .3 : .46))
      ctx.scale(grow, grow)
      ctx.fillStyle = '#000'
      ctx.fillText(word, 0, 0)
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

    Promise.all([document.fonts.load('700 100px "Tektur Variable"'), image.decode().catch(() => {})]).then(() => {
      ready = true; resize(); measure(); request()
    })
    io.observe(section)
    window.addEventListener('resize', onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      window.removeEventListener('resize', onScroll)
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
    <div class="copy">{@render children?.()}</div>
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
</style>
