/* Elétrica Fácil · testes do app (npm test). Rodam num Chromium, sem internet:
   o GitHub (sincronização) e o Firestore (avaliações) são simulados por comum/testes/ambiente.mjs. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, semRolagemLateral, conferirTopo, conferirNavAjustes, abrirAjustesPelaNav, irPelaNav, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ, escolher as escolherKit } from '../comum/testes/ambiente.mjs';

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

const abrirCat = (p, sel) => p.evaluate(sel => { let d = document.querySelector(sel)?.closest('details'); while (d) { d.open = true; d = d.parentElement.closest('details'); } }, sel);
const escolher = (p, id, valor) => escolherKit(p, '#' + id, valor);
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
    await p.locator('.kf-vazio [data-example]').waitFor();
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
  await p.evaluate(() => localStorage.removeItem('kitfacil.eletrica-facil.envios')); // limite de 1 envio por minuto (Art. 46)
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
  // gestão: ferramentas, checklist e estoque também passam de um aparelho para o outro
  await A.page.evaluate(() => { tools.push(fixTipo({ id: 'tipo-a', name: 'Alicate do A' }), fixItem({ id: 'item-a', tipo: 'tipo-a', brand: 'Marca A', model: 'X1' })); saveTools(); checks.push(fixCheck({ id: uid(), name: 'Escada' })); saveChecks(); prices[0].stock = 7; savePrices(); });
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await B.page.evaluate(() => [tools.filter(t => !t.seed).map(t => t.name || t.brand), checks.map(c => c.name), prices[0].stock]), [['Alicate do A', 'Marca A'], ['Escada'], 7]);
  // as ferramentas pré-cadastradas têm o mesmo id nos dois aparelhos: não duplicam
  assert.equal(await B.page.evaluate(() => tools.length), await A.page.evaluate(() => tools.length));
  await B.page.evaluate(() => { checks[0].ida = true; saveChecks(); });
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.equal(await A.page.evaluate(() => checks[0].ida), true);
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
  await p.click('.kf-dlg :is([data-ok],[data-kf-ok])');
  assert.ok(await esperar(() => p.evaluate(() => quotes.length === 1)), 'não restaurou a cópia nova');
  // e a cópia no formato antigo (versão 2.5 e anteriores)
  const antigo = caminho + '-antigo.json';
  await writeFile(antigo, JSON.stringify({ app: 'eletrica-facil', v: 2, at: Date.now(), settings: { name: 'Antigo' }, prices: copia.dados.prices, quotes: [] }));
  await p.setInputFiles('[data-kf-copia-arquivo]', antigo);
  await p.click('.kf-dlg :is([data-ok],[data-kf-ok])');
  assert.ok(await esperar(() => p.evaluate(() => quotes.length === 0 && settings.name === 'Antigo')), 'não restaurou a cópia antiga');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

/* ================= 2.9.0 ================= */
test('tela inicial: filtros na ordem Todos, Em aberto, Concluídos e Recusados, com Todos marcado', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await criarOrcamento(p, 'Cliente Filtro', 'Troca de tomada');
  const chips = await p.locator('[data-filter]').evaluateAll(L => L.map(b => [b.dataset.filter, b.getAttribute('aria-pressed')]));
  assert.deepEqual(chips.map(c => c[0]), ['todos', 'aberto', 'concluido', 'recusado']);
  assert.equal(chips[0][1], 'true');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('um toque abre um orçamento uma vez só, mesmo depois de a tela ser redesenhada', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await criarOrcamento(p, 'Cliente Histórico', 'Troca de tomada');
  for (let i = 0; i < 4; i++) await p.evaluate(() => rerender());
  const antes = await p.evaluate(() => history.length);
  await abrirCat(p, '[data-open]');
  await p.click('[data-open]');
  await p.locator('[data-menu]').waitFor();
  assert.equal(await p.evaluate(() => history.length), antes + 1, 'o toque empilhou mais de uma tela no histórico');
  await p.goBack();
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'home')), 'um Voltar deveria levar à lista');
  await a.fechar();
});

test('seções: começam fechadas, cada uma abre e fecha sozinha, com animação, sem passar do fim da página', async () => {
  for (const vp of [{ width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    const a = await aparelho(amb, { viewport: vp });
    const p = a.page;
    const id = await criarOrcamento(p, 'Cliente Seções', 'Troca de tomada');
    await p.evaluate(id => go('/q/' + id), id);
    assert.equal(await p.locator('[data-next]').count(), 0, 'o botão Próximo saiu do app');
    assert.equal(await p.locator('details.fold[open]').count(), 0, 'todas as seções começam fechadas');
    assert.equal(await p.locator('details.fold.sub').count(), 0, 'seção de dentro usa o mesmo cartão');
    await abrirPainel(p, `q:${id}:cli`);
    await p.waitForTimeout(700);
    await p.click(`details[data-panel="q:${id}:val"] > summary`);
    assert.equal(await p.evaluate(id => document.querySelector(`details[data-panel="q:${id}:val"]`).classList.contains('kf-secao-anim'), id), true, 'a seção deveria abrir com animação');
    assert.ok(await esperar(() => p.evaluate(id => { const n = document.querySelector(`details[data-panel="q:${id}:val"]`), c = document.querySelector(`details[data-panel="q:${id}:cli"]`); return n.open && c.open && !n.classList.contains('kf-secao-anim'); }, id)), 'abrir uma seção não fecha a outra');
    await p.waitForTimeout(150);
    // a rolagem termina onde a página permite: nada de tranco depois da animação
    const pos = await p.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight]);
    assert.ok(pos[0] <= pos[1] + 1, `rolou além do fim da página (${pos})`);
    assert.equal(await p.locator('.kf-secao-folga').count(), 0, 'o espaço provisório deveria sair no fim');
    assert.match(await p.textContent('#ab-saved'), /Salvo/);
    assert.deepEqual(a.erros, []);
    await a.fechar();
  }
});

