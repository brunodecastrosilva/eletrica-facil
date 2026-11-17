# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`; enquanto a versão começar
com `0.`, o app está em fase de testes (rascunho).

## 2.0.0 · 2026-11-17

O Elétrica Fácil foi refeito com o Código 0.10.0 ("cada app com personalidade própria"): o fluxo e o desenho das telas agora são pensados para o eletricista, não copiados da comanda de bar. Decisões do Bruno: o orçamento nasce na tabela de preços ("Tabela na mão") e a Tabela fica na barra de baixo.

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
