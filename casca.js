/* Elétrica Fácil 5 · moldura (navegação e troca de tela), Ajustes, apresentação, guia e arranque do app. */
'use strict';

/* ---------- desenhar a tela ---------- */
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
    cobranca: `${s.hora ? BRL(s.hora) + ' a hora' : 'Hora ainda não informada'} · ${s.deslModo === 'km' ? BRL(s.deslKm) + ' por km' : BRL(s.deslIda) + ' por ida'} · ${s.minIda ? 'mínimo de ' + BRL(s.minIda) : 'sem mínimo por ida'}`,
    pix: s.pix || 'Nenhuma chave cadastrada',
    padrao: `Validade de ${plural(s.validade, 'dia', 'dias')} · garantia de ${garCurta(s)} · ${s.pag === 'entrada' ? `entrada de ${s.entradaPct}%` : s.pag === 'combinar' ? 'pagamento a combinar' : 'à vista'}`,
    raio: Raio.ligado() ? 'Raio ligado' : 'Raio desligado',
  };
}
function pintarResumos() { const S = resumosAjustes(); for (const k in S) KitFacil.ajustes.resumo(k, S[k]); }
const ICONES_AJ = {
  cobranca: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7v5.300l3.300 2"/>',
  pix: '<rect x="3.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="13.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="3.500" y="13.500" width="7" height="7" rx="1.500"/><path d="M13.500 13.500h3.200v3.200h-3.200z"/><path d="M20.500 17.200v3.300h-3.300"/>',
  padrao: '<path d="M8 3.500h7.500L19 7v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.500a2 2 0 0 1 2-2z"/><path d="M15 3.500V7.500h4"/><path d="M12.500 10.500v6M9.500 13.500h6"/>',
  raio: '<path d="M13.500 2.500 4.500 13.500h6l-1 8 9-11.500h-6z"/>',
};
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
              <dl class="resumo"><div class="forte"><dt>${s.hora ? 'A sua hora' : 'Hora de exemplo'}</dt><dd class="num">${BRL(HORA())}</dd></div></dl>
              <button type="button" class="kf-btn kf-sec" id="aj-hora">${s.hora ? 'Mudar a minha hora' : 'Informar a minha hora'}</button>`)
            + bloco('Deslocamento', `<p class="kf-ajuda">Sai numa linha própria do documento, por ida.</p>
              <div class="kf-campo"><span class="kf-rotulo">Como você cobra</span>${segmento('Como você cobra o deslocamento', 'aj-dm', [['fixo', 'Fixo por ida'], ['km', 'Por quilômetro']], s.deslModo)}</div>
              ${s.deslModo === 'km' ? campo('aj-deslKm', 'Valor por km', campoDinheiro('aj-deslKm', s.deslKm, 'data-ajd="deslKm"'), 'Você informa a distância, ida e volta, em cada documento.') : campo('aj-deslIda', 'Valor por ida', campoDinheiro('aj-deslIda', s.deslIda, 'data-ajd="deslIda"'))}`)
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
    { arte: () => blocos(), falada: true, titulo: 'Some os serviços com um toque', texto: 'Os seus preços ficam em blocos. Toque num bloco e veja a conta andar.' },
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
    aoFechar: ({ como }) => { redesenhar(); return como === 'extra' ? () => criarExemplo() : null; } });
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
      guiaPor({ docs: [], cats: s.cats, precos: s.precos, ajustes: acertaAjustes({ nome: 'Carlos Pereira', fone: '11987654321', cidade: 'São Paulo', pix: 'carlos@exemplo.com.br', raio: ajustes.raio, hora: HORA_EXEMPLO, tab: 5 }) });
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
