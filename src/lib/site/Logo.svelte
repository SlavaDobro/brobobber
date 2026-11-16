<script>
  // Brobobber mark: a tachometer. On load the needle revs into the red zone and settles at idle;
  // hovering (or tapping) the logo revs it again. With reduced motion the needle just sits at idle.
  /** @type {{ size?: number, word?: boolean, rev?: unknown, class?: string }} */
  let { size = 40, word = true, rev = 0, class: className = '' } = $props()

  // The dial spans 240°: from -120° (0 rpm) to +120° (9k); 7k–9k is the red zone.
  const start = -120, end = 120, idle = -78, redline = start + (end - start) * 7 / 9
  const ticks = Array.from({ length: 10 }, (_, i) => {
    const a = (start + (end - start) * i / 9) * Math.PI / 180
    const r1 = 18.5, r2 = i % 3 === 0 ? 13.5 : 15.5
    return { x1: 24 + r1 * Math.sin(a), y1: 24 - r1 * Math.cos(a), x2: 24 + r2 * Math.sin(a), y2: 24 - r2 * Math.cos(a), red: i >= 7, major: i % 3 === 0 }
  })
  /** SVG arc path on radius r between two angles (degrees, 0 = up). */
  const arc = (r, a, b) => {
    const p = d => [24 + r * Math.sin(d * Math.PI / 180), 24 - r * Math.cos(d * Math.PI / 180)]
    const [x1, y1] = p(a), [x2, y2] = p(b)
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }

  /** @type {SVGGElement} */ let needle
  let revving = false

  /** One rev: sweep to the red zone, bounce off the limiter, drop back to idle. */
  function blip() {
    if (revving || !needle || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    revving = true
    const animation = needle.animate([
      { transform: `rotate(${idle}deg)` },
      { transform: `rotate(${redline + 14}deg)`, offset: .38, easing: 'cubic-bezier(.3, 0, .2, 1)' },
      { transform: `rotate(${redline + 6}deg)`, offset: .48 },
      { transform: `rotate(${redline + 13}deg)`, offset: .56 },
      { transform: `rotate(${idle - 4}deg)`, offset: .9, easing: 'cubic-bezier(.5, 0, .3, 1)' },
      { transform: `rotate(${idle}deg)` },
    ], { duration: 1500 })
    animation.finished.finally(() => { revving = false })
  }

  // Rev once when the logo appears, and whenever the parent bumps `rev` (e.g. on page change).
  $effect(() => {
    rev
    const t = setTimeout(blip, 250)
    return () => clearTimeout(t)
  })
</script>

<span class={'logo-mark ' + className} role="img" aria-label="Brobobber" onpointerenter={blip}>
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <circle cx="24" cy="24" r="22.5" class="rim" />
    <path d={arc(18.5, start, redline)} class="scale" />
    <path d={arc(18.5, redline, end)} class="red" />
    {#each ticks as t}<line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} class:red-tick={t.red} class:major={t.major} />{/each}
    <text x="24" y="37.5" class="bb">BB</text>
    <g class="needle" bind:this={needle} style={`transform: rotate(${idle}deg)`}>
      <path d="M24 26.5 L22.9 24 L24 7.5 L25.1 24 Z" />
    </g>
    <circle cx="24" cy="24" r="3.2" class="hub" />
  </svg>
  {#if word}<span class="word">Brobobber</span>{/if}
</span>

<style>
  .logo-mark { display: inline-flex; align-items: center; gap: 10px; line-height: 1; cursor: default; }
  svg { flex: none; overflow: visible; }
  .rim { fill: #1c1d1b; stroke: var(--paper); stroke-width: 1.6; }
  .scale { fill: none; stroke: var(--paper); stroke-width: 1.4; stroke-linecap: round; opacity: .55; }
  .red { fill: none; stroke: var(--signal); stroke-width: 3.2; stroke-linecap: round; }
  line { stroke: var(--paper); stroke-width: 1.2; stroke-linecap: round; opacity: .7; }
  line.major { stroke-width: 2; opacity: 1; }
  line.red-tick { stroke: var(--signal); opacity: 1; }
  .bb { fill: var(--brass); font-family: var(--display); font-weight: 700; font-stretch: 75%; font-size: 9px; text-anchor: middle; letter-spacing: .3px; }
  .needle { transform-origin: 24px 24px; transform-box: view-box; }
  .needle path { fill: var(--brass); }
  .hub { fill: var(--paper); stroke: #1c1d1b; stroke-width: 1.4; }
  .word { font-family: var(--display); font-weight: 700; font-stretch: 75%; font-size: 26px; letter-spacing: .02em; color: var(--paper); }
</style>
