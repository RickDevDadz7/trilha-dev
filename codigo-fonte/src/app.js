/* Trilha Dev — interface. Depende de: TD.courses (conteúdo), TD.store, TD.runners, TD.local. */
(function (TD) {
  'use strict';
  const COURSES = TD.courses || [];
  const byId = Object.fromEntries(COURSES.map((c) => [c.id, c]));
  const XP = { quiz: 5, code: 10, clean: 5, lesson: 10, review: 5 };
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
  const isUnlocked = (c, lesson) => {
    if (P().settings.unlockAll) return true;
    const ls = allLessons(c); const i = ls.findIndex((l) => l.id === lesson.id);
    return i === 0 || !!P().done[ls[i - 1].id] || !!P().done[lesson.id];
  };
  const nextLesson = (c) => allLessons(c).find((l) => !P().done[l.id]) || null;
  const liveStreak = () => (P().lastDay === dayKey() || P().lastDay === yesterday() ? P().streak : 0);
  const todayXP = () => (P().days[dayKey()] || {}).xp || 0;
  const goal = () => P().settings.goal || 30;
  function rankOf(xp) {
    let i = 0; while (i + 1 < RANKS.length && xp >= RANKS[i + 1][0]) i++;
    const cur = RANKS[i], nxt = RANKS[i + 1];
    return { level: i + 1, name: cur[1], next: nxt ? nxt[0] : null, base: cur[0], pct: nxt ? Math.round(((xp - cur[0]) / (nxt[0] - cur[0])) * 100) : 100 };
  }
  const tutorAvailable = () => !!(S.caps.sample);

  /* ---------- salvamento ---------- */
  function renderSaveState() {
    const el = document.getElementById('save-state'); if (!el) return;
    const n = S.store.pendingN;
    const where = { db: 'na sua conta Claude', native: 'no seu PC', device: 'neste navegador', local: 'neste navegador' }[S.mode];
    el.className = 'save-state' + (n ? ' busy' : S.store.lastError ? ' err' : '');
    el.textContent = n ? 'salvando...' : S.store.lastError ? 'erro ao salvar, tentando de novo' : 'salvo ' + where;
  }
  function saveProgress() { return S.store.saveProgress().catch(() => {}); }

  /* ---------- roteamento ---------- */
  function route() {
    const id = location.hash.replace('#', '');
    if (S.lesson) closeLesson(false);
    if (byId[id]) S.view = { name: 'course', id };
    else if (id === 'dados') S.view = { name: 'data' };
    else if (id === 'config') S.view = { name: 'config' };
    else S.view = { name: 'home' };
    render();
  }

  /* ---------- rail ---------- */
  function railHTML() {
    const p = P(); const r = rankOf(p.xp); const st = liveStreak();
    const gp = Math.min(100, Math.round((todayXP() / goal()) * 100));
    const v = S.view;
    return `
      <aside class="rail" aria-label="Navegação">
        <a class="brand" href="#"><span class="brand-mark">TD</span><span class="brand-name">Trilha<b>.dev</b></span></a>
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
          <a class="rail-item ${v.name === 'data' ? 'active' : ''}" href="#dados"><span class="chip sys">⇅</span><span class="mini"><span>Dados e backups</span></span></a>
          <a class="rail-item ${v.name === 'config' ? 'active' : ''}" href="#config"><span class="chip sys">⚙</span><span class="mini"><span>Configurações</span></span></a>
        </div>
        <div class="stats">
          <div class="stat streak"><b>${st}</b><small>${st === 1 ? 'dia seguido' : 'dias seguidos'}</small></div>
          <div class="stat"><b>${Object.keys(p.done).length}</b><small>lições feitas</small></div>
          <div class="stat goal"><div class="row"><small>Meta do dia</small><small style="font-family:var(--font-mono)">${todayXP()}/${goal()} XP</small></div><div class="meter" style="--accent:var(--cyan)"><i style="width:${gp}%"></i></div></div>
        </div>
        <div class="save-state" id="save-state"></div>
      </aside>`;
  }

  /* ---------- home ---------- */
  function backupNudge() {
    if (S.mode === 'db') return '';
    const last = P().settings.lastExport || 0;
    const doneN = Object.keys(P().done).length;
    if (doneN < 3 || now() - last < 7 * 86400000) return '';
    return `<div class="banner warn cut"><div class="grow"><span class="hud" style="color:var(--magenta)">Backup</span><strong>${last ? 'Seu último backup em arquivo tem mais de 7 dias' : 'Você ainda não exportou nenhum backup em arquivo'}</strong></div><a class="btn" href="#dados">Fazer backup</a></div>`;
  }
  function homeHTML() {
    const last = P().last && byId[P().last] ? byId[P().last] : null;
    const nl = last ? nextLesson(last) : null;
    const total = COURSES.reduce((a, c) => a + allLessons(c).length, 0);
    return `
      <div class="page">
        <header class="page-head">
          <span class="hud">Sistema online · ${total} lições carregadas</span>
          <h1 class="glitch">Escolha sua trilha</h1>
          <p>Do zero ao avançado em JavaScript, TypeScript, SQL e HTML/CSS. Lições curtas, código que roda na hora, testes automáticos e um tutor de IA pra destravar. Explicações em português, código em inglês.</p>
        </header>
        ${backupNudge()}
        ${last && nl ? `
          <div class="banner cut" data-course="${last.id}">
            <span class="chip lg">${esc(last.badge)}</span>
            <div class="grow"><span class="hud" style="color:var(--accent)">Continuar missão</span><strong>${esc(last.name)} · ${esc(nl.title)}</strong></div>
            <button class="btn primary" data-start="${last.id}:${nl.id}">Continuar ${ICON.play}</button>
          </div>` : ''}
        <div class="course-grid">
          ${COURSES.map((c, i) => {
            const n = allLessons(c).length, d = courseDone(c);
            return `
            <button class="course-card cut" data-course="${c.id}" data-go="${c.id}" data-idx="TRILHA_0${i + 1}">
              <div class="top"><span class="chip lg">${esc(c.badge)}</span><div><h2>${esc(c.name)}</h2><div class="tag">${esc(c.tagline)}</div></div></div>
              <p>${esc(c.desc)}</p>
              <div class="topics">${c.units.slice(0, 8).map((u) => `<span>${esc(u.title)}</span>`).join('')}${c.units.length > 8 ? `<span>+${c.units.length - 8}</span>` : ''}</div>
              <div class="meter"><i style="width:${coursePct(c)}%"></i></div>
              <div class="meta"><span>${c.units.length} módulos · ${n} lições</span><span>${d ? `${d}/${n} completas` : 'não iniciada'}</span></div>
            </button>`;
          }).join('')}
        </div>
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
                    <div class="node-wrap ${un ? '' : 'locked'}" style="transform:translateX(${off}px)">
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
            <div class="card cut"><span class="hud">Como funciona</span><p>Cada lição tem explicação, quiz e exercícios. Os testes rodam na hora. Travou? Peça uma dica ao tutor de IA. Quer pular o que já sabe? Libere todas as lições em Configurações.</p></div>
          </aside>
        </div>
      </div>`;
  }

  /* ---------- dados e backups ---------- */
  function dataHTML() {
    const where = {
      db: 'Banco privado da sua conta no Claude. Só você acessa.',
      native: 'Arquivo no seu PC, com uma cópia automática por dia (guarda as 14 mais recentes).',
      device: 'Armazenamento deste navegador. Exporte backups em arquivo de vez em quando.',
      local: 'Armazenamento deste navegador (o banco do Claude não respondeu). Exporte um backup.'
    }[S.mode];
    const last = P().settings.lastExport;
    return `
      <div class="page">
        <header class="page-head"><span class="hud">Sistema · persistência</span><h1 class="glitch">Dados e backups</h1>
          <p>Seu progresso é um registro simples (lições feitas, XP, sequência e o código que você escreveu). Ele pode ser exportado, guardado e restaurado em qualquer versão do app: Claude, navegador ou programa de PC.</p></header>
        <div class="grid2">
          <div class="card cut">
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
        </div>
      </div>`;
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
    const name = 'trilha-dev-backup-' + dayKey() + '.json';
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
            <label class="toggle"><input type="checkbox" id="cfg-unlock" ${st.unlockAll ? 'checked' : ''}> Liberar todas as lições (pular o que já sei)</label>
          </div>
          <div class="card cut">
            <span class="hud">Tutor de IA</span><h3>${inClaude ? 'Usando o Claude da sua conta' : 'Chave da API (opcional)'}</h3>
            ${inClaude ? '<p>Dentro do Claude o tutor usa a sua conta, sem configuração. Na primeira pergunta ele pede sua permissão.</p>' : `
            <p>Fora do Claude, o tutor usa a API da Anthropic com a <strong>sua</strong> chave (cobrada por uso, separada da assinatura). Crie em console.anthropic.com → API Keys. A chave fica só neste aparelho e nunca entra nos backups.</p>
            <div class="field"><label for="cfg-key">API key</label><input id="cfg-key" type="password" autocomplete="off" placeholder="sk-ant-..." value="${esc(ai.key || '')}"></div>
            <div class="row"><button class="btn primary" data-act="save-key">Salvar e testar</button>${ai.key ? '<button class="btn ghost" data-act="clear-key">Remover chave</button>' : ''}</div>`}
          </div>
          <div class="card cut">
            <span class="hud" style="color:var(--magenta)">Zona de risco</span><h3>Zerar progresso</h3>
            <p>Apaga XP, sequência e lições feitas. Faça um backup antes.</p>
            <div class="row"><button class="btn danger" data-act="reset-ask">Zerar tudo</button></div>
            <div id="reset-box"></div>
          </div>
          <div class="card cut">
            <span class="hud">Versão</span><h3>Trilha Dev</h3>
            <p>Conteúdo ${esc(TD.contentVersion || '')} · ${COURSES.reduce((a, c) => a + allLessons(c).length, 0)} lições · ${COURSES.reduce((a, c) => a + allLessons(c).reduce((b, l) => b + l.steps.filter((s) => s.t === 'code').length, 0), 0)} exercícios de código.</p>
          </div>
        </div>
      </div>`;
  }

  /* ---------- player de lição ---------- */
  function findLesson(cid, lid) { const c = byId[cid]; const l = c && allLessons(c).find((x) => x.id === lid); return l ? { c, l } : null; }
  function startLesson(cid, lid) {
    const f = findLesson(cid, lid); if (!f) return;
    P().last = cid; saveProgress();
    S.lesson = { c: f.c, lesson: f.l, i: 0, earned: 0, correct: 0, graded: 0, review: !!P().done[lid], phase: 'step', d: {} };
    renderLesson();
  }
  function closeLesson(rerender = true) { S.lesson = null; S.editor = null; if (rerender) render(); }
  function stepRunner(c, step) { return step.runner || c.runner; }
  function stepsBar(ls) { return `<div class="steps-bar" aria-hidden="true">${ls.lesson.steps.map((_, i) => `<i class="${i < ls.i || ls.phase === 'complete' ? 'on' : i === ls.i ? 'now' : ''}"></i>`).join('')}</div>`; }

  function renderLesson() {
    const ls = S.lesson; app.className = 'app in-lesson';
    const step = ls.lesson.steps[ls.i];
    const top = `<div class="lesson-top"><button class="icon-btn" data-act="quit" aria-label="Sair da lição">${ICON.close}</button><span class="title">${esc(ls.lesson.title)}</span>${stepsBar(ls)}<span class="xp-chip">+${ls.earned} XP</span></div>`;
    let body = '', foot = '';
    if (ls.phase === 'complete') {
      body = completeHTML(ls);
      foot = `<div class="lesson-foot"><div class="msg"></div><button class="btn" data-act="back">Voltar ao mapa</button>${ls.nextId ? `<button class="btn primary" data-start="${ls.c.id}:${ls.nextId}">Próxima lição ${ICON.play}</button>` : ''}</div>`;
    } else if (step.t === 'learn') {
      body = `<div class="reading"><span class="hud" style="color:var(--accent)">Briefing ${ls.i + 1}/${ls.lesson.steps.length}</span><h2>${esc(step.title)}</h2>${md(step.body)}</div>`;
      foot = `<div class="lesson-foot"><div class="msg"><span>Leia com calma. O código de exemplo é o padrão usado no mercado.</span></div><button class="btn primary" data-act="next">Continuar <kbd>Enter</kbd></button></div>`;
    } else if (step.t === 'quiz') { body = quizHTML(step, ls); foot = quizFoot(step, ls); }
    else { body = codeHTML(step, ls); foot = codeFoot(step, ls); }
    app.innerHTML = `<main class="main lesson" data-course="${ls.c.id}">${top}<div class="lesson-body">${body}</div>${foot}</main>`;
    if (step && step.t === 'code' && ls.phase !== 'complete') mountEditor(step, ls);
    else { const pb = app.querySelector('.lesson-foot .btn.primary:not(:disabled)'); if (pb) pb.focus({ preventScroll: true }); }
  }

  function quizHTML(step, ls) {
    const d = ls.d;
    return `<div class="reading"><span class="hud" style="color:var(--accent)">Quiz</span><div class="quiz-q">${inline(step.q)}</div>
      <div class="opts">${step.opts.map((o, i) => {
        let cls = ''; if (d.checked) cls = i === step.a ? 'right' : i === d.sel ? 'wrong' : ''; else if (d.sel === i) cls = 'sel';
        return `<button class="opt ${cls}" data-opt="${i}" ${d.checked ? 'disabled' : ''}><span class="k">${i + 1}</span><code>${esc(o)}</code></button>`;
      }).join('')}</div></div>`;
  }
  function quizFoot(step, ls) {
    const d = ls.d;
    if (!d.checked) return `<div class="lesson-foot"><div class="msg"><span>Escolha uma opção (teclas 1 a ${step.opts.length})</span></div><button class="btn primary" data-act="check" ${d.sel == null ? 'disabled' : ''}>Verificar <kbd>Enter</kbd></button></div>`;
    const ok = d.sel === step.a;
    return `<div class="lesson-foot ${ok ? 'good' : 'badf'}"><div class="msg"><strong>${ok ? 'Acesso liberado' : 'Resposta errada'}</strong>${md(step.why)}</div><button class="btn primary" data-act="next">Continuar <kbd>Enter</kbd></button></div>`;
  }

  function fileName(r) { return { js: 'main.js', ts: 'main.ts', sql: 'query.sql', web: 'index.html', dom: 'index.html' }[r]; }
  function codeHTML(step, ls) {
    const c = ls.c, d = ls.d, r = stepRunner(c, step);
    const saved = (S.store.state.code[ls.lesson.id] || {}).steps || {};
    return `
      <div class="workspace">
        <section class="brief">
          <span class="hud" style="color:var(--accent)">Exercício</span>
          <h2>${esc(step.title)}</h2>
          ${md(step.task)}
          ${r === 'sql' && c.dbNotes && c.dbNotes[step.db || 'shop'] ? `<div class="hint">${md(c.dbNotes[step.db || 'shop'])}</div>` : ''}
          <div><span class="hud" style="display:block;margin-bottom:8px">Testes</span><ul class="tests" id="tests">${testList(step, c, d)}</ul></div>
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
            ${saved[ls.i] != null ? '<button class="btn ghost sm" data-act="load-saved">Meu código salvo</button>' : ''}
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
    const tab = d.tab || (r === 'sql' ? 'result' : r === 'web' || r === 'dom' ? 'preview' : 'console');
    const b = (id, label) => `<button class="${tab === id ? 'on' : ''}" data-tab="${id}">${label}</button>`;
    let tabs;
    if (r === 'sql') tabs = b('result', 'Resultado') + b('expected', 'Esperado');
    else if (r === 'web') tabs = b('preview', 'Preview') + (d.res && d.res.output && d.res.output.length ? b('console', 'Console') : '');
    else if (r === 'dom') tabs = b('preview', 'Preview') + b('console', 'Console');
    else tabs = b('console', 'Console');
    return tabs + `<span class="status">${esc(d.statusText || '')}</span>`;
  }
  function tableHTML(t, caption) {
    if (!t) return '<pre class="console"><span class="dim">Nenhuma row.</span></pre>';
    return `<table class="rtable">${caption ? `<caption>${esc(caption)}</caption>` : ''}<thead><tr>${t.columns.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${t.values.slice(0, 200).map((row) => `<tr>${row.map((v) => `<td>${v === null ? 'NULL' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function consoleHTML(res, empty) {
    if (!res) return `<pre class="console"><span class="dim">${empty}</span></pre>`;
    const lines = [];
    if (res.typeErrors && res.typeErrors.length) lines.push(...res.typeErrors.map((e) => `<span class="err">${esc(e)}</span>`));
    if (res.output && res.output.length) lines.push(...res.output.map((x) => `<span class="prompt">›</span> ${esc(x)}`));
    if (res.error) lines.push(`<span class="err">${esc(res.error)}</span>`);
    if (!lines.length) lines.push('<span class="dim">(nada no console)</span>');
    return `<pre class="console">${lines.join('\n')}</pre>`;
  }
  function outBody(r, d) {
    const tab = d.tab || (r === 'sql' ? 'result' : r === 'web' || r === 'dom' ? 'preview' : 'console');
    if (r === 'web' || r === 'dom') {
      return `<iframe class="preview-frame ${tab === 'preview' ? '' : 'hidden'}" id="preview" title="Preview"></iframe><div id="dom-console" class="${tab === 'console' ? '' : 'hidden'}">${consoleHTML(d.res, 'console.log aparece aqui depois de rodar.')}</div>`;
    }
    const res = d.res;
    if (r === 'sql') {
      if (tab === 'expected') return res ? tableHTML(res.expectedTable, 'Resultado esperado') : '<pre class="console"><span class="dim">Rode a query pra comparar com o esperado.</span></pre>';
      if (!res) return '<pre class="console"><span class="dim">Rode a query pra ver o resultado aqui.</span></pre>';
      if (res.error) return `<pre class="console"><span class="err">${esc(res.error)}</span></pre>`;
      return (res.output ? `<pre class="console"><span class="dim">${esc(res.output.join('\n'))}</span></pre>` : '') + (res.table ? tableHTML(res.table) : '');
    }
    return consoleHTML(res, 'A saída do console.log aparece aqui.');
  }
  function codeFoot(step, ls) {
    const d = ls.d;
    if (d.passed) return `<div class="lesson-foot good"><div class="msg"><strong>Todos os testes passaram</strong><span>${d.usedSolution ? 'Reescreva depois sem olhar, pra fixar.' : 'Código limpo. Bora pra próxima.'}</span></div><button class="btn primary" data-act="next">Continuar <kbd>Enter</kbd></button></div>`;
    if (d.results) return `<div class="lesson-foot badf"><div class="msg"><strong>${d.results.filter((r) => r.pass).length} de ${d.results.length} testes passando</strong><span>Ajuste e rode de novo.${d.fails >= 2 ? ' A solução já está liberada se precisar.' : ''}</span></div><button class="btn primary" data-act="run">Rodar de novo</button></div>`;
    return `<div class="lesson-foot"><div class="msg"><span>Escreva o código e clique em Rodar.</span></div><button class="btn primary" data-act="run">Rodar</button></div>`;
  }
  const cmMode = (r) => ({ js: 'javascript', ts: 'text/typescript', sql: 'text/x-sqlite', web: 'htmlmixed', dom: 'htmlmixed' }[r]);

  function mountEditor(step, ls) {
    const host = document.getElementById('ed-host'); const d = ls.d; const r = stepRunner(ls.c, step);
    if (d.code == null) d.code = step.starter || '';
    const value = d.showSolution ? step.solution : d.code;
    if (window.CodeMirror) {
      S.editor = window.CodeMirror(host, {
        value, mode: cmMode(r), theme: 'neon', lineNumbers: true, tabSize: 2, indentUnit: 2, indentWithTabs: false,
        autoCloseBrackets: true, matchBrackets: true, styleActiveLine: true, readOnly: d.showSolution ? 'nocursor' : false,
        extraKeys: { 'Ctrl-Enter': () => runCode(), 'Cmd-Enter': () => runCode(), Tab: (cm) => (cm.somethingSelected() ? cm.indentSelection('add') : cm.replaceSelection('  ', 'end')) }
      });
      S.editor.on('change', () => { if (!d.showSolution) d.code = S.editor.getValue(); });
      if (!d.showSolution) setTimeout(() => { if (!S.editor) return; S.editor.refresh(); S.editor.focus(); S.editor.setCursor(S.editor.lineCount(), 0); }, 0);
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
    if (r === 'web' || r === 'dom') { const f = document.getElementById('preview'); if (f && r === 'web') f.srcdoc = TD.runners.wrapHTML(value); }
  }
  function refreshCodeChrome() {
    const ls = S.lesson, step = ls.lesson.steps[ls.i], d = ls.d, r = stepRunner(ls.c, step);
    const tests = document.getElementById('tests'); if (tests) tests.innerHTML = testList(step, ls.c, d);
    const tabs = document.getElementById('out-tabs'); if (tabs) tabs.innerHTML = outTabs(r, d);
    const ob = document.getElementById('out-body');
    if (ob) {
      if (r === 'web' || r === 'dom') {
        const tab = d.tab || 'preview';
        const f = document.getElementById('preview'); if (f) f.classList.toggle('hidden', tab !== 'preview');
        const dc = document.getElementById('dom-console'); if (dc) { dc.classList.toggle('hidden', tab !== 'console'); dc.innerHTML = consoleHTML(d.res, 'console.log aparece aqui depois de rodar.'); }
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
    const code = S.editor ? S.editor.getValue() : d.code; d.code = code;
    const r = stepRunner(ls.c, step);
    d.running = true;
    d.statusText = r === 'ts' && !window.ts ? 'carregando compilador...' : r === 'sql' && !window.initSqlJs ? 'carregando banco...' : 'executando...';
    refreshCodeChrome();
    const t0 = performance.now(); let res;
    try {
      const R = TD.runners;
      if (r === 'js') res = await R.runJS(code, step);
      else if (r === 'ts') res = await R.runTS(code, step);
      else if (r === 'sql') res = await R.runSQL(code, step, ls.c);
      else res = await R.runWeb(code, step, document.getElementById('preview'));
    } catch (e) {
      res = { output: [], results: [{ name: 'Não foi possível rodar', pass: false, err: e.message }], error: 'Não consegui carregar o que esse exercício precisa. Tente de novo.' };
    }
    d.running = false; d.res = res; d.results = res.results;
    d.statusText = `${Math.round(performance.now() - t0)} ms`;
    if (r === 'sql') d.tab = 'result';
    if (r === 'dom' && res.output && res.output.length && !res.results.every((x) => x.pass)) d.tab = d.tab || 'preview';
    const allPass = res.results.length > 0 && res.results.every((x) => x.pass);
    if (allPass && !d.passed) {
      d.passed = true;
      if (!ls.review) ls.earned += XP.code + (d.usedSolution || d.fails ? 0 : XP.clean);
      if (!d.fails && !d.usedSolution) ls.correct++;
      ls.graded++;
      const rec = S.store.state.code[ls.lesson.id] || { lesson: ls.lesson.id, steps: {} };
      rec.steps[ls.i] = code; rec.at = now();
      S.store.state.code[ls.lesson.id] = rec;
      S.store.saveCode(ls.lesson.id).catch(() => {});
    } else if (!allPass) d.fails = (d.fails || 0) + 1;
    refreshCodeChrome();
  }

  async function askTutor() {
    const ls = S.lesson, step = ls.lesson.steps[ls.i], d = ls.d;
    const q = document.getElementById('tutor-q'); d.tutorQ = q ? q.value.trim() : '';
    const sample = S.caps.sample; if (!sample) return;
    d.code = S.editor ? S.editor.getValue() : d.code;
    d.tutorBusy = true; d.tutorWait = true; d.tutorA = '...';
    rerenderBrief();
    const tests = (d.results || []).map((r) => `- [${r.pass ? 'ok' : 'falhou'}] ${r.name}${r.err ? ' (' + r.err + ')' : ''}`).join('\n') || '(o aluno ainda não rodou o código)';
    const errs = d.res ? [d.res.error, ...(d.res.typeErrors || [])].filter(Boolean).join('\n') : '';
    const r = stepRunner(ls.c, step);
    const prompt = `Você é o tutor do app Trilha Dev e está ensinando ${ls.c.name} para um brasileiro (inglês intermediário).
Regras:
- Responda em português do Brasil, direto e amigável, com um toque de humor cyberpunk se couber.
- Termos técnicos e código ficam em inglês (string, array, function, loop, query, selector, property, type...). Não traduza esses termos.
- NÃO entregue a solução completa. Aponte o problema e dê uma dica concreta. No máximo 1 ou 2 linhas de código, se for essencial.
- No máximo 120 palavras. Use crases para código inline.

Lição: ${ls.lesson.title}
Exercício: ${step.task}
${r === 'sql' && ls.c.dbNotes ? 'Banco: ' + ls.c.dbNotes[step.db || 'shop'] + '\n' : ''}
Código atual do aluno:
\`\`\`
${d.code}
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
    return `<div class="complete"><div class="trophy">${ICON.trophy}</div><span class="hud" style="color:var(--accent)">Missão concluída</span><h2 class="glitch">${ls.review ? 'Revisão feita' : 'Lição completa'}</h2><p>${esc(ls.lesson.title)} · ${esc(ls.c.name)}</p>
      <div class="tiles"><div class="tile"><small>XP ganho</small><b>+${ls.earned}</b></div><div class="tile"><small>De primeira</small><b>${pct}%</b></div><div class="tile"><small>Sequência</small><b>${liveStreak()}d</b></div></div>
      <p>Rank atual: <strong style="color:var(--yellow)">${esc(r.name)}</strong>${r.next ? ` · faltam ${r.next - P().xp} XP pro próximo` : ''}</p>
      ${ls.rankUp ? `<p style="color:var(--yellow);font-family:var(--font-display);font-size:20px;text-transform:uppercase">Novo rank desbloqueado</p>` : ''}
      ${ls.nextId ? '' : `<p>Você zerou a trilha de ${esc(ls.c.name)}.</p>`}</div>`;
  }
  function finishLesson() {
    const ls = S.lesson, p = P();
    const before = rankOf(p.xp).level;
    ls.earned += ls.review ? XP.review : XP.lesson;
    p.done[ls.lesson.id] = { at: now(), xp: ls.earned };
    p.xp += ls.earned;
    const t = dayKey();
    const day = p.days[t] || (p.days[t] = { xp: 0, lessons: 0 });
    day.xp += ls.earned; day.lessons++;
    const keys = Object.keys(p.days).sort(); while (keys.length > 400) delete p.days[keys.shift()];
    if (p.lastDay !== t) { p.streak = p.lastDay === yesterday() ? (p.streak || 0) + 1 : 1; p.lastDay = t; }
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
    ls.rankUp = rankOf(p.xp).level > before;
    saveProgress();
    const nl = nextLesson(ls.c); ls.nextId = nl ? nl.id : null;
    ls.phase = 'complete'; renderLesson();
  }
  function nextStep() {
    const ls = S.lesson, step = ls.lesson.steps[ls.i];
    if (step.t === 'code' && !ls.d.passed) return;
    if (step.t === 'quiz' && !ls.d.checked) return;
    if (ls.i + 1 >= ls.lesson.steps.length) { finishLesson(); return; }
    ls.i++; ls.d = {}; S.editor = null; renderLesson();
  }

  /* ---------- eventos ---------- */
  app.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-go],[data-start],[data-act],[data-opt],[data-tab],[data-restore-auto]'); if (!t) return;
    if (t.hasAttribute('data-start')) { const [cid, lid] = t.getAttribute('data-start').split(':'); startLesson(cid, lid); return; }
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
      case 'quit': case 'back': { const cid = ls.c.id; closeLesson(false); if (location.hash === '#' + cid) route(); else location.hash = cid; break; }
      case 'next': nextStep(); break;
      case 'check': { const step = ls.lesson.steps[ls.i]; if (ls.d.sel == null) return; ls.d.checked = true; ls.graded++; if (ls.d.sel === step.a) { ls.correct++; if (!ls.review) ls.earned += XP.quiz; } renderLesson(); break; }
      case 'run': runCode(); break;
      case 'hint': ls.d.showHint = true; ls.d.code = S.editor ? S.editor.getValue() : ls.d.code; renderLesson(); break;
      case 'reset': ls.d.code = ls.lesson.steps[ls.i].starter || ''; ls.d.showSolution = false; renderLesson(); break;
      case 'load-saved': { const s = (S.store.state.code[ls.lesson.id] || {}).steps || {}; if (s[ls.i] != null) { ls.d.code = s[ls.i]; ls.d.showSolution = false; renderLesson(); } break; }
      case 'solution': { const d = ls.d; if (!d.showSolution) { d.code = S.editor ? S.editor.getValue() : d.code; d.showSolution = true; if (!d.passed) d.usedSolution = true; } else d.showSolution = false; renderLesson(); break; }
      case 'tutor': askTutor(); break;
      case 'export': doExport(); break;
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
      case 'reset-yes': { const keep = P().settings; S.store.state.progress = Object.assign(TD.store.blankProgress(now()), { settings: keep }); await saveProgress(); toast('Progresso zerado.'); location.hash = ''; render(); break; }
      default: break;
    }
  });
  app.addEventListener('change', async (e) => {
    if (e.target.id === 'imp-file') {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { askRestore(JSON.parse(await f.text()), 'o arquivo ' + f.name); } catch (err) { toast('Arquivo inválido: não é um JSON.'); }
      e.target.value = '';
    } else if (e.target.id === 'cfg-goal') { P().settings.goal = Number(e.target.value); await saveProgress(); toast('Meta diária: ' + e.target.value + ' XP'); }
    else if (e.target.id === 'cfg-unlock') { P().settings.unlockAll = e.target.checked; await saveProgress(); toast(e.target.checked ? 'Todas as lições liberadas.' : 'Lições em sequência de novo.'); }
  });
  document.addEventListener('keydown', (e) => {
    const ls = S.lesson; if (!ls) return;
    const step = ls.lesson.steps[ls.i];
    const inField = e.target.closest && e.target.closest('textarea, input, select, .CodeMirror');
    if (e.key === 'Escape' && !inField) { const q = app.querySelector('[data-act="quit"]'); if (q) q.click(); return; }
    if (ls.phase === 'complete') return;
    if (step.t === 'quiz' && !ls.d.checked && /^[1-9]$/.test(e.key) && !inField) { const n = Number(e.key) - 1; if (n < step.opts.length) { ls.d.sel = n; renderLesson(); } return; }
    if (e.key === 'Enter' && !inField && !(e.target.closest && e.target.closest('button,a'))) {
      e.preventDefault();
      if (step.t === 'quiz' && !ls.d.checked) { if (ls.d.sel != null) app.querySelector('[data-act="check"]').click(); }
      else if (step.t !== 'code' || ls.d.passed) nextStep();
    }
  });

  /* ---------- render ---------- */
  function render() {
    if (!S.booted) return;
    if (S.lesson) { renderLesson(); return; }
    app.className = 'app';
    const v = S.view;
    const main = v.name === 'course' ? courseHTML(byId[v.id]) : v.name === 'data' ? dataHTML() : v.name === 'config' ? configHTML() : homeHTML();
    app.innerHTML = railHTML() + `<main class="main"${v.name === 'course' ? ` data-course="${v.id}"` : ''}>${main}</main>`;
    renderSaveState();
    if (v.name === 'data') fillAutoBackups();
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
    S.booted = true;
    window.addEventListener('hashchange', route);
    route();
    S.store.autoBackup(now(), TD.contentVersion).catch((e) => log('warn', 'backup automático: ' + (e.code || e.message)));
  }

  TD.app = { S, startLesson, runCode, renderLesson, get lesson() { return S.lesson; }, get editor() { return S.editor; } };
  boot();
})(globalThis.TD = globalThis.TD || {});
