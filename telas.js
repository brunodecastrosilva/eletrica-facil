/* Elétrica Fácil 5 · telas: Início, Documentos, o documento (orçamento ou relatório), Preços e Mais.
   Ideias trazidas de apps premiados em design, e como entram aqui:
   - a informação que importa fica na frente e o resto sai do caminho (Flighty): o Início abre com o que há para receber;
   - mostrar só o passo atual (Crouton): no documento, o botão do pé é sempre o próximo passo, e só ele;
   - tema e paleta coesos, dados claros (Tide Guide): amarelo e azul-noite em tudo, números grandes numa fonte só;
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
      ${KitFacil.ui.cabecalho({ titulo: 'Início', sub: nome ? `Olá, ${esc(nome)}. Veja o que falta enviar e receber.` : 'O que falta enviar, aprovar e receber.', criar: { rotulo: 'Novo documento', attrs: 'data-novo' } })}
      <section class="painel" aria-label="Resumo">
        <svg class="pn-raio" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.500 1.500 3.800 13.600h6.900l-1.100 8.900 10.600-13h-7.100z"/></svg>
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
          texto: L.length ? 'Nenhum documento esperando por você. Os recebidos ficam em Documentos.' : 'Toque em Novo documento para fazer o primeiro orçamento. Leva um minuto.',
          acao: L.length ? '' : '<button type="button" class="kf-btn kf-sec" data-exemplo>Abrir um exemplo</button>' })}
      </section>
    </main>`;
  },
  ligar(el) {
    el.addEventListener('click', e => {
      if (abrirDoc(el, e)) return;
      if (e.target.closest('[data-novo]')) return janelaNovo();
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
const subLinha = l => l.tipo === 'diag' ? `${tempoTxt(l.min)} × ${BRL(l.pu)} a hora` : l.tipo === 'desl' ? `${l.q} ${unTxt(l.q, 'ida')} × ${BRL(l.pu)}${l.km ? ` · ${l.km} km` : ''}` : `${l.q} ${unTxt(l.q, l.un)} × ${BRL(l.pu)}${l.cond ? ` · ${NOME_COND[l.cond].toLowerCase()}` : ''}`;
const itemDoc = l => `<button type="button" class="item" data-linha="${esc(l.id)}"><span class="it-q num" aria-hidden="true">${l.tipo === 'diag' ? tempoTxt(l.min) : l.q}</span><span class="it-tx"><b>${esc(l.nome)}</b><small>${esc(subLinha(l))}</small></span><b class="it-v num">${BRL(totalLinha(l))}</b></button>`;
// serviços da tabela que seguem a hora: são os que podem ter o tempo real anotado
const anotaveis = d => d.linhas.filter(l => !l.tipo && l.pid).map(l => precos.find(p => p.id === l.pid)).filter((p, i, a) => p && !p.fixo && a.indexOf(p) === i);
const mediaReal = p => p.reais.length ? Math.max(5, Math.round(soma(p.reais) / p.reais.length / 5) * 5) : 0;
const seletorTempo = (id, atual, max, passo) => { const L = new Set([atual]); for (let m = passo; m <= max; m += passo) L.add(m); return `<select id="${id}" class="kf-entrada">${[...L].sort((a, b) => a - b).map(m => `<option value="${m}"${m === atual ? ' selected' : ''}>${tempoTxt(m)}</option>`).join('')}</select>`; };
TELAS.doc = {
  html(r) {
    const d = getDoc(r.id), c = conta(d), px = proximo(d), E = ETAPAS[d.tipo], i = E.indexOf(d.etapa), rel = d.tipo === 'rel';
    const obs = d.obs.trim().split('\n')[0];
    const resumo = (rot, v, forte) => `<div${forte ? ' class="forte"' : ''}><dt>${rot}</dt><dd class="num">${v}</dd></div>`;
    return `${barraInterna(TIPO[d.tipo].nome, numTxt(d))}
    <main class="tela doc-tela" id="conteudo">
      <section class="trilha" aria-label="Etapas do documento">
        ${d.etapa === 'recusado' ? `<p class="tr-recusa">${IC.recusa}<b>Recusado pelo cliente</b></p>` : `<ol class="tr-passos">${E.map((e, k) => `<li class="${k < i ? 'feito' : k === i ? 'atual' : ''}"${k === i ? ' aria-current="step"' : ''}><i aria-hidden="true">${k < i ? IC.certo : ''}</i><span>${NOME_ETAPA[e]}</span></li>`).join('')}</ol>`}
        <p class="tr-frase" role="status">${esc(px.frase)}</p>
      </section>
      <section class="cx" aria-label="Cliente e serviço">
        ${lin('data-j="cliente"', IC.pessoa, 'Cliente', d.cliente.nome ? [d.cliente.nome, d.cliente.fone ? fone(d.cliente.fone) : ''].filter(Boolean).join(' · ') : 'Só é preciso na hora de enviar', !d.cliente.nome)}
        ${lin('data-j="titulo"', IC.lapis, rel ? 'Serviço executado' : 'Serviço', d.titulo || 'Dê um nome, se quiser', !d.titulo)}
      </section>
      <section aria-labelledby="dc-it">
        <h2 class="sec" id="dc-it">${rel ? 'O que foi feito' : 'Serviços'}${d.linhas.length ? ` <span class="sec-n">· ${d.linhas.length}</span>` : ''}</h2>
        ${d.linhas.length ? `<div class="cx itens">${d.linhas.map(itemDoc).join('')}${c.minimo ? `<div class="item minimo"><span class="it-q" aria-hidden="true">${IC.raio}</span><span class="it-tx"><b>Atendimento mínimo</b><small>Completa ${BRL(d.minIda)} por ida</small></span><b class="it-v num">${BRL(c.minimo)}</b></div>` : ''}</div>` : ''}
        ${KitFacil.ui.adicionar({ rotulo: 'Somar serviço', attrs: 'data-somar' })}
      </section>
      <section aria-labelledby="dc-co">
        <h2 class="sec" id="dc-co">Condições</h2>
        <div class="cx">
          ${lin('data-j="pag"', IC.dinheiro, 'Pagamento', pagCurto(d))}
          ${rel ? lin('data-j="feito"', IC.dia, 'Serviço feito em', d.feito ? dataBR(d.feito) : 'Escolha o dia', !d.feito) : lin('data-j="validade"', IC.relogio, 'Validade', `${plural(d.validade, 'dia', 'dias')} · até ${dataCurta(validoAte(d))}`)}
          ${lin('data-j="garantia"', IC.escudo, 'Garantia', d.garantia ? plural(d.garantia, 'dia', 'dias') : 'Sem garantia', !d.garantia)}
          ${lin('data-j="desc"', IC.desconto, 'Desconto', c.desc ? `${d.descPct ? d.descPct + '% · ' : ''}${BRL(c.desc)}` : 'Sem desconto', !c.desc)}
          ${lin('data-j="obs"', IC.nota, 'Observações', obs || 'Nenhuma', !obs)}
        </div>
      </section>
      <section aria-label="Valores">
        <dl class="resumo">
          ${c.desl || c.mat ? resumo('Mão de obra', BRL(c.mao)) + (c.desl ? resumo('Deslocamento', BRL(c.desl)) : '') + (c.mat ? resumo('Material', BRL(c.mat)) : '') : ''}
          ${c.desc ? resumo('Valor do serviço', BRL(c.sub)) + resumo(esc(descTxt(d)), '− ' + BRL(c.desc)) : ''}
          ${resumo('Total', BRL(c.total), true)}
          ${d.pag === 'entrada' && !c.pago ? resumo(`Entrada de ${d.entradaPct}%`, BRL(c.entrada)) + resumo('Na conclusão', BRL(c.resto)) : ''}
          ${c.pago ? resumo('Já recebido', BRL(c.pago)) + resumo('Falta receber', BRL(c.falta)) : ''}
        </dl>
      </section>
      ${anotaveis(d).length && (rel || ['aprovado', 'recebido'].includes(d.etapa)) ? `<section aria-labelledby="dc-tr"><h2 class="sec" id="dc-tr">Depois do serviço</h2><div class="cx">${lin('data-j="tempo"', IC.relogio, 'Tempo real', d.tempoOk ? 'Anotado' : 'Anotar, para a tabela ter os seus tempos', !d.tempoOk)}</div></section>` : ''}
      ${d.pagos.length ? `<section aria-labelledby="dc-pg"><h2 class="sec" id="dc-pg">Recebimentos</h2><div class="cx">${d.pagos.map(p => `<div class="pago"><span class="lin-ic">${IC.certo}</span><span class="lin-tx"><small>${dataBR(p.em)} · ${esc(p.meio)}</small><b class="num">${BRL(p.v)}</b></span><button type="button" class="kf-btn kf-sec kf-p" data-recibo="${esc(p.id)}">Recibo</button></div>`).join('')}</div></section>` : ''}
    </main>
    <div class="pe-tela" id="pe-doc">
      <div class="pe-in">
        <div class="pe-total"><small>${c.pago && c.falta ? 'Falta' : 'Total'}</small><b class="num">${BRL(c.pago && c.falta ? c.falta : c.total)}</b></div>
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
      if (t.closest('[data-somar]')) return janelaSomar(d);
      let b;
      if ((b = t.closest('[data-linha]'))) return janelaLinha(d, d.linhas.find(l => l.id === b.dataset.linha));
      if ((b = t.closest('[data-j]'))) return b.dataset.j === 'cliente' ? janelaCliente(d) : b.dataset.j === 'tempo' ? janelaTempo(d) : janelaCond(d, b.dataset.j);
      if ((b = t.closest('[data-recibo]'))) return janelaRecibo(d, b.dataset.recibo);
      if (t.closest('[data-menu]')) return janelaMenu(d);
      if ((b = t.closest('[data-prox]'))) return avancar(d, b.dataset.prox);
    });
  },
};
// o botão do pé: o próximo passo do documento
function avancar(d, passo) {
  if (passo === 'somar') return janelaSomar(d);
  if (passo === 'enviar') return janelaEnviar(d);
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
  d.etapa = 'enviado'; d.enviadoEm = Date.now(); tocarDoc(d); redesenhar();
  aviso('Marcado como enviado.', { label: 'Desfazer', run: () => { d.etapa = 'rascunho'; d.enviadoEm = null; tocarDoc(d); redesenhar(); } });
}

/* ---------- janelas do documento ---------- */
function janelaCliente(d) {
  const c = d.cliente;
  janela({ titulo: 'Cliente', sub: 'O nome sai no documento. O resto é opcional.',
    corpo: `${campo('cl-nome', 'Nome', entrada('cl-nome', c.nome, 'autocapitalize="words" placeholder="Ex.: Mariana Souza"'))}
      ${campo('cl-fone', 'WhatsApp', entrada('cl-fone', c.fone ? fone(c.fone) : '', 'inputmode="tel" placeholder="(11) 90000-0000"'))}
      ${campo('cl-end', 'Endereço do serviço', entrada('cl-end', c.end, 'placeholder="Rua, número e bairro"'))}
      ${campo('cl-doc', 'CPF ou CNPJ', entrada('cl-doc', c.doc ? cpfCnpj(c.doc) : '', 'inputmode="numeric" placeholder="Sai no recibo"'))}`,
    pe: '<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>',
    aoMontar: j => { $('[data-salvar]', j).onclick = () => { d.cliente = { nome: $('#cl-nome', j).value.trim(), fone: $('#cl-fone', j).value.trim(), end: $('#cl-end', j).value.trim(), doc: $('#cl-doc', j).value.trim() }; tocarDoc(d); fecharJanela(); redesenhar(); }; } });
}
const VAL_OP = [[7, '7 dias'], [15, '15 dias'], [30, '30 dias'], [60, '60 dias']], GAR_OP = [[0, 'Sem'], [30, '30 dias'], [90, '90 dias'], [180, '180 dias'], [365, '1 ano']];
function janelaCond(d, qual) {
  const rel = d.tipo === 'rel';
  const corpo = () => {
    const c = conta(d);
    if (qual === 'titulo') return campo('cd-t', rel ? 'Qual serviço foi feito?' : 'Qual é o serviço?', entrada('cd-t', d.titulo, 'placeholder="Ex.: Reforma elétrica da cozinha"'), 'Aparece no alto do documento e na lista.');
    if (qual === 'pag') return `<div class="kf-campo"><span class="kf-rotulo" id="cd-pl">Como o cliente paga</span>${segmento('Como o cliente paga', 'pag', rel ? [['vista', 'À vista'], ['combinar', 'A combinar']] : [['vista', 'À vista'], ['entrada', 'Entrada'], ['combinar', 'A combinar']], d.pag)}</div>
      ${d.pag === 'entrada' ? `<div class="kf-campo"><span class="kf-rotulo">Quanto de entrada</span>${segmento('Quanto de entrada', 'ep', [30, 40, 50, 60, 70].map(n => [n, n + '%']), d.entradaPct)}</div>` : ''}
      <p class="kf-ajuda" role="status">${esc(pagTxt(d, c))}</p>`;
    if (qual === 'validade') return `<div class="kf-campo"><span class="kf-rotulo">O orçamento vale por</span>${segmento('Validade', 'val', VAL_OP, d.validade)}</div><p class="kf-ajuda" role="status">Vale até ${dataBR(validoAte(d))}.</p>`;
    if (qual === 'garantia') return `<div class="kf-campo"><span class="kf-rotulo">Garantia do serviço</span><div class="escolhas">${GAR_OP.map(([k, l]) => KitFacil.ui.escolha({ rotulo: l, on: d.garantia === k, attrs: `data-gar="${k}"` })).join('')}</div></div><p class="kf-ajuda" role="status">${esc(garantiaTxt(d))}.</p>`;
    if (qual === 'feito') return campo('cd-f', 'Dia em que o serviço foi feito', `<input id="cd-f" class="kf-entrada" type="date" value="${dataISO(d.feito || Date.now())}" max="${dataISO()}">`);
    if (qual === 'desc') return `${campo('cd-dn', 'Nome que aparece no documento', entrada('cd-dn', d.descNome, 'placeholder="Ex.: Desconto de família"'))}
      <div class="kf-campo"><span class="kf-rotulo">Quanto</span>${segmento('Quanto de desconto', 'dp', [[0, 'Sem'], [10, '10%'], [25, '25%'], [50, '50%'], [100, '100%']], d.descPct)}</div>
      ${campo('cd-dp', 'Outra porcentagem', `<input id="cd-dp" class="kf-entrada" type="text" inputmode="numeric" maxlength="3" value="${d.descPct || ''}" placeholder="De 1 a 100">`)}
      <dl class="resumo"><div><dt>Valor do serviço</dt><dd class="num">${BRL(c.sub)}</dd></div>${c.desc ? `<div><dt>${esc(descTxt(d))}</dt><dd class="num">− ${BRL(c.desc)}</dd></div>` : ''}<div class="forte"><dt>Total</dt><dd class="num">${BRL(c.total)}</dd></div></dl>
      <p class="kf-ajuda" role="status">${d.descPct === 100 ? 'Com 100%, o documento sai como cortesia e não pede pagamento.' : c.mat ? 'O desconto não incide sobre o material.' : 'O cliente vê o valor cheio e a linha do desconto.'}</p>`;
    return campo('cd-o', 'Observações', `<textarea id="cd-o" class="kf-entrada" rows="5" placeholder="Ex.: Material por conta do cliente.">${esc(d.obs)}</textarea>`, 'Saem no fim do documento.');
  };
  const T = { titulo: rel ? 'Serviço executado' : 'Serviço', pag: 'Pagamento', validade: 'Validade', garantia: 'Garantia', feito: 'Dia do serviço', desc: 'Desconto', obs: 'Observações' };
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
        else if ((b = t.closest('[data-gar]'))) d.garantia = +b.dataset.gar;
        else if ((b = t.closest('[data-dp]'))) { d.descNome = $('#cd-dn', j).value.trim(); d.descPct = +b.dataset.dp; d.desc = 0; }
        else if (t.closest('[data-salvar]')) {
          if (qual === 'titulo') d.titulo = $('#cd-t', j).value.trim();
          else if (qual === 'obs') d.obs = $('#cd-o', j).value.trim();
          else { const v = $('#cd-dp', j).value.trim(), n = v ? parseInt(v, 10) : 0; if (v && !(n >= 0 && n <= 100)) { KitFacil.apontar($('#cd-dp', j)); return aviso('A porcentagem vai de 0 a 100.'); } d.descNome = $('#cd-dn', j).value.trim(); d.descPct = n || 0; d.desc = 0; }
          mudouDoc(d); return fecharJanela();
        } else return;
        mudouDoc(d); refaz();
      });
      j.addEventListener('change', e => { if (e.target.id === 'cd-f') { const v = deISO(e.target.value); if (v) { d.feito = v; tocarDoc(d); } } });
    } });
}
function janelaLinha(d, l, tipoNovo = '') {
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
      ${campo('ln-m', 'Motivo, se quiser mostrar ao cliente', entrada('ln-m', x.motivo || '', 'placeholder="Ex.: Forro baixo e fiação antiga"'))}`}`;
  janela({ titulo: tipo === 'diag' ? 'Diagnóstico por tempo' : tipo === 'desl' ? 'Deslocamento' : nova ? 'Linha avulsa' : 'Linha do documento',
    sub: tipo === 'diag' ? 'Para o defeito que você ainda não conhece: cobre pelo tempo.' : tipo === 'desl' ? 'Uma linha própria do documento, por ida.' : nova ? 'Um serviço ou material que não está nos seus preços.' : 'Vale só neste documento. Para mudar sempre, vá em Preços.',
    corpo, pe: `${nova ? '' : '<button type="button" class="kf-btn kf-perigo" data-tirar>Remover</button>'}<button type="button" class="kf-btn kf-pri" data-salvar>${nova ? 'Somar' : 'Salvar'}</button>`,
    aoMontar: j => {
      const cs = $('#ln-cs', j); if (cs) { cs.textContent = fraseCond(); $('#ln-p', j).addEventListener('input', () => { cs.textContent = fraseCond(); }); }
      j.addEventListener('click', e => { const b = e.target.closest('[data-cond]'); if (!b) return; cond = +b.dataset.cond; $('#ln-cd', j).innerHTML = segCond(); cs.textContent = fraseCond(); $(`[data-cond="${cond}"]`, j)?.focus({ preventScroll: true }); });
      $('[data-salvar]', j).onclick = () => {
        const q = Math.max(1, Math.min(9999, parseInt($('#ln-q', j)?.value, 10) || 1));
        let v;
        if (tipo === 'diag') v = { nome: $('#ln-n', j).value.trim() || 'Diagnóstico do defeito', min: +$('#ln-t', j).value || 60, pu: x.pu };
        else if (tipo === 'desl') {
          if (porKm) { const km = Math.max(0, parseInt($('#ln-k', j).value, 10) || 0), vkm = lerDinheiro($('#ln-vk', j)); if (!km) { KitFacil.apontar($('#ln-k', j)); return aviso('Escreva a distância, ida e volta.'); } v = { nome: x.nome, q, km, vkm, pu: Math.round(km * vkm) }; }
          else v = { nome: x.nome, q, km: 0, pu: lerDinheiro($('#ln-p', j)) };
        } else {
          const nome = $('#ln-n', j).value.trim(), base = lerDinheiro($('#ln-p', j));
          if (!nome) { KitFacil.apontar($('#ln-n', j)); return aviso('Escreva a descrição da linha.'); }
          v = { nome, q, un: $('#ln-u', j).value, pu: tipo === 'mat' ? base : Math.round(base * (100 + condPct(cond)) / 100) };
          if (tipo !== 'mat') Object.assign(v, { base, cond, motivo: $('#ln-m', j).value.trim() });
        }
        if (nova) d.linhas.push(acertaLinha({ id: uid(), pid: '', tipo, ...v })); else Object.assign(l, acertaLinha({ ...l, ...v }));
        mudouDoc(d); fecharJanela(); redesenhar();
      };
      $('[data-tirar]', j)?.addEventListener('click', () => {
        const i = d.linhas.indexOf(l); d.linhas.splice(i, 1); mudouDoc(d); fecharJanela(); redesenhar();
        aviso('Linha removida.', { label: 'Desfazer', run: () => { d.linhas.splice(i, 0, l); mudouDoc(d); redesenhar(); } });
      });
    } });
}

