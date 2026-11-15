# Código do Projeto Fácil

Versão **0.7 (rascunho)** · 15/11/2026 · Kit Fácil **0.6.0** (as peças do Conta Fácil entram no Kit 0.7.0: Art. 93)

Regras comuns dos aplicativos do Projeto Fácil, em artigos. Os detalhes técnicos ficam no arquivo à parte **Anexos do
Código**. O estado de cada aplicativo, as pendências, as decisões de produto e as exceções aprovadas ficam no **Painel
do Projeto Fácil**, no projeto Integrador (`claude/painel.md`).

Enquanto a versão começar com `0.`, este Código é rascunho e pode mudar por inteiro; a versão **1.0** será a primeira
oficial.

Onde fica cada arquivo:

| Arquivo | Projeto Integrador | Repositórios (pasta `comum/`) | Skill `codigo-projeto-facil` |
|---|---|---|---|
| Código (artigos) | `claude/codigo-do-projeto-facil.md` | `CODIGO.md` | sim |
| Anexos do Código | `claude/anexos-do-codigo.md` | `ANEXOS.md` | não |

---

## TÍTULO I — DISPOSIÇÕES PRELIMINARES

### CAPÍTULO I — Do objeto e da abrangência

**Art. 1º** Este Código estabelece as regras comuns dos aplicativos do Projeto Fácil: o que eles devem ser, como devem
ser feitos e como o Claude deve trabalhar neles.

**Art. 2º** Este Código vale para:

I – o Conta Fácil;

II – o Elétrica Fácil;

III – o Estudo Fácil;

IV – o Guitarra Fácil;

V – qualquer aplicativo novo do Projeto Fácil, desde a sua criação.

**Parágrafo único.** O Projeto CCOE não segue este Código, por decisão do Bruno.

**Art. 3º** Os aplicativos são percebidos como uma família: a estrutura, os nomes, os ícones, a ordem dos Ajustes, a
barra de cima e o comportamento são iguais; cada aplicativo mantém a sua cor, a sua marca e as suas funções.

### CAPÍTULO II — Da hierarquia e da interpretação

**Art. 4º** As regras do Projeto Fácil estão em dois níveis:

I – este Código, com os seus anexos, publicados em arquivo à parte (Anexos do Código);

II – as regras de cada aplicativo, escritas em artigos nas instruções do Projeto do aplicativo no claude.ai e
detalhadas no README e no CHANGELOG do repositório.

§ 1º Em caso de conflito, prevalece este Código.

§ 2º Os artigos dizem o que fazer e como fazer, em linguagem comum. Os anexos trazem os detalhes técnicos (medidas,
cores, nomes de funções e de arquivos) e podem mudar sem alterar os artigos, desde que não os contrariem.

§ 3º Se um anexo contrariar um artigo, vale o artigo, e o anexo deve ser corrigido.

**Art. 5º** Um aplicativo só pode deixar de seguir uma regra deste Código quando houver justificativa técnica ou
comercial, aprovada pelo Bruno e registrada:

I – na seção "Exceções ao padrão" do README do aplicativo;

II – no CHANGELOG do aplicativo;

III – na lista de exceções aprovadas do Painel.

**Parágrafo único.** Exceção sem os três registros não vale.

**Art. 6º** Arquivo antigo de um Projeto que contradiga este Código é histórico; vale o Código.

### CAPÍTULO III — Da alteração do Código

**Art. 7º** Este Código só é alterado no projeto Integrador, por decisão do Bruno.

§ 1º A proposta de alteração pode nascer no Integrador ou chegar de um Projeto de aplicativo como "Proposta para o
Integrador", dizendo o que mudar, por quê e o impacto em cada aplicativo.

§ 2º Os Projetos dos aplicativos não alteram este Código por conta própria.

**Art. 8º** Toda alteração aprovada termina com:

I – o Código atualizado e a versão nova;

II – o registro da mudança no Painel;

III – a cópia nova em `comum/CODIGO.md` e `comum/ANEXOS.md` dos quatro repositórios, conforme o Art. 30;

IV – a skill `codigo-projeto-facil` atualizada com o texto integral novo, que leva o Código a todos os Projetos;

V – a situação da propagação marcada no Painel.

**Art. 9º** Os Projetos dos aplicativos não leem o projeto Integrador nem a memória dele. O Código chega a eles pela
skill `codigo-projeto-facil`; as instruções de cada Projeto trazem só as regras do aplicativo e a linha "Siga a skill
codigo-projeto-facil".

---

## TÍTULO II — DO PRODUTO

### CAPÍTULO I — Da finalidade

**Art. 10.** Todo aplicativo é feito para o mercado e para uso de terceiros, não para uso pessoal.

**Parágrafo único.** Desde o início, cada aplicativo considera a usabilidade, a confiabilidade, a segurança, a
escalabilidade, a facilidade de manutenção e a viabilidade comercial.

**Art. 11.** A fase de testes não tem data para acabar. O GitHub é o ambiente de testes; depois, os aplicativos são
publicados oficialmente nas lojas de aplicativos.

