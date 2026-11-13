<script>
  import { onMount } from 'svelte'
  import { base } from '$app/paths'
  import { gsap } from 'gsap'
  import { ChevronLeft, ChevronRight, ImageOff, Camera, Maximize2, Minimize2 } from '@lucide/svelte'
  import { views, environments } from './configurator'
  import { cameras, frameSize } from './bike-assets.js'
  import { renderBike } from './bike-renderer.js'
  import { loadView, prefetch } from './asset-cache.js'

  /** @typedef {{ hex: string | null, finish?: string }} Material */
  /** @type {{ paint: Material, leather: Material, wheels: Material, parts: string[], buildName: string, view?: number, environment?: string, onsnapshot?: (blob: Blob) => void }} */
  let { paint, leather, wheels, parts, buildName, view = $bindable(0), environment = $bindable('studio'), onsnapshot } = $props()

  /** @type {HTMLCanvasElement} */
  let canvas
  /** @type {HTMLDivElement} */
  let frameBox
  let ready = $state(false)
  let failed = $state(false)
  let close = $state(false)
  let retry = $state(0)
  let fit = $state({ width: 0, height: 0 })
  let pointerStart = 0
  let reducedMotion = false
  /** @type {Map<string, HTMLCanvasElement>} */
  const frames = new Map()
  const ratio = frameSize.width / frameSize.height

  let scene = $derived(environments.find(item => item.id === environment) || environments[0])

  // Turntable geometry: an ellipse seen slightly from above. 0° is nearest the viewer.
  const ring = { cx: 300, cy: 46, rx: 270, ry: 38 }
  /** @param {number} bearing */
  const onRing = bearing => {
    const a = bearing * Math.PI / 180
    return { x: ring.cx + ring.rx * Math.sin(a), y: ring.cy + ring.ry * Math.cos(a) }
  }
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const outer = onRing(i * 15), a = i * 15 * Math.PI / 180
    const inner = { x: ring.cx + (ring.rx - (i % 3 ? 7 : 13)) * Math.sin(a), y: ring.cy + (ring.ry - (i % 3 ? 1.5 : 3)) * Math.cos(a) }
    return { outer, inner, major: i % 3 === 0 }
  })

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = preference.matches
    const update = () => { reducedMotion = preference.matches }
    preference.addEventListener('change', update)
    // The motorcycle always fits the space it has: contain, never crop.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const w = Math.max(0, Math.min(width, height * ratio))
      fit = { width: Math.floor(w), height: Math.floor(w / ratio) }
    })
    observer.observe(frameBox)
    return () => {
      observer.disconnect()
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
      gsap.fromTo(canvas, { opacity: .82 }, { opacity: 1, duration: reducedMotion ? 0 : .25, overwrite: true })
      prefetch([views[(view + 1) % views.length].id, views[(view + views.length - 1) % views.length].id], layerParts)
    }).catch(() => {
      if (!cancelled) failed = true
    })
    return () => { cancelled = true }
  })

  /** Steps around the turntable in bearing order, so arrows feel like rotating the stand. @param {number} direction */
  function turn(direction) {
    const order = [...views.keys()].sort((a, b) => views[a].bearing - views[b].bearing)
    const at = order.indexOf(view)
    view = order[(at + direction + order.length) % order.length]
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
        image.src = base + scene.image
      })
      const scale = Math.max(1920 / backdrop.naturalWidth, 1080 / backdrop.naturalHeight)
      const w = backdrop.naturalWidth * scale, h = backdrop.naturalHeight * scale
      ctx.drawImage(backdrop, (1920 - w) / 2, (1080 - h) * scene.focusY, w, h)
    } else {
      ctx.fillStyle = '#d5d8d2'
      ctx.fillRect(0, 0, 1920, 1080)
      const glow = ctx.createRadialGradient(960, 520, 80, 960, 540, 980)
      glow.addColorStop(0, '#f2f3f0'); glow.addColorStop(1, '#f2f3f000')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, 1920, 1080)
    }
    const width = 1560, height = width / ratio
    ctx.drawImage(canvas, (1920 - width) / 2, 1080 - height - 30, width, height)
    ctx.font = '600 30px "Tektur Variable", sans-serif'
    ctx.fillStyle = scene.dark ? '#f2f3f0' : '#1d2023'
    ctx.fillText('Brobobber V-Rod', 60, 84)
    ctx.font = '400 24px "Golos Text Variable", sans-serif'
    ctx.fillText(buildName, 60, 122)
    out.toBlob(blob => { if (blob) onsnapshot?.(blob) }, 'image/png')
  }
