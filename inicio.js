/* Elétrica Fácil 2.0 · Início (o arranque do dia), Orçamentos (a lista) e Mais. */
'use strict';
/* ---------- cartões e lista de orçamentos ---------- */
let homeFilter = 'todos', homeQuery = '';
const pill = st => `<span class="pill st-${st}">${STATUS[st]}</span>`;
function quoteCard(q) {
  const c = compute(q);
  const when = { rascunho: 'editado ' + rel(q.updatedAt), enviado: 'enviado ' + rel(q.sentAt), aprovado: 'aprovado ' + rel(q.approvedAt), concluido: 'concluído em ' + (q.doneAt ? fmtShort(q.doneAt) : ''), recusado: 'recusado em ' + (q.refusedAt ? fmtShort(q.refusedAt) : '') }[q.status];
  const nudge = q.status === 'enviado' && daysSince(q.sentAt) >= 3 ? ' · <span class="nudge">vale cobrar resposta</span>' : '';
  return `<button class="qcard" data-open="${q.id}">
    <span class="qc-name">${esc(quoteNome(q))}</span>
    <span class="qc-total num">${BRL(c.total)}</span>
    <span class="qc-title">${esc(quoteSub(q))}</span>
    <span class="qc-pill">${pill(q.status)}</span>
    <span class="qc-meta">${q.example ? '<span class="tag-ex">Exemplo</span> · ' : esc(numLabel(q)) + ' · '}${esc(when)}${nudge}</span>
  </button>`;
}
// rascunho: arrastar o cartão para a esquerda mostra Excluir (o botão também recebe o foco pelo teclado e pelo leitor de tela)
const QC_DEL = 104;
function draftCard(q) {
  return `<div class="qswipe" data-swipe="${q.id}">${quoteCard(q)}<button class="qc-del" data-del-draft="${q.id}">${I.trash}<span>Excluir</span><span class="sr-only"> rascunho ${esc(quoteNome(q))}</span></button></div>`;
}
function excluiRascunho(id) {
  const q = getQ(id); if (!q) return;
  const idx = quotes.indexOf(q);
  quotes = quotes.filter(x => x !== q); saveQuotes(); rerender();
  toast('Rascunho excluído.', { label: 'Desfazer', run: () => { quotes.splice(Math.max(0, idx), 0, q); saveQuotes(); rerender(); } });
}
function bindSwipe(v) {
  let aberto = null, arrastou = false;
  // o vermelho fica atrás do cartão inteiro (sem emenda nos cantos) e só aparece enquanto o cartão sai do lugar
  const poe = (w, x) => {
    const c = $('.qcard', w); c.style.transform = x ? `translateX(${x}px)` : '';
    clearTimeout(w._t);
    if (x) w.classList.add('mexe'); else w._t = setTimeout(() => w.classList.remove('mexe'), KitFacil.movimento.reduzido() ? 0 : KitFacil.movimento.curto);
  };
  const fecha = () => { if (aberto) { poe(aberto, 0); aberto = null; } };
  $$('[data-swipe]', v).forEach(w => {
    const c = $('.qcard', w), del = $('.qc-del', w);
    let x0 = 0, y0 = 0, dx = 0, base = 0, modo = '', id = null;
    c.addEventListener('pointerdown', e => {
      if (e.button) return;
      if (aberto && aberto !== w) fecha();
      x0 = e.clientX; y0 = e.clientY; dx = 0; modo = ''; id = e.pointerId; base = aberto === w ? -QC_DEL : 0; arrastou = false;
    });
    c.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!modo) { if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) { modo = 'x'; c.setPointerCapture(id); w.classList.add('arrastando'); } else if (Math.abs(my) > 8) modo = 'y'; }
      if (modo !== 'x') return;
      dx = Math.max(-QC_DEL - 24, Math.min(0, base + mx)); poe(w, dx);
    });
    const solta = e => {
      if (e.pointerId !== id) return; id = null;
      w.classList.remove('arrastando');
      if (modo !== 'x') return;
      arrastou = true;
      if (dx < -QC_DEL / 2) { poe(w, -QC_DEL); aberto = w; } else { poe(w, 0); if (aberto === w) aberto = null; }
    };
    c.addEventListener('pointerup', solta); c.addEventListener('pointercancel', solta);
    // depois de arrastar, o toque não abre o orçamento; com Excluir à mostra, tocar no cartão só fecha
    c.addEventListener('click', e => {
      if (!arrastou && aberto !== w) return;
      e.stopPropagation(); e.preventDefault();
      if (arrastou) arrastou = false; else fecha();
    }, true);
    del.addEventListener('focus', () => { if (aberto && aberto !== w) fecha(); poe(w, -QC_DEL); aberto = w; });
    del.addEventListener('blur', () => setTimeout(() => { if (aberto === w && document.activeElement !== del) fecha(); }, 0));
    del.addEventListener('click', () => excluiRascunho(w.dataset.swipe));
  });
}
// Início: os orçamentos em seções (por situação; em Concluídos e Recusados, por mês), como no resto do app
const HOME_G = [['enviado', 'Aguardando resposta'], ['aprovado', 'Aprovados · a executar'], ['rascunho', 'Rascunhos'], ['concluido', 'Concluídos'], ['recusado', 'Recusados']];
function homeListHTML() {
  const qf = fold(homeQuery);
  const match = q => !qf || fold([q.client.name, q.title, numLabel(q), q.client.address, ...q.items.map(i => i.name)].join(' ')).includes(qf);
  const byDate = (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0);
  if (!quotes.length) return KitFacil.ui.vazio({ titulo: 'Nenhum orçamento ainda', texto: 'Os orçamentos que você fizer aparecem aqui, separados por situação.', acao: '<button type="button" class="kf-btn kf-comecar" data-new>Novo orçamento</button>' });
  const L = quotes.filter(q => (homeFilter === 'todos' || (homeFilter === 'aberto' ? ['rascunho', 'enviado', 'aprovado'].includes(q.status) : q.status === homeFilter)) && match(q)).sort(byDate);
  if (!L.length) return KitFacil.ui.vazio(qf ? { titulo: 'Nenhum orçamento encontrado', texto: 'Confira o nome do cliente, o serviço ou o número.' }
    : homeFilter === 'aberto' ? { titulo: 'Nenhum orçamento em aberto', texto: 'Rascunhos, enviados e aprovados aparecem aqui.' } : { titulo: 'Nada por aqui ainda', texto: 'Os orçamentos com esta situação aparecem aqui.' });
  let grupos;
  if (homeFilter === 'concluido' || homeFilter === 'recusado') {
    const quando = q => homeFilter === 'concluido' ? (q.doneAt || q.updatedAt) : (q.refusedAt || q.updatedAt);
    const meses = new Map();
    L.forEach(q => { const d = new Date(quando(q)), k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; if (!meses.has(k)) meses.set(k, []); meses.get(k).push(q); });
    grupos = [...meses].sort((a, b) => b[0].localeCompare(a[0])).map(([k, M]) => [`home:${homeFilter}:${k}`, capFirst(new Date(k + '-15T12:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })), M, '']);
  } else grupos = HOME_G.map(([st, l]) => [`home:${st}`, l, L.filter(q => q.status === st), st]).filter(g => g[2].length);
  return grupos.map(([key, l, M, st]) => panel(key, '', esc(l), qf ? null : resumoDe(M, quoteNome), `<div class="qlist">${M.map(q => q.status === 'rascunho' ? draftCard(q) : quoteCard(q)).join('')}</div>`,
    { right: conta(M.length), force: qf ? true : undefined, attrs: st ? ` id="grp-${st}"` : '' })).join('');
}

/* ---------- ícones das telas novas: um traço só (grade de 24, traço de 2, pontas redondas) ---------- */
const IN = {
  casa: ic('<path d="M4 11 12 4.500 20 11v8.500h-5.500v-5h-5v5H4z"/>'),
  folhas: ic('<path d="M8 3.500h7l4 4v13H8z"/><path d="M15 3.500v4h4M5 7v13.500h9M11.500 12.500h4M11.500 16.500h4"/>'),
  lampada: ic('<path d="M9 17.500h6M10 20.500h4"/><path d="M12 3.500a6 6 0 0 0-3.500 10.900c.600.500 1 1.200 1 2v1.100h5v-1.100c0-.800.400-1.500 1-2A6 6 0 0 0 12 3.500z"/>'),
  livro: ic('<path d="M4 5.500c2.500-1 5-1 8 .500 3-1.500 5.500-1.500 8-.500v13c-2.500-1-5-1-8 .500-3-1.500-5.500-1.500-8-.500z"/><path d="M12 6v13"/>'),
  exemplo: ic('<rect x="5" y="4.500" width="14" height="16" rx="2"/><path d="M9 4.500V3.500h6v1"/><path d="m10.500 10 4 2.500-4 2.500z"/>'),
  pessoa: ic('<circle cx="12" cy="8" r="3.500"/><path d="M5 20c.600-3.600 3.300-5.500 7-5.500s6.400 1.900 7 5.500"/>'),
};

/* ---------- Início: começar, o que pede atenção e o mês ---------- */
const rascunhoAtual = () => quotes.filter(q => q.status === 'rascunho' && !q.example && !isEmptyQuote(q)).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
const saudacao = () => { const h = new Date().getHours(), s = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite', n = firstName(settings.name); return n ? `${s}, ${n}.` : `${s}.`; };
// o que pede a atenção de quem abre o app: cobrar resposta, executar o que foi aprovado e receber o que falta
function pendencias() {
  const L = [];
  quotes.filter(q => !q.example).forEach(q => {
    const c = compute(q);
    if (q.status === 'enviado') { const d = daysSince(q.sentAt); L.push({ q, peso: d >= 3 ? 3 : 1, rot: d >= 3 ? 'Vale cobrar a resposta' : 'Aguardando resposta', sub: 'enviado ' + rel(q.sentAt), val: BRL(c.total) }); }
    else if (q.status === 'aprovado') L.push({ q, peso: 2, rot: 'Aprovado, a executar', sub: 'aprovado ' + rel(q.approvedAt), val: BRL(c.total) });
    else if (q.status === 'concluido' && falta(q, c) > 0) L.push({ q, peso: 2.5, rot: 'Falta receber', sub: 'concluído em ' + (q.doneAt ? fmtShort(q.doneAt) : ''), val: BRL(falta(q, c)) });
  });
  return L.sort((a, b) => b.peso - a.peso || (a.q.updatedAt || 0) - (b.q.updatedAt || 0));
}
VIEWS.home = {
  html() {
    const s = stats(), r = rascunhoAtual(), reais = quotes.filter(q => !q.example), j = jogoLigado() ? jogoEstado() : null;
    const needMe = !settings.name && !settings.company, P = pendencias();
    const lin = (rot, val, attrs = '') => `<${attrs ? 'button type="button"' : 'div'} class="vs-lin" ${attrs}><span>${rot}</span><b class="num">${val}</b>${attrs ? `<span class="lc" aria-hidden="true">${I.chev}</span>` : ''}</${attrs ? 'button' : 'div'}>`;
    return `${barraTopo()}<main class="page inicio">
      <h1 class="sr-only">Início</h1>
      <section class="arranque" aria-labelledby="ar-t">
        <span class="ar-fita" aria-hidden="true"></span>
        <p class="saud">${esc(saudacao())}</p>
        <h2 class="ar-t" id="ar-t">O que vai orçar hoje?</h2>
        <p class="ar-sub">Some os serviços na sua tabela. O nome do cliente fica para a proposta.</p>
        <button type="button" class="kf-btn kf-comecar ar-btn" data-novo>${I.plus}Novo orçamento</button>
        <button type="button" class="linkish ar-rel" data-relatorio>O serviço já foi feito? Registrar relatório</button>
      </section>
      ${r ? `<section class="card andamento" aria-label="Rascunho em andamento">
        <span class="and-rot">Rascunho · ${esc(numLabel(r))} · editado ${esc(rel(r.updatedAt))}</span>
        <b class="and-nome">${esc(quoteNome(r))}</b>
        <span class="and-sub">${plural(r.items.length, 'item', 'itens')} · <span class="num">${BRL(compute(r).total)}</span></span>
        <button type="button" class="btn primary block" data-open="${r.id}">Continuar o orçamento</button>
        <button type="button" class="kf-btn kf-perigo block" data-del-draft="${r.id}">Excluir este rascunho</button>
      </section>` : ''}
      ${needMe && reais.length ? KitFacil.ui.faixa({ tipo: 'dica', html: '<b>Seu nome ainda não sai na proposta.</b> Preencha seus dados e a chave Pix.', acao: '<button type="button" class="kf-btn kf-sec" data-aj="conta">Preencher meus dados</button>' }) : ''}
      ${P.length ? `<section class="pend" aria-labelledby="pend-t"><h2 class="sec-t" id="pend-t">Pede a sua atenção</h2>
        <div class="pend-lista">${P.slice(0, 4).map(x => `<button type="button" class="pend-lin st-${x.q.status}" data-open="${x.q.id}"><span class="pend-tx"><small>${esc(x.rot)} · ${esc(x.sub)}</small><b>${esc(quoteNome(x.q))}</b></span><span class="pend-val num">${x.val}</span><span class="lc" aria-hidden="true">${I.chev}</span></button>`).join('')}</div>
        ${P.length > 4 ? `<button type="button" class="linkish pend-mais" data-jump="enviado">Ver os ${P.length} em aberto</button>` : ''}</section>` : ''}
      <section class="visor mes" aria-labelledby="mes-t">
        <div class="vs-topo"><h2 id="mes-t">${esc(s.month)}</h2><span>${s.wonN ? plural(s.wonN, 'orçamento aprovado', 'orçamentos aprovados') : 'aprovado no mês'}</span></div>
        <div class="vs-num num">${BRL(s.won)}</div>
        <div class="vs-lins">
          ${lin('Aguardando resposta', s.waitN, 'data-jump="enviado"')}
          ${lin('Aprovados a executar', s.todoN, 'data-jump="aprovado"')}
          ${lin('A receber', BRL(s.receber))}
          ${lin('Aprovação em 90 dias', s.rate === null ? '–' : s.rate + '%')}
        </div>
      </section>
      ${j ? `<button type="button" class="card nivel-card nivel-ir" data-ir-conq aria-label="Conquistas: nível ${j.nivel}, ${esc(j.nome)}. ${esc(nivelTexto(j))}">${medidorHTML(j)}
        <span class="nivel-tx"><b class="nivel-nome">${esc(j.nome)}</b>
          <span class="barra-xp" aria-hidden="true"><i style="width:${j.prox ? j.prox.pct : 100}%"></i></span>
          <span class="hint">${j.proxima ? 'Próxima lâmpada: ' + esc(j.proxima.nome) : 'Varal completo: todas acesas'}</span></span>
        <span class="lc" aria-hidden="true">${I.chev}</span></button>` : ''}
      ${!reais.length ? `<section class="card atalhos" aria-label="Para conhecer o app">
        <button type="button" class="kf-mais-lin" data-guia><span class="kf-mais-ic">${IN.livro}</span><span class="kf-mais-tx"><b>Ver o guia</b><small>O app faz cada passo na tela e explica.</small></span>${I.chev}</button>
        <button type="button" class="kf-mais-lin" data-example><span class="kf-mais-ic">${IN.exemplo}</span><span class="kf-mais-tx"><b>Ver um orçamento de exemplo</b><small>Um orçamento pronto para mexer à vontade.</small></span>${I.chev}</button>
      </section>` : ''}
    </main>`;
  },
  bind(v) {
    $('[data-novo]', v).onclick = () => startQuote(null, false);
    $('[data-relatorio]', v).onclick = () => startQuote(null, true);
    $$('[data-open]', v).forEach(b => b.onclick = () => go('/q/' + b.dataset.open));
    $$('[data-del-draft]', v).forEach(b => b.onclick = () => excluiRascunho(b.dataset.delDraft));
    $$('[data-aj]', v).forEach(b => b.onclick = () => KitFacil.ajustes.ir(b.dataset.aj));
    $$('[data-jump]', v).forEach(b => b.onclick = () => { homeFilter = 'aberto'; homeQuery = ''; PANEL['home:' + b.dataset.jump] = true; go('/orcamentos', true); });
    $('[data-ir-conq]', v)?.addEventListener('click', () => go('/conquistas', true));
    $('[data-guia]', v)?.addEventListener('click', () => guiaIniciar());
    $('[data-example]', v)?.addEventListener('click', createExample);
  },
};

/* ---------- Orçamentos: a lista, por situação ---------- */
VIEWS.lista = {
  html() {
    const cnt = k => k === 'aberto' ? quotes.filter(q => ['rascunho', 'enviado', 'aprovado'].includes(q.status)).length : k === 'todos' ? quotes.length : quotes.filter(q => q.status === k).length;
    return `${barraTopo()}<main class="page">
      ${KitFacil.ui.cabecalho({ titulo: 'Orçamentos', sub: 'Tudo o que você orçou, por situação.' })}
      ${quotes.length ? `<div class="toolbar">
        ${quotes.length > 4 ? `<label class="search">${I.search}<input type="search" id="h-q" placeholder="Buscar cliente, serviço, item ou número" value="${esc(homeQuery)}" aria-label="Buscar orçamento"></label>` : ''}
        ${filtroSeg('data-filter', [['todos', 'Todos'], ['aberto', 'Em aberto'], ['concluido', 'Concluídos'], ['recusado', 'Recusados']], homeFilter, cnt, 'Filtrar')}
      </div>` : ''}
      <div class="qlist" id="q-list">${homeListHTML()}</div>
    </main>`;
  },
  bind(v) {
    v.addEventListener('click', e => {
      if (e.target.closest('[data-new]')) return createQuote();
      const b = e.target.closest('[data-open]'); if (b) return go('/q/' + b.dataset.open);
    });
    $$('[data-filter]', v).forEach(b => b.onclick = () => { homeFilter = b.dataset.filter; rerender(); });
    const sq = $('#h-q', v);
    if (sq) sq.addEventListener('input', () => { homeQuery = sq.value; $('#q-list').innerHTML = homeListHTML(); bindSwipe($('#q-list')); });
    bindSwipe(v);
  },
};

/* ---------- Mais: o que não cabe na barra e, por último, os Ajustes (Código, Art. 60, II) ---------- */
VIEWS.mais = {
  html() {
    const mats = (prices || []).filter(p => p.kind === 'mat' && p.stock > 0).length, minhas = tools.filter(t => t.k === 'item').length, j = jogoLigado() ? jogoEstado() : null;
    const linhas = [
      { id: 'gestao', titulo: 'Gestão', texto: `${plural(mats, 'material em estoque', 'materiais em estoque')}, ${plural(minhas, 'ferramenta', 'ferramentas')} e checklist`, icone: I.box },
      ...(j ? [{ id: 'conquistas', titulo: 'Conquistas', texto: `${plural(j.ganhas.length, 'lâmpada acesa', 'lâmpadas acesas')} de ${CONQUISTAS.length} no seu varal`, icone: IN.lampada }] : []),
      { id: 'guia', titulo: 'Ver o guia', texto: 'O app faz cada passo na tela e explica', icone: IN.livro },
      { id: 'exemplo', titulo: 'Abrir o orçamento de exemplo', texto: 'Um orçamento pronto para mexer à vontade', icone: IN.exemplo },
    ];
    return `${barraTopo()}<main class="page">
      ${KitFacil.ui.cabecalho({ titulo: 'Mais', sub: 'Gestão, conquistas, guia e ajustes.' })}
      ${KitFacil.nav.mais({ linhas })}
    </main>`;
  },
  bind() {},
};
