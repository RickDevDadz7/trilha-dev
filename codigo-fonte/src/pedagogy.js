/* Método Trilha: o motor pedagógico. Vale pra QUALQUER trilha, inclusive as que forem criadas no futuro,
 * porque trabalha só com o formato das lições (learn / quiz / predict / code) e nunca com uma linguagem específica.
 *
 * Base em pesquisa (detalhes em PEDAGOGIA.md):
 *  - Segmentação / carga cognitiva: teoria em cartões pequenos, revelados um de cada vez.
 *  - Worked examples: a teoria da lição fica à mão durante o exercício.
 *  - Parsons problems: "montar com blocos" gerado da solução, como ajuda (Hou & Ericson).
 *  - PRIMM: passos "prever a saída" antes de escrever código.
 *  - Retrieval practice + spacing: revisão espaçada automática (caixas de Leitner).
 *  - Interleaving: revisões e checkpoints misturam assuntos.
 *  - Mastery learning: checkpoint por módulo antes de liberar o próximo.
 *  - Mensagens de erro explicadas (Becker). */
(function (TD) {
  'use strict';
  const DAY = 86400000;
  const INTERVALS = [1, 3, 7, 14, 30, 60]; // dias por caixa
  const CHECKPOINT_PASS = 0.7;
  const REVIEW_CAP = 12;

  /* ---------- 1. teoria em cartões ---------- */
  const words = (s) => (s.replace(/(~~~|```)[\s\S]*?(~~~|```)/g, ' ').match(/\S+/g) || []).length;
  function chunkBody(body) {
    const parts = String(body).split(/((?:~~~|```)[a-z]*\n[\s\S]*?(?:~~~|```))/);
    const blocks = [];
    parts.forEach((p, i) => {
      if (i % 2 === 1) blocks.push({ code: true, text: p });
      else p.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean).forEach((b) => blocks.push({ code: false, text: b }));
    });
    const chunks = []; let cur = [];
    const close = () => { if (cur.length) { chunks.push(cur.map((b) => b.text).join('\n\n')); cur = []; } };
    for (const b of blocks) {
      cur.push(b);
      const textWords = cur.filter((x) => !x.code).reduce((a, x) => a + words(x.text), 0);
      if (b.code || textWords > 70) close();
    }
    if (cur.length) {
      const w = cur.reduce((a, x) => a + words(x.text), 0);
      if (chunks.length && w < 25) chunks[chunks.length - 1] += '\n\n' + cur.map((b) => b.text).join('\n\n');
      else close();
    }
    return chunks.length ? chunks : [String(body)];
  }

  /* ---------- 2. Parsons: montar com blocos ---------- */
  function seeded(seed) { let h = 2166136261; for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
  function parsonsBlocks(step, seed) {
    const lines = String(step.solution || '').split('\n').filter((l) => l.trim() !== '');
    if (lines.length < 2 || lines.length > 28) return null;
    const blocks = lines.map((text, i) => ({ id: 'b' + i, text }));
    const rnd = seeded(seed || step.title || 'x');
    const order = blocks.slice();
    for (let tries = 0; tries < 6; tries++) {
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      if (order.some((b, i) => b.id !== blocks[i].id)) break;
    }
    return order;
  }

  /* ---------- 3. mensagens de erro explicadas ---------- */
  const ERRORS = {
    js: [
      [/is not defined/, 'Você usou um nome que não existe. Confira se escreveu igualzinho (maiúsculas contam) e se criou a variável ou function antes de usar.'],
      [/Assignment to constant variable/, 'Você tentou mudar o valor de uma `const`. Se o valor precisa mudar, declare com `let`.'],
      [/has already been declared/, 'Você declarou o mesmo nome duas vezes. Use `let`/`const` só na primeira vez; depois é só `nome = valor`.'],
      [/is not a function/, 'Você chamou com `()` algo que não é function. Confira o nome do method (ex: `toUpperCase`, não `toUppercase`).'],
      [/Cannot read propert(y|ies) of (undefined|null)/, 'Você tentou ler uma property de algo que é `undefined`/`null`. O valor antes do ponto não existe: mostre ele com `console.log` ou use `?.`.'],
      [/Unexpected end of input/, 'O código terminou "no meio": provavelmente falta fechar uma `}` ou `)`.'],
      [/missing \) after argument list/, 'Falta fechar um parêntese `)` ou separar argumentos com vírgula.'],
      [/Invalid or unexpected token|Unterminated string/, 'Tem uma aspa aberta sem fechar, ou um caractere estranho. Confira as aspas `"`, `\'` e a crase.'],
      [/Unexpected (token|identifier|string|number)/, 'Erro de sintaxe: sobrou ou faltou algum símbolo (vírgula, parêntese, chave, aspas). Olhe a linha e a anterior.'],
      [/Maximum call stack/, 'Uma function chamou a si mesma sem parar. Confira o caso base da recursão.'],
      [/loop infinito/, 'Algum loop nunca termina. Confira se a condição do `while`/`for` em algum momento fica `false`.']
    ],
    ts: [
      [/is not assignable to (type|parameter)/, 'O valor não bate com o tipo declarado. Compare o tipo do valor com o tipo que você anotou.'],
      [/implicitly has an 'any' type/, 'Faltou anotar o tipo desse parâmetro: escreva `nome: tipo` (ex: `width: number`).'],
      [/Cannot find name/, 'Esse nome não existe. Confira a grafia e se você declarou o type/interface/variável.'],
      [/Property '.+' does not exist on type/, 'Essa property não existe nesse tipo. Confira o nome ou adicione a property na interface.'],
      [/is missing the following properties|is missing in type/, 'Faltam properties obrigatórias no object. Confira a interface.'],
      [/Unused '@ts-expect-error' directive/, 'Um teste de tipo esperava um erro e ele não aconteceu: seu tipo está aceitando valores que deveria recusar.'],
      [/lacks ending return statement|Not all code paths return a value/, 'Algum caminho da function termina sem `return`. Trate todos os casos.']
    ],
    git: [
      [/not a git repository/, 'Essa pasta ainda não é um repositório. Comece com `git init` (ou `git clone <url>` pra baixar um que já existe).'],
      [/nada pra commitar|nothing added to commit/, 'O commit só leva o que está na staging area. Rode `git add <arquivo>` (ou `git add .`) antes do `git commit`.'],
      [/did not match any/, 'Esse nome de arquivo ou branch não existe. Confira com `ls` (arquivos) ou `git branch` (branches).'],
      [/has no upstream branch/, 'Na primeira vez que manda uma branch pro GitHub, use `git push -u origin <branch>`. Depois disso, só `git push` basta.'],
      [/rejected|fetch first/, 'O GitHub tem commits que você não tem. Rode `git pull` primeiro, resolva o que precisar e aí faça `git push`.'],
      [/unmerged files|fix conflicts/, 'Tem conflito. Abra o arquivo, escolha o conteúdo final (apagando as linhas `<<<<<<<`, `=======` e `>>>>>>>`), depois `git add` e `git commit`.'],
      [/would be overwritten/, 'Você tem mudanças sem commit. Faça commit (ou `git stash`) antes de trocar de branch.'],
      [/not fully merged/, 'Essa branch tem commits que ainda não estão na atual. Faça o merge antes, ou use `-D` se quer jogar fora mesmo.'],
      [/command not found/, 'Esse terminal simulado só entende `git`, `echo`, `touch`, `cat`, `ls` e `rm`.'],
      [/is not a git command/, 'Confira a grafia do comando. Os mais usados: `status`, `add`, `commit`, `log`, `branch`, `switch`, `merge`, `push`, `pull`.'],
      [/aspas não fechadas/, 'Faltou fechar as aspas da mensagem: `git commit -m "mensagem"`.'],
    ],
    sql: [
      [/no such column/, 'Essa column não existe. Confira o nome na descrição do banco (e o alias da table, como `c.name`).'],
      [/no such table/, 'Essa table não existe. Confira o nome na descrição do banco.'],
      [/ambiguous column name/, 'A column existe nas duas tables do JOIN. Diga de qual é, com o alias: `c.id` ou `o.id`.'],
      [/misuse of aggregate/, 'Você usou `COUNT`/`SUM`/`AVG` no `WHERE`. Condições sobre aggregates vão no `HAVING`.'],
      [/UNIQUE constraint failed/, 'Já existe uma row com esse valor (ex: o mesmo `id`). Use outro valor.'],
      [/NOT NULL constraint failed/, 'Uma column obrigatória ficou sem valor. Inclua ela no INSERT.'],
      [/CHECK constraint failed/, 'O valor viola uma regra `CHECK` da table (ex: saldo negativo).'],
      [/incomplete input/, 'O comando terminou no meio: falta fechar um parêntese ou uma aspa.'],
      [/syntax error/, 'Erro de sintaxe SQL. Confira: vírgula entre columns, texto em aspas simples e a ordem SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.']
    ],
    web: [], dom: []
  };
  ERRORS.dom = ERRORS.js;
  function explainError(runner, msg) {
    if (!msg) return null;
    const list = (ERRORS[runner] || []).concat(runner === 'ts' ? ERRORS.js : []);
    const hit = list.find(([re]) => re.test(msg));
    return hit ? hit[1] : null;
  }

  /* ---------- 4. revisão espaçada (Leitner) ---------- */
  const isPracticeStep = (s) => s.t === 'quiz' || s.t === 'predict' || s.t === 'code';
  function schedule(item, correct, now) {
    const box = correct ? Math.min((item ? item.box : 0) + 1, INTERVALS.length - 1) : 0;
    return { box, due: now + INTERVALS[box] * DAY, seen: ((item && item.seen) || 0) + 1, last: correct ? 1 : 0 };
  }
  function enrollLesson(progress, lesson, results, now) {
    progress.srs = progress.srs || {};
    lesson.steps.forEach((s, i) => {
      if (!isPracticeStep(s)) return;
      const key = lesson.id + '#' + i;
      if (progress.srs[key] && results[i] === undefined) return;
      progress.srs[key] = results[i] === undefined ? { box: 0, due: now + DAY, seen: 0 } : schedule(progress.srs[key], results[i], now);
    });
  }
  function findStep(courses, key) {
    const [lid, idx] = key.split('#');
    for (const c of courses) for (const u of c.units) for (const l of u.lessons) if (l.id === lid) return { c, l, step: l.steps[Number(idx)], i: Number(idx) };
    return null;
  }
  function dueItems(progress, courses, now) {
    const srs = progress.srs || {};
    const due = Object.keys(srs).filter((k) => srs[k].due <= now).map((k) => ({ key: k, ...findStep(courses, k), meta: srs[k] })).filter((x) => x.step);
    due.sort((a, b) => a.meta.due - b.meta.due);
    // interleaving: alterna entre trilhas e lições
    const byCourse = {}; due.forEach((d) => (byCourse[d.c.id] = byCourse[d.c.id] || []).push(d));
    const out = []; const queues = Object.values(byCourse);
    while (out.length < REVIEW_CAP && queues.some((q) => q.length)) for (const q of queues) if (q.length && out.length < REVIEW_CAP) out.push(q.shift());
    return out;
  }
  function nextDue(progress) {
    const v = Object.values(progress.srs || {}).map((x) => x.due);
    return v.length ? Math.min(...v) : null;
  }

  /* ---------- 5. checkpoint do módulo (mastery + interleaving) ---------- */
  const unitKey = (c, ui) => c.id + '-u' + ui;
  function checkpointLesson(c, ui, seed) {
    const u = c.units[ui];
    const rnd = seeded('cp' + c.id + ui + (seed || ''));
    const refs = [];
    u.lessons.forEach((l) => l.steps.forEach((s, i) => { if (s.t === 'quiz' || s.t === 'predict') refs.push({ l, s, i }); }));
    const codes = [];
    u.lessons.forEach((l) => l.steps.forEach((s, i) => { if (s.t === 'code' && parsonsBlocks(s, 'x')) codes.push({ l, s, i }); }));
    const pick = (arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
    const chosen = pick(refs, 6).concat(pick(codes, 2));
    const steps = pick(chosen, chosen.length).map((x) => Object.assign({}, x.s, { _from: x.l.id + '#' + x.i, _fromTitle: x.l.title, _blocks: x.s.t === 'code' }));
    if (!steps.length) return null;
    return { id: unitKey(c, ui) + '-check', title: 'Checkpoint: ' + u.title, steps, checkpoint: { course: c.id, unit: ui } };
  }
  function unitMastered(progress, c, ui) {
    const m = (progress.mastery || {})[unitKey(c, ui)];
    return !!m && m.best >= CHECKPOINT_PASS;
  }

  TD.ped = { chunkBody, parsonsBlocks, explainError, schedule, enrollLesson, dueItems, nextDue, checkpointLesson, unitMastered, unitKey, isPracticeStep, words, CHECKPOINT_PASS, INTERVALS, DAY };
})(globalThis.TD = globalThis.TD || {});
