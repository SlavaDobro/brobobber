<script>
  import { onMount } from 'svelte'
  import { Check, X, Copy, Download, RotateCcw, Plus, Minus, ChevronLeft, ChevronRight, ClipboardList } from '@lucide/svelte'
  import BikeViewer from './lib/BikeViewer.svelte'
  import BikePreview from './lib/BikePreview.svelte'
  import {
    paints, leathers, rims, wheels, exhausts, accessories, categories, defaults, storageKey, basePrice,
    pick, readConfiguration, configurationUrl, lineItems, totalPrice, selectedLayers, buildNumber, money, downloadFile,
  } from './lib/configurator'

  let configuration = $state(readConfiguration())
  let step = $state(0)
  let view = $state(0)
  let environment = $state('studio')
  let notice = $state('')
  let initialized = $state(false)
  /** @type {HTMLDialogElement} */
  let orderDialog
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let noticeTimeout

  let paint = $derived(pick(paints, configuration.paint))
  let leather = $derived(pick(leathers, configuration.leather))
  let rim = $derived(pick(rims, configuration.rims))
  let rimColor = $derived(pick(wheels, configuration.wheels))
  let exhaust = $derived(pick(exhausts, configuration.exhaust))
  let parts = $derived(selectedLayers(configuration))
  let items = $derived(lineItems(configuration))
  let total = $derived(totalPrice(configuration))
  let orderNumber = $derived(buildNumber(configuration))
  let category = $derived(categories[step])
  let materials = $derived({
    paint: { hex: paint.hex, finish: paint.finish },
    leather: { hex: leather.hex },
    wheels: { hex: rimColor.hex, finish: rimColor.finish },
  })
  let buildName = $derived(({ graphite: 'Dark Matter', copper: 'Copperline', oxide: 'Red Oxide', pearl: 'Silver Ghost', olive: 'Field Ops', stealth: 'Night Shift' })[paint.id] || 'Deep Current')
  /** @type {Record<string, string>} */
  let current = $derived({
    paint: paint.name,
    leather: leather.name,
    wheels: rim.name + ', ' + rimColor.name.toLowerCase(),
    exhaust: exhaust.name,
    accessories: configuration.accessories.length ? accessories.filter(item => configuration.accessories.includes(item.id)).map(item => item.name).join(', ') : 'Без аксессуаров',
  })
  let specification = $derived([
    'Brobobber — наряд-заказ № ' + orderNumber,
    'V-Rod ' + buildName + ', визуальная концепция кастомизации',
    '',
    ...items.map(line => line.category + ': ' + line.item.name + (line.item.price ? ' (+' + money(line.item.price) + ')' : '')),
    '',
    'Базовые работы: ' + money(basePrice),
    'Ориентир кастомизации: ' + money(total),
    'Цены примерные. Стоимость мотоцикла не включена.',
    'Совместимость, стоимость и сроки подтверждает мастерская.',
    '',
    configurationUrl(configuration),
  ].join('\n'))

  // Close-ups for part cards, in base-photo pixels of the right profile.
  const exhaustCrop = [150, 520, 820, 300]
  const wheelCrop = [1050, 400, 470, 470]
  const cowlCrop = [1010, 150, 300, 300]

  const stories = [
    { image: '/images/story/sketch.webp', title: 'Эскиз', text: 'Берём вашу сборку из конфигуратора и сверяем цвета на образцах металла.' },
    { image: '/images/story/paint.webp', title: 'Покраска и детали', text: 'Красим в камере, ставим выбранные выхлоп, диски и кожу.' },
    { image: '/images/story/delivery.webp', title: 'Выдача', text: 'Проверяем мотоцикл на ходу и передаём вам в мастерской.' },
  ]

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
    try { localStorage.setItem(storageKey, JSON.stringify(selected)) } catch { /* The address bar keeps the selection when storage is unavailable. */ }
    history.replaceState(null, '', configurationUrl(selected))
  })

  /** @param {string} message */
  function announce(message) {
    notice = message
    clearTimeout(noticeTimeout)
    noticeTimeout = setTimeout(() => notice = '', 4000)
  }

  /** Shows a camera where the chosen part is visible. @param {string} id */
  function goToStep(id) {
    step = categories.findIndex(item => item.id === id)
    if (id === 'exhaust' && view === 3) view = 0
    if (id === 'wheels' && (view === 2 || view === 4)) view = 0
    if (id === 'leather' && view === 2) view = 0
  }

  /** @param {string} id */
  function toggleAccessory(id) {
    const list = configuration.accessories
    configuration.accessories = list.includes(id) ? list.filter(item => item !== id) : [...list, id]
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(configurationUrl(configuration))
      announce('Ссылка на сборку скопирована')
    } catch {
      announce('Не получилось скопировать. Ссылка есть в адресной строке.')
    }
  }

  function saveSpecification() {
    downloadFile('brobobber-' + orderNumber.toLowerCase() + '.txt', new Blob([specification], { type: 'text/plain;charset=utf-8' }))
    announce('Наряд-заказ скачан')
  }

  /** @param {Blob} blob */
  function saveSnapshot(blob) {
    downloadFile('brobobber-' + orderNumber.toLowerCase() + '.png', blob)
    announce('Картинка сборки скачана')
  }

  function reset() {
    configuration = { ...defaults, accessories: [] }
    view = 0
    step = 0
    announce('Сборка снова как на фото')
  }
