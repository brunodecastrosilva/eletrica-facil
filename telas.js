/* Elétrica Fácil · telas: Tabela (os preços) e Gestão (Início, Orçamentos, Conquistas e Mais ficam em inicio.js). */
'use strict';
/* ================= tela: tabela de preços ================= */
let priceKind = 'svc', priceQuery = '', priceCat = null;
// a mesma tabela do orçamento: lá, cada toque soma; aqui, cada toque abre o preço para mudar
const tbRow = (p, qf, comCat) => `<button type="button" class="tb-row" data-pid="${p.id}"><span class="tb-nome"><b>${hl(p.name, qf)}</b><small>por ${unitName(p.unit)}${comCat ? ` · ${esc(p.cat || 'Outros')}` : ''}${inStock(p) ? ` · ${stockTxt(p)}` : ''}</small></span><span class="tb-preco num">${p.ref ? refV(BRL(p.price)) : BRL(p.price)}</span><span class="lc" aria-hidden="true">${I.chev}</span></button>`;
const priceCats = () => groupByCat(prices.filter(p => p.kind === priceKind)).map(g => g[0]);
function priceTiraHTML() {
  const cats = priceCats(); if (priceCat === null || !cats.includes(priceCat)) priceCat = cats[0] || '';
  return cats.map(c => `<button type="button" data-cat="${esc(c)}" aria-pressed="${priceCat === c}">${esc(c)}</button>`).join('');
}
function priceListHTML() {
  const qf = fold(priceQuery);
  if (qf) {
    const L = prices.filter(p => p.kind === priceKind && (fold(p.name).includes(qf) || fold(p.cat).includes(qf))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
    return L.length ? L.map(p => tbRow(p, qf, true)).join('') : KitFacil.ui.vazio({ titulo: 'Nenhum item encontrado', texto: 'Confira o nome do item ou da categoria.' });
  }
  const cats = priceCats(); if (priceCat === null || !cats.includes(priceCat)) priceCat = cats[0] || '';
  const L = prices.filter(p => p.kind === priceKind && (p.cat || 'Outros') === priceCat).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
  return L.length ? L.map(p => tbRow(p, '', false)).join('') : KitFacil.ui.vazio({ titulo: 'Nenhum item nesta tabela', texto: 'Toque em <b>Novo preço</b> para cadastrar.' });
}
// quantos preços já são de quem usa: os que vêm com o app (em cinza) são só ilustrativos
function priceMeusHTML() {
  const L = prices.filter(p => p.kind === priceKind), meus = L.filter(p => !p.ref).length;
  if (!L.length) return '';
  return `<section class="tb-meus" aria-label="Preços definidos por você"><div class="tb-meus-t"><b class="num">${meus} de ${L.length}</b><span>${meus === L.length ? 'Todos os preços são seus.' : 'preços já são seus. Os em cinza vêm com o app.'}</span></div>
    <div class="g-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${L.length}" aria-valuenow="${meus}" aria-label="Preços definidos por você"><span style="width:${Math.round(meus / L.length * 100)}%"></span></div></section>`;
}
VIEWS.prices = {
  html() {
    const n = k => prices.filter(p => p.kind === k).length;
    return `${barraTopo()}
    <main class="page tabela">
      ${KitFacil.ui.cabecalho({ titulo: 'Tabela' })}
      ${KitFacil.ui.abas({ itens: [['svc', 'Mão de obra', n('svc')], ['mat', 'Material', n('mat')]], atual: priceKind, rotulo: 'Tipo de preço', dado: 'k' })}
      <div id="pr-meus">${priceMeusHTML()}</div>
      <label class="search">${I.search}<input type="search" id="pr-q" placeholder="Buscar item ou categoria" value="${esc(priceQuery)}" aria-label="Buscar na tabela"></label>
      <div class="tira" id="pr-tira" role="group" aria-label="Categoria"${priceQuery.trim() ? ' hidden' : ''}>${priceTiraHTML()}</div>
      <div id="pr-list" class="tb-lista">${priceListHTML()}</div>
      ${KitFacil.ui.adicionar({ rotulo: 'Novo preço', attrs: 'data-new-price' })}
      ${prices.length ? `<button class="pr-ajuste" data-adjust>${I.percent}<span class="lt"><b>Reajustar preços</b></span>${I.chev}</button>` : ''}
      ${prices.some(p => p.ref) ? `<aside class="pr-aviso" role="note" aria-label="Sobre os preços em cinza">
        <p><b>Atenção: os preços em cinza são apenas valores ilustrativos.</b> Eles são fornecidos exclusivamente como referência inicial para configurar o aplicativo. Não representam preços de mercado, não constituem recomendações comerciais e não foram definidos com base em pesquisas de preços.</p>
        <p>Você é o responsável por definir seus preços. Antes de elaborar qualquer orçamento, ajuste os valores conforme seus custos, sua região e as características do serviço.</p>
        <p>Ao personalizar um preço, ele passa de cinza para preto, indicando que foi definido por você.</p></aside>` : ''}
    </main>`;
  },
  bind(v) {
    $$('[data-k]', v).forEach(b => b.onclick = () => { priceKind = b.dataset.k; priceCat = null; rerender(); });
    const sq = $('#pr-q', v); sq.addEventListener('input', () => { priceQuery = sq.value; $('#pr-tira', v).hidden = !!priceQuery.trim(); $('#pr-list').innerHTML = priceListHTML(); });
    $('#pr-tira', v).addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; priceCat = b.dataset.cat; $('#pr-tira', v).innerHTML = priceTiraHTML(); $('#pr-list').innerHTML = priceListHTML(); });
    $('#pr-list', v).addEventListener('click', e => {
      const b = e.target.closest('[data-pid]'); if (b) priceSheet(prices.find(p => p.id === b.dataset.pid));
    });
    $('[data-new-price]', v).onclick = () => priceSheet(null);
    $('[data-adjust]', v).onclick = adjustSheet;
  },
};
function compEditorHTML(it) {
  const C = it.comp || [], mats = prices.filter(x => x.kind === 'mat' && !C.some(c => norm(c.n) === norm(x.name))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
  return `<div class="field"><span class="lab">Material que costuma ir, por ${esc(unitName(it.unit || 'un'))}</span>
    ${C.length ? `<div class="sug-list">${C.map((c, k) => { const m = prices.find(x => x.kind === 'mat' && norm(x.name) === norm(c.n)); return `<div class="sug-row"><span class="sug-n">${esc(c.n)}${m ? '' : '<small>Fora da tabela de material</small>'}</span><input type="text" inputmode="decimal" class="sug-q" data-cq="${k}" value="${fmtQty(c.q)}" aria-label="Quantidade de ${esc(c.n)}"><span class="sug-u">${m ? unitTxt(c.q, m.unit) : ''}</span><button type="button" class="icon-btn" data-crm="${k}" aria-label="Tirar ${esc(c.n)}">${I.x}</button></div>`; }).join('')}</div>` : '<p class="hint">Nenhum. Com material aqui, o app sugere a lista ao adicionar o serviço num orçamento.</p>'}
    <select id="pp-comp-add" aria-label="Incluir material"><option value="">Incluir material…</option>${mats.map(m => `<option>${esc(m.name)}</option>`).join('')}</select></div>`;
}
function priceSheet(p) {
  const isNew = !p;
  const it = p ? { ...p, comp: (p.comp || []).map(c => ({ ...c })) } : { kind: priceKind, cat: '', name: '', unit: 'un', price: 0, comp: [] };
  // mesmo padrão do estoque e das ferramentas: 1. categoria, 2. o item
  const cats = k => { const o = catOrder(k); return [...new Set(prices.filter(x => x.kind === k).map(x => x.cat || 'Outros'))].sort((a, b) => { const ia = o.indexOf(a), ib = o.indexOf(b); return (ia < 0 ? 98 : ia) - (ib < 0 ? 98 : ib) || a.localeCompare(b, 'pt-BR'); }); };
  const catOpts = k => `${isNew ? '<option value="" hidden>Escolha a categoria</option>' : ''}${cats(k).map(c => `<option ${c === it.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}<option value="__nova">Nova categoria…</option>`;
  // preço novo: 1. categoria, 2. item (Código, Art. 71). Preço que já existe: abre no que mais se muda, o valor
  const pTipo = `      <div class="seg" role="group" aria-label="Tipo"><button data-ik="svc" aria-pressed="${it.kind === 'svc'}">Mão de obra</button><button data-ik="mat" aria-pressed="${it.kind === 'mat'}">Material</button></div>`;
  const pCat = `      <div class="field"><label for="pp-cat-sel">${isNew ? '1. Categoria' : 'Categoria'}</label><select id="pp-cat-sel">${catOpts(it.kind)}</select>
        <input id="pp-cat" type="text" placeholder="Nome da nova categoria" aria-label="Nome da nova categoria" autocomplete="off" hidden></div>`;
  const pNome = `      <div class="field"><label for="pp-name">${isNew ? '2. Descrição' : 'Descrição'}</label><input id="pp-name" type="text" value="${esc(it.name)}" placeholder="Ex.: Instalação de chuveiro elétrico"></div>`;
  const pValor = `      <div class="grid2 pp-valor">
        <div class="field"><label for="pp-price">Preço</label><input id="pp-price" type="text" inputmode="numeric" data-money placeholder="R$ 0,00" value="${it.price ? BRL(it.price) : ''}"></div>
        <div class="field"><label for="pp-unit">Cobrado por</label><select id="pp-unit">${UNITS.map(([u, l]) => `<option value="${esc(u)}" ${u === it.unit ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </div>`;
  openSheet({ title: isNew ? 'Novo preço' : 'Alterar preço', body: isNew ? `
${pTipo}
${pCat}
      <div class="st-resto" id="pp-resto" hidden>
${pNome}
${pValor}
      </div>` + `
` : `
      <div class="st-resto" id="pp-resto">
${pValor}
${pNome}
      </div>
${pCat}
${pTipo}` + `
      <div id="pp-comp" ${it.kind === 'svc' ? '' : 'hidden'}>${compEditorHTML(it)}</div>
      ${p && inStock(p) ? `<p class="hint">No estoque: ${fmtQty(p.stock)} ${unitTxt(p.stock, p.unit)}${p.cost ? `, custo ${BRL(p.cost)}` : ''}. O preço daqui é o repasse ao cliente. Altere a quantidade e o custo em Gestão.</p>` : ''}`,
    foot: isNew ? `<button class="btn ghost" data-cancel>Cancelar</button><button class="btn primary" data-save>${I.plus}Adicionar</button>` : `<button class="btn danger-text" data-del>${I.trash}Excluir</button><button class="btn primary" data-save>Salvar</button>`,
    onMount: s => {
      const cs = $('#pp-cat-sel', s), cn = $('#pp-cat', s);
      cs.addEventListener('change', () => { const nv = cs.value === '__nova'; cn.hidden = !nv; $('#pp-resto', s).hidden = !cs.value; });
      $$('[data-ik]', s).forEach(b => b.onclick = () => { it.kind = b.dataset.ik; $$('[data-ik]', s).forEach(x => x.setAttribute('aria-pressed', x === b)); cs.innerHTML = catOpts(it.kind); cs.dispatchEvent(new Event('change')); $('#pp-comp', s).hidden = it.kind !== 'svc'; });
      // composição (F5): material por unidade do serviço
      const compArea = $('#pp-comp', s), pintaComp = () => { compArea.innerHTML = compEditorHTML(it); };
      compArea.addEventListener('click', e => { const rm = e.target.closest('[data-crm]'); if (rm) { it.comp.splice(+rm.dataset.crm, 1); pintaComp(); } });
      compArea.addEventListener('change', e => {
        const qi = e.target.closest('[data-cq]'); if (qi) { const v = parseQty(qi.value); if (v) it.comp[+qi.dataset.cq].q = v; qi.value = fmtQty(it.comp[+qi.dataset.cq].q); }
        const ad = e.target.closest('#pp-comp-add'); if (ad && ad.value) { it.comp = [...(it.comp || []), { n: ad.value, q: 1 }]; pintaComp(); }
      });
      $('[data-cancel]', s)?.addEventListener('click', () => closeSheet());
      $('[data-del]', s)?.addEventListener('click', () => {
        const idx = prices.findIndex(x => x.id === p.id); if (idx < 0) return;
        const [gone] = prices.splice(idx, 1); savePrices(); closeSheet(true); rerender();
        toast(`${gone.name} excluído da tabela.`, { label: 'Desfazer', run: () => { prices.splice(idx, 0, gone); savePrices(); rerender(); } });
      });
      $('[data-save]', s).onclick = () => {
        const name = $('#pp-name', s).value.trim().replace(/\s+/g, ' '), price = parseMoney($('#pp-price', s).value);
        const cat = cs.value === '__nova' ? cn.value.trim().replace(/\s+/g, ' ') : cs.value;
        if (!cat) return toast(cs.value === '__nova' ? 'Escreva o nome da nova categoria.' : 'Escolha a categoria.');
        if (!name) return toast('Escreva a descrição do item.');
        if (price === null) return toast('Informe o preço.');
        const data = { kind: it.kind, name, price, unit: $('#pp-unit', s).value, cat, comp: it.kind === 'svc' ? (it.comp || []).filter(c => c.n && c.q > 0) : undefined };
        if (!data.comp || !data.comp.length) delete data.comp;
        const mudou = !isNew && p.price !== price;
        if (isNew) prices.push({ id: uid(), ...data }); else { Object.assign(p, data); if (mudou) p.ref = false; }
        savePrices(); priceKind = it.kind; closeSheet(true); rerender(); toast(isNew ? `${name} adicionado.` : mudou ? 'Preço salvo e conferido.' : 'Item salvo.');
      };
    } });
}
function adjustSheet() {
  let scope = priceKind, pct = 10;
  const affected = () => prices.filter(p => scope === 'all' || p.kind === scope);
  const nv = p => Math.round(p.price * (1 + pct / 100));
  const prev = () => affected().slice(0, 3).map(p => `<div class="vrow"><span style="font-size:14.5px">${esc(p.name)}</span><b>${BRL(p.price)} → ${BRL(nv(p))}</b></div>`).join('');
  openSheet({ title: 'Reajustar preços', body: `
      <p class="hint">Aumenta ou diminui, com sinal de menos, todos os preços de uma vez. Bom para acompanhar a inflação ou o aumento do material.</p>
      <div class="seg" role="group" aria-label="Quais preços"><button data-sc="svc" aria-pressed="${scope === 'svc'}">Mão de obra</button><button data-sc="mat" aria-pressed="${scope === 'mat'}">Material</button><button data-sc="all" aria-pressed="false">Todos</button></div>
      <div class="field"><label for="aj-pct">Percentual</label><div class="stepper" style="width:100%"><button data-ap="-1" aria-label="Menos">${I.minus}</button><input id="aj-pct" type="text" inputmode="decimal" value="10%" style="flex:1;width:auto"><button data-ap="1" aria-label="Mais">${I.plus}</button></div></div>
      <div><span class="lab">Como fica</span><div class="vrows" id="aj-prev">${prev()}</div></div>`,
    foot: `<button class="btn primary" data-go>Reajustar <span id="aj-n">${affected().length}</span> preços</button>`,
    onMount: s => {
      const inp = $('#aj-pct', s);
      const paint = () => { $('#aj-prev', s).innerHTML = prev(); $('#aj-n', s).textContent = affected().length; };
      const readPct = () => { const neg = /-/.test(inp.value); const v = parseQty(inp.value.replace('-', '').replace('%', '')) || 0; pct = Math.max(-90, Math.min(300, neg ? -v : v)); };
      inp.addEventListener('input', () => { readPct(); paint(); });
      inp.addEventListener('change', () => { inp.value = fmtQty(pct) + '%'; });
      $$('[data-ap]', s).forEach(b => b.onclick = () => { pct = Math.max(-90, Math.min(300, Math.round(pct + +b.dataset.ap))); inp.value = fmtQty(pct) + '%'; paint(); });
      $$('[data-sc]', s).forEach(b => b.onclick = () => { scope = b.dataset.sc; $$('[data-sc]', s).forEach(x => x.setAttribute('aria-pressed', x === b)); paint(); });
      $('[data-go]', s).onclick = () => {
        if (!pct) return toast('Escolha um percentual diferente de zero.');
        const before = prices.map(p => ({ id: p.id, price: p.price }));
        const refs = affected().filter(p => p.ref).map(p => p.id);
        affected().forEach(p => { p.price = nv(p); p.ref = false; }); savePrices(); closeSheet(true); rerender();
        toast(`Preços reajustados em ${fmtQty(pct)}%.`, { label: 'Desfazer', run: () => { before.forEach(b => { const p = prices.find(x => x.id === b.id); if (p) { p.price = b.price; if (refs.includes(p.id)) p.ref = true; } }); savePrices(); rerender(); } });
      };
    } });
}

/* ================= tela: gestão (estoque, ferramentas e checklist) ================= */
// estoque = materiais da tabela de preços com quantidade guardada; o preço de repasse é o próprio preço da tabela
let gestaoAba = 'estoque', gestaoQuery = '', checkLado = 'ida';
const GESTAO = {
  estoque: { nome: 'Materiais', criar: 'Novo material', sub: 'O que você tem em estoque, o que precisa repor e o catálogo de materiais.' },
  ferramentas: { nome: 'Ferramentas', criar: 'Nova ferramenta', sub: 'As suas ferramentas, as que quer comprar e o catálogo.' },
  checklist: { nome: 'Checklist', criar: 'Novo item', sub: 'Confira o que levar antes de ir e o que trazer antes de voltar da obra.' },
};
// o alto de cada parte da Gestão: o filtro (com as contagens) e a lista de compras. Nada de quadrinhos lado a lado com dados (Código, Art. 67)
function gHero(attr, L, atual, n, topo = '', compras = true) {
  const cn = comprasN();
  return `<section class="g-topo" aria-label="Resumo">
    <div class="seg filtro g-seg" role="group" aria-label="Mostrar">${L.map(([k, l]) => `<button type="button" ${attr}="${k}" aria-pressed="${atual === k}"><span>${capFirst(l)}</span><b class="num">${n(k)}</b></button>`).join('')}</div>
    ${topo ? `<p class="g-custo">${topo}</p>` : ''}
    ${compras ? `<button type="button" class="g-cp" data-compras>${I.cart}<span class="lt"><b>Lista de compras</b><small>${cn ? plural(cn, 'item', 'itens') : 'vazia'}</small></span>${I.chev}</button>` : ''}</section>`;
}
const margem = p => p.cost > 0 ? Math.round((p.price - p.cost) / p.cost * 100) : null;
const margemTxt = p => { const m = margem(p); return m === null ? '' : m >= 0 ? `margem +${m}%` : `abaixo do custo, ${m}%`; };
// materiais: três listas, como em Ferramentas — Em estoque (o que você tem, por marca), Repor (chegou ao mínimo ou
// marcado como Preciso repor) e Catálogo (todos os materiais da tabela de Preços). Cada linha abre a caixa do material.
let matFiltro = '';
const MAT_FILTROS = [['estoque', 'em estoque'], ['repor', 'repor'], ['catalogo', 'catálogo']];
const precisaRepor = p => p.kind === 'mat' && (stockLow(p) || !!p.repor);
const lotesTxt = p => (p.lotes || []).map(l => `${l.brand || 'Sem marca'}: ${fmtQty(l.qty)} ${unitTxt(l.qty, p.unit)}`).join(' · ');
function stockListHTML() {
  const mats = prices.filter(p => p.kind === 'mat'), est = mats.filter(inStock), rep = mats.filter(precisaRepor);
  const n = { estoque: est.length, repor: rep.length, catalogo: mats.length };
  const f = matFiltro || (est.length ? 'estoque' : 'catalogo');
  const qf = fold(gestaoQuery);
  const bate = p => !qf || fold([p.name, p.cat, ...(p.lotes || []).map(l => l.brand)].join(' ')).includes(qf);
  let topo = '';
  const busca = `<label class="search">${I.search}<input type="search" id="g-q" placeholder="Buscar material, marca ou categoria" value="${esc(gestaoQuery)}" aria-label="Buscar material"></label>`;
  if (est.length) {
    const custo = sum(est.map(p => sum((p.lotes || []).map(l => Math.round(l.qty * (l.cost || 0)))))), repasse = sum(est.map(p => Math.round(p.price * p.stock)));
    topo = `${BRL(custo)} de custo · ${BRL(repasse)} no repasse`;
  }
  const chips = gHero('data-mf', MAT_FILTROS, f, k => n[k], topo);
  const L = (f === 'estoque' ? est : f === 'repor' ? rep : mats).filter(bate);
  const linha = p => {
    let sub = '', dir = '';
    let subH = '';
    if (f === 'catalogo') { subH = `repasse ${p.ref ? refV(BRL(p.price)) : BRL(p.price)} por ${esc(unitName(p.unit))}`; dir = inStock(p) ? `<span class="t-tem">${I.check}${fmtQty(p.stock)}</span>` : p.repor ? `<span class="t-quero">${I.cart}</span>` : ''; }
    else if (f === 'repor') { sub = p.repor && !stockLow(p) ? `marcado para repor ${fmtQty(p.reporQtd || 1)} ${unitTxt(p.reporQtd || 1, p.unit)}` : p.stock <= 0 ? 'em falta' : `tem ${fmtQty(p.stock)}${p.min ? `, mínimo ${fmtQty(p.min)}` : ''}`; dir = `<span class="g-zero">${I.warn}</span>`; }
    else { sub = lotesTxt(p) || 'Sem marca'; dir = p.stock <= 0 ? `<span class="g-zero">${I.warn}Em falta</span>` : `<span class="${stockLow(p) ? 'g-zero' : ''}">${stockLow(p) ? I.warn : ''}${fmtQty(p.stock)} ${unitTxt(p.stock, p.unit)}</span>`; }
    return `<button class="prow" data-mat="${p.id}"><span><b>${hl(p.name, qf)}</b><small>${subH || esc(sub)}</small></span><span class="prow-price">${dir}</span></button>`;
  };
  // categorias recolhíveis, como em Preços: abertas no estoque e em Repor, fechadas no catálogo (na busca, todas abertas)
  const lista = L.length ? groupByCat(L).map(([cat, M]) => panel(`g:mat:${f}:${cat}`, '', esc(cat), qf ? null : M.slice(0, 3).map(p => p.name).join(' · ') + (M.length > 3 ? '…' : ''),
      `<div class="plist">${M.map(linha).join('')}</div>`, { right: `<span class="card-sum">${M.length}</span>`, force: qf ? true : undefined })).join('')
    : KitFacil.ui.vazio(qf ? { titulo: 'Nenhum material encontrado', texto: 'Confira o nome, a marca ou a categoria.' }
      : f === 'estoque' ? { titulo: 'Nenhum material em estoque', texto: 'Toque em <b>Novo material</b>, ou abra um no <b>Catálogo</b> e diga quanto você tem.', icone: I.box }
      : f === 'repor' ? { titulo: 'Nada para repor', texto: 'Aqui entram o material que chegou ao mínimo e o que você marcar como Preciso repor.', icone: I.cart }
      : { titulo: 'Nenhum material no catálogo', texto: 'Toque em <b>Novo material</b> para cadastrar.', icone: I.box });
  return chips + busca + `<div id="g-list" class="g-list">${lista}</div>`;
}
const margemHTML = (cost, price) => {
  if (!cost || price === null) return '<span class="hint">Com o custo e o repasse, o app mostra a sua margem.</span>';
  const m = Math.round((price - cost) / cost * 100);
  return m >= 0 ? `${I.check}<span>Margem de <b>${m}%</b>: ${BRL(price - cost)} por unidade.</span>` : `${I.warn}<span><b>Repasse abaixo do custo.</b> Você perde ${BRL(cost - price)} por unidade.</span>`;
};
// caixa do material: as marcas que você tem, o repasse, o mínimo e a lista de compras
function matSheet(p) {
  if (!p) return;
  const corpo = () => {
    const L = p.lotes || [], tem = inStock(p);
    const cats = (() => { const o = catOrder('mat'); return [...new Set(prices.filter(x => x.kind === 'mat').map(x => x.cat || 'Outros'))].sort((a, b) => { const ia = o.indexOf(a), ib = o.indexOf(b); return (ia < 0 ? 98 : ia) - (ib < 0 ? 98 : ib) || a.localeCompare(b, 'pt-BR'); }); })();
    // nome, categoria e unidade: editáveis também nos itens que vêm com o app
    return `${panel(`mt:${p.id}:dados`, 'mt-dados', 'Nome, categoria e unidade', `${p.cat || 'Outros'} · por ${unitName(p.unit)}`, `<div class="stack14">
        <div class="field"><label for="mt-name">Nome do material</label><input id="mt-name" type="text" value="${esc(p.name)}" autocomplete="off"></div>
        <div class="field"><label for="mt-cat">Categoria</label><select id="mt-cat">${cats.map(c => `<option ${c === (p.cat || 'Outros') ? 'selected' : ''}>${esc(c)}</option>`).join('')}<option value="__nova">Nova categoria…</option></select>
          <input id="mt-cat-n" type="text" placeholder="Nome da nova categoria" aria-label="Nome da nova categoria" autocomplete="off" hidden></div>
        <div class="field"><label for="mt-unit">Cobrado por</label><select id="mt-unit">${UNITS.map(([u, l]) => `<option value="${esc(u)}" ${u === p.unit ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </div>`)}
      ${panel(`mt:${p.id}:est`, '', 'Em estoque', tem ? resumoDe(L, l => `${l.brand || 'Sem marca'} ${fmtQty(l.qty)}`) : 'Nada no estoque', `${L.length ? `<div class="plist">${L.map(l => `<button class="prow" data-lote="${l.id}"><span><b>${esc(l.brand || 'Sem marca')}</b><small>${l.cost ? `custo ${BRL(l.cost)}` : 'sem custo'}</small></span><span class="prow-price${l.qty <= 0 ? ' g-zero' : ''}">${fmtQty(l.qty)} ${unitTxt(l.qty, p.unit)}</span></button>`).join('')}</div>` : '<p class="hint">Você ainda não tem este material no estoque.</p>'}
      <button class="add-btn" data-novo-lote>${I.plus}${L.length ? 'Adicionar outra marca' : 'Tenho este material'}</button>`, { right: tem ? `${fmtQty(p.stock)} ${unitTxt(p.stock, p.unit)}` : conta(0) })}
      <div class="grid2">
        <div class="field"><label for="mt-price">Repasse ao cliente por ${unitName(p.unit)}</label><input id="mt-price" type="text" inputmode="numeric" data-money value="${BRL(p.price)}"></div>
        <div class="field"><label for="mt-min">Avisar quando chegar a <span class="lab-opt">opcional</span></label><input id="mt-min" type="text" inputmode="decimal" placeholder="Ex.: 10" value="${p.min ? fmtQty(p.min) : ''}"></div>
      </div>
      <p class="g-margin" id="mt-margin" aria-live="polite">${margemHTML(p.cost || 0, p.price)}</p>
      <p class="hint">O repasse é o preço deste material na Tabela e nos orçamentos.${stockLow(p) ? ' Chegou ao mínimo: já está em Repor.' : ''}</p>
      <label class="switch-row" for="mt-repor"><span><b>Preciso repor</b><small>Entra na lista de compras${stockLow(p) ? ', além do aviso de mínimo' : ''}.</small></span><input type="checkbox" class="sw" id="mt-repor" ${p.repor ? 'checked' : ''}></label>
      <div class="field" id="mt-rq-f" ${p.repor || stockLow(p) ? '' : 'hidden'}><label for="mt-rq">Quanto quer comprar</label><div class="tp-qq-row"><div class="stepper"><button data-rq="-1" aria-label="Menos">${I.minus}</button><input id="mt-rq" type="text" inputmode="decimal" value="${fmtQty(p.reporQtd || sugestaoCompra(p))}"><button data-rq="1" aria-label="Mais">${I.plus}</button></div><button class="btn primary" data-comprei-mat>${I.check}Comprei</button></div></div>`;
  };
  openSheet({ title: p.name, body: `<div id="mt-corpo" class="tp-corpo">${corpo()}</div>`,
    foot: `${inStock(p) ? `<button class="btn danger-text block" data-del>${I.trash}Tirar do estoque</button>` : ''}`,
    onClose: () => rerender(),
    onMount: s => {
      s.addEventListener('click', e => {
        const lt = e.target.closest('[data-lote]'); if (lt) return loteSheet(p, (p.lotes || []).find(l => l.id === lt.dataset.lote));
        if (e.target.closest('[data-novo-lote]')) return loteSheet(p, null);
        if (e.target.closest('[data-comprei-mat]')) return loteSheet(p, null, parseQty($('#mt-rq', s).value) || 1);
        const rq = e.target.closest('[data-rq]'); if (rq) { p.reporQtd = Math.max(1, Math.round(((parseQty($('#mt-rq', s).value) || 1) + +rq.dataset.rq) * 100) / 100); $('#mt-rq', s).value = fmtQty(p.reporQtd); savePrices(); }
      });
      s.addEventListener('input', e => {
        if (e.target.id === 'mt-price') { const v = parseMoney(e.target.value); if (v !== null) { if (v !== p.price) p.ref = false; p.price = v; savePrices(); $('#mt-margin', s).innerHTML = margemHTML(p.cost || 0, p.price); } }
        if (e.target.id === 'mt-min') { p.min = Math.max(0, parseQty(e.target.value) || 0); savePrices(); }
      });
      const resumoDados = () => { const sm = $('[data-sum="mt-dados"]', s); if (sm) sm.textContent = `${p.cat || 'Outros'} · por ${unitName(p.unit)}`; };
      s.addEventListener('change', e => {
        if (e.target.id === 'mt-name') {
          const nn = e.target.value.trim().replace(/\s+/g, ' ');
          if (!nn) { e.target.value = p.name; return toast('Escreva o nome do material.'); }
          if (prices.some(x => x !== p && x.kind === 'mat' && norm(x.name) === norm(nn))) { e.target.value = p.name; return toast('Já existe um material com esse nome.'); }
          p.name = nn; savePrices(); const tt = $('.kf-dlg-tt'); if (tt) tt.textContent = nn; toast('Nome salvo.');
        }
        if (e.target.id === 'mt-cat') {
          const cn = $('#mt-cat-n', s), nv = e.target.value === '__nova'; cn.hidden = !nv;
          if (nv) return;
          p.cat = e.target.value; savePrices(); resumoDados(); toast('Categoria salva.');
        }
        if (e.target.id === 'mt-cat-n') { const c = e.target.value.trim().replace(/\s+/g, ' '); if (!c) return; p.cat = c; savePrices(); resumoDados(); toast('Categoria salva.'); }
        if (e.target.id === 'mt-unit') { p.unit = e.target.value; savePrices(); resumoDados(); const lb = $('label[for="mt-price"]', s); if (lb) lb.textContent = 'Repasse ao cliente por ' + unitName(p.unit); toast('Unidade salva.'); }
        if (e.target.id === 'mt-repor') { p.repor = e.target.checked; if (p.repor && !p.reporQtd) p.reporQtd = sugestaoCompra(p); $('#mt-rq-f', s).hidden = !(p.repor || stockLow(p)); savePrices(); toast(p.repor ? `${p.name} na lista de compras.` : `${p.name} saiu da lista de compras.`); }
        if (e.target.id === 'mt-rq') { p.reporQtd = Math.max(1, parseQty(e.target.value) || 1); e.target.value = fmtQty(p.reporQtd); savePrices(); }
        if (e.target.id === 'mt-min' || e.target.id === 'mt-price') toast('Salvo.');
      });
      $('[data-del]', s)?.addEventListener('click', () => {
        const antes = JSON.stringify(p);
        delete p.lotes; delete p.stock; delete p.cost; delete p.brand; savePrices(); closeSheet(true); rerender();
        toast(`${p.name} saiu do estoque. Continua no catálogo.`, { label: 'Desfazer', run: () => { Object.assign(p, JSON.parse(antes)); savePrices(); rerender(); } });
      });
    } });
}
// uma marca do material: quantidade e custo. comprar = veio de Comprei (soma a compra e tira da lista de compras)
function loteSheet(p, lote, comprar) {
  const isNew = !lote;
  const x = lote ? { ...lote } : { brand: '', qty: comprar || 1, cost: 0 };
  openSheet({ title: comprar ? 'Comprei' : isNew ? (inStock(p) ? 'Outra marca' : 'Tenho este material') : 'Marca no estoque', body: `
      <p class="hint"><b>${esc(p.name)}</b>${comprar ? '. A quantidade entra no estoque e o material sai da lista de compras.' : ''}</p>
      <div class="field"><label for="lt-brand">Marca <span class="lab-opt">opcional</span></label><input id="lt-brand" type="text" value="${esc(x.brand)}" placeholder="Ex.: Steck" autocomplete="off"></div>
      <div class="grid2">
        <div class="field"><label for="lt-qty">${comprar ? 'Quantidade comprada' : 'Quantidade'}, em ${unitName(p.unit)}</label><div class="stepper" style="width:100%"><button data-lq="-1" aria-label="Menos">${I.minus}</button><input id="lt-qty" type="text" inputmode="decimal" value="${fmtQty(x.qty)}" style="flex:1;width:auto"><button data-lq="1" aria-label="Mais">${I.plus}</button></div></div>
        <div class="field"><label for="lt-cost">Custo por ${unitName(p.unit)}</label><input id="lt-cost" type="text" inputmode="numeric" data-money placeholder="R$ 0,00" value="${x.cost ? BRL(x.cost) : ''}"></div>
      </div>
      <p class="g-margin" id="lt-margin" aria-live="polite">${margemHTML(x.cost, p.price)}</p>`,
    foot: isNew ? `<button class="btn ghost" data-cancel>Voltar</button><button class="btn primary" data-save>${comprar ? I.check + 'Confirmar compra' : I.plus + 'Adicionar'}</button>` : `<button class="btn danger-text" data-del>${I.trash}Não tenho mais</button><button class="btn primary" data-save>Salvar</button>`,
    onClose: () => rerender(),
    onMount: s => {
      attachSuggest($('#lt-brand', s), () => [...new Set(prices.flatMap(y => (y.lotes || []).map(l => l.brand)).filter(Boolean))].map(b => ({ label: b })));
      $('#lt-cost', s).addEventListener('input', () => { $('#lt-margin', s).innerHTML = margemHTML(parseMoney($('#lt-cost', s).value) || 0, p.price); });
      $$('[data-lq]', s).forEach(b => b.onclick = () => { $('#lt-qty', s).value = fmtQty(Math.max(0, Math.round(((parseQty($('#lt-qty', s).value) || 0) + +b.dataset.lq) * 100) / 100)); });
      const volta = () => matSheet(p);
      $('[data-cancel]', s)?.addEventListener('click', volta);
      $('[data-del]', s)?.addEventListener('click', () => {
        const antes = JSON.stringify(p.lotes);
        p.lotes = p.lotes.filter(l => l.id !== lote.id); acertaLotes(p); savePrices(); volta();
        toast('Marca tirada do estoque.', { label: 'Desfazer', run: () => { p.lotes = JSON.parse(antes); acertaLotes(p); savePrices(); rerender(); } });
      });
      $('[data-save]', s).onclick = () => {
        const raw = $('#lt-qty', s).value.trim(), qty = /^0+([.,]0*)?$/.test(raw) ? 0 : parseQty(raw);
        if (qty === null || qty < 0) return toast('Informe a quantidade. Use 0 se acabou.');
        const data = { brand: $('#lt-brand', s).value.trim().replace(/\s+/g, ' '), qty: Math.round(qty * 100) / 100, cost: parseMoney($('#lt-cost', s).value) || 0 };
        p.lotes = p.lotes || [];
        const igual = p.lotes.find(l => l.id !== (lote && lote.id) && norm(l.brand) === norm(data.brand));
        if (igual && (isNew || comprar)) {
          // mesma marca: soma a quantidade; o custo fica a média ponderada
          const tot = igual.qty + data.qty;
          if (data.cost) igual.cost = tot ? Math.round((igual.qty * (igual.cost || data.cost) + data.qty * data.cost) / tot) : data.cost;
          igual.qty = Math.round(tot * 100) / 100;
        } else if (isNew) p.lotes.push({ id: uid(), ...data });
        else Object.assign(p.lotes.find(l => l.id === lote.id), data);
        if (comprar) p.repor = false;
        acertaLotes(p); savePrices();
        toast(comprar ? `${p.name}: compra no estoque.` : igual && isNew ? `Somado ao ${data.brand || 'sem marca'} que já estava no estoque.` : isNew ? `${p.name} no estoque.` : 'Estoque salvo.');
        volta();
      };
    } });
}
// novo material: 1. categoria, 2. material do catálogo (ou um novo, que entra em Preços), depois marca, quantidade e custo
function stockSheet(p) {
  if (p) return matSheet(p);
  let modo = 'tenho';
  const ordem = catOrder('mat');
  const cats = [...new Set(prices.filter(x => x.kind === 'mat').map(x => x.cat || 'Outros'))].sort((a, b) => { const ia = ordem.indexOf(a), ib = ordem.indexOf(b); return (ia < 0 ? 98 : ia) - (ib < 0 ? 98 : ib) || a.localeCompare(b, 'pt-BR'); });
  const opts = c => `<option value="" hidden>Escolha o material</option>${prices.filter(x => x.kind === 'mat' && (x.cat || 'Outros') === c).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(x => `<option value="${x.id}">${esc(x.name)}${inStock(x) ? ` · tem ${fmtQty(x.stock)}` : ''}</option>`).join('')}<option value="__novo">Outro material desta categoria…</option>`;
  openSheet({ title: 'Novo material', body: `
      <div class="field"><label for="st-cat-sel">1. Categoria</label><select id="st-cat-sel"><option value="" hidden>Escolha a categoria</option>${cats.map(c => `<option>${esc(c)}</option>`).join('')}<option value="__nova">Nova categoria…</option></select>
        <input id="st-cat" type="text" placeholder="Nome da nova categoria" aria-label="Nome da nova categoria" autocomplete="off" hidden></div>
      <div class="field"><label for="st-mat">2. Material</label><select id="st-mat" disabled><option value="" hidden>Escolha antes a categoria</option></select><span class="hint">Os materiais desta categoria no catálogo, que é a sua Tabela.</span></div>
      <div class="field" id="st-name-f" hidden><label for="st-name">Nome do material novo</label><input id="st-name" type="text" placeholder="Ex.: Disjuntor 20 A" autocomplete="off"><span class="hint">Ele entra também no catálogo e na Tabela.</span></div>
      <div class="st-resto" id="st-resto" hidden>
        <div class="seg" role="group" aria-label="Situação"><button data-modo="tenho" aria-pressed="true">Tenho em estoque</button><button data-modo="repor" aria-pressed="false">Preciso comprar</button></div>
        <div class="grid2" id="st-un-f"><div class="field"><label for="st-unit">Unidade</label><select id="st-unit">${UNITS.filter(([u]) => !['ponto', 'h', 'vb'].includes(u)).map(([u, l]) => `<option value="${esc(u)}">${l}</option>`).join('')}</select></div>
          <div class="field"><label for="st-price">Repasse ao cliente</label><input id="st-price" type="text" inputmode="numeric" data-money placeholder="R$ 0,00"></div></div>
        <div class="field" id="st-brand-f"><label for="st-brand">Marca <span class="lab-opt">opcional</span></label><input id="st-brand" type="text" placeholder="Ex.: Steck" autocomplete="off"></div>
        <div class="grid2">
          <div class="field"><label for="st-qty">Quantidade</label><div class="stepper" style="width:100%"><button data-sq="-1" aria-label="Menos">${I.minus}</button><input id="st-qty" type="text" inputmode="decimal" value="1" style="flex:1;width:auto"><button data-sq="1" aria-label="Mais">${I.plus}</button></div></div>
          <div class="field" id="st-cost-f"><label for="st-cost">Custo por unidade</label><input id="st-cost" type="text" inputmode="numeric" data-money placeholder="R$ 0,00"></div>
        </div>
        <p class="g-margin" id="st-margin" aria-live="polite">${margemHTML(0, null)}</p>
      </div>`,
    foot: `<button class="btn ghost" data-cancel>Cancelar</button><button class="btn primary" data-save>${I.plus}Adicionar</button>`,
    onMount: s => {
      const catSel = $('#st-cat-sel', s), catNova = $('#st-cat', s), matSel = $('#st-mat', s);
      const paintM = () => { $('#st-margin', s).innerHTML = modo === 'tenho' ? margemHTML(parseMoney($('#st-cost', s).value) || 0, parseMoney($('#st-price', s).value)) : ''; };
      ['#st-cost', '#st-price'].forEach(sel => $(sel, s).addEventListener('input', paintM));
      catSel.addEventListener('change', () => {
        const nv = catSel.value === '__nova';
        catNova.hidden = !nv;
        matSel.disabled = !catSel.value;
        matSel.innerHTML = nv ? '<option value="__novo">Material novo</option>' : opts(catSel.value);
        if (nv) matSel.dispatchEvent(new Event('change')); else { $('#st-name-f', s).hidden = true; $('#st-resto', s).hidden = true; }
      });
      matSel.addEventListener('change', () => {
        const x = prices.find(y => y.id === matSel.value);
        $('#st-name-f', s).hidden = matSel.value !== '__novo'; $('#st-resto', s).hidden = !matSel.value;
        $('#st-un-f', s).hidden = !!x;
        if (x) { $('#st-price', s).value = BRL(x.price); paintM(); }
      });
      $$('[data-modo]', s).forEach(b => b.onclick = () => { modo = b.dataset.modo; $$('[data-modo]', s).forEach(y => y.setAttribute('aria-pressed', y === b)); $('#st-brand-f', s).hidden = $('#st-cost-f', s).hidden = modo !== 'tenho'; paintM(); });
      $$('[data-sq]', s).forEach(b => b.onclick = () => { $('#st-qty', s).value = fmtQty(Math.max(0, Math.round(((parseQty($('#st-qty', s).value) || 0) + +b.dataset.sq) * 100) / 100)); });
      attachSuggest($('#st-brand', s), () => [...new Set(prices.flatMap(y => (y.lotes || []).map(l => l.brand)).filter(Boolean))].map(b => ({ label: b })));
      $('[data-cancel]', s).onclick = () => closeSheet();
      $('[data-save]', s).onclick = () => {
        const cat = catSel.value === '__nova' ? catNova.value.trim().replace(/\s+/g, ' ') : catSel.value;
        if (!cat) return toast(catSel.value === '__nova' ? 'Escreva o nome da nova categoria.' : 'Escolha a categoria.');
        if (!matSel.value) return toast('Escolha o material.');
        const raw = $('#st-qty', s).value.trim(), qty = /^0+([.,]0*)?$/.test(raw) ? 0 : parseQty(raw);
        if (qty === null || qty < 0) return toast('Informe a quantidade. Use 0 se acabou.');
        let p = prices.find(y => y.id === matSel.value);
        if (!p) {
          const name = $('#st-name', s).value.trim().replace(/\s+/g, ' '), price = parseMoney($('#st-price', s).value);
          if (!name) return toast('Escreva o nome do material.');
          if (price === null) return toast('Informe o preço de repasse ao cliente.');
          p = prices.find(y => y.kind === 'mat' && norm(y.name) === norm(name));
          if (!p) { p = { id: uid(), kind: 'mat', cat, name, unit: $('#st-unit', s).value, price }; prices.push(p); }
        } else { const pr = parseMoney($('#st-price', s).value); if (pr !== null && pr !== p.price) { p.price = pr; p.ref = false; } }
        if (modo === 'repor') { p.repor = true; p.reporQtd = Math.max(1, qty || 1); }
        else {
          const brand = $('#st-brand', s).value.trim().replace(/\s+/g, ' '), cost = parseMoney($('#st-cost', s).value) || 0;
          p.lotes = p.lotes || [];
          const igual = p.lotes.find(l => norm(l.brand) === norm(brand));
          if (igual) { const tot = igual.qty + qty; if (cost) igual.cost = tot ? Math.round((igual.qty * (igual.cost || cost) + qty * cost) / tot) : cost; igual.qty = Math.round(tot * 100) / 100; }
          else p.lotes.push({ id: uid(), brand, qty: Math.round(qty * 100) / 100, cost });
          acertaLotes(p);
        }
        savePrices(); matFiltro = modo === 'repor' ? 'repor' : 'estoque'; closeSheet(true); rerender();
        toast(modo === 'repor' ? `${p.name} na lista de compras.` : `${p.name} no estoque.`);
      };
    } });
}
// ferramentas: três listas — Minhas ferramentas (as unidades que você tem), Quero comprar e Ferramentas cadastradas
// (o catálogo). Cada linha abre a caixa da ferramenta, onde você diz se tem (com marca, modelo e quantidade) ou quer comprar
let toolFiltro = '';
const TOOL_FILTROS = [['minhas', 'minhas'], ['quero', 'comprar'], ['cadastradas', 'catálogo']];
const toolCats = () => { const usadas = new Set(tiposTool().map(t => t.cat)); return [...TOOL_CATS.filter(c => usadas.has(c)), ...[...usadas].filter(c => !TOOL_CATS.includes(c)).sort((a, b) => a.localeCompare(b, 'pt-BR'))]; };
function toolsListHTML() {
  const itens = tools.filter(t => t.k === 'item' && tipoDe(t)), quero = tiposTool().filter(t => t.quero), todos = tiposTool();
  const n = { minhas: sum(itens.map(i => i.qty)), quero: quero.length, cadastradas: todos.length };
  const f = toolFiltro || (itens.length ? 'minhas' : 'cadastradas');
  const qf = fold(gestaoQuery);
  const bate = (tipo, it) => !qf || fold([tipo.name, tipo.cat, it ? itemTxt(it) : ''].join(' ')).includes(qf);
  const chips = gHero('data-tf', TOOL_FILTROS, f, k => n[k]);
  const busca = `<label class="search">${I.search}<input type="search" id="g-q" placeholder="Buscar ferramenta, marca ou modelo" value="${esc(gestaoQuery)}" aria-label="Buscar ferramenta"></label>`;
  const porCat = (L, cat, row) => toolCats().filter(c => L.some(x => cat(x) === c)).map(c => { const M = L.filter(x => cat(x) === c); return panel(`g:tool:${f}:${c}`, '', esc(c), qf ? null : M.slice(0, 3).map(x => (x.name || (tipoDe(x) || {}).name || '')).join(' · ') + (M.length > 3 ? '…' : ''),
      `<div class="plist">${M.map(row).join('')}</div>`, { right: `<span class="card-sum">${M.length}</span>`, force: qf ? true : undefined }); }).join('');
  let lista = '';
  if (f === 'minhas') {
    const L = itens.filter(it => bate(tipoDe(it), it)).sort((a, b) => tipoDe(a).name.localeCompare(tipoDe(b).name, 'pt-BR') || itemTxt(a).localeCompare(itemTxt(b), 'pt-BR'));
    lista = L.length ? porCat(L, it => tipoDe(it).cat, it => `<button class="prow" data-item="${it.id}"><span><b>${hl(tipoDe(it).name, qf)}</b><small>${esc(itemTxt(it) || 'Sem marca e modelo')}</small></span><span class="prow-price">${it.qty} un.</span></button>`)
      : KitFacil.ui.vazio(qf ? { titulo: 'Nenhuma ferramenta encontrada', texto: 'Confira o nome, a marca ou o modelo.' } : { titulo: 'Nenhuma ferramenta sua ainda', texto: 'Toque em <b>Nova ferramenta</b>, ou abra uma do catálogo e toque em Tenho esta ferramenta.', icone: I.tool });
  } else {
    const L = (f === 'quero' ? quero : todos).filter(t => bate(t)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const estado = t => { const its = itensDe(t.id), q = sum(its.map(i => i.qty)); return [q && `${plural(q, 'minha', 'minhas')}${its.some(itemTxt) ? ': ' + its.map(itemTxt).filter(Boolean).join(', ') : ''}`, t.quero && `quero comprar ${t.queroQtd}`].filter(Boolean).join(' · '); };
    lista = L.length ? porCat(L, t => t.cat, t => `<button class="prow" data-tipo="${t.id}"><span><b>${hl(t.name, qf)}</b>${estado(t) ? `<small>${esc(estado(t))}</small>` : ''}</span><span class="prow-price">${temTool(t) ? `<span class="t-tem">${I.check}Minha</span>` : t.quero ? `<span class="t-quero">${I.cart}</span>` : ''}</span></button>`)
      : KitFacil.ui.vazio(qf ? { titulo: 'Nenhuma ferramenta encontrada', texto: 'Confira o nome.' } : { titulo: 'Nada na lista de compras', texto: 'Abra uma ferramenta do <b>catálogo</b> e ligue Quero comprar.', icone: I.cart });
  }
  return chips + busca + `<div id="g-list" class="g-list">${lista}</div>`;
}
// caixa da ferramenta: as unidades que você tem e a lista de compras
function typeSheet(t) {
  if (!t) return;
  const corpo = () => {
    const its = itensDe(t.id), cats = [...new Set([...TOOL_CATS, ...tiposTool().map(x => x.cat)])];
    // nome e categoria: editáveis também nas ferramentas que vêm com o app
    return `${panel(`tp:${t.id}:dados`, 'tp-dados', 'Nome e categoria', t.cat, `<div class="stack14">
        <div class="field"><label for="tp-name">Nome da ferramenta</label><input id="tp-name" type="text" value="${esc(t.name)}" autocomplete="off"></div>
        <div class="field"><label for="tp-cat">Categoria</label><select id="tp-cat">${cats.map(c => `<option ${c === t.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}<option value="__nova">Nova categoria…</option></select>
          <input id="tp-cat-n" type="text" placeholder="Nome da nova categoria" aria-label="Nome da nova categoria" autocomplete="off" hidden></div>
      </div>`)}
      ${panel(`tp:${t.id}:minhas`, '', 'Minhas ferramentas', its.length ? resumoDe(its, it => itemTxt(it) || 'Sem marca e modelo') : 'Nenhuma ainda', `${its.length ? `<div class="plist">${its.map(it => `<button class="prow" data-item="${it.id}"><span><b>${esc(itemTxt(it) || 'Sem marca e modelo')}</b></span><span class="prow-price">${it.qty} un.</span></button>`).join('')}</div>` : '<p class="hint">Você ainda não tem esta ferramenta cadastrada como sua.</p>'}
      <button class="add-btn" data-novo-item>${I.plus}${its.length ? 'Adicionar outra marca ou modelo' : 'Tenho esta ferramenta'}</button>`, { right: conta(sum(its.map(i => i.qty))) })}
      <label class="switch-row" for="tp-quero"><span><b>Quero comprar</b><small>Entra na lista de compras.</small></span><input type="checkbox" class="sw" id="tp-quero" ${t.quero ? 'checked' : ''}></label>
      <div class="field" id="tp-qq-f" ${t.quero ? '' : 'hidden'}><label for="tp-qq">Quantas quer comprar</label><div class="tp-qq-row"><div class="stepper"><button data-qq="-1" aria-label="Menos">${I.minus}</button><input id="tp-qq" type="text" inputmode="numeric" value="${t.queroQtd}"><button data-qq="1" aria-label="Mais">${I.plus}</button></div><button class="btn primary" data-comprei>${I.check}Comprei</button></div></div>`;
  };
  openSheet({ title: t.name, body: `<div id="tp-corpo" class="tp-corpo">${corpo()}</div>`,
    foot: `<button class="btn danger-text block" data-del>${I.trash}Excluir</button>`,
    onClose: () => rerender(),
    onMount: s => {
      s.addEventListener('click', e => {
        const it = e.target.closest('[data-item]'); if (it) return itemSheet(tools.find(x => x.id === it.dataset.item), t);
        if (e.target.closest('[data-novo-item]')) return itemSheet(null, t);
        if (e.target.closest('[data-comprei]')) return itemSheet(null, t, false, true);
        const qq = e.target.closest('[data-qq]'); if (qq) { t.queroQtd = Math.max(1, Math.min(999, t.queroQtd + +qq.dataset.qq)); $('#tp-qq', s).value = t.queroQtd; saveTools(); }
      });
      s.addEventListener('change', e => {
        if (e.target.id === 'tp-name') {
          const nn = e.target.value.trim().replace(/\s+/g, ' ');
          if (!nn) { e.target.value = t.name; return toast('Escreva o nome da ferramenta.'); }
          if (tiposTool().some(x => x !== t && norm(x.name) === norm(nn))) { e.target.value = t.name; return toast('Já existe uma ferramenta com esse nome.'); }
          t.name = nn; saveTools(); const tt = $('.kf-dlg-tt'); if (tt) tt.textContent = nn; toast('Nome salvo.');
        }
        const poeCat = c => { t.cat = c; saveTools(); const sm = $('[data-sum="tp-dados"]', s); if (sm) sm.textContent = c; toast('Categoria salva.'); };
        if (e.target.id === 'tp-cat') { const cn = $('#tp-cat-n', s), nv = e.target.value === '__nova'; cn.hidden = !nv; if (!nv) poeCat(e.target.value); }
        if (e.target.id === 'tp-cat-n') { const c = e.target.value.trim().replace(/\s+/g, ' '); if (c) poeCat(c); }
        if (e.target.id === 'tp-quero') { t.quero = e.target.checked; $('#tp-qq-f', s).hidden = !t.quero; saveTools(); toast(t.quero ? `${t.name} na lista de compras.` : `${t.name} saiu da lista de compras.`); }
        if (e.target.id === 'tp-qq') { t.queroQtd = Math.max(1, Math.min(999, parseInt(e.target.value, 10) || 1)); e.target.value = t.queroQtd; saveTools(); }
      });
      $('[data-del]', s)?.addEventListener('click', () => {
        const antes = tools.slice(); tools = tools.filter(x => x.id !== t.id && !(x.k === 'item' && x.tipo === t.id)); saveTools(); closeSheet(true); rerender();
        toast(`${t.name} excluída.`, { label: 'Desfazer', run: () => { tools = antes; saveTools(); rerender(); } });
      });
    } });
}
// uma ferramenta sua: marca, modelo e quantidade
// comprei = veio do botão Comprei: já traz a quantidade da lista de compras e, ao salvar, tira a ferramenta de lá
function itemSheet(it, tipo, daLista, comprei) {
  const isNew = !it;
  tipo = tipo || tipoDe(it);
  const x = it ? { ...it } : { brand: '', model: '', qty: comprei ? tipo.queroQtd : 1 };
  const volta = () => daLista ? (closeSheet(true), rerender()) : typeSheet(tipo);
  openSheet({ title: comprei ? 'Comprei' : isNew ? 'Tenho esta ferramenta' : 'Minha ferramenta', body: `
      <p class="hint"><b>${esc(tipo.name)}</b> · ${esc(tipo.cat)}${comprei ? '. Diga a marca e o modelo: ela vai para Minhas ferramentas e sai da lista de compras.' : ''}</p>
      <div class="grid2">
        <div class="field"><label for="it-brand">Marca <span class="lab-opt">opcional</span></label><input id="it-brand" type="text" value="${esc(x.brand)}" placeholder="Ex.: Bosch" autocomplete="off"></div>
        <div class="field"><label for="it-model">Modelo <span class="lab-opt">opcional</span></label><input id="it-model" type="text" value="${esc(x.model)}" placeholder="Ex.: GSB 13 RE" autocomplete="off"></div>
      </div>
      <div class="field"><label for="it-qty">Quantidade</label><div class="stepper"><button data-iq2="-1" aria-label="Menos">${I.minus}</button><input id="it-qty" type="text" inputmode="numeric" value="${x.qty}"><button data-iq2="1" aria-label="Mais">${I.plus}</button></div></div>`,
    foot: isNew ? `<button class="btn ghost" data-cancel>Voltar</button><button class="btn primary" data-save>${comprei ? I.check + 'Confirmar compra' : I.plus + 'Adicionar'}</button>` : `<button class="btn danger-text" data-del>${I.trash}Não tenho mais</button><button class="btn primary" data-save>Salvar</button>`,
    onClose: () => rerender(),
    onMount: s => {
      attachSuggest($('#it-brand', s), () => [...new Set(tools.filter(y => y.k === 'item' && y.brand).map(y => y.brand))].map(b => ({ label: b })));
      $$('[data-iq2]', s).forEach(b => b.onclick = () => { $('#it-qty', s).value = Math.max(1, Math.min(999, (parseInt($('#it-qty', s).value, 10) || 1) + +b.dataset.iq2)); });
      $('[data-cancel]', s)?.addEventListener('click', volta);
      $('[data-del]', s)?.addEventListener('click', () => {
        const idx = tools.findIndex(y => y.id === it.id); if (idx < 0) return;
        const [gone] = tools.splice(idx, 1); saveTools(); volta();
        toast('Ferramenta tirada das suas.', { label: 'Desfazer', run: () => { tools.splice(idx, 0, gone); saveTools(); rerender(); } });
      });
      $('[data-save]', s).onclick = () => {
        const data = { brand: $('#it-brand', s).value.trim().replace(/\s+/g, ' '), model: $('#it-model', s).value.trim().replace(/\s+/g, ' '), qty: Math.max(1, Math.min(999, parseInt($('#it-qty', s).value, 10) || 1)) };
        const igual = tools.find(y => y.k === 'item' && y.tipo === tipo.id && y.id !== (it && it.id) && norm(y.brand) === norm(data.brand) && norm(y.model) === norm(data.model));
        if (igual) { igual.qty = Math.min(999, igual.qty + data.qty); if (it) tools = tools.filter(y => y.id !== it.id); }
        else if (isNew) tools.push(fixItem({ id: uid(), tipo: tipo.id, ...data })); else Object.assign(tools.find(y => y.id === it.id), data);
        if (comprei) tipo.quero = false;
        saveTools(); toast(comprei ? `${tipo.name} nas suas ferramentas e fora da lista de compras.` : igual ? `Somado à sua ${tipo.name}${itemTxt(igual) ? ' ' + itemTxt(igual) : ''}.` : isNew ? `${tipo.name} nas suas ferramentas.` : 'Ferramenta salva.'); volta();
      };
    } });
}
// nova ferramenta: 1. categoria, 2. ferramenta do catálogo (ou uma nova), depois se é sua ou se quer comprar
function newToolSheet() {
  let modo = 'minha';
  const opts = c => `<option value="" hidden>Escolha a ferramenta</option>${tiposTool().filter(t => t.cat === c).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(t => `<option value="${t.id}">${esc(t.name)}${temTool(t) ? ' · já tem' : ''}</option>`).join('')}<option value="__novo">Outra ferramenta desta categoria…</option>`;
  openSheet({ title: 'Nova ferramenta', body: `
      <div class="field"><label for="nt-cat">1. Categoria</label><select id="nt-cat"><option value="" hidden>Escolha a categoria</option>${toolCats().map(c => `<option>${esc(c)}</option>`).join('')}<option value="__nova">Nova categoria…</option></select>
        <input id="nt-cat-nova" type="text" placeholder="Nome da nova categoria" aria-label="Nome da nova categoria" autocomplete="off" hidden></div>
      <div class="field"><label for="nt-tipo">2. Ferramenta</label><select id="nt-tipo" disabled><option value="" hidden>Escolha antes a categoria</option></select></div>
      <div class="field" id="nt-nome-f" hidden><label for="nt-nome">Nome da ferramenta nova</label><input id="nt-nome" type="text" placeholder="Ex.: Detector de metais" autocomplete="off"><span class="hint">Ela entra também no catálogo de ferramentas.</span></div>
      <div class="st-resto" id="nt-resto" hidden>
        <div class="seg" role="group" aria-label="Situação"><button data-modo="minha" aria-pressed="true">É minha</button><button data-modo="quero" aria-pressed="false">Quero comprar</button></div>
        <div class="grid2" id="nt-marca">
          <div class="field"><label for="nt-brand">Marca <span class="lab-opt">opcional</span></label><input id="nt-brand" type="text" placeholder="Ex.: Bosch" autocomplete="off"></div>
          <div class="field"><label for="nt-model">Modelo <span class="lab-opt">opcional</span></label><input id="nt-model" type="text" placeholder="Ex.: GSB 13 RE" autocomplete="off"></div>
        </div>
        <div class="field"><label for="nt-qty">Quantidade</label><div class="stepper"><button data-nq="-1" aria-label="Menos">${I.minus}</button><input id="nt-qty" type="text" inputmode="numeric" value="1"><button data-nq="1" aria-label="Mais">${I.plus}</button></div></div>
      </div>`,
    foot: `<button class="btn ghost" data-cancel>Cancelar</button><button class="btn primary" data-save>${I.plus}Adicionar</button>`,
    onMount: s => {
      const cat = $('#nt-cat', s), nova = $('#nt-cat-nova', s), tipo = $('#nt-tipo', s);
      cat.addEventListener('change', () => {
        const nv = cat.value === '__nova';
        nova.hidden = !nv;
        tipo.disabled = !cat.value;
        tipo.innerHTML = nv ? '<option value="__novo">Ferramenta nova</option>' : cat.value ? opts(cat.value) : '<option value="" hidden>Escolha antes a categoria</option>';
        if (nv) tipo.dispatchEvent(new Event('change')); else { $('#nt-nome-f', s).hidden = true; $('#nt-resto', s).hidden = true; }
      });
      tipo.addEventListener('change', () => {
        $('#nt-nome-f', s).hidden = tipo.value !== '__novo'; $('#nt-resto', s).hidden = !tipo.value;
      });
      $$('[data-modo]', s).forEach(b => b.onclick = () => { modo = b.dataset.modo; $$('[data-modo]', s).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#nt-marca', s).hidden = modo !== 'minha'; });
      $$('[data-nq]', s).forEach(b => b.onclick = () => { $('#nt-qty', s).value = Math.max(1, Math.min(999, (parseInt($('#nt-qty', s).value, 10) || 1) + +b.dataset.nq)); });
      $('[data-cancel]', s).onclick = () => closeSheet();
      $('[data-save]', s).onclick = () => {
        const c = cat.value === '__nova' ? nova.value.trim().replace(/\s+/g, ' ') : cat.value;
        if (!c) return toast(cat.value === '__nova' ? 'Escreva o nome da nova categoria.' : 'Escolha a categoria.');
        if (!tipo.value) return toast('Escolha a ferramenta.');
        let t = tools.find(x => x.id === tipo.value);
        if (!t) {
          const nome = $('#nt-nome', s).value.trim().replace(/\s+/g, ' ');
          if (!nome) return toast('Escreva o nome da ferramenta.');
          t = tiposTool().find(x => norm(x.name) === norm(nome));
          if (!t) { t = fixTipo({ id: uid(), name: nome, cat: c }); tools.push(t); }
        }
        const qty = Math.max(1, Math.min(999, parseInt($('#nt-qty', s).value, 10) || 1));
        if (modo === 'quero') { t.quero = true; t.queroQtd = qty; }
        else {
          const brand = $('#nt-brand', s).value.trim().replace(/\s+/g, ' '), model = $('#nt-model', s).value.trim().replace(/\s+/g, ' ');
          const igual = itensDe(t.id).find(y => norm(y.brand) === norm(brand) && norm(y.model) === norm(model));
          if (igual) igual.qty = Math.min(999, igual.qty + qty); else tools.push(fixItem({ id: uid(), tipo: t.id, brand, model, qty }));
        }
        saveTools(); toolFiltro = modo === 'quero' ? 'quero' : 'minhas'; closeSheet(true); rerender();
        toast(modo === 'quero' ? `${t.name} na lista de compras.` : `${t.name} nas suas ferramentas.`);
      };
    } });
}
/* lista de compras única: material para repor e ferramentas que você quer comprar */
const comprasN = () => prices.filter(precisaRepor).length + tiposTool().filter(t => t.quero).length;
function comprasSheet() {
  const L = [
    ...prices.filter(precisaRepor).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(p => ({ k: 'm', id: p.id, nome: p.name, marca: p.brand || '', un: p.unit, qtd: p.repor && p.reporQtd ? p.reporQtd : sugestaoCompra(p), on: true, info: !inStock(p) ? 'não tem no estoque' : p.stock <= 0 ? 'em falta' : `tem ${fmtQty(p.stock)}${p.min ? `, mínimo ${fmtQty(p.min)}` : ''}` })),
    ...tiposTool().filter(t => t.quero).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(t => ({ k: 'f', id: t.id, nome: t.name, marca: '', un: 'un', qtd: t.queroQtd || 1, on: true, info: t.cat })),
  ];
  const texto = () => {
    const linha = x => `• ${x.nome}${x.marca ? `, ${x.marca}` : ''}: ${fmtQty(x.qtd)} ${unitTxt(x.qtd, x.un)}`;
    const M = L.filter(x => x.on && x.k === 'm'), F = L.filter(x => x.on && x.k === 'f');
    return [`*Lista de compras*${settings.company || settings.name ? ` · ${settings.company || settings.name}` : ''}`, M.length && `\n*Material*\n${M.map(linha).join('\n')}`, F.length && `\n*Ferramentas*\n${F.map(linha).join('\n')}`].filter(Boolean).join('\n');
  };
  const row = (x, i) => `<div class="cp-row"><label class="cp-chk"><input type="checkbox" data-cp="${i}" ${x.on ? 'checked' : ''}><span><b>${esc(x.nome)}</b><small>${esc([x.marca, x.info].filter(Boolean).join(' · '))}</small></span></label>
    <div class="stepper"><button data-cq="-1" data-i="${i}" aria-label="Menos ${esc(x.nome)}">${I.minus}</button><input type="text" inputmode="decimal" data-ci="${i}" value="${fmtQty(x.qtd)}" aria-label="Quantidade de ${esc(x.nome)} (${unitName(x.un)})"><button data-cq="1" data-i="${i}" aria-label="Mais ${esc(x.nome)}">${I.plus}</button></div><span class="cp-un" aria-hidden="true">${unitTxt(x.qtd, x.un)}</span></div>`;
  const corpo = () => {
    if (!L.length) return KitFacil.ui.vazio({ titulo: 'Nada para comprar agora', texto: 'Aqui entram o material que chegou ao mínimo no estoque e as ferramentas marcadas como Quero comprar.', icone: I.cart });
    const m = L.map((x, i) => [x, i]).filter(([x]) => x.k === 'm'), f = L.map((x, i) => [x, i]).filter(([x]) => x.k === 'f');
    return `${m.length ? panel('cp:mat', '', 'Material para repor', resumoDe(m, ([x]) => x.nome), `<p class="hint">Sugestão: o bastante para ficar com o dobro do mínimo. Ajuste à vontade.</p>${m.map(([x, i]) => row(x, i)).join('')}`, { right: conta(m.length) }) : ''}
      ${f.length ? panel('cp:ferr', '', 'Ferramentas para comprar', resumoDe(f, ([x]) => x.nome), f.map(([x, i]) => row(x, i)).join(''), { right: conta(f.length) }) : ''}`;
  };
  openSheet({ title: 'Lista de compras', tall: true, body: `<div id="cp-list">${corpo()}</div>`,
    foot: L.length ? `<div class="cp-pe"><button class="btn ghost" data-cp-copy>${I.copy}Copiar</button><a class="btn wa" data-cp-wa href="#" target="_blank" rel="noopener">${I.wa}WhatsApp</a></div><button class="btn ok block" data-cp-tudo>${I.check}Comprei tudo</button>` : '',
    onMount: s => {
      const pinta = () => { const st = $('.kf-dlg-corpo', s)?.scrollTop; $('#cp-list', s).innerHTML = corpo(); if (st != null) $('.kf-dlg-corpo', s).scrollTop = st; };
      s.addEventListener('click', e => {
        const b = e.target.closest('[data-cq]');
        if (b) { const x = L[+b.dataset.i]; x.qtd = Math.max(1, Math.round((x.qtd + +b.dataset.cq) * 100) / 100); pinta(); return; }
        if (e.target.closest('[data-cp-tudo]')) {
          const M = L.filter(x => x.on); if (!M.length) return toast('Marque ao menos um item.');
          const antes = { prices: JSON.stringify(prices), tools: JSON.stringify(tools) };
          M.forEach(x => {
            if (x.k === 'm') {
              const p = prices.find(y => y.id === x.id); if (!p) return;
              acertaLotes(p); p.lotes = p.lotes || [];
              // sem marca: soma no lote sem marca (ou cria um, com o custo médio de hoje)
              const l = p.lotes.find(y => !y.brand) || (p.lotes.push({ id: uid(), brand: '', qty: 0, cost: p.cost || 0 }), p.lotes[p.lotes.length - 1]);
              l.qty = Math.round((l.qty + x.qtd) * 100) / 100; p.repor = false; acertaLotes(p);
            } else {
              const t = tools.find(y => y.id === x.id); if (!t) return;
              const it = itensDe(t.id).find(y => !y.brand && !y.model);
              if (it) it.qty = Math.min(999, it.qty + Math.round(x.qtd)); else tools.push(fixItem({ id: uid(), tipo: t.id, qty: Math.round(x.qtd) }));
              t.quero = false;
            }
          });
          savePrices(); saveTools(); closeSheet(true); rerender();
          toast(`${plural(M.length, 'item comprado', 'itens comprados')}: o material entrou no estoque e as ferramentas, nas suas.`, { label: 'Desfazer', run: () => { prices = JSON.parse(antes.prices); tools = JSON.parse(antes.tools); savePrices(); saveTools(); rerender(); } });
          return;
        }
        if (e.target.closest('[data-cp-copy]')) { if (!L.some(x => x.on)) return toast('Marque ao menos um item.'); copyText(texto(), 'Lista copiada.'); return; }
        const wa = e.target.closest('[data-cp-wa]');
        if (wa) { if (!L.some(x => x.on)) { e.preventDefault(); return toast('Marque ao menos um item.'); } wa.href = waLink('', texto()); }
      });
      s.addEventListener('change', e => {
        const c = e.target.closest('[data-cp]'); if (c) { L[+c.dataset.cp].on = c.checked; return; }
        const i = e.target.closest('[data-ci]'); if (i) { L[+i.dataset.ci].qtd = Math.max(1, parseQty(i.value) || 1); pinta(); }
      });
    } });
}
const checkNome = c => { const t = c.toolId && tools.find(x => x.id === c.toolId); return t ? t.name : c.name; };
function checklistHTML() {
  const faltam = tiposTool().filter(t => temTool(t) && !checks.some(c => c.toolId === t.id));
  const addTools = faltam.length ? `<button class="btn sm ghost" data-ck-tools>${I.plus}${checks.length ? `Adicionar ${plural(faltam.length, 'ferramenta que falta', 'ferramentas que faltam')}` : `Adicionar minhas ${plural(faltam.length, 'ferramenta', 'ferramentas')}`}</button>` : '';
  if (!checks.length) return KitFacil.ui.vazio({ titulo: 'Checklist vazio', texto: 'Monte uma vez a lista do que sempre vai para a obra. Toque em <b>Novo item</b>' + (faltam.length ? ' ou adicione as suas ferramentas de uma vez.' : '.'), icone: I.checklist, acao: addTools });
  const lista = checks.filter(c => checkLado === 'ida' || c.back);
  const k = checkLado, feitos = lista.filter(c => c[k]).length, tot = lista.length, pct = tot ? Math.round(feitos / tot * 100) : 0;
  const conta2 = lado => { const L = checks.filter(c => lado === 'ida' || c.back); return `${L.filter(c => c[lado]).length} de ${L.length}`; };
  return `${gHero('data-lado', [['ida', 'Ida'], ['volta', 'Volta']], k, conta2)}
    <p class="hint">${k === 'ida' ? 'Antes de sair: marque o que já está no carro.' : 'Antes de ir embora: marque o que já recolheu. Só aparecem os itens que voltam.'}</p>
    <div class="g-prog"><div class="g-prog-t"><b>${feitos} de ${tot}</b> conferidos</div><div class="g-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${feitos}" aria-label="Itens conferidos"><span style="width:${pct}%"></span></div></div>
    ${tot && feitos === tot ? `<div class="cal-msg" role="status">${I.check}<span><b>Tudo conferido.</b> ${k === 'ida' ? 'Bom serviço!' : 'Nada ficou para trás.'}</span></div>` : ''}
    ${panel(`ck:${k}`, '', k === 'ida' ? 'Ida para a obra' : 'Volta da obra', `${feitos} de ${tot} conferidos`, `${tot ? `<div class="ck-list">${lista.map(c => `<div class="ck-row"><label><input type="checkbox" data-ck="${c.id}" ${c[k] ? 'checked' : ''}><span>${esc(checkNome(c))}${checkLado === 'ida' && !c.back ? '<small>fica na obra</small>' : ''}</span></label><button class="icon-btn sm" data-ck-edit="${c.id}" aria-label="Alterar ${esc(checkNome(c))}">${I.more}</button></div>`).join('')}</div>` : '<p class="hint">Nenhum item volta da obra. Ao alterar um item, ligue "Conferir também na volta".</p>'}`, { right: conta(tot) })}
    <div class="g-acts">${feitos ? `<button class="btn sm ghost" data-ck-reset>Desmarcar tudo</button>` : ''}${addTools}</div>`;
}
function checkSheet(c) {
  const isNew = !c;
  const it = c ? { ...c, name: checkNome(c) } : { name: '', back: true };
  openSheet({ title: isNew ? 'Novo item no checklist' : 'Item do checklist', body: `
      <div class="field"><label for="ck-name">Item</label><input id="ck-name" type="text" value="${esc(it.name)}" placeholder="Ex.: Escada, fita isolante, multímetro" autocomplete="off" ${c && c.toolId && tools.some(t => t.id === c.toolId) ? 'readonly aria-describedby="ck-tool"' : ''}></div>
      ${c && c.toolId && tools.some(t => t.id === c.toolId) ? '<p class="hint" id="ck-tool">O nome vem da sua lista de ferramentas.</p>' : ''}
      <label class="switch-row" for="ck-back"><span><b>Conferir também na volta</b><small>Desligue para o que fica na obra, como material usado.</small></span><input type="checkbox" class="sw" id="ck-back" ${it.back ? 'checked' : ''}></label>`,
    foot: isNew ? `<button class="btn ghost" data-cancel>Cancelar</button><button class="btn primary" data-save>${I.plus}Adicionar</button>` : `<button class="btn danger-text" data-del>${I.trash}Excluir</button><button class="btn primary" data-save>Salvar</button>`,
    onMount: s => {
      if (isNew) attachSuggest($('#ck-name', s), () => [...tiposTool().filter(temTool).map(t => t.name), ...prices.filter(inStock).map(p => p.name)].filter(n => !checks.some(x => norm(checkNome(x)) === norm(n))).map(n => ({ label: n })));
      $('[data-cancel]', s)?.addEventListener('click', () => closeSheet());
      $('[data-del]', s)?.addEventListener('click', () => {
        const idx = checks.findIndex(x => x.id === c.id); if (idx < 0) return;
        const [gone] = checks.splice(idx, 1); saveChecks(); closeSheet(true); rerender();
        toast(`${checkNome(gone)} saiu do checklist.`, { label: 'Desfazer', run: () => { checks.splice(idx, 0, gone); saveChecks(); rerender(); } });
      });
      $('[data-save]', s).onclick = () => {
        const name = $('#ck-name', s).value.trim().replace(/\s+/g, ' ');
        if (!name) return toast('Escreva o que conferir.');
        const back = $('#ck-back', s).checked;
        if (isNew) {
          if (checks.some(x => norm(checkNome(x)) === norm(name))) return toast(`${name} já está no checklist.`);
          const t = tiposTool().find(x => temTool(x) && norm(x.name) === norm(name));
          checks.push(fixCheck({ id: uid(), name, back, toolId: t ? t.id : '' }));
        } else Object.assign(checks.find(x => x.id === c.id) || {}, { name, back });
        saveChecks(); closeSheet(true); rerender(); toast(isNew ? `${name} no checklist.` : 'Item salvo.');
      };
    } });
}
VIEWS.gestao = {
  html() {
    const G = GESTAO[gestaoAba];
    const corpo = gestaoAba === 'estoque' ? stockListHTML() : gestaoAba === 'ferramentas' ? toolsListHTML() : checklistHTML();
    return `${barraTopo()}
    <main class="page">
      ${KitFacil.ui.cabecalho({ titulo: 'Gestão' })}
      ${KitFacil.ui.abas({ itens: Object.entries(GESTAO).map(([k, x]) => [k, x.nome]), atual: gestaoAba, rotulo: 'Parte da gestão' })}
      <div class="g-body" id="g-body">${corpo}</div>
      ${KitFacil.ui.adicionar({ rotulo: G.criar, attrs: 'data-g-new' })}
    </main>`;
  },
  bind(v) {
    $$('[data-aba]', v).forEach(b => b.onclick = () => { if (gestaoAba === b.dataset.aba) return; gestaoAba = b.dataset.aba; gestaoQuery = ''; rerender(); });
    $('[data-compras]', v)?.addEventListener('click', comprasSheet);
    $('[data-g-new]', v).onclick = () => gestaoAba === 'estoque' ? stockSheet(null) : gestaoAba === 'ferramentas' ? newToolSheet() : checkSheet(null);
    const sq = $('#g-q', v);
    if (sq) sq.addEventListener('input', () => { gestaoQuery = sq.value; const tmp = document.createElement('div'); tmp.innerHTML = gestaoAba === 'estoque' ? stockListHTML() : toolsListHTML(); $('#g-list', v).replaceWith($('#g-list', tmp)); });
    v.addEventListener('click', e => {
      const sb = e.target.closest('[data-mat]'); if (sb) return matSheet(prices.find(p => p.id === sb.dataset.mat));
      const mf = e.target.closest('[data-mf]'); if (mf) { matFiltro = mf.dataset.mf; gestaoQuery = ''; return rerender(); }
      const ti = e.target.closest('[data-tipo]'); if (ti) return typeSheet(tools.find(x => x.id === ti.dataset.tipo));
      const it = e.target.closest('[data-item]'); if (it) { const x = tools.find(y => y.id === it.dataset.item); return itemSheet(x, null, true); }
      const tf = e.target.closest('[data-tf]'); if (tf) { toolFiltro = tf.dataset.tf; gestaoQuery = ''; return rerender(); }
      const ld = e.target.closest('[data-lado]'); if (ld) { checkLado = ld.dataset.lado; return rerender(); }
      const ce = e.target.closest('[data-ck-edit]'); if (ce) return checkSheet(checks.find(c => c.id === ce.dataset.ckEdit));
      if (e.target.closest('[data-ck-tools]')) {
        const novos = tiposTool().filter(t => temTool(t) && !checks.some(c => c.toolId === t.id));
        novos.forEach(t => checks.push(fixCheck({ id: uid(), name: t.name, toolId: t.id, back: true })));
        saveChecks(); rerender(); return toast(`${plural(novos.length, 'ferramenta entrou', 'ferramentas entraram')} no checklist.`, { label: 'Desfazer', run: () => { checks = checks.filter(c => !novos.some(t => t.id === c.toolId)); saveChecks(); rerender(); } });
      }
      if (e.target.closest('[data-ck-reset]')) {
        const k = checkLado, antes = checks.filter(c => c[k]).map(c => c.id);
        checks.forEach(c => { c[k] = false; }); saveChecks(); rerender();
        toast(`Checklist de ${k === 'ida' ? 'ida' : 'volta'} desmarcado.`, { label: 'Desfazer', run: () => { checks.forEach(c => { if (antes.includes(c.id)) c[k] = true; }); saveChecks(); rerender(); } });
      }
    });
    v.addEventListener('change', e => {
      const ck = e.target.closest('[data-ck]'); if (!ck) return;
      const c = checks.find(x => x.id === ck.dataset.ck); if (!c) return;
      c[checkLado] = ck.checked; vibrate(); saveChecks(); rerender();
    });
  },
};

