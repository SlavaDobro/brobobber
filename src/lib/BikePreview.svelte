<script>
  import { onMount } from 'svelte'
  import { bikeAssets, assetPath, frameSize } from './bike-assets.js'
  import { renderBike } from './bike-renderer.js'

  /** @type {{ exhaust: string }} */
  let { exhaust } = $props()
  /** @type {HTMLCanvasElement} */
  let canvas

  /** @param {string} id @returns {Promise<HTMLImageElement>} */
  function load(id) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = assetPath(id)
    })
  }

  onMount(() => {
    let cancelled = false
    const camera = bikeAssets[0]
    Promise.all([load(camera.id), exhaust === 'twin' ? load(camera.overlay) : undefined])
      .then(([base, overlay]) => {
        if (cancelled || !canvas) return
        const buffer = document.createElement('canvas')
        buffer.width = frameSize.width; buffer.height = frameSize.height
        const ctx = buffer.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        renderBike(ctx, { base, overlay, camera, paint: '#3c4247', seat: '#29292a', exhaust, floor: false })
        canvas.getContext('2d')?.drawImage(buffer, 0, 0, canvas.width, canvas.height)
      }).catch(() => { /* Decorative preview: the option label remains available. */ })
    return () => { cancelled = true }
  })
</script>

<canvas class="exhaust-preview" width="240" height="172" bind:this={canvas} aria-hidden="true"></canvas>
