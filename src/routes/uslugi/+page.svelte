<script>
  import { base } from '$app/paths'
  import PageHero from '$lib/site/PageHero.svelte'
  import ServiceBike from '$lib/site/ServiceBike.svelte'
  import Photo from '$lib/site/Photo.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { services } from '$lib/site/data.js'
</script>

<svelte:head>
  <title>Услуги — Brobobber</title>
  <meta name="description" content="Кастомизация, тюнинг, обслуживание и ремонт, прошивка ЭБУ, сиденья, электроника, детейлинг, мотоэвакуатор. Мастерская Brobobber в Москве." />
</svelte:head>

<PageHero title="Услуги мастерской" lead="От замены лампочки до мотоцикла, собранного с нуля. Ниже — все направления; у каждого своя страница с подробностями и примерами." photo="/images/photos/home/16" alt="Мотоцикл на подъёмнике в мастерской" crumbs={[{ href: '/', label: 'Главная' }]} />

<section class="section">
  <div class="wrap">
    <ServiceBike />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Все услуги</h2>
    <ul class="grid">
      {#each services as service, i}
        <li>
          <a href={`${base}/uslugi/${service.slug}`}>
            <span class="pic"><Photo base={service.photo} alt="" sizes="(max-width: 700px) 100vw, 33vw" /></span>
            <span class="n">{String(i + 1).padStart(2, '0')}</span>
            <span class="name">{service.name}</span>
            <span class="short">{service.short}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section">
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
  .head { margin-bottom: 40px; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px 24px; }
  a { display: grid; gap: 8px; }
  .pic { aspect-ratio: 3 / 2; overflow: hidden; border-radius: 4px; margin-bottom: 8px; }
  .pic :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform .7s var(--ease); }
  a:hover .pic :global(img) { transform: scale(1.05); }
  .n { font-family: var(--display); font-size: 13px; color: var(--brass); }
  .name { font-family: var(--display); font-stretch: 88%; font-weight: 600; font-size: 22px; line-height: 1.15; }
  a:hover .name { color: var(--brass); }
  .short { color: var(--concrete); font-size: 15px; }
  .faq { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; }
  @media (max-width: 960px) { .grid { grid-template-columns: 1fr 1fr; } .faq { grid-template-columns: 1fr; } }
  @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
</style>
