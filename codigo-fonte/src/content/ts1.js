/* TypeScript — módulos 1 a 4: tipos básicos, objects, unions, functions e generics */
(function (TD) {
  'use strict';
  const { learn, quiz, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'ts', name: 'TypeScript', badge: 'TS', runner: 'ts',
    tagline: 'JavaScript com tipos',
    desc: 'O padrão em times profissionais. Do primeiro type annotation até generics, utility types, mapped e conditional types.',
    notes: 'Todo exercício de TypeScript passa pelo compilador de verdade (modo `strict`): só passa com **zero type errors**. Alguns exercícios têm **testes de tipo** escondidos, que conferem se os seus types estão certos. Recomendado depois do módulo de Functions do JavaScript.',
    units: [
      unit('Tipos básicos',
        lesson('ts-why', 'Por que TypeScript',
          learn('Tipos que avisam antes', `TypeScript é JavaScript + **types**. Você diz o tipo das coisas e o compilador avisa quando algo não bate, **antes** de rodar:

~~~
let age: number = 30;
age = "thirty";   // Error: Type 'string' is not assignable to type 'number'
~~~

Tipos básicos: \`number\`, \`string\`, \`boolean\`, \`null\`, \`undefined\`.

Quase sempre o TypeScript **infere** o tipo sozinho: \`let age = 30\` já faz \`age\` ser \`number\`. Anote tipos onde ajuda a ler (parâmetros, retorno, dados de fora).

No fim, o TypeScript é **compilado** pra JavaScript comum: os tipos somem e o código roda em qualquer lugar.`),
          quiz('Em `let city = "Berlin"`, qual tipo o TypeScript infere pra `city`?', ['any', 'string', '"Berlin"', 'unknown'], 1, 'Com `let`, ele infere o tipo geral `string`. Com `const` seria o literal `"Berlin"`.'),
          code({ title: 'Conserte o tipo', task: 'O código tem um type error. Corrija pra que `age` seja um `number` com valor `30` e compile sem erros.',
            starter: 'let age: number = "30";\nconsole.log(age + 1);\n', solution: 'let age: number = 30;\nconsole.log(age + 1);', hint: 'Tire as aspas: `30` é number, `"30"` é string.',
            tests: [['`age` vale 30', 'age === 30'], ['Mostra 31 no console', '__logs.includes("31")']] })),

        lesson('ts-functions', 'Tipando functions',
          learn('Parâmetros e retorno', `Em functions, tipe os parâmetros e, se quiser, o retorno:

~~~
function add(a: number, b: number): number {
  return a + b;
}
add(2, "3");   // Error: Argument of type 'string' is not assignable...

const shout = (text: string): string => text.toUpperCase();

function greet(name?: string) {       // opcional
  return \`Hi, \${name ?? "stranger"}\`;
}
function log(msg: string): void { console.log(msg); }   // não retorna nada
~~~

No modo \`strict\`, parâmetro sem tipo é erro (\`implicitly has an 'any' type\`).`),
          quiz('Qual assinatura recebe uma string e retorna um boolean?', ['(s: boolean): string', '(s: string): boolean', '(string): boolean', '(s): string => boolean'], 1, 'Parâmetro `s: string`, retorno `: boolean`.'),
          code({ title: 'Área do retângulo', task: 'Tipe `width` e `height` como `number` e o retorno como `number`.',
            starter: 'function area(width, height) {\n  return width * height;\n}\n', solution: 'function area(width: number, height: number): number {\n  return width * height;\n}', hint: 'Cada parâmetro com `: number` e o retorno depois dos parênteses: `): number {`.',
            tests: [['area(3, 4) → 12', 'area(3, 4) === 12']], requires: [['Parâmetros tipados', 'width\\s*:\\s*number[\\s\\S]*height\\s*:\\s*number'], ['Retorno tipado', '\\)\\s*:\\s*number\\s*\\{']] })),

        lesson('ts-arrays-unions', 'Arrays e union types',
          learn('Listas e "um ou outro"', `Arrays tipados:

~~~
const scores: number[] = [9, 7, 10];
const tags: Array<string> = ["dev", "remote"];   // mesma coisa
~~~

Um **union type** aceita mais de um tipo, com \`|\`:

~~~
let id: number | string;
id = 42;      // ok
id = "A-42";  // ok
~~~

Pra usar um union com segurança, cheque o tipo antes. Isso é **narrowing**:

~~~
if (typeof id === "string") {
  id.toUpperCase();   // aqui o TS sabe que é string
}
~~~`),
          quiz('Qual tipo aceita `[1, "two", 3]`?', ['number[]', 'string[]', '(number | string)[]', 'number | string[]'], 2, 'Cada item pode ser number ou string. Cuidado: `number | string[]` é "um number OU um array de strings".'),
          code({ title: 'Formatando IDs', task: 'Crie `formatId(id: number | string): string`:\n\n- number → `#` + 4 dígitos (`7` → `#0007`)\n- string → `#` + maiúsculas (`"ab12"` → `#AB12`)\n\nDica: `String(7).padStart(4, "0")`.',
            starter: 'function formatId(id: number | string): string {\n  // your code\n}\n', solution: 'function formatId(id: number | string): string {\n  if (typeof id === "number") {\n    return "#" + String(id).padStart(4, "0");\n  }\n  return "#" + id.toUpperCase();\n}',
            hint: '`if (typeof id === "number") { ... }` e depois trate a string.',
            tests: [['7 → "#0007"', 'formatId(7) === "#0007"'], ['1234 → "#1234"', 'formatId(1234) === "#1234"'], ['"ab12" → "#AB12"', 'formatId("ab12") === "#AB12"']] })),

        lesson('ts-any-unknown', 'any, unknown e never',
          learn('Os tipos "especiais"', `- **any**: desliga a checagem. Tudo passa, inclusive bugs. Evite.
- **unknown**: "pode ser qualquer coisa, mas você tem que checar antes de usar". É o tipo certo pra dados de fora (JSON, input do usuário, APIs).
- **never**: um valor que nunca existe (function que sempre lança erro, caso impossível).

~~~
function handle(input: unknown) {
  input.toUpperCase();              // Error: 'input' is of type 'unknown'
  if (typeof input === "string") {
    input.toUpperCase();            // ok
  }
}
~~~

Regra de ouro: prefira \`unknown\` a \`any\` e faça narrowing.`),
          quiz('Qual a diferença entre `any` e `unknown`?', ['Nenhuma', 'unknown obriga a checar o tipo antes de usar; any não checa nada', 'any é mais seguro', 'unknown só serve pra strings'], 1, '`unknown` é a versão segura: você precisa provar o tipo antes de usar.'),
          code({ title: 'Idade segura', task: 'Crie `parseAge(input: unknown): number | null`:\n\n- se for number, retorna ele\n- se for string que vira número válido (`"42"`), retorna o número\n- qualquer outra coisa → `null`\n\nNão use `any`.',
            starter: 'function parseAge(input: unknown): number | null {\n  // your code\n}\n', solution: 'function parseAge(input: unknown): number | null {\n  if (typeof input === "number") return input;\n  if (typeof input === "string") {\n    const n = Number(input);\n    return isNaN(n) ? null : n;\n  }\n  return null;\n}',
            hint: 'Dois `if` com `typeof`. Pra string, `Number(input)` e confira com `isNaN`.',
            tests: [['30 → 30', 'parseAge(30) === 30'], ['"42" → 42', 'parseAge("42") === 42'], ['"abc" → null', 'parseAge("abc") === null'], ['true → null', 'parseAge(true) === null']],
            requires: [['Não usa `any`', '^(?![\\s\\S]*\\bany\\b)']] }))
      ),

      unit('Objects e interfaces',
        lesson('ts-interfaces', 'interface e type',
          learn('Descrevendo objects', `Uma **interface** descreve o formato de um object:

~~~
interface User {
  name: string;
  age: number;
  email?: string;   // opcional
}

const ana: User = { name: "Ana", age: 29 };
~~~

Faltou property obrigatória ou sobrou uma que não existe? Erro.

Também dá pra usar \`type\`:

~~~
type Point = { x: number; y: number };
~~~

Regra prática: \`interface\` pra objects; \`type\` pra unions e o resto.`),
          quiz('Com a interface `User` acima, qual destes dá erro?', ['{ name: "Leo", age: 20 }', '{ name: "Leo", age: 20, email: "l@x.de" }', '{ name: "Leo" }', 'Nenhum'], 2, 'Falta `age`, que é obrigatória.'),
          code({ title: 'Catálogo de produtos', task: 'Crie a `interface Product` com `name` (string), `price` (number) e `inStock` (boolean). Crie `const product: Product` e a function `label(p: Product): string` que retorna `"<name> - €<price>"`.',
            starter: '// interface Product here\n\n// const product: Product = ...\n\nfunction label(p: Product): string {\n  // your code\n}\n',
            solution: 'interface Product {\n  name: string;\n  price: number;\n  inStock: boolean;\n}\n\nconst product: Product = { name: "Laptop", price: 999, inStock: true };\n\nfunction label(p: Product): string {\n  return `${p.name} - €${p.price}`;\n}',
            hint: 'Properties separadas por `;`. No label: template literal com `p.name` e `p.price`.',
            typeTests: 'type _p1 = Expect<Equal<Product["price"], number>>;\ntype _p2 = Expect<Equal<Product["inStock"], boolean>>;',
            tests: [['`product` existe', 'typeof product.name === "string"'], ['label formata', 'label({ name: "Mug", price: 12, inStock: false }) === "Mug - €12"']] })),

        lesson('ts-optional-readonly', 'Opcional, readonly e index signatures',
          learn('Detalhes de objects', `~~~
interface Settings {
  readonly id: number;         // não pode ser alterado depois
  theme: "dark" | "light";
  fontSize?: number;           // opcional: number | undefined
  [key: string]: unknown;      // index signature: aceita outras chaves
}
~~~

- \`readonly\` bloqueia reatribuição em tempo de compilação.
- Property opcional pode ser \`undefined\`, então trate antes de usar (\`?? valorPadrão\`).
- **Index signatures** descrevem objects usados como dicionário: \`{ [word: string]: number }\`.`),
          quiz('Com `fontSize?: number`, qual é o tipo de `settings.fontSize`?', ['number', 'number | undefined', 'number | null', 'any'], 1, 'Opcional significa que pode não existir: `number | undefined`.'),
          code({ title: 'Configurações', task: 'Crie a `interface Settings` com `id` (**readonly** number), `theme` (`"dark"` ou `"light"`) e `fontSize` (number **opcional**). Depois crie `fontSizeOf(s: Settings): number` que retorna o `fontSize` ou `16` se não existir.',
            starter: 'interface Settings {\n  // your code\n}\n\nfunction fontSizeOf(s: Settings): number {\n  // your code\n}\n',
            solution: 'interface Settings {\n  readonly id: number;\n  theme: "dark" | "light";\n  fontSize?: number;\n}\n\nfunction fontSizeOf(s: Settings): number {\n  return s.fontSize ?? 16;\n}',
            hint: '`readonly id: number;`, `fontSize?: number;` e `return s.fontSize ?? 16;`',
            typeTests: 'declare const __s: Settings;\n// @ts-expect-error id deve ser readonly\n__s.id = 5;\nconst __ok: Settings = { id: 1, theme: "dark" };\n// @ts-expect-error theme só aceita dark ou light\nconst __bad: Settings = { id: 1, theme: "blue" };',
            tests: [['Sem fontSize → 16', 'fontSizeOf({ id: 1, theme: "dark" }) === 16'], ['Com fontSize → valor', 'fontSizeOf({ id: 1, theme: "light", fontSize: 20 }) === 20']] })),

        lesson('ts-extends', 'extends e intersection',
          learn('Compondo tipos', `Interfaces podem **estender** outras:

~~~
interface Person { name: string; }
interface Employee extends Person {
  company: string;
}
const e: Employee = { name: "Ana", company: "Acme" };
~~~

Com \`type\`, o equivalente é a **intersection** (\`&\`), que junta tipos:

~~~
type WithId = { id: number };
type User = Person & WithId;   // { name: string; id: number }
~~~

Use pra montar tipos a partir de pedaços reutilizáveis, sem repetir properties.`),
          quiz('O que `type A = { x: number } & { y: string }` exige?', ['x OU y', 'x E y', 'Só x', 'Nada'], 1, 'Intersection exige as properties de todos os tipos.'),
          code({ title: 'Funcionário', task: 'Crie `interface Employee` que **estende** `Person` e adiciona `role: string`. Depois crie `introduce(e: Employee): string` que retorna `"<name> works as <role>"`.',
            starter: 'interface Person {\n  name: string;\n}\n\n// interface Employee ...\n\nfunction introduce(e: Employee): string {\n  // your code\n}\n',
            solution: 'interface Person {\n  name: string;\n}\n\ninterface Employee extends Person {\n  role: string;\n}\n\nfunction introduce(e: Employee): string {\n  return `${e.name} works as ${e.role}`;\n}',
            hint: '`interface Employee extends Person { role: string; }`',
            typeTests: 'type _e1 = Expect<Equal<Employee["name"], string>>;\ntype _e2 = Expect<Equal<Employee["role"], string>>;',
            tests: [['introduce funciona', 'introduce({ name: "Ana", role: "developer" }) === "Ana works as developer"']], requires: [['Usa extends Person', 'interface\\s+Employee\\s+extends\\s+Person']] }))
      ),

      unit('Unions e narrowing',
        lesson('ts-literals', 'Literal types',
          learn('Só esses valores', `Um **literal type** aceita valores exatos. Com union, vira uma lista fechada de opções:

~~~
type Status = "pending" | "paid" | "canceled";
let s: Status = "paid";   // ok
s = "refunded";           // Error!
~~~

Evita typos e faz o editor sugerir as opções. Com \`switch\`, cada caso é tratado:

~~~
switch (s) {
  case "pending": ...
  case "paid": ...
  case "canceled": ...
}
~~~`),
          quiz('Com `type Size = "S" | "M" | "L"`, qual atribuição é válida?', ['const a: Size = "XL";', 'const a: Size = "m";', 'const a: Size = "L";', 'const a: Size = 1;'], 2, 'Só os valores exatos. Minúscula é outro valor.'),
          code({ title: 'Status do pedido', task: 'Crie `type Status = "pending" | "paid" | "canceled"` e `statusLabel(s: Status): string`:\n\n- `"pending"` → `"Waiting for payment"`\n- `"paid"` → `"Paid"`\n- `"canceled"` → `"Canceled"`',
            starter: '// type Status here\n\nfunction statusLabel(s: Status): string {\n  // your code\n}\n',
            solution: 'type Status = "pending" | "paid" | "canceled";\n\nfunction statusLabel(s: Status): string {\n  switch (s) {\n    case "pending":\n      return "Waiting for payment";\n    case "paid":\n      return "Paid";\n    case "canceled":\n      return "Canceled";\n  }\n}',
            hint: 'Um `switch (s)` com um `case` e um `return` pra cada valor.',
            typeTests: 'type _s = Expect<Equal<Status, "pending" | "paid" | "canceled">>;',
            tests: [['pending', 'statusLabel("pending") === "Waiting for payment"'], ['paid', 'statusLabel("paid") === "Paid"'], ['canceled', 'statusLabel("canceled") === "Canceled"']] })),

        lesson('ts-narrowing', 'Discriminated unions',
          learn('Unions de objects', `Quando um union junta objects diferentes, dê a cada um uma property em comum com valor literal (o **discriminante**):

~~~
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function perimeter(s: Shape): number {
  if (s.kind === "circle") {
    return 2 * Math.PI * s.radius;   // aqui s é o circle
  }
  return 4 * s.size;                 // aqui s é o square
}
~~~

Outras formas de narrowing: \`typeof x === "string"\`, \`"prop" in obj\`, \`x instanceof Date\`, \`Array.isArray(x)\`.

É o padrão usado em reducers, eventos, respostas de API e state machines.`),
          quiz('Dentro de `if (s.kind === "square")`, o que o TS sabe sobre `s`?', ['Nada', 'Que é o tipo com kind "square" e tem size', 'Que é any', 'Que tem radius'], 1, 'O discriminante estreita o union pro membro certo.'),
          code({ title: 'Área das formas', task: 'Complete `area(shape: Shape): number`:\n\n- circle: `Math.PI * radius * radius`\n- square: `size * size`\n- rectangle: `width * height`',
            starter: 'type Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "square"; size: number }\n  | { kind: "rectangle"; width: number; height: number };\n\nfunction area(shape: Shape): number {\n  // your code\n}\n',
            solution: 'type Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "square"; size: number }\n  | { kind: "rectangle"; width: number; height: number };\n\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case "circle":\n      return Math.PI * shape.radius * shape.radius;\n    case "square":\n      return shape.size * shape.size;\n    case "rectangle":\n      return shape.width * shape.height;\n  }\n}',
            hint: '`switch (shape.kind)` com um case pra cada forma.',
            tests: [['circle r=1 → π', 'Math.abs(area({ kind: "circle", radius: 1 }) - Math.PI) < 1e-9'], ['square 3 → 9', 'area({ kind: "square", size: 3 }) === 9'], ['rectangle 2×5 → 10', 'area({ kind: "rectangle", width: 2, height: 5 }) === 10']] })),

        lesson('ts-never', 'Exhaustiveness com never',
          learn('O compilador lembrando de você', `E se alguém adicionar um novo caso no union e esquecer de tratar? Use \`never\` pra o compilador avisar:

~~~
function assertNever(x: never): never {
  throw new Error("Unhandled case: " + x);
}

switch (event.type) {
  case "click": ...
  case "scroll": ...
  default:
    return assertNever(event);   // erro de compilação se faltar um case
}
~~~

No \`default\`, se todos os casos foram tratados, sobra \`never\` e compila. Se faltou algum, sobra o tipo dele, que não é atribuível a \`never\`: **type error**. Você descobre o bug antes de rodar.`),
          quiz('Por que o `assertNever(x)` dá erro de compilação quando falta um case?', ['Porque x é any', 'Porque sobra um tipo que não cabe em never', 'Porque throw é proibido', 'Não dá erro, só em runtime'], 1, 'Os casos não tratados "sobram" no tipo de x, e só `never` cabe em `never`.'),
          code({ title: 'O case esquecido', task: 'Alguém adicionou `"refunded"` ao `Status`, e agora o código não compila. Trate o novo caso retornando `"Refunded"`.',
            starter: 'type Status = "pending" | "paid" | "refunded";\n\nfunction assertNever(x: never): never {\n  throw new Error("Unhandled: " + x);\n}\n\nfunction label(s: Status): string {\n  switch (s) {\n    case "pending":\n      return "Pending";\n    case "paid":\n      return "Paid";\n    default:\n      return assertNever(s);\n  }\n}\n',
            solution: 'type Status = "pending" | "paid" | "refunded";\n\nfunction assertNever(x: never): never {\n  throw new Error("Unhandled: " + x);\n}\n\nfunction label(s: Status): string {\n  switch (s) {\n    case "pending":\n      return "Pending";\n    case "paid":\n      return "Paid";\n    case "refunded":\n      return "Refunded";\n    default:\n      return assertNever(s);\n  }\n}',
            hint: 'Adicione `case "refunded": return "Refunded";` antes do `default`.',
            tests: [['refunded → "Refunded"', 'label("refunded") === "Refunded"'], ['paid continua igual', 'label("paid") === "Paid"']], requires: [['Mantém o assertNever', 'assertNever\\(s\\)']] }))
      ),

      unit('Functions e generics',
        lesson('ts-function-types', 'Tipos de function',
          learn('Functions como tipo', `Você pode descrever o **formato de uma function** como tipo:

~~~
type Formatter = (value: number) => string;

const toPercent: Formatter = (v) => \`\${v * 100}%\`;   // v já é number

function formatAll(values: number[], fmt: Formatter): string[] {
  return values.map(fmt);
}
~~~

É assim que se tipa callbacks, handlers de eventos e props de componentes que recebem functions.

Utility types pra extrair partes de uma function: \`ReturnType<F>\` e \`Parameters<F>\`.`),
          quiz('Qual tipo descreve uma function que recebe uma string e não retorna nada?', ['(s: string) => null', '(s: string) => void', 'string => void', 'Function<string>'], 1, '`void` indica que o retorno não importa/não existe.'),
          code({ title: 'Formatadores', task: 'Crie `type Formatter = (value: number) => string`, a const `toCurrency: Formatter` que retorna `"$"` + o valor com 2 casas (`toFixed(2)`), e `formatAll(values: number[], fmt: Formatter): string[]`.',
            starter: '// type Formatter ...\n\n// const toCurrency: Formatter = ...\n\nfunction formatAll(values: number[], fmt: Formatter): string[] {\n  // your code\n}\n',
            solution: 'type Formatter = (value: number) => string;\n\nconst toCurrency: Formatter = (value) => "$" + value.toFixed(2);\n\nfunction formatAll(values: number[], fmt: Formatter): string[] {\n  return values.map(fmt);\n}',
            hint: '`type Formatter = (value: number) => string;` e `return values.map(fmt);`',
            typeTests: 'type _f1 = Expect<Equal<ReturnType<Formatter>, string>>;\n// @ts-expect-error Formatter recebe number\nconst __bad: Formatter = (v: string) => v;',
            tests: [['toCurrency(5) → "$5.00"', 'toCurrency(5) === "$5.00"'], ['formatAll aplica o formatador', 'formatAll([1, 2.5], toCurrency).join() === "$1.00,$2.50"']] })),

        lesson('ts-generics', 'Generics',
          learn('Functions que servem pra qualquer tipo', `E se uma function funciona com qualquer tipo, mas você quer manter a informação de tipo? Use um **generic** (\`T\`):

~~~
function wrap<T>(value: T): T[] {
  return [value];
}
wrap(5);       // number[]
wrap("hi");    // string[]
~~~

O \`T\` é descoberto pelo argumento. Você já usa generics: \`number[]\` é \`Array<number>\`, \`Promise<User>\`, \`Map<string, number>\`.`),
          quiz('Com `function wrap<T>(value: T): T[]`, qual o tipo de `wrap(true)`?', ['T[]', 'boolean', 'boolean[]', 'any[]'], 2, '`T` vira `boolean`, então `T[]` vira `boolean[]`.'),
          code({ title: 'Primeiro item', task: 'Crie a generic function `first<T>(items: T[]): T | undefined` que retorna o primeiro item ou `undefined`.',
            starter: 'function first<T>(items: T[]): T | undefined {\n  // your code\n}\n', solution: 'function first<T>(items: T[]): T | undefined {\n  return items[0];\n}', hint: '`items[0]`',
            typeTests: 'const __n = first([1, 2]);\ntype _g1 = Expect<Equal<typeof __n, number | undefined>>;',
            tests: [['[3, 4] → 3', 'first([3, 4]) === 3'], ['[] → undefined', 'first([]) === undefined']] })),

        lesson('ts-constraints', 'Constraints e keyof',
          learn('Limitando o generic', `Às vezes o \`T\` precisa ter certas características. Use \`extends\` como **constraint**:

~~~
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
longest("abc", "de");    // ok: string tem length
longest(10, 20);         // Error: number não tem length
~~~

\`keyof T\` é o union das chaves de T, e \`T[K]\` é o tipo da property K:

~~~
type User = { name: string; age: number };
type Keys = keyof User;         // "name" | "age"
type Age = User["age"];         // number
~~~`),
          quiz('Qual é `keyof { a: string; b: number }`?', ['string | number', '"a" | "b"', '["a", "b"]', 'object'], 1, '`keyof` dá o union das chaves.'),
          code({ title: 'getProp tipado', task: 'Crie `getProp<T, K extends keyof T>(obj: T, key: K): T[K]` que retorna `obj[key]`. O retorno deve ter o tipo exato da property, e chaves inexistentes devem dar erro.',
            starter: 'function getProp(obj, key) {\n  return obj[key];\n}\n', solution: 'function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}',
            hint: 'Assinatura completa: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K]`.',
            typeTests: 'const __age = getProp({ name: "Ana", age: 30 }, "age");\ntype _c1 = Expect<Equal<typeof __age, number>>;\n// @ts-expect-error chave inexistente\ngetProp({ a: 1 }, "b");',
            tests: [['Retorna o valor', 'getProp({ name: "Ana" }, "name") === "Ana"']] }))
      )
    ]
  });
})(globalThis.TD = globalThis.TD || {});
