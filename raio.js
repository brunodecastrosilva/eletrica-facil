/* Elétrica Fácil · a gracinha do app: de vez em quando, um raio rasga a tela, com força. Às vezes, uma tempestade.
   É só enfeite: fica por cima de tudo, não recebe toque, não interrompe nada e some em menos de um segundo.
   Cuidados (Código, Art. 16, e WCAG 2.3.1): cada raio dá no máximo dois clarões, e os raios de uma tempestade caem com
   mais de um segundo entre um e outro (nunca mais de três clarões por segundo); quem pede movimento reduzido não vê
   raio nenhum; não cai com alguém digitando, com janela aberta, no guia nem na apresentação; e dá para desligar em
   Ajustes → Conquistas e apresentação.
   Tudo fica em Raio: cair({ x }), tempestade(), sortear() (o app chama ao trocar de tela), ligado(), ligar(sim). */
'use strict';
const Raio = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const sorte = (a, b) => a + Math.random() * (b - a);
  let caindo = false, ultimo = 0, entrou = Date.now();
  const ligado = () => !(typeof jogo !== 'undefined' && jogo.semRaio);
  function ligar(sim) { jogo.semRaio = !sim; jogoSalvar(); }
  const podeAgora = () => !KitFacil.movimento.reduzido() && !document.hidden;
  // um caminho quebrado de (x0, y0) a (x1, y1): corta ao meio e desvia, várias vezes (o desenho de um raio de verdade)
  function quebrado(x0, y0, x1, y1, desvio, vezes) {
    let P = [[x0, y0], [x1, y1]];
    for (let v = 0; v < vezes; v++) {
      const Q = [P[0]];
      for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1, k = sorte(-desvio, desvio); Q.push([(a[0] + b[0]) / 2 - dy / m * k, (a[1] + b[1]) / 2 + dx / m * k], b); }
      P = Q; desvio *= 0.55;
    }
    return P;
  }
  const d = P => P.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
  function cena() {
    let c = document.getElementById('raio-cena');
    if (!c) { c = document.createElement('div'); c.id = 'raio-cena'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c); }
    return c;
  }
  // um raio, do alto ao pé da tela, com galhos; devolve quando some
  function cair({ x = null, forcar = false } = {}) {
    if (!forcar && !podeAgora()) return Promise.resolve(false);
    if (KitFacil.movimento.reduzido()) return Promise.resolve(false);
    const W = innerWidth, H = innerHeight, c = cena(), x0 = x == null ? sorte(W * 0.2, W * 0.8) : x, x1 = Math.max(W * 0.08, Math.min(W * 0.92, x0 + sorte(-W * 0.35, W * 0.35)));
    const tronco = quebrado(x0, -12, x1, H + 12, Math.min(W, H) * 0.16, 6);
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'raio-svg');
    const traco = (pts, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d(pts)); p.setAttribute('class', cls); svg.appendChild(p); };
    // galhos: saem do tronco, para baixo e para o lado, cada vez mais finos
    const galhos = [];
    for (let g = 0, n = 2 + Math.floor(Math.random() * 3); g < n; g++) { const k = Math.floor(sorte(tronco.length * 0.15, tronco.length * 0.75)), a = tronco[k], lado = Math.random() < 0.5 ? -1 : 1, comp = sorte(H * 0.14, H * 0.32); galhos.push(quebrado(a[0], a[1], a[0] + lado * sorte(W * 0.12, W * 0.38), a[1] + comp, comp * 0.2, 4)); }
    traco(tronco, 'raio-clarao'); galhos.forEach(g => traco(g, 'raio-clarao raio-fino'));
    traco(tronco, 'raio-borda'); galhos.forEach(g => traco(g, 'raio-borda raio-fino'));
    traco(tronco, 'raio-miolo'); galhos.forEach(g => traco(g, 'raio-miolo raio-fino'));
    const luz = document.createElement('div'); luz.className = 'raio-luz'; luz.style.setProperty('--rx', (x0 / W * 100).toFixed(1) + '%');
    c.append(luz, svg);
    document.body.classList.add('raio-treme');
    try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate([24, 50, 70]); } catch {}
    caindo = true; ultimo = Date.now();
    return new Promise(ok => setTimeout(() => { luz.remove(); svg.remove(); document.body.classList.remove('raio-treme'); caindo = false; ok(true); }, 950));
  }
  // tempestade: o céu escurece, chove, e caem três raios, com mais de um segundo entre eles
  async function tempestade({ forcar = false } = {}) {
    if (caindo || KitFacil.movimento.reduzido() || (!forcar && !podeAgora())) return false;
    const c = cena(), ceu = document.createElement('div'); ceu.className = 'raio-ceu'; ceu.innerHTML = '<i></i><i></i>';
    c.appendChild(ceu); caindo = true;
    const dorme = ms => new Promise(r => setTimeout(r, ms));
    await dorme(600);
    for (let k = 0; k < 3; k++) { await cair({ forcar: true, x: innerWidth * [0.3, 0.72, 0.5][k] + sorte(-30, 30) }); caindo = true; await dorme(sorte(260, 620)); }
    ceu.classList.add('raio-vai'); await dorme(900); ceu.remove(); caindo = false; ultimo = Date.now();
    return true;
  }
  // o app chama ao trocar de tela: de vez em quando cai um raio; mais raro, uma tempestade
  function sortear() {
    if (!ligado() || caindo || !podeAgora()) return;
    const agora = Date.now();
    if (agora - entrou < 25000 || agora - ultimo < 300000) return; // nada nos primeiros segundos, e um bom intervalo entre um e outro
    if (KitFacil.dialogo.aberto() || (typeof guiaAtivo === 'function' && guiaAtivo()) || (typeof aberturaAtiva === 'function' && aberturaAtiva())) return;
    const f = document.activeElement; if (f && f.matches && f.matches('input, textarea, select')) return;
    const r = Math.random();
    if (r < 0.015) tempestade(); else if (r < 0.075) cair();
  }
  return { cair, tempestade, sortear, ligado, ligar, _quebrado: quebrado };
})();
