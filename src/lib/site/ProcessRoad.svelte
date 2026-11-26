<script>
  // The process as a ride. On the left a pinned motorcycle tachometer: the scale runs 1 to 9, one
  // mark per stage, and the needle swings to the stage you have scrolled to. On the right the road
  // itself: asphalt with a dashed centre line that turns into a solid red line as far as you have
  // read, and the logo's hex nut as the marker of every stage.
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
      const items = [...list.children]
      let index = 0
      items.forEach((item, i) => { if (item.getBoundingClientRect().top < mid) index = i })
      reached = index
      // The red line ends exactly at the nut of the stage reached.
      const nut = items[index]
      progress = still ? 1 : Math.min(1, Math.max(0, (nut.getBoundingClientRect().top - rect.top + 14) / rect.height))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  })

  const n = process.length
  const sweep = 240, start = -120
  /** @param {number} k stage index */
  const angle = k => start + (k / (n - 1)) * sweep
  /** @param {number} r @param {number} deg 0 = up, clockwise */
  const pt = (r, deg) => [+(r * Math.sin(deg * Math.PI / 180)).toFixed(2), +(-r * Math.cos(deg * Math.PI / 180)).toFixed(2)]
  /** @param {number} r @param {number} a @param {number} b */
  const arc = (r, a, b) => { const [x1, y1] = pt(r, a), [x2, y2] = pt(r, b); return `M${x1} ${y1} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x2} ${y2}` }
  const minor = Array.from({ length: (n - 1) * 4 + 1 }, (_, i) => start + i * sweep / ((n - 1) * 4)).filter((_, i) => i % 4)
  const hex = Array.from({ length: 6 }, (_, i) => pt(13, 30 + i * 60).join(',')).join(' ')

  let needle = $derived(angle(reached))
  let digits = $derived(String(reached + 1).padStart(2, '0').split(''))
</script>