</script>

<div class="bay" class:dark={scene.dark}>
  {#if scene.image}<img class="bay-backdrop" src={base + scene.image} alt="" style={'object-position: 50% ' + scene.focusY * 100 + '%'} />{/if}

  <div class="bay-tools">
    <div class="scene-switch" role="group" aria-label="Где стоит мотоцикл">
      {#each environments as item}
        <button class:active={environment === item.id} aria-pressed={environment === item.id} onclick={() => environment = item.id}>{item.name}</button>
      {/each}
    </div>
    <button class="tool-button close-up" aria-pressed={close} aria-label={close ? 'Показать мотоцикл целиком' : 'Подойти ближе'} title={close ? 'Целиком' : 'Ближе'} onclick={() => close = !close}>
      {#if close}<Minimize2 size={17} />{:else}<Maximize2 size={17} />{/if}
    </button>
    <button class="tool-button" aria-label="Сохранить картинку сборки" title="Сохранить картинку" disabled={!ready} onclick={snapshot}><Camera size={17} /></button>
  </div>

  <div class="bay-frame" bind:this={frameBox}>
    <div class="bay-fit" class:close style={fit.width ? `width:${fit.width}px;height:${fit.height}px` : 'width:100%;aspect-ratio:1536/1100'}>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <canvas bind:this={canvas} tabindex="0" {onkeydown}
        aria-label={'Harley-Davidson V-Rod, ' + views[view].name.toLowerCase() + '. Стрелки влево и вправо поворачивают стенд'} aria-busy={!ready && !failed}
        onpointerdown={event => { pointerStart = event.clientX }}
        onpointerup={event => { const distance = event.clientX - pointerStart; if (Math.abs(distance) > 45) turn(distance < 0 ? 1 : -1) }}
      ></canvas>
    </div>
    {#if !ready && !failed}<div class="bay-status" role="status">Выкатываем мотоцикл</div>{/if}
    {#if failed}
      <div class="bay-status error" role="alert"><ImageOff size={22} /><p>Ракурс не загрузился. Проверьте соединение.</p><button onclick={() => retry++}>Загрузить снова</button></div>
    {/if}
  </div>

  <div class="turntable">
    <button class="turn-button" aria-label="Повернуть стенд влево" onclick={() => turn(-1)}><ChevronLeft size={20} /></button>
    <div class="dial" role="group" aria-label="Поворотный стенд: где стоит камера">
      <svg viewBox="0 0 600 92" aria-hidden="true">
        <ellipse cx={ring.cx} cy={ring.cy} rx={ring.rx} ry={ring.ry} class="ring-line" />
        <ellipse cx={ring.cx} cy={ring.cy} rx={ring.rx - 22} ry={ring.ry - 6} class="ring-inner" />
        {#each ticks as tick}
          <line x1={tick.inner.x} y1={tick.inner.y} x2={tick.outer.x} y2={tick.outer.y} class:major={tick.major} class="ring-tick" />
        {/each}
        <line x1={ring.cx} y1={ring.cy} x2={onRing(views[view].bearing).x} y2={onRing(views[view].bearing).y} class="ring-needle" />
        <circle cx={ring.cx} cy={ring.cy} r="3" class="ring-hub" />
      </svg>
      {#each views as angle, index}
        {@const point = onRing(angle.bearing)}
        <button class="camera-node" class:active={view === index} class:far={angle.bearing > 90 && angle.bearing < 270}
          style={`left:${point.x / 6}%;top:${point.y / .92}%`} aria-pressed={view === index} aria-label={angle.name}
          onclick={() => view = index}><span class="node-dot"></span><span class="node-label">{angle.bearing}°</span></button>
      {/each}
    </div>
    <button class="turn-button" aria-label="Повернуть стенд вправо" onclick={() => turn(1)}><ChevronRight size={20} /></button>
    <p class="view-caption" aria-live="polite">{views[view].name}</p>
  </div>
</div>
