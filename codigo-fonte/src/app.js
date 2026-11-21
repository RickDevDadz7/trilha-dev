/* Overclock — interface. Depende de: TD.courses (conteúdo), TD.store, TD.runners, TD.local. */
(function (TD) {
  'use strict';
  const COURSES = TD.courses || [];
  const byId = Object.fromEntries(COURSES.map((c) => [c.id, c]));
  const XP = { quiz: 5, code: 10, clean: 5, lesson: 10, review: 5, reviewItem: 3, reviewDone: 5, checkpoint: 20 };
  const RANKS = [
    [0, 'Novato'], [150, 'Script Kiddie'], [400, 'Codificador de Rua'], [800, 'Hacker de Aluguel'],
    [1400, 'Engenheiro de Campo'], [2200, 'Arquiteto de Sistemas'], [3200, 'Fantasma da Rede'], [4500, 'Lenda Viva']
  ];
  const app = document.getElementById('app');
  const now = () => Date.now();
  const S = { caps: {}, store: null, mode: 'device', lesson: null, editor: null, view: { name: 'home' }, booted: false };

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };
  const fmtDate = (t) => new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  function inline(s) {
    return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
  function md(src) {
    const out = [];
    String(src).split(/(?:```|~~~)[a-z]*\n?/).forEach((part, i) => {
      if (i % 2 === 1) { out.push(`<pre><code>${esc(part.replace(/\n$/, ''))}</code></pre>`); return; }
      part.split(/\n{2,}/).forEach((block) => {
        const b = block.trim(); if (!b) return;
        const lines = b.split('\n');
        if (lines.every((l) => /^\s*-\s+/.test(l))) out.push('<ul>' + lines.map((l) => `<li>${inline(l.replace(/^\s*-\s+/, ''))}</li>`).join('') + '</ul>');
        else if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) out.push('<ol>' + lines.map((l) => `<li>${inline(l.replace(/^\s*\d+\.\s+/, ''))}</li>`).join('') + '</ol>');
        else out.push(`<p>${lines.map(inline).join('<br>')}</p>`);
      });
    });
    return `<div class="md">${out.join('')}</div>`;
  }
  let toastTimer = null;
  function toast(msg) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = h(`<div class="toast" role="status">${esc(msg)}</div>`);
    document.body.appendChild(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 4200);
  }
  function log(level, msg) { if (level === 'error') console.error('[trilha]', msg); }

  const ICON = {
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    play: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4v16l14-8z"/></svg>',
    check: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" aria-hidden="true"><path d="M5 12.5 10 17 19 7.5"/></svg>',
    lock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><rect x="5" y="11" width="14" height="9"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    spark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>',
    trophy: '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3a3 3 0 0 1-3 4M7 5H4a3 3 0 0 0 3 4"/></svg>'
  };

  /* ---------- estado derivado ---------- */
  const P = () => S.store.state.progress;
  const allLessons = (c) => c.units.flatMap((u) => u.lessons);
  const courseDone = (c) => allLessons(c).filter((l) => P().done[l.id]).length;
  const coursePct = (c) => Math.round((courseDone(c) / Math.max(1, allLessons(c).length)) * 100);
  // Lições em sequência: cada uma abre quando a anterior é concluída.
  const isUnlocked = (c, lesson) => {
    if (P().done[lesson.id]) return true;
    const ls = allLessons(c); const i = ls.findIndex((l) => l.id === lesson.id);
    return i === 0 || !!P().done[ls[i - 1].id];
  };
  const unitDone = (c, ui) => c.units[ui].lessons.every((l) => P().done[l.id]);
  // próxima lição pendente da trilha
  function nextTarget(c) {
    const pending = allLessons(c).find((l) => !P().done[l.id]);
    return pending && isUnlocked(c, pending) ? pending : null;
  }
  const nextLesson = (c) => nextTarget(c);
  const liveStreak = () => (P().lastDay === dayKey() || P().lastDay === yesterday() ? P().streak : 0);
  const todayXP = () => (P().days[dayKey()] || {}).xp || 0;
  const goal = () => P().settings.goal || 30;
  function rankOf(xp) {
    let i = 0; while (i + 1 < RANKS.length && xp >= RANKS[i + 1][0]) i++;
    const cur = RANKS[i], nxt = RANKS[i + 1];
    return { level: i + 1, name: cur[1], next: nxt ? nxt[0] : null, base: cur[0], pct: nxt ? Math.round(((xp - cur[0]) / (nxt[0] - cur[0])) * 100) : 100 };
  }
  const tutorAvailable = () => !!(S.caps.sample);
  const sfx = (n, a) => TD.sfx && TD.sfx.play(n, a);

  /* ---------- salvamento ---------- */
  function renderSaveState() {
    const el = document.getElementById('save-state'); if (!el) return;
    const n = S.store.pendingN;
    const where = { db: 'na sua conta Claude', native: 'no seu PC', device: 'neste navegador', local: 'neste navegador' }[S.mode];
    el.className = 'save-state' + (n ? ' busy' : S.store.lastError ? ' err' : '');
    el.textContent = n ? 'salvando...' : S.store.lastError ? 'erro ao salvar, tentando de novo' : 'salvo ' + where;
  }
  function saveProgress() { const r = S.store.saveProgress().catch(() => {}); scheduleSync(); return r; }

  /* ---------- conta e sincronização ---------- */
  const cloudOn = () => !!(TD.cloud && TD.cloud.available() && S.mode !== 'db');
  let syncTimer = null;
  function scheduleSync(ms = 4000) {
    if (!cloudOn() || !TD.cloud.user()) return;
    clearTimeout(syncTimer); syncTimer = setTimeout(() => runSync(false), ms);
  }
  async function runSync(manual) {
    if (!cloudOn() || !TD.cloud.user()) return null;
    S.syncing = true; if (manual) refreshAccount();
    try {
      await S.store.flush();
      const info = await TD.sync.syncNow(S.store);
      S.syncError = null;
      if (info.changed && !S.lesson) render();
      if (manual) toast(info.changed ? 'Sincronizado: progresso dos outros aparelhos trazido.' : 'Tudo em dia.');
      return info;
    } catch (e) {
      S.syncError = e.message;
      if (manual) toast(e.message);
      log('warn', 'sync: ' + (e.code || e.message));
      return null;
    } finally { S.syncing = false; refreshAccount(); }
  }
  /* ---------- tela de login (como no Stempel e no RONIN) ---------- */
  const isGuest = () => { try { return localStorage.getItem('td-guest') === '1'; } catch (e) { return false; } };
  const needsLogin = () => cloudOn() && !TD.cloud.user() && !isGuest();
  const GOOGLE_SVG = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>';
  const EYE_ON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>';
  function loginHTML() {
    const A = S.auth || (S.auth = { tab: 'in', email: '', msg: null, confirm: false });
    const desktop = !!window.tdNative;
    const google = S.google && !desktop && A.tab !== 'rec';
    return `<div class="auth-screen">
      <div class="auth-brand"><span class="brand-mark auth-mark" aria-hidden="true"><svg width="72" height="72" viewBox="0 0 512 512"><path d="M56 56 H400 L456 112 V456 H112 L56 400 Z" fill="#ff3ea5"/><polyline points="214,166 132,256 214,346" fill="none" stroke="#0b0510" stroke-width="42" stroke-linecap="square"/><polyline points="298,166 380,256 298,346" fill="none" stroke="#0b0510" stroke-width="42" stroke-linecap="square"/><rect x="24" y="226" width="210" height="20" fill="#00e5ff"/><rect x="300" y="300" width="188" height="14" fill="#ffffff"/></svg></span><div class="auth-name">Over<b>clock</b></div><p>Aprenda a programar do zero ao avançado.</p></div>
      <form class="auth-card cut" id="auth-form" novalidate>
        ${A.tab === 'rec' ? '<h2>Recuperar senha</h2>' : `<div class="seg auth-tabs" role="tablist"><button type="button" class="${A.tab === 'in' ? 'on' : ''}" data-act="auth-tab" data-authtab="in">Entrar</button><button type="button" class="${A.tab === 'up' ? 'on' : ''}" data-act="auth-tab" data-authtab="up">Criar conta</button></div>`}
        ${google ? `<button type="button" class="btn auth-google" data-act="auth-google"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg> Continuar com Google</button><div class="or-sep"><span>ou</span></div>` : ''}
        <input id="auth-email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="E-mail" aria-label="E-mail" value="${esc(A.email || '')}">
        ${A.tab === 'rec' ? '<p class="auth-hint">Enviamos um link pro seu e-mail pra criar uma senha nova.</p>' : `<div class="pass-wrap"><input id="auth-pass" type="password" autocomplete="${A.tab === 'up' ? 'new-password' : 'current-password'}" placeholder="${A.tab === 'up' ? 'Senha (mín. 8 caracteres)' : 'Senha'}" aria-label="Senha"><button type="button" class="eye" data-act="auth-eye" aria-label="Mostrar senha" aria-pressed="false">${EYE_OFF}</button></div>`}
        ${A.msg ? `<div class="auth-msg ${A.msg.ok ? 'ok' : 'bad'}">${esc(A.msg.text)}</div>` : ''}
        <button type="submit" class="btn primary auth-go" ${A.busy ? 'disabled' : ''}>${A.busy ? 'Aguarde...' : A.tab === 'up' ? 'Criar conta' : A.tab === 'rec' ? 'Enviar link' : 'Entrar'}</button>
        <div class="auth-links">${A.tab === 'rec' ? '<button type="button" class="linkbtn" data-act="auth-tab" data-authtab="in">← Voltar</button>' : A.tab === 'in' ? '<button type="button" class="linkbtn" data-act="auth-tab" data-authtab="rec">Esqueci minha senha</button>' : ''}${A.confirm ? '<button type="button" class="linkbtn" data-act="auth-resend">Reenviar confirmação</button>' : ''}</div>
        ${desktop ? '<p class="auth-hint">No PC, entre com e-mail e senha.</p>' : ''}
      </form>
      <button class="linkbtn auth-guest" data-act="auth-guest">Continuar sem conta</button>
    </div>`;
  }
  async function authSubmit() {
    const A = S.auth; if (!A || A.busy) return;
    A.email = (document.getElementById('auth-email') || {}).value || '';
    const pass = (document.getElementById('auth-pass') || {}).value || '';
    A.busy = true; A.msg = null; render();
    try {
      if (A.tab === 'rec') { await TD.cloud.recover(A.email); A.msg = { ok: true, text: 'Pronto! Abra o link que chegou no seu e-mail (veja também o spam) pra criar a senha nova.' }; }
      else if (A.tab === 'up') {
        const r = await TD.cloud.signUp(A.email, pass);
        if (r.confirm) { A.confirm = true; A.tab = 'in'; A.msg = { ok: true, text: 'Conta criada! Abra o link de confirmação que chegou no seu e-mail (veja o spam) e depois toque em Entrar.' }; }
        else { A.busy = false; return afterLogin(); }
      } else { await TD.cloud.signIn(A.email, pass); A.busy = false; return afterLogin(); }
    } catch (e) {
      A.msg = { ok: false, text: e.message };
      if (e.code === 'email_not_confirmed') A.confirm = true;
    }
    A.busy = false; render();
  }
  async function afterLogin() {
    S.auth = null;
    try { localStorage.removeItem('td-guest'); } catch (e) { /* */ }
    try { history.replaceState(null, '', location.pathname + location.search + '#'); } catch (e) { location.hash = ''; }
    S.view = { name: 'home' }; render();
    await runSync(false);
    render();
  }
  async function authAction(act, t) {
    const A = S.auth || (S.auth = { tab: 'in' });
    if (act === 'auth-tab') { A.email = (document.getElementById('auth-email') || {}).value || A.email; A.tab = t.getAttribute('data-authtab'); A.msg = null; render(); return; }
    if (act === 'auth-eye') {
      const i = document.getElementById('auth-pass'); if (!i) return;
      const show = i.type === 'password'; i.type = show ? 'text' : 'password';
      t.innerHTML = show ? EYE_ON : EYE_OFF; t.setAttribute('aria-pressed', String(show)); t.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
      i.focus(); return;
    }
    if (act === 'auth-google') { TD.cloud.signInWithGoogle(); return; }
    if (act === 'auth-guest') { try { localStorage.setItem('td-guest', '1'); } catch (e) { /* */ } S.auth = null; location.hash = ''; route(); return; }
    if (act === 'auth-resend') { try { await TD.cloud.resend((document.getElementById('auth-email') || {}).value || A.email); A.msg = { ok: true, text: 'Enviamos de novo. Confira a caixa de entrada e o spam.' }; } catch (e) { A.msg = { ok: false, text: e.message }; } render(); }
  }

  function refreshAccount() { const box = document.getElementById('account-card'); if (box) box.outerHTML = accountHTML(); }
  function accountHTML() {
    if (!TD.cloud) return '';
    if (!cloudOn()) {
      return `<div class="card cut" id="account-card"><span class="hud">Conta</span><h3>Sincronização</h3><p>${S.mode === 'db' ? 'Dentro do Claude o progresso já fica salvo na sua conta Claude.' : 'Indisponível aqui.'} Pra sincronizar o celular e o PC, use o app instalado ou o site <strong>rickdevdadz7.github.io/trilha-dev</strong>. Pra levar o progresso daqui pra lá, use Exportar/Restaurar backup.</p></div>`;
    }
    const u = TD.cloud.user();
    const desktop = !!window.tdNative;
    if (!u) {
      return `<div class="card cut" id="account-card"><span class="hud">Conta</span><h3>Sem conta conectada</h3>
        <p>Seu progresso está só neste aparelho. Entre na conta pra salvar na nuvem e juntar o celular e o PC. É a mesma conta do Stempel e do RONIN.</p>
        <div class="row"><a class="btn primary" href="#login">Entrar ou criar conta</a></div></div>`;
    }
    const last = TD.sync.lastInfo();
    const when = last ? new Date(last.at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'ainda não';
    return `<div class="card cut" id="account-card"><span class="hud">Conta</span><h3>${esc(u.email || 'Conectado')}</h3>
      <p>Sincroniza sozinho ao abrir, ao terminar lições e a cada 10 minutos.</p>
      <p class="dim-note">Última sincronização: ${esc(when)}${last ? ` · ${last.devices} aparelho${last.devices > 1 ? 's' : ''}` : ''}${S.syncError ? `<br><span style="color:var(--magenta)">${esc(S.syncError)}</span>` : ''}</p>
      ${S.recovery ? `<div class="field"><label for="cloud-newpass">Nova senha</label><input id="cloud-newpass" type="password" autocomplete="new-password" placeholder="mínimo 8 caracteres"></div><div class="row"><button class="btn primary" data-act="cloud-newpass">Salvar senha</button></div>` : ''}
      <div class="row"><button class="btn primary" data-act="cloud-sync" ${S.syncing ? 'disabled' : ''}>${S.syncing ? 'Sincronizando...' : 'Sincronizar agora'}</button><button class="btn ghost" data-act="cloud-pass-show">Definir senha</button><button class="btn ghost" data-act="cloud-signout">Sair</button></div></div>`;
  }
  async function cloudAction(act) {
    const msg = (t) => { const m = document.getElementById('cloud-msg'); if (m) m.textContent = t; else toast(t); };
    const email = () => (document.getElementById('cloud-email') || {}).value || '';
    const pass = () => (document.getElementById('cloud-pass') || {}).value || '';
    try {
      if (act === 'cloud-google') { TD.cloud.signInWithGoogle(); return; }
      if (act === 'cloud-signin') { msg('Entrando...'); await TD.cloud.signIn(email(), pass()); refreshAccount(); await runSync(false); return; }
      if (act === 'cloud-signup') { msg('Criando...'); const r = await TD.cloud.signUp(email(), pass()); if (r.confirm) msg('Conta criada! Abra o link que chegou no seu e-mail (veja o spam) e depois clique em Entrar.'); else { refreshAccount(); await runSync(true); } return; }
      if (act === 'cloud-recover') { await TD.cloud.recover(email()); msg('Enviamos um link pro seu e-mail pra criar uma senha nova.'); return; }
      if (act === 'cloud-sync') { await runSync(true); return; }
      if (act === 'cloud-pass-show') { S.recovery = true; refreshAccount(); return; }
      if (act === 'cloud-newpass') { await TD.cloud.updatePassword((document.getElementById('cloud-newpass') || {}).value || ''); S.recovery = false; toast('Senha salva. Agora dá pra entrar com e-mail e senha também.'); refreshAccount(); return; }
      if (act === 'cloud-signout') {
        // 1) garante que tudo está na nuvem antes de apagar daqui
        const ok = await runSync(false);
        if (!ok) { toast('Não consegui salvar na nuvem (sem internet?). Conecte e tente sair de novo, pra não perder progresso.'); return; }
        await TD.cloud.signOut();
        // 2) apaga o que ficou neste aparelho, pra outra conta começar limpa
        const prefs = P().settings || {};
        await S.store.wipeLocal(now(), { sound: prefs.sound, volume: prefs.volume });
        try { ['td-sync-last', 'td-guest'].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* */ }
        S.auth = null; S.recovery = false;
        toast('Você saiu da conta. Os dados foram apagados deste aparelho e continuam salvos na nuvem.');
        // 3) volta pro começo do app
        if (location.hash.replace('#', '') === '') route(); else location.hash = '';
        return;
      }
    } catch (e) { msg(e.message); }
  }

  /* ---------- roteamento ---------- */
  function route() {
    const id = location.hash.replace('#', '');
    if (S.lesson) closeLesson(false);
    if (byId[id]) S.view = { name: 'course', id };
    else if (id === 'dados') { S.view = { name: 'config' }; S.scrollTo = 'dados'; }
    else if (id === 'config') S.view = { name: 'config' };
    else if (id === 'login') S.view = { name: 'login' };
    else S.view = { name: 'home' };
    if (S.view.name !== 'login' && S.view.name !== 'config' && needsLogin()) S.view = { name: 'login' };
    if (S.view.name === 'login' && cloudOn() && TD.cloud.user()) S.view = { name: 'home' };
    render();
  }

  /* ---------- rail ---------- */
  function railHTML() {
    const p = P(); const r = rankOf(p.xp); const st = liveStreak();
    const gp = Math.min(100, Math.round((todayXP() / goal()) * 100));
    const v = S.view;
    return `
      <aside class="rail" aria-label="Navegação">
        <a class="brand" href="#"><span class="brand-mark" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 512 512"><path d="M56 56 H400 L456 112 V456 H112 L56 400 Z" fill="#ff3ea5"/><polyline points="214,166 132,256 214,346" fill="none" stroke="#0b0510" stroke-width="42" stroke-linecap="square"/><polyline points="298,166 380,256 298,346" fill="none" stroke="#0b0510" stroke-width="42" stroke-linecap="square"/><rect x="24" y="226" width="210" height="20" fill="#00e5ff"/><rect x="300" y="300" width="188" height="14" fill="#ffffff"/></svg></span><span class="brand-name">Over<b>clock</b></span></a>
        <div class="rank cut">
          <span class="hud">Rank ${String(r.level).padStart(2, '0')}</span>
          <div class="who"><strong>${esc(r.name)}</strong><span>${p.xp} XP</span></div>
          <div class="meter"><i style="width:${r.pct}%"></i></div>
          <small>${r.next ? `${r.next - p.xp} XP pro próximo rank` : 'Rank máximo'}</small>
        </div>
        <div class="rail-nav">
          <a class="rail-item ${v.name === 'home' ? 'active' : ''}" href="#"><span class="chip sys">▣</span><span class="mini"><span>Todas as trilhas</span></span></a>
        </div>
        <span class="hud" style="padding:0 8px">Trilhas</span>
        <div class="rail-nav">
          ${COURSES.map((c) => `
            <a class="rail-item ${v.id === c.id ? 'active' : ''}" data-course="${c.id}" href="#${c.id}">
              <span class="chip">${esc(c.badge)}</span>
              <span class="mini"><span>${esc(c.name)}</span><span class="meter"><i style="width:${coursePct(c)}%"></i></span></span>
              <span class="pct">${coursePct(c)}%</span>
            </a>`).join('')}
        </div>
        <span class="hud" style="padding:0 8px">Sistema</span>
        <div class="rail-nav">
          <a class="rail-item ${v.name === 'config' ? 'active' : ''}" href="#config"><span class="chip sys">⚙</span><span class="mini"><span>Configurações</span></span></a>
        </div>
        <div class="stats">
          <div class="stat streak"><b>${st}</b><small>${st === 1 ? 'dia seguido' : 'dias seguidos'}</small></div>
          <div class="stat"><b>${Object.keys(p.done).length}</b><small>lições feitas</small></div>
          <div class="stat goal"><div class="row"><small>Meta do dia</small><small style="font-family:var(--font-mono)">${todayXP()}/${goal()} XP</small></div><div class="meter" style="--accent:var(--cyan)"><i style="width:${gp}%"></i></div></div>
        </div>
        <div class="save-state" id="save-state"></div>
      </aside>
      <nav class="tabbar" aria-label="Navegação">
        <a class="${v.name === 'home' || v.name === 'course' ? 'active' : ''}" href="#"><span>▣</span>Trilhas</a>
        <a href="#" data-start="x:@review"><span>↻</span>Revisão</a>
        <a class="${v.name === 'config' ? 'active' : ''}" href="#config"><span>⚙</span>Config</a>
      </nav>
      <header class="topbar"><span class="brand-name">Over<b>clock</b></span><span class="tb-stat">🔥 ${st}</span><span class="tb-stat">${p.xp} XP</span></header>`;
  }

  /* ---------- home ---------- */
  function backupNudge() {
    if (S.mode === 'db') return '';
    const last = P().settings.lastExport || 0;
    const doneN = Object.keys(P().done).length;
    if (doneN < 3 || now() - last < 7 * 86400000) return '';
    return `<div class="banner warn cut"><div class="grow"><span class="hud" style="color:var(--magenta)">Backup</span><strong>${last ? 'Seu último backup em arquivo tem mais de 7 dias' : 'Você ainda não exportou nenhum backup em arquivo'}</strong></div><a class="btn" href="#dados">Fazer backup</a></div>`;
  }
  function reviewBanner() {
    const due = TD.ped.dueItems(P(), COURSES, now());
    const total = Object.keys(P().srs || {}).length;
    if (!total) return '';
    if (due.length) return `<div class="banner cut review-banner"><div class="grow"><span class="hud" style="color:var(--cyan)">Revisão espaçada</span><strong>Revisão do dia: ${due.length} ${due.length === 1 ? 'item' : 'itens'} pra fixar</strong><span style="color:var(--muted);font-size:14px">Perguntas e exercícios de lições anteriores, misturados. Leva poucos minutos e é o que faz você não esquecer.</span></div><button class="btn primary" data-start="x:@review" style="--accent:var(--cyan)">Revisar agora ${ICON.play}</button></div>`;
    const nd = TD.ped.nextDue(P());
    return `<div class="banner cut review-banner"><div class="grow"><span class="hud" style="color:var(--cyan)">Revisão espaçada</span><strong>Memória em dia</strong><span style="color:var(--muted);font-size:14px">${total} itens no seu ciclo de revisão. Próxima revisão: ${nd ? esc(new Date(nd).toLocaleDateString('pt-BR')) : '-'}.</span></div></div>`;
  }
  const GROUPS = [
    { id: 'code', title: 'Programação', sub: 'Linguagens e ferramentas' },
    { id: 'career', title: 'Carreira', sub: 'Inglês, portfólio, vagas e trabalho fora' }
  ];
  function tileHTML(c) {
    const n = allLessons(c).length, d = courseDone(c), pct = coursePct(c);
    return `
      <button class="course-tile cut" data-course="${c.id}" data-go="${c.id}" title="${esc(c.desc)}">
        <span class="chip lg">${esc(c.badge)}</span>
        <span class="tile-body"><strong>${esc(c.name)}</strong><span class="tag">${esc(c.tagline)}</span>
          <span class="meter"><i style="width:${pct}%"></i></span>
          <span class="meta">${d ? `${d}/${n} lições` : `${n} lições`}${pct ? ` · ${pct}%` : ''}</span></span>
      </button>`;
  }
  function homeHTML() {
    const last = P().last && byId[P().last] ? byId[P().last] : null;
    const nl = last ? nextLesson(last) : null;
    const total = COURSES.reduce((a, c) => a + allLessons(c).length, 0);
    return `
      <div class="page home">
        <header class="page-head compact">
          <span class="hud">Sistema online · ${total} lições carregadas</span>
          <h1 class="glitch">Escolha sua trilha</h1>
          <p>Aprenda a programar do zero ao avançado, com lições curtas, código que roda na hora e revisão que não te deixa esquecer.</p>
        </header>
        ${backupNudge()}
        ${last && nl ? `
          <div class="banner cut" data-course="${last.id}">
            <span class="chip lg">${esc(last.badge)}</span>
            <div class="grow"><span class="hud" style="color:var(--accent)">Continuar missão</span><strong>${esc(last.name)} · ${esc(nl.title)}</strong></div>
            <button class="btn primary" data-start="${last.id}:${nl.id}">Continuar ${ICON.play}</button>
          </div>` : ''}
        ${reviewBanner()}
        ${GROUPS.map((g) => {
          const list = COURSES.filter((c) => (c.group || 'code') === g.id);
          if (!list.length) return '';
          return `<section class="tile-group"><div class="tile-head"><h2>${esc(g.title)}</h2><span class="hud">${esc(g.sub)}</span></div>
            <div class="tile-grid">${list.map(tileHTML).join('')}</div></section>`;
        }).join('')}
      </div>`;
  }

  /* ---------- mapa da trilha ---------- */

  const OFFS = [0, 60, 90, 60, 0, -60, -90, -60];
  function courseHTML(c) {
    const nl = nextLesson(c);
    const n = allLessons(c).length, d = courseDone(c);
    let idx = 0, num = 0;
    return `
      <div class="page" data-course="${c.id}">
        <div class="course-head">
          <span class="chip lg">${esc(c.badge)}</span>
          <div class="grow"><span class="hud" style="color:var(--accent)">${esc(c.tagline)}</span><h1 class="glitch">${esc(c.name)}</h1><p>${esc(c.desc)}</p></div>
        </div>
        <div class="course-layout">
          <div class="units">
            ${c.units.map((u, ui) => {
              const ud = u.lessons.filter((l) => P().done[l.id]).length;
              return `
              <section>
                <div class="unit-banner cut ${ud === u.lessons.length ? 'done' : ''}"><div><small>Módulo ${String(ui + 1).padStart(2, '0')}</small><h2>${esc(u.title)}</h2></div><span class="count">${ud}/${u.lessons.length}</span></div>
                <div class="path">
                  ${u.lessons.map((l) => {
                    const off = OFFS[idx++ % OFFS.length]; num++;
                    const un = isUnlocked(c, l), dn = !!P().done[l.id], cur = nl && nl.id === l.id;
                    const codeN = l.steps.filter((s) => s.t === 'code').length;
                    return `
                    <div class="node-wrap ${un ? '' : 'locked'}" style="transform:translateX(${off}px);--off:${off}">
                      <span class="hex-ring ${cur && un ? 'current' : ''}">
                        <button class="node ${dn ? 'done' : un ? '' : 'locked'}" ${un ? `data-start="${c.id}:${l.id}"` : 'disabled'} aria-label="${esc(l.title)}${un ? '' : ' (bloqueada)'}">${dn ? ICON.check : un ? num : ICON.lock}</button>
                      </span>
                      <div class="node-label"><strong>${esc(l.title)}</strong><small>${dn ? 'completa · revisar' : un ? (cur ? 'próxima missão' : 'disponível') : 'bloqueada'} · ${l.steps.length} etapas${codeN ? ` · ${codeN} código` : ''}</small></div>
                    </div>`;
                  }).join('')}
                </div>
              </section>`;
            }).join('')}
          </div>
          <aside class="side">
            <div class="card cut">
              <span class="hud">${nl ? 'Próxima missão' : 'Trilha completa'}</span>
              <h3>${nl ? esc(nl.title) : 'Você zerou essa trilha'}</h3>
              <p>${d}/${n} lições · ${coursePct(c)}%</p>
              <div class="meter"><i style="width:${coursePct(c)}%"></i></div>
              ${nl ? `<button class="btn primary" data-start="${c.id}:${nl.id}">${d ? 'Continuar' : 'Começar'} ${ICON.play}</button>` : ''}
            </div>
            ${c.notes ? `<div class="card cut"><span class="hud">Briefing</span>${md(c.notes)}</div>` : ''}
            <div class="card cut"><span class="hud">Método Overclock</span><p>Teoria em pedaços curtos, quiz pra puxar da memória, exercício com a teoria à mão e modo guiado com blocos. E a Revisão do dia traz de volta o que você estudou, no tempo certo pra não esquecer.</p></div>
          </aside>
        </div>
      </div>`;
  }

  /* ---------- dados e backups ---------- */
  function dataCardsHTML() {
    const where = {
      db: 'Banco privado da sua conta no Claude. Só você acessa.',
      native: 'Arquivo no seu PC, com uma cópia automática por dia (guarda as 14 mais recentes).',
      device: 'Armazenamento deste navegador. Exporte backups em arquivo de vez em quando.',
      local: 'Armazenamento deste navegador (o banco do Claude não respondeu). Exporte um backup.'
    }[S.mode];
    const last = P().settings.lastExport;
    return `
          <div class="card cut" id="dados">
            <span class="hud">Onde está salvo</span>
            <h3>${esc({ db: 'Conta Claude', native: 'Programa de PC', device: 'Navegador', local: 'Navegador' }[S.mode])}</h3>
            <p>${esc(where)}</p>
            ${window.tdNative && window.tdNative.openDataFolder ? '<div class="row"><button class="btn sm" data-act="open-folder">Abrir pasta de dados</button></div>' : ''}
          </div>
          <div class="card cut">
            <span class="hud">Backup em arquivo</span>
            <h3>Exportar e restaurar</h3>
            <p>${last ? 'Último backup exportado: ' + esc(fmtDate(last)) : 'Nenhum backup exportado ainda.'}</p>
            <div class="row">
              <button class="btn primary" data-act="export">Exportar backup (JSON)</button>
              <button class="btn" data-act="copy-json">Copiar JSON</button>
              <label class="btn">Restaurar de arquivo<input type="file" id="imp-file" accept=".json,application/json" class="sr"></label>
            </div>
            <div id="restore-box"></div>
          </div>
          <div class="card cut" style="grid-column:1/-1">
            <span class="hud">Backups automáticos</span>
            <h3>Cópias semanais</h3>
            <p>Toda semana o app guarda uma cópia do progresso dentro do próprio armazenamento (as 4 mais recentes).</p>
            <div class="list" id="auto-list"><div class="list-item"><span class="grow"><small>Carregando...</small></span></div></div>
          </div>
`;
  }
  async function fillAutoBackups() {
    const box = document.getElementById('auto-list'); if (!box) return;
    try {
      const list = await S.store.listBackups();
      box.innerHTML = list.length ? list.map((b) => `<div class="list-item"><span class="grow">Semana ${esc(b.id)}<small>${esc(fmtDate(b.at))} · ${(b.size / 1024).toFixed(1)} KB</small></span><button class="btn sm" data-restore-auto="${esc(b.id)}">Restaurar</button></div>`).join('')
        : '<div class="list-item"><span class="grow"><small>Nenhuma cópia ainda. A primeira é feita quando você tiver lições completas.</small></span></div>';
      box._list = list;
    } catch (e) { box.innerHTML = '<div class="list-item"><span class="grow"><small>Não consegui ler as cópias agora.</small></span></div>'; }
  }
  function exportJSON() { return JSON.stringify(S.store.exportData(now(), TD.contentVersion)); }
  async function doExport() {
    const name = 'overclock-backup-' + dayKey() + '.json';
    const data = exportJSON();
    if (S.caps.downloads) {
      try { await S.caps.downloads.save({ filename: name, data }); P().settings.lastExport = now(); await saveProgress(); toast('Backup salvo: ' + name); render(); return; }
      catch (e) { if (e && e.code === 'dismissed') return; }
    }
    try { await navigator.clipboard.writeText(data); P().settings.lastExport = now(); await saveProgress(); toast('Download indisponível aqui: o JSON foi copiado. Cole num arquivo .json pra guardar.'); render(); }
    catch (e) { toast('Não foi possível exportar daqui.'); }
  }
  function askRestore(obj, label) {
    const box = document.getElementById('restore-box'); if (!box) return;
    const err = TD.store.validateBackup(obj);
    if (err) { box.innerHTML = `<p style="color:var(--bad)">${esc(err)}</p>`; return; }
    const n = Object.keys(obj.data.progress.done || {}).length;
    box.innerHTML = `<div class="banner warn"><div class="grow"><strong>Restaurar ${esc(label)}?</strong><span style="color:var(--muted);font-size:14px">${n} lições completas, ${obj.data.progress.xp} XP. O progresso atual será substituído.</span></div><button class="btn sm" data-act="restore-no">Cancelar</button><button class="btn sm danger" data-act="restore-yes">Restaurar</button></div>`;
    box._obj = obj;
    box.scrollIntoView({ block: 'nearest' });
  }
  async function doRestore() {
    const box = document.getElementById('restore-box'); const obj = box && box._obj; if (!obj) return;
    try { await S.store.importData(obj, now()); await S.store.flush(); toast('Backup restaurado e verificado.'); render(); }
    catch (e) { toast('Falha ao restaurar: ' + e.message); }
  }

  /* ---------- configurações ---------- */
  function configHTML() {
    const st = P().settings; const ai = TD.local ? TD.local.aiSettings() : {};
    const inClaude = !!window.claude;
    return `
      <div class="page">
        <header class="page-head"><span class="hud">Sistema · ajustes</span><h1 class="glitch">Configurações</h1></header>
        <div class="grid2">
          <div class="card cut">
            <span class="hud">Ritmo</span><h3>Meta diária</h3>
            <div class="field"><label for="cfg-goal">XP por dia</label>
              <select id="cfg-goal">${[20, 30, 50, 80].map((g) => `<option value="${g}" ${goal() === g ? 'selected' : ''}>${g} XP · ${{ 20: 'leve', 30: 'normal', 50: 'puxado', 80: 'insano' }[g]}</option>`).join('')}</select></div>
          </div>
          <div class="card cut">
            <span class="hud">Áudio</span><h3>Efeitos sonoros</h3>
            <label class="toggle"><input type="checkbox" id="cfg-sound" ${st.sound !== false ? 'checked' : ''}> Sons da interface ligados</label>
            <div class="field"><label for="cfg-volume">Volume</label><input id="cfg-volume" type="range" min="0" max="100" step="5" value="${Math.round((st.volume ?? 0.6) * 100)}"></div>
          </div>
          <div class="card cut">
            <span class="hud">Tutor de IA</span><h3>${inClaude ? 'Usando o Claude da sua conta' : 'Chave da API (opcional)'}</h3>
            ${inClaude ? '<p>Dentro do Claude o tutor usa a sua conta, sem configuração. Na primeira pergunta ele pede sua permissão.</p>' : `
            <p>Fora do Claude, o tutor usa a API da Anthropic com a <strong>sua</strong> chave (cobrada por uso, separada da assinatura). Crie em console.anthropic.com → API Keys. A chave fica só neste aparelho e nunca entra nos backups.</p>
            <div class="field"><label for="cfg-key">API key</label><input id="cfg-key" type="password" autocomplete="off" placeholder="sk-ant-..." value="${esc(ai.key || '')}"></div>
            <div class="row"><button class="btn primary" data-act="save-key">Salvar e testar</button>${ai.key ? '<button class="btn ghost" data-act="clear-key">Remover chave</button>' : ''}</div>`}
          </div>
          ${accountHTML()}
          ${dataCardsHTML()}
          <div class="card cut">
            <span class="hud" style="color:var(--magenta)">Zona de risco</span><h3>Zerar progresso</h3>
            <p>Apaga XP, sequência e lições feitas. Faça um backup antes.</p>
            <div class="row"><button class="btn danger" data-act="reset-ask">Zerar tudo</button></div>
            <div id="reset-box"></div>
          </div>
          <div class="card cut">
            <span class="hud">Versão</span><h3>Overclock</h3>
            <p>Conteúdo ${esc(TD.contentVersion || '')} · ${COURSES.reduce((a, c) => a + allLessons(c).length, 0)} lições · ${COURSES.reduce((a, c) => a + allLessons(c).reduce((b, l) => b + l.steps.filter((s) => s.t === 'code').length, 0), 0)} exercícios de código.</p>
          </div>
        </div>
      </div>`;
  }

  /* ---------- player de lição (Método Overclock: ver pedagogy.js e PEDAGOGIA.md) ---------- */
  const isAsk = (s) => s && (s.t === 'quiz' || s.t === 'predict');
  function findLesson(cid, lid) { const c = byId[cid]; const l = c && allLessons(c).find((x) => x.id === lid); return l ? { c, l } : null; }
  function newLessonState(c, lesson, kind) {
    return { c, lesson, kind, i: 0, earned: 0, correct: 0, graded: 0, results: {}, review: kind === 'lesson' && !!P().done[lesson.id], phase: 'step', d: {} };
  }
  function startLesson(cid, lid) {
    if (lid === '@review') return startReview();
    const c = byId[cid]; if (!c) return;
    if (lid && lid.startsWith('@cp')) {
      const ui = Number(lid.slice(3));
      const cp = TD.ped.checkpointLesson(c, ui, String(now()));
      if (!cp) return;
      cp.steps = cp.steps.map((s) => Object.assign(s, { _c: c }));
      S.lesson = newLessonState(c, cp, 'checkpoint');
      renderLesson(); return;
    }
    const f = findLesson(cid, lid); if (!f) return;
    P().last = cid; saveProgress();
    S.lesson = newLessonState(f.c, f.l, 'lesson');
    renderLesson();
  }
  function startReview() {
    const items = TD.ped.dueItems(P(), COURSES, now());
    if (!items.length) { toast('Nada pra revisar agora.'); return; }
    const steps = items.map((it) => Object.assign({}, it.step, { _c: it.c, _from: it.key, _fromTitle: it.l.title, _blocks: it.step.t === 'code' }));
    const lesson = { id: '@review', title: 'Revisão do dia', steps };
    S.lesson = newLessonState(items[0].c, lesson, 'review');
    renderLesson();
  }
  function closeLesson(rerender = true) { S.lesson = null; S.editor = null; if (rerender) render(); }
  const courseOf = (ls, step) => (step && step._c) || ls.c;
  function stepRunner(c, step) { return step.runner || c.runner; }
  function stepsBar(ls) { return `<div class="steps-bar" aria-hidden="true">${ls.lesson.steps.map((_, i) => `<i class="${i < ls.i || ls.phase === 'complete' ? 'on' : i === ls.i ? 'now' : ''}"></i>`).join('')}</div>`; }
  function sourceLesson(step, ls) {
    if (step._from) { const f = TD.ped && step._c ? allLessons(step._c).find((l) => l.id === step._from.split('#')[0]) : null; return f || null; }
    return ls.lesson;
  }
  function theoryHTML(step, ls) {
    const src = sourceLesson(step, ls); if (!src) return '';
    const learns = src.steps.filter((s) => s.t === 'learn'); if (!learns.length) return '';
    return `<details class="theory"${ls.d.theoryOpen ? ' open' : ''}><summary>Revisar a teoria${step._fromTitle ? ': ' + esc(step._fromTitle) : ' desta lição'}</summary>${learns.map((s) => `<h4>${esc(s.title)}</h4>${md(s.body)}`).join('')}</details>`;
  }

  function renderLesson() {
    const ls = S.lesson; app.className = 'app in-lesson';
    const step = ls.lesson.steps[ls.i];
    const c = courseOf(ls, step);
    const label = ls.kind === 'review' ? 'Revisão do dia' : ls.kind === 'checkpoint' ? ls.lesson.title : ls.lesson.title;
    const top = `<div class="lesson-top"><button class="icon-btn" data-act="quit" aria-label="Sair">${ICON.close}</button><span class="title">${esc(label)}</span>${stepsBar(ls)}<span class="xp-chip">+${ls.earned} XP</span></div>`;
    let body = '', foot = '';
    if (ls.phase === 'complete') {
      body = completeHTML(ls);
      foot = `<div class="lesson-foot"><div class="msg"></div><button class="btn" data-act="back">${ls.kind === 'review' ? 'Voltar ao início' : 'Voltar ao mapa'}</button>${ls.nextStart ? `<button class="btn primary" data-start="${ls.nextStart}">${ls.nextLabel || 'Próxima lição'} ${ICON.play}</button>` : ''}</div>`;
    } else if (step.t === 'learn') {
      const chunks = TD.ped.chunkBody(step.body);
      const shown = Math.min(ls.d.shown || 1, chunks.length);
      const more = shown < chunks.length;
      body = `<div class="reading"><span class="hud" style="color:var(--accent)">Briefing${chunks.length > 1 ? ` · parte ${shown}/${chunks.length}` : ''}</span><h2>${esc(step.title)}</h2>${chunks.slice(0, shown).map((ch, k) => `<div class="card-chunk${k === shown - 1 && k > 0 ? ' fresh' : ''}" id="chunk-${k}">${md(ch)}</div>`).join('')}</div>`;
      foot = `<div class="lesson-foot"><div class="msg"><span>${more ? 'Leia este pedaço e continue quando entender.' : 'Fechou a ideia? Bora praticar.'}</span></div><button class="btn primary" data-act="${more ? 'reveal' : 'next'}">${more ? 'Continuar' : 'Entendi'} <kbd>Enter</kbd></button></div>`;
    } else if (isAsk(step)) { body = quizHTML(step, ls); foot = quizFoot(step, ls); }
    else { body = codeHTML(step, ls); foot = codeFoot(step, ls); }
    app.innerHTML = `<main class="main lesson" data-course="${c.id}">${top}<div class="lesson-body">${body}</div>${foot}</main>`;
    if (step && step.t === 'code' && ls.phase !== 'complete') mountEditor(step, ls);
    else { const pb = app.querySelector('.lesson-foot .btn.primary:not(:disabled)'); if (pb) pb.focus({ preventScroll: true }); }
    const fresh = app.querySelector('.card-chunk.fresh'); if (fresh) fresh.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function originTag(step) { return step._fromTitle ? `<span class="origin">de: ${esc(step._c ? step._c.name + ' · ' : '')}${esc(step._fromTitle)}</span>` : ''; }
  function quizHTML(step, ls) {
    const d = ls.d;
    const kind = step.t === 'predict' ? 'Preveja o resultado' : 'Quiz';
    return `<div class="reading"><span class="hud" style="color:var(--accent)">${kind}</span>${originTag(step)}<div class="quiz-q">${inline(step.q)}</div>
      ${step.code ? `<div class="md"><pre><code>${esc(step.code)}</code></pre></div>` : ''}
      <div class="opts">${step.opts.map((o, i) => {
        let cls = ''; if (d.checked) cls = i === step.a ? 'right' : i === d.sel ? 'wrong' : ''; else if (d.sel === i) cls = 'sel';
        return `<button class="opt ${cls}" data-opt="${i}" ${d.checked ? 'disabled' : ''}><span class="k">${i + 1}</span><code>${esc(o)}</code></button>`;
      }).join('')}</div></div>`;
  }
  function quizFoot(step, ls) {
    const d = ls.d;
    if (!d.checked) return `<div class="lesson-foot"><div class="msg"><span>${step.t === 'predict' ? 'Leia o código e pense no que ele faz antes de escolher.' : 'Escolha uma opção'} (teclas 1 a ${step.opts.length})</span></div><button class="btn primary" data-act="check" ${d.sel == null ? 'disabled' : ''}>Verificar <kbd>Enter</kbd></button></div>`;
    const ok = d.sel === step.a;
    return `<div class="lesson-foot ${ok ? 'good' : 'badf'}"><div class="msg"><strong>${ok ? 'Acesso liberado' : 'Resposta errada'}</strong>${md(step.why)}${ok ? '' : '<span>Essa pergunta volta na sua revisão, pra fixar.</span>'}</div><button class="btn primary" data-act="next">Continuar <kbd>Enter</kbd></button></div>`;
  }

  function fileName(r) { return { js: 'main.js', ts: 'main.ts', sql: 'query.sql', web: 'index.html', dom: 'index.html', git: 'terminal', text: 'draft.txt', react: 'App.jsx' }[r] || 'main.txt'; }
  function unitIndexOf(c, lessonId) { return c.units.findIndex((u) => u.lessons.some((l) => l.id === lessonId)); }
  function defaultMode(step, ls) {
    if (step._blocks) return TD.ped.parsonsBlocks(step, 'x') ? 'blocks' : 'write';
    if (ls.kind === 'lesson' && unitIndexOf(ls.c, ls.lesson.id) === 0 && !ls.review && TD.ped.parsonsBlocks(step, 'x')) return 'blocks';
    return 'write';
  }
  function ensurePz(step, ls) {
    const d = ls.d;
    if (!d.pz) { const blocks = TD.ped.parsonsBlocks(step, (step._from || ls.lesson.id) + '#' + ls.i); d.pz = blocks ? { pool: blocks, answer: [] } : null; }
    return d.pz;
  }
  const pzCode = (d) => d.pz ? d.pz.answer.map((b) => b.text).join('\n') : '';

  function codeHTML(step, ls) {
    const c = courseOf(ls, step), d = ls.d, r = stepRunner(c, step);
    if (!d.mode) d.mode = defaultMode(step, ls);
    const canBlocks = !!TD.ped.parsonsBlocks(step, 'x');
    const saved = ls.kind === 'lesson' ? ((S.store.state.code[ls.lesson.id] || {}).steps || {}) : {};
    return `
      <div class="workspace">
        <section class="brief">
          <span class="hud" style="color:var(--accent)">${d.mode === 'blocks' ? 'Exercício · modo guiado' : 'Exercício'}</span>${originTag(step)}
          <h2>${esc(step.title)}</h2>
          ${md(step.task)}
          ${d.mode === 'blocks' ? '<div class="hint"><strong>Modo guiado:</strong> clique nos blocos na ordem certa pra montar o código. Depois rode. Quando se sentir seguro, troque pra <strong>Escrever</strong>.</div>' : ''}
          ${r === 'sql' && c.dbNotes && c.dbNotes[step.db || 'shop'] ? `<div class="hint">${md(c.dbNotes[step.db || 'shop'])}</div>` : ''}
          <div><span class="hud" style="display:block;margin-bottom:8px">Testes</span><ul class="tests" id="tests">${testList(step, c, d)}</ul></div>
          ${theoryHTML(step, ls)}
          ${d.showHint ? `<div class="hint"><strong>Dica:</strong> ${inline(step.hint)}</div>` : `<button class="btn sm" data-act="hint">Mostrar dica</button>`}
          ${tutorAvailable() && ls.tutorOff !== true ? `
          <div class="tutor cut">
            <div class="tutor-head">${ICON.spark} Tutor de IA</div>
            <label for="tutor-q" style="font-size:13px;color:var(--muted)">Pergunte sobre o exercício, ou deixe em branco pra ele analisar seu código.</label>
            <textarea id="tutor-q" placeholder="Ex: por que meu filter retorna vazio?">${esc(d.tutorQ || '')}</textarea>
            <button class="btn sm" data-act="tutor" ${d.tutorBusy ? 'disabled' : ''}>${d.tutorBusy ? 'Processando...' : 'Pedir ajuda ao tutor'}</button>
            ${d.tutorA ? `<div class="tutor-answer ${d.tutorWait ? 'wait' : ''}" id="tutor-a">${d.tutorWait ? 'conectando ao tutor...' : md(d.tutorA)}</div>` : ''}
          </div>` : (!window.claude ? '<p style="font-size:13px;color:var(--dim)">Tutor de IA desligado. Configure sua chave em Configurações pra usar.</p>' : '')}
        </section>
        <section class="editor-col">
          <div class="ed-bar">
            <span class="file">${fileName(r)}</span>
            ${canBlocks ? `<span class="seg" role="group" aria-label="Modo"><button class="${d.mode === 'blocks' ? 'on' : ''}" data-act="mode-blocks">Blocos</button><button class="${d.mode === 'write' ? 'on' : ''}" data-act="mode-write">Escrever</button></span>` : ''}
            ${d.mode === 'write' && saved[ls.i] != null ? '<button class="btn ghost sm" data-act="load-saved">Meu código salvo</button>' : ''}
            <button class="btn ghost sm" data-act="reset">Recomeçar</button>
            ${d.fails >= 2 || d.passed ? `<button class="btn ghost sm" data-act="solution">${d.showSolution ? 'Esconder' : 'Ver'} solução</button>` : ''}
            <button class="btn primary sm" data-act="run" ${d.running ? 'disabled' : ''}>${ICON.play} ${d.running ? 'Rodando...' : 'Rodar'} <kbd>Ctrl ↵</kbd></button>
          </div>
          <div class="ed-host" id="ed-host"></div>
          <div class="out">
            <div class="out-tabs" id="out-tabs">${outTabs(r, d)}</div>
            <div class="out-body" id="out-body">${outBody(r, d)}</div>
          </div>
        </section>
      </div>`;
  }
  function testList(step, c, d) {
    let items;
    if (d.results) items = d.results;
    else {
      const r = stepRunner(c, step);
      items = [];
      if (r === 'ts') { items.push({ name: 'Compila sem type errors' }); if (step.typeTests) items.push({ name: step.typeTestsName || 'Os tipos batem com o esperado' }); }
      if (r === 'sql') items.push({ name: step.check ? 'O banco ficou com os dados esperados' : 'Resultado igual ao esperado' });
      for (const t of step.tests || []) items.push({ name: t[0] });
      for (const t of step.requires || []) items.push({ name: t[0] });
    }
    return items.map((x) => `<li class="${x.pass === true ? 'pass' : x.pass === false ? 'fail' : ''}"><span class="dot">${x.pass === true ? '✓' : x.pass === false ? '✕' : ''}</span><span>${inline(x.name)}${x.err ? `<span class="err">${esc(x.err)}</span>` : ''}</span></li>`).join('');
  }
  function outTabs(r, d) {
    const tab = d.tab || (r === 'sql' ? 'result' : (r === 'web' || r === 'dom' || r === 'react') ? 'preview' : 'console');
    const b = (id, label) => `<button class="${tab === id ? 'on' : ''}" data-tab="${id}">${label}</button>`;
    let tabs;
    if (r === 'sql') tabs = b('result', 'Resultado') + b('expected', 'Esperado');
    else if (r === 'web') tabs = b('preview', 'Preview') + (d.res && d.res.output && d.res.output.length ? b('console', 'Console') : '');
    else if (r === 'dom' || r === 'react') tabs = b('preview', 'Preview') + b('console', 'Console');
    else tabs = b('console', 'Console');
    return tabs + `<span class="status">${esc(d.statusText || '')}</span>`;
  }
  function tableHTML(t, caption) {
    if (!t) return '<pre class="console"><span class="dim">Nenhuma row.</span></pre>';
    return `<table class="rtable">${caption ? `<caption>${esc(caption)}</caption>` : ''}<thead><tr>${t.columns.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${t.values.slice(0, 200).map((row) => `<tr>${row.map((v) => `<td>${v === null ? 'NULL' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function explainHTML(r, res) {
    if (!res) return '';
    const msg = [res.error, res.explainMsg, ...(res.typeErrors || [])].filter(Boolean).join('\n');
    const tip = TD.ped.explainError(r, msg);
    return tip ? `<div class="explain"><strong>O que esse erro quer dizer:</strong> ${inline(tip)}</div>` : '';
  }
  function consoleHTML(res, empty, r) {
    if (!res) return `<pre class="console"><span class="dim">${empty}</span></pre>`;
    const lines = [];
    if (res.typeErrors && res.typeErrors.length) lines.push(...res.typeErrors.map((e) => `<span class="err">${esc(e)}</span>`));
    if (res.output && res.output.length) lines.push(...res.output.map((x) => res.raw
      ? (x.startsWith('$ ') ? `<span class="prompt">$</span> <b>${esc(x.slice(2))}</b>` : x.startsWith('!! ') ? `<span class="err">${esc(x.slice(3))}</span>` : esc(x))
      : `<span class="prompt">›</span> ${esc(x)}`));
    if (res.error) lines.push(`<span class="err">${esc(res.error)}</span>`);
    if (!lines.length) lines.push('<span class="dim">(nada no console)</span>');
    return `<pre class="console">${lines.join('\n')}</pre>${explainHTML(r, res)}`;
  }
  function outBody(r, d) {
    const tab = d.tab || (r === 'sql' ? 'result' : (r === 'web' || r === 'dom' || r === 'react') ? 'preview' : 'console');
    if ((r === 'web' || r === 'dom' || r === 'react')) {
      return `<iframe class="preview-frame ${tab === 'preview' ? '' : 'hidden'}" id="preview" title="Preview"></iframe><div id="dom-console" class="${tab === 'console' ? '' : 'hidden'}">${consoleHTML(d.res, 'console.log aparece aqui depois de rodar.', r)}</div>`;
    }
    const res = d.res;
    if (r === 'sql') {
      if (tab === 'expected') return res ? tableHTML(res.expectedTable, 'Resultado esperado') : '<pre class="console"><span class="dim">Rode a query pra comparar com o esperado.</span></pre>';
      if (!res) return '<pre class="console"><span class="dim">Rode a query pra ver o resultado aqui.</span></pre>';
      if (res.error) return `<pre class="console"><span class="err">${esc(res.error)}</span></pre>${explainHTML(r, res)}`;
      return (res.output ? `<pre class="console"><span class="dim">${esc(res.output.join('\n'))}</span></pre>` : '') + (res.table ? tableHTML(res.table) : '');
    }
    return consoleHTML(res, r === 'git' ? 'Rode os comandos pra ver a saída do terminal aqui.' : r === 'text' ? 'Rode pra conferir seu texto.' : 'A saída do console.log aparece aqui.', r);
  }
  function codeFoot(step, ls) {
    const d = ls.d;
    if (d.passed) {
      const msg = d.usedSolution ? 'Reescreva depois sem olhar, pra fixar.' : d.mode === 'blocks' && ls.kind === 'lesson' ? 'Montou certinho. Quer fixar? Tente escrever do zero.' : 'Código limpo. Bora pra próxima.';
      const extra = d.mode === 'blocks' && ls.kind === 'lesson' && !d.rewritten ? '<button class="btn" data-act="rewrite">Escrever do zero</button>' : '';
      return `<div class="lesson-foot good"><div class="msg"><strong>Todos os testes passaram</strong><span>${msg}</span></div>${extra}<button class="btn primary" data-act="next">Continuar <kbd>Enter</kbd></button></div>`;
    }
    if (d.results) {
      const offer = d.mode === 'write' && TD.ped.parsonsBlocks(step, 'x') ? ' Travou? Troque pra <strong>Blocos</strong> e monte o código.' : '';
      return `<div class="lesson-foot badf"><div class="msg"><strong>${d.results.filter((r) => r.pass).length} de ${d.results.length} testes passando</strong><span>Ajuste e rode de novo.${offer}${d.fails >= 2 ? ' A solução já está liberada se precisar.' : ''}</span></div>${offer ? '<button class="btn" data-act="mode-blocks">Montar com blocos</button>' : ''}<button class="btn primary" data-act="run">Rodar de novo</button></div>`;
    }
    return `<div class="lesson-foot"><div class="msg"><span>${d.mode === 'blocks' ? 'Monte o código com os blocos e clique em Rodar.' : 'Escreva o código e clique em Rodar.'}</span></div><button class="btn primary" data-act="run">Rodar</button></div>`;
  }
  const cmMode = (r) => ({ js: 'javascript', ts: 'text/typescript', sql: 'text/x-sqlite', web: 'htmlmixed', dom: 'htmlmixed', react: 'text/typescript-jsx' }[r] || null);

  function blocksHTML(d) {
    const pz = d.pz;
    const blk = (b, act) => `<button class="pz-b" data-pz="${act}:${b.id}"><code>${esc(b.text)}</code></button>`;
    return `<div class="parsons">
      <div class="pz-col"><span class="hud">Blocos disponíveis</span><div class="pz-pool">${pz.pool.map((b) => blk(b, 'add')).join('') || '<p class="dim">Todos os blocos foram usados.</p>'}</div></div>
      <div class="pz-col"><span class="hud">Seu código · clique pra devolver</span><div class="pz-answer">${pz.answer.map((b) => blk(b, 'rm')).join('') || '<p class="dim">Clique nos blocos à esquerda, na ordem.</p>'}</div></div>
    </div>`;
  }
  function mountEditor(step, ls) {
    const host = document.getElementById('ed-host'); const d = ls.d; const r = stepRunner(courseOf(ls, step), step);
    if (d.mode === 'blocks' && !d.showSolution && ensurePz(step, ls)) {
      host.innerHTML = blocksHTML(d);
      S.editor = { getValue: () => pzCode(d), focus: () => {} };
      return;
    }
    if (d.code == null) d.code = step.starter || '';
    const value = d.showSolution ? step.solution : d.code;
    if (window.CodeMirror) {
      S.editor = window.CodeMirror(host, {
        value, mode: cmMode(r), theme: 'neon', lineNumbers: true, tabSize: 2, indentUnit: 2, indentWithTabs: false,
        autoCloseBrackets: true, matchBrackets: true, styleActiveLine: true, readOnly: d.showSolution ? 'nocursor' : false,
        extraKeys: { 'Ctrl-Enter': () => runCode(), 'Cmd-Enter': () => runCode(), Tab: (cm) => (cm.somethingSelected() ? cm.indentSelection('add') : cm.replaceSelection('  ', 'end')) }
      });
      S.editor.on('change', () => { if (!d.showSolution) d.code = S.editor.getValue(); });
      if (!d.showSolution) setTimeout(() => { if (!S.editor || !S.editor.refresh) return; S.editor.refresh(); S.editor.focus(); S.editor.setCursor(S.editor.lineCount(), 0); }, 0);
    } else {
      const ta = document.createElement('textarea');
      ta.className = 'plain'; ta.spellcheck = false; ta.id = 'code-input'; ta.setAttribute('aria-label', 'Editor de código');
      ta.value = value; ta.readOnly = !!d.showSolution;
      ta.addEventListener('input', () => { d.code = ta.value; });
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); d.code = ta.value; }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runCode(); }
      });
      host.appendChild(ta);
      S.editor = { getValue: () => ta.value, focus: () => ta.focus() };
      if (!d.showSolution) ta.focus();
    }
    if (r === 'web') { const f = document.getElementById('preview'); if (f) f.srcdoc = TD.runners.wrapHTML(value); }
  }
  function refreshCodeChrome() {
    const ls = S.lesson, step = ls.lesson.steps[ls.i], d = ls.d, r = stepRunner(courseOf(ls, step), step);
    const tests = document.getElementById('tests'); if (tests) tests.innerHTML = testList(step, courseOf(ls, step), d);
    const tabs = document.getElementById('out-tabs'); if (tabs) tabs.innerHTML = outTabs(r, d);
    const ob = document.getElementById('out-body');
    if (ob) {
      if ((r === 'web' || r === 'dom' || r === 'react')) {
        const tab = d.tab || 'preview';
        const f = document.getElementById('preview'); if (f) f.classList.toggle('hidden', tab !== 'preview');
        const dc = document.getElementById('dom-console'); if (dc) { dc.classList.toggle('hidden', tab !== 'console'); dc.innerHTML = consoleHTML(d.res, 'console.log aparece aqui depois de rodar.', r); }
      } else ob.innerHTML = outBody(r, d);
    }
    const bar = app.querySelector('.ed-bar');
    if (bar) {
      const run = bar.querySelector('[data-act="run"]');
      run.disabled = !!d.running; run.innerHTML = `${ICON.play} ${d.running ? 'Rodando...' : 'Rodar'} <kbd>Ctrl ↵</kbd>`;
      if ((d.fails >= 2 || d.passed) && !bar.querySelector('[data-act="solution"]')) run.insertAdjacentHTML('beforebegin', '<button class="btn ghost sm" data-act="solution">Ver solução</button>');
    }
    const foot = app.querySelector('.lesson-foot'); if (foot) foot.outerHTML = codeFoot(step, ls);
    const xp = app.querySelector('.xp-chip'); if (xp) xp.textContent = `+${ls.earned} XP`;
  }
  async function runCode() {
    const ls = S.lesson; if (!ls) return;
    const step = ls.lesson.steps[ls.i]; if (!step || step.t !== 'code') return;
    const d = ls.d; if (d.running) return;
    if (d.showSolution) { d.showSolution = false; renderLesson(); }
    const c = courseOf(ls, step);
    const code = S.editor ? S.editor.getValue() : d.code;
    if (d.mode !== 'blocks') d.code = code;
    const r = stepRunner(c, step);
    d.running = true;
    sfx('run');
    d.statusText = r === 'ts' && !window.ts ? 'carregando compilador...' : r === 'sql' && !window.initSqlJs ? 'carregando banco...' : 'executando...';
    refreshCodeChrome();
    const t0 = performance.now(); let res;
    try {
      const R = TD.runners;
      if (r === 'js') res = await R.runJS(code, step);
      else if (r === 'ts') res = await R.runTS(code, step);
      else if (r === 'sql') res = await R.runSQL(code, step, c);
      else if (r === 'git') res = await R.runGit(code, step);
      else if (r === 'react') res = await R.runReact(code, step, document.getElementById('preview'));
      else if (r === 'text') res = await R.runText(code, step);
      else res = await R.runWeb(code, step, document.getElementById('preview'));
    } catch (e) {
      res = { output: [], results: [{ name: 'Não foi possível rodar', pass: false, err: e.message }], error: 'Não consegui carregar o que esse exercício precisa. Tente de novo.' };
    }
    d.running = false; d.res = res; d.results = res.results;
    d.statusText = `${Math.round(performance.now() - t0)} ms`;
    if (r === 'sql') d.tab = 'result';
    const allPass = res.results.length > 0 && res.results.every((x) => x.pass);
    sfx(allPass ? 'pass' : 'wrong');
    if (allPass && !d.passed) {
      d.passed = true;
      const clean = !d.fails && !d.usedSolution;
      if (ls.results[ls.i] === undefined) ls.results[ls.i] = clean;
      if (!ls.review) ls.earned += ls.kind === 'lesson' ? XP.code + (clean && d.mode === 'write' ? XP.clean : 0) : (clean ? XP.reviewItem : 0);
      if (clean) ls.correct++;
      ls.graded++;
      if (ls.kind === 'lesson') {
        const rec = S.store.state.code[ls.lesson.id] || { lesson: ls.lesson.id, steps: {} };
        rec.steps[ls.i] = code; rec.at = now();
        S.store.state.code[ls.lesson.id] = rec;
        S.store.saveCode(ls.lesson.id).catch(() => {});
      }
    } else if (!allPass) d.fails = (d.fails || 0) + 1;
    refreshCodeChrome();
  }

  async function askTutor() {
    const ls = S.lesson, step = ls.lesson.steps[ls.i], d = ls.d;
    const c = courseOf(ls, step);
    const q = document.getElementById('tutor-q'); d.tutorQ = q ? q.value.trim() : '';
    const sample = S.caps.sample; if (!sample) return;
    if (d.mode !== 'blocks') d.code = S.editor ? S.editor.getValue() : d.code;
    d.tutorBusy = true; d.tutorWait = true; d.tutorA = '...';
    rerenderBrief();
    const tests = (d.results || []).map((r) => `- [${r.pass ? 'ok' : 'falhou'}] ${r.name}${r.err ? ' (' + r.err + ')' : ''}`).join('\n') || '(o aluno ainda não rodou o código)';
    const errs = d.res ? [d.res.error, ...(d.res.typeErrors || [])].filter(Boolean).join('\n') : '';
    const r = stepRunner(c, step);
    const prompt = `Você é o tutor do app Overclock e está ensinando ${c.name} para um brasileiro iniciante (inglês intermediário).
Regras:
- Responda em português do Brasil, direto e amigável, com um toque de humor cyberpunk se couber.
- Termos técnicos e código ficam em inglês (string, array, function, loop, query, selector, property, type...). Não traduza esses termos.
- NÃO entregue a solução completa. Faça no máximo uma pergunta que guie o raciocínio e dê uma dica concreta. No máximo 1 ou 2 linhas de código, se for essencial.
- Ligue a dica ao conceito da lição, pra ele lembrar da teoria.
- No máximo 120 palavras. Use crases para código inline.

Lição: ${step._fromTitle || ls.lesson.title}
Exercício: ${step.task}
${r === 'sql' && c.dbNotes ? 'Banco: ' + c.dbNotes[step.db || 'shop'] + '\n' : ''}
Código atual do aluno:
\`\`\`
${d.mode === 'blocks' ? pzCode(d) : d.code}
\`\`\`

Testes:
${tests}
${errs ? '\nErros:\n' + errs : ''}
${d.res && d.res.output && d.res.output.length ? '\nSaída do console:\n' + d.res.output.slice(0, 20).join('\n') : ''}

Pergunta do aluno: ${d.tutorQ || 'Por que meu código não passa? Me dá uma dica.'}`;
    try {
      const res = await sample(prompt, {
        modelTier: 'quick',
        onText: ({ text }) => {
          d.tutorA = text || '...'; d.tutorWait = false;
          const el = document.getElementById('tutor-a');
          if (el && S.lesson === ls) { el.classList.remove('wait'); el.innerHTML = md(d.tutorA); }
        }
      });
      d.tutorA = (res && res.text) || d.tutorA;
    } catch (e) {
      if (e && e.code === 'not_granted') { ls.tutorOff = !window.claude ? false : true; d.tutorA = window.claude ? 'O tutor precisa da sua permissão pra funcionar.' : 'A chave de API foi recusada. Confira em Configurações.'; }
      else d.tutorA = e && e.code === 'rate_limited' ? 'O tutor está sobrecarregado agora. Espere um pouco e tente de novo.' : 'Não consegui falar com o tutor agora. Tente de novo em instantes.';
    }
    d.tutorBusy = false; d.tutorWait = false;
    if (S.lesson === ls) rerenderBrief();
  }
  function rerenderBrief() {
    const ls = S.lesson, brief = app.querySelector('.brief'); if (!brief) return;
    const fresh = h(codeHTML(ls.lesson.steps[ls.i], ls)).querySelector('.brief');
    brief.replaceWith(fresh);
  }

  function completeHTML(ls) {
    const pct = ls.graded ? Math.round((ls.correct / ls.graded) * 100) : 100;
    const r = rankOf(P().xp);
    let headline = ls.review ? 'Revisão feita' : 'Lição completa', sub = esc(ls.lesson.title) + ' · ' + esc(ls.c.name), extra = '';
    if (ls.kind === 'review') { headline = 'Memória reforçada'; sub = `${ls.graded} itens revisados`; extra = `<p>${ls.correct} de ${ls.graded} de primeira. O que você errou volta amanhã; o que acertou, só daqui a alguns dias.</p>`; }
    if (ls.kind === 'checkpoint') {
      headline = ls.passed ? 'Módulo dominado' : 'Quase lá';
      extra = ls.passed ? `<p>Você acertou ${pct}% de primeira. O próximo módulo está liberado.</p>` : `<p>Você acertou ${pct}% de primeira e precisa de ${Math.round(TD.ped.CHECKPOINT_PASS * 100)}%. Revise a teoria das lições do módulo e tente de novo: as perguntas mudam.</p>`;
    }
    const learned = ls.kind === 'lesson' ? ls.lesson.steps.filter((s) => s.t === 'learn').map((s) => s.title) : [];
    return `<div class="complete"><div class="trophy">${ICON.trophy}</div><span class="hud" style="color:var(--accent)">${ls.kind === 'checkpoint' ? 'Checkpoint' : 'Missão concluída'}</span><h2 class="glitch">${headline}</h2><p>${sub}</p>
      <div class="tiles"><div class="tile"><small>XP ganho</small><b>+${ls.earned}</b></div><div class="tile"><small>De primeira</small><b>${pct}%</b></div><div class="tile"><small>Sequência</small><b>${liveStreak()}d</b></div></div>
      ${extra}
      ${learned.length ? `<div class="recap"><span class="hud">Nesta missão</span><ul>${learned.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><small>Esses pontos voltam na sua Revisão do dia nos próximos dias. É assim que eles vão pra memória de longo prazo.</small></div>` : ''}
      <p>Rank atual: <strong style="color:var(--yellow)">${esc(r.name)}</strong>${r.next ? ` · faltam ${r.next - P().xp} XP pro próximo` : ''}</p>
      ${ls.rankUp ? `<p style="color:var(--yellow);font-family:var(--font-display);font-size:20px;text-transform:uppercase">Novo rank desbloqueado</p>` : ''}</div>`;
  }
  function addXP(p, amount) {
    const t = dayKey();
    if (TD.sync) TD.sync.ledger(p, amount, t); // livro-caixa por aparelho (antes de somar, pra não contar duas vezes)
    p.xp += amount;
    const day = p.days[t] || (p.days[t] = { xp: 0, lessons: 0 });
    day.xp += amount; day.lessons++;
    const keys = Object.keys(p.days).sort(); while (keys.length > 400) delete p.days[keys.shift()];
    if (p.lastDay !== t) { p.streak = p.lastDay === yesterday() ? (p.streak || 0) + 1 : 1; p.lastDay = t; }
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
  }
  function finishLesson() {
    const ls = S.lesson, p = P();
    const before = rankOf(p.xp).level;
    if (ls.kind === 'lesson') {
      ls.earned += ls.review ? XP.review : XP.lesson;
      p.done[ls.lesson.id] = { at: now(), xp: ls.earned };
      TD.ped.enrollLesson(p, ls.lesson, ls.results, now());
      const nt = nextTarget(ls.c);
      if (nt) { ls.nextStart = ls.c.id + ':' + nt.id; ls.nextLabel = nt.checkpoint != null ? 'Checkpoint do módulo' : 'Próxima lição'; }
    } else if (ls.kind === 'review') {
      p.srs = p.srs || {};
      ls.lesson.steps.forEach((s, i) => { p.srs[s._from] = TD.ped.schedule(p.srs[s._from], !!ls.results[i], now()); });
      ls.earned += XP.reviewDone;
    } else if (ls.kind === 'checkpoint') {
      const cp = ls.lesson.checkpoint, key = TD.ped.unitKey(ls.c, cp.unit);
      const score = ls.graded ? ls.correct / ls.graded : 0;
      p.mastery = p.mastery || {};
      const prev = p.mastery[key];
      ls.passed = score >= TD.ped.CHECKPOINT_PASS;
      p.mastery[key] = { best: Math.max(prev ? prev.best : 0, score), last: score, at: now() };
      p.srs = p.srs || {};
      ls.lesson.steps.forEach((s, i) => { if (s._from) p.srs[s._from] = TD.ped.schedule(p.srs[s._from], !!ls.results[i], now()); });
      if (ls.passed && !(prev && prev.best >= TD.ped.CHECKPOINT_PASS)) ls.earned += XP.checkpoint;
      const nt = nextTarget(ls.c);
      if (nt) { ls.nextStart = ls.c.id + ':' + nt.id; ls.nextLabel = nt.checkpoint != null ? 'Tentar de novo' : 'Próxima lição'; }
    }
    addXP(p, ls.earned);
    ls.rankUp = rankOf(p.xp).level > before;
    sfx(ls.rankUp ? 'rankup' : ls.kind === 'checkpoint' && !ls.passed ? 'wrong' : 'complete');
    saveProgress();
    ls.phase = 'complete'; renderLesson();
  }
  function nextStep() {
    const ls = S.lesson, step = ls.lesson.steps[ls.i];
    if (step.t === 'code' && !ls.d.passed) return;
    if (isAsk(step) && !ls.d.checked) return;
    if (step.t === 'learn') { const n = TD.ped.chunkBody(step.body).length; if ((ls.d.shown || 1) < n) { ls.d.shown = (ls.d.shown || 1) + 1; renderLesson(); return; } }
    if (ls.i + 1 >= ls.lesson.steps.length) { finishLesson(); return; }
    ls.i++; ls.d = {}; S.editor = null; renderLesson();
  }

  /* ---------- eventos ---------- */
  app.addEventListener('submit', (e) => { if (e.target && e.target.id === 'auth-form') { e.preventDefault(); authSubmit(); } });
  app.addEventListener('click', async (e) => {
    const pzBtn = e.target.closest('[data-pz]');
    if (pzBtn && S.lesson && S.lesson.d.pz) {
      const [op, id] = pzBtn.getAttribute('data-pz').split(':'); const pz = S.lesson.d.pz;
      const from = op === 'add' ? pz.pool : pz.answer, to = op === 'add' ? pz.answer : pz.pool;
      const k = from.findIndex((b) => b.id === id); if (k >= 0) to.push(from.splice(k, 1)[0]);
      sfx('select'); const host = document.getElementById('ed-host'); if (host) host.innerHTML = blocksHTML(S.lesson.d);
      return;
    }
    const t = e.target.closest('[data-go],[data-start],[data-act],[data-opt],[data-tab],[data-restore-auto]');
    if (!t) { if (e.target.closest('a.rail-item, a.btn, label.btn')) sfx('nav'); return; }
    const act0 = t.getAttribute('data-act');
    if (t.hasAttribute('data-start') || t.hasAttribute('data-go')) sfx('nav');
    else if (t.hasAttribute('data-opt')) sfx('select');
    else if (!['check', 'run', 'sound'].includes(act0)) sfx('click');
    if (t.hasAttribute('data-start')) { e.preventDefault(); const [cid, lid] = t.getAttribute('data-start').split(':'); startLesson(cid, lid); return; }
    if (t.hasAttribute('data-go')) { const id = t.getAttribute('data-go'); if ('#' + id === location.hash) route(); else location.hash = id; return; }
    if (t.hasAttribute('data-tab')) { S.lesson.d.tab = t.getAttribute('data-tab'); refreshCodeChrome(); return; }
    if (t.hasAttribute('data-opt')) { S.lesson.d.sel = Number(t.getAttribute('data-opt')); renderLesson(); return; }
    if (t.hasAttribute('data-restore-auto')) {
      const list = (document.getElementById('auto-list') || {})._list || []; const b = list.find((x) => x.id === t.getAttribute('data-restore-auto'));
      if (b) { try { askRestore(JSON.parse(b.json), 'a cópia automática de ' + fmtDate(b.at)); } catch (err) { toast('Cópia ilegível.'); } }
      return;
    }
    const act = t.getAttribute('data-act'); const ls = S.lesson;
    switch (act) {
      case 'quit': case 'back': { const dest = ls.kind === 'review' ? '' : ls.c.id; closeLesson(false); if (location.hash.replace('#', '') === dest) route(); else location.hash = dest; break; }
      case 'next': case 'reveal': nextStep(); break;
      case 'check': {
        const step = ls.lesson.steps[ls.i]; if (ls.d.sel == null) return;
        const ok = ls.d.sel === step.a;
        ls.d.checked = true; ls.graded++; if (ls.results[ls.i] === undefined) ls.results[ls.i] = ok;
        sfx(ok ? 'correct' : 'wrong');
        if (ok) { ls.correct++; if (!ls.review) ls.earned += ls.kind === 'lesson' ? XP.quiz : XP.reviewItem; }
        renderLesson(); break;
      }
      case 'mode-blocks': if (ls.d.mode !== 'blocks') { if (S.editor && S.editor.getValue && ls.d.mode === 'write') ls.d.code = S.editor.getValue(); ls.d.mode = 'blocks'; ls.d.showSolution = false; renderLesson(); } break;
      case 'mode-write': if (ls.d.mode !== 'write') { ls.d.mode = 'write'; if (ls.d.code == null) ls.d.code = ls.lesson.steps[ls.i].starter || ''; renderLesson(); } break;
      case 'rewrite': ls.d = { mode: 'write', rewritten: true, passed: false, code: ls.lesson.steps[ls.i].starter || '' }; S.editor = null; renderLesson(); break;
      case 'run': runCode(); break;
      case 'hint': ls.d.showHint = true; ls.d.code = S.editor ? S.editor.getValue() : ls.d.code; renderLesson(); break;
      case 'reset': if (ls.d.mode === 'blocks') ls.d.pz = null; else ls.d.code = ls.lesson.steps[ls.i].starter || ''; ls.d.showSolution = false; renderLesson(); break;
      case 'load-saved': { const s = (S.store.state.code[ls.lesson.id] || {}).steps || {}; if (s[ls.i] != null) { ls.d.code = s[ls.i]; ls.d.showSolution = false; renderLesson(); } break; }
      case 'solution': { const d = ls.d; if (!d.showSolution) { d.code = S.editor ? S.editor.getValue() : d.code; d.showSolution = true; if (!d.passed) d.usedSolution = true; } else d.showSolution = false; renderLesson(); break; }
      case 'tutor': askTutor(); break;
      case 'export': doExport(); break;
      case 'auth-tab': case 'auth-eye': case 'auth-google': case 'auth-guest': case 'auth-resend': authAction(act, t); break;
      case 'cloud-google': case 'cloud-signin': case 'cloud-signup': case 'cloud-recover': case 'cloud-sync': case 'cloud-pass-show': case 'cloud-newpass': case 'cloud-signout': cloudAction(act); break;
      case 'copy-json': try { await navigator.clipboard.writeText(exportJSON()); toast('JSON do backup copiado.'); } catch (err) { toast('Não consegui copiar aqui.'); } break;
      case 'restore-no': { const b = document.getElementById('restore-box'); if (b) { b.innerHTML = ''; b._obj = null; } break; }
      case 'restore-yes': doRestore(); break;
      case 'open-folder': window.tdNative.openDataFolder(); break;
      case 'save-key': {
        const key = (document.getElementById('cfg-key') || {}).value || '';
        if (!key.trim()) { toast('Cole a chave primeiro.'); return; }
        t.disabled = true; t.textContent = 'Testando...';
        try { await TD.local.testKey(key.trim()); TD.local.saveAiSettings(Object.assign(TD.local.aiSettings(), { key: key.trim() })); S.caps.sample = TD.local.makeSample(); toast('Chave funcionando. Tutor ligado.'); }
        catch (err) { toast('A chave não funcionou: ' + err.message); }
        render(); break;
      }
      case 'clear-key': TD.local.saveAiSettings({}); S.caps.sample = null; toast('Chave removida.'); render(); break;
      case 'reset-ask': { const b = document.getElementById('reset-box'); if (b) b.innerHTML = '<div class="banner warn" style="margin-top:8px"><div class="grow"><strong>Tem certeza?</strong><span style="color:var(--muted);font-size:14px">Isso não pode ser desfeito (a não ser por um backup).</span></div><button class="btn sm" data-act="reset-no">Cancelar</button><button class="btn sm danger" data-act="reset-yes">Zerar</button></div>'; break; }
      case 'reset-no': { const b = document.getElementById('reset-box'); if (b) b.innerHTML = ''; break; }
      case 'reset-yes': { const keep = P().settings; S.store.state.progress = Object.assign(TD.store.blankProgress(now()), { settings: keep }); if (cloudOn() && TD.cloud.user()) { try { await TD.sync.wipe(); } catch (e) { toast('Não consegui apagar a cópia na nuvem: ' + e.message); } } await saveProgress(); toast('Progresso zerado.'); location.hash = ''; render(); break; }
      default: break;
    }
  });
  app.addEventListener('change', async (e) => {
    if (e.target.id === 'imp-file') {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { askRestore(JSON.parse(await f.text()), 'o arquivo ' + f.name); } catch (err) { toast('Arquivo inválido: não é um JSON.'); }
      e.target.value = '';
    } else if (e.target.id === 'cfg-goal') { P().settings.goal = Number(e.target.value); await saveProgress(); toast('Meta diária: ' + e.target.value + ' XP'); }
    else if (e.target.id === 'cfg-sound') { P().settings.sound = e.target.checked; TD.sfx.configure({ on: e.target.checked }); if (e.target.checked) sfx('toggle', true); await saveProgress(); }
    else if (e.target.id === 'cfg-volume') { P().settings.volume = Number(e.target.value) / 100; TD.sfx.configure({ vol: P().settings.volume }); sfx('correct'); await saveProgress(); }
  });
  app.addEventListener('mouseover', (e) => {
    const t = e.target.closest('.course-card, .node:not(:disabled), .opt:not(:disabled), .rail-item, .btn.primary');
    if (t && !t.contains(e.relatedTarget)) sfx('hover');
  });
  document.addEventListener('pointerdown', () => TD.sfx && TD.sfx.unlock(), { once: true });
  document.addEventListener('keydown', (e) => {
    const ls = S.lesson; if (!ls) return;
    const step = ls.lesson.steps[ls.i];
    const inField = e.target.closest && e.target.closest('textarea, input, select, .CodeMirror');
    if (e.key === 'Escape' && !inField) { const q = app.querySelector('[data-act="quit"]'); if (q) q.click(); return; }
    if (ls.phase === 'complete') return;
    if (isAsk(step) && !ls.d.checked && /^[1-9]$/.test(e.key) && !inField) { const n = Number(e.key) - 1; if (n < step.opts.length) { ls.d.sel = n; sfx('select'); renderLesson(); } return; }
    if (e.key === 'Enter' && !inField && !(e.target.closest && e.target.closest('button,a'))) {
      e.preventDefault();
      if (isAsk(step) && !ls.d.checked) { if (ls.d.sel != null) app.querySelector('[data-act="check"]').click(); }
      else if (step.t !== 'code' || ls.d.passed) nextStep();
    }
  });

  /* ---------- render ---------- */
  function render() {
    if (!S.booted) return;
    if (S.lesson) { renderLesson(); return; }
    const v = S.view;
    if (v.name === 'login') {
      if (!cloudOn()) { S.view = { name: 'home' }; return render(); }
      app.className = 'app auth'; app.innerHTML = loginHTML(); return;
    }
    app.className = 'app';
    const main = v.name === 'course' ? courseHTML(byId[v.id]) : v.name === 'config' ? configHTML() : homeHTML();
    app.innerHTML = railHTML() + `<main class="main"${v.name === 'course' ? ` data-course="${v.id}"` : ''}>${main}</main>`;
    renderSaveState();
    if (v.name === 'config') {
      fillAutoBackups();
      if (S.scrollTo) { const el = document.getElementById(S.scrollTo); S.scrollTo = null; if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
    }
  }

  /* ---------- boot ---------- */
  async function cap(name) {
    if (!window.claude || typeof window.claude.use !== 'function') return null;
    try { return await window.claude.use(name); } catch (e) { return null; }
  }
  async function boot() {
    app.innerHTML = '<div class="loading">Inicializando sistema...</div>';
    const [db, user, sample, downloads] = await Promise.all(['db', 'user', 'sample', 'downloads'].map(cap));
    Object.assign(S.caps, { sample, downloads });
    let uid = null;
    if (db && user) { try { uid = await user.id(); } catch (e) { uid = null; } }
    let backend;
    if (db && uid) { backend = TD.store.DbBackend(db, uid); S.mode = 'db'; }
    else if (window.tdNative && window.tdNative.store) { backend = TD.store.NativeBackend(); S.mode = 'native'; }
    else {
      backend = TD.store.MemoryBackend('td-local-v1'); S.mode = window.claude ? 'local' : 'device';
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* */ }
    }
    if (!window.claude && TD.local) {
      S.caps.sample = S.caps.sample || TD.local.makeSample();
      S.caps.downloads = S.caps.downloads || TD.local.makeDownloads();
    }
    S.store = new TD.store.Store(backend, log);
    S.store.onPending = renderSaveState;
    try { await S.store.load(now()); }
    catch (e) {
      app.innerHTML = `<div class="page"><div class="card cut"><h2>Não consegui carregar seus dados</h2><p>${esc(e.code || e.message)}. Nada foi apagado. Tente abrir de novo em instantes.</p></div></div>`;
      return;
    }
    // migração do protótipo (progresso salvo só no navegador)
    try {
      const old = JSON.parse(localStorage.getItem('trilhadev.progress.v1') || 'null');
      if (old && old.done && !Object.keys(P().done).length) {
        for (const k of Object.keys(old.done)) P().done[k] = { at: now(), xp: 0 };
        P().xp = old.xp || 0; P().streak = old.streak || 0; P().lastDay = old.lastDay || null;
        await saveProgress();
      }
    } catch (e) { /* */ }
    if (TD.sfx) TD.sfx.configure({ on: P().settings.sound !== false, vol: P().settings.volume ?? 0.6 });
    if (TD.sync) TD.sync.migrate(P());
    let redirect = null;
    if (cloudOn()) { try { redirect = TD.cloud.handleRedirect(); } catch (e) { redirect = { error: e.message }; } }
    if (redirect) {
      const dest = redirect.type === 'recovery' || redirect.error ? '#config' : '#';
      try { history.replaceState(null, '', location.pathname + location.search + dest); } catch (e) { location.hash = dest.slice(1); }
      if (redirect.type === 'recovery') S.recovery = true;
      if (redirect.error) { S.auth = { tab: 'in', msg: { ok: false, text: redirect.error } }; try { history.replaceState(null, '', location.pathname + location.search + '#login'); } catch (e) { /* */ } }
    }
    S.booted = true;
    window.addEventListener('hashchange', route);
    route();
    S.store.autoBackup(now(), TD.contentVersion).catch((e) => log('warn', 'backup automático: ' + (e.code || e.message)));
    if (redirect && (redirect.error || redirect.type === 'recovery')) toast(redirect.error ? redirect.error : 'Defina sua nova senha abaixo.');
    if (cloudOn()) {
      TD.cloud.googleEnabled().then((on) => { if (on !== !!S.google) { S.google = on; if (S.view.name === 'login') render(); else refreshAccount(); } });
      if (TD.cloud.user()) runSync(false);
      setInterval(() => runSync(false), 10 * 60000);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') runSync(false); else scheduleSync(1500); });
    }
  }

  TD.app = { S, startLesson, runCode, renderLesson, finishLesson, runSync, render, get lesson() { return S.lesson; }, get editor() { return S.editor; } };
  boot();
})(globalThis.TD = globalThis.TD || {});
