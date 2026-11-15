/* Kit Fácil · testes automáticos dos componentes comuns (rodam em todos os apps com `npm test`).
   Usam a página comum/testes/pagina-kit.html, um GitHub e um Firestore de mentira (veja ambiente.mjs). */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, TOKEN_TESTE, conferirTopo, conferirNavAjustes, abrirAjustesPelaNav, irPelaNav, guiasAjustes, GUIAS_COMUNS, semRolagemLateral, teclado, TECLADO, filmarJanela, animacoes, assentar, semCampoEmFoco } from './ambiente.mjs';

let amb;
before(async () => { amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const pagina = () => `comum/testes/pagina-kit.html?app=${amb.app}`;
const esperar = async (cond, ms = 8000, passo = 50) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, passo)); } return false; };
const estadoNuvem = p => p.getAttribute('[data-kf-nuvem]', 'data-estado');
const CELULAR = { width: 390, height: 844 }, COMPUTADOR = { width: 1280, height: 860 };

/* ---------------- área superior direita ---------------- */
test('topo: nuvem, presente e balão no canto superior direito, nessa ordem; Ajustes na navegação, no celular e no computador', async () => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 740 }, CELULAR, { width: 820, height: 1180 }, COMPUTADOR]) {
    const a = await aparelho(amb, { viewport, caminho: pagina() + '&apoio=1' });
    const t = await conferirTopo(a.page, { presente: true });
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
  assert.match(priv, /As notas de teste ficam guardadas neste aparelho/); assert.match(priv, /gist secreto/); assert.match(priv, /Restaurar padrões de fábrica/);
  assert.match(await texto('feedback'), /Avaliar o app[\s\S]*Relatar um problema/);
  const sobre = await texto('sobre');
  assert.match(sobre, /Versão 0\.0\.0-teste/); assert.match(sobre, /Termos de uso/); assert.match(sobre, /Kit Fácil \d+\.\d+\.\d+/);
  const links = await p.$$eval('#kf-aj-sobre .kf-apps a', l => l.map(x => x.getAttribute('href')));
  assert.equal(links.length, 3, 'os outros apps da família');
  for (const h of links) assert.match(h, /^\/(conta|eletrica|estudo|guitarra)-facil\/$/);
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

test('tema de fábrica do app (Kit 2.8): vale até a pessoa escolher; sem padrão, continua Automático', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.waitForFunction(() => window.KitFacil);
  const r = await p.evaluate(() => {
    const cores = { claro: '#F4F4F1', escuro: '#111111' }, T = KitFacil.tema;
    T.iniciar({ chave: 'kitteste.tema-a', cores });
    const semPadrao = T.valor;
    T.iniciar({ chave: 'kitteste.tema-b', cores, padrao: 'escuro' });
    const fabrica = [T.valor, document.documentElement.getAttribute('data-theme'), T.seletorHTML().includes('abre no tema escuro')];
    T.definir('claro');
    T.iniciar({ chave: 'kitteste.tema-b', cores, padrao: 'escuro' });
    const escolhido = [T.valor, document.documentElement.getAttribute('data-theme')];
    T.iniciar({ chave: 'kitteste.tema-c', cores, padrao: 'qualquer' });
    return { semPadrao, fabrica, escolhido, invalido: T.valor };
  });
  assert.equal(r.semPadrao, 'auto');
  assert.deepEqual(r.fabrica, ['escuro', 'dark', true], 'o app abre no escuro e a Aparência explica');
  assert.deepEqual(r.escolhido, ['claro', 'light'], 'a escolha da pessoa vale mais que a de fábrica');
  assert.equal(r.invalido, 'auto', 'valor desconhecido volta para o Automático');
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
  await p.click('[data-kf="restaurar-fabrica"]');
  assert.match(await p.textContent('.kf-dlg'), /volta como novo neste aparelho/);
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
test('presente: sem chave Pix não aparece; com chave fica entre a nuvem e o balão e não aparece nas telas internas', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  assert.deepEqual((await conferirTopo(a.page, { presente: false })).erros, []);
  assert.equal(await a.page.evaluate(() => KitFacil.topo.html({ principal: true }).includes('data-kf="apoio"')), false);
  await a.fechar();
  const b = await aparelho(amb, { caminho: pagina() + '&apoio=1' });
  assert.equal(await b.page.evaluate(() => KitFacil.topo.html({ principal: false }).includes('data-kf="apoio"')), false);
  assert.equal(await b.page.evaluate(() => KitFacil.topo.html({ principal: true }).includes('data-kf="ajustes"')), false);
  await b.fechar();
});

test('presente: código Pix copia e cola no padrão do Banco Central (CRC confere) e janela com um só botão, Copiar código Pix', async () => {
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
  assert.equal(await dlg.locator('h2').textContent(), 'Mande um presente para o criador!');
  assert.equal(await dlg.locator('.kf-ap .kf-o3d[data-o3d="presente"][role="img"]').count(), 1, 'a janela mostra o presente em 3D');
  assert.match(await dlg.textContent(), /continua igual para todos, com presente ou sem\./, 'texto do apoio (D12)');
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

test('Kit 2.13: sem tela de primeiro uso; a janela de boas-vindas abre na primeira vez e a apresentação em toda abertura', async () => {
  const antes = () => { window.KF_TESTE_ABERTURA = true; };
  const a = await aparelho(amb, { caminho: pagina() + '&novo=1&apres=1', antes });
  const p = a.page;
  const dlg = p.locator('[data-kf-dialogo="apresentacao"]');
  await dlg.waitFor({ timeout: 5000 });
  assert.match(await dlg.locator('h2, .kf-dlg-titulo, [id$="titulo"]').first().textContent(), /Boas-vindas ao/);
  assert.equal(await dlg.locator('[data-kf-exemplo]').count(), 1, 'o atalho do exemplo fica na janela de boas-vindas');
  assert.equal(await dlg.locator('[data-kf-apres]').count(), 1, 'a pessoa pode desligar a janela');
  await dlg.locator('[data-kf-fechar]').last().click();
  await p.reload();
  await dlg.waitFor({ timeout: 5000 });
  assert.doesNotMatch(await dlg.locator('h2, .kf-dlg-titulo, [id$="titulo"]').first().textContent(), /Boas-vindas/);
  // desligada, não abre mais
  await dlg.locator('[data-kf-apres]').uncheck();
  await dlg.locator('[data-kf-fechar]').last().click();
  await p.reload();
  await p.waitForTimeout(1500);
  assert.equal(await dlg.count(), 0, 'a apresentação desligada abriu de novo');
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

/* ---------------- Kit 2.5: lista de escolha e seções ---------------- */
test('lista de escolha: toda <select> vira a lista do Kit, que guarda o valor, avisa o app e funciona no teclado', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    document.getElementById('main').insertAdjacentHTML('beforeend', `<label for="t-fruta">Fruta</label>
      <select id="t-fruta"><option value="" hidden>Escolha a fruta</option><option value="m">Maçã</option><option value="b">Banana</option><option value="u" disabled>Uva</option>
      <optgroup label="Cítricas"><option value="l">Laranja</option></optgroup></select>
      <label class="x">Cor <select id="t-cor"><option>Azul</option><option>Verde</option></select></label>`);
    window.mudou = 0; document.getElementById('t-fruta').addEventListener('change', () => window.mudou++);
  });
  await p.locator('#t-fruta-esc').waitFor();
  assert.equal(await p.locator('select:visible').count(), 0, 'a lista do sistema não aparece');
  assert.equal(await p.textContent('#t-fruta-esc'), 'Escolha a fruta');
  assert.equal(await p.getAttribute('label[for="t-fruta-esc"]', 'for'), 't-fruta-esc', 'o rótulo aponta para o botão');
  assert.equal(await p.getAttribute('#t-cor-esc', 'aria-label'), 'Cor');
  await p.click('#t-fruta-esc');
  assert.equal(await p.getAttribute('#t-fruta-esc', 'aria-expanded'), 'true');
  const ops = await p.locator('#t-fruta-esc ~ .kf-esc-lista .kf-esc-op').allTextContents();
  assert.deepEqual(ops, ['Maçã', 'Banana', 'Uva', 'Laranja'], 'a opção escondida (Escolha…) não aparece na lista');
  assert.match(await p.textContent('#t-fruta-esc ~ .kf-esc-lista'), /Cítricas/);
  // teclado: seta para baixo e Enter
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(() => [document.getElementById('t-fruta').value, window.mudou]).then(x => x.join()), 'b,1');
  assert.equal(await p.textContent('#t-fruta-esc'), 'Banana');
  // opção desligada não é escolhida; o código do app muda o valor e a lista acompanha
  await p.click('#t-fruta-esc');
  await p.click('#t-fruta-esc ~ .kf-esc-lista [data-k="3"]', { force: true });
  assert.equal(await p.evaluate(() => document.getElementById('t-fruta').value), 'b');
  await p.keyboard.press('Escape');
  await p.evaluate(() => { document.getElementById('t-fruta').value = 'l'; });
  assert.equal(await p.textContent('#t-fruta-esc'), 'Laranja');
  await p.evaluate(() => { document.getElementById('t-fruta').innerHTML = '<option value="z">Nova</option>'; });
  await p.waitForFunction(() => document.getElementById('t-fruta-esc').textContent === 'Nova');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('seções: abrem e fecham com movimento, fecham as outras do grupo e não passam do fim da página', async () => {
  for (const viewport of [CELULAR, { width: 820, height: 1180 }]) {
    const a = await aparelho(amb, { viewport, caminho: pagina() });
    const p = a.page;
    await p.evaluate(() => {
      const sec = (n, h) => `<details data-kf-secao="grupo" id="s${n}"><summary>Seção ${n}<small data-kf-secao-resumo>resumo ${n}</small> <button id="b${n}">ação</button></summary><div style="height:${h}px">conteúdo ${n}</div></details>`;
      document.getElementById('main').insertAdjacentHTML('beforeend', sec(1, 600) + sec(2, 300) + sec(3, 200) + '<details data-kf-secao id="solta"><summary>Solta</summary><p>texto</p></details>');
      window.ev = []; document.addEventListener('kf-secao', e => window.ev.push(e.target.id + ':' + e.detail.aberta));
    });
    await p.click('#s1 > summary');
    assert.equal(await p.evaluate(() => document.getElementById('s1').classList.contains('kf-secao-anim')), true, 'abre com animação');
    await p.waitForFunction(() => !document.querySelector('.kf-secao-anim'));
    await p.click('#s3 > summary');
    await p.waitForFunction(() => !document.querySelector('.kf-secao-anim'));
    await p.waitForTimeout(80);
    assert.deepEqual(await p.evaluate(() => ['s1', 's2', 's3'].map(id => document.getElementById(id).open)), [false, false, true], 'abrir uma fecha as outras do grupo');
    const pos = await p.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight]);
    assert.ok(pos[0] <= pos[1] + 1, `rolou além do fim (${pos})`);
    assert.equal(await p.locator('.kf-secao-folga').count(), 0);
    // botão dentro do título não abre a seção; a seção sem grupo não fecha as outras
    await p.click('#b2');
    assert.equal(await p.evaluate(() => document.getElementById('s2').open), false);
    await p.click('#solta > summary');
    await p.waitForFunction(() => !document.querySelector('.kf-secao-anim'));
    assert.deepEqual(await p.evaluate(() => [document.getElementById('solta').open, document.getElementById('s3').open]), [true, true]);
    assert.ok((await p.evaluate(() => window.ev)).includes('s1:false'), 'o evento kf-secao avisa o app');
    // movimento reduzido: troca direta
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.click('#solta > summary');
    assert.equal(await p.evaluate(() => [document.getElementById('solta').open, !!document.querySelector('.kf-secao-anim')].join()), 'false,false');
    assert.deepEqual(a.erros, []);
    await a.fechar();
  }
});

test('Kit 2.6: campo de data com o calendário do Kit (o <input> guarda o valor) e janelas que saem com movimento', async () => {
  const a = await aparelho(amb, { viewport: CELULAR, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    const m = document.getElementById('main');
    m.insertAdjacentHTML('beforeend', '<label for="d1">Data da prova</label><input type="date" id="d1" min="2026-01-05" max="2026-12-20" value="2026-03-10">');
    window.MUDOU = 0; document.getElementById('d1').addEventListener('change', () => MUDOU++);
  });
  const btn = p.locator('#d1-data');
  await btn.waitFor();
  assert.equal(await p.locator('#d1').isVisible(), false, 'o calendário do sistema não aparece');
  assert.match(await btn.textContent(), /10\/03\/2026/);
  await btn.click();
  const cal = p.locator('#d1-data-cal');
  assert.equal(await cal.isVisible(), true);
  assert.match(await cal.textContent(), /Março de 2026/);
  await p.click('#d1-data-cal [data-kf-dia="2026-03-21"]');
  assert.equal(await p.inputValue('#d1'), '2026-03-21');
  assert.equal(await p.evaluate(() => MUDOU), 1);
  assert.equal(await cal.isVisible(), false);
  assert.match(await btn.textContent(), /21\/03\/2026/);
  // limites: antes do mínimo fica desligado; o app muda .value e o botão acompanha
  await p.evaluate(() => { document.getElementById('d1').value = '2026-01-07'; });
  assert.match(await btn.textContent(), /07\/01\/2026/);
  await btn.click();
  assert.equal(await p.locator('#d1-data-cal [data-kf-dia="2026-01-04"]').isDisabled(), true, 'dia antes do mínimo');
  assert.equal(await p.locator('#d1-data-cal [data-kf-mes="-1"]').isDisabled(), true);
  await p.keyboard.press('Escape');
  assert.equal(await cal.isVisible(), false);
  // janela: some na hora para o código (nenhuma .kf-dlg) e um fantasma sai com o movimento
  await p.evaluate(() => KitFacil.dialogo.abrir({ titulo: 'Teste', corpo: '<p>Oi</p>' }));
  await p.locator('.kf-dlg').waitFor();
  await p.click('.kf-dlg [data-kf-fechar]');
  assert.equal(await p.locator('.kf-dlg').count(), 0);
  assert.equal(await p.evaluate(() => KitFacil.dialogo.aberto()), false);
  assert.ok(await esperar(() => p.evaluate(() => !document.querySelector('#kf-saidas > *')), 2000), 'o fantasma da janela some sozinho');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 2.7: campo de hora com as colunas do Kit (o <input> guarda o valor)', async () => {
  const a = await aparelho(amb, { viewport: CELULAR, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    document.getElementById('main').insertAdjacentHTML('beforeend', '<label for="h1">Horário</label><input type="time" id="h1" value="09:30" step="900">');
    window.MUDOU = 0; document.getElementById('h1').addEventListener('change', () => MUDOU++);
  });
  const btn = p.locator('#h1-hora');
  await btn.waitFor();
  assert.equal(await p.locator('#h1').isVisible(), false, 'o relógio do sistema não aparece');
  assert.equal((await btn.textContent()).trim(), '09:30');
  await btn.click();
  assert.equal(await p.locator('#h1-hora-cal [data-kf-m]').count(), 4, 'step de 15 minutos: 00, 15, 30, 45');
  await p.click('#h1-hora-cal [data-kf-h="14"]');
  assert.equal(await p.inputValue('#h1'), '14:30');
  await p.click('#h1-hora-cal [data-kf-m="45"]');
  assert.equal(await p.inputValue('#h1'), '14:45');
  assert.equal(await p.locator('#h1-hora-cal').isVisible(), false);
  assert.ok(await p.evaluate(() => MUDOU) >= 1);
  await p.evaluate(() => { document.getElementById('h1').value = '07:00'; });
  assert.equal((await btn.textContent()).trim(), '07:00');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 2.10: guias do Kit (setas do teclado), faixa com botão contornado e medidas comuns', async () => {
  const a = await aparelho(amb, { viewport: CELULAR, caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    const m = document.getElementById('main');
    m.insertAdjacentHTML('beforeend', KitFacil.ui.abas({ itens: [['a', 'Materiais', 3], ['b', 'Ferramentas'], ['c', 'Checklist']], atual: 'a', rotulo: 'Parte' })
      + KitFacil.ui.faixa({ tipo: 'dica', html: '<b>Dica.</b> Texto.', acao: '<button class="kf-btn kf-sec" id="fx">Fazer</button>' })
      + '<button class="kf-btn kf-pri" id="bp">Principal</button><div class="kf-cartao" id="ct">x</div>');
    window.ABA = '';
    m.addEventListener('click', e => { const b = e.target.closest('[data-aba]'); if (!b) return; ABA = b.dataset.aba; b.parentNode.querySelectorAll('[role=tab]').forEach(x => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; }); });
  });
  const abas = p.locator('.kf-abas [role="tab"]');
  assert.equal(await abas.count(), 3);
  assert.equal(await p.getAttribute('.kf-abas', 'aria-label'), 'Parte');
  assert.match(await abas.nth(0).textContent(), /Materiais · 3/);
  await abas.nth(0).focus(); await p.keyboard.press('ArrowRight');
  assert.equal(await p.evaluate(() => ABA), 'b');
  assert.equal(await abas.nth(1).getAttribute('aria-selected'), 'true');
  await p.keyboard.press('End'); assert.equal(await p.evaluate(() => ABA), 'c');
  const m = await p.evaluate(() => {
    const cs = s => getComputedStyle(document.querySelector(s));
    return { bh: cs('#bp').minHeight, br: cs('#bp').borderTopLeftRadius, cr: cs('#ct').borderTopLeftRadius, fx: cs('#fx').backgroundColor, faixa: document.querySelector('.kf-faixa').className };
  });
  assert.equal(m.bh, '48px'); assert.equal(m.br, '14px'); assert.equal(m.cr, '20px');
  assert.match(m.faixa, /kf-dica/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

/* ---------------- Kit 0.4.0 (Código 0.3) ---------------- */
test('Kit 0.4.0 · janela: contexto acima do título e subtítulo abaixo; aviso fica acima dos botões do pé', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => KitFacil.dialogo.abrir({ contexto: 'Fechar a comanda', titulo: 'Bruno não paga o serviço', sub: 'O que fazer com R$ 7,22?', corpo: '<p>x</p>',
    pe: '<button class="kf-btn kf-sec" data-kf-fechar>Voltar</button><button class="kf-btn kf-pri">Continuar</button>' }));
  const ordem = await p.evaluate(() => [...document.querySelector('.kf-dlg-tt').children].map(e => e.className || e.tagName));
  assert.deepEqual(ordem, ['kf-dlg-ctx', 'H2', 'kf-dlg-sub']);
  await p.evaluate(() => KitFacil.avisar('Bruno: pago.'));
  await p.waitForTimeout(400); // depois que a janela termina de subir
  const r = await p.evaluate(() => ({ aviso: document.querySelector('.kf-toast').getBoundingClientRect().bottom, pe: document.querySelector('.kf-dlg-pe').getBoundingClientRect().top }));
  assert.ok(r.aviso <= r.pe, `o aviso (${r.aviso}) cobre o pé da janela (${r.pe})`);
  await p.keyboard.press('Escape');
  await p.evaluate(() => KitFacil.avisar('Sem janela.'));
  assert.equal(await p.evaluate(() => document.querySelector('.kf-toast').style.bottom), '');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.4.0 · linha de adicionar, botão de fato, texto só para leitor de tela e item novo que pisca', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  const r = await p.evaluate(() => {
    const m = document.getElementById('main');
    m.innerHTML = `<ul id="l">${Array.from({ length: 30 }, (_, i) => `<li style="min-height:56px">Item ${i}</li>`).join('')}</ul>` + KitFacil.ui.adicionar({ rotulo: 'Pessoa', attrs: 'data-add' })
      + KitFacil.ui.fato({ marcado: false, marcar: 'Marcar como pago', desmarcar: 'Desmarcar pago', attrs: 'data-f1' })
      + KitFacil.ui.fato({ marcado: true, marcar: 'Marcar como pago', desmarcar: 'Desmarcar pago', attrs: 'data-f2' })
      + '<span class="kf-so-leitor" id="so">Falta pagar</span>';
    const add = m.querySelector('[data-add]'), so = document.getElementById('so').getBoundingClientRect();
    return { altura: add.getBoundingClientRect().height, texto: add.textContent.trim(), f1: m.querySelector('[data-f1]').textContent.trim(), f2: m.querySelector('[data-f2]').getAttribute('aria-pressed'), so: [so.width, so.height] };
  });
  assert.ok(r.altura >= 44, 'linha de adicionar menor que 44 px');
  assert.equal(r.texto, 'Pessoa');
  assert.equal(r.f1, 'Marcar como pago');
  assert.equal(r.f2, 'true');
  assert.deepEqual(r.so, [1, 1]);
  await p.evaluate(() => { const li = document.querySelector('#l li:last-child'); window.__li = li; KitFacil.destacar(li); });
  assert.ok(await esperar(() => p.evaluate(() => window.__li.classList.contains('kf-novo'))), 'o item novo não piscou');
  const dentro = await p.evaluate(() => { const r = window.__li.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
  assert.ok(dentro, 'a tela não rolou até o item novo');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.4.0 · carrossel: um cartão por vez, setas, contador, teclado e gesto de deslizar', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    const m = document.getElementById('main');
    m.innerHTML = '<div id="car"><div style="height:200px">Ana</div><div style="height:320px">Bruno</div><div style="height:240px">Carla</div></div>';
    window.__mudou = [];
    window.__car = KitFacil.carrossel(document.getElementById('car'), { rotulos: ['Ana', 'Bruno', 'Carla'], aoMudar: i => window.__mudou.push(i), rotulo: 'Cupons' });
  });
  const cont = () => p.textContent('.kf-car-cont');
  assert.equal(await cont(), '1 de 3 · Ana');
  assert.equal(await p.isDisabled('[data-kf-car="-1"]'), true);
  await p.click('[data-kf-car="1"]');
  assert.equal(await cont(), '2 de 3 · Bruno');
  await p.focus('.kf-car-janela'); await p.keyboard.press('ArrowRight');
  assert.equal(await cont(), '3 de 3 · Carla');
  assert.equal(await p.isDisabled('[data-kf-car="1"]'), true);
  // deslizar para a direita volta um cartão
  const j = await p.evaluate(() => { const r = document.querySelector('.kf-car-janela').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 60, w: r.width }; });
  await p.mouse.move(j.x, j.y); await p.mouse.down(); await p.mouse.move(j.x + j.w * .2, j.y, { steps: 4 }); await p.mouse.move(j.x + j.w * .4, j.y, { steps: 4 }); await p.mouse.up();
  assert.equal(await cont(), '2 de 3 · Bruno');
  assert.deepEqual(await p.evaluate(() => window.__mudou), [1, 2, 1]);
  // só o cartão da vez fica ao alcance do teclado e do leitor de tela
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-car-slide')].map(s => s.inert)), [true, false, true]);
  assert.ok(await semRolagemLateral(p));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.4.0 · arrastar e soltar: o cartão vai ao alvo e o app recebe a mudança; fora do alvo, volta', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    const m = document.getElementById('main');
    m.innerHTML = '<div id="area" style="display:flex;flex-direction:column;gap:12px;padding:16px"><div class="cx" data-id="a" style="height:60px;background:#ddd">Ana</div><div class="cx" data-id="b" style="height:60px;background:#ddd">Bruno</div><div class="cx" data-id="c" style="height:60px;background:#ddd">Carla</div></div>';
    window.__soltou = []; window.__fora = 0;
    KitFacil.arrastar({ area: document.getElementById('area'), item: '.cx', alvo: '.cx', aoSoltar: (i, al) => window.__soltou.push(i.dataset.id + '>' + al.dataset.id), aoFora: () => window.__fora++ });
  });
  const centro = s => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, s);
  const de = await centro('[data-id="a"]'), para = await centro('[data-id="c"]');
  await p.mouse.move(de.x, de.y); await p.mouse.down(); await p.mouse.move(de.x, de.y + 30, { steps: 5 });
  assert.equal(await p.evaluate(() => !!document.querySelector('.kf-arr-fantasma')), true, 'o cartão não levantou');
  await p.mouse.move(para.x, para.y, { steps: 8 });
  assert.equal(await p.evaluate(() => document.querySelector('[data-id="c"]').classList.contains('kf-arr-alvo')), true, 'o alvo não ficou colorido');
  await p.mouse.up();
  assert.deepEqual(await p.evaluate(() => window.__soltou), ['a>c']);
  // soltar fora de qualquer alvo: volta para casa
  await p.mouse.move(de.x, de.y); await p.mouse.down(); await p.mouse.move(de.x + 5, 400, { steps: 6 }); await p.mouse.move(380, 700, { steps: 4 }); await p.mouse.up();
  assert.equal(await p.evaluate(() => window.__fora), 1);
  assert.ok(await esperar(() => p.evaluate(() => !document.querySelector('.kf-arr-fantasma'))), 'o fantasma ficou na tela');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.4.0 · seção desconta o cabeçalho fixo do app (scroll-margin-top)', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    const m = document.getElementById('main');
    m.innerHTML = '<div style="height:900px"></div><div id="g" style="scroll-margin-top:200px">' + [1, 2, 3].map(i => `<details data-kf-secao="grupo"><summary style="min-height:48px">Seção ${i}</summary><div style="height:400px">corpo ${i}</div></details>`).join('') + '</div><div style="height:900px"></div>';
  });
  await p.click('#g details:nth-child(2) > summary');
  await p.waitForTimeout(800);
  const topo = await p.evaluate(() => document.querySelector('#g details:nth-child(2)').getBoundingClientRect().top);
  assert.ok(topo >= 198 && topo <= 212, `a seção parou em ${topo}px, embaixo do cabeçalho fixo (200 px)`);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.5.0 · aviso rápido com "Desfazer" não some enquanto tem o foco ou o ponteiro em cima', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => KitFacil.avisar('Item apagado.', { label: 'Desfazer', run() { window.__desfeito = true; } }));
  await p.locator('.kf-toast-acao').focus();
  await p.waitForTimeout(6600);
  assert.equal(await p.locator('.kf-toast').isVisible(), true, 'o aviso sumiu com o foco no Desfazer');
  await p.locator('.kf-toast-acao').press('Enter');
  assert.equal(await p.evaluate(() => window.__desfeito), true);
  await p.evaluate(() => KitFacil.avisar('Salvo.'));
  await p.waitForTimeout(3600);
  assert.equal(await p.locator('.kf-toast').isVisible(), false, 'aviso sem foco nem ponteiro deve sumir sozinho');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});


