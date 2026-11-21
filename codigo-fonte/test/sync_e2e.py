"""Dois aparelhos sincronizando pela conta, com a API do Supabase simulada (sem rede)."""
import asyncio, json, pathlib, re, time
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / 'dist' / 'index.html').as_uri()
TABLE = {}  # (user, device) -> row
USER = {'id': '11111111-1111-1111-1111-111111111111', 'email': 'rick@mail.com'}

async def handle(route):
    req = route.request; u = req.url
    if '/rest/v1/trilha_sync' in u:
        if req.method == 'GET':
            rows = [r for (uid, _), r in TABLE.items() if uid == USER['id']]
            return await route.fulfill(status=200, content_type='application/json', body=json.dumps(rows))
        if req.method == 'POST':
            b = json.loads(req.post_data); TABLE[(USER['id'], b['device_id'])] = b
            return await route.fulfill(status=201, body='')
        if req.method == 'DELETE':
            for k in [k for k in TABLE if k[0] == USER['id']]: del TABLE[k]
            return await route.fulfill(status=204, body='')
    if '/auth/v1/token' in u:
        return await route.fulfill(status=200, content_type='application/json', body=json.dumps({'access_token': 'a', 'refresh_token': 'r', 'expires_in': 3600, 'user': USER}))
    if '/auth/v1/settings' in u:
        return await route.fulfill(status=200, content_type='application/json', body=json.dumps({'external': {'google': False, 'email': True}}))
    if '/auth/v1/authorize' in u:
        return await route.fulfill(status=200, body='google')
    await route.fulfill(status=404, body='{}')

STUDY = """async ([lid, n]) => {
  const S = TD.app.S; const c = TD.courses.find((x) => x.id === 'js');
  TD.app.startLesson('js', lid);
  const ls = TD.app.lesson; ls.earned = n; ls.results = {};
  TD.app.finishLesson();
  await S.store.flush();
  return S.store.state.progress.xp;
}"""

async def device(br, name):
    ctx = await br.new_context()
    await ctx.route(re.compile(r'https://uutyijvitbeiwbivkfgz\.supabase\.co/.*'), handle)
    page = await ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.goto(URL); await page.wait_for_timeout(1000)
    return ctx, page, errs