test('prazo de execução integrado ao calendário: marca os dias, aceita ajuste, confere e não aceita data passada', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const id = await criarOrcamento(p, 'Cliente Prazo', 'Reforma');
  await p.evaluate(id => go('/q/' + id), id);
  await abrirPainel(p, `q:${id}:cond`);
  await p.click('[data-days="1"]'); await p.click('[data-days="1"]');
  await escolher(p, 'q-prazo-u', 'uteis');
  assert.equal(await p.inputValue('#q-days'), '3');
  // dias passados não podem ser escolhidos no orçamento
  const ontem = await p.evaluate(() => maisDias(hojeTs(), -1));
  if (await p.locator(`[data-cal="${ontem}"]`).count()) assert.equal(await p.locator(`[data-cal="${ontem}"]`).isDisabled(), true);
  // toque no início: o app marca 3 dias úteis, pulando fins de semana e feriados
  const ini = await p.evaluate(() => hojeTs());
  await p.click(`[data-cal="${ini}"]`);
  const dias = await p.evaluate(id => getQ(id).dates, id);
  assert.equal(dias.length, 3);
  assert.ok(await p.evaluate(L => L.slice(1).every(diaUtil), dias), 'marcou dia que não é útil');
  assert.match(await p.textContent('#cal-msg'), /3 dias úteis/);
  // tirar um dia: a conferência acusa e o atalho ajusta o prazo
  await p.evaluate(id => { const q = getQ(id); q.dates = q.dates.slice(0, 2); }, id);
  await p.click('[data-days="-1"]'); await p.click('[data-days="1"]'); // repinta
  // depois de mudar o prazo, o app remarca a partir do início
  assert.equal(await p.evaluate(id => getQ(id).dates.length, id), 3);
  await p.evaluate(id => { const q = getQ(id); q.dates.pop(); }, id);
  await escolher(p, 'q-prazo-u', 'corridos'); await escolher(p, 'q-prazo-u', 'uteis');
  assert.equal(await p.evaluate(id => getQ(id).dates.length, id), 3, 'trocar a unidade remarca os dias');
  await p.evaluate(id => { getQ(id).dates.pop(); }, id);
  await p.click('[data-cal-reset]');
  assert.equal(await p.evaluate(id => getQ(id).dates.length, id), 0);
  // marca de novo e tira o último dia: não confere
  await p.click(`[data-cal="${ini}"]`);
  const ult = await p.evaluate(id => { const L = getQ(id).dates; calMonth[id] = L[2]; return L[2]; }, id);
  await p.click('[data-calm="1"]'); await p.click('[data-calm="-1"]');
  if (!(await p.locator(`[data-cal="${ult}"]`).count())) await p.click('[data-calm="1"]');
  await p.click(`[data-cal="${ult}"]`);
  assert.match(await p.textContent('#cal-msg'), /O prazo é de 3 dias úteis e há 2 dias marcados/);
  await p.click('[data-days-fix]');
  assert.deepEqual(await p.evaluate(id => getQ(id).prazo, id), { n: 2, u: 'uteis' });
  assert.equal(await p.evaluate(id => daysOk(getQ(id)), id), true);
  assert.equal(await p.evaluate(id => getQ(id).deadline, id), '2 dias úteis', 'o texto antigo acompanha, para outros aparelhos');
  // semanas: os dias marcados precisam caber no período
  assert.equal(await p.evaluate(() => { const q = { prazo: { n: 1, u: 'semanas' }, dates: [], status: 'rascunho' }; const t = maisDias(hojeTs(), 1); q.dates = [t, maisDias(t, 10)]; return prazoProblema(q); }), 'fora');
  // orçamento com data que já passou: avisa
  assert.equal(await p.evaluate(() => prazoProblema({ prazo: { n: 1, u: 'uteis' }, dates: [maisDias(hojeTs(), -2)], status: 'rascunho' })), 'retro');
  // textos antigos de prazo viram quantidade e unidade
  assert.deepEqual(await p.evaluate(() => ['2 dias úteis', '1 semana', 'No mesmo dia', '3 meses', 'xyz'].map(prazoDeTexto)), [{ n: 2, u: 'uteis' }, { n: 1, u: 'semanas' }, { n: 1, u: 'corridos' }, { n: 3, u: 'meses' }, null]);
  // feriados nacionais
  assert.deepEqual(await p.evaluate(() => [feriado(new Date(2026, 3, 3, 12).getTime()), feriado(new Date(2026, 10, 20, 12).getTime())]), ['Sexta-feira Santa', 'Dia da Consciência Negra']);
  // relatório: os dias valem como execução
  await p.evaluate(id => { const q = getQ(id); q.dates = [dayTs(Date.now() - 3 * DAY), dayTs(Date.now() - DAY)]; setStatus(q, 'concluido'); }, id);
  assert.match(await p.evaluate(id => execText(getQ(id)), id), /2 dias/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('proposta: Concluir volta para a lista e confirma que foi salvo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await criarOrcamento(p, 'Cliente Concluir', 'Troca de tomada');
  await abrirCat(p, '[data-open]');
  await p.click('[data-open]');
  await p.click('.bbar [data-preview]');
  await p.locator('[data-concluir]').click();
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'home')), 'Concluir não voltou para a lista');
  assert.ok(await esperar(async () => /Orçamento salvo/.test(await p.textContent('body'))), 'faltou o aviso de salvo');
  assert.equal(await p.evaluate(() => history.state && history.state.d), 0, 'o histórico deveria voltar ao começo');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('gestão: estoque pela categoria e material de Preços, ferramentas pré-cadastradas, checklist e lista de compras', async () => {
  const a = await aparelho(amb, { viewport: { width: 360, height: 740 } });
  const p = a.page;
  await criarOrcamento(p, 'Cliente Gestão', 'Troca de tomada');
  await irPelaNav(p, 'Gestão');
  assert.equal(await p.evaluate(() => route().name), 'gestao');
  assert.ok(await semRolagemLateral(p));
  // estoque: primeiro a categoria, depois o material da tabela de Preços daquela categoria
  const ref = await p.evaluate(() => { const x = prices.find(y => y.kind === 'mat'); return { id: x.id, cat: x.cat, price: x.price, name: x.name }; });
  await p.click('[data-g-new]');
  assert.equal(await p.locator('#st-mat-esc').isDisabled(), true, 'o material vem depois da categoria');
  assert.equal(await p.locator('select:visible').count(), 0, 'nenhuma lista do sistema na tela');
  await escolher(p, 'st-cat-sel', ref.cat);
  const opts = await p.locator('#st-mat option').evaluateAll(L => L.map(o => o.value));
  assert.ok(opts.includes(ref.id) && opts.includes('__novo'));
  assert.equal(await p.evaluate(([ids, cat]) => ids.filter(i => i && i !== '__novo').every(i => prices.find(x => x.id === i).cat === cat), [opts, ref.cat]), true, 'só materiais da categoria');
  await escolher(p, 'st-mat', ref.id);
  assert.equal(await p.inputValue('#st-price'), await p.evaluate(v => BRL(v), ref.price), 'o repasse vem da tabela');
  await p.fill('#st-brand', 'Steck'); await p.fill('#st-qty', '5'); await p.fill('#st-cost', '100');
  await p.click('.kf-dlg [data-save]');
  assert.deepEqual(await p.evaluate(id => { const x = prices.find(y => y.id === id); return [x.stock, x.cost, x.brand]; }, ref.id), [5, 100, 'Steck']);
  // materiais: Em estoque · Repor · Catálogo; a caixa do material aceita outra marca e o mínimo
  assert.deepEqual(await p.locator('[data-mf]').evaluateAll(L => L.map(b => b.querySelector('span').textContent.trim())), ['em estoque', 'para repor', 'no catálogo']);
  await abrirCat(p, `[data-mat="${ref.id}"]`);
  await p.click(`[data-mat="${ref.id}"]`);
  await abrirCat(p, '.kf-dlg [data-novo-lote]');
  await p.click('.kf-dlg [data-novo-lote]');
  await p.fill('#lt-brand', 'WEG'); await p.fill('#lt-qty', '3'); await p.fill('#lt-cost', '200');
  await p.click('.kf-dlg [data-save]');
  await p.fill('#mt-min', '10'); await p.locator('#mt-min').dispatchEvent('change');
  await p.click('.kf-dlg :is([data-ok],[data-kf-ok])');
  assert.deepEqual(await p.evaluate(id => { const x = prices.find(y => y.id === id); return [x.stock, x.lotes.map(l => l.brand + ':' + l.qty), x.cost, x.min]; }, ref.id), [8, ['Steck:5', 'WEG:3'], 138, 10]);
  await p.click('[data-mf="repor"]');
  assert.match(await p.textContent('#g-body'), new RegExp(ref.name.replace(/[()]/g, '.')));
  // material novo numa categoria nova entra também em Preços
  await p.click('[data-g-new]');
  await escolher(p, 'st-cat-sel', '__nova'); await p.fill('#st-cat', 'Automação');
  await p.fill('#st-name', 'Relé biestável'); await p.fill('#st-price', '8000'); await p.fill('#st-qty', '0');
  await p.click('.kf-dlg [data-save]');
  assert.deepEqual(await p.evaluate(() => { const x = prices.find(y => y.name === 'Relé biestável'); return [x.kind, x.cat, x.stock]; }), ['mat', 'Automação', 0]);
  // ferramentas: já vêm cadastradas; cada linha abre a caixa da ferramenta, onde se diz se é sua
  await p.click('[data-aba="ferramentas"]');
  assert.ok(await p.evaluate(() => tiposTool().filter(t => t.seed).length) >= 40, 'faltam ferramentas pré-cadastradas');
  assert.deepEqual(await p.locator('[data-tf]').evaluateAll(L => L.map(b => b.querySelector('span').textContent.trim())), ['minhas', 'a comprar', 'no catálogo']);
  assert.equal(await p.locator('[data-tst], .tst').count(), 0, 'sem botões de estado na lista');
  await abrirCat(p, '[data-tipo="ft-multimetro-digital"]');
  await p.click('[data-tipo="ft-multimetro-digital"]');
  await abrirCat(p, '.kf-dlg [data-novo-item]');
  await p.click('.kf-dlg [data-novo-item]');
  await p.fill('#it-brand', 'Minipa'); await p.fill('#it-model', 'ET-1002'); await p.click('.kf-dlg [data-save]');
  await abrirCat(p, '.kf-dlg [data-novo-item]');
  await p.click('.kf-dlg [data-novo-item]');
  await p.fill('#it-brand', 'Fluke'); await p.fill('#it-model', '117'); await p.click('.kf-dlg [data-save]');
  assert.equal(await p.evaluate(() => itensDe('ft-multimetro-digital').length), 2, 'duas unidades do mesmo tipo, de marcas diferentes');
  await p.click('.kf-dlg :is([data-ok],[data-kf-ok])');
  // nova ferramenta: categoria, depois ferramenta, depois se é sua ou se quer comprar
  await p.click('[data-g-new]');
  await escolher(p, 'nt-cat', 'Furação e corte');
  await escolher(p, 'nt-tipo', 'ft-furadeira-de-impacto');
  await p.click('.kf-dlg [data-modo="quero"]');
  await p.click('.kf-dlg [data-save]');
  assert.equal(await p.evaluate(() => tools.find(t => t.id === 'ft-furadeira-de-impacto').quero), true);
  await p.click('[data-tf="minhas"]');
  assert.match(await p.textContent('#g-body'), /Fluke · 117/);
  assert.ok(await semRolagemLateral(p));
  // checklist fixo: ida e volta
  await p.click('[data-aba="checklist"]');
  await p.click('[data-ck-tools]');
  assert.equal(await p.locator('[data-ck]').count(), 1);
  await p.click('[data-g-new]'); await p.fill('#ck-name', 'Fita isolante'); await p.uncheck('#ck-back'); await p.click('.kf-dlg [data-save]');
  await abrirCat(p, '[data-ck]');
  await p.locator('[data-ck]').first().check();
  assert.match(await p.textContent('.g-prog'), /1 de 2/);
  await p.click('[data-lado="volta"]');
  assert.equal(await p.locator('[data-ck]').count(), 1, 'o que fica na obra não aparece na volta');
  // lista de compras: material em falta + ferramenta que quer comprar
  await p.click('[data-compras]');
  const lista = await p.textContent('#cp-list');
  assert.match(lista, /Relé biestável/); assert.match(lista, /Furadeira de impacto/);
  const href = await p.evaluate(() => { const a = document.querySelector('[data-cp-wa]'); a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click(); return a.getAttribute('href'); });
  assert.match(decodeURIComponent(href), /Lista de compras[\s\S]*Relé biestável[\s\S]*Furadeira de impacto/);
  // tudo isso vai na sincronização
  const pac = await p.evaluate(() => syncPayload());
  assert.ok(pac.tools.length >= 40); assert.equal(pac.checks.length, 2);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('prazo padrão nos Ajustes vale para o orçamento novo; prazo antigo em texto é convertido', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await guia(p, 'padrao');
  await p.fill('#st-prazoN', '2'); await escolher(p, 'st-prazoU', 'semanas');
  await p.locator('#st-prazoN').dispatchEvent('change');
  assert.deepEqual(await p.evaluate(() => blankQuote().prazo), { n: 2, u: 'semanas' });
  assert.deepEqual(await p.evaluate(() => fixQuote({ deadline: '3 dias úteis', prazo: { n: 1, u: 'uteis' } }).prazo), { n: 3, u: 'uteis' });
  assert.deepEqual(await p.evaluate(() => fixQuote({ deadline: '1 dia útil', prazo: { n: 1, u: 'uteis' } }).prazo), { n: 1, u: 'uteis' });
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('baixa no estoque ao concluir, devolução ao desfazer e aviso de estoque baixo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const id = await p.evaluate(() => {
    const d = prices.find(x => x.kind === 'mat'); Object.assign(d, { stock: 12, cost: 1000, min: 5 }); savePrices();
    const q = blankQuote(); q.num = ++settings.seq; q.client.name = 'Cliente Baixa'; q.status = 'aprovado'; q.approvedAt = Date.now();
    q.items = [{ id: uid(), kind: 'mat', name: d.name, unit: d.unit, qty: 8, price: d.price, room: '' }];
    quotes.push(q); saveQuotes(); go('/q/' + q.id); return q.id;
  });
  await p.click('.banner [data-st="concluido"]');
  await p.locator('.kf-dlg :is([data-ok],[data-kf-ok])').waitFor();
  assert.match(await p.textContent('#bx-list'), /12 → 4/);
  assert.match(await p.textContent('#bx-list'), /abaixo do mínimo/);
  await p.click('.kf-dlg [data-bq="-1"]'); // usou 7
  await p.click('.kf-dlg :is([data-ok],[data-kf-ok])');
  assert.equal(await p.evaluate(() => prices.find(x => x.kind === 'mat').stock), 5);
  assert.deepEqual(await p.evaluate(id => getQ(id).baixa.map(b => b.qty), id), [7]);
  // estoque baixo aparece na Gestão
  await p.evaluate(() => { gestaoAba = 'estoque'; matFiltro = 'repor'; go('/gestao'); });
  assert.match(await p.textContent('#g-body'), /tem 5, mínimo 5/);
  assert.equal(await p.evaluate(() => comprasN()), 1);
  // desfazer a conclusão devolve o material
  await p.evaluate(id => { setStatus(getQ(id), 'aprovado'); }, id);
  assert.equal(await p.evaluate(() => prices.find(x => x.kind === 'mat').stock), 12);
  assert.equal(await p.evaluate(id => getQ(id).baixa, id), null);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('aprovação com o calendário do app (sem datas futuras) e Comprei na caixa da ferramenta', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const id = await criarOrcamento(p, 'Cliente Aprovação', 'Troca de tomada');
  await p.evaluate(id => { setStatus(getQ(id), 'enviado'); go('/q/' + id); }, id);
  await p.click('.banner [data-st="aprovado"]');
  assert.equal(await p.locator('.kf-dlg input[type="date"]:visible').count(), 0, 'sem o calendário do sistema');
  assert.match(await p.textContent('#ap-date-data'), /\(hoje\)/);
  await p.click('#ap-date-data');
  const amanha = await p.evaluate(() => isoDe(maisDias(hojeTs(), 1)));
  if (await p.locator(`[data-kf-dia="${amanha}"]`).count()) assert.equal(await p.locator(`[data-kf-dia="${amanha}"]`).isDisabled(), true, 'aprovação não pode ser no futuro');
  const ontemIso = await p.evaluate(() => isoDe(maisDias(hojeTs(), -1))), ontem = await p.evaluate(() => maisDias(hojeTs(), -1));
  if (!(await p.locator(`[data-kf-dia="${ontemIso}"]`).count())) await p.click('.kf-cal [data-kf-mes="-1"]');
  await p.click(`[data-kf-dia="${ontemIso}"]`);
  await p.click('.kf-dlg :is([data-ok],[data-kf-ok])');
  assert.equal(await p.evaluate(([id, t]) => getQ(id).approvedAt === t, [id, ontem]), true);
  // Comprei: a ferramenta da lista de compras vai para Minhas ferramentas
  await p.evaluate(() => { const t = tools.find(x => x.id === 'ft-furadeira-de-impacto'); t.quero = true; t.queroQtd = 2; saveTools(); go('/gestao'); });
  await p.click('[data-aba="ferramentas"]');
  await p.click('[data-tf="quero"]');
  await abrirCat(p, '[data-tipo="ft-furadeira-de-impacto"]');
  await p.click('[data-tipo="ft-furadeira-de-impacto"]');
  await p.click('.kf-dlg [data-comprei]');
  assert.equal(await p.inputValue('#it-qty'), '2', 'traz a quantidade da lista de compras');
  await p.fill('#it-brand', 'Bosch'); await p.fill('#it-model', 'GSB 13 RE');
  await p.click('.kf-dlg [data-save]');
  assert.deepEqual(await p.evaluate(() => [tools.find(x => x.id === 'ft-furadeira-de-impacto').quero, itensDe('ft-furadeira-de-impacto').map(i => [i.brand, i.model, i.qty])]), [false, [['Bosch', 'GSB 13 RE', 2]]]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('pagamento: juros do cartão (taxa da maquininha, juros ao mês, sem juros até N×, débito) e desconto à vista', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const r = await p.evaluate(() => {
    settings.cardRates = { debito: 1.5, 1: 3, 6: 9, 12: 15 }; saveSettings();
    const q = blankQuote(); q.items = [{ id: 'x', kind: 'svc', name: 'Serviço', unit: 'un', qty: 1, price: 100000, room: '' }];
    const pg = q.payment, out = {};
    pg.mode = 'parcelado'; pg.installments = 6;
    pg.juros = 'sem'; out.sem = compute(q).card.total;
    pg.juros = 'taxa'; pg.paga = 'cliente'; const c1 = compute(q).card; out.repasse = [c1.total, c1.recebe, c1.parts.length];
    pg.paga = 'eu'; const c2 = compute(q).card; out.absorve = [c2.total, c2.recebe];
    pg.paga = 'cliente'; pg.semAte = 6; out.semAte6 = compute(q).card.total; pg.semAte = 3; out.semAte3 = compute(q).card.total;
    pg.semAte = 0; pg.juros = 'mes'; pg.mesPct = 2.5; const c3 = compute(q).card; out.mes = [c3.total, c3.parts[0]];
    pg.cardTipo = 'debito'; pg.juros = 'taxa'; const c4 = compute(q).card; out.deb = [c4.n, c4.total, c4.recebe];
    pg.cardTipo = 'credito'; pg.juros = 'taxa'; pg.installments = 6; out.texto = payText(q, compute(q));
    pg.mode = 'avista'; pg.avista = { mode: 'pct', pct: 5, value: 0 }; const c5 = compute(q); out.avista = [c5.total, c5.avistaTotal, c5.pixValue]; out.avTxt = payText(q, c5);
    pg.avista = { mode: 'value', pct: 0, value: 3000 }; out.avistaR = compute(q).avistaTotal;
    out.antigo = fixQuote({ payment: { mode: 'parcelado', entryPct: 50, installments: 4 } }).payment.juros;
    return out;
  });
  assert.equal(r.sem, 100000);
  assert.deepEqual(r.repasse, [109890, 100000, 6], 'repassada: o cliente paga o bastante para você receber o valor cheio');
  assert.deepEqual(r.absorve, [100000, 91000], 'paga por você: recebe menos');
  assert.equal(r.semAte6, 100000); assert.equal(r.semAte3, 109890);
  assert.deepEqual(r.mes, [108930, 18155], 'juros de 2,5% ao mês em 6× (parcelas iguais)');
  assert.deepEqual(r.deb, [1, 101523, 100000]);
  assert.match(r.texto, /6× de R\$\s?183,15.*total de R\$\s?1\.098,90 com a taxa do cartão/);
  assert.deepEqual(r.avista, [100000, 95000, 95000]);
  assert.match(r.avTxt, /5% de desconto para pagamento à vista/);
  assert.equal(r.avistaR, 97000);
  assert.equal(r.antigo, 'sem', 'orçamento antigo continua sem juros');
  // na tela: Cartão com taxa repassada mostra quanto você recebe
  const id = await criarOrcamento(p, 'Cliente Cartão', 'Troca de tomada');
  await p.evaluate(id => go('/q/' + id), id);
  await abrirPainel(p, `q:${id}:cond`);
  await p.click('[data-pm="parcelado"]');
  await p.click('[data-jur="taxa"]');
  for (let k = 0; k < 3; k++) await p.click('[data-in="1"]');
  assert.equal(await p.inputValue('#q-inst'), '6×');
  assert.match(await p.textContent('#pay-sum'), /Você recebe, depois da taxa/);
  await p.click('[data-pm="avista"]');
  await p.fill('#q-avd', '10');
  assert.match(await p.textContent('#pay-sum'), /Desconto à vista/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('2.16: preços de fábrica em cinza (sem confirmar), outras formas na proposta, alerta de margem e Comprei tudo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  // os preços que vêm com o app ficam em cinza; qualquer mudança (no item ou no reajuste) deixa preto; nada de confirmar
  const r = await p.evaluate(() => ({ antes: prices.filter(x => x.ref).length, total: prices.length, adic: [settings.surUrgent, settings.surNight, settings.surWeekend], emerg: prices.some(x => /Atendimento de emergência/.test(x.name)), ids: prices.filter(x => x.ref).slice(0, 2).map(x => x.id) }));
  assert.equal(r.antes, r.total, 'todos os preços do app começam em cinza');
  assert.deepEqual(r.adic, [0, 0, 0], 'adicionais começam vazios');
  assert.equal(r.emerg, false, 'sem Atendimento de emergência (o adicional de urgência já cobre)');
  await p.evaluate(() => go('/precos'));
  await abrirCat(p, `[data-pid="${r.ids[0]}"]`);
  assert.ok(await p.locator('.ref-v').count() > 0, 'preços de fábrica em cinza');
  assert.equal(await p.locator('.ref-tag, [data-ref-cat], [data-ref-ok], .ref-box, .banner.b-tip').count(), 0, 'sem etiqueta, sem confirmar e sem aviso no topo');
  assert.match(await p.locator('.ref-v').first().textContent(), /preço que vem com o app/, 'o leitor de tela ouve o que o cinza quer dizer');
  await p.click(`[data-pid="${r.ids[0]}"]`);
  assert.equal(await p.locator('.kf-dlg [data-ref-ok], .kf-dlg .ref-box').count(), 0);
  await p.fill('#pp-price', '99900'); await p.click('.kf-dlg [data-save]');
  assert.equal(await p.evaluate(id => prices.find(x => x.id === id).ref, r.ids[0]), false, 'preço mudado fica preto');
  await p.click('[data-adjust]'); await p.click('.kf-dlg [data-go]');
  assert.equal(await p.evaluate(id => prices.find(x => x.id === id).ref, r.ids[1]), false, 'reajuste também deixa preto');
  // janela de adicionar itens ao orçamento abre e lista a tabela (com os preços de fábrica em cinza)
  const qa = await criarOrcamento(p, 'Cliente Adicionar', 'Troca de tomada');
  await p.evaluate(id => { go('/q/' + id); const d = document.querySelector(`details[data-panel="q:${id}:items"]`); if (!d.open) KitFacil.secao.abrir(d); }, qa);
  await p.waitForTimeout(700);
  await abrirCat(p, '[data-add="mat"]');
  await p.click('[data-add="mat"]');
  assert.ok(await p.locator('.kf-dlg .pk-row').count() > 10, 'a lista de materiais abriu');
  assert.ok(await p.locator('.kf-dlg .pk-row .ref-v').count() > 0);
  await abrirCat(p, '.kf-dlg .pk-row');
  await p.locator('.kf-dlg .pk-row').first().click();
  await p.click('.kf-dlg [data-done]');
  assert.equal(await p.evaluate(id => getQ(id).items.filter(i => i.kind === 'mat').length, qa), 1, 'adicionou o material');
  // adicional sem percentual padrão: pede o valor no orçamento
  await p.evaluate(id => { const d = document.querySelector(`details[data-panel="q:${id}:val"]`); if (!d.open) KitFacil.secao.abrir(d); }, qa);
  await p.waitForTimeout(700);
  await p.click('[data-x="urgent"]'); await p.fill('#ax-pct', '40'); await p.click('.kf-dlg :is([data-ok],[data-kf-ok])');
  assert.deepEqual(await p.evaluate(id => [getQ(id).extras.urgent, settings.surUrgent], qa), [40, 40]);
  // outras formas na proposta
  const id = await criarOrcamento(p, 'Cliente Formas', 'Troca de tomada');
  await p.evaluate(id => { const q = getQ(id); q.payment.mode = 'avista'; q.payment.avista = { mode: 'pct', pct: 5, value: 0 }; touch(q); go('/q/' + id); }, id);
  await abrirPainel(p, `q:${id}:cond`);
  await p.click('[data-outra="parcelado"]');
  assert.equal(await p.locator('#pay-sum-parcelado').count(), 1);
  assert.match(await p.evaluate(id => outrasTxt(getQ(id)), id), /cartão/i);
  await p.evaluate(id => go('/q/' + id + '/proposta'), id);
  assert.match(await p.textContent('#app'), /Ou, se preferir/);
  assert.match(await p.evaluate(id => quoteMessage(getQ(id), compute(getQ(id))), id), /\*Ou, se preferir:\*/);
  // alerta de margem: material lançado abaixo do custo médio do estoque
  const am = await p.evaluate(() => {
    const m = prices.find(x => x.kind === 'mat'); m.lotes = [{ id: 'l1', brand: 'X', qty: 10, cost: m.price + 500 }]; acertaLotes(m); savePrices();
    const q = blankQuote(); q.items = [{ id: 'i', kind: 'mat', name: m.name, unit: m.unit, qty: 1, price: m.price, room: '' }];
    return abaixoCusto(q, q.items[0]) === m.cost;
  });
  assert.equal(am, true);
  // Comprei tudo: soma o material ao estoque e passa as ferramentas para Minhas
  const ct = await p.evaluate(() => { const m = prices.find(x => x.kind === 'mat'); m.repor = true; m.reporQtd = 4; savePrices(); const t = tools.find(x => x.id === 'ft-escada-de-6-degraus'); t.quero = true; t.queroQtd = 1; saveTools(); go('/gestao'); return m.stock; });
  await p.click('[data-compras]');
  await p.click('.kf-dlg [data-cp-tudo]');
  assert.deepEqual(await p.evaluate(() => { const m = prices.find(x => x.kind === 'mat'); return [m.stock, m.repor, tools.find(x => x.id === 'ft-escada-de-6-degraus').quero, itensDe('ft-escada-de-6-degraus').length]; }), [ct + 4, false, false, 1]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('2.19: linhas no lugar dos botões lado a lado, Geral excluível, arrastar rascunho para excluir e unidade fora do nome', async () => {
  const a = await aparelho(amb, { viewport: { width: 390, height: 844 } });
  const p = a.page;
  await p.locator('.kf-vazio [data-example]').waitFor();
  // material de fábrica sem unidade entre parênteses no nome
  const parens = await p.evaluate(() => prices.filter(x => x.kind === 'mat' && /\((pacote|barra|saco|galão|kit)/i.test(x.name)).map(x => x.name));
  assert.deepEqual(parens, []);
  assert.deepEqual(await p.evaluate(() => { const g = prices.find(x => x.name === 'Gesso 1 kg'); return [g.unit, unitTxt(2, 'saco'), unitName('galão')]; }), ['saco', 'sacos', 'galão']);
  // quem já tinha o nome antigo: a migração renomeia e acerta a unidade
  const mig = await p.evaluate(() => {
    const ps = JSON.parse(localStorage.getItem('eletricafacil.prices'));
    ps.push({ id: 'velho', kind: 'mat', cat: 'Diversos', name: 'Massa corrida (galão)', unit: 'un', price: 4500 });
    const i = ps.findIndex(x => x.name === 'Massa corrida'); if (i >= 0) ps.splice(i, 1);
    localStorage.setItem('eletricafacil.prices', JSON.stringify(ps));
    const st = JSON.parse(localStorage.getItem('eletricafacil.settings')); st.seedV = 5; localStorage.setItem('eletricafacil.settings', JSON.stringify(st));
  });
  await p.reload(); await p.locator('.kf-vazio [data-example]').waitFor();
  assert.deepEqual(await p.evaluate(() => { const m = prices.find(x => x.id === 'velho'); return [m.name, m.unit, settings.seedV]; }), ['Massa corrida', 'galão', 8]);
  // nenhum botão lado a lado sobrou no app
  const id = await criarOrcamento(p, 'Cliente Linhas', 'Troca de tomada');
  await p.evaluate(id => go('/q/' + id), id);
  await p.locator('[data-menu]').waitFor();
  assert.equal(await p.locator('.chip, .chips').count(), 0);
  assert.equal(await p.locator('.lin[data-x="urgent"][aria-pressed="false"]').count(), 1);
  assert.ok(await p.locator('.lin[data-note="0"] .mk').count());
  // Geral: os itens sem ambiente vão para um ambiente Geral, que tem menu e se exclui com Desfazer
  await abrirPainel(p, `q:${id}:items`).catch(() => {});
  await p.evaluate(id => { const q = getQ(id); q.useRooms = true; touch(q); render(); }, id);
  assert.deepEqual(await p.evaluate(id => getQ(id).rooms.map(r => [r.id, r.name]), id), [['geral', 'Geral']]);
  await abrirCat(p, '[data-room-menu="geral"]');
  await p.click('[data-room-menu="geral"]');
  await p.click('.kf-dlg [data-o="del"]');
  assert.deepEqual(await p.evaluate(id => [getQ(id).rooms.length, getQ(id).items.length], id), [0, 0]);
  await p.click('.kf-toast button');
  assert.deepEqual(await p.evaluate(id => [getQ(id).rooms.length, getQ(id).items.length], id), [1, 1]);
  // Novo ambiente em linhas, com Geral na lista
  await p.click('[data-new-room]');
  // já existe um Geral: a lista não oferece outro; sem Geral, ele vem primeiro
  assert.equal(await p.locator('.kf-dlg .lin[data-rn]').first().getAttribute('data-rn'), 'Sala');
  await p.keyboard.press('Escape');
  await p.evaluate(id => { const q = getQ(id); q.rooms = []; q.items = []; touch(q); render(); }, id);
  await abrirCat(p, '[data-new-room]');
  await p.click('[data-new-room]');
  assert.deepEqual(await p.locator('.kf-dlg .lin[data-rn]').evaluateAll(L => L.slice(0, 2).map(b => b.dataset.rn)), ['Geral', 'Sala']);
  await p.keyboard.press('Escape');
  // relatório técnico: textos padrão em linhas; etapa 2 com seções
  await p.evaluate(id => { const q = getQ(id); setStatus(q, 'concluido'); render(); }, id);
  await abrirCat(p, '[data-tc="diag"]');
  await p.click('[data-tc="diag"][data-ti="0"]');
  await p.locator('.kf-dlg [data-grp]').first().waitFor();
  assert.ok(await p.locator('.kf-dlg details[data-panel="tb:o"][open], .kf-dlg details[data-panel="tb:w"][open]').count());
  await p.locator('.kf-dlg [data-grp] .lin').first().click();
  assert.ok((await p.inputValue('#tb-out')).length > 3);
  await p.keyboard.press('Escape');
  // tela inicial: arrastar o rascunho para a esquerda mostra Excluir; Desfazer devolve
  const rid = await criarOrcamento(p, 'Rascunho Arrastar', 'Troca de tomada');
  await p.evaluate(() => { homeFilter = 'todos'; PANEL['home:rascunho'] = true; go('/'); });
  const card = p.locator(`[data-swipe="${rid}"] .qcard`);
  await card.waitFor();
  const bx = await card.boundingBox();
  await p.mouse.move(bx.x + bx.width - 20, bx.y + bx.height / 2); await p.mouse.down();
  for (let k = 1; k <= 10; k++) await p.mouse.move(bx.x + bx.width - 20 - k * 14, bx.y + bx.height / 2);
  await p.mouse.up();
  await p.waitForTimeout(350);
  assert.ok((await card.boundingBox()).x < bx.x - 80, 'o cartão deveria ter ido para a esquerda');
  assert.equal(await p.evaluate(() => location.hash.includes('/q/')), false, 'arrastar não abre o orçamento');
  // toca na parte à mostra, à direita do cartão
  const db = await p.locator(`[data-del-draft="${rid}"]`).boundingBox();
  await p.mouse.click(db.x + db.width - 40, db.y + db.height / 2);
  assert.equal(await p.evaluate(id => !!getQ(id), rid), false);
  await p.click('.kf-toast button');
  assert.equal(await p.evaluate(id => !!getQ(id), rid), true);
  assert.ok(await semRolagemLateral(p));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('2.19.1: nenhum parêntese nos nomes e rótulos, itens de fábrica editáveis, lista de escolha inteira à vista e Excluir sem emenda', async () => {
  const a = await aparelho(amb, { viewport: { width: 390, height: 844 } });
  const p = a.page;
  await p.locator('.kf-vazio [data-example]').waitFor();
  // catálogo de fábrica sem parênteses: preços, ferramentas e categorias
  assert.deepEqual(await p.evaluate(() => [...prices.map(x => x.name + x.cat), ...tools.map(t => (t.name || '') + (t.cat || ''))].filter(n => /[()]/.test(n))), []);
  // migração: quem tinha o nome antigo recebe o novo
  await p.evaluate(() => {
    const ps = JSON.parse(localStorage.getItem('eletricafacil.prices'));
    const i = ps.findIndex(x => x.name === 'Módulo de interruptor simples'); ps[i].name = 'Interruptor simples (módulo)';
    localStorage.setItem('eletricafacil.prices', JSON.stringify(ps));
    const st = JSON.parse(localStorage.getItem('eletricafacil.settings')); st.seedV = 6; localStorage.setItem('eletricafacil.settings', JSON.stringify(st));
  });
  await p.reload(); await p.locator('.kf-vazio [data-example]').waitFor();
  assert.equal(await p.evaluate(() => prices.some(x => x.name === 'Módulo de interruptor simples') && !prices.some(x => /\(/.test(x.name))), true);
  // material de fábrica: nome, categoria e unidade editáveis na Gestão
  const id = await p.evaluate(() => { const m = prices.find(x => x.ref && x.kind === 'mat'); go('/gestao'); return m.id; });
  await p.evaluate(id => matSheet(prices.find(x => x.id === id)), id);
  await abrirCat(p, '#mt-name');
  await p.fill('#mt-name', 'Material renomeado'); await p.locator('#mt-name').blur();
  await escolher(p, 'mt-unit', 'kit');
  assert.deepEqual(await p.evaluate(id => { const m = prices.find(x => x.id === id); return [m.name, m.unit]; }, id), ['Material renomeado', 'kit']);
  assert.equal((await p.textContent('.kf-dlg')).includes('('), false, 'a janela do material não deveria ter parênteses');
  // a lista de unidades abre com o último item à vista, acima do rodapé da janela
  await p.click('#mt-unit-esc');
  await p.waitForTimeout(900);
  const vis = await p.evaluate(() => { const ops = [...document.querySelectorAll('.kf-esc.kf-aberta .kf-esc-op')], l = ops.at(-1).closest('.kf-esc-lista'); l.scrollTop = l.scrollHeight; const r = l.getBoundingClientRect(), pe = document.querySelector('.kf-dlg-pe').getBoundingClientRect(); return r.bottom <= pe.top + 1; });
  assert.equal(vis, true, 'a lista deveria terminar acima do rodapé da janela');
  await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
  // ferramenta de fábrica: nome e categoria editáveis, e pode ser excluída
  await p.evaluate(() => typeSheet(tools.find(t => t.seed)));
  await abrirCat(p, '#tp-name');
  await p.fill('#tp-name', 'Ferramenta renomeada'); await p.locator('#tp-name').blur();
  assert.equal(await p.evaluate(() => tools.some(t => t.name === 'Ferramenta renomeada')), true);
  assert.equal(await p.locator('.kf-dlg [data-del]').count(), 1);
  await p.keyboard.press('Escape');
  // Excluir do rascunho: o vermelho cobre o cartão inteiro (sem emenda nos cantos) e some quando o cartão volta
  const rid = await p.evaluate(() => { const q = blankQuote(); q.num = ++settings.seq; q.client.name = 'R'; q.items = [{ id: uid(), kind: 'svc', name: 'x', unit: 'un', qty: 1, price: 100, room: '' }]; quotes.push(q); saveQuotes(); PANEL['home:rascunho'] = true; go('/'); return q.id; });
  const card = p.locator(`[data-swipe="${rid}"] .qcard`); await card.waitFor();
  assert.equal(await p.locator(`[data-swipe="${rid}"] .qc-del`).evaluate(b => getComputedStyle(b).opacity), '0');
  await p.focus(`[data-del-draft="${rid}"]`); await p.waitForTimeout(400);
  const g = await p.evaluate(id => { const w = document.querySelector(`[data-swipe="${id}"]`), d = w.querySelector('.qc-del').getBoundingClientRect(), r = w.getBoundingClientRect(); return [Math.round(d.left - r.left), Math.round(r.right - d.right), getComputedStyle(w.querySelector('.qc-del')).opacity]; }, rid);
  assert.deepEqual(g, [0, 0, '1']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('2.22: quantidade com ponto de milhar, garantia só números, parcelas sem perder centavos, imposto, composição e pagamentos', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const r = await p.evaluate(() => {
    const out = {};
    out.qtd = ['1.000', '2.5', '12,5', '1.000,5', 'abc', '-3', '0'].map(parseQty);
    const q = fixQuote({ items: [{ kind: 'svc', name: 'A', unit: 'un', qty: 1, price: 155975 }], payment: { mode: 'parcelado', installments: 10, juros: 'taxa', taxaPct: 12, paga: 'cliente', cardTipo: 'credito' } });
    const c = compute(q); out.recebe = c.card.recebe; out.total = c.total;
    const q2 = fixQuote({ items: [{ kind: 'svc', name: 'A', unit: 'un', qty: 1, price: 100000 }, { kind: 'mat', name: 'B', unit: 'un', qty: 1, price: 50000 }], tax: { mode: 'fora', pct: 5, base: 'servico' } });
    out.fora = [compute(q2).taxFora, compute(q2).total];
    q2.tax = { mode: 'dentro', pct: 5, base: 'servico' }; const c3 = compute(q2);
    out.dentro = [c3.labor, c3.total, c3.taxFora];
    out.antigo = fixQuote({ items: [] }).tax.mode;
    out.comp = (prices.find(x => x.name === 'Ponto novo de tomada com fiação') || {}).comp?.length || 0;
    out.catalogo = ['Conector de emenda', 'Orçamento no local'].map(n => prices.some(x => x.name === n));
    return out;
  });
  assert.deepEqual(r.qtd, [1000, 2.5, 12.5, 1000.5, null, null, null]);
  assert.ok(r.recebe >= r.total, `o eletricista recebeu ${r.recebe}, menos que ${r.total}`);
  assert.deepEqual(r.fora, [5000, 155000]);
  assert.deepEqual(r.dentro, [105263, 155263, 0]);
  assert.equal(r.antigo, 'sem', 'orçamento antigo ganhou imposto');
  assert.ok(r.comp >= 3, 'serviço sem composição de material');
  assert.deepEqual(r.catalogo, [false, false]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
