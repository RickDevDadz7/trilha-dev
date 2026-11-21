/* Runners: executam o código do aluno e conferem os testes.
 * Todos resolvem para { output, table, results: [{name, pass, err}], error, typeErrors, expectedTable } */
(function (TD) {
  'use strict';
  const VENDOR = { ts: 'vendor/typescript.min.js', sql: 'vendor/sql-asm.js' };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Falha ao carregar ' + src));
      document.head.appendChild(s);
    });
  }
  const srcChecks = (step, code) => (step.requires || []).map(([name, re]) => ({ name, pass: new RegExp(re, 'i').test(code) }));

  /* ---------- JavaScript: Web Worker, async, com timeout ---------- */
  const WORKER_SRC = `
    function fmt(v, depth) {
      depth = depth || 0;
      if (typeof v === "string") return depth ? JSON.stringify(v) : v;
      if (v === undefined) return "undefined";
      if (typeof v === "function") return "[Function " + (v.name || "anonymous") + "]";
      if (typeof v === "bigint") return v + "n";
      if (v instanceof Error) return v.name + ": " + v.message;
      if (v instanceof Map) return "Map(" + v.size + ") {" + Array.from(v).map(function (e) { return fmt(e[0], 1) + " => " + fmt(e[1], 1); }).join(", ") + "}";
      if (v instanceof Set) return "Set(" + v.size + ") {" + Array.from(v).map(function (e) { return fmt(e, 1); }).join(", ") + "}";
      if (typeof v === "object" && v !== null) { try { return JSON.stringify(v); } catch (e) { return String(v); } }
      return String(v);
    }
    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    self.onmessage = async function (e) {
      var d = e.data;
      var logs = [];
      var out = function () { logs.push(Array.prototype.map.call(arguments, function (x) { return fmt(x); }).join(" ")); };
      console.log = out; console.info = out; console.warn = out; console.error = out; console.table = out;
      var results = [], pending = [];
      var __t = function (name, fn) {
        var p = (async function () {
          try { results.push({ name: name, pass: !!(await fn()) }); }
          catch (err) { results.push({ name: name, pass: false, err: (err && err.message) || String(err) }); }
        })();
        pending.push(p);
      };
      var names = d.tests.map(function (t) { return t[0]; });
      var testCode = d.tests.map(function (t, i) {
        return "__t(__names[" + i + "], async function () { return (" + t[1] + "); });";
      }).join("\\n");
      var error = null;
      try {
        var fn = new AsyncFunction("__t", "__logs", "__src", "__names", (d.prelude || "") + "\\n;" + d.code + "\\n;\\n" + testCode);
        await fn(__t, logs, d.src, names);
        await Promise.all(pending);
      } catch (err) {
        error = (err && err.name ? err.name + ": " : "") + ((err && err.message) || String(err));
      }
      results.sort(function (a, b) { return names.indexOf(a.name) - names.indexOf(b.name); });
      self.postMessage({ logs: logs, results: results, error: error });
    };
  `;
  let workerUrl = null;
  function runJS(code, step, src) {
    const tests = step.tests || [];
    if (!workerUrl) workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
    const fail = (error) => ({ output: [], results: tests.map((t) => ({ name: t[0], pass: false })), error });
    return new Promise((resolve) => {
      const w = new Worker(workerUrl);
      const timer = setTimeout(() => { w.terminate(); resolve(fail('Seu código passou de 4 segundos rodando. Tem algum loop infinito?')); }, 4000);
      w.onmessage = (e) => {
        clearTimeout(timer); w.terminate();
        const { logs, results, error } = e.data;
        resolve({ output: logs, results: results.length ? results : tests.map((t) => ({ name: t[0], pass: false })), error });
      };
      w.onerror = (e) => { clearTimeout(timer); w.terminate(); if (e.preventDefault) e.preventDefault(); resolve(fail(e.message || 'Erro ao executar')); };
      w.postMessage({ code, tests, src: src == null ? code : src, prelude: step.prelude || '' });
    }).then((r) => { r.results = r.results.concat(srcChecks(step, src == null ? code : src)); return r; });
  }

  /* ---------- TypeScript: checagem de tipos com lib embutida + execução como JS ---------- */
  const MINI_LIB = `
interface Array<T> {
  length: number;
  [n: number]: T;
  push(...items: T[]): number;
  pop(): T | undefined;
  shift(): T | undefined;
  unshift(...items: T[]): number;
  map<U>(cb: (value: T, index: number, array: T[]) => U): U[];
  filter<S extends T>(cb: (value: T, index: number, array: T[]) => value is S): S[];
  filter(cb: (value: T, index: number, array: T[]) => unknown): T[];
  find<S extends T>(cb: (value: T, index: number, array: T[]) => value is S): S | undefined;
  find(cb: (value: T, index: number, array: T[]) => unknown): T | undefined;
  findIndex(cb: (value: T, index: number, array: T[]) => unknown): number;
  some(cb: (value: T, index: number, array: T[]) => unknown): boolean;
  every(cb: (value: T, index: number, array: T[]) => unknown): boolean;
  forEach(cb: (value: T, index: number, array: T[]) => void): void;
  reduce(cb: (acc: T, value: T, index: number, array: T[]) => T): T;
  reduce<U>(cb: (acc: U, value: T, index: number, array: T[]) => U, initial: U): U;
  includes(item: T): boolean;
  indexOf(item: T): number;
  join(separator?: string): string;
  slice(start?: number, end?: number): T[];
  splice(start: number, deleteCount?: number, ...items: T[]): T[];
  concat(...items: (T | T[])[]): T[];
  sort(compare?: (a: T, b: T) => number): this;
  reverse(): T[];
  flat(): T extends (infer U)[] ? U[] : T[];
  at(index: number): T | undefined;
}
interface ReadonlyArray<T> {
  readonly length: number;
  readonly [n: number]: T;
  map<U>(cb: (value: T, index: number) => U): U[];
  filter(cb: (value: T, index: number) => unknown): T[];
  find(cb: (value: T, index: number) => unknown): T | undefined;
  includes(item: T): boolean;
  indexOf(item: T): number;
  join(separator?: string): string;
  slice(start?: number, end?: number): T[];
  forEach(cb: (value: T, index: number) => void): void;
}
interface ArrayConstructor { isArray(arg: any): arg is any[]; from<T>(items: T[] | ReadonlyArray<T>): T[]; }
declare var Array: ArrayConstructor;
interface TemplateStringsArray extends ReadonlyArray<string> { readonly raw: readonly string[]; }
interface String {
  readonly length: number;
  readonly [index: number]: string;
  toUpperCase(): string; toLowerCase(): string; trim(): string;
  padStart(maxLength: number, fillString?: string): string;
  padEnd(maxLength: number, fillString?: string): string;
  includes(search: string): boolean; startsWith(search: string): boolean; endsWith(search: string): boolean;
  split(separator: string | RegExp): string[];
  slice(start?: number, end?: number): string;
  replace(search: string | RegExp, replacement: string): string;
  replaceAll(search: string, replacement: string): string;
  charAt(pos: number): string; indexOf(search: string): number; repeat(count: number): string;
  at(index: number): string | undefined;
}
interface StringConstructor { (value?: any): string; }
declare var String: StringConstructor;
interface Number { toFixed(digits?: number): string; toString(radix?: number): string; }
interface NumberConstructor { (value?: any): number; isInteger(n: unknown): boolean; isNaN(n: unknown): boolean; parseFloat(s: string): number; }
declare var Number: NumberConstructor;
declare function parseInt(s: string, radix?: number): number;
declare function parseFloat(s: string): number;
declare function isNaN(n: number): boolean;
interface Boolean {}
interface BooleanConstructor { (value?: any): boolean; }
declare var Boolean: BooleanConstructor;
interface Object {}
interface ObjectConstructor {
  keys(o: object): string[];
  values<T>(o: { [k: string]: T }): T[];
  entries<T>(o: { [k: string]: T }): [string, T][];
  freeze<T>(o: T): Readonly<T>;
  assign<T extends {}, U>(target: T, source: U): T & U;
}
declare var Object: ObjectConstructor;
interface Function {}
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface IArguments { length: number; [index: number]: any; }
interface RegExp { test(s: string): boolean; }
interface Date { getFullYear(): number; getTime(): number; toISOString(): string; }
interface DateConstructor { new (value?: number | string): Date; now(): number; }
declare var Date: DateConstructor;
interface Error { name: string; message: string; }
interface ErrorConstructor { new (message?: string): Error; (message?: string): Error; }
declare var Error: ErrorConstructor;
interface Math {
  abs(x: number): number; round(x: number): number; floor(x: number): number; ceil(x: number): number;
  max(...values: number[]): number; min(...values: number[]): number; random(): number;
  sqrt(x: number): number; pow(x: number, y: number): number; PI: number;
}
declare var Math: Math;
interface JSON { stringify(value: any, replacer?: any, space?: number | string): string; parse(text: string): any; }
declare var JSON: JSON;
interface Console { log(...data: any[]): void; error(...data: any[]): void; warn(...data: any[]): void; info(...data: any[]): void; }
declare var console: Console;
interface PromiseLike<T> { then<R1 = T, R2 = never>(ok?: ((value: T) => R1 | PromiseLike<R1>) | null, fail?: ((reason: any) => R2 | PromiseLike<R2>) | null): PromiseLike<R1 | R2>; }
interface Promise<T> {
  then<R1 = T, R2 = never>(ok?: ((value: T) => R1 | PromiseLike<R1>) | null, fail?: ((reason: any) => R2 | PromiseLike<R2>) | null): Promise<R1 | R2>;
  catch<R = never>(fail?: ((reason: any) => R | PromiseLike<R>) | null): Promise<T | R>;
}
interface PromiseConstructor {
  readonly prototype: Promise<any>;
  new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
  resolve<T>(value: T): Promise<T>;
  all<T>(values: T[]): Promise<Awaited<T>[]>;
}
declare var Promise: PromiseConstructor;
type PromiseConstructorLike = new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) => PromiseLike<T>;
declare function setTimeout(cb: () => void, ms?: number): number;
interface Map<K, V> { get(key: K): V | undefined; set(key: K, value: V): this; has(key: K): boolean; delete(key: K): boolean; readonly size: number; forEach(cb: (value: V, key: K) => void): void; }
interface MapConstructor { new <K, V>(entries?: [K, V][]): Map<K, V>; }
declare var Map: MapConstructor;
interface Set<T> { add(value: T): this; has(value: T): boolean; delete(value: T): boolean; readonly size: number; forEach(cb: (value: T) => void): void; }
interface SetConstructor { new <T>(values?: T[]): Set<T>; }
declare var Set: SetConstructor;
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Record<K extends keyof any, T> = { [P in K]: T };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type NonNullable<T> = T & {};
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
`;

  let tsPromise = null;
  function loadTS() {
    if (window.ts) return Promise.resolve(window.ts);
    if (!tsPromise) {
      tsPromise = loadScript(VENDOR.ts)
        .then(() => { if (!window.ts) throw new Error('TypeScript não carregou'); return window.ts; })
        .catch((e) => { tsPromise = null; throw e; });
    }
    return tsPromise;
  }
  function tsDiagnostics(ts, src) {
    const files = { 'lib.d.ts': MINI_LIB, 'main.ts': src };
    const options = { noLib: true, strict: true, target: ts.ScriptTarget.ES5, noEmit: true, types: [], experimentalDecorators: false };
    const host = {
      getSourceFile: (f, lv) => (files[f] != null ? ts.createSourceFile(f, files[f], lv, true) : undefined),
      getDefaultLibFileName: () => 'lib.d.ts', writeFile: () => {}, getCurrentDirectory: () => '/', getDirectories: () => [],
      fileExists: (f) => f in files, readFile: (f) => files[f], getCanonicalFileName: (f) => f,
      useCaseSensitiveFileNames: () => true, getNewLine: () => '\n'
    };
    const program = ts.createProgram(['lib.d.ts', 'main.ts'], options, host);
    return ts.getPreEmitDiagnostics(program)
      .filter((d) => !d.file || d.file.fileName === 'main.ts')
      .map((d) => {
        const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
        const line = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : 0;
        return { line, msg };
      });
  }
  async function runTS(code, step) {
    const ts = await loadTS();
    const head0 = step.declare ? step.declare + '\n' : '';
    const off = head0 ? head0.split('\n').length - 1 : 0;
    const userLines = code.split('\n').length;
    const diags = tsDiagnostics(ts, head0 + code + (step.typeTests ? '\n' + step.typeTests : ''))
      .map((d) => ({ line: d.line - off, msg: d.msg }));
    const mine = diags.filter((d) => d.line >= 1 && d.line <= userLines);
    const typeFails = diags.filter((d) => d.line > userLines || d.line < 1);
    const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None, removeComments: false } }).outputText;
    const res = (step.tests && step.tests.length) || step.requires ? await runJS(js, step, code) : { output: [], results: [], error: null };
    const head = [{ name: 'Compila sem type errors', pass: mine.length === 0 }];
    if (step.typeTests) head.push({ name: step.typeTestsName || 'Os tipos batem com o esperado', pass: mine.length === 0 && typeFails.length === 0 });
    res.results = head.concat(res.results);
    res.typeErrors = mine.map((d) => (d.line ? 'Line ' + d.line + ': ' : '') + d.msg);
    return res;
  }

  /* ---------- SQL: sql.js (build asm, sem wasm) ---------- */
  let sqlPromise = null;
  function loadSQL() {
    if (!sqlPromise) {
      sqlPromise = (window.initSqlJs ? Promise.resolve() : loadScript(VENDOR.sql))
        .then(() => window.initSqlJs())
        .catch((e) => { sqlPromise = null; throw e; });
    }
    return sqlPromise;
  }
  function lastResult(db, sql) { const r = db.exec(sql); return r.length ? r[r.length - 1] : null; }
  const norm = (v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v);
  function rowsKey(result, ordered) {
    if (!result) return '[]';
    const rows = result.values.map((r) => JSON.stringify(r.map(norm)));
    if (!ordered) rows.sort();
    return rows.join('|');
  }
  async function runSQL(code, step, course) {
    const SQL = await loadSQL();
    const setup = (course.setups && course.setups[step.db || 'shop']) || '';
    const results = [];
    let table = null, error = null, info = null, mine = null;
    const userDb = new SQL.Database();
    userDb.run(setup);
    try {
      if (!code.replace(/--.*$/gm, '').trim()) throw new Error('Escreva uma query antes de rodar.');
      const last = lastResult(userDb, code);
      mine = step.check ? lastResult(userDb, step.check) : last;
      table = mine;
      if (!last && !step.check) info = 'A query rodou, mas não retornou nenhuma row.';
    } catch (e) { error = e.message || String(e); }
    const refDb = new SQL.Database();
    refDb.run(setup);
    let ref;
    if (step.check) { refDb.exec(step.solution); ref = lastResult(refDb, step.check); } else ref = lastResult(refDb, step.solution);
    userDb.close(); refDb.close();
    const sameCount = !error && mine && ref && mine.values.length === ref.values.length && mine.columns.length === ref.columns.length;
    const sameRows = sameCount && rowsKey(mine, step.ordered) === rowsKey(ref, step.ordered);
    if (step.check) results.push({ name: 'O banco ficou com os dados esperados', pass: !!sameRows });
    else {
      results.push({ name: `Retorna ${ref ? ref.values.length : 0} rows e ${ref ? ref.columns.length : 0} columns`, pass: !!sameCount });
      results.push({ name: step.ordered ? 'Valores certos, na ordem certa' : 'Valores certos', pass: !!sameRows });
      if (step.checkColumns) {
        const ok = !error && mine && ref && mine.columns.map((c) => c.toLowerCase()).join(',') === ref.columns.map((c) => c.toLowerCase()).join(',');
        results.push({ name: 'Columns com os nomes: ' + (ref ? ref.columns.join(', ') : ''), pass: !!ok });
      }
    }
    return { output: info ? [info] : null, table, results: results.concat(srcChecks(step, code)), error, expectedTable: ref };
  }

  /* ---------- HTML/CSS e DOM: iframe srcdoc de mesma origem ---------- */
  function wrapHTML(code) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script>
      window.__logs = [];
      (function () {
        var f = function (v) { if (typeof v === 'string') return v; try { return JSON.stringify(v); } catch (e) { return String(v); } };
        var log = function () { window.__logs.push(Array.prototype.map.call(arguments, f).join(' ')); };
        console.log = log; console.info = log; console.warn = log; console.error = log;
        window.addEventListener('error', function (e) { window.__logs.push('Error: ' + e.message); window.__err = e.message; });
        window.alert = function (m) { window.__logs.push('[alert] ' + m); };
      })();
    <\/script><style>
      body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 16px; color: #1b1f24; background: #ffffff; line-height: 1.45; }
      img { max-width: 100%; }
    </style></head><body>${code}</body></html>`;
  }
  function runWeb(code, step, frame) {
    const tests = step.tests || [];
    return new Promise((resolve) => {
      let done = false;
      const finish = async () => {
        if (done) return; done = true;
        let doc = null, win = null;
        try { doc = frame.contentDocument; win = frame.contentWindow; } catch (e) { /* sem acesso */ }
        if (!doc) { resolve({ output: null, results: tests.map((t) => ({ name: t[0], pass: false })), error: 'Não foi possível inspecionar o preview.' }); return; }
        const $ = (s) => doc.querySelector(s);
        const $$ = (s) => Array.from(doc.querySelectorAll(s));
        const css = (el, prop) => (el ? win.getComputedStyle(el).getPropertyValue(prop).trim() : '');
        const rules = () => { const out = []; const walk = (list, media) => { for (const r of Array.from(list || [])) { if (r.cssRules && r.media) walk(r.cssRules, r.media.mediaText); else if (r.selectorText) out.push({ sel: r.selectorText, media: media || '', text: r.cssText }); } }; for (const s of Array.from(doc.styleSheets)) { try { walk(s.cssRules); } catch (e) { /* */ } } return out; };
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        const results = [];
        for (const [name, expr] of tests) {
          try {
            const fn = new Function('$', '$$', 'css', 'doc', 'win', 'rules', 'wait', '__src', 'return (async () => (' + expr + '))();');
            results.push({ name, pass: !!(await fn($, $$, css, doc, win, rules, wait, code)) });
          } catch (e) { results.push({ name, pass: false, err: e.message }); }
        }
        const logs = (win.__logs || []).slice();
        resolve({ output: logs, results: results.concat(srcChecks(step, code)), error: win.__err ? 'Error: ' + win.__err : null, preview: true });
      };
      frame.onload = () => setTimeout(finish, 60);
      frame.srcdoc = wrapHTML(code);
      setTimeout(finish, 3000);
    });
  }

  /* ---------- React: JSX compilado pelo TypeScript, React 18 (UMD) dentro do iframe ---------- */
  function compileJSX(ts, code) {
    const out = ts.transpileModule(code, { reportDiagnostics: true, fileName: 'App.jsx',
      compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2019, module: ts.ModuleKind.CommonJS, allowJs: true, esModuleInterop: true } });
    const diags = (out.diagnostics || []).map((d) => {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      if (d.file && d.start != null) { const lc = d.file.getLineAndCharacterOfPosition(d.start); return `Linha ${lc.line + 1}: ${msg}`; }
      return msg;
    });
    return { js: out.outputText, diags };
  }
  async function runReact(code, step, frame) {
    const tests = step.tests || [];
    const ts = await loadTS();
    const { js, diags } = compileJSX(ts, code);
    if (diags.length) return { output: [], results: tests.map((t) => ({ name: t[0], pass: false })), error: diags[0], preview: true };
    const abs = (f) => new URL('vendor/' + f, location.href).href;
    const boot = `
