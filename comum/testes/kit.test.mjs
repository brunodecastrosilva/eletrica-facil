/* Kit Fácil · testes automáticos dos componentes comuns (rodam em todos os apps com `npm test`).
   Usam a página comum/testes/pagina-kit.html, um GitHub e um Firestore de mentira (veja ambiente.mjs). */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, TOKEN_TESTE, conferirTopo, conferirNavAjustes, abrirAjustesPelaNav, irPelaNav, guiasAjustes, GUIAS_COMUNS, semRolagemLateral } from './ambiente.mjs';

let amb;
before(async () => { amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const pagina = () => `comum/testes/pagina-kit.html?app=${amb.app}`;
const esperar = async (cond, ms = 8000, passo = 50) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, passo)); } return false; };
const estadoNuvem = p => p.getAttribute('[data-kf-nuvem]', 'data-estado');
const CELULAR = { width: 390, height: 844 }, COMPUTADOR = { width: 1280, height: 860 };

/* ---------------- área superior direita ---------------- */
test('topo: nuvem, chopp e balão no canto superior direito, nessa ordem; Ajustes na navegação, no celular e no computador', async () => {
  for (const viewport of [{ width: 360, height: 740 }, CELULAR, { width: 820, height: 1180 }, COMPUTADOR]) {
    const a = await aparelho(amb, { viewport, caminho: pagina() + '&apoio=1' });
    const t = await conferirTopo(a.page, { chopp: true });
    assert.deepEqual(t.erros, [], `largura ${viewport.width}: ${t.erros.join('; ')}`);
    const n = await conferirNavAjustes(a.page);
    assert.deepEqual(n.erros, [], `largura ${viewport.width}: ${n.erros.join('; ')}`);
    assert.equal(t.estado, 'desligada');
    assert.ok(await semRolagemLateral(a.page));
    assert.deepEqual(a.erros, []);
    await a.fechar();
  }
});

