<script>
  // Brobobber Custom Club badge: the club's crossed open-end wrenches, set inside a rear
  // sprocket and locked by a hex nut. On load (and on `rev` changes, hover or tap) the wrenches
  // give the nut one turn, the sprocket rolls a tooth, and the wrenches swing back.
  // From 80 px the ring carries "BROBOBBER CUSTOM CLUB · MOSCOW"; smaller it shows rivets.
  /** @type {{ size?: number, word?: boolean, rev?: unknown, ring?: boolean, class?: string }} */
  let { size = 40, word = true, rev = 0, ring, class: className = '' } = $props()
  let full = $derived(ring ?? size >= 80)
  const uid = $props.id()

  const f = (/** @type {number} */ n) => +n.toFixed(2)
  /** @param {number} r @param {number} deg 0 = up, clockwise */
  const pt = (r, deg) => [f(r * Math.sin(deg * Math.PI / 180)), f(-r * Math.cos(deg * Math.PI / 180))]

  // Rear sprocket: 30 trapezoid teeth around a 54 root circle, tips at 59.
  const teeth = 30, pitch = 360 / teeth
  const sprocket = Array.from({ length: teeth }, (_, i) => {
    const a = i * pitch
    return [pt(54, a - pitch * .5), pt(54.6, a - pitch * .3), pt(59, a - pitch * .17), pt(59, a + pitch * .17), pt(54.6, a + pitch * .3)]
      .map(([x, y], j) => `${i === 0 && j === 0 ? 'M' : 'L'}${x} ${y}`).join('')
  }).join('') + 'Z'

  // Open-end wrench along x: shaft half-height h, heads of radius R at ±c, jaw half-width w.
  const c = 31, R = 8.6, h = 3.1, w = 3.3
  const a = f(Math.sqrt(R * R - h * h)), b = f(Math.sqrt(R * R - w * w))
  const wrench = [
    `M${-c + a} ${-h} L${c - a} ${-h}`,
    `A${R} ${R} 0 0 1 ${c + b} ${-w} L${c} ${-w} A${w} ${w} 0 0 0 ${c} ${w} L${c + b} ${w}`,
    `A${R} ${R} 0 0 1 ${c - a} ${h} L${-c + a} ${h}`,
    `A${R} ${R} 0 0 1 ${-c - b} ${w} L${-c} ${w} A${w} ${w} 0 0 0 ${-c} ${-w} L${-c - b} ${-w}`,
    `A${R} ${R} 0 0 1 ${-c + a} ${-h} Z`,
  ].join(' ')

  const nut = Array.from({ length: 6 }, (_, i) => pt(13.4, 30 + i * 60).join(' ')).join(' ')
  const rivets = Array.from({ length: 12 }, (_, i) => pt(46.5, i * 30 + 15))
  // Text arcs: the top one runs clockwise over the top, the bottom one left to right under it,
  // so both read upright inside the same band (43.5–50).
  const top = `M${pt(43.6, -112).join(' ')} A43.6 43.6 0 1 1 ${pt(43.6, 112).join(' ')}`
  const stars = [pt(46.8, -122), pt(46.8, 122)]
  const bottom = `M${pt(50, -128).join(' ')} A50 50 0 0 0 ${pt(50, 128).join(' ')}`

  /** @type {SVGGElement} */ let tools
  /** @type {SVGGElement} */ let bolt
  /** @type {SVGGElement} */ let gear
  let turning = false

  /** One turn: wrenches and nut rotate 60° together (the hex looks the same after), the sprocket
   *  rolls one tooth, then the wrenches swing back to the cross. */
  function blip() {
    if (turning || !tools || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    turning = true
    const timing = { duration: 1300, easing: 'linear' }
    const run = [
      tools.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-8deg)', offset: .14, easing: 'cubic-bezier(.4, 0, .2, 1)' },
        { transform: 'rotate(66deg)', offset: .5, easing: 'cubic-bezier(.5, 0, .5, 1)' },
        { transform: 'rotate(60deg)', offset: .58, easing: 'cubic-bezier(.6, 0, .2, 1)' },
        { transform: 'rotate(-4deg)', offset: .9 },
        { transform: 'rotate(0deg)' },
      ], timing),
      bolt.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-8deg)', offset: .14, easing: 'cubic-bezier(.4, 0, .2, 1)' },
        { transform: 'rotate(60deg)', offset: .5 },
        { transform: 'rotate(60deg)' },
      ], timing),
      gear.animate([
        { transform: 'rotate(0deg)', offset: .14, easing: 'cubic-bezier(.4, 0, .2, 1)' },
        { transform: `rotate(${pitch}deg)`, offset: .52 },
        { transform: `rotate(${pitch}deg)` },
      ], timing),
    ]
    // A hidden tab may never finish the animations; release the lock on a timer as well.
    Promise.race([Promise.all(run.map(r => r.finished)), new Promise(r => setTimeout(r, 1500))])
      .catch(() => {}).finally(() => { run.forEach(r => r.cancel()); turning = false })
  }

  // Turn once when the logo appears, and whenever the parent bumps `rev` (e.g. on page change).
  $effect(() => {
    rev
    const t = setTimeout(blip, 250)
    return () => clearTimeout(t)
  })