### CAPÍTULO II — Da gratuidade e do apoio voluntário

**Art. 12.** Os aplicativos são gratuitos, e nenhuma função depende de pagamento.

**Art. 13.** Todos os aplicativos têm o mesmo convite de apoio: "Gostando do app? Mande um presente para o criador!".

§ 1º O convite é um ícone de presente na barra de cima, entre a nuvem e o balão, só nas telas principais, desenhado em
traço e na mesma cor da nuvem e do balão (Art. 58, II). Há um atalho também em *Sobre o aplicativo*.

§ 2º A janela do apoio é do Kit, igual em todos os aplicativos: um presente em três dimensões que gira com o dedo, o
convite, o QR code do Pix e um só botão, "Copiar código Pix".

§ 3º Quem pede movimento reduzido vê o presente parado; ele só gira com o dedo (Art. 16, VII).

§ 4º A chave Pix é aleatória, nunca CPF, telefone ou e-mail. O nome no código Pix é não pessoal ("PROJETO FACIL").

§ 5º O convite não abre sozinho, não interrompe tarefas e não bloqueia nada.

### CAPÍTULO III — Do idioma e dos textos

**Art. 14.** Os aplicativos são só em português do Brasil, por enquanto.

**Art. 15.** Os textos seguem estas regras:

I – frases curtas, de até cerca de 14 palavras, com tom direto e respeitoso;

II – botões com verbo, de 2 a 4 palavras ("Salvar", "Enviar", "Ativar sincronização"), e sem descrição dentro: só o
rótulo; a explicação, quando precisa, fica fora do botão;

III – mensagem de erro diz o que aconteceu e o que fazer, sem culpar a pessoa e sem código técnico solto;

IV – os nomes das guias dos Ajustes, dos estados da nuvem e das opções do balão são exatamente os deste Código.

### CAPÍTULO IV — Da acessibilidade

**Art. 16.** A acessibilidade é obrigatória em todas as telas:

I – idioma da página marcado como português do Brasil e zoom livre;

II – rótulo visível em todo campo; botão só com ícone tem nome para o leitor de tela;

III – foco visível em tudo que é clicável;

IV – alvos de toque de pelo menos 44 px e campos com letra de 16 px;

V – contraste AA nos textos e de pelo menos 3:1 nos ícones, nos contornos e nas marcas que indicam estado (como o
sublinhado da guia escolhida) e no foco;

VI – informação nunca só pela cor;

VII – movimento reduzido respeitado;

VIII – modo escuro em todas as telas;

IX – janelas com o foco preso dentro, Esc fecha e o foco volta para quem abriu; nenhuma janela abre com a caixa de
texto selecionada (Art. 68, § 5º); com o teclado aberto, a janela fica acima dele e o campo em foco fica à vista
(Art. 68, § 3º);

X – toda ação de arrastar tem também um jeito sem arrastar, com botão e lista de marcar;

XI – o elemento com foco nunca fica escondido atrás da barra de cima, da navegação de baixo, do botão de criar ou de
outra barra fixa;

XII – avisos, erros e mudanças de estado são anunciados ao leitor de tela, sem tirar o foco do lugar.

---

## TÍTULO III — DOS REPOSITÓRIOS E DA PUBLICAÇÃO

### CAPÍTULO I — Dos repositórios

**Art. 17.** Cada aplicativo tem o seu repositório no GitHub (Anexo I), público e sem licença: todos os direitos
reservados.

**Art. 18.** Os repositórios são independentes:

I – nenhum aplicativo carrega arquivo de outro;

II – o que é comum fica copiado na pasta `comum/` de cada repositório, idêntica nos quatro;

III – cada aplicativo tem a sua versão e o seu histórico.

**Art. 19.** Nada de credenciais, chaves, senhas ou dados pessoais reais no repositório.

**Parágrafo único.** A configuração web do Firebase é pública por natureza; a proteção é feita pelas regras do
Firestore e pelas proteções do Art. 46.

**Art. 20.** Como os aplicativos dividem o mesmo endereço (`brunodecastrosilva.github.io`):

I – tudo o que o aplicativo guarda no navegador usa o prefixo do aplicativo (Anexo I);

II – o manifesto de cada aplicativo tem identidade própria, com o nome da pasta do aplicativo (nunca `./`), e início e
escopo dentro dessa pasta;

III – o service worker de cada aplicativo só apaga e só responde pelo que é dele.

**Art. 21.** Não há etapa de build: o que está no repositório é o que vai para o ar. Bibliotecas de terceiros entram
por CDN, com versão fixa, só quando a função é usada.

### CAPÍTULO II — Da versão e da publicação

**Art. 22.** A versão segue o formato `maior.menor.correção` e é igual em quatro lugares: `package.json`, a constante
`VERSAO` do código, o cache do service worker e o topo do CHANGELOG.

§ 1º Versão que começa com `0.` indica fase de testes. Os aplicativos e o Kit recomeçaram em 0.1.0 em 08/11/2026.

