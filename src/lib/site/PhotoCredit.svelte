<script>
  // Author and licence of an open-licence photo: the licence requires this line, and it makes
  // clear the picture shows the style in general, not a bike built by the workshop.
  /** @type {{ credit: { author: string, page: string, license: string, licenseUrl: string } }} */
  let { credit } = $props()
</script>

<p class="credit">Пример стиля. Фото: <a href={credit.page} target="_blank" rel="noopener">{credit.author}</a>, <a href={credit.licenseUrl} target="_blank" rel="noopener">{credit.license}</a></p>

<style>
  .credit { font-size: 12px; line-height: 1.4; color: var(--concrete); }
  a { text-decoration: underline; text-underline-offset: 2px; }
  a:hover { color: var(--paper); }
</style>
