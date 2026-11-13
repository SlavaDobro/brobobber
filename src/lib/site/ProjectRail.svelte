<script>
  // Projects as a horizontal run: on wide screens vertical scrolling drives the row sideways
  // while the section stays pinned. On phones (and with reduced motion) it is a swipeable row.
  import ProjectCard from './ProjectCard.svelte'

  /** @type {{ projects: import('./data.js').Project[], children?: import('svelte').Snippet }} */
  let { projects, children } = $props()

  /** @type {HTMLElement} */ let section
  /** @type {HTMLElement} */ let track
  let pinned = $state(false)
  let travel = $state(0)
  let shift = $state(0)

  $effect(() => {
    const wide = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)')
    const layout = () => {
      pinned = wide.matches
      travel = pinned ? Math.max(0, track.scrollWidth - track.clientWidth) : 0
      update()
    }
    const update = () => {
      if (!pinned) { shift = 0; return }
      const rect = section.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, section.offsetHeight - window.innerHeight)))
      shift = p * travel
    }
    layout()
    wide.addEventListener('change', layout)
    window.addEventListener('resize', layout)
    window.addEventListener('scroll', update, { passive: true })
    return () => { wide.removeEventListener('change', layout); window.removeEventListener('resize', layout); window.removeEventListener('scroll', update) }
  })
</script>

<section class="rail" class:pinned bind:this={section} style={pinned ? `height: calc(100vh + ${travel}px)` : ''}>
  <div class="sticky">
    <div class="wrap head">{@render children?.()}</div>
    <div class="viewport">
      <ul class="track" bind:this={track} style={pinned ? `transform: translateX(${-shift}px)` : ''}>
        {#each projects as project}<li><ProjectCard {project} /></li>{/each}
      </ul>
    </div>
    {#if pinned}<div class="wrap meter" aria-hidden="true"><span style={`transform: scaleX(${travel ? shift / travel : 0})`}></span></div>{/if}
  </div>
</section>

<style>
  .rail { position: relative; border-top: 1px solid var(--rule); }
  .sticky { padding: clamp(64px, 9vw, 120px) 0 clamp(40px, 6vw, 80px); }
  .pinned .sticky { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: calc(var(--header) + 24px) 0 40px; }
  .head { margin-bottom: clamp(24px, 4vh, 44px); }
  .viewport { overflow: hidden; }
  .track { display: flex; gap: clamp(16px, 2vw, 28px); padding: 0 var(--gutter); will-change: transform; }
  .track li { flex: none; width: clamp(240px, 24vw, 340px); }
  .pinned .track li { width: min(24vw, calc((100vh - 360px) * .8)); min-width: 220px; }
  .rail:not(.pinned) .viewport { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .rail:not(.pinned) .track li { scroll-snap-align: start; width: min(78vw, 320px); }
  .meter { height: 2px; margin-top: 28px; background: var(--rule); }
  .meter span { display: block; height: 100%; background: var(--brass); transform-origin: left; }
</style>