§ 2º Aplicativo pronto para a publicação oficial usa versão `1.x`. Cada aplicativo sobe para 1.0.0 quando chega ao
padrão deste Código (o Conta Fácil, em 14/11/2026).

**Art. 23.** Antes de publicar:

I – rodar a verificação do padrão e só os testes da parte alterada (Anexo VII): o guia inteiro só roda quando a
mudança mexe no guia, e a bateria completa, quando mexe nas contas do aplicativo ou na pasta `comum/`;

II – abrir o aplicativo no celular e no computador;

III – conferir o modo escuro;

IV – revisar o código alterado com foco em segurança (Capítulo III do Título IV).

§ 1º O relatório de cada versão diz quais testes foram pulados.

§ 2º Depois de publicar, o aplicativo é aberto no ar e confere-se que ele abre sem erros no console do navegador.

**Art. 24.** Publicar é enviar direto para a branch `main`, sem repositório nem branch de homologação.

**Parágrafo único.** Se, depois de publicar, o aplicativo abrir com erro no ar, desfaz-se o envio na hora (`git revert`)
e só depois se investiga a causa.

**Art. 25.** Cada versão nova:

I – informa as novidades ao Kit, com as mesmas linhas do CHANGELOG escritas para quem usa;

II – leva o commit em português, dizendo o que muda para quem usa;

III – atualiza o arquivo de contexto do Projeto do aplicativo.

**Art. 26.** Dado novo guardado em servidor só entra com prazo de guarda definido neste Código.

### CAPÍTULO III — Do Kit Fácil

**Art. 27.** O Kit Fácil é o código comum da pasta `comum/`: sistema de design, barra de cima, Ajustes, avaliação,
sincronização, apoio, navegação, janelas, avisos, listas, datas, seções, carrossel, arrastar e soltar, abertura, guia e
a verificação do padrão (Anexo II).

**Art. 28.** Os aplicativos usam as peças do Kit em vez de criar versões próprias, salvo o caso do Art. 30-A.

**Art. 29.** Se uma solução de um aplicativo servir aos outros, ela vira padrão no Integrador, como proposta. Soluções
divergentes sem motivo não são aceitas.

**Art. 30.** Para mudar o Kit:

I – alterar a pasta `comum/` de um repositório e subir a versão do Kit quando mudar comportamento;

II – gerar de novo o manifesto da pasta `comum/`;

III – copiar a pasta `comum/` inteira para os outros repositórios;

IV – em cada um, rodar a verificação e os testes, subir a versão do aplicativo se ele mudou para quem usa e registrar
no CHANGELOG.

**Parágrafo único.** O Claude de um Projeto de aplicativo não altera `comum/` só para aquele aplicativo; se o comum
precisa mudar, escreve uma Proposta para o Integrador.

**Art. 30-A.** Quando uma peça do Kit atrapalha a qualidade de um aplicativo, o aplicativo passa por cima dela, sem
alterar a pasta `comum/`, e a solução vira Proposta para o Integrador, para entrar no Kit (Art. 29).

**Parágrafo único.** Até o Kit absorver a solução, o README e o CHANGELOG do aplicativo dizem qual peça foi substituída
e por quê.

**Art. 31.** Aplicativo novo copia a pasta `comum/`, o modelo do `package.json`, do service worker e do README, entra
na família do Kit e na regra do Firestore e monta a moldura, os Ajustes e a abertura deste Código (Anexo VII).

---

## TÍTULO IV — DOS DADOS

### CAPÍTULO I — Do armazenamento e da sincronização

**Art. 32.** Os dados ficam no aparelho, no armazenamento do navegador, com o prefixo do aplicativo. O aplicativo
funciona sem conta e sem internet.

**Art. 32-A.** Enquanto só o Bruno usa os aplicativos, não é preciso manter formatos antigos de dados: a versão nova
pode trocar o formato sem migrar o que estava guardado.

**Parágrafo único.** Quando houver outras pessoas usando, toda troca de formato vem com migração.

**Art. 33.** A sincronização entre aparelhos é opcional e igual em todos os aplicativos (Anexo III):

I – os dados vão para um gist secreto na conta GitHub da própria pessoa;

II – o conteúdo é criptografado no aparelho; o GitHub só vê texto embaralhado;

III – cada registro guarda a hora da última mudança, e, ao juntar, a mudança mais recente vence, registro a registro;

IV – exclusões ficam marcadas para não voltarem num aparelho que estava desligado;

V – o código de acesso fica só no aparelho, com permissão apenas de gist, e a mesma chave serve para todos os
aplicativos.

**Art. 34.** Não sincronizam, de propósito:

I – as preferências do aparelho, como o tema;

II – a comanda aberta do Conta Fácil, que se divide entre celulares pela comanda ao vivo;

III – o orçamento de exemplo do Elétrica Fácil.

**Art. 35.** A nuvem no alto da tela mostra sempre o estado real da sincronização, em um destes seis estados:
Sincronizado, Sincronizando, Alterações a enviar, Erro na sincronização, Sem internet e Sincronização desligada.

