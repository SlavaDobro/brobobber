<script>
  // The workshop's bikes in justified rows: each tile keeps the photo's proportions and opens its project.
  import { base } from '$app/paths'
  import Photo from './Photo.svelte'
  import { photoAspect, projects } from './data.js'

  /** @type {{ slugs: string[] }} */
  let { slugs } = $props()
  let tiles = $derived(slugs.flatMap(slug => {
    const project = projects.find(p => p.slug === slug)
    return project?.gallery[0] ? [project] : []
  }))
</script>

<ul class="tiles">
  {#each tiles as project}
    <li style={`--a:${photoAspect(project.gallery[0].src)}`}>
      <a href={`${base}/proekty/${project.slug}`}>
        <Photo base={project.gallery[0].src} alt={project.name} />
        <span>{project.name}</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  .tiles { --h: clamp(220px, 27vw, 400px); display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px; }
  .tiles::after { content: ''; flex: 999 1 0; }
  li { flex: var(--a) 1 calc(var(--a) * var(--h)); aspect-ratio: var(--a); min-width: 0; max-width: 100%; }
  a { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; border-radius: 4px; background: var(--asphalt-2); }
  a :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
  a:hover :global(img) { transform: scale(1.04); }
  a::after { content: ''; position: absolute; inset: 55% 0 0; background: linear-gradient(transparent, #0f100ee0); pointer-events: none; }
  span { position: absolute; z-index: 1; left: 12px; right: 12px; bottom: 10px; font-family: var(--display); font-stretch: 88%; font-weight: 600; font-size: clamp(15px, 1.25vw, 19px); line-height: 1.15; color: var(--paper); }
  a:hover span { color: var(--brass); }
</style>
