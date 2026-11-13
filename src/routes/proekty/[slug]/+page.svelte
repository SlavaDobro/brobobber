<script>
  import { X, ChevronLeft, ChevronRight, Check, ArrowRight } from '@lucide/svelte'
  import Photo from '$lib/site/Photo.svelte'
  import Odometer from '$lib/site/Odometer.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import { styles, photoSrc, plural } from '$lib/site/data.js'

  let { data } = $props()
  let project = $derived(data.project)
  let style = $derived(styles.find(s => s.slug === project.style))
  let cover = $derived(project.gallery[0])
  let rest = $derived(project.gallery.slice(1))

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
  <meta name="description" content={`${project.name}: ${project.works.length} ${plural(project.works.length, ['работа', 'работы', 'работ'])} в мастерской Brobobber. ${project.works.slice(0, 3).join('. ')}.`} />
</svelte:head>

<section class="project-hero">
  <div class="wrap top">
    <nav class="crumbs" aria-label="Вы здесь"><a href="/">Главная</a><span>/</span><a href="/proekty">Проекты</a><span>/</span></nav>
    <h1 class="h1">{project.name}</h1>
    <p class="meta">{project.brand}{style ? `, ${style.name.toLowerCase()}` : ''}. {project.works.length} {plural(project.works.length, ['работа', 'работы', 'работ'])} по проекту.</p>
  </div>
  {#if cover}
    <button class="cover" onclick={() => open(0)} aria-label="Открыть фото на весь экран">
      <Photo base={cover.src} alt={project.name} sizes="100vw" eager w={cover.w} h={cover.h} />
    </button>
  {/if}
</section>

{#if project.specs.length}
  <section class="section specs">
    <div class="wrap grid3">
      {#each project.specs as [value, unit, label]}<Odometer {value} {unit} {label} />{/each}
    </div>
  </section>
{/if}

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

{#if rest.length}
  <section class="section">
    <div class="wrap">
      <h2 class="h2 head">Фотографии</h2>
      <ul class="gallery">
        {#each rest as photo, i}
          <li class:tall={photo.h > photo.w}>
            <button onclick={() => open(i + 1)} aria-label={`Фото ${i + 2} из ${project.gallery.length}`}>
              <Photo base={photo.src} alt={`${project.name}, фото ${i + 2}`} sizes="(max-width: 700px) 50vw, 25vw" w={photo.w} h={photo.h} />
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
      <a class="next" href={`/proekty/${data.next.slug}`}>Следующий: {data.next.name}<ArrowRight size={18} /></a>
    </div>
    <ul class="more">{#each data.more as item}<li><ProjectCard project={item} /></li>{/each}</ul>
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
  .cover { display: block; width: 100%; height: min(82vh, 860px); overflow: hidden; cursor: zoom-in; }
  .cover :global(img) { width: 100%; height: 100%; object-fit: cover; animation: rollup 1.2s .1s var(--ease) both; }
  @keyframes rollup { from { clip-path: inset(0 0 100% 0); transform: scale(1.08); } to { clip-path: inset(0 0 0 0); transform: scale(1); } }
  .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
  .specs { padding: clamp(48px, 6vw, 80px) 0; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: clamp(28px, 5vw, 80px); align-items: start; }
  .sticky { position: sticky; top: calc(var(--header) + 32px); display: grid; gap: 18px; justify-items: start; }
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
  .more { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
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
    .grid3, .more { grid-template-columns: 1fr; }
    .cover { height: 60vh; }
  }
</style>
