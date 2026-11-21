/* Efeitos sonoros do Overclock: sintetizados na hora com Web Audio (nenhum arquivo de áudio).
 * Estética synth/neon: blips de interface, arpejos, ruído filtrado e eco. */
(function (TD) {
  'use strict';
  let ctx = null, master = null, echo = null, noiseBuf = null;
  let enabled = true, volume = 0.6;
  let lastHover = 0;

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = volume;
    master.connect(comp); comp.connect(ctx.destination);
    // eco curto (delay com feedback) pros sons "grandes"
    const d = ctx.createDelay(1); d.delayTime.value = 0.16;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    echo = ctx.createGain(); echo.gain.value = 0.35;
    echo.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function ready() {
    if (!enabled) return null;
    const c = init(); if (!c) return null;
    if (c.state === 'suspended') c.resume().catch(() => {});
    return c;
  }

  function tone({ f = 440, to = null, type = 'square', dur = 0.08, vol = 0.2, at = 0, attack = 0.004, wet = false, cutoff = 6000, detune = 0 }) {
    const c = ready(); if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain(), flt = c.createBiquadFilter();
    o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    flt.type = 'lowpass'; flt.frequency.value = cutoff;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(flt); flt.connect(g); g.connect(master); if (wet) g.connect(echo);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise({ dur = 0.1, vol = 0.15, at = 0, from = 800, to = 800, q = 4, type = 'bandpass', wet = false }) {
    const c = ready(); if (!c) return;
    const t = c.currentTime + at;
    const s = c.createBufferSource(), g = c.createGain(), flt = c.createBiquadFilter();
    s.buffer = noiseBuf;
    flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(from, t); flt.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(flt); flt.connect(g); g.connect(master); if (wet) g.connect(echo);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const N = (semi) => 440 * Math.pow(2, (semi - 9) / 12); // semitons a partir do C4
  const SFX = {
    click() { tone({ f: 1850, to: 1200, type: 'square', dur: 0.035, vol: 0.06, cutoff: 4000 }); noise({ dur: 0.02, vol: 0.03, from: 5000, to: 3000 }); },
    hover() { const n = performance.now(); if (n - lastHover < 70) return; lastHover = n; tone({ f: 2600, type: 'sine', dur: 0.025, vol: 0.025 }); },
    select() { tone({ f: 900, to: 1400, type: 'triangle', dur: 0.06, vol: 0.08 }); },
    nav() { tone({ f: 420, to: 840, type: 'sawtooth', dur: 0.09, vol: 0.05, cutoff: 2200 }); noise({ dur: 0.12, vol: 0.04, from: 600, to: 3500, q: 2 }); },
    run() { noise({ dur: 0.28, vol: 0.11, from: 300, to: 4200, q: 6 }); tone({ f: 220, to: 660, type: 'sawtooth', dur: 0.22, vol: 0.05, cutoff: 1800 }); },
    correct() {
      [0, 4, 7, 12].forEach((s, i) => tone({ f: N(12 + s), type: 'square', dur: 0.11, vol: 0.07, at: i * 0.055, cutoff: 3500, wet: true }));
      tone({ f: N(36), type: 'sine', dur: 0.35, vol: 0.04, at: 0.2, wet: true });
    },
    wrong() {
      tone({ f: 150, to: 70, type: 'square', dur: 0.26, vol: 0.12, cutoff: 900 });
      tone({ f: 157, to: 74, type: 'sawtooth', dur: 0.26, vol: 0.08, cutoff: 900 });
      [0, 0.06, 0.13].forEach((at) => noise({ dur: 0.04, vol: 0.12, at, from: 1800, to: 900, q: 1.5 }));
    },
    pass() {
      tone({ f: N(19), type: 'sawtooth', dur: 0.18, vol: 0.06, cutoff: 2600, wet: true });
      tone({ f: N(26), type: 'sawtooth', dur: 0.22, vol: 0.05, at: 0.07, cutoff: 3000, wet: true });
      tone({ f: N(31), type: 'square', dur: 0.3, vol: 0.05, at: 0.14, cutoff: 4000, wet: true });
      noise({ dur: 0.3, vol: 0.05, from: 2000, to: 8000, q: 1, at: 0.05 });
    },
    complete() {
      tone({ f: N(-12), to: N(-24), type: 'sawtooth', dur: 0.5, vol: 0.1, cutoff: 700 });
      const seq = [0, 3, 7, 10, 12, 15, 19, 24];
      seq.forEach((s, i) => tone({ f: N(12 + s), type: i % 2 ? 'square' : 'sawtooth', dur: 0.14, vol: 0.06, at: 0.08 + i * 0.07, cutoff: 3000 + i * 300, wet: true }));
      tone({ f: N(24), type: 'triangle', dur: 0.9, vol: 0.07, at: 0.7, wet: true });
      tone({ f: N(31), type: 'triangle', dur: 0.9, vol: 0.05, at: 0.7, wet: true });
      noise({ dur: 0.6, vol: 0.05, from: 800, to: 9000, q: 1, at: 0.05 });
    },
    rankup() {
      noise({ dur: 0.5, vol: 0.12, from: 200, to: 6000, q: 3 });
      tone({ f: N(-24), to: N(-12), type: 'sawtooth', dur: 0.6, vol: 0.12, cutoff: 900 });
      [0, 7, 12, 16, 19, 24, 28, 31].forEach((s, i) => tone({ f: N(12 + s), type: 'square', dur: 0.16, vol: 0.06, at: 0.45 + i * 0.06, cutoff: 5000, wet: true }));
    },
    boot() {
      noise({ dur: 0.35, vol: 0.06, from: 150, to: 2500, q: 5 });
      [0, 7, 12].forEach((s, i) => tone({ f: N(s), type: 'sawtooth', dur: 0.12, vol: 0.05, at: 0.12 + i * 0.08, cutoff: 2000, wet: true }));
    },
    toggle(on) { tone({ f: on ? 700 : 1200, to: on ? 1400 : 600, type: 'square', dur: 0.08, vol: 0.07, cutoff: 3000 }); }
  };

  TD.sfx = {
    play(name, arg) { if (!enabled) return false; try { if (!SFX[name]) return false; SFX[name](arg); return true; } catch (e) { return false; } },
    unlock() { if (enabled) ready(); },
    configure({ on, vol }) {
      if (typeof on === 'boolean') enabled = on;
      if (typeof vol === 'number') { volume = Math.max(0, Math.min(1, vol)); if (master) master.gain.value = volume; }
    },
    get enabled() { return enabled; },
    get volume() { return volume; }
  };
})(globalThis.TD = globalThis.TD || {});
