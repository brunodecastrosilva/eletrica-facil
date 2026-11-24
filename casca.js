/* Elétrica Fácil 5 · moldura (navegação e troca de tela), Ajustes, apresentação, guia e arranque do app. */
'use strict';

/* ---------- desenhar a tela ---------- */
let nomeAtual = '', dAntes = 0, docVeio = { de: '', empilhou: false, d: 0 };
/* A seta do documento (5.3.1): volta a Documentos se a pessoa veio de lá; em qualquer outro caso, ao Início. Quando a
   tela anterior do histórico é o próprio destino, volta pelo histórico (a lista fica onde estava). */
function sairDoc() {
  const dest = docVeio.de === 'docs' ? 'docs' : 'inicio', d = (history.state && history.state.d) || 0;
  if ((docVeio.de === dest) && docVeio.empilhou && d === docVeio.d && d > 0) return history.back();
  ir(dest === 'docs' ? '/docs' : '/', true);
}
const PRINCIPAIS = ['inicio', 'docs', 'precos', 'mais', 'ajustes'];
const TITULOS = { inicio: 'Início', docs: 'Documentos', doc: 'Documento', precos: 'Preços', cat: 'Preços', mais: 'Mais', ajustes: 'Ajustes' };
function desenhar(o = {}) {
  let r = rota();
  // documento novo que ficou vazio some ao sair dele, e o número volta para o próximo
  if (docAberto && r.id !== docAberto) {
    const d = getDoc(docAberto);
    if (d && docVazio(d)) { docs = docs.filter(x => x !== d); if (d.num === ajustes.seq) { ajustes.seq--; salvarAjustes(); } salvarDocs(); }
  }
  if ((r.nome === 'doc' && !getDoc(r.id)) || (r.nome === 'cat' && !cats.some(c => c.id === r.id))) { history.replaceState({ d: 0 }, '', r.nome === 'cat' ? '#/precos' : '#/'); r = rota(); }
  docAberto = r.nome === 'doc' ? r.id : null;
  // trocou de tela: o aviso da tela anterior some; e o documento lembra de onde veio (a seta volta para lá ou para o Início)
  const dAgora = (history.state && history.state.d) || 0;
  if (r.chave !== chaveAtual) { esconderAviso(); if (r.nome === 'doc' && nomeAtual !== 'doc') docVeio = { de: nomeAtual, empilhou: dAgora > dAntes, d: dAgora }; }
  nomeAtual = r.nome; dAntes = dAgora;
  if (r.nome !== 'ajustes') ajDoMais = false;
  const T = TELAS[r.nome];
  // a área da tela é trocada por uma nova a cada desenho: assim os toques ligados pela tela anterior não se acumulam
  const velho = $('#app'), app = velho.cloneNode(false);
  app.innerHTML = T.html(r);
  // trilho e barra de baixo ficam logo depois da barra de cima: no teclado, barra de cima → menu → conteúdo
  const fixos = [$('#trilho'), $('#nav')].filter(Boolean);
  fixos.forEach(el => document.body.appendChild(el));
  velho.replaceWith(app);
  const cab = $(':scope > header', app);
  if (cab) cab.after(...fixos); else app.prepend(...fixos);
  const principal = PRINCIPAIS.includes(r.nome);
  $('#nav').hidden = !principal;
  document.body.dataset.tela = r.nome;
  pintarNav(r);
  KitFacil.topo.atualizar();
  prepararCampos(app);
  T.ligar(app, r);
  if (!o.manter) window.scrollTo(0, modoNav === 'volta' && principal ? (rolagem[r.chave] || 0) : 0);
  if (r.chave !== chaveAtual) { KitFacil.movimento.entrar(app, { de: 'tela' }); document.title = `${TITULOS[r.nome]} · Elétrica Fácil`; }
  chaveAtual = r.chave;
  aoRolar();
}
function redesenhar() {
  const y = window.scrollY, f = document.activeElement && document.activeElement.id;
  desenhar({ manter: true });
  window.scrollTo(0, y);
  if (f) { const el = document.getElementById(f); if (el && el.matches('input,textarea')) el.focus({ preventScroll: true }); }
}
function aoRolar() { const b = $('.barra-app'); if (b) b.classList.toggle('kf-rolou', window.scrollY > 4); }
window.addEventListener('scroll', aoRolar, { passive: true });

/* ---------- navegação: a barra de baixo e o trilho são os do Kit ----------
   Início, Documentos, o documento novo no centro, Preços e Mais (guia, exemplo e Ajustes). */
