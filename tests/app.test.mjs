/* Elétrica Fácil 4 · testes do app (npm test). Rodam num Chromium, sem internet: o GitHub (sincronização) é simulado por
   comum/testes/ambiente.mjs. Escritos junto com o app enxuto: seguem o orçamento e o relatório, o botão do pé, os preços
   em blocos, as contas, os documentos, o começo sem apagar a versão 3, o raio que cai sozinho, a apresentação e o guia. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, semRolagemLateral, conferirTopo, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ, semCampoEmFoco } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const fecharJanela = async p => { await p.evaluate(() => KitFacil.dialogo.fechar(true)); await p.waitForTimeout(150); };
const TELAS = [[{ width: 320, height: 568 }, 'celular mínimo'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
const pronto = p => p.locator('main.inicio').waitFor();
// campo de dinheiro do Kit: os dígitos entram como centavos (Regras do app, Art. 15)
const digitar = async (p, sel, digitos) => { await p.locator(sel).click(); await p.locator(sel).pressSequentially(digitos); await p.locator(sel).blur(); };
const novoPelaBarra = async (p, tipo) => { await p.evaluate(() => irPara('novo')); await p.locator(`.kf-dlg [data-novo-tipo="${tipo}"]`).click(); await p.locator('#pe-doc').waitFor(); };
const pe = p => p.evaluate(() => ({ rotulo: document.querySelector('#pe-doc [data-prox]').textContent.trim(), total: document.querySelector('#pe-doc .pe-total b').textContent.trim().replace(/\s/g, ' '), que: document.querySelector('#pe-doc .pe-total small').textContent.trim() }));
const aqui = p => p.evaluate(() => getDoc(rota().id));

test('abre sem erros em celular, tablet e computador, sem rolagem lateral; topo, navegação e nomes inteiros', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport }); const p = a.page;
    await pronto(p);
    assert.equal(await p.evaluate(() => VERSAO), versao, 'a versão do código é a do package.json');
    assert.deepEqual((await conferirTopo(p, { presente: true })).erros, [], `topo (${nome})`);
    assert.equal(await semRolagemLateral(p), true, `rolagem lateral em ${nome}`);
    const nomes = await p.evaluate(() => [...document.querySelectorAll(innerWidth >= 1024 ? '.kf-trilho [data-kf-ir]' : '.kf-nav [data-kf-ir]')].filter(b => b.getClientRects().length).map(b => (b.getAttribute('aria-label') || b.textContent).trim()));
    for (const n of ['Início', 'Documentos', 'Preços', 'Mais', 'Novo documento']) assert.ok(nomes.some(x => x.includes(n)), `${n} na navegação (${nome}): ${nomes.join(' | ')}`);
    assert.equal(nomes.filter(x => !x.includes('Novo')).length, 4, 'quatro seções e a ação do centro: no máximo cinco posições');
    assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-nav .kf-nav-it:not(.kf-nav-centro) .kf-nav-l')].filter(e => e.getClientRects().length && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)), [], `rótulo cortado na barra de baixo (${nome})`);
    for (const h of ['#/docs', '#/precos', '#/precos/c-quadro', '#/mais', '#/ajustes']) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(140); assert.equal(await semRolagemLateral(p), true, `rolagem lateral em ${h} (${nome})`); }
    await p.evaluate(() => { criarExemplo(); }); await p.locator('#pe-doc').waitFor();
    assert.equal(await semRolagemLateral(p), true, `rolagem lateral no documento (${nome})`);
    assert.deepEqual((await conferirTopo(p, { presente: false })).erros, [], `topo da tela interna (${nome})`);
    assert.deepEqual(a.erros, [], `erros no console (${nome})`);
    await a.fechar();
  }
});

test('começo novo: nada da versão 3 é apagado; vêm de lá os dados dos documentos e a ligação da nuvem; dado torto não trava', async () => {
  const a = await aparelho(amb, { antes: () => {
    if (sessionStorage.getItem('ja')) return; sessionStorage.setItem('ja', '1');
    const L = (k, v) => localStorage.setItem('eletricafacil.' + k, typeof v === 'string' ? v : JSON.stringify(v));
    L('formato', '3'); L('abertura', '1');
    L('settings', { name: 'Carlos Antigo', company: 'CA Elétrica', phone: '11999990000', pix: 'antigo@exemplo.com', city: 'Fortaleza', seq: 41 });
    L('quotes', [{ id: 'q1', client: { name: 'Cliente da versão 3' } }]); L('prices', [{ id: 'velho', kind: 'svc', name: 'Preço antigo', unit: 'un', price: 1 }]);
    L('sync', { token: 'ghp_antigo', gistId: 'abc', login: 'fulano', lastSync: 123, st: { 's:name': 5 }, del: { x: 1 } });
    L('docs', '{"isto":"não é uma lista"'); L('precos', '"texto"'); // lixo de propósito nas chaves novas
  } });
  const p = a.page; await pronto(p);
  const antigo = () => p.evaluate(() => ['settings', 'quotes', 'prices'].map(k => localStorage.getItem('eletricafacil.' + k)));
  const v3 = await antigo();
  assert.match(v3[1], /Cliente da versão 3/, 'os orçamentos da versão 3 continuam no aparelho');
  assert.match(v3[2], /Preço antigo/);
  assert.deepEqual(await p.evaluate(() => [ajustes.nome, ajustes.empresa, ajustes.fone, ajustes.pix, ajustes.cidade, ajustes.seq]), ['Carlos Antigo', 'CA Elétrica', '11999990000', 'antigo@exemplo.com', 'Fortaleza', 0]);
  assert.deepEqual(await p.evaluate(() => [docs.length, cats.length, precos.length > 50, precos.some(x => x.nome === 'Preço antigo')]), [0, 9, true, false], 'o app começa com o catálogo de fábrica, mesmo com lixo guardado');
  assert.deepEqual(await p.evaluate(() => [SY.ligada(), sinc.token, sinc.gistId, Object.keys(sinc.st).filter(k => k.startsWith('s:')).length, localStorage.getItem('eletricafacil.formato'), localStorage.getItem('eletricafacil.abertura')]), [true, 'ghp_antigo', '', 0, '4', null]);
  await p.evaluate(() => { ajustes.nome = 'Nome Novo'; salvarAjustes(); });
  await p.reload(); await pronto(p);
  assert.equal(await p.evaluate(() => ajustes.nome), 'Nome Novo', 'a passagem roda uma vez só');
  assert.deepEqual(await antigo(), v3, 'nada da versão 3 mudou');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('contas: subtotal, desconto, total, entrada e restante fecham no centavo; a etapa acompanha o que falta', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  const r = await p.evaluate(() => {
    const d = acertaDoc({ tipo: 'orc', linhas: [{ nome: 'A', un: 'un', q: 3, pu: 6000 }, { nome: 'B', un: 'm', q: 12, pu: 350 }, { nome: 'C', un: 'un', q: 1, pu: 11550 }], desc: 1250, pag: 'entrada', entradaPct: 40 });
    const o = { c1: conta(d), cob1: cobrarAgora(d) };
    d.pagos.push({ id: 'a', v: 5000, em: 1, meio: 'Pix' }); o.cob2 = cobrarAgora(d);
    d.pagos.push({ id: 'b', v: 8000, em: 1, meio: 'Pix' }); o.cob3 = cobrarAgora(d);
    d.etapa = 'aprovado'; d.pagos.push({ id: 'c', v: 19500, em: 1, meio: 'Dinheiro' }); acertaEtapa(d); o.etapa1 = d.etapa; o.c2 = conta(d);
    d.linhas.push({ id: 'x', pid: '', nome: 'D', un: 'un', q: 1, pu: 1000 }); acertaEtapa(d); o.etapa2 = d.etapa; o.falta2 = conta(d).falta;
    const q = acertaDoc({ tipo: 'orc', linhas: [{ nome: 'A', un: 'un', q: 1, pu: 33333 }], pag: 'entrada', entradaPct: 30 }); o.quebrado = conta(q);
    const g = acertaDoc({ tipo: 'orc', linhas: [{ nome: 'A', un: 'un', q: 1, pu: 5000 }], desc: 99999999 }); o.descMaior = conta(g);
    const rel = acertaDoc({ tipo: 'rel', pag: 'entrada', etapa: 'aprovado', linhas: [{ nome: 'A', un: 'un', q: 2, pu: 5000 }] });
    o.rel = [rel.pag, rel.etapa, ETAPAS.rel.length, conta(rel).entrada, proximo(rel).id, proximo({ ...rel, etapa: 'enviado' }).id];
    o.ext = [extenso(143550), extenso(100), extenso(1), extenso(100000000), extenso(2000), extenso(101)];
    return o;
  });
  assert.deepEqual(r.c1, { sub: 33750, desc: 1250, total: 32500, entrada: 13000, resto: 19500, pago: 0, falta: 32500 });
  assert.deepEqual([r.cob1, r.cob2, r.cob3], [{ v: 13000, que: 'a entrada' }, { v: 8000, que: 'a entrada' }, { v: 19500, que: 'o restante' }]);
  assert.deepEqual([r.etapa1, r.c2.falta, r.etapa2, r.falta2], ['recebido', 0, 'aprovado', 1000], 'quitou, vira Recebido; mexeu no valor, volta a cobrar');
  assert.equal(r.quebrado.entrada + r.quebrado.resto, r.quebrado.total, 'entrada e restante somam o total');
  assert.deepEqual([r.descMaior.desc, r.descMaior.total], [5000, 0], 'o desconto não passa do subtotal');
  assert.deepEqual(r.rel, ['vista', 'rascunho', 3, 0, 'enviar', 'receber'], 'o relatório não tem entrada nem etapa Aprovado');
  assert.deepEqual(r.ext, ['mil quatrocentos e trinta e cinco reais e cinquenta centavos', 'um real', 'um centavo', 'um milhão de reais', 'vinte reais', 'um real e um centavo']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('orçamento, do + ao recibo: somar em blocos, mudar a linha, desconto, entrada, Enviar pede o nome, Aprovou, Receber em duas vezes', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await p.click('#kf-nav-novo'); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click(); await p.locator('#pe-doc').waitFor();
  assert.equal(await semCampoEmFoco(p), true, 'nenhum campo é selecionado sozinho');
  assert.deepEqual(await pe(p), { rotulo: 'Somar serviço', total: 'R$ 0,00', que: 'Total' });
  // somar: blocos por categoria, cada toque soma um, o − tira um, a busca acha pelo nome
  await p.click('#pe-doc [data-prox]'); await p.locator('.kf-dlg .blocos .bloco').first().waitFor();
  assert.equal(await p.locator('.kf-dlg .blocos .bloco').count(), 9, 'um bloco por categoria');
  assert.equal(await semCampoEmFoco(p), true);
  await p.click('.kf-dlg [data-cat="c-tomadas"]');
  for (let i = 0; i < 3; i++) await p.click('.kf-dlg [data-soma="p-tomadas-1"]');
  assert.match(await p.locator('#so-conta').innerText(), /3 itens no documento · R\$\s180,00/);
  await p.click('.kf-dlg [data-tira="p-tomadas-1"]'); assert.match(await p.locator('#so-conta').innerText(), /2 itens .* R\$\s120,00/);
  await p.click('.kf-dlg [data-soma="p-tomadas-1"]');
  await p.fill('#so-q', 'chuveiro'); await p.click('.kf-dlg [data-soma="p-aparelhos-1"]');
  await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal(await p.locator('#conteudo .itens .item').count(), 2);
  assert.deepEqual(await pe(p), { rotulo: 'Enviar', total: 'R$ 295,00', que: 'Total' });
  // a linha: quantidade no passo a passo e preço em centavos ("1290" = R$ 12,90)
  await p.locator('#conteudo .itens .item').first().click(); await p.locator('#ln-p').waitFor();
  assert.equal(await semCampoEmFoco(p), true);
  await digitar(p, '#ln-p', '1290'); assert.match(await p.inputValue('#ln-p'), /R\$\s12,90/);
  await p.click('.kf-dlg [data-kf-passo="1"]'); await p.click('.kf-dlg [data-salvar]');
  assert.equal((await pe(p)).total, 'R$ 166,60', '4 × 12,90 + 115,00');
  assert.equal(await p.evaluate(() => precos.find(x => x.id === 'p-tomadas-1').preco), 6000, 'mudar a linha não muda a lista de preços');
  // desconto: não passa do subtotal
  await p.click('#conteudo [data-j="desc"]'); await p.locator('#cd-d').waitFor();
  await digitar(p, '#cd-d', '99999999'); await p.click('.kf-dlg [data-salvar]');
  assert.equal(await p.getAttribute('#cd-d', 'aria-invalid'), 'true'); assert.equal((await aqui(p)).desc, 0);
  await digitar(p, '#cd-d', '660'); await p.click('.kf-dlg [data-salvar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  assert.equal((await pe(p)).total, 'R$ 160,00');
  // pagamento com entrada
  await p.click('#conteudo [data-j="pag"]'); await p.click('.kf-dlg [data-pag="entrada"]'); await p.click('.kf-dlg [data-ep="40"]');
  assert.match(await p.locator('.kf-dlg [role="status"]').innerText(), /Entrada de 40% \(R\$\s64,00\) na aprovação e R\$\s96,00 na conclusão/);
  await p.click('.kf-dlg [data-kf-fechar]'); await p.locator('.kf-dlg').waitFor({ state: 'detached' });
  // enviar: o nome do cliente só é pedido aqui
  await p.click('#pe-doc [data-prox="enviar"]'); await p.locator('#ev-nome').waitFor();
  assert.equal(await semCampoEmFoco(p), true);
  await p.click('.kf-dlg [data-ja]');
  assert.equal(await p.getAttribute('#ev-nome', 'aria-invalid'), 'true', 'sem nome, o campo é apontado'); assert.equal((await aqui(p)).etapa, 'rascunho');
  await p.fill('#ev-nome', 'Mariana Souza'); await p.fill('#ev-fone', '(11) 98888-7777'); await p.click('.kf-dlg [data-ja]');
  assert.ok(await esperar(async () => (await aqui(p)).etapa === 'enviado'));
  assert.equal((await pe(p)).rotulo, 'Aprovou');
  assert.match(await p.evaluate(() => linkWhats(getDoc(rota().id).cliente.fone, 'oi')), /^https:\/\/wa\.me\/5511988887777\?text=oi$/);
  await p.click('#pe-doc [data-prox="aprovou"]');
  assert.equal((await aqui(p)).etapa, 'aprovado'); assert.equal((await pe(p)).rotulo, 'Receber');
  assert.equal(await p.locator('.kf-toast .kf-toast-acao').innerText(), 'Desfazer');
  // receber: primeiro a entrada, depois o restante; valor maior que o que falta é recusado
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('#pe-doc [data-prox="receber"]'); await p.locator('#rc-v').waitFor();
  assert.match(await p.inputValue('#rc-v'), /R\$\s64,00/, 'o valor sugerido é a entrada');
  await digitar(p, '#rc-v', '99999'); await p.click('.kf-dlg [data-recebi]');
  assert.equal(await p.getAttribute('#rc-v', 'aria-invalid'), 'true'); assert.equal((await aqui(p)).pagos.length, 0);
  await digitar(p, '#rc-v', '6400'); await p.click('.kf-dlg [data-recebi]');
  assert.ok(await esperar(async () => (await aqui(p)).pagos.length === 1));
  assert.deepEqual(await pe(p).then(x => [x.rotulo, x.que, x.total]), ['Receber', 'Falta', 'R$ 96,00']);
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('#pe-doc [data-prox="receber"]'); await p.locator('#rc-v').waitFor();
  assert.match(await p.inputValue('#rc-v'), /R\$\s96,00/);
  await p.click('.kf-dlg [data-meio="Dinheiro"]'); await p.click('.kf-dlg [data-recebi]');
  assert.ok(await esperar(async () => (await aqui(p)).etapa === 'recebido'));
  assert.deepEqual((await aqui(p)).pagos.map(x => [x.v, x.meio]), [[6400, 'Pix'], [9600, 'Dinheiro']]);
  assert.equal((await pe(p)).rotulo, 'Enviar recibo');
  // recibo: um por pagamento
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('#pe-doc [data-prox="recibo"]'); await p.locator('.kf-dlg [data-pg]').first().waitFor();
  assert.equal(await p.locator('.kf-dlg [data-pg]').count(), 2);
  assert.match(await p.evaluate(() => { const d = getDoc(rota().id); return mensagemRecibo(d, d.pagos[0]); }), /Olá, Mariana![\s\S]*Recebi R\$\s64,00 \(pix\)/);
  await fecharJanela(p);
  // voltar uma etapa tira os recebimentos, e Desfazer devolve
  await p.click('#pe-doc [data-menu]'); await p.click('.kf-dlg [data-m="volta"]');
  assert.deepEqual(await aqui(p).then(d => [d.etapa, d.pagos.length]), ['aprovado', 0]);
  await p.click('.kf-toast .kf-toast-acao');
  assert.deepEqual(await aqui(p).then(d => [d.etapa, d.pagos.length]), ['recebido', 2]);
  // o Início: nada em andamento, e o recebido do mês
  await p.evaluate(() => ir('/', true));
  assert.match(await p.locator('.painel').innerText(), /Recebido neste mês\s+R\$\s160,00/);
  assert.equal(await p.locator('#conteudo .docs .doc').count(), 0);
  await p.evaluate(() => ir('/docs', true)); assert.equal(await p.locator('#dc-lista .doc').count(), 1);
  await p.fill('#dc-q', 'ninguém'); assert.equal(await p.locator('#dc-lista .doc').count(), 0);
  await p.fill('#dc-q', 'mariana'); assert.equal(await p.locator('#dc-lista .doc').count(), 1);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('relatório: cobra o que já foi feito; três etapas, sem entrada e sem Aprovou; linha avulsa; documento vazio some ao sair', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await novoPelaBarra(p, 'rel');
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#conteudo .tr-passos li span')].map(e => e.textContent)), ['Rascunho', 'Enviado', 'Recebido']);
  assert.equal(await p.locator('#conteudo [data-j="feito"]').count(), 1); assert.equal(await p.locator('#conteudo [data-j="validade"]').count(), 0);
  await p.click('#conteudo [data-j="pag"]'); assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-dlg [data-pag]')].map(b => b.dataset.pag)), ['vista', 'combinar']); await fecharJanela(p);
  await p.click('#conteudo [data-j="feito"]'); await p.locator('.kf-dlg').waitFor();
  assert.equal(await p.locator('.kf-dlg input[type="date"]:not([hidden])').count(), 0, 'o calendário é o do Kit, não o do sistema'); await fecharJanela(p);
  await p.click('#conteudo [data-somar]'); await p.click('.kf-dlg [data-avulsa]'); await p.locator('#ln-n').waitFor();
  await p.click('.kf-dlg [data-salvar]'); assert.equal(await p.getAttribute('#ln-n', 'aria-invalid'), 'true');
  await p.fill('#ln-n', 'Troca da fiação do banheiro'); await digitar(p, '#ln-p', '35000'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#conteudo .itens .item').waitFor();
  assert.equal((await pe(p)).total, 'R$ 350,00');
  await p.click('#pe-doc [data-prox="enviar"]'); await p.fill('#ev-nome', 'João Lima'); await p.click('.kf-dlg [data-ja]');
  assert.ok(await esperar(async () => (await aqui(p)).etapa === 'enviado'));
  assert.equal((await pe(p)).rotulo, 'Receber', 'no relatório, depois de enviar vem receber');
  assert.match(await p.evaluate(() => mensagem(getDoc(rota().id))), /Olá, João![\s\S]*relatório do serviço executado em[\s\S]*• 1 un\. · Troca da fiação do banheiro: R\$\s350,00[\s\S]*\*Total: R\$\s350,00\*[\s\S]*Pagamento à vista\./);
  assert.equal(await p.evaluate(() => painel().receber), 35000, 'relatório enviado entra em Para receber');
  // documento novo que ficou vazio some ao sair, e o número volta
  const antes = await p.evaluate(() => [docs.length, ajustes.seq]);
  await p.evaluate(() => { fecharJanela(true); ir('/', true); irPara('novo'); }); await p.locator('.kf-dlg [data-novo-tipo="orc"]').click(); await p.locator('#pe-doc').waitFor();
  assert.equal(await p.evaluate(() => ajustes.seq), antes[1] + 1);
  await p.click('.barra-app [data-voltar]'); await pronto(p);
  assert.deepEqual(await p.evaluate(() => [docs.length, ajustes.seq]), antes);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Preços: blocos em grade, um por categoria; mudar preço em centavos; preço e categoria novos; excluir com Desfazer', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await p.evaluate(() => ir('/precos', true)); await p.locator('#conteudo .blocos').waitFor();
  assert.equal(await p.locator('#conteudo .blocos .bloco').count(), 10, 'nove categorias de fábrica e o bloco de criar');
  const grade = await p.evaluate(() => [...document.querySelectorAll('#conteudo .blocos .bloco')].slice(0, 2).map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.width), Math.round(r.height), !!b.querySelector('svg.pic')]; }));
  assert.equal(grade[0][0], grade[1][0], 'os blocos ficam lado a lado, em grade'); assert.ok(grade[0][1] > 130 && grade[0][2] > 130 && grade[0][3], 'blocos grandes, com pictograma');
  await p.click('#conteudo [data-cat="c-quadro"]'); await p.locator('#conteudo [data-preco]').first().waitFor();
  assert.equal(await p.locator('#conteudo [data-preco]').count(), 8);
  await p.click('#conteudo [data-preco="p-quadro-1"]'); await p.locator('#pr-p').waitFor();
  assert.equal(await semCampoEmFoco(p), true);
  await digitar(p, '#pr-p', '8550'); assert.match(await p.inputValue('#pr-p'), /R\$\s85,50/); await p.click('.kf-dlg [data-salvar]');
  assert.equal(await p.evaluate(() => precos.find(x => x.id === 'p-quadro-1').preco), 8550);
  await p.click('#conteudo [data-novo-preco]'); await p.click('.kf-dlg [data-salvar]'); assert.equal(await p.getAttribute('#pr-n', 'aria-invalid'), 'true');
  await p.fill('#pr-n', 'Instalação de IDR'); await digitar(p, '#pr-p', '16000'); await p.click('.kf-dlg [data-salvar]');
  assert.deepEqual(await p.evaluate(() => { const L = precos.filter(x => x.cat === 'c-quadro'); return [L.length, L[L.length - 1].nome, L[L.length - 1].preco]; }), [9, 'Instalação de IDR', 16000], 'o preço novo entra no fim da lista');
  // categoria nova, com ícone escolhido
  await p.click('.barra-app [data-voltar]'); await p.click('#conteudo [data-nova-cat]'); await p.locator('#ct-n').waitFor();
  await p.fill('#ct-n', 'Ar-condicionado'); await p.click('.kf-dlg [data-ic="ar"]'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#conteudo [data-novo-preco]').waitFor();
  assert.deepEqual(await p.evaluate(() => { const c = cats[cats.length - 1]; return [cats.length, c.nome, c.icone, rota().id === c.id]; }), [10, 'Ar-condicionado', 'ar', true]);
  await p.click('#conteudo [data-novo-preco]'); await p.fill('#pr-n', 'Limpeza de split'); await digitar(p, '#pr-p', '18000'); await p.click('.kf-dlg [data-salvar]');
  await p.locator('#conteudo [data-preco]').waitFor();
  // excluir a categoria leva os preços dela; Desfazer devolve tudo
  await p.evaluate(() => { document.querySelector('.kf-toast').hidden = true; });
  await p.click('[data-editar-cat]'); await p.click('.kf-dlg [data-tirar]');
  assert.match(await p.locator('.kf-dlg').innerText(), /O preço dela também sai da sua lista[\s\S]*Dá para desfazer logo depois/);
  await p.click('.kf-dlg [data-kf-ok]');
  assert.ok(await esperar(() => p.evaluate(() => rota().nome === 'precos')));
  assert.deepEqual(await p.evaluate(() => [cats.length, precos.some(x => x.nome === 'Limpeza de split')]), [9, false]);
  await p.click('.kf-toast .kf-toast-acao');
  assert.deepEqual(await p.evaluate(() => [cats.length, precos.some(x => x.nome === 'Limpeza de split')]), [10, true]);
  // o preço novo vale para os documentos seguintes
  await novoPelaBarra(p, 'orc'); await p.click('#conteudo [data-somar]'); await p.click('.kf-dlg [data-cat="c-quadro"]'); await p.click('.kf-dlg [data-soma="p-quadro-1"]');
  assert.equal((await aqui(p)).linhas[0].pu, 8550);
  assert.equal(await p.evaluate(() => ajustes.usos['p-quadro-1']), 1, 'o que você usa sobe para Mais usados');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

/* um jsPDF de mentira, que só anota os textos: assim o teste lê o que sai no documento, sem internet */
const PDF_FALSO = () => {
  class F {
    constructor() { this.t = []; this.pg = 1; window.__pdf = this; }
    text(s) { this.t.push(String(s)); } splitTextToSize(s) { return String(s).split('\n'); }
    addPage() { this.pg++; } getNumberOfPages() { return this.pg; } output() { return new Blob(['%PDF-falso'], { type: 'application/pdf' }); }
  }
  for (const m of ['setFont', 'setFontSize', 'setTextColor', 'setFillColor', 'setDrawColor', 'setLineWidth', 'rect', 'roundedRect', 'line', 'lines', 'addImage', 'setPage']) F.prototype[m] = function () {};
  window.jspdf = { jsPDF: F };
};
test('documentos: o PDF do orçamento e do relatório, o recibo, o código do Pix (QR code, sem o símbolo do Pix) e a cópia de segurança', async () => {
  const a = await aparelho(amb, { antes: PDF_FALSO }); const p = a.page; await pronto(p);
  const r = await p.evaluate(async () => {
    Object.assign(ajustes, { nome: 'Carlos Pereira', fone: '11987654321', cidade: 'São Paulo', pix: 'carlos@exemplo.com.br' }); salvarAjustes();
    const d = criarExemplo(); d.exemplo = false; d.num = 7; d.desc = 3500; d.etapa = 'enviado'; d.enviadoEm = new Date('2026-11-20T12:00').getTime();
    const o = {};
    await montarPDF(d); o.orc = window.__pdf.t.join('\n');
    const rel = acertaDoc({ ...clone(d), tipo: 'rel', id: 'r1', num: 8, feito: new Date('2026-11-18T12:00').getTime() }); docs.push(rel);
    await montarPDF(rel); o.rel = window.__pdf.t.join('\n');
    const pg = { id: 'p', v: 55000, em: new Date('2026-11-21T12:00').getTime(), meio: 'Pix' };
    await montarRecibo(d, pg); o.rec = window.__pdf.t.join('\n');
    o.pix = codigoPix(55000); ajustes.pix = ''; o.semPix = codigoPix(55000); ajustes.pix = 'carlos@exemplo.com.br';
    o.arq = [nomeArquivo('Orcamento', d), nomeArquivo('Recibo', rel)];
    o.icones = [/M13\.500 13\.500h3\.200/.test(IC.qr), Object.keys(IC).some(k => /pix/i.test(k))];
    return o;
  });
  for (const t of ['ORÇAMENTO', 'Nº 0007', '20/11/2026', 'Carlos Pereira', '(11) 98765-4321', 'Mariana Souza', 'Reforma elétrica da cozinha', 'Ponto novo de tomada com fiação', '6 pontos', 'Subtotal', '- R$ 35,00', 'TOTAL', 'R$ 1.100,00', 'Entrada de 50% (R$ 550,00) na aprovação e R$ 550,00 na conclusão do serviço.', 'Este orçamento vale até 05/12/2026.', 'PAGUE COM PIX', 'R$ 550,00', 'De acordo: Mariana Souza', 'Material por conta do cliente.'])
    assert.ok(r.orc.replace(/ /g, ' ').includes(t), `o PDF do orçamento sem "${t}"`);
  for (const t of ['RELATÓRIO DE SERVIÇO', 'Nº 0008', 'Executado em 18/11/2026', 'Pagamento à vista.', 'R$ 1.100,00']) assert.ok(r.rel.replace(/ /g, ' ').includes(t), `o PDF do relatório sem "${t}"`);
  assert.ok(!/vale até|De acordo/.test(r.rel), 'o relatório não tem validade nem "de acordo"');
  for (const t of ['RECIBO', 'R$ 550,00', 'quinhentos e cinquenta reais', 'Recebi de Mariana Souza', 'Forma de pagamento: Pix.', 'São Paulo, 21 de novembro de 2026.']) assert.ok(r.rec.replace(/ /g, ' ').includes(t), `o recibo sem "${t}"`);
  assert.match(r.pix, /^000201.*br\.gov\.bcb\.pix0121carlos@exemplo\.com\.br.*5406550\.00.*5802BR5914CARLOS PEREIRA6009SAO PAULO.*6304[0-9A-F]{4}$/);
  assert.equal(r.semPix, '', 'sem chave, não há código');
  assert.deepEqual(r.arq, ['Orcamento-0007-mariana-souza.pdf', 'Recibo-0008-mariana-souza.pdf']);
  assert.deepEqual(r.icones, [true, false], 'onde há Pix, o ícone é um QR code');
  // cópia de segurança: baixa no formato da família e restaura por cima; cópia de versão anterior é recusada
  const copia = await p.evaluate(() => JSON.stringify(KitFacil.copia.envelope({ ajustes, cats, precos, docs: docs.filter(d => !d.exemplo) }, 4)));
  await p.evaluate(() => { docs = []; precos = precos.slice(0, 3); salvarDocs(); salvarPrecos(); });
  await p.evaluate(j => restaurarCopia(new File([j], 'copia.json', { type: 'application/json' })), copia);
  await p.locator('.kf-dlg [data-kf-ok]').click();
  assert.deepEqual(await p.evaluate(() => [docs.length, precos.length > 50, ajustes.seq >= 8, ajustes.nome]), [2, true, true, 'Carlos Pereira']);
  await p.evaluate(j => restaurarCopia(new File([JSON.stringify({ ...JSON.parse(j), esquema: 2 })], 'velha.json')), copia);
  assert.match(await p.locator('.kf-toast').innerText(), /versão anterior/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('sincronização: arquivo novo na nuvem (o da versão 3 não é tocado), conteúdo criptografado, e dois aparelhos se juntam', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh }), B = await aparelho(amb, { github: gh });
  const criar = (p, nome) => p.evaluate(nome => { const d = acertaDoc({ tipo: 'orc', cliente: { nome }, linhas: [{ nome: 'Troca de tomada', un: 'un', q: 1, pu: 15000 }] }); d.num = ++ajustes.seq; docs.push(d); salvarAjustes(); salvarDocs(); desenhar(); return d.id; }, nome);
  await pronto(A.page); await pronto(B.page);
  const idA = await criar(A.page, 'Cliente do A');
  assert.equal(await A.page.evaluate(t => SY.conectar(t), TOKEN_TESTE), true);
  assert.ok(await esperar(() => A.page.evaluate(() => SY.ligada() && sinc.lastSync > 0)), 'A não sincronizou');
  assert.ok(gh.arquivo('eletrica-facil-4.json'), 'o arquivo novo na nuvem');
  assert.ok(!gh.arquivo('eletrica-facil-3.json') && !gh.arquivo('eletrica-facil.json'), 'os arquivos das versões anteriores não são tocados');
  assert.ok(!/Cliente do A/.test(gh.arquivo('eletrica-facil-4.json').conteudo), 'o conteúdo vai criptografado');
  await criar(B.page, 'Cliente do B');
  assert.equal(await B.page.evaluate(t => SY.conectar(t), TOKEN_TESTE), true);
  assert.ok(await esperar(() => B.page.evaluate(() => docs.length === 2)), 'B não recebeu o documento do A');
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => docs.map(d => d.cliente.nome).sort()), ['Cliente do A', 'Cliente do B']);
  assert.deepEqual(await A.page.evaluate(() => docs.map(d => d.num).sort()), [1, 2], 'números repetidos são refeitos');
  // um preço mudado no A e um documento excluído no A chegam ao B
  await A.page.evaluate(id => { precos.find(x => x.id === 'p-visita-1').preco = 14000; salvarPrecos(); docs = docs.filter(d => d.id !== id); salvarDocs(); return SY.agora({ quiet: true }); }, idA);
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await B.page.evaluate(() => [precos.find(x => x.id === 'p-visita-1').preco, docs.map(d => d.cliente.nome)]), [14000, ['Cliente do B']]);
  assert.deepEqual([...A.erros, ...B.erros], []);
  await A.fechar(); await B.fechar();
});

