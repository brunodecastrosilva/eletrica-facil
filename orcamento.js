/* Elétrica Fácil · o orçamento: criar, a folha do orçamento, itens, ambientes, deslocamento, proposta, mensagens, Pix, PDF e recibo. */
'use strict';
/* ================= criar, duplicar, excluir ================= */
function createQuote(client) {
  openSheet({ title: 'O que você vai fazer?', body: `<div class="kind-pick">
      <button data-kind="quote"><span class="ki">${I.doc}</span><span><b>Orçamento</b><small>Antes do serviço. Proposta com valores, prazos e validade para o cliente aprovar.</small></span></button>
      <button data-kind="report"><span class="ki">${I.check}</span><span><b>Relatório de serviço</b><small>Serviço já feito. Registra o diagnóstico, o que foi executado, os testes e os valores.</small></span></button>
    </div>`,
    onMount: s => $$('[data-kind]', s).forEach(b => b.onclick = () => { closeSheet(true); startQuote(client, b.dataset.kind === 'report'); }) });
}
function startQuote(client, report) {
  const q = blankQuote();
  settings.seq = (settings.seq || 0) + 1; q.num = settings.seq; saveSettings();
  if (client) q.client = { name: client.name, phone: client.phone || '', address: client.address || '' };
  quotes.unshift(q);
  if (report) { setStatus(q, 'concluido'); q.prevStatus = 'rascunho'; }
  saveQuotes();
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
  go('/q/' + q.id);
}
function createExample() {
  const ex = quotes.find(q => q.example);
  if (ex) return go('/q/' + ex.id);
  const q = blankQuote();
  const sala = { id: uid(), name: 'Sala' }, coz = { id: uid(), name: 'Cozinha' };
  const it = (room, kind, name, unit, qty, price) => ({ id: uid(), kind, name, unit, qty, price, room });
  Object.assign(q, { example: true, status: 'enviado', sentAt: Date.now() - 2 * DAY, createdAt: Date.now() - 2 * DAY,
    client: { name: 'Mariana Souza', phone: '11912345678', address: 'Rua das Acácias, 120 – Vila Mariana' },
    title: 'Reforma elétrica da sala e da cozinha', deadline: '2 dias úteis', discount: { mode: 'pct', value: 0, pct: 5 },
    payment: { mode: 'entrada', entryPct: 50, installments: 3 },
    trip: { km: 12, roundTrip: true, visits: 2, minutes: 0, toll: 0, kmPerL: 10, fuelPrice: 619, wearPerKm: 40, hourRate: 0, minVisit: 0 },
    notes: 'Não inclui reparos de alvenaria, gesso ou pintura.\nA energia será desligada durante parte do serviço.',
    useRooms: true, rooms: [sala, coz],
    items: [
      it(sala.id, 'svc', 'Ponto novo de tomada com fiação', 'ponto', 5, 9000),
      it(sala.id, 'svc', 'Instalação de tomada ou interruptor', 'un', 3, 4500),
      it(sala.id, 'svc', 'Ponto de interruptor paralelo three-way', 'ponto', 1, 12000),
      it(sala.id, 'svc', 'Instalação de luminária ou plafon', 'un', 2, 6000),
      it(sala.id, 'mat', 'Tomada 10 A com placa', 'un', 3, 1800),
      it(sala.id, 'mat', 'Tomada dupla 10 A com placa', 'un', 2, 2800),
      it(sala.id, 'mat', 'Interruptor simples com placa', 'un', 3, 1600),
      it(sala.id, 'mat', 'Interruptor paralelo three-way com placa', 'un', 1, 2200),
      it(sala.id, 'mat', 'Caixa 4x2', 'un', 9, 250),
      it(coz.id, 'svc', 'Ponto novo de tomada com fiação', 'ponto', 3, 9000),
      it(coz.id, 'svc', 'Tomada de uso específico 20 A', 'un', 2, 7000),
      it(coz.id, 'svc', 'Instalação de luminária ou plafon', 'un', 1, 6000),
      it(coz.id, 'mat', 'Tomada 20 A com placa', 'un', 5, 2200),
      it(coz.id, 'mat', 'Caixa 4x2', 'un', 5, 250),
      it(coz.id, 'mat', 'Plafon LED 18 W', 'un', 1, 4500),
      it('', 'svc', 'Instalação de DR', 'un', 1, 9000),
      it('', 'svc', 'Instalação ou troca de disjuntor', 'un', 2, 4000),
      it('', 'mat', 'DR bipolar 40 A 30 mA', 'un', 1, 16000),
      it('', 'mat', 'Disjuntor monopolar 10 a 32 A', 'un', 2, 2200),
      it('', 'mat', 'Cabo flexível 2,5 mm²', 'm', 60, 350),
    ] });
  q.travel = tripCalc(q.trip).total;
  quotes.unshift(q); saveQuotes();
  go('/q/' + q.id);
}
function duplicateQuote(q) {
  const d = fixQuote({ ...clone(q), id: uid(), createdAt: Date.now(), updatedAt: Date.now(), status: 'rascunho', sentAt: null, approvedAt: null, doneAt: null, refusedAt: null, example: false, approvedVia: '', startAt: null, endAt: null, dateTbd: false, dates: [], days: 1, prevStatus: '' });
  d.items = d.items.map(i => ({ ...i, id: uid() }));
  settings.seq = (settings.seq || 0) + 1; d.num = settings.seq; saveSettings();
  quotes.unshift(d); saveQuotes();
  go('/q/' + d.id, true);
  toast(`Cópia criada: ${numLabel(d)}.`);
}
function deleteQuote(q) {
  confirmSheet('Excluir orçamento?', `O orçamento ${numLabel(q)}${q.client.name ? ' de ' + q.client.name : ''} será apagado${syncOn() ? ' de todos os seus aparelhos' : ' deste aparelho'}.`, 'Excluir', () => {
    const idx = quotes.indexOf(q);
    quotes = quotes.filter(x => x !== q); saveQuotes();
    go('/orcamentos', true);
    toast('Orçamento excluído.', { label: 'Desfazer', run: () => { quotes.splice(Math.max(0, idx), 0, q); saveQuotes(); rerender(); } });
  });
}

/* ================= tela: editor do orçamento ================= */
const NOTE_CHIPS = [
  ['Sem alvenaria e pintura', 'Não inclui reparos de alvenaria, gesso ou pintura.'],
  ['Material pode variar', 'Valores de material sujeitos a alteração pelo fornecedor.'],
  ['Conforme NBR 5410', 'Serviço executado conforme a norma NBR 5410.'],
  ['Energia desligada', 'A energia será desligada durante parte do serviço.'],
];
// relatório técnico em duas etapas: 1) o que (dispositivo, serviço, teste); 2) como, onde e com qual resultado
// listas de lugares: [rótulo, forma "no/na", forma "do/da"]
const PLACES = {
  circ: [['Geral', 'no circuito geral', 'geral'], ['Chuveiro', 'no circuito do chuveiro', 'do circuito do chuveiro'], ['Tomadas', 'no circuito de tomadas', 'do circuito de tomadas'],
    ['Iluminação', 'no circuito de iluminação', 'do circuito de iluminação'], ['Ar-condicionado', 'no circuito do ar-condicionado', 'do circuito do ar-condicionado'],
    ['Forno ou cooktop', 'no circuito do forno ou cooktop', 'do circuito do forno ou cooktop'], ['Máquina de lavar', 'no circuito da máquina de lavar', 'do circuito da máquina de lavar'],
    ['Torneira elétrica', 'no circuito da torneira elétrica', 'do circuito da torneira elétrica'], ['Bomba ou portão', 'no circuito da bomba ou do portão', 'do circuito da bomba ou do portão']],
  pts: [['Quadro', 'no quadro de distribuição', 'do quadro de distribuição'], ['Padrão de entrada', 'no padrão de entrada', 'do padrão de entrada'], ['Tomadas', 'nas tomadas', 'das tomadas'],
    ['Interruptores', 'nos interruptores', 'dos interruptores'], ['Iluminação', 'nos pontos de iluminação', 'dos pontos de iluminação'], ['Chuveiro', 'no chuveiro', 'do chuveiro'],
    ['Conexões', 'nas conexões', 'das conexões'], ['Equipamentos', 'nos equipamentos', 'dos equipamentos'], ['Todos os circuitos', 'em todos os circuitos', 'de todos os circuitos']],
};
const ROOMS_STD = ['Sala', 'Cozinha', 'Banheiro', 'Quartos', 'Área de serviço', 'Área externa', 'Garagem'];
const W_CIRC = { list: 'circ', form: 2, lab: 'Qual circuito?' }, W_CIRC_NO = { list: 'circ', form: 1, lab: 'Em qual circuito?' };
const W_PTS = { list: 'pts', form: 1, lab: 'Onde?' }, W_PTS_DE = { list: 'pts', form: 2, lab: 'Do quê?' };
const opts = (lab, list, one) => ({ lab, list, one: !!one });
// cada item: l = botão; a = início da frase; o = opções; w = lugar; r = ambiente; v = complemento; ord = ordem das partes
const TECH = {
  diag: [
    { l: 'Disjuntor', a: 'disjuntor', w: W_CIRC, r: true, o: opts('Qual a falha?', [
      ['Desarma por sobrecarga', 'desarmando por sobrecarga'], ['Desarma por curto', 'desarmando por curto-circuito'],
      ['Não rearma', 'com falha interna: não rearma'], ['Desarma sem carga', 'com falha interna: desarma sem carga ligada'],
      ['Não desarma', 'com falha interna: não desarma e deixa o circuito sem proteção'], ['Mecanismo quebrado', 'com mecanismo travado ou quebrado'],
      ['Terminais carbonizados', 'com terminais aquecidos ou carbonizados'], ['Mau contato', 'com mau contato nos terminais'],
      ['Pequeno para a carga', 'subdimensionado para a carga do circuito'], ['Grande para o cabo', 'superdimensionado para o cabo, sem proteger a fiação'],
      ['Fora de padrão', 'antigo e fora de padrão']]) },
    { l: 'DR', a: 'DR', w: W_CIRC, o: opts('Qual a falha?', [
      ['Fuga de corrente', 'desarmando por fuga de corrente no circuito'], ['Desarma sem fuga', 'com falha interna: desarma sem fuga de corrente'],
      ['Não desarma no teste', 'não desarma no botão de teste'], ['Não rearma', 'com falha interna: não rearma'], ['Ligação errada', 'ligado de forma incorreta']]) },
    { l: 'DPS', a: 'DPS', o: opts('Qual a falha?', [
      ['Fim de vida útil', 'com sinalização de fim de vida útil'], ['Queimado', 'queimado por surto de tensão'], ['Sem terra', 'sem ligação ao aterramento'], ['Ligação errada', 'ligado de forma incorreta']]) },
    { l: 'Tomada', a: 'tomada', r: true, o: opts('Qual a falha?', [
      ['Mau contato', 'com mau contato'], ['Derretida', 'derretida ou carbonizada'], ['Terminais frouxos', 'com terminais frouxos'], ['Solta', 'solta da caixa'],
      ['Quebrada', 'quebrada'], ['Sem aterramento', 'sem aterramento'], ['Fase e neutro invertidos', 'com fase e neutro invertidos'],
      ['10 A para aparelho de 20 A', 'de 10 A usada por aparelho que exige 20 A'], ['Padrão antigo', 'fora do padrão atual da NBR 14136']]) },
    { l: 'Interruptor', a: 'interruptor', r: true, o: opts('Qual a falha?', [
      ['Mau contato', 'com mau contato'], ['Não liga ou desliga', 'sem acionar a carga'], ['Aquecendo', 'aquecendo durante o uso'], ['Quebrado', 'quebrado'],
      ['Corta o neutro', 'ligado no neutro, sem interromper a fase']]) },
    { l: 'Chuveiro', a: 'chuveiro', r: true, o: opts('Qual a falha?', [
      ['Resistência queimada', 'com resistência queimada'], ['Ligação derretida', 'com fiação de ligação derretida'], ['Conexões aquecidas', 'com conexões aquecidas'],
      ['Dando choque', 'com fuga de corrente, dando choque'], ['Sem aterramento', 'sem aterramento'], ['Potência alta', 'com potência acima do que o circuito suporta']]) },
    { l: 'Iluminação', a: '', r: true, o: opts('Qual a falha?', [
      ['Lâmpada queimada', 'lâmpada queimada'], ['Reator queimado', 'reator queimado'], ['Driver queimado', 'driver de LED queimado'], ['Mau contato', 'luminária com mau contato'],
      ['Soquete danificado', 'soquete danificado'], ['Sensor de presença', 'sensor de presença com defeito'], ['Fotocélula', 'fotocélula com defeito']]) },
    { l: 'Fiação', a: 'fiação', w: W_CIRC, r: true, o: opts('Qual o problema?', [
      ['Aquecida ou derretida', 'aquecida ou derretida'], ['Bitola pequena', 'com bitola inadequada para a carga'], ['Isolamento ressecado', 'com isolamento ressecado ou danificado'],
      ['Emendas sem isolamento', 'com emendas sem isolamento adequado'], ['Emendas com mau contato', 'com mau contato nas emendas'], ['Curto-circuito', 'em curto-circuito'],
      ['Fuga de corrente', 'com fuga de corrente'], ['Exposta', 'exposta, sem eletroduto'], ['Roída', 'danificada por animais']]) },
    { l: 'Quadro', a: 'quadro de distribuição', o: opts('Qual o problema?', [
      ['Sem identificação', 'sem identificação dos circuitos'], ['Conexões frouxas', 'com conexões frouxas'], ['Sinais de aquecimento', 'com sinais de aquecimento'],
      ['Barramento oxidado', 'com barramento oxidado'], ['Sem tampa', 'sem tampa de proteção'], ['Sem espaço', 'sem espaço para novos circuitos'],
      ['Com fusíveis', 'antigo, com fusíveis'], ['Sem barramento de terra', 'sem barramento de terra']]) },
    { l: 'Aterramento', a: '', o: opts('Qual o problema?', [
      ['Sem aterramento', 'instalação sem aterramento'], ['Terra ausente nas tomadas', 'condutor de proteção, o terra, ausente nas tomadas'], ['Resistência alta', 'aterramento com resistência elevada'],
      ['Haste corroída', 'haste de aterramento corroída ou desconectada'], ['Terra no neutro', 'terra ligado ao neutro']]) },
    { l: 'Proteção', a: '', o: opts('O que falta?', [
      ['Sem DR', 'instalação sem DR, a proteção contra choque elétrico'], ['Sem DPS', 'instalação sem DPS, a proteção contra surtos'],
      ['Chuveiro sem circuito próprio', 'chuveiro sem circuito exclusivo'], ['Disjuntor compartilhado', 'vários circuitos ligados no mesmo disjuntor']]) },
    { l: 'Rede elétrica', a: '', w: W_PTS, o: opts('Qual o problema?', [
      ['Falta de fase', 'falta de fase'], ['Neutro interrompido', 'neutro interrompido'], ['Oscilação', 'oscilação de tensão'],
      ['Tensão baixa', 'tensão abaixo do normal'], ['Tensão alta', 'tensão acima do normal']], true), v: { opt: true, lab: 'Tensão medida', pre: ': ', sug: ['127 V', '220 V', '110 V', '240 V'] } },
  ],
  work: [
    { l: 'Troca', a: 'substituição', ord: ['o', 'w'], w: W_CIRC, r: true, o: opts('O que foi trocado?', [
      ['Disjuntor', 'do disjuntor'], ['DR', 'do DR'], ['DPS', 'do DPS'], ['Tomadas', 'das tomadas'], ['Interruptores', 'dos interruptores'], ['Chuveiro', 'do chuveiro'],
      ['Resistência', 'da resistência do chuveiro'], ['Lâmpadas', 'das lâmpadas'], ['Reator ou driver', 'do reator ou driver'], ['Luminária', 'da luminária'], ['Quadro', 'do quadro de distribuição']]),
      v: { opt: true, lab: 'Por qual?', pre: ' por ', sug: ['modelo equivalente', 'disjuntor de 32 A', 'disjuntor de 40 A', 'DR de 40 A 30 mA', 'tomada de 20 A'] } },
    { l: 'Instalação', a: 'instalação', ord: ['o', 'w'], w: W_CIRC_NO, r: true, o: opts('O que foi instalado?', [
      ['DR', 'de DR'], ['DPS', 'de DPS'], ['Tomadas', 'de tomadas'], ['Interruptores', 'de interruptores'], ['Luminárias', 'de luminárias'], ['Chuveiro', 'de chuveiro'],
      ['Circuito novo', 'de circuito novo'], ['Quadro', 'de quadro de distribuição'], ['Haste de terra', 'de haste de aterramento']]) },
    { l: 'Fiação', a: '', ord: ['o', 'w'], w: W_CIRC, r: true, o: opts('O que foi feito?', [
      ['Troca dos cabos', 'substituição dos cabos'], ['Cabos novos', 'passagem de cabos novos'], ['Emendas refeitas', 'emendas refeitas com conectores adequados'],
      ['Isolamento', 'isolamento das emendas'], ['Bitola adequada', 'adequação da bitola dos cabos à carga']]),
      v: { opt: true, lab: 'Bitola do cabo', pre: ', com cabos de ', sug: ['1,5 mm²', '2,5 mm²', '4 mm²', '6 mm²', '10 mm²'] } },
    { l: 'Reparo', a: '', ord: ['o', 'w'], w: W_CIRC_NO, r: true, o: opts('O que foi feito?', [
      ['Achar a falha', 'localização e isolamento do ponto de falha'], ['Reparo do curto', 'reparo do ponto de curto-circuito'], ['Polaridade', 'correção da polaridade de fase e neutro'],
      ['Interruptor na fase', 'ligação do interruptor na fase'], ['Separar neutro e terra', 'separação de neutro e terra'], ['Dividir circuito', 'divisão do circuito sobrecarregado']]) },
    { l: 'Quadro', a: '', o: opts('O que foi feito?', [
      ['Reaperto', 'reaperto das conexões do quadro de distribuição'], ['Identificação', 'identificação dos circuitos no quadro de distribuição'],
      ['Organização', 'organização da fiação do quadro de distribuição'], ['Barramentos', 'instalação de barramentos de terra e neutro no quadro']]) },
    { l: 'Aterramento', a: '', o: opts('O que foi feito?', [
      ['Haste', 'instalação de haste de aterramento'], ['Terra nas tomadas', 'ligação do condutor de proteção, o terra, às tomadas'], ['Terra no quadro', 'interligação do aterramento ao quadro de distribuição']]) },
  ],
  tests: [
    { l: 'Tensão', a: 'medição de tensão', w: W_PTS, r: true, v: { lab: 'Resultado', pre: ': ', sug: ['127 V', '220 V', '127/220 V', 'dentro do normal'] } },
    { l: 'Corrente', a: 'medição de corrente', w: W_CIRC_NO, v: { lab: 'Resultado', pre: ': ', sug: ['dentro da capacidade do disjuntor', 'acima da capacidade do disjuntor'] } },
    { l: 'DR', a: 'teste do DR', w: W_CIRC, o: opts('Como foi testado?', [['Botão de teste', 'pelo botão de teste'], ['Com instrumento', 'com instrumento, medindo a corrente de disparo']], true),
      v: { lab: 'Resultado', pre: ': ', sug: ['desarmou corretamente', 'não desarmou'] } },
    { l: 'Aterramento', a: 'verificação do aterramento', w: W_PTS, r: true, v: { lab: 'Resultado', pre: ': ', sug: ['presente e funcionando', 'ausente', 'resistência de 10 Ω'] } },
    { l: 'Isolamento', a: 'medição de resistência de isolamento', w: { list: 'circ', form: 2, lab: 'De qual circuito?' }, v: { lab: 'Resultado', pre: ': ', sug: ['acima de 1 MΩ, aprovado', 'abaixo do mínimo'] } },
    { l: 'Polaridade', a: 'verificação de polaridade', w: W_PTS, r: true, v: { lab: 'Resultado', pre: ': ', sug: ['correta', 'corrigida'] } },
    { l: 'Aquecimento', a: 'verificação de aquecimento', w: W_PTS, o: opts('Como?', [['Termômetro', 'com termômetro infravermelho'], ['Visual', 'por inspeção visual']], true),
      v: { lab: 'Resultado', pre: ': ', sug: ['sem aquecimento', 'aquecimento corrigido'] } },
    { l: 'Funcionamento', a: 'teste de funcionamento', w: W_PTS_DE, r: true, v: { lab: 'Resultado', pre: ': ', sug: ['funcionando normalmente'] } },
    { l: 'Com carga', a: 'teste com carga', w: W_CIRC_NO, v: { lab: 'Resultado', pre: ': ', sug: ['sem desarme e sem aquecimento'] } },
    { l: 'Continuidade', a: 'teste de continuidade', w: { list: 'circ', form: 2, lab: 'De qual circuito?' }, v: { lab: 'Resultado', pre: ': ', sug: ['aprovado'] } },
    { l: 'Outro', free: true },
  ],
  recs: [
    { l: 'Trocar', a: 'recomenda-se a substituição', ord: ['o', 'w'], w: W_CIRC, r: true, o: opts('O quê?', [
      ['Quadro', 'do quadro de distribuição'], ['Fiação', 'da fiação'], ['Disjuntores', 'dos disjuntores'], ['Tomadas antigas', 'das tomadas fora do padrão'], ['Chuveiro', 'do chuveiro']]) },
    { l: 'Instalar', a: 'recomenda-se a instalação', o: opts('O quê?', [
      ['DR', 'de DR, conforme a NBR 5410'], ['DPS', 'de DPS, para proteção contra surtos'], ['Aterramento', 'de aterramento'],
      ['Circuito do chuveiro', 'de circuito exclusivo para o chuveiro'], ['Circuito do ar', 'de circuito exclusivo para o ar-condicionado'], ['Mais tomadas', 'de mais tomadas, para não usar benjamins']]) },
    { l: 'Revisão geral', s: 'Recomenda-se uma revisão completa da instalação elétrica.' },
    { l: 'Evitar sobrecarga', s: 'Evitar ligar aparelhos de alta potência ao mesmo tempo no mesmo circuito.' },
    { l: 'Sem benjamins', s: 'Não usar benjamins e extensões como ligação permanente.' },
    { l: 'Cliente recusou', s: 'O cliente foi informado dos riscos e optou por não realizar os serviços recomendados neste momento.' },
  ],
};
const joinPt = L => L.length < 2 ? (L[0] || '') : L.slice(0, -1).join(', ') + ' e ' + L[L.length - 1];
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
function techRooms(q) {
  const out = [], seen = new Set();
  [...(q.useRooms ? q.rooms.map(r => r.name) : []), ...ROOMS_STD].forEach(n => { const k = fold(n); if (!seen.has(k)) { seen.add(k); out.push(n); } });
  return out;
}
function techSentence(it, sel, rooms) {
  const part = {
    o: it.o ? joinPt(sel.o.map(i => it.o.list[i][1])) : '',
    w: it.w ? joinPt(sel.w.map(i => PLACES[it.w.list][i][it.w.form])) : '',
  };
  let s = [it.a, ...(it.ord || ['w', 'o']).map(k => part[k])].filter(Boolean).join(' ');
  if (sel.r.length) s += `, ${sel.r.length > 1 ? 'ambientes' : 'ambiente'}: ${joinPt(sel.r.map(i => rooms[i].charAt(0).toLowerCase() + rooms[i].slice(1)))}`;
  if (sel.v.trim()) s += (it.v.pre || ': ') + sel.v.trim();
  s = capFirst(s.trim());
  return s && !/[.!?]$/.test(s) ? s + '.' : s;
}
const TECH_TITLE = { diag: 'Diagnóstico', work: 'Serviço realizado', tests: 'Teste ou verificação', recs: 'Recomendação' };
// etapa 2: escolhe falha, lugar, ambiente e resultado; a frase aparece pronta e pode ser ajustada
function techSheet(q, key, idx, onAdd) {
  const it = TECH[key][idx], rooms = techRooms(q), sel = { o: [], w: [], r: [], v: '' };
  const av = $('.kf-toast'); if (av) av.hidden = true;
  const grupo = (grp, list, one) => linhas(list.map((x, i) => linha(`data-i="${i}"`, esc(x), { tipo: one ? 'um' : 'varios' })), ` data-grp="${grp}"${one ? ' data-one' : ''}`);
  // cada escolha numa seção; a primeira (obrigatória) já vem aberta, as opcionais fechadas com o resumo do que foi marcado
  const secao = (grp, lab, list, one, aberta) => panel(`tb:${grp}`, `tb-${grp}`, esc(lab), aberta ? 'Escolha uma opção' : 'Opcional', grupo(grp, list, one), { force: aberta });
  const body = it.free
    ? `<div class="field"><label for="tb-out">Descreva o teste e o resultado</label><textarea id="tb-out" placeholder="Ex.: Medição da corrente de fuga do chuveiro: dentro do limite."></textarea></div>`
    : `<div class="stack14">${it.o ? secao('o', it.o.lab, it.o.list.map(x => x[0]), it.o.one, true) : ''}
      ${it.w ? secao('w', it.w.lab, PLACES[it.w.list].map(x => x[0]), false, !it.o) : ''}
      ${it.r ? secao('r', 'Ambiente', rooms, false, false) : ''}
      ${it.v ? `<div class="field"><label for="tb-v">${esc(it.v.lab)}${it.v.opt ? ' <span class="lab-opt">opcional</span>' : ''}</label><input id="tb-v" type="text" autocomplete="off">${linhas(it.v.sug.map(x => linha(`data-sug="${esc(x)}"`, esc(x), { tipo: 'um' })), ' role="group" aria-label="Sugestões"')}</div>` : ''}</div>
`;
  openSheet({ title: `${TECH_TITLE[key]}: ${it.l}`, tall: true, body,
    foot: `${it.free ? '' : '<div class="tb-prev"><label for="tb-out">Vai entrar assim</label><textarea id="tb-out" rows="2" placeholder="Escolha as opções acima"></textarea></div>'}<button class="btn ghost" data-no>Cancelar</button><button class="btn primary" data-ok>${I.plus}Adicionar</button>`,
    onMount: s => {
      const out = $('#tb-out', s), ok = $('[data-ok]', s);
      let dirty = false;
      const refresh = () => {
        if (!it.free && !dirty) { out.value = it.o && !sel.o.length ? '' : techSentence(it, sel, rooms); out.style.height = 'auto'; out.style.height = out.scrollHeight + 2 + 'px'; }
        ok.disabled = !out.value.trim();
      };
      $$('[data-grp]', s).forEach(g => g.addEventListener('click', e => {
        const b = e.target.closest('[data-i]'); if (!b) return;
        const grp = g.dataset.grp, i = +b.dataset.i, on = !sel[grp].includes(i);
        if (g.hasAttribute('data-one')) { sel[grp] = on ? [i] : []; $$('[data-i]', g).forEach(x => x.setAttribute('aria-pressed', on && +x.dataset.i === i)); }
        else { sel[grp] = on ? [...sel[grp], i] : sel[grp].filter(x => x !== i); b.setAttribute('aria-pressed', on); }
        const nomes = sel[grp].map(k => $(`[data-i="${k}"] .lt`, g).textContent), sm = $(`[data-sum="tb-${grp}"]`, s);
        if (sm) sm.textContent = nomes.length ? resumoDe(nomes, x => x) : grp === 'o' ? 'Escolha uma opção' : 'Opcional';
        dirty = false; refresh();
      }));
      const v = $('#tb-v', s);
      if (v) {
        v.addEventListener('input', () => { sel.v = v.value; dirty = false; refresh(); });
        const marcaSug = () => $$('[data-sug]', s).forEach(x => x.setAttribute('aria-pressed', x.dataset.sug === v.value.trim()));
        v.addEventListener('input', marcaSug);
        $$('[data-sug]', s).forEach(b => b.onclick = () => { v.value = sel.v = b.dataset.sug; dirty = false; refresh(); marcaSug(); });
      }
      out.addEventListener('input', () => { dirty = true; ok.disabled = !out.value.trim(); });
      $('[data-no]', s).onclick = () => closeSheet();
      ok.onclick = () => { const t = out.value.trim(); if (!t) return; closeSheet(true); onAdd(/[.!?]$/.test(t) ? t : t + '.'); };
      refresh();
    } });
}
// etapa 1: a lista de textos padrão, numa seção própria; com seta abre a etapa 2, com + entra direto
function techChips(key, q) {
  const L = TECH[key];
  return panel(`q:${q.id}:${key}:pad`, '', 'Textos padrão', resumoDe(L, it => it.l),
    linhas(L.map((it, k) => linha(`data-tc="${key}" data-ti="${k}"`, esc(it.l), it.s ? { tipo: 'mais', dis: key !== 'tests' && q[key].includes(it.s) } : {}))), { right: conta(L.length) });
}
const firstLine = (t, empty) => (String(t || '').trim().split('\n')[0] || empty);
function techField(q, key, label, ph, extra = '') {
  return panel(`q:${q.id}:${key}`, key, label, firstLine(q[key], 'Toque para preencher'),
    `${techChips(key, q)}<textarea id="q-${key}" data-tech="${key}" aria-label="${esc(label)}" placeholder="${esc(ph)}">${esc(q[key])}</textarea>${extra}`, { sub: true });
}
const testsSum = q => q.tests.length ? plural(q.tests.length, 'teste registrado', 'testes registrados') : 'Toque para registrar';
const testsHTML = q => panel(`q:${q.id}:tests`, 'tests', 'Testes e verificações', testsSum(q), `<p class="hint">Escolha o teste e depois onde foi feito e o resultado.</p>${techChips('tests', q)}
  <div class="test-list">${q.tests.map((t, k) => `<div class="test-row"><span class="tk">${I.check}</span><span class="tt">${esc(t)}</span><button class="icon-btn sm" data-test-rm="${k}" aria-label="Remover teste">${I.x}</button></div>`).join('')}</div>`, { sub: true });
