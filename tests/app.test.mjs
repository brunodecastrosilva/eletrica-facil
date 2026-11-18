/* Elétrica Fácil 3 · testes do app (npm test). Rodam num Chromium, sem internet: o GitHub (sincronização) e o Firestore
   (avaliações) são simulados por comum/testes/ambiente.mjs. Escritos junto com a refação: seguem a folha, o botão
   amarelo, o quadro por etapa, a Tabela em seções, a Obra, a apresentação, o raio e o guia. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho as aparelhoKit, githubFalso, semRolagemLateral, conferirTopo, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ, semCampoEmFoco } from '../comum/testes/ambiente.mjs';

/* as conquistas ficam desligadas nos testes das contas e das janelas, para a janela da lâmpada não entrar no meio de um
   toque (elas têm o seu teste). A apresentação não aparece em navegador de teste, a não ser quando o teste pede. */
const SEM_CONQUISTAS = `try { localStorage.setItem('eletricafacil.formato', '3'); if (!localStorage.getItem('eletricafacil.jogo')) localStorage.setItem('eletricafacil.jogo', JSON.stringify({ flags: {}, vistas: {}, off: true, pronto: true })); } catch {}`;
const aparelho = (amb, o = {}) => aparelhoKit(amb, { ...o, antes: o.conquistas ? (o.antes ? o.antes : undefined) : (o.antes ? `${SEM_CONQUISTAS}; (${o.antes})();` : SEM_CONQUISTAS) });
let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const fecharJanela = async p => { await p.evaluate(() => KitFacil.dialogo.fechar(true)); await p.waitForTimeout(150); };
const TELAS = [[{ width: 320, height: 568 }, 'celular mínimo'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
/* o orçamento de exemplo do design: os mesmos itens, o mesmo deslocamento e o mesmo pagamento das pranchas */
const EXEMPLO = () => {
  settings.kmPerL = 10; settings.fuelPrice = 619; saveSettings();
  const P = n => prices.find(x => x.name === n);
  const q = blankQuote(); q.num = ++settings.seq; q.title = 'Reforma elétrica da cozinha';
  const add = (n, qty) => { const p = P(n); q.items.push({ id: uid(), kind: p.kind, name: p.name, unit: p.unit, qty, price: p.price, room: '' }); };
  add('Ponto novo de tomada com fiação', 6); add('Instalação de luminária ou plafon', 3); add('Instalação de DR', 1); add('Instalação de chuveiro elétrico', 1);
  add('Caixa 4x2', 6); add('Tomada 10 A com placa', 6); add('Cabo flexível 2,5 mm²', 72); add('Eletroduto corrugado 3/4"', 24); add('DR bipolar 40 A 30 mA', 1);
  q.trip = { km: 12, visits: 2, roundTrip: true, kmPerL: 10, fuelPrice: 619, toll: 0, wearPerKm: 0, minutes: 0, hourRate: 0, minVisit: 0 };
  q.travel = tripCalc(q.trip).total; q.payment.mode = 'entrada'; q.payment.entryPct = 50;
  quotes.unshift(q); saveQuotes(); go('/q/' + q.id, true);
  return q.id;
};

test('abre sem erros em celular, tablet e computador, sem rolagem lateral; topo e navegação nova', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport });
    const p = a.page;
    await p.locator('.page.orc [data-novo]').waitFor();
    assert.equal(await p.evaluate(() => VERSAO), versao, 'a versão do código é a do package.json');
    assert.equal(await p.evaluate(() => route().name), 'home', 'Orçamentos abre o app');
    await conferirTopo(p, { comAjustes: false });
    assert.equal(await semRolagemLateral(p), true, `rolagem lateral em ${nome}`);
    const nomes = await p.evaluate(() => [...document.querySelectorAll(innerWidth >= 1024 ? '.kf-trilho [data-kf-ir]' : '.kf-nav [data-kf-ir]')].filter(b => b.getClientRects().length).map(b => (b.getAttribute('aria-label') || b.textContent).trim()));
    for (const n of ['Orçamentos', 'Tabela', 'Obra', 'Mais']) assert.ok(nomes.some(x => x.includes(n)), `${n} na navegação (${nome}): ${nomes.join(' | ')}`);
    assert.ok(!nomes.some(x => /Início|Gestão/.test(x)), 'Início e Gestão saíram da navegação');
    for (const h of ['#/precos', '#/obra', '#/mais', '#/conquistas', '#/ajustes']) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(120); assert.equal(await semRolagemLateral(p), true, `rolagem lateral em ${h} (${nome})`); }
    await p.evaluate(() => createExample()); await p.locator('#fo-folha .ln').first().waitFor();
    assert.equal(await semRolagemLateral(p), true, `rolagem lateral na folha (${nome})`);
    assert.deepEqual(a.erros, [], `erros no console (${nome})`);
    await a.fechar();
  }
});

