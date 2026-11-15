/* Elétrica Fácil · moldura (navegação e troca de tela), Ajustes, abertura (onboarding), guia e arranque do app. */
'use strict';

/* ---------- desenhar a tela ---------- */
const PRINCIPAIS = ['home', 'lista', 'prices', 'gestao', 'conquistas', 'mais', 'settings'];
const TITULOS = { home: '', lista: 'Orçamentos', prices: 'Preços', gestao: 'Gestão', conquistas: 'Conquistas', mais: 'Mais', settings: 'Ajustes' };
function render(opts = {}) {
  let r = route();
  // orçamento novo que ficou vazio some ao sair dele
  if (openQuoteId && r.id !== openQuoteId) {
    const q = getQ(openQuoteId);
    if (q && isEmptyQuote(q)) { quotes = quotes.filter(x => x !== q); saveQuotes(); }
  }
  if ((r.name === 'quote' || r.name === 'preview') && !getQ(r.id)) { history.replaceState({ d: 0 }, '', '#/'); return render(); }
  if (r.name === 'conquistas' && !jogoLigado()) { history.replaceState({ d: 0 }, '', '#/mais'); r = route(); }
  openQuoteId = r.id || null;
  const V = VIEWS[r.name];
  // a área da tela é trocada por uma nova a cada desenho: assim os toques ligados pela tela anterior não se acumulam
  const velho = $('#app'), app = velho.cloneNode(false);
  app.innerHTML = V.html(r);
  // trilho e barra de baixo ficam logo depois da barra de cima: no teclado, barra de cima → menu → conteúdo.
  // São fixos na tela, então o lugar no documento não muda o desenho.
  const fixos = [$('#trilho'), $('#nav')].filter(Boolean);
  fixos.forEach(el => document.body.appendChild(el));
  velho.replaceWith(app);
  const cab = $(':scope > header', app);
  if (cab) cab.after(...fixos); else app.prepend(...fixos);
  const top = PRINCIPAIS.includes(r.name);
  $('#nav').hidden = !top;
  document.body.dataset.tela = r.name;
  pintarNav(r);
  KitFacil.topo.atualizar();
  prepFields($('#app'));
  V.bind($('#app'), r);
  $$('textarea', $('#app')).forEach(autoGrow);
  if (!opts.keep) window.scrollTo(0, navMode === 'pop' && top ? (scrollMem[r.key] || 0) : 0);
  if (r.key !== curKey) { KitFacil.movimento.entrar(app, { de: 'tela' }); document.title = TITULOS[r.name] ? `${TITULOS[r.name]} · Elétrica Fácil` : 'Elétrica Fácil'; }
  curKey = r.key;
  onScroll();
  clearTimeout(render.t); render.t = setTimeout(() => { if (!guiaAtivo() && !aberturaAtiva()) jogoConferir(); lpFilaMostrar(); }, 700);
}
function rerender() {
  const y = window.scrollY, f = document.activeElement && document.activeElement.id;
  render({ keep: true });
  window.scrollTo(0, y);
  if (f) { const el = document.getElementById(f); if (el && el.matches('input,textarea')) el.focus({ preventScroll: true }); }
}
function onScroll() { const ab = $('.appbar'); if (ab) ab.classList.toggle('scrolled', window.scrollY > 4); }
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- navegação: a barra de baixo e o trilho são os do Kit (KitFacil.nav.barra e .trilho) ----------
   Início, Orçamentos, o orçamento novo no centro, Conquistas (ou Preços, com as conquistas desligadas) e Mais. */
const ROTAS = { inicio: '/', orcamentos: '/orcamentos', precos: '/precos', gestao: '/gestao', conquistas: '/conquistas', mais: '/mais' };
function pintarNav(r = route()) {
  const n = r.name, noOrc = n === 'lista' || n === 'quote' || n === 'preview';
  const it = (id, rotulo, icone, atual) => ({ id, rotulo, icone, atual });
  const quarto = jogoLigado() ? it('conquistas', 'Conquistas', IN.lampada, n === 'conquistas') : it('precos', 'Preços', I.tag, n === 'prices');
  const naMais = n === 'mais' || n === 'gestao' || (n === 'prices' && quarto.id !== 'precos');
  const html = KitFacil.nav.barra({ itens: [it('inicio', 'Início', IN.casa, n === 'home'), it('orcamentos', 'Orçamentos', IN.folhas, noOrc), quarto],
    centro: { id: 'novo', rotulo: 'Novo', nome: 'Novo orçamento', icone: I.plus },
    mais: { atual: naMais } });
  const nav = $('#nav'); if (nav.dataset.h !== html) { nav.innerHTML = html; nav.dataset.h = html; }
  const lado = KitFacil.nav.trilho({ destaque: { id: 'novo', rotulo: 'Novo orçamento', icone: I.plus },
    itens: [it('inicio', 'Início', IN.casa, n === 'home'), it('orcamentos', 'Orçamentos', IN.folhas, noOrc), it('precos', 'Preços', I.tag, n === 'prices'), it('gestao', 'Gestão', I.box, n === 'gestao'),
      ...(jogoLigado() ? [it('conquistas', 'Conquistas', IN.lampada, n === 'conquistas')] : [])],
    mais: { atual: n === 'mais' } });
  const t = $('#trilho-lista'); if (t.dataset.h !== lado) { t.innerHTML = lado; t.dataset.h = lado; }
}
function irPara(id) {
  if (id === 'novo') return createQuote();
  if (id === 'guia') return guiaIniciar();
  if (id === 'exemplo') return createExample();
  const path = ROTAS[id]; if (!path) return;
  if (route().key === path) { window.scrollTo({ top: 0, behavior: semMovimento() ? 'auto' : 'smooth' }); return; }
  // estando numa guia dos Ajustes (celular), primeiro tira a guia do histórico e depois troca de tela
  if (history.state && history.state.kfAjPush) { irDepois = path; history.back(); return; }
  go(path, true);
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-kf-ir]'); if (!b) return;
  e.preventDefault(); irPara(b.dataset.kfIr);
});
// barra de cima das telas principais: a marca à esquerda; nuvem, presente e balão à direita (Código, Art. 58)
const barraTopo = () => `<header class="kf-barra appbar"><div class="kf-barra-in"><div class="kf-marca">${MARCA}</div>${KitFacil.topo.html({ principal: true })}</div></header>`;

