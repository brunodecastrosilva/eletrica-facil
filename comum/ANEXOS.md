# Anexos do Código do Projeto Fácil

Versão **0.14.0 (rascunho)** · 27/11/2026 · Kit Fácil **0.9.1** (com as peças do Conta Fácil)

Detalhes técnicos do Código do Projeto Fácil (arquivo à parte). Os anexos mudam sem alterar os artigos, desde que não
os contrariem (Art. 4º, § 2º); se contrariarem, vale o artigo.

| Anexo | Assunto | Artigos do Código |
|---|---|---|
| I | Aplicativos, repositórios e identidade | 9, 21 |
| II | Sistema de design e peças do Kit | 14, 21, 22 |
| III | Sincronização e cópia de segurança | 15 a 17 |
| IV | Avaliação e feedback | 24 |
| V | Movimento | 22 |
| VI | Abertura e guia | 22 |
| VII | Comandos, verificação e testes | 12, 14 |
| VIII | Segurança | 18, 19, 32 |
| IX | Regras de interface, de comportamento e de trabalho (os artigos de detalhe do Código até a 0.13.1) | 5 a 7, 22, 28 |

Nos Anexos I a VIII, "Art. N" sem outra indicação é artigo do Anexo IX, que guarda o número que tinha no Código até a
0.13.1.

## ANEXO I — Aplicativos, repositórios e identidade

| Aplicativo | Repositório | Endereço | Prefixo dos dados | Destaque (`--kf-accent`) | Ideia visual | Tema de fábrica | Fonte dos títulos |
|---|---|---|---|---|---|---|---|
| Conta Fácil | `brunodecastrosilva/conta-facil` | `…github.io/conta-facil/` | `contafacil.` | verde azulejo `#1D5A3B` | comanda de papel (IBM Plex Mono no papel; papel claro atenuado no escuro: Art. 56, V) | Automático | Bricolage Grotesque |
| Elétrica Fácil | `brunodecastrosilva/eletrica-facil` | `…github.io/eletrica-facil/` | `eletricafacil.` | amarelo `#FFD21F` (letra `#16171A`); fundo `#F4F3EF` no claro e `#141518` no escuro | ferramenta de obra | Automático | Red Hat Display (700 a 900) |
| Estudo Fácil (pessoal, fora da família comercial: Código, Art. 1º, § 1º) | `brunodecastrosilva/estudo-facil` | `…github.io/estudo-facil/` | `estudofacil.` | azul caneta `#2742D3` | caderno e marca-texto | Automático | Fraunces (500 a 800) |
| Guitarra Fácil (em espera) | `brunodecastrosilva/guitarra-facil` | `…github.io/guitarra-facil/` | `guitarrafacil.` | grafite `#2B2B30`, com o vermelho do pedal | pedal de efeito sobre amplificador | Escuro | Big Shoulders Display (700 a 900) |

**Cor de começar (Art. 66, II):** Conta Fácil, âmbar `#F2B33D` com texto `#2A1D02`; Elétrica Fácil, o próprio amarelo `#FFD21F` com texto `#16171A` (5.2.0); Estudo Fácil, verde-limão `#DFF65C` com texto `#131A3A`. O Guitarra Fácil escolhe a sua na vez dele (Art. 93, § 2º).

**Manifesto:** `"id": "/<app>/"`, com `start_url` e `scope` dentro da pasta do app. **Service worker:** cache
`<app>-<versão>`. **Chave da sincronização:** `<prefixo>sync`, reaproveitável por outro app da família no mesmo aparelho.
**Firebase:** projeto `conta-facil-2c1f9` (avaliações de todos os apps), plano gratuito. A comanda ao vivo saiu do Conta Fácil na 1.13.0.

**Guias próprias nos Ajustes**

