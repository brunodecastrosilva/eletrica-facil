/* Elétrica Fácil 3 · a folha: o orçamento é montado no próprio documento do cliente.
   Linha cheia sai no documento; o tracejado é só de quem monta. No alto, o bastidor (as cinco etapas e o que falta);
   no pé, o total e o botão amarelo, que é sempre o próximo passo: Enviar, Aprovou, Concluir, Receber e Recibo. */
'use strict';

const ETAPAS = ['Rascunho', 'Enviado', 'Aprovado', 'Concluído', 'Recebido'];
const FO = { aberta: null, janela: null };
const quitado = (q, c = compute(q)) => q.status === 'concluido' && recebido(q) > 0 && falta(q, c) === 0;
const etapaDe = (q, c = compute(q)) => quitado(q, c) ? 4 : ({ rascunho: 0, enviado: 1, recusado: 1, aprovado: 2, concluido: 3 })[q.status];
const trilhoHTML = n => `<div class="rl" role="img" aria-label="Etapa ${n + 1} de 5: ${ETAPAS[n]}">${ETAPAS.map((e, k) => `<span class="rs${k < n ? ' ok' : k === n ? ' at' : ''}"><i></i>${e}</span>`).join('')}</div>`;
const docNome = q => (isReport(q) ? 'Relatório ' : 'Orçamento ') + numLabel(q);
const LAPIS = ic('<path d="M12 20h9"/><path d="M16.5 3.500a2.100 2.100 0 0 1 3 3L7 19l-4 1 1-4z"/>');
const somarBtn = (rot, attrs) => `<button type="button" class="ad" ${attrs}><span class="pl">${I.plus}</span>${rot}</button>`;

/* ---------- o bastidor: onde o serviço está e o que dá para fazer agora ---------- */
function pagosLista(q) {
  return (q.pagos || []).length ? `<ul class="bd-pg">${q.pagos.map(x => `<li><span>Recebido em ${fmtShort(x.t)}</span><b class="num">${BRL(x.v)}</b><button class="icon-btn sm" data-pago-rm="${x.id}" aria-label="Apagar o pagamento de ${BRL(x.v)} de ${fmtDate(x.t)}">${I.x}</button></li>`).join('')}</ul>` : '';
}
function bastidorHTML(q, c) {
  const n = etapaDe(q, c), px = pixOf(q, c), f = falta(q, c);
  let txt = '', ac = '';
  if (q.example) txt = `<p><b>Orçamento de exemplo.</b> Mexa à vontade.</p><p class="m">Para apagar, toque em ⋯ e em Excluir.</p>`;
  else if (q.status === 'rascunho') txt = `<p><b>Rascunho</b>, salvo neste aparelho.</p><p class="m">O tracejado é só seu: não sai no documento.</p>`;
  if (q.status === 'enviado') {
    txt = `<p><b>Enviado ${rel(q.sentAt)}</b>${q.client.name ? `, para ${esc(q.client.name)}` : ''}.</p>${q.validity ? `<p class="m">A proposta vale até ${fmtDate(c.validUntil)}.</p>` : ''}`;
    ac = `<a class="btn sm gfo" href="${waLink(q.client.phone, followMessage(q, c))}" target="_blank" rel="noopener">${I.wa}Lembrar no WhatsApp</a><button class="btn sm gfo" data-st="recusado">Recusou</button>`;
  }
  if (q.status === 'aprovado') {
    txt = `<p><b>Aprovado ${rel(q.approvedAt)}</b>${q.approvedVia ? `, ${({ msg: 'por mensagem', sign: 'com assinatura', verbal: 'pessoalmente' })[q.approvedVia]}` : ''}.</p>${schedText(q) ? `<p class="m">Execução: ${esc(schedText(q))}</p>` : ''}
      <dl>${c.entry ? `<div><dt>Entrada combinada</dt><dd>${BRL(c.entry)}</dd></div>` : ''}<div><dt>Recebido</dt><dd>${BRL(recebido(q))}</dd></div></dl>${pagosLista(q)}`;
    ac = `${px ? `<button class="btn sm gfo" data-pix>${I.pix}Pix d${px.what}</button>` : ''}<button class="btn sm gfo" data-pago>Registrar pagamento</button>`;
  }
  if (q.status === 'concluido') {
    txt = `<p><b>${esc(execHead(q))}.</b>${q.warranty ? ` Garantia até ${fmtDate(maisDias(q.doneAt || Date.now(), q.warranty))}.` : ''}</p>
      <dl><div><dt>Recebido</dt><dd>${BRL(recebido(q))}</dd></div><div><dt>${f ? 'Falta receber' : 'Conta acertada'}</dt><dd>${f ? BRL(f) : I.check}</dd></div></dl>${pagosLista(q)}`;
    ac = `<button class="btn sm gfo" data-enviar>${I.share}Enviar relatório</button><button class="btn sm gfo" data-receipt>${I.receipt}Gerar recibo</button>`;
  }
  if (q.status === 'recusado') {
    txt = `<p><b>Recusado em ${fmtDate(q.refusedAt)}.</b> Fica no Arquivo.</p><p class="m">Se o cliente voltar atrás, reabra ou duplique.</p>`;
    ac = `<button class="btn sm gfo" data-st="rascunho">Reabrir como rascunho</button><button class="btn sm gfo" data-dup>Duplicar</button>`;
  }
  return `<section class="bd" aria-label="Situação">${trilhoHTML(n)}${txt}${ac ? `<div class="ac">${ac}</div>` : ''}</section>`;
}

/* ---------- a linha aberta: quantidade e preço mudam no lugar, sem sair da folha ---------- */
function editorHTML(q, i) {
  const p = prices.find(x => x.kind === i.kind && norm(x.name) === norm(i.name)), custo = abaixoCusto(q, i);
  return `<div class="ed" data-ed="${i.id}">
    <div class="r"><span class="rt" id="ed-q-l">Quantidade, em ${esc(unitTxt(2, i.unit))}</span><span class="qt"><button type="button" data-edq="-1" aria-label="Menos 1" ${i.qty <= 1 ? 'disabled' : ''}>${I.minus}</button><input id="ed-q" type="text" inputmode="decimal" value="${fmtQty(i.qty)}" aria-labelledby="ed-q-l"><button type="button" data-edq="1" aria-label="Mais 1">${I.plus}</button></span></div>
    <div class="r"><label class="rt" for="ed-p">Preço por ${esc(unitName(i.unit))}</label><input id="ed-p" class="num" type="text" inputmode="numeric" data-money value="${BRL(i.price)}" placeholder="R$ 0,00"></div>
    ${custo ? `<div class="fx ruim" role="status">${I.warn}<span>Abaixo do custo: você pagou <b>${BRL(custo)}</b> por ${esc(unitName(i.unit))}.</span></div>`
    : p && p.price !== i.price ? `<div class="fx" role="status"><span>Este preço vale só nesta proposta. Na sua tabela, está por <b>${BRL(p.price)}</b>.</span><button type="button" class="btn sm" data-ed-guardar>Guardar na tabela</button></div>` : ''}
    <div class="r"><button type="button" class="linkish" data-ed-mais>Mudar descrição ou unidade</button><button type="button" class="btn sm kf-perigo" data-ed-rm>${I.trash}Tirar</button></div>
  </div>`;
}

