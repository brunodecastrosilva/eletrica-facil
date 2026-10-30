# Kit Fácil (pasta `comum/`)

Código e regras comuns aos apps do Projeto Integrador. **Esta pasta é igual no Conta Fácil, no Elétrica Fácil e no
Estudo Fácil.** Não altere só num repositório: siga o item 10 do [PADRAO.md](PADRAO.md) e rode `npm run verificar`.

| Arquivo | Para quê |
|---|---|
| `kit-facil.js` | área superior (Ajustes, nuvem, balão), tela de Ajustes em guias, avaliação e relato de problema, Sobre, tema, instalar, cópia de segurança, apagar dados do aparelho e o motor de sincronização |
| `kit-facil.css` | sistema de design comum: tokens, moldura (barra, navegação, trilho) e componentes. Usa as variáveis `--kf-*` de cada app |
| `PADRAO.md` | o padrão do Projeto Integrador (interface, dados, avaliação, segurança) |
| `regras-firestore-feedback.txt` | regra do Firestore que recebe as avaliações (colar no console do Firebase) |
| `servidor.mjs` | servidor local (`npm start`) |
| `verificar.mjs` | verificação do padrão (`npm run verificar`) |
| `testar.mjs` | roda os testes do kit e do app (`npm test`) |
| `MANIFESTO.json` | impressão digital dos arquivos acima, para saber se as três cópias são iguais |
| `testes/` | testes do kit, a página de teste e o ambiente comum (GitHub e Firestore simulados, conferências do padrão) |

## Como o app usa o kit

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400..700&family=Atkinson+Hyperlegible+Next:wght@400..800&display=swap">
<link rel="stylesheet" href="comum/kit-facil.css">

<body class="kf-casca">
<header class="kf-barra"><div class="kf-barra-in">
  <div class="kf-marca"><span class="kf-marca-ic">…ícone…</span><span class="kf-marca-nome">Nome do app</span></div>
  <div id="topo"></div>            <!-- KitFacil.topo.html({ principal: true }): chopp, nuvem e balão -->
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
KitFacil.tema.iniciar({ chave: 'eletricafacil.pref', cores: { claro: '#EFEEE9', escuro: '#0E0D0A' } });
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
