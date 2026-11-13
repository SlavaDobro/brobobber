<script>
  // Inner page opening: title on the left, the picture rolls up like the workshop door.
  import Photo from './Photo.svelte'

  /** @type {{ title: string, lead?: string, photo?: string, alt?: string, crumbs?: { href: string, label: string }[], children?: import('svelte').Snippet }} */
  let { title, lead = '', photo = '', alt = '', crumbs = [], children } = $props()
</script>

<section class="page-hero">
  <div class="wrap grid" class:no-photo={!photo}>
    <div class="copy">
      {#if crumbs.length}
        <nav class="crumbs" aria-label="Вы здесь">
          {#each crumbs as crumb}<a href={crumb.href}>{crumb.label}</a><span aria-hidden="true">/</span>{/each}
        </nav>
      {/if}
      <h1 class="h1">{title}</h1>
      {#if lead}<p class="lead">{lead}</p>{/if}
      {@render children?.()}
    </div>
    {#if photo}
      <div class="picture">
        <Photo base={photo} {alt} sizes="(max-width: 900px) 100vw, 50vw" eager />
      </div>
    {/if}
  </div>
</section>

<style>
  .page-hero { padding: calc(var(--header) + clamp(40px, 7vw, 96px)) 0 clamp(48px, 7vw, 96px); }
  .grid { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 6fr); gap: clamp(28px, 5vw, 80px); align-items: end; }
  .grid.no-photo { grid-template-columns: minmax(0, 1fr); }
  .copy { display: grid; gap: 24px; align-content: end; }
  .crumbs { display: flex; flex-wrap: wrap; gap: 8px; font-size: 14px; color: var(--concrete); }
  .crumbs a:hover { color: var(--paper); }
  .h1 { max-width: 14ch; }
  .no-photo .h1 { max-width: 18ch; }
  .picture { aspect-ratio: 4 / 3; overflow: hidden; border-radius: 4px; animation: rollup 1.1s .15s var(--ease) both; }
  .picture :global(img) { width: 100%; height: 100%; object-fit: cover; animation: settle 1.6s .15s var(--ease) both; }
  @keyframes rollup { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
  @keyframes settle { from { transform: scale(1.12); } }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .picture { order: -1; } }
</style>