/* ======================= Kit 0.7.0: peças do Conta Fácil (Código 0.7, Art. 93; Anexo II) ======================= */
const CURVA = 'cubic-bezier(0.45, 0, 0.2, 1)';

test('Kit 0.7.0 · presente: ícone de traço na barra, em 3D na janela do apoio, que gira com o dedo; parado com movimento reduzido', async () => {
  const a = await aparelho(amb, { caminho: pagina() + '&apoio=1' });
  const p = a.page;
  const tr = await p.evaluate(() => [...document.querySelectorAll('.kf-topo .kf-topo-btn > svg')].map(s => getComputedStyle(s).color + '|' + getComputedStyle(s).strokeWidth));
  assert.equal(tr.length, 3); assert.equal(new Set(tr).size, 1, 'nuvem, presente e balão: mesma cor e mesmo traço');
  await p.click('.kf-topo [data-kf="apoio"]');
  const o = p.locator('.kf-dlg .kf-o3d[data-o3d="presente"]'); await o.waitFor();
  // o motor de 3D (comum/kit-jogo.js) chega sozinho e troca o desenho parado pelo canvas
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.kf-dlg .kf-o3d').dataset.motor)), 'o presente em 3D não ligou');
  assert.equal(await p.evaluate(() => !!document.querySelector('.kf-dlg .kf-o3d .kf-presente-mini')), false);
  await p.keyboard.press('Escape');
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.click('.kf-topo [data-kf="apoio"]'); await o.waitFor();
  await esperar(() => p.evaluate(() => !!document.querySelector('.kf-dlg .kf-o3d').dataset.ang));
  const ang = () => p.evaluate(() => document.querySelector('.kf-dlg .kf-o3d').dataset.ang);
  const g0 = await ang(); await p.waitForTimeout(400);
  assert.equal(await ang(), g0, 'com movimento reduzido o presente fica parado');
  await o.focus(); await p.keyboard.press('ArrowLeft');
  assert.notEqual(await ang(), g0, 'mas gira com as setas (e com o dedo)');
  // Sobre o aplicativo: o presente pequeno, nas cores do app
  assert.ok((await p.evaluate(() => KitFacil.apoio.mini())).includes('kf-presente-mini'));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · um relógio só: janelas nascem e saem pelo pé em 600 ms, o fundo junto; nenhuma abre com a caixa de texto selecionada', async () => {
  const a = await aparelho(amb, { caminho: pagina(), toque: true });
  const p = a.page;
  assert.deepEqual(await p.evaluate(() => [KitFacil.movimento.ms, KitFacil.movimento.curto, getComputedStyle(document.documentElement).getPropertyValue('--kf-ms').trim()]), [600, 600, '600ms']);
  const abrir = () => p.evaluate(() => KitFacil.dialogo.abrir({ titulo: 'Nome', corpo: '<label class="kf-rotulo" for="cx">Nome</label><input id="cx" class="kf-entrada" autofocus>', pe: '<button class="kf-btn kf-pri">Salvar</button>' }));
  await abrir();
  const n = await animacoes(p, '.kf-dlg');
  assert.ok(n.length && n.every(x => x[0] === 600 && x[1] === CURVA), 'a janela nasce em 600 ms: ' + JSON.stringify(n));
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-ov'), '::before').animationDuration), '0.6s');
  await assentar(p);
  assert.ok(await semCampoEmFoco(p), 'a janela abriu com o campo selecionado');
  assert.equal(await p.evaluate(() => document.activeElement.classList.contains('kf-dlg')), true, 'o foco vai para a janela');
  await p.click('.kf-dlg [data-kf-fechar]');
  const s = await animacoes(p, '#kf-saidas .kf-dlg-x');
  assert.ok(s && s.length === 1 && s[0][0] === 600 && s[0][1] === CURVA, 'a janela sai em 600 ms: ' + JSON.stringify(s));
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('#kf-saidas .kf-ov'), '::before').animationName), 'kf-apaga', 'o fundo clareia junto');
  await p.waitForFunction(() => !document.querySelector('#kf-saidas > .kf-ov'));
  // nasce abaixo da tela e sobe sem ir e voltar; com o teclado, termina encostada nele, num caminho só
  const H = await p.evaluate(() => innerHeight);
  let f = await filmarJanela(p, async () => { await abrir(); await p.waitForTimeout(40); await p.focus('#cx'); await teclado(p, true); });
  assert.equal(f.inv, 0, 'a janela foi e voltou ao nascer'); assert.ok(f.de >= H - 40, `a janela nasce abaixo da tela (${f.de})`);
  assert.equal(await p.evaluate(() => Math.round(document.querySelector('.kf-dlg').getBoundingClientRect().bottom)), H - TECLADO, 'a janela termina encostada no teclado');
  assert.ok(await p.evaluate(() => document.documentElement.classList.contains('kf-tk')));
  f = await filmarJanela(p, async () => { await p.evaluate(() => document.activeElement.blur()); await teclado(p, false); });
  assert.equal(f.inv, 0, 'ao fechar o teclado, a janela desce de uma vez');
  // uma janela no lugar de outra: não nasce de novo lá de baixo
  f = await filmarJanela(p, () => p.evaluate(() => KitFacil.dialogo.confirmar({ titulo: 'Apagar nota?', texto: 'A nota sai deste aparelho.', ok: 'Apagar nota', perigo: true })), 600);
  assert.ok(f.de < H - 100, `a janela que entra no lugar de outra não nasce abaixo da tela (${f.de})`);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · confirmação: o botão nomeia a ação, diz se dá para desfazer, Cancelar fecha sem fazer nada', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => { window.R = []; KitFacil.dialogo.confirmar({ titulo: 'Apagar nota?', texto: 'A nota "Mercado" sai deste aparelho.', desfaz: 'Não dá para desfazer.', ok: 'Apagar nota', perigo: true, aoConfirmar: () => R.push('ok'), aoCancelar: () => R.push('cancelou') }); });
  const d = p.locator('[data-kf-dialogo="confirmar"]'); await d.waitFor();
  assert.deepEqual(await d.locator('.kf-dlg-pe button').allTextContents(), ['Cancelar', 'Apagar nota']);
  assert.match(await d.textContent(), /Não dá para desfazer\./);
  assert.equal(await p.evaluate(() => document.activeElement.dataset.kfOk !== undefined), true, 'o foco fica no botão da ação');
  assert.match(await d.locator('[data-kf-ok]').getAttribute('class'), /kf-perigo/);
  await d.locator('[data-kf-cancelar]').click(); assert.deepEqual(await p.evaluate(() => R), ['cancelou']);
  await p.evaluate(() => KitFacil.dialogo.confirmar({ titulo: 'Apagar?', texto: 'x', ok: 'Apagar', aoConfirmar: () => R.push('ok') }));
  await p.locator('[data-kf-ok]').click(); assert.deepEqual(await p.evaluate(() => R), ['cancelou', 'ok']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · campos: dinheiro e porcentagem entram como centavos; quantidade com − e +; chave e botões de escolha', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    document.getElementById('main').innerHTML = `<label class="kf-rotulo" for="v">Valor</label>${KitFacil.campo.dinheiro.html({ id: 'v' })}
      <label class="kf-rotulo" for="pc">Serviço</label>${KitFacil.campo.porcento.html({ id: 'pc', valor: 10 })}
      <label class="kf-rotulo" for="q">Quantidade</label>${KitFacil.ui.quantidade({ id: 'q', valor: 1, min: 1, max: 3 })}
      <label class="kf-check" id="lc"><span>Paga serviço</span>${KitFacil.ui.chave({ attrs: 'id="ch"', on: true, rotulo: 'Paga serviço' })}</label>
      <div>${KitFacil.ui.escolha({ rotulo: 'Ana', on: true })}${KitFacil.ui.escolha({ rotulo: 'Bruno' })}</div>`;
    window.QT = []; document.getElementById('q').addEventListener('input', e => QT.push(e.target.value));
  });
  await p.locator('#v').pressSequentially('1234');
  assert.match(await p.inputValue('#v'), /^R\$\s12,34$/);
  assert.equal(await p.evaluate(() => KitFacil.campo.dinheiro.ler(document.getElementById('v').value)), 1234);
  assert.match(await p.inputValue('#pc'), /^10,00%$/);
  await p.click('#pc'); await p.keyboard.type('1250');
  assert.equal(await p.inputValue('#pc'), '12,50%', 'o primeiro número substitui o valor sugerido');
  assert.equal(await p.evaluate(() => KitFacil.campo.porcento.ler(document.getElementById('pc').value)), 12.5);
  // quantidade: − começa desligado no mínimo; + avisa o app e para no máximo
  assert.equal(await p.locator('[data-kf-passo="-1"]').isDisabled(), true);
  for (let i = 0; i < 3; i++) await p.click('[data-kf-passo="1"]', { force: true });
  assert.equal(await p.inputValue('#q'), '3'); assert.deepEqual(await p.evaluate(() => QT), ['2', '3']);
  assert.equal(await p.locator('[data-kf-passo="1"]').isDisabled(), true);
  const alvo = await p.evaluate(() => [...document.querySelectorAll('.kf-quantidade button')].map(b => Math.round(b.getBoundingClientRect().height)));
  assert.ok(alvo.every(h => h >= 44), 'botões de − e + com 44 px: ' + alvo);
  assert.equal(await p.getAttribute('#ch', 'role'), 'switch');
  await p.click('#lc'); assert.equal(await p.isChecked('#ch'), false);
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.kf-escolha')].map(b => b.getAttribute('aria-pressed'))), ['true', 'false']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · campo com sugestões: filtra ao digitar, abre abaixo da linha com o botão, escolhe com toque ou teclado', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => {
    KitFacil.dialogo.abrir({ titulo: 'Pessoas', corpo: '<div class="kf-linha"><div style="flex:1"><label class="kf-rotulo" for="nm">Nome</label><input id="nm" class="kf-entrada"></div><button class="kf-btn kf-pri" id="ad">Adicionar</button></div><p id="esc"></p>' });
    window.ES = []; KitFacil.sugestoes(document.getElementById('nm'), () => [{ label: 'Ana Paula', right: '3 vezes' }, { label: 'Ângela' }, { label: 'Bruno' }], x => ES.push(x.label));
  });
  await p.click('#nm');
  await p.waitForFunction(() => !document.querySelector('.kf-sg-lista').hidden);
  assert.deepEqual(await animacoes(p, '.kf-sg-lista').then(x => x.map(y => y[0])), [600], 'a lista abre em 600 ms');
  await p.keyboard.type('an');
  assert.deepEqual(await p.locator('.kf-sg-item span').allTextContents(), ['Ana Paula', 'Ângela'], 'filtra sem acento e sem maiúscula');
  const al = await p.evaluate(() => { const r = q => document.querySelector(q).getBoundingClientRect(), i = r('#nm'), b = r('#ad'), l = r('.kf-sg-lista'); return { base: Math.abs(i.bottom - b.bottom), abaixo: l.top >= b.bottom - 1, larga: l.width > i.width }; });
  assert.ok(al.base <= 1 && al.abaixo && al.larga, 'a lista abre abaixo da linha inteira: ' + JSON.stringify(al));
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
  assert.equal(await p.inputValue('#nm'), 'Ana Paula'); assert.deepEqual(await p.evaluate(() => ES), ['Ana Paula']);
  await p.fill('#nm', ''); await p.keyboard.type('b');
  await p.locator('.kf-sg-item').first().click();
  assert.deepEqual(await p.evaluate(() => ES), ['Ana Paula', 'Bruno']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · Pix de cobrança: valor no código, chave do jeito do Banco Central, janela com QR code e copia e cola', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  const r = await p.evaluate(() => ({ cod: KitFacil.pix.codigo({ chave: KitFacil.pix.chave('ana@Exemplo.com'), nome: 'Ana Ávila', cidade: 'Brasil', valor: 4250 }),
    cpf: KitFacil.pix.chave('529.982.247-25'), tel: KitFacil.pix.chave('(11) 98888-7777'), cnpj: KitFacil.pix.chave('12.345.678/0001-95') }));
  assert.ok(r.cod.includes('0115ana@exemplo.com') && r.cod.includes('540542.50') && r.cod.includes('5909ANA AVILA'), r.cod);
  const corpo = r.cod.slice(0, -4); let c = 0xFFFF;
  for (let i = 0; i < corpo.length; i++) { c ^= corpo.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; }
  assert.equal(r.cod.slice(-4), c.toString(16).toUpperCase().padStart(4, '0'));
  assert.deepEqual([r.cpf, r.tel, r.cnpj], ['52998224725', '+5511988887777', '12345678000195']);
  await p.evaluate(c => KitFacil.pix.janela({ titulo: 'Pix para Ana', sub: 'R$ 42,50', codigo: c }), r.cod);
  const d = p.locator('[data-kf-dialogo="pix"]'); await d.waitFor();
  assert.ok(await esperar(() => d.locator('[data-kf-qr]').textContent().then(t => /QR code agora/.test(t))), 'sem internet, o QR dá lugar ao aviso');
  assert.equal(await d.locator('textarea').inputValue(), r.cod);
  await p.evaluate(() => { window.__copiado = ''; navigator.clipboard.writeText = t => { window.__copiado = t; return Promise.resolve(); }; });
  await d.locator('[data-kf-pix-copiar]').click(); assert.equal(await p.evaluate(() => window.__copiado), r.cod);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · moldura: barra baixa com a ação principal no centro e Mais por último; trilho com Mais e Ajustes no pé', async () => {
  for (const viewport of [{ width: 320, height: 568 }, CELULAR, { width: 820, height: 1180 }, COMPUTADOR]) {
    const a = await aparelho(amb, { viewport, caminho: pagina() + '&apoio=1&moldura=nova' });
    const p = a.page;
    const n = await conferirNavAjustes(p);
    assert.deepEqual(n.erros, [], `largura ${viewport.width}: ${n.erros.join('; ')}`);
    assert.deepEqual((await conferirTopo(p, { presente: true })).erros, []);
    assert.ok(await semRolagemLateral(p));
    if (viewport.width < 1024) {
      assert.equal(await p.evaluate(() => document.querySelector('.kf-nav').getBoundingClientRect().height <= 64), true, 'barra de baixo baixa');
      await p.click('#kf-nav-mais');
      assert.equal(await p.getAttribute('#kf-nav-mais', 'aria-current'), 'page');
      const linhas = await p.locator('#main .kf-mais-lin b').allTextContents();
      assert.equal(linhas[linhas.length - 1], 'Ajustes', 'Ajustes por último na tela Mais');
      await p.click('#main [data-kf="ajustes"]');
      assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.kf-aj'))), 'Ajustes abre pela tela Mais');
      assert.equal(await p.getAttribute('#kf-nav-mais', 'aria-current'), 'page', 'Mais fica marcado nos Ajustes');
    } else {
      await p.click('#kf-trilho-ajustes'); assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.kf-aj'))));
    }
    assert.deepEqual(a.erros, []);
    await a.fechar();
  }
});

test('Kit 0.7.0 · trecho redesenhado com movimento: o que aparece cresce, o que some encolhe, a caixa que troca desliza', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => { const m = document.getElementById('main'); m.innerHTML = '<div id="cx"><div data-kf-morf="c"><p>um</p></div><p data-kf-exp="x">some</p></div>'; });
  await p.evaluate(() => KitFacil.movimento.redesenhar(document.getElementById('cx'), () => { document.getElementById('cx').innerHTML = '<div data-kf-morf="c"><p>um</p><p>dois</p><p>três</p></div><p data-kf-exp="y">aparece</p>'; }));
  const r = await p.evaluate(() => ({ fantasma: document.querySelectorAll('.kf-exp-fantasma').length, cresce: document.querySelector('[data-kf-exp="y"]').getAnimations().map(x => x.effect.getTiming().duration), muda: document.querySelector('[data-kf-morf="c"]').getAnimations().length }));
  assert.deepEqual(r, { fantasma: 1, cresce: [600], muda: 1 });
  assert.ok(await esperar(() => p.evaluate(() => !document.querySelector('.kf-exp-fantasma'))), 'o trecho que some sai depois do movimento');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · abertura de quatro telas: Pular em todas menos na última, Voltar, Esc, deslizar e uma vez só', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.evaluate(() => { window.FIM = []; KitFacil.abertura.abrir({ fim: 'Começar', extra: { rotulo: 'Ver um exemplo' }, telas: [1, 2, 3, 4].map(n => ({ arte: `<div>Arte ${n}</div>`, titulo: `Tela ${n}`, texto: `Texto ${n}.`, extra: n === 4 ? '<label for="ab-nome">Seu nome</label><input id="ab-nome">' : '' })), aoFechar: i => { FIM.push([i.como, i.ultima, i.el.querySelector('#ab-nome') ? i.el.querySelector('#ab-nome').value : null]); } }); });
  await p.locator('.kf-abertura').waitFor();
  assert.equal(await p.textContent('#kf-ab-t'), 'Tela 1'); assert.equal(await p.isVisible('#kf-ab-volta'), false); assert.equal(await p.isVisible('#kf-ab-pular'), true);
  assert.equal(await p.evaluate(() => document.activeElement.id), 'kf-ab-t', 'o foco vai para o título da tela');
  await p.click('#kf-ab-prox'); await p.keyboard.press('ArrowRight'); await p.click('#kf-ab-prox');
  assert.equal(await p.textContent('#kf-ab-t'), 'Tela 4');
  assert.equal(await p.isVisible('#kf-ab-pular'), false, 'a última tela não tem Pular');
  assert.equal(await p.textContent('#kf-ab-prox'), 'Começar'); assert.equal(await p.isVisible('#kf-ab-ex'), true);
  await p.fill('#ab-nome', 'Bruno'); await p.click('#kf-ab-prox');
  assert.deepEqual(await p.evaluate(() => FIM), [['fim', true, 'Bruno']]);
  assert.equal(await p.evaluate(() => [KitFacil.abertura.ativa(), KitFacil.abertura.vista(), document.body.classList.contains('kf-com-abertura')].join()), 'false,true,false');
  await p.evaluate(() => KitFacil.abertura.abrir({ telas: [{ titulo: 'A', texto: 'a' }, { titulo: 'B', texto: 'b' }], aoFechar: i => FIM.push([i.como]) }));
  await p.keyboard.press('Escape'); assert.deepEqual(await p.evaluate(() => FIM.at(-1)), ['pular']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Kit 0.7.0 · guia único: janela fixa acima da barra, cada passo de verdade, voltar, pular, Esc e os dados devolvidos', async () => {
  const a = await aparelho(amb, { caminho: pagina() + '&moldura=nova' });
  const p = a.page;
  await p.evaluate(() => {
    window.L = []; window.DADO = 'real';
    KitFacil.guia.demonstrar({
      comecar: () => { L.push('comecou'); DADO = 'demo'; },
      foto: () => DADO, restaurar: f => { DADO = f; L.push('restaurou'); },
      terminar: ({ concluiu }) => { DADO = 'real'; L.push(concluiu ? 'concluiu' : 'saiu'); },
      passos: [
        { t: 'Abra as notas', d: 'Toque em Notas na barra de baixo.', acao: async m => { await m.tocar('#kf-nav-notas'); } },
        { t: 'Escreva', d: 'O guia escreve de verdade.', acao: async m => { document.getElementById('main').insertAdjacentHTML('beforeend', '<input id="gx" aria-label="Teste">'); await m.digitar('#gx', 'Oi'); } },
        { t: 'Abra uma janela', d: 'E feche pelo X.', acao: async m => { KitFacil.dialogo.abrir({ titulo: 'Janela do guia', corpo: '<p>x</p>' }); await m.apontar('.kf-dlg h2', 300); await m.fechar(); } },
      ] });
  });
  await p.locator('#kf-gu-doca').waitFor();
  const g = await p.evaluate(() => { const d = document.querySelector('#kf-gu-doca').getBoundingClientRect(), n = document.querySelector('.kf-nav').getBoundingClientRect(); return { encosta: Math.abs(d.bottom - n.top) <= 1, est: KitFacil.guia.estado() }; });
  assert.ok(g.encosta, 'a janela do guia encosta na barra de baixo'); assert.equal(g.est.fase, 'conta'); assert.equal(g.est.n, 3);
  assert.equal(await p.evaluate(() => DADO), 'demo');
  for (let i = 0; i < 40 && await p.evaluate(() => !!KitFacil.guia.estado()); i++) { await p.evaluate(() => { const e = KitFacil.guia.estado(); if (e && e.fase === 'conta' && !e.rapido) document.querySelector('#kf-gu-pula').click(); }); await p.waitForTimeout(250); }
  assert.equal(await p.evaluate(() => !!KitFacil.guia.estado()), false, 'o guia não chegou ao fim');
  assert.deepEqual(await p.evaluate(() => [L, DADO, document.querySelectorAll('#kf-gu-doca, #kf-gu-dedo, #kf-gu-anel, .kf-dlg').length, document.body.classList.contains('kf-com-guia')]), [['comecou', 'concluiu'], 'real', 0, false]);
  assert.equal(await p.evaluate(() => [tela, document.getElementById('gx') && document.getElementById('gx').value].join()), 'notas,Oi', 'os passos aconteceram de verdade');
  // sair no meio com Esc
  await p.evaluate(() => KitFacil.guia.demonstrar({ terminar: ({ concluiu }) => L.push(concluiu ? 'concluiu' : 'saiu'), passos: [{ t: 'Um', d: 'Um passo.', acao: async m => { await m.espera(5000); } }] }));
  await p.locator('#kf-gu-doca').waitFor(); await p.keyboard.press('Escape');
  assert.deepEqual(await p.evaluate(() => L.at(-1)), 'saiu');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

/* ---------------- Kit 0.8.0 · Proposta 3 do Conta Fácil ---------------- */
test('Kit 0.8.0 · janela que fecha com lista de escolha, data e hora: a cópia tem a altura da janela e uma lista por campo', async () => {
  const a = await aparelho(amb, { caminho: pagina(), toque: true });
  const p = a.page;
  await p.evaluate(() => KitFacil.dialogo.abrir({ titulo: 'Campos', corpo: '<label for="s1">Turma</label><select id="s1"><option>A</option><option>B</option></select><label for="d1">Dia</label><input id="d1" type="date"><label for="h1">Hora</label><input id="h1" type="time">' }));
  await assentar(p);
  const r = await p.evaluate(() => new Promise(fim => {
    const d = document.querySelector('.kf-dlg'), alt = d.offsetHeight, q = [];
    d.querySelector('[data-kf-fechar]').click();
    const olhar = () => { const g = document.querySelector('#kf-saidas .kf-dlg-x'); if (!g) return fim({ alt, q }); q.push([g.offsetHeight, g.querySelectorAll('.kf-esc').length]); requestAnimationFrame(olhar); };
    Promise.resolve().then(() => requestAnimationFrame(olhar));
  }));
  assert.ok(r.q.length > 3, 'a saída foi filmada');
  assert.ok(r.q.every(x => Math.abs(x[0] - r.alt) < 1), `a cópia mantém a altura (${r.alt} → ${[...new Set(r.q.map(x => x[0]))]})`);
  assert.ok(r.q.every(x => x[1] === 3), `uma lista por campo na cópia (${[...new Set(r.q.map(x => x[1]))]})`);
  assert.deepEqual(a.erros, []); await a.fechar();
});

test('Kit 0.8.0 · botão que exclui: cheio, vermelho e com texto branco nos três temas; a confirmação que exclui também', async () => {
  const VERM = 'rgb(179, 54, 43)';
  for (const tema of ['light', 'dark']) {
    const a = await aparelho(amb, { caminho: pagina() });
    const p = a.page; await p.emulateMedia({ colorScheme: tema });
    await p.evaluate(() => KitFacil.dialogo.confirmar({ titulo: 'Excluir?', texto: 'Some daqui.', ok: 'Excluir item' }));
    await assentar(p);
    assert.deepEqual(await p.evaluate(() => { const c = getComputedStyle(document.querySelector('[data-kf-ok]')); return [c.backgroundColor, c.color]; }), [VERM, 'rgb(255, 255, 255)'], `confirmação de excluir (${tema})`);
    await p.click('[data-kf-cancelar]');
    await p.evaluate(() => { const b = document.createElement('button'); b.className = 'kf-btn kf-perigo-sec'; b.id = 'x-sec'; b.textContent = 'Restaurar padrões de fábrica'; document.body.appendChild(b); });
    assert.deepEqual(await p.evaluate(() => { const c = getComputedStyle(document.querySelector('#x-sec')); return [c.backgroundColor, c.color]; }), [VERM, 'rgb(255, 255, 255)'], `kf-perigo-sec cheio (${tema})`);
    assert.deepEqual(a.erros, []); await a.fechar();
  }
});

test('Kit 0.8.0 · relatar um problema sem descrição aponta o campo sem selecioná-lo', async () => {
  const a = await aparelho(amb, { caminho: pagina(), firestore: firestoreFalso() });
  const p = a.page;
  await p.evaluate(() => KitFacil.feedback.abrir({ tipo: 'problema' }));
  await assentar(p);
  await p.locator('.kf-dlg [data-kf-enviar]').click();
  assert.equal(await p.evaluate(() => { const f = document.activeElement; return !!(f && f.matches('input:not([type=radio]):not([type=checkbox]), textarea')); }), false, 'nenhuma caixa de texto ganhou o foco');
  assert.equal(await p.locator('.kf-dlg textarea[aria-invalid="true"]').count(), 1, 'o campo da mensagem fica apontado');
  assert.deepEqual(a.erros, []); await a.fechar();
});

test('Kit 0.8.0 · janela no celular: barrinha, puxar pelo cabeçalho fecha ou volta, e o pé se recolhe com o teclado', async () => {
  const a = await aparelho(amb, { caminho: pagina(), toque: true });
  const p = a.page;
  const abrir = async () => { await p.evaluate(() => KitFacil.dialogo.abrir({ titulo: 'Puxar', corpo: '<label for="c1">Nome</label><input id="c1">', pe: '<button type="button" class="kf-btn kf-pri">Salvar</button>' })); await assentar(p); await p.waitForTimeout(100); };
  await abrir();
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-dlg-cab'), '::before').content !== 'none'), true, 'a barrinha aparece');
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-dlg-cab')).touchAction), 'none');
  const puxar = (dy, passos, ms) => p.evaluate(async ([dy, passos, ms]) => {
    const h = document.querySelector('.kf-dlg-cab h2'), r = h.getBoundingClientRect(), x = r.left + 20, y = r.top + 5;
    const ev = (t, yy) => h.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'touch', isPrimary: true, clientX: x, clientY: yy }));
    ev('pointerdown', y); for (let i = 1; i <= passos; i++) { await new Promise(f => setTimeout(f, ms)); ev('pointermove', y + dy * i / passos); }
    ev('pointerup', y + dy);
  }, [dy, passos, ms]);
  const abertas = () => p.evaluate(() => document.querySelectorAll('.kf-ov').length - document.querySelectorAll('#kf-saidas .kf-ov').length);
  await puxar(40, 8, 60); await p.waitForTimeout(450);
  assert.equal(await abertas(), 1, 'puxão curto e lento: a janela volta');
  await puxar(300, 10, 30); await p.waitForTimeout(100);
  assert.equal(await abertas(), 0, 'puxão longo: a janela fecha');
  await p.waitForTimeout(700); await abrir();
  await p.locator('#c1').tap(); await teclado(p, true); await p.waitForTimeout(700);
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-dlg > .kf-dlg-pe')).display), 'none', 'com o teclado o pé se recolhe');
  await p.evaluate(() => document.activeElement.blur()); await teclado(p, false); await p.waitForTimeout(700);
  assert.notEqual(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-dlg > .kf-dlg-pe')).display), 'none', 'sem teclado o pé volta');
  assert.equal(await p.evaluate(() => document.querySelectorAll('.kf-sem-cursor').length), 0, 'sem foco não sobra marca de cursor');
  assert.deepEqual(a.erros, []); await a.fechar();
});
