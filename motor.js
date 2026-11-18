/* Elétrica Fácil · motor: utilidades, tabela de preços, dados, sincronização, contas e janelas. */
'use strict';
const VERSAO = '3.0.0';
// a marca do alto é o ícone do app, o mesmo da tela de início do celular (um ícone só, como no Conta Fácil)
const MARCA = '<span class="kf-marca-ic marca-img" aria-hidden="true"><img src="icons/icon-192.png" alt="" width="36" height="36" decoding="async"></span><span class="kf-marca-nome">Elétrica Fácil</span>';
/* ================= utilidades ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-6);
const BRL = c => (Math.round(c || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').trim().toLocaleLowerCase('pt-BR');
const fold = s => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const sum = a => a.reduce((x, y) => x + y, 0);
const clone = v => JSON.parse(JSON.stringify(v));
const DAY = 864e5;
// um dia guardado sempre ao meio-dia, para não mudar de data com o fuso ou o horário de verão
const dayTs = ts => { if (!ts) return null; const d = new Date(ts); d.setHours(12, 0, 0, 0); return d.getTime(); };
// prazo de execução: unidade -> [plural, singular]
const PRAZO_U = { uteis: ['dias úteis', 'dia útil'], corridos: ['dias corridos', 'dia corrido'], semanas: ['semanas', 'semana'], meses: ['meses', 'mês'] };
const prazoTxt = p => p ? `${p.n} ${PRAZO_U[p.u][p.n === 1 ? 1 : 0]}` : '';
// lê o texto livre das versões antigas ("2 dias úteis", "1 semana", "No mesmo dia")
function prazoDeTexto(t) {
  t = String(t || '').toLowerCase();
  if (!t.trim()) return null;
  if (/mesmo dia/.test(t)) return { n: 1, u: 'corridos' };
  const m = t.match(/(\d+)\s*(dias?\s*[uú]te(?:is|l)|dias?\s*corridos?|dias?|semanas?|m[eê]s(?:es)?)/);
  if (!m) return null;
  const u = /[uú]te/.test(m[2]) ? 'uteis' : /semana/.test(m[2]) ? 'semanas' : /m[eê]s/.test(m[2]) ? 'meses' : 'corridos';
  return { n: +m[1], u };
}
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
function parseMoney(s) {
  s = String(s ?? '').replace(/[^\d,.]/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const v = parseFloat(s);
  return isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
}
// quantidade aceita decimais: 12,5 m de fio
function parseQty(s) {
  s = String(s ?? '').trim().replace(/\s/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); // 1.000 = mil (ponto de milhar)
  if (!/^\d*\.?\d+$/.test(s)) return null; // "abc", "-3", "2x" não são quantidade
  const v = parseFloat(s);
  return isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
}
// valores fora do comum pedem confirmação antes de valer (U12): não proíbe casos reais
const QTD_ALTA = 10000;
function conferirQtd(qty, nome, seguir) {
  if (qty <= QTD_ALTA) return seguir();
  confirmSheet(`Quantidade muito alta`, `${fmtQty(qty)} de ${nome || 'item'} é isso mesmo? Confira se não sobrou um zero.`, 'Manter assim', seguir, false);
}
const fmtQty = n => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const fmtDate = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtShort = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const longDate = ts => new Date(ts).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const phoneDigits = s => String(s || '').replace(/\D/g, '');
function fmtPhone(s) {
  const d = phoneDigits(s).replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(s || '').trim();
}
const firstName = s => String(s || '').trim().split(/\s+/)[0] || '';
function rel(ts) {
  if (!ts) return '';
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(ts); b.setHours(0, 0, 0, 0);
  const n = Math.round((a - b) / DAY);
  return n <= 0 ? 'hoje' : n === 1 ? 'ontem' : `há ${n} dias`;
}
const daysSince = ts => ts ? Math.floor((Date.now() - ts) / DAY) : 0;
const isTouch = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } })();

const ic = d => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  bolt: '<svg class="i bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 1.5 3.8 13.6h6.9L9.6 22.5l10.6-13h-7.1z"/></svg>',
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  minus: ic('<path d="M5 12h14"/>'),
  back: ic('<path d="M15 5l-7 7 7 7"/>'),
  more: ic('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
  x: ic('<path d="M18 6 6 18M6 6l12 12"/>'),
  trash: ic('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  doc: ic('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
  tag: ic('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),
  sliders: ic('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  wa: ic('<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1.2-1.2 2 1-.4 1.6c-3.6.4-8-4-7.6-7.6l1.6-.4 1 2z"/>'),
  share: ic('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>'),
  copy: ic('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
  check: ic('<path d="m5 12 5 5 9-10"/>'),
  list: ic('<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>'),
  // Pix: um QR code (o símbolo do Pix é marca do Banco Central; o app mostra o que entrega, o código para pagar)
  pix: ic('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M13.5 13.5h3.2v3.2h-3.2z"/><path d="M20.5 17.2v3.3h-3.3"/>'),
  receipt: ic('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
  dup: ic('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>'),
  flag: ic('<path d="M5 21V4h11l-2 4 2 4H5"/>'),
  dl: ic('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  ul: ic('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/>'),
  arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  image: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  percent: ic('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'),
  pin: ic('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  chev: ic('<path d="m9 6 6 6-6 6"/>'),
  up: ic('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  car: ic('<path d="M5 16v-5l2-5h10l2 5v5"/><path d="M3 16h18v3H3zM7.5 19v1.5M16.5 19v1.5"/>'),
  phone: ic('<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>'),
  cloud: ic('<path d="M7 19a4.5 4.5 0 0 1-.7-8.95A6 6 0 0 1 17.8 8.6 4.6 4.6 0 0 1 17.5 19z"/>'),
  cal: ic('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  warn: ic('<path d="M12 3 2 20h20z"/><path d="M12 10v4.5M12 17.5h.01"/>'),
  box: ic('<path d="m3 7.5 9-4.5 9 4.5-9 4.5z"/><path d="M3 7.5V17l9 4.5 9-4.5V7.5M12 12v9.5"/>'),
  tool: ic('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>'),
  checklist: ic('<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5 2.5-2.5"/>'),
  left: ic('<path d="m15 6-6 6 6 6"/>'),
  cart: ic('<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.7a1.6 1.6 0 0 0 1.6-1.2l1.6-7.3H6"/><path d="M10 10.5h7"/>'),
};

/* ================= tabela inicial de preços (referência para ajustar) ================= */
const UNITS = [['un', 'Unidade'], ['ponto', 'Ponto'], ['m', 'Metro'], ['m²', 'Metro quadrado'], ['h', 'Hora'], ['vb', 'Verba'],
  ['pç', 'Peça'], ['par', 'Par'], ['rolo', 'Rolo'], ['cx', 'Caixa'], ['pct', 'Pacote'], ['barra', 'Barra'], ['kg', 'Quilo'], ['l', 'Litro'],
  ['saco', 'Saco'], ['galão', 'Galão'], ['kit', 'Kit']];
const unitTxt = (q, u) => ({ un: 'un.', ponto: q === 1 ? 'ponto' : 'pontos', m: 'm', 'm²': 'm²', h: 'h', vb: q === 1 ? 'verba' : 'verbas',
  'pç': q === 1 ? 'peça' : 'peças', par: q === 1 ? 'par' : 'pares', rolo: q === 1 ? 'rolo' : 'rolos', cx: q === 1 ? 'caixa' : 'caixas', pct: q === 1 ? 'pacote' : 'pacotes', barra: q === 1 ? 'barra' : 'barras', kg: 'kg', l: 'L',
  saco: q === 1 ? 'saco' : 'sacos', 'galão': q === 1 ? 'galão' : 'galões', kit: q === 1 ? 'kit' : 'kits' }[u] || u || 'un.');