| Aplicativo | Guias próprias | Extras nas guias comuns |
|---|---|---|
| Conta Fácil | Tampinhas e apresentação (guia, comanda de exemplo e Cadastros ficam em Mais) | Conta e perfil: "Você nas comandas", onde a pessoa escreve o próprio nome |
| Elétrica Fácil | Cobrança · Pix · Documento novo · Raio e apresentação (o Mais tem atalhos para elas: 5.4.0) | Conta e perfil: "Seus dados nos documentos" (nome, WhatsApp e logotipo) |
| Estudo Fácil | Rotina · Medalhas e apresentação | Conta e perfil: "Você no app" · Privacidade e segurança: apagar todos os dados, inclusive na nuvem |
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
| Abertura (até quatro telas de apresentação e, se o aplicativo pedir, telas de cadastro) | `KitFacil.abertura.abrir({ telas, fim, extra, aoMontar, aoFechar })`, `.ativa()`, `.vista()`; chave `<prefixo>abertura` | 75 |
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

Ficam só no Conta Fácil, por serem do assunto dele: contas da comanda, cupons, sorteio, a lista das
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

**Testes automáticos no GitHub** (`.github/workflows/testes.yml`, igual nos repositórios): a cada envio para a `main`,
o GitHub Actions instala o Node 22, as dependências de desenvolvimento e o Chromium do Playwright e roda
`node comum/verificar.mjs` e `npm test`. Falha aparece no repositório e no e-mail do Bruno; o Claude confere o
resultado depois de cada publicação (Código, Art. 12).

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
| qualquer outra | ninguém | ninguém | ninguém | regra final `/{caminho=**}` fechada |

**Limite de quantidade**

| Camada | Como | Onde |
|---|---|---|
| Aparelho | 1 avaliação por minuto e 10 por dia, por app (`kitfacil.<app>.envios`) | `KitFacil.feedback` |
| App Check | reCAPTCHA Enterprise (Fraud Defense); o crachá vai no cabeçalho `X-Firebase-AppCheck` das avaliações | chave do site em `DESTINO_PADRAO.appCheck.siteKey` (Kit) |
| Exigência do App Check | ligada no Cloud Firestore desde 27/11/2026: pedido sem crachá é recusado | console do Firebase → App Check → APIs → Cloud Firestore |
| Chave do navegador | restrita a `https://brunodecastrosilva.github.io/*` | Google Cloud → APIs e serviços → Credenciais |

O selo do reCAPTCHA fica escondido (`.grecaptcha-badge`); o aviso do Google aparece no formulário de avaliação e em
*Privacidade e segurança*.

**No aparelho**

- CSP no `<meta http-equiv="Content-Security-Policy">` de cada `index.html`, igual nos quatro: `default-src 'self'`;
  scripts só de arquivos do próprio app, do cdnjs, do gstatic e do reCAPTCHA (nenhum `<script>` escrito dentro da
  página, sem `'unsafe-inline'` nos scripts); conexões só com GitHub, Firestore, App Check, reCAPTCHA,
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
`npm run testar-regras` (recusas das avaliações erradas e das coleções sem regra, inclusive a antiga `mesas`; nada
fica gravado). Com a exigência do App Check ligada (desde 27/11/2026), o banco recusa tudo o que vem do teste, que não leva crachá: as recusas continuam valendo, e os aceites se conferem pelo app no ar.

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

## ANEXO IX — Regras de interface, de comportamento e de trabalho

Artigos de detalhe do Código até a versão 0.13.1, com o número que tinham. Valem como antes, abaixo dos artigos do
Código 0.14.0 (Art. 2º); citação antiga "Código, Art. N" de um destes vale como "Anexo IX, Art. N". Os artigos que
falavam dos Projetos dos aplicativos no claude.ai saíram (Código, Art. 26). As Regras de cada aplicativo ficam em
`claude/<app>.md`, no Integrador.

### Da gratuidade e do apoio voluntário

**Art. 12.** Os aplicativos são gratuitos, e nenhuma função depende de pagamento.

**Art. 13.** Todos os aplicativos têm o mesmo convite de apoio: "Gostando do app? Mande um presente para o criador!".

§ 1º O convite é um ícone de presente na barra de cima, entre a nuvem e o balão, só nas telas principais, desenhado em
traço e na mesma cor da nuvem e do balão (Art. 58, II). Há um atalho também em *Sobre o aplicativo*.

