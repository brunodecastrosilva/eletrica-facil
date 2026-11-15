/* Elétrica Fácil · conquistas: o quadro de disjuntores e os níveis. Cada passo bem dado no app liga um disjuntor.
   Nenhuma conquista premia cobrar mais: todas premiam organização e trabalho entregue. Dá para desligar nos Ajustes. */
'use strict';

/* ---------- estado ---------- */
// flags: marcas que não saem dos dados (guia visto, cópia baixada); vistas: quando cada disjuntor foi ligado
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

/* ---------- os disjuntores do quadro ---------- */
const DJ_IC = {
  lampada: '<path d="M9 17.500h6M10 20.500h4"/><path d="M12 3.500a6 6 0 0 0-3.500 10.900c.600.500 1 1.200 1 2v1.100h5v-1.100c0-.800.400-1.500 1-2A6 6 0 0 0 12 3.500z"/>',
  folha: '<path d="M7 3.500h7l4 4v13H7z"/><path d="M14 3.500v4h4M10 12.500h5M10 16.500h5"/>',
  enviar: '<path d="M20.500 3.500 3.500 10.500l6.500 3 3 6.500z"/><path d="m10 13.500 4.500-4"/>',
  aperto: '<path d="m4.500 12.500 4.500 4.500 10.500-11"/>',
  chave: '<path d="M14.700 6.300a1 1 0 0 0 0 1.400l1.600 1.600a1 1 0 0 0 1.400 0l3.800-3.800a6 6 0 0 1-7.900 7.900l-6.900 6.900a2.100 2.100 0 0 1-3-3l6.900-6.900a6 6 0 0 1 7.900-7.900z"/>',
  moeda: '<circle cx="12" cy="12" r="8.500"/><path d="M14.500 9.500c-.500-1-1.500-1.500-2.500-1.500-1.500 0-2.500.900-2.500 2s1 1.700 2.500 2 2.500.900 2.500 2-1 2-2.500 2c-1 0-2-.500-2.500-1.500M12 6.500V8M12 16v1.500"/>',
  pix: '<path d="m12 3.500 8.500 8.500-8.500 8.500-8.500-8.500z"/><path d="m8.500 12 3.500-3.500 3.500 3.500-3.500 3.500z"/>',
  etiqueta: '<path d="M3.500 12V4.500h7.500l9.500 9.500-7.500 7.500z"/><circle cx="7.500" cy="8.500" r="1.300"/>',
  casa: '<path d="M4 11 12 4.500 20 11v8.500H4z"/><path d="M12 11v8.500M4 14.500h16"/>',
  carro: '<path d="M5 16v-5l2-5h10l2 5v5"/><path d="M3.500 16h17v3h-17zM7.500 19v1.500M16.500 19v1.500"/>',
  prancheta: '<rect x="5" y="4.500" width="14" height="16" rx="2"/><path d="M9 4.500V3.500h6v1M8.500 10h7M8.500 13.500h7M8.500 17h4"/>',
  caixa: '<path d="m3.500 7.500 8.500-4 8.500 4-8.500 4z"/><path d="M3.500 7.500V16.500l8.500 4 8.500-4V7.500M12 11.500v9"/>',
  maleta: '<rect x="3.500" y="7.500" width="17" height="12" rx="2"/><path d="M9 7.500V5h6v2.500M3.500 12.500h17"/>',
  lista: '<path d="M10 6.500h10M10 12h10M10 17.500h10"/><path d="m3.500 6.500 1.500 1.500 2.500-2.500M3.500 12l1.500 1.500L7.500 11M3.500 17.500 5 19l2.500-2.500"/>',
  nuvem: '<path d="M7 18.500a4.300 4.300 0 0 1-.600-8.500 5.800 5.800 0 0 1 11.200-1.300A4.500 4.500 0 0 1 17.500 18.500z"/>',
  agenda: '<rect x="3.500" y="5" width="17" height="15.500" rx="2"/><path d="M3.500 10h17M8 3.500v3M16 3.500v3M8 14h3M8 17h6"/>',
  livro: '<path d="M4 5.500c2.500-1 5-1 8 .500 3-1.500 5.500-1.500 8-.500v13c-2.500-1-5-1-8 .500-3-1.500-5.500-1.500-8-.500z"/><path d="M12 6v13"/>',
  volta: '<path d="M4.500 12a7.500 7.500 0 0 1 13-5.200L19.500 9"/><path d="M19.500 4.500V9H15M19.500 12a7.500 7.500 0 0 1-13 5.200L4.500 15"/><path d="M4.500 19.500V15H9"/>',
};
const djIc = n => `<svg class="i dj-ic" viewBox="0 0 24 24" aria-hidden="true">${DJ_IC[n] || DJ_IC.lampada}</svg>`;
// ok(s): já ligou? prog(s): [feito, meta] para mostrar o caminho
const CONQUISTAS = [
  { id: 'luz', nome: 'Luz acesa', etq: 'Seu nome', ic: 'lampada', como: 'Diga como você assina os seus orçamentos, na apresentação ou em Ajustes.', ok: s => s.eu },
  { id: 'primeiro', nome: 'Primeiro orçamento', etq: 'Orçamento', ic: 'folha', como: 'Monte o primeiro orçamento com pelo menos um item.', ok: s => s.comItens >= 1 },
  { id: 'enviado', nome: 'Na mão do cliente', etq: 'Enviado', ic: 'enviar', como: 'Envie uma proposta ao cliente, em PDF ou pelo WhatsApp.', ok: s => s.enviados >= 1 },
  { id: 'aprovado', nome: 'Fechado', etq: 'Aprovado', ic: 'aperto', como: 'Marque o primeiro orçamento aprovado pelo cliente.', ok: s => s.aprovados >= 1 },
  { id: 'concluido', nome: 'Serviço entregue', etq: 'Concluído', ic: 'chave', como: 'Conclua o primeiro serviço.', ok: s => s.concluidos >= 1 },
  { id: 'quitado', nome: 'Conta acertada', etq: 'Recebido', ic: 'moeda', como: 'Registre o recebimento total de um serviço concluído.', ok: s => s.quitados >= 1 },
  { id: 'pix', nome: 'Pix na proposta', etq: 'Chave Pix', ic: 'pix', como: 'Cadastre a sua chave Pix em Ajustes. Ela sai na proposta com QR code.', ok: s => s.pix },
  { id: 'precos', nome: 'Tabela com a sua cara', etq: 'Preços', ic: 'etiqueta', como: 'Ajuste 10 preços da tabela aos seus valores.', ok: s => s.precos >= 10, prog: s => [Math.min(10, s.precos), 10] },
  { id: 'ambientes', nome: 'Casa dividida', etq: 'Ambientes', ic: 'casa', como: 'Separe um orçamento por ambientes, com dois ou mais.', ok: s => s.ambientes >= 1 },
  { id: 'estrada', nome: 'Na estrada', etq: 'Estrada', ic: 'carro', como: 'Calcule o deslocamento de um orçamento pela distância e o combustível.', ok: s => s.viagens >= 1 },
  { id: 'relatorio', nome: 'Serviço documentado', etq: 'Relatório', ic: 'prancheta', como: 'Preencha o relatório de um serviço concluído, com o que foi feito e os testes.', ok: s => s.relatorios >= 1 },
  { id: 'estoque', nome: 'Estoque em dia', etq: 'Materiais', ic: 'caixa', como: 'Registre a quantidade de 5 materiais que você tem guardados.', ok: s => s.estoque >= 5, prog: s => [Math.min(5, s.estoque), 5] },
  { id: 'maleta', nome: 'Maleta conferida', etq: 'Maleta', ic: 'maleta', como: 'Marque 10 ferramentas em Minhas ferramentas.', ok: s => s.ferramentas >= 10, prog: s => [Math.min(10, s.ferramentas), 10] },
  { id: 'checklist', nome: 'Nada esquecido', etq: 'Checklist', ic: 'lista', como: 'Monte o seu checklist de ida e volta da obra, com 5 itens.', ok: s => s.checklist >= 5, prog: s => [Math.min(5, s.checklist), 5] },
  { id: 'nuvem', nome: 'À prova de queda', etq: 'Cópia', ic: 'nuvem', como: 'Ligue a sincronização ou baixe uma cópia de segurança dos seus dados.', ok: s => s.sync || !!s.flags.copia },
  { id: 'volta', nome: 'Cliente que volta', etq: 'De novo', ic: 'volta', como: 'Tenha dois orçamentos aprovados para o mesmo cliente.', ok: s => s.voltou },
  { id: 'dez', nome: 'Agenda cheia', etq: '10 feitos', ic: 'agenda', como: 'Conclua 10 serviços.', ok: s => s.concluidos >= 10, prog: s => [Math.min(10, s.concluidos), 10] },
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

/* ---------- o disjuntor: corpo, alavanca (para cima = ligado), janela I/O e etiqueta ---------- */
function djHTML(c, { ligado = false, grande = false, anima = false } = {}) {
  return `<span class="dj ${ligado ? 'on' : 'off'} ${grande ? 'dj-g' : ''} ${anima ? 'dj-liga' : ''}" aria-hidden="true">
    <span class="dj-corpo"><span class="dj-jan">${ligado ? 'I' : 'O'}</span><span class="dj-fenda"><span class="dj-alav"></span></span>${djIc(c.ic)}</span>
    <span class="dj-etq">${esc(c.etq)}</span></span>`;
}

/* ---------- disjuntor novo: a alavanca sobe; ficha do disjuntor ---------- */
let djFila = [];
function jogoConferir({ silencioso = false } = {}) {
  if (!jogoLigado()) return;
  const s = jogoEstado(), novas = s.ganhas.filter(id => !jogo.vistas[id]);
  if (!novas.length) { if (!jogo.pronto) { jogo.pronto = true; jogoSalvar(); } return; }
  const agora = Date.now(); novas.forEach(id => { jogo.vistas[id] = agora; });
  // quem já usava o app chega com os disjuntores que os dados dele já ligam, sem uma janela para cada um
  const calado = silencioso || !jogo.pronto;
  jogo.pronto = true; jogoSalvar();
  if (!calado) { djFila.push(...novas.map(id => CONQUISTAS.find(c => c.id === id))); djFilaMostrar(); }
}
function djFilaMostrar() {
  if (!djFila.length || KitFacil.dialogo.aberto() || (typeof guiaAtivo === 'function' && guiaAtivo()) || (typeof aberturaAtiva === 'function' && aberturaAtiva())) return;
  const L = djFila; djFila = []; djNovo(L);
}
function djNovo(lista, aoFechar) {
  const c = lista[0], resto = lista.slice(1), s = jogoEstado();
  try { KitFacil.jogo && KitFacil.jogo.vibrar && KitFacil.jogo.vibrar([18, 40, 18]); } catch {}
  openSheet({ title: 'Disjuntor ligado', onClose: () => { if (aoFechar) aoFechar(); else setTimeout(djFilaMostrar, 500); },
    body: `<div class="dj-novo"><div class="dj-palco" id="dj-palco">${djHTML(c, { ligado: true, grande: true, anima: !semMovimento() })}</div>
      <b class="dj-nome">${esc(c.nome)}</b><p class="hint">${esc(c.como.replace(/\.$/, ''))}: feito. +${XP.conquista} pontos.</p>
      ${resto.length ? `<p class="dj-mais">E mais ${plural(resto.length, 'disjuntor', 'disjuntores')}: ${esc(resto.map(x => x.nome).join(', '))}.</p>` : ''}
      <p class="hint">${s.ganhas.length} de ${CONQUISTAS.length} ligados · nível ${s.nivel}, ${esc(s.nome)}</p></div>`,
    foot: `<button type="button" class="btn ghost" id="dj-ver">Ver o quadro</button><button type="button" class="btn primary" id="dj-ok">Boa</button>`,
    onMount: d => {
      try { KitFacil.jogo && KitFacil.jogo.confete && KitFacil.jogo.confete($('#dj-palco', d), 26, ['#FFC400', '#17150F', '#FFE27A', '#FFFFFF', '#E8A800']); } catch {}
      $('#dj-ok', d).onclick = () => closeSheet(); $('#dj-ver', d).onclick = () => { closeSheet(true); go('/conquistas', true); };
    } });
}
function djSheet(c) {
  const s = jogoEstado(), tem = s.ganhas.includes(c.id), p = c.prog && !tem ? c.prog(s) : null, quando = jogo.vistas[c.id];
  openSheet({ title: c.nome, sub: tem ? `Ligado${quando ? ' desde ' + fmtDate(quando) : ''}` : 'Ainda desligado',
    body: `<div class="dj-novo"><div class="dj-palco">${djHTML(c, { ligado: tem, grande: true })}</div>
      <p class="dj-como">${esc(c.como)}</p>
      ${p ? `<div class="barra-xp" role="img" aria-label="${p[0]} de ${p[1]}"><i style="width:${Math.round(p[0] / p[1] * 100)}%"></i></div><p class="hint">${p[0]} de ${p[1]}</p>` : ''}</div>` });
}

/* ---------- medidor do nível: um anel que enche até o próximo nível ---------- */
const medidorHTML = (s, g = false) => `<span class="medidor ${g ? 'medidor-g' : ''}" style="--pct:${s.prox ? s.prox.pct : 100}" aria-hidden="true"><span class="medidor-n">${s.nivel}</span><span class="medidor-l">nível</span></span>`;
const nivelTexto = s => s.prox ? `Faltam ${plural(s.prox.falta, 'ponto', 'pontos')} para ${s.prox.nome}` : 'Você chegou ao último nível';

/* ---------- tela Conquistas ---------- */
VIEWS.conquistas = {
  html() {
    const s = jogoEstado();
    return `${barraTopo()}<main class="page conq">
      ${KitFacil.ui.cabecalho({ titulo: 'Conquistas', sub: 'Cada passo bem dado liga um disjuntor do seu quadro.' })}
      <section class="card nivel-card" aria-label="Seu nível">${medidorHTML(s, true)}
        <div class="nivel-tx"><b class="nivel-nome">${esc(s.nome)}</b>
          <div class="barra-xp" role="img" aria-label="${s.prox ? s.prox.pct + '% do caminho até ' + s.prox.nome : 'Último nível'}"><i style="width:${s.prox ? s.prox.pct : 100}%"></i></div>
          <span class="hint">${nivelTexto(s)} · ${plural(s.xp, 'ponto', 'pontos')}</span></div></section>
      <section class="quadro" aria-labelledby="quadro-t">
        <div class="quadro-topo"><h2 id="quadro-t">Seu quadro</h2><span class="quadro-n">${s.ganhas.length} de ${CONQUISTAS.length} ligados</span></div>
        <div class="quadro-trilho">${CONQUISTAS.map(c => { const tem = s.ganhas.includes(c.id);
          return `<button type="button" class="dj-btn" data-dj="${c.id}" aria-label="${esc(c.nome)}: ${tem ? 'ligado' : 'desligado'}. Ver como ligar">${djHTML(c, { ligado: tem })}</button>`; }).join('')}</div>
      </section>
      <p class="hint conq-nota">As conquistas são uma brincadeira e não mudam nada nos seus orçamentos. Dá para desligar em Ajustes, em Conquistas e apresentação.</p>
    </main>`;
  },
  bind(v) { $$('[data-dj]', v).forEach(b => b.onclick = () => djSheet(CONQUISTAS.find(c => c.id === b.dataset.dj))); },
};
