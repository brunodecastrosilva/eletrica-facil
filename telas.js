/* Elétrica Fácil 5 · telas: Início, Documentos, o documento (orçamento ou relatório), Preços e Mais.
   Ideias trazidas de apps premiados em design, e como entram aqui:
   - a informação que importa fica na frente e o resto sai do caminho (Flighty): o Início abre com o que há para receber;
   - mostrar só o passo atual (Crouton): no documento, o botão do pé é sempre o próximo passo, e só ele;
   - tema e paleta coesos, dados claros (Tide Guide): fundo neutro e o amarelo só no destaque, números grandes numa fonte só;
   - uso simples e intuitivo, começo fácil (Moonlitt): somar um serviço é um toque num bloco;
   - nada só pela cor, letra e contraste que aguentam (Guitar Wiz): toda etapa tem nome escrito, não só cor. */
'use strict';

/* ================= peças comuns ================= */
const barraTopo = () => `<header class="kf-barra barra-app"><div class="kf-barra-in"><div class="kf-marca">${MARCA}</div>${KitFacil.topo.html({ principal: true })}</div></header>`;
const barraInterna = (titulo, sub = '') => `<header class="kf-barra barra-app"><div class="kf-barra-in"><button type="button" class="bt-ic" data-voltar aria-label="Voltar">${IC.voltar}</button><div class="barra-tt"><h1 class="barra-nome">${esc(titulo)}</h1>${sub ? `<span class="barra-sub">${esc(sub)}</span>` : ''}</div>${KitFacil.topo.html({ principal: false })}</div></header>`;
const lin = (dado, icone, rotulo, valor, vazio = false) => `<button type="button" class="lin" ${dado}><span class="lin-ic">${icone}</span><span class="lin-tx"><small>${esc(rotulo)}</small><b${vazio ? ' class="fraco"' : ''}>${esc(valor)}</b></span>${IC.seta}</button>`;
const trilhaMini = d => { const E = ETAPAS[d.tipo], i = E.indexOf(d.etapa); return `<span class="tm" aria-hidden="true">${E.map((e, k) => `<i${d.etapa !== 'recusado' && k <= i ? ' class="on"' : ''}></i>`).join('')}</span>`; };
function cartaoDoc(d) {
  const c = conta(d), px = proximo(d), resumo = d.titulo || d.linhas.slice(0, 2).map(l => l.nome).join(' · ') || 'Sem serviços ainda';
  return `<button type="button" class="doc" data-abrir="${esc(d.id)}">
    <span class="doc-topo"><span class="doc-tipo t-${d.tipo}">${TIPO[d.tipo].nome} ${esc(numTxt(d))}</span><span class="doc-etapa e-${d.etapa}">${NOME_ETAPA[d.etapa]}</span></span>
    <b class="doc-nome">${esc(d.cliente.nome || 'Sem cliente ainda')}</b>
    <span class="doc-sub">${esc(resumo)}</span>
    <span class="doc-pe">${trilhaMini(d)}<b class="doc-total num">${BRL(c.total)}</b></span>
    <span class="doc-prox"><span>${paraReceber(d) && c.pago ? `Falta ${BRL(c.falta)}` : 'Próximo passo'}</span><b>${esc(px.rotulo)}</b>${IC.seta}</span>
  </button>`;
}
const listaDocs = L => `<div class="docs">${L.map(cartaoDoc).join('')}</div>`;
const abrirDoc = (el, e) => { const b = e.target.closest('[data-abrir]'); if (b) { ir('/d/' + b.dataset.abrir); return true; } return false; };

/* ================= novo documento: orçamento (antes do serviço) ou relatório (para cobrar o que já foi feito) ================= */
function janelaNovo() {
  const op = (tipo, icone, titulo, texto) => `<button type="button" class="opcao" data-novo-tipo="${tipo}"><span class="op-ic">${icone}</span><span class="op-tx"><b>${titulo}</b><small>${texto}</small></span>${IC.seta}</button>`;
  janela({ titulo: 'Novo documento', sub: 'O que você vai fazer?',
    corpo: `<div class="opcoes">${op('orc', IC.docs, 'Orçamento', 'Antes do serviço: o cliente aprova e você executa.')}${op('rel', IC.recibo, 'Relatório', 'Depois do serviço: para cobrar o que já foi feito.')}</div>`,
    aoMontar: j => j.addEventListener('click', e => { const b = e.target.closest('[data-novo-tipo]'); if (b) { fecharJanela(true); novoDocumento(b.dataset.novoTipo); } }) });
}

/* ================= Início: o que há para receber e os documentos em andamento ================= */
TELAS.inicio = {
  html() {
    const P = painel(), L = docs.filter(d => !docVazio(d));
    const abertos = L.filter(d => d.etapa !== 'recebido' && d.etapa !== 'recusado').sort((a, b) => b.mudou - a.mudou);
    const nome = primeiroNome(ajustes.nome);
    const linha = (r, v) => `<div><dt>${r}</dt><dd class="num">${v}</dd></div>`;
    return `${barraTopo()}
    <main class="tela inicio" id="conteudo">
      ${KitFacil.ui.cabecalho({ titulo: 'Início', sub: nome ? `Olá, ${esc(nome)}. Veja o que falta enviar e receber.` : 'O que falta enviar, aprovar e receber.' })}
      <section class="painel" aria-label="Resumo">
        <span class="pn-raio" aria-hidden="true">${IC.raio}</span>
        <span class="pn-rot">Para receber</span>
        <b class="pn-num num">${BRL(P.receber)}</b>
        <span class="pn-sub">${P.nReceber ? `de ${plural(P.nReceber, 'documento', 'documentos')}` : 'Nada para receber agora.'}</span>
        <dl class="pn-lista">
          ${linha('Esperando resposta', P.nEsperando ? `${P.nEsperando} · ${BRL(P.esperando)}` : 'Nenhum')}
          ${linha('Aprovados, para fazer', P.aprovados || 'Nenhum')}
          ${linha('Recebido neste mês', BRL(P.recebidoMes))}
        </dl>
      </section>
      <section aria-labelledby="in-and">
        <h2 class="sec" id="in-and">Em andamento${abertos.length ? ` <span class="sec-n">· ${abertos.length}</span>` : ''}</h2>
        ${abertos.length ? listaDocs(abertos) : KitFacil.ui.vazio({ titulo: L.length ? 'Tudo em dia' : 'Nenhum documento ainda', icone: IC.raio,
          texto: L.length ? 'Nenhum documento esperando por você. Os recebidos ficam em Documentos.' : 'Toque no + da barra de baixo para fazer o primeiro orçamento. Leva um minuto.',
          acao: L.length ? '' : '<button type="button" class="kf-btn kf-sec" data-exemplo>Abrir um exemplo</button>' })}
      </section>
    </main>`;
  },
  ligar(el) {
    el.addEventListener('click', e => {
      if (abrirDoc(el, e)) return;
      if (e.target.closest('[data-exemplo]')) return criarExemplo();
    });
  },
};

/* ================= Documentos: todos, com busca e filtro ================= */
let filtroDocs = 'todos', buscaDocs = '';
function docsFiltrados() {
  const q = dobra(buscaDocs);
  return docs.filter(d => !docVazio(d) && (filtroDocs === 'todos' || d.tipo === filtroDocs) && (!q || dobra([d.cliente.nome, d.titulo, numTxt(d), ...d.linhas.map(l => l.nome)].join(' ')).includes(q))).sort((a, b) => b.mudou - a.mudou);
}
const docsCorpo = () => { const L = docsFiltrados(); return L.length ? listaDocs(L) : KitFacil.ui.vazio({ titulo: 'Nada por aqui', texto: buscaDocs ? 'Nenhum documento com esse nome. Confira a busca.' : 'Os documentos deste tipo aparecem aqui.', icone: IC.busca }); };
TELAS.docs = {
  html() {
    const tem = docs.some(d => !docVazio(d));
    return `${barraTopo()}
    <main class="tela" id="conteudo">
      ${KitFacil.ui.cabecalho({ titulo: 'Documentos', sub: 'Todos os orçamentos e relatórios, do rascunho ao recibo.' })}
      ${tem ? `<div class="busca"><span class="busca-ic">${IC.busca}</span><input id="dc-q" class="kf-entrada" type="search" value="${esc(buscaDocs)}" placeholder="Buscar por cliente ou serviço" aria-label="Buscar documento"></div>
        ${segmento('Filtrar documentos', 'filtro', [['todos', 'Todos'], ['orc', 'Orçamentos'], ['rel', 'Relatórios']], filtroDocs)}
        <div id="dc-lista" aria-live="polite">${docsCorpo()}</div>`
      : KitFacil.ui.vazio({ titulo: 'Nenhum documento ainda', texto: 'Os orçamentos e os relatórios que você fizer ficam guardados aqui. Para começar, toque no + da barra de baixo.', icone: IC.docs })}
    </main>`;
  },
  ligar(el) {
    el.addEventListener('click', e => {
      if (abrirDoc(el, e)) return;
      const f = e.target.closest('[data-filtro]'); if (f) { filtroDocs = f.dataset.filtro; redesenhar(); }
    });
    $('#dc-q', el)?.addEventListener('input', e => { buscaDocs = e.target.value; const cx = $('#dc-lista', el); cx.innerHTML = docsCorpo(); });
  },
};

/* ================= o documento ================= */
// depois de mexer em linhas, desconto ou pagamentos, a etapa acompanha o que falta receber
function acertaEtapa(d) {
  const c = conta(d), cobra = d.tipo === 'orc' ? 'aprovado' : 'enviado';
  if (d.etapa === 'recebido' && c.total > 0 && (c.falta > 0 || !c.pago)) d.etapa = cobra;
  else if (d.etapa === cobra && c.total > 0 && c.falta === 0 && c.pago > 0) d.etapa = 'recebido';
}
const mudouDoc = d => { acertaEtapa(d); tocarDoc(d); };
// o eletricista vê o tempo e a condição em cada linha; o cliente, não (linhasCliente, em motor.js)
const subLinha = l => l.tipo === 'diag' ? `${tempoTxt(l.min)} × ${BRL(l.pu)} a hora` : l.tipo === 'desl' ? `${l.q} ${unTxt(l.q, 'ida')} × ${BRL(l.pu)}${l.km ? ` · ${l.km} km` : ''}` : `${l.q} ${unTxt(l.q, l.un)} × ${BRL(l.pu)}${l.cond ? ` · ${NOME_COND[l.cond].toLowerCase()}` : ''}${l.comp ? ` · ${l.comp}` : ''}`;
// Com cômodos, as linhas aparecem agrupadas: cada cômodo com o seu subtotal, depois Geral e Material.
function itensDoc(d, c) {
  if (!d.linhas.length) return '';
  const minimo = c.minimo ? `<div class="item minimo"><span class="it-q" aria-hidden="true">${IC.raio}</span><span class="it-tx"><b>Atendimento mínimo</b><small>Completa ${BRL(d.minIda)} por ida</small></span><b class="it-v num">${BRL(c.minimo)}</b></div>` : '';
  if (!d.comodos.length) return `<div class="cx itens">${d.linhas.map(itemDoc).join('')}${minimo}</div>`;
  return gruposDoc(d).map(g => { const L = d.linhas.filter(l => grupoDe(d, l) === g), m = g === 'Geral' ? minimo : '', ehCom = d.comodos.includes(g); if (!L.length && !m && !ehCom) return '';
    const nome = ehCom ? `<button type="button" class="sec-g-bt" data-cmd="${esc(g)}" aria-label="${esc(g)}: renomear ou apagar"><span>${esc(g)}</span>${IC.lapis}</button>` : `<span>${esc(g)}</span>`;
    return `<h3 class="sec-g">${nome}<b class="num">${BRL(soma(L.map(totalLinha)) + (m ? c.minimo : 0))}</b></h3>${L.length || m ? `<div class="cx itens">${L.map(itemDoc).join('')}${m}</div>` : `<p class="kf-ajuda">Nenhum serviço neste cômodo.</p>`}`; }).join('');
}
const itemDoc = l => `<button type="button" class="item" data-linha="${esc(l.id)}"><span class="it-q num" aria-hidden="true">${l.tipo === 'diag' ? tempoTxt(l.min) : l.q}</span><span class="it-tx"><b>${esc(l.nome)}</b><small>${esc(subLinha(l))}</small></span><b class="it-v num">${BRL(totalLinha(l))}</b></button>`;
// serviços da tabela que seguem a hora: são os que podem ter o tempo real anotado
const anotaveis = d => d.linhas.filter(l => !l.tipo && l.pid).map(l => precos.find(p => p.id === l.pid)).filter((p, i, a) => p && !p.fixo && a.indexOf(p) === i);
const mediaReal = p => p.reais.length ? Math.max(5, Math.round(soma(p.reais) / p.reais.length / 5) * 5) : 0;
const seletorTempo = (id, atual, max, passo) => { const L = new Set([atual]); for (let m = passo; m <= max; m += passo) L.add(m); return `<select id="${id}" class="kf-entrada">${[...L].sort((a, b) => a - b).map(m => `<option value="${m}"${m === atual ? ' selected' : ''}>${tempoTxt(m)}</option>`).join('')}</select>`; };
/* ---------- a tela do documento (5.2): o painel fica no alto, e cada cômodo é um cartão que se desliza ---------- */
let vistaLista = false;                 // "Ver em lista": todos os cômodos de uma vez (vale até fechar o app)
const rolCar = new Map(), subAnt = new Map();   // onde o carrossel estava e os subtotais da última vez, por documento
let animEnvio = '';                     // o documento que acabou de sair: o disjuntor arma ao lado do total
const reduzMov = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// o código do cartão, como o circuito no quadro: C1, C2…; G para Geral e M para Material
const codCom = (d, g) => d.comodos.includes(g) ? 'C' + (d.comodos.indexOf(g) + 1) : g === 'Geral' ? 'G' : g === 'Material' ? 'M' : '';
const noCom = g => `n${artigo(g)} ${g}`;
const condLinha = (d, c) => { const rel = d.tipo === 'rel';
  return [pagCurto(d), rel ? (d.feito ? `feito em ${dataCurta(d.feito)}` : 'falta o dia do serviço') : `válido até ${dataCurta(validoAte(d))}`,
    rel ? '' : d.inicio && d.dias ? `início ${dataCurta(d.inicio)}, ${plural(d.dias, 'dia', 'dias')}` : 'falta o prazo',
    `garantia de ${garCurta(d)}`, c.desc ? `desconto de ${BRL(c.desc)}` : ''].filter(Boolean).join(' · '); };
