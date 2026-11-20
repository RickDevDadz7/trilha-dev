/* HTML & CSS — módulos 5 a 9: box model, Flexbox, Grid, responsivo, CSS moderno */
(function (TD) {
  'use strict';
  const { learn, quiz, code, lesson, unit } = TD.C;
  const web = TD.courses.find((c) => c.id === 'web');

  web.units.push(
    unit('Box model e layout',
      lesson('web-box', 'Box model',
        learn('Todo elemento é uma caixa', `Cada elemento tem 4 camadas, de dentro pra fora:

- **content**
- **padding**: espaço interno
- **border**
- **margin**: espaço externo

~~~
* { box-sizing: border-box; }   /* width inclui padding e border */

.card {
  width: 300px;
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 24px auto;    /* auto nas laterais centraliza blocos com width */
}
~~~

Atalhos: \`padding: 8px 16px\` (vertical horizontal), \`margin: 0 auto\`.`),
        quiz('Com `box-sizing: border-box`, `width: 300px`, `padding: 20px` e `border: 0`, qual a largura total?', ['340px', '300px', '320px', '260px'], 1, 'Com border-box, o padding fica dentro dos 300px.'),
        code({ title: 'Um card', task: 'Estilize a `.card`: `box-sizing: border-box`, `width: 320px`, `padding: 16px`, `border: 2px solid black`, `border-radius: 8px` e centralize com `margin: 0 auto`.',
          starter: '<style>\n  .card {\n    /* your CSS */\n  }\n</style>\n\n<div class="card">\n  <h2>Remote job</h2>\n  <p>Frontend Developer, Berlin</p>\n</div>\n',
          solution: '<style>\n  .card {\n    box-sizing: border-box;\n    width: 320px;\n    padding: 16px;\n    border: 2px solid black;\n    border-radius: 8px;\n    margin: 0 auto;\n  }\n</style>\n\n<div class="card">\n  <h2>Remote job</h2>\n  <p>Frontend Developer, Berlin</p>\n</div>',
          hint: 'Seis properties dentro de `.card { }`.',
          tests: [['Largura total de 320px', '$(".card").getBoundingClientRect().width === 320'], ['padding 16px', 'css($(".card"), "padding-left") === "16px"'], ['borda 2px sólida', 'css($(".card"), "border-top-width") === "2px" && css($(".card"), "border-top-style") === "solid"'],
            ['radius 8px', 'css($(".card"), "border-top-left-radius") === "8px"'], ['Centralizado', 'Math.abs($(".card").getBoundingClientRect().left - (doc.body.getBoundingClientRect().left + (doc.body.clientWidth - 320) / 2)) < 2']] })),

      lesson('web-display', 'display',
        learn('block, inline e companhia', `A property \`display\` define como o elemento ocupa espaço:

- **block**: ocupa a linha inteira (\`div\`, \`p\`, \`h1\`). Aceita width/height.
- **inline**: flui no texto (\`span\`, \`a\`, \`strong\`). Ignora width/height.
- **inline-block**: flui no texto **e** aceita width/height/padding.
- **none**: some (e não ocupa espaço).
- **flex** / **grid**: ativam os sistemas de layout modernos (próximos módulos).

\`visibility: hidden\` esconde mas mantém o espaço; \`display: none\` remove.`),
        quiz('Qual valor de display esconde o elemento sem ocupar espaço?', ['hidden', 'none', 'invisible', 'block'], 1, '`display: none` remove do layout.'),
        code({ title: 'Tags e alerta', task: 'Faça os `.tag` (que são `<span>`) virarem `inline-block` com `padding: 4px 8px`, e esconda o `.alert` com `display: none`.',
          starter: '<style>\n  /* your CSS */\n</style>\n\n<p>Skills: <span class="tag">HTML</span> <span class="tag">CSS</span></p>\n<div class="alert">This should not be visible.</div>\n',
          solution: '<style>\n  .tag { display: inline-block; padding: 4px 8px; background: #eee; }\n  .alert { display: none; }\n</style>\n\n<p>Skills: <span class="tag">HTML</span> <span class="tag">CSS</span></p>\n<div class="alert">This should not be visible.</div>',
          hint: '`.tag { display: inline-block; padding: 4px 8px; }` e `.alert { display: none; }`',
          tests: [['.tag inline-block', 'css($(".tag"), "display") === "inline-block"'], ['.tag com padding', 'css($(".tag"), "padding-top") === "4px" && css($(".tag"), "padding-left") === "8px"'], ['.alert escondido', 'css($(".alert"), "display") === "none"']] })),

      lesson('web-position', 'position',
        learn('Tirando elementos do fluxo', `- **static**: padrão, segue o fluxo.
- **relative**: segue o fluxo, mas pode ser deslocado com top/left. Também vira referência pros filhos absolute.
- **absolute**: sai do fluxo e se posiciona em relação ao ancestral posicionado mais próximo.
- **fixed**: preso na tela (menus, botões flutuantes).
- **sticky**: normal até chegar num limite de scroll, depois gruda (headers de tabela, navbars).

~~~
.card { position: relative; }
.badge { position: absolute; top: 8px; right: 8px; }
header { position: sticky; top: 0; }
~~~

\`z-index\` controla quem fica por cima (só em elementos posicionados).`),
        quiz('Um `position: absolute` se posiciona em relação a quê?', ['À tela sempre', 'Ao ancestral posicionado mais próximo (não-static)', 'Ao elemento anterior', 'Ao body sempre'], 1, 'Por isso se coloca `position: relative` no pai.'),
        code({ title: 'Selo de "novo"', task: 'Coloque a `.badge` no canto superior direito da `.card`: a card com `position: relative` e a badge `position: absolute` com `top: 8px` e `right: 8px`. Depois faça o `header` ficar `sticky` com `top: 0`.',
          starter: '<style>\n  .card { border: 1px solid #ccc; padding: 24px; width: 260px; }\n  .badge { background: #ff2a6d; color: white; padding: 2px 8px; }\n  /* your CSS */\n</style>\n\n<header>Job board</header>\n<div class="card">\n  <span class="badge">NEW</span>\n  <h3>Backend Developer</h3>\n</div>\n',
          solution: '<style>\n  .card { border: 1px solid #ccc; padding: 24px; width: 260px; position: relative; }\n  .badge { background: #ff2a6d; color: white; padding: 2px 8px; position: absolute; top: 8px; right: 8px; }\n  header { position: sticky; top: 0; }\n</style>\n\n<header>Job board</header>\n<div class="card">\n  <span class="badge">NEW</span>\n  <h3>Backend Developer</h3>\n</div>',
          hint: 'Pai `relative`, filho `absolute` com `top` e `right`.',
          tests: [['card relative', 'css($(".card"), "position") === "relative"'], ['badge absolute', 'css($(".badge"), "position") === "absolute"'],
            ['badge no canto superior direito', '(() => { const c = $(".card").getBoundingClientRect(), b = $(".badge").getBoundingClientRect(); return Math.abs(b.top - c.top - 9) < 2 && Math.abs(c.right - b.right - 9) < 2; })()'], ['header sticky', 'css($("header"), "position") === "sticky" && css($("header"), "top") === "0px"']] }))
    ),

    unit('Flexbox',
      lesson('web-flex', 'Flexbox básico',
        learn('Alinhando lado a lado', `Flexbox alinha elementos numa linha (ou coluna):

~~~
.row {
  display: flex;
  gap: 12px;                        /* espaço entre itens */
  justify-content: space-between;   /* eixo principal (horizontal) */
  align-items: center;              /* eixo cruzado (vertical) */
}
~~~

O \`display: flex\` vai no **container** (pai) e afeta os filhos diretos.

- \`justify-content\`: \`flex-start\`, \`center\`, \`flex-end\`, \`space-between\`, \`space-around\`
- \`align-items\`: \`stretch\` (padrão), \`center\`, \`flex-start\`, \`flex-end\``),
        quiz('Onde se coloca `display: flex`?', ['Em cada filho', 'No container (pai)', 'Só no body', 'Tanto faz'], 1, 'Os filhos diretos viram flex items.'),
        code({ title: 'Navbar', task: 'Transforme a `.nav` numa linha: `display: flex`, `justify-content: space-between`, `align-items: center` e `gap: 12px`.',
          starter: '<style>\n  .nav {\n    padding: 12px;\n    background: #eef;\n    /* your CSS */\n  }\n</style>\n\n<nav class="nav">\n  <strong>DevJobs</strong>\n  <a href="#">Jobs</a>\n  <a href="#">Login</a>\n</nav>\n',
          solution: '<style>\n  .nav {\n    padding: 12px;\n    background: #eef;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 12px;\n  }\n</style>\n\n<nav class="nav">\n  <strong>DevJobs</strong>\n  <a href="#">Jobs</a>\n  <a href="#">Login</a>\n</nav>',
          hint: 'Quatro properties a mais em `.nav`.',
          tests: [['display flex', 'css($(".nav"), "display") === "flex"'], ['space-between', 'css($(".nav"), "justify-content") === "space-between"'], ['align-items center', 'css($(".nav"), "align-items") === "center"'], ['gap 12px', 'css($(".nav"), "column-gap") === "12px"']] })),

      lesson('web-flex-wrap', 'wrap, direction e grow',
        learn('Flex de verdade', `~~~
.list {
  display: flex;
  flex-wrap: wrap;           /* quebra linha quando não cabe */
  flex-direction: column;    /* vira coluna (row é o padrão) */
}
.item { flex: 1; }           /* cresce pra ocupar o espaço livre */
.sidebar { flex: 0 0 240px; }/* não cresce, não encolhe, 240px */
~~~

\`flex: 1\` é atalho de \`flex-grow: 1; flex-shrink: 1; flex-basis: 0\`. Itens com \`flex: 2\` crescem o dobro dos com \`flex: 1\`.

Um layout clássico: sidebar fixa + conteúdo que ocupa o resto.`),
        quiz('Num container flex, o item com `flex: 2` e o outro com `flex: 1` dividem o espaço livre como?', ['50/50', '2/3 e 1/3', 'O primeiro fica com tudo', 'Depende do conteúdo apenas'], 1, 'Proporção 2:1 do espaço disponível.'),
        code({ title: 'Sidebar + conteúdo', task: 'Faça o `.layout` ser flex. A `.sidebar` fica com largura fixa de `200px` (`flex: 0 0 200px`) e o `.content` ocupa todo o resto (`flex: 1`).',
          starter: '<style>\n  .layout { gap: 16px; }\n  .sidebar { background: #eef; padding: 8px; }\n  .content { background: #fee; padding: 8px; }\n  /* your CSS */\n</style>\n\n<div class="layout">\n  <aside class="sidebar">Menu</aside>\n  <main class="content">Main content</main>\n</div>\n',
          solution: '<style>\n  .layout { gap: 16px; display: flex; }\n  .sidebar { background: #eef; padding: 8px; flex: 0 0 200px; }\n  .content { background: #fee; padding: 8px; flex: 1; }\n</style>\n\n<div class="layout">\n  <aside class="sidebar">Menu</aside>\n  <main class="content">Main content</main>\n</div>',
          hint: '`.layout { display: flex }`, `.sidebar { flex: 0 0 200px }`, `.content { flex: 1 }`.',
          tests: [['layout flex', 'css($(".layout"), "display") === "flex"'], ['sidebar fixa em 200px', 'css($(".sidebar"), "flex-basis") === "200px" && css($(".sidebar"), "flex-grow") === "0" && css($(".sidebar"), "flex-shrink") === "0"'], ['content ocupa o resto', 'Math.abs($(".content").getBoundingClientRect().right - $(".layout").getBoundingClientRect().right) < 1 && $(".content").getBoundingClientRect().width > 200']] })),

      lesson('web-center', 'Centralizando qualquer coisa',
        learn('A pergunta mais famosa do CSS', `Centralizar na horizontal **e** na vertical:

~~~
.screen {
  min-height: 100vh;
  display: flex;
  justify-content: center;   /* horizontal */
  align-items: center;       /* vertical */
}
~~~

Com Grid é ainda mais curto:

~~~
.screen { display: grid; place-items: center; }
~~~

Texto dentro de um bloco: \`text-align: center\`. Bloco com largura definida: \`margin: 0 auto\`.`),
        quiz('Num flex container em row, qual property centraliza na vertical?', ['justify-content', 'align-items', 'text-align', 'vertical-align'], 1, 'Em row, o eixo cruzado é o vertical: `align-items`.'),
        code({ title: 'Modal centralizado', task: 'Faça o `.overlay` (que já ocupa a tela toda) centralizar o `.modal` na horizontal e na vertical.',
          starter: '<style>\n  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); }\n  .modal { background: white; padding: 24px; width: 220px; }\n  /* your CSS */\n</style>\n\n<div class="overlay">\n  <div class="modal">Are you sure?</div>\n</div>\n',
          solution: '<style>\n  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; justify-content: center; align-items: center; }\n  .modal { background: white; padding: 24px; width: 220px; }\n</style>\n\n<div class="overlay">\n  <div class="modal">Are you sure?</div>\n</div>',
          hint: 'No `.overlay`: `display: flex; justify-content: center; align-items: center;` (ou grid + place-items).',
          tests: [['Centralizado nos dois eixos', '(() => { const o = $(".overlay").getBoundingClientRect(), m = $(".modal").getBoundingClientRect(); return Math.abs((m.left + m.width / 2) - (o.left + o.width / 2)) < 2 && Math.abs((m.top + m.height / 2) - (o.top + o.height / 2)) < 2; })()']] }))
    ),

    unit('Grid',
      lesson('web-grid', 'Grid básico',
        learn('Layout em duas dimensões', `CSS Grid organiza em linhas **e** colunas:

~~~
.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;   /* 3 colunas iguais */
  gap: 16px;
}
~~~

- \`fr\`: fração do espaço livre.
- \`repeat(3, 1fr)\` = \`1fr 1fr 1fr\`.
- \`grid-template-columns: 240px 1fr\`: sidebar fixa + resto.
- Um item pode ocupar várias colunas: \`grid-column: span 2\`.

Flexbox: uma dimensão (linha **ou** coluna). Grid: duas dimensões. Os dois se complementam.`),
        quiz('O que `repeat(4, 1fr)` cria?', ['4 linhas', '4 colunas iguais', 'Uma coluna de 4fr', '4 grids'], 1, 'Quatro trilhas de 1fr cada.'),
        code({ title: 'Galeria', task: 'Faça a `.gallery` ser um grid com **3 colunas iguais** e `gap: 16px`. O primeiro item (`.featured`) deve ocupar **2 colunas**.',
          starter: '<style>\n  .gallery div { background: #dde; padding: 24px; }\n  /* your CSS */\n</style>\n\n<div class="gallery">\n  <div class="featured">1</div><div>2</div><div>3</div><div>4</div><div>5</div>\n</div>\n',
          solution: '<style>\n  .gallery div { background: #dde; padding: 24px; }\n  .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }\n  .featured { grid-column: span 2; }\n</style>\n\n<div class="gallery">\n  <div class="featured">1</div><div>2</div><div>3</div><div>4</div><div>5</div>\n</div>',
          hint: '`grid-template-columns: repeat(3, 1fr)` e `.featured { grid-column: span 2; }`.',
          tests: [['display grid', 'css($(".gallery"), "display") === "grid"'], ['3 colunas iguais', '(() => { const cols = css($(".gallery"), "grid-template-columns").split(" "); return cols.length === 3 && cols.every(c => Math.abs(parseFloat(c) - parseFloat(cols[0])) < 1); })()'],
            ['gap 16px', 'css($(".gallery"), "column-gap") === "16px"'], ['.featured ocupa 2 colunas', '(() => { const f = $(".featured").getBoundingClientRect().width, o = $$(".gallery div")[1].getBoundingClientRect().width; return Math.abs(f - (o * 2 + 16)) < 2; })()']] })),

      lesson('web-grid-areas', 'grid-template-areas',
        learn('Desenhando o layout', `Dá pra "desenhar" o layout com nomes:

~~~
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 12px;
}
header { grid-area: header; }
aside  { grid-area: sidebar; }
main   { grid-area: main; }
footer { grid-area: footer; }
~~~

Cada string é uma linha; cada nome, uma célula. Repetir um nome faz a área ocupar várias células. Fica muito fácil de ler e de mudar no responsivo.`),
        quiz('Em `"header header"`, o que acontece com a área header?', ['Dá erro', 'Ocupa as duas colunas', 'Aparece duas vezes', 'Ocupa uma coluna'], 1, 'O mesmo nome em células vizinhas forma uma área só.'),
        code({ title: 'Layout de página', task: 'Monte o grid da `.page` com 2 colunas (`200px 1fr`) e as áreas: header em cima (2 colunas), sidebar + main no meio, footer embaixo (2 colunas). Atribua `grid-area` a cada parte.',
          starter: '<style>\n  .page > * { background: #eef; padding: 12px; }\n  /* your CSS */\n</style>\n\n<div class="page">\n  <header>Header</header>\n  <aside>Sidebar</aside>\n  <main>Main</main>\n  <footer>Footer</footer>\n</div>\n',
          solution: '<style>\n  .page > * { background: #eef; padding: 12px; }\n  .page {\n    display: grid;\n    grid-template-columns: 200px 1fr;\n    grid-template-areas:\n      "header header"\n      "sidebar main"\n      "footer footer";\n    gap: 12px;\n  }\n  header { grid-area: header; }\n  aside { grid-area: sidebar; }\n  main { grid-area: main; }\n  footer { grid-area: footer; }\n</style>\n\n<div class="page">\n  <header>Header</header>\n  <aside>Sidebar</aside>\n  <main>Main</main>\n  <footer>Footer</footer>\n</div>',
          hint: 'Três strings em `grid-template-areas` e `grid-area` em header, aside, main e footer.',
          tests: [['Sidebar com 200px', 'Math.round($("aside").getBoundingClientRect().width) === 200'], ['Header ocupa a largura toda', 'Math.abs($("header").getBoundingClientRect().width - $(".page").getBoundingClientRect().width) < 1'],
            ['Main ao lado da sidebar', 'Math.abs($("main").getBoundingClientRect().top - $("aside").getBoundingClientRect().top) < 1 && $("main").getBoundingClientRect().left > $("aside").getBoundingClientRect().right'],
            ['Footer embaixo, largura toda', '$("footer").getBoundingClientRect().top > $("main").getBoundingClientRect().bottom && Math.abs($("footer").getBoundingClientRect().width - $(".page").getBoundingClientRect().width) < 1'], ['Usa grid-template-areas', '/grid-template-areas/.test(__src)']] })),

      lesson('web-grid-auto', 'Grid responsivo sem media query',
        learn('auto-fit + minmax', `A linha mais poderosa do CSS moderno:

~~~
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
~~~

- \`minmax(220px, 1fr)\`: cada coluna tem no mínimo 220px e cresce até dividir o espaço.
- \`auto-fit\`: cabem quantas colunas der.

Resultado: em tela larga, 4 colunas; em tablet, 2; no celular, 1. Sem nenhuma media query.`),
        quiz('O que `minmax(220px, 1fr)` garante?', ['Exatamente 220px', 'No mínimo 220px, crescendo até 1fr', 'No máximo 220px', 'Sempre 1fr'], 1, 'Mínimo 220px, máximo uma fração do espaço.'),
        code({ title: 'Cards fluidos', task: 'Faça a `.cards` ter colunas automáticas com `repeat(auto-fit, minmax(200px, 1fr))` e `gap: 16px`.',
          starter: '<style>\n  .card { background: #eef; padding: 16px; }\n  /* your CSS */\n</style>\n\n<div class="cards">\n  <div class="card">Job 1</div><div class="card">Job 2</div><div class="card">Job 3</div>\n  <div class="card">Job 4</div><div class="card">Job 5</div><div class="card">Job 6</div>\n</div>\n',
          solution: '<style>\n  .card { background: #eef; padding: 16px; }\n  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }\n</style>\n\n<div class="cards">\n  <div class="card">Job 1</div><div class="card">Job 2</div><div class="card">Job 3</div>\n  <div class="card">Job 4</div><div class="card">Job 5</div><div class="card">Job 6</div>\n</div>',
          hint: '`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`',
          tests: [['display grid', 'css($(".cards"), "display") === "grid"'], ['Cards com pelo menos 200px', '$$(".card").every(c => c.getBoundingClientRect().width >= 199.5)'],
            ['Várias colunas cabendo na largura', 'css($(".cards"), "grid-template-columns").split(" ").length === Math.max(1, Math.floor(($(".cards").clientWidth + 16) / 216))'], ['Usa auto-fit e minmax', '/auto-fit/.test(__src) && /minmax\\(\\s*200px/.test(__src)']] }))
    ),

    unit('Responsivo',
      lesson('web-media', 'Media queries',
        learn('Um layout pra cada tela', `**Media queries** aplicam CSS só em certas condições:

~~~
.grid { display: grid; grid-template-columns: 1fr; }   /* celular primeiro */

@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; }            /* tablet+ */
}
@media (min-width: 1100px) {
  .grid { grid-template-columns: repeat(4, 1fr); }     /* desktop */
}
~~~

**Mobile first**: escreva o CSS base pro celular e use \`min-width\` pra telas maiores. O CSS fica menor e o celular carrega só o necessário.

Outras: \`(prefers-color-scheme: dark)\`, \`(prefers-reduced-motion: reduce)\`, \`(hover: hover)\`.`),
        quiz('No mobile first, qual condição se usa pra telas maiores?', ['max-width', 'min-width', 'screen-size', 'orientation'], 1, 'Base pro celular; `min-width` adiciona regras a partir de certa largura.'),
        code({ title: 'Mobile first', task: 'A `.grid` já tem 1 coluna. Adicione:\n\n- `@media (min-width: 600px)`: 2 colunas\n- `@media (min-width: 1000px)`: 4 colunas',
          starter: '<style>\n  .grid { display: grid; grid-template-columns: 1fr; gap: 8px; }\n  .grid div { background: #eef; padding: 12px; }\n  /* your media queries */\n</style>\n\n<div class="grid"><div>A</div><div>B</div><div>C</div><div>D</div></div>\n',
          solution: '<style>\n  .grid { display: grid; grid-template-columns: 1fr; gap: 8px; }\n  .grid div { background: #eef; padding: 12px; }\n  @media (min-width: 600px) {\n    .grid { grid-template-columns: 1fr 1fr; }\n  }\n  @media (min-width: 1000px) {\n    .grid { grid-template-columns: repeat(4, 1fr); }\n  }\n</style>\n\n<div class="grid"><div>A</div><div>B</div><div>C</div><div>D</div></div>',
          hint: 'Dois blocos `@media (min-width: ...) { .grid { grid-template-columns: ... } }`.',
          tests: [['Regra pra 600px com 2 colunas', 'rules().some(r => /min-width:\\s*600px/.test(r.media) && r.sel === ".grid" && /grid-template-columns:\\s*(1fr 1fr|repeat\\(2,\\s*1fr\\))/.test(r.text))'],
            ['Regra pra 1000px com 4 colunas', 'rules().some(r => /min-width:\\s*1000px/.test(r.media) && r.sel === ".grid" && /grid-template-columns:\\s*(1fr 1fr 1fr 1fr|repeat\\(4,\\s*1fr\\))/.test(r.text))'],
            ['Colunas certas na largura atual', '(() => { const w = win.innerWidth, n = css($(".grid"), "grid-template-columns").split(" ").length; return n === (w >= 1000 ? 4 : w >= 600 ? 2 : 1); })()']] })),

      lesson('web-fluid', 'Unidades fluidas e imagens',
        learn('Sem barra de rolagem lateral', `Truques que evitam layout quebrado:

~~~
img, video { max-width: 100%; height: auto; }   /* mídia nunca estoura */

.container {
  width: min(100% - 32px, 1100px);   /* no máximo 1100px, com margem */
  margin-inline: auto;
}

h1 { font-size: clamp(1.8rem, 5vw, 3.5rem); }   /* mínimo, ideal, máximo */
~~~

- \`min()\`, \`max()\` e \`clamp()\` combinam unidades.
- \`vw\` = 1% da largura da tela.

\`clamp\` faz o título crescer com a tela sem ficar gigante nem minúsculo.`),
        quiz('O que `clamp(1rem, 4vw, 2rem)` faz?', ['Sempre 4vw', '4vw, mas nunca menos que 1rem nem mais que 2rem', 'Escolhe aleatório', 'Média dos três'], 1, 'Valor ideal no meio, limitado pelas pontas.'),
        code({ title: 'Container fluido', task: 'Faça:\n\n- `img` com `max-width: 100%`\n- `.container` com `max-width: 800px` e centralizado (`margin: 0 auto`)\n- `h1` com `font-size: clamp(1.5rem, 5vw, 3rem)`',
          starter: '<style>\n  /* your CSS */\n</style>\n\n<div class="container">\n  <h1>Fluid layouts</h1>\n  <img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%222000%22 height=%22200%22%3E%3Crect width=%222000%22 height=%22200%22 fill=%22%23ccd%22/%3E%3C/svg%3E" alt="Wide banner">\n</div>\n',
          solution: '<style>\n  img { max-width: 100%; }\n  .container { max-width: 800px; margin: 0 auto; }\n  h1 { font-size: clamp(1.5rem, 5vw, 3rem); }\n</style>\n\n<div class="container">\n  <h1>Fluid layouts</h1>\n  <img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%222000%22 height=%22200%22%3E%3Crect width=%222000%22 height=%22200%22 fill=%22%23ccd%22/%3E%3C/svg%3E" alt="Wide banner">\n</div>',
          hint: '`img { max-width: 100%; }`, `.container { max-width: 800px; margin: 0 auto; }` e o `clamp` no h1.',
          tests: [['Imagem não estoura o container', '$("img").getBoundingClientRect().width <= $(".container").getBoundingClientRect().width + 0.5'], ['Container com no máximo 800px', '$(".container").getBoundingClientRect().width <= 800.5'],
            ['Container centralizado', '(() => { const c = $(".container").getBoundingClientRect(), b = doc.body.getBoundingClientRect(); return Math.abs((c.left - b.left) - (b.right - c.right)) < 2; })()'], ['h1 usa clamp', '/font-size:\\s*clamp\\(/.test(__src)']] }))
    ),

    unit('CSS moderno',
      lesson('web-variables', 'CSS variables',
        learn('Design tokens no CSS', `**Custom properties** (CSS variables) guardam valores reutilizáveis:

~~~
:root {
  --brand: #f7e600;
  --bg: #06070b;
  --radius: 8px;
}
.button {
  background: var(--brand);
  border-radius: var(--radius);
}
.danger { --brand: #ff2a6d; }   /* sobrescreve só aqui dentro */
~~~

São herdadas e podem mudar em tempo real (com JavaScript ou media queries). É assim que se faz tema claro/escuro.`),
        quiz('Como se lê a variável `--gap`?', ['$gap', '--gap', 'var(--gap)', 'get(--gap)'], 2, 'Com a função `var()`.'),
        code({ title: 'Tema com variáveis', task: 'No `:root`, crie `--brand: #f7e600` e `--text: #06070b`. Use `var(--brand)` como `background` do `.btn` e `var(--text)` como `color`. Depois faça o `.btn.danger` redefinir `--brand` como `#ff2a6d`.',
          starter: '<style>\n  /* your CSS */\n  .btn { padding: 10px 16px; border: 0; }\n</style>\n\n<button class="btn">Save</button>\n<button class="btn danger">Delete</button>\n',
          solution: '<style>\n  :root { --brand: #f7e600; --text: #06070b; }\n  .btn { padding: 10px 16px; border: 0; background: var(--brand); color: var(--text); }\n  .btn.danger { --brand: #ff2a6d; }\n</style>\n\n<button class="btn">Save</button>\n<button class="btn danger">Delete</button>',
          hint: 'Variáveis no `:root`; no `.btn`, `background: var(--brand)`; no `.btn.danger`, só redefina `--brand`.',
          tests: [['--brand definido no :root', 'css(doc.documentElement, "--brand").toLowerCase() === "#f7e600"'], ['Save amarelo', 'css($$(".btn")[0], "background-color") === "rgb(247, 230, 0)"'],
            ['Delete vermelho via variável', 'css($(".danger"), "background-color") === "rgb(255, 42, 109)"'], ['Texto escuro', 'css($(".btn"), "color") === "rgb(6, 7, 11)"'], ['Usa var(--brand)', '/var\\(\\s*--brand\\s*\\)/.test(__src)']] })),

      lesson('web-pseudo', 'Pseudo-classes e pseudo-elements',
        learn('Estados e enfeites', `**Pseudo-classes** selecionam estados:

~~~
a:hover { color: var(--brand); }
button:focus-visible { outline: 2px solid cyan; }
li:first-child { font-weight: bold; }
li:nth-child(odd) { background: #f5f5f5; }   /* zebrado */
input:invalid { border-color: red; }
~~~

**Pseudo-elements** criam partes "virtuais" do elemento:

~~~
.required::after { content: " *"; color: red; }
p::first-line { font-weight: 600; }
~~~

\`::before\`/\`::after\` precisam de \`content\` (nem que seja \`""\`).`),
        quiz('Qual seletor pega as rows pares de uma lista?', ['li:even', 'li:nth-child(even)', 'li::even', 'li:2n'], 1, '`:nth-child(even)` ou `:nth-child(2n)`.'),
        code({ title: 'Lista interativa', task: 'Estilize:\n\n- `li:nth-child(even)` com `background-color: #eeeeee`\n- `li:hover` com `color: crimson`\n- `.required::after` com `content: " *"` (espaço + asterisco)',
          starter: '<style>\n  /* your CSS */\n</style>\n\n<ul>\n  <li>Keyboard</li><li>Mouse</li><li>Monitor</li><li>Headset</li>\n</ul>\n<label class="required">Email</label>\n',
          solution: '<style>\n  li:nth-child(even) { background-color: #eeeeee; }\n  li:hover { color: crimson; }\n  .required::after { content: " *"; color: crimson; }\n</style>\n\n<ul>\n  <li>Keyboard</li><li>Mouse</li><li>Monitor</li><li>Headset</li>\n</ul>\n<label class="required">Email</label>',
          hint: 'Três regras: `li:nth-child(even)`, `li:hover` e `.required::after`.',
          tests: [['Pares com fundo cinza', 'css($$("li")[1], "background-color") === "rgb(238, 238, 238)" && css($$("li")[3], "background-color") === "rgb(238, 238, 238)"'], ['Ímpares sem fundo', 'css($$("li")[0], "background-color") === "rgba(0, 0, 0, 0)"'],
            ['Regra de hover', 'rules().some(r => /li:hover/.test(r.sel) && /color:\\s*crimson/.test(r.text))'], ['Asterisco depois do label', 'win.getComputedStyle($(".required"), "::after").getPropertyValue("content") === \'" *"\'']] })),

      lesson('web-animations', 'Transições e animações',
        learn('Movimento com propósito', `**Transition** anima a mudança entre dois estados:

~~~
.btn {
  background: #222;
  transition: background-color 0.3s ease, transform 0.2s;
}
.btn:hover { background: #ff2a6d; transform: translateY(-2px); }
~~~

**Animation** usa \`@keyframes\` pra sequências próprias:

~~~
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
.live { animation: pulse 1.5s ease-in-out infinite; }
~~~

Anime \`transform\` e \`opacity\`, que são baratos pro browser. E respeite quem não quer movimento: \`@media (prefers-reduced-motion: reduce)\`.`),
        quiz('Quais properties são as mais leves de animar?', ['width e height', 'top e left', 'transform e opacity', 'margin e padding'], 2, 'Elas não forçam recalcular o layout.'),
        code({ title: 'Botão e indicador ao vivo', task: 'Faça:\n\n- `.btn` com `transition` de `0.3s` (duração)\n- `.btn:hover` com `transform: translateY(-2px)`\n- `@keyframes blink` mudando `opacity`, e `.live` com `animation: blink 1s infinite`',
          starter: '<style>\n  .btn { background: #222; color: white; padding: 10px 16px; border: 0; }\n  .live { display: inline-block; width: 12px; height: 12px; background: red; border-radius: 50%; }\n  /* your CSS */\n</style>\n\n<button class="btn">Apply now</button>\n<span class="live"></span> LIVE\n',
          solution: '<style>\n  .btn { background: #222; color: white; padding: 10px 16px; border: 0; transition: transform 0.3s ease; }\n  .live { display: inline-block; width: 12px; height: 12px; background: red; border-radius: 50%; }\n  .btn:hover { transform: translateY(-2px); }\n  @keyframes blink {\n    0%, 100% { opacity: 1; }\n    50% { opacity: 0.2; }\n  }\n  .live { animation: blink 1s infinite; }\n</style>\n\n<button class="btn">Apply now</button>\n<span class="live"></span> LIVE',
          hint: '`transition: transform 0.3s`, `.btn:hover { transform: translateY(-2px); }`, e `@keyframes blink { ... }`.',
          tests: [['Transição de 0.3s', 'css($(".btn"), "transition-duration").split(",")[0].trim() === "0.3s"'], ['Hover com translateY(-2px)', 'rules().some(r => /\\.btn:hover/.test(r.sel) && /translateY\\(-2px\\)/.test(r.text))'],
            ['.live anima com blink', 'css($(".live"), "animation-name") === "blink" && css($(".live"), "animation-iteration-count") === "infinite"'], ['Define @keyframes blink', '/@keyframes\\s+blink/.test(__src)']] })),

      lesson('web-final', 'Projeto final: card de perfil',
        learn('Juntando tudo', `Hora de construir um componente completo: um card de perfil de dev, como os de portfólio.

Use o que aprendeu:

- HTML semântico (\`article\`, \`h2\`, \`ul\`)
- CSS variables pro tema
- Flexbox pro alinhamento
- \`border-radius\`, padding e uma transição no hover
- uma lista de skills em linha

Capriche: esse é o tipo de peça que vai pro seu portfólio.`),
        code({ title: 'Card de perfil', task: 'Crie um `<article class="profile">` com:\n\n- um `<h2>` com seu nome e um `<p class="role">`\n- uma `<ul class="skills">` com pelo menos 3 `<li>` em **linha** (flex) com `gap`\n- um link `<a class="cta">`\n\nNo CSS: defina `--accent` no `.profile` e use em algo com `var(--accent)`; dê `border-radius` e `padding` ao card; e coloque `transition` no card com um `:hover`.',
          starter: '<style>\n  /* your CSS */\n</style>\n\n<!-- your HTML -->\n',
          solution: '<style>\n  .profile {\n    --accent: #f7e600;\n    max-width: 360px;\n    padding: 24px;\n    border-radius: 12px;\n    background: #0d1017;\n    color: #eaf0fa;\n    border: 1px solid #242c3e;\n    transition: transform 0.2s;\n  }\n  .profile:hover { transform: translateY(-4px); }\n  .role { color: var(--accent); }\n  .skills { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; }\n  .skills li { border: 1px solid var(--accent); padding: 2px 8px; }\n  .cta { display: inline-block; background: var(--accent); color: #000; padding: 8px 14px; text-decoration: none; }\n</style>\n\n<article class="profile">\n  <h2>Rick</h2>\n  <p class="role">Frontend Developer</p>\n  <ul class="skills">\n    <li>JavaScript</li>\n    <li>TypeScript</li>\n    <li>SQL</li>\n    <li>CSS</li>\n  </ul>\n  <a class="cta" href="#">Hire me</a>\n</article>',
          hint: 'Comece pelo HTML, depois `.profile` (variável, radius, padding, transition), `.skills` com flex e o `:hover`.',
          tests: [['article.profile com h2 e .role', '!!$("article.profile h2") && !!$("article.profile .role")'], ['3+ skills em linha', '$$(".skills li").length >= 3 && css($(".skills"), "display") === "flex" && Math.abs($$(".skills li")[0].getBoundingClientRect().top - $$(".skills li")[1].getBoundingClientRect().top) < 2'],
            ['skills com gap', 'parseFloat(css($(".skills"), "column-gap")) > 0'], ['Link .cta', '!!$("a.cta")'], ['--accent no .profile e usado com var()', 'css($(".profile"), "--accent") !== "" && /var\\(\\s*--accent\\s*\\)/.test(__src)'],
            ['Card com radius e padding', 'parseFloat(css($(".profile"), "border-top-left-radius")) > 0 && parseFloat(css($(".profile"), "padding-top")) > 0'], ['Transição + hover', 'parseFloat(css($(".profile"), "transition-duration")) > 0 && rules().some(r => /\\.profile:hover/.test(r.sel))']] }))
    )
  );
})(globalThis.TD = globalThis.TD || {});