test('nuvem: mostra o estado real — desligada, sincronizando, sincronizado, pendente, erro e sem internet', async () => {
  const gh = githubFalso();
  const a = await aparelho(amb, { github: gh, caminho: pagina() });
  const p = a.page;
  assert.equal(await estadoNuvem(p), 'desligada');
  assert.match(await p.getAttribute('[data-kf-nuvem]', 'aria-label'), /Sincronização desligada/);
  gh.estado.atraso = 600;
  const conectando = p.evaluate(t => T.SY.conectar(t), TOKEN_TESTE);
  assert.ok(await esperar(async () => (await estadoNuvem(p)) === 'sincronizando'), 'não mostrou "sincronizando"');
  assert.equal(await conectando, true);
  gh.estado.atraso = 0;
  assert.equal(await estadoNuvem(p), 'sincronizado');
  // alteração ainda não enviada: pendente (nunca "sincronizado")
  await p.evaluate(() => T.addLento('café'));
  assert.equal(await estadoNuvem(p), 'pendente');
  assert.match(await p.getAttribute('[data-kf-nuvem]', 'aria-label'), /Alterações a enviar/);
  await p.evaluate(() => T.SY.agora({ quiet: true }));
  assert.equal(await estadoNuvem(p), 'sincronizado');
  // falha do servidor: erro
  gh.estado.falha = 500;
  await p.evaluate(() => T.SY.agora({ quiet: true }));
  assert.equal(await estadoNuvem(p), 'erro');
  gh.estado.falha = 0;
  // sem internet: offline, e a alteração feita sem conexão fica pendente para depois
  gh.estado.fora = true;
  await a.ctx.setOffline(true);
  assert.ok(await esperar(async () => (await estadoNuvem(p)) === 'offline'));
  await p.evaluate(() => T.add('pão'));
  assert.ok(await esperar(async () => (await p.evaluate(() => T.SY.situacao())) === 'offline'));
  assert.equal(await estadoNuvem(p), 'offline');
  assert.ok(await p.evaluate(() => T.SY.estado.sujo > 0), 'a alteração feita sem internet deveria ficar pendente');
  gh.estado.fora = false;
  await a.ctx.setOffline(false);
  assert.ok(await esperar(async () => (await estadoNuvem(p)) === 'sincronizado'), 'não voltou a sincronizar');
  assert.equal(await p.evaluate(() => T.SY.estado.sujo), 0);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('nuvem: tocar abre o detalhe com estado, conta, última sincronização e as ações; "Ver nos Ajustes" leva à guia', async () => {
  const gh = githubFalso();
  const a = await aparelho(amb, { github: gh, caminho: pagina() });
  const p = a.page;
  await p.click('[data-kf-nuvem]');
  const dlg = p.locator('.kf-dlg[data-kf-dialogo="nuvem"]');
  await dlg.waitFor();
  assert.match(await dlg.textContent(), /Sincronização desligada[\s\S]*Não conectada[\s\S]*Nunca/);
  await dlg.locator('[data-kf="sync-ativar"]').click();
  await p.fill('#kf-token', TOKEN_TESTE);
  await p.click('[data-kf-conectar]');
  assert.ok(await esperar(async () => (await estadoNuvem(p)) === 'sincronizado'));
  await p.click('[data-kf-nuvem]');
  await dlg.waitFor();
  const t = await dlg.textContent();
  assert.match(t, /Sincronizado/); assert.match(t, /GitHub @pessoa-teste/); assert.match(t, /Nada pendente/);
  assert.equal(await dlg.locator('[data-kf="sync-agora"]').count(), 1);
  await dlg.locator('[data-kf="ajustes-sincronizacao"]').click();
  assert.ok(await esperar(() => p.evaluate(() => document.querySelector('[data-kf-aj]')?.dataset.ativa === 'sincronizacao')));
  assert.ok(await p.isVisible('#kf-aj-sincronizacao [data-kf-estado-nuvem]'));
  await a.fechar();
});

/* ---------------- avaliação e feedback ---------------- */
test('balão: abre a escolha entre "Avaliar o app" e "Relatar um problema"', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.click('.kf-topo [data-kf="feedback"]');
  const dlg = p.locator('.kf-dlg[data-kf-dialogo="feedback"]');
  await dlg.waitFor();
  assert.equal(await dlg.locator('h2').textContent(), 'Avaliação e feedback');
  assert.deepEqual(await dlg.locator('.kf-escolha b').allTextContents(), ['Avaliar o app', 'Relatar um problema']);
  await dlg.locator('[data-kf="problema"]').click();
  await p.locator('.kf-dlg[data-kf-dialogo="problema"]').waitFor();
  await p.click('[data-kf-voltar-fb]');
  await p.locator('.kf-dlg[data-kf-dialogo="feedback"]').waitFor();
  await a.fechar();
});

test('avaliar: a nota é obrigatória, o comentário é opcional e sai no formato da regra', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => KitFacil.feedback.abrir({ tipo: 'avaliar' }));
  await p.locator('.kf-dlg[data-kf-dialogo="avaliar"]').waitFor();
  assert.match(await p.locator('.kf-dlg h2').textContent(), /^Avaliar o /);
  assert.equal(await p.isChecked('#kf-tec'), false, 'na avaliação, as informações técnicas não vão sem a pessoa marcar');
  await p.click('[data-kf-enviar]');
  assert.match(await p.textContent('[data-kf-erro]'), /estrela/);
  await p.click('label[for="kf-n4"]');
  assert.match(await p.textContent('[data-kf-nota-txt]'), /4 de 5: Bom/);
  await p.click('.kf-opcao:has-text("Sugestão")');
  const texto = 'Poderia ter um modo para tablet na horizontal.';
  await p.fill('#kf-msg', texto);
  assert.equal(await p.textContent('[data-kf-cont]'), `${texto.length} de 2000 caracteres`);
  await p.fill('#kf-contato', 'pessoa@exemplo.com');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  assert.deepEqual(fs.estado.recusas, []);
  const [doc] = [...fs.estado.docs.values()];
  assert.match(doc.caminho, /\/projects\/[^/]+\/databases\/\(default\)\/documents\/feedback$/);
  const d = doc.dados;
  assert.equal(d.app, amb.app); assert.equal(d.esquema.__int, 1); assert.equal(d.nota.__int, 4);
  assert.equal(d.tipo, 'sugestao'); assert.equal(d.mensagem, texto); assert.equal(d.contato, 'pessoa@exemplo.com');
  assert.equal(d.tela, 'inicio'); assert.equal(d.versao, '0.0.0-teste');
  assert.equal('tecnico' in d, false); assert.equal('categoria' in d, false);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('relatar: a descrição é obrigatória; categoria, gravidade e informações técnicas vão juntas', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => KitFacil.feedback.abrir({ tipo: 'problema' }));
  await p.locator('.kf-dlg[data-kf-dialogo="problema"]').waitFor();
  assert.equal(await p.locator('.kf-dlg h2').textContent(), 'Relatar um problema');
  assert.equal(await p.isChecked('#kf-tec'), true);
  await p.click('[data-kf-enviar]');
  assert.match(await p.textContent('[data-kf-erro]'), /Conte o que aconteceu/);
  await p.click('.kf-opcao:has-text("Dados ou sincronização")');
  await p.click('.kf-opcao:has-text("Impede o uso")');
  await p.fill('#kf-msg', 'Os orçamentos sumiram depois de sincronizar.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  const [doc] = [...fs.estado.docs.values()];
  const d = doc.dados;
  assert.equal(d.tipo, 'problema'); assert.equal(d.nota.__int, 0);
  assert.equal(d.categoria, 'dados'); assert.equal(d.gravidade, 'alta');
  assert.ok(d.tecnico && d.tecnico.navegador && d.tecnico.janela === '390x844');
  await a.fechar();
});