const ROTAS = { inicio: '/', docs: '/docs', precos: '/precos', mais: '/mais' };
function pintarNav(r = rota()) {
  const n = r.nome, it = (id, rotulo, icone, atual) => ({ id, rotulo, icone, atual });
  const itens = [it('inicio', 'Início', IC.inicio, n === 'inicio'), it('docs', 'Documentos', IC.docs, n === 'docs' || n === 'doc'), it('precos', 'Preços', IC.precos, n === 'precos' || n === 'cat')];
  const html = KitFacil.nav.barra({ itens, centro: { id: 'novo', rotulo: 'Novo', nome: 'Novo documento', icone: IC.soma }, mais: { atual: n === 'mais' } });
  const nav = $('#nav'); if (nav.dataset.h !== html) { nav.innerHTML = html; nav.dataset.h = html; }
  const lado = KitFacil.nav.trilho({ destaque: { id: 'novo', rotulo: 'Novo documento', icone: IC.soma }, itens, mais: { atual: n === 'mais' } });
  const t = $('#trilho-lista'); if (t.dataset.h !== lado) { t.innerHTML = lado; t.dataset.h = lado; }
}
function irPara(id) {
  if (id === 'novo') return janelaNovo();
  if (id === 'guia') return guiaIniciar();
  if (id === 'exemplo') return criarExemplo();
  const caminho = ROTAS[id]; if (!caminho) return;
  if (rota().chave === caminho) { window.scrollTo({ top: 0, behavior: semMovimento() ? 'auto' : 'smooth' }); return; }
  // estando numa guia dos Ajustes (celular), primeiro tira a guia do histórico e depois troca de tela
  if (history.state && history.state.kfAjPush) { irDepois = caminho; history.back(); return; }
  ir(caminho, true);
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-kf-ir]'); if (!b) return;
  e.preventDefault(); irPara(b.dataset.kfIr);
});

// lista de escolha e calendário do Kit abertos perto do pé: rola o que falta para o último item ficar à vista, acima do
// rodapé da janela ou das barras fixas de baixo. Correção do app até o Kit corrigir (Exceções ao padrão, no README)
document.addEventListener('click', e => {
  const w = e.target.closest && e.target.closest('.kf-esc'); if (!w || !e.target.closest('.kf-esc-btn')) return;
  setTimeout(() => {
    const el = w.classList.contains('kf-aberta') && $('.kf-esc-lista:not([hidden]), .kf-cal:not([hidden])', w); if (!el) return;
    const corpo = el.closest('.kf-dlg-corpo');
    let fundo = corpo ? corpo.getBoundingClientRect().bottom : innerHeight;
    if (!corpo) $$('.pe-tela .pe-in, .kf-nav').forEach(b => { if (b.getClientRects().length) fundo = Math.min(fundo, b.getBoundingClientRect().top); });
    const falta = el.getBoundingClientRect().bottom + 12 - fundo;
    if (falta > 0) (corpo || window).scrollBy({ top: falta, behavior: semMovimento() ? 'auto' : 'smooth' });
  }, KitFacil.movimento.curto + 60);
});

/* ---------- do Mais para uma guia dos Ajustes, e de volta (5.4.0) ----------
   A linha do Mais abre os Ajustes já na guia. Enquanto a pessoa está nessa guia, o botão de voltar dela diz "Mais" e
   leva ao Mais (pelo histórico, que tem o Mais, os Ajustes e a guia); o voltar do aparelho faz o mesmo. Sair dos Ajustes
   por outro caminho encerra o atalho. */
let ajDoMais = false;
function abrirAjustesDoMais(secao) {
  ajDoMais = true; ir('/ajustes');
  requestAnimationFrame(() => { KitFacil.ajustes.abrir(secao); voltaParaMais(); });
}
const voltaParaMais = () => { if (!ajDoMais) return; $$('[data-kf-aj-voltar]').forEach(b => { const tx = [...b.childNodes].find(n => n.nodeType === 3); if (tx) tx.textContent = 'Mais'; b.setAttribute('aria-label', 'Voltar ao Mais'); }); };
window.addEventListener('click', e => {
  if (!ajDoMais || !(e.target.closest && e.target.closest('[data-kf-aj-voltar]'))) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (history.state && history.state.kfAjPush) history.go(-2); else voltar('/mais');
}, true);
window.addEventListener('popstate', () => {
  // o voltar do aparelho na guia aberta pelo Mais: da lista dos Ajustes, segue até o Mais
  if (ajDoMais && rota().nome === 'ajustes' && !(history.state && history.state.kfAj)) history.back();
});

/* ---------- aviso rápido: nunca cobre botão nem campo, e some ao trocar de tela (5.3.1; Art. 30-A) ----------
   O Kit põe o aviso no pé da tela e, com uma janela aberta, acima dos botões do pé dela. Em janela alta e na abertura ele
   cobria campos e botões. Aqui, com janela ou abertura na tela, o app procura o primeiro lugar livre: o do Kit, logo
   acima da janela, e o alto da tela. Sem lugar livre, fica onde cobre menos. Proposta para o Integrador: o Kit fazer isso. */
