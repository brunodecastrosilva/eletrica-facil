# Elétrica Fácil

Orçamento de serviços de elétrica, do pedido ao recibo, direto no celular, no tablet ou no computador.

Versão **5.3.1** · Kit Fácil 0.9.0 · app web em <https://brunodecastrosilva.github.io/eletrica-facil/>

Faz parte do **Projeto Fácil** (Conta Fácil, Elétrica Fácil, Estudo Fácil e Guitarra Fácil) e segue o
[Código do Projeto Fácil](comum/CODIGO.md). Na 4.0.0 o app recomeçou enxuto, por decisão do Bruno: faz uma coisa só,
o orçamento de serviços de elétrica, e fecha a cobrança. A moldura, os componentes e o comportamento dos controles são
os da família; o fluxo, o desenho das telas e os ícones são do eletricista.

## O que o app faz

- **Dois documentos.** O **orçamento**, antes do serviço: o cliente aprova e você executa. O **relatório**, depois do
  serviço: para cobrar o que já foi feito.
- **Um caminho só, com o próximo passo no pé da tela.** Orçamento: Rascunho → Enviado → Aprovado → Recebido (a trilha aparece no painel depois de enviar).
  Relatório: Rascunho → Enviado → Recebido. O botão do pé muda sozinho: Somar serviço, Enviar, Aprovou, Receber e
  Enviar recibo. Os três pontinhos guardam o resto: ver o PDF, duplicar, voltar uma etapa, o cliente recusou e excluir.
- **Somar serviço.** Os seus serviços, agrupados por categoria, com o filtro pela ação e a busca. Cada toque no + soma
  um; o − tira um. Os mais usados sobem para o alto. O que você ainda não tem nasce em **Novo serviço** (objeto, ação e
  preço) e fica salvo nos seus Preços; a busca também sugere do banco do app. O que é só daquele documento entra como
  linha avulsa.
- **Linha do documento.** Toque na linha para mudar a descrição, a quantidade, a unidade e o preço só naquele documento.
- **Condições.** Pagamento (à vista, entrada de 30% a 70% ou a combinar), validade do orçamento, dia do serviço (no
  relatório), garantia, desconto e observações.
- **Enviar.** O cliente vem do começo do documento. O documento sai em PDF (com o seu nome, o logotipo e o QR code do
  Pix) ou como mensagem de WhatsApp.
- **Receber.** QR code do Pix com o valor (a entrada primeiro; depois, o que falta) e Pix copia e cola. O pagamento
  pode entrar em partes; quando quita, o documento vira Recebido. Cada pagamento tem o seu **recibo**, em PDF (com o
  valor por extenso) ou em mensagem.
- **Início.** Quanto há para receber, o que espera resposta, o que está aprovado para fazer, o recebido no mês e os
  documentos em andamento.
- **Documentos.** Todos os orçamentos e relatórios, com busca e filtro.
- **Preços.** Só o que você criou (5.3): a sua hora no alto, a busca, os chips das categorias (com Todas) e as linhas
  agrupadas por categoria: nome, tempo (ou "fixo"), preço e seta para editar. A tabela começa vazia; mostra as
  categorias com itens e as que você criou, cada uma com o lápis para editar o nome e o ícone. O material fica na sua
  seção, no fim. Uma linha de adicionar: "Novo serviço ou material". O app não traz preço nem tempo de fábrica: traz um
  **banco** de 8 categorias, 10 ações, 90 objetos de serviço e 30 materiais de eletricista predial de baixa tensão
  (Regras do app, Art. 9º).
- **O raio.** De tempos em tempos um raio rasga a tela, sozinho, com ou sem toque. É enfeite: não recebe toque, não
  cai com alguém digitando nem com janela aberta, respeita o movimento reduzido e pode ser desligado em Ajustes.
- **Da família:** apresentação de quatro telas (seguida do cadastro: os seus dados e a sua hora), guia único (o app faz cada passo na tela), sincronização entre
  aparelhos, cópia de segurança, temas claro, escuro e automático, avaliação e apoio.

