# Anexos do Código do Projeto Fácil

Versão **0.6 (rascunho)** · 14/11/2026 · Kit Fácil **0.6.0** (peças do Conta Fácil a levar ao Kit 0.7.0)

Detalhes técnicos do Código do Projeto Fácil (arquivo à parte). Os anexos mudam sem alterar os artigos, desde que não
os contrariem (Art. 4º, § 2º); se contrariarem, vale o artigo.

| Anexo | Assunto | Artigos |
|---|---|---|
| I | Aplicativos, repositórios e identidade | 17 a 20, 48 a 49 do Título IV, 56 |
| II | Sistema de design e peças do Kit | 27 a 31, 55 a 72-A |
| III | Sincronização e cópia de segurança | 32 a 37 |
| IV | Avaliação e feedback | 51 a 54 |
| V | Movimento | 72 |
| VI | Abertura e guia | 75 a 80 |
| VII | Comandos, verificação e testes | 23, 30, 30-A, 31, 73 |
| VIII | Segurança | 43 a 50, 89 |

## ANEXO I — Aplicativos, repositórios e identidade

| Aplicativo | Repositório | Endereço | Prefixo dos dados | Destaque (`--kf-accent`) | Ideia visual | Tema de fábrica | Fonte dos títulos |
|---|---|---|---|---|---|---|---|
| Conta Fácil | `brunodecastrosilva/conta-facil` | `…github.io/conta-facil/` | `contafacil.` | verde azulejo `#1D5A3B` | comanda de papel (IBM Plex Mono no papel; papel claro atenuado no escuro: Art. 56, V) | Automático | Bricolage Grotesque |
| Elétrica Fácil | `brunodecastrosilva/eletrica-facil` | `…github.io/eletrica-facil/` | `eletricafacil.` | amarelo de segurança `#FFC400` | ferramenta de obra | Automático | Atkinson |
| Estudo Fácil | `brunodecastrosilva/estudo-facil` | `…github.io/estudo-facil/` | `estudofacil.` | azul caneta `#2742D3` | caderno e marca-texto | Automático | Atkinson |
| Guitarra Fácil | `brunodecastrosilva/guitarra-facil` | `…github.io/guitarra-facil/` | `guitarrafacil.` | grafite `#2B2B30`, com o vermelho do pedal | pedal de efeito sobre amplificador | Escuro | Big Shoulders Display (700 a 900) |

**Cor de começar (Art. 66, II):** Conta Fácil, âmbar `#F2B33D` com texto `#2A1D02`. Os outros apps escolhem a sua na vez de cada um (Art. 93, § 2º).

**Manifesto:** `"id": "/<app>/"`, com `start_url` e `scope` dentro da pasta do app. **Service worker:** cache
`<app>-<versão>`. **Chave da sincronização:** `<prefixo>sync`, reaproveitável por outro app da família no mesmo aparelho.
**Firebase:** projeto `conta-facil-2c1f9` (comanda ao vivo do Conta Fácil e avaliações de todos), plano gratuito.

**Guias próprias nos Ajustes**

| Aplicativo | Guias próprias | Extras nas guias comuns |
|---|---|---|
| Conta Fácil | Tampinhas e apresentação (guia, comanda de exemplo e Cadastros ficam em Mais) | Conta e perfil: "Você nas comandas", onde a pessoa escreve o próprio nome |
| Elétrica Fácil | Pix · Veículo e deslocamento · Adicionais · Orçamento novo · Textos dos documentos | Conta e perfil: "Seus dados na proposta" |
| Estudo Fácil | Rotina e metas · Revisões | Notificações: som e vibração no fim do tempo · Privacidade e segurança: apagar todos os dados, inclusive na nuvem |
| Guitarra Fácil | Prática | — |

## ANEXO II — Sistema de design e peças do Kit

**Estrutura de cada repositório:** `index.html` (o Estudo Fácil divide o código em vários `.js`, carregados com
`?v=<versão>`), `sw.js`, `manifest.webmanifest`, `icons/` (192, 512, maskable e apple-touch-icon), `comum/` (Kit Fácil
e este Código), `tests/`, `package.json` (sem dependências de produção), `README.md`, `CHANGELOG.md`.

