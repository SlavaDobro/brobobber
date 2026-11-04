<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RotateCcw, ImageOff } from '@lucide/svelte'
  import { views } from './configurator'

  /** @type {{ paint: string, seat: string, source: string, axialRow: number, view?: number }} */
  let { paint, seat, source, axialRow, view = $bindable(0) } = $props()
  /** @type {HTMLCanvasElement} */
  let canvas
  let ready = $state(false)
  let failed = $state(false)
  let zoom = $state(false)
  let retry = $state(0)
  let pointerStart = 0
  let reducedMotion = false
  const sheets = new Map()
  const cache = new Map()

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = preference.matches
    const update = () => { reducedMotion = preference.matches }
    preference.addEventListener('change', update)
    return () => {
      preference.removeEventListener('change', update)
      if (canvas) gsap.killTweensOf(canvas)
    }
  })

  /** @param {string} path @returns {Promise<HTMLImageElement>} */
  function loadSheet(path) {
    if (!sheets.has(path)) {
      const request = new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => { sheets.delete(path); reject(new Error('Image failed')) }
        image.src = path
      })
      sheets.set(path, request)
    }
    return sheets.get(path)
  }

  /** @param {string} hex */
  function rgb(hex) {
    return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16))
  }

  /** Tint only the chromatic bodywork and leather, retaining neutral mechanical parts and highlights.
   * @param {ImageData} frame @param {string} bodyColor @param {string} leatherColor @param {number[]} seatBounds */
  function tintMaterials(frame, bodyColor, leatherColor, seatBounds) {
    const body = rgb(bodyColor)
    const leather = rgb(leatherColor)
    const pixels = frame.data
    for (let index = 0; index < pixels.length; index += 4) {
      if (!pixels[index + 3]) continue
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2]
      // Desaturate warm highlights and stitching inside the saddle as well as its base colour.
      // Bounds are expressed in a 768x512 frame and exclude warm metal elsewhere on the bike.
      const x = (index / 4 % frame.width) * 768 / frame.width
      const y = Math.floor(index / 4 / frame.width) * 512 / frame.height
      if (leatherColor === '#29292a' && x >= seatBounds[0] && x <= seatBounds[2]
        && y >= seatBounds[1] && y <= seatBounds[3] && r - g > 4 && g - b > 3) {
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        const tone = luminance * 0.34 + Math.max(0, luminance - 150) * 0.35
        pixels[index] = tone
        pixels[index + 1] = tone
        pixels[index + 2] = tone + 1
        continue
      }
      const bodyStrength = Math.min(g, b) - r
      const leatherStrength = r - Math.max(g, b)
      let target, strength, shade, reflection
      if (bodyStrength > 8 && g > 24 && b > 24) {
        target = body
        strength = Math.min(1, (bodyStrength - 8) / 30)
        shade = Math.max(g, b) / 165
        reflection = Math.max(0, Math.min(r, g, b) - 100) * 0.8
      } else if (leatherStrength > 12 && r > 35 && g > b * 1.12) {
        target = leather
        strength = Math.min(1, (leatherStrength - 12) / 24)
        shade = r / 155
        reflection = Math.max(0, b - 80) * 0.5
      } else continue
      for (let channel = 0; channel < 3; channel++) {
        const colored = Math.min(255, target[channel] * shade + reflection)
        pixels[index + channel] = pixels[index + channel] * (1 - strength) + colored * strength
      }
    }
    return frame
  }

  $effect(() => {
    const selectedView = views[view]
    // The exhaust is hidden in the left profile; share one frame to prevent wheel geometry changing.
    const path = selectedView.axial ? '/images/vrod-axial.png'
      : selectedView.frame === 3 ? '/images/vrod-short.png' : source
    const angle = selectedView.frame + (selectedView.axial ? axialRow * 2 : 0)
    const body = paint, leather = seat
    retry
    let cancelled = false
    ready = false
    failed = false
    loadSheet(path).then(image => {
      if (cancelled || !canvas) return
      const width = Math.floor(image.naturalWidth / 2)
      const height = Math.floor(image.naturalHeight / 2)
      const key = [path, angle, body, leather].join(':')
      let frame = cache.get(key)
      if (!frame) {
        const buffer = document.createElement('canvas')
        buffer.width = width
        buffer.height = height
        const context = buffer.getContext('2d', { willReadFrequently: true })
        if (!context) throw new Error('Canvas unavailable')
        context.drawImage(image, (angle % 2) * width, Math.floor(angle / 2) * height, width, height, 0, 0, width, height)
        frame = tintMaterials(context.getImageData(0, 0, width, height), body, leather, selectedView.seatBounds)
        if (cache.size >= 12) cache.delete(cache.keys().next().value)
        cache.set(key, frame)
      }
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas unavailable')
      context.putImageData(frame, 0, 0)
      ready = true
      gsap.fromTo(canvas, { opacity: 0.5 }, { opacity: 1, duration: reducedMotion ? 0 : 0.28, overwrite: true })
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
  <div class="bike-floor" aria-hidden="true"></div>
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