§ 2º A janela do apoio é do Kit, igual em todos os aplicativos: um presente em três dimensões que gira com o dedo, o
convite, o QR code do Pix e um só botão, "Copiar código Pix".

§ 3º Quem pede movimento reduzido vê o presente parado; ele só gira com o dedo (Art. 16, VII).

§ 4º A chave Pix é aleatória, nunca CPF, telefone ou e-mail. O nome no código Pix é não pessoal ("PROJETO FACIL").

§ 5º O convite não abre sozinho, não interrompe tarefas e não bloqueia nada.


### Do idioma e dos textos

**Art. 14.** Os aplicativos são só em português do Brasil, por enquanto.

**Art. 15.** Os textos seguem estas regras:

I – frases curtas, de até cerca de 14 palavras, com tom direto e respeitoso;

II – botões com verbo, de 2 a 4 palavras ("Salvar", "Enviar", "Ativar sincronização"), e sem descrição dentro: só o
rótulo; a explicação, quando precisa, fica fora do botão;

III – mensagem de erro diz o que aconteceu e o que fazer, sem culpar a pessoa e sem código técnico solto;

IV – os nomes das guias dos Ajustes, dos estados da nuvem e das opções do balão são exatamente os deste Código.


### Da acessibilidade

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

IX – janelas com o foco preso dentro, Esc fecha e o foco volta para quem abriu; nenhuma caixa de texto é selecionada
sozinha, e o campo que falta preencher é apontado, sem receber o foco (Art. 68, § 5º); com o teclado aberto, a janela
fica acima dele, o campo em foco fica à vista e nenhum botão sobe para cima do teclado (Art. 68, § 3º);

X – toda ação de arrastar tem também um jeito sem arrastar, com botão e lista de marcar; a janela que se puxa pela
barrinha também fecha pelo X e pelo Esc (Art. 68, § 6º);

XI – o elemento com foco nunca fica escondido atrás da barra de cima, da navegação de baixo, do botão de criar ou de
outra barra fixa;

XII – avisos, erros e mudanças de estado são anunciados ao leitor de tela, sem tirar o foco do lugar.


### Dos repositórios

**Art. 20.** Como os aplicativos dividem o mesmo endereço (`brunodecastrosilva.github.io`):

I – tudo o que o aplicativo guarda no navegador usa o prefixo do aplicativo (Anexo I);

II – o manifesto de cada aplicativo tem identidade própria, com o nome da pasta do aplicativo (nunca `./`), e início e
escopo dentro dessa pasta;

III – o service worker de cada aplicativo só apaga e só responde pelo que é dele.

**Art. 21.** Não há etapa de build: o que está no repositório é o que vai para o ar. Bibliotecas de terceiros entram
por CDN, com versão fixa, só quando a função é usada.


### Da versão e da publicação

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


### Do Kit Fácil

**Art. 30.** Para mudar o Kit:

I – alterar a pasta `comum/` de um repositório e subir a versão do Kit quando mudar comportamento;

II – gerar de novo o manifesto da pasta `comum/`;

III – copiar a pasta `comum/` inteira para os outros repositórios;

IV – em cada um, rodar a verificação e os testes, subir a versão do aplicativo se ele mudou para quem usa e registrar
no CHANGELOG.

**Art. 30-A.** Quando uma peça do Kit atrapalha a qualidade de um aplicativo, o aplicativo passa por cima dela, sem
alterar a pasta `comum/`, e a solução vai para o Painel como proposta para o Kit (Código, Art. 14, § 2º).

**Parágrafo único.** Até o Kit absorver a solução, o README e o CHANGELOG do aplicativo dizem qual peça foi substituída
e por quê.

**Art. 31.** Aplicativo novo copia a pasta `comum/`, o modelo do `package.json`, do service worker e do README, entra
na família do Kit e na regra do Firestore e monta a moldura, os Ajustes e a abertura deste Código (Anexo VII).