/* ---------- a folha ---------- */
function folhaHTML(q, c) {
  const s = settings, rep = isReport(q), mode = rep ? 'report' : 'quote', px = pixOf(q, c, mode);
  const biz = s.company || s.name;
  const sub = [[s.company && s.name ? s.name : '', s.phone ? fmtPhone(s.phone) : ''].filter(Boolean).join(' · '), [s.registro, s.city].filter(Boolean).join(' · ')].filter(Boolean);
  const cab = biz
    ? `<button type="button" class="fh" data-eu aria-label="Seus dados no documento"><span class="fm">${s.logo ? `<img src="${s.logo}" alt="">` : APP_MARK}</span><span class="fw"><b>${esc(biz)}</b>${sub.map(x => `<span>${esc(x)}</span>`).join('')}</span></button>`
    : `<button type="button" class="bk" data-eu>${LAPIS}<span>Seu nome e contato</span></button>`;
  const num = `<div class="fr"></div><div class="fn"><div><span class="lb">${rep ? 'Relatório de serviço' : 'Orçamento'}</span><b>${esc(numLabel(q))}</b></div><div class="fn-d"><span class="lb">${rep ? 'Executado' : 'Data'}</span><span class="dt">${rep ? esc(diasResumo(q.dates)) : fmtDate(q.createdAt)}</span></div></div>`;
  const cli = q.client;
  const quem = cli.name
    ? `<button type="button" class="fb" data-cli><span class="lb">Cliente</span><span class="tx">${esc(cli.name)}</span>${[cli.doc && fmtDoc(cli.doc), cli.phone && fmtPhone(cli.phone), cli.address].filter(Boolean).map(x => `<span class="s2">${esc(x)}</span>`).join('')}</button>`
    : `<div class="fb"><span class="lb">Cliente</span><button type="button" class="bk" data-cli>${LAPIS}<span>Fica em branco até o envio.</span></button></div>`;
  const oque = q.title
    ? `<button type="button" class="fb" data-titulo><span class="lb">${rep ? 'Serviço executado' : 'Serviço'}</span><span class="tx">${esc(q.title)}</span></button>`
    : `<div class="fb"><span class="lb">${rep ? 'Serviço executado' : 'Serviço'}</span><button type="button" class="bk" data-titulo>${LAPIS}<span>${rep ? 'Diga o que foi feito, em uma linha.' : 'Dê um nome ao serviço, se quiser.'}</span></button></div>`;

  // relatório: diagnóstico, serviços realizados, testes e recomendações
  const par = t => String(t || '').trim().split('\n').filter(Boolean).map(l => `<p class="pt">${esc(l)}</p>`).join('');
  const bloco = (k, rot, somar) => `<div class="fb"><span class="lb">${rot}</span>${k === 'tests' ? q.tests.map(t => `<div class="ck">${I.check}<span>${esc(t)}</span></div>`).join('') : q[k].trim() ? `<button type="button" class="tx-b" data-j="tec:${k}" aria-label="Alterar ${rot.toLowerCase()}">${par(q[k])}</button>` : ''}${somarBtn(somar, `data-j="tec:${k}"`)}</div>`;
  const laudo = rep ? bloco('diag', 'Diagnóstico', 'Somar diagnóstico') + bloco('work', 'Serviços realizados', 'Somar serviço feito') + bloco('tests', 'Testes e verificações', 'Somar teste') + bloco('recs', 'Recomendações', 'Somar recomendação') : '';

  // itens
  const linha = i => {
    const fora = i.kind === 'mat' && !c.matIn, ab = FO.aberta === i.id;
    return `<button type="button" class="ln${fora ? ' cli' : ''}${ab ? ' on' : ''}" data-ln="${i.id}" aria-expanded="${ab}" aria-label="Alterar ${esc(i.name)}"><span><b>${esc(i.name)}</b><small>${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)} × ${BRL(priceShow(c, i))}</small>${abaixoCusto(q, i) ? `<small class="ln-w">${I.warn}Abaixo do seu custo</small>` : ''}</span><span class="v">${BRL(lineShow(c, i))}</span></button>${ab ? editorHTML(q, i) : ''}`;
  };
  const notaCli = `<p class="nt">${rep ? 'Fornecido pelo cliente: valores de referência, fora do total.' : 'Por conta do cliente: valores estimados, fora do total.'}</p>`;
  const sugere = !q.useRooms && !c.mat.length && materialSugerido(q).length ? `<div class="fx" role="status"><span>Há material sugerido para os serviços que você somou.</span><button type="button" class="btn sm" data-sugerido>Ver material sugerido</button></div>` : '';
  let itens;
  if (q.useRooms) {
    itens = roomList(q).map(g => {
      const svc = g.items.filter(i => i.kind === 'svc'), mat = g.items.filter(i => i.kind === 'mat');
      const st = sum(svc.map(lineTotal)) + (c.matIn ? sum(mat.map(lineTotal)) : 0);
      const cab2 = g.id ? `<button type="button" class="sh amb" data-room-menu="${g.id}" aria-label="Ambiente ${esc(g.name)}: opções"><span class="lb">${esc(g.name)}${LAPIS}</span><span class="num">${BRL(st)}</span></button>` : `<div class="sh amb"><span class="lb">${esc(g.name)}</span><span class="num">${BRL(st)}</span></div>`;
      return cab2 + [...svc, ...mat].map(linha).join('') + somarBtn('Somar em ' + esc(g.name), `data-add-room="${g.id}"`);
    }).join('') + `<div class="amb-novo">${somarBtn('Novo ambiente', 'data-new-room')}</div>` + (c.mat.length && !c.matIn ? notaCli : '');
  } else {
    itens = `<div class="sh"><span class="lb">Mão de obra</span></div>${c.svc.map(linha).join('')}${somarBtn('Somar serviço', 'data-add="svc"')}
      <div class="sh"><span class="lb">Material${c.mat.length && !c.matIn ? ' por conta do cliente' : ''}</span></div>${c.mat.length && !c.matIn ? notaCli : ''}${sugere}${c.mat.map(linha).join('')}${somarBtn('Somar material', 'data-add="mat"')}`;
  }

  // o total
  const tl = (rot, val, botao) => botao ? `<button type="button" class="tl" data-j="total"><span>${rot}</span><b>${val}</b></button>` : `<div class="tl"><span>${rot}</span><b>${val}</b></div>`;
  const total = `<div class="tts">
    ${tl('Mão de obra', BRL(c.labor))}
    ${c.extra ? tl(`Adicionais (+${c.surPct}%)`, BRL(c.extra), true) : ''}
    ${c.mat.length ? tl(`Material${c.matIn ? '' : ' por conta do cliente'}`, c.matIn ? BRL(c.matTotal) : '—') : ''}
    ${c.travel ? tl(`Deslocamento${q.trip ? ` <small>· ${esc(tripShort(q.trip))}</small>` : ''}`, BRL(c.travel), true) : ''}
    ${c.discount ? tl(`Desconto${q.discount.mode === 'pct' ? ` de ${fmtQty(q.discount.pct)}%` : ''}`, '− ' + BRL(c.discount), true) : ''}
    ${c.taxFora ? tl(esc(taxLabel(c)), BRL(c.taxFora), true) : ''}
    ${somarBtn('Acertar o total', 'data-j="total"')}<p class="nt">Deslocamento, adicional, desconto e imposto.</p>
    <div class="tg"><span>TOTAL</span><b>${BRL(c.total)}</b></div></div>`;

  // as condições
  const cn = (rot, txt, j) => `<button type="button" class="cn" data-j="${j}"><span class="lb">${rot}</span><span>${esc(txt)}</span>${I.chev}</button>`;
  const conds = `<div class="cns">
    ${rep ? cn('Execução', capFirst(execText(q)), 'prazo') : ''}
    ${rep && approvalText(q) ? cn('Aprovação', approvalText(q), 'aprov') : ''}
    ${cn('Pagamento', payText(q, c) + (outrasTxt(q) ? ' Ou, se preferir: ' + outrasTxt(q) : ''), 'pag')}
    ${!rep ? cn(schedText(q) ? 'Execução' : 'Prazo', [schedText(q), prazoDoc(q)].filter(Boolean).join(' Prazo: ') || 'Combinar com o cliente.', 'prazo') : ''}
    ${cn('Garantia', q.warranty ? warrantyText(q, mode) : 'Sem garantia informada.', 'gar')}
    ${!rep ? cn('Validade', q.validity ? `Proposta válida até ${fmtDate(c.validUntil)}.` : 'Sem validade informada.', 'gar') : ''}
    ${c.extra ? cn('Adicionais', `${extrasText(q)}, sobre a mão de obra.`, 'total') : ''}
    ${q.trip && c.travel ? cn('Deslocamento', tripLong(q.trip), 'total') : ''}</div>`;
  const pix = px ? `<div class="px"><canvas data-qr width="200" height="200" aria-label="QR code do Pix"></canvas><div><b>Pague ${px.what} com Pix: ${BRL(px.value)}</b><span>Chave: ${esc(px.key)}</span><span>Abra o app do banco e leia o QR code.</span></div></div>` : '';
  const fim = `${q.warranty && s.warrantyTerms.trim() ? `<div class="fb"><span class="lb">Condições da garantia</span><p class="pt">${esc(s.warrantyTerms.trim())}</p></div>` : ''}
    <div class="fb"><span class="lb">Observações</span>${q.notes.trim() ? `<button type="button" class="tx-b" data-j="obs" aria-label="Alterar observações">${par(q.notes)}</button>` : ''}${somarBtn('Somar observação', 'data-j="obs"')}</div>
    ${!rep && (approvalText(q) || s.acceptText.trim()) ? `<p class="pt ac">${esc(approvalText(q) || s.acceptText.trim())}</p>` : ''}
    <div class="sg"><div><b>${esc(cli.name || 'Cliente')}</b><span>${rep ? 'Serviço recebido pelo cliente' : 'Cliente'}</span></div><div><b>${esc(s.name || s.company || 'Responsável')}</b><span>Responsável pelo serviço</span></div></div>`;
  return `${cab}${num}${quem}${oque}${laudo}${itens}${total}${conds}${pix}${fim}`;
}
// material sugerido pelos serviços somados (a composição de cada serviço), que ainda não está na folha
function materialSugerido(q) {
  const tem = new Set(q.items.filter(i => i.kind === 'mat').map(i => norm(i.name))), L = [];
  q.items.filter(i => i.kind === 'svc').forEach(i => { const p = prices.find(x => x.kind === 'svc' && norm(x.name) === norm(i.name)); (p && p.comp || []).forEach(m => { if (!tem.has(norm(m.n))) L.push(m); }); });
  return L;
}