**Tokens comuns** (`comum/kit-facil.css`; o app não redefine):

| Grupo | Valores |
|---|---|
| Fonte | Atkinson Hyperlegible Next (`--kf-font`, `--kf-font-display`) e Mono (`--kf-font-mono`), do Google Fonts: `family=Atkinson+Hyperlegible+Mono:wght@400..700&family=Atkinson+Hyperlegible+Next:wght@400..800` |
| Texto | `--kf-t-tela` 28 · `--kf-t-secao` 21 · `--kf-t-cartao` 17 · `--kf-t-corpo` 16 · `--kf-t-apoio` 14 · `--kf-t-legenda` 12,5 px |
| Linhas de lista | nome e valor 16 em negrito (`kf-li-nome`, `kf-li-valor`) · coluna da esquerda, como número e quantidade, 14 (`kf-li-lado`) · linha de apoio 12,5 (`kf-li-apoio`) · linhas dentro de um item aberto 14 (`kf-li-dentro`); nenhum outro tamanho nas listas |
| Espaços | `--kf-e-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 24 · `-6` 32 px |
| Cantos | `--kf-r-sm` 8 · `--kf-r-btn` 14 · `--kf-r-campo` 14 · `--kf-r-md` 18 · `--kf-r-lg` 28 · `--kf-r-cartao` 20 px (valores do Conta Fácil; o Kit 0.6.0 ainda tem 12 · 12 · 16 · 22 · 16) |
| Botões | `--kf-btn-h` 48 px · `--kf-btn-h-p` 40 px |
| Moldura | `--kf-barra-h` 60 · `--kf-nav-h` 54 (o Kit 0.6.0 ainda tem 64), barra colada ao pé, com folga da área segura `max(4px, 55% de safe-area-inset-bottom)` · `--kf-trilho-w` 240 · `--kf-alvo` 44 px; computador a partir de 1024 px |
| Estados | `--kf-ok`, `--kf-warn`, `--kf-bad` e os fundos `-soft`; `--kf-star`; segmento escolhido `--kf-seg-on`. Sobre o papel claro do Conta Fácil (Art. 56, V), usam o valor do tema claro, com contraste AA |
| Camadas | 20 barra de cima e trilho · 25–30 navegação, barras fixas e botão de criar (29) · 85 janelas · 95 avisos |

**Variáveis que o app liga** (claro e escuro): `--kf-bg`, `--kf-surface`, `--kf-surface-2`, `--kf-line`, `--kf-line-2`,
`--kf-ink`, `--kf-muted`, `--kf-accent`, `--kf-accent-ink`, `--kf-accent-soft`, `--kf-accent-texto`, `--kf-focus`,
`--kf-scrim`, `--kf-shadow`; opcional, `--kf-aba-linha` (sublinhado da guia escolhida), quando o destaque não alcança 3:1
sobre o fundo (o Elétrica Fácil usa o amarelo de texto). Tema de fábrica: `KitFacil.tema.iniciar({ chave, cores, padrao: 'escuro' })`; o app escuro
de fábrica põe `data-theme="dark"` na tag `<html>`. Fonte de caráter nos títulos (Art. 56, IV): licença livre (SIL OFL), no mesmo `<link>` da
Atkinson, com a Atkinson logo depois na lista, legível em 20 px, com acentos.

**Peças do Kit**

| Peça | Função ou classe | Regras |
|---|---|---|
| Barra de cima | `KitFacil.topo.html({ principal })` | área de toque 44 × 44, ícones de 24 px, até 24 px da borda; nomes acessíveis "Sincronização: <estado>. Ver detalhes", "Mande um presente para o criador", "Avaliação e feedback" |
| Navegação | `kf-barra`, `kf-nav`, `kf-trilho`, `body.kf-casca`; `KitFacil.nav.ajustes('nav' \| 'trilho')`; seções do "Mais" com `data-kf-mais` | |
| Ajustes | `KitFacil.ajustes` (guias comuns e próprias, `extras`) | |
| Cabeçalho de tela | `KitFacil.ui.cabecalho({ titulo, sub, acoes, criar })` | |
| Botão de criar | `KitFacil.ui.criar({ rotulo, attrs })` | o Kit reserva espaço no pé da página |
| Estado vazio | `KitFacil.ui.vazio({ titulo, texto, acao })` | |
| Guias | `KitFacil.ui.abas({ itens: [[id, nome, n]], atual, rotulo, dado })` | `role="tablist"` só no Kit; contagem "Nome · n" |
| Segmento | `kf-seg` | escolhido com `--kf-seg-on` |
| Faixa | `KitFacil.ui.faixa({ tipo, html, acao })` | tipos dica, info, alerta, erro, ok |
| Botões | `kf-btn` + `kf-pri`, `kf-sec`, `kf-perigo`, `kf-perigo-sec`, `kf-link` | |
| Campos | `kf-entrada`, `kf-rotulo`, `kf-ajuda`, `kf-opcional`, `kf-check` | |
| Cartão | `kf-cartao`, `kf-bloco`, `kf-dados` | |
| Lista de escolha | `<select>` comum, trocada pelo Kit (`KitFacil.escolha`) | opção vazia `<option value="" hidden>`; exceção com `data-kf-nativa` |
| Data | `<input type="date">`, trocado pelo Kit (`KitFacil.data`) | Hoje e Limpar; valor AAAA-MM-DD |
| Hora | `<input type="time">`, trocado pelo Kit (`KitFacil.hora`) | passo de 5 min por padrão; valor HH:MM |
| Seções | `<details data-kf-secao>`, `data-kf-secao="grupo"`, `KitFacil.secao` | ao rolar até a seção, desconta a barra de cima e o cabeçalho fixo do app, marcado em `scroll-margin-top` da seção ou de um pai |
| Janelas | `KitFacil.dialogo.abrir({ contexto, titulo, sub, corpo, pe, classe, aoMontar, aoFechar })`, `.confirmar` | `kf-alto`, `kf-largo`; `contexto` acima do título, `sub` abaixo; com o teclado aberto num campo da janela (celular e tablet), `html.kf-teclado` e a camada ocupa só a área acima do teclado (`--kf-vv-top`, `--kf-vv-h`) |
| Aviso rápido | `KitFacil.avisar(msg, { label, run })` | some em 3,2 s (6 s com ação), mas não some enquanto tem o foco ou o ponteiro em cima; com janela aberta, fica acima do pé dela |
| Linha de adicionar | `KitFacil.ui.adicionar({ rotulo, attrs })` | no fim de cada lista, em tela com duas ou mais listas (Art. 64, II, b); 48 px, fundo leve e contorno fino |
| Fato | `KitFacil.ui.fato({ marcado, marcar, desmarcar, attrs })` | botão contornado com `aria-pressed`; marcado na cor `--kf-ok`; o app avisa com "Desfazer" |
| Item novo | `KitFacil.destacar(el)` | rola até ele se estiver fora da tela e pisca uma vez em `--kf-accent-soft` |
| Carrossel | `KitFacil.carrossel(el, { rotulos, aoMudar, inicio, rotulo })` | filhos de `el` são os cartões; setas de 44 px, contador "2 de 5 · Nome", pontos, altura do cartão da vez, setas do teclado; vai ao vizinho ao andar um quarto da largura ou num gesto rápido; devolve `{ ir, atual }` |
| Arrastar e soltar | `KitFacil.arrastar({ area, item, alvo, aoSoltar, aoFora })` | no toque, segurar 300 ms; o alvo fica todo colorido; vibração curta onde houver; devolve a função que desliga; o app sempre oferece também o jeito sem arrastar |
| Texto só para leitor de tela | classe `kf-so-leitor` | ex.: "Falta pagar" ao lado de um valor tachado |
| Ícones | um traço só: grade de 24 × 24, traço de 2 px, pontas e cantos redondos (`stroke-linecap` e `stroke-linejoin` `round`), cor do texto (`kf-i`); sem exceção, nem o presente da barra | |
| Apoio | `KitFacil.apoio`; chave, nome e cidade em `APOIO_PADRAO` | BR Code sem valor; QR com `qrcode-generator` 1.4.4 do cdnjs; textos: "Mande um presente para o criador!" (janela) e "Mandar um presente" (botão em *Sobre o aplicativo*) |
| Presente | hoje, `KitFacil.apoio.presente(t)` (HTML), `KitFacil.apoio.girar(el)`; classes `kf-presente`, `kf-pr-*`. No Kit 0.7.0: ícone de traço na barra e, na janela, o presente em 3D do Conta Fácil, que gira com o dedo (`jogo.js`, `estilo.css` seção 13) | caixa de lado `t` montada em CSS 3D, sem imagem, vista isométrica (`rotateX(-28deg) rotateY(-45deg)`); cores fixas nos dois temas: papel `#7F77DD`/`#534AB7`, tampa `#9A93E8`/`#6259C9`/`#CECBF6`, fita e laço `#EF9F27`/`#BA7517`/`#FAC775`; tamanhos: barra 14, *Sobre* 40, janela 44; grande (`t` ≥ 30) com bolinhas, pontas da fita, brilho da tampa, verso do laço e sombra; `aria-hidden`, o nome fica no botão |

