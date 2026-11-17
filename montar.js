/* Elétrica Fácil 2.0 · a tabela na mão: o orçamento nasce na tabela de preços, e cada toque soma um item.
   O nome do cliente só é pedido ao gerar a proposta (Código, Art. 64-D). */
'use strict';

/* ---------- como chamar um orçamento que ainda não tem cliente ---------- */
const resumoItens = q => { const L = q.items.filter(i => i.kind === 'svc'); return resumoDe(L.length ? L : q.items, i => i.name); };
const quoteNome = q => q.client.name || q.title || resumoItens(q) || (isReport(q) ? 'Relatório ' : 'Orçamento ') + numLabel(q).toLowerCase();
const quoteSub = q => q.client.name ? (q.title || resumoItens(q) || 'Sem itens ainda') : (q.title && resumoItens(q)) || (q.items.length ? 'Cliente: você preenche na proposta' : 'Sem itens ainda');

/* ---------- estado da tela (fica entre um desenho e outro) ---------- */
const MT = { kind: 'svc', cat: null, q: '', room: '', id: null, svcAdd: {} };
function abrirTabela(q, kind, room) {
  if (MT.id !== q.id) { MT.q = ''; MT.cat = null; MT.svcAdd = {}; }
  MT.id = q.id; if (kind) { if (MT.kind !== kind) MT.cat = null; MT.kind = kind; } MT.room = q.useRooms ? (room || '') : '';
  go('/q/' + q.id + '/itens');
}
// os serviços que mais aparecem nos orçamentos de quem usa: são os primeiros da tabela
function maisUsados(kind) {
  const n = new Map();
  quotes.filter(q => !q.example).forEach(q => q.items.forEach(i => { if (i.kind === kind) n.set(norm(i.name), (n.get(norm(i.name)) || 0) + 1); }));
  return prices.filter(p => p.kind === kind && n.has(norm(p.name))).sort((a, b) => n.get(norm(b.name)) - n.get(norm(a.name)) || a.name.localeCompare(b.name, 'pt-BR')).slice(0, 12);
}
const mtCats = kind => groupByCat(prices.filter(p => p.kind === kind)).map(g => g[0]);
const mtNoOrc = (q, p) => q.items.filter(i => i.kind === p.kind && norm(i.name) === norm(p.name) && (!q.useRooms || roomOf(q, i) === MT.room));
const mtQtd = (q, p) => sum(mtNoOrc(q, p).map(i => i.qty));