const unitName = u => (UNITS.find(x => x[0] === u) || UNITS[0])[1].toLowerCase();
const SEED = [
  ['svc', 'Tomadas e interruptores', 'Instalação de tomada ou interruptor', 'un', 6000],
  ['svc', 'Tomadas e interruptores', 'Troca de tomada ou interruptor', 'un', 4500],
  ['svc', 'Tomadas e interruptores', 'Ponto novo de tomada com fiação', 'ponto', 10000],
  ['svc', 'Tomadas e interruptores', 'Tomada de uso específico 20 A', 'un', 8000],
  ['svc', 'Tomadas e interruptores', 'Ponto de interruptor paralelo three-way', 'ponto', 12000],
  ['svc', 'Iluminação', 'Instalação de luminária ou plafon', 'un', 9000],
  ['svc', 'Iluminação', 'Instalação de lustre ou pendente', 'un', 13000],
  ['svc', 'Iluminação', 'Instalação de spot embutido', 'un', 4500],
  ['svc', 'Iluminação', 'Instalação de fita de LED', 'm', 3500],
  ['svc', 'Iluminação', 'Instalação de sensor de presença', 'un', 11000],
  ['svc', 'Iluminação', 'Instalação de refletor externo', 'un', 12000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de chuveiro elétrico', 'un', 11500],
  ['svc', 'Chuveiro e aparelhos', 'Troca de resistência do chuveiro', 'un', 8000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de ventilador de teto', 'un', 18000],
  ['svc', 'Chuveiro e aparelhos', 'Ponto e circuito para ar-condicionado', 'un', 30000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de torneira elétrica', 'un', 11000],
  ['svc', 'Quadro e proteção', 'Instalação ou troca de disjuntor', 'un', 7000],
  ['svc', 'Quadro e proteção', 'Instalação de DR', 'un', 15000],
  ['svc', 'Quadro e proteção', 'Instalação de DPS', 'un', 13000],
  ['svc', 'Quadro e proteção', 'Montagem de quadro de distribuição', 'un', 90000],
  ['svc', 'Quadro e proteção', 'Aterramento com haste e conexões', 'un', 35000],
  ['svc', 'Quadro e proteção', 'Instalação de padrão de entrada', 'un', 150000],
  ['svc', 'Fiação e infraestrutura', 'Passagem de fiação', 'm', 1000],
  ['svc', 'Fiação e infraestrutura', 'Troca da fiação de um circuito', 'un', 25000],
  ['svc', 'Fiação e infraestrutura', 'Eletroduto aparente', 'm', 2000],
  ['svc', 'Fiação e infraestrutura', 'Rasgo e fechamento na parede', 'm', 3000],
  ['svc', 'Visita e diagnóstico', 'Visita técnica', 'un', 12000],
  ['svc', 'Visita e diagnóstico', 'Localização de curto-circuito', 'un', 40000],
  ['svc', 'Visita e diagnóstico', 'Hora técnica', 'h', 11000],
  ['mat', 'Cabos', 'Cabo flexível 1,5 mm²', 'm', 250],
  ['mat', 'Cabos', 'Cabo flexível 2,5 mm²', 'm', 350],
  ['mat', 'Cabos', 'Cabo flexível 4 mm²', 'm', 550],
  ['mat', 'Cabos', 'Cabo flexível 6 mm²', 'm', 850],
  ['mat', 'Cabos', 'Cabo flexível 10 mm²', 'm', 1400],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto corrugado 3/4"', 'm', 250],
  ['mat', 'Eletrodutos e caixas', 'Caixa 4x2', 'un', 250],
  ['mat', 'Eletrodutos e caixas', 'Caixa 4x4', 'un', 400],
  ['mat', 'Eletrodutos e caixas', 'Caixa de passagem', 'un', 1200],
  ['mat', 'Tomadas e interruptores', 'Tomada 10 A com placa', 'un', 1800],
  ['mat', 'Tomadas e interruptores', 'Tomada 20 A com placa', 'un', 2200],
  ['mat', 'Tomadas e interruptores', 'Interruptor simples com placa', 'un', 1600],
  ['mat', 'Tomadas e interruptores', 'Tomada dupla 10 A com placa', 'un', 2800],
  ['mat', 'Tomadas e interruptores', 'Interruptor duplo com placa', 'un', 2400],
  ['mat', 'Tomadas e interruptores', 'Interruptor paralelo three-way com placa', 'un', 2200],
  ['mat', 'Tomadas e interruptores', 'Interruptor intermediário four-way', 'un', 4500],
  ['mat', 'Proteção', 'Disjuntor monopolar 10 a 32 A', 'un', 2200],
  ['mat', 'Proteção', 'Disjuntor bipolar 10 a 32 A', 'un', 6000],
  ['mat', 'Proteção', 'DR bipolar 40 A 30 mA', 'un', 15000],
  ['mat', 'Proteção', 'DPS classe II 275 V 20 kA', 'un', 5500],
  ['mat', 'Proteção', 'Quadro para 12 disjuntores', 'un', 11000],
  ['mat', 'Iluminação', 'Lâmpada LED 9 W', 'un', 800],
  ['mat', 'Iluminação', 'Spot embutido LED', 'un', 3500],
  ['mat', 'Iluminação', 'Plafon LED 18 W', 'un', 4500],
  ['mat', 'Fixação e acabamento', 'Fita isolante', 'un', 800],
  // 2.15: catálogo ampliado de mão de obra e material (preços de referência)
  ['svc', 'Tomadas e interruptores', 'Instalação de tomada USB', 'un', 6500],
  ['svc', 'Tomadas e interruptores', 'Troca de espelho ou placa', 'un', 2000],
  ['svc', 'Tomadas e interruptores', 'Instalação de interruptor com dimmer', 'un', 8000],
  ['svc', 'Portão, campainha e interfone', 'Instalação de campainha', 'un', 9000],
  ['svc', 'Tomadas e interruptores', 'Instalação de tomada de piso', 'un', 9000],
  ['svc', 'Tomadas e interruptores', 'Ponto de tomada externa à prova de tempo', 'ponto', 11000],
  ['svc', 'Iluminação', 'Instalação de perfil de LED', 'm', 9000],
  ['svc', 'Iluminação', 'Instalação de arandela', 'un', 9000],
  ['svc', 'Iluminação', 'Instalação de luminária de emergência', 'un', 9000],
  ['svc', 'Iluminação', 'Instalação de poste ou balizador de jardim', 'un', 17000],
  ['svc', 'Iluminação', 'Instalação de fotocélula', 'un', 11000],
  ['svc', 'Iluminação', 'Instalação de trilho eletrificado', 'm', 7000],
  ['svc', 'Iluminação', 'Troca de reator ou driver', 'un', 10000],
  ['svc', 'Iluminação', 'Ponto de iluminação novo com fiação', 'ponto', 10000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de cooktop ou forno elétrico', 'un', 16000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação elétrica de aquecedor a gás', 'un', 20000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de exaustor ou coifa', 'un', 20000],
  ['svc', 'Portão, campainha e interfone', 'Instalação de motor de portão', 'un', 35000],
  ['svc', 'Chuveiro e aparelhos', "Instalação de bomba d'água", 'un', 25000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de aquecedor de passagem elétrico', 'un', 20000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de purificador ou filtro elétrico', 'un', 8000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de máquina de lavar com ponto exclusivo', 'un', 16000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação elétrica de ar-condicionado split', 'un', 35000],
  ['svc', 'Quadro e proteção', 'Troca de quadro de distribuição', 'un', 95000],
  ['svc', 'Quadro e proteção', 'Organização e identificação de quadro', 'un', 30000],
  ['svc', 'Quadro e proteção', 'Instalação de disjuntor geral', 'un', 11000],
  ['svc', 'Quadro e proteção', 'Instalação de IDR', 'un', 16000],
  ['svc', 'Quadro e proteção', 'Balanceamento de fases', 'un', 35000],
  ['svc', 'Quadro e proteção', 'Instalação de quadro de medição', 'un', 80000],
  ['svc', 'Quadro e proteção', 'Instalação de contator ou relé', 'un', 20000],
  ['svc', 'Quadro e proteção', 'Instalação de temporizador', 'un', 13000],
  ['svc', 'Fiação e infraestrutura', 'Passagem de cabo em eletroduto existente', 'm', 800],
  ['svc', 'Fiação e infraestrutura', 'Instalação de eletrocalha', 'm', 4000],
  ['svc', 'Fiação e infraestrutura', 'Instalação de canaleta', 'm', 2000],
  ['svc', 'Fiação e infraestrutura', 'Abertura de caixa na alvenaria', 'un', 5000],
  ['svc', 'Fiação e infraestrutura', 'Instalação de eletroduto embutido', 'm', 3000],
  ['svc', 'Fiação e infraestrutura', 'Ramal de ligação até o padrão de entrada', 'un', 50000],
  ['svc', 'Fiação e infraestrutura', 'Lançamento de cabo subterrâneo', 'm', 4500],
  ['svc', 'Portão, campainha e interfone', 'Instalação de interfone ou porteiro eletrônico', 'un', 20000],
  ['svc', 'Portão, campainha e interfone', 'Instalação de fechadura elétrica', 'un', 18500],
  ['svc', 'Energia solar e gerador', 'Instalação de inversor', 'un', 60000],
  ['svc', 'Energia solar e gerador', 'Instalação de string box', 'un', 25000],
  ['svc', 'Energia solar e gerador', 'Montagem de módulo fotovoltaico', 'un', 12000],
  ['svc', 'Energia solar e gerador', 'Instalação de chave de transferência de gerador', 'un', 45000],
  ['svc', 'Energia solar e gerador', 'Instalação de nobreak', 'un', 34000],
  ['svc', 'Laudos e manutenção', 'Inspeção de instalação elétrica', 'un', 30000],
  ['svc', 'Laudos e manutenção', 'Laudo técnico com ART', 'un', 80000],
  ['svc', 'Laudos e manutenção', 'Medição de aterramento', 'un', 20000],
  ['svc', 'Laudos e manutenção', 'Termografia de quadro', 'un', 35000],
  ['svc', 'Laudos e manutenção', 'Manutenção preventiva de quadro', 'un', 25000],
  ['svc', 'Laudos e manutenção', 'Reaperto de conexões', 'un', 15000],
  ['svc', 'Visita e diagnóstico', 'Diária técnica', 'un', 45000],
  ['mat', 'Cabos', 'Cabo flexível 0,75 mm²', 'm', 180],
  ['mat', 'Cabos', 'Cabo flexível 16 mm²', 'm', 2300],
  ['mat', 'Cabos', 'Cabo flexível 25 mm²', 'm', 3600],
  ['mat', 'Cabos', 'Cabo PP 2 x 1,5 mm²', 'm', 650],
  ['mat', 'Cabos', 'Cabo PP 3 x 1,5 mm²', 'm', 900],
  ['mat', 'Cabos', 'Cabo PP 3 x 2,5 mm²', 'm', 1300],
  ['mat', 'Cabos', 'Cabo PP 4 x 4 mm²', 'm', 2600],
  ['mat', 'Cabos', 'Cabo paralelo 2 x 1,5 mm²', 'm', 400],
  ['mat', 'Cabos', 'Cabo de cobre nu 16 mm²', 'm', 2400],
  ['mat', 'Cabos', 'Cabo solar 6 mm²', 'm', 900],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto corrugado 1"', 'm', 350],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto corrugado 1/2"', 'm', 200],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto rígido PVC 3/4" de 3 m', 'barra', 1800],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto rígido PVC 1" de 3 m', 'barra', 2600],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto metálico 3/4" de 3 m', 'barra', 4500],
  ['mat', 'Eletrodutos e caixas', 'Curva PVC 3/4"', 'un', 400],
  ['mat', 'Eletrodutos e caixas', 'Luva PVC 3/4"', 'un', 200],
  ['mat', 'Eletrodutos e caixas', 'Bucha e arruela 3/4"', 'un', 150],
  ['mat', 'Eletrodutos e caixas', 'Caixa 4x2 para drywall', 'un', 450],
  ['mat', 'Eletrodutos e caixas', 'Caixa octogonal 4x4 de laje', 'un', 450],
  ['mat', 'Eletrodutos e caixas', 'Caixa de sobrepor 4x2', 'un', 800],
  ['mat', 'Eletrodutos e caixas', 'Condulete 3/4"', 'un', 1200],
  ['mat', 'Eletrodutos e caixas', 'Canaleta 20 x 10 mm de 2 m', 'barra', 1200],
  ['mat', 'Eletrodutos e caixas', 'Eletrocalha perfurada 100 x 50 de 3 m', 'barra', 9000],
  ['mat', 'Eletrodutos e caixas', 'Caixa de passagem 20 x 20', 'un', 3500],
  ['mat', 'Eletrodutos e caixas', 'Abraçadeira tipo D 3/4"', 'un', 100],
  ['mat', 'Eletrodutos e caixas', 'Fita perfurada', 'm', 200],
  ['mat', 'Tomadas e interruptores', 'Tomada USB com placa', 'un', 6500],
  ['mat', 'Tomadas e interruptores', 'Módulo de tomada 2P+T 10 A', 'un', 900],
  ['mat', 'Tomadas e interruptores', 'Módulo de tomada 2P+T 20 A', 'un', 1200],
  ['mat', 'Tomadas e interruptores', 'Módulo de interruptor simples', 'un', 700],
  ['mat', 'Tomadas e interruptores', 'Módulo de interruptor paralelo', 'un', 1000],
  ['mat', 'Tomadas e interruptores', 'Placa 4x2 de 1 posto', 'un', 600],
  ['mat', 'Tomadas e interruptores', 'Placa 4x2 de 2 postos', 'un', 600],
  ['mat', 'Tomadas e interruptores', 'Placa 4x4', 'un', 1200],
  ['mat', 'Tomadas e interruptores', 'Suporte 4x2', 'un', 300],
  ['mat', 'Tomadas e interruptores', 'Dimmer rotativo', 'un', 4500],
  ['mat', 'Tomadas e interruptores', 'Pulsador de campainha', 'un', 1500],
  ['mat', 'Tomadas e interruptores', 'Tomada de sobrepor', 'un', 1800],
  ['mat', 'Tomadas e interruptores', 'Tomada industrial 2P+T 16 A', 'un', 3500],
  ['mat', 'Tomadas e interruptores', 'Tomada para piso', 'un', 8000],
  ['mat', 'Tomadas e interruptores', 'Plugue macho 10 A', 'un', 600],
  ['mat', 'Tomadas e interruptores', 'Plugue fêmea 10 A', 'un', 600],
  ['mat', 'Proteção', 'Disjuntor monopolar 40 a 63 A', 'un', 3200],
  ['mat', 'Proteção', 'Disjuntor bipolar 40 a 63 A', 'un', 8000],
  ['mat', 'Proteção', 'Disjuntor tripolar 10 a 32 A', 'un', 9500],
  ['mat', 'Proteção', 'Disjuntor tripolar 70 a 100 A', 'un', 28000],
  ['mat', 'Proteção', 'DR tetrapolar 40 A 30 mA', 'un', 25000],
  ['mat', 'Proteção', 'DR bipolar 63 A 30 mA', 'un', 22000],
  ['mat', 'Proteção', 'IDR bipolar 25 A', 'un', 18000],
  ['mat', 'Proteção', 'DPS classe II 175 V 20 kA', 'un', 5000],
  ['mat', 'Proteção', 'Quadro para 6 disjuntores', 'un', 6500],
  ['mat', 'Proteção', 'Quadro para 18 disjuntores', 'un', 18000],
  ['mat', 'Proteção', 'Quadro para 24 disjuntores', 'un', 26000],
  ['mat', 'Proteção', 'Quadro de sobrepor', 'un', 9000],
  ['mat', 'Proteção', 'Barramento pente monopolar', 'un', 2500],
  ['mat', 'Proteção', 'Barramento de neutro e terra', 'un', 1500],
  ['mat', 'Proteção', 'Trilho DIN', 'm', 1200],
  ['mat', 'Proteção', 'Tampa cega para quadro', 'un', 400],
  ['mat', 'Proteção', 'Caixa de medição monofásica', 'un', 15000],
  ['mat', 'Proteção', 'Caixa de medição bifásica', 'un', 22000],
  ['mat', 'Aterramento', 'Haste de aterramento 2,4 m', 'un', 4500],
  ['mat', 'Aterramento', 'Conector para haste', 'un', 800],
  ['mat', 'Aterramento', 'Caixa de inspeção de aterramento', 'un', 3000],
  ['mat', 'Aterramento', 'Barra de equipotencialização BEP', 'un', 6000],
  ['mat', 'Aterramento', 'Cordoalha de cobre', 'm', 2000],
  ['mat', 'Iluminação', 'Lâmpada LED 12 W', 'un', 1200],
  ['mat', 'Iluminação', 'Lâmpada LED 15 W', 'un', 1600],
  ['mat', 'Iluminação', 'Lâmpada tubular LED 18 W', 'un', 2500],
  ['mat', 'Iluminação', 'Lâmpada LED bulbo 30 W', 'un', 4500],
  ['mat', 'Iluminação', 'Plafon LED 24 W', 'un', 6000],
  ['mat', 'Iluminação', 'Painel LED embutido 18 W', 'un', 5500],
  ['mat', 'Iluminação', 'Spot direcionável', 'un', 4500],
  ['mat', 'Iluminação', 'Fita de LED 5 m', 'un', 6000],
  ['mat', 'Iluminação', 'Fonte para fita de LED', 'un', 5000],
  ['mat', 'Iluminação', 'Perfil de alumínio para LED de 2 m', 'barra', 4000],
  ['mat', 'Iluminação', 'Refletor LED 50 W', 'un', 7000],
  ['mat', 'Iluminação', 'Refletor LED 100 W', 'un', 12000],
  ['mat', 'Iluminação', 'Luminária de emergência', 'un', 3500],
  ['mat', 'Iluminação', 'Sensor de presença de teto', 'un', 4000],
  ['mat', 'Iluminação', 'Relé fotocélula', 'un', 3000],
  ['mat', 'Iluminação', 'Arandela', 'un', 6000],
  ['mat', 'Iluminação', 'Soquete E27', 'un', 500],
  ['mat', 'Iluminação', 'Driver para LED', 'un', 3500],
  ['mat', 'Aparelhos', 'Chuveiro elétrico 220 V', 'un', 9000],
  ['mat', 'Aparelhos', 'Resistência para chuveiro', 'un', 2500],
  ['mat', 'Aparelhos', 'Torneira elétrica', 'un', 15000],
  ['mat', 'Aparelhos', 'Campainha', 'un', 4000],
  ['mat', 'Aparelhos', 'Ventilador de teto', 'un', 25000],
  ['mat', 'Aparelhos', 'Exaustor', 'un', 9000],
  ['mat', 'Aparelhos', 'Interfone', 'un', 20000],
  ['mat', 'Automação e comando', 'Contator', 'un', 9000],
  ['mat', 'Automação e comando', 'Relé de impulso', 'un', 8000],
  ['mat', 'Automação e comando', 'Temporizador digital', 'un', 9000],
  ['mat', 'Automação e comando', 'Minuteria', 'un', 4000],
  ['mat', 'Automação e comando', 'Interruptor inteligente Wi-Fi', 'un', 9000],
  ['mat', 'Automação e comando', 'Tomada inteligente Wi-Fi', 'un', 7000],
  ['mat', 'Automação e comando', 'Botoeira liga e desliga', 'un', 4000],
  ['mat', 'Automação e comando', 'Chave boia', 'un', 4000],
  ['mat', 'Conexões e terminais', 'Conector de emenda Wago de 2 vias', 'un', 250],
  ['mat', 'Conexões e terminais', 'Conector de emenda Wago de 3 vias', 'un', 300],
  ['mat', 'Conexões e terminais', 'Conector de emenda Wago de 5 vias', 'un', 400],
  ['mat', 'Conexões e terminais', 'Terminal tubular, 100 peças', 'pct', 1500],
  ['mat', 'Conexões e terminais', 'Terminal olhal, 100 peças', 'pct', 2500],
  ['mat', 'Conexões e terminais', 'Terminal forquilha, 100 peças', 'pct', 2500],
  ['mat', 'Conexões e terminais', 'Conector split bolt', 'un', 1200],
  ['mat', 'Conexões e terminais', 'Borne de passagem', 'un', 600],
  ['mat', 'Conexões e terminais', 'Conector de derivação perfurante', 'un', 1500],
  ['mat', 'Fixação e acabamento', 'Bucha e parafuso 6 mm, 100 peças', 'pct', 1500],
  ['mat', 'Fixação e acabamento', 'Bucha e parafuso 8 mm, 100 peças', 'pct', 2000],
  ['mat', 'Fixação e acabamento', 'Abraçadeira de nylon, 100 peças', 'pct', 1200],
  ['mat', 'Fixação e acabamento', 'Abraçadeira com base adesiva, 100 peças', 'pct', 2500],
  ['mat', 'Fixação e acabamento', 'Espaguete termorretrátil', 'm', 300],
  ['mat', 'Fixação e acabamento', 'Fita isolante de alta fusão', 'un', 2500],
  ['mat', 'Fixação e acabamento', 'Fita isolante colorida', 'kit', 2500],
  ['mat', 'Fixação e acabamento', 'Massa de calafetar', 'un', 1500],
  ['mat', 'Fixação e acabamento', 'Gesso 1 kg', 'saco', 600],
  ['mat', 'Fixação e acabamento', 'Massa corrida', 'galão', 4500],
  ['mat', 'Fixação e acabamento', 'Identificador de cabos', 'kit', 2000],
  // catálogo 8 (2.22): revisão completa
  ['svc', 'Chuveiro e aparelhos', 'Instalação de carregador de veículo elétrico', 'un', 150000],
  ['svc', 'Tomadas e interruptores', 'Instalação de interruptor ou tomada inteligente', 'un', 20000],
  ['svc', 'Laudos e manutenção', 'Inspeção de SPDA e para-raios', 'un', 45000],
  ['svc', 'Laudos e manutenção', 'Ensaio de resistência de isolamento', 'un', 25000],
  ['svc', 'Laudos e manutenção', 'Projeto elétrico residencial', 'vb', 150000],
  ['mat', 'Cabos', 'Cabo flexível 35 mm²', 'm', 5200],
  ['mat', 'Cabos', 'Cabo flexível 50 mm²', 'm', 7200],
  ['mat', 'Cabos', 'Cabo flexível 1,5 mm², rolo de 100 m', 'rolo', 17000],
  ['mat', 'Cabos', 'Cabo flexível 2,5 mm², rolo de 100 m', 'rolo', 25000],
  ['mat', 'Cabos', 'Cabo flexível 4 mm², rolo de 100 m', 'rolo', 40000],
  ['mat', 'Cabos', 'Cabo flexível 6 mm², rolo de 100 m', 'rolo', 60000],
  ['mat', 'Cabos', 'Cabo PP 2 x 2,5 mm²', 'm', 900],
  ['mat', 'Cabos', 'Cabo solar 4 mm²', 'm', 700],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto corrugado reforçado 3/4"', 'm', 350],
  ['mat', 'Eletrodutos e caixas', 'Curva PVC 1"', 'un', 600],
  ['mat', 'Eletrodutos e caixas', 'Luva PVC 1"', 'un', 300],
  ['mat', 'Proteção', 'DR bipolar 25 A 30 mA', 'un', 14000],
  ['mat', 'Proteção', 'IDR tetrapolar 40 A 30 mA', 'un', 32000],
  ['mat', 'Proteção', 'Quadro para 36 disjuntores', 'un', 42000],
  ['mat', 'Iluminação', 'Painel LED embutido 24 W', 'un', 7000],
  ['mat', 'Aparelhos', 'Chuveiro elétrico 127 V', 'un', 9000],
  ['mat', 'Aparelhos', 'Carregador de veículo elétrico 7,4 kW', 'un', 350000],
  // 2.1: catálogo revisado para o eletricista predial de baixa tensão: sem rede, antena, câmera, alarme e cerca; itens novos
  ['svc', 'Tomadas e interruptores', 'Instalação de tomada dupla ou tripla', 'un', 7500],
  ['svc', 'Tomadas e interruptores', 'Instalação de conjunto de interruptor e tomada', 'un', 8000],
  ['svc', 'Tomadas e interruptores', 'Instalação de tomada industrial', 'un', 13000],
  ['svc', 'Tomadas e interruptores', 'Instalação de tomada de sobrepor com canaleta', 'un', 8000],
  ['svc', 'Tomadas e interruptores', 'Instalação de interruptor intermediário four-way', 'un', 9000],
  ['svc', 'Iluminação', 'Troca de lâmpada', 'un', 1500],
  ['svc', 'Iluminação', 'Instalação de luminária tubular LED', 'un', 9500],
  ['svc', 'Iluminação', 'Instalação de painel de LED', 'un', 7000],
  ['svc', 'Iluminação', 'Instalação de minuteria', 'un', 11000],
  ['svc', 'Iluminação', 'Instalação de relé de impulso', 'un', 17500],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de ventilador de parede', 'un', 11500],
  ['svc', 'Chuveiro e aparelhos', 'Circuito exclusivo para chuveiro', 'un', 28000],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de chave boia', 'un', 15500],
  ['svc', 'Chuveiro e aparelhos', 'Instalação de pressurizador', 'un', 18000],
  ['svc', 'Chuveiro e aparelhos', 'Troca de tensão de aparelho ou circuito, 127 V para 220 V', 'un', 15000],
  ['svc', 'Quadro e proteção', 'Instalação de barramento pente', 'un', 8500],
  ['svc', 'Quadro e proteção', 'Instalação de barramento de neutro e terra', 'un', 11000],
  ['svc', 'Quadro e proteção', 'Troca de fusíveis por disjuntores', 'un', 25000],
  ['svc', 'Quadro e proteção', 'Montagem de quadro de comando de bomba', 'un', 45000],
  ['svc', 'Fiação e infraestrutura', 'Alimentação do medidor ao quadro de distribuição', 'un', 25000],
  ['svc', 'Fiação e infraestrutura', 'Alimentação de motor', 'un', 32500],
  ['svc', 'Fiação e infraestrutura', 'Instalação de caixa de passagem', 'un', 6000],
  ['svc', 'Fiação e infraestrutura', 'Emenda e isolação de cabos', 'un', 3000],
  ['svc', 'Visita e diagnóstico', 'Identificação de circuitos', 'un', 20000],
  ['svc', 'Visita e diagnóstico', 'Teste de tomadas e de polaridade', 'un', 12000],
  ['mat', 'Cabos', 'Cabo de cobre nu 10 mm²', 'm', 1600],
  ['mat', 'Cabos', 'Cabo paralelo 2 x 2,5 mm²', 'm', 600],
  ['mat', 'Cabos', 'Cabo PP 3 x 4 mm²', 'm', 2000],
  ['mat', 'Eletrodutos e caixas', 'Eletroduto corrugado 1 1/4"', 'm', 500],
  ['mat', 'Eletrodutos e caixas', 'Canaleta 50 x 20 mm de 2 m', 'barra', 3000],
  ['mat', 'Eletrodutos e caixas', 'Abraçadeira tipo D 1"', 'un', 150],
  ['mat', 'Eletrodutos e caixas', 'Caixa de passagem 15 x 15', 'un', 2500],
  ['mat', 'Eletrodutos e caixas', 'Prensa-cabo', 'un', 500],
  ['mat', 'Eletrodutos e caixas', 'Curva para eletroduto metálico 3/4"', 'un', 1400],
  ['mat', 'Tomadas e interruptores', 'Placa cega 4x2', 'un', 500],
  ['mat', 'Tomadas e interruptores', 'Conjunto de interruptor simples e tomada 10 A', 'un', 2600],
  ['mat', 'Tomadas e interruptores', 'Tomada tripla 10 A com placa', 'un', 3600],
  ['mat', 'Tomadas e interruptores', 'Interruptor bipolar 25 A com placa', 'un', 3800],
  ['mat', 'Tomadas e interruptores', 'Tomada industrial 3P+T 32 A', 'un', 7000],
  ['mat', 'Tomadas e interruptores', 'Plugue macho 20 A', 'un', 800],
  ['mat', 'Proteção', 'Disjuntor tripolar 40 a 63 A', 'un', 14000],
  ['mat', 'Proteção', 'Barramento pente bipolar', 'un', 4500],
  ['mat', 'Proteção', 'Barramento pente tripolar', 'un', 7000],
  ['mat', 'Proteção', 'DPS classe I e II 275 V 45 kA', 'un', 12000],
  ['mat', 'Proteção', 'DR tetrapolar 63 A 30 mA', 'un', 32000],
  ['mat', 'Proteção', 'Interruptor seccionador bipolar 40 A', 'un', 6000],
  ['mat', 'Iluminação', 'Lâmpada dicroica LED GU10', 'un', 1500],
  ['mat', 'Iluminação', 'Lâmpada tubular LED 9 W de 60 cm', 'un', 1800],
  ['mat', 'Iluminação', 'Luminária tubular LED de sobrepor 36 W', 'un', 8000],
  ['mat', 'Iluminação', 'Balizador de jardim', 'un', 6000],
  ['mat', 'Iluminação', 'Sensor de presença de parede', 'un', 4500],
  ['mat', 'Iluminação', 'Plafon de sobrepor com soquete E27', 'un', 2000],
  ['mat', 'Fixação e acabamento', 'Parafusos para placa e caixa, 100 peças', 'pct', 1800],
  ['mat', 'Fixação e acabamento', 'Bucha para drywall, 50 peças', 'pct', 2500],
  ['mat', 'Fixação e acabamento', 'Arame galvanizado', 'kg', 2500],
  ['mat', 'Aterramento', 'Haste de aterramento 3 m', 'un', 6000],
  ['mat', 'Aterramento', 'Terminal de pressão para aterramento', 'un', 800],
  ['mat', 'Aparelhos', 'Ventilador de parede', 'un', 20000],
  ['mat', 'Aparelhos', 'Pressurizador', 'un', 45000],
  ['mat', 'Automação e comando', 'Relé térmico', 'un', 9000],
  ['mat', 'Automação e comando', 'Disjuntor motor', 'un', 18000],
  ['mat', 'Automação e comando', 'Sinaleiro LED', 'un', 1500],
  ['mat', 'Automação e comando', 'Chave seletora', 'un', 3000],
  ['mat', 'Automação e comando', 'Relé de nível', 'un', 12000],
  ['mat', 'Automação e comando', 'Programador horário', 'un', 6000],
  ['mat', 'Conexões e terminais', 'Conector de torção, 100 peças', 'pct', 3000],
  ['mat', 'Conexões e terminais', 'Conector de porcelana', 'un', 600],
  ['mat', 'Conexões e terminais', 'Barra de conectores sindal de 12 polos', 'un', 800],
  ['mat', 'Conexões e terminais', 'Luva de emenda a compressão', 'un', 300],
  ['mat', 'Conexões e terminais', 'Terminal de compressão 16 a 50 mm²', 'un', 800],
  ['mat', 'Conexões e terminais', 'Conector MC4, par', 'un', 1200],
];
const catOrder = kind => [...new Set(SEED.filter(s => s[0] === kind).map(s => s[1])), 'Outros'];
// itens que entraram depois da primeira tabela (são acrescentados em quem já usa o app)
// 2.15: tudo o que ainda não está na tabela entra (por nome), sem mexer nos itens e preços de quem já usa
/* composição por serviço (F5): o material que costuma ir em cada unidade do serviço. Sugestão editável: o app oferece
   ao adicionar o serviço e cada um ajusta na tabela de preços. Quantidades médias de obra residencial. */
const COMPOSICAO = {
  'Ponto novo de tomada com fiação': [['Caixa 4x2', 1], ['Tomada 10 A com placa', 1], ['Cabo flexível 2,5 mm²', 12], ['Eletroduto corrugado 3/4"', 4]],
  'Ponto de iluminação novo com fiação': [['Caixa octogonal 4x4 de laje', 1], ['Caixa 4x2', 1], ['Interruptor simples com placa', 1], ['Cabo flexível 1,5 mm²', 12], ['Eletroduto corrugado 3/4"', 4]],
  'Ponto de interruptor paralelo three-way': [['Caixa 4x2', 2], ['Interruptor paralelo three-way com placa', 2], ['Cabo flexível 1,5 mm²', 15], ['Eletroduto corrugado 3/4"', 6]],
  'Tomada de uso específico 20 A': [['Tomada 20 A com placa', 1]],
  'Ponto de tomada externa à prova de tempo': [['Caixa de sobrepor 4x2', 1], ['Tomada 10 A com placa', 1], ['Cabo flexível 2,5 mm²', 10], ['Eletroduto rígido PVC 3/4" de 3 m', 1]],
  'Ponto e circuito para ar-condicionado': [['Caixa 4x2', 1], ['Tomada 20 A com placa', 1], ['Disjuntor bipolar 10 a 32 A', 1], ['Cabo flexível 4 mm²', 30], ['Eletroduto corrugado 3/4"', 10]],
  'Instalação de máquina de lavar com ponto exclusivo': [['Caixa 4x2', 1], ['Tomada 20 A com placa', 1], ['Disjuntor monopolar 10 a 32 A', 1], ['Cabo flexível 2,5 mm²', 30], ['Eletroduto corrugado 3/4"', 10]],
  'Instalação ou troca de disjuntor': [['Disjuntor monopolar 10 a 32 A', 1]],
  'Instalação de DR': [['DR bipolar 40 A 30 mA', 1]],
  'Instalação de IDR': [['IDR bipolar 25 A', 1]],
  'Instalação de DPS': [['DPS classe II 275 V 20 kA', 1], ['Cabo flexível 10 mm²', 1]],
  'Aterramento com haste e conexões': [['Haste de aterramento 2,4 m', 1], ['Conector para haste', 1], ['Caixa de inspeção de aterramento', 1], ['Cabo de cobre nu 16 mm²', 5]],
  'Montagem de quadro de distribuição': [['Quadro para 12 disjuntores', 1], ['Barramento pente monopolar', 1], ['Barramento de neutro e terra', 2], ['Disjuntor monopolar 10 a 32 A', 8]],
  'Troca da fiação de um circuito': [['Cabo flexível 2,5 mm²', 30], ['Conector de emenda Wago de 2 vias', 4]],
  'Circuito exclusivo para chuveiro': [['Disjuntor bipolar 40 a 63 A', 1], ['Cabo flexível 6 mm²', 30], ['Eletroduto corrugado 1"', 10]],
  'Instalação de tomada dupla ou tripla': [['Tomada dupla 10 A com placa', 1]],
  'Instalação de conjunto de interruptor e tomada': [['Conjunto de interruptor simples e tomada 10 A', 1]],
  'Instalação de carregador de veículo elétrico': [['Disjuntor bipolar 40 a 63 A', 1], ['DR bipolar 63 A 30 mA', 1], ['Cabo flexível 10 mm²', 30], ['Eletroduto corrugado 1"', 10]],
};
const compDe = name => (COMPOSICAO[name] || []).map(([n, q]) => ({ n, q }));
const seedPrices = () => SEED.map(([kind, cat, name, unit, price]) => ({ id: uid(), kind, cat, name, unit, price, ref: true, ...(kind === 'svc' && COMPOSICAO[name] ? { comp: compDe(name) } : {}) }));
/* preços de fábrica: os que vêm com o app aparecem em cinza; qualquer mudança no valor (no item, na caixa do material
   ou no reajuste) deixa o preço em preto. O leitor de tela diz "preço que vem com o app" e a nota no fim de Preços
   explica o cinza (informação nunca só pela cor). O cinza não chega ao contraste AA: exceção no README. */
const refV = v => `<span class="ref-v">${v}<span class="sr-only">, preço que vem com o app</span></span>`;
const refLinha = i => prices.some(p => p.ref && p.kind === i.kind && norm(p.name) === norm(i.name) && p.price === i.price);

/* ================= dados (tudo guardado neste aparelho) ================= */
const KEY = 'eletricafacil.';
let semSalvar = false; // o guia roda numa demonstração que não grava nada (Código, Art. 78, I)
const LS = {
  get(k, d) { try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { if (semSalvar) return true; try { localStorage.setItem(KEY + k, JSON.stringify(v)); return true; } catch { return false; } },
};
/* Versão 3: os dados começam limpos (Regras do app, Art. 6º). O que as versões anteriores guardaram neste aparelho é
   apagado uma vez, junto com a ligação da sincronização antiga; só a preferência de tema fica. Dado antigo não trava o app. */
const FORMATO = '3';
(() => {
  try {
    if (localStorage.getItem(KEY + 'formato') === FORMATO) return;
    const tema = localStorage.getItem(KEY + 'pref');
    Object.keys(localStorage).filter(k => k.startsWith(KEY) || k.startsWith('kitfacil.eletrica-facil.')).forEach(k => localStorage.removeItem(k));
    if (tema) localStorage.setItem(KEY + 'pref', tema);
    localStorage.setItem(KEY + 'formato', FORMATO);
  } catch {}
})();
const ACCEPT_DEFAULT = 'Ao aprovar este orçamento, o cliente concorda com os serviços, valores e condições descritos. A aprovação pode ser feita por assinatura ou por mensagem escrita, no WhatsApp ou no e-mail.';
const WARRANTY_DEFAULT = 'A garantia cobre falhas no serviço executado. Não cobre: mau uso; alterações feitas por terceiros; sobrecarga causada por equipamentos ligados depois do serviço; surtos de tensão, descargas atmosféricas e falhas da rede da concessionária; e materiais fornecidos pelo cliente, que seguem a garantia do fabricante. Esta garantia não exclui os direitos previstos no Código de Defesa do Consumidor.';
const DEF = { toolSeedV: 0, name: '', company: '', phone: '', email: '', doc: '', registro: '', city: '', pix: '', logo: '', logoRatio: 1,
  taxMode: 'sem', taxPct: 5, taxBase: 'servico',
  validity: 15, warranty: 90, prazoN: 1, prazoU: 'uteis', payMode: 'entrada', entryPct: 50, installments: 3, notes: '',
  // cartão: tipo de juros, taxa da maquininha por parcelamento (em %), juros ao mês, sem juros até N× e quem paga a taxa
  cardJuros: 'sem', cardRates: {}, cardMes: 0, cardSemAte: 0, cardPaga: 'cliente', avistaPct: 0, seq: 0,
  kmPerL: 0, fuelPrice: 0, wearPerKm: 0, hourRate: 0, minVisit: 0, roundTrip: true,
  surUrgent: 0, surNight: 0, surWeekend: 0, seedV: 0,
  acceptText: ACCEPT_DEFAULT, warrantyTerms: WARRANTY_DEFAULT };
const STATUS = { rascunho: 'Rascunho', enviado: 'Enviado', aprovado: 'Aprovado', concluido: 'Concluído', recusado: 'Recusado' };

let settings = { ...DEF, ...LS.get('settings', {}) };
let prices = LS.get('prices', null);
let quotes = LS.get('quotes', null);
// gestão: ferramentas (as que tem e as que quer comprar) e checklist fixo de ida e volta da obra
// o estoque de material fica na própria tabela de preços (campos stock, cost e brand dos materiais)
let tools = LS.get('tools', []);
let checks = LS.get('checks', []);
// sincronização entre aparelhos: motor comum do Kit Fácil (a regra de junção dos dados fica mais abaixo)
// o que mudou em cada versão, para quem usa (as mesmas linhas do CHANGELOG: Código, Art. 25, I)
const NOVIDADES = [{ versao: '3.0.0', itens: [
  'Elétrica Fácil refeito: o orçamento agora é montado na própria folha que o cliente recebe. O que é tracejado é só seu e não sai no documento.',
  'O botão amarelo do pé é sempre o próximo passo: Enviar, Aprovou, Concluir, Receber e Recibo.',
  'Orçamentos abre o app, num quadro por etapa: rascunhos, esperando resposta, para executar e para receber.',
  'Navegação nova: Orçamentos, Tabela, o botão de novo orçamento no centro, Obra e Mais. A antiga Gestão virou Obra: Levar, Comprar, Estoque e Ferramentas.',
  'Mudou um preço numa linha do orçamento? Dá para guardar na tabela ali mesmo.',
  'Apresentação nova, sem pedir o seu nome: ele fica em Ajustes, Conta e perfil.',
  'O raio de surpresa ficou mais parecido com um raio de verdade. A tempestade saiu.',
  'Esta versão começa limpa: os orçamentos, preços e ajustes guardados pelas versões anteriores neste aparelho foram apagados.',
] }];
// quem ainda vai ver a apresentação não recebe a janela de Novidades do Kit: nem por cima dela, nem antes (o Kit olha 0,7 s
// depois de começar, e numa internet lenta o resto do app ainda está chegando). É o que o Conta Fácil faz.
if (String(LS.get('abertura', '')) !== '1' && !(navigator.webdriver && !window.EF_TESTE_ABERTURA)) { try { localStorage.setItem('kitfacil.eletrica-facil.visto', JSON.stringify(VERSAO)); } catch {} }
KitFacil.iniciar({
  app: 'eletrica-facil', nome: 'Elétrica Fácil', versao: VERSAO, icone: 'icons/icon-192.png',
  resumo: 'Orçamentos de elétrica prontos em minutos: serviços e materiais da sua tabela, deslocamento, adicionais, proposta em PDF ou WhatsApp com Pix, relatório e recibo.',
  tela: () => route().name, exemploDados: 'os orçamentos e os dados dos seus clientes',
  abrirAjustes: secao => { if (route().name !== 'settings') go('/ajustes'); else if (!secao) back('/'); },
  emAjustes: () => route().name === 'settings',
  novidades: [...NOVIDADES],
  ocupado: () => (typeof aberturaAtiva === 'function' && aberturaAtiva()) || (typeof guiaAtivo === 'function' && guiaAtivo()),
  copia: { descricao: 'Baixe um arquivo com os orçamentos, a tabela de preços, o estoque, as ferramentas e os ajustes.', baixar: () => baixarCopiaEletrica(), restaurar: f => restaurarCopiaEletrica(f) },
  privacidade: [
    'Os orçamentos, a tabela de preços, o estoque, as ferramentas, os ajustes e os dados dos clientes que você cadastra, como nome, telefone, endereço e CPF ou CNPJ, ficam guardados neste aparelho. Você é responsável por eles perante os seus clientes.',
    'Propostas, relatórios e recibos em PDF são feitos aqui no aparelho. Eles só saem quando você compartilha, pelo WhatsApp, por e-mail ou por outro app.',
  ],
});
KitFacil.tema.iniciar({ chave: 'eletricafacil.pref', cores: { claro: '#EFEEE9', escuro: '#0E0D0A' } });
const SY = KitFacil.sync.criar({
  app: 'eletrica-facil-3', nome: 'Elétrica Fácil', chave: 'eletricafacil.sync', // arquivo novo na nuvem: o formato das versões 1 e 2 não é lido nem devolvido
  dados: 'os mesmos orçamentos, preços, estoque, ferramentas e ajustes',
  aplicar: R => applyRemote(R), pacote: () => syncPayload(),
  mesmo: (out, remote) => canon(out) === canon({ settings: remote.settings, prices: remote.prices, quotes: remote.quotes, tools: remote.tools || [], checks: remote.checks || [], st: remote.st, del: remote.del }),
  redesenhar: () => rerender(),
  ocupado: () => semSalvar || KitFacil.dialogo.aberto() || !!(document.activeElement && document.activeElement.matches('input,textarea,select')),
  textoLigada: () => `Sincronização ligada. ${plural(quotes.filter(q => !q.example).length, 'orçamento', 'orçamentos')} neste aparelho.`,
});
const sync = SY.estado;
const saveSync = () => SY.salvar();
let SNAP = null;
const saveSettings = () => { stamp('settings'); return LS.set('settings', settings); };
const savePrices = () => { stamp('prices'); return LS.set('prices', prices); };
const saveTools = () => { stamp('tools'); if (!LS.set('tools', tools)) toast('Não foi possível salvar: o armazenamento do aparelho está cheio.'); };
const saveChecks = () => { stamp('checks'); if (!LS.set('checks', checks)) toast('Não foi possível salvar: o armazenamento do aparelho está cheio.'); };
const saveQuotes = () => { stamp('quotes'); const ok = LS.set('quotes', quotes); if (!ok) toast('Não foi possível salvar: o armazenamento do aparelho está cheio. Apague orçamentos antigos ou ligue a sincronização.'); marcaSalvo(ok); };
// "Salvo" no alto do orçamento: confirma, a cada mudança, que o que foi digitado ficou guardado no aparelho
function marcaSalvo(ok) {
  const el = document.getElementById('ab-saved'); if (!el) return;
  el.classList.toggle('falhou', !ok);
  el.innerHTML = ok ? `${I.check}<span>Salvo</span>` : `${I.warn}<span>Não salvo</span>`;
  el.setAttribute('aria-label', ok ? 'Alterações salvas neste aparelho' : 'Não foi possível salvar');
  el.classList.remove('agora'); void el.offsetWidth; el.classList.add('agora');
}

function blankQuote() {
  return { id: uid(), num: 0, createdAt: Date.now(), updatedAt: Date.now(),
    client: { name: '', phone: '', address: '', doc: '' }, title: '', items: [], materialBy: 'eu',
    startAt: null, endAt: null, dateTbd: false, approvedVia: '', days: 1, dates: [],
    travel: 0, discount: { mode: 'value', value: 0, pct: 0 },
    payment: { mode: settings.payMode, entryPct: settings.entryPct, installments: settings.installments, cardTipo: 'credito', juros: settings.cardJuros || 'sem', taxaPct: null, mesPct: settings.cardMes || 0, semAte: settings.cardSemAte || 0, paga: settings.cardPaga || 'cliente', avista: { mode: 'pct', pct: settings.avistaPct || 0, value: 0 }, outras: [] },
    validity: settings.validity, deadline: '', prazo: { n: Math.max(1, Math.min(99, settings.prazoN || 1)), u: PRAZO_U[settings.prazoU] ? settings.prazoU : 'uteis' }, warranty: settings.warranty, notes: settings.notes,
    status: 'rascunho', sentAt: null, approvedAt: null, doneAt: null, refusedAt: null, example: false,
    trip: null, extras: { urgent: 0, night: 0, weekend: 0 }, useRooms: false, rooms: [],
    tax: { mode: settings.taxMode || 'sem', pct: settings.taxPct ?? 5, base: settings.taxBase || 'servico' },
    diag: '', work: '', tests: [], recs: '', pagos: [] };
}
function fixQuote(q) {
  const d = blankQuote(), src = q || {};
  q = { ...d, ...src };
  q.client = { ...d.client, ...(q.client || {}) };
  q.payment = { ...d.payment, ...(q.payment || {}) };
  // orçamentos de antes da 2.15: cartão sem juros e sem desconto à vista (o total não muda)
  if (!src.payment || !('juros' in src.payment)) { q.payment.juros = 'sem'; q.payment.avista = { mode: 'pct', pct: 0, value: 0 }; }
  const pg = q.payment;
  pg.cardTipo = pg.cardTipo === 'debito' ? 'debito' : 'credito';
  pg.juros = ['sem', 'taxa', 'mes'].includes(pg.juros) ? pg.juros : 'sem';
  pg.paga = pg.paga === 'eu' ? 'eu' : 'cliente';
  pg.outras = (Array.isArray(pg.outras) ? pg.outras : []).filter(m => ['avista', 'entrada', 'parcelado'].includes(m));
  pg.installments = Math.max(1, Math.min(18, parseInt(pg.installments, 10) || 1));
  pg.avista = { mode: pg.avista && pg.avista.mode === 'value' ? 'value' : 'pct', pct: Math.max(0, Math.min(50, +(pg.avista && pg.avista.pct) || 0)), value: Math.max(0, +(pg.avista && pg.avista.value) || 0) };
  if (typeof q.travel !== 'number') q.travel = q.travel && q.travel.enabled ? (q.travel.value || 0) : 0;
  const ds = q.discount || {};
  q.discount = { mode: ds.mode === 'pct' ? 'pct' : 'value', value: ds.enabled === false ? 0 : (ds.value || 0), pct: ds.enabled === false ? 0 : (ds.pct || 0) };
  q.items = (q.items || []).map(i => ({ id: i.id || uid(), kind: i.kind === 'mat' ? 'mat' : 'svc', name: String(i.name || ''), unit: i.unit || 'un', qty: +i.qty || 1, price: Math.max(0, Math.round(+i.price || 0)), room: i.room ? String(i.room) : '' }));
  q.extras = { urgent: 0, night: 0, weekend: 0, ...(q.extras || {}) };
  q.pagos = (Array.isArray(q.pagos) ? q.pagos : []).filter(x => x && x.v > 0).map(x => ({ id: x.id || uid(), v: Math.round(+x.v), t: +x.t || Date.now() }));
  // orçamentos de antes do imposto (F6) continuam sem imposto: o total deles não muda
  q.tax = src.tax ? taxOf(src) : { mode: 'sem', pct: 5, base: 'servico' };
  q.rooms = (Array.isArray(q.rooms) ? q.rooms : []).filter(r => r && r.id).map(r => ({ id: String(r.id), name: String(r.name || 'Ambiente') }));
  q.useRooms = !!q.useRooms;
  acertaGeral(q);
  q.trip = q.trip && typeof q.trip === 'object' ? q.trip : null;
  ['diag', 'work', 'recs'].forEach(k => { q[k] = String(q[k] || ''); });
  q.tests = Array.isArray(q.tests) ? q.tests.map(String).filter(Boolean) : [];
  if (!STATUS[q.status]) q.status = 'rascunho';
  // dias de serviço: lista de dias marcados (podem não ser seguidos); versões antigas só tinham início e término
  q.dates = [...new Set((Array.isArray(q.dates) ? q.dates : []).map(dayTs).filter(Boolean))].sort((a, b) => a - b);
  if (!q.dates.length && q.startAt) {
    const a = dayTs(q.startAt), b = dayTs(q.endAt || q.startAt);
    if (a && b && b >= a && (b - a) / DAY < 62) for (let t = a; t <= b + DAY / 2; t = dayTs(t + DAY)) q.dates.push(t);
  }
  if (!q.dates.length && q.status === 'concluido' && q.doneAt) q.dates = [dayTs(q.doneAt)];
  q.days = Math.max(1, Math.min(99, parseInt(q.days, 10) || q.dates.length || 1));
  // prazo de execução: quantidade e unidade (versões antigas tinham só o texto livre ou a quantidade de dias)
  // (a 2.10 gravou 1 dia útil por engano em orçamentos que tinham o prazo em texto: o texto, se diferente, vale)
  const doTexto = prazoDeTexto(src.deadline), salvo = src.prazo && typeof src.prazo === 'object' ? src.prazo : null;
  const engano = salvo && salvo.n === 1 && salvo.u === 'uteis' && doTexto && src.deadline !== prazoTxt(salvo);
  const pz = (!engano && salvo) || doTexto || (q.dates.length > 1 || q.days > 1 ? { n: q.days, u: 'corridos' } : null) || d.prazo;
  q.prazo = { n: Math.max(1, Math.min(99, parseInt(pz.n, 10) || 1)), u: PRAZO_U[pz.u] ? pz.u : 'uteis' };
  ['isExample', 'active', 'savedAt', 'closedAt', 'total', 'statusAt'].forEach(k => delete q[k]);
  return q;
}
// ferramentas: tipos (k: 'tipo', do catálogo ou criados pelo usuário) e as unidades que o usuário tem (k: 'item'),
// cada uma com marca, modelo e quantidade (dá para ter várias do mesmo tipo, de marcas ou modelos diferentes)
const fixTipo = t => ({ id: String(t.id || uid()), k: 'tipo', name: String(t.name || '').trim(), cat: String(t.cat || 'Outras').trim() || 'Outras', seed: !!t.seed, quero: !!t.quero, queroQtd: Math.max(1, Math.min(999, Math.round(+t.queroQtd || 1))) });
const fixItem = t => ({ id: String(t.id || uid()), k: 'item', tipo: String(t.tipo || ''), brand: String(t.brand || '').trim(), model: String(t.model || '').trim(), qty: Math.max(1, Math.min(999, Math.round(+t.qty || 1))) });
// lê a lista em qualquer formato (a 2.9 a 2.11 guardavam uma ferramenta por linha, com st ou wish)
function normTools(L) {
  return (Array.isArray(L) ? L : []).flatMap(t => {
    if (!t) return [];
    if (t.k === 'tipo') return [fixTipo(t)];
    if (t.k === 'item') return t.tipo ? [fixItem(t)] : [];
    const st = ['tenho', 'quero', 'nao'].includes(t.st) ? t.st : t.wish ? 'quero' : 'tenho';
    const tipo = fixTipo({ ...t, quero: st === 'quero', queroQtd: t.qty });
    return st === 'tenho' ? [tipo, fixItem({ id: tipo.id + '-1', tipo: tipo.id, brand: t.brand, qty: t.qty })] : [tipo];
  });
}
const tiposTool = () => tools.filter(t => t.k === 'tipo');
const itensDe = id => tools.filter(t => t.k === 'item' && t.tipo === id);
const tipoDe = it => tools.find(t => t.k === 'tipo' && t.id === it.tipo);
const temTool = t => itensDe(t.id).length > 0;
const itemTxt = it => [it.brand, it.model].filter(Boolean).join(' · ');
// ferramentas que já vêm no app (ids fixos: o mesmo item em todos os aparelhos sincronizados)
const TOOL_SEED = [
  ['Medição e teste', ['Multímetro digital', 'Alicate amperímetro', 'Caneta detectora de tensão', 'Testador de tomadas', 'Megôhmetro', 'Terrômetro', 'Sequencímetro de fase', 'Detector de tensão por aproximação']],
  ['Alicates', ['Alicate universal', 'Alicate de corte diagonal', 'Alicate de bico', 'Alicate desencapador', 'Alicate crimpador de terminais', 'Alicate para terminal tubular', 'Alicate de pressão']],
  ['Chaves', ['Jogo de chaves de fenda isoladas', 'Jogo de chaves Phillips isoladas', 'Chave de teste', 'Jogo de chaves Allen', 'Jogo de chaves combinadas', 'Chave inglesa', 'Jogo de chaves Torx']],
  ['Furação e corte', ['Furadeira de impacto', 'Parafusadeira a bateria', 'Martelete rompedor', 'Jogo de brocas', 'Jogo de serras copo', 'Serra tico-tico', 'Esmerilhadeira', 'Arco de serra', 'Estilete']],
  ['Passagem de fios', ['Passa-fio de aço', 'Passa-fio de nylon', 'Puxador de cabos']],
  ['Instalação e acabamento', ['Trena', 'Nível', 'Esquadro', 'Martelo', 'Talhadeira', 'Ponteiro', 'Ferro de solda', 'Soprador térmico', 'Lanterna de cabeça', 'Caixa de ferramentas']],
  ['Acesso', ['Escada de 6 degraus', 'Escada extensível', 'Andaime']],
  ['Segurança e EPI', ['Luvas isolantes', 'Óculos de proteção', 'Capacete com jugular', 'Botina de segurança sem metal', 'Cinto de segurança com talabarte', 'Protetor auricular', 'Kit de bloqueio e etiquetagem']],
  // 2.15: catálogo ampliado
  ['Medição e teste', ['Alicate wattímetro', 'Analisador de qualidade de energia', 'Termômetro infravermelho', 'Câmera termográfica', 'Luxímetro', 'Testador de DR', 'Detector de cabos na parede']],
  ['Alicates', ['Alicate de bico curvo', 'Alicate rebitador', 'Alicate decapador automático', 'Alicate de corte para cabos', 'Alicate prensa-terminal hidráulico']],
  ['Chaves', ['Chave de boca', 'Jogo de soquetes', 'Chave canhão', 'Chave catraca', 'Chave de fenda de toco', 'Torquímetro']],
  ['Furação e corte', ['Furadeira de bancada', 'Serra mármore', 'Serra circular', 'Cortador de tubos', 'Jogo de brocas de vídia', 'Jogo de brocas para metal', 'Broca de serra copo para drywall', 'Rasgadeira de parede', 'Tesoura para chapa']],
  ['Passagem de fios', ['Guia passa-cabos de fibra', 'Lubrificante para passagem de cabos', 'Sonda passa-fio com rolo']],
  ['Instalação e acabamento', ['Nível a laser', 'Prumo', 'Lima', 'Espátula', 'Desempenadeira', 'Pistola de cola quente', 'Grampeador de pressão', 'Marcador permanente', 'Lápis de carpinteiro', 'Fita métrica de aço longa', 'Bolsa porta-ferramentas', 'Maleta organizadora']],
  ['Acesso', ['Escada de 8 degraus', 'Escada de fibra isolante', 'Plataforma de trabalho', 'Cavalete']],
  ['Segurança e EPI', ['Luvas de vaqueta', 'Manga isolante', 'Tapete isolante', 'Protetor facial', 'Máscara contra poeira', 'Vara de manobra', 'Placas de sinalização', 'Detector de tensão por contato']],
  // 2.1: o que faltava na bolsa do eletricista predial
  ['Medição e teste', ['Lâmpada de teste', 'Alicate terrômetro']],
  ['Alicates', ['Alicate bomba d\'água']],
  ['Chaves', ['Chave de grifo', 'Chave universal para quadros']],
  ['Furação e corte', ['Jogo de brocas escalonadas', 'Jogo de brocas chatas para madeira', 'Dobrador de eletroduto', 'Tarraxa para eletroduto', 'Aspirador de pó de obra']],
  ['Instalação e acabamento', ['Faca de eletricista', 'Linha de marcar com giz', 'Colher de pedreiro', 'Régua de alumínio']],
  ['Segurança e EPI', ['Luvas de cobertura para luva isolante', 'Vestimenta antichama', 'Cone de sinalização', 'Fita zebrada']],
  ['Elétrica e energia', ['Extensão de obra', 'Carretel de extensão', 'Gerador portátil', 'Lanterna recarregável', 'Refletor de obra', 'Carregador de baterias']],
];
const TOOL_CATS = [...new Set(TOOL_SEED.map(x => x[0]))];
const seedTools = () => TOOL_SEED.flatMap(([cat, L]) => L.map(name => fixTipo({ id: 'ft-' + fold(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name, cat, st: 'nao', seed: true })));
const fixCheck = c => ({ id: String(c.id || uid()), name: String(c.name || '').trim(), back: c.back !== false, ida: !!c.ida, volta: !!c.volta, toolId: c.toolId ? String(c.toolId) : '' });
// material do estoque: quantidade, custo e marca ficam no próprio item da tabela de preços
const inStock = p => p.kind === 'mat' && typeof p.stock === 'number';
// material em estoque por marca (lotes: { id, brand, qty, cost }); stock, cost e brand do item são o resumo das marcas
// (stock = soma, cost = média ponderada, brand = a marca com mais), para a tabela, os orçamentos e versões antigas
function acertaLotes(p) {
  if (!p || p.kind !== 'mat') return p;
  if (!Array.isArray(p.lotes) && typeof p.stock === 'number') p.lotes = [{ id: p.id + '-1', brand: p.brand || '', qty: p.stock, cost: p.cost || 0 }];
  if (!Array.isArray(p.lotes)) return p;
  // aparelho com versão antiga mudou só a quantidade: com uma marca só, a marca acompanha
  if (p.lotes.length === 1 && typeof p.stock === 'number' && p.stock !== p.lotes[0].qty && p._st === p.lotes[0].qty) p.lotes[0].qty = p.stock;
  p.lotes = p.lotes.filter(l => l && typeof l.qty === 'number').map(l => ({ id: String(l.id || uid()), brand: String(l.brand || '').trim(), qty: Math.max(0, Math.round(l.qty * 100) / 100), cost: Math.max(0, Math.round(+l.cost || 0)) }));
  if (!p.lotes.length) { delete p.lotes; delete p.stock; delete p.cost; delete p.brand; delete p._st; return p; }
  const tot = sum(p.lotes.map(l => l.qty)), cc = p.lotes.filter(l => l.cost);
  p.stock = Math.round(tot * 100) / 100;
  p.cost = cc.length ? Math.round(sum(cc.map(l => l.cost * (l.qty || 1))) / (sum(cc.map(l => l.qty || 1)) || 1)) : 0;
  const top = [...p.lotes].sort((a, b) => b.qty - a.qty)[0];
  if (top.brand) p.brand = top.brand; else delete p.brand;
  p._st = p.stock;
  return p;
}
// estoque baixo: chegou ao mínimo que o usuário escolheu (ou acabou)
// baixa e devolução por marca: sai primeiro da marca que entrou antes (a primeira da lista)
function tiraDoEstoque(p, qty) {
  acertaLotes(p); const partes = []; let falta = qty;
  (p.lotes || []).forEach(l => { if (falta <= 0 || l.qty <= 0) return; const sai = Math.min(l.qty, falta); l.qty = Math.round((l.qty - sai) * 100) / 100; falta = Math.round((falta - sai) * 100) / 100; partes.push({ id: l.id, qty: sai }); });
  acertaLotes(p); return partes;
}
function devolveAoEstoque(p, b) {
  if (!p) return;
  acertaLotes(p);
  const partes = b.lotes && b.lotes.length ? b.lotes : [{ id: null, qty: b.qty }];
  partes.forEach(x => { let l = (p.lotes || []).find(y => y.id === x.id); if (!l) { p.lotes = p.lotes || []; l = p.lotes[0] || (p.lotes.push({ id: uid(), brand: '', qty: 0, cost: p.cost || 0 }), p.lotes[0]); } l.qty = Math.round((l.qty + x.qty) * 100) / 100; });
  acertaLotes(p);
}
const stockLow = p => inStock(p) && (p.stock <= 0 || (p.min > 0 && p.stock <= p.min));
const sugestaoCompra = p => p.min > 0 ? Math.max(1, Math.ceil(p.min * 2 - (p.stock || 0))) : 1;
const stockTxt = p => !inStock(p) ? '' : p.stock <= 0 ? 'em falta no estoque' : `${fmtQty(p.stock)} em estoque${stockLow(p) ? ' · repor' : ''}`;
// dados da primeira versão do app (mesmo aparelho ou cópia de segurança antiga)
/* começo limpo: na primeira vez entram a tabela e as ferramentas que vêm com o app */
if (!Array.isArray(prices) || !Array.isArray(quotes)) {
  prices = Array.isArray(prices) ? prices : seedPrices(); quotes = Array.isArray(quotes) ? quotes : [];
  saveSettings(); savePrices(); saveQuotes();
}
quotes = quotes.map(fixQuote);
prices.forEach(acertaLotes);
tools = normTools(tools); checks = (Array.isArray(checks) ? checks : []).map(fixCheck);
if (!settings.toolSeedV) { seedTools().forEach(t => { if (!tools.some(x => x.k === 'tipo' && (x.id === t.id || norm(x.name) === norm(t.name)))) tools.push(t); }); settings.toolSeedV = 3; LS.set('tools', tools); saveSettings(); }
settings.seq = Math.max(settings.seq || 0, 0, ...quotes.map(q => q.num || 0));

const getQ = id => quotes.find(q => q.id === id);
const touch = q => { acertaGeral(q); q.updatedAt = Date.now(); saveQuotes(); };
const numLabel = q => q.example ? 'Exemplo' : 'Nº ' + String(q.num || 0).padStart(4, '0');
const isEmptyQuote = q => !q.example && !q.client.name && !q.title && !q.items.length;

/* ================= sincronização entre aparelhos ================= */
// O motor (conexão, criptografia, gist, avisos e telas) é o do Kit Fácil, comum aos apps do projeto; o arquivo no gist
// continua o mesmo (eletrica-facil.json, mesmo formato), então aparelhos com a versão anterior seguem sincronizando.
// Aqui fica só a regra do Elétrica Fácil: cada orçamento, preço e campo dos ajustes guarda quando foi alterado;
// ao juntar, fica a alteração mais recente.
const syncOn = () => SY.ligada();
const scheduleSync = ms => SY.agendar(ms);
const syncNow = opts => SY.agora(opts);
const canon = KitFacil.canon;
function snapAll() {
  SNAP = { s: {}, p: {}, q: {}, t: {}, c: {} };
  tools.forEach(t => { SNAP.t[t.id] = JSON.stringify(t); });
  checks.forEach(c => { SNAP.c[c.id] = JSON.stringify(c); });
  for (const k in settings) SNAP.s[k] = JSON.stringify(settings[k]);
  prices.forEach(p => { SNAP.p[p.id] = JSON.stringify(p); });
  quotes.forEach(q => { if (!q.example) SNAP.q[q.id] = { j: JSON.stringify(q), u: q.updatedAt }; });
}
function stamp(kind) {
  if (!SNAP || semSalvar) return;
  const now = Date.now(); let ch = false;
  if (kind === 'settings') {
    for (const k in settings) { const j = JSON.stringify(settings[k]); if (SNAP.s[k] !== j) { SNAP.s[k] = j; sync.st['s:' + k] = now; ch = true; } }
  } else if (kind === 'prices' || kind === 'tools' || kind === 'checks') {
    // listas simples: cada registro guarda quando mudou (p: preços, t: ferramentas, c: checklist)
    const k = kind[0], L = kind === 'prices' ? prices : kind === 'tools' ? tools : checks, seen = {};
    L.forEach(p => { seen[p.id] = 1; const j = JSON.stringify(p); if (SNAP[k][p.id] !== j) { SNAP[k][p.id] = j; sync.st[k + ':' + p.id] = now; delete sync.del[p.id]; ch = true; } });
    for (const id in SNAP[k]) if (!seen[id]) { delete SNAP[k][id]; delete sync.st[k + ':' + id]; sync.del[id] = now; ch = true; }
  } else {
    const seen = {};
    quotes.forEach(q => {
      if (q.example) return;
      seen[q.id] = 1;
      const old = SNAP.q[q.id];
      let j = JSON.stringify(q);
      if (old && old.j === j) return;
      // orçamento que voltou com "Desfazer" ou mudou sem atualizar a data: passa a valer agora
      if (!old && sync.del[q.id]) { delete sync.del[q.id]; q.updatedAt = Math.max(q.updatedAt || 0, now); j = JSON.stringify(q); }
      else if (old && old.u === q.updatedAt) { q.updatedAt = now; j = JSON.stringify(q); }
      SNAP.q[q.id] = { j, u: q.updatedAt }; ch = true;
    });
    for (const id in SNAP.q) if (!seen[id]) { delete SNAP.q[id]; sync.del[id] = now; ch = true; }
  }
  if (ch) { saveSync(); if (syncOn()) scheduleSync(); }
}

// junta duas listas por id; a versão mais recente de cada item vence
function mergeList(L, R, lt, rt, del, onRemote) {
  const rm = new Map(R.map(x => [x.id, x])), used = new Set(), out = [];
  L.forEach(x => {
    used.add(x.id);
    const r = rm.get(x.id);
    if (r) {
      if (del[x.id] >= Math.max(lt(x), rt(r))) return;
      if (rt(r) > lt(x)) { out.push(r); onRemote && onRemote(r); } else out.push(x);
    } else if (!(del[x.id] >= lt(x))) out.push(x);
  });
  R.forEach(r => { if (!used.has(r.id) && !(del[r.id] >= rt(r))) { out.push(r); onRemote && onRemote(r); } });
  return out;
}
function applyRemote(R) {
  const first = !sync.lastSync, rs = R.st || {}, del = { ...sync.del }, st = { ...sync.st };
  for (const k in (R.del || {})) del[k] = Math.max(del[k] || 0, R.del[k]);
  const cut = Date.now() - 400 * DAY;
  for (const k in del) if (del[k] < cut) delete del[k];
  const before = canon([settings, prices, quotes, tools, checks]);
  // ajustes: campo a campo (na primeira conexão, vale o que já está na nuvem)
  const S = { ...settings }, RS = R.settings || {};
  for (const k of Object.keys(RS)) {
    const rt = rs['s:' + k] || 0, lt = st['s:' + k] || 0;
    if (first || rt > lt) { S[k] = RS[k]; if (rt) st['s:' + k] = rt; else delete st['s:' + k]; }
  }
  S.seedV = Math.max(settings.seedV || 0, RS.seedV || 0);
  // preços
  let P;
  if (first && Array.isArray(R.prices) && R.prices.length) {
    P = clone(R.prices);
    Object.keys(st).forEach(k => { if (k.startsWith('p:')) delete st[k]; });
    Object.keys(rs).forEach(k => { if (k.startsWith('p:')) st[k] = rs[k]; });
  } else P = mergeList(prices, R.prices || [], p => st['p:' + p.id] || 0, p => rs['p:' + p.id] || 0, del, p => { if (rs['p:' + p.id]) st['p:' + p.id] = rs['p:' + p.id]; });
  // orçamentos (o exemplo fica só neste aparelho)
  const mine = new Map(quotes.map(q => [q.id, q]));
  const Q = mergeList(quotes.filter(q => !q.example), (R.quotes || []).map(fixQuote), q => q.updatedAt || 0, q => q.updatedAt || 0, del)
    .map(r => { const l = mine.get(r.id); if (l && l !== r) { Object.keys(l).forEach(k => delete l[k]); Object.assign(l, r); return l; } return r; });
  quotes = [...quotes.filter(q => q.example), ...Q];
  S.seq = Math.max(settings.seq || 0, RS.seq || 0, 0, ...quotes.map(q => q.num || 0));
  // orçamentos criados ao mesmo tempo em dois aparelhos podem repetir o número: o mais novo ganha um número novo
  const used = new Set();
  [...quotes].filter(q => !q.example && q.num).sort((a, b) => a.createdAt - b.createdAt).forEach(q => {
    if (used.has(q.num)) { q.num = ++S.seq; q.updatedAt = Date.now(); }
    used.add(q.num);
  });
  // ferramentas e checklist: registro a registro (aparelhos com versões antigas não mandam essas listas)
  const juntar = (L, R, k) => Array.isArray(R) ? mergeList(L, R, x => st[k + ':' + x.id] || 0, x => rs[k + ':' + x.id] || 0, del, x => { if (rs[k + ':' + x.id]) st[k + ':' + x.id] = rs[k + ':' + x.id]; }) : L;
  tools = normTools(juntar(tools, R.tools, 't')); checks = juntar(checks, R.checks, 'c').map(fixCheck);
  settings = { ...DEF, ...S }; prices = P; prices.forEach(acertaLotes);
  const vivos = new Set([...P, ...tools, ...checks].map(p => p.id));
  Object.keys(st).forEach(k => { if (/^[ptc]:/.test(k) && !vivos.has(k.slice(2))) delete st[k]; });
  sync.st = st; sync.del = del;
  LS.set('settings', settings); LS.set('prices', prices); LS.set('quotes', quotes); LS.set('tools', tools); LS.set('checks', checks);
  snapAll(); saveSync();
  return before !== canon([settings, prices, quotes, tools, checks]);
}
const syncPayload = () => ({ settings, prices, quotes: quotes.filter(q => !q.example && !isEmptyQuote(q)), tools, checks, st: sync.st, del: sync.del });
snapAll();
const lineTotal = i => Math.round(i.qty * i.price);
// imposto do orçamento, sempre num formato válido (orçamentos antigos não têm o campo)
function taxOf(q) {
  const t = q.tax || {};
  return { mode: ['fora', 'dentro'].includes(t.mode) ? t.mode : 'sem', pct: Math.max(0, Math.min(30, +t.pct || 0)), base: t.base === 'total' ? 'total' : 'servico' };
}
const TAX_BASE = { servico: 'sobre a mão de obra', total: 'sobre o total' };
const taxLabel = c => `Impostos (${fmtQty(c.tax.pct)}% ${TAX_BASE[c.tax.base]})`;
// preço e total de uma linha como o cliente vê (com o imposto embutido, se for o caso)
const kDe = (c, i) => i.kind === 'svc' ? (c.kSvc || 1) : (c.kMat || 1);
const lineShow = (c, i) => kDe(c, i) === 1 ? lineTotal(i) : Math.round(lineTotal(i) * kDe(c, i));
const priceShow = (c, i) => kDe(c, i) === 1 ? i.price : Math.round(i.price * kDe(c, i));
function compute(q) {
  const svc = q.items.filter(i => i.kind === 'svc'), mat = q.items.filter(i => i.kind === 'mat');
  // impostos (F6): sem, por fora (linha própria na proposta) ou embutido nos preços (o cliente não vê a linha)
  const tx = taxOf(q), tp = tx.pct / 100;
  const kSvc = tx.mode === 'dentro' && tp > 0 ? 1 / (1 - tp) : 1, kMat = tx.base === 'total' ? kSvc : 1;
  const mostra = (i, k) => k === 1 ? lineTotal(i) : Math.round(lineTotal(i) * k);
  const labor = sum(svc.map(i => mostra(i, kSvc))), matTotal = sum(mat.map(i => mostra(i, kMat))), matIn = q.materialBy !== 'cliente';
  const travel = Math.round((q.travel || 0) * kMat);
  const surPct = (q.extras.urgent || 0) + (q.extras.night || 0) + (q.extras.weekend || 0);
  const extra = Math.round(labor * surPct / 100);
  const sub = labor + extra + (matIn ? matTotal : 0) + travel;
  const discount = q.discount.mode === 'pct' ? Math.round(sub * Math.min(100, q.discount.pct || 0) / 100) : Math.min(q.discount.value || 0, sub);
  const liquido = sub - discount;
  // base do imposto depois do desconto: só a mão de obra (ISS) ou o total (Simples Nacional)
  const baseTax = tx.base === 'total' ? liquido : (sub ? Math.round((labor + extra) * liquido / sub) : 0);
  const taxFora = tx.mode === 'fora' ? Math.round(baseTax * tp) : 0;
  const taxDentro = tx.mode === 'dentro' && tp > 0 ? Math.round(baseTax * tp) : 0;
  const total = liquido + taxFora, p = q.payment;
  const entry = p.mode === 'entrada' ? Math.round(total * p.entryPct / 100) : 0;
  const rest = p.mode === 'entrada' ? total - entry : 0;
  // à vista: desconto que só vale se o cliente pagar à vista (além do desconto do serviço)
  const av = p.avista || { mode: 'pct', pct: 0, value: 0 };
  const avistaDesc = p.mode === 'avista' ? (av.mode === 'value' ? Math.min(av.value || 0, total) : Math.round(total * Math.min(50, av.pct || 0) / 100)) : 0;
  const avistaTotal = total - avistaDesc;
  // cartão
  const cd = cardCalc(p, total);
  const pixValue = p.mode === 'avista' ? avistaTotal : p.mode === 'entrada' ? entry : 0;
  const payTotal = p.mode === 'avista' ? avistaTotal : p.mode === 'parcelado' ? cd.total : total;
  return { svc, mat, labor, surPct, extra, matTotal, matIn, travel, sub, discount, tax: tx, taxFora, taxDentro, kSvc, kMat, total, entry, rest, parts: cd.parts, card: cd, avistaDesc, avistaTotal, payTotal, pixValue, validUntil: q.createdAt + (q.validity || 0) * DAY };
}
/* cartão: sem juros, taxa da maquininha (repassada ao cliente ou paga por você) ou juros ao mês (parcelas iguais) */
const parcelasDe = (total, n) => { const base = Math.floor(total / n), L = []; for (let k = 0; k < n; k++) L.push(base + (k < total - base * n ? 1 : 0)); return L; };
// taxa da maquininha para o parcelamento: a do orçamento, se você mudou, ou a da tabela dos Ajustes
const taxaDaTabela = (tipo, n) => { const R = settings.cardRates || {}; const v = R[tipo === 'debito' ? 'debito' : String(n)]; return typeof v === 'number' ? v : 0; };
function cardCalc(p, total) {
  const deb = p.cardTipo === 'debito', n = deb ? 1 : Math.max(1, p.installments || 1);
  const semJuros = p.juros === 'sem' || (!deb && p.semAte > 0 && n <= p.semAte);
  const taxa = p.juros === 'taxa' ? (p.taxaPct != null ? p.taxaPct : taxaDaTabela(p.cardTipo, n)) : 0;
  let cardTotal = total, recebe = total, taxaPct = 0, mes = 0;
  if (p.juros === 'taxa') {
    taxaPct = Math.max(0, Math.min(40, taxa));
    // repassada: o cliente paga o suficiente para você receber o valor cheio depois da taxa
    if (p.paga === 'cliente' && !semJuros) cardTotal = Math.round(total / (1 - taxaPct / 100));
    recebe = Math.round(cardTotal * (1 - taxaPct / 100));
  } else if (p.juros === 'mes' && !semJuros && n > 1) {
    mes = Math.max(0, Math.min(20, p.mesPct || 0)) / 100;
    if (mes > 0) { const pmt = total * mes / (1 - Math.pow(1 + mes, -n)); cardTotal = Math.round(pmt * n); }
    recebe = cardTotal;
  }
  // com juros, as parcelas ficam iguais (como na maquininha): o total é parcela × número de parcelas
  // parcelas iguais arredondadas para CIMA quando o cliente paga a taxa: o eletricista nunca recebe menos que o total (E9)
  if (cardTotal !== total && n > 1) {
    cardTotal = Math.ceil(cardTotal / n) * n;
    if (p.juros === 'taxa') { recebe = Math.round(cardTotal * (1 - taxaPct / 100)); while (p.paga === 'cliente' && recebe < total) { cardTotal += n; recebe = Math.round(cardTotal * (1 - taxaPct / 100)); } }
    else recebe = cardTotal;
  }
  return { n, deb, semJuros, taxaPct, mesPct: mes * 100, total: cardTotal, juros: cardTotal - total, recebe, parts: parcelasDe(cardTotal, n) };
}
// nome do total que o cliente paga, na barra de baixo do orçamento
const payLabel = (q, c) => c.payTotal === c.total ? 'Total' : q.payment.mode === 'avista' ? 'Total à vista' : 'Total no cartão';
function cardTxt(p, c) {
  const k = c.card, parc = k.deb ? `no débito: ${BRL(k.total)}` : k.n === 1 ? `no crédito à vista: ${BRL(k.total)}` : partsText(k.parts);
  const j = k.juros > 0 ? (p.juros === 'mes' ? `, com juros de ${fmtQty(k.mesPct)}% ao mês e total de ${BRL(k.total)}` : `, total de ${BRL(k.total)} com a taxa do cartão`) : (!k.deb && k.n > 1 ? ' sem juros' : '');
  return { parc, j };
}
function partsText(parts) {
  const n = parts.length; if (!n) return '';
  const hi = parts[0], lo = parts[n - 1];
  if (hi === lo) return `${n}× de ${BRL(hi)}`;
  const k = parts.filter(x => x === hi).length;
  return `${k}× de ${BRL(hi)} + ${n - k}× de ${BRL(lo)}`;
}
// "Ou: à vista, R$ 950,00, com 5% de desconto; parcelado no cartão em 6× de R$ 183,15."
function outrasTxt(q) {
  const L = outrasFormas(q).map(m => { const x = comForma(q, m); return payText(x.q, x.c).replace(/\.$/, ''); });
  return L.length ? L.map(t => t.charAt(0).toLowerCase() + t.slice(1)).join('; ') + '.' : '';
}
function payText(q, c) {
  const p = q.payment;
  if (p.mode === 'avista') return c.avistaDesc ? `À vista: ${BRL(c.avistaTotal)}, com ${p.avista.mode === 'pct' ? `${fmtQty(p.avista.pct)}% de desconto` : `desconto de ${BRL(c.avistaDesc)}`} para pagamento à vista.` : `À vista: ${BRL(c.total)}.`;
  if (p.mode === 'entrada') return `Entrada de ${p.entryPct}%, ${BRL(c.entry)}, na aprovação e ${BRL(c.rest)} na conclusão do serviço.`;
  if (p.mode === 'parcelado') { const t = cardTxt(p, c); return c.card.deb || c.card.n === 1 ? `Cartão ${t.parc}.` : `Parcelado no cartão em ${t.parc}${t.j}.`; }
  return 'A combinar.';
}
// adicionais sobre a mão de obra: [chave, rótulo curto, ajuste padrão, texto na proposta]
const EXTRAS = [['urgent', 'Urgência', 'surUrgent', 'urgência'], ['night', 'Noturno', 'surNight', 'período noturno'], ['weekend', 'Fim de semana', 'surWeekend', 'fim de semana ou feriado']];
function extrasText(q) {
  const L = EXTRAS.filter(([k]) => q.extras[k] > 0).map(([k, , , l]) => `${l} (+${q.extras[k]}%)`);
  if (!L.length) return '';
  const s = L.length === 1 ? L[0] : L.slice(0, -1).join(', ') + ' e ' + L[L.length - 1];
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// deslocamento: combustível + pedágio + tempo de viagem + desgaste, com mínimo por visita
function tripCalc(t) {
  const visits = Math.max(1, t.visits || 1), legs = (t.roundTrip ? 2 : 1) * visits;
  const km = Math.round((t.km || 0) * legs * 10) / 10;
  const fuel = t.kmPerL > 0 ? Math.round(km / t.kmPerL * (t.fuelPrice || 0)) : 0;
  const toll = (t.toll || 0) * visits;
  const wear = Math.round(km * (t.wearPerKm || 0));
  const time = Math.round((t.minutes || 0) * legs / 60 * (t.hourRate || 0));
  const min = (t.minVisit || 0) * visits, raw = fuel + toll + wear + time;
  return { legs, km, fuel, toll, wear, time, min, usedMin: min > raw, total: Math.max(raw, min) };
}
const tripShort = (t, r = tripCalc(t)) => `${plural(Math.max(1, t.visits || 1), 'visita', 'visitas')}, ${fmtQty(r.km)} km`;
const tripLong = (t, r = tripCalc(t)) => `${plural(Math.max(1, t.visits || 1), 'visita', 'visitas')} à obra, ${fmtQty(r.km)} km no total${t.roundTrip ? ' (ida e volta)' : ''}.`;
const mapsLink = addr => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
// ambientes (cômodos)
const ROOM_CHIPS = ['Geral', 'Sala', 'Cozinha', 'Quarto', 'Banheiro', 'Lavabo', 'Área de serviço', 'Varanda', 'Corredor', 'Escritório', 'Garagem', 'Área externa'];
// declaração de função (vale desde o início do script): os orçamentos salvos são acertados antes desta linha
function roomOf(q, i) { return i.room && q.rooms.some(r => r.id === i.room) ? i.room : ''; }
const roomName = (q, id) => id ? ((q.rooms.find(r => r.id === id) || {}).name || 'Ambiente') : 'Geral';
function roomList(q) {
  const G = q.rooms.map(r => ({ id: r.id, name: r.name, items: q.items.filter(i => i.room === r.id) }));
  const soltos = q.items.filter(i => !roomOf(q, i));
  if (soltos.length) G.push({ id: '', name: 'Geral', items: soltos });
  return G;
}
// Geral é um ambiente como os outros (2.19): item sem ambiente vai para ele, que é criado só quando preciso,
// com id fixo para sair igual em todo aparelho; pode ser renomeado e excluído
function acertaGeral(q) {
  if (!q.useRooms) return;
  const soltos = q.items.filter(i => !roomOf(q, i));
  if (!soltos.length) return;
  let g = q.rooms.find(r => r.id === 'geral') || q.rooms.find(r => norm(r.name) === 'geral');
  if (!g) { g = { id: 'geral', name: uniqueRoomName(q, 'Geral') }; q.rooms.push(g); }
  soltos.forEach(i => { i.room = g.id; });
}
function uniqueRoomName(q, base) {
  const names = q.rooms.map(r => norm(r.name));
  if (!names.includes(norm(base))) return base;
  let n = 2; while (names.includes(norm(`${base} ${n}`))) n++;
  return `${base} ${n}`;
}
function nextRoomName(q, name) {
  const base = name.replace(/\s+\d+$/, ''), names = q.rooms.map(r => norm(r.name));
  let n = 2; while (names.includes(norm(`${base} ${n}`))) n++;
  return `${base} ${n}`;
}
// soma cada item entre os ambientes (mesmo tipo, nome e unidade)
function consolidate(q, kind) {
  const m = new Map();
  q.items.filter(i => !kind || i.kind === kind).forEach(i => {
    const key = i.kind + '|' + norm(i.name) + '|' + i.unit;
    const e = m.get(key) || { kind: i.kind, name: i.name, unit: i.unit, qty: 0, total: 0, by: new Map() };
    e.qty = Math.round((e.qty + i.qty) * 100) / 100; e.total += lineTotal(i);
    const rn = q.useRooms ? roomName(q, roomOf(q, i)) : '';
    if (rn) e.by.set(rn, Math.round(((e.by.get(rn) || 0) + i.qty) * 100) / 100);
    m.set(key, e);
  });
  return [...m.values()];
}
// antes do serviço o documento é orçamento; depois de concluído, relatório de serviços executados
const isReport = q => q.status === 'concluido';
const previewDoc = {};
const docMode = q => isReport(q) ? (previewDoc[q.id] || 'report') : 'quote';
const DOC = {
  quote: { title: 'ORÇAMENTO', name: 'Orçamento', file: 'Orcamento' },
  report: { title: 'RELATÓRIO DE SERVIÇOS EXECUTADOS', name: 'Relatório', file: 'Relatorio' },
};
const dateInput = ts => { const d = new Date(ts || Date.now()); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
// documento do cliente: CPF (11 números) ou CNPJ (14)
function fmtDoc(v) {
  const d = phoneDigits(v);
  if (d.length === 11) return `CPF ${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length === 14) return `CNPJ ${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return String(v || '').trim();
}
function cnpjValid(d) {
  if (!/^\d{14}$/.test(d) || /^(\d)\1{13}$/.test(d)) return false;
  const dv = n => { const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; const r = w.reduce((a, x, i) => a + x * +d[i], 0) % 11; return r < 2 ? 0 : 11 - r; };
  return dv(12) === +d[12] && dv(13) === +d[13];
}
const parseDay = v => v ? new Date(v + 'T12:00').getTime() : null;
const sameDay = (a, b) => dateInput(a) === dateInput(b);
// dias seguidos (sem buraco no calendário)?
const seguidos = L => L.every((t, k) => !k || Math.round((t - L[k - 1]) / DAY) === 1);
// "3, 5 e 15/11/2026" (mesmo mês) ou "28/10, 30/10 e 03/11/2026"
function datesText(L) {
  if (!L.length) return '';
  if (L.length === 1) return fmtDate(L[0]);
  const last = new Date(L[L.length - 1]), y = last.getFullYear();
  const mesmoAno = L.every(t => new Date(t).getFullYear() === y);
  if (mesmoAno && L.every(t => new Date(t).getMonth() === last.getMonth())) return joinPt(L.map(t => String(new Date(t).getDate()))) + '/' + String(last.getMonth() + 1).padStart(2, '0') + '/' + y;
  if (mesmoAno) return joinPt(L.map(fmtShort)) + '/' + y;
  return joinPt(L.map(fmtDate));
}
// feriados nacionais (fixos e Sexta-feira Santa), pulados na contagem de dias úteis
const FERIADOS = {};
function feriadosDo(y) {
  if (FERIADOS[y]) return FERIADOS[y];
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  const sexta = new Date(y, mes - 1, dia - 2, 12);
  const L = { [dateInput(sexta)]: 'Sexta-feira Santa' };
  [['01-01', 'Confraternização Universal'], ['04-21', 'Tiradentes'], ['05-01', 'Dia do Trabalho'], ['09-07', 'Independência do Brasil'], ['10-12', 'Nossa Senhora Aparecida'],
    ['11-02', 'Finados'], ['11-15', 'Proclamação da República'], ['11-20', 'Dia da Consciência Negra'], ['12-25', 'Natal']].forEach(([md, n]) => { L[`${y}-${md}`] = n; });
  return (FERIADOS[y] = L);
}
const feriado = t => feriadosDo(new Date(t).getFullYear())[dateInput(t)] || '';
const diaUtil = t => { const w = new Date(t).getDay(); return w !== 0 && w !== 6 && !feriado(t); };
const maisDias = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); d.setHours(12, 0, 0, 0); return d.getTime(); };
const ehDia = p => p.u === 'uteis' || p.u === 'corridos';
// último dia do prazo, contando a partir do dia de início
function prazoFim(ini, p) {
  if (p.u === 'corridos') return maisDias(ini, p.n - 1);
  if (p.u === 'semanas') return maisDias(ini, p.n * 7 - 1);
  if (p.u === 'meses') { const d = new Date(ini); d.setMonth(d.getMonth() + p.n); d.setDate(d.getDate() - 1); d.setHours(12, 0, 0, 0); return d.getTime(); }
  let t = ini, k = diaUtil(ini) ? 1 : 0;
  while (k < p.n) { t = maisDias(t, 1); if (diaUtil(t)) k++; }
  return t;
}
// dias que o app marca sozinho ao escolher o início: o dia escolhido e os seguintes do prazo (dias úteis pulam fins de semana e feriados)
function prazoDias(ini, p) {
  const L = [ini];
  if (p.u === 'corridos') { for (let k = 1; k < p.n; k++) L.push(maisDias(ini, k)); return L; }
  const fim = p.u === 'uteis' ? null : prazoFim(ini, p);
  for (let t = maisDias(ini, 1); p.u === 'uteis' ? L.length < p.n : t <= fim; t = maisDias(t, 1)) if (diaUtil(t)) L.push(t);
  return L;
}
const hojeTs = () => dayTs(Date.now());
// orçamento não aceita data retroativa (vale enquanto ainda não foi aprovado)
const retroativo = q => !isReport(q) && !q.dateTbd && ['rascunho', 'enviado'].includes(q.status) && q.dates.some(t => t < hojeTs());
function prazoProblema(q) {
  if (isReport(q)) return q.dates.length && q.dates.length !== q.days ? 'conta' : '';
  if (q.dateTbd || !q.dates.length) return '';
  if (retroativo(q)) return 'retro';
  const p = q.prazo;
  if (ehDia(p)) return q.dates.length !== p.n ? 'conta' : '';
  return q.dates[q.dates.length - 1] > prazoFim(q.dates[0], p) ? 'fora' : '';
}
const daysOk = q => !prazoProblema(q);
function daysMismatch(q) {
  const pr = prazoProblema(q), n = q.dates.length;
  if (!pr) return '';
  if (pr === 'retro') return 'Há dias marcados que já passaram. O orçamento não aceita data retroativa: escolha um novo início.';
  const alvo = isReport(q) ? q.days : q.prazo.n, falta = alvo - n;
  if (pr === 'conta') return `${isReport(q) ? `Você informou ${plural(alvo, 'dia', 'dias')}` : `O prazo é de ${prazoTxt(q.prazo)}`} e há ${plural(n, 'dia marcado', 'dias marcados')}. ${falta > 0 ? `Marque mais ${falta}` : `Desmarque ${-falta}`} ou mude ${isReport(q) ? 'a quantidade' : 'o prazo'} para ${n}.`;
  return `O prazo de ${prazoTxt(q.prazo)} vai até ${fmtDate(prazoFim(q.dates[0], q.prazo))} e há dias marcados depois disso.`;
}
// menor prazo (na mesma unidade) que cobre os dias marcados
function prazoQueCobre(q) {
  const p = { ...q.prazo };
  if (ehDia(p)) { p.n = Math.max(1, q.dates.length); return p; }
  for (p.n = 1; p.n < 99 && prazoFim(q.dates[0], p) < q.dates[q.dates.length - 1]; p.n++);
  return p;
}
// prazo nos documentos
const prazoDoc = q => q.prazo ? prazoTxt(q.prazo) + (q.prazo.u === 'uteis' ? ' (sem fins de semana e feriados)' : '') : q.deadline;
// todos os dias úteis entre o primeiro e o último dia marcados, e só eles?
function soUteis(L) {
  if (L.length < 2 || !L.every(diaUtil)) return false;
  for (let t = L[0], k = 0; t <= L[L.length - 1]; t = maisDias(t, 1)) { if (diaUtil(t)) { if (L[k] !== t) return false; k++; } }
  return true;
}
// resumo dos dias: "de 03/11 a 06/11/2026 (4 dias)", "de 03 a 19/11/2026, em dias úteis (12 dias)" ou a lista
function diasResumo(L) {
  if (!L.length) return '';
  if (L.length === 1) return fmtDate(L[0]);
  if (seguidos(L)) return `de ${fmtShort(L[0])} a ${fmtDate(L[L.length - 1])}, ${L.length} dias seguidos`;
  if (soUteis(L)) return `de ${fmtShort(L[0])} a ${fmtDate(L[L.length - 1])}, ${L.length} dias úteis`;
  return `${datesText(L)}: ${L.length} dias, não seguidos`;
}
// cabeçalho do relatório: um dia ou o período
const execHead = q => q.dates.length > 1 ? `Executado entre ${fmtShort(q.dates[0])} e ${fmtDate(q.dates[q.dates.length - 1])}` : `Executado em ${fmtDate(q.doneAt || q.dates[0])}`;
// texto da execução nos documentos
function execText(q) {
  return q.dates.length ? diasResumo(q.dates) : q.doneAt ? fmtDate(q.doneAt) : '';
}
// datas de início e término (o CDC pede no orçamento prévio)
function schedText(q) {
  if (q.dateTbd) return 'Datas de início e término a combinar na aprovação do orçamento.';
  const L = q.dates;
  if (L.length > 1) return `Início em ${fmtDate(L[0])} e término em ${fmtDate(L[L.length - 1])}. ${seguidos(L) ? `${L.length} dias seguidos.` : soUteis(L) ? `${L.length} dias úteis.` : `${L.length} dias de serviço, não seguidos: ${datesText(L)}.`}`;
  if (L.length === 1) return `Início e término em ${fmtDate(L[0])}.`;
  if (!q.startAt && !q.endAt) return '';
  if (q.startAt && q.endAt && dateInput(q.startAt) !== dateInput(q.endAt)) return `Início em ${fmtDate(q.startAt)} e término em ${fmtDate(q.endAt)}.`;
  return `Início e término em ${fmtDate(q.startAt || q.endAt)}.`;
}
const APPROVAL = { msg: 'por mensagem escrita, no WhatsApp ou no e-mail', sign: 'com assinatura na proposta', verbal: 'pessoalmente' };
const approvalText = q => q.approvedAt && q.approvedVia ? `Orçamento aprovado pelo cliente em ${fmtDate(q.approvedAt)}, ${APPROVAL[q.approvedVia] || ''}.` : '';
function warrantyText(q, mode) {
  const base = `${plural(q.warranty, 'dia', 'dias')} sobre o serviço executado`;
  return mode === 'report' && q.doneAt ? `${base}, até ${fmtDate(q.doneAt + q.warranty * DAY)}` : base;
}
function setStatus(q, st) {
  const now = Date.now();
  if (st === 'concluido' && q.status !== 'concluido') q.prevStatus = q.status;
  // saiu de concluído: o material que tinha baixado volta para o estoque
  if (st !== 'concluido' && q.baixa && q.baixa.length) {
    q.baixa.forEach(b => devolveAoEstoque(prices.find(x => x.id === b.id), b));
    q.baixa = null; savePrices(); setTimeout(() => toast('O material voltou para o estoque.'), 2600);
  }
  q.status = st;
  if (st === 'rascunho') { q.approvedAt = q.doneAt = q.refusedAt = null; }
  if (st === 'enviado') { q.sentAt = q.sentAt || now; q.approvedAt = q.doneAt = q.refusedAt = null; }
  if (st === 'aprovado') { q.sentAt = q.sentAt || now; q.approvedAt = now; q.doneAt = q.refusedAt = null; }
  if (st === 'concluido') {
    q.sentAt = q.sentAt || now; q.approvedAt = q.approvedAt || now; q.refusedAt = null;
    // os dias marcados no orçamento valem como dias de execução se já passaram; senão, conta hoje
    if (!q.dates.length || q.dates[q.dates.length - 1] > dayTs(now)) q.dates = [dayTs(now)];
    q.days = q.dates.length;
    q.doneAt = q.dates[q.dates.length - 1];
  }
  if (st === 'recusado') { q.sentAt = q.sentAt || now; q.refusedAt = now; q.approvedAt = q.doneAt = null; }
  touch(q);
}
function clientList() {
  const m = new Map();
  [...quotes].filter(q => !q.example).sort((a, b) => a.updatedAt - b.updatedAt).forEach(q => {
    const k = norm(q.client.name); if (!k) return;
    const prev = m.get(k) || {};
    m.set(k, { name: q.client.name, phone: q.client.phone || prev.phone || '', address: q.client.address || prev.address || '', doc: q.client.doc || prev.doc || '', last: q.updatedAt, n: (prev.n || 0) + 1 });
  });
  return [...m.values()].sort((a, b) => b.last - a.last);
}
function stats() {
  const now = new Date(), M = now.getMonth(), Y = now.getFullYear();
  const inMonth = ts => { if (!ts) return false; const d = new Date(ts); return d.getMonth() === M && d.getFullYear() === Y; };
  const real = quotes;
  const won = real.filter(q => (q.status === 'aprovado' || q.status === 'concluido') && inMonth(q.approvedAt));
  const waiting = real.filter(q => q.status === 'enviado'), todo = real.filter(q => q.status === 'aprovado');
  const since = Date.now() - 90 * DAY;
  const dec = real.filter(q => ['aprovado', 'concluido', 'recusado'].includes(q.status) && (q.approvedAt || q.refusedAt || 0) >= since);
  return {
    month: now.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^./, c => c.toUpperCase()),
    won: sum(won.map(q => compute(q).total)), wonN: won.length,
    waitN: waiting.length, waitSum: sum(waiting.map(q => compute(q).total)), todoN: todo.length,
    rate: dec.length ? Math.round(dec.filter(q => q.status !== 'recusado').length / dec.length * 100) : null,
    receber: sum(real.filter(q => ['aprovado', 'concluido'].includes(q.status)).map(q => falta(q))),
  };
}

/* ================= avisos, janelas e campos ================= */
/* avisos e janelas são os do Kit Fácil (iguais nos três apps); estas funções só traduzem os nomes usados no app */
function toast(msg, action) { KitFacil.avisar(msg, action); }
function openSheet({ title, body, foot = '', tall = false, wide = false, sub = '', onMount, onClose }) {
  return KitFacil.dialogo.abrir({ titulo: title, sub, corpo: body, pe: foot, classe: [tall && 'kf-alto', wide && 'kf-largo'].filter(Boolean).join(' '),
    aoFechar: onClose, aoMontar: sh => { prepFields(sh); onMount && onMount(sh); } });
}
function closeSheet(silent) { KitFacil.dialogo.fechar(silent); }
// confirmação: a janela comum do Kit (lei 6), igual nos quatro apps
function confirmSheet(title, text, okLabel, onOk, danger = true) {
  KitFacil.dialogo.confirmar({ titulo: title, texto: text, ok: okLabel, perigo: danger, aoConfirmar: onOk });
}
async function copyText(text, okMsg) {
  try { await navigator.clipboard.writeText(text); toast(okMsg); return; } catch {}
  openSheet({ title: 'Copiar texto', body: `<textarea id="cp-t" readonly style="min-height:260px;font-size:14px">${esc(text)}</textarea><p class="hint">Toque e segure no texto e escolha Copiar.</p>`,
    onMount: s => { const t = $('#cp-t', s); t.focus(); t.select(); } });
}
// valor em reais: só números, a vírgula dos centavos entra sozinha
function maskMoney(el) {
  const digits = el.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
  el.value = digits ? BRL(parseInt(digits, 10)) : '';
}
document.addEventListener('input', e => {
  const el = e.target; if (!el.matches || !el.matches('[data-money]')) return;
  // o primeiro número digitado depois de tocar no campo substitui o valor que estava lá
  if (el.dataset.fresh === '1' && e.inputType && e.inputType.startsWith('insert') && e.data && /\d/.test(e.data)) el.value = e.data;
  el.dataset.fresh = '';
  maskMoney(el);
  try { const n = el.value.length; el.setSelectionRange(n, n); } catch {}
}, true);
document.addEventListener('focusin', e => {
  const el = e.target; if (!el.matches || !el.matches('[data-money]')) return;
  el.dataset.fresh = '1';
  setTimeout(() => { try { const n = el.value.length; el.setSelectionRange(n, n); } catch {} }, 0);
});
document.addEventListener('keydown', e => {
  const t = e.target;
  if (e.key !== 'Enter' || !t.matches || !t.matches('input') || t.form) return;
  e.preventDefault(); t.blur();
});
function prepFields(root) { $$('input:not([type=checkbox]):not([type=file])', root).forEach(i => { if (!i.hasAttribute('enterkeyhint')) i.setAttribute('enterkeyhint', i.form ? 'go' : 'done'); }); KitFacil.escolha.ligar(root); }
// sugestões ao digitar (a lista do navegador não funciona bem no iPhone)
const lastPress = { target: null, at: 0 };
document.addEventListener('pointerdown', e => { lastPress.target = e.target; lastPress.at = Date.now(); }, true);
function attachSuggest(input, getItems, onPick) {
  if (!input) return;
  const wrap = document.createElement('div'); wrap.className = 'sg-wrap';
  input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
  const box = document.createElement('div'); box.className = 'sg-box'; box.hidden = true; box.setAttribute('role', 'listbox');
  wrap.appendChild(box);
  let items = [], active = -1;
  const close = () => { box.hidden = true; box.innerHTML = ''; active = -1; };
  const show = () => {
    const q = fold(input.value);
    items = getItems().filter(x => !q || fold(x.label).includes(q)).filter(x => fold(x.label) !== q).slice(0, 5);
    if (!items.length) return close();
    box.innerHTML = items.map((x, i) => `<button type="button" class="sg-item${i === active ? ' on' : ''}" data-i="${i}" role="option"><span>${esc(x.label)}</span>${x.right ? `<small>${esc(x.right)}</small>` : ''}</button>`).join('');
    box.hidden = false;
  };
  const pick = i => { const x = items[i]; if (!x) return; input.value = x.label; close(); onPick && onPick(x); };
  input.addEventListener('input', () => { active = -1; show(); });
  input.addEventListener('focus', show);
  input.addEventListener('blur', () => setTimeout(close, 180));
  input.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'ArrowDown') { active = Math.min(items.length - 1, active + 1); show(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { active = Math.max(0, active - 1); show(); e.preventDefault(); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); e.stopPropagation(); pick(active); }
    else if (e.key === 'Escape') { e.stopPropagation(); close(); }
  });
  box.addEventListener('pointerdown', e => e.preventDefault());
  box.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) pick(+b.dataset.i); });
}
// logo padrão: o mesmo desenho do ícone do app
const APP_MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="5.28" fill="#FFC400"/><path transform="translate(3.6 3.6) scale(.7)" d="M13.5 1.5 3.8 13.6h6.9L9.6 22.5l10.6-13h-7.1z" fill="#17150F" stroke="#17150F" stroke-width="1.5" stroke-linejoin="round"/></svg>';
function fitMark(root) {
  const who = $('.p-who', root), mark = $('.p-mark', root); if (!who || !mark) return;
  const apply = () => {
    // limite de tamanho: com muitas linhas a logo fica centralizada, sem empurrar o texto
    const h = who.getBoundingClientRect().height, size = Math.min(72, Math.max(36, Math.round(h)));
    const img = $('img', mark), r = img ? (settings.logoRatio || 1) : 1;
    mark.style.height = size + 'px'; mark.style.width = Math.round(Math.min(size * r, size * 2.6)) + 'px';
    mark.parentNode.classList.toggle('short', h < 36 || h > 72);
  };
  apply();
  try { new ResizeObserver(apply).observe(who); } catch {}
  document.fonts && document.fonts.ready.then(apply).catch(() => {});
}
const autoGrow = t => { if (!t.offsetParent) return; t.style.height = 'auto'; t.style.height = Math.max(88, t.scrollHeight + 2) + 'px'; };
document.addEventListener('input', e => { if (e.target.tagName === 'TEXTAREA') autoGrow(e.target); });
document.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('details')) $$('textarea', e.target).forEach(autoGrow); }, true);
// seções recolhíveis: mostram uma linha de resumo e abrem quando precisa
const PANEL = {};
/* seção: o mesmo cartão em todo o app e em todos os níveis (título, resumo de uma linha, contador ou valor, seta).
   Cada seção abre e fecha sozinha (as outras ficam como estão); todas começam fechadas, e a busca abre as que têm
   resultado (force). O app guarda, enquanto está aberto, quais seções você abriu (PANEL). */
