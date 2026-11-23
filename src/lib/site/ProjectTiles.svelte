<script>
  // A mosaic of the workshop's own bikes: eight tiles of different sizes, each opens its project.
  import { base } from '$app/paths'
  import Photo from './Photo.svelte'
  import { projects } from './data.js'

  /** @type {{ slugs: string[] }} */
  let { slugs } = $props()
  let tiles = $derived(slugs.flatMap(slug => {
    const project = projects.find(p => p.slug === slug)
    return project?.gallery[0] ? [project] : []
  }))
</script>

<ul class="tiles">
  {#each tiles as project}
    <li>
      <a href={`${base}/proekty/${project.slug}`}>
        <Photo base={project.gallery[0].src} alt={project.name} sizes="(max-width: 760px) 100vw, 50vw" />
        <span>{project.name}</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  .tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: clamp(150px, 16vw, 250px); gap: 10px; }
  li { min-width: 0; }
  li:nth-child(8n + 1), li:nth-child(8n + 7) { grid-column: span 2; grid-row: span 2; }
  li:nth-child(8n + 4), li:nth-child(8n + 8) { grid-column: span 2; }
  /* The big tile of the second half stands on the right. */
  li:nth-child(8n + 5) { grid-column: 1; }
  li:nth-child(8n + 7) { grid-column: 3 / span 2; grid-row: 3 / span 2; }
  li:nth-child(8n + 8) { grid-column: 1 / span 2; grid-row: 4; }
  a { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; border-radius: 4px; background: var(--asphalt-2); }
  a :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
  a:hover :global(img) { transform: scale(1.05); }
  a::after { content: ''; position: absolute; inset: 50% 0 0; background: linear-gradient(transparent, #0f100ed9); pointer-events: none; }
  span { position: absolute; z-index: 1; left: 14px; right: 14px; bottom: 12px; font-family: var(--display); font-stretch: 88%; font-weight: 600; font-size: clamp(15px, 1.35vw, 20px); line-height: 1.15; color: var(--paper); }
  a:hover span { color: var(--brass); }
  @media (max-width: 760px) {
    .tiles { grid-template-columns: 1fr 1fr; grid-auto-rows: 42vw; gap: 8px; }
    li:nth-child(n) { grid-column: auto; grid-row: auto; }
    li:nth-child(4n + 1) { grid-column: 1 / -1; grid-row: span 2; }
    li:nth-child(4n) { grid-column: 1 / -1; }
  }
</style>
