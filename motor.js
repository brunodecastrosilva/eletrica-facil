/* Elétrica Fácil 5 · motor: utilidades, catálogo de fábrica, dados, contas, sincronização, janelas e rotas.
   O app faz uma coisa: orçar serviços de elétrica e fechar a cobrança (enviar, aprovar, receber, recibo).
   Dois documentos: o orçamento, antes do serviço, e o relatório, para cobrar o que já foi feito. */
'use strict';
const VERSAO = '5.5.1';
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
// o telefone guardado: só os dígitos quando é um número com DDD (o campo mostra com parênteses e traço)
const foneGuardar = s => { const d = soDigitos(s); return d.length === 10 || d.length === 11 ? d : String(s || '').trim(); };
// o telefone toma forma enquanto se digita: (61) 9813, (61) 9813-6710, (61) 98136-7100 (5.5.0)
function foneDigitando(s) {
  const d = soDigitos(s); if (!d || d.length > 11) return String(s || '');
  if (d.length <= 2) return `(${d}`;
  const r = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${r.slice(0, 5)}-${r.slice(5)}`;
  return `(${d.slice(0, 2)}) ${r.length > 4 ? `${r.slice(0, 4)}-${r.slice(4)}` : r}`;
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

/* ================= banco de fábrica (Regras do app, Art. 9º: predial de baixa tensão) =================
   Na 5.3 o app não traz nenhum preço nem tempo de fábrica. Vem só um BANCO: categorias, ações, objetos e unidades. O serviço
   do eletricista nasce quando ele escolhe objeto e ação (o nome se monta), a unidade e o preço (em reais ou pelo tempo,
   vezes a hora dele). O item fica salvo nos Preços dele. Os materiais do banco também não têm preço. */
const UNIDADES = [['un', 'Unidade'], ['ponto', 'Ponto'], ['m', 'Metro'], ['m²', 'Metro quadrado'], ['h', 'Hora'], ['ida', 'Ida'], ['dia', 'Diária'], ['vb', 'Verba'], ['rolo', 'Rolo'], ['kit', 'Kit']];
const unTxt = (q, u) => ({ un: 'un.', ponto: q === 1 ? 'ponto' : 'pontos', m: 'm', 'm²': 'm²', h: 'h', ida: q === 1 ? 'ida' : 'idas', dia: q === 1 ? 'diária' : 'diárias', vb: q === 1 ? 'verba' : 'verbas', rolo: q === 1 ? 'rolo' : 'rolos', kit: q === 1 ? 'kit' : 'kits' }[u] || 'un.');
const unNome = u => (UNIDADES.find(x => x[0] === u) || UNIDADES[0])[1].toLowerCase();
const ACOES = [['instalacao', 'Instalação'], ['troca', 'Troca'], ['ponto', 'Ponto novo'], ['remocao', 'Remoção'], ['manutencao', 'Manutenção'], ['reparo', 'Reparo'], ['medicao', 'Medição'], ['inspecao', 'Inspeção'], ['montagem', 'Montagem'], ['passagem', 'Passagem']];
const acaoNome = a => (ACOES.find(x => x[0] === a) || [, ''])[1];
const maiuscula = s => s ? s[0].toLocaleUpperCase('pt-BR') + s.slice(1) : '';
// "Troca" + "disjuntor geral" = "Troca de disjuntor geral"; sem ação, o nome é o objeto
const nomeMontado = (a, o) => o ? (a ? `${acaoNome(a)} de ${o}` : maiuscula(o)) : '';
// Objeto: [nome, unidade, ação mais comum ('' = sem ação; sem o terceiro valor, Instalação)]
const BANCO = [
  ['tomadas', 'Tomadas e interruptores', 'tomada', [['tomada 10 A', 'un'], ['tomada 20 A', 'un'], ['tomada dupla', 'un'], ['tomada tripla', 'un'], ['tomada USB', 'un'], ['tomada de piso', 'un'], ['tomada de sobrepor', 'un'], ['tomada externa com tampa', 'un'], ['interruptor simples', 'un'], ['interruptor duplo', 'un'], ['interruptor triplo', 'un'], ['interruptor paralelo', 'un'], ['interruptor intermediário', 'un'], ['interruptor com tomada', 'un'], ['dimmer', 'un'], ['pulsador', 'un'], ['espelho ou placa', 'un', 'troca'], ['caixa 4x2', 'un'], ['caixa 4x4', 'un']]],
  ['iluminacao', 'Iluminação', 'lampada', [['ponto de luz', 'ponto', 'ponto'], ['lâmpada', 'un', 'troca'], ['luminária ou plafon', 'un'], ['lustre ou pendente', 'un'], ['spot embutido', 'un'], ['spot de sobrepor', 'un'], ['trilho de spots', 'm'], ['fita de LED', 'm'], ['perfil de LED', 'm'], ['fonte de LED', 'un'], ['arandela', 'un'], ['refletor', 'un'], ['sensor de presença', 'un'], ['fotocélula', 'un'], ['luminária de emergência', 'un'], ['balizador', 'un'], ['poste de jardim', 'un'], ['luminária tubular', 'un']]],
  ['quadro', 'Quadro e proteção', 'quadro', [['disjuntor monopolar', 'un', 'troca'], ['disjuntor bipolar', 'un', 'troca'], ['disjuntor tripolar', 'un', 'troca'], ['disjuntor geral', 'un', 'troca'], ['DR', 'un'], ['DPS', 'un'], ['quadro de distribuição', 'un', 'montagem'], ['barramento', 'un'], ['contator', 'un'], ['relé de tempo', 'un'], ['padrão de entrada', 'un'], ['caixa de medição', 'un'], ['haste de aterramento', 'un'], ['aterramento', 'un']]],
  ['aparelhos', 'Chuveiro e aparelhos', 'chuveiro', [['chuveiro', 'un'], ['resistência de chuveiro', 'un', 'troca'], ['torneira elétrica', 'un'], ['aquecedor de passagem', 'un'], ['boiler', 'un'], ['ventilador de teto', 'un'], ['exaustor', 'un'], ['coifa', 'un'], ['ar-condicionado', 'un', 'ponto'], ['cooktop', 'un'], ['forno elétrico', 'un'], ['máquina de lavar', 'un', 'ponto'], ["bomba d'água", 'un'], ['bomba de piscina', 'un'], ['carregador de veículo elétrico', 'un']]],
  ['fiacao', 'Fiação e infraestrutura', 'fiacao', [['fiação', 'm', 'passagem'], ['circuito', 'un'], ['eletroduto aparente', 'm'], ['eletroduto embutido', 'm'], ['eletrocalha', 'm'], ['canaleta', 'm'], ['caixa de passagem', 'un'], ['rasgo e fechamento na parede', 'm', ''], ['abertura de caixa na alvenaria', 'un', '']]],
  ['portao', 'Portão e interfone', 'interfone', [['campainha', 'un'], ['interfone', 'un'], ['porteiro eletrônico', 'un'], ['vídeo porteiro', 'un'], ['fechadura elétrica', 'un'], ['motor de portão', 'un'], ['botoeira', 'un'], ['cerca elétrica', 'm']]],
  ['laudos', 'Laudos e manutenção', 'laudo', [['instalação elétrica', 'un', 'inspecao'], ['quadro de distribuição', 'un', 'manutencao'], ['aterramento', 'un', 'medicao'], ['resistência de isolamento', 'un', 'medicao'], ['reaperto de conexões', 'un', ''], ['balanceamento de fases', 'un', ''], ['laudo técnico com ART', 'un', '']]],
  ['materiais', 'Materiais', 'material', [['Cabo flexível 1,5 mm²', 'm'], ['Cabo flexível 2,5 mm²', 'm'], ['Cabo flexível 4 mm²', 'm'], ['Cabo flexível 6 mm²', 'm'], ['Cabo flexível 10 mm²', 'm'], ['Cabo PP 2x1,5 mm²', 'm'], ['Cabo PP 3x2,5 mm²', 'm'], ['Tomada 10 A', 'un'], ['Tomada 20 A', 'un'], ['Interruptor simples', 'un'], ['Interruptor paralelo', 'un'], ['Placa 4x2', 'un'], ['Placa cega 4x2', 'un'], ['Caixa 4x2', 'un'], ['Caixa 4x4', 'un'], ['Caixa octogonal', 'un'], ['Eletroduto corrugado 3/4"', 'm'], ['Eletroduto rígido 3/4"', 'm'], ['Conector de emenda', 'un'], ['Terminal', 'un'], ['Fita isolante', 'un'], ['Abraçadeira', 'un'], ['Bucha e parafuso', 'un'], ['Disjuntor monopolar', 'un'], ['Disjuntor bipolar', 'un'], ['DR bipolar 40 A 30 mA', 'un'], ['DPS classe II 275 V 20 kA', 'un'], ['Haste de aterramento', 'un'], ['Lâmpada LED', 'un'], ['Plafon LED', 'un']]],
];
// os objetos de uma categoria: { nome, un, acao }
const objetosDe = catId => { const b = BANCO.find(x => 'c-' + x[0] === catId); return b ? b[3].map(([nome, un, acao]) => ({ nome, un, acao: acao === undefined ? 'instalacao' : acao })) : []; };
const catsBanco = () => BANCO.map(([id, nome, icone]) => ({ id: 'c-' + id, nome, icone }));
/* O catálogo com preço e tempo de fábrica que vinha até a 5.2.1. Não entra mais no app: serve só para reconhecer, na
   passagem para a 5.3, os itens de fábrica que a pessoa nunca mexeu (eles saem dos Preços e voltam ao banco). */
const SEMENTE_52 = [
  ['tomadas', 'Tomadas e interruptores', 'tomada', [['Instalação de tomada 10 A', 'un', 30], ['Instalação de interruptor simples', 'un', 30, 0, 9], ['Troca de tomada 10 A', 'un', 20, 0, 2], ['Troca de interruptor simples', 'un', 20, 0, 10], ['Ponto novo de tomada com fiação', 'ponto', 50, 0, 3], ['Tomada de uso específico 20 A', 'un', 40, 0, 4], ['Ponto de interruptor paralelo three-way', 'ponto', 60, 0, 5], ['Instalação de tomada dupla ou tripla', 'un', 35, 0, 6], ['Instalação de interruptor com dimmer', 'un', 40, 0, 7], ['Troca de espelho ou placa', 'un', 10, 0, 8]]],
  ['iluminacao', 'Iluminação', 'lampada', [['Instalação de luminária ou plafon', 'un', 45], ['Instalação de lustre ou pendente', 'un', 65], ['Instalação de spot embutido', 'un', 20], ['Instalação de fita de LED', 'm', 15], ['Instalação de sensor de presença', 'un', 55], ['Instalação de refletor externo', 'un', 60], ['Ponto de iluminação novo com fiação', 'ponto', 50], ['Instalação de arandela', 'un', 45]]],
  ['quadro', 'Quadro e proteção', 'quadro', [['Troca de disjuntor de circuito', 'un', 20, 0, 1], ['Troca de disjuntor geral', 'un', 30, 0, 9], ['Instalação de DR', 'un', 75, 0, 2], ['Instalação de DPS', 'un', 60, 0, 3], ['Montagem de quadro de distribuição', 'un', 450, 0, 4], ['Troca de quadro de distribuição', 'un', 480, 0, 5], ['Organização e identificação de quadro', 'un', 150, 0, 6], ['Aterramento com haste e conexões', 'un', 180, 0, 7], ['Instalação de padrão de entrada', 'un', 0, 150000, 8]]],
  ['aparelhos', 'Chuveiro e aparelhos', 'chuveiro', [['Instalação de chuveiro elétrico', 'un', 60], ['Troca de resistência do chuveiro', 'un', 40], ['Instalação de torneira elétrica', 'un', 55], ['Instalação de ventilador de teto', 'un', 90], ['Ponto e circuito para ar-condicionado', 'un', 150], ['Instalação de cooktop ou forno elétrico', 'un', 80], ["Instalação de bomba d'água", 'un', 120], ['Instalação de carregador de veículo elétrico', 'un', 0, 150000]]],
  ['fiacao', 'Fiação e infraestrutura', 'fiacao', [['Passagem de fiação', 'm', 5], ['Troca da fiação de um circuito', 'un', 120], ['Eletroduto aparente', 'm', 10], ['Instalação de eletroduto embutido', 'm', 15], ['Instalação de canaleta', 'm', 10], ['Rasgo e fechamento na parede', 'm', 15], ['Abertura de caixa na alvenaria', 'un', 25]]],
  ['portao', 'Portão e interfone', 'interfone', [['Instalação de campainha', 'un', 45], ['Instalação de interfone ou porteiro eletrônico', 'un', 100], ['Instalação de motor de portão', 'un', 180], ['Instalação de fechadura elétrica', 'un', 90]]],
  ['laudos', 'Laudos e manutenção', 'laudo', [['Inspeção de instalação elétrica', 'un', 150], ['Laudo técnico com ART', 'un', 0, 80000], ['Medição de aterramento', 'un', 100], ['Manutenção preventiva de quadro', 'un', 120], ['Reaperto de conexões', 'un', 75], ['Balanceamento de fases', 'un', 180]]],
  ['visita', 'Diária', 'visita', [['Diária técnica', 'dia', 0, 45000, 4]]],
  ['materiais', 'Materiais', 'material', [['Cabo flexível 1,5 mm²', 'm', 0, 250], ['Cabo flexível 2,5 mm²', 'm', 0, 350], ['Cabo flexível 4 mm²', 'm', 0, 550], ['Cabo flexível 6 mm²', 'm', 0, 850], ['Tomada 10 A', 'un', 0, 1800], ['Tomada 20 A', 'un', 0, 2200], ['Interruptor simples', 'un', 0, 1600], ['Caixa 4x2', 'un', 0, 250], ['Eletroduto corrugado 3/4"', 'm', 0, 250], ['DR bipolar 40 A 30 mA', 'un', 0, 15000], ['DPS classe II 275 V 20 kA', 'un', 0, 5500], ['Fita isolante', 'un', 0, 800], ['Interruptor paralelo', 'un', 0, 2200], ['Placa cega 4x2', 'un', 0, 600], ['Caixa 4x4', 'un', 0, 400], ['Caixa octogonal', 'un', 0, 500], ['Cabo flexível 10 mm²', 'm', 0, 1400], ['Eletroduto rígido 3/4"', 'm', 0, 800], ['Conector de emenda', 'un', 0, 200], ['Disjuntor monopolar', 'un', 0, 1800], ['Disjuntor bipolar', 'un', 0, 6000], ['Haste de aterramento', 'un', 0, 4500]]],
];
const CAT_MATERIAL = 'c-materiais';
// ação e objeto dos itens de fábrica da 5.1 e 5.2, pelo id (só para a passagem dos dados antigos)
const FAB_AO = {
  'tomadas-1': 'instalacao|tomada 10 A', 'tomadas-9': 'instalacao|interruptor simples', 'tomadas-2': 'troca|tomada 10 A', 'tomadas-10': 'troca|interruptor simples', 'tomadas-3': 'ponto|tomada 10 A', 'tomadas-4': 'instalacao|tomada 20 A', 'tomadas-5': 'ponto|interruptor paralelo', 'tomadas-6': 'instalacao|tomada dupla', 'tomadas-7': 'instalacao|dimmer', 'tomadas-8': 'troca|espelho ou placa',
  'iluminacao-1': 'instalacao|luminária ou plafon', 'iluminacao-2': 'instalacao|lustre ou pendente', 'iluminacao-3': 'instalacao|spot', 'iluminacao-4': 'instalacao|fita de LED', 'iluminacao-5': 'instalacao|sensor de presença', 'iluminacao-6': 'instalacao|refletor', 'iluminacao-7': 'ponto|ponto de luz', 'iluminacao-8': 'instalacao|arandela',
  'quadro-1': 'troca|disjuntor de circuito', 'quadro-9': 'troca|disjuntor geral', 'quadro-2': 'instalacao|DR', 'quadro-3': 'instalacao|DPS', 'quadro-4': 'montagem|quadro de distribuição', 'quadro-5': 'troca|quadro de distribuição', 'quadro-6': 'manutencao|quadro de distribuição', 'quadro-7': 'instalacao|haste de aterramento', 'quadro-8': 'instalacao|padrão de entrada',
  'aparelhos-1': 'instalacao|chuveiro', 'aparelhos-2': 'troca|resistência de chuveiro', 'aparelhos-3': 'instalacao|torneira elétrica', 'aparelhos-4': 'instalacao|ventilador de teto', 'aparelhos-5': 'ponto|ar-condicionado', 'aparelhos-6': 'instalacao|cooktop ou forno', 'aparelhos-7': "instalacao|bomba d'água", 'aparelhos-8': 'instalacao|carregador de veículo',
  'fiacao-1': 'passagem|fiação', 'fiacao-2': 'troca|fiação', 'fiacao-3': 'instalacao|eletroduto aparente', 'fiacao-4': 'instalacao|eletroduto embutido', 'fiacao-5': 'instalacao|canaleta',
  'portao-1': 'instalacao|campainha', 'portao-2': 'instalacao|interfone', 'portao-3': 'instalacao|motor de portão', 'portao-4': 'instalacao|fechadura elétrica',
  'laudos-1': 'inspecao|', 'laudos-3': 'medicao|aterramento', 'laudos-4': 'manutencao|quadro de distribuição', 'laudos-5': 'manutencao|quadro de distribuição', 'laudos-6': 'manutencao|quadro de distribuição',
};
const aoDe = id => (FAB_AO[String(id).replace(/^p-/, '')] || '|').split('|');
// cômodos de fábrica para o levantamento; o nome é livre
const COMODOS = ['Sala', 'Cozinha', 'Quarto', 'Banheiro', 'Área de serviço', 'Varanda', 'Corredor', 'Garagem', 'Área externa'];
// o app começa com as categorias do banco e nenhum preço
const semente = () => ({ cats: catsBanco(), precos: [] });
// o catálogo de fábrica da 5.2.1, com os ids fixos de então (só para reconhecer os itens antigos)
function semente52() {
  const cats = [], precos = [];
  SEMENTE_52.forEach(([id, nome, icone, L]) => {
    cats.push({ id: 'c-' + id, nome, icone });
    L.forEach(([n, un, min, preco, k], i) => { const pid = `p-${id}-${k || i + 1}`, [acao, obj] = aoDe(pid); precos.push({ id: pid, cat: 'c-' + id, nome: n, un, min, fixo: !min, preco: preco || 0, reais: [], acao, obj }); });
  });
  return { cats, precos };
}
// o que a versão 5 tirou do catálogo: o diagnóstico por tempo ocupa o lugar da visita, da hora técnica e da localização de curto
const CORTADOS = ['p-visita-1', 'p-visita-2', 'p-visita-3'];
const FABRICA = Object.fromEntries(semente52().precos.map(p => [p.id, p]));
const HORA_EXEMPLO = 12000; // só para o orçamento de exemplo e o guia, antes de a pessoa dizer a hora dela
const tempoTxt = m => { m = Math.max(0, Math.round(m || 0)); const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h}h${String(r).padStart(2, '0')}` : `${h} h`) : `${r} min`; };

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
  validade: 10, garAd: 0, pag: 'vista', entradaPct: 50, obs: '', seq: 0, raio: true, usos: {},
  // a hora é a base dos preços (0 = ainda não informada); os três números de "Descobrir minha hora"; deslocamento, diária,
  // mínimo por ida e condição. Nenhum valor em dinheiro vem de fábrica: o que está em 0 é pedido na primeira vez que se usa
  hora: 0, hTirar: 0, hCustos: 0, hHoras: 0, deslModo: 'fixo', deslIda: 0, deslKm: 0, diaria: 0, minIda: 0, cond1: 25, cond2: 50, tab: 0 };
