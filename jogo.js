/* Elétrica Fácil · conquistas: o varal de lâmpadas e os níveis. Cada passo bem dado no app acende uma lâmpada.
   Nenhuma conquista premia cobrar mais: todas premiam organização e trabalho entregue. Dá para desligar nos Ajustes. */
'use strict';

/* ---------- estado ---------- */
// flags: marcas que não saem dos dados (guia visto, cópia baixada); vistas: quando cada lâmpada acendeu
let jogo = { flags: {}, vistas: {}, off: false, pronto: false, ...LS.get('jogo', {}) };
const jogoSalvar = () => { if (!semSalvar) LS.set('jogo', jogo); };
const jogoLigado = () => !jogo.off;
function jogoMarcar(flag) { if (jogo.flags[flag]) return; jogo.flags[flag] = Date.now(); jogoSalvar(); jogoConferir(); }

/* ---------- níveis: a carreira na obra ---------- */
const NIVEIS = [{ nome: 'Aprendiz', xp: 0 }, { nome: 'Ajudante', xp: 100 }, { nome: 'Meio-oficial', xp: 250 }, { nome: 'Oficial', xp: 450 }, { nome: 'Encarregado', xp: 700 }, { nome: 'Mestre', xp: 1000 }];
const XP = { conquista: 50, concluido: 10, concluidoMax: 300, aprovado: 5, aprovadoMax: 100 };
function nivelDe(xp) {
  let i = 0; while (i + 1 < NIVEIS.length && xp >= NIVEIS[i + 1].xp) i++;
  const prox = NIVEIS[i + 1];
  return { i, nivel: i + 1, nome: NIVEIS[i].nome, prox: prox ? { nome: prox.nome, falta: prox.xp - xp, pct: Math.round((xp - NIVEIS[i].xp) / (prox.xp - NIVEIS[i].xp) * 100) } : null };
}