function techSum(q) {
  const L = [q.diag.trim() && 'diagnóstico', q.work.trim() && 'serviços', q.tests.length && plural(q.tests.length, 'teste', 'testes'), q.recs.trim() && 'recomendações'].filter(Boolean);
  return L.length ? capFirst(joinPt(L)) : 'Diagnóstico, serviços, testes e recomendações';
}
function techCardHTML(q) {
  if (!isReport(q)) return '';
  return panel(`q:${q.id}:tech`, 'tech', 'Relatório técnico', techSum(q), `<p class="hint">Toque no que se aplica e complete os detalhes: a frase entra pronta.</p>
      ${techField(q, 'diag', 'Diagnóstico', 'O que você encontrou: causa do problema, estado da instalação…')}
      ${techField(q, 'work', 'Serviços realizados', 'O que foi feito, com mais detalhe que a lista de itens.', q.items.some(i => i.kind === 'svc') ? '<button class="linkish" data-work-items>Preencher com os serviços lançados</button>' : '')}
      ${testsHTML(q)}
      ${techField(q, 'recs', 'Recomendações', 'O que ainda precisa de atenção, riscos e cuidados de uso.')}
`);
}
// material lançado com valor menor que o custo médio do seu estoque (só quando o material é por sua conta)
function abaixoCusto(q, i) {
  if (i.kind !== 'mat' || q.materialBy === 'cliente') return 0;
  const p = prices.find(x => x.kind === 'mat' && norm(x.name) === norm(i.name));
  return p && inStock(p) && p.cost > 0 && i.price < p.cost ? p.cost : 0;
}
function lineHTML(q, i) {
  const cli = i.kind === 'mat' && q.materialBy === 'cliente';
  return `<div class="line${cli ? ' cli' : ''}" data-line="${i.id}">
    <button class="line-main" data-edit="${i.id}" aria-label="Alterar ${esc(i.name)}">
      <span class="line-name">${esc(i.name)}</span>
      <span class="line-meta">${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)} × ${refLinha(i) ? refV(BRL(i.price)) : BRL(i.price)}</span>
      ${abaixoCusto(q, i) ? `<span class="line-warn">${I.warn}Abaixo do seu custo de ${BRL(abaixoCusto(q, i))} por ${unitName(i.unit)}</span>` : ''}
    </button>
    <div class="line-side">
      <span class="line-total">${BRL(lineTotal(i))}</span>
      <div class="qty">${i.qty <= 1 ? `<button class="rm" data-rm="${i.id}" aria-label="Remover ${esc(i.name)}">${I.trash}</button>` : `<button data-dq="-1" data-id="${i.id}" aria-label="Menos 1 em ${esc(i.name)}">${I.minus}</button>`}<button class="qty-n" data-qe="${i.id}" aria-label="Quantidade de ${esc(i.name)}: ${fmtQty(i.qty)}. Toque para digitar">${fmtQty(i.qty)}</button><button data-dq="1" data-id="${i.id}" aria-label="Mais 1 em ${esc(i.name)}">${I.plus}</button></div>
    </div>
  </div>`;
}
const payShort = p => ({ avista: p.avista && (p.avista.pct || p.avista.value) ? 'À vista com desconto' : 'À vista', entrada: `Entrada de ${p.entryPct}%`, parcelado: p.cardTipo === 'debito' ? 'Cartão de débito' : `Cartão em ${p.installments}×${p.juros === 'sem' || (p.semAte && p.installments <= p.semAte) ? '' : ' com juros'}`, combinar: 'Pagamento a combinar' })[p.mode] || '';
function quoteSums(q, c) {
  const rep = isReport(q), nS = q.items.filter(i => i.kind === 'svc').length, nM = q.items.filter(i => i.kind === 'mat').length;
  const ds = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const val = [c.extra && `adicional +${c.surPct}%`, c.travel && `deslocamento ${BRL(c.travel)}`, c.discount && `desconto ${BRL(c.discount)}`, c.taxFora && `impostos ${BRL(c.taxFora)}`, c.taxDentro && 'impostos embutidos'].filter(Boolean);
  return {
    cli: [q.client.name, q.title].filter(Boolean).join(' · ') || 'Nome, WhatsApp, endereço e serviço',
    items: q.items.length ? [nS && plural(nS, 'serviço', 'serviços'), nM && plural(nM, 'material', 'materiais'), q.useRooms && q.rooms.length && plural(new Set(q.items.map(i => roomOf(q, i) || 'geral')).size, 'ambiente', 'ambientes')].filter(Boolean).join(' · ') : 'Nenhum item ainda',
    itemsR: BRL(c.labor + (c.matIn ? c.matTotal : 0)),
    tech: techSum(q),
    diag: firstLine(q.diag, 'Toque para preencher'), work: firstLine(q.work, 'Toque para preencher'), recs: firstLine(q.recs, 'Toque para preencher'), tests: testsSum(q),
    val: val.length ? capFirst(val.join(' · ')) : 'Adicionais, deslocamento e desconto',
    valR: BRL(c.total),
    cond: [payShort(q.payment), !rep && prazoTxt(q.prazo), (!rep && q.dateTbd) ? 'datas a combinar' : q.dates.length ? (q.dates.length > 1 ? `de ${ds(q.dates[0])} a ${ds(q.dates[q.dates.length - 1])}` : `dia ${ds(q.dates[0])}`) + (daysOk(q) ? '' : ' · confira as datas') : '', q.warranty ? `garantia ${q.warranty} dias` : 'sem garantia'].filter(Boolean).join(' · '),
    notes: firstLine(q.notes, 'Nada anotado'),
  };
}
// pagamentos recebidos (F10): o que já entrou e o que falta, por orçamento aprovado ou concluído
const recebido = q => sum((q.pagos || []).map(x => x.v));
const falta = (q, c = compute(q)) => Math.max(0, c.payTotal - recebido(q));
function pagosHTML(q, c) {
  if (!['aprovado', 'concluido'].includes(q.status)) return '';
  const r = recebido(q), f = falta(q, c);
  return `<div class="pagos" id="q-pagos"><div class="pagos-top"><span><b>Recebido ${BRL(r)}</b> de ${BRL(c.payTotal)}${f ? ` · falta <b>${BRL(f)}</b>` : ' · tudo pago'}</span><button class="btn sm ghost" data-pago>${I.plus}Registrar pagamento</button></div>
    ${(q.pagos || []).length ? `<ul class="pagos-lista">${q.pagos.map(x => `<li><span>${fmtDate(x.t)}</span><b>${BRL(x.v)}</b><button class="icon-btn" data-pago-rm="${x.id}" aria-label="Apagar o pagamento de ${BRL(x.v)} de ${fmtDate(x.t)}">${I.x}</button></li>`).join('')}</ul>` : ''}</div>`;
}
function pagoSheet(q) {
  const c = compute(q), f = falta(q, c), sugestao = !recebido(q) && c.entry ? c.entry : f;
  openSheet({ title: 'Registrar pagamento', body: `<div class="field"><label for="pg-v">Valor recebido</label><input id="pg-v" type="text" inputmode="numeric" data-money value="${sugestao ? BRL(sugestao) : ''}" placeholder="R$ 0,00"></div>
      <p class="hint">${f ? `Falta receber ${BRL(f)}${!recebido(q) && c.entry ? `; a entrada combinada é de ${BRL(c.entry)}` : ''}.` : 'Este orçamento já está todo pago.'}</p>`,
    foot: `<button class="btn ghost" data-cancel>Cancelar</button><button class="btn primary" data-ok>${I.check}Registrar</button>`,
    onMount: s2 => {
      prepFields(s2);
      $('[data-cancel]', s2).onclick = () => closeSheet();
      $('[data-ok]', s2).onclick = () => {
        const v = parseMoney($('#pg-v', s2).value);
        if (!v) return toast('Informe o valor recebido.');
        const reg = { id: uid(), v, t: Date.now() };
        q.pagos = [...(q.pagos || []), reg]; touch(q); closeSheet(true); rerender();
        toast(`Pagamento de ${BRL(v)} registrado.`, { label: 'Desfazer', run: () => { q.pagos = q.pagos.filter(x => x.id !== reg.id); touch(q); rerender(); } });
      };
    } });
}
function statusBanner(q, c) {
  const px = pixOf(q, c);
  if (q.status === 'enviado') return `<div class="banner b-sent">
    <p><b>Enviado ${rel(q.sentAt)}.</b> O cliente já respondeu?</p>
    <div class="banner-act"><button class="btn sm ghost ok-ic" data-st="aprovado">${I.check}Aprovou</button><button class="btn sm ghost" data-st="recusado">Recusou</button></div>
    <a class="link" href="${waLink(q.client.phone, followMessage(q, c))}" target="_blank" rel="noopener">${I.wa}Lembrar o cliente pelo WhatsApp</a>
  </div>`;
  if (q.status === 'aprovado') return `<div class="banner b-ok">
    <p><b>Aprovado ${rel(q.approvedAt)}.</b> Quando terminar o serviço, marque como concluído para gerar o recibo.</p>
    ${pagosHTML(q, c)}
    <div class="banner-act"><button class="btn sm ghost ok-ic" data-st="concluido">${I.check}Serviço concluído</button>${px ? `<button class="btn sm ghost" data-pix>${I.pix}Pix d${px.what}</button>` : `<button class="btn sm ghost" data-receipt>${I.receipt}Recibo</button>`}</div>
  </div>`;
  if (q.status === 'concluido') {
    const pr = pixOf(q, c, 'report');
    return `<div class="banner b-done">
    <div class="done-row"><p><b>Executado em</b> <span id="q-donetxt">${esc(execText(q))}</span></p><button class="btn sm ghost" data-goto-days>${I.cal}Alterar datas</button></div>
    ${pagosHTML(q, c)}
    <div class="banner-act"><button class="btn sm ghost" data-receipt>${I.receipt}Gerar recibo</button>${pr ? `<button class="btn sm ghost" data-pix-rest>${I.pix}Pix d${pr.what}</button>` : ''}</div>
    <button class="linkish" data-undone style="color:var(--muted);font-size:14px">${q.prevStatus && q.prevStatus !== 'rascunho' ? 'Desfazer conclusão' : 'Transformar em orçamento'}</button>
  </div>`;
  }
  if (q.status === 'recusado') return `<div class="banner b-bad">
    <p><b>Recusado em ${fmtDate(q.refusedAt)}.</b> Se o cliente mudar de ideia, reabra e ajuste os valores.</p>
    <div class="banner-act"><button class="btn sm ghost" data-st="rascunho">Reabrir como rascunho</button></div>
  </div>`;
  return '';
}
// detalhe de uma forma de pagamento (a principal ou outra que também vai na proposta)
function payDetailHTML(q, c, mode) {
  const p = q.payment;
  let detail = '';
  if (mode === 'entrada') detail = `<div class="field"><span class="lab">Entrada na aprovação</span><div class="seg" role="group" aria-label="Entrada na aprovação">${[30, 40, 50, 60, 70].map(n => `<button data-ep="${n}" aria-pressed="${p.entryPct === n}">${n}%</button>`).join('')}</div></div>`;
  if (mode === 'avista') {
    const a = p.avista;
    detail = `<div class="field"><label for="q-avd">Desconto para pagamento à vista</label><div class="disc"><div class="seg" role="group" aria-label="Tipo de desconto à vista"><button data-avm="pct" aria-pressed="${a.mode === 'pct'}">%</button><button data-avm="value" aria-pressed="${a.mode === 'value'}">R$</button></div>${a.mode === 'value'
      ? `<input id="q-avd" type="text" inputmode="numeric" data-money placeholder="R$ 0,00" value="${a.value ? BRL(a.value) : ''}">`
      : `<input id="q-avd" type="text" inputmode="decimal" placeholder="0" value="${a.pct ? fmtQty(a.pct) : ''}" aria-label="Desconto à vista em porcentagem">`}</div>
      <span class="hint">Só vale se o cliente pagar à vista, em Pix ou dinheiro. É separado do desconto do serviço, em Valores.</span></div>`;
  }
  if (mode === 'parcelado') {
    const k = c.card, deb = p.cardTipo === 'debito', semTab = p.juros === 'taxa' && !Object.keys(settings.cardRates || {}).length;
    detail = `<div class="seg" role="group" aria-label="Tipo de cartão"><button data-ct="credito" aria-pressed="${!deb}">Crédito</button><button data-ct="debito" aria-pressed="${deb}">Débito</button></div>
      ${deb ? '' : `<div class="field"><span class="lab">Parcelas</span><div class="stepper"><button data-in="-1" aria-label="Menos parcelas" ${p.installments <= 1 ? 'disabled' : ''}>${I.minus}</button><input id="q-inst" type="text" readonly value="${p.installments}×" aria-label="Parcelas"><button data-in="1" aria-label="Mais parcelas" ${p.installments >= 18 ? 'disabled' : ''}>${I.plus}</button></div></div>`}
      <div class="field"><span class="lab" id="q-jur-l">Juros e taxa do cartão</span><div class="seg" role="group" aria-labelledby="q-jur-l"><button data-jur="sem" aria-pressed="${p.juros === 'sem'}">Sem juros</button><button data-jur="taxa" aria-pressed="${p.juros === 'taxa'}">Taxa da maquininha</button>${deb ? '' : `<button data-jur="mes" aria-pressed="${p.juros === 'mes'}">Juros ao mês</button>`}</div></div>
      ${p.juros === 'taxa' ? `<div class="field"><label for="q-taxa">Taxa ${deb ? 'no débito' : `em ${p.installments}×`}, em %</label><input id="q-taxa" type="text" inputmode="decimal" placeholder="0" value="${fmtQty(k.taxaPct)}"><span class="hint">${p.taxaPct != null ? '<button class="linkish" data-taxa-tab>Usar a da tabela</button>' : semTab ? 'Cadastre as taxas em Ajustes, Orçamento novo.' : 'Da sua tabela, em Ajustes.'}</span></div>
        <div class="field"><span class="lab" id="q-paga-l">Quem paga a taxa</span><div class="seg" role="group" aria-labelledby="q-paga-l"><button data-paga="cliente" aria-pressed="${p.paga === 'cliente'}">O cliente</button><button data-paga="eu" aria-pressed="${p.paga === 'eu'}">Eu</button></div></div>` : ''}
      ${p.juros === 'mes' && !deb ? `<div class="field"><label for="q-mes">Juros ao mês, em %</label><input id="q-mes" type="text" inputmode="decimal" placeholder="Ex.: 2,99" value="${p.mesPct ? fmtQty(p.mesPct) : ''}"></div>` : ''}
      ${p.juros !== 'sem' && !deb ? `<div class="field"><label for="q-semate">Sem juros até quantas parcelas</label><div class="stepper"><button data-sa="-1" aria-label="Menos">${I.minus}</button><input id="q-semate" type="text" readonly value="${p.semAte ? p.semAte + '×' : 'Não'}" aria-label="Sem juros até"><button data-sa="1" aria-label="Mais">${I.plus}</button></div><span class="hint">Até esse número de parcelas, ${p.juros === 'taxa' ? 'você absorve a taxa' : 'não há juros'}.</span></div>` : ''}`;
  }
  return detail;
}
const PAY_NOME = { avista: 'À vista', entrada: 'Entrada', parcelado: 'Cartão' };
// a mesma conta com outra forma de pagamento (para as outras formas que vão na proposta)
const comForma = (q, mode) => { const q2 = { ...q, payment: { ...q.payment, mode } }; return { q: q2, c: compute(q2) }; };
const outrasFormas = q => isReport(q) ? [] : (q.payment.outras || []).filter(m => m !== q.payment.mode);
function payBlockHTML(q, c) {
  const p = q.payment, outras = ['avista', 'entrada', 'parcelado'].filter(m => m !== p.mode);
  const alts = outrasFormas(q).map(m => { const x = comForma(q, m); return panel(`q:${q.id}:alt:${m}`, '', `${PAY_NOME[m]}, também na proposta`, payText(x.q, x.c).replace(/\.$/, ''), `${payDetailHTML(q, x.c, m)}<div class="pay-sum" id="pay-sum-${m}">${paySumHTML(x.q, x.c)}</div>`); }).join('');
  return payDetailHTML(q, c, p.mode) + `<div class="pay-sum" id="pay-sum">${paySumHTML(q, c)}</div>`
    + (isReport(q) ? '' : `<div class="field"><span class="lab" id="q-outras-l">O cliente também pode pagar</span>${linhas(outras.map(m => linha(`data-outra="${m}"`, PAY_NOME[m], { tipo: 'varios', on: (p.outras || []).includes(m) })), ' role="group" aria-labelledby="q-outras-l"')}<span class="hint">As formas marcadas aparecem na proposta, além da principal.</span></div>${alts}`);
}

