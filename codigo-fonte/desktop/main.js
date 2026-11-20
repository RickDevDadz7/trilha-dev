// Trilha Dev — programa de PC (Electron).
// Dados ficam em <pasta do usuário>/Trilha Dev/dados (um JSON por registro),
// com uma cópia automática por dia em dados-copias/AAAA-MM-DD (guarda as 14 mais recentes).
const { app, BrowserWindow, ipcMain, dialog, shell, net } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = () => path.join(app.getPath('userData'), 'dados');
const COPIES = () => path.join(app.getPath('userData'), 'dados-copias');
const KEEP_COPIES = 14;
// O programa carrega o app do site (sempre a versão mais nova). Sem internet, usa a cópia embutida.
const REMOTE = 'https://rickdevdadz7.github.io/trilha-dev/';
const trusted = (url) => typeof url === 'string' && (url.startsWith(REMOTE) || url.startsWith('file://'));

const fileFor = (p) => path.join(ROOT(), p.split('/').map((s) => s.replace(/[^A-Za-z0-9_\-.~:@+]/g, '_')).join('__') + '.json');

function readJSON(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } }
function writeAtomic(f, data) {
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, f);
}
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) if (f.endsWith('.json')) fs.copyFileSync(path.join(src, f), path.join(dst, f));
}
function dailyCopy() {
  try {
    if (!fs.existsSync(ROOT()) || !fs.readdirSync(ROOT()).length) return;
    const today = new Date().toISOString().slice(0, 10);
    const dst = path.join(COPIES(), today);
    if (!fs.existsSync(dst)) copyDir(ROOT(), dst);
    const all = fs.readdirSync(COPIES()).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    for (const old of all.slice(0, Math.max(0, all.length - KEEP_COPIES))) fs.rmSync(path.join(COPIES(), old), { recursive: true, force: true });
  } catch (e) { console.error('cópia diária falhou', e); }
}

ipcMain.handle('store:get', (e, p) => !trusted(e.senderFrame.url) ? null : readJSON(fileFor(p)));
ipcMain.handle('store:set', (e, p, data) => { if (!trusted(e.senderFrame.url)) throw new Error('origem não permitida'); fs.mkdirSync(ROOT(), { recursive: true }); writeAtomic(fileFor(p), data); return true; });
ipcMain.handle('store:del', (e, p) => { if (!trusted(e.senderFrame.url)) throw new Error('origem não permitida'); try { fs.unlinkSync(fileFor(p)); } catch (e) { /* já não existe */ } return true; });
ipcMain.handle('store:list', (e, coll) => {
  if (!trusted(e.senderFrame.url)) return [];
  if (!fs.existsSync(ROOT())) return [];
  const pre = coll.split('/').join('__') + '__';
  return fs.readdirSync(ROOT())
    .filter((f) => f.startsWith(pre) && f.endsWith('.json') && !f.slice(pre.length, -5).includes('__'))
    .map((f) => ({ id: f.slice(pre.length, -5), data: readJSON(path.join(ROOT(), f)) }))
    .filter((x) => x.data);
});
ipcMain.handle('file:save', async (e, filename, data) => {
  if (!trusted(e.senderFrame.url)) return false;
  const win = BrowserWindow.fromWebContents(e.sender);
  const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath('documents'), filename), filters: [{ name: 'JSON', extensions: ['json'] }] });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, data);
  return true;
});
ipcMain.handle('folder:open', () => { fs.mkdirSync(ROOT(), { recursive: true }); return shell.openPath(app.getPath('userData')); });
ipcMain.handle('ai:post', async (e, key, body) => {
  if (!trusted(e.senderFrame.url)) return { status: 403, json: null };
  const r = await net.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body)
  });
  let json = null; try { json = await r.json(); } catch (e) { /* */ }
  return { status: r.status, json };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1000, minHeight: 640,
    backgroundColor: '#06070b', title: 'Trilha Dev', autoHideMenuBar: true,
    icon: path.join(__dirname, 'app', 'icon-512.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    const base = url.split('#')[0];
    if (!(base === REMOTE || base === REMOTE + 'index.html' || url.startsWith('file://'))) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); }
  });
  let fellBack = false;
  const offline = () => { if (fellBack) return; fellBack = true; win.loadFile(path.join(__dirname, 'app', 'index.html')); };
  win.webContents.on('did-fail-load', (_e, code, _desc, url, isMainFrame) => { if (isMainFrame && code !== -3 && !url.startsWith('file://')) offline(); });
  const timer = setTimeout(offline, 12000);   // site não respondeu: abre a cópia embutida
  win.webContents.once('did-finish-load', () => clearTimeout(timer));
  if (process.env.TD_SMOKE) {
    win.webContents.on('did-finish-load', () => setTimeout(async () => {
      const r = await win.webContents.executeJavaScript('({ url: location.href, booted: !!(window.TD && TD.app && TD.app.S.booted), mode: window.TD && TD.app && TD.app.S.mode, lessons: window.TD ? TD.courses.reduce((a, c) => a + c.units.reduce((b, u) => b + u.lessons.length, 0), 0) : 0 })');
      console.log('SMOKE', JSON.stringify(r)); app.quit();
    }, 4000));
  }
  win.loadURL(REMOTE, { extraHeaders: 'pragma: no-cache\ncache-control: no-cache\n' });
}

app.setName('Trilha Dev');
app.whenReady().then(() => { dailyCopy(); createWindow(); });
app.on('window-all-closed', () => { app.quit(); });