Saíram na 4.0.0, com a aprovação do Bruno: conquistas e lâmpadas, Obra (levar, comprar, estoque e ferramentas),
deslocamento, adicionais, impostos, cartão com taxa, ambientes, composição de material e o relatório técnico em blocos.

## A hora como base (versão 5)

O app serve para **orçar** (saber quanto cobrar) e **passar** (entregar uma proposta com cara de profissional). Na versão 5
os preços saem da hora de quem usa.

- **A sua hora.** Pedida na abertura (com Pular) e, para quem pulou, antes do primeiro serviço (5.3). Dois caminhos:
  digitar o valor ou "Descobrir minha hora" (quanto quer tirar por mês, mais os custos, dividido pelas horas cobradas).
  Fica no alto de Preços e em Ajustes, Cobrança.
- **Cada serviço guarda o tempo típico.** O preço é o tempo vezes a hora. Mudar o preço reescreve o tempo. Com a chave
  "Seguir a minha hora" desligada, o preço é fixo. Material e diária têm preço fixo.
- **Diagnóstico por tempo e deslocamento por ida**, no alto de Somar serviço. O deslocamento é fixo por ida ou por
  quilômetro (Ajustes, Cobrança).
- **Mínimo por ida.** Se a mão de obra fica abaixo do mínimo vezes o número de idas, entra a linha "Atendimento mínimo".
  Começa desligado; o valor fica em Ajustes, Cobrança, e vale para os documentos novos.
- **Condição do serviço.** Na linha: Normal, Difícil (+25%) ou Muito difícil (+50%), com as porcentagens em Ajustes.
- **Desconto em porcentagem**, com nome, até 100% (cortesia: o documento é concluído sem cobrança). Não incide sobre material.
- **Tempo real.** Depois do serviço, um toque; com três anotações, o app sugere acertar o tempo da tabela.
- **O cliente não vê horas.** O PDF e a mensagem saem com preço fechado por serviço; o tempo só aparece no diagnóstico.
- Saíram do catálogo "Visita técnica", "Hora técnica" e "Localização de curto-circuito" (aprovação do Bruno, 21/11/2026).

**Da 4 para a 5.** Documentos e ajustes continuam. Na tabela de preços, os itens de fábrica passam a seguir o tempo típico
de fábrica (o preço que a pessoa tinha mudado neles não é mantido); os itens que a pessoa criou viram preço fixo, com o
valor que tinham. Os tempos de fábrica são um ponto de partida, a corrigir linha a linha ou pelo tempo real anotado.

As contas (`conta`, em `motor.js`): mão de obra, deslocamento e material somam separados; o mínimo por ida completa a mão
de obra; o desconto em porcentagem incide sobre mão de obra e deslocamento. O valor do mínimo é guardado no documento
quando ele é criado, e a linha guarda o preço do dia: documento já feito não muda quando a hora muda.

## Levantamento por cômodo e lista de materiais (versão 5.1)

- **Ação e objeto no cadastro**, opcionais ("Troca" + "tomada 10 A" = "Troca de tomada 10 A", editável). Em Somar
  serviço, dentro da categoria, uma fila de ações filtra a lista ("Todas" vem marcada); a busca acha também pelo objeto.
- **Levantar por cômodo**, no orçamento: escolhe o cômodo (ou escreve outro nome) e soma dentro dele. Cômodo repetido
  ganha número. "Repetir o <cômodo>" copia serviços e materiais para um cômodo vazio. Não é outro documento nem etapa.
- **Materiais contados**, na aba Materiais de Somar serviço, como os serviços: por cômodo, com complemento opcional e
  material novo pela busca. Ficam fora do total até "Pôr no orçamento".
- **Lista de materiais**, só para quem usa o app: no total ou por cômodo, com caixa de marcar. "Neste orçamento, o
  material: Eu levo | O cliente compra" é o padrão; a exceção se conta direto na outra parte. Mudar o padrão leva
  para lá o material que estava no padrão antigo. "Pôr no orçamento" soma só "Eu levo"; a lista do cliente sai sem preços.
