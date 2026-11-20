/* Elétrica Fácil 4 · motor: utilidades, catálogo de fábrica, dados, contas, sincronização, janelas e rotas.
   O app faz uma coisa: orçar serviços de elétrica e fechar a cobrança (enviar, aprovar, receber, recibo).
   Dois documentos: o orçamento, antes do serviço, e o relatório, para cobrar o que já foi feito. */
'use strict';
const VERSAO = '4.0.0';
const MARCA = '<span class="kf-marca-ic marca-img" aria-hidden="true"><img src="icons/icon-192.png" alt="" width="36" height="36" decoding="async"></span><span class="kf-marca-nome">Elétrica Fácil</span>';

/* ================= utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-6);
const BRL = c => (Math.round(c || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dobra = s => String(s || '').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '');
const soma = a => a.reduce((x, y) => x + y, 0);
const clone = v => JSON.parse(JSON.stringify(v));
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const DIA = 864e5;
const dataBR = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dataCurta = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const dataLonga = ts => new Date(ts).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const dataISO = ts => { const d = new Date(ts || Date.now()); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const deISO = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? new Date(v + 'T12:00').getTime() : null;
const soDigitos = s => String(s || '').replace(/\D/g, '');
function fone(s) {
  const d = soDigitos(s);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(s || '').trim();
}
function cpfCnpj(s) {
  const d = soDigitos(s);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return String(s || '').trim();
}
const primeiroNome = s => String(s || '').trim().split(/\s+/)[0] || '';
const semMovimento = () => KitFacil.movimento.reduzido();
const vibrar = () => { try { navigator.vibrate && navigator.vibrate(8); } catch {} };

/* ================= catálogo de fábrica (Regras do app, Art. 9º: predial de baixa tensão; preços ilustrativos) ================= */
const UNIDADES = [['un', 'Unidade'], ['ponto', 'Ponto'], ['m', 'Metro'], ['m²', 'Metro quadrado'], ['h', 'Hora'], ['dia', 'Diária'], ['vb', 'Verba'], ['rolo', 'Rolo'], ['kit', 'Kit']];
const unTxt = (q, u) => ({ un: 'un.', ponto: q === 1 ? 'ponto' : 'pontos', m: 'm', 'm²': 'm²', h: 'h', dia: q === 1 ? 'diária' : 'diárias', vb: q === 1 ? 'verba' : 'verbas', rolo: q === 1 ? 'rolo' : 'rolos', kit: q === 1 ? 'kit' : 'kits' }[u] || 'un.');
const unNome = u => (UNIDADES.find(x => x[0] === u) || UNIDADES[0])[1].toLowerCase();
const SEMENTE = [
  ['tomadas', 'Tomadas e interruptores', 'tomada', [['Instalação de tomada ou interruptor', 'un', 6000], ['Troca de tomada ou interruptor', 'un', 4500], ['Ponto novo de tomada com fiação', 'ponto', 10000], ['Tomada de uso específico 20 A', 'un', 8000], ['Ponto de interruptor paralelo three-way', 'ponto', 12000], ['Instalação de tomada dupla ou tripla', 'un', 7500], ['Instalação de interruptor com dimmer', 'un', 8000], ['Troca de espelho ou placa', 'un', 2000]]],
  ['iluminacao', 'Iluminação', 'lampada', [['Instalação de luminária ou plafon', 'un', 9000], ['Instalação de lustre ou pendente', 'un', 13000], ['Instalação de spot embutido', 'un', 4500], ['Instalação de fita de LED', 'm', 3500], ['Instalação de sensor de presença', 'un', 11000], ['Instalação de refletor externo', 'un', 12000], ['Ponto de iluminação novo com fiação', 'ponto', 10000], ['Instalação de arandela', 'un', 9000]]],
  ['quadro', 'Quadro e proteção', 'quadro', [['Instalação ou troca de disjuntor', 'un', 7000], ['Instalação de DR', 'un', 15000], ['Instalação de DPS', 'un', 13000], ['Montagem de quadro de distribuição', 'un', 90000], ['Troca de quadro de distribuição', 'un', 95000], ['Organização e identificação de quadro', 'un', 30000], ['Aterramento com haste e conexões', 'un', 35000], ['Instalação de padrão de entrada', 'un', 150000]]],
  ['aparelhos', 'Chuveiro e aparelhos', 'chuveiro', [['Instalação de chuveiro elétrico', 'un', 11500], ['Troca de resistência do chuveiro', 'un', 8000], ['Instalação de torneira elétrica', 'un', 11000], ['Instalação de ventilador de teto', 'un', 18000], ['Ponto e circuito para ar-condicionado', 'un', 30000], ['Instalação de cooktop ou forno elétrico', 'un', 16000], ["Instalação de bomba d'água", 'un', 25000], ['Instalação de carregador de veículo elétrico', 'un', 150000]]],
  ['fiacao', 'Fiação e infraestrutura', 'fiacao', [['Passagem de fiação', 'm', 1000], ['Troca da fiação de um circuito', 'un', 25000], ['Eletroduto aparente', 'm', 2000], ['Instalação de eletroduto embutido', 'm', 3000], ['Instalação de canaleta', 'm', 2000], ['Rasgo e fechamento na parede', 'm', 3000], ['Abertura de caixa na alvenaria', 'un', 5000]]],
  ['portao', 'Portão e interfone', 'interfone', [['Instalação de campainha', 'un', 9000], ['Instalação de interfone ou porteiro eletrônico', 'un', 20000], ['Instalação de motor de portão', 'un', 35000], ['Instalação de fechadura elétrica', 'un', 18500]]],
  ['laudos', 'Laudos e manutenção', 'laudo', [['Inspeção de instalação elétrica', 'un', 30000], ['Laudo técnico com ART', 'un', 80000], ['Medição de aterramento', 'un', 20000], ['Manutenção preventiva de quadro', 'un', 25000], ['Reaperto de conexões', 'un', 15000], ['Balanceamento de fases', 'un', 35000]]],
  ['visita', 'Visita e hora', 'visita', [['Visita técnica', 'un', 12000], ['Localização de curto-circuito', 'un', 40000], ['Hora técnica', 'h', 11000], ['Diária técnica', 'dia', 45000]]],
  ['materiais', 'Materiais', 'material', [['Cabo flexível 1,5 mm²', 'm', 250], ['Cabo flexível 2,5 mm²', 'm', 350], ['Cabo flexível 4 mm²', 'm', 550], ['Cabo flexível 6 mm²', 'm', 850], ['Tomada 10 A com placa', 'un', 1800], ['Tomada 20 A com placa', 'un', 2200], ['Interruptor simples com placa', 'un', 1600], ['Caixa 4x2', 'un', 250], ['Eletroduto corrugado 3/4"', 'm', 250], ['DR bipolar 40 A 30 mA', 'un', 15000], ['DPS classe II 275 V 20 kA', 'un', 5500], ['Fita isolante', 'un', 800]]],
];
// os ids de fábrica são fixos: dois aparelhos que começam do zero têm o mesmo catálogo, e a sincronização não duplica
function semente() {
  const cats = [], precos = [];
  SEMENTE.forEach(([id, nome, icone, L]) => {
    cats.push({ id: 'c-' + id, nome, icone });
    L.forEach(([n, un, preco], i) => precos.push({ id: `p-${id}-${i + 1}`, cat: 'c-' + id, nome: n, un, preco }));
  });
  return { cats, precos };
}