const ALVOS_AVISO = 'button,input:not([type="hidden"]),select,textarea,a[href],[role="button"],[tabindex]:not([tabindex="-1"])';
function posicionarAviso() {
  const t = $('.kf-toast'); if (!t || t.hidden) return;
  t.style.top = ''; t.style.bottom = '';
  const escopo = $('.kf-abertura') || $$('.kf-ov').pop(); if (!escopo) return;
  const alto = (window.visualViewport && visualViewport.height) || innerHeight;
  // a parte à vista de cada botão ou campo: recortada pelas áreas que rolam (o corpo da janela, as colunas das rodas)
  const visto = e => { let r = e.getBoundingClientRect(), [l, tp, rt, bt] = [r.left, r.top, r.right, r.bottom];
    for (let x = e.parentElement; x && x !== escopo.parentElement; x = x.parentElement) { const st = getComputedStyle(x); if (/(auto|scroll|hidden|clip)/.test(st.overflowX + st.overflowY)) { const c = x.getBoundingClientRect(); l = Math.max(l, c.left); tp = Math.max(tp, c.top); rt = Math.min(rt, c.right); bt = Math.min(bt, c.bottom); } }
    return { left: l, top: tp, right: rt, bottom: bt, width: rt - l, height: bt - tp }; };
  const A = $$(ALVOS_AVISO, escopo).filter(e => !t.contains(e) && e.getClientRects().length).map(visto).filter(r => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < alto);
  const r0 = t.getBoundingClientRect(), h = r0.height;
  const cobre = y => A.reduce((n, r) => n + Math.max(0, Math.min(r0.right, r.right) - Math.max(r0.left, r.left)) * Math.max(0, Math.min(y + h, r.bottom) - Math.max(y, r.top)), 0);
  const dlg = $('.kf-dlg', escopo), C = [r0.top];
  if (dlg) { const y = dlg.getBoundingClientRect().top - h - 10; if (y >= 8) C.push(y); }
  C.push(8);
  let melhor = C[0], menor = Infinity;
  for (const y of C) { const n = cobre(y); if (n < menor) { menor = n; melhor = y; } if (!n) break; }
  if (melhor !== r0.top) { t.style.top = `calc(env(safe-area-inset-top, 0px) + ${Math.round(melhor)}px)`; t.style.bottom = 'auto'; }
}
/* a fila de escolhas que rola para o lado (categorias, cômodos, filtros) termina em degradê do lado em que há mais (5.3.1) */
const marcarFila = f => { const mx = f.scrollWidth - f.clientWidth; f.classList.toggle('fade-d', mx > 2 && f.scrollLeft < mx - 2); f.classList.toggle('fade-e', mx > 2 && f.scrollLeft > 2); };
document.addEventListener('scroll', e => { if (e.target.classList && e.target.classList.contains('chips')) marcarFila(e.target); }, { capture: true, passive: true });
let avisoPend = 0;
const vigiarAviso = () => { cancelAnimationFrame(avisoPend); avisoPend = requestAnimationFrame(() => { posicionarAviso(); $$('.chips').forEach(marcarFila); }); };
const esconderAviso = () => $$('.kf-toast').forEach(e => { e.hidden = true; });
// a janela que nasce se move por 600 ms: mede de novo quando ela para
new MutationObserver(ms => { if (ms.some(m => m.target.classList && m.target.classList.contains('kf-toast') || [...m.addedNodes, ...m.removedNodes].some(n => n.nodeType === 1))) { vigiarAviso(); setTimeout(vigiarAviso, KitFacil.movimento.ms + 80); } })
  .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
window.addEventListener('resize', vigiarAviso);
if (window.visualViewport) visualViewport.addEventListener('resize', vigiarAviso);

