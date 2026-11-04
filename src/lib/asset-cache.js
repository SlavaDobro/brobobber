import { viewAssets, assetUrl, baseFile, layerFiles } from './bike-assets.js'

/** @type {Map<string, Promise<HTMLImageElement>>} */
const images = new Map()
/** @type {Map<string, Promise<ImageData>>} */
const pixelCache = new Map()

/** @param {string} file @returns {Promise<HTMLImageElement>} */
export function loadImage(file) {
  let request = images.get(file)
  if (!request) {
    request = new Promise((resolve, reject) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => resolve(image)
      image.onerror = () => { images.delete(file); reject(new Error(`Image failed: ${file}`)) }
      image.src = assetUrl(file)
    })
    images.set(file, request)
  }
  return request
}

/** Decoded RGBA pixels of an asset (masks and layers are read, not drawn).
 * @param {string} file @returns {Promise<ImageData>} */
function loadPixels(file) {
  let request = pixelCache.get(file)
  if (!request) {
    request = loadImage(file).then(image => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) throw new Error('Canvas unavailable')
      ctx.drawImage(image, 0, 0)
      return ctx.getImageData(0, 0, canvas.width, canvas.height)
    })
    request.catch(() => pixelCache.delete(file))
    pixelCache.set(file, request)
  }
  return request
}

/** Everything needed to render one camera with the given layers.
 * Layers that do not exist for this camera (a part hidden from it) are skipped.
 * @param {string} view @param {string[]} parts */
export async function loadView(view, parts) {
  const assets = viewAssets[view]
  const available = parts.filter(part => assets?.layers?.[part])
  const [base, materials, ...layers] = await Promise.all([
    loadImage(baseFile(view)),
    assets?.materials ? loadPixels(assets.materials) : Promise.resolve(null),
    ...available.map(async part => {
      const files = layerFiles(view, part)
      const [content, meta] = await Promise.all([loadPixels(files.content), loadPixels(files.meta)])
      return { content, meta, box: assets.layers[part].box }
    }),
  ])
  return { base, materials, layers, stats: assets?.stats || {} }
}

/** Warms the cache for other cameras without blocking the current one. @param {string[]} views @param {string[]} parts */
export function prefetch(views, parts) {
  for (const view of views) loadView(view, parts).catch(() => { /* Retried when the view is opened. */ })
}
