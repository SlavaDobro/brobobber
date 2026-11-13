<script>
  import { photoSrc } from './data.js'

  /** @type {{ base: string, alt?: string, sizes?: string, eager?: boolean, class?: string, w?: number, h?: number }} */
  let { base, alt = '', sizes = '(max-width: 800px) 100vw, 50vw', eager = false, class: className = '', w, h } = $props()
  let source = $derived(photoSrc(base))
</script>

<img class={'photo ' + className} src={source.src} srcset={source.srcset} {sizes} {alt} width={w} height={h}
  loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : 'auto'} />
