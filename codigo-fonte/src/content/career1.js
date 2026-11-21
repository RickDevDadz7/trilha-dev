/* Carreira dev — portfólio, CV, LinkedIn e candidatura. Vale pra qualquer país; o que muda por destino fica em "Trabalhar fora" (abroad1.js). */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'career', name: 'Carreira dev', badge: 'JOB', runner: 'text', group: 'career',
    tagline: 'Do portfólio à primeira vaga',
    desc: 'Portfólio no GitHub, currículo, LinkedIn, candidatura e negociação. Serve pra vaga no Brasil, remota ou em outro país.',
    notes: 'Nos exercícios você **escreve** e o app confere a estrutura do texto. Se ativar o tutor de IA em Configurações, ele também revisa o que você escreveu.',
    units: [
      unit('Portfólio',
        lesson('career-portfolio', 'O que colocar no portfólio',
          learn('Qualidade, não quantidade', `Pra júnior, o portfólio **substitui a experiência**. Melhor **3 projetos bons** que 15 tutoriais copiados.

Um projeto bom:

- resolve um problema real (seu ou de alguém)
- está **no ar** (link de demo: GitHub Pages, Vercel, Netlify)
- tem **README** com print
- tem commits frequentes e com mensagem decente
- idealmente tem **testes**`),
          learn('Ideias que impressionam', `- Um app que você usa de verdade (este Overclock conta!)
- Um clone simplificado de algo conhecido, com uma feature sua
- Um dashboard consumindo uma **API pública** (clima, transporte, câmbio)
- Uma contribuição em projeto **open source** (até corrigir docs vale)
- Um projeto **full-stack**: front + API + banco

Fixe 3 a 6 repos no seu perfil do GitHub (**pinned**).`),
          quiz('Qual desses pesa mais no portfólio de um júnior?', ['20 repositórios de tutorial', 'Um projeto no ar, com README, testes e histórico de commits', 'Muitas estrelas em repos dos outros', 'Um repo com um arquivo só'], 1, 'Mostra que você termina, publica e documenta: é o que o trabalho pede.'),
          quiz('Por que colocar o projeto no ar (demo)?', ['Não precisa, o código basta', 'Recrutador gasta segundos por candidato: clicar e ver funcionando convence mais', 'Pra gastar menos espaço no GitHub', 'É obrigatório pelo GitHub'], 1, 'Um link que funciona é a prova mais rápida de que você entrega.'),
          quiz('O que é um repo **pinned** no GitHub?', ['Um repo privado', 'Um repo fixado no topo do seu perfil', 'Um repo arquivado', 'Um fork'], 1, 'Você escolhe até 6 repos pra aparecerem em destaque no perfil.'),
          code({ title: 'README de projeto', task: 'Escreva o README de um projeto seu (pode ser o Overclock). Em inglês ele serve pra vaga em qualquer lugar. Use as seções `## About`, `## Tech stack` (com 2+ itens `- `), `## How to run` (com um comando em crase, tipo `` `npm install` ``) e `## Live demo` (com um link `https://`).',
            starter: '# Project name\n\n## About\n\n## Tech stack\n\n## How to run\n\n## Live demo\n',
            solution: '# Overclock\n\n## About\nA programming learning app with bite-size lessons, spaced repetition and automated code tests.\n\n## Tech stack\n- JavaScript\n- TypeScript compiler in the browser\n- SQLite (sql.js)\n\n## How to run\nRun `node build.mjs` and open dist/index.html.\n\n## Live demo\nhttps://rickdevdadz7.github.io/trilha-dev/',
            hint: 'Preencha cada seção. No "How to run", coloque o comando entre crases.',
            tests: [['About com conteúdo', '/## About\\s*\\n\\s*[A-Za-z]/.test(text)'], ['Tech stack com 2+ itens', '(text.split("## Tech stack")[1] || "").split("##")[0].split("\\n").filter((l) => /^\\s*- \\S/.test(l)).length >= 2'], ['How to run com comando em crase', '/## How to run[\\s\\S]*?`[^`]+`/.test(text)'], ['Live demo com link', '/## Live demo[\\s\\S]*https:\\/\\/\\S+/.test(text)']] }))
      ),

      unit('CV e LinkedIn',
        lesson('career-cv', 'Um currículo que passa na triagem',
          learn('O básico que vale em todo lugar', `Recrutador gasta poucos segundos no primeiro olhar. Por isso:

- **1 página** (2 no máximo, se tiver muita experiência)
- ordem **cronológica reversa**: o mais recente primeiro
- seções: contato, resumo curto, experiência, projetos, habilidades, formação, idiomas
- arquivo em **PDF**, com nome claro: \`rick-silva-cv.pdf\`
- adapte as palavras-chave pra cada vaga: muitas empresas usam filtros automáticos (ATS)`),
          learn('Cada país tem seu jeito', `O formato muda conforme o destino:

- **EUA e Canadá** (*resume*): sem foto, sem idade, sem estado civil
- **Alemanha** (*Lebenslauf*): datas em MM/AAAA, foto opcional
- **Brasil**: foto e dados pessoais são comuns, mas não obrigatórios

Na dúvida, vá no formato mais enxuto: sem foto e sem dados pessoais além de contato e cidade.`),
          learn('Bullets que vendem', `Recrutador quer **resultado**, não lista de tarefas. Fórmula:

**verbo de ação + o que fez + resultado com número**

- ❌ *Responsible for the website*
- ✅ *Rebuilt the checkout in React, cutting load time by 40%*

Verbos fortes: *built, shipped, reduced, automated, migrated, improved, led*.`),
          quiz('Qual bullet é melhor?', ['Worked with JavaScript', 'Responsible for bugs', 'Automated weekly reports with Node.js, saving 5 hours per week', 'Team player and hard worker'], 2, 'Verbo de ação, tecnologia e resultado medido.'),
          quiz('Você vai mandar o CV pra uma empresa dos EUA. O que tirar?', ['As tecnologias', 'Foto, idade e estado civil', 'Os projetos', 'O e-mail'], 1, 'Nos EUA e no Canadá, foto e dados pessoais costumam ser evitados pra prevenir discriminação.'),
          code({ title: 'Reescreva seus bullets', task: 'Escreva **3 bullets** de experiência ou projetos, cada um começando com `- ` e um **verbo de ação no passado** em inglês (ex.: built, reduced, automated). Pelo menos **2** devem ter um número (%, horas, usuários...).',
            starter: '# 3 bullets: - Verb + what + result (with numbers)\n',
            solution: '- Built a learning app in JavaScript used by 30 students\n- Automated sales reports with Python, saving 4 hours per week\n- Reduced page load time by 35% by lazy-loading images',
            hint: 'Ex.: `- Built a ... used by 50 people` / `- Reduced ... by 20%`',
            tests: [['3+ bullets', 'lines.filter((l) => /^- \\S/.test(l)).length >= 3'], ['Começam com verbo no passado', 'lines.filter((l) => /^- /.test(l)).every((l) => /^- (\\w+ed|built|led|ran|made|wrote|shipped|grew|won|taught|drove|set up)\\b/i.test(l))'], ['2+ com número', 'lines.filter((l) => /^- /.test(l) && /\\d/.test(l)).length >= 2']] })),

        lesson('career-linkedin', 'LinkedIn que recrutador acha',
          learn('Headline e configurações', `Recrutadores **buscam** no LinkedIn por palavras. Sua headline precisa ter:

- o cargo: *Frontend Developer*, *Full-Stack Developer*
- as tecnologias: *React · TypeScript · Node.js*
- o que você procura: *Open to remote work*, *Open to relocation*

Ex.: *Full-Stack Developer · React, TypeScript, SQL · Open to remote roles*

Também: ative **Open to Work** pra recrutadores e preencha a localização que você quer.`),
          quiz('O que mais ajuda um recrutador a te achar?', ['Uma headline criativa tipo "Code ninja 🥷"', 'Cargo e tecnologias escritos do jeito que aparecem nas vagas', 'Muitas fotos', 'Uma headline bem longa sobre sua vida'], 1, 'Recrutador busca por termos exatos: "React Developer", não "ninja".'),
          quiz('Você quer vagas de fora também. Em que idioma deixar o perfil?', ['Só português', 'Inglês (dá pra ter uma versão em português também)', 'Espanhol', 'Tanto faz'], 1, 'Inglês é o idioma padrão de tech no mundo. O LinkedIn permite um perfil secundário em outro idioma.'),
          code({ title: 'Sua headline', task: 'Escreva sua headline do LinkedIn em **uma linha** de até **220 caracteres**, com: um cargo (developer/engineer), **pelo menos 2** tecnologias e o que você procura (remote, relocation, hybrid ou onsite).',
            starter: '# one line, max 220 characters\n',
            solution: 'Full-Stack Developer · JavaScript, TypeScript, React, SQL · Building learning apps · Open to remote roles',
            hint: 'Modelo: `<Cargo> · <Tech1>, <Tech2>, <Tech3> · Open to remote roles`',
            tests: [['Uma linha só', 'lines.length === 1'], ['Até 220 caracteres', 'text.length > 0 && text.length <= 220'], ['Tem um cargo', '/\\b(developer|engineer)\\b/i.test(text)'], ['2+ tecnologias', '(text.match(/\\b(javascript|typescript|react|node(\\.js)?|sql|python|html|css|git|java|vue|angular)\\b/gi) || []).length >= 2'], ['Diz o que procura', '/\\b(remote|relocat\\w*|hybrid|onsite|open to)\\b/i.test(text)']] }))
      ),

      unit('Candidatura',
        lesson('career-apply', 'Onde e como se candidatar',
          learn('Onde procurar', `- **LinkedIn Jobs**: o maior, no mundo todo
- **Indeed** e **Glassdoor**: vagas e salários
- **Gupy** e **Programathor**: vagas no Brasil
- **Wellfound**: startups
- **We Work Remotely** e **Remote OK**: só vagas remotas

Dica: candidatura em massa rende pouco. Melhor 5 candidaturas bem adaptadas que 50 iguais.`),
          learn('A carta (cover letter)', `Algumas vagas pedem uma **cover letter** curta. Estrutura em ~200 palavras:

1. **Por que essa empresa** (algo específico dela, não genérico)
2. **Por que você**: 1 ou 2 conquistas que batem com a vaga
3. **Logística**: quando pode começar, modelo de trabalho (remoto, presencial)
4. Fecho: *I'd be happy to discuss...*`),
          quiz('Como falar de salário quando perguntam sua expectativa?', ['Dizer "o que vocês acharem justo"', 'Dar uma faixa pesquisada pro cargo, nível e lugar', 'Falar o mínimo que aceitaria', 'Recusar responder'], 1, 'Pesquise antes (Glassdoor, levels.fyi, pesquisas salariais) e dê um intervalo. O costume muda por país: no Brasil se fala em mensal; na Europa e nos EUA, em bruto anual.'),
          predict('Qual parte dessa abertura de cover letter é fraca?', 'Dear hiring team,\nI am applying for this job because\nI really need a job.', ['"Dear hiring team"', 'Falar só do que você precisa, sem nada sobre a empresa', 'Escrever em inglês', 'Usar parágrafos'], 1, 'A carta é sobre o que você traz pra eles. Cite algo específico da empresa.'),
          quiz('Qual estratégia de candidatura costuma render mais?', ['Mandar o mesmo CV pra 100 vagas no mesmo dia', 'Poucas candidaturas, com CV e carta adaptados a cada vaga', 'Só aplicar em vagas sênior', 'Esperar o recrutador te achar'], 1, 'Adaptar palavras-chave e mostrar interesse real pela empresa aumenta muito a taxa de resposta.'),
          code({ title: 'Sua cover letter', task: 'Escreva uma cover letter em inglês entre **120 e 260 palavras**. Precisa: começar com `Dear`, citar o nome da empresa (invente uma, ex.: `Acme`), ter uma conquista com número, dizer quando você pode começar (`start`) e terminar com uma despedida (`Best regards` ou `Kind regards`).',
            starter: 'Dear\n\n# 1. why this company\n\n# 2. why you (an achievement with a number)\n\n# 3. when you can start\n\nBest regards,\n',
            solution: 'Dear Acme hiring team,\n\nI am applying for the Junior Frontend Developer role at Acme. I have followed your work on accessible e-commerce, and I love that your checkout is fully usable with a keyboard. That is exactly the kind of product I want to build.\n\nOver the last two years I have been building web apps with JavaScript, TypeScript and React. My latest project is a learning app with automated tests and spaced repetition, used by 30 students every week. I also reduced its load time by 35% by splitting the code and lazy-loading heavy libraries.\n\nI can start within four weeks of an offer, and I am comfortable working remotely or on site. I speak English at B2 level.\n\nI would be happy to discuss how I can help your team.\n\nBest regards,\nRick',
            hint: 'Siga os 3 blocos dos comentários. Lembre do nome da empresa e de um número na sua conquista.',
            tests: [['Começa com Dear', '/^dear\\b/i.test(text)'], ['Entre 120 e 260 palavras', 'words.length >= 120 && words.length <= 260'], ['Conquista com número', '/\\d/.test(text)'], ['Diz quando pode começar', '/\\bstart/i.test(text)'], ['Despedida', '/(best|kind) regards/i.test(text)']] }))
      )
    ]
  });
  // escrita livre: sem modo blocos
  TD.courses[TD.courses.length - 1].units.forEach((u) => u.lessons.forEach((l) => l.steps.forEach((st) => { if (st.t === 'code') st.noBlocks = true; })));
})(window.TD);
