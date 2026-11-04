<script>
  import { frameSize, cameras } from './bike-assets.js'
  import { renderBike } from './bike-renderer.js'
  import { loadView } from './asset-cache.js'

  /** @typedef {{ hex: string | null, finish?: string }} Material */
  /** Close-up of a part, rendered from the same photograph and layers as the main view.
   * @type {{ view?: string, parts: string[], crop: number[], paint: Material, leather: Material, wheels: Material }} */
  let { view = 'right', parts, crop, paint, leather, wheels } = $props()
  /** @type {HTMLCanvasElement} */
  let canvas

  $effect(() => {
    const layerParts = [...parts], [left, top, width, height] = crop
    const materials = { paint: { ...paint }, leather: { ...leather }, wheels: { ...wheels } }
    let cancelled = false
    loadView(view, layerParts).then(assets => {
      if (cancelled || !canvas) return
      const buffer = document.createElement('canvas')
      buffer.width = frameSize.width
      buffer.height = frameSize.height
      const ctx = buffer.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      const camera = cameras.find(item => item.id === view) || cameras[0]
      renderBike(ctx, { ...assets, ...materials, contacts: camera.contacts, floor: false })
      const target = canvas.getContext('2d')
      if (!target) return
      target.clearRect(0, 0, canvas.width, canvas.height)
      target.drawImage(buffer, left, top, width, height, 0, 0, canvas.width, canvas.height)
    }).catch(() => { /* Decorative: the option text stays available. */ })
    return () => { cancelled = true }
  })
</script>

<canvas class="part-preview" width={Math.round(crop[2] / crop[3] * 120)} height="120" bind:this={canvas} aria-hidden="true"></canvas>
