/* Kit Fácil · ambiente de testes comum aos apps (node:test + Playwright).
   Sobe o app num servidor local, abre o Chromium e responde no lugar da internet:
   - api.github.com: um GitHub de mentira, com gists guardados na memória (sincronização);
   - firestore.googleapis.com: um Firestore de mentira que aplica a mesma regra de comum/regras-firestore-feedback.txt;
   - o resto (fontes, bibliotecas de CDN) é bloqueado, como se estivesse sem internet.
   Assim os testes rodam sem rede, sem contas e sem tocar nos dados reais. */
import { servir } from '../servidor.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function carregarPlaywright() {
  const opcoes = [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/npm-tools/node_modules/playwright/index.mjs'].filter(Boolean);
  for (const o of opcoes) { try { const m = await import(o); return m.chromium ? m : m.default; } catch {} }
  throw new Error('Playwright não encontrado. Instale com: npm install && npx playwright install chromium');
}

/* sobe o servidor e o navegador uma vez por arquivo de teste */
export async function preparar() {
  const pw = await carregarPlaywright();
  const servidor = await servir(RAIZ, { porta: 0 });
  const browser = await pw.chromium.launch();
  return { ...servidor, browser, encerrar: async () => { await browser.close(); await servidor.fechar(); } };
}

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS', 'access-control-expose-headers': 'x-oauth-scopes' };

/* ---------- GitHub de mentira ---------- */
export const TOKEN_TESTE = 'ghp_' + 'T3st'.repeat(9);
export function githubFalso({ token = TOKEN_TESTE, login = 'pessoa-teste', escopos = 'gist' } = {}) {
  // atraso: milissegundos antes de responder (para ver o estado "sincronizando"); falha: status HTTP forçado (ex.: 500)
  const estado = { gists: new Map(), seq: 1, token, login, escopos, chamadas: [], fora: false, atraso: 0, falha: 0 };
  async function lidar(route) {
    const req = route.request(), u = new URL(req.url()), m = req.method();
    if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    if (estado.fora) return route.abort('internetdisconnected');
    if (estado.atraso) await new Promise(r => setTimeout(r, estado.atraso));
    if (estado.falha) return route.fulfill({ status: estado.falha, headers: CORS, contentType: 'application/json', body: '{"message":"erro"}' });
    estado.chamadas.push(`${m} ${u.pathname}`);
    const json = (status, obj, extra = {}) => route.fulfill({ status, headers: { ...CORS, ...extra }, contentType: 'application/json', body: JSON.stringify(obj) });
    if ((req.headers().authorization || '') !== 'Bearer ' + estado.token) return json(401, { message: 'Bad credentials' });
    if (u.pathname === '/user' && m === 'GET') return json(200, { login: estado.login }, { 'x-oauth-scopes': estado.escopos });
    if (u.pathname === '/gists' && m === 'GET') {
      const pg = +(u.searchParams.get('page') || 1), pp = +(u.searchParams.get('per_page') || 30);
      const todos = [...estado.gists.values()].map(g => ({ id: g.id, public: g.public, description: g.description, files: Object.fromEntries(Object.keys(g.files).map(k => [k, { filename: k }])) }));
      return json(200, todos.slice((pg - 1) * pp, pg * pp));
    }
    if (u.pathname === '/gists' && m === 'POST') {
      const b = JSON.parse(req.postData() || '{}'), id = 'gist' + estado.seq++;
      estado.gists.set(id, { id, description: b.description, public: b.public, files: Object.fromEntries(Object.entries(b.files || {}).map(([k, v]) => [k, { content: v.content }])) });
      return json(201, { id });
    }
    const mg = u.pathname.match(/^\/gists\/([\w-]+)$/);
    if (mg) {
      const g = estado.gists.get(mg[1]);
      if (!g) return json(404, { message: 'Not Found' });
      if (m === 'GET') return json(200, { id: g.id, files: Object.fromEntries(Object.entries(g.files).map(([k, v]) => [k, { filename: k, content: v.content, truncated: false }])) });
      if (m === 'PATCH') { const b = JSON.parse(req.postData() || '{}'); for (const [k, v] of Object.entries(b.files || {})) g.files[k] = { content: v.content }; return json(200, { id: g.id }); }
    }
    return json(404, { message: 'Not Found' });
  }
  return { estado, lidar, arquivo: nome => { for (const g of estado.gists.values()) if (g.files[nome]) return { gist: g, conteudo: g.files[nome].content }; return null; } };
}

