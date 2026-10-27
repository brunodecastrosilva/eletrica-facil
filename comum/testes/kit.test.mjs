/* Kit Fácil · testes automáticos dos componentes comuns (rodam em todos os apps com `npm test`).
   Usam a página comum/testes/pagina-kit.html, um GitHub e um Firestore de mentira (veja ambiente.mjs). */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { preparar, aparelho, githubFalso, firestoreFalso, TOKEN_TESTE } from './ambiente.mjs';

let amb;
before(async () => { amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const pagina = () => `comum/testes/pagina-kit.html?app=${amb.app}`;
const esperar = async (cond, ms = 8000, passo = 50) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, passo)); } return false; };

test('feedback: confere os campos, envia no formato da regra e agradece', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.click('#ajuda [data-kf="avaliar"]');
  const dlg = p.locator('.kf-dlg[role="dialog"]');
  await dlg.waitFor();
  assert.equal(await dlg.getAttribute('aria-modal'), 'true');
  assert.match(await dlg.locator('h2').textContent(), /^Avaliar o /);
  await p.click('[data-kf-enviar]');
  assert.match(await p.textContent('[data-kf-erro]'), /nota ou escreva/);
  await p.click('label[for="kf-n4"]');
  assert.match(await p.textContent('[data-kf-nota-txt]'), /4 de 5: Bom/);
  await p.click('.kf-opcao:has-text("Sugestão")');
  await p.click('[data-kf-enviar]');
  assert.match(await p.textContent('[data-kf-erro]'), /mensagem/);
  await p.fill('#kf-msg', 'Poderia ter um modo para tablet na horizontal.');
  assert.equal(await p.textContent('[data-kf-cont]'), `${'Poderia ter um modo para tablet na horizontal.'.length} de 2000 caracteres`);
  await p.fill('#kf-contato', 'pessoa@exemplo.com');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  assert.equal(fs.estado.recusas.length, 0, 'a regra do Firestore recusou: ' + fs.estado.recusas.join(', '));
  assert.equal(fs.estado.docs.size, 1);
  const [doc] = [...fs.estado.docs.values()];
  assert.match(doc.caminho, /\/projects\/[^/]+\/databases\/\(default\)\/documents\/feedback$/);
  const d = doc.dados;
  assert.equal(d.app, amb.app);
  assert.equal(d.esquema.__int, 1);
  assert.equal(d.nota.__int, 4);
  assert.equal(d.tipo, 'sugestao');
  assert.equal(d.mensagem, 'Poderia ter um modo para tablet na horizontal.');
  assert.equal(d.contato, 'pessoa@exemplo.com');
  assert.equal(d.tela, 'teste');
  assert.equal(d.versao, '0.0.0-teste');
  assert.ok(d.tecnico && d.tecnico.navegador && d.tecnico.janela === '390x844');
  assert.equal(await p.evaluate(() => KitFacil.feedback.pendentes()), 0);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('feedback: só a nota já vale, e sem informações técnicas se a pessoa desmarcar', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.click('#ajuda [data-kf="avaliar"]');
  await p.click('label[for="kf-n5"]');
  await p.uncheck('#kf-tec');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  const [doc] = [...fs.estado.docs.values()];
  assert.equal(doc.dados.tipo, 'avaliacao');
  assert.equal(doc.dados.nota.__int, 5);
  assert.equal(doc.dados.mensagem, '');
  assert.equal('tecnico' in doc.dados, false);
  assert.equal('contato' in doc.dados, false);
  await a.fechar();
});

test('feedback: sem internet a mensagem fica guardada e sai sozinha quando a conexão volta', async () => {
  const fs = firestoreFalso({ modo: 'fora' });
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.click('#ajuda [data-kf="problema"]');
  assert.equal(await p.locator('.kf-dlg h2').textContent(), 'Relatar um problema');
  assert.equal(await p.isChecked('input[name="kf-tipo"][value="problema"]'), true);
  await p.fill('#kf-msg', 'O botão de salvar não respondeu.');
  await a.ctx.setOffline(true);
  await p.click('[data-kf-enviar]');
  await p.locator('text=Você está sem internet').waitFor();
  assert.equal(await p.evaluate(() => KitFacil.feedback.pendentes()), 1);
  assert.match(await p.textContent('#ajuda'), /1 mensagem guardada/);
  fs.estado.modo = 'aceitar';
  await a.ctx.setOffline(false);
  assert.ok(await esperar(() => fs.estado.docs.size === 1), 'a mensagem guardada não foi reenviada');
  assert.ok(await esperar(async () => (await p.evaluate(() => KitFacil.feedback.pendentes())) === 0));
  const [doc] = [...fs.estado.docs.values()];
  assert.equal(doc.dados.tipo, 'problema');
  await a.fechar();
});

