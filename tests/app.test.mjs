/* Elétrica Fácil · testes do app (npm test). Rodam num Chromium, sem internet:
   o GitHub (sincronização) e o Firestore (avaliações) são simulados por comum/testes/ambiente.mjs. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, semRolagemLateral, TOKEN_TESTE, RAIZ } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const TELAS = [[{ width: 360, height: 740 }, 'celular pequeno'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
const abrirPainel = async (p, chave) => { const d = p.locator(`details[data-panel="${chave}"]`); if (!(await d.getAttribute('open') !== null)) await d.locator('summary').first().click(); };

/* cria um orçamento usando as próprias funções do app */
const criarOrcamento = (p, cliente, servico) => p.evaluate(([cliente, servico]) => {
  const q = blankQuote(); q.num = ++settings.seq; q.client.name = cliente;
  q.items = [{ id: uid(), kind: 'svc', name: servico, unit: 'un', qty: 1, price: 15000, room: '' }];
  quotes.push(q); saveSettings(); saveQuotes(); render();
  return q.id;
}, [cliente, servico]);

test('abre sem erros em celular, tablet e computador, sem rolagem lateral', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport });
    await a.page.locator('.welcome h1').waitFor();
    assert.equal(await a.page.getAttribute('html', 'lang'), 'pt-BR');
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral no ${nome}`);
    await a.page.click('#nav-settings');
    await a.page.locator('details[data-panel="st:sync"]').waitFor();
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral nos Ajustes no ${nome}`);
    assert.deepEqual(a.erros, [], `erros no ${nome}`);
    await a.fechar();
  }
});

test('zoom liberado para quem precisa ampliar a tela', async () => {
  const a = await aparelho(amb);
  assert.doesNotMatch(await a.page.getAttribute('meta[name="viewport"]', 'content'), /maximum-scale|user-scalable/);
  await a.fechar();
});

test('Ajustes: seções do padrão e versão', async () => {
  const a = await aparelho(amb, { caminho: '#/ajustes' });
  const p = a.page;
  await p.locator('details[data-panel="st:sync"]').waitFor();
  const t = await p.textContent('#app');
  for (const s of ['Usar em vários aparelhos', 'Aparência', 'Cópia em arquivo', 'Ajude a melhorar', 'Seus dados', `Elétrica Fácil · versão ${versao}`]) assert.ok(t.includes(s), `falta "${s}" nos Ajustes`);
  await abrirPainel(p, 'st:ajuda');
  assert.equal(await p.locator('details[data-panel="st:ajuda"] [data-kf="sobre"]').count(), 1);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('avaliação: sai do app com o nome do app, a versão e a tela', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs, caminho: '#/ajustes' });
  const p = a.page;
  await abrirPainel(p, 'st:ajuda');
  await p.click('details[data-panel="st:ajuda"] [data-kf="problema"]');
  await p.fill('#kf-msg', 'O PDF saiu sem o logotipo.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  const [doc] = [...fs.estado.docs.values()];
  assert.equal(doc.dados.app, 'eletrica-facil');
  assert.equal(doc.dados.versao, versao);
  assert.equal(doc.dados.tela, 'settings');
  assert.equal(doc.dados.tipo, 'problema');
  assert.equal(fs.estado.recusas.length, 0);
  await a.fechar();
});

test('aparência: tema escuro vale para o app todo e o resumo da seção acompanha', async () => {
  const a = await aparelho(amb, { caminho: '#/ajustes' });
  const p = a.page;
  await abrirPainel(p, 'st:tema');
  await p.click('[data-kf="tema"][data-v="escuro"]');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await p.textContent('[data-sum="tema"]'), 'Escuro');
  await p.reload();
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  await a.fechar();
});

test('sincronização: orçamentos e preços passam de um aparelho para o outro, sem regravar à toa', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh, caminho: '#/ajustes' });
  const B = await aparelho(amb, { github: gh });
  await criarOrcamento(A.page, 'Cliente do A', 'Troca de tomada');
  await A.page.goto(amb.url + '#/ajustes');
  await abrirPainel(A.page, 'st:sync');
  await A.page.click('details[data-panel="st:sync"] [data-kf="sync-ativar"]');
  await A.page.fill('#kf-token', TOKEN_TESTE);
  await A.page.click('[data-kf-conectar]');
  assert.ok(await esperar(() => A.page.evaluate(() => SY.ligada() && sync.lastSync > 0)), 'A não sincronizou');
  assert.match(await A.page.textContent('details[data-panel="st:sync"]'), /@pessoa-teste/);
  const arq = gh.arquivo('eletrica-facil.json');
  assert.ok(arq && !/Cliente do A/.test(arq.conteudo), 'o gist deveria estar criptografado');

  await criarOrcamento(B.page, 'Cliente do B', 'Instalação de chuveiro');
  assert.equal(await B.page.evaluate(t => SY.conectar(t), TOKEN_TESTE), true);
  assert.deepEqual(await B.page.evaluate(() => quotes.filter(q => !q.example).map(q => q.client.name).sort()), ['Cliente do A', 'Cliente do B']);
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => quotes.map(q => q.client.name).sort()), ['Cliente do A', 'Cliente do B']);
  assert.equal(new Set(await A.page.evaluate(() => quotes.map(q => q.num))).size, 2, 'números de orçamento repetidos');

  // excluir um preço (já alterado antes) e um orçamento num aparelho apaga no outro
  const preco = await A.page.evaluate(() => prices[0].name);
  await A.page.evaluate(() => { prices[0].price = 12345; savePrices(); });
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  assert.equal(await B.page.evaluate(n => prices.find(p => p.name === n).price, preco), 12345);
  await A.page.evaluate(() => { prices = prices.slice(1); savePrices(); quotes = quotes.filter(q => q.client.name !== 'Cliente do B'); saveQuotes(); });
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  assert.equal(await B.page.evaluate(n => prices.some(p => p.name === n), preco), false);
  assert.deepEqual(await B.page.evaluate(() => quotes.map(q => q.client.name)), ['Cliente do A']);
  // sem mudanças, nenhum aparelho regrava o gist
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  const antes = gh.estado.chamadas.filter(c => c.startsWith('PATCH')).length;
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  assert.equal(gh.estado.chamadas.filter(c => c.startsWith('PATCH')).length, antes, 'gravou o gist sem mudança');
  assert.deepEqual([...A.erros, ...B.erros], []);
  await A.fechar(); await B.fechar();
});

test('orçamento de exemplo e cópia em arquivo continuam funcionando', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('[data-example]');
  await p.waitForFunction(() => location.hash.startsWith('#/q/'));
  await p.goBack();
  await p.click('#nav-settings');
  await abrirPainel(p, 'st:bak');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-export]')]);
  const copia = JSON.parse(await readFile(await dl.path(), 'utf8'));
  assert.equal(copia.app, 'eletrica-facil');
  assert.ok(Array.isArray(copia.prices) && copia.prices.length > 0);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
