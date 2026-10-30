/* Elétrica Fácil · testes do app (npm test). Rodam num Chromium, sem internet:
   o GitHub (sincronização) e o Firestore (avaliações) são simulados por comum/testes/ambiente.mjs. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, semRolagemLateral, conferirTopo, conferirNavAjustes, abrirAjustesPelaNav, irPelaNav, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const TELAS = [[{ width: 360, height: 740 }, 'celular pequeno'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
// Ajustes fica na navegação: barra de baixo (celular e tablet) ou pé do trilho (computador)
const AJ = '.kf-nav [data-kf="ajustes"]:visible, .kf-trilho [data-kf="ajustes"]:visible';
const abrirPainel = async (p, chave) => { const d = p.locator(`details[data-panel="${chave}"]`); if (!(await d.getAttribute('open') !== null)) await d.locator('summary').first().click(); };
/* abre uma guia dos Ajustes (no celular, a lista vira a guia aberta) */
const guia = async (p, id) => { if (!(await p.locator('[data-kf-aj]').count())) await abrirAjustesPelaNav(p); await p.click(`.kf-aj-lista [data-kf-aj-ir="${id}"]`); await p.locator(`#kf-aj-${id}.kf-aberta, [data-kf-aj][data-ativa="${id}"]`).first().waitFor(); };

/* cria um orçamento usando as próprias funções do app */
const criarOrcamento = (p, cliente, servico) => p.evaluate(([cliente, servico]) => {
  const q = blankQuote(); q.num = ++settings.seq; q.client.name = cliente;
  q.items = [{ id: uid(), kind: 'svc', name: servico, unit: 'un', qty: 1, price: 15000, room: '' }];
  quotes.push(q); saveSettings(); saveQuotes(); render();
  return q.id;
}, [cliente, servico]);

test('abre sem erros em celular, tablet e computador, sem rolagem lateral; topo e navegação do padrão', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport });
    const p = a.page;
    await p.locator('.welcome h1').waitFor();
    assert.equal(await p.getAttribute('html', 'lang'), 'pt-BR');
    assert.ok(await semRolagemLateral(p), `rolagem lateral no ${nome}`);
    const topo = await conferirTopo(p);
    assert.deepEqual(topo.erros, [], `área superior no ${nome}`);
    const navs = await p.evaluate(() => ['.kf-nav', '.kf-trilho'].filter(q => document.querySelector(q).getClientRects().length));
    assert.deepEqual(navs, [viewport.width >= 1024 ? '.kf-trilho' : '.kf-nav'], `navegação no ${nome}`);
    const navAj = await conferirNavAjustes(p);
    assert.deepEqual(navAj.erros, [], `Ajustes na navegação no ${nome}`);
    await abrirAjustesPelaNav(p);
    await p.locator('.kf-aj-h').waitFor();
    assert.ok(await semRolagemLateral(p), `rolagem lateral nos Ajustes no ${nome}`);
    await guia(p, 'padrao');
    assert.ok(await semRolagemLateral(p), `rolagem lateral na guia Orçamento novo no ${nome}`);
    // tela interna (orçamento): só a nuvem e o balão, à direita
    const id = await criarOrcamento(p, 'Cliente Teste', 'Troca de tomada');
    await p.evaluate(id => go('/q/' + id), id);
    await p.locator('[data-menu]').waitFor();
    const interno = await conferirTopo(p, { chopp: false });
    assert.deepEqual(interno.erros, [], `área superior do orçamento no ${nome}`);
    assert.ok(await semRolagemLateral(p), `rolagem lateral no orçamento no ${nome}`);
    assert.deepEqual(a.erros, [], `erros no ${nome}`);
    await a.fechar();
  }
});

test('zoom liberado para quem precisa ampliar a tela', async () => {
  const a = await aparelho(amb);
  assert.doesNotMatch(await a.page.getAttribute('meta[name="viewport"]', 'content'), /maximum-scale|user-scalable/);
  await a.fechar();
});