/* ---------- o pé: o total e o próximo passo ---------- */
function proximo(q, c) {
  if (q.status === 'rascunho') return ['enviar', 'Enviar' + I.arrow];
  if (q.status === 'enviado') return ['aprovou', 'Aprovou'];
  if (q.status === 'aprovado') return ['concluir', 'Concluir'];
  if (q.status === 'concluido') return falta(q, c) > 0 ? ['receber', 'Receber'] : ['recibo', 'Recibo'];
  return ['reabrir', 'Reabrir'];
}
function visorHTML(q, c) {
  const f = falta(q, c), [k, rot] = proximo(q, c);
  const [lab, val] = q.status === 'concluido' ? (f ? ['Falta receber', f] : ['Recebido', recebido(q) || c.payTotal]) : [payLabel(q, c), c.payTotal];
  return `<div class="bb-total"><small>${lab}</small><b class="num">${BRL(val)}</b></div>
    <button class="icon-btn boxed" data-menu aria-label="Mais opções">${I.more}</button>
    <button class="btn primary" data-prox="${k}">${rot}</button>`;
}
const subtDe = q => q.example ? 'Exemplo' : ({ rascunho: 'Rascunho', enviado: q.sentAt ? `Enviado em ${fmtShort(q.sentAt)}` : 'Enviado', aprovado: q.approvedAt ? `Aprovado em ${fmtShort(q.approvedAt)}` : 'Aprovado', concluido: q.doneAt ? `Concluído em ${fmtShort(q.doneAt)}` : 'Concluído', recusado: q.refusedAt ? `Recusado em ${fmtShort(q.refusedAt)}` : 'Recusado' })[q.status];

VIEWS.quote = {
  html(r) {
    const q = getQ(r.id), c = compute(q);
    if (FO.aberta && !q.items.some(i => i.id === FO.aberta)) FO.aberta = null;
    return `<header class="kf-barra appbar"><div class="kf-barra-in">
      <button class="icon-btn" data-back aria-label="Voltar">${I.back}</button>
      <div class="ab-title"><span class="ab-main" id="ab-name">${esc(docNome(q))}</span><span class="ab-row"><span class="ab-eyebrow">${esc(subtDe(q))}</span><span class="ab-saved" id="ab-saved" role="status" aria-label="Alterações salvas neste aparelho">${I.check}<span>Salvo</span></span></span></div>
      ${KitFacil.topo.html({ principal: false })}
    </div></header>
    <main class="page bar fo">
      <h1 class="sr-only">${esc(docNome(q))}</h1>
      <div class="fo-lado"><div id="fo-bd">${bastidorHTML(q, c)}</div><div class="bbar"><div class="bbar-in visor-pe" id="fo-visor">${visorHTML(q, c)}</div></div></div>
      <article class="fl" id="fo-folha" aria-label="${isReport(q) ? 'Relatório' : 'Proposta'}">${folhaHTML(q, c)}</article>
    </main>`;
  },
  bind(v, r) {
    const q = getQ(r.id);
    $('[data-back]', v).onclick = () => back('/');
    ligarFolha(v, q);
    desenharQR(v, q);
  },
};
function desenharQR(v, q) {
  const cv = $('canvas[data-qr]', v); if (!cv) return;
  const px = pixOf(q, compute(q), isReport(q) ? 'report' : 'quote'); if (!px) return;
  qrMatrix(pixPayload(px)).then(m => drawQR(cv.getContext('2d'), m, 0, 0, 200)).catch(() => { cv.hidden = true; });
}
// redesenha só a folha, o bastidor e o pé (enquanto se digita numa janela ou numa linha aberta)
function pintarFolha() {
  const r = route(); if (r.name !== 'quote') return;
  const q = getQ(r.id), v = $('#app'); if (!q || !v) return;
  const c = compute(q), foco = document.activeElement && document.activeElement.id, dentro = foco && $('#fo-folha').contains(document.activeElement);
  const pos = dentro ? document.activeElement.selectionStart : null;
  $('#fo-folha', v).innerHTML = folhaHTML(q, c); $('#fo-bd', v).innerHTML = bastidorHTML(q, c); $('#fo-visor', v).innerHTML = visorHTML(q, c);
  prepFields($('#fo-folha', v)); desenharQR(v, q);
  if (dentro) { const el = document.getElementById(foco); if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(pos, pos); } catch {} } }
}

