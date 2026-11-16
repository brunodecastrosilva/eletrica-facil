/* Elétrica Fácil · a lâmpada em 3D das conquistas. Segue o caminho das tampinhas do Conta Fácil (hoje comum/kit-jogo.js):
   a malha é gerada aqui mesmo, o desenho é WebGL (malha lisa, luz por pixel, brilho e reflexo) e a lâmpada gira com o
   dedo, com inércia; parada, volta a girar sozinha, devagar. Sem WebGL, vale o desenho num <canvas> comum.
   O que é próprio da lâmpada: o vidro é transparente (desenhado depois do resto, primeiro o lado de trás), o filamento
   tem a forma do ícone da conquista e, acesa, ele brilha e enche o vidro de luz.
   Tocar sem arrastar (na lâmpada ou no fundo) faz a lâmpada piscar mais forte: um clarão só por toque.
   Quem pede movimento reduzido vê a lâmpada parada: ela só gira com o dedo ou com as setas, e não pisca.
   Tudo fica em Lampada: html({ icone, nome, acesa, D }), girar(raiz, { auto, inicio, apagada }) -> { peteleco, acender, piscar, angulo }
   e miniatura(canvas, { icone, acesa }), que desenha a mesma lâmpada, parada, para o varal.
   Peça própria do app (o motor 3D do Kit só conhece a tampinha e o presente): Proposta para o Integrador (Art. 30-A). */