async def main():
    async with async_playwright() as p:
        ok = True
        def check(cond, msg):
            nonlocal ok; print(('OK  ' if cond else 'FALHA ') + msg); ok = ok and cond
        br = await p.chromium.launch()
        a, pa, ea = await device(br, 'A')
        b, pb, eb = await device(br, 'B')
        # A estuda antes de entrar na conta (progresso antigo vira saldo do aparelho)
        xa = await pa.evaluate(STUDY, ['js-hello', 20])
        check(xa > 0, f'A ganhou XP antes do login ({xa})')
        # login por e-mail nos dois (tela de Config)
        check(await pb.evaluate("!!document.querySelector('.auth-screen')"), 'sem conta, o app abre na tela de login')
        await pb.screenshot(path=str(ROOT / 'test' / 'shots' / 'login.png'))
        for pg in (pa, pb):
            await pg.evaluate("location.hash = 'login'"); await pg.wait_for_timeout(300)
            await pg.fill('#auth-email', 'rick@mail.com'); await pg.fill('#auth-pass', 'segredo123')
            await pg.click('.auth-go'); await pg.wait_for_timeout(900)
        check(await pa.evaluate("!document.querySelector('.auth-screen') && !!document.querySelector('.tile-grid')"), 'depois do login vai pra tela inicial')
        xb = await pb.evaluate('TD.app.S.store.state.progress.xp')
        check(xb == xa, f'B recebeu o XP de A ({xb} == {xa})')
        check(await pb.evaluate("!!TD.app.S.store.state.progress.done['js-hello']"), 'B tem a lição feita em A')
        # os dois estudam no mesmo dia, coisas diferentes
        await pb.evaluate(STUDY, ['js-vars', 30])
        await pa.evaluate(STUDY, ['js-types', 10])
        for pg in (pa, pb, pa): await pg.evaluate('TD.app.runSync(false)'); await pg.wait_for_timeout(200)
        sa = await pa.evaluate('[TD.app.S.store.state.progress.xp, Object.keys(TD.app.S.store.state.progress.done).sort().join(","), JSON.stringify(TD.app.S.store.state.progress.days)]')
        sb = await pb.evaluate('[TD.app.S.store.state.progress.xp, Object.keys(TD.app.S.store.state.progress.done).sort().join(","), JSON.stringify(TD.app.S.store.state.progress.days)]')
        check(sa == sb, f'A e B iguais depois de sincronizar: {sa[0]} XP / {sb[0]} XP')
        check('js-hello' in sa[1] and 'js-vars' in sa[1] and 'js-types' in sa[1], 'as 3 lições estão nos dois')
        expected = xa + (await pb.evaluate("TD.app.S.store.state.progress.xd[localStorage.getItem('td-device')]")) - 0
        # sincronizar de novo não muda nada (idempotente)
        before = sa
        for pg in (pa, pb): await pg.evaluate('TD.app.runSync(false)')
        again = await pa.evaluate('[TD.app.S.store.state.progress.xp, Object.keys(TD.app.S.store.state.progress.done).sort().join(","), JSON.stringify(TD.app.S.store.state.progress.days)]')
        check(again == before, 'sincronizar de novo não duplica XP')
        dsum = await pa.evaluate('Object.values(TD.app.S.store.state.progress.days).reduce((a,d)=>a+d.xp,0)')
        check(dsum == sa[0], f'soma dos dias = XP total ({dsum})')
        # botão do Google leva pra tela de autorização do Supabase
        await pa.evaluate("location.hash = 'config'"); await pa.wait_for_timeout(300)
        await pa.click('[data-act="cloud-signout"]'); await pa.wait_for_timeout(1200)
        st = await pa.evaluate("[location.hash, TD.app.S.store.state.progress.xp, Object.keys(TD.app.S.store.state.progress.done).length, Object.keys(TD.app.S.store.state.code).length, !!TD.cloud.user()]")
        check(st[0] in ('', '#') and st[1] == 0 and st[2] == 0 and st[3] == 0 and not st[4], f'sair da conta apaga os dados do aparelho e volta pro início {st}')
        check(len([k for k in TABLE if k[0] == USER['id']]) == 2, 'os dados continuam na nuvem')
        await pa.reload(); await pa.wait_for_timeout(1000)
        check(await pa.evaluate("TD.app.S.store.state.progress.xp === 0"), 'depois de recarregar, o aparelho continua limpo')
        check(await pa.evaluate("!!document.querySelector('.auth-screen') && !document.querySelector('[data-act=\"auth-google\"]')"), 'saiu: volta pro login, sem botão do Google (desligado no painel)')
        await pa.click('[data-act="auth-guest"]'); await pa.wait_for_timeout(300)
        check(await pa.evaluate("!document.querySelector('.auth-screen') && localStorage.getItem('td-guest') === '1'"), 'continuar sem conta abre o app')
        g = await pa.evaluate('TD.cloud.googleURL()')
        check('provider=google' in g and 'redirect_to=' in g, 'URL do login com Google')
        # volta do Google com tokens no endereço
        pa = await a.new_page(); pa.on('pageerror', lambda e: ea.append(str(e)))
        await pa.goto(URL + '#access_token=eyJhbGciOiJIUzI1NiJ9.' + 'eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJlbWFpbCI6InJpY2tAbWFpbC5jb20ifQ' + '.x&refresh_token=r&expires_in=3600&token_type=bearer')
        await pa.wait_for_timeout(1200)
        check(await pa.evaluate("(location.hash === '' || location.hash === '#') && !document.querySelector('.auth-screen') && !!TD.cloud.user() && TD.cloud.user().email === 'rick@mail.com'"), 'volta do Google: logado e endereço limpo')
        await pa.wait_for_timeout(800)
        check(await pa.evaluate("TD.app.S.store.state.progress.xp") == sa[0], 'entrando de novo, o progresso volta da nuvem')
        await pa.screenshot(path=str(ROOT / 'test' / 'shots' / 'account.png'))
        check(not ea and not eb, f'sem erros de página {ea + eb}')
        print('TUDO OK' if ok else 'COM FALHAS')
        await a.close(); await b.close()

asyncio.run(main())
