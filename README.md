# Elétrica Fácil

Orçamentos de elétrica prontos em minutos, direto no celular, no tablet ou no computador.

Versão **3.0.0** · Kit Fácil 0.9.0 · app web em <https://brunodecastrosilva.github.io/eletrica-facil/>

Faz parte do **Projeto Fácil** (Conta Fácil, Elétrica Fácil, Estudo Fácil e Guitarra Fácil) e segue o
[Código do Projeto Fácil](comum/CODIGO.md). Na 3.0.0 o app foi refeito do zero, a partir de um desenho aprovado antes
do código (Regras do app, Art. 4º): a moldura, os componentes e o comportamento dos controles são os da família; o
fluxo e o desenho das telas são do eletricista. As contas e os documentos vêm da versão anterior.

## O que o app faz

- **A folha é a tela:** o orçamento é montado na própria folha que o cliente recebe. Linha cheia sai no documento;
  o que é tracejado é só seu. Tocar numa linha muda a quantidade e o preço ali mesmo, e dá para guardar o preço novo
  na tabela
- **Somar:** a tabela de preços abre numa janela, em seções por categoria, com busca e material sugerido para cada
  serviço. Cada toque soma um; separe por ambiente quando quiser
- **O botão amarelo é o próximo passo:** Enviar, Aprovou, Concluir, Receber e Recibo. Acima da folha, o bastidor
  mostra as cinco etapas (Rascunho, Enviado, Aprovado, Concluído, Recebido) e o que fazer em cada uma
- **O nome do cliente só é pedido ao enviar.** Até lá, o orçamento aparece pelo serviço
- **Acertar o total:** deslocamento pela distância, consumo do veículo e combustível; adicionais de urgência, noite e
  fim de semana; desconto; impostos ou nota fiscal por orçamento (sem, por fora ou embutido)
- **Pagamento, prazo e garantia:** à vista, com entrada, no cartão (com ou sem juros) ou a combinar; o prazo marca os
  dias no calendário, pulando fins de semana e feriados
- **Proposta em PDF (folha A4) ou pelo WhatsApp,** com QR code do Pix; relatório de serviços executados e recibo no fim
- **Orçamentos:** a tela que abre o app, num quadro por etapa (rascunhos, esperando resposta, para executar, para
  receber), com o Arquivo e o resumo do mês
- **Tabela:** os seus preços, em seções por categoria; os que vêm com o app aparecem em letra fina e ficam em letra
  forte quando você muda
- **Obra:** Levar (a lista de ida e volta), Comprar (o que chegou ao mínimo), Estoque (material, com marcas, custo,
  repasse e mínimo) e Ferramentas; ao concluir um serviço, o app dá baixa no material usado
- **Conquistas:** cada passo bem dado acende uma lâmpada do seu varal (18 ao todo) e conta para o nível, de Aprendiz a
  Mestre. Cada lâmpada é um objeto 3D (WebGL) que gira com o dedo, com o filamento na forma do ícone da conquista.
  Tocar na lâmpada (ou no fundo) faz ela piscar mais forte. O varal balança: com o dedo, e com o celular inclinado ou
  chacoalhado (no iPhone, depois do toque em "Balançar com o celular"). Nenhuma premia cobrar mais; dá para desligar em
  Ajustes → Conquistas e apresentação
- **Apresentação na primeira abertura,** em quatro telas: a lâmpada apagada, a folha em que cada toque soma, o botão
  amarelo que avança e a lâmpada acesa. Não pede nada. E **um guia só,** que faz cada passo na tela, do começo ao fim,
  numa demonstração que não grava nada
- **Um raio de surpresa:** de vez em quando um raio rasga a tela. É enfeite: não recebe toque, dá no máximo dois
  clarões, some em pouco mais de um segundo, respeita o movimento reduzido e dá para desligar em Ajustes → Conquistas e
  apresentação. Não há tempestade
