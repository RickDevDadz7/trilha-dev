/* Trilha Dev — sincronização entre aparelhos pela conta (Supabase, tabela trilha_sync).
 * Cada aparelho grava só a própria linha; ao sincronizar, lê as linhas dos outros aparelhos
 * da mesma conta e junta tudo. A junção é idempotente: sincronizar duas vezes não muda nada.
 *
 * XP e dias de estudo ficam num "livro-caixa" por aparelho (progress.xd / progress.dd), assim
 * estudar no PC e no celular no mesmo dia soma certinho, sem contar nada duas vezes. */
(function (TD) {
  'use strict';
  const TABLE = 'trilha_sync';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ls = () => { try { return globalThis.localStorage; } catch (e) { return null; } };

  function deviceId() {
    const s = ls();
    let id = s && s.getItem('td-device');
    if (!id) {
      id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      try { s && s.setItem('td-device', id); } catch (e) { /* */ }
    }
    return id;
  }
  function deviceName() {
    let ua = ''; try { ua = navigator.userAgent || ''; } catch (e) { /* */ }
    if (globalThis.tdNative) return 'PC (programa)';
    if (/Android|iPhone|iPad|Mobile/i.test(ua)) return 'Celular';
    return 'Navegador do PC';
  }

  /** Garante o livro-caixa por aparelho (progresso antigo vira o saldo inicial deste aparelho). */
  function migrate(p, dev) {
    dev = dev || deviceId();
    if (!p.xd || typeof p.xd !== 'object') p.xd = { [dev]: p.xp || 0 };
    if (!p.dd || typeof p.dd !== 'object') p.dd = { [dev]: clone(p.days || {}) };
    p.srs = p.srs || {}; p.mastery = p.mastery || {}; p.done = p.done || {};
    return p;
  }
  /** Registra XP ganho neste aparelho. */
  function ledger(p, amount, day) {
    const dev = deviceId(); migrate(p, dev);
    p.xd[dev] = (p.xd[dev] || 0) + amount;
    const dd = p.dd[dev] || (p.dd[dev] = {});
    const d = dd[day] || (dd[day] = { xp: 0, lessons: 0 });
    d.xp += amount; d.lessons++;
    const keys = Object.keys(dd).sort(); while (keys.length > 400) delete dd[keys.shift()];
  }

  const dkey = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  /** Recalcula XP total, dias e sequência a partir dos livros-caixa. */
  function derive(p) {
    p.xp = Object.values(p.xd || {}).reduce((a, b) => a + (+b || 0), 0);
    const days = {};
    for (const dd of Object.values(p.dd || {})) for (const [k, v] of Object.entries(dd || {})) {
      const t = days[k] || (days[k] = { xp: 0, lessons: 0 });
      t.xp += v.xp || 0; t.lessons += v.lessons || 0;
    }
    p.days = days;
    const keys = Object.keys(days).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
    if (keys.length) {
      const last = keys[keys.length - 1];
      if (!p.lastDay || last > p.lastDay) p.lastDay = last;
      let run = 1;
      for (let i = keys.length - 1; i > 0; i--) { if (dkey(keys[i]) - dkey(keys[i - 1]) === 86400000) run++; else break; }
      if (keys[keys.length - 1] === p.lastDay) p.streak = run;
      p.bestStreak = Math.max(p.bestStreak || 0, p.streak || 0, run);
    }
    return p;
  }

  /** Junta dois progressos. Nunca perde lição feita, XP ou revisão. */
  function merge(a, b) {
    a = migrate(clone(a), 'x-a'); b = migrate(clone(b), 'x-b');
    const newer = (a._u || 0) >= (b._u || 0) ? a : b;
    const out = clone(newer);
    out.done = {};
    for (const k of new Set([...Object.keys(a.done), ...Object.keys(b.done)])) {
      const x = a.done[k], y = b.done[k];
      out.done[k] = x && y ? { at: Math.min(x.at || Infinity, y.at || Infinity), xp: Math.max(x.xp || 0, y.xp || 0) } : clone(x || y);
    }
    out.srs = {};
    for (const k of new Set([...Object.keys(a.srs), ...Object.keys(b.srs)])) {
      const x = a.srs[k], y = b.srs[k];
      out.srs[k] = clone(!x ? y : !y ? x : ((x.at || 0) !== (y.at || 0) ? ((x.at || 0) > (y.at || 0) ? x : y) : ((x.seen || 0) >= (y.seen || 0) ? x : y)));
    }
    out.mastery = {};
    for (const k of new Set([...Object.keys(a.mastery), ...Object.keys(b.mastery)])) {
      const x = a.mastery[k], y = b.mastery[k];
      if (!x || !y) { out.mastery[k] = clone(x || y); continue; }
      const n = (x.at || 0) >= (y.at || 0) ? x : y;
      out.mastery[k] = { best: Math.max(x.best || 0, y.best || 0), last: n.last, at: n.at };
    }
    out.xd = {};
    for (const k of new Set([...Object.keys(a.xd), ...Object.keys(b.xd)])) out.xd[k] = Math.max(a.xd[k] || 0, b.xd[k] || 0);
    out.dd = {};
    for (const k of new Set([...Object.keys(a.dd), ...Object.keys(b.dd)])) {
      const x = a.dd[k] || {}, y = b.dd[k] || {}, o = (out.dd[k] = {});
      for (const d of new Set([...Object.keys(x), ...Object.keys(y)])) {
        const u = x[d] || {}, v = y[d] || {};
        o[d] = { xp: Math.max(u.xp || 0, v.xp || 0), lessons: Math.max(u.lessons || 0, v.lessons || 0) };
      }
    }
    out.bestStreak = Math.max(a.bestStreak || 0, b.bestStreak || 0);
    out.lastDay = [a.lastDay, b.lastDay].filter(Boolean).sort().pop() || null;
    out._u = Math.max(a._u || 0, b._u || 0);
    return derive(out);
  }

  function mergeCode(local, remoteList) {
    let added = 0;
    for (const c of remoteList || []) {
      if (!c || !c.lesson) continue;
      const mine = local[c.lesson];
      if (!mine || (c.at || 0) > (mine.at || 0)) { local[c.lesson] = clone(c); added++; }
    }
    return added;
  }

  const sig = (p) => JSON.stringify([p.xp, Object.keys(p.done).length, Object.keys(p.srs || {}).length, p.streak, p.bestStreak, Object.keys(p.mastery || {}).length]);

  let running = null;
  /** Puxa os outros aparelhos, junta, salva aqui e envia a linha deste aparelho. */
  function syncNow(store) {
    if (running) return running;
    running = (async () => {
      const cloud = TD.cloud;
      const u = cloud && cloud.user();
      if (!u) throw Object.assign(new Error('Entre na sua conta primeiro.'), { code: 'signed_out' });
      const dev = deviceId();
      const st = store.state;
      migrate(st.progress, dev);
      const before = sig(st.progress);
      const rows = await cloud.rest(TABLE + '?select=device_id,name,updated_at,data&user_id=eq.' + encodeURIComponent(u.id));
      let progress = st.progress; let codes = 0; const others = [];
      for (const r of rows || []) {
        if (r.device_id === dev) continue;
        let data = null; try { data = JSON.parse(r.data); } catch (e) { continue; }
        if (!data || !data.progress || typeof data.progress.xp !== 'number') continue;
        progress = merge(progress, data.progress);
        codes += mergeCode(st.code, data.code);
        others.push({ name: r.name, at: r.updated_at });
      }
      // os ids temporários usados quando um lado ainda não tinha livro-caixa somem
      for (const t of ['x-a', 'x-b']) { if (progress.xd) delete progress.xd[t]; if (progress.dd) delete progress.dd[t]; }
      derive(progress);
      const changed = sig(progress) !== before || codes > 0;
      st.progress = progress;
      if (changed) {
        await store.saveProgress();
        for (const c of Object.values(st.code)) if (c && c.lesson) await store.saveCode(c.lesson);
      }
      const payload = JSON.stringify({ v: 1, app: 'trilha-dev', progress: st.progress, code: Object.values(st.code) });
      await cloud.rest(TABLE + '?on_conflict=user_id,device_id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: { device_id: dev, name: deviceName(), updated_at: new Date().toISOString(), data: payload }
      });
      const info = { at: Date.now(), devices: others.length + 1, others, changed };
      try { ls().setItem('td-sync-last', JSON.stringify(info)); } catch (e) { /* */ }
      return info;
    })();
    return running.finally(() => { running = null; });
  }
  async function wipe() {
    const u = TD.cloud.user(); if (!u) return;
    await TD.cloud.rest(TABLE + '?user_id=eq.' + encodeURIComponent(u.id), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  }
  const lastInfo = () => { try { return JSON.parse(ls().getItem('td-sync-last') || 'null'); } catch (e) { return null; } };

  TD.sync = { TABLE, deviceId, deviceName, migrate, ledger, derive, merge, mergeCode, syncNow, wipe, lastInfo };
})(globalThis.TD = globalThis.TD || {});
