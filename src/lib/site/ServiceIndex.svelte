<script>
  // All services as a numbered work order: two columns of rows, the last row leads to the full page.
  import { base } from '$app/paths'
  import { ArrowRight } from '@lucide/svelte'
  import { services } from './data.js'
</script>

<ol class="index">
  {#each services as service, i}
    <li>
      <a href={`${base}/uslugi/${service.slug}`}>
        <span class="n">{String(i + 1).padStart(2, '0')}</span>
        <span class="text"><strong>{service.name}</strong><small>{service.short}</small></span>
        <ArrowRight size={18} />
      </a>
    </li>
  {/each}
  <li class="all">
    <a href="{base}/uslugi"><span class="text"><strong>Все услуги мастерской</strong></span><ArrowRight size={20} /></a>
  </li>
</ol>

<style>
  .index { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(7, auto); grid-auto-flow: column; column-gap: clamp(24px, 4vw, 64px); }
  li { border-top: 1px solid var(--rule); }
  a { display: grid; grid-template-columns: 32px minmax(0, 1fr) 18px; gap: 10px; align-items: center; height: 100%; padding: 13px 0; transition: color .2s, padding .25s var(--ease); }
  a :global(svg) { color: var(--brass); opacity: .55; transition: opacity .2s, transform .25s var(--ease); }
  a:hover { color: var(--brass); padding-left: 6px; }
  a:hover :global(svg) { opacity: 1; transform: translateX(3px); }
  .n { font-family: var(--display); font-stretch: 85%; font-size: 13px; color: var(--brass); font-variant-numeric: tabular-nums; }
  .text { display: grid; gap: 1px; }
  strong { font-family: var(--display); font-stretch: 88%; font-weight: 600; font-size: 18px; line-height: 1.2; }
  small { font-size: 14px; line-height: 1.35; color: var(--concrete); }
  .all a { grid-template-columns: minmax(0, 1fr) 20px; margin-top: 8px; padding: 14px 16px; background: var(--brass); color: var(--asphalt); border-radius: 4px; height: calc(100% - 8px); }
  .all a:hover { background: var(--paper); color: var(--asphalt); padding-left: 16px; }
  .all a :global(svg) { color: inherit; opacity: 1; }
  .all { border-top: 0; }
  @media (max-width: 760px) {
    .index { grid-template-columns: 1fr; grid-template-rows: none; grid-auto-flow: row; }
  }
</style>