### Do armazenamento e da sincronização

**Art. 33.** A sincronização entre aparelhos é opcional e igual em todos os aplicativos (Anexo III):

I – os dados vão para um gist secreto na conta GitHub da própria pessoa;

II – o conteúdo é criptografado no aparelho; o GitHub só vê texto embaralhado;

III – cada registro guarda a hora da última mudança, e, ao juntar, a mudança mais recente vence, registro a registro;

IV – exclusões ficam marcadas para não voltarem num aparelho que estava desligado;

V – o código de acesso fica só no aparelho, com permissão apenas de gist, e a mesma chave serve para todos os
aplicativos.

**Art. 34.** Não sincronizam, de propósito:

I – as preferências do aparelho, como o tema;

II – a comanda aberta do Conta Fácil, que fica só no aparelho de quem a abriu;

III – o orçamento de exemplo do Elétrica Fácil.

**Art. 35.** A nuvem no alto da tela mostra sempre o estado real da sincronização, em um destes seis estados:
Sincronizado, Sincronizando, Alterações a enviar, Erro na sincronização, Sem internet e Sincronização desligada.

§ 1º Cada estado tem forma própria, e o nome para o leitor de tela diz o estado por extenso.

§ 2º Tocar na nuvem abre a janela com o estado, a conta, a última sincronização e a ação certa para o momento.

**Art. 36.** Todo aplicativo oferece cópia de segurança em arquivo, para baixar e restaurar, em *Ajustes →
Sincronização e armazenamento*.


### Dos dados em servidor e da privacidade

**Art. 39.** Prazos de guarda no Firebase:

I – avaliações e relatos de problema: 2 anos.

**Parágrafo único.** No plano gratuito o Firebase não aceita exclusão automática; a limpeza dos vencidos é manual, uma
vez por mês, com o passo a passo da pasta `comum/`.

**Art. 40.** *Ajustes → Privacidade e segurança* diz, em linguagem simples, onde ficam os dados do aplicativo.


### Da segurança

**Art. 49.** *Sobre o aplicativo* mostra o endereço oficial e o final da chave Pix do apoio, para quem usa reconhecer
cópias falsas.


### DA AVALIAÇÃO E DO FEEDBACK

**Art. 52.** O balão abre a escolha entre duas opções:

I – **Avaliar o app**: nota de 1 a 5 estrelas, obrigatória, com tipo de comentário, comentário e contato opcionais;

II – **Relatar um problema**: descrição obrigatória, com categoria, gravidade, contato e informações técnicas.

**Art. 53.** O aplicativo e a versão vão sempre, sem a pessoa digitar. As informações técnicas só vão se a pessoa
deixar marcado. Não se aceitam anexos.

**Art. 54.** As mensagens vão para o Firestore do projeto (Anexo IV). Sem internet, ficam numa fila no aparelho e são
reenviadas depois. A tela nunca diz "enviado" sem a confirmação do servidor.


### Da família visual

**Art. 55.** Todos os aplicativos usam o mesmo sistema de design do Kit: fonte Atkinson Hyperlegible, tamanhos de
texto, espaços, cantos, cores de estado e ícones comuns (Anexo II).

**Art. 56.** Dentro do sistema de design do Kit, cada aplicativo cria a sua personalidade visual:

I – a cor de destaque, a cor de começar (Art. 66) e os neutros tingidos por elas (Anexo I);

II – a marca (ícone e nome);

III – as guias próprias dos Ajustes;

IV – opcionalmente, o tema de fábrica e uma fonte de caráter só nos títulos, na marca e nos números grandes;

V – a ideia visual do aplicativo (no Conta Fácil, a comanda de papel), que pode ter fonte e cores próprias dentro
desse elemento, mantidos o contraste AA e o modo escuro no resto da tela;

VI – a composição de cada tela: o que aparece primeiro, como os dados se agrupam e o desenho dos seus cartões, usando
as peças do Kit e cumprindo os Arts. 64 a 71.

§ 1º Os três temas (Automático, Claro e Escuro) continuam disponíveis em todos os aplicativos.

