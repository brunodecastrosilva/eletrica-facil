/* Elétrica Fácil 1.0 · testes da parte nova: Início (prancheta), navegação, folha do orçamento, conquistas (lâmpadas em 3D), abertura e guia.
   Rodam num Chromium, sem internet (comum/testes/ambiente.mjs). */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { preparar, aparelho, semRolagemLateral } from '../comum/testes/ambiente.mjs';

let amb;
before(async () => { amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const SEM_CONQUISTAS = `try { localStorage.setItem('eletricafacil.jogo', JSON.stringify({ flags: {}, vistas: {}, off: true, pronto: true })); } catch {}`;
const vermelho = (p, sel) => p.locator(sel).evaluate(b => getComputedStyle(b).backgroundColor);

test('Início: a prancheta começa o orçamento, lembra o cliente e mostra o rascunho em andamento', async () => {
  const a = await aparelho(amb, { antes: SEM_CONQUISTAS });
  const p = a.page;
  await p.locator('.prancheta #novo-nome').waitFor();
  assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), '', 'nenhuma caixa de texto começa selecionada');
  assert.equal(await p.textContent('.pr-num'), 'Orçamento nº 0001');
  await p.fill('#novo-nome', 'Mariana Souza'); await p.click('.pr-btn');
  await p.locator('.fo-orc').waitFor();
  assert.deepEqual(await p.evaluate(() => [route().name, quotes[0].client.name, quotes[0].num, quotes[0].status]), ['quote', 'Mariana Souza', 1, 'rascunho']);
  assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.matches('input, textarea')), false, 'a folha abre sem campo em foco');
  await p.evaluate(() => { const q = quotes[0]; q.client.phone = '11912345678'; q.items.push({ id: uid(), kind: 'svc', name: 'Troca de tomada', unit: 'un', qty: 2, price: 5000, room: '' }); touch(q); go('/', true); });
  // o rascunho em andamento aparece no Início, com Continuar e Excluir (vermelho, com Desfazer)
  await p.locator('.andamento').waitFor();
  assert.ok((await p.textContent('.andamento')).includes('Mariana Souza'));
  assert.equal(await vermelho(p, '.andamento [data-del-draft]'), 'rgb(179, 54, 43)', 'Excluir é vermelho e cheio');
  await p.click('.andamento [data-del-draft]');
  assert.ok(await esperar(() => p.evaluate(() => quotes.length === 0)));
  await p.click('.kf-toast button');
  assert.ok(await esperar(() => p.evaluate(() => quotes.length === 1)), 'Desfazer devolve o rascunho');
  // cliente conhecido: o nome digitado traz o telefone do orçamento anterior
  await p.fill('#novo-nome', 'mariana souza'); await p.click('.pr-btn');
  await p.locator('.fo-orc').waitFor();
  assert.deepEqual(await p.evaluate(() => { const q = getQ(route().id); return [q.client.name, q.client.phone, q.num]; }), ['Mariana Souza', '11912345678', 2]);
  // serviço já feito: nasce como relatório
  await p.evaluate(() => go('/', true)); await p.locator('[data-relatorio]').click();
  assert.ok(await esperar(() => p.evaluate(() => route().name === 'quote' && getQ(route().id).status === 'concluido')));
  // o mês é uma lista vertical, rótulo à esquerda e valor à direita (Código, Arts. 65, V, e 67)
  await p.evaluate(() => go('/', true)); await p.locator('.mes').waitFor();
  const xs = await p.locator('.mes-lin').evaluateAll(L => L.map(e => Math.round(e.getBoundingClientRect().left)));
  assert.equal(new Set(xs).size, 1, 'as linhas do mês ficam uma embaixo da outra');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('navegação: cinco posições com o orçamento novo no centro, Mais é uma tela e a folha tem Excluir em vermelho', async () => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const a = await aparelho(amb, { viewport });
    const p = a.page, largo = viewport.width >= 1024, pre = largo ? '#kf-trilho-' : '#kf-nav-';
    await p.locator('.prancheta').waitFor();
    if (!largo) assert.deepEqual(await p.locator('#nav .kf-nav-it').evaluateAll(L => L.map(b => b.dataset.kfIr)), ['inicio', 'orcamentos', 'novo', 'conquistas', 'mais']);
    await p.click(pre + 'orcamentos'); await p.locator('.kf-vazio').waitFor();
    assert.equal(await p.textContent('.kf-titulo'), 'Orçamentos');
    await p.click(pre + 'novo');
    await p.locator('.kf-dlg [data-kind="quote"]').waitFor();
    assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.matches('input, textarea')), false);
    await p.click('.kf-dlg [data-kind="quote"]'); await p.locator('.fo-orc').waitFor();
    assert.ok(await semRolagemLateral(p), `rolagem lateral na folha (${viewport.width})`);
    assert.equal(await vermelho(p, '[data-excluir]'), 'rgb(179, 54, 43)');
    assert.equal(await p.locator('#nav').isHidden(), true, 'na folha, a barra de baixo dá lugar ao total e a Ver proposta');
    await p.evaluate(() => { const q = getQ(route().id); q.client.name = 'Cliente Nav'; touch(q); }); await p.click('[data-excluir]'); await p.click('.kf-dlg [data-kf-ok]');
    assert.ok(await esperar(() => p.evaluate(() => route().name === 'lista' && quotes.length === 0)), 'excluir volta para a lista');
    await p.click(pre + 'mais'); await p.locator('.kf-mais').waitFor();
    assert.deepEqual(await p.locator('.kf-mais .kf-mais-tx b').allTextContents(), ['Preços', 'Gestão', 'Ver o guia', 'Abrir o orçamento de exemplo', 'Ajustes']);
    await p.click('.kf-mais [data-kf-ir="gestao"]'); await p.locator('#g-body').waitFor();
    assert.equal(await p.locator('.kf-criar').count(), 0, 'sem botão flutuante: cada lista tem a sua linha de adicionar');
    assert.equal(await p.locator('.kf-adicionar[data-g-new]').count(), 1);
    assert.ok(await semRolagemLateral(p));
    // com as conquistas desligadas, Preços ocupa o lugar delas na barra e sai da tela Mais
    await p.evaluate(() => { jogo.off = true; jogoSalvar(); go('/mais', true); });
    if (!largo) assert.deepEqual(await p.locator('#nav .kf-nav-it').evaluateAll(L => L.map(b => b.dataset.kfIr)), ['inicio', 'orcamentos', 'novo', 'precos', 'mais']);
    assert.deepEqual(await p.locator('.kf-mais .kf-mais-tx b').allTextContents(), ['Gestão', 'Ver o guia', 'Abrir o orçamento de exemplo', 'Ajustes']);
    await p.evaluate(() => go('/conquistas', true));
    assert.equal(await p.evaluate(() => route().name), 'mais', 'Conquistas desligadas não abrem');
    assert.deepEqual(a.erros, [], `erros em ${viewport.width}`);
    await a.fechar();
  }
});

