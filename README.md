# Elétrica Fácil

Orçamento de serviços de elétrica, do pedido ao recibo, direto no celular, no tablet ou no computador.

Versão **5.1.1** · Kit Fácil 0.9.0 · app web em <https://brunodecastrosilva.github.io/eletrica-facil/>

Faz parte do **Projeto Fácil** (Conta Fácil, Elétrica Fácil, Estudo Fácil e Guitarra Fácil) e segue o
[Código do Projeto Fácil](comum/CODIGO.md). Na 4.0.0 o app recomeçou enxuto, por decisão do Bruno: faz uma coisa só,
o orçamento de serviços de elétrica, e fecha a cobrança. A moldura, os componentes e o comportamento dos controles são
os da família; o fluxo, o desenho das telas e os ícones são do eletricista.

## O que o app faz

- **Dois documentos.** O **orçamento**, antes do serviço: o cliente aprova e você executa. O **relatório**, depois do
  serviço: para cobrar o que já foi feito.
- **Um caminho só, com o próximo passo no pé da tela.** Orçamento: Rascunho → Enviado → Aprovado → Recebido.
  Relatório: Rascunho → Enviado → Recebido. O botão do pé muda sozinho: Somar serviço, Enviar, Aprovou, Receber e
  Enviar recibo. Os três pontinhos guardam o resto: ver o PDF, duplicar, voltar uma etapa, o cliente recusou e excluir.
- **Somar serviço.** A sua lista de preços abre em blocos por categoria, com ícone. Cada toque no + soma um; o − tira
  um. A busca acha pelo nome. Os mais usados sobem para o alto. O que não está na lista entra como linha avulsa.
- **Linha do documento.** Toque na linha para mudar a descrição, a quantidade, a unidade e o preço só naquele documento.
- **Condições.** Pagamento (à vista, entrada de 30% a 70% ou a combinar), validade do orçamento, dia do serviço (no
  relatório), garantia, desconto e observações.
- **Enviar.** O nome do cliente só é pedido aqui. O documento sai em PDF (com o seu nome, o logotipo e o QR code do
  Pix) ou como mensagem de WhatsApp.
- **Receber.** QR code do Pix com o valor (a entrada primeiro; depois, o que falta) e Pix copia e cola. O pagamento
  pode entrar em partes; quando quita, o documento vira Recebido. Cada pagamento tem o seu **recibo**, em PDF (com o
  valor por extenso) ou em mensagem.
- **Início.** Quanto há para receber, o que espera resposta, o que está aprovado para fazer, o recebido no mês e os
  documentos em andamento.
- **Documentos.** Todos os orçamentos e relatórios, com busca e filtro.
- **Preços.** Um bloco por categoria, em grade. Toque no bloco para mudar um preço, cadastrar outro ou editar a
  categoria (nome e ícone). Dá para criar e excluir categorias. O catálogo de fábrica tem 9 categorias, 53 serviços (com tempo
  típico) e 22 materiais de eletricista predial de baixa tensão, com tempos e preços ilustrativos (Regras do app, Art. 9º).
- **O raio.** De tempos em tempos um raio rasga a tela, sozinho, com ou sem toque. É enfeite: não recebe toque, não
  cai com alguém digitando nem com janela aberta, respeita o movimento reduzido e pode ser desligado em Ajustes.
- **Da família:** apresentação de quatro telas, guia único (o app faz cada passo na tela), sincronização entre
  aparelhos, cópia de segurança, temas claro, escuro e automático, avaliação e apoio.

Saíram na 4.0.0, com a aprovação do Bruno: conquistas e lâmpadas, Obra (levar, comprar, estoque e ferramentas),
deslocamento, adicionais, impostos, cartão com taxa, ambientes, composição de material e o relatório técnico em blocos.

## A hora como base (versão 5)

O app serve para **orçar** (saber quanto cobrar) e **passar** (entregar uma proposta com cara de profissional). Na versão 5
os preços saem da hora de quem usa.

- **A sua hora.** Pedida uma vez, antes do primeiro documento. Dois caminhos: digitar o valor ou "Descobrir minha hora"
  (quanto quer tirar por mês, mais os custos, dividido pelas horas cobradas). Fica no alto de Preços e em Ajustes, Cobrança.
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
- **Cliente:** nome, telefone e endereço do serviço pedidos antes de tudo (exceção ao Art. 64-D, abaixo).

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

- **Identidade (Código, Art. 56):** amarelo de alta tensão (`#FFD21F`) na frente, azul-noite (`#0B1128`) para ler e
  agir, branco para o que se toca. No tema claro a página é amarela; no escuro, a página é azul-noite e o amarelo fica
  na barra de cima, no painel, nos blocos e nos botões. Títulos e números grandes em Red Hat Display; o texto em
  Atkinson Hyperlegible.
- **Botões cheios (Art. 66):** destaque e começar usam o mesmo par, azul-noite com letra amarela no claro e amarelo com
  letra azul-noite no escuro (contraste acima de 12:1). Vermelho só para excluir.
- **Navegação (Art. 60):** Início, Documentos, o documento novo no centro, Preços e Mais (guia, exemplo e Ajustes).
- **Telas internas (Art. 64, parágrafo único):** o documento e a categoria de preços têm, no pé, uma doca azul-noite com
  o total, os três pontinhos e a ação da tela.
- **Ícones (Art. 57):** desenhados para o app, em dois jogos com o mesmo traço. Os de linha seguem a grade de 24, traço
  de 2 e pontas redondas. Os pictogramas das categorias usam a grade de 48, em dois tons (contorno, área tingida e
  detalhe cheio). Onde há Pix, o ícone é um QR code (Regras do app, Art. 12).
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
| `icones.js` | os ícones de linha e os pictogramas das categorias |
| `motor.js` | utilidades, catálogo de fábrica, dados, contas, sincronização, janelas e rotas |
| `documento.js` | PDF do orçamento e do relatório, recibo, mensagem de WhatsApp, código do Pix e cópia de segurança |
| `telas.js` | Início, Documentos, o documento e as suas janelas, Preços e Mais |
| `raio.js` | o raio (o desenho é o da versão 3) e a hora de cair |
| `guia.js` | o roteiro do guia único |
| `casca.js` | troca de tela, navegação, Ajustes, apresentação, troca de dados do guia e arranque |
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
- **Cores das peças por lugar:** a página é amarela e as caixas são brancas, então a cor da linha fina do Kit
  (`--kf-line`) muda dentro das caixas, das janelas, da barra de cima e da navegação, trocando só as variáveis de cor
  nesses lugares (`estilo.css`). Não muda medida nem comportamento.

O Anexo I do Código ainda lista as cores da versão 3 do Elétrica Fácil. Proposta para o Integrador: atualizar o par de
cores (destaque e começar: `#0B1128` com letra `#FFD21F` no claro; `#FFD21F` com letra `#0B1128` no escuro).

## Exceções ao padrão

- **Cliente antes de tudo (Código, Art. 64-D):** o Código manda pedir o dado só quando ele se torna indispensável (no
  Elétrica, o nome do cliente ao gerar a proposta). Por decisão do Bruno (22/11/2026), nome, telefone e endereço do
  serviço são pedidos ao criar o orçamento ou o relatório, e sem eles o documento não nasce. Motivo: o orçamento prévio
  do CDC (art. 40) é um documento com valor de contrato entre o eletricista e um cliente identificado, e o endereço é
  onde o serviço acontece. Registrado também no CHANGELOG (5.1.1); a levar ao Painel do Integrador (Código, Art. 5º).

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
