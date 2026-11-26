<script>
  import { base } from '$app/paths'
  import PageHero from '$lib/site/PageHero.svelte'
  import ProjectCard from '$lib/site/ProjectCard.svelte'
  import Faq from '$lib/site/Faq.svelte'
  import { services, advantages, cardStyle } from '$lib/site/data.js'
  import { serviceFaq, processFaq } from '$lib/site/faq.js'
  import { Check, Send, Search, Wrench, KeyRound } from '@lucide/svelte'
  import { hexPoints } from '$lib/site/service-icons.js'
  import videos from '$lib/site/videos.json'
  import PhotoWall from '$lib/site/PhotoWall.svelte'

  let { data } = $props()
  let service = $derived(data.service)
  let others = $derived(services.filter(s => s.slug !== service.slug).slice(0, 6))
  let clip = $derived(videos.find(v => v.id === service.video))
  // The price depends on the motorcycle and parts, so the "calculator" lists what the master needs to estimate it.
  // How a single service job goes; the full nine-step process is on /process.
  const steps = [
    { title: 'Заявка', text: 'Присылаете фото мотоцикла и задачу: в Telegram, по телефону или через форму.' },
    { title: 'Осмотр и расчёт', text: 'Смотрим мотоцикл, предлагаем решения и называем стоимость и сроки до начала работ.' },
    { title: 'Работа', text: 'Делаем в мастерской, присылаем фото с процесса, изменения согласовываем заранее.' },
    { title: 'Проверка и выдача', text: 'Проверяем результат, передаём мотоцикл и даём гарантию на работу.' },
  ]
  // Advantages that matter for a single job: own parts, any make, warranty.
  const strengths = advantages.filter((_, i) => [0, 3, 4, 5].includes(i))
  let questions = $derived(serviceFaq[service.slug] ?? processFaq)
  const estimate = ['Марка, модель и год мотоцикла', 'Фото мотоцикла сейчас', 'Фото или пример желаемого результата', 'Детали и бренды, если уже выбраны']
</script>

<svelte:head>
  <title>{service.name} — Brobobber</title>
  <meta name="description" content={`${service.name}: ${service.short} Мастерская Brobobber, Москва.`} />
</svelte:head>