// lista de escolha, calendário e relógio do Kit abertos perto do pé: rola o que falta para o último item ficar à vista,
// acima do rodapé da janela ou das barras fixas de baixo. Correção do app até o Kit corrigir (Proposta para o Integrador)
document.addEventListener('click', e => {
  const w = e.target.closest('.kf-esc'); if (!w || !e.target.closest('.kf-esc-btn')) return;
  setTimeout(() => {
    const el = w.classList.contains('kf-aberta') && $('.kf-esc-lista:not([hidden]), .kf-cal:not([hidden])', w); if (!el) return;
    const corpo = el.closest('.kf-dlg-corpo');
    let fundo = corpo ? corpo.getBoundingClientRect().bottom : innerHeight;
    if (!corpo) $$('.bbar, .kf-nav').forEach(b => { if (b.getClientRects().length) fundo = Math.min(fundo, b.getBoundingClientRect().top); });
    const falta = el.getBoundingClientRect().bottom + 12 - fundo;
    if (falta > 0) (corpo || window).scrollBy({ top: falta, behavior: KitFacil.movimento.reduzido() ? 'auto' : 'smooth' });
  }, KitFacil.movimento.curto + 60);
});

/* ---------- Ajustes (guias do Kit Fácil, mais as do Elétrica Fácil) ---------- */
function readLogo(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 320, r = img.width / img.height;
        let w = img.width, h = img.height;
        if (w >= h && w > max) { w = max; h = Math.round(max / r); } else if (h > w && h > max) { h = max; w = Math.round(max * r); }
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
        res({ url: cv.toDataURL('image/png'), ratio: r });
      };
      img.onerror = rej; img.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
