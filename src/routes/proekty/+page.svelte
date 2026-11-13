<script>
  import { flip } from 'svelte/animate'
  import { fade } from 'svelte/transition'
  import PageHero from '$lib/site/PageHero.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { projects, styles } from '$lib/site/data.js'

  const brands = [...new Set(projects.map(p => p.brand))]
  const usedStyles = styles.filter(s => projects.some(p => p.style === s.slug))
  let brand = $state('')
  let style = $state('')
  let shown = $derived(projects.filter(p => (!brand || p.brand === brand) && (!style || p.style === style)))
</script>

<svelte:head>
  <title>Наши проекты — Brobobber</title>
  <meta name="description" content="Мотоциклы, которые прошли через мастерскую Brobobber: Harley-Davidson V-Rod, Triumph Rocket 3R, BMW K100, Yamaha V-Max и другие — со списком работ и фото." />
</svelte:head>

<PageHero title="Наши проекты" lead="Каждый мотоцикл здесь собран под конкретного владельца. Откройте проект — внутри полный список работ и фотографии." photo="/images/photos/rocket/03" alt="Triumph Rocket 3R после кастомизации" crumbs={[{ href: '/', label: 'Главная' }]}>
  <a class="btn btn-signal cta" href="#zayavka">Обсудить проект</a>
</PageHero>

<section class="section catalog">
  <div class="wrap">
    <div class="filters" role="group" aria-label="Фильтры">
      <div class="group">
        <span class="label">Марка</span>
        <button class:on={!brand} aria-pressed={!brand} onclick={() => brand = ''}>Все</button>
        {#each brands as item}<button class:on={brand === item} aria-pressed={brand === item} onclick={() => brand = brand === item ? '' : item}>{item}</button>{/each}
      </div>
      <div class="group">
        <span class="label">Стиль</span>
        <button class:on={!style} aria-pressed={!style} onclick={() => style = ''}>Все</button>
        {#each usedStyles as item}<button class:on={style === item.slug} aria-pressed={style === item.slug} onclick={() => style = style === item.slug ? '' : item.slug}>{item.name}</button>{/each}
      </div>
      <p class="found" aria-live="polite">Показано: {shown.length} из {projects.length}</p>
    </div>

    {#if shown.length}
      <ul class="grid">
        {#each shown as project (project.slug)}
          <li animate:flip={{ duration: 400 }} in:fade={{ duration: 250 }}><ProjectCard {project} sizes="(max-width: 700px) 100vw, 33vw" /></li>
        {/each}
      </ul>
    {:else}
      <p class="empty">В этом сочетании проектов нет. <button class="link-brass" onclick={() => { brand = ''; style = '' }}>Сбросить фильтры</button></p>
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
  .cta { justify-self: start; }
  .filters { display: grid; gap: 14px; margin-bottom: 40px; }
  .group { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .label { width: 70px; color: var(--concrete); font-size: 14px; }
  .group button { padding: 8px 14px; border: 1px solid var(--rule); border-radius: 100px; font-size: 14px; color: var(--concrete); transition: all .2s; }
  .group button:hover { color: var(--paper); border-color: var(--concrete); }
  .group button.on { background: var(--paper); color: var(--asphalt); border-color: var(--paper); }
  .found { font-size: 14px; color: var(--concrete); }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 44px 24px; }
  .empty { color: var(--concrete); }
  .head { margin-bottom: 40px; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }
  @media (max-width: 960px) { .grid { grid-template-columns: 1fr 1fr; } .two { grid-template-columns: 1fr; } }
  @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } .label { width: 100%; } }
</style>