const DISJUNTOR = '<svg class="dj" viewBox="0 0 34 48" aria-hidden="true" focusable="false"><rect class="dj-cx" x="2" y="2" width="30" height="44" rx="5"/><rect class="dj-al" x="11" y="23" width="12" height="18" rx="3"/></svg>';
function painelDoc(d, c, px) {
  const E = ETAPAS[d.tipo], i = E.indexOf(d.etapa), falta = c.pago && c.falta, enviado = d.etapa !== 'rascunho';
  const partes = [['mao', 'Mão de obra', c.mao], ['desl', 'Deslocamento', c.desl], ['mat', 'Material', c.mat]];
  const leg = partes.filter(([k, , v]) => k !== 'desl' || v).map(([k, n, v]) => `<div class="m-${k}"><dt>${n}</dt><dd class="num">${k === 'mat' && !v ? 'não incluído' : BRL(v)}</dd></div>`).join('');
  const extra = [c.desc ? `${esc(descTxt(d))}: − ${BRL(c.desc)}` : '', d.pag === 'entrada' && !c.pago ? `Entrada de ${d.entradaPct}%: ${BRL(c.entrada)} · na conclusão: ${BRL(c.resto)}` : '', c.pago ? `Já recebido: ${BRL(c.pago)}` : ''].filter(Boolean);
  const trilha = !enviado ? '' : d.etapa === 'recusado' ? `<p class="tr-recusa">${IC.recusa}<b>Recusado pelo cliente</b></p>`
    : `<ol class="tr-passos pnl-trilha" aria-label="Etapas do documento">${E.map((e, k) => `<li class="${k < i ? 'feito' : k === i ? 'atual' : ''}"${k === i ? ' aria-current="step"' : ''}><span>${NOME_ETAPA[e]}</span></li>`).join('')}</ol>`;
  return `<section class="pnl" id="pnl" aria-label="Resumo d${artigo(TIPO[d.tipo].nome)} ${TIPO[d.tipo].nome.toLowerCase()}">
    <button type="button" class="pnl-cli" data-j="cliente">${IC.pessoa}<span>${clienteOk(d.cliente) ? `<b>${esc(d.cliente.nome)}</b> · ${esc(d.cliente.end)}` : '<b class="fraco">Nome, telefone e endereço do serviço</b>'}</span>${IC.seta}</button>
    ${trilha}
    <div class="pnl-tot">${enviado && d.etapa !== 'recusado' ? DISJUNTOR : ''}<div class="pnl-t"><small>${falta ? 'Falta receber' : 'Total'}</small><b class="num" id="pnl-total">${BRL(falta ? c.falta : c.total)}</b></div>
      ${d.comodos.length ? `<button type="button" class="pnl-vista" data-vista>${IC.lista}<span>${vistaLista ? 'Ver em cartões' : 'Ver em lista'}</span></button>` : ''}</div>
    ${c.sub ? `<div class="pnl-med" aria-hidden="true">${partes.filter(x => x[2] > 0).map(([k, , v]) => `<span class="m-${k}" data-v="${v}"></span>`).join('')}</div>` : ''}
    <dl class="pnl-leg">${leg}</dl>
    ${extra.length ? `<p class="pnl-extra num">${extra.join(' · ')}</p>` : ''}
    <button type="button" class="pnl-cond" data-cond aria-label="Condições: ${esc(condLinha(d, c))}"><span>${esc(condLinha(d, c))}</span>${IC.seta}</button>
    <p class="${enviado ? 'tr-frase' : 'kf-so-leitor'}" role="status">${esc(px.frase)}</p>
  </section>`;
}
const minimoDoc = (d, c) => c.minimo ? `<div class="item minimo"><span class="it-q" aria-hidden="true">${IC.raio}</span><span class="it-tx"><b>Atendimento mínimo</b><small>Completa ${BRL(d.minIda)} por ida</small></span><b class="it-v num">${BRL(c.minimo)}</b></div>` : '';
function cartaoGrupo(d, c, g) {
  const L = d.linhas.filter(l => grupoDe(d, l) === g), ehCom = d.comodos.includes(g), m = g === 'Geral' ? minimoDoc(d, c) : '';
  const nMat = ehCom ? soma(d.mats.filter(x => x.com === g).map(x => x.q)) : 0;
  const nome = ehCom ? `<button type="button" class="sec-g-bt" data-cmd="${esc(g)}" aria-label="${esc(g)}: renomear ou apagar"><span>${esc(g)}</span>${IC.lapis}</button>` : `<span>${esc(g)}</span>`;
  const somar = ehCom ? `<button type="button" class="cr-somar" data-somar-com="${esc(g)}">${IC.soma}<span>Somar ${esc(noCom(g))}</span></button>`
    : g === 'Geral' ? `<button type="button" class="cr-somar" data-somar-com="">${IC.soma}<span>Diagnóstico e idas</span></button>` : '';
  const vazio = ehCom ? 'Nenhum serviço neste cômodo.' : g === 'Geral' ? 'Diagnóstico, deslocamento e o que não é de um cômodo.' : '';
  return `<article class="cr" data-g="${esc(g)}"><h3 class="sec-g" data-cod="${codCom(d, g)}">${nome}<b class="num cr-sub">${BRL(soma(L.map(totalLinha)) + (m ? c.minimo : 0))}</b></h3>
    ${L.length || m ? `<div class="cx itens">${L.map(itemDoc).join('')}${m}</div>` : `<p class="kf-ajuda cr-vazio">${vazio}</p>`}
    ${nMat ? `<button type="button" class="cr-mat" data-mats-com>${IC.caixa}<span>${plural(nMat, 'peça contada', 'peças contadas')}</span>${IC.seta}</button>` : ''}
    ${somar}</article>`;
}
function servicosDoc(d, c) {
  const rel = d.tipo === 'rel', n = d.linhas.length, cab = `<span class="sec-n">· ${n}</span>`;
  if (!d.comodos.length) return `<section aria-labelledby="dc-it"><article class="cr cr-un"><h2 class="sec" id="dc-it">${rel ? 'O que foi feito' : 'Serviços'}${n ? ' ' + cab : ''}</h2>
      ${itensDoc(d, c) || `<p class="kf-ajuda cr-vazio">Some os serviços da sua tabela. Cada toque no + soma um.</p>`}
      ${proximo(d).id === 'somar' ? '' : `<button type="button" class="cr-somar" data-somar>${IC.soma}<span>Somar serviço</span></button>`}</article>
      <button type="button" class="kf-btn kf-link cr-separar" data-levantar>Separar por cômodo</button></section>`;
  if (vistaLista) return `<section aria-labelledby="dc-it"><h2 class="sec" id="dc-it">Todos os cômodos${n ? ' ' + cab : ''}</h2>
      ${itensDoc(d, c)}${KitFacil.ui.adicionar({ rotulo: 'Somar serviço', attrs: 'data-somar' })}${KitFacil.ui.adicionar({ rotulo: 'Cômodo', attrs: 'data-levantar' })}</section>`;
  const G = gruposDoc(d).filter(g => g !== 'Material' || d.linhas.some(l => grupoDe(d, l) === g));
  return `<section class="crs" aria-labelledby="dc-it"><div class="crs-cab"><h2 class="sec" id="dc-it">Cômodos <span class="sec-n">· ${d.comodos.length} e Geral</span></h2><span class="crs-dica" aria-hidden="true">deslize</span></div>
    <div class="crs-fila" id="dc-car">${G.map(g => cartaoGrupo(d, c, g)).join('')}<button type="button" class="cr-novo" data-levantar>${IC.soma}<span>Cômodo</span></button></div>
    <div class="crs-pontos" aria-hidden="true">${G.concat('+').map((g, k) => `<i${k ? '' : ' class="on"'}></i>`).join('')}</div></section>`;
}
TELAS.doc = {
  html(r) {
    const d = getDoc(r.id), c = conta(d), px = proximo(d), rel = d.tipo === 'rel';
    return `${barraInterna(TIPO[d.tipo].nome, numTxt(d))}
    <main class="tela doc-tela" id="conteudo">
      ${painelDoc(d, c, px)}
      ${servicosDoc(d, c)}
      ${d.mats.length ? `<div class="cx">${lin('data-j="mats"', IC.caixa, 'Lista de materiais · só para você', `${plural(listaMats(d).length, 'item', 'itens')} · ${plural(soma(d.mats.map(m => m.q)), 'peça', 'peças')}`)}</div>` : ''}
      ${anotaveis(d).length && (rel || ['aprovado', 'recebido'].includes(d.etapa)) ? `<section aria-labelledby="dc-tr"><h2 class="sec" id="dc-tr">Depois do serviço</h2><div class="cx">${lin('data-j="tempo"', IC.relogio, 'Tempo real', d.tempoOk ? 'Anotado' : 'Anotar quanto tempo levou', !d.tempoOk)}</div></section>` : ''}
      ${d.pagos.length ? `<section aria-labelledby="dc-pg"><h2 class="sec" id="dc-pg">Recebimentos</h2><div class="cx">${d.pagos.map(p => `<div class="pago"><span class="lin-ic">${IC.certo}</span><span class="lin-tx"><small>${dataBR(p.em)} · ${esc(p.meio)}</small><b class="num">${BRL(p.v)}</b></span><button type="button" class="kf-btn kf-sec kf-p" data-recibo="${esc(p.id)}">Recibo</button></div>`).join('')}</div></section>` : ''}
    </main>
    <div class="pe-tela" id="pe-doc">
      <div class="pe-in">
        <button type="button" class="bt-ic contorno" data-menu aria-label="Mais opções">${IC.mais}</button>
        <button type="button" class="kf-btn kf-pri pe-prox" data-prox="${px.id}">${esc(px.rotulo)}</button>
      </div>
    </div>`;
  },
  ligar(el, r) {
    const d = getDoc(r.id);
    el.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('[data-voltar]')) return voltar('/');
      let b;
      if ((b = t.closest('[data-somar-com]'))) return janelaSomar(d, b.dataset.somarCom);
      if (t.closest('[data-somar]')) return janelaSomar(d);
      if (t.closest('[data-levantar]')) return janelaComodo(d, nome => janelaSomar(d, nome));
      if (t.closest('[data-vista]')) { vistaLista = !vistaLista; return redesenhar(); }
      if (t.closest('[data-cond]')) return janelaCondicoes(d);
      if (t.closest('[data-mats-com]')) return janelaMats(d);
      if ((b = t.closest('[data-cmd]'))) return janelaCmd(d, b.dataset.cmd);
      if ((b = t.closest('[data-linha]'))) return janelaLinha(d, d.linhas.find(l => l.id === b.dataset.linha));
      if ((b = t.closest('[data-j]'))) return b.dataset.j === 'cliente' ? janelaCliente(d) : b.dataset.j === 'tempo' ? janelaTempo(d) : b.dataset.j === 'mats' ? janelaMats(d) : janelaCond(d, b.dataset.j);
      if ((b = t.closest('[data-recibo]'))) return janelaRecibo(d, b.dataset.recibo);
      if (t.closest('[data-menu]')) return janelaMenu(d);
      if ((b = t.closest('[data-prox]'))) return avancar(d, b.dataset.prox);
    });
    $$('.pnl-med span', el).forEach(s => { s.style.flexGrow = s.dataset.v; });
    // o carrossel volta para onde estava, e os pontinhos acompanham o cartão à vista
    const fila = $('#dc-car', el), pts = $$('.crs-pontos i', el);
    const marca = () => { const w = fila.firstElementChild ? fila.firstElementChild.offsetWidth + 12 : 1, k = Math.min(pts.length - 1, Math.round(fila.scrollLeft / w)); pts.forEach((p, n) => p.classList.toggle('on', n === k)); };
    if (fila) { fila.scrollLeft = rolCar.get(d.id) || 0; marca(); fila.addEventListener('scroll', () => { rolCar.set(d.id, fila.scrollLeft); marca(); }, { passive: true }); }
    // animação 1: o disjuntor arma quando o documento sai (900 ms); com movimento reduzido, nada se mexe
    if (animEnvio === d.id) {
      animEnvio = ''; const pn = $('#pnl', el);
      if (pn && !reduzMov()) { pn.classList.add('arma'); setTimeout(() => { try { navigator.vibrate && navigator.vibrate(12); } catch (_) { /* sem vibração */ } }, 420); setTimeout(() => pn.classList.remove('arma'), 950); }
    }
    // animação 2: a faísca corre pelo cartão em que o valor subiu (480 ms)
    const agora = {}; $$('.cr[data-g]', el).forEach(a => { agora[a.dataset.g] = $('.cr-sub', a).textContent; });
    const antes = subAnt.get(d.id); subAnt.set(d.id, agora);
    if (antes && fila) {
      const subiu = Object.keys(agora).find(g => valorTxt(agora[g]) > valorTxt(antes[g] || '0'));
      const a = subiu !== undefined && $(`.cr[data-g="${CSS.escape(subiu)}"]`, el);
      if (a) {
        const x = a.offsetLeft - fila.offsetLeft - 16;
        if (x < fila.scrollLeft || x + a.offsetWidth > fila.scrollLeft + fila.clientWidth) { fila.scrollTo({ left: Math.max(0, x), behavior: reduzMov() ? 'auto' : 'smooth' }); }
        if (!reduzMov()) { a.classList.add('faisca'); setTimeout(() => a.classList.remove('faisca'), 520); }
      }
    }
  },
};
// o texto "R$ 1.234,56" em centavos, para comparar subtotais
const valorTxt = s => +String(s).replace(/\D/g, '') || 0;
// as condições numa janela: cada linha abre a sua
function janelaCondicoes(d) {
  const c = conta(d), rel = d.tipo === 'rel', obs = d.obs.trim().split('\n')[0];
  janela({ titulo: 'Condições', contexto: nomeDoc(d),
    corpo: `<div class="cx">
      ${lin('data-j="titulo"', IC.lapis, rel ? 'Serviço executado' : 'Serviço', d.titulo || 'Nome do serviço (ex.: reforma da cozinha)', !d.titulo)}
      ${lin('data-j="pag"', IC.dinheiro, 'Pagamento', pagCurto(d))}
      ${rel ? lin('data-j="feito"', IC.dia, 'Serviço feito em', d.feito ? dataBR(d.feito) : 'Escolha o dia', !d.feito) : lin('data-j="validade"', IC.relogio, 'Validade', `${plural(d.validade, 'dia', 'dias')} · até ${dataCurta(validoAte(d))}`)}
      ${rel ? '' : lin('data-j="prazo"', IC.dia, 'Prazo do serviço', d.inicio && d.dias ? `${dataCurta(d.inicio)} a ${dataCurta(fimPrevisto(d))} · ${plural(d.dias, 'dia', 'dias')}` : 'Início e quantos dias leva', !(d.inicio && d.dias))}
      ${lin('data-j="garantia"', IC.escudo, 'Garantia', garCurta(d))}
      ${lin('data-j="desc"', IC.desconto, 'Desconto', c.desc ? `${d.descPct ? d.descPct + '% · ' : ''}${BRL(c.desc)}` : 'Sem desconto', !c.desc)}
      ${lin('data-j="obs"', IC.nota, 'Observações', obs || 'Nenhuma', !obs)}
    </div>`,
    aoMontar: j => j.addEventListener('click', e => { const b = e.target.closest('[data-j]'); if (!b) return; fecharJanela(true); janelaCond(d, b.dataset.j); }) });
}
// o botão do pé: o próximo passo do documento
function avancar(d, passo) {
  if (passo === 'somar') return janelaSomar(d);
  if (passo === 'enviar') {
    // a lei pede o cliente identificado e, no orçamento, as datas de início e término (CDC, art. 40)
    if (!clienteOk(d.cliente)) { aviso('Antes de enviar, complete o nome, o telefone e o endereço do cliente.'); return janelaCliente(d); }
    if (d.tipo === 'orc' && !(d.inicio && d.dias)) { aviso('Antes de enviar, escolha o início e quantos dias o serviço leva.'); return janelaCond(d, 'prazo'); }
    // os seus dados saem no documento: quem pulou e chegou aqui sem eles recebe o pedido agora
    if (!d.exemplo && !dadosOk()) { aviso('Antes de enviar, complete o seu nome e o seu WhatsApp.'); return janelaDados(() => avancar(d, 'enviar')); }
    return janelaEnviar(d);
  }
  if (passo === 'receber') return janelaReceber(d);
  if (passo === 'recibo') return janelaRecibo(d);
  if (passo === 'pdf') return gerarPDF(null, () => montarPDF(d), nomeArquivo(TIPO[d.tipo].arquivo, d));
  const antes = d.etapa, quando = d.aprovadoEm;
  if (passo === 'aprovou') { d.etapa = 'aprovado'; d.aprovadoEm = Date.now(); }
  else if (passo === 'concluir') d.etapa = 'recebido';
  else if (passo === 'reabrir') d.etapa = 'rascunho';
  tocarDoc(d); redesenhar(); vibrar();
  aviso(passo === 'aprovou' ? 'Orçamento aprovado.' : passo === 'concluir' ? 'Documento concluído.' : 'Documento reaberto.', { label: 'Desfazer', run: () => { d.etapa = antes; d.aprovadoEm = quando; tocarDoc(d); redesenhar(); } });
}
function marcarEnviado(d) {
  if (d.etapa !== 'rascunho') return;
  d.etapa = 'enviado'; d.enviadoEm = Date.now(); animEnvio = d.id; tocarDoc(d); redesenhar();
  aviso('Marcado como enviado.', { label: 'Desfazer', run: () => { d.etapa = 'rascunho'; d.enviadoEm = null; tocarDoc(d); redesenhar(); } });
}

/* ---------- janelas do documento ---------- */
// Os dados do cliente: nome, telefone e endereço do serviço são pedidos ao criar o documento, sem Pular (Código,
// Art. 64-D, § 2º): o orçamento é um documento com valor de contrato, e sem cliente identificado ele não serve à lei.
const camposCliente = c => `${campo('cl-nome', 'Nome do cliente', entrada('cl-nome', c.nome, 'autocapitalize="words" placeholder="Ex.: Mariana Souza"'))}
      ${campo('cl-fone', 'Telefone (WhatsApp)', entrada('cl-fone', c.fone ? fone(c.fone) : '', 'inputmode="tel" placeholder="(11) 90000-0000"'))}
      ${campo('cl-end', 'Endereço do serviço', entrada('cl-end', c.end, 'placeholder="Rua, número, bairro e cidade"'))}
      ${campo('cl-doc', 'CPF ou CNPJ', entrada('cl-doc', c.doc ? cpfCnpj(c.doc) : '', 'inputmode="numeric" placeholder="Sai no recibo"'))}`;
