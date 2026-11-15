# Kit Fácil (pasta `comum/`)

Código e regras comuns aos apps do Projeto Fácil. **Esta pasta é igual no Conta Fácil, no Elétrica Fácil, no
Estudo Fácil e no Guitarra Fácil.** Não altere só num repositório: siga o Art. 30 do [CODIGO.md](CODIGO.md) e rode `npm run verificar`.

| Arquivo | Para quê |
|---|---|
| `kit-facil.js` | área superior (Ajustes, nuvem, balão), tela de Ajustes em guias, avaliação e relato de problema, Sobre, tema, instalar, cópia de segurança, apagar dados do aparelho e o motor de sincronização |
| `kit-facil.css` | sistema de design comum: tokens, moldura (barra, navegação, trilho) e componentes. Usa as variáveis `--kf-*` de cada app |
| `kit-jogo.js` | peça opcional (Kit 0.7.0): objetos em 3D que giram com o dedo (o presente do apoio e as tampinhas), confetes, vibração e níveis. O Kit busca sozinho para o presente; quem usa tampinhas carrega logo depois do `kit-facil.js` |
| `CODIGO.md` | o Código do Projeto Fácil, em artigos |
| `ANEXOS.md` | os anexos técnicos do Código (interface, dados, avaliação, movimento, abertura e guia, comandos e segurança) |
| `regras-firestore-feedback.txt` | regras inteiras do Firestore: avaliações e comanda ao vivo (colar no console do Firebase) |
| `servidor.mjs` | servidor local (`npm start`) |
| `verificar.mjs` | verificação do padrão (`npm run verificar`) |
| `testar.mjs` | roda os testes do kit e do app (`npm test`) |
| `testar-regras.mjs` | testa as regras do Firestore no projeto de verdade, sem deixar nada gravado (`npm run testar-regras`) |
| `MANIFESTO.json` | impressão digital dos arquivos acima, para saber se as cópias são iguais |
| `testes/` | testes do kit, a página de teste e o ambiente comum (GitHub e Firestore simulados, conferências do padrão) |

## Como o app usa o kit

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400..700&family=Atkinson+Hyperlegible+Next:wght@400..800&display=swap">
<link rel="stylesheet" href="comum/kit-facil.css">

<body class="kf-casca">
<header class="kf-barra"><div class="kf-barra-in">
  <div class="kf-marca"><span class="kf-marca-ic">…ícone…</span><span class="kf-marca-nome">Nome do app</span></div>
  <div id="topo"></div>            <!-- KitFacil.topo.html({ principal: true }): nuvem, presente e balão -->
</div></header>
<aside class="kf-trilho">…marca e kf-trilho-it…</aside>   <!-- computador -->
<main>…</main>
<nav class="kf-nav"><div class="kf-nav-in">…kf-nav-it…</div></nav>   <!-- celular e tablet -->
<script src="comum/kit-facil.js"></script>
```

```js
KitFacil.iniciar({
  app: 'eletrica-facil', nome: 'Elétrica Fácil', versao: VERSAO,
  resumo: 'Orçamentos de elétrica prontos em minutos.',
  icone: 'icons/icon-192.png',
  tela: () => route().name,                    // vai junto da avaliação
  exemploDados: 'os orçamentos e os dados dos clientes',
  privacidade: ['Os orçamentos, a tabela de preços e os dados dos clientes ficam neste aparelho.'],
  abrirAjustes: secao => { /* abre (ou, sem secao e já aberto, fecha) a tela de Ajustes do app */ },
  emAjustes: () => route().name === 'settings', // destaca o item Ajustes da navegação
  copia: { descricao: '…', baixar: () => KitFacil.copia.baixar(dados, esquema), restaurar: arquivo => { … } },
  textos: { notificacoes: '…' },               // opcional: texto da guia Notificações
  novidades: [{ versao: VERSAO, itens: ['O que mudou, escrito para quem usa.'] }], // janela única depois de atualizar
  boasVindas: { novo: () => !temDados(), passos: [['Passo', 'explicação']], exemplo: () => abrirExemplo() }, // primeiro uso
});
KitFacil.tema.iniciar({ chave: 'eletricafacil.pref', cores: { claro: '#EFEEE9', escuro: '#0E0D0A' } }); // padrao: 'escuro' abre no escuro (Kit 2.8)
document.getElementById('topo').outerHTML = KitFacil.topo.html({ principal: true });
// Ajustes é o último item da navegação: KitFacil.nav.ajustes('nav') na barra de baixo e KitFacil.nav.ajustes('trilho') no trilho
```

### Telas, avisos e janelas (Kit 2.3)

```js
// tela principal (menos a inicial): título, linha de apoio, ações e o botão de criar
main.innerHTML = KitFacil.ui.cabecalho({ titulo: 'Tabela de preços', sub: 'Seus valores de serviço e material.',
    acoes: '<button class="btn" data-reajustar>Reajustar</button>', criar: { rotulo: 'Novo item', attrs: 'data-novo' } })
  + (itens.length ? lista : KitFacil.ui.vazio({ titulo: 'Nenhum item ainda', texto: 'Toque em <b>Novo item</b> para cadastrar.' }));
