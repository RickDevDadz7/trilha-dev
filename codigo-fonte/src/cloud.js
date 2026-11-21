/* Overclock — conta do usuário (Supabase Auth): e-mail e senha + Google.
 * Mesmo projeto Supabase do Deutsch mit Plan: uma conta serve pros dois apps; cada app tem a própria tabela.
 * Fala direto com a API REST do Supabase (sem biblioteca externa), funciona no PWA e no programa de PC.
 * - A chave "publishable" é pública por natureza; a proteção dos dados vem das regras RLS no banco
 *   (cada conta só lê e grava as próprias linhas).
 * - A sessão (tokens) fica só neste aparelho (localStorage 'gfs-cloud') e nunca entra em backups. */
(function (TD) {
  'use strict';
  const URL_ = 'https://uutyijvitbeiwbivkfgz.supabase.co';
  const KEY = 'sb_publishable_L0yFkkuLinZN2d8fWCJvKg_nwZH_i1l';
  const SITE = 'https://rickdevdadz7.github.io/trilha-dev/';
  const LS = 'td-cloud';
  const ls = () => { try { return globalThis.localStorage; } catch (e) { return null; } };
  let refreshing = null;

  function session() { try { return JSON.parse(ls().getItem(LS) || 'null'); } catch (e) { return null; } }
  function saveSession(s) { try { if (s) ls().setItem(LS, JSON.stringify(s)); else ls().removeItem(LS); } catch (e) { /* */ } }
  const redirectTo = () => {
    try { if (/^https?:$/.test(location.protocol) && !/localhost|127\.0\.0\.1/.test(location.hostname)) return location.origin + location.pathname; } catch (e) { /* */ }
    return SITE;
  };
  function fromTokens(r) {
    if (!r || !r.access_token) return null;
    const exp = r.expires_at ? r.expires_at * 1000 : Date.now() + (r.expires_in || 3600) * 1000;
    return { access_token: r.access_token, refresh_token: r.refresh_token, expires_at: exp, user: r.user ? { id: r.user.id, email: r.user.email } : null };
  }
  const MSG = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_not_confirmed: 'Confirme seu e-mail primeiro: abra o link que chegou na sua caixa de entrada (veja também o spam).',
    user_already_exists: 'Já existe uma conta com esse e-mail. Use “Entrar”.',
    email_exists: 'Já existe uma conta com esse e-mail. Use “Entrar”.',
    weak_password: 'Senha fraca: use pelo menos 8 caracteres, misturando letras e números.',
    over_email_send_rate_limit: 'Muitos e-mails enviados agora. Espere alguns minutos e tente de novo.',
    over_request_rate_limit: 'Muitas tentativas. Espere um pouco e tente de novo.',
    email_address_invalid: 'Esse e-mail não parece válido.',
    validation_failed: 'Confira o e-mail e a senha.',
    same_password: 'A nova senha precisa ser diferente da atual.',
    session_not_found: 'Sua sessão expirou. Entre de novo.',
    refresh_token_not_found: 'Sua sessão expirou. Entre de novo.'
  };
  async function call(path, { method = 'GET', body, auth, headers, timeout = 20000 } = {}) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const to = ctl ? setTimeout(() => ctl.abort(), timeout) : null;
    const h = Object.assign({ apikey: KEY }, body !== undefined ? { 'Content-Type': 'application/json' } : {}, headers || {});
    if (auth) h.Authorization = 'Bearer ' + auth;
    let r;
    try { r = await fetch(URL_ + path, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined }); }
    catch (e) { throw Object.assign(new Error('Sem conexão com o servidor. Verifique a internet.'), { code: 'offline' }); }
    finally { if (to) clearTimeout(to); }
    const txt = await r.text(); let data = null; try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
    if (!r.ok) {
      const code = (data && (data.error_code || data.code || data.error)) || 'http_' + r.status;
      const raw = data && (data.msg || data.message || data.error_description) || '';
      const e = new Error(MSG[code] || (/confirm/i.test(raw) ? MSG.email_not_confirmed : raw || 'O servidor respondeu ' + r.status + '.'));
      e.code = code; e.status = r.status; throw e;
    }
    return data;
  }
  async function token() {
    const s = session(); if (!s) return null;
    if (s.expires_at - Date.now() > 60000) return s.access_token;
    if (!refreshing) refreshing = (async () => {
      try {
        const r = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh_token } });
        const ns = fromTokens(r); if (!ns.user) ns.user = s.user; saveSession(ns); return ns.access_token;
      } catch (e) {
        if (e.status === 400 || e.status === 401 || e.status === 403) { saveSession(null); throw Object.assign(new Error('Sua sessão expirou. Entre de novo em Configurações → Conta.'), { code: 'signed_out' }); }
        throw e;
      } finally { refreshing = null; }
    })();
    return refreshing;
  }
  const clean = (email) => String(email || '').trim().toLowerCase();
  function check(email, pass) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean(email))) throw new Error(MSG.email_address_invalid);
    if (pass !== undefined && String(pass).length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
  }

  async function signUp(email, pass) {
    check(email, pass);
    const r = await call('/auth/v1/signup?redirect_to=' + encodeURIComponent(redirectTo()), { method: 'POST', body: { email: clean(email), password: pass } });
    const s = fromTokens(r); if (s) { saveSession(s); return { session: s }; }
    if (r && Array.isArray(r.identities) && !r.identities.length) throw Object.assign(new Error(MSG.user_already_exists), { code: 'user_already_exists' });
    return { confirm: true };
  }
  async function signIn(email, pass) {
    check(email, pass);
    const s = fromTokens(await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: clean(email), password: pass } }));
    saveSession(s); return s;
  }
  async function resend(email) { check(email); await call('/auth/v1/resend', { method: 'POST', body: { type: 'signup', email: clean(email), options: { email_redirect_to: redirectTo() } } }); }
  async function recover(email) { check(email); await call('/auth/v1/recover?redirect_to=' + encodeURIComponent(redirectTo()), { method: 'POST', body: { email: clean(email) } }); }
  async function updatePassword(pass) {
    if (String(pass).length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
    await call('/auth/v1/user', { method: 'PUT', body: { password: pass }, auth: await token() });
  }
  async function signOut() {
    const s = session(); saveSession(null);
    if (s) { try { await call('/auth/v1/logout', { method: 'POST', auth: s.access_token, timeout: 6000 }); } catch (e) { /* já saiu localmente */ } }
  }
  /** Login com Google: vai pra tela do Google e volta pro app com os tokens no endereço. */
  function googleURL() {
    return URL_ + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirectTo());
  }
  function signInWithGoogle() { location.href = googleURL(); }
  /** O Google só aparece se estiver ligado no painel (Authentication → Providers). */
  let providers = null;
  async function googleEnabled() {
    if (!providers) providers = call('/auth/v1/settings', { timeout: 8000 }).then((r) => (r && r.external) || {}).catch(() => { providers = null; return {}; });
    return !!(await providers).google;
  }
  /** Links do e-mail (confirmação, nova senha) voltam com os tokens no endereço (#access_token=…). */
  function handleRedirect() {
    let h = ''; try { h = location.hash || ''; } catch (e) { return null; }
    if (!/access_token=|error_description=|error_code=/.test(h)) return null;
    const p = new URLSearchParams(h.replace(/^#/, ''));
    if (p.get('error_description') || p.get('error_code')) {
      const code = p.get('error_code') || '';
      return { error: code === 'otp_expired' ? 'Esse link expirou ou já foi usado. Peça outro.' : (p.get('error_description') || 'Link inválido.').replace(/\+/g, ' ') };
    }
    const s = { provider: p.get('provider_token') ? 'google' : undefined, access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_at: p.get('expires_at') ? +p.get('expires_at') * 1000 : Date.now() + (+p.get('expires_in') || 3600) * 1000, user: null };
    try { const payload = JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); s.user = { id: payload.sub, email: payload.email }; } catch (e) { /* */ }
    saveSession(s);
    return { type: p.get('type') || 'signin', email: s.user && s.user.email };
  }
  /** PostgREST autenticado (tabelas protegidas por RLS). */
  async function rest(path, opts) { const t = await token(); if (!t) throw Object.assign(new Error('Entre na sua conta primeiro.'), { code: 'signed_out' }); return call('/rest/v1/' + path, Object.assign({}, opts, { auth: t })); }
  const user = () => { const s = session(); return s && s.user; };
  const available = () => typeof fetch !== 'undefined' && !globalThis.claude;

  TD.cloud = { URL: URL_, session, user, token, signUp, signIn, signInWithGoogle, googleURL, googleEnabled, resend, recover, updatePassword, signOut, handleRedirect, rest, available, _call: call };
})(globalThis.TD = globalThis.TD || {});