/* ================= dados (tudo guardado neste aparelho) ================= */
const KEY = 'eletricafacil.';
let semSalvar = false; // o guia roda numa demonstração que não grava nada (Código, Art. 78, I)
const LS = {
  get(k, d) { try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { if (semSalvar) return true; try { localStorage.setItem(KEY + k, JSON.stringify(v)); return true; } catch { return false; } },
};
/* Versão 4: o app recomeça enxuto, com dados novos (Regras do app, Art. 6º). Nada da versão 3 é apagado: os orçamentos,
   os preços e os ajustes antigos continuam guardados neste aparelho, nas chaves antigas, só não aparecem aqui. Vêm de lá
   os seus dados dos documentos (nome, empresa, telefone, Pix e logotipo) e a ligação da sincronização, que passa a usar um
   arquivo novo na nuvem. A apresentação aparece de novo, uma vez. Dado antigo não trava o app. */
const FORMATO = '4';
(() => {
  try {
    if (localStorage.getItem(KEY + 'formato') === FORMATO) return;
    const lerJ = k => { try { return JSON.parse(localStorage.getItem(KEY + k) || 'null'); } catch { return null; } };
    const v = lerJ('settings');
    if (v && typeof v === 'object' && !localStorage.getItem(KEY + 'ajustes')) {
      const a = {};
      [['name', 'nome'], ['company', 'empresa'], ['phone', 'fone'], ['email', 'email'], ['doc', 'doc'], ['registro', 'registro'], ['city', 'cidade'], ['pix', 'pix'], ['logo', 'logo'], ['logoRatio', 'logoProp']].forEach(([de, para]) => { if (v[de]) a[para] = v[de]; });
      if (Object.keys(a).length) localStorage.setItem(KEY + 'ajustes', JSON.stringify(a));
    }
    const s = lerJ('sync');
    if (s && s.token) localStorage.setItem(KEY + 'sync', JSON.stringify({ token: s.token, login: s.login || '', tipOff: !!s.tipOff }));
    localStorage.removeItem(KEY + 'abertura');
    localStorage.setItem(KEY + 'formato', FORMATO);
  } catch {}
})();

const DEF = { nome: '', empresa: '', fone: '', email: '', doc: '', registro: '', cidade: '', pix: '', logo: '', logoProp: 1,
  validade: 15, garantia: 90, pag: 'vista', entradaPct: 50, obs: '', seq: 0, raio: true, usos: {} };
const ETAPAS = { orc: ['rascunho', 'enviado', 'aprovado', 'recebido'], rel: ['rascunho', 'enviado', 'recebido'] };
const NOME_ETAPA = { rascunho: 'Rascunho', enviado: 'Enviado', aprovado: 'Aprovado', recebido: 'Recebido', recusado: 'Recusado' };
const TIPO = { orc: { nome: 'Orçamento', titulo: 'ORÇAMENTO', arquivo: 'Orcamento' }, rel: { nome: 'Relatório', titulo: 'RELATÓRIO DE SERVIÇO', arquivo: 'Relatorio' } };
const MEIOS = ['Pix', 'Dinheiro', 'Cartão', 'Transferência'];
const num = (v, d = 0) => { const n = Number(v); return isFinite(n) ? n : d; };
const txt = v => typeof v === 'string' ? v : '';
// os ids entram em endereços e em seletores da tela: só letras, números, _ e -
const idOk = v => typeof v === 'string' && /^[\w-]{1,48}$/.test(v) ? v : '';
// o que vem do armazenamento, da nuvem ou de uma cópia passa por aqui: campo que falta ou veio torto ganha o padrão
function acertaDoc(d) {
  d = d && typeof d === 'object' ? d : {};
  const tipo = d.tipo === 'rel' ? 'rel' : 'orc', c = d.cliente && typeof d.cliente === 'object' ? d.cliente : {};
  const etapa = d.etapa === 'recusado' && tipo === 'orc' ? 'recusado' : ETAPAS[tipo].includes(d.etapa) ? d.etapa : 'rascunho';
  return { id: idOk(d.id) || uid(), num: Math.max(0, Math.round(num(d.num))), tipo, etapa,
    cliente: { nome: txt(c.nome), fone: txt(c.fone), end: txt(c.end), doc: txt(c.doc) }, titulo: txt(d.titulo),
    linhas: (Array.isArray(d.linhas) ? d.linhas : []).filter(l => l && typeof l === 'object').map(l => ({ id: idOk(l.id) || uid(), pid: idOk(l.pid), nome: txt(l.nome) || 'Serviço', un: UNIDADES.some(u => u[0] === l.un) ? l.un : 'un', q: Math.max(1, Math.min(9999, Math.round(num(l.q, 1)))), pu: Math.max(0, Math.round(num(l.pu))) })),
    desc: Math.max(0, Math.round(num(d.desc))), pag: tipo === 'orc' && d.pag === 'entrada' ? 'entrada' : d.pag === 'combinar' ? 'combinar' : 'vista',
    entradaPct: [30, 40, 50, 60, 70].includes(d.entradaPct) ? d.entradaPct : 50, validade: Math.max(1, Math.min(365, Math.round(num(d.validade, 15)))), garantia: Math.max(0, Math.min(3650, Math.round(num(d.garantia, 90)))),
    feito: num(d.feito) || null, obs: txt(d.obs),
    pagos: (Array.isArray(d.pagos) ? d.pagos : []).filter(p => p && num(p.v) > 0).map(p => ({ id: idOk(p.id) || uid(), v: Math.round(num(p.v)), em: num(p.em) || Date.now(), meio: MEIOS.includes(p.meio) ? p.meio : 'Pix' })),
    criado: num(d.criado) || Date.now(), mudou: num(d.mudou) || Date.now(), enviadoEm: num(d.enviadoEm) || null, aprovadoEm: num(d.aprovadoEm) || null, ...(d.exemplo ? { exemplo: true } : {}) };
}
const acertaPreco = p => ({ id: idOk(p.id) || uid(), cat: idOk(p.cat), nome: txt(p.nome) || 'Serviço', un: UNIDADES.some(u => u[0] === p.un) ? p.un : 'un', preco: Math.max(0, Math.round(num(p.preco))) });
const acertaCat = c => ({ id: idOk(c.id) || uid(), nome: txt(c.nome) || 'Categoria', icone: PIC[c.icone] ? c.icone : 'raio' });
function acertaAjustes(a) {
  const o = { ...DEF, ...(a && typeof a === 'object' ? a : {}) };
  ['nome', 'empresa', 'fone', 'email', 'doc', 'registro', 'cidade', 'pix', 'logo', 'obs'].forEach(k => { o[k] = txt(o[k]); });
  o.validade = Math.max(1, Math.min(365, Math.round(num(o.validade, 15)))); o.garantia = Math.max(0, Math.min(3650, Math.round(num(o.garantia, 90))));
  o.pag = ['vista', 'entrada', 'combinar'].includes(o.pag) ? o.pag : 'vista'; o.entradaPct = [30, 40, 50, 60, 70].includes(o.entradaPct) ? o.entradaPct : 50;
  o.seq = Math.max(0, Math.round(num(o.seq))); o.raio = o.raio !== false; o.logoProp = num(o.logoProp, 1) || 1;
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(o.logo)) o.logo = ''; // o logotipo é sempre uma imagem guardada no aparelho, nunca um endereço
  const U = {}; if (o.usos && typeof o.usos === 'object' && !Array.isArray(o.usos)) for (const k of Object.keys(o.usos)) if (idOk(k) && num(o.usos[k]) > 0) U[k] = Math.round(num(o.usos[k]));
  o.usos = U;
  return o;
}
// preço sem categoria (ela foi excluída em outro aparelho) vai para "Outros"
function acertaCatalogo() {
  const ids = new Set(cats.map(c => c.id)), soltos = precos.filter(p => !ids.has(p.cat));
  if (!soltos.length) return;
  if (!ids.has('c-outros')) cats.push({ id: 'c-outros', nome: 'Outros', icone: 'ferramenta' });
  soltos.forEach(p => { p.cat = 'c-outros'; });
}
let ajustes = acertaAjustes(LS.get('ajustes', {}));
let cats = LS.get('cats', null), precos = LS.get('precos', null), docs = LS.get('docs', null);
if (!Array.isArray(cats) || !Array.isArray(precos)) { const s = semente(); cats = s.cats; precos = s.precos; }
cats = cats.map(acertaCat); precos = precos.map(acertaPreco); acertaCatalogo();
docs = (Array.isArray(docs) ? docs : []).map(acertaDoc);

