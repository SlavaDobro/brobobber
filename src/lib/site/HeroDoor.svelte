<script>
  // Home hero: the workshop's steel roller door with BROBOBBER painted across its slats in brushed steel
  // The word and the text sit on the solid door, so they always read.
  /** @type {{ word?: string, children?: import('svelte').Snippet }} */
  let { word = 'BROBOBBER', children } = $props()
  let lines = $derived(word.match(/.{1,3}/g) ?? [word])
</script>

<section class="hero">
  <div class="door">
    <div class="word-box" aria-hidden="true">
      <p class="word">
        {#each lines as line, l}
          <span class="line">{#each line as letter, i}<span class="letter" style={`--i:${l * 3 + i}`}>{letter}</span>{/each}</span>
        {/each}
      </p>
    </div>
    <span class="seams" aria-hidden="true"></span>
    <div class="copy">{@render children?.()}</div>
    <span class="hint" aria-hidden="true">Прокрутите вниз</span>
  </div>
</section>

<style>
  .hero { position: relative; height: 100vh; height: 100svh; --slat: clamp(34px, 5.4vh, 54px); }

  /* The door: painted steel slats and a steel bottom rail. */
  .door { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--header) minmax(0, 1fr) auto; overflow: hidden;
    background:
      repeating-linear-gradient(180deg, #ffffff0d 0 1px, transparent 1px 5px, transparent 5px calc(var(--slat) - 3px), #00000066 calc(var(--slat) - 3px) var(--slat)),
      linear-gradient(180deg, #222222, #181818 70%, #131313);
    border-bottom: 5px solid var(--steel); }

  .word-box { grid-row: 2; container-type: size; display: grid; place-items: center; min-height: 0; }
  .word { margin: 0; white-space: nowrap; text-align: center; font-family: var(--display); font-weight: 800; font-stretch: 112%; line-height: .9;
    font-size: min(14.6cqw, 104cqh); }
  .line { display: inline-block; }
  .letter { display: inline-block; color: transparent; background: linear-gradient(180deg, #ffffff 6%, #e9ebee 42%, #b3b8be 74%, #80858c 97%); -webkit-background-clip: text; background-clip: text;
    animation: strike .95s calc(.15s + var(--i) * .07s) linear backwards; }
  /* Each letter catches light with a short flicker, like a workshop lamp coming on. */
  @keyframes strike { 0% { opacity: .08; } 28% { opacity: 1; } 38% { opacity: .3; } 56% { opacity: 1; } 64% { opacity: .7; } 100% { opacity: 1; } }

  /* The door seams run over the paint, so the word looks painted on the slats. */
  .seams { position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(180deg, transparent 0 calc(var(--slat) - 2px), #161616 calc(var(--slat) - 2px) var(--slat)); }

  .copy { grid-row: 3; position: relative; z-index: 2; width: 100%; max-width: var(--max); margin: 0 auto; padding: 0 var(--gutter) clamp(24px, 5vh, 56px); }
  .hint { position: absolute; z-index: 2; right: var(--gutter); bottom: 24px; font-size: 13px; color: var(--concrete); writing-mode: vertical-rl; }
  .hint::after { content: ''; display: block; width: 1px; height: 48px; margin: 12px auto 0; background: linear-gradient(var(--steel), transparent); animation: drip 1.8s ease-in-out infinite; }
  @keyframes drip { 0%, 100% { transform: scaleY(.3); transform-origin: top; } 50% { transform: scaleY(1); } }

  /* When the free space is tall, the word stands in three big lines: BRO / BOB / BER. */
  @container (max-aspect-ratio: 3 / 2) {
    .word { font-size: min(41cqw, 33cqh); line-height: .94; }
    .line { display: block; }
  }
  /* Phones on their side: only the heading and buttons stay, so the word keeps its size. */
  @media (max-height: 520px) {
    .hero { height: auto; }
    .door { position: relative; inset: auto; min-height: calc(100svh - 64px - env(safe-area-inset-bottom)); }
    .copy :global(.lead) { display: none; }
    .copy :global(.hero-copy) { gap: 10px; }
    .copy :global(.hero-title) { font-size: 22px; }
    .copy :global(.hero-actions) { display: flex; }
    .copy :global(.hero-actions .btn) { height: 42px; padding: 0 16px; }
    .copy { padding-bottom: 12px; }
    .hint { display: none; }
  }
  /* Phones and tablets: the dashboard bar takes the bottom of the screen. */
  @media (max-width: 1250px) and (min-height: 521px) {
    .hero { height: calc(100svh - 64px - env(safe-area-inset-bottom)); }
  }
  @media (max-width: 640px) {
    .hint { display: none; }
    .copy { padding-bottom: 20px; }
    .copy :global(.lead) { font-size: 16px; }
    .copy :global(.hero-actions) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .copy :global(.hero-actions .btn) { padding: 0 6px; height: 50px; font-size: clamp(12.5px, 3.7vw, 15px); }
  }
</style>
