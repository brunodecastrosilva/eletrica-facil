#!/usr/bin/env node
/* Kit Fácil · verificação do padrão do Projeto Integrador. Uso: npm run verificar
   Confere, sem precisar de internet:
   1. se a pasta comum/ é igual à dos outros apps (pelo MANIFESTO.json);
   2. se não há segredos no repositório (chaves do GitHub, chaves privadas, senhas);
   3. se a versão é a mesma no package.json, no app, no service worker e no CHANGELOG;
   4. se o service worker guarda arquivos que existem;
   5. regras de acessibilidade da página (idioma e zoom liberado) e se o Kit Fácil está carregado.
   Para atualizar o manifesto depois de mudar o kit: node comum/verificar.mjs --gerar */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative, sep, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const COMUM = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(COMUM, '..');
const COMPARTILHADOS = ['kit-facil.js', 'kit-facil.css', 'regras-firestore-feedback.txt', 'servidor.mjs', 'verificar.mjs', 'testar.mjs', 'PADRAO.md', 'LEIAME.md',
  'testes/ambiente.mjs', 'testes/kit.test.mjs', 'testes/pagina-kit.html'];

const sha = b => createHash('sha256').update(b).digest('hex');
const ler = (p, enc = 'utf8') => readFile(resolve(RAIZ, p), enc);
const existe = async p => { try { await stat(resolve(RAIZ, p)); return true; } catch { return false; } };
const falhas = [], avisos = [];
const ok = m => console.log('  ok   ' + m);
const falha = m => { falhas.push(m); console.log('  FALHA ' + m); };
const aviso = m => { avisos.push(m); console.log('  aviso ' + m); };

async function versaoKit() {
  const m = (await readFile(join(COMUM, 'kit-facil.js'), 'utf8')).match(/const VERSAO = '([^']+)'/);
  return m ? m[1] : '?';
}
async function manifesto() {
  const arquivos = {};
  for (const f of COMPARTILHADOS) arquivos[f] = sha(await readFile(join(COMUM, f)));
  return { kit: await versaoKit(), arquivos };
}

if (process.argv.includes('--gerar')) {
  const m = await manifesto();
  await writeFile(join(COMUM, 'MANIFESTO.json'), JSON.stringify(m, null, 2) + '\n');
  console.log(`MANIFESTO.json atualizado (Kit Fácil ${m.kit}). Copie a pasta comum/ inteira para os outros apps.`);
  process.exit(0);
}

console.log('Kit Fácil');
try {
  const salvo = JSON.parse(await readFile(join(COMUM, 'MANIFESTO.json'), 'utf8'));
  const agora = await manifesto();
  const dif = COMPARTILHADOS.filter(f => salvo.arquivos[f] !== agora.arquivos[f]);
  if (salvo.kit !== agora.kit) falha(`versão do kit ${agora.kit} diferente do manifesto (${salvo.kit})`);
  if (dif.length) falha(`arquivos do kit diferentes do manifesto: ${dif.join(', ')}. Copie a pasta comum/ do app de referência ou rode --gerar e copie para os outros apps.`);
  else ok(`comum/ igual ao manifesto (Kit Fácil ${agora.kit})`);
} catch (e) { falha('comum/MANIFESTO.json ausente ou inválido: ' + e.message); }