/* ================= Kit Fácil: moldura, tema e sincronização ================= */
const NOVIDADES = [{ versao: '4.0.0', itens: [
  'Elétrica Fácil recomeçou enxuto: o app agora faz uma coisa, o orçamento de serviços de elétrica, do pedido ao recibo.',
  'Dois documentos: o orçamento, antes do serviço, e o relatório, para cobrar o que já foi feito.',
  'O botão do pé é sempre o próximo passo: Enviar, Aprovou, Receber e Enviar recibo.',
  'Preços em blocos por categoria, com ícones. Toque no bloco e mude o preço na hora.',
  'Visual novo, com o amarelo na frente, e ícones desenhados para o app.',
  'O raio agora cai sozinho, de vez em quando. Dá para desligar em Ajustes.',
  'Saíram as conquistas, a Obra, o estoque e as ferramentas. Os dados da versão anterior continuam guardados no aparelho, mas não aparecem aqui.',
] }];
// quem ainda vai ver a apresentação não recebe a janela de Novidades do Kit por cima dela
if (String(LS.get('abertura', '')) !== '1' && !(navigator.webdriver && !window.EF_TESTE_ABERTURA)) { try { localStorage.setItem('kitfacil.eletrica-facil.visto', JSON.stringify(VERSAO)); } catch {} }
KitFacil.iniciar({
  app: 'eletrica-facil', nome: 'Elétrica Fácil', versao: VERSAO, icone: 'icons/icon-192.png',
  resumo: 'Orçamento de serviços de elétrica, do pedido ao recibo: some os serviços da sua lista de preços, envie em PDF ou pelo WhatsApp, receba por Pix e mande o recibo.',
  tela: () => rota().nome, exemploDados: 'os orçamentos e os dados dos seus clientes',
  abrirAjustes: secao => { if (rota().nome !== 'ajustes') ir('/ajustes'); else if (!secao) voltar('/'); },
  emAjustes: () => rota().nome === 'ajustes',
  novidades: [...NOVIDADES],
  ocupado: () => (typeof aberturaAtiva === 'function' && aberturaAtiva()) || (typeof guiaAtivo === 'function' && guiaAtivo()),
  copia: { descricao: 'Baixe um arquivo com os orçamentos, os relatórios, os preços e os ajustes.', baixar: () => baixarCopia(), restaurar: f => restaurarCopia(f) },
  privacidade: [
    'Os orçamentos, os relatórios, os preços, os ajustes e os dados dos clientes que você escreve, como nome, telefone, endereço e CPF ou CNPJ, ficam guardados neste aparelho. Você é responsável por eles perante os seus clientes.',
    'Os documentos em PDF são feitos aqui no aparelho. Eles só saem quando você compartilha, pelo WhatsApp, por e-mail ou por outro app.',
  ],
});
KitFacil.tema.iniciar({ chave: 'eletricafacil.pref', cores: { claro: '#FFD21F', escuro: '#FFD21F' } });
KitFacil.campo.ligar();
const canon = KitFacil.canon;
const SY = KitFacil.sync.criar({
  app: 'eletrica-facil-4', nome: 'Elétrica Fácil', chave: 'eletricafacil.sync', // arquivo novo na nuvem: o da versão 3 não é lido nem alterado
  dados: 'os mesmos orçamentos, relatórios, preços e ajustes',
  aplicar: R => aplicarRemoto(R), pacote: () => pacoteSinc(),
  mesmo: (fora, R) => canon(fora) === canon({ ajustes: R.ajustes, cats: R.cats, precos: R.precos, docs: R.docs, st: R.st, del: R.del }),
  redesenhar: () => redesenhar(),
  ocupado: () => semSalvar || KitFacil.dialogo.aberto() || !!(document.activeElement && document.activeElement.matches('input,textarea,select')),
  textoLigada: () => `Sincronização ligada. ${plural(docs.filter(d => !d.exemplo).length, 'documento', 'documentos')} neste aparelho.`,
});
const sinc = SY.estado;

