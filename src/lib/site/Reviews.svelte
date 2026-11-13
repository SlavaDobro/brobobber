<script>
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'
  import { reviews } from './data.js'

  /** @type {HTMLElement} */ let row
  /** @param {number} dir */
  const scrollBy = dir => row.scrollBy({ left: dir * row.clientWidth * .8, behavior: 'smooth' })
</script>

<div class="reviews">
  <ul class="row" bind:this={row}>
    {#each reviews as review}
      <li>
        <blockquote>
          <p>{review.text}</p>
          <footer>{review.author}</footer>
        </blockquote>
      </li>
    {/each}
  </ul>
  <div class="controls">
    <button aria-label="Предыдущие отзывы" onclick={() => scrollBy(-1)}><ChevronLeft size={20} /></button>
    <button aria-label="Следующие отзывы" onclick={() => scrollBy(1)}><ChevronRight size={20} /></button>
  </div>
</div>

<style>
  .row { display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 4px; }
  .row li { flex: none; width: min(86vw, 440px); scroll-snap-align: start; }
  blockquote { height: 100%; display: flex; flex-direction: column; justify-content: space-between; gap: 24px; padding: 28px; background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 6px; }
  blockquote p { font-size: 17px; line-height: 1.6; }
  blockquote p::before { content: '«'; color: var(--brass); }
  blockquote p::after { content: '»'; color: var(--brass); }
  footer { font-family: var(--display); font-stretch: 88%; font-weight: 600; color: var(--brass); }
  .controls { display: flex; gap: 8px; margin-top: 20px; }
  .controls button { width: 46px; height: 46px; display: grid; place-items: center; border: 1px solid var(--rule); border-radius: 50%; }
  .controls button:hover { border-color: var(--brass); color: var(--brass); }
</style>