**Peças a levar ao Kit (Kit 0.7.0; Art. 93, § 1º)**

Estão prontas no Conta Fácil 1.6.1. Ao entrar no Kit, viram funções `KitFacil.*` sem nada próprio do Conta, e o Conta
passa a usá-las como os outros.

| Peça | Onde está no Conta Fácil | Artigos |
|---|---|---|
| Módulo de janelas e teclado (nascer, acompanhar o teclado, mudar de altura, trocar; só `transform`, num relógio só, medindo antes e depois) | `casca.js`, bloco "janelas: um mecanismo só"; `estilo.css`, seções 16 e 17 | 16, IX; 68, § 3º; 72-A |
| Barra de baixo com a ação principal no centro; tela "Mais" com os Ajustes por último; trilho com Ajustes no pé | `casca.js` (`irPara`, `pintarNav`), `telas.js` (Mais), `index.html`, `estilo.css` seção 3 | 59, 60, 64, II, a |
| Barra de cima com nuvem, presente e balão em traço | `casca.js` (`topoHTML`) | 13, § 1º; 58 |
| Ícones de traço | `app.js` (`I`), `index.html` | 57 |
| Presente em 3D que gira com o dedo e janela do apoio | `jogo.js`, `casca.js` (`apoioSheet`), `estilo.css` seção 13 | 13, §§ 2º e 3º |
| Abertura de quatro telas, com Pular e a primeira recompensa | `casca.js` (`aberturaAbrir`), `estilo.css` seção 11 | 75 |
| Guia único de janela fixa | `casca.js` (`guiaIniciar` e seguintes), `estilo.css` seção 15 | 77 a 79 |
| Seções de uma linha aberta por vez, título tocado à vista | `app.js` (pessoas e pedidos da comanda) | 70 |
| `comMovimento` (anima todo trecho redesenhado) | `app.js` | 72 |
| Carrossel e arrastar e soltar do Conta | `app.js` (cupons e juntar pessoas) | 65, IX e XI |
| Tokens novos (cantos, navegação) e verificação do padrão da moldura nova | `estilo.css` seção 1; `comum/verificar.mjs` | Anexo II; Anexo VII |