'use strict';
const Lampada = (() => {
  const parado = () => KitFacil.movimento.reduzido();
  const V3 = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], norm: a => { const m = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / m, a[1] / m, a[2] / m]; } };

  /* ---------- malha ---------- */
  const novaMalha = () => ({ p: [], n: [], c: [], m: [], i: [] });
  // junta à malha uma grade de pontos [linha][coluna], com normais lisas; "fecha" emenda a última coluna na primeira.
  // mat: [força do brilho, dureza do brilho, reflexo, luz própria]
  function grade(M, G, { cor, mat = [0.3, 30, 0, 0], fecha = false } = {}) {
    const L = G.length, K = G[0].length, base = M.p.length / 3, KK = fecha ? K : K - 1, col = j => (fecha ? j % K : j);
    const N = G.map(r => r.map(() => [0, 0, 0]));
    for (let a = 0; a < L - 1; a++) for (let b = 0; b < KK; b++) {
      const b2 = col(b + 1);
      for (const t of [[[a, b], [a + 1, b], [a, b2]], [[a, b2], [a + 1, b], [a + 1, b2]]]) {
        const [x, y, z] = t.map(([i, j]) => G[i][j]), n = V3.cross(V3.sub(y, x), V3.sub(z, x));
        t.forEach(([i, j]) => { N[i][j][0] += n[0]; N[i][j][1] += n[1]; N[i][j][2] += n[2]; });
        M.i.push(...t.map(([i, j]) => base + i * K + j));
      }
    }
    for (let a = 0; a < L; a++) for (let b = 0; b < K; b++) { M.p.push(...G[a][b]); M.n.push(...V3.norm(N[a][b])); M.c.push(...(typeof cor === 'function' ? cor(a, b) : cor)); M.m.push(...mat); }
  }
  const S = 56, ang = j => 2 * Math.PI * j / S;
  // torno: um perfil [raio, altura], de baixo para cima, girado em volta do eixo de pé (o raio pode depender do ângulo)
  const torno = (M, perfil, opc) => grade(M, perfil.map(([r, y]) => Array.from({ length: S }, (_, j) => { const rr = typeof r === 'function' ? r(j) : r; return [rr * Math.cos(ang(j)), y, rr * Math.sin(ang(j))]; })), { ...opc, fecha: true });
  // tubo: um fio com espessura, ao longo de uma linha de pontos
  function tubo(M, pts, r, opc, lados = 7) {
    const G = [];
    for (let i = 0; i < pts.length; i++) {
      const t = V3.norm(V3.sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)])), ref = Math.abs(t[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
      const n1 = V3.norm(V3.cross(t, ref)), n2 = V3.cross(t, n1), p = pts[i];
      G.push(Array.from({ length: lados }, (_, j) => { const a = 2 * Math.PI * j / lados, c = Math.cos(a) * r, s = Math.sin(a) * r; return [p[0] + c * n1[0] + s * n2[0], p[1] + c * n1[1] + s * n2[1], p[2] + c * n1[2] + s * n2[2]]; }));
    }
    grade(M, G, { ...opc, fecha: true });
  }
  // o desenho de um ícone (trechos de SVG na grade de 24) vira linhas de pontos; um salto no desenho começa outra linha
  function linhasDoIcone(svg, passo = 0.55) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), out = [];
    s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true'); s.style.cssText = 'position:absolute;left:-9999px;top:0';
    s.innerHTML = svg; document.body.appendChild(s);
    try {
      for (const el of s.children) {
        if (!el.getTotalLength) continue;
        const T = el.getTotalLength(), n = Math.max(2, Math.ceil(T / passo)); let cur = [], ant = null;
        for (let i = 0; i <= n; i++) { const p = el.getPointAtLength(T * i / n); if (ant && Math.hypot(p.x - ant.x, p.y - ant.y) > passo * 2.6) { if (cur.length > 1) out.push(cur); cur = []; } cur.push([p.x, p.y]); ant = p; }
        if (cur.length > 1) out.push(cur);
      }
    } catch (e) { console.warn('lâmpada: ícone', e); }
    s.remove();
    return out;
  }
  /* A lâmpada pende de um fio: soquete e rosca em cima, o bulbo embaixo. Medidas em unidades do modelo (o bulbo tem raio 0,6).
     Primeiro vão as peças opacas (fio, soquete, rosca, haste, hastes de metal e filamento); por último, o vidro. */
  const CY = -0.4, RB = 0.6, ESC = 0.033; // centro e raio do bulbo; tamanho do ícone (24 unidades = 0,79)
  function malhaLampada(o) {
    const M = novaMalha(), apagada = !o.dataset.acesa;
    const METAL = [0.8, 70, 0.55, 0], PLAST = [0.35, 26, 0.06, 0], LOUCA = [0.6, 50, 0.2, 0], FIL = [0.5, 40, 0.2, 1];
    const lat = apagada ? [0.66, 0.66, 0.64] : [0.8, 0.76, 0.62], graf = [0.13, 0.125, 0.11];
    // fio e soquete (grafite)
    tubo(M, [[0, 2.6, 0], [0, 1.02, 0]], 0.03, { cor: graf, mat: PLAST }, 10);
    torno(M, [[0.33, 0.7], [0.335, 0.74], [0.335, 0.92], [0.31, 0.985], [0.2, 1.02], [0.03, 1.03]], { cor: graf, mat: PLAST });
    torno(M, [[0.33, 0.7], [0.29, 0.7]], { cor: graf.map(v => v * 0.7), mat: PLAST });
    // rosca de metal: a crista dá a volta subindo (hélice), como numa lâmpada de verdade
    const rosca = []; for (let k = 0; k <= 26; k++) { const y = 0.4 + 0.32 * k / 26; rosca.push([j => 0.262 + 0.02 * Math.cos(ang(j) - (y - 0.4) / 0.085 * 2 * Math.PI), y]); }
    torno(M, [[0.285, 0.385], [0.29, 0.4], ...rosca], { cor: (a) => lat.map(v => v * (0.92 + 0.08 * (a % 3 === 0 ? 1 : 0.6))), mat: METAL });
    // fundo da rosca e a haste de vidro leitoso que segura o filamento
    torno(M, [[0, 0.392], [0.285, 0.385]], { cor: [0.2, 0.2, 0.19], mat: PLAST });
    torno(M, [[0.012, 0.1], [0.045, 0.105], [0.05, 0.14], [0.06, 0.3], [0.085, 0.39]], { cor: [0.9, 0.91, 0.9], mat: LOUCA });
    // filamento com a forma do ícone, no meio do bulbo, de frente
    const linhas = linhasDoIcone(o._icone || ''), pt = ([x, y]) => [(x - 12) * ESC, CY - (y - 12) * ESC, 0];
    const corFil = apagada ? [0.42, 0.42, 0.42] : [0.95, 0.7, 0.2];
    let esq = null, dir = null;
    const fios = [];
    for (const L of linhas) { const P = L.map(pt); fios.push(P); tubo(M, P, 0.027, { cor: corFil, mat: FIL }, 9); for (const p of P) { if (p[0] <= 0 && (!esq || p[1] > esq[1])) esq = p; if (p[0] >= 0 && (!dir || p[1] > dir[1])) dir = p; } }
    // duas hastes finas de metal, da haste até o ponto mais alto do ícone de cada lado
    for (const [p, s] of [[esq, -1], [dir, 1]]) if (p) tubo(M, [[s * 0.03, 0.11, 0], [s * 0.05, (0.11 + p[1]) / 2 + 0.04, 0], [p[0], p[1], 0]], 0.0075, { cor: [0.6, 0.6, 0.58], mat: METAL }, 5);
    // o clarão do filamento: um tubo largo em volta de cada linha, somado à imagem só quando a lâmpada está acesa
    M.brilho = M.i.length;
    for (const P of fios) for (const r of [0.06, 0.125]) tubo(M, P, r, { cor: [1, 1, 1], mat: [0, 1, 0, 0] }, 10);
    // o vidro: bulbo e pescoço num perfil só, de baixo para cima
    M.vidro = M.i.length;
    const perfil = [], T0 = 130 * Math.PI / 180;
    // do fundo do bulbo (embaixo) até onde o pescoço começa: um arco de esfera
    for (let k = 0; k <= 30; k++) { const f = T0 * k / 30; perfil.push([Math.max(0.0001, RB * Math.sin(f)), CY - RB * Math.cos(f)]); }
    // pescoço: uma curva suave do bulbo até a rosca
    const p0 = perfil[perfil.length - 1], p3 = [0.27, 0.4], tg = V3.norm([RB * Math.cos(T0), RB * Math.sin(T0), 0]), p1 = [p0[0] + tg[0] * 0.17, p0[1] + tg[1] * 0.17], p2 = [p3[0], p3[1] - 0.17];
    for (let k = 1; k <= 14; k++) { const u = k / 14, v = 1 - u; perfil.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]); }
    torno(M, perfil, { cor: [1, 1, 1], mat: [1, 110, 0.6, 0] });
    return { M, incl: 0.1, raio: 1.22, centro: [0, 0, 0] };
  }

  /* ---------- WebGL ---------- */
  const M4 = {
    mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
    persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2), o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; },
    mov(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); },
    rx(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); },
    ry(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); },
  };
  const VS = `attribute vec3 aP,aN,aC;attribute vec4 aM;uniform mat4 uMVP,uMV;varying vec3 vN,vV,vC,vPo;varying vec4 vM;
  void main(){vec4 q=uMV*vec4(aP,1.);vV=q.xyz;vN=mat3(uMV)*aN;vC=aC;vM=aM;vPo=aP;gl_Position=uMVP*vec4(aP,1.);}`;
  const FS = `precision highp float;uniform float uAceso,uVidro;varying vec3 vN,vV,vC,vPo;varying vec4 vM;
  void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(-vV);
  vec3 L1=normalize(vec3(-.5,.74,.62)),L2=normalize(vec3(.75,.15,.55)),L3=normalize(vec3(.2,.5,-.85));
  float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.),d3=max(dot(N,L3),0.);
  vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.),vM.y)*vM.x;
  vec3 R=reflect(-V,N);float ceu=smoothstep(-.3,.9,R.y);float faixa=smoothstep(.35,.62,R.y)*(1.-smoothstep(.7,.98,R.y));
  float fr=pow(1.-max(dot(N,V),0.),3.);
  vec3 LUZ=vec3(1.,.8,.24);float ac=min(uAceso,1.),ex=max(uAceso-1.,0.);
  if(uVidro>1.5){float a=pow(max(dot(N,V),0.),2.6-ex*.9)*(.2*ac+.5*ex);gl_FragColor=vec4(mix(vec3(1.,.68,.2),vec3(1.,.9,.6),min(ex,1.)),a);return;}
  if(uVidro>.5){
    vec3 tinta=mix(vec3(.84,.89,.92),vec3(1.,.87,.56),ac);
    vec3 cor=tinta*(.74+.26*d1)+vec3(sp)+faixa*.3+ac*vec3(.3,.2,.04)*fr+ex*vec3(.5,.36,.1);
    float alfa=clamp(.05+.52*fr+ac*(.05+.2*fr)+ex*.22+sp*.9+faixa*.26,0.,.95);
    gl_FragColor=vec4(clamp(cor,0.,1.),alfa);return;}
  vec3 amb=mix(vec3(.34,.35,.36),vec3(.58,.6,.62),N.y*.5+.5);
  vec3 cor=vC*(amb+d1*.72+d2*.2+d3*.12)+vec3(sp)+vM.z*mix(vC,vec3(1.),.55)*(ceu*.42+faixa*.7-.22)+fr*.07;
  cor=mix(cor,mix(vec3(1.,.8,.36),vec3(1.,.97,.8),min(1.,pow(max(dot(N,V),0.),1.5)+ex)),vM.w*ac);
  cor+=(1.-vM.w)*(ac+ex*1.4)*LUZ*.24*(1.-smoothstep(.05,.8,vPo.y));
  gl_FragColor=vec4(clamp(cor,0.,1.),1.);}`;
  // dois desenhistas: um para a lâmpada que gira (GL) e outro para as miniaturas do varal (GLM); false quando não há WebGL
  let GL = null, GLM = null;
  function criaGL() {
    try {
      const cv = document.createElement('canvas'), gl = cv.getContext('webgl', { antialias: true, alpha: true, preserveDrawingBuffer: true });
      if (!gl) return false;
      const sh = (tipo, src) => { const x = gl.createShader(tipo); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
      const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      const loc = {}; ['aP', 'aN', 'aC', 'aM'].forEach(a => { loc[a] = gl.getAttribLocation(pr, a); }); ['uMVP', 'uMV', 'uAceso', 'uVidro'].forEach(u => { loc[u] = gl.getUniformLocation(pr, u); });
      cv.setAttribute('aria-hidden', 'true');
      return { cv, gl, loc, cena: null };
    } catch (x) { console.warn('3d', x); return false; }
  }
  function gl3() {
    if (GL === null) { GL = criaGL(); if (GL) GL.cv.addEventListener('webglcontextlost', e => { e.preventDefault(); GL = null; }); } // se o sistema tomar o contexto, o próximo giro monta outro
    return GL || null;
  }
  function glMini() {
    if (GLM === null) { GLM = criaGL(); if (GLM) GLM.cv.addEventListener('webglcontextlost', e => { e.preventDefault(); GLM = null; minis.clear(); }); }
    return GLM || null;
  }
  // põe a malha na placa de vídeo (uma cena por vez: só há uma lâmpada 3D na tela)
  function glCena(G, cena) {
    const { gl, loc } = G, M = cena.M;
    const attr = (l, dados, n) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dados), gl.STATIC_DRAW); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); return b; };
    (G.lixo || []).forEach(b => gl.deleteBuffer(b));
    G.lixo = [attr(loc.aP, M.p, 3), attr(loc.aN, M.n, 3), attr(loc.aC, M.c, 3), attr(loc.aM, M.m, 4)];
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(M.i), gl.STATIC_DRAW); G.lixo.push(ib);
    G.cena = cena;
  }
  function glPintar(G, cena, ang, luz) {
    const { gl, loc, cv } = G, M = cena.M;
    if (G.cena !== cena) glCena(G, cena);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    const fov = 0.5, dist = cena.raio / Math.sin(fov / 2) * 1.02, c = cena.centro;
    const mv = M4.mul(M4.mov(0, 0, -dist), M4.mul(M4.rx(cena.incl), M4.mul(M4.ry(ang), M4.mov(-c[0], -c[1], -c[2]))));
    gl.uniformMatrix4fv(loc.uMV, false, mv); gl.uniformMatrix4fv(loc.uMVP, false, M4.mul(M4.persp(fov, cv.width / cv.height, dist - cena.raio * 2.4, dist + cena.raio * 2.4), mv));
    gl.uniform1f(loc.uAceso, luz);
    // o que é opaco primeiro
    gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(true); gl.uniform1f(loc.uVidro, 0);
    gl.drawElements(gl.TRIANGLES, M.brilho, gl.UNSIGNED_SHORT, 0);
    // o clarão em volta do filamento: soma luz, sem esconder nada
    gl.enable(gl.BLEND); gl.depthMask(false);
    if (luz > 0.01) { gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(loc.uVidro, 2); gl.drawElements(gl.TRIANGLES, M.vidro - M.brilho, gl.UNSIGNED_SHORT, M.brilho * 2); }
    // depois o vidro, sem esconder o que está dentro: o lado de trás e, por cima, o lado da frente
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.CULL_FACE); gl.uniform1f(loc.uVidro, 1);
    for (const lado of [gl.FRONT, gl.BACK]) { gl.cullFace(lado); gl.drawElements(gl.TRIANGLES, M.i.length - M.vidro, gl.UNSIGNED_SHORT, M.vidro * 2); }
    gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
  }

  /* ---------- sem WebGL: a mesma lâmpada, desenhada num canvas comum (o ícone estreita e alarga conforme gira) ---------- */
  function cena2d(o) { return { linhas: linhasDoIcone(o._icone || '') }; }
  function pintar2d(cv, cena, ang, luz) {
    const g = cv.getContext('2d'), dpr = cv._dpr, W = cv.width / dpr, H = cv.height / dpr, u = Math.min(W, H) / 2.5, cx = W / 2, cy = H / 2;
    const X = x => cx + x * u, Y = y => cy - y * u, mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)), rgb = c => `rgb(${c.join(',')})`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    g.strokeStyle = '#211F1A'; g.lineWidth = 0.06 * u; g.beginPath(); g.moveTo(X(0), 0); g.lineTo(X(0), Y(1)); g.stroke();
    g.fillStyle = '#211F1A'; g.beginPath(); g.roundRect ? g.roundRect(X(-0.335), Y(1.03), 0.67 * u, 0.33 * u, 0.06 * u) : g.rect(X(-0.335), Y(1.03), 0.67 * u, 0.33 * u); g.fill();
    g.fillStyle = rgb(mix([168, 168, 163], [204, 194, 158], luz)); g.fillRect(X(-0.28), Y(0.7), 0.56 * u, 0.31 * u);
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 0.02 * u; for (let k = 0; k < 4; k++) { const y = 0.66 - k * 0.075; g.beginPath(); g.moveTo(X(-0.28), Y(y)); g.lineTo(X(0.28), Y(y - 0.03)); g.stroke(); }
    const vidro = () => { g.beginPath(); g.moveTo(X(-0.27), Y(0.4)); g.bezierCurveTo(X(-0.27), Y(0.2), X(-0.36), Y(0.12), X(-0.46), Y(-0.01)); g.arc(X(0), Y(CY), RB * u, Math.PI + 0.7, -0.7, true); g.bezierCurveTo(X(0.36), Y(0.12), X(0.27), Y(0.2), X(0.27), Y(0.4)); g.closePath(); };
    vidro(); const gr = g.createRadialGradient(X(-0.15), Y(CY + 0.2), 0.05 * u, X(0), Y(CY), RB * u * 1.1);
    gr.addColorStop(0, `rgba(${mix([255, 255, 255], [255, 240, 170], luz).join(',')},${0.5 + 0.4 * luz})`); gr.addColorStop(1, `rgba(${mix([200, 208, 212], [255, 196, 0], luz).join(',')},${0.3 + 0.5 * luz})`);
    g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(40,36,28,.55)'; g.lineWidth = 0.018 * u; g.stroke();
    const k = Math.cos(ang), s = ESC * u;
    g.save(); g.translate(X(0), Y(CY)); g.scale(k, 1); g.strokeStyle = rgb(mix([110, 110, 108], [60, 44, 6], luz)); g.lineWidth = 0.05 * u; g.lineCap = g.lineJoin = 'round';
    for (const L of cena.linhas) { g.beginPath(); L.forEach(([x, y], i) => { const px = (x - 12) * s, py = (y - 12) * s; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); }
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 0.05 * u; g.lineCap = 'round'; g.beginPath(); g.arc(X(0), Y(CY), RB * u * 0.74, Math.PI * 1.08, Math.PI * 1.36); g.stroke();
  }

  /* ---------- giro: arrastar na horizontal, inércia ao soltar, setas do teclado (como nas tampinhas) ---------- */
  function girar(raiz, { auto = true, inicio = -0.5, apagada = false } = {}) {
    const o = raiz.matches && raiz.matches('.ef-o3d') ? raiz : raiz.querySelector('.ef-o3d'); if (!o || o.dataset.ligado) return null;
    o.dataset.ligado = '1';
    o._icone = (typeof LP_IC !== 'undefined' && LP_IC[o.dataset.ic]) || '';
    const quieto = parado(), G = gl3();
    let cv = o.querySelector('canvas'), cena;
    if (G) { cena = malhaLampada(o); cv.replaceWith(G.cv); cv = G.cv; o.dataset.motor = 'webgl'; }
    else { cena = cena2d(o); o.dataset.motor = 'canvas'; }
    const medir = () => { const dpr = Math.min(3, window.devicePixelRatio || 1), w = o.clientWidth, h = o.clientHeight; cv._dpr = dpr; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); };
    medir();
    const ATRITO = 0.9955, PULSO = 460; // quanto do giro sobra a cada milissegundo; quanto dura um piscar forte
    let ang = inicio, vel = 0, arr = null, raf = 0, sozinho = auto && !quieto, t0 = 0;
    let mexeu = false, ocioso = 0, rampa = 1, sentido = 1; // depois que a pessoa solta e a lâmpada para, ela volta a girar sozinha, devagar
    // apagada: a lâmpada conquistada começa escura e acende depois (acender); acende: { t, dur } enquanto está acendendo
    let luz = o.dataset.acesa && !apagada ? 1 : 0, acende = null; if (apagada) o.classList.remove('acesa');
    let pulso = null, forca = 0; // pulso: { t } enquanto a lâmpada pisca mais forte; forca: quanto a luz passa do normal
    const pintar = () => { o.dataset.ang = ang.toFixed(3); o.style.setProperty('--luz', Math.min(1, luz + forca).toFixed(3)); o.style.setProperty('--forca', forca.toFixed(3)); if (o.parentElement) o.parentElement.style.setProperty('--pulso', forca.toFixed(3)); if (!G) return pintar2d(cv, cena, ang, Math.min(1, luz + forca)); if (GL !== G || !cv.isConnected) return; glPintar(G, cena, ang, luz + forca); };
    const quadro = t => {
      raf = 0; const dt = Math.min(48, t - (t0 || t)); t0 = t;
      if (acende) { // acende piscando: duas falhas curtas e firma
        acende.t += dt; const u = Math.min(1, acende.t / acende.dur);
        luz = u >= 1 ? 1 : (u < 0.18 ? u / 0.18 * 0.7 : u < 0.3 ? 0.12 : u < 0.5 ? 0.85 : u < 0.6 ? 0.3 : 0.3 + (u - 0.6) / 0.4 * 0.7);
        if (u >= 1) { acende = null; o.classList.add('acesa'); }
      }
      if (pulso) { // um clarão só: sobe depressa e volta devagar (apagada, é uma faísca fraca que não pega)
        pulso.t += dt; const u = Math.min(1, pulso.t / PULSO), sobe = u < 0.16 ? u / 0.16 : Math.pow(1 - (u - 0.16) / 0.84, 1.7);
        forca = sobe * (luz > 0.5 ? 0.95 : 0.42); if (u >= 1) { pulso = null; forca = 0; }
      }
      if (arr) { if (acende || pulso) { pintar(); raf = requestAnimationFrame(quadro); } return; }
      if (Math.abs(vel) > 0.0004) { const f = Math.pow(ATRITO, dt); ang += vel * (1 - f) / -Math.log(ATRITO); vel *= f; if (mexeu) sentido = vel < 0 ? -1 : 1; ocioso = 0; }
      else if (sozinho) { rampa = Math.min(1, rampa + dt / 900); ang += sentido * 0.0007 * dt * rampa * (2 - rampa); }
      else if (mexeu && !quieto) { vel = 0; ocioso += dt; if (ocioso > 900) { sozinho = true; rampa = 0; } }
      else if (!acende && !pulso) { vel = 0; pintar(); return; }
      pintar(); if (o.isConnected) raf = requestAnimationFrame(quadro);
    };
    const andar = () => { if (!raf && o.isConnected) { t0 = 0; raf = requestAnimationFrame(quadro); } };
    o.addEventListener('pointerdown', e => { if (e.button > 0) return; sozinho = false; mexeu = true; ocioso = 0; arr = { x: e.clientX, t: performance.now(), v: 0, x0: e.clientX, t0: performance.now() }; vel = 0; o.classList.add('ef-pegou'); try { o.setPointerCapture(e.pointerId); } catch {} });
    o.addEventListener('pointermove', e => { if (!arr) return; const agora = performance.now(), dx = e.clientX - arr.x, dt = Math.max(1, agora - arr.t); ang += dx * 0.0115; arr.v = arr.v * 0.6 + (dx * 0.0115 / dt) * 0.4; arr.x = e.clientX; arr.t = agora; pintar(); });
    // toque sem arrastar (no fundo ou na lâmpada): ela pisca mais forte
    const piscar = () => { if (pulso || acende) return false; pulso = { t: 0 }; if (quieto) { pulso = null; return false; } try { if (navigator.vibrate) navigator.vibrate(10); } catch {} andar(); return true; };
    const soltar = () => { if (!arr) return; const toque = Math.abs(arr.x - arr.x0) < 6 && performance.now() - arr.t0 < 400; vel = quieto || toque ? 0 : Math.max(-0.02, Math.min(0.02, arr.v)); arr = null; o.classList.remove('ef-pegou'); if (toque) { mexeu = false; sozinho = auto && !quieto; piscar(); } andar(); };
    o.addEventListener('pointerup', soltar); o.addEventListener('pointercancel', soltar);
    o.addEventListener('keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); sozinho = false; mexeu = true; ocioso = 0; sentido = e.key === 'ArrowRight' ? 1 : -1; vel = 0; ang += 0.3 * sentido; pintar(); andar(); });
    pintar(); andar();
    // dá um peteleco que faz a lâmpada dar `voltas` e parar de frente, um pouco de lado (no ângulo `fim`)
    const peteleco = (voltas = 2, fim = -0.4) => { sozinho = false; const total = voltas * 2 * Math.PI + fim - ang; vel = (total + 0.0004 / -Math.log(ATRITO)) * -Math.log(ATRITO); andar(); };
    // acende a lâmpada (quem pede movimento reduzido vê a lâmpada já acesa)
    const acender = (dur = 1100) => { if (quieto) { luz = 1; o.classList.add('acesa'); pintar(); return; } acende = { t: 0, dur }; andar(); };
    return { girar: v => { sozinho = false; vel = v; andar(); }, peteleco, acender, piscar, angulo: () => ang, luz: () => luz, forca: () => forca };
  }
  /* miniatura: a mesma lâmpada 3D, desenhada uma vez num canvas pequeno (o varal mostra as 18). Guardadas por ícone,
     estado e tamanho; devolve false sem WebGL, e o varal fica com o desenho de traço. */
  const minis = new Map();
  function miniatura(cv, { icone = 'lampada', acesa = false, ang = -0.42 } = {}) {
    const G = glMini(); if (!G) return false;
    const dpr = Math.min(3, window.devicePixelRatio || 1), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr); if (!w || !h) return false;
    const chave = `${icone}:${acesa ? 1 : 0}:${w}x${h}`;
    let img = minis.get(chave);
    if (!img) {
      const o = { dataset: acesa ? { acesa: '1' } : {}, _icone: (typeof LP_IC !== 'undefined' && LP_IC[icone]) || '' };
      G.cv.width = w; G.cv.height = h; glPintar(G, malhaLampada(o), ang, acesa ? 1 : 0);
      img = document.createElement('canvas'); img.width = w; img.height = h; img.getContext('2d').drawImage(G.cv, 0, 0);
      minis.set(chave, img);
    }
    cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0);
    return true;
  }
  // a lâmpada em 3D: o desenho entra quando girar() liga
  function html({ icone = 'lampada', nome = '', acesa = false, D = 200 } = {}) {
    const esc = KitFacil.esc;
    return `<div class="ef-o3d${acesa ? ' acesa' : ''}" data-ic="${esc(icone)}" ${acesa ? 'data-acesa="1"' : ''} tabindex="0" role="img" aria-label="Lâmpada ${esc(nome)}, ${acesa ? 'acesa' : 'apagada'}. Deslize o dedo ou use as setas para girar." style="width:${D}px;height:${Math.round(D * 1.16)}px"><span class="ef-o3d-halo" aria-hidden="true"></span><canvas aria-hidden="true"></canvas></div>`;
  }
  return { html, girar, miniatura, _malha: malhaLampada };
})();
