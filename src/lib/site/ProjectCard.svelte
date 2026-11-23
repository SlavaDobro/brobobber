<script>
  import { base } from '$app/paths'
  import Photo from './Photo.svelte'
  import { styles, plural } from './data.js'

  /** @type {{ project: import('./data.js').Project, sizes?: string }} */
  let { project, sizes = '(max-width: 700px) 85vw, 30vw' } = $props()
  let cover = $derived(project.gallery[0])
  let style = $derived(styles.find(s => s.slug === project.style))
  // Channel projects told as a story have no work list: show the year instead of "0 работ".
  let tags = $derived([
    project.works.length ? `${project.works.length} ${plural(project.works.length, ['работа', 'работы', 'работ'])}` : project.year ? `${project.year} год` : '',
    style?.name.toLowerCase() ?? '',
  ].filter(Boolean).join(', '))
</script>

<a class="card" href={`${base}/proekty/${project.slug}`}>
  <span class="frame">
    {#if cover}<Photo base={cover.src} alt={project.name} {sizes} w={cover.w} h={cover.h} />{/if}
  </span>
  <span class="meta">
    <span class="name">{project.name}</span>
    <span class="tags">{tags}</span>
  </span>
</a>

<style>
  .card { display: grid; gap: 14px; color: var(--paper); }
  .frame { display: block; aspect-ratio: var(--a, 3 / 4); overflow: hidden; border-radius: 4px; background: var(--asphalt-2); }
  .frame :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
  .card:hover .frame :global(img) { transform: scale(1.05); }
  .meta { display: grid; gap: 2px; }
  .name { font-family: var(--display); font-stretch: 88%; font-weight: 600; font-size: 20px; line-height: 1.2; }
  .tags { font-size: 14px; color: var(--concrete); }
  .card:hover .name { color: var(--brass); }
</style>