## ANEXO III — Sincronização e cópia de segurança

- Motor `KitFacil.sync`; arquivo `<app>.json` num gist secreto.
- Criptografia AES-GCM de 256 bits; chave derivada do código de acesso com PBKDF2-SHA-256, 150 mil iterações, sal
  `<app>:<login>`.
- Exclusões marcadas por 400 dias.
- Sincroniza 2,5 s depois de cada mudança, ao abrir, ao voltar para o app, quando a internet volta e a cada minuto.
- Levar a outro aparelho: link `#/conectar/<chave>` ou colar a chave.
- Cada app passa ao motor as funções `carimbar`, `aplicar`, `pacote` e `mesmo`.

| Estado (`data-estado`) | Texto | Selo |
|---|---|---|
| `sincronizado` | Sincronizado | verde, com ✓ |
| `sincronizando` | Sincronizando | cor de destaque, setas girando |
| `pendente` | Alterações a enviar | amarelo, seta para cima |
| `erro` | Erro na sincronização | vermelho, com "!" |
| `offline` | Sem internet | nuvem cinza cortada |
| `desligada` | Sincronização desligada | cinza, com "–" |

**Cópia de segurança:** `{ formato: "copia-facil", app, esquema, versaoApp, em, dados }` (`KitFacil.copia`); os apps
continuam lendo os formatos antigos.