/* ---------- Ajustes: as oito guias do Kit e, depois, as do Elétrica Fácil (Código, Art. 62) ---------- */
function lerLogo(arquivo) {
  return new Promise((ok, falhou) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 320, prop = img.width / img.height;
        let w = img.width, h = img.height;
        if (w >= h && w > max) { w = max; h = Math.round(max / prop); } else if (h > w && h > max) { h = max; w = Math.round(max * prop); }
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
        ok({ url: cv.toDataURL('image/png'), prop });
      };
      img.onerror = falhou; img.src = fr.result;
    };
    fr.onerror = falhou; fr.readAsDataURL(arquivo);
  });
}
function resumosAjustes() {
  const s = ajustes;
  return {
    cobranca: `${s.hora ? BRL(s.hora) + ' a hora' : 'Hora ainda não informada'} · ${s.deslModo === 'km' ? (s.deslKm ? BRL(s.deslKm) + ' por km' : 'km sem valor') : s.deslIda ? BRL(s.deslIda) + ' por ida' : 'ida sem valor'} · ${s.minIda ? 'mínimo de ' + BRL(s.minIda) : 'sem mínimo por ida'}`,
    pix: s.pix || 'Nenhuma chave cadastrada',
    padrao: `Validade de ${plural(s.validade, 'dia', 'dias')} · garantia de ${garCurta(s)} · ${s.pag === 'entrada' ? `entrada de ${s.entradaPct}%` : s.pag === 'combinar' ? 'pagamento a combinar' : 'à vista'}`,
    raio: Raio.ligado() ? 'Raio ligado' : 'Raio desligado',
  };
}
function pintarResumos() { const S = resumosAjustes(); for (const k in S) KitFacil.ajustes.resumo(k, S[k]); }
TELAS.ajustes = {
  html() {
    const s = ajustes, S = resumosAjustes();
    const f = (k, rotulo, dica, attrs = '') => campo('aj-' + k, rotulo, `<input id="aj-${k}" class="kf-entrada" data-aj="${k}" type="text" value="${esc(k === 'fone' ? fone(s[k]) : k === 'doc' ? cpfCnpj(s[k]) : s[k])}" placeholder="${esc(dica)}" ${attrs}>`);
    const bloco = (titulo, corpo) => `<div class="kf-bloco"><h3>${titulo}</h3>${corpo}</div>`;
    return `${barraTopo()}
    <main class="tela larga" id="conteudo">
      ${KitFacil.ajustes.html({
        extras: {
          conta: bloco('Seus dados nos documentos', `<p class="kf-ajuda">Saem no alto dos orçamentos, dos relatórios e dos recibos.</p>
            <div class="logo-lin">
              <button type="button" class="logo-bt" data-logo aria-label="Escolher logotipo">${s.logo ? `<img src="${esc(s.logo)}" alt="Seu logotipo">` : IC.imagem}</button>
              <div class="logo-tx"><b>Logotipo</b><small>Sem logotipo, o documento sai com o raio do app.</small></div>
              <input type="file" id="aj-logo" accept="image/*" hidden>
            </div>
            ${s.logo ? '<button type="button" class="kf-btn kf-perigo kf-p" data-logo-tira>Remover logotipo</button>' : ''}
            ${f('nome', 'Seu nome', 'Ex.: Carlos Pereira', 'autocapitalize="words"')}
            ${f('empresa', 'Nome da empresa', 'Ex.: Silva Elétrica', 'autocapitalize="words"')}
            ${f('fone', 'WhatsApp', '(11) 90000-0000', 'inputmode="tel"')}
            ${f('email', 'E-mail', 'Ex.: voce@email.com', 'autocapitalize="off" inputmode="email"')}
            ${f('doc', 'CPF ou CNPJ', 'Sai no recibo', 'inputmode="numeric"')}
            ${f('registro', 'Registro profissional', 'CREA, CFT ou NR-10')}
            ${f('cidade', 'Cidade', 'Ex.: São Paulo', 'autocapitalize="words"')}`),
        },
        produto: [
          { id: 'cobranca', titulo: 'Cobrança', icone: ICONES_AJ.cobranca, resumo: S.cobranca, html: bloco('A sua hora', `<p class="kf-ajuda">É a base dos preços: cada serviço guarda um tempo, e o preço é o tempo vezes a hora.</p>
              <dl class="resumo"><div class="forte"><dt>A sua hora</dt><dd class="num">${s.hora ? BRL(s.hora) : 'Sem valor'}</dd></div></dl>
              <button type="button" class="kf-btn kf-sec" id="aj-hora">${s.hora ? 'Mudar a minha hora' : 'Informar a minha hora'}</button>`)
            + bloco('Deslocamento', `<p class="kf-ajuda">Sai numa linha própria do documento, por ida.</p>
              <div class="kf-campo"><span class="kf-rotulo">Como você cobra</span>${segmento('Como você cobra o deslocamento', 'aj-dm', [['fixo', 'Fixo por ida'], ['km', 'Por quilômetro']], s.deslModo)}</div>
              ${s.deslModo === 'km' ? campo('aj-deslKm', 'Valor por km', campoDinheiro('aj-deslKm', s.deslKm, 'data-ajd="deslKm"'), 'Você informa a distância, ida e volta, em cada documento.') : campo('aj-deslIda', 'Valor por ida', campoDinheiro('aj-deslIda', s.deslIda, 'data-ajd="deslIda"'))}`)
            + bloco('Diária', `${campo('aj-diaria', 'Valor da diária', campoDinheiro('aj-diaria', s.diaria, 'data-ajd="diaria"'), 'Para obra longa: um valor fechado por dia, em Somar serviço. Com R$ 0,00, o app pergunta na primeira vez.')}`)
            + bloco('Mínimo por ida', `${campo('aj-minIda', 'Mão de obra mínima por ida', campoDinheiro('aj-minIda', s.minIda, 'data-ajd="minIda"'), 'Se os serviços somarem menos, entra a linha "Atendimento mínimo" com a diferença. Com R$ 0,00, não há mínimo. Vale para os documentos novos.')}`)
            + bloco('Condição do serviço', `<p class="kf-ajuda">Quanto somar ao preço quando o serviço é mais difícil que o normal. Você escolhe em cada linha.</p>
              ${campo('aj-cond1', 'Difícil, em %', `<input id="aj-cond1" class="kf-entrada" data-ajn="cond1" type="text" inputmode="numeric" maxlength="3" value="${s.cond1}">`)}
              ${campo('aj-cond2', 'Muito difícil, em %', `<input id="aj-cond2" class="kf-entrada" data-ajn="cond2" type="text" inputmode="numeric" maxlength="3" value="${s.cond2}">`)}`) },
          { id: 'pix', titulo: 'Pix', icone: ICONES_AJ.pix, resumo: S.pix, html: bloco('Chave Pix', `<p class="kf-ajuda">Com a chave, o documento sai com o QR code do valor, e a tela de receber mostra o código para o cliente pagar.</p>
            ${f('pix', 'Chave Pix', 'CPF, celular, e-mail ou chave aleatória', 'autocapitalize="off" spellcheck="false"')}`) },
          { id: 'padrao', titulo: 'Documento novo', icone: ICONES_AJ.padrao, resumo: S.padrao, html: bloco('Como começa todo documento novo', `<p class="kf-ajuda">Dá para mudar em cada documento.</p>
            <div class="kf-campo"><span class="kf-rotulo">Validade do orçamento</span>${segmento('Validade do orçamento', 'aj-val', VAL_OP, s.validade)}</div>
            ${blocoGarantia(s.garAd, 'data-aj-gar')}
            <div class="kf-campo"><span class="kf-rotulo">Pagamento</span>${segmento('Pagamento', 'aj-pag', [['vista', 'À vista'], ['entrada', 'Entrada'], ['combinar', 'A combinar']], s.pag)}</div>
            ${s.pag === 'entrada' ? `<div class="kf-campo"><span class="kf-rotulo">Quanto de entrada</span>${segmento('Quanto de entrada', 'aj-ep', [30, 40, 50, 60, 70].map(n => [n, n + '%']), s.entradaPct)}</div>` : ''}
            ${campo('aj-obs', 'Observações que sempre vão no documento', `<textarea id="aj-obs" class="kf-entrada" data-aj="obs" rows="4" placeholder="Ex.: Não inclui reparos de alvenaria, gesso ou pintura.">${esc(s.obs)}</textarea>`)}`) },
          { id: 'raio', titulo: 'Raio e apresentação', icone: ICONES_AJ.raio, resumo: S.raio, html: bloco('Um raio de vez em quando', `<label class="aj-chave"><span class="aj-chave-tx"><b>Soltar raios</b><small>Cai sozinho, de tempos em tempos. É enfeite: não recebe toque e some em um segundo.</small></span>${KitFacil.ui.chave({ attrs: 'id="aj-raio"', on: Raio.ligado() })}</label>
              <button type="button" class="kf-btn kf-sec" id="aj-raio-ver">Soltar um raio agora</button>
              ${semMovimento() ? '<p class="kf-ajuda">Seu aparelho pede menos movimento, então os raios ficam desligados.</p>' : ''}`)
            + bloco('Apresentação', '<p class="kf-ajuda">As quatro telas que aparecem na primeira vez que o app abre. O guia e o exemplo ficam em Mais.</p><button type="button" class="kf-btn kf-sec" id="aj-abertura">Rever a apresentação</button>') },
        ],
      })}
    </main>`;
  },
  ligar(v) {
    KitFacil.ajustes.ligar(v);
    $('#aj-hora', v)?.addEventListener('click', () => janelaHora());
    $$('[data-ajd]', v).forEach(i => i.addEventListener('focusout', () => { const k = i.dataset.ajd, n = lerDinheiro(i); if (n === ajustes[k]) return; ajustes[k] = n; salvarAjustes(); pintarResumos(); aviso('Salvo.'); }));
    $$('[data-ajn]', v).forEach(i => i.addEventListener('change', () => { const k = i.dataset.ajn; ajustes[k] = Math.max(0, Math.min(300, parseInt(i.value, 10) || 0)); i.value = ajustes[k]; salvarAjustes(); aviso('Salvo.'); }));
    $('#aj-abertura', v)?.addEventListener('click', () => aberturaAbrir({ rever: true }));
    $('#aj-raio', v)?.addEventListener('change', e => { Raio.ligar(e.target.checked); pintarResumos(); aviso(Raio.ligado() ? 'Raios ligados.' : 'Raios desligados.'); });
    $('#aj-raio-ver', v)?.addEventListener('click', () => { if (semMovimento()) return aviso('Com movimento reduzido no aparelho, o raio não cai.'); Raio.cair({ forcar: true }); });
    let t;
    $$('[data-aj]', v).forEach(i => {
      const k = i.dataset.aj;
      i.addEventListener('input', () => { ajustes[k] = i.tagName === 'INPUT' ? i.value.trim() : i.value; clearTimeout(t); t = setTimeout(() => { salvarAjustes(); pintarResumos(); }, 300); });
      i.addEventListener('change', () => {
        clearTimeout(t);
        if (k === 'pix' && ajustes.pix) { ajustes.pix = KitFacil.pix.chave(ajustes.pix); i.value = ajustes.pix; }
        if (k === 'fone') i.value = fone(ajustes.fone);
        if (k === 'doc') i.value = cpfCnpj(ajustes.doc);
        salvarAjustes(); pintarResumos(); aviso('Salvo.');
      });
    });
    v.addEventListener('click', e => {
      const t2 = e.target; let b;
      if ((b = t2.closest('[data-aj-val]'))) ajustes.validade = +b.dataset.ajVal;
      else if ((b = t2.closest('[data-aj-gar]'))) ajustes.garAd = +b.dataset.ajGar;
      else if ((b = t2.closest('[data-aj-pag]'))) ajustes.pag = b.dataset.ajPag;
      else if ((b = t2.closest('[data-aj-dm]'))) ajustes.deslModo = b.dataset.ajDm === 'km' ? 'km' : 'fixo';
      else if ((b = t2.closest('[data-aj-ep]'))) ajustes.entradaPct = +b.dataset.ajEp;
      else return;
      salvarAjustes(); redesenhar();
    });
    const lf = $('#aj-logo', v);
    $('[data-logo]', v).onclick = () => lf.click();
    lf.addEventListener('change', async () => {
      const arq = lf.files[0]; if (!arq) return;
      try { const r = await lerLogo(arq); ajustes.logo = r.url; ajustes.logoProp = r.prop; if (!salvarAjustes()) { ajustes.logo = ''; aviso('Imagem grande demais. Tente outra.'); } else aviso('Logotipo salvo.'); redesenhar(); }
      catch { aviso('Não foi possível abrir essa imagem.'); }
    });
    $('[data-logo-tira]', v)?.addEventListener('click', () => { ajustes.logo = ''; salvarAjustes(); redesenhar(); aviso('Logotipo removido.'); });
  },
};

