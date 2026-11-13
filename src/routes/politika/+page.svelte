<script>
  import policy from '$lib/site/policy.json'
</script>

<svelte:head>
  <title>Политика конфиденциальности — Brobobber</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="policy">
  <div class="wrap">
    <h1 class="h2">{policy.title}</h1>
    <div class="text">
      {#each policy.body as paragraph}
        {#if /^\d+\.\s/.test(paragraph) && paragraph.length < 90}<h2>{paragraph}</h2>{:else}<p>{paragraph}</p>{/if}
      {/each}
    </div>
  </div>
</section>

<style>
  .policy { padding: calc(var(--header) + 64px) 0 80px; }
  .text { max-width: 72ch; margin-top: 36px; display: grid; gap: 14px; color: #ece8dfd9; }
  h2 { font-family: var(--display); font-stretch: 90%; font-size: 21px; margin-top: 20px; color: var(--paper); }
</style>
