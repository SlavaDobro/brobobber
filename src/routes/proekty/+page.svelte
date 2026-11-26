<script>
  // The builds as the workshop's archive. A registry board with the totals on instrument drums;
  // the biggest build as the cover story with its specs and first works; filters as chrome tank
  // emblems (makes) and stamped tags (styles); then every build as a card with its archive number
  // punched on a plate and the work count on the strip under the photo.
  import { base } from '$app/paths'
  import { flip } from 'svelte/animate'
  import { fade } from 'svelte/transition'
  import Photo from '$lib/site/Photo.svelte'
  import Odometer from '$lib/site/Odometer.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { ArrowRight, Wrench } from '@lucide/svelte'
  import { projects, styles, cardStyle, plural, photoAspect } from '$lib/site/data.js'
  import photoWidths from '$lib/site/photo-widths.json'

  const brands = [...new Set(projects.map(p => p.brand))]
  const usedStyles = styles.filter(s => projects.some(p => p.style === s.slug))
  const totalWorks = projects.reduce((sum, p) => sum + p.works.length, 0)
  // Cover story: the build with the longest work list.
  const cover = [...projects].sort((a, b) => b.works.length - a.works.length)[0]
  const coverStyle = styles.find(s => s.slug === cover.style)
  // A wide shot with the whole bike for the cover: from the gallery, or from the same photo folder.
  const folder = cover.gallery[0].src.replace(/\/[^/]+$/, '')
  const coverPhoto = cover.gallery.find(g => photoAspect(g.src) >= 1.25)?.src
    ?? Object.entries(photoWidths).filter(([k, v]) => ('/images/photos/' + k).startsWith(folder + '/') && v[2] >= 1.25).map(([k]) => '/images/photos/' + k)[0]
    ?? cover.gallery[0].src
  let brand = $state('')
  let style = $state('')
  let shown = $derived(projects.filter(p => (!brand || p.brand === brand) && (!style || p.style === style)))
  const no = (/** @type {typeof projects[number]} */ p) => String(projects.indexOf(p) + 1).padStart(3, '0')
  const styleName = (/** @type {string} */ slug) => styles.find(s => s.slug === slug)?.name ?? ''
  const works = (/** @type {number} */ n) => `${n} ${plural(n, ['работа', 'работы', 'работ'])}`
</script>

<svelte:head>
  <title>Наши проекты — Brobobber</title>
  <meta name="description" content="Мотоциклы, которые прошли через мастерскую Brobobber: Harley-Davidson V-Rod, Triumph Rocket 3R, BMW K100, Yamaha V-Max и другие — со списком работ и фото." />
</svelte:head>

