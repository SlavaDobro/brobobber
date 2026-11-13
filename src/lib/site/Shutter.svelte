<script>
  // Page transition: a garage roller door rolls down over the old page and up over the new one.
  // Navigation never waits on the animation alone: in a background tab frames do not run,
  // so every step also has a timer that finishes it.
  const slats = 9
  /** @type {HTMLDivElement} */
  let door

  /** @param {Keyframe[]} frames @param {KeyframeAnimationOptions} options */
  function run(frames, options) {
    const animation = door.animate(frames, { fill: 'forwards', ...options })
    const timer = new Promise(resolve => setTimeout(resolve, Number(options.duration) + Number(options.delay ?? 0) + 150))
    return Promise.race([animation.finished.catch(() => {}), timer])
  }

  /** Rolls the door down. Resolves when the screen is covered (or immediately if the tab is hidden). */
  export async function close() {
    if (document.hidden) return
    door.style.visibility = 'visible'
    await run([{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }], { duration: 500, easing: 'cubic-bezier(.55, 0, .9, .4)' })
  }

  /** Rolls the door back up. */
  export async function open() {
    if (door.style.visibility !== 'visible') return
    await run([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 700, delay: 80, easing: 'cubic-bezier(.6, 0, .2, 1)' })
    door.style.visibility = 'hidden'
  }
</script>

<div class="door" bind:this={door} aria-hidden="true">
  {#each Array(slats) as _}<span class="slat"></span>{/each}
  <span class="handle"></span>
</div>

<style>
  .door { position: fixed; inset: 0; z-index: 80; visibility: hidden; transform: translateY(-100%); display: flex; flex-direction: column; background: #262723; pointer-events: none; }
  .slat { flex: 1; border-bottom: 2px solid #191a18; background: linear-gradient(180deg, #2f302c 0%, #262723 45%, #20211e 100%); box-shadow: inset 0 1px 0 #ffffff0f; }
  .handle { position: absolute; left: 50%; bottom: 22px; width: 120px; height: 10px; margin-left: -60px; border-radius: 5px; background: var(--brass); box-shadow: 0 0 0 4px #191a18; }
</style>
