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

/* escolhe uma opção na lista suspensa do app (a <select> fica escondida, guardando o valor) */
const escolher = async (p, id, valor) => {
  await p.click(`#${id}-esc`);
  const k = await p.evaluate(([id, v]) => [...document.getElementById(id).options].findIndex(o => o.value === v || o.textContent === v), [id, valor]);
  await p.click(`#${id}-esc ~ .esc-lista [data-k="${k}"]`);
};
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
  await p.click('.kf-dlg [data-ok]');
  assert.ok(await esperar(() => p.evaluate(() => quotes.length === 1)), 'não restaurou a cópia nova');
  // e a cópia no formato antigo (versão 2.5 e anteriores)
  const antigo = caminho + '-antigo.json';
  await writeFile(antigo, JSON.stringify({ app: 'eletrica-facil', v: 2, at: Date.now(), settings: { name: 'Antigo' }, prices: copia.dados.prices, quotes: [] }));
  await p.setInputFiles('[data-kf-copia-arquivo]', antigo);
  await p.click('.kf-dlg [data-ok]');
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
  await p.click('[data-open]');
  await p.locator('[data-menu]').waitFor();
  assert.equal(await p.evaluate(() => history.length), antes + 1, 'o toque empilhou mais de uma tela no histórico');
  await p.goBack();
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'home')), 'um Voltar deveria levar à lista');
  await a.fechar();
});

test('orçamento: tocar numa seção abre essa e fecha a outra, com animação, sem passar do fim da página', async () => {
  for (const vp of [{ width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    const a = await aparelho(amb, { viewport: vp });
    const p = a.page;
    const id = await criarOrcamento(p, 'Cliente Seções', 'Troca de tomada');
    await p.evaluate(id => go('/q/' + id), id);
    assert.equal(await p.locator('[data-next]').count(), 0, 'o botão Próximo saiu do app');
    await abrirPainel(p, `q:${id}:cli`);
    await p.waitForTimeout(700);
    await p.click(`details[data-panel="q:${id}:val"] > summary`);
    assert.equal(await p.evaluate(id => document.querySelector(`details[data-panel="q:${id}:val"]`).classList.contains('anim'), id), true, 'a seção deveria abrir com animação');
    assert.ok(await esperar(() => p.evaluate(id => { const n = document.querySelector(`details[data-panel="q:${id}:val"]`), c = document.querySelector(`details[data-panel="q:${id}:cli"]`); return n.open && !c.open && !n.classList.contains('anim'); }, id)), 'não trocou de seção');
    await p.waitForTimeout(150);
    // a rolagem termina onde a página permite: nada de tranco depois da animação
    const pos = await p.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight]);
    assert.ok(pos[0] <= pos[1] + 1, `rolou além do fim da página (${pos})`);
    assert.equal(await p.locator('.fold-folga').count(), 0, 'o espaço provisório deveria sair no fim');
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
  await p.fill('#st-qty', '5'); await p.fill('#st-cost', '100'); await p.fill('#st-min', '3');
  await p.click('.kf-dlg [data-save]');
  assert.deepEqual(await p.evaluate(id => { const x = prices.find(y => y.id === id); return [x.stock, x.cost, x.min]; }, ref.id), [5, 100, 3]);
  // material novo numa categoria nova entra também em Preços
  await p.click('[data-g-new]');
  await escolher(p, 'st-cat-sel', '__nova'); await p.fill('#st-cat', 'Automação');
  await p.fill('#st-name', 'Relé de impulso'); await p.fill('#st-price', '8000'); await p.fill('#st-qty', '0');
  await p.click('.kf-dlg [data-save]');
  assert.deepEqual(await p.evaluate(() => { const x = prices.find(y => y.name === 'Relé de impulso'); return [x.kind, x.cat, x.stock]; }), ['mat', 'Automação', 0]);
  // ferramentas: já vêm cadastradas; cada linha abre a caixa da ferramenta, onde se diz se é sua
  await p.click('[data-aba="ferramentas"]');
  assert.ok(await p.evaluate(() => tiposTool().filter(t => t.seed).length) >= 40, 'faltam ferramentas pré-cadastradas');
  assert.deepEqual(await p.locator('[data-tf]').evaluateAll(L => L.map(b => b.firstChild.textContent.trim())), ['Minhas ferramentas', 'Quero comprar', 'Ferramentas cadastradas']);
  assert.equal(await p.locator('[data-tst], .tst').count(), 0, 'sem botões de estado na lista');
  await p.click('[data-tipo="ft-multimetro-digital"]');
  await p.click('.kf-dlg [data-novo-item]');
  await p.fill('#it-brand', 'Minipa'); await p.fill('#it-model', 'ET-1002'); await p.click('.kf-dlg [data-save]');
  await p.click('.kf-dlg [data-novo-item]');
  await p.fill('#it-brand', 'Fluke'); await p.fill('#it-model', '117'); await p.click('.kf-dlg [data-save]');
  assert.equal(await p.evaluate(() => itensDe('ft-multimetro-digital').length), 2, 'duas unidades do mesmo tipo, de marcas diferentes');
  await p.click('.kf-dlg [data-ok]');
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
  await p.locator('[data-ck]').first().check();
  assert.match(await p.textContent('.g-prog'), /1 de 2/);
  await p.click('[data-lado="volta"]');
  assert.equal(await p.locator('[data-ck]').count(), 1, 'o que fica na obra não aparece na volta');
  // lista de compras: material em falta + ferramenta que quer comprar
  await p.click('[data-compras]');
  const lista = await p.textContent('#cp-list');
  assert.match(lista, /Relé de impulso/); assert.match(lista, /Furadeira de impacto/);
  const href = await p.evaluate(() => { const a = document.querySelector('[data-cp-wa]'); a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click(); return a.getAttribute('href'); });
  assert.match(decodeURIComponent(href), /Lista de compras[\s\S]*Relé de impulso[\s\S]*Furadeira de impacto/);
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
  await p.locator('.kf-dlg [data-ok]').waitFor();
  assert.match(await p.textContent('#bx-list'), /12 → 4/);
  assert.match(await p.textContent('#bx-list'), /abaixo do mínimo/);
  await p.click('.kf-dlg [data-bq="-1"]'); // usou 7
  await p.click('.kf-dlg [data-ok]');
  assert.equal(await p.evaluate(() => prices.find(x => x.kind === 'mat').stock), 5);
  assert.deepEqual(await p.evaluate(id => getQ(id).baixa.map(b => b.qty), id), [7]);
  // estoque baixo aparece na Gestão
  await p.evaluate(() => go('/gestao'));
  assert.match(await p.textContent('.g-repor'), /1 material para repor/);
  assert.match(await p.textContent('.g-repor'), /5 de 5/);
  // desfazer a conclusão devolve o material
  await p.evaluate(id => { setStatus(getQ(id), 'aprovado'); }, id);
  assert.equal(await p.evaluate(() => prices.find(x => x.kind === 'mat').stock), 12);
  assert.equal(await p.evaluate(id => getQ(id).baixa, id), null);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