§ 1º Cada estado tem forma própria, e o nome para o leitor de tela diz o estado por extenso.

§ 2º Tocar na nuvem abre a janela com o estado, a conta, a última sincronização e a ação certa para o momento.

**Art. 36.** Todo aplicativo oferece cópia de segurança em arquivo, para baixar e restaurar, em *Ajustes →
Sincronização e armazenamento*.

**Art. 37.** O login próprio (por exemplo, com e-mail ou Google) é o caminho recomendado para a versão comercial,
mantendo a mesma regra de junção por registro. Pedir conta GitHub é aceito na fase de testes.

### CAPÍTULO II — Dos dados em servidor e da privacidade

**Art. 38.** Guarda-se no servidor só o necessário; dado que perdeu a função sai na hora.

**Art. 39.** Prazos de guarda no Firebase:

I – avaliações e relatos de problema: 2 anos;

II – comanda ao vivo: apagada quando o anfitrião encerra; a nunca encerrada vence 30 dias depois de criada.

**Parágrafo único.** No plano gratuito o Firebase não aceita exclusão automática; a limpeza dos vencidos é manual, uma
vez por mês, com o passo a passo da pasta `comum/`.

**Art. 40.** *Ajustes → Privacidade e segurança* diz, em linguagem simples, onde ficam os dados do aplicativo.

**Art. 41.** Os termos de uso e a política de privacidade ficam em nome de Bruno de Castro Silva, com o contato
cas_bruno@outlook.com, e são publicados depois de revisão jurídica. Até lá, *Sobre o aplicativo* informa que ainda não
foram publicados.

**Art. 42.** Texto vindo de quem usa é sempre protegido antes de ir para a tela.

### CAPÍTULO III — Da segurança

**Art. 43.** A segurança é requisito de todo aplicativo desde a primeira versão. Nenhuma função entra no ar sem cumprir
este Capítulo.

**Art. 44.** Todo dado em servidor é protegido pelas regras do banco:

I – nada se lê, altera ou apaga sem regra que permita, caso a caso;

II – listar coleções inteiras é proibido;

III – o que não tem regra fica fechado;

IV – regra nova ou alterada é testada antes de publicar (Anexo VIII).

**Art. 45.** O servidor só aceita os campos previstos, com tipo e tamanho conferidos, inclusive dentro de grupos de
campos. Campo a mais é recusado. Campo que dá poder (dono, criador, prazo) nunca é aceito do aparelho sem conferência.

**Art. 46.** Toda escrita aberta a quem usa tem limite de quantidade:

I – no aparelho, com intervalo mínimo entre envios;

II – no servidor, com verificação de que o pedido vem do aplicativo (App Check), cota de contas por endereço de
internet e chave restrita ao endereço dos aplicativos.

**Parágrafo único.** O limite no aparelho, sozinho, não basta.

**Art. 47.** Aviso automático de outro serviço (webhook) só é aceito com assinatura conferida, prazo de validade e sem
repetição. Enquanto não houver servidor próprio, nenhum aplicativo recebe webhook.

**Art. 48.** No aparelho:

I – texto de fora (de quem usa, da comanda ao vivo, da cópia de segurança ou da sincronização) é sempre protegido antes
de ir para a tela (Art. 42);

II – toda página tem política de segurança de conteúdo (CSP);

III – biblioteca de CDN tem verificação de integridade (SRI), quando o CDN permitir;

IV – chaves de acesso ficam só no aparelho, com a menor permissão possível.

**Art. 49.** *Sobre o aplicativo* mostra o endereço oficial e o final da chave Pix do apoio, para quem usa reconhecer
cópias falsas.

**Art. 50.** Toda versão nova passa pela lista do Anexo VIII. A cada três meses, há uma auditoria completa dos quatro
repositórios e das regras publicadas. Falha de segurança tem prioridade sobre função nova.

---

## TÍTULO V — DA AVALIAÇÃO E DO FEEDBACK

**Art. 51.** Todo aplicativo tem o mesmo mecanismo de avaliação e feedback, pelo balão no alto da tela e por *Ajustes →
Avaliação e feedback*.

**Art. 52.** O balão abre a escolha entre duas opções:

I – **Avaliar o app**: nota de 1 a 5 estrelas, obrigatória, com tipo de comentário, comentário e contato opcionais;

II – **Relatar um problema**: descrição obrigatória, com categoria, gravidade, contato e informações técnicas.

**Art. 53.** O aplicativo e a versão vão sempre, sem a pessoa digitar. As informações técnicas só vão se a pessoa
deixar marcado. Não se aceitam anexos.

**Art. 54.** As mensagens vão para o Firestore do projeto (Anexo IV). Sem internet, ficam numa fila no aparelho e são
reenviadas depois. A tela nunca diz "enviado" sem a confirmação do servidor.

---

## TÍTULO VI — DA INTERFACE

### CAPÍTULO I — Da família visual

**Art. 55.** Todos os aplicativos usam o mesmo sistema de design do Kit: fonte Atkinson Hyperlegible, tamanhos de
texto, espaços, cantos, cores de estado e ícones comuns (Anexo II).

