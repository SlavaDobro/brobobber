<script>
  import { onMount } from 'svelte'
  import { ArrowUpRight, ArrowRight, Check, Asterisk, X, Copy, Download, RotateCcw, SlidersHorizontal, Bookmark, Info } from '@lucide/svelte'
  import BikeViewer from './lib/BikeViewer.svelte'
  import { paints, seats, exhausts, defaults, storageKey, readConfiguration, configurationUrl, money, downloadFile } from './lib/configurator'

  let configuration = $state(readConfiguration())
  let activeTab = $state('paint')
  let view = $state(0)
  let notice = $state('')
  let initialized = $state(false)
  /** @type {HTMLDialogElement} */
  let summaryDialog
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let noticeTimeout

  const tabs = [{ id: 'paint', name: 'Цвет' }, { id: 'seat', name: 'Сиденье' }, { id: 'exhaust', name: 'Выхлоп' }]
  const basePrice = 149000
  let paint = $derived(paints.find(item => item.id === configuration.paint) || paints[0])
  let seat = $derived(seats.find(item => item.id === configuration.seat) || seats[0])
  let exhaust = $derived(exhausts.find(item => item.id === configuration.exhaust) || exhausts[0])
  let total = $derived(basePrice + paint.price + seat.price + exhaust.price)
  let optionCount = $derived(Object.entries(configuration).filter(([key, value]) => value !== defaults[key]).length)
  let buildName = $derived(paint.id === 'copper' ? 'Copperline' : paint.id === 'pearl' ? 'Silver Ghost' : paint.id === 'petrol' ? 'Deep Current' : 'Dark Matter')
  let specification = $derived([
    'BROBOBBER — V-Rod / ' + buildName,
    'Визуальная концепция кастомизации',
    '',
    'Цвет — ' + paint.name,
    'Сиденье — ' + seat.name,
    'Выхлоп — ' + exhaust.name,
    '',
    'Демонстрационная оценка работ — ' + money(total),
    'Цены примерные. Стоимость мотоцикла не включена.',
    'Комплектацию, совместимость, стоимость и сроки подтверждает мастерская.',
    '',
    configurationUrl(configuration),
  ].join('\n'))

  onMount(() => {
    initialized = true
    const restore = () => { configuration = readConfiguration() }
    window.addEventListener('popstate', restore)
    return () => {
      window.removeEventListener('popstate', restore)
      clearTimeout(noticeTimeout)
    }
  })

  $effect(() => {
    if (!initialized) return
    const selected = { ...configuration }
    try { localStorage.setItem(storageKey, JSON.stringify(selected)) } catch { /* The URL retains the selection when storage is unavailable. */ }
    history.replaceState(null, '', configurationUrl(selected))
  })

  /** @param {string} message */
  function announce(message) {
    notice = message
    clearTimeout(noticeTimeout)
    noticeTimeout = setTimeout(() => notice = '', 4000)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(configurationUrl(configuration))
      announce('Ссылка на вашу сборку скопирована')
    } catch {
      announce('Не удалось скопировать. Ссылка доступна в адресной строке.')
    }
  }

  function saveSpecification() {
    downloadFile('brobobber-vrod-' + paint.id + '.txt', new Blob([specification], { type: 'text/plain;charset=utf-8' }))
    announce('Спецификация сохранена')
  }

  function reset() {
    configuration = { ...defaults }
    view = 0
    announce('Возвращена исходная сборка')
  }
</script>

<svelte:head>
  <title>V-Rod — собери свой характер | BROBOBBER</title>
  <meta name="description" content="Визуальная студия Brobobber. Настрой цвет, сиденье и выхлоп V-Rod, посмотри сборку с четырёх сторон и сохрани свою идею." />
</svelte:head>

<a class="skip-link" href="#configuration">Перейти к настройкам</a>

<header class="site-header" id="page-top">
  <a class="wordmark" href="#page-top" aria-label="Brobobber — в начало конфигуратора">BROBOBBER<span class="wordmark-dot"></span></a>
  <nav aria-label="Основная навигация">
    <a class="current" href="#configuration" aria-current="page">Конфигуратор V-Rod</a>
  </nav>
  <button class="header-contact" onclick={() => summaryDialog.showModal()}>Моя сборка <ArrowRight size={17} /></button>
