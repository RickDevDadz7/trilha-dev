# Trilha Dev

**Instalador para Windows:** [Trilha-Dev-Setup.exe](https://github.com/RickDevDadz7/trilha-dev/releases/latest/download/Trilha-Dev-Setup.exe) (o Windows pode avisar "O Windows protegeu o computador": *Mais informações* → *Executar assim mesmo*).

**App no navegador:** https://rickdevdadz7.github.io/trilha-dev/ — abra no Chrome ou Edge do computador e clique em **Instalar** (ícone na barra de endereço). Ele vira um programa com ícone próprio, abre em janela separada e funciona offline.

App pra aprender programação do zero ao avançado, no estilo Mimo/Duolingo, com visual cyberpunk.

**8 trilhas · 173 lições · 189 exercícios com correção automática** · funciona no PC e no celular

| Trilha | Módulos | Do básico ao avançado |
|---|---|---|
| JavaScript | 12 | fundamentos, functions, arrays, objects, regex e datas, classes, erros, async/await e fetch, DOM e eventos, módulos e npm, Map/Set, recursão, generators, debounce, algoritmos |
| TypeScript | 8 | tipos básicos, interfaces, unions e narrowing, generics, utility types, classes, mapped/conditional/template literal types, async e type guards |
| SQL | 8 | SELECT, filtros, agregação, JOINs, subqueries e CTEs, CASE e datas, INSERT/UPDATE/DELETE, transações, modelagem, índices, views, window functions |
| HTML & CSS | 9 | HTML semântico, acessibilidade, formulários e validação, cascata, box model, position, Flexbox, Grid, responsivo, variáveis, animações |
| React | 4 | components, JSX, props, state, eventos, formulários, listas e key, useEffect, dados assíncronos, projeto final (todo app) |
| Git & GitHub | 5 | commits, staging, histórico, restore/amend/revert, .gitignore, branches, merge, conflitos, stash, remote, push/pull, pull requests, Conventional Commits |
| Inglês pra devs | 3 | vocabulário de documentação, falsos cognatos, PR, bug report, daily, entrevista (pitch, STAR, live coding) |
| Carreira na Europa | 4 | Blue Card e Chancenkarte, CV alemão, LinkedIn, portfólio e README, candidatura e cover letter |

Explicações em português; código e termos técnicos em inglês, como no mercado.

## Como os exercícios funcionam

Tudo roda no próprio app, sem servidor:

- **JavaScript**: Web Worker isolado, com suporte a `async/await` e timeout pra loop infinito.
- **TypeScript**: o compilador oficial (5.4, modo `strict`) checa os tipos, inclusive testes de tipo escondidos (`Expect<Equal<...>>`), e depois o código roda.
- **SQL**: SQLite (sql.js) com bancos de exemplo; o resultado é comparado com o da solução de referência.
- **HTML/CSS e DOM**: a página é renderizada num iframe e os testes leem os estilos computados de verdade.
- **React**: React 18 de verdade; o JSX é compilado no navegador e os testes clicam e digitam no app.
- **Git**: um terminal simulado com repositório em memória (commits, branches, merge com conflito, remote, push/pull).
- **Inglês e carreira**: você escreve o texto e o app confere a estrutura (seções, palavras-chave, tamanho).

O método de ensino (microlições, PRIMM, blocos de Parsons, revisão espaçada, checkpoints) está em [PEDAGOGIA.md](PEDAGOGIA.md).

Travou? O **tutor de IA** dá dicas sem entregar a resposta. Dentro do Claude, usa sua conta; fora dele, sua própria chave da API (fica só no aparelho).

## Onde usar

1. **No Claude.ai**: artifact privado; progresso salvo na sua conta.
2. **No navegador**: GitHub Pages (`https://rickdevdadz7.github.io/trilha-dev/`), instalável como app e funcionando offline. Ative em *Settings → Pages → Branch `main` / root*.
3. **No PC** (Electron): progresso em arquivo no computador.

## Dados e backups

Mesmo modelo do Deutsch mit Plan, sem sincronização entre aparelhos:

- **Backup em arquivo**: em *Dados e backups*, exporte um `.json` com checksum. Ele restaura em qualquer versão do app (Claude, navegador ou PC), e o app recusa arquivos alterados ou corrompidos.
- **Backups automáticos semanais** dentro do próprio armazenamento (guarda os 4 mais recentes, restauráveis pela tela).
- **No PC**: além disso, uma cópia automática por dia da pasta de dados (guarda 14). O botão *Abrir pasta de dados* mostra onde fica.
- O app lembra você de exportar quando o último backup em arquivo tem mais de 7 dias.

Nenhum dado de estudo é enviado a este repositório.

## Programa de PC

Precisa do [Node.js](https://nodejs.org) instalado.

```bash
cd codigo-fonte/desktop
npm install
npm start            # gera o app e abre
npm run dist:win     # gera release/Trilha-Dev-Setup.exe
```

## Desenvolvimento

```bash
cd codigo-fonte
node build.mjs                 # gera dist/ (Claude), a raiz (web/PWA) e desktop/app/
python3 test/check.py          # roda todas as soluções (devem passar) e todos os starters (devem falhar)
```

- `src/content/*.js`: as lições (formato descrito em `_base.js`)
- `src/runners.js`: execução e testes de cada linguagem
- `src/store.js`: armazenamento e backups
- `src/app.js` + `src/style.css`: interface
- `vendor/`: CodeMirror, TypeScript e sql.js (locais, pra funcionar offline)
