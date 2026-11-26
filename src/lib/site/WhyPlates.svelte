<script>
  // Reasons to choose the workshop as stamped steel plates from the workshop wall: rivets in the
  // corners, a punched number tag, a measuring scale, and the icon in the logo's hex nut, which
  // takes a sixth of a turn when the plate is under the cursor. Icons follow `advantages` in data.js.
  import { Cog, Motorbike, PencilRuler, Drill, Shapes, ShieldCheck } from '@lucide/svelte'
  import { advantages } from './data.js'

  const whyIcons = [Cog, Motorbike, PencilRuler, Drill, Shapes, ShieldCheck]
  // The word punched on each plate's tag, in the same order.
  const stamps = ['Под ключ', 'Подбор', 'Смета', '3D · ЧПУ', 'Все марки', 'Гарантия']
</script>

<ul class="plates">
  {#each advantages as item, i}
    {@const Icon = whyIcons[i] ?? Cog}
    <li class="plate">
      <span class="rivets" aria-hidden="true"></span>
      <span class="serial" aria-hidden="true"><i></i>{stamps[i]}</span>
      <span class="ruler" aria-hidden="true"></span>
      <span class="nut" aria-hidden="true">
        <svg viewBox="-12 -12 24 24"><polygon points="5.75,-9.96 11.5,0 5.75,9.96 -5.75,9.96 -11.5,0 -5.75,-9.96" /></svg>
        <Icon size={22} strokeWidth={1.9} />
      </span>
      <h3 class="h3">{item.title}</h3>
      <p class="muted">{item.text}</p>
    </li>
  {/each}
</ul>

<style>
  /* Reasons as steel plates: rivets in the corners, a punched number tag and a measuring scale,
     the icon in a hex nut that takes a sixth of a turn when the plate is under the cursor. */
  .plates { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .plate { position: relative; overflow: hidden; display: grid; align-content: start; gap: 12px; min-height: 250px; padding: 30px 28px 28px;
    background: linear-gradient(155deg, #1f1f1f, #161616 55%, #121212); border: 1px solid var(--rule); border-radius: 3px;
    box-shadow: inset 0 1px 0 #ffffff0d, 0 18px 30px -24px #000; transition: border-color .3s, transform .35s var(--ease), box-shadow .35s; }
  .plate::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--signal); transform: scaleY(0); transform-origin: bottom; transition: transform .35s var(--ease); }
  .rivets { position: absolute; inset: 10px; pointer-events: none;
    background: radial-gradient(circle at 3px 3px, #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at calc(100% - 3px) 3px, #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at 3px calc(100% - 3px), #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat,
      radial-gradient(circle at calc(100% - 3px) calc(100% - 3px), #5c5c5c 0 1.6px, #0a0a0a 2.4px, transparent 3.2px) 0 0 / 100% 100% no-repeat; }
  /* Engine-number plate: a small recessed tag with the number punched into it. */
  .serial { position: absolute; right: 22px; top: 22px; display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px 4px;
    background: #0c0c0c; border: 1px solid #2b2b2b; border-radius: 2px; box-shadow: inset 0 1px 3px #000, 0 1px 0 #ffffff0a;
    font-family: var(--display); font-weight: 700; font-stretch: 112%; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: #7d7f82;
    text-shadow: 0 -1px 0 #000, 0 1px 0 #ffffff12; transition: color .3s; }
  .serial i { width: 4px; height: 4px; border-radius: 50%; background: #3a3a3a; box-shadow: inset 0 1px 1px #000; }
  /* A measuring scale along the bottom edge: fine ticks every 8 px, long ones every 40 px. */
  .ruler { position: absolute; left: 28px; right: 28px; bottom: 12px; height: 9px; pointer-events: none; opacity: .55;
    background: repeating-linear-gradient(90deg, #ebebea40 0 1px, transparent 1px 40px) bottom left / 100% 9px no-repeat,
      repeating-linear-gradient(90deg, #ebebea26 0 1px, transparent 1px 8px) bottom left / 100% 5px no-repeat;
    -webkit-mask: linear-gradient(90deg, #000 70%, transparent); mask: linear-gradient(90deg, #000 70%, transparent); transition: opacity .3s; }
  .nut { position: relative; width: 54px; height: 54px; display: grid; place-items: center; color: var(--paper); margin-bottom: 14px; }
  .nut svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: transform .5s var(--ease); }
  .nut polygon { fill: #0e0e0e; stroke: #ebebea4d; stroke-width: 1; stroke-linejoin: round; transition: fill .3s, stroke .3s; }
  .nut :global(svg.lucide) { position: relative; }
  .plate .h3 { position: relative; max-width: 15em; }
  .plate p { position: relative; max-width: 34ch; }
  .plate:hover { border-color: #ebebea33; transform: translateY(-3px); box-shadow: inset 0 1px 0 #ffffff12, 0 26px 40px -26px #000; }
  .plate:hover::after { transform: none; }
  .plate:hover .serial { color: var(--paper); }
  .plate:hover .serial i { background: var(--signal); }
  .plate:hover .ruler { opacity: 1; }
  .plate:hover .nut svg { transform: rotate(60deg); }
  .plate:hover .nut polygon { fill: var(--signal); stroke: var(--signal); }
  @media (max-width: 960px) { .plates { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .plates { grid-template-columns: 1fr; } .plate { min-height: 0; padding: 24px 20px 32px; } .ruler { left: 20px; right: 20px; } .serial { right: 18px; top: 18px; } .nut { width: 48px; height: 48px; margin-bottom: 8px; } }
</style>
