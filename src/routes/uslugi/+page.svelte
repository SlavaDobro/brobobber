<script>
  import { base } from '$app/paths'
  import PageHero from '$lib/site/PageHero.svelte'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import ProjectTiles from '$lib/site/ProjectTiles.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Faq from '$lib/site/Faq.svelte'

  const works = ['harley-davidson-v-rod', 'harley-davidson-scrambler', 'yamaha-v-max-1700', 'harley-davidson-heritage-114', 'bmw-k100', 'harley-davidson-sportster-883', 'triumph-rocket-3r', 'harley-davidson-48-nardo-gray']
</script>

<svelte:head>
  <title>Услуги — Brobobber</title>
  <meta name="description" content="Кастомизация, тюнинг, обслуживание и ремонт, прошивка ЭБУ, сиденья, электроника, детейлинг, мотоэвакуатор. Мастерская Brobobber в Москве." />
</svelte:head>

<PageHero title="Услуги мастерской" lead="От замены лампочки до мотоцикла, собранного с нуля. Выберите услугу на схеме мотоцикла или в списке." photo="/images/photos/home/16" alt="Мотоцикл на подъёмнике в мастерской" crumbs={[{ href: '/', label: 'Главная' }]} />

<section class="section">
  <div class="wrap">
    <ServiceBike />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2 class="h2">Проекты мастерской</h2><a class="link-brass" href="{base}/proekty">Все проекты</a></div>
    <ProjectTiles slugs={works} />
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <h2 class="h2 head">Как проходит работа</h2>
    <ProcessRoad compact />
  </div>
</section>

<section class="section">
  <div class="wrap faq">
    <h2 class="h2">Вопросы</h2>
    <Faq />
  </div>
</section>

<style>
  .head { margin-bottom: 32px; }
  .faq { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }
  @media (max-width: 960px) { .faq { grid-template-columns: 1fr; } }
</style>
