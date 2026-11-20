/* SQL — bancos de exemplo e módulos 1 a 4: consultas, agregação, JOINs, subqueries */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  const SHOP = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL, city TEXT, age INTEGER, email TEXT);
INSERT INTO customers VALUES
 (1,'Ana Souza','Brazil','São Paulo',29,'ana@mail.com'),
 (2,'Lukas Becker','Germany','Berlin',41,'lukas@mail.de'),
 (3,'Marta Silva','Portugal','Lisbon',35,NULL),
 (4,'Jonas Weber','Germany','Munich',23,'jonas@mail.de'),
 (5,'Carlos Lima','Brazil','Recife',52,'carlos@mail.com'),
 (6,'Emma Fischer','Germany','Berlin',31,'emma@mail.de'),
 (7,'Sofia Costa','Portugal','Porto',19,NULL),
 (8,'Pedro Alves','Brazil','São Paulo',44,'pedro@mail.com'),
 (9,'Liam Murphy','Ireland','Dublin',27,'liam@mail.ie'),
 (10,'Julia Santos','Brazil','Curitiba',38,NULL);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL);
INSERT INTO products VALUES
 (1,'Keyboard','Peripherals',49.9),(2,'Mouse','Peripherals',19.9),(3,'Monitor','Displays',219.0),(4,'Laptop','Computers',899.0),
 (5,'Headset','Audio',79.0),(6,'Webcam','Peripherals',59.0),(7,'Desk Lamp','Office',35.0),(8,'Speakers','Audio',129.0);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL, amount REAL NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL);
INSERT INTO orders VALUES
 (1,1,1,1,49.9,'delivered','2026-01-10'),(2,2,3,1,219.0,'delivered','2026-01-12'),(3,1,2,2,39.8,'delivered','2026-02-03'),
 (4,3,4,1,899.0,'delivered','2026-02-15'),(5,4,1,1,49.9,'shipped','2026-03-01'),(6,6,3,2,438.0,'delivered','2026-03-08'),
 (7,2,2,1,19.9,'canceled','2026-03-20'),(8,5,5,1,79.0,'delivered','2026-04-02'),(9,6,4,1,899.0,'shipped','2026-04-11'),
 (10,8,1,3,149.7,'delivered','2026-04-30'),(11,9,6,1,59.0,'pending','2026-05-05'),(12,1,8,1,129.0,'pending','2026-05-18'),
 (13,2,5,2,158.0,'delivered','2026-05-21'),(14,7,2,1,19.9,'delivered','2026-06-02'),(15,8,6,2,118.0,'shipped','2026-06-10'),
 (16,5,4,1,899.0,'canceled','2026-06-15');`;

  const HR = `
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
INSERT INTO departments VALUES (1,'Engineering','Berlin'),(2,'Sales','Lisbon'),(3,'Marketing','São Paulo'),(4,'Support','Dublin'),(5,'Legal','Berlin');
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES departments(id), manager_id INTEGER REFERENCES employees(id), salary INTEGER NOT NULL, hired_at TEXT NOT NULL);
INSERT INTO employees VALUES
 (1,'Helena Braun',1,NULL,9500,'2018-03-01'),(2,'Rafael Costa',1,1,7200,'2020-06-15'),(3,'Mia Schulz',1,1,6800,'2021-01-10'),
 (4,'Tiago Rocha',1,2,5200,'2023-09-01'),(5,'Laura Mendes',2,NULL,8100,'2019-05-20'),(6,'Bruno Dias',2,5,4800,'2022-02-14'),
 (7,'Clara Neves',2,5,5100,'2021-11-03'),(8,'Felipe Ramos',3,NULL,7000,'2020-08-08'),(9,'Nina Hoffmann',3,8,4500,'2024-01-15'),
 (10,'Sean Kelly',4,NULL,6000,'2019-10-01'),(11,'Aoife Byrne',4,10,4200,'2023-04-22');`;

  const BANK = `
CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, balance REAL NOT NULL CHECK (balance >= 0));
INSERT INTO accounts VALUES (1,'Ana',500.0),(2,'Lukas',120.0),(3,'Marta',0.0);`;

  TD.courses.push({
    id: 'sql', name: 'SQL', badge: 'SQL', runner: 'sql',
    tagline: 'A língua dos dados',
    desc: 'Do primeiro SELECT a JOINs, subqueries, CTEs, modelagem, índices e window functions. Usa SQLite, mas o que você aprende vale pra PostgreSQL e MySQL.',
    notes: 'Cada exercício roda num banco **novo**, sempre com os mesmos dados: pode errar à vontade. Compare sua tabela com a aba **Esperado**.',
    setups: { shop: SHOP, hr: HR, bank: BANK },
    dbNotes: {
      shop: 'Banco **loja**: `customers` (id, name, country, city, age, email), `products` (id, name, category, price) e `orders` (id, customer_id, product_id, quantity, amount, status, created_at).',
      hr: 'Banco **empresa**: `departments` (id, name, city) e `employees` (id, name, dept_id, manager_id, salary, hired_at). `manager_id` aponta pra outro employee.',
      bank: 'Banco **banco**: `accounts` (id, owner, balance), com `CHECK (balance >= 0)`.'
    },
    units: [
      unit('Consultas',
        lesson('sql-select', 'SELECT',
          learn('Lendo uma tabela', `Um banco relacional guarda dados em **tables**: rows (linhas) e columns (colunas). Pra ler, use \`SELECT\`:

~~~
SELECT * FROM customers;
~~~

O \`*\` traz todas as columns. Pra escolher:

~~~
SELECT name, age FROM customers;
~~~

Keywords (\`SELECT\`, \`FROM\`) em maiúsculas são convenção; funciona em minúsculas também. O \`;\` separa comandos.`),
          quiz('O que `SELECT name FROM customers;` retorna?', ['Só a primeira row', 'A column name de todas as rows', 'Todas as columns', 'O número de customers'], 1, 'Sem filtro, vêm todas as rows, só com as columns pedidas.'),
          code({ title: 'Lista de clientes', task: 'Selecione `name` e `country` de todos os `customers`.', starter: '-- write your query\n', solution: 'SELECT name, country FROM customers;', hint: '`SELECT col1, col2 FROM table;`' })),

        lesson('sql-where', 'WHERE',
          learn('Filtrando rows', `\`WHERE\` decide quais rows entram:

~~~
SELECT name FROM customers
WHERE country = 'Brazil';
~~~

- Texto entre **aspas simples**: \`'Brazil'\`.
- Comparação: \`=\`, \`<>\` (diferente), \`>\`, \`<\`, \`>=\`, \`<=\`.`),
          quiz('Qual query retorna clientes com 40 anos ou mais?', ['... WHERE age > 40;', '... WHERE age >= 40;', '... IF age >= 40;', 'SELECT age >= 40 FROM customers;'], 1, '"40 ou mais" é `>= 40`.'),
          predict('Quantas rows essa query retorna? (no banco tem 2 clientes de Portugal: Marta e Sofia)', "SELECT name\nFROM customers\nWHERE country = 'Portugal';", ['0', '1', '2', 'Todas as 10'], 2, 'O WHERE deixa passar só as rows em que a condição é verdadeira: as duas de Portugal.'),
          code({ title: 'Clientes na Alemanha', task: 'Selecione `name` e `age` dos customers do país `\'Germany\'`.', starter: '-- write your query\n', solution: "SELECT name, age FROM customers WHERE country = 'Germany';", hint: "`WHERE country = 'Germany'`" })),

        lesson('sql-filters', 'AND, OR, IN e BETWEEN',
          learn('Filtros combinados', `~~~
SELECT * FROM customers
WHERE country = 'Germany' AND age < 30;

SELECT * FROM customers
WHERE country IN ('Brazil', 'Portugal');     -- qualquer um da lista

SELECT * FROM orders
WHERE amount BETWEEN 50 AND 200;             -- inclui 50 e 200
~~~

Cuidado com \`AND\` + \`OR\` juntos: \`AND\` tem prioridade. Use parênteses:

~~~
WHERE (country = 'Brazil' OR country = 'Portugal') AND age > 30
~~~`),
          quiz('`BETWEEN 10 AND 20` inclui o 20?', ['Sim', 'Não', 'Só no PostgreSQL', 'Depende do tipo'], 0, '`BETWEEN` é inclusivo nas duas pontas.'),
          code({ title: 'Pedidos médios', task: 'Selecione `id`, `amount` e `status` dos `orders` com `amount` entre 50 e 300 **e** status `\'delivered\'` ou `\'shipped\'`.',
            starter: '-- write your query\n', solution: "SELECT id, amount, status FROM orders WHERE amount BETWEEN 50 AND 300 AND status IN ('delivered', 'shipped');",
            hint: "`amount BETWEEN 50 AND 300 AND status IN ('delivered', 'shipped')`" })),

        lesson('sql-like-null', 'LIKE e NULL',
          learn('Padrões e valores ausentes', `\`LIKE\` busca padrões em texto:

- \`%\` qualquer sequência de caracteres
- \`_\` exatamente um caractere

~~~
SELECT name FROM customers WHERE name LIKE 'M%';      -- começa com M
SELECT name FROM customers WHERE email LIKE '%.de';   -- termina com .de
~~~

**NULL** significa "sem valor". Ele não é igual a nada, nem a outro NULL. Por isso \`= NULL\` nunca funciona:

~~~
SELECT name FROM customers WHERE email IS NULL;
SELECT name FROM customers WHERE email IS NOT NULL;
~~~`),
          quiz('Quantas rows `WHERE email = NULL` retorna?', ['As que não têm email', 'Todas', 'Nenhuma', 'Dá erro'], 2, 'Comparar com NULL usando `=` nunca dá true. Use `IS NULL`.'),
          code({ title: 'Sem email', task: 'Liste o `name` dos customers que **não têm** email cadastrado.', starter: '-- write your query\n', solution: 'SELECT name FROM customers WHERE email IS NULL;', hint: '`WHERE email IS NULL`' }),
          code({ title: 'Emails alemães', task: 'Liste `name` e `email` dos customers cujo email termina com `.de`.', starter: '-- write your query\n', solution: "SELECT name, email FROM customers WHERE email LIKE '%.de';", hint: "`LIKE '%.de'`" })),

        lesson('sql-order', 'ORDER BY e LIMIT',
          learn('Ordenando e cortando', `~~~
SELECT name, age FROM customers
ORDER BY age DESC;              -- DESC: decrescente (padrão é ASC)

SELECT name FROM customers
ORDER BY country, name          -- desempata pela segunda column
LIMIT 3;                        -- só as 3 primeiras rows
~~~

Ordem das cláusulas: \`SELECT → FROM → WHERE → ORDER BY → LIMIT\`.

\`LIMIT 10 OFFSET 20\` pula 20 rows: é a base de paginação.`),
          quiz('Qual ordem de cláusulas está correta?', ['SELECT ... LIMIT 5 WHERE ...', 'SELECT ... FROM ... ORDER BY ... WHERE ...', 'SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...', 'FROM ... SELECT ... LIMIT ...'], 2, 'WHERE filtra, ORDER BY ordena, LIMIT corta.'),
          predict('Qual nome aparece primeiro?', "SELECT name, age FROM customers\nORDER BY age DESC\nLIMIT 1;", ['O cliente mais novo', 'O cliente mais velho', 'O primeiro cadastrado (id 1)', 'Ordem aleatória'], 1, '`DESC` ordena do maior pro menor, e `LIMIT 1` fica só com o primeiro: o mais velho.'),
          code({ title: 'Os 3 mais velhos', task: 'Mostre `name` e `age` dos **3 customers mais velhos**, do mais velho pro mais novo.', starter: '-- write your query\n', solution: 'SELECT name, age FROM customers ORDER BY age DESC LIMIT 3;', ordered: true, hint: '`ORDER BY age DESC LIMIT 3`' })),

        lesson('sql-distinct-alias', 'DISTINCT e aliases',
          learn('Sem repetição e com nomes melhores', `\`DISTINCT\` remove rows repetidas do resultado:

~~~
SELECT DISTINCT country FROM customers;
~~~

\`AS\` dá um **alias** (apelido) pra column ou tabela:

~~~
SELECT name AS customer, age * 12 AS age_in_months
FROM customers AS c;
~~~

Dá pra fazer contas e juntar textos no SELECT: \`price * 0.9\`, \`name || ' (' || country || ')'\`.`),
          quiz('O que `SELECT DISTINCT status FROM orders` retorna?', ['Todos os status, com repetição', 'Cada status uma única vez', 'O número de status', 'Só o primeiro status'], 1, 'DISTINCT elimina as duplicatas.'),
          code({ title: 'Categorias e preços', task: 'Liste as categorias de produto **sem repetir**, em ordem alfabética, com a column chamada `category`.', starter: '-- write your query\n', solution: 'SELECT DISTINCT category FROM products ORDER BY category;', ordered: true, checkColumns: true, hint: '`SELECT DISTINCT category ... ORDER BY category`' }),
          code({ title: 'Preço com desconto', task: 'Mostre `name` e o preço com 10% de desconto como `sale_price` para todos os produtos.', starter: '-- write your query\n', solution: 'SELECT name, price * 0.9 AS sale_price FROM products;', checkColumns: true, hint: '`price * 0.9 AS sale_price`' }))
      ),

      unit('Agregação',
        lesson('sql-aggregate', 'COUNT, SUM, AVG, MIN, MAX',
          learn('Resumindo dados', `**Aggregate functions** resumem várias rows num valor:

~~~
SELECT COUNT(*) FROM orders;          -- quantas rows
SELECT COUNT(email) FROM customers;   -- quantas com email NÃO nulo
SELECT SUM(amount) FROM orders;
SELECT AVG(age) FROM customers;
SELECT MIN(price), MAX(price) FROM products;
~~~

Combine com WHERE e alias:

~~~
SELECT SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered';
~~~`),
          quiz('Qual a diferença entre `COUNT(*)` e `COUNT(email)`?', ['Nenhuma', 'COUNT(email) ignora rows com email NULL', 'COUNT(*) ignora NULL', 'COUNT(email) conta emails únicos'], 1, '`COUNT(coluna)` só conta valores não nulos.'),
          code({ title: 'Faturamento', task: 'Calcule a soma de `amount` dos orders com status `\'delivered\'`, com a column chamada `revenue`.', starter: '-- write your query\n', solution: "SELECT SUM(amount) AS revenue FROM orders WHERE status = 'delivered';", checkColumns: true, hint: "`SELECT SUM(amount) AS revenue FROM orders WHERE status = 'delivered';`" })),

        lesson('sql-groupby', 'GROUP BY',
          learn('Um resumo por grupo', `\`GROUP BY\` aplica a aggregate **para cada grupo**:

~~~
SELECT country, COUNT(*) AS total
FROM customers
GROUP BY country;
~~~

Regra: toda column no SELECT que não está numa aggregate precisa estar no GROUP BY.`),
          quiz('Em `SELECT status, SUM(amount) FROM orders GROUP BY status`, quantas rows vêm?', ['Uma por pedido', 'Uma por status diferente', 'Uma só', 'Depende do amount'], 1, 'Uma row pra cada grupo.'),
          code({ title: 'Clientes por país', task: 'Mostre cada `country` e quantos customers ele tem, numa column `total`, do país com mais clientes pro com menos (empate: ordem alfabética do país).',
            starter: '-- write your query\n', solution: 'SELECT country, COUNT(*) AS total FROM customers GROUP BY country ORDER BY total DESC, country;', ordered: true, checkColumns: true, hint: '`GROUP BY country ORDER BY total DESC, country`' })),

        lesson('sql-having', 'HAVING',
          learn('Filtrando grupos', `\`WHERE\` filtra **rows antes** de agrupar. \`HAVING\` filtra **grupos depois**:

~~~
SELECT customer_id, SUM(amount) AS spent
FROM orders
WHERE status <> 'canceled'      -- tira pedidos cancelados
GROUP BY customer_id
HAVING SUM(amount) > 500;       -- só quem gastou mais de 500
~~~

Ordem completa: \`SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT\`.`),
          quiz('Onde filtrar "países com mais de 2 clientes"?', ['WHERE COUNT(*) > 2', 'HAVING COUNT(*) > 2', 'LIMIT 2', 'ORDER BY COUNT(*)'], 1, 'Condição sobre a aggregate vai no HAVING.'),
          code({ title: 'Bons clientes', task: 'Ignorando pedidos `\'canceled\'`, mostre `customer_id` e o total gasto como `spent`, só para quem gastou **mais de 200**.',
            starter: '-- write your query\n', solution: "SELECT customer_id, SUM(amount) AS spent FROM orders WHERE status <> 'canceled' GROUP BY customer_id HAVING SUM(amount) > 200;", checkColumns: true, hint: "WHERE pra tirar os cancelados, GROUP BY customer_id, HAVING SUM(amount) > 200." }))
      ),

      unit('JOINs',
        lesson('sql-join', 'INNER JOIN',
          learn('Juntando tables', `Os pedidos guardam só \`customer_id\`. Pra trazer o nome, junte as tables com \`JOIN\`:

~~~
SELECT c.name, o.amount
FROM orders o
JOIN customers c ON c.id = o.customer_id;
~~~

- \`o\` e \`c\` são aliases das tables.
- \`ON\` diz como as rows se conectam (chave estrangeira → chave primária).
- \`JOIN\` (= \`INNER JOIN\`) só traz rows com par nas duas tables.`),
          quiz('O que `ON c.id = o.customer_id` faz?', ['Ordena', 'Liga cada pedido ao seu cliente', 'Filtra o Brasil', 'Cria uma table'], 1, 'É a condição de ligação entre as tables.'),
          code({ title: 'Quem comprou o quê', task: 'Liste o `name` do cliente e o `name` do produto de cada pedido de clientes da `\'Germany\'`. Chame as columns de `customer` e `product`.',
            starter: '-- write your query\n', solution: "SELECT c.name AS customer, p.name AS product FROM orders o JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = o.product_id WHERE c.country = 'Germany';", checkColumns: true,
            hint: 'Dois JOINs: `customers c ON c.id = o.customer_id` e `products p ON p.id = o.product_id`.' })),

        lesson('sql-left-join', 'LEFT JOIN',
          learn('Incluindo quem não tem par', `\`LEFT JOIN\` mantém **todas** as rows da table da esquerda, mesmo sem par. Onde não há par, as columns da direita vêm \`NULL\`:

~~~
SELECT c.name, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
~~~

Truque clássico: achar quem **não tem** par:

~~~
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;      -- clientes sem nenhum pedido
~~~`),
          quiz('No LEFT JOIN, o que vem nas columns da direita quando não há par?', ['0', "''", 'NULL', 'A row é removida'], 2, 'Sem par, a direita vem NULL.'),
          code({ title: 'Produtos encalhados', task: 'Liste o `name` dos produtos que **nunca** foram pedidos.', starter: '-- write your query\n', solution: 'SELECT p.name FROM products p LEFT JOIN orders o ON o.product_id = p.id WHERE o.id IS NULL;', hint: '`LEFT JOIN orders` e `WHERE o.id IS NULL`.' }),
          code({ title: 'Pedidos por cliente', task: 'Mostre o `name` de **todos** os customers e quantos pedidos cada um fez como `orders_count` (inclusive quem fez 0).',
            starter: '-- write your query\n', solution: 'SELECT c.name, COUNT(o.id) AS orders_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;', checkColumns: true,
            hint: 'LEFT JOIN + `COUNT(o.id)` (não `COUNT(*)`, que contaria 1 pra quem não tem pedido).' })),

        lesson('sql-multi-join', 'JOINs com agregação',
          learn('Perguntas de negócio', `A maioria das perguntas reais combina JOIN + GROUP BY:

~~~
SELECT p.category, SUM(o.amount) AS revenue
FROM orders o
JOIN products p ON p.id = o.product_id
WHERE o.status <> 'canceled'
GROUP BY p.category
ORDER BY revenue DESC;
~~~

Monte em etapas: primeiro o JOIN, confira as rows; depois agrupe.`),
          quiz('Em qual etapa o WHERE é aplicado numa query com JOIN e GROUP BY?', ['Depois do GROUP BY', 'Antes do GROUP BY, nas rows já juntadas', 'Antes do JOIN', 'No final, depois do ORDER BY'], 1, 'FROM/JOIN montam as rows, WHERE filtra, depois GROUP BY agrupa.'),
          code({ title: 'Faturamento por categoria', task: 'Ignorando pedidos cancelados, mostre cada `category` e o faturamento como `revenue`, do maior pro menor.',
            starter: '-- write your query\n', solution: "SELECT p.category, SUM(o.amount) AS revenue FROM orders o JOIN products p ON p.id = o.product_id WHERE o.status <> 'canceled' GROUP BY p.category ORDER BY revenue DESC;", ordered: true, checkColumns: true,
            hint: "JOIN products, `WHERE o.status <> 'canceled'`, `GROUP BY p.category`, `ORDER BY revenue DESC`." })),

        lesson('sql-self-join', 'Self join',
          learn('Uma table com ela mesma', `Às vezes uma table aponta pra si mesma. Em \`employees\`, \`manager_id\` é o id de outro employee. Pra mostrar o nome do gestor, junte a table com ela mesma usando aliases diferentes:

~~~
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
~~~

O LEFT JOIN mantém quem não tem gestor (os chefes de departamento).`),
          quiz('Por que usar aliases diferentes (`e` e `m`) no self join?', ['É opcional', 'Pra distinguir as duas "cópias" da mesma table', 'Pra deixar mais rápido', 'Porque JOIN exige'], 1, 'Sem aliases distintos, o banco não sabe de qual lado é cada column.'),
          code({ db: 'hr', title: 'Quem é o gestor', task: 'Liste cada employee e o nome do gestor, com as columns `employee` e `manager`. Quem não tem gestor deve aparecer com `manager` NULL.',
            starter: '-- write your query\n', solution: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id;', checkColumns: true, hint: '`FROM employees e LEFT JOIN employees m ON m.id = e.manager_id`' }))
      ),

      unit('Subqueries e CTEs',
        lesson('sql-subquery', 'Subqueries',
          learn('Query dentro de query', `Uma **subquery** é um SELECT dentro de outro:

~~~
-- produtos mais caros que a média
SELECT name, price FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- clientes que já compraram
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders);
~~~

Também existe \`EXISTS\`, que testa se a subquery retorna alguma row:

~~~
SELECT name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
~~~`),
          quiz('O que `(SELECT AVG(price) FROM products)` retorna?', ['Uma table inteira', 'Um único valor', 'Uma lista de preços', 'Nada'], 1, 'É uma subquery escalar: um valor só, usado na comparação.'),
          code({ db: 'hr', title: 'Acima da média', task: 'Liste `name` e `salary` dos employees que ganham **mais que a média** da empresa.', starter: '-- write your query\n', solution: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);', hint: '`WHERE salary > (SELECT AVG(salary) FROM employees)`' })),

        lesson('sql-subquery-correlated', 'Subqueries correlacionadas',
          learn('Subquery que olha pra fora', `Uma subquery **correlacionada** usa columns da query de fora, então roda "uma vez por row":

~~~
-- quem ganha mais que a média do PRÓPRIO departamento
SELECT e.name, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(x.salary) FROM employees x WHERE x.dept_id = e.dept_id
);
~~~

Também dá pra usar subquery no FROM, como uma table temporária (**derived table**):

~~~
SELECT AVG(total) FROM (
  SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id
) AS t;
~~~`),
          quiz('O que torna uma subquery "correlacionada"?', ['Ter JOIN', 'Usar uma column da query de fora', 'Estar no FROM', 'Usar GROUP BY'], 1, 'Ela depende da row atual da query externa.'),
          code({ db: 'hr', title: 'Maior salário do departamento', task: 'Liste `name`, `dept_id` e `salary` de quem tem o **maior salário do próprio departamento**.',
            starter: '-- write your query\n', solution: 'SELECT e.name, e.dept_id, e.salary FROM employees e WHERE e.salary = (SELECT MAX(x.salary) FROM employees x WHERE x.dept_id = e.dept_id);', hint: '`WHERE e.salary = (SELECT MAX(x.salary) FROM employees x WHERE x.dept_id = e.dept_id)`' })),

        lesson('sql-cte', 'CTEs com WITH',
          learn('Queries legíveis', `Uma **CTE** (Common Table Expression) dá nome a uma subquery, deixando a query principal limpa:

~~~
WITH spending AS (
  SELECT customer_id, SUM(amount) AS total
  FROM orders
  WHERE status <> 'canceled'
  GROUP BY customer_id
)
SELECT c.name, s.total
FROM spending s
JOIN customers c ON c.id = s.customer_id
ORDER BY s.total DESC;
~~~

Dá pra encadear várias: \`WITH a AS (...), b AS (...) SELECT ...\`. Em análises de dados, CTEs são o padrão.`),
          quiz('Qual a principal vantagem de uma CTE?', ['É sempre mais rápida', 'Organiza a query em etapas com nome', 'Cria uma table permanente', 'Substitui índices'], 1, 'Legibilidade: cada etapa ganha um nome.'),
          code({ title: 'Top 3 clientes', task: 'Usando uma CTE `spending` (total gasto por cliente, sem pedidos cancelados), mostre `name` e `total` dos **3 clientes que mais gastaram**, do maior pro menor.',
            starter: 'WITH spending AS (\n  -- your code\n)\nSELECT ...\n', solution: "WITH spending AS (\n  SELECT customer_id, SUM(amount) AS total FROM orders WHERE status <> 'canceled' GROUP BY customer_id\n)\nSELECT c.name, s.total FROM spending s JOIN customers c ON c.id = s.customer_id ORDER BY s.total DESC LIMIT 3;",
            ordered: true, checkColumns: true, requires: [['Usa WITH', '^\\s*WITH\\b']], hint: 'Na CTE, agrupe por customer_id; fora, JOIN customers, ORDER BY total DESC LIMIT 3.' }))
      )
    ]
  });
})(globalThis.TD = globalThis.TD || {});