test('relatar: com a regra anterior publicada, categoria e gravidade vão no texto e nada se perde', async () => {
  const fs = firestoreFalso({ regra: 'antiga' });
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => KitFacil.feedback.abrir({ tipo: 'problema' }));
  await p.click('.kf-opcao:has-text("Erro ou travamento")');
  await p.click('.kf-opcao:has-text("Atrapalha o uso")');
  await p.fill('#kf-msg', 'Travou ao salvar.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  assert.equal(fs.estado.docs.size, 1);
  const [doc] = [...fs.estado.docs.values()];
  assert.equal('categoria' in doc.dados, false);
  assert.equal(doc.dados.mensagem, '[Categoria: Erro ou travamento · Gravidade: Atrapalha o uso] Travou ao salvar.');
  assert.equal(await p.evaluate(() => KitFacil.feedback.pendentes()), 0);
  await a.fechar();
});

test('feedback: sem internet a mensagem fica guardada, o balão avisa e ela sai sozinha quando a conexão volta', async () => {
  const fs = firestoreFalso({ modo: 'fora' });
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => KitFacil.feedback.abrir({ tipo: 'problema' }));
  await p.fill('#kf-msg', 'O botão de salvar não respondeu.');
  await a.ctx.setOffline(true);
  await p.click('[data-kf-enviar]');
  await p.locator('text=Você está sem internet').waitFor();
  assert.equal(await p.evaluate(() => KitFacil.feedback.pendentes()), 1);
  assert.equal(await p.evaluate(() => document.querySelector('.kf-topo [data-kf="feedback"]').classList.contains('kf-com-pendente')), true);
  await p.keyboard.press('Escape');
  await p.click('.kf-topo [data-kf="feedback"]');
  assert.match(await p.textContent('.kf-dlg'), /1 mensagem guardada/);
  await p.keyboard.press('Escape');
  fs.estado.modo = 'aceitar';
  await a.ctx.setOffline(false);
  assert.ok(await esperar(() => fs.estado.docs.size === 1), 'a mensagem guardada não foi reenviada');
  assert.ok(await esperar(async () => (await p.evaluate(() => KitFacil.feedback.pendentes())) === 0));
  assert.equal(await p.evaluate(() => document.querySelector('.kf-topo [data-kf="feedback"]').classList.contains('kf-com-pendente')), false);
  await a.fechar();
});

test('feedback: enquanto a regra não estiver publicada (403), nada se perde e não há mensagem falsa de sucesso', async () => {
  const fs = firestoreFalso({ modo: 'recusar' });
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => KitFacil.feedback.abrir({ tipo: 'avaliar' }));
  await p.click('label[for="kf-n3"]');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Não foi possível enviar agora').waitFor();
  assert.equal(await p.locator('text=Recebemos sua mensagem').count(), 0);
  assert.equal(await p.evaluate(() => KitFacil.feedback.pendentes()), 1);
  await p.click('[data-kf-copiar]');
  fs.estado.modo = 'aceitar';
  await p.evaluate(() => KitFacil.feedback.reenviar());
  assert.ok(await esperar(() => fs.estado.docs.size === 1));
  await a.fechar();
});

test('feedback: reenviar o mesmo registro não duplica', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const r = await a.page.evaluate(async () => {
    const reg = { id: KitFacil.novoId(), dados: { esquema: 1, app: new URLSearchParams(location.search).get('app'), versao: '0.0.0-teste', nota: 2, tipo: 'critica', mensagem: 'Lento.', enviadoEm: new Date().toISOString() } };
    return [await KitFacil.feedback._enviar(reg), await KitFacil.feedback._enviar(reg)];
  });
  assert.deepEqual(r, ['ok', 'ok']);
  assert.equal(fs.estado.docs.size, 1);
  await a.fechar();
});

test('janelas: foco preso dentro, Esc fecha e o foco volta para o balão; todos os campos têm nome acessível', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.focus('.kf-topo [data-kf="feedback"]');
  await p.keyboard.press('Enter');
  await p.locator('.kf-dlg').waitFor();
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(() => !!document.activeElement.closest('.kf-dlg')), true, 'o foco saiu da janela');
  }
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('.kf-dlg').count(), 0);
  assert.equal(await p.evaluate(() => document.activeElement.dataset.kf), 'feedback');
  assert.equal(await p.evaluate(() => document.body.style.position), '');
  for (const tipo of ['avaliar', 'problema']) {
    await p.evaluate(t => KitFacil.feedback.abrir({ tipo: t }), tipo);
    const sem = await p.evaluate(() => [...document.querySelectorAll('.kf-dlg input, .kf-dlg textarea, .kf-dlg button')]
      .filter(el => !(el.labels && el.labels.length) && !el.getAttribute('aria-label') && !el.textContent.trim()).map(el => el.outerHTML.slice(0, 80)));
    assert.deepEqual(sem, [], tipo);
    await p.keyboard.press('Escape');
  }
  await a.fechar();
});