- **Editar o cômodo**: toque no nome do cômodo, no orçamento, para renomear (vale para tudo o que está nele) ou apagar
  (sai junto o que está nele, com Desfazer). A linha e o material contado mudam de cômodo pela janela deles.
- **O cliente vê os cômodos**: PDF e mensagem agrupados, com o subtotal de cada cômodo; diagnóstico, deslocamento e
  atendimento mínimo em "Geral"; o material num grupo próprio. Sem cômodos, nada muda.

Dados: o documento ganha `comodos`, `mats` e `quem`; a linha ganha `com` (e `comp` no material); o preço ganha `acao`
e `obj`. **Da 5.0 para a 5.1** documentos, ajustes e a hora não mudam. No catálogo, os itens de fábrica ganham ação e
objeto; "Instalação de tomada ou interruptor", "Troca de tomada ou interruptor" e os três materiais "com placa" mudam
de nome só se o nome ainda for o de fábrica; entram 2 serviços e 10 materiais novos.

## Conforme a lei (versão 5.1.1)

- **Garantia (CDC, arts. 24, 25, 26, II, 50 e 51, I):** a garantia legal de 90 dias para reclamar de defeito no serviço
  sai sempre no documento, com o texto da lei. O eletricista só escolhe uma garantia contratual a mais: nenhuma, +3
  meses, +6 meses ou +1 ano (`garAd`, em meses). Garantia antiga menor que 90 dias sobe para a legal.
- **Orçamento prévio (CDC, art. 40):** mão de obra e material discriminados; condições de pagamento; início previsto e
  quantos dias leva (término calculado), obrigatórios para enviar; validade de fábrica de 10 dias (§ 1º); a linha "o
  orçamento aprovado obriga as duas partes e só muda por nova negociação" (§ 2º).
- **Cliente:** nome, telefone e endereço do serviço pedidos ao criar o documento, sem Pular (Código, Art. 64-D, § 2º).

## A cara nova (versão 5.2)

- **Painel fixo no alto do documento:** o cliente, o total grande, uma barra com a divisão entre mão de obra,
  deslocamento e material (com os valores escritos ao lado) e as condições numa linha só. Tocar na linha abre a janela
  **Condições** (serviço, pagamento, validade ou dia do serviço, prazo, garantia, desconto e observações). Em tela baixa
  (até 700 px de altura) o painel rola junto, para sobrar espaço.
- **Um cartão por cômodo**, que se desliza para o lado, com o código do circuito (C1, C2…), o subtotal, as linhas, as peças
  contadas e "Somar na Sala". Depois vêm Geral (diagnóstico, deslocamento, atendimento mínimo), Material (quando posto no
  orçamento) e "+ Cômodo". **Ver em lista**, no painel, mostra todos os cômodos de uma vez. Sem cômodos, um cartão só, com
  "Separar por cômodo".
- **Uma ação só no pé**, amarela, e os três pontinhos. A trilha das etapas só aparece depois de enviar.
- **Animações do ofício** (`telas.js`, `estilo.css`): ao enviar, o disjuntor arma ao lado do total (900 ms); ao somar, uma
  faísca corre pelo cartão em que o valor subiu, até o subtotal (480 ms). Com movimento reduzido, nada se mexe.

## Os preços são do eletricista (versão 5.3)

- **Sem preço nem tempo de fábrica.** O app traz um **banco**: categorias, ações (Instalação, Troca, Ponto novo, Remoção,
  Manutenção, Reparo, Medição, Inspeção, Montagem e Passagem), objetos por categoria (com a unidade e a ação mais comum)
  e unidades. Os materiais do banco também não têm preço.
- **Novo serviço.** Categoria, objeto (do banco ou outro, escrito), ação (a mais comum já marcada; tocar de novo tira),
  o nome que se monta ("Troca de disjuntor geral", editável), a unidade e o preço: **pelo tempo** (8 tempos de 15 min a
  4 h, ou outro, de 5 em 5 min; o item segue a hora) ou **em reais** (fixo). Nasce em Preços ou dentro do orçamento; lá,
  o botão é "Salvar e somar", e o item já entra no documento. O mesmo nome na mesma categoria não entra duas vezes.
