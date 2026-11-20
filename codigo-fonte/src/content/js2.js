/* JavaScript — módulos 5 a 8: objects, texto e datas, classes, erros */
(function (TD) {
  'use strict';
  const { learn, quiz, code, lesson, unit } = TD.C;
  const js = TD.courses.find((c) => c.id === 'js');

  js.units.push(
    unit('Objects',
      lesson('js-objects', 'Objects',
        learn('Agrupando dados', `Um **object** agrupa dados relacionados em pares chave: valor (as **properties**):

~~~
const user = {
  firstName: "Ana",
  lastName: "Souza",
  age: 29,
  greet() { return "Hi, I'm " + this.firstName; },
};

user.firstName;       // "Ana"
user["age"];          // 29 (útil quando a chave está numa variável)
user.city = "Porto";  // adiciona uma property
delete user.age;      // remove
user.greet();         // "Hi, I'm Ana"
~~~

Uma function dentro de um object é um **method**. Dentro dele, \`this\` aponta pro próprio object.`),
        quiz('Com `const car = { brand: "VW" }`, o que `car.model` retorna?', ['null', '""', 'undefined', 'Dá erro'], 2, 'Ler uma property inexistente não dá erro: retorna `undefined`.'),
        code({ title: 'Nome completo', task: 'Crie `getFullName(user)` que recebe um object com `firstName` e `lastName` e retorna os dois com um espaço no meio.',
          starter: 'function getFullName(user) {\n  // your code\n}\n', solution: 'function getFullName(user) {\n  return `${user.firstName} ${user.lastName}`;\n}', hint: 'Template literal com `user.firstName` e `user.lastName`.',
          tests: [['"Ana Souza"', 'getFullName({ firstName: "Ana", lastName: "Souza" }) === "Ana Souza"'], ['"Max Weber"', 'getFullName({ firstName: "Max", lastName: "Weber" }) === "Max Weber"']] })),

      lesson('js-array-objects', 'Arrays de objects',
        learn('O formato dos dados reais', `Dados de APIs quase sempre chegam como array de objects. É aqui que \`map\`, \`filter\` e \`reduce\` brilham:

~~~
const users = [
  { name: "Ana", age: 29 },
  { name: "Leo", age: 15 },
];
const adults = users.filter(u => u.age >= 18);
const names = users.map(u => u.name);   // ["Ana", "Leo"]
~~~

Dá pra encadear: \`users.filter(...).map(...)\`.`),
        quiz('Qual method transforma `[{name: "Ana"}, {name: "Leo"}]` em `["Ana", "Leo"]`?', ['filter', 'map', 'push', 'includes'], 1, '`map` transforma cada item: `users.map(u => u.name)`.'),
        code({ title: 'Nomes dos adultos', task: 'Crie `adultNames(users)` que retorna os `name` dos usuários com `age` 18 ou mais.',
          starter: 'function adultNames(users) {\n  // your code\n}\n', solution: 'function adultNames(users) {\n  return users.filter(u => u.age >= 18).map(u => u.name);\n}', hint: '`filter` pela idade e depois `map` pro nome.',
          tests: [['Retorna ["Ana", "Bia"]', 'JSON.stringify(adultNames([{name:"Ana",age:29},{name:"Leo",age:15},{name:"Bia",age:18}])) === \'["Ana","Bia"]\''], ['[] → []', 'JSON.stringify(adultNames([])) === "[]"']] })),

      lesson('js-destructuring', 'Destructuring e spread de objects',
        learn('Extrair e copiar', `**Destructuring** tira valores de objects e arrays direto pra variáveis:

~~~
const { name, age = 18 } = user;      // age com valor padrão
const [first, second] = ["a", "b"];
function show({ title, price }) { ... }  // direto nos parâmetros
~~~

**Spread** copia properties pra um object novo. É assim que se atualiza dados sem mutar (padrão do React):

~~~
const updated = { ...user, age: 30 };    // copia e sobrescreve age
const merged = { ...defaults, ...options };
~~~

A ordem importa: o que vem depois sobrescreve o que veio antes.`),
        quiz('Qual o resultado de `{ ...{ a: 1, b: 2 }, b: 3 }`?', ['{ a: 1, b: 2 }', '{ a: 1, b: 3 }', '{ b: 3 }', '{ a: 1, b: 2, b: 3 }'], 1, 'O `b: 3` vem depois e sobrescreve.'),
        code({ title: 'Atualização imutável', task: 'Crie `updateUser(user, changes)` que retorna um **novo** object com as properties de `user` atualizadas por `changes`, sem alterar o `user` original.',
          starter: 'function updateUser(user, changes) {\n  // your code\n}\n', solution: 'function updateUser(user, changes) {\n  return { ...user, ...changes };\n}', hint: '`{ ...user, ...changes }`',
          tests: [['Aplica as mudanças', 'updateUser({ name: "Ana", age: 29 }, { age: 30 }).age === 30'], ['Mantém o resto', 'updateUser({ name: "Ana", age: 29 }, { age: 30 }).name === "Ana"'],
            ['Não altera o original', '(() => { const u = { age: 1 }; updateUser(u, { age: 2 }); return u.age === 1; })()']] }),
        code({ title: 'Destructuring nos parâmetros', task: 'Crie `formatProduct` que recebe um object `{ title, price }` e retorna `"<title>: $<price>"`. Use destructuring direto nos parâmetros.',
          starter: 'function formatProduct(/* destructure here */) {\n  // your code\n}\n', solution: 'function formatProduct({ title, price }) {\n  return `${title}: $${price}`;\n}', hint: '`function formatProduct({ title, price }) { ... }`',
          tests: [['"Mouse: $20"', 'formatProduct({ title: "Mouse", price: 20 }) === "Mouse: $20"']], requires: [['Destructuring nos parâmetros', 'formatProduct\\s*\\(\\s*\\{']] })),

      lesson('js-object-iter', 'Percorrendo objects',
        learn('keys, values e entries', `Pra percorrer um object:

~~~
const prices = { coffee: 3, cake: 5 };

Object.keys(prices);    // ["coffee", "cake"]
Object.values(prices);  // [3, 5]
Object.entries(prices); // [["coffee", 3], ["cake", 5]]

for (const [item, price] of Object.entries(prices)) {
  console.log(item, price);
}
~~~

E pra montar um object a partir de pares: \`Object.fromEntries(pairs)\`.`),
        quiz('O que `Object.values({ a: 1, b: 2 })` retorna?', ['["a", "b"]', '[1, 2]', '[["a", 1], ["b", 2]]', '3'], 1, '`values` devolve só os valores.'),
        code({ title: 'Contador de palavras', task: 'Crie `countWords(text)` que retorna um object com quantas vezes cada palavra aparece. Separe por espaço e ignore maiúsculas/minúsculas.\n\nEx: `"go Go stop"` → `{ go: 2, stop: 1 }`.',
          starter: 'function countWords(text) {\n  const counts = {};\n  // your code\n  return counts;\n}\n', solution: 'function countWords(text) {\n  const counts = {};\n  for (const word of text.toLowerCase().split(" ")) {\n    counts[word] = (counts[word] || 0) + 1;\n  }\n  return counts;\n}',
          hint: 'Para cada palavra: `counts[word] = (counts[word] || 0) + 1`.',
          tests: [['"go Go stop" → {go: 2, stop: 1}', 'JSON.stringify(countWords("go Go stop")) === \'{"go":2,"stop":1}\''], ['"a" → {a: 1}', 'countWords("a").a === 1']] })),

      lesson('js-json', 'JSON',
        learn('O formato que a web fala', `**JSON** é o formato de texto usado por APIs pra trocar dados. Parece um object de JavaScript, mas é uma string:

~~~
const data = { name: "Ana", skills: ["js", "sql"] };
const text = JSON.stringify(data);   // '{"name":"Ana","skills":["js","sql"]}'
const back = JSON.parse(text);       // object de novo
JSON.stringify(data, null, 2);       // formatado com indentação
~~~

Regras do JSON: chaves sempre com **aspas duplas**, sem functions, sem \`undefined\`, sem vírgula sobrando no final.`),
        quiz('Qual destes é JSON válido?', ['{name: "Ana"}', "{'name': 'Ana'}", '{"name": "Ana"}', '{"name": "Ana",}'], 2, 'JSON exige aspas duplas nas chaves e nos textos, e não aceita vírgula no final.'),
        code({ title: 'Ler configurações', task: 'Crie `getTheme(json)` que recebe uma string JSON como `\'{"theme":"dark","fontSize":14}\'` e retorna o valor de `theme`.',
          starter: 'function getTheme(json) {\n  // your code\n}\n', solution: 'function getTheme(json) {\n  return JSON.parse(json).theme;\n}', hint: '`JSON.parse(json)` vira object; depois `.theme`.',
          tests: [['Retorna "dark"', 'getTheme(\'{"theme":"dark","fontSize":14}\') === "dark"'], ['Retorna "light"', 'getTheme(\'{"theme":"light"}\') === "light"']] }))
    ),

    unit('Texto, regex e datas',
      lesson('js-regex', 'Regex básico',
        learn('Padrões de texto', `**Regular expressions** descrevem padrões de texto. Ficam entre barras:

~~~
/\\d+/.test("Room 42");          // true  (\\d = dígito, + = um ou mais)
"a1b2".replace(/\\d/g, "");      // "ab"  (g = global, todos)
"2026-11-20".match(/\\d{4}/)[0]; // "2026" ({4} = exatamente 4)
~~~

Peças mais usadas:

- \`\\d\` dígito, \`\\w\` letra/número/_, \`\\s\` espaço, \`.\` qualquer caractere
- \`^\` início, \`$\` fim do texto
- \`[abc]\` um desses, \`[^abc]\` qualquer um menos esses
- \`+\` um ou mais, \`*\` zero ou mais, \`?\` opcional
- flag \`i\`: ignora maiúsculas/minúsculas`),
        quiz('O que `/^\\d{3}$/.test("1234")` retorna?', ['true', 'false', '"123"', 'Dá erro'], 1, '`^` e `$` exigem que o texto inteiro tenha exatamente 3 dígitos. "1234" tem 4.'),
        code({ title: 'Só os dígitos', task: 'Crie `onlyDigits(text)` que remove tudo que não é dígito. Ex: `"(11) 98765-4321"` → `"11987654321"`.',
          starter: 'function onlyDigits(text) {\n  // your code\n}\n', solution: 'function onlyDigits(text) {\n  return text.replace(/\\D/g, "");\n}', hint: '`\\D` (maiúsculo) é "não dígito". Use `replace` com a flag `g`.',
          tests: [['Telefone vira só dígitos', 'onlyDigits("(11) 98765-4321") === "11987654321"'], ['CPF', 'onlyDigits("123.456.789-00") === "12345678900"']] }),
        code({ title: 'Email simples', task: 'Crie `isValidEmail(email)` que retorna `true` se o texto tiver o formato `algo@algo.algo` (sem espaços). Use regex com `^` e `$`.',
          starter: 'function isValidEmail(email) {\n  // your code\n}\n', solution: 'function isValidEmail(email) {\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);\n}',
          hint: 'Um padrão comum: `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/`',
          tests: [['rick@mail.com → true', 'isValidEmail("rick@mail.com") === true'], ['sem @ → false', 'isValidEmail("rick.mail.com") === false'], ['com espaço → false', 'isValidEmail("ri ck@mail.com") === false'], ['sem domínio → false', 'isValidEmail("rick@mail") === false']] })),

      lesson('js-dates', 'Datas',
        learn('Trabalhando com Date', `O objeto \`Date\` representa um instante:

~~~
const now = new Date();
const d = new Date("2026-11-20");   // formato ISO
d.getFullYear();   // 2026
d.getMonth();      // 10  (janeiro = 0!)
d.getTime();       // milissegundos desde 1970
Date.now();        // agora, em ms
~~~

Pra calcular diferença entre datas, subtraia os milissegundos:

~~~
const ms = new Date("2026-12-25") - new Date("2026-12-20");
ms / (1000 * 60 * 60 * 24);   // 5 dias
~~~

Pra mostrar pro usuário, use \`Intl\`: \`d.toLocaleDateString("pt-BR")\`.`),
        quiz('O que `new Date("2026-01-15").getMonth()` retorna?', ['1', '0', '15', '2026'], 1, 'Os meses começam em 0: janeiro é 0.'),
        code({ title: 'Dias até a viagem', task: 'Crie `daysBetween(start, end)` que recebe duas datas em texto ISO (`"2026-12-01"`) e retorna quantos dias há entre elas.',
          starter: 'function daysBetween(start, end) {\n  // your code\n}\n', solution: 'function daysBetween(start, end) {\n  const ms = new Date(end) - new Date(start);\n  return Math.round(ms / (1000 * 60 * 60 * 24));\n}',
          hint: 'Subtraia `new Date(end) - new Date(start)` e divida por `1000 * 60 * 60 * 24`.',
          tests: [['01/12 → 25/12 = 24', 'daysBetween("2026-12-01", "2026-12-25") === 24'], ['Mesmo dia = 0', 'daysBetween("2026-05-05", "2026-05-05") === 0'], ['Atravessa o ano', 'daysBetween("2026-12-31", "2027-01-02") === 2']] }))
    ),

    unit('Classes e OOP',
      lesson('js-classes', 'Classes',
        learn('Moldes para objects', `Uma **class** é um molde pra criar objects com os mesmos dados e methods:

~~~
class Account {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
  }
  deposit(amount) {
    this.balance += amount;
    return this.balance;
  }
}

const acc = new Account("Rick");
acc.deposit(100);   // 100
~~~

- \`constructor\` roda quando você usa \`new\`.
- \`this\` é o object que está sendo criado/usado.
- Cada \`new\` cria uma **instância** independente.`),
        quiz('O que `new` faz em `new Account("Ana")`?', ['Chama uma function comum', 'Cria uma instância nova e roda o constructor', 'Copia uma instância existente', 'Importa a class'], 1, '`new` cria um object novo, liga ele à class e roda o constructor.'),
        code({ title: 'Conta bancária', task: 'Crie a class `BankAccount` com:\n\n- `balance` começando em `0`\n- `deposit(amount)` que soma ao saldo\n- `withdraw(amount)` que subtrai, mas **só se houver saldo suficiente**; retorna `true` se sacou e `false` se não',
          starter: 'class BankAccount {\n  // your code\n}\n', solution: 'class BankAccount {\n  constructor() {\n    this.balance = 0;\n  }\n  deposit(amount) {\n    this.balance += amount;\n  }\n  withdraw(amount) {\n    if (amount > this.balance) return false;\n    this.balance -= amount;\n    return true;\n  }\n}',
          hint: 'No `withdraw`, compare `amount > this.balance` antes de subtrair.',
          tests: [['Começa com 0', 'new BankAccount().balance === 0'], ['deposit soma', '(() => { const a = new BankAccount(); a.deposit(50); a.deposit(25); return a.balance === 75; })()'],
            ['withdraw com saldo', '(() => { const a = new BankAccount(); a.deposit(50); return a.withdraw(20) === true && a.balance === 30; })()'],
            ['withdraw sem saldo não mexe', '(() => { const a = new BankAccount(); a.deposit(10); return a.withdraw(20) === false && a.balance === 10; })()']] })),

      lesson('js-getters-static', 'Getters, static e campos privados',
        learn('Recursos de class', `Classes modernas têm:

~~~
class Temperature {
  #celsius;                       // campo privado (só acessível dentro)
  constructor(c) { this.#celsius = c; }

  get fahrenheit() {              // getter: lido como property
    return this.#celsius * 9 / 5 + 32;
  }
  static fromFahrenheit(f) {      // static: chamado na class
    return new Temperature((f - 32) * 5 / 9);
  }
}

const t = new Temperature(100);
t.fahrenheit;                     // 212 (sem parênteses!)
Temperature.fromFahrenheit(32);   // instância com 0 °C
~~~

Campos com \`#\` protegem o estado: \`t.#celsius\` dá erro fora da class.`),
        quiz('Como se lê um getter `get total()` de um object `cart`?', ['cart.total()', 'cart.total', 'cart.get("total")', 'Cart.total'], 1, 'Getters são acessados como property, sem parênteses.'),
        code({ title: 'Retângulo', task: 'Crie a class `Rectangle` com `constructor(width, height)`, um **getter** `area` e um method **static** `square(size)` que retorna um `Rectangle` com lados iguais.',
          starter: 'class Rectangle {\n  // your code\n}\n', solution: 'class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n  get area() {\n    return this.width * this.height;\n  }\n  static square(size) {\n    return new Rectangle(size, size);\n  }\n}',
          hint: '`get area() { return this.width * this.height; }` e `static square(size) { return new Rectangle(size, size); }`',
          tests: [['area de 3×4 = 12', 'new Rectangle(3, 4).area === 12'], ['Rectangle.square(5).area = 25', 'Rectangle.square(5).area === 25'], ['square retorna Rectangle', 'Rectangle.square(2) instanceof Rectangle']],
          requires: [['Usa `get`', '\\bget\\s+area'], ['Usa `static`', '\\bstatic\\s+square']] })),

      lesson('js-inheritance', 'Herança',
        learn('extends e super', `Uma class pode **herdar** de outra com \`extends\`:

~~~
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);            // chama o constructor do pai
    this.breed = breed;
  }
  speak() {                 // override
    return \`\${this.name} barks\`;
  }
}
~~~

Use herança com moderação. Muitas vezes **composição** (um object contendo outro) é mais simples.`),
        quiz('Numa class filha com constructor, o que precisa vir antes de usar `this`?', ['return', 'super(...)', 'new', 'static'], 1, 'Sem chamar `super(...)` primeiro, usar `this` dá ReferenceError.'),
        code({ title: 'Funcionários', task: 'Dada a class `Employee`, crie `Manager` que herda dela, recebe também `teamSize` e sobrescreve `describe()` para retornar `"<name> manages <teamSize> people"`.',
          starter: 'class Employee {\n  constructor(name) {\n    this.name = name;\n  }\n  describe() {\n    return `${this.name} is an employee`;\n  }\n}\n\n// class Manager ...\n',
          solution: 'class Employee {\n  constructor(name) {\n    this.name = name;\n  }\n  describe() {\n    return `${this.name} is an employee`;\n  }\n}\n\nclass Manager extends Employee {\n  constructor(name, teamSize) {\n    super(name);\n    this.teamSize = teamSize;\n  }\n  describe() {\n    return `${this.name} manages ${this.teamSize} people`;\n  }\n}',
          hint: '`class Manager extends Employee`, chame `super(name)` no constructor.',
          tests: [['Manager herda de Employee', 'new Manager("Ana", 5) instanceof Employee'], ['describe sobrescrito', 'new Manager("Ana", 5).describe() === "Ana manages 5 people"'], ['Employee continua igual', 'new Employee("Leo").describe() === "Leo is an employee"']] }))
    ),

    unit('Erros',
      lesson('js-errors', 'try, catch e throw',
        learn('Quando algo dá errado', `Erros interrompem o código. Com \`try/catch\` você trata o erro em vez de quebrar tudo:

~~~
try {
  const data = JSON.parse(text);
  console.log(data.name);
} catch (error) {
  console.log("Invalid JSON:", error.message);
} finally {
  console.log("always runs");
}
~~~

Você também pode **lançar** seus próprios erros:

~~~
function divide(a, b) {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
}
~~~

Regra: lance erros pra situações inválidas e trate onde der pra fazer algo útil.`),
        quiz('O bloco `finally` roda quando?', ['Só se houver erro', 'Só se não houver erro', 'Sempre', 'Nunca, é opcional'], 2, '`finally` roda nos dois casos, ideal pra limpeza (fechar conexão, esconder loading).'),
        code({ title: 'Parse seguro', task: 'Crie `safeParse(text)` que retorna o object do JSON, ou `null` se o texto for JSON inválido (sem quebrar).',
          starter: 'function safeParse(text) {\n  // your code\n}\n', solution: 'function safeParse(text) {\n  try {\n    return JSON.parse(text);\n  } catch (error) {\n    return null;\n  }\n}', hint: 'Coloque o `JSON.parse` num `try` e retorne `null` no `catch`.',
          tests: [['JSON válido', 'safeParse(\'{"a":1}\').a === 1'], ['JSON inválido → null', 'safeParse("{oops") === null']] }),
        code({ title: 'Validar idade', task: 'Crie `setAge(age)` que retorna a idade, mas **lança** um `Error` com a mensagem `"Invalid age"` se `age` for negativa ou maior que 150.',
          starter: 'function setAge(age) {\n  // your code\n}\n', solution: 'function setAge(age) {\n  if (age < 0 || age > 150) throw new Error("Invalid age");\n  return age;\n}', hint: '`throw new Error("Invalid age")`',
          tests: [['setAge(30) → 30', 'setAge(30) === 30'], ['-1 lança "Invalid age"', '(() => { try { setAge(-1); return false; } catch (e) { return e.message === "Invalid age"; } })()'],
            ['200 lança erro', '(() => { try { setAge(200); return false; } catch (e) { return true; } })()']] })),

      lesson('js-custom-errors', 'Erros personalizados',
        learn('Erros com significado', `Criar suas próprias classes de erro deixa o tratamento mais claro:

~~~
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("email", "Email is required");
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.field, e.message);
  } else {
    throw e;   // não sei tratar: repassa
  }
}
~~~

\`instanceof\` diz se um object foi criado por aquela class (ou por uma filha dela).`),
        quiz('Por que repassar (`throw e`) erros que você não reconhece?', ['Pra deixar o código mais rápido', 'Pra não esconder bugs que você não sabe tratar', 'Porque o catch é obrigatório', 'Não precisa, é só estilo'], 1, 'Engolir qualquer erro esconde bugs. Trate o que você sabe tratar e repasse o resto.'),
        code({ title: 'ValidationError', task: 'Crie a class `ValidationError` (herda de `Error`) com `name = "ValidationError"` e a property `field`.\n\nDepois crie `validateUser(user)` que lança `new ValidationError("name", "Name is required")` se `user.name` estiver vazio/ausente, e retorna `true` se estiver ok.',
          starter: 'class ValidationError extends Error {\n  // your code\n}\n\nfunction validateUser(user) {\n  // your code\n}\n',
          solution: 'class ValidationError extends Error {\n  constructor(field, message) {\n    super(message);\n    this.name = "ValidationError";\n    this.field = field;\n  }\n}\n\nfunction validateUser(user) {\n  if (!user.name) throw new ValidationError("name", "Name is required");\n  return true;\n}',
          hint: 'No constructor: `super(message)`, depois `this.name` e `this.field`.',
          tests: [['Usuário válido → true', 'validateUser({ name: "Ana" }) === true'],
            ['Lança ValidationError', '(() => { try { validateUser({}); return false; } catch (e) { return e instanceof ValidationError && e instanceof Error; } })()'],
            ['Com field e name certos', '(() => { try { validateUser({ name: "" }); } catch (e) { return e.field === "name" && e.name === "ValidationError" && e.message === "Name is required"; } return false; })()']] }))
    )
  );
})(globalThis.TD = globalThis.TD || {});
