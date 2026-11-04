<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, ImageOff, Camera } from '@lucide/svelte'
  import { views, environments } from './configurator'
  import { cameras, frameSize } from './bike-assets.js'
  import { renderBike } from './bike-renderer.js'
  import { loadView, prefetch } from './asset-cache.js'

  /** @typedef {{ hex: string | null, finish?: string }} Material */
  /** @type {{ paint: Material, leather: Material, wheels: Material, parts: string[], buildName: string, view?: number, environment?: string, onsnapshot?: (blob: Blob) => void }} */
  let { paint, leather, wheels, parts, buildName, view = $bindable(0), environment = $bindable('studio'), onsnapshot } = $props()

  /** @type {HTMLCanvasElement} */
  let canvas
  let ready = $state(false)
  let failed = $state(false)
  let zoom = $state(false)
  let retry = $state(0)
  let pointerStart = 0
  let reducedMotion = false
  /** @type {Map<string, HTMLCanvasElement>} */
  const frames = new Map()

  let scene = $derived(environments.find(item => item.id === environment) || environments[0])

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = preference.matches
    const update = () => { reducedMotion = preference.matches }
    preference.addEventListener('change', update)
    return () => {
      preference.removeEventListener('change', update)
      if (canvas) gsap.killTweensOf(canvas)
      frames.clear()
    }
  })

  /** @param {string} id @param {string[]} layerParts */
  async function frameFor(id, layerParts) {
    const key = [id, paint.hex, paint.finish, leather.hex, wheels.hex, wheels.finish, ...layerParts].join(':')
    let frame = frames.get(key)
    if (frame) return frame
    const assets = await loadView(id, layerParts)
    frame = document.createElement('canvas')
    frame.width = frameSize.width
    frame.height = frameSize.height
    const context = frame.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas unavailable')
    const camera = cameras.find(item => item.id === id) || cameras[0]
    renderBike(context, { ...assets, paint, leather, wheels, contacts: camera.contacts })
    // Bound decoded memory; source images stay cached separately.
    if (frames.size >= 8) frames.delete(/** @type {string} */ (frames.keys().next().value))
    frames.set(key, frame)
    return frame
  }

  $effect(() => {
    const id = views[view].id
    const layerParts = [...parts]
    paint.hex; paint.finish; leather.hex; wheels.hex; wheels.finish
    retry
    let cancelled = false
    failed = false
    frameFor(id, layerParts).then(frame => {
      if (cancelled || !canvas) return
      canvas.width = frameSize.width
      canvas.height = frameSize.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas unavailable')
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(frame, 0, 0)
      ready = true
      gsap.fromTo(canvas, { opacity: .8 }, { opacity: 1, duration: reducedMotion ? 0 : .22, overwrite: true })
      // Neighbouring cameras load in the background so turning feels instant.
      prefetch([views[(view + 1) % views.length].id, views[(view + views.length - 1) % views.length].id], layerParts)
    }).catch(() => {
      if (!cancelled) failed = true
    })
    return () => { cancelled = true }
  })

  /** @param {number} direction */
  function turn(direction) {
    view = (view + direction + views.length) % views.length
  }

  /** @param {KeyboardEvent} event */
  function onkeydown(event) {
    if (event.key === 'ArrowLeft') { turn(-1); event.preventDefault() }
    if (event.key === 'ArrowRight') { turn(1); event.preventDefault() }
  }

  /** 1920×1080 picture of the build in the current environment. */
  async function snapshot() {
    if (!canvas || !ready) return
    const out = document.createElement('canvas')
    out.width = 1920; out.height = 1080
    const ctx = out.getContext('2d')
    if (!ctx) return
    if (scene.image) {
      const backdrop = await new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = scene.image
      })
      const scale = Math.max(1920 / backdrop.naturalWidth, 1080 / backdrop.naturalHeight)
      const w = backdrop.naturalWidth * scale, h = backdrop.naturalHeight * scale
      ctx.drawImage(backdrop, (1920 - w) / 2, (1080 - h) * scene.focusY, w, h)
    } else {
      const gradient = ctx.createRadialGradient(860, 380, 60, 960, 540, 1100)
      gradient.addColorStop(0, '#fafbf7'); gradient.addColorStop(.45, '#eff1e9'); gradient.addColorStop(1, '#dde3d7')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1920, 1080)
    }
    const scale = 1560 / frameSize.width
    ctx.drawImage(canvas, (1920 - 1560) / 2, 1080 - frameSize.height * scale - 40, 1560, frameSize.height * scale)
    ctx.font = '600 22px "Oswald Variable", sans-serif'
    ctx.fillStyle = scene.dark ? '#f3f1ea' : '#202a26'
    ctx.fillText('BROBOBBER · V-ROD · ' + buildName.toUpperCase(), 56, 72)
    out.toBlob(blob => { if (blob) onsnapshot?.(blob) }, 'image/png')
  }
</script>

<div class="stage" class:dark={scene.dark} role="region" aria-label="Просмотр мотоцикла. Стрелки влево и вправо меняют ракурс">
  {#if scene.image}
    <img class="stage-backdrop" src={scene.image} alt="" style={'object-position: 50% ' + scene.focusY * 100 + '%'} />
  {:else}
    <div class="ghost-title" aria-hidden="true">V-ROD</div>
  {/if}

  <div class="stage-top">
    <div class="stage-title"><span>Студия Brobobber</span><strong>V-Rod · {buildName}</strong></div>
    <div class="stage-tools">
      <div class="scene-switch" role="group" aria-label="Окружение">
        {#each environments as item}
          <button class:active={environment === item.id} aria-pressed={environment === item.id} onclick={() => environment = item.id}>{item.name}</button>
        {/each}
      </div>
      <button class="icon-button zoom-button" aria-label={zoom ? 'Уменьшить мотоцикл' : 'Приблизить мотоцикл'} aria-pressed={zoom} onclick={() => zoom = !zoom}>{#if zoom}<ZoomOut size={18} />{:else}<ZoomIn size={18} />{/if}</button>
      <button class="icon-button" aria-label="Сохранить изображение сборки" disabled={!ready} onclick={snapshot}><Camera size={18} /></button>
    </div>
  </div>

  <div class:zoomed={zoom} class="canvas-wrap">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <canvas bind:this={canvas} tabindex="0" {onkeydown} aria-label={'Harley-Davidson V-Rod, ' + views[view].name} aria-busy={!ready && !failed}
      onpointerdown={event => { pointerStart = event.clientX }}
      onpointerup={event => { const distance = event.clientX - pointerStart; if (Math.abs(distance) > 45) turn(distance < 0 ? 1 : -1) }}
    ></canvas>
  </div>
  {#if !ready && !failed}<div class="viewer-loading" role="status">Готовим мотоцикл<span></span></div>{/if}
  {#if failed}
    <div class="viewer-error" role="alert"><ImageOff size={24} /><p>Не удалось загрузить ракурс</p><button onclick={() => retry++}>Повторить</button></div>
  {/if}

  <div class="stage-nav">
    <button class="icon-button" aria-label="Предыдущий ракурс" onclick={() => turn(-1)}><ArrowLeft size={18} /></button>
    <div class="view-dots" role="group" aria-label="Ракурсы">
      {#each views as angle, index}
        <button class:active={view === index} aria-label={angle.name} aria-pressed={view === index} onclick={() => view = index}><span></span></button>
      {/each}
    </div>
    <button class="icon-button" aria-label="Следующий ракурс" onclick={() => turn(1)}><ArrowRight size={18} /></button>
    <span class="view-name" aria-live="polite">{views[view].name}</span>
  </div>
</div>