<section class="archive">
  <div class="wrap">
    <nav class="crumbs" aria-label="Вы здесь"><a href="{base}/">Главная</a><span aria-hidden="true">/</span></nav>
    <div class="intro">
      <div>
        <span class="kicker">Архив построек</span>
        <h1 class="h1">Наши проекты</h1>
        <p class="lead">Каждый мотоцикл здесь собран под конкретного владельца. Внутри проекта — полный список работ и фотографии.</p>
      </div>
      <div class="registry" aria-label="Архив в цифрах">
        <Odometer value={String(projects.length)} label={plural(projects.length, ['мотоцикл в архиве', 'мотоцикла в архиве', 'мотоциклов в архиве'])} />
        <Odometer value={String(totalWorks)} label={plural(totalWorks, ['работа по списку', 'работы по спискам', 'работ по спискам'])} />
        <Odometer value={String(brands.length)} label={plural(brands.length, ['марка', 'марки', 'марок'])} />
      </div>
    </div>

    <!-- Cover story -->
    <a class="cover" href={`${base}/proekty/${cover.slug}`}>
      <span class="cover-shot"><Photo base={coverPhoto} alt={cover.name} sizes="(max-width: 900px) 100vw, 55vw" cover eager /></span>
      <span class="cover-sheet">
        <span class="cover-tag">Самый большой список работ</span>
        <span class="cover-name">{cover.name}</span>
        <span class="cover-meta">№ {no(cover)} · {coverStyle?.name ?? ''} · {works(cover.works.length)}</span>
        {#if cover.specs?.length}
          <span class="cover-specs">{#each cover.specs as [v, u, l]}<span><b>{v}<small>{u}</small></b>{l}</span>{/each}</span>
        {/if}
        <span class="cover-works">{#each cover.works.slice(0, 4) as w}<span><Wrench size={13} />{w}</span>{/each}</span>
        <span class="cover-go">Открыть проект <ArrowRight size={17} /></span>
      </span>
    </a>
  </div>
</section>

<section class="section catalog">
  <div class="wrap">
    <div class="filters" role="group" aria-label="Фильтры">
      <div class="emblems" role="group" aria-label="Марка">
        <button class="emblem" class:on={!brand} aria-pressed={!brand} onclick={() => brand = ''}>Все марки</button>
        {#each brands as item}<button class="emblem" class:on={brand === item} aria-pressed={brand === item} onclick={() => brand = brand === item ? '' : item}>{item}</button>{/each}
      </div>
      <div class="stamps" role="group" aria-label="Стиль">
        <button class="stamp" class:on={!style} aria-pressed={!style} onclick={() => style = ''}>Любой стиль</button>
        {#each usedStyles as item}<button class="stamp" class:on={style === item.slug} aria-pressed={style === item.slug} onclick={() => style = style === item.slug ? '' : item.slug}>{item.name}</button>{/each}
      </div>
      <p class="found" aria-live="polite">В архиве: <b>{shown.length}</b> из {projects.length}</p>
    </div>

    {#if shown.length}
      <ul class="justified builds">
        {#each shown as project (project.slug)}
          <li style={cardStyle(project)} animate:flip={{ duration: 400 }} in:fade={{ duration: 250 }}>
            <a class="build" href={`${base}/proekty/${project.slug}`}>
              <span class="frame">
                {#if project.gallery[0]}<Photo base={project.gallery[0].src} alt={project.name} sizes="(max-width: 700px) 85vw, 30vw" w={project.gallery[0].w} h={project.gallery[0].h} />{/if}
                <span class="plate" aria-hidden="true">№ {no(project)}</span>
              </span>
              <span class="strip">
                <span class="b-name">{project.name}</span>
                <span class="b-meta">
                  <span>{styleName(project.style)}</span>
                  {#if project.works.length}<span class="b-works"><Wrench size={13} />{works(project.works.length)}</span>{:else if project.year}<span>{project.year}</span>{/if}
                </span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">В этом сочетании проектов нет. <button class="link-steel" onclick={() => { brand = ''; style = '' }}>Сбросить фильтры</button></p>
    {/if}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">С чего начинается проект</h2>
    <ProcessRoad compact />
  </div>
</section>

<section class="section">
  <div class="wrap two"><h2 class="h2">Вопросы</h2><Faq /></div>
</section>

<style>
  .head { margin-bottom: 40px; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }

  /* Archive hero */
  .archive { padding: calc(var(--header) + clamp(32px, 4vw, 60px)) 0 clamp(48px, 6vw, 88px); border-bottom: 1px solid var(--rule); background: linear-gradient(180deg, #181818, var(--asphalt)); }
  .crumbs { display: flex; gap: 8px; font-size: 14px; color: var(--concrete); margin-bottom: 20px; }
  .crumbs a:hover { color: var(--paper); }
  .intro { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 6fr); gap: clamp(24px, 5vw, 72px); align-items: end; margin-bottom: clamp(32px, 4vw, 56px); }
  .intro > div:first-child { display: grid; gap: 16px; }
  .kicker { font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--signal); }
  .registry { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); background: #0e0e0e; border: 1px solid var(--rule); border-radius: 3px; }
  .registry > :global(*) { padding: 18px 20px; }
  .registry > :global(* + *) { border-left: 1px solid var(--rule); }

  .cover { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); background: #101010; border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; }
  .cover-shot { display: block; position: relative; min-height: 420px; }
  .cover-shot :global(img) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .9s var(--ease), filter .5s; }
  .cover:hover .cover-shot :global(img) { transform: scale(1.03); }
  .cover-sheet { display: grid; align-content: center; gap: 16px; padding: clamp(24px, 3vw, 44px); }
  .cover-tag { justify-self: start; padding: 4px 10px; border: 1.5px solid var(--signal); border-radius: 2px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--signal); transform: rotate(-2deg); }
  .cover-name { font-family: var(--display); font-weight: 800; font-size: clamp(30px, 3.4vw, 52px); line-height: 1.02; }
  .cover-meta { font-family: var(--display); font-weight: 600; font-stretch: 108%; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: var(--concrete); }
  .cover-specs { display: flex; flex-wrap: wrap; gap: 0; border: 1px solid var(--rule); border-radius: 3px; }
  .cover-specs > span { flex: 1 1 0; display: grid; gap: 2px; padding: 10px 14px; font-size: 12px; color: var(--concrete); }
  .cover-specs > span + span { border-left: 1px solid var(--rule); }
  .cover-specs b { font-family: var(--display); font-weight: 800; font-size: 24px; color: var(--paper); }
  .cover-specs small { font-size: .5em; margin-left: 4px; color: var(--concrete); }
  .cover-works { display: grid; gap: 6px; }
  .cover-works span { display: flex; gap: 10px; align-items: baseline; font-size: 14px; color: var(--concrete); }
  .cover-works :global(svg) { flex: none; color: var(--signal); transform: translateY(2px); }
  .cover-go { display: inline-flex; align-items: center; gap: 8px; justify-self: start; font-family: var(--display); font-weight: 700; color: var(--paper); border-bottom: 2px solid var(--signal); padding-bottom: 3px; }
  .cover:hover .cover-go :global(svg) { transform: translateX(3px); }
  .cover-go :global(svg) { transition: transform .25s var(--ease); }

  /* Filters: chrome tank emblems for makes, stamped tags for styles. */
  .filters { display: grid; gap: 16px; margin-bottom: 44px; }
  .emblems, .stamps { display: flex; flex-wrap: wrap; gap: 10px; }
  .emblem { padding: 9px 18px; border-radius: 100px; font-family: var(--display); font-weight: 800; font-stretch: 104%; font-size: 14px; letter-spacing: .03em; color: #1a1a1a;
    background: linear-gradient(180deg, #f2f3f5, #a9aeb4 48%, #d7dade 52%, #8d9298); box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 #0005, 0 3px 6px #0008; opacity: .55; transition: opacity .2s, transform .2s, box-shadow .2s; }
  .emblem:hover { opacity: .85; }
  .emblem.on { opacity: 1; box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 #0005, 0 0 0 2px var(--signal), 0 3px 8px #000a; transform: translateY(-1px); }
  .stamp { padding: 6px 12px 5px; border: 1.5px dashed #ebebea4d; border-radius: 2px; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--concrete); transition: color .2s, border-color .2s; }
  .stamp:hover { color: var(--paper); border-color: #ebebea99; }
  .stamp.on { border-style: solid; border-color: var(--signal); color: var(--signal); transform: rotate(-2deg); }
  .found { font-size: 14px; color: var(--concrete); }
  .found b { color: var(--paper); font-family: var(--display); }
  .empty { color: var(--concrete); }

  /* Build cards */
  .build { display: grid; gap: 0; background: #101010; border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; transition: border-color .3s, transform .35s var(--ease); }
  .build:hover { border-color: #ebebea40; transform: translateY(-3px); }
  .frame { position: relative; display: block; aspect-ratio: var(--a, 3 / 4); overflow: hidden; background: var(--asphalt-2); }
  .frame :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease), filter .5s; }
  .build:hover .frame :global(img) { transform: scale(1.04); filter: none; }
  /* The archive number on a small riveted plate. */
  .plate { position: absolute; left: 12px; top: 12px; padding: 4px 10px 3px; background: linear-gradient(180deg, #d9dcdf, #9ea3a8); color: #141414; border-radius: 2px;
    font-family: var(--display); font-weight: 800; font-stretch: 112%; font-size: 11px; letter-spacing: .16em; box-shadow: inset 0 1px 0 #fff8, 0 2px 4px #000a; }
  .strip { display: grid; gap: 6px; padding: 14px 16px 16px; border-top: 2px solid #0a0a0a; }
  .b-name { font-family: var(--display); font-weight: 700; font-size: 19px; line-height: 1.2; transition: color .2s; }
  .build:hover .b-name { color: var(--paper); }
  .b-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; color: var(--concrete); }
  .b-works { display: inline-flex; align-items: center; gap: 6px; }
  .b-works :global(svg) { color: var(--signal); }

  @media (max-width: 960px) {
    .intro, .cover, .two { grid-template-columns: 1fr; }
    .cover-shot { min-height: 0; aspect-ratio: 4 / 3; }
  }
  @media (max-width: 560px) {
    .registry { grid-template-columns: 1fr; }
    .registry > :global(* + *) { border-left: 0; border-top: 1px solid var(--rule); }
  }
</style>