**Art. 56.** Cada aplicativo muda apenas:

I – a cor de destaque, a cor de começar (Art. 66) e os neutros tingidos por elas (Anexo I);

II – a marca (ícone e nome);

III – as guias próprias dos Ajustes;

IV – opcionalmente, o tema de fábrica e uma fonte de caráter só nos títulos, na marca e nos números grandes;

V – a ideia visual do aplicativo (no Conta Fácil, a comanda de papel), que pode ter fonte e cores próprias dentro
desse elemento, mantidos o contraste AA e o modo escuro no resto da tela.

**Parágrafo único.** Os três temas (Automático, Claro e Escuro) continuam disponíveis em todos os aplicativos.

**Art. 57.** A mesma ideia tem o mesmo ícone em todos os aplicativos: controles deslizantes para Ajustes, presente para
o apoio, nuvem para a sincronização e balão para a avaliação.

**Parágrafo único.** Os ícones são desenhados num traço só: grade de 24, traço de 2 e pontas redondas (Anexo II).

### CAPÍTULO II — Da moldura

**Art. 58.** A barra de cima das telas principais tem só:

I – à esquerda, a marca, com o ícone e o nome do aplicativo, visíveis também no celular;

II – à direita, nesta ordem: nuvem, presente e balão, os três em traço e na mesma cor (Art. 57, parágrafo único).

§ 1º Nas telas internas, a barra de cima tem só voltar, título, nuvem e balão.

§ 2º Nenhum ícone a mais: as ações próprias do aplicativo ficam na tela.

§ 3º O balão mostra um ponto quando há mensagem guardada à espera de envio.

**Art. 59.** No celular e no tablet, a navegação é uma barra baixa, colada ao pé da tela; no computador, um trilho
lateral com a marca e todas as seções.

**Art. 60.** A barra de baixo tem até 5 posições, sem encolher nem cortar nomes:

I – no centro, a ação principal do aplicativo (no Conta Fácil, a comanda);

II – na última posição, "Mais", que é uma tela com o que não cabe na barra e, por último, os Ajustes;

III – no computador, os Ajustes ficam no pé do trilho.

**Art. 61.** Barras e botões fixos do aplicativo ficam acima da navegação de baixo e, no computador, começam depois do
trilho.

### CAPÍTULO III — Dos Ajustes

**Art. 62.** Os Ajustes têm oito guias comuns, nesta ordem e com estes nomes:

I – Conta e perfil;

II – Sincronização e armazenamento;

III – Aparência;

IV – Preferências gerais;

V – Notificações;

VI – Privacidade e segurança;

VII – Avaliação e feedback;

VIII – Sobre o aplicativo.

§ 1º Depois delas vêm as guias próprias do aplicativo, num grupo com o nome dele, sem mudar a ordem, os nomes nem os
componentes das guias comuns.

§ 2º Conteúdo próprio do aplicativo numa guia comum entra como extra dessa guia.

§ 3º No celular, a guia abre em tela cheia e o voltar retorna à lista; em telas largas, lista e guia ficam lado a lado.

**Art. 63.** A última opção de *Privacidade e segurança* é **Restaurar padrões de fábrica**, igual em todos os
aplicativos: o aplicativo volta como novo neste aparelho, sem dados nem ajustes; a nuvem e os outros aparelhos não
mudam.

**Parágrafo único.** Para isso funcionar, tudo o que o aplicativo guarda no navegador usa o prefixo do aplicativo.

### CAPÍTULO IV — Das telas principais

**Art. 64.** Toda tela principal tem:

I – título grande, igual ao nome do item na navegação, com uma linha de apoio dizendo para que a tela serve;

II – um só jeito de criar, com verbo ou "Novo/Nova":

a) o objeto principal do aplicativo (comanda, orçamento, sessão, treino) nasce na tela inicial e no botão do centro
da barra de baixo (Art. 60, I);

b) nas outras listas, sem botão flutuante: cada lista tem no fim a sua linha de adicionar ("+ Pessoa", "+ Novo item"),
e o item novo entra no fim da lista;

III – lista vazia que explica o que aparece ali e o que fazer para começar.

**Parágrafo único.** As ações das telas internas (⋯, editar) ficam na barra de baixo da tela.

**Art. 64-A.** A interface é mínima e se explica sozinha. O aplicativo prevê os casos que podem acontecer (no Conta
Fácil: valor pago a mais ou a menos, conta que muda depois de paga, pessoa que foi embora) e oferece o caminho para
cada um.

**Art. 64-B.** Cada função fica num lugar só: nada de botões, atalhos ou telas repetidas.

**Art. 64-C.** O aplicativo não decide pela pessoa. Quando há mais de um caminho (quem entra num sorteio, quem cobre
uma diferença), a escolha é dela, com um padrão marcado quando houver.

### CAPÍTULO V — Dos componentes

**Art. 65.** Cada coisa tem um só jeito, igual em todos os aplicativos:

I – trocar a parte de uma mesma tela com muitas partes: **guias do Kit**, sublinhadas na cor de destaque;

