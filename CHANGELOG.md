# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`; enquanto a versão começar
com `0.`, o app está em fase de testes (rascunho).

## 5.4.0 · 2026-11-24

O Mais com atalhos do trabalho (opção B do Bruno, item 14 das simulações).

- O Mais ganhou atalhos para o seu trabalho: hora e cobrança, chave Pix, padrões do orçamento e seus dados.
- Cada atalho mostra o que falta, e a volta leva de novo ao Mais.

Também:

- **Seu trabalho:** Hora e cobrança (à direita, o valor da hora ou "Sem valor"), Chave Pix ("Falta" se vazia),
  Padrões do orçamento e Seus dados e logotipo ("Falta" sem o nome ou o WhatsApp, decisão do Claude). Cada linha abre a
  guia certa dos Ajustes: Cobrança, Pix, Documento novo e Conta e perfil.
- **Ajuda:** Ver o guia e Abrir um exemplo. Por último, Ajustes (Código, Art. 60, II).
- **A volta:** numa guia aberta pelo Mais, o botão de voltar diz "Mais" e leva ao Mais; o voltar do aparelho também.
- As linhas têm a forma das do Kit, com o valor à direita, que o Kit não tem (proposta para o Integrador).

## 5.3.1 · 2026-11-24

Acertos depois das simulações de uso da 5.3.0, aprovados pelo Bruno.

- O tempo agora se escolhe em rodas, horas e minutos, igual em todas as telas.
- O aviso não cobre mais botões nem campos, e some quando você troca de tela.
- Novo serviço mostra 8 objetos e "Ver todos"; a fila de categorias mostra que rola.
- No tablet, o menu fica do lado, como no computador.
- A seta de um documento volta a Documentos, se você veio de lá, ou ao Início.

Também:

- **Duração em rodas.** No Novo serviço, em Preços, no diagnóstico de Somar serviço, na janela do diagnóstico e em
  "Quanto tempo levou": horas de 0 a 12 e minutos de 5 em 5, com o desenho e o comportamento do relógio do Kit (tocar
  na hora, depois no minuto). Mostra "20 min", "1h30". Começa no tempo daquele serviço (no "Quanto tempo levou", no
  último tempo anotado) ou em 30 min. Saíram as duas listas de botões de tempo, que eram diferentes entre si e não
  tinham 20 min. Com o tempo já em 30 min, criar e somar um serviço novo de dentro de Somar serviço cai de 4 para 3
  toques. O diagnóstico entra com um "+" (no último tempo usado, ou 30 min) e o tempo muda nas rodas, ao lado.
