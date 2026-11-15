# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`; enquanto a versão começar
com `0.`, o app está em fase de testes (rascunho).

## 1.0.0 · 2026-11-15

Elétrica Fácil refeito, na vez dele de seguir o Conta Fácil (Código, Art. 93, § 2º). A estrutura é a comum da família; a
identidade é a dele: ferramenta de obra. O motor (contas, prazos, impostos, deslocamento, Pix, PDF, relatório, recibo e
sincronização) é o mesmo da 0.5.1, e os dados de quem já usa o app continuam valendo.

- **Início novo, com a prancheta:** "Para quem é o serviço?". Escreva o nome e toque em Começar orçamento; cliente que já tem orçamento traz o telefone e o endereço. O rascunho em andamento aparece logo abaixo, com Continuar e Excluir (com Desfazer).
- **O mês numa lista:** aprovado no mês, aguardando resposta, aprovados a executar, a receber e aprovação em 90 dias, um embaixo do outro (antes, quatro quadrinhos lado a lado).
- **O orçamento é uma folha só, presa na prancheta:** as seções viraram as linhas da folha. "Excluir orçamento" fica logo abaixo dela, em vermelho; saiu do menu ⋯, que ficou com Alterar situação, Gerar recibo e Duplicar.
- **Navegação nova:** Início, Orçamentos, o orçamento novo no centro, Conquistas e Mais. Preços, Gestão, o guia, o orçamento de exemplo e os Ajustes ficam em Mais. No computador, o trilho lateral tem tudo.
- **Conquistas:** 18 disjuntores num quadro de distribuição. Cada passo bem dado (primeiro orçamento, proposta enviada, serviço concluído, chave Pix, seus preços, checklist…) liga um disjuntor e conta para o nível, de Aprendiz a Mestre. Nenhuma conquista premia cobrar mais. Dá para desligar em Ajustes → Conquistas e apresentação; com elas desligadas, Preços volta para a barra.
- **Apresentação nova:** quatro telas na primeira abertura, com uma demonstração para tocar. Quem diz como assina os orçamentos já liga o primeiro disjuntor. Dá para rever nos Ajustes. Saiu a janela que aparecia a cada abertura.
- **Guia refeito:** um só, com 21 passos na ordem de uso. O app faz cada passo na tela (cliente, itens, quantidade, ambientes, deslocamento, adicionais, pagamento, proposta, resposta do cliente, conclusão, recibo, preços, gestão, conquistas e ajustes), numa demonstração que não grava nada. Só o envio (PDF e WhatsApp) é mostrado sem tocar, porque abriria outro app. Saiu o guia em três níveis.
- **Identidade:** grafite, papel e amarelo de segurança; títulos em Barlow Semi Condensed. Duas cores de botão: amarelo para a ação principal e grafite com letra amarela para começar. Todo botão que exclui é vermelho e cheio.
- **Janelas:** nenhuma abre com a caixa de texto selecionada, e nenhuma tem mais "Pronto" ou "Fechar" sozinho no pé (escolher itens, material e ferramenta fecham no X).
- **Preços e Gestão:** o botão flutuante de criar deu lugar à linha de adicionar no fim da lista.
- **Ambientes:** as opções de cada ambiente saíram do título (um botão dentro de outro atrapalhava o leitor de tela) e ficam numa linha própria, dentro do ambiente.
- **Acessibilidade:** contraste corrigido no "opcional" dos campos e nas notas do pé da proposta. A varredura automática (WCAG 2.2 AA) agora passa também pela abertura, pela folha com as seções abertas, pela proposta, por Conquistas, Preços e Gestão, nos temas claro e escuro.
- **Por dentro:** o código saiu de um arquivo só para `motor.js`, `orcamento.js`, `telas.js`, `jogo.js`, `inicio.js`, `guia.js` e `casca.js`; o estilo saiu do `index.html` para `estilo.css`. 5 testes novos (Início, navegação, conquistas, abertura e guia) e os 24 antigos adaptados à navegação nova.
- **Regras do app que mudaram (aprovadas pelo Bruno em 15/11/2026):** Art. 10 (seções recolhidas → folha única), Art. 15 (barra de baixo), Art. 16 (guia própria nova: Conquistas e apresentação) e Art. 17 (o app passa a ter abertura).
- **Kit passado por cima (Art. 30-A):** os testes comuns ainda procuram a navegação antiga; o app usa os seus (veja o README).

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