test('Ajustes: guias comuns na ordem do padrão, guias do Elétrica Fácil, Voltar e navegação', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('#nav-prices');
  await abrirAjustesPelaNav(p);
  assert.deepEqual(await guiasAjustes(p), { comuns: GUIAS_COMUNS, produto: ['Pix', 'Veículo e deslocamento', 'Adicionais', 'Orçamento novo', 'Textos dos documentos'] });
  assert.ok((await p.textContent('#app')).includes(`Elétrica Fácil ${versao}`), 'falta a versão');
  assert.equal(await p.locator('.kf-nav [data-kf=\"ajustes\"]').getAttribute('aria-current'), 'page');
  await guia(p, 'sobre');
  assert.equal(await p.locator('#kf-aj-sobre .kf-sobre, #kf-aj-sobre').count() > 0, true);
  await p.goBack();
  assert.ok(await esperar(async () => (await p.getAttribute('[data-kf-aj]', 'data-ativa')) === ''), 'o Voltar não voltou para a lista');
  await p.goBack();
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'prices')), 'o Voltar não saiu dos Ajustes');
  // trocar de tela pela barra de baixo estando numa guia: a guia sai do histórico
  await abrirAjustesPelaNav(p);
  await guia(p, 'pix');
  await p.click('#nav-home');
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'home')));
  await p.goBack();
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'prices')), 'o Voltar deveria levar para a tela de antes dos Ajustes');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Ajustes: seus dados (Conta e perfil) e guias do app salvam e atualizam o resumo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await guia(p, 'conta');
  await p.fill('#st-name', 'Carlos Pereira');
  await p.locator('#st-name').dispatchEvent('change');
  assert.equal(await p.evaluate(() => settings.name), 'Carlos Pereira');
  assert.ok(await esperar(async () => (await p.textContent('[data-kf-aj-resumo="conta"]')) === 'Carlos Pereira'));
  await p.goBack();
  await guia(p, 'pix');
  await p.fill('#st-pix', 'carlos@exemplo.com');
  await p.locator('#st-pix').dispatchEvent('change');
  assert.equal(await p.textContent('[data-kf-aj-resumo="pix"]'), 'carlos@exemplo.com');
  await p.goBack();
  await guia(p, 'padrao');
  await p.click('[data-pm="entrada"]');
  assert.equal(await p.evaluate(() => settings.payMode), 'entrada');
  assert.ok(await p.locator('#kf-aj-padrao [data-ep="50"]').isVisible(), 'a guia deveria continuar aberta depois de redesenhar');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('computador: Ajustes em duas colunas e barra inferior do orçamento depois do trilho', async () => {
  const a = await aparelho(amb, { viewport: { width: 1440, height: 900 } });
  const p = a.page;
  await abrirAjustesPelaNav(p);
  const lado = await p.evaluate(() => { const l = document.querySelector('.kf-aj-lista').getBoundingClientRect(), s = document.querySelector('.kf-aj-sec.kf-aberta, .kf-aj-sec:first-child').getBoundingClientRect(); return l.right <= s.left && Math.abs(l.top - s.top) < 60; });
  assert.ok(lado, 'lista e guia não estão lado a lado');
  const id = await criarOrcamento(p, 'Cliente Largo', 'Troca de disjuntor');
  await p.evaluate(id => go('/q/' + id), id);
  await p.locator('.bbar').waitFor();
  const bb = await p.evaluate(() => document.querySelector('.bbar').getBoundingClientRect().left);
  assert.ok(bb >= 239, `a barra do orçamento passa por baixo do trilho (${bb})`);
  assert.equal(await p.getAttribute('#trilho-home', 'aria-current'), 'page');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('balão: avaliar o app e relatar um problema saem com o nome do app, a versão e a tela', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs });
  const p = a.page;
  await p.click('#nav-prices');
  await p.click('.kf-topo [data-kf="feedback"]');
  await p.click('.kf-dlg [data-kf="problema"]');
  await p.click('.kf-opcao:has-text("Erro ou travamento")');
  await p.fill('#kf-msg', 'O PDF saiu sem o logotipo.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  await p.keyboard.press('Escape');
  await guia(p, 'feedback');
  await p.click('#kf-aj-feedback [data-kf="avaliar"]');
  await p.click('label[for="kf-n4"]');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  const docs = [...fs.estado.docs.values()].map(d => d.dados);
  assert.equal(docs.length, 2);
  for (const d of docs) { assert.equal(d.app, 'eletrica-facil'); assert.equal(d.versao, versao); }
  assert.equal(docs[0].tela, 'prices'); assert.equal(docs[0].tipo, 'problema'); assert.equal(docs[0].categoria, 'erro');
  assert.equal(docs[1].tela, 'settings'); assert.deepEqual(docs[1].nota, { __int: 4 });
  assert.equal(fs.estado.recusas.length, 0);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('aparência: tema escuro vale para o app todo e o resumo da guia acompanha', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await guia(p, 'aparencia');
  await p.click('[data-kf="tema"][data-v="escuro"]');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await p.textContent('[data-kf-aj-resumo="aparencia"]'), 'Escuro');
  await p.reload();
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  await a.fechar();
});