/* ---------- Firestore de mentira, com a mesma regra publicada no projeto ---------- */
export function deFirestore(v) {
  if (!v || typeof v !== 'object') return v;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return { __int: Number(v.integerValue) };
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return { __ts: v.timestampValue };
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, deFirestore(x)]));
  return v;
}
/* réplica em JavaScript de comum/regras-firestore-feedback.txt: devolve o motivo da recusa ou ''.
   versao 'atual' = a regra deste kit (com categoria e gravidade); 'antiga' = a regra do Kit Fácil 1 */
export function regraFeedback(d, versao = 'atual') {
  const chaves = Object.keys(d);
  const so = ['esquema', 'app', 'versao', 'nota', 'tipo', 'mensagem', 'contato', 'tela', 'tecnico', 'enviadoEm', ...(versao === 'atual' ? ['categoria', 'gravidade'] : [])];
  const todas = ['esquema', 'app', 'versao', 'nota', 'tipo', 'mensagem', 'enviadoEm'];
  const int = x => x && typeof x === 'object' && '__int' in x;
  if (!chaves.every(k => so.includes(k))) return 'campo não permitido';
  if (!todas.every(k => chaves.includes(k))) return 'campo obrigatório faltando';
  if (!int(d.esquema) || d.esquema.__int !== 1) return 'esquema';
  if (!['conta-facil', 'eletrica-facil', 'estudo-facil'].includes(d.app)) return 'app';
  if (typeof d.versao !== 'string' || d.versao.length > 20) return 'versao';
  if (!int(d.nota) || d.nota.__int < 0 || d.nota.__int > 5) return 'nota';
  if (!['avaliacao', 'elogio', 'sugestao', 'critica', 'problema'].includes(d.tipo)) return 'tipo';
  if (typeof d.mensagem !== 'string' || d.mensagem.length > 2000) return 'mensagem';
  if (!(d.nota.__int > 0 || d.mensagem.length > 0)) return 'nota ou mensagem';
  if ('contato' in d && (typeof d.contato !== 'string' || d.contato.length > 120)) return 'contato';
  if ('tela' in d && (typeof d.tela !== 'string' || d.tela.length > 60)) return 'tela';
  if ('categoria' in d && !['funcionamento', 'erro', 'dados', 'tela', 'outro'].includes(d.categoria)) return 'categoria';
  if ('gravidade' in d && !['baixa', 'media', 'alta'].includes(d.gravidade)) return 'gravidade';
  if ('tecnico' in d && (typeof d.tecnico !== 'object' || !Object.keys(d.tecnico).every(k => ['plataforma', 'navegador', 'tela', 'janela', 'instalado', 'idioma', 'erros'].includes(k)))) return 'tecnico';
  if (!d.enviadoEm || !d.enviadoEm.__ts || isNaN(Date.parse(d.enviadoEm.__ts))) return 'enviadoEm';
  return '';
}
export function firestoreFalso({ modo = 'aceitar', regra = 'atual' } = {}) {
  // modo: 'aceitar' (regra publicada), 'recusar' (regra ainda não publicada) ou 'fora' (sem internet)
  // regra: 'atual' (Kit Fácil 2, com categoria e gravidade) ou 'antiga' (Kit Fácil 1)
  const estado = { docs: new Map(), modo, regra, chamadas: 0, recusas: [] };
  async function lidar(route) {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    if (estado.modo === 'fora') return route.abort('internetdisconnected');
    estado.chamadas++;
    const u = new URL(req.url()), id = u.searchParams.get('documentId');
    const resp = (status, obj) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(obj) });
    if (estado.modo === 'recusar') return resp(403, { error: { code: 403, status: 'PERMISSION_DENIED', message: 'Missing or insufficient permissions.' } });
    let corpo; try { corpo = JSON.parse(req.postData() || '{}'); } catch { return resp(400, { error: { code: 400 } }); }
    const dados = deFirestore({ mapValue: { fields: corpo.fields || {} } });
    const motivo = regraFeedback(dados, estado.regra);
    if (motivo) { estado.recusas.push(motivo); return resp(403, { error: { code: 403, status: 'PERMISSION_DENIED', message: motivo } }); }
    if (estado.docs.has(id)) return resp(409, { error: { code: 409, status: 'ALREADY_EXISTS' } });
    estado.docs.set(id, { caminho: u.pathname, dados });
    return resp(200, { name: `${u.pathname}/${id}`, fields: corpo.fields });
  }
  return { estado, lidar };
}

