/* JavaScript — módulos 9 a 12: assíncrono, DOM, ferramentas, avançado */
(function (TD) {
  'use strict';
  const { learn, quiz, code, lesson, unit } = TD.C;
  const js = TD.courses.find((c) => c.id === 'js');

  const API_PRELUDE = `
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = {
  active: 0, maxConcurrent: 0,
  async _track(ms) { this.active++; this.maxConcurrent = Math.max(this.maxConcurrent, this.active); await sleep(ms); this.active--; },
  async getUser(id) { await this._track(80); if (id === 1) return { id: 1, name: "Ana" }; if (id === 2) return { id: 2, name: "Lukas" }; throw new Error("User not found"); },
  async getPosts(userId) { await this._track(80); return userId === 1 ? [{ id: 10, title: "Hello" }, { id: 11, title: "Async" }] : []; }
};`;

  const FETCH_PRELUDE = `
const fetch = async (url) => {
  await new Promise((r) => setTimeout(r, 20));
  const repos = { "facebook/react": 230000, "vuejs/core": 48000 };
  const m = /^https:\\/\\/api\\.github\\.com\\/repos\\/(.+)$/.exec(url);
  const name = m && m[1];
  if (name && repos[name] != null) return { ok: true, status: 200, json: async () => ({ full_name: name, stargazers_count: repos[name] }) };
  return { ok: false, status: 404, json: async () => ({ message: "Not Found" }) };
};`;

  js.units.push(
    unit('Assíncrono',
      lesson('js-promises', 'Promises',
        learn('Valores que chegam depois', `Muita coisa demora: requisições, leitura de arquivo, timers. JavaScript não trava esperando; ele usa **Promises**, objects que representam um valor futuro.

~~~
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done!"), 1000);
});

p.then(value => console.log(value))   // "done!" depois de 1s
 .catch(error => console.log(error));
~~~

Uma Promise está em um de três estados: **pending**, **fulfilled** (deu certo, via \`resolve\`) ou **rejected** (deu erro, via \`reject\`).

O event loop garante que callbacks de timers e promises só rodam quando o código atual termina.`),
        quiz('O que aparece primeiro?\n\n`setTimeout(() => console.log("A"), 0); console.log("B");`', ['A', 'B', 'Os dois juntos', 'Nenhum'], 1, 'Mesmo com 0 ms, o callback do `setTimeout` só roda depois que o código atual termina. "B" vem antes.'),
        code({ title: 'delay', task: 'Crie `delay(ms, value)` que retorna uma **Promise** que resolve com `value` depois de `ms` milissegundos.',
          starter: 'function delay(ms, value) {\n  // return a new Promise\n}\n', solution: 'function delay(ms, value) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(value), ms);\n  });\n}',
          hint: '`return new Promise(resolve => setTimeout(() => resolve(value), ms));`',
          tests: [['Retorna uma Promise', 'delay(1, 0) instanceof Promise'], ['Resolve com o valor', '(await delay(10, "ok")) === "ok"'], ['Espera o tempo pedido', '(async () => { const t = Date.now(); await delay(60); return Date.now() - t >= 50; })()']] })),

      lesson('js-async-await', 'async / await',
        learn('Código assíncrono que parece síncrono', `\`async/await\` é o jeito moderno de usar Promises:

~~~
async function showUser(id) {
  try {
    const user = await api.getUser(id);   // espera a Promise
    console.log(user.name);
  } catch (error) {
    console.log("Failed:", error.message);
  }
}
~~~

- \`await\` só funciona dentro de functions \`async\` (ou no topo de módulos).
- Toda function \`async\` **retorna uma Promise**.
- Erros de Promises rejeitadas caem no \`catch\`, igual a erros normais.

Neste exercício existe um object \`api\` de mentira com \`api.getUser(id)\`, que demora um pouco e lança erro se o usuário não existir.`),
        quiz('O que uma function `async` sempre retorna?', ['undefined', 'O valor direto', 'Uma Promise', 'Um callback'], 2, 'Mesmo que você retorne um valor comum, ele vem embrulhado numa Promise.'),
        code({ title: 'Nome do usuário', task: 'Usando `api.getUser(id)` (já existe), crie `async function getUserName(id)` que retorna o `name` do usuário. Se `getUser` lançar erro, retorne `"Unknown"`.',
          prelude: API_PRELUDE, starter: 'async function getUserName(id) {\n  // use await api.getUser(id)\n}\n',
          solution: 'async function getUserName(id) {\n  try {\n    const user = await api.getUser(id);\n    return user.name;\n  } catch (error) {\n    return "Unknown";\n  }\n}',
          hint: 'Coloque o `await api.getUser(id)` dentro de `try` e retorne `"Unknown"` no `catch`.',
          tests: [['id 1 → "Ana"', '(await getUserName(1)) === "Ana"'], ['id 99 → "Unknown"', '(await getUserName(99)) === "Unknown"']], requires: [['Usa `await`', '\\bawait\\b']] })),

      lesson('js-promise-all', 'Promise.all e paralelismo',
        learn('Esperando várias coisas ao mesmo tempo', `Dois \`await\` seguidos rodam **em sequência**:

~~~
const user = await api.getUser(1);     // 80ms
const posts = await api.getPosts(1);   // + 80ms
~~~

Se uma não depende da outra, rode **em paralelo** com \`Promise.all\`:

~~~
const [user, posts] = await Promise.all([
  api.getUser(1),
  api.getPosts(1),
]);  // ~80ms no total
~~~

Variações úteis:

- \`Promise.allSettled\`: espera todas, mesmo se alguma falhar
- \`Promise.race\`: fica com a primeira que terminar (útil pra timeout)
- \`Promise.any\`: a primeira que der certo`),
        quiz('Se uma das Promises de `Promise.all` rejeitar, o que acontece?', ['As outras são canceladas e retorna undefined', 'O Promise.all inteiro rejeita com aquele erro', 'Ela é ignorada', 'Retorna null no lugar dela'], 1, '`Promise.all` falha rápido: rejeita assim que qualquer uma rejeitar. Use `allSettled` se precisar de todos os resultados.'),
        code({ title: 'Dashboard rápido', task: 'Crie `async function loadDashboard(userId)` que busca `api.getUser(userId)` e `api.getPosts(userId)` **em paralelo** e retorna `{ user, posts }`.',
          prelude: API_PRELUDE, starter: 'async function loadDashboard(userId) {\n  // your code\n}\n',
          solution: 'async function loadDashboard(userId) {\n  const [user, posts] = await Promise.all([\n    api.getUser(userId),\n    api.getPosts(userId),\n  ]);\n  return { user, posts };\n}',
          hint: '`const [user, posts] = await Promise.all([api.getUser(userId), api.getPosts(userId)]);`',
          tests: [['Retorna user e posts', '(async () => { const d = await loadDashboard(1); return d.user.name === "Ana" && d.posts.length === 2; })()'],
            ['Busca em paralelo', '(async () => { api.maxConcurrent = 0; await loadDashboard(1); return api.maxConcurrent >= 2; })()']] })),

      lesson('js-fetch', 'fetch e APIs',
        learn('Conversando com servidores', `\`fetch\` faz requisições HTTP e retorna uma Promise de **Response**:

~~~
async function getRepo(name) {
  const res = await fetch(\`https://api.github.com/repos/\${name}\`);
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);
  }
  const data = await res.json();   // json() também é assíncrono
  return data;
}
~~~

Pontos importantes:

- \`fetch\` **não** rejeita em erro 404 ou 500. Confira \`res.ok\` (true pra status 200-299).
- \`res.json()\` lê o corpo e converte de JSON.
- Pra enviar dados: \`fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })\`.

Neste exercício o \`fetch\` é simulado: conhece os repos \`facebook/react\` e \`vuejs/core\`, e responde 404 pro resto.`),
        quiz('Um `fetch` que recebe status 404 faz o quê?', ['Rejeita a Promise', 'Resolve normalmente, com res.ok === false', 'Retorna null', 'Tenta de novo sozinho'], 1, 'Só erros de rede rejeitam. Status HTTP de erro chegam como Response com `ok: false`.'),
        code({ title: 'Estrelas no GitHub', task: 'Crie `async function getStars(repo)` que faz `fetch` em `https://api.github.com/repos/<repo>` e retorna `stargazers_count`. Se `res.ok` for false, lance `Error` com a mensagem `HTTP <status>` (ex: `HTTP 404`).',
          prelude: FETCH_PRELUDE, starter: 'async function getStars(repo) {\n  // your code\n}\n',
          solution: 'async function getStars(repo) {\n  const res = await fetch(`https://api.github.com/repos/${repo}`);\n  if (!res.ok) {\n    throw new Error(`HTTP ${res.status}`);\n  }\n  const data = await res.json();\n  return data.stargazers_count;\n}',
          hint: 'Depois do `fetch`, cheque `res.ok`, depois `await res.json()`.',
          tests: [['facebook/react → 230000', '(await getStars("facebook/react")) === 230000'],
            ['Repo inexistente lança "HTTP 404"', '(async () => { try { await getStars("nope/nope"); return false; } catch (e) { return e.message === "HTTP 404"; } })()']] }))
    ),

    unit('DOM e eventos',
      lesson('js-dom-select', 'Selecionando e alterando elementos',
        learn('JavaScript controlando a página', `O **DOM** é a árvore de elementos da página, que o JavaScript pode ler e alterar:

~~~
const title = document.querySelector("#title");   // por id
const items = document.querySelectorAll(".item"); // todos com a class

title.textContent = "New title";
title.classList.add("active");
title.classList.toggle("hidden");
title.style.color = "crimson";
title.setAttribute("data-id", "42");
~~~

\`querySelector\` usa os mesmos seletores do CSS. Prefira \`textContent\` a \`innerHTML\` quando for só texto: é mais seguro.

Nos exercícios de DOM, você escreve HTML com uma tag \`<script>\`, e o preview mostra o resultado.`),
        quiz('Qual seletor pega o elemento com `id="menu"`?', ['document.querySelector("menu")', 'document.querySelector(".menu")', 'document.querySelector("#menu")', 'document.getElement("menu")'], 2, 'Igual ao CSS: `#` pra id, `.` pra class.'),
        code({ runner: 'dom', title: 'Mude o título', task: 'No `<script>`, mude o texto do `#title` para `Hello, DOM` e adicione a class `active` no parágrafo `.msg`.',
          starter: '<h1 id="title">Old title</h1>\n<p class="msg">The DOM is a tree of elements.</p>\n\n<script>\n  // your code here\n</script>\n',
          solution: '<h1 id="title">Old title</h1>\n<p class="msg">The DOM is a tree of elements.</p>\n\n<script>\n  document.querySelector("#title").textContent = "Hello, DOM";\n  document.querySelector(".msg").classList.add("active");\n</script>',
          hint: '`document.querySelector("#title").textContent = ...` e `.classList.add("active")`.',
          tests: [['Título virou "Hello, DOM"', '$("#title").textContent === "Hello, DOM"'], ['`.msg` tem a class active', '$(".msg").classList.contains("active")']], requires: [['Usa querySelector', 'querySelector']] })),

      lesson('js-dom-events', 'Eventos',
        learn('Reagindo ao usuário', `Eventos avisam quando algo acontece: clique, tecla, envio de formulário, scroll...

~~~
const button = document.querySelector("#save");
button.addEventListener("click", (event) => {
  console.log("clicked!", event.target);
});
~~~

Eventos comuns: \`click\`, \`input\` (digitou num campo), \`change\`, \`submit\`, \`keydown\`, \`mouseenter\`.

O parâmetro \`event\` traz detalhes: \`event.target\` (quem disparou), \`event.key\` (tecla) e \`event.preventDefault()\` (cancela o comportamento padrão).`),
        quiz('Qual method registra uma function pra rodar quando um evento acontece?', ['onEvent', 'addEventListener', 'listen', 'attachEvent'], 1, '`element.addEventListener("click", callback)`.'),
        code({ runner: 'dom', title: 'Contador de cliques', task: 'Faça o botão `#inc` aumentar em 1 o número mostrado em `#count` a cada clique.',
          starter: '<button id="inc">+1</button>\n<span id="count">0</span>\n\n<script>\n  // your code here\n</script>\n',
          solution: '<button id="inc">+1</button>\n<span id="count">0</span>\n\n<script>\n  let count = 0;\n  const output = document.querySelector("#count");\n  document.querySelector("#inc").addEventListener("click", () => {\n    count++;\n    output.textContent = count;\n  });\n</script>',
          hint: 'Guarde a contagem numa variável `let count = 0` e atualize `textContent` dentro do listener.',
          tests: [['Começa em 0', '$("#count").textContent.trim() === "0"'], ['2 cliques → 2', '($("#inc").click(), $("#inc").click(), $("#count").textContent.trim() === "2")']], requires: [['Usa addEventListener', 'addEventListener']] })),

      lesson('js-dom-create', 'Criando elementos',
        learn('Gerando HTML a partir de dados', `Pra criar elementos dinamicamente:

~~~
const list = document.querySelector("#list");
const skills = ["HTML", "CSS", "JS"];

for (const skill of skills) {
  const li = document.createElement("li");
  li.textContent = skill;
  list.append(li);
}
~~~

Também dá pra remover: \`element.remove()\`, e limpar: \`list.innerHTML = ""\`.

Esse padrão (dados → elementos) é exatamente o que frameworks como React automatizam.`),
        quiz('Qual method cria um elemento novo (ainda fora da página)?', ['document.newElement("li")', 'document.createElement("li")', 'new Element("li")', 'document.append("li")'], 1, '`createElement` cria; depois você coloca na página com `append`.'),
        code({ runner: 'dom', title: 'Lista de skills', task: 'Use o array `skills` pra criar um `<li>` pra cada item dentro de `#list`, na mesma ordem.',
          starter: '<h2>My stack</h2>\n<ul id="list"></ul>\n\n<script>\n  const skills = ["HTML", "CSS", "JavaScript", "SQL"];\n  // your code here\n</script>\n',
          solution: '<h2>My stack</h2>\n<ul id="list"></ul>\n\n<script>\n  const skills = ["HTML", "CSS", "JavaScript", "SQL"];\n  const list = document.querySelector("#list");\n  for (const skill of skills) {\n    const li = document.createElement("li");\n    li.textContent = skill;\n    list.append(li);\n  }\n</script>',
          hint: 'Para cada skill: `createElement("li")`, defina `textContent` e `list.append(li)`.',
          tests: [['4 itens na lista', '$$("#list li").length === 4'], ['Na ordem certa', '$$("#list li").map(li => li.textContent).join() === "HTML,CSS,JavaScript,SQL"']], requires: [['Usa createElement', 'createElement']] })),

      lesson('js-dom-forms', 'Formulários',
        learn('Lendo o que o usuário digita', `Num formulário, escute o evento \`submit\` e **cancele o envio padrão** (que recarregaria a página):

~~~
const form = document.querySelector("#form");
const input = document.querySelector("#task");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;           // ignora vazio
  console.log("new task:", text);
  input.value = "";            // limpa o campo
});
~~~

\`input.value\` lê (e escreve) o conteúdo do campo.`),
        quiz('Por que usar `event.preventDefault()` no submit?', ['Pra validar os campos', 'Pra impedir o browser de enviar e recarregar a página', 'Pra limpar o formulário', 'É obrigatório em todo evento'], 1, 'Sem isso o browser faz o envio tradicional e a página recarrega.'),
        code({ runner: 'dom', title: 'Lista de tarefas', task: 'Ao enviar o `#form`: adicione um `<li>` com o texto digitado em `#task` dentro de `#todos` e limpe o campo. Não adicione nada se o texto estiver vazio.',
          starter: '<form id="form">\n  <input id="task" placeholder="New task">\n  <button>Add</button>\n</form>\n<ul id="todos"></ul>\n\n<script>\n  // your code here\n</script>\n',
          solution: '<form id="form">\n  <input id="task" placeholder="New task">\n  <button>Add</button>\n</form>\n<ul id="todos"></ul>\n\n<script>\n  const form = document.querySelector("#form");\n  const input = document.querySelector("#task");\n  const todos = document.querySelector("#todos");\n  form.addEventListener("submit", (event) => {\n    event.preventDefault();\n    const text = input.value.trim();\n    if (!text) return;\n    const li = document.createElement("li");\n    li.textContent = text;\n    todos.append(li);\n    input.value = "";\n  });\n</script>',
          hint: 'No listener de `submit`: `preventDefault()`, leia `input.value.trim()`, crie o `li` e zere o `input.value`.',
          tests: [['Adiciona a tarefa', '($("#task").value = "Study SQL", $("#form").dispatchEvent(new win.Event("submit", { cancelable: true })), $$("#todos li").length === 1 && $("#todos li").textContent === "Study SQL")'],
            ['Limpa o campo', '$("#task").value === ""'],
            ['Ignora texto vazio', '($("#task").value = "   ", $("#form").dispatchEvent(new win.Event("submit", { cancelable: true })), $$("#todos li").length === 1)']], requires: [['Usa preventDefault', 'preventDefault']] }))
    ),

    unit('Módulos e ferramentas',
      lesson('js-modules', 'Módulos: import e export',
        learn('Organizando código em arquivos', `Projetos reais dividem o código em **módulos** (arquivos):

~~~
// math.js
export function add(a, b) { return a + b; }
export const PI = 3.14159;
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { add, PI } from "./math.js";
~~~

- **Named exports** (\`export function add\`): importados com chaves, pelo nome exato.
- **Default export**: um por arquivo, importado com qualquer nome, sem chaves.

No browser: \`<script type="module" src="app.js">\`. No Node.js moderno: \`"type": "module"\` no package.json.`),
        quiz('Como importar a named export `formatDate` de `./utils.js`?', ['import formatDate from "./utils.js"', 'import { formatDate } from "./utils.js"', 'require formatDate from "./utils.js"', 'import "./utils.js".formatDate'], 1, 'Named exports vêm entre chaves. Sem chaves, você pegaria o default export.'),
        quiz('Quantos `export default` um arquivo pode ter?', ['Nenhum', 'Um', 'Até três', 'Quantos quiser'], 1, 'Só um default por módulo. Named exports podem ser vários.')),

      lesson('js-npm', 'Node.js e npm',
        learn('JavaScript fora do browser', `**Node.js** roda JavaScript no servidor e no seu PC. Com ele vem o **npm**, o gerenciador de pacotes.

~~~
npm init -y              # cria o package.json
npm install express      # instala uma dependência
npm install -D vitest    # dependência só de desenvolvimento
npm run dev              # roda um script do package.json
~~~

O \`package.json\` lista dependências e scripts:

~~~
{
  "scripts": { "dev": "node server.js", "test": "vitest" },
  "dependencies": { "express": "^4.19.0" }
}
~~~

A pasta \`node_modules\` nunca vai pro Git (fica no \`.gitignore\`): qualquer um recria com \`npm install\`.`),
        quiz('Pra que serve o `package-lock.json`?', ['Bloqueia o projeto pra edição', 'Fixa as versões exatas instaladas, pra todo mundo ter o mesmo', 'Guarda senhas', 'Lista os arquivos do projeto'], 1, 'Ele trava a árvore exata de versões, garantindo instalações iguais em qualquer máquina.'),
        quiz('Qual comando roda o script `"build"` do package.json?', ['npm build', 'npm run build', 'node build', 'npm start build'], 1, 'Scripts personalizados rodam com `npm run <nome>` (só `start` e `test` têm atalho).'))
    ),

    unit('Avançado',
      lesson('js-map-set', 'Map e Set',
        learn('Estruturas além de object e array', `**Set** guarda valores **sem repetição**:

~~~
const tags = new Set(["js", "css", "js"]);
tags.size;            // 2
tags.has("css");      // true
[...new Set(arr)];    // remove duplicados de um array
~~~

**Map** é um dicionário em que a chave pode ser qualquer coisa e a ordem de inserção é mantida:

~~~
const visits = new Map();
visits.set("home", 1);
visits.set("home", visits.get("home") + 1);
visits.get("home");   // 2
for (const [page, n] of visits) console.log(page, n);
~~~`),
        quiz('Qual o resultado de `new Set([1, 1, 2, 3, 3]).size`?', ['5', '3', '2', '1'], 1, 'Set descarta repetidos: sobram 1, 2 e 3.'),
        code({ title: 'Sem duplicados', task: 'Crie `unique(arr)` que retorna um array sem valores repetidos, mantendo a ordem da primeira aparição. Use `Set`.',
          starter: 'function unique(arr) {\n  // your code\n}\n', solution: 'function unique(arr) {\n  return [...new Set(arr)];\n}', hint: '`[...new Set(arr)]`',
          tests: [['[1,2,2,3,1] → [1,2,3]', 'JSON.stringify(unique([1,2,2,3,1])) === "[1,2,3]"'], ['strings', 'unique(["a","b","a"]).join() === "a,b"']], requires: [['Usa Set', 'new\\s+Set']] }),
        code({ title: 'Contando visitas', task: 'Crie `countVisits(pages)` que recebe um array de páginas visitadas e retorna um **Map** com página → número de visitas.',
          starter: 'function countVisits(pages) {\n  const visits = new Map();\n  // your code\n  return visits;\n}\n', solution: 'function countVisits(pages) {\n  const visits = new Map();\n  for (const page of pages) {\n    visits.set(page, (visits.get(page) || 0) + 1);\n  }\n  return visits;\n}',
          hint: '`visits.set(page, (visits.get(page) || 0) + 1)`',
          tests: [['Retorna um Map', 'countVisits([]) instanceof Map'], ['Conta certo', '(() => { const m = countVisits(["home","blog","home"]); return m.get("home") === 2 && m.get("blog") === 1; })()']] })),

      lesson('js-recursion', 'Recursão',
        learn('Functions que chamam a si mesmas', `Uma function **recursiva** resolve um problema chamando a si mesma com uma versão menor dele. Ela sempre precisa de um **caso base**, que para a recursão:

~~~
function factorial(n) {
  if (n <= 1) return 1;          // caso base
  return n * factorial(n - 1);   // passo recursivo
}
factorial(4); // 4 * 3 * 2 * 1 = 24
~~~

Recursão é natural pra estruturas aninhadas: pastas, menus, comentários com respostas, JSON profundo.

Sem caso base: \`RangeError: Maximum call stack size exceeded\`.`),
        quiz('O que acontece com uma function recursiva sem caso base?', ['Retorna undefined', 'Roda até estourar a pilha (stack overflow)', 'Para sozinha depois de 100 chamadas', 'Vira um loop for'], 1, 'Ela se chama infinitamente até estourar a call stack.'),
        code({ title: 'Achatar arrays', task: 'Crie `flatten(arr)` **recursiva** que transforma arrays aninhados em um array plano.\n\nEx: `[1, [2, [3, 4]], 5]` → `[1, 2, 3, 4, 5]`. Não use `.flat()`.',
          starter: 'function flatten(arr) {\n  const result = [];\n  // your code\n  return result;\n}\n', solution: 'function flatten(arr) {\n  const result = [];\n  for (const item of arr) {\n    if (Array.isArray(item)) result.push(...flatten(item));\n    else result.push(item);\n  }\n  return result;\n}',
          hint: 'Para cada item: se `Array.isArray(item)`, faça `result.push(...flatten(item))`; senão `result.push(item)`.',
          tests: [['[1,[2,[3,4]],5]', 'JSON.stringify(flatten([1,[2,[3,4]],5])) === "[1,2,3,4,5]"'], ['[] → []', 'JSON.stringify(flatten([])) === "[]"'], ['Bem aninhado', 'JSON.stringify(flatten([[[["x"]]]])) === \'["x"]\'']],
          requires: [['Chama flatten dentro de flatten', 'function\\s+flatten[\\s\\S]*\\Wflatten\\s*\\(']] })),

      lesson('js-generators', 'Iterators e generators',
        learn('Sequências sob demanda', `Um **generator** (\`function*\`) produz valores um de cada vez com \`yield\`:

~~~
function* idGenerator() {
  let id = 1;
  while (true) yield id++;
}
const ids = idGenerator();
ids.next().value; // 1
ids.next().value; // 2
~~~

Generators são **iterables**: funcionam com \`for...of\` e spread:

~~~
function* take3() { yield "a"; yield "b"; yield "c"; }
[...take3()];   // ["a", "b", "c"]
~~~

Eles calculam valores só quando pedidos (lazy), ótimo pra sequências grandes ou infinitas.`),
        quiz('O que `yield` faz num generator?', ['Encerra a function', 'Entrega um valor e pausa até o próximo next()', 'Lança um erro', 'Cria uma Promise'], 1, 'A execução pausa no `yield` e continua dali no próximo `next()`.'),
        code({ title: 'range', task: 'Crie o generator `range(start, end, step = 1)` que produz números de `start` até **antes** de `end`, pulando de `step` em `step`.\n\nEx: `[...range(0, 10, 3)]` → `[0, 3, 6, 9]`.',
          starter: 'function* range(start, end, step = 1) {\n  // your code\n}\n', solution: 'function* range(start, end, step = 1) {\n  for (let i = start; i < end; i += step) {\n    yield i;\n  }\n}',
          hint: 'Um `for` de `start` até `end` com `i += step`, dando `yield i`.',
          tests: [['range(1, 5)', '[...range(1, 5)].join() === "1,2,3,4"'], ['range(0, 10, 3)', '[...range(0, 10, 3)].join() === "0,3,6,9"'], ['É um generator', 'typeof range(0, 1).next === "function"']], requires: [['Usa `yield`', '\\byield\\b']] })),

      lesson('js-functional', 'Programação funcional',
        learn('Funções puras e composição', `Alguns princípios que deixam código previsível:

- **Função pura**: mesmo input → mesmo output, sem efeitos colaterais (não muda nada fora dela).
- **Imutabilidade**: em vez de alterar dados, crie versões novas (\`map\`, spread, \`toSorted\`).
- **Composição**: montar funções grandes juntando pequenas.

~~~
const trim = s => s.trim();
const lower = s => s.toLowerCase();
const exclaim = s => s + "!";

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const shout = pipe(trim, lower, exclaim);
shout("  HeLLo "); // "hello!"
~~~`),
        quiz('Qual destas funções é pura?', ['() => Math.random()', '(a) => { total += a; }', '(a, b) => a + b', '() => Date.now()'], 2, 'Só ela depende apenas dos argumentos e não altera nada externo.'),
        code({ title: 'pipe', task: 'Crie `pipe(...fns)` que retorna uma function que aplica todas as `fns` em sequência, da esquerda pra direita.',
          starter: 'function pipe(...fns) {\n  // your code\n}\n', solution: 'function pipe(...fns) {\n  return (x) => fns.reduce((value, fn) => fn(value), x);\n}', hint: 'Retorne `x => fns.reduce((v, f) => f(v), x)`.',
          tests: [['pipe(n => n + 1, n => n * 2)(3) → 8', 'pipe(n => n + 1, n => n * 2)(3) === 8'], ['Sem functions devolve o valor', 'pipe()(5) === 5'], ['Ordem esquerda → direita', 'pipe(s => s + "a", s => s + "b")("") === "ab"']] })),

      lesson('js-debounce', 'Debounce',
        learn('Closures + timers na vida real', `Numa busca que filtra enquanto você digita, não faz sentido chamar a API a cada tecla. **Debounce** só executa depois que as chamadas param por um tempo:

~~~
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const search = debounce((q) => console.log("search", q), 300);
search("j"); search("ja"); search("jav");   // só "jav" é buscado
~~~

Junta tudo que você aprendeu: closure (\`timer\` sobrevive entre chamadas), rest/spread e timers.`),
        quiz('O que `clearTimeout(timer)` faz no debounce?', ['Apaga a function', 'Cancela a execução agendada anteriormente', 'Reinicia o browser', 'Pausa o código'], 1, 'Cada nova chamada cancela a anterior e agenda de novo.'),
        code({ title: 'Implemente debounce', task: 'Crie `debounce(fn, ms)` que retorna uma function. Chamadas rápidas seguidas devem resultar em **uma** execução de `fn`, `ms` milissegundos após a última chamada, com os argumentos da última chamada.',
          starter: 'function debounce(fn, ms) {\n  // your code\n}\n', solution: 'function debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}',
          hint: 'Guarde `let timer` fora da function retornada; dentro dela, `clearTimeout(timer)` e agende de novo.',
          tests: [['3 chamadas rápidas → 1 execução', '(async () => { let n = 0; const d = debounce(() => n++, 40); d(); d(); d(); await new Promise(r => setTimeout(r, 100)); return n === 1; })()'],
            ['Usa os argumentos da última chamada', '(async () => { let got; const d = debounce(v => { got = v; }, 30); d("a"); d("b"); await new Promise(r => setTimeout(r, 80)); return got === "b"; })()'],
            ['Não executa antes do tempo', '(async () => { let n = 0; const d = debounce(() => n++, 60); d(); await new Promise(r => setTimeout(r, 20)); return n === 0; })()']] })),

      lesson('js-algorithms', 'Algoritmos e Big O',
        learn('Quanto custa o seu código', `**Big O** descreve como o tempo cresce com o tamanho da entrada (n):

- **O(1)**: constante (acessar \`arr[5]\`, \`map.get(key)\`)
- **O(log n)**: divide o problema pela metade a cada passo (busca binária)
- **O(n)**: percorre tudo uma vez (\`find\`, \`includes\`)
- **O(n²)**: loop dentro de loop sobre os mesmos dados

**Busca binária** num array ordenado: olha o meio; se o alvo é maior, descarta a metade da esquerda; se é menor, a da direita. Com 1 milhão de itens, são no máximo ~20 passos.

~~~
let low = 0, high = arr.length - 1;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  // compare arr[mid] com o alvo...
}
~~~`),
        quiz('Qual a complexidade de procurar um valor com `arr.includes(x)`?', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'No pior caso ele olha item por item: O(n).'),
        code({ title: 'Busca binária', task: 'Crie `binarySearch(sorted, target)` que retorna o **índice** de `target` num array **ordenado**, ou `-1` se não existir. Use busca binária (não use `indexOf`/`includes`/`find`).',
          starter: 'function binarySearch(sorted, target) {\n  let low = 0;\n  let high = sorted.length - 1;\n  // your code\n  return -1;\n}\n',
          solution: 'function binarySearch(sorted, target) {\n  let low = 0;\n  let high = sorted.length - 1;\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (sorted[mid] === target) return mid;\n    if (sorted[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}',
          hint: 'No `while (low <= high)`: calcule `mid`; se `sorted[mid] < target`, `low = mid + 1`, senão `high = mid - 1`.',
          tests: [['Acha no meio', 'binarySearch([1,3,5,7,9], 7) === 3'], ['Acha nas pontas', 'binarySearch([1,3,5,7,9], 1) === 0 && binarySearch([1,3,5,7,9], 9) === 4'], ['Não achou → -1', 'binarySearch([1,3,5], 4) === -1'],
            ['Funciona com 1 milhão de itens', '(() => { const a = Array.from({ length: 1000000 }, (_, i) => i * 2); return binarySearch(a, 777776) === 388888; })()']],
          requires: [['Sem indexOf/includes/find', '^(?![\\s\\S]*\\.(indexOf|includes|find|findIndex)\\s*\\()']] })),

      lesson('js-final', 'Projeto final: inventário',
        learn('Juntando tudo', `Hora de usar o que você aprendeu num mini sistema de inventário de loja.

Você vai precisar de: closures ou class, objects/Map, \`reduce\`, \`sort\`, erros com \`throw\` e validação.

Pense antes de codar:

1. Onde guardar os itens? (um Map ou object: nome → { qty, price })
2. Que erros podem acontecer? (remover mais do que existe)
3. Como calcular o total? (soma de qty × price)
4. Como gerar um relatório ordenado?

Código bom aqui é código legível: nomes claros, functions pequenas.`),
        code({ title: 'createInventory', task: 'Crie `createInventory()` que retorna um object com:\n\n- `add(name, qty, price)`: adiciona `qty` unidades (se o item já existe, soma a quantidade e atualiza o preço)\n- `remove(name, qty)`: tira unidades; lança `Error("Not enough stock")` se não houver o suficiente\n- `total()`: valor total em estoque (soma de qty × price)\n- `report()`: array de strings `"<name>: <qty>"` em ordem alfabética, sem itens zerados',
          starter: 'function createInventory() {\n  // your code\n}\n',
          solution: 'function createInventory() {\n  const items = new Map();\n  return {\n    add(name, qty, price) {\n      const current = items.get(name) || { qty: 0, price };\n      items.set(name, { qty: current.qty + qty, price });\n    },\n    remove(name, qty) {\n      const current = items.get(name);\n      if (!current || current.qty < qty) throw new Error("Not enough stock");\n      current.qty -= qty;\n    },\n    total() {\n      let sum = 0;\n      for (const { qty, price } of items.values()) sum += qty * price;\n      return sum;\n    },\n    report() {\n      return [...items.entries()]\n        .filter(([, item]) => item.qty > 0)\n        .sort(([a], [b]) => a.localeCompare(b))\n        .map(([name, item]) => `${name}: ${item.qty}`);\n    },\n  };\n}',
          hint: 'Guarde os itens num `Map` dentro de `createInventory` (closure) e retorne um object com os 4 methods.',
          tests: [['add e total', '(() => { const inv = createInventory(); inv.add("mouse", 2, 20); inv.add("cable", 3, 5); return inv.total() === 55; })()'],
            ['add soma quantidade', '(() => { const inv = createInventory(); inv.add("mouse", 2, 20); inv.add("mouse", 1, 20); return inv.total() === 60; })()'],
            ['remove funciona', '(() => { const inv = createInventory(); inv.add("mouse", 2, 20); inv.remove("mouse", 1); return inv.total() === 20; })()'],
            ['remove sem estoque lança erro', '(() => { const inv = createInventory(); inv.add("mouse", 1, 20); try { inv.remove("mouse", 5); return false; } catch (e) { return e.message === "Not enough stock"; } })()'],
            ['report ordenado e sem zerados', '(() => { const inv = createInventory(); inv.add("mouse", 1, 20); inv.add("cable", 3, 5); inv.add("adapter", 2, 8); inv.remove("mouse", 1); return inv.report().join("|") === "adapter: 2|cable: 3"; })()']] }))
    )
  );
})(globalThis.TD = globalThis.TD || {});