const ETAPAS = { orc: ['rascunho', 'enviado', 'aprovado', 'recebido'], rel: ['rascunho', 'enviado', 'recebido'] };
const NOME_ETAPA = { rascunho: 'Rascunho', enviado: 'Enviado', aprovado: 'Aprovado', recebido: 'Recebido', recusado: 'Recusado' };
const TIPO = { orc: { nome: 'Orçamento', titulo: 'ORÇAMENTO', arquivo: 'Orcamento' }, rel: { nome: 'Relatório', titulo: 'RELATÓRIO DE SERVIÇO', arquivo: 'Relatorio' } };
const MEIOS = ['Pix', 'Dinheiro', 'Cartão', 'Transferência'];
const num = (v, d = 0) => { const n = Number(v); return isFinite(n) ? n : d; };
const txt = v => typeof v === 'string' ? v : '';
// os ids entram em endereços e em seletores da tela: só letras, números, _ e -
const idOk = v => typeof v === 'string' && /^[\w-]{1,48}$/.test(v) ? v : '';
// o que vem do armazenamento, da nuvem ou de uma cópia passa por aqui: campo que falta ou veio torto ganha o padrão
// tipo da linha: '' serviço, 'diag' diagnóstico por tempo, 'desl' deslocamento por ida, 'mat' material
function acertaLinha(l) {
  const tipo = ['diag', 'desl', 'mat'].includes(l.tipo) ? l.tipo : '', pu = Math.max(0, Math.round(num(l.pu)));
  const o = { id: idOk(l.id) || uid(), pid: idOk(l.pid), tipo, nome: txt(l.nome) || 'Serviço', un: UNIDADES.some(u => u[0] === l.un) ? l.un : 'un', q: Math.max(1, Math.min(9999, Math.round(num(l.q, 1)))), pu };
  if (tipo === 'diag') { o.min = Math.max(5, Math.min(6000, Math.round(num(l.min, 60)))); o.q = 1; o.un = 'h'; }
  else if (tipo === 'desl') { o.un = 'ida'; o.km = Math.max(0, Math.min(9999, Math.round(num(l.km)))); o.vkm = Math.max(0, Math.round(num(l.vkm))); }
  else if (!tipo) { o.cond = [1, 2].includes(l.cond) ? l.cond : 0; o.base = o.cond ? Math.max(0, Math.round(num(l.base, pu))) : pu; o.motivo = txt(l.motivo).slice(0, 120); }
  else if (tipo === 'mat') { o.comp = txt(l.comp).slice(0, 60); if (l.lista) o.lista = true; }
  // o cômodo da linha, no levantamento; diagnóstico e deslocamento ficam em Geral
  o.com = tipo === 'diag' || tipo === 'desl' ? '' : txt(l.com).slice(0, 40);
  return o;
}
// material contado no levantamento: fica fora do total até "Pôr no orçamento"; quem: 'eu' (eu levo) ou 'cli' (o cliente compra)
const acertaMat = m => ({ id: idOk(m.id) || uid(), pid: idOk(m.pid), nome: txt(m.nome).slice(0, 80) || 'Material', un: UNIDADES.some(u => u[0] === m.un) ? m.un : 'un',
  q: Math.max(1, Math.min(9999, Math.round(num(m.q, 1)))), pu: Math.max(0, Math.round(num(m.pu))), comp: txt(m.comp).slice(0, 60), quem: m.quem === 'cli' ? 'cli' : 'eu', com: txt(m.com).slice(0, 40), ok: !!m.ok });
