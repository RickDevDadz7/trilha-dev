/* React — React 18 de verdade (UMD) com JSX compilado no navegador. */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'react', name: 'React', badge: 'RE', runner: 'react',
    tagline: 'A biblioteca que mais aparece nas vagas',
    desc: 'Components, JSX, props, state, eventos, formulários, listas e efeitos, terminando com um projeto de portfólio. Pré-requisito: o básico de JavaScript (até Arrays e Objects).',
    notes: 'Em cada exercício, escreva um component chamado **`App`**: o app renderiza ele sozinho na aba **Preview**. Os hooks (`useState`, `useEffect`...) já estão disponíveis, mas pode escrever o `import { useState } from "react";` como num projeto de verdade, que também funciona.',
    units: [
      unit('Components e JSX',
        lesson('react-intro', 'O que é React',
          learn('Interfaces feitas de peças', `**React** é uma biblioteca JavaScript pra construir interfaces. A ideia central: a tela é feita de **components**, peças reutilizáveis como \`Header\`, \`Card\`, \`Button\`.

Um component é só uma **function** que retorna o que deve aparecer na tela:

~~~
function App() {
  return <h1>Hello, React!</h1>;
}
~~~`),
          learn('JSX', `Aquilo que parece HTML dentro do JavaScript é **JSX**. Ele vira chamadas de JavaScript por baixo dos panos.

Regras importantes:

- o nome do component começa com **letra maiúscula**: \`App\`, \`ProductCard\`
- ele **retorna** o JSX (não esqueça o \`return\`)
- JSX com várias linhas vai entre parênteses: \`return ( ... );\``),
          quiz('Qual é um nome válido de component?', ['header', 'productCard', 'ProductCard', 'product-card'], 2, 'Components começam com maiúscula. Com minúscula, o React acha que é uma tag HTML.'),
          code({ title: 'Hello, React', task: 'Faça o component `App` retornar um `<h1>` com o texto `Hello, React!`.',
            starter: 'function App() {\n  // return an h1 with: Hello, React!\n}\n',
            solution: 'function App() {\n  return <h1>Hello, React!</h1>;\n}',
            hint: '`return <h1>Hello, React!</h1>;`',
            tests: [['Mostra um h1', '!!$("h1")'], ['Texto "Hello, React!"', 'text("h1") === "Hello, React!"']] })),

        lesson('react-jsx', 'JavaScript dentro do JSX',
          learn('Chaves { }', `Dentro do JSX, **chaves** \`{ }\` rodam JavaScript:

~~~
function App() {
  const name = "Rick";
  return <p>Hi, {name}! 2 + 2 = {2 + 2}</p>;
}
~~~

Aparece: *Hi, Rick! 2 + 2 = 4*`),
          learn('Diferenças pro HTML', `- \`class\` vira **\`className\`** (porque \`class\` é palavra reservada do JS)
- toda tag **fecha**: \`<img />\`, \`<input />\`, \`<br />\`
- só **um** elemento de fora. Pra agrupar sem criar div, use o **fragment**: \`<>...</>\`

~~~
return (
  <>
    <h1>Title</h1>
    <p className="intro">Text</p>
  </>
);
~~~`),
          predict('O que aparece na tela?', 'function App() {\n  const items = 3;\n  return <p>Cart: {items * 2} items</p>;\n}', ['Cart: {items * 2} items', 'Cart: 6 items', 'Cart: 3 items', 'Um erro'], 1, 'O que está entre chaves é JavaScript: 3 * 2 = 6.'),
          code({ title: 'Cartão de perfil', task: 'Com as variáveis prontas, retorne uma `<div>` com `className="profile"` contendo:\n\n- um `<h2>` com o `name`\n- um `<p>` com o texto `Role: ` seguido do `role`',
            starter: 'function App() {\n  const name = "Rick";\n  const role = "Developer";\n  // 1. return a div with className="profile"\n  // 2. inside: an h2 with {name}\n  // 3. and a p with: Role: {role}\n}\n',
            solution: 'function App() {\n  const name = "Rick";\n  const role = "Developer";\n  return (\n    <div className="profile">\n      <h2>{name}</h2>\n      <p>Role: {role}</p>\n    </div>\n  );\n}',
            hint: 'Use `className`, não `class`. E `{name}` entre chaves.',
            tests: [['div.profile existe', '!!$("div.profile")'], ['h2 com o nome', 'text(".profile h2") === "Rick"'], ['p com "Role: Developer"', 'text(".profile p") === "Role: Developer"']] })),

        lesson('react-components', 'Juntando components',
          learn('Components dentro de components', `Um component pode usar outros, como se fossem tags:

~~~
function Logo() {
  return <span className="logo">Trilha</span>;
}

function App() {
  return (
    <header>
      <Logo />
      <nav>Home</nav>
    </header>
  );
}
~~~

Escreveu uma vez, usa quantas vezes quiser.`),
          predict('Quantos `<li>` aparecem?', 'function Item() {\n  return <li>Task</li>;\n}\nfunction App() {\n  return <ul><Item /><Item /><Item /></ul>;\n}', ['1', '3', '0', 'Erro: Item não é HTML'], 1, 'Cada `<Item />` renderiza um `<li>`.'),
          code({ title: 'Reutilizando', task: 'Crie um component `Badge` que retorna `<span className="badge">NEW</span>`. No `App`, retorne uma `<div>` com **dois** `<Badge />`.',
            starter: '// 1. create the Badge component\n\nfunction App() {\n  // 2. return a div with two Badge components\n}\n',
            solution: 'function Badge() {\n  return <span className="badge">NEW</span>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <Badge />\n      <Badge />\n    </div>\n  );\n}',
            hint: 'Declare `function Badge() { return ...; }` fora do App, e use `<Badge />` duas vezes.',
            tests: [['Dois .badge na tela', '$$(".badge").length === 2'], ['Com o texto NEW', '$$(".badge").every((b) => b.textContent === "NEW")'], ['Usa um component Badge', '/function\\s+Badge|const\\s+Badge/.test(__src)']] })),

        lesson('react-props', 'Props',
          learn('Passando dados pra um component', `**Props** são os "parâmetros" de um component. Você passa como atributos:

~~~
<Card title="Keyboard" price={99} />
~~~

E recebe como um object, normalmente desestruturado:

~~~
function Card({ title, price }) {
  return <p>{title}: €{price}</p>;
}
~~~

Texto vai entre aspas; número, boolean e variáveis entre chaves.`),
          quiz('Como passar o **número** 99 como prop?', ['price="99"', 'price={99}', 'price=99', 'price:{99}'], 1, 'Entre aspas seria a string "99". Pra número, use chaves.'),
          code({ title: 'Vitrine', task: 'Crie `Product({ name, price })` que retorna uma `<div className="product">` com um `<h3>` do nome e um `<p>` com `€` + preço (ex.: `€49`). No `App`, mostre dois produtos: `Mouse` (`29`) e `Monitor` (`199`).',
            starter: '// 1. create Product({ name, price })\n\nfunction App() {\n  // 2. show Mouse (29) and Monitor (199)\n}\n',
            solution: 'function Product({ name, price }) {\n  return (\n    <div className="product">\n      <h3>{name}</h3>\n      <p>€{price}</p>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <div>\n      <Product name="Mouse" price={29} />\n      <Product name="Monitor" price={199} />\n    </div>\n  );\n}',
            hint: 'No App: `<Product name="Mouse" price={29} />`.',
            tests: [['Dois .product', '$$(".product").length === 2'], ['Nomes certos', 'text($$(".product h3")[0]) === "Mouse" && text($$(".product h3")[1]) === "Monitor"'], ['Preços com €', 'text($$(".product p")[0]) === "€29" && text($$(".product p")[1]) === "€199"']] }))
      ),

      unit('State e eventos',
        lesson('react-state', 'useState',
          learn('Dados que mudam', `Variáveis comuns **não** atualizam a tela. Pra isso existe o **state**:

~~~
const [count, setCount] = useState(0);
~~~

- \`count\`: o valor atual (começa em \`0\`)
- \`setCount\`: a function que muda o valor

Quando você chama \`setCount(5)\`, o React **renderiza o component de novo** com o valor novo.`),
          learn('Eventos', `Eventos em JSX são em camelCase e recebem uma **function**:

~~~
<button onClick={() => setCount(count + 1)}>
  +1
</button>
~~~

Cuidado: \`onClick={setCount(count + 1)}\` (sem a arrow function) **executa na hora** e trava o app num loop.`),
          predict('Depois de clicar 3 vezes no botão, o que aparece?', 'function App() {\n  const [n, setN] = useState(10);\n  return <button onClick={() => setN(n - 1)}>{n}</button>;\n}', ['10', '7', '13', '-3'], 1, 'Começa em 10 e cada clique tira 1: 10 → 9 → 8 → 7.'),
          code({ title: 'Contador', task: 'Crie um state `count` começando em `0`. Mostre ele num `<p>` e faça um `<button>` com o texto `+1` que soma 1.',
            starter: 'function App() {\n  // 1. create the count state, starting at 0\n\n  return (\n    <div>\n      {/* 2. show count in a p */}\n      {/* 3. a button +1 that adds 1 */}\n    </div>\n  );\n}\n',
            solution: 'function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>{count}</p>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}',
            hint: '`const [count, setCount] = useState(0);` e `onClick={() => setCount(count + 1)}`.',
            tests: [['Começa em 0', 'text("p") === "0"'], ['Clicando soma 1', '(await click("button"), text("p") === "1")'], ['E continua somando', '(await click("button"), await click("button"), text("p") === "3")']] })),

        lesson('react-forms', 'Formulários',
          learn('Inputs controlados', `Pra ler o que a pessoa digita, ligue o input a um state:

~~~
const [name, setName] = useState("");

<input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
<p>Hello, {name}</p>
~~~

\`e.target.value\` é o texto atual do input. Isso se chama **input controlado**: o state manda no que aparece.`),
          quiz('O que `e.target.value` contém num `onChange` de input?', ['O valor antigo', 'O texto atual do input', 'O nome do input', 'Um boolean'], 1, '`e.target` é o input; `.value` é o que está escrito nele agora.'),
          code({ title: 'Prévia ao vivo', task: 'Crie um state `city` (começa vazio). Ligue um `<input>` a ele e mostre num `<p>` o texto `I live in ` + city.',
            starter: 'function App() {\n  // 1. city state, starting with ""\n\n  return (\n    <div>\n      {/* 2. controlled input */}\n      {/* 3. p: I live in {city} */}\n    </div>\n  );\n}\n',
            solution: 'function App() {\n  const [city, setCity] = useState("");\n\n  return (\n    <div>\n      <input value={city} onChange={(e) => setCity(e.target.value)} />\n      <p>I live in {city}</p>\n    </div>\n  );\n}',
            hint: '`<input value={city} onChange={(e) => setCity(e.target.value)} />`',
            tests: [['Tem um input', '!!$("input")'], ['Atualiza ao digitar', '(await type("input", "Berlin"), text("p") === "I live in Berlin")'], ['Input controlado (value)', '(await type("input", "Munich"), $("input").value === "Munich" && text("p") === "I live in Munich")']] })),

        lesson('react-conditional', 'Mostrar ou esconder',
          learn('Renderização condicional', `Dois jeitos de mostrar algo só às vezes:

~~~
{isOpen && <p>Details here</p>}

{isLoggedIn ? <p>Welcome!</p> : <button>Log in</button>}
~~~

- \`&&\`: mostra ou não mostra nada
- \`? :\`: escolhe entre duas coisas`),
          predict('Com `isOpen = false`, o que aparece?', '<div>\n  <h3>FAQ</h3>\n  {isOpen && <p>Answer</p>}\n</div>', ['FAQ e Answer', 'Só FAQ', 'Só Answer', 'false'], 1, 'Com `false &&`, o React não mostra nada no lugar.'),
          code({ title: 'Mostrar detalhes', task: 'Crie um state `open` (começa `false`). Um `<button>` alterna entre aberto e fechado. Quando aberto, mostre `<p className="details">Shipping in 2 days</p>`. O texto do botão é `Hide` quando aberto e `Show` quando fechado.',
            starter: 'function App() {\n  // 1. open state, starting false\n\n  return (\n    <div>\n      {/* 2. button: Show / Hide, toggles open */}\n      {/* 3. when open: p.details */}\n    </div>\n  );\n}\n',
            solution: 'function App() {\n  const [open, setOpen] = useState(false);\n\n  return (\n    <div>\n      <button onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"}</button>\n      {open && <p className="details">Shipping in 2 days</p>}\n    </div>\n  );\n}',
            hint: 'Pra alternar: `setOpen(!open)`. Texto do botão: `{open ? "Hide" : "Show"}`.',
            tests: [['Começa fechado', '!$(".details") && text("button") === "Show"'], ['Abre ao clicar', '(await click("button"), !!$(".details") && text("button") === "Hide")'], ['Fecha de novo', '(await click("button"), !$(".details") && text("button") === "Show")']] })),

        lesson('react-lists', 'Listas e key',
          learn('Renderizando arrays', `Pra mostrar uma lista, use \`.map()\` transformando cada item em JSX:

~~~
const langs = ["JS", "TS", "SQL"];

<ul>
  {langs.map((lang) => <li key={lang}>{lang}</li>)}
</ul>
~~~

Cada item precisa de uma **\`key\`** única: é como o React sabe quem é quem quando a lista muda. Use um id; o índice só em último caso.`),
          quiz('Por que a `key` é importante?', ['Pra estilizar a lista', 'Pro React identificar cada item quando a lista muda', 'Pra ordenar a lista', 'É só um warning, não serve pra nada'], 1, 'Sem key estável, o React pode misturar o state de itens diferentes.'),
          code({ title: 'Lista de tarefas', task: 'Com o array `tasks` pronto, mostre um `<ul>` com um `<li>` pra cada tarefa, usando o `title` como texto e o `id` como `key`.',
            starter: 'const tasks = [\n  { id: 1, title: "Learn JSX" },\n  { id: 2, title: "Learn state" },\n  { id: 3, title: "Build a project" },\n];\n\nfunction App() {\n  // return a ul, mapping tasks to li elements\n}\n',
            solution: 'const tasks = [\n  { id: 1, title: "Learn JSX" },\n  { id: 2, title: "Learn state" },\n  { id: 3, title: "Build a project" },\n];\n\nfunction App() {\n  return (\n    <ul>\n      {tasks.map((t) => <li key={t.id}>{t.title}</li>)}\n    </ul>\n  );\n}',
            hint: '`{tasks.map((t) => <li key={t.id}>{t.title}</li>)}`',
            tests: [['3 itens', '$$("li").length === 3'], ['Textos certos, na ordem', '$$("li").map((li) => li.textContent).join("|") === "Learn JSX|Learn state|Build a project"'], ['Usa key', '/key=\\{/.test(__src)']] }))
      ),

      unit('Effects e organização',
        lesson('react-effect', 'useEffect',
          learn('Efeitos colaterais', `Algumas coisas não são "desenhar a tela": mudar o título da aba, buscar dados, salvar no localStorage. Pra isso existe o **\`useEffect\`**:

~~~
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
~~~

O array no final são as **dependências**: o efeito roda depois da primeira renderização e de novo sempre que \`count\` mudar.`),
          quiz('O que `useEffect(() => { ... }, [])` (array vazio) faz?', ['Roda a cada renderização', 'Roda só uma vez, quando o component aparece', 'Nunca roda', 'Dá erro'], 1, 'Sem dependências pra observar, ele roda só na montagem. Bom pra buscar dados iniciais.'),
          code({ title: 'Título da aba', task: 'Já tem um contador. Adicione um `useEffect` que coloca `document.title` como `Clicks: ` + count, e roda de novo quando `count` muda.',
            starter: 'function App() {\n  const [count, setCount] = useState(0);\n\n  // add a useEffect that sets document.title to: Clicks: {count}\n\n  return <button onClick={() => setCount(count + 1)}>Click</button>;\n}\n',
            solution: 'function App() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `Clicks: ${count}`;\n  }, [count]);\n\n  return <button onClick={() => setCount(count + 1)}>Click</button>;\n}',
            hint: '`useEffect(() => { document.title = `Clicks: ${count}`; }, [count]);`',
            tests: [['Título inicial "Clicks: 0"', '(await wait(30), doc.title === "Clicks: 0")'], ['Atualiza ao clicar', '(await click("button"), await click("button"), await wait(30), doc.title === "Clicks: 2")'], ['Tem a dependência [count]', '/\\[\\s*count\\s*\\]/.test(__src)']] })),

        lesson('react-lifting', 'Subindo o state',
          learn('Quem guarda o state?', `Quando dois components precisam do mesmo dado, o state fica no **pai** e desce como prop. Pra o filho mudar o state, o pai passa uma **function** como prop:

~~~
function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add</button>;
}

function App() {
  const [total, setTotal] = useState(0);
  return (
    <>
      <p>{total}</p>
      <AddButton onAdd={() => setTotal(total + 1)} />
    </>
  );
}
~~~`),
          predict('Quem pode mudar o `total`?', 'function App() {\n  const [total, setTotal] = useState(0);\n  return <Child value={total} />;\n}', ['O Child, mudando a prop value', 'Só o App (o Child só recebe o valor)', 'Qualquer component', 'Ninguém'], 1, 'Props são só leitura. Sem receber uma function como `onChange`, o filho não consegue mudar o state do pai.'),
          code({ title: 'Carrinho', task: 'Crie `BuyButton({ label, onBuy })`, que é um `<button>` com o `label` e chama `onBuy` no clique. No `App`, guarde `items` (começa `0`), mostre `Cart: <items>` num `<p>` e use dois `BuyButton`: `Buy 1` (soma 1) e `Buy 5` (soma 5).',
            starter: '// 1. BuyButton({ label, onBuy })\n\nfunction App() {\n  // 2. items state\n  // 3. p with Cart: {items}, and two BuyButtons\n}\n',
            solution: 'function BuyButton({ label, onBuy }) {\n  return <button onClick={onBuy}>{label}</button>;\n}\n\nfunction App() {\n  const [items, setItems] = useState(0);\n  return (\n    <div>\n      <p>Cart: {items}</p>\n      <BuyButton label="Buy 1" onBuy={() => setItems(items + 1)} />\n      <BuyButton label="Buy 5" onBuy={() => setItems(items + 5)} />\n    </div>\n  );\n}',
            hint: 'No App: `<BuyButton label="Buy 5" onBuy={() => setItems(items + 5)} />`.',
            tests: [['Começa com Cart: 0', 'text("p") === "Cart: 0"'], ['Buy 1 soma 1', '(await click($$("button").find((b) => b.textContent === "Buy 1")), text("p") === "Cart: 1")'], ['Buy 5 soma 5', '(await click($$("button").find((b) => b.textContent === "Buy 5")), text("p") === "Cart: 6")'], ['Usa o component BuyButton', '/BuyButton/.test(__src)']] })),

        lesson('react-async', 'Carregando dados',
          learn('Loading, dados e erro', `Buscar dados é assíncrono: a tela aparece **antes** dos dados chegarem. Padrão comum:

~~~
const [users, setUsers] = useState(null);

useEffect(() => {
  fetchUsers().then((data) => setUsers(data));
}, []);

if (!users) return <p>Loading...</p>;
return <ul>{users.map(...)}</ul>;
~~~

No mundo real, \`fetchUsers\` usaria \`fetch("/api/users")\`.`),
          quiz('Por que mostrar "Loading..." primeiro?', ['É obrigatório no React', 'Porque os dados ainda não chegaram na primeira renderização', 'Pra deixar o app mais lento', 'Pra esconder erros'], 1, 'O efeito roda depois da primeira renderização, e a resposta demora. Sem isso, `users.map` quebraria com null.'),
          code({ title: 'Lista de devs', task: 'A function `fetchDevs()` já existe e devolve uma Promise com um array de nomes. Mostre `<p>Loading...</p>` enquanto carrega e depois um `<ul>` com um `<li>` por nome.',
            starter: 'function fetchDevs() {\n  return new Promise((resolve) => setTimeout(() => resolve(["Ana", "Lukas", "Marta"]), 400));\n}\n\nfunction App() {\n  // 1. devs state, starting null\n  // 2. useEffect (runs once): fetchDevs().then(...)\n  // 3. if no devs yet: Loading...\n  // 4. else: ul with li for each name\n}\n',
            solution: 'function fetchDevs() {\n  return new Promise((resolve) => setTimeout(() => resolve(["Ana", "Lukas", "Marta"]), 400));\n}\n\nfunction App() {\n  const [devs, setDevs] = useState(null);\n\n  useEffect(() => {\n    fetchDevs().then((data) => setDevs(data));\n  }, []);\n\n  if (!devs) return <p>Loading...</p>;\n  return (\n    <ul>\n      {devs.map((name) => <li key={name}>{name}</li>)}\n    </ul>\n  );\n}',
            hint: '`useEffect(() => { fetchDevs().then((data) => setDevs(data)); }, []);`',
            tests: [['Mostra Loading... no começo', 'text("p") === "Loading..."'], ['Depois mostra os 3 nomes', '(await wait(700), $$("li").map((l) => l.textContent).join(",") === "Ana,Lukas,Marta")'], ['Loading some', '(await wait(10), !$("p"))']] }))
      ),

      unit('Projeto de portfólio',
        lesson('react-final', 'Projeto final: Todo app',
          learn('O que você vai construir', `Um **todo app** completo, o clássico projeto de portfólio de React:

1. Um formulário pra **adicionar** tarefas
2. Clicar numa tarefa marca como **feita**
3. Um botão pra **remover**
4. Um contador de tarefas pendentes

Depois de passar, copie o código pra um projeto Vite (\`npm create vite@latest\`), publique no GitHub Pages e coloque no portfólio.`),
          learn('Atualizando arrays no state', `Nunca altere o array do state direto (\`push\`, \`splice\`). Crie um **array novo**:

~~~
// adicionar
setTodos([...todos, { id: Date.now(), text, done: false }]);
// alternar
setTodos(todos.map((t) => t.id === id ? { ...t, done: !t.done } : t));
// remover
setTodos(todos.filter((t) => t.id !== id));
~~~`),
          quiz('Qual jeito de adicionar um item ao state `todos` está certo?', ['todos.push(item)', 'setTodos(todos.push(item))', 'setTodos([...todos, item])', 'todos = [...todos, item]'], 2, 'Crie um array novo e passe pro setter. `push` muda o array antigo e o React não percebe a mudança.'),
          predict('O que `todos.filter((t) => !t.done).length` dá?', 'const todos = [\n  { text: "a", done: true },\n  { text: "b", done: false },\n  { text: "c", done: false },\n];', ['1', '2', '3', '0'], 1, 'Sobram as duas que não estão feitas: b e c.'),
          code({ title: 'Parte 1: adicionar', task: 'Crie o app com:\n\n- state `todos` (array vazio) e `text` (string vazia)\n- um `<form>` com um `<input>` controlado e um `<button>` `Add`\n- no `onSubmit`: `e.preventDefault()`, adiciona `{ id, text, done: false }` (se o texto não for vazio) e limpa o input\n- um `<ul>` com um `<li>` por todo',
            starter: 'function App() {\n  // 1. todos and text states\n\n  // 2. handleSubmit(e): preventDefault, add the todo, clear text\n\n  return (\n    <div>\n      {/* 3. form with input + Add button */}\n      {/* 4. ul with one li per todo */}\n    </div>\n  );\n}\n',
            solution: 'function App() {\n  const [todos, setTodos] = useState([]);\n  const [text, setText] = useState("");\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    if (!text.trim()) return;\n    setTodos([...todos, { id: Date.now(), text, done: false }]);\n    setText("");\n  }\n\n  return (\n    <div>\n      <form onSubmit={handleSubmit}>\n        <input value={text} onChange={(e) => setText(e.target.value)} />\n        <button>Add</button>\n      </form>\n      <ul>\n        {todos.map((t) => <li key={t.id}>{t.text}</li>)}\n      </ul>\n    </div>\n  );\n}',
            hint: 'No submit: `setTodos([...todos, { id: Date.now(), text, done: false }]); setText("");`',
            tests: [['Começa sem itens', '$$("li").length === 0'], ['Adiciona uma tarefa', '(await type("input", "Write README"), await submit("form"), $$("li").length === 1 && text("li") === "Write README")'], ['Limpa o input', '$("input").value === ""'], ['Ignora texto vazio', '(await type("input", "   "), await submit("form"), $$("li").length === 1)']] }),
          code({ title: 'Parte 2: concluir, remover e contar', task: 'Agora complete o app:\n\n- clicar no **texto** (`<span>`) da tarefa alterna `done`; tarefa feita ganha `className="done"` no `<li>`\n- cada `<li>` tem um `<button>` `×` que remove a tarefa\n- um `<p className="left">` mostra `N left` (quantas **não** estão feitas)',
            starter: 'function App() {\n  const [todos, setTodos] = useState([\n    { id: 1, text: "Learn React", done: false },\n    { id: 2, text: "Build portfolio", done: false },\n  ]);\n\n  // 1. toggle(id): flip done\n  // 2. remove(id)\n  // 3. left = how many are not done\n\n  return (\n    <div>\n      <ul>\n        {todos.map((t) => (\n          <li key={t.id}>\n            {/* span with t.text (click toggles), and a × button */}\n          </li>\n        ))}\n      </ul>\n      {/* p.left: N left */}\n    </div>\n  );\n}\n',
            solution: 'function App() {\n  const [todos, setTodos] = useState([\n    { id: 1, text: "Learn React", done: false },\n    { id: 2, text: "Build portfolio", done: false },\n  ]);\n\n  function toggle(id) {\n    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));\n  }\n  function remove(id) {\n    setTodos(todos.filter((t) => t.id !== id));\n  }\n  const left = todos.filter((t) => !t.done).length;\n\n  return (\n    <div>\n      <ul>\n        {todos.map((t) => (\n          <li key={t.id} className={t.done ? "done" : ""}>\n            <span onClick={() => toggle(t.id)}>{t.text}</span>\n            <button onClick={() => remove(t.id)}>×</button>\n          </li>\n        ))}\n      </ul>\n      <p className="left">{left} left</p>\n    </div>\n  );\n}',
            hint: '`className={t.done ? "done" : ""}` no li, `onClick={() => toggle(t.id)}` no span, e `left = todos.filter((t) => !t.done).length`.',
            tests: [['Mostra "2 left"', 'text(".left") === "2 left"'], ['Clicar marca como feita', '(await click($$("li span")[0]), $$("li")[0].className === "done" && text(".left") === "1 left")'], ['Clicar de novo desmarca', '(await click($$("li span")[0]), $$("li")[0].className !== "done" && text(".left") === "2 left")'], ['× remove', '(await click($$("li button")[1]), $$("li").length === 1 && text(".left") === "1 left")']] }))
      )
    ]
  });
})(window.TD);