</script>

<span class={'logo-mark ' + className} role="img" aria-label="Brobobber Custom Club" onpointerenter={blip}>
  <svg viewBox="-60 -60 120 120" width={size} height={size} aria-hidden="true">
    <g class="spin" bind:this={gear}><path d={sprocket} class="sprocket" /></g>
    <circle r="52.4" class="band" />
    <circle r="41.4" class="field" />
    {#if full}
      <path id={`${uid}-t`} d={top} fill="none" />
      <path id={`${uid}-b`} d={bottom} fill="none" />
      <text class="ring-text"><textPath href={`#${uid}-t`} startOffset="50%">BROBOBBER CUSTOM CLUB</textPath></text>
      <text class="ring-text city"><textPath href={`#${uid}-b`} startOffset="50%">MOSCOW</textPath></text>
      {#each stars as [x, y]}<circle cx={x} cy={y} r="1.6" class="star" />{/each}
    {:else}
      {#each rivets as [x, y]}<circle cx={x} cy={y} r="2" class="rivet" />{/each}
    {/if}
    <g class="spin" bind:this={tools}>
      {#each [45, -45] as turn}
        <g transform={`rotate(${turn})`}>
          <path d={wrench} class="wrench" />
          <path d={`M${-c + R + 2} 0 H${c - R - 2}`} class="groove" />
        </g>
      {/each}
    </g>
    <g class="spin" bind:this={bolt}>
      <polygon points={nut} class="nut" />
      <circle r="10.2" class="chamfer" />
    </g>
    <text class="mono" y="4.1">BB</text>
  </svg>
  {#if word}<span class="word">Brobobber</span>{/if}
</span>

<style>
  .logo-mark { display: inline-flex; align-items: center; gap: 10px; line-height: 1; cursor: default; }
  svg { flex: none; overflow: visible; }
  /* The viewBox is centred on 0 0, so that is the pivot for every turning part. */
  .spin { transform-box: view-box; transform-origin: 0 0; }
  .sprocket { fill: var(--paper); }
  .band { fill: #131313; stroke: var(--steel); stroke-width: 1.6; }
  .field { fill: #1c1c1c; stroke: var(--steel); stroke-width: 1.2; }
  .rivet { fill: var(--steel); }
  .star { fill: var(--signal); }
  .ring-text { fill: var(--paper); font-family: var(--display); font-weight: 700; font-stretch: 86%; font-size: 8.6px; letter-spacing: 1.15px; text-anchor: middle; }
  .ring-text.city { fill: var(--signal); letter-spacing: 2.4px; }
  .wrench { fill: var(--paper); stroke: #131313; stroke-width: 1.6; stroke-linejoin: round; paint-order: stroke; }
  .groove { stroke: #131313; stroke-width: 1.1; stroke-linecap: round; opacity: .28; }
  .nut { fill: var(--signal); stroke: #131313; stroke-width: 1.8; stroke-linejoin: round; paint-order: stroke; }
  .chamfer { fill: none; stroke: #131313; stroke-width: 1; opacity: .45; }
  .mono { fill: #131313; font-family: var(--display); font-weight: 800; font-stretch: 86%; font-size: 11.5px; text-anchor: middle; letter-spacing: -.2px; }
  .word { font-family: var(--display); font-weight: 800; font-stretch: 118%; font-size: 21px; letter-spacing: .04em; text-transform: uppercase; color: var(--paper); }
</style>