/* ---------- Somar: a lista de preços em blocos; cada toque soma um ---------- */
function janelaSomar(d) {
  let busca = '', cat = null;
  const qtd = p => soma(d.linhas.filter(l => l.pid === p.id).map(l => l.q));
  const linha = p => { const n = qtd(p); return `<div class="so-lin${n ? ' tem' : ''}"><span class="so-tx"><b>${esc(p.nome)}</b><small>${BRL(precoDe(p))} por ${unNome(p.un)}${p.fixo ? '' : ' · ' + tempoTxt(p.min)}</small></span>
      ${n ? `<button type="button" class="so-bt" data-tira="${esc(p.id)}" aria-label="Tirar um: ${esc(p.nome)}">${IC.menos}</button><b class="so-n num" aria-label="${n} no documento">${n}</b>` : ''}
      <button type="button" class="so-bt mais" data-soma="${esc(p.id)}" aria-label="Somar um: ${esc(p.nome)}">${IC.soma}</button></div>`; };
  const lista = L => `<div class="so-lista">${L.map(linha).join('')}</div>`;
  const diag = () => d.linhas.find(l => l.tipo === 'diag'), desl = () => d.linhas.find(l => l.tipo === 'desl');
  // o que não se cobra por serviço fica no alto: o diagnóstico, pelo tempo que levou, e o deslocamento, por ida
  const porTempo = () => { const g = diag(), i = desl(); return `<h3 class="sec">Por tempo e por ida</h3>
      <div class="cx tp"><div class="tp-l"><span class="lin-ic">${IC.relogio}</span><span class="lin-tx"><b>Diagnóstico do defeito</b><small>${g ? `${tempoTxt(g.min)} × ${BRL(g.pu)} a hora` : 'Pelo tempo que levou'}</small></span>${g ? `<b class="num">${BRL(totalLinha(g))}</b>` : ''}</div>
        ${segmento('Tempo do diagnóstico', 'diag', [[30, '30 min'], [60, '1 h'], [90, '1h30'], [120, '2 h'], ['x', 'Outro']], g ? ([30, 60, 90, 120].includes(g.min) ? g.min : 'x') : '')}</div>
      <div class="cx"><div class="so-lin${i ? ' tem' : ''}"><span class="so-tx"><b>Deslocamento</b><small>${i ? `${i.q} ${unTxt(i.q, 'ida')} · ${BRL(totalLinha(i))}` : ajustes.deslModo === 'km' ? `${BRL(ajustes.deslKm)} por km` : `${BRL(ajustes.deslIda)} por ida`}</small></span>
        ${i ? `<button type="button" class="so-bt" data-ida="-1" aria-label="Tirar uma ida">${IC.menos}</button><b class="so-n num" aria-label="${plural(i.q, 'ida', 'idas')}">${i.q}</b>` : ''}
        <button type="button" class="so-bt mais" data-ida="1" aria-label="Somar uma ida">${IC.soma}</button></div></div>`; };
  const conta2 = () => { const c = conta(d), n = soma(d.linhas.map(l => l.q)); return d.linhas.length ? `${plural(n, 'item', 'itens')} no documento · <b class="num">${BRL(c.sub)}</b>` : 'Toque num bloco e some com o +.'; };
  const corpo = () => {
    const q = dobra(busca);
    if (q) { const L = precos.filter(p => dobra(p.nome).includes(q)); return L.length ? lista(L) : `<p class="kf-ajuda">Nada com esse nome nos seus preços.</p>${KitFacil.ui.adicionar({ rotulo: 'Somar como linha avulsa', attrs: 'data-avulsa' })}`; }
    if (cat) { const c = cats.find(x => x.id === cat), L = precos.filter(p => p.cat === cat); return `<button type="button" class="so-volta" data-cats>${IC.voltar}<span>Categorias</span></button><h3 class="so-cat"><span class="bl-ic p">${picDe(c.icone)}</span>${esc(c.nome)}</h3>${L.length ? lista(L) : '<p class="kf-ajuda">Esta categoria ainda não tem preços. Cadastre em Preços.</p>'}`; }
    const U = maisUsados(4);
    return `${porTempo()}${U.length ? `<h3 class="sec">Mais usados por você</h3>${lista(U)}` : ''}
      <h3 class="sec">Categorias</h3>
      <div class="blocos p">${cats.map(c => { const n = soma(precos.filter(p => p.cat === c.id).map(qtd)); return `<button type="button" class="bloco" data-cat="${esc(c.id)}"><span class="bl-ic">${picDe(c.icone)}</span><b class="bl-nome">${esc(c.nome)}</b>${n ? `<span class="bl-selo num" aria-label="${n} no documento">${n}</span>` : ''}</button>`; }).join('')}</div>
      ${KitFacil.ui.adicionar({ rotulo: 'Linha avulsa', attrs: 'data-avulsa' })}`;
  };
  janela({ titulo: 'Somar serviço', alta: true, aoFechar: () => { salvarAjustes(); redesenhar(); },
    corpo: `<div class="busca"><span class="busca-ic">${IC.busca}</span><input id="so-q" class="kf-entrada" type="search" placeholder="Buscar serviço ou material" aria-label="Buscar nos seus preços"></div>
      <p class="so-conta" id="so-conta" role="status">${conta2()}</p><div id="so-corpo" class="pilha">${corpo()}</div>`,
    aoMontar: j => {
      const refaz = foco => { $('#so-corpo', j).innerHTML = corpo(); $('#so-conta', j).innerHTML = conta2(); if (foco) $(foco, j)?.focus({ preventScroll: true }); };
      $('#so-q', j).addEventListener('input', e => { busca = e.target.value; refaz(); });
      j.addEventListener('click', e => {
        const t = e.target; let b;
        if ((b = t.closest('[data-cat]'))) { cat = b.dataset.cat; refaz(); KitFacil.movimento.entrar($('#so-corpo', j), { de: 'lado' }); $('.kf-dlg-corpo', j)?.scrollTo(0, 0); return; }
        if (t.closest('[data-cats]')) { const era = cat; cat = null; refaz(`[data-cat="${era}"]`); return; }
        if (t.closest('[data-avulsa]')) { fecharJanela(true); salvarAjustes(); redesenhar(); return janelaLinha(d, null); }
        if ((b = t.closest('[data-diag]'))) {
          const v = b.dataset.diag, g = diag();
          if (v === 'x') { fecharJanela(true); salvarAjustes(); redesenhar(); return janelaLinha(d, g || null, 'diag'); }
          if (g && g.min === +v) d.linhas.splice(d.linhas.indexOf(g), 1); else if (g) g.min = +v; else d.linhas.unshift(acertaLinha({ tipo: 'diag', nome: 'Diagnóstico do defeito', min: +v, pu: HORA() }));
          mudouDoc(d); vibrar(); return refaz(`[data-diag="${v}"]`);
        }
        if ((b = t.closest('[data-ida]'))) {
          const i = desl(), n = +b.dataset.ida;
          if (!i) { if (ajustes.deslModo === 'km') { fecharJanela(true); salvarAjustes(); redesenhar(); return janelaLinha(d, null, 'desl'); } d.linhas.push(acertaLinha({ tipo: 'desl', nome: 'Deslocamento', q: 1, pu: ajustes.deslIda })); }
          else if (i.q + n < 1) d.linhas.splice(d.linhas.indexOf(i), 1); else i.q = Math.min(99, i.q + n);
          mudouDoc(d); vibrar(); return refaz('[data-ida="1"]');
        }
        if ((b = t.closest('[data-soma]'))) {
          const p = precos.find(x => x.id === b.dataset.soma); if (!p) return;
          const v = precoDe(p), l = d.linhas.find(x => x.pid === p.id && x.pu === v && !x.cond && x.nome === p.nome);
          if (l) l.q = Math.min(9999, l.q + 1); else d.linhas.push(acertaLinha({ pid: p.id, tipo: p.cat === CAT_MATERIAL ? 'mat' : '', nome: p.nome, un: p.un, q: 1, pu: v }));
          usar(p.id); mudouDoc(d); vibrar(); return refaz(`[data-soma="${p.id}"]`);
        }
        if ((b = t.closest('[data-tira]'))) {
          const L = d.linhas.filter(x => x.pid === b.dataset.tira), l = L[L.length - 1]; if (!l) return;
          if (l.q > 1) l.q--; else d.linhas.splice(d.linhas.indexOf(l), 1);
          mudouDoc(d); return refaz(`[data-soma="${b.dataset.tira}"]`);
        }
      });
    } });
}