// Garantia (CDC): a legal, de 90 dias para reclamar de vício em serviço durável (art. 26, II), vale sempre, independe de
// termo e não pode ser excluída nem reduzida (arts. 24, 25 e 51, I). O eletricista só escolhe uma garantia contratual
// ADICIONAL, complementar à legal, dada por escrito no documento (art. 50). garAd = meses a mais: 0, 3, 6 ou 12.
// Dado antigo (garantia em dias, que podia ser menor que 90): nunca se reduz o que foi prometido ao cliente; abaixo de 90
// dias sobe para a legal, acima dela vira o menor adicional que cobre o que passava de 90.
const GAR_AD = [[0, 'Nenhuma além da lei'], [3, '+3 meses'], [6, '+6 meses'], [12, '+1 ano']];
function garAdDe(x) {
  if (x.garAd !== undefined) return GAR_AD.some(g => g[0] === +x.garAd) ? +x.garAd : 0;
  const extra = Math.round(num(x.garantia, 90)) - 90; if (extra <= 0) return 0;
  return (GAR_AD.find(g => g[0] * 30 >= extra) || GAR_AD[GAR_AD.length - 1])[0];
}
const GAR_LEI = 'Garantia legal de 90 dias para reclamar de defeito no serviço, contados do término do serviço (Código de Defesa do Consumidor, art. 26, II). Ela vale sempre e não pode ser excluída nem reduzida.';
const garAdTxt = m => m === 12 ? '1 ano' : `${m} meses`;
const garCurta = d => d.garAd ? `90 dias da lei + ${garAdTxt(d.garAd)}` : '90 dias, da lei';
// prazo do serviço (CDC, art. 40): início previsto e quantos dias leva; o término é o último dia
const fimPrevisto = d => d.inicio && d.dias ? d.inicio + (d.dias - 1) * 86400000 : null;
const prazoTxt = d => d.inicio && d.dias ? `Início previsto em ${dataBR(d.inicio)} e término até ${dataBR(fimPrevisto(d))} (${plural(d.dias, 'dia', 'dias')} de serviço).` : '';
// os dados do cliente que fazem o documento nascer: nome, telefone e endereço do serviço
const clienteOk = c => !!c && txt(c.nome).trim().length >= 2 && String(c.fone || '').replace(/\D/g, '').length >= 10 && txt(c.end).trim().length >= 3;
function acertaDoc(d) {
  d = d && typeof d === 'object' ? d : {};
  const tipo = d.tipo === 'rel' ? 'rel' : 'orc', c = d.cliente && typeof d.cliente === 'object' ? d.cliente : {};
  const etapa = d.etapa === 'recusado' && tipo === 'orc' ? 'recusado' : ETAPAS[tipo].includes(d.etapa) ? d.etapa : 'rascunho';
  return { id: idOk(d.id) || uid(), num: Math.max(0, Math.round(num(d.num))), tipo, etapa,
    cliente: { nome: txt(c.nome), fone: txt(c.fone), end: txt(c.end), doc: txt(c.doc) }, titulo: txt(d.titulo),
    linhas: (Array.isArray(d.linhas) ? d.linhas : []).filter(l => l && typeof l === 'object').map(acertaLinha),
    desc: Math.max(0, Math.round(num(d.desc))), descPct: Math.max(0, Math.min(100, Math.round(num(d.descPct)))), descNome: txt(d.descNome).slice(0, 60), minIda: Math.max(0, Math.round(num(d.minIda))), tempoOk: !!d.tempoOk, pag: tipo === 'orc' && d.pag === 'entrada' ? 'entrada' : d.pag === 'combinar' ? 'combinar' : 'vista',
    entradaPct: [30, 40, 50, 60, 70].includes(d.entradaPct) ? d.entradaPct : 50, validade: Math.max(1, Math.min(365, Math.round(num(d.validade, 10)))), garAd: garAdDe(d),
    inicio: num(d.inicio) || null, dias: Math.max(0, Math.min(365, Math.round(num(d.dias)))),
    feito: num(d.feito) || null, obs: txt(d.obs),
    comodos: (Array.isArray(d.comodos) ? d.comodos : []).map(c => txt(c).slice(0, 40)).filter((c, i, a) => c && a.indexOf(c) === i).slice(0, 40),
    mats: (Array.isArray(d.mats) ? d.mats : []).filter(m => m && typeof m === 'object').map(acertaMat).slice(0, 500), quem: d.quem === 'cli' ? 'cli' : 'eu',
    pagos: (Array.isArray(d.pagos) ? d.pagos : []).filter(p => p && num(p.v) > 0).map(p => ({ id: idOk(p.id) || uid(), v: Math.round(num(p.v)), em: num(p.em) || Date.now(), meio: MEIOS.includes(p.meio) ? p.meio : 'Pix' })),
    criado: num(d.criado) || Date.now(), mudou: num(d.mudou) || Date.now(), enviadoEm: num(d.enviadoEm) || null, aprovadoEm: num(d.aprovadoEm) || null, ...(d.exemplo ? { exemplo: true } : {}) };
}
// preço guardado antes da versão 5 não tem tempo: o de fábrica ganha o tempo típico de fábrica; o que a pessoa criou vira preço fixo
function acertaPreco(p) {
  const id = idOk(p.id) || uid(), velho = p.min === undefined && p.fixo === undefined, F = FABRICA[id];
  if (velho && F) return { ...F, cat: idOk(p.cat) || F.cat, reais: [] };
  const min = velho ? 0 : Math.max(0, Math.min(6000, Math.round(num(p.min)))), fixo = velho || !!p.fixo || !min || p.cat === CAT_MATERIAL;
  return { id, cat: idOk(p.cat), nome: txt(p.nome) || 'Serviço', un: UNIDADES.some(u => u[0] === p.un) ? p.un : 'un', min, fixo, preco: Math.max(0, Math.round(num(p.preco))),
    reais: (Array.isArray(p.reais) ? p.reais : []).map(n => Math.round(num(n))).filter(n => n > 0 && n <= 6000).slice(-5),
    acao: ACOES.some(a => a[0] === p.acao) ? p.acao : '', obj: txt(p.obj).slice(0, 60) };
}
const acertaCat = c => ({ id: idOk(c.id) || uid(), nome: txt(c.nome) || 'Categoria', icone: PIC[c.icone] ? c.icone : 'raio' });
function acertaAjustes(a) {
  const o = { ...DEF, ...(a && typeof a === 'object' ? a : {}) };
  ['nome', 'empresa', 'fone', 'email', 'doc', 'registro', 'cidade', 'pix', 'logo', 'obs'].forEach(k => { o[k] = txt(o[k]); });
  o.validade = Math.max(1, Math.min(365, Math.round(num(o.validade, 10)))); o.garAd = garAdDe(a && typeof a === 'object' && a.garAd === undefined && a.garantia !== undefined ? { garantia: a.garantia } : o); delete o.garantia;
  o.pag = ['vista', 'entrada', 'combinar'].includes(o.pag) ? o.pag : 'vista'; o.entradaPct = [30, 40, 50, 60, 70].includes(o.entradaPct) ? o.entradaPct : 50;
  o.seq = Math.max(0, Math.round(num(o.seq))); o.raio = o.raio !== false;
  ['hora', 'hTirar', 'hCustos', 'hHoras', 'deslIda', 'deslKm', 'diaria', 'minIda', 'tab'].forEach(k => { o[k] = Math.max(0, Math.min(99999999, Math.round(num(o[k])))); });
  o.deslModo = o.deslModo === 'km' ? 'km' : 'fixo'; o.cond1 = Math.max(0, Math.min(300, Math.round(num(o.cond1, 25)))); o.cond2 = Math.max(0, Math.min(300, Math.round(num(o.cond2, 50)))); o.logoProp = num(o.logoProp, 1) || 1;
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(o.logo)) o.logo = ''; // o logotipo é sempre uma imagem guardada no aparelho, nunca um endereço
  const U = {}; if (o.usos && typeof o.usos === 'object' && !Array.isArray(o.usos)) for (const k of Object.keys(o.usos)) if (idOk(k) && num(o.usos[k]) > 0) U[k] = Math.round(num(o.usos[k]));
  o.usos = U;
  return o;
}
// preço sem categoria (ela foi excluída em outro aparelho) vai para "Outros"
function acertaCatalogo() {
  precos = precos.filter(p => !CORTADOS.includes(p.id));
  const vis = cats.find(c => c.id === 'c-visita'); if (vis && vis.nome === 'Visita e hora') vis.nome = 'Diária';
  const ids = new Set(cats.map(c => c.id)), soltos = precos.filter(p => !ids.has(p.cat));
  if (!soltos.length) return;
  if (!ids.has('c-outros')) cats.push({ id: 'c-outros', nome: 'Outros', icone: 'ferramenta' });
  soltos.forEach(p => { p.cat = 'c-outros'; });
}
let ajustes = acertaAjustes(LS.get('ajustes', {}));
let cats = LS.get('cats', null), precos = LS.get('precos', null), docs = LS.get('docs', null);
// começo do zero: as categorias do banco, nenhum preço, e nenhuma passagem de versão a fazer
if (!Array.isArray(cats) || !Array.isArray(precos)) { const s = semente(); cats = s.cats; precos = s.precos; ajustes.tab = Math.max(ajustes.tab, 7); }
cats = cats.map(acertaCat); precos = precos.map(acertaPreco); acertaCatalogo();
// primeira abertura da versão 5 com um catálogo antigo: entra o disjuntor geral, que não existia
if (ajustes.tab < 5) {
  if (!precos.some(p => p.id === 'p-quadro-9') && cats.some(c => c.id === 'c-quadro')) { const i = precos.findIndex(p => p.id === 'p-quadro-1'); precos.splice(i + 1, 0, { ...FABRICA['p-quadro-9'], reais: [] }); }
  ajustes.tab = 5; LS.set('precos', precos); LS.set('ajustes', ajustes);
}
// Primeira abertura da 5.1: o catálogo de fábrica ganha ação e objeto; "tomada ou interruptor" vira dois itens; os
// materiais perdem o "com placa" no nome e entram 10 novos. Só mexe no que ainda está como saiu de fábrica:
// nome, tempo e preço que a pessoa mudou ficam como estão. Documentos, ajustes e a hora não mudam.
if (ajustes.tab < 6) {
  const VELHO = { 'p-tomadas-1': 'Instalação de tomada ou interruptor', 'p-tomadas-2': 'Troca de tomada ou interruptor', 'p-materiais-5': 'Tomada 10 A com placa', 'p-materiais-6': 'Tomada 20 A com placa', 'p-materiais-7': 'Interruptor simples com placa' };
  precos.forEach(p => {
    if (VELHO[p.id] && p.nome === VELHO[p.id]) p.nome = FABRICA[p.id].nome;
    if (FABRICA[p.id] && !p.acao && !p.obj) { const [a, o] = aoDe(p.id); p.acao = a; p.obj = o; }
  });
  const poe = (id, depois) => { if (precos.some(p => p.id === id) || !cats.some(c => c.id === FABRICA[id].cat)) return; const i = precos.findIndex(p => p.id === depois); precos.splice(i < 0 ? precos.length : i + 1, 0, { ...FABRICA[id], reais: [] }); };
  poe('p-tomadas-9', 'p-tomadas-1'); poe('p-tomadas-10', 'p-tomadas-2');
  for (let k = 13; k <= 22; k++) poe('p-materiais-' + k, 'p-materiais-' + (k - 1));
  ajustes.tab = 6; LS.set('precos', precos); LS.set('ajustes', ajustes);
}
/* Primeira abertura da 5.3: sem preço de fábrica. O item de fábrica que a pessoa nunca mexeu (nome, unidade, categoria,
   tempo e preço iguais aos de fábrica, sem tempo real anotado) sai dos Preços e volta a ser só ação e objeto no banco.
   Fica o que ela criou e o que ela mudou. A "Diária técnica" vira o valor da diária em Ajustes, se o preço era dela.
   A categoria "Diária", vazia e com o nome de fábrica, sai. Documentos, ajustes e a hora não mudam. */