function lerCliente(j) {
  const c = { nome: $('#cl-nome', j).value.trim(), fone: $('#cl-fone', j).value.trim(), end: $('#cl-end', j).value.trim(), doc: $('#cl-doc', j).value.trim() };
  const falta = [[c.nome.length < 2, '#cl-nome', 'o nome'], [c.fone.replace(/\D/g, '').length < 10, '#cl-fone', 'o telefone com DDD'], [c.end.length < 3, '#cl-end', 'o endereço do serviço']].filter(x => x[0]);
  falta.forEach(x => KitFacil.apontar($(x[1], j)));
  if (falta.length) { aviso(`Falta ${falta.map(x => x[2]).join(', ').replace(/, ([^,]*)$/, ' e $1')}.`); return null; }
  return c;
}
function janelaNovoCliente(tipo, depois) {
  janela({ titulo: tipo === 'rel' ? 'Para quem é o relatório?' : 'Para quem é o orçamento?', sub: 'Nome, telefone e endereço do serviço saem no documento.',
    corpo: camposCliente({}), pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Começar</button>',
    aoMontar: j => { $('[data-salvar]', j).onclick = () => { const c = lerCliente(j); if (!c) return; fecharJanela(true); depois(c); }; } });
}
function janelaCliente(d) {
  janela({ titulo: 'Cliente', sub: 'Nome, telefone e endereço do serviço saem no documento.',
    corpo: camposCliente(d.cliente),
    pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoMontar: j => { $('[data-salvar]', j).onclick = () => { const c = lerCliente(j); if (!c) return; d.cliente = c; tocarDoc(d); fecharJanela(); redesenhar(); }; } });
}
const VAL_OP = [[10, '10 dias'], [15, '15 dias'], [30, '30 dias'], [60, '60 dias']], PRAZO_OP = [[1, '1 dia'], [2, '2 dias'], [3, '3 dias'], [5, '5 dias'], [10, '10 dias']];
const blocoGarantia = (sel, attr) => `<p class="kf-ajuda">${esc(GAR_LEI)}</p><div class="kf-campo"><span class="kf-rotulo">Garantia a mais, por sua conta</span><div class="escolhas">${GAR_AD.map(([k, l]) => KitFacil.ui.escolha({ rotulo: l, on: sel === k, attrs: `${attr}="${k}"` })).join('')}</div></div>`;
function janelaCond(d, qual) {
  const rel = d.tipo === 'rel';
  const corpo = () => {
    const c = conta(d);
    if (qual === 'titulo') return campo('cd-t', rel ? 'Qual serviço foi feito?' : 'Qual é o serviço?', entrada('cd-t', d.titulo, 'placeholder="Ex.: Reforma elétrica da cozinha"'), 'Aparece no alto do documento e na lista.');
    if (qual === 'pag') return `<div class="kf-campo"><span class="kf-rotulo" id="cd-pl">Como o cliente paga</span>${segmento('Como o cliente paga', 'pag', rel ? [['vista', 'À vista'], ['combinar', 'A combinar']] : [['vista', 'À vista'], ['entrada', 'Entrada'], ['combinar', 'A combinar']], d.pag)}</div>
      ${d.pag === 'entrada' ? `<div class="kf-campo"><span class="kf-rotulo">Quanto de entrada</span>${segmento('Quanto de entrada', 'ep', [30, 40, 50, 60, 70].map(n => [n, n + '%']), d.entradaPct)}</div>` : ''}
      <p class="kf-ajuda" role="status">${esc(pagTxt(d, c))}</p>`;
    if (qual === 'validade') return `<div class="kf-campo"><span class="kf-rotulo">O orçamento vale por</span>${segmento('Validade', 'val', VAL_OP, d.validade)}</div><p class="kf-ajuda" role="status">Vale até ${dataBR(validoAte(d))}.</p>`;
    if (qual === 'prazo') { const outro = d.dias && !PRAZO_OP.some(o => o[0] === d.dias);
      return `${campo('cd-i', 'Início previsto', `<input id="cd-i" class="kf-entrada" type="date" value="${d.inicio ? dataISO(d.inicio) : ''}" min="${dataISO()}">`)}
      <div class="kf-campo"><span class="kf-rotulo">Quantos dias de serviço</span>${segmento('Quantos dias de serviço', 'pz', [...PRAZO_OP, ['x', 'Outro']], outro ? 'x' : d.dias)}</div>
      ${outro || d.diasOutro ? campo('cd-pzn', 'Número de dias', `<input id="cd-pzn" class="kf-entrada" type="text" inputmode="numeric" maxlength="3" value="${d.dias || ''}" placeholder="Ex.: 20">`) : ''}
      <p class="kf-ajuda" role="status">${d.inicio && d.dias ? esc(prazoTxt(d)) : 'O orçamento só é enviado com o início e o prazo: a lei pede as datas de início e término (CDC, art. 40).'}</p>`; }
    if (qual === 'garantia') return blocoGarantia(d.garAd, 'data-gar');
    if (qual === 'feito') return campo('cd-f', 'Dia em que o serviço foi feito', `<input id="cd-f" class="kf-entrada" type="date" value="${dataISO(d.feito || Date.now())}" max="${dataISO()}">`);
    if (qual === 'desc') return `${campo('cd-dn', 'Nome que aparece no documento', entrada('cd-dn', d.descNome, 'placeholder="Ex.: Desconto de família"'))}
      <div class="kf-campo"><span class="kf-rotulo">Quanto</span>${segmento('Quanto de desconto', 'dp', [[0, 'Sem'], [10, '10%'], [25, '25%'], [50, '50%'], [100, '100%']], d.descPct)}</div>
      ${campo('cd-dp', 'Outra porcentagem', `<input id="cd-dp" class="kf-entrada" type="text" inputmode="numeric" maxlength="3" value="${d.descPct || ''}" placeholder="De 1 a 100">`)}
      <dl class="resumo"><div><dt>Valor do serviço</dt><dd class="num">${BRL(c.sub)}</dd></div>${c.desc ? `<div><dt>${esc(descTxt(d))}</dt><dd class="num">− ${BRL(c.desc)}</dd></div>` : ''}<div class="forte"><dt>Total</dt><dd class="num">${BRL(c.total)}</dd></div></dl>
      <p class="kf-ajuda" role="status">${d.descPct === 100 ? 'Com 100%, o documento sai como cortesia e não pede pagamento.' : c.mat ? 'O desconto não incide sobre o material.' : 'O cliente vê o valor cheio e a linha do desconto.'}</p>`;
    return campo('cd-o', 'Observações', `<textarea id="cd-o" class="kf-entrada" rows="5" placeholder="Ex.: Material por conta do cliente.">${esc(d.obs)}</textarea>`, 'Saem no fim do documento.');
  };
  const T = { titulo: rel ? 'Serviço executado' : 'Serviço', pag: 'Pagamento', validade: 'Validade', prazo: 'Prazo do serviço', garantia: 'Garantia', feito: 'Dia do serviço', desc: 'Desconto', obs: 'Observações' };
  const comSalvar = ['titulo', 'desc', 'obs'].includes(qual);
  janela({ titulo: T[qual], corpo: `<div id="cd-corpo" class="pilha">${corpo()}</div>`, pe: comSalvar ? '<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>' : '',
    aoFechar: () => redesenhar(),
    aoMontar: j => {
      const refaz = () => { const cx = $('#cd-corpo', j); cx.innerHTML = corpo(); prepararCampos(cx); };
      j.addEventListener('click', e => {
        const t = e.target; let b;
        if ((b = t.closest('[data-pag]'))) d.pag = b.dataset.pag;
        else if ((b = t.closest('[data-ep]'))) d.entradaPct = +b.dataset.ep;
        else if ((b = t.closest('[data-val]'))) d.validade = +b.dataset.val;
        else if ((b = t.closest('[data-gar]'))) d.garAd = +b.dataset.gar;
        else if ((b = t.closest('[data-pz]'))) { if (b.dataset.pz === 'x') { d.diasOutro = true; d.dias = 0; } else { delete d.diasOutro; d.dias = +b.dataset.pz; } }
        else if ((b = t.closest('[data-dp]'))) { d.descNome = $('#cd-dn', j).value.trim(); d.descPct = +b.dataset.dp; d.desc = 0; }
        else if (t.closest('[data-salvar]')) {
          if (qual === 'titulo') d.titulo = $('#cd-t', j).value.trim();
          else if (qual === 'obs') d.obs = $('#cd-o', j).value.trim();
          else { const v = $('#cd-dp', j).value.trim(), n = v ? parseInt(v, 10) : 0; if (v && !(n >= 0 && n <= 100)) { KitFacil.apontar($('#cd-dp', j)); return aviso('A porcentagem vai de 0 a 100.'); } d.descNome = $('#cd-dn', j).value.trim(); d.descPct = n || 0; d.desc = 0; }
          mudouDoc(d); return fecharJanela();
        } else return;
        mudouDoc(d); refaz();
      });
      j.addEventListener('change', e => { if (e.target.id === 'cd-f') { const v = deISO(e.target.value); if (v) { d.feito = v; tocarDoc(d); } } if (e.target.id === 'cd-i') { const v = deISO(e.target.value); if (v) { d.inicio = v; tocarDoc(d); refaz(); } } });
      j.addEventListener('input', e => { if (e.target.id === 'cd-pzn') { d.dias = Math.max(0, Math.min(365, parseInt(e.target.value, 10) || 0)); tocarDoc(d); const st = $('[role="status"]', j); if (st) st.textContent = d.inicio && d.dias ? prazoTxt(d) : 'Escolha o início e quantos dias leva.'; } });
    } });
}
function janelaLinha(d, l, tipoNovo = '', com = '', depois = null) {
  const nova = !l, tipo = l ? l.tipo : tipoNovo;
  const x = l || (tipo === 'diag' ? { nome: 'Diagnóstico do defeito', min: 60, pu: HORA() } : tipo === 'desl' ? { nome: 'Deslocamento', q: 1, pu: ajustes.deslIda, km: 0, vkm: ajustes.deslKm } : { nome: '', un: 'un', q: 1, pu: 0, cond: 0, motivo: '' });
  const porKm = tipo === 'desl' && (l ? l.km > 0 : ajustes.deslModo === 'km');
  let cond = x.cond || 0;
  const fraseCond = () => { const b = lerDinheiro($('#ln-p')); return cond ? `${NOME_COND[cond]} soma ${condPct(cond)}%: ${BRL(Math.round(b * (100 + condPct(cond)) / 100))} cada.` : `Difícil soma ${ajustes.cond1}%. Muito difícil soma ${ajustes.cond2}%. Você define em Ajustes.`; };
  const segCond = () => segmento('Condição do serviço', 'cond', NOME_COND.map((n, k) => [k, n]), cond);
  const qtd = rot => `<div class="kf-campo"><span class="kf-rotulo" id="ln-ql">${rot}</span>${KitFacil.ui.quantidade({ id: 'ln-q', valor: x.q, min: 1, max: tipo === 'desl' ? 99 : 9999, rotulo: rot.toLowerCase(), attrs: 'aria-labelledby="ln-ql"' })}</div>`;
  const corpo = tipo === 'diag' ? `${campo('ln-n', 'Descrição', entrada('ln-n', x.nome))}
      ${campo('ln-t', 'Tempo que levou', seletorTempo('ln-t', x.min, 600, 15), `${BRL(x.pu)} a hora. O cliente vê o tempo e o valor, não a sua hora.`)}`
    : tipo === 'desl' ? `${qtd('Idas ao local')}
      ${porKm ? campo('ln-k', 'Distância, ida e volta, em km', `<input id="ln-k" class="kf-entrada" type="text" inputmode="numeric" maxlength="4" value="${x.km || ''}" placeholder="Ex.: 16">`) + campo('ln-vk', 'Valor por km', campoDinheiro('ln-vk', x.vkm || ajustes.deslKm)) : campo('ln-p', 'Valor por ida', campoDinheiro('ln-p', x.pu))}`
    : `${campo('ln-n', 'Descrição', entrada('ln-n', x.nome, 'placeholder="Ex.: Instalação de tomada"'))}
      ${qtd('Quantidade')}
      ${campo('ln-u', 'Unidade', `<select id="ln-u" class="kf-entrada">${UNIDADES.filter(u => u[0] !== 'ida').map(([k, n]) => `<option value="${k}"${k === x.un ? ' selected' : ''}>${n}</option>`).join('')}</select>`)}
      ${campo('ln-p', 'Preço de cada', campoDinheiro('ln-p', x.cond ? x.base : x.pu))}
      ${tipo === 'mat' ? '' : `<div class="kf-campo"><span class="kf-rotulo">Condição do serviço</span><div id="ln-cd">${segCond()}</div><p class="kf-ajuda" id="ln-cs" role="status"></p></div>
      ${d.comodos.length && tipo !== 'mat' ? campo('ln-cm', 'Cômodo', selCom(d, 'ln-cm', l ? l.com : com)) : ''}
      ${campo('ln-m', 'Motivo para o cliente', entrada('ln-m', x.motivo || '', 'placeholder="Ex.: forro baixo"'))}`}`;
  janela({ titulo: tipo === 'diag' ? 'Diagnóstico por tempo' : tipo === 'desl' ? 'Deslocamento' : nova ? 'Linha só neste documento' : 'Linha do documento',
    sub: tipo === 'diag' ? 'Para o defeito que você ainda não conhece: cobre pelo tempo.' : tipo === 'desl' ? (nova && !(porKm ? ajustes.deslKm : ajustes.deslIda) ? 'Uma linha própria, por ida. O valor fica guardado em Ajustes, Cobrança.' : 'Uma linha própria do documento, por ida.') : nova ? 'Vale só neste documento. Para guardar nos seus Preços, use Novo serviço.' : 'Vale só neste documento. Para mudar sempre, vá em Preços.',
    corpo, pe: `${nova ? '' : '<button type="button" class="kf-btn kf-perigo" data-tirar>Remover</button>'}<button type="button" class="kf-btn kf-pri" data-salvar>${nova ? 'Somar' : 'Salvar'}</button>`,
    aoMontar: j => {
      const cs = $('#ln-cs', j); if (cs) { cs.textContent = fraseCond(); $('#ln-p', j).addEventListener('input', () => { cs.textContent = fraseCond(); }); }
      j.addEventListener('click', e => { const b = e.target.closest('[data-cond]'); if (!b) return; cond = +b.dataset.cond; $('#ln-cd', j).innerHTML = segCond(); cs.textContent = fraseCond(); $(`[data-cond="${cond}"]`, j)?.focus({ preventScroll: true }); });
      $('[data-salvar]', j).onclick = () => {
        const q = Math.max(1, Math.min(9999, parseInt($('#ln-q', j)?.value, 10) || 1));
        let v;
        if (tipo === 'diag') v = { nome: $('#ln-n', j).value.trim() || 'Diagnóstico do defeito', min: +$('#ln-t', j).value || 60, pu: x.pu };
        else if (tipo === 'desl') {
          if (porKm) { const km = Math.max(0, parseInt($('#ln-k', j).value, 10) || 0), vkm = lerDinheiro($('#ln-vk', j)); if (!km) { KitFacil.apontar($('#ln-k', j)); return aviso('Escreva a distância, ida e volta.'); } if (!vkm) { KitFacil.apontar($('#ln-vk', j)); return aviso('Escreva o valor por km.'); } v = { nome: x.nome, q, km, vkm, pu: Math.round(km * vkm) }; if (!ajustes.deslKm) { ajustes.deslKm = vkm; salvarAjustes(); } }
          else { v = { nome: x.nome, q, km: 0, pu: lerDinheiro($('#ln-p', j)) }; if (!v.pu) { KitFacil.apontar($('#ln-p', j)); return aviso('Escreva o valor por ida.'); } if (!ajustes.deslIda) { ajustes.deslIda = v.pu; salvarAjustes(); } }
        } else {
          const nome = $('#ln-n', j).value.trim(), base = lerDinheiro($('#ln-p', j));
          if (!nome) { KitFacil.apontar($('#ln-n', j)); return aviso('Escreva a descrição da linha.'); }
          v = { nome, q, un: $('#ln-u', j).value, pu: tipo === 'mat' ? base : Math.round(base * (100 + condPct(cond)) / 100) };
          if (tipo !== 'mat' && $('#ln-cm', j)) v.com = $('#ln-cm', j).value;
          if (tipo !== 'mat') Object.assign(v, { base, cond, motivo: $('#ln-m', j).value.trim() });
        }
        if (nova) d.linhas.push(acertaLinha({ id: uid(), pid: '', tipo, com, ...v })); else Object.assign(l, acertaLinha({ ...l, ...v }));
        mudouDoc(d); if (depois) { fecharJanela(true); depois(); } else { fecharJanela(); redesenhar(); }
      };
      $('[data-tirar]', j)?.addEventListener('click', () => {
        const i = d.linhas.indexOf(l); d.linhas.splice(i, 1); mudouDoc(d); fecharJanela(); redesenhar();
        aviso('Linha removida.', { label: 'Desfazer', run: () => { d.linhas.splice(i, 0, l); mudouDoc(d); redesenhar(); } });
      });
    } });
}