// botão de criar fora do cabeçalho (por exemplo, no topo da lista da tela inicial)
KitFacil.ui.criar({ rotulo: 'Novo orçamento', attrs: 'data-novo' });
// aviso rápido, com ação opcional
KitFacil.avisar('Comanda excluída.', { label: 'Desfazer', run: () => restaurar() });
// janela: o app não tem janela própria
KitFacil.dialogo.abrir({ titulo: 'Novo item', sub: 'Tabela de preços', corpo: '…', pe: '…botões…', classe: 'kf-alto',
  aoMontar: el => { /* liga os campos */ }, aoFechar: () => {} });
```

### Lista de escolha e seções (Kit 2.5)

```js
// toda <select> vira a lista do Kit sozinha (inclusive as que entram depois na página); para ligar na hora:
KitFacil.escolha.ligar(raiz);
// <select id="unid"><option value="" hidden>Escolha a unidade</option><option value="m">Metro</option>…</select>
// o app continua usando sel.value, sel.innerHTML e o evento change
```

```html
<details data-kf-secao="grupo"><summary>Valores <small data-kf-secao-resumo>R$ 450,00</small></summary>…</details>
```

```js
KitFacil.secao.abrir(el); KitFacil.secao.fechar(el); KitFacil.secao.alternar(el); KitFacil.secao.aberta(el);
document.addEventListener('kf-secao', e => guardarEstado(e.target, e.detail.aberta));
KitFacil.movimento; // { ms: 560, curva(t), css: 'cubic-bezier(.45,0,.2,1)', reduzido() }: o mesmo ritmo para movimentos do app
```

Nos testes, `escolher(page, '#unid', 'm')` (de `testes/ambiente.mjs`) escolhe uma opção pela lista do Kit.

### Tela de Ajustes

```js
main.innerHTML = KitFacil.ajustes.html({
  extras: { conta: '<div class="kf-bloco">…</div>' },           // conteúdo do app dentro de uma guia comum
  resumos: { conta: 'Carlos Pereira' },                          // linha de resumo de uma guia comum
  produto: [{ id: 'pix', titulo: 'Pix', icone: '<path …/>', resumo: '…', html: '<div class="kf-bloco">…</div>' }],
});
KitFacil.ajustes.ligar(main);              // depois de cada desenho
KitFacil.ajustes.resumo('pix', 'chave@exemplo.com');   // atualiza o resumo sem redesenhar
KitFacil.ajustes.ir('conta');              // abre os Ajustes já numa guia (de qualquer tela)
```

A guia aberta fica em `history.state.kfAj`; no celular, abrir uma guia empilha uma entrada no histórico
(`kfAjPush: true`), então o Voltar do aparelho volta para a lista. Se o app troca de tela estando numa guia, tire
essa entrada antes (`history.go(-2)` em vez de `-1`), como fazem os três apps.

| Recurso | Uso |
|---|---|
| Área superior | `KitFacil.topo.html({ ajustes })`, `KitFacil.topo.atualizar()`, `KitFacil.topo.estado()` |
| Janela da nuvem | `data-kf="nuvem"` ou `KitFacil.nuvem.abrir()` |
| Avaliar / relatar problema | `data-kf="feedback"` (escolha), `data-kf="avaliar"`, `data-kf="problema"` ou `KitFacil.feedback.abrir({ tipo })` |
| Sobre o aplicativo | `data-kf="sobre"` ou `KitFacil.sobre.abrir()` |
| Tema | `KitFacil.tema.seletorHTML()` (já está na guia Aparência) |
| Instalar | `KitFacil.instalarHTML()` (já está em Preferências gerais) |
| Cópia de segurança | `KitFacil.copia.baixar(dados, esquema)`, `await KitFacil.copia.ler(arquivo, { antigos: true })` |
| Apagar dados do aparelho | `KitFacil.armazenamento.apagar()` (já está em Privacidade e segurança) |
| Janela e confirmação | `KitFacil.dialogo.abrir({ titulo, corpo, pe, aoMontar })`, `KitFacil.dialogo.confirmar({ … })` |

### Sincronização

```js
const SY = KitFacil.sync.criar({
  app: 'eletrica-facil', nome: 'Elétrica Fácil', chave: 'eletricafacil.sync',
  dados: 'os orçamentos, preços e ajustes',      // usado nos textos
  carimbar: () => {},                            // marca a hora das mudanças (opcional)
  aplicar: (remoto, { primeira }) => mudou,      // junta o que veio da nuvem; devolve true se mudou algo
  pacote: () => ({ … , st: SY.estado.st, del: SY.estado.del }),  // o que vai para a nuvem
  mesmo: (pacote, remoto) => boolean,            // evita gravar o que já está igual
  redesenhar: () => rerender(),                  // depois de conectar, desconectar ou receber mudanças
  ocupado: () => boolean,                        // adia o redesenho enquanto a pessoa digita
});
SY.agendar(); SY.agora(); SY.ligada(); SY.texto(); SY.resumo();
SY.iniciar({ token: SY.tokenDoLink(), silencioso: true, textoConfirmar: '…' });
```

O estado da nuvem (sincronizado, sincronizando, pendente, erro, offline, desligada) é calculado pelo kit e mostrado na
área superior; o app não precisa desenhar indicador próprio. `SY.estado` guarda `{ token, gistId, login, lastSync,
err, sujo, st, del }` em `<prefixo>sync`; `st` e `del` são as horas de mudança e de exclusão de cada registro, usadas
pelo app em `aplicar`.

### Testes do padrão

`comum/testes/ambiente.mjs` exporta, além do GitHub e do Firestore simulados:

- `conferirTopo(page, { comAjustes })` — confere Ajustes, nuvem e balão: um de cada, ordem, alinhamento, 44 px,
  distância da borda direita e nomes acessíveis;
- `guiasAjustes(page)` e `GUIAS_COMUNS` — os nomes das guias, na ordem.

## Mudanças do kit

- **0.9.0 · 15/11/2026** (Código 0.9, Proposta 4 do Conta Fácil; copiado aos quatro apps): a opção da janela de
  Avaliação e feedback tem nome próprio (`kf-fb-op`) e é uma linha com seta; antes dividia a classe `kf-escolha` com a
  pílula de escolher um valor, que a amassava. Nenhuma janela do Kit tem "Fechar" sozinho no pé. `kf-det` com a seta do
  Kit. Campos do Kit com `--kf-campo-fundo`, `--kf-campo-linha`, `--kf-campo-traco` e `--kf-campo-anel`. No guia único:
  o alvo vem para a parte à vista de quem rola (o conteúdo da janela, uma tela cheia ou a página); o passo com
  `continua: true` acontece na janela que o passo anterior deixou aberta (Art. 78, IV); `m.apontar` aceita uma lista
  de elementos ou um `Range`; a tela cheia com `data-kf-tela-cheia` deixa livre o pé. Saíram 184 regras de CSS
  repetidas, e a verificação passou a acusá-las. Quatro testes novos.
- **0.8.0 · 15/11/2026** (Código 0.8, Proposta 3 do Conta Fácil; copiado aos quatro apps): a cópia da janela que
  fecha mantém as marcas de campo ligado, e a lista de escolha, a data e a hora não ligam nada dentro de `#kf-saidas`
  (fim do pulo ao fechar); `KitFacil.apontar(campo)` aponta o campo que falta preencher (contorno e `aria-invalid`), sem
  dar o foco, e a avaliação passou a usá-lo; barrinha no alto da janela abaixo de 1024 px e puxar pelo cabeçalho fecha
  ou volta (classe `kf-puxando` enquanto puxa); fora da barrinha o dedo só rola o conteúdo maior que a janela; cursor
  invisível (`kf-sem-cursor`) enquanto a janela do campo está a caminho; com o teclado aberto o pé da janela se
  recolhe; botão que exclui é cheio e vermelho nos três temas (`--kf-perigo-fundo`, `kf-perigo-sec` também cheio), e a
  confirmação cujo rótulo começa com Excluir, Remover ou Apagar fica vermelha sozinha.