test('feedback: enquanto a regra não estiver publicada (403), nada se perde e não há mensagem falsa de sucesso', async () => {
  const fs = firestoreFalso({ modo: 'recusar' });
  const a = await aparelho(amb, { firestore: fs, caminho: pagina() });
  const p = a.page;
  await p.click('#ajuda [data-kf="avaliar"]');
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

test('janela: prende o foco, fecha com Esc e devolve o foco a quem abriu', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.focus('#ajuda [data-kf="sobre"]');
  await p.keyboard.press('Enter');
  await p.locator('.kf-dlg').waitFor();
  for (let i = 0; i < 25; i++) {
    await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(() => !!document.activeElement.closest('.kf-dlg')), true, 'o foco saiu da janela');
  }
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('.kf-dlg').count(), 0);
  assert.equal(await p.evaluate(() => document.activeElement.dataset.kf), 'sobre');
  assert.equal(await p.evaluate(() => document.body.style.position), '');
  await a.fechar();
});

test('janela: todos os campos têm nome acessível', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.click('#ajuda [data-kf="avaliar"]');
  const sem = await p.evaluate(() => [...document.querySelectorAll('.kf-dlg input, .kf-dlg textarea, .kf-dlg button')]
    .filter(el => !(el.labels && el.labels.length) && !el.getAttribute('aria-label') && !el.textContent.trim()).map(el => el.outerHTML.slice(0, 80)));
  assert.deepEqual(sem, []);
  await a.fechar();
});

test('sobre: versão, privacidade e outros apps', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.click('#ajuda [data-kf="sobre"]');
  const t = await p.textContent('.kf-dlg');
  assert.match(t, /Versão 0\.0\.0-teste/);
  assert.match(t, /As notas de teste ficam guardadas neste aparelho/);
  assert.match(t, /gist secreto/);
  assert.match(t, /Firebase \(Google\)/);
  assert.match(t, /Sem anúncios/);
  const links = await p.$$eval('.kf-apps a', l => l.map(x => x.getAttribute('href')));
  assert.equal(links.length, 2);
  for (const h of links) assert.match(h, /^\/(conta|eletrica|estudo)-facil\/$/);
  await a.fechar();
});

test('tema: a escolha vale para o aparelho e fica guardada', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const p = a.page;
  await p.click('[data-kf="tema"][data-v="escuro"]');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await p.getAttribute('[data-kf="tema"][data-v="escuro"]', 'aria-pressed'), 'true');
  await p.reload();
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await p.getAttribute('meta[name="theme-color"]', 'content'), '#111111');
  await p.click('[data-kf="tema"][data-v="auto"]');
  assert.equal(await p.getAttribute('html', 'data-theme'), null);
  await a.fechar();
});

async function conectarPelaTela(p, token = TOKEN_TESTE) {
  await p.click('#sync [data-kf="sync-ativar"]');
  await p.fill('#kf-token', token);
  await p.click('[data-kf-conectar]');
}
const sincronizado = p => esperar(async () => (await p.evaluate(() => T.SY.ligada() && T.SY.estado.lastSync > 0 && T.SY.situacao() === 'ok')));

test('sincronização: dois aparelhos, dados criptografados, exclusão e a alteração mais recente vence', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh, caminho: pagina() });
  const B = await aparelho(amb, { github: gh, caminho: pagina() });
  await A.page.evaluate(() => { T.add('café'); T.add('pão'); });
  await conectarPelaTela(A.page);
  assert.ok(await sincronizado(A.page), 'o aparelho A não sincronizou');
  assert.match(await A.page.textContent('#sync'), /@pessoa-teste/);

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

  await conectarPelaTela(B.page);
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
  const irma = (await import('./ambiente.mjs')).TOKEN_TESTE;
  const outro = ['conta-facil', 'eletrica-facil', 'estudo-facil'].find(x => x !== amb.app).replace('-', '');
  const A = await aparelho(amb, { github: gh, caminho: pagina(), antes: `localStorage.setItem('${outro}.sync', JSON.stringify({ token: '${irma}', login: 'pessoa-teste' }))` });
  await A.page.click('#sync [data-kf="sync-ativar"]');
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
  await conectarPelaTela(A.page);
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

test('sincronização: sem internet avisa e tenta de novo quando a conexão volta', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh, caminho: pagina() });
  await conectarPelaTela(A.page);
  assert.ok(await sincronizado(A.page));
  gh.estado.fora = true;
  await A.ctx.setOffline(true);
  await A.page.evaluate(() => T.add('offline'));
  assert.ok(await esperar(async () => (await A.page.evaluate(() => T.SY.situacao())) === 'offline'));
  assert.match(await A.page.textContent('#sync [data-kf-sync-status]'), /Sem internet/);
  gh.estado.fora = false;
  await A.ctx.setOffline(false);
  assert.ok(await esperar(async () => (await A.page.evaluate(() => T.SY.situacao())) === 'ok'));
  await A.fechar();
});

test('cópia de segurança: envelope padrão', async () => {
  const a = await aparelho(amb, { caminho: pagina() });
  const env = await a.page.evaluate(() => KitFacil.copia.envelope({ x: 1 }, 3));
  assert.equal(env.formato, 'copia-facil');
  assert.equal(env.app, amb.app);
  assert.equal(env.esquema, 3);
  assert.deepEqual(env.dados, { x: 1 });
  assert.ok(!isNaN(Date.parse(env.em)));
  await a.fechar();
});