/* ---------- apresentação: quatro telas, uma vez só (Código, Art. 75) ---------- */
const aberturaAtiva = () => KitFacil.abertura.ativa();
function aberturaAbrir({ rever = false } = {}) {
  if (aberturaAtiva()) return;
  if (!rever) { try { localStorage.setItem('kitfacil.eletrica-facil.visto', JSON.stringify(VERSAO)); } catch {} }
  // tela 2: quatro blocos de verdade; cada toque soma um serviço e a conta anda
  const DEMO = [['tomada', 'Tomada', 6000], ['lampada', 'Luminária', 9000], ['quadro', 'Disjuntor', 7000], ['chuveiro', 'Chuveiro', 11500]];
  const n = [1, 0, 0, 0];
  const blocos = () => { const q = soma(n), v = soma(n.map((x, i) => x * DEMO[i][2])); return `<div class="ab-cena ab-somar"><div class="blocos p">${DEMO.map(([ic, nome], i) => `<button type="button" class="bloco" data-ab-soma="${i}"><span class="bl-ic">${PIC[ic]}</span><b class="bl-nome">${nome}</b>${n[i] ? `<span class="bl-selo num">${n[i]}</span>` : ''}</button>`).join('')}</div>
    <p class="ab-conta" role="status"><span>${plural(q, 'serviço', 'serviços')}</span><b class="num">${BRL(v)}</b></p></div>`; };
  const PASSOS = [['Rascunho', 'Enviar'], ['Enviado', 'Aprovou'], ['Aprovado', 'Receber'], ['Recebido', 'Enviar recibo']];
  const passos = `<div class="ab-cena ab-passos"><div class="pnl ab-pnl" role="img" aria-label="${PASSOS.map(x => `${x[0]}: ${x[1]}`).join('; ')}."><ol class="tr-passos pnl-trilha" aria-hidden="true">${PASSOS.map((x, i) => `<li class="${i < 2 ? 'feito' : i === 2 ? 'atual' : ''}"><span>${x[0]}</span></li>`).join('')}</ol>
      <div class="pnl-tot" aria-hidden="true">${DISJUNTOR}<div class="pnl-t"><small>Total</small><b class="num">${BRL(143500)}</b></div></div></div>
      <div class="ab-pe" aria-hidden="true"><span class="bt-ic contorno">${IC.mais}</span><span class="kf-btn kf-pri">Receber</span></div></div>`;
  const dois = `<div class="ab-cena ab-dois" role="img" aria-label="Orçamento, antes do serviço. Relatório, depois do serviço."><div class="ab-papel"><span class="op-ic">${IC.docs}</span><b>Orçamento</b><small>Antes do serviço</small></div><div class="ab-papel"><span class="op-ic">${IC.recibo}</span><b>Relatório</b><small>Depois do serviço</small></div></div>`;
  const marca = '<div class="ab-cena ab-marca"><span class="ab-halo" aria-hidden="true"></span><img src="icons/icon-192.png" alt="" width="132" height="132"></div>';
  const telas = [
    { arte: () => marca, titulo: 'Orçamento de elétrica, do pedido ao recibo', texto: 'Veja em quatro telas como funciona.' },
    { arte: () => blocos(), falada: true, titulo: 'Some os serviços com um toque', texto: 'Crie cada serviço uma vez, com o seu preço. Depois, cada toque soma um.' },
    { arte: () => passos, titulo: 'O botão do pé é o próximo passo', texto: 'Enviar, Aprovou, Receber e Enviar recibo. Para receber, Pix em QR code.' },
    { arte: () => dois, titulo: 'Orçamento antes, relatório depois', texto: 'O orçamento o cliente aprova. O relatório cobra o que você já fez.' },
  ];
  KitFacil.abertura.abrir({ telas, rever, rotulo: 'Apresentação do Elétrica Fácil',
    fim: () => rever ? 'Concluir' : 'Começar',
    extra: { rotulo: 'Abrir um orçamento de exemplo', mostrar: () => !rever },
    aoMontar: (el, { redesenharArte }) => {
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-ab-soma]'); if (!b) return;
        const i = +b.dataset.abSoma; n[i] = n[i] >= 9 ? 0 : n[i] + 1; redesenharArte(); $(`[data-ab-soma="${i}"]`, el)?.focus({ preventScroll: true }); vibrar();
      });
    },
    // na primeira vez, depois da apresentação vem o cadastro (Código, Arts. 64-D, § 1º, e 75); ao rever, não
    aoFechar: ({ como }) => { redesenhar(); const ex = como === 'extra' ? () => criarExemplo() : null; return rever ? ex : () => aberturaCadastro(ex); } });
}
/* ---------- cadastro na abertura: os seus dados na proposta e a sua hora, com Pular ----------
   É uma segunda abertura do Kit, logo depois da apresentação (o Kit faz uma abertura de até quatro telas; o cadastro
   vem como uma sequência à parte, com os seus pontinhos). "Pular" passa a tela; na última, "Pular por agora" fecha.
   Quem pula recebe os pedidos de novo no primeiro orçamento, antes de somar o primeiro serviço (janelaSomar). */