/* ---------- os toques na folha, no bastidor e no pé (um ouvinte só, na tela) ---------- */
function ligarFolha(v, q) {
  const item = id => q.items.find(x => x.id === id);
  const edAtual = () => item(FO.aberta);
  v.addEventListener('click', e => {
    const t = s => e.target.closest(s);
    let b;
    if ((b = t('[data-ln]'))) { FO.aberta = FO.aberta === b.dataset.ln ? null : b.dataset.ln; pintarFolha(); if (FO.aberta) $(`[data-ed="${FO.aberta}"]`, v)?.scrollIntoView({ block: 'nearest', behavior: semMovimento() ? 'auto' : 'smooth' }); return; }
    if ((b = t('[data-edq]'))) { const i = edAtual(); if (!i) return; i.qty = Math.max(1, Math.round((i.qty + +b.dataset.edq) * 100) / 100); touch(q); pintarFolha(); $(`[data-edq="${b.dataset.edq}"]`, v)?.focus({ preventScroll: true }); return; }
    if (t('[data-ed-rm]')) { const i = edAtual(); if (i) { FO.aberta = null; removeLine(q, i.id); } return; }
    if (t('[data-ed-mais]')) { const i = edAtual(); if (i) lineSheet(q, i); return; }
    if (t('[data-ed-guardar]')) {
      const i = edAtual(), p = i && prices.find(x => x.kind === i.kind && norm(x.name) === norm(i.name)); if (!p) return;
      const antes = p.price, ref = p.ref; p.price = i.price; p.ref = false; savePrices(); pintarFolha();
      toast(`${BRL(i.price)} guardado na sua tabela.`, { label: 'Desfazer', run: () => { p.price = antes; p.ref = ref; savePrices(); pintarFolha(); } }); return;
    }
    if (t('[data-eu]')) return KitFacil.ajustes.ir('conta');
    if (t('[data-cli]')) return clienteSheet(q);
    if (t('[data-titulo]')) return tituloJanela(q);
    if ((b = t('[data-add]'))) return somarJanela(q, b.dataset.add, '');
    if ((b = t('[data-add-room]'))) return somarJanela(q, 'svc', b.dataset.addRoom);
    if ((b = t('[data-room-menu]'))) return roomMenu(q, b.dataset.roomMenu);
    if (t('[data-new-room]')) return roomAddSheet(q);
    if (t('[data-sugerido]')) { const add = {}; q.items.filter(i => i.kind === 'svc').forEach(i => { const p = prices.find(x => x.kind === 'svc' && norm(x.name) === norm(i.name)); if (p && (p.comp || []).length) add[p.id] = i.qty; }); return sugerirMaterial(q, add, ''); }
    if ((b = t('[data-j]'))) return abrirJanela(q, b.dataset.j);
    if (t('[data-menu]')) return quoteMenu(q);
    if ((b = t('[data-prox]'))) return passo(q, b.dataset.prox);
    // bastidor
    if ((b = t('[data-st]'))) { setStatus(q, b.dataset.st); rerender(); toast({ recusado: 'Marcado como recusado. Fica no Arquivo.', rascunho: 'Reaberto como rascunho.' }[b.dataset.st] || 'Situação alterada.'); return; }
    if (t('[data-dup]')) return duplicateQuote(q);
    if (t('[data-pix]')) { const px = pixOf(q, compute(q)); if (px) pixSheet(px); return; }
    if (t('[data-pago]')) return pagoSheet(q);
    if ((b = t('[data-pago-rm]'))) { const x = q.pagos.find(y => y.id === b.dataset.pagoRm); if (!x) return; q.pagos = q.pagos.filter(y => y !== x); touch(q); rerender(); toast(`Pagamento de ${BRL(x.v)} apagado.`, { label: 'Desfazer', run: () => { q.pagos.push(x); q.pagos.sort((a, b2) => a.t - b2.t); touch(q); rerender(); } }); return; }
    if (t('[data-enviar]')) return enviarJanela(q);
    if (t('[data-receipt]')) return receiptSheet(q);
  });
  // a linha aberta: o que se digita vale na hora
  v.addEventListener('input', e => {
    const i = edAtual(); if (!i) return;
    if (e.target.id === 'ed-q') { const n = parseQty(e.target.value); if (n && n > 0) { i.qty = n; touch(q); pintarTotais(v, q); } }
    if (e.target.id === 'ed-p') { const n = parseMoney(e.target.value); if (n !== null) { i.price = n; touch(q); pintarTotais(v, q); } }
  });
  v.addEventListener('change', e => { if (e.target.id === 'ed-q' || e.target.id === 'ed-p') { const i = edAtual(); if (i && e.target.id === 'ed-q') conferirQtd(i.qty, i.name, () => {}); pintarFolha(); } });
}
// enquanto se digita na linha aberta, só os números mudam (o campo não perde o cursor)
function pintarTotais(v, q) {
  const c = compute(q), i = q.items.find(x => x.id === FO.aberta);
  const ln = i && $(`[data-ln="${i.id}"]`, v);
  if (ln) { $('.v', ln).textContent = BRL(lineShow(c, i)); $('small', ln).textContent = `${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)} × ${BRL(priceShow(c, i))}`; }
  const tg = $('.tg b', v); if (tg) tg.textContent = BRL(c.total);
  $('#fo-visor', v).innerHTML = visorHTML(q, c);
}

/* ---------- o próximo passo ---------- */
function passo(q, k) {
  if (k === 'enviar') return enviarJanela(q);
  if (k === 'aprovou') return approveSheet(q);
  if (k === 'concluir') return concluirJanela(q);
  if (k === 'receber') return receberJanela(q);
  if (k === 'recibo') return receiptSheet(q);
  if (k === 'reabrir') { setStatus(q, 'rascunho'); rerender(); toast('Reaberto como rascunho.'); }
}

