#!/usr/bin/env node
/* Kit Fácil · servidor local para testar o app no navegador, sem instalar nada.
   Serve a pasta do repositório em http://localhost:8080/<app>/, o mesmo caminho do GitHub Pages
   (…github.io/<app>/), para que links e caminhos relativos funcionem igual.
   Uso: npm start   (ou: node comum/servidor.mjs [porta]) */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
};

export async function nomeDoApp(raiz) {
  try { return JSON.parse(await readFile(resolve(raiz, 'package.json'), 'utf8')).name; } catch { return 'app'; }
}

/* sobe o servidor; porta 0 escolhe uma livre */
export async function servir(raizRepo, { porta = 8080, host = '127.0.0.1' } = {}) {
  const raiz = resolve(raizRepo);
  const app = await nomeDoApp(raiz);
  const srv = createServer(async (req, res) => {
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://local').pathname); } catch { res.writeHead(400); return res.end(); }
    if (p === '/' || p === `/${app}`) { res.writeHead(302, { location: `/${app}/` }); return res.end(); }
    if (!p.startsWith(`/${app}/`)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Não encontrado'); }
    p = p.slice(app.length + 1);
    if (p.endsWith('/')) p += 'index.html';
    const arq = resolve(raiz, '.' + p);
    if (!arq.startsWith(raiz + sep)) { res.writeHead(403); return res.end(); }
    if (arq.split(sep).some(parte => parte === '.git' || parte === 'node_modules')) { res.writeHead(404); return res.end(); }
    try {
      const corpo = await readFile(arq);
      res.writeHead(200, { 'content-type': TIPOS[extname(arq).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(corpo);
    } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Não encontrado'); }
  });
  await new Promise((ok, erro) => { srv.once('error', erro); srv.listen(porta, host, ok); });
  const url = `http://${host}:${srv.address().port}/${app}/`;
  return { app, url, srv, fechar: () => new Promise(r => srv.close(() => r())) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const porta = +(process.argv[2] || process.env.PORT || 8080);
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const s = await servir(raiz, { porta, host: process.env.HOST || '127.0.0.1' });
  console.log(`${s.app} rodando em ${s.url}`);
  console.log('A sincronização e as avaliações precisam de internet. O modo offline (service worker) só funciona em https.');
}
