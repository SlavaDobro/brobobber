<script>
  import { base } from '$app/paths'
  import PageHero from '$lib/site/PageHero.svelte'
  import Photo from '$lib/site/Photo.svelte'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import { styles, projects } from '$lib/site/data.js'
</script>

<svelte:head>
  <title>Мотоциклы и стили кастома — Brobobber</title>
  <meta name="description" content="Боббер, чоппер, кафе-рейсер, скрэмблер, бэггер, маскл, клаб-стайл, чикано: стили, с которыми работает мастерская Brobobber." />
</svelte:head>

<PageHero title="Стили, в которых строим" lead="Кастомизация и индивидуальные проекты в восьми стилях. Выберите близкий — расскажем, что в нём важно, и покажем наши мотоциклы." photo="/images/site/style-maskl" alt="Маскл-круизер в мастерской" crumbs={[{ href: '/', label: 'Главная' }]} />

<section class="section">
  <div class="wrap">
    <ul class="styles">
      {#each styles as style, i}
        <li>
          <a href={`${base}/motocikly/${style.slug}`}>
            <span class="pic"><Photo base={style.image} alt={style.name} sizes="(max-width: 700px) 100vw, 50vw" /></span>
            <span class="row"><span class="name">{style.name}</span><span class="count">{projects.filter(p => p.style === style.slug).length || ''}</span></span>
            <span class="lead-s">{style.lead}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Что дорабатываем</h2><p>Независимо от стиля — эти узлы мы меняем чаще всего.</p></div>
    <ServiceBike />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Наши проекты</h2><a class="link-brass" href="{base}/proekty">Все проекты</a></div>
    <ul class="projects">{#each projects.slice(0, 4) as project}<li><ProjectCard {project} /></li>{/each}</ul>
  </div>
</section>

<style>
  .styles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px 28px; }
  a { display: grid; gap: 10px; }
  .pic { aspect-ratio: 3 / 2; overflow: hidden; border-radius: 4px; }
  .pic :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform .9s var(--ease); }
  a:hover .pic :global(img) { transform: scale(1.04); }
  .row { display: flex; justify-content: space-between; align-items: baseline; }
  .name { font-family: var(--display); font-stretch: 78%; font-weight: 650; font-size: clamp(32px, 3.4vw, 48px); line-height: 1; }
  a:hover .name { color: var(--brass); }
  .count { font-family: var(--display); color: var(--brass); }
  .lead-s { color: var(--concrete); max-width: 52ch; }
  .projects { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
  @media (max-width: 960px) { .projects { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 700px) { .styles { grid-template-columns: 1fr; } }
</style>