/* ---------- as lâmpadas do varal: o filamento de cada uma tem a forma do ícone da conquista ---------- */
const LP_IC = {
  // desenhados para serem filamento: poucas linhas, grossas e contínuas, ocupando a grade de 24 inteira
  lampada: '<path d="M9 17.500h6M10 20.500h4"/><path d="M12 3.500a6 6 0 0 0-3.500 10.900c.600.500 1 1.200 1 2v1.100h5v-1.100c0-.800.400-1.500 1-2A6 6 0 0 0 12 3.500z"/>',
  pessoa: '<circle cx="12" cy="8" r="4.300"/><path d="M3.800 20.800a8.200 8.200 0 0 1 16.400 0"/>',
  prancheta: '<rect x="4.500" y="5" width="15" height="16" rx="2.500"/><path d="M8.800 5V3h6.400v2"/><path d="M8.500 11h7M8.500 15.500h4.500"/>',
  enviar: '<path d="M21 3 3 10.200l7.200 3.600 3.600 7.200z"/><path d="M10.200 13.800 21 3"/>',
  visto: '<path d="m3.500 12.800 5.700 5.700L20.500 6"/>',
  raio: '<path d="M13.800 2.500 4.200 13.800h6.900l-1.300 7.700 10-11.800h-6.900z"/>',
  moeda: '<circle cx="12" cy="12" r="9"/><path d="M15.200 9.300c-.500-1.300-1.700-2-3.200-2-1.800 0-3.200 1-3.200 2.400s1.300 2 3.200 2.300 3.200 1 3.200 2.400-1.400 2.400-3.200 2.400c-1.500 0-2.700-.700-3.200-2"/><path d="M12 5.300v2M12 16.800v1.900"/>',
  qr: '<rect x="3.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="13.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="3.500" y="13.500" width="7" height="7" rx="1.500"/><path d="M13.500 13.500h3.200v3.200h-3.200z"/><path d="M20.500 17.200v3.300h-3.300"/>',
  etiqueta: '<path d="M3.500 12.500V4h8.500l8.500 8.500-8 8z"/><circle cx="8.200" cy="8.700" r="1.500"/>',
  casa: '<path d="M2.800 11.500 12 3.500l9.200 8"/><path d="M5.200 9.800V20.500h13.600V9.800"/><path d="M9.800 20.500v-6h4.400v6"/>',
  pino: '<path d="M12 21.500s-7-6.300-7-11.800a7 7 0 0 1 14 0c0 5.500-7 11.800-7 11.800z"/><circle cx="12" cy="9.700" r="2.600"/>',
  laudo: '<path d="M6 3h8l4.500 4.500V21H6z"/><path d="m9.200 14.200 2.300 2.300 3.800-4.500"/>',
  caixa: '<path d="m3 7.500 9-4.300 9 4.300-9 4.300z"/><path d="M3 7.500v9.200l9 4.300 9-4.300V7.500"/><path d="M12 11.800V21"/>',
  maleta: '<rect x="3" y="8" width="18" height="12" rx="2.500"/><path d="M8.800 8V5.200h6.400V8"/><path d="M3 13.200h18"/>',
  caixaVisto: '<rect x="3.500" y="3.500" width="17" height="17" rx="3.500"/><path d="m7.800 12.300 3 3 5.400-6.300"/>',
  nuvem: '<path d="M7 19a4.700 4.700 0 0 1-.700-9.350A6.300 6.300 0 0 1 18.400 8.800 5.100 5.100 0 0 1 17.500 19z"/>',
  coracao: '<path d="M12 20.800s-8.500-5-8.500-11.100A4.700 4.700 0 0 1 12 7a4.700 4.700 0 0 1 8.500 2.700c0 6.100-8.500 11.100-8.500 11.100z"/>',
  estrela: '<path d="m12 2.800 2.800 5.800 6.400.900-4.600 4.500 1.100 6.300L12 17.300l-5.700 3 1.100-6.300L2.800 9.500l6.400-.900z"/>',
  livro: '<path d="M3 5.500c3.200-1.100 6-.800 9 .800 3-1.600 5.800-1.900 9-.800v13.300c-3.200-1.100-6-.800-9 .800-3-1.600-5.800-1.900-9-.800z"/><path d="M12 6.300v13.300"/>',
};
// ok(s): já acendeu? prog(s): [feito, meta] para mostrar o caminho
const CONQUISTAS = [
  { id: 'luz', nome: 'Primeira luz', etq: 'Seu nome', ic: 'pessoa', como: 'Diga como você assina os seus orçamentos, na apresentação ou em Ajustes.', ok: s => s.eu },
  { id: 'primeiro', nome: 'Primeiro orçamento', etq: 'Orçamento', ic: 'prancheta', como: 'Monte o primeiro orçamento com pelo menos um item.', ok: s => s.comItens >= 1 },
  { id: 'enviado', nome: 'Na mão do cliente', etq: 'Enviado', ic: 'enviar', como: 'Envie uma proposta ao cliente, em PDF ou pelo WhatsApp.', ok: s => s.enviados >= 1 },
  { id: 'aprovado', nome: 'Fechado', etq: 'Aprovado', ic: 'visto', como: 'Marque o primeiro orçamento aprovado pelo cliente.', ok: s => s.aprovados >= 1 },
  { id: 'concluido', nome: 'Serviço entregue', etq: 'Concluído', ic: 'raio', como: 'Conclua o primeiro serviço.', ok: s => s.concluidos >= 1 },
  { id: 'quitado', nome: 'Conta acertada', etq: 'Recebido', ic: 'moeda', como: 'Registre o recebimento total de um serviço concluído.', ok: s => s.quitados >= 1 },
  { id: 'pix', nome: 'Pix na proposta', etq: 'Chave Pix', ic: 'qr', como: 'Cadastre a sua chave Pix em Ajustes. Ela sai na proposta com QR code.', ok: s => s.pix },
  { id: 'precos', nome: 'Tabela com a sua cara', etq: 'Preços', ic: 'etiqueta', como: 'Ajuste 10 preços da tabela aos seus valores.', ok: s => s.precos >= 10, prog: s => [Math.min(10, s.precos), 10] },
  { id: 'ambientes', nome: 'Casa dividida', etq: 'Ambientes', ic: 'casa', como: 'Separe um orçamento por ambientes, com dois ou mais.', ok: s => s.ambientes >= 1 },
  { id: 'estrada', nome: 'Na estrada', etq: 'Estrada', ic: 'pino', como: 'Calcule o deslocamento de um orçamento pela distância e o combustível.', ok: s => s.viagens >= 1 },
  { id: 'relatorio', nome: 'Serviço documentado', etq: 'Relatório', ic: 'laudo', como: 'Preencha o relatório de um serviço concluído, com o que foi feito e os testes.', ok: s => s.relatorios >= 1 },
  { id: 'estoque', nome: 'Estoque em dia', etq: 'Materiais', ic: 'caixa', como: 'Registre a quantidade de 5 materiais que você tem guardados.', ok: s => s.estoque >= 5, prog: s => [Math.min(5, s.estoque), 5] },
  { id: 'maleta', nome: 'Maleta conferida', etq: 'Maleta', ic: 'maleta', como: 'Marque 10 ferramentas em Minhas ferramentas.', ok: s => s.ferramentas >= 10, prog: s => [Math.min(10, s.ferramentas), 10] },
  { id: 'checklist', nome: 'Nada esquecido', etq: 'Checklist', ic: 'caixaVisto', como: 'Monte o seu checklist de ida e volta da obra, com 5 itens.', ok: s => s.checklist >= 5, prog: s => [Math.min(5, s.checklist), 5] },
  { id: 'nuvem', nome: 'À prova de queda', etq: 'Cópia', ic: 'nuvem', como: 'Ligue a sincronização ou baixe uma cópia de segurança dos seus dados.', ok: s => s.sync || !!s.flags.copia },
  { id: 'volta', nome: 'Cliente que volta', etq: 'De novo', ic: 'coracao', como: 'Tenha dois orçamentos aprovados para o mesmo cliente.', ok: s => s.voltou },
  { id: 'dez', nome: 'Agenda cheia', etq: '10 feitos', ic: 'estrela', como: 'Conclua 10 serviços.', ok: s => s.concluidos >= 10, prog: s => [Math.min(10, s.concluidos), 10] },
  { id: 'guia', nome: 'Leu o manual', etq: 'Guia', ic: 'livro', como: 'Veja o guia do app até o fim.', ok: s => !!s.flags.guia },
];