/* ---------- Enviar: o nome do cliente só é pedido aqui (Código, Art. 64-D) ---------- */
function janelaEnviar(d) {
  const c = conta(d), rel = d.tipo === 'rel';
  janela({ titulo: rel ? 'Enviar relatório' : 'Enviar orçamento', sub: `${nomeDoc(d)} · ${BRL(c.total)}`,
    corpo: `${campo('ev-nome', 'Nome do cliente', entrada('ev-nome', d.cliente.nome, 'autocapitalize="words" placeholder="Ex.: Mariana Souza"'))}
      ${campo('ev-fone', 'WhatsApp do cliente', entrada('ev-fone', d.cliente.fone ? fone(d.cliente.fone) : '', 'inputmode="tel" placeholder="(11) 90000-0000"'), 'Opcional. Com ele, a mensagem já abre na conversa certa.')}
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

/* ================= Preços: um bloco por categoria (Código, Art. 71: 1. categoria, 2. item) ================= */
TELAS.precos = {
  html() {
    return `${barraTopo()}
    <main class="tela" id="conteudo">
      ${KitFacil.ui.cabecalho({ titulo: 'Preços', sub: 'A sua hora e a sua lista, em blocos. Toque num bloco para ver e mudar.' })}
      ${painelHora()}
      <div class="blocos">
        ${cats.map(c => { const n = precos.filter(p => p.cat === c.id).length; return `<button type="button" class="bloco" data-cat="${esc(c.id)}"><span class="bl-ic">${picDe(c.icone)}</span><b class="bl-nome">${esc(c.nome)}</b><small class="bl-n">${plural(n, 'preço', 'preços')}</small></button>`; }).join('')}
        <button type="button" class="bloco novo" data-nova-cat><span class="bl-ic">${IC.soma}</span><b class="bl-nome">Nova categoria</b><small class="bl-n">Monte o seu bloco</small></button>
      </div>
      <p class="kf-ajuda nota-pe">Os tempos e os preços que vêm com o app são só um ponto de partida. Ajuste para os seus.</p>
    </main>`;
  },
  ligar(el) {
    el.addEventListener('click', e => {
      if (e.target.closest('[data-hora]')) return janelaHora();
      const b = e.target.closest('[data-cat]'); if (b) return ir('/precos/' + b.dataset.cat);
      if (e.target.closest('[data-nova-cat]')) janelaCat(null);
    });
  },
};
TELAS.cat = {
  html(r) {
    const c = cats.find(x => x.id === r.id), L = precos.filter(p => p.cat === c.id);
    return `${barraInterna(c.nome, 'Preços')}
    <main class="tela doc-tela" id="conteudo">
      <header class="cat-cab"><span class="bl-ic g">${picDe(c.icone)}</span><div><h2 class="cat-nome">${esc(c.nome)}</h2><p class="kf-ajuda">${L.length ? `${plural(L.length, 'preço', 'preços')}. Toque para mudar o tempo ou o preço.` : 'Nenhum preço ainda.'}</p></div></header>
      ${c.id === CAT_MATERIAL ? '' : painelHora()}
      ${L.length ? `<div class="cx itens">${L.map(p => `<button type="button" class="item" data-preco="${esc(p.id)}"><span class="it-tx"><b>${esc(p.nome)}</b><small>${p.fixo ? 'Preço fixo' : tempoTxt(p.min)} · por ${unNome(p.un)}</small></span><b class="it-v num">${BRL(precoDe(p))}</b>${IC.seta}</button>`).join('')}</div>` : ''}
      ${KitFacil.ui.adicionar({ rotulo: 'Novo preço', attrs: 'data-novo-preco' })}
    </main>
    <div class="pe-tela"><div class="pe-in"><button type="button" class="kf-btn kf-sec pe-prox" data-editar-cat>${IC.lapis}Editar categoria</button></div></div>`;
  },
  ligar(el, r) {
    const c = cats.find(x => x.id === r.id);
    el.addEventListener('click', e => {
      const t = e.target; let b;
      if (t.closest('[data-voltar]')) return voltar('/precos');
      if (t.closest('[data-hora]')) return janelaHora();
      if ((b = t.closest('[data-preco]'))) return janelaPreco(c, precos.find(p => p.id === b.dataset.preco));
      if (t.closest('[data-novo-preco]')) return janelaPreco(c, null);
      if (t.closest('[data-editar-cat]')) return janelaCat(c);
    });
  },
};
// O item guarda o tempo típico; o preço é o tempo vezes a hora. Mudar o preço reescreve o tempo, e a ligação com a hora
// continua. Com a chave desligada, o preço é fixo. Material é sempre preço fixo.
function janelaPreco(c, p) {
  const novo = !p, mat = c.id === CAT_MATERIAL;
  const x = p ? { ...p } : { nome: '', un: 'un', min: mat ? 0 : 30, fixo: mat, preco: 0, reais: [] };
  const media = mediaReal(x), arred = v => Math.max(5, Math.min(6000, Math.round(v * 60 / HORA() / 5) * 5));
  const corpo = () => `${campo('pr-n', 'Nome do serviço ou material', entrada('pr-n', x.nome, 'placeholder="Ex.: Instalação de tomada"'))}
      ${campo('pr-u', 'Cobrado por', `<select id="pr-u" class="kf-entrada">${UNIDADES.filter(u => u[0] !== 'ida').map(([k, n]) => `<option value="${k}"${k === x.un ? ' selected' : ''}>${n}</option>`).join('')}</select>`)}
      ${mat ? '' : `<label class="aj-chave"><span class="aj-chave-tx"><b>Seguir a minha hora</b><small>Desligue para um preço fixo, que não muda com a hora.</small></span>${KitFacil.ui.chave({ attrs: 'id="pr-seg"', on: !x.fixo })}</label>`}
      ${x.fixo ? campo('pr-p', 'Preço', campoDinheiro('pr-p', x.preco), 'Preço fixo. Os documentos já feitos não mudam.')
      : `${campo('pr-t', 'Tempo típico', seletorTempo('pr-t', x.min, 720, 5))}
        ${media ? `<div class="tp-real"><span class="lin-tx"><b>O seu tempo real: ${tempoTxt(media)}</b><small>Média de ${plural(x.reais.length, 'serviço anotado', 'serviços anotados')}</small></span>${media !== x.min ? '<button type="button" class="kf-btn kf-sec kf-p" data-usar>Usar</button>' : ''}</div>` : ''}
        ${campo('pr-p', 'Preço', campoDinheiro('pr-p', precoDe(x)), `${tempoTxt(x.min)} × ${BRL(HORA())} a hora. Se você mudar o preço, o tempo acompanha.`)}`}`;
  janela({ titulo: novo ? 'Novo preço' : 'Preço', contexto: c.nome, corpo: `<div id="pr-corpo" class="pilha">${corpo()}</div>`,
    pe: `${novo ? '' : '<button type="button" class="kf-btn kf-perigo" data-tirar>Excluir</button>'}<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>`,
    aoMontar: j => {
      const guarda = () => { x.nome = $('#pr-n', j).value.trim(); x.un = $('#pr-u', j).value; const v = lerDinheiro($('#pr-p', j)); if (x.fixo) x.preco = v; else if (v !== precoDe(x) && v > 0) x.min = arred(v); };
      const refaz = foco => { const cx = $('#pr-corpo', j); cx.innerHTML = corpo(); prepararCampos(cx); if (foco) $(foco, j)?.focus({ preventScroll: true }); };
      j.addEventListener('change', e => {
        if (e.target.id === 'pr-seg') { guarda(); const v = precoDe(x); x.fixo = !e.target.checked; if (x.fixo) x.preco = v; else if (!x.min) x.min = x.preco ? arred(x.preco) : 30; refaz('#pr-seg'); }
        else if (e.target.id === 'pr-t') { x.nome = $('#pr-n', j).value.trim(); x.un = $('#pr-u', j).value; x.min = +e.target.value || x.min; refaz('#pr-t'); }
      });
      j.addEventListener('focusout', e => { if (e.target.id !== 'pr-p' || x.fixo) return; const v = lerDinheiro(e.target); if (v > 0 && v !== precoDe(x)) { guarda(); refaz(); } });
      j.addEventListener('click', e => { if (e.target.closest('[data-usar]')) { guarda(); x.min = media; refaz('#pr-t'); } });
      $('[data-salvar]', j).onclick = () => {
        guarda();
        if (!x.nome) { KitFacil.apontar($('#pr-n', j)); return aviso('Escreva o nome.'); }
        const v = acertaPreco({ id: p ? p.id : uid(), cat: c.id, nome: x.nome, un: x.un, min: x.min, fixo: x.fixo, preco: x.fixo ? x.preco : 0, reais: x.reais });
        if (novo) precos.push(v); else Object.assign(p, v);
        salvarPrecos(); fecharJanela(); redesenhar(); aviso(novo ? 'Preço cadastrado.' : 'Preço salvo.');
      };
      $('[data-tirar]', j)?.addEventListener('click', () => confirmar('Excluir este preço?', `"${p.nome}" sai da sua lista. Os documentos já feitos não mudam.`, 'Excluir preço', () => {
        const i = precos.indexOf(p); precos.splice(i, 1); salvarPrecos(); redesenhar();
        aviso('Preço excluído.', { label: 'Desfazer', run: () => { precos.splice(Math.min(i, precos.length), 0, p); salvarPrecos(); redesenhar(); } });
      }, { desfaz: 'Dá para desfazer logo depois.' }));
    } });
}
/* ---------- A hora: a base de todos os preços. Dois caminhos: digitar o valor ou descobrir pela conta do mês ---------- */
const painelHora = () => `<section class="painel hora-pn" aria-label="A sua hora"><span class="pn-rot">${ajustes.hora ? 'A sua hora' : 'Hora de exemplo'}</span><b class="pn-num num">${BRL(HORA())}</b><span class="pn-sub">${ajustes.hora ? 'Mudou a hora, mudam os preços ligados a ela.' : 'Diga a sua hora para os preços ficarem certos.'}</span><button type="button" class="pn-bt" data-hora>${ajustes.hora ? 'Mudar' : 'Informar a minha hora'}</button></section>`;
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
      <div class="kf-campo"><span class="kf-rotulo" id="ct-il">Ícone do bloco</span><div class="ic-grade" id="ct-ic" role="group" aria-labelledby="ct-il">${grade()}</div></div>`,
    pe: `${nova ? '' : '<button type="button" class="kf-btn kf-perigo" data-tirar>Excluir</button>'}<button type="button" class="kf-btn kf-pri" data-salvar>Salvar</button>`,
    aoMontar: j => {
      j.addEventListener('click', e => { const b = e.target.closest('[data-ic]'); if (!b) return; icone = b.dataset.ic; $('#ct-ic', j).innerHTML = grade(); $(`[data-ic="${icone}"]`, j)?.focus({ preventScroll: true }); });
      $('[data-salvar]', j).onclick = () => {
        const nome = $('#ct-n', j).value.trim();
        if (!nome) { KitFacil.apontar($('#ct-n', j)); return aviso('Escreva o nome da categoria.'); }
        if (nova) { const n = { id: 'c-' + uid(), nome, icone }; cats.push(n); salvarPrecos(); fecharJanela(true); ir('/precos/' + n.id); return aviso('Categoria criada. Cadastre os preços dela.'); }
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