function paySumHTML(q, c) {
  const p = q.payment;
  if (p.mode === 'avista') return c.avistaDesc ? `<div><span>Total do orçamento</span><b>${BRL(c.total)}</b></div><div><span>Desconto à vista</span><b>− ${BRL(c.avistaDesc)}</b></div><div><span>À vista</span><b>${BRL(c.avistaTotal)}</b></div>` : `<div><span>À vista</span><b>${BRL(c.total)}</b></div>`;
  if (p.mode === 'entrada') return `<div><span>Entrada de ${p.entryPct}% na aprovação</span><b>${BRL(c.entry)}</b></div><div><span>Na conclusão do serviço</span><b>${BRL(c.rest)}</b></div>`;
  if (p.mode === 'parcelado') {
    const k = c.card, t = cardTxt(p, c);
    const linhas = [`<div><span>${k.deb ? 'No débito' : k.n === 1 ? 'Crédito à vista' : 'No cartão'}</span><b>${k.deb || k.n === 1 ? BRL(k.total) : partsText(k.parts)}</b></div>`];
    if (k.juros > 0) linhas.push(`<div><span>${p.juros === 'mes' ? `Juros de ${fmtQty(k.mesPct)}% ao mês` : `Taxa repassada de ${fmtQty(k.taxaPct)}%`}</span><b>+ ${BRL(k.juros)}</b></div>`, `<div><span>Total no cartão</span><b>${BRL(k.total)}</b></div>`);
    else if (!k.deb && k.n > 1) linhas.push(`<div><span>Sem juros</span><b>${BRL(k.total)}</b></div>`);
    if (p.juros === 'taxa' && k.taxaPct > 0) linhas.push(`<div class="ps-rec"><span>Você recebe, depois da taxa</span><b>${BRL(k.recebe)}</b></div>`);
    return linhas.join('');
  }
  return `<div><span>Forma de pagamento a combinar com o cliente</span></div>`;
}
const matSwitchHTML = q => `<label class="switch-row" for="q-matcli"><span><b>O cliente compra o material</b><small>${q.materialBy === 'cliente' ? 'A lista vai na proposta, com valores estimados fora do total.' : 'Desligado: o material entra no total da proposta.'}</small></span><input type="checkbox" class="sw" id="q-matcli" ${q.materialBy === 'cliente' ? 'checked' : ''}></label>`;
const roomToggleHTML = q => `<label class="switch-row" for="q-rooms"><span><b>Separar por ambiente</b><small>${q.useRooms ? 'Cada cômodo com a sua contagem de pontos e de material.' : 'Sala, cozinha, quartos… para contar e conferir cômodo por cômodo.'}</small></span><input type="checkbox" class="sw" id="q-rooms" ${q.useRooms ? 'checked' : ''}></label>`;
function kindCardsHTML(q, c) {
  return panel(`q:${q.id}:svc`, '', 'Mão de obra', c.svc.length ? resumoDe(c.svc, i => i.name) : 'Nenhum serviço ainda',
      `${c.svc.length ? `<div class="lines">${c.svc.map(i => lineHTML(q, i)).join('')}</div>` : '<p class="empty-line">Escolha os serviços na sua tabela de preços.</p>'}
      <button class="add-btn" data-add="svc">${I.plus}Adicionar mão de obra</button>`, { right: `<span data-t="labor">${BRL(c.labor)}</span>` })
    + panel(`q:${q.id}:mat`, '', 'Material', c.mat.length ? resumoDe(c.mat, i => i.name) : 'Nenhum material ainda',
      `${matSwitchHTML(q)}
      ${c.mat.length ? `<div class="lines">${c.mat.map(i => lineHTML(q, i)).join('')}</div>` : ''}
      <button class="add-btn" data-add="mat">${I.plus}Adicionar material</button>`, { right: `<span data-t="mat">${BRL(c.matTotal)}</span>` });
}
function roomsHTML(q, c) {
  const card = g => {
    const svc = g.items.filter(i => i.kind === 'svc'), mat = g.items.filter(i => i.kind === 'mat');
    const st = sum(svc.map(lineTotal)) + (c.matIn ? sum(mat.map(lineTotal)) : 0);
    const sumTxt = g.items.length ? [svc.length && plural(svc.length, 'serviço', 'serviços'), mat.length && plural(mat.length, 'material', 'materiais')].filter(Boolean).join(' · ') : (norm(g.name) === 'geral' ? 'Quadro, entrada de energia e itens da casa toda' : 'Vazio');
    const rk = `q:${q.id}:room:${g.id || 'geral'}`;
    return panelOpen(rk, '', esc(g.name), sumTxt, { right: BRL(st), attrs: ` data-room-card="${g.id}"` }) + `
      ${svc.length ? panel(rk + ':svc', '', 'Mão de obra', resumoDe(svc, i => i.name), `<div class="lines">${svc.map(i => lineHTML(q, i)).join('')}</div>`, { right: BRL(sum(svc.map(lineTotal))) }) : ''}
      ${mat.length ? panel(rk + ':mat', '', 'Material', resumoDe(mat, i => i.name), `<div class="lines">${mat.map(i => lineHTML(q, i)).join('')}</div>`, { right: BRL(sum(mat.map(lineTotal))) }) : ''}
      ${g.items.length ? '' : `<p class="empty-line">Toque em adicionar e conte cada tomada, interruptor e luminária.</p>`}
      <button class="add-btn" data-add-room="${g.id}">${I.plus}Adicionar em ${esc(g.name)}</button>
      ${g.id ? `<button class="add-btn room-ops" data-room-menu="${g.id}">${I.more}Opções de ${esc(g.name)}</button>` : ''}
    ${panelClose}`;
  };
  const groups = roomList(q);
  return (groups.length ? '' : `<p class="empty-line">Crie o primeiro ambiente: sala, cozinha, quarto ou Geral, para o quadro e a casa toda.</p>`)
    + groups.map(card).join('') + `<button class="add-btn room" data-new-room>${I.plus}Novo ambiente</button>` + conferenceHTML(q);
}
const byText = e => [...e.by.entries()].map(([r, n]) => `${r}: ${fmtQty(n)}`).join(' · ');
function conferenceHTML(q) {
  if (!q.items.length || !q.rooms.length) return '';
  const block = (kind, title) => {
    const L = consolidate(q, kind); if (!L.length) return '';
    return panel(`q:${q.id}:conf:${kind}`, '', title, resumoDe(L, e => e.name), `<div class="conf">${L.map(e => `<div class="conf-row"><span><b>${esc(e.name)}</b><small>${esc(byText(e))}</small></span><span class="num">${fmtQty(e.qty)} ${unitTxt(e.qty, e.unit)}</span></div>`).join('')}</div>`, { right: conta(L.length) });
  };
  return panel(`q:${q.id}:conf`, '', 'Conferência', 'Total de cada item, somando os ambientes', `${block('mat', 'Material')}${block('svc', 'Mão de obra')}
    <button class="btn ghost" data-conf-pdf>${I.share}PDF da conferência</button>`);
}
function valuesHTML(q, c) {
  const d = q.discount, rt = q.trip ? tripCalc(q.trip) : null;
  return `<div class="vrows">
      <div class="vrow"><span>Mão de obra</span><b data-t="labor">${BRL(c.labor)}</b></div>
      <div class="xlins"><span class="lab" id="q-x-l">Adicional sobre a mão de obra</span>${linhas(EXTRAS.map(([k, l, sk]) => { const on = q.extras[k] > 0; return linha(`data-x="${k}"`, l, { tipo: 'varios', on, dir: on ? `+${q.extras[k]}%` : settings[sk] ? `+${settings[sk]}%` : '' }); }), ' role="group" aria-labelledby="q-x-l"')}</div>
      ${c.extra ? `<div class="vrow"><span>Adicionais (+${c.surPct}%)</span><b>${BRL(c.extra)}</b></div>` : ''}
      <div class="vrow"><span>Material</span><b class="${c.matIn ? '' : 'dim'}">${c.matIn ? BRL(c.matTotal) : 'por conta do cliente'}</b></div>
      ${q.useRooms ? `<div class="vrow-free">${matSwitchHTML(q)}</div>` : ''}
      <button class="vrow vbtn" data-trip><span>Deslocamento<small>${rt ? esc(tripShort(q.trip, rt)) : q.travel ? 'valor fixo' : 'pela distância e o combustível'}</small></span><span class="vb-r">${q.travel ? `<b>${BRL(q.travel)}</b>` : '<b class="cta">Calcular</b>'}${I.chev}</span></button>
      <div class="vrow"><label for="q-disc">Desconto</label><div class="disc"><div class="seg" role="group" aria-label="Tipo de desconto"><button data-dm="value" aria-pressed="${d.mode === 'value'}">R$</button><button data-dm="pct" aria-pressed="${d.mode === 'pct'}">%</button></div>${d.mode === 'value'
        ? `<input id="q-disc" type="text" inputmode="numeric" data-money placeholder="R$ 0,00" value="${d.value ? BRL(d.value) : ''}">`
        : `<input id="q-disc" type="text" inputmode="decimal" placeholder="0" value="${d.pct ? fmtQty(d.pct) : ''}" aria-label="Desconto em porcentagem">`}</div></div>
      <div class="vrow tax-row"><span class="lab" id="q-tx-l">Impostos ou nota fiscal</span>
        <div class="seg" role="group" aria-labelledby="q-tx-l"><button data-tx="sem" aria-pressed="${c.tax.mode === 'sem'}">Sem</button><button data-tx="fora" aria-pressed="${c.tax.mode === 'fora'}">Por fora</button><button data-tx="dentro" aria-pressed="${c.tax.mode === 'dentro'}">Embutido</button></div></div>
      ${c.tax.mode !== 'sem' ? `<div class="tax-cfg"><div class="field"><label for="q-txp">Alíquota (%)</label><input id="q-txp" type="text" inputmode="decimal" value="${fmtQty(c.tax.pct)}" placeholder="5"></div>
        <div class="seg" role="group" aria-label="Base do imposto"><button data-txb="servico" aria-pressed="${c.tax.base === 'servico'}">Só mão de obra (ISS)</button><button data-txb="total" aria-pressed="${c.tax.base === 'total'}">Total (Simples)</button></div>
        <p class="hint">${c.tax.mode === 'fora' ? `O cliente vê a linha ${esc(taxLabel(c))}: <b>${BRL(c.taxFora)}</b>.` : `Os preços da proposta já incluem <b>${BRL(c.taxDentro)}</b> de imposto; o cliente não vê a linha. MEI com DAS fixo: use Sem.`}</p></div>` : ''}
      <div class="vrow total"><span>Total</span><b data-t="total">${BRL(c.total)}</b></div>
    </div>`;
}
/* prazo de execução e dias do serviço, num bloco só: o prazo marca os dias no calendário e o usuário ajusta */
const calMonth = {};
function daysBlockHTML(q) {
  const rep = isReport(q), off = !rep && q.dateTbd, p = q.prazo;
  const qtd = rep
    ? `<div class="days-row"><label for="q-days">Quantos dias de serviço</label>
      <div class="stepper"><button data-days="-1" aria-label="Menos um dia" ${q.days <= 1 ? 'disabled' : ''}>${I.minus}</button><input id="q-days" type="text" inputmode="numeric" value="${q.days}" aria-label="Dias de serviço"><button data-days="1" aria-label="Mais um dia" ${q.days >= 99 ? 'disabled' : ''}>${I.plus}</button></div></div>`
    : `<div class="prazo-row" role="group" aria-labelledby="q-prazo-l">
      <div class="stepper"><button data-days="-1" aria-label="Diminuir o prazo" ${p.n <= 1 ? 'disabled' : ''}>${I.minus}</button><input id="q-days" type="text" inputmode="numeric" value="${p.n}" aria-label="Quantidade do prazo"><button data-days="1" aria-label="Aumentar o prazo" ${p.n >= 99 ? 'disabled' : ''}>${I.plus}</button></div>
      <select id="q-prazo-u" aria-label="Unidade do prazo">${Object.entries(PRAZO_U).map(([k, [pl, sg]]) => `<option value="${k}" ${p.u === k ? 'selected' : ''}>${p.n === 1 ? sg : pl}</option>`).join('')}</select></div>`;
  return `<div class="field sched" id="q-days-blk"><span class="lab" id="q-prazo-l">${rep ? 'Dias trabalhados' : 'Prazo de execução e datas'}</span>
    ${qtd}
    <div id="q-cal-area" ${off ? 'hidden' : ''}>
      <div class="cal-wrap" id="cal">${calHTML(q)}</div>
      <div id="cal-msg" aria-live="polite">${calMsgHTML(q)}</div>
    </div>
    ${rep ? '' : `<label class="switch-row" for="q-tbd"><span><b>Combinar as datas na aprovação</b><small>O prazo vai na proposta; as datas ficam para depois.</small></span><input type="checkbox" class="sw" id="q-tbd" ${q.dateTbd ? 'checked' : ''}></label>
    <p class="hint" id="q-cdc" ${q.dateTbd || q.dates.length ? 'hidden' : ''}>O Código de Defesa do Consumidor pede as datas de início e término no orçamento.</p>`}
  </div>`;
}
function calHTML(q) {
  const base = new Date(calMonth[q.id] || q.dates[0] || Date.now()); base.setDate(1); base.setHours(12, 0, 0, 0);
  const y = base.getFullYear(), m = base.getMonth(), first = base.getDay(), n = new Date(y, m + 1, 0).getDate();
  const hoje = hojeTs(), rep = isReport(q), sel = new Set(q.dates);
  const fim = !rep && q.dates.length ? prazoFim(q.dates[0], q.prazo) : 0;
  const nome = capFirst(base.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
  const mesAtual = new Date(hoje); mesAtual.setDate(1); mesAtual.setHours(12, 0, 0, 0);
  // orçamento: não volta para meses que já passaram (a não ser para ver um dia marcado lá)
  const semVoltar = !rep && base.getTime() <= mesAtual.getTime() && !q.dates.some(t => t < base.getTime());
  let cells = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, k) => `<span class="cal-w" aria-hidden="true" title="${['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][k]}">${d}</span>`).join('');
  cells += '<span></span>'.repeat(first);
  for (let d = 1; d <= n; d++) {
    const t = new Date(y, m, d, 12).getTime(), on = sel.has(t), fer = feriado(t);
    // relatório: só dias que já passaram; orçamento: só de hoje em diante (um dia antigo já marcado ainda pode ser desmarcado)
    const off = rep ? t > hoje : t < hoje && !on;
    const noPrazo = fim && t >= q.dates[0] && t <= fim && !on;
    const nomeDia = new Date(t).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    cells += `<button class="cal-d${t === hoje ? ' hoje' : ''}${fer ? ' fer' : ''}${noPrazo ? ' prazo' : ''}${!rep && t < hoje && on ? ' velho' : ''}" data-cal="${t}" aria-pressed="${on}" aria-label="${esc(nomeDia)}${t === hoje ? ', hoje' : ''}${fer ? ', feriado: ' + esc(fer) : ''}${noPrazo ? ', dentro do prazo' : ''}" ${off ? 'disabled' : ''}${fer ? ` title="${esc(fer)}"` : ''}><span>${d}</span></button>`;
  }
  return `<div class="cal-h"><button class="icon-btn" data-calm="-1" aria-label="Mês anterior" ${semVoltar ? 'disabled' : ''}>${I.left}</button><b aria-live="polite">${esc(nome)}</b><button class="icon-btn" data-calm="1" aria-label="Próximo mês">${I.chev}</button></div>
    <div class="cal-g" role="group" aria-label="Dias de ${esc(nome)}. ${rep ? 'Toque nos dias trabalhados.' : q.dates.length ? 'Toque num dia para pôr ou tirar.' : 'Toque no dia de início.'}">${cells}</div>
    ${fim || Object.keys(feriadosDo(y)).some(k => k.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`)) ? `<p class="cal-leg">${fim ? '<span class="lg-prazo"></span>dentro do prazo' : ''}${Object.keys(feriadosDo(y)).some(k => k.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`)) ? '<span class="lg-fer"></span>feriado' : ''}</p>` : ''}`;
}
function calMsgHTML(q) {
  const n = q.dates.length, rep = isReport(q);
  if (!n) return `<p class="hint">${rep ? 'Toque nos dias em que o serviço foi feito. Dá para escolher dias que não são seguidos.' : `Toque no dia de início: o app marca ${q.prazo.n > 1 || !ehDia(q.prazo) ? `os ${prazoTxt(q.prazo)} do prazo` : 'o dia'}${q.prazo.u === 'uteis' || !ehDia(q.prazo) ? ', sem fins de semana e feriados' : ''}. Depois, toque num dia para pôr ou tirar.`}</p>`;
  const pr = prazoProblema(q);
  if (pr) {
    const fix = pr === 'retro' ? '<button class="linkish" data-cal-reset>Escolher outro início</button>'
      : rep ? `<button class="linkish" data-days-fix>Mudar para ${plural(n, 'dia', 'dias')}</button>`
      : `<button class="linkish" data-days-fix>Mudar o prazo para ${prazoTxt(prazoQueCobre(q))}</button>`;
    return `<div class="cal-msg bad" role="alert">${I.warn}<span><b>${pr === 'retro' ? 'Data retroativa.' : 'O prazo e os dias não conferem.'}</b> ${esc(daysMismatch(q))} ${fix}</span></div>`;
  }
  const fim = rep ? 0 : prazoFim(q.dates[0], q.prazo);
  return `<div class="cal-msg">${I.check}<span><b>${rep ? plural(n, 'dia trabalhado', 'dias trabalhados') : `${capFirst(prazoTxt(q.prazo))}`}:</b> ${esc(diasResumo(q.dates))}.${rep ? '' : ` Término em ${fmtDate(ehDia(q.prazo) ? q.dates[n - 1] : fim)}.`}${rep ? '' : ' <button class="linkish" data-cal-reset>Escolher outro início</button>'}</span></div>`;
}
function bindDays(v, q) {
  const blk = $('#q-days-blk', v); if (!blk) return;
  const rep = isReport(q);
  const pinta = () => {
    q.dates.sort((a, b) => a - b);
    q.startAt = q.dates[0] || null; q.endAt = q.dates[q.dates.length - 1] || null;
    if (rep && q.dates.length) q.doneAt = q.endAt;
    if (!rep) q.deadline = prazoTxt(q.prazo); // aparelhos com versões antigas leem o texto
    touch(q);
    $('#cal', v).innerHTML = calHTML(q);
    $('#cal-msg', v).innerHTML = calMsgHTML(q);
    const dt = $('#q-donetxt', v); if (dt) dt.textContent = execText(q);
    const cdc = $('#q-cdc', v); if (cdc) cdc.hidden = !!q.dates.length || q.dateTbd;
    const n = rep ? q.days : q.prazo.n;
    const di = $('#q-days', v); if (di && document.activeElement !== di) di.value = n;
    $$('[data-days]', v).forEach(b => b.disabled = (+b.dataset.days < 0 && n <= 1) || (+b.dataset.days > 0 && n >= 99));
    const sel = $('#q-prazo-u', v);
    if (sel) [...sel.options].forEach(o => { o.textContent = PRAZO_U[o.value][n === 1 ? 1 : 0]; });
    v.dispatchEvent(new Event('change'));
  };
  // mudou o prazo com o início já escolhido: o app remarca a partir do mesmo início
  const remarca = () => { if (!rep && q.dates.length && q.dates[0] >= hojeTs()) q.dates = prazoDias(q.dates[0], q.prazo); };
  const setN = n => { n = Math.max(1, Math.min(99, n)); if (rep) q.days = n; else { q.prazo.n = n; remarca(); } pinta(); };
  blk.addEventListener('click', e => {
    const d = e.target.closest('[data-cal]');
    if (d) {
      const t = +d.dataset.cal, k = q.dates.indexOf(t);
      if (!rep && !q.dates.length) q.dates = prazoDias(t, q.prazo);
      else if (k >= 0) q.dates.splice(k, 1);
      else if (rep && q.days === 1 && q.dates.length === 1) q.dates = [t]; // um dia só: marcar outro troca o dia
      else q.dates.push(t);
      vibrate(); pinta(); $(`[data-cal="${t}"]`, v)?.focus({ preventScroll: true }); return;
    }
    const mo = e.target.closest('[data-calm]');
    if (mo) {
      const b = new Date(calMonth[q.id] || q.dates[0] || Date.now()); b.setDate(1); b.setMonth(b.getMonth() + +mo.dataset.calm); calMonth[q.id] = b.getTime();
      $('#cal', v).innerHTML = calHTML(q); $(`[data-calm="${mo.dataset.calm}"]:not([disabled])`, v)?.focus(); return;
    }
    const st = e.target.closest('[data-days]');
    if (st) return setN((rep ? q.days : q.prazo.n) + +st.dataset.days);
    if (e.target.closest('[data-cal-reset]')) { q.dates = []; delete calMonth[q.id]; pinta(); toast('Toque no novo dia de início.'); return; }
    if (e.target.closest('[data-days-fix]')) {
      if (rep) q.days = Math.max(1, q.dates.length); else q.prazo = prazoQueCobre(q);
      pinta(); toast(rep ? `Dias de serviço: ${q.days}.` : `Prazo: ${prazoTxt(q.prazo)}.`);
    }
  });
  const di = $('#q-days', v);
  di?.addEventListener('input', () => { const n = parseInt(di.value.replace(/\D/g, ''), 10); if (n >= 1) setN(n); });
  di?.addEventListener('change', () => { di.value = rep ? q.days : q.prazo.n; });
  $('#q-prazo-u', v)?.addEventListener('change', e => { q.prazo.u = e.target.value; remarca(); pinta(); });
}
VIEWS.quote = {
  html(r) {
    const q = getQ(r.id), c = compute(q), S = quoteSums(q, c);
    return `<header class="kf-barra appbar"><div class="kf-barra-in">
      <button class="icon-btn" data-back aria-label="Voltar">${I.back}</button>
      <div class="ab-title"><span class="ab-row"><span class="ab-eyebrow">${q.example ? 'Exemplo' : `<span class="ab-tipo">${isReport(q) ? 'Relatório' : 'Orçamento'} </span>` + numLabel(q)} · ${STATUS[q.status]}</span><span class="ab-saved" id="ab-saved" role="status" aria-label="Alterações salvas neste aparelho">${I.check}<span>Salvo</span></span></span><span class="ab-main" id="ab-name">${esc(q.client.name || (isReport(q) ? 'Novo relatório' : 'Novo orçamento'))}</span></div>
      ${KitFacil.topo.html({ principal: false })}
    </div></header>
    <main class="page bar">
      ${q.example ? `<div class="banner b-tip"><p><b>Este é um orçamento de exemplo.</b> Mexa à vontade para conhecer o app e exclua quando quiser pelo botão ⋯, ao lado de Ver proposta.</p></div>` : ''}
      ${statusBanner(q, c)}
      <section class="prancheta pr-orc" aria-label="${isReport(q) ? 'Folha do relatório' : 'Folha do orçamento'}"><span class="pr-clipe" aria-hidden="true"><i></i></span><div class="folha fo-orc">
      <p class="mono fo-cab"><span>${isReport(q) ? 'Relatório' : 'Orçamento'} ${esc(numLabel(q).toLowerCase())}</span><span>${fmtDate(q.createdAt)}</span></p>
      ${panelOpen(`q:${q.id}:cli`, 'cli', 'Cliente e serviço', S.cli)}
        <div class="field"><label for="q-name">Nome</label><input id="q-name" type="text" autocapitalize="words" autocomplete="off" placeholder="Nome do cliente" value="${esc(q.client.name)}"></div>
        <div class="grid2 stack">
          <div class="field"><label for="q-phone">WhatsApp</label><input id="q-phone" type="tel" inputmode="tel" autocomplete="off" placeholder="(11) 90000-0000" value="${esc(fmtPhone(q.client.phone))}"></div>
          <div class="field"><label for="q-doc">CPF ou CNPJ <span class="lab-opt">opcional</span></label><input id="q-doc" type="text" inputmode="numeric" autocomplete="off" placeholder="Sai no orçamento e no recibo" value="${esc(fmtDoc(q.client.doc))}"></div>
        </div>
        <div class="field"><label for="q-addr">Endereço da obra</label><input id="q-addr" type="text" autocomplete="off" placeholder="Rua, número, bairro" value="${esc(q.client.address)}"></div>
        <div class="field"><label for="q-title">Serviço</label><input id="q-title" type="text" autocomplete="off" placeholder="Ex.: Troca do quadro e instalação de chuveiro" value="${esc(q.title)}"></div>
      ${panelClose}

      ${techCardHTML(q)}
      ${panel(`q:${q.id}:items`, 'items', q.useRooms ? 'Ambientes e itens' : 'Serviços e material', S.items, roomToggleHTML(q) + (q.useRooms ? roomsHTML(q, c) : kindCardsHTML(q, c)), { right: S.itemsR })}
      ${panel(`q:${q.id}:val`, 'val', 'Valores', S.val, valuesHTML(q, c), { right: S.valR })}

      ${panelOpen(`q:${q.id}:cond`, 'cond', isReport(q) ? 'Datas, pagamento e garantia' : 'Pagamento, datas e garantia', S.cond, { attrs: ' id="h-cond"' })}
        <div class="field"><span class="lab">Pagamento</span>
          <div class="seg" role="group" aria-label="Forma de pagamento">${[['avista', 'À vista'], ['entrada', 'Entrada'], ['parcelado', 'Cartão'], ['combinar', 'Combinar']].map(([k, l]) => `<button data-pm="${k}" aria-pressed="${q.payment.mode === k}">${l}</button>`).join('')}</div>
        </div>
        ${payBlockHTML(q, c)}
        ${daysBlockHTML(q)}
        <div class="grid2">
          <div class="field"><label for="q-war">Garantia, em dias</label><input id="q-war" type="text" inputmode="numeric" placeholder="90" value="${q.warranty || ''}"></div>
          ${isReport(q) ? '' : `<div class="field"><label for="q-val">Validade, em dias</label><input id="q-val" type="text" inputmode="numeric" placeholder="15" value="${q.validity || ''}"></div>`}
        </div>
      ${panelClose}
      ${panelOpen(`q:${q.id}:notes`, 'notes', 'Observações', S.notes)}
        <div class="field"><textarea id="q-notes" aria-label="Observações" placeholder="O que está fora do orçamento, cuidados no dia do serviço…">${esc(q.notes)}</textarea>
          </div>
        <div class="field"><span class="lab" id="q-nt-l">Textos prontos</span>${linhas(NOTE_CHIPS.map(([l, t], k) => linha(`data-note="${k}"`, l, { tipo: 'mais', dis: q.notes.includes(t) })), ' role="group" aria-labelledby="q-nt-l"')}</div>
      ${panelClose}
      </div></section>
      <button type="button" class="kf-btn kf-perigo block fo-excluir" data-excluir>${q.example ? 'Excluir o exemplo' : isReport(q) ? 'Excluir relatório' : 'Excluir orçamento'}</button>
    </main>
    <aside class="q-vivo" aria-label="Prévia ${isReport(q) ? 'do relatório' : 'da proposta'}"><div class="q-vivo-in"><div class="q-vivo-cab"><b>Prévia ao vivo</b><span class="hint">Muda enquanto você edita</span></div>${paperHTML(q, c, docMode(q))}</div></aside>
    <div class="bbar"><div class="bbar-in">
      <div class="bb-total"><small data-t="paylab">${payLabel(q, c)}</small><b data-t="paytotal">${BRL(c.payTotal)}</b></div>
      <button class="icon-btn boxed" data-menu aria-label="Mais opções do orçamento">${I.more}</button>
      <button class="btn primary" data-preview>${isReport(q) ? 'Ver relatório' : 'Ver proposta'}${I.arrow}</button>
    </div></div>`;
  },
  bind(v, r) {
    const q = getQ(r.id);
    const paint = () => {
      const c = compute(q);
      $$('[data-t="labor"]', v).forEach(e => e.textContent = BRL(c.labor));
      $$('[data-t="mat"]', v).forEach(e => e.textContent = BRL(c.matTotal));
      $$('[data-t="total"]', v).forEach(e => e.textContent = BRL(c.total));
      $$('[data-t="paytotal"]', v).forEach(e => e.textContent = BRL(c.payTotal));
      $$('[data-t="paylab"]', v).forEach(e => e.textContent = payLabel(q, c));
      const ps = $('#pay-sum', v); if (ps) ps.innerHTML = paySumHTML(q, c);
      outrasFormas(q).forEach(m => { const e = $('#pay-sum-' + m, v); if (e) { const x = comForma(q, m); e.innerHTML = paySumHTML(x.q, x.c); } });
      paintSums(v, quoteSums(q, c));
    };
    ['input', 'change'].forEach(ev => v.addEventListener(ev, () => requestAnimationFrame(paint)));
    $('[data-back]', v).onclick = () => back('/');
    $('[data-menu]', v).onclick = () => quoteMenu(q);
    $('[data-excluir]', v).onclick = () => deleteQuote(q);
    $('[data-preview]', v).onclick = () => go('/q/' + q.id + '/proposta');

    // cliente
    const nm = $('#q-name', v);
    nm.addEventListener('input', () => { q.client.name = nm.value.replace(/\s+/g, ' ').trimStart(); $('#ab-name').textContent = q.client.name || (isReport(q) ? 'Novo relatório' : 'Novo orçamento'); touch(q); });
    nm.addEventListener('change', () => { q.client.name = nm.value.trim().replace(/\s+/g, ' '); touch(q); });
    attachSuggest(nm, () => clientList().map(k => ({ label: k.name, right: k.phone ? fmtPhone(k.phone) : k.address, k })), x => {
      q.client.name = x.k.name;
      if (!q.client.phone) q.client.phone = x.k.phone; if (!q.client.address) q.client.address = x.k.address; if (!q.client.doc) q.client.doc = x.k.doc || '';
      touch(q); rerender();
    });
    $('#q-phone', v).addEventListener('input', e => { q.client.phone = e.target.value.trim(); touch(q); });
    $('#q-phone', v).addEventListener('change', e => { e.target.value = fmtPhone(e.target.value); });
    $('#q-addr', v).addEventListener('input', e => { q.client.address = e.target.value; touch(q); });
    $('#q-doc', v).addEventListener('input', e => { q.client.doc = e.target.value.trim(); touch(q); });
    $('#q-doc', v).addEventListener('change', e => {
      const d = phoneDigits(e.target.value);
      e.target.value = fmtDoc(e.target.value);
      if (!d) return;
      if (d.length === 11 && !cpfValid(d)) toast('Esse CPF parece ter um número errado. Confira.');
      else if (d.length === 14 && !cnpjValid(d)) toast('Esse CNPJ parece ter um número errado. Confira.');
      else if (d.length !== 11 && d.length !== 14) toast('O CPF tem 11 números e o CNPJ tem 14.');
    });
    $('#q-title', v).addEventListener('input', e => { q.title = e.target.value; touch(q); });
    $('#q-title', v).addEventListener('change', e => { q.title = e.target.value.trim(); touch(q); });

    // itens e ambientes
    $('#q-rooms', v).addEventListener('change', e => { q.useRooms = e.target.checked; touch(q); rerender(); if (q.useRooms && !q.rooms.length) roomAddSheet(q); });
    $$('[data-add]', v).forEach(b => b.onclick = () => pickerSheet(q, b.dataset.add));
    $$('[data-add-room]', v).forEach(b => b.onclick = () => pickerSheet(q, 'svc', b.dataset.addRoom));
    $$('[data-room-menu]', v).forEach(b => b.onclick = () => roomMenu(q, b.dataset.roomMenu));
    $('[data-new-room]', v)?.addEventListener('click', () => roomAddSheet(q));
    $('[data-conf-pdf]', v)?.addEventListener('click', e => shareConference(q, e.currentTarget));
    $$('[data-dq]', v).forEach(b => b.onclick = () => { const i = q.items.find(x => x.id === b.dataset.id); if (!i) return; i.qty = Math.max(1, Math.round((i.qty + +b.dataset.dq) * 100) / 100); if (+b.dataset.dq < 0) ultimoMenos = { id: i.id, t: Date.now() }; touch(q); rerender(); });
    // a lixeira aparece no lugar do − quando a quantidade chega a 1: um segundo toque logo em seguida não apaga (U9)
    $$('[data-rm]', v).forEach(b => b.onclick = () => { if (ultimoMenos.id === b.dataset.rm && Date.now() - ultimoMenos.t < 900) return; removeLine(q, b.dataset.rm); });
    // tocar no número abre o item com a quantidade pronta para digitar (U8)
    $$('[data-qe]', v).forEach(b => b.onclick = () => { const i = q.items.find(x => x.id === b.dataset.qe); if (!i) return; lineSheet(q, i); });
    $$('[data-edit]', v).forEach(b => b.onclick = () => lineSheet(q, q.items.find(x => x.id === b.dataset.edit)));
    $('#q-matcli', v).addEventListener('change', e => { q.materialBy = e.target.checked ? 'cliente' : 'eu'; touch(q); rerender(); });

    // valores
    $$('[data-x]', v).forEach(b => b.onclick = () => {
      const k = b.dataset.x, ex = EXTRAS.find(x => x[0] === k), sk = ex[2];
      if (q.extras[k]) { q.extras[k] = 0; touch(q); return rerender(); }
      if (settings[sk]) { q.extras[k] = settings[sk]; touch(q); return rerender(); }
      // sem percentual padrão: pede o valor aqui mesmo, com a opção de guardar para os próximos
      openSheet({ title: `Adicional de ${ex[3]}`, body: `<div class="field"><label for="ax-pct">Percentual sobre a mão de obra</label><input id="ax-pct" type="text" inputmode="numeric" placeholder="Ex.: ${{ urgent: 50, night: 30, weekend: 50 }[k]}"></div>
          <label class="switch-row" for="ax-pad"><span><b>Usar nos próximos orçamentos</b><small>Fica em Ajustes, Adicionais.</small></span><input type="checkbox" class="sw" id="ax-pad" checked></label>`,
        foot: `<button class="btn ghost" data-no>Cancelar</button><button class="btn primary" data-ok>${I.plus}Aplicar</button>`,
        onMount: s => {
          $('[data-no]', s).onclick = () => closeSheet();
          $('[data-ok]', s).onclick = () => {
            const n = Math.max(0, Math.min(300, parseInt($('#ax-pct', s).value.replace(/\D/g, ''), 10) || 0));
            if (!n) return toast('Informe o percentual do adicional.');
            q.extras[k] = n; if ($('#ax-pad', s).checked) { settings[sk] = n; saveSettings(); }
            touch(q); closeSheet(true); rerender();
          };
        } });
    });
    $('[data-trip]', v).onclick = () => tripSheet(q);
    $$('[data-dm]', v).forEach(b => b.onclick = () => { if (q.discount.mode === b.dataset.dm) return; q.discount.mode = b.dataset.dm; touch(q); rerender(); });
    $('[data-pago]', v)?.addEventListener('click', () => pagoSheet(q));
    $$('[data-pago-rm]', v).forEach(b => b.onclick = () => { const x = q.pagos.find(y => y.id === b.dataset.pagoRm); if (!x) return; q.pagos = q.pagos.filter(y => y !== x); touch(q); rerender(); toast(`Pagamento de ${BRL(x.v)} apagado.`, { label: 'Desfazer', run: () => { q.pagos.push(x); q.pagos.sort((a, b) => a.t - b.t); touch(q); rerender(); } }); });
    // impostos (F6): o modo e a base escolhidos aqui viram o padrão dos próximos orçamentos
    const lembraTax = () => { settings.taxMode = q.tax.mode; settings.taxPct = q.tax.pct; settings.taxBase = q.tax.base; saveSettings(); };
    $$('[data-tx]', v).forEach(b => b.onclick = () => { q.tax = { ...taxOf(q), mode: b.dataset.tx }; if (q.tax.mode !== 'sem' && !q.tax.pct) q.tax.pct = 5; lembraTax(); touch(q); rerender(); });
    $$('[data-txb]', v).forEach(b => b.onclick = () => { q.tax = { ...taxOf(q), base: b.dataset.txb }; lembraTax(); touch(q); rerender(); });
    $('#q-txp', v)?.addEventListener('change', e => { const x = parseQty(e.target.value); q.tax = { ...taxOf(q), pct: Math.max(0, Math.min(30, x || 0)) }; e.target.value = fmtQty(q.tax.pct); lembraTax(); touch(q); rerender(); });
    $('#q-disc', v).addEventListener('input', e => {
      if (q.discount.mode === 'value') q.discount.value = parseMoney(e.target.value) || 0;
      else q.discount.pct = Math.min(100, parseQty(e.target.value) || 0);
      touch(q); paint();
    });

    // condições
    $$('[data-pm]', v).forEach(b => b.onclick = () => { q.payment.mode = b.dataset.pm; q.payment.outras = (q.payment.outras || []).filter(m => m !== b.dataset.pm); touch(q); rerender(); });
    $$('[data-outra]', v).forEach(b => b.onclick = () => { const m = b.dataset.outra, L = q.payment.outras || []; q.payment.outras = L.includes(m) ? L.filter(x => x !== m) : [...L, m]; touch(q); rerender(); });
    $$('[data-ep]', v).forEach(b => b.onclick = () => { q.payment.entryPct = +b.dataset.ep; touch(q); rerender(); });
    $$('[data-in]', v).forEach(b => b.onclick = () => { q.payment.installments = Math.max(1, Math.min(18, (q.payment.installments || 3) + +b.dataset.in)); q.payment.taxaPct = null; touch(q); rerender(); });
    $$('[data-ct]', v).forEach(b => b.onclick = () => { q.payment.cardTipo = b.dataset.ct; if (b.dataset.ct === 'debito' && q.payment.juros === 'mes') q.payment.juros = 'taxa'; q.payment.taxaPct = null; touch(q); rerender(); });
    $$('[data-jur]', v).forEach(b => b.onclick = () => { q.payment.juros = b.dataset.jur; touch(q); rerender(); });
    $$('[data-paga]', v).forEach(b => b.onclick = () => { q.payment.paga = b.dataset.paga; touch(q); rerender(); });
    $$('[data-sa]', v).forEach(b => b.onclick = () => { q.payment.semAte = Math.max(0, Math.min(18, (q.payment.semAte || 0) + +b.dataset.sa)); touch(q); rerender(); });
    $$('[data-avm]', v).forEach(b => b.onclick = () => { if (q.payment.avista.mode === b.dataset.avm) return; q.payment.avista.mode = b.dataset.avm; touch(q); rerender(); });
    $('[data-taxa-tab]', v)?.addEventListener('click', () => { q.payment.taxaPct = null; touch(q); rerender(); });
    $('#q-taxa', v)?.addEventListener('input', e => { const x = parseQty(e.target.value); q.payment.taxaPct = x === null ? 0 : Math.max(0, Math.min(40, x)); touch(q); paint(); });
    $('#q-taxa', v)?.addEventListener('change', () => rerender());
    $('#q-mes', v)?.addEventListener('input', e => { q.payment.mesPct = Math.max(0, Math.min(20, parseQty(e.target.value) || 0)); touch(q); paint(); });
    $('#q-avd', v)?.addEventListener('input', e => { const a = q.payment.avista; if (a.mode === 'value') a.value = parseMoney(e.target.value) || 0; else a.pct = Math.max(0, Math.min(50, parseQty(e.target.value) || 0)); touch(q); paint(); });
    // só números: o que aparece no campo é o que vale (nada de "-10" na tela e 10 por dentro)
    const soDigitos = el => { const d = el.value.replace(/\D/g, '').slice(0, 5); if (el.value !== d) el.value = d; return parseInt(d, 10) || 0; };
    $('#q-war', v).addEventListener('input', e => { q.warranty = soDigitos(e.target); touch(q); });
    $('#q-war', v).addEventListener('change', e => { if (q.warranty > 1825) confirmSheet('Garantia longa', `${q.warranty} dias são mais de ${Math.floor(q.warranty / 365)} anos. É isso mesmo?`, 'Manter', () => {}, false); });
    $('#q-val', v)?.addEventListener('input', e => { q.validity = soDigitos(e.target); touch(q); });
    $('#q-val', v)?.addEventListener('change', e => { if (!q.validity) { q.validity = 1; e.target.value = '1'; touch(q); toast('A validade mínima é de 1 dia: a proposta vale até amanhã.'); } else if (q.validity > 365) confirmSheet('Validade longa', `A proposta valeria por ${q.validity} dias. Preços de material mudam: é isso mesmo?`, 'Manter', () => {}, false); });
    // datas do serviço: dias de serviço e calendário
    bindDays(v, q);
    $('#q-tbd', v)?.addEventListener('change', e => { q.dateTbd = e.target.checked; touch(q); $('#q-cal-area', v).hidden = q.dateTbd; const cdc = $('#q-cdc', v); if (cdc) cdc.hidden = q.dateTbd || !!q.dates.length; requestAnimationFrame(() => paintSums(v, quoteSums(q, compute(q)))); });
    // serviço já realizado: vira relatório; desfazer volta para a situação anterior
    $('#q-done', v)?.addEventListener('change', e => { if (!e.target.checked) return; setStatus(q, 'concluido'); rerender(); window.scrollTo({ top: 0 }); setTimeout(() => baixaSheet(q), 350); toast('Agora é um Relatório de Serviços Executados.'); });
    $('[data-goto-days]', v)?.addEventListener('click', () => { const d = $(`details[data-panel="q:${q.id}:cond"]`, v); KitFacil.secao.abrir(d); setTimeout(() => $('#cal', v)?.querySelector('[aria-pressed="true"], button.cal-d:not([disabled])')?.focus({ preventScroll: true }), KitFacil.movimento.ms + 40); });
    $('[data-undone]', v)?.addEventListener('click', () => {
      const prev = q.prevStatus && q.prevStatus !== 'concluido' ? q.prevStatus : 'rascunho';
      setStatus(q, prev); rerender(); toast(`Voltou para ${STATUS[prev].toLowerCase()}. O documento é orçamento de novo.`);
    });
    $('[data-pix-rest]', v)?.addEventListener('click', () => { const px = pixOf(q, compute(q), 'report'); if (px) pixSheet(px); });
    const nt = $('#q-notes', v);
    nt.addEventListener('input', () => { q.notes = nt.value; touch(q); $$('[data-note]', v).forEach(c => linhaFeita(c, q.notes.includes(NOTE_CHIPS[+c.dataset.note][1]))); });
    $$('[data-note]', v).forEach(b => b.onclick = () => {
      const t = NOTE_CHIPS[+b.dataset.note][1];
      q.notes = (q.notes.trim() ? q.notes.trim() + '\n' : '') + t; nt.value = q.notes; autoGrow(nt); touch(q); linhaFeita(b, true);
    });

    // relatório técnico: etapa 1 (botão) abre a etapa 2 (detalhes); a frase entra no fim do campo
    $$('[data-tech]', v).forEach(t => t.addEventListener('input', () => {
      const k = t.dataset.tech; q[k] = t.value; touch(q);
      $$(`[data-tc="${k}"]`, v).forEach(b => { const it = TECH[k][+b.dataset.ti]; if (it.s) linhaFeita(b, q[k].includes(it.s)); });
    }));
    $$('[data-tc]', v).forEach(b => b.onclick = () => {
      const k = b.dataset.tc, it = TECH[k][+b.dataset.ti];
      const add = txt => {
        if (k === 'tests') { q.tests.push(txt); touch(q); rerender(); return; }
        const ta = $('#q-' + k); q[k] = (q[k].trim() ? q[k].trim() + '\n' : '') + txt; touch(q);
        if (ta) { ta.value = q[k]; autoGrow(ta); }
        toast('Adicionado.');
      };
      if (it.s) { if (!q[k].includes(it.s)) { add(it.s); linhaFeita(b, true); } else toast('Esse texto já está no campo.'); return; }
      techSheet(q, k, +b.dataset.ti, add);
    });
    $$('[data-test-rm]', v).forEach(b => b.onclick = () => {
      const k = +b.dataset.testRm, [gone] = q.tests.splice(k, 1); touch(q); rerender();
      toast('Teste removido.', { label: 'Desfazer', run: () => { q.tests.splice(k, 0, gone); touch(q); rerender(); } });
    });
    $('[data-work-items]', v)?.addEventListener('click', () => {
      const txt = q.items.filter(i => i.kind === 'svc').map(i => `${i.name}: ${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)}.`).join('\n');
      q.work = (q.work.trim() ? q.work.trim() + '\n' : '') + txt; $('#q-work', v).value = q.work; autoGrow($('#q-work', v)); touch(q);
    });

    // situação
    $$('[data-st]', v).forEach(b => b.onclick = () => { if (b.dataset.st === 'aprovado') return approveSheet(q); setStatus(q, b.dataset.st); rerender(); if (q.status === 'concluido') setTimeout(() => baixaSheet(q), 350); toast({ aprovado: 'Boa! Orçamento aprovado.', recusado: 'Marcado como recusado.', concluido: 'Serviço concluído.', rascunho: 'Reaberto como rascunho.' }[b.dataset.st] || 'Situação alterada.'); });
    $('[data-pix]', v)?.addEventListener('click', () => { const px = pixOf(q, compute(q)); if (px) pixSheet(px); });
    $('[data-receipt]', v)?.addEventListener('click', () => receiptSheet(q));
  },
};
let ultimoMenos = { id: '', t: 0 };
function removeLine(q, id) {
  const idx = q.items.findIndex(x => x.id === id); if (idx < 0) return;
  const [gone] = q.items.splice(idx, 1); touch(q); rerender();
  toast(`${gone.name} removido.`, { label: 'Desfazer', run: () => { q.items.splice(idx, 0, gone); touch(q); rerender(); } });
}
function quoteMenu(q) {
  openSheet({ title: q.client.name || 'Orçamento', body: `<div class="opts">
      <button class="opt" data-o="status">${I.flag}<span>Alterar situação<small>Agora: ${STATUS[q.status]}</small></span></button>
      ${['aprovado', 'concluido'].includes(q.status) ? `<button class="opt" data-o="receipt">${I.receipt}<span>Gerar recibo</span></button>` : ''}
      <button class="opt" data-o="dup">${I.dup}<span>Duplicar<small>Cria um rascunho igual, com novo número</small></span></button>
    </div>`,
    onMount: s => $$('[data-o]', s).forEach(b => b.onclick = () => {
      const o = b.dataset.o;
      if (o === 'status') statusSheet(q);
      if (o === 'receipt') receiptSheet(q);
      if (o === 'dup') { closeSheet(true); duplicateQuote(q); }
    }) });
}
// campo de data: <input type="date"> que o Kit Fácil troca pelo calendário do app (KitFacil.data); aqui só convertemos
const isoDe = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const tsDeIso = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12).getTime() : null; };
function approveSheet(q) {
  let via = q.approvedVia || 'msg';
  const OPTS = [['msg', 'Por mensagem', 'WhatsApp ou e-mail. Vale como aprovação por escrito.'], ['sign', 'Assinou a proposta', 'No papel ou em PDF assinado.'], ['verbal', 'Pessoalmente', 'Sem registro escrito.']];
  openSheet({ title: 'Orçamento aprovado', body: `
      <p class="hint">Como o cliente aprovou? Fica registrado no orçamento e no relatório.</p>
      <div class="opts">${OPTS.map(([k, l, h]) => `<button class="opt" data-via="${k}" aria-pressed="${via === k}"><span>${l}<small>${h}</small></span></button>`).join('')}</div>
      <div class="banner b-tip" id="ap-warn"${via === 'verbal' ? '' : ' hidden'}><p><b>Peça uma confirmação por escrito.</b> Um “De acordo” do cliente no WhatsApp protege você se houver discordância depois.</p></div>
      <div class="field"><label for="ap-date">Data da aprovação</label><input type="date" id="ap-date" required max="${isoDe(hojeTs())}" value="${isoDe(hojeTs())}"></div>`,
    foot: `<button class="btn primary" data-ok>${I.check}Registrar aprovação</button>`,
    onMount: s => {
      $$('[data-via]', s).forEach(b => b.onclick = () => { via = b.dataset.via; $$('[data-via]', s).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#ap-warn', s).hidden = via !== 'verbal'; });
      $('[data-ok]', s).onclick = () => {
        setStatus(q, 'aprovado');
        q.approvedVia = via; q.approvedAt = Math.min(tsDeIso($('#ap-date', s).value) || Date.now(), Date.now()); touch(q);
        closeSheet(true); rerender(); toast('Boa! Aprovação registrada.');
      };
    } });
}
/* baixa no estoque ao concluir: material do orçamento que está no estoque (quando o material é por sua conta) */
function stockMatch(q) {
  if (q.materialBy === 'cliente' || q.example) return [];
  const m = new Map();
  q.items.filter(i => i.kind === 'mat').forEach(i => {
    const p = prices.find(x => inStock(x) && norm(x.name) === norm(i.name)); if (!p) return;
    m.set(p.id, Math.round(((m.get(p.id) || 0) + i.qty) * 100) / 100);
  });
  return [...m].map(([id, qty]) => ({ p: prices.find(x => x.id === id), qty }));
}
function baixaSheet(q) {
  if (q.baixa && q.baixa.length) return;
  const L = stockMatch(q); if (!L.length) return;
  const row = (x, k) => {
    const fica = Math.round((x.p.stock - x.qty) * 100) / 100, falta = fica < 0, baixo = !falta && (fica <= 0 || (x.p.min > 0 && fica <= x.p.min));
    return `<div class="bx-row" data-bx="${k}"><div class="bx-t"><b>${esc(x.p.name)}</b><small>em estoque: ${fmtQty(x.p.stock)} → <b>${fmtQty(Math.max(0, fica))}</b> ${unitTxt(Math.max(0, fica), x.p.unit)}${falta ? `<span class="bx-w">${I.warn}faltam ${fmtQty(-fica)}: fica em 0</span>` : baixo ? `<span class="bx-w">${I.warn}abaixo do mínimo</span>` : ''}</small></div>
      <div class="stepper"><button data-bq="-1" data-k="${k}" aria-label="Menos ${esc(x.p.name)}" ${x.qty <= 0 ? 'disabled' : ''}>${I.minus}</button><input type="text" inputmode="decimal" data-bi="${k}" value="${fmtQty(x.qty)}" aria-label="Quantidade usada de ${esc(x.p.name)}"><button data-bq="1" data-k="${k}" aria-label="Mais ${esc(x.p.name)}">${I.plus}</button></div></div>`;
  };
  openSheet({ title: 'Dar baixa no estoque?',
    body: `<p class="hint">Material deste serviço que está no seu estoque. Ajuste se usou mais ou menos.</p><div class="bx-list" id="bx-list">${L.map(row).join('')}</div><p class="hint">Se você desfizer a conclusão, o material volta para o estoque.</p>`,
    foot: `<button class="btn ghost" data-no>Agora não</button><button class="btn primary" data-ok>${I.check}Dar baixa</button>`,
    onMount: s => {
      const pinta = k => { const el = $(`[data-bx="${k}"]`, s); const tmp = document.createElement('div'); tmp.innerHTML = row(L[k], k); el.replaceWith(tmp.firstElementChild); };
      s.addEventListener('click', e => { const b = e.target.closest('[data-bq]'); if (!b) return; const k = +b.dataset.k; L[k].qty = Math.max(0, Math.round((L[k].qty + +b.dataset.bq) * 100) / 100); pinta(k); });
      s.addEventListener('change', e => { const i = e.target.closest('[data-bi]'); if (!i) return; const k = +i.dataset.bi; L[k].qty = Math.max(0, parseQty(i.value) || 0); pinta(k); });
      $('[data-no]', s).onclick = () => closeSheet();
      $('[data-ok]', s).onclick = () => {
        q.baixa = [];
        L.forEach(x => { const sai = Math.min(x.p.stock, x.qty); if (sai <= 0) return; const lotes = tiraDoEstoque(x.p, sai); q.baixa.push({ id: x.p.id, qty: sai, lotes }); });
        savePrices(); touch(q); closeSheet(true); rerender();
        const low = L.filter(x => stockLow(x.p)).length;
        toast(`Baixa feita: ${plural(q.baixa.length, 'material', 'materiais')}.${low ? ` ${plural(low, 'precisa', 'precisam')} de reposição.` : ''}`, { label: 'Desfazer', run: () => {
          (q.baixa || []).forEach(b => devolveAoEstoque(prices.find(x => x.id === b.id), b));
          q.baixa = null; savePrices(); touch(q); rerender();
        } });
      };
    } });
}
function statusSheet(q) {
  const help = { rascunho: 'Ainda montando', enviado: 'Proposta com o cliente', aprovado: 'Cliente aceitou; serviço a executar', concluido: 'Serviço feito e entregue', recusado: 'Cliente não aceitou' };
  openSheet({ title: 'Situação do orçamento', body: `<div class="opts">${Object.keys(STATUS).map(k => `<button class="opt" data-s="${k}" aria-pressed="${q.status === k}">${pill(k)}<span><small>${help[k]}</small></span></button>`).join('')}</div>`,
    onMount: s => $$('[data-s]', s).forEach(b => b.onclick = () => { if (b.dataset.s === 'aprovado' && q.status !== 'aprovado') return approveSheet(q); setStatus(q, b.dataset.s); closeSheet(true); rerender(); if (q.status === 'concluido') setTimeout(() => baixaSheet(q), 350); toast('Situação: ' + STATUS[q.status] + '.'); }) });
}

/* ================= escolher itens da tabela ================= */
function addFromPrice(q, p, room = '') {
  const ex = q.items.find(i => i.kind === p.kind && norm(i.name) === norm(p.name) && i.unit === p.unit && i.price === p.price && (!q.useRooms || roomOf(q, i) === room));
  if (ex) ex.qty = Math.round((ex.qty + 1) * 100) / 100;
  else q.items.push({ id: uid(), kind: p.kind, name: p.name, unit: p.unit, qty: 1, price: p.price, room: q.useRooms ? room : '' });
  touch(q); vibrate();
}
function groupByCat(list) {
  const order = catOrder(list.length ? list[0].kind : 'svc');
  const cats = [...new Set(list.map(p => p.cat || 'Outros'))].sort((a, b) => { const ia = order.indexOf(a), ib = order.indexOf(b); return (ia < 0 ? 98 : ia) - (ib < 0 ? 98 : ib) || a.localeCompare(b, 'pt-BR'); });
  return cats.map(cat => [cat, list.filter(p => (p.cat || 'Outros') === cat).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }))]);
}
const hl = (s, qf) => { if (!qf) return esc(s); const i = fold(s).indexOf(qf); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + qf.length)) + '</mark>' + esc(s.slice(i + qf.length)); };
let lastRoomKind = null;
/* F5: depois de adicionar serviços com composição, o app sugere o material (quantidades editáveis, marque o que vai) */
function sugerirMaterial(q, svcAdd, room = '') {
  const tot = new Map();
  Object.entries(svcAdd).forEach(([pid, n]) => { const sv = prices.find(x => x.id === pid); (sv && sv.comp || []).forEach(c => { const m = prices.find(x => x.kind === 'mat' && norm(x.name) === norm(c.n)); if (m) tot.set(m.id, Math.round(((tot.get(m.id) || 0) + c.q * n) * 100) / 100); }); });
  if (!tot.size || q.materialBy === 'cliente') return;
  const L = [...tot].map(([id, qtd]) => ({ m: prices.find(x => x.id === id), qtd, on: true }));
  const nomes = Object.keys(svcAdd).map(id => (prices.find(x => x.id === id) || {}).name).filter(Boolean);
  openSheet({ title: 'Material sugerido', body: `<p class="hint">Para ${esc(joinPt(nomes.map(n => n.charAt(0).toLowerCase() + n.slice(1))))}. Desmarque o que o cliente já tem e ajuste as quantidades.</p>
      <div class="sug-list">${L.map((x, k) => `<label class="sug-row"><input type="checkbox" class="sw-check" data-sk="${k}" checked><span class="sug-n">${esc(x.m.name)}<small>${BRL(x.m.price)} por ${unitName(x.m.unit)}</small></span>
        <input type="text" inputmode="decimal" class="sug-q" data-sq="${k}" value="${fmtQty(x.qtd)}" aria-label="Quantidade de ${esc(x.m.name)}"><span class="sug-u">${unitTxt(x.qtd, x.m.unit)}</span></label>`).join('')}</div>
      <p class="hint">A sugestão vem da tabela de preços: em Preços, toque no serviço para mudar o material que costuma ir.</p>`,
    foot: `<button class="btn ghost" data-cancel>Agora não</button><button class="btn primary" data-ok>${I.plus}Adicionar material</button>`,
    onMount: s2 => {
      $('[data-cancel]', s2).onclick = () => closeSheet();
      $('[data-ok]', s2).onclick = () => {
        let n = 0, alto = 0;
        L.forEach((x, k) => { if (!$(`[data-sk="${k}"]`, s2).checked) return; const qq = parseQty($(`[data-sq="${k}"]`, s2).value); if (!qq) return; if (qq > QTD_ALTA) alto++;
          const ex = q.items.find(i => i.kind === 'mat' && norm(i.name) === norm(x.m.name) && i.price === x.m.price && (!q.useRooms || roomOf(q, i) === room));
          if (ex) ex.qty = Math.round((ex.qty + qq) * 100) / 100; else q.items.push({ id: uid(), kind: 'mat', name: x.m.name, unit: x.m.unit, qty: qq, price: x.m.price, room: q.useRooms ? room : '' });
          n++; });
        touch(q); closeSheet(true); rerender();
        if (n) toast(`${plural(n, 'material adicionado', 'materiais adicionados')}.`);
      };
    } });
}
function pickerSheet(q, kind, room) {
  const inRoom = q.useRooms;
  room = inRoom ? (room || '') : '';
  let k = inRoom && lastRoomKind ? lastRoomKind : kind, query = '';
  const svcAdd = {}; // serviços adicionados nesta janela: nome → quantidade (para sugerir o material)
  const listHTML = () => {
    const qf = fold(query);
    const list = prices.filter(p => p.kind === k && (!qf || fold(p.name).includes(qf) || fold(p.cat).includes(qf)));
    const inQuote = p => sum(q.items.filter(i => i.kind === p.kind && norm(i.name) === norm(p.name) && (!inRoom || roomOf(q, i) === room)).map(i => i.qty));
    // com busca: lista única, primeiro a palavra inteira ("DR" acha Instalação de DR antes de "driver" e "quadro") (U10)
    if (qf) {
      const rx = new RegExp('(^|[^a-z0-9])' + qf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])');
      const nota = p => { const n = fold(p.name); return rx.test(n) ? 4 : n.startsWith(qf) ? 3 : n.split(/[^a-z0-9]+/).some(w => w.startsWith(qf)) ? 2 : n.includes(qf) ? 1 : 0.5; };
      const achados = list.map(p => [nota(p), p]).sort((x, y) => y[0] - x[0] || x[1].name.localeCompare(y[1].name, 'pt-BR')).map(x => x[1]);
      if (achados.length) return `<div class="pk-list">${achados.map(p => { const n = inQuote(p); return `<button class="pk-row${n ? ' on' : ''}" data-pid="${p.id}"><span class="pk-name">${hl(p.name, qf)}<small class="pk-cat">${esc(p.cat)}</small>${inStock(p) ? `<small class="pk-st${stockLow(p) ? ' low' : ''}">${stockTxt(p)}</small>` : ''}</span><span class="pk-price">${p.ref ? refV(BRL(p.price)) : BRL(p.price)}/${unitTxt(1, p.unit)}</span>${n ? `<span class="pk-n">${fmtQty(n)}</span>` : `<span class="pk-plus">${I.plus}</span>`}</button>`; }).join('')}</div>`
        + `<button class="add-btn" data-custom style="margin-top:8px">${I.plus}Adicionar “${esc(query)}”</button>`;
    }
    const rows = groupByCat(list).map(([cat, L]) => { const n0 = sum(L.map(inQuote)); return panel(`pk:${k}:${cat}`, '', esc(cat), qf ? null : resumoDe(L, p => p.name), `<div class="pk-list">${L.map(p => { const n = inQuote(p); return `<button class="pk-row${n ? ' on' : ''}" data-pid="${p.id}"><span class="pk-name">${hl(p.name, qf)}${inStock(p) ? `<small class="pk-st${stockLow(p) ? ' low' : ''}">${stockTxt(p)}</small>` : ''}</span><span class="pk-price">${p.ref ? refV(BRL(p.price)) : BRL(p.price)}/${unitTxt(1, p.unit)}</span>${n ? `<span class="pk-n">${fmtQty(n)}</span>` : `<span class="pk-plus">${I.plus}</span>`}</button>`; }).join('')}</div>`, { right: n0 ? `<span class="pk-n">${fmtQty(n0)}</span>` : conta(L.length), force: qf ? true : undefined }); }).join('');
    return (rows || KitFacil.ui.vazio({ titulo: `Nada com “${esc(query)}”`, texto: `na tabela de ${k === 'svc' ? 'mão de obra' : 'material'}. Adicione como item fora da tabela.` }))
      + `<button class="add-btn" data-custom style="margin-top:8px">${I.plus}${query ? `Adicionar “${esc(query)}”` : `${k === 'svc' ? 'Serviço' : 'Material'} fora da tabela`}</button>`;
  };
  openSheet({ title: inRoom ? `Adicionar em ${roomName(q, room)}` : 'Adicionar ao orçamento', tall: true,
    body: `<div class="pk-list" id="pk-list">${listHTML()}</div>`,
    onClose: () => { rerender(); if (Object.keys(svcAdd).length) setTimeout(() => sugerirMaterial(q, svcAdd, room), 120); },
    onMount: s => {
      const body = $('.kf-dlg-corpo', s);
      body.insertAdjacentHTML('beforebegin', `<div class="pk-tools">
        ${KitFacil.ui.abas({ itens: [['svc', 'Mão de obra'], ['mat', 'Material']], atual: k, rotulo: 'Tipo', dado: 'k' })}
        <label class="search">${I.search}<input type="search" id="pk-q" placeholder="Buscar na sua tabela de preços" aria-label="Buscar"></label>
        ${inRoom ? '<p class="hint">Cada toque soma uma unidade. Toque 3 vezes para 3 tomadas.</p>' : ''}</div>`);
      const paintList = () => { const st = body.scrollTop; $('#pk-list', s).innerHTML = listHTML(); body.scrollTop = st; };
      const qi = $('#pk-q', s);
      qi.addEventListener('input', () => { query = qi.value.trim(); paintList(); body.scrollTop = 0; });
      $$('[data-k]', s).forEach(b => b.onclick = () => { k = b.dataset.k; if (inRoom) lastRoomKind = k; $$('[data-k]', s).forEach(x => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; }); paintList(); body.scrollTop = 0; });
      body.addEventListener('click', e => {
        const row = e.target.closest('[data-pid]');
        if (row) { const p = prices.find(x => x.id === row.dataset.pid); if (!p) return; addFromPrice(q, p, room); if (p.kind === 'svc' && (p.comp || []).length) svcAdd[p.id] = (svcAdd[p.id] || 0) + 1; paintList(); return; }
        if (e.target.closest('[data-custom]')) customItemSheet(q, k, query, room);
      });
    } });
}
function itemFields(i, withKind, q) {
  const rooms = q && q.useRooms && q.rooms.length ? q.rooms : null;
  return `<div class="field"><label for="it-name">Descrição</label><input id="it-name" type="text" value="${esc(i.name)}" placeholder="Ex.: Instalação de chuveiro elétrico"></div>
    ${withKind ? `<div class="seg" role="group" aria-label="Tipo"><button data-ik="svc" aria-pressed="${i.kind === 'svc'}">Mão de obra</button><button data-ik="mat" aria-pressed="${i.kind === 'mat'}">Material</button></div>` : ''}
    <div class="grid2">
      <div class="field"><label for="it-qty">Quantidade</label><div class="stepper" style="width:100%"><button data-iq="-1" aria-label="Menos">${I.minus}</button><input id="it-qty" type="text" inputmode="decimal" value="${fmtQty(i.qty)}" style="flex:1;width:auto"><button data-iq="1" aria-label="Mais">${I.plus}</button></div></div>
      <div class="field"><label for="it-unit">Unidade</label><select id="it-unit">${UNITS.map(([u, l]) => `<option value="${esc(u)}" ${u === i.unit ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label for="it-price">Valor unitário</label><input id="it-price" type="text" inputmode="numeric" data-money placeholder="R$ 0,00" value="${i.price ? BRL(i.price) : ''}"></div>
    ${rooms ? `<div class="field"><label for="it-room">Ambiente</label><select id="it-room">${rooms.map(r => `<option value="${esc(r.id)}" ${(q && i.id ? roomOf(q, i) : (i.room || '')) === r.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></div>` : ''}
    <div class="vrow total" style="margin-top:0"><span>Total do item</span><b id="it-total">${BRL(lineTotal(i))}</b></div>`;
}
function bindItemFields(s, i) {
  const read = () => {
    const r = { name: $('#it-name', s).value.trim().replace(/\s+/g, ' '), qty: parseQty($('#it-qty', s).value), unit: $('#it-unit', s).value, price: parseMoney($('#it-price', s).value) };
    const rs = $('#it-room', s); if (rs) r.room = rs.value;
    return r;
  };
  const paint = () => { const r = read(); $('#it-total', s).textContent = BRL(Math.round((r.qty || 0) * (r.price || 0))); };
  $$('[data-iq]', s).forEach(b => b.onclick = () => { const v = parseQty($('#it-qty', s).value) || 1; $('#it-qty', s).value = fmtQty(Math.max(1, Math.round((v + +b.dataset.iq) * 100) / 100)); paint(); });
  ['#it-qty', '#it-price'].forEach(sel => $(sel, s).addEventListener('input', paint));
  $$('[data-ik]', s).forEach(b => b.onclick = () => { i.kind = b.dataset.ik; $$('[data-ik]', s).forEach(x => x.setAttribute('aria-pressed', x === b)); });
  return read;
}
function lineSheet(q, i) {
  if (!i) return;
  openSheet({ title: 'Alterar item', body: itemFields(i, false, q),
    foot: `<button class="btn danger-text" data-del>${I.trash}Remover</button><button class="btn primary" data-save>Salvar</button>`,
    onMount: s => {
      const read = bindItemFields(s, i);
      $('[data-del]', s).onclick = () => { closeSheet(true); removeLine(q, i.id); };
      $('[data-save]', s).onclick = () => {
        const r = read();
        if (!r.name) return toast('Escreva a descrição do item.');
        if (!r.qty) return toast('Quantidade inválida. Use, por exemplo, 2 ou 12,5.');
        if (r.price === null) return toast('Informe o valor unitário.');
        conferirQtd(r.qty, r.name, () => { Object.assign(i, r); touch(q); closeSheet(true); rerender(); toast('Item alterado.'); });
      };
    } });
}
function customItemSheet(q, kind, name, room = '') {
  const i = { name: name || '', kind, unit: 'un', qty: 1, price: 0, room };
  openSheet({ title: 'Item fora da tabela', body: itemFields(i, true, q) + `<label class="switch-row" for="it-save"><span><b>Guardar na tabela de preços</b><small>Fica disponível nos próximos orçamentos.</small></span><input type="checkbox" class="sw" id="it-save" checked></label>`,
    foot: `<button class="btn ghost" data-cancel>Cancelar</button><button class="btn primary" data-save>${I.plus}Adicionar</button>`,
    onClose: () => rerender(),
    onMount: s => {
      const read = bindItemFields(s, i);
      $('[data-cancel]', s).onclick = () => closeSheet();
      $('[data-save]', s).onclick = () => {
        const r = read();
        if (!r.name) return toast('Escreva a descrição do item.');
        if (!r.qty) return toast('Quantidade inválida.');
        if (r.price === null) return toast('Informe o valor unitário.');
        q.items.push({ id: uid(), kind: i.kind, room: q.useRooms ? room : '', ...r }); touch(q);
        if ($('#it-save', s).checked && !prices.some(p => p.kind === i.kind && norm(p.name) === norm(r.name))) { prices.push({ id: uid(), kind: i.kind, cat: 'Outros', name: r.name, unit: r.unit, price: r.price }); savePrices(); }
        closeSheet(); toast(`${r.name} adicionado.`);
      };
    } });
}

/* ================= ambientes ================= */
function roomAddSheet(q) {
  openSheet({ title: 'Novo ambiente', body: `
      <p class="hint">Escolha um cômodo. Em seguida você já adiciona os pontos e o material dele.</p>
      ${linhas(ROOM_CHIPS.filter(n => n !== 'Geral' || !q.rooms.some(r => norm(r.name) === 'geral')).map(n => linha(`data-rn="${esc(n)}"`, esc(uniqueRoomName(q, n)), { sub: n === 'Geral' ? 'Quadro, entrada de energia e itens da casa toda' : '' })))}
      <div class="field"><label for="rm-name">Outro nome</label><input id="rm-name" type="text" autocapitalize="sentences" autocomplete="off" placeholder="Ex.: Suíte, Churrasqueira, Lavanderia"></div>`,
    foot: `<button class="btn primary" data-create>${I.plus}Criar ambiente</button>`,
    onClose: () => rerender(),
    onMount: s => {
      const create = name => {
        name = String(name || '').trim().replace(/\s+/g, ' ');
        if (!name) return toast('Escolha ou escreva o nome do ambiente.');
        const r = { id: uid(), name: uniqueRoomName(q, name) };
        q.rooms.push(r); q.useRooms = true; touch(q); closeSheet(true); rerender();
        $(`[data-room-card="${r.id}"]`)?.scrollIntoView({ block: 'start' });
        window.scrollBy(0, -70);
        pickerSheet(q, 'svc', r.id);
      };
      $$('[data-rn]', s).forEach(b => b.onclick = () => create(b.dataset.rn));
      $('[data-create]', s).onclick = () => create($('#rm-name', s).value);
    } });
}
function roomMenu(q, id) {
  const r = q.rooms.find(x => x.id === id); if (!r) return;
  const n = q.items.filter(i => i.room === r.id).length;
  openSheet({ title: r.name, body: `
      <div class="field"><label for="rm-ren">Nome do ambiente</label><input id="rm-ren" type="text" value="${esc(r.name)}"></div>
      <div class="opts">
        <button class="opt" data-o="dup">${I.dup}<span>Duplicar ambiente<small>Cria outro igual, com os mesmos itens. Bom para quartos iguais.</small></span></button>
        ${q.rooms.indexOf(r) > 0 ? `<button class="opt" data-o="up">${I.up}<span>Mover para cima</span></button>` : ''}
        <button class="opt danger" data-o="del">${I.trash}<span>Excluir ambiente<small>${n ? plural(n, 'item sai', 'itens saem') + ' do orçamento' : 'Está vazio'}</small></span></button>
      </div>`,
    foot: `<button class="btn primary" data-save>Salvar nome</button>`,
    onMount: s => {
      $('[data-save]', s).onclick = () => { const nn = $('#rm-ren', s).value.trim().replace(/\s+/g, ' '); if (!nn) return toast('Escreva o nome do ambiente.'); r.name = nn; touch(q); closeSheet(true); rerender(); };
      $$('[data-o]', s).forEach(b => b.onclick = () => {
        const o = b.dataset.o;
        if (o === 'dup') {
          const nr = { id: uid(), name: nextRoomName(q, r.name) };
          q.rooms.splice(q.rooms.indexOf(r) + 1, 0, nr);
          q.items.push(...q.items.filter(i => i.room === r.id).map(i => ({ ...i, id: uid(), room: nr.id })));
          touch(q); closeSheet(true); rerender(); toast(`${nr.name} criado com os mesmos itens.`);
        }
        if (o === 'up') { const k = q.rooms.indexOf(r); q.rooms.splice(k, 1); q.rooms.splice(k - 1, 0, r); touch(q); closeSheet(true); rerender(); }
        if (o === 'del') {
          const idx = q.rooms.indexOf(r), gone = q.items.filter(i => i.room === r.id);
          q.rooms.splice(idx, 1); q.items = q.items.filter(i => i.room !== r.id); touch(q); closeSheet(true); rerender();
          toast(`${r.name} excluído.`, { label: 'Desfazer', run: () => { q.rooms.splice(idx, 0, r); q.items.push(...gone); touch(q); rerender(); } });
        }
      });
    } });
}

/* ================= deslocamento ================= */
function tripSheet(q) {
  const s0 = settings;
  const t = Object.assign({ km: 0, roundTrip: s0.roundTrip !== false, visits: 1, minutes: 0, toll: 0 },
    { kmPerL: s0.kmPerL, fuelPrice: s0.fuelPrice, wearPerKm: s0.wearPerKm, hourRate: s0.hourRate, minVisit: s0.minVisit }, q.trip || {});
  let mode = q.travel && !q.trip ? 'fixed' : 'calc';
  const money = (id, v, ph = 'R$ 0,00') => `<input id="${id}" type="text" inputmode="numeric" data-money placeholder="${ph}" value="${v ? BRL(v) : ''}">`;
  openSheet({ title: 'Deslocamento', body: `
      <div class="seg" role="group" aria-label="Como cobrar"><button data-mode="calc" aria-pressed="${mode === 'calc'}">Calcular pela distância</button><button data-mode="fixed" aria-pressed="${mode === 'fixed'}">Valor fixo</button></div>
      <div id="tp-calc" class="stack14"${mode === 'fixed' ? ' hidden' : ''}>
        <div class="field"><label for="tp-km">Distância até a obra, em km, só ida</label><input id="tp-km" type="text" inputmode="decimal" placeholder="Ex.: 18" value="${t.km ? fmtQty(t.km) : ''}">
          ${q.client.address ? `<a class="linkish" href="${mapsLink(q.client.address)}" target="_blank" rel="noopener">${I.pin}Ver a rota e a distância no mapa</a>` : '<p class="hint">Com o endereço da obra preenchido, dá para abrir a rota no mapa.</p>'}</div>
        <label class="switch-row" for="tp-rt"><span><b>Ida e volta</b><small>Conta o caminho de volta também.</small></span><input type="checkbox" class="sw" id="tp-rt" ${t.roundTrip ? 'checked' : ''}></label>
        <div class="field"><span class="lab">Visitas à obra</span>
          <div class="stepper"><button data-tv="-1" aria-label="Menos visitas">${I.minus}</button><input id="tp-vis" type="text" readonly value="${t.visits}" aria-label="Visitas"><button data-tv="1" aria-label="Mais visitas">${I.plus}</button></div>
          <p class="hint">Uma ida por dia de serviço. Some a visita para orçar, se for cobrar por ela.</p></div>
        <div class="subcard"><div class="card-hr"><b>${I.car}Seu veículo</b><span class="hint">fica salvo</span></div>
          <div class="grid2">
            <div class="field"><label for="tp-kml">Consumo, em km por litro</label><input id="tp-kml" type="text" inputmode="decimal" placeholder="Ex.: 10" value="${t.kmPerL ? fmtQty(t.kmPerL) : ''}"></div>
            <div class="field"><label for="tp-fuel">Preço do litro do combustível</label>${money('tp-fuel', t.fuelPrice, 'Ex.: R$ 6,19')}</div>
          </div></div>
        <details class="more"${t.toll || t.minutes || t.wearPerKm ? ' open' : ''}><summary>Outros custos <span class="lab-opt">opcional</span></summary><div class="more-in">
          <div class="field"><label for="tp-toll">Pedágio e estacionamento por visita</label>${money('tp-toll', t.toll)}</div>
          <div class="grid2">
            <div class="field"><label for="tp-min">Tempo de viagem, em minutos, só ida</label><input id="tp-min" type="text" inputmode="numeric" placeholder="Ex.: 30" value="${t.minutes || ''}"></div>
            <div class="field"><label for="tp-hour">Valor da sua hora</label>${money('tp-hour', t.hourRate)}</div>
          </div>
          <div class="field"><label for="tp-wear">Desgaste do veículo por km</label>${money('tp-wear', t.wearPerKm)}<p class="hint">Pneus, óleo, manutenção e depreciação. Sem isso, o cálculo cobre só o combustível.</p></div>
        </div></details>
        <div class="breakdown" id="tp-out" aria-live="polite"></div>
      </div>
      <div id="tp-fixed"${mode === 'calc' ? ' hidden' : ''}><div class="field"><label for="tp-val">Valor do deslocamento</label>${money('tp-val', q.trip ? 0 : q.travel)}</div></div>`,
    foot: `<button class="btn ghost" data-clear>Não cobrar</button><button class="btn primary" data-use>Usar <span id="tp-total"></span></button>`,
    onMount: s => {
      const out = () => {
        const r = tripCalc(t), visits = Math.max(1, t.visits || 1), rows = [];
        if (!t.km) rows.push('<div><span class="warn">Informe a distância até a obra.</span></div>');
        else {
          rows.push(`<div><span>Percurso<small>${fmtQty(t.km)} km × ${plural(r.legs, 'trajeto', 'trajetos')}</small></span><b>${fmtQty(r.km)} km</b></div>`);
          rows.push(t.kmPerL && t.fuelPrice ? `<div><span>Combustível<small>${fmtQty(r.km)} km ÷ ${fmtQty(t.kmPerL)} km/l × ${BRL(t.fuelPrice)}</small></span><b>${BRL(r.fuel)}</b></div>` : '<div><span class="warn">Informe o consumo e o preço do combustível.</span></div>');
          if (r.toll) rows.push(`<div><span>Pedágio e estacionamento<small>${plural(visits, 'visita', 'visitas')} × ${BRL(t.toll)}</small></span><b>${BRL(r.toll)}</b></div>`);
          if (r.time) rows.push(`<div><span>Tempo de viagem<small>${fmtQty(Math.round(t.minutes * r.legs / 60 * 100) / 100)} h × ${BRL(t.hourRate)}</small></span><b>${BRL(r.time)}</b></div>`);
          else if (t.minutes && !t.hourRate) rows.push('<div><span class="warn">Informe o valor da sua hora para cobrar o tempo de viagem.</span></div>');
          if (r.wear) rows.push(`<div><span>Desgaste do veículo<small>${fmtQty(r.km)} km × ${BRL(t.wearPerKm)}</small></span><b>${BRL(r.wear)}</b></div>`);
          if (r.usedMin) rows.push(`<div><span>Mínimo aplicado<small>${BRL(t.minVisit)} por visita, definido em Ajustes</small></span><b>${BRL(r.min)}</b></div>`);
        }
        rows.push(`<div class="bt"><span><b>Total</b></span><b>${BRL(r.total)}</b></div>`);
        $('#tp-out', s).innerHTML = rows.join('');
        $('#tp-total', s).textContent = BRL(mode === 'calc' ? r.total : (parseMoney($('#tp-val', s).value) || 0));
      };
      const keep = (k, v) => { settings[k] = v; saveSettings(); };
      $$('[data-mode]', s).forEach(b => b.onclick = () => { mode = b.dataset.mode; $$('[data-mode]', s).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#tp-calc', s).hidden = mode !== 'calc'; $('#tp-fixed', s).hidden = mode !== 'fixed'; out(); });
      $('#tp-km', s).addEventListener('input', e => { t.km = parseQty(e.target.value) || 0; out(); });
      $('#tp-rt', s).addEventListener('change', e => { t.roundTrip = e.target.checked; keep('roundTrip', t.roundTrip); out(); });
      $$('[data-tv]', s).forEach(b => b.onclick = () => { t.visits = Math.max(1, Math.min(60, (t.visits || 1) + +b.dataset.tv)); $('#tp-vis', s).value = t.visits; out(); });
      $('#tp-kml', s).addEventListener('input', e => { t.kmPerL = parseQty(e.target.value) || 0; keep('kmPerL', t.kmPerL); out(); });
      $('#tp-fuel', s).addEventListener('input', e => { t.fuelPrice = parseMoney(e.target.value) || 0; keep('fuelPrice', t.fuelPrice); out(); });
      $('#tp-toll', s).addEventListener('input', e => { t.toll = parseMoney(e.target.value) || 0; out(); });
      $('#tp-min', s).addEventListener('input', e => { t.minutes = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0; out(); });
      $('#tp-hour', s).addEventListener('input', e => { t.hourRate = parseMoney(e.target.value) || 0; keep('hourRate', t.hourRate); out(); });
      $('#tp-wear', s).addEventListener('input', e => { t.wearPerKm = parseMoney(e.target.value) || 0; keep('wearPerKm', t.wearPerKm); out(); });
      $('#tp-val', s).addEventListener('input', out);
      $('[data-clear]', s).onclick = () => { q.trip = null; q.travel = 0; touch(q); closeSheet(true); rerender(); toast('Sem deslocamento neste orçamento.'); };
      $('[data-use]', s).onclick = () => {
        if (mode === 'calc') {
          if (!t.km) return toast('Informe a distância até a obra.');
          if (!t.kmPerL || !t.fuelPrice) return toast('Informe o consumo do veículo e o preço do combustível.');
          q.trip = { km: t.km, roundTrip: !!t.roundTrip, visits: Math.max(1, t.visits || 1), minutes: t.minutes || 0, toll: t.toll || 0, kmPerL: t.kmPerL, fuelPrice: t.fuelPrice, wearPerKm: t.wearPerKm || 0, hourRate: t.hourRate || 0, minVisit: t.minVisit || 0 };
          q.travel = tripCalc(q.trip).total;
        } else { q.trip = null; q.travel = parseMoney($('#tp-val', s).value) || 0; }
        touch(q); closeSheet(true); rerender(); toast(`Deslocamento: ${BRL(q.travel)}.`);
      };
      out();
    } });
}

/* ================= tela: proposta ================= */
function paperHTML(q, c, mode = docMode(q)) {
  const s = settings, px = pixOf(q, c, mode), rep = mode === 'report';
  const biz = s.company || s.name;
  const sub = [s.company && s.name ? s.name : '', s.phone ? fmtPhone(s.phone) : '', s.email, s.doc, s.registro, s.city].filter(Boolean);
  const row = (i, dim) => `<tr${dim ? ' class="dim"' : ''}><td>${esc(i.name)}<small>${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)} × ${BRL(priceShow(c, i))}</small></td><td>${BRL(lineShow(c, i))}</td></tr>`;
  let body;
  if (q.useRooms) {
    body = roomList(q).filter(g => g.items.length).map(g => {
      const svc = g.items.filter(i => i.kind === 'svc'), mat = g.items.filter(i => i.kind === 'mat');
      const st = sum(svc.map(lineTotal)) + (c.matIn ? sum(mat.map(lineTotal)) : 0);
      return `<tr class="p-sec"><td colspan="2">${esc(g.name)}</td></tr>${svc.length ? `<tr class="p-kind"><td colspan="2">Mão de obra</td></tr>${svc.map(i => row(i)).join('')}` : ''}${mat.length ? `<tr class="p-kind"><td colspan="2">Material${c.matIn ? '' : ' por conta do cliente'}</td></tr>${mat.map(i => row(i, !c.matIn)).join('')}` : ''}<tr class="p-sub"><td>Subtotal ${esc(g.name)}</td><td>${BRL(st)}</td></tr>`;
    }).join('');
    if (!body) body = '<tr class="dim"><td colspan="2">Nenhum item lançado</td></tr>';
    else if (c.mat.length && !c.matIn) body += `<tr class="p-note"><td colspan="2">${rep ? 'Material fornecido pelo cliente: valores de referência, fora do total.' : 'Material por conta do cliente: valores estimados, fora do total.'}</td></tr>`;
  } else {
    body = `<tr class="p-sec"><td colspan="2">Mão de obra</td></tr>
      ${c.svc.length ? c.svc.map(i => row(i)).join('') : '<tr class="dim"><td colspan="2">Nenhum serviço lançado</td></tr>'}
      ${c.mat.length ? `<tr class="p-sec"><td colspan="2">Material</td></tr>${c.matIn ? '' : `<tr class="p-note"><td colspan="2">${rep ? 'Fornecido pelo cliente: valores de referência, fora do total.' : 'Por conta do cliente: valores estimados, fora do total.'}</td></tr>`}${c.mat.map(i => row(i, !c.matIn)).join('')}` : ''}`;
  }
  return `<article class="paper" aria-label="Prévia do documento">
    <header class="p-head${rep ? ' long' : ''}">
      <div class="p-brand"><div class="p-mark">${s.logo ? `<img src="${s.logo}" alt="">` : APP_MARK}</div><div class="p-who"><b>${esc(biz || 'Seu nome ou empresa')}</b>${sub.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
      <div class="p-num"><span>${DOC[mode].title}</span><b>${esc(numLabel(q))}</b><small>${rep ? execHead(q) : fmtDate(q.createdAt)}</small></div>
    </header>
    <div class="p-rule"></div>
    <div class="p-parties">
      <div><span class="p-lab">Cliente</span><b>${esc(q.client.name || '—')}</b>${q.client.doc ? `<span>${esc(fmtDoc(q.client.doc))}</span>` : ''}${q.client.phone ? `<span>${esc(fmtPhone(q.client.phone))}</span>` : ''}${q.client.address ? `<span>${esc(q.client.address)}</span>` : ''}</div>
      <div><span class="p-lab">${rep ? 'Serviço executado' : 'Serviço'}</span><b>${esc(q.title || 'Serviços elétricos')}</b></div>
    </div>
    ${rep && q.diag.trim() ? `<div><span class="p-lab">Diagnóstico</span><div class="p-notes">${esc(q.diag.trim())}</div></div>` : ''}
    ${rep && q.work.trim() ? `<div><span class="p-lab">Serviços realizados</span><div class="p-notes">${esc(q.work.trim())}</div></div>` : ''}
    ${rep && q.tests.length ? `<div><span class="p-lab">Testes e verificações</span><ul class="p-checks">${q.tests.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    ${rep && q.recs.trim() ? `<div><span class="p-lab">Recomendações</span><div class="p-notes">${esc(q.recs.trim())}</div></div>` : ''}
    <table class="p-table">
      <thead><tr><th>Descrição</th><th>Total</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
    <div class="p-tot">
      <div><span>Mão de obra</span><b>${BRL(c.labor)}</b></div>
      ${c.extra ? `<div><span>Adicionais (+${c.surPct}%)</span><b>${BRL(c.extra)}</b></div>` : ''}
      ${c.mat.length ? `<div><span>Material${c.matIn ? '' : ' por conta do cliente'}</span><b>${c.matIn ? BRL(c.matTotal) : '—'}</b></div>` : ''}
      ${c.travel ? `<div><span>Deslocamento</span><b>${BRL(c.travel)}</b></div>` : ''}
      ${c.discount ? `<div><span>Desconto${q.discount.mode === 'pct' ? ` de ${fmtQty(q.discount.pct)}%` : ''}</span><b>−${BRL(c.discount)}</b></div>` : ''}
      ${c.taxFora ? `<div><span>${esc(taxLabel(c))}</span><b>${BRL(c.taxFora)}</b></div>` : ''}
      <div class="p-grand"><span>TOTAL</span><span>${BRL(c.total)}</span></div>
    </div>
    <dl class="p-cond">
      ${rep ? `<dt>Execução</dt><dd>${esc(capFirst(execText(q)))}</dd>` : ''}
      ${rep && approvalText(q) ? `<dt>Aprovação</dt><dd>${esc(approvalText(q))}</dd>` : ''}
      <dt>Pagamento</dt><dd>${esc(payText(q, c))}</dd>
      ${outrasTxt(q) ? `<dt>Ou, se preferir</dt><dd>${esc(capFirst(outrasTxt(q)))}</dd>` : ''}
      ${!rep && schedText(q) ? `<dt>Execução</dt><dd>${esc(schedText(q))}</dd>` : ''}
      ${!rep && prazoDoc(q) ? `<dt>Prazo</dt><dd>${esc(prazoDoc(q))}</dd>` : ''}
      ${q.warranty ? `<dt>Garantia</dt><dd>${esc(warrantyText(q, mode))}</dd>` : ''}
      ${!rep && q.validity ? `<dt>Validade</dt><dd>Proposta válida até ${fmtDate(c.validUntil)}</dd>` : ''}
      ${c.extra ? `<dt>Adicionais</dt><dd>${esc(extrasText(q))}, sobre a mão de obra</dd>` : ''}
      ${q.trip && c.travel ? `<dt>Deslocamento</dt><dd>${esc(tripLong(q.trip))}</dd>` : ''}
    </dl>
    ${px ? `<div class="p-pix"><canvas data-qr width="200" height="200" aria-label="QR code do Pix"></canvas><div><b>Pague ${px.what} com Pix: ${BRL(px.value)}</b><span>Chave: ${esc(px.key)}</span><span>Abra o app do banco e leia o QR code.</span></div></div>` : ''}
    ${q.warranty && s.warrantyTerms.trim() ? `<div class="p-final"><span class="p-lab">Condições da garantia</span><div class="p-notes">${esc(s.warrantyTerms.trim())}</div></div>` : ''}
    ${q.notes.trim() ? `<div class="p-final"><span class="p-lab">Observações</span><div class="p-notes">${esc(q.notes.trim())}</div></div>` : ''}
    ${!rep && (approvalText(q) || s.acceptText.trim()) ? `<p class="p-accept">${esc(approvalText(q) || s.acceptText.trim())}</p>` : ''}
    <div class="p-sign"><div><b>${esc(q.client.name || 'Cliente')}</b><span>${rep ? 'Serviço recebido pelo cliente' : 'Cliente'}</span></div><div><b>${esc(s.name || s.company || 'Responsável')}</b><span>Responsável pelo serviço</span></div></div>
  </article>`;
}
function markSent(q) {
  if (q.status !== 'rascunho' || q.example) return;
  setStatus(q, 'enviado'); rerender(); toast('Marcado como enviado.');
}
VIEWS.preview = {
  html(r) {
    const q = getQ(r.id), c = compute(q), mode = docMode(q);
    const warn = [];
    if (!settings.name && !settings.company) warn.push('Seu nome e telefone ainda não aparecem no cabeçalho.');
    if (!q.client.name) warn.push('Falta o nome do cliente.');
    if (!q.items.length) warn.push('Nenhum item lançado.');
    if (!daysOk(q)) warn.push(prazoProblema(q) === 'retro' ? 'Há datas que já passaram: escolha um novo início.' : 'Os dias marcados não conferem com o prazo.');
    return `<header class="kf-barra appbar"><div class="kf-barra-in">
      <button class="icon-btn" data-back aria-label="Voltar">${I.back}</button>
      <div class="ab-title"><span class="ab-eyebrow">${mode === 'report' ? 'Relatório' : 'Proposta'} · ${esc(numLabel(q))}</span><span class="ab-main">${esc(q.client.name || 'Cliente sem nome')}</span></div>
      ${KitFacil.topo.html({ principal: false })}
    </div></header>
    <main class="page bar">
      ${warn.length ? `<div class="banner b-tip"><p><b>Antes de enviar:</b> ${esc(warn.join(' '))}</p>${!settings.name && !settings.company ? '<div class="banner-act"><button class="btn sm ghost" data-me>Preencher meus dados</button></div>' : ''}</div>` : ''}
      ${isReport(q) ? KitFacil.ui.abas({ itens: [['report', 'Relatório de serviços'], ['quote', 'Orçamento original']], atual: mode, rotulo: 'Documento', dado: 'doc' }) : ''}
      ${paperHTML(q, c, mode)}
      <p class="foot-note">O PDF sai em folha A4, com este mesmo conteúdo.</p>
      <button class="btn ghost block concluir" data-concluir>${I.check}Concluir e voltar à lista</button>
      <p class="foot-note">Tudo o que você preencheu já está salvo neste aparelho.</p>
    </main>
    <div class="bbar"><div class="bbar-in acts">
      <button class="btn primary" data-pdf>${I.share}Enviar PDF</button>
      <a class="btn wa" data-wa href="${waLink(q.client.phone, quoteMessage(q, c, mode))}" target="_blank" rel="noopener">${I.wa}WhatsApp</a>
      <button class="icon-btn boxed" data-more aria-label="Mais opções de envio">${I.more}</button>
    </div></div>`;
  },
  bind(v, r) {
    const q = getQ(r.id);
    loadJsPDF().catch(() => {});
    fitMark(v);
    $('[data-back]', v).onclick = () => back('/q/' + q.id);
    $('[data-concluir]', v).onclick = () => {
      saveQuotes();
      const msg = isEmptyQuote(q) ? 'Nada preenchido: o documento vazio foi descartado.' : `${isReport(q) ? 'Relatório' : 'Orçamento'} salvo${syncOn() ? '' : ' neste aparelho'}.`;
      const d = (history.state && history.state.d) || 0;
      if (d >= 2) history.go(-2); else go('/', true);
      setTimeout(() => toast(msg), 60);
    };
    $('[data-me]', v)?.addEventListener('click', () => KitFacil.ajustes.ir('conta'));
    const cv = $('canvas[data-qr]', v);
    $$('[data-doc]', v).forEach(b => b.onclick = () => { previewDoc[q.id] = b.dataset.doc; rerender(); });
    if (cv) { const px = pixOf(q, compute(q)); qrMatrix(pixPayload(px)).then(m => drawQR(cv.getContext('2d'), m, 0, 0, 200)).catch(() => cv.replaceWith(Object.assign(document.createElement('span'), { textContent: '' }))); }
    $('[data-pdf]', v).onclick = e => sharePDF(q, e.currentTarget);
    $('[data-wa]', v).addEventListener('click', () => setTimeout(() => markSent(q), 400));
    $('[data-more]', v).onclick = () => shareMore(q);
  },
};
async function sharePDF(q, btn) {
  const html = btn.innerHTML; btn.disabled = true; btn.textContent = 'Gerando…';
  try {
    const mode = docMode(q), blob = await buildQuotePDF(q, mode);
    if (await saveFile(fileName(DOC[mode].file, q), blob)) markSent(q);
  } catch (e) { console.warn(e); toast('Não foi possível gerar o PDF. Na primeira vez, o app precisa de internet.'); }
  btn.disabled = false; btn.innerHTML = html;
}
function shareMore(q) {
  const c = compute(q), px = pixOf(q, c);
  openSheet({ title: 'Mais opções', body: `<div class="opts">
      <button class="opt" data-o="edit">${ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}<span>Editar ${isReport(q) ? 'o relatório' : 'o orçamento'}<small>Volta para os itens, valores e dados do cliente</small></span></button>
      <button class="opt" data-o="copy">${I.copy}<span>Copiar texto${isReport(q) ? '' : ' da proposta'}<small>Para colar em outro aplicativo</small></span></button>
      ${q.useRooms && q.items.length ? `<button class="opt" data-o="conf">${I.list}<span>PDF da conferência por ambiente<small>Quantidades de cada cômodo, sem preços, para conferir na obra</small></span></button>` : ''}
      ${c.mat.length ? `<a class="opt" data-o="mat" href="${waLink(q.client.phone, materialMessage(q, c))}" target="_blank" rel="noopener">${I.wa}<span>Lista de material pelo WhatsApp<small>Total de cada item, para o cliente comprar</small></span></a>` : ''}
      ${px ? `<button class="opt" data-o="pix">${I.pix}<span>QR code do Pix<small>${BRL(px.value)} · ${px.what}</small></span></button>` : ''}
      <button class="opt" data-o="status">${I.flag}<span>Alterar situação<small>Agora: ${STATUS[q.status]}</small></span></button>
    </div>`,
    onMount: s => $$('[data-o]', s).forEach(b => b.addEventListener('click', () => {
      const o = b.dataset.o;
      if (o === 'edit') { closeSheet(true); back('/q/' + q.id); }
      if (o === 'copy') { closeSheet(true); copyText(quoteMessage(q, c), 'Texto copiado.'); markSent(q); }
      if (o === 'conf') { closeSheet(true); shareConference(q); }
      if (o === 'mat') closeSheet(true);
      if (o === 'pix') pixSheet(px);
      if (o === 'status') statusSheet(q);
    })) });
}
async function shareConference(q, btn) {
  const html = btn && btn.innerHTML;
  if (btn) { btn.disabled = true; btn.textContent = 'Gerando…'; }
  try { await saveFile(fileName('Conferencia', q), await buildConferencePDF(q)); }
  catch (e) { console.warn(e); toast('Não foi possível gerar o PDF. Na primeira vez, o app precisa de internet.'); }
  if (btn) { btn.disabled = false; btn.innerHTML = html; }
}

/* ================= mensagens ================= */
function waLink(phone, text) {
  let ph = phoneDigits(phone);
  if (ph.length === 10 || ph.length === 11) ph = '55' + ph;
  return `https://wa.me/${ph.length >= 12 ? ph : ''}?text=${encodeURIComponent(text)}`;
}
const signature = () => [settings.name, settings.company && settings.company !== settings.name ? settings.company : '', settings.phone ? fmtPhone(settings.phone) : ''].filter(Boolean);
function quoteMessage(q, c, mode = docMode(q)) {
  const L = [], fn = firstName(q.client.name), rep = mode === 'report';
  const line = (i, tag) => `• ${i.name}${tag && i.kind === 'mat' ? ' (material)' : ''}: ${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)} × ${BRL(i.price)} = ${BRL(lineTotal(i))}`;
  L.push(rep ? `Olá${fn ? ', ' + fn : ''}! Segue o relatório dos serviços executados${q.dates.length > 1 ? ' ' + (seguidos(q.dates) ? '' : 'em ') + execText(q) : q.doneAt ? ' em ' + fmtDate(q.doneAt) : ''}, ${numLabel(q)}${q.title ? ' – ' + q.title : ''}.`
    : `Olá${fn ? ', ' + fn : ''}! Segue o orçamento ${numLabel(q)}${q.title ? ' – ' + q.title : ''}.`);
  if (rep && q.diag.trim()) L.push('', '*Diagnóstico:*', q.diag.trim());
  if (rep && q.work.trim()) L.push('', '*Serviços realizados:*', q.work.trim());
  if (rep && q.tests.length) L.push('', '*Testes e verificações:*', ...q.tests.map(t => `✓ ${t}`));
  if (q.useRooms) {
    roomList(q).filter(g => g.items.length).forEach(g => {
      L.push('', `*${g.name}*`);
      const svc = g.items.filter(i => i.kind === 'svc'), mat = g.items.filter(i => i.kind === 'mat');
      if (svc.length) { L.push('_Mão de obra_'); svc.forEach(i => L.push(line(i))); }
      if (mat.length) { L.push('_Material_'); mat.forEach(i => L.push(line(i))); }
    });
    if (c.mat.length && !c.matIn) L.push('', rep ? '_Material fornecido por você: valores de referência, fora do total._' : '_Material por sua conta: valores estimados, fora do total._');
  } else {
    const block = (title, items, note) => { if (!items.length) return; L.push('', `*${title}*${note || ''}`); items.forEach(i => L.push(line(i))); };
    block('Mão de obra', c.svc);
    block('Material', c.mat, c.matIn ? '' : rep ? ' _(fornecido por você, valores de referência)_' : ' _(por sua conta, valores estimados)_');
  }
  L.push('', `Mão de obra: ${BRL(c.labor)}`);
  if (c.extra) L.push(`Adicionais – ${extrasText(q).replace(/^./, ch => ch.toLowerCase())}: ${BRL(c.extra)}`);
  if (c.mat.length && c.matIn) L.push(`Material: ${BRL(c.matTotal)}`);
  if (c.travel) L.push(`Deslocamento${q.trip ? `, ${tripShort(q.trip)}` : ''}: ${BRL(c.travel)}`);
  if (c.discount) L.push(`Desconto: −${BRL(c.discount)}`);
  if (c.taxFora) L.push(`${taxLabel(c)}: ${BRL(c.taxFora)}`);
  L.push(`*Total: ${BRL(c.total)}*`, '', `*Pagamento:* ${payText(q, c)}`);
  if (outrasTxt(q)) L.push(`*Ou, se preferir:* ${capFirst(outrasTxt(q))}`);
  if (!rep && schedText(q)) L.push(`*Execução:* ${schedText(q)}`);
  if (!rep && prazoDoc(q)) L.push(`*Prazo:* ${prazoDoc(q)}`);
  if (q.warranty) L.push(`*Garantia:* ${rep && q.doneAt ? `${plural(q.warranty, 'dia', 'dias')}, até ${fmtDate(q.doneAt + q.warranty * DAY)}` : plural(q.warranty, 'dia', 'dias')}`);
  if (!rep && q.validity) L.push(`Proposta válida até ${fmtDate(c.validUntil)}.`);
  if (rep && q.recs.trim()) L.push('', '*Recomendações:*', q.recs.trim());
  if (q.notes.trim()) L.push('', q.notes.trim());
  const px = pixOf(q, c, mode); if (px) L.push('', `Pix para ${px.what}, ${BRL(px.value)}: ${px.key}`);
  if (!rep && (q.status === 'rascunho' || q.status === 'enviado')) L.push('', 'Para aprovar, é só responder *De acordo* nesta conversa.');
  const sig = signature(); if (sig.length) L.push('', ...sig);
  return L.join('\n');
}
function followMessage(q, c) {
  const fn = firstName(q.client.name);
  return `Olá${fn ? ', ' + fn : ''}, tudo bem? Passando para saber se você conseguiu ver o orçamento ${numLabel(q)}${q.title ? `, “${q.title}”,` : ''} no valor de ${BRL(c.total)}. Se quiser ajustar alguma coisa, é só me falar.${settings.name ? `\n${firstName(settings.name)}` : ''}`;
}
function materialMessage(q, c) {
  const fn = firstName(q.client.name), L = consolidate(q, 'mat');
  return [`Olá${fn ? ', ' + fn : ''}! Esta é a lista de material para o serviço${q.title ? ` “${q.title}”` : ''}:`, '',
    ...L.map(e => `• ${fmtQty(e.qty)} ${unitTxt(e.qty, e.unit)} – ${e.name}`), '',
    `Valor estimado: ${BRL(c.matTotal)} (pode variar conforme a loja).`, ...(signature().length ? ['', ...signature()] : [])].join('\n');
}

/* ================= Pix copia e cola (BR Code do Banco Central) ================= */
const pixField = (id, v) => id + String(v.length).padStart(2, '0') + v;
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) { crc ^= str.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF; }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
const asciiUp = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ').toUpperCase().trim();
function cpfValid(d) {
  if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
  const dv = n => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === +d[9] && dv(10) === +d[10];
}
function normPixKey(k) {
  k = String(k || '').trim();
  if (k.includes('@')) return k.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return k.toLowerCase();
  const dig = k.replace(/\D/g, '');
  if (k.startsWith('+')) return '+' + dig;
  if (dig.length === 14) return dig;
  const phoneish = /[()]/.test(k) || /^\d{2}\s*9\d{4}-?\d{4}$/.test(k);
  if (dig.length === 11 && !phoneish && cpfValid(dig)) return dig;
  if (dig.length === 10 || dig.length === 11) return '+55' + dig;
  if (dig.length === 13 && dig.startsWith('55')) return '+' + dig;
  return k;
}
function pixPayload(px) {
  const mai = pixField('00', 'br.gov.bcb.pix') + pixField('01', normPixKey(px.key));
  const p = pixField('00', '01') + pixField('26', mai) + pixField('52', '0000') + pixField('53', '986')
    + (px.value > 0 ? pixField('54', (px.value / 100).toFixed(2)) : '') + pixField('58', 'BR')
    + pixField('59', (asciiUp(px.name) || 'RECEBEDOR').slice(0, 25)) + pixField('60', (asciiUp(px.city) || 'BRASIL').slice(0, 15))
    + pixField('62', pixField('05', '***')) + '6304';
  return p + crc16(p);
}
function pixOf(q, c, mode = docMode(q)) {
  if (!settings.pix) return null;
  let value = c.pixValue, what = q.payment.mode === 'entrada' ? 'a entrada' : c.avistaDesc ? 'o total à vista' : 'o total';
  if (mode === 'report' && q.payment.mode === 'entrada') { value = c.rest; what = 'o restante'; }
  if (!value) return null;
  return { key: settings.pix, name: settings.company || settings.name || 'Recebedor', city: settings.city, value, what };
}
let qrReady;
function loadQR() {
  if (window.qrcode) return Promise.resolve(window.qrcode);
  if (!qrReady) qrReady = new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    sc.onload = () => window.qrcode ? res(window.qrcode) : rej(new Error('qr'));
    sc.onerror = () => { qrReady = null; rej(new Error('qr')); };
    document.head.appendChild(sc);
  });
  return qrReady;
}
async function qrMatrix(text) { const q = await loadQR(); const qr = q(0, 'M'); qr.addData(text); qr.make(); const n = qr.getModuleCount(); return { n, dark: (r, c) => qr.isDark(r, c) }; }
function drawQR(ctx, m, x, y, size) {
  const cell = size / (m.n + 4);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, size, size); ctx.fillStyle = '#000000';
  for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) if (m.dark(r, c)) ctx.fillRect(Math.floor(x + (c + 2) * cell), Math.floor(y + (r + 2) * cell), Math.ceil(cell), Math.ceil(cell));
}
function pixSheet(px) {
  const code = pixPayload(px);
  openSheet({ title: `Pix d${px.what}`, body: `<p class="hint" style="font-size:16px"><b style="color:var(--ink)">${BRL(px.value)}</b> para ${esc(px.name)}</p>
      <div style="background:#FFFFFF;border-radius:16px;padding:14px;display:grid;place-items:center"><canvas id="px-qr" width="480" height="480" style="width:min(250px,70vw);height:auto;image-rendering:pixelated" aria-label="QR code do Pix"></canvas></div>
      <div class="field"><span class="lab">Pix copia e cola</span><textarea readonly rows="4" style="font-size:13px;word-break:break-all">${esc(code)}</textarea></div>`,
    foot: `<button class="btn primary" data-copy>${I.copy}Copiar código Pix</button>`,
    onMount: async s => {
      $('[data-copy]', s).onclick = () => copyText(code, 'Código Pix copiado.');
      try { const m = await qrMatrix(code); const cv = $('#px-qr', s); if (cv) drawQR(cv.getContext('2d'), m, 0, 0, 480); } catch { const cv = $('#px-qr', s); if (cv) cv.parentNode.innerHTML = '<p class="hint">Sem internet para desenhar o QR code. Use o código copia e cola.</p>'; }
    } });
}

/* ================= PDF (folha A4, texto de verdade, não imagem) ================= */
let jsPDFReady;
function loadJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (!jsPDFReady) jsPDFReady = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.crossOrigin = 'anonymous'; s.integrity = 'sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk'; // impressão digital (SRI)
    s.onload = () => window.jspdf && window.jspdf.jsPDF ? res(window.jspdf.jsPDF) : rej(new Error('jspdf'));
    s.onerror = () => { jsPDFReady = null; rej(new Error('jspdf')); };
    document.head.appendChild(s);
  });
  return jsPDFReady;
}
// as fontes padrão do PDF só têm o alfabeto latino básico
const pdfSafe = s => String(s ?? '').replace(/[‒-―−]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/[•●]/g, '-').replace(/[^\u0000-ÿ]/g, '');
const PC = { ink: [26, 24, 19], muted: [107, 103, 91], line: [226, 223, 214], soft: [246, 245, 241], volt: [255, 196, 0] };
const BOLT = [[13.5, 1.5], [3.8, 13.6], [10.7, 13.6], [9.6, 22.5], [20.2, 9.5], [13.1, 9.5]];
function pdfKit(JsPDF) {
  const doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
  const W = 210, H = 297, M = 16, CW = W - 2 * M;
  const font = (size, bold, italic) => { doc.setFont('helvetica', bold ? (italic ? 'bolditalic' : 'bold') : (italic ? 'italic' : 'normal')); doc.setFontSize(size); };
  const txt = (s, x, y, o = {}) => { font(o.size || 10, o.bold, o.italic); doc.setTextColor(...(o.color || PC.ink)); doc.text(pdfSafe(s), x, y, { align: o.align || 'left' }); };
  const wrap = (s, w, size, bold) => { font(size, bold); return doc.splitTextToSize(pdfSafe(s), w); };
  const lh = size => size * 0.3528 * 1.34;
  const label = (t, x, y) => txt(t.toUpperCase(), x, y, { size: 7.5, bold: true, color: PC.muted });
  return { doc, W, H, M, CW, font, txt, wrap, lh, label };
}
function pdfBolt(doc, x, y, size) {
  const s = size / 24, pts = BOLT.map(([a, b]) => [x + a * s, y + b * s]);
  doc.lines(pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]), pts[0][0], pts[0][1], [1, 1], 'F', true);
}
function pdfHeader(K, kind, num, extra) {
  const { doc, M, CW, txt, wrap } = K, s = settings;
  const top = M;
  // uma informação por linha, como na tela; a logo vai do topo do nome até a base da última linha
  const subs = [s.company && s.name ? s.name : '', s.phone ? fmtPhone(s.phone) : '', s.email, s.doc, s.registro, s.city].filter(Boolean);
  const NS = 13.5, SS = 8.8, NL = 5.6, SL = 4.1, cap = NS * 0.3528 * 0.718;
  const ratio = s.logo ? (s.logoRatio || 1) : 1;
  const names = wrap(s.company || s.name || 'Seu nome ou empresa', CW - Math.min(44, 18 * ratio) - 55, NS, true).slice(0, 2);
  const lastName = cap + (names.length - 1) * NL;
  const textH = subs.length ? lastName + 5.4 + (subs.length - 1) * SL : lastName;
  const h = Math.min(22, Math.max(textH, 12)), boxH = Math.max(h, textH);
  const textTop = top + (boxH - textH) / 2, logoTop = top + (boxH - h) / 2;
  let w = h;
  if (s.logo) {
    w = Math.min(44, h * ratio); const hh = w / ratio;
    try { doc.addImage(s.logo, 'PNG', M, logoTop + (h - hh) / 2, w, hh); } catch { w = 0; }
  } else {
    doc.setFillColor(...PC.volt); doc.roundedRect(M, logoTop, h, h, h * 0.22, h * 0.22, 'F');
    doc.setFillColor(...PC.ink); pdfBolt(doc, M + h * 0.15, logoTop + h * 0.15, h * 0.7);
  }
  const x = M + (w ? w + 5 : 0);
  let ly = textTop + cap;
  names.forEach(t => { txt(t, x, ly, { size: NS, bold: true }); ly += NL; });
  ly += 5.4 - NL;
  subs.forEach(t => { txt(t, x, ly, { size: SS, color: PC.muted }); ly += SL; });
  const rx = M + CW;
  const kl = wrap(kind, 46, 8, true), ko = (kl.length - 1) * 3.6;
  kl.forEach((t, k) => txt(t, rx, top + 4.2 + k * 3.6, { size: 8, bold: true, color: PC.muted, align: 'right' }));
  txt(num, rx, top + 11.4 + ko, { size: 16, bold: true, align: 'right' });
  let ry = top + 16.6 + ko;
  extra.forEach(t => { txt(t, rx, ry, { size: 8.8, color: PC.muted, align: 'right' }); ry += 4.1; });
  const yy = Math.max(top + boxH + 1, ry - 1.2) + 3.5;
  doc.setFillColor(...PC.volt); doc.rect(M, yy, CW, 1.4, 'F');
  return yy + 7.5;
}
function pdfFooter(K, left) {
  const { doc, H, M, CW, txt } = K, n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...PC.line); doc.setLineWidth(0.2); doc.line(M, H - 14, M + CW, H - 14);
    txt(left, M, H - 9.5, { size: 7.8, color: PC.muted });
    if (n > 1) txt(`Página ${i} de ${n}`, M + CW, H - 9.5, { size: 7.8, color: PC.muted, align: 'right' });
  }
}
function pdfQR(doc, m, x, y, size) {
  const cell = size / (m.n + 4);
  doc.setFillColor(255, 255, 255); doc.rect(x, y, size, size, 'F'); doc.setFillColor(0, 0, 0);
  for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) if (m.dark(r, c)) doc.rect(x + (c + 2) * cell, y + (r + 2) * cell, cell + 0.02, cell + 0.02, 'F');
}
async function buildQuotePDF(q, mode = docMode(q)) {
  const rep = mode === 'report';
  const JsPDF = await loadJsPDF();
  const c = compute(q), px = pixOf(q, c, mode);
  let qr = null; if (px) { try { qr = await qrMatrix(pixPayload(px)); } catch {} }
  const K = pdfKit(JsPDF), { doc, H, M, CW, txt, wrap, lh, label } = K;
  let y = pdfHeader(K, DOC[mode].title, numLabel(q), [rep ? execHead(q) : fmtDate(q.createdAt)]);
  const bottom = H - 19;
  const need = h => { if (y + h > bottom) { doc.addPage(); y = M + 2; return true; } return false; };

  // cliente e serviço
  const colW = (CW - 10) / 2, rx = M + colW + 10;
  let ly = y, ry = y;
  label('Cliente', M, ly); ly += 5.4;
  wrap(q.client.name || 'Cliente', colW, 11.5, true).forEach(t => { txt(t, M, ly, { size: 11.5, bold: true }); ly += lh(11.5); });
  [q.client.doc ? fmtDoc(q.client.doc) : '', q.client.phone ? fmtPhone(q.client.phone) : '', q.client.address].filter(Boolean).forEach(v => wrap(v, colW, 9.3).forEach(t => { txt(t, M, ly, { size: 9.3, color: PC.muted }); ly += lh(9.3); }));
  label(rep ? 'Serviço executado' : 'Serviço', rx, ry); ry += 5.4;
  wrap(q.title || 'Serviços elétricos', colW, 11.5, true).forEach(t => { txt(t, rx, ry, { size: 11.5, bold: true }); ry += lh(11.5); });
  y = Math.max(ly, ry) + 5;

  // diagnóstico, serviços realizados e testes
  const textBlock = (title, text) => {
    const L = wrap(text.trim(), CW, 9.5);
    need(9 + Math.min(L.length, 3) * lh(9.5));
    label(title, M, y); y += 5.4;
    L.forEach(t => { need(lh(9.5)); txt(t, M, y, { size: 9.5 }); y += lh(9.5); });
    y += 3.5;
  };
  if (rep && q.diag.trim()) textBlock('Diagnóstico', q.diag);
  if (rep && q.work.trim()) textBlock('Serviços realizados', q.work);
  if (rep && q.tests.length) {
    const first = wrap(q.tests[0], CW - 5, 9.5).length;
    need(9 + first * lh(9.5)); label('Testes e verificações', M, y); y += 5.4;
    q.tests.forEach(t => {
      const L = wrap(t, CW - 5, 9.5);
      need(L.length * lh(9.5));
      doc.setDrawColor(28, 122, 70); doc.setLineWidth(0.55); doc.lines([[0.9, 1.1], [2, -2.5]], M, y - 1.5, [1, 1], 'S');
      L.forEach(l => { txt(l, M + 5, y, { size: 9.5 }); y += lh(9.5); });
      y += 0.8;
    });
    y += 2.7;
  }
  if (rep && q.recs.trim()) textBlock('Recomendações', q.recs);

  // tabela de itens
  const qtyR = M + CW - 60, unitR = M + CW - 29, totR = M + CW - 2.5, descW = qtyR - M - 24;
  const thead = () => {
    doc.setFillColor(...PC.soft); doc.rect(M, y, CW, 7.5, 'F');
    [['Descrição', M + 2.5, 'left'], ['Qtd.', qtyR, 'right'], ['Valor unit.', unitR, 'right'], ['Total', totR, 'right']].forEach(([t, x, a]) => txt(t.toUpperCase(), x, y + 5, { size: 7.2, bold: true, color: PC.muted, align: a }));
    y += 7.5;
  };
  const section = (title, note) => {
    if (need(note ? 20 : 16)) thead();
    y += 2;
    doc.setFillColor(...PC.volt); doc.rect(M + 2.5, y + 1.3, 1.5, 4, 'F');
    txt(title.toUpperCase(), M + 6, y + 4.7, { size: 8.5, bold: true });
    y += 6.8;
    if (note) { txt(note, M + 6, y + 2.5, { size: 8.5, italic: true, color: PC.muted }); y += 5.5; }
  };
  let curRoom = '';
  const brk = () => { thead(); if (curRoom) { txt(`${curRoom.toUpperCase()} (CONTINUAÇÃO)`, M + 2.5, y + 4.6, { size: 7.4, bold: true, color: PC.muted }); y += 6.2; } };
  const kindLabel = t => {
    if (need(12)) brk();
    txt(t.toUpperCase(), M + 6, y + 4.2, { size: 7.4, bold: true, color: PC.muted }); y += 5.6;
  };
  const row = (i, dim) => {
    const L = wrap(i.name, descW, 9.5), h = L.length * lh(9.5) + 2.7;
    if (need(h)) brk();
    const col = dim ? PC.muted : PC.ink;
    L.forEach((t, k) => txt(t, M + 2.5, y + 4.4 + k * lh(9.5), { size: 9.5, color: col }));
    txt(`${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)}`, qtyR, y + 4.4, { size: 9.5, color: col, align: 'right' });
    txt(BRL(i.price), unitR, y + 4.4, { size: 9.5, color: col, align: 'right' });
    txt(BRL(lineTotal(i)), totR, y + 4.4, { size: 9.5, color: col, bold: !dim, align: 'right' });
    y += h;
    doc.setDrawColor(...PC.line); doc.setLineWidth(0.2); doc.line(M, y, M + CW, y);
  };
  thead();
  if (q.useRooms) {
    const G = roomList(q).filter(g => g.items.length);
    if (!G.length) { txt('Nenhum item lançado', M + 6, y + 4.5, { size: 9.5, color: PC.muted }); y += 7; }
    G.forEach(g => {
      const svc = g.items.filter(i => i.kind === 'svc'), mat = g.items.filter(i => i.kind === 'mat');
      curRoom = ''; section(g.name); curRoom = g.name;
      if (svc.length) { kindLabel('Mão de obra'); svc.forEach(i => row(i)); }
      if (mat.length) { kindLabel(c.matIn ? 'Material' : 'Material por conta do cliente'); mat.forEach(i => row(i, !c.matIn)); }
      const st = sum(svc.map(lineTotal)) + (c.matIn ? sum(mat.map(lineTotal)) : 0);
      if (need(6.5)) brk();
      txt(`Subtotal ${g.name}`, unitR, y + 4.4, { size: 8.6, color: PC.muted, align: 'right' });
      txt(BRL(st), totR, y + 4.4, { size: 9.2, bold: true, align: 'right' }); y += 6.5;
    });
    if (c.mat.length && !c.matIn) { need(7); txt(rep ? 'Material fornecido pelo cliente: valores de referência, fora do total.' : 'Material por conta do cliente: valores estimados, fora do total.', M + 2.5, y + 4, { size: 8.5, italic: true, color: PC.muted }); y += 6; }
  } else {
    section('Mão de obra');
    if (c.svc.length) c.svc.forEach(i => row(i)); else { txt('Nenhum serviço lançado', M + 6, y + 4.5, { size: 9.5, color: PC.muted }); y += 7; }
    if (c.mat.length) { section('Material', c.matIn ? '' : rep ? 'Fornecido pelo cliente: valores de referência, fora do total.' : 'Por conta do cliente: valores estimados, fora do total.'); c.mat.forEach(i => row(i, !c.matIn)); }
  }

  // totais
  y += 5;
  const rows = [['Mão de obra', BRL(c.labor)]];
  if (c.extra) rows.push([`Adicionais (+${c.surPct}%)`, BRL(c.extra)]);
  if (c.mat.length) rows.push([c.matIn ? 'Material' : 'Material por conta do cliente', c.matIn ? BRL(c.matTotal) : '-']);
  if (c.travel) rows.push(['Deslocamento', BRL(c.travel)]);
  if (c.discount) rows.push(['Desconto' + (q.discount.mode === 'pct' ? ` de ${fmtQty(q.discount.pct)}%` : ''), '- ' + BRL(c.discount)]);
  if (c.taxFora) rows.push([taxLabel(c), BRL(c.taxFora)]);
  const totH = rows.length * 6 + 13;
  need(Math.max(totH, px && qr ? 34 : 0) + 6);
  const bw = 82, bx = M + CW - bw, top = y;
  // Pix ao lado dos totais, no espaço que sobraria vazio
  if (px && qr) {
    const pw = CW - bw - 8, ph = Math.max(totH, 32);
    doc.setDrawColor(...PC.line); doc.setLineWidth(0.3); doc.roundedRect(M, top, pw, ph, 2, 2, 'S');
    pdfQR(doc, qr, M + 3, top + (ph - 26) / 2, 26);
    const tx = M + 32, tw = pw - 35;
    let ty = top + 7.5;
    txt(`Pix d${px.what}`, tx, ty, { size: 9.5, bold: true }); ty += 6.2;
    txt(BRL(px.value), tx, ty, { size: 13, bold: true }); ty += 5.6;
    wrap(px.key, tw, 8.3).slice(0, 2).forEach(t => { txt(t, tx, ty, { size: 8.3, color: PC.muted }); ty += 3.8; });
    ty += 0.8;
    wrap('Leia o QR code no app do banco.', tw, 7.8).forEach(t => { txt(t, tx, ty, { size: 7.8, color: PC.muted }); ty += 3.5; });
  }
  rows.forEach(([l, v]) => { txt(l, bx + 3, y + 4.4, { size: 9.5, color: PC.muted }); txt(v, bx + bw - 3, y + 4.4, { size: 9.5, align: 'right' }); y += 6; });
  y += 1.5;
  doc.setFillColor(...PC.volt); doc.roundedRect(bx, y, bw, 11.5, 1.6, 1.6, 'F');
  txt('TOTAL', bx + 3.5, y + 7.4, { size: 10, bold: true });
  txt(BRL(c.total), bx + bw - 3.5, y + 7.8, { size: 14, bold: true, align: 'right' });
  y = Math.max(y + 11.5, px && qr ? top + Math.max(totH, 32) : 0) + 7.5;

  // condições
  const conds = [rep && ['Execução', capFirst(execText(q))], rep && approvalText(q) && ['Aprovação', approvalText(q)], ['Pagamento', payText(q, c)], !rep && outrasTxt(q) && ['Ou, se preferir', capFirst(outrasTxt(q))], !rep && schedText(q) && ['Execução', schedText(q)], !rep && prazoDoc(q) && ['Prazo de execução', prazoDoc(q)], q.warranty && ['Garantia', warrantyText(q, mode)], !rep && q.validity && ['Validade', `Proposta válida até ${fmtDate(c.validUntil)}`], c.extra && ['Adicionais', `${extrasText(q)}, sobre a mão de obra`], q.trip && c.travel && ['Deslocamento', tripLong(q.trip)]].filter(Boolean);
  need(14); label(rep ? 'Informações' : 'Condições', M, y); y += 5.6;
  conds.forEach(([l, v]) => {
    const L = wrap(v, CW - 42, 9.5);
    need(L.length * lh(9.5) + 2);
    txt(l, M, y, { size: 9.5, bold: true });
    L.forEach((t, k) => txt(t, M + 42, y + k * lh(9.5), { size: 9.5 }));
    y += L.length * lh(9.5) + 1.4;
  });

  // condições da garantia e observações (mesma formatação); com o termo de aceite e as assinaturas, não se separam
  const terms = q.warranty ? settings.warrantyTerms.trim() : '';
  const FS = 9.2, finals = [['Condições da garantia', terms], ['Observações', q.notes.trim()]].filter(x => x[1]);
  const acceptL = rep ? [] : wrap(approvalText(q) || settings.acceptText.trim(), CW, 8.3).filter(Boolean);
  const tailH = sum(finals.map(([, t]) => 2.5 + 5.4 + wrap(t, CW, FS).length * lh(FS) + 1.5)) + (acceptL.length ? 4 + acceptL.length * lh(8.3) : 0) + 27;
  if (y + tailH > bottom && tailH < bottom - M - 2) { doc.addPage(); y = M + 2; }
  finals.forEach(([title, t]) => {
    const L = wrap(t, CW, FS);
    need(8 + Math.min(L.length, 3) * lh(FS));
    y += 2.5; label(title, M, y); y += 5.4;
    L.forEach(l => { need(lh(FS)); txt(l, M, y, { size: FS }); y += lh(FS); });
    y += 1.5;
  });

  // termo de aceite (ou o registro da aprovação) logo acima das assinaturas
  if (acceptL.length) {
    need(4 + acceptL.length * lh(8.3) + 27); y += 4;
    acceptL.forEach(t => { txt(t, M, y, { size: 8.3, color: PC.muted }); y += lh(8.3); });
  }

  // assinaturas
  need(27); y += acceptL.length ? 12 : 15;
  const sw = (CW - 14) / 2, sx = M + sw + 14;
  doc.setDrawColor(...PC.ink); doc.setLineWidth(0.3);
  doc.line(M, y, M + sw, y); doc.line(sx, y, M + CW, y);
  txt(q.client.name || 'Cliente', M, y + 5, { size: 9.2, bold: true });
  txt(rep ? 'Serviço recebido pelo cliente' : 'Cliente', M, y + 9.6, { size: 8, color: PC.muted });
  txt(settings.name || settings.company || 'Responsável', sx, y + 5, { size: 9.2, bold: true });
  txt('Responsável pelo serviço', sx, y + 9.6, { size: 8, color: PC.muted });

  pdfFooter(K, `${DOC[mode].name} ${numLabel(q)}${q.client.name ? ' · ' + q.client.name : ''}`);
  return doc.output('blob');
}