## ANEXO IV — Avaliação e feedback

`KitFacil.feedback`; coleção `feedback` do Firestore, pela API REST; regra em `comum/regras-firestore-feedback.txt`
(só aceita registros neste formato; ninguém lê pelos apps; as avaliações são lidas no console).

| Campo | Conteúdo |
|---|---|
| `esquema` | 1 |
| `app`, `versao` | qual app e qual versão |
| `nota` | 1 a 5 (0 no relato de problema) |
| `tipo` | `avaliacao`, `elogio`, `sugestao`, `critica` ou `problema` |
| `mensagem` | até 2.000 caracteres |
| `categoria`, `gravidade` | só no relato: algo não funciona, erro ou travamento, dados ou sincronização, tela ou texto, outro; baixa, média, alta |
| `contato` | opcional, até 120 caracteres |
| `tela` | tela em que a pessoa estava |
| `tecnico` | sistema, navegador, tela, app instalado ou não, idioma e últimos erros, só se marcado (marcado no relato, desmarcado na avaliação) |
| `enviadoEm` | data e hora do aparelho |

Fila: até 30 tentativas ou 60 dias; identificador próprio por mensagem, sem duplicar.

## ANEXO V — Movimento

Curva `cubic-bezier(.45,0,.2,1)` (`KitFacil.movimento`).

| O quê | Como | Duração |
|---|---|---|
| Seções e rolagem até um título | `KitFacil.secao` | 560 ms (`movimento.ms`) |
| Troca de tela | `KitFacil.movimento.entrar(area, { de: 'tela' })` | 280 ms (`movimento.curto`) |
| Guias dos Ajustes, mês do calendário | `de: 'lado'` | 280 ms |
| Listas, calendário, menus | descem ao abrir, sobem ao fechar | 280 / 200 ms |
| Janelas | um mecanismo só (Art. 68, § 3º): o desenho muda de uma vez e só a diferença se anima, com `transform`, num relógio só, para a janela, o conteúdo, o rodapé e a borda de baixo; sem transição de CSS de posição ou de altura; se o teclado muda no meio do caminho, o movimento parte de onde a janela está | como no Conta Fácil 1.6.1 |
| Trecho redesenhado (lista, cupom, linha que abre) | `comMovimento`: mede antes, redesenha, anima a diferença | 280 ms |
| Item novo | a tela rola até ele; pisca uma vez | 560 ms · 1,2 s |
| Carrossel | cartão desliza; altura acompanha | 280 ms |
| Arrastar e soltar | levanta inclinado; entra no alvo encolhendo, ou volta para o lugar | 220 · 280 ms |
| Avisos rápidos | sobem e aparecem | 280 ms |
| Item atual da navegação | a cor desliza | 280 ms |
| Presente do apoio | na barra, parado (ícone de traço); na janela, gira com o dedo e para quando é solto; parado com movimento reduzido | — |

O que sai é um "fantasma" desenhado pelo Kit; o elemento de verdade sai na hora, então o código e os testes não
esperam a animação.

## ANEXO VI — Abertura e guia

**Como é no Conta Fácil (referência, Art. 93):**

- Abertura (Art. 75): quatro telas, com pontos de posição, "Voltar", "Continuar" e "Pular" (some na última); deslizar
  para o lado troca de tela; a segunda tela é uma demonstração em que se toca; a última pergunta o nome (opcional) e dá
  a primeira recompensa a quem responde. Chave `<prefixo>abertura` = `1`; quem entra por um convite (link) vai direto
  para o que foi aberto. "Rever a apresentação" fica na guia própria dos Ajustes.
