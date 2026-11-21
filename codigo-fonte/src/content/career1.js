/* Carreira na Europa — rotas de visto, CV, LinkedIn, portfólio e candidatura. Valores de 2026: revisar todo ano. */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'career', name: 'Carreira na Europa', badge: 'EU', runner: 'text',
    tagline: 'Do portfólio à vaga na Alemanha',
    desc: 'Rotas de visto pra devs, CV no padrão alemão, LinkedIn, portfólio no GitHub, candidatura e negociação. Foco na Alemanha, mas quase tudo vale pra Europa toda.',
    notes: 'Valores e regras de visto são de **2026** e mudam todo ano. Antes de qualquer decisão, confira no portal oficial **make-it-in-germany.com** e no consulado. Isto é orientação de estudo, não assessoria jurídica.',
    units: [
      unit('O caminho',
        lesson('career-routes', 'Rotas de visto pra devs',
          learn('Blue Card (Blaue Karte EU)', `A rota mais comum pra dev é a **Blue Card**: um visto de trabalho pra quem já tem **oferta de emprego**.

Pra área de TI, dá pra entrar de dois jeitos:

- com **diploma** de ensino superior reconhecido, ou
- **sem diploma**, com pelo menos **3 anos de experiência** comparável em TI.

Isso é raro no mundo: experiência conta como diploma.`),
          learn('O salário mínimo', `A Blue Card exige um **salário bruto anual mínimo**. Em 2026:

- **€50.700**: regra geral
- **€45.934,20**: valor reduzido, que vale pra **profissionais de TI**, profissões em falta e recém-formados

Na prática, vagas de dev costumam pagar acima do mínimo. O número muda todo ano, em janeiro.`),
          learn('Chancenkarte: ir antes da vaga', `Sem oferta ainda? A **Chancenkarte** (Opportunity Card), criada em junho de 2024, dá **1 ano** pra procurar emprego dentro da Alemanha.

No caminho por pontos, você precisa de:

- formação (superior ou técnica de pelo menos 2 anos)
- **inglês B2** ou **alemão A1**
- pelo menos **6 pontos** (idade, experiência, idiomas, ligação com a Alemanha)
- comprovar dinheiro: **€1.091 por mês** em conta bloqueada (2026)`),
          quiz('Rick tem 3 anos de experiência como dev, mas não tem diploma. A Blue Card é possível?', ['Não, diploma é sempre obrigatório', 'Sim: em TI, 3 anos de experiência comparável podem substituir o diploma', 'Só com alemão C1', 'Só se o salário for acima de €100 mil'], 1, 'TI tem essa exceção: experiência profissional comprovada no lugar do diploma.'),
          predict('Uma vaga de dev oferece €48.000 brutos por ano em 2026. Passa no mínimo da Blue Card de TI?', 'salário oferecido: 48000\nmínimo TI 2026:   45934.20\nmínimo geral:     50700', ['Não passa em nenhum', 'Passa no mínimo reduzido de TI', 'Passa nos dois', 'Depende do idioma'], 1, '48.000 é maior que 45.934,20 (mínimo de TI), mas menor que 50.700.'),
          quiz('Qual a diferença principal entre Blue Card e Chancenkarte?', ['Nenhuma', 'Blue Card exige oferta de emprego; a Chancenkarte é pra procurar emprego já na Alemanha', 'Chancenkarte é só pra estudantes', 'Blue Card não permite trabalhar'], 1, 'Blue Card = já tem a vaga. Chancenkarte = vai e procura, por até 1 ano.'),
          code({ title: 'Seu plano', task: 'Escreva seu plano em 4 linhas (pode ser em português):\n\n- `Route:` Blue Card ou Chancenkarte\n- `Target:` mês/ano em que quer se mudar\n- `Gap:` o que falta (ex.: experiência, alemão A1, inglês B2, dinheiro)\n- `Next step:` a primeira ação concreta desta semana',
            starter: 'Route:\nTarget:\nGap:\nNext step:\n',
            solution: 'Route: Blue Card (IT specialist)\nTarget: 03/2028\nGap: 3 years of experience and German A2\nNext step: publish my first portfolio project on GitHub this week',
            hint: 'Preencha cada linha depois dos dois-pontos. O "Next step" tem que ser algo que você consegue fazer em uma semana.',
            tests: [['Route: Blue Card ou Chancenkarte', 'lines.some((l) => /^route:.*(blue|blaue|chancen|opportunity)/i.test(l))'], ['Target com mês/ano', 'lines.some((l) => /^target:.*\\d{4}/i.test(l))'], ['Gap preenchido', 'lines.some((l) => /^gap:\\s*\\S.{3,}/i.test(l))'], ['Next step concreto', 'lines.some((l) => /^next step:\\s*\\S.{10,}/i.test(l))']] }))
      ),

      unit('CV e LinkedIn',
        lesson('career-cv', 'CV no padrão alemão',
          learn('O Lebenslauf', `O currículo alemão (**Lebenslauf**) é direto e factual:

- **1 a 2 páginas**, nunca mais
- ordem **cronológica reversa** (o mais recente primeiro)
- datas no formato **MM/YYYY – MM/YYYY**
- bullets curtos, sem parágrafos
- **foto é opcional**: a lei antidiscriminação (AGG) não exige. Em empresa tech internacional, muita gente não usa.`),
          learn('Bullets que vendem', `Recrutador quer **resultado**, não lista de tarefas. Fórmula:

**verbo de ação + o que fez + resultado com número**

- ❌ *Responsible for the website*
- ✅ *Rebuilt the checkout in React, cutting load time by 40%*

Verbos fortes: *built, shipped, reduced, automated, migrated, improved, led*.`),
          quiz('Qual bullet é melhor?', ['Worked with JavaScript', 'Responsible for bugs', 'Automated weekly reports with Node.js, saving 5 hours per week', 'Team player and hard worker'], 2, 'Verbo de ação, tecnologia e resultado medido.'),
          code({ title: 'Reescreva seus bullets', task: 'Escreva **3 bullets** de experiência em inglês, cada um começando com `- ` e um **verbo de ação no passado** (ex.: built, reduced, automated). Pelo menos **2** devem ter um número (%, horas, usuários...).',
            starter: '# 3 bullets: - Verb + what + result (with numbers)\n',
            solution: '- Built a learning app in JavaScript used by 30 students\n- Automated sales reports with Python, saving 4 hours per week\n- Reduced page load time by 35% by lazy-loading images',
            hint: 'Ex.: `- Built a ... used by 50 people` / `- Reduced ... by 20%`',
            tests: [['3+ bullets', 'lines.filter((l) => /^- \\S/.test(l)).length >= 3'], ['Começam com verbo no passado', 'lines.filter((l) => /^- /.test(l)).every((l) => /^- (\\w+ed|built|led|ran|made|wrote|shipped|grew|won|taught|drove|built|set up)\\b/i.test(l))'], ['2+ com número', 'lines.filter((l) => /^- /.test(l) && /\\d/.test(l)).length >= 2']] })),

        lesson('career-linkedin', 'LinkedIn que recrutador acha',
          learn('Headline e configurações', `Recrutadores **buscam** no LinkedIn por palavras. Sua headline precisa ter:

- o cargo: *Frontend Developer*, *Full-Stack Developer*
- as tecnologias: *React · TypeScript · Node.js*
- o objetivo: *Open to relocation to Germany*

Ex.: *Full-Stack Developer · React, TypeScript, SQL · Open to relocation (Germany)*

Também: perfil **em inglês**, ative **Open to Work** pra recrutadores e coloque a localização desejada.`),
          quiz('O que mais ajuda um recrutador a te achar?', ['Uma headline criativa tipo "Code ninja 🥷"', 'Cargo e tecnologias escritos do jeito que aparecem nas vagas', 'Muitas fotos', 'Perfil em português'], 1, 'Recrutador busca por termos exatos: "React Developer", não "ninja".'),
          quiz('Seu perfil do LinkedIn deve estar em qual idioma pra vagas na Alemanha em tech?', ['Português', 'Inglês (e alemão, se você tiver nível)', 'Espanhol', 'Tanto faz'], 1, 'Inglês é a língua padrão de tech. Uma versão em alemão é bônus.'),
          code({ title: 'Sua headline', task: 'Escreva sua headline do LinkedIn em inglês, em **uma linha** de até **220 caracteres**, com: um cargo (developer/engineer), **pelo menos 2** tecnologias e menção a **relocation** ou **Germany**.',
            starter: '# one line, max 220 characters\n',
            solution: 'Full-Stack Developer · JavaScript, TypeScript, React, SQL · Building learning apps · Open to relocation to Germany',
            hint: 'Modelo: `<Cargo> · <Tech1>, <Tech2>, <Tech3> · Open to relocation to Germany`',
            tests: [['Uma linha só', 'lines.length === 1'], ['Até 220 caracteres', 'text.length > 0 && text.length <= 220'], ['Tem um cargo', '/\\b(developer|engineer)\\b/i.test(text)'], ['2+ tecnologias', '(text.match(/\\b(javascript|typescript|react|node(\\.js)?|sql|python|html|css|git|java|vue|angular)\\b/gi) || []).length >= 2'], ['Fala de relocation/Germany', '/\\b(relocat\\w*|germany|europe)\\b/i.test(text)']] }))
      ),

      unit('Portfólio',
        lesson('career-portfolio', 'O que colocar no portfólio',
          learn('Qualidade, não quantidade', `Pra júnior, o portfólio **substitui a experiência**. Melhor **3 projetos bons** que 15 tutoriais copiados.

Um projeto bom:

- resolve um problema real (seu ou de alguém)
- está **no ar** (link de demo: GitHub Pages, Vercel, Netlify)
- tem **README** em inglês, com print
- tem commits frequentes e com mensagem decente
- idealmente tem **testes**`),
          learn('Ideias que impressionam', `- Um app que você usa de verdade (este Trilha Dev conta!)
- Um clone simplificado de algo conhecido, com uma feature sua
- Um dashboard consumindo uma **API pública** (clima, transporte, câmbio)
- Uma contribuição em projeto **open source** (até corrigir docs vale)
- Um projeto **full-stack**: front + API + banco

Fixe 3 a 6 repos no seu perfil do GitHub (**pinned**).`),
          quiz('Qual desses pesa mais no portfólio de um júnior?', ['20 repositórios de tutorial', 'Um projeto no ar, com README, testes e histórico de commits', 'Muitas estrelas em repos dos outros', 'Um repo com um arquivo só'], 1, 'Mostra que você termina, publica e documenta: é o que o trabalho pede.'),
          quiz('Por que colocar o projeto no ar (demo)?', ['Não precisa, o código basta', 'Recrutador gasta segundos por candidato: clicar e ver funcionando convence mais', 'Pra gastar menos espaço no GitHub', 'É obrigatório pelo GitHub'], 1, 'Um link que funciona é a prova mais rápida de que você entrega.'),
          quiz('O que é um repo **pinned** no GitHub?', ['Um repo privado', 'Um repo fixado no topo do seu perfil', 'Um repo arquivado', 'Um fork'], 1, 'Você escolhe até 6 repos pra aparecerem em destaque no perfil.'),
          code({ title: 'README de projeto', task: 'Escreva o README em inglês de um projeto seu (pode ser o Trilha Dev). Use as seções `## About`, `## Tech stack` (com 2+ itens `- `), `## How to run` (com um comando em crase, tipo `` `npm install` ``) e `## Live demo` (com um link `https://`).',
            starter: '# Project name\n\n## About\n\n## Tech stack\n\n## How to run\n\n## Live demo\n',
            solution: '# Trilha Dev\n\n## About\nA programming learning app with bite-size lessons, spaced repetition and automated code tests.\n\n## Tech stack\n- JavaScript\n- TypeScript compiler in the browser\n- SQLite (sql.js)\n\n## How to run\nRun `node build.mjs` and open dist/index.html.\n\n## Live demo\nhttps://rickdevdadz7.github.io/trilha-dev/',
            hint: 'Preencha cada seção. No "How to run", coloque o comando entre crases.',
            tests: [['About com conteúdo', '/## About\\s*\\n\\s*[A-Za-z]/.test(text)'], ['Tech stack com 2+ itens', '(text.split("## Tech stack")[1] || "").split("##")[0].split("\\n").filter((l) => /^\\s*- \\S/.test(l)).length >= 2'], ['How to run com comando em crase', '/## How to run[\\s\\S]*?`[^`]+`/.test(text)'], ['Live demo com link', '/## Live demo[\\s\\S]*https:\\/\\/\\S+/.test(text)']] }))
      ),

      unit('Candidatura',
        lesson('career-apply', 'Onde e como se candidatar',
          learn('Onde procurar', `- **LinkedIn Jobs**: filtre por *Germany* e *English*
- **StepStone**: o maior site de vagas da Alemanha
- **Arbeitnow**, **GermanTechJobs**, **Berlin Startup Jobs**: focados em tech
- **make-it-in-germany.com**: portal oficial, com vagas pra estrangeiros

Dica: muitas vagas de tech em Berlim e Munique são **em inglês**. Procure por *"English speaking"*.`),
          learn('A carta (cover letter)', `Muitas empresas pedem uma **cover letter** curta (o *Anschreiben*). Estrutura em ~200 palavras:

1. **Por que essa empresa** (algo específico dela, não genérico)
2. **Por que você**: 1 ou 2 conquistas que batem com a vaga
3. **Logística**: visto, data de início, *"I am eligible for the EU Blue Card"*
4. Fecho: *I'd be happy to discuss...*`),
          quiz('Como falar de salário quando perguntam sua expectativa?', ['Dizer "o que vocês acharem justo"', 'Dar uma faixa de salário bruto anual pesquisada pro cargo e cidade', 'Dar o salário líquido mensal em reais', 'Recusar responder'], 1, 'Na Alemanha se fala em **bruto anual** (brutto). Pesquise a faixa e dê um intervalo.'),
          quiz('Quando falam em salário na Alemanha, normalmente é:', ['Líquido mensal', 'Bruto anual', 'Líquido anual', 'Por hora'], 1, 'O padrão é bruto anual (Bruttojahresgehalt). O líquido depende de impostos e da sua classe fiscal.'),
          predict('Qual parte dessa abertura de cover letter é fraca?', 'Dear hiring team,\nI am applying for this job because\nI need a job in Germany.', ['"Dear hiring team"', 'Falar só do que você precisa, sem nada sobre a empresa', 'Escrever em inglês', 'Usar parágrafos'], 1, 'A carta é sobre o que você traz pra eles. Cite algo específico da empresa.'),
          code({ title: 'Sua cover letter', task: 'Escreva uma cover letter em inglês entre **120 e 260 palavras**. Precisa: começar com `Dear`, citar o nome da empresa (invente uma, ex.: `Acme`), ter uma conquista com número, mencionar o visto (`Blue Card` ou `visa`) e terminar com uma despedida (`Best regards` ou `Kind regards`).',
            starter: 'Dear\n\n# 1. why this company\n\n# 2. why you (an achievement with a number)\n\n# 3. visa and start date\n\nBest regards,\n',
            solution: 'Dear Acme hiring team,\n\nI am applying for the Junior Frontend Developer role at Acme. I have followed your work on accessible e-commerce, and I love that your checkout is fully usable with a keyboard. That is exactly the kind of product I want to build.\n\nOver the last two years I have been building web apps with JavaScript, TypeScript and React. My latest project is a learning app with automated tests and spaced repetition, used by 30 students every week. I also reduced its load time by 35% by splitting the code and lazy-loading heavy libraries.\n\nI am based in Brazil, I am eligible for the EU Blue Card, and I can relocate to Berlin within three months of an offer. I speak English at B2 level and I am studying German.\n\nI would be happy to discuss how I can help your team.\n\nBest regards,\nRick',
            hint: 'Siga os 3 blocos dos comentários. Lembre do nome da empresa e de um número na sua conquista.',
            tests: [['Começa com Dear', '/^dear\\b/i.test(text)'], ['Entre 120 e 260 palavras', 'words.length >= 120 && words.length <= 260'], ['Conquista com número', '/\\d/.test(text)'], ['Fala do visto', '/\\b(blue card|visa|blaue karte|work permit)\\b/i.test(text)'], ['Despedida', '/(best|kind) regards/i.test(text)']] }))
      )
    ]
  });
})(window.TD);