/* ---------- janelas da folha: o conteúdo é redesenhado a cada mudança, e a folha atrás acompanha ---------- */
const soDigitos = el => { const d = el.value.replace(/\D/g, '').slice(0, 5); if (el.value !== d) el.value = d; return parseInt(d, 10) || 0; };
const JANELAS = {
  total: { titulo: () => 'Acertar o total', corpo: (q, c) => valuesHTML(q, c) },
  pag: { titulo: () => 'Pagamento', corpo: (q, c) => `<div class="field"><span class="lab" id="q-pm-l">Como o cliente paga</span><div class="seg" role="group" aria-labelledby="q-pm-l">${[['avista', 'À vista'], ['entrada', 'Entrada'], ['parcelado', 'Cartão'], ['combinar', 'Combinar']].map(([k, l]) => `<button data-pm="${k}" aria-pressed="${q.payment.mode === k}">${l}</button>`).join('')}</div></div>${payBlockHTML(q, c)}` },
  prazo: { titulo: q => isReport(q) ? 'Datas do serviço' : 'Prazo e datas', corpo: q => daysBlockHTML(q) },
  gar: { titulo: q => isReport(q) ? 'Garantia' : 'Garantia e validade', corpo: q => `<div class="grid2">
      <div class="field"><label for="q-war">Garantia, em dias</label><input id="q-war" type="text" inputmode="numeric" placeholder="90" value="${q.warranty || ''}"></div>
      ${isReport(q) ? '' : `<div class="field"><label for="q-val">Validade, em dias</label><input id="q-val" type="text" inputmode="numeric" placeholder="15" value="${q.validity || ''}"></div>`}</div>
      <p class="hint">${isReport(q) ? 'A garantia conta da conclusão do serviço.' : 'A garantia conta da conclusão do serviço; a validade, da data da proposta.'} O texto das condições fica em Ajustes, Textos dos documentos.</p>` },
  obs: { titulo: () => 'Observações', corpo: q => `<div class="field"><textarea id="q-notes" aria-label="Observações" placeholder="O que está fora do orçamento, cuidados no dia do serviço…">${esc(q.notes)}</textarea></div>
      <div class="field"><span class="lab" id="q-nt-l">Textos prontos</span>${linhas(NOTE_CHIPS.map(([l, t], k) => linha(`data-note="${k}"`, l, { tipo: 'mais', dis: q.notes.includes(t) })), ' role="group" aria-labelledby="q-nt-l"')}</div>` },
  aprov: { titulo: () => 'Aprovação', corpo: q => `<p class="hint">${esc(approvalText(q))}</p><button class="btn block" data-reaprov>Registrar de novo</button>` },
};
const TEC = { diag: ['Diagnóstico', 'O que você encontrou: causa do problema, estado da instalação…'], work: ['Serviços realizados', 'O que foi feito, com mais detalhe que a lista de itens.'], tests: ['Testes e verificações', ''], recs: ['Recomendações', 'O que ainda precisa de atenção, riscos e cuidados de uso.'] };
function corpoTec(q, k) {
  if (k === 'tests') return `<p class="hint">Escolha o teste e depois onde foi feito e o resultado.</p>${linhas(TECH.tests.map((it, n) => linha(`data-tc="tests" data-ti="${n}"`, esc(it.l), it.s ? { tipo: 'mais' } : {})))}
    <div class="test-list">${q.tests.map((t, n) => `<div class="test-row"><span class="tk">${I.check}</span><span class="tt">${esc(t)}</span><button class="icon-btn sm" data-test-rm="${n}" aria-label="Remover teste">${I.x}</button></div>`).join('')}</div>`;
  return `<p class="hint">Toque no que se aplica e complete os detalhes: a frase entra pronta.</p>${linhas(TECH[k].map((it, n) => linha(`data-tc="${k}" data-ti="${n}"`, esc(it.l), it.s ? { tipo: 'mais', dis: q[k].includes(it.s) } : {})))}
    <div class="field"><label for="q-${k}">${TEC[k][0]}, com as suas palavras</label><textarea id="q-${k}" data-tech="${k}" placeholder="${esc(TEC[k][1])}">${esc(q[k])}</textarea>${k === 'work' && q.items.some(i => i.kind === 'svc') ? '<button class="linkish" data-work-items>Preencher com os serviços lançados</button>' : ''}</div>`;
}
function abrirJanela(q, tipo) {
  const tec = tipo.startsWith('tec:') ? tipo.slice(4) : '', def = tec ? { titulo: () => TEC[tec][0], corpo: q2 => corpoTec(q2, tec) } : JANELAS[tipo];
  if (!def) return;
  FO.janela = { id: q.id, tipo, def };
  KitFacil.dialogo.abrir({ titulo: def.titulo(q), contexto: docNome(q), corpo: `<div id="fo-jan">${def.corpo(q, compute(q))}</div>`, classe: 'kf-alto',
    aoMontar: s => { prepFields(s); ligarJanela($('#fo-jan', s), q); $$('textarea', s).forEach(autoGrow); },
    aoFechar: () => { FO.janela = null; if (route().name === 'quote') pintarFolha(); } });
}
// chamada a cada rerender(): a janela aberta mostra a mudança que acabou de acontecer
function refazerJanela() {
  const j = FO.janela, velho = document.getElementById('fo-jan'); if (!j || !velho) return;
  const q = getQ(j.id); if (!q) return;
  const foco = document.activeElement && velho.contains(document.activeElement) ? document.activeElement : null;
  const chave = foco && (foco.id ? '#' + foco.id : [...foco.attributes].filter(a => a.name.startsWith('data-')).map(a => `[${a.name}="${a.value}"]`).join(''));
  const novo = velho.cloneNode(false); novo.innerHTML = j.def.corpo(q, compute(q)); velho.replaceWith(novo);
  prepFields(novo); ligarJanela(novo, q); $$('textarea', novo).forEach(autoGrow);
  if (chave) { try { $(chave, novo)?.focus({ preventScroll: true }); } catch {} }
}
function ligarJanela(v, q) {
  const em = (sel, fn, ev = 'click') => $$(sel, v).forEach(el => el.addEventListener(ev, e => fn(el, e)));
  const muda = () => { touch(q); rerender(); };
  ['input', 'change'].forEach(ev => v.addEventListener(ev, () => requestAnimationFrame(pintarFolha)));
  // adicionais sobre a mão de obra
  em('[data-x]', b => {
    const k = b.dataset.x, ex = EXTRAS.find(x => x[0] === k), sk = ex[2];
    if (q.extras[k]) { q.extras[k] = 0; return muda(); }
    if (settings[sk]) { q.extras[k] = settings[sk]; return muda(); }
    adicionalJanela(q, k);
  });
  em('[data-trip]', () => tripSheet(q));
  em('[data-dm]', b => { if (q.discount.mode === b.dataset.dm) return; q.discount.mode = b.dataset.dm; muda(); });
  em('#q-matcli', el => { q.materialBy = el.checked ? 'cliente' : 'eu'; muda(); }, 'change');
  const lembraTax = () => { settings.taxMode = q.tax.mode; settings.taxPct = q.tax.pct; settings.taxBase = q.tax.base; saveSettings(); };
  em('[data-tx]', b => { q.tax = { ...taxOf(q), mode: b.dataset.tx }; if (q.tax.mode !== 'sem' && !q.tax.pct) q.tax.pct = 5; lembraTax(); muda(); });
  em('[data-txb]', b => { q.tax = { ...taxOf(q), base: b.dataset.txb }; lembraTax(); muda(); });
  em('#q-txp', el => { const x = parseQty(el.value); q.tax = { ...taxOf(q), pct: Math.max(0, Math.min(30, x || 0)) }; el.value = fmtQty(q.tax.pct); lembraTax(); muda(); }, 'change');
  em('#q-disc', el => { if (q.discount.mode === 'value') q.discount.value = parseMoney(el.value) || 0; else q.discount.pct = Math.min(100, parseQty(el.value) || 0); touch(q); pintaConta(v, q); }, 'input');
  // pagamento
  em('[data-pm]', b => { q.payment.mode = b.dataset.pm; q.payment.outras = (q.payment.outras || []).filter(m => m !== b.dataset.pm); muda(); });
  em('[data-outra]', b => { const m = b.dataset.outra, L = q.payment.outras || []; q.payment.outras = L.includes(m) ? L.filter(x => x !== m) : [...L, m]; muda(); });
  em('[data-ep]', b => { q.payment.entryPct = +b.dataset.ep; muda(); });
  em('[data-in]', b => { q.payment.installments = Math.max(1, Math.min(18, (q.payment.installments || 3) + +b.dataset.in)); q.payment.taxaPct = null; muda(); });
  em('[data-ct]', b => { q.payment.cardTipo = b.dataset.ct; if (b.dataset.ct === 'debito' && q.payment.juros === 'mes') q.payment.juros = 'taxa'; q.payment.taxaPct = null; muda(); });
  em('[data-jur]', b => { q.payment.juros = b.dataset.jur; muda(); });
  em('[data-paga]', b => { q.payment.paga = b.dataset.paga; muda(); });
  em('[data-sa]', b => { q.payment.semAte = Math.max(0, Math.min(18, (q.payment.semAte || 0) + +b.dataset.sa)); muda(); });
  em('[data-avm]', b => { if (q.payment.avista.mode === b.dataset.avm) return; q.payment.avista.mode = b.dataset.avm; muda(); });
  em('[data-taxa-tab]', () => { q.payment.taxaPct = null; muda(); });
  const pintaPag = () => { const c = compute(q), ps = $('#pay-sum', v); if (ps) ps.innerHTML = paySumHTML(q, c); outrasFormas(q).forEach(m => { const e = $('#pay-sum-' + m, v); if (e) { const x = comForma(q, m); e.innerHTML = paySumHTML(x.q, x.c); } }); };
  em('#q-taxa', el => { const x = parseQty(el.value); q.payment.taxaPct = x === null ? 0 : Math.max(0, Math.min(40, x)); touch(q); pintaPag(); }, 'input');
  em('#q-taxa', () => rerender(), 'change');
  em('#q-mes', el => { q.payment.mesPct = Math.max(0, Math.min(20, parseQty(el.value) || 0)); touch(q); pintaPag(); }, 'input');
  em('#q-avd', el => { const a = q.payment.avista; if (a.mode === 'value') a.value = parseMoney(el.value) || 0; else a.pct = Math.max(0, Math.min(50, parseQty(el.value) || 0)); touch(q); pintaPag(); }, 'input');
  // garantia e validade: só números
  em('#q-war', el => { q.warranty = soDigitos(el); touch(q); }, 'input');
  em('#q-war', () => { if (q.warranty > 1825) confirmSheet('Garantia longa', `${q.warranty} dias são mais de ${Math.floor(q.warranty / 365)} anos. É isso mesmo?`, 'Manter', () => {}, false); }, 'change');
  em('#q-val', el => { q.validity = soDigitos(el); touch(q); }, 'input');
  em('#q-val', el => { if (!q.validity) { q.validity = 1; el.value = '1'; touch(q); toast('A validade mínima é de 1 dia: a proposta vale até amanhã.'); } else if (q.validity > 365) confirmSheet('Validade longa', `A proposta valeria por ${q.validity} dias. Preços de material mudam: é isso mesmo?`, 'Manter', () => {}, false); }, 'change');
  // prazo e datas
  if ($('#q-days-blk', v)) bindDays(v, q);
  em('#q-tbd', el => { q.dateTbd = el.checked; touch(q); $('#q-cal-area', v).hidden = q.dateTbd; const cdc = $('#q-cdc', v); if (cdc) cdc.hidden = q.dateTbd || !!q.dates.length; }, 'change');
  // observações
  const nt = $('#q-notes', v);
  if (nt) nt.addEventListener('input', () => { q.notes = nt.value; touch(q); $$('[data-note]', v).forEach(c => linhaFeita(c, q.notes.includes(NOTE_CHIPS[+c.dataset.note][1]))); });
  em('[data-note]', b => { const t = NOTE_CHIPS[+b.dataset.note][1]; q.notes = (q.notes.trim() ? q.notes.trim() + '\n' : '') + t; nt.value = q.notes; autoGrow(nt); touch(q); linhaFeita(b, true); pintarFolha(); });
  // relatório: a frase entra pronta
  em('[data-tech]', el => { const k = el.dataset.tech; q[k] = el.value; touch(q); }, 'input');
  em('[data-tc]', b => {
    const k = b.dataset.tc, it = TECH[k][+b.dataset.ti];
    const add = txt => { if (k === 'tests') q.tests.push(txt); else q[k] = (q[k].trim() ? q[k].trim() + '\n' : '') + txt; touch(q); rerender(); toast('Entrou no relatório.'); };
    if (it.s) { if (k === 'tests' || !q[k].includes(it.s)) add(it.s); else toast('Esse texto já está no relatório.'); return; }
    techSheet(q, k, +b.dataset.ti, add);
  });
  em('[data-test-rm]', b => { const n = +b.dataset.testRm, [gone] = q.tests.splice(n, 1); muda(); toast('Teste removido.', { label: 'Desfazer', run: () => { q.tests.splice(n, 0, gone); muda(); } }); });
  em('[data-work-items]', () => { const txt = q.items.filter(i => i.kind === 'svc').map(i => `${i.name}: ${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)}.`).join('\n'); q.work = (q.work.trim() ? q.work.trim() + '\n' : '') + txt; muda(); });
  em('[data-reaprov]', () => approveSheet(q));
}
const pintaConta = (v, q) => { const c = compute(q); $$('[data-t="total"]', v).forEach(e => e.textContent = BRL(c.total)); $$('[data-t="disc"]', v).forEach(e => { e.textContent = '− ' + BRL(c.discount); e.closest('.conta-lin').hidden = !c.discount; }); };
// adicional sem percentual padrão: pede o valor aqui mesmo, com a opção de guardar para os próximos
function adicionalJanela(q, k) {
  const ex = EXTRAS.find(x => x[0] === k), sk = ex[2];
  openSheet({ title: `Adicional de ${ex[3]}`, body: `<div class="field"><label for="ax-pct">Percentual sobre a mão de obra</label><input id="ax-pct" type="text" inputmode="numeric" placeholder="Ex.: ${{ urgent: 50, night: 30, weekend: 50 }[k]}"></div>
      <label class="switch-row" for="ax-pad"><span><b>Usar nos próximos orçamentos</b><small>Fica em Ajustes, Adicionais.</small></span><input type="checkbox" class="sw" id="ax-pad" checked></label>`,
    foot: `<button class="btn ghost" data-no>Cancelar</button><button class="btn primary" data-ok>${I.plus}Aplicar</button>`,
    onClose: () => abrirJanela(q, 'total'),
    onMount: s => {
      $('[data-no]', s).onclick = () => closeSheet();
      $('[data-ok]', s).onclick = () => {
        const n = Math.max(0, Math.min(300, parseInt($('#ax-pct', s).value.replace(/\D/g, ''), 10) || 0));
        if (!n) { KitFacil.apontar($('#ax-pct', s)); return toast('Informe o percentual do adicional.'); }
        q.extras[k] = n; if ($('#ax-pad', s).checked) { settings[sk] = n; saveSettings(); }
        touch(q); closeSheet();
      };
    } });
}
function tituloJanela(q) {
  const rep = isReport(q);
  openSheet({ title: rep ? 'Serviço executado' : 'Nome do serviço', sub: 'Uma linha, no alto do documento.',
    body: `<div class="field"><label for="q-title">${rep ? 'O que foi feito' : 'Serviço'}</label><input id="q-title" type="text" autocomplete="off" maxlength="120" placeholder="Ex.: Troca do quadro e instalação de chuveiro" value="${esc(q.title)}"></div>`,
    foot: `<button class="btn primary" data-ok>Salvar</button>`,
    onMount: s => { const tt = $('#q-title', s); tt.addEventListener('input', () => { q.title = tt.value; touch(q); pintarFolha(); }); $('[data-ok]', s).onclick = () => { q.title = tt.value.trim(); touch(q); closeSheet(true); rerender(); }; } });
}

