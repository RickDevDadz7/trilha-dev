// Build do Overclock (antes Trilha Dev) (mesmo esquema do Deutsch mit Plan).
// Gera, a partir de src/:
//   dist/index.html           -> versão do artifact no Claude.ai (+ dist/vendor)
//   ../index.html (raiz)      -> app web instalável (GitHub Pages / PWA) + sw.js, manifest, vendor/
//   desktop/app/index.html    -> programa de PC (Electron) + vendor/
// Uso: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const src = (p) => readFileSync(join(here, 'src', p), 'utf8');

const contentFiles = readdirSync(join(here, 'src', 'content'))
  .filter((f) => f.endsWith('.js'))
  .sort((a, b) => (a === '_base.js' ? -1 : b === '_base.js' ? 1 : a.localeCompare(b, 'en', { numeric: true })));
const order = ['js', 'ts', 'sql', 'web', 'react', 'git', 'eng', 'career', 'abroad'];
contentFiles.sort((a, b) => {
  if (a === '_base.js') return -1; if (b === '_base.js') return 1;
  const ka = order.findIndex((k) => a.startsWith(k)), kb = order.findIndex((k) => b.startsWith(k));
  return ka - kb || a.localeCompare(b, 'en', { numeric: true });
});
const scripts = [
  ...contentFiles.map((f) => ['content/' + f, src('content/' + f)]),
  ['store.js', src('store.js')], ['local.js', src('local.js')], ['cloud.js', src('cloud.js')], ['sync.js', src('sync.js')], ['runners.js', src('runners.js')], ['gitsim.js', src('gitsim.js')], ['pedagogy.js', src('pedagogy.js')], ['sfx.js', src('sfx.js')], ['app.js', src('app.js')]
];
const css = src('codemirror.css') + '\n' + src('style.css');
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');

function page({ pwa }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Overclock</title>
<meta name="theme-color" content="#06070b">
${pwa ? '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">' : ''}
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(readFileSync(join(here, 'assets', 'icon.svg'), 'utf8').replace(/\s+/g, ' '))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600;800&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div id="app" class="app"><div class="loading">Inicializando sistema...</div></div>
<script src="vendor/codemirror.min.js"></script>
${scripts.map(([name, js]) => `<script>/* ${name} */\n${safe(js)}\n</script>`).join('\n')}
${pwa ? `<script>if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(function () {});</script>` : ''}
</body>
</html>
`;
}

function copyVendor(dest) {
  mkdirSync(join(dest, 'vendor'), { recursive: true });
  for (const f of readdirSync(join(here, 'vendor'))) copyFileSync(join(here, 'vendor', f), join(dest, 'vendor', f));
}

// 1) artifact
mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, 'dist', 'index.html'), page({ pwa: false }));
copyVendor(join(here, 'dist'));

// 2) web / PWA na raiz do repositório
const version = readFileSync(join(here, 'src', 'content', '_base.js'), 'utf8').match(/contentVersion = '([^']+)'/)[1];
writeFileSync(join(root, 'index.html'), page({ pwa: true }));
copyVendor(root);
copyFileSync(join(here, 'assets', 'icon.svg'), join(root, 'icon.svg'));
for (const n of [180, 192, 512]) copyFileSync(join(here, 'assets', `icon-${n}.png`), join(root, `icon-${n}.png`));
writeFileSync(join(root, 'manifest.webmanifest'), JSON.stringify({
  name: 'Overclock', short_name: 'Overclock', description: 'Aprenda JavaScript, TypeScript, SQL, HTML/CSS, React e Git',
  id: '/trilha-dev/', start_url: './', scope: './', display: 'standalone',
  background_color: '#0b0510', theme_color: '#0b0510', lang: 'pt-BR',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
  ]
}, null, 2));
writeFileSync(join(root, 'sw.js'), readFileSync(join(here, 'pwa-sw.js'), 'utf8').replace('__VERSION__', version + '-' + Date.now()));
if (!existsSync(join(root, '.nojekyll'))) writeFileSync(join(root, '.nojekyll'), '');

// 3) desktop (Electron)
const appDir = join(here, 'desktop', 'app');
mkdirSync(appDir, { recursive: true });
writeFileSync(join(appDir, 'index.html'), page({ pwa: false }));
copyVendor(appDir);
copyFileSync(join(here, 'assets', 'icon.svg'), join(appDir, 'icon.svg'));
copyFileSync(join(here, 'assets', 'icon-512.png'), join(appDir, 'icon-512.png'));

const lessons = scripts.length;
console.log(`ok: ${contentFiles.length} arquivos de conteúdo, ${lessons} scripts -> dist/, raiz (PWA) e desktop/app/`);
