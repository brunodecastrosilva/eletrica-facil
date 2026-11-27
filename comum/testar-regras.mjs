#!/usr/bin/env node
/* Kit Fácil · teste das regras do Firestore no projeto de verdade (Código, Art. 44, IV; Anexo VIII).
   Uso: npm run testar-regras   (precisa de internet; Node 22 ou mais novo)

   O que faz, sem deixar nada guardado no banco:
   - avaliações: manda registros ERRADOS e confere que o banco recusa (não manda avaliação válida, porque ela ficaria
     gravada e os apps não apagam avaliações);
   - coleções sem regra: confere que estão fechadas, inclusive a antiga `mesas`, da comanda ao vivo (saiu no Código 0.13.1).
   Quando a exigência do App Check estiver ligada, o banco recusa tudo o que vem daqui (sem crachá): os testes de
   recusa continuam valendo. */

const PROJETO = 'conta-facil-2c1f9';
const CHAVE = 'AIzaSyDKdtdRernEqoaC0BQdMW8P7KiZ-UNcEN0';
const ORIGEM = 'https://brunodecastrosilva.github.io/'; // a chave só aceita pedidos deste endereço
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJETO}/databases/(default)/documents`;
const cab = (token) => ({ 'Content-Type': 'application/json', Referer: ORIGEM, ...(token ? { Authorization: 'Bearer ' + token } : {}) });

const resultados = [];
const conferir = (nome, ok, detalhe = '') => { resultados.push({ nome, ok }); console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${nome}${detalhe ? ' — ' + detalhe : ''}`); };

const v = x => typeof x === 'string' ? { stringValue: x } : typeof x === 'boolean' ? { booleanValue: x }
  : Number.isInteger(x) ? { integerValue: String(x) } : x instanceof Date ? { timestampValue: x.toISOString() }
  : Array.isArray(x) ? { arrayValue: { values: x.map(v) } } : { mapValue: { fields: campos(x) } };
const campos = o => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, v(x)]));

const criar = (colecao, id, dados, token) => fetch(`${BASE}/${colecao}?documentId=${encodeURIComponent(id)}&key=${CHAVE}`, { method: 'POST', headers: cab(token), body: JSON.stringify({ fields: campos(dados) }) });
const ler = (caminho, token) => fetch(`${BASE}/${caminho}?key=${CHAVE}`, { headers: cab(token) });

const recusado = r => r.status === 403 || r.status === 401;

async function avaliacoes() {
  console.log('Avaliações (feedback)');
  const base = { esquema: 1, app: 'conta-facil', versao: 'teste', nota: 0, tipo: 'problema', mensagem: 'teste automático', enviadoEm: new Date() };
  const casos = {
    'campo a mais': { ...base, admin: 'sim' },
    'app fora da família': { ...base, app: 'outro-app' },
    'mensagem gigante': { ...base, mensagem: 'x'.repeat(2001) },
    'informação técnica gigante': { ...base, tecnico: { erros: 'x'.repeat(501) } },
    'data no futuro': { ...base, enviadoEm: new Date(Date.now() + 3 * 864e5) },
    'sem nota e sem mensagem': { ...base, mensagem: '' },
  };
  for (const [nome, dados] of Object.entries(casos)) conferir(`recusa: ${nome}`, recusado(await criar('feedback', 'teste-' + Date.now(), dados)));
  conferir('recusa: ler avaliações', recusado(await fetch(`${BASE}/feedback?key=${CHAVE}`, { headers: cab() })));
}

async function fechado() {
  console.log('Coleções sem regra');
  conferir('recusa: criar em coleção nova', recusado(await criar('qualquer', 'teste-' + Date.now(), { a: 'b' })));
  conferir('recusa: criar comanda ao vivo (mesas)', recusado(await criar('mesas', 'teste' + Date.now(), { place: 'Teste', people: {}, items: {}, closed: false, v: 1 })));
  conferir('recusa: ler comanda ao vivo (mesas)', recusado(await ler('mesas/teste' + Date.now())));
}

try {
  await avaliacoes(); await fechado();
} catch (e) { conferir('teste rodou até o fim', false, e.message); }
const falhas = resultados.filter(r => !r.ok).length;
console.log(falhas ? `\n${falhas} falha(s). Confira as regras no console do Firebase.` : '\nTudo certo.');
if (typeof process !== 'undefined') process.exitCode = falhas ? 1 : 0;
export { resultados };