/* ---------- Somar: a tabela numa janela, por cima da folha; cada toque soma um ---------- */
function somarLista(q) {
  const qf = fold(MT.q.trim());
  if (qf) return mtListaHTML(q);
  const usados = maisUsados(MT.kind), cats = mtCats(MT.kind);
  if (MT.cat === null || (MT.cat !== '*' && !cats.includes(MT.cat))) MT.cat = usados.length >= 3 ? '*' : cats[0] || '*';
  const doGrupo = k => k === '*' ? usados : prices.filter(p => p.kind === MT.kind && (p.cat || 'Outros') === k).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
  const sec = (k, nome) => { const L = doGrupo(k), ab = MT.cat === k; return `<section class="sx${ab ? ' ab' : ''}"><button type="button" class="st" data-cat="${esc(k)}" aria-expanded="${ab}">${esc(nome)}<span class="ct">${L.length}</span>${I.chev}</button>${ab ? `<div class="sx-in">${L.map(p => mtRowHTML(q, p, '', false)).join('')}</div>` : ''}</section>`; };
  return (usados.length >= 3 ? sec('*', 'Mais usados') : '') + cats.map(k => sec(k, k)).join('')
    + `<button type="button" class="add-btn" data-fora>${I.plus}${MT.kind === 'svc' ? 'Serviço' : 'Material'} fora da tabela</button>`;
}
const somarPe = (q, c = compute(q)) => `<small>${MT.kind === 'svc' ? 'Mão de obra' : 'Material'} na proposta</small><b class="num">${BRL(MT.kind === 'svc' ? c.labor : c.matTotal)}</b>`;
function somarJanela(q, kind, room) {
  if (MT.id !== q.id) { MT.q = ''; MT.cat = null; MT.svcAdd = {}; }
  MT.id = q.id; if (MT.kind !== kind) MT.cat = null; MT.kind = kind; MT.q = ''; MT.room = q.useRooms ? (room || '') : '';
  const sala = q.useRooms ? roomName(q, MT.room) : '';
  KitFacil.dialogo.abrir({ titulo: sala ? `Somar em ${sala}` : 'Somar à proposta', contexto: docNome(q), classe: 'kf-alto',
    corpo: `<div class="seg" role="group" aria-label="O que somar">${[['svc', 'Mão de obra'], ['mat', 'Material']].map(([k, l]) => `<button type="button" data-kind="${k}" aria-pressed="${MT.kind === k}">${l}</button>`).join('')}</div>
      <label class="search">${I.search}<input type="search" id="mt-q" placeholder="Buscar serviço ou material" aria-label="Buscar na tabela"></label>
      <div class="mt-lista" id="mt-lista">${somarLista(q)}</div>`,
    pe: `<div class="jv" id="mt-pe" role="status">${somarPe(q)}</div>`,
    aoFechar: () => {
      const add = MT.svcAdd; MT.svcAdd = {};
      if (route().name === 'quote') rerender();
      if (Object.keys(add).length && getQ(q.id) && materialSugerido(q).length) setTimeout(() => sugerirMaterial(q, add, MT.room), semMovimento() ? 60 : 420);
    },
    aoMontar: s => {
      prepFields(s);
      const pinta = () => { $('#mt-lista', s).innerHTML = somarLista(q); $('#mt-pe', s).innerHTML = somarPe(q); pintarFolha(); };
      const busca = $('#mt-q', s);
      busca.addEventListener('input', () => { MT.q = busca.value; pinta(); });
      s.addEventListener('click', e => {
        const kd = e.target.closest('[data-kind]');
        if (kd) { MT.kind = kd.dataset.kind; MT.cat = null; $$('[data-kind]', s).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === MT.kind))); return pinta(); }
        const ct = e.target.closest('[data-cat]');
        if (ct) { MT.cat = MT.cat === ct.dataset.cat ? '' : ct.dataset.cat; pinta(); $(`[data-cat="${CSS.escape(ct.dataset.cat)}"]`, s)?.focus({ preventScroll: true }); return; }
        const mais = e.target.closest('[data-mais]');
        if (mais) { const p = prices.find(x => x.id === mais.dataset.mais); if (!p) return; addFromPrice(q, p, MT.room); if (p.kind === 'svc' && (p.comp || []).length) MT.svcAdd[p.id] = (MT.svcAdd[p.id] || 0) + 1; pinta(); $(`[data-pid="${p.id}"] .mt-mais`, s)?.focus({ preventScroll: true }); return; }
        const menos = e.target.closest('[data-menos]');
        if (menos) {
          const p = prices.find(x => x.id === menos.dataset.menos), L = p ? mtNoOrc(q, p) : []; if (!L.length) return;
          const i = L[L.length - 1]; i.qty = Math.round((i.qty - 1) * 100) / 100;
          if (i.qty <= 0) q.items = q.items.filter(x => x !== i);
          if (MT.svcAdd[p.id]) { MT.svcAdd[p.id]--; if (MT.svcAdd[p.id] <= 0) delete MT.svcAdd[p.id]; }
          touch(q); pinta(); ($(`[data-pid="${p.id}"] [data-menos]`, s) || $(`[data-pid="${p.id}"] .mt-mais`, s))?.focus({ preventScroll: true }); return;
        }
        const qd = e.target.closest('[data-qtd]');
        if (qd) { const p = prices.find(x => x.id === qd.dataset.qtd), i = p && mtNoOrc(q, p)[0]; if (i) lineSheet(q, i); return; }
        if (e.target.closest('[data-fora]')) customItemSheet(q, MT.kind, MT.q.trim(), MT.room);
      });
    } });
}