test('Ajustes: as oito guias comuns e as do app; os dados dos documentos, a chave Pix, o padrão do documento novo e o raio', async () => {
  const a = await aparelho(amb); const p = a.page; await pronto(p);
  await p.evaluate(() => { location.hash = '#/ajustes'; }); await p.locator('[data-kf-aj]').waitFor();
  const guias = await guiasAjustes(p);
  assert.deepEqual(guias.comuns, GUIAS_COMUNS);
  assert.deepEqual(guias.produto, ['Pix', 'Documento novo', 'Raio e apresentação']);
  await p.evaluate(() => KitFacil.ajustes.abrir('conta')); await p.fill('#aj-nome', 'Carlos Pereira'); await p.fill('#aj-fone', '11987654321'); await p.locator('#aj-fone').blur();
  assert.deepEqual(await p.evaluate(() => [ajustes.nome, document.querySelector('#aj-fone').value, JSON.parse(localStorage.getItem('eletricafacil.ajustes')).nome]), ['Carlos Pereira', '(11) 98765-4321', 'Carlos Pereira']);
  await p.evaluate(() => KitFacil.ajustes.abrir('pix')); await p.fill('#aj-pix', ' Carlos@Exemplo.com.br '); await p.locator('#aj-pix').blur();
  assert.equal(await p.evaluate(() => ajustes.pix), 'carlos@exemplo.com.br', 'a chave fica do jeito que o Banco Central espera');
  await p.evaluate(() => KitFacil.ajustes.abrir('padrao')); await p.click('[data-aj-val="30"]'); await p.click('[data-aj-pag="entrada"]'); await p.click('[data-aj-ep="30"]'); await p.click('[data-aj-gar="0"]');
  assert.deepEqual(await p.evaluate(() => [ajustes.validade, ajustes.pag, ajustes.entradaPct, ajustes.garantia]), [30, 'entrada', 30, 0]);
  await novoPelaBarra(p, 'orc');
  assert.deepEqual(await aqui(p).then(d => [d.validade, d.pag, d.entradaPct, d.garantia]), [30, 'entrada', 30, 0], 'o documento novo começa com o padrão');
  await p.evaluate(() => { ir('/ajustes', true); KitFacil.ajustes.abrir('raio'); });
  await p.locator('#aj-raio').evaluate(el => el.click());
  assert.deepEqual(await p.evaluate(() => [ajustes.raio, Raio.ligado()]), [false, false]);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('apresentação: quatro telas, uma vez só; o bloco soma com um toque; termina no Início', async () => {
  const a = await aparelho(amb, { antes: () => { window.EF_TESTE_ABERTURA = true; } }); const p = a.page;
  await p.locator('.kf-abertura').waitFor();
  const titulos = [];
  for (let k = 0; k < 4; k++) {
    titulos.push(await p.locator('.kf-abertura .kf-ab-t').innerText());
    if (k === 1) { const antes = await p.locator('.ab-conta').innerText(); await p.click('[data-ab-soma="3"]'); assert.notEqual(await p.locator('.ab-conta').innerText(), antes, 'o toque no bloco muda a conta'); assert.match(await p.locator('.ab-conta').innerText(), /2 serviços[\s\S]*R\$\s175,00/); }
    assert.equal(await p.locator('.kf-abertura button:visible', { hasText: 'Pular' }).count(), k < 3 ? 1 : 0, `Pular na tela ${k + 1}`);
    await p.click('#kf-ab-prox');
  }
  assert.deepEqual(titulos.map(t => t.replace(/\s+/g, ' ')), ['Orçamento de elétrica, do pedido ao recibo', 'Some os serviços com um toque', 'O botão do pé é o próximo passo', 'Orçamento antes, relatório depois']);
  await p.locator('.kf-abertura').waitFor({ state: 'detached' }); await pronto(p);
  assert.equal(await p.evaluate(() => KitFacil.abertura.vista()), true);
  await p.reload(); await pronto(p); await p.waitForTimeout(400);
  assert.equal(await p.locator('.kf-abertura').count(), 0, 'a apresentação aparece uma vez só');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('raio: cai sozinho, sem toque na tela; é enfeite (não recebe toque); não cai com janela aberta, desligado ou com movimento reduzido', async () => {
  const a = await aparelho(amb, { antes: () => { window.__raios = 0; document.addEventListener('DOMContentLoaded', () => new MutationObserver(M => M.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('rz')) window.__raios++; }))).observe(document.body, { childList: true, subtree: true })); } });
  const p = a.page; await pronto(p);
  assert.equal(await p.evaluate(() => window.__raios), 0, 'em teste, o raio só cai quando o teste pede');
  await p.evaluate(() => Raio.comecar({ primeiro: 150, entre: [1500, 1600] }));
  assert.ok(await esperar(() => p.evaluate(() => window.__raios === 1), 1500), 'o primeiro raio cai sozinho, sem nenhum toque');
  assert.deepEqual(await p.evaluate(() => { const c = document.querySelector('#raio-cena'); return [getComputedStyle(c).pointerEvents, document.querySelectorAll('#raio-cena .rz-f').length]; }), ['none', 1], 'não recebe toque; um clarão por raio na tela');
  await p.evaluate(() => Raio.ligar(false)); await p.waitForTimeout(2000);
  assert.equal(await p.evaluate(() => window.__raios), 1, 'desligado nos Ajustes, não cai');
  assert.equal(await p.locator('#raio-cena .rz').count(), 0, 'o raio some em pouco mais de um segundo');
  await p.evaluate(() => { Raio.ligar(true); janelaNovo(); }); await p.waitForTimeout(2000);
  assert.equal(await p.evaluate(() => window.__raios), 1, 'com janela aberta, não cai');
  await fecharJanela(p);
  assert.ok(await esperar(() => p.evaluate(() => window.__raios === 2), 2500), 'fechada a janela, volta a cair sozinho');
  await p.waitForTimeout(1400); await p.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await p.evaluate(() => Raio.cair({ forcar: true })), false, 'com movimento reduzido, não há raio');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('guia: um só, do começo ao fim, sem avisos e sem gravar nada', async () => {
  const a = await aparelho(amb, { antes: () => { window.__avisos = []; const w = console.warn; console.warn = (...x) => { window.__avisos.push(x.map(String).join(' ')); w.apply(console, x); }; } });
  const p = a.page; await pronto(p);
  await p.evaluate(() => { const d = acertaDoc({ tipo: 'orc', cliente: { nome: 'Cliente Real' }, linhas: [{ nome: 'x', un: 'un', q: 1, pu: 100 }] }); d.num = ++ajustes.seq; docs.push(d); ajustes.nome = 'Eu Mesmo'; salvarAjustes(); salvarDocs(); desenhar(); });
  const foto = () => p.evaluate(() => JSON.stringify(['docs', 'ajustes', 'precos', 'cats'].map(k => localStorage.getItem('eletricafacil.' + k))));
  const antes = await foto();
  await p.evaluate(() => ir('/mais', true)); await p.click('.kf-mais [data-kf-ir="guia"]');
  assert.ok(await esperar(() => p.evaluate(() => !!KitFacil.guia.estado())));
  assert.deepEqual(await p.evaluate(() => [semSalvar, docs.length, ajustes.nome]), [true, 0, 'Carlos Pereira'], 'a demonstração começa do zero');
  const fim = Date.now() + 300000; let maior = 0;
  while (Date.now() < fim && await p.evaluate(() => !!KitFacil.guia.estado())) {
    const e = await p.evaluate(() => KitFacil.guia.estado()); if (e) maior = Math.max(maior, e.i);
    await p.evaluate(() => { const s = KitFacil.guia.estado(); if (s && !s.rapido && s.fase === 'conta') document.querySelector('#kf-gu-pula').click(); });
    await p.waitForTimeout(100);
  }
  assert.equal(await p.evaluate(() => !!KitFacil.guia.estado()), false, 'o guia não chegou ao fim');
  assert.equal(maior, await p.evaluate(() => GUIA.length - 1), 'o guia passou por todos os passos');
  assert.deepEqual(await p.evaluate(() => window.__avisos.filter(x => /guia/i.test(x))), [], 'algum passo do guia falhou');
  assert.equal(await foto(), antes, 'o guia gravou alguma coisa');
  assert.deepEqual(await p.evaluate(() => [semSalvar, !!dadosReais, docs.length, docs[0].cliente.nome, ajustes.nome, rota().nome]), [false, false, 1, 'Cliente Real', 'Eu Mesmo', 'inicio']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
