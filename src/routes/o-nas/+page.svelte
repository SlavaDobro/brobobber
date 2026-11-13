<script>
  import { base } from '$app/paths'
  import PageHero from '$lib/site/PageHero.svelte'
  import Photo from '$lib/site/Photo.svelte'
  import ProjectRail from '$lib/site/ProjectRail.svelte'
  import ProcessRoad from '$lib/site/ProcessRoad.svelte'
  import Reviews from '$lib/site/Reviews.svelte'
  import { advantages, projects, contacts } from '$lib/site/data.js'
</script>

<svelte:head>
  <title>О мастерской — Brobobber</title>
  <meta name="description" content="Brobobber — студия кастомайзинга мотоциклов в Москве. Техническое мастерство и стильный дизайн, 3D-моделирование и ЧПУ, гарантия год." />
</svelte:head>

<PageHero title="Студия кастомайзинга мотоциклов" lead="Brobobber объединяет техническое мастерство и стильный дизайн, создавая проекты для тех, кто живёт скоростью и свободой." photo="/images/photos/home/11" alt="Мастерская Brobobber изнутри" crumbs={[{ href: '/', label: 'Главная' }]} />

<section class="section">
  <div class="wrap duo">
    <div class="pic"><Photo base="/images/photos/home/24" alt="Мастера Brobobber" sizes="(max-width: 900px) 100vw, 40vw" /></div>
    <div class="copy">
      <h2 class="h2">Кто в мастерской</h2>
      <p class="lead">Проекты ведут мастера ателье {contacts.phones.map(p => p.name).join(' и ')}. С ними вы обсуждаете идею, смету и сроки — и к ним же приезжаете на обслуживание.</p>
      <ul class="people">
        {#each contacts.phones as person}
          <li><strong>{person.name}</strong><a href={person.href}>{person.phone}</a><a class="link-brass" href={`https://t.me/${person.telegram}`} target="_blank" rel="noopener">Написать в Telegram</a></li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Почему к нам едут</h2>
    <ol class="usp">
      {#each advantages as item, i}
        <li><span class="n">{String(i + 1).padStart(2, '0')}</span><h3 class="h3">{item.title}</h3><p class="muted">{item.text}</p></li>
      {/each}
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap duo reverse">
    <div class="pic"><Photo base="/images/photos/home/26" alt="Гравированная накладка на бак" sizes="(max-width: 900px) 100vw, 40vw" /></div>
    <div class="copy">
      <h2 class="h2">Наша философия</h2>
      <p class="lead">Мотоцикл — отражение характера владельца. Поэтому мы не тиражируем решения: каждую деталь подбираем, проектируем или делаем под конкретный байк.</p>
      <p class="muted">Работаем с Harley-Davidson, Triumph, Yamaha, Suzuki, BMW и другими марками. Можно привезти свой мотоцикл или собрать проект с нуля — поможем подобрать донора.</p>
    </div>
  </div>
</section>

<ProjectRail {projects}>
  <div class="section-head"><h2 class="h2">Что мы построили</h2><a class="link-brass" href="{base}/proekty">Все проекты</a></div>
</ProjectRail>

<section class="section">
  <div class="wrap">
    <h2 class="h2 head">Процесс создания кастома</h2>
    <ProcessRoad compact />
  </div>
</section>

<section class="section">
  <div class="wrap"><h2 class="h2 head">Отзывы</h2><Reviews /></div>
</section>

<style>
  .duo { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(28px, 6vw, 96px); align-items: center; }
  .duo.reverse .pic { order: 2; }
  .pic { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 4px; }
  .pic :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .copy { display: grid; gap: 22px; }
  .people { display: grid; gap: 14px; }
  .people li { display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: baseline; padding: 14px 0; border-top: 1px solid var(--rule); }
  .people strong { font-family: var(--display); font-stretch: 88%; font-size: 22px; min-width: 110px; }
  .head { margin-bottom: 40px; }
  .usp { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; }
  .usp li { display: grid; gap: 12px; align-content: start; padding-top: 20px; border-top: 2px solid var(--brass); }
  .n { font-family: var(--display); color: var(--brass); }
  @media (max-width: 900px) { .duo { grid-template-columns: 1fr; } .duo.reverse .pic { order: 0; } .usp { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .usp { grid-template-columns: 1fr; } }
</style>
