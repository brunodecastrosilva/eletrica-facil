/* Elétrica Fácil 5 · testes do app (npm test). Rodam num Chromium, sem internet: o GitHub (sincronização) é simulado por
   comum/testes/ambiente.mjs. Escritos junto com o app enxuto: seguem o orçamento e o relatório, o botão do pé, os preços
   em blocos, as contas, os documentos, o começo sem apagar a versão 3, o raio que cai sozinho, a apresentação e o guia. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, semRolagemLateral, conferirTopo, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ, semCampoEmFoco } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const fecharJanela = async p => { await p.evaluate(() => KitFacil.dialogo.fechar(true)); await p.waitForTimeout(150); };
const TELAS = [[{ width: 320, height: 568 }, 'celular mínimo'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
const pronto = p => p.locator('main.inicio').waitFor();
// campo de dinheiro do Kit: os dígitos entram como centavos (Regras do app, Art. 15)
const digitar = async (p, sel, digitos) => { await p.locator(sel).click(); await p.locator(sel).pressSequentially(digitos); await p.locator(sel).blur(); };
// os seus dados e a sua hora são pedidos antes do primeiro serviço; os testes que não são sobre eles começam com eles
// informados, com o deslocamento de R$ 20 por ida e alguns itens que a pessoa já criou nos Preços (o app não traz nenhum)
const comHora = p => p.evaluate(() => {
  if (!ajustes.hora || !dadosOk()) { ajustes.hora = ajustes.hora || 12000; ajustes.nome = ajustes.nome || 'Carlos Pereira'; ajustes.fone = ajustes.fone || '11987654321'; ajustes.deslIda = ajustes.deslIda || 2000; salvarAjustes(); }
  if (precos.length) return;
  const S = (id, cat, nome, acao, obj, min) => acertaPreco({ id, cat, nome, un: 'un', min, acao, obj }), M = (id, nome, preco) => acertaPreco({ id, cat: CAT_MATERIAL, nome, un: 'un', fixo: true, preco });
  precos.push(S('p-tomadas-1', 'c-tomadas', 'Instalação de tomada 10 A', 'instalacao', 'tomada 10 A', 30), S('p-tomadas-2', 'c-tomadas', 'Troca de tomada 10 A', 'troca', 'tomada 10 A', 20),
    S('p-tomadas-10', 'c-tomadas', 'Troca de interruptor simples', 'troca', 'interruptor simples', 20), S('p-tomadas-8', 'c-tomadas', 'Troca de espelho ou placa', 'troca', 'espelho ou placa', 10),
    S('p-iluminacao-1', 'c-iluminacao', 'Instalação de luminária ou plafon', 'instalacao', 'luminária ou plafon', 45), S('p-aparelhos-1', 'c-aparelhos', 'Instalação de chuveiro', 'instalacao', 'chuveiro', 60),
    S('p-quadro-1', 'c-quadro', 'Troca de disjuntor monopolar', 'troca', 'disjuntor monopolar', 20), S('p-quadro-9', 'c-quadro', 'Troca de disjuntor geral', 'troca', 'disjuntor geral', 30),
    M('p-materiais-5', 'Tomada 10 A', 1800), M('p-materiais-7', 'Interruptor simples', 1600), M('p-materiais-20', 'Disjuntor monopolar', 1800));
  salvarPrecos();
});
// o documento nasce com o cliente: nome, telefone e endereço do serviço
const cliente = async (p, nome = 'Mariana Souza') => { await p.locator('#cl-nome').waitFor(); await p.fill('#cl-nome', nome); await p.fill('#cl-fone', '11988887777'); await p.fill('#cl-end', 'Rua das Acácias, 120'); await p.click('.kf-dlg [data-salvar]'); await p.locator('#pe-doc').waitFor(); };
const novoPelaBarra = async (p, tipo) => { await comHora(p); await p.evaluate(() => irPara('novo')); await p.locator(`.kf-dlg [data-novo-tipo="${tipo}"]`).click(); await cliente(p); };
const pe = p => p.evaluate(() => ({ rotulo: document.querySelector('#pe-doc [data-prox]').textContent.trim(), total: document.querySelector('#pnl-total').textContent.trim().replace(/\s/g, ' '), que: document.querySelector('#pnl .pnl-t small').textContent.trim() }));
// as condições ficam numa linha do painel; cada uma abre a sua janela
const cond = async (p, j) => { await p.click('#conteudo [data-cond]'); await p.click(`.kf-dlg [data-j="${j}"]`); };
const aqui = p => p.evaluate(() => getDoc(rota().id));

test('abre sem erros em celular, tablet e computador, sem rolagem lateral; topo, navegação e nomes inteiros', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport }); const p = a.page;
    await pronto(p);
    assert.equal(await p.evaluate(() => VERSAO), versao, 'a versão do código é a do package.json');
    assert.deepEqual((await conferirTopo(p, { presente: true })).erros, [], `topo (${nome})`);
    assert.equal(await semRolagemLateral(p), true, `rolagem lateral em ${nome}`);
    const nomes = await p.evaluate(() => [...document.querySelectorAll(innerWidth >= 1024 ? '.kf-trilho [data-kf-ir]' : '.kf-nav [data-kf-ir]')].filter(b => b.getClientRects().length).map(b => (b.getAttribute('aria-label') || b.textContent).trim()));
    for (const n of ['Início', 'Documentos', 'Preços', 'Mais', 'Novo documento']) assert.ok(nomes.some(x => x.includes(n)), `${n} na navegação (${nome}): ${nomes.join(' | ')}`);
    assert.equal(nomes.filter(x => !x.includes('Novo')).length, 4, 'quatro seções e a ação do centro: no máximo cinco posições');
    assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-nav .kf-nav-it:not(.kf-nav-centro) .kf-nav-l')].filter(e => e.getClientRects().length && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)), [], `rótulo cortado na barra de baixo (${nome})`);
    for (const h of ['#/docs', '#/precos', '#/precos/c-quadro', '#/mais', '#/ajustes']) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(140); assert.equal(await semRolagemLateral(p), true, `rolagem lateral em ${h} (${nome})`); }
    await p.evaluate(() => { criarExemplo(); }); await p.locator('#pe-doc').waitFor();
    assert.equal(await semRolagemLateral(p), true, `rolagem lateral no documento (${nome})`);
    assert.deepEqual((await conferirTopo(p, { presente: false })).erros, [], `topo da tela interna (${nome})`);
    assert.deepEqual(a.erros, [], `erros no console (${nome})`);
    await a.fechar();
  }
});

test('começo novo: nada da versão 3 é apagado; vêm de lá os dados dos documentos e a ligação da nuvem; dado torto não trava', async () => {
  const a = await aparelho(amb, { antes: () => {
    if (sessionStorage.getItem('ja')) return; sessionStorage.setItem('ja', '1');
    const L = (k, v) => localStorage.setItem('eletricafacil.' + k, typeof v === 'string' ? v : JSON.stringify(v));
    L('formato', '3'); L('abertura', '1');
    L('settings', { name: 'Carlos Antigo', company: 'CA Elétrica', phone: '11999990000', pix: 'antigo@exemplo.com', city: 'Fortaleza', seq: 41 });
    L('quotes', [{ id: 'q1', client: { name: 'Cliente da versão 3' } }]); L('prices', [{ id: 'velho', kind: 'svc', name: 'Preço antigo', unit: 'un', price: 1 }]);
    L('sync', { token: 'ghp_antigo', gistId: 'abc', login: 'fulano', lastSync: 123, st: { 's:name': 5 }, del: { x: 1 } });
    L('docs', '{"isto":"não é uma lista"'); L('precos', '"texto"'); // lixo de propósito nas chaves novas
  } });
  const p = a.page; await pronto(p);
  const antigo = () => p.evaluate(() => ['settings', 'quotes', 'prices'].map(k => localStorage.getItem('eletricafacil.' + k)));
  const v3 = await antigo();
  assert.match(v3[1], /Cliente da versão 3/, 'os orçamentos da versão 3 continuam no aparelho');
  assert.match(v3[2], /Preço antigo/);
  assert.deepEqual(await p.evaluate(() => [ajustes.nome, ajustes.empresa, ajustes.fone, ajustes.pix, ajustes.cidade, ajustes.seq]), ['Carlos Antigo', 'CA Elétrica', '11999990000', 'antigo@exemplo.com', 'Fortaleza', 0]);
  assert.deepEqual(await p.evaluate(() => [docs.length, cats.length, precos.length, precos.some(x => x.nome === 'Preço antigo')]), [0, 8, 0, false], 'o app começa com as categorias do banco e nenhum preço, mesmo com lixo guardado');
  assert.deepEqual(await p.evaluate(() => [SY.ligada(), sinc.token, sinc.gistId, Object.keys(sinc.st).filter(k => k.startsWith('s:')).length, localStorage.getItem('eletricafacil.formato'), localStorage.getItem('eletricafacil.abertura')]), [true, 'ghp_antigo', '', 0, '4', null]);
  await p.evaluate(() => { ajustes.nome = 'Nome Novo'; salvarAjustes(); });
  await p.reload(); await pronto(p);
  assert.equal(await p.evaluate(() => ajustes.nome), 'Nome Novo', 'a passagem roda uma vez só');
  assert.deepEqual(await antigo(), v3, 'nada da versão 3 mudou');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('contas: subtotal, desconto, total, entrada e restante fecham no centavo; a etapa acompanha o que falta', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  const r = await p.evaluate(() => {
    const d = acertaDoc({ tipo: 'orc', linhas: [{ nome: 'A', un: 'un', q: 3, pu: 6000 }, { nome: 'B', un: 'm', q: 12, pu: 350 }, { nome: 'C', un: 'un', q: 1, pu: 11550 }], desc: 1250, pag: 'entrada', entradaPct: 40 });
    const o = { c1: conta(d), cob1: cobrarAgora(d) };
    d.pagos.push({ id: 'a', v: 5000, em: 1, meio: 'Pix' }); o.cob2 = cobrarAgora(d);
    d.pagos.push({ id: 'b', v: 8000, em: 1, meio: 'Pix' }); o.cob3 = cobrarAgora(d);
    d.etapa = 'aprovado'; d.pagos.push({ id: 'c', v: 19500, em: 1, meio: 'Dinheiro' }); acertaEtapa(d); o.etapa1 = d.etapa; o.c2 = conta(d);
    d.linhas.push({ id: 'x', pid: '', nome: 'D', un: 'un', q: 1, pu: 1000 }); acertaEtapa(d); o.etapa2 = d.etapa; o.falta2 = conta(d).falta;
    const q = acertaDoc({ tipo: 'orc', linhas: [{ nome: 'A', un: 'un', q: 1, pu: 33333 }], pag: 'entrada', entradaPct: 30 }); o.quebrado = conta(q);
    const g = acertaDoc({ tipo: 'orc', linhas: [{ nome: 'A', un: 'un', q: 1, pu: 5000 }], desc: 99999999 }); o.descMaior = conta(g);
    const rel = acertaDoc({ tipo: 'rel', pag: 'entrada', etapa: 'aprovado', linhas: [{ nome: 'A', un: 'un', q: 2, pu: 5000 }] });
    o.rel = [rel.pag, rel.etapa, ETAPAS.rel.length, conta(rel).entrada, proximo(rel).id, proximo({ ...rel, etapa: 'enviado' }).id];
    o.ext = [extenso(143550), extenso(100), extenso(1), extenso(100000000), extenso(2000), extenso(101)];
    return o;
  });
  const { sub, desc, total, entrada, resto, pago, falta } = r.c1;
  assert.deepEqual({ sub, desc, total, entrada, resto, pago, falta }, { sub: 33750, desc: 1250, total: 32500, entrada: 13000, resto: 19500, pago: 0, falta: 32500 });
  assert.deepEqual([r.cob1, r.cob2, r.cob3], [{ v: 13000, que: 'a entrada' }, { v: 8000, que: 'a entrada' }, { v: 19500, que: 'o restante' }]);
  assert.deepEqual([r.etapa1, r.c2.falta, r.etapa2, r.falta2], ['recebido', 0, 'aprovado', 1000], 'quitou, vira Recebido; mexeu no valor, volta a cobrar');
  assert.equal(r.quebrado.entrada + r.quebrado.resto, r.quebrado.total, 'entrada e restante somam o total');
  assert.deepEqual([r.descMaior.desc, r.descMaior.total], [5000, 0], 'o desconto não passa do subtotal');
  assert.deepEqual(r.rel, ['vista', 'rascunho', 3, 0, 'enviar', 'receber'], 'o relatório não tem entrada nem etapa Aprovado');
  assert.deepEqual(r.ext, ['mil quatrocentos e trinta e cinco reais e cinquenta centavos', 'um real', 'um centavo', 'um milhão de reais', 'vinte reais', 'um real e um centavo']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('a hora como base: o caso da prima dá R$ 240 de mão de obra mais as idas, com o serviço criado na hora; mínimo por ida, condição, desconto, cortesia e tempo real', async () => {
  const a = await aparelho(amb, { antes: PDF_FALSO }); const p = a.page; await pronto(p);
  const r = await p.evaluate(() => {
    ajustes.hora = 12000; const o = {};
    const t = acertaPreco({ id: 't1', cat: 'c-quadro', nome: 'Troca de disjuntor geral', un: 'un', min: 30 }), f = acertaPreco({ id: 'f1', cat: 'c-quadro', nome: 'Instalação de padrão de entrada', un: 'un', fixo: true, preco: 150000 });
    o.precos = [precoDe(t), precoDe(f)]; ajustes.hora = 15000; o.sobe = [precoDe(t), precoDe(f)]; ajustes.hora = 12000;
    const prima = acertaDoc({ tipo: 'rel', minIda: 10000, linhas: [{ tipo: 'diag', nome: 'Diagnóstico do defeito', min: 90, pu: 12000 }, { pid: 't1', nome: 'Troca de disjuntor geral', q: 1, pu: 6000 }, { tipo: 'desl', nome: 'Deslocamento', q: 2, pu: 2000 }] });
    o.prima = conta(prima); o.cliente = linhasCliente(prima).map(l => [l.nome, l.total]);
    const peq = acertaDoc({ tipo: 'orc', minIda: 10000, linhas: [{ pid: 'x', nome: 'Troca de disjuntor monopolar', q: 1, pu: 4000 }, { tipo: 'desl', nome: 'Deslocamento', q: 1, pu: 2000 }, { tipo: 'mat', nome: 'Disjuntor', q: 1, pu: 3000 }] });
    o.peq = conta(peq); o.peqCli = linhasCliente(peq).map(l => [l.nome, l.total]);
    peq.descPct = 50; o.meio = conta(peq); peq.descPct = 100; o.cem = conta(peq);
    prima.descPct = 100; prima.descNome = 'Desconto de família'; prima.etapa = 'enviado'; o.cortesia = [conta(prima).total, pagTxt(prima), proximo(prima).id, descTxt(prima)];
    o.velho = acertaPreco({ id: 'p-tomadas-2', cat: 'c-tomadas', nome: 'Troca', un: 'un', preco: 4500 }); o.meu = acertaPreco({ id: 'abc', cat: 'c-x', nome: 'Meu', un: 'un', preco: 7700 });
    o.tempo = [5, 20, 60, 90, 450].map(tempoTxt);
    o.fabrica = [precos.length, ajustes.deslIda, ajustes.deslKm, ajustes.diaria];
    return o;
  });
  assert.deepEqual(r.fabrica, [0, 0, 0, 0], 'nenhum preço de fábrica: nem serviço, nem deslocamento, nem diária');
  assert.deepEqual(r.precos, [6000, 150000], 'tempo vezes a hora; o preço em reais é fixo');
  assert.deepEqual(r.sobe, [7500, 150000], 'a hora muda, o preço dado pelo tempo acompanha e o fixo fica');
  assert.deepEqual([r.prima.mao, r.prima.minimo, r.prima.desl, r.prima.total], [24000, 0, 4000, 28000], 'caso da prima: R$ 240 de mão de obra mais duas idas');
  assert.deepEqual(r.cliente, [['Diagnóstico do defeito (1h30)', 18000], ['Troca de disjuntor geral', 6000], ['Deslocamento (2 idas)', 4000]]);
  assert.deepEqual([r.peq.minimo, r.peq.mao, r.peq.desl, r.peq.mat, r.peq.total], [6000, 10000, 2000, 3000, 15000], 'o serviço de 20 minutos é completado até o mínimo por ida');
  assert.deepEqual(r.peqCli, [['Troca de disjuntor monopolar', 4000], ['Atendimento mínimo', 6000], ['Deslocamento (1 ida)', 2000], ['Disjuntor', 3000]]);
  assert.deepEqual([r.meio.desc, r.meio.total, r.cem.desc, r.cem.total], [6000, 9000, 12000, 3000], 'o desconto em porcentagem não incide sobre o material');
  assert.deepEqual(r.cortesia, [0, 'Cortesia: nada a pagar.', 'concluir', 'Desconto de família (100%)']);
  assert.deepEqual([r.velho.min, r.velho.fixo, r.meu.fixo, r.meu.preco], [20, false, true, 7700], 'preço de fábrica de antes da versão 5 ganha o tempo; o que a pessoa criou vira preço fixo');
  assert.deepEqual(r.tempo, ['5 min', '20 min', '1 h', '1h30', '7h30']);
  // pela tela, com os dados já informados e sem a hora: +, Relatório, a cliente; Somar pede a hora (pela conta do mês),
  // 1h30 de diagnóstico, a primeira ida pede o valor (fica em Ajustes), a segunda ida, e o disjuntor geral criado na hora
  await p.evaluate(() => { ajustes.hora = 0; ajustes.nome = 'Carlos Pereira'; ajustes.fone = '11987654321'; salvarAjustes(); });
  await p.click('#kf-nav-novo'); await p.locator('.kf-dlg [data-novo-tipo="rel"]').click(); await cliente(p, 'Prima');
  let toques = 0; const t = async sel => { await p.click(sel); toques++; };
  await t('#pe-doc [data-prox]'); await p.locator('#hr-v').waitFor();
  await p.click('.kf-dlg [data-hm="conta"]'); await digitar(p, '#hr-t', '600000'); await digitar(p, '#hr-c', '120000'); await p.fill('#hr-h', '60');
  assert.match(await p.locator('#hr-r').innerText(), /R\$\s120,00/, '(6.000 + 1.200) / 60 horas');
  await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg [data-diag="90"]').waitFor();
  assert.deepEqual(await p.evaluate(() => [ajustes.hora, ajustes.hHoras]), [12000, 60]);
  await t('.kf-dlg [data-diag="90"]'); await t('.kf-dlg [data-ida="1"]'); await p.locator('#ln-p').waitFor();
  await digitar(p, '#ln-p', '2000'); await t('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg [data-ida="1"]').waitFor();
  assert.equal(await p.evaluate(() => ajustes.deslIda), 2000, 'o valor da ida fica em Ajustes');
  await t('.kf-dlg [data-ida="1"]');
  await t('.kf-dlg [data-novo-serv]'); await t('.kf-dlg [data-it-cat="c-quadro"]'); await t('.kf-dlg [data-it-obj="disjuntor geral"]');
  assert.equal(await p.inputValue('#it-n'), 'Troca de disjuntor geral', 'o objeto traz a ação mais comum, e o nome se monta');
  await t('.kf-dlg [data-it-min="30"]'); assert.match(await p.locator('#it-corpo [role="status"]').innerText(), /30 min × R\$\s120,00 a hora = R\$\s60,00/);
  await t('.kf-dlg [data-salvar]'); await p.locator('#so-q').waitFor();
  await t('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal(toques, 11, 'toques do Somar serviço até fechar, com o serviço criado na hora (fora a hora, pedida uma vez)');
  assert.deepEqual(await pe(p), { rotulo: 'Enviar', total: 'R$ 280,00', que: 'Total' });
  assert.match(await p.locator('#pnl').innerText(), /Total\s+R\$\s280,00[\s\S]*Mão de obra\s+R\$\s240,00\s+Deslocamento\s+R\$\s40,00\s+Material\s+não incluído/i);
  assert.match(await p.locator('#conteudo .itens').innerText(), /1h30 × R\$\s120,00 a hora[\s\S]*2 idas × R\$\s20,00/);
  const idDj = await p.evaluate(() => precos.find(x => x.nome === 'Troca de disjuntor geral').id);
  // condição num toque, na linha
  await p.locator('#conteudo .itens .item', { hasText: 'disjuntor geral' }).click(); await p.locator('#ln-cs').waitFor();
  await p.click('.kf-dlg [data-cond="2"]'); assert.match(await p.locator('#ln-cs').innerText(), /Muito difícil soma 50%: R\$\s90,00 cada/);
  await p.fill('#ln-m', 'Quadro antigo'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal((await pe(p)).total, 'R$ 310,00');
  assert.deepEqual(await p.evaluate(id => { const l = getDoc(rota().id).linhas.find(x => x.pid === id); return [l.base, l.cond, l.pu]; }, idDj), [6000, 2, 9000]);
  // desconto de 100%: o cliente vê o valor cheio e a linha do desconto; o documento vira cortesia
  await cond(p, 'desc'); await p.fill('#cd-dn', 'Desconto de família'); await p.click('.kf-dlg [data-dp="100"]'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal((await pe(p)).total, 'R$ 0,00');
  const pdf = (await p.evaluate(async () => { await montarPDF(getDoc(rota().id)); return window.__pdf.t.join('\n') + '\n---\n' + mensagem(getDoc(rota().id)); })).replace(/[  ]/g, ' ');
  for (const x of ['Diagnóstico do defeito (1h30)', 'Troca de disjuntor geral', 'Quadro antigo', 'Deslocamento (2 idas)', 'Valor do serviço', 'R$ 310,00', 'Desconto de família (100%)', 'Cortesia: nada a pagar.']) assert.ok(pdf.includes(x), `o documento do cliente sem "${x}"`);
  for (const x of ['a hora', '120,00', 'PAGUE COM PIX', 'Muito difícil', 'difícil']) assert.ok(!pdf.includes(x), `o cliente não deve ver "${x}"`);
  // tempo real: um toque; com três anotações, a média aparece no item
  await p.click('#conteudo [data-j="tempo"]'); await p.click('.kf-dlg [data-igual]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.deepEqual(await p.evaluate(id => { const x = precos.find(y => y.id === id); const o = [x.reais, getDoc(rota().id).tempoOk]; x.reais = [30, 45, 45]; o.push(mediaReal(x)); return o; }, idDj), [[30], true, 40]);
  // cortesia: Enviar e Concluir, sem Receber
  await p.click('#pe-doc [data-prox]'); await p.fill('#ev-nome', 'Prima'); await p.click('.kf-dlg [data-ja]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal((await pe(p)).rotulo, 'Concluir'); await p.click('#pe-doc [data-prox]');
  assert.ok(await esperar(async () => (await pe(p)).rotulo === 'Ver o PDF')); assert.equal((await aqui(p)).etapa, 'recebido');
  // deslocamento por quilômetro e mínimo por ida, num orçamento novo: o serviço criado no relatório já está lá, com o preço
  await p.evaluate(() => { ajustes.deslModo = 'km'; ajustes.deslKm = 200; ajustes.minIda = 10000; });
  await p.evaluate(() => irPara('novo')); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click(); await cliente(p);
  await p.click('#conteudo [data-somar], #pe-doc [data-prox="somar"]'); await p.click('.kf-dlg [data-ida="1"]'); await p.locator('#ln-k').waitFor();
  await p.click('.kf-dlg [data-salvar]'); assert.equal(await p.getAttribute('#ln-k', 'aria-invalid'), 'true');
  await p.fill('#ln-k', '16'); await p.click('.kf-dlg [data-salvar]'); await p.locator('#so-q').waitFor();
  assert.match(await p.locator(`.kf-dlg .so-lin:has([data-soma="${idDj}"])`).innerText(), /Troca de disjuntor geral\s+R\$\s60,00 por unidade · 30 min/);
  await p.click(`.kf-dlg [data-soma="${idDj}"]`); await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.match(await p.locator('#conteudo .itens').innerText(), /Atendimento mínimo\s+Completa R\$\s100,00 por ida\s+R\$\s40,00/);
  assert.equal((await pe(p)).total, 'R$ 132,00', '60 + 40 do mínimo + 16 km × R$ 2,00');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('lei: garantia de 90 dias sempre (só a adicional se escolhe), dados antigos abaixo de 90 sobem, validade de 10 dias, prazo para enviar, cliente obrigatório', async () => {
  const a = await aparelho(amb, { antes: PDF_FALSO }); const p = a.page; await pronto(p);
  const r = await p.evaluate(() => ({
    velhos: [0, 30, 90, 180, 365, 3650].map(g => acertaDoc({ tipo: 'orc', garantia: g }).garAd),
    aj: acertaAjustes({ garantia: 180 }).garAd, padrao: [acertaAjustes({}).validade, acertaAjustes({}).garAd, acertaDoc({ tipo: 'orc' }).validade],
    txt0: garantiaTxt(acertaDoc({ tipo: 'orc', garAd: 0 })), txt6: garantiaTxt(acertaDoc({ tipo: 'orc', garAd: 6 })), curta: [garCurta({ garAd: 0 }), garCurta({ garAd: 12 })],
    invalido: acertaDoc({ tipo: 'orc', garAd: 1 }).garAd,
    ok: [clienteOk({ nome: 'Ana', fone: '(85) 98888-7777', end: 'Rua A, 1' }), clienteOk({ nome: 'Ana', fone: '9888', end: 'Rua A' }), clienteOk({ nome: '', fone: '85988887777', end: 'Rua A' })],
    prazo: prazoTxt({ inicio: new Date(2026, 11, 1, 12).getTime(), dias: 3 }) }));
  assert.deepEqual(r.velhos, [0, 0, 0, 3, 12, 12], 'garantia antiga: abaixo de 90 vira a da lei; acima, o menor adicional que cobre');
  assert.equal(r.aj, 3); assert.deepEqual(r.padrao, [10, 0, 10]);
  assert.match(r.txt0, /^Garantia legal de 90 dias[\s\S]*art\. 26, II[\s\S]*não pode ser excluída nem reduzida\.$/);
  assert.match(r.txt6, /garantia contratual de 6 meses[\s\S]*somada à legal \(art\. 50\)/);
  assert.deepEqual(r.curta, ['90 dias, da lei', '90 dias da lei + 1 ano']); assert.equal(r.invalido, 0);
  assert.deepEqual(r.ok, [true, false, false]);
  assert.equal(r.prazo, 'Início previsto em 01/12/2026 e término até 03/12/2026 (3 dias de serviço).');
  // a janela da garantia: a lei aparece sempre; as escolhas são só a mais
  await novoPelaBarra(p, 'orc');
  assert.match(await p.locator('#conteudo [data-cond]').innerText(), /garantia de 90 dias, da lei/);
  assert.match(await p.locator('#conteudo [data-cond]').innerText(), /falta o prazo/);
  await p.click('#conteudo [data-cond]'); assert.match(await p.locator('.kf-dlg [data-j="prazo"]').innerText(), /Início e quantos dias leva/); await fecharJanela(p);
  await cond(p, 'garantia'); await p.locator('.kf-dlg [data-gar="6"]').waitFor();
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-dlg [data-gar]')].map(b => b.textContent.trim())), ['Nenhuma além da lei', '+3 meses', '+6 meses', '+1 ano']);
  await p.click('.kf-dlg [data-gar="6"]'); await fecharJanela(p);
  assert.equal((await aqui(p)).garAd, 6);
  // o cliente fica no documento e é conferido de novo ao salvar
  await p.click('#conteudo [data-j="cliente"]'); await p.fill('#cl-fone', '123'); await p.click('.kf-dlg [data-salvar]');
  assert.equal(await p.getAttribute('#cl-fone', 'aria-invalid'), 'true');
  // textos: nenhum campo vazio diz que é opcional nem usa "se quiser"
  const telas = await p.evaluate(() => document.body.innerText);
  assert.ok(!/opcional|se quiser|só é preciso/i.test(telas), 'texto de opcional na tela');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('5.2: painel fixo, um cartão por cômodo, Ver em lista, trilha só depois de enviar; disjuntor e faísca, parados com movimento reduzido', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await novoPelaBarra(p, 'orc');
  // sem cômodos: um cartão só, "Separar por cômodo" e nada de trilha antes de enviar
  assert.equal(await p.locator('#conteudo .cr').count(), 1); assert.equal((await p.locator('#conteudo [data-levantar]').innerText()).trim(), 'Separar por cômodo');
  assert.equal(await p.locator('#conteudo .tr-passos').count(), 0); assert.equal(await p.locator('#conteudo [data-vista]').count(), 0);
  await p.click('#conteudo [data-levantar]'); await p.click('.kf-dlg [data-cm="Sala"]'); await p.locator('.kf-dlg [data-com="Sala"]').waitFor();
  await p.click('.kf-dlg [data-soma="p-tomadas-2"]'); await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  // o cartão da Sala leva o código do circuito; a faísca corre nele, que foi onde o valor subiu
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#dc-car .sec-g')].map(h => h.dataset.cod)), ['C1', 'G']);
  await p.locator('#dc-car .cr[data-g="Sala"].faisca').waitFor({ timeout: 400 });
  assert.match(await p.locator('#pnl').innerText(), /R\$\s40,00/);
  // Ver em lista: todos os cômodos de uma vez, e volta aos cartões
  await p.click('#conteudo [data-vista]'); assert.equal(await p.locator('#dc-car').count(), 0); assert.match(await p.locator('#conteudo .sec-g').first().innerText(), /Sala\s+R\$\s40,00/);
  await p.click('#conteudo [data-vista]'); await p.locator('#dc-car').waitFor();
  // com movimento reduzido, somar não acende nada
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.click('#conteudo [data-somar-com="Sala"]'); await p.click('.kf-dlg [data-soma="p-tomadas-2"]'); await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal(await p.locator('#dc-car .faisca').count(), 0); assert.match(await p.locator('#pnl').innerText(), /R\$\s80,00/);
  // ao enviar: a trilha aparece no painel; o disjuntor arma só sem movimento reduzido
  await p.evaluate(() => { const d = getDoc(rota().id); d.inicio = Date.now() + 864e5; d.dias = 1; tocarDoc(d); redesenhar(); });
  await p.click('#pe-doc [data-prox="enviar"]'); await p.click('.kf-dlg [data-ja]'); await p.locator('#conteudo .tr-passos').waitFor();
  assert.equal(await p.locator('#pnl.arma').count(), 0, 'com movimento reduzido, o disjuntor não se mexe'); assert.equal(await p.locator('#pnl .dj').count(), 1);
  await p.locator('.kf-toast .kf-toast-acao').click(); await p.locator('#conteudo .tr-passos').waitFor({ state: 'detached' });
  await p.emulateMedia({ reducedMotion: 'no-preference' });
  await p.click('#pe-doc [data-prox="enviar"]'); await p.click('.kf-dlg [data-ja]'); await p.locator('#pnl.arma').waitFor({ timeout: 600 });
  assert.ok(await esperar(async () => (await p.locator('#pnl.arma').count()) === 0), 'a animação termina sozinha');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('levantamento por cômodo: a visita do apartamento de dois quartos dá R$ 680 e a lista de materiais; Repetir o cômodo; PDF e mensagem por cômodo', async () => {
  const a = await aparelho(amb, { antes: PDF_FALSO }); const p = a.page; await pronto(p);
  await novoPelaBarra(p, 'orc'); let toques = 2;
  const t = async sel => { await p.click(sel); toques++; };
  await t('#conteudo [data-levantar]'); await t('.kf-dlg [data-cm="Sala"]'); await p.locator('.kf-dlg [data-com="Sala"]').waitFor();
  await t('.kf-dlg [data-soma="p-tomadas-2"]'); await t('.kf-dlg [data-soma="p-tomadas-2"]'); await t('.kf-dlg [data-soma="p-tomadas-10"]');
  await t('.kf-dlg [data-soma="p-iluminacao-1"]'); await t('.kf-dlg [data-soma="p-iluminacao-1"]');
  await t('.kf-dlg [data-aba="mat"]'); await t('.kf-dlg [data-mts="p:p-materiais-5"]'); await t('.kf-dlg [data-mts="p:p-materiais-5"]'); await t('.kf-dlg [data-mts="p:p-materiais-7"]');
  await t('.kf-dlg [data-com-novo]'); await t('.kf-dlg [data-cm="Quarto"]'); await p.locator('.kf-dlg [data-com="Quarto"]').waitFor();
  await t('.kf-dlg [data-mts="p:p-materiais-5"]'); await t('.kf-dlg [data-mts="p:p-materiais-5"]'); await t('.kf-dlg [data-mts="p:p-materiais-7"]');
  await t('.kf-dlg [data-aba="serv"]'); await t('.kf-dlg [data-soma="p-tomadas-2"]'); await t('.kf-dlg [data-soma="p-tomadas-2"]'); await t('.kf-dlg [data-soma="p-tomadas-10"]');
  await t('.kf-dlg [data-com-novo]'); await t('.kf-dlg [data-cm="Quarto"]'); await p.locator('.kf-dlg [data-com="Quarto 2"]').waitFor();
  assert.equal((await p.locator('.kf-dlg [data-repetir]').innerText()).trim(), 'Repetir o Quarto 1');
  await t('.kf-dlg [data-repetir]');
  await t('.kf-dlg [data-com-novo]'); await t('.kf-dlg [data-cm="Banheiro"]'); await p.locator('.kf-dlg [data-com="Banheiro"]').waitFor();
  await t('.kf-dlg [data-soma="p-aparelhos-1"]'); await t('.kf-dlg [data-ida="1"]');
  await t('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal(toques, 30, 'toques do + até fechar a janela, com os serviços já salvos (sem abrir categoria: 5 a menos que na 5.2)');
  assert.equal((await pe(p)).total, 'R$ 680,00');
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#conteudo .sec-g')].map(h => h.innerText.replace(/\s+/g, ' ').trim())),
    ['Sala R$ 300,00', 'Quarto 1 R$ 120,00', 'Quarto 2 R$ 120,00', 'Banheiro R$ 120,00', 'Geral R$ 20,00']);
  // o cômodo: renomear vale para todas as linhas; uma linha muda de cômodo pela janela dela; apagar leva o que tem dentro, com Desfazer
  await p.click('#conteudo [data-cmd="Quarto 2"]'); await p.locator('#cmd-n').waitFor(); await p.fill('#cmd-n', 'Sala'); await p.click('.kf-dlg [data-salvar]');
  assert.equal(await p.getAttribute('#cmd-n', 'aria-invalid'), 'true', 'nome repetido não vale');
  await p.fill('#cmd-n', 'Quarto de hóspedes'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.deepEqual(await p.evaluate(() => { const d = getDoc(rota().id); return [d.comodos, d.linhas.filter(l => l.com === 'Quarto de hóspedes').length, d.mats.filter(m => m.com === 'Quarto de hóspedes').length]; }), [['Sala', 'Quarto 1', 'Quarto de hóspedes', 'Banheiro'], 2, 2]);
  await p.locator('#conteudo .itens .item', { hasText: 'luminária' }).click(); await p.locator('#ln-cm').waitFor({ state: 'attached' });
  await p.evaluate(() => { const e = document.querySelector('#ln-cm'); e.value = 'Quarto 1'; e.dispatchEvent(new Event('change', { bubbles: true })); }); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#conteudo .sec-g')].map(h => h.innerText.replace(/\s+/g, ' ').trim())),
    ['Sala R$ 120,00', 'Quarto 1 R$ 300,00', 'Quarto de hóspedes R$ 120,00', 'Banheiro R$ 120,00', 'Geral R$ 20,00']);
  await p.click('#conteudo [data-cmd="Banheiro"]'); await p.click('.kf-dlg [data-apagar]'); await p.click('.kf-dlg [data-kf-ok]');
  assert.ok(await esperar(async () => (await pe(p)).total === 'R$ 560,00'), 'o chuveiro sai junto com o Banheiro');
  await p.locator('.kf-toast .kf-toast-acao').click();
  assert.ok(await esperar(async () => (await pe(p)).total === 'R$ 680,00'), 'Desfazer devolve o Banheiro');
  assert.equal(await p.evaluate(() => getDoc(rota().id).comodos.join('|')), 'Sala|Quarto 1|Quarto de hóspedes|Banheiro');
  await p.click('#conteudo [data-j="mats"]'); await p.locator('.kf-dlg [data-por]').waitFor();
  assert.match(await p.locator('#ml-corpo').innerText(), /Eu levo\s+R\$\s156,00[\s\S]*Tomada 10 A\s+6 un\.\s+R\$\s108,00[\s\S]*Interruptor simples\s+3 un\.\s+R\$\s48,00/);
  await p.click('.kf-dlg [data-pc="1"]'); assert.equal(await p.locator('#ml-corpo h4.sec-g').count(), 3, 'Sala, Quarto 1 e Quarto de hóspedes');
  assert.match(await p.locator('#ml-corpo').innerText(), /Quarto de hóspedes/);
  await p.click('.kf-dlg [data-ok]'); assert.equal(await p.getAttribute('.kf-dlg [data-ok] >> nth=0', 'aria-pressed'), 'true', 'marcar o que já comprou');
  await p.click('.kf-dlg [data-por]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal((await pe(p)).total, 'R$ 836,00', 'R$ 680 + R$ 156 do material');
  const txt = (await p.evaluate(async () => { const d = getDoc(rota().id); await montarPDF(d); return window.__pdf.t.join('\n') + '\n---\n' + mensagem(d); })).replace(/[  ]/g, ' ');
  for (const x of ['SALA · R$ 120,00', 'QUARTO 1 · R$ 300,00', 'QUARTO DE HÓSPEDES · R$ 120,00', 'BANHEIRO · R$ 120,00', 'GERAL · R$ 20,00', 'MATERIAL · R$ 156,00', '*Sala* · R$ 120,00', '*Quarto de hóspedes* · R$ 120,00', 'Tomada 10 A']) assert.ok(txt.includes(x), `sem "${x}"`);
  // quem não usa cômodos não vê diferença: o mesmo documento sem cômodos sai sem grupos
  assert.equal(await p.evaluate(() => { const d = clone(getDoc(rota().id)); d.comodos = []; return linhasCliente(d).every(l => l.grupo === ''); }), true);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('materiais: caso misto (eu levo e o cliente compra no mesmo orçamento), complemento em linha separada, material novo pela busca', async () => {
  const a = await aparelho(amb, { antes: PDF_FALSO }); const p = a.page; await pronto(p);
  await novoPelaBarra(p, 'orc');
  await p.click('#conteudo [data-somar], #pe-doc [data-prox="somar"]'); await p.click('.kf-dlg [data-aba="mat"]');
  await p.click('.kf-dlg [data-mts="p:p-materiais-5"]'); await p.click('.kf-dlg [data-mts="p:p-materiais-5"]');
  // a exceção: o chuveiro que o cliente compra, cadastrado na hora pela busca
  await p.click('.kf-dlg [data-qc="cli"]'); await p.fill('#so-q', 'Chuveiro'); await p.click('.kf-dlg [data-mnovo]');
  await p.locator('#mn-n').waitFor(); assert.equal(await p.inputValue('#mn-n'), 'Chuveiro'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('.kf-dlg [data-aba="mat"][aria-pressed="true"]').waitFor();
  // o complemento: "220 V, 7.500 W"
  const idCh = await p.evaluate(() => getDoc(rota().id).mats.find(m => m.nome === 'Chuveiro').id);
  await p.click(`.kf-dlg [data-mt="${idCh}"]`); await p.locator('#mt-c').waitFor(); await p.fill('#mt-c', '220 V, 7.500 W'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('.kf-dlg [data-aba="mat"][aria-pressed="true"]').waitFor();
  // complementos diferentes ficam em linhas separadas: um disjuntor de 20 A e um sem complemento
  await p.click('.kf-dlg [data-qc="eu"]'); await p.click('.kf-dlg [data-mts="p:p-materiais-20"]');
  const idDj = await p.evaluate(() => getDoc(rota().id).mats.find(m => m.pid === 'p-materiais-20').id);
  await p.click(`.kf-dlg [data-mt="${idDj}"]`); await p.locator('#mt-c').waitFor(); await p.fill('#mt-c', '20 A, curva C'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('.kf-dlg [data-aba="mat"][aria-pressed="true"]').waitFor(); await p.click('.kf-dlg [data-mts="p:p-materiais-20"]');
  // material do banco, ainda sem preço: conta igual
  assert.match(await p.locator('.kf-dlg .so-lin:has([data-mts="b:Caixa 4x2"])').innerText(), /Caixa 4x2\s+Unidade · sem preço ainda/);
  await p.click('.kf-dlg [data-mts="b:Caixa 4x2"]'); await p.click('.kf-dlg [data-mts="b:Caixa 4x2"]');
  await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  const r = await p.evaluate(() => listaMats(getDoc(rota().id)).map(m => [m.quem, m.nome, m.comp, m.q]));
  assert.deepEqual(r, [['eu', 'Tomada 10 A', '', 2], ['cli', 'Chuveiro', '220 V, 7.500 W', 1], ['eu', 'Disjuntor monopolar', '20 A, curva C', 1], ['eu', 'Disjuntor monopolar', '', 1], ['eu', 'Caixa 4x2', '', 2]]);
  assert.equal(await p.evaluate(() => precos.some(x => x.nome === 'Chuveiro')), false, 'material novo sem preço não vai para os Preços');
  assert.equal((await pe(p)).total, 'R$ 0,00', 'material contado não entra sozinho no orçamento');
  await p.click('#conteudo [data-j="mats"]'); await p.locator('.kf-dlg [data-por]').waitFor();
  assert.match(await p.locator('#ml-corpo').innerText(), /Eu levo\s+R\$\s72,00[\s\S]*Caixa 4x2\s+2 un\.\s+sem preço[\s\S]*O cliente compra[\s\S]*Chuveiro\s+1 un\. · 220 V, 7\.500 W/);
  const lista = await p.evaluate(() => mensagemLista(getDoc(rota().id)));
  assert.ok(lista.includes('Chuveiro (220 V, 7.500 W)') && !lista.includes('Tomada') && !lista.includes('R$'), lista);
  // o preço que o banco não traz é pedido aqui, e fica nos Preços
  assert.equal((await p.locator('.kf-dlg [data-por]').innerText()).trim(), 'Dar o preço e pôr no orçamento');
  await p.click('.kf-dlg [data-por]'); await p.locator('#pm-0').waitFor(); await p.click('.kf-dlg [data-salvar]');
  assert.equal(await p.getAttribute('#pm-0', 'aria-invalid'), 'true', 'sem o preço, não põe');
  await digitar(p, '#pm-0', '250'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal((await pe(p)).total, 'R$ 77,00', 'só a parte "Eu levo": 2 × 18 + 18 + 18 + 2 × 2,50');
  assert.deepEqual(await p.evaluate(() => { const x = precos.find(y => y.nome === 'Caixa 4x2'); return [x.cat, x.preco, x.fixo]; }), ['c-materiais', 250, true]);
  const pdf = (await p.evaluate(async () => { await montarPDF(getDoc(rota().id)); return window.__pdf.t.join('\n'); })).replace(/[  ]/g, ' ');
  assert.ok(pdf.includes('20 A, curva C') && !pdf.includes('Chuveiro'), 'o complemento sai no documento; o que o cliente compra, não');
  // mudar o padrão do orçamento leva todo o material para o cliente
  await p.evaluate(() => janelaMats(getDoc(rota().id))); await p.click('.kf-dlg [data-qm="cli"]');
  assert.deepEqual(await p.evaluate(() => [...new Set(getDoc(rota().id).mats.map(m => m.quem))]), ['cli']);
  // o cadastro: ação e objeto montam o nome
  await fecharJanela(p); await p.evaluate(() => ir('/precos/c-tomadas', true)); await p.locator('#conteudo [data-novo-preco]').click();
  await p.click('.kf-dlg [data-it-acao="troca"]'); await p.click('.kf-dlg [data-it-obj="tomada 20 A"]');
  assert.equal(await p.inputValue('#it-n'), 'Troca de tomada 20 A', 'a ação escolhida antes do objeto fica');
  // o filtro pela ação em Somar
  await p.evaluate(() => fecharJanela(true)); await novoPelaBarra(p, 'orc'); await p.click('#conteudo [data-somar], #pe-doc [data-prox="somar"]');
  await p.click('.kf-dlg [data-acf="troca"]');
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-dlg .so-lista .so-tx b')].map(b => b.textContent)), ['Troca de espelho ou placa', 'Troca de interruptor simples', 'Troca de tomada 10 A', 'Troca de disjuntor geral', 'Troca de disjuntor monopolar']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('dados do Bruno na 5.3: documentos, ajustes, a hora e o que ele criou ou mudou ficam; o item de fábrica intocado volta ao banco', async () => {
  const a = await aparelho(amb, { antes: () => {
    if (sessionStorage.getItem('ja')) return; sessionStorage.setItem('ja', '1');
    const L = (k, v) => localStorage.setItem('eletricafacil.' + k, JSON.stringify(v));
    localStorage.setItem('eletricafacil.formato', '4'); L('abertura', 1);
    L('ajustes', { hora: 15000, tab: 6, nome: 'Bruno', fone: '85999990000', deslIda: 2000, deslKm: 200, minIda: 9000, cond1: 30, cond2: 60, seq: 7, pix: 'bruno@exemplo.com', usos: { 'p-tomadas-1': 4, 'p-quadro-9': 2 } });
    L('cats', [{ id: 'c-tomadas', nome: 'Tomadas e interruptores', icone: 'tomada' }, { id: 'c-quadro', nome: 'Quadro', icone: 'quadro' }, { id: 'c-visita', nome: 'Diária', icone: 'visita' }, { id: 'c-materiais', nome: 'Materiais', icone: 'material' }, { id: 'c-meu', nome: 'Solar', icone: 'solar' }]);
    const F = (id, cat, nome, un, min, fixo, preco, acao, obj, reais = []) => ({ id, cat, nome, un, min, fixo, preco, reais, acao, obj });
    L('precos', [
      F('p-tomadas-1', 'c-tomadas', 'Instalação de tomada 10 A', 'un', 30, false, 0, 'instalacao', 'tomada 10 A'), // intocado (só usado): sai
      F('p-tomadas-2', 'c-tomadas', 'Troca de tomada 10 A', 'un', 25, false, 0, 'troca', 'tomada 10 A'), // tempo mudado: fica
      F('p-tomadas-10', 'c-tomadas', 'Troca de interruptor', 'un', 20, false, 0, 'troca', 'interruptor simples'), // nome mudado: fica
      F('p-quadro-9', 'c-quadro', 'Troca de disjuntor geral', 'un', 30, false, 0, 'troca', 'disjuntor geral', [30, 45]), // tempo real anotado: fica
      F('p-quadro-2', 'c-quadro', 'Instalação de DR', 'un', 75, false, 0, 'instalacao', 'DR'), // intocado: sai
      F('p-materiais-5', 'c-materiais', 'Tomada 10 A', 'un', 0, true, 1990, '', ''), // preço mudado: fica
      F('p-materiais-6', 'c-materiais', 'Tomada 20 A', 'un', 0, true, 2200, '', ''), // intocado: sai
      F('p-visita-4', 'c-visita', 'Diária técnica', 'dia', 0, true, 50000, '', ''), // diária com preço dele: vai para Ajustes
      F('meu-1', 'c-meu', 'Limpeza de painel', 'un', 0, true, 7700, '', '')]); // criado por ele: fica
    L('docs', [{ id: 'd1', num: 7, tipo: 'orc', etapa: 'enviado', cliente: { nome: 'Prima', fone: '85988887777', end: 'Rua 1' }, linhas: [{ id: 'l1', pid: 'p-tomadas-1', nome: 'Instalação de tomada 10 A', un: 'un', q: 2, pu: 7500 }, { id: 'l2', pid: 'p-visita-4', nome: 'Diária técnica', un: 'dia', q: 1, pu: 50000 }], minIda: 9000, criado: 1, mudou: 2 }]);
  } });
  const p = a.page; await p.locator('main.inicio').waitFor();
  const r = await p.evaluate(() => ({ aj: [ajustes.hora, ajustes.nome, ajustes.fone, ajustes.deslIda, ajustes.deslKm, ajustes.minIda, ajustes.cond1, ajustes.pix, ajustes.diaria, ajustes.tab],
    doc: (({ num, etapa, linhas }) => [num, etapa, linhas.map(l => [l.nome, l.q, l.pu])])(getDoc('d1')), total: conta(getDoc('d1')).total,
    ids: precos.map(x => x.id), cats: cats.map(c => c.id), salvo: JSON.parse(localStorage.getItem('eletricafacil.precos')).map(x => x.id),
    mexidos: precos.filter(x => x.id === 'p-tomadas-2' || x.id === 'p-materiais-5').map(x => [x.nome, x.min, x.preco]) }));
  assert.deepEqual(r.aj, [15000, 'Bruno', '85999990000', 2000, 200, 9000, 30, 'bruno@exemplo.com', 50000, 7], 'ajustes e a hora ficam; a diária dele vira o valor da diária');
  assert.deepEqual(r.doc, [7, 'enviado', [['Instalação de tomada 10 A', 2, 7500], ['Diária técnica', 1, 50000]]], 'o documento fica como estava');
  assert.equal(r.total, 65000);
  assert.deepEqual(r.ids, ['p-tomadas-2', 'p-tomadas-10', 'p-quadro-9', 'p-materiais-5', 'meu-1'], 'ficam o que ele criou e o que ele mudou');
  assert.deepEqual(r.salvo, r.ids, 'gravado no aparelho');
  assert.deepEqual(r.cats, ['c-tomadas', 'c-quadro', 'c-materiais', 'c-meu'], 'a categoria Diária, vazia, sai; as dele ficam, com o nome que ele deu');
  assert.deepEqual(r.mexidos, [['Troca de tomada 10 A', 25, 0], ['Tomada 10 A', 0, 1990]]);
  // o serviço que saiu volta pelo banco: a busca sugere, e ele dá o preço uma vez
  await p.evaluate(() => { ir('/d/d1', true); }); await p.locator('#pe-doc').waitFor();
  await p.evaluate(() => janelaSomar(getDoc('d1'))); await p.fill('#so-q', 'tomada 10');
  assert.match(await p.locator('.kf-dlg #so-corpo').innerText(), /Nos seus preços\s+Troca de tomada 10 A[\s\S]*Criar a partir do banco\s+Instalação de tomada 10 A/);
  await p.reload(); await p.locator('#pe-doc').waitFor();
  assert.deepEqual(await p.evaluate(() => [precos.length, ajustes.tab]), [5, 7], 'a passagem roda uma vez só');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('primeiro orçamento depois de pular a abertura: cliente sem Pular, depois os seus dados e a hora; o serviço novo é criado, somado e reaproveitado; do + ao recibo', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await p.click('#kf-nav-novo'); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click();
  // o cliente vem ao criar o documento (a lei pede): sem nome, telefone e endereço o documento não nasce
  await p.locator('#cl-nome').waitFor(); await p.click('.kf-dlg [data-salvar]');
  for (const c of ['#cl-nome', '#cl-fone', '#cl-end']) assert.equal(await p.getAttribute(c, 'aria-invalid'), 'true', `${c} apontado`);
  assert.equal(await p.evaluate(() => docs.filter(d => !d.exemplo).length), 0, 'sem cliente, nenhum documento');
  await cliente(p);
  assert.equal(await semCampoEmFoco(p), true, 'nenhum campo é selecionado sozinho');
  assert.deepEqual(await pe(p), { rotulo: 'Somar serviço', total: 'R$ 0,00', que: 'Total' });
  // quem pulou: antes de somar o primeiro serviço vêm os seus dados e a sua hora
  await p.click('#pe-doc [data-prox]'); await p.locator('#el-nome').waitFor();
  assert.match(await p.locator('.kf-dlg').innerText(), /Antes do primeiro serviço[\s\S]*Seus dados na proposta/); assert.equal(await semCampoEmFoco(p), true);
  await p.click('.kf-dlg [data-salvar]'); for (const c of ['#el-nome', '#el-fone']) assert.equal(await p.getAttribute(c, 'aria-invalid'), 'true', `${c} apontado`);
  await p.fill('#el-nome', 'Carlos Pereira'); await p.fill('#el-fone', '11987654321'); await p.fill('#el-empresa', 'CP Elétrica'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#hr-v').waitFor(); await p.click('.kf-dlg [data-salvar]'); assert.equal(await p.getAttribute('#hr-v', 'aria-invalid'), 'true', 'sem a hora, não segue');
  await digitar(p, '#hr-v', '12000'); assert.match(await p.locator('#hr-ex').innerText(), /troca de tomada \(20 min\), R\$\s40,00/);
  await p.click('.kf-dlg [data-salvar]'); await p.locator('#so-q').waitFor();
  assert.deepEqual(await p.evaluate(() => { const a = JSON.parse(localStorage.getItem('eletricafacil.ajustes')); return [a.nome, a.fone, a.empresa, a.hora]; }), ['Carlos Pereira', '11987654321', 'CP Elétrica', 12000]);
  assert.match(await p.locator('#so-corpo').innerText(), /Você ainda não tem serviços salvos/);
  // serviço novo, dentro do orçamento: Novo serviço, objeto, tempo, Salvar e somar (Tomadas já vem marcada; Instalação vem com o objeto)
  let toques = 0; const t = async sel => { await p.click(sel); toques++; };
  await t('.kf-dlg [data-novo-serv]'); await t('.kf-dlg [data-it-obj="tomada 10 A"]'); await t('.kf-dlg [data-it-min="30"]');
  assert.equal(await p.inputValue('#it-n'), 'Instalação de tomada 10 A'); assert.equal((await p.locator('.kf-dlg [data-salvar]').innerText()).trim(), 'Salvar e somar');
  await t('.kf-dlg [data-salvar]'); await p.locator('#so-q').waitFor();
  assert.equal(toques, 4, 'criar e somar um serviço novo: 4 toques dentro de Somar serviço');
  const idT = await p.evaluate(() => precos.find(x => x.nome === 'Instalação de tomada 10 A').id);
  assert.match(await p.locator('#so-conta').innerText(), /1 item no documento · R\$\s60,00/);
  for (let i = 0; i < 2; i++) await p.click(`.kf-dlg [data-soma="${idT}"]`);
  assert.match(await p.locator('#so-conta').innerText(), /3 itens no documento · R\$\s180,00/);
  await p.click(`.kf-dlg [data-tira="${idT}"]`); assert.match(await p.locator('#so-conta').innerText(), /2 itens .* R\$\s120,00/);
  await p.click(`.kf-dlg [data-soma="${idT}"]`);
  // pela busca: o banco sugere o que você ainda não tem
  await p.fill('#so-q', 'chuveiro'); assert.match(await p.locator('#so-corpo').innerText(), /Criar a partir do banco\s+Instalação de chuveiro/);
  await p.click('.kf-dlg [data-sug]'); assert.equal(await p.inputValue('#it-n'), 'Instalação de chuveiro'); await p.click('.kf-dlg [data-it-min="60"]'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#so-q').waitFor(); assert.equal(await p.inputValue('#so-q'), '', 'a busca recomeça');
  await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal(await p.locator('#conteudo .itens .item').count(), 2);
  assert.deepEqual(await pe(p), { rotulo: 'Enviar', total: 'R$ 300,00', que: 'Total' });
  assert.deepEqual(await p.evaluate(() => precos.map(x => [x.cat, x.nome, x.acao, x.obj, x.min, precoDe(x)])), [['c-tomadas', 'Instalação de tomada 10 A', 'instalacao', 'tomada 10 A', 30, 6000], ['c-aparelhos', 'Instalação de chuveiro', 'instalacao', 'chuveiro', 60, 12000]], 'os dois ficaram nos Preços');
  // a linha: quantidade no passo a passo e preço em centavos ("1290" = R$ 12,90)
  await p.locator('#conteudo .itens .item').first().click(); await p.locator('#ln-p').waitFor();
  assert.equal(await semCampoEmFoco(p), true);
  await digitar(p, '#ln-p', '1290'); assert.match(await p.inputValue('#ln-p'), /R\$\s12,90/);
  await p.click('.kf-dlg [data-kf-passo="1"]'); await p.click('.kf-dlg [data-salvar]');
  assert.equal((await pe(p)).total, 'R$ 171,60', '4 × 12,90 + 120,00');
  assert.equal(await p.evaluate(id => precoDe(precos.find(x => x.id === id)), idT), 6000, 'mudar a linha não muda a lista de preços');
  // desconto: em porcentagem, de 0 a 100, com nome
  await cond(p, 'desc'); await p.locator('#cd-dp').waitFor();
  await p.fill('#cd-dp', '150'); await p.click('.kf-dlg [data-salvar]');
  assert.equal(await p.getAttribute('#cd-dp', 'aria-invalid'), 'true'); assert.equal((await aqui(p)).descPct, 0);
  await p.fill('#cd-dn', 'Desconto de amigo'); await p.click('.kf-dlg [data-dp="25"]');
  assert.match(await p.locator('.kf-dlg .resumo').innerText(), /Valor do serviço\s+R\$\s171,60[\s\S]*Desconto de amigo \(25%\)\s+− R\$\s42,90[\s\S]*Total\s+R\$\s128,70/);
  await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal((await pe(p)).total, 'R$ 128,70');
  // pagamento com entrada
  await cond(p, 'pag'); await p.click('.kf-dlg [data-pag="entrada"]'); await p.click('.kf-dlg [data-ep="40"]');
  assert.match(await p.locator('.kf-dlg [role="status"]').innerText(), /Entrada de 40% \(R\$\s51,48\) na aprovação e R\$\s77,22 na conclusão/);
  await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  // enviar: sem o início e o prazo do serviço, o orçamento não sai (CDC, art. 40)
  await p.click('#pe-doc [data-prox="enviar"]'); await p.locator('#cd-i').waitFor({ state: 'attached' });
  assert.equal((await aqui(p)).etapa, 'rascunho');
  await p.evaluate(() => { const e = document.querySelector('#cd-i'); e.value = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10); e.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.click('.kf-dlg [data-pz="2"]');
  assert.match(await p.locator('.kf-dlg [role="status"]').innerText(), /Início previsto em \d\d\/\d\d\/\d{4} e término até \d\d\/\d\d\/\d{4} \(2 dias de serviço\)/);
  await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  await p.click('#pe-doc [data-prox="enviar"]'); await p.locator('#ev-nome').waitFor();
  assert.equal(await semCampoEmFoco(p), true);
  assert.equal(await p.inputValue('#ev-nome'), 'Mariana Souza', 'o nome do cliente já vem do começo');
  await p.click('.kf-dlg [data-ja]');
  assert.ok(await esperar(async () => (await aqui(p)).etapa === 'enviado'));
  assert.equal((await pe(p)).rotulo, 'Aprovou');
  assert.match(await p.evaluate(() => linkWhats(getDoc(rota().id).cliente.fone, 'oi')), /^https:\/\/wa\.me\/5511988887777\?text=oi$/);
  await p.click('#pe-doc [data-prox="aprovou"]');
  assert.equal((await aqui(p)).etapa, 'aprovado'); assert.equal((await pe(p)).rotulo, 'Receber');
  assert.equal(await p.locator('.kf-toast .kf-toast-acao').innerText(), 'Desfazer');
  // receber: primeiro a entrada, depois o restante; valor maior que o que falta é recusado
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('#pe-doc [data-prox="receber"]'); await p.locator('#rc-v').waitFor();
  assert.match(await p.inputValue('#rc-v'), /R\$\s51,48/, 'o valor sugerido é a entrada');
  await digitar(p, '#rc-v', '99999'); await p.click('.kf-dlg [data-recebi]');
  assert.equal(await p.getAttribute('#rc-v', 'aria-invalid'), 'true'); assert.equal((await aqui(p)).pagos.length, 0);
  await digitar(p, '#rc-v', '5148'); await p.click('.kf-dlg [data-recebi]');
  assert.ok(await esperar(async () => (await aqui(p)).pagos.length === 1));
  assert.deepEqual(await pe(p).then(x => [x.rotulo, x.que, x.total]), ['Receber', 'Falta receber', 'R$ 77,22']);
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('#pe-doc [data-prox="receber"]'); await p.locator('#rc-v').waitFor();
  assert.match(await p.inputValue('#rc-v'), /R\$\s77,22/);
  await p.click('.kf-dlg [data-meio="Dinheiro"]'); await p.click('.kf-dlg [data-recebi]');
  assert.ok(await esperar(async () => (await aqui(p)).etapa === 'recebido'));
  assert.deepEqual((await aqui(p)).pagos.map(x => [x.v, x.meio]), [[5148, 'Pix'], [7722, 'Dinheiro']]);
  assert.equal((await pe(p)).rotulo, 'Enviar recibo');
  // recibo: um por pagamento
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('#pe-doc [data-prox="recibo"]'); await p.locator('.kf-dlg [data-pg]').first().waitFor();
  assert.equal(await p.locator('.kf-dlg [data-pg]').count(), 2);
  assert.match(await p.evaluate(() => { const d = getDoc(rota().id); return mensagemRecibo(d, d.pagos[0]); }), /Olá, Mariana![\s\S]*Recebi R\$\s51,48 \(pix\)/);
  await fecharJanela(p);
  // voltar uma etapa tira os recebimentos, e Desfazer devolve
  await p.click('#pe-doc [data-menu]'); await p.click('.kf-dlg [data-m="volta"]');
  assert.deepEqual(await aqui(p).then(d => [d.etapa, d.pagos.length]), ['aprovado', 0]);
  await p.click('.kf-toast .kf-toast-acao');
  assert.deepEqual(await aqui(p).then(d => [d.etapa, d.pagos.length]), ['recebido', 2]);
  // o Início: nada em andamento, e o recebido do mês
  await p.evaluate(() => ir('/', true));
  assert.match(await p.locator('.painel').innerText(), /Recebido neste mês\s+R\$\s128,70/);
  assert.equal(await p.locator('#conteudo .docs .doc').count(), 0);
  await p.evaluate(() => ir('/docs', true)); assert.equal(await p.locator('#dc-lista .doc').count(), 1);
  await p.fill('#dc-q', 'ninguém'); assert.equal(await p.locator('#dc-lista .doc').count(), 0);
  await p.fill('#dc-q', 'mariana'); assert.equal(await p.locator('#dc-lista .doc').count(), 1);
  // o orçamento seguinte: nada é pedido de novo, e o serviço criado antes já está lá, com o preço; somar é um toque
  await p.click('#kf-nav-novo'); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click(); await cliente(p, 'João Lima');
  toques = 0; await t('#pe-doc [data-prox]'); await p.locator('#so-q').waitFor();
  assert.match(await p.locator('#so-corpo').innerText(), /Seus serviços · 2[\s\S]*Instalação de tomada 10 A\s+R\$\s60,00 por unidade · 30 min/);
  await t(`.kf-dlg [data-soma="${idT}"]`); await t('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal(toques, 3, 'somar um serviço já salvo: abrir, +, fechar');
  assert.equal((await pe(p)).total, 'R$ 60,00');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('relatório: cobra o que já foi feito; três etapas, sem entrada e sem Aprovou; linha avulsa; documento vazio some ao sair', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await novoPelaBarra(p, 'rel');
  assert.deepEqual(await p.evaluate(() => ETAPAS.rel.map(e => NOME_ETAPA[e])), ['Rascunho', 'Enviado', 'Recebido']);
  assert.equal(await p.locator('#conteudo .tr-passos').count(), 0, 'a trilha das etapas só aparece depois de enviar');
  await p.click('#conteudo [data-cond]'); assert.equal(await p.locator('.kf-dlg [data-j="feito"]').count(), 1); assert.equal(await p.locator('.kf-dlg [data-j="validade"]').count(), 0); await fecharJanela(p);
  await cond(p, 'pag'); assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-dlg [data-pag]')].map(b => b.dataset.pag)), ['vista', 'combinar']); await fecharJanela(p);
  await cond(p, 'feito'); await p.locator('.kf-dlg').waitFor();
  assert.equal(await p.locator('.kf-dlg input[type="date"]:not([hidden])').count(), 0, 'o calendário é o do Kit, não o do sistema'); await fecharJanela(p);
  await p.click('#conteudo [data-somar], #pe-doc [data-prox="somar"]'); await p.click('.kf-dlg [data-avulsa]'); await p.locator('#ln-n').waitFor();
  await p.click('.kf-dlg [data-salvar]'); assert.equal(await p.getAttribute('#ln-n', 'aria-invalid'), 'true');
  await p.fill('#ln-n', 'Troca da fiação do banheiro'); await digitar(p, '#ln-p', '35000'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#conteudo .itens .item').waitFor();
  assert.equal((await pe(p)).total, 'R$ 350,00');
  await p.click('#pe-doc [data-prox="enviar"]'); await p.fill('#ev-nome', 'João Lima'); await p.click('.kf-dlg [data-ja]');
  assert.ok(await esperar(async () => (await aqui(p)).etapa === 'enviado'));
  assert.equal((await pe(p)).rotulo, 'Receber', 'no relatório, depois de enviar vem receber');
  assert.match(await p.evaluate(() => mensagem(getDoc(rota().id))), /Olá, João![\s\S]*relatório do serviço executado em[\s\S]*• 1 un\. · Troca da fiação do banheiro: R\$\s350,00[\s\S]*\*Total: R\$\s350,00\*[\s\S]*Pagamento à vista\./);
  assert.equal(await p.evaluate(() => painel().receber), 35000, 'relatório enviado entra em Para receber');
  // documento novo só com o cliente não some ao sair: o nome, o telefone e o endereço já foram escritos
  const antes = await p.evaluate(() => [docs.length, ajustes.seq]);
  await p.evaluate(() => { fecharJanela(true); ir('/', true); irPara('novo'); }); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click(); await cliente(p);
  assert.equal(await p.evaluate(() => ajustes.seq), antes[1] + 1);
  await p.click('.barra-app [data-voltar]'); await pronto(p);
  assert.deepEqual(await p.evaluate(() => [docs.length, ajustes.seq]), [antes[0] + 1, antes[1] + 1]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Preços: começa vazia; Novo serviço pelo objeto e pela ação, pelo tempo ou em reais; material; busca, filtro, categoria nova e excluir com Desfazer', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await p.evaluate(() => ir('/precos', true)); await p.locator('#conteudo .hora-pn').waitFor();
  // sem nenhum preço de fábrica: a tabela começa vazia e diz como começar
  assert.equal(await p.locator('#conteudo .prc-sec').count(), 0); assert.match(await p.locator('#conteudo').innerText(), /Sua tabela começa vazia/);
  assert.match(await p.locator('#conteudo .hora-pn').innerText(), /Sem valor/);
  // o primeiro preço pede a hora antes
  await p.click('#conteudo [data-novo-preco]'); await p.locator('#hr-v').waitFor(); await digitar(p, '#hr-v', '12000'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#it-corpo').waitFor(); assert.equal(await semCampoEmFoco(p), true);
  await p.click('.kf-dlg [data-salvar]'); assert.equal(await p.getAttribute('#it-n', 'aria-invalid'), 'true', 'sem objeto nem nome, não salva');
  // categoria, objeto (a ação mais comum vem marcada), o tempo; o nome se monta
  await p.click('.kf-dlg [data-it-cat="c-quadro"]'); await p.click('.kf-dlg [data-it-obj="disjuntor geral"]');
  assert.equal(await p.getAttribute('.kf-dlg [data-it-acao="troca"]', 'aria-pressed'), 'true'); assert.equal(await p.inputValue('#it-n'), 'Troca de disjuntor geral');
  await p.click('.kf-dlg [data-salvar]'); assert.equal(await p.locator('#it-corpo').count(), 1, 'sem o tempo, não salva');
  await p.click('.kf-dlg [data-it-min="30"]'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  const idDj = await p.evaluate(() => precos[0].id);
  assert.match(await p.locator(`#conteudo [data-preco="${idDj}"]`).innerText(), /Troca de disjuntor geral\s+30 min · por unidade\s+R\$\s60,00/);
  // trocar a ação tira o nome montado e põe o novo; tocar de novo na ação a tira
  await p.click('#conteudo [data-novo-preco]'); await p.click('.kf-dlg [data-it-cat="c-quadro"]'); await p.click('.kf-dlg [data-it-obj="DR"]');
  assert.equal(await p.inputValue('#it-n'), 'Instalação de DR'); await p.click('.kf-dlg [data-it-acao="troca"]'); assert.equal(await p.inputValue('#it-n'), 'Troca de DR');
  await p.click('.kf-dlg [data-it-acao="troca"]'); assert.equal(await p.inputValue('#it-n'), 'DR'); await p.click('.kf-dlg [data-it-acao="instalacao"]');
  await p.click('.kf-dlg [data-it-min="x"]'); await p.evaluate(() => { const e = document.querySelector('#it-t'); e.value = '75'; e.dispatchEvent(new Event('change', { bubbles: true })); });
  assert.match(await p.locator('#it-corpo [role="status"]').innerText(), /1h15 × R\$\s120,00 a hora = R\$\s150,00/);
  await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  // o mesmo nome na mesma categoria não entra duas vezes
  await p.click('#conteudo [data-novo-preco]'); await p.click('.kf-dlg [data-it-cat="c-quadro"]'); await p.click('.kf-dlg [data-it-obj="DR"]'); await p.click('.kf-dlg [data-it-min="60"]'); await p.click('.kf-dlg [data-salvar]');
  assert.equal(await p.getAttribute('#it-n', 'aria-invalid'), 'true'); assert.match(await p.locator('.kf-toast').innerText(), /Você já tem "Instalação de DR"/); await fecharJanela(p);
  // editar: em reais, o preço fica fixo, em centavos ("8550" = R$ 85,50)
  await p.click(`#conteudo [data-preco="${idDj}"]`); await p.locator('#it-corpo').waitFor(); assert.equal(await semCampoEmFoco(p), true);
  await p.click('.kf-dlg [data-it-modo="reais"]'); assert.match(await p.inputValue('#it-p'), /R\$\s60,00/, 'o preço do tempo vem para o campo');
  await digitar(p, '#it-p', '8550'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.deepEqual(await p.evaluate(id => { const x = precos.find(y => y.id === id); return [x.fixo, precoDe(x)]; }, idDj), [true, 8550]);
  // a hora muda: o que foi dado pelo tempo acompanha, o fixo fica
  await p.click('#conteudo [data-hora]'); await p.locator('#hr-v').waitFor(); await digitar(p, '#hr-v', '15000'); await p.click('.kf-dlg [data-salvar]');
  assert.match(await p.locator('#conteudo .prc-sec[data-sec="c-quadro"]').innerText(), /Troca de disjuntor geral\s+fixo\s+· por unidade\s+R\$\s85,50[\s\S]*Instalação de DR\s+1h15 · por unidade\s+R\$\s187,50/);
  await p.evaluate(() => { ajustes.hora = 12000; salvarAjustes(); redesenhar(); });
  // material: só em reais; a unidade vem do banco
  await p.click('#conteudo [data-novo-preco]'); await p.click('.kf-dlg [data-it-cat="c-materiais"]'); assert.equal(await p.locator('.kf-dlg [data-it-modo]').count(), 0);
  await p.click('.kf-dlg [data-it-obj="Cabo flexível 2,5 mm²"]'); assert.equal(await p.inputValue('#it-u'), 'm');
  await digitar(p, '#it-p', '350'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal(await p.evaluate(() => document.querySelector('#conteudo .prc-sec:last-of-type').dataset.sec), 'c-materiais', 'o material fica no fim');
  assert.match(await p.locator('#conteudo .prc-sec[data-sec="c-materiais"]').innerText(), /Cabo flexível 2,5 mm²\s+fixo\s+· por metro\s+R\$\s3,50/);
  // busca sem acento e filtro
  await p.fill('#pr-q', 'disjuntor geral'); assert.equal(await p.locator('#conteudo [data-preco]:visible').count(), 1); assert.match(await p.locator('#pr-st').innerText(), /1 item/);
  await p.fill('#pr-q', 'xyz'); await p.locator('#pr-nada').waitFor(); await p.fill('#pr-q', '');
  await p.click('#conteudo [data-fcat="c-quadro"]'); assert.equal(await p.locator('#conteudo [data-preco]:visible').count(), 2);
  // categoria nova: aparece vazia (para poder editar), já filtrada; o item novo nela começa nela, com objeto escrito
  await p.click('#conteudo [data-nova-cat]'); await p.locator('#ct-n').waitFor();
  await p.fill('#ct-n', 'Ar-condicionado'); await p.click('.kf-dlg [data-ic="ar"]'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#conteudo .prc-sec:not([hidden])').waitFor();
  assert.deepEqual(await p.evaluate(() => { const c = cats[cats.length - 1]; return [cats.length, c.nome, c.icone, filtroPreco === c.id]; }), [9, 'Ar-condicionado', 'ar', true], 'a categoria nova já vem filtrada');
  await p.click('#conteudo [data-novo-preco]'); await p.locator('.kf-dlg [data-it-outro]').waitFor();
  assert.equal(await p.evaluate(() => document.querySelector('.kf-dlg [data-it-cat][aria-pressed="true"]').textContent), 'Ar-condicionado');
  await p.click('.kf-dlg [data-it-outro]'); await p.fill('#it-on', 'split'); await p.locator('#it-on').blur(); await p.click('.kf-dlg [data-it-acao="manutencao"]');
  assert.equal(await p.inputValue('#it-n'), 'Manutenção de split'); await p.click('.kf-dlg [data-it-min="90"]'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#conteudo [data-preco]:visible').first().waitFor();
  // excluir a categoria leva os itens dela; Desfazer devolve tudo
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('#conteudo .prc-sec:not([hidden]) [data-editar-cat]'); await p.click('.kf-dlg [data-tirar]');
  assert.match(await p.locator('.kf-dlg').innerText(), /O preço dela também sai da sua lista[\s\S]*Dá para desfazer logo depois/);
  await p.click('.kf-dlg [data-kf-ok]');
  assert.ok(await esperar(() => p.evaluate(() => rota().nome === 'precos')));
  assert.deepEqual(await p.evaluate(() => [cats.length, precos.some(x => x.nome === 'Manutenção de split')]), [8, false]);
  await p.click('.kf-toast .kf-toast-acao');
  assert.deepEqual(await p.evaluate(() => [cats.length, precos.some(x => x.nome === 'Manutenção de split')]), [9, true]);
  // excluir um item, com Desfazer
  await p.evaluate(() => { filtroPreco = 'todas'; redesenhar(); document.querySelector('.kf-toast').hidden = true; });
  await p.click(`#conteudo [data-preco="${idDj}"]`); await p.click('.kf-dlg [data-tirar]'); await p.click('.kf-dlg [data-kf-ok]');
  assert.ok(await esperar(() => p.evaluate(id => !precos.some(x => x.id === id), idDj)));
  await p.click('.kf-toast .kf-toast-acao'); assert.equal(await p.evaluate(id => precos.some(x => x.id === id), idDj), true);
  // o preço vale para os documentos seguintes
  await novoPelaBarra(p, 'orc'); await p.click('#conteudo [data-somar], #pe-doc [data-prox="somar"]'); await p.click(`.kf-dlg [data-soma="${idDj}"]`);
  assert.equal((await aqui(p)).linhas[0].pu, 8550);
  assert.equal(await p.evaluate(id => ajustes.usos[id], idDj), 1, 'o que você usa sobe para o alto');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

/* um jsPDF de mentira, que só anota os textos: assim o teste lê o que sai no documento, sem internet */
const PDF_FALSO = () => {
  class F {
    constructor() { this.t = []; this.pg = 1; window.__pdf = this; }
    text(s) { this.t.push(String(s)); } splitTextToSize(s) { return String(s).split('\n'); }
    addPage() { this.pg++; } getNumberOfPages() { return this.pg; } output() { return new Blob(['%PDF-falso'], { type: 'application/pdf' }); }
  }
  for (const m of ['setFont', 'setFontSize', 'setTextColor', 'setFillColor', 'setDrawColor', 'setLineWidth', 'rect', 'roundedRect', 'line', 'lines', 'addImage', 'setPage']) F.prototype[m] = function () {};
  window.jspdf = { jsPDF: F };
};
test('documentos: o PDF do orçamento e do relatório, o recibo, o código do Pix (QR code, sem o símbolo do Pix) e a cópia de segurança', async () => {
  const a = await aparelho(amb, { antes: PDF_FALSO }); const p = a.page; await pronto(p);
  const r = await p.evaluate(async () => {
    Object.assign(ajustes, { nome: 'Carlos Pereira', fone: '11987654321', cidade: 'São Paulo', pix: 'carlos@exemplo.com.br' }); salvarAjustes();
    const d = criarExemplo(); d.exemplo = false; d.num = 7; d.desc = 4000; d.etapa = 'enviado'; d.enviadoEm = new Date('2026-11-20T12:00').getTime();
    const o = {};
    await montarPDF(d); o.orc = window.__pdf.t.join('\n');
    const rel = acertaDoc({ ...clone(d), tipo: 'rel', id: 'r1', num: 8, feito: new Date('2026-11-18T12:00').getTime() }); docs.push(rel);
    await montarPDF(rel); o.rel = window.__pdf.t.join('\n');
    const pg = { id: 'p', v: 55000, em: new Date('2026-11-21T12:00').getTime(), meio: 'Pix' };
    await montarRecibo(d, pg); o.rec = window.__pdf.t.join('\n');
    o.pix = codigoPix(55000); ajustes.pix = ''; o.semPix = codigoPix(55000); ajustes.pix = 'carlos@exemplo.com.br';
    o.arq = [nomeArquivo('Orcamento', d), nomeArquivo('Recibo', rel)];
    o.icones = [/<rect width="5" height="5" x="3" y="3" rx="1"\/>/.test(IC.qr), Object.keys(IC).some(k => /pix/i.test(k))];
    return o;
  });
  for (const t of ['ORÇAMENTO', 'Nº 0007', '20/11/2026', 'Carlos Pereira', '(11) 98765-4321', 'Mariana Souza', 'Reforma elétrica da cozinha', 'Ponto novo de tomada 10 A', '6 pontos', 'Valor do serviço', '- R$ 40,00', 'TOTAL', 'R$ 1.100,00', 'Entrada de 50% (R$ 550,00) na aprovação e R$ 550,00 na conclusão do serviço.', 'Este orçamento vale até 30/11/2026.', 'PAGUE COM PIX', 'R$ 550,00', 'De acordo: Mariana Souza', 'Material por conta do cliente.'])
    assert.ok(r.orc.replace(/ /g, ' ').includes(t), `o PDF do orçamento sem "${t}"`);
  // CDC: garantia legal sempre, datas de início e término, mão de obra e material discriminados, o orçamento obriga (art. 40, § 2º)
  const orcTx = r.orc.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ');
  for (const t of ['Garantia legal de 90 dias', 'art. 26, II', 'Início previsto em', 'Mão de obra', 'Material', 'não incluído', 'obriga as duas partes', 'art. 40, § 2º', 'art. 14, § 3º, II']) assert.ok(orcTx.includes(t), `o PDF do orçamento sem "${t}"`);
  assert.ok(!/Sem garantia|Não cobre/.test(orcTx), 'nada de garantia menor que a da lei');
  assert.ok(r.rel.replace(/\s+/g, ' ').includes('Garantia legal de 90 dias'), 'o relatório também traz a garantia da lei');
  for (const t of ['RELATÓRIO DE SERVIÇO', 'Nº 0008', 'Executado em 18/11/2026', 'Pagamento à vista.', 'R$ 1.100,00']) assert.ok(r.rel.replace(/ /g, ' ').includes(t), `o PDF do relatório sem "${t}"`);
  assert.ok(!/vale até|De acordo/.test(r.rel), 'o relatório não tem validade nem "de acordo"');
  for (const t of ['RECIBO', 'R$ 550,00', 'quinhentos e cinquenta reais', 'Recebi de Mariana Souza', 'Forma de pagamento: Pix.', 'São Paulo, 21 de novembro de 2026.']) assert.ok(r.rec.replace(/ /g, ' ').includes(t), `o recibo sem "${t}"`);
  assert.match(r.pix, /^000201.*br\.gov\.bcb\.pix0121carlos@exemplo\.com\.br.*5406550\.00.*5802BR5914CARLOS PEREIRA6009SAO PAULO.*6304[0-9A-F]{4}$/);
  assert.equal(r.semPix, '', 'sem chave, não há código');
  assert.deepEqual(r.arq, ['Orcamento-0007-mariana-souza.pdf', 'Recibo-0008-mariana-souza.pdf']);
  assert.deepEqual(r.icones, [true, false], 'onde há Pix, o ícone é um QR code');
  // cópia de segurança: baixa no formato da família e restaura por cima; cópia de versão anterior é recusada
  await comHora(p);
  const copia = await p.evaluate(() => JSON.stringify(KitFacil.copia.envelope({ ajustes, cats, precos, docs: docs.filter(d => !d.exemplo) }, 4)));
  await p.evaluate(() => { docs = []; precos = precos.slice(0, 3); salvarDocs(); salvarPrecos(); });
  await p.evaluate(j => restaurarCopia(new File([j], 'copia.json', { type: 'application/json' })), copia);
  await p.locator('.kf-dlg [data-kf-ok]').click();
  assert.deepEqual(await p.evaluate(() => [docs.length, precos.length, ajustes.seq >= 8, ajustes.nome]), [2, 11, true, 'Carlos Pereira']);
  await p.evaluate(j => restaurarCopia(new File([JSON.stringify({ ...JSON.parse(j), esquema: 2 })], 'velha.json')), copia);
  assert.match(await p.locator('.kf-toast').innerText(), /versão anterior/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('sincronização: arquivo novo na nuvem (o da versão 3 não é tocado), conteúdo criptografado, e dois aparelhos se juntam', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh }), B = await aparelho(amb, { github: gh });
  const criar = (p, nome) => p.evaluate(nome => { const d = acertaDoc({ tipo: 'orc', cliente: { nome }, linhas: [{ nome: 'Troca de tomada', un: 'un', q: 1, pu: 15000 }] }); d.num = ++ajustes.seq; docs.push(d); salvarAjustes(); salvarDocs(); desenhar(); return d.id; }, nome);
  await pronto(A.page); await pronto(B.page);
  const idA = await criar(A.page, 'Cliente do A');
  assert.equal(await A.page.evaluate(t => SY.conectar(t), TOKEN_TESTE), true);
  assert.ok(await esperar(() => A.page.evaluate(() => SY.ligada() && sinc.lastSync > 0)), 'A não sincronizou');
  assert.ok(gh.arquivo('eletrica-facil-4.json'), 'o arquivo novo na nuvem');
  assert.ok(!gh.arquivo('eletrica-facil-3.json') && !gh.arquivo('eletrica-facil.json'), 'os arquivos das versões anteriores não são tocados');
  assert.ok(!/Cliente do A/.test(gh.arquivo('eletrica-facil-4.json').conteudo), 'o conteúdo vai criptografado');
  await criar(B.page, 'Cliente do B');
  assert.equal(await B.page.evaluate(t => SY.conectar(t), TOKEN_TESTE), true);
  assert.ok(await esperar(() => B.page.evaluate(() => docs.length === 2)), 'B não recebeu o documento do A');
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => docs.map(d => d.cliente.nome).sort()), ['Cliente do A', 'Cliente do B']);
  assert.deepEqual(await A.page.evaluate(() => docs.map(d => d.num).sort()), [1, 2], 'números repetidos são refeitos');
  // um serviço criado no A, um preço mudado no A e um documento excluído no A chegam ao B
  await A.page.evaluate(id => { precos.push(acertaPreco({ id: 'meu-a', cat: 'c-quadro', nome: 'Troca de DR', un: 'un', fixo: true, preco: 9000, acao: 'troca', obj: 'DR' })); salvarPrecos(); return SY.agora({ quiet: true }); }, idA);
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  await A.page.evaluate(id => { precos.find(x => x.id === 'meu-a').preco = 14000; salvarPrecos(); docs = docs.filter(d => d.id !== id); salvarDocs(); return SY.agora({ quiet: true }); }, idA);
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await B.page.evaluate(() => [precos.map(x => [x.nome, x.preco]), docs.map(d => d.cliente.nome)]), [[['Troca de DR', 14000]], ['Cliente do B']]);
  assert.deepEqual([...A.erros, ...B.erros], []);
  await A.fechar(); await B.fechar();
});

