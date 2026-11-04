<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RotateCcw, ImageOff } from '@lucide/svelte'
  import { views } from './configurator'
  import { bikeAssets, assetPath, frameSize } from './bike-assets.js'
  import { renderBike } from './bike-renderer.js'

  /** @type {{ paint: string, seat: string, exhaust: string, view?: number }} */
  let { paint, seat, exhaust, view = $bindable(0) } = $props()
  /** @type {HTMLCanvasElement} */
  let canvas
  let ready = $state(false)
  let failed = $state(false)
  let zoom = $state(false)
  let retry = $state(0)
  let pointerStart = 0
  let reducedMotion = false
  /** @type {Map<string, Promise<HTMLImageElement>>} */
  const images = new Map()
  /** @type {Map<string, HTMLCanvasElement>} */
  const cache = new Map()

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = preference.matches
    const update = () => { reducedMotion = preference.matches }
    preference.addEventListener('change', update)
    return () => {
      preference.removeEventListener('change', update)
      if (canvas) gsap.killTweensOf(canvas)
      cache.clear()
      images.clear()
    }
  })

  /** @param {string} id @returns {Promise<HTMLImageElement>} */
  function loadImage(id) {
    if (!images.has(id)) {
      const request = new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => { images.delete(id); reject(new Error('Image failed')) }
        image.src = assetPath(id)
      })
      images.set(id, request)
    }
    return images.get(id)
  }

  $effect(() => {
    const camera = bikeAssets[view]
    const body = paint, leather = seat, pipes = exhaust
    retry
    let cancelled = false
    ready = false
    failed = false
    Promise.all([
      loadImage(camera.id),
      pipes === 'twin' && camera.overlay ? loadImage(camera.overlay) : Promise.resolve(undefined),
    ]).then(([base, overlay]) => {
      if (cancelled || !canvas) return
      const key = [camera.id, body, leather, pipes].join(':')
      let frame = cache.get(key)
      if (!frame) {
        frame = document.createElement('canvas')
        frame.width = frameSize.width
        frame.height = frameSize.height
        const context = frame.getContext('2d', { willReadFrequently: true })
        if (!context) throw new Error('Canvas unavailable')
        renderBike(context, { base, overlay, camera, paint: body, seat: leather, exhaust: pipes })
        // Bound decoded memory; source photographs remain cached separately.
        if (cache.size >= 6) cache.delete(cache.keys().next().value)
        cache.set(key, frame)
      }
      canvas.width = frameSize.width
      canvas.height = frameSize.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas unavailable')
      context.drawImage(frame, 0, 0)
      ready = true
      gsap.fromTo(canvas, { opacity: .75 }, { opacity: 1, duration: reducedMotion ? 0 : .2, overwrite: true })
    }).catch(() => {
      if (!cancelled) { failed = true; ready = false }
    })
    return () => { cancelled = true }
  })

  /** @param {number} direction */
  function turn(direction) {
    view = (view + direction + views.length) % views.length
  }
</script>

<div class="bike-viewer">
  <div class="viewer-caption"><span>Студия Brobobber</span><span>V-Rod / индивидуальная сборка</span></div>
  <div class="ghost-title" aria-hidden="true">V-ROD</div>

  <div class:zoomed={zoom} class="canvas-wrap">
    <canvas bind:this={canvas} aria-label={'Harley-Davidson V-Rod — ' + views[view].name} aria-busy={!ready && !failed}
      onpointerdown={event => { pointerStart = event.clientX }}
      onpointerup={event => { const distance = event.clientX - pointerStart; if (Math.abs(distance) > 45) turn(distance < 0 ? 1 : -1) }}
    ></canvas>
  </div>
  {#if !ready && !failed}<div class="viewer-loading" role="status">Подготавливаем ракурс<span></span></div>{/if}
  {#if failed}
    <div class="viewer-error" role="alert"><ImageOff size={24} /><p>Не удалось загрузить мотоцикл</p><button onclick={() => retry++}>Повторить загрузку</button></div>
  {/if}
  <div class="viewer-tools">
    <button class="icon-button" aria-label={zoom ? 'Уменьшить мотоцикл' : 'Приблизить мотоцикл'} aria-pressed={zoom} onclick={() => zoom = !zoom}>{#if zoom}<ZoomOut size={19} />{:else}<ZoomIn size={19} />{/if}</button>
    <button class="icon-button" aria-label="Вернуть правый профиль" onclick={() => { view = 0; zoom = false }}><RotateCcw size={17} /></button>
  </div>
  <div class="viewer-bottom">
    <div class="view-direction"><span class="live-dot"></span><span aria-live="polite">{views[view].name}</span></div>
    <div class="view-navigation">
      <button class="icon-button" aria-label="Предыдущий ракурс" onclick={() => turn(-1)}><ArrowLeft size={18} /></button>
      <span class="view-counter">{String(view + 1).padStart(2, '0')}<span> / {String(views.length).padStart(2, '0')}</span></span>
      <button class="icon-button" aria-label="Следующий ракурс" onclick={() => turn(1)}><ArrowRight size={18} /></button>
    </div>
  </div>
  <div class="angle-tabs" role="group" aria-label="Шесть ракурсов мотоцикла">
    {#each views as angle, index}
      <button class:active={view === index} aria-label={angle.name} aria-pressed={view === index} onclick={() => view = index}>
        <span class="angle-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span class="angle-compass" style={'--bearing:' + angle.bearing + 'deg'} aria-hidden="true"><span></span></span>
        <span>{angle.short}</span>
      </button>
    {/each}
  </div>
</div>
