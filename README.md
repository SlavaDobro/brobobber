# Brobobber

Стартовая заготовка сайта на Svelte 5, Vite и Tailwind CSS 4. Проект проверен на Node.js 24.20.0 с npm. Все команды выполняются из папки с package.json.

## Локальный запуск

```powershell
npm.cmd ci
npm.cmd run dev
```

Открой локальный адрес из терминала. Главный компонент находится в `src/App.svelte`. Общие стили и импорт Tailwind находятся в `src/app.css`.

## Проверка перед сдачей

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd run preview
```

Первая команда проверяет компоненты и JavaScript. Вторая собирает сайт в папку `dist`. Третья запускает локальный просмотр этой сборки.