function mtRowHTML(q, p, qf, comCat) {
  const n = mtQtd(q, p), nome = esc(p.name);
  return `<div class="mt-row${n ? ' on' : ''}" data-pid="${p.id}">
    <button type="button" class="mt-main" data-mais="${p.id}" aria-label="Somar 1 em ${nome}">
      <span class="mt-nome">${hl(p.name, qf)}</span>
      <span class="mt-meta"><span class="num">${p.ref ? refV(BRL(p.price)) : BRL(p.price)}</span> por ${unitName(p.unit)}${comCat ? ` · ${esc(p.cat || 'Outros')}` : ''}${inStock(p) ? ` · <span class="${stockLow(p) ? 'mt-baixo' : ''}">${stockTxt(p)}</span>` : ''}</span>
    </button>
    <div class="qty mt-qty">${n ? `<button type="button" data-menos="${p.id}" aria-label="Menos 1 em ${nome}">${I.minus}</button><button type="button" class="qty-n" data-qtd="${p.id}" aria-label="Quantidade de ${nome}: ${fmtQty(n)}. Toque para digitar">${fmtQty(n)}</button>` : ''}<button type="button" class="mt-mais" data-mais="${p.id}" aria-label="Mais 1 em ${nome}">${I.plus}</button></div>
  </div>`;
}
function mtListaHTML(q) {
  const qf = fold(MT.q.trim());
  if (qf) {
    // com busca: mão de obra e material juntos; primeiro a palavra inteira ("DR" acha Instalação de DR antes de "quadro")
    const rx = new RegExp('(^|[^a-z0-9])' + qf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])');
    const nota = p => { const n = fold(p.name); return (rx.test(n) ? 4 : n.startsWith(qf) ? 3 : n.split(/[^a-z0-9]+/).some(w => w.startsWith(qf)) ? 2 : n.includes(qf) ? 1 : 0.5) + (p.kind === MT.kind ? 0.2 : 0); };
    const L = prices.filter(p => fold(p.name).includes(qf) || fold(p.cat).includes(qf)).map(p => [nota(p), p]).sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name, 'pt-BR')).map(x => x[1]).slice(0, 60);
    return (L.length ? L.map(p => mtRowHTML(q, p, qf, true)).join('') : KitFacil.ui.vazio({ titulo: `Nada com “${esc(MT.q.trim())}” na tabela`, texto: 'Some como item fora da tabela: ele entra só neste orçamento.' }))
      + `<button type="button" class="add-btn" data-fora>${I.plus}Somar “${esc(MT.q.trim())}” fora da tabela</button>`;
  }
  const usados = maisUsados(MT.kind), cats = mtCats(MT.kind);
  if (MT.cat === null || (MT.cat !== '*' && !cats.includes(MT.cat))) MT.cat = usados.length >= 3 ? '*' : cats[0] || '*';
  const L = MT.cat === '*' ? usados : prices.filter(p => p.kind === MT.kind && (p.cat || 'Outros') === MT.cat).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
  return (L.length ? L.map(p => mtRowHTML(q, p, '', false)).join('') : KitFacil.ui.vazio({ titulo: 'Nada nesta parte da tabela', texto: 'Cadastre em Tabela ou some um item fora da tabela.' }))
    + `<button type="button" class="add-btn" data-fora>${I.plus}${MT.kind === 'svc' ? 'Serviço' : 'Material'} fora da tabela</button>`;
}
function mtTiraHTML() {
  const usados = maisUsados(MT.kind), cats = mtCats(MT.kind);
  const b = (k, l) => `<button type="button" data-cat="${esc(k)}" aria-pressed="${MT.cat === k}">${esc(l)}</button>`;
  return (usados.length >= 3 ? b('*', 'Mais usados') : '') + cats.map(c => b(c, c)).join('');
}
const mtPeHTML = (q, c = compute(q)) => `<small data-t="n">${q.items.length ? plural(q.items.length, 'item', 'itens') : 'Nenhum item ainda'}</small><b class="num" data-t="total">${BRL(c.total)}</b>`;

