/* Elétrica Fácil · a gracinha do app: de vez em quando, um raio rasga a tela. Não há tempestade.
   É só enfeite: fica por cima de tudo, não recebe toque, não interrompe nada e some em pouco mais de um segundo.
   O desenho (aprovado em 18/11/2026): um canal tortuoso, com ramificações que afinam e enfraquecem até a ponta; amarelado,
   sem contorno, com um degradê de brilho feito de sete camadas da mesma cor quente, cada uma mais larga, mais desfocada
   e mais fraca que a anterior. O raio desce em degraus (0,15 s), dá dois clarões e apaga.
   Cuidados (Código, Art. 16, e WCAG 2.3.1): no máximo dois clarões por raio; quem pede movimento reduzido não vê raio
   nenhum; não cai com alguém digitando, com janela aberta, no guia nem na apresentação; e dá para desligar em
   Ajustes → Raio e apresentação.
   Versão 4: o desenho é o mesmo. O que mudou é a hora: o raio cai sozinho, de tempos em tempos, com ou sem toque na tela
   (antes ele só era sorteado numa troca de tela). O primeiro vem entre 20 e 70 segundos depois de abrir o app; os
   seguintes, a cada 1,5 a 4 minutos, ao acaso.
   Tudo fica em Raio: cair({ x, forcar }), comecar() (o app chama uma vez, ao abrir), ligado(), ligar(sim). */