const panelOpen = (key, id, title, sum, o = {}) => `<details class="fold" data-kf-secao data-panel="${esc(key)}"${o.attrs || ''}${(o.force ?? (key in PANEL ? PANEL[key] : false)) ? ' open' : ''}><summary><span class="f-t"><b>${title}</b>${sum !== null ? `<small${id ? ` data-sum="${id}"` : ''} data-kf-secao-resumo>${esc(sum)}</small>` : ''}</span>${o.right != null ? `<span class="f-r"${id ? ` data-sumr="${id}"` : ''}>${o.right}</span>` : ''}${o.tool || ''}<span class="f-ch">${I.chev}</span></summary><div class="f-in">`;
const panelClose = '</div></details>';
const resumoDe = (L, nome) => L.slice(0, 3).map(nome).filter(Boolean).join(' · ') + (L.length > 3 ? '…' : '');
const conta = n => `<span class="card-sum">${n}</span>`;
// linhas de escolha, no lugar dos botões lado a lado: 'um' (bolinha), 'varios' (caixa de marcar), 'ir' (seta: abre algo), 'mais' (acrescenta)
const linha = (attrs, txt, { tipo = 'ir', on = false, dir = '', sub = '', dis = false } = {}) =>
  `<button type="button" class="lin ${tipo}" ${attrs}${tipo === 'um' || tipo === 'varios' ? ` aria-pressed="${!!on}"` : ''}${dis ? ' disabled' : ''}>`
  + (tipo === 'ir' ? '' : `<span class="mk" aria-hidden="true">${tipo === 'mais' ? (dis ? I.check : I.plus) : ''}</span>`)
  + `<span class="lt">${txt}${sub ? `<small>${sub}</small>` : ''}</span>${dir ? `<span class="lr">${dir}</span>` : ''}${tipo === 'ir' ? `<span class="lc" aria-hidden="true">${I.chev}</span>` : ''}</button>`;
