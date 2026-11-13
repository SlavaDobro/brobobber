<script>
  // Short vertical videos from the workshop's Telegram channel. Nothing is downloaded until the
  // visitor presses play (only the poster loads); one video plays at a time.
  import { base } from '$app/paths'
  import { Play } from '@lucide/svelte'
  import videos from './videos.json'

  /** @type {{ limit?: number }} */
  let { limit = videos.length } = $props()
  let playing = $state('')

  /** @param {string} id */
  function play(id) {
    playing = id
  }
</script>

<ul class="reel">
  {#each videos.slice(0, limit) as video (video.id)}
    <li>
      <figure>
        {#if playing === video.id}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video src={base + video.src} poster={base + video.poster} controls autoplay playsinline onended={() => playing = ''}></video>
        {:else}
          <button class="poster" onclick={() => play(video.id)} aria-label={`Смотреть видео: ${video.title}`} style={`background-image:url(${base + video.poster})`}>
            <!-- The first frame of the clip itself is the poster: Telegram's thumbnails are only 180 px. -->
            <video src={`${base + video.src}#t=0.6`} muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>
            <span class="play"><Play size={22} fill="currentColor" /></span>
            <span class="duration">{video.duration}</span>
          </button>
        {/if}
        <figcaption>{video.title}</figcaption>
      </figure>
    </li>
  {/each}
</ul>

<style>
  .reel { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 4px; }
  .reel li { flex: none; width: clamp(200px, 22vw, 280px); scroll-snap-align: start; }
  figure { display: grid; gap: 10px; }
  .poster, video { display: block; width: 100%; aspect-ratio: 9 / 16; border-radius: 6px; overflow: hidden; background: var(--asphalt-2); object-fit: cover; position: relative; }
  .poster { background-size: cover; background-position: center; }
  .poster video { width: 100%; height: 100%; aspect-ratio: auto; border-radius: 0; transition: transform .6s var(--ease); pointer-events: none; }
  .poster:hover video { transform: scale(1.04); }
  .play { position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px; display: grid; place-items: center; border-radius: 50%; background: #1c1d1bcc; border: 1px solid var(--brass); color: var(--brass); backdrop-filter: blur(4px); transition: transform .25s var(--ease); }
  .poster:hover .play { transform: scale(1.1); }
  .duration { position: absolute; right: 10px; bottom: 10px; padding: 2px 7px; border-radius: 3px; background: #000a; font-size: 12px; font-variant-numeric: tabular-nums; }
  figcaption { font-size: 14px; color: var(--concrete); line-height: 1.4; }
</style>