const precoDe52 = p => p.fixo ? p.preco : Math.round(p.min * (ajustes.hora || HORA_EXEMPLO) / 60);
const intocado = p => { const F = FABRICA[p.id]; return !!F && p.nome === F.nome && p.un === F.un && p.cat === F.cat && !!p.fixo === !!F.fixo && (F.fixo ? p.preco === F.preco : p.min === F.min) && !(p.reais || []).length; };
if (ajustes.tab < 7) {
  const dia = precos.find(p => p.id === 'p-visita-4');
  if (dia && !ajustes.diaria && !intocado(dia)) ajustes.diaria = precoDe52(dia);
  precos = precos.filter(p => !intocado(p) && p.id !== 'p-visita-4');
  const vis = cats.find(c => c.id === 'c-visita'); if (vis && vis.nome === 'Diária' && !precos.some(p => p.cat === 'c-visita')) cats = cats.filter(c => c !== vis);
  ajustes.tab = 7; LS.set('precos', precos); LS.set('cats', cats); LS.set('ajustes', ajustes);
}
docs = (Array.isArray(docs) ? docs : []).map(acertaDoc);

/* ================= Kit Fácil: moldura, tema e sincronização ================= */
const NOVIDADES = [{ versao: '5.5.1', itens: [
  'A primeira tela diz que o cliente pode pagar por Pix, e o QR code do desenho ficou nítido.',
] }, { versao: '5.5.0', itens: [
  'Primeiro uso novo: a proposta que o cliente recebe, os seus dados, a sua hora e o convite para fazer o guia.',
  'O telefone toma forma enquanto você digita.',
  'O botão de continuar fica sempre à vista, também nos seus dados.',
] }, { versao: '5.4.0', itens: [
  'O Mais ganhou atalhos para o seu trabalho: hora e cobrança, chave Pix, padrões do orçamento e seus dados.',
  'Cada atalho mostra o que falta, e a volta leva de novo ao Mais.',
] }, { versao: '5.3.1', itens: [
  'O tempo agora se escolhe em rodas, horas e minutos, igual em todas as telas.',
  'O aviso não cobre mais botões nem campos, e some quando você troca de tela.',
  'Novo serviço mostra 8 objetos e "Ver todos"; a fila de categorias mostra que rola.',
  'No tablet, o menu fica do lado, como no computador.',
  'A seta de um documento volta a Documentos, se você veio de lá, ou ao Início.',
] }, { versao: '5.3.0', itens: [
  'Os preços agora são só seus: o app não traz nenhum preço nem tempo de fábrica.',
  'Novo serviço em poucos toques: escolha o objeto e a ação, e dê o preço em reais ou pelo tempo.',
  'O serviço que você cria no orçamento fica salvo nos seus Preços, para a próxima vez.',
  'Na primeira vez, o app pede os seus dados e a sua hora. Dá para pular e informar no primeiro orçamento.',
] }, { versao: '5.2.1', itens: [
  'Preços virou uma tabela: busque, filtre pela categoria e veja todos os preços de uma vez.',
  'Ícones novos e mais claros em todo o app.',
  'Uma ação só em cada lugar: o + da barra de baixo cria o documento.',
] }, { versao: '5.2.0', itens: [
  'Cara nova: fundo neutro e o amarelo só no que importa, no claro e no escuro.',
  'No documento, o total fica sempre no alto, com a divisão entre mão de obra, deslocamento e material.',
  'Cada cômodo é um cartão: deslize para o lado ou toque em Ver em lista.',
] }, { versao: '5.1.1', itens: [
  'Garantia conforme a lei: os 90 dias do Código de Defesa do Consumidor saem sempre no documento; você escolhe só a garantia a mais.',
  'O orçamento traz o início e o término previstos do serviço, como pede a lei.',
  'O documento começa pelo cliente: nome, telefone e endereço do serviço.',
] }, { versao: '5.1.0', itens: [
  'Levantamento por cômodo: na visita, some o que há para fazer, cômodo por cômodo.',
  'Conte o material no cômodo e saia com a lista de compras.',
  'Lista de materiais com o que você leva e o que o cliente compra.',
  'Ação e objeto no cadastro: o nome se monta sozinho e o filtro acha rápido.',
  'O cliente vê o orçamento separado por cômodo.',
] }, { versao: '5.0.0', itens: [
  'A sua hora é a base dos preços: diga quanto vale, ou descubra pela conta do mês.',
  'Cada serviço guarda o tempo típico. Mudou a hora, os preços acompanham.',
  'Diagnóstico por tempo, deslocamento por ida e valor mínimo por ida entram no documento.',
  'Condição do serviço num toque: normal, difícil ou muito difícil.',
  'Desconto em porcentagem, com nome: o cliente vê o valor cheio e o desconto.',
  'Anote o tempo real depois do serviço e a tabela passa a ter os seus tempos.',
] }, { versao: '4.0.0', itens: [
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
KitFacil.tema.iniciar({ chave: 'eletricafacil.pref', cores: { claro: '#F4F3EF', escuro: '#141518' } });
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
const HORA = () => ajustes.hora || HORA_EXEMPLO;
// o preço de um item da tabela: fixo, ou o tempo típico vezes a hora
const precoDe = p => p.fixo ? p.preco : Math.round(p.min * HORA() / 60);
const condPct = k => k === 1 ? ajustes.cond1 : k === 2 ? ajustes.cond2 : 0;
const NOME_COND = ['Normal', 'Difícil', 'Muito difícil'];
const totalLinha = l => l.tipo === 'diag' ? Math.round(l.min * l.pu / 60) : Math.round(l.q * l.pu);
// Mão de obra, deslocamento e material somam separados. O mínimo por ida completa a mão de obra quando ela fica abaixo
// do mínimo vezes o número de idas (sem linha de deslocamento, conta uma ida). O desconto em porcentagem não incide
// sobre material. O valor do mínimo é o que valia quando o documento foi criado (d.minIda).
function conta(d) {
  const de = t => soma(d.linhas.filter(l => (l.tipo || '') === t).map(totalLinha));
  const mat = de('mat'), desl = de('desl'), serv = de('') + de('diag');
  const idas = soma(d.linhas.filter(l => l.tipo === 'desl').map(l => l.q)) || 1;
  const minimo = d.minIda > 0 && serv > 0 && serv < d.minIda * idas ? d.minIda * idas - serv : 0;
  const mao = serv + minimo, sub = mao + desl + mat;
  const desc = d.descPct > 0 ? Math.round((sub - mat) * d.descPct / 100) : Math.min(Math.max(0, d.desc || 0), sub), total = sub - desc;
  const entrada = d.pag === 'entrada' ? Math.round(total * d.entradaPct / 100) : 0;
  const pago = soma((d.pagos || []).map(p => p.v));
  return { mao, minimo, desl, mat, idas, sub, desc, total, entrada, resto: total - entrada, pago, falta: Math.max(0, total - pago) };
}
const descTxt = d => d.descPct > 0 ? `${d.descNome || 'Desconto'} (${d.descPct}%)` : 'Desconto';
// As linhas como o cliente vê: preço fechado por serviço, sem horas; o tempo só aparece no diagnóstico.
// Com cômodos, as linhas saem agrupadas: cada cômodo na ordem do levantamento, depois Geral e Material.
const grupoDe = (d, l) => !d.comodos.length ? '' : l.tipo === 'mat' ? 'Material' : l.com && d.comodos.includes(l.com) ? l.com : 'Geral';
const gruposDoc = d => d.comodos.length ? [...d.comodos, 'Geral', 'Material'] : [''];
function linhasCliente(d, c = conta(d)) {
  const G = gruposDoc(d), ord = l => G.indexOf(grupoDe(d, l));
  const LL = d.linhas.map((l, i) => [l, i]).sort((a, b) => ord(a[0]) - ord(b[0]) || a[1] - b[1]).map(x => x[0]);
  const L = LL.map(l => l.tipo === 'diag' ? { nome: `${l.nome} (${tempoTxt(l.min)})`, sub: '', qtd: '', pu: '', total: totalLinha(l) }
    : l.tipo === 'desl' ? { nome: `${l.nome} (${l.q} ${unTxt(l.q, 'ida')})`, sub: '', qtd: '', pu: '', total: totalLinha(l) }
    : { nome: l.nome, sub: l.motivo || l.comp || '', qtd: `${l.q} ${unTxt(l.q, l.un)}`, pu: BRL(l.pu), total: totalLinha(l) });
  L.forEach((x, k) => { x.grupo = grupoDe(d, LL[k]); });
  if (c.minimo) { const i = LL.findIndex(l => l.tipo === 'desl' || l.tipo === 'mat'); L.splice(i < 0 ? L.length : i, 0, { nome: 'Atendimento mínimo', sub: '', qtd: '', pu: '', total: c.minimo, grupo: d.comodos.length ? 'Geral' : '' }); }
  if (d.comodos.length) { const G2 = gruposDoc(d); L.sort((a, b) => G2.indexOf(a.grupo) - G2.indexOf(b.grupo)); }
  return L;
}
// subtotal de cada grupo, para o cabeçalho do cômodo
const totaisGrupo = L => L.reduce((o, l) => (o[l.grupo] = (o[l.grupo] || 0) + l.total, o), {});
// Lista de materiais: soma por material, complemento e quem compra; com cômodo, separa por cômodo
function listaMats(d, porComodo = false) {
  const M = new Map();
  d.mats.forEach(m => { const k = [m.quem, porComodo ? m.com : '', m.pid || m.nome, m.comp].join('\u0001'); const x = M.get(k); if (x) { x.q += m.q; x.ids.push(m.id); x.ok = x.ok && m.ok; } else M.set(k, { ...m, com: porComodo ? m.com : '', ids: [m.id] }); });
  return [...M.values()];
}
// o que "Pôr no orçamento" leva: só a parte "Eu levo", somada, como linhas de material
// o preço do material nos seus Preços (pelo item ou pelo nome): o banco não traz preço; sem ele, 0
const precoMat = m => { const p = precos.find(x => x.cat === CAT_MATERIAL && (x.id === m.pid || (!m.pid || !precos.some(y => y.id === m.pid)) && dobra(x.nome) === dobra(m.nome))); return p ? p.preco : 0; };
function porNoOrcamento(d) {
  d.linhas = d.linhas.filter(l => !(l.tipo === 'mat' && l.lista));
  listaMats(d).filter(m => m.quem === 'eu').forEach(m => { d.linhas.push(acertaLinha({ tipo: 'mat', lista: true, pid: m.pid, nome: m.nome, un: m.un, q: m.q, pu: precoMat(m), comp: m.comp })); });
}
// a lista que vai para o cliente comprar: só a parte dele, sem preços
function mensagemLista(d) {
  const nome = primeiroNome(d.cliente.nome), L = listaMats(d).filter(m => m.quem === 'cli');
  return [`Olá${nome ? ', ' + nome : ''}!`, 'Segue a lista do material para comprar:', ...L.map(m => `• ${m.q} ${unTxt(m.q, m.un)} · ${m.nome}${m.comp ? ' (' + m.comp + ')' : ''}`), ...(assinatura().length ? ['', assinatura().join(' · ')] : [])].join('\n');
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
  if (c.total === 0 && c.sub > 0) return 'Cortesia: nada a pagar.';
  if (d.pag === 'entrada') return `Entrada de ${d.entradaPct}% (${BRL(c.entrada)}) na aprovação e ${BRL(c.resto)} na conclusão do serviço.`;
  if (d.pag === 'combinar') return 'Forma de pagamento a combinar.';
  return d.tipo === 'rel' ? 'Pagamento à vista.' : 'Pagamento à vista, na conclusão do serviço.';
}
const pagCurto = d => d.pag === 'entrada' ? `Entrada de ${d.entradaPct}%` : d.pag === 'combinar' ? 'A combinar' : 'À vista';
const garantiaTxt = d => d.garAd ? `${GAR_LEI} Além dela, garantia contratual de ${garAdTxt(d.garAd)}, dada por este documento e somada à legal (art. 50).` : GAR_LEI;
// o próximo passo de cada documento: é o botão do pé
function proximo(d) {
  if (d.etapa === 'recusado') return { id: 'reabrir', rotulo: 'Reabrir', frase: 'O cliente recusou. Reabra para mudar e enviar de novo.' };
  const cortesia = d.linhas.length && conta(d).total === 0;
  if (cortesia && d.etapa === 'recebido') return { id: 'pdf', rotulo: 'Ver o PDF', frase: 'Cortesia concluída. Nada a receber.' };
  if (cortesia && ((d.tipo === 'orc' && d.etapa === 'aprovado') || (d.tipo === 'rel' && d.etapa === 'enviado'))) return { id: 'concluir', rotulo: 'Concluir', frase: 'Cortesia: nada a receber. Conclua quando o serviço estiver feito.' };
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
function novoDocumento(tipo, cliente) {
  // o cliente é pedido ao criar o documento, sem Pular: a lei exige o cliente identificado (Código, Art. 64-D, § 2º).
  // Os seus dados e a sua hora vêm depois, antes de somar o primeiro serviço (Art. 64-D, § 1º; janelaSomar)
  if (!clienteOk(cliente)) return janelaNovoCliente(tipo, c => novoDocumento(tipo, c));
  const d = acertaDoc({ id: uid(), tipo, num: 0, cliente, minIda: ajustes.minIda, validade: ajustes.validade, garAd: ajustes.garAd, pag: tipo === 'orc' ? ajustes.pag : (ajustes.pag === 'combinar' ? 'combinar' : 'vista'), entradaPct: ajustes.entradaPct, obs: ajustes.obs, feito: tipo === 'rel' ? Date.now() : null, criado: Date.now(), mudou: Date.now() });
  d.num = ++ajustes.seq; salvarAjustes();
  docs.unshift(d); salvarDocs();
  ir('/d/' + d.id);
  return d;
}
// O exemplo não usa os seus Preços: cada linha sai de um tempo de exemplo vezes a sua hora (ou a hora de exemplo)
function criarExemplo() {
  docs = docs.filter(d => !d.exemplo);
  const lin = (nome, un, min, q) => ({ id: uid(), pid: '', nome, un, q, pu: Math.round(min * HORA() / 60) });
  const d = acertaDoc({ id: 'exemplo', tipo: 'orc', exemplo: true, cliente: { nome: 'Mariana Souza', fone: '(11) 98888-7777', end: 'Rua das Acácias, 120' }, titulo: 'Reforma elétrica da cozinha',
    linhas: [lin('Ponto novo de tomada 10 A', 'ponto', 50, 6), lin('Instalação de luminária ou plafon', 'un', 45, 3), lin('Instalação de DR', 'un', 75, 1), lin('Instalação de chuveiro', 'un', 60, 1)],
    pag: 'entrada', entradaPct: 50, validade: ajustes.validade, garAd: ajustes.garAd, inicio: Date.now() + 7 * 86400000, dias: 2, obs: 'Material por conta do cliente.', criado: Date.now(), mudou: Date.now() });
  docs.unshift(d); salvarDocs(); ir('/d/' + d.id);
  return d;
}
// os seus dados que saem na proposta: o nome e o WhatsApp bastam para o documento sair
const dadosOk = () => ajustes.nome.trim().length >= 2 && soDigitos(ajustes.fone).length >= 10;
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