test('começo limpo: o que as versões 1 e 2 guardaram é apagado uma vez; o tema fica; dado antigo não trava o app', async () => {
  const a = await aparelho(amb, { antes: () => {
    if (sessionStorage.getItem('ja')) return; sessionStorage.setItem('ja', '1');
    localStorage.removeItem('eletricafacil.formato');
    localStorage.setItem('eletricafacil.quotes', '{"isto":"não é uma lista"');   // lixo de propósito
    localStorage.setItem('eletricafacil.prices', JSON.stringify([{ id: 'velho', kind: 'svc', name: 'Preço antigo', unit: 'un', price: 1 }]));
    localStorage.setItem('eletricafacil.settings', JSON.stringify({ name: 'Nome Antigo', seq: 41 }));
    localStorage.setItem('eletricafacil.sync', JSON.stringify({ token: 'ghp_antigo', gistId: 'abc' }));
    localStorage.setItem('eletricafacil.pref', JSON.stringify({ tema: 'dark' }));
  } });
  const p = a.page;
  await p.locator('.page.orc [data-novo]').waitFor();
  assert.deepEqual(await p.evaluate(() => [quotes.length, settings.name, settings.seq, prices.some(x => x.name === 'Preço antigo'), SY.ligada(), localStorage.getItem('eletricafacil.formato')]), [0, '', 0, false, false, '3']);
  assert.equal(await p.evaluate(() => localStorage.getItem('eletricafacil.pref')), JSON.stringify({ tema: 'dark' }), 'a preferência de tema é do aparelho e fica');
  assert.ok(await p.evaluate(() => prices.length > 300), 'a tabela que vem com o app entra na primeira vez');
  // na segunda abertura nada mais é apagado
  await p.evaluate(() => { settings.name = 'Carlos'; saveSettings(); }); await p.reload(); await p.locator('.page.orc').waitFor();
  assert.equal(await p.evaluate(() => settings.name), 'Carlos');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('a folha: Novo orçamento abre em branco, sem pedir o cliente e sem campo em foco; o vazio some ao sair', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.click('.page.orc [data-novo]');
  await p.locator('#fo-folha [data-add="svc"]').waitFor();
  assert.deepEqual(await p.evaluate(() => [route().name, quotes[0].client.name, quotes[0].num, quotes[0].status]), ['quote', '', 1, 'rascunho']);
  assert.equal(await semCampoEmFoco(p), true, 'a folha abre sem campo em foco');
  assert.equal(await p.locator('#fo-folha input').count(), 0, 'a folha em branco não pede nada (Código, Art. 64-D)');
  assert.match(await p.textContent('#fo-folha'), /Fica em branco até o envio/);
  assert.match(await p.textContent('#fo-visor'), /R\$\s0,00[\s\S]*Enviar/);
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#fo-bd .rs')].map(e => e.className.trim())), ['rs at', 'rs', 'rs', 'rs', 'rs'], 'o trilho começa em Rascunho');
  await p.click('[data-back]');
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'home' && quotes.length === 0)), 'o orçamento vazio é descartado');
  // serviço já feito: nasce como relatório, em Concluído
  await p.click('[data-relatorio]');
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'quote' && getQ(route().id).status === 'concluido')));
  assert.match(await p.textContent('#fo-folha'), /Diagnóstico[\s\S]*Serviços realizados[\s\S]*Testes e verificações[\s\S]*Recomendações/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Somar: a tabela numa janela; cada toque soma um, o pé mostra o total e a busca acha serviço e material', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.click('.page.orc [data-novo]'); await p.click('#fo-folha [data-add="svc"]');
  await p.locator('#mt-lista .sx').first().waitFor();
  assert.equal(await semCampoEmFoco(p), true, 'a janela abre sem campo em foco (Código, Art. 68, § 5º)');
  assert.equal(await p.locator('#mt-lista .sx.ab').count(), 1, 'uma seção aberta de cada vez');
  const linha = p.locator('#mt-lista .mt-row', { hasText: 'Instalação de tomada ou interruptor' });
  await linha.locator('.mt-mais').click(); await linha.locator('.mt-mais').click(); await linha.locator('.mt-mais').click();
  assert.deepEqual(await p.evaluate(() => quotes[0].items.map(i => [i.name, i.qty, i.price])), [['Instalação de tomada ou interruptor', 3, 6000]]);
  assert.match(await p.textContent('#mt-pe'), /R\$\s180,00/);
  assert.match(await p.textContent('#fo-folha'), /Instalação de tomada ou interruptor/, 'a folha atrás acompanha');
  await linha.locator('[data-menos]').click();
  assert.equal(await p.evaluate(() => quotes[0].items[0].qty), 2);
  // abrir outra seção fecha a primeira
  await p.locator('#mt-lista [data-cat]', { hasText: 'Iluminação' }).click();
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#mt-lista .sx.ab .st')].map(b => b.textContent.replace(/\d+/g, '').trim())), ['Iluminação']);
  await p.fill('#mt-q', 'cabo flex'); await p.locator('#mt-lista .mt-row').first().waitFor();
  assert.ok((await p.locator('#mt-lista .mt-row').allTextContents()).every(t => /cabo flex/i.test(t)));
  await p.locator('#mt-lista .mt-row .mt-mais').first().click();
  assert.equal(await p.evaluate(() => quotes[0].items.filter(i => i.kind === 'mat').length), 1, 'a busca soma material também');
  await fecharJanela(p);
  assert.match(await p.textContent('#fo-visor'), /Enviar/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('linha no lugar: quantidade e preço mudam na folha; o campo de valor entra como centavos; guardar na tabela; tirar com Desfazer', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.evaluate(() => { startQuote(null, false); const q = quotes[0], pr = prices.find(x => x.name === 'Instalação de tomada ou interruptor'); q.items.push({ id: uid(), kind: 'svc', name: pr.name, unit: pr.unit, qty: 2, price: pr.price, room: '' }); touch(q); rerender(); });
  await p.click('#fo-folha [data-ln]');
  await p.locator('#fo-folha .ed #ed-p').waitFor();
  assert.equal(await semCampoEmFoco(p), true, 'abrir a linha não põe o cursor em campo nenhum');
  await p.click('[data-edq="1"]'); await p.click('[data-edq="1"]');
  assert.equal(await p.evaluate(() => quotes[0].items[0].qty), 4);
  assert.match(await p.textContent('#fo-visor'), /R\$\s240,00/);
  // "1290" = R$ 12,90 (Regras do app, Art. 15)
  await p.fill('#ed-p', ''); await p.type('#ed-p', '1290');
  assert.equal(await p.inputValue('#ed-p'), 'R$ 12,90');
  assert.equal(await p.evaluate(() => quotes[0].items[0].price), 1290);
  assert.match(await p.textContent('#fo-visor'), /R\$\s51,60/);
  await p.locator('#ed-p').blur();
  await p.locator('[data-ed-guardar]').waitFor();
  assert.match(await p.textContent('#fo-folha .ed .fx'), /vale só nesta proposta[\s\S]*R\$\s60,00/);
  await p.click('[data-ed-guardar]');
  assert.deepEqual(await p.evaluate(() => { const x = prices.find(y => y.name === 'Instalação de tomada ou interruptor'); return [x.price, x.ref]; }), [1290, false], 'o preço novo vai para a tabela e deixa de ser o de fábrica');
  assert.equal(await p.locator('[data-ed-guardar]').count(), 0);
  await p.click('[data-ed-rm]');
  assert.ok(await esperar(() => p.evaluate(() => quotes[0].items.length === 0)));
  await p.click('.kf-toast button');
  assert.ok(await esperar(() => p.evaluate(() => quotes[0].items.length === 1)), 'Desfazer devolve a linha');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('contas: total, entrada, cartão com taxa, imposto por fora, urgência e desconto conferem com o exemplo do design', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor();
  await p.evaluate(EXEMPLO); await p.locator('#fo-folha .tg').waitFor();
  const conta = () => p.evaluate(() => { const q = getQ(route().id), c = compute(q); return { labor: c.labor, mat: c.matTotal, travel: c.travel, total: c.total, entry: c.entry, rest: c.rest }; });
  assert.deepEqual(await conta(), { labor: 113500, mat: 58500, travel: 2971, total: 174971, entry: 87486, rest: 87485 });
  assert.match(await p.textContent('#fo-folha .tg'), /R\$\s1\.749,71/);
  assert.match(await p.textContent('#fo-folha .cns'), /Entrada de 50%, R\$\s874,86[\s\S]*R\$\s874,85/);
  // Acertar o total, pela janela: urgência de 20%, desconto de 5% e imposto de 6% por fora
  await p.click('#fo-folha .tts .ad');
  await p.locator('#fo-jan [data-x="urgent"]').click();
  await p.fill('.kf-dlg #ax-pct', '20'); await p.click('.kf-dlg [data-ok]');
  await p.locator('#fo-jan [data-x="urgent"]').waitFor();
  assert.deepEqual(await p.evaluate(() => { const c = compute(getQ(route().id)); return [c.extra, c.total]; }), [22700, 197671], 'urgência de 20% sobre a mão de obra');
  await p.locator('#fo-jan [data-x="urgent"]').click();
  await p.click('#fo-jan [data-dm="pct"]'); await p.fill('#fo-jan #q-disc', '5');
  assert.deepEqual(await p.evaluate(() => { const c = compute(getQ(route().id)); return [c.discount, c.total]; }), [8749, 166222], 'desconto de 5%');
  assert.ok(await esperar(async () => /R\$\s1\.662,22/.test(await p.textContent('#fo-folha .tg'))), 'a folha atrás mostra o total novo');
  await p.fill('#fo-jan #q-disc', '0');
  await p.click('#fo-jan [data-tx="fora"]'); await p.fill('#fo-jan #q-txp', '6'); await p.locator('#fo-jan #q-txp').blur();
  assert.ok(await esperar(() => p.evaluate(() => { const c = compute(getQ(route().id)); return c.taxFora === 6810 && c.total === 181781; })), 'imposto de 6% por fora, sobre a mão de obra');
  await p.click('#fo-jan [data-tx="sem"]'); await fecharJanela(p);
  // Pagamento: cartão em 6×, com taxa de 12,39% paga pelo cliente
  await p.click('#fo-folha [data-j="pag"]'); await p.click('#fo-jan [data-pm="parcelado"]');
  for (let k = 0; k < 3; k++) await p.click('#fo-jan [data-in="1"]');
  await p.click('#fo-jan [data-jur="taxa"]'); await p.fill('#fo-jan #q-taxa', '12,39'); await p.locator('#fo-jan #q-taxa').blur();
  assert.ok(await esperar(() => p.evaluate(() => { const k = compute(getQ(route().id)).card; return k.n === 6 && k.total === 199716 && k.recebe === 174971 && k.parts[0] === 33286; })), 'cartão: 6× de R$ 332,86 = R$ 1.997,16; você recebe R$ 1.749,71');
  assert.match(await p.textContent('#fo-jan #pay-sum'), /Você recebe, depois da taxa[\s\S]*R\$\s1\.749,71/);
  await fecharJanela(p);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('o botão amarelo é o próximo passo: Enviar pede o cliente, Aprovou, Concluir com baixa no estoque, Receber e Recibo', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor();
  await p.evaluate(EXEMPLO); await p.locator('#fo-visor [data-prox="enviar"]').waitFor();
  await p.evaluate(() => { const c = prices.find(x => x.name === 'Caixa 4x2'); c.stock = 10; c.cost = 150; c.min = 2; acertaLotes(c); savePrices(); });
  const etapa = () => p.evaluate(() => [getQ(route().id).status, document.querySelector('#fo-bd .rs.at').textContent, document.querySelector('#fo-visor [data-prox]').textContent.trim()]);
  // Enviar: sem o nome nada sai, e o campo é apontado sem receber o foco
  await p.click('#fo-visor [data-prox="enviar"]'); await p.locator('.kf-dlg #q-name').waitFor();
  assert.equal(await semCampoEmFoco(p), true);
  await p.click('.kf-dlg [data-pdf]');
  assert.equal(await p.getAttribute('.kf-dlg #q-name', 'aria-invalid'), 'true');
  assert.equal(await p.evaluate(() => getQ(route().id).status), 'rascunho');
  await p.fill('.kf-dlg #q-name', 'Mariana Souza'); await p.fill('.kf-dlg #q-phone', '11911112222');
  assert.match(await p.evaluate(() => { const q = getQ(route().id); return quoteMessage(q, compute(q), 'quote'); }), /Mariana[\s\S]*1\.749,71/);
  // o envio abriria outro app (WhatsApp) ou o menu de compartilhar: aqui marcamos como o app marca depois de enviar
  await p.evaluate(() => { KitFacil.dialogo.fechar(true); markSent(getQ(route().id)); });
  assert.deepEqual(await etapa(), ['enviado', 'Enviado', 'Aprovou']);
  assert.match(await p.textContent('#fo-folha'), /Mariana Souza/);
  await p.click('#fo-visor [data-prox="aprovou"]'); await p.click('.kf-dlg [data-ok]');
  assert.ok(await esperar(async () => (await etapa())[0] === 'aprovado'));
  assert.deepEqual(await etapa(), ['aprovado', 'Aprovado', 'Concluir']);
  // Concluir: a data e a baixa no estoque, numa janela só
  await p.click('#fo-visor [data-prox="concluir"]'); await p.locator('.kf-dlg [data-ok]').waitFor();
  assert.match(await p.textContent('.kf-dlg'), /Caixa 4x2[\s\S]*Usa 6[\s\S]*você tem 10/);
  await p.click('.kf-dlg [data-ok]');
  assert.ok(await esperar(async () => (await etapa())[0] === 'concluido'));
  assert.deepEqual(await etapa(), ['concluido', 'Concluído', 'Receber']);
  assert.equal(await p.evaluate(() => prices.find(x => x.name === 'Caixa 4x2').stock), 4, 'o material saiu do estoque');
  assert.match(await p.textContent('#ab-name'), /Relatório/, 'a folha virou o relatório');
  assert.match(await p.textContent('#fo-visor'), /Falta receber[\s\S]*R\$\s1\.749,71/);
  // Receber: registra a entrada; depois o restante; a etapa vira Recebido e o botão, Recibo
  await p.click('#fo-visor [data-prox="receber"]'); await p.locator('.kf-dlg #pg-v').waitFor();
  await p.fill('.kf-dlg #pg-v', ''); await p.type('.kf-dlg #pg-v', '87486'); await p.click('.kf-dlg [data-ok]');
  assert.ok(await esperar(() => p.evaluate(() => falta(getQ(route().id)) === 87485)));
  assert.deepEqual(await etapa(), ['concluido', 'Concluído', 'Receber']);
  await p.click('#fo-visor [data-prox="receber"]'); await p.locator('.kf-dlg #pg-v').waitFor();
  assert.equal(await p.inputValue('.kf-dlg #pg-v'), 'R$ 874,85', 'o valor sugerido é o que falta');
  await p.click('.kf-dlg [data-ok]');
  assert.ok(await esperar(async () => (await etapa())[1] === 'Recebido'));
  assert.deepEqual(await etapa(), ['concluido', 'Recebido', 'Recibo']);
  await p.click('#fo-visor [data-prox="recibo"]'); await p.locator('.kf-dlg').waitFor();
  assert.match(await p.textContent('.kf-dlg'), /Recibo de pagamento/);
  assert.equal(await p.evaluate(() => extenso(87485)), 'oitocentos e setenta e quatro reais e oitenta e cinco centavos');
  await fecharJanela(p);
  // desfazer a conclusão devolve o material
  await p.click('#fo-visor [data-menu]'); await p.click('.kf-dlg [data-o="status"]'); await p.click('.kf-dlg [data-s="enviado"]');
  assert.ok(await esperar(() => p.evaluate(() => prices.find(x => x.name === 'Caixa 4x2').stock === 10)), 'saiu de Concluído: o material volta para o estoque');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('janelas da folha: prazo no calendário, garantia e validade só com números, observações com textos prontos e ambientes', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor();
  await p.evaluate(EXEMPLO); await p.locator('#fo-folha .cns').waitFor();
  await p.click('#fo-folha [data-j="prazo"]'); await p.locator('#fo-jan #cal [data-cal]:not([disabled])').first().waitFor();
  assert.equal(await p.locator('#fo-jan #cal [data-cal][disabled]').count() > 0 || await p.evaluate(() => new Date().getDate() === 1), true, 'dias que já passaram ficam fora');
  await p.locator('#fo-jan #cal [data-cal]:not([disabled])').nth(1).click();
  assert.ok(await esperar(() => p.evaluate(() => getQ(route().id).dates.length >= 1)));
  await fecharJanela(p);
  assert.match(await p.textContent('#fo-folha .cns'), /Execução/);
  await p.locator('#fo-folha [data-j="gar"]').first().click();
  await p.fill('#fo-jan #q-war', '-12a0'); await p.fill('#fo-jan #q-val', '30');
  assert.deepEqual(await p.evaluate(() => { const q = getQ(route().id); return [q.warranty, q.validity]; }), [120, 30]);
  await fecharJanela(p);
  assert.match(await p.textContent('#fo-folha .cns'), /120 dias/);
  await p.click('#fo-folha .fb [data-j="obs"]'); await p.click('#fo-jan [data-note="0"]');
  assert.ok(await p.evaluate(() => getQ(route().id).notes.length > 10));
  await fecharJanela(p);
  // ⋯: separar por ambiente e material por conta do cliente
  await p.click('#fo-visor [data-menu]'); await p.locator('.kf-dlg #q-matcli').check();
  assert.ok(await esperar(() => p.evaluate(() => { const c = compute(getQ(route().id)); return c.total === 113500 + 2971; })), 'material por conta do cliente sai do total');
  assert.match(await p.textContent('#fo-folha'), /por conta do cliente/);
  await p.locator('.kf-dlg #q-matcli').uncheck(); await fecharJanela(p);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Orçamentos: o quadro por etapa, o Arquivo, a busca, o resumo do mês e o rascunho que se arrasta para excluir', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor();
  assert.match(await p.textContent('.page.orc .vaz'), /Nenhum orçamento ainda/);
  await p.evaluate(() => {
    const novo = (nome, st, extra = () => {}) => { const q = blankQuote(); q.num = ++settings.seq; q.client.name = nome; q.items = [{ id: uid(), kind: 'svc', name: 'Troca de tomada', unit: 'un', qty: 2, price: 5000, room: '' }]; quotes.push(q); if (st !== 'rascunho') setStatus(q, st); extra(q); return q; };
    novo('', 'rascunho'); novo('Mariana', 'enviado', q => { q.sentAt = Date.now() - 4 * 864e5; }); novo('Paulo', 'aprovado'); novo('Lúcia', 'concluido');
    novo('Quitado', 'concluido', q => { q.pagos = [{ id: uid(), v: 10000, t: Date.now() }]; }); novo('Recusado', 'recusado');
    saveSettings(); saveQuotes(); rerender();
  });
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.qd .et')].map(e => e.textContent.replace(/\s+/g, ' ').trim())), ['Rascunhos 1', 'Esperando resposta 1', 'Para executar 1', 'Para receber 1', 'Arquivo 2']);
  assert.match(await p.textContent('.qd'), /Vale cobrar/);
  assert.match(await p.textContent('.qd'), /Sem cliente ainda · 1 item/);
  assert.equal(await p.locator('.qd .qcard', { hasText: 'Quitado' }).count(), 0, 'o que já foi recebido vai para o Arquivo');
  await p.click('[data-arquivo]');
  assert.deepEqual((await p.locator('.sx.arq .qcard b').allTextContents()).sort(), ['Quitado', 'Recusado']);
  assert.match(await p.textContent('.vs'), /aprovado no mês/);
  await p.fill('#h-q', 'paulo');
  assert.deepEqual(await p.locator('#q-list .qcard b').allTextContents(), ['Paulo']);
  await p.fill('#h-q', '');
  // o rascunho tem o Excluir (vermelho e cheio) para quem usa teclado ou leitor de tela
  await p.locator('.qswipe .qc-del').focus(); await p.keyboard.press('Enter');
  assert.ok(await esperar(() => p.evaluate(() => !quotes.some(q => q.status === 'rascunho'))));
  await p.click('.kf-toast button');
  assert.ok(await esperar(() => p.evaluate(() => quotes.some(q => q.status === 'rascunho'))), 'Desfazer devolve o rascunho');
  await p.locator('.qd .qcard', { hasText: 'Paulo' }).click();
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'quote')));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Tabela em seções: uma abre de cada vez, a busca filtra e mudar um preço tira a letra fina', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor(); await p.evaluate(() => { location.hash = '#/precos'; });
  await p.locator('#pr-list .sx').first().waitFor();
  assert.equal(await p.locator('#pr-list .sx.ab').count(), 1);
  assert.ok(await p.locator('#pr-list .sx').count() >= 5);
  await p.locator('#pr-list [data-cat]', { hasText: 'Iluminação' }).click();
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#pr-list .sx.ab .st')].map(b => b.textContent.replace(/\d+/g, '').trim())), ['Iluminação']);
  assert.ok(await p.locator('#pr-list .sx.ab .ref-v').count() > 0, 'preço que vem com o app: letra fina');
  assert.match(await p.textContent('#pr-meus'), /0 de \d+/);
  await p.locator('#pr-list .sx.ab .tb-row').first().click(); await p.locator('.kf-dlg').waitFor();
  const campo = p.locator('.kf-dlg input[data-money]').first();
  await campo.fill(''); await campo.type('9900');
  await p.locator('.kf-dlg .btn.primary, .kf-dlg [data-save]').first().click();
  assert.ok(await esperar(() => p.evaluate(() => prices.filter(x => x.kind === 'svc' && !x.ref).length === 1)), 'o preço alterado passa a ser de quem usa');
  assert.match(await p.textContent('#pr-meus'), /1 de \d+/);
  await p.fill('#pr-q', 'zzzz');
  assert.match(await p.textContent('#pr-list'), /Nada com/);
  // só itens de eletricista predial de baixa tensão (Regras do app, Art. 9º)
  assert.deepEqual(await p.evaluate(() => prices.filter(x => /(^|\s)rede(\s|$)|rj45|cat ?6|coaxial|câmera|alarme|cerca elétrica/i.test(x.name)).map(x => x.name)), []);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Obra: Levar, Comprar, Estoque e Ferramentas; o que chega ao mínimo entra em Comprar, e Comprei tudo repõe', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor(); await p.evaluate(() => { location.hash = '#/obra'; });
  await p.locator('.page.obra [data-aba]').first().waitFor();
  assert.deepEqual((await p.locator('.page.obra [data-aba]').allTextContents()).map(t => t.replace(/[\s·\d]+$/g, '').trim()), ['Levar', 'Comprar', 'Estoque', 'Ferramentas']);
  assert.match(await p.textContent('#g-body'), /Sua lista de levar/);
  // Levar: um item novo, marcado na ida
  await p.click('[data-g-new]'); await p.fill('.kf-dlg #ck-name', 'Escada'); await p.click('.kf-dlg [data-save]');
  await p.locator('#g-body [data-ck]').first().check();
  assert.deepEqual(await p.evaluate(() => checks.map(c => [c.name, c.ida])), [['Escada', true]]);
  // Comprar: material abaixo do mínimo
  await p.evaluate(() => { const c = prices.find(x => x.name === 'Caixa 4x2'); c.stock = 1; c.cost = 150; c.min = 4; acertaLotes(c); savePrices(); rerender(); });
  assert.match(await p.locator('.page.obra [data-aba="comprar"]').textContent(), /1/);
  await p.click('.page.obra [data-aba="comprar"]');
  assert.match(await p.textContent('#cp-list'), /Caixa 4x2/);
  await p.click('[data-cp-tudo]');
  assert.ok(await esperar(() => p.evaluate(() => prices.find(x => x.name === 'Caixa 4x2').stock > 4)), 'Comprei tudo: o material entra no estoque');
  assert.match(await p.textContent('#g-body'), /Nada para comprar/);
  await p.click('.page.obra [data-aba="estoque"]'); await p.locator('#g-body #g-q').waitFor();
  await p.click('.page.obra [data-aba="ferramentas"]'); await p.locator('#g-body #g-q').waitFor();
  assert.ok(await p.evaluate(() => tools.filter(t => t.k === 'tipo').length > 100), 'as ferramentas que vêm com o app');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Ajustes: guias comuns na ordem do padrão e as do Elétrica Fácil; o nome fica em Conta e perfil e acende a Primeira luz', async () => {
  const a = await aparelho(amb, { conquistas: true }); const p = a.page;
  await p.locator('.page.orc').waitFor(); await p.evaluate(() => { location.hash = '#/ajustes'; });
  await p.locator('[data-kf-aj]').waitFor();
  const guias = await guiasAjustes(p);
  assert.deepEqual(guias.comuns, GUIAS_COMUNS);
  assert.deepEqual(guias.produto, ['Pix', 'Veículo e deslocamento', 'Adicionais', 'Orçamento novo', 'Textos dos documentos', 'Conquistas e apresentação']);
  assert.equal(await p.evaluate(() => jogoEstado().ganhas.includes('luz')), false);
  await p.evaluate(() => { settings.name = 'Carlos Pereira'; saveSettings(); jogoConferir({ silencioso: true }); });
  assert.equal(await p.evaluate(() => jogoEstado().ganhas.includes('luz')), true, 'dizer o nome, nos Ajustes, acende a Primeira luz');
  assert.equal(await p.evaluate(() => CONQUISTAS.find(c => c.id === 'luz').como.includes('apresentação')), false);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('apresentação: quatro telas, sem interruptor e sem pedir o nome; Pular em todas menos a última; termina em Orçamentos', async () => {
  const a = await aparelho(amb, { antes: () => { window.EF_TESTE_ABERTURA = true; } }); const p = a.page;
  await p.locator('.kf-abertura').waitFor();
  const titulos = [];
  for (let k = 0; k < 4; k++) {
    await p.waitForTimeout(200);
    titulos.push((await p.textContent('.kf-abertura .kf-ab-t')).trim());
    assert.equal(await p.locator('.kf-abertura input, .kf-abertura textarea').count(), 0, `a tela ${k + 1} não pede nada`);
    assert.equal(await p.locator('.kf-abertura [data-ab-luz], .kf-abertura .ab-interruptor').count(), 0, 'o interruptor saiu');
    assert.equal(await p.locator('#kf-ab-pular').isVisible(), k < 3, 'Pular em todas, menos na última');
    if (k === 0) assert.equal(await p.locator('.kf-abertura .ab-pend:not(.acesa) .lp-pend').count(), 1, 'a lâmpada começa apagada');
    if (k === 1) { const antes = await p.textContent('.kf-abertura .tg'); await p.click('.kf-abertura [data-ab-somar]'); assert.notEqual(await p.textContent('.kf-abertura .tg'), antes, 'a folha de demonstração soma ao toque'); }
    if (k === 3) assert.equal(await p.locator('.kf-abertura .ab-pend.acesa .lp-pend').count(), 1, 'e termina acesa');
    if (k < 3) await p.click('#kf-ab-prox');
  }
  assert.deepEqual(titulos, ['Orçamento de elétrica, do pedido ao recibo', 'Monte o orçamento na folha do cliente', 'Toque no botão amarelo para avançar', 'Pronto. Faça o primeiro orçamento.']);
  assert.equal((await p.textContent('#kf-ab-prox')).trim(), 'Ir para o início');
  assert.equal(await p.locator('#raio-cena .rz').count(), 0, 'nenhum raio na apresentação');
  await p.click('#kf-ab-prox');
  assert.ok(await esperar(() => p.evaluate(() => !KitFacil.abertura.ativa() && route().name === 'home' && settings.name === '')));
  await p.reload(); await p.locator('.page.orc').waitFor(); await p.waitForTimeout(300);
  assert.equal(await p.locator('.kf-abertura').count(), 0, 'a apresentação aparece uma vez só');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('raio: é enfeite (não recebe toque), dá no máximo dois clarões, some em pouco mais de um segundo e não há tempestade', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor();
  assert.equal(await p.evaluate(() => typeof Raio.tempestade), 'undefined', 'a tempestade saiu');
  await p.emulateMedia({ reducedMotion: 'no-preference' });
  assert.equal(await p.evaluate(() => { Raio.cair({ forcar: true, x: 200 }); return document.querySelectorAll('#raio-cena .rz').length; }), 1);
  const r = await p.evaluate(() => {
    const cena = document.getElementById('raio-cena'), luz = cena.querySelector('.rz-f'), an = luz.getAnimations()[0], T = an.effect.getKeyframes().map(k => [Math.round(k.offset * an.effect.getTiming().duration), +k.opacity]);
    let clar = 0; for (let i = 1; i < T.length - 1; i++) if (T[i][1] > T[i - 1][1] && T[i][1] >= T[i + 1][1] && T[i][1] >= 0.4) clar++;
    return { toque: getComputedStyle(cena).pointerEvents, clar, dura: an.effect.getTiming().duration, camadas: cena.querySelectorAll('.rz-c')[1].querySelectorAll('.rz-cm').length, cores: [...cena.querySelectorAll('.rz-c')[1].querySelectorAll('.rz-cm')].map(s => s.style.fill) };
  });
  assert.equal(r.toque, 'none'); assert.ok(r.clar <= 2, `clarões: ${r.clar}`); assert.ok(r.dura <= 1200);
  assert.equal(r.camadas, 7, 'sete camadas de brilho, da mesma cor quente');
  assert.equal(await p.locator('.page.orc [data-novo]').isEnabled(), true);
  await p.click('.page.orc [data-novo]', { timeout: 2000 });   // o toque passa pelo raio
  assert.ok(await esperar(() => p.evaluate(() => document.querySelectorAll('#raio-cena .rz').length === 0), 2500), 'o raio some sozinho');
  // quem pede movimento reduzido não vê raio; e dá para desligar
  await p.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await p.evaluate(async () => Raio.cair({ forcar: true })), false);
  await p.evaluate(() => Raio.ligar(false));
  assert.equal(await p.evaluate(() => Raio.ligado()), false);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('documentos: o texto da proposta, o Pix em QR code (sem o símbolo do Pix) e a cópia de segurança', async () => {
  const a = await aparelho(amb); const p = a.page;
  await p.locator('.page.orc').waitFor();
  await p.evaluate(() => { settings.name = 'Carlos Pereira'; settings.pix = 'carlos@exemplo.com.br'; settings.city = 'São Paulo'; saveSettings(); });
  await p.evaluate(EXEMPLO); await p.locator('#fo-folha .px').waitFor();
  assert.match(await p.textContent('#fo-folha .px'), /Pague a entrada com Pix: R\$\s874,86/);
  assert.equal(await p.locator('#fo-folha .px canvas[data-qr]').count(), 1, 'onde há Pix, o desenho é um QR code');
  const cod = await p.evaluate(() => { const q = getQ(route().id); return pixPayload(pixOf(q, compute(q), 'quote')); });
  assert.match(cod, /^000201.*br\.gov\.bcb\.pix.*5406874\.86.*6304[0-9A-F]{4}$/);
  assert.match(await p.textContent('#fo-folha .fh'), /Carlos Pereira/);
  const txt = await p.evaluate(() => { const q = getQ(route().id); q.client.name = 'Mariana Souza'; return quoteMessage(q, compute(q), 'quote'); });
  assert.match(txt, /Olá, Mariana![\s\S]*Ponto novo de tomada com fiação[\s\S]*1\.749,71/);
  // a cópia de segurança sai no formato comum da família e volta inteira
  const env = await p.evaluate(() => KitFacil.copia.envelope({ settings, prices, quotes: quotes.filter(q => !q.example), tools, checks }, 2));
  assert.equal(env.dados.quotes.length, 1); assert.equal(env.app, 'eletrica-facil');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('sincronização: usa um arquivo novo na nuvem (o das versões 1 e 2 não é lido) e junta dois aparelhos', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh }), B = await aparelho(amb, { github: gh });
  const criar = (p, nome) => p.evaluate(nome => { const q = blankQuote(); q.num = ++settings.seq; q.client.name = nome; q.items = [{ id: uid(), kind: 'svc', name: 'Troca de tomada', unit: 'un', qty: 1, price: 15000, room: '' }]; quotes.push(q); saveSettings(); saveQuotes(); render(); }, nome);
  await A.page.locator('.page.orc').waitFor(); await B.page.locator('.page.orc').waitFor();
  await criar(A.page, 'Cliente do A');
  assert.equal(await A.page.evaluate(t => SY.conectar(t), TOKEN_TESTE), true);
  assert.ok(await esperar(() => A.page.evaluate(() => SY.ligada() && sync.lastSync > 0)), 'A não sincronizou');
  assert.ok(gh.arquivo('eletrica-facil-3.json'), 'o arquivo novo na nuvem');
  assert.ok(!gh.arquivo('eletrica-facil.json'), 'o arquivo do formato antigo não é tocado');
  assert.ok(!/Cliente do A/.test(gh.arquivo('eletrica-facil-3.json').conteudo), 'o conteúdo vai criptografado');
  await criar(B.page, 'Cliente do B');
  assert.equal(await B.page.evaluate(t => SY.conectar(t), TOKEN_TESTE), true);
  assert.deepEqual(await B.page.evaluate(() => quotes.map(q => q.client.name).sort()), ['Cliente do A', 'Cliente do B']);
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => quotes.map(q => q.client.name).sort()), ['Cliente do A', 'Cliente do B']);
  assert.deepEqual([...A.erros, ...B.erros], []);
  await A.fechar(); await B.fechar();
});

test('guia: um só, do começo ao fim, sem avisos e sem gravar nada', async () => {
  const a = await aparelhoKit(amb, { antes: () => { window.__avisos = []; const w = console.warn; console.warn = (...x) => { window.__avisos.push(x.map(String).join(' ')); w.apply(console, x); }; } });
  const p = a.page;
  await p.locator('.page.orc').waitFor();
  await p.evaluate(() => { const q = blankQuote(); q.num = ++settings.seq; q.client.name = 'Cliente Real'; q.items = [{ id: uid(), kind: 'svc', name: 'x', unit: 'un', qty: 1, price: 100, room: '' }]; quotes.push(q); settings.name = 'Eu Mesmo'; saveSettings(); saveQuotes(); jogoConferir({ silencioso: true }); render(); });
  const foto = () => p.evaluate(() => JSON.stringify([localStorage.getItem('eletricafacil.quotes'), localStorage.getItem('eletricafacil.settings'), localStorage.getItem('eletricafacil.prices'), localStorage.getItem('eletricafacil.tools')]));
  const antes = await foto();
  await p.evaluate(() => go('/mais', true)); await p.click('.kf-mais [data-kf-ir="guia"]');
  assert.ok(await esperar(() => p.evaluate(() => !!KitFacil.guia.estado())));
  assert.deepEqual(await p.evaluate(() => [semSalvar, quotes.length, settings.name]), [true, 0, 'Carlos Pereira'], 'a demonstração começa do zero');
  const fim = Date.now() + 300000; let maior = 0;
  while (Date.now() < fim && await p.evaluate(() => !!KitFacil.guia.estado())) {
    const e = await p.evaluate(() => KitFacil.guia.estado()); if (e) maior = Math.max(maior, e.i);
    await p.evaluate(() => { const s = KitFacil.guia.estado(); if (s && !s.rapido && s.fase === 'conta') document.querySelector('#kf-gu-pula').click(); });
    await p.waitForTimeout(100);
  }
  assert.equal(await p.evaluate(() => !!KitFacil.guia.estado()), false, 'o guia não chegou ao fim');
  assert.equal(maior, await p.evaluate(() => GUIA.filter(x => !x.se || x.se()).length - 1), 'o guia passou por todos os passos');
  assert.deepEqual(await p.evaluate(() => window.__avisos.filter(x => /guia/i.test(x))), [], 'algum passo do guia falhou');
  assert.equal(await foto(), antes, 'o guia gravou alguma coisa');
  assert.deepEqual(await p.evaluate(() => [semSalvar, !!dadosReais, quotes.length, quotes[0].client.name, settings.name, route().name, !!jogo.flags.guia]), [false, false, 1, 'Cliente Real', 'Eu Mesmo', 'home', true]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