</header>

<main>
  <section class="intro" aria-labelledby="page-title">
    <div class="intro-copy">
      <div class="breadcrumb"><span>Кастом-ателье, Москва</span><span class="breadcrumb-slash">/</span><span>Визуальная студия</span></div>
      <h1 id="page-title">ТВОЙ ХАРАКТЕР. <span>ТВОЙ <span class="model-word">V-ROD.</span></span></h1>
    </div>
    <div class="intro-aside"><span class="concept-tag"><span></span>Концепт конфигуратора</span><p>Собери идею своего мотоцикла.<br />О деталях позаботимся вместе.</p></div>
  </section>

  <div class="workspace">
    <section class="showroom" aria-label="Визуализация мотоцикла">
      <BikeViewer paint={paint.hex} seat={seat.hex} source={exhaust.image} bind:view />
      <div class="bike-specs">
        <div><strong>1 130 <span>см³</span></strong><span>V-twin Revolution</span></div>
        <div><strong>115 <span>л. с.</span></strong><span>Характер в основе</span></div>
        <div><strong>300 <span>мм</span></strong><span>Заднее колесо проекта</span></div>
      </div>
    </section>

    <aside class="configuration-panel" id="configuration" aria-label="Настройки мотоцикла">
      <div class="panel-heading"><div><p>Harley-Davidson</p><h2>V-Rod <span>Custom</span></h2></div><SlidersHorizontal size={22} strokeWidth={1.5} /></div>
      <div class="build-label"><span class="build-label-dot"></span>{buildName}<span class="build-label-caption">Ваша сборка</span></div>
      <div class="config-tabs" aria-label="Категории настроек">
        {#each tabs as tab}
          <button class:active={activeTab === tab.id} aria-pressed={activeTab === tab.id} onclick={() => activeTab = tab.id}>{tab.name}</button>
        {/each}
      </div>

      <div class="options-panel">
        {#if activeTab === 'paint'}
          <div class="option-heading"><h3>Цвет кузова</h3><span>01 / 03</span></div>
          <p class="option-help">Найди свой оттенок. Посмотри, как он раскрывается с разных сторон.</p>
          <div class="paint-grid">
            {#each paints as option}
              <button class="paint-option" class:selected={configuration.paint === option.id} aria-pressed={configuration.paint === option.id} onclick={() => configuration.paint = option.id}>
                <span class="paint-chip" style={'--swatch:' + option.hex}>{#if configuration.paint === option.id}<Check size={19} strokeWidth={2} />{/if}</span>
                <span class="paint-name">{option.name}</span>
                <span class="option-price">{option.price ? '+ ' + money(option.price) : 'В основе'}</span>
              </button>
            {/each}
          </div>
          <div class="material-note"><span class="material-sample" style={'--swatch:' + paint.hex}></span><div><strong>{paint.name}</strong><p>{paint.description}</p></div></div>
        {:else if activeTab === 'seat'}
          <div class="option-heading"><h3>Отделка сиденья</h3><span>02 / 03</span></div>
          <p class="option-help">Фактура, которую чувствуешь. Цвет, который меняет всю сборку.</p>
          <div class="detail-options">
            {#each seats as option}
              <button class="detail-option" class:selected={configuration.seat === option.id} aria-pressed={configuration.seat === option.id} onclick={() => configuration.seat = option.id}>
                <span class="leather-sample" style={'--swatch:' + option.hex}></span>
                <span class="detail-text"><strong>{option.name}</strong><span>{option.description}</span><small>{option.price ? '+ ' + money(option.price) : 'В основе'}</small></span>
                <span class="selection-check">{#if configuration.seat === option.id}<Check size={15} />{/if}</span>
              </button>
            {/each}
          </div>
        {:else}
          <div class="option-heading"><h3>Линия выхлопа</h3><span>03 / 03</span></div>
          <p class="option-help">Длинный силуэт или короткий акцент. Выбирай и смотри справа.</p>
          <div class="detail-options">
            {#each exhausts as option}
              <button class="detail-option exhaust-option" class:selected={configuration.exhaust === option.id} aria-pressed={configuration.exhaust === option.id} onclick={() => { configuration.exhaust = option.id; view = 0 }}>
                <span class="exhaust-preview" style={'background-image:url(' + option.image + ')'}></span>
                <span class="detail-text"><strong>{option.name}</strong><span>{option.description}</span><small>{option.price ? '+ ' + money(option.price) : 'В основе'}</small></span>
                <span class="selection-check">{#if configuration.exhaust === option.id}<Check size={15} />{/if}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="panel-bottom">
        <div class="selection-summary"><span>{paint.name} / {seat.id === 'black' ? 'Чёрная кожа' : 'Коньячная кожа'} / {exhaust.name}</span><button class="reset-button" onclick={reset} aria-label="Сбросить настройки"><RotateCcw size={15} /></button></div>
        <div class="price-row"><div><p>Ориентир кастомизации</p><strong aria-live="polite">{money(total)}</strong></div><span class="options-count">{optionCount ? '+' + optionCount + ' к основе' : 'Базовая сборка'}</span></div>
        <p class="price-disclaimer">Демо-цены, без стоимости мотоцикла.<br />Точную смету подготовит мастерская.</p>
        <button class="primary-button" onclick={() => summaryDialog.showModal()}>Моя сборка <ArrowRight size={20} /></button>
        <button class="save-button" onclick={saveSpecification}><Bookmark size={16} />Сохранить спецификацию</button>
      </div>
    </aside>
  </div>

  <section class="studio-note">
    <div class="studio-note-title"><Asterisk class="small-star" size={33} aria-hidden="true" /><h2>Из идеи — в металл.</h2></div>
    <p>Это первый эскиз твоего кастома. Выбери детали, рассмотри мотоцикл с разных сторон и сохрани свою сборку.</p>
    <button onclick={() => summaryDialog.showModal()}>Посмотреть сборку <ArrowRight size={19} /></button>
  </section>
</main>

<footer class="site-footer"><span>© {new Date().getFullYear()} BROBOBBER</span><span><Info size={13} />Изображения — сгенерированная визуальная концепция V-Rod</span><a href="#page-top">Наверх <ArrowUpRight size={12} /></a></footer>

<dialog bind:this={summaryDialog} class="summary-dialog" aria-labelledby="summary-title">
  <div class="dialog-heading"><span class="wordmark">BROBOBBER<span class="wordmark-dot"></span></span><button class="icon-button" aria-label="Закрыть сборку" onclick={() => summaryDialog.close()}><X size={21} /></button></div>
  <p class="dialog-eyebrow">Harley-Davidson V-Rod</p>
  <h2 id="summary-title">{buildName}</h2>
  <p class="dialog-intro">Твоя идея — в одной сборке. Сохрани выбранные детали или скопируй ссылку.</p>
  <dl class="specification-list">
    <div><dt>Цвет кузова</dt><dd><span class="mini-swatch" style={'background:' + paint.hex}></span>{paint.name}</dd></div>
    <div><dt>Сиденье</dt><dd>{seat.name}</dd></div>
    <div><dt>Выхлоп</dt><dd>{exhaust.name}</dd></div>
    <div class="specification-total"><dt>Ориентир работ</dt><dd>{money(total)}</dd></div>
  </dl>
  <p class="dialog-disclaimer">Демонстрационная оценка. Мотоцикл не включён. Совместимость деталей, стоимость и сроки подтвердит мастерская.</p>
  <button class="primary-button" onclick={saveSpecification}>Скачать спецификацию <Download size={19} /></button>
  <div class="dialog-actions"><button onclick={copyLink}><Copy size={16} />Скопировать ссылку</button><button onclick={() => summaryDialog.close()}>Продолжить настройку</button></div>
  <p class="dialog-notice" role="status">{notice}</p>
</dialog>

<div class="toast-region" role="status" aria-live="polite">{#if notice}<div class="toast"><Check size={16} />{notice}</div>{/if}</div>
