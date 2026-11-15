/* Kit Fácil · peça opcional (Código 0.7, Art. 93; Anexo II): objetos em 3D que giram com o dedo (o presente do apoio
   e as tampinhas), confetes, vibração curta e níveis. Vem do Conta Fácil 1.7.0.
   Carregue logo depois de comum/kit-facil.js (o Kit também busca este arquivo sozinho quando abre a janela do apoio).
   Tudo fica em KitFacil.jogo:
     girar(raiz, { auto, inicio })  liga o giro do .kf-o3d dentro de raiz; devolve { girar, peteleco, angulo }
     tampaHTML({ id, nome, cores: [c1, c2], icone, apagada, D })  tampinha em 3D (icone: nome em KitFacil.jogo.icones)
     icones                          desenhos de traço (grade de 24) das tampinhas; o app acrescenta os seus
     confete(caixa, n), vibrar(padrao), nivel(xp, niveis) -> { i, nivel, nome, prox: { nome, falta, pct } | null }
   O presente usa as cores do app: --kf-presente (papel e tampa) e --kf-presente-fita (fita e laço).
   Os objetos são desenhados com WebGL (malha lisa, luz por pixel, brilho e reflexo); sem WebGL, num <canvas> comum,
   face por face, de trás para a frente. Quem pede movimento reduzido vê o objeto parado: ele só gira com o dedo. */