/* ---------- Somar: a lista de preços em blocos; cada toque soma um. No levantamento, cômodo por cômodo, com materiais ---------- */
// O cômodo novo ganha número quando repete: o "Quarto" que já existia vira "Quarto 1" e o novo, "Quarto 2".
function novoComodo(d, base) {
  base = txt(base).slice(0, 36); if (!base) return '';
  const re = new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?: (\\d+))?$'), iguais = d.comodos.filter(c => re.test(c));
  if (!iguais.length) { d.comodos.push(base); return base; }
  if (d.comodos.includes(base)) {
    const k = d.comodos.indexOf(base), um = base + ' 1'; d.comodos[k] = um;
    d.linhas.forEach(l => { if (l.com === base) l.com = um; }); d.mats.forEach(m => { if (m.com === base) m.com = um; });
  }
  const n = Math.max(1, ...d.comodos.filter(c => re.test(c)).map(c => +(re.exec(c)[1] || 1))) + 1, nome = `${base} ${n}`;
  d.comodos.push(nome); return nome;
}
function janelaComodo(d, depois) {
  janela({ titulo: 'Qual cômodo?', sub: 'Toque para começar por ele. Os outros você soma depois.', contexto: nomeDoc(d),
    corpo: `<div class="cm-grade">${COMODOS.map(n => `<button type="button" class="kf-btn kf-sec" data-cm="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      ${campo('cm-n', 'Outro nome', entrada('cm-n', '', 'placeholder="Ex.: Quarto do casal" maxlength="36"'))}`,
    pe: '<button type="button" class="kf-btn kf-pri" data-cm-outro>Usar este nome</button>',
    aoMontar: j => j.addEventListener('click', e => {
      const b = e.target.closest('[data-cm]'), outro = e.target.closest('[data-cm-outro]'); if (!b && !outro) return;
      const base = b ? b.dataset.cm : $('#cm-n', j).value.trim();
      if (!base) { KitFacil.apontar($('#cm-n', j)); return aviso('Escreva o nome do cômodo.'); }
      const nome = novoComodo(d, base); tocarDoc(d); fecharJanela(true); redesenhar(); depois(nome);
    }) });
}
// Somar serviço. Na primeira vez, antes do primeiro serviço, o app pede o que faltou na abertura: os seus dados, que saem
// na proposta, e a sua hora (Código, Art. 64-D, § 1º). Depois, primeiro os serviços que você já salvou, com busca e filtro
// pela ação; o que não existe nasce em "Novo serviço" (objeto, ação e preço) e fica salvo nos seus Preços. No fim, o que
// se cobra por tempo, por ida e por dia: diagnóstico, deslocamento e diária.
function janelaSomar(d, com0, aba0) {
  if (!d.exemplo && !semSalvar) {
    if (!dadosOk()) return janelaDados(() => janelaSomar(d, com0, aba0), 'Antes do primeiro serviço');
    if (!ajustes.hora) return janelaHora(() => janelaSomar(d, com0, aba0), 'Antes do primeiro serviço');
  }
  let busca = '', acf = '', aba = aba0 === 'mat' ? 'mat' : 'serv', quemC = d.quem;
  let com = d.comodos.includes(com0) ? com0 : d.comodos.length ? d.comodos[d.comodos.length - 1] : '';
  const noCom = l => !d.comodos.length || l.com === com;
  const qtd = p => soma(d.linhas.filter(l => l.pid === p.id && noCom(l)).map(l => l.q));
  const linha = p => { const n = qtd(p); return `<div class="so-lin${n ? ' tem' : ''}"><span class="so-tx"><b>${esc(p.nome)}</b><small>${BRL(precoDe(p))} por ${unNome(p.un)}${p.fixo ? '' : ' · ' + tempoTxt(p.min)}</small></span>
      ${n ? `<button type="button" class="so-bt" data-tira="${esc(p.id)}" aria-label="Tirar um: ${esc(p.nome)}">${IC.menos}</button><b class="so-n num" aria-label="${n} no documento">${n}</b>` : ''}
      <button type="button" class="so-bt mais" data-soma="${esc(p.id)}" aria-label="Somar um: ${esc(p.nome)}">${IC.soma}</button></div>`; };
  const lista = L => `<div class="so-lista">${L.map(linha).join('')}</div>`;
  // os mais usados sobem para o alto de cada categoria
  const ordem = L => [...L].sort((a, b) => (ajustes.usos[b.id] || 0) - (ajustes.usos[a.id] || 0) || a.nome.localeCompare(b.nome, 'pt-BR'));
  const servicos = () => precos.filter(p => p.cat !== CAT_MATERIAL);
  const agrupado = L => catsOrdem().filter(c => c.id !== CAT_MATERIAL).map(c => { const M = ordem(L.filter(p => p.cat === c.id)); return M.length ? `<h3 class="sec so-gr"><span class="bl-ic p" aria-hidden="true">${picDe(c.icone)}</span>${esc(c.nome)}</h3>${lista(M)}` : ''; }).join('');
  const diag = () => d.linhas.find(l => l.tipo === 'diag'), desl = () => d.linhas.find(l => l.tipo === 'desl'), dia = () => d.linhas.find(l => l.pid === 'diaria' && noComG(l));
  const noComG = l => !d.comodos.length || !l.com;
  const vazio = c => !d.linhas.some(l => l.com === c) && !d.mats.some(m => m.com === c);
  // para o cômodo vazio: repetir o último cômodo que já tem alguma coisa
  const fonte = () => com && vazio(com) ? [...d.comodos].reverse().find(c => c !== com && !vazio(c)) : '';
  // o que não se cobra por serviço fica junto: o diagnóstico, pelo tempo; o deslocamento, por ida; a diária, por dia
  const maisMenos = (dado, n, rot, valor, sub) => `<div class="cx"><div class="so-lin${n ? ' tem' : ''}"><span class="so-tx"><b>${rot}</b><small>${sub}</small></span>
        ${n ? `<button type="button" class="so-bt" data-${dado}="-1" aria-label="Tirar uma: ${rot}">${IC.menos}</button><b class="so-n num" aria-label="${n}">${n}</b>` : ''}
        <button type="button" class="so-bt mais" data-${dado}="1" aria-label="Somar uma: ${rot}">${IC.soma}</button></div></div>`;
  const porTempo = () => { const g = diag(), i = desl(), y = dia(); return `<h3 class="sec">Por tempo, por ida e por dia</h3>
      <div class="cx tp"><div class="tp-l"><span class="lin-ic">${IC.relogio}</span><span class="lin-tx"><b>Diagnóstico do defeito</b><small>${g ? `${tempoTxt(g.min)} × ${BRL(g.pu)} a hora` : 'Pelo tempo que levou'}</small></span>${g ? `<b class="num">${BRL(totalLinha(g))}</b>` : ''}</div>
        ${segmento('Tempo do diagnóstico', 'diag', [[30, '30 min'], [60, '1 h'], [90, '1h30'], [120, '2 h'], ['x', 'Outro']], g ? ([30, 60, 90, 120].includes(g.min) ? g.min : 'x') : '')}</div>
      ${maisMenos('ida', i ? i.q : 0, 'Deslocamento', 0, i ? `${i.q} ${unTxt(i.q, 'ida')} · ${BRL(totalLinha(i))}` : ajustes.deslModo === 'km' ? (ajustes.deslKm ? `${BRL(ajustes.deslKm)} por km` : 'Por km, valor a definir') : ajustes.deslIda ? `${BRL(ajustes.deslIda)} por ida` : 'Por ida, valor a definir')}
      ${maisMenos('dia', y ? y.q : 0, 'Diária', 0, y ? `${plural(y.q, 'diária', 'diárias')} · ${BRL(totalLinha(y))}` : ajustes.diaria ? `${BRL(ajustes.diaria)} por dia` : 'Por dia, valor a definir')}`; };
  const conta2 = () => { if (aba === 'mat') { const n = soma(d.mats.map(m => m.q)); return n ? `${plural(n, 'peça contada', 'peças contadas')}. A lista fica no documento.` : 'Conte o material como conta o serviço.'; }
    const c = conta(d), n = soma(d.linhas.map(l => l.q)); return d.linhas.length ? `${plural(n, 'item', 'itens')} no documento · <b class="num">${BRL(c.sub)}</b>` : servicos().length ? 'Toque no + para somar.' : 'Crie o seu primeiro serviço.'; };
  const topo = () => `${d.comodos.length ? `<div class="chips" role="group" aria-label="Cômodo">${d.comodos.map(c => `<button type="button" class="chip" data-com="${esc(c)}" aria-pressed="${c === com}">${esc(c)}</button>`).join('')}<button type="button" class="chip" data-com-novo>+ Cômodo</button></div>` : ''}
    ${segmento('Somar', 'aba', [['serv', 'Serviços'], ['mat', 'Materiais']], aba)}
    ${fonte() ? `<button type="button" class="kf-btn kf-sec" data-repetir>Repetir ${artigo(fonte())} ${esc(fonte())}</button>` : ''}`;
  const matLin = m => `<div class="so-lin tem"><button type="button" class="so-tx mt-nome" data-mt="${esc(m.id)}"><b>${esc(m.nome)}</b><small>${esc([m.comp, m.quem !== d.quem ? (m.quem === 'cli' ? 'o cliente compra' : 'eu levo') : ''].filter(Boolean).join(' · ') || 'Complemento (ex.: 20 A, curva C)')}</small></button>
      <button type="button" class="so-bt" data-mtm="${esc(m.id)}" aria-label="Tirar um: ${esc(m.nome)}">${IC.menos}</button><b class="so-n num" aria-label="${m.q} contados">${m.q}</b>
      <button type="button" class="so-bt mais" data-mtp="${esc(m.id)}" aria-label="Somar um: ${esc(m.nome)}">${IC.soma}</button></div>`;
  // materiais: os que você já tem com preço e os do banco, sem preço (o preço é pedido quando o material vai para o orçamento)
  const materiaisTodos = () => { const meus = precos.filter(p => p.cat === CAT_MATERIAL), tem = new Set(meus.map(p => dobra(p.nome)));
    return [...meus.map(p => ({ k: 'p:' + p.id, nome: p.nome, un: p.un, p })), ...objetosDe(CAT_MATERIAL).filter(o => !tem.has(dobra(o.nome))).map(o => ({ k: 'b:' + o.nome, nome: o.nome, un: o.un }))]; };
  const corpoMat = () => {
    const q = dobra(busca), aqui = d.mats.filter(m => !d.comodos.length || m.com === com);
    const T = materiaisTodos().filter(m => !q || dobra(m.nome).includes(q)).sort((a, b) => (ajustes.usos[b.p ? b.p.id : ''] || 0) - (ajustes.usos[a.p ? a.p.id : ''] || 0));
    return `<div class="kf-campo"><span class="kf-rotulo">Quem compra o que você contar agora</span>${segmento('Quem compra', 'qc', [['eu', 'Eu levo'], ['cli', 'O cliente compra']], quemC)}
        <p class="kf-ajuda">Neste orçamento: ${d.quem === 'cli' ? 'o cliente compra' : 'eu levo'}.${quemC !== d.quem ? ' Aqui é a exceção.' : ''}</p></div>
      ${aqui.length ? `<h3 class="sec">${d.comodos.length ? 'Neste cômodo' : 'Contados'}</h3><div class="so-lista">${aqui.map(matLin).join('')}</div>` : ''}
      <h3 class="sec">${q ? 'Materiais encontrados' : 'Todos os materiais'}</h3>
      ${T.length ? `<div class="so-lista">${T.map(m => `<div class="so-lin"><span class="so-tx"><b>${esc(m.nome)}</b><small>${m.p ? `${BRL(m.p.preco)} por ${unNome(m.un)}` : `${maiuscula(unNome(m.un))} · sem preço ainda`}</small></span><button type="button" class="so-bt mais" data-mts="${esc(m.k)}" aria-label="Contar um: ${esc(m.nome)}">${IC.soma}</button></div>`).join('')}</div>` : `<p class="kf-ajuda">Nenhum material com esse nome.</p>`}
      ${q ? `<button type="button" class="kf-btn kf-sec" data-mnovo>Contar "${esc(busca.trim())}"</button>` : ''}`;
  };
  // sugestões do banco para o que foi buscado: objeto e ação que ainda não estão nos seus Preços
  const sugestoes = q => {
    const P = q.split(/\s+/).filter(Boolean), meus = new Set(servicos().map(p => dobra(p.nome))), S = [];
    BANCO.filter(b => 'c-' + b[0] !== CAT_MATERIAL).forEach(b => objetosDe('c-' + b[0]).forEach(o => {
      [o.acao, ...ACOES.map(a => a[0]).filter(a => a !== o.acao)].forEach((a, k) => { const n = nomeMontado(a, o.nome), dn = dobra(n); if (!meus.has(dn) && P.every(w => dn.includes(w))) S.push({ cat: 'c-' + b[0], acao: a, obj: o.nome, nome: n, k }); });
    }));
    return S.sort((x, y) => x.k - y.k).slice(0, 5);
  };
  const novoBt = rot => KitFacil.ui.adicionar({ rotulo: rot, attrs: 'data-novo-serv' });
  const corpo = () => {
    if (aba === 'mat') return topo() + corpoMat();
    const q = dobra(busca), S = servicos();
    if (q) {
      const P = q.split(/\s+/).filter(Boolean), L = ordem(S.filter(p => { const t = dobra(`${p.nome} ${p.obj}`); return P.every(w => t.includes(w)); })), G = sugestoes(q);
      return `${topo()}${L.length ? `<h3 class="sec">Nos seus preços</h3>${lista(L)}` : ''}
        ${G.length ? `<h3 class="sec">Criar a partir do banco</h3><div class="so-lista">${G.map(g => `<button type="button" class="so-lin so-sug" data-sug="${esc(`${g.cat}|${g.acao}|${g.obj}`)}"><span class="so-tx"><b>${esc(g.nome)}</b><small>Novo · você dá o preço</small></span>${IC.seta}</button>`).join('')}</div>` : ''}
        ${!L.length && !G.length ? '<p class="kf-ajuda">Nada com esse nome nos seus preços nem no banco.</p>' : ''}
        ${novoBt(`Novo serviço: "${busca.trim().slice(0, 40)}"`)}${KitFacil.ui.adicionar({ rotulo: 'Linha só neste documento', attrs: 'data-avulsa' })}`;
    }
    const A = ACOES.filter(a => S.some(p => p.acao === a[0])), L = acf ? S.filter(p => p.acao === acf) : S;
    const N = d.comodos.length ? [...new Set(d.linhas.filter(l => !l.tipo && l.pid && l.pid !== 'diaria').map(l => l.pid))].map(id => precos.find(p => p.id === id)).filter(Boolean) : [];
    return `${topo()}${N.length ? `<h3 class="sec">Neste documento</h3>${lista(N)}` : ''}
      <h3 class="sec">Seus serviços${S.length ? ` <span class="sec-n">· ${S.length}</span>` : ''}</h3>
      ${A.length > 1 ? `<div class="chips" role="group" aria-label="Filtrar pela ação"><button type="button" class="chip" data-acf="" aria-pressed="${!acf}">Todas</button>${A.map(a => `<button type="button" class="chip" data-acf="${a[0]}" aria-pressed="${acf === a[0]}">${a[1]}</button>`).join('')}</div>` : ''}
      ${S.length ? agrupado(L) : '<p class="kf-ajuda">Você ainda não tem serviços salvos. Crie o primeiro: escolha o objeto, a ação e o preço. Ele fica nos seus Preços para os próximos orçamentos.</p>'}
      ${novoBt('Novo serviço')}
      ${porTempo()}
      ${KitFacil.ui.adicionar({ rotulo: 'Linha só neste documento', attrs: 'data-avulsa' })}`;
  };
  const sai = () => { fecharJanela(true); salvarAjustes(); redesenhar(); };
  // serviço novo, criado aqui: fica nos seus Preços e já entra no documento; a janela de somar volta
  const criar = o => { const c0 = com; sai(); janelaItem(null, { ...o, doc: d, aoSalvar: p => { somarItem(d, p, d.comodos.length ? c0 : ''); janelaSomar(d, c0, 'serv'); aviso(`${p.nome}: salvo nos seus Preços e somado.`); }, aoFechar: () => janelaSomar(d, c0, 'serv') }); };
  janela({ titulo: com ? com : 'Somar serviço', contexto: com ? 'Levantamento · ' + nomeDoc(d) : '', alta: true, aoFechar: () => { salvarAjustes(); redesenhar(); },
    corpo: `<div class="busca"><span class="busca-ic">${IC.busca}</span><input id="so-q" class="kf-entrada" type="search" placeholder="Buscar serviço ou material" aria-label="Buscar nos seus preços e no banco"></div>
      <p class="so-conta" id="so-conta" role="status">${conta2()}</p><div id="so-corpo" class="pilha">${corpo()}</div>`,
    aoMontar: j => {
      const refaz = foco => { $('#so-corpo', j).innerHTML = corpo(); $('#so-conta', j).innerHTML = conta2(); const tt = $('.kf-dlg-titulo, h2', j); if (tt && com) tt.textContent = com; if (foco) $(foco, j)?.focus({ preventScroll: true }); };
      $('#so-q', j).addEventListener('input', e => { busca = e.target.value; refaz(); });
      j.addEventListener('click', e => {
        const t = e.target; let b;
        if ((b = t.closest('[data-aba]'))) { aba = b.dataset.aba; return refaz(`[data-aba="${aba}"]`); }
        if ((b = t.closest('[data-com]'))) { com = b.dataset.com; return refaz(`[data-com="${CSS.escape(com)}"]`); }
        if (t.closest('[data-com-novo]')) { const a = aba; sai(); return janelaComodo(d, nome => janelaSomar(d, nome, a)); }
        if (t.closest('[data-repetir]')) {
          const de = fonte(); if (!de) return;
          d.linhas.filter(l => l.com === de && l.tipo !== 'diag' && l.tipo !== 'desl' && !l.lista).forEach(l => d.linhas.push(acertaLinha({ ...clone(l), id: uid(), com })));
          d.mats.filter(m => m.com === de).forEach(m => d.mats.push(acertaMat({ ...clone(m), id: uid(), com, ok: false })));
          mudouDoc(d); vibrar(); aviso(`${com}: igual ${artigo(de)} ${de}.`); return refaz();
        }
        if ((b = t.closest('[data-acf]'))) { acf = b.dataset.acf; return refaz(`[data-acf="${acf}"]`); }
        if ((b = t.closest('[data-qc]'))) { quemC = b.dataset.qc; return refaz(`[data-qc="${quemC}"]`); }
        if ((b = t.closest('[data-mts]'))) {
          const k = b.dataset.mts, M = materiaisTodos().find(x => x.k === k); if (!M) return;
          const pid = M.p ? M.p.id : '', m = d.mats.find(x => (pid ? x.pid === pid : !x.pid && x.nome === M.nome) && !x.comp && x.quem === quemC && (!d.comodos.length || x.com === com));
          if (m) m.q = Math.min(9999, m.q + 1); else d.mats.push(acertaMat({ pid, nome: M.nome, un: M.un, q: 1, pu: M.p ? M.p.preco : 0, quem: quemC, com: d.comodos.length ? com : '' }));
          usar(pid); mudouDoc(d); vibrar(); return refaz(`[data-mts="${CSS.escape(k)}"]`);
        }
        if ((b = t.closest('[data-mtp], [data-mtm]'))) {
          const id = b.dataset.mtp || b.dataset.mtm, m = d.mats.find(x => x.id === id); if (!m) return;
          if (b.dataset.mtp) m.q = Math.min(9999, m.q + 1); else if (m.q > 1) m.q--; else d.mats.splice(d.mats.indexOf(m), 1);
          mudouDoc(d); return refaz(d.mats.includes(m) ? `[data-mtp="${id}"]` : '#so-q');
        }
        if ((b = t.closest('[data-mt]'))) { const m = d.mats.find(x => x.id === b.dataset.mt); if (!m) return; const c0 = com; sai(); return janelaMat(d, m, () => janelaSomar(d, c0, 'mat')); }
        if (t.closest('[data-mnovo]')) { const nome = busca.trim(), c0 = com, q0 = quemC; sai(); return janelaMatNovo(nome, M => { d.mats.push(acertaMat({ pid: M.p ? M.p.id : '', nome: M.nome, un: M.un, q: 1, pu: M.p ? M.p.preco : 0, quem: q0, com: d.comodos.length ? c0 : '' })); if (M.p) usar(M.p.id); mudouDoc(d); janelaSomar(d, c0, 'mat'); }); }
        if (t.closest('[data-novo-serv]')) return criar({ nome: busca.trim() });
        if ((b = t.closest('[data-sug]'))) { const [cat, acao, obj] = b.dataset.sug.split('|'); return criar({ cat, acao, obj }); }
        if (t.closest('[data-avulsa]')) { const c0 = com; sai(); return janelaLinha(d, null, '', d.comodos.length ? c0 : ''); }
        if ((b = t.closest('[data-diag]'))) {
          const v = b.dataset.diag, g = diag();
          if (v === 'x') { sai(); return janelaLinha(d, g || null, 'diag'); }
          if (g && g.min === +v) d.linhas.splice(d.linhas.indexOf(g), 1); else if (g) g.min = +v; else d.linhas.unshift(acertaLinha({ tipo: 'diag', nome: 'Diagnóstico do defeito', min: +v, pu: HORA() }));
          mudouDoc(d); vibrar(); return refaz(`[data-diag="${v}"]`);
        }
        if ((b = t.closest('[data-ida]'))) {
          const i = desl(), n = +b.dataset.ida;
          // sem valor de deslocamento (nenhum vem de fábrica) ou por km: a janela da linha pede o valor e guarda em Ajustes
          if (!i) { if (ajustes.deslModo === 'km' || !ajustes.deslIda) { const c0 = com; sai(); return janelaLinha(d, null, 'desl', '', () => janelaSomar(d, c0)); } d.linhas.push(acertaLinha({ tipo: 'desl', nome: 'Deslocamento', q: 1, pu: ajustes.deslIda })); }
          else if (i.q + n < 1) d.linhas.splice(d.linhas.indexOf(i), 1); else i.q = Math.min(99, i.q + n);
          mudouDoc(d); vibrar(); return refaz('[data-ida="1"]');
        }
        if ((b = t.closest('[data-dia]'))) {
          const y = dia(), n = +b.dataset.dia;
          if (!y) { if (!ajustes.diaria) { const c0 = com; sai(); return janelaDiaria(() => { d.linhas.push(acertaLinha({ pid: 'diaria', nome: 'Diária técnica', un: 'dia', q: 1, pu: ajustes.diaria })); mudouDoc(d); janelaSomar(d, c0); }); } d.linhas.push(acertaLinha({ pid: 'diaria', nome: 'Diária técnica', un: 'dia', q: 1, pu: ajustes.diaria })); }
          else if (y.q + n < 1) d.linhas.splice(d.linhas.indexOf(y), 1); else y.q = Math.min(99, y.q + n);
          mudouDoc(d); vibrar(); return refaz('[data-dia="1"]');
        }
        if ((b = t.closest('[data-soma]'))) {
          const p = precos.find(x => x.id === b.dataset.soma); if (!p) return;
          somarItem(d, p, d.comodos.length ? com : ''); vibrar(); return refaz(`[data-soma="${p.id}"]`);
        }
        if ((b = t.closest('[data-tira]'))) {
          const L = d.linhas.filter(x => x.pid === b.dataset.tira && noCom(x)), l = L[L.length - 1]; if (!l) return;
          if (l.q > 1) l.q--; else d.linhas.splice(d.linhas.indexOf(l), 1);
          mudouDoc(d); return refaz(`[data-soma="${b.dataset.tira}"]`);
        }
      });
    } });
}
// soma um item dos seus Preços no documento (no cômodo, quando há)
function somarItem(d, p, cm) {
  const v = precoDe(p), l = d.linhas.find(x => x.pid === p.id && x.pu === v && !x.cond && x.nome === p.nome && x.com === cm);
  if (l) l.q = Math.min(9999, l.q + 1); else d.linhas.push(acertaLinha({ pid: p.id, tipo: p.cat === CAT_MATERIAL ? 'mat' : '', nome: p.nome, un: p.un, q: 1, pu: v, com: cm }));
  usar(p.id); mudouDoc(d);
}
// o valor da diária: nenhum vem de fábrica; o que você digitar fica em Ajustes, Cobrança
function janelaDiaria(depois) {
  janela({ titulo: 'Quanto é a sua diária?', sub: 'Para obra longa, um valor fechado por dia. Fica guardado em Ajustes, Cobrança.',
    corpo: campo('dr-v', 'Valor da diária', campoDinheiro('dr-v', ajustes.diaria)), pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoMontar: j => { $('[data-salvar]', j).onclick = () => { const v = lerDinheiro($('#dr-v', j)); if (!v) { KitFacil.apontar($('#dr-v', j)); return aviso('Escreva o valor da diária.'); } ajustes.diaria = v; salvarAjustes(); fecharJanela(true); depois(); }; } });
}
// Os seus dados que saem na proposta. Pedidos na abertura (com Pular) e, para quem pulou, antes do primeiro serviço.
const CAMPOS_ELE = [['nome', 'Seu nome', 'Ex.: Carlos Pereira', 'autocapitalize="words" autocomplete="name"'], ['fone', 'WhatsApp', '(11) 90000-0000', 'inputmode="tel" autocomplete="tel"'],
  ['empresa', 'Nome da empresa', 'Se tiver', 'autocapitalize="words"'], ['cidade', 'Cidade', 'Ex.: São Paulo', 'autocapitalize="words"'], ['doc', 'CPF ou CNPJ', 'Sai no recibo', 'inputmode="numeric"'],
  ['registro', 'Registro profissional', 'CREA, CFT ou NR-10', ''], ['email', 'E-mail', 'Ex.: voce@email.com', 'autocapitalize="off" inputmode="email" autocomplete="email"']];
