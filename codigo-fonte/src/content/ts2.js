/* TypeScript — módulos 5 a 8: utility types, classes, tipos avançados, na prática */
(function (TD) {
  'use strict';
  const { learn, quiz, code, lesson, unit } = TD.C;
  const ts = TD.courses.find((c) => c.id === 'ts');

  ts.units.push(
    unit('Utility types',
      lesson('ts-utility', 'Partial, Pick, Omit e cia',
        learn('Transformando tipos', `O TypeScript traz **utility types** que criam tipos novos a partir de outros:

~~~
interface Todo { id: number; title: string; done: boolean; }

Partial<Todo>            // tudo opcional (ótimo pra "updates")
Required<Todo>           // tudo obrigatório
Readonly<Todo>           // tudo readonly
Pick<Todo, "title">      // só title
Omit<Todo, "id">         // tudo menos id (ótimo pra "criar novo")
~~~

Assim você não duplica definições: se \`Todo\` mudar, os derivados mudam junto.`),
        quiz('Qual utility type representa "um Todo sem o id"?', ['Pick<Todo, "id">', 'Omit<Todo, "id">', 'Partial<Todo>', 'Exclude<Todo, "id">'], 1, '`Omit` remove as chaves indicadas.'),
        code({ title: 'Atualizando tarefas', task: 'Com a `interface Todo` pronta:\n\n- crie `type TodoPreview` só com `title` e `done` (use `Pick`)\n- crie `type NewTodo` com tudo menos `id` (use `Omit`)\n- crie `updateTodo(todo: Todo, changes: Partial<Todo>): Todo` que retorna um novo object com as mudanças',
          starter: 'interface Todo {\n  id: number;\n  title: string;\n  done: boolean;\n}\n\n// type TodoPreview = ...\n// type NewTodo = ...\n\nfunction updateTodo(todo: Todo, changes: Partial<Todo>): Todo {\n  // your code\n}\n',
          solution: 'interface Todo {\n  id: number;\n  title: string;\n  done: boolean;\n}\n\ntype TodoPreview = Pick<Todo, "title" | "done">;\ntype NewTodo = Omit<Todo, "id">;\n\nfunction updateTodo(todo: Todo, changes: Partial<Todo>): Todo {\n  return { ...todo, ...changes };\n}',
          hint: '`Pick<Todo, "title" | "done">`, `Omit<Todo, "id">` e `{ ...todo, ...changes }`.',
          typeTests: 'type _u1 = Expect<Equal<TodoPreview, { title: string; done: boolean }>>;\ntype _u2 = Expect<Equal<NewTodo, { title: string; done: boolean }>>;',
          tests: [['updateTodo aplica mudanças', 'updateTodo({ id: 1, title: "a", done: false }, { done: true }).done === true'], ['Mantém o resto', 'updateTodo({ id: 1, title: "a", done: false }, { done: true }).title === "a"']] })),

      lesson('ts-record', 'Record, ReturnType e Parameters',
        learn('Mais utilitários do dia a dia', `**Record<K, V>** cria um object com chaves K e valores V:

~~~
type Role = "admin" | "editor" | "viewer";
const permissions: Record<Role, string[]> = {
  admin: ["read", "edit", "delete"],
  editor: ["read", "edit"],
  viewer: ["read"],
};   // se faltar um role: erro!
~~~

Extraindo tipos de functions que já existem:

~~~
function createUser(name: string, age: number) { return { name, age, id: 1 }; }
type NewUser = ReturnType<typeof createUser>;       // { name: string; age: number; id: number }
type Args = Parameters<typeof createUser>;          // [name: string, age: number]
~~~

\`typeof\` aqui pega o **tipo** de um valor.`),
        quiz('O que acontece se um `Record<Role, string[]>` não tiver a chave `"viewer"`?', ['Nada', 'Type error: property faltando', 'Ela vira undefined', 'Vira any'], 1, '`Record` com union de chaves exige todas elas.'),
        code({ title: 'Permissões', task: 'Crie `type Role = "admin" | "editor" | "viewer"`, anote `permissions` como `Record<Role, string[]>` e crie `canEdit(role: Role): boolean` que retorna se as permissões do role incluem `"edit"`.',
          starter: '// type Role = ...\n\nconst permissions = {\n  admin: ["read", "edit", "delete"],\n  editor: ["read", "edit"],\n  viewer: ["read"],\n};\n\n// function canEdit(...)\n',
          solution: 'type Role = "admin" | "editor" | "viewer";\n\nconst permissions: Record<Role, string[]> = {\n  admin: ["read", "edit", "delete"],\n  editor: ["read", "edit"],\n  viewer: ["read"],\n};\n\nfunction canEdit(role: Role): boolean {\n  return permissions[role].includes("edit");\n}',
          hint: '`const permissions: Record<Role, string[]> = {...}` e `permissions[role].includes("edit")`.',
          typeTests: '// @ts-expect-error role inexistente\ncanEdit("guest");\ntype _r = Expect<Equal<Parameters<typeof canEdit>[0], Role>>;',
          tests: [['admin pode', 'canEdit("admin") === true'], ['viewer não pode', 'canEdit("viewer") === false']], requires: [['Usa Record<Role', 'Record\\s*<\\s*Role']] }))
    ),

    unit('Classes',
      lesson('ts-classes', 'Classes com tipos',
        learn('Modificadores de acesso', `TypeScript adiciona controle de acesso às classes:

~~~
class Account {
  private balance = 0;                       // só dentro da class
  protected log: string[] = [];              // class e filhas
  constructor(public readonly owner: string) {}   // parameter property

  deposit(amount: number): void {
    this.balance += amount;
  }
  getBalance(): number {
    return this.balance;
  }
}
~~~

- \`public\` (padrão), \`private\`, \`protected\`
- \`readonly\`: só pode ser definido na criação
- **Parameter properties**: \`constructor(public owner: string)\` declara e atribui numa linha só`),
        quiz('Num `constructor(private id: number) {}`, o que acontece?', ['Nada, falta atribuir', 'Cria a property privada id e atribui automaticamente', 'Dá erro', 'id fica público'], 1, 'Parameter properties declaram e atribuem a property de uma vez.'),
        code({ title: 'Carteira', task: 'Crie a class `Wallet` com:\n\n- `owner` público e **readonly**, recebido no constructor (parameter property)\n- `coins` **private**, começando em `0`\n- `add(n: number): void` e `total(): number`',
          starter: 'class Wallet {\n  // your code\n}\n',
          solution: 'class Wallet {\n  private coins = 0;\n  constructor(public readonly owner: string) {}\n  add(n: number): void {\n    this.coins += n;\n  }\n  total(): number {\n    return this.coins;\n  }\n}',
          hint: '`private coins = 0;` e `constructor(public readonly owner: string) {}`',
          typeTests: 'const __w = new Wallet("x");\n// @ts-expect-error coins é private\n__w.coins;\n// @ts-expect-error owner é readonly\n__w.owner = "y";',
          tests: [['owner guardado', 'new Wallet("Rick").owner === "Rick"'], ['add e total', '(() => { const w = new Wallet("a"); w.add(5); w.add(3); return w.total() === 8; })()']] })),

      lesson('ts-abstract', 'implements e abstract',
        learn('Contratos para classes', `**implements** obriga uma class a seguir uma interface:

~~~
interface Storage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}
class MemoryStorage implements Storage { ... }   // erro se faltar method
~~~

Uma **abstract class** é uma base incompleta: não dá pra instanciar, e as filhas precisam implementar os methods abstratos:

~~~
abstract class Notifier {
  abstract send(msg: string): string;
  notify(msg: string) { return this.send(msg.trim()); }
}
~~~

Use interface pra contratos; abstract class quando também quer compartilhar código.`),
        quiz('O que acontece em `new Notifier()` se Notifier é abstract?', ['Cria normalmente', 'Type error: não dá pra instanciar abstract class', 'Cria uma filha automaticamente', 'Retorna null'], 1, 'Classes abstratas só servem de base.'),
        code({ title: 'Notificações', task: 'Crie a class `EmailNotifier` que estende `Notifier` e implementa `send(msg)` retornando `"Email: <msg>"`.',
          starter: 'abstract class Notifier {\n  abstract send(msg: string): string;\n  notify(msg: string): string {\n    return this.send(msg.toUpperCase());\n  }\n}\n\n// class EmailNotifier ...\n',
          solution: 'abstract class Notifier {\n  abstract send(msg: string): string;\n  notify(msg: string): string {\n    return this.send(msg.toUpperCase());\n  }\n}\n\nclass EmailNotifier extends Notifier {\n  send(msg: string): string {\n    return `Email: ${msg}`;\n  }\n}',
          hint: '`class EmailNotifier extends Notifier { send(msg: string): string { ... } }`',
          typeTests: '// @ts-expect-error abstract não instancia\nnew Notifier();\nconst __n: Notifier = new EmailNotifier();',
          tests: [['notify usa o send da filha', 'new EmailNotifier().notify("hi") === "Email: HI"']] }))
    ),

    unit('Tipos avançados',
      lesson('ts-keyof-typeof', 'as const, keyof typeof',
        learn('Tipos a partir de valores', `Muitas vezes os dados vêm primeiro e você quer tipos derivados deles:

~~~
const COLORS = {
  primary: "#f7e600",
  danger: "#ff2a6d",
} as const;              // tudo readonly e literal

type ColorName = keyof typeof COLORS;          // "primary" | "danger"
type ColorValue = (typeof COLORS)[ColorName];  // "#f7e600" | "#ff2a6d"

const ROLES = ["admin", "user"] as const;
type Role = (typeof ROLES)[number];            // "admin" | "user"
~~~

\`as const\` congela os valores como literais. Adicionou uma cor? O tipo atualiza sozinho.`),
        quiz('Sem `as const`, qual o tipo de `["a", "b"]`?', ['("a" | "b")[]', 'string[]', 'readonly ["a", "b"]', 'any[]'], 1, 'Sem `as const`, o TS generaliza pra `string[]`.'),
        code({ title: 'Paleta de cores', task: 'Use `as const` no `COLORS`, crie `type ColorName = keyof typeof COLORS` e a function `color(name: ColorName): string` que retorna o hex.',
          starter: 'const COLORS = {\n  primary: "#f7e600",\n  danger: "#ff2a6d",\n  info: "#00e5ff",\n};\n\n// type ColorName = ...\n\n// function color(...)\n',
          solution: 'const COLORS = {\n  primary: "#f7e600",\n  danger: "#ff2a6d",\n  info: "#00e5ff",\n} as const;\n\ntype ColorName = keyof typeof COLORS;\n\nfunction color(name: ColorName): string {\n  return COLORS[name];\n}',
          hint: 'Coloque `as const` depois do `}` e use `keyof typeof COLORS`.',
          typeTests: 'type _k = Expect<Equal<ColorName, "primary" | "danger" | "info">>;\n// @ts-expect-error cor inexistente\ncolor("blue");\ntype _v = Expect<Equal<(typeof COLORS)["info"], "#00e5ff">>;',
          tests: [['color("danger")', 'color("danger") === "#ff2a6d"']] })),

      lesson('ts-mapped', 'Mapped types',
        learn('Percorrendo as chaves de um tipo', `Um **mapped type** cria um tipo novo passando por cada chave de outro:

~~~
type Flags<T> = { [K in keyof T]: boolean };

type User = { name: string; age: number };
type UserFlags = Flags<User>;   // { name: boolean; age: boolean }
~~~

É assim que \`Partial\`, \`Readonly\` e \`Record\` são feitos por dentro:

~~~
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
~~~

Modificadores: \`?\` (opcional), \`readonly\`, e \`-?\` / \`-readonly\` pra remover.`),
        quiz('O que `{ [K in keyof T]: T[K] }` produz?', ['Um tipo vazio', 'Uma cópia do tipo T', 'Só as chaves de T', 'Um array'], 1, 'Pra cada chave K, o mesmo tipo T[K]: uma cópia de T.'),
        code({ title: 'Seus próprios utility types', task: 'Implemente sem usar os utility types prontos:\n\n- `Flags<T>`: mesmas chaves de T, todas `boolean`\n- `Nullable<T>`: mesmas chaves, cada valor `T[K] | null`',
          starter: 'type Flags<T> = unknown;\ntype Nullable<T> = unknown;\n',
          solution: 'type Flags<T> = { [K in keyof T]: boolean };\ntype Nullable<T> = { [K in keyof T]: T[K] | null };',
          hint: '`{ [K in keyof T]: boolean }` e `{ [K in keyof T]: T[K] | null }`.',
          typeTests: 'type __U = { name: string; age: number };\ntype _m1 = Expect<Equal<Flags<__U>, { name: boolean; age: boolean }>>;\ntype _m2 = Expect<Equal<Nullable<__U>, { name: string | null; age: number | null }>>;',
          requires: [['Sem Record/Partial prontos', '^(?![\\s\\S]*\\b(Record|Partial)\\s*<)']] })),

      lesson('ts-conditional', 'Conditional types e infer',
        learn('if/else no nível dos tipos', `Um **conditional type** escolhe um tipo baseado em outro:

~~~
type IsString<T> = T extends string ? true : false;
IsString<"hi">;   // true
IsString<42>;     // false
~~~

Com \`infer\`, você "captura" uma parte do tipo:

~~~
type ElementType<T> = T extends (infer U)[] ? U : T;
ElementType<number[]>;   // number

type Unwrap<T> = T extends Promise<infer V> ? V : T;
Unwrap<Promise<string>>; // string
~~~

\`ReturnType\`, \`Parameters\` e \`Awaited\` são feitos assim.`),
        quiz('O que é `ElementType<string>` com a definição acima?', ['never', 'string', 'string[]', 'unknown'], 1, '`string` não é array, então cai no "senão" e devolve o próprio T.'),
        code({ title: 'Tipos condicionais', task: 'Implemente:\n\n- `IsString<T>`: `true` se T for string, senão `false`\n- `ElementType<T>`: o tipo do item se T for array; senão o próprio T\n- `Unwrap<T>`: o tipo de dentro se T for `Promise<...>`; senão T',
          starter: 'type IsString<T> = unknown;\ntype ElementType<T> = unknown;\ntype Unwrap<T> = unknown;\n',
          solution: 'type IsString<T> = T extends string ? true : false;\ntype ElementType<T> = T extends (infer U)[] ? U : T;\ntype Unwrap<T> = T extends Promise<infer V> ? V : T;',
          hint: 'Formato: `T extends X ? A : B`, com `infer U` pra capturar.',
          typeTests: 'type _c1 = Expect<Equal<IsString<"a">, true>>;\ntype _c2 = Expect<Equal<IsString<1>, false>>;\ntype _c3 = Expect<Equal<ElementType<number[]>, number>>;\ntype _c4 = Expect<Equal<ElementType<boolean>, boolean>>;\ntype _c5 = Expect<Equal<Unwrap<Promise<string>>, string>>;\ntype _c6 = Expect<Equal<Unwrap<number>, number>>;' })),

      lesson('ts-template-types', 'Template literal types',
        learn('Strings com tipos', `Template literals também existem no nível dos tipos:

~~~
type Size = "sm" | "lg";
type Color = "red" | "blue";
type ClassName = \`\${Size}-\${Color}\`;   // "sm-red" | "sm-blue" | "lg-red" | "lg-blue"
~~~

Com os helpers \`Uppercase\`, \`Lowercase\` e \`Capitalize\`:

~~~
type Handler<E extends string> = \`on\${Capitalize<E>}\`;
Handler<"click">;   // "onClick"
~~~

Muito usado em libs pra gerar nomes de eventos, rotas e chaves de CSS com segurança.`),
        quiz('Qual é `` `btn-${"a" | "b"}` ``?', ['"btn-a" | "btn-b"', 'string', '"btn-ab"', 'never'], 0, 'O union é distribuído: um resultado pra cada membro.'),
        code({ title: 'Nomes de eventos', task: 'Implemente:\n\n- `EventHandler<E extends string>`: `"on"` + E capitalizado (`"click"` → `"onClick"`)\n- `Getter<K extends string>`: `"get"` + K capitalizado (`"name"` → `"getName"`)',
          starter: 'type EventHandler<E extends string> = unknown;\ntype Getter<K extends string> = unknown;\n',
          solution: 'type EventHandler<E extends string> = `on${Capitalize<E>}`;\ntype Getter<K extends string> = `get${Capitalize<K>}`;',
          hint: 'Template literal type: `` `on${Capitalize<E>}` ``.',
          typeTests: 'type _t1 = Expect<Equal<EventHandler<"click">, "onClick">>;\ntype _t2 = Expect<Equal<EventHandler<"click" | "focus">, "onClick" | "onFocus">>;\ntype _t3 = Expect<Equal<Getter<"name">, "getName">>;' }))
    ),

    unit('TypeScript na prática',
      lesson('ts-async', 'Async com tipos',
        learn('Promise<T>', `Functions \`async\` retornam \`Promise<T>\`:

~~~
interface User { id: number; name: string; }

async function getUser(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();   // cuidado: json() é any!
}
~~~

\`await\` desembrulha: dentro da function, \`await getUser(1)\` tem tipo \`User\`.

Atenção: dados que chegam da rede não são verificados pelo TypeScript em runtime. O tipo é uma **promessa sua**. Pra dados não confiáveis, valide (próxima lição).

Neste exercício existe \`api.getUser(id): Promise<User>\`.`),
        quiz('Qual o tipo de `x` em `const x = await getUser(1)` (com `getUser(): Promise<User>`)?', ['Promise<User>', 'User', 'any', 'Promise<any>'], 1, '`await` desembrulha a Promise.'),
        code({ title: 'Buscar nomes', task: 'Crie `async function getNames(ids: number[]): Promise<string[]>` que busca todos os usuários **em paralelo** com `api.getUser` e retorna os nomes.',
          declare: 'interface User { id: number; name: string }\ndeclare const api: { getUser(id: number): Promise<User> };',
          prelude: 'const api = { async getUser(id) { await new Promise(r => setTimeout(r, 20)); return { id, name: ["Ana", "Lukas", "Marta"][id - 1] || "Guest" }; } };',
          starter: 'async function getNames(ids: number[]): Promise<string[]> {\n  // your code\n}\n',
          solution: 'async function getNames(ids: number[]): Promise<string[]> {\n  const users = await Promise.all(ids.map((id) => api.getUser(id)));\n  return users.map((u) => u.name);\n}',
          hint: '`Promise.all(ids.map(id => api.getUser(id)))` e depois `map` pros nomes.',
          typeTests: 'type _a = Expect<Equal<ReturnType<typeof getNames>, Promise<string[]>>>;',
          tests: [['[1, 2] → ["Ana", "Lukas"]', '(await getNames([1, 2])).join() === "Ana,Lukas"'], ['[] → []', '(await getNames([])).length === 0']], requires: [['Usa Promise.all', 'Promise\\.all']] })),

      lesson('ts-type-guards', 'Type guards',
        learn('Validando dados de fora', `Um **type guard** é uma function que verifica um valor em runtime e informa o TypeScript do resultado:

~~~
function isString(x: unknown): x is string {
  return typeof x === "string";
}

const data: unknown = JSON.parse(text);
if (isUser(data)) {
  data.name;   // TS sabe que é User aqui
}
~~~

O retorno \`x is User\` é o que transforma um boolean comum em narrowing.

Em projetos grandes, libs como **Zod** geram esses guards a partir de schemas. Mas entender o mecanismo é essencial.`),
        quiz('O que `value is User` no retorno de uma function faz?', ['Converte value pra User', 'Diz ao TS que, se retornar true, value é User', 'Lança erro se não for User', 'Nada, é comentário'], 1, 'É um type predicate: o resultado true estreita o tipo.'),
        code({ title: 'isUser', task: 'Crie `isUser(value: unknown): value is User` que retorna `true` só se `value` for um object (não null) com `name` string e `email` string.',
          starter: 'interface User {\n  name: string;\n  email: string;\n}\n\nfunction isUser(value: unknown): value is User {\n  // your code\n}\n',
          solution: 'interface User {\n  name: string;\n  email: string;\n}\n\nfunction isUser(value: unknown): value is User {\n  if (typeof value !== "object" || value === null) return false;\n  const v = value as { name?: unknown; email?: unknown };\n  return typeof v.name === "string" && typeof v.email === "string";\n}',
          hint: 'Cheque `typeof value === "object" && value !== null`, depois converta com `as { name?: unknown; email?: unknown }` e teste os campos.',
          typeTests: 'declare const __x: unknown;\nif (isUser(__x)) { const __n: string = __x.email; }',
          tests: [['User válido', 'isUser({ name: "Ana", email: "a@x.com" }) === true'], ['Sem email', 'isUser({ name: "Ana" }) === false'], ['null', 'isUser(null) === false'], ['string', 'isUser("Ana") === false'], ['email não-string', 'isUser({ name: "A", email: 5 }) === false']] })),

      lesson('ts-result', 'Result types',
        learn('Erros sem exceptions', `Em vez de lançar erro, muitas bases retornam um **Result**, que obriga quem chama a tratar o caso de falha:

~~~
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function parsePort(s: string): Result<number> {
  const n = Number(s);
  if (!Number.isInteger(n)) return { ok: false, error: "Not a number" };
  return { ok: true, value: n };
}

const r = parsePort("8080");
if (r.ok) console.log(r.value);   // narrowing pelo discriminante ok
else console.log(r.error);
~~~`),
        quiz('Por que `r.value` só pode ser lido dentro de `if (r.ok)`?', ['Por convenção', 'Porque só o membro com ok: true tem value', 'Porque value é private', 'Não precisa de if'], 1, 'Discriminated union: só o lado de sucesso tem `value`.'),
        code({ title: 'Divisão segura', task: 'Com o `type Result<T>` pronto, crie `safeDivide(a: number, b: number): Result<number>`. Se `b` for 0, retorne `{ ok: false, error: "Division by zero" }`.',
          starter: 'type Result<T> =\n  | { ok: true; value: T }\n  | { ok: false; error: string };\n\nfunction safeDivide(a: number, b: number): Result<number> {\n  // your code\n}\n',
          solution: 'type Result<T> =\n  | { ok: true; value: T }\n  | { ok: false; error: string };\n\nfunction safeDivide(a: number, b: number): Result<number> {\n  if (b === 0) return { ok: false, error: "Division by zero" };\n  return { ok: true, value: a / b };\n}',
          hint: 'Dois returns: o caso de erro e `{ ok: true, value: a / b }`.',
          tests: [['6 / 3', '(() => { const r = safeDivide(6, 3); return r.ok === true && r.value === 2; })()'], ['Divisão por zero', '(() => { const r = safeDivide(1, 0); return r.ok === false && r.error === "Division by zero"; })()']] })),

      lesson('ts-final', 'Projeto final: gerenciador de tarefas',
        learn('Juntando tudo', `Hora de modelar um sistema pequeno, mas bem tipado:

- literal union pro status
- interface pra entidade
- class com campos privados
- \`Record\` pras estatísticas
- erros com mensagens claras

Pense nos tipos primeiro. Com eles certos, a implementação quase se escreve sozinha.`),
        code({ title: 'TaskManager', task: 'Crie:\n\n- `type Status = "todo" | "doing" | "done"`\n- `interface Task { id: number; title: string; status: Status }`\n- class `TaskManager` com:\n  - `add(title: string): Task` (ids 1, 2, 3...; status inicial `"todo"`)\n  - `move(id: number, status: Status): void` (lança `Error("Task not found")` se não existir)\n  - `byStatus(status: Status): Task[]`\n  - `stats(): Record<Status, number>`',
          starter: '// type Status ...\n// interface Task ...\n\nclass TaskManager {\n  // your code\n}\n',
          solution: 'type Status = "todo" | "doing" | "done";\n\ninterface Task {\n  id: number;\n  title: string;\n  status: Status;\n}\n\nclass TaskManager {\n  private tasks: Task[] = [];\n  private nextId = 1;\n\n  add(title: string): Task {\n    const task: Task = { id: this.nextId++, title, status: "todo" };\n    this.tasks.push(task);\n    return task;\n  }\n\n  move(id: number, status: Status): void {\n    const task = this.tasks.find((t) => t.id === id);\n    if (!task) throw new Error("Task not found");\n    task.status = status;\n  }\n\n  byStatus(status: Status): Task[] {\n    return this.tasks.filter((t) => t.status === status);\n  }\n\n  stats(): Record<Status, number> {\n    const result: Record<Status, number> = { todo: 0, doing: 0, done: 0 };\n    for (const t of this.tasks) result[t.status]++;\n    return result;\n  }\n}',
          hint: 'Guarde `private tasks: Task[] = []` e `private nextId = 1`. Em `stats`, comece com `{ todo: 0, doing: 0, done: 0 }`.',
          typeTests: 'type _s = Expect<Equal<Status, "todo" | "doing" | "done">>;\nconst __tm = new TaskManager();\n// @ts-expect-error status inválido\n__tm.move(1, "archived");\ntype _r = Expect<Equal<ReturnType<TaskManager["stats"]>, Record<Status, number>>>;',
          tests: [['add cria com id e status', '(() => { const m = new TaskManager(); const a = m.add("A"); const b = m.add("B"); return a.id === 1 && b.id === 2 && a.status === "todo"; })()'],
            ['move e byStatus', '(() => { const m = new TaskManager(); m.add("A"); m.add("B"); m.move(2, "done"); return m.byStatus("done").length === 1 && m.byStatus("todo")[0].title === "A"; })()'],
            ['move inexistente lança erro', '(() => { const m = new TaskManager(); try { m.move(9, "done"); return false; } catch (e) { return e.message === "Task not found"; } })()'],
            ['stats', '(() => { const m = new TaskManager(); m.add("A"); m.add("B"); m.move(1, "doing"); const s = m.stats(); return s.todo === 1 && s.doing === 1 && s.done === 0; })()']] }))
    )
  );
})(globalThis.TD = globalThis.TD || {});
