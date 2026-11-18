/* Elétrica Fácil 3 · Orçamentos (a tela que abre o app: um quadro por etapa, do pedido ao recibo) e Mais. */
'use strict';
let homeQuery = '', arquivoAberto = false;
const pill = st => `<span class="pill st-${st}">${STATUS[st]}</span>`;
/* ---------- o cartão de um orçamento no quadro ---------- */
function quoteCard(q) {
  const c = compute(q), f = falta(q, c);
  const nome = q.client.name || q.title || resumoItens(q) || docNome(q);
  const sub = q.client.name ? (q.title || resumoItens(q) || 'Sem itens ainda') : `Sem cliente ainda · ${plural(q.items.length, 'item', 'itens')}`;
  const pe = q.status === 'rascunho' ? 'Editado ' + rel(q.updatedAt)
    : q.status === 'enviado' ? `${daysSince(q.sentAt) >= 3 ? '<span class="pi al">Vale cobrar</span>' : ''}Enviado ${rel(q.sentAt)}`
    : q.status === 'aprovado' ? (q.dates.length && !q.dateTbd ? `${I.cal}${esc(capFirst(diasResumo(q.dates)))}` : 'Aprovado ' + rel(q.approvedAt))
    : q.status === 'concluido' ? (f ? `Falta receber · concluído em ${q.doneAt ? fmtShort(q.doneAt) : ''}` : `Recebido · concluído em ${q.doneAt ? fmtShort(q.doneAt) : ''}`)
    : `Recusado em ${q.refusedAt ? fmtShort(q.refusedAt) : ''}`;
  return `<button type="button" class="qcard" data-open="${q.id}"><b>${esc(nome)}</b><span class="v num">${BRL(q.status === 'concluido' && f ? f : c.total)}</span><small>${q.example ? '<span class="tag-ex">Exemplo</span> · ' : ''}${esc(sub)}</small><span class="w">${pe}</span></button>`;
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
/* ---------- o quadro: Rascunhos, Esperando resposta, Para executar, Para receber e Arquivo ---------- */
const QUADRO = [['Rascunhos', q => q.status === 'rascunho'], ['Esperando resposta', q => q.status === 'enviado'], ['Para executar', q => q.status === 'aprovado'], ['Para receber', q => q.status === 'concluido' && falta(q) > 0]];
const noArquivo = q => q.status === 'recusado' || (q.status === 'concluido' && falta(q) === 0);
const porData = (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0);
const etapaHTML = (nome, n, vz) => `<h2 class="et${vz ? ' vz' : ''}"><i></i>${nome} <span class="ct">${n}</span></h2>`;
function quadroHTML() {
  const qf = fold(homeQuery);
  if (qf) {
    const L = quotes.filter(q => fold([q.client.name, q.title, numLabel(q), q.client.address, ...q.items.map(i => i.name)].join(' ')).includes(qf)).sort(porData);
    return L.length ? `<div class="qlist">${L.map(quoteCard).join('')}</div>` : KitFacil.ui.vazio({ titulo: 'Nenhum orçamento encontrado', texto: 'Confira o nome do cliente, o serviço ou o número.' });
  }
  const arq = quotes.filter(noArquivo).sort(porData);
  const col = QUADRO.map(([nome, f]) => { const L = quotes.filter(f).sort(porData); return L.length ? etapaHTML(nome, L.length) + L.map(q => q.status === 'rascunho' ? draftCard(q) : quoteCard(q)).join('') : ''; }).join('');
  return `<div class="qd">${col}${arq.length ? etapaHTML('Arquivo', arq.length, true) : ''}</div>
    ${arq.length ? `<div class="sx arq${arquivoAberto ? ' ab' : ''}"><button type="button" class="st" data-arquivo aria-expanded="${arquivoAberto}">Concluídos e recusados<span class="ct"></span>${I.chev}</button>${arquivoAberto ? `<div class="sx-in qlist">${arq.map(quoteCard).join('')}</div>` : ''}</div>` : ''}`;
}

/* ---------- ícones das telas novas: um traço só (grade de 24, traço de 2, pontas redondas) ---------- */
const IN = {
  obra: ic('<path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7.500a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8.500 9V6.500a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V9"/><path d="M3 14h6.500M14.500 14H21M9.500 12.500h5v3h-5z"/>'),
  ferramenta: ic('<g transform="rotate(45 12 12)"><rect x="9" y="-.500" width="6" height="9.500" rx="2.400"/><path d="M10.500 9v2.500h3V9M12 11.500v9.500M10.300 25l.700-4h2l.700 4z"/></g>'),
  casa: ic('<path d="M4 11 12 4.500 20 11v8.500h-5.500v-5h-5v5H4z"/>'),
  folhas: ic('<path d="M8 3.500h7l4 4v13H8z"/><path d="M15 3.500v4h4M5 7v13.500h9M11.500 12.500h4M11.500 16.500h4"/>'),
  lampada: ic('<path d="M9 17.500h6M10 20.500h4"/><path d="M12 3.500a6 6 0 0 0-3.500 10.900c.600.500 1 1.200 1 2v1.100h5v-1.100c0-.800.400-1.500 1-2A6 6 0 0 0 12 3.500z"/>'),
  livro: ic('<path d="M4 5.500c2.500-1 5-1 8 .500 3-1.500 5.500-1.500 8-.500v13c-2.500-1-5-1-8 .500-3-1.500-5.500-1.500-8-.500z"/><path d="M12 6v13"/>'),
  exemplo: ic('<rect x="5" y="4.500" width="14" height="16" rx="2"/><path d="M9 4.500V3.500h6v1"/><path d="m10.500 10 4 2.500-4 2.500z"/>'),
  pessoa: ic('<circle cx="12" cy="8" r="3.500"/><path d="M5 20c.600-3.600 3.300-5.500 7-5.500s6.400 1.900 7 5.500"/>'),
};

VIEWS.home = {
  html() {
    const s = stats(), reais = quotes.filter(q => !q.example), j = jogoLigado() ? jogoEstado() : null;
    const semNome = !settings.name && !settings.company;
    return `${barraTopo()}<main class="page orc">
      ${KitFacil.ui.cabecalho({ titulo: 'Orçamentos', sub: 'Do pedido ao recibo, por etapa.' })}
      <button type="button" class="kf-btn kf-comecar ar-btn" data-novo>${I.plus}Novo orçamento</button>
      <button type="button" class="linkish ar-rel" data-relatorio>O serviço já foi feito? Registrar relatório</button>
      ${semNome && reais.length ? KitFacil.ui.faixa({ tipo: 'dica', html: '<b>Seu nome ainda não sai no documento.</b> Preencha seus dados e a chave Pix.', acao: '<button type="button" class="kf-btn kf-sec" data-aj="conta">Preencher meus dados</button>' }) : ''}
      ${quotes.length ? `<div id="q-list">${quadroHTML()}</div>
        ${quotes.length > 4 ? `<label class="search">${I.search}<input type="search" id="h-q" placeholder="Buscar cliente ou serviço" value="${esc(homeQuery)}" aria-label="Buscar em todos os orçamentos"></label>` : ''}`
      : `<div class="vaz"><span class="ci">${I.doc}</span><b>Nenhum orçamento ainda</b><p>Eles aparecem aqui por etapa: rascunho, esperando resposta, para executar e para receber.</p><button type="button" class="btn sm" data-example>Abrir o orçamento de exemplo</button></div>`}
      ${reais.length ? `<section class="vs" aria-label="O mês"><h2>${esc(s.month)}</h2><p class="gr num">${BRL(s.won)}</p><p class="gs2">aprovado no mês${s.wonN ? `, em ${plural(s.wonN, 'orçamento', 'orçamentos')}` : ''}</p>
        <dl><div><dt>A receber</dt><dd class="num">${BRL(s.receber)}</dd></div><div><dt>Aprovação em 90 dias</dt><dd class="num">${s.rate === null ? '–' : s.rate + '%'}</dd></div></dl></section>` : ''}
      ${j ? `<button type="button" class="card varalzinho" data-ir-conq aria-label="Conquistas: nível ${j.nivel}, ${esc(j.nome)}. ${plural(j.ganhas.length, 'lâmpada acesa', 'lâmpadas acesas')} de ${CONQUISTAS.length}">
        <span class="vz-t"><b>Nível ${j.nivel} · ${esc(j.nome)}</b><span>${j.ganhas.length} de ${CONQUISTAS.length} lâmpadas</span></span>
        <span class="mv" aria-hidden="true">${CONQUISTAS.map(c => `<i${j.ganhas.includes(c.id) ? ' class="on"' : ''}></i>`).join('')}</span>
        <span class="hint">${j.proxima ? 'Próxima: ' + esc(j.proxima.nome) + '.' : 'Varal completo: todas acesas.'}</span></button>` : ''}
      ${!reais.length && quotes.length ? '' : ''}
    </main>`;
  },
  bind(v) {
    $('[data-novo]', v).onclick = () => startQuote(null, false);
    $('[data-relatorio]', v).onclick = () => startQuote(null, true);
    v.addEventListener('click', e => {
      const b = e.target.closest('[data-open]'); if (b) return go('/q/' + b.dataset.open);
      if (e.target.closest('[data-arquivo]')) { arquivoAberto = !arquivoAberto; $('#q-list', v).innerHTML = quadroHTML(); bindSwipe($('#q-list', v)); $('[data-arquivo]', v)?.focus({ preventScroll: true }); }
    });
    $$('[data-aj]', v).forEach(b => b.onclick = () => KitFacil.ajustes.ir(b.dataset.aj));
    $('[data-ir-conq]', v)?.addEventListener('click', () => go('/conquistas', true));
    $('[data-example]', v)?.addEventListener('click', createExample);
    const sq = $('#h-q', v);
    if (sq) sq.addEventListener('input', () => { homeQuery = sq.value; $('#q-list', v).innerHTML = quadroHTML(); bindSwipe($('#q-list', v)); });
    bindSwipe(v);
  },
};

/* ---------- Mais: o que não cabe na barra e, por último, os Ajustes (Código, Art. 60, II) ---------- */
VIEWS.mais = {
  html() {
    const j = jogoLigado() ? jogoEstado() : null;
    const linhas = [
      ...(j ? [{ id: 'conquistas', titulo: 'Conquistas', texto: `Nível ${j.nivel} · ${plural(j.ganhas.length, 'lâmpada acesa', 'lâmpadas acesas')} de ${CONQUISTAS.length}`, icone: IN.lampada }] : []),
      { id: 'guia', titulo: 'Ver o guia', texto: 'O app faz cada passo na tela e explica.', icone: IN.livro },
      { id: 'exemplo', titulo: 'Abrir o orçamento de exemplo', texto: 'Um orçamento pronto para mexer à vontade.', icone: IN.exemplo },
    ];
    return `${barraTopo()}<main class="page">
      ${KitFacil.ui.cabecalho({ titulo: 'Mais', sub: j ? 'Conquistas, guia, exemplo e ajustes.' : 'Guia, exemplo e ajustes.' })}
      ${KitFacil.nav.mais({ linhas })}
    </main>`;
  },
  bind() {},
};