// conferência de quantitativos: o que vai em cada cômodo, sem preços, com caixinha para marcar na obra
async function buildConferencePDF(q) {
  const JsPDF = await loadJsPDF();
  const K = pdfKit(JsPDF), { doc, H, M, CW, txt, wrap, lh, label } = K;
  let y = pdfHeader(K, 'CONFERÊNCIA', numLabel(q), [fmtDate(Date.now())]);
  const bottom = H - 19;
  const need = h => { if (y + h > bottom) { doc.addPage(); y = M + 2; return true; } return false; };
  label('Obra', M, y); y += 5.4;
  txt(q.client.name || 'Cliente', M, y, { size: 11.5, bold: true }); y += lh(11.5);
  const sub = [q.title, q.client.address].filter(Boolean).join(' · ');
  if (sub) wrap(sub, CW, 9.3).forEach(t => { txt(t, M, y, { size: 9.3, color: PC.muted }); y += lh(9.3); });
  y += 5;
  const qtyR = M + CW - 12, kindX = M + CW - 62, okX = M + CW - 6.1;
  const box = yy => { doc.setDrawColor(...PC.muted); doc.setLineWidth(0.3); doc.rect(okX, yy, 3.6, 3.6, 'S'); };
  const head = cols => { doc.setFillColor(...PC.soft); doc.rect(M, y, CW, 7, 'F'); cols.forEach(([t, x, a]) => txt(t.toUpperCase(), x, y + 4.7, { size: 7.2, bold: true, color: PC.muted, align: a })); y += 7; };
  const cols1 = [['Item', M + 2.5, 'left'], ['Tipo', kindX, 'left'], ['Qtd.', qtyR, 'right'], ['OK', M + CW - 2.5, 'right']];
  const sep = () => { doc.setDrawColor(...PC.line); doc.setLineWidth(0.2); doc.line(M, y, M + CW, y); };
  head(cols1);
  roomList(q).filter(g => g.items.length).forEach(g => {
    if (need(16)) head(cols1);
    y += 2; doc.setFillColor(...PC.volt); doc.rect(M + 2.5, y + 1.3, 1.5, 4, 'F');
    txt(g.name.toUpperCase(), M + 6, y + 4.7, { size: 8.5, bold: true }); y += 6.8;
    [...g.items.filter(i => i.kind === 'mat'), ...g.items.filter(i => i.kind === 'svc')].forEach(i => {
      const L = wrap(i.name, kindX - M - 8, 9.5), h = L.length * lh(9.5) + 2.7;
      if (need(h)) head(cols1);
      L.forEach((t, k) => txt(t, M + 2.5, y + 4.4 + k * lh(9.5), { size: 9.5 }));
      txt(i.kind === 'mat' ? 'Material' : 'Mão de obra', kindX, y + 4.4, { size: 8.5, color: PC.muted });
      txt(`${fmtQty(i.qty)} ${unitTxt(i.qty, i.unit)}`, qtyR, y + 4.4, { size: 9.5, bold: true, align: 'right' });
      box(y + 1.4); y += h; sep();
    });
  });
  const tot = consolidate(q, 'mat');
  if (tot.length) {
    y += 9; if (need(26)) y += 0;
    label('Total de material, somando os ambientes', M, y); y += 3.5;
    const cols2 = [['Item', M + 2.5, 'left'], ['Qtd. total', qtyR, 'right'], ['OK', M + CW - 2.5, 'right']];
    head(cols2);
    tot.forEach(e => {
      const w = qtyR - M - 30, L = wrap(e.name, w, 9.5), B = e.by.size > 1 ? wrap(byText(e), w, 8) : [];
      const h = L.length * lh(9.5) + B.length * lh(8) + 2.7;
      if (need(h)) head(cols2);
      L.forEach((t, k) => txt(t, M + 2.5, y + 4.4 + k * lh(9.5), { size: 9.5, bold: true }));
      B.forEach((t, k) => txt(t, M + 2.5, y + 4.2 + L.length * lh(9.5) + k * lh(8), { size: 8, color: PC.muted }));
      txt(`${fmtQty(e.qty)} ${unitTxt(e.qty, e.unit)}`, qtyR, y + 4.4, { size: 9.5, bold: true, align: 'right' });
      box(y + 1.4); y += h; sep();
    });
  }
  pdfFooter(K, `Conferência ${numLabel(q)}${q.client.name ? ' · ' + q.client.name : ''}`);
  return doc.output('blob');
}