const linhas = (rows, attrs = '') => `<div class="lins"${attrs}>${rows.join('')}</div>`;
// linha "mais" que já foi usada: fica marcada e desligada
const linhaFeita = (b, feita) => { b.disabled = feita; const m = $('.mk', b); if (m) m.innerHTML = feita ? I.check : I.plus; };
// filtro curto: segmentos com a contagem embaixo
const filtroSeg = (attr, L, atual, n, rot) => `<div class="seg filtro" role="group" aria-label="${rot}">${L.map(([k, l]) => `<button ${attr}="${k}" aria-pressed="${atual === k}">${l}</button>`).join('')}</div>`;
const panel = (key, id, title, sum, body, o) => panelOpen(key, id, title, sum, o) + body + panelClose;
function paintSums(root, map) {
  for (const k in map) {
    if (k.endsWith('R')) { const e = $(`[data-sumr="${k.slice(0, -1)}"]`, root); if (e) e.textContent = map[k]; }
    else { const e = $(`[data-sum="${k}"]`, root); if (e) e.textContent = map[k]; }
  }
}
// seções: abrir e fechar é do Kit (KitFacil.secao, o mesmo movimento nos três apps); aqui só se guarda qual está aberta
const semMovimento = () => KitFacil.movimento.reduzido();
document.addEventListener('kf-secao', e => { const d = e.target; if (d.matches && d.matches('details.fold')) PANEL[d.dataset.panel] = e.detail.aberta; });
document.addEventListener('toggle', e => {
  const d = e.target; if (!d.matches || !d.matches('details.fold') || d.classList.contains('kf-secao-anim')) return;
  PANEL[d.dataset.panel] = d.open;
}, true);
// botões dentro do título da seção não abrem nem fecham a seção
document.addEventListener('click', e => { if (e.target.closest('summary button')) e.preventDefault(); }, true);
const vibrate = () => { try { navigator.vibrate && navigator.vibrate(8); } catch {} };

