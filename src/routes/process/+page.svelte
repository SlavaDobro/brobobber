<script>
  import { base } from '$app/paths'
  import PageHero from '$lib/site/PageHero.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import Photo from '$lib/site/Photo.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import VideoReel from '$lib/site/VideoReel.svelte'
  import { projects } from '$lib/site/data.js'

  const workshop = ['/images/photos/home/16', '/images/photos/home/11', '/images/photos/48nardogray/04', '/images/photos/rocket/03']
</script>

<svelte:head>
  <title>Процесс: от идеи до готового мотоцикла — Brobobber</title>
  <meta name="description" content="Восемь этапов кастомизации в Brobobber: консультация, концепция, техзадание и смета, договор, работы, проверка и передача, обслуживание после." />
</svelte:head>

<PageHero title="От идеи до готового мотоцикла" lead="Восемь этапов, на каждом вы знаете, что происходит с мотоциклом. Комплексная кастомизация занимает от 1 до 2 месяцев, когда детали на месте." photo="/images/photos/home/16" alt="Мотоцикл в работе в мастерской" crumbs={[{ href: '/', label: 'Главная' }]}>
  <a class="btn btn-signal cta" href="#zayavka">Обсудить проект</a>
</PageHero>

<section class="section">
  <div class="wrap"><ProcessRoad /></div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Из мастерской</h2>
    <ul class="strip">
      {#each workshop as photo}<li><Photo base={photo} alt="" sizes="(max-width: 700px) 50vw, 25vw" /></li>{/each}
    </ul>
    <h3 class="h3 reel-title">Как это выглядит в работе</h3>
    <VideoReel />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Чем это заканчивается</h2><a class="link-brass" href="{base}/proekty">Все проекты</a></div>
    <ul class="projects">{#each projects.slice(0, 3) as project}<li><ProjectCard {project} /></li>{/each}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap two"><h2 class="h2">Вопросы</h2><Faq /></div>
</section>

<style>
  .cta { justify-self: start; }
  .head { margin-bottom: 32px; }
  .reel-title { margin: 48px 0 20px; }
  .strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .strip li { aspect-ratio: 3 / 4; overflow: hidden; border-radius: 4px; }
  .strip :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .projects { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }
  @media (max-width: 900px) { .strip { grid-template-columns: 1fr 1fr; } .projects { grid-template-columns: 1fr 1fr; } .two { grid-template-columns: 1fr; } }
  @media (max-width: 560px) { .projects { grid-template-columns: 1fr; } }
</style>