- **Somar serviço.** Os seus serviços primeiro, agrupados por categoria, os mais usados no alto, com o filtro pela ação
  e a busca. A busca sugere do banco o que você ainda não tem ("Criar a partir do banco"). "Novo serviço" no fim.
- **Por tempo, por ida e por dia.** Diagnóstico pelo tempo; deslocamento e diária com − e +. O primeiro deslocamento e
  a primeira diária pedem o valor, que fica em Ajustes, Cobrança.
- **Materiais.** Contados como antes. Em "Pôr no orçamento", o app pede o preço do que não tem e o guarda nos Preços.
- **O que é pedido onde (Código, Art. 64-D):** na abertura, com Pular, os seus dados (nome e WhatsApp; empresa, cidade,
  CPF ou CNPJ, registro e e-mail, se quiser) e a sua hora; no primeiro orçamento, antes do primeiro serviço, o que
  faltou (e o nome e o WhatsApp de novo ao enviar, se faltarem); ao criar o documento, sem Pular, o cliente (nome,
  telefone e endereço do serviço), porque a lei exige.

**Da 5.2.1 para a 5.3.0.** Documentos, ajustes e a hora não mudam. Ficam nos Preços os itens que a pessoa criou e os de
fábrica que ela mudou (nome, unidade, categoria, tempo ou preço) ou em que anotou o tempo real; os de fábrica que ela
nunca mexeu saem e voltam ao banco. A "Diária técnica" vira o valor da diária em Ajustes, se o preço era dela; a
categoria "Diária", vazia e com o nome de fábrica, sai. Quem começa do zero recebe só as categorias do banco.

## Como usar

Abra o endereço em qualquer navegador, no celular, no tablet ou no computador. Para instalar:

- **iPhone:** no Safari, toque em **Compartilhar → Adicionar à Tela de Início**
- **Android:** no Chrome, menu **⋮ → Instalar app**
- **Computador:** ícone de instalar na barra de endereço do Chrome ou do Edge

Sem a sincronização, os dados ficam só no aparelho; toque na **nuvem** no alto da tela (ou vá em **Ajustes → Sincronização e armazenamento**).

## Onde ficam os dados