const camposEletricista = (o, pre = 'el') => CAMPOS_ELE.map(([k, rot, dica, attrs], i) => `${i === 2 ? '<p class="kf-ajuda el-mais">Se quiser, já deixe pronto:</p>' : ''}${campo(`${pre}-${k}`, rot, `<input id="${pre}-${k}" class="kf-entrada" data-el="${k}" type="text" value="${esc(k === 'fone' ? fone(o[k]) : k === 'doc' ? cpfCnpj(o[k]) : o[k] || '')}" placeholder="${esc(dica)}" maxlength="80" ${attrs}>`)}`).join('');
// lê os campos; devolve o que falta do obrigatório (nome e WhatsApp)
function lerEletricista(raiz, o) {
  $$('[data-el]', raiz).forEach(i => { o[i.dataset.el] = i.value.trim().slice(0, 80); });
  return [[o.nome.length < 2, '[data-el="nome"]', 'o seu nome'], [soDigitos(o.fone).length < 10, '[data-el="fone"]', 'o WhatsApp com DDD']].filter(x => x[0]);
}
function janelaDados(depois, contexto = '') {
  janela({ titulo: 'Seus dados na proposta', sub: 'O cliente vê o seu nome e o seu WhatsApp no documento. O logotipo e o Pix ficam em Ajustes.', contexto,
    corpo: camposEletricista(ajustes), pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoMontar: j => { $('[data-salvar]', j).onclick = () => {
      const o = { ...ajustes }, falta = lerEletricista(j, o);
      falta.forEach(x => KitFacil.apontar($(x[1], j)));
      if (falta.length) return aviso(`Falta ${falta.map(x => x[2]).join(' e ')}.`);
      CAMPOS_ELE.forEach(([k]) => { ajustes[k] = o[k]; }); salvarAjustes(); fecharJanela(true); depois();
    }; } });
}
const selCom = (d, id, atual) => `<select id="${id}" class="kf-entrada">${[...d.comodos.map(c => [c, c]), ['', 'Geral, sem cômodo']].map(([v, n]) => `<option value="${esc(v)}"${v === (atual || '') ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
// O cômodo: renomear (vale para todas as linhas e materiais dele) ou apagar com o que tem dentro, com Desfazer.
function janelaCmd(d, nome) {
  const nL = d.linhas.filter(l => l.com === nome).length, nM = soma(d.mats.filter(m => m.com === nome).map(m => m.q));
  janela({ titulo: nome, contexto: 'Cômodo · ' + nomeDoc(d), sub: `${plural(nL, 'linha', 'linhas')} e ${plural(nM, 'peça contada', 'peças contadas')}.`,
    corpo: campo('cmd-n', 'Nome do cômodo', entrada('cmd-n', nome, 'maxlength="36"'), 'O nome novo vale para tudo o que está nele, no documento, no PDF e na mensagem.'),
    pe: '<button type="button" class="kf-btn kf-perigo" data-apagar>Apagar cômodo</button><button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoMontar: j => {
      $('[data-salvar]', j).onclick = () => {
        const novo = $('#cmd-n', j).value.trim().slice(0, 36);
        if (!novo) { KitFacil.apontar($('#cmd-n', j)); return aviso('Escreva o nome do cômodo.'); }
        if (novo !== nome && d.comodos.includes(novo)) { KitFacil.apontar($('#cmd-n', j)); return aviso(`Já existe um cômodo chamado ${novo}.`); }
        if (novo !== nome) { d.comodos[d.comodos.indexOf(nome)] = novo; d.linhas.forEach(l => { if (l.com === nome) l.com = novo; }); d.mats.forEach(m => { if (m.com === nome) m.com = novo; }); mudouDoc(d); }
        fecharJanela(); redesenhar();
      };
      $('[data-apagar]', j).onclick = () => confirmar(`Apagar ${nome}?`, `${nL || nM ? `Saem junto ${plural(nL, 'linha', 'linhas')} e ${plural(nM, 'peça contada', 'peças contadas')}.` : 'O cômodo está vazio.'}`, 'Apagar cômodo', () => {
        const antes = { comodos: clone(d.comodos), linhas: clone(d.linhas), mats: clone(d.mats) };
        d.comodos = d.comodos.filter(c => c !== nome); d.linhas = d.linhas.filter(l => l.com !== nome); d.mats = d.mats.filter(m => m.com !== nome);
        mudouDoc(d); redesenhar();
        aviso(`${nome} apagado.`, { label: 'Desfazer', run: () => { Object.assign(d, clone(antes)); mudouDoc(d); redesenhar(); } });
      }, { desfaz: 'Dá para desfazer logo depois.' });
    } });
}
const artigo = nome => /^(sala|cozinha|varanda|garagem|área|lavanderia|suíte|copa|despensa)/i.test(nome) ? 'a' : 'o';
// o material contado: quantidade e complemento ("20 A, curva C"); complementos diferentes ficam em linhas separadas
function janelaMat(d, m, depois) {
  janela({ titulo: m.nome, sub: m.quem === 'cli' ? 'O cliente compra.' : 'Eu levo.', contexto: m.com || nomeDoc(d),
    corpo: `<div class="kf-campo"><span class="kf-rotulo" id="mt-ql">Quantidade</span>${KitFacil.ui.quantidade({ id: 'mt-q', valor: m.q, min: 1, max: 9999, rotulo: 'quantidade', attrs: 'aria-labelledby="mt-ql"' })}</div>
      ${d.comodos.length ? campo('mt-cm', 'Cômodo', selCom(d, 'mt-cm', m.com)) : ''}
      ${campo('mt-c', 'Complemento', entrada('mt-c', m.comp, 'placeholder="Ex.: 20 A, curva C" maxlength="60"'), 'Sai na lista e, se for para o orçamento, no documento.')}`,
    pe: '<button type="button" class="kf-btn kf-perigo" data-tirar>Remover</button><button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoFechar: () => depois(),
    aoMontar: j => {
      $('[data-salvar]', j).onclick = () => { m.q = Math.max(1, Math.min(9999, parseInt($('#mt-q', j).value, 10) || 1)); m.comp = $('#mt-c', j).value.trim().slice(0, 60); if ($('#mt-cm', j)) m.com = $('#mt-cm', j).value; mudouDoc(d); fecharJanela(); };
      $('[data-tirar]', j).onclick = () => { d.mats.splice(d.mats.indexOf(m), 1); mudouDoc(d); fecharJanela(); aviso('Material removido.'); };
    } });
}
// material que não estava na lista: com o preço, fica nos seus Preços para as próximas visitas; sem preço, só é contado aqui
function janelaMatNovo(nome, depois) {
  janela({ titulo: 'Material novo', sub: 'Não estava na lista. Com o preço, ele fica nos seus Preços.',
    corpo: `${campo('mn-n', 'Nome', entrada('mn-n', nome, 'maxlength="80"'))}
      ${campo('mn-u', 'Contado por', `<select id="mn-u" class="kf-entrada">${UNIDADES.filter(u => !['h', 'ida', 'dia'].includes(u[0])).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select>`)}
      ${campo('mn-p', 'Preço de cada, se já souber', campoDinheiro('mn-p', 0), 'Sem o preço, o app pede quando o material for para o orçamento.')}`,
    pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Contar 1</button>',
    aoMontar: j => { $('[data-salvar]', j).onclick = () => {
      const n = $('#mn-n', j).value.trim().slice(0, 80); if (!n) { KitFacil.apontar($('#mn-n', j)); return aviso('Escreva o nome do material.'); }
      const un = $('#mn-u', j).value, v = lerDinheiro($('#mn-p', j));
      let p = precos.find(x => x.cat === CAT_MATERIAL && dobra(x.nome) === dobra(n));
      if (!p && v) { if (!cats.some(c => c.id === CAT_MATERIAL)) cats.push(catsBanco().find(c => c.id === CAT_MATERIAL)); p = acertaPreco({ id: uid(), cat: CAT_MATERIAL, nome: n, un, min: 0, fixo: true, preco: v }); precos.push(p); salvarPrecos(); }
      fecharJanela(true); depois({ nome: p ? p.nome : n, un: p ? p.un : un, p });
    }; } });
}
function janelaPrecoMats(d, faltam, depois) {
  janela({ titulo: 'Quanto custa cada um?', sub: 'O banco do app não traz preço de material. O que você digitar fica nos seus Preços.', contexto: nomeDoc(d),
    corpo: faltam.map((m, i) => campo('pm-' + i, esc(`${m.nome} · ${m.q} ${unTxt(m.q, m.un)}`), campoDinheiro('pm-' + i, 0), `Preço por ${unNome(m.un)}.`)).join(''),
    pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Salvar e pôr no orçamento</button>',
    aoMontar: j => { $('[data-salvar]', j).onclick = () => {
      const V = faltam.map((m, i) => lerDinheiro($('#pm-' + i, j))), k = V.findIndex(v => !v);
      if (k >= 0) { KitFacil.apontar($('#pm-' + k, j)); return aviso(`Falta o preço de ${faltam[k].nome}.`); }
      if (!cats.some(c => c.id === CAT_MATERIAL)) cats.push(catsBanco().find(c => c.id === CAT_MATERIAL));
      faltam.forEach((m, i) => { const p = acertaPreco({ id: uid(), cat: CAT_MATERIAL, nome: m.nome, un: m.un, min: 0, fixo: true, preco: V[i] }); precos.push(p); d.mats.forEach(x => { if (!x.pid && dobra(x.nome) === dobra(m.nome)) { x.pid = p.id; x.pu = p.preco; } }); });
      salvarPrecos(); fecharJanela(true); depois();
    }; } });
}
/* ---------- Lista de materiais: a soma do que foi contado. Só para quem usa o app ---------- */
function janelaMats(d) {
  let porCom = false;
  const corpo = () => {
    const L = listaMats(d, porCom), parte = quem => L.filter(m => m.quem === quem), eu = parte('eu'), cli = parte('cli');
    const valor = m => Math.round(m.q * precoMat(m));
    const linhaM = (m, comPreco) => `<button type="button" class="mt-ok" data-ok="${esc(m.ids.join(' '))}" aria-pressed="${m.ok}"><span class="mt-cx" aria-hidden="true">${m.ok ? IC.certo : ''}</span><span class="so-tx"><b>${esc(m.nome)}</b><small>${esc([`${m.q} ${unTxt(m.q, m.un)}`, m.comp].filter(Boolean).join(' · '))}</small></span>${comPreco ? (precoMat(m) ? `<b class="num">${BRL(valor(m))}</b>` : '<small class="mt-sem">sem preço</small>') : ''}</button>`;
    const bloco = (M, comPreco) => porCom ? [...new Set(M.map(m => m.com))].map(c => `<h4 class="sec-g"><span>${esc(c || 'Sem cômodo')}</span></h4><div class="so-lista">${M.filter(m => m.com === c).map(m => linhaM(m, comPreco)).join('')}</div>`).join('') : `<div class="so-lista">${M.map(m => linhaM(m, comPreco)).join('')}</div>`;
    const tot = soma(eu.map(valor)), ja = d.linhas.some(l => l.tipo === 'mat' && l.lista), semP = eu.some(m => !precoMat(m));
    return `<div class="kf-campo"><span class="kf-rotulo">Neste orçamento, o material</span>${segmento('Quem compra o material', 'qm', [['eu', 'Eu levo'], ['cli', 'O cliente compra']], d.quem)}</div>
      ${d.comodos.length ? segmento('Ver a lista', 'pc', [[0, 'No total'], [1, 'Por cômodo']], porCom ? 1 : 0) : ''}
      ${eu.length ? `<h3 class="sec-g"><span>Eu levo</span><b class="num">${BRL(tot)}</b></h3>${bloco(eu, true)}` : ''}
      ${cli.length ? `<h3 class="sec-g"><span>O cliente compra</span></h3>${bloco(cli, false)}` : ''}
      ${eu.length ? `<button type="button" class="kf-btn kf-pri" data-por>${semP ? 'Dar o preço e pôr no orçamento' : ja ? 'Atualizar no orçamento' : `Pôr ${BRL(tot)} no orçamento`}</button>` : ''}
      ${cli.length ? `<button type="button" class="kf-btn kf-sec" data-lcli>Mandar a lista ao cliente</button>` : ''}
      <p class="kf-ajuda">"Pôr no orçamento" soma só o que você leva. A lista do cliente sai só com a parte dele, sem preços.</p>`;
  };
  janela({ titulo: 'Lista de materiais', sub: 'A soma do que você contou. Marque o que já comprou.', contexto: nomeDoc(d), alta: true, aoFechar: () => redesenhar(),
    corpo: `<div id="ml-corpo" class="pilha">${corpo()}</div>`,
    aoMontar: j => {
      const refaz = foco => { $('#ml-corpo', j).innerHTML = corpo(); if (foco) $(foco, j)?.focus({ preventScroll: true }); };
      j.addEventListener('click', e => {
        const t = e.target; let b;
        // mudar o padrão leva para lá o material que estava no padrão antigo; as exceções já estão do outro lado
        if ((b = t.closest('[data-qm]'))) { const novo = b.dataset.qm; if (novo === d.quem) return; d.mats.forEach(m => { if (m.quem === d.quem) m.quem = novo; }); d.quem = novo; tocarDoc(d); return refaz(`[data-qm="${novo}"]`); }
        if ((b = t.closest('[data-pc]'))) { porCom = b.dataset.pc === '1'; return refaz(`[data-pc="${b.dataset.pc}"]`); }
        if ((b = t.closest('[data-ok]'))) { const ids = b.dataset.ok.split(' '), M = d.mats.filter(m => ids.includes(m.id)), v = !M.every(m => m.ok); M.forEach(m => { m.ok = v; }); tocarDoc(d); return refaz(`[data-ok="${CSS.escape(b.dataset.ok)}"]`); }
        if (t.closest('[data-por]')) {
          const pronto = () => { porNoOrcamento(d); mudouDoc(d); redesenhar(); aviso('Material no orçamento.'); };
          const faltam = listaMats(d).filter(m => m.quem === 'eu' && !precoMat(m)).filter((m, i, a) => a.findIndex(y => dobra(y.nome) === dobra(m.nome)) === i);
          if (faltam.length) { fecharJanela(true); return janelaPrecoMats(d, faltam, pronto); }
          fecharJanela(); return pronto();
        }
        if (t.closest('[data-lcli]')) { window.open(linkWhats(d.cliente.fone, mensagemLista(d)), '_blank', 'noopener'); }
      });
    } });
}

/* ---------- Enviar: o nome do cliente só é pedido aqui (Código, Art. 64-D) ---------- */
function janelaEnviar(d) {
  const c = conta(d), rel = d.tipo === 'rel';
  janela({ titulo: rel ? 'Enviar relatório' : 'Enviar orçamento', sub: `${nomeDoc(d)} · ${BRL(c.total)}`,
    corpo: `${campo('ev-nome', 'Nome do cliente', entrada('ev-nome', d.cliente.nome, 'autocapitalize="words" placeholder="Ex.: Mariana Souza"'))}
      ${campo('ev-fone', 'WhatsApp do cliente', entrada('ev-fone', d.cliente.fone ? fone(d.cliente.fone) : '', 'inputmode="tel" placeholder="(11) 90000-0000"'), 'A mensagem abre direto na conversa do cliente.')}
      <div class="envios">
        <button type="button" class="kf-btn kf-pri" data-pdf>${IC.pdf}Enviar PDF</button>
        <button type="button" class="kf-btn kf-sec" data-whats>${IC.conversa}Mensagem no WhatsApp</button>
        ${d.etapa === 'rascunho' ? '<button type="button" class="kf-btn kf-sec" data-ja>Já enviei de outro jeito</button>' : ''}
      </div>
      ${!ajustes.nome && !ajustes.empresa ? KitFacil.ui.faixa({ tipo: 'dica', html: 'O documento sai sem o seu nome. Ele fica em Ajustes, Conta e perfil.' }) : ''}`,
    aoMontar: j => {
      const guarda = () => {
        const nome = $('#ev-nome', j).value.trim();
        if (!nome) { KitFacil.apontar($('#ev-nome', j)); aviso('Escreva o nome do cliente para enviar.'); return false; }
        if (nome !== d.cliente.nome || $('#ev-fone', j).value.trim() !== (d.cliente.fone ? fone(d.cliente.fone) : '')) { d.cliente.nome = nome; d.cliente.fone = $('#ev-fone', j).value.trim(); tocarDoc(d); }
        return true;
      };
      j.addEventListener('click', async e => {
        const t = e.target; let b;
        if ((b = t.closest('[data-pdf]'))) { if (guarda() && await gerarPDF(b, () => montarPDF(d), nomeArquivo(TIPO[d.tipo].arquivo, d))) { fecharJanela(true); marcarEnviado(d); redesenhar(); } }
        else if (t.closest('[data-whats]')) { if (!guarda()) return; window.open(linkWhats(d.cliente.fone, mensagem(d)), '_blank', 'noopener'); fecharJanela(true); marcarEnviado(d); redesenhar(); }
        else if (t.closest('[data-ja]')) { if (!guarda()) return; fecharJanela(true); marcarEnviado(d); }
      });
    } });
}

/* ---------- Receber: QR code do Pix do que falta e o registro do pagamento ---------- */
function janelaReceber(d) {
  const c = conta(d), cob = cobrarAgora(d, c);
  let meio = 'Pix', tq = null;
  janela({ titulo: 'Receber', sub: `Falta ${BRL(c.falta)}${c.pago ? ` de ${BRL(c.total)}` : ''}`,
    corpo: `${ajustes.pix ? `<div class="pix-cx" id="rc-pix"><div class="kf-qr kf-qr-g" id="rc-qr" role="img" aria-label="QR code do Pix"><span class="kf-carregando">Preparando o QR code…</span></div>
        <button type="button" class="kf-btn kf-sec" data-copia>${IC.copia}Copiar Pix copia e cola</button></div>`
      : KitFacil.ui.faixa({ tipo: 'dica', html: 'Com a sua chave Pix cadastrada, aqui aparece o QR code do valor.', acao: '<button type="button" class="kf-btn kf-sec" data-aj-pix>Cadastrar chave Pix</button>' })}
      ${campo('rc-v', 'Valor recebido', campoDinheiro('rc-v', cob.v), cob.que === 'a entrada' ? `A entrada é de ${BRL(c.entrada)}.` : '')}
      <div class="kf-campo"><span class="kf-rotulo">Como recebeu</span><div id="rc-meio">${segmento('Como recebeu', 'meio', [['Pix', 'Pix'], ['Dinheiro', 'Dinheiro'], ['Cartão', 'Cartão']], meio)}</div></div>`,
    pe: '<button type="button" class="kf-btn kf-pri" data-recebi>Recebi</button>',
    aoMontar: j => {
      const valor = () => lerDinheiro($('#rc-v', j));
      const qr = () => { const cx = $('#rc-qr', j); if (!cx) return; const v = valor(); if (v > 0) KitFacil.pix.qr(cx, codigoPix(v)); };
      qr();
      $('#rc-v', j).addEventListener('input', () => { clearTimeout(tq); tq = setTimeout(qr, 500); });
      j.addEventListener('click', e => {
        const t = e.target; let b;
        if ((b = t.closest('[data-meio]'))) { meio = b.dataset.meio; $('#rc-meio', j).innerHTML = segmento('Como recebeu', 'meio', [['Pix', 'Pix'], ['Dinheiro', 'Dinheiro'], ['Cartão', 'Cartão']], meio); $(`[data-meio="${meio}"]`, j)?.focus({ preventScroll: true }); return; }
        if (t.closest('[data-copia]')) return KitFacil.copiar(codigoPix(valor()), 'Pix copia e cola copiado.');
        if (t.closest('[data-aj-pix]')) { fecharJanela(true); ir('/ajustes'); return setTimeout(() => KitFacil.ajustes.abrir('pix'), 60); }
        if (!t.closest('[data-recebi]')) return;
        const v = valor(), falta = conta(d).falta;
        if (!v) { KitFacil.apontar($('#rc-v', j)); return aviso('Escreva o valor recebido.'); }
        if (v > falta) { KitFacil.apontar($('#rc-v', j)); return aviso(`O valor passa do que falta receber, ${BRL(falta)}.`); }
        const p = { id: uid(), v, em: Date.now(), meio }, antes = d.etapa;
        d.pagos.push(p); mudouDoc(d); fecharJanela(true); redesenhar(); vibrar();
        aviso(d.etapa === 'recebido' ? `Recebido: ${BRL(v)}. Documento quitado.` : `Recebido: ${BRL(v)}. Falta ${BRL(conta(d).falta)}.`, { label: 'Desfazer', run: () => { d.pagos = d.pagos.filter(x => x !== p); d.etapa = antes; mudouDoc(d); redesenhar(); } });
      });
    } });
}

/* ---------- Recibo: um por pagamento, em PDF ou em mensagem ---------- */
function janelaRecibo(d, id) {
  let p = d.pagos.find(x => x.id === id) || d.pagos[d.pagos.length - 1];
  if (!p) return aviso('Ainda não há pagamento registrado neste documento.');
  const varios = d.pagos.length > 1 && !id;
  const qual = () => varios ? `<div class="kf-campo"><span class="kf-rotulo">De qual pagamento</span><div class="escolhas">${d.pagos.map(x => KitFacil.ui.escolha({ rotulo: `${BRL(x.v)} · ${dataCurta(x.em)}`, on: x === p, attrs: `data-pg="${esc(x.id)}"` })).join('')}</div></div>` : '';
  const corpo = () => `${qual()}<dl class="resumo"><div class="forte"><dt>Valor</dt><dd class="num">${BRL(p.v)}</dd></div><div><dt>Recebido em</dt><dd>${dataBR(p.em)}</dd></div><div><dt>Forma</dt><dd>${esc(p.meio)}</dd></div><div><dt>Cliente</dt><dd>${esc(d.cliente.nome || 'Sem nome')}</dd></div></dl>
    <div class="envios"><button type="button" class="kf-btn kf-pri" data-pdf>${IC.pdf}Enviar recibo em PDF</button><button type="button" class="kf-btn kf-sec" data-whats>${IC.conversa}Mensagem no WhatsApp</button></div>`;
  janela({ titulo: 'Recibo', sub: nomeDoc(d), corpo: `<div id="rb-corpo" class="pilha">${corpo()}</div>`,
    aoMontar: j => j.addEventListener('click', async e => {
      const t = e.target; let b;
      if ((b = t.closest('[data-pg]'))) { p = d.pagos.find(x => x.id === b.dataset.pg) || p; $('#rb-corpo', j).innerHTML = corpo(); $(`[data-pg="${p.id}"]`, j)?.focus({ preventScroll: true }); }
      else if ((b = t.closest('[data-pdf]'))) { if (await gerarPDF(b, () => montarRecibo(d, p), nomeArquivo('Recibo', d))) fecharJanela(); }
      else if (t.closest('[data-whats]')) { window.open(linkWhats(d.cliente.fone, mensagemRecibo(d, p)), '_blank', 'noopener'); fecharJanela(); }
    }) });
}

/* ---------- Mais opções do documento ---------- */
function janelaMenu(d) {
  const E = ETAPAS[d.tipo], i = E.indexOf(d.etapa);
  const op = (dado, icone, titulo, texto, perigo) => `<button type="button" class="opcao${perigo ? ' perigo' : ''}" ${dado}><span class="op-ic">${icone}</span><span class="op-tx"><b>${titulo}</b><small>${texto}</small></span>${IC.seta}</button>`;
  janela({ titulo: 'Mais opções', sub: nomeDoc(d),
    corpo: `<div class="opcoes">
      ${op('data-m="pdf"', IC.ver, 'Ver o PDF', 'Como o cliente recebe, sem marcar como enviado.')}
      ${op('data-m="copia"', IC.copia, 'Duplicar', 'Um documento novo com os mesmos serviços.')}
      ${i > 0 ? op('data-m="volta"', IC.desfazer, 'Voltar uma etapa', `De ${NOME_ETAPA[d.etapa]} para ${NOME_ETAPA[E[i - 1]]}.`) : ''}
      ${d.tipo === 'orc' && d.etapa === 'enviado' ? op('data-m="recusa"', IC.recusa, 'O cliente recusou', 'O orçamento sai da lista de espera.') : ''}
      </div><button type="button" class="kf-btn kf-perigo kf-cheio" data-m="excluir">${IC.lixo}Excluir documento</button>`,
    aoMontar: j => j.addEventListener('click', async e => {
      const b = e.target.closest('[data-m]'); if (!b) return;
      const m = b.dataset.m;
      if (m === 'pdf') { if (await gerarPDF(null, () => montarPDF(d), nomeArquivo(TIPO[d.tipo].arquivo, d))) fecharJanela(); return; }
      fecharJanela(true);
      if (m === 'copia') {
        const n = acertaDoc({ ...clone(d), id: uid(), exemplo: false, etapa: 'rascunho', tempoOk: false, pagos: [], enviadoEm: null, aprovadoEm: null, criado: Date.now(), mudou: Date.now(), feito: d.tipo === 'rel' ? Date.now() : null });
        n.linhas.forEach(l => { l.id = uid(); }); n.num = ++ajustes.seq; salvarAjustes(); docs.unshift(n); salvarDocs(); ir('/d/' + n.id, true); return aviso('Documento duplicado.');
      }
      if (m === 'volta') {
        const antes = d.etapa, pg = d.pagos; d.etapa = E[i - 1]; if (antes === 'recebido') d.pagos = []; tocarDoc(d); redesenhar();
        return aviso(`Voltou para ${NOME_ETAPA[d.etapa]}.${antes === 'recebido' ? ' Os recebimentos saíram.' : ''}`, { label: 'Desfazer', run: () => { d.etapa = antes; d.pagos = pg; tocarDoc(d); redesenhar(); } });
      }
      if (m === 'recusa') { d.etapa = 'recusado'; tocarDoc(d); redesenhar(); return aviso('Marcado como recusado.', { label: 'Desfazer', run: () => { d.etapa = 'enviado'; tocarDoc(d); redesenhar(); } }); }
      if (m === 'excluir') confirmar(`Excluir ${nomeDoc(d).toLowerCase()}?`, `${d.cliente.nome ? `O documento de ${d.cliente.nome}` : 'Este documento'} sai deste aparelho${SY.ligada() ? ' e dos outros aparelhos conectados' : ''}.`, 'Excluir documento', () => {
        const i2 = docs.indexOf(d); docs.splice(i2, 1); salvarDocs(); voltar('/');
        aviso('Documento excluído.', { label: 'Desfazer', run: () => { docs.splice(Math.min(i2, docs.length), 0, d); d.mudou = Date.now(); salvarDocs(); redesenhar(); } });
      }, { desfaz: 'Dá para desfazer logo depois.' });
    }) });
}

/* ================= Preços: a tabela (5.2.1). A hora, a busca, o filtro por categoria e as linhas por categoria ================= */
let filtroPreco = 'todas', buscaPreco = '';
const linhaPreco = p => `<button type="button" class="item prc-lin" data-preco="${esc(p.id)}" data-busca="${esc(dobra(`${p.nome} ${p.obj || ''} ${acaoNome(p.acao)}`))}"><span class="it-tx"><b>${esc(p.nome)}</b><small>${p.fixo ? '<span class="prc-fixo">fixo</span>' : tempoTxt(p.min)} · por ${unNome(p.un)}</small></span><b class="it-v num">${BRL(precoDe(p))}</b>${IC.seta}</button>`;
const secaoPreco = c => { const L = precos.filter(p => p.cat === c.id);
  return `<section class="prc-sec" data-sec="${esc(c.id)}" aria-labelledby="ps-${esc(c.id)}"><h2 class="sec prc-tit"><span id="ps-${esc(c.id)}">${esc(c.nome)} <span class="sec-n">· ${L.length}</span></span><button type="button" class="bt-ic prc-ed" data-editar-cat="${esc(c.id)}" aria-label="Editar a categoria ${esc(c.nome)}">${IC.lapis}</button></h2>
    ${L.length ? `<div class="cx itens">${L.map(linhaPreco).join('')}</div>` : '<p class="kf-ajuda">Categoria sem itens.</p>'}</section>`; };
// a ordem: serviços primeiro, o material na sua seção, no fim
const catsOrdem = () => [...cats.filter(c => c.id !== CAT_MATERIAL), ...cats.filter(c => c.id === CAT_MATERIAL)];
const ehBanco = id => BANCO.some(b => 'c-' + b[0] === id);
// em Preços aparecem as categorias com itens e as que você criou (para poder editar ou excluir); as do banco, vazias, não
const catsNaTabela = () => catsOrdem().filter(c => !ehBanco(c.id) || precos.some(p => p.cat === c.id));
TELAS.precos = {
  html() {
    const C = catsNaTabela(); if (filtroPreco !== 'todas' && !C.some(c => c.id === filtroPreco)) filtroPreco = 'todas';
    return `${barraTopo()}
    <main class="tela prc-tela" id="conteudo">
      ${KitFacil.ui.cabecalho({ titulo: 'Preços', sub: 'Os seus serviços e materiais, com o seu preço.' })}
      ${painelHora()}
      ${precos.length ? `<div class="busca"><span class="busca-ic">${IC.busca}</span><input id="pr-q" class="kf-entrada" type="search" value="${esc(buscaPreco)}" placeholder="Buscar serviço ou material" aria-label="Buscar na tabela de preços"></div>
      <div class="chips" role="group" aria-label="Filtrar por categoria">${[['todas', 'Todas'], ...C.map(c => [c.id, c.nome])].map(([id, n]) => `<button type="button" class="chip" data-fcat="${esc(id)}" aria-pressed="${filtroPreco === id}">${esc(n)}</button>`).join('')}</div>
      <p class="kf-so-leitor" role="status" id="pr-st"></p>` : KitFacil.ui.vazio({ titulo: 'Sua tabela começa vazia', icone: IC.raio, texto: 'O app não traz preço de fábrica. Cada serviço que você cria, aqui ou no orçamento, fica guardado com o seu preço.' })}
      <div id="pr-lista">${C.map(secaoPreco).join('')}</div>
      <p class="kf-ajuda prc-nada" id="pr-nada" hidden>Nenhum item com esse nome. Confira a escrita ou escolha Todas.</p>
      ${KitFacil.ui.adicionar({ rotulo: 'Novo serviço ou material', attrs: 'data-novo-preco' })}
      ${KitFacil.ui.adicionar({ rotulo: 'Nova categoria', attrs: 'data-nova-cat' })}
    </main>`;
  },
  ligar(el) {
    // filtrar sem redesenhar: a busca não perde o foco nem o teclado
    const filtrar = () => {
      if (!$('#pr-q', el)) return;
      const q = dobra(buscaPreco); let n = 0;
      $$('.prc-sec', el).forEach(s => {
        const naCat = filtroPreco === 'todas' || s.dataset.sec === filtroPreco; let vis = 0;
        $$('.prc-lin', s).forEach(b => { const ok = naCat && (!q || b.dataset.busca.includes(q)); b.hidden = !ok; if (ok) vis++; });
        s.hidden = !naCat || (!!q && !vis); n += vis;
      });
      $$('[data-fcat]', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fcat === filtroPreco)));
      $('#pr-nada', el).hidden = !(q && !n);
      $('#pr-st', el).textContent = q || filtroPreco !== 'todas' ? plural(n, 'item na tabela', 'itens na tabela') : '';
    };
    filtrar();
    $('#pr-q', el)?.addEventListener('input', e => { buscaPreco = e.target.value; filtrar(); });
    el.addEventListener('click', e => {
      const t = e.target; let b;
      if (t.closest('[data-hora]')) return janelaHora();
      if ((b = t.closest('[data-fcat]'))) { filtroPreco = b.dataset.fcat; return filtrar(); }
      if ((b = t.closest('[data-preco]'))) return janelaItem(precos.find(x => x.id === b.dataset.preco));
      if (t.closest('[data-novo-preco]')) return janelaItem(null, { cat: filtroPreco !== 'todas' ? filtroPreco : '', nome: buscaPreco.trim() });
      if ((b = t.closest('[data-editar-cat]'))) return janelaCat(cats.find(c => c.id === b.dataset.editarCat));
      if (t.closest('[data-nova-cat]')) janelaCat(null);
    });
  },
};
// o endereço antigo de uma categoria abre a tabela já filtrada nela
TELAS.cat = { html(r) { filtroPreco = r.id; return TELAS.precos.html(); }, ligar(el) { TELAS.precos.ligar(el); } };
// as categorias para escolher: as suas (com o nome que você deu) e as do banco que você excluiu
const catsEscolha = () => [...catsOrdem(), ...catsBanco().filter(b => !cats.some(c => c.id === b.id))];
const TEMPOS = [15, 30, 45, 60, 90, 120, 180, 240];
/* Novo serviço (ou material) e a edição de um item dos seus Preços, numa janela só. Ordem: categoria, objeto (do banco
   ou outro), ação (a mais comum para o objeto já vem marcada; toque de novo para tirar), nome (montado, editável),
   unidade e o preço: pelo tempo (vezes a sua hora; o item segue a hora) ou em reais (preço fixo). Material só em reais.
   Criado dentro do orçamento, o item fica salvo nos seus Preços e já entra no documento (o.aoSalvar). */
