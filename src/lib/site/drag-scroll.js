// Svelte action for horizontal scroll rows (video reel, reviews): hold the left mouse button and
// drag to scroll, throw to glide. Touch and trackpads keep native scrolling; snap is switched off
// while dragging and back on after the glide so the row settles on a card. A drag never clicks.

/** @param {HTMLElement} node */
export function dragScroll(node) {
  let startX = 0, from = 0, moved = 0, down = false, velocity = 0, last = 0, lastX = 0, raf = 0

  const stop = () => { cancelAnimationFrame(raf); raf = 0 }
  const settle = () => { node.style.scrollSnapType = ''; node.classList.remove('is-dragging') }

  /** @param {PointerEvent} e */
  function pointerdown(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    stop()
    down = true; moved = 0; velocity = 0
    startX = lastX = e.clientX; from = node.scrollLeft; last = e.timeStamp
    window.addEventListener('pointermove', pointermove)
    window.addEventListener('pointerup', pointerup)
    window.addEventListener('pointercancel', pointerup)
  }

  /** @param {PointerEvent} e */
  function pointermove(e) {
    if (!down) return
    const dx = e.clientX - startX
    moved = Math.max(moved, Math.abs(dx))
    if (moved < 4) return
    node.style.scrollSnapType = 'none'
    node.classList.add('is-dragging')
    node.scrollLeft = from - dx
    const dt = e.timeStamp - last
    if (dt > 0) velocity = .8 * (-(e.clientX - lastX) / dt) + .2 * velocity // px per ms
    last = e.timeStamp; lastX = e.clientX
  }

  /** @param {PointerEvent} e */
  function pointerup(e) {
    down = false
    window.removeEventListener('pointermove', pointermove)
    window.removeEventListener('pointerup', pointerup)
    window.removeEventListener('pointercancel', pointerup)
    if (moved < 4) return settle()
    if (e.timeStamp - last > 80 || matchMedia('(prefers-reduced-motion: reduce)').matches) velocity = 0
    velocity = Math.max(-2.4, Math.min(2.4, velocity)) // a throw glides at most ~600 px
    let prev = performance.now()
    const glide = (/** @type {number} */ now) => {
      const dt = Math.min(32, now - prev); prev = now
      const before = node.scrollLeft
      node.scrollLeft += velocity * dt
      velocity *= Math.exp(-dt / 260)
      // Stop at either end of the row instead of pushing against it.
      if (node.scrollLeft === before && dt > 0) velocity = 0
      if (Math.abs(velocity) > .03) raf = requestAnimationFrame(glide)
      else { raf = 0; settle() }
    }
    if (Math.abs(velocity) > .03) raf = requestAnimationFrame(glide)
    else settle()
  }

  /** @param {MouseEvent} e */
  function click(e) {
    if (moved >= 4) { e.preventDefault(); e.stopPropagation(); moved = 0 }
  }

  /** @param {DragEvent} e */
  const dragstart = e => e.preventDefault()

  node.addEventListener('pointerdown', pointerdown)
  node.addEventListener('click', click, true)
  node.addEventListener('dragstart', dragstart)
  return {
    destroy() {
      stop()
      node.removeEventListener('pointerdown', pointerdown)
      node.removeEventListener('click', click, true)
      node.removeEventListener('dragstart', dragstart)
      window.removeEventListener('pointermove', pointermove)
      window.removeEventListener('pointerup', pointerup)
      window.removeEventListener('pointercancel', pointerup)
    },
  }
}