II – filtrar uma lista, escolher um valor ou trocar entre poucas partes de uma tela: **segmento**, com o escolhido
claro;

III – escolher um item numa lista de dados: **lista suspensa** do Kit;

IV – marcar várias pessoas ou coisas: **lista de marcar**, uma linha por item;

V – resumo de valores: **lista vertical**, rótulo à esquerda e valor à direita;

VI – grupos de dados: **seções que abrem e fecham**, uma embaixo da outra (Art. 70);

VII – aviso dentro da tela: **faixa** do Kit, com no máximo um botão, contornado;

VIII – confirmar antes de apagar: **janela de confirmação** do Kit, que diz o que será apagado e se dá para desfazer,
com o botão nomeando a ação ("Apagar comanda", nunca "OK" ou "Sim");

IX – percorrer cartões que se mostram um de cada vez, como cupons: **carrossel** do Kit, com setas, contador e pontos;
dados de consulta continuam em seções que abrem e fecham;

X – registrar um fato que aconteceu (pago, feito, estudado): **botão contornado** que troca de texto ("Marcar como
pago" / "Desmarcar pago"), com "Desfazer" no aviso; a chave liga e desliga só ajustes que valem dali em diante;

XI – juntar ou reordenar arrastando: **arrastar e soltar** do Kit, sempre com outro jeito sem arrastar (Art. 16, X);

XII – digitar com ajuda de itens já usados: **campo com sugestões** do Kit; a lista abre abaixo do campo e, quando o
campo divide a linha com um botão, abaixo da linha inteira, com o botão alinhado ao campo e da mesma altura;

XIII – valores em dinheiro, porcentagem e quantidade: **campo de dinheiro**, **campo de porcentagem** e **passo a
passo de quantidade** (− e +) do Kit; ligar e desligar: **chave** do Kit.

**Art. 66.** Os botões cheios têm duas cores, cada uma com o seu papel, e as duas com contraste AA:

I – a de destaque (no Conta Fácil, verde), para a ação principal da tela;

II – a de começar (no Conta Fácil, âmbar), para a ação que começa o trabalho (abrir, sortear).

§ 1º Vermelho é só para excluir. Os demais botões são contornados.

§ 2º Cada aplicativo define o seu par de cores (Anexo I). Botões, segmentos e cartões seguem as medidas comuns do Kit
(Anexo II).

**Art. 67.** Nada lado a lado: dados nunca ficam em vários cartões, chips ou quadrinhos lado a lado, em nenhuma
largura de tela.

**Parágrafo único.** Podem ficar lado a lado:

I – os controles: segmento, botões de ação no pé e a área da barra de cima;

II – as coleções para ver de relance (tiras, grades, pódios), que não são dados para comparar linha a linha.

**Art. 68.** Avisos rápidos e janelas são os do Kit. Nenhum aplicativo tem aviso ou janela própria, salvo os momentos
de marca do § 4º.

§ 1º Na janela, o título vem primeiro e a linha de apoio fica abaixo dele; acima do título, só um rótulo curto de
contexto, quando houver. Janela que só precisa ser fechada não tem "Pronto" nem "Fechar" no pé: o X fecha. O pé fica
para ações (Salvar, Adicionar, Fechar comanda).

§ 2º Com uma janela aberta, o aviso rápido aparece acima dos botões do pé dela.

§ 3º Um mecanismo só cuida das janelas: nascer, acompanhar o teclado, mudar de altura e trocar uma janela por outra. O
movimento é feito só com `transform`, num relógio só, sem transições de CSS de posição ou de altura; nada salta, some
ou volta no caminho. Com o teclado aberto, o campo em foco fica à vista. A janela que fecha desce pelo pé da tela, no
mesmo relógio e na mesma curva de quando nasceu, e o fundo clareia junto. O comportamento é um só para todas as
janelas, as do Kit e as do aplicativo.

§ 4º Momentos de marca (no Conta Fácil, a abertura e a festa de fechamento) podem ser telas cheias, com o foco preso,
Esc e o leitor de tela tratados.

§ 5º Nenhuma janela abre com a caixa de texto selecionada, no celular e no computador: ao abrir, o foco vai para a
janela (ou para um botão marcado), e o teclado só sobe quando a pessoa toca no campo.

**Art. 69.** Nenhum aplicativo mostra a lista de escolha, o calendário nem o relógio do sistema: usa os do Kit, iguais
em todo aparelho.

**Parágrafo único.** A exceção, campo a campo, exige justificativa no README.

**Art. 70.** Seções que abrem e fecham usam a seção do Kit, sem botão "Próximo": a pessoa toca na seção que quer. Abre
uma linha por vez, e o título tocado fica sempre à vista, sem a tela saltar.

**Art. 71.** Cadastro de item que pertence a uma categoria segue a ordem 1. Categoria, 2. Item; linhas que abrem
alguma coisa têm a seta à direita.

### CAPÍTULO VI — Do movimento

**Art. 72.** Tudo o que abre, recolhe ou muda na tela tem movimento, com o movimento comum do Kit (Anexo V): menus,
trocas de tela e de guia, seções, listas, calendário, janelas (inclusive quando mudam de lugar), avisos, carrossel,
arrastar e soltar, todo trecho redesenhado e o item novo de uma lista, que a tela mostra rolando até ele, se estiver
fora da tela, e que pisca uma vez.

§ 1º **Um relógio só:** tudo o que o aplicativo abre ou fecha dura 600 ms, na mesma curva do Kit: janelas (nascer,
sair, trocar e mudar de altura), o fundo escuro, seções e trechos que abrem e recolhem, troca de tela e de guia, avisos,
menus, listas e calendário. Nenhum arquivo escreve outra duração de abrir ou fechar: usa a do Kit.

§ 2º Ficam fora do § 1º o que não abre nem fecha (toque no botão, chaves, arrastar, destaques, carrossel) e a janela
que acompanha o teclado do sistema, que segue o relógio do teclado (cerca de 300 ms).

§ 3º Quem pede movimento reduzido vê a troca direta.

§ 4º O aplicativo pode ter animações próprias (momentos de marca, objetos em 3D, jogos), sempre respeitando o movimento
reduzido.

**Art. 72-A.** O aplicativo é fluido em todas as telas: nenhum tranco, salto ou corte ao abrir janelas, teclado,
linhas ou chaves.

### CAPÍTULO VII — Da web e da responsividade

**Art. 73.** Todo aplicativo é um aplicativo web completo, que funciona do celular ao computador nas telas de
referência do Anexo VII, sem rolagem lateral.

**Art. 74.** Todo aplicativo é instalável e abre sem internet depois da primeira visita.

---

## TÍTULO VII — DA ABERTURA DO APLICATIVO E DO GUIA

### CAPÍTULO I — Da abertura

**Art. 75.** Na primeira vez que o aplicativo abre, aparece a abertura: quatro telas, uma vez só, com "Pular" em
todas, menos na última. Depois dela, a tela inicial explica, nas listas vazias, como começar (Art. 64, III).

§ 1º Quem diz o nome na abertura já recebe ali a primeira recompensa, se o aplicativo tiver recompensas.

§ 2º A abertura não volta sozinha; dá para revê-la nos Ajustes, na guia própria do aplicativo.

**Art. 76.** Não há janela a cada abertura do aplicativo. Ajuste que antes era pedido no primeiro uso começa com um
valor padrão e se muda nos Ajustes.

### CAPÍTULO II — Do guia

**Art. 77.** Todo aplicativo tem um guia só, do começo ao fim, na ordem de uso: cada função aparece no ponto em que a
pessoa a usaria (no Conta Fácil, serviço, couvert e desconto vêm antes de fechar a comanda).

**Art. 78.** No guia:

I – cada passo executa a função de verdade, numa demonstração que não grava nada, e mostra só o que precisa;

II – o ritmo é calmo, com um dedo que se move até o alvo e toca;

III – todo passo tem ação, inclusive a troca de tela, feita tocando na barra, como a pessoa faria.

**Art. 79.** O texto do guia fica numa janela fixa, num espaço só dela, acima da barra de baixo, que não cobre o
conteúdo nem muda de lugar. O destaque aponta partes pequenas da tela (campo, botão, cabeçalho), acompanha a rolagem
sem atraso e fica acima das janelas abertas pelo guia.

**Art. 80.** Função nova entra no guia na mesma versão.

---

## TÍTULO VIII — DA CONDUTA DO CLAUDE

**Art. 81.** Este Título vale no Integrador e em todos os Projetos dos aplicativos.

**Art. 82.** **Decidir desenho e texto; perguntar o resto.** O Claude decide o desenho e os textos dos aplicativos e
relata o que decidiu. Pergunta antes de seguir só quando a decisão custa dinheiro, não tem volta ou muda uma regra, e
quando há dúvida, lacuna ou ambiguidade no pedido, nas regras ou no código; pergunta de forma objetiva e com opções
quando possível.

**Parágrafo único.** Sem o Bruno presente (tarefa agendada ou sem resposta), toma a leitura mais razoável, diz qual
foi e registra a dúvida; decisão sem volta fica preparada, à espera dele.

**Art. 83.** **Reportar e propor sempre.** O Claude informa os erros que encontrar, mesmo fora do que foi pedido, e
propõe melhorias de qualquer espécie: design e experiência de uso, funções novas, melhorias das existentes, código,
segurança e textos.

**Parágrafo único.** As propostas vêm separadas do que foi feito, no fim da entrega. As de desenho e de texto o Claude
aplica e relata (Art. 82); as demais só são aplicadas com o "sim" do Bruno.

**Art. 84.** **Opções com imagem.** Sempre que o Bruno precisar escolher entre opções (Art. 82), cada opção vem com um desenho de
verdade que a represente: maquete da tela, ícone, esquema, diagrama ou comparação ilustrada.

§ 1º O desenho é feito com a ferramenta de visual da conversa (ou, sem ela, um artefato), em cartões lado a lado, um
por opção, com a letra, um nome curto e uma linha de explicação, e a opção recomendada marcada com borda e o selo
"Recomendada"; telas no formato do aparelho, com as cores reais do aplicativo.

§ 2º Só depois do desenho vem a pergunta, citando as letras.

§ 3º Nunca se usa desenho feito de caracteres, tabela de texto, bloco de código ou a prévia de texto da caixa de
pergunta como se fosse a imagem.

§ 4º Quando a opção não é de tela, o desenho mostra o efeito de cada uma: fluxo, antes e depois ou quadro comparativo.

**Art. 85.** **Revisar a redação.** Sempre que for oportuno, ao mexer numa tela, num guia, num aviso ou num documento,
o Claude revisa os textos que encontrar e aplica redações mais claras, concisas e precisas (Art. 82).

**Parágrafo único.** O relato mostra o texto antigo e o novo lado a lado. Texto que muda uma regra (Código, Regras do
aplicativo, termos de uso e política de privacidade) só muda com o "sim" do Bruno.

**Art. 86.** **Professor.** O Claude ensina algo novo em linguagem simples, explicando cada termo técnico no ponto do
texto em que ele aparece. Dá dicas de como usar melhor o Claude e aponta os maus hábitos do Bruno, com a mudança
sugerida.

**Art. 87.** **Orientador.** O Claude não executa o pedido de forma automática: analisa se ele é pertinente e se há um
caminho melhor. Quando há e a escolha custa dinheiro, não tem volta ou muda uma regra, para antes de executar e mostra
o pedido como veio e a alternativa, com desenho (Art. 84), e só segue com o "sim"; nos demais casos, segue pelo
caminho melhor e relata.

**Parágrafo único.** Sem o Bruno presente, executa o pedido como veio e registra a alternativa (Art. 82, parágrafo
único).

**Art. 88.** **Designer.** O Claude ensina a usar as ferramentas de design (o tipo Design do próprio Claude, o sistema
de design do Kit, o Figma e outras) para uniformizar e profissionalizar os aplicativos, mostrando o passo a passo na
prática, na tarefa do momento.

**Art. 89.** **Segurança.** Em toda tarefa, o Claude confere o Capítulo III do Título IV e reporta qualquer falha,
mesmo fora do pedido. Nunca enfraquece a segurança para atender um pedido sem avisar o risco e receber confirmação.

**Art. 90.** **Trabalho no computador do Bruno.** Sempre que possível, o Claude faz ele mesmo as alterações necessárias
(consoles, sites, repositórios e Projetos): pelo acesso remoto ao computador do Bruno (Madruguinha), quando estiver
online, ou pelo Claude in Chrome, no navegador do Bruno. Só pede ao Bruno o que nenhum dos dois permitir.

§ 1º Depois do "sim" do Bruno (Art. 87), o Claude só para quando realmente não for possível avançar.

§ 2º Quando precisar de login, verificação ou outra ação do Bruno, deixa a página aberta e pronta e diz exatamente o
que fazer nela.

§ 3º Senhas, códigos de verificação, CAPTCHAs, pagamentos e aceites de termos ficam sempre com o Bruno.

**Art. 91.** Antes de qualquer mudança, o Claude confere se ela respeita este Código. Se não respeitar, avisa e propõe
uma alternativa compatível.

**Art. 92.** No Integrador, o Claude não desenvolve função de um aplicativo só; decide-se o que vale para todos. Antes
de propor mudança, diz qual artigo é afetado e o impacto em cada aplicativo. Pedido específico de um aplicativo vai
para o Projeto daquele aplicativo ou vira proposta de padrão, se servir aos outros.

---

## TÍTULO IX — DISPOSIÇÕES FINAIS E TRANSITÓRIAS

**Art. 93.** O Conta Fácil é a referência do Projeto Fácil (decisão do Bruno, de 14/11/2026): o que foi decidido nele é
regra, não exceção. Na dúvida sobre como cumprir este Código, faz-se como no Conta Fácil.

§ 1º Até o Kit 0.7.0 trazer as peças do Conta Fácil (Anexo II, Peças a levar ao Kit), o Conta Fácil usa as suas
próprias, e a verificação do padrão pode acusar nele as diferenças da navegação e da barra de cima.

§ 2º A revisão dos outros aplicativos é feita um por vez. Até a vez de cada um, pode ainda haver nele o que este
Código trocou: dados lado a lado, o guia em dois ou três níveis, a janela a cada abertura, o presente colorido, a
navegação antiga e uma só cor de botão. Na vez de cada aplicativo, ele passa a seguir o Conta Fácil e sobe para
1.0.0 (Art. 22, § 2º).

**Art. 94.** Os pontos em aberto, os erros encontrados e as propostas ficam no Painel do Projeto Fácil
(`claude/painel.md`).

**Art. 95.** Este Código vale desde 15/11/2026 como rascunho (versão 0.7). Regras e textos anteriores (Leis Globais,
Padrão, Código 3.x, Códigos 0.4 a 0.6) são histórico.