function janelaItem(p, o = {}) {
  if (!ajustes.hora && !semSalvar) return janelaHora(() => janelaItem(p, o), 'Antes do primeiro preço');
  const novo = !p, C0 = catsEscolha();
  const x = p ? { ...p, modo: p.fixo ? 'reais' : 'tempo' } : { cat: C0.some(c => c.id === o.cat) ? o.cat : C0[0].id, acao: o.acao ?? '', obj: o.obj || '', nome: '', un: 'un', min: 0, fixo: false, preco: 0, reais: [], modo: 'tempo' };
  const mat = () => x.cat === CAT_MATERIAL;
  let outro = false, mexeuAcao = !novo || o.acao !== undefined, tempoOutro = !novo && !p.fixo && !TEMPOS.includes(p.min), mexeuNome = !novo && x.nome !== nomeMontado(x.acao, x.obj);
  if (novo && o.obj) { const ob = objetosDe(x.cat).find(y => y.nome === o.obj); if (ob) x.un = x.acao === 'ponto' && ob.un !== 'm' ? 'ponto' : ob.un; x.nome = nomeMontado(x.acao, x.obj); }
  if (novo && o.nome && !o.obj) { x.nome = o.nome; mexeuNome = true; }
  const objs = () => mat() ? objetosDe(CAT_MATERIAL).filter(b => !precos.some(y => y.cat === CAT_MATERIAL && dobra(y.nome) === dobra(b.nome) && y !== p)) : [...objetosDe(x.cat), ...[...new Set(precos.filter(y => y.cat === x.cat && y.obj).map(y => y.obj))].filter(n => !objetosDe(x.cat).some(b => b.nome === n)).map(n => ({ nome: n, un: 'un', acao: 'instalacao' }))];
  const media = mediaReal(x), arred = v => Math.max(5, Math.min(6000, Math.round(v * 60 / HORA() / 5) * 5));
  const montar = () => { if (!mexeuNome) x.nome = mat() ? maiuscula(x.obj) : nomeMontado(x.acao, x.obj); };
  const corpo = () => `<div class="kf-campo"><span class="kf-rotulo" id="it-cl">Categoria</span><div class="chips" role="group" aria-labelledby="it-cl">${C0.map(c => `<button type="button" class="chip" data-it-cat="${esc(c.id)}" aria-pressed="${c.id === x.cat}">${esc(c.nome)}</button>`).join('')}</div></div>
      <div class="kf-campo"><span class="kf-rotulo" id="it-ol">${mat() ? 'Material' : 'Objeto'}</span><div class="escolhas" role="group" aria-labelledby="it-ol">${objs().map(b => KitFacil.ui.escolha({ rotulo: b.nome, on: !outro && b.nome === x.obj, attrs: `data-it-obj="${esc(b.nome)}"` })).join('')}${KitFacil.ui.escolha({ rotulo: mat() ? 'Outro material' : 'Outro objeto', on: outro, attrs: 'data-it-outro' })}</div></div>
      ${outro ? campo('it-on', mat() ? 'Nome do material' : 'Nome do objeto', entrada('it-on', x.obj, `placeholder="${mat() ? 'Ex.: Cabo flexível 16 mm²' : 'Ex.: tomada de sobrepor dupla'}" maxlength="60"`)) : ''}
      ${mat() ? '' : `<div class="kf-campo"><span class="kf-rotulo" id="it-al">Ação</span><div class="escolhas" role="group" aria-labelledby="it-al">${ACOES.map(([k, n]) => KitFacil.ui.escolha({ rotulo: n, on: k === x.acao, attrs: `data-it-acao="${k}"` })).join('')}</div></div>`}
      ${campo('it-n', mat() ? 'Nome do material' : 'Nome do serviço', entrada('it-n', x.nome, 'placeholder="Escolha o objeto, ou escreva" maxlength="80"'), mat() ? '' : 'Se monta com o objeto e a ação. Pode mudar.')}
      ${campo('it-u', mat() ? 'Vendido por' : 'Cobrado por', `<select id="it-u" class="kf-entrada">${UNIDADES.filter(u => !['ida', 'h'].includes(u[0])).map(([k, n]) => `<option value="${k}"${k === x.un ? ' selected' : ''}>${n}</option>`).join('')}</select>`)}
      ${mat() ? campo('it-p', 'Preço de cada', campoDinheiro('it-p', x.preco))
      : `<div class="kf-campo"><span class="kf-rotulo">Preço</span>${segmento('Como dar o preço', 'it-modo', [['tempo', 'Pelo tempo'], ['reais', 'Em reais']], x.modo)}</div>
        ${x.modo === 'reais' ? campo('it-p', 'Preço', campoDinheiro('it-p', x.preco), 'Preço fixo: não muda quando a sua hora muda.')
        : `<div class="kf-campo"><span class="kf-rotulo" id="it-tl">Quanto tempo leva</span><div class="escolhas" role="group" aria-labelledby="it-tl">${TEMPOS.map(m => KitFacil.ui.escolha({ rotulo: tempoTxt(m), on: !tempoOutro && m === x.min, attrs: `data-it-min="${m}"` })).join('')}${KitFacil.ui.escolha({ rotulo: 'Outro', on: tempoOutro, attrs: 'data-it-min="x"' })}</div></div>
          ${tempoOutro ? campo('it-t', 'Outro tempo', seletorTempo('it-t', x.min || 5, 720, 5)) : ''}
          ${media ? `<div class="tp-real"><span class="lin-tx"><b>O seu tempo real: ${tempoTxt(media)}</b><small>Média de ${plural(x.reais.length, 'serviço anotado', 'serviços anotados')}</small></span>${media !== x.min ? '<button type="button" class="kf-btn kf-sec kf-p" data-usar>Usar</button>' : ''}</div>` : ''}
          <p class="kf-ajuda" role="status">${x.min ? `${tempoTxt(x.min)} × ${BRL(HORA())} a hora = <b class="num">${BRL(precoDe(x))}</b>. Mudou a hora, o preço acompanha.` : 'Escolha o tempo. O preço é o tempo vezes a sua hora.'}</p>`}`}`;
  const salvarRot = o.aoSalvar ? 'Salvar e somar' : 'Salvar';
  janela({ titulo: novo ? (mat() ? 'Novo material' : 'Novo serviço') : mat() ? 'Material' : 'Serviço', contexto: o.doc ? nomeDoc(o.doc) : 'Preços', alta: true, aoFechar: o.aoFechar,
    corpo: `<div id="it-corpo" class="pilha">${corpo()}</div>`,
    pe: `${novo ? '' : '<button type="button" class="kf-btn kf-perigo" data-tirar>Excluir</button>'}<button type="button" class="kf-btn kf-pri" data-salvar>${salvarRot}</button>`,
    aoMontar: j => {
      const guarda = () => {
        if ($('#it-on', j)) x.obj = $('#it-on', j).value.trim().slice(0, 60);
        const n = $('#it-n', j).value.trim().slice(0, 80); if (n !== x.nome) { x.nome = n; mexeuNome = !!n && n !== (mat() ? maiuscula(x.obj) : nomeMontado(x.acao, x.obj)); }
        x.un = $('#it-u', j).value;
        if ($('#it-p', j)) x.preco = lerDinheiro($('#it-p', j));
        if ($('#it-t', j)) x.min = +$('#it-t', j).value || x.min;
      };
      // a categoria escolhida fica à vista na fila, sem mexer na rolagem da janela
      const mostraCat = () => { const ch = $('[data-it-cat][aria-pressed="true"]', j), f = ch && ch.parentElement; if (f) f.scrollLeft = Math.max(0, ch.offsetLeft - f.offsetLeft - (f.clientWidth - ch.offsetWidth) / 2); };
      const refaz = foco => { const cx = $('#it-corpo', j); const x0 = $('.chips', cx)?.scrollLeft || 0; cx.innerHTML = corpo(); prepararCampos(cx); const fila = $('.chips', cx); if (fila) fila.scrollLeft = x0; if (foco && foco.startsWith('[data-it-cat')) mostraCat(); const tt = $('.kf-dlg-titulo, h2', j); if (tt && novo) tt.textContent = mat() ? 'Novo material' : 'Novo serviço'; if (foco) $(foco, j)?.focus({ preventScroll: true }); };
      requestAnimationFrame(mostraCat);
      j.addEventListener('click', e => {
        const t = e.target; let b;
        if ((b = t.closest('[data-it-cat]'))) { guarda(); if (b.dataset.itCat === x.cat) return; x.cat = b.dataset.itCat; x.obj = ''; outro = false; if (!mexeuNome) x.nome = ''; if (mat()) x.modo = 'reais'; if (!mexeuAcao) x.acao = ''; return refaz(`[data-it-cat="${CSS.escape(x.cat)}"]`); }
        if ((b = t.closest('[data-it-obj]'))) {
          guarda(); outro = false; x.obj = b.dataset.itObj; const ob = objs().find(y => y.nome === x.obj);
          if (ob) { if (!mexeuAcao && !mat()) x.acao = ob.acao; x.un = !mat() && x.acao === 'ponto' && ob.un !== 'm' ? 'ponto' : ob.un; }
          montar(); return refaz(`[data-it-obj="${CSS.escape(x.obj)}"]`);
        }
        if (t.closest('[data-it-outro]')) { guarda(); outro = true; x.obj = ''; montar(); refaz(); return $('#it-on', j)?.focus(); }
        if ((b = t.closest('[data-it-acao]'))) { guarda(); const a = b.dataset.itAcao; x.acao = x.acao === a ? '' : a; mexeuAcao = true; if (x.acao === 'ponto' && x.un === 'un') x.un = 'ponto'; else if (x.acao !== 'ponto' && x.un === 'ponto') x.un = 'un'; montar(); return refaz(`[data-it-acao="${a}"]`); }
        if ((b = t.closest('[data-it-modo]'))) { guarda(); const v = precoDe(x); x.modo = b.dataset.itModo; if (x.modo === 'reais' && !x.preco && x.min) x.preco = v; if (x.modo === 'tempo' && !x.min && x.preco) x.min = arred(x.preco); return refaz(`[data-it-modo="${x.modo}"]`); }
        if ((b = t.closest('[data-it-min]'))) { guarda(); if (b.dataset.itMin === 'x') { tempoOutro = true; if (!x.min) x.min = 5; } else { tempoOutro = false; x.min = +b.dataset.itMin; } return refaz(`[data-it-min="${b.dataset.itMin}"]`); }
        if (t.closest('[data-usar]')) { guarda(); x.min = media; tempoOutro = !TEMPOS.includes(media); return refaz(); }
      });
      j.addEventListener('change', e => {
        if (e.target.id === 'it-t') { guarda(); refaz('#it-t'); }
        else if (e.target.id === 'it-on') { guarda(); montar(); const n = $('#it-n', j); if (n && !mexeuNome) n.value = x.nome; }
      });
      $('[data-salvar]', j).onclick = () => {
        guarda(); montar();
        if (!x.nome) { KitFacil.apontar($(outro ? '#it-on' : '#it-n', j)); return aviso(mat() ? 'Escolha o material ou escreva o nome.' : 'Escolha o objeto ou escreva o nome.'); }
        const fixo = mat() || x.modo === 'reais';
        if (fixo && !x.preco) { KitFacil.apontar($('#it-p', j)); return aviso('Escreva o preço.'); }
        if (!fixo && !x.min) { KitFacil.apontar($('[data-it-min]', j)?.parentElement); return aviso('Escolha quanto tempo leva.'); }
        const igual = precos.find(y => y !== p && y.cat === x.cat && dobra(y.nome) === dobra(x.nome));
        if (igual) { KitFacil.apontar($('#it-n', j)); return aviso(`Você já tem "${igual.nome}" nos seus Preços.`); }
        // a categoria do banco que você tinha excluído volta, para o item ter onde ficar
        if (!cats.some(c => c.id === x.cat)) { const cb = catsBanco().find(c => c.id === x.cat); if (cb) cats.push(cb); }
        const v = acertaPreco({ id: p ? p.id : uid(), cat: x.cat, nome: x.nome, un: x.un, min: fixo ? 0 : x.min, fixo, preco: fixo ? x.preco : 0, reais: x.reais, acao: mat() ? '' : x.acao, obj: x.obj });
        if (novo) precos.push(v); else Object.assign(p, v);
        salvarPrecos(); fecharJanela(true);
        if (o.aoSalvar) return o.aoSalvar(v);
        redesenhar(); aviso(novo ? `${v.nome}: salvo nos seus Preços.` : 'Preço salvo.');
      };
      $('[data-tirar]', j)?.addEventListener('click', () => confirmar('Excluir este item?', `"${p.nome}" sai dos seus Preços. Os documentos já feitos não mudam.`, 'Excluir item', () => {
        const i = precos.indexOf(p); precos.splice(i, 1); salvarPrecos(); redesenhar();
        aviso('Item excluído.', { label: 'Desfazer', run: () => { precos.splice(Math.min(i, precos.length), 0, p); salvarPrecos(); redesenhar(); } });
      }, { desfaz: 'Dá para desfazer logo depois.' }));
    } });
}
/* ---------- A hora: a base de todos os preços. Dois caminhos: digitar o valor ou descobrir pela conta do mês ---------- */
const painelHora = () => `<section class="painel hora-pn" aria-label="A sua hora"><span class="pn-rot">A sua hora</span><b class="pn-num num">${ajustes.hora ? BRL(ajustes.hora) : 'Sem valor'}</b><span class="pn-sub">${ajustes.hora ? 'Mudou a hora, mudam os preços dados pelo tempo.' : 'Os preços dados pelo tempo são o tempo vezes a sua hora.'}</span><button type="button" class="pn-bt" data-hora>${ajustes.hora ? 'Mudar' : 'Informar a minha hora'}</button></section>`;
function janelaHora(depois, contexto = '') {
  let modo = 'digitar', v = ajustes.hora, T = ajustes.hTirar, C = ajustes.hCustos, Hh = ajustes.hHoras;
  const daConta = () => Hh > 0 ? Math.round((T + C) / Hh) : 0, atual = () => modo === 'conta' ? daConta() : v;
  const exemplo = () => { const h = atual(); return h ? `Com essa hora: troca de tomada (20 min), ${BRL(Math.round(h / 3))}; instalação de chuveiro (1 h), ${BRL(h)}.` : 'Sem a hora, o app não tem como calcular os seus preços.'; };
  const corpo = () => `${segmento('Como informar a hora', 'hm', [['digitar', 'Digitar o valor'], ['conta', 'Descobrir minha hora']], modo)}
    ${modo === 'digitar' ? campo('hr-v', 'Valor da sua hora', campoDinheiro('hr-v', v))
    : `${campo('hr-t', 'Quanto quer tirar por mês', campoDinheiro('hr-t', T))}
      ${campo('hr-c', 'Custos do mês', campoDinheiro('hr-c', C), 'Carro, ferramenta, celular, imposto.')}
      ${campo('hr-h', 'Horas que você cobra por mês', `<input id="hr-h" class="kf-entrada" type="text" inputmode="numeric" maxlength="3" value="${Hh || ''}" placeholder="Ex.: 60">`, 'Só as horas cobradas, sem trânsito nem orçamento.')}
      <dl class="resumo"><div class="forte"><dt>A sua hora dá</dt><dd class="num" id="hr-r">${BRL(daConta())}</dd></div></dl>`}
    <p class="kf-ajuda" id="hr-ex" role="status">${esc(exemplo())}</p>`;
  janela({ titulo: 'Quanto vale a sua hora?', sub: 'É a base de todos os seus preços. Você muda quando quiser, em Preços.', contexto,
    corpo: `<div id="hr-corpo" class="pilha">${corpo()}</div>`, pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoMontar: j => {
      const ler = () => { if (modo === 'digitar') v = lerDinheiro($('#hr-v', j)); else { T = lerDinheiro($('#hr-t', j)); C = lerDinheiro($('#hr-c', j)); Hh = Math.max(0, Math.min(744, parseInt($('#hr-h', j).value, 10) || 0)); } };
      j.addEventListener('input', () => { ler(); const r = $('#hr-r', j); if (r) r.textContent = BRL(daConta()); $('#hr-ex', j).textContent = exemplo(); });
      j.addEventListener('click', e => {
        const b = e.target.closest('[data-hm]');
        if (b) { ler(); modo = b.dataset.hm; const cx = $('#hr-corpo', j); cx.innerHTML = corpo(); prepararCampos(cx); return $(`[data-hm="${modo}"]`, j)?.focus({ preventScroll: true }); }
        if (!e.target.closest('[data-salvar]')) return;
        ler(); const h = atual();
        if (!h) { KitFacil.apontar($(modo === 'digitar' ? '#hr-v' : '#hr-h', j)); return aviso(modo === 'digitar' ? 'Escreva o valor da sua hora.' : 'Preencha os três números da conta.'); }
        ajustes.hora = h; if (modo === 'conta') { ajustes.hTirar = T; ajustes.hCustos = C; ajustes.hHoras = Hh; }
        salvarAjustes(); fecharJanela(true);
        if (depois) depois(); else { redesenhar(); aviso(`A sua hora agora é ${BRL(h)}.`); }
      });
    } });
}
/* ---------- Tempo real: depois do serviço, um toque; com três anotações o app sugere acertar a tabela ---------- */
function janelaTempo(d) {
  if (d.tempoOk) return aviso('O tempo deste documento já foi anotado.');
  const P = anotaveis(d);
  janela({ titulo: 'Quanto tempo levou?', sub: 'Não muda este documento. Serve para a sua tabela ficar com os seus tempos.', contexto: nomeDoc(d),
    corpo: P.map((p, i) => campo('tr-' + i, esc(p.nome), seletorTempo('tr-' + i, p.min, 720, 5), `A tabela diz ${tempoTxt(p.min)}, cada.`)).join(''),
    pe: '<button type="button" class="kf-btn kf-sec" data-igual>Foi no tempo da tabela</button><button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoMontar: j => j.addEventListener('click', e => {
      const igual = e.target.closest('[data-igual]'); if (!igual && !e.target.closest('[data-salvar]')) return;
      P.forEach((p, i) => { p.reais = [...p.reais, igual ? p.min : +$('#tr-' + i, j).value || p.min].slice(-5); });
      d.tempoOk = true; salvarPrecos(); tocarDoc(d); fecharJanela(true); redesenhar();
      const s2 = P.find(p => p.reais.length >= 3 && mediaReal(p) !== p.min);
      if (!s2) return aviso('Tempo anotado.');
      const m = mediaReal(s2);
      aviso(`Você leva ${tempoTxt(m)} em ${s2.nome}. A tabela diz ${tempoTxt(s2.min)}.`, { label: 'Atualizar', run: () => { s2.min = m; salvarPrecos(); redesenhar(); aviso('Tempo atualizado na tabela.'); } });
    }) });
}
function janelaCat(c) {
  const nova = !c; let icone = c ? c.icone : 'raio';
  const grade = () => Object.keys(PIC).map(k => `<button type="button" class="ic-op" data-ic="${k}" aria-pressed="${k === icone}" aria-label="${esc(PIC_NOMES[k])}">${PIC[k]}</button>`).join('');
  janela({ titulo: nova ? 'Nova categoria' : 'Editar categoria',
    corpo: `${campo('ct-n', 'Nome da categoria', entrada('ct-n', c ? c.nome : '', 'placeholder="Ex.: Ar-condicionado"'))}
      <div class="kf-campo"><span class="kf-rotulo" id="ct-il">Ícone da categoria em Somar serviço</span><div class="ic-grade" id="ct-ic" role="group" aria-labelledby="ct-il">${grade()}</div></div>`,
    pe: `${nova ? '' : '<button type="button" class="kf-btn kf-perigo" data-tirar>Excluir</button>'}<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>`,
    aoMontar: j => {
      j.addEventListener('click', e => { const b = e.target.closest('[data-ic]'); if (!b) return; icone = b.dataset.ic; $('#ct-ic', j).innerHTML = grade(); $(`[data-ic="${icone}"]`, j)?.focus({ preventScroll: true }); });
      $('[data-salvar]', j).onclick = () => {
        const nome = $('#ct-n', j).value.trim();
        if (!nome) { KitFacil.apontar($('#ct-n', j)); return aviso('Escreva o nome da categoria.'); }
        if (nova) { const n = { id: 'c-' + uid(), nome, icone }; cats.push(n); salvarPrecos(); fecharJanela(true); filtroPreco = n.id; redesenhar(); return aviso('Categoria criada. Cadastre os preços dela.'); }
        c.nome = nome; c.icone = icone; salvarPrecos(); fecharJanela(); redesenhar();
      };
      $('[data-tirar]', j)?.addEventListener('click', () => {
        const L = precos.filter(p => p.cat === c.id);
        confirmar(`Excluir a categoria ${c.nome}?`, `${L.length ? `${L.length === 1 ? 'O preço dela também sai' : `Os ${L.length} preços dela também saem`} da sua lista. ` : ''}Os documentos já feitos não mudam.`, 'Excluir categoria', () => {
          const i = cats.indexOf(c), P0 = precos; cats.splice(i, 1); precos = precos.filter(p => p.cat !== c.id); salvarPrecos(); ir('/precos', true);
          aviso('Categoria excluída.', { label: 'Desfazer', run: () => { cats.splice(Math.min(i, cats.length), 0, c); precos = P0; salvarPrecos(); redesenhar(); } });
        }, { desfaz: 'Dá para desfazer logo depois.' });
      });
    } });
}

/* ================= Mais: o que não cabe na barra e, por último, os Ajustes (Código, Art. 60, II) ================= */
TELAS.mais = {
  html: () => `${barraTopo()}
    <main class="tela" id="conteudo">
      ${KitFacil.ui.cabecalho({ titulo: 'Mais', sub: 'O guia, um exemplo para mexer e os ajustes.' })}
      ${KitFacil.nav.mais({ linhas: [
        { id: 'guia', titulo: 'Ver o guia', texto: 'O app mostra cada passo, do orçamento ao recibo', icone: IC.guia },
        { id: 'exemplo', titulo: 'Abrir um exemplo', texto: 'Um orçamento pronto, para você mexer à vontade', icone: IC.exemplo },
      ] })}
    </main>`,
  ligar() {},
};
