/* Persistência do Trilha Dev (mesmo modelo do Deutsch mit Plan).
 * Backends com a mesma interface get/set/del/list:
 *  - DbBackend: banco do artifact no Claude.ai (privado por usuário)
 *  - NativeBackend: arquivo JSON no PC (Electron), com cópias diárias automáticas
 *  - MemoryBackend: navegador (localStorage), para o app instalado/PWA
 * Backups: exportar/restaurar JSON com checksum + backup automático semanal (guarda 4). */
(function (TD) {
  'use strict';
  const SCHEMA = 1;
  const APP = 'trilha-dev';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16); }
  function stable(o) {
    if (Array.isArray(o)) return '[' + o.map(stable).join(',') + ']';
    if (o && typeof o === 'object') return '{' + Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + stable(o[k])).join(',') + '}';
    return JSON.stringify(o);
  }

  /* Caminhos lógicos: 'progress' | 'code/c/<lessonId>' | 'backups/b/<id>' */
  function DbBackend(db, uid) {
    const base = 'data/users/' + uid;
    const ref = (path) => { const s = path.split('/'); return s.length === 1 ? db.doc(base + '/' + s[0]) : db.doc(base + '/' + s[0]).collection(s[1]).doc(s[2]); };
    const withRetry = async (fn) => { try { return await fn(); } catch (e) { if (e && e.code === 'unavailable') { await new Promise((r) => setTimeout(r, 400 + Math.random() * 600)); return fn(); } throw e; } };
    return {
      kind: 'db',
      async get(path) { const s = await withRetry(() => ref(path).get()); return s.exists ? clone(s.data()) : null; },
      async set(path, data) { return withRetry(() => ref(path).set(data)); },
      async del(path) { return withRetry(() => ref(path).delete()); },
      async list(coll) {
        const [a, b] = coll.split('/');
        const snap = await withRetry(() => db.doc(base + '/' + a).collection(b).limit(1000).get());
        return snap.docs.map((d) => ({ id: d.id, data: clone(d.data()) }));
      }
    };
  }
  function MemoryBackend(persistKey) {
    let mem = {};
    const ls = (() => { try { return persistKey && globalThis.localStorage; } catch (e) { return null; } })();
    if (ls) { try { mem = JSON.parse(ls.getItem(persistKey) || '{}'); } catch (e) { mem = {}; } }
    const flush = () => { if (ls) { try { ls.setItem(persistKey, JSON.stringify(mem)); } catch (e) { /* cheio */ } } };
    return {
      kind: 'memory',
      async get(path) { return mem[path] ? clone(mem[path]) : null; },
      async set(path, data) { mem[path] = clone(data); flush(); },
      async del(path) { delete mem[path]; flush(); },
      async list(coll) { const pre = coll + '/'; return Object.keys(mem).filter((k) => k.startsWith(pre) && k.slice(pre.length).indexOf('/') < 0).map((k) => ({ id: k.slice(pre.length), data: clone(mem[k]) })); }
    };
  }
  function NativeBackend() {
    const n = window.tdNative.store;
    return { kind: 'native', get: (p) => n.get(p), set: (p, d) => n.set(p, d), del: (p) => n.del(p), list: (c) => n.list(c) };
  }

  const safeId = (s) => String(s).replace(/[^A-Za-z0-9_\-.~:@+]/g, '_').slice(0, 180);

  function blankProgress(now) {
    return { schema: SCHEMA, createdAt: now, xp: 0, streak: 0, bestStreak: 0, lastDay: null, days: {}, done: {}, last: null, settings: {} };
  }
  function validProgress(p) {
    return !!p && typeof p === 'object' && typeof p.xp === 'number' && p.done && typeof p.done === 'object';
  }

  function Store(backend, log) {
    this.b = backend; this.log = log || (() => {});
    this.state = null; this.queue = {}; this.tail = {}; this.pendingN = 0; this.onPending = null; this.lastError = null;
  }
  Store.prototype.load = async function (now) {
    const [p, codes] = await Promise.all([this.b.get('progress'), this.b.list('code/c')]);
    const progress = validProgress(p) ? Object.assign(blankProgress(now), p) : blankProgress(now);
    const code = {};
    for (const { data } of codes) if (data && data.lesson && data.steps) code[data.lesson] = data;
    this.state = { progress, code };
    return this.state;
  };
  Store.prototype._write = function (path, data) {
    const q = this.queue[path];
    if (q && !q.started) { q.data = clone(data); return q.promise; }
    const entry = { data: clone(data), started: false };
    const prev = (this.tail[path] || Promise.resolve()).catch(() => {});
    this.pendingN++; this.onPending && this.onPending(this.pendingN);
    entry.promise = prev.then(async () => {
      entry.started = true;
      if (this.queue[path] === entry) delete this.queue[path];
      try { await this.b.set(path, entry.data); this.lastError = null; }
      catch (e) { this.lastError = e; this.log('error', 'falha ao salvar ' + path + ': ' + (e && (e.code || e.message))); throw e; }
      finally { this.pendingN--; this.onPending && this.onPending(this.pendingN); }
    });
    this.queue[path] = entry;
    this.tail[path] = entry.promise;
    return entry.promise;
  };
  Store.prototype.saveProgress = function () { this.state.progress._u = Date.now(); return this._write('progress', this.state.progress); };
  Store.prototype.saveCode = function (lessonId) { return this._write('code/c/' + safeId(lessonId), this.state.code[lessonId]); };
  Store.prototype.flush = async function () { await Promise.allSettled(Object.values(this.tail)); };

  /* ---------- Backup / restauração ---------- */
  Store.prototype.exportData = function (now, contentVersion) {
    const data = clone({ progress: this.state.progress, code: Object.values(this.state.code) });
    return { app: APP, schema: SCHEMA, contentVersion, exportedAt: now, checksum: fnv(stable(data)), data };
  };
  function validateBackup(obj) {
    if (!obj || obj.app !== APP) return 'Esse arquivo não é um backup do Trilha Dev.';
    if (obj.schema !== SCHEMA) return 'Versão de backup incompatível (' + obj.schema + ').';
    if (!obj.data || !validProgress(obj.data.progress)) return 'Backup sem progresso válido.';
    if (fnv(stable(obj.data)) !== obj.checksum) return 'O checksum não confere: o arquivo foi alterado ou está corrompido.';
    return null;
  }
  Store.prototype.importData = async function (obj, now) {
    const err = validateBackup(obj); if (err) throw new Error(err);
    const progress = Object.assign(blankProgress(now), clone(obj.data.progress));
    const code = {};
    for (const c of obj.data.code || []) if (c && c.lesson) code[c.lesson] = clone(c);
    this.state = { progress, code };
    const ps = [this.saveProgress()];
    for (const id of Object.keys(code)) ps.push(this.saveCode(id));
    const res = await Promise.allSettled(ps);
    const failed = res.filter((r) => r.status === 'rejected').length;
    if (failed) throw new Error(failed + ' registros não puderam ser gravados.');
    return this.state;
  };
  /** Backup automático semanal dentro do próprio armazenamento (mantém os 4 mais recentes). */
  Store.prototype.autoBackup = async function (now, contentVersion) {
    const wk = 'w' + Math.floor(now / (7 * 86400000));
    const list = await this.b.list('backups/b');
    if (list.some((x) => x.id === wk)) return { skipped: true };
    if (!Object.keys(this.state.progress.done).length) return { empty: true };
    const json = JSON.stringify(this.exportData(now, contentVersion));
    if (json.length > 240000) return { tooBig: true, size: json.length };
    await this.b.set('backups/b/' + wk, { at: now, json });
    const old = list.sort((a, b) => (b.data.at || 0) - (a.data.at || 0)).slice(3);
    for (const o of old) await this.b.del('backups/b/' + o.id);
    return { saved: wk };
  };
  Store.prototype.listBackups = async function () {
    return (await this.b.list('backups/b')).map((x) => ({ id: x.id, at: x.data.at, size: (x.data.json || '').length, json: x.data.json })).sort((a, b) => b.at - a.at);
  };

  TD.store = { Store, DbBackend, MemoryBackend, NativeBackend, validateBackup, blankProgress, fnv, stable, SCHEMA, APP, safeId };
})(globalThis.TD = globalThis.TD || {});
