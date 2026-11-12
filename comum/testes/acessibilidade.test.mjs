/* Kit Fácil · varredura automática de acessibilidade (Código, Art. 16; Anexo VII).
   Roda o axe-core (regras WCAG 2.2 nível A e AA) na tela inicial e nos Ajustes de cada app, no tema claro e no escuro.
   Precisa do pacote de desenvolvimento @axe-core/playwright (npm install). Sem ele, o teste é pulado com aviso:
   não conta como aprovado. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { preparar, aparelho, abrirAjustesPelaNav } from './ambiente.mjs';

const ETIQUETAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function carregarAxe() {
  for (const m of [process.env.AXE_MODULE, '@axe-core/playwright'].filter(Boolean)) {
    try { const x = await import(m); return x.AxeBuilder || x.default; } catch {}
  }
  return null;
}

let amb, AxeBuilder;
before(async () => { AxeBuilder = await carregarAxe(); if (AxeBuilder) amb = await preparar(); });
after(async () => { await amb?.encerrar(); });

function resumo(violacoes) {
  return violacoes.map(v => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`).join('\n');
}

async function varrer(page, onde) {
  const r = await new AxeBuilder({ page }).withTags(ETIQUETAS).analyze();
  assert.equal(r.violations.length, 0, `acessibilidade em ${onde}:\n${resumo(r.violations)}`);
}

for (const tema of ['light', 'dark']) {
  test(`acessibilidade (WCAG 2.2 AA): tela inicial e Ajustes, tema ${tema === 'light' ? 'claro' : 'escuro'}`, async t => {
    if (!AxeBuilder) { t.skip('axe não instalado: rode npm install (pacote @axe-core/playwright)'); return; }
    const a = await aparelho(amb, { viewport: { width: 390, height: 844 } });
    const p = a.page;
    await p.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
    await p.waitForTimeout(600);
    await varrer(p, `abertura (${tema})`);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);
    await varrer(p, `tela inicial (${tema})`);
    await abrirAjustesPelaNav(p);
    await p.locator('.kf-aj-h').waitFor();
    await varrer(p, `Ajustes (${tema})`);
    await a.fechar();
  });
}
