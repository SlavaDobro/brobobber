<script>
  // The process as a road: the line is laid as you scroll, and a pinned odometer
  // rolls to the number of the stage you have reached.
  import { process } from './data.js'

  /** @type {{ compact?: boolean }} */
  let { compact = false } = $props()

  /** @type {HTMLElement} */ let list
  let progress = $state(0)
  let reached = $state(0)

  $effect(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const update = () => {
      const rect = list.getBoundingClientRect(), mid = window.innerHeight * .55
      progress = still ? 1 : Math.min(1, Math.max(0, (mid - rect.top) / rect.height))
      const items = [...list.children]
      let index = 0
      items.forEach((item, i) => { if (item.getBoundingClientRect().top < mid) index = i })
      reached = index
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  })

  let digits = $derived(String(reached + 1).padStart(2, '0').split(''))
</script>

<div class="road" class:compact>
  <aside class="odo" aria-hidden="true">
    <div class="counter">
      {#each digits as digit, i}
        <span class="drum"><span class="strip" style={`--to:${digit};--delay:${i * 60}ms`}>{#each Array(10) as _, d}<span>{d}</span>{/each}</span></span>
      {/each}
      <span class="of">/ {String(process.length).padStart(2, '0')}</span>
    </div>
    <p class="now">{process[reached].title}</p>
  </aside>

  <div class="track">
    <svg class="line" viewBox="0 0 24 1000" preserveAspectRatio="none" aria-hidden="true">
      <path d="M12 0 V1000" class="base" />
      <path d="M12 0 V1000" class="laid" pathLength="1" style={`stroke-dashoffset:${1 - progress}`} />
    </svg>
    <ol bind:this={list}>
      {#each process as step, i}
        <li class:passed={i <= reached}>
          <span class="dot"></span>
          <h3 class="h3"><span class="n">{String(i + 1).padStart(2, '0')}</span>{step.title}</h3>
          <p>{step.text}</p>
        </li>
      {/each}
    </ol>
  </div>
</div>

<style>
  .road { display: grid; grid-template-columns: minmax(220px, 4fr) minmax(0, 7fr); gap: clamp(24px, 6vw, 96px); }
  .odo { position: sticky; top: calc(var(--header) + 40px); align-self: start; display: grid; gap: 14px; }
  .counter { display: flex; align-items: baseline; font-family: var(--display); font-stretch: 75%; font-weight: 650; font-size: clamp(96px, 13vw, 200px); line-height: 1; font-variant-numeric: tabular-nums; }
  .drum { display: inline-block; height: 1em; overflow: hidden; }
  .strip { display: flex; flex-direction: column; transform: translateY(calc(var(--to) * -1em)); transition: transform .9s var(--ease) var(--delay); }
  .strip span { height: 1em; }
  .of { font-size: .22em; color: var(--concrete); margin-left: .3em; font-stretch: 90%; }
  .now { font-family: var(--display); font-stretch: 88%; font-size: 22px; color: var(--brass); }
  .track { position: relative; padding-left: 48px; }
  .line { position: absolute; left: 0; top: 8px; bottom: 8px; width: 24px; height: calc(100% - 16px); overflow: visible; }
  .base { stroke: var(--rule); stroke-width: 2; vector-effect: non-scaling-stroke; stroke-dasharray: 6 8; }
  .laid { stroke: var(--brass); stroke-width: 3; vector-effect: non-scaling-stroke; stroke-dasharray: 1 1; fill: none; }
  ol { display: grid; gap: clamp(28px, 5vh, 56px); }
  li { position: relative; display: grid; gap: 8px; opacity: .45; transition: opacity .4s; }
  li.passed { opacity: 1; }
  .dot { position: absolute; left: -42px; top: 8px; width: 13px; height: 13px; border-radius: 50%; background: var(--asphalt); border: 2px solid var(--rule); transition: border-color .3s, background-color .3s; }
  li.passed .dot { border-color: var(--brass); background: var(--brass); }
  .n { font-size: .6em; color: var(--brass); margin-right: 12px; vertical-align: .2em; }
  li p { color: var(--concrete); max-width: 52ch; }
  .compact ol { gap: 28px; }
  @media (max-width: 860px) {
    .road { grid-template-columns: 1fr; }
    .odo { position: static; }
    .counter { font-size: 96px; }
  }
</style>
