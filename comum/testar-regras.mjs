#!/usr/bin/env node
/* Kit Fácil · teste das regras do Firestore no projeto de verdade (Código, Art. 44, IV; Anexo VIII).
   Uso: npm run testar-regras   (precisa de internet; Node 22 ou mais novo)

   O que faz, sem deixar nada guardado no banco:
   - avaliações: manda registros ERRADOS e confere que o banco recusa (não manda avaliação válida, porque ela ficaria
     gravada e os apps não apagam avaliações);
   - comanda ao vivo: cria uma conta anônima de teste, abre uma comanda válida, tenta as alterações proibidas, tenta
     apagar com outra conta e, no fim, apaga a comanda com a conta que criou;
   - coleções sem regra: confere que estão fechadas.
   Quando a exigência do App Check estiver ligada, o banco recusa tudo o que vem daqui (sem crachá): os testes de
   recusa continuam valendo, e os de aceite avisam que precisam rodar com o App Check em modo de depuração. */

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

async function contaAnonima() {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${CHAVE}`, { method: 'POST', headers: cab(), body: JSON.stringify({ returnSecureToken: true }) });
  const j = await r.json();
  if (!r.ok) throw new Error('conta anônima: ' + (j.error && j.error.message));
  return { token: j.idToken, uid: j.localId };
}
async function apagarConta(token) {
  await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${CHAVE}`, { method: 'POST', headers: cab(), body: JSON.stringify({ idToken: token }) }).catch(() => {});
}
const criar = (colecao, id, dados, token) => fetch(`${BASE}/${colecao}?documentId=${encodeURIComponent(id)}&key=${CHAVE}`, { method: 'POST', headers: cab(token), body: JSON.stringify({ fields: campos(dados) }) });
const alterar = (caminho, dados, token) => fetch(`${BASE}/${caminho}?key=${CHAVE}&${Object.keys(dados).map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&')}`, { method: 'PATCH', headers: cab(token), body: JSON.stringify({ fields: campos(dados) }) });
const apagar = (caminho, token) => fetch(`${BASE}/${caminho}?key=${CHAVE}`, { method: 'DELETE', headers: cab(token) });
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

async function comandaAoVivo() {
  console.log('Comanda ao vivo (mesas)');
  const dono = await contaAnonima(), outro = await contaAnonima();
  const codigo = 'teste' + Math.random().toString(36).slice(2, 9);
  const mesa = { place: 'Teste automático', people: {}, items: {}, closed: false, v: 1, hostUid: dono.uid, createdAt: Date.now(), expiraEm: new Date(Date.now() + 864e5) };
  try {
    conferir('recusa: comanda sem login', recusado(await criar('mesas', codigo + 'x', mesa)));
    conferir('recusa: comanda com campo a mais', recusado(await criar('mesas', codigo + 'y', { ...mesa, admin: true }, dono.token)));
    conferir('recusa: comanda em nome de outra conta', recusado(await criar('mesas', codigo + 'z', { ...mesa, hostUid: outro.uid }, dono.token)));
    const r = await criar('mesas', codigo, mesa, dono.token);
    if (!r.ok) { conferir('aceita: comanda válida', false, `${r.status} (com o App Check exigido, rode com o token de depuração)`); return; }
    conferir('aceita: comanda válida', true);
    conferir('aceita: ler a comanda pelo código', (await ler('mesas/' + codigo, outro.token)).ok);
    conferir('recusa: listar comandas', recusado(await ler('mesas', outro.token)));
    conferir('recusa: alterar com campo a mais', recusado(await alterar('mesas/' + codigo, { admin: true }, outro.token)));
    conferir('recusa: trocar o dono', recusado(await alterar('mesas/' + codigo, { hostUid: outro.uid }, outro.token)));
    conferir('recusa: prazo além de 31 dias', recusado(await alterar('mesas/' + codigo, { expiraEm: new Date(Date.now() + 40 * 864e5) }, outro.token)));
    conferir('aceita: alterar o lugar', (await alterar('mesas/' + codigo, { place: 'Teste automático 2' }, outro.token)).ok);
    conferir('aceita: encerrar', (await alterar('mesas/' + codigo, { closed: true }, dono.token)).ok);
    conferir('recusa: reabrir comanda encerrada', recusado(await alterar('mesas/' + codigo, { closed: false }, outro.token)));
    conferir('recusa: apagar comanda de outra conta', recusado(await apagar('mesas/' + codigo, outro.token)));
  } finally {
    const fim = await apagar('mesas/' + codigo, dono.token);
    conferir('aceita: o dono apaga a comanda', fim.ok || fim.status === 404);
    await apagarConta(dono.token); await apagarConta(outro.token);
  }
}

async function fechado() {
  console.log('Coleções sem regra');
  conferir('recusa: criar em coleção nova', recusado(await criar('qualquer', 'teste-' + Date.now(), { a: 'b' })));
}

try {
  await avaliacoes(); await comandaAoVivo(); await fechado();
} catch (e) { conferir('teste rodou até o fim', false, e.message); }
const falhas = resultados.filter(r => !r.ok).length;
console.log(falhas ? `\n${falhas} falha(s). Confira as regras no console do Firebase.` : '\nTudo certo.');
if (typeof process !== 'undefined') process.exitCode = falhas ? 1 : 0;
export { resultados };
