<script>
  // A wall of photos in justified rows: every photo keeps its own proportions, nothing is cropped.
  import Photo from './Photo.svelte'
  import { photoAspect } from './data.js'

  /** @type {{ photos: string[], alt?: string }} */
  let { photos, alt = '' } = $props()
</script>

<ul class="wall">
  {#each photos as photo}
    <li style={`--a:${photoAspect(photo)}`}><Photo base={photo} {alt} /></li>
  {/each}
</ul>

<style>
  .wall { --h: clamp(190px, 24vw, 340px); display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px; }
  .wall::after { content: ''; flex: 999 1 0; }
  li { flex: var(--a) 1 calc(var(--a) * var(--h)); aspect-ratio: var(--a); min-width: 0; max-width: 100%; overflow: hidden; border-radius: 4px; background: var(--asphalt-2); }
  li :global(img) { width: 100%; height: 100%; object-fit: cover; }
</style>
