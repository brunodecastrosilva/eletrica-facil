# Código do Projeto Fácil

Versão **0.14.0 (rascunho)** · 27/11/2026 · Kit Fácil **0.9.1**

Princípios comuns dos aplicativos do Projeto Fácil, em artigos. Os detalhes (medidas, cores, nomes de funções, o
comportamento de cada controle) ficam nos **Anexos do Código** (`comum/ANEXOS.md`). O estado de cada aplicativo, as
pendências, as decisões e as exceções ficam no **Painel**, e as Regras de cada aplicativo em `claude/<app>.md`, os dois
no projeto Integrador do claude.ai.

Enquanto a versão começar com `0.`, este Código é rascunho e pode mudar por inteiro; a versão **1.0** será a primeira
oficial.

## Princípios

1. **Objetivo.** Padronizar o que é comum aos aplicativos, para dar consistência, facilitar a manutenção, evitar
   trabalho repetido e reaproveitar soluções.
2. **Mercado.** Os aplicativos são produtos para terceiros, com finalidade comercial: consideram desde o início a
   usabilidade, a confiabilidade, a segurança, a manutenção e a viabilidade comercial.
3. **Independência.** Cada aplicativo é desenvolvido, testado, versionado e documentado no seu repositório, sem impedir
   os padrões comuns.
4. **Sincronização e web.** Todo aplicativo funciona por inteiro no navegador, do celular ao computador, e sincroniza
   os dados entre aparelhos com segurança.
5. **Retorno de quem usa.** Todo aplicativo tem o mesmo jeito de avaliar e de relatar problema, e o retorno orienta as
   correções e as funções novas.
6. **Família com personalidade.** Os aplicativos se comportam do mesmo jeito e têm cara própria, pensada para o seu
   público.
7. **Equilíbrio.** Quando uma solução serve a mais de um aplicativo, ela vira padrão. Aplicativo novo segue este
   Código, salvo justificativa registrada.
8. **Segurança.** Os aplicativos são seguros desde a primeira versão, e falha de segurança passa na frente de função
   nova.

---

## TÍTULO I — DISPOSIÇÕES GERAIS

**Art. 1º** Este Código vale para o Conta Fácil, o Elétrica Fácil, o Guitarra Fácil e qualquer aplicativo novo do
Projeto Fácil, desde a sua criação.

§ 1º O Estudo Fácil é, por decisão do Bruno (27/11/2026), um aplicativo pessoal dele, fora da família comercial: segue
este Código nos Títulos III e IV (repositório, publicação, dados e segurança) e no Kit; no resto, valem as Regras dele.
Os outros aplicativos não o mostram na lista da família.

§ 2º O Guitarra Fácil está em espera desde 27/11/2026: nada é mexido nele até o Bruno chamar.

§ 3º O Projeto CCOE não segue este Código.

**Art. 2º** As regras estão em três níveis, e na dúvida vale o de cima:

I – este Código, com os princípios;

II – os Anexos, com os detalhes; anexo que contraria artigo deve ser corrigido;

III – as Regras de cada aplicativo, em `claude/<app>.md` no Integrador, com o README e o CHANGELOG do repositório.

**Art. 3º** Um aplicativo só deixa de seguir uma regra comum com justificativa técnica ou comercial aprovada pelo Bruno
e registrada na seção "Exceções ao padrão" do README e no Painel.

**Art. 4º** Este Código e os Anexos só mudam no projeto Integrador, por decisão do Bruno. A mudança termina com o texto
novo em `comum/` dos repositórios, a skill `codigo-projeto-facil` acertada quando mudar um artigo e o registro no
Painel.

---

## TÍTULO II — DO PRODUTO

**Art. 5º** A fase de testes não tem data para acabar. O GitHub é o ambiente de testes; depois, os aplicativos vão
para as lojas. O plano de negócio (gratuidade, apoio por Pix, assinatura ou outro) está em revisão no Painel; até lá
valem a gratuidade e o apoio voluntário do Anexo IX.

**Art. 6º** Os aplicativos são só em português do Brasil, por enquanto. Os textos são curtos e diretos; botão tem verbo;
erro diz o que aconteceu e o que fazer.

**Parágrafo único.** Campo vazio diz o que vai nele e convida a preencher. Nenhum texto diz que um campo é opcional nem
usa "se quiser".

**Art. 7º** A acessibilidade é obrigatória em todas as telas, no nível AA das diretrizes WCAG 2.2, no claro e no
escuro, com movimento reduzido respeitado (Anexo IX).

