<script>
  import { base } from '$app/paths'
  import { X, ChevronLeft, ChevronRight, Check, ArrowRight } from '@lucide/svelte'
  import Photo from '$lib/site/Photo.svelte'
  import Odometer from '$lib/site/Odometer.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import { styles, photoSrc, plural, cardStyle } from '$lib/site/data.js'
  import videos from '$lib/site/videos.json'

  let { data } = $props()
  let project = $derived(data.project)
  let style = $derived(styles.find(s => s.slug === project.style))
  // The opening row: as many photos as it takes to fill the width, each one whole.
  let opening = $derived.by(() => {
    const row = []
    let sum = 0
    for (const photo of project.gallery) {
      row.push(photo)
      sum += photo.w / photo.h
      if (sum >= 2.1 || row.length === 3) break
    }
    return { row, sum }
  })
  let restStart = $derived(opening.row.length)
  let rest = $derived(project.gallery.slice(restStart))
  let meta = $derived([
    project.brand + (style ? `, ${style.name.toLowerCase()}` : ''),
    project.works.length ? `${project.works.length} ${plural(project.works.length, ['работа', 'работы', 'работ'])} по проекту` : '',
    project.year ? `${project.year} год` : '',
  ].filter(Boolean).join('. ') + '.')
  // Search snippet: the work list when there is one, otherwise the opening of the story.
  let description = $derived(project.works.length
    ? `${project.name}: ${project.works.length} ${plural(project.works.length, ['работа', 'работы', 'работ'])} в мастерской Brobobber. ${project.works.slice(0, 3).join('. ')}.`
    : `${project.name} — проект мастерской Brobobber. ${(project.story ?? [])[0] ?? ''}`.slice(0, 300))
  let clip = $derived(project.post ? videos.find(v => v.post === project.post) : undefined)

  /** @type {HTMLDialogElement} */ let viewer
  let shown = $state(0)
  /** @param {number} i */
  function open(i) { shown = i; viewer.showModal() }
  /** @param {number} d */
  function step(d) { shown = (shown + d + project.gallery.length) % project.gallery.length }
  /** @param {KeyboardEvent} e */
  function onkeydown(e) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }
</script>

<svelte:head>
  <title>{project.name} — проект Brobobber</title>
  <meta name="description" content={description} />
</svelte:head>

