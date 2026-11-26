<script>
  // Reviews as workshop job tickets: the card that hangs on a motorcycle while it is in the
  // workshop. A stub with the ticket number and a barcode, a perforated tear line with notches,
  // the client's words, a signature line and the red "ВЫДАН" stamp: the bike went home.
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'
  import { reviews } from './data.js'
  import { dragScroll } from './drag-scroll.js'

  /** @type {HTMLElement} */ let row
  /** @param {number} dir */
  const scrollBy = dir => row.scrollBy({ left: dir * row.clientWidth * .8, behavior: 'smooth' })
  const hex = '5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96'
  // A slightly different barcode on every ticket, from the author's name.
  /** @param {string} seed */
  const bars = seed => {
    let h = 7; const out = []
    for (let i = 0; i < 22; i++) { h = (h * 31 + seed.charCodeAt(i % seed.length)) % 997; out.push(1 + h % 3) }
    return out
  }
</script>

<div class="reviews">
  <ul class="row shelf" bind:this={row} use:dragScroll>
    {#each reviews as review, i}
      <li>
        <article class="ticket" style={`--tilt:${(i % 3 - 1) * .6}deg`}>
          <header class="stub">
            <span class="no">Заказ-наряд <b>№ {String(i + 1).padStart(3, '0')}</b></span>
            <span class="code" aria-hidden="true">{#each bars(review.author) as w}<i style={`width:${w}px`}></i>{/each}</span>
          </header>
          <blockquote>
            <p>{review.text}</p>
          </blockquote>
          <footer>
            <span class="sign"><small>Клиент</small>{review.author}</span>
            <span class="stamp" aria-hidden="true">Выдан</span>
          </footer>
        </article>
      </li>
    {/each}
  </ul>
  <div class="controls">
    <button aria-label="Предыдущие отзывы" onclick={() => scrollBy(-1)}>
      <svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points={hex} /></svg><ChevronLeft size={18} />
    </button>
    <button aria-label="Следующие отзывы" onclick={() => scrollBy(1)}>
      <svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points={hex} /></svg><ChevronRight size={18} />
    </button>
  </div>
</div>

<style>
  .row { display: flex; gap: 22px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-block: 6px 10px; }
  .row li { flex: none; width: min(84vw, 460px); scroll-snap-align: start; display: flex; }

  /* The ticket: dark card stock, notches cut at the tear line. */
  .ticket { --cut: 58px; position: relative; flex: 1; display: flex; flex-direction: column; background: linear-gradient(170deg, #202020, #181818 60%, #151515);
    border-radius: 4px; box-shadow: inset 0 0 0 1px #ebebea1c; transform: rotate(var(--tilt)); transition: transform .35s var(--ease);
    -webkit-mask: radial-gradient(circle 10px at left var(--cut), #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 10px at right var(--cut), #0000 97%, #000) right / 51% 100% no-repeat;
    mask: radial-gradient(circle 10px at left var(--cut), #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 10px at right var(--cut), #0000 97%, #000) right / 51% 100% no-repeat; }
  .ticket:hover { transform: rotate(0deg) translateY(-3px); }
  .stub { height: var(--cut); display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 24px;
    border-bottom: 2px dashed #ebebea26; }
  .no { font-family: var(--display); font-weight: 600; font-stretch: 108%; font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--concrete); }
  .no b { color: var(--paper); font-weight: 700; margin-left: 4px; }
  .code { display: flex; gap: 2px; height: 22px; opacity: .55; }
  .code i { display: block; background: var(--paper); }

  blockquote { flex: 1; margin: 0; padding: 22px 24px 18px; }
  blockquote p { font-size: 16px; line-height: 1.55; color: var(--paper); }
  blockquote p::before { content: '«'; color: var(--signal); font-family: var(--display); font-weight: 700; margin-right: 2px; }
  blockquote p::after { content: '»'; color: var(--signal); font-family: var(--display); font-weight: 700; margin-left: 2px; }

  footer { position: relative; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 0 24px 22px; }
  .sign { display: grid; gap: 4px; min-width: 0; padding-top: 8px; border-top: 1px solid #ebebea33; flex: 0 1 60%;
    font-family: var(--display); font-weight: 650; font-stretch: 100%; font-size: 17px; }
  .sign small { font-family: var(--text); font-weight: 400; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--concrete); }
  /* A rubber stamp: uneven red frame, slightly turned, a little faded. */
  .stamp { flex: none; padding: 6px 12px 5px; border: 2px solid var(--signal); border-radius: 3px; box-shadow: inset 0 0 0 1.5px #131313, inset 0 0 0 3px #d23f2a99;
    font-family: var(--display); font-weight: 800; font-stretch: 118%; font-size: 15px; letter-spacing: .16em; text-transform: uppercase; color: var(--signal);
    transform: rotate(-9deg); opacity: .82; mix-blend-mode: screen; }

  .controls { display: flex; gap: 10px; margin-top: 18px; }
  .controls button { position: relative; width: 46px; height: 46px; display: grid; place-items: center; color: var(--paper); }
  .controls svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .45s var(--ease); }
  .controls polygon { fill: #111; stroke: #ebebea4d; stroke-width: 1.1; stroke-linejoin: round; transition: fill .25s, stroke .25s; }
  .controls button :global(svg.lucide) { position: relative; }
  .controls button:hover svg { transform: rotate(60deg); }
  .controls button:hover polygon { fill: var(--signal); stroke: var(--signal); }

  @media (max-width: 560px) {
    .ticket { --cut: 52px; }
    .stub, blockquote, footer { padding-left: 18px; padding-right: 18px; }
    .code { display: none; }
    blockquote p { font-size: 15px; }
  }
</style>
