<script>
  // A card price tag on a string, the kind a workshop hangs on a mirror: punched hole, kind of
  // offer, price, year and mileage. Place it inside a positioned element; it hangs from the top
  // edge and swings back a little when its parent (any element with .tag-host) is hovered.
  /** @type {{ kind: string, price: number, year: number, km?: number, swing?: number, size?: 'm' | 'l' }} */
  let { kind, price, year, km = 0, swing = -6, size = 'm' } = $props()
  const money = (/** @type {number} */ n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'
</script>

<span class={`hang ${size}`} style={`--swing:${swing}deg`} aria-hidden="true">
  <span class="tag">
    <span class="hole"></span>
    <small>{kind}</small>
    <strong>{money(price)}</strong>
    <span class="specs">{year}{#if km} · {km.toLocaleString('ru-RU')} км{/if}</span>
  </span>
</span>

<style>
  .hang { position: absolute; z-index: 2; top: 26px; right: 16px; transform-origin: 50% -26px; transform: rotate(var(--swing)); transition: transform .6s cubic-bezier(.3, 1.6, .5, 1); }
  .hang::before { content: ''; position: absolute; left: 50%; top: -26px; width: 1px; height: 38px; background: #ebebeab3; }
  .tag { position: relative; display: grid; gap: 2px; padding: 22px 14px 12px; min-width: 128px;
    background: linear-gradient(170deg, #f1efe9, #dedbd3); color: #141414; border-radius: 3px;
    clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%, 0 16px); filter: drop-shadow(0 8px 10px #000a); }
  .hole { position: absolute; left: 50%; top: 8px; width: 9px; height: 9px; margin-left: -4.5px; border-radius: 50%; background: #131313; box-shadow: inset 0 1px 2px #000, 0 0 0 2px #c9c5bb; }
  small { font-family: var(--display); font-weight: 700; font-stretch: 108%; font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--signal); }
  strong { font-family: var(--display); font-weight: 800; font-stretch: 104%; font-size: 21px; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .specs { font-size: 12.5px; color: #4a4a4a; font-variant-numeric: tabular-nums; }
  .l { top: 34px; right: 24px; transform-origin: 50% -34px; }
  .l::before { top: -34px; height: 46px; }
  .l .tag { padding: 26px 18px 14px; min-width: 160px; }
  .l small { font-size: 10.5px; }
  .l strong { font-size: 27px; }
  .l .specs { font-size: 13.5px; }
  :global(.tag-host:hover) .hang { transform: rotate(calc(var(--swing) * -.6)); }
</style>