/* ---------------- tela de Ajustes ---------------- */
test('Ajustes: guias comuns na ordem do padrão e guias do app num grupo próprio', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await abrirAjustesPelaNav(p);
  await p.locator('[data-kf-aj]').waitFor();
  const g = await guiasAjustes(p);
  assert.deepEqual(g.comuns, GUIAS_COMUNS);
  assert.deepEqual(g.produto, ['Notas']);
  assert.equal(await p.textContent('.kf-aj-lista .kf-aj-grupo:nth-of-type(2)'), (await p.evaluate(() => KitFacil.FAMILIA.find(f => f.app === new URLSearchParams(location.search).get('app')).nome)));
  assert.equal(await p.locator('.kf-nav [data-kf="ajustes"]').getAttribute('aria-current'), 'page');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Ajustes no celular: lista → guia → volta pela seta e pelo Voltar do aparelho', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await abrirAjustesPelaNav(p);
  assert.ok(await p.isVisible('.kf-aj-lista'));
  assert.equal(await p.isVisible('#kf-aj-aparencia'), false);
  await p.click('[data-kf-aj-ir="aparencia"]');
  assert.ok(await p.isVisible('#kf-aj-aparencia'));
  assert.equal(await p.isVisible('.kf-aj-lista'), false);
  assert.equal(await p.evaluate(() => document.activeElement.id), 'kf-aj-t-aparencia');
  await p.click('#kf-aj-aparencia [data-kf-aj-voltar]');
  assert.ok(await esperar(() => p.isVisible('.kf-aj-lista')));
  await p.click('[data-kf-aj-ir="notas"]');
  assert.ok(await p.isVisible('#prod-opcao'));
  await p.goBack();
  assert.ok(await esperar(() => p.isVisible('.kf-aj-lista')), 'o Voltar do aparelho não voltou para a lista');
  await p.goBack();
  assert.ok(await esperar(() => p.evaluate(() => !document.querySelector('[data-kf-aj]'))), 'o Voltar não saiu dos Ajustes');
  assert.ok(await semRolagemLateral(p));
  await a.fechar();
});

test('Ajustes em tela larga: lista e guia lado a lado, primeira guia aberta, troca sem empilhar histórico', async () => {
  const a = await aparelho(amb, { viewport: COMPUTADOR, caminho: pagina() });
  const p = a.page;
  await abrirAjustesPelaNav(p);
  assert.ok(await p.isVisible('.kf-aj-lista'));
  assert.ok(await p.isVisible('#kf-aj-conta'));
  assert.ok(await p.isVisible('#extra-conta'));
  assert.equal(await p.getAttribute('[data-kf-aj-ir="conta"]', 'aria-current'), 'true');
  assert.equal(await p.isVisible('#kf-aj-conta [data-kf-aj-voltar]'), false);
  const antes = await p.evaluate(() => history.length);
  await p.click('[data-kf-aj-ir="privacidade"]');
  assert.ok(await p.isVisible('#kf-aj-privacidade'));
  assert.equal(await p.isVisible('#kf-aj-conta'), false);
  assert.equal(await p.getAttribute('[data-kf-aj-ir="privacidade"]', 'aria-current'), 'true');
  assert.equal(await p.evaluate(() => history.length), antes);
  const box = await p.evaluate(() => [document.querySelector('.kf-aj-lista').getBoundingClientRect().right, document.querySelector('#kf-aj-privacidade').getBoundingClientRect().left]);
  assert.ok(box[0] < box[1], 'lista e guia deveriam ficar lado a lado');
  await a.fechar();
});

test('Ajustes: conteúdo das guias comuns (conta, sincronização, armazenamento, tema, preferências, notificações, privacidade, feedback, sobre)', async () => {
  const a = await aparelho(amb, { viewport: COMPUTADOR, caminho: pagina() });
  const p = a.page;
  await abrirAjustesPelaNav(p);
  const texto = async id => { await p.click(`[data-kf-aj-ir="${id}"]`); return p.textContent(`#kf-aj-${id}`); };
  assert.match(await texto('conta'), /sem criar cadastro[\s\S]*Ligar a sincronização/);
  const sinc = await texto('sincronizacao');
  assert.match(sinc, /Sincronização desligada/); assert.match(sinc, /\d+ KB/); assert.match(sinc, /Baixar cópia/);
  assert.match(await texto('aparencia'), /Automático[\s\S]*Claro[\s\S]*Escuro/);
  assert.match(await texto('preferencias'), /Português \(Brasil\)[\s\S]*Real \(R\$\)/);
  assert.match(await texto('notificacoes'), /não envia notificações/);
  const priv = await texto('privacidade');
  assert.match(priv, /As notas de teste ficam guardadas neste aparelho/); assert.match(priv, /gist secreto/); assert.match(priv, /Apagar dados deste aparelho/);
  assert.match(await texto('feedback'), /Avaliar o app[\s\S]*Relatar um problema/);
  const sobre = await texto('sobre');
  assert.match(sobre, /Versão 0\.0\.0-teste/); assert.match(sobre, /Termos de uso/); assert.match(sobre, /Kit Fácil \d+\.\d+\.\d+/);
  const links = await p.$$eval('#kf-aj-sobre .kf-apps a', l => l.map(x => x.getAttribute('href')));
  assert.equal(links.length, 2);
  for (const h of links) assert.match(h, /^\/(conta|eletrica|estudo)-facil\/$/);
  // o resumo da guia acompanha a escolha do tema
  await p.click('[data-kf-aj-ir="aparencia"]');
  await p.click('[data-kf="tema"][data-v="escuro"]');
  assert.equal(await p.textContent('[data-kf-aj-resumo="aparencia"]'), 'Escuro');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  await p.reload();
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await p.getAttribute('meta[name="theme-color"]', 'content'), '#111111');
  await a.fechar();
});