/* ---------- salvar: cada registro guarda quando mudou; ao juntar aparelhos, vence a mudança mais recente ---------- */
let FOTO = null;
function fotografar() {
  FOTO = { a: {}, p: {}, c: {}, d: {} };
  for (const k in ajustes) FOTO.a[k] = JSON.stringify(ajustes[k]);
  precos.forEach(p => { FOTO.p[p.id] = JSON.stringify(p); });
  cats.forEach(c => { FOTO.c[c.id] = JSON.stringify(c); });
  docs.forEach(d => { if (!d.exemplo) FOTO.d[d.id] = { j: JSON.stringify(d), u: d.mudou }; });
}
function carimbar(tipo) {
  if (!FOTO || semSalvar) return;
  const agora = Date.now(); let mudou = false;
  if (tipo === 'ajustes') {
    for (const k in ajustes) { const j = JSON.stringify(ajustes[k]); if (FOTO.a[k] !== j) { FOTO.a[k] = j; sinc.st['a:' + k] = agora; mudou = true; } }
  } else if (tipo === 'precos' || tipo === 'cats') {
    const k = tipo === 'precos' ? 'p' : 'c', L = tipo === 'precos' ? precos : cats, visto = {};
    L.forEach(x => { visto[x.id] = 1; const j = JSON.stringify(x); if (FOTO[k][x.id] !== j) { FOTO[k][x.id] = j; sinc.st[k + ':' + x.id] = agora; delete sinc.del[x.id]; mudou = true; } });
    for (const id in FOTO[k]) if (!visto[id]) { delete FOTO[k][id]; delete sinc.st[k + ':' + id]; sinc.del[id] = agora; mudou = true; }
  } else {
    const visto = {};
    docs.forEach(d => {
      if (d.exemplo) return;
      visto[d.id] = 1;
      const antes = FOTO.d[d.id]; let j = JSON.stringify(d);
      if (antes && antes.j === j) return;
      // documento que voltou com "Desfazer", ou que mudou sem atualizar a hora: passa a valer agora
      if (!antes && sinc.del[d.id]) { delete sinc.del[d.id]; d.mudou = Math.max(d.mudou || 0, agora); j = JSON.stringify(d); }
      else if (antes && antes.u === d.mudou) { d.mudou = agora; j = JSON.stringify(d); }
      FOTO.d[d.id] = { j, u: d.mudou }; mudou = true;
    });
    for (const id in FOTO.d) if (!visto[id]) { delete FOTO.d[id]; sinc.del[id] = agora; mudou = true; }
  }
  if (mudou) { SY.salvar(); if (SY.ligada()) SY.agendar(); }
}
const cheio = ok => { if (!ok) aviso('Não foi possível salvar: o armazenamento do aparelho está cheio.'); return ok; };
const salvarAjustes = () => { carimbar('ajustes'); return LS.set('ajustes', ajustes); };
const salvarPrecos = () => { carimbar('precos'); carimbar('cats'); return cheio(LS.set('precos', precos) && LS.set('cats', cats)); };
const salvarDocs = () => { carimbar('docs'); return cheio(LS.set('docs', docs)); };