/* ================= rotas ================= */
function route() {
  const h = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  let m;
  if ((m = h.match(/^\/q\/([\w-]+)/))) return { name: 'quote', id: m[1], key: '/q/' + m[1] };
  if (h === '/conquistas') return { name: 'conquistas', key: h };
  if (h === '/mais') return { name: 'mais', key: h };
  if (h === '/precos') return { name: 'prices', key: h };
  if (h === '/obra' || h === '/gestao') return { name: 'obra', key: '/obra' };
  if (h === '/ajustes') return { name: 'settings', key: h };
  return { name: 'home', key: '/' };
}
const scrollMem = {};
let curKey = null, openQuoteId = null, navMode = 'push';
function go(path, replace) {
  if (curKey) scrollMem[curKey] = window.scrollY;
  const d = (history.state && history.state.d) || 0;
  if (replace) history.replaceState({ d }, '', '#' + path); else history.pushState({ d: d + 1 }, '', '#' + path);
  navMode = 'push'; closeSheet(true); render();
}
function back(fallback = '/') {
  if (history.state && history.state.d > 0) history.back(); else go(fallback, true);
}
let irDepois = null; // destino guardado enquanto o Voltar tira uma guia dos Ajustes do histórico
window.addEventListener('popstate', () => {
  if (irDepois) { const d = irDepois; irDepois = null; go(d, true); return; }
  // voltar de uma guia dos Ajustes para a lista: quem cuida é o Kit Fácil, sem redesenhar a tela
  if (route().key === curKey && route().name === 'settings' && $('[data-kf-aj]')) return;
  if (curKey) scrollMem[curKey] = window.scrollY; navMode = 'pop'; closeSheet(true); render();
});

const VIEWS = {};
