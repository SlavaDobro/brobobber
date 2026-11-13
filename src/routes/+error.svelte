<script>
  import { page } from '$app/state'
</script>

<svelte:head><title>Страница не найдена — Brobobber</title></svelte:head>

<section class="error">
  <div class="wrap">
    <p class="code">{page.status}</p>
    <h1 class="h2">{page.status === 404 ? 'Такой страницы нет' : 'Что-то сломалось'}</h1>
    <p class="muted">Возможно, адрес устарел. Начните с главной или посмотрите проекты.</p>
    <div class="actions"><a class="btn btn-signal" href="/">На главную</a><a class="btn btn-line" href="/proekty">Проекты</a></div>
  </div>
</section>

<style>
  .error { padding: calc(var(--header) + 80px) 0 100px; }
  .wrap { display: grid; gap: 20px; justify-items: start; }
  .code { font-family: var(--display); font-stretch: 75%; font-weight: 650; font-size: clamp(120px, 20vw, 260px); line-height: .9; color: var(--brass); }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; }
</style>