**Art. 8º** Os aplicativos seguem a lei brasileira (Código de Defesa do Consumidor, LGPD e as que se aplicarem),
conferida na versão atual, na internet, antes de cada função que a toque. O aplicativo nunca induz quem usa a uma
cláusula nula.

---

## TÍTULO III — DOS REPOSITÓRIOS E DA PUBLICAÇÃO

**Art. 9º** Cada aplicativo tem o seu repositório público no GitHub, sem licença (todos os direitos reservados), sem
credenciais, chaves, senhas nem dados pessoais reais. Como todos dividem o mesmo endereço, cada um usa o seu prefixo, o
seu manifesto e o seu service worker (Anexo I).

**Art. 10.** Não há etapa de build: o que está no repositório é o que vai para o ar. Biblioteca de terceiros entra por
CDN, com versão fixa e verificação de integridade.

**Art. 11.** A versão é `maior.menor.correção`, igual no `package.json`, no código, no cache do service worker e no
topo do CHANGELOG. `0.x` é fase de testes; `1.x`, aplicativo pronto para a publicação oficial.

**Art. 12.** Publicar é enviar direto para a `main`. Antes, rodam a verificação do padrão e os testes da parte alterada;
a cada envio, os testes automáticos do GitHub rodam a verificação e a bateria completa (Anexo VII).

§ 1º Teste automático que falha é corrigido na hora; se o aplicativo abrir com erro no ar, desfaz-se o envio
(`git revert`) e só depois se investiga.

§ 2º Depois de publicar, o aplicativo é aberto no ar, sem erro no console.

**Art. 13.** Cada versão diz no CHANGELOG, em português e para quem usa, o que mudou, e passa as mesmas novidades ao
Kit.

**Art. 14.** O Kit Fácil é o código comum (pasta `comum/`): sistema de design, moldura, Ajustes, avaliação,
sincronização, apoio, componentes, abertura, guia e a verificação do padrão (Anexos II e VII).

§ 1º Os aplicativos usam as peças do Kit em vez de criar versões próprias.

§ 2º Quando uma peça atrapalha a qualidade de um aplicativo, ele passa por cima dela sem mudar o Kit, registra no
README qual peça e por quê, e a solução vai para o Painel como proposta para o Kit.

---

## TÍTULO IV — DOS DADOS E DA SEGURANÇA

**Art. 15.** Os dados ficam no aparelho, com o prefixo do aplicativo, e o aplicativo funciona sem conta e sem internet.
Enquanto só o Bruno usa os aplicativos, a versão nova pode trocar o formato dos dados sem migrar; quando houver outras
pessoas, toda troca vem com migração.

**Art. 16.** A sincronização entre aparelhos é opcional, igual em todos e criptografada no aparelho, com a mudança mais
recente vencendo registro a registro (Anexo III). Antes das lojas, ela passa a usar o login próprio (Google ou e-mail).

**Art. 17.** Todo aplicativo tem cópia de segurança em arquivo e "Restaurar padrões de fábrica", que apaga só o que é
dele neste aparelho.

**Art. 18.** No servidor guarda-se só o necessário, com prazo de guarda definido: avaliações e relatos de problema, 2
anos, com limpeza manual mensal enquanto o plano for o gratuito.

**Art. 19.** Segurança (Anexo VIII):

I – o banco só aceita o que é previsto, campo a campo, e o que não tem regra fica fechado; regra nova é testada antes e
depois de publicar;

II – toda escrita aberta tem limite no aparelho e no servidor (verificação de que o pedido vem do aplicativo e chave
restrita ao endereço oficial);

III – toda página tem política de segurança de conteúdo (CSP), igual nos aplicativos; texto de fora é protegido antes
de ir para a tela; chaves de acesso ficam só no aparelho, com a menor permissão possível;

IV – toda versão passa pela lista do Anexo VIII, e há uma auditoria completa a cada três meses.

**Art. 20.** Os termos de uso e a política de privacidade ficam em nome de Bruno de Castro Silva (contato
cas_bruno@outlook.com) e são publicados depois de revisão jurídica.

---

## TÍTULO V — DA INTERFACE

**Art. 21.** Todos os aplicativos usam o sistema de design do Kit. Cada um cria a sua personalidade dentro dele: cor
de destaque e de começar, marca, ideia visual, fonte dos títulos, guias próprias e a composição de cada tela (Anexo I).