test('Ajustes: cópia de segurança e apagar os dados deste aparelho', async () => {
  const gh = githubFalso();
  const a = await aparelho(amb, { github: gh, viewport: COMPUTADOR, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => { T.add('arroz'); T.add('feijão'); });
  await p.evaluate(t => T.SY.conectar(t), TOKEN_TESTE);
  await abrirAjustesPelaNav(p);
  await p.click('[data-kf-aj-ir="sincronizacao"]');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-kf="copia-baixar"]')]);
  const copia = JSON.parse(await readFile(await dl.path(), 'utf8'));
  assert.equal(copia.formato, 'copia-facil'); assert.equal(copia.app, amb.app); assert.equal(copia.dados.notas.length, 2);
  await p.click('[data-kf-aj-ir="privacidade"]');
  await p.click('[data-kf="apagar-aparelho"]');
  assert.match(await p.textContent('.kf-dlg'), /A cópia na nuvem e os outros aparelhos continuam/);
  await Promise.all([p.waitForNavigation(), p.click('[data-kf-ok]')]);
  assert.deepEqual(await p.evaluate(() => T.notas()), []);
  assert.equal(await p.evaluate(() => T.SY.ligada()), false);
  assert.equal(await estadoNuvem(p), 'desligada');
  assert.equal(gh.arquivo(`${amb.app}.json`) !== null, true, 'a cópia na nuvem deveria continuar');
  // restaurar a cópia baixada
  await abrirAjustesPelaNav(p);
  await p.click('[data-kf-aj-ir="sincronizacao"]');
  await p.setInputFiles('#kf-aj-sincronizacao [data-kf-copia-arquivo]', await dl.path());
  assert.ok(await esperar(async () => (await p.evaluate(() => T.notas())).length === 2));
  // pelo botão, com o app redesenhando a tela enquanto o seletor de arquivos está aberto (no celular a página fica escondida)
  await p.evaluate(() => { T.remover('arroz'); T.remover('feijão'); });
  const [seletor] = await Promise.all([p.waitForEvent('filechooser'), p.click('#kf-aj-sincronizacao [data-kf="copia-restaurar"]')]);
  await p.evaluate(() => { T.ir('inicio'); T.ir('ajustes'); });
  await seletor.setFiles(await dl.path());
  assert.ok(await esperar(async () => (await p.evaluate(() => T.notas())).length === 2), 'a cópia não foi restaurada depois do redesenho');
  await a.fechar();
});

/* ---------------- sincronização ---------------- */
async function conectarPelaNuvem(p, token = TOKEN_TESTE) {
  await p.click('[data-kf-nuvem]');
  await p.click('.kf-dlg [data-kf="sync-ativar"]');
  await p.fill('#kf-token', token);
  await p.click('[data-kf-conectar]');
}
const sincronizado = p => esperar(async () => (await p.evaluate(() => T.SY.ligada() && T.SY.estado.lastSync > 0 && T.SY.situacao() === 'ok')));