<div class="road" class:compact>
  <aside class="gauge" aria-hidden="true">
    <svg viewBox="-100 -100 200 158">
      <path d={arc(90, start, start + sweep)} class="rim" />
      <path d={arc(90, angle(n - 2), start + sweep)} class="redline" />
      <path d={arc(90, start, start + sweep)} class="lit" pathLength="1" style={`stroke-dashoffset:${1 - reached / (n - 1)}`} />
      {#each minor as a}{@const [x1, y1] = pt(84, a)}{@const [x2, y2] = pt(78, a)}<line {x1} {y1} {x2} {y2} class="minor" />{/each}
      {#each process as _, k}
        {@const [x1, y1] = pt(84, angle(k))}{@const [x2, y2] = pt(70, angle(k))}{@const [tx, ty] = pt(56, angle(k))}
        <line {x1} {y1} {x2} {y2} class="major" class:on={k <= reached} class:red={k >= n - 2} />
        <text x={tx} y={ty + 4.5} class="num" class:on={k === reached}>{k + 1}</text>
      {/each}
      <text x="0" y="-30" class="unit">ЭТАП</text>
      <g class="needle" style={`transform: rotate(${needle}deg)`}>
        <path d="M-2.6 8 L-1 -78 L1 -78 L2.6 8 Z" />
      </g>
      <polygon points={hex} class="hub" />
      <circle r="4" class="hub-bolt" />
    </svg>
    <div class="readout">
      <span class="counter">
        {#each digits as digit, i}
          <span class="drum"><span class="strip" style={`--to:${digit};--delay:${i * 60}ms`}>{#each Array(10) as _, d}<span>{d}</span>{/each}</span></span>
        {/each}
        <span class="of">/ {String(n).padStart(2, '0')}</span>
      </span>
      <p class="now">{process[reached].title}</p>
    </div>
  </aside>

  <div class="track" style={`--p:${progress}`}>
    <span class="asphalt" aria-hidden="true"><span class="laid"></span></span>
    <ol bind:this={list}>
      {#each process as step, i}
        <li class:passed={i <= reached} class:current={i === reached}>
          <span class="marker" aria-hidden="true">
            <svg viewBox="-15 -15 30 30"><polygon points={hex} /></svg>
            <b>{i + 1}</b>
          </span>
          <h3 class="h3">{step.title}</h3>
          <p>{step.text}</p>
        </li>
      {/each}
    </ol>
  </div>
</div>

<style>
  .road { display: grid; grid-template-columns: minmax(260px, 4fr) minmax(0, 7fr); gap: clamp(24px, 6vw, 96px); }

  /* Tachometer */
  .gauge { position: sticky; top: calc(var(--header) + 32px); align-self: start; display: grid; justify-items: center; gap: 4px; width: min(100%, 380px); }
  .gauge svg { width: 100%; overflow: visible; }
  .rim { fill: none; stroke: #ebebea24; stroke-width: 1.5; }
  .redline { fill: none; stroke: var(--signal); stroke-width: 4; opacity: .75; }
  .lit { fill: none; stroke: var(--paper); stroke-width: 2.5; stroke-dasharray: 1 1; transition: stroke-dashoffset .8s var(--ease); }
  .minor { stroke: #ebebea33; stroke-width: 1; }
  .major { stroke: #ebebea59; stroke-width: 2.4; stroke-linecap: round; transition: stroke .3s; }
  .major.on { stroke: var(--paper); }
  .major.red { stroke: var(--signal); }
  .num { fill: #ebebea66; font-family: var(--display); font-weight: 700; font-stretch: 104%; font-size: 13px; text-anchor: middle; transition: fill .3s; }
  .num.on { fill: var(--paper); }
  .unit { fill: #ebebea4d; font-family: var(--display); font-weight: 600; font-stretch: 112%; font-size: 7px; letter-spacing: .3em; text-anchor: middle; }
  /* The needle swings past the mark and settles, like a real one. */
  .needle { transform-box: view-box; transform-origin: 0 0; transition: transform .9s cubic-bezier(.3, 1.45, .5, 1); }
  .needle path { fill: var(--signal); filter: drop-shadow(0 0 4px #d23f2a99); }
  .hub { fill: #0e0e0e; stroke: #ebebea59; stroke-width: 1.2; stroke-linejoin: round; }
  .hub-bolt { fill: #1c1c1c; stroke: #ebebea40; stroke-width: 1; }
  .readout { display: grid; justify-items: center; gap: 6px; margin-top: -18px; text-align: center; }
  .counter { display: flex; align-items: baseline; font-family: var(--display); font-weight: 700; font-stretch: 104%; font-size: clamp(40px, 4vw, 56px); line-height: 1; font-variant-numeric: tabular-nums; }
  .drum { display: inline-block; height: 1em; overflow: hidden; }
  .strip { display: flex; flex-direction: column; transform: translateY(calc(var(--to) * -1em)); transition: transform .9s var(--ease) var(--delay); }
  .strip span { height: 1em; }
  .of { font-size: .34em; color: var(--concrete); margin-left: .35em; font-weight: 600; }
  .now { font-family: var(--display); font-weight: 650; font-stretch: 100%; font-size: 19px; color: var(--paper); max-width: 18em; text-wrap: balance; }

  /* The road */
  .track { position: relative; padding-left: 64px; }
  .asphalt { position: absolute; left: 6px; top: 4px; bottom: 4px; width: 30px; border-radius: 3px;
    background: linear-gradient(90deg, #ebebea1f 0 1px, transparent 1px calc(100% - 1px), #ebebea1f calc(100% - 1px)),
      repeating-linear-gradient(180deg, #ebebea38 0 12px, transparent 12px 26px) center / 2px 100% no-repeat, #1b1b1b; }
  .laid { position: absolute; left: 50%; top: 0; width: 3px; margin-left: -1.5px; height: calc(var(--p) * 100%); background: var(--signal); box-shadow: 0 0 10px #d23f2a99; border-radius: 2px; transition: height .5s var(--ease); }
  ol { display: grid; gap: clamp(16px, 2.4vh, 26px); }
  li { position: relative; display: grid; gap: 4px; opacity: .42; transition: opacity .4s; }
  li.passed { opacity: 1; }
  .marker { position: absolute; left: -64px; top: -3px; width: 42px; height: 42px; display: grid; place-items: center; }
  .marker svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .5s var(--ease); }
  .marker polygon { fill: #111; stroke: #ebebea40; stroke-width: 1.2; stroke-linejoin: round; transition: fill .3s, stroke .3s; }
  .marker b { position: relative; font-family: var(--display); font-weight: 700; font-stretch: 104%; font-size: 12px; color: var(--concrete); transition: color .3s; }
  li.passed .marker polygon { fill: #1e1e1e; stroke: var(--paper); }
  li.passed .marker b { color: var(--paper); }
  li.current .marker svg { transform: rotate(60deg); }
  li.current .marker polygon { fill: var(--signal); stroke: var(--signal); }
  li.current .marker b { color: #fff; }
  li .h3 { font-size: clamp(19px, 1.65vw, 24px); padding-top: 6px; }
  li p { color: var(--concrete); max-width: 62ch; font-size: 15px; line-height: 1.45; }
  .compact ol { gap: 14px; }

  @media (max-width: 860px) {
    .road { grid-template-columns: 1fr; }
    .gauge { display: none; }
    .track { padding-left: 56px; }
    .marker { left: -56px; width: 38px; height: 38px; }
    .asphalt { left: 5px; width: 28px; }
  }
</style>
