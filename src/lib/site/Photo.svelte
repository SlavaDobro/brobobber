<script>
  import { photoSrc } from './data.js'

  /** @type {{ base: string, alt?: string, sizes?: string, eager?: boolean, class?: string, w?: number, h?: number }} */
  let { base, alt = '', sizes = '(max-width: 800px) 100vw, 50vw', eager = false, class: className = '', w, h } = $props()
  let source = $derived(photoSrc(base))
  /** @type {HTMLImageElement} */ let img

  // Tell the browser the width the photo really needs here. A cropped (object-fit: cover) photo
  // needs more than its box, and a too-small figure makes sharp screens get a blurry file.
  $effect(() => {
    source
    const fit = () => {
      const width = img.clientWidth, height = img.clientHeight
      if (!width) return
      const aspect = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : w && h ? w / h : 0
      img.sizes = `${Math.ceil(Math.max(width, height * aspect))}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(img)
    img.addEventListener('load', fit)
    return () => { observer.disconnect(); img.removeEventListener('load', fit) }
  })
</script>

<img bind:this={img} class={'photo ' + className} src={source.src} srcset={source.srcset} {sizes} {alt} width={w} height={h}
  loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : 'auto'} />
