/* JavaScript — módulos 1 a 4: fundamentos, decisões, functions, arrays */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'js', name: 'JavaScript', badge: 'JS', runner: 'js',
    tagline: 'A linguagem da web',
    desc: 'Do primeiro console.log até async/await, DOM, classes e algoritmos. Roda no browser, no servidor (Node.js) e em apps.',
    notes: 'O código roda num ambiente isolado. Use `console.log` à vontade: a saída aparece no painel Console. Nos módulos de DOM, o preview mostra a página que seu código controla.',
    units: [
      unit('Fundamentos',
        lesson('js-hello', 'Hello, console',
          learn('Seu primeiro comando', `Todo programa precisa mostrar alguma coisa. Em JavaScript, o jeito mais simples é o \`console.log()\`:

~~~
console.log("Hello, world!");
~~~

Ele imprime o que estiver dentro dos parênteses no **console**, a área de saída embaixo do editor.

O \`;\` no final é opcional, mas é bom costume. Uma linha que começa com \`//\` é um **comentário**: o computador ignora, serve pra humanos.`),
          predict('O que aparece no console?', 'console.log("Oi");\nconsole.log("Tudo bem?");', ['Oi Tudo bem? (na mesma linha)', 'Oi, e embaixo: Tudo bem?', 'Só: Tudo bem?', 'Nada, falta um comando'], 1,
            'Cada `console.log` imprime uma linha nova, na ordem em que aparece no código.'),
          code({ title: 'Diga olá', task: 'Mostre exatamente `Hello, world!` no console.',
            starter: '// show the text Hello, world! in the console\n', solution: 'console.log("Hello, world!");',
            hint: 'O texto vai entre aspas dentro dos parênteses: `console.log("...")`.',
            tests: [['Mostra "Hello, world!" no console', '__logs.includes("Hello, world!")']] }),
          learn('Texto e números', `Texto entre aspas é uma **string**: \`"Rick"\`, \`'Berlin'\`. Número vai **sem** aspas: \`42\`, \`3.5\`.

A diferença importa:

~~~
console.log(2 + 3);      // 5   (soma)
console.log("2" + "3");  // 23  (junta os textos)
~~~

Com números, \`+\` soma. Com strings, \`+\` **junta** (concatena).`),
          quiz('O que o código `console.log("5" + "5")` mostra?', ['10', '55', '"5" + "5"', 'Um erro'], 1,
            'As duas são strings, então o `+` junta os textos: `55`. Só soma quando os dois lados são numbers.'),
          code({ title: 'Duas linhas', task: 'Mostre no console:\n\n1. o texto `I am learning JavaScript`\n2. o resultado de `2026 + 1` (como número, sem aspas)',
            starter: '// 1. show the text: I am learning JavaScript\n\n// 2. show the result of 2026 + 1 (no quotes!)\n',
            solution: 'console.log("I am learning JavaScript");\nconsole.log(2026 + 1);',
            hint: 'Dois `console.log`, um em cada linha. No segundo, nada de aspas: `console.log(2026 + 1);`',
            tests: [['Mostra "I am learning JavaScript"', '__logs.includes("I am learning JavaScript")'], ['Mostra 2027', '__logs.includes("2027")']] })),

        lesson('js-vars', 'Variáveis: const e let',
          learn('Guardando valores com const', `Uma **variável** é um nome que guarda um valor. Pense numa caixa com etiqueta:

~~~
const name = "Rick";
console.log(name);   // Rick
~~~

- \`const\` cria a caixa
- \`name\` é a etiqueta
- \`=\` coloca o valor dentro

Depois disso, sempre que você escreve \`name\`, o JavaScript usa o valor guardado.`),
          code({ title: 'Sua cidade', task: 'Crie uma `const` chamada `city` com o valor `"Berlin"` e mostre `city` no console.',
            starter: '// 1. create a const called city with the value "Berlin"\n\n// 2. show city in the console\n',
            solution: 'const city = "Berlin";\nconsole.log(city);',
            hint: 'Primeiro `const city = "Berlin";`, depois `console.log(city);` (sem aspas em `city`, porque é o nome da variável).',
            tests: [['`city` vale "Berlin"', 'city === "Berlin"'], ['Mostra Berlin no console', '__logs.includes("Berlin")']], requires: [['Usa `const`', 'const\\s+city\\b']] }),
          learn('let: valores que mudam', `Uma \`const\` não pode receber outro valor depois. Quando o valor **vai mudar**, use \`let\`:

~~~
let score = 0;
score = 10;          // sem let de novo!
console.log(score);  // 10
~~~

Regra prática: comece sempre com \`const\`. Só troque pra \`let\` se precisar mudar. (Existe também o \`var\`, o jeito antigo: evite.)`),
          quiz('O que acontece ao rodar `const city = "Berlin"; city = "Munich";`?', ['city passa a valer "Munich"', 'Dá erro: não dá pra reatribuir uma const', 'city vira undefined', 'Cria uma segunda variável city'], 1,
            'Uma `const` não pode receber outro valor: você recebe `TypeError: Assignment to constant variable`. Se precisa mudar, use `let`.'),
          code({ title: 'Perdeu uma vida', task: 'O jogador tinha `3` vidas e perdeu uma. Na linha indicada, mude o valor de `lives` pra `2`.',
            starter: 'let lives = 3;\n\n// lose one life: change lives to 2 here\n\nconsole.log(lives);\n',
            solution: 'let lives = 3;\nlives = 2;\nconsole.log(lives);',
            hint: 'Só `lives = 2;`, sem `let` de novo (a variável já existe).',
            tests: [['`lives` vale 2', 'lives === 2'], ['Mostra 2 no console', '__logs.includes("2")']] }),
          learn('Juntando texto e variáveis', `Pra montar uma frase com variáveis, use **template literals**: o texto vai entre **crases** \`\` \` \`\` e cada variável dentro de \`\${ }\`:

~~~
const name = "Ana";
const age = 29;
console.log(\`Hi, \${name}! You are \${age}.\`);
// Hi, Ana! You are 29.
~~~

A crase fica na tecla ao lado do 1 no teclado brasileiro (com Shift no ABNT2).`),
          predict('O que aparece no console?', 'const pet = "cat";\nconsole.log(`My ${pet} is cute`);', ['My ${pet} is cute', 'My cat is cute', 'My pet is cute', 'Dá erro'], 1,
            'Dentro da crase, `${pet}` é trocado pelo valor da variável: "cat".'),
          code({ title: 'Apresente-se', task: 'Siga os passos do editor: crie `name` (string) e `age` (number), e mostre `My name is <name> and I am <age> years old` usando template literal.',
            starter: '// 1. create a const called name with your name (a string)\n\n// 2. create a let called age with your age (a number)\n\n// 3. show: My name is <name> and I am <age> years old\n//    tip: use backticks ` and ${...}\n',
            solution: 'const name = "Rick";\nlet age = 28;\nconsole.log(`My name is ${name} and I am ${age} years old`);',
            hint: 'O passo 3 fica assim: crase, o texto, e `${name}` / `${age}` nos lugares certos.',
            tests: [['`name` é uma string', 'typeof name === "string" && name.length > 0'], ['`age` é um number', 'typeof age === "number"'],
              ['Mostra a frase completa', '__logs.includes(`My name is ${name} and I am ${age} years old`)']],
            requires: [['Usa `const` pra name', 'const\\s+name\\b'], ['Usa `let` pra age', 'let\\s+age\\b']] })),

        lesson('js-types', 'Tipos e operadores',
          learn('Os tipos de valor', `Todo valor tem um **tipo**. Os mais comuns:

- **number**: \`42\`, \`3.14\`
- **string**: \`"hello"\`
- **boolean**: \`true\` ou \`false\`
- **undefined**: variável que ainda não recebeu valor

O \`typeof\` diz o tipo:

~~~
typeof 42      // "number"
typeof "42"    // "string"
typeof true    // "boolean"
~~~`),
          quiz('Qual é o resultado de `typeof "42"`?', ['"number"', '"string"', '"text"', '"integer"'], 1, 'Está entre aspas, então é uma string, mesmo parecendo número.'),
          learn('Fazendo contas', `Operadores matemáticos:

~~~
10 + 3    // 13
10 - 3    // 7
10 * 3    // 30  (multiplicação)
10 / 4    // 2.5 (divisão)
10 % 3    // 1   (resto da divisão)
2 ** 3    // 8   (potência)
~~~

O \`%\` parece estranho, mas é muito usado: \`n % 2\` dá \`0\` quando o número é par.`),
          predict('O que aparece no console?', 'const price = 10;\nconst qty = 3;\nconsole.log(price * qty);', ['13', '30', '103', 'price * qty'], 1, '`*` multiplica: 10 × 3 = 30.'),
          code({ title: 'Carrinho de compras', task: 'Com `price` e `quantity` prontos, crie `total` (price × quantity) e mostre no console.',
            starter: 'const price = 19.9;\nconst quantity = 3;\n\n// 1. create a const called total = price times quantity\n\n// 2. show total in the console\n',
            solution: 'const price = 19.9;\nconst quantity = 3;\nconst total = price * quantity;\nconsole.log(total);',
            hint: '`const total = price * quantity;` e depois `console.log(total);`',
            tests: [['Existe uma variável `total`', 'typeof total === "number"'], ['`total` é price × quantity', 'Math.abs(total - price * quantity) < 1e-9'], ['Mostra o total no console', '__logs.includes(String(total))']] }),
          code({ title: 'Par ou ímpar', task: 'Crie `rest` com o resto da divisão de `17` por `5` e mostre no console.',
            starter: '// create a const called rest = the remainder of 17 divided by 5\n\n// show rest in the console\n',
            solution: 'const rest = 17 % 5;\nconsole.log(rest);', hint: 'Resto da divisão é `%`: `17 % 5`.',
            tests: [['`rest` vale 2', 'rest === 2'], ['Mostra 2 no console', '__logs.includes("2")']] })),

        lesson('js-strings', 'Methods de string',
          learn('Transformando texto', `Strings vêm com **methods**: comandos que você chama com um ponto depois do valor.

~~~
const s = "  Hello World  ";
s.length          // 15 (quantos caracteres)
s.trim()          // "Hello World" (tira espaços das pontas)
s.toUpperCase()   // "  HELLO WORLD  "
s.toLowerCase()   // "  hello world  "
~~~

Os methods **não mudam** a string original: eles devolvem uma nova. Por isso a gente guarda o resultado numa variável.`),
          code({ title: 'Limpando um título', task: 'Com o `title` pronto:\n\n1. crie `clean` com o title **sem espaços nas pontas**\n2. crie `upper` com o `clean` em **maiúsculas**\n3. mostre `upper` no console',
            starter: 'const title = "  Learn JavaScript  ";\n\n// 1. const clean = title without the spaces at the ends\n\n// 2. const upper = clean in uppercase\n\n// 3. show upper\n',
            solution: 'const title = "  Learn JavaScript  ";\nconst clean = title.trim();\nconst upper = clean.toUpperCase();\nconsole.log(upper);',
            hint: '`title.trim()` e depois `clean.toUpperCase()`.',
            tests: [['`clean` sem espaços', 'clean === "Learn JavaScript"'], ['`upper` em maiúsculas', 'upper === "LEARN JAVASCRIPT"'], ['Mostra upper', '__logs.includes("LEARN JAVASCRIPT")']] }),
          learn('Procurando e recortando', `Mais methods úteis:

~~~
const email = "rick@mail.com";
email.includes("@")      // true  (contém?)
email.slice(0, 4)        // "rick" (do índice 0 até antes do 4)
email.replace("mail", "corp")  // "rick@corp.com"
~~~

As posições (**índices**) começam em **0**: o "r" é o índice 0, o "i" é o 1...`),
          quiz('O que `"JavaScript".slice(0, 4)` retorna?', ['"Java"', '"JavaS"', '"avaS"', '"Script"'], 0, '`slice(0, 4)` pega do índice 0 até antes do 4: "Java".'),
          code({ title: 'Analisando um email', task: 'Com o `email` pronto, crie:\n\n1. `hasAt`: se o email contém `"@"`\n2. `user`: os 4 primeiros caracteres\n\nE mostre os dois no console.',
            starter: 'const email = "rick@mail.com";\n\n// 1. const hasAt = does email include "@"?\n\n// 2. const user = the first 4 characters\n\n// 3. show hasAt and user\n',
            solution: 'const email = "rick@mail.com";\nconst hasAt = email.includes("@");\nconst user = email.slice(0, 4);\nconsole.log(hasAt);\nconsole.log(user);',
            hint: '`email.includes("@")` e `email.slice(0, 4)`.',
            tests: [['`hasAt` é true', 'hasAt === true'], ['`user` é "rick"', 'user === "rick"'], ['Mostra os dois', '__logs.includes("true") && __logs.includes("rick")']] })),

        lesson('js-math', 'Números e Math',
          learn('O objeto Math', `O \`Math\` tem funções prontas pra números:

~~~
Math.round(4.6)     // 5 (arredonda)
Math.floor(4.6)     // 4 (sempre pra baixo)
Math.ceil(4.1)      // 5 (sempre pra cima)
Math.max(3, 9, 1)   // 9 (o maior)
Math.min(3, 9, 1)   // 1 (o menor)
~~~`),
          quiz('Quanto vale `Math.floor(-2.5)`?', ['-2', '-3', '-2.5', '2'], 1, '`floor` arredonda sempre pra baixo, e abaixo de -2.5 vem -3.'),
          learn('Decimais e conversão', `Contas com decimais podem sair "quebradas": \`0.1 + 0.2\` dá \`0.30000000000000004\`.

Pra arredondar em 1 casa decimal:

~~~
Math.round(8.333 * 10) / 10   // 8.3
~~~

E pra transformar texto em número: \`Number("42")\` dá \`42\`. Se não der pra converter, vem \`NaN\` (Not a Number).`),
          code({ title: 'Média da prova', task: 'Com as notas prontas, crie:\n\n1. `avg`: a média das três, arredondada em **1 casa decimal**\n2. `best`: a maior nota, com `Math.max`\n\nE mostre os dois.',
            starter: 'const a = 7;\nconst b = 8;\nconst c = 10;\n\n// 1. const avg = average of a, b and c, rounded to 1 decimal\n//    tip: Math.round(x * 10) / 10\n\n// 2. const best = the highest grade\n\n// 3. show avg and best\n',
            solution: 'const a = 7;\nconst b = 8;\nconst c = 10;\nconst avg = Math.round((a + b + c) / 3 * 10) / 10;\nconst best = Math.max(a, b, c);\nconsole.log(avg);\nconsole.log(best);',
            hint: 'Média: `(a + b + c) / 3`. Depois aplique `Math.round(... * 10) / 10`. Maior: `Math.max(a, b, c)`.',
            tests: [['`avg` vale 8.3', 'avg === 8.3'], ['`best` vale 10', 'best === 10'], ['Mostra os dois', '__logs.includes("8.3") && __logs.includes("10")']] }))
      ),

      unit('Functions',
        lesson('js-functions', 'Functions',
          learn('Blocos reutilizáveis', `Uma **function** recebe valores (parâmetros), faz algo e devolve um resultado com \`return\`:

~~~
function add(a, b) {
  return a + b;
}
add(2, 3); // 5
~~~

A **arrow function** é o jeito curto, muito usado:

~~~
const add = (a, b) => a + b;
const square = n => n * n;
const log = () => { console.log("hi"); };
~~~

Atenção: \`console.log\` só mostra. \`return\` devolve o valor pra quem chamou.`),
          quiz('Se uma function não tem `return`, o que ela devolve?', ['0', 'null', 'undefined', 'Uma string vazia'], 2, 'Sem `return`, toda function devolve `undefined`.'),
          predict('O que aparece no console?', 'function triple(n) {\n  return n * 3;\n}\nconst x = triple(4);\nconsole.log(x + 1);', ['12', '13', '4', 'undefined'], 1, '`triple(4)` devolve 12, que vai pra `x`. Depois `x + 1` dá 13.'),
          code({ title: 'Dobro', task: 'Crie `double(n)` que **retorna** o dobro de `n`.',
            starter: 'function double(n) {\n  // your code\n}\n', solution: 'function double(n) {\n  return n * 2;\n}', hint: 'Use `return n * 2;`.',
            tests: [['double(4) → 8', 'double(4) === 8'], ['double(-3) → -6', 'double(-3) === -6'], ['double(0.5) → 1', 'double(0.5) === 1']] }),
          code({ title: 'Saudação com arrow function', task: 'Crie a arrow function `greet` que recebe `name` e retorna `Hello, <name>!`.',
            starter: 'const greet = // your code\n', solution: 'const greet = (name) => `Hello, ${name}!`;', hint: '`const greet = (name) => ...` com template literal.',
            tests: [['greet("Ana") → "Hello, Ana!"', 'greet("Ana") === "Hello, Ana!"'], ['greet("Lukas") → "Hello, Lukas!"', 'greet("Lukas") === "Hello, Lukas!"']],
            requires: [['Usa arrow function (`=>`)', '=>']] })),

        lesson('js-params', 'Parâmetros: default, rest e spread',
          learn('Parâmetros flexíveis', `**Default parameters** dão um valor padrão:

~~~
function greet(name = "stranger") {
  return \`Hi, \${name}\`;
}
greet(); // "Hi, stranger"
~~~

**Rest parameters** juntam vários argumentos num array:

~~~
function introduce(name, ...skills) {
  console.log(name, skills);
}
introduce("Ana", "js", "sql");   // Ana ["js","sql"]
~~~

**Spread** faz o contrário: espalha um array em argumentos.

~~~
const values = [4, 9, 2];
Math.max(...values); // 9
~~~`),
          quiz('Em `function f(a, ...rest)`, chamando `f(1, 2, 3)`, quanto vale `rest`?', ['[1, 2, 3]', '[2, 3]', '3', '2'], 1, 'O primeiro argumento vai pra `a` e o resto é coletado no array `rest`.'),
          code({ title: 'Junte as palavras', task: 'Crie `joinWords(...words)` que recebe quantas palavras quiser e retorna todas juntas, separadas por espaço. Sem argumentos, retorna `""` (string vazia).\n\nDica: `words` é um array, e arrays têm o method `join(" ")`.',
            starter: 'function joinWords(...words) {\n  // your code\n}\n', solution: 'function joinWords(...words) {\n  return words.join(" ");\n}',
            hint: '`return words.join(" ");`',
            tests: [['joinWords("hello", "world") → "hello world"', 'joinWords("hello", "world") === "hello world"'], ['Três palavras', 'joinWords("a", "b", "c") === "a b c"'], ['Sem argumentos → ""', 'joinWords() === ""']] }),
          code({ title: 'Preço com imposto', task: 'Crie `withTax(price, rate = 0.1)` que retorna `price` mais a taxa. Se `rate` não for passado, usa 10%.',
            starter: 'function withTax(price, rate) {\n  // add a default value to rate\n}\n', solution: 'function withTax(price, rate = 0.1) {\n  return price + price * rate;\n}',
            hint: 'O default vai na assinatura: `rate = 0.1`. Resultado: `price + price * rate`.',
            tests: [['withTax(100) → 110', 'Math.abs(withTax(100) - 110) < 1e-9'], ['withTax(100, 0.2) → 120', 'Math.abs(withTax(100, 0.2) - 120) < 1e-9']] })),

        lesson('js-closures', 'Scope e closures',
          learn('Quem enxerga o quê', `**Scope** é onde uma variável existe. Variáveis criadas com \`let\`/\`const\` dentro de \`{ }\` só existem ali dentro.

Uma **closure** acontece quando uma function "lembra" das variáveis de onde foi criada, mesmo depois que aquele código terminou:

~~~
function makeGreeter(greeting) {
  return (name) => \`\${greeting}, \${name}!\`;
}
const hello = makeGreeter("Hello");
hello("Ana"); // "Hello, Ana!"
~~~

A function retornada guardou \`greeting\`. Closures são a base de contadores, caches, debounce e muitos padrões de React.`),
          quiz('Depois de `const c = makeCounter(); c(); c();`, onde fica guardada a contagem?', ['Numa variável global', 'Na closure da function retornada', 'No objeto window', 'Em lugar nenhum: reseta toda vez'], 1, 'A variável interna de `makeCounter` continua viva na closure da function que você recebeu.'),
          code({ title: 'Contador', task: 'Crie `makeCounter()` que retorna uma function. Cada chamada dessa function incrementa e **retorna** a contagem (1, 2, 3...). Dois contadores diferentes não podem compartilhar a contagem.',
            starter: 'function makeCounter() {\n  // your code\n}\n', solution: 'function makeCounter() {\n  let count = 0;\n  return () => {\n    count++;\n    return count;\n  };\n}',
            hint: 'Crie `let count = 0` dentro de `makeCounter` e retorne uma arrow function que faz `count++` e retorna `count`.',
            tests: [['Conta 1, 2, 3', '(() => { const c = makeCounter(); return c() === 1 && c() === 2 && c() === 3; })()'],
              ['Contadores independentes', '(() => { const a = makeCounter(), b = makeCounter(); a(); a(); return b() === 1; })()']] })),

        lesson('js-higher-order', 'Callbacks e higher-order functions',
          learn('Functions como valores', `Em JavaScript, functions são valores: dá pra guardar em variável, passar como argumento e retornar.

Uma function passada como argumento é um **callback**. Uma function que recebe ou retorna outra é uma **higher-order function**:

~~~
function repeat(times, action) {
  for (let i = 0; i < times; i++) action(i);
}
repeat(3, (i) => console.log("round", i));
~~~

Você vai usar isso o tempo todo: \`map\`, \`filter\`, \`addEventListener\`, \`setTimeout\`... todos recebem callbacks.`),
          quiz('Em `button.addEventListener("click", handleClick)`, o que é `handleClick`?', ['Uma string', 'Um callback', 'Um evento', 'Uma class'], 1, 'É uma function passada pra ser chamada depois, quando o clique acontecer.'),
          code({ title: 'Aplique duas vezes', task: 'Crie `applyTwice(fn, value)` que aplica `fn` em `value` e depois aplica `fn` de novo no resultado.\n\nEx: `applyTwice(n => n + 3, 1)` → `7`.',
            starter: 'function applyTwice(fn, value) {\n  // your code\n}\n', solution: 'function applyTwice(fn, value) {\n  return fn(fn(value));\n}', hint: '`fn(fn(value))`',
            tests: [['n => n + 3, 1 → 7', 'applyTwice(n => n + 3, 1) === 7'], ['s => s + "!", "hey" → "hey!!"', 'applyTwice(s => s + "!", "hey") === "hey!!"']] }))
      ),

      unit('Decisões',
        lesson('js-if', 'if / else',
          learn('Tomando decisões', `Com \`if\` o código escolhe um caminho:

~~~
function checkAge(age) {
  if (age >= 18) {
    return "adult";
  } else if (age >= 13) {
    return "teen";
  } else {
    return "child";
  }
}
~~~

As condições são testadas de cima pra baixo; a primeira \`true\` ganha.

Comparação: \`>\`, \`<\`, \`>=\`, \`<=\`, \`===\` (igual) e \`!==\` (diferente).`),
          quiz('Na function `checkAge` acima, o que `checkAge(13)` retorna?', ['"adult"', '"teen"', '"child"', 'undefined'], 1, '`13 >= 18` é false; `13 >= 13` é true, então "teen".'),
          code({ title: 'Que calor!', task: 'Crie `classify(temp)` que retorna:\n\n- `"hot"` se `temp` for maior que 30\n- `"warm"` se for de 20 até 30\n- `"cold"` se for menor que 20',
            starter: 'function classify(temp) {\n  // your code\n}\n', solution: 'function classify(temp) {\n  if (temp > 30) return "hot";\n  if (temp >= 20) return "warm";\n  return "cold";\n}',
            hint: 'Teste primeiro o caso mais alto (`temp > 30`) e desça. 30 e 20 são "warm".',
            tests: [['35 → "hot"', 'classify(35) === "hot"'], ['30 → "warm"', 'classify(30) === "warm"'], ['20 → "warm"', 'classify(20) === "warm"'], ['5 → "cold"', 'classify(5) === "cold"']] })),

        lesson('js-logic', 'Igualdade e lógica',
          learn('=== e operadores lógicos', `Use sempre \`===\`. O \`==\` converte tipos e causa bugs:

~~~
5 == "5"    // true  (converteu!)
5 === "5"   // false (tipos diferentes)
~~~

Pra combinar condições:

- \`&&\` (AND): as duas precisam ser true
- \`||\` (OR): basta uma ser true
- \`!\` (NOT): inverte

~~~
const canEnter = age >= 18 && hasTicket;
~~~`),
          quiz('Qual é o valor de `true && !false`?', ['true', 'false', 'undefined', 'Dá erro'], 0, '`!false` vira `true`, e `true && true` é `true`.'),
          code({ title: 'Pode dirigir?', task: 'Crie `canDrive(age, hasLicense)` que retorna `true` só se `age` for 18 ou mais **e** `hasLicense` for `true`.',
            starter: 'function canDrive(age, hasLicense) {\n  // your code\n}\n', solution: 'function canDrive(age, hasLicense) {\n  return age >= 18 && hasLicense === true;\n}',
            hint: 'Uma linha resolve: `return age >= 18 && hasLicense;`',
            tests: [['(20, true) → true', 'canDrive(20, true) === true'], ['(18, true) → true', 'canDrive(18, true) === true'], ['(17, true) → false', 'canDrive(17, true) === false'], ['(30, false) → false', 'canDrive(30, false) === false']] })),

        lesson('js-ternary-switch', 'Ternário e switch',
          learn('Atalhos de decisão', `O **operador ternário** é um if/else numa expressão:

~~~
const label = score >= 6 ? "passed" : "failed";
~~~

O \`switch\` compara um valor com vários casos:

~~~
switch (day) {
  case "saturday":
  case "sunday":
    return "weekend";
  default:
    return "weekday";
}
~~~

Sem \`return\` ou \`break\`, o switch "cai" no próximo case. Casos empilhados (como acima) usam isso de propósito.`),
          quiz('Quanto vale `10 > 5 ? "a" : "b"`?', ['"a"', '"b"', 'true', '10'], 0, 'A condição é true, então o ternário devolve o primeiro valor.'),
          code({ title: 'Frete grátis', task: 'Crie `shipping(total)` usando o **operador ternário**: retorna `0` se `total` for 100 ou mais, senão `15`.',
            starter: 'function shipping(total) {\n  // use the ternary operator\n}\n', solution: 'function shipping(total) {\n  return total >= 100 ? 0 : 15;\n}',
            hint: '`return condição ? valorSeTrue : valorSeFalse;`',
            tests: [['shipping(150) → 0', 'shipping(150) === 0'], ['shipping(100) → 0', 'shipping(100) === 0'], ['shipping(99.9) → 15', 'shipping(99.9) === 15']],
            requires: [['Usa ternário (`? :`)', '\\?[^?]*:']] }),
          code({ title: 'Fim de semana?', task: 'Crie `dayType(day)` com **switch**: retorna `"weekend"` para `"saturday"` e `"sunday"`, e `"weekday"` para qualquer outro dia.',
            starter: 'function dayType(day) {\n  // use switch\n}\n', solution: 'function dayType(day) {\n  switch (day) {\n    case "saturday":\n    case "sunday":\n      return "weekend";\n    default:\n      return "weekday";\n  }\n}',
            hint: 'Empilhe `case "saturday":` e `case "sunday":` antes do mesmo `return`.',
            tests: [['saturday → weekend', 'dayType("saturday") === "weekend"'], ['sunday → weekend', 'dayType("sunday") === "weekend"'], ['monday → weekday', 'dayType("monday") === "weekday"']],
            requires: [['Usa `switch`', '\\bswitch\\s*\\(']] })),

        lesson('js-truthy', 'Truthy, falsy, ?? e ?.',
          learn('Valores que "contam" como false', `Em condições, todo valor vira true ou false. Os **falsy** são poucos:

\`false\`, \`0\`, \`""\` (string vazia), \`null\`, \`undefined\` e \`NaN\`. Todo o resto é **truthy** (inclusive \`"0"\`, \`[]\` e \`{}\`).

Operadores muito usados no dia a dia:

~~~
const name = input || "Anonymous";  // usa o padrão se input for falsy
const qty  = value ?? 1;            // só se value for null/undefined
const city = user?.address?.city;   // não quebra se user ou address não existir
~~~

A diferença: \`0 || 1\` dá \`1\`, mas \`0 ?? 1\` dá \`0\`. O \`??\` respeita zero e string vazia.`),
          quiz('Qual destes é truthy?', ['0', '""', '"0"', 'null'], 2, '`"0"` é uma string com um caractere, então é truthy. Só a string vazia é falsy.'),
          code({ title: 'Nome de exibição', task: 'Crie `displayName(user)` que retorna o `nickname` do usuário; se não existir, o `name`; se nenhum existir (ou se `user` for `undefined`), `"Anonymous"`.\n\nUse `?.` e `??`.',
            starter: 'function displayName(user) {\n  // your code\n}\n', solution: 'function displayName(user) {\n  return user?.nickname ?? user?.name ?? "Anonymous";\n}',
            hint: 'Dá pra encadear: `user?.nickname ?? user?.name ?? "Anonymous"`.',
            tests: [['Prefere nickname', 'displayName({ name: "Ana", nickname: "aninha" }) === "aninha"'], ['Usa name se não tiver nickname', 'displayName({ name: "Ana" }) === "Ana"'],
              ['Objeto vazio → "Anonymous"', 'displayName({}) === "Anonymous"'], ['undefined → "Anonymous"', 'displayName(undefined) === "Anonymous"']] }))
      ),

      unit('Arrays e loops',
        lesson('js-arrays', 'Arrays',
          learn('Listas de valores', `Um **array** guarda vários valores em ordem:

~~~
const cities = ["Berlin", "Lisbon", "Toronto"];
cities[0];                 // "Berlin" (índice começa em 0)
cities.length;             // 3
cities.push("Dublin");     // adiciona no final
cities.pop();              // remove o último
cities.includes("Lisbon"); // true
cities.indexOf("Toronto"); // 2
cities.at(-1);             // último item
~~~

Mesmo com \`const\`, dá pra mudar o conteúdo do array. O que não dá é reatribuir a variável.`),
          quiz('Em `const xs = [10, 20, 30]`, quanto vale `xs[xs.length - 1]`?', ['10', '20', '30', 'undefined'], 2, '`xs.length` é 3, então `xs[2]`: 30.'),
          code({ title: 'Último da fila', task: 'Crie `lastItem(arr)` que retorna o último elemento do array (ou `undefined` se estiver vazio).',
            starter: 'function lastItem(arr) {\n  // your code\n}\n', solution: 'function lastItem(arr) {\n  return arr[arr.length - 1];\n}', hint: 'Use `arr[arr.length - 1]` ou `arr.at(-1)`.',
            tests: [['[1, 2, 3] → 3', 'lastItem([1, 2, 3]) === 3'], ['["a"] → "a"', 'lastItem(["a"]) === "a"'], ['[] → undefined', 'lastItem([]) === undefined']] })),

        lesson('js-loops', 'Loops: for, for...of e while',
          learn('Repetindo tarefas', `O \`for...of\` passa por cada item:

~~~
let total = 0;
for (const price of [10, 25, 5]) {
  total += price;
}
~~~

O \`for\` clássico usa um contador, útil quando você precisa do índice:

~~~
for (let i = 0; i < items.length; i++) {
  console.log(i, items[i]);
}
~~~

O \`while\` repete enquanto a condição for true:

~~~
let n = 3;
while (n > 0) { console.log(n); n--; }
~~~

\`break\` sai do loop; \`continue\` pula pra próxima volta.`),
          quiz('Quantas vezes roda o corpo de `for (let i = 0; i < 3; i++)`?', ['2', '3', '4', 'Infinitas'], 1, 'Com i = 0, 1 e 2. Em i = 3 a condição é false.'),
          code({ title: 'Somando tudo', task: 'Crie `sum(numbers)` que retorna a soma do array usando um loop. Array vazio → `0`.',
            starter: 'function sum(numbers) {\n  let total = 0;\n  // your loop here\n  return total;\n}\n', solution: 'function sum(numbers) {\n  let total = 0;\n  for (const n of numbers) {\n    total += n;\n  }\n  return total;\n}',
            hint: '`for (const n of numbers) { total += n; }`',
            tests: [['[1, 2, 3] → 6', 'sum([1, 2, 3]) === 6'], ['[10, -4] → 6', 'sum([10, -4]) === 6'], ['[] → 0', 'sum([]) === 0']], requires: [['Usa um loop', '\\b(for|while)\\b']] }),
          code({ title: 'Contagem regressiva', task: 'Crie `countdown(n)` que retorna um array de `n` até `1`, usando `while`.\n\nEx: `countdown(3)` → `[3, 2, 1]`.',
            starter: 'function countdown(n) {\n  const result = [];\n  // use while\n  return result;\n}\n', solution: 'function countdown(n) {\n  const result = [];\n  while (n > 0) {\n    result.push(n);\n    n--;\n  }\n  return result;\n}',
            hint: 'Enquanto `n > 0`: `result.push(n)` e `n--`.',
            tests: [['countdown(3) → [3,2,1]', 'JSON.stringify(countdown(3)) === "[3,2,1]"'], ['countdown(0) → []', 'JSON.stringify(countdown(0)) === "[]"']], requires: [['Usa `while`', '\\bwhile\\s*\\(']] })),

        lesson('js-map-filter', 'map e filter',
          learn('Transformar e filtrar', `Em vez de escrever loops toda hora, use methods de array:

~~~
const nums = [1, 2, 3, 4];
nums.map(n => n * 10);     // [10, 20, 30, 40]
nums.filter(n => n > 2);   // [3, 4]
~~~

- \`map\`: cria um array novo **transformando** cada item.
- \`filter\`: cria um array novo só com os itens em que o callback retorna true.

Nenhum dos dois altera o array original. O callback também recebe o índice: \`map((item, index) => ...)\`.`),
          quiz('O que `[5, 8, 12].filter(n => n % 2 === 0)` retorna?', ['[5]', '[8, 12]', '[true, false, false]', '[false, true, true]'], 1, '`filter` mantém os pares: 8 e 12.'),
          code({ title: 'Só os pares', task: 'Crie `getEvens(nums)` que retorna só os pares, usando `filter`.',
            starter: 'function getEvens(nums) {\n  // your code\n}\n', solution: 'function getEvens(nums) {\n  return nums.filter(n => n % 2 === 0);\n}', hint: 'Par: `n % 2 === 0`.',
            tests: [['[1,2,3,4] → [2,4]', 'JSON.stringify(getEvens([1,2,3,4])) === "[2,4]"'], ['[7, 9] → []', 'JSON.stringify(getEvens([7, 9])) === "[]"']], requires: [['Usa `.filter`', '\\.filter\\s*\\(']] }),
          code({ title: 'Preços com desconto', task: 'Crie `applyDiscount(prices)` que usa `map` pra retornar cada preço 10% mais barato (× `0.9`).',
            starter: 'function applyDiscount(prices) {\n  // your code\n}\n', solution: 'function applyDiscount(prices) {\n  return prices.map(p => p * 0.9);\n}', hint: '`prices.map(p => p * 0.9)`',
            tests: [['[100, 50] → [90, 45]', 'JSON.stringify(applyDiscount([100, 50])) === "[90,45]"'], ['Não altera o original', '(() => { const a = [10]; applyDiscount(a); return a[0] === 10; })()']], requires: [['Usa `.map`', '\\.map\\s*\\(']] })),

        lesson('js-reduce', 'reduce',
          learn('Reduzindo a um valor', `\`reduce\` percorre o array acumulando um resultado:

~~~
const total = [10, 20, 30].reduce((acc, n) => acc + n, 0);  // 60
~~~

- \`acc\` (accumulator) é o resultado parcial.
- O \`0\` no final é o valor inicial do acumulador. **Sempre passe um valor inicial.**

Funciona pra qualquer formato de resultado, inclusive objects:

~~~
const byCity = people.reduce((acc, p) => {
  acc[p.city] = (acc[p.city] || 0) + 1;
  return acc;
}, {});
~~~`),
          quiz('Qual o resultado de `[1, 2, 3].reduce((acc, n) => acc * n, 1)`?', ['6', '0', '7', '123'], 0, '1 × 1 × 2 × 3 = 6.'),
          code({ title: 'Total do carrinho', task: 'Crie `cartTotal(items)` que recebe um array de `{ price, qty }` e retorna o total (`price * qty` somado), usando `reduce`.',
            starter: 'function cartTotal(items) {\n  // your code\n}\n', solution: 'function cartTotal(items) {\n  return items.reduce((acc, item) => acc + item.price * item.qty, 0);\n}',
            hint: '`items.reduce((acc, item) => acc + item.price * item.qty, 0)`',
            tests: [['Carrinho com 2 itens → 70', 'cartTotal([{ price: 10, qty: 2 }, { price: 25, qty: 2 }]) === 70'], ['Carrinho vazio → 0', 'cartTotal([]) === 0']], requires: [['Usa `.reduce`', '\\.reduce\\s*\\(']] })),

        lesson('js-find-some', 'find, some e every',
          learn('Buscando em arrays', `Methods de busca:

~~~
const users = [{ id: 1, name: "Ana" }, { id: 2, name: "Leo" }];

users.find(u => u.id === 2);       // { id: 2, name: "Leo" }
users.findIndex(u => u.id === 2);  // 1
users.some(u => u.name === "Ana"); // true (pelo menos um)
users.every(u => u.id > 0);        // true (todos)
~~~

\`find\` devolve o **primeiro item** que bate, ou \`undefined\`. \`filter\` devolve **um array** com todos.`),
          quiz('O que `[3, 5, 7].every(n => n > 4)` retorna?', ['true', 'false', '[5, 7]', '5'], 1, 'O 3 não é maior que 4, então nem todos passam.'),
          code({ title: 'Achar usuário', task: 'Crie `findUser(users, id)` que retorna o usuário com aquele `id` ou `null` se não existir.',
            starter: 'function findUser(users, id) {\n  // your code\n}\n', solution: 'function findUser(users, id) {\n  return users.find(u => u.id === id) ?? null;\n}', hint: '`find` retorna `undefined` quando não acha; troque por `null` com `??`.',
            tests: [['Acha o id 2', 'findUser([{id:1,name:"Ana"},{id:2,name:"Leo"}], 2).name === "Leo"'], ['id inexistente → null', 'findUser([{id:1}], 9) === null']] }),
          code({ title: 'Todos passaram?', task: 'Crie `allPassed(scores)` que retorna `true` se **todas** as notas forem 6 ou mais.',
            starter: 'function allPassed(scores) {\n  // your code\n}\n', solution: 'function allPassed(scores) {\n  return scores.every(s => s >= 6);\n}', hint: '`every`',
            tests: [['[7, 8, 6] → true', 'allPassed([7, 8, 6]) === true'], ['[9, 5] → false', 'allPassed([9, 5]) === false']] })),

        lesson('js-sort', 'Ordenando arrays',
          learn('sort sem surpresas', `\`sort()\` sem argumento ordena como **texto**, o que dá bug com números:

~~~
[10, 9, 1].sort();               // [1, 10, 9]  (bug!)
[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10]
~~~

O compare function retorna negativo (a vem antes), positivo (b vem antes) ou 0.

Pra strings, use \`localeCompare\`:

~~~
names.sort((a, b) => a.localeCompare(b));
~~~

**Cuidado:** \`sort\` altera o array original. Pra não mexer nele, copie antes: \`[...arr].sort(...)\`.`),
          quiz('O que `[3, 20, 100].sort()` retorna?', ['[3, 20, 100]', '[100, 20, 3]', '[3, 100, 20]', 'Dá erro'], 1,
            'Sem compare function, compara como texto: "100" < "20" < "3". O resultado é [100, 20, 3].'),
          code({ title: 'Mais barato primeiro', task: 'Crie `sortByPrice(products)` que retorna um **novo** array ordenado por `price` crescente, sem alterar o original.',
            starter: 'function sortByPrice(products) {\n  // your code\n}\n', solution: 'function sortByPrice(products) {\n  return [...products].sort((a, b) => a.price - b.price);\n}', hint: '`[...products].sort((a, b) => a.price - b.price)`',
            tests: [['Ordena por price', 'sortByPrice([{price:30},{price:5},{price:12}]).map(p => p.price).join() === "5,12,30"'],
              ['Não altera o original', '(() => { const a = [{price:2},{price:1}]; sortByPrice(a); return a[0].price === 2; })()']] }))
      )
    ]
  });
})(globalThis.TD = globalThis.TD || {});