// junta duas listas por id; a versão mais recente de cada item vence, e o que foi excluído depois não volta
function juntar(L, R, lt, rt, del, aoVir) {
  const rm = new Map(R.map(x => [x.id, x])), usados = new Set(), fora = [];
  L.forEach(x => {
    usados.add(x.id);
    const r = rm.get(x.id);
    if (r) {
      if (del[x.id] >= Math.max(lt(x), rt(r))) return;
      if (rt(r) > lt(x)) { fora.push(r); aoVir && aoVir(r); } else fora.push(x);
    } else if (!(del[x.id] >= lt(x))) fora.push(x);
  });
  R.forEach(r => { if (!usados.has(r.id) && !(del[r.id] >= rt(r))) { fora.push(r); aoVir && aoVir(r); } });
  return fora;
}
function aplicarRemoto(R) {
  R = R && typeof R === 'object' ? R : {};
  const primeira = !sinc.lastSync, rs = {}, del = { ...sinc.del }, st = { ...sinc.st };
  if (R.st && typeof R.st === 'object') for (const k of Object.keys(R.st)) rs[k] = num(R.st[k]);
  if (R.del && typeof R.del === 'object') for (const k of Object.keys(R.del)) del[k] = Math.max(del[k] || 0, num(R.del[k]));
  const corte = Date.now() - 400 * DIA;
  for (const k in del) if (del[k] < corte) delete del[k];
  const antes = canon([ajustes, cats, precos, docs]);
  // ajustes: campo a campo (na primeira conexão, vale o que já está na nuvem)
  const A = { ...ajustes }, RA = R.ajustes && typeof R.ajustes === 'object' ? R.ajustes : {};
  for (const k of Object.keys(RA)) {
    if (!(k in DEF)) continue;
    const rt = rs['a:' + k] || 0, lt = st['a:' + k] || 0;
    if (primeira || rt > lt) { A[k] = RA[k]; if (rt) st['a:' + k] = rt; else delete st['a:' + k]; }
  }
  // preços e categorias: registro a registro (na primeira conexão, a lista da nuvem substitui a de fábrica)
  const lista = (Lc, Rl, k, acerta) => {
    Rl = (Array.isArray(Rl) ? Rl : []).filter(x => x && typeof x === 'object').map(acerta);
    if (primeira && Rl.length) {
      Object.keys(st).forEach(x => { if (x.startsWith(k + ':')) delete st[x]; });
      Object.keys(rs).forEach(x => { if (x.startsWith(k + ':')) st[x] = rs[x]; });
      return Rl;
    }
    return juntar(Lc, Rl, x => st[k + ':' + x.id] || 0, x => rs[k + ':' + x.id] || 0, del, x => { if (rs[k + ':' + x.id]) st[k + ':' + x.id] = rs[k + ':' + x.id]; });
  };
  const C = lista(cats, R.cats, 'c', acertaCat), P = lista(precos, R.precos, 'p', acertaPreco);
  // documentos (o exemplo fica só neste aparelho); quem está aberto na tela continua o mesmo objeto
  const meus = new Map(docs.map(d => [d.id, d]));
  const D = juntar(docs.filter(d => !d.exemplo), (Array.isArray(R.docs) ? R.docs : []).map(acertaDoc).filter(d => !d.exemplo), d => d.mudou || 0, d => d.mudou || 0, del)
    .map(r => { const l = meus.get(r.id); if (l && l !== r) { Object.keys(l).forEach(k => delete l[k]); Object.assign(l, r); return l; } return r; });
  docs = [...docs.filter(d => d.exemplo), ...D];
  A.seq = Math.max(num(ajustes.seq), num(RA.seq), 0, ...docs.map(d => d.num || 0));
  // documentos criados ao mesmo tempo em dois aparelhos podem repetir o número: o mais novo ganha um número novo
  const usados = new Set();
  [...docs].filter(d => !d.exemplo && d.num).sort((a, b) => a.criado - b.criado).forEach(d => { if (usados.has(d.num)) { d.num = ++A.seq; d.mudou = Date.now(); } usados.add(d.num); });
  ajustes = acertaAjustes(A); cats = C; precos = P; acertaCatalogo();
  const vivos = new Set([...cats, ...precos].map(x => x.id));
  Object.keys(st).forEach(k => { if (/^[pc]:/.test(k) && !vivos.has(k.slice(2))) delete st[k]; });
  sinc.st = st; sinc.del = del;
  LS.set('ajustes', ajustes); LS.set('cats', cats); LS.set('precos', precos); LS.set('docs', docs);
  fotografar(); SY.salvar();
  return antes !== canon([ajustes, cats, precos, docs]);
}
const docVazio = d => !d.exemplo && d.etapa === 'rascunho' && !d.cliente.nome && !d.titulo && !d.linhas.length && !d.obs;
const pacoteSinc = () => ({ ajustes, cats, precos, docs: docs.filter(d => !d.exemplo && !docVazio(d)), st: sinc.st, del: sinc.del });
fotografar();