'use strict';
const Raio = (() => {
  const NS = 'http://www.w3.org/2000/svg', FIM = 1150;
  const sorte = (a, b) => a + Math.random() * (b - a);
  let caindo = false;
  const ligado = () => ajustes.raio !== false;
  function ligar(sim) { ajustes.raio = !!sim; salvarAjustes(); }
  const podeAgora = () => !KitFacil.movimento.reduzido() && !document.hidden;
  // caminho quebrado: corta ao meio e desvia para o lado, várias vezes (o desvio cai pela metade a cada vez)
  function quebrado(a, b, desvio, vezes) {
    let P = [a, b];
    for (let v = 0; v < vezes; v++) {
      const Q = [P[0]];
      for (let i = 1; i < P.length; i++) { const p = P[i - 1], q = P[i], dx = q[0] - p[0], dy = q[1] - p[1], m = Math.hypot(dx, dy) || 1, k = sorte(-desvio, desvio); Q.push([(p[0] + q[0]) / 2 - dy / m * k, (p[1] + q[1]) / 2 + dx / m * k], q); }
      P = Q; desvio *= 0.54;
    }
    return P;
  }
  const n1 = v => Math.round(v * 10) / 10;
  const linhaD = P => P.map((p, i) => (i ? 'L' : 'M') + n1(p[0]) + ' ' + n1(p[1])).join('');
  // fita: o caminho com largura que muda ao longo dele (de l0 a l1), para o raio afinar de verdade
  function fitaD(P, l0, l1) {
    const E = [], D = [], n = P.length;
    for (let i = 0; i < n; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1, w = (l0 + (l1 - l0) * (i / (n - 1))) / 2;
      E.push([P[i][0] - dy / m * w, P[i][1] + dx / m * w]); D.push([P[i][0] + dy / m * w, P[i][1] - dx / m * w]);
    }
    return linhaD(E) + D.reverse().map(p => 'L' + n1(p[0]) + ' ' + n1(p[1])).join('') + 'Z';
  }
  // o brilho: k = largura em relação ao canal; b = desfoque (px); o = força; c = cor. Somadas, as camadas dão um degradê
  // contínuo, forte colado ao canal e cada vez mais fraco ao se afastar (sem contorno)
  const CAMADAS = [{ k: 34, b: 46, o: 0.17, c: '#FF9800' }, { k: 17, b: 22, o: 0.26, c: '#FFA800' }, { k: 8.5, b: 10, o: 0.4, c: '#FFBA00' },
    { k: 4.2, b: 4.4, o: 0.6, c: '#FFCC1F' }, { k: 2.2, b: 1.7, o: 0.85, c: '#FFE066' }, { k: 1.25, b: 0.5, o: 1, c: '#FFF3B8' }, { k: 0.62, b: 0, o: 1, c: '#FFFEF4' }];
  const PED = [1, 0.74, 0.5, 0.28]; // um galho em pedaços, cada um mais fraco que o anterior
  // o tempo do raio (ms): [instante, valor]
  const TEMPO = {
    guiaV: [[0, 0.8], [150, 0.8], [165, 0], [FIM, 0]],
    tronco: [[0, 0], [150, 0], [158, 1], [215, 1], [245, 0.3], [285, 0.85], [320, 0.6], [600, 0.24], [FIM, 0]],
    galhos: [[0, 0], [150, 0], [158, 0.9], [215, 0.75], [245, 0.12], [285, 0.3], [430, 0], [FIM, 0]],
    clarao: [[0, 0], [150, 0], [158, 1], [215, 0.9], [245, 0.15], [285, 0.5], [320, 0.3], [620, 0], [FIM, 0]],
    veu: [[0, 0], [130, 0.9], [158, 0.15], [245, 0.55], [285, 0.28], [400, 0.55], [850, 0], [FIM, 0]],
  };
  const quadros = tab => tab.map(([t, v]) => ({ offset: t / FIM, opacity: v }));
  const anima = (el, tab) => el.animate(quadros(tab), { duration: FIM, fill: 'both', easing: 'linear' });
  function cena() {
    let c = document.getElementById('raio-cena');
    if (!c) { c = document.createElement('div'); c.id = 'raio-cena'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c); }
    return c;
  }
  const svgDe = (W, H, cls) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${W} ${H}`); s.setAttribute('class', cls); return s; };
  const caminho = (svg, d, attrs = {}) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); for (const k in attrs) p.setAttribute(k, attrs[k]); svg.appendChild(p); return p; };
  // um raio, do alto ao pé da tela, com ramificações; devolve quando some
  function cair({ x = null, forcar = false } = {}) {
    if (KitFacil.movimento.reduzido() || caindo) return Promise.resolve(false);
    if (!forcar && !podeAgora()) return Promise.resolve(false);
    const W = innerWidth, H = innerHeight, e = H / 844, c = cena();
    const x0 = x == null ? sorte(W * 0.25, W * 0.75) : x, x1 = Math.max(W * 0.1, Math.min(W * 0.9, x0 + sorte(-0.3, 0.3) * Math.min(W, 420 * e)));
    const tronco = quebrado([x0, -24], [x1, H + 24], 64 * e, 7), galhos = [];
    for (let g = 0, n = 6 + Math.floor(Math.random() * 3); g < n; g++) {
      const t = sorte(0.06, 0.78), a = tronco[Math.floor(t * (tronco.length - 1))], lado = Math.random() < 0.5 ? -1 : 1;
      const ang = sorte(18, 56) * Math.PI / 180, comp = H * sorte(0.13, 0.33) * (1 - t * 0.45);
      const G = quebrado(a, [a[0] + lado * Math.sin(ang) * comp, a[1] + Math.cos(ang) * comp], comp * 0.17, 5), l = 2.3 * e * (1 - t * 0.35);
      galhos.push([G, l, 0.25 * e]);
      if (Math.random() < 0.7) { const b = G[Math.floor(sorte(0.3, 0.7) * (G.length - 1))], c2 = comp * sorte(0.32, 0.52), a2 = ang + (Math.random() < 0.5 ? -1 : 1) * sorte(0.35, 0.75); galhos.push([quebrado(b, [b[0] + lado * Math.sin(a2) * c2, b[1] + Math.cos(a2) * c2], c2 * 0.18, 4), l * 0.55, 0.2 * e]); }
    }
    const raiz = document.createElement('div'); raiz.className = 'rz';
    const veu = document.createElement('div'); veu.className = 'rz-v';
    const luz = document.createElement('div'); luz.className = 'rz-f'; luz.style.setProperty('--rx', Math.round((x0 + x1) / 2 / W * 100) + '%');
    // o guia: um traço fino que desce em degraus antes do clarão
    const guia = svgDe(W, H, 'rz-g'); caminho(guia, linhaD(tronco) + galhos.map(g => linhaD(g[0])).join(''), { class: 'rz-l' });
    const grupo = desenha => { const g = document.createElement('div'); g.className = 'rz-c'; CAMADAS.forEach(cam => { const s = svgDe(W, H, 'rz-cm'); s.style.opacity = cam.o; s.style.fill = cam.c; if (cam.b) s.style.filter = `blur(${cam.b * e}px)`; desenha(s, cam.k); g.appendChild(s); }); return g; };
    const gGalhos = grupo((s, k) => galhos.forEach(([P, l0, l1]) => { const n = P.length - 1, m = PED.length; for (let i = 0; i < m; i++) { const a = Math.floor(n * i / m), b = Math.floor(n * (i + 1) / m), w = t => (l0 + (l1 - l0) * t) * k; caminho(s, fitaD(P.slice(a, b + 1), w(a / n), w(b / n)), { 'fill-opacity': PED[i] }); } }));
    const gTronco = grupo((s, k) => caminho(s, fitaD(tronco, 4.6 * e * k, 3 * e * k)));
    raiz.append(veu, luz, guia, gGalhos, gTronco); c.appendChild(raiz);
    anima(veu, TEMPO.veu); anima(luz, TEMPO.clarao); anima(gGalhos, TEMPO.galhos); anima(gTronco, TEMPO.tronco); anima(guia, TEMPO.guiaV);
    guia.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 150, easing: 'steps(9, end)', fill: 'both' });
    try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate([24, 50, 70]); } catch {}
    caindo = true;
    return new Promise(ok => setTimeout(() => { raiz.remove(); caindo = false; ok(true); }, FIM + 40));
  }
  // pode cair agora? Nunca com alguém digitando, com janela aberta, no guia ou na apresentação
  function livre() {
    if (!ligado() || caindo || !podeAgora()) return false;
    if (KitFacil.dialogo.aberto() || (typeof guiaAtivo === 'function' && guiaAtivo()) || (typeof aberturaAtiva === 'function' && aberturaAtiva())) return false;
    const f = document.activeElement; return !(f && f.matches && f.matches('input, textarea, select'));
  }
  // o app chama uma vez: daí em diante o raio cai sozinho, ao acaso, com ou sem toque na tela
  let rodando = false;
  function comecar({ primeiro = sorte(20000, 70000), entre = [90000, 240000] } = {}) {
    if (rodando) return; rodando = true;
    const marcar = ms => setTimeout(() => { if (livre()) cair(); marcar(sorte(entre[0], entre[1])); }, ms);
    marcar(primeiro);
  }
  return { cair, comecar, ligado, ligar };
})();