test('conquistas: o primeiro orçamento acende uma lâmpada em 3D, o varal mostra o nível e dá para desligar nos Ajustes', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.locator('.nivel-ir').waitFor();
  assert.deepEqual(await p.evaluate(() => { const s = jogoEstado(); return [s.ganhas.length, s.nivel, s.nome, CONQUISTAS.length]; }), [0, 1, 'Aprendiz', 18]);
  await p.evaluate(() => { const q = blankQuote(); q.num = ++settings.seq; q.client.name = 'Ana'; q.items = [{ id: uid(), kind: 'svc', name: 'Troca de tomada', unit: 'un', qty: 1, price: 5000, room: '' }]; quotes.push(q); saveSettings(); saveQuotes(); render(); });
  // lâmpada nova: chega apagada, dá uma volta e acende
  await p.locator('.kf-dlg .lp-nova .ef-o3d').waitFor({ timeout: 5000 });
  assert.equal(await p.textContent('.kf-dlg .kf-dlg-tt, .kf-dlg h2'), 'Lâmpada acesa');
  assert.equal(await p.textContent('.kf-dlg .lp-nome'), 'Primeiro orçamento');
  assert.ok(['webgl', 'canvas'].includes(await p.getAttribute('.kf-dlg .ef-o3d', 'data-motor')), 'a lâmpada tem desenho com ou sem WebGL');
  assert.ok(await esperar(() => p.evaluate(() => document.querySelector('.kf-dlg .ef-o3d').classList.contains('acesa')), 5000), 'a lâmpada nova acende');
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-dlg .ef-o3d')).getPropertyValue('--luz').trim()), '1.000');
  await p.click('#lp-ver'); await p.locator('.varal').waitFor();
  assert.equal(await p.textContent('.varal-n'), '1 de 18 acesas');
  assert.equal(await p.locator('.varal .lp.on').count(), 1);
  assert.equal(await p.getAttribute('[data-lp="primeiro"]', 'aria-label'), 'Primeiro orçamento: acesa. Ver como acender');
  // a janela não volta para a mesma conquista
  await p.evaluate(() => render()); await p.waitForTimeout(1200);
  assert.equal(await p.locator('.kf-dlg').count(), 0);
  // ficha de uma lâmpada apagada: 3D que gira com o dedo e com as setas, e o caminho para acender
  await p.click('[data-lp="precos"]'); await p.locator('.kf-dlg .barra-xp').waitFor();
  assert.ok((await p.textContent('.kf-dlg')).includes('0 de 10'));
  const o = p.locator('.kf-dlg .ef-o3d');
  assert.equal(await o.getAttribute('aria-label'), 'Lâmpada Tabela com a sua cara, apagada. Deslize o dedo ou use as setas para girar.');
  assert.equal(await o.evaluate(e => e.classList.contains('acesa')), false);
  await o.focus(); const a0 = +(await o.getAttribute('data-ang'));
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120);
  const a1 = +(await o.getAttribute('data-ang'));
  assert.ok(a1 - a0 > 0.25, `a seta para a direita gira a lâmpada (${a0} → ${a1})`);
  const cx = await o.boundingBox();
  await p.mouse.move(cx.x + cx.width / 2, cx.y + cx.height / 2); await p.mouse.down(); await p.mouse.move(cx.x + cx.width / 2 - 60, cx.y + cx.height / 2, { steps: 6 }); await p.mouse.up();
  assert.ok(+(await o.getAttribute('data-ang')) < a1 - 0.3, 'arrastar para a esquerda gira para o outro lado');
  await p.click('.kf-dlg [data-kf-fechar]');
  // o filamento de cada lâmpada tem o desenho da conquista (um ícone para cada uma)
  assert.equal(await p.evaluate(() => CONQUISTAS.every(c => !!LP_IC[c.ic]) && new Set(CONQUISTAS.map(c => c.ic)).size === CONQUISTAS.length), true);
  // nenhuma conquista premia cobrar mais: o valor do orçamento não entra em nenhuma regra
  assert.equal(await p.evaluate(() => CONQUISTAS.some(c => /total|price|valor/i.test(String(c.ok) + String(c.prog || '')))), false);
  // desligar: sai da barra e do Início; nada é apagado
  await p.evaluate(() => KitFacil.ajustes.ir('conquistas')); await p.locator('#aj-jogo').waitFor({ state: 'attached' });
  await p.evaluate(() => document.querySelector('#aj-jogo').click());
  assert.deepEqual(await p.evaluate(() => [jogoLigado(), !!jogo.vistas.primeiro, !!document.querySelector('#kf-nav-conquistas')]), [false, true, false]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('lâmpada 3D: a malha é uma só para todas, com o vidro por último, e cabe num índice de 16 bits', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.locator('.prancheta').waitFor();
  const r = await p.evaluate(() => CONQUISTAS.map(c => { const o = document.createElement('div'); o.dataset.acesa = '1'; o._icone = LP_IC[c.ic]; const { M } = Lampada._malha(o); return [c.id, M.p.length / 3, M.i.length, M.vidro, M.p.some(v => !isFinite(v)), M.n.some(v => !isFinite(v))]; }));
  for (const [id, verts, idx, vidro, pRuim, nRuim] of r) {
    assert.ok(verts > 3000 && verts < 65536, `${id}: ${verts} pontos`);
    assert.ok(vidro > 0 && vidro < idx && idx % 3 === 0, `${id}: o vidro vem depois das peças opacas`);
    assert.equal(pRuim || nRuim, false, `${id}: a malha tem número inválido`);
  }
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('abertura: quatro telas com a cara do app (interruptor, planta, caminho e assinatura), uma vez só', async () => {
  // conta os raios desde o começo: o da chegada cai e some antes de o teste olhar
  const a = await aparelho(amb, { antes: () => { window.EF_TESTE_ABERTURA = 1; window.EF_RAIOS = 0; document.addEventListener('DOMContentLoaded', () => new MutationObserver(L => { for (const m of L) for (const n of m.addedNodes) if (n.nodeType === 1 && n.matches('.raio-svg')) window.EF_RAIOS++; }).observe(document.body, { childList: true, subtree: true })); } });
  const p = a.page;
  await p.locator('.kf-abertura').waitFor();
  assert.equal(await p.locator('.kf-ab-pontos i').count(), 4);
  // a marca chega com um raio (um só), que some sozinho e não recebe toque
  assert.ok(await esperar(() => p.evaluate(() => window.EF_RAIOS === 1), 3000), 'a apresentação começa com um raio');
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('#raio-cena')).pointerEvents), 'none');
  assert.ok(await esperar(() => p.evaluate(() => !document.querySelector('#raio-cena .raio-svg')), 3000), 'o raio some sozinho');
  // tela 1: o interruptor acende a luz
  assert.equal(await p.getAttribute('[data-ab-luz]', 'aria-pressed'), 'false');
  await p.click('[data-ab-luz]');
  assert.deepEqual(await p.evaluate(() => [document.querySelector('[data-ab-luz]').getAttribute('aria-pressed'), document.querySelector('.ab-sala').classList.contains('acesa'), document.querySelector('.ab-dica').textContent]), ['true', true, 'Luz acesa.']);
  // tela 2: a planta soma um ponto de tomada a cada toque
  await p.click('#kf-ab-prox'); await p.locator('.ab-planta').waitFor();
  const total = () => p.textContent('.ab-soma b');
  const antes = await total();
  await p.click('[data-ab-comodo="2"]');
  assert.notEqual(await total(), antes, 'tocar num cômodo muda o total');
  assert.equal(await p.locator('[data-ab-comodo="2"] .ab-pts i').count(), 1);
  await p.click('[data-ab-zerar]');
  assert.ok((await p.textContent('.ab-soma')).includes('0 pontos de tomada'));
  // tela 3: o caminho do serviço, em quatro lâmpadas
  await p.click('#kf-ab-prox'); await p.locator('.ab-caminho').waitFor();
  assert.deepEqual(await p.locator('.ab-passo b').allTextContents(), ['Enviada', 'Aprovada', 'Concluído', 'Recibo']);
  // tela 4: o nome aparece no cartão enquanto a pessoa escreve, e a primeira lâmpada acende
  await p.click('#kf-ab-prox'); await p.locator('#ab-eu').waitFor();
  assert.equal(await p.locator('#kf-ab-pular').isHidden(), true, 'a última tela não tem Pular');
  assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'kf-ab-t', 'a caixa do nome não começa selecionada');
  await p.fill('#ab-eu', 'Carlos Pereira');
  assert.deepEqual(await p.evaluate(() => [document.querySelector('#ab-cartao-nome').textContent, document.querySelector('.ab-assina').classList.contains('acesa')]), ['Carlos Pereira', true]);
  await p.click('#kf-ab-prox');
  await p.locator('.kf-dlg .lp-nova').waitFor({ timeout: 6000 });
  assert.equal(await p.textContent('.kf-dlg .lp-nome'), 'Primeira luz');
  assert.deepEqual(await p.evaluate(() => [settings.name, KitFacil.abertura.vista(), JSON.parse(localStorage.getItem('eletricafacil.settings')).name]), ['Carlos Pereira', true, 'Carlos Pereira']);
  await p.click('#lp-ok');
  await p.reload(); await p.locator('.prancheta').waitFor(); await p.waitForTimeout(600);
  assert.equal(await p.locator('.kf-abertura').count(), 0, 'a abertura não volta sozinha');
  assert.ok((await p.textContent('.saud')).includes('Carlos'));
  // rever, pelos Ajustes
  await p.evaluate(() => KitFacil.ajustes.ir('conquistas')); await p.locator('#aj-abertura').waitFor({ state: 'attached' });
  await p.evaluate(() => document.querySelector('#aj-abertura').click());
  await p.locator('.kf-abertura').waitFor();
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('raio de surpresa: cai e some sem tocar em nada, respeita o movimento reduzido e dá para desligar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.locator('.prancheta').waitFor();
  // um raio: tronco e galhos, dois clarões no máximo, e some em um segundo
  await p.evaluate(() => { Raio.cair({ forcar: true }); });
  await p.locator('#raio-cena .raio-svg').waitFor();
  assert.ok(await p.locator('#raio-cena .raio-miolo').count() >= 3, 'o raio tem tronco e galhos');
  assert.equal(await p.evaluate(() => document.body.classList.contains('raio-treme')), true, 'a tela treme com o raio');
  assert.equal(await p.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !e.closest('#raio-cena'); }), true, 'o raio não recebe toque');
  const picos = await p.evaluate(() => { const k = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } }).find(r => r.name === 'raio-luz'); const v = [...k.cssRules].map(r => +r.style.opacity); let n = 0; for (let i = 0; i < v.length; i++) if (v[i] > 0.2 && (i === 0 || v[i] > v[i - 1]) && (i === v.length - 1 || v[i] >= v[i + 1])) n++; return n; });
  assert.ok(picos <= 2, `cada raio dá no máximo dois clarões (${picos})`);
  assert.ok(await esperar(() => p.evaluate(() => !document.querySelector('#raio-cena').children.length && !document.body.classList.contains('raio-treme')), 3000), 'o raio some e a tela para');
  // não cai com alguém digitando nem logo depois de abrir; desligado, não cai nunca
  assert.equal(await p.evaluate(() => { const r = Math.random; Math.random = () => 0.05; try { Raio.sortear(); } finally { Math.random = r; } return document.querySelector('#raio-cena').children.length; }), 0, 'nada de raio nos primeiros segundos');
  await p.evaluate(() => KitFacil.ajustes.ir('conquistas')); await p.locator('#aj-raio').waitFor({ state: 'attached' });
  assert.equal(await p.evaluate(() => document.querySelector('#aj-raio').checked), true);
  await p.evaluate(() => document.querySelector('#aj-raio').click());
  assert.deepEqual(await p.evaluate(() => [Raio.ligado(), JSON.parse(localStorage.getItem('eletricafacil.jogo')).semRaio]), [false, true]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
  // movimento reduzido: nem raio, nem tempestade
  const b = await aparelho(amb); const q = b.page;
  await q.emulateMedia({ reducedMotion: 'reduce' }); await q.locator('.prancheta').waitFor();
  assert.deepEqual(await q.evaluate(async () => [await Raio.cair({ forcar: true }), await Raio.tempestade({ forcar: true }), document.querySelectorAll('#raio-cena > *').length]), [false, false, 0]);
  await b.fechar();
});

