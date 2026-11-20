/* SQL — módulos 5 a 8: expressões, alterando dados, modelagem, avançado */
(function (TD) {
  'use strict';
  const { learn, quiz, code, lesson, unit } = TD.C;
  const sql = TD.courses.find((c) => c.id === 'sql');

  sql.units.push(
    unit('Expressões',
      lesson('sql-case', 'CASE',
        learn('if/else dentro do SQL', `\`CASE\` cria valores condicionais:

~~~
SELECT name, price,
  CASE
    WHEN price >= 500 THEN 'premium'
    WHEN price >= 100 THEN 'mid'
    ELSE 'budget'
  END AS tier
FROM products;
~~~

Combinado com agregação, faz contagens condicionais (pivot simples):

~~~
SELECT
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
  SUM(CASE WHEN status = 'canceled'  THEN 1 ELSE 0 END) AS canceled
FROM orders;
~~~`),
          quiz('Se nenhum WHEN bate e não há ELSE, o CASE retorna o quê?', ["''", '0', 'NULL', 'Dá erro'], 2, 'Sem ELSE, o resultado é NULL.'),
          code({ title: 'Faixa etária', task: 'Mostre `name` e uma column `age_group` com: `\'young\'` (menos de 30), `\'adult\'` (30 a 49) e `\'senior\'` (50+).',
            starter: '-- write your query\n', solution: "SELECT name, CASE WHEN age < 30 THEN 'young' WHEN age < 50 THEN 'adult' ELSE 'senior' END AS age_group FROM customers;", checkColumns: true, hint: 'Teste do menor pro maior: `WHEN age < 30 THEN ... WHEN age < 50 THEN ... ELSE ...`.' })),

        lesson('sql-functions', 'Funções de texto e COALESCE',
          learn('Tratando valores', `Funções úteis (SQLite; os nomes são parecidos em outros bancos):

~~~
UPPER(name), LOWER(name)
LENGTH(name)
SUBSTR(name, 1, 3)               -- 3 caracteres a partir do 1º
TRIM(text)
REPLACE(email, '@mail', '@corp')
name || ' - ' || country          -- concatenação (CONCAT em outros bancos)
ROUND(price * 1.1, 2)
COALESCE(email, 'no email')       -- primeiro valor não nulo
~~~

\`COALESCE\` é a forma padrão de trocar NULL por um valor padrão.`),
          quiz('O que `COALESCE(NULL, NULL, \'x\')` retorna?', ['NULL', "'x'", 'Erro', "''"], 1, 'Retorna o primeiro argumento não nulo.'),
          code({ title: 'Contatos', task: 'Mostre `name` em maiúsculas como `customer` e o email como `contact`, trocando email nulo por `\'no email\'`.',
            starter: '-- write your query\n', solution: "SELECT UPPER(name) AS customer, COALESCE(email, 'no email') AS contact FROM customers;", checkColumns: true, hint: "`UPPER(name) AS customer, COALESCE(email, 'no email') AS contact`" })),

        lesson('sql-dates', 'Datas',
          learn('Trabalhando com tempo', `No SQLite, datas costumam ser texto ISO (\`'2026-03-15'\`), que ordena certinho. Funções:

~~~
date('now')                         -- hoje
strftime('%Y', created_at)          -- ano: '2026'
strftime('%Y-%m', created_at)       -- ano-mês: '2026-03'
date(created_at, '+30 days')        -- soma dias
julianday('2026-12-25') - julianday('2026-12-20')   -- diferença: 5.0
~~~

Em PostgreSQL o equivalente é \`EXTRACT(YEAR FROM ...)\`, \`DATE_TRUNC('month', ...)\` e \`+ INTERVAL '30 days'\`. O raciocínio é o mesmo.`),
          quiz("O que `strftime('%m', '2026-04-30')` retorna?", ["'04'", "'30'", "'2026'", '4'], 0, '`%m` é o mês com dois dígitos.'),
          code({ title: 'Vendas por mês', task: 'Ignorando cancelados, mostre o mês (`\'YYYY-MM\'`) como `month` e a soma de `amount` como `revenue`, em ordem cronológica.',
            starter: '-- write your query\n', solution: "SELECT strftime('%Y-%m', created_at) AS month, SUM(amount) AS revenue FROM orders WHERE status <> 'canceled' GROUP BY month ORDER BY month;", ordered: true, checkColumns: true, hint: "`strftime('%Y-%m', created_at) AS month` e `GROUP BY month`." }))
    ),

    unit('Alterando dados',
      lesson('sql-insert', 'INSERT',
        learn('Adicionando rows', `~~~
INSERT INTO customers (id, name, country, age)
VALUES (11, 'Lea Braun', 'Austria', 27);

-- várias de uma vez
INSERT INTO products (id, name, category, price) VALUES
  (9, 'USB Hub', 'Peripherals', 25.0),
  (10, 'Mic', 'Audio', 99.0);
~~~

Sempre liste as columns: o código continua funcionando se a table ganhar columns novas. Columns omitidas recebem NULL (ou o DEFAULT).`),
        quiz('Por que listar as columns no INSERT?', ['É obrigatório', 'Deixa explícito e não quebra se a table mudar', 'Fica mais rápido', 'Pra evitar NULL'], 1, 'Sem a lista, o INSERT depende da ordem exata de todas as columns.'),
        code({ title: 'Novo cliente', task: 'Insira o customer `id 11`, `name \'Lea Braun\'`, `country \'Austria\'`, `city \'Vienna\'`, `age 27` (sem email).',
          starter: '-- write your INSERT\n', solution: "INSERT INTO customers (id, name, country, city, age) VALUES (11, 'Lea Braun', 'Austria', 'Vienna', 27);",
          check: 'SELECT id, name, country, city, age, email FROM customers ORDER BY id;', ordered: true, hint: 'Liste as 5 columns e os 5 valores na mesma ordem.' })),

      lesson('sql-update-delete', 'UPDATE e DELETE',
        learn('Alterando e apagando', `~~~
UPDATE customers
SET age = 30, city = 'Campinas'
WHERE id = 1;

DELETE FROM orders
WHERE status = 'canceled';
~~~

**Muito cuidado**: \`UPDATE\` ou \`DELETE\` sem \`WHERE\` afeta **todas** as rows. Dica profissional: escreva primeiro um \`SELECT\` com o mesmo WHERE, confira as rows, e só então troque por UPDATE/DELETE.`),
        quiz('O que `DELETE FROM orders;` faz?', ['Nada, falta WHERE', 'Apaga a table', 'Apaga todas as rows da table', 'Dá erro'], 2, 'Sem WHERE, apaga todas as rows (a table continua existindo).'),
        code({ title: 'Faxina', task: 'Faça duas coisas:\n\n1. Aumente em 10% o `price` de todos os produtos da categoria `\'Audio\'`.\n2. Apague os orders com status `\'canceled\'`.',
          starter: '-- 1. UPDATE\n\n-- 2. DELETE\n', solution: "UPDATE products SET price = price * 1.1 WHERE category = 'Audio';\nDELETE FROM orders WHERE status = 'canceled';",
          check: "SELECT (SELECT GROUP_CONCAT(ROUND(price, 2), ',') FROM (SELECT price FROM products ORDER BY id)) AS prices, (SELECT COUNT(*) FROM orders) AS orders_left, (SELECT COUNT(*) FROM orders WHERE status = 'canceled') AS canceled_left;",
          hint: "`SET price = price * 1.1 WHERE category = 'Audio'` e `DELETE FROM orders WHERE status = 'canceled'`." })),

      lesson('sql-transactions', 'Transações',
        learn('Tudo ou nada', `Uma **transaction** agrupa comandos que precisam acontecer juntos. Ou tudo dá certo (\`COMMIT\`), ou nada fica (\`ROLLBACK\`):

~~~
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
~~~

Se o sistema cair entre os dois UPDATEs sem transaction, o dinheiro some. Com transaction, o banco garante **ACID**: Atomicidade, Consistência, Isolamento e Durabilidade.

Constraints (como \`CHECK (balance >= 0)\`) ajudam: se uma operação violar a regra, ela falha e você faz rollback.`),
        quiz('O que o ROLLBACK faz?', ['Confirma as mudanças', 'Desfaz tudo desde o BEGIN', 'Apaga a table', 'Repete a transação'], 1, 'Volta o banco ao estado de antes do BEGIN.'),
        code({ db: 'bank', title: 'Transferência', task: 'Numa transaction, transfira **150** da conta da `Ana` (id 1) pra conta da `Marta` (id 3).',
          starter: '-- BEGIN; ... COMMIT;\n', solution: 'BEGIN;\nUPDATE accounts SET balance = balance - 150 WHERE id = 1;\nUPDATE accounts SET balance = balance + 150 WHERE id = 3;\nCOMMIT;',
          check: 'SELECT id, owner, balance FROM accounts ORDER BY id;', ordered: true, requires: [['Usa BEGIN e COMMIT', '\\bBEGIN\\b[\\s\\S]*\\bCOMMIT\\b']], hint: 'Dois UPDATEs entre `BEGIN;` e `COMMIT;`.' }))
    ),

    unit('Modelagem',
      lesson('sql-create-table', 'CREATE TABLE',
        learn('Criando tables', `~~~
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
~~~

- **PRIMARY KEY**: identifica cada row de forma única.
- **NOT NULL**: obrigatório.
- **DEFAULT**: valor quando não informado.
- Tipos comuns: \`INTEGER\`, \`REAL\`, \`TEXT\`, \`BLOB\` (no PostgreSQL: \`SERIAL\`, \`NUMERIC\`, \`VARCHAR\`, \`BOOLEAN\`, \`TIMESTAMP\`...).

Pra mudar depois: \`ALTER TABLE tasks ADD COLUMN priority INTEGER;\`. Pra apagar: \`DROP TABLE tasks;\`.`),
        quiz('O que PRIMARY KEY garante?', ['Que a column é a primeira', 'Que cada valor é único e identifica a row', 'Que o valor é positivo', 'Que a table é ordenada'], 1, 'Chave primária: única e não nula.'),
        code({ title: 'Tabela de cursos', task: 'Crie a table `courses` com:\n\n- `id` INTEGER PRIMARY KEY\n- `title` TEXT NOT NULL\n- `hours` INTEGER NOT NULL\n- `level` TEXT',
          starter: '-- CREATE TABLE courses (...)\n', solution: 'CREATE TABLE courses (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  hours INTEGER NOT NULL,\n  level TEXT\n);',
          check: "SELECT name, UPPER(type) AS type, \"notnull\", pk FROM pragma_table_info('courses') ORDER BY cid;", ordered: true, hint: 'Uma column por linha, separadas por vírgula.' })),

      lesson('sql-constraints', 'Chaves estrangeiras e constraints',
        learn('Regras no próprio banco', `**Foreign key** garante que uma referência aponta pra algo que existe:

~~~
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  UNIQUE (product_id, id)
);
~~~

- \`REFERENCES\`: chave estrangeira
- \`CHECK\`: regra de validação
- \`UNIQUE\`: sem valores repetidos

**Normalização**: não repita dados. Em vez de guardar o nome do cliente em cada pedido, guarde o \`customer_id\` e faça JOIN. Se o nome mudar, muda num lugar só.`),
        quiz('Por que guardar `customer_id` no pedido em vez do nome do cliente?', ['Ocupa menos espaço só', 'Evita duplicação e inconsistência (normalização)', 'Porque nomes não podem ser texto', 'É obrigatório no SQL'], 1, 'Um dado, um lugar: atualizações não deixam versões conflitantes.'),
        code({ title: 'Avaliações', task: 'Crie a table `reviews` com:\n\n- `id` INTEGER PRIMARY KEY\n- `product_id` INTEGER NOT NULL, chave estrangeira pra `products(id)`\n- `rating` INTEGER NOT NULL com `CHECK` entre 1 e 5\n- `comment` TEXT',
          starter: '-- CREATE TABLE reviews (...)\n', solution: 'CREATE TABLE reviews (\n  id INTEGER PRIMARY KEY,\n  product_id INTEGER NOT NULL REFERENCES products(id),\n  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),\n  comment TEXT\n);',
          check: "SELECT (SELECT GROUP_CONCAT(name || ':' || UPPER(type) || ':' || \"notnull\", ',') FROM pragma_table_info('reviews')) AS columns, (SELECT COUNT(*) FROM pragma_foreign_key_list('reviews') WHERE \"table\" = 'products') AS fks, (SELECT sql LIKE '%CHECK%' FROM sqlite_master WHERE name = 'reviews') AS has_check;",
          hint: '`product_id INTEGER NOT NULL REFERENCES products(id)` e `rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)`.' })),

      lesson('sql-indexes', 'Índices',
        learn('Deixando consultas rápidas', `Sem índice, buscar \`WHERE customer_id = 8\` lê a table inteira (**full scan**). Um **índice** é como o índice remissivo de um livro:

~~~
CREATE INDEX idx_orders_customer ON orders (customer_id);
~~~

- Primary keys já têm índice.
- Indexe columns muito usadas em WHERE, JOIN e ORDER BY.
- Índices custam: ocupam espaço e deixam INSERT/UPDATE um pouco mais lentos.

Pra ver o plano de execução: \`EXPLAIN QUERY PLAN SELECT ...\` (no PostgreSQL: \`EXPLAIN ANALYZE\`). "SCAN" = leu tudo; "SEARCH ... USING INDEX" = usou índice.`),
        quiz('Qual a desvantagem de criar índices demais?', ['Nenhuma', 'Escritas mais lentas e mais espaço', 'SELECTs mais lentos', 'Perda de dados'], 1, 'Cada índice precisa ser atualizado a cada escrita.'),
        code({ title: 'Indexando pedidos', task: 'Crie um índice na column `customer_id` da table `orders` (o nome do índice é livre).',
          starter: '-- CREATE INDEX ...\n', solution: 'CREATE INDEX idx_orders_customer ON orders (customer_id);',
          check: "SELECT ii.name AS col FROM pragma_index_list('orders') il JOIN pragma_index_info(il.name) ii WHERE il.origin = 'c' ORDER BY col;", hint: '`CREATE INDEX nome ON orders (customer_id);`' })),

      lesson('sql-views', 'Views',
        learn('Queries com nome permanente', `Uma **view** salva uma query com nome. Você consulta como se fosse uma table:

~~~
CREATE VIEW active_orders AS
SELECT * FROM orders WHERE status IN ('pending', 'shipped');

SELECT COUNT(*) FROM active_orders;
~~~

Views escondem complexidade (JOINs, filtros) e dão uma interface estável pra relatórios. Os dados não são copiados: a query roda toda vez.`),
        quiz('Uma view guarda os dados?', ['Sim, é uma cópia', 'Não, guarda a query; os dados vêm das tables na hora', 'Só se tiver índice', 'Só no PostgreSQL'], 1, 'Views comuns são queries salvas. (Existem "materialized views", que guardam.)'),
        code({ title: 'Resumo de clientes', task: 'Crie a view `customer_totals` com `customer_id` e `total` (soma de `amount` dos pedidos não cancelados) por cliente.',
          starter: '-- CREATE VIEW customer_totals AS ...\n', solution: "CREATE VIEW customer_totals AS\nSELECT customer_id, SUM(amount) AS total FROM orders WHERE status <> 'canceled' GROUP BY customer_id;",
          check: 'SELECT customer_id, ROUND(total, 2) FROM customer_totals ORDER BY customer_id;', ordered: true, hint: '`CREATE VIEW customer_totals AS SELECT customer_id, SUM(amount) AS total ...`' }))
    ),

    unit('Avançado',
      lesson('sql-window', 'Window functions',
        learn('Agregar sem perder as rows', `**Window functions** calculam sobre um grupo de rows, mas mantêm cada row no resultado:

~~~
SELECT name, dept_id, salary,
  AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg,
  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank_in_dept
FROM employees;
~~~

- \`OVER (...)\` define a "janela".
- \`PARTITION BY\` = grupos (como GROUP BY, mas sem juntar rows).
- Ranking: \`ROW_NUMBER()\` (1,2,3), \`RANK()\` (1,1,3 em empates), \`DENSE_RANK()\` (1,1,2).

São muito cobradas em entrevistas de dados.`),
        quiz('Qual a diferença entre GROUP BY e PARTITION BY?', ['Nenhuma', 'GROUP BY junta as rows; PARTITION BY calcula por grupo mantendo cada row', 'PARTITION BY é mais rápido', 'GROUP BY não aceita SUM'], 1, 'Window functions não colapsam as rows.'),
        code({ db: 'hr', title: 'Ranking por departamento', task: 'Mostre `name`, `dept_id`, `salary` e `rank_in_dept` (posição do salário dentro do departamento, maior = 1, usando `RANK()`).',
          starter: '-- write your query\n', solution: 'SELECT name, dept_id, salary, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank_in_dept FROM employees;', checkColumns: true,
          requires: [['Usa OVER', '\\bOVER\\s*\\(']], hint: '`RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank_in_dept`' })),

      lesson('sql-running-total', 'Totais acumulados',
        learn('Somas que crescem', `Com \`ORDER BY\` dentro do \`OVER\`, a soma vira **acumulada**:

~~~
SELECT created_at, amount,
  SUM(amount) OVER (ORDER BY created_at) AS running_total
FROM orders;
~~~

Outras funções úteis:

- \`LAG(amount) OVER (ORDER BY created_at)\`: valor da row anterior (comparar com o mês passado)
- \`LEAD(...)\`: valor da próxima row
- \`AVG(...) OVER (ORDER BY d ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)\`: média móvel`),
        quiz('O que `LAG(amount)` retorna na primeira row?', ['0', 'NULL', 'O próprio amount', 'Erro'], 1, 'Não existe row anterior: NULL.'),
        code({ title: 'Faturamento acumulado', task: 'Para os pedidos **delivered**, mostre `id`, `created_at`, `amount` e `running_total` (soma acumulada de amount em ordem de `created_at`), ordenado por `created_at`.',
          starter: '-- write your query\n', solution: "SELECT id, created_at, amount, SUM(amount) OVER (ORDER BY created_at) AS running_total FROM orders WHERE status = 'delivered' ORDER BY created_at;", ordered: true, checkColumns: true,
          hint: '`SUM(amount) OVER (ORDER BY created_at) AS running_total`' })),

      lesson('sql-union', 'UNION',
        learn('Empilhando resultados', `\`UNION\` empilha o resultado de duas queries (mesmo número de columns, tipos compatíveis):

~~~
SELECT name, 'customer' AS type FROM customers WHERE country = 'Germany'
UNION
SELECT name, 'employee' AS type FROM employees;
~~~

- \`UNION\` remove duplicatas.
- \`UNION ALL\` mantém tudo (e é mais rápido).

Também existem \`INTERSECT\` (o que está nas duas) e \`EXCEPT\` (o que está na primeira e não na segunda).`),
        quiz('Qual a diferença entre UNION e UNION ALL?', ['Nenhuma', 'UNION remove duplicatas; UNION ALL mantém', 'UNION ALL remove duplicatas', 'UNION só aceita 2 queries'], 1, 'UNION faz um DISTINCT no resultado.'),
        code({ title: 'Cidades', task: 'Liste todas as cidades (sem repetir) que aparecem em customers do país `\'Germany\'` **ou** em pedidos com status `\'pending\'` (cidade do cliente do pedido). Uma column: `city`.',
          starter: '-- write your query\n', solution: "SELECT city FROM customers WHERE country = 'Germany'\nUNION\nSELECT c.city FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending';", checkColumns: true,
          requires: [['Usa UNION', '\\bUNION\\b']], hint: 'Duas queries com uma column `city` cada, juntas por `UNION`.' })),

      lesson('sql-final', 'Projeto final: relatório de vendas',
        learn('Analista de dados por um dia', `Seu chefe quer um relatório por país com:

- quantos clientes compraram
- faturamento (sem cancelados)
- ticket médio (faturamento / número de pedidos)

Monte em etapas com CTEs, confira cada uma, e só então junte. Arredonde valores com \`ROUND(x, 2)\`.`),
        code({ title: 'Relatório por país', task: 'Ignorando pedidos cancelados, mostre por `country`:\n\n- `buyers`: clientes distintos que compraram\n- `revenue`: soma de amount, `ROUND(..., 2)`\n- `avg_ticket`: média de amount por pedido, `ROUND(..., 2)`\n\nOrdene por `revenue` decrescente.',
          starter: '-- write your query\n', solution: "WITH valid AS (\n  SELECT o.*, c.country FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status <> 'canceled'\n)\nSELECT country, COUNT(DISTINCT customer_id) AS buyers, ROUND(SUM(amount), 2) AS revenue, ROUND(AVG(amount), 2) AS avg_ticket\nFROM valid GROUP BY country ORDER BY revenue DESC;",
          ordered: true, checkColumns: true, hint: '`COUNT(DISTINCT customer_id)`, `ROUND(SUM(amount), 2)` e `ROUND(AVG(amount), 2)`, agrupando por country depois do JOIN.' }))
    )
  );
})(globalThis.TD = globalThis.TD || {});
