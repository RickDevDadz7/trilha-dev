/* Adaptadores para rodar FORA do Claude.ai (programa de PC ou app no navegador).
 * Mesma interface das capacidades do Claude: o resto do app não muda. */
(function (TD) {
  'use strict';
  const isElectron = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
  const KEY = 'td-ai-settings';

  function aiSettings() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function saveAiSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* */ } }

  async function post(key, body) {
    if (window.tdNative && window.tdNative.anthropic) return window.tdNative.anthropic(key, body);
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify(body)
    });
    let json = null; try { json = await r.json(); } catch (e) { /* */ }
    return { status: r.status, json };
  }

  /** Tutor via API da Anthropic com a chave do próprio usuário (fica só neste aparelho, fora dos backups). */
  function makeSample() {
    const cfg = aiSettings();
    if (!cfg.key) return null;
    const sample = async (prompt, opts) => {
      const res = await post(cfg.key, { model: cfg.model || 'claude-haiku-5-5', max_tokens: 700, messages: [{ role: 'user', content: prompt }] });
      if (res.status === 401) throw { code: 'not_granted', message: 'Chave de API inválida.' };
      if (res.status === 429) throw { code: 'rate_limited', message: 'Limite de uso atingido.' };
      if (res.status !== 200) throw { code: 'unavailable', message: 'API respondeu ' + res.status };
      const text = ((res.json && res.json.content) || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
      if (opts && opts.onText) opts.onText({ text, delta: text });
      return { text, truncated: false };
    };
    sample.local = true;
    return sample;
  }
  async function testKey(key, model) {
    const res = await post(key, { model: model || 'claude-haiku-5-5', max_tokens: 5, messages: [{ role: 'user', content: 'Say: ok' }] });
    if (res.status !== 200) throw new Error((res.json && res.json.error && res.json.error.message) || 'erro ' + res.status);
    return true;
  }

  /** Salvar arquivo: no PC abre "Salvar como"; no navegador baixa para Downloads. */
  function makeDownloads() {
    return {
      async save({ filename, data }) {
        if (window.tdNative && window.tdNative.saveFile) { const ok = await window.tdNative.saveFile(filename, data); if (!ok) throw { code: 'dismissed' }; return; }
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    };
  }

  TD.local = { isElectron, aiSettings, saveAiSettings, makeSample, testKey, makeDownloads };
})(globalThis.TD = globalThis.TD || {});