function settingsSums() {
  const s = settings;
  return {
    conta: [s.company || s.name, s.phone ? fmtPhone(s.phone) : ''].filter(Boolean).join(' · ') || undefined,
    pix: s.pix || 'Nenhuma chave cadastrada',
    deslocamento: s.kmPerL || s.fuelPrice ? [s.kmPerL && `${fmtQty(s.kmPerL)} km/l`, s.fuelPrice && `combustível ${BRL(s.fuelPrice)}`].filter(Boolean).join(' · ') : 'Consumo do veículo e preço do combustível',
    adicionais: s.surUrgent || s.surNight || s.surWeekend ? [s.surUrgent && `urgência ${s.surUrgent}%`, s.surNight && `noturno ${s.surNight}%`, s.surWeekend && `fim de semana ${s.surWeekend}%`].filter(Boolean).join(' · ').replace(/^./, c => c.toUpperCase()) : 'Urgência, noturno e fim de semana',
    padrao: `Prazo ${prazoTxt({ n: Math.max(1, s.prazoN || 1), u: PRAZO_U[s.prazoU] ? s.prazoU : 'uteis' })} · validade ${s.validity} dias · garantia ${s.warranty} dias · ${payShort({ mode: s.payMode, entryPct: s.entryPct, installments: s.installments }).toLowerCase()}`,
    textos: 'Termo de aceite e condições da garantia',
    conquistas: (() => { if (!jogoLigado()) return 'Conquistas desligadas'; const j = jogoEstado(); return `Nível ${j.nivel} · ${j.ganhas.length} de ${CONQUISTAS.length} lâmpadas acesas`; })(),
  };
}
function pintarResumos() { const S = settingsSums(); for (const k in S) KitFacil.ajustes.resumo(k, S[k]); }
/* cópia de segurança no formato comum da família (as cópias antigas, { app: 'eletrica-facil', v: 1 ou 2 }, continuam valendo) */
// no celular abre o menu de compartilhar (WhatsApp, Drive, e-mail…), como antes; no computador, baixa o arquivo
function baixarCopiaEletrica() {
  jogoMarcar('copia');
  const env = KitFacil.copia.envelope({ settings, prices, quotes: quotes.filter(q => !q.example), tools, checks }, 2);
  saveFile(`eletrica-facil-copia-${new Date().toISOString().slice(0, 10)}.json`, new Blob([JSON.stringify(env, null, 1)], { type: 'application/json' }));
}
async function restaurarCopiaEletrica(file) {
  const j = await KitFacil.copia.ler(file, { antigos: true });
  let data = null;
  try {
    if (j && j.dados) data = { settings: j.dados.settings || {}, prices: j.dados.prices || seedPrices(), quotes: (j.dados.quotes || []).map(fixQuote), tools: Array.isArray(j.dados.tools) ? j.dados.tools : null, checks: Array.isArray(j.dados.checks) ? j.dados.checks : null };
    else if (j && j.antigo && j.antigo.app === 'eletrica-facil') { const o = j.antigo; data = o.v >= 2 ? { settings: o.settings || {}, prices: o.prices || seedPrices(), quotes: (o.quotes || []).map(fixQuote) } : fromV1(o.catalog, o.bills, o.draft); }
  } catch { data = null; }
  if (!data || !Array.isArray(data.quotes) || !Array.isArray(data.prices)) { toast('Esse arquivo não é uma cópia do Elétrica Fácil.'); return; }
  confirmSheet('Restaurar a cópia?', `O arquivo tem ${plural(data.quotes.length, 'orçamento', 'orçamentos')} e ${plural(data.prices.length, 'preço', 'preços')}. Os dados deste aparelho${syncOn() ? ' e dos outros aparelhos conectados' : ''} serão substituídos.`, 'Restaurar', () => {
    settings = { ...DEF, ...data.settings }; prices = data.prices; prices.forEach(acertaLotes); quotes = data.quotes.map(fixQuote);
    if (data.tools) { tools = normTools(data.tools); saveTools(); }
    if (data.checks) { checks = data.checks.map(fixCheck); saveChecks(); }
    settings.seq = Math.max(settings.seq || 0, 0, ...quotes.map(q => q.num || 0));
    saveSettings(); savePrices(); saveQuotes(); rerender(); toast('Cópia restaurada.');
  });
}
// cartão nos Ajustes: como cobrar o parcelado e a tabela de taxas da maquininha
function cartaoAjHTML(s) {
  const R = s.cardRates || {}, v = k => typeof R[k] === 'number' ? fmtQty(R[k]) : '';
  const cel = (k, l) => `<label class="tx-cel"><span>${l}</span><input type="text" inputmode="decimal" data-rate="${k}" value="${v(k)}" placeholder="0" aria-label="Taxa ${l} (%)"></label>`;
  return `<div class="field"><span class="lab" id="aj-jur-l">Cartão: juros e taxas</span><div class="seg" role="group" aria-labelledby="aj-jur-l">${[['sem', 'Sem juros'], ['taxa', 'Taxa da maquininha'], ['mes', 'Juros ao mês']].map(([k, l]) => `<button data-aj-jur="${k}" aria-pressed="${(s.cardJuros || 'sem') === k}">${l}</button>`).join('')}</div>
      <span class="kf-ajuda">Como começa todo orçamento novo no cartão. Dá para mudar em cada orçamento.</span></div>
    <div class="field"><span class="lab">Taxa da maquininha, em %</span><div class="tx-grid">${cel('debito', 'Débito')}${Array.from({ length: 12 }, (_, i) => cel(String(i + 1), `${i + 1}×`)).join('')}</div>
      <span class="kf-ajuda">Copie da sua maquininha ou do app do banco. ${(s.cardPaga || 'cliente') === 'cliente' ? 'Repassada ao cliente: ele paga o suficiente para você receber o valor cheio.' : 'Paga por você: o cliente paga o valor do orçamento e você recebe menos.'}</span></div>
    <div class="grid2"><div class="field"><span class="lab" id="aj-paga-l">Quem paga a taxa</span><div class="seg" role="group" aria-labelledby="aj-paga-l"><button data-aj-paga="cliente" aria-pressed="${(s.cardPaga || 'cliente') === 'cliente'}">O cliente</button><button data-aj-paga="eu" aria-pressed="${s.cardPaga === 'eu'}">Eu</button></div></div>
      <div class="field"><label for="st-cardSemAte">Sem juros até quantas parcelas</label><input id="st-cardSemAte" data-set="cardSemAte" data-int type="text" inputmode="numeric" placeholder="0" value="${s.cardSemAte || ''}"></div></div>
    <div class="field"><label for="st-cardMes">Juros ao mês, em %</label><input id="st-cardMes" data-set="cardMes" data-dec type="text" inputmode="decimal" placeholder="Ex.: 2,99" value="${s.cardMes ? fmtQty(s.cardMes) : ''}"></div>`;
}
const ICONES_AJ = {
  pix: '<path d="m12 3 9 9-9 9-9-9z"/><path d="m8.5 12 3.5-3.5 3.5 3.5-3.5 3.5z"/>',
  deslocamento: '<path d="M3 16V9l2.5-4h9L17 9h2a2 2 0 0 1 2 2v5"/><path d="M3 16h18"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/>',
  adicionais: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  padrao: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 11v7M8.5 14.5h7"/>',
  textos: '<path d="M4 6h16M4 11h16M4 16h10M4 21h6"/>',
  conquistas: '<rect x="3.500" y="4.500" width="17" height="15" rx="2"/><path d="M8 9v6M12 9v6M16 9v6"/><path d="M6.500 9h3M10.500 15h3M14.500 9h3"/>',
};
VIEWS.settings = {
  html() {
    const s = settings, S = settingsSums();
    const money = (k, label, ph) => `<div class="field"><label for="st-${k}">${label}</label><input id="st-${k}" data-set="${k}" data-money type="text" inputmode="numeric" value="${s[k] ? BRL(s[k]) : ''}" placeholder="${esc(ph)}"></div>`;
    const pct = (k, label) => `<div class="field"><label for="st-${k}">${label}, em %</label><input id="st-${k}" data-set="${k}" data-int type="text" inputmode="numeric" placeholder="${{ surUrgent: 50, surNight: 30, surWeekend: 50 }[k]}" value="${s[k] || ''}"></div>`;
    const f = (k, label, ph, type = 'text', extra = '') => `<div class="field"><label for="st-${k}">${label}</label><input id="st-${k}" data-set="${k}" type="${type}" value="${esc(k === 'phone' ? fmtPhone(s[k]) : s[k])}" placeholder="${esc(ph)}" ${extra}></div>`;
    const bloco = (titulo, corpo) => `<div class="kf-bloco"><h3>${titulo}</h3>${corpo}</div>`;
    return `${barraTopo()}
    <main class="page largo">
      ${KitFacil.ajustes.html({
        resumos: { conta: S.conta },
        extras: {
          conta: bloco('Seus dados na proposta', `<p class="kf-ajuda">Saem no cabeçalho das propostas, dos relatórios e dos recibos.</p>
            <div class="logo-row">
              <button class="logo-pick" data-logo aria-label="Escolher logotipo">${s.logo ? `<img src="${s.logo}" alt="Seu logotipo">` : I.image}</button>
              <div><b>Logotipo</b><small>Opcional. Sem logo, a proposta usa o raio do app.</small>${s.logo ? '<button class="linkish" data-logo-rm style="margin-top:4px;font-size:14px;color:var(--bad)">Remover logotipo</button>' : ''}</div>
              <input type="file" id="st-logo" accept="image/*" hidden>
            </div>
            ${f('name', 'Seu nome', 'Ex.: Carlos Pereira', 'text', 'autocapitalize="words"')}
            ${f('company', 'Nome da empresa <span class="lab-opt">opcional</span>', 'Ex.: Pereira Instalações Elétricas', 'text', 'autocapitalize="words"')}
            <div class="grid2 stack">
              ${f('phone', 'WhatsApp', '(11) 90000-0000', 'tel', 'inputmode="tel"')}
              ${f('email', 'E-mail <span class="lab-opt">opcional</span>', 'voce@email.com', 'email', 'autocapitalize="off"')}
              ${f('doc', 'CPF ou CNPJ <span class="lab-opt">opcional</span>', 'Sai no recibo')}
              ${f('registro', 'Registro profissional <span class="lab-opt">opcional</span>', 'CREA-DF 123456/D, CFT ou NR-10')}
              ${f('city', 'Cidade', 'Ex.: São Paulo', 'text', 'autocapitalize="words"')}
            </div>`),
        },
        produto: [
          { id: 'pix', titulo: 'Pix', icone: ICONES_AJ.pix, resumo: S.pix, html: bloco('Chave Pix', `<p class="kf-ajuda">Com a chave, a proposta já sai com o QR code da entrada, ou do total no pagamento à vista.</p>
              ${f('pix', 'Chave Pix', 'CPF, celular, e-mail ou chave aleatória', 'text', 'autocapitalize="off" spellcheck="false"')}`) },
          { id: 'deslocamento', titulo: 'Veículo e deslocamento', icone: ICONES_AJ.deslocamento, resumo: S.deslocamento, html: bloco('Calculadora de deslocamento', `<p class="kf-ajuda">Base da calculadora de deslocamento. O preço do combustível também pode ser atualizado direto no orçamento.</p>
              <div class="grid2">
                <div class="field"><label for="st-kmPerL">Consumo médio, em km por litro</label><input id="st-kmPerL" data-set="kmPerL" data-dec type="text" inputmode="decimal" value="${s.kmPerL ? fmtQty(s.kmPerL) : ''}" placeholder="Ex.: 10"></div>
                ${money('fuelPrice', 'Preço do litro do combustível', 'Ex.: R$ 6,19')}
                ${money('wearPerKm', 'Desgaste por km', 'Opcional')}
                ${money('hourRate', 'Valor da sua hora', 'Opcional')}
              </div>
              ${money('minVisit', 'Mínimo por visita', 'Opcional')}
              <p class="kf-ajuda">O desgaste cobre pneus, óleo e manutenção. A hora entra quando você informa o tempo de viagem. O mínimo protege as obras muito perto.</p>`) },
          { id: 'adicionais', titulo: 'Adicionais', icone: ICONES_AJ.adicionais, resumo: S.adicionais, html: bloco('Adicionais sobre a mão de obra', `<p class="kf-ajuda">Percentual usado quando você marca o adicional no orçamento. Se marcar mais de um, eles se somam.</p>
              <div class="grid3">${pct('surUrgent', 'Urgência')}${pct('surNight', 'Noturno')}${pct('surWeekend', 'Fim de sem.')}</div>`) },
          { id: 'padrao', titulo: 'Orçamento novo', icone: ICONES_AJ.padrao, resumo: S.padrao, html: bloco('Padrão de cada orçamento novo', `<p class="kf-ajuda">Dá para mudar em cada orçamento.</p>
              <div class="grid2">
                ${f('validity', 'Validade, em dias', '15', 'text', 'inputmode="numeric" data-int')}
                ${f('warranty', 'Garantia, em dias', '90', 'text', 'inputmode="numeric" data-int')}
              </div>
              <div class="field"><label for="st-prazoN">Prazo de execução</label><div class="prazo-row"><input id="st-prazoN" data-set="prazoN" data-int type="text" inputmode="numeric" value="${s.prazoN || 1}" style="max-width:96px" aria-label="Quantidade do prazo"><select id="st-prazoU" data-set="prazoU" aria-label="Unidade do prazo">${Object.entries(PRAZO_U).map(([k, [pl, sg]]) => `<option value="${k}" ${s.prazoU === k ? 'selected' : ''}>${(s.prazoN || 1) === 1 ? sg : pl}</option>`).join('')}</select></div></div>
              <div class="field"><span class="lab">Pagamento</span><div class="seg" role="group" aria-label="Pagamento">${[['avista', 'À vista'], ['entrada', 'Entrada'], ['parcelado', 'Cartão'], ['combinar', 'Combinar']].map(([k, l]) => `<button data-pm="${k}" aria-pressed="${s.payMode === k}">${l}</button>`).join('')}</div></div>
              ${s.payMode === 'entrada' ? `<div class="field"><span class="lab">Entrada</span><div class="seg" role="group" aria-label="Entrada">${[30, 40, 50, 60, 70].map(n => `<button data-ep="${n}" aria-pressed="${s.entryPct === n}">${n}%</button>`).join('')}</div></div>` : ''}
              ${cartaoAjHTML(s)}
              <div class="field"><label for="st-avistaPct">Desconto para pagamento à vista, em %</label><input id="st-avistaPct" data-set="avistaPct" data-dec type="text" inputmode="decimal" placeholder="0" value="${s.avistaPct ? fmtQty(s.avistaPct) : ''}"><span class="kf-ajuda">Entra em todo orçamento novo à vista. Separado do desconto do serviço.</span></div>
              <div class="field"><label for="st-notes">Observações que sempre vão na proposta</label><textarea id="st-notes" data-set="notes" placeholder="Ex.: Não inclui reparos de alvenaria, gesso ou pintura.">${esc(s.notes)}</textarea></div>`) },
          { id: 'textos', titulo: 'Textos dos documentos', icone: ICONES_AJ.textos, resumo: S.textos, html: bloco('Textos dos documentos', `<p class="kf-ajuda">Saem em todos os orçamentos e relatórios. Deixe em branco para não usar.</p>
              <div class="field"><label for="st-acceptText">Termo de aceite, acima da assinatura do orçamento</label><textarea id="st-acceptText" data-set="acceptText">${esc(s.acceptText)}</textarea>
                ${s.acceptText !== ACCEPT_DEFAULT ? '<button class="linkish" data-reset="acceptText">Voltar ao texto sugerido</button>' : ''}</div>
              <div class="field"><label for="st-warrantyTerms">Condições da garantia</label><textarea id="st-warrantyTerms" data-set="warrantyTerms">${esc(s.warrantyTerms)}</textarea>
                ${s.warrantyTerms !== WARRANTY_DEFAULT ? '<button class="linkish" data-reset="warrantyTerms">Voltar ao texto sugerido</button>' : ''}</div>`) },
          { id: 'conquistas', titulo: 'Conquistas e apresentação', icone: ICONES_AJ.conquistas, resumo: S.conquistas, html: bloco('Conquistas e níveis', `<label class="aj-chave"><span class="lin-tx"><b>Mostrar conquistas e níveis</b><small>Desligado, o app fica só com os orçamentos. Nada é apagado.</small></span><span class="kf-chave"><input type="checkbox" id="aj-jogo" ${jogoLigado() ? 'checked' : ''}><span class="kf-chave-trilho"></span></span></label>`)
              + bloco('Apresentação', `<p class="kf-ajuda">As telas que aparecem na primeira vez que o app abre. O guia e o orçamento de exemplo ficam em Mais.</p><button type="button" class="kf-btn kf-sec" id="aj-abertura">Rever a apresentação</button>`) },
        ],
      })}
    </main>`;
  },
  bind(v) {
    KitFacil.ajustes.ligar(v);
    $('#aj-jogo', v)?.addEventListener('change', e => { jogo.off = !e.target.checked; jogoSalvar(); pintarNav(); pintarResumos(); toast(jogoLigado() ? 'Conquistas e níveis ligados.' : 'Conquistas e níveis desligados.'); if (jogoLigado()) jogoConferir({ silencioso: true }); });
    $('#aj-abertura', v)?.addEventListener('click', () => aberturaAbrir({ rever: true }));
    v.addEventListener('input', () => setTimeout(pintarResumos, 300));
    // as guias com texto longo crescem conforme o conteúdo quando são abertas
    v.addEventListener('click', e => { if (e.target.closest('[data-kf-aj-ir]')) requestAnimationFrame(() => $$('textarea', v).forEach(autoGrow)); });
    let t;
    $$('[data-set]', v).forEach(i => {
      const save = () => {
        const k = i.dataset.set;
        let val = i.value;
        if (i.hasAttribute('data-int')) val = parseInt(val.replace(/\D/g, ''), 10) || 0;
        else if (i.hasAttribute('data-money')) val = parseMoney(val) || 0;
        else if (i.hasAttribute('data-dec')) val = parseQty(val) || 0;
        else if (i.tagName === 'INPUT') val = val.trim();
        settings[k] = val; clearTimeout(t); t = setTimeout(saveSettings, 250);
      };
      i.addEventListener('input', save);
      i.addEventListener('change', () => {
        const k = i.dataset.set;
        if (k === 'pix' && settings.pix) { settings.pix = normPixKey(settings.pix); i.value = settings.pix; }
        if (k === 'phone') i.value = fmtPhone(settings.phone);
        saveSettings(); pintarResumos(); toast('Salvo.');
      });
    });
    $$('[data-pm]', v).forEach(b => b.onclick = () => { settings.payMode = b.dataset.pm; saveSettings(); rerender(); });
    $$('[data-aj-jur]', v).forEach(b => b.onclick = () => { settings.cardJuros = b.dataset.ajJur; saveSettings(); rerender(); });
    $$('[data-aj-paga]', v).forEach(b => b.onclick = () => { settings.cardPaga = b.dataset.ajPaga; saveSettings(); rerender(); });
    $$('[data-rate]', v).forEach(i => {
      i.addEventListener('input', () => { const R = { ...(settings.cardRates || {}) }, x = parseQty(i.value); if (x === null || i.value.trim() === '') delete R[i.dataset.rate]; else R[i.dataset.rate] = Math.max(0, Math.min(40, x)); settings.cardRates = R; clearTimeout(t); t = setTimeout(saveSettings, 250); });
      i.addEventListener('change', () => { saveSettings(); pintarResumos(); toast('Salvo.'); });
    });
    $$('[data-reset]', v).forEach(b => b.onclick = () => { const k = b.dataset.reset; settings[k] = k === 'acceptText' ? ACCEPT_DEFAULT : WARRANTY_DEFAULT; saveSettings(); rerender(); toast('Texto sugerido de volta.'); });
    $$('[data-ep]', v).forEach(b => b.onclick = () => { settings.entryPct = +b.dataset.ep; saveSettings(); rerender(); });
    const lf = $('#st-logo', v);
    $('[data-logo]', v).onclick = () => lf.click();
    lf.addEventListener('change', async () => {
      const file = lf.files[0]; if (!file) return;
      try { const r = await readLogo(file); settings.logo = r.url; settings.logoRatio = r.ratio; if (!saveSettings()) { settings.logo = ''; toast('Imagem grande demais. Tente outra.'); } else toast('Logotipo salvo.'); rerender(); }
      catch { toast('Não foi possível abrir essa imagem.'); }
    });
    $('[data-logo-rm]', v)?.addEventListener('click', () => { settings.logo = ''; saveSettings(); rerender(); });
  },
};