<div id="root"></div>
<script src="${abs('react.js')}"><\/script><script src="${abs('react-dom.js')}"><\/script>
<script>
(function () {
  if (!window.React || !window.ReactDOM) { window.__err = 'React não carregou'; return; }
  var exports = {}, module = { exports: exports };
  var require = function (n) { if (n === 'react') return React; if (n === 'react-dom/client' || n === 'react-dom') return ReactDOM; throw new Error("Cannot find module '" + n + "'"); };
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo, useCallback = React.useCallback, useReducer = React.useReducer, useContext = React.useContext, createContext = React.createContext, Fragment = React.Fragment;
  var createRoot0 = ReactDOM.createRoot;
  var createRoot = ReactDOM.createRoot = function (el) { window.__rendered = true; var r = createRoot0.call(ReactDOM, el); var render = r.render.bind(r); r.render = function (x) { ReactDOM.flushSync(function () { render(x); }); }; return r; };
  try {
    ${js.replace(/<\/script/gi, '<\\/script')}
    var App0 = typeof App === 'function' ? App : (module.exports && module.exports.default) || exports.default;
    if (!window.__rendered && typeof App0 === 'function') createRoot(document.getElementById('root')).render(React.createElement(App0));
  } catch (e) { window.__err = e.message; console.error(e.message); }
})();
<\/script>`;
    return new Promise((resolve) => {
      let done = false;
      const finish = async () => {
        if (done) return; done = true;
        let doc = null, win = null;
        try { doc = frame.contentDocument; win = frame.contentWindow; } catch (e) { /* */ }
        if (!doc) { resolve({ output: null, results: tests.map((t) => ({ name: t[0], pass: false })), error: 'Não foi possível inspecionar o preview.' }); return; }
        const $ = (s) => doc.querySelector(s);
        const $$ = (s) => Array.from(doc.querySelectorAll(s));
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        const text = (s) => { const el = typeof s === 'string' ? $(s) : s; return el ? el.textContent.trim() : ''; };
        const click = async (s) => { const el = typeof s === 'string' ? $(s) : s; if (!el) throw new Error('não achei ' + s); el.dispatchEvent(new win.MouseEvent('click', { bubbles: true })); await wait(30); };
        const type = async (s, value) => {
          const el = typeof s === 'string' ? $(s) : s; if (!el) throw new Error('não achei ' + s);
          const proto = el.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
          el.dispatchEvent(new win.Event('input', { bubbles: true })); await wait(30);
        };
        const submit = async (s) => { const el = typeof s === 'string' ? $(s) : s; if (!el) throw new Error('não achei ' + s); el.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true })); await wait(30); };
        const results = [];
        for (const [name, expr] of tests) {
          try {
            const fn = new Function('$', '$$', 'doc', 'win', 'wait', 'text', 'click', 'type', 'submit', '__src', 'return (async () => (' + expr + '))();');
            results.push({ name, pass: !!(await fn($, $$, doc, win, wait, text, click, type, submit, code)) });
          } catch (e) { results.push({ name, pass: false, err: e.message }); }
        }
        const logs = (win.__logs || []).slice().filter((l) => !/Download the React DevTools/.test(l));
        resolve({ output: logs, results: results.concat(srcChecks(step, code)), error: win.__err ? 'Error: ' + win.__err : null, preview: true });
      };
      frame.onload = () => setTimeout(finish, 150);
      frame.srcdoc = wrapHTML(boot);
      setTimeout(finish, 6000);
    });
  }

  TD.runners = { runJS, runTS, runSQL, runWeb, runReact, loadTS, loadSQL, wrapHTML, MINI_LIB };
})(globalThis.TD = globalThis.TD || {});