/* ================= recibo ================= */
function extenso(cents) {
  const U = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const D = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const C = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  const tri = n => {
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100), r = n % 100, p = [];
    if (c) p.push(C[c]);
    if (r) p.push(r < 20 ? U[r] : D[Math.floor(r / 10)] + (r % 10 ? ' e ' + U[r % 10] : ''));
    return p.join(' e ');
  };
  const whole = n => {
    const G = [[Math.floor(n / 1e6) % 1000, 'milhão', 'milhões'], [Math.floor(n / 1e3) % 1000, 'mil', 'mil'], [n % 1000, '', '']].filter(g => g[0] > 0);
    return G.map((g, i) => {
      let w = g[1] === 'mil' && g[0] === 1 ? 'mil' : tri(g[0]) + (g[1] ? ' ' + (g[0] === 1 ? g[1] : g[2]) : '');
      if (i > 0) w = (i === G.length - 1 && (g[0] < 100 || g[0] % 100 === 0) ? ' e ' : ' ') + w;
      return w;
    }).join('');
  };
  const r = Math.floor(cents / 100), cc = cents % 100;
  let s = '';
  if (r) s = whole(r) + (r >= 1e6 && r % 1e6 === 0 ? ' de' : '') + (r === 1 ? ' real' : ' reais');
  if (cc) s += (s ? ' e ' : '') + tri(cc) + (cc === 1 ? ' centavo' : ' centavos');
  return s || 'zero real';
}
function receiptSheet(q) {
  const c = compute(q);
  const def = q.status === 'aprovado' && q.payment.mode === 'entrada' ? c.entry : c.payTotal;
  let method = 'Pix';
  openSheet({ title: 'Recibo de pagamento', body: `
      <div class="field"><label for="rc-val">Valor recebido</label><input id="rc-val" type="text" inputmode="numeric" data-money value="${BRL(def)}"></div>
      ${linhas([['Total', c.payTotal], q.payment.mode === 'entrada' ? ['Entrada', c.entry] : null, q.payment.mode === 'entrada' ? ['Restante', c.rest] : null].filter(Boolean).map(([l, v]) => linha(`data-v="${v}"`, l, { tipo: 'um', on: v === def, dir: BRL(v) })), ' role="group" aria-label="Sugestões de valor"')}
      <div class="field"><label for="rc-ref">Referente a</label><input id="rc-ref" type="text" value="${esc((q.title || 'serviços elétricos').replace(/^./, ch => ch.toLowerCase()))}, ${isReport(q) ? 'relatório' : 'orçamento'} ${esc(numLabel(q))}"></div>
      <div class="field"><span class="lab">Forma de pagamento</span><div class="seg" role="group">${['Pix', 'Dinheiro', 'Cartão', 'Transferência'].map(m => `<button data-m="${m}" aria-pressed="${m === method}">${m}</button>`).join('')}</div></div>
      <p class="hint" id="rc-ext"></p>`,
    foot: `<button class="btn primary" data-go>${I.share}Gerar recibo em PDF</button>`,
    onMount: s => {
      const vi = $('#rc-val', s), ext = () => { const v = parseMoney(vi.value) || 0; $('#rc-ext', s).textContent = v ? `Por extenso: ${extenso(v)}.` : ''; };
      ext(); vi.addEventListener('input', ext);
      const marcaV = () => { const v = parseMoney(vi.value) || 0; $$('[data-v]', s).forEach(x => x.setAttribute('aria-pressed', +x.dataset.v === v)); };
      vi.addEventListener('input', marcaV);
      $$('[data-v]', s).forEach(b => b.onclick = () => { vi.value = BRL(+b.dataset.v); ext(); marcaV(); });
      $$('[data-m]', s).forEach(b => b.onclick = () => { method = b.dataset.m; $$('[data-m]', s).forEach(x => x.setAttribute('aria-pressed', x === b)); });
      $('[data-go]', s).onclick = async e => {
        const v = parseMoney(vi.value);
        if (!v) return toast('Informe o valor recebido.');
        const btn = e.currentTarget, html = btn.innerHTML; btn.disabled = true; btn.textContent = 'Gerando…';
        try { const blob = await buildReceiptPDF(q, v, $('#rc-ref', s).value.trim(), method); await saveFile(fileName('Recibo', q), blob); }
        catch (err) { console.warn(err); toast('Não foi possível gerar o recibo. Na primeira vez, o app precisa de internet.'); }
        btn.disabled = false; btn.innerHTML = html;
      };
    } });
}
async function buildReceiptPDF(q, value, ref, method) {
  const JsPDF = await loadJsPDF();
  const K = pdfKit(JsPDF), { doc, M, CW, txt, wrap, label } = K, s = settings;
  let y = pdfHeader(K, 'RECIBO', numLabel(q), [fmtDate(Date.now())]);
  doc.setFillColor(...PC.volt); doc.roundedRect(M + CW - 70, y, 70, 17, 1.8, 1.8, 'F');
  label('Valor', M + CW - 66, y + 5.5);
  txt(BRL(value), M + CW - 4, y + 13, { size: 16, bold: true, align: 'right' });
  y += 30;
  const body = `Recebi de ${q.client.name || 'cliente'}${q.client.doc ? ', ' + fmtDoc(q.client.doc) + ',' : ''} a importância de ${BRL(value)}, ${extenso(value)}, referente a ${ref || 'serviços elétricos'}.`;
  wrap(body, CW, 12).forEach(t => { txt(t, M, y, { size: 12 }); y += 6.6; });
  y += 3;
  txt(`Forma de pagamento: ${method}.`, M, y, { size: 12 }); y += 14;
  txt(`${s.city ? s.city + ', ' : ''}${longDate(Date.now())}.`, M, y, { size: 12 }); y += 32;
  const cx = M + CW / 2;
  doc.setDrawColor(...PC.ink); doc.setLineWidth(0.3); doc.line(cx - 48, y, cx + 48, y);
  txt(s.name || s.company || 'Assinatura', cx, y + 5.5, { size: 10.5, bold: true, align: 'center' });
  const sub = [s.company && s.name ? s.company : '', s.doc].filter(Boolean).join(' · ');
  if (sub) txt(sub, cx, y + 10.5, { size: 9, color: PC.muted, align: 'center' });
  pdfFooter(K, `Recibo ${numLabel(q)}${q.client.name ? ' · ' + q.client.name : ''}`);
  return doc.output('blob');
}

/* ================= salvar e compartilhar arquivos ================= */
let pendingFile = null;
const slug = s => fold(s || '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fileName = (kind, q) => `${kind}-${q.example ? 'exemplo' : String(q.num || 0).padStart(4, '0')}${q.client.name ? '-' + slug(q.client.name) : ''}.pdf`;
async function saveFile(name, blob) {
  const file = new File([blob], name, { type: blob.type || 'application/octet-stream' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return true; }
    catch (e) {
      if (e && e.name === 'AbortError') return false;
      // no iPhone o menu só abre logo depois de um toque; se o PDF demorou, oferece um toque novo
      if (e && e.name === 'NotAllowedError') { pendingFile = file; toast('Arquivo pronto.', { label: 'Compartilhar', run: () => { const f = pendingFile; pendingFile = null; if (f) navigator.share({ files: [f] }).catch(() => {}); } }); return true; }
    }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  return true;
}