/* ---------- abertura (onboarding): quatro telas, uma vez só (Código, Art. 75) ---------- */
const aberturaAtiva = () => KitFacil.abertura.ativa();
function aberturaAbrir({ rever = false } = {}) {
  if (aberturaAtiva()) return;
  const veterano = quotes.some(q => !q.example);
  // a segunda tela é uma demonstração em que se toca: três itens de um orçamento, e o total muda na hora
  const DEMO = [['Ponto novo de tomada', 9000, 2], ['Instalação de luminária', 6000, 1], ['Troca de disjuntor', 4000, 0]];
  const qtd = DEMO.map(d => d[2]); let tocouDemo = false;
  const demoHTML = () => `<div class="folha ab-demo"><p class="mono ab-demo-cab"><span>Sala</span><span>mão de obra</span></p>
    ${DEMO.map(([n, p], k) => `<div class="ab-demo-l"><span class="ab-demo-n">${n}<small class="mono">${BRL(p)} cada</small></span>
      <span class="ab-demo-q"><button type="button" class="ab-q" data-ab-q="${k}" data-d="-1" aria-label="Menos um: ${n}" ${qtd[k] ? '' : 'disabled'}>${I.minus}</button><b class="num" aria-label="${qtd[k]} de ${n}">${qtd[k]}</b><button type="button" class="ab-q" data-ab-q="${k}" data-d="1" aria-label="Mais um: ${n}" ${qtd[k] >= 9 ? 'disabled' : ''}>${I.plus}</button></span></div>`).join('')}
    <p class="ab-demo-t" role="status"><span>Total</span><b class="num">${BRL(sum(DEMO.map((d, k) => d[1] * qtd[k])))}</b></p></div>`;
  const j = jogoEstado();
  const mini = ['luz', 'primeiro', 'aprovado', 'concluido', 'pix'].map(id => CONQUISTAS.find(c => c.id === id));
  const telas = [
    { arte: `<div class="prancheta ab-pr"><span class="pr-clipe"><i></i></span><div class="folha ab-folha"><span class="mono ab-f-num">Orçamento nº 0001</span><b class="ab-f-cli">Mariana Souza</b><span class="ab-f-linha"></span>
        <span class="mono ab-l"><span>Mão de obra</span><span>1.260,00</span></span><span class="mono ab-l"><span>Material</span><span>640,00</span></span><span class="mono ab-l"><span>Deslocamento</span><span>48,91</span></span>
        <span class="mono ab-f-tot"><span>Total</span><span>R$ 1.948,91</span></span></div></div>`,
      titulo: veterano && !rever ? 'O Elétrica Fácil está de cara nova' : 'O orçamento pronto antes do café esfriar',
      texto: veterano && !rever ? 'Seus orçamentos, preços e ajustes continuam aqui. O orçamento agora é uma folha só, presa na prancheta.' : 'Escolha os serviços e o material da sua tabela. O app soma tudo, com deslocamento, adicionais e impostos.' },
    { arte: () => demoHTML(), falada: true, titulo: 'Toque e o total muda', texto: 'Experimente: toque em + e em − para mudar as quantidades. É assim que o orçamento se monta.' },
    { arte: `<div class="ab-leque"><div class="folha ab-doc d1"><span class="mono">Recibo</span><span class="ab-f-linha"></span><span class="mono ab-l"><span>Recebido</span><span>1.948,91</span></span></div>
        <div class="folha ab-doc d2"><span class="mono">Proposta</span><span class="ab-f-linha"></span><span class="mono ab-l"><span>Total</span><span>1.948,91</span></span><span class="ab-pixfig" aria-hidden="true"></span><span class="mono ab-pix">Pix copia e cola</span><span class="ab-carimbo">Aprovado</span></div></div>`,
      titulo: 'Da proposta ao recibo', texto: 'Envie a proposta em PDF ou pelo WhatsApp, com Pix, prazo e garantia. Marque a resposta do cliente e, no fim, gere o relatório e o recibo.' },
    { arte: `<div class="varal ab-varal"><div class="varal-fio">${mini.map((c, k) => `<span class="lp-btn ${k < 3 ? 'on' : 'off'}" style="--i:${k}">${lampSVG(c, { acesa: k < 3 })}</span>`).join('')}</div></div>`,
      titulo: veterano && j.ganhas.length ? `Você já chega com ${plural(j.ganhas.length, 'lâmpada acesa', 'lâmpadas acesas')}` : 'Acenda as lâmpadas do seu varal',
      texto: 'Cada passo bem dado no app acende uma lâmpada e conta para o seu nível. É só uma brincadeira, e dá para desligar nos Ajustes.',
      extra: settings.name ? '' : `<div class="field ab-nome"><label for="ab-eu">Como você assina os orçamentos? (opcional)</label><input id="ab-eu" class="kf-entrada" type="text" autocapitalize="words" autocomplete="off" maxlength="60" placeholder="Seu nome"></div>` },
  ];
  KitFacil.abertura.abrir({ telas, rever, rotulo: 'Apresentação do Elétrica Fácil',
    fim: () => rever ? 'Concluir' : 'Começar um orçamento',
    extra: { rotulo: 'Ver um orçamento de exemplo', mostrar: () => !rever },
    aoMontar: (el, { redesenharArte }) => {
      el.addEventListener('click', e => { const b = e.target.closest('[data-ab-q]'); if (!b) return; const k = +b.dataset.abQ, d = +b.dataset.d; qtd[k] = Math.max(0, Math.min(9, qtd[k] + d)); tocouDemo = true; redesenharArte();
        ($(`[data-ab-q="${k}"][data-d="${d}"]:not([disabled])`, el) || $(`[data-ab-q="${k}"]:not([disabled])`, el))?.focus({ preventScroll: true }); });
    },
    aoFechar: ({ como, el }) => {
      const inp = $('#ab-eu', el), nome = inp ? inp.value.trim().replace(/\s+/g, ' ') : '';
      const disse = !!nome && !settings.name;
      if (disse) { settings.name = nome; saveSettings(); }
      if (tocouDemo) jogo.flags.abertura = jogo.flags.abertura || Date.now();
      // quem já usava chega com as lâmpadas que os dados dele acendem; "Primeira luz" aparece para quem acabou de dizer o nome
      const antes = { ...jogo.vistas }; jogoSalvar(); jogoConferir({ silencioso: true });
      rerender();
      const depois = como === 'extra' ? () => createExample() : como === 'fim' && !rever ? () => { const c = $('#novo-nome'); if (c) KitFacil.destacar(c.closest('.prancheta')); } : null;
      const luz = disse && jogoLigado() && !antes.luz && CONQUISTAS.find(c => c.id === 'luz');
      return () => { if (luz) setTimeout(() => lpNova([luz], () => { depois && depois(); }), semMovimento() ? 0 : 320); else depois && depois(); };
    } });
}