VIEWS.montar = {
  html(r) {
    const q = getQ(r.id);
    if (MT.id !== q.id) { MT.id = q.id; MT.q = ''; MT.cat = null; MT.svcAdd = {}; MT.room = ''; }
    if (!q.useRooms) MT.room = ''; else if (MT.room && !q.rooms.some(x => x.id === MT.room)) MT.room = '';
    const lista = mtListaHTML(q), salas = q.useRooms ? roomList(q) : [];
    return `<header class="kf-barra appbar"><div class="kf-barra-in">
      <button class="icon-btn" data-back aria-label="Voltar">${I.back}</button>
      <div class="ab-title"><span class="ab-eyebrow">${q.example ? 'Exemplo' : (isReport(q) ? 'Relatório ' : 'Orçamento ') + esc(numLabel(q).toLowerCase())}</span><span class="ab-main">Tabela na mão</span></div>
      ${KitFacil.topo.html({ principal: false })}
    </div></header>
    <main class="page bar montar">
      <h1 class="sr-only">Escolher serviços e materiais na tabela</h1>
      <p class="mt-dica">Cada toque soma um. O nome do cliente fica para a proposta.</p>
      ${salas.length ? `<div class="field mt-onde"><label for="mt-room">Somando em</label><select id="mt-room">${salas.map(g => `<option value="${esc(g.id)}" ${g.id === MT.room ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></div>` : ''}
      <label class="search">${I.search}<input type="search" id="mt-q" placeholder="Buscar serviço ou material" aria-label="Buscar na tabela" value="${esc(MT.q)}"></label>
      <div id="mt-filtros"${MT.q.trim() ? ' hidden' : ''}>
        <div class="seg" role="group" aria-label="Tipo">${[['svc', 'Mão de obra'], ['mat', 'Material']].map(([k, l]) => `<button type="button" data-kind="${k}" aria-pressed="${MT.kind === k}">${l}</button>`).join('')}</div>
        <div class="tira" id="mt-tira" role="group" aria-label="Parte da tabela">${mtTiraHTML()}</div>
      </div>
      <div class="mt-lista" id="mt-lista">${lista}</div>
    </main>
    <div class="bbar"><div class="bbar-in visor-pe">
      <div class="bb-total" id="mt-pe" role="status">${mtPeHTML(q)}</div>
      <button class="btn primary" data-ver>Ver orçamento${I.arrow}</button>
    </div></div>`;
  },
  bind(v, r) {
    const q = getQ(r.id);
    const pinta = () => { $('#mt-lista', v).innerHTML = mtListaHTML(q); $('#mt-pe', v).innerHTML = mtPeHTML(q); };
    const pintaTira = () => { $('#mt-tira', v).innerHTML = mtTiraHTML(); $$('[data-kind]', v).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === MT.kind))); };
    const sair = para => {
      const add = MT.svcAdd; MT.svcAdd = {};
      // quem volta da tabela vê o que somou: os itens chegam abertos
      [`q:${q.id}:items`, `q:${q.id}:svc`, ...(q.items.some(i => i.kind === 'mat') ? [] : [])].forEach(k => { PANEL[k] = true; });
      para();
      if (Object.keys(add).length && getQ(q.id)) setTimeout(() => sugerirMaterial(q, add, MT.room), semMovimento() ? 60 : 420);
    };
    $('[data-back]', v).onclick = () => sair(() => q.items.length ? go('/q/' + q.id, true) : back('/'));
    $('[data-ver]', v).onclick = () => { if (!q.items.length) return toast('Toque num serviço para somar o primeiro item.'); sair(() => go('/q/' + q.id, true)); };
    const busca = $('#mt-q', v);
    busca.addEventListener('input', () => { MT.q = busca.value; $('#mt-filtros', v).hidden = !!MT.q.trim(); pinta(); });
    $('#mt-room', v)?.addEventListener('change', e => { MT.room = e.target.value; pinta(); });
    v.addEventListener('click', e => {
      const kd = e.target.closest('[data-kind]');
      if (kd) { MT.kind = kd.dataset.kind; MT.cat = null; pinta(); pintaTira(); return; }
      const ct = e.target.closest('[data-cat]');
      if (ct) { MT.cat = ct.dataset.cat; pinta(); pintaTira(); return; }
      const mais = e.target.closest('[data-mais]');
      if (mais) { const p = prices.find(x => x.id === mais.dataset.mais); if (!p) return; addFromPrice(q, p, MT.room); if (p.kind === 'svc' && (p.comp || []).length) MT.svcAdd[p.id] = (MT.svcAdd[p.id] || 0) + 1; pinta(); $(`[data-pid="${p.id}"] .mt-mais`, v)?.focus({ preventScroll: true }); return; }
      const menos = e.target.closest('[data-menos]');
      if (menos) {
        const p = prices.find(x => x.id === menos.dataset.menos), L = p ? mtNoOrc(q, p) : []; if (!L.length) return;
        const i = L[L.length - 1]; i.qty = Math.round((i.qty - 1) * 100) / 100;
        if (i.qty <= 0) q.items = q.items.filter(x => x !== i);
        if (MT.svcAdd[p.id]) { MT.svcAdd[p.id]--; if (MT.svcAdd[p.id] <= 0) delete MT.svcAdd[p.id]; }
        touch(q); pinta(); ($(`[data-pid="${p.id}"] [data-menos]`, v) || $(`[data-pid="${p.id}"] .mt-mais`, v))?.focus({ preventScroll: true }); return;
      }
      const qd = e.target.closest('[data-qtd]');
      if (qd) { const p = prices.find(x => x.id === qd.dataset.qtd), i = p && mtNoOrc(q, p)[0]; if (i) lineSheet(q, i); return; }
      if (e.target.closest('[data-fora]')) customItemSheet(q, MT.kind, MT.q.trim(), MT.room);
    });
  },
};

/* ---------- o cliente: pedido só quando a proposta vai sair ---------- */
function clienteSheet(q, depois) {
  const rel = isReport(q), pede = typeof depois === 'function';
  openSheet({ title: pede ? (rel ? 'Para quem foi o serviço?' : 'Para quem é a proposta?') : 'Cliente e serviço',
    body: `${pede ? `<p class="hint">Só o nome é obrigatório. O resto sai no documento quando você preencher.</p>` : ''}
      <div class="field"><label for="q-name">Nome do cliente</label><input id="q-name" type="text" autocapitalize="words" autocomplete="off" maxlength="80" placeholder="Nome do cliente" value="${esc(q.client.name)}"></div>
      <div class="field"><label for="q-phone">WhatsApp <span class="lab-opt">opcional</span></label><input id="q-phone" type="tel" inputmode="tel" autocomplete="off" placeholder="(11) 90000-0000" value="${esc(fmtPhone(q.client.phone))}"></div>
      <div class="field"><label for="q-addr">Endereço da obra <span class="lab-opt">opcional</span></label><input id="q-addr" type="text" autocomplete="off" placeholder="Rua, número, bairro" value="${esc(q.client.address)}"></div>
      <div class="field"><label for="q-doc">CPF ou CNPJ <span class="lab-opt">opcional</span></label><input id="q-doc" type="text" inputmode="numeric" autocomplete="off" placeholder="Sai na proposta e no recibo" value="${esc(fmtDoc(q.client.doc))}"></div>
      <div class="field"><label for="q-title">Serviço, em uma linha <span class="lab-opt">opcional</span></label><input id="q-title" type="text" autocomplete="off" maxlength="120" placeholder="Ex.: Troca do quadro e instalação de chuveiro" value="${esc(q.title)}"></div>`,
    foot: `<button class="btn primary" data-ok>${pede ? (rel ? 'Ver relatório' : 'Ver proposta') : 'Salvar'}${pede ? I.arrow : ''}</button>`,
    onClose: () => { if (route().name === 'quote' || route().name === 'preview') rerender(); },
    onMount: s => {
      const nm = $('#q-name', s), ph = $('#q-phone', s), ad = $('#q-addr', s), dc = $('#q-doc', s), tt = $('#q-title', s);
      nm.addEventListener('input', () => { nm.removeAttribute('aria-invalid'); q.client.name = nm.value.replace(/\s+/g, ' ').trimStart(); touch(q); });
      attachSuggest(nm, () => { const qf = fold(nm.value); return clientList().filter(k => !qf || fold(k.name).includes(qf)).slice(0, 6).map(k => ({ label: k.name, right: k.phone ? fmtPhone(k.phone) : k.address, k })); }, x => {
        nm.value = q.client.name = x.k.name;
        if (!q.client.phone) { q.client.phone = x.k.phone || ''; ph.value = fmtPhone(q.client.phone); }
        if (!q.client.address) { q.client.address = x.k.address || ''; ad.value = q.client.address; }
        if (!q.client.doc) { q.client.doc = x.k.doc || ''; dc.value = fmtDoc(q.client.doc); }
        touch(q);
      });
      ph.addEventListener('input', () => { q.client.phone = ph.value.trim(); touch(q); });
      ph.addEventListener('change', () => { ph.value = fmtPhone(ph.value); });
      ad.addEventListener('input', () => { q.client.address = ad.value; touch(q); });
      dc.addEventListener('input', () => { q.client.doc = dc.value.trim(); touch(q); });
      dc.addEventListener('change', () => {
        const d = phoneDigits(dc.value); dc.value = fmtDoc(dc.value); if (!d) return;
        if (d.length === 11 && !cpfValid(d)) toast('Esse CPF parece ter um número errado. Confira.');
        else if (d.length === 14 && !cnpjValid(d)) toast('Esse CNPJ parece ter um número errado. Confira.');
        else if (d.length !== 11 && d.length !== 14) toast('O CPF tem 11 números e o CNPJ tem 14.');
      });
      tt.addEventListener('input', () => { q.title = tt.value; touch(q); });
      $('[data-ok]', s).onclick = () => {
        q.client.name = nm.value.trim().replace(/\s+/g, ' '); q.title = tt.value.trim(); touch(q);
        // o campo que falta é apontado, sem receber o foco (Código, Art. 68, § 5º)
        if (pede && !q.client.name) { nm.setAttribute('aria-invalid', 'true'); return toast('Diga o nome do cliente para gerar a proposta.'); }
        closeSheet(true); if (pede) depois(); else rerender();
      };
    } });
}
// a proposta só sai com o nome do cliente: quem ainda não disse, diz agora
function verProposta(q) {
  const ir = () => go('/q/' + q.id + '/proposta');
  if (!q.items.length && !isReport(q)) return toast('Some pelo menos um item antes de gerar a proposta.');
  if (q.client.name) ir(); else clienteSheet(q, ir);
}