/* ---------- o que os dados dizem ---------- */
function jogoEstado() {
  const reais = quotes.filter(q => !q.example);
  const fechados = reais.filter(q => q.status === 'aprovado' || q.status === 'concluido');
  const feitos = reais.filter(q => q.status === 'concluido');
  const porCliente = {}; fechados.forEach(q => { const k = norm(q.client.name); if (k) porCliente[k] = (porCliente[k] || 0) + 1; });
  const s = {
    eu: !!(settings.name || settings.company), pix: !!settings.pix,
    comItens: reais.filter(q => q.items.length).length,
    enviados: reais.filter(q => q.sentAt).length,
    aprovados: fechados.length, concluidos: feitos.length,
    quitados: feitos.filter(q => (q.pagos || []).length && falta(q) === 0).length,
    precos: (prices || []).filter(p => !p.ref && p.price > 0).length,
    ambientes: reais.filter(q => q.useRooms && (q.rooms || []).length >= 2 && q.items.length).length,
    viagens: reais.filter(q => q.trip && q.trip.km > 0).length,
    relatorios: feitos.filter(q => String(q.work || '').trim() && (q.tests || []).length).length,
    estoque: (prices || []).filter(p => p.kind === 'mat' && p.stock > 0).length,
    ferramentas: tools.filter(t => t.k === 'item').length, checklist: checks.length,
    sync: !!(typeof SY !== 'undefined' && SY.ligada()), voltou: Object.values(porCliente).some(n => n >= 2), flags: jogo.flags,
  };
  s.ganhas = CONQUISTAS.filter(c => { try { return !!c.ok(s); } catch { return false; } }).map(c => c.id);
  s.xp = s.ganhas.length * XP.conquista + Math.min(XP.concluidoMax, s.concluidos * XP.concluido) + Math.min(XP.aprovadoMax, s.aprovados * XP.aprovado);
  Object.assign(s, nivelDe(s.xp));
  s.proxima = CONQUISTAS.find(c => !s.ganhas.includes(c.id)) || null;
  return s;
}

