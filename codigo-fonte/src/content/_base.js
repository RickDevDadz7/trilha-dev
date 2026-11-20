/* Base do conteúdo: helpers para escrever lições de forma compacta.
 * Formato de uma lição: { id, title, steps: [learn | quiz | code] }
 *  learn: { t:'learn', title, body }               (markdown simples; blocos com ~~~)
 *  quiz:  { t:'quiz', q, opts, a, why }
 *  code:  { t:'code', title, task, starter, solution, hint, tests:[[nome, expressão]], requires:[[nome, regex]],
 *           runner?: 'dom', prelude?, declare?, typeTests?, db?, check?, ordered?, checkColumns? } */
(function (TD) {
  'use strict';
  TD.courses = TD.courses || [];
  TD.contentVersion = '2026.11.20';
  TD.C = {
    learn: (title, body) => ({ t: 'learn', title, body }),
    quiz: (q, opts, a, why) => ({ t: 'quiz', q, opts, a, why }),
    code: (o) => Object.assign({ t: 'code' }, o),
    lesson: (id, title, ...steps) => ({ id, title, steps }),
    unit: (title, ...lessons) => ({ title, lessons })
  };
})(globalThis.TD = globalThis.TD || {});
