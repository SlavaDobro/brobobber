<script>
  import { photoAspect, photoSrc } from './data.js'

  /** @type {{ base: string, alt?: string, sizes?: string, eager?: boolean, cover?: boolean, class?: string, w?: number, h?: number }} */
  let { base, alt = '', sizes = '(max-width: 800px) 100vw, 50vw', eager = false, cover = false, class: className = '', w, h } = $props()
  let source = $derived(photoSrc(base))
  /** @type {HTMLImageElement} */ let img

  // A motorcycle must not lose its wheels to a frame. When a frame fits the photo closely the photo
  // fills it; otherwise the whole photo is shown over a soft blurred copy of itself. The browser
  // is also told the width really needed here, so sharp screens get a sharp file.
  $effect(() => {
    const { blur } = source
    const aspect = photoAspect(base)
    const fit = () => {
      const width = img.clientWidth, height = img.clientHeight
      if (!width || !height) return
      const box = width / height
      const fills = cover || Math.min(box / aspect, aspect / box) >= .92
      img.style.objectFit = fills ? 'cover' : 'contain'
      img.style.background = fills ? '' : blur ? `linear-gradient(#0f100e73, #0f100e73), url("${blur}") center / cover no-repeat` : 'var(--asphalt-2)'
      img.sizes = `${Math.ceil(fills ? Math.max(width, height * aspect) : Math.min(width, height * aspect))}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(img)
    return () => observer.disconnect()
  })
</script>

<img bind:this={img} class={'photo ' + className} src={source.src} srcset={source.srcset} {sizes} {alt} width={w} height={h}
  loading={eager ? 'eager' : 'lazy'} decoding={eager ? 'sync' : 'async'} fetchpriority={eager ? 'high' : 'auto'} />