test('Ajustes: as oito guias comuns e as do app; os dados dos documentos, a chave Pix, o padrão do documento novo e o raio', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await p.evaluate(() => { location.hash = '#/ajustes'; }); await p.locator('[data-kf-aj]').waitFor();
  const guias = await guiasAjustes(p);
  assert.deepEqual(guias.comuns, GUIAS_COMUNS);
  assert.deepEqual(guias.produto, ['Cobrança', 'Pix', 'Documento novo', 'Raio e apresentação']);
  // Cobrança: deslocamento nas duas formas, mínimo por ida e as porcentagens da condição
  await p.evaluate(() => KitFacil.ajustes.abrir('cobranca')); await p.click('[data-aj-dm="km"]'); await p.locator('#aj-deslKm').waitFor();
  await digitar(p, '#aj-deslKm', '250'); await digitar(p, '#aj-minIda', '10000'); await p.fill('#aj-cond1', '30'); await p.locator('#aj-cond1').blur();
  assert.deepEqual(await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('eletricafacil.ajustes')); return [s.deslModo, s.deslKm, s.minIda, s.cond1, s.cond2]; }), ['km', 250, 10000, 30, 50]);
  await p.evaluate(() => history.back()); await p.waitForTimeout(200);
  await p.evaluate(() => KitFacil.ajustes.abrir('conta')); await p.fill('#aj-nome', 'Carlos Pereira'); await p.fill('#aj-fone', '11987654321'); await p.locator('#aj-fone').blur();
  assert.deepEqual(await p.evaluate(() => [ajustes.nome, document.querySelector('#aj-fone').value, JSON.parse(localStorage.getItem('eletricafacil.ajustes')).nome]), ['Carlos Pereira', '(11) 98765-4321', 'Carlos Pereira']);
  await p.evaluate(() => KitFacil.ajustes.abrir('pix')); await p.fill('#aj-pix', ' Carlos@Exemplo.com.br '); await p.locator('#aj-pix').blur();
  assert.equal(await p.evaluate(() => ajustes.pix), 'carlos@exemplo.com.br', 'a chave fica do jeito que o Banco Central espera');
  await p.evaluate(() => KitFacil.ajustes.abrir('padrao')); await p.click('[data-aj-val="30"]'); await p.click('[data-aj-pag="entrada"]'); await p.click('[data-aj-ep="30"]'); await p.click('[data-aj-gar="0"]');
  assert.deepEqual(await p.evaluate(() => [ajustes.validade, ajustes.pag, ajustes.entradaPct, ajustes.garAd]), [30, 'entrada', 30, 0]);
  await novoPelaBarra(p, 'orc');
  assert.deepEqual(await aqui(p).then(d => [d.validade, d.pag, d.entradaPct, d.garAd]), [30, 'entrada', 30, 0], 'o documento novo começa com o padrão');
  await p.evaluate(() => { ir('/ajustes', true); KitFacil.ajustes.abrir('raio'); });
  await p.locator('#aj-raio').evaluate(el => el.click());
  assert.deepEqual(await p.evaluate(() => [ajustes.raio, Raio.ligado()]), [false, false]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('primeiro uso completo: quatro telas de apresentação, depois os seus dados e a sua hora; o primeiro orçamento já soma sem pedir nada', async () => {
  const a = await aparelho(amb, { antes: () => { window.EF_TESTE_ABERTURA = true; } }); const p = a.page;
  await p.locator('.kf-abertura').waitFor();
  const titulos = [];
  for (let k = 0; k < 4; k++) {
    titulos.push(await p.locator('.kf-abertura .kf-ab-t').innerText());
    if (k === 1) { const antes = await p.locator('.ab-conta').innerText(); await p.click('[data-ab-soma="3"]'); assert.notEqual(await p.locator('.ab-conta').innerText(), antes, 'o toque no bloco muda a conta'); assert.match(await p.locator('.ab-conta').innerText(), /2 serviços[\s\S]*R\$\s175,00/); }
    assert.equal(await p.locator('.kf-abertura button:visible', { hasText: 'Pular' }).count(), k < 3 ? 1 : 0, `Pular na tela ${k + 1}`);
    await p.click('#kf-ab-prox');
  }
  assert.deepEqual(titulos.map(t => t.replace(/\s+/g, ' ')), ['Orçamento de elétrica, do pedido ao recibo', 'Some os serviços com um toque', 'O botão do pé é o próximo passo', 'Orçamento antes, relatório depois']);
  // o cadastro: os seus dados (nome e WhatsApp obrigatórios para continuar; o resto, se quiser), com Pular
  const cad = p.locator('.kf-abertura.ab-cadastro'); await cad.locator('#ab-nome').waitFor();
  assert.equal(await cad.locator('.kf-ab-t').innerText(), 'Seus dados na proposta'); assert.equal(await semCampoEmFoco(p), true);
  assert.equal(await cad.locator('#kf-ab-pular:visible').count(), 1, 'Pular nos dados');
  await cad.locator('#kf-ab-prox').click(); assert.equal(await p.getAttribute('#ab-nome', 'aria-invalid'), 'true', 'sem o nome, não continua');
  assert.equal(await cad.locator('.kf-ab-t').innerText(), 'Seus dados na proposta');
  await p.fill('#ab-nome', 'Carlos Pereira'); await p.fill('#ab-fone', '11987654321'); await p.fill('#ab-cidade', 'São Paulo'); await cad.locator('#kf-ab-prox').click();
  // a hora: digitar ou descobrir pela conta do mês; "Pular por agora" no lugar do Pular
  await cad.locator('#ab-hv').waitFor(); assert.equal(await cad.locator('.kf-ab-t').innerText(), 'Quanto vale a sua hora?');
  assert.equal(await cad.locator('#kf-ab-ex:visible').innerText(), 'Pular por agora'); assert.equal(await cad.locator('#kf-ab-prox').innerText(), 'Começar');
  await cad.locator('#kf-ab-prox').click(); assert.equal(await p.getAttribute('#ab-hv', 'aria-invalid'), 'true', 'sem a hora, Começar não fecha');
  await p.click('[data-ab-hm="conta"]'); await digitar(p, '#ab-ht', '600000'); await digitar(p, '#ab-hc', '120000'); await p.fill('#ab-hh', '60');
  assert.match(await p.locator('#ab-hr').innerText(), /R\$\s120,00/);
  await cad.locator('#kf-ab-prox').click(); await p.locator('.kf-abertura:not(.kf-sai)').waitFor({ state: 'detached' }); await pronto(p);
  assert.deepEqual(await p.evaluate(() => [ajustes.nome, ajustes.fone, ajustes.cidade, ajustes.hora, ajustes.hHoras, KitFacil.abertura.vista()]), ['Carlos Pereira', '11987654321', 'São Paulo', 12000, 60, true]);
  assert.match(await p.locator('#conteudo').innerText(), /Olá, Carlos/);
  // o primeiro orçamento: só o cliente; Somar abre direto
  await p.click('#kf-nav-novo'); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click(); await cliente(p);
  await p.click('#pe-doc [data-prox]'); await p.locator('#so-q').waitFor(); assert.equal(await p.locator('#el-nome, #hr-v').count(), 0);
  await p.evaluate(() => { fecharJanela(true); ir('/', true); });
  await p.reload(); await pronto(p); await p.waitForTimeout(400);
  assert.equal(await p.locator('.kf-abertura').count(), 0, 'a abertura aparece uma vez só');
  // rever a apresentação, nos Ajustes: só as quatro telas, sem o cadastro
  await p.evaluate(() => aberturaAbrir({ rever: true })); await p.locator('.kf-abertura').waitFor();
  for (let k = 0; k < 4; k++) await p.click('#kf-ab-prox');
  await p.locator('.kf-abertura:not(.kf-sai)').waitFor({ state: 'detached' }); await p.waitForTimeout(700); assert.equal(await p.locator('.kf-abertura').count(), 0, 'rever não pede o cadastro');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('primeiro uso pulado: Pular na apresentação leva ao cadastro; Pular nos dados leva à hora; Pular por agora não grava nada; tudo volta no primeiro orçamento', async () => {
  const a = await aparelho(amb, { antes: () => { window.EF_TESTE_ABERTURA = true; } }); const p = a.page;
  await p.locator('.kf-abertura').waitFor(); await p.click('#kf-ab-pular');
  const cad = p.locator('.kf-abertura.ab-cadastro'); await cad.locator('#ab-nome').waitFor();
  await p.fill('#ab-nome', 'Ca'); await cad.locator('#kf-ab-pular').click(); await cad.locator('#ab-hv').waitFor();
  assert.equal(await cad.locator('.kf-ab-t').innerText(), 'Quanto vale a sua hora?', 'Pular nos dados passa para a hora, sem fechar');
  await cad.locator('#kf-ab-ex').click(); await p.locator('.kf-abertura:not(.kf-sai)').waitFor({ state: 'detached' }); await pronto(p);
  assert.deepEqual(await p.evaluate(() => [ajustes.nome, ajustes.fone, ajustes.hora, dadosOk(), KitFacil.abertura.vista()]), ['Ca', '', 0, false, true], 'o que foi escrito fica; a hora, não');
  // o primeiro orçamento pede o que faltou, antes de somar; o nome escrito na abertura já vem no campo
  await p.click('#kf-nav-novo'); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click(); await cliente(p);
  await p.click('#pe-doc [data-prox]'); await p.locator('#el-nome').waitFor(); assert.equal(await p.inputValue('#el-nome'), 'Ca');
  await p.fill('#el-nome', 'Carla Dias'); await p.fill('#el-fone', '21999998888'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#hr-v').waitFor(); await digitar(p, '#hr-v', '10000'); await p.click('.kf-dlg [data-salvar]'); await p.locator('#so-q').waitFor();
  assert.deepEqual(await p.evaluate(() => [ajustes.nome, ajustes.hora]), ['Carla Dias', 10000]);
  // quem apaga o nome e chega a Enviar recebe o pedido ali
  await p.evaluate(() => { fecharJanela(true); ajustes.nome = ''; salvarAjustes(); const d = getDoc(rota().id); d.linhas.push(acertaLinha({ nome: 'X', q: 1, pu: 1000 })); d.inicio = Date.now(); d.dias = 1; tocarDoc(d); redesenhar(); });
  await p.click('#pe-doc [data-prox="enviar"]'); await p.locator('#el-nome').waitFor();
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('raio: cai sozinho, sem toque na tela; é enfeite (não recebe toque); não cai com janela aberta, desligado ou com movimento reduzido', async () => {
  const a = await aparelho(amb, { antes: () => { window.__raios = 0; document.addEventListener('DOMContentLoaded', () => new MutationObserver(M => M.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('rz')) window.__raios++; }))).observe(document.body, { childList: true, subtree: true })); } });
  const p = a.page; await pronto(p);
  assert.equal(await p.evaluate(() => window.__raios), 0, 'em teste, o raio só cai quando o teste pede');
  await p.evaluate(() => Raio.comecar({ primeiro: 150, entre: [1500, 1600] }));
  assert.ok(await esperar(() => p.evaluate(() => window.__raios === 1), 1500), 'o primeiro raio cai sozinho, sem nenhum toque');
  assert.deepEqual(await p.evaluate(() => { const c = document.querySelector('#raio-cena'); return [getComputedStyle(c).pointerEvents, document.querySelectorAll('#raio-cena .rz-f').length]; }), ['none', 1], 'não recebe toque; um clarão por raio na tela');
  await p.evaluate(() => Raio.ligar(false)); await p.waitForTimeout(2000);
  assert.equal(await p.evaluate(() => window.__raios), 1, 'desligado nos Ajustes, não cai');
  assert.equal(await p.locator('#raio-cena .rz').count(), 0, 'o raio some em pouco mais de um segundo');
  await p.evaluate(() => { Raio.ligar(true); janelaNovo(); }); await p.waitForTimeout(2000);
  assert.equal(await p.evaluate(() => window.__raios), 1, 'com janela aberta, não cai');
  await fecharJanela(p);
  assert.ok(await esperar(() => p.evaluate(() => window.__raios === 2), 2500), 'fechada a janela, volta a cair sozinho');
  await p.waitForTimeout(1400); await p.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await p.evaluate(() => Raio.cair({ forcar: true })), false, 'com movimento reduzido, não há raio');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('guia: um só, do começo ao fim, sem avisos e sem gravar nada', async () => {
  const a = await aparelho(amb, { antes: () => { window.__avisos = []; const w = console.warn; console.warn = (...x) => { window.__avisos.push(x.map(String).join(' ')); w.apply(console, x); }; } });
  const p = a.page; await pronto(p);
  await p.evaluate(() => { const d = acertaDoc({ tipo: 'orc', cliente: { nome: 'Cliente Real' }, linhas: [{ nome: 'x', un: 'un', q: 1, pu: 100 }] }); d.num = ++ajustes.seq; docs.push(d); ajustes.nome = 'Eu Mesmo'; salvarAjustes(); salvarDocs(); desenhar(); });
  const foto = () => p.evaluate(() => JSON.stringify(['docs', 'ajustes', 'precos', 'cats'].map(k => localStorage.getItem('eletricafacil.' + k))));
  const antes = await foto();
  await p.evaluate(() => ir('/mais', true)); await p.click('.kf-mais [data-kf-ir="guia"]');
  assert.ok(await esperar(() => p.evaluate(() => !!KitFacil.guia.estado())));
  assert.deepEqual(await p.evaluate(() => [semSalvar, docs.length, ajustes.nome]), [true, 0, 'Carlos Pereira'], 'a demonstração começa do zero');
  const fim = Date.now() + 300000; let maior = 0;
  while (Date.now() < fim && await p.evaluate(() => !!KitFacil.guia.estado())) {
    const e = await p.evaluate(() => KitFacil.guia.estado()); if (e) maior = Math.max(maior, e.i);
    await p.evaluate(() => { const s = KitFacil.guia.estado(); if (s && !s.rapido && s.fase === 'conta') document.querySelector('#kf-gu-pula').click(); });
    await p.waitForTimeout(100);
  }
  assert.equal(await p.evaluate(() => !!KitFacil.guia.estado()), false, 'o guia não chegou ao fim');
  assert.equal(maior, await p.evaluate(() => GUIA.length - 1), 'o guia passou por todos os passos');
  assert.deepEqual(await p.evaluate(() => window.__avisos.filter(x => /guia/i.test(x))), [], 'algum passo do guia falhou');
  assert.equal(await foto(), antes, 'o guia gravou alguma coisa');
  assert.deepEqual(await p.evaluate(() => [semSalvar, !!dadosReais, docs.length, docs[0].cliente.nome, ajustes.nome, rota().nome]), [false, false, 1, 'Cliente Real', 'Eu Mesmo', 'inicio']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