/* ---------- a lâmpada desenhada (varal, apresentação): pende do fio, com o ícone no lugar do filamento ---------- */
function lampSVG(c, { acesa = false } = {}) {
  return `<svg class="lp ${acesa ? 'on' : 'off'}" viewBox="0 0 60 84" aria-hidden="true">
    ${acesa ? '<circle class="lp-halo" cx="30" cy="54" r="29"/>' : ''}
    <path class="lp-fio" d="M30 0v8"/><rect class="lp-soq" x="22" y="7" width="16" height="9" rx="2.500"/>
    <rect class="lp-rosca" x="23.500" y="16" width="13" height="10" rx="1.500"/><path class="lp-risco" d="M23.500 19.500l13 -1.500M23.500 23l13 -1.500"/>
    <path class="lp-vidro" d="M24 26c0 5-4.500 7-9 11.500a20.500 20.500 0 1 0 30 0C40.500 33 36 31 36 26z"/>
    <path class="lp-brilho" d="M17.500 46a13.500 13.500 0 0 1 6-7.500"/>
    <g class="lp-ic" transform="translate(19 41) scale(.917)">${LP_IC[c.ic] || LP_IC.lampada}</g></svg>`;
}
// a lâmpada pendurada no varal: a miniatura em 3D por cima e, por baixo, o desenho de traço (que vale sem WebGL)
const lampPendHTML = (c, { acesa = false } = {}) => `<span class="lp-pend"><canvas class="lp-mini" data-ic="${c.ic}" ${acesa ? 'data-acesa="1"' : ''} aria-hidden="true"></canvas>${lampSVG(c, { acesa })}</span>`;
// desenha as miniaturas que ainda faltam, poucas por quadro, para a tela não engasgar
function lpPintarMinis(raiz) {
  const fila = $$('.lp-mini:not([data-ok])', raiz); let k = 0;
  const passo = () => {
    for (let n = 0; n < 3 && k < fila.length; n++, k++) { const cv = fila[k]; if (!cv.isConnected) continue; cv.dataset.ok = '1';
      if (Lampada.miniatura(cv, { icone: cv.dataset.ic, acesa: !!cv.dataset.acesa })) cv.parentElement.classList.add('lp-3d'); else return; }
    if (k < fila.length) requestAnimationFrame(passo);
  };
  if (fila.length) requestAnimationFrame(passo);
}
// a lâmpada em 3D (ficha e lâmpada nova): gira com o dedo; o motor fica em lampada.js
const lamp3dHTML = (c, { acesa = false, D = 200 } = {}) => Lampada.html({ icone: c.ic, nome: c.nome, acesa, D });

/* ---------- lâmpada nova: gira, pisca e acende; ficha da lâmpada ---------- */
let lpFila = [];
function jogoConferir({ silencioso = false } = {}) {
  if (!jogoLigado()) return;
  const s = jogoEstado(), novas = s.ganhas.filter(id => !jogo.vistas[id]);
  if (!novas.length) { if (!jogo.pronto) { jogo.pronto = true; jogoSalvar(); } return; }
  const agora = Date.now(); novas.forEach(id => { jogo.vistas[id] = agora; });
  // quem já usava o app chega com as lâmpadas que os dados dele já acendem, sem uma janela para cada uma
  const calado = silencioso || !jogo.pronto;
  jogo.pronto = true; jogoSalvar();
  if (!calado) { lpFila.push(...novas.map(id => CONQUISTAS.find(c => c.id === id))); lpFilaMostrar(); }
}
function lpFilaMostrar() {
  if (!lpFila.length || KitFacil.dialogo.aberto() || (typeof guiaAtivo === 'function' && guiaAtivo()) || (typeof aberturaAtiva === 'function' && aberturaAtiva())) return;
  const L = lpFila; lpFila = []; lpNova(L);
}
function lpNova(lista, aoFechar) {
  const c = lista[0], resto = lista.slice(1), s = jogoEstado();
  try { KitFacil.jogo && KitFacil.jogo.vibrar && KitFacil.jogo.vibrar([18, 40, 18]); } catch {}
  openSheet({ title: 'Lâmpada acesa', onClose: () => { if (aoFechar) aoFechar(); else setTimeout(lpFilaMostrar, 500); },
    body: `<div class="lp-nova"><div class="lp-palco" id="lp-palco">${lamp3dHTML(c, { acesa: true })}</div>
      <b class="lp-nome">${esc(c.nome)}</b><p class="hint">${esc(c.como.replace(/\.$/, ''))}: feito. +${XP.conquista} pontos.</p>
      ${resto.length ? `<p class="lp-mais">E mais ${plural(resto.length, 'lâmpada', 'lâmpadas')}: ${esc(resto.map(x => x.nome).join(', '))}.</p>` : ''}
      <p class="hint">${s.ganhas.length} de ${CONQUISTAS.length} acesas · nível ${s.nivel}, ${esc(s.nome)}</p></div>`,
    foot: `<button type="button" class="btn ghost" id="lp-ver">Ver o varal</button><button type="button" class="btn primary" id="lp-ok">Boa</button>`,
    onMount: d => {
      // a lâmpada chega apagada, dá uma volta e acende piscando; com movimento reduzido, já aparece acesa
      const g = Lampada.girar(d, { auto: false, inicio: semMovimento() ? -0.4 : 0, apagada: !semMovimento() });
      if (g) { if (semMovimento()) g.acender(); else { g.peteleco(1); setTimeout(() => { g.acender(); try { KitFacil.jogo && KitFacil.jogo.confete && KitFacil.jogo.confete($('#lp-palco', d), 24, ['#FFC400', '#FFE27A', '#FFFFFF', '#E8A800', '#17150F']); } catch {} }, 650); } }
      $('#lp-ok', d).onclick = () => closeSheet(); $('#lp-ver', d).onclick = () => { closeSheet(true); go('/conquistas', true); };
    } });
}
function lpSheet(c) {
  const s = jogoEstado(), tem = s.ganhas.includes(c.id), p = c.prog && !tem ? c.prog(s) : null, quando = jogo.vistas[c.id];
  openSheet({ title: c.nome, sub: tem ? `Acesa${quando ? ' desde ' + fmtDate(quando) : ''}` : 'Ainda apagada',
    body: `<div class="lp-nova"><div class="lp-palco">${lamp3dHTML(c, { acesa: tem })}</div><p class="lp-dica" aria-hidden="true">Deslize o dedo para girar</p>
      <p class="lp-como">${esc(c.como)}</p>
      ${p ? `<div class="barra-xp" role="img" aria-label="${p[0]} de ${p[1]}"><i style="width:${Math.round(p[0] / p[1] * 100)}%"></i></div><p class="hint">${p[0]} de ${p[1]}</p>` : ''}</div>`,
    onMount: d => { Lampada.girar(d); } });
}

