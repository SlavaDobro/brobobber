import { frameSize } from './bike-assets.js'

/** @typedef {typeof import('./bike-assets.js').bikeAssets[number]} Camera */
/** @param {string} hex */
function rgb(hex) {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16))
}

/** @param {number} x @param {number} y @param {number[][]} regions */
export function inRegions(x, y, regions) {
  return regions.some(([left, top, right, bottom]) => x >= left && x <= right && y >= top && y <= bottom)
}

/** The saddle mask prevents its material from recolouring warm metal on the engine.
 * @param {ImageData} frame @param {string} paint @param {string} seat @param {Camera} camera */
export function tintMaterials(frame, paint, seat, camera) {
  const body = rgb(paint), leather = rgb(seat), pixels = frame.data
  for (let i = 0; i < pixels.length; i += 4) {
    if (!pixels[i + 3]) continue
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
    const x = (i / 4) % frame.width, y = Math.floor(i / 4 / frame.width)
    const saddle = inRegions(x, y, camera.seatRegions)
    if (saddle && r - g > 3 && g - b > 2) {
      const luminance = .2126 * r + .7152 * g + .0722 * b
      if (seat === '#29292a') {
        // Neutral stitching and highlights, retaining the photographic leather texture.
        const tone = luminance * .39 + Math.max(0, luminance - 150) * .4
        pixels[i] = tone; pixels[i + 1] = tone; pixels[i + 2] = tone + 1
      } else {
        for (let c = 0; c < 3; c++) pixels[i + c] = Math.min(255, leather[c] * r / 155 + Math.max(0, b - 80) * .5)
      }
      continue
    }
    const chroma = Math.min(g, b) - r
    if (chroma <= 8 || g <= 24 || b <= 24) continue
    const strength = Math.min(1, (chroma - 8) / 30)
    const shade = Math.max(g, b) / 165
    const reflection = Math.max(0, Math.min(r, g, b) - 100) * .8
    for (let c = 0; c < 3; c++) {
      const colored = Math.min(255, body[c] * shade + reflection)
      pixels[i + c] = pixels[i + c] * (1 - strength) + colored * strength
    }
  }
  return frame
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y
 * @param {number} rx @param {number} ry @param {number} opacity */
function ellipseShadow(ctx, x, y, rx, ry, opacity) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(rx, ry)
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
  gradient.addColorStop(0, `rgba(24, 32, 25, ${opacity})`)
  gradient.addColorStop(.35, `rgba(24, 32, 25, ${opacity * .6})`)
  gradient.addColorStop(1, 'rgba(24, 32, 25, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(-1, -1, 2, 2)
  ctx.restore()
}

/** @param {CanvasRenderingContext2D} ctx @param {Camera} camera */
export function drawFloor(ctx, camera) {
  const points = camera.contacts
  if (points.length === 2) {
    const [a, b] = points
    ctx.save()
    ctx.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 3)
    ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]))
    ellipseShadow(ctx, 0, 0, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + 155, 50, .22)
    ctx.restore()
  } else {
    ellipseShadow(ctx, points[0][0], points[0][1] - 14, points[0][2] * 2.5, 80, .22)
  }
  for (const [x, y, radius] of points) {
    ellipseShadow(ctx, x, y + 1, radius * 1.7, 24, .28)
    ellipseShadow(ctx, x, y, radius, 9, .64)
  }
}

/** Axial cameras show the same header/outlet alignment. Only the visible can's finish changes.
 * @param {ImageData} frame @param {Camera} camera */
function darkenAxialExhaust(frame, camera) {
  for (let i = 0; i < frame.data.length; i += 4) {
    const x = (i / 4) % frame.width, y = Math.floor(i / 4 / frame.width)
    if (!inRegions(x, y, camera.exhaustRegions) || !frame.data[i + 3]) continue
    const r = frame.data[i], g = frame.data[i + 1], b = frame.data[i + 2]
    // Preserve the dark bores, neutral steel lips and neighbouring black structure.
    if (r - b < 8 || r < 55) continue
    const tone = (.2126 * r + .7152 * g + .0722 * b) * .35
    frame.data[i] = tone; frame.data[i + 1] = tone; frame.data[i + 2] = tone + 1
  }
}

/** Renders the registered part only inside its allowed footprint.
 * @param {CanvasRenderingContext2D} ctx @param {CanvasImageSource} overlay @param {Camera} camera */
export function drawExhaust(ctx, overlay, camera) {
  ctx.save()
  ctx.beginPath()
  for (const [x, y, right, bottom] of camera.exhaustRegions) ctx.rect(x, y, right - x, bottom - y)
  ctx.clip()
  const [sx, sy, x, y] = camera.placement || [1, 1, 0, 0]
  ctx.translate(x, y)
  ctx.scale(sx, sy)
  ctx.drawImage(overlay, 0, 0, 1536, 1024)
  ctx.restore()
}

/** Pure drawing entry point, shared by the browser and the asset regression tests.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ base: CanvasImageSource, overlay?: CanvasImageSource, camera: Camera, paint: string, seat: string, exhaust: string, floor?: boolean }} options */
export function renderBike(ctx, { base, overlay, camera, paint, seat, exhaust, floor = true }) {
  ctx.clearRect(0, 0, frameSize.width, frameSize.height)
  ctx.drawImage(base, 0, 0, 1536, 1024)
  const pixels = tintMaterials(ctx.getImageData(0, 0, 1536, 1024), paint, seat, camera)
  if (exhaust === 'twin' && !camera.overlay) darkenAxialExhaust(pixels, camera)
  ctx.putImageData(pixels, 0, 0)
  if (exhaust === 'twin' && overlay) drawExhaust(ctx, overlay, camera)
  // The floor is independent of every option and remains behind all transparent parts.
  if (floor) {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    drawFloor(ctx, camera)
    ctx.restore()
  }
}
