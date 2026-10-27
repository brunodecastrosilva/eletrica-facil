#!/usr/bin/env node
/* Kit Fácil · roda os testes do kit (comum/testes) e do app (tests/) com o executor de testes do Node.
   Uso: npm test   (ou: node comum/testar.mjs [filtro], por exemplo: node comum/testar.mjs sincroniza) */
import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arquivos = [];
for (const pasta of ['comum/testes', 'tests']) {
  try { for (const f of (await readdir(join(RAIZ, pasta))).sort()) if (f.endsWith('.test.mjs')) arquivos.push(join(pasta, f)); } catch {}
}
if (!arquivos.length) { console.log('Nenhum teste encontrado.'); process.exit(0); }
const filtro = process.argv[2];
// --test-force-exit: encerra mesmo se o navegador ou o servidor de algum arquivo ficar aberto (por exemplo, com filtro)
const args = ['--test', '--test-concurrency=1', '--test-force-exit', ...(filtro ? ['--test-name-pattern', filtro] : []), ...arquivos];
const p = spawn(process.execPath, args, { cwd: RAIZ, stdio: 'inherit' });
p.on('exit', code => process.exit(code ?? 1));
