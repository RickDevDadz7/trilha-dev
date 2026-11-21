/* Git & GitHub — terminal simulado (src/gitsim.js). Os comandos são reais; o repositório é de mentira. */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  const BASE = ['git init', 'echo "# My App" > README.md', 'git add .', 'git commit -m "Initial commit"'];
  const WITH_APP = BASE.concat(['echo "console.log(1)" > app.js', 'git add app.js', 'git commit -m "Add app"']);

  TD.courses.push({
    id: 'git', name: 'Git & GitHub', badge: 'GIT', runner: 'git',
    tagline: 'Todo emprego de dev pede',
    desc: 'Versionar código, trabalhar com branches, resolver conflitos e colaborar no GitHub com push, pull e pull requests. Os comandos são os de verdade, num terminal simulado.',
    notes: 'O editor aqui é um **terminal**: escreva **um comando por linha** e clique em Rodar. Cada exercício começa numa pasta nova, então pode errar à vontade. Linhas com `#` são comentários. Além do `git`, funcionam `echo "texto" > arquivo`, `touch`, `cat`, `ls` e `rm`.',
    units: [
      unit('Primeiros passos',
        lesson('git-why', 'O que é Git',
          learn('Uma máquina do tempo pro código', `**Git** é um sistema de **controle de versão**: ele guarda o histórico de tudo que muda no seu projeto.

Cada ponto salvo se chama **commit**: uma foto do projeto inteiro naquele momento, com uma mensagem dizendo o que mudou.

Com isso você pode voltar no tempo, ver quem mudou o quê e trabalhar em equipe sem um sobrescrever o outro.`),
          learn('Git não é GitHub', `- **Git**: o programa que roda no seu computador e guarda o histórico.
- **GitHub**: um site que hospeda repositórios Git na nuvem, pra compartilhar e colaborar.

Um projeto controlado pelo Git é um **repositório** (ou **repo**). Pra transformar uma pasta em repo:

~~~
git init
~~~`),
          quiz('Qual a diferença entre Git e GitHub?', ['São a mesma coisa', 'Git guarda o histórico no seu computador; GitHub hospeda repositórios na nuvem', 'GitHub é a versão paga do Git', 'Git só funciona com JavaScript'], 1, 'Git é a ferramenta; GitHub é um serviço que hospeda repos Git (existem outros, como GitLab).'),
          code({ title: 'Seu primeiro repo', task: 'Confira a versão do Git e transforme a pasta num repositório.',
            starter: '# 1. show the git version\n\n# 2. turn this folder into a git repository\n',
            solution: 'git --version\ngit init', hint: '`git --version` e depois `git init`, um por linha.',
            tests: [['Mostrou a versão', 'used("^git (--version|version)")'], ['Criou o repositório', 'repo.inited']] })),

        lesson('git-config', 'Configurando sua identidade',
          learn('Quem fez esse commit?', `Todo commit guarda o **autor**. Antes do primeiro commit, diga ao Git quem você é:

~~~
git config --global user.name "Rick"
git config --global user.email "rick@mail.com"
~~~

O \`--global\` vale pra todos os seus projetos. Use o mesmo email da sua conta do GitHub: é assim que os commits aparecem no seu perfil.`),
          quiz('Por que usar o mesmo email da conta do GitHub?', ['É obrigatório pra instalar o Git', 'Pros commits contarem no seu perfil (o gráfico verde de contribuições)', 'Pra receber notificações', 'Não faz diferença'], 1, 'O GitHub liga commits ao seu perfil pelo email. Recrutador olha esse gráfico.'),
          code({ title: 'Quem é você', task: 'Configure `user.name` e `user.email` com `--global`.',
            starter: '# 1. set your user.name\n\n# 2. set your user.email\n',
            solution: 'git config --global user.name "Rick"\ngit config --global user.email "rick@mail.com"', hint: '`git config --global user.name "Seu Nome"` e o mesmo com `user.email`.',
            tests: [['Configurou o nome', '!!repo.config["user.name"]'], ['Configurou um email válido', '/@/.test(repo.config["user.email"] || "")']] })),

        lesson('git-first-commit', 'O primeiro commit',
          learn('As três áreas', `O Git tem três lugares:

1. **Working directory**: a pasta, onde você edita os arquivos.
2. **Staging area**: a "caixa" do próximo commit. Você escolhe o que entra com \`git add\`.
3. **Repositório**: o histórico de commits. \`git commit\` fecha a caixa e salva a foto.

~~~
git add README.md
git commit -m "Add README"
~~~`),
          learn('Vendo o que está acontecendo', `\`git status\` é o comando que você mais vai usar. Ele mostra:

- **Untracked files**: arquivos novos que o Git ainda não acompanha
- **Changes not staged**: mudanças que ainda não foram pro \`add\`
- **Changes to be committed**: o que vai no próximo commit

Na dúvida, rode \`git status\`.`),
          predict('O que o `git status` mostra no final?', 'git init\necho "hi" > notes.txt\ngit add notes.txt\ngit status', ['Untracked files: notes.txt', 'Changes to be committed: new file: notes.txt', 'nothing to commit', 'Um erro'], 1, 'O `git add` colocou o arquivo na staging area: ele está pronto pro commit.'),
          code({ title: 'Primeira foto', task: 'Crie um repo, crie um `README.md`, coloque na staging area e faça o commit com a mensagem `Add README`.',
            starter: '# 1. create the repository\n\n# 2. create README.md (tip: echo "# My App" > README.md)\n\n# 3. add it to the staging area\n\n# 4. commit with the message: Add README\n',
            solution: 'git init\necho "# My App" > README.md\ngit add README.md\ngit commit -m "Add README"',
            hint: 'A ordem é: `git init`, `echo ... > README.md`, `git add README.md`, `git commit -m "Add README"`.',
            tests: [['Tem 1 commit', 'commits.length === 1'], ['Mensagem "Add README"', 'tipMsg === "Add README"'], ['O commit tem o README.md', '"README.md" in commits[0].files'], ['Nada sobrando sem commit', 'clean']] })),

        lesson('git-history', 'Histórico e diferenças',
          learn('git log e git diff', `Pra ver o histórico:

~~~
git log            # completo
git log --oneline  # uma linha por commit
~~~

Pra ver **o que mudou** antes de commitar:

~~~
git diff           # mudanças ainda fora da staging area
git diff --staged  # o que vai no próximo commit
~~~

Linhas com \`-\` saíram, linhas com \`+\` entraram.`),
          learn('Atalho: commit -am', `Pra arquivos que o Git **já acompanha**, dá pra fazer \`add\` e \`commit\` de uma vez:

~~~
git commit -am "Update README"
~~~

Cuidado: o \`-a\` **não pega arquivos novos**. Arquivo novo sempre precisa de \`git add\` antes.`),
          quiz('Você criou `style.css` (arquivo novo) e rodou `git commit -am "Add style"`. O que acontece?', ['O style.css entra no commit', 'O style.css fica de fora: -a só pega arquivos já acompanhados', 'Dá erro de sintaxe', 'Apaga o arquivo'], 1, '`-a` só pega arquivos que o Git já conhece. Arquivo novo precisa de `git add`.'),
          code({ title: 'Segunda versão', task: 'O repo já tem um commit com o `README.md`. Mude o conteúdo do README, veja o diff, faça o commit `Update README` e mostre o histórico em uma linha por commit.',
            setup: { cmds: BASE },
            starter: '# the repo already has one commit\n# 1. change README.md (echo "# My App v2" > README.md)\n\n# 2. see what changed\n\n# 3. stage and commit: Update README\n\n# 4. show the history, one line per commit\n',
            solution: 'echo "# My App v2" > README.md\ngit diff\ngit add README.md\ngit commit -m "Update README"\ngit log --oneline',
            hint: '`git diff` mostra a mudança. Depois `git add README.md` + `git commit -m "Update README"`, e por fim `git log --oneline`.',
            tests: [['Agora são 2 commits', 'commits.length === 2'], ['Último commit: "Update README"', 'tipMsg === "Update README"'], ['Usou git diff', 'used("^git diff")'], ['Mostrou o log em uma linha', 'used("^git log --oneline")']] }))
      ),

      unit('Desfazendo coisas',
        lesson('git-restore', 'Descartando mudanças',
          learn('git restore', `Estragou um arquivo e quer voltar pra versão do último commit?

~~~
git restore app.js           # descarta mudanças na pasta
git restore --staged app.js  # tira da staging area (mantém a mudança)
~~~

Atenção: \`git restore\` sem \`--staged\` **apaga** sua mudança no arquivo. Não tem desfazer.`),
          quiz('Você deu `git add app.js` sem querer. Qual comando tira o arquivo da staging area, sem perder a edição?', ['git restore app.js', 'git restore --staged app.js', 'git rm app.js', 'git reset --hard'], 1, '`--staged` mexe só na staging area. Sem ele, a mudança no arquivo é descartada.'),
          code({ title: 'Ops, quebrei tudo', task: 'Alguém escreveu bobagem no `app.js` e já deu `git add`. Tire da staging area e depois descarte a mudança, voltando o arquivo à versão do último commit.',
            setup: { cmds: WITH_APP.concat(['echo "oops" > app.js', 'git add app.js']) },
            starter: '# app.js is broken AND staged\n# 1. unstage app.js\n\n# 2. discard the change in app.js\n\n# 3. check that everything is clean\n',
            solution: 'git restore --staged app.js\ngit restore app.js\ngit status',
            hint: 'Primeiro `git restore --staged app.js`, depois `git restore app.js`.',
            tests: [['app.js voltou ao original', 'files["app.js"] === "console.log(1)"'], ['Nada pendente', 'clean'], ['Nenhum commit novo', 'commits.length === 2']] })),

        lesson('git-amend', 'Consertando o último commit',
          learn('commit --amend', `Errou a mensagem do commit que **acabou de fazer**?

~~~
git commit --amend -m "Fix typo in title"
~~~

O \`--amend\` substitui o último commit por um novo. Também serve pra incluir um arquivo esquecido: dê \`git add\` nele e rode o \`--amend\`.

Regra de ouro: só use \`--amend\` em commits que você **ainda não mandou** pro GitHub.`),
          quiz('Quando NÃO usar `--amend`?', ['Quando o commit é só local', 'Quando o commit já foi mandado pro GitHub', 'Quando a mensagem tem erro de digitação', 'Quando esqueceu um arquivo'], 1, '`--amend` reescreve o commit. Se ele já está no remoto, outras pessoas podem ter a versão antiga.'),
          code({ title: 'Mensagem errada', task: 'O último commit saiu como `Fx titel`. Corrija a mensagem pra `Fix title` sem criar um commit a mais.',
            setup: { cmds: BASE.concat(['echo "# My Great App" > README.md', 'git commit -am "Fx titel"']) },
            starter: '# fix the message of the last commit to: Fix title\n',
            solution: 'git commit --amend -m "Fix title"',
            hint: '`git commit --amend -m "Fix title"`',
            tests: [['Mensagem corrigida', 'tipMsg === "Fix title"'], ['Continuam 2 commits', 'commits.length === 2'], ['A mensagem errada sumiu do histórico', '!commits.some((c) => c.msg === "Fx titel")']] })),

        lesson('git-revert', 'revert vs reset',
          learn('Desfazendo commits', `Dois jeitos de desfazer um commit:

- \`git revert <commit>\`: cria um **commit novo** que desfaz o anterior. O histórico continua intacto. **Seguro** pra commits que já estão no GitHub.
- \`git reset HEAD~1\`: **apaga** o último commit do histórico (as mudanças voltam pra pasta). Só pra commits locais.

\`HEAD\` é "onde você está agora". \`HEAD~1\` é um commit antes.`),
          quiz('O commit ruim já está no GitHub e o time puxou. Qual usar?', ['git reset --hard HEAD~1', 'git revert HEAD', 'Apagar o repositório', 'git commit --amend'], 1, 'Reescrever histórico público bagunça o repo de todo mundo. `revert` só adiciona um commit que desfaz.'),
          code({ title: 'Desfaça com segurança', task: 'O último commit adicionou um `debug.txt` que não devia estar lá (e já foi pro GitHub). Desfaça com `revert`.',
            setup: { cmds: BASE.concat(['echo "secret logs" > debug.txt', 'git add .', 'git commit -m "Add debug file"']) },
            starter: '# undo the last commit safely, keeping history\n',
            solution: 'git revert HEAD', hint: '`git revert HEAD` desfaz o commit atual criando um novo.',
            tests: [['debug.txt sumiu da pasta', '!("debug.txt" in files)'], ['Histórico mantido (3 commits)', 'commits.length === 3'], ['Último commit é um Revert', '/^Revert/.test(tipMsg)']] })),

        lesson('git-ignore', '.gitignore',
          learn('Arquivos que não vão pro repo', `Alguns arquivos **nunca** devem ir pro Git:

- \`node_modules/\`: dependências (gigante, se reinstala com npm)
- \`.env\`: senhas e chaves de API
- \`*.log\`: logs

Liste eles num arquivo \`.gitignore\`, um padrão por linha:

~~~
node_modules/
.env
*.log
~~~

O \`git add .\` passa a ignorar esses arquivos.`),
          predict('Com esse `.gitignore`, o que entra no commit?', '# .gitignore tem: .env\necho "KEY=123" > .env\necho "x" > index.js\ngit add .\ngit commit -m "Start"', ['.env e index.js', 'Só index.js', 'Só .env', 'Nada'], 1, '.env está no .gitignore, então o `git add .` pula ele.'),
          code({ title: 'Protegendo segredos', task: 'A pasta tem `index.js`, `.env` (com uma senha) e `error.log`. Crie um `.gitignore` que ignore `.env` e qualquer `*.log`, depois faça `git add .` e o commit `Initial commit`.\n\nDica: pra escrever duas linhas, use `>` na primeira e `>>` (anexar) na segunda.',
            setup: { cmds: ['git init', 'echo "app()" > index.js', 'echo "PASSWORD=hunter2" > .env', 'echo "boom" > error.log'] },
            starter: '# 1. write .env in the .gitignore\n\n# 2. append *.log to the .gitignore (use >>)\n\n# 3. stage everything and commit: Initial commit\n',
            solution: 'echo ".env" > .gitignore\necho "*.log" >> .gitignore\ngit add .\ngit commit -m "Initial commit"',
            hint: '`echo ".env" > .gitignore`, `echo "*.log" >> .gitignore`, `git add .`, `git commit -m "Initial commit"`.',
            tests: [['Commit feito', 'commits.length === 1'], ['.env ficou fora', '!(".env" in commits[0].files)'], ['error.log ficou fora', '!("error.log" in commits[0].files)'], ['index.js e .gitignore entraram', '"index.js" in commits[0].files && ".gitignore" in commits[0].files']] }))
      ),

      unit('Branches',
        lesson('git-branch', 'Criando branches',
          learn('Linhas do tempo paralelas', `Uma **branch** é uma linha de desenvolvimento separada. Você cria uma pra cada feature, mexe à vontade, e a \`main\` continua estável.

~~~
git branch              # lista (a atual tem *)
git switch -c login     # cria e já entra
git switch main         # volta pra main
~~~

Commits feitos na branch \`login\` **não aparecem** na \`main\` até você fazer merge.`),
          predict('Quantos arquivos o `ls` mostra no final?', 'git switch -c feature\necho "x" > new.js\ngit add .\ngit commit -m "Add new"\ngit switch main\nls', ['Só README.md', 'README.md e new.js', 'Nenhum', 'Só new.js'], 0, 'Ao voltar pra main, a pasta volta a ser a foto da main, que não tem o new.js.'),
          code({ title: 'Trabalhando numa feature', task: 'Crie a branch `feature/login`, entre nela, crie `login.js` e faça o commit `Add login`. Depois volte pra `main`.',
            setup: { cmds: BASE },
            starter: '# 1. create and switch to feature/login\n\n# 2. create login.js and commit: Add login\n\n# 3. go back to main\n',
            solution: 'git switch -c feature/login\necho "login()" > login.js\ngit add login.js\ngit commit -m "Add login"\ngit switch main',
            hint: '`git switch -c feature/login`, crie o arquivo, `add`, `commit`, e `git switch main`.',
            tests: [['Branch feature/login existe', 'branches.includes("feature/login")'], ['Está de volta na main', 'branch === "main"'], ['A main não tem login.js', '!("login.js" in files)'], ['A feature/login tem o commit', 'repo.commits[repo.branches["feature/login"]].msg === "Add login"']] })),

        lesson('git-merge', 'Merge',
          learn('Juntando branches', `Terminou a feature? Volte pra branch que vai **receber** as mudanças e faça o merge:

~~~
git switch main
git merge feature/login
git branch -d feature/login   # apaga a branch já juntada
~~~

Se a \`main\` não andou desde que a branch foi criada, o Git só "avança o ponteiro": é um **fast-forward**.`),
          quiz('Você está na `feature/login` e quer trazer o trabalho dela pra `main`. Qual o primeiro passo?', ['git merge main', 'git switch main', 'git branch -d main', 'git push'], 1, 'O merge traz a outra branch **pra dentro da atual**. Então primeiro vá pra main.'),
          code({ title: 'Feature pronta', task: 'A branch `feature/login` está pronta. Junte ela na `main` e apague a branch.',
            setup: { cmds: BASE.concat(['git switch -c feature/login', 'echo "login()" > login.js', 'git add .', 'git commit -m "Add login"']) },
            starter: '# you are on feature/login\n# 1. go to main\n\n# 2. merge feature/login\n\n# 3. delete the branch\n',
            solution: 'git switch main\ngit merge feature/login\ngit branch -d feature/login',
            hint: '`git switch main`, `git merge feature/login`, `git branch -d feature/login`.',
            tests: [['Está na main', 'branch === "main"'], ['A main tem o login.js', '"login.js" in files'], ['A branch foi apagada', '!branches.includes("feature/login")']] })),

        lesson('git-conflict', 'Resolvendo conflitos',
          learn('Quando o Git não sabe escolher', `Se duas branches mudaram **a mesma parte** do mesmo arquivo, o merge para com um **conflito**. O arquivo fica assim:

~~~
<<<<<<< HEAD
title = "Shop"
=======
title = "Store"
>>>>>>> rename
~~~

Em cima, a sua versão (HEAD). Embaixo, a da outra branch.`),
          learn('Resolvendo', `Pra resolver:

1. Edite o arquivo deixando só a versão final, sem as linhas \`<<<<<<<\`, \`=======\` e \`>>>>>>>\`.
2. \`git add arquivo\`
3. \`git commit -m "Merge rename"\`

Conflito não é erro seu: é o Git pedindo pra um humano decidir.`),
          quiz('Depois de editar o arquivo com conflito, o que falta?', ['Nada, o Git detecta sozinho', 'git add no arquivo e git commit', 'git merge --abort', 'git push --force'], 1, 'O `git add` marca o conflito como resolvido; o commit fecha o merge.'),
          code({ title: 'Store ou Shop?', task: 'Faça o merge da branch `rename` na `main`. Vai dar conflito no `config.txt`. Resolva deixando o conteúdo `title = "Store"` e conclua o merge com o commit `Merge rename`.',
            setup: { cmds: ['git init', 'echo \'title = "App"\' > config.txt', 'git add .', 'git commit -m "Add config"', 'git switch -c rename', 'echo \'title = "Store"\' > config.txt', 'git commit -am "Rename to Store"', 'git switch main', 'echo \'title = "Shop"\' > config.txt', 'git commit -am "Rename to Shop"'] },
            starter: '# 1. merge rename into main (it will conflict)\n\n# 2. see the conflict\n\n# 3. write the final content: title = "Store"\n#    tip: echo \'title = "Store"\' > config.txt\n\n# 4. mark as resolved and commit: Merge rename\n',
            solution: 'git merge rename\ncat config.txt\necho \'title = "Store"\' > config.txt\ngit add config.txt\ngit commit -m "Merge rename"',
            hint: 'Depois do `git merge rename`, sobrescreva o arquivo com `echo \'title = "Store"\' > config.txt`, aí `git add config.txt` e `git commit -m "Merge rename"`.',
            tests: [['Merge concluído', 'isMerge && !merging'], ['Conteúdo final certo', 'files["config.txt"] === \'title = "Store"\''], ['Sem marcadores de conflito', '!/<<<<<<<|>>>>>>>/.test(files["config.txt"])']] })),

        lesson('git-stash', 'Guardando trabalho: stash',
          learn('git stash', `Está no meio de algo e precisa trocar de branch urgente? O Git não deixa trocar com mudanças pendentes. Use o **stash**, uma gaveta temporária:

~~~
git stash       # guarda as mudanças e limpa a pasta
git switch hotfix
...
git switch main
git stash pop   # devolve as mudanças
~~~`),
          predict('O que o `git status` mostra no final?', 'echo "wip" > README.md\ngit stash\ngit status', ['modified: README.md', 'nothing to commit, working tree clean', 'Untracked files: README.md', 'Um erro'], 1, 'O stash guardou a mudança e deixou a pasta igual ao último commit.'),
          code({ title: 'Interrupção', task: 'Você está editando o `README.md` na `main` quando pedem um hotfix. Guarde a mudança, crie a branch `hotfix`, volte pra `main` e recupere o que guardou.',
            setup: { cmds: BASE.concat(['echo "# My App - work in progress" > README.md']) },
            starter: '# 1. stash your changes\n\n# 2. create and switch to hotfix\n\n# 3. go back to main\n\n# 4. bring your changes back\n',
            solution: 'git stash\ngit switch -c hotfix\ngit switch main\ngit stash pop',
            hint: '`git stash`, `git switch -c hotfix`, `git switch main`, `git stash pop`.',
            tests: [['Branch hotfix criada', 'branches.includes("hotfix")'], ['De volta na main', 'branch === "main"'], ['A mudança voltou', 'files["README.md"] === "# My App - work in progress"'], ['Gaveta vazia', 'repo.stash.length === 0']] }))
      ),

      unit('GitHub',
        lesson('gh-push', 'Mandando pro GitHub',
          learn('Remote e push', `Pra publicar no GitHub: crie um repo vazio no site e ligue ele ao seu repo local. O endereço remoto ganha o apelido \`origin\`:

~~~
git remote add origin https://github.com/rick/app.git
git push -u origin main
~~~

O \`-u\` liga sua \`main\` à \`main\` do GitHub. Nas próximas vezes, só \`git push\`.`),
          quiz('O que é `origin`?', ['Um comando do Git', 'O apelido padrão do repositório remoto', 'A primeira branch', 'O primeiro commit'], 1, '`origin` é só um nome pro endereço do remoto. Podia ser qualquer nome, mas é a convenção.'),
          code({ title: 'Publicando', task: 'Ligue o repo a `https://github.com/rick/app.git` como `origin` e faça o primeiro push da `main` com `-u`.',
            setup: { cmds: BASE },
            starter: '# 1. add the remote called origin\n\n# 2. push main and set upstream\n',
            solution: 'git remote add origin https://github.com/rick/app.git\ngit push -u origin main',
            hint: '`git remote add origin <url>` e depois `git push -u origin main`.',
            tests: [['origin configurado', 'remotes.origin === "https://github.com/rick/app.git"'], ['main está no GitHub', 'remote.main === repo.tip()'], ['Upstream configurado', 'repo.upstream.main === "origin/main"']] })),

        lesson('gh-clone-pull', 'Clone e pull',
          learn('Trazendo do GitHub', `Pra baixar um projeto que já existe:

~~~
git clone https://github.com/rick/app.git
~~~

Isso baixa o repo inteiro, com histórico, já com o \`origin\` configurado.

Quando outra pessoa manda commits, você atualiza com:

~~~
git pull
~~~

O \`pull\` busca os commits novos e faz merge na sua branch.`),
          quiz('Você tentou `git push` e recebeu `rejected (fetch first)`. Por quê?', ['Sua internet caiu', 'O GitHub tem commits que você ainda não tem', 'Você não tem permissão', 'O commit está vazio'], 1, 'Alguém mandou commits antes. Rode `git pull`, depois `git push`.'),
          code({ title: 'Push rejeitado', task: 'Uma colega mandou um commit pro GitHub e você também commitou na sua `main`. Seu push vai ser rejeitado. Traga o trabalho dela e depois mande o seu.',
            setup: { cmds: BASE.concat(['git switch -c teammate', 'echo "notes" > notes.txt', 'git add .', 'git commit -m "Add notes"', 'git switch main', 'echo "app()" > app.js', 'git add .', 'git commit -m "Add app"']), publish: { main: 'teammate' }, drop: ['teammate'] },
            starter: '# your push would be rejected: GitHub has a commit you do not have\n# 1. bring the new commits from GitHub\n\n# 2. push your work\n',
            solution: 'git pull\ngit push',
            hint: '`git pull` e depois `git push`.',
            tests: [['Você tem o notes.txt da colega', '"notes.txt" in files'], ['Seu app.js continua aí', '"app.js" in files'], ['O GitHub está atualizado', 'remote.main === repo.tip()']] })),

        lesson('gh-pr', 'Pull requests',
          learn('Como times trabalham', `Em empresa, ninguém faz push direto na \`main\`. O fluxo é:

1. Crie uma branch: \`git switch -c feat/search\`
2. Commite o trabalho
3. Mande a branch: \`git push -u origin feat/search\`
4. No GitHub, abra um **Pull Request (PR)**: um pedido pra juntar sua branch na \`main\`

O time lê o código, comenta (**code review**) e aprova. Aí o merge é feito pelo GitHub.`),
          learn('Um bom PR', `- Pequeno: uma coisa por PR
- Título claro, em inglês: \`Add search bar to header\`
- Descrição: **o que** mudou, **por que**, e como testar
- Responda os comentários com calma: review é sobre o código, não sobre você

Seus PRs em projetos open source são ótimos pro portfólio.`),
          quiz('Qual título de PR está melhor?', ['update', 'fixed stuff', 'Add search bar to header', 'PR do Rick'], 2, 'Verbo no imperativo + o que mudou. Dá pra entender sem abrir o PR.'),
          code({ title: 'Abrindo um PR', task: 'Crie a branch `feat/search`, adicione `search.js` com o commit `Add search`, e mande a branch pro GitHub com `-u`. (O PR em si é aberto no site.)',
            setup: { cmds: BASE, publish: true },
            starter: '# 1. create and switch to feat/search\n\n# 2. create search.js and commit: Add search\n\n# 3. push the branch to origin and set upstream\n',
            solution: 'git switch -c feat/search\necho "search()" > search.js\ngit add .\ngit commit -m "Add search"\ngit push -u origin feat/search',
            hint: 'O último passo é `git push -u origin feat/search`.',
            tests: [['Branch feat/search no GitHub', '!!remote["feat/search"]'], ['Com o commit "Add search"', 'repo.commits[remote["feat/search"]].msg === "Add search"'], ['A main do GitHub não mudou', 'repo.commits[remote.main].msg === "Initial commit"']] }))
      ),

      unit('Fluxo profissional',
        lesson('git-commit-msgs', 'Mensagens de commit',
          learn('Conventional Commits', `Muitas empresas usam o padrão **Conventional Commits**: um tipo, dois-pontos e um resumo curto em inglês, no imperativo:

~~~
feat: add login page
fix: handle empty cart
docs: update README
refactor: extract price helper
test: add cart tests
~~~

Resumo com até ~50 caracteres, sem ponto final. "add", não "added".`),
          quiz('Qual mensagem segue o padrão?', ['Fixed the bug.', 'fix: handle empty cart', 'FIX - cart', 'changes'], 1, 'Tipo em minúsculas, dois-pontos, resumo curto no imperativo.'),
          predict('Qual tipo de commit é esse?', '# você corrigiu o cálculo de frete\n# que dava errado pra CEP vazio', ['feat:', 'fix:', 'docs:', 'test:'], 1, 'Corrigiu um bug: `fix:`. Ex.: `fix: handle empty zip code`.'),
          code({ title: 'Commits de profissional', task: 'Faça dois commits seguindo Conventional Commits:\n\n1. crie `cart.js` e commite como uma **feature** (`feat: ...`)\n2. crie `CONTRIBUTING.md` e commite como **documentação** (`docs: ...`)',
            setup: { cmds: BASE },
            starter: '# 1. create cart.js and commit it as a feature\n\n# 2. create CONTRIBUTING.md and commit it as docs\n',
            solution: 'echo "cart()" > cart.js\ngit add cart.js\ngit commit -m "feat: add shopping cart"\necho "# How to contribute" > CONTRIBUTING.md\ngit add CONTRIBUTING.md\ngit commit -m "docs: add contributing guide"',
            hint: 'Ex.: `git commit -m "feat: add shopping cart"` e `git commit -m "docs: add contributing guide"`.',
            tests: [['Commit feat: com cart.js', 'commits.some((c) => /^feat(\\(.+\\))?: \\S/.test(c.msg) && "cart.js" in c.files)'], ['Commit docs:', 'tipMsg && /^docs(\\(.+\\))?: \\S/.test(tipMsg)'], ['Resumos com até 50 caracteres', 'commits.slice(0, 2).every((c) => c.msg.length <= 50)']] })),

        lesson('git-final', 'Projeto final: do zero ao GitHub',
          learn('O fluxo completo', `Agora junta tudo, do jeito que você vai fazer no trabalho:

1. \`git init\` e primeiro commit
2. Uma branch pra feature
3. Commit na branch
4. Merge na \`main\`
5. Publicar no GitHub

Use as mensagens no padrão Conventional Commits.`),
          code({ title: 'Seu projeto no ar', task: 'Do zero:\n\n1. crie o repo, um `README.md` e o commit `docs: add readme`\n2. crie a branch `feat/home`, adicione `index.html` com o commit `feat: add home page`\n3. volte pra `main`, faça o merge e apague a branch\n4. ligue a `https://github.com/rick/portfolio.git` e mande a `main` com `-u`',
            starter: '# 1. init + README + commit\n\n# 2. branch feat/home + index.html + commit\n\n# 3. merge into main and delete the branch\n\n# 4. remote + push\n',
            solution: 'git init\necho "# Portfolio" > README.md\ngit add .\ngit commit -m "docs: add readme"\ngit switch -c feat/home\necho "<h1>Hi</h1>" > index.html\ngit add .\ngit commit -m "feat: add home page"\ngit switch main\ngit merge feat/home\ngit branch -d feat/home\ngit remote add origin https://github.com/rick/portfolio.git\ngit push -u origin main',
            hint: 'Siga a ordem dos comentários. O merge é fast-forward, então não pede mensagem.',
            tests: [['Commit docs: add readme', 'commits.some((c) => c.msg === "docs: add readme")'], ['Commit feat: add home page', 'commits.some((c) => c.msg === "feat: add home page")'], ['main tem index.html', 'branch === "main" && "index.html" in files'], ['Branch apagada', '!branches.includes("feat/home")'], ['Publicado no GitHub', 'remote.main === repo.tip() && remotes.origin === "https://github.com/rick/portfolio.git"']] }))
      )
    ]
  });
})(window.TD);