/* ---------- segredos ---------- */
console.log('Segredos');
async function arquivosDoRepo() {
  try { return execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: RAIZ, encoding: 'utf8' }).split('\n').filter(Boolean); }
  catch {
    const out = [];
    async function andar(d) { for (const e of await readdir(d, { withFileTypes: true })) { if (['.git', 'node_modules'].includes(e.name)) continue; const p = join(d, e.name); if (e.isDirectory()) await andar(p); else out.push(relative(RAIZ, p).split(sep).join('/')); } }
    await andar(RAIZ); return out;
  }
}
const PADROES = [
  [/gh[pousr]_[A-Za-z0-9]{36,}/, 'chave do GitHub'],
  [/github_pat_[A-Za-z0-9_]{40,}/, 'chave do GitHub (fine-grained)'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'chave privada'],
  [/AKIA[0-9A-Z]{16}/, 'chave da AWS'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'token do Slack'],
  [/sk-(?:ant-)?[A-Za-z0-9_-]{32,}/, 'chave de API (sk-…)'],
  [/(?:senha|password|passwd|secret)\s*[:=]\s*['"][^'"\s]{6,}['"]/i, 'senha escrita no código'],
];
/* chave web do Firebase: é pública por natureza (identifica o projeto; quem protege o banco são as regras) */
const PERMITIDOS = [/AIzaSyDKdtdRernEqoaC0BQdMW8P7KiZ-UNcEN0/];
let achados = 0;
for (const f of await arquivosDoRepo()) {
  if (/\.(png|jpe?g|gif|ico|pdf|woff2?)$/i.test(f)) continue;
  let t; try { t = await ler(f); } catch { continue; }
  for (const [re, nome] of PADROES) {
    const m = t.match(re);
    if (m && !PERMITIDOS.some(p => p.test(m[0]))) { falha(`${nome} em ${f}`); achados++; }
  }
  const fb = t.match(/AIza[0-9A-Za-z_-]{35}/g) || [];
  for (const k of fb) if (!PERMITIDOS.some(p => p.test(k))) aviso(`chave Google/Firebase desconhecida em ${f}: confirme que é pública e restrita por referenciador`);
}
if (!achados) ok('nenhum segredo encontrado nos arquivos do repositório');

/* ---------- versão ---------- */
console.log('Versão');
const pkg = JSON.parse(await ler('package.json'));
const app = pkg.name, versao = pkg.version;
const fontes = (await arquivosDoRepo()).filter(f => /\.(html|js)$/.test(f) && !f.startsWith('comum/') && !f.startsWith('tests/') && f !== 'sw.js');
let versaoApp = null;
for (const f of fontes) { const m = (await ler(f)).match(/const VERSAO = ['"](\d+\.\d+\.\d+)['"]/); if (m) { versaoApp = m[1]; break; } }
if (versaoApp === versao) ok(`app ${app} ${versao} (package.json e código)`); else falha(`versão do código (${versaoApp}) diferente do package.json (${versao})`);
const sw = await ler('sw.js').catch(() => '');
const cache = (sw.match(/const CACHE = '([^']+)'/) || [])[1];
if (cache === `${app}-${versao}`) ok(`cache do service worker ${cache}`); else falha(`cache do service worker deveria ser '${app}-${versao}' (está '${cache}')`);
const log = await ler('CHANGELOG.md').catch(() => '');
const topo = (log.match(/^## \[?(\d+\.\d+\.\d+)/m) || [])[1];
if (topo === versao) ok(`CHANGELOG começa na ${versao}`); else falha(`CHANGELOG.md deveria começar pela versão ${versao} (está ${topo || 'sem versão'})`);

/* ---------- service worker ---------- */
console.log('Service worker');
const lista = (sw.match(/const APP = \[([^\]]*)\]/) || [])[1] || '';
const guardados = [...lista.matchAll(/'([^']+)'/g)].map(m => m[1]);
let faltam = 0;
for (const g of guardados) { if (g === './') continue; if (!(await existe(g))) { falha(`sw.js guarda ${g}, que não existe`); faltam++; } }
for (const k of ['./comum/kit-facil.js', './comum/kit-facil.css']) if (!guardados.includes(k)) { falha(`sw.js não guarda ${k} (o app não abriria sem internet)`); faltam++; }
if (!faltam) ok(`${guardados.length} arquivos guardados para uso sem internet`);

/* ---------- página ---------- */
console.log('Página');
const html = await ler('index.html');
if (/<html[^>]*\blang="pt-BR"/.test(html)) ok('idioma pt-BR declarado'); else falha('<html> sem lang="pt-BR" (leitores de tela)');
const vp = (html.match(/<meta name="?viewport"?[^>]*>/) || [''])[0];
if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?![.\d])/.test(vp)) falha('o zoom está bloqueado na meta viewport (acessibilidade)'); else ok('zoom liberado');
if (/comum\/kit-facil\.js/.test(html) && /comum\/kit-facil\.css/.test(html)) ok('Kit Fácil carregado'); else falha('index.html não carrega comum/kit-facil.js e comum/kit-facil.css');
if (/rel="manifest"/.test(html)) ok('manifesto do app web'); else falha('sem manifest.webmanifest');

console.log(falhas.length ? `\n${falhas.length} falha(s).` : `\nTudo certo${avisos.length ? ` (${avisos.length} aviso(s))` : ''}.`);
process.exit(falhas.length ? 1 : 0);
