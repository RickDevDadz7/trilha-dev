/* Inglês pra devs — runner 'text': o aluno escreve em inglês e checagens objetivas conferem a estrutura. */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'eng', name: 'Inglês pra devs', badge: 'ENG', runner: 'text', group: 'career',
    tagline: 'O inglês que cai no trabalho',
    desc: 'Ler documentação, escrever commits, PRs, bug reports e mensagens pro time, e se virar numa entrevista técnica em inglês. Feito pra quem tem inglês intermediário e quer trabalhar fora.',
    notes: 'Nos exercícios você **escreve em inglês** no editor. O app confere a **estrutura** (seções, palavras-chave, tamanho), não a gramática perfeita. Se ativar o tutor de IA em Configurações, ele também revisa o seu texto.',
    units: [
      unit('Lendo documentação',
        lesson('eng-docs-words', 'Palavras que toda doc usa',
          learn('O vocabulário das docs', `Documentação técnica repete sempre as mesmas palavras. Aprenda elas e você lê qualquer doc:

- **returns**: o que a function devolve
- **throws**: o erro que ela pode lançar
- **optional / required**: opcional / obrigatório
- **default**: valor padrão, se você não passar nada
- **deprecated**: ainda funciona, mas vai ser removido. Não use em código novo.`),
          learn('Mais algumas', `- **since v2.0**: existe a partir da versão 2.0
- **breaking change**: mudança que quebra código antigo
- **under the hood**: por baixo dos panos, como funciona por dentro
- **out of the box**: funciona sem configurar nada
- **edge case**: caso extremo, raro (lista vazia, número negativo...)
- **workaround**: gambiarra, solução temporária`),
          predict('Leia o trecho da doc. O que acontece se você chamar `fetchUser()` sem argumentos?', 'fetchUser(id, options?)\n\nid: string (required)\noptions.timeout: number, default 5000\nThrows TypeError if id is missing.', ['Usa o timeout padrão de 5000', 'Lança um TypeError', 'Retorna undefined', 'Busca todos os usuários'], 1, '`id` é required e a doc diz: throws TypeError if id is missing.'),
          quiz('A doc diz: "`componentWillMount` is **deprecated**". O que fazer?', ['Usar normalmente, é o recomendado', 'Evitar em código novo: vai ser removido', 'Só funciona em produção', 'É um erro de digitação da doc'], 1, 'Deprecated = ainda funciona, mas está com os dias contados.'),
          code({ title: 'Explique uma function', task: 'Escreva em inglês, **uma frase por linha**, a documentação de `divide(a, b)`:\n\n1. uma linha começando com `Returns` (o que ela devolve)\n2. uma linha começando com `Throws` (quando dá erro: se `b` for zero)\n3. uma linha dizendo que `b` é **required**',
            starter: '# one sentence per line\n# 1. Returns ...\n\n# 2. Throws ...\n\n# 3. b is required ...\n',
            solution: 'Returns the result of a divided by b.\nThrows an Error if b is zero.\nThe parameter b is required.',
            hint: 'Ex.: `Returns the result of a divided by b.` / `Throws an Error if b is zero.` / `The parameter b is required.`',
            tests: [['Linha com Returns', 'lines.some((l) => /^returns\\b/i.test(l))'], ['Linha com Throws falando de zero', 'lines.some((l) => /^throws\\b/i.test(l) && /zero|0/i.test(l))'], ['Diz que b é required', 'lines.some((l) => /\\bb\\b/.test(l) && /required/i.test(l))']] })),

        lesson('eng-false-friends', 'Falsos cognatos',
          learn('Parece, mas não é', `Erros clássicos de brasileiro em reunião:

- **actually** = na verdade (não "atualmente": isso é *currently*)
- **eventually** = no fim das contas (não "eventualmente": isso é *occasionally*)
- **pretend** = fingir (não "pretender": isso é *intend* / *plan to*)
- **realize** = perceber (não "realizar": isso é *carry out*)
- **assist** = ajudar (não "assistir": isso é *watch*)`),
          learn('No contexto de TI', `- **library** = biblioteca de código (não "livraria")
- **support** = dar suporte; mas *"we support Node 20"* = funciona com Node 20
- **application** = app, mas também *job application* = candidatura
- **resume** (americano) = currículo; *CV* no Reino Unido e na Europa
- **push back** = discordar, questionar (não "empurrar de volta")`),
          quiz('"I\'m **currently** working on the login page" quer dizer:', ['Eventualmente vou trabalhar no login', 'Atualmente estou trabalhando no login', 'Na verdade estou no login', 'Já terminei o login'], 1, '*Currently* = atualmente. *Actually* = na verdade.'),
          quiz('Como dizer "Eu pretendo me mudar pra Alemanha"?', ['I pretend to move to Germany', 'I plan to move to Germany', 'I realize to move to Germany', 'I assist to move to Germany'], 1, '*Pretend* é fingir! Use *plan to*, *intend to* ou *I\'m going to*.'),
          code({ title: 'Corrija as frases', task: 'Reescreva as 3 frases em inglês correto, uma por linha:\n\n1. "Atualmente eu trabalho com React"\n2. "Eu pretendo estudar TypeScript"\n3. "Eu percebi que o bug estava no cache"',
            starter: '# 1. Atualmente eu trabalho com React\n\n# 2. Eu pretendo estudar TypeScript\n\n# 3. Eu percebi que o bug estava no cache\n',
            solution: 'I currently work with React.\nI plan to study TypeScript.\nI realized the bug was in the cache.',
            hint: 'Use *currently*, *plan to* (ou *intend to*) e *realized*.',
            tests: [['Usa currently (não actually)', 'has("currently") && !has("actually")'], ['Usa plan/intend/going to (não pretend)', '/\\b(plan|intend|going)\\b/i.test(text) && !has("pretend")'], ['Usa realized/noticed', '/\\b(realized|realised|noticed)\\b/i.test(text)'], ['Três frases', 'lines.length >= 3']] }))
      ),

      unit('Escrevendo no trabalho',
        lesson('eng-pr', 'Descrição de pull request',
          learn('A estrutura de um bom PR', `Uma descrição de PR boa responde três perguntas:

~~~
## Summary
Adds a search bar to the header.

## Changes
- New SearchBar component
- Debounced API call (300 ms)

## How to test
1. Open the home page
2. Type "shoes" in the search bar
~~~`),
          learn('Frases prontas', `- *This PR adds / fixes / removes...*
- *Closes #42* (fecha a issue 42 automaticamente)
- *I'm not sure about X, open to suggestions.*
- *Could you take a look?* (pedindo review)
- Respondendo review: *Good catch, fixed!* / *Done.* / *I went with X because Y.*`),
          quiz('Você recebeu o comentário "nit: rename this variable". O que é **nit**?', ['Um erro grave', 'Um detalhe pequeno, sugestão opcional', 'Um pedido pra apagar o PR', 'Um elogio'], 1, '*Nit* (de *nitpick*) é um detalhe pequeno. Pode ajustar ou não, sem drama.'),
          code({ title: 'Seu primeiro PR em inglês', task: 'Escreva a descrição de um PR que **adiciona dark mode** ao app. Use as três seções `## Summary`, `## Changes` (com pelo menos 2 itens `- `) e `## How to test` (com pelo menos 2 passos numerados).',
            starter: '## Summary\n\n## Changes\n\n## How to test\n',
            solution: '## Summary\nAdds a dark mode toggle to the settings page.\n\n## Changes\n- New ThemeToggle component\n- Colors moved to CSS variables\n\n## How to test\n1. Open Settings\n2. Click the dark mode toggle\n3. Reload the page and check that the theme is saved',
            hint: 'Debaixo de cada título escreva o conteúdo. Itens de lista começam com `- ` e passos com `1.`, `2.`.',
            tests: [['Summary com conteúdo', '/## Summary\\s*\\n\\s*[A-Za-z]/.test(text)'], ['Fala de dark mode', '/dark/i.test(text)'], ['Changes com 2+ itens', '(text.split("## Changes")[1] || "").split("##")[0].split("\\n").filter((l) => /^\\s*- \\S/.test(l)).length >= 2'], ['How to test com 2+ passos', '(text.split("## How to test")[1] || "").split("\\n").filter((l) => /^\\s*\\d+\\.\\s+\\S/.test(l)).length >= 2']] })),

        lesson('eng-bug-report', 'Bug report',
          learn('Reportando um bug', `Um bug report bom deixa qualquer pessoa reproduzir o problema:

~~~
Title: Cart total ignores discount codes

Steps to reproduce
1. Add any product to the cart
2. Apply the code SAVE10

Expected: total drops by 10%
Actual: total stays the same
~~~

**Expected** é o que devia acontecer, **Actual** é o que aconteceu.`),
          quiz('Qual título de bug é melhor?', ['It doesn\'t work', 'BUG!!!', 'Login button does nothing on Safari', 'Problem'], 2, 'Diz o quê, onde e em que condição. Quem lê já sabe por onde começar.'),
          code({ title: 'Reporte o bug', task: 'O formulário de cadastro aceita email sem `@`. Escreva o bug report com: uma linha `Title:`, uma seção `Steps to reproduce` com 2+ passos numerados, uma linha `Expected:` e uma linha `Actual:`.',
            starter: 'Title:\n\nSteps to reproduce\n\nExpected:\nActual:\n',
            solution: 'Title: Sign-up form accepts emails without @\n\nSteps to reproduce\n1. Open the sign-up page\n2. Type "rickmail.com" in the email field\n3. Click Create account\n\nExpected: an error message saying the email is invalid\nActual: the account is created',
            hint: 'Preencha cada parte. Expected: o que devia acontecer (uma mensagem de erro). Actual: o que acontece (a conta é criada).',
            tests: [['Title preenchido', '/^title:[ \\t]*\\S.{8,}/im.test(text)'], ['2+ passos numerados', 'lines.filter((l) => /^\\d+\\.\\s+\\S/.test(l)).length >= 2'], ['Expected preenchido', '/^expected:[ \\t]*\\S/im.test(text)'], ['Actual preenchido', '/^actual:[ \\t]*\\S/im.test(text)']] })),

        lesson('eng-standup', 'Daily e mensagens pro time',
          learn('A daily em 30 segundos', `Na daily (ou *standup*) cada um responde três coisas:

- **Yesterday**: *I finished the login page.*
- **Today**: *I'm going to work on the password reset.*
- **Blockers**: *I'm blocked on the API keys.* / *No blockers.*

Tempos verbais: passado pro ontem (*finished, fixed, reviewed*), *going to* ou presente contínuo pro hoje.`),
          learn('No Slack', `- *Quick question: ...* (pergunta rápida)
- *Heads-up: the staging server will be down at 3pm.* (aviso)
- *Could you review my PR when you have a minute?*
- *Sorry for the delay!*
- *I'll look into it.* (vou investigar)
- *Let me know if you need anything else.*`),
          quiz('Como dizer "estou travado esperando o acesso ao banco"?', ['I\'m stuck waiting for database access', 'I\'m locked in the database', 'I pretend the database access', 'I\'m blocking the database'], 0, '*Stuck* ou *blocked on/by* = travado esperando algo.'),
          code({ title: 'Sua daily', task: 'Escreva sua daily em inglês, com três linhas começando com `Yesterday:`, `Today:` e `Blockers:`. Use pelo menos um verbo no passado (terminado em `-ed`) no Yesterday.',
            starter: 'Yesterday:\nToday:\nBlockers:\n',
            solution: 'Yesterday: I fixed the cart total bug and reviewed two PRs.\nToday: I\'m going to start the checkout page.\nBlockers: none.',
            hint: 'Ex.: `Yesterday: I fixed the login bug.` / `Today: I\'m going to write tests.` / `Blockers: none.`',
            tests: [['Yesterday com verbo no passado', 'lines.some((l) => /^yesterday:\\s*.*\\b\\w+ed\\b/i.test(l))'], ['Today preenchido', 'lines.some((l) => /^today:\\s*\\S.{3,}/i.test(l))'], ['Blockers preenchido', 'lines.some((l) => /^blockers?:\\s*\\S/i.test(l))']] }))
      ),

      unit('Entrevista técnica',
        lesson('eng-intro', 'Tell me about yourself',
          learn('A pergunta que sempre vem', `Toda entrevista começa com *"Tell me about yourself"*. Não conte sua vida: fale em **3 partes**, ~1 minuto:

1. **Present**: o que você faz hoje (*I'm a frontend developer focused on React.*)
2. **Past**: o que te trouxe até aqui (*Before that, I worked in sales, which taught me...*)
3. **Future**: por que essa vaga (*Now I'm looking for a team where I can grow in TypeScript.*)`),
          learn('Frases úteis', `- *I've been coding for two years.* (há dois anos: **present perfect**, não "I code since")
- *I'm passionate about clean, accessible interfaces.*
- *My most recent project was...*
- *I'm currently learning German.*
- *That's why I applied for this role.*`),
          quiz('Qual está certo?', ['I work with JavaScript since 2024', 'I have been working with JavaScript since 2024', 'I am working with JavaScript since 2024', 'I worked with JavaScript since 2024'], 1, 'Com *since/for* + algo que continua até hoje, use present perfect: *have been working*.'),
          code({ title: 'Seu pitch', task: 'Escreva seu "Tell me about yourself" em inglês, com **pelo menos 60 palavras**. Precisa ter: o que você faz hoje, alguma experiência anterior (`before`, `previously` ou `I used to`) e por que quer a vaga (`looking for`, `that\'s why` ou `I applied`). Mencione ao menos uma tecnologia.',
            starter: '# 1. present: what you do now\n\n# 2. past: what brought you here\n\n# 3. future: why this job\n',
            solution: 'I\'m a junior full-stack developer from Brazil, and I\'ve been building web apps with JavaScript, TypeScript and SQL for the past two years.\nBefore that, I worked in customer service, which taught me how to listen to users and explain technical problems clearly.\nRecently I built a learning app with spaced repetition and automated tests.\nNow I\'m looking for a team in Germany where I can grow as a developer, and that\'s why I applied for this role.',
            hint: 'Siga as 3 partes dos comentários. Use *I\'m a...*, *Before that, I...* e *I\'m looking for...*.',
            tests: [['60+ palavras', 'words.length >= 60'], ['Fala do presente (I\'m / I work)', '/\\b(I\'m|I am|I work|I\'ve been)\\b/i.test(text)'], ['Fala do passado', '/\\b(before|previously|used to)\\b/i.test(text)'], ['Fala do futuro / da vaga', '/\\b(looking for|that\'s why|applied|apply)\\b/i.test(text)'], ['Cita uma tecnologia', '/\\b(javascript|typescript|react|sql|node|python|html|css|git)\\b/i.test(text)']] })),

        lesson('eng-star', 'Perguntas comportamentais (STAR)',
          learn('O método STAR', `*"Tell me about a time you had a conflict / made a mistake / met a tight deadline."*

Responda em 4 partes:

- **S**ituation: o contexto
- **T**ask: qual era sua responsabilidade
- **A**ction: o que **você** fez (fale *I*, não *we*)
- **R**esult: o que aconteceu, de preferência com número`),
          quiz('Na parte **Action**, por que preferir "I" a "we"?', ['É mais educado', 'O entrevistador quer saber o que VOCÊ fez', '"We" é errado em inglês', 'Não faz diferença'], 1, 'Eles estão contratando você, não o seu time antigo.'),
          code({ title: 'Um erro que você cometeu', task: 'Responda *"Tell me about a time you made a mistake"* com o método STAR. Escreva 4 linhas começando com `Situation:`, `Task:`, `Action:` e `Result:`. Na Action, use `I`. No Result, inclua um número.',
            starter: 'Situation:\nTask:\nAction:\nResult:\n',
            solution: 'Situation: In my last project, I deployed a change that broke the login page for some users.\nTask: I had to fix it fast and make sure it would not happen again.\nAction: I rolled back the release, wrote a test that reproduced the bug and added it to our CI pipeline.\nResult: The login was back in 20 minutes, and we had zero login bugs in the next 3 months.',
            hint: 'Uma linha pra cada letra. Ex. de Result: *The page was back in 20 minutes.*',
            tests: [['Situation', 'lines.some((l) => /^situation:\\s*\\S.{3,}/i.test(l))'], ['Task', 'lines.some((l) => /^task:\\s*\\S.{3,}/i.test(l))'], ['Action com "I"', 'lines.some((l) => /^[Aa]ction:.*\\bI\\b/.test(l))'], ['Result com número', 'lines.some((l) => /^result:.*\\d/i.test(l))']] })),

        lesson('eng-live-coding', 'Live coding em inglês',
          learn('Pense em voz alta', `Em live coding, o silêncio é seu inimigo. O entrevistador quer ouvir **como você pensa**. Frases pra isso:

- *Let me make sure I understand the problem...*
- *Can I assume the input is always sorted?* (perguntar antes de codar!)
- *My first idea is a brute-force approach, then I'll optimize.*
- *This would be O(n²); I think we can do better with a hash map.*
- *Let me test it with an edge case: an empty array.*`),
          learn('Quando trava', `Travar é normal. O que não pode é sumir:

- *Give me a second to think about this.*
- *I'm not sure, but my guess is...*
- *I haven't used that before, but I'd look it up in the docs.*
- *Could you give me a hint?*

Admitir que não sabe, com calma, conta ponto.`),
          quiz('Qual a melhor primeira coisa a fazer num problema de live coding?', ['Começar a codar imediatamente', 'Fazer perguntas pra esclarecer o problema e os casos extremos', 'Ficar em silêncio pensando 5 minutos', 'Dizer que não sabe'], 1, 'Perguntas de esclarecimento mostram maturidade e evitam resolver o problema errado.'),
          code({ title: 'Perguntas de esclarecimento', task: 'O problema é: *"Write a function that returns the most frequent word in a text."* Escreva **3 perguntas** de esclarecimento em inglês, uma por linha, cada uma terminando com `?`. Pelo menos uma deve falar de um caso extremo (empty, tie, uppercase, punctuation...).',
            starter: '# 3 clarifying questions, one per line, ending with ?\n',
            solution: 'Should the comparison be case-insensitive, so "The" and "the" count as the same word?\nWhat should I return if there is a tie between two words?\nWhat should happen if the text is empty?',
            hint: 'Comece com *Should...*, *What should I return if...*, *Can I assume...*',
            tests: [['3+ perguntas', 'lines.filter((l) => /\\?\\s*$/.test(l)).length >= 3'], ['Pergunta sobre caso extremo', '/\\b(empty|tie|ties|upper|lower|case|punctuation|null|special)\\b/i.test(text)'], ['Frases completas (5+ palavras cada)', 'lines.filter((l) => /\\?\\s*$/.test(l)).every((l) => l.split(/\\s+/).length >= 5)']] }))
      )
    ]
  });
  // escrita livre: sem modo blocos
  TD.courses[TD.courses.length - 1].units.forEach((u) => u.lessons.forEach((l) => l.steps.forEach((st) => { if (st.t === 'code') st.noBlocks = true; })));
})(window.TD);
