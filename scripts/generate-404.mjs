// Generates dist/404.html for GitHub Pages SPA deep links: it records the
// requested path and redirects to the app, which restores the route
// (see src/main.tsx sessionStorage handling).
import { writeFile } from 'node:fs/promises'

const BASE = '/store/'

const shim = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <script>
      sessionStorage.setItem('dsh-store-redirect', location.pathname + location.search + location.hash);
      location.replace(${JSON.stringify(BASE)});
    </script>
  </head>
  <body></body>
</html>
`

await writeFile(new URL('../dist/404.html', import.meta.url), shim)
console.log('Wrote dist/404.html redirect shim')
