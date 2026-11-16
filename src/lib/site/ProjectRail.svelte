<script>
  // Projects as an endless carousel: the row drifts on its own like a conveyor in the workshop,
  // stops under the cursor, a finger or keyboard focus, and can be dragged with the mouse or a
  // finger; a quick throw keeps it rolling and slowing down before the drift picks up again.
  // The list is rendered twice so the loop has no seam; the copy is hidden from assistive tech.
  import ProjectCard from './ProjectCard.svelte'

  /** @type {{ projects: import('./data.js').Project[], children?: import('svelte').Snippet }} */
  let { projects, children } = $props()

  const speed = 42 // px per second
  /** @type {HTMLElement} */ let track
  /** @type {HTMLElement} */ let viewport
  let offset = $state(0)
  let loop = 0 // width of one copy of the list, gap included
  let hover = $state(false)
  let focusInside = $state(false)
  let dragging = $state(false)
  let still = $state(false) // reduced motion: no drift, dragging still works
  let moved = 0
  let fling = 0 // px per second left over from a throw, decays in the tick

  let drifting = $derived(!still && !hover && !focusInside && !dragging)

  const wrap = (/** @type {number} */ x) => loop ? ((x % loop) + loop) % loop : x

  $effect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    still = motion.matches
    const measure = () => {
      const first = track.children[0], second = track.children[projects.length]
      if (first && second) loop = /** @type {HTMLElement} */ (second).offsetLeft - /** @type {HTMLElement} */ (first).offsetLeft
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(track)
    let raf = 0, last = performance.now(), visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(viewport)
    const tick = (/** @type {number} */ now) => {
      const dt = Math.min(64, now - last) / 1000
      last = now
      if (fling && !dragging) {
        offset = wrap(offset + fling * dt)
        fling *= Math.exp(-dt * 3.2)
        if (Math.abs(fling) < 8) fling = 0
      } else if (drifting && visible && !document.hidden) {
        offset = wrap(offset + speed * dt)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); resize.disconnect(); io.disconnect() }
  })


  /** @param {PointerEvent} e */
  function down(e) {
    if (e.button !== 0) return
    dragging = true
    moved = 0
    fling = 0
    const startX = e.clientX, from = offset
    // Recent positions give the release speed for the throw.
    /** @type {{ x: number, t: number }[]} */ let trail = [{ x: e.clientX, t: e.timeStamp }]
    const move = (/** @type {PointerEvent} */ ev) => {
      moved = Math.max(moved, Math.abs(ev.clientX - startX))
      offset = wrap(from - (ev.clientX - startX))
      trail.push({ x: ev.clientX, t: ev.timeStamp })
      trail = trail.filter(p => ev.timeStamp - p.t < 100)
    }
    const up = (/** @type {PointerEvent} */ ev) => {
      const first = trail[0], dt = (ev.timeStamp - first.t) / 1000
      if (ev.type === 'pointerup' && dt > 0 && ev.timeStamp - trail[trail.length - 1].t < 60) {
        fling = Math.max(-2600, Math.min(2600, -(ev.clientX - first.x) / dt))
        if (Math.abs(fling) < 60) fling = 0
      }
      dragging = false
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  /** A drag must not open the card it ended on. @param {MouseEvent} e */
  function click(e) {
    if (moved > 6) { e.preventDefault(); e.stopPropagation() }
  }

</script>

<section class="rail" aria-roledescription="карусель" aria-label="Проекты мастерской">
  <div class="wrap head">{@render children?.()}</div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="viewport" bind:this={viewport}
    onpointerenter={e => { if (e.pointerType === 'mouse') hover = true }} onpointerleave={() => hover = false}
    onfocusin={() => focusInside = true} onfocusout={() => focusInside = false}
    onpointerdown={down} onclickcapture={click} ondragstart={e => e.preventDefault()}>
    <ul class="track" class:dragging bind:this={track} style={`transform: translate3d(${-offset}px, 0, 0)`}>
      {#each projects as project}<li><ProjectCard {project} /></li>{/each}
      {#each projects as project}<li aria-hidden="true" inert><ProjectCard {project} /></li>{/each}
    </ul>
  </div>

</section>

<style>
  .rail { padding: clamp(64px, 9vw, 120px) 0 clamp(48px, 6vw, 88px); border-top: 1px solid var(--rule); overflow: hidden; }
  .head { margin-bottom: clamp(24px, 4vw, 44px); }
  .viewport { cursor: grab; touch-action: pan-y; user-select: none; }
  .viewport:active { cursor: grabbing; }
  .track { display: flex; gap: clamp(16px, 2vw, 28px); padding: 0 var(--gutter); will-change: transform; }
  .track li { flex: none; width: clamp(240px, 23vw, 330px); }
  .track :global(img) { pointer-events: none; -webkit-user-drag: none; }
  /* Cards are links: without this the browser starts dragging the link and steals the mouse. */
  .track :global(a) { -webkit-user-drag: none; cursor: grab; }
  .track.dragging :global(a) { cursor: grabbing; }
  @media (max-width: 640px) {
    .track li { width: 72vw; }
  }
</style>
