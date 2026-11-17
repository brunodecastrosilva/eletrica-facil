# Anexos do Código do Projeto Fácil

Versão **0.11.0 (rascunho)** · 17/11/2026 · Kit Fácil **0.9.0** (com as peças do Conta Fácil)

Detalhes técnicos do Código do Projeto Fácil (arquivo à parte). Os anexos mudam sem alterar os artigos, desde que não
os contrariem (Art. 4º, § 2º); se contrariarem, vale o artigo.

| Anexo | Assunto | Artigos |
|---|---|---|
| I | Aplicativos, repositórios e identidade | 17 a 20, 48 a 49 do Título IV, 56 |
| II | Sistema de design e peças do Kit | 27 a 31, 55 a 72-A |
| III | Sincronização e cópia de segurança | 32 a 37 |
| IV | Avaliação e feedback | 51 a 54 |
| V | Movimento | 72 e 72-A |
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
| Cantos | `--kf-r-sm` 8 · `--kf-r-btn` 14 · `--kf-r-campo` 14 · `--kf-r-md` 18 · `--kf-r-lg` 28 · `--kf-r-cartao` 20 px (valores do Conta Fácil, no Kit desde o 0.7.0) |
| Botões | `--kf-btn-h` 48 px · `--kf-btn-h-p` 40 px |
| Moldura | `--kf-barra-h` 60 · `--kf-nav-h` 54, barra colada ao pé, com folga da área segura `max(4px, 55% de safe-area-inset-bottom)` · `--kf-trilho-w` 240 · `--kf-alvo` 44 px; computador a partir de 1024 px |
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
| Botões | `kf-btn` + `kf-pri`, `kf-sec`, `kf-perigo`, `kf-perigo-sec`, `kf-link` | `kf-perigo` e `kf-perigo-sec` são cheios, fundo `--kf-perigo-fundo` (#B3362B nos três temas) e texto branco, 5,9:1 (Kit 0.8.0; Art. 66, § 1º) |
| Campos | `kf-entrada`, `kf-rotulo`, `kf-ajuda`, `kf-opcional`, `kf-check` | o app pode ligar `--kf-campo-fundo`, `--kf-campo-linha`, `--kf-campo-traco` e `--kf-campo-anel`, para os campos do Kit (inclusive a caixa de texto grande) ficarem iguais aos dele (Kit 0.9.0) |
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
| Presente | na barra, `IC.presente` (traço, mesma cor da nuvem e do balão); na janela do apoio, `KitFacil.apoio.presente(L)`, o presente em 3D que gira com o dedo (motor em `comum/kit-jogo.js`, buscado pelo Kit); em *Sobre*, `KitFacil.apoio.mini()` | cores do app: `--kf-presente` (papel e tampa; padrão `--kf-accent`) e `--kf-presente-fita` (fita e laço; padrão `--kf-comecar`); sem o motor de 3D (sem internet na primeira visita), fica o desenho parado; movimento reduzido: parado, gira só com o dedo e com as setas |

**Peças do Conta Fácil no Kit 0.7.0 (Art. 93; D13, 15/11/2026)**

Saíram do Conta Fácil 1.7.0 sem nada próprio do Conta; o Conta Fácil 1.8.0 usa as do Kit, como os outros.

| Peça | No Kit | Artigos |
|---|---|---|
| Janelas: um mecanismo só (nascer, acompanhar o teclado, mudar de altura, trocar, sair pelo pé com o fundo clareando junto; só `transform`, num relógio só) | `KitFacil.dialogo.abrir`, `KitFacil.janela.ocupada(ms)`, `.teclado()`, `.tecladoAssentado()`; variáveis `--kf-tk`, `--kf-max`, `--kf-pe`; classe `html.kf-tk` | 16, IX; 68, § 3º; 72-A |
| Janela sem campo selecionado | `dialogo.abrir` tira o `autofocus` de campo de texto e solta o campo que o app focar ao montar | 16, IX; 68, § 5º |
| Confirmação | `KitFacil.dialogo.confirmar({ titulo, texto, desfaz, ok, perigo, aoConfirmar, aoCancelar })`; botões `data-kf-cancelar` e `data-kf-ok`; rótulo que começa com Excluir, Remover ou Apagar fica vermelho sozinho (Kit 0.8.0) | 65, VIII; 66, § 1º |
| Barra de baixo com a ação principal no centro e "Mais"; trilho com Mais e Ajustes no pé; tela Mais com os Ajustes por último | `KitFacil.nav.barra`, `.trilho`, `.mais`; botões `data-kf-ir="<id>"`, ids `kf-nav-<id>` e `kf-trilho-<id>`; variáveis `--kf-nav-bg`, `--kf-nav-ink`, `--kf-nav-on`, `--kf-nav-atual`, `--kf-nav-atual-bg` | 59, 60, 64, II, a |
| Barra de cima com nuvem, presente e balão em traço, na mesma cor | `KitFacil.topo.html({ principal: true })` | 13, § 1º; 58 |
| Presente em 3D e janela do apoio | `KitFacil.apoio.abrir`, `comum/kit-jogo.js` | 13, §§ 2º e 3º |
| Abertura de quatro telas | `KitFacil.abertura.abrir({ telas, fim, extra, aoMontar, aoFechar })`, `.ativa()`, `.vista()`; chave `<prefixo>abertura` | 75 |
| Guia único de janela fixa | `KitFacil.guia.demonstrar({ passos, comecar, terminar, foto, restaurar, limpar, maos, cabecalhoFixo })`, `.emDemonstracao()`, `.pararDemonstracao()`, `.estado()`; passo `{ t, d, se, continua, acao }` (Anexo VI) | 77 a 79 |
| Trecho redesenhado com movimento | `KitFacil.movimento.redesenhar(raiz, fn, { marca })`; `[data-kf-exp]` e `[data-kf-morf]` | 72 |
| Relógio único de 600 ms | `KitFacil.movimento.ms`, `--kf-ms`, `--kf-curva` (Anexo V); saiu o ajuste provisório de `Element.prototype.animate` do Conta | 72, § 1º |
| Campo com sugestões | `KitFacil.sugestoes(campo, itens, aoEscolher)`; abaixo da linha inteira quando o pai é `.kf-linha` | 65, XII |
| Campos de dinheiro e porcentagem | `KitFacil.campo.dinheiro` e `.porcento` (`html`, `formatar`, `ler`); `<input data-kf-dinheiro>` e `<input data-kf-pct>`; `KitFacil.campo.ligar()` e `.preparar(raiz)` (opcionais) | 65, XIII |
| Quantidade (− e +), chave e botões de escolha | `KitFacil.ui.quantidade`, `.chave`, `.escolha`; classes `kf-quantidade`, `kf-chave`, `kf-escolha` | 65, XIII |
| Botão de começar | classe `kf-btn kf-comecar`; variáveis `--kf-comecar` e `--kf-comecar-ink` | 66, II |
| Pix de cobrança e do apoio | `KitFacil.pix.codigo({ chave, nome, cidade, valor })`, `.chave(k)`, `.janela({ titulo, sub, codigo })`, `.qr(caixa, codigo)` | 13 |
| Tampinhas, níveis e objetos em 3D (opcional) | `comum/kit-jogo.js`: `KitFacil.jogo.girar`, `.tampaHTML`, `.icones`, `.confete`, `.vibrar`, `.nivel` | 68, § 4º; 72, § 4º |
| Tokens (cantos, barra de baixo) e verificação da moldura nova | `kit-facil.css`; `comum/verificar.mjs` | Anexo II; Anexo VII |
| Medição de movimento quadro a quadro | `comum/testes/ambiente.mjs`: `filmarJanela`, `teclado`, `animacoes`, `assentar`, `semCampoEmFoco` | Anexo VII |

**Peças da Proposta 3 do Conta Fácil no Kit 0.8.0 (Código 0.8, 15/11/2026)**

Saíram do Conta Fácil 1.8.2 a 1.8.7; o Conta Fácil 1.9.0 usa as do Kit.

| Peça | No Kit | Artigos |
|---|---|---|
| Cópia da janela que fecha com a altura da janela | `fantasma()` mantém `data-kf-esc`, `data-kf-data`, `data-kf-hora` e `data-kf-nativa`; lista de escolha, data e hora não ligam nada dentro de `#kf-saidas` | 68, § 3º; 72-A |
| Campo apontado sem foco | `KitFacil.apontar(campo)`: `aria-invalid="true"` e contorno `--kf-bad`, que saem quando a pessoa digita | 16, IX; 68, § 5º |
| Puxar a janela pela barrinha | abaixo de 1024 px: barrinha (`.kf-dlg-cab::before`), cabeçalho e pé com `touch-action:none`; o dedo move pela propriedade `translate`; fecha depois de um terço da altura (no máximo 160 px) ou num puxão rápido; classe `body.kf-puxando`; fora do guia | 16, X; 68, § 6º |
| Cursor só com a janela parada | classe `kf-sem-cursor` (`caret-color:transparent`) enquanto a janela do campo está a caminho | 68, § 3º; 72-A |
| Pé recolhido com o teclado | `html.kf-tk body:not(.kf-com-guia) .kf-dlg > .kf-dlg-pe{display:none}` | 16, IX; 68, § 3º |
| Vermelho de excluir | `--kf-perigo-fundo` | 16, V; 66, § 1º |

**Peças da Proposta 4 do Conta Fácil no Kit 0.9.0 (Código 0.9, 15/11/2026)**

Saíram do Conta Fácil 1.9.1 a 1.9.6; o Conta Fácil 1.10.0 usa as do Kit e não passa por cima de nenhuma peça (Art. 30-A).

| Peça | No Kit | Artigos |
|---|---|---|
| Opção da janela de Avaliação e feedback | classes `kf-fb-ops`, `kf-fb-op`, `kf-fb-op-ic` e `kf-fb-op-tx`: linha com ícone, título, apoio e seta, separadas por uma linha fina; `kf-escolha` é só a pílula de escolher um valor (`KitFacil.ui.escolha`) | 52; 71 |
| Janela do Kit sem "Fechar" sozinho no pé | Avaliação e feedback, Sobre o aplicativo, Mensagem enviada e o "Mais" antigo fecham pelo X | 68, § 1º |
| "O que é enviado e para onde" | `kf-det` com a seta do Kit no lugar do marcador do navegador; alvo de 44 px | 16, IV; 71 |
| Guia: o alvo vem para a parte à vista | `mostrar` usa os limites de quem rola de verdade (o conteúdo da janela, uma tela cheia do app ou a página), sempre acima da janela do guia | 78; 79 |
| Guia: janela aberta de um passo para o outro | passo com `continua: true`: o Kit não fecha a janela antes dele; ao voltar um passo a janela é fechada, e o passo confere `KitFacil.dialogo.aberto()` e se põe no lugar sozinho | 78, IV |
| Guia: destaque de área | `m.apontar` aceita um elemento, uma lista de elementos ou um trecho de texto (`Range`); o anel abraça a união, medida a cada quadro | 79 |
| Guia: tela cheia do app | a tela cheia leva `data-kf-tela-cheia`; no guia, `body.kf-com-guia [data-kf-tela-cheia]{bottom:var(--kf-pe)}` deixa livre o pé, onde fica a janela do guia | 68, § 4º; 79 |
| CSS do Kit sem regra repetida | saíram 184 regras escritas duas ou três vezes (o arquivo ficou com 19 kB a menos); `npm run verificar` falha se uma regra do Kit voltar a se repetir | Anexo VII |

Ficam só no Conta Fácil, por serem do assunto dele: contas da comanda, cupons, comanda ao vivo, sorteio, a lista das
tampinhas e a festa de fechamento. O carrossel dos cupons e o arrastar para juntar pessoas continuam os do Conta, presos
às contas da comanda; o Kit já tinha os seus (`KitFacil.carrossel` e `KitFacil.arrastar`, Kit 0.4.0), e as seções de
uma linha aberta por vez são as do Kit (`<details data-kf-secao="grupo">`).

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

**Um relógio só (Art. 72, § 1º):** 600 ms na curva `cubic-bezier(.45,0,.2,1)` para tudo o que abre ou fecha. No Kit
0.7.0: `KitFacil.movimento.ms` = 600 (`MOV.ms`, `MOV.curto` e `MOV_SAIDA` iguais), variáveis CSS `--kf-ms` e
`--kf-curva`; as cópias que saem (janelas, listas, calendário) só são removidas no fim do movimento.

| O quê | Como | Duração |
|---|---|---|
| Seções e rolagem até um título | `KitFacil.secao` | 600 ms |
| Troca de tela | `KitFacil.movimento.entrar(area, { de: 'tela' })` | 600 ms |
| Guias dos Ajustes, mês do calendário | `de: 'lado'` | 600 ms |
| Listas, calendário, menus | descem ao abrir, sobem ao fechar | 600 ms |
| Janelas e fundo escuro | um mecanismo só (Art. 68, § 3º): o desenho muda de uma vez e só a diferença se anima, com `transform`, para a janela, o conteúdo, o rodapé e a borda de baixo; sem transição de CSS de posição ou de altura; nasce subindo e sai descendo pelo pé, com o fundo escurecendo e clareando junto; se o teclado muda no meio do caminho, o movimento parte de onde a janela está | 600 ms (com o teclado do sistema, o relógio dele, cerca de 300 ms) |
| Trecho redesenhado (lista, cupom, linha que abre) | `KitFacil.movimento.redesenhar`: mede antes, redesenha, anima a diferença | 600 ms |
| Avisos rápidos | sobem e aparecem | 600 ms |
| Item novo (destaque, fora do § 1º) | a tela rola até ele; pisca uma vez | 600 ms · 1,2 s |
| Carrossel (fora do § 1º) | cartão desliza; altura acompanha | 280 ms |
| Arrastar e soltar (fora do § 1º) | levanta inclinado; entra no alvo encolhendo, ou volta para o lugar | 220 · 280 ms |
| Item atual da navegação (fora do § 1º) | a cor desliza | 280 ms |
| Presente do apoio | na barra, parado (ícone de traço); na janela, gira com o dedo e para quando é solto; parado com movimento reduzido | — |

O que sai é um "fantasma" desenhado pelo Kit; o elemento de verdade sai na hora, então o código e os testes não
esperam a animação.

## ANEXO VI — Abertura e guia

**Como é no Conta Fácil (referência, Art. 93):**

- Abertura (Art. 75): quatro telas, com pontos de posição, "Voltar", "Continuar" e "Pular" (some na última); deslizar
  para o lado troca de tela; a segunda tela é uma demonstração em que se toca; a última pergunta o nome (opcional) e dá
  a primeira recompensa a quem responde. Chave `<prefixo>abertura` = `1`; quem entra por um convite (link) vai direto
  para o que foi aberto. "Rever a apresentação" fica na guia própria dos Ajustes.
- Guia (Arts. 77 a 79): passos `{ t, d, se, continua, acao }` na ordem de uso (`se` decide se o passo entra;
  `continua: true` mantém aberta a janela do passo anterior: Art. 78, IV); a janela do guia ocupa um espaço só dela
  acima da barra de baixo (`--kf-gu-h`), pisca antes de cada passo e a moldura se esvazia como um relógio; o estado do
  app é fotografado ao começar e devolvido ao terminar, sem gravar nada. "Mãos" do guia: `acha`, `some`, `tocar`,
  `digitar`, `apontar` (um elemento, uma lista ou um trecho de texto), `arrastar`, `rolar`, `fechar` e `espera`; o app
  pode juntar as suas em `maos`. Movimento reduzido: o dedo não desliza e as esperas ficam curtas.

**No Kit 0.7.0:** `KitFacil.abertura.abrir` e `KitFacil.guia.demonstrar` (Anexo II). A janela do guia usa `--kf-gu-h` e as classes `kf-gu-*`.

**Kit 0.6.0 (vale nos aplicativos até a vez de cada um seguir o Conta Fácil):**

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
tem as duas coisas: a abertura e o guia único, para quem já segue o Conta Fácil, e `apresentacao` e `guia.niveis`, para
quem ainda não chegou à sua vez.

## ANEXO VII — Comandos, verificação e testes

Node 22 ou mais novo; testes com Playwright (Chromium; sem ele, o Google Chrome instalado, ou o canal de `PLAYWRIGHT_CHANNEL`).

| Comando | O que faz |
|---|---|
| `npm start` | sobe o app em `http://localhost:8080/<app>/` |
| `npm test` | testes do Kit e do app, sem internet (GitHub e Firebase simulados), com a varredura de acessibilidade |
| `node --test <arquivos>` | só os testes da parte alterada (Art. 23, I); o guia inteiro e a bateria completa ficam para quando a mudança mexe neles |
| `npm run verificar` | pasta `comum/` igual, sem segredos, versão nos quatro lugares, arquivos do service worker, idioma, zoom, fonte, moldura, barra de cima, Ajustes em guias, componentes nas medidas do Kit, CSP e SRI, navegação do Kit 0.7.0 (`KitFacil.nav.barra` e `.trilho`) e um relógio só (o app não troca `Element.prototype.animate`) e CSS do Kit sem regra repetida (Kit 0.9.0). App em `1.x` sem a navegação nova é falha; app em `0.x` recebe aviso até a sua vez (Art. 93, § 2º) |
| `npm run testar-regras` | testa as regras do Firestore no projeto de verdade, sem deixar nada gravado (precisa de internet) |

- Telas de referência: 320 × 568 (equivale ao zoom de 400%), 360 × 740, 390 × 844, 820 × 1180 e 1440 × 900; áreas
  seguras respeitadas.
- Varredura de acessibilidade (`comum/testes/acessibilidade.test.mjs`): axe-core com as regras WCAG 2.2 A e AA, na
  abertura, na tela inicial e nos Ajustes (procurados em Mais, onde ficam agora; no Conta Fácil, por enquanto, em
  `tests/acessibilidade.test.mjs`), nos temas claro e escuro. Precisa do pacote de desenvolvimento
  `@axe-core/playwright` (`npm install`); sem ele, o teste é pulado com aviso e não conta como aprovado.
- Testes comuns: `conferirTopo`, `conferirNavAjustes` (a navegação antiga e a do Kit 0.7.0), `guiasAjustes` e o teste de
  tela principal do Kit; a medição de movimento quadro a quadro (`filmarJanela`, `teclado`, `animacoes`, `assentar`) e
  `semCampoEmFoco`, que confere que nenhuma janela abre com campo de texto em foco.
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