§ 2º Telas com a mesma função em aplicativos diferentes não precisam ter a mesma aparência; precisam se comportar do
mesmo jeito.

**Art. 57.** A mesma ideia tem o mesmo ícone em todos os aplicativos: controles deslizantes para Ajustes, presente para
o apoio, nuvem para a sincronização e balão para a avaliação.

**Parágrafo único.** Os ícones são desenhados num traço só: grade de 24, traço de 2 e pontas redondas (Anexo II).


### Da moldura

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


### Dos Ajustes

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


### Das telas principais

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

**Art. 64-D.** Cada aplicativo pede só o que precisa, no primeiro momento em que o trabalho depende do dado, para
funcionar ou para cumprir a lei. Dado que só serve a uma tela adiante é pedido nela.

§ 1º Os dados de que o aplicativo precisa para funcionar desde o primeiro uso podem ser pedidos na abertura (Art. 75),
sempre com "Pular"; quem pula recebe o pedido de novo quando o dado se torna indispensável (no Elétrica Fácil, os dados
do eletricista e o valor da hora, que voltam a ser pedidos no primeiro orçamento).

§ 2º O dado que a lei exige num documento é pedido ao criar o documento, sem "Pular" (no Elétrica Fácil, o nome, o
telefone e o endereço do cliente, porque o orçamento aprovado obriga as duas partes, CDC, art. 40, § 2º).

§ 3º As Regras de cada aplicativo dizem quais dados são pedidos na abertura e quais ao criar cada documento.


### Dos componentes

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

§ 1º Vermelho é só para excluir, e todo botão que exclui, remove ou apaga é vermelho e cheio, inclusive o da
confirmação; botão só com ícone tem o ícone vermelho. Os demais botões são contornados.

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
mesmo relógio e na mesma curva de quando nasceu, e o fundo clareia junto. Com o teclado aberto, o pé da janela se
recolhe: nenhum botão sobe para cima do teclado. O comportamento é um só para todas as janelas, as do Kit e as do
aplicativo.

§ 4º Momentos de marca (no Conta Fácil, a abertura e a festa de fechamento) podem ser telas cheias, com o foco preso,
Esc e o leitor de tela tratados.

§ 5º Nenhuma caixa de texto é selecionada sozinha, em janela ou fora dela, no celular e no computador: quem seleciona é
o toque da pessoa. Ao abrir, o foco vai para a janela (ou para um botão marcado). O aplicativo só devolve o foco ao
campo em que ela já estava digitando. Campo que falta preencher é apontado (contorno e `aria-invalid`), sem receber o
foco.

§ 6º No celular e no tablet, a janela tem uma barrinha no alto e pode ser puxada para baixo pelo cabeçalho: acompanha o
dedo e fecha, ou volta ao lugar. Fora da barrinha, o dedo não move a janela; só rola o conteúdo que for maior que ela.
O X e o Esc continuam (Art. 16, X).

**Art. 69.** Nenhum aplicativo mostra a lista de escolha, o calendário nem o relógio do sistema: usa os do Kit, iguais
em todo aparelho.

**Parágrafo único.** A exceção, campo a campo, exige justificativa no README.

**Art. 70.** Seções que abrem e fecham usam a seção do Kit, sem botão "Próximo": a pessoa toca na seção que quer. Abre
uma linha por vez, e o título tocado fica sempre à vista, sem a tela saltar.

**Art. 71.** Cadastro de item que pertence a uma categoria segue a ordem 1. Categoria, 2. Item; linhas que abrem
alguma coisa têm a seta à direita.


### Do movimento

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


### Da web e da responsividade

**Art. 73.** Todo aplicativo é um aplicativo web completo, que funciona do celular ao computador nas telas de
referência do Anexo VII, sem rolagem lateral.

**Art. 74.** Todo aplicativo é instalável e abre sem internet depois da primeira visita.


### Da abertura

