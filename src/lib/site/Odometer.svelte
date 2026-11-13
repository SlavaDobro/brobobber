<script>
  // A mechanical counter: each digit drum rolls to its value when the number comes into view.
  /** @type {{ value: string, unit?: string, label?: string }} */
  let { value, unit = '', label = '' } = $props()

  /** @type {HTMLElement} */
  let root
  let seen = $state(false)
  let chars = $derived(value.split(''))

  $effect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { seen = true; return }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { seen = true; observer.disconnect() } }, { threshold: .6 })
    observer.observe(root)
    return () => observer.disconnect()
  })
</script>

<div class="odometer" bind:this={root}>
  <span class="value" aria-label={value + (unit ? ' ' + unit : '')}>
    {#each chars as char, i}
      {#if /\d/.test(char)}
        <span class="drum" aria-hidden="true"><span class="strip" style={`--to:${seen ? +char : 0};--delay:${i * 90}ms`}>{#each Array(10) as _, d}<span>{d}</span>{/each}</span></span>
      {:else}
        <span class="sep" aria-hidden="true">{char}</span>
      {/if}
    {/each}
    {#if unit}<span class="unit" aria-hidden="true">{unit}</span>{/if}
  </span>
  {#if label}<span class="label">{label}</span>{/if}
</div>

<style>
  .odometer { display: grid; gap: 6px; }
  .value { display: inline-flex; align-items: baseline; font-family: var(--display); font-stretch: 85%; font-weight: 600; font-size: clamp(34px, 4vw, 56px); line-height: 1; font-variant-numeric: tabular-nums; }
  .drum { display: inline-block; height: 1em; overflow: hidden; }
  .strip { display: flex; flex-direction: column; transform: translateY(calc(var(--to) * -1em)); transition: transform 1.4s var(--ease) var(--delay); }
  .strip span { height: 1em; line-height: 1; }
  .sep { padding: 0 .04em; }
  .unit { font-size: .42em; margin-left: .3em; color: var(--brass); font-weight: 500; font-stretch: 100%; }
  .label { font-size: 14px; color: var(--concrete); }
</style>
