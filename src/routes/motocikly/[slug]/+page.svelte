<script>
  import PageHero from '$lib/site/PageHero.svelte'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { styles, projects } from '$lib/site/data.js'

  let { data } = $props()
  let style = $derived(data.style)
  let others = $derived(styles.filter(s => s.slug !== style.slug))
  let shown = $derived(data.own.length ? data.own : projects.slice(0, 3))
</script>

<svelte:head>
  <title>{style.name} — кастом в стиле {style.name.toLowerCase()} | Brobobber</title>
  <meta name="description" content={`${style.name}: ${style.lead} Кастомизация в мастерской Brobobber, Москва.`} />
</svelte:head>

<PageHero title={style.name} lead={style.lead} photo={style.image} alt={`Мотоцикл в стиле ${style.name.toLowerCase()}`}
  crumbs={[{ href: '/', label: 'Главная' }, { href: '/motocikly', label: 'Мотоциклы' }]}>
  <a class="btn btn-signal cta" href="#zayavka">Обсудить проект</a>
</PageHero>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Особенности стиля</h2>
    <dl class="traits">
      {#each style.traits as [term, value]}
        <div><dt>{term}</dt><dd>{value}</dd></div>
      {/each}
    </dl>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">{data.own.length ? `Наши проекты в этом стиле` : 'Наши проекты'}</h2>
      {#if !data.own.length}<p>Проектов именно в этом стиле на сайте пока нет — вот что мы строили недавно.</p>{/if}
      <a class="link-brass" href="/proekty">Все проекты</a>
    </div>
    <ul class="projects">{#each shown as project}<li><ProjectCard {project} /></li>{/each}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Что можно доработать</h2><p>Отметки на мотоцикле ведут на страницы услуг.</p></div>
    <ServiceBike />
  </div>
</section>

<section class="section">
  <div class="wrap two">
    <h2 class="h2">Вопросы</h2>
    <Faq />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h3 others-title">Другие стили</h2>
    <ul class="others">{#each others as item}<li><a href={`/motocikly/${item.slug}`}>{item.name}</a></li>{/each}</ul>
  </div>
</section>

<style>
  .cta { justify-self: start; }
  .head { margin-bottom: 36px; }
  .traits { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule); }
  .traits div { padding: 24px 24px 0 0; display: grid; gap: 10px; align-content: start; }
  .traits div + div { padding-left: 24px; border-left: 1px solid var(--rule); }
  dt { font-family: var(--display); font-stretch: 88%; color: var(--brass); font-size: 15px; }
  dd { font-size: 19px; line-height: 1.4; }
  .projects { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }
  .others-title { margin-bottom: 16px; }
  .others { display: flex; flex-wrap: wrap; gap: 10px; }
  .others a { display: inline-block; padding: 9px 16px; border: 1px solid var(--rule); border-radius: 100px; color: var(--concrete); }
  .others a:hover { color: var(--paper); border-color: var(--concrete); }
  @media (max-width: 900px) {
    .traits { grid-template-columns: 1fr 1fr; }
    .traits div:nth-child(3) { padding-left: 0; border-left: 0; }
    .projects { grid-template-columns: 1fr 1fr; }
    .two { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) { .traits { grid-template-columns: 1fr; } .traits div + div { padding-left: 0; border-left: 0; } .projects { grid-template-columns: 1fr; } }
</style>
