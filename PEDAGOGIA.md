# Método Trilha

Este é o jeito de ensinar do Trilha Dev. Ele vale para **todas** as linguagens, inclusive as que forem adicionadas no futuro. O motor (`codigo-fonte/src/pedagogy.js`) aplica as regras automaticamente. O validador (`node codigo-fonte/test/lint.mjs`) barra conteúdo que quebra as regras.

## O que a pesquisa diz, e o que o app faz com isso

| Evidência | No app |
|---|---|
| **Carga cognitiva / microlições** (Mimo, Duolingo): pouco conteúdo novo por vez. | A teoria é cortada em cards de até ~70 palavras (máx. 90). Cada card aparece só quando você pede ("Próximo"), sempre com um exemplo de código. |
| **PRIMM** (Sentance, Waite & Kallia, 2019): Predict → Run → Investigate → Modify → Make. Nas turmas que usaram o método, os alunos foram melhor que o grupo de controle. | Passos `predict`: você lê um código e prevê o resultado **antes** de escrever o seu. |
| **Exemplos com subobjetivos** (Margulieux, Morrison & Decker): rotular as etapas de uma solução melhora a transferência. | Na 1ª unidade de cada curso, o starter vem com comentários numerados (`// 1. ...`, `// 2. ...`). |
| **Parsons problems** (Ericson; Hou & Ericson): montar a solução com blocos embaralhados ensina tanto quanto escrever, só que em menos tempo. | Modo **Blocos** nos exercícios. É o padrão na 1ª unidade, e depois fica como ajuda quando você erra. Depois de acertar com blocos, aparece "Escrever do zero". |
| **Mensagens de erro explicadas** (Becker, 2016). | Painel "O que esse erro quer dizer", em português. O erro original continua visível. |
| **Prática de recuperação espaçada** (efeito de teste + espaçamento). | Cada quiz, predict e exercício entra na revisão com intervalos de 1, 3, 7, 14, 30 e 60 dias. Se você erra, o item volta para o começo. |
| **Intercalação** (Rohrer: 72% vs 38% num ensaio randomizado). | A "Revisão do dia" mistura itens de cursos e assuntos diferentes. |
| **Exercícios por nível** (Curso em Vídeo, Guanabara). | Um checkpoint (◆) no fim de cada unidade, com 6 perguntas e 2 montagens. Você precisa de 70% para liberar a próxima unidade. |
| **Tutor socrático**. | O tutor IA faz perguntas e dá pistas em vez de entregar a resposta. |

## Regras para escrever conteúdo (qualquer linguagem)

1. **Um conceito por card.** Use parágrafos curtos com 1 exemplo cada. Sem parede de texto.
2. **Nada antes da hora.** Um exercício só pode usar o que já foi ensinado (ex.: nada de `function` antes do módulo de Functions).
3. **Toda lição** começa com `learn` e tem pelo menos 1 `quiz` ou `predict`. Projetos finais (`*-final`) são a exceção.
4. **Ordem dentro da lição:** card → predict/quiz → exercício pequeno → próximo card. Alterne, não acumule.
5. **Exercícios** têm `hint`, testes e um `solution` que passa. O `starter` precisa falhar.
6. **1ª unidade:** starter com passos numerados em comentários (`//`, `--` ou `<!-- -->`).
7. **Termos técnicos em inglês** (string, array, function, query...). As explicações ficam em português.
8. **IDs de lição são estáveis:** nunca renomeie um ID, porque isso quebra o progresso salvo.

## Adicionando uma linguagem nova

1. Crie `src/content/<lang>1.js` usando os helpers `learn`, `quiz`, `predict`, `code`, `lesson` e `unit` de `_base.js`.
2. Use um runner que já existe (`js`, `ts`, `sql`, `web`/`dom`, `react`, `git`, `text`) ou adicione um novo em `src/runners.js` / `src/gitsim.js`. O motor pedagógico funciona sozinho: cards, blocos, revisão e checkpoint são gerados automaticamente.
3. Se a linguagem tiver erros próprios, adicione um dicionário em `explainError` (`pedagogy.js`).
4. Rode `node build.mjs`, depois `node test/lint.mjs`, depois `python3 test/check.py`.

## Runners disponíveis

| Runner | O que roda | Testes recebem |
|---|---|---|
| `js` | Web Worker | variáveis do código, `__logs` |
| `ts` | compilador TypeScript + JS | idem + `typeTests` |
| `sql` | SQLite (sql.js) | compara com o resultado da `solution` |
| `web` / `dom` | iframe | `$`, `$$`, `css`, `rules()`, `wait` |
| `react` | React 18 + JSX (via TypeScript) em iframe | `$`, `$$`, `text`, `click`, `type`, `submit`, `wait` |
| `git` | terminal Git simulado (`gitsim.js`) | `repo`, `files`, `commits`, `branch`, `remote`, `used(re)`, `clean`... |
| `text` | escrita livre (inglês, carreira) | `text`, `lines`, `words`, `has(w)`; sem modo blocos |

## Fontes

- Sentance, Waite & Kallia (2019), *Teaching computer programming with PRIMM: a sociocultural perspective*.
- Margulieux, Morrison & Decker: subgoal labels em worked examples.
- Ericson, Margulieux & Rick (2017); Hou & Ericson: Parsons problems.
- Becker et al. (2016), *Effective compiler error message enhancement for novice programming students*.
- Rohrer, Dedrick & Stershic (2015), *Interleaved practice improves mathematics learning*.
- Formatos de Mimo, Codecademy, Boot.dev e do Curso em Vídeo (Gustavo Guanabara).