/* ---------- abrir o app num "aparelho" (contexto separado do navegador) ---------- */
const RUIDO = /Failed to load resource|net::ERR_|ERR_INTERNET_DISCONNECTED|ERR_FAILED/;
export async function aparelho(amb, { github, firestore, viewport = { width: 390, height: 844 }, caminho = '', antes } = {}) {
  const ctx = await amb.browser.newContext({ viewport, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', serviceWorkers: 'block' });
  await ctx.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') return route.continue();
    if (u.hostname === 'api.github.com' && github) return github.lidar(route);
    if (u.hostname === 'firestore.googleapis.com' && firestore) return firestore.lidar(route);
    return route.abort('internetdisconnected');
  });
  if (antes) await ctx.addInitScript(antes);
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !RUIDO.test(m.text())) erros.push('console: ' + m.text()); });
  await page.goto(amb.url + caminho);
  return { ctx, page, erros, fechar: () => ctx.close() };
}

/* nenhum elemento passa da largura da tela (sem rolagem lateral) */
export async function semRolagemLateral(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

/* ---------- conferências do padrão de interface, usadas pelos testes de cada app ---------- */
/* área superior direita (Kit Fácil 2.1.3): nuvem · chopp · balão. Ajustes não fica mais no topo, e sim na navegação.
   o.chopp: true = o chopp tem de aparecer; false = não pode aparecer (telas internas); undefined = tanto faz.
   (o antigo { comAjustes: false } vale como tela interna: sem chopp) */
export async function conferirTopo(page, o = {}) {
  const chopp = o.chopp !== undefined ? o.chopp : o.comAjustes === false ? false : undefined;
  return page.evaluate(chopp => {
    const vis = el => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
    const um = sel => [...document.querySelectorAll(sel)].filter(vis);
    const nuvens = um('[data-kf-nuvem]'), baloes = um('[data-kf="feedback"].kf-topo-btn'), choppes = um('.kf-topo [data-kf="apoio"]'), noTopo = um('.kf-topo [data-kf="ajustes"]');
    const erros = [];
    if (nuvens.length !== 1) erros.push(`nuvens visíveis: ${nuvens.length}`);
    if (baloes.length !== 1) erros.push(`balões visíveis: ${baloes.length}`);
    if (noTopo.length) erros.push('Ajustes ainda aparece no topo (deve ficar na navegação)');
    if (chopp === true && choppes.length !== 1) erros.push(`chopp visível: ${choppes.length}`);
    if (chopp === false && choppes.length) erros.push('chopp aparece numa tela interna');
    if (erros.length) return { erros };
    const r = el => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, d: b.right }; };
    const n = r(nuvens[0]), b = r(baloes[0]), c = choppes[0] ? r(choppes[0]) : null;
    const vw = document.documentElement.clientWidth;
    if (!(n.d <= b.x + 1)) erros.push('a nuvem não está à esquerda do balão');
    if (!c && b.x - n.d > 6) erros.push(`nuvem e balão afastados (${Math.round(b.x - n.d)} px)`);
    if (Math.abs(n.y - b.y) > 1) erros.push('nuvem e balão desalinhados');
    if (n.w !== 44 || n.h !== 44 || b.w !== 44 || b.h !== 44) erros.push(`área de toque diferente de 44 px: nuvem ${n.w}x${n.h}, balão ${b.w}x${b.h}`);
    if (vw - b.d > 24) erros.push(`balão longe da borda direita (${Math.round(vw - b.d)} px)`);
    if (n.y > 80) erros.push(`ícones abaixo do topo (${Math.round(n.y)} px)`);
    if (c) {
      if (!(n.d <= c.x + 1 && c.d <= b.x + 1)) erros.push('o chopp não está entre a nuvem e o balão');
      if (c.x - n.d > 6 || b.x - c.d > 6) erros.push('chopp afastado da nuvem ou do balão');
      const cor = el => getComputedStyle(el).color;
      if (cor(choppes[0]) !== cor(nuvens[0]) || cor(choppes[0]) !== cor(baloes[0])) erros.push('o chopp não tem a mesma cor dos outros ícones do topo');
      if (c.w !== 44 || c.h !== 44) erros.push(`área de toque do chopp diferente de 44 px: ${c.w}x${c.h}`);
      if (choppes[0].getAttribute('aria-label') !== 'Pague um chopp para o criador') erros.push('chopp sem descrição acessível');
    }
    // telas principais: a barra de cima tem só a marca (ícone e nome visível) e a área superior; nada de ícones a mais
    if (chopp !== false) {
      const barra = nuvens[0].closest('.kf-barra-in');
      if (barra) {
        const extras = [...barra.querySelectorAll('button, a')].filter(el => vis(el) && !el.closest('.kf-topo'));
        if (extras.length) erros.push(`ícones a mais na barra de cima: ${extras.map(e => e.getAttribute('aria-label') || e.textContent.trim()).join(', ')}`);
        const nome = barra.querySelector('.kf-marca-nome');
        if (!nome || nome.getBoundingClientRect().width < 20 || getComputedStyle(nome).clip !== 'auto' && getComputedStyle(nome).position === 'absolute') erros.push('o nome do app não aparece na barra de cima');
      }
    }
    const estado = nuvens[0].dataset.estado, rotulo = nuvens[0].getAttribute('aria-label');
    if (!rotulo || !rotulo.startsWith('Sincronização:')) erros.push('nuvem sem descrição acessível');
    if (baloes[0].getAttribute('aria-label') !== 'Avaliação e feedback') erros.push('balão sem descrição acessível');
    return { erros, estado, nuvem: n, balao: b, chopp: c };
  }, chopp);
}
/* barra de baixo (Kit Fácil 2.2): no máximo 5 posições e nenhum nome cortado. Com até 5 itens, Ajustes é o último;
   com mais, o 5º item é "Mais" e Ajustes é o último lá dentro. No computador (trilho), Ajustes é o último item. */