/* ---------- guia: o app faz cada passo na tela, do começo ao fim, numa demonstração que não grava nada ----------
   O motor (janela fixa acima da barra, contagem, dedo, anel e as mãos) é o do Kit (KitFacil.guia.demonstrar); aqui ficam
   o roteiro (guia.js) e a troca dos dados reais pelos da demonstração. */
const guiaAtivo = () => KitFacil.guia.emDemonstracao();
let dadosReais = null;
const guiaFoto = () => JSON.stringify({ quotes, prices, settings, tools, checks, jogo, hash: location.hash, homeFilter, homeQuery, gestaoAba, PANEL });
function guiaPor(o) {
  quotes = o.quotes; prices = o.prices; settings = o.settings; tools = o.tools; checks = o.checks; jogo = o.jogo; homeFilter = o.homeFilter || 'todos'; homeQuery = o.homeQuery || '';
  if (o.gestaoAba) gestaoAba = o.gestaoAba;
  for (const k in PANEL) delete PANEL[k]; Object.assign(PANEL, o.PANEL || {});
}
function guiaLimparTela() { closeSheet(true); $$('.kf-toast').forEach(e => { e.hidden = true; }); lpFila = []; }
function guiaIniciar() {
  if (guiaAtivo() || aberturaAtiva()) return;
  KitFacil.guia.demonstrar({
    passos: GUIA,
    comecar: () => {
      closeSheet(true);
      // os dados de verdade ficam guardados na memória; a demonstração começa do zero e nada dela é gravado
      dadosReais = { quotes, prices, settings, tools, checks, jogo, homeFilter, homeQuery, gestaoAba, PANEL: { ...PANEL } };
      semSalvar = true;
      guiaPor({ quotes: [], prices: seedPrices(), tools: seedTools(), checks: [], homeFilter: 'todos', gestaoAba: 'estoque',
        settings: { ...DEF, seedV: settings.seedV, toolSeedV: settings.toolSeedV, name: 'Carlos Pereira', phone: '11987654321', city: 'São Paulo', pix: 'carlos@exemplo.com.br', kmPerL: 10, fuelPrice: 619, wearPerKm: 40, surUrgent: 50, surNight: 30, surWeekend: 50 },
        jogo: { flags: {}, vistas: {}, off: jogo.off, pronto: true } });
      go('/', true);
    },
    foto: guiaFoto,
    limpar: guiaLimparTela,
    restaurar: f => { const o = JSON.parse(f); guiaPor(o); history.replaceState({ d: 0 }, '', o.hash || '#/'); closeSheet(true); render(); },
    terminar: ({ concluiu }) => {
      const r = dadosReais; dadosReais = null;
      guiaPor(r); semSalvar = false;
      history.replaceState({ d: 0 }, '', '#/'); closeSheet(true); render();
      if (concluiu) { jogoMarcar('guia'); toast('Guia concluído. Para rever, toque em Mais e em Ver o guia.'); }
    },
  });
}