function aberturaCadastro(depois) {
  const el0 = { ...ajustes }, h = { modo: 'digitar', v: ajustes.hora, T: ajustes.hTirar, C: ajustes.hCustos, H: ajustes.hHoras };
  let passar = false;
  const daConta = () => h.H > 0 ? Math.round((h.T + h.C) / h.H) : 0, hora = () => h.modo === 'conta' ? daConta() : h.v;
  const formHora = () => `${segmento('Como informar a hora', 'ab-hm', [['digitar', 'Digitar o valor'], ['conta', 'Descobrir minha hora']], h.modo)}
    ${h.modo === 'digitar' ? campo('ab-hv', 'Valor da sua hora', campoDinheiro('ab-hv', h.v))
    : `${campo('ab-ht', 'Quanto quer tirar por mês', campoDinheiro('ab-ht', h.T))}${campo('ab-hc', 'Custos do mês', campoDinheiro('ab-hc', h.C), 'Carro, ferramenta, celular, imposto.')}
      ${campo('ab-hh', 'Horas que você cobra por mês', `<input id="ab-hh" class="kf-entrada" type="text" inputmode="numeric" maxlength="3" value="${h.H || ''}" placeholder="Ex.: 60">`, 'Só as horas cobradas, sem trânsito nem orçamento.')}
      <dl class="resumo"><div class="forte"><dt>A sua hora dá</dt><dd class="num" id="ab-hr">${BRL(daConta())}</dd></div></dl>`}`;
  const lerHora = el => { if (h.modo === 'digitar') { if ($('#ab-hv', el)) h.v = lerDinheiro($('#ab-hv', el)); } else if ($('#ab-hh', el)) { h.T = lerDinheiro($('#ab-ht', el)); h.C = lerDinheiro($('#ab-hc', el)); h.H = Math.max(0, Math.min(744, parseInt($('#ab-hh', el).value, 10) || 0)); } };
  const guardarDados = () => { CAMPOS_ELE.forEach(([k]) => { if (el0[k] !== ajustes[k]) ajustes[k] = el0[k]; }); salvarAjustes(); };
  const telas = [
    { arte: `<span class="ab-cad-ic">${IC.docs}</span>`, titulo: 'Seus dados na proposta', texto: 'O cliente vê o seu nome e o seu WhatsApp no orçamento.',
      get extra() { return `<div class="ab-cad pilha" id="ab-dados">${camposEletricista(el0, 'ab')}<p class="kf-ajuda">O logotipo e a chave Pix ficam em Ajustes.</p></div>`; } },
    { arte: `<span class="ab-cad-ic">${IC.relogio}</span>`, titulo: 'Quanto vale a sua hora?', texto: 'Ela é a base dos preços que você der pelo tempo.',
      get extra() { return `<div class="ab-cad pilha" id="ab-hora">${formHora()}</div>`; } },
  ];
  KitFacil.abertura.abrir({ telas, rotulo: 'Seus dados e a sua hora', fim: 'Começar', extra: { rotulo: 'Pular por agora' },
    aoMontar: el => {
      el.classList.add('ab-cadastro');
      // trocou de tela na abertura: o aviso da tela anterior some
      let titulo = '';
      new MutationObserver(() => { const tt = $$('.kf-ab-t', el).map(x => x.textContent).join('|'); if (tt !== titulo) { if (titulo) esconderAviso(); titulo = tt; } }).observe(el, { childList: true, subtree: true });
      el.addEventListener('input', e => {
        if (e.target.matches('[data-el]')) lerEletricista(el, el0);
        else { lerHora(el); const r = $('#ab-hr', el); if (r) r.textContent = BRL(daConta()); }
      });
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-ab-hm]'); if (!b) return;
        lerHora(el); h.modo = b.dataset.abHm; $('#ab-hora', el).innerHTML = formHora(); prepararCampos(el); $(`[data-ab-hm="${h.modo}"]`, el)?.focus({ preventScroll: true });
      });
      // "Pular" na tela dos dados passa para a da hora (no Kit, ele fecharia tudo); "Continuar" e "Começar" conferem o que falta
      el.addEventListener('click', e => {
        const pular = e.target.closest('#kf-ab-pular'), prox = e.target.closest('#kf-ab-prox');
        if (pular && $('#ab-dados', el)) { e.stopImmediatePropagation(); e.preventDefault(); passar = true; $('#kf-ab-prox', el).click(); return; }
        if (!prox) return;
        if (passar) { passar = false; return; }
        if ($('#ab-dados', el)) { const falta = lerEletricista(el, el0); if (falta.length) { e.stopImmediatePropagation(); falta.forEach(x => KitFacil.apontar($(x[1], el))); aviso(`Falta ${falta.map(x => x[2]).join(' e ')}. Ou toque em Pular.`); } else guardarDados(); return; }
        if ($('#ab-hora', el)) { lerHora(el); if (!hora()) { e.stopImmediatePropagation(); KitFacil.apontar($(h.modo === 'digitar' ? '#ab-hv' : '#ab-hh', el)); aviso(h.modo === 'digitar' ? 'Escreva o valor da sua hora. Ou toque em Pular por agora.' : 'Preencha os três números da conta. Ou toque em Pular por agora.'); } }
      }, true);
      // Enter num campo: o Kit passaria a tela sem conferir; aqui ele aperta o botão de continuar
      window.addEventListener('keydown', function enter(e) { if (!document.body.contains(el)) return window.removeEventListener('keydown', enter, true); if (e.key === 'Enter' && e.target.matches && e.target.matches('.ab-cad input')) { e.preventDefault(); e.stopImmediatePropagation(); $('#kf-ab-prox', el).click(); } }, true);
    },
    aoFechar: ({ como, el }) => {
      if ($('#ab-dados', el)) lerEletricista(el, el0);
      // o que foi digitado nos dados fica, mesmo sem nome e WhatsApp completos (o pedido volta no primeiro orçamento)
      guardarDados();
      if (como === 'fim') { lerHora(el); const v = hora(); if (v) { ajustes.hora = v; if (h.modo === 'conta') { ajustes.hTirar = h.T; ajustes.hCustos = h.C; ajustes.hHoras = h.H; } salvarAjustes(); aviso(`Pronto. A sua hora é ${BRL(v)}.`); } }
      redesenhar(); return depois;
    } });
}

