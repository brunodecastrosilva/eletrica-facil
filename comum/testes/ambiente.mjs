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
  const estado = { gists: new Map(), seq: 1, token, login, escopos, chamadas: [], fora: false };
  async function lidar(route) {
    const req = route.request(), u = new URL(req.url()), m = req.method();
    if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    if (estado.fora) return route.abort('internetdisconnected');
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
/* réplica em JavaScript de comum/regras-firestore-feedback.txt: devolve o motivo da recusa ou '' */
export function regraFeedback(d) {
  const chaves = Object.keys(d);
  const so = ['esquema', 'app', 'versao', 'nota', 'tipo', 'mensagem', 'contato', 'tela', 'tecnico', 'enviadoEm'];
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
  if ('tecnico' in d && (typeof d.tecnico !== 'object' || !Object.keys(d.tecnico).every(k => ['plataforma', 'navegador', 'tela', 'janela', 'instalado', 'idioma', 'erros'].includes(k)))) return 'tecnico';
  if (!d.enviadoEm || !d.enviadoEm.__ts || isNaN(Date.parse(d.enviadoEm.__ts))) return 'enviadoEm';
  return '';
}
export function firestoreFalso({ modo = 'aceitar' } = {}) {
  // modo: 'aceitar' (regra publicada), 'recusar' (regra ainda não publicada) ou 'fora' (sem internet)
  const estado = { docs: new Map(), modo, chamadas: 0, recusas: [] };
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
    const motivo = regraFeedback(dados);
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