test('lâmpada pisca mais forte com um toque no fundo, e o varal balança com o dedo e com o celular', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.locator('.prancheta').waitFor();
  await p.evaluate(() => { settings.pix = 'a@b.co'; saveSettings(); jogoConferir({ silencioso: true }); go('/conquistas', true); });
  await p.locator('.varal.varal-vivo').waitFor();
  // passar o dedo pelo varal empurra as lâmpadas
  const giro = () => p.evaluate(() => Math.max(...[...document.querySelectorAll('.varal .lp-pend')].map(e => Math.abs(parseFloat((e.style.transform.match(/rotate\(([-\d.]+)rad/) || [0, 0])[1])))));
  const cx = await p.locator('.varal-fio').boundingBox();
  await p.mouse.move(cx.x + 20, cx.y + 60); await p.mouse.move(cx.x + cx.width - 20, cx.y + 60, { steps: 5 });
  assert.ok(await esperar(async () => (await giro()) > 0.12, 2000), 'as lâmpadas balançam quando o dedo passa');
  // o celular inclinado: as lâmpadas pendem para o lado de baixo (aqui, sinais do Android: sem pedir licença)
  await p.evaluate(() => { const e = new Event('devicemotion'); e.accelerationIncludingGravity = { x: -6.9, y: 6.9, z: 0 }; let n = 0; const t = setInterval(() => { dispatchEvent(e); if (++n > 130) clearInterval(t); }, 30); });
  assert.ok(await esperar(() => p.evaluate(() => { const L = [...document.querySelectorAll('.varal .lp-pend')].map(e => parseFloat((e.style.transform.match(/rotate\(([-\d.]+)rad/) || [0, 0])[1])); return L.every(v => v < -0.45 && v > -1.1); }), 4000), 'com a borda direita para baixo, as lâmpadas pendem para a direita');
  // chacoalhar: a aceleração vai de um lado para o outro e o varal acompanha
  await p.waitForTimeout(700);
  await p.evaluate(() => { let n = 0; const t = setInterval(() => { const e = new Event('devicemotion'); e.accelerationIncludingGravity = { x: 14 * Math.sin(n * 0.55), y: 9.8, z: 0 }; dispatchEvent(e); if (++n > 60) clearInterval(t); }, 30); });
  let maior = 0; for (let k = 0; k < 14; k++) { maior = Math.max(maior, await giro()); await p.waitForTimeout(100); }
  assert.ok(maior > 0.3, `chacoalhar balança o varal (${maior.toFixed(2)})`);
  // ficha: tocar no fundo faz a lâmpada piscar mais forte, um clarão por toque
  await p.click('[data-lp="pix"]'); await p.locator('.kf-dlg .ef-o3d[data-ligado]').waitFor();
  // o clarão dura menos de meio segundo: a página guarda o maior valor, quadro a quadro, para o teste não perder o pico
  await p.evaluate(() => { window.PICO = 0; const o = document.querySelector('.kf-dlg .ef-o3d'); (function f() { if (!o.isConnected) return; window.FORCA = parseFloat(o.style.getPropertyValue('--forca')) || 0; window.PICO = Math.max(window.PICO, window.FORCA); requestAnimationFrame(f); })(); });
  const pico = async () => { await p.waitForTimeout(700); return p.evaluate(() => { const v = [window.PICO, window.FORCA]; window.PICO = 0; return v; }); };
  assert.deepEqual(await pico(), [0, 0], 'parada, a lâmpada não pisca sozinha');
  const pal = await p.locator('.kf-dlg .lp-palco').boundingBox();
  await p.mouse.click(pal.x + 14, pal.y + 14);
  let [alto, fim] = await pico();
  assert.ok(alto > 0.6 && fim === 0, `o toque no fundo acende mais forte e volta ao normal (${alto}, ${fim})`);
  // tocar na própria lâmpada, sem arrastar, também pisca
  await p.mouse.click(pal.x + pal.width / 2, pal.y + pal.height / 2);
  [alto, fim] = await pico();
  assert.ok(alto > 0.6 && fim === 0, `o toque na lâmpada também pisca (${alto}, ${fim})`);
  // arrastar gira e não pisca
  await p.mouse.move(pal.x + pal.width / 2 - 40, pal.y + pal.height / 2); await p.mouse.down(); await p.mouse.move(pal.x + pal.width / 2 + 40, pal.y + pal.height / 2, { steps: 6 }); await p.mouse.up();
  assert.equal((await pico())[0], 0, 'arrastar só gira');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('guia: um só, do começo ao fim, sem avisos e sem gravar nada', async () => {
  const a = await aparelho(amb, { antes: () => { window.__avisos = []; const w = console.warn; console.warn = (...x) => { window.__avisos.push(x.map(String).join(' ')); w.apply(console, x); }; } });
  const p = a.page;
  await p.locator('.prancheta').waitFor();
  await p.evaluate(() => { const q = blankQuote(); q.num = ++settings.seq; q.client.name = 'Cliente Real'; q.items = [{ id: uid(), kind: 'svc', name: 'x', unit: 'un', qty: 1, price: 100, room: '' }]; quotes.push(q); settings.name = 'Eu Mesmo'; saveSettings(); saveQuotes(); jogoConferir({ silencioso: true }); render(); });
  const foto = () => p.evaluate(() => JSON.stringify([localStorage.getItem('eletricafacil.quotes'), localStorage.getItem('eletricafacil.settings'), localStorage.getItem('eletricafacil.prices'), localStorage.getItem('eletricafacil.tools')]));
  const antes = await foto();
  await p.evaluate(() => go('/mais', true)); await p.click('.kf-mais [data-kf-ir="guia"]');
  assert.ok(await esperar(() => p.evaluate(() => !!KitFacil.guia.estado())));
  assert.deepEqual(await p.evaluate(() => [semSalvar, quotes.length, settings.name]), [true, 0, 'Carlos Pereira'], 'a demonstração começa do zero');
  // a janela do guia fica num espaço só dela, encostada na barra de baixo
  const g = await p.evaluate(() => ({ fundo: Math.round(document.querySelector('#kf-gu-doca').getBoundingClientRect().bottom), nav: Math.round(document.querySelector('.kf-nav').getBoundingClientRect().top) }));
  assert.ok(Math.abs(g.fundo - g.nav) <= 1, 'a janela do guia encosta na barra de baixo, sem cobrir');
  const fim = Date.now() + 240000; let maior = 0;
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