test('sincronização: dois aparelhos, dados criptografados, exclusão e a alteração mais recente vence', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh, caminho: pagina() });
  const B = await aparelho(amb, { github: gh, caminho: pagina() });
  await A.page.evaluate(() => { T.add('café'); T.add('pão'); });
  await conectarPelaNuvem(A.page);
  assert.ok(await sincronizado(A.page), 'o aparelho A não sincronizou');

  // o arquivo no gist é o envelope criptografado de sempre (compatível com as versões anteriores)
  const arq = gh.arquivo(`${amb.app}.json`);
  assert.ok(arq, 'gist não criado');
  assert.equal(arq.gist.public, false);
  assert.doesNotMatch(arq.conteudo, /café/);
  const env = JSON.parse(arq.conteudo);
  assert.equal(env.app, amb.app); assert.equal(env.v, 1); assert.equal(env.enc, 'AES-GCM');
  const s = webcrypto.subtle, te = new TextEncoder();
  const base = await s.importKey('raw', te.encode(TOKEN_TESTE), 'PBKDF2', false, ['deriveKey']);
  const k = await s.deriveKey({ name: 'PBKDF2', salt: te.encode(`${amb.app}:pessoa-teste`), iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const claro = JSON.parse(new TextDecoder().decode(await s.decrypt({ name: 'AES-GCM', iv: Buffer.from(env.iv, 'base64') }, k, Buffer.from(env.data, 'base64'))));
  assert.deepEqual(claro.notas.map(n => n.t).sort(), ['café', 'pão']);

  await conectarPelaNuvem(B.page);
  assert.ok(await sincronizado(B.page));
  assert.ok(await esperar(async () => JSON.stringify(await B.page.evaluate(() => T.notas())) === JSON.stringify(['café', 'pão'])), 'B não recebeu as notas de A');

  await B.page.evaluate(() => T.add('leite'));
  assert.equal(await B.page.evaluate(() => T.SY.agora({ quiet: true })), true);
  await A.page.evaluate(() => T.SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => T.notas()), ['café', 'leite', 'pão']);

  await A.page.evaluate(() => T.remover('pão'));
  await A.page.evaluate(() => T.SY.agora({ quiet: true }));
  await B.page.evaluate(() => T.SY.agora({ quiet: true }));
  assert.deepEqual(await B.page.evaluate(() => T.notas()), ['café', 'leite']);

  await A.page.evaluate(() => T.editar('café', 'café forte'));
  await new Promise(r => setTimeout(r, 30));
  await B.page.evaluate(() => T.editar('café', 'café sem açúcar'));
  await A.page.evaluate(() => T.SY.agora({ quiet: true }));
  await B.page.evaluate(() => T.SY.agora({ quiet: true }));
  await A.page.evaluate(() => T.SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => T.notas()), ['café sem açúcar', 'leite']);
  assert.deepEqual(await B.page.evaluate(() => T.notas()), ['café sem açúcar', 'leite']);
  assert.deepEqual([...A.erros, ...B.erros], []);
  await A.fechar(); await B.fechar();
});

test('sincronização: aproveita a chave de outro app da família no mesmo aparelho', async () => {
  const gh = githubFalso();
  const outro = ['conta-facil', 'eletrica-facil', 'estudo-facil'].find(x => x !== amb.app).replace('-', '');
  const A = await aparelho(amb, { github: gh, caminho: pagina(), antes: `localStorage.setItem('${outro}.sync', JSON.stringify({ token: '${TOKEN_TESTE}', login: 'pessoa-teste' }))` });
  await A.page.click('[data-kf-nuvem]');
  await A.page.click('.kf-dlg [data-kf="sync-ativar"]');
  await A.page.click('[data-kf-irma]');
  assert.ok(await sincronizado(A.page));
  await A.fechar();
});

test('sincronização: link "Outro aparelho" conecta depois de confirmar', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh, caminho: pagina() + '#/conectar/' + encodeURIComponent(TOKEN_TESTE) });
  await A.page.locator('.kf-dlg >> text=Conectar este aparelho?').waitFor();
  assert.equal(await A.page.evaluate(() => location.hash), '');
  await A.page.click('[data-kf-ok]');
  assert.ok(await sincronizado(A.page));
  await A.fechar();
});

test('sincronização: recusa chave sem a permissão gist e chave errada', async () => {
  const gh = githubFalso({ escopos: 'repo' });
  const A = await aparelho(amb, { github: gh, caminho: pagina() });
  await conectarPelaNuvem(A.page);
  await A.page.locator('.kf-toast >> text=não tem a permissão gist').waitFor();
  assert.equal(await A.page.evaluate(() => T.SY.ligada()), false);
  await A.page.fill('#kf-token', 'ghp_' + 'x'.repeat(36));
  await A.page.click('[data-kf-conectar]');
  await A.page.locator('.kf-toast >> text=não aceitou essa chave').waitFor();
  await A.page.fill('#kf-token', 'senha123');
  await A.page.click('[data-kf-conectar]');
  await A.page.locator('.kf-toast >> text=não parece uma chave').waitFor();
  assert.equal(await A.page.evaluate(() => T.SY.ligada()), false);
  await A.fechar();
});

test('cópia de segurança: envelope padrão', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const env = await a.page.evaluate(() => KitFacil.copia.envelope({ x: 1 }, 3));
  assert.equal(env.formato, 'copia-facil'); assert.equal(env.app, amb.app); assert.equal(env.esquema, 3);
  assert.deepEqual(env.dados, { x: 1 }); assert.ok(!isNaN(Date.parse(env.em)));
  await a.fechar();
});

/* ---------------- Kit Fácil 2.1: apoio ao criador, novidades e boas-vindas ---------------- */
test('chopp: sem chave Pix não aparece; com chave fica entre a nuvem e o balão e não aparece nas telas internas', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  assert.deepEqual((await conferirTopo(a.page, { chopp: false })).erros, []);
  assert.equal(await a.page.evaluate(() => KitFacil.topo.html({ principal: true }).includes('data-kf="apoio"')), false);
  await a.fechar();
  const b = await aparelho(amb, { caminho: pagina() + '&apoio=1' });
  assert.equal(await b.page.evaluate(() => KitFacil.topo.html({ principal: false }).includes('data-kf="apoio"')), false);
  assert.equal(await b.page.evaluate(() => KitFacil.topo.html({ principal: true }).includes('data-kf="ajustes"')), false);
  await b.fechar();
});