/* ---------- Enviar: só agora o app pergunta para quem é ---------- */
function enviarJanela(q) {
  const rep = isReport(q);
  if (!q.items.length && !rep) return toast('Some pelo menos um item antes de enviar.');
  const c = compute(q), mode = rep ? 'report' : 'quote', avisos = [];
  if (!settings.name && !settings.company) avisos.push('Seu nome ainda não aparece no alto do documento.');
  if (!rep && !daysOk(q)) avisos.push(prazoProblema(q) === 'retro' ? 'Há datas que já passaram: escolha um novo início em Prazo e datas.' : 'Os dias marcados não conferem com o prazo.');
  const cli = q.client, temMais = !!(cli.address || cli.doc);
  openSheet({ title: rep ? 'Para quem foi o serviço?' : 'Para quem é?', sub: 'Só o nome é obrigatório.',
    body: `${avisos.length ? `<div class="banner b-tip"><p><b>Antes de enviar:</b> ${esc(avisos.join(' '))}</p>${!settings.name && !settings.company ? '<div class="banner-act"><button class="btn sm ghost" data-me>Preencher meus dados</button></div>' : ''}</div>` : ''}
      <div class="field"><label for="q-name">Nome do cliente</label><input id="q-name" type="text" autocapitalize="words" autocomplete="off" maxlength="80" value="${esc(cli.name)}"></div>
      <div class="field"><label for="q-phone">WhatsApp <span class="lab-opt">opcional</span></label><input id="q-phone" type="tel" inputmode="tel" autocomplete="off" placeholder="(11) 90000-0000" value="${esc(fmtPhone(cli.phone))}"><span class="hint">Para abrir a conversa com a mensagem pronta.</span></div>
      <details class="fold" data-kf-secao${temMais ? ' open' : ''}><summary><span class="fold-t">Endereço e CPF ou CNPJ</span><small class="fold-s">opcional</small></summary><div class="fold-in">
        <div class="field"><label for="q-addr">Endereço da obra</label><input id="q-addr" type="text" autocomplete="off" placeholder="Rua, número, bairro" value="${esc(cli.address)}"></div>
        <div class="field"><label for="q-doc">CPF ou CNPJ</label><input id="q-doc" type="text" inputmode="numeric" autocomplete="off" placeholder="Sai no documento e no recibo" value="${esc(fmtDoc(cli.doc))}"></div></div></details>
      <p class="hint">PDF: o arquivo ${rep ? 'do relatório' : 'da proposta'}. WhatsApp: o mesmo conteúdo em texto, na conversa.</p>`,
    foot: `<a class="btn" data-wa href="#" target="_blank" rel="noopener">${I.wa}WhatsApp</a><button class="btn primary" data-pdf>${I.share}Enviar PDF</button>`,
    onClose: () => { if (route().name === 'quote') rerender(); },
    onMount: s => {
      loadJsPDF().catch(() => {});
      const nm = $('#q-name', s), ph = $('#q-phone', s), ad = $('#q-addr', s), dc = $('#q-doc', s);
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
      // sem o nome do cliente nada sai: o campo que falta é apontado, sem receber o foco (Código, Art. 68, § 5º)
      const semNome = e => { q.client.name = nm.value.trim().replace(/\s+/g, ' '); touch(q); if (q.client.name) return false; e.preventDefault(); KitFacil.apontar(nm); toast('Diga o nome do cliente para enviar.'); return true; };
      $('[data-me]', s)?.addEventListener('click', () => { closeSheet(true); KitFacil.ajustes.ir('conta'); });
      $('[data-wa]', s).addEventListener('click', e => { if (semNome(e)) return; e.currentTarget.href = waLink(q.client.phone, quoteMessage(q, compute(q), mode)); setTimeout(() => { closeSheet(true); markSent(q); rerender(); }, 400); });
      $('[data-pdf]', s).onclick = async e => { if (semNome(e)) return; await sharePDF(q, e.currentTarget); if (q.status !== 'rascunho' || q.example) { closeSheet(true); rerender(); } };
    } });
}