**Art. 22.** A moldura, os Ajustes, os componentes, o movimento, a abertura e o guia se comportam do mesmo jeito em
todos os aplicativos (Anexo IX). O Conta Fácil é a referência desse comportamento; o fluxo de trabalho e o desenho das
telas são de cada aplicativo, feitos para o seu público.

**Art. 23.** A interface é mínima e se explica sozinha:

I – prevê os casos que podem acontecer e oferece o caminho para cada um;

II – cada função fica num lugar só;

III – não decide pela pessoa: quando há mais de um caminho, ela escolhe, com um padrão marcado;

IV – pede só o que precisa, no primeiro momento em que o trabalho depende do dado, para funcionar ou para cumprir a
lei; as Regras de cada aplicativo dizem o que é pedido onde.

**Art. 24.** Todo aplicativo tem o mesmo mecanismo de avaliação e relato de problema (Anexo IV).

**Art. 25.** Todo aplicativo é instalável, abre sem internet depois da primeira visita e funciona do celular ao
computador sem rolagem lateral.

---

## TÍTULO VI — DA CONDUTA DO CLAUDE

**Art. 26.** O Claude trabalha no projeto Integrador e, dali, direto nos repositórios, nos consoles e nos sites; os
aplicativos não têm mais Projetos próprios no claude.ai. Pedido de um aplicativo só segue as Regras dele; o que servir
aos outros vira proposta de padrão.

**Art. 27.** **Decidir desenho e texto; perguntar o resto.** O Claude decide o desenho e os textos e relata o que
decidiu, com o texto antigo e o novo lado a lado. Pergunta antes só quando a decisão custa dinheiro, não tem volta ou
muda uma regra, ou quando há dúvida real. Sem o Bruno presente, toma a leitura mais razoável, diz qual foi e deixa
preparada a decisão sem volta.

**Art. 28.** **Opções com desenho.** Quando o Bruno precisa escolher, cada opção vem desenhada, em cartões lado a lado,
com a recomendada marcada, e só depois vem a pergunta (Anexo IX, Art. 84).

**Art. 29.** **Reportar e propor.** O Claude informa os erros que encontrar, mesmo fora do pedido, e propõe melhorias,
separadas do que fez. As de desenho e de texto ele aplica e relata; as demais só com o "sim" do Bruno.

**Art. 30.** **Crítica e autocrítica.** O Claude procura de propósito o que está errado, impreciso ou mal pensado em cada
pedido e em cada proposta própria e diz no começo da resposta; quando discorda, diz "discordo" e o motivo. A crítica é
pelo mérito, nunca por reflexo.

§ 1º Antes de entregar, confere os próprios vieses: concordar só porque já foi dito, aplicar regra ao pé da letra sem
ver o propósito, dizer pronto sem conferir, buscar só o que confirma, afirmar o que não verificou, resolver com a
solução de molde quando o público pede outra.

§ 2º Toda entrega com decisão termina com "Onde posso estar errado", com até três pontos concretos.

**Art. 31.** **Professor, orientador e designer.** O Claude ensina em linguagem simples, explicando cada termo técnico
onde ele aparece; aponta maus hábitos; não executa no automático quando há caminho melhor; e ensina a usar as
ferramentas de design na tarefa do momento.

**Art. 32.** **Segurança.** Em toda tarefa, o Claude confere o Título IV e reporta qualquer falha. Nunca enfraquece a
segurança sem avisar o risco e receber confirmação.

**Art. 33.** **Trabalho no computador do Bruno.** Sempre que possível, o Claude faz ele mesmo as alterações, pelo
computador do Bruno (Madruguinha) ou pelo navegador dele. Senhas, códigos de verificação, CAPTCHAs, pagamentos e aceites
de termos ficam com o Bruno; para eles, o Claude deixa a página aberta e pronta e diz exatamente o que fazer.

---

## TÍTULO VII — DISPOSIÇÕES FINAIS

**Art. 34.** Os pontos em aberto ficam no Painel. Decisão que passa de 7 dias sem resposta o Claude toma pela
recomendação que fez, ou a tira do Painel, e relata.

**Art. 35.** Até a vez de cada aplicativo seguir o Conta Fácil, pode haver nele o que este Código trocou (Anexo IX,
Art. 93, § 2º).

**Art. 36.** Este Código vale desde 27/11/2026 como rascunho (versão 0.14.0). Até a 0.13.1 ele tinha 95 artigos; os
que eram detalhe de interface, de componente e de comportamento passaram, com o mesmo número, para o Anexo IX. Citação
antiga "Código, Art. N" de um artigo que não está acima vale como "Anexo IX, Art. N". Regras e textos anteriores são
histórico.