**Art. 75.** Na primeira vez que o aplicativo abre, aparece a abertura, uma vez só: até quatro telas que apresentam o
aplicativo, seguidas, se as Regras do aplicativo pedirem, das telas de cadastro dos dados de que ele precisa para
funcionar (Art. 64-D, § 1º), com "Pular" em todas, menos na última. Depois dela, a tela inicial explica, nas listas vazias, como começar (Art. 64, III).

§ 1º Quem diz o nome na abertura já recebe ali a primeira recompensa, se o aplicativo tiver recompensas.

§ 2º A abertura não volta sozinha; dá para revê-la nos Ajustes, na guia própria do aplicativo.

**Art. 76.** Não há janela a cada abertura do aplicativo. Ajuste que não é dado indispensável começa com um valor
padrão e se muda nos Ajustes.


### Do guia

**Art. 77.** Todo aplicativo tem um guia só, do começo ao fim, na ordem de uso: cada função aparece no ponto em que a
pessoa a usaria (no Conta Fácil, serviço, couvert e desconto vêm antes de fechar a comanda).

**Art. 78.** No guia:

I – cada passo executa a função de verdade, numa demonstração que não grava nada, e mostra só o que precisa;

II – o ritmo é calmo, com um dedo que se move até o alvo e toca;

III – todo passo tem ação, inclusive a troca de tela, feita tocando na barra, como a pessoa faria;

IV – passos seguidos que acontecem na mesma janela não a fecham e reabrem: a janela fica aberta de um passo para o
outro.

**Art. 79.** O texto do guia fica numa janela fixa, num espaço só dela, acima da barra de baixo, que não cobre o
conteúdo nem muda de lugar. O destaque aponta só a parte da tela de que o passo fala (campo, botão, cabeçalho ou um
bloco), acompanha a rolagem sem atraso e fica acima das janelas abertas pelo guia.

**Art. 80.** Função nova entra no guia na mesma versão.


### DA CONDUTA DO CLAUDE

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

**Art. 90.** **Trabalho no computador do Bruno.** Sempre que possível, o Claude faz ele mesmo as alterações necessárias
(consoles, sites, repositórios e Projetos): pelo acesso remoto ao computador do Bruno (Madruguinha), quando estiver
online, ou pelo Claude in Chrome, no navegador do Bruno. Só pede ao Bruno o que nenhum dos dois permitir.

§ 1º Depois do "sim" do Bruno (Art. 87), o Claude só para quando realmente não for possível avançar.

§ 2º Quando precisar de login, verificação ou outra ação do Bruno, deixa a página aberta e pronta e diz exatamente o
que fazer nela.

§ 3º Senhas, códigos de verificação, CAPTCHAs, pagamentos e aceites de termos ficam sempre com o Bruno.


### DISPOSIÇÕES FINAIS E TRANSITÓRIAS

**Art. 93.** O Conta Fácil é a referência do Projeto Fácil (decisão do Bruno, de 14/11/2026) para a moldura, os
componentes e o comportamento dos controles: o que foi decidido nele sobre esses pontos é regra. O fluxo, os campos
pedidos e o desenho das telas do Conta Fácil são dele, feitos para a comanda de bar. Na dúvida, pergunta-se se a decisão
do Conta Fácil serve ao público do aplicativo; se não serve, o aplicativo decide pelo seu público (Arts. 64-A e 64-C).

§ 1º (Revogado no Código 0.9: o Kit já traz as peças do Conta Fácil.)

§ 2º A revisão dos outros aplicativos é feita um por vez. Até a vez de cada um, pode ainda haver nele o que este
Código trocou: dados lado a lado, o guia em dois ou três níveis, a janela a cada abertura, o presente colorido, a
navegação antiga, uma só cor de botão, durações diferentes de 600 ms, caixas de texto selecionadas sozinhas, botões
próprios de excluir que não são vermelhos e janelas com "Pronto" ou "Fechar" no pé. Na vez de cada aplicativo, ele passa a seguir a moldura,
os componentes e o comportamento dos controles do Conta Fácil, com telas e fluxo redesenhados para o seu público, e
sobe para 1.0.0 (Art. 22, § 2º).