(function (global) {
  'use strict';
  const K = global.KitFacil; if (!K || !K.jogo || K.jogo.girar) return;
  const esc = K.esc, parado = () => K.movimento.reduzido();
  const icones = { estrela: '<path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>' };
  const iconeTampa = o => icones[o.dataset.ic] || icones.estrela;
  const coresTampa = o => [o.dataset.c1 || '#F2B33D', o.dataset.c2 || '#B97A0E'];
  // qualquer cor do CSS vira [r, g, b]
  const corRGB = (c, padrao) => { try { const g = document.createElement('canvas').getContext('2d'); g.fillStyle = padrao; g.fillStyle = c || padrao; const v = g.fillStyle; if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)); const m = v.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; } catch { return [0, 0, 0]; } };
  const coresPresente = o => {
    const cs = getComputedStyle(o), papel = corRGB(cs.getPropertyValue('--kf-presente').trim(), '#1D5A3B'), fita = corRGB(cs.getPropertyValue('--kf-presente-fita').trim(), '#F2B33D');
    return { papel, tampa: papel.map(v => Math.min(255, v * 1.36 + 6)), fita };
  };
  const cor2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const tom = (rgb, k) => `rgb(${rgb.map(v => Math.max(0, Math.min(255, Math.round(v * k)))).join(',')})`;
  const mistura = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  // o desenho de um ícone (trechos de SVG na grade de 24) vira caminhos de canvas
  function caminhosDoIcone(svg) {
    const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, 'image/svg+xml'), out = [];
    const n = (el, a) => parseFloat(el.getAttribute(a)) || 0;
    for (const el of doc.documentElement.children) {
      const p = new Path2D();
      if (el.tagName === 'path') p.addPath(new Path2D(el.getAttribute('d')));
      else if (el.tagName === 'circle') p.arc(n(el, 'cx'), n(el, 'cy'), n(el, 'r'), 0, Math.PI * 2);
      else if (el.tagName === 'ellipse') p.ellipse(n(el, 'cx'), n(el, 'cy'), n(el, 'rx'), n(el, 'ry'), 0, 0, Math.PI * 2);
      else if (el.tagName === 'rect') { const x = n(el, 'x'), y = n(el, 'y'), w = n(el, 'width'), h = n(el, 'height'), r = n(el, 'rx'); if (p.roundRect) p.roundRect(x, y, w, h, r); else p.rect(x, y, w, h); }
      else continue;
      out.push(p);
    }
    return out;
  }
  /* a tampinha: disco de esmalte, ombro, saia de 21 gomos e, pelo avesso, o metal com o forro */
  function cenaTampa(o) {
    const [c1, c2] = (o.dataset.apagada ? ['#C3CCC6', '#8E9A92'] : coresTampa(o)).map(cor2rgb);
    const R = +o.dataset.d / 2, T = R * 0.4, r0 = R * 0.75, r1 = R * 0.83, zt = T / 2, zo = T / 2 - T * 0.24, zb = -T / 2, N = 42;
    const METAL = [198, 205, 201], base = mistura(c1, c2, 0.3), faces = [];
    const pt = (r, a, z) => [r * Math.cos(a), r * Math.sin(a), z];
    const normal = (a, b, c) => { const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], m = Math.hypot(...n) || 1; return n.map(x => x / m); };
    for (let i = 0; i < N; i++) {
      const a0 = 2 * Math.PI * i / N, a1 = 2 * Math.PI * (i + 1) / N, rr = k => (k % 2 ? R * 0.925 : R);
      // ombro (do disco até o começo da saia) e gomo da saia (do ombro até a borda, que entra e sai)
      const ombro = [pt(r0, a0, zt), pt(r0, a1, zt), pt(r1, a1, zo), pt(r1, a0, zo)], gomo = [pt(r1, a0, zo), pt(r1, a1, zo), pt(rr(i + 1), a1, zb), pt(rr(i), a0, zb)];
      for (const [p, k] of [[ombro, 1.06], [gomo, i % 2 ? 0.94 : 1.03]]) {
        let n = normal(p[0], p[1], p[2]); const am = (a0 + a1) / 2;
        if (n[0] * Math.cos(am) + n[1] * Math.sin(am) + n[2] < 0) n = n.map(x => -x); // a normal aponta para fora
        faces.push({ p, n, fora: base.map(v => v * k), dentro: METAL.map(v => v * (k > 1 ? 1 : 0.93)) });
      }
    }
    const icone = caminhosDoIcone(iconeTampa(o)), circ = (r, z) => Array.from({ length: 40 }, (_, i) => pt(r, 2 * Math.PI * i / 40, z));
    // frente: o esmalte com o desenho. O pincel recebe o plano do disco já inclinado e desenha como se estivesse de frente.
    faces.push({ p: circ(r0, zt), n: [0, 0, 1], plano: zt, pinta: (g, luz) => {
      const gr = g.createRadialGradient(-r0 * 0.3, -r0 * 0.38, r0 * 0.05, 0, 0, r0 * 1.05); gr.addColorStop(0, tom(c1, 0.72 + 0.4 * luz)); gr.addColorStop(1, tom(c2, 0.72 + 0.4 * luz));
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r0 + 0.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = r0 * 0.035; g.beginPath(); g.arc(0, 0, r0 * 0.955, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = r0 * 0.022; g.setLineDash([r0 * 0.035, r0 * 0.07]); g.beginPath(); g.arc(0, 0, r0 * 0.8, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      const s = r0 * 1.44 / 24; g.save(); g.translate(-12 * s, -12 * s); g.scale(s, s);
      g.strokeStyle = '#FFFDF5'; g.lineWidth = 1.7; g.lineCap = g.lineJoin = 'round'; icone.forEach(c => g.stroke(c)); g.restore();
      // brilho: uma mancha clara que corre pelo esmalte conforme a tampinha vira
      const bx = -r0 * (0.25 + 0.5 * luz), br = g.createRadialGradient(bx, -r0 * 0.45, 0, bx, -r0 * 0.45, r0 * 0.8); br.addColorStop(0, `rgba(255,255,255,${(0.1 + 0.42 * luz).toFixed(3)})`); br.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = br; g.beginPath(); g.arc(0, 0, r0, 0, Math.PI * 2); g.fill();
    } });
    // avesso: o fundo de metal e o forro claro, no centro
    faces.push({ p: circ(r1 * 0.985, zo - 0.5), n: [0, 0, -1], plano: zo - 0.5, pinta: (g, luz) => {
      const ra = r1 * 0.985, k = 0.62 + 0.5 * luz;
      g.fillStyle = tom(METAL, k); g.beginPath(); g.arc(0, 0, ra + 0.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = tom(METAL, k * 0.78); g.lineWidth = ra * 0.05; g.beginPath(); g.arc(0, 0, ra * 0.86, 0, Math.PI * 2); g.stroke();
      const gr = g.createRadialGradient(-ra * 0.2, -ra * 0.25, 0, 0, 0, ra * 0.62); gr.addColorStop(0, tom([252, 252, 250], k + 0.12)); gr.addColorStop(1, tom([214, 220, 216], k + 0.12));
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, ra * 0.62, 0, Math.PI * 2); g.fill();
    } });
    return { faces, incl: -0.2, escala: 1, dy: 0 };
  }
  /* o presente: caixa, tampa, fita em cruz e laço */
  function cenaPresente(o) {
    const L = +o.dataset.d, A = L * 0.8, tl = L * 1.08, ta = L * 0.24, h = L / 2, ht = tl / 2, faces = [];
    const { papel: PAPEL, tampa: TAMPA, fita: FITA } = coresPresente(o), yb = A / 2 + ta * 0.42, y0 = yb - A, yt0 = y0 + 2, yt1 = yt0 - ta, fw = L * 0.09;
    // quatro lados de uma caixa (meia largura m, do alto y1 até a base y2), cada um com a faixa da fita no meio
    const lados = (m, y1, y2, cor, camada) => [[0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0]].forEach(n => {
      const t = [n[2], 0, -n[0]], q = (s, y, e = 0) => [n[0] * (m + e) + t[0] * s, y, n[2] * (m + e) + t[2] * s];
      faces.push({ p: [q(-m, y1), q(m, y1), q(m, y2), q(-m, y2)], n, fora: cor, camada });
      faces.push({ p: [q(-fw, y1, 0.4), q(fw, y1, 0.4), q(fw, y2, 0.4), q(-fw, y2, 0.4)], n, fora: FITA, amb: 0.8, camada: camada + 0.1 });
    });
    lados(h, y0, yb, PAPEL, 0);
    lados(ht, yt1, yt0, TAMPA, 2);
    const topo = (m, y, cor, camada) => faces.push({ p: [[-m, y, -m], [m, y, -m], [m, y, m], [-m, y, m]], n: [0, -1, 0], fora: cor, camada });
    topo(ht, yt1, TAMPA.map(v => v * 1.08), 2);
    faces.push({ p: [[-fw, yt1 - 0.4, -ht], [fw, yt1 - 0.4, -ht], [fw, yt1 - 0.4, ht], [-fw, yt1 - 0.4, ht]], n: [0, -1, 0], fora: FITA, amb: 0.8, camada: 2.1 });
    faces.push({ p: [[-ht, yt1 - 0.4, -fw], [ht, yt1 - 0.4, -fw], [ht, yt1 - 0.4, fw], [-ht, yt1 - 0.4, fw]], n: [0, -1, 0], fora: FITA, amb: 0.8, camada: 2.1 });
    // laço: quatro alças (duas em cada plano) e o nó
    const alca = (dir, lado) => { const p = []; for (let i = 0; i <= 22; i++) { const a = 2 * Math.PI * i / 22, u = lado * L * 0.27 * (1 - Math.cos(a)) * 0.9, v = -L * 0.2 * Math.sin(a) * (1 + 0.25 * Math.cos(a)) - L * 0.1 * (1 - Math.cos(a)); p.push([dir[0] * u, yt1 + v, dir[1] * u]); } return p; };
    for (const dir of [[0.92, 0.38], [-0.38, 0.92]]) for (const lado of [1, -1]) faces.push({ p: alca(dir, lado), n: [-dir[1], 0, dir[0]], fora: FITA, dentro: FITA.map(v => v * 0.86), amb: 0.82, traco: L * 0.07, camada: 3 });
    faces.push({ p: Array.from({ length: 14 }, (_, i) => [L * 0.07 * Math.cos(2 * Math.PI * i / 14), yt1 - L * 0.045 + L * 0.05 * Math.sin(2 * Math.PI * i / 14), 0]), n: [0, 0, 1], fora: FITA.map(v => v * 0.9), dentro: FITA.map(v => v * 0.9), amb: 0.9, sempre: true, camada: 4 });
    return { faces, incl: -0.42, escala: 0.9, dy: L * 0.2 };
  }
  function pintar3d(cv, cena, ang) {
    const g = cv.getContext('2d'), dpr = cv._dpr, W = cv.width / dpr, H = cv.height / dpr, cx = W / 2, cy = H / 2 + cena.dy, e = cena.escala;
    const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(cena.incl), st = Math.sin(cena.incl), LUZ = [-0.38, -0.62, 0.69];
    const gira = ([x, y, z]) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; return [x1, y * ct - z1 * st, y * st + z1 * ct]; };
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    // sombra no chão
    const sg = g.createRadialGradient(cx, H - 13, 0, cx, H - 13, W * 0.34); sg.addColorStop(0, 'rgba(6,20,13,.3)'); sg.addColorStop(1, 'rgba(6,20,13,0)');
    g.save(); g.translate(0, (H - 13) * 0.76); g.scale(1, 0.24); g.fillStyle = sg; g.beginPath(); g.arc(cx, H - 13, W * 0.34, 0, Math.PI * 2); g.fill(); g.restore();
    const vis = [];
    for (const f of cena.faces) {
      const n = gira(f.n), frente = n[2] >= 0;
      if (!frente && !f.dentro && !f.sempre) continue; // face de um lado só, de costas: não aparece
      const q = f.p.map(gira); let z = 0; for (const p of q) z += p[2];
      vis.push({ f, q, z: z / q.length, frente, luz: Math.max(0, (frente ? 1 : -1) * (n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2])) });
    }
    vis.sort((a, b) => (a.f.camada || 0) - (b.f.camada || 0) || a.z - b.z);
    for (const { f, q, frente, luz } of vis) {
      if (f.pinta) { // disco com desenho: o pincel trabalha no plano do disco
        const o = gira([0, 0, f.plano]), u = gira([1, 0, 0]), v = gira([0, 1, 0]);
        g.save(); g.transform(u[0] * e, u[1] * e, v[0] * e, v[1] * e, cx + o[0] * e, cy + o[1] * e); f.pinta(g, luz); g.restore();
        continue;
      }
      const amb = f.amb || 0.58, cor = tom(frente ? f.fora : f.dentro, amb + (1.2 - amb) * luz);
      g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(cx + p[0] * e, cy + p[1] * e) : g.moveTo(cx + p[0] * e, cy + p[1] * e))); g.closePath();
      if (f.traco) { g.strokeStyle = tom(frente ? f.fora : f.dentro, 0.62); g.lineWidth = (f.traco + 2.4) * e; g.lineJoin = 'round'; g.stroke(); g.strokeStyle = cor; g.lineWidth = f.traco * e; g.stroke(); } // alça do laço: fita com contorno
      else { g.fillStyle = cor; g.fill(); g.strokeStyle = cor; g.lineWidth = 0.7; g.stroke(); } // o traço da mesma cor fecha as frestas entre as faces
    }
  }
  /* ---------- 3D de verdade (WebGL): malha lisa, luz por pixel, brilho e reflexo; a profundidade é do próprio hardware ----------
     A tampinha e o presente são malhas geradas aqui mesmo. Se o aparelho não tiver WebGL, vale o desenho em canvas comum (acima). */
  const V3 = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], norm: a => { const m = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / m, a[1] / m, a[2] / m]; }, dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] };
  const novaMalha = () => ({ p: [], n: [], c: [], m: [], u: [], i: [] });
  // junta à malha uma grade de pontos [linha][coluna]. As normais saem das faces (lisas) ou vêm prontas; "fecha" emenda a última coluna na primeira.
  function grade(M, G, { cor, mat = [0.3, 30, 0, 0], uv = null, normais = null, fecha = false } = {}) {
    const L = G.length, K = G[0].length, base = M.p.length / 3, KK = fecha ? K : K - 1, col = j => (fecha ? j % K : j);
    const N = normais || G.map(r => r.map(() => [0, 0, 0])), tris = [];
    for (let a = 0; a < L - 1; a++) for (let b = 0; b < KK; b++) { const b2 = col(b + 1); tris.push([[a, b], [a + 1, b], [a, b2]], [[a, b2], [a + 1, b], [a + 1, b2]]); }
    for (const t of tris) {
      const [x, y, z] = t.map(([a, b]) => G[a][b]), n = V3.cross(V3.sub(y, x), V3.sub(z, x));
      if (!normais) t.forEach(([a, b]) => { N[a][b][0] += n[0]; N[a][b][1] += n[1]; N[a][b][2] += n[2]; });
      else if (V3.dot(n, N[t[0][0]][t[0][1]]) < 0) t.reverse(); // a frente do triângulo acompanha a normal dada
      M.i.push(...t.map(([a, b]) => base + a * K + b));
    }
    for (let a = 0; a < L; a++) for (let b = 0; b < K; b++) {
      M.p.push(...G[a][b]); M.n.push(...V3.norm(N[a][b]));
      M.c.push(...(typeof cor === 'function' ? cor(a, b) : cor)); M.m.push(...mat); M.u.push(...(uv ? uv(a, b) : [-1, -1]));
    }
  }
  // caixa de cantos arredondados, centrada em c, de tamanho t e raio r
  function caixaRedonda(M, c, t, r, opc, k = 4) {
    const eixo = h => { const v = []; for (let i = 0; i <= k; i++) v.push(-h + r * (1 - Math.cos(i / k * Math.PI / 2))); for (let i = k; i >= 0; i--) v.push(h - r * (1 - Math.cos(i / k * Math.PI / 2))); return v; };
    const h = [t[0] / 2, t[1] / 2, t[2] / 2], E = h.map(eixo);
    for (let f = 0; f < 6; f++) {
      const ax = f >> 1, s = f & 1 ? 1 : -1, a1 = (ax + 1) % 3, a2 = (ax + 2) % 3, G = [], Nn = [];
      for (const va of E[a1]) { const lg = [], ln = []; for (const vb of E[a2]) {
        const p = [0, 0, 0]; p[ax] = s * h[ax]; p[a1] = va; p[a2] = vb;
        const q = p.map((v, i) => Math.max(-(h[i] - r), Math.min(h[i] - r, v))), d = V3.norm(V3.sub(p, q));
        lg.push([c[0] + q[0] + d[0] * r, c[1] + q[1] + d[1] * r, c[2] + q[2] + d[2] * r]); ln.push(d);
      } G.push(lg); Nn.push(ln); }
      grade(M, G, { ...opc, normais: Nn });
    }
  }
  // fita: uma curva no espaço com largura (três pontos de largura, para a luz correr de um lado ao outro)
  function fita(M, curva, n, opc, corteV = 0) {
    const G = [];
    for (let i = 0; i <= n; i++) { const { p, w, n: nor } = curva(i / n); G.push([-1, 0, 1].map(s => [p[0] + w[0] * s + nor[0] * (1 - s * s) * 0.012, p[1] + w[1] * s + nor[1] * (1 - s * s) * 0.012, p[2] + w[2] * s + nor[2] * (1 - s * s) * 0.012])); }
    // ponta em V: o meio da última fileira recua
    if (corteV) { const u = G[n], a = G[n - 1], d = V3.norm(V3.sub(u[1], a[1])); u[1] = [u[1][0] - d[0] * corteV, u[1][1] - d[1] * corteV, u[1][2] - d[2] * corteV]; }
    grade(M, G, opc);
  }
  function malhaTampa(o) {
    const [h1, h2] = o.dataset.apagada ? ['#C9D1CC', '#98A49C'] : coresTampa(o), c1 = cor2rgb(h1).map(v => v / 255), c2 = cor2rgb(h2).map(v => v / 255);
    const M = novaMalha(), GOMOS = 21, S = GOMOS * 12, T = 0.42, r0 = 0.73, r1 = 0.845, zt = T / 2, zo = zt - 0.115, zb = -T / 2, RM = 0.945, AMP = 0.05, E = 0.022;
    const ang = j => 2 * Math.PI * j / S, anel = (r, z) => Array.from({ length: S }, (_, j) => [r * Math.cos(ang(j)), r * Math.sin(ang(j)), z]);
    const ESM = [0.55, 46, 0.1, 0], METAL = [0.8, 70, 0.55, 0], FORRO = [0.25, 20, 0.04, 0];
    // frente: o disco de esmalte leva a figura (textura)
    grade(M, [anel(0, zt), anel(r0 * 0.5, zt), anel(r0, zt)], { cor: [1, 1, 1], mat: ESM, fecha: true, uv: (a, j) => { const r = [0, 0.5, 1][a] * 0.5; return [0.5 + r * Math.cos(ang(j)), 0.5 - r * Math.sin(ang(j))]; } });
    // ombro arredondado e saia com os 21 gomos (a onda cresce do ombro até a borda)
    const perfil = (fora, d = 0) => { const G = [];
      for (let k = 0; k <= 6; k++) { const f = k / 6 * Math.PI / 2; G.push(anel(r0 + (r1 - r0) * Math.sin(f) - d, zt - (zt - zo) * (1 - Math.cos(f)) - d)); }
      for (let k = 1; k <= 9; k++) { const u = k / 9, onda = AMP * u * u * (3 - 2 * u), rb = r1 + (RM - r1) * Math.pow(u, 0.85) - d; G.push(Array.from({ length: S }, (_, j) => { const r = rb + onda * Math.cos(GOMOS * ang(j)); return [r * Math.cos(ang(j)), r * Math.sin(ang(j)), zo + (zb - zo) * u - d * 0.4]; })); }
      return G; };
    const base = c1.map((v, i) => v * 0.62 + c2[i] * 0.38);
    // nos vales dos gomos e perto da borda a tinta fica um pouco mais escura (sombra própria)
    grade(M, perfil(true), { fecha: true, mat: ESM, cor: (a, j) => { const u = Math.max(0, (a - 6) / 9), k = (1 - 0.2 * u) * (1 - 0.13 * u * (1 - Math.cos(GOMOS * ang(j))) / 2); return base.map(v => v * k); } });
    // avesso: metal, com a mesma forma por dentro, a beirada e o teto
    const dentro = perfil(false, E);
    grade(M, dentro, { fecha: true, mat: METAL, cor: (a, j) => { const u = Math.max(0, (a - 6) / 9), k = 0.74 + 0.12 * u; return [k, k * 1.02, k * 1.01]; } });
    const fora = perfil(true); grade(M, [fora[fora.length - 1], dentro[dentro.length - 1]], { fecha: true, mat: METAL, cor: [0.8, 0.82, 0.81] });
    grade(M, [anel(0, zt - E), anel(r0 - E, zt - E)], { fecha: true, mat: METAL, cor: [0.72, 0.74, 0.73] });
    // forro de plástico claro no fundo, com a borda boleada
    const zf = zt - E - 0.035, rf = r0 * 0.9;
    grade(M, [anel(0, zf), anel(rf * 0.55, zf), anel(rf * 0.93, zf), anel(rf * 0.985, zf + 0.012), anel(rf, zf + 0.034)], { fecha: true, mat: FORRO, cor: (a) => (a < 3 ? [0.95, 0.955, 0.94] : [0.86, 0.87, 0.855]) });
    // a figura da frente: esmalte, filetes e o ícone
    const tx = document.createElement('canvas'); tx.width = tx.height = 512; const g = tx.getContext('2d'), cs = v => `rgb(${v.map(x => Math.round(x * 255)).join(',')})`;
    const gr = g.createRadialGradient(256 - 70, 256 - 90, 20, 256, 256, 270); gr.addColorStop(0, cs(c1)); gr.addColorStop(1, cs(c2)); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 9; g.beginPath(); g.arc(256, 256, 241, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 5; g.setLineDash([9, 17]); g.beginPath(); g.arc(256, 256, 203, 0, 7); g.stroke(); g.setLineDash([]);
    g.save(); g.translate(256 - 12 * 15, 256 - 12 * 15); g.scale(15, 15); g.strokeStyle = '#FFFDF5'; g.lineWidth = 1.75; g.lineCap = g.lineJoin = 'round'; caminhosDoIcone(iconeTampa(o)).forEach(c => g.stroke(c)); g.restore();
    return { M, textura: tx, incl: 0.2, raio: 1.14, centro: [0, 0, 0] };
  }
  function malhaPresente(o) {
    const k = coresPresente(o), um = (c, f) => c.map(v => Math.min(1, v / 255 * f));
    const M = novaMalha(), PAPEL = um(k.papel, 0.95), TAMPA = um(k.papel, 1.22), FITA = um(k.fita, 0.98), LACO = um(k.fita, 1.02);
    const mp = [0.35, 28, 0.05, 1], mf = [0.6, 60, 0.22, 0], W = 1, A = 0.8, TL = 1.085, TA = 0.24, yb = -0.62, y0 = yb + A, yt = y0 + TA - 0.03, fw = 0.2, e = 0.012;
    caixaRedonda(M, [0, yb + A / 2, 0], [W, A, W], 0.035, { cor: PAPEL, mat: mp });
    caixaRedonda(M, [0, yt - TA / 2, 0], [TL, TA, TL], 0.04, { cor: TAMPA, mat: mp });
    // fita em cruz: duas faixas na caixa e duas na tampa, um nada mais largas que o papel
    for (const [tx, tz] of [[fw, W + 2 * e], [W + 2 * e, fw]]) caixaRedonda(M, [0, yb + A / 2, 0], [tx, A + 2 * e, tz], 0.012, { cor: FITA, mat: mf }, 2);
    for (const [tx, tz] of [[fw, TL + 2 * e], [TL + 2 * e, fw]]) caixaRedonda(M, [0, yt - TA / 2, 0], [tx, TA + 2 * e, tz], 0.012, { cor: FITA, mat: mf }, 2);
    // laço: duas alças grandes, duas menores e mais em pé, duas pontas caídas sobre a tampa e o nó
    const no = [0, yt + 0.045, 0];
    const alca = (dir, a, b, sobe, larg) => t => {
      const f = 2 * Math.PI * t, x = a * (1 - Math.cos(f)) / 2, y = b / 2 * Math.sin(f) * Math.sin(f / 2) + x * sobe, lw = larg * (0.5 + 0.5 * Math.sin(f / 2));
      const lado = [-dir[1], 0, dir[0]];
      return { p: [no[0] + dir[0] * x, no[1] + y + 0.02, no[2] + dir[1] * x], w: lado.map(v => v * lw / 2), n: [dir[0] * Math.sin(f), Math.cos(f), dir[1] * Math.sin(f)] };
    };
    const d1 = [Math.cos(0.5), Math.sin(0.5)], d2 = [-Math.sin(0.5), Math.cos(0.5)];
    for (const s of [1, -1]) {
      fita(M, alca([d1[0] * s, d1[1] * s], 0.5, 0.34, 0.36, 0.2), 28, { cor: (a, b) => LACO.map(v => v * (b === 1 ? 1 : 0.9)), mat: mf });
      fita(M, alca([d2[0] * s, d2[1] * s], 0.4, 0.3, 0.5, 0.18), 26, { cor: (a, b) => LACO.map(v => v * (b === 1 ? 0.96 : 0.86)), mat: mf });
      // ponta: sai do nó e fica deitada sobre a tampa, na diagonal, com uma onda leve; acaba antes da beirada, em V
      const dir = [(d1[0] - d2[0]) * s, (d1[1] - d2[1]) * s], dl = Math.hypot(...dir), dn = [dir[0] / dl, dir[1] / dl], lg = 0.075;
      const beira = TL / 2 / Math.max(Math.abs(dn[0]), Math.abs(dn[1])), comp = beira - lg * Math.min(Math.abs(dn[0] / dn[1]), Math.abs(dn[1] / dn[0])) - 0.07;
      fita(M, t => { const x = t * comp; return { p: [dn[0] * x, yt + 0.016 + 0.028 * Math.sin(Math.PI * t) * Math.sin(Math.PI * t) + 0.02 * t * t * t, dn[1] * x], w: [-dn[1] * lg, 0, dn[0] * lg], n: [0, 1, 0] }; }, 16, { cor: LACO.map(v => v * 0.92), mat: mf }, 0.07);
    }
    caixaRedonda(M, [no[0], no[1] + 0.02, no[2]], [0.17, 0.12, 0.17], 0.055, { cor: LACO, mat: mf });
    return { M, textura: null, incl: 0.4, raio: 1.1, centro: [0, 0.07, 0] };
  }
  const M4 = {
    mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
    persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2), o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; },
    mov(x, y, z) { const o = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); return o; },
    rx(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); },
    ry(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); },
  };
  const GL_VS = `attribute vec3 aP,aN,aC;attribute vec4 aM;attribute vec2 aU;uniform mat4 uMVP,uMV;varying vec3 vN,vV,vC,vPo,vNo;varying vec4 vM;varying vec2 vU;
  void main(){vec4 q=uMV*vec4(aP,1.);vV=q.xyz;vN=mat3(uMV)*aN;vC=aC;vM=aM;vU=aU;vPo=aP;vNo=aN;gl_Position=uMVP*vec4(aP,1.);}`;
  const GL_FS = `precision highp float;uniform sampler2D uT;varying vec3 vN,vV,vC,vPo,vNo;varying vec4 vM;varying vec2 vU;
  void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(-vV);
  vec3 base=vU.x>=0.?texture2D(uT,vU).rgb:vC;
  if(vM.w>.5){vec3 a=abs(vNo);float pl=step(.92,max(a.x,max(a.y,a.z)));vec2 q=a.x>.6?vPo.zy:(a.y>.6?vPo.xz:vPo.xy);vec2 g=fract(q*6.5+.25)-.5;float bol=1.-smoothstep(.105,.135,length(g));base=mix(base,base*1.32+.035,bol*pl);}
  vec3 L1=normalize(vec3(-.5,.74,.62)),L2=normalize(vec3(.75,.15,.55)),L3=normalize(vec3(.2,.5,-.85));
  float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.),d3=max(dot(N,L3),0.);
  vec3 amb=mix(vec3(.34,.35,.36),vec3(.58,.6,.62),N.y*.5+.5);
  vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.),vM.y)*vM.x;
  vec3 R=reflect(-V,N);float ceu=smoothstep(-.3,.9,R.y);float faixa=smoothstep(.35,.62,R.y)*(1.-smoothstep(.7,.98,R.y));
  float fr=pow(1.-max(dot(N,V),0.),3.);
  vec3 cor=base*(amb+d1*.72+d2*.2+d3*.12)+vec3(sp)+vM.z*(mix(base,vec3(1.),.55))*(ceu*.42+faixa*.7-.22)+fr*.07;
  gl_FragColor=vec4(clamp(cor,0.,1.),1.);}`;
  let GL3 = null; // { cv, gl, loc, bufs } · false quando o aparelho não tem WebGL
  function gl3() {
    if (GL3 !== null) return GL3 || null;
    try {
      const cv = document.createElement('canvas'), gl = cv.getContext('webgl', { antialias: true, alpha: true, preserveDrawingBuffer: true });
      if (!gl) { GL3 = false; return null; }
      const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, GL_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, GL_FS)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      const loc = { aP: gl.getAttribLocation(pr, 'aP'), aN: gl.getAttribLocation(pr, 'aN'), aC: gl.getAttribLocation(pr, 'aC'), aM: gl.getAttribLocation(pr, 'aM'), aU: gl.getAttribLocation(pr, 'aU'), uMVP: gl.getUniformLocation(pr, 'uMVP'), uMV: gl.getUniformLocation(pr, 'uMV'), uT: gl.getUniformLocation(pr, 'uT') };
      cv.setAttribute('aria-hidden', 'true');
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); GL3 = null; }); // se o sistema tomar o contexto, o próximo giro monta outro
      GL3 = { cv, gl, loc, n: 0, cena: null };
      return GL3;
    } catch (x) { console.warn('3d', x); GL3 = false; return null; }
  }
  // põe a malha da cena na placa de vídeo (uma cena por vez: só há um objeto 3D na tela)
  function glCena(G, cena) {
    const { gl, loc } = G, M = cena.M;
    const attr = (l, dados, n) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dados), gl.STATIC_DRAW); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); return b; };
    (G.lixo || []).forEach(b => gl.deleteBuffer(b)); if (G.tex) gl.deleteTexture(G.tex);
    G.lixo = [attr(loc.aP, M.p, 3), attr(loc.aN, M.n, 3), attr(loc.aC, M.c, 3), attr(loc.aM, M.m, 4), attr(loc.aU, M.u, 2)];
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(M.i), gl.STATIC_DRAW); G.lixo.push(ib);
    G.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, G.tex);
    if (cena.textura) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cena.textura); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      const an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, 8); }
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.uniform1i(loc.uT, 0); G.n = M.i.length; G.cena = cena;
  }
  function glPintar(G, cena, ang) {
    const { gl, loc, cv } = G;
    if (G.cena !== cena) glCena(G, cena);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    const fov = 0.5, dist = cena.raio / Math.sin(fov / 2) * 1.02, c = cena.centro;
    const mv = M4.mul(M4.mov(0, 0, -dist), M4.mul(M4.rx(cena.incl), M4.mul(M4.ry(ang), M4.mov(-c[0], -c[1], -c[2]))));
    gl.uniformMatrix4fv(loc.uMV, false, mv); gl.uniformMatrix4fv(loc.uMVP, false, M4.mul(M4.persp(fov, cv.width / cv.height, dist - cena.raio * 1.6, dist + cena.raio * 1.6), mv));
    gl.drawElements(gl.TRIANGLES, G.n, gl.UNSIGNED_SHORT, 0);
  }
  // liga o giro: arrastar na horizontal, inércia ao soltar, setas do teclado
  function girar(raiz, { auto = true, inicio = -0.5 } = {}) {
    const o = raiz.matches && raiz.matches('.kf-o3d') ? raiz : raiz.querySelector('.kf-o3d'); if (!o || o.dataset.ligado) return null;
    o.dataset.ligado = '1';
    // o desenho parado (sem 3D ainda) dá lugar ao canvas
    o.querySelectorAll('.kf-presente-mini').forEach(x => x.remove()); o.querySelectorAll('canvas').forEach(c => { c.hidden = false; });
    const tampa = o.dataset.o3d === 'tampa', quieto = parado(), G = gl3();
    let cv = o.querySelector('canvas'), cena;
    if (G) { cena = tampa ? malhaTampa(o) : malhaPresente(o); cv.replaceWith(G.cv); cv = G.cv; o.dataset.motor = 'webgl'; }
    else { cena = tampa ? cenaTampa(o) : cenaPresente(o); o.dataset.motor = 'canvas'; }
    const medir = () => { const dpr = Math.min(3, window.devicePixelRatio || 1), w = o.clientWidth, h = o.clientHeight; cv._dpr = dpr; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); };
    medir();
    const ATRITO = 0.9955; // quanto do giro sobra a cada milissegundo
    let ang = inicio, vel = 0, arr = null, raf = 0, sozinho = auto && !quieto, t0 = 0;
    let mexeu = false, ocioso = 0, rampa = 1, sentido = 1; // depois que a pessoa solta e o objeto para, ele volta a girar sozinho, devagar
    // na tampinha o giro é em torno do eixo de pé; ângulo 0 mostra a frente
    const pintar = () => { o.dataset.ang = ang.toFixed(3); if (!G) return pintar3d(cv, cena, ang); if (GL3 !== G || !cv.isConnected) return; glPintar(G, cena, ang); };
    const quadro = t => {
      raf = 0; const dt = Math.min(48, t - (t0 || t)); t0 = t;
      if (arr) return;
      if (Math.abs(vel) > 0.0004) { const f = Math.pow(ATRITO, dt); ang += vel * (1 - f) / -Math.log(ATRITO); vel *= f; if (mexeu) sentido = vel < 0 ? -1 : 1; ocioso = 0; }
      else if (sozinho) { rampa = Math.min(1, rampa + dt / 900); ang += sentido * 0.0007 * dt * rampa * (2 - rampa); }
      else if (mexeu && !quieto) { vel = 0; ocioso += dt; if (ocioso > 900) { sozinho = true; rampa = 0; } }
      else { vel = 0; pintar(); return; }
      pintar(); if (o.isConnected) raf = requestAnimationFrame(quadro);
    };
    const andar = () => { if (!raf && o.isConnected) { t0 = 0; raf = requestAnimationFrame(quadro); } };
    o.addEventListener('pointerdown', e => { if (e.button > 0) return; sozinho = false; mexeu = true; ocioso = 0; arr = { x: e.clientX, t: performance.now(), v: 0 }; vel = 0; o.classList.add('kf-pegou'); try { o.setPointerCapture(e.pointerId); } catch {} });
    o.addEventListener('pointermove', e => { if (!arr) return; const agora = performance.now(), dx = e.clientX - arr.x, dt = Math.max(1, agora - arr.t); ang += dx * 0.0115; arr.v = arr.v * 0.6 + (dx * 0.0115 / dt) * 0.4; arr.x = e.clientX; arr.t = agora; pintar(); });
    const soltar = () => { if (!arr) return; vel = quieto ? 0 : Math.max(-0.02, Math.min(0.02, arr.v)); arr = null; o.classList.remove('kf-pegou'); andar(); };
    o.addEventListener('pointerup', soltar); o.addEventListener('pointercancel', soltar);
    o.addEventListener('keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); sozinho = false; mexeu = true; ocioso = 0; sentido = e.key === 'ArrowRight' ? 1 : -1; vel = 0; ang += 0.3 * sentido; pintar(); andar(); });
    pintar(); andar();
    // dá um peteleco que faz o objeto dar `voltas` e parar de frente, um pouco de lado (no ângulo `fim`)
    const peteleco = (voltas = 2, fim = -0.4) => { sozinho = false; const total = voltas * 2 * Math.PI + fim - ang; vel = (total + 0.0004 / -Math.log(ATRITO)) * -Math.log(ATRITO); andar(); };
    return { girar: v => { sozinho = false; vel = v; andar(); }, peteleco, angulo: () => ang };
  }
  /* ---------- tampinha em 3D, confetes, vibração e níveis ---------- */
  function tampaHTML({ id = '', nome = '', cores = ['#F2B33D', '#B97A0E'], icone = 'estrela', apagada = false, D = 172 } = {}) {
    return `<div class="kf-o3d" data-o3d="tampa" data-tampa="${esc(id)}" data-c1="${esc(cores[0])}" data-c2="${esc(cores[1])}" data-ic="${esc(icone)}" ${apagada ? 'data-apagada="1"' : ''} data-d="${D}" tabindex="0" role="img" aria-label="Tampinha ${esc(nome)}. Deslize o dedo ou use as setas para girar." style="width:${D + 44}px;height:${D + 44}px"><canvas aria-hidden="true"></canvas></div>`;
  }
  function confete(caixa, n = 34, cores = ['#F2B33D', '#D9483B', '#2E8B5C', '#FFFDF5', '#2A8C99', '#A4486E']) {
    if (parado() || !caixa) return;
    let h = '';
    for (let i = 0; i < n; i++) { const tira = i % 3 === 0; h += `<i class="kf-cf ${tira ? 'kf-tira' : ''}" style="left:${(Math.random() * 100).toFixed(1)}%;background:${cores[i % cores.length]};--d:${(Math.random() * .9).toFixed(2)}s;--t:${(2.2 + Math.random() * 1.6).toFixed(2)}s;--x:${(Math.random() * 120 - 60).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg"></i>`; }
    const el = document.createElement('div'); el.className = 'kf-confete'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = h; caixa.appendChild(el);
    setTimeout(() => el.remove(), 4600);
  }
  // vibração curta, só depois de um toque (o navegador recusa antes disso)
  const vibrar = p => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch {} };
  // niveis: [{ nome, xp }] em ordem crescente de xp
  function nivel(xp, niveis) {
    let i = 0; while (i + 1 < niveis.length && xp >= niveis[i + 1].xp) i++;
    const prox = niveis[i + 1];
    return { i, nivel: i + 1, nome: niveis[i].nome, prox: prox ? { nome: prox.nome, falta: prox.xp - xp, pct: Math.round((xp - niveis[i].xp) / (prox.xp - niveis[i].xp) * 100) } : null };
  }
  Object.assign(K.jogo, { girar, tampaHTML, icones, confete, vibrar, nivel, _malhaPresente: malhaPresente });
})(window);
