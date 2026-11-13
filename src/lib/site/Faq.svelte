<script>
  import { Plus } from '@lucide/svelte'
  import { faq } from './data.js'

  /** @type {{ items?: { q: string, a: string }[] }} */
  let { items = faq } = $props()
</script>

<div class="faq">
  {#each items as item}
    <details>
      <summary><span>{item.q}</span><Plus size={20} class="icon" /></summary>
      <p>{item.a}</p>
    </details>
  {/each}
</div>

<style>
  .faq { border-top: 1px solid var(--rule); }
  details { border-bottom: 1px solid var(--rule); interpolate-size: allow-keywords; }
  details::details-content { height: 0; overflow: hidden; transition: height .35s var(--ease), content-visibility .35s allow-discrete; }
  details[open]::details-content { height: auto; }
  summary { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 22px 0; cursor: pointer; list-style: none; font-family: var(--display); font-stretch: 90%; font-weight: 500; font-size: clamp(18px, 1.6vw, 22px); }
  summary::-webkit-details-marker { display: none; }
  summary:hover { color: var(--brass); }
  summary :global(.icon) { flex: none; color: var(--brass); transition: transform .3s var(--ease); }
  details[open] summary :global(.icon) { transform: rotate(45deg); }
  p { padding: 0 0 24px; max-width: 70ch; color: var(--concrete); }
</style>