/* ---------- guia: o app faz cada passo na tela, numa demonstração que não grava nada (Código, Arts. 77 a 80) ----------
   O motor (janela fixa, contagem, dedo e as mãos) é o do Kit; aqui ficam a troca dos dados reais pelos da demonstração
   e, em guia.js, o roteiro. */
const guiaAtivo = () => KitFacil.guia.emDemonstracao();
let dadosReais = null;
const guiaFoto = () => JSON.stringify({ docs, cats, precos, ajustes, hash: location.hash, filtroDocs, buscaDocs });
function guiaPor(o) { docs = o.docs; cats = o.cats; precos = o.precos; ajustes = o.ajustes; filtroDocs = o.filtroDocs || 'todos'; buscaDocs = o.buscaDocs || ''; }
function guiaLimparTela() { fecharJanela(true); $$('.kf-toast').forEach(e => { e.hidden = true; }); }
function guiaIniciar() {
  if (guiaAtivo() || aberturaAtiva()) return;
  KitFacil.guia.demonstrar({
    passos: GUIA,
    comecar: () => {
      fecharJanela(true);
      // os dados de verdade ficam guardados na memória; a demonstração começa do zero e nada dela é gravado
      dadosReais = { docs, cats, precos, ajustes, filtroDocs, buscaDocs };
      semSalvar = true;
      const s = semente();
      guiaPor({ docs: [], cats: s.cats, precos: s.precos, ajustes: acertaAjustes({ nome: 'Carlos Pereira', fone: '11987654321', cidade: 'São Paulo', pix: 'carlos@exemplo.com.br', raio: ajustes.raio, hora: HORA_EXEMPLO, deslIda: 2000, tab: 7 }) });
      ir('/', true);
    },
    foto: guiaFoto,
    limpar: guiaLimparTela,
    restaurar: f => { const o = JSON.parse(f); guiaPor(o); history.replaceState({ d: 0 }, '', o.hash || '#/'); fecharJanela(true); desenhar(); },
    terminar: ({ concluiu }) => {
      const r = dadosReais; dadosReais = null;
      guiaPor(r); semSalvar = false;
      history.replaceState({ d: 0 }, '', '#/'); fecharJanela(true); desenhar();
      if (concluiu) aviso('Guia concluído. Para rever, toque em Mais e em Ver o guia.');
    },
  });
}