test('chopp: código Pix copia e cola no padrão do Banco Central (CRC confere) e janela com um só botão, Copiar código Pix', async () => {
  const a = await aparelho(amb, { caminho: pagina() + '&apoio=1' });
  const p = a.page;
  const cod = await p.evaluate(() => KitFacil.apoio.codigo());
  assert.match(cod, /^000201/);
  assert.ok(cod.includes('0014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000'));
  assert.ok(cod.includes('5913CRIADOR TESTE') && cod.includes('6008BRASILIA'));
  // CRC16-CCITT recalculado aqui, independente do kit
  const corpo = cod.slice(0, -4); let c = 0xFFFF;
  for (let i = 0; i < corpo.length; i++) { c ^= corpo.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; }
  assert.equal(cod.slice(-4), c.toString(16).toUpperCase().padStart(4, '0'));
  await p.click('.kf-topo [data-kf="apoio"]');
  const dlg = p.locator('[data-kf-dialogo="apoio"]');
  await dlg.waitFor();
  assert.equal(await dlg.locator('h2').textContent(), 'Pague um chopp para o criador!');
  // sem internet (bibliotecas bloqueadas nos testes): o QR dá lugar ao aviso e o código continua copiável
  assert.ok(await esperar(() => dlg.locator('[data-kf-qr]').textContent().then(t => /Sem internet/.test(t))));
  await p.evaluate(() => { window.__copiado = ''; navigator.clipboard.writeText = t => { window.__copiado = t; return Promise.resolve(); }; });
  await dlg.locator('[data-kf-pix-codigo]').click();
  assert.equal(await p.evaluate(() => window.__copiado), cod);
  assert.equal(await dlg.locator('.kf-dlg-pe button').count(), 1, 'a janela deve ter só o botão Copiar código Pix');
  await p.keyboard.press('Escape');
  assert.equal(await p.evaluate(() => document.activeElement.dataset.kf), 'apoio');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('novidades: aparecem uma vez para quem atualiza e ficam em Sobre o aplicativo', async () => {
  const antes = () => { window.KF_TESTE_ABERTURA = true; if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); for (const f of ['conta-facil', 'eletrica-facil', 'estudo-facil']) localStorage.setItem(`kitfacil.${f}.visto`, '"0.0.0-antiga"'); } };
  const a = await aparelho(amb, { caminho: pagina() + '&novidades=1', antes });
  const p = a.page;
  const dlg = p.locator('[data-kf-dialogo="novidades"]');
  await dlg.waitFor({ timeout: 5000 });
  assert.match(await dlg.textContent(), /Novidade um\.[\s\S]*Novidade dois\./);
  await dlg.locator('[data-kf-fechar]').last().click();
  await p.reload();
  await p.waitForTimeout(1500);
  assert.equal(await dlg.count(), 0, 'as novidades apareceram de novo');
  await abrirAjustesPelaNav(p);
  await p.click('[data-kf-aj-ir="sobre"]');
  assert.match(await p.textContent('#kf-aj-sobre'), /Novidades desta versão[\s\S]*Novidade um\./);
  await a.fechar();
});

test('boas-vindas: só no primeiro uso, com os passos e o atalho para o exemplo', async () => {
  const antes = () => { window.KF_TESTE_ABERTURA = true; };
  const a = await aparelho(amb, { caminho: pagina() + '&novo=1&novidades=1', antes });
  const p = a.page;
  const dlg = p.locator('[data-kf-dialogo="boas-vindas"]');
  await dlg.waitFor({ timeout: 5000 });
  assert.equal(await p.locator('[data-kf-dialogo="novidades"]').count(), 0, 'quem nunca usou não precisa ver novidades');
  assert.equal(await dlg.locator('.kf-passos li').count(), 2);
  await dlg.locator('[data-kf-exemplo]').click();
  assert.equal(await p.evaluate(() => window.EXEMPLO), true);
  await p.reload();
  await p.waitForTimeout(1500);
  assert.equal(await dlg.count(), 0, 'as boas-vindas apareceram de novo');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Ajustes na navegação: abre os Ajustes, fica marcado e tocar de novo volta para a lista de guias', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await abrirAjustesPelaNav(p);
  await p.locator('[data-kf-aj]').waitFor();
  assert.equal(await p.locator('.kf-nav [data-kf="ajustes"]').getAttribute('aria-current'), 'page');
  await p.click('[data-kf-aj-ir="aparencia"]');
  assert.ok(await p.isVisible('#kf-aj-aparencia'));
  await abrirAjustesPelaNav(p);
  assert.ok(await esperar(() => p.isVisible('.kf-aj-lista')), 'tocar em Ajustes não voltou para a lista');
  await p.click('.kf-nav [data-ir="inicio"]');
  assert.ok(await esperar(() => p.evaluate(() => !document.querySelector('[data-kf-aj]'))));
  assert.equal(await p.locator('.kf-nav [data-kf="ajustes"]').getAttribute('aria-current'), 'false');
  await a.fechar();
});