<PageHero title={service.name} lead={service.lead} photo={service.photo} alt={service.name}
  crumbs={[{ href: '/', label: 'Главная' }, { href: '/uslugi', label: 'Услуги' }]}>
  <div class="actions">
    <a class="btn btn-signal" href="#zayavka">Оставить заявку</a>
    {#if service.slug === 'kastomizaciya'}<a class="btn btn-line" href="{base}/konfigurator">Конфигуратор V-Rod</a>{/if}
  </div>
</PageHero>

<section class="section">
  <div class="wrap two">
    <h2 class="h2">Что входит</h2>
    <ul class="points">
      {#each service.points as point}<li><Check size={18} />{point}</li>{/each}
    </ul>
  </div>
</section>

{#if service.gallery?.length}
  <section class="section">
    <div class="wrap">
      <h2 class="h2 gallery-title">Из мастерской</h2>
      <PhotoWall photos={service.gallery} alt={service.name} />
    </div>
  </section>
{/if}

{#if clip}
  <section class="section">
    <div class="wrap two clip">
      <div class="clip-copy">
        <h2 class="h2">Как это делаем</h2>
        <p class="muted">{clip.title}. Ролик из нашего Telegram-канала.</p>
        <a class="link-steel" href={clip.post} target="_blank" rel="noopener">Открыть пост</a>
      </div>
      <!-- svelte-ignore a11y_media_has_caption -->
      <video class="clip-video" src={`${base + clip.src}#t=0.6`} controls playsinline preload="metadata"></video>
    </div>
  </section>
{/if}

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">Как работаем</h2>
      {#if service.slug === 'kastomizaciya'}<a class="link-steel" href="{base}/process">Все девять этапов кастома</a>{/if}
    </div>
    <ol class="steps">
      {#each steps as step, i}{@const Icon = [Send, Search, Wrench, KeyRound][i]}<li><span class="num" aria-hidden="true"><svg class="hex" viewBox="-12 -12 24 24"><polygon points={hexPoints} /></svg><Icon size={18} /></span><h3 class="h3">{step.title}</h3><p class="muted">{step.text}</p></li>{/each}
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap two">
    <h2 class="h2">Почему у нас</h2>
    <ul class="strengths">
      {#each strengths as item}<li><h3 class="h3">{item.title}</h3><p class="muted">{item.text}</p></li>{/each}
    </ul>
  </div>
</section>

{#if data.related.length}
  <section class="section">
    <div class="wrap">
      <div class="section-head"><h2 class="h2">Работы по этой услуге</h2><a class="link-steel" href="{base}/proekty">Все проекты</a></div>
      <ul class="justified fill">{#each data.related as project}<li style={cardStyle(project)}><ProjectCard {project} /></li>{/each}</ul>
    </div>
  </section>
{/if}

<section class="section">
  <div class="wrap two">
    <div class="estimate-copy">
      <h2 class="h2">Сколько стоит</h2>
      <p class="muted">Цена зависит от мотоцикла и деталей, поэтому мы считаем её под задачу. Пришлите мастеру четыре вещи — и он назовёт стоимость и сроки.</p>
    </div>
    <ol class="estimate">
      {#each estimate as item, i}<li><span>{i + 1}</span>{item}</li>{/each}
      <li class="cta"><a class="btn btn-signal" href="#zayavka">Отправить для расчёта</a></li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap two">
    <h2 class="h2">Вопросы</h2>
    <Faq items={questions} />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h3 others-title">Другие услуги</h2>
    <ul class="others">{#each others as item}<li><a href={`${base}/uslugi/${item.slug}`}>{item.name}</a></li>{/each}</ul>
  </div>
</section>

<style>
  .actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .two { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 40px; align-items: start; }
  .points { display: grid; gap: 4px; }
  .points li { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--rule); font-size: 18px; }
  .points :global(svg) { color: var(--steel); flex: none; margin-top: 4px; }
  .gallery-title { margin-bottom: 28px; }
  .clip { align-items: center; }
  .clip-copy { display: grid; gap: 16px; justify-items: start; }
  .clip-video { width: min(100%, 340px); aspect-ratio: 9 / 16; border-radius: 6px; background: var(--asphalt-2); object-fit: cover; }
  .estimate-copy { display: grid; gap: 16px; }
  .estimate { display: grid; gap: 10px; counter-reset: e; }
  .estimate li { display: flex; align-items: center; gap: 16px; padding: 16px 18px; background: var(--asphalt-2); border: 1px solid var(--rule); border-radius: 4px; font-size: 17px; }
  .estimate li span { font-family: var(--display); color: var(--steel); width: 20px; }
  .estimate .cta { background: none; border: 0; padding: 8px 0 0; }
  .steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; }
  .steps li, .strengths li { display: grid; gap: 10px; align-content: start; padding-top: 16px; border-top: 2px solid var(--rule); }
  .steps .num { position: relative; width: 44px; height: 44px; display: grid; place-items: center; color: var(--paper); }
  .steps .num .hex { position: absolute; inset: 0; width: 100%; height: 100%; }
  .steps .num polygon { fill: #1c1c1c; stroke: var(--signal); stroke-width: 1.2; stroke-linejoin: round; }
  .steps .num :global(svg.lucide) { position: relative; }
  .strengths { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 28px; }
  @media (max-width: 1000px) { .steps { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .steps, .strengths { grid-template-columns: 1fr; } }
  .others-title { margin-bottom: 16px; }
  .others { display: flex; flex-wrap: wrap; gap: 10px; }
  .others a { display: inline-block; padding: 9px 16px; border: 1px solid var(--rule); border-radius: 100px; color: var(--concrete); }
  .others a:hover { color: var(--paper); border-color: var(--concrete); }
  @media (max-width: 900px) { .two { grid-template-columns: 1fr; } }
</style>
