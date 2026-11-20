"""Roda TODAS as soluções (devem passar) e TODOS os starters (devem falhar) no Chrome headless.
Uso: python3 test/check.py [--only js] [--shots]   (depois de `node build.mjs`)"""
import asyncio, json, mimetypes, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(HERE, '..', 'dist')
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
SHOTS = '--shots' in sys.argv

async def handle(route):
    url = route.request.url
    if url.startswith('http://app.local/'):
        p = url[len('http://app.local/'):].split('#')[0].split('?')[0] or 'index.html'
        f = os.path.join(DIST, p)
        if os.path.exists(f):
            with open(f, 'rb') as fh:
                return await route.fulfill(status=200, body=fh.read(), content_type=mimetypes.guess_type(f)[0] or 'application/javascript')
    await route.abort()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        page = await b.new_page(viewport={'width': 1440, 'height': 900})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.route('**/*', handle)
        await page.goto('http://app.local/index.html')
        await page.wait_for_function('window.TD && TD.app && TD.app.S.booted', timeout=15000)
        info = await page.evaluate("""() => TD.courses.map(c => ({ id: c.id, units: c.units.length, lessons: c.units.reduce((a, u) => a + u.lessons.length, 0) }))""")
        print('cursos:', info)
        dup = await page.evaluate("""() => { const ids = TD.courses.flatMap(c => c.units.flatMap(u => u.lessons.map(l => l.id))); return ids.filter((x, i) => ids.indexOf(x) !== i); }""")
        if dup: print('IDs DUPLICADOS:', dup)
        bad_quiz = await page.evaluate("""() => TD.courses.flatMap(c => c.units.flatMap(u => u.lessons.flatMap(l => l.steps.filter(s => s.t === 'quiz' && !(s.a >= 0 && s.a < s.opts.length)).map(() => l.id))))""")
        if bad_quiz: print('QUIZ INVÁLIDO:', bad_quiz)
        steps = await page.evaluate("""(only) => TD.courses.filter(c => !only || c.id === only).flatMap(c => c.units.flatMap(u => u.lessons.flatMap(l => l.steps.map((s, i) => ({ c: c.id, l: l.id, i, t: s.t }))))).filter(x => x.t === 'code')""", ONLY)
        fails = []
        for s in steps:
            kinds = ('solution', 'starter', 'blocks') if await page.evaluate("({ c, l, i }) => !!TD.ped.parsonsBlocks(TD.courses.find(x => x.id === c).units.flatMap(u => u.lessons).find(x => x.id === l).steps[i], 's')", s) else ('solution', 'starter')
            for kind in kinds:
                res = await page.evaluate("""async ({ c, l, i, kind }) => {
                    TD.app.startLesson(c, l);
                    const ls = TD.app.lesson; ls.i = i; const step = ls.lesson.steps[i];
                    ls.d = kind === 'blocks'
                      ? { mode: 'blocks', pz: { pool: [], answer: TD.ped.parsonsBlocks(step, 's').slice().sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1))) } }
                      : { mode: 'write', code: kind === 'solution' ? step.solution : (step.starter || '') };
                    TD.app.renderLesson();
                    await TD.app.runCode();
                    return { r: ls.d.results.map(r => [r.name, r.pass, r.err || null]), err: ls.d.res.error || null, te: ls.d.res.typeErrors || null };
                }""", {**s, 'kind': kind})
                allp = all(r[1] for r in res['r'])
                if kind in ('solution', 'blocks') and not allp: fails.append((s['l'], s['i'], kind, res))
                if kind == 'starter' and allp: fails.append((s['l'], s['i'], kind, 'starter passa!'))
        print('exercícios de código:', len(steps))
        for f in fails: print('FALHA', json.dumps(f, ensure_ascii=False)[:900])
        print('erros de página:', errors[:10])
        if SHOTS:
            out = os.path.join(HERE, 'shots'); os.makedirs(out, exist_ok=True)
            await page.evaluate("() => { TD.app.S.lesson = null; location.hash = ''; }")
            await page.wait_for_timeout(300); await page.screenshot(path=os.path.join(out, 'home.png'))
            await page.evaluate("() => { location.hash = 'js'; }")
            await page.wait_for_timeout(300); await page.screenshot(path=os.path.join(out, 'course.png'))
            await page.evaluate("""async () => { TD.app.startLesson('js', 'js-reduce'); const ls = TD.app.lesson; ls.i = 2; ls.d = { code: 'function cartTotal(items) {\\n  return items.length;\\n}' }; TD.app.renderLesson(); await TD.app.runCode(); }""")
            await page.wait_for_timeout(300); await page.screenshot(path=os.path.join(out, 'code.png'))
            await page.evaluate("""() => { TD.app.startLesson('js', 'js-if'); const ls = TD.app.lesson; ls.i = 0; TD.app.renderLesson(); }""")
            await page.wait_for_timeout(200); await page.screenshot(path=os.path.join(out, 'learn.png'))
            await page.evaluate("() => { TD.app.S.lesson = null; location.hash = 'dados'; }")
            await page.wait_for_timeout(400); await page.screenshot(path=os.path.join(out, 'data.png'))
        await b.close()

if __name__ == "__main__":
    asyncio.run(main())
