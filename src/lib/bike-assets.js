import manifest from './vrod-layers.json'

// One frozen photograph per camera. Options never swap the photograph: they replace
// pixels inside registered layers cut from Astra edits of that same photograph,
// and recolour materials through per-view masks. See docs/vrod-assets.md.
export { frameSize } from './bike-renderer.js'
export { cameras } from './cameras.js'

/** @typedef {{ materials: string | null, stats: Record<string, { luminance: number, pixels: number } | null>, layers: Record<string, { box: number[], over?: boolean }> }} ViewAssets */
/** @type {Record<string, ViewAssets>} */
export const viewAssets = manifest.views

/** @param {string} file */
export const assetUrl = file => `/images/vrod/${file}`
export const baseFile = (/** @type {string} */ view) => `${view}.png`
export const layerFiles = (/** @type {string} */ view, /** @type {string} */ part) => ({ content: `layers/${view}-${part}.png`, meta: `layers/${view}-${part}-meta.png` })