| Dado | Onde fica |
|---|---|
| Orçamentos, relatórios, dados dos clientes, preços, categorias e ajustes | neste aparelho (armazenamento do navegador, chaves `eletricafacil.docs`, `.precos`, `.cats` e `.ajustes`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho (AES-256), no arquivo `eletrica-facil-4.json` |
| Tema e apresentação vista | só neste aparelho (`eletricafacil.pref` e `eletricafacil.abertura`) |
| Documentos e recibos em PDF | gerados no aparelho; só saem quando o usuário compartilha |
| Avaliações e relatos de problema enviados | Firestore do projeto no Firebase (Google), coleção `feedback`; apagados depois de 2 anos |

O app guarda dados pessoais dos clientes de quem usa (nome, telefone, endereço, CPF ou CNPJ).
A guia **Ajustes → Privacidade e segurança** explica isso para quem usa o app.

**Da versão 3 para a 4 nada é apagado.** O formato dos dados é novo (Regras do app, Art. 6º), mas o que a versão 3
guardou continua no aparelho, nas chaves antigas (`eletricafacil.settings`, `.quotes`, `.prices`, `.tools`, `.checks` e
`.jogo`); só não aparece no app. Na primeira abertura, a versão 4 traz de lá os dados que saem nos documentos (nome,
empresa, telefone, e-mail, CPF ou CNPJ, registro, cidade, chave Pix e logotipo) e mantém a ligação da sincronização,
que passa a usar um arquivo novo no gist; o arquivo da versão 3 (`eletrica-facil-3.json`) não é lido nem alterado.
**Restaurar padrões de fábrica**, em Ajustes, apaga também esses dados antigos.

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

- **Identidade (Código, Art. 56):** fundo neutro (`#F4F3EF` no claro, `#141518` no escuro), superfícies brancas ou
  grafite e tinta quase preta; o amarelo de alta tensão (`#FFD21F`) só no destaque: a ação principal, o item atual da
  navegação, o total aceso e o disjuntor. O que marca estado (chave, dia escolhido, chip escolhido, trilha) usa a tinta
  no claro e o amarelo no escuro, para ter contraste. Janelas da cor da tela. Títulos e números grandes em Red Hat
  Display; o texto em Atkinson Hyperlegible.
- **Botões cheios (Art. 66):** amarelo com letra `#16171A` e uma borda de baixo mais escura, que afunda no toque
  (contraste acima de 12:1). Vermelho só para excluir.
- **Navegação (Art. 60):** Início, Documentos, o documento novo no centro, Preços e Mais (guia, exemplo e Ajustes).
- **Telas internas (Art. 64, parágrafo único):** o documento e a categoria de preços têm, no pé, uma faixa da cor da tela
  com os três pontinhos e a ação da tela; no documento o total fica no painel do alto.
- **Ícones (Art. 57):** todos da [Lucide](https://lucide.dev) (licença ISC, em `icones/lucide/LICENSE`), grade de 24,
  traço de 2 e pontas redondas. Os SVG usados ficam copiados em `icones/lucide`; `icones.js` é gerado deles por
  `node ferramentas/icones.mjs` (sem CDN). Onde há Pix, o ícone é um QR code (Regras do app, Art. 12). O ícone do app
  (o raio amarelo) é do app. Os ícones que vêm do Kit (nuvem, presente, balão, Mais e as guias comuns dos Ajustes)
  ainda são os desenhados do Kit; ver "Peças do Kit passadas por cima".
- **Ajustes (Art. 62):** as oito guias comuns e quatro do app: Cobrança, Pix, Documento novo e Raio e
  apresentação. Os dados que
  saem nos documentos ficam como extra de Conta e perfil.
- **Referências de design.** Princípios tirados de apps premiados e onde entram: a informação que importa fica na
  frente (Flighty, Apple Design Award 2023): o Início abre com o que há para receber; mostrar só o passo atual
  (Crouton, Apple Design Award 2024): o botão do pé é o próximo passo; tema e paleta coesos e dados claros (Tide Guide,
  Apple Design Award 2026, Visuais e gráficos): duas cores e uma fonte de números em tudo; uso simples e começo fácil
  (Moonlitt, Apple Design Award 2026, Interação): somar um serviço é um toque num bloco; nada só pela cor (Guitar Wiz,
  Apple Design Award 2026, Inclusão): toda etapa tem nome escrito.

## Estrutura

| Arquivo | O que tem |
|---|---|
| `index.html` | a página, a política de segurança de conteúdo e a ordem dos arquivos |
| `estilo.css` | cores e peças do app; botões, campos, janelas e avisos são os do Kit |
| `icones.js` | os ícones (Lucide), gerado a partir de `icones/lucide` por `ferramentas/icones.mjs` |
| `icones/lucide/` | os SVG da Lucide usados no app e a licença ISC |
| `motor.js` | utilidades, banco de fábrica (categorias, ações, objetos e unidades), dados, contas, sincronização, janelas e rotas |
| `documento.js` | PDF do orçamento e do relatório, recibo, mensagem de WhatsApp, código do Pix e cópia de segurança |
| `telas.js` | Início, Documentos, o documento e as suas janelas, Preços e Mais |
| `raio.js` | o raio (o desenho é o da versão 3) e a hora de cair |
| `guia.js` | o roteiro do guia único |
| `casca.js` | troca de tela, navegação, Ajustes, apresentação e cadastro, troca de dados do guia e arranque |
| `sw.js`, `manifest.webmanifest`, `icons/` | uso sem internet e instalação |
| `comum/` | Kit Fácil 0.9.0, igual nos quatro repositórios (não se altera aqui) |
| `tests/` | testes do app e varredura de acessibilidade (axe, WCAG 2.2 AA, claro e escuro) |

As contas ficam em `motor.js` (`conta`, `cobrarAgora`, `proximo`): mão de obra, deslocamento e material somam
separados, o mínimo por ida completa a mão de obra e o desconto em porcentagem não incide sobre material (ver "A hora
como base"); o material contado no levantamento fica fora do total até "Pôr no orçamento"; a entrada é a porcentagem do total, arredondada no centavo, e o restante é o total menos a
entrada; o que falta é o total menos o que já entrou. A etapa acompanha o que falta (`acertaEtapa`, em `telas.js`).

## Serviços externos e configuração

| Serviço | Para quê | Custo | O que configurar |
|---|---|---|---|
| GitHub (gist) | sincronização entre aparelhos | gratuito | nada no projeto; cada pessoa usa a própria conta |
| Firebase (projeto `conta-facil-2c1f9`, compartilhado pelo projeto) | receber as avaliações | plano gratuito | publicar a regra de [`comum/regras-firestore-feedback.txt`](comum/regras-firestore-feedback.txt) |
| Google Fonts, cdnjs | fontes, QR code e PDF | gratuito | nada |

O PDF usa o jsPDF 2.5.1 e o QR code usa o qrcode-generator 1.4.4, os dois pelo cdnjs, com versão fixa e impressão
digital (SRI), baixados só quando a função é usada (Código, Art. 21).

## Peças do Kit passadas por cima (Art. 30-A)

- **Testes comuns que ainda procuram a navegação antiga:** `abrirAjustesPelaNav` e `irPelaNav`
  (`comum/testes/ambiente.mjs`) e a varredura `comum/testes/acessibilidade.test.mjs` procuram os Ajustes na barra de
  baixo ou numa janela "Mais". Com a navegação do Kit 0.7.0, Mais é uma tela. O app usa a sua varredura
  (`tests/acessibilidade.test.mjs`), como o Conta Fácil; por isso `npm test` lista os arquivos em vez de chamar
  `comum/testar.mjs`. Proposta para o Integrador: os testes comuns passarem a conhecer a tela Mais.
- **Apresentação em tela baixa:** no Kit, o palco da abertura encolhe (`min-height:0`) e, em celular pequeno, o texto
  passa por baixo dos botões. Aqui o palco não encolhe além do conteúdo e a abertura rola (`estilo.css`). Proposta para
  o Integrador: o Kit fazer o mesmo.
- **Marca que leva ao começo:** no Conta Fácil a marca do alto é um botão; o teste comum `conferirTopo` acusa qualquer
  botão a mais em `.kf-barra-in`. Aqui a marca ficou sem toque. Proposta para o Integrador: o Kit dizer qual dos dois vale.
- **Rótulo da navegação em celular de 320 px:** o Kit corta com reticências o rótulo que não cabe, e "Documentos"
  sairia "Docume…". Só nessa largura (até 359 px), o app diminui a letra do rótulo para 10 px, tira a margem lateral do
  item e diminui o nome da marca na barra de cima (`estilo.css`, fim do arquivo). Proposta para o Integrador: a
  navegação do Kit ajustar a letra quando há cinco itens e a tela é estreita.
- **Título da tela na fonte de caráter:** `.kf-titulo` usa a fonte do texto; aqui ele usa `--kf-font-display`
  (`estilo.css`), como o Art. 56, IV, permite. Proposta para o Integrador: o título do Kit já usar a fonte de caráter.
- **Aviso rápido nas telas internas:** o Kit põe o aviso logo acima do lugar da barra de baixo; nas telas internas ele
  cobriria a doca do pé (e o botão do próximo passo). Só nelas o aviso sobe para cima da doca (`estilo.css`). Proposta
  para o Integrador: o Kit medir a barra fixa do app, como já mede o pé das janelas.
- **Guia nas telas internas:** a janela do guia fica acima do lugar da barra de baixo, mesmo quando a tela não tem a
  barra; o conteúdo aparecia nessa fresta. Só nelas o app fecha a fresta com a cor da página (`estilo.css`). Proposta
  para o Integrador: a janela do guia descer até o pé quando a tela não tem barra de baixo.
- **Cores do destaque nas peças do Kit:** o Kit usa `--kf-accent` tanto para o botão cheio quanto para o que marca estado
  (chave ligada, dia escolhido). No claro, amarelo sobre branco não dá 3:1; então `--kf-accent` é a tinta, e o app pinta
  o botão cheio e o de começar de amarelo (`estilo.css`). Não muda medida nem comportamento. Proposta para o Integrador:
  o Kit separar a cor do botão cheio da cor de estado.

- **Aviso que cobria botões e campos (5.3.1):** o Kit põe o aviso no pé e, com janela aberta, acima dos botões do pé
  dela; em janela alta e na abertura ele cobria campos e botões. Com janela ou abertura na tela, o app procura o primeiro
  lugar livre (o do Kit, logo acima da janela, o alto da tela) e, ao trocar de tela, tira o aviso da tela anterior
  (`casca.js`, `posicionarAviso`). Proposta para o Integrador: o Kit fazer isso.
- **Trilho no tablet (5.3.1):** o Kit liga o trilho lateral só a partir de 1024 px. De 768 a 1023 px o app aplica as
  mesmas regras (cópia dos blocos `min-width:1024px` do Kit e do app, no fim do `estilo.css`). Proposta para o
  Integrador: o Kit ligar o trilho a partir de 768 px.
- **Duração em rodas (5.3.1):** o relógio do Kit marca a hora do dia (0 a 23, "Agora"). Para tempo de serviço o app
  usa o mesmo desenho e o mesmo comportamento, com horas de 0 a 12, minutos de 5 em 5 e o texto "1h30" (`telas.js`,
  `rodaTempo`). Proposta para o Integrador: o Kit ter o seletor de duração.

- **Cadastro na abertura:** a abertura do Kit tem até quatro telas e o "Pular" dela fecha tudo. O cadastro (os seus
  dados e a sua hora, Código, Art. 75) vem como uma segunda abertura do Kit, logo depois da apresentação; na tela dos
  dados, o app faz o "Pular" passar para a tela da hora, e na da hora o link "Pular por agora" fecha (`casca.js`,
  `aberturaCadastro`). Proposta para o Integrador: a abertura do Kit aceitar telas de cadastro, com Pular tela a tela e
  conferência do que é obrigatório para continuar.

- **Ícones do Kit:** a nuvem, o presente, o balão, o Mais da navegação e as guias comuns dos Ajustes são desenhados no
  Kit (`comum/kit-facil.js`) e iguais nos quatro apps. O app não os troca, para não quebrar a família (Art. 3º).
  Proposta para o Integrador: o Kit adotar a Lucide nesses ícones, nos quatro apps.

O Anexo I do Código ainda lista as cores da versão 3 do Elétrica Fácil. Proposta para o Integrador: atualizar as cores
(fundo `#F4F3EF` e `#141518`; destaque e começar `#FFD21F` com letra `#16171A` nos dois temas).

## Exceções ao padrão

- **Lista de escolha e calendário do Kit perto do pé de uma janela:** o Kit só rola quando a lista passa do fim da
  janela do navegador; dentro de uma janela do app, a lista pode ficar atrás do rodapé. O app completa: depois de
  abrir, rola o que falta para o último item aparecer (correção em `casca.js`, sem mexer no `comum/`). A levar ao
  Integrador como correção do Kit, para os quatro apps.
- **Quantidade só em número inteiro:** o passo a passo de quantidade do Kit (Art. 65, XIII) não aceita vírgula. Metro
  quebrado entra arredondado, ou como duas linhas.

## Publicação

GitHub Pages a partir da branch `main`, pasta raiz. Antes de publicar: `npm run verificar` e os testes da parte que mudou
(Código, Art. 23, I); o guia inteiro só roda quando a mudança mexe no guia, e a bateria completa (`npm test`), quando
mexe nas contas ou em `comum/`. Confira o app no celular e no computador, no claro e no escuro. Se o app abrir com erro
no ar, desfaça o envio na hora (`git revert`) e só depois investigue.
O que mudou em cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

## Uso do código

O código está público durante a fase de testes, sem licença de uso definida: todos os direitos reservados.