- **0.5.0 · 11/11/2026** (Código 0.4; copiado aos quatro apps): o aviso rápido não some enquanto tem o foco ou o
  ponteiro em cima, e a contagem recomeça ao sair; varredura de acessibilidade com axe-core
  (`comum/testes/acessibilidade.test.mjs`, precisa de `npm install`); tela de 320 px nos testes do topo; variável
  opcional `--kf-aba-linha` documentada no Anexo II.

- **0.4.0 · 11/11/2026** (Código 0.3, propostas do Laboratório do Conta Fácil; copiado aos quatro apps): janela acima
  do teclado no celular e no tablet; janela que muda de lugar desliza em 240 ms; aviso rápido acima do pé da janela
  aberta; subtítulo da janela abaixo do título, com `contexto` opcional acima; seções descontam o cabeçalho fixo do
  app (`scroll-margin-top`); peças novas `KitFacil.ui.adicionar`, `KitFacil.ui.fato`, `KitFacil.destacar`,
  `KitFacil.carrossel` e `KitFacil.arrastar`; classes `kf-so-leitor` e `kf-li-*` (escala das linhas de lista).
  Elétrica Fácil e Estudo Fácil saem do Kit 0.1.0 e recebem também o 0.2.0 e o 0.3.0, que só mexem no guia.