/* ---------- medidor do nível: um anel que enche até o próximo nível ---------- */
const medidorHTML = (s, g = false) => `<span class="medidor ${g ? 'medidor-g' : ''}" style="--pct:${s.prox ? s.prox.pct : 100}" aria-hidden="true"><span class="medidor-n">${s.nivel}</span><span class="medidor-l">nível</span></span>`;
const nivelTexto = s => s.prox ? `Faltam ${plural(s.prox.falta, 'ponto', 'pontos')} para ${s.prox.nome}` : 'Você chegou ao último nível';

/* ---------- tela Conquistas: o varal vai se iluminando ---------- */
VIEWS.conquistas = {
  html() {
    const s = jogoEstado();
    return `${barraTopo()}<main class="page conq">
      ${KitFacil.ui.cabecalho({ titulo: 'Conquistas', sub: 'Cada passo bem dado acende uma lâmpada do seu varal.' })}
      <section class="card nivel-card" aria-label="Seu nível">${medidorHTML(s, true)}
        <div class="nivel-tx"><b class="nivel-nome">${esc(s.nome)}</b>
          <div class="barra-xp" role="img" aria-label="${s.prox ? s.prox.pct + '% do caminho até ' + s.prox.nome : 'Último nível'}"><i style="width:${s.prox ? s.prox.pct : 100}%"></i></div>
          <span class="hint">${nivelTexto(s)} · ${plural(s.xp, 'ponto', 'pontos')}</span></div></section>
      <section class="varal" aria-labelledby="varal-t">
        <div class="varal-topo"><h2 id="varal-t">Seu varal</h2><span class="varal-n">${s.ganhas.length} de ${CONQUISTAS.length} acesas</span></div>
        <div class="varal-fio">${CONQUISTAS.map((c, k) => { const tem = s.ganhas.includes(c.id);
          return `<button type="button" class="lp-btn ${tem ? 'on' : 'off'}" data-lp="${c.id}" aria-label="${esc(c.nome)}: ${tem ? 'acesa' : 'apagada'}. Ver como acender" style="--i:${k % 7}">${lampPendHTML(c, { acesa: tem })}<span class="lp-etq">${esc(c.etq)}</span></button>`; }).join('')}</div>
      </section>
      <p class="hint conq-nota">As conquistas são uma brincadeira e não mudam nada nos seus orçamentos. Dá para desligar em Ajustes, em Conquistas e apresentação.</p>
    </main>`;
  },
  bind(v) { $$('[data-lp]', v).forEach(b => b.onclick = () => lpSheet(CONQUISTAS.find(c => c.id === b.dataset.lp))); lpPintarMinis(v); },
};
