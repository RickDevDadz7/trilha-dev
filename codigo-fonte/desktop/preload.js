// Ponte segura entre a página e o PC: só expõe o armazenamento, salvar arquivo e a chamada da IA.
const { contextBridge, ipcRenderer } = require('electron');

const ok = location.protocol === 'file:' || location.origin === 'https://rickdevdadz7.github.io';
if (ok) contextBridge.exposeInMainWorld('tdNative', {
  store: {
    get: (p) => ipcRenderer.invoke('store:get', p),
    set: (p, data) => ipcRenderer.invoke('store:set', p, data),
    del: (p) => ipcRenderer.invoke('store:del', p),
    list: (coll) => ipcRenderer.invoke('store:list', coll)
  },
  saveFile: (filename, data) => ipcRenderer.invoke('file:save', filename, data),
  openDataFolder: () => ipcRenderer.invoke('folder:open'),
  anthropic: (key, body) => ipcRenderer.invoke('ai:post', key, body)
});
