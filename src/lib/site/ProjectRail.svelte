<script>
  // Projects as an endless carousel: the row drifts on its own like a conveyor in the workshop,
  // stops under the cursor, a finger or keyboard focus, and can be dragged or stepped with arrows.
  // The list is rendered twice so the loop has no seam; the copy is hidden from assistive tech.
  import { ChevronLeft, ChevronRight, Pause, Play } from '@lucide/svelte'
  import ProjectCard from './ProjectCard.svelte'

  /** @type {{ projects: import('./data.js').Project[], children?: import('svelte').Snippet }} */
  let { projects, children } = $props()

  const speed = 42 // px per second
  /** @type {HTMLElement} */ let track
  /** @type {HTMLElement} */ let viewport
  let offset = $state(0)
  let loop = 0 // width of one copy of the list, gap included
  let step = 300 // one card plus gap
  let hover = $state(false)
  let focusInside = $state(false)
  let dragging = $state(false)
  let paused = $state(false) // the visitor pressed pause
  let still = $state(false) // reduced motion: no drift, arrows and drag still work
  let tween = null
  let moved = 0

  let index = $derived(loop ? Math.round((((offset % loop) + loop) % loop) / step) % projects.length : 0)
  let drifting = $derived(!still && !paused && !hover && !focusInside && !dragging)

  const wrap = (/** @type {number} */ x) => loop ? ((x % loop) + loop) % loop : x

  $effect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    still = motion.matches
    const measure = () => {
      const first = track.children[0], second = track.children[projects.length]
      if (first && second) loop = /** @type {HTMLElement} */ (second).offsetLeft - /** @type {HTMLElement} */ (first).offsetLeft
      const next = track.children[1]
      if (first && next) step = /** @type {HTMLElement} */ (next).offsetLeft - /** @type {HTMLElement} */ (first).offsetLeft
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
      if (tween) {
        const t = Math.min(1, (now - tween.start) / tween.duration)
        const e = 1 - Math.pow(1 - t, 3)
        offset = wrap(tween.from + (tween.to - tween.from) * e)
        if (t >= 1) tween = null
      } else if (drifting && visible && !document.hidden) {
        offset = wrap(offset + speed * dt)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); resize.disconnect(); io.disconnect() }
  })

  /** Moves to the previous or next card with a short ease. @param {number} dir */
  function go(dir) {
    const base = Math.round(offset / step) * step
    tween = { from: offset, to: base + dir * step, start: performance.now(), duration: 520 }
  }

  /** @param {PointerEvent} e */
  function down(e) {
    if (e.button !== 0) return
    dragging = true
    moved = 0
    tween = null
    const startX = e.clientX, from = offset
    const move = (/** @type {PointerEvent} */ ev) => { moved = Math.abs(ev.clientX - startX); offset = wrap(from - (ev.clientX - startX)) }
    const up = () => {
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

  /** @param {KeyboardEvent} e */
  function key(e) {
    if (e.key === 'ArrowRight') { go(1); e.preventDefault() }
    if (e.key === 'ArrowLeft') { go(-1); e.preventDefault() }
  }
</script>

<section class="rail" aria-roledescription="карусель" aria-label="Проекты мастерской">
  <div class="wrap head">{@render children?.()}</div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="viewport" bind:this={viewport}
    onpointerenter={e => { if (e.pointerType === 'mouse') hover = true }} onpointerleave={() => hover = false}
    onfocusin={() => focusInside = true} onfocusout={() => focusInside = false}
    onpointerdown={down} onclickcapture={click} onkeydown={key}>
    <ul class="track" class:dragging bind:this={track} style={`transform: translate3d(${-offset}px, 0, 0)`}>
      {#each projects as project}<li><ProjectCard {project} /></li>{/each}
      {#each projects as project}<li aria-hidden="true" inert><ProjectCard {project} /></li>{/each}
    </ul>
  </div>

  <div class="wrap controls">
    <div class="buttons">
      <button aria-label="Предыдущий проект" onclick={() => go(-1)}><ChevronLeft size={20} /></button>
      <button aria-label="Следующий проект" onclick={() => go(1)}><ChevronRight size={20} /></button>
      {#if !still}
        <button aria-label={paused ? 'Запустить ленту' : 'Остановить ленту'} aria-pressed={paused} onclick={() => paused = !paused}>
          {#if paused}<Play size={16} />{:else}<Pause size={16} />{/if}
        </button>
      {/if}
    </div>
    <p class="count" aria-live="polite"><strong>{String(index + 1).padStart(2, '0')}</strong> / {String(projects.length).padStart(2, '0')} — {projects[index]?.name}</p>
    <div class="meter" aria-hidden="true"><span style={`transform: scaleX(${(index + 1) / projects.length})`}></span></div>
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
  .controls { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 14px 24px; margin-top: 28px; }
  .buttons { display: flex; gap: 8px; }
  .buttons button { width: 46px; height: 46px; display: grid; place-items: center; border: 1px solid var(--rule); border-radius: 50%; color: var(--paper); }
  .buttons button:hover { border-color: var(--brass); color: var(--brass); }
  .count { font-size: 14px; color: var(--concrete); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .count strong { font-family: var(--display); color: var(--paper); font-size: 17px; }
  .meter { grid-column: 1 / -1; height: 2px; background: var(--rule); }
  .meter span { display: block; height: 100%; background: var(--brass); transform-origin: left; transition: transform .4s var(--ease); }
  @media (max-width: 640px) {
    .track li { width: 72vw; }
    .controls { grid-template-columns: 1fr; }
  }
</style>