/* ---------- arranque ---------- */
try { history.scrollRestoration = 'manual'; } catch {}
// link de "Conectar outro aparelho": a chave vem depois do #, que não sai do aparelho
const tokenDoLink = SY.tokenDoLink();
if (tokenDoLink) history.replaceState({ d: 0 }, '', '#/ajustes');
if (!location.hash) history.replaceState({ d: 0 }, '', '#/');
else if (!history.state) history.replaceState({ d: 0 }, '', location.hash);
desenhar();
SY.iniciar({ token: tokenDoLink, silencioso: false, textoConfirmar: 'Os documentos deste aparelho se juntam aos da nuvem. Os preços e os ajustes passam a ser os da nuvem.' });
// a apresentação aparece uma vez (Código, Art. 75); quem chega por um link de sincronização vai direto para os Ajustes
if (!KitFacil.abertura.vista() && !tokenDoLink && !(navigator.webdriver && !window.EF_TESTE_ABERTURA)) aberturaAbrir();
// o raio cai sozinho, de tempos em tempos, com ou sem toque na tela (em navegador de teste, só quando o teste pede)
if (!navigator.webdriver || window.EF_TESTE_RAIO) Raio.comecar();
// atalho "Novo orçamento" do ícone do app (manifesto)
if (/[?&]novo=1/.test(location.search)) { try { history.replaceState(history.state, '', location.pathname + location.hash); } catch {} if (!aberturaAtiva()) setTimeout(() => novoDocumento('orc'), 300); }
try { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw', e)); } catch (e) { console.warn('sw', e); }