test('sincronização: orçamentos e preços passam de um aparelho para o outro, sem regravar à toa', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh });
  const B = await aparelho(amb, { github: gh });
  await criarOrcamento(A.page, 'Cliente do A', 'Troca de tomada');
  await A.page.click('[data-kf-nuvem]');
  await A.page.click('.kf-dlg [data-kf="sync-ativar"]');
  await A.page.fill('#kf-token', TOKEN_TESTE);
  await A.page.click('[data-kf-conectar]');
  assert.ok(await esperar(() => A.page.evaluate(() => SY.ligada() && sync.lastSync > 0)), 'A não sincronizou');
  assert.ok(await esperar(async () => (await A.page.getAttribute('[data-kf-nuvem]', 'data-estado')) === 'sincronizado'), 'a nuvem não mostra Sincronizado');
  await guia(A.page, 'sincronizacao');
  assert.match(await A.page.textContent('#kf-aj-sincronizacao'), /@pessoa-teste/);
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

test('orçamento de exemplo e cópia de segurança (formato novo e antigo) continuam funcionando', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('[data-example]');
  await p.waitForFunction(() => location.hash.startsWith('#/q/'));
  await p.goBack();
  await criarOrcamento(p, 'Cliente da Cópia', 'Quadro de distribuição');
  await guia(p, 'sincronizacao');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-kf="copia-baixar"]')]);
  const caminho = await dl.path();
  const copia = JSON.parse(await readFile(caminho, 'utf8'));
  assert.equal(copia.formato, 'copia-facil');
  assert.equal(copia.app, 'eletrica-facil');
  assert.ok(Array.isArray(copia.dados.prices) && copia.dados.prices.length > 0);
  assert.deepEqual(copia.dados.quotes.map(q => q.client.name), ['Cliente da Cópia']);
  // restaura a cópia nova
  await p.evaluate(() => { quotes = []; saveQuotes(); });
  await p.setInputFiles('[data-kf-copia-arquivo]', caminho);
  await p.click('#sheet-root [data-ok]');
  assert.ok(await esperar(() => p.evaluate(() => quotes.length === 1)), 'não restaurou a cópia nova');
  // e a cópia no formato antigo (versão 2.5 e anteriores)
  const antigo = caminho + '-antigo.json';
  await writeFile(antigo, JSON.stringify({ app: 'eletrica-facil', v: 2, at: Date.now(), settings: { name: 'Antigo' }, prices: copia.dados.prices, quotes: [] }));
  await p.setInputFiles('[data-kf-copia-arquivo]', antigo);
  await p.click('#sheet-root [data-ok]');
  assert.ok(await esperar(() => p.evaluate(() => quotes.length === 0 && settings.name === 'Antigo')), 'não restaurou a cópia antiga');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
