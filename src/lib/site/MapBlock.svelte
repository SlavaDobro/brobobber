<script>
  // Address and route. The map loads only on request: no third-party requests until the visitor asks.
  import { MapPin, Navigation } from '@lucide/svelte'
  import { contacts, mapLinks } from './data.js'

  let showMap = $state(false)
</script>

<section class="map" aria-labelledby="map-title">
  <div class="wrap grid">
    <div class="info">
      <h2 class="h3" id="map-title">Как доехать</h2>
      <p class="address"><MapPin size={18} />{contacts.address}</p>
      <p class="muted">{contacts.hours}. Мотоцикл можно привезти своим ходом или на нашем мотоэвакуаторе.</p>
      <div class="links">
        <a class="btn btn-line" href={mapLinks.yandex} target="_blank" rel="noopener"><Navigation size={17} />Яндекс Карты</a>
        <a class="btn btn-line" href={mapLinks.google} target="_blank" rel="noopener">Google Maps</a>
      </div>
      <p class="channel">Новые проекты и мотоциклы в наличии — в <a class="link-brass" href={contacts.channel.href} target="_blank" rel="noopener">Telegram-канале {contacts.channel.handle}</a></p>
    </div>
    <div class="frame">
      {#if showMap}
        <iframe title="Карта: мастерская Brobobber" src={mapLinks.widget} loading="lazy"></iframe>
      {:else}
        <button class="placeholder" onclick={() => showMap = true}>
          <span class="pin"><MapPin size={22} /></span>
          <span>Показать карту</span>
          <small>Загрузится карта Яндекса</small>
        </button>
      {/if}
    </div>
  </div>
</section>

<style>
  .map { padding: clamp(56px, 7vw, 96px) 0; border-top: 1px solid var(--rule); }
  .grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(28px, 5vw, 80px); align-items: center; }
  .info { display: grid; gap: 16px; }
  .address { display: flex; gap: 10px; font-size: 19px; line-height: 1.4; }
  .address :global(svg) { color: var(--brass); margin-top: 3px; }
  .links { display: flex; gap: 10px; flex-wrap: wrap; }
  .channel { font-size: 15px; color: var(--concrete); }
  .frame { aspect-ratio: 16 / 10; border: 1px solid var(--rule); border-radius: 6px; overflow: hidden; background:
    repeating-linear-gradient(0deg, transparent 0 39px, #ffffff08 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, #ffffff08 39px 40px), var(--asphalt-2); }
  iframe { width: 100%; height: 100%; border: 0; filter: grayscale(.4) contrast(1.05); }
  .placeholder { width: 100%; height: 100%; display: grid; place-content: center; justify-items: center; gap: 8px; color: var(--paper); }
  .placeholder small { color: var(--concrete); }
  .pin { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 50%; background: var(--signal); color: #fff; box-shadow: 0 0 0 10px #d23f2a22; }
  @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
</style>