/* ---------- Concluir: a data e a baixa no estoque, numa janela só ---------- */
function concluirJanela(q) {
  const L = stockMatch(q), hoje = isoDe(hojeTs());
  const linhaBx = (x, k) => { const fica = Math.round((x.p.stock - x.qty) * 100) / 100; return `<label class="switch-row" for="cc-b${k}"><span><b>${esc(x.p.name)}</b><small>Usa ${fmtQty(x.qty)} · você tem ${fmtQty(x.p.stock)}${fica < 0 ? `: baixa só ${x.p.stock === 1 ? 'a' : 'as'} ${fmtQty(x.p.stock)}` : ''}</small></span><input type="checkbox" class="sw" id="cc-b${k}" data-bx="${k}" checked></label>`; };
  openSheet({ title: 'Concluir serviço', sub: docNome(q),
    body: `<div class="field"><label for="cc-d">Concluído em</label><input type="date" id="cc-d" required max="${hoje}" value="${hoje}"></div>
      ${L.length ? `<span class="tgs">Dar baixa no estoque</span><div role="group" aria-label="Dar baixa no estoque">${L.map(linhaBx).join('')}</div><p class="hint">Se você desfizer a conclusão, o material volta para o estoque.</p>` : ''}
      <p class="hint">O orçamento vira o Relatório de Serviços Executados, com diagnóstico, testes e recomendações.</p>`,
    foot: `<button class="btn primary" data-ok>${I.check}Concluir serviço</button>`,
    onMount: s => {
      $('[data-ok]', s).onclick = () => {
        const dia = Math.min(tsDeIso($('#cc-d', s).value) || hojeTs(), hojeTs());
        setStatus(q, 'concluido');
        if (!q.dates.includes(dia)) { q.dates = [...q.dates.filter(t => t < dia), dia]; q.days = q.dates.length; }
        q.doneAt = dia;
        const usar = L.filter((x, k) => $(`[data-bx="${k}"]`, s).checked);
        if (usar.length && !(q.baixa && q.baixa.length)) { q.baixa = []; usar.forEach(x => { const sai = Math.min(x.p.stock, x.qty); if (sai <= 0) return; q.baixa.push({ id: x.p.id, qty: sai, lotes: tiraDoEstoque(x.p, sai) }); }); savePrices(); }
        touch(q); closeSheet(true); rerender(); window.scrollTo({ top: 0 });
        const low = usar.filter(x => stockLow(x.p)).length;
        toast(`Serviço concluído.${low ? ` ${plural(low, 'material precisa', 'materiais precisam')} de reposição.` : ' A folha agora é o relatório.'}`);
      };
    } });
}

/* ---------- Receber: o QR do Pix e o registro do pagamento, juntos ---------- */
function receberJanela(q) {
  const c = compute(q), f = falta(q, c);
  const px = settings.pix && f ? { key: settings.pix, name: settings.company || settings.name || 'Recebedor', city: settings.city, value: f, what: recebido(q) ? 'o restante' : 'o total' } : null;
  const code = px ? pixPayload(px) : '';
  openSheet({ title: 'Receber', sub: f ? `Falta receber ${BRL(f)}.` : 'Este serviço já está todo pago.',
    body: `${px ? `<div class="rc-qr"><canvas id="rc-qr" width="480" height="480" aria-label="QR code do Pix"></canvas><b>Pix d${px.what}: ${BRL(px.value)}</b><span>Chave: ${esc(px.key)}</span></div>
        <button class="btn block" data-copy>${I.copy}Copiar código Pix</button>`
      : f ? `<div class="banner b-tip"><p><b>Sem chave Pix cadastrada.</b> Com ela, o QR code aparece aqui e no documento.</p><div class="banner-act"><button class="btn sm ghost" data-pixaj>Cadastrar a chave Pix</button></div></div>` : ''}
      <div class="field"><label for="pg-v">Valor recebido</label><input id="pg-v" type="text" inputmode="numeric" data-money value="${f ? BRL(f) : ''}" placeholder="R$ 0,00"><span class="hint">Recebeu em dinheiro ou no cartão? Registre do mesmo jeito.</span></div>`,
    foot: `<button class="btn primary" data-ok>${I.check}Registrar pagamento</button>`,
    onMount: async s => {
      $('[data-copy]', s)?.addEventListener('click', () => copyText(code, 'Código Pix copiado.'));
      $('[data-pixaj]', s)?.addEventListener('click', () => { closeSheet(true); KitFacil.ajustes.ir('pix'); });
      $('[data-ok]', s).onclick = () => {
        const v = parseMoney($('#pg-v', s).value);
        if (!v) { KitFacil.apontar($('#pg-v', s)); return toast('Informe o valor recebido.'); }
        const reg = { id: uid(), v, t: Date.now() };
        q.pagos = [...(q.pagos || []), reg]; touch(q); closeSheet(true); rerender();
        toast(falta(q) ? `Pagamento de ${BRL(v)} registrado.` : 'Conta acertada.', { label: 'Desfazer', run: () => { q.pagos = q.pagos.filter(x => x.id !== reg.id); touch(q); rerender(); } });
      };
      if (px) { try { const m = await qrMatrix(code), cv = $('#rc-qr', s); if (cv) drawQR(cv.getContext('2d'), m, 0, 0, 480); } catch { const cv = $('#rc-qr', s); if (cv) cv.replaceWith(Object.assign(document.createElement('p'), { className: 'hint', textContent: 'Sem internet para desenhar o QR code. Use o código copia e cola.' })); } }
    } });
}

/* ---------- o menu ⋯ da folha ---------- */
function quoteMenu(q) {
  const c = compute(q), rep = isReport(q);
  const o = (k, icone, t, sub = '') => `<button class="opt" data-o="${k}">${icone}<span>${t}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
  openSheet({ title: 'Mais opções', sub: docNome(q), body: `
      ${roomToggleHTML(q)}${matSwitchHTML(q)}
      <div class="opts">
      ${o('pdf', I.share, rep ? 'PDF do relatório' : 'PDF da proposta', 'Para conferir ou guardar')}
      ${o('copy', I.copy, 'Copiar o texto', 'Para colar em outro aplicativo')}
      ${c.mat.length ? `<a class="opt" data-o="mat" href="${waLink(q.client.phone, materialMessage(q, c))}" target="_blank" rel="noopener">${I.wa}<span>Lista de material pelo WhatsApp<small>Total de cada item, para o cliente comprar</small></span></a>` : ''}
      ${q.useRooms && q.items.length ? o('conf', I.list, 'Conferência por ambiente em PDF', 'Quantidades de cada cômodo, sem preços') : ''}
      ${['aprovado', 'concluido'].includes(q.status) ? o('receipt', I.receipt, 'Gerar recibo') : ''}
      ${o('dup', I.dup, 'Duplicar', 'Cria um rascunho igual, com novo número')}
      ${o('status', I.flag, 'Alterar situação', 'Agora: ' + STATUS[q.status])}
      </div>
      <button type="button" class="kf-btn kf-perigo block" data-o="del">${q.example ? 'Excluir o exemplo' : rep ? 'Excluir relatório' : 'Excluir orçamento'}</button>`,
    onMount: s => {
      $('#q-rooms', s).addEventListener('change', e => { q.useRooms = e.target.checked; touch(q); closeSheet(true); rerender(); if (q.useRooms && !q.rooms.length) roomAddSheet(q); });
      $('#q-matcli', s).addEventListener('change', e => { q.materialBy = e.target.checked ? 'cliente' : 'eu'; touch(q); pintarFolha(); });
      $$('[data-o]', s).forEach(b => b.addEventListener('click', async () => {
        const k = b.dataset.o;
        if (k === 'pdf') { b.disabled = true; try { await saveFile(fileName(DOC[rep ? 'report' : 'quote'].file, q), await buildQuotePDF(q, rep ? 'report' : 'quote')); } catch (e) { console.warn(e); toast('Não foi possível gerar o PDF. Na primeira vez, o app precisa de internet.'); } b.disabled = false; }
        if (k === 'copy') { closeSheet(true); copyText(quoteMessage(q, c, rep ? 'report' : 'quote'), 'Texto copiado.'); }
        if (k === 'mat') closeSheet(true);
        if (k === 'conf') { closeSheet(true); shareConference(q); }
        if (k === 'receipt') receiptSheet(q);
        if (k === 'dup') { closeSheet(true); duplicateQuote(q); }
        if (k === 'status') statusSheet(q);
        if (k === 'del') { closeSheet(true); deleteQuote(q); }
      }));
    } });
}
