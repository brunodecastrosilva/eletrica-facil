/* Elétrica Fácil 1.0 · varredura automática de acessibilidade (WCAG 2.2 A e AA) nas telas do app, nos temas claro e escuro.
   Usa o axe-core pelo pacote de desenvolvimento @axe-core/playwright (npm install). Sem ele, o teste é pulado com aviso:
   não conta como aprovado. Substitui, neste app, comum/testes/acessibilidade.test.mjs, que procura os Ajustes na barra do Kit. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { preparar, aparelho } from '../comum/testes/ambiente.mjs';

const ETIQUETAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
async function carregarAxe() {
  for (const m of [process.env.AXE_MODULE, '@axe-core/playwright'].filter(Boolean)) { try { const x = await import(m); return x.AxeBuilder || x.default; } catch {} }
  return null;
}
let amb, AxeBuilder;
before(async () => { AxeBuilder = await carregarAxe(); if (AxeBuilder) amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const resumo = v => v.map(x => `${x.id} (${x.impact}): ${x.help} → ${x.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`).join('\n');
async function varrer(page, onde) {
  const r = await new AxeBuilder({ page }).withTags(ETIQUETAS).analyze();
  assert.equal(r.violations.length, 0, `acessibilidade em ${onde}:\n${resumo(r.violations)}`);
}

for (const tema of ['light', 'dark']) {
  test(`acessibilidade (WCAG 2.2 AA): abertura, folha, proposta, telas principais e Ajustes, tema ${tema === 'light' ? 'claro' : 'escuro'}`, async t => {
    if (!AxeBuilder) { t.skip('axe não instalado: rode npm install (pacote @axe-core/playwright)'); return; }
    const a = await aparelho(amb, { viewport: { width: 390, height: 844 }, antes: () => { window.EF_TESTE_ABERTURA = true; } });
    const p = a.page, nome = tema === 'light' ? 'claro' : 'escuro';
    await p.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
    await p.locator('.kf-abertura').waitFor();
    for (let k = 0; k < 4; k++) { await varrer(p, `abertura, tela ${k + 1} (${nome})`); if (k < 3) await p.click('#kf-ab-prox'); }
    await p.click('#kf-ab-ex'); await p.locator('.fo-orc').waitFor(); await p.waitForTimeout(400);
    await varrer(p, `Folha do orçamento (${nome})`);
    for (const painel of ['cli', 'items', 'val', 'cond', 'notes']) { await p.click(`details[data-panel$=":${painel}"] > summary`); await p.waitForTimeout(250); }
    await varrer(p, `Folha do orçamento, seções abertas (${nome})`);
    await p.click('[data-preview]'); await p.locator('.paper').first().waitFor();
    await varrer(p, `Proposta (${nome})`);
    await p.evaluate(() => go('/', true)); await p.locator('.prancheta').waitFor();
    await varrer(p, `Início (${nome})`);
    for (const [id, tela] of [['orcamentos', 'Orçamentos'], ['conquistas', 'Conquistas'], ['mais', 'Mais']]) { await p.click('#kf-nav-' + id); await p.waitForTimeout(300); await varrer(p, `${tela} (${nome})`); }
    await p.click('#kf-nav-conquistas'); await p.click('[data-lp="pix"]'); await p.locator('.kf-dlg .lp-nova').waitFor(); await p.waitForTimeout(300); await varrer(p, `Ficha da lâmpada (${nome})`); await p.click('.kf-dlg [data-kf-fechar]');
    for (const [id, tela] of [['precos', 'Preços'], ['gestao', 'Gestão']]) { await p.click('#kf-nav-mais'); await p.locator(`.kf-mais [data-kf-ir="${id}"]`).click(); await p.waitForTimeout(300); await varrer(p, `${tela} (${nome})`); }
    await p.click('#kf-nav-mais'); await p.locator('.kf-mais [data-kf="ajustes"]').click(); await p.locator('.kf-aj-h').waitFor();
    await varrer(p, `Ajustes (${nome})`);
    await a.fechar();
  });
}
