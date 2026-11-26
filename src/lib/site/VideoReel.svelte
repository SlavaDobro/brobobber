<script>
  // Short vertical videos from the workshop's Telegram channel. Nothing is downloaded until the
  // visitor presses play (only the poster loads); one video plays at a time.
  import { base } from '$app/paths'
  import { Play, ChevronLeft, ChevronRight } from '@lucide/svelte'
  import videos from './videos.json'
  import { dragScroll } from './drag-scroll.js'

  /** @type {{ limit?: number }} */
  let { limit = videos.length } = $props()
  let playing = $state('')
  /** @type {HTMLElement} */ let reel
  let atStart = $state(true), atEnd = $state(false)
  const edges = () => { atStart = reel.scrollLeft < 8; atEnd = reel.scrollLeft + reel.clientWidth > reel.scrollWidth - 8 }
  $effect(() => { edges(); const ro = new ResizeObserver(edges); ro.observe(reel); return () => ro.disconnect() })
  /** @param {number} dir */
  const scrollBy = dir => reel.scrollBy({ left: dir * reel.clientWidth * .7, behavior: 'smooth' })

  /** @param {string} id */
  function play(id) {
    playing = id
  }
</script>

<div class="film">
  <ul class="reel shelf" bind:this={reel} use:dragScroll onscroll={edges}>
    {#each videos.slice(0, limit) as video, i (video.id)}
      <li>
        <span class="edge top" aria-hidden="true">BROBOBBER <b>▸ {String(i + 1).padStart(2, '0')}A</b></span>
        <figure>
          {#if playing === video.id}
            <!-- svelte-ignore a11y_media_has_caption -->
            <video src={base + video.src} poster={base + video.poster} controls autoplay playsinline onended={() => playing = ''}></video>
          {:else}
            <button class="poster" onclick={() => play(video.id)} aria-label={`Смотреть видео: ${video.title}`} style={`background-image:url(${base + video.poster})`}>
              <!-- The first frame of the clip itself is the poster: Telegram's thumbnails are only 180 px. -->
              <video src={`${base + video.src}#t=0.6`} muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>
              <span class="play" aria-hidden="true">
                <svg viewBox="-12 -12 24 24"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg>
                <Play size={20} fill="currentColor" />
              </span>
              <span class="cap">{video.title}</span>
            </button>
          {/if}
        </figure>
        <span class="edge bottom" aria-hidden="true"><b>{video.duration}</b> BB 400 · {String(i + 1).padStart(2, '0')}</span>
      </li>
    {/each}
  </ul>
</div>
<div class="controls">
  <button aria-label="Предыдущие ролики" disabled={atStart} onclick={() => scrollBy(-1)}>
    <svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg><ChevronLeft size={18} />
  </button>
  <button aria-label="Следующие ролики" disabled={atEnd} onclick={() => scrollBy(1)}>
    <svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg><ChevronRight size={18} />
  </button>
</div>

<style>
  /* A strip of film across the page: sprocket holes along both edges (they scroll with the frames),
     edge markings with the frame number and the clip length, and the clips as the frames. */
  .reel { --band: 40px; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-block: var(--band);
    background:
      repeating-linear-gradient(90deg, transparent 0 9px, #262626 9px 21px, transparent 21px 30px) 0 7px / 100% 11px repeat-x local,
      repeating-linear-gradient(90deg, transparent 0 9px, #262626 9px 21px, transparent 21px 30px) 0 calc(100% - 7px) / 100% 11px repeat-x local,
      #070707;
    border-block: 1px solid #ebebea12; }
  .reel li { position: relative; flex: none; width: clamp(200px, 22vw, 280px); scroll-snap-align: start; }
  figure { margin: 0; }
  .poster, video { display: block; width: 100%; aspect-ratio: 9 / 16; border-radius: 2px; overflow: hidden; background: var(--asphalt-2); object-fit: cover; position: relative; }
  .poster { background-size: cover; background-position: center; box-shadow: inset 0 0 0 1px #ebebea14; }
  .poster video { position: absolute; inset: 0; width: 100%; height: 100%; aspect-ratio: auto; border-radius: 0; transition: transform .6s var(--ease), filter .4s; pointer-events: none;
    filter: grayscale(1) contrast(1.12) brightness(.85); }
  .poster::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, #000000d9); pointer-events: none; }
  .poster:hover video { transform: scale(1.04); filter: none; }
  .play { position: absolute; z-index: 1; left: 50%; top: 46%; width: 60px; height: 60px; margin: -30px 0 0 -30px; display: grid; place-items: center; color: var(--paper); }
  .play svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .45s var(--ease); }
  .play polygon { fill: #0b0b0bcc; stroke: #ebebea80; stroke-width: 1; stroke-linejoin: round; transition: fill .25s, stroke .25s; }
  .play :global(svg.lucide) { position: relative; margin-left: 3px; }
  .poster:hover .play svg { transform: rotate(60deg); }
  .poster:hover .play polygon { fill: var(--signal); stroke: var(--signal); }
  .cap { position: absolute; z-index: 1; left: 14px; right: 14px; bottom: 14px; text-align: left; font-family: var(--display); font-weight: 650; font-stretch: 100%; font-size: 15px; line-height: 1.25; color: var(--paper); text-wrap: balance; }
  /* Edge markings printed on the film, in the band between the holes and the frame. */
  .edge { position: absolute; left: 2px; white-space: nowrap; font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: #d23f2ab3; pointer-events: none; }
  .edge b { color: #ebebeaa6; font-weight: 700; }
  .edge.top { top: -14px; }
  .edge.bottom { bottom: -14px; }

  .controls { display: flex; gap: 10px; margin-top: 20px; }
  .controls button { position: relative; width: 46px; height: 46px; display: grid; place-items: center; color: var(--paper); transition: opacity .2s; }
  .controls svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .45s var(--ease); }
  .controls polygon { fill: #111; stroke: #ebebea4d; stroke-width: 1.1; stroke-linejoin: round; transition: fill .25s, stroke .25s; }
  .controls button :global(svg.lucide) { position: relative; }
  .controls button:hover:not(:disabled) svg { transform: rotate(60deg); }
  .controls button:hover:not(:disabled) polygon { fill: var(--signal); stroke: var(--signal); }
  .controls button:disabled { opacity: .3; cursor: default; }
</style>
