/* Trabalhar fora — remoto pra empresas de fora e rotas por destino. Regras de visto mudam todo ano: revisar (valores de 2026). */
(function (TD) {
  'use strict';
  const { learn, quiz, predict, code, lesson, unit } = TD.C;

  TD.courses.push({
    id: 'abroad', name: 'Trabalhar fora', badge: 'INT', runner: 'text', group: 'career',
    tagline: 'Remoto ou mudando de país',
    desc: 'Os caminhos pra trabalhar com empresas de fora: remoto sem sair de casa ou mudando de país. Rotas de visto de Europa (Alemanha e Portugal) e Canadá, com o que é realista pra dev em cada uma.',
    notes: 'Regras de visto e valores são de **2026** e mudam com frequência. Antes de qualquer decisão, confira no site oficial do governo do país e no consulado. Isto é orientação de estudo, não assessoria jurídica.',
    units: [
      unit('Escolhendo o caminho',
        lesson('abroad-paths', 'Remoto, mudar de país ou os dois',
          learn('Três caminhos', `Trabalhar pra fora não exige, necessariamente, sair do país:

1. **Remoto pra empresa de fora**: você continua onde mora e recebe em dólar ou euro. Não precisa de visto.
2. **Mudar com uma vaga** (relocation): a empresa te contrata e o visto sai junto com o contrato.
3. **Mudar pra procurar vaga lá**: alguns países têm vistos de busca de emprego.

Muita gente faz o 1 primeiro, ganha experiência internacional e inglês, e depois parte pro 2.`),
          learn('O que pesa na escolha', `- **Inglês**: é o requisito número 1 nos três caminhos
- **Experiência**: júnior consegue remoto e relocation, mas é mais difícil; 2 a 3 anos de experiência abrem muitas portas
- **Diploma**: alguns vistos exigem, outros aceitam experiência no lugar
- **Idioma local**: pra morar, ajuda muito (alemão na Alemanha, francês em parte do Canadá)
- **Dinheiro guardado**: mudar custa caro, e alguns vistos exigem comprovar saldo`),
          quiz('Qual caminho não precisa de visto?', ['Mudar com uma vaga', 'Visto de busca de emprego', 'Trabalhar remoto pra empresa de fora, morando no seu país', 'Nenhum'], 2, 'Se você continua morando no seu país, não há visto de trabalho envolvido. O que muda é contrato, pagamento e impostos.'),
          quiz('Qual é o requisito que aparece em praticamente todos os caminhos?', ['Diploma de mestrado', 'Inglês', 'Ter morado fora antes', 'Saber alemão'], 1, 'Entrevista, documentação, dia a dia com o time: tudo passa pelo inglês.'),
          quiz('Por que muita gente começa pelo remoto antes de mudar de país?', ['Porque é proibido mudar sem ter trabalhado remoto', 'Pra ganhar experiência internacional e inglês sem o custo e o risco da mudança', 'Porque paga mais que qualquer vaga lá fora', 'Porque não precisa de inglês'], 1, 'Experiência com time de fora pesa no currículo e na entrevista de relocation, e você testa se gosta do ritmo antes de se mudar.'),
          code({ title: 'Seu plano', task: 'Escreva seu plano em 4 linhas (pode ser em português):\n\n- `Route:` remoto, relocation ou visto de busca (e o país, se for mudar)\n- `Target:` mês/ano\n- `Gap:` o que falta (ex.: inglês, experiência, portfólio, dinheiro)\n- `Next step:` a primeira ação concreta desta semana',
            starter: 'Route:\nTarget:\nGap:\nNext step:\n',
            solution: 'Route: remote job for a foreign company first, then relocation\nTarget: 03/2028\nGap: English for interviews and 2 portfolio projects\nNext step: publish my first portfolio project on GitHub this week',
            hint: 'Preencha cada linha depois dos dois-pontos. O "Next step" tem que ser algo que você consegue fazer em uma semana.',
            tests: [['Route preenchido', 'lines.some((l) => /^route:\\s*\\S.{3,}/i.test(l))'], ['Target com ano', 'lines.some((l) => /^target:.*\\d{4}/i.test(l))'], ['Gap preenchido', 'lines.some((l) => /^gap:\\s*\\S.{3,}/i.test(l))'], ['Next step concreto', 'lines.some((l) => /^next step:\\s*\\S.{10,}/i.test(l))']] }))
      ),

      unit('Remoto internacional',
        lesson('abroad-remote', 'Trabalhando remoto pra fora',
          learn('Como funciona a contratação', `Empresa de fora normalmente te contrata de um destes jeitos:

- **Contractor** (prestador de serviço): você tem uma empresa ou se registra como autônomo no seu país, emite nota e recebe do exterior
- **Employer of Record** (EOR): plataformas como Deel ou Remote contratam você **no seu país** em nome da empresa de fora
- **Contrato direto**, quando a empresa já tem filial no seu país

Impostos e o tipo de empresa mudam de país pra país: **converse com um contador** antes de assinar.`),
          learn('O que as empresas remotas querem ver', `- **Comunicação escrita** clara, em inglês: muita coisa acontece por mensagem
- **Autonomia**: resolver sem ninguém do lado
- **Fuso horário**: algumas horas de sobreposição com o time
- **Histórico público**: GitHub, projetos no ar, open source

Dica: procure vagas com *"remote (LATAM)"*, *"remote (worldwide)"* ou *"anywhere"*. Muitas vagas "remote" aceitam só quem mora num país específico.`),
          quiz('A vaga diz "Remote (US only)". O que isso quer dizer?', ['Qualquer pessoa pode aplicar', 'É remota, mas só pra quem mora (e pode trabalhar) nos EUA', 'Precisa ir aos EUA uma vez por mês', 'Paga em dólar'], 1, 'Remoto não significa "de qualquer lugar". Procure "worldwide", "anywhere" ou a sua região.'),
          quiz('Antes de assinar um contrato de contractor com empresa de fora, o mais importante é:', ['Pedir adiantamento', 'Entender impostos e a forma de receber, com um contador', 'Mudar de banco', 'Abrir conta no exterior obrigatoriamente'], 1, 'Cada país tem regras próprias pra quem recebe do exterior. Um contador evita multa e imposto pago a mais.'),
          predict('Qual dessas mensagens assíncronas é melhor pro time remoto?', '# A: "oi, tá aí?"\n# B: "Hi! The login test fails on staging\n#     with a 500. Logs attached. Can you\n#     check the auth config today?"', ['A, porque é curta', 'B: contexto, evidência e pedido claro numa mensagem só', 'As duas são iguais', 'Nenhuma: tem que ligar'], 1, 'Em time remoto, "oi, tá aí?" faz a pessoa esperar. Mande tudo de uma vez: o quê, a evidência e o que você precisa.'),
          code({ title: 'Candidatura remota', task: 'Escreva em inglês a mensagem curta (3 a 6 linhas) que você mandaria junto com a candidatura pra uma vaga remota. Precisa: dizer seu cargo/stack, seu **fuso horário** ou região (`timezone`, `UTC` ou `GMT`), um link (`https://`) pro GitHub ou portfólio e terminar com uma despedida.',
            starter: '# 3 to 6 lines\n# who you are + stack, your timezone, a link, sign-off\n',
            solution: 'Hi! I am a frontend developer working with React and TypeScript.\nI am based in Brazil (UTC-3) and I can overlap 4+ hours with US and European teams.\nYou can see my projects here: https://github.com/RickDevDadz7\nBest regards,\nRick',
            hint: 'Ex.: `I am based in Brazil (UTC-3)` e o link do seu GitHub.',
            tests: [['3 a 6 linhas', 'lines.length >= 3 && lines.length <= 6'], ['Cita a stack', '/\\b(react|typescript|javascript|node|sql|python|vue|angular)\\b/i.test(text)'], ['Diz o fuso horário', '/\\b(utc|gmt|timezone|time zone)\\b/i.test(text)'], ['Tem um link', '/https:\\/\\/\\S+/.test(text)'], ['Despedida', '/(regards|thanks|thank you|cheers|best)/i.test(text)']] }))
      ),

      unit('Europa',
        lesson('career-routes', 'Alemanha e o Blue Card',
          learn('EU Blue Card', `O **EU Blue Card** é o visto de trabalho qualificado da União Europeia. Vale em **25 dos 27 países** (não vale na Dinamarca nem na Irlanda), e cada país define o próprio salário mínimo.

Pra ter, você precisa de uma **oferta de emprego** qualificado de pelo menos 6 meses e de um salário acima do mínimo daquele país.`),
          learn('Alemanha: TI tem regra especial', `Na **Alemanha**, pra área de TI dá pra entrar de dois jeitos:

- com **diploma** de ensino superior reconhecido, ou
- **sem diploma**, com pelo menos **3 anos de experiência** comparável em TI.

Salário bruto anual mínimo em 2026:

- **€50.700**: regra geral
- **€45.934,20**: pra **TI**, profissões em falta e recém-formados`),
          learn('Chancenkarte: ir antes da vaga', `Sem oferta ainda? A **Chancenkarte** (Opportunity Card) alemã dá **1 ano** pra procurar emprego dentro da Alemanha.

No caminho por pontos, você precisa de:

- formação (superior ou técnica de pelo menos 2 anos)
- **inglês B2** ou **alemão A1**
- pelo menos **6 pontos** (idade, experiência, idiomas, ligação com a Alemanha)
- comprovar dinheiro: **€1.091 por mês** em conta bloqueada (2026)`),
          quiz('Um dev tem 3 anos de experiência, mas não tem diploma. A Blue Card alemã é possível?', ['Não, diploma é sempre obrigatório', 'Sim: em TI, 3 anos de experiência comparável podem substituir o diploma', 'Só com alemão C1', 'Só se o salário for acima de €100 mil'], 1, 'TI tem essa exceção na Alemanha: experiência profissional comprovada no lugar do diploma.'),
          predict('Uma vaga de dev na Alemanha oferece €48.000 brutos por ano em 2026. Passa no mínimo da Blue Card de TI?', 'salário oferecido: 48000\nmínimo TI 2026:   45934.20\nmínimo geral:     50700', ['Não passa em nenhum', 'Passa no mínimo reduzido de TI', 'Passa nos dois', 'Depende do idioma'], 1, '48.000 é maior que 45.934,20 (mínimo de TI), mas menor que 50.700.'),
          quiz('Qual a diferença principal entre Blue Card e Chancenkarte?', ['Nenhuma', 'Blue Card exige oferta de emprego; a Chancenkarte é pra procurar emprego já na Alemanha', 'Chancenkarte é só pra estudantes', 'Blue Card não permite trabalhar'], 1, 'Blue Card = já tem a vaga. Chancenkarte = vai e procura, por até 1 ano.')),

        lesson('abroad-portugal', 'Portugal',
          learn('As rotas pra dev', `Portugal é popular entre brasileiros por causa do idioma. As rotas mais comuns pra dev:

- **Tech Visa**: pra trabalhar numa empresa de tecnologia **certificada** no programa, com processo mais rápido
- **Visto de trabalho qualificado** ou **EU Blue Card**: com uma oferta de emprego
- **Visto de nômade digital (D8)**: pra quem trabalha **remoto** pra empresa de fora e quer morar lá, comprovando renda`),
          learn('Atenção à busca de emprego', `Em 2025, Portugal mudou a lei de imigração: o antigo visto de procura de trabalho foi substituído por um visto pra **competências técnicas especializadas**, que até o fim de 2026 ainda dependia de regulamentação pra abrir nos consulados.

Também acabou a possibilidade de entrar como turista e trocar pra visto de trabalho lá dentro. Na prática: **consiga a vaga antes de ir**.

Brasileiros têm acordos próprios dentro da **CPLP**: vale pesquisar no site do consulado.`),
          quiz('Você trabalha remoto pra uma empresa americana e quer morar em Portugal. Qual rota combina mais?', ['Tech Visa', 'Visto de nômade digital (D8)', 'Blue Card', 'Visto de estudante'], 1, 'O D8 é pra quem já tem renda de trabalho remoto. Tech Visa e Blue Card exigem vaga numa empresa em Portugal ou na UE.'),
          quiz('Qual a estratégia mais segura pra trabalhar em Portugal hoje?', ['Entrar como turista e procurar emprego lá', 'Conseguir a oferta de emprego antes de viajar', 'Esperar a lei mudar', 'Abrir uma empresa lá sem visto'], 1, 'A troca de turista pra trabalhador acabou em 2024, e o novo visto de busca ainda não estava aberto: a vaga antes é o caminho seguro.'))
      ),

      unit('Canadá',
        lesson('abroad-canada', 'Canadá e o Express Entry',
          learn('Como funciona', `O principal caminho de imigração qualificada pro Canadá é o **Express Entry**, que dá **residência permanente**.

Você cria um perfil e recebe uma pontuação (**CRS**) por idade, formação, experiência e idiomas (inglês e francês). Periodicamente o governo faz sorteios ("draws") e convida os perfis com mais pontos.

Além dos draws gerais, existem draws por **categoria**: profissões que o país quer priorizar naquele ano.`),
          learn('A realidade pra dev em 2026', `Em 2026 o Canadá reorganizou as categorias, e **desenvolvedores de software saíram da lista de STEM** priorizada. Ou seja: dev concorre nos draws gerais, com pontuação de corte alta.

O que mais aumenta pontos:

- **inglês** muito bom (e **francês**, que conta muito)
- experiência de trabalho, de preferência **no Canadá**
- uma **oferta de emprego** ou indicação de uma província (PNP)`),
          quiz('No Express Entry, o que é o CRS?', ['O nome do visto', 'A pontuação do seu perfil, que define se você é convidado', 'Um exame de inglês', 'O salário mínimo'], 1, 'CRS (Comprehensive Ranking System) é a nota do perfil. Quem tem mais pontos é convidado nos draws.'),
          quiz('Pra um dev brasileiro que quer o Canadá, o que mais aumenta as chances?', ['Ter muitos repositórios no GitHub', 'Melhorar muito o inglês e, se possível, aprender francês', 'Morar perto da fronteira', 'Aplicar várias vezes no mesmo dia'], 1, 'Idiomas pesam muito no CRS, e francês dá pontos extras e acesso a draws próprios.'),
          quiz('O Express Entry dá que tipo de status?', ['Visto de turista', 'Residência permanente', 'Visto de estudante', 'Cidadania imediata'], 1, 'Quem é convidado e aprovado recebe residência permanente: pode morar e trabalhar em qualquer lugar do Canadá.'))
      )
    ]
  });
  // escrita livre: sem modo blocos
  TD.courses[TD.courses.length - 1].units.forEach((u) => u.lessons.forEach((l) => l.steps.forEach((st) => { if (st.t === 'code') st.noBlocks = true; })));
})(window.TD);