- Guia (Arts. 77 a 79): passos `{ t, d, sel, ir, acao }` na ordem de uso; a janela do guia ocupa um espaço só dela
  acima da barra de baixo (`--guia-h`), pisca antes de cada passo e a moldura se esvazia como um relógio; o estado do
  app é fotografado ao começar e devolvido ao terminar, sem gravar nada. "Mãos" do guia: `apontar`, `tocar`,
  `digitar`, `escolher`, `arrastar`, `esperar`, `destacar` e `voltar`. Movimento reduzido: o dedo não desliza e as
  esperas ficam curtas.

**Kit 0.6.0 (enquanto os outros aplicativos não migram):**

```
KitFacil.iniciar({
  app, nome, versao, icone, resumo, tela, abrirAjustes, emAjustes, copia, privacidade, textos,
  novidades: [{ versao, itens: [...] }],
  boasVindas: { novo: () => bool, exemplo: () => {}, rotuloExemplo },
  apresentacao: { frase, pontos: [[titulo, texto], ...] },
  guia: { niveis: [{ nome: 'Simplificado' }, { nome: 'Completo' }], explicacao, passos, preparar, fim, semPassos, ocupado },
})
```

Essa janela a cada abertura e o guia em níveis deixam de valer na vez de cada aplicativo (Art. 93, § 2º). O Kit 0.7.0
troca `apresentacao` e `guia.niveis` pela abertura e pelo guia único acima.

## ANEXO VII — Comandos, verificação e testes

Node 22 ou mais novo; testes com Playwright (Chromium).

| Comando | O que faz |
|---|---|
| `npm start` | sobe o app em `http://localhost:8080/<app>/` |
| `npm test` | testes do Kit e do app, sem internet (GitHub e Firebase simulados), com a varredura de acessibilidade |
| `node --test <arquivos>` | só os testes da parte alterada (Art. 23, I); o guia inteiro e a bateria completa ficam para quando a mudança mexe neles |
| `npm run verificar` | pasta `comum/` igual, sem segredos, versão nos quatro lugares, arquivos do service worker, idioma, zoom, fonte, moldura, barra de cima, Ajustes em guias, componentes nas medidas do Kit, CSP e SRI. Até o Kit 0.7.0, acusa no Conta Fácil duas falhas esperadas (barra de cima e Ajustes dentro de Mais) |
| `npm run testar-regras` | testa as regras do Firestore no projeto de verdade, sem deixar nada gravado (precisa de internet) |

- Telas de referência: 320 × 568 (equivale ao zoom de 400%), 360 × 740, 390 × 844, 820 × 1180 e 1440 × 900; áreas
  seguras respeitadas.
- Varredura de acessibilidade (`comum/testes/acessibilidade.test.mjs`): axe-core com as regras WCAG 2.2 A e AA, na
  abertura, na tela inicial e nos Ajustes (procurados em Mais, onde ficam agora; no Conta Fácil, por enquanto, em
  `tests/acessibilidade.test.mjs`), nos temas claro e escuro. Precisa do pacote de desenvolvimento
  `@axe-core/playwright` (`npm install`); sem ele, o teste é pulado com aviso e não conta como aprovado.
- Testes comuns: `conferirTopo`, `conferirNavAjustes`, `guiasAjustes` e o teste de tela principal do Kit.
- Mudar o Kit: alterar `comum/` num repositório, `node comum/verificar.mjs --gerar`, copiar `comum/` para os outros,
  `npm run verificar` e `npm test` em todos.
- App novo: copiar `comum/`, o `package.json` (nome e versão), o modelo do `sw.js` e do README; incluir o app em
  `FAMILIA` (`kit-facil.js`) e na regra do Firestore (`app in [...]`); ligar as variáveis `--kf-*`; manifesto com
  `"id": "/<app>/"`; montar a moldura, a barra de cima e os Ajustes; chamar `KitFacil.iniciar` como no Anexo VI.

## ANEXO VIII — Segurança

**Regras do Firestore** (`comum/regras-firestore-feedback.txt`, regra inteira do projeto `conta-facil-2c1f9`):

