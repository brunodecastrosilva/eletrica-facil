/* Elétrica Fácil 3 · varredura automática de acessibilidade (WCAG 2.2 A e AA) nas telas do app, nos temas claro e escuro.
   Usa o axe-core pelo pacote de desenvolvimento @axe-core/playwright (npm install). Sem ele, o teste é pulado com aviso:
   não conta como aprovado. Substitui, neste app, comum/testes/acessibilidade.test.mjs, que procura os Ajustes na barra do Kit.
   Nada fica de fora da varredura: o preço de fábrica em letra fina passa no contraste (a exceção antiga acabou). */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { preparar, aparelho } from '../comum/testes/ambiente.mjs';

const ETIQUETAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
async function carregarAxe() {
  for (const m of [process.env.AXE_MODULE, '@axe-core/playwright'].filter(Boolean)) { try { const x = await import(m); return x.AxeBuilder || x.default?.AxeBuilder || x.default; } catch {} }
  return null;
}
let amb, AxeBuilder;
before(async () => { AxeBuilder = await carregarAxe(); if (AxeBuilder) amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const resumo = v => v.map(x => `${x.id} (${x.impact}): ${x.help} → ${x.nodes.slice(0, 3).map(n => n.target.join(' ') + ' ' + (n.any[0]?.message || '').slice(0, 120)).join(' | ')}`).join('\n');
const falhas = [];
async function varrer(page, onde) {
  await page.waitForTimeout(280);
  const r = await new AxeBuilder({ page }).withTags(ETIQUETAS).analyze();
  if (r.violations.length) falhas.push(`${onde}:\n${resumo(r.violations)}`);
  if (r.violations.length && process.env.AXE_LOG) (await import('node:fs')).appendFileSync(process.env.AXE_LOG, `${onde}:\n${resumo(r.violations)}\n\n`);
}
const fechar = async p => { await p.evaluate(() => KitFacil.dialogo.fechar(true)); await p.waitForTimeout(150); };

for (const tema of ['light', 'dark']) {
  test(`acessibilidade (WCAG 2.2 AA): apresentação, folha, janelas, telas principais e Ajustes, tema ${tema === 'light' ? 'claro' : 'escuro'}`, async t => {
    if (!AxeBuilder) { t.skip('axe não instalado: rode npm install (pacote @axe-core/playwright)'); return; }
    falhas.length = 0;
    const a = await aparelho(amb, { viewport: { width: 390, height: 844 }, antes: () => { window.EF_TESTE_ABERTURA = true; try { localStorage.setItem('eletricafacil.formato', '3'); } catch {} } });
    const p = a.page, nome = tema === 'light' ? 'claro' : 'escuro';
    await p.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
    await p.locator('.kf-abertura').waitFor();
    for (let k = 0; k < 4; k++) { await varrer(p, `apresentação, tela ${k + 1} (${nome})`); await p.click('#kf-ab-prox'); }
    await p.locator('.page.orc').waitFor(); await p.evaluate(() => { jogo.off = true; });
    await varrer(p, `Orçamentos, vazio (${nome})`);
    // a folha em branco e a janela de somar
    await p.click('.page.orc [data-novo]'); await p.locator('#fo-folha [data-add="svc"]').waitFor();
    await varrer(p, `folha em branco (${nome})`);
    await p.click('#fo-folha [data-add="svc"]'); await p.locator('#mt-lista .sx').first().waitFor();
    await p.locator('#mt-lista .mt-row .mt-mais').first().click();
    await varrer(p, `Somar serviço (${nome})`);
    await p.fill('#mt-q', 'tomada'); await varrer(p, `Somar, busca (${nome})`); await fechar(p);
    // a folha cheia: o orçamento de exemplo, com nome, Pix e ambientes
    await p.evaluate(() => { settings.name = 'Carlos Pereira'; settings.phone = '11988887777'; settings.pix = 'carlos@exemplo.com.br'; settings.city = 'São Paulo'; saveSettings(); createExample(); });
    await p.locator('#fo-folha .ln').first().waitFor();
    await varrer(p, `folha do exemplo (${nome})`);
    await p.locator('#fo-folha [data-ln]').first().click(); await p.locator('#fo-folha .ed').waitFor();
    await p.fill('#ed-p', ''); await p.type('#ed-p', '1290'); await p.locator('#ed-p').blur();
    await varrer(p, `linha aberta, com Guardar na tabela (${nome})`);
    for (const j of ['total', 'pag', 'prazo', 'gar', 'obs', 'aprov']) {
      await p.evaluate(j => abrirJanela(getQ(route().id), j), j); await p.locator('#fo-jan').waitFor();
      await varrer(p, `janela ${j} (${nome})`); await fechar(p);
    }
    await p.evaluate(() => { const q = getQ(route().id); q.payment.mode = 'parcelado'; q.payment.juros = 'taxa'; touch(q); abrirJanela(q, 'pag'); }); await p.locator('#fo-jan').waitFor();
    await varrer(p, `janela pag, cartão (${nome})`); await fechar(p);
    await p.evaluate(() => { const q = getQ(route().id); q.payment.mode = 'entrada'; touch(q); rerender(); });
    await p.click('#fo-visor [data-menu]'); await p.locator('.kf-dlg').waitFor(); await varrer(p, `Mais opções (${nome})`); await fechar(p);
    await p.evaluate(() => { const q = getQ(route().id); q.client.name = ''; setStatus(q, 'rascunho'); touch(q); rerender(); });
    await p.click('#fo-visor [data-prox]'); await p.locator('.kf-dlg #q-name').waitFor(); await p.click('.kf-dlg [data-pdf]');
    await varrer(p, `Enviar, com o nome apontado (${nome})`); await fechar(p);
    // enviado, aprovado, concluído (o relatório) e recebido
    await p.evaluate(() => { const q = getQ(route().id); q.client.name = 'Mariana Souza'; q.example = false; setStatus(q, 'enviado'); saveQuotes(); rerender(); });
    await varrer(p, `folha, enviado (${nome})`);
    await p.click('#fo-visor [data-prox="aprovou"]'); await p.locator('.kf-dlg').waitFor(); await varrer(p, `Aprovou (${nome})`); await fechar(p);
    await p.evaluate(() => { const q = getQ(route().id); setStatus(q, 'aprovado'); saveQuotes(); rerender(); });
    await varrer(p, `folha, aprovado (${nome})`);
    await p.click('#fo-visor [data-prox="concluir"]'); await p.locator('.kf-dlg [data-ok]').waitFor(); await varrer(p, `Concluir (${nome})`); await fechar(p);
    await p.evaluate(() => { const q = getQ(route().id); setStatus(q, 'concluido'); q.diag = 'Circuito da cozinha sem DR.'; q.work = 'Instalado DR e refeitas as tomadas.'; saveQuotes(); rerender(); });
    await varrer(p, `relatório, concluído (${nome})`);
    await p.evaluate(() => abrirJanela(getQ(route().id), 'tec:tests')); await p.locator('#fo-jan').waitFor(); await varrer(p, `Testes e verificações (${nome})`); await fechar(p);
    await p.click('#fo-visor [data-prox="receber"]'); await p.locator('.kf-dlg #pg-v').waitFor(); await varrer(p, `Receber (${nome})`); await fechar(p);
    await p.evaluate(() => { const q = getQ(route().id); q.pagos = [{ id: uid(), v: compute(q).total, t: Date.now(), how: 'pix' }]; saveQuotes(); rerender(); });
    await varrer(p, `folha, recebido (${nome})`);
    await p.click('#fo-visor [data-prox="recibo"]'); await p.locator('.kf-dlg').waitFor(); await varrer(p, `Recibo (${nome})`); await fechar(p);
    // Orçamentos com tudo: um de cada etapa, o Arquivo aberto e o resumo do mês
    await p.evaluate(() => {
      const novo = (n, st, f = () => {}) => { const q = blankQuote(); q.num = ++settings.seq; q.client.name = n; q.items = [{ id: uid(), kind: 'svc', name: 'Troca de tomada', unit: 'un', qty: 2, price: 5000, room: '' }]; quotes.push(q); if (st !== 'rascunho') setStatus(q, st); f(q); };
      novo('', 'rascunho'); novo('Paulo', 'enviado', q => { q.sentAt = Date.now() - 4 * 864e5; }); novo('Lúcia', 'aprovado'); novo('Rui', 'concluido'); novo('Recusado', 'recusado');
      saveSettings(); saveQuotes(); go('/', true);
    });
    await p.locator('.qd').waitFor(); await varrer(p, `Orçamentos, quadro (${nome})`);
    await p.click('[data-arquivo]'); await varrer(p, `Orçamentos, Arquivo aberto (${nome})`);
    await p.fill('#h-q', 'zzz'); await varrer(p, `Orçamentos, busca sem resultado (${nome})`); await p.fill('#h-q', '');
    await p.evaluate(() => go('/precos', true)); await p.locator('#pr-list .sx').first().waitFor(); await varrer(p, `Tabela (${nome})`);
    await p.locator('#pr-list .sx.ab .tb-row').first().click(); await p.locator('.kf-dlg').waitFor(); await varrer(p, `Tabela, preço (${nome})`); await fechar(p);
    await p.evaluate(() => { checks.push({ id: uid(), name: 'Escada', back: true, ida: true, volta: false }, { id: uid(), name: 'Fita isolante', back: false, ida: false, volta: false }); const c = prices.find(x => x.name === 'Caixa 4x2'); c.stock = 1; c.cost = 150; c.min = 4; acertaLotes(c); savePrices(); go('/obra', true); });
    for (const aba of ['levar', 'comprar', 'estoque', 'ferramentas']) { await p.click(`.page.obra [data-aba="${aba}"]`); await varrer(p, `Obra, ${aba} (${nome})`); }
    await p.evaluate(() => go('/mais', true)); await p.locator('.kf-mais').waitFor(); await varrer(p, `Mais (${nome})`);
    await p.evaluate(() => { jogo.off = false; jogoConferir({ silencioso: true }); go('/conquistas', true); }); await p.locator('.varal').waitFor(); await varrer(p, `Conquistas (${nome})`);
    await p.click('[data-lp="pix"]'); await p.locator('.kf-dlg .lp-nova').waitFor(); await varrer(p, `ficha da lâmpada (${nome})`); await fechar(p);
    await p.evaluate(() => go('/ajustes', true)); await p.locator('.kf-aj-h').waitFor(); await varrer(p, `Ajustes (${nome})`);
    assert.equal(falhas.length, 0, `acessibilidade, tema ${nome}:\n\n${falhas.join('\n\n')}`);
    assert.deepEqual(a.erros, []);
    await a.fechar();
  });
}
