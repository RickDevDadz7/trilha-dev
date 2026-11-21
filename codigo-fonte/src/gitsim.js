/* Trilha Dev — terminal simulado de Git + runner de texto (inglês/carreira).
   Nada roda no sistema de verdade: é um repositório em memória, determinístico,
   pra ensinar o modelo mental do Git (working directory → staging → commits → branches → remote). */
(function () {
  'use strict';

  function hashOf(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0').slice(0, 7);
  }

  // divide uma linha de comando respeitando aspas
  function argv(line) {
    const out = []; let cur = ''; let q = null; let has = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === q) q = null; else cur += ch; continue; }
      if (ch === '"' || ch === "'") { q = ch; has = true; continue; }
      if (/\s/.test(ch)) { if (cur || has) { out.push(cur); cur = ''; has = false; } continue; }
      cur += ch;
    }
    if (q) throw new Error('aspas não fechadas');
    if (cur || has) out.push(cur);
    return out;
  }

  class Repo {
    constructor() {
      this.wd = {};          // arquivos na pasta
      this.inited = false;
      this.index = {};       // staging area (snapshot do próximo commit)
      this.commits = {};     // hash -> { hash, msg, parents, files, author }
      this.order = [];       // hashes na ordem de criação
      this.branches = {};    // nome -> hash
      this.head = 'main';    // branch atual
      this.remotes = {};     // nome -> url
      this.remote = null;    // { branches: {nome: hash} } (o "GitHub")
      this.upstream = {};
      this.merging = null;
      this.stash = [];
      this.n = 0;
      this.config = {};
    }
    tip() { return this.branches[this.head] || null; }
    ignored(f) {
      const pats = (this.wd['.gitignore'] || '').split('\n').map((x) => x.trim()).filter((x) => x && !x.startsWith('#'));
      return pats.some((p) => p === f || (p.endsWith('/') && f.startsWith(p)) || f.startsWith(p + '/') || (p.startsWith('*.') && f.endsWith(p.slice(1))));
    }
    tree(hash) { return hash ? this.commits[hash].files : {}; }
    ancestors(hash) {
      const seen = new Set(); const st = [hash];
      while (st.length) { const h = st.pop(); if (!h || seen.has(h)) continue; seen.add(h); st.push(...this.commits[h].parents); }
      return seen;
    }
    log(hash) { // primeiro pai, mais recente primeiro
      const h = hash || this.tip();
      const all = [...this.ancestors(h)];
      return all.sort((a, b) => this.order.indexOf(b) - this.order.indexOf(a)).map((x) => this.commits[x]);
    }
    status() {
      const head = this.tree(this.tip());
      const staged = [], unstaged = [], untracked = [];
      const names = new Set([...Object.keys(head), ...Object.keys(this.index), ...Object.keys(this.wd)]);
      for (const f of [...names].sort()) {
        const inH = f in head, inI = f in this.index, inW = f in this.wd;
        if (inI && (!inH || head[f] !== this.index[f])) staged.push([inH ? 'modified' : 'new file', f]);
        if (!inI && inH) staged.push(['deleted', f]);
        if (inI && inW && this.wd[f] !== this.index[f]) unstaged.push(['modified', f]);
        if (inI && !inW) unstaged.push(['deleted', f]);
        if (!inI && !inH && inW && !this.ignored(f)) untracked.push(f);
      }
      return { staged, unstaged, untracked };
    }
    commit(msg, extraParent) {
      const parent = this.tip();
      const files = { ...this.index };
      this.n++;
      const hash = hashOf(msg + '|' + this.n + '|' + JSON.stringify(files));
      this.commits[hash] = { hash, msg, parents: [parent, extraParent].filter(Boolean), files, author: this.config['user.name'] || 'You' };
      this.order.push(hash);
      this.branches[this.head] = hash;
      return hash;
    }
    checkoutTree(hash) { const t = this.tree(hash); this.wd = { ...t }; this.index = { ...t }; }
  }

  function exec(repo, line, out) {
    const a = argv(line);
    if (!a.length) return;
    // redirecionamento: echo "x" > file / >> file
    const redir = a.findIndex((x) => x === '>' || x === '>>');
    if (a[0] === 'echo') {
      if (redir > 0) {
        const file = a[redir + 1]; if (!file) throw new Error('faltou o nome do arquivo depois de >');
        const text = a.slice(1, redir).join(' ');
        repo.wd[file] = a[redir] === '>>' && file in repo.wd ? repo.wd[file] + '\n' + text : text;
      } else out.push(a.slice(1).join(' '));
      return;
    }
    if (a[0] === 'touch') { for (const f of a.slice(1)) if (!(f in repo.wd)) repo.wd[f] = ''; return; }
    if (a[0] === 'cat') { for (const f of a.slice(1)) { if (!(f in repo.wd)) throw new Error(`cat: ${f}: No such file or directory`); out.push(repo.wd[f]); } return; }
    if (a[0] === 'ls') { const fs = Object.keys(repo.wd).sort(); if (fs.length) out.push(fs.join('  ')); return; }
    if (a[0] === 'rm') { for (const f of a.slice(1)) { if (!(f in repo.wd)) throw new Error(`rm: ${f}: No such file or directory`); delete repo.wd[f]; } return; }
    if (a[0] === 'mkdir' || a[0] === 'cd' || a[0] === 'clear' || a[0] === 'pwd') return;
    if (a[0] !== 'git') throw new Error(`${a[0]}: command not found (aqui só funcionam git, echo, touch, cat, ls e rm)`);
    gitCmd(repo, a.slice(1), out);
  }

  function needRepo(repo) { if (!repo.inited) throw new Error('fatal: not a git repository (or any of the parent directories): .git'); }

  function gitCmd(repo, a, out) {
    const cmd = a[0]; const args = a.slice(1);
    const flag = (...f) => args.some((x) => f.includes(x));
    const valOf = (...f) => { const i = args.findIndex((x) => f.includes(x)); return i >= 0 ? args[i + 1] : undefined; };
    switch (cmd) {
      case undefined: throw new Error('usage: git <command>');
      case '--version': case 'version': out.push('git version 2.47.0'); return;
      case 'config': {
        const k = args.filter((x) => !x.startsWith('--'));
        if (k.length >= 2) repo.config[k[0]] = k.slice(1).join(' ');
        else if (k.length === 1) out.push(repo.config[k[0]] || '');
        return;
      }
      case 'init': {
        if (repo.inited) { out.push('Reinitialized existing Git repository in /project/.git/'); return; }
        repo.inited = true; const b = valOf('-b', '--initial-branch'); if (b) repo.head = b;
        out.push('Initialized empty Git repository in /project/.git/'); return;
      }
      case 'clone': {
        const url = args.find((x) => !x.startsWith('-'));
        if (!url) throw new Error('fatal: You must specify a repository to clone.');
        if (!repo.remote) throw new Error(`fatal: repository '${url}' not found`);
        repo.inited = true; repo.remotes.origin = url; repo.head = 'main';
        for (const [b, h] of Object.entries(repo.remote.branches)) repo.branches[b] = h;
        repo.upstream.main = 'origin/main'; repo.checkoutTree(repo.branches.main);
        out.push(`Cloning into '${url.split('/').pop().replace(/\.git$/, '')}'...`, 'done.'); return;
      }
    }
    needRepo(repo);
    switch (cmd) {
      case 'status': {
        const s = repo.status();
        out.push(`On branch ${repo.head}`);
        if (repo.merging) out.push('You have unmerged paths.', '  (fix conflicts and run "git commit")');
        if (!repo.tip()) out.push('', 'No commits yet');
        if (s.staged.length) { out.push('', 'Changes to be committed:'); s.staged.forEach(([k, f]) => out.push(`\t${(k + ':').padEnd(12)}${f}`)); }
        if (s.unstaged.length) { out.push('', 'Changes not staged for commit:'); s.unstaged.forEach(([k, f]) => out.push(`\t${(k + ':').padEnd(12)}${f}`)); }
        if (s.untracked.length) { out.push('', 'Untracked files:'); s.untracked.forEach((f) => out.push('\t' + f)); }
        if (!s.staged.length && !s.unstaged.length && !s.untracked.length) out.push(repo.tip() ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)');
        return;
      }
      case 'add': {
        const paths = args.filter((x) => !x.startsWith('-'));
        if (!paths.length) throw new Error('Nothing specified, nothing added.');
        const all = paths.includes('.') || flag('-A', '--all');
        const names = all ? new Set([...Object.keys(repo.wd), ...Object.keys(repo.index)]) : new Set(paths);
        for (const f of names) {
          if (all && !(f in repo.index) && repo.ignored(f)) continue;
          if (!all && repo.ignored(f) && !(f in repo.index)) throw new Error(`The following paths are ignored by one of your .gitignore files:\n${f}`);
          if (f in repo.wd) repo.index[f] = repo.wd[f];
          else if (f in repo.index) delete repo.index[f];
          else throw new Error(`fatal: pathspec '${f}' did not match any files`);
        }
        if (repo.merging) for (const f of names) repo.merging.conflicts.delete(f);
        return;
      }
      case 'restore': {
        const paths = args.filter((x) => !x.startsWith('-'));
        const head = repo.tree(repo.tip());
        for (const f of paths) {
          if (flag('--staged')) { if (f in head) repo.index[f] = head[f]; else delete repo.index[f]; }
          else if (f in repo.index) repo.wd[f] = repo.index[f];
          else throw new Error(`error: pathspec '${f}' did not match any file(s) known to git`);
        }
        return;
      }
      case 'rm': {
        for (const f of args.filter((x) => !x.startsWith('-'))) { delete repo.index[f]; if (!flag('--cached')) delete repo.wd[f]; }
        return;
      }
      case 'commit': {
        const msg = valOf('-m', '-am');
        if (msg === undefined) throw new Error('error: aqui use sempre git commit -m "mensagem"');
        if (!msg.trim()) throw new Error('Aborting commit due to empty commit message.');
        if (flag('-a', '-am')) for (const f of Object.keys(repo.index)) { if (f in repo.wd) repo.index[f] = repo.wd[f]; else delete repo.index[f]; }
        if (repo.merging) {
          if (repo.merging.conflicts.size) throw new Error('error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add <file>\'');
          const h = repo.commit(msg, repo.merging.other); repo.merging = null;
          out.push(`[${repo.head} ${h}] ${msg}`); return;
        }
        if (flag('--amend')) {
          const t = repo.tip(); if (!t) throw new Error('fatal: You have nothing to amend.');
          const old = repo.commits[t]; repo.branches[repo.head] = old.parents[0] || undefined;
          if (!old.parents[0]) delete repo.branches[repo.head];
          const h = repo.commit(msg); repo.commits[h].parents = old.parents.slice();
          out.push(`[${repo.head} ${h}] ${msg}`); return;
        }
        const s = repo.status();
        if (!s.staged.length) { out.push(`On branch ${repo.head}`, 'nothing added to commit but untracked files present (use "git add" to track)'); throw new Error('nada pra commitar: rode git add antes'); }
        const root = !repo.tip();
        const h = repo.commit(msg);
        out.push(`[${repo.head}${root ? ' (root-commit)' : ''} ${h}] ${msg}`, ` ${s.staged.length} file${s.staged.length > 1 ? 's' : ''} changed`);
        return;
      }
      case 'log': {
        if (!repo.tip()) throw new Error(`fatal: your current branch '${repo.head}' does not have any commits yet`);
        const n = Number((args.find((x) => /^-\d+$/.test(x)) || '').slice(1)) || Infinity;
        const all = repo.log().slice(0, n);
        const refs = (h) => { const b = Object.entries(repo.branches).filter(([, x]) => x === h).map(([k]) => (k === repo.head ? 'HEAD -> ' + k : k)); return b.length ? ` (${b.join(', ')})` : ''; };
        if (flag('--oneline')) all.forEach((c) => out.push(`${c.hash}${refs(c.hash)} ${c.msg}`));
        else all.forEach((c, i) => { if (i) out.push(''); out.push(`commit ${c.hash}${refs(c.hash)}`, `Author: ${c.author}`, '', `    ${c.msg}`); });
        return;
      }
      case 'diff': {
        const base = flag('--staged', '--cached') ? repo.tree(repo.tip()) : repo.index;
        const cur = flag('--staged', '--cached') ? repo.index : repo.wd;
        for (const f of Object.keys({ ...base, ...cur }).sort()) {
          if (base[f] === cur[f] || (!flag('--staged', '--cached') && !(f in repo.index))) continue;
          out.push(`diff --git a/${f} b/${f}`);
          (base[f] || '').split('\n').filter((l) => l && !(cur[f] || '').split('\n').includes(l)).forEach((l) => out.push('-' + l));
          (cur[f] || '').split('\n').filter((l) => l && !(base[f] || '').split('\n').includes(l)).forEach((l) => out.push('+' + l));
        }
        return;
      }
      case 'branch': {
        const names = args.filter((x) => !x.startsWith('-'));
        if (flag('-d', '-D')) {
          for (const b of names) {
            if (!(b in repo.branches)) throw new Error(`error: branch '${b}' not found.`);
            if (b === repo.head) throw new Error(`error: Cannot delete branch '${b}' checked out`);
            if (flag('-d') && !repo.ancestors(repo.tip()).has(repo.branches[b])) throw new Error(`error: The branch '${b}' is not fully merged.`);
            delete repo.branches[b]; out.push(`Deleted branch ${b}.`);
          }
          return;
        }
        if (flag('-m')) { const [from, to] = names.length === 2 ? names : [repo.head, names[0]]; repo.branches[to] = repo.branches[from]; delete repo.branches[from]; if (repo.head === from) repo.head = to; return; }
        if (!names.length) { const bs = new Set([...Object.keys(repo.branches), repo.head]); [...bs].sort().forEach((b) => out.push((b === repo.head ? '* ' : '  ') + b)); return; }
        if (!repo.tip()) throw new Error(`fatal: not a valid object name: '${repo.head}'`);
        if (names[0] in repo.branches) throw new Error(`fatal: a branch named '${names[0]}' already exists`);
        repo.branches[names[0]] = repo.tip(); return;
      }
      case 'switch': case 'checkout': {
        const create = flag('-c', '-b');
        const name = args.filter((x) => !x.startsWith('-'))[0];
        if (!name) throw new Error('fatal: missing branch name');
        if (cmd === 'checkout' && !create && name in repo.wd && !(name in repo.branches)) { repo.wd[name] = repo.index[name]; return; }
        const s = repo.status();
        if (s.staged.length || s.unstaged.length) throw new Error('error: Your local changes would be overwritten by checkout.\nPlease commit your changes or stash them before you switch branches.');
        if (create) {
          if (name in repo.branches) throw new Error(`fatal: a branch named '${name}' already exists`);
          if (repo.tip()) repo.branches[name] = repo.tip();
          repo.head = name; out.push(`Switched to a new branch '${name}'`); return;
        }
        if (!(name in repo.branches)) {
          if (repo.remote && name in repo.remote.branches) { repo.branches[name] = repo.remote.branches[name]; repo.upstream[name] = 'origin/' + name; }
          else throw new Error(`error: pathspec '${name}' did not match any file(s) known to git`);
        }
        repo.head = name; repo.checkoutTree(repo.branches[name]); out.push(`Switched to branch '${name}'`); return;
      }
      case 'merge': {
        if (flag('--abort')) { if (!repo.merging) throw new Error('fatal: There is no merge to abort.'); repo.checkoutTree(repo.tip()); repo.merging = null; return; }
        const name = args.filter((x) => !x.startsWith('-'))[0];
        const other = name && name.startsWith('origin/') && repo.remote ? repo.remote.branches[name.slice(7)] : repo.branches[name];
        if (!other) throw new Error(`merge: ${name} - not something we can merge`);
        const mine = repo.tip();
        if (repo.ancestors(mine).has(other)) { out.push('Already up to date.'); return; }
        if (!mine || repo.ancestors(other).has(mine)) { repo.branches[repo.head] = other; repo.checkoutTree(other); out.push(`Updating ${mine || '0000000'}..${other}`, 'Fast-forward'); return; }
        // merge de 3 vias simples por arquivo
        const A = repo.ancestors(mine), B = repo.ancestors(other);
        const common = repo.order.slice().reverse().find((h) => A.has(h) && B.has(h));
        const base = repo.tree(common), ours = repo.tree(mine), theirs = repo.tree(other);
        const merged = {}; const conflicts = new Set();
        for (const f of new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)])) {
          const b = base[f], o = ours[f], t = theirs[f];
          if (o === t) { if (o !== undefined) merged[f] = o; }
          else if (o === b) { if (t !== undefined) merged[f] = t; }
          else if (t === b) { if (o !== undefined) merged[f] = o; }
          else { conflicts.add(f); merged[f] = `<<<<<<< HEAD\n${o || ''}\n=======\n${t || ''}\n>>>>>>> ${name}`; }
        }
        repo.wd = { ...merged };
        if (conflicts.size) {
          repo.index = { ...ours }; for (const f of Object.keys(merged)) if (!conflicts.has(f)) repo.index[f] = merged[f];
          repo.merging = { other, conflicts };
          for (const f of conflicts) out.push(`CONFLICT (content): Merge conflict in ${f}`);
          out.push('Automatic merge failed; fix conflicts and then commit the result.');
          return;
        }
        repo.index = { ...merged };
        const h = repo.commit(`Merge branch '${name}'`, other);
        out.push(`Merge made by the 'ort' strategy. (${h})`);
        return;
      }
      case 'remote': {
        if (args[0] === 'add') { if (!args[1] || !args[2]) throw new Error('usage: git remote add <name> <url>'); repo.remotes[args[1]] = args[2]; if (!repo.remote) repo.remote = { branches: {} }; return; }
        if (args[0] === '-v') { for (const [k, u] of Object.entries(repo.remotes)) out.push(`${k}\t${u} (fetch)`, `${k}\t${u} (push)`); return; }
        Object.keys(repo.remotes).forEach((k) => out.push(k)); return;
      }
      case 'push': {
        const pos = args.filter((x) => !x.startsWith('-'));
        const rem = pos[0] || 'origin';
        if (!repo.remotes[rem]) throw new Error(`fatal: '${rem}' does not appear to be a git repository`);
        const br = pos[1] || (repo.upstream[repo.head] ? repo.head : null);
        if (!br) throw new Error(`fatal: The current branch ${repo.head} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push -u origin ${repo.head}`);
        const local = repo.branches[br]; if (!local) throw new Error(`error: src refspec ${br} does not match any`);
        const remoteTip = repo.remote.branches[br];
        if (remoteTip && !repo.ancestors(local).has(remoteTip)) throw new Error(`! [rejected]        ${br} -> ${br} (fetch first)\nerror: failed to push some refs. Use git pull first.`);
        if (remoteTip === local && !flag('-u', '--set-upstream')) { out.push('Everything up-to-date'); return; }
        repo.remote.branches[br] = local;
        if (flag('-u', '--set-upstream')) repo.upstream[br] = rem + '/' + br;
        out.push(`To ${repo.remotes[rem]}`, `   ${remoteTip || '0000000'}..${local}  ${br} -> ${br}`);
        if (flag('-u', '--set-upstream')) out.push(`branch '${br}' set up to track '${rem}/${br}'.`);
        return;
      }
      case 'fetch': { if (!repo.remote) throw new Error('fatal: no remote configured'); out.push('From ' + (repo.remotes.origin || 'origin')); return; }
      case 'pull': {
        if (!repo.remote) throw new Error('fatal: no remote configured');
        const tip = repo.remote.branches[repo.head];
        if (!tip) throw new Error('There is no tracking information for the current branch.');
        gitCmd(repo, ['merge', 'origin/' + repo.head], out); return;
      }
      case 'stash': {
        if (args[0] === 'pop') { const s = repo.stash.pop(); if (!s) throw new Error('No stash entries found.'); repo.wd = s.wd; repo.index = s.index; out.push('Dropped refs/stash@{0}'); return; }
        if (args[0] === 'list') { repo.stash.slice().reverse().forEach((_, i) => out.push(`stash@{${i}}: WIP on ${repo.head}`)); return; }
        const s = repo.status(); if (!s.staged.length && !s.unstaged.length) { out.push('No local changes to save'); return; }
        repo.stash.push({ wd: { ...repo.wd }, index: { ...repo.index } });
        const t = repo.tree(repo.tip()); const keep = {}; for (const f of s.untracked) keep[f] = repo.wd[f];
        repo.wd = { ...t, ...keep }; repo.index = { ...t };
        out.push(`Saved working directory and index state WIP on ${repo.head}`); return;
      }
      case 'reset': {
        const target = args.find((x) => /^HEAD(~\d+)?$/.test(x)) || 'HEAD';
        let h = repo.tip(); const k = Number((target.split('~')[1]) || 0);
        for (let i = 0; i < k; i++) h = repo.commits[h] && repo.commits[h].parents[0];
        if (k && !h) throw new Error("fatal: ambiguous argument 'HEAD~': unknown revision");
        repo.branches[repo.head] = h;
        if (flag('--hard')) repo.checkoutTree(h);
        else if (!flag('--soft')) repo.index = { ...repo.tree(h) };
        return;
      }
      case 'revert': {
        const h = args[0] === 'HEAD' ? repo.tip() : args[0];
        const c = repo.commits[h]; if (!c) throw new Error(`fatal: bad revision '${args[0]}'`);
        const parent = repo.tree(c.parents[0]);
        for (const f of new Set([...Object.keys(c.files), ...Object.keys(parent)])) {
          if (c.files[f] === parent[f]) continue;
          if (f in parent) { repo.index[f] = parent[f]; repo.wd[f] = parent[f]; } else { delete repo.index[f]; delete repo.wd[f]; }
        }
        const nh = repo.commit(`Revert "${c.msg}"`); out.push(`[${repo.head} ${nh}] Revert "${c.msg}"`); return;
      }
      case 'tag': { const n = args.find((x) => !x.startsWith('-')); if (!n) { out.push(...Object.keys(repo.tags || {})); return; } repo.tags = repo.tags || {}; repo.tags[n] = repo.tip(); return; }
      default: throw new Error(`git: '${cmd}' is not a git command (ou ainda não existe neste simulador).`);
    }
  }

  // roda um script (uma linha por comando). Comentários com # são ignorados.
  function runScript(code, setup) {
    const repo = new Repo();
    if (setup && setup.remote) { repo.remote = { branches: {} }; }
    if (setup && setup.cmds) for (const l of setup.cmds) exec(repo, l, []);
    if (setup && setup.publish) { // simula um repo que já existe no GitHub
      repo.remote = { branches: {} };
      const map = setup.publish === true ? { main: 'main' } : setup.publish;
      for (const [rb, lb] of Object.entries(map)) repo.remote.branches[rb] = repo.branches[lb];
      repo.remotes.origin = 'https://github.com/rick/app.git';
      for (const rb of Object.keys(map)) if (rb in repo.branches) repo.upstream[rb] = 'origin/' + rb;
    }
    if (setup && setup.drop) for (const b of setup.drop) delete repo.branches[b];
    if (setup && setup.switchTo) { repo.head = setup.switchTo; repo.checkoutTree(repo.branches[setup.switchTo]); }
    if (setup && setup.fresh) { const r2 = new Repo(); r2.remote = repo.remote; r2.commits = repo.commits; r2.order = repo.order; r2.n = repo.n; return finish(r2); }
    return finish(repo);
    function finish(r) {
      const transcript = []; const cmds = []; let error = null;
      for (const raw of code.split('\n')) {
        const line = raw.replace(/^\s*\$\s*/, '').trim();
        if (!line || line.startsWith('#')) continue;
        cmds.push(line); transcript.push('$ ' + line);
        const out = [];
        try { exec(r, line, out); transcript.push(...out); }
        catch (e) { transcript.push(...out); transcript.push('!! ' + e.message); error = e.message; break; }
      }
      return { repo: r, transcript, cmds, error };
    }
  }

  function runGit(code, step) {
    const results = [];
    let run;
    try { run = runScript(code, step.setup); }
    catch (e) { return Promise.resolve({ output: [], raw: true, results: [{ name: 'O setup do exercício quebrou', pass: false, err: e.message }], error: e.message }); }
    const { repo, transcript, cmds, error } = run;
    const api = {
      repo, cmds,
      files: repo.wd, staged: repo.index,
      branch: repo.head,
      branches: Object.keys(repo.branches),
      commits: repo.tip() ? repo.log() : [],
      status: repo.status(),
      clean: (() => { const s = repo.status(); return !s.staged.length && !s.unstaged.length && !s.untracked.length; })(),
      remote: repo.remote ? repo.remote.branches : {},
      remotes: repo.remotes,
      used: (re) => cmds.some((c) => new RegExp(re).test(c)),
      tipMsg: repo.tip() ? repo.commits[repo.tip()].msg : null,
      isMerge: repo.tip() ? repo.commits[repo.tip()].parents.length > 1 : false,
      merging: !!repo.merging,
    };
    for (const [name, expr] of step.tests || []) {
      try { results.push({ name, pass: !!new Function(...Object.keys(api), 'return (' + expr + ')')(...Object.values(api)) }); }
      catch (e) { results.push({ name, pass: false, err: e.message }); }
    }
    if (error && results.every((r) => r.pass)) results.push({ name: 'Todos os comandos rodam sem erro', pass: false });
    return Promise.resolve({ output: transcript, raw: true, results, explainMsg: error });
  }

  /* ---------- runner de texto (inglês e carreira) ---------- */
  function runText(code, step) {
    const text = code.split('\n').filter((l) => !/^\s*#(?!#)/.test(l)).join('\n').trim();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const words = (text.match(/[A-Za-zÀ-ÿ0-9'’-]+/g) || []);
    const api = { text, lines, words, lower: text.toLowerCase(), has: (w) => new RegExp('\\b' + w + '\\b', 'i').test(text) };
    const results = (step.tests || []).map(([name, expr]) => {
      try { return { name, pass: !!new Function(...Object.keys(api), 'return (' + expr + ')')(...Object.values(api)) }; }
      catch (e) { return { name, pass: false, err: e.message }; }
    });
    const out = text ? [`${words.length} words · ${lines.length} line${lines.length === 1 ? '' : 's'}`] : ['(escreva seu texto no editor)'];
    return Promise.resolve({ output: out, results });
  }

  TD.gitsim = { Repo, exec, runScript, argv };
  Object.assign(TD.runners, { runGit, runText });
})();