| Coleção | Quem cria | Quem lê | Quem altera ou apaga | Conferências |
|---|---|---|---|---|
| `feedback` | qualquer aparelho | ninguém pelos apps (só o console) | ninguém | `hasOnly` dos campos; tipo e tamanho de cada campo, inclusive dentro de `tecnico`; data de envio não futura; id até 40 |
| `mesas` | aparelho com login anônimo | quem tem o código (10+ caracteres), um documento por vez | altera: quem tem o código, sem trocar o dono; apaga: só o dono (`hostUid`) | `hasOnly` dos campos; até 60 pessoas, 400 itens, 60 turmas, 100 aparelhos; `expiraEm` até 31 dias; comanda encerrada não reabre |
| qualquer outra | ninguém | ninguém | ninguém | regra final `/{caminho=**}` fechada |

**Limite de quantidade**

| Camada | Como | Onde |
|---|---|---|
| Aparelho | 1 avaliação por minuto e 10 por dia, por app (`kitfacil.<app>.envios`) | `KitFacil.feedback` |
| App Check | reCAPTCHA Enterprise (Fraud Defense); o crachá vai no cabeçalho `X-Firebase-AppCheck` (avaliações) e pelo SDK (comanda ao vivo) | chave do site em `DESTINO_PADRAO.appCheck.siteKey` (Kit) e `appCheckSiteKey` (`config.js` do Conta Fácil) |
| Exigência do App Check | ligada no Firestore só quando as métricas mostrarem quase todos os pedidos com crachá | console do Firebase → App Check → APIs → Cloud Firestore |
| Contas anônimas | cota de criação de contas por endereço de internet | Firebase Authentication → Configurações |
| Chave do navegador | restrita a `https://brunodecastrosilva.github.io/*` | Google Cloud → APIs e serviços → Credenciais |

O selo do reCAPTCHA fica escondido (`.grecaptcha-badge`); o aviso do Google aparece no formulário de avaliação e em
*Privacidade e segurança*.

**No aparelho**

- CSP no `<meta http-equiv="Content-Security-Policy">` de cada `index.html`, igual nos quatro: `default-src 'self'`;
  scripts só de arquivos do próprio app, do cdnjs, do gstatic e do reCAPTCHA (nenhum `<script>` escrito dentro da
  página, sem `'unsafe-inline'` nos scripts); conexões só com GitHub, Firestore, Authentication, App Check, reCAPTCHA,
  cdnjs e fontes; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`. Proibido `unsafe-eval` e curinga `*`.
  Os estilos ainda aceitam `'unsafe-inline'` (há atributos `style` nas telas); estilo não roda código.
- SRI (`integrity` com `crossOrigin = 'anonymous'`) nas bibliotecas do cdnjs: qrcode-generator 1.4.4, jsPDF 2.5.1 e
  pdf.js 3.11.174. Exceções: o worker do pdf.js (o próprio pdf.js o carrega) e o Firebase (módulos importados do
  gstatic, que não aceitam SRI).
- Texto de fora sempre por `esc()` antes de `innerHTML`.
- Código de acesso da sincronização só com permissão de gist, guardado no aparelho.

**Verificação** (`npm run verificar`): falha sem CSP, com CSP fraca, com `<script>` dentro do `index.html` ou com
biblioteca do cdnjs sem SRI.

**Antes e depois de publicar uma regra:** testar no Playground de regras do console e, depois de publicar, rodar
`npm run testar-regras` (recusas das avaliações erradas, ciclo completo de uma comanda de teste e coleção sem regra
fechada; nada fica gravado). Com a exigência do App Check ligada, os aceites precisam do token de depuração do App
Check.

**Tarefas agendadas:** lembrete mensal da limpeza do Firebase (dia 1º) e auditoria trimestral (fevereiro, maio, agosto
e novembro), criadas como tarefas agendadas no claude.ai.

**Auditoria trimestral (Art. 50):**

1. regras publicadas no console iguais às do repositório;
2. métricas do App Check e uso da cota do Firebase;
3. busca de segredos nos quatro repositórios;
4. pontos de `innerHTML` com texto de fora;
5. versões das bibliotecas do CDN e os seus avisos de segurança;
6. CSP sem violações no console do navegador, nos quatro apps;
7. achados registrados na revisão geral do Integrador.
