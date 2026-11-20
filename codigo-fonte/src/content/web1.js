/* HTML & CSS — módulos 1 a 4: HTML, semântica e acessibilidade, formulários, CSS base */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'web', name: 'HTML & CSS', badge: '</>', runner: 'web',
    tagline: 'A cara da web',
    desc: 'Estrutura semântica, formulários, acessibilidade, Flexbox, Grid, responsivo, variáveis e animações. Resultado visual na hora.',
    notes: 'Escreva HTML no editor; CSS vai dentro de uma tag `<style>`. O preview atualiza quando você roda. Os testes leem a página renderizada de verdade (estilos computados), então o que vale é o resultado.',
    units: [
      unit('HTML',
        lesson('web-tags', 'Tags e estrutura',
          learn('Marcando o conteúdo', `HTML descreve **o que** é cada parte da página usando **tags**:

~~~
<h1>Main title</h1>
<p>A paragraph with <strong>important</strong> and <em>emphasized</em> text.</p>
~~~

- A maioria das tags abre \`<p>\` e fecha \`</p>\`.
- \`<h1>\` até \`<h6>\`: headings, do mais ao menos importante.
- \`<p>\` parágrafo, \`<strong>\` importante, \`<em>\` ênfase, \`<br>\` quebra de linha.

Use cada tag pelo **significado**, não pela aparência. Visual é trabalho do CSS.`),
          quiz('Qual tag representa o título principal do conteúdo?', ['<title>', '<head>', '<h1>', '<header>'], 2, '`<h1>` é o heading principal. `<title>` é o nome na aba do browser.'),
          predict('Como o browser mostra isso?', '<h1>Jobs</h1>\n<p>Find a <strong>remote</strong> job.</p>', ['Tudo do mesmo tamanho, numa linha', 'Um título grande e, embaixo, um parágrafo com "remote" em negrito', 'Só o título aparece', 'As tags aparecem como texto'], 1, 'Cada tag tem um significado e um visual padrão: h1 é título grande, p é parágrafo, strong destaca.'),
          code({ title: 'Minha primeira página', task: 'Crie um `<h1>` com o texto `My first page` e, abaixo, um `<p>` que contenha um trecho em `<strong>`.',
            starter: '<!-- write your HTML -->\n', solution: '<h1>My first page</h1>\n<p>I am learning <strong>HTML</strong> today.</p>', hint: 'Coloque o `<strong>` dentro do `<p>`.',
            tests: [['`<h1>` com "My first page"', '$("h1") && $("h1").textContent.trim() === "My first page"'], ['`<p>` com um `<strong>` dentro', '!!$("p strong")']] })),

        lesson('web-links', 'Links e imagens',
          learn('Attributes', `Tags podem ter **attributes**, com informação extra:

~~~
<a href="https://developer.mozilla.org" target="_blank" rel="noopener">MDN Docs</a>
<a href="#contact">Go to contact</a>
<img src="photo.jpg" alt="A cat sleeping on a sofa" width="300">
~~~

- \`<a>\` cria um link; o destino vai no \`href\`. \`target="_blank"\` abre em nova aba.
- \`<img>\` não fecha (não existe \`</img>\`).
- \`alt\` descreve a imagem pra leitores de tela e aparece se ela não carregar. **Sempre** preencha.`),
          quiz('Qual attribute define o destino de um link?', ['src', 'link', 'href', 'to'], 2, '`href`. `src` é usado em `<img>` e `<script>`.'),
          code({ title: 'Link e imagem', task: 'Crie um link pra `https://developer.mozilla.org` com o texto `MDN Docs`, que abra em nova aba (`target="_blank"`). Depois uma `<img>` com `src="logo.png"` e um `alt` descritivo.',
            starter: '<!-- write your HTML -->\n', solution: '<a href="https://developer.mozilla.org" target="_blank" rel="noopener">MDN Docs</a>\n<img src="logo.png" alt="MDN logo">', hint: 'Attributes vão na tag de abertura: `<a href="..." target="_blank">`.',
            tests: [['Link pro MDN', '$("a") && $("a").getAttribute("href") === "https://developer.mozilla.org"'], ['Texto "MDN Docs"', '$("a") && $("a").textContent.trim() === "MDN Docs"'],
              ['Abre em nova aba', '$("a") && $("a").getAttribute("target") === "_blank"'], ['`<img>` com src logo.png', '$("img") && $("img").getAttribute("src") === "logo.png"'], ['`alt` preenchido', '$("img") && ($("img").getAttribute("alt") || "").trim().length > 0']] })),

        lesson('web-lists', 'Listas',
          learn('ul, ol e li', `~~~
<ul>
  <li>HTML</li>
  <li>CSS</li>
</ul>

<ol>
  <li>Learn</li>
  <li>Build</li>
</ol>
~~~

- \`<ul>\`: lista sem ordem (bolinhas). Usada em menus de navegação.
- \`<ol>\`: lista ordenada (números): passos, rankings.
- \`<li>\`: cada item, sempre dentro de \`ul\` ou \`ol\`. Listas podem ser aninhadas.`),
          quiz('Pra um passo a passo numerado, qual tag?', ['<ul>', '<ol>', '<li>', '<list>'], 1, 'Ordered list: a ordem tem significado.'),
          code({ title: 'Minha stack', task: 'Crie uma `<ul>` com 3 itens: `HTML`, `CSS` e `JavaScript`. Abaixo, uma `<ol>` com 2 passos quaisquer.',
            starter: '<!-- write your HTML -->\n', solution: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>\n<ol>\n  <li>Study</li>\n  <li>Build projects</li>\n</ol>', hint: 'Cada `<li>` dentro da sua lista.',
            tests: [['`<ul>` com HTML, CSS, JavaScript', '$$("ul > li").map(li => li.textContent.trim()).join(",") === "HTML,CSS,JavaScript"'], ['`<ol>` com 2 itens', '$$("ol > li").length === 2']] })),

        lesson('web-document', 'O documento HTML',
          learn('O esqueleto de toda página', `Toda página completa tem esta estrutura:

~~~
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My site</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- conteúdo visível -->
  <script src="app.js"></script>
</body>
</html>
~~~

- \`<head>\`: informações sobre a página (título, CSS, metadados de SEO). Não aparece.
- \`<body>\`: o que aparece.
- \`viewport\`: essencial pro site funcionar bem no celular.
- \`lang\`: ajuda leitores de tela e o Google.

Neste app, o editor já vive dentro de um \`<body>\`, então você escreve só o conteúdo.`),
          quiz('Onde fica a tag `<title>`?', ['No <body>', 'No <head>', 'Antes do <!DOCTYPE>', 'Em qualquer lugar'], 1, 'Metadados ficam no `<head>`.'),
          quiz('Pra que serve `<meta name="viewport" ...>`?', ['Deixa o site mais rápido', 'Faz o layout se ajustar à largura de celulares', 'Define o idioma', 'Carrega o CSS'], 1, 'Sem ele, o celular renderiza como se fosse uma tela de desktop encolhida.'))
      ),

      unit('Semântica e acessibilidade',
        lesson('web-semantic', 'Tags semânticas',
          learn('Dando significado ao layout', `Em vez de \`<div>\` pra tudo, use tags com significado:

~~~
<header>logo e menu</header>
<nav>links de navegação</nav>
<main>
  <article>
    <h2>Post title</h2>
    <p>...</p>
  </article>
  <aside>conteúdo relacionado</aside>
</main>
<footer>contato e copyright</footer>
~~~

Semântica ajuda leitores de tela, SEO e quem mantém o código. \`<div>\` e \`<span>\` continuam úteis quando nada mais se encaixa.`),
          quiz('Qual tag envolve o conteúdo principal e único da página?', ['<section>', '<main>', '<body>', '<article>'], 1, '`<main>` marca o conteúdo principal; deve existir um por página.'),
          code({ title: 'Layout de blog', task: 'Monte a estrutura: um `<header>` com um `<h1>`; um `<nav>` com 2 links; um `<main>` com um `<article>` que tenha `<h2>` e `<p>`; e um `<footer>`.',
            starter: '<!-- write your HTML -->\n', solution: '<header>\n  <h1>Dev Blog</h1>\n</header>\n<nav>\n  <a href="#">Home</a>\n  <a href="#">Posts</a>\n</nav>\n<main>\n  <article>\n    <h2>Learning HTML</h2>\n    <p>Semantic tags matter.</p>\n  </article>\n</main>\n<footer>Made by me</footer>',
            hint: 'Siga a ordem: header, nav, main > article, footer.',
            tests: [['`<header>` com `<h1>`', '!!$("header h1")'], ['`<nav>` com 2 links', '$$("nav a").length >= 2'], ['`<main>` com `<article>`', '!!$("main article")'], ['Article com h2 e p', '!!$("article h2") && !!$("article p")'], ['`<footer>`', '!!$("footer")']] })),

        lesson('web-tables', 'Tabelas',
          learn('Dados tabulares', `Tabelas são pra **dados** (não pra layout):

~~~
<table>
  <caption>Monthly sales</caption>
  <thead>
    <tr><th>Month</th><th>Revenue</th></tr>
  </thead>
  <tbody>
    <tr><td>Jan</td><td>1200</td></tr>
    <tr><td>Feb</td><td>1550</td></tr>
  </tbody>
</table>
~~~

- \`<tr>\` row, \`<th>\` célula de cabeçalho, \`<td>\` célula de dados.
- \`<thead>\`/\`<tbody>\` separam cabeçalho e corpo.
- \`<caption>\` dá título acessível à tabela.`),
          quiz('Qual tag é uma célula de cabeçalho?', ['<td>', '<th>', '<tr>', '<thead>'], 1, '`th` = table header cell.'),
          code({ title: 'Tabela de preços', task: 'Crie uma tabela com `<caption>` "Plans", cabeçalho (`<thead>`) com `Plan` e `Price`, e 3 rows no `<tbody>`.',
            starter: '<!-- write your HTML -->\n', solution: '<table>\n  <caption>Plans</caption>\n  <thead>\n    <tr><th>Plan</th><th>Price</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Basic</td><td>$5</td></tr>\n    <tr><td>Pro</td><td>$15</td></tr>\n    <tr><td>Team</td><td>$40</td></tr>\n  </tbody>\n</table>',
            hint: '`<thead>` com uma `<tr>` de `<th>`, e `<tbody>` com 3 `<tr>` de `<td>`.',
            tests: [['caption "Plans"', '$("table caption") && $("table caption").textContent.trim() === "Plans"'], ['Cabeçalho Plan e Price', '$$("thead th").map(t => t.textContent.trim()).join() === "Plan,Price"'], ['3 rows no tbody', '$$("tbody tr").length === 3'], ['Cada row com 2 células', '$$("tbody tr").every(tr => tr.querySelectorAll("td").length === 2)']] })),

        lesson('web-a11y', 'Acessibilidade',
          learn('Web pra todo mundo', `Acessibilidade (a11y) é fazer a página funcionar com leitor de tela, teclado e para quem enxerga pouco.

O básico já resolve muito:

- Imagens com \`alt\` (ou \`alt=""\` se forem só decorativas).
- Campos de formulário com \`<label for="id">\`.
- Ações com \`<button>\`, não \`<div onclick>\`: botões já recebem foco e funcionam com Enter.
- Headings em ordem (h1 → h2 → h3), sem pular níveis.
- Botões só com ícone precisam de nome: \`<button aria-label="Close">×</button>\`.
- Contraste suficiente entre texto e fundo.`),
          quiz('Por que usar `<button>` em vez de `<div>` clicável?', ['É mais bonito', 'Já é focável e acionável por teclado e leitores de tela', 'Carrega mais rápido', 'Div não aceita click'], 1, 'Botão nativo vem com foco, teclado e semântica.'),
          code({ title: 'Conserte a acessibilidade', task: 'Corrija o HTML:\n\n- dê um `alt` à imagem\n- ligue o texto "Email" ao input com `<label for>` (o input tem `id="email"`)\n- troque a `div` clicável por um `<button>`\n- dê `aria-label="Close"` ao botão de fechar (×)',
            starter: '<img src="avatar.png">\n\nEmail\n<input id="email" type="email">\n\n<div class="btn">Subscribe</div>\n<button>×</button>\n',
            solution: '<img src="avatar.png" alt="User avatar">\n\n<label for="email">Email</label>\n<input id="email" type="email">\n\n<button class="btn">Subscribe</button>\n<button aria-label="Close">×</button>',
            hint: '`<label for="email">Email</label>` e `<button aria-label="Close">×</button>`.',
            tests: [['Imagem com alt', '($("img").getAttribute("alt") || "").trim().length > 0'], ['Label ligado ao input', '!!$("label[for=email]") && $("label[for=email]").textContent.includes("Email")'],
              ['Subscribe é um button', '$$("button").some(b => b.textContent.trim() === "Subscribe")'], ['Botão × com aria-label', '$$("button").some(b => b.textContent.trim() === "×" && b.getAttribute("aria-label") === "Close")'], ['Sem div clicável', '!$$("div").some(d => d.textContent.trim() === "Subscribe")']] }))
      ),

      unit('Formulários',
        lesson('web-forms', 'Formulários e inputs',
          learn('Coletando dados', `~~~
<form action="/subscribe" method="post">
  <label for="name">Name</label>
  <input id="name" name="name" type="text">

  <label for="email">Email</label>
  <input id="email" name="email" type="email">

  <button type="submit">Send</button>
</form>
~~~

- \`name\`: é a chave do dado quando o form é enviado.
- \`type\` muda o teclado no celular e a validação: \`text\`, \`email\`, \`password\`, \`number\`, \`date\`, \`tel\`, \`url\`...
- \`placeholder\` é só uma dica, **não** substitui o label.`),
          quiz('Qual attribute define a chave do campo quando o form é enviado?', ['id', 'name', 'type', 'for'], 1, '`name` vira a chave no envio. `id` é pra ligar com o label e pro CSS/JS.'),
          code({ title: 'Cadastro', task: 'Crie um `<form>` com:\n\n- input de texto `name="username"`\n- input de email `name="email"`\n- input de senha `name="password"`\n- cada um com `<label>` ligado pelo `for`/`id`\n- um `<button type="submit">`',
            starter: '<!-- write your form -->\n', solution: '<form>\n  <label for="username">Username</label>\n  <input id="username" name="username" type="text">\n\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email">\n\n  <label for="password">Password</label>\n  <input id="password" name="password" type="password">\n\n  <button type="submit">Create account</button>\n</form>',
            hint: 'Cada campo: `<label for="x">` + `<input id="x" name="x" type="...">`.',
            tests: [['Campo username texto', '$("form input[name=username]") && $("input[name=username]").type === "text"'], ['Campo email', '$("input[name=email]") && $("input[name=email]").type === "email"'], ['Campo password', '$("input[name=password]") && $("input[name=password]").type === "password"'],
              ['Todos com label', '$$("form input").every(i => i.id && doc.querySelector("label[for=" + i.id + "]"))'], ['Botão submit', '!!$("form button[type=submit]")']] })),

        lesson('web-form-controls', 'select, textarea, checkbox e radio',
          learn('Outros controles', `~~~
<select name="plan">
  <option value="free">Free</option>
  <option value="pro" selected>Pro</option>
</select>

<textarea name="bio" rows="4"></textarea>

<label><input type="checkbox" name="terms"> I accept the terms</label>

<fieldset>
  <legend>Experience</legend>
  <label><input type="radio" name="level" value="junior"> Junior</label>
  <label><input type="radio" name="level" value="senior"> Senior</label>
</fieldset>
~~~

Radios com o **mesmo \`name\`** formam um grupo: só um pode ser marcado. \`<fieldset>\` + \`<legend>\` agrupam campos relacionados.`),
          quiz('O que faz radios virarem um grupo (só um marcado)?', ['Estar no mesmo fieldset', 'Ter o mesmo name', 'Ter o mesmo value', 'Ter o mesmo id'], 1, 'O agrupamento é pelo `name`.'),
          code({ title: 'Candidatura', task: 'Crie um form com:\n\n- `<select name="role">` com 3 `<option>`\n- `<textarea name="message">`\n- 2 radios `name="remote"` com values `yes` e `no`, dentro de um `<fieldset>` com `<legend>`\n- 1 checkbox `name="terms"`',
            starter: '<form>\n  <!-- your fields -->\n</form>\n', solution: '<form>\n  <select name="role">\n    <option value="frontend">Frontend</option>\n    <option value="backend">Backend</option>\n    <option value="data">Data</option>\n  </select>\n  <textarea name="message"></textarea>\n  <fieldset>\n    <legend>Remote?</legend>\n    <label><input type="radio" name="remote" value="yes"> Yes</label>\n    <label><input type="radio" name="remote" value="no"> No</label>\n  </fieldset>\n  <label><input type="checkbox" name="terms"> I accept</label>\n</form>',
            hint: 'Os radios precisam do mesmo `name="remote"` e values diferentes.',
            tests: [['select com 3 options', '$$("select[name=role] option").length === 3'], ['textarea message', '!!$("textarea[name=message]")'], ['2 radios remote (yes/no)', '$$("input[type=radio][name=remote]").map(r => r.value).sort().join() === "no,yes"'],
              ['fieldset com legend', '!!$("fieldset legend")'], ['checkbox terms', '!!$("input[type=checkbox][name=terms]")']] })),

        lesson('web-validation', 'Validação nativa',
          learn('O browser valida pra você', `HTML tem validação embutida, sem JavaScript:

~~~
<input name="email" type="email" required>
<input name="username" minlength="3" maxlength="20" required>
<input name="age" type="number" min="18" max="99">
<input name="zip" pattern="[0-9]{5}-[0-9]{3}" title="Format: 00000-000">
~~~

O form não é enviado enquanto houver campo inválido, e o browser mostra a mensagem. Em JavaScript: \`form.checkValidity()\` e \`input.validity\`.

Importante: validação no front é pra **experiência do usuário**. O servidor sempre precisa validar de novo.`),
          quiz('Validação no HTML dispensa validar no servidor?', ['Sim', 'Não: qualquer um pode burlar o front', 'Só se usar pattern', 'Só em formulários de login'], 1, 'O cliente é controlado pelo usuário; o servidor é a fonte da verdade.'),
          code({ title: 'Regras do cadastro', task: 'Adicione validação:\n\n- `email`: obrigatório e do tipo email\n- `username`: obrigatório, mínimo 3 caracteres\n- `age`: number, mínimo 18',
            starter: '<form id="signup">\n  <input name="email">\n  <input name="username">\n  <input name="age">\n  <button>Join</button>\n</form>\n',
            solution: '<form id="signup">\n  <input name="email" type="email" required>\n  <input name="username" minlength="3" required>\n  <input name="age" type="number" min="18">\n  <button>Join</button>\n</form>',
            hint: '`type="email" required`, `minlength="3" required`, `type="number" min="18"`.',
            tests: [['Vazio é inválido', '!$("#signup").checkValidity()'], ['Email inválido é barrado', '($("[name=email]").value = "abc", !$("[name=email]").checkValidity())'],
              ['Username exige 3+ caracteres', '$("[name=username]").minLength === 3 && $("[name=username]").required'], ['Idade 16 é barrada', '($("[name=age]").value = "16", !$("[name=age]").checkValidity())'],
              ['Dados válidos passam', '($("[name=email]").value = "rick@mail.com", $("[name=username]").value = "rick", $("[name=age]").value = "28", $("#signup").checkValidity())']] }))
      ),

      unit('CSS: fundamentos',
        lesson('web-selectors', 'Seletores e cores',
          learn('Dando estilo', `CSS escolhe elementos com um **selector** e aplica **properties**:

~~~
<style>
  h1 { color: crimson; }
  .highlight { background-color: #fff3a0; }
  #main { padding: 16px; }
  nav a { text-decoration: none; }       /* a dentro de nav */
  button, .btn { cursor: pointer; }      /* vários seletores */
</style>
~~~

- \`h1\`: tag · \`.highlight\`: class · \`#main\`: id
- espaço = descendente; vírgula = lista

Cores: nomes (\`crimson\`), hex (\`#ff2a6d\`), \`rgb(255 42 109)\`, \`hsl(340 100% 58%)\`.`),
          quiz('Qual selector pega todos os elementos com `class="card"`?', ['card', '#card', '.card', '<card>'], 2, 'Ponto pra class, # pra id.'),
          code({ title: 'Título colorido', task: 'Escreva o CSS pra:\n\n- `h1` com `color: crimson`\n- `.note` com `background-color: lightyellow`\n- links dentro de `nav` sem sublinhado (`text-decoration: none`)',
            starter: '<style>\n  /* your CSS here */\n</style>\n\n<nav><a href="#">Home</a></nav>\n<h1>Hello, CSS</h1>\n<p class="note">Selectors pick elements.</p>\n<a href="#">Normal link</a>\n',
            solution: '<style>\n  h1 { color: crimson; }\n  .note { background-color: lightyellow; }\n  nav a { text-decoration: none; }\n</style>\n\n<nav><a href="#">Home</a></nav>\n<h1>Hello, CSS</h1>\n<p class="note">Selectors pick elements.</p>\n<a href="#">Normal link</a>',
            hint: '`nav a { text-decoration: none; }` só afeta links dentro do nav.',
            tests: [['h1 crimson', 'css($("h1"), "color") === "rgb(220, 20, 60)"'], ['.note lightyellow', 'css($(".note"), "background-color") === "rgb(255, 255, 224)"'],
              ['Link do nav sem sublinhado', 'css($("nav a"), "text-decoration-line") === "none"'], ['Outros links continuam sublinhados', 'css($$("a")[1], "text-decoration-line") === "underline"']] })),

        lesson('web-cascade', 'Cascata e especificidade',
          learn('Quem ganha o conflito', `Quando duas regras brigam pela mesma property, o CSS decide por:

1. **Especificidade**: id (\`#x\`) > class/atributo/pseudo-class (\`.x\`, \`:hover\`) > tag (\`p\`).
2. **Ordem**: com a mesma especificidade, a regra que vem **depois** ganha.
3. \`!important\` passa por cima de tudo (evite: vira guerra).

~~~
p { color: gray; }          /* 0-0-1 */
.intro { color: blue; }     /* 0-1-0  ganha */
#lead { color: red; }       /* 1-0-0  ganha de todos */
~~~

**Herança**: algumas properties (cor, fonte) passam do pai pros filhos; outras (margin, border) não.`),
          quiz('`<p class="intro" id="lead">` com as regras acima fica de que cor?', ['gray', 'blue', 'red', 'black'], 2, 'O id tem a maior especificidade.'),
          predict('De que cor fica o texto do `<p class="intro" id="lead">`?', 'p { color: gray; }\n#lead { color: red; }\n.intro { color: blue; }', ['gray', 'blue', 'red', 'preto (padrão)'], 2, 'O id tem a maior especificidade e ganha, mesmo vindo antes da regra da class.'),
          code({ title: 'Ganhe a briga', task: 'O botão `.btn-danger` deveria ser vermelho (`rgb(255, 42, 109)`, ou seja `#ff2a6d`), mas a regra `#app button` está ganhando. Sem usar `!important` e sem mexer na regra `#app button`, faça o `.btn-danger` ficar com `background-color: #ff2a6d`.',
            starter: '<style>\n  #app button { background-color: gray; color: white; }\n  .btn-danger { background-color: #ff2a6d; }\n</style>\n\n<div id="app">\n  <button>Save</button>\n  <button class="btn-danger">Delete</button>\n</div>\n',
            solution: '<style>\n  #app button { background-color: gray; color: white; }\n  #app .btn-danger { background-color: #ff2a6d; }\n</style>\n\n<div id="app">\n  <button>Save</button>\n  <button class="btn-danger">Delete</button>\n</div>',
            hint: 'Aumente a especificidade: `#app .btn-danger` (1 id + 1 class) ganha de `#app button` (1 id + 1 tag).',
            tests: [['Delete vermelho', 'css($(".btn-danger"), "background-color") === "rgb(255, 42, 109)"'], ['Save continua cinza', 'css($$("button")[0], "background-color") === "rgb(128, 128, 128)"']],
            requires: [['Sem !important', '^(?![\\s\\S]*!important)'], ['Mantém a regra #app button', '#app\\s+button\\s*\\{\\s*background-color:\\s*gray']] })),

        lesson('web-typography', 'Unidades e tipografia',
          learn('Texto bonito e escalável', `Unidades:

- \`px\`: fixo
- \`rem\`: relativo ao tamanho da fonte da raiz (normalmente 16px). **Use pra fontes e espaçamentos.**
- \`em\`: relativo à fonte do próprio elemento
- \`%\`, \`vw\`/\`vh\`: relativos ao pai / à tela

~~~
body {
  font-family: "Inter", system-ui, sans-serif;  /* com fallbacks */
  font-size: 1rem;
  line-height: 1.6;          /* sem unidade: proporcional à fonte */
}
h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em; }
.lead { max-width: 65ch; }   /* linhas confortáveis de ler */
~~~`),
          quiz('Com a raiz em 16px, quanto é `2rem`?', ['2px', '16px', '32px', '20px'], 2, '2 × 16px = 32px.'),
          code({ title: 'Tipografia do artigo', task: 'Estilize:\n\n- `body`: `line-height: 1.6` e `font-family` com `sans-serif` como fallback\n- `h1`: `font-size: 2.5rem` e `font-weight: 800`\n- `.lead`: `font-size: 1.25rem` e `max-width: 65ch`',
            starter: '<style>\n  /* your CSS */\n</style>\n\n<h1>Remote work in Europe</h1>\n<p class="lead">How developers from Brazil are landing jobs abroad.</p>\n<p>Body text goes here.</p>\n',
            solution: '<style>\n  body { line-height: 1.6; font-family: system-ui, sans-serif; }\n  h1 { font-size: 2.5rem; font-weight: 800; }\n  .lead { font-size: 1.25rem; max-width: 65ch; }\n</style>\n\n<h1>Remote work in Europe</h1>\n<p class="lead">How developers from Brazil are landing jobs abroad.</p>\n<p>Body text goes here.</p>',
            hint: '2.5rem = 40px e 1.25rem = 20px.',
            tests: [['h1 com 40px (2.5rem)', 'css($("h1"), "font-size") === "40px"'], ['h1 peso 800', 'css($("h1"), "font-weight") === "800"'], ['.lead com 20px', 'css($(".lead"), "font-size") === "20px"'],
              ['.lead com max-width em ch', '/65ch/.test(__src)'], ['body line-height 1.6', 'Math.abs(parseFloat(css(doc.body, "line-height")) / parseFloat(css(doc.body, "font-size")) - 1.6) < 0.01'], ['fallback sans-serif', '/sans-serif/.test(css(doc.body, "font-family"))']] }))
      )
    ]
  });
})(globalThis.TD = globalThis.TD || {});