- **Aviso.** Com uma janela ou a abertura na tela, o aviso procura um lugar que não cubra botão nem campo: o de antes,
  logo acima da janela ou o alto da tela (casos: Seus dados e a hora na abertura, cliente faltando, Enviar com "Tempo
  anotado"). Troca de tela, na navegação e na abertura, tira o aviso da tela anterior.
- **Novo serviço.** 8 objetos à vista e "Ver todos (N)"; o objeto escolhido aparece mesmo se for dos outros. As filas
  que rolam para o lado (categorias, cômodos, filtros) terminam em degradê do lado em que há mais.
- **Depois de "Salvar e somar"**, Somar serviço volta com a busca limpa e sem abrir o teclado (Código, Arts. 16, IX,
  e 68, § 5º).
- **Seta do documento:** volta a Documentos se a pessoa veio de lá; de qualquer outro lugar (Mais, Preços, documento
  novo), vai ao Início.
- **Início:** saiu o raio de enfeite do cartão "Para receber", que parecia um botão.
- **Tablet:** de 768 a 1023 px, o trilho lateral e o documento na largura da tela, como no computador.
- **Carrossel de cômodos:** setas nos lados, só com mouse; no toque, continua "deslize".
- **Textos:** "Foi no tempo da tabela" virou "Igual à tabela". Os rótulos do Início, do documento e da lista de
  documentos ("Para receber", "Total", "Orçamento") saem sem caixa alta, como no Conta Fácil.

Kit passado por cima (Art. 30-A, propostas para o Integrador no README): a posição do aviso e o trilho a partir de
768 px.

## 5.3.0 · 2026-11-23

Os preços passam a ser só do eletricista.

- Os preços agora são só seus: o app não traz nenhum preço nem tempo de fábrica.
- Novo serviço em poucos toques: escolha o objeto e a ação, e dê o preço em reais ou pelo tempo.
- O serviço que você cria no orçamento fica salvo nos seus Preços, para a próxima vez.
- Na primeira vez, o app pede os seus dados e a sua hora. Dá para pular e informar no primeiro orçamento.

Também:

- **Banco de fábrica.** O app traz só categorias (8), ações (10), objetos (90 de serviço e 30 materiais) e unidades.
  O serviço nasce de objeto + ação ("Troca de disjuntor geral"), com o nome editável, a unidade e o preço. O objeto traz
  a ação mais comum já marcada (disjuntor geral: Troca; fiação: Passagem); tocar de novo na ação a tira. Pelo tempo, o
  item segue a hora (como na 5.0); em reais, o preço é fixo. Material só em reais.
- **Somar serviço.** Primeiro os seus serviços, agrupados por categoria (os mais usados no alto), com o filtro pela
  ação e a busca. A busca também sugere do banco o que você ainda não tem ("Criar a partir do banco"). "Novo serviço"
  fica no fim da lista. Saíram os blocos de categoria: com a lista só sua, eles eram um toque a mais.
  Contagem de toques (teste automático): criar e somar um serviço novo, de dentro de Somar serviço, são 4 toques
  (Novo serviço, objeto, tempo, Salvar e somar) quando a categoria já é a marcada, e 5 quando não é; somar um já salvo é 1 toque
  (3 contando abrir e fechar a janela).
- **Materiais sem preço.** Os materiais do banco são contados como antes, sem preço. Em "Pôr no orçamento", o app
  pede o preço do que ainda não tem, e o guarda nos seus Preços. Material novo pela busca: o preço é opcional.
- **Deslocamento e diária.** Nenhum valor vem de fábrica: a primeira ida pede o valor por ida (ou por km) e a primeira
  diária pede o valor da diária; os dois ficam em Ajustes, Cobrança, que ganhou o campo "Diária". A diária deixou de
  ser um item de Preços e virou a linha "Diária", com − e +, ao lado do diagnóstico e do deslocamento.
- **Primeiro uso (Código 0.13.0, Arts. 64-D e 75).** Depois das quatro telas de apresentação vêm duas de cadastro: os
  seus dados na proposta (nome e WhatsApp, e, se quiser, empresa, cidade, CPF ou CNPJ, registro e e-mail) e a sua hora
  (digitar ou "Descobrir minha hora"). "Pular" na tela dos dados passa para a da hora; na da hora, "Pular por agora"
  fecha. O que foi escrito fica. Quem pulou recebe os dois pedidos no primeiro orçamento, antes de somar o primeiro
  serviço, e de novo ao enviar, se o nome ou o WhatsApp faltarem. O cliente continua pedido ao criar o documento, sem
  Pular, porque a lei exige o cliente identificado; deixou de ser exceção ao Código (Art. 64-D, § 2º).
- **Preços.** A tabela começa vazia e mostra só as categorias com itens (e as que você criou, para poder editar ou
  excluir). Uma linha só de adicionar: "Novo serviço ou material". A janela do item é a mesma de Novo serviço.
- **Orçamento de exemplo** sai pela sua hora (ou a hora de exemplo), sem usar os seus Preços.
- **Guia:** os passos "Crie o seu primeiro serviço", "Da próxima vez, é um toque" e "Ou busque pelo nome" mostram o
  Novo serviço e as sugestões do banco.

**Dados (da 5.2.1 para a 5.3.0).** Documentos, ajustes (nome, Pix, deslocamento, mínimo, condições, padrões) e a
hora ficam como estão. Ficam nos Preços os itens que a pessoa criou e os de fábrica que ela mudou (nome, unidade,
categoria, tempo ou preço) ou em que anotou o tempo real. Os itens de fábrica que ela nunca mexeu saem dos Preços e
voltam ao banco (a busca os sugere de novo). A "Diária técnica" vira o valor da diária em Ajustes, se o preço era
dela; a categoria "Diária", vazia e com o nome de fábrica, sai. Os documentos já feitos não mudam: cada linha guarda o
preço do dia. Quem começa do zero recebe só as categorias do banco.
- Novo serviço escolhido pela busca ou pelo banco abre direto no preço: categoria, objeto e ação numa linha, com Mudar.
- Seus dados na abertura: "Também saem na proposta e no recibo" no lugar de "Se quiser, já deixe pronto".

## 5.2.1 · 2026-11-22

Refino da cara nova.

- Preços virou uma tabela: busque, filtre pela categoria e veja todos os preços de uma vez.
- Ícones novos e mais claros em todo o app.
- Uma ação só em cada lugar: o + da barra de baixo cria o documento.

Também: na tabela, cada linha traz o nome, o tempo típico (ou "fixo", escrito, quando o preço não segue a hora), o preço
e a seta para editar; cada categoria termina com a linha de adicionar e tem o lápis para editar a categoria; o material
fica na sua seção, no fim. Saíram o botão flutuante "Novo documento" do Início (repetia o + da barra e cobria o cartão em
andamento) e o "Somar serviço" do cartão quando o pé já diz "Somar serviço". Os ícones do app passam a ser todos da
Lucide (licença ISC), copiados para o repositório em `icones/lucide`, sem CDN; as categorias, em Somar serviço, também.
O ícone do app não mudou. Os dados não mudam.

## 5.2.0 · 2026-11-22

Cara nova, em todas as telas, no claro e no escuro.

- Cara nova: fundo neutro e o amarelo só no que importa, no claro e no escuro.
- No documento, o total fica sempre no alto, com a divisão entre mão de obra, deslocamento e material.
- Cada cômodo é um cartão: deslize para o lado ou toque em Ver em lista.

Também: o painel do documento traz o cliente, o total, a barra da divisão e as condições numa linha só (um toque abre
todas, inclusive o nome do serviço); a trilha das etapas só aparece depois de enviar; o pé tem uma ação só, grande, e os
três pontinhos. Duas animações do ofício: ao enviar, um disjuntor arma ao lado do total (900 ms); ao somar, uma faísca
corre pelo cartão do cômodo até o subtotal (480 ms). Com movimento reduzido, as duas viram troca direta. Sem cômodos, o
documento mostra um cartão só, com "Separar por cômodo". Os cartões levam o código do circuito (C1, C2…, G de Geral).
Os pictogramas das categorias passam a ser só de linha; as janelas têm a cor da tela; a barra de cima e a de baixo
ficam neutras, e o item atual da navegação ganha uma pílula amarela com contorno. Os dados não mudam.

## 5.1.1 · 2026-11-22

O documento fica conforme o Código de Defesa do Consumidor.

- Garantia conforme a lei: os 90 dias do Código de Defesa do Consumidor saem sempre no documento; você escolhe só a garantia a mais.
- O orçamento traz o início e o término previstos do serviço, como pede a lei.
- O documento começa pelo cliente: nome, telefone e endereço do serviço.

Também: a validade de fábrica passa a 10 dias (CDC, art. 40, § 1º); o PDF e a mensagem discriminam mão de obra e
material ("não incluído" quando não há) e dizem que o orçamento aprovado obriga as duas partes (art. 40, § 2º); a
exclusão de mau uso e de alteração por terceiros passa a citar a lei (art. 14, § 3º, II) em vez de reduzir a garantia;
garantia antiga menor que 90 dias sobe para a da lei, e a maior vira o menor adicional que a cobre; o orçamento só é
enviado com o início e o prazo; textos de campo vazio dizem o que vai nele, sem "opcional" nem "se quiser". O cliente
obrigatório na criação segue o Código do Projeto Fácil, Art. 64-D, § 2º (desde o Código 0.13.0).

## 5.1.0 · 2026-11-21

Na visita técnica, o orçamento se faz cômodo por cômodo, e o material sai numa lista de compras.

- Levantamento por cômodo: na visita, some o que há para fazer, cômodo por cômodo.
- Conte o material no cômodo e saia com a lista de compras.
- Lista de materiais com o que você leva e o que o cliente compra.
- Ação e objeto no cadastro: o nome se monta sozinho e o filtro acha rápido.
- O cliente vê o orçamento separado por cômodo.

Também: toque no nome do cômodo, no orçamento, para renomear ou apagar (com Desfazer); a linha e o material contado
mudam de cômodo pela janela deles; "Repetir o cômodo" copia serviços e materiais para um cômodo vazio; o cômodo repetido ganha número (Quarto 1,
Quarto 2); complemento curto na linha do material ("20 A, curva C"), em linha separada; material que não está na lista
entra pela busca, com preço opcional; "Pôr no orçamento" soma só a parte "Eu levo"; a lista do cliente sai pelo
WhatsApp, sem preços; o PDF e a mensagem saem agrupados por cômodo, com o subtotal de cada um, e o material num grupo
próprio. Em Somar serviço, o bloco Materiais saiu da grade de serviços: o material é contado na aba Materiais. No
catálogo de fábrica, "tomada ou interruptor" virou dois itens na instalação e na troca, os materiais perderam o "com
placa" no nome e entraram 10 materiais novos. Da 5.0 para a 5.1, documentos, ajustes e a hora não mudam; no catálogo, só
muda o que ainda estava como saiu de fábrica.

## 5.0.0 · 2026-11-21

A hora de quem usa vira a base dos preços. O app passa a ajudar a saber quanto cobrar, e não só a apresentar o orçamento.

- A sua hora é a base dos preços: diga quanto vale, ou descubra pela conta do mês.
- Cada serviço guarda o tempo típico. Mudou a hora, os preços acompanham.
- Diagnóstico por tempo, deslocamento por ida e valor mínimo por ida entram no documento.
- Condição do serviço num toque: normal, difícil ou muito difícil.
- Desconto em porcentagem, com nome: o cliente vê o valor cheio e o desconto.
- Anote o tempo real depois do serviço e a tabela passa a ter os seus tempos.

Também: o cliente não vê horas no PDF nem na mensagem (o tempo só aparece no diagnóstico); guia Cobrança em Ajustes;
dois passos novos no guia (a hora e o diagnóstico por tempo); saíram do catálogo "Visita técnica", "Hora técnica" e
"Localização de curto-circuito", e a troca de disjuntor virou dois itens (de circuito e geral). Da 4 para a 5, os itens
de fábrica da tabela passam a seguir o tempo típico e os itens criados pela pessoa viram preço fixo; documentos e
ajustes continuam.

## 4.0.0 · 2026-11-20

O Elétrica Fácil recomeçou enxuto, por decisão do Bruno: o app faz uma coisa só, o orçamento de serviços de elétrica, e fecha a cobrança. Telas, ícones, dados, contas, documentos, apresentação, guia e testes são novos. O raio é o mesmo; mudou a hora em que ele cai.

- Elétrica Fácil recomeçou enxuto: o app agora faz uma coisa, o orçamento de serviços de elétrica, do pedido ao recibo.
- Dois documentos: o orçamento, antes do serviço, e o relatório, para cobrar o que já foi feito.
- O botão do pé é sempre o próximo passo: Enviar, Aprovou, Receber e Enviar recibo.
- Preços em blocos por categoria, com ícones. Toque no bloco e mude o preço na hora.
- Visual novo, com o amarelo na frente, e ícones desenhados para o app.
- O raio agora cai sozinho, de vez em quando. Dá para desligar em Ajustes.
- Saíram as conquistas, a Obra, o estoque e as ferramentas. Os dados da versão anterior continuam guardados no aparelho, mas não aparecem aqui.

Mais detalhes:

- **Orçamento e relatório:** o orçamento segue Rascunho, Enviado, Aprovado e Recebido; o relatório, Rascunho, Enviado e Recebido, sem entrada e com o dia em que o serviço foi feito. Os dois saem da mesma tela e do mesmo PDF.
- **Somar serviço:** a lista de preços abre numa janela, em blocos por categoria; cada toque no + soma um e o − tira um. Tem busca, os mais usados no alto e a linha avulsa para o que não está na lista.
- **Receber:** QR code do Pix com o valor (a entrada primeiro; depois, o que falta) e o registro do pagamento, que pode entrar em partes. Valor maior que o que falta é recusado. Cada pagamento tem o seu recibo, em PDF ou em mensagem.
- **Início:** um painel com o que há para receber, o que espera resposta, o que está aprovado para fazer e o recebido no mês; abaixo, os documentos em andamento, cada um com o próximo passo.
- **Documentos:** a lista de tudo, com busca e filtro por tipo.
- **Preços:** grade de blocos grandes, um por categoria, com pictograma. Dentro do bloco, os preços; dá para criar, renomear e excluir categorias e escolher o ícone entre 18. Catálogo de fábrica com 9 categorias e 65 itens de predial de baixa tensão.
- **Visual:** amarelo `#FFD21F` e azul-noite `#0B1128`; títulos e números grandes em Red Hat Display. Dois jogos de ícones desenhados para o app: 36 de linha e 18 pictogramas em dois tons. O Pix continua sendo um QR code.
- **Raio:** o desenho é o da versão 3. Agora ele cai sozinho: o primeiro entre 20 e 70 segundos depois de abrir o app, os seguintes a cada 1,5 a 4 minutos, ao acaso. Não cai com alguém digitando, com janela aberta, no guia nem na apresentação; respeita o movimento reduzido; desliga em Ajustes, Raio e apresentação.
- **Apresentação e guia:** quatro telas novas, com um bloco de verdade para tocar; guia único de 12 passos, do + ao recibo.
- **Dados (Regras do app, Art. 6º):** o formato é novo, mas nada da versão 3 é apagado: orçamentos, preços, estoque e ajustes antigos continuam no aparelho, nas chaves antigas, e só não aparecem aqui. Vêm de lá os dados que saem nos documentos (nome, empresa, telefone, e-mail, CPF ou CNPJ, registro, cidade, Pix e logotipo) e a ligação da sincronização, que passa a usar um arquivo novo no gist (`eletrica-facil-4.json`). A cópia de segurança da versão 3 não abre na 4.
- **Saíram, com a aprovação do Bruno (Regras do app, Art. 8º):** conquistas e lâmpadas em 3D, Obra (levar, comprar, estoque e ferramentas), deslocamento, adicionais, impostos, cartão com taxa da maquininha, ambientes, composição de material, relatório técnico em blocos e a folha como tela.
- **Passado por cima do Kit (Art. 30-A):** título da tela na fonte de caráter, aviso rápido acima da doca nas telas internas, a fresta abaixo da janela do guia nas telas internas, o rótulo "Documentos" em celular de 320 px e as cores da linha fina por lugar. Propostas para o Integrador registradas no README.
- **Testes:** 12 testes do app (fluxo do orçamento e do relatório, contas, PDF, recibo, Pix, sincronização entre dois aparelhos, o começo sem apagar a versão 3, raio, apresentação e guia), a varredura de acessibilidade em 42 telas e janelas, no claro e no escuro, e os 59 testes do Kit.

## 3.0.0 · 2026-11-18

O Elétrica Fácil foi refeito do zero, a partir do desenho aprovado pelo Bruno: telas, fluxo, navegação, apresentação, guia, raio e testes são novos. As contas e os documentos (PDF, Pix, recibo e mensagens) continuam os mesmos.

- Elétrica Fácil refeito: o orçamento agora é montado na própria folha que o cliente recebe. O que é tracejado é só seu e não sai no documento.
- O botão amarelo do pé é sempre o próximo passo: Enviar, Aprovou, Concluir, Receber e Recibo.
- Orçamentos abre o app, num quadro por etapa: rascunhos, esperando resposta, para executar e para receber.
- Navegação nova: Orçamentos, Tabela, o botão de novo orçamento no centro, Obra e Mais. A antiga Gestão virou Obra: Levar, Comprar, Estoque e Ferramentas.
- Mudou um preço numa linha do orçamento? Dá para guardar na tabela ali mesmo.
- Apresentação nova, sem pedir o seu nome: ele fica em Ajustes, Conta e perfil.
- O raio de surpresa ficou mais parecido com um raio de verdade. A tempestade saiu.
- Esta versão começa limpa: os orçamentos, preços e ajustes guardados pelas versões anteriores neste aparelho foram apagados.

Mais detalhes:

- **A folha é a tela:** cabeçalho, cliente, serviço, itens, totais, condições, Pix, observações e assinaturas aparecem como no documento. Tocar numa linha abre a quantidade e o preço ali mesmo; tocar numa condição abre a sua janela (Pagamento, Prazo e datas, Garantia e validade, Observações, Acertar o total).
- **Somar:** a tabela de preços abre numa janela, em seções por categoria; cada toque soma um, e a folha atrás acompanha.
- **Bastidor:** acima da folha, um quadro grafite com as cinco etapas (Rascunho, Enviado, Aprovado, Concluído, Recebido) e o que fazer em cada uma.
- **Concluir** pede a data e dá baixa no estoque na mesma janela. **Receber** mostra o QR code do Pix do que falta e registra o pagamento.
- **Tabela:** seções por categoria, uma aberta de cada vez. O preço que vem com o app aparece em letra fina e o seu, em letra forte; a letra fina agora passa no contraste, e a exceção antiga do cinza claro acabou.
- **Obra:** a lista de levar aparece direto, sem seção para abrir; a lista de compras virou a guia Comprar.
- **Apresentação:** quatro telas escuras. A lâmpada começa apagada e termina acesa; saíram o interruptor e o pedido do nome. A conquista Primeira luz acende quando você diz o seu nome em Ajustes.
- **Começo limpo (Regras do app, Art. 6º):** na primeira abertura, a versão 3 apaga o que as versões 1 e 2 guardaram neste aparelho (fica só o tema). A sincronização usa um arquivo novo (`eletrica-facil-3.json`): o arquivo antigo do gist não é lido nem alterado, e um aparelho ainda na versão antiga não devolve dados velhos.
- **Não mudou:** as contas (`compute`), os documentos em PDF, o código do Pix, o recibo, as mensagens, o catálogo de fábrica, as conquistas e a lâmpada em 3D.
- **Passado por cima do Kit (Art. 30-A):** no celular de 320 px, o rótulo "Orçamentos" da navegação saía cortado; o app diminui a letra só nessa largura (`estilo.css`). Proposta para o Integrador registrada no README.
- **Por dentro:** arquivo novo `folha.js` (a tela do orçamento); `inicio.js`, `guia.js` e `raio.js` reescritos; saíram as migrações de formato antigo. Testes reescritos: `tests/app.test.mjs` (17 testes) e `tests/acessibilidade.test.mjs` (cerca de 45 telas e janelas, nos temas claro e escuro, sem nada excluído da varredura); `tests/novo.test.mjs` saiu.
- **Fica para a próxima versão:** as janelas de aprovação, situação, recibo, material e ferramentas ainda têm o desenho da versão anterior; "Acertar o total" ainda não abre uma seção por vez; o PDF continua em Helvetica; e há estilos antigos sem uso em `estilo.css`.

## 2.0.1 · 2026-11-17

- **Correção:** com a internet lenta, a janela de Novidades ainda podia abrir junto com a apresentação: o Kit confere as novidades 0,7 s depois de começar, antes de o resto do app chegar. Achado na conferência da 2.0.0 no ar. Agora, quem ainda vai ver a apresentação tem as novidades marcadas como vistas antes de o Kit começar, como no Conta Fácil. A correção da 1.1.1 cobria só a espera de 30 segundos.

## 2.0.0 · 2026-11-17

O Elétrica Fácil foi refeito com o Código novo (0.10.0, "cada app com personalidade própria"; publicado já com o 0.11.0): o fluxo e o desenho das telas agora são pensados para o eletricista, não copiados da comanda de bar. Decisões do Bruno: o orçamento nasce na tabela de preços ("Tabela na mão") e a Tabela fica na barra de baixo.

- **Tabela na mão:** Novo orçamento abre direto na sua tabela de preços. Cada toque no + soma um serviço; − tira; tocar no número abre o item para digitar a quantidade ou mudar o preço. O total fica no pé, num visor. Uma tira de categorias (com "Mais usados", quando você já tem histórico) e a busca, que acha mão de obra e material juntos, levam ao item. Fora da tabela, dá para somar um item só daquele orçamento.
- **O nome do cliente só é pedido na proposta (Código, Art. 64-D):** nada de nome antes de começar. Ao tocar em Ver proposta, o app pergunta para quem é: só o nome é obrigatório; WhatsApp, endereço, CPF ou CNPJ e o serviço em uma linha são opcionais. Quem quiser dizer antes toca em "Cliente e serviço", no orçamento. Enquanto não há cliente, o orçamento aparece pelo serviço em todas as listas.
- **Início refeito:** um bloco amarelo com a fita zebrada e o botão Novo orçamento; "Pede a sua atenção", com o que cobrar, executar e receber; e o mês num visor grafite, com números amarelos. O rascunho em andamento continua à mão.
- **Orçamento refeito:** saiu a prancheta. A tela mostra a linha do cliente e os blocos (serviços e material, valores, pagamento e datas, observações); os itens chegam abertos quando você volta da tabela. Somar mão de obra ou material leva à tabela, e não mais a uma janela.
- **Barra de baixo:** Início, Orçamentos, Novo (no centro), Tabela e Mais. Gestão e Conquistas ficam em Mais (no computador, continuam no trilho).
- **Tabela (antes Preços):** a mesma lista do orçamento, aqui para mudar o preço: tira de categorias, linhas com o preço à direita e um medidor de quantos preços já são seus.
- **Gestão:** o alto de Materiais, Ferramentas e Checklist deixou de ter quadrinhos de dados lado a lado (Código, Art. 67): agora é um filtro com as contagens e a linha da lista de compras.
- **Catálogo só de eletricista predial de baixa tensão:** saíram os itens de cabeamento estruturado, rede e segurança eletrônica: ponto de rede, ponto de antena ou TV, câmera, alarme, sensor de alarme e cerca elétrica (serviços); cabo de rede, cabo coaxial, cabo de alarme, conectores RJ45 e F, módulo RJ45, câmera, fonte de câmera e sensor de alarme (materiais); testador de cabo de rede e alicate crimpador RJ45 (ferramentas). Campainha, interfone, fechadura elétrica e motor de portão ficaram, numa categoria própria ("Portão, campainha e interfone").
- **Catálogo ampliado, só com o que é do ofício:** mão de obra de 92 para 111 itens (tomada dupla ou tripla, conjunto de interruptor e tomada, tomada industrial, four-way, troca de lâmpada, luminária tubular, minuteria, relé de impulso, ventilador de parede, circuito exclusivo para chuveiro, chave boia, barramentos, troca de fusíveis por disjuntores, quadro de comando de bomba, alimentação do medidor ao quadro, identificação de circuitos e outros); material de 170 para 207 (barramentos bipolar e tripolar, DPS classe I e II, disjuntor tripolar 40 a 63 A, conectores de torção, porcelana e sindal, terminais de compressão, placa cega, tomada tripla, relé térmico, disjuntor motor, relé de nível e outros); 18 ferramentas novas (lâmpada de teste, alicate terrômetro, chave de grifo, dobrador e tarraxa de eletroduto, brocas escalonadas, faca de eletricista, vestimenta antichama e outras).
- **Preços de fábrica revistos:** a mão de obra foi realinhada com médias publicadas de tabelas de 2026 (por exemplo, instalação de tomada de R$ 45 para R$ 60; montagem de quadro de R$ 450 para R$ 900; padrão de entrada de R$ 900 para R$ 1.500; diária de R$ 600 para R$ 450). Continuam ilustrativos e em cinza. Quem já tinha a tabela guardada recebe os preços novos só nos itens que ainda eram de fábrica; preço que você mudou não é tocado, e item com estoque ou usado em orçamento não sai.
- **Valores:** primeiro a conta (mão de obra, adicionais, material, deslocamento, desconto e imposto, até o total) e, abaixo, o que muda o total.
- **Pagamento, Prazo e datas, Garantia e validade:** viraram três blocos, cada um com o seu resumo.
- **Alterar preço:** a janela abre no valor, maior; descrição, categoria e tipo vêm depois. Preço novo continua na ordem 1. Categoria, 2. Item.
- **Guia:** refeito para o fluxo novo (26 passos): começa pela tabela, mostra a busca, pede o cliente na proposta e ganhou os passos do relatório técnico e do registro de pagamento.
- **Limpeza:** saíram do `estilo.css` os estilos da prancheta, da folha e da janela de escolher itens (109 seletores, 10 kB a menos).
- **Não mudou:** as contas, os documentos em PDF, o Pix, o recibo, o relatório técnico, as conquistas, o raio, a apresentação e os dados guardados (mesmas chaves e formatos: nada se perde).
- **Por dentro:** arquivo novo `montar.js` (tabela na mão e a janela do cliente); a janela de escolher itens (`pickerSheet`) saiu. Testes: 3 refeitos (Início, navegação, acessibilidade) e 1 novo (tabela na mão e cliente na proposta). A varredura de acessibilidade agora passa por todas as telas novas e deixa de fora só o cinza dos preços de fábrica, que é exceção aprovada.
- **Ficou igual na composição:** as janelas de material em estoque e de ferramenta, que já seguem a ordem 1. Categoria, 2. Item.
- **Ainda não testado num celular de verdade:** a tela nova com o teclado do iPhone (busca da tabela e janela do cliente).

## 1.1.1 · 2026-11-15

- **Correção:** quem vinha de uma versão anterior e ainda não tinha visto a apresentação recebia, depois de 30 segundos, a janela de Novidades por cima dela. Agora, quem vê a apresentação não recebe as Novidades naquela abertura (como no Conta Fácil). O defeito já existia na 1.0.0.

## 1.1.0 · 2026-11-15

Mais personalidade: a apresentação, o ícone e as brincadeiras agora são do Elétrica Fácil, e de mais nenhum app.

- **Apresentação nova, com a cara do app:** as quatro telas foram refeitas. Na primeira, um interruptor de parede acende a lâmpada. Na segunda, a planta de uma casa: cada toque num cômodo soma um ponto de tomada, e o total sobe. Na terceira, quatro lâmpadas num fio acendem uma depois da outra: Enviada, Aprovada, Concluído, Recibo. Na última, o seu nome aparece no cartão da proposta enquanto você escreve, e a lâmpada acende. A apresentação começa com um raio.
- **Um raio de surpresa:** de vez em quando, ao trocar de tela, um raio rasga a tela de cima a baixo, com clarão, galhos e um tremor; mais raro, cai uma tempestade, com céu fechado, chuva e três raios. É só enfeite: não recebe toque, não interrompe nada e some em um segundo. Não cai com janela aberta, com alguém digitando, no guia nem nos primeiros segundos, e vem no máximo uma vez a cada cinco minutos. Dá para desligar (e para soltar um raio ou uma tempestade na hora) em Ajustes → Conquistas e apresentação.
- **A lâmpada pisca mais forte:** na ficha de uma lâmpada, toque nela ou no fundo e ela dá um clarão, um por toque. Deslizar o dedo continua girando.
- **O varal balança:** cada lâmpada do varal é um pêndulo. Passe o dedo pelo varal e elas balançam. No celular, o varal acompanha o aparelho: inclinado, as lâmpadas pendem para o lado de baixo; chacoalhado, balançam. No iPhone, o movimento só chega depois do toque em "Balançar com o celular", porque o aparelho pede licença.
- **Ícone novo:** o mesmo raio, agora grafite sobre uma placa amarela com luz e cantos arredondados. A marca no alto da tela e o cartão da proposta usam o mesmo ícone.
- **Guia:** o passo das Conquistas mostra o piscar da lâmpada, e há um passo novo no fim, com o raio (22 passos).
- **Cuidados (Código, Art. 16):** quem pede movimento reduzido no aparelho não vê raio, tempestade, piscar nem varal balançando. Cada raio dá no máximo dois clarões, e os raios da tempestade caem com mais de um segundo entre eles (WCAG 2.3.1: nunca mais de três clarões por segundo).
- **Por dentro:** arquivo novo `raio.js`; 2 testes novos (raio de surpresa; piscar e varal) e o da apresentação refeito.
- **Ainda não testado num celular de verdade:** o varal com o movimento do aparelho. Os sinais da aceleração mudam entre iPhone e Android; se as lâmpadas penderem para o lado errado, é um ajuste de uma linha.

## 1.0.0 · 2026-11-15

Elétrica Fácil refeito, na vez dele de seguir o Conta Fácil (Código, Art. 93, § 2º). A estrutura é a comum da família; a
identidade é a dele: ferramenta de obra. O motor (contas, prazos, impostos, deslocamento, Pix, PDF, relatório, recibo e
sincronização) é o mesmo da 0.5.1, e os dados de quem já usa o app continuam valendo.

- **Início novo, com a prancheta:** "Para quem é o serviço?". Escreva o nome e toque em Começar orçamento; cliente que já tem orçamento traz o telefone e o endereço. O rascunho em andamento aparece logo abaixo, com Continuar e Excluir (com Desfazer).
- **O mês numa lista:** aprovado no mês, aguardando resposta, aprovados a executar, a receber e aprovação em 90 dias, um embaixo do outro (antes, quatro quadrinhos lado a lado).
- **O orçamento é uma folha só, presa na prancheta:** as seções viraram as linhas da folha. "Excluir orçamento" fica logo abaixo dela, em vermelho; saiu do menu ⋯, que ficou com Alterar situação, Gerar recibo e Duplicar.
- **Navegação nova:** Início, Orçamentos, o orçamento novo no centro, Conquistas e Mais. Preços, Gestão, o guia, o orçamento de exemplo e os Ajustes ficam em Mais. No computador, o trilho lateral tem tudo.
- **Conquistas:** 18 lâmpadas num varal, que vai se iluminando. Cada passo bem dado (primeiro orçamento, proposta enviada, serviço concluído, chave Pix, seus preços, checklist…) acende uma lâmpada e conta para o nível, de Aprendiz a Mestre. Nenhuma conquista premia cobrar mais. Dá para desligar em Ajustes → Conquistas e apresentação; com elas desligadas, Preços volta para a barra.
- **Lâmpadas em 3D:** cada lâmpada é um objeto 3D de verdade (WebGL), com vidro transparente, rosca de metal e o filamento na forma do ícone da conquista. Deslize o dedo de lado para girar (ou use as setas do teclado); parada, ela volta a girar sozinha, devagar. Acesa, o vidro continua transparente e o filamento brilha como néon, com um clarão em volta. A lâmpada nova chega apagada, dá uma volta e acende piscando. No varal, cada lâmpada é uma miniatura do mesmo modelo 3D, pendurada num fio com barriga, balançando de leve. Sem WebGL, vale um desenho em canvas comum; quem pede movimento reduzido vê a lâmpada parada, já acesa.
- **Apresentação nova:** quatro telas na primeira abertura, com uma demonstração para tocar. Quem diz como assina os orçamentos já acende a primeira lâmpada. Dá para rever nos Ajustes. Saiu a janela que aparecia a cada abertura.
- **Guia refeito:** um só, com 21 passos na ordem de uso. O app faz cada passo na tela (cliente, itens, quantidade, ambientes, deslocamento, adicionais, pagamento, proposta, resposta do cliente, conclusão, recibo, preços, gestão, conquistas e ajustes), numa demonstração que não grava nada. Só o envio (PDF e WhatsApp) é mostrado sem tocar, porque abriria outro app. Saiu o guia em três níveis.
- **Identidade:** grafite, papel e amarelo de segurança; títulos em Barlow Semi Condensed. Duas cores de botão: amarelo para a ação principal e grafite com letra amarela para começar. Todo botão que exclui é vermelho e cheio.
- **Janelas:** nenhuma abre com a caixa de texto selecionada, e nenhuma tem mais "Pronto" ou "Fechar" sozinho no pé (escolher itens, material e ferramenta fecham no X).
- **Ícone do Pix:** os botões de Pix e a guia Pix dos Ajustes mostram um QR code no lugar do losango.
- **Preços e Gestão:** o botão flutuante de criar deu lugar à linha de adicionar no fim da lista.
- **Ambientes:** as opções de cada ambiente saíram do título (um botão dentro de outro atrapalhava o leitor de tela) e ficam numa linha própria, dentro do ambiente.
- **Acessibilidade:** contraste corrigido no "opcional" dos campos e nas notas do pé da proposta. A varredura automática (WCAG 2.2 AA) agora passa também pela abertura, pela folha com as seções abertas, pela proposta, por Conquistas, Preços e Gestão, nos temas claro e escuro.
- **Por dentro:** o código saiu de um arquivo só para `motor.js`, `orcamento.js`, `telas.js`, `jogo.js`, `inicio.js`, `guia.js` e `casca.js`; o estilo saiu do `index.html` para `estilo.css`. 6 testes novos (Início, navegação, conquistas, lâmpada 3D, abertura e guia) e os 24 antigos adaptados à navegação nova.
- **Regras do app que mudaram (aprovadas pelo Bruno em 15/11/2026):** Art. 10 (seções recolhidas → folha única), Art. 15 (barra de baixo), Art. 16 (guia própria nova: Conquistas e apresentação) e Art. 17 (o app passa a ter abertura).
- **Kit passado por cima (Art. 30-A):** os testes comuns ainda procuram a navegação antiga, e o app usa os seus; o motor 3D do Kit só conhece a tampinha e o presente, e a lâmpada fica em `lampada.js` (veja o README).

## 0.5.1 · 2026-11-15

- **Kit Fácil 0.9.0 (Código 0.9, Proposta 4 do Conta Fácil):** para quem usa este app, muda:
  - **Avaliação e feedback:** as duas opções ("Avaliar o app" e "Relatar um problema") são linhas com ícone, título, apoio e seta. Antes saíam amassadas, com borda de pílula e o apoio em negrito.
  - **Janelas sem "Fechar" sozinho no pé:** Avaliação e feedback, Sobre o aplicativo, Mensagem enviada e Mais fecham pelo X (Código, Art. 68, § 1º).
  - **"O que é enviado e para onde":** a linha abre com a seta do Kit.
- **Por dentro:** o CSS do Kit perdeu 184 regras repetidas (19 kB a menos), sem mudar o desenho, e a verificação passou a acusá-las. O guia único do Kit ganhou o que o Conta Fácil pediu (alvo à vista dentro da janela, janela aberta de um passo para o outro, destaque de área e tela cheia); este app passa a usá-lo na sua vez (Art. 93, § 2º).

## 0.5.0 · 2026-11-15

- **Kit Fácil 0.8.0 (Código 0.8, Proposta 3 do Conta Fácil):** para quem usa este app, muda:
  - **Puxar a janela:** no celular e no tablet, a janela tem uma barrinha no alto; puxe pelo cabeçalho para fechar, ou solte antes e ela volta. Arrastar no meio da janela não move mais a página por trás. O X e o Esc continuam.
  - **Teclado:** com o teclado aberto, o pé da janela se recolhe (nenhum botão sobe para cima dele) e o cursor só aparece com a janela parada.
  - **Excluir em vermelho:** os botões de perigo do Kit (como Restaurar padrões de fábrica e Desconectar) e toda confirmação que exclui, remove ou apaga são cheios e vermelhos, com texto branco. No modo escuro, antes o contraste era perto de 2,5:1; agora é 5,9:1.
  - **Janela que fecha:** com lista de escolha, data ou hora, a janela não dá mais um pulo para cima antes de descer.
  - **Avaliação:** em Relatar um problema, sem descrição o campo fica marcado, sem abrir o teclado sozinho.
- **Ainda não muda (a vez deste app, Art. 93, § 2º):** focos automáticos próprios do app em caixas de texto e botões de excluir próprios do app que não usam o Kit.

## 0.4.0 · 2026-11-15

- **Kit Fácil 0.7.0 (Código 0.7, Art. 93):** o Kit trouxe as peças do Conta Fácil. Para quem usa este app, muda:
  - **um relógio só:** tudo o que o Kit abre ou fecha dura 600 ms, na mesma curva (janelas, fundo escuro, seções, listas de escolha, calendário, relógio, avisos, troca de tela e de guia);
  - **janelas:** um mecanismo só para nascer, acompanhar o teclado, mudar de altura e trocar de janela; a janela que fecha desce pelo pé da tela e o fundo clareia junto; nenhuma janela abre com a caixa de texto selecionada;
  - **presente:** na barra de cima, o ícone de traço, da cor da nuvem e do balão (antes, o presente colorido que girava); a janela do apoio mostra o presente em 3D, que gira com o dedo, nas cores do app, e diz "É opcional: o Elétrica Fácil continua igual para todos, com presente ou sem.";
  - **medidas:** cantos um pouco maiores (botões e campos 14 px, cartões 20 px, janelas 28 px) e barra de baixo mais baixa (54 px).
- **Ainda não muda (Art. 93, § 2º):** a navegação, o guia em níveis, a apresentação e o resto do desenho continuam os de antes até a vez deste app seguir o Conta Fácil (D14). A verificação do padrão avisa disso.

## 0.3.0 · 2026-11-12

- **Presente no lugar do chopp (Kit Fácil 0.6.0, Código 0.5):** o convite de apoio agora é "Gostando do app? Mande um presente para o criador!". O ícone é um presente colorido, em 3D, que dá uma volta quando o app abre e ao ser tocado; quem pede menos movimento no aparelho vê o presente parado. A janela do Pix e *Sobre o aplicativo* mostram o presente maior, com papel de bolinhas e laço.

## 0.2.1 · 2026-11-11

- **Aviso rápido (Kit Fácil 0.5.0, Código 0.4):** o aviso com Desfazer não some enquanto tem o foco ou o ponteiro em cima; ao sair, a contagem recomeça.
- **Guias mais visíveis no tema claro:** o sublinhado da guia escolhida passa a usar o amarelo de texto (contraste de 6,45:1; antes, 1,6:1).
- **Por dentro:** varredura automática de acessibilidade (WCAG 2.2 AA) e tela de 320 px nos testes.

## 0.2.0 · 2026-11-11

- **Janelas mais confortáveis (Kit Fácil 0.4.0, Código 0.3):** com o teclado aberto num campo de janela, no celular e no tablet, a janela fica acima do teclado; quando muda de lugar, desliza em 240 ms em vez de pular; o aviso rápido aparece acima dos botões do pé da janela aberta; a linha de apoio da janela vem abaixo do título.
- **Kit Fácil 0.4.0, peças novas para os próximos desenhos:** linha de adicionar no fim da lista, botão de fato (pago, feito) com Desfazer, item novo que a tela mostra e que pisca, carrossel de cartões, arrastar e soltar, texto só para leitor de tela e escala única de letras nas listas. Seções que abrem descontam o cabeçalho fixo do app.
- **Kit Fácil 0.2.0 e 0.3.0:** o app sai do Kit 0.1.0. No guia, o dedo fica na ponta direita dos campos de texto e o cartão não cobre a parte que a pessoa está conhecendo; o guia em vídeo do Kit fica disponível, mas o app continua com o guia em dois níveis.

## 0.1.0 · 2026-11-08

- **Recomeço da numeração:** o Elétrica Fácil e o Kit Fácil recomeçam em 0.1.0, junto com o Código do Projeto Fácil 0.1 (rascunho). Tudo o que existia na 2.24.3 continua igual.
- **Segurança:** o código do app saiu de dentro do `index.html` para o `app.js`, e a política de segurança de conteúdo (CSP) não aceita mais script escrito dentro da página.
- **Kit Fácil 0.1.0:** teste das regras do Firestore no projeto de verdade (`npm run testar-regras`); verificação do padrão confere a CSP sem script dentro da página; Código e Anexos revisados (`comum/CODIGO.md` e `comum/ANEXOS.md`).
