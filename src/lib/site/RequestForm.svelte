<script>
  import { base } from '$app/paths'
  // "Discuss a project" form. The site is static, so the request leaves from the visitor's own
  // mail app or Telegram: the text is assembled here and nothing is stored or sent by the site.
  import { Send, Mail, Check } from '@lucide/svelte'
  import { contacts, services } from './data.js'

  /** @type {{ title?: string, topic?: string }} */
  let { title = 'Обсудим ваш мотоцикл', topic = '' } = $props()

  let name = $state('')
  let phone = $state('')
  let bike = $state('')
  let service = $state('')
  // The page decides the topic (a service page pre-selects its service); keep it in sync on navigation.
  $effect(() => { service = topic })
  let message = $state('')
  let agreed = $state(false)
  let ready = $state(false)
  let copied = $state(false)
  let error = $state('')

  let text = $derived([
    'Заявка с сайта Brobobber',
    name && `Имя: ${name}`,
    phone && `Телефон: ${phone}`,
    bike && `Мотоцикл: ${bike}`,
    service && `Услуга: ${service}`,
    message && `Задача: ${message}`,
  ].filter(Boolean).join('\n'))
  let mailto = $derived(`mailto:${contacts.email}?subject=${encodeURIComponent('Заявка с сайта: ' + (service || 'обсудить проект'))}&body=${encodeURIComponent(text)}`)
  let telegram = $derived(`https://t.me/${contacts.phones[0].telegram}`)

  /** @param {SubmitEvent} event */
  function submit(event) {
    event.preventDefault()
    if (!phone.trim()) { error = 'Укажите телефон: по нему мастер перезвонит.'; return }
    if (!agreed) { error = 'Отметьте согласие на обработку данных.'; return }
    error = ''
    ready = true
  }

  async function sendTelegram() {
    try { await navigator.clipboard.writeText(text); copied = true } catch { copied = false }
    window.open(telegram, '_blank', 'noopener')
  }
</script>

<section class="request" id="zayavka" aria-labelledby="request-title">
  <div class="wrap grid">
    <div class="intro">
      <h2 class="h2" id="request-title">{title}</h2>
      <p class="muted">Расскажите, что за мотоцикл и что хочется изменить. Мастер перезвонит, уточнит детали и предложит, с чего начать.</p>
      <ul class="people">
        {#each contacts.phones as person}
          <li><a href={person.href}>{person.phone}</a><span>{person.name}, <a class="link-brass" href={`https://t.me/${person.telegram}`} target="_blank" rel="noopener">Telegram</a></span></li>
        {/each}
      </ul>
    </div>

    {#if !ready}
      <form class="form" onsubmit={submit} novalidate>
        <label><span>Имя</span><input bind:value={name} autocomplete="name" /></label>
        <label><span>Телефон</span><input bind:value={phone} type="tel" autocomplete="tel" inputmode="tel" required aria-invalid={!!error && !phone.trim()} /></label>
        <label><span>Мотоцикл</span><input bind:value={bike} placeholder="Марка, модель, год" /></label>
        <label><span>Услуга</span>
          <select bind:value={service}>
            <option value="">Пока не знаю</option>
            {#each services as item}<option value={item.name}>{item.name}</option>{/each}
          </select>
        </label>
        <label class="full"><span>Что хотите сделать</span><textarea bind:value={message} rows="3"></textarea></label>
        <label class="consent full"><input type="checkbox" bind:checked={agreed} /><span>Согласен на обработку персональных данных по <a class="link-brass" href="{base}/politika">политике конфиденциальности</a></span></label>
        {#if error}<p class="error full" role="alert">{error}</p>{/if}
        <button class="btn btn-signal full" type="submit">Подготовить заявку</button>
      </form>
    {:else}
      <div class="form done" role="status">
        <p class="h3">Заявка готова. Отправьте её удобным способом</p>
        <pre class="preview">{text}</pre>
        <div class="send">
          <a class="btn btn-signal" href={mailto}><Mail size={18} />Отправить письмом</a>
          <button class="btn btn-line" onclick={sendTelegram}><Send size={18} />Написать в Telegram</button>
        </div>
        {#if copied}<p class="muted note"><Check size={15} />Текст заявки скопирован — вставьте его в чат.</p>{/if}
        <button class="link-brass edit" onclick={() => ready = false}>Изменить заявку</button>
      </div>
    {/if}
  </div>
</section>

<style>
  .request { padding: clamp(72px, 9vw, 128px) 0; background: var(--asphalt-2); border-top: 1px solid var(--rule); }
  .grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(32px, 6vw, 96px); align-items: start; }
  .intro { display: grid; gap: 20px; }
  .intro .h2 { max-width: 10ch; }
  .intro p { max-width: 40ch; }
  .people { display: grid; gap: 14px; margin-top: 8px; }
  .people li { display: grid; gap: 2px; }
  .people li > a { font-family: var(--display); font-stretch: 90%; font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .people span { color: var(--concrete); font-size: 14px; }
  .form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .full { grid-column: 1 / -1; }
  label { display: grid; gap: 6px; font-size: 14px; color: var(--concrete); }
  input:not([type='checkbox']), select, textarea { width: 100%; padding: 13px 14px; background: var(--asphalt); border: 1px solid var(--rule); border-radius: 4px; color: var(--paper); transition: border-color .2s; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--brass); }
  input[aria-invalid='true'] { border-color: var(--signal); }
  textarea { resize: vertical; }
  .consent { grid-template-columns: auto 1fr; align-items: start; gap: 10px; }
  .consent input { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--brass); }
  .error { color: #f08a78; font-size: 14px; }
  .done { grid-template-columns: 1fr; gap: 18px; padding: 28px; border: 1px solid var(--rule); border-radius: 6px; background: var(--asphalt); }
  .preview { margin: 0; white-space: pre-wrap; font: inherit; font-size: 15px; color: var(--concrete); padding: 16px; border-left: 2px solid var(--brass); background: var(--asphalt-2); }
  .send { display: flex; gap: 12px; flex-wrap: wrap; }
  .note { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .edit { justify-self: start; font-size: 14px; }
  @media (max-width: 860px) {
    .grid { grid-template-columns: 1fr; }
    .form { grid-template-columns: 1fr; }
  }
</style>