/* ---------- arranque ---------- */
try { history.scrollRestoration = 'manual'; } catch {}
// link de "Conectar outro aparelho": a chave vem depois do #, que não sai do aparelho
const linkToken = SY.tokenDoLink();
if (linkToken) history.replaceState({ d: 0 }, '', '#/ajustes');
if (!location.hash) history.replaceState({ d: 0 }, '', '#/');
else if (!history.state) history.replaceState({ d: 0 }, '', location.hash);
render();
SY.iniciar({ token: linkToken, silencioso: false, textoConfirmar: 'Os orçamentos deste aparelho se juntam aos da nuvem. Os preços e os ajustes passam a ser os da nuvem.' });
// a abertura aparece uma vez (Código, Art. 75); quem chega por um link de sincronização vai direto para os Ajustes
if (!KitFacil.abertura.vista() && !linkToken && !(navigator.webdriver && !window.EF_TESTE_ABERTURA)) aberturaAbrir();
else jogoConferir({ silencioso: !jogo.pronto });
// atalho "Novo orçamento" do ícone do app (manifesto)
if (/[?&]novo=1/.test(location.search)) { try { history.replaceState(history.state, '', location.pathname + location.hash); } catch {} if (!aberturaAtiva()) setTimeout(() => createQuote(), 300); }
try { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw', e)); } catch (e) { console.warn('sw', e); }
