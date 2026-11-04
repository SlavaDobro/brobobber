<script>
  import { onMount } from 'svelte'
  import { ArrowUpRight, ArrowRight, Check, Asterisk, X, Copy, Download, RotateCcw, Bookmark, Info, ChevronDown, Plus, Minus, ImageDown } from '@lucide/svelte'
  import BikeViewer from './lib/BikeViewer.svelte'
  import BikePreview from './lib/BikePreview.svelte'
  import {
    paints, leathers, wheels, exhausts, accessories, categories, defaults, storageKey, basePrice,
    pick, readConfiguration, configurationUrl, lineItems, totalPrice, selectedLayers, buildNumber, money, downloadFile,
  } from './lib/configurator'

  let configuration = $state(readConfiguration())
  let openCategory = $state('paint')
  let view = $state(0)
  let environment = $state('studio')
  let notice = $state('')
  let initialized = $state(false)
  /** @type {HTMLDialogElement} */
  let summaryDialog
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let noticeTimeout

  let paint = $derived(pick(paints, configuration.paint))
  let leather = $derived(pick(leathers, configuration.leather))
  let rim = $derived(pick(wheels, configuration.wheels))
  let exhaust = $derived(pick(exhausts, configuration.exhaust))
  let parts = $derived(selectedLayers(configuration))
  let items = $derived(lineItems(configuration))
  let total = $derived(totalPrice(configuration))
  let upgrades = $derived(items.filter(line => line.item.price > 0).length)
  let orderNumber = $derived(buildNumber(configuration))
  let materials = $derived({
    paint: { hex: paint.hex, finish: paint.finish },
    leather: { hex: leather.hex },
    wheels: { hex: rim.hex, finish: rim.finish },
  })
  let buildName = $derived(({ graphite: 'Dark Matter', copper: 'Copperline', oxide: 'Red Oxide', pearl: 'Silver Ghost', olive: 'Field Ops', stealth: 'Night Shift' })[paint.id] || 'Deep Current')
  /** @type {Record<string, string>} */
  let current = $derived({
    paint: paint.name,
    leather: leather.name,
    wheels: rim.name,
    exhaust: exhaust.name,
    accessories: configuration.accessories.length ? configuration.accessories.length + ' выбрано' : 'Нет',
  })
  let specification = $derived([
    'BROBOBBER — наряд-заказ № ' + orderNumber,
    'V-Rod / ' + buildName + ' — визуальная концепция кастомизации',
    '',
    ...items.map(line => line.category + ' — ' + line.item.name + (line.item.price ? ' (+' + money(line.item.price) + ')' : '')),
    '',
    'Базовые работы — ' + money(basePrice),
    'Ориентир кастомизации — ' + money(total),
    'Цены примерные. Стоимость мотоцикла не включена.',
    'Совместимость, стоимость и сроки подтверждает мастерская.',
    '',
    configurationUrl(configuration),
  ].join('\n'))

  const exhaustCrop = [150, 520, 820, 300]
  const cowlCrop = [1010, 150, 300, 300]

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
    const selected = $state.snapshot(configuration)
    try { localStorage.setItem(storageKey, JSON.stringify(selected)) } catch { /* The URL keeps the selection when storage is unavailable. */ }
    history.replaceState(null, '', configurationUrl(selected))
  })

  /** @param {string} message */
  function announce(message) {
    notice = message
    clearTimeout(noticeTimeout)
    noticeTimeout = setTimeout(() => notice = '', 4000)
  }

  /** @param {string} id */
  function toggleAccessory(id) {
    const list = configuration.accessories
    configuration.accessories = list.includes(id) ? list.filter(item => item !== id) : [...list, id]
  }

  /** Shows the camera where an exhaust change is clearest. */
  function showExhaust() {
    if (view === 3) view = 0
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

  /** @param {Blob} blob */
  function saveSnapshot(blob) {
    downloadFile('brobobber-vrod-' + buildName.toLowerCase().replace(/\s+/g, '-') + '.png', blob)
    announce('Изображение сборки сохранено')
  }

  function reset() {
    configuration = { ...defaults, accessories: [] }
    view = 0
    announce('Возвращена исходная сборка')
  }
</script>

<svelte:head>
  <title>V-Rod — собери свой характер | BROBOBBER</title>
  <meta name="description" content="Конфигуратор Brobobber: цвет кузова, кожа, диски, выхлоп и аксессуары для V-Rod. Шесть ракурсов, три окружения, точная цена сборки." />
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
      <div class="breadcrumb"><span>Кастом-ателье, Москва</span><span class="breadcrumb-slash">/</span><span>Конфигуратор</span></div>
      <h1 id="page-title">ТВОЙ ХАРАКТЕР. <span>ТВОЙ <span class="model-word">V-ROD.</span></span></h1>
    </div>
    <div class="intro-aside"><span class="concept-tag"><span></span>Визуальная концепция</span><p>Пять шагов, шесть ракурсов.<br />Детали обсудим в мастерской.</p></div>
  </section>

  <div class="workspace">
    <section class="showroom" aria-label="Визуализация мотоцикла">
      <BikeViewer paint={materials.paint} leather={materials.leather} wheels={materials.wheels} {parts} {buildName} bind:view bind:environment onsnapshot={saveSnapshot} />
    </section>

    <aside class="configuration-panel" id="configuration" aria-label="Настройки мотоцикла">
      <div class="panel-heading">
        <div><p>Harley-Davidson</p><h2>V-Rod <span>Custom</span></h2></div>
        <button class="reset-button" onclick={reset} aria-label="Вернуть исходную сборку" title="Исходная сборка"><RotateCcw size={16} /></button>
      </div>
      <div class="build-label"><span class="build-label-dot"></span>{buildName}<span class="build-label-caption">Ваша сборка</span></div>

      <ol class="steps">
        {#each categories as category, index}
          {@const open = openCategory === category.id}
          <li class="step" class:open>
            <h3>
              <button class="step-toggle" aria-expanded={open} aria-controls={'step-' + category.id} onclick={() => openCategory = open ? '' : category.id}>
                <span class="step-number">{String(index + 1).padStart(2, '0')}</span>
                <span class="step-name">{category.title}</span>
                <span class="step-value">{current[category.id]}</span>
                <ChevronDown size={16} class="step-chevron" />
              </button>
            </h3>
            {#if open}
              <div class="step-body" id={'step-' + category.id}>
                {#if category.id === 'paint' || category.id === 'leather' || category.id === 'wheels'}
                  {@const list = category.id === 'paint' ? paints : category.id === 'leather' ? leathers : wheels}
                  {@const chosen = category.id === 'paint' ? paint : category.id === 'leather' ? leather : rim}
                  <div class="swatch-grid" class:leather={category.id === 'leather'} class:rims={category.id === 'wheels'}>
                    {#each list as option}
                      {@const selected = chosen.id === option.id}
                      <button class="swatch-option" class:selected aria-pressed={selected} onclick={() => { /** @type {any} */ (configuration)[category.id] = option.id }}>
                        <span class="swatch" style={'--swatch:' + option.swatch}>{#if selected}<Check size={17} strokeWidth={2.2} />{/if}</span>
                        <span class="swatch-name">{option.name}</span>
                        <span class="option-price">{option.price ? '+ ' + money(option.price) : 'Как на фото'}</span>
                      </button>
                    {/each}
                  </div>
                  <div class="material-note"><span class="material-sample" style={'--swatch:' + chosen.swatch}></span><div><strong>{chosen.name}</strong><p>{chosen.description}</p></div></div>
                {:else if category.id === 'exhaust'}
                  <div class="part-options">
                    {#each exhausts as option}
                      {@const selected = configuration.exhaust === option.id}
                      <button class="part-option" class:selected aria-pressed={selected} onclick={() => { configuration.exhaust = option.id; showExhaust() }}>
                        <BikePreview parts={option.layer ? [option.layer] : []} crop={exhaustCrop} {...materials} />
                        <span class="part-text"><strong>{option.name}</strong><span>{option.description}</span><small>{option.price ? '+ ' + money(option.price) : 'Как на фото'}</small></span>
                        <span class="selection-check">{#if selected}<Check size={14} />{/if}</span>
                      </button>
                    {/each}
                  </div>
                {:else}
                  <div class="part-options">
                    {#each accessories as option}
                      {@const selected = configuration.accessories.includes(option.id)}
                      <div class="part-option accessory" class:selected>
                        <BikePreview parts={[option.layer]} crop={cowlCrop} {...materials} />
                        <span class="part-text"><strong>{option.name}</strong><span>{option.description}</span><small>+ {money(option.price)}</small></span>
                        <button class="add-button" aria-pressed={selected} onclick={() => toggleAccessory(option.id)}>
                          {#if selected}<Minus size={15} />Убрать{:else}<Plus size={15} />Добавить{/if}
                        </button>
                      </div>
                    {/each}
                    <p class="option-help">Новые аксессуары появятся по мере съёмки деталей в студии.</p>
                  </div>
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ol>

      <div class="panel-bottom">
        <div class="price-row">
          <div><p>Ориентир кастомизации</p><strong aria-live="polite">{money(total)}</strong></div>
          <span class="options-count">{upgrades ? '+' + upgrades + ' к основе' : 'Базовая сборка'}</span>
        </div>
        <p class="price-disclaimer">Демо-цены, без стоимости мотоцикла. Точную смету подготовит мастерская.</p>
        <button class="primary-button" onclick={() => summaryDialog.showModal()}>Моя сборка <ArrowRight size={20} /></button>
        <button class="save-button" onclick={saveSpecification}><Bookmark size={16} />Сохранить спецификацию</button>
      </div>
    </aside>
  </div>

  <section class="studio-note">
    <div class="studio-note-title"><Asterisk class="small-star" size={33} aria-hidden="true" /><h2>Из идеи — в металл.</h2></div>
    <p>Каждая деталь на картинке — это правка одной и той же студийной фотографии, поэтому всё стоит на своих местах с любого ракурса. Соберите идею, а мастерская подтвердит совместимость и сроки.</p>
    <button onclick={() => summaryDialog.showModal()}>Посмотреть сборку <ArrowRight size={19} /></button>
  </section>
</main>

<footer class="site-footer"><span>© {new Date().getFullYear()} BROBOBBER</span><span><Info size={13} />Изображения — сгенерированная визуальная концепция V-Rod</span><a href="#page-top">Наверх <ArrowUpRight size={12} /></a></footer>

<dialog bind:this={summaryDialog} class="summary-dialog" aria-labelledby="summary-title">
  <div class="dialog-heading"><span class="wordmark">BROBOBBER<span class="wordmark-dot"></span></span><button class="icon-button" aria-label="Закрыть сборку" onclick={() => summaryDialog.close()}><X size={21} /></button></div>
  <div class="work-order">
    <div class="order-head">
      <div><p class="dialog-eyebrow">Наряд-заказ · Harley-Davidson V-Rod</p><h2 id="summary-title">{buildName}</h2></div>
      <div class="order-number"><span>№</span>{orderNumber}</div>
    </div>
    <span class="order-stamp" aria-hidden="true">Эскиз</span>
    <ol class="order-lines">
      {#each items as line, index}
        <li>
          <span class="order-index">{String(index + 1).padStart(2, '0')}</span>
          <span class="order-item"><small>{line.category}</small>{#if 'swatch' in line.item}<span class="mini-swatch" style={'background:' + line.item.swatch}></span>{/if}{line.item.name}</span>
          <span class="order-leader" aria-hidden="true"></span>
          <span class="order-price">{line.item.price ? money(line.item.price) : 'в основе'}</span>
        </li>
      {/each}
      <li class="order-base">
        <span class="order-index">—</span><span class="order-item">Базовые работы мастерской</span><span class="order-leader" aria-hidden="true"></span><span class="order-price">{money(basePrice)}</span>
      </li>
    </ol>
    <div class="order-total"><span>Ориентир работ</span><strong>{money(total)}</strong></div>
  </div>
  <p class="dialog-disclaimer">Демонстрационная оценка. Мотоцикл не включён. Совместимость деталей, стоимость и сроки подтвердит мастерская.</p>
  <button class="primary-button" onclick={saveSpecification}>Скачать спецификацию <Download size={19} /></button>
  <div class="dialog-actions">
    <button onclick={copyLink}><Copy size={16} />Скопировать ссылку</button>
    <button onclick={() => { summaryDialog.close(); announce('Нажмите на камеру над мотоциклом, чтобы сохранить картинку') }}><ImageDown size={16} />Картинка сборки</button>
    <button onclick={() => summaryDialog.close()}>Продолжить</button>
  </div>
  <p class="dialog-notice" role="status">{notice}</p>
</dialog>

<div class="toast-region" role="status" aria-live="polite">{#if notice}<div class="toast"><Check size={16} />{notice}</div>{/if}</div>
