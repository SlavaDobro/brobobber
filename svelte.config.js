import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    // Every page is prerendered to plain HTML; nginx serves the files.
    // 404.html renders SvelteKit's error page for unknown addresses.
    adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', strict: true }),
    // Images and generated layers already live in public/ (the configurator scripts use it).
    files: { assets: 'public' },
    // GitHub Pages serves the site from /brobobber; Docker and a real domain use the root.
    paths: { base: process.env.BASE_PATH ?? '' },
    prerender: { handleHttpError: 'fail', handleMissingId: 'fail' },
  },
}