export async function conferirNavAjustes(page) {
  return page.evaluate(() => {
    const vis = el => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
    const largo = window.innerWidth >= 1024;
    const cont = document.querySelector(largo ? '.kf-trilho' : '.kf-nav');
    const erros = [];
    if (!vis(cont)) return { erros: [`${largo ? 'trilho' : 'barra de baixo'} não está visível`] };
    const todos = [...cont.querySelectorAll(largo ? '.kf-trilho-it' : '.kf-nav-it')];
    const itens = todos.filter(vis);
    const aj = todos.filter(b => b.dataset.kf === 'ajustes');
    if (aj.length !== 1) return { erros: [`itens Ajustes: ${aj.length}`] };
    if (largo) {
      if (itens[itens.length - 1] !== aj[0]) erros.push('Ajustes não é o último item do trilho');
      return { erros, onde: 'trilho' };
    }
    if (itens.length > 5) erros.push(`barra de baixo com ${itens.length} itens (máximo 5)`);
    itens.forEach(b => { const l = b.querySelector('.kf-nav-l'); if (l && l.scrollWidth > l.clientWidth + 1) erros.push(`nome cortado: ${l.textContent.trim()}`); if (b.getBoundingClientRect().height < 44) erros.push(`item com menos de 44 px: ${l && l.textContent.trim()}`); });
    const mais = itens.find(b => b.hasAttribute('data-kf-nav-mais'));
    if (mais) {
      if (itens[itens.length - 1] !== mais) erros.push('"Mais" não é o último item da barra');
      if (vis(aj[0])) erros.push('com "Mais", Ajustes deveria estar dentro dele');
      const ocultos = todos.filter(b => b.classList.contains('kf-nav-oculto'));
      if (ocultos[ocultos.length - 1] !== aj[0]) erros.push('Ajustes não é o último item do "Mais"');
    } else if (itens[itens.length - 1] !== aj[0]) erros.push('Ajustes não é o último item da barra de baixo');
    return { erros, onde: mais ? 'mais' : 'barra de baixo' };
  });
}
/* abre os Ajustes pela navegação: item visível (barra ou trilho) ou, se estiver no "Mais", pelo "Mais" */
export async function abrirAjustesPelaNav(page) {
  const direto = page.locator('.kf-nav [data-kf="ajustes"], .kf-trilho [data-kf="ajustes"]').locator('visible=true');
  if (await direto.count()) return direto.first().click();
  await page.locator('.kf-nav [data-kf-nav-mais]').locator('visible=true').first().click();
  await page.locator('[data-kf-dialogo="mais"] .kf-aj-item', { hasText: 'Ajustes' }).click();
}
/* vai para uma seção da barra de baixo pelo nome, passando pelo "Mais" se ela estiver lá */
export async function irPelaNav(page, nome) {
  const item = page.locator('.kf-nav .kf-nav-it', { hasText: nome }).locator('visible=true');
  if (await item.count()) return item.first().click();
  await page.locator('.kf-nav [data-kf-nav-mais]').locator('visible=true').first().click();
  await page.locator('[data-kf-dialogo="mais"] .kf-aj-item', { hasText: nome }).click();
}
/* nomes das guias da tela de Ajustes, na ordem em que aparecem */
export async function guiasAjustes(page) {
  return page.evaluate(() => ({
    comuns: [...document.querySelectorAll('.kf-aj-lista ul:first-of-type .kf-aj-tx b')].map(b => b.textContent),
    produto: [...document.querySelectorAll('.kf-aj-lista ul:nth-of-type(2) .kf-aj-tx b')].map(b => b.textContent),
  }));
}
export const GUIAS_COMUNS = ['Conta e perfil', 'Sincronização e armazenamento', 'Aparência', 'Preferências gerais', 'Notificações', 'Privacidade e segurança', 'Avaliação e feedback', 'Sobre o aplicativo'];