/* ================= contas (Regras do app, Art. 7º: os totais têm de sair certos) ================= */
const totalLinha = l => Math.round(l.q * l.pu);
function conta(d) {
  const sub = soma(d.linhas.map(totalLinha));
  const desc = Math.min(Math.max(0, d.desc || 0), sub), total = sub - desc;
  const entrada = d.pag === 'entrada' ? Math.round(total * d.entradaPct / 100) : 0;
  const pago = soma((d.pagos || []).map(p => p.v));
  return { sub, desc, total, entrada, resto: total - entrada, pago, falta: Math.max(0, total - pago) };
}
const getDoc = id => docs.find(d => d.id === id);
const numTxt = d => d.exemplo ? 'Exemplo' : 'Nº ' + String(d.num || 0).padStart(4, '0');
const nomeDoc = d => `${TIPO[d.tipo].nome} ${numTxt(d)}`;
const tocarDoc = d => { d.mudou = Date.now(); salvarDocs(); };
const dataDoc = d => d.enviadoEm || d.criado;
const validoAte = d => dataDoc(d) + d.validade * DIA;
// o que cobrar agora: a entrada do orçamento, enquanto ela não foi paga; depois, o que falta
function cobrarAgora(d, c = conta(d)) {
  if (d.tipo === 'orc' && d.pag === 'entrada' && c.pago < c.entrada) return { v: c.entrada - c.pago, que: 'a entrada' };
  return { v: c.falta, que: c.pago > 0 ? 'o restante' : 'o total' };
}
function pagTxt(d, c = conta(d)) {
  if (d.pag === 'entrada') return `Entrada de ${d.entradaPct}% (${BRL(c.entrada)}) na aprovação e ${BRL(c.resto)} na conclusão do serviço.`;
  if (d.pag === 'combinar') return 'Forma de pagamento a combinar.';
  return d.tipo === 'rel' ? 'Pagamento à vista.' : 'Pagamento à vista, na conclusão do serviço.';
}
const pagCurto = d => d.pag === 'entrada' ? `Entrada de ${d.entradaPct}%` : d.pag === 'combinar' ? 'A combinar' : 'À vista';
const garantiaTxt = d => d.garantia > 0 ? `${plural(d.garantia, 'dia', 'dias')} para o serviço executado` : 'Sem garantia informada';
// o próximo passo de cada documento: é o botão do pé
function proximo(d) {
  if (d.etapa === 'recusado') return { id: 'reabrir', rotulo: 'Reabrir', frase: 'O cliente recusou. Reabra para mudar e enviar de novo.' };
  if (d.etapa === 'recebido') return { id: 'recibo', rotulo: 'Enviar recibo', frase: 'Pago. Mande o recibo ao cliente.' };
  if (!d.linhas.length) return { id: 'somar', rotulo: 'Somar serviço', frase: d.tipo === 'rel' ? 'Some o que foi feito.' : 'Some os serviços do orçamento.' };
  if (d.etapa === 'rascunho') return { id: 'enviar', rotulo: 'Enviar', frase: d.tipo === 'rel' ? 'Confira e envie a cobrança ao cliente.' : 'Confira e envie ao cliente.' };
  if (d.etapa === 'enviado' && d.tipo === 'orc') return { id: 'aprovou', rotulo: 'Aprovou', frase: 'Esperando a resposta do cliente.' };
  return { id: 'receber', rotulo: 'Receber', frase: d.tipo === 'rel' ? 'Cobrança enviada. Registre quando o cliente pagar.' : 'Aprovado. Faça o serviço e registre o pagamento.' };
}
const paraReceber = d => (d.tipo === 'orc' && d.etapa === 'aprovado') || (d.tipo === 'rel' && d.etapa === 'enviado');
function painel() {
  const L = docs.filter(d => !docVazio(d));
  const rec = L.filter(paraReceber), esp = L.filter(d => d.tipo === 'orc' && d.etapa === 'enviado');
  const ini = new Date(); ini.setDate(1); ini.setHours(0, 0, 0, 0);
  return { receber: soma(rec.map(d => conta(d).falta)), nReceber: rec.length, esperando: soma(esp.map(d => conta(d).total)), nEsperando: esp.length,
    aprovados: L.filter(d => d.tipo === 'orc' && d.etapa === 'aprovado').length,
    recebidoMes: soma(L.flatMap(d => d.pagos.filter(p => p.em >= ini.getTime()).map(p => p.v))) };
}
function novoDocumento(tipo) {
  const d = acertaDoc({ id: uid(), tipo, num: 0, validade: ajustes.validade, garantia: ajustes.garantia, pag: tipo === 'orc' ? ajustes.pag : (ajustes.pag === 'combinar' ? 'combinar' : 'vista'), entradaPct: ajustes.entradaPct, obs: ajustes.obs, feito: tipo === 'rel' ? Date.now() : null, criado: Date.now(), mudou: Date.now() });
  d.num = ++ajustes.seq; salvarAjustes();
  docs.unshift(d); salvarDocs();
  ir('/d/' + d.id);
  return d;
}
function criarExemplo() {
  docs = docs.filter(d => !d.exemplo);
  const P = n => precos.find(p => p.nome === n) || { id: '', nome: n, un: 'un', preco: 10000 };
  const lin = (n, q) => { const p = P(n); return { id: uid(), pid: p.id, nome: p.nome, un: p.un, q, pu: p.preco }; };
  const d = acertaDoc({ id: 'exemplo', tipo: 'orc', exemplo: true, cliente: { nome: 'Mariana Souza', fone: '(11) 98888-7777', end: 'Rua das Acácias, 120' }, titulo: 'Reforma elétrica da cozinha',
    linhas: [lin('Ponto novo de tomada com fiação', 6), lin('Instalação de luminária ou plafon', 3), lin('Instalação de DR', 1), lin('Instalação de chuveiro elétrico', 1)],
    pag: 'entrada', entradaPct: 50, validade: ajustes.validade, garantia: ajustes.garantia, obs: 'Material por conta do cliente.', criado: Date.now(), mudou: Date.now() });
  docs.unshift(d); salvarDocs(); ir('/d/' + d.id);
  return d;
}
const usar = pid => { if (!pid) return; ajustes.usos = { ...ajustes.usos, [pid]: (ajustes.usos[pid] || 0) + 1 }; };
const maisUsados = (n = 6) => Object.entries(ajustes.usos).sort((a, b) => b[1] - a[1]).map(([id]) => precos.find(p => p.id === id)).filter(Boolean).slice(0, n);