- **Use em vários aparelhos (opcional):** orçamentos, preços e ajustes sincronizados, criptografados, num gist secreto
  da sua conta GitHub
- **Avaliação e relato de problemas** pelo balão no alto da tela; **presente para o criador** (Pix, opcional)
- Tema claro, escuro ou automático; instalável; funciona sem internet depois da primeira visita

## Como usar

Abra o endereço em qualquer navegador, no celular, no tablet ou no computador. Para instalar:

- **iPhone:** no Safari, toque em **Compartilhar → Adicionar à Tela de Início**
- **Android:** no Chrome, menu **⋮ → Instalar app**
- **Computador:** ícone de instalar na barra de endereço do Chrome ou do Edge

Sem a sincronização, os dados ficam só no aparelho; toque na **nuvem** no alto da tela (ou vá em **Ajustes → Sincronização e armazenamento**).

## Onde ficam os dados

| Dado | Onde fica |
|---|---|
| Orçamentos, dados dos clientes, tabela de preços (com o estoque), ferramentas, checklist e ajustes | neste aparelho (armazenamento do navegador, chaves `eletricafacil.*`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho (AES-256) |
| Conquistas (quando cada lâmpada acendeu, guia visto, raios de surpresa ligados ou não) e apresentação vista | só neste aparelho (`eletricafacil.jogo` e `eletricafacil.abertura`); as lâmpadas são calculadas dos seus dados, então acompanham a sincronização |
| Propostas, relatórios e recibos em PDF | gerados no aparelho; só saem quando o usuário compartilha |
| Avaliações e relatos de problema enviados | Firestore do projeto no Firebase (Google), coleção `feedback`; apagados depois de 2 anos |

O app guarda dados pessoais dos clientes de quem usa (nome, telefone, endereço, CPF ou CNPJ).
A guia **Ajustes → Privacidade e segurança** explica isso para quem usa o app.

A versão 3 começa limpa (Regras do app, Art. 6º): na primeira abertura ela apaga o que as versões 1 e 2 guardaram neste
aparelho (fica só o tema) e usa um arquivo novo no gist da sincronização (`eletrica-facil-3.json`). O arquivo antigo do
gist não é lido nem alterado.

## Para desenvolver

O app não tem etapa de build nem dependências: o que está no repositório é o que vai para o ar.
O Node (22 ou mais novo) só é usado para o servidor local, os testes e a verificação do padrão.

```bash
npm start                         # abre em http://localhost:8080/eletrica-facil/
npm install                       # primeira vez: instala o Playwright e o axe, usados nos testes
npx playwright install chromium   # primeira vez: baixa o navegador dos testes
npm test                          # testes do Kit Fácil e do app, sem internet
npm run verificar                 # Código do Projeto Fácil, segredos e versão
```

Os testes simulam o GitHub (sincronização) e o Firebase (avaliações); nada toca nos dados reais.
O modo sem internet (service worker) só funciona em `https`, ou seja, no endereço publicado.

## Interface

Segue o Código do Projeto Fácil (veja [`comum/CODIGO.md`](comum/CODIGO.md)) e o Conta Fácil, a referência:

- **Identidade:** ferramenta de obra. Grafite, papel e amarelo de segurança; títulos e números em Barlow Semi Condensed
  (letra de placa de obra), texto em Atkinson Hyperlegible Next. O orçamento é uma folha de papel; o bastidor e os
  totais aparecem em grafite com números amarelos, como o visor de um multímetro; as conquistas são lâmpadas de um varal
- **Duas cores de botão (Art. 66):** amarelo para o próximo passo (Enviar, Aprovou, Concluir, Receber, Salvar) e grafite
  com letra amarela para a ação que começa o trabalho (Novo orçamento, o botão do centro, o + da tabela). Vermelho só
  para excluir
- **Alto da tela:** a marca à esquerda; nuvem, presente e balão à direita. No orçamento, voltar, título, nuvem e balão
- **Navegação:** Orçamentos, Tabela, o orçamento novo no centro, Obra e Mais (Conquistas, guia, exemplo e
  Ajustes). No computador, trilho lateral com Mais e Ajustes no pé
- **Um jeito de criar (Art. 64, II):** o orçamento nasce em Orçamentos e no botão do centro; Tabela e Obra têm a linha de
  adicionar no fim de cada lista, sem botão flutuante
- **Pede só o que precisa, quando precisa (Art. 64-D):** o nome do cliente é pedido ao enviar
- **Janelas:** nenhuma abre com caixa de texto selecionada, e nenhuma tem "Pronto" ou "Fechar" sozinho no pé: o X fecha
- **Ajustes:** as oito guias comuns e as guias próprias **Pix**, **Veículo e deslocamento**, **Adicionais**,
  **Orçamento novo**, **Textos dos documentos** e **Conquistas e apresentação**. "Seus dados na proposta" fica em Conta
  e perfil

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | moldura da página e a política de segurança (CSP); nenhum script dentro da página |
| `estilo.css` | estilo do app; a 3.0 (a folha, o bastidor, o quadro, as seções, a apresentação e o raio) fica no fim |
| `motor.js` | utilidades, tabela de preços inicial, dados, sincronização, contas, rotas e janelas |
| `orcamento.js` | criar, itens, ambientes, deslocamento, mensagens, Pix, PDF, recibo e as janelas de aprovação, situação e relatório |
| `folha.js` | a tela do orçamento: a folha, o bastidor com as etapas, o pé com o próximo passo e as janelas (Somar, Acertar o total, Pagamento, Prazo, Garantia, Observações, Enviar, Concluir, Receber e Mais opções) |
| `montar.js` | as linhas da tabela dentro da janela Somar e o nome com que o orçamento aparece nas listas |
| `telas.js` | Tabela (os preços) e Obra (Levar, Comprar, Estoque e Ferramentas) |
| `lampada.js` | a lâmpada em 3D das conquistas: malha gerada no código, WebGL com vidro transparente e giro com o dedo; sem WebGL, desenho em canvas comum |
| `raio.js` | o raio de surpresa: desenho do raio, os tempos do clarão, quando pode cair e o liga-desliga |
| `jogo.js` | conquistas: as lâmpadas, os níveis, a tela Conquistas e o varal que balança (pêndulos, dedo e movimento do aparelho) |
| `inicio.js` | Orçamentos (o quadro por etapa, o Arquivo e o mês) e Mais |
| `guia.js` | roteiro do guia, na ordem de uso |
| `casca.js` | troca de tela, navegação, Ajustes, abertura (onboarding), guia e arranque |
| `comum/` | **Kit Fácil**: sistema de design, barra de cima, navegação, Ajustes, avaliação, sincronização, janelas, abertura, guia e a verificação. Igual nos quatro apps: não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app: `app.test.mjs` (começo limpo, folha, Somar, contas, próximo passo, quadro, Tabela, Obra, Ajustes, apresentação, raio, documentos, sincronização e guia) e `acessibilidade.test.mjs` (varredura WCAG 2.2 AA, claro e escuro) |

## Serviços externos e configuração

| Serviço | Para quê | Custo | O que configurar |
|---|---|---|---|
| GitHub (gist) | sincronização entre aparelhos | gratuito | nada no projeto; cada pessoa usa a própria conta |
| Firebase (projeto `conta-facil-2c1f9`, compartilhado pelo projeto) | receber as avaliações | plano gratuito | publicar a regra de [`comum/regras-firestore-feedback.txt`](comum/regras-firestore-feedback.txt) |
| Google Fonts, cdnjs | fontes, QR code e PDF | gratuito | nada |

## Peças do Kit passadas por cima (Art. 30-A)

- **Objeto 3D próprio:** o motor 3D do Kit (`comum/kit-jogo.js`) só conhece a tampinha e o presente, e não desenha vidro
  transparente. A lâmpada das conquistas segue o mesmo caminho das tampinhas do Conta Fácil (malha gerada no código,
  luz por pixel, giro com o dedo, inércia e volta a girar sozinha), num arquivo do app (`lampada.js`). Proposta para o
  Integrador: o Kit aceitar malhas do app e materiais transparentes, para o motor ser um só.

- **Testes comuns que ainda procuram a navegação antiga:** `abrirAjustesPelaNav` e `irPelaNav`
  (`comum/testes/ambiente.mjs`) e a varredura `comum/testes/acessibilidade.test.mjs` procuram os Ajustes na barra de
  baixo ou numa janela "Mais". Com a navegação do Kit 0.7.0, Mais é uma tela. O app usa as suas versões dessas duas
  funções (`tests/app.test.mjs`) e a sua varredura (`tests/acessibilidade.test.mjs`), como o Conta Fácil; por isso
  `npm test` lista os arquivos em vez de chamar `comum/testar.mjs`. Proposta para o Integrador: os testes comuns
  passarem a conhecer a tela Mais.
- **Apresentação em tela baixa:** no Kit, o palco da abertura encolhe (`min-height:0`) e, em celular pequeno ou com o
  teclado aberto, o texto passa por baixo dos botões. Aqui o palco não encolhe além do conteúdo e a abertura rola
  (`estilo.css`, fim do arquivo). Proposta para o Integrador: o Kit fazer o mesmo.
- **Marca que leva ao começo:** no Conta Fácil a marca do alto é um botão; o teste comum `conferirTopo` acusa qualquer
  botão a mais em `.kf-barra-in`. Aqui a marca ficou sem toque. Proposta para o Integrador: o Kit dizer qual dos dois vale.
- **Rótulo da navegação em celular de 320 px (3.0.0):** o Kit corta com reticências o rótulo que não cabe, e
  "Orçamentos" saía "Orçame…". Só nessa largura (até 359 px), o app diminui a letra do rótulo para 10 px e tira a
  margem lateral do item (`estilo.css`, fim do arquivo). Proposta para o Integrador: a navegação do Kit ajustar a letra
  quando há cinco itens e a tela é estreita.
- **Apresentação escura (3.0.0):** a abertura do Kit usa as cores do tema; aqui ela é sempre escura (a lâmpada precisa
  do escuro para acender), trocando as variáveis de cor só dentro de `.kf-abertura`. Não muda o comportamento.

## Exceções ao padrão

- **Lista de escolha, calendário e relógio do Kit perto do pé da tela:** o Kit só rola quando a lista passa do fim da
  janela do navegador; dentro de uma janela do app, a lista pode ficar atrás do rodapé (e, na página, atrás das barras de
  baixo). O app completa: depois de abrir, rola o que falta para o último item aparecer (correção em `casca.js`, sem
  mexer no `comum/`). A levar ao Integrador como correção do Kit, para os quatro apps.

Exceções retiradas na 3.0.0: o contraste dos preços de fábrica (a letra fina passa no AA: `#767162` no tema claro e
`#A39E8D` no escuro) e as telas Tabela e Gestão sem linha de apoio (Tabela e Obra têm a linha).

## Publicação

GitHub Pages a partir da branch `main`, pasta raiz. Antes de publicar: `npm run verificar` e os testes da parte que mudou
(Código, Art. 23, I); o guia inteiro só roda quando a mudança mexe no guia, e a bateria completa (`npm test`), quando
mexe nas contas ou em `comum/`. Confira o app no celular e no computador, no claro e no escuro. Se o app abrir com erro
no ar, desfaça o envio na hora (`git revert`) e só depois investigue.
O que mudou em cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

## Uso do código

O código está público durante a fase de testes, sem licença de uso definida: todos os direitos reservados.
