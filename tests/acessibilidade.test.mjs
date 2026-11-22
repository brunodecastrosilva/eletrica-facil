/* Elétrica Fácil 5 · varredura automática de acessibilidade (WCAG 2.2 A e AA) nas telas e janelas do app, nos temas claro
   e escuro. Usa o axe-core pelo pacote de desenvolvimento @axe-core/playwright (npm install). Sem ele, o teste é pulado
   com aviso: não conta como aprovado. Substitui, neste app, comum/testes/acessibilidade.test.mjs, que procura os Ajustes
   na barra do Kit. Nada fica de fora da varredura. */
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
const semAviso = p => p.evaluate(() => { const t = document.querySelector('.kf-toast'); if (t) t.hidden = true; });

for (const tema of ['light', 'dark']) {
  test(`acessibilidade (WCAG 2.2 AA): apresentação, telas, documento, janelas e Ajustes, tema ${tema === 'light' ? 'claro' : 'escuro'}`, async t => {
    if (!AxeBuilder) { t.skip('axe não instalado: rode npm install (pacote @axe-core/playwright)'); return; }
    falhas.length = 0;
    const a = await aparelho(amb, { viewport: { width: 390, height: 844 }, antes: () => { window.EF_TESTE_ABERTURA = true; } });
    const p = a.page, nome = tema === 'light' ? 'claro' : 'escuro';
    await p.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
    await p.locator('.kf-abertura').waitFor();
    for (let k = 0; k < 4; k++) { await varrer(p, `apresentação, tela ${k + 1} (${nome})`); await p.click('#kf-ab-prox'); }
    await p.locator('main.inicio').waitFor();
    await varrer(p, `Início, vazio (${nome})`);
    await p.evaluate(() => ir('/docs', true)); await varrer(p, `Documentos, vazio (${nome})`);
    // documento novo, em branco, e a janela de somar
    await p.evaluate(() => { ir('/', true); irPara('novo'); }); await p.locator('.kf-dlg [data-novo-tipo]').first().waitFor(); await varrer(p, `Novo documento (${nome})`);
    await p.click('.kf-dlg [data-novo-tipo="orc"]'); await p.locator('#hr-v').waitFor(); await varrer(p, `janela da hora (${nome})`);
    await p.click('.kf-dlg [data-hm="conta"]'); await p.locator('#hr-h').waitFor(); await varrer(p, `janela da hora, pela conta (${nome})`); await p.click('.kf-dlg [data-hm="digitar"]');
    await p.locator('#hr-v').click(); await p.locator('#hr-v').pressSequentially('12000'); await p.click('.kf-dlg [data-salvar]'); await p.locator('#cl-nome').waitFor(); await varrer(p, `janela do cliente novo (${nome})`);
    await p.fill('#cl-nome', 'Mariana Souza'); await p.fill('#cl-fone', '11988887777'); await p.fill('#cl-end', 'Rua das Acácias, 120'); await p.click('.kf-dlg [data-salvar]'); await p.locator('#pe-doc').waitFor(); await varrer(p, `orçamento em branco (${nome})`);
    await p.click('#conteudo [data-somar], #pe-doc [data-prox="somar"]'); await p.locator('.kf-dlg .blocos').waitFor(); await varrer(p, `Somar, categorias (${nome})`);
    await p.click('.kf-dlg [data-diag="60"]'); await p.click('.kf-dlg [data-ida="1"]'); await varrer(p, `Somar, com diagnóstico e ida (${nome})`);
    await p.click('.kf-dlg [data-diag="x"]'); await p.locator('.kf-dlg #ln-n').waitFor(); await varrer(p, `janela do diagnóstico (${nome})`); await fechar(p);
    await p.locator('#conteudo .itens .item', { hasText: 'Deslocamento' }).click(); await p.locator('#ln-q').waitFor(); await varrer(p, `janela do deslocamento (${nome})`); await fechar(p);
    await p.click('#conteudo [data-somar], #pe-doc [data-prox="somar"]'); await p.locator('.kf-dlg .blocos').waitFor();
    await p.click('.kf-dlg [data-cat="c-tomadas"]'); await p.click('.kf-dlg [data-soma="p-tomadas-1"]'); await varrer(p, `Somar, dentro da categoria (${nome})`);
    await p.fill('#so-q', 'tomada'); await varrer(p, `Somar, busca (${nome})`); await fechar(p);
    // levantamento por cômodo, materiais contados e a lista de materiais
    await p.click('#conteudo [data-levantar]'); await p.locator('.kf-dlg [data-cm="Sala"]').waitFor(); await varrer(p, `Qual cômodo (${nome})`);
    await p.click('.kf-dlg [data-cm="Sala"]'); await p.locator('.kf-dlg [data-com="Sala"]').waitFor(); await varrer(p, `Somar, no cômodo (${nome})`);
    await p.click('.kf-dlg [data-cat="c-tomadas"]'); await p.locator('.kf-dlg [data-acf]').first().waitFor(); await varrer(p, `Somar, filtro pela ação (${nome})`);
    await p.click('.kf-dlg [data-aba="mat"]'); await p.click('.kf-dlg [data-mts="p-materiais-5"]'); await varrer(p, `Somar, materiais (${nome})`);
    await p.locator('.kf-dlg [data-mt]').first().click(); await p.locator('#mt-c').waitFor(); await varrer(p, `material contado (${nome})`); await fechar(p);
    await p.locator('#pe-doc').waitFor(); await fechar(p);
    await p.click('#conteudo [data-j="mats"]'); await p.locator('.kf-dlg [data-por]').waitFor(); await varrer(p, `Lista de materiais (${nome})`); await fechar(p);
    await varrer(p, `orçamento por cômodo (${nome})`);
    await p.click('#conteudo [data-cmd="Sala"]'); await p.locator('#cmd-n').waitFor(); await varrer(p, `janela do cômodo (${nome})`); await fechar(p);
    await p.click('#conteudo [data-vista]'); await p.locator('#conteudo .sec-g-bt').first().waitFor(); await varrer(p, `orçamento por cômodo, em lista (${nome})`); await p.click('#conteudo [data-vista]'); await p.locator('#dc-car').waitFor();
    // o orçamento de exemplo, etapa por etapa
    await p.evaluate(() => { Object.assign(ajustes, { nome: 'Carlos Pereira', fone: '11988887777', pix: 'carlos@exemplo.com.br', cidade: 'São Paulo' }); salvarAjustes(); criarExemplo(); });
    await p.locator('#conteudo .itens .item').first().waitFor(); await varrer(p, `orçamento de exemplo (${nome})`);
    await p.locator('#conteudo .itens .item').first().click(); await p.locator('#ln-p').waitFor(); await varrer(p, `linha do documento (${nome})`); await fechar(p);
    await p.click('#conteudo [data-j="cliente"]'); await p.locator('#cl-nome').waitFor(); await varrer(p, `janela Cliente (${nome})`); await fechar(p);
    await p.click('#conteudo [data-cond]'); await p.locator('.kf-dlg [data-j="pag"]').waitFor(); await varrer(p, `janela Condições (${nome})`); await fechar(p);
    for (const j of ['titulo', 'pag', 'validade', 'prazo', 'garantia', 'desc', 'obs']) { await p.click('#conteudo [data-cond]'); await p.click(`.kf-dlg [data-j="${j}"]`); await p.locator('.kf-dlg #cd-corpo').waitFor(); await varrer(p, `janela ${j} (${nome})`); await fechar(p); }
    await p.evaluate(() => { const d = getDoc('exemplo'); d.cliente.nome = ''; tocarDoc(d); redesenhar(); });
    await p.click('#pe-doc [data-prox="enviar"]'); await p.locator('#cl-nome').waitFor(); await p.click('.kf-dlg [data-salvar]'); await varrer(p, `Cliente, com o nome apontado (${nome})`);
    await p.fill('#cl-nome', 'Mariana Souza'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' }); await semAviso(p);
    await p.click('#pe-doc [data-prox="enviar"]'); await p.locator('#ev-nome').waitFor(); await varrer(p, `Enviar (${nome})`); await fechar(p); await semAviso(p);
    await p.click('#pe-doc [data-menu]'); await p.locator('.kf-dlg .opcoes').waitFor(); await varrer(p, `Mais opções (${nome})`); await fechar(p);
    await p.evaluate(() => { const d = getDoc('exemplo'); d.cliente.nome = 'Mariana Souza'; d.etapa = 'enviado'; tocarDoc(d); redesenhar(); }); await varrer(p, `orçamento enviado (${nome})`);
    await p.evaluate(() => { const d = getDoc('exemplo'); d.etapa = 'recusado'; tocarDoc(d); redesenhar(); }); await varrer(p, `orçamento recusado (${nome})`);
    await p.evaluate(() => { const d = getDoc('exemplo'); d.etapa = 'aprovado'; tocarDoc(d); redesenhar(); });
    await p.click('#pe-doc [data-prox="receber"]'); await p.locator('#rc-v').waitFor(); await varrer(p, `Receber (${nome})`);
    await p.click('.kf-dlg [data-recebi]'); await p.locator('#conteudo [data-recibo]').waitFor(); await semAviso(p); await varrer(p, `orçamento com a entrada paga (${nome})`);
    await p.click('#conteudo [data-recibo]'); await p.locator('.kf-dlg .envios').waitFor(); await varrer(p, `Recibo (${nome})`); await fechar(p);
    await p.click('#conteudo [data-j="tempo"]'); await p.locator('.kf-dlg [data-igual]').waitFor(); await varrer(p, `janela do tempo real (${nome})`); await fechar(p);
    await p.evaluate(() => { const d = getDoc('exemplo'); d.pagos.push({ id: 'z', v: conta(d).falta, em: Date.now(), meio: 'Dinheiro' }); mudouDoc(d); redesenhar(); }); await varrer(p, `orçamento recebido (${nome})`);
    // relatório, com o dia do serviço no calendário do Kit
    await p.evaluate(() => { const d = getDoc('exemplo'); d.tipo = 'rel'; d.etapa = 'rascunho'; d.pagos = []; d.pag = 'vista'; d.feito = Date.now(); tocarDoc(d); redesenhar(); }); await varrer(p, `relatório (${nome})`);
    await p.click('#conteudo [data-cond]'); await p.click('.kf-dlg [data-j="feito"]'); await p.locator('.kf-dlg #cd-corpo').waitFor(); await varrer(p, `janela do dia do serviço (${nome})`); await fechar(p);
    // telas principais com dados
    await p.evaluate(() => { const d = getDoc('exemplo'); d.tipo = 'orc'; d.etapa = 'aprovado'; tocarDoc(d); ir('/', true); }); await varrer(p, `Início, com documento (${nome})`);
    await p.evaluate(() => ir('/docs', true)); await varrer(p, `Documentos (${nome})`);
    await p.evaluate(() => ir('/precos', true)); await varrer(p, `Preços (${nome})`);
    await p.click('#conteudo [data-nova-cat]'); await p.locator('#ct-n').waitFor(); await varrer(p, `Nova categoria (${nome})`); await fechar(p);
    await p.click('#conteudo [data-fcat="c-quadro"]'); await p.fill('#pr-q', 'disjuntor'); await p.locator('#conteudo [data-preco]:visible').first().waitFor(); await varrer(p, `Preços filtrado e com busca (${nome})`); await p.fill('#pr-q', '');
    await p.click('#conteudo [data-preco="p-quadro-1"]'); await p.locator('#pr-p').waitFor(); await varrer(p, `janela Preço (${nome})`); await fechar(p);
    await p.evaluate(() => ir('/mais', true)); await varrer(p, `Mais (${nome})`);
    await p.evaluate(() => ir('/ajustes', true)); await p.locator('[data-kf-aj]').waitFor(); await varrer(p, `Ajustes (${nome})`);
    for (const g of ['conta', 'cobranca', 'pix', 'padrao', 'raio']) { await p.evaluate(g => KitFacil.ajustes.abrir(g), g); await varrer(p, `Ajustes, guia ${g} (${nome})`); await p.evaluate(() => history.back()); await p.waitForTimeout(150); }
    assert.deepEqual(falhas, [], falhas.join('\n\n'));
    assert.deepEqual(a.erros, []);
    await a.fechar();
  });
}
