<script>
  // All services as a numbered work order: two columns of rows, the last row leads to the full page.
  import { base } from '$app/paths'
  import { ArrowRight } from '@lucide/svelte'
  import { services } from './data.js'
  import { serviceIcon, hexPoints } from './service-icons.js'
</script>

<ol class="index">
  {#each services as service}
    {@const Tool = serviceIcon(service.slug)}
    <li>
      <a href={`${base}/uslugi/${service.slug}`}>
        <span class="n" aria-hidden="true"><svg class="hex" viewBox="-12 -12 24 24"><polygon points={hexPoints} /></svg><Tool size={14} strokeWidth={2} /></span>
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
  a { display: grid; grid-template-columns: 32px minmax(0, 1fr) 18px; gap: 14px; align-items: center; height: 100%; padding: 13px 0; transition: color .2s, padding .25s var(--ease); }
  a :global(svg) { color: var(--steel); opacity: .55; transition: opacity .2s, transform .25s var(--ease); }
  a:hover { color: var(--steel); padding-left: 6px; }
  a:hover :global(svg) { opacity: 1; transform: translateX(3px); }
  /* The service's tool in the logo's hex nut; it turns red and a sixth of a turn on hover. */
  .n { position: relative; width: 30px; height: 30px; display: grid; place-items: center; color: var(--paper); transition: transform .45s var(--ease); }
  .n .hex { position: absolute; inset: 0; width: 100%; height: 100%; }
  .n polygon { fill: #1c1c1c; stroke: #ebebea4d; stroke-width: 1.2; stroke-linejoin: round; transition: fill .25s, stroke .25s; }
  .n :global(svg.lucide) { position: relative; transition: transform .45s var(--ease); }
  a:hover .n { transform: rotate(60deg); }
  a:hover .n :global(svg.lucide) { transform: rotate(-60deg); }
  a:hover .n polygon { fill: var(--signal); stroke: var(--signal); }
  .text { display: grid; gap: 1px; }
  strong { font-family: var(--display); font-stretch: 96%; font-weight: 600; font-size: 18px; line-height: 1.2; }
  small { font-size: 14px; line-height: 1.35; color: var(--concrete); }
  .all a { grid-template-columns: minmax(0, 1fr) 20px; margin-top: 8px; padding: 14px 16px; background: var(--steel); color: var(--asphalt); border-radius: 4px; height: calc(100% - 8px); }
  .all a:hover { background: var(--paper); color: var(--asphalt); padding-left: 16px; }
  .all a :global(svg) { color: inherit; opacity: 1; }
  .all { border-top: 0; }
  @media (max-width: 760px) {
    .index { grid-template-columns: 1fr; grid-template-rows: none; grid-auto-flow: row; }
  }
</style>