</script>

<svelte:head>
  <title>Соберите свой V-Rod — Brobobber</title>
  <meta name="description" content="Конфигуратор кастом-ателье Brobobber: цвет кузова, кожа, форма и цвет дисков, выхлоп и аксессуары для Harley-Davidson V-Rod. Шесть ракурсов на поворотном стенде и наряд-заказ с ценой." />
</svelte:head>

<a class="skip-link" href="#options">К выбору деталей</a>

<header class="topbar">
  <a class="wordmark" href="#top" id="top" aria-label="Brobobber, к началу страницы">Brobobber</a>
  <p class="topbar-model">Harley-Davidson V-Rod, кастом-ателье в Москве</p>
  <div class="topbar-order">
    <span class="topbar-total"><small>Сборка {orderNumber}</small><strong aria-live="polite">{money(total)}</strong></span>
    <button class="order-button" onclick={() => orderDialog.showModal()}><ClipboardList size={18} />Наряд-заказ</button>
  </div>
</header>

<main>
  <section class="workshop" aria-labelledby="page-title">
    <nav class="rail" aria-label="Шаги сборки">
      <h1 id="page-title">Соберите свой V-Rod</h1>
      <ol class="rail-steps">
        {#each categories as item, index}
          <li>
            <button class="rail-step" class:active={step === index} aria-current={step === index ? 'step' : undefined} onclick={() => goToStep(item.id)}>
              <span class="rail-number">{index + 1}</span>
              <span class="rail-text"><strong>{item.name}</strong><span>{current[item.id]}</span></span>
            </button>
          </li>
        {/each}
      </ol>
      <button class="rail-reset" onclick={reset}><RotateCcw size={15} />Вернуть как на фото</button>
    </nav>

    <div class="stage-column">
      <span class="tape build-tag">{buildName}</span>
      <BikeViewer paint={materials.paint} leather={materials.leather} wheels={materials.wheels} {parts} {buildName} bind:view bind:environment onsnapshot={saveSnapshot} />
    </div>

    <section class="drawer" id="options" aria-labelledby="drawer-title">
      <header class="drawer-head">
        <p class="drawer-step">Шаг {step + 1} из {categories.length}</p>
        <h2 id="drawer-title">{category.title}</h2>
        <p class="drawer-hint">{category.hint}</p>
      </header>

      <div class="drawer-body">
        {#if category.id === 'paint' || category.id === 'leather'}
          {@const list = category.id === 'paint' ? paints : leathers}
          {@const chosen = category.id === 'paint' ? paint : leather}
          <div class="swatches" class:leather={category.id === 'leather'} role="radiogroup" aria-label={category.title}>
            {#each list as option}
              {@const selected = chosen.id === option.id}
              <button class="swatch-option" class:selected role="radio" aria-checked={selected} onclick={() => { /** @type {any} */ (configuration)[category.id] = option.id }}>
                <span class="chip" style={'--swatch:' + option.swatch}>{#if selected}<Check size={16} strokeWidth={2.4} />{/if}</span>
                <span class="swatch-name">{option.name}</span>
                <span class="swatch-price">{option.price ? '+' + money(option.price) : 'как на фото'}</span>
              </button>
            {/each}
          </div>
          <p class="choice-note"><strong>{chosen.name}.</strong> {chosen.description}</p>
        {:else if category.id === 'wheels'}
          <h3 class="group-title">Форма</h3>
          <div class="cards two" role="radiogroup" aria-label="Форма дисков">
            {#each rims as option}
              {@const selected = configuration.rims === option.id}
              <button class="card" class:selected role="radio" aria-checked={selected} onclick={() => { configuration.rims = option.id; if (view === 2 || view === 4) view = 0 }}>
                <BikePreview parts={option.layer ? [option.layer] : []} crop={wheelCrop} {...materials} />
                <span class="card-name">{option.name}</span>
                <span class="card-price">{option.price ? '+' + money(option.price) : 'как на фото'}</span>
              </button>
            {/each}
          </div>
          <p class="choice-note"><strong>{rim.name}.</strong> {rim.description}</p>
          <h3 class="group-title">Цвет</h3>
          <div class="swatches rims" role="radiogroup" aria-label="Цвет дисков">
            {#each wheels as option}
              {@const selected = configuration.wheels === option.id}
              <button class="swatch-option" class:selected role="radio" aria-checked={selected} onclick={() => configuration.wheels = option.id}>
                <span class="chip" style={'--swatch:' + option.swatch}>{#if selected}<Check size={16} strokeWidth={2.4} />{/if}</span>
                <span class="swatch-name">{option.name}</span>
                <span class="swatch-price">{option.price ? '+' + money(option.price) : 'как на фото'}</span>
              </button>
            {/each}
          </div>
        {:else if category.id === 'exhaust'}
          <div class="cards" role="radiogroup" aria-label="Выхлопная система">
            {#each exhausts as option}
              {@const selected = configuration.exhaust === option.id}
              <button class="card wide" class:selected role="radio" aria-checked={selected} onclick={() => { configuration.exhaust = option.id; if (view === 3) view = 0 }}>
                <BikePreview parts={[...(rim.layer ? [rim.layer] : []), ...(option.layer ? [option.layer] : [])]} crop={exhaustCrop} {...materials} />
                <span class="card-text"><span class="card-name">{option.name}</span><span class="card-description">{option.description}</span><span class="card-price">{option.price ? '+' + money(option.price) : 'как на фото'}</span></span>
              </button>
            {/each}
          </div>
        {:else}
          <div class="cards">
            {#each accessories as option}
              {@const selected = configuration.accessories.includes(option.id)}
              <div class="card wide accessory" class:selected>
                <BikePreview parts={[option.layer]} crop={cowlCrop} {...materials} />
                <span class="card-text"><span class="card-name">{option.name}</span><span class="card-description">{option.description}</span><span class="card-price">+{money(option.price)}</span></span>
                <button class="toggle-button" aria-pressed={selected} onclick={() => toggleAccessory(option.id)}>
                  {#if selected}<Minus size={15} />Убрать{:else}<Plus size={15} />Добавить{/if}
                </button>
              </div>
            {/each}
          </div>
          <p class="choice-note">Новые аксессуары появятся, когда мы отснимем их в студии.</p>
        {/if}
      </div>

      <footer class="drawer-foot">
        <button class="ghost-button" disabled={step === 0} onclick={() => goToStep(categories[step - 1].id)}><ChevronLeft size={17} />Назад</button>
        {#if step < categories.length - 1}
          <button class="next-button" onclick={() => goToStep(categories[step + 1].id)}>Дальше: {categories[step + 1].name.toLowerCase()}<ChevronRight size={17} /></button>
        {:else}
          <button class="next-button" onclick={() => orderDialog.showModal()}>Открыть наряд-заказ<ClipboardList size={17} /></button>
        {/if}
      </footer>
    </section>
  </section>

  <section class="story" aria-labelledby="story-title">
    <div class="story-head">
      <h2 id="story-title">Как сборка становится мотоциклом</h2>
      <p>Конфигуратор — это эскиз. Сроки зависят от покраски и деталей, мастерская назовёт их после осмотра мотоцикла.</p>
    </div>
    <ol class="story-steps">
      {#each stories as item, index}
        <li>
          <img src={item.image} alt="" loading="lazy" width="1536" height="1024" />
          <h3><span>{index + 1}</span>{item.title}</h3>
          <p>{item.text}</p>
        </li>
      {/each}
    </ol>
  </section>
</main>

<footer class="site-footer">
  <span class="wordmark small">Brobobber</span>
  <p>Изображения в конфигураторе — сгенерированная визуальная концепция V-Rod. Цены ориентировочные, итоговую смету готовит мастерская.</p>
  <a href="#top">Наверх</a>
</footer>

<div class="mobile-bar">
  <span><small>Сборка {orderNumber}</small><strong>{money(total)}</strong></span>
  <button class="order-button" onclick={() => orderDialog.showModal()}><ClipboardList size={18} />Наряд-заказ</button>
</div>

<dialog bind:this={orderDialog} class="order-dialog" aria-labelledby="order-title">
  <div class="work-order">
    <div class="order-head">
      <div><p class="order-caption">Наряд-заказ, Harley-Davidson V-Rod</p><h2 id="order-title">{buildName}</h2></div>
      <div class="order-number"><span>№</span>{orderNumber}</div>
      <button class="close-button" aria-label="Закрыть наряд-заказ" onclick={() => orderDialog.close()}><X size={20} /></button>
    </div>
    <span class="order-stamp" aria-hidden="true">эскиз</span>
    <ol class="order-lines">
      {#each items as line}
        <li>
          <span class="order-item"><small>{line.category}</small>{#if 'swatch' in line.item}<span class="mini-swatch" style={'background:' + line.item.swatch}></span>{/if}{line.item.name}</span>
          <span class="order-leader" aria-hidden="true"></span>
          <span class="order-price">{line.item.price ? money(line.item.price) : 'в основе'}</span>
        </li>
      {/each}
      <li class="order-base">
        <span class="order-item">Базовые работы мастерской</span><span class="order-leader" aria-hidden="true"></span><span class="order-price">{money(basePrice)}</span>
      </li>
    </ol>
    <div class="order-total"><span>Ориентир работ</span><strong>{money(total)}</strong></div>
  </div>
  <p class="order-disclaimer">Демонстрационная оценка без стоимости мотоцикла. Совместимость деталей, цену и сроки подтвердит мастерская.</p>
  <div class="order-actions">
    <button class="next-button" onclick={saveSpecification}><Download size={17} />Скачать наряд-заказ</button>
    <button class="ghost-button" onclick={copyLink}><Copy size={16} />Скопировать ссылку</button>
  </div>
  <p class="order-notice" role="status">{notice}</p>
</dialog>

<div class="toast-region" role="status" aria-live="polite">{#if notice}<div class="toast"><Check size={16} />{notice}</div>{/if}</div>