<section class="project-hero">
  <div class="wrap top">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span>/</span><a href="{base}/proekty">Проекты</a><span>/</span></nav>
    <h1 class="h1">{project.name}</h1>
    <p class="meta">{meta}</p>
  </div>
  {#if opening.row.length}
    <div class="cover-row" style={`--sum:${opening.sum}`}>
      {#each opening.row as photo, i}
        <button style={`--a:${photo.w / photo.h}`} onclick={() => open(i)} aria-label={`Фото ${i + 1} на весь экран`}>
          <Photo base={photo.src} alt={i === 0 ? project.name : ''} sizes="50vw" eager w={photo.w} h={photo.h} />
        </button>
      {/each}
    </div>
  {/if}
</section>

{#if project.specs.length}
  <section class="section specs">
    <div class="wrap grid3">
      {#each project.specs as [value, unit, label]}<Odometer {value} {unit} {label} />{/each}
    </div>
  </section>
{/if}

{#if project.story?.length}
  <section class="section">
    <div class="wrap two">
      <h2 class="h2">История проекта</h2>
      <div class="story">
        {#each project.story as paragraph, i}<p class:first={i === 0}>{paragraph}</p>{/each}
        {#if project.post}<a class="link-brass" href={project.post} target="_blank" rel="noopener">Пост о проекте в Telegram-канале</a>{/if}
        {#if clip}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video class="clip" src={`${base + clip.src}#t=0.6`} controls playsinline preload="metadata"></video>
        {/if}
      </div>
    </div>
  </section>
{/if}

{#if project.works.length}
<section class="section">
  <div class="wrap two">
    <div class="sticky">
      <h2 class="h2">Что сделали</h2>
      <p class="muted">Полный список работ по мотоциклу — так, как его записали мастера.</p>
      <a class="btn btn-signal" href="#zayavka">Обсудить похожий проект</a>
    </div>
    <ol class="works">
      {#each project.works as work, i}<li><span class="n">{String(i + 1).padStart(2, '0')}</span><span>{work}</span><Check size={16} /></li>{/each}
    </ol>
  </div>
</section>
{/if}

{#if rest.length}
  <section class="section">
    <div class="wrap">
      <h2 class="h2 head">Фотографии</h2>
      <ul class="gallery">
        {#each rest as photo, i}
          <li class:tall={photo.h > photo.w}>
            <button onclick={() => open(i + restStart)} aria-label={`Фото ${i + restStart + 1} из ${project.gallery.length}`}>
              <Photo base={photo.src} alt={`${project.name}, фото ${i + restStart + 1}`} sizes="(max-width: 700px) 50vw, 25vw" w={photo.w} h={photo.h} />
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </section>
{/if}

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Ещё проекты</h2>
      <a class="next" href={`${base}/proekty/${data.next.slug}`}>Следующий: {data.next.name}<ArrowRight size={18} /></a>
    </div>
    <ul class="justified fill">{#each data.more as item}<li style={cardStyle(item)}><ProjectCard project={item} /></li>{/each}</ul>
  </div>
</section>

<dialog class="viewer" bind:this={viewer} {onkeydown} aria-label="Просмотр фото">
  {#if project.gallery[shown]}
    <img src={photoSrc(project.gallery[shown].src).src} alt={`${project.name}, фото ${shown + 1}`} />
  {/if}
  <p class="counter">{shown + 1} / {project.gallery.length}</p>
  <button class="close" aria-label="Закрыть" onclick={() => viewer.close()}><X size={22} /></button>
  <button class="prev" aria-label="Предыдущее фото" onclick={() => step(-1)}><ChevronLeft size={26} /></button>
  <button class="nextb" aria-label="Следующее фото" onclick={() => step(1)}><ChevronRight size={26} /></button>
</dialog>

<style>
  .project-hero { padding-top: calc(var(--header) + clamp(32px, 5vw, 72px)); }
  .top { display: grid; gap: 18px; padding-bottom: clamp(28px, 4vw, 48px); }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); }
  .crumbs a:hover { color: var(--paper); }
  .h1 { max-width: 22ch; text-wrap: balance; }
  .meta { color: var(--concrete); font-size: 17px; }
  /* Justified row: the height is what lets all the photos fit the width at their own proportions. */
  .cover-row { display: flex; justify-content: center; gap: 6px; padding-inline: var(--gutter);
    height: min(80vh, calc((var(--page-w, 100vw) - 2 * var(--gutter) - 12px) / var(--sum))); }
  .cover-row button { flex: none; height: 100%; aspect-ratio: var(--a); overflow: hidden; border-radius: 4px; cursor: zoom-in; }
  .cover-row :global(img) { width: 100%; height: 100%; object-fit: cover; animation: rollup 1.2s var(--ease) both; }
  .cover-row button:nth-child(2) :global(img) { animation-delay: .12s; }
  .cover-row button:nth-child(3) :global(img) { animation-delay: .24s; }
  @keyframes rollup { from { clip-path: inset(0 0 100% 0); transform: scale(1.08); } to { clip-path: inset(0 0 0 0); transform: scale(1); } }
  .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
  .specs { padding: clamp(48px, 6vw, 80px) 0; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: clamp(28px, 5vw, 80px); align-items: start; }
  .sticky { position: sticky; top: calc(var(--header) + 32px); display: grid; gap: 18px; justify-items: start; }
  .story { display: grid; gap: 18px; max-width: 64ch; justify-items: start; }
  .story p { font-size: 18px; line-height: 1.65; color: #ece8dfd9; }
  .story .clip { width: min(100%, 320px); aspect-ratio: 9 / 16; border-radius: 6px; background: var(--asphalt-2); object-fit: cover; margin-top: 8px; }
  .story p.first { font-size: clamp(20px, 1.8vw, 24px); color: var(--paper); }
  .works li { display: grid; grid-template-columns: 34px 1fr 18px; gap: 12px; padding: 15px 0; border-bottom: 1px solid var(--rule); font-size: 17px; align-items: start; }
  .works .n { font-family: var(--display); font-size: 13px; color: var(--brass); padding-top: 4px; }
  .works :global(svg) { color: var(--brass); margin-top: 4px; }
  .head { margin-bottom: 32px; }
  .gallery { columns: 3 260px; column-gap: 16px; }
  .gallery li { break-inside: avoid; margin-bottom: 16px; }
  .gallery button { display: block; width: 100%; overflow: hidden; border-radius: 4px; cursor: zoom-in; }
  .gallery :global(img) { width: 100%; height: auto; transition: transform .6s var(--ease); }
  .gallery button:hover :global(img) { transform: scale(1.04); }
  .next { display: inline-flex; align-items: center; gap: 8px; color: var(--brass); }
  .viewer { width: 100vw; height: 100vh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: #0f100ef2; color: var(--paper); }
  .viewer::backdrop { background: transparent; }
  .viewer[open] { display: grid; place-items: center; }
  .viewer img { max-width: 92vw; max-height: 86vh; object-fit: contain; }
  .viewer button { position: absolute; width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%; background: #1c1d1bcc; border: 1px solid var(--rule); }
  .close { top: 20px; right: 20px; }
  .prev { left: 20px; top: 50%; margin-top: -26px; }
  .nextb { right: 20px; top: 50%; margin-top: -26px; }
  .counter { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); font-size: 14px; color: var(--concrete); }
  @media (max-width: 860px) {
    .two { grid-template-columns: 1fr; }
    .sticky { position: static; }
    .grid3 { grid-template-columns: 1fr; }
    /* Phones: the first photo across the width, the others share one row at equal height. */
    .cover-row { flex-wrap: wrap; height: auto; }
    .cover-row button { flex: var(--a) 1 0; min-width: 0; height: auto; }
    .cover-row button:first-child { flex-basis: 100%; }
  }
</style>