- **0.3.0 · 09/11/2026** (feita no Conta Fácil; copiar para os outros três apps pelo Art. 30): guia em vídeo, ligado com
  `guia: { modo: 'video', passos, foto, restaurar }`. Um guia só; cada etapa tem só o título (`t`) e a ação (`acao`);
  ponteiro sem destaque; avanço automático; player com voltar, pausar, avançar e fechar. `foto()` e `restaurar(foto)`
  deixam voltar e avançar livremente. Sem `modo: 'video'`, o guia continua como antes.

- **0.2.0 · 08/11/2026** (feita no Conta Fácil; copiar para os outros três apps pelo Art. 30):
  guia ao vivo com o dedo na ponta direita do campo de texto, sem cobrir o que é digitado; o cartão do guia protege a
  área inteira do passo (ou a janela aberta) e encolhe para o título enquanto o app faz o passo; com o trilho, as
  janelas se centram na área do app, à direita dele.


## Kit 0.7.0: as peças do Conta Fácil (Código 0.7, Art. 93)

O Conta Fácil é a referência do Projeto Fácil; estas peças saíram dele e servem a todos os apps. Os apps ainda em `0.x`
continuam com a navegação, o guia em níveis e a apresentação do Kit 0.6.0 até a vez de cada um (Art. 93, § 2º).

```html
<nav class="kf-nav" aria-label="Seções" id="tabs"></nav>      <!-- KitFacil.nav.barra(...) -->
<aside class="kf-trilho">…marca…<nav id="trilho"></nav></aside>  <!-- KitFacil.nav.trilho(...) -->
<script src="comum/kit-facil.js"></script>
<script src="comum/kit-jogo.js"></script>   <!-- só se o app usar tampinhas e níveis -->
```