/* ================= avisos, janelas e campos: são os do Kit Fácil (Código, Art. 68) ================= */
function aviso(msg, acao) { KitFacil.avisar(msg, acao); }
function prepararCampos(raiz) { KitFacil.campo.preparar(raiz); KitFacil.escolha.ligar(raiz); KitFacil.data.ligar(raiz); }
function janela({ titulo, sub = '', contexto = '', corpo, pe = '', alta = false, larga = false, aoMontar, aoFechar }) {
  return KitFacil.dialogo.abrir({ titulo, sub, contexto, corpo, pe, classe: [alta && 'kf-alto', larga && 'kf-largo'].filter(Boolean).join(' '),
    aoFechar, aoMontar: j => { prepararCampos(j); aoMontar && aoMontar(j); } });
}
function fecharJanela(calado) { KitFacil.dialogo.fechar(calado); }
function confirmar(titulo, texto, ok, aoConfirmar, { perigo = true, desfaz = '' } = {}) { KitFacil.dialogo.confirmar({ titulo, texto, ok, perigo, desfaz, aoConfirmar }); }
const lerDinheiro = el => KitFacil.campo.dinheiro.ler(el && el.value) || 0;
const campoDinheiro = (id, valor, attrs = '') => KitFacil.campo.dinheiro.html({ id, valor: valor || null, attrs });
const campo = (id, rotulo, html, ajuda = '') => `<div class="kf-campo"><label class="kf-rotulo" for="${id}">${rotulo}</label>${html}${ajuda ? `<span class="kf-ajuda">${ajuda}</span>` : ''}</div>`;
const entrada = (id, valor, attrs = '') => `<input id="${id}" class="kf-entrada" type="text" value="${esc(valor)}" ${attrs}>`;
const segmento = (rotulo, dado, L, atual) => `<div class="kf-seg" role="group" aria-label="${esc(rotulo)}">${L.map(([k, l]) => `<button type="button" data-${dado}="${esc(k)}" aria-pressed="${String(k) === String(atual)}">${esc(l)}</button>`).join('')}</div>`;