test('barra de baixo: com até 5 itens mostra todos; com 10 seções mostra 4 + "Mais", sem cortar nomes, e o "Mais" leva a qualquer seção', async () => {
  for (const viewport of [{ width: 360, height: 740 }, { width: 820, height: 1180 }]) {
    const poucos = await aparelho(amb, { viewport, caminho: pagina() });
    assert.equal(await poucos.page.locator('.kf-nav [data-kf-nav-mais]').count(), 0, 'com 3 itens não deveria haver "Mais"');
    assert.deepEqual((await conferirNavAjustes(poucos.page)).erros, []);
    await poucos.fechar();
    const muitos = await aparelho(amb, { viewport, caminho: pagina() + '&secoes=8' });
    const p = muitos.page;
    const n = await conferirNavAjustes(p);
    assert.deepEqual(n.erros, [], `largura ${viewport.width}: ${n.erros.join('; ')}`);
    assert.equal(n.onde, 'mais');
    assert.equal(await p.locator('.kf-nav .kf-nav-it:visible').count(), 5);
    // principais: Início, Notas e as seções ímpares (as pares foram marcadas com data-kf-mais)
    assert.deepEqual(await p.locator('.kf-nav .kf-nav-it:visible .kf-nav-l').allTextContents(), ['Início', 'Notas', 'Seção 1', 'Seção 3', 'Mais']);
    await irPelaNav(p, 'Seção 8');
    assert.ok(await esperar(() => p.evaluate(() => document.querySelector('#main h1').textContent === 'extra8')));
    // a seção atual está no "Mais": o "Mais" fica marcado
    assert.equal(await p.getAttribute('.kf-nav [data-kf-nav-mais]', 'aria-current'), 'page');
    await p.click('.kf-nav [data-kf-nav-mais]');
    assert.equal(await p.locator('[data-kf-dialogo="mais"] .kf-aj-item').last().textContent().then(t => t.trim()), 'Ajustes');
    assert.equal(await p.locator('[data-kf-dialogo="mais"] [aria-current="true"]').textContent().then(t => t.trim()), 'Seção 8');
    await p.keyboard.press('Escape');
    await abrirAjustesPelaNav(p);
    await p.locator('[data-kf-aj]').waitFor();
    assert.equal(await p.getAttribute('.kf-nav [data-kf-nav-mais]', 'aria-current'), 'page');
    assert.ok(await semRolagemLateral(p));
    assert.deepEqual(muitos.erros, []);
    await muitos.fechar();
  }
});

test('tela principal: cabeçalho com título, estado vazio e botão de criar flutuante no celular (sem cobrir a lista) e no cabeçalho no computador', async () => {
  for (const viewport of [{ width: 360, height: 740 }, { width: 820, height: 1180 }, COMPUTADOR]) {
    const vazio = await aparelho(amb, { viewport, caminho: pagina() });
    const p0 = vazio.page;
    await p0.evaluate(() => T.ir('notas'));
    await p0.locator('.kf-cab .kf-titulo').waitFor();
    assert.equal(await p0.textContent('.kf-cab .kf-titulo'), 'Notas');
    assert.equal(await p0.locator('.kf-vazio b').textContent(), 'Nenhuma nota ainda');
    assert.equal(await p0.locator('.kf-vazio [data-nova-nota]').count(), 1);
    await vazio.fechar();

    const a = await aparelho(amb, { viewport, caminho: pagina() + '&lista=30' });
    const p = a.page;
    await p.evaluate(() => T.ir('notas'));
    const b = p.locator('.kf-criar');
    await b.waitFor();
    assert.match(await b.textContent(), /Nova nota/);
    const r = await b.boundingBox();
    assert.ok(r.height >= 44 && r.width >= 44, 'botão de criar menor que 44 px');
    const pos = await b.evaluate(el => getComputedStyle(el).position);
    if (viewport.width < 1024) {
      assert.equal(pos, 'fixed', `largura ${viewport.width}: botão de criar deveria flutuar`);
      const nav = await p.locator('.kf-nav').boundingBox();
      assert.ok(r.y + r.height <= nav.y, 'o botão de criar fica por cima da barra de baixo');
      // no fim da página, o último item da lista fica todo acima do botão
      await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await p.waitForTimeout(100);
      const ult = await p.locator('#notas li').last().boundingBox();
      const r2 = await b.boundingBox();
      assert.ok(ult.y + ult.height <= r2.y + 1, `largura ${viewport.width}: o botão de criar cobre o último item da lista`);
    } else {
      assert.notEqual(pos, 'fixed', 'no computador o botão de criar fica no cabeçalho');
      const cab = await p.locator('.kf-cab').boundingBox();
      assert.ok(r.y >= cab.y && r.y + r.height <= cab.y + cab.height + 1, 'botão de criar fora do cabeçalho');
    }
    assert.ok(await semRolagemLateral(p));
    assert.deepEqual(a.erros, []);
    await a.fechar();
  }
});