```js
// um relógio só (Art. 72, § 1º): 600 ms na curva do Kit; no CSS, var(--kf-ms) e var(--kf-curva)
KitFacil.movimento.ms;                                       // 600
KitFacil.movimento.redesenhar(raiz, () => { /* redesenha */ });  // [data-kf-exp] cresce/encolhe; [data-kf-morf] muda de altura

// janelas: um mecanismo só (nascer, teclado, altura, troca e saída pelo pé); nenhuma abre com campo selecionado
KitFacil.dialogo.abrir({ titulo, sub, corpo, pe, aoMontar, aoFechar });
KitFacil.dialogo.confirmar({ titulo: 'Apagar nota?', texto: 'A nota sai deste aparelho.', desfaz: 'Não dá para desfazer.', ok: 'Apagar nota', perigo: true, aoConfirmar });
KitFacil.janela.ocupada(ms);       // o app anima a altura de um trecho da janela: o Kit não desliza a janela por cima

// barra de baixo (ação principal no centro, Mais por último) e trilho (Mais e Ajustes no pé); botões com data-kf-ir="<id>"
nav.innerHTML = KitFacil.nav.barra({ itens: [{ id, rotulo, icone, atual }, …], centro: { id, rotulo, nome, icone, atual, selo }, mais: { atual } });
trilho.innerHTML = KitFacil.nav.trilho({ destaque: { … }, itens: [ … ], mais: { atual } });
tela.innerHTML = KitFacil.nav.mais({ linhas: [{ id, titulo, texto, icone }] });   // a tela Mais, com os Ajustes por último

// campos (Art. 65, XII e XIII)
KitFacil.campo.dinheiro.html({ id, valor });   // <input data-kf-dinheiro>: dígitos entram como centavos
KitFacil.campo.porcento.html({ id, valor });   // <input data-kf-pct>
KitFacil.ui.quantidade({ id, valor, min, max });   // − e +; avisa o app com o evento input
KitFacil.ui.chave({ attrs, on, rotulo });  KitFacil.ui.escolha({ rotulo, on, attrs });
KitFacil.sugestoes(campo, () => [{ label, right, dim }], escolhido => {});   // abaixo da linha, se o pai for .kf-linha
KitFacil.campo.ligar();  KitFacil.campo.preparar(raiz);   // opcional: tocar no fundo recolhe o teclado, Enter confirma

// Pix (do apoio e de cobrança)
KitFacil.pix.codigo({ chave: KitFacil.pix.chave(k), nome, cidade, valor });   // valor em centavos
KitFacil.pix.janela({ titulo, sub, codigo, aoFechar });

// abertura de quatro telas, uma vez só (Art. 75) e guia único numa demonstração (Arts. 77 a 79)
KitFacil.abertura.abrir({ telas: [{ arte, titulo, texto, extra }], fim, extra: { rotulo, mostrar }, aoFechar: ({ como, el }) => {} });
KitFacil.guia.demonstrar({ passos: [{ t, d, acao: async m => { await m.tocar('#botao'); } }], comecar, terminar, foto, restaurar, limpar, maos });

// peça opcional (comum/kit-jogo.js)
KitFacil.jogo.girar(el);  KitFacil.jogo.tampaHTML({ id, nome, cores, icone });  KitFacil.jogo.nivel(xp, NIVEIS);  KitFacil.jogo.confete(caixa);
```

Variáveis novas que o app pode ligar: `--kf-comecar` e `--kf-comecar-ink` (botão de começar, Art. 66, II), `--kf-nav-bg`,
`--kf-nav-ink`, `--kf-nav-on`, `--kf-nav-atual` e `--kf-nav-atual-bg` (navegação), `--kf-presente` e `--kf-presente-fita`
(o presente do apoio) e `--kf-chave-off`. Nos testes, `comum/testes/ambiente.mjs` traz a medição de movimento quadro a
quadro (`filmarJanela`, `teclado`, `animacoes`, `assentar`, `semCampoEmFoco`).
