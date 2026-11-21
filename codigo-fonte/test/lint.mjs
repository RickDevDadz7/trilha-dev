// Validador do Método Trilha: roda em toda linguagem, inclusive as que forem adicionadas no futuro.
// Uso: node test/lint.mjs   (sai com código 1 se houver erro)
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {}, console };
ctx.window = ctx; ctx.TD = {};
vm.createContext(ctx);
const dir = new URL('../src/content/', import.meta.url);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort((a, b) => (a === '_base.js' ? -1 : b === '_base.js' ? 1 : a.localeCompare(b)));
for (const f of files) vm.runInContext(fs.readFileSync(new URL(f, dir), 'utf8'), ctx, { filename: f });
vm.runInContext(fs.readFileSync(new URL('../src/pedagogy.js', import.meta.url), 'utf8'), ctx);
const { TD } = ctx;

const errors = [], warns = [];
const MAX_CHUNK = 90;
for (const c of TD.courses) {
  c.units.forEach((u, ui) => u.lessons.forEach(l => {
    const where = `${c.id}/${l.id}`;
    const learns = l.steps.filter(s => s.t === 'learn');
    const checks = l.steps.filter(s => s.t === 'quiz' || s.t === 'predict');
    const codes = l.steps.filter(s => s.t === 'code');
    if (!learns.length) errors.push(`${where}: sem passo de teoria (learn)`);
    if (!checks.length && !l.id.endsWith('-final')) errors.push(`${where}: precisa de pelo menos 1 quiz ou predict`);
    for (const s of learns) for (const ch of TD.ped.chunkBody(s.body)) {
      const w = TD.ped.words(ch.replace(/~~~[\s\S]*?~~~/g, ''));
      if (w > MAX_CHUNK) errors.push(`${where}: card "${s.title}" com ${w} palavras (máx ${MAX_CHUNK})`);
    }
    for (const s of codes) {
      if (!s.hint) errors.push(`${where}: exercício "${s.title}" sem hint`);
      if (c.runner !== 'sql' && !s.tests?.length && !s.typeTests?.length && !s.check) errors.push(`${where}: exercício "${s.title}" sem testes`);
      if (ui === 0 && !/\/\/|--|<!--|\/\*|^\s*#/m.test(s.starter || '')) warns.push(`${where}: "${s.title}" na 1ª unidade sem starter guiado por comentários`);
    }
    // teoria antes da prática: o primeiro passo da lição é sempre learn
    if (l.steps[0]?.t !== 'learn') errors.push(`${where}: a lição deve começar com teoria`);
  }));
  // checkpoint precisa de material
  c.units.forEach((u, ui) => {
    const cp = TD.ped.checkpointLesson(c, ui, 'lint');
    if (cp.steps.length < 4) warns.push(`${c.id} unidade ${ui + 1}: checkpoint com só ${cp.steps.length} perguntas`);
  });
}
for (const w of warns) console.log('aviso:', w);
for (const e of errors) console.log('ERRO:', e);
console.log(`${TD.courses.length} cursos verificados, ${errors.length} erros, ${warns.length} avisos`);
process.exit(errors.length ? 1 : 0);