/* ================= rotas ================= */
function rota() {
  const h = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  let m;
  if ((m = h.match(/^\/d\/([\w-]+)/))) return { nome: 'doc', id: m[1], chave: '/d/' + m[1] };
  if ((m = h.match(/^\/precos\/([\w-]+)/))) return { nome: 'cat', id: m[1], chave: '/precos/' + m[1] };
  if (h === '/docs') return { nome: 'docs', chave: h };
  if (h === '/precos') return { nome: 'precos', chave: h };
  if (h === '/mais') return { nome: 'mais', chave: h };
  if (h === '/ajustes') return { nome: 'ajustes', chave: h };
  return { nome: 'inicio', chave: '/' };
}
const rolagem = {};
let chaveAtual = null, docAberto = null, modoNav = 'ir';
function ir(caminho, troca) {
  if (chaveAtual) rolagem[chaveAtual] = window.scrollY;
  const d = (history.state && history.state.d) || 0;
  if (troca) history.replaceState({ d }, '', '#' + caminho); else history.pushState({ d: d + 1 }, '', '#' + caminho);
  modoNav = 'ir'; fecharJanela(true); desenhar();
}
function voltar(reserva = '/') {
  if (history.state && history.state.d > 0) history.back(); else ir(reserva, true);
}
let irDepois = null; // destino guardado enquanto o Voltar tira uma guia dos Ajustes do histórico
window.addEventListener('popstate', () => {
  if (irDepois) { const d = irDepois; irDepois = null; ir(d, true); return; }
  // voltar de uma guia dos Ajustes para a lista: quem cuida é o Kit Fácil, sem redesenhar a tela
  if (rota().chave === chaveAtual && rota().nome === 'ajustes' && $('[data-kf-aj]')) return;
  if (chaveAtual) rolagem[chaveAtual] = window.scrollY; modoNav = 'volta'; fecharJanela(true); desenhar();
});
const TELAS = {};
