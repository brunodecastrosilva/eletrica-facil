/* Kit Fácil · padrão comum do Projeto Integrador (Conta Fácil, Elétrica Fácil, Estudo Fácil).
   A mesma cópia fica na pasta comum/ dos três repositórios. Para mudar: altere uma cópia, copie para as
   outras duas e rode `npm run verificar` em cada repositório (o MANIFESTO.json acusa cópias diferentes).
   Sem dependências e sem etapa de build: script clássico que cria window.KitFacil.

   O que tem aqui (veja comum/PADRAO.md):
   - área superior direita padronizada: chopp (apoio ao criador, só nas telas principais), nuvem (estado real da
     sincronização) e balão (avaliação e feedback); Ajustes fica na navegação (barra de baixo e trilho)
   - apoio ao criador: "Pague um chopp para o criador!", com QR code e código Pix copia e cola
   - novidades de cada versão (uma vez, na primeira abertura depois de atualizar) e boas-vindas no primeiro uso
   - avaliação e feedback: escolha entre "Avaliar o app" e "Relatar um problema", com os mesmos componentes
   - tela de Ajustes em guias: as guias comuns, sempre na mesma ordem, e as guias próprias de cada app
   - tema claro, escuro ou automático; instalar; cópia de segurança; armazenamento; apagar dados do aparelho
   - sincronização entre aparelhos por um gist secreto e criptografado na conta GitHub do usuário
   - janelas (diálogos) acessíveis e avisos */
(function (global) {
  'use strict';
  const VERSAO = '2.1.2';

  /* ================= família de apps (mesmo endereço no GitHub Pages) ================= */
  const FAMILIA = [
    { app: 'conta-facil', nome: 'Conta Fácil', prefixo: 'contafacil.', resumo: 'Divide a comanda do bar sem calculadora.' },
    { app: 'eletrica-facil', nome: 'Elétrica Fácil', prefixo: 'eletricafacil.', resumo: 'Orçamentos de elétrica prontos em minutos.' },
    { app: 'estudo-facil', nome: 'Estudo Fácil', prefixo: 'estudofacil.', resumo: 'Plano de estudos para concursos, dia a dia.' },
  ];

  /* Destino das avaliações: banco Firestore do projeto no Firebase (plano gratuito).
     A configuração web do Firebase é pública por natureza (não é senha): quem protege o banco são as regras
     do Firestore (veja comum/regras-firestore-feedback.txt), que só deixam criar avaliações no formato abaixo. */
  const DESTINO_PADRAO = { tipo: 'firestore', projeto: 'conta-facil-2c1f9', chaveApi: 'AIzaSyDKdtdRernEqoaC0BQdMW8P7KiZ-UNcEN0', colecao: 'feedback' };

  /* Apoio ao criador (lei 13): Pix do criador, igual nos três apps. A chave é ALEATÓRIA, de propósito: o repositório é
     público e uma chave de CPF, telefone ou e-mail exporia dado pessoal. Nome (até 25 letras) e cidade (até 15) entram no
     código Pix copia e cola, como manda o padrão do Banco Central. Sem chave, o chopp não aparece. */
  // nome não pessoal de propósito (decisão do criador): o banco de quem paga mostra o nome real, vindo do cadastro da chave
  const APOIO_PADRAO = { chave: '35b9f895-679e-478f-8bc0-4cc62745a031', nome: 'Projeto Facil', cidade: 'Gama' };
  const QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';

  /* ================= utilidades ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ler = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  const canon = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, key) => (o[key] = x[key], o), {}) : x);
  const pad = n => String(n).padStart(2, '0');
  const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
  const maiuscula = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  function novoId() {
    try { if (crypto.randomUUID) return crypto.randomUUID(); } catch {}
    const b = crypto.getRandomValues(new Uint8Array(16));
    return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  const instalado = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch { return false; } };
  const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function haQuanto(ts) {
    const m = Math.round((Date.now() - ts) / 6e4);
    if (m < 1) return 'agora mesmo';
    if (m < 60) return `há ${m} min`;
    const d = new Date(ts), hm = `${pad(d.getHours())}h${pad(d.getMinutes())}`;
    return d.toDateString() === new Date().toDateString() ? `hoje às ${hm}` : `em ${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${hm}`;
  }

  /* ================= ícones comuns (mesmo traço, 24 × 24) ================= */
  const svg = p => `<svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const P = {
    nuvem: '<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z"/>',
    balao: '<path d="M20 15.5a2 2 0 0 1-2 2H8.5L4 21V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M8.5 9h7M8.5 12.5h4.5"/>',
    ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    pessoa: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.6 3.9-5.8 7.5-5.8s6.7 2.2 7.5 5.8"/>',
    aparencia: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
    preferencias: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5s1.2-6.1 3.6-8.5z"/>',
    sino: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    escudo: '<path d="M12 3 5 6v5.5c0 4.3 3 7.6 7 9.5 4-1.9 7-5.2 7-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.1"/>',
    chopp: '<path d="M5.5 8.5h10v11a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M15.5 11h1.6a2.4 2.4 0 0 1 2.4 2.4v1.7a2.4 2.4 0 0 1-2.4 2.4h-1.6"/><path d="M5.5 8.5A2.4 2.4 0 0 1 7.6 4.7a3 3 0 0 1 5.3-.4 2.4 2.4 0 0 1 2.6 4.2"/><path d="M9 12.5v5M12 12.5v5"/>',
    estrelaNova: '<path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M18 6l-2.1 2.1M8.1 15.9 6 18"/><circle cx="12" cy="12" r="2.2"/>',
  };
  const IC = {
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    estrela: '<svg class="kf-i kf-estrela" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>',
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    nuvem: svg(P.nuvem),
    balao: svg(P.balao),
    msg: svg(P.balao),
    ajustes: svg(P.ajustes),
    chopp: svg(P.chopp),
    novidades: svg(P.estrelaNova),
    pessoa: svg(P.pessoa),
    aparencia: svg(P.aparencia),
    preferencias: svg(P.preferencias),
    sino: svg(P.sino),
    escudo: svg(P.escudo),
    info: svg(P.info),
    celular: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>'),
    copiar: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
    link: svg('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
    externo: svg('<path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
    alerta: svg('<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>'),
    email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
    chev: svg('<path d="m9.5 6 6 6-6 6"/>'),
    voltar: svg('<path d="m14.5 6-6 6 6 6"/>'),
    baixar: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
    subir: svg('<path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9M5 19.5h14"/>'),
    lixo: svg('<path d="M4.5 7h15M10 11v6M14 11v6"/><path d="M6.5 7l.8 12.2A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7M9.5 7V4.5h5V7"/>'),
    atualizar: svg('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4.5v4.2h-4.2"/>'),
  };

  /* ================= configuração do app ================= */
  const C = {
    app: '', nome: '', versao: '', resumo: '', icone: 'icons/icon-192.png', prefixo: '',
    tela: () => '', toast: null, privacidade: [], suporteEmail: '', feedback: { ...DESTINO_PADRAO },
    exemploDados: '', abrirAjustes: null, emAjustes: null, copia: null, textos: {},
    apoio: { ...APOIO_PADRAO }, novidades: [], boasVindas: null, ocupado: null,
  };
  let iniciado = false;
  function iniciar(o) {
    Object.assign(C, o || {});
    C.feedback = { ...DESTINO_PADRAO, ...((o && o.feedback) || {}) };
    C.textos = { ...((o && o.textos) || {}) };
    C.apoio = { ...APOIO_PADRAO, ...((o && o.apoio) || {}) };
    C.novidades = Array.isArray(o && o.novidades) ? o.novidades : [];
    if (!C.prefixo) C.prefixo = (FAMILIA.find(f => f.app === C.app) || {}).prefixo || (C.app + '.');
    if (!C.app || !C.nome || !C.versao) console.warn('KitFacil.iniciar: informe app, nome e versao');
    raiz();
    if (!iniciado) {
      iniciado = true;
      capturarErros();
      window.addEventListener('online', () => { fila.tentar(); atualizarTopo(); });
      window.addEventListener('offline', () => atualizarTopo());
      setTimeout(() => fila.tentar(), 4000);
      setTimeout(primeiraAbertura, 700);
    }
  }

  /* ================= avisos (toast) ================= */
  let toastT;
  function avisar(msg) {
    if (typeof C.toast === 'function') { try { C.toast(msg); return; } catch {} }
    let el = $('.kf-toast');
    if (!el) { el = document.createElement('div'); el.className = 'kf-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false; clearTimeout(toastT);
    toastT = setTimeout(() => { el.hidden = true; }, 3200);
  }

  /* ================= janelas (diálogos) ================= */
  function raiz() {
    let r = document.getElementById('kf-raiz');
    if (!r) { r = document.createElement('div'); r.id = 'kf-raiz'; r.className = 'kf-raiz'; document.body.appendChild(r); }
    return r;
  }
  let atual = null, travaY = null;
  function travar() {
    if (travaY !== null) return;
    const b = document.body;
    // o app já travou a rolagem (janela dele aberta): não mexe
    if (b.style.position === 'fixed') { travaY = -1; return; }
    travaY = window.scrollY;
    Object.assign(b.style, { position: 'fixed', top: -travaY + 'px', left: '0', right: '0', width: '100%' });
  }
  function destravar() {
    if (travaY === null) return;
    const y = travaY; travaY = null;
    if (y < 0) return;
    Object.assign(document.body.style, { position: '', top: '', left: '', right: '', width: '' });
    window.scrollTo(0, y);
  }
  const FOCAVEIS = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
  function prender(e, dlg) {
    const els = $$(FOCAVEIS, dlg).filter(x => x.offsetParent !== null || x === document.activeElement);
    if (!els.length) { e.preventDefault(); dlg.focus(); return; }
    const a = els[0], z = els[els.length - 1];
    if (e.shiftKey && (document.activeElement === a || document.activeElement === dlg)) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
  /* abre uma janela: no celular sobe do pé da tela; em telas largas fica no centro */
  function abrirDialogo({ titulo, corpo, pe = '', aoMontar, aoFechar, classe = '', nome = '' }) {
    const origem = atual ? atual.origem : document.activeElement;
    fecharDialogo(true);
    const idT = 'kf-t-' + Math.random().toString(36).slice(2, 8);
    const wrap = document.createElement('div');
    wrap.className = 'kf-ov';
    wrap.innerHTML = `<div class="kf-dlg ${esc(classe)}" role="dialog" aria-modal="true" aria-labelledby="${idT}" tabindex="-1"${nome ? ` data-kf-dialogo="${esc(nome)}"` : ''}>
      <div class="kf-dlg-cab"><h2 id="${idT}">${esc(titulo)}</h2><button type="button" class="kf-fechar" data-kf-fechar aria-label="Fechar">${IC.x}</button></div>
      <div class="kf-dlg-corpo">${corpo}</div>${pe ? `<div class="kf-dlg-pe">${pe}</div>` : ''}</div>`;
    raiz().appendChild(wrap);
    travar();
    const dlg = wrap.firstElementChild;
    let fora = false;
    wrap.addEventListener('pointerdown', e => { fora = e.target === wrap; });
    wrap.addEventListener('click', e => { if (fora && e.target === wrap) fecharDialogo(); fora = false; });
    wrap.addEventListener('touchmove', e => { if (!e.target.closest('.kf-dlg')) e.preventDefault(); }, { passive: false });
    dlg.addEventListener('click', e => { if (e.target.closest('[data-kf-fechar]')) { e.preventDefault(); fecharDialogo(); } });
    dlg.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); fecharDialogo(); }
      else if (e.key === 'Tab') prender(e, dlg);
    });
    atual = { el: wrap, dlg, origem, aoFechar, nome };
    if (aoMontar) aoMontar(dlg);
    const alvo = $('[autofocus]', dlg) || dlg;
    try { alvo.focus({ preventScroll: true }); } catch { alvo.focus(); }
    return dlg;
  }
  function fecharDialogo(silencioso) {
    if (!atual) return;
    const { el, origem, aoFechar } = atual;
    atual = null;
    el.remove();
    destravar();
    if (origem && origem.focus && document.contains(origem)) { try { origem.focus({ preventScroll: true }); } catch {} }
    if (!silencioso && typeof aoFechar === 'function') aoFechar();
  }
  const dialogoAberto = () => !!atual;
  function confirmar({ titulo, texto, ok = 'Confirmar', perigo = false, aoConfirmar }) {
    abrirDialogo({ titulo, classe: 'kf-curto',
      corpo: `<p class="kf-texto">${esc(texto)}</p>`,
      pe: `<button type="button" class="kf-btn kf-sec" data-kf-fechar>Voltar</button><button type="button" class="kf-btn ${perigo ? 'kf-perigo' : 'kf-pri'}" data-kf-ok autofocus>${esc(ok)}</button>`,
      aoMontar: d => { $('[data-kf-ok]', d).onclick = () => { fecharDialogo(true); aoConfirmar && aoConfirmar(); }; } });
  }
  async function copiar(texto, msg = 'Copiado.') {
    try { await navigator.clipboard.writeText(texto); avisar(msg); return true; } catch {}
    try {
      const t = document.createElement('textarea'); t.value = texto; t.setAttribute('readonly', '');
      Object.assign(t.style, { position: 'fixed', top: '0', left: '0', opacity: '0' });
      document.body.appendChild(t); t.select();
      const ok = document.execCommand('copy'); t.remove();
      if (ok) { avisar(msg); return true; }
    } catch {}
    avisar('Não deu para copiar. Toque e segure no texto para copiar.');
    return false;
  }

  /* ================= erros recentes (vão no relato de problema, se a pessoa permitir) ================= */
  const erros = [];
  function capturarErros() {
    const guarda = m => { m = String(m || '').replace(/\s+/g, ' ').trim().slice(0, 160); if (!m) return; erros.push(m); if (erros.length > 3) erros.shift(); };
    window.addEventListener('error', e => guarda(e.message || (e.error && e.error.message)));
    window.addEventListener('unhandledrejection', e => guarda(e.reason && (e.reason.message || e.reason)));
  }

  /* ================= avaliação e feedback ================= */
  /* Padrão do registro (esquema 1), igual em todos os apps:
     { esquema: 1, app, versao, nota: 0..5 (0 = sem nota), tipo: avaliacao|elogio|sugestao|critica|problema,
       mensagem (até 2000), contato? (até 120), tela? (até 60),
       categoria? (só em problema: funcionamento|erro|dados|tela|outro), gravidade? (só em problema: baixa|media|alta),
       tecnico? { plataforma, navegador, tela, janela, instalado, idioma, erros }, enviadoEm (data e hora do aparelho) } */
  const COMENTARIOS = [['elogio', 'Elogio'], ['sugestao', 'Sugestão'], ['critica', 'Crítica']];
  const CATEGORIAS = [['funcionamento', 'Algo não funciona'], ['erro', 'Erro ou travamento'], ['dados', 'Dados ou sincronização'], ['tela', 'Tela ou texto'], ['outro', 'Outro']];
  const GRAVIDADES = [['baixa', 'Incomoda, mas dá para usar'], ['media', 'Atrapalha o uso'], ['alta', 'Impede o uso']];
  const TIPO_TXT = { avaliacao: 'Avaliação', elogio: 'Elogio', sugestao: 'Sugestão', critica: 'Crítica', problema: 'Problema' };
  const NOTAS = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Ótimo'];
  const LIM = { mensagem: 2000, contato: 120, tela: 60 };
  const DICAS = {
    '': 'Conte o que achou, o que falta ou o que pode melhorar.',
    elogio: 'O que você mais gosta no app?',
    sugestao: 'Que função ou mudança ajudaria você?',
    critica: 'O que está atrapalhando ou incomodando?',
    problema: 'Conte o que você estava fazendo, o que esperava e o que aconteceu.',
  };
  function infoTecnica() {
    const ua = navigator.userAgent || '';
    const plataforma = ehIOS() ? 'iOS' : /android/i.test(ua) ? 'Android' : /windows/i.test(ua) ? 'Windows' : /mac os|macintosh/i.test(ua) ? 'macOS' : /cros/i.test(ua) ? 'ChromeOS' : /linux/i.test(ua) ? 'Linux' : 'Outro';
    const navegador = /edg\//i.test(ua) ? 'Edge' : /opr\//i.test(ua) ? 'Opera' : /samsungbrowser/i.test(ua) ? 'Samsung Internet' : /firefox|fxios/i.test(ua) ? 'Firefox' : /crios|chrome|chromium/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : 'Outro';
    const t = { plataforma, navegador, tela: `${screen.width}x${screen.height}`, janela: `${window.innerWidth}x${window.innerHeight}`, instalado: instalado(), idioma: String(navigator.language || '').slice(0, 12) };
    if (erros.length) t.erros = erros.join(' | ').slice(0, 500);
    return t;
  }
  /* converte para o formato da API REST do Firestore */
  function valorFS(v, chave) {
    if (chave === 'enviadoEm') return { timestampValue: v };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number' && Number.isInteger(v)) return { integerValue: String(v) };
    if (typeof v === 'number') return { doubleValue: v };
    if (v && typeof v === 'object') return { mapValue: { fields: camposFS(v) } };
    return { stringValue: String(v ?? '') };
  }
  function camposFS(o) { const f = {}; for (const k of Object.keys(o)) if (o[k] !== undefined) f[k] = valorFS(o[k], k); return f; }
  /* envia um registro. Resposta: 'ok' (recebido), 'offline' (sem internet), 'recusado' (o banco não aceitou) ou 'falha' (tentar depois) */
  async function enviarUma(id, dados) {
    const d = C.feedback || {};
    if (d.tipo !== 'firestore' || !d.projeto || !d.chaveApi) return 'recusado';
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(d.projeto)}/databases/(default)/documents/${encodeURIComponent(d.colecao || 'feedback')}?documentId=${encodeURIComponent(id)}&key=${encodeURIComponent(d.chaveApi)}`;
    let r;
    try { r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: camposFS(dados) }), cache: 'no-store' }); }
    catch { return navigator.onLine === false ? 'offline' : 'falha'; }
    if (r.ok || r.status === 409) return 'ok'; // 409: já tinha chegado numa tentativa anterior
    if (r.status === 400 || r.status === 401 || r.status === 403 || r.status === 404) return 'recusado';
    return 'falha';
  }
  /* registro no formato da regra anterior (sem categoria e gravidade): os dois vão no começo da mensagem */
  function semCamposNovos(dados) {
    const { categoria, gravidade, ...resto } = dados;
    const partes = [categoria && `Categoria: ${(CATEGORIAS.find(c => c[0] === categoria) || [, categoria])[1]}`, gravidade && `Gravidade: ${(GRAVIDADES.find(g => g[0] === gravidade) || [, gravidade])[1]}`].filter(Boolean);
    resto.mensagem = (`[${partes.join(' · ')}] ` + (resto.mensagem || '')).slice(0, LIM.mensagem);
    return resto;
  }
  async function enviarRegistro(reg) {
    const r = await enviarUma(reg.id, reg.dados);
    // banco com a regra anterior (ainda sem categoria e gravidade): manda de novo no formato antigo, sem perder nada
    if (r === 'recusado' && (reg.dados.categoria || reg.dados.gravidade)) return enviarUma(reg.id, semCamposNovos(reg.dados));
    return r;
  }
  /* fila neste aparelho: o que não saiu é reenviado sozinho quando a conexão volta */
  const fila = {
    chave: () => `kitfacil.${C.app || 'app'}.feedback`,
    ler() { const l = ler(this.chave(), []); return Array.isArray(l) ? l : []; },
    gravar(l) { gravar(this.chave(), l.slice(-20)); pintarPendentes(); },
    adicionar(reg) { const l = this.ler().filter(x => x.id !== reg.id); l.push({ ...reg, tentativas: (reg.tentativas || 0) }); this.gravar(l); },
    remover(id) { this.gravar(this.ler().filter(x => x.id !== id)); },
    quantos() { return this.ler().length; },
    ocupada: false,
    async tentar() {
      if (this.ocupada || !C.app) return;
      const l = this.ler(); if (!l.length) return;
      this.ocupada = true;
      try {
        const limite = Date.now() - 60 * 864e5;
        for (const reg of l) {
          if ((reg.criado || 0) < limite || (reg.tentativas || 0) >= 30) { this.remover(reg.id); continue; }
          const r = await enviarRegistro(reg);
          if (r === 'ok') this.remover(reg.id);
          else if (r === 'offline') break;
          else { const atual = this.ler(); const x = atual.find(y => y.id === reg.id); if (x) { x.tentativas = (x.tentativas || 0) + 1; this.gravar(atual); } }
        }
      } finally { this.ocupada = false; }
    },
  };
  const textoPendentes = n => n ? `${plural(n, 'mensagem guardada', 'mensagens guardadas')} neste aparelho, à espera de envio. O app envia sozinho quando conseguir.` : '';
  function pintarPendentes() {
    const n = fila.quantos();
    $$('[data-kf-pendentes]').forEach(el => { el.textContent = textoPendentes(n); el.hidden = !n; });
    $$('[data-kf="feedback"]').forEach(b => b.classList.toggle('kf-com-pendente', !!n));
    resumoAjustes('feedback', resumoFeedback());
  }
  const resumoFeedback = () => fila.quantos() ? plural(fila.quantos(), 'mensagem à espera de envio', 'mensagens à espera de envio') : 'Avaliar o app ou relatar um problema';
  function textoDoRegistro(dados) {
    const linhas = [`${C.nome} ${C.versao}`, `Tipo: ${TIPO_TXT[dados.tipo] || 'Avaliação'}`];
    if (dados.nota) linhas.push(`Nota: ${dados.nota} de 5 (${NOTAS[dados.nota - 1]})`);
    if (dados.categoria) linhas.push(`Categoria: ${(CATEGORIAS.find(c => c[0] === dados.categoria) || [, ''])[1]}`);
    if (dados.gravidade) linhas.push(`Gravidade: ${(GRAVIDADES.find(g => g[0] === dados.gravidade) || [, ''])[1]}`);
    if (dados.mensagem) linhas.push('', dados.mensagem);
    if (dados.contato) linhas.push('', `Contato: ${dados.contato}`);
    if (dados.tecnico) linhas.push('', `Aparelho: ${dados.tecnico.plataforma}, ${dados.tecnico.navegador}, tela ${dados.tecnico.tela}${dados.tecnico.instalado ? ', app instalado' : ''}`);
    return linhas.join('\n');
  }
  /* as duas opções do balão: os mesmos botões aparecem na guia "Avaliação e feedback" dos Ajustes */
  function escolhasHTML() {
    return `<div class="kf-escolhas">
        <button type="button" class="kf-escolha" data-kf="avaliar"><span class="kf-escolha-ic">${IC.estrela}</span><span class="kf-escolha-tx"><b>Avaliar o app</b><small>Dê uma nota de 1 a 5 e, se quiser, deixe um comentário.</small></span>${IC.chev}</button>
        <button type="button" class="kf-escolha" data-kf="problema"><span class="kf-escolha-ic">${IC.alerta}</span><span class="kf-escolha-tx"><b>Relatar um problema</b><small>Conte o que deu errado para a gente corrigir.</small></span>${IC.chev}</button>
      </div>
      <p class="kf-ajuda" data-kf-pendentes aria-live="polite"${fila.quantos() ? '' : ' hidden'}>${textoPendentes(fila.quantos())}</p>`;
  }
  function abrirEscolhaFeedback() {
    abrirDialogo({ titulo: 'Avaliação e feedback', classe: 'kf-curto', nome: 'feedback',
      corpo: `<p class="kf-texto">Sua mensagem vai direto para quem faz o ${esc(C.nome)}.</p>${escolhasHTML()}`,
      pe: `<button type="button" class="kf-btn kf-sec" data-kf-fechar>Fechar</button>` });
  }
  const opcoesHTML = (nome, lista, marcado = '') => `<div class="kf-opcoes">${lista.map(([k, l]) => `<label class="kf-opcao"><input type="radio" name="${nome}" value="${k}"${k === marcado ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>`;
  /* Os dois formulários usam os mesmos componentes e a mesma ordem: classificação, texto, contato, informações técnicas.
     Muda só o objetivo: a avaliação pede a nota; o relato pede a descrição e, se a pessoa quiser, categoria e gravidade. */
  function abrirFeedback(opcoes = {}) {
    const modo = opcoes.tipo === 'problema' ? 'problema' : opcoes.tipo === 'avaliar' || opcoes.tipo === 'avaliacao' ? 'avaliar' : '';
    if (!modo) return abrirEscolhaFeedback();
    const problema = modo === 'problema';
    const titulo = problema ? 'Relatar um problema' : `Avaliar o ${C.nome}`;
    const classificacao = problema
      ? `<fieldset class="kf-campo"><legend class="kf-rotulo">Que tipo de problema? <span class="kf-opcional">(opcional)</span></legend>${opcoesHTML('kf-categoria', CATEGORIAS)}</fieldset>
         <fieldset class="kf-campo"><legend class="kf-rotulo">Quanto atrapalha? <span class="kf-opcional">(opcional)</span></legend>${opcoesHTML('kf-gravidade', GRAVIDADES)}</fieldset>`
      : `<fieldset class="kf-campo"><legend class="kf-rotulo">Sua nota para o app</legend>
          <div class="kf-estrelas">${NOTAS.map((n, i) => `<input type="radio" name="kf-nota" id="kf-n${i + 1}" value="${i + 1}" class="kf-so-leitor"><label for="kf-n${i + 1}" title="${n}"><span class="kf-so-leitor">${i + 1} de 5, ${n}</span>${IC.estrela}</label>`).join('')}</div>
          <span class="kf-ajuda" data-kf-nota-txt aria-live="polite">Toque numa estrela para dar sua nota.</span></fieldset>
         <fieldset class="kf-campo"><legend class="kf-rotulo">Seu comentário é… <span class="kf-opcional">(opcional)</span></legend>${opcoesHTML('kf-tipo', COMENTARIOS)}</fieldset>`;
    const corpo = `<form class="kf-form" id="kf-form" data-kf-modo="${modo}" novalidate>
      <p class="kf-texto">${problema ? `Conte o que deu errado no ${esc(C.nome)}. Quanto mais detalhes, mais rápido dá para corrigir.` : `Sua opinião ajuda a melhorar o ${esc(C.nome)}. Leva menos de um minuto.`}</p>
      ${classificacao}
      <div class="kf-campo">
        <label class="kf-rotulo" for="kf-msg">${problema ? 'O que aconteceu?' : 'Comentário <span class="kf-opcional">(opcional)</span>'}</label>
        <textarea id="kf-msg" class="kf-entrada" rows="4" maxlength="${LIM.mensagem}" placeholder="${esc(DICAS[problema ? 'problema' : ''])}"${problema ? ' aria-required="true"' : ''}></textarea>
        <span class="kf-ajuda kf-contador" data-kf-cont aria-live="polite">0 de ${LIM.mensagem} caracteres</span>
      </div>
      <div class="kf-campo">
        <label class="kf-rotulo" for="kf-contato">Contato para resposta <span class="kf-opcional">(opcional)</span></label>
        <input id="kf-contato" class="kf-entrada" type="text" maxlength="${LIM.contato}" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="E-mail ou WhatsApp">
        <span class="kf-ajuda">Preencha só se quiser resposta.</span>
      </div>
      <label class="kf-check"><input type="checkbox" id="kf-tec"${problema ? ' checked' : ''}><span>Enviar informações técnicas: versão do app, tipo de aparelho, navegador e tamanho da tela${problema ? ', e os últimos erros do app' : ''}. Ajudam a resolver problemas.</span></label>
      <details class="kf-det"><summary>O que é enviado e para onde</summary>
        <p class="kf-ajuda">${problema ? 'A categoria e a gravidade (se você escolher), a descrição' : 'A nota, o tipo de comentário (se você escolher), o comentário'}, o contato (se você preencher), o app, a versão e a tela em que você está, com as informações técnicas se a opção acima estiver marcada. Tudo vai para o banco de dados do projeto no Firebase (Google), usado só para melhorar os apps e apagado depois de 2 anos. Não enviamos seus dados do app, como ${esc(C.exemploDados || 'os registros que você guarda nele')}.</p></details>
      <p class="kf-erro-form" data-kf-erro role="alert" hidden></p>
    </form>`;
    abrirDialogo({ titulo, corpo, classe: 'kf-feedback', nome: modo,
      pe: `<button type="button" class="kf-btn kf-sec" data-kf-voltar-fb>Voltar</button><button type="submit" form="kf-form" class="kf-btn kf-pri" data-kf-enviar>Enviar</button>`,
      aoMontar: d => {
        const form = $('#kf-form', d), msg = $('#kf-msg', d), cont = $('[data-kf-cont]', d), notaTxt = $('[data-kf-nota-txt]', d), erro = $('[data-kf-erro]', d);
        const valor = n => (($(`input[name="${n}"]:checked`, d) || {}).value) || '';
        const nota = () => +(valor('kf-nota') || 0);
        const pintar = () => {
          if (!problema) {
            const n = nota();
            $$('.kf-estrelas label', d).forEach((l, i) => l.classList.toggle('kf-on', i < n));
            notaTxt.textContent = n ? `${n} de 5: ${NOTAS[n - 1]}` : 'Toque numa estrela para dar sua nota.';
            msg.placeholder = DICAS[valor('kf-tipo')] || DICAS[''];
          }
          erro.hidden = true;
        };
        $('[data-kf-voltar-fb]', d).onclick = () => abrirEscolhaFeedback();
        d.addEventListener('change', e => { if (/^kf-(nota|tipo|categoria|gravidade)$/.test(e.target.name)) pintar(); });
        msg.addEventListener('input', () => { cont.textContent = `${msg.value.length} de ${LIM.mensagem} caracteres`; erro.hidden = true; });
        form.addEventListener('submit', async e => {
          e.preventDefault();
          const n = nota(), texto = msg.value.trim(), contato = $('#kf-contato', d).value.trim();
          const falta = problema ? (!texto ? 'Conte o que aconteceu.' : '') : (!n ? 'Toque numa estrela para dar sua nota.' : '');
          if (falta) { erro.textContent = falta; erro.hidden = false; (problema ? msg : $('input[name="kf-nota"]', d)).focus(); return; }
          const dados = { esquema: 1, app: C.app, versao: String(C.versao).slice(0, 20), nota: problema ? 0 : n, tipo: problema ? 'problema' : (valor('kf-tipo') || 'avaliacao'), mensagem: texto.slice(0, LIM.mensagem), enviadoEm: new Date().toISOString() };
          if (problema && valor('kf-categoria')) dados.categoria = valor('kf-categoria');
          if (problema && valor('kf-gravidade')) dados.gravidade = valor('kf-gravidade');
          if (contato) dados.contato = contato.slice(0, LIM.contato);
          let tela = ''; try { tela = String(C.tela() || ''); } catch {}
          if (tela) dados.tela = tela.slice(0, LIM.tela);
          if ($('#kf-tec', d).checked) dados.tecnico = infoTecnica();
          const reg = { id: novoId(), criado: Date.now(), dados };
          const bt = $('[data-kf-enviar]', d); bt.disabled = true; bt.textContent = 'Enviando…';
          const r = await enviarRegistro(reg);
          if (r !== 'ok') fila.adicionar(reg);
          resultadoFeedback(r, dados);
        });
        pintar();
      } });
  }
  function resultadoFeedback(r, dados) {
    const ok = r === 'ok';
    const corpo = ok
      ? `<div class="kf-fim"><span class="kf-fim-ic kf-ok">${IC.check}</span><p class="kf-texto"><b>Obrigado! Recebemos sua mensagem.</b></p><p class="kf-texto">${dados.contato ? 'Se precisar, respondemos no contato que você deixou.' : dados.tipo === 'problema' ? 'Ela vai ajudar a corrigir o problema.' : 'Ela vai ajudar a decidir as próximas melhorias.'}</p></div>`
      : `<div class="kf-fim"><span class="kf-fim-ic kf-alerta">${r === 'offline' ? IC.nuvem : IC.alerta}</span>
          <p class="kf-texto"><b>${r === 'offline' ? 'Você está sem internet.' : 'Não foi possível enviar agora.'}</b></p>
          <p class="kf-texto">A mensagem ficou guardada neste aparelho e o app envia sozinho ${r === 'offline' ? 'quando a conexão voltar' : 'numa próxima tentativa'}.${C.suporteEmail ? ' Se preferir, mande por e-mail.' : ' Se preferir, copie o texto e mande por outro meio.'}</p></div>`;
    const pe = ok ? `<button type="button" class="kf-btn kf-pri" data-kf-fechar autofocus>Fechar</button>`
      : `<button type="button" class="kf-btn kf-sec" data-kf-copiar>${IC.copiar}Copiar mensagem</button>${C.suporteEmail ? `<a class="kf-btn kf-sec" href="mailto:${esc(C.suporteEmail)}?subject=${encodeURIComponent(C.nome + ' ' + C.versao)}&body=${encodeURIComponent(textoDoRegistro(dados))}">${IC.email}Enviar por e-mail</a>` : ''}<button type="button" class="kf-btn kf-pri" data-kf-fechar autofocus>Fechar</button>`;
    abrirDialogo({ titulo: ok ? 'Mensagem enviada' : 'Mensagem guardada', corpo, pe, classe: 'kf-curto', nome: 'feedback-resultado',
      aoMontar: d => { const c = $('[data-kf-copiar]', d); if (c) c.onclick = () => copiar(textoDoRegistro(dados), 'Mensagem copiada.'); } });
  }

  /* ================= Sobre o aplicativo e privacidade ================= */
  function irmaos() {
    // os apps ficam lado a lado no mesmo endereço: …github.io/conta-facil/, …/eletrica-facil/, …/estudo-facil/
    const partes = location.pathname.split('/');
    const i = partes.indexOf(C.app);
    if (i < 0) return [];
    const base = partes.slice(0, i).join('/') + '/';
    return FAMILIA.filter(f => f.app !== C.app).map(f => ({ ...f, url: base + f.app + '/' }));
  }
  function itensPrivacidade() {
    const l = [...(C.privacidade || [])];
    l.push('Sincronização entre aparelhos (opcional): quando você liga, os dados vão para um gist secreto da sua conta GitHub, criptografados neste aparelho (AES-256) com uma chave que sai do seu código de acesso. Só os seus aparelhos conseguem ler.');
    l.push('Avaliações e relatos de problema (opcionais): só o que você escreve no formulário, com o app, a versão e, se você permitir, informações técnicas do aparelho, vai para o banco de dados do projeto no Firebase (Google) e é apagado depois de 2 anos. O contato só vai se você preencher.');
    l.push('Sem anúncios, sem rastreamento de uso e sem venda de dados.');
    return l;
  }
  function sobreHTML() {
    const outros = irmaos();
    return `<div class="kf-sobre-cab"><img src="${esc(C.icone)}" alt="" width="56" height="56"><div><b>${esc(C.nome)}</b><span>Versão ${esc(C.versao)}</span></div></div>
      ${C.resumo ? `<p class="kf-texto">${esc(C.resumo)}</p>` : ''}
      <div class="kf-aviso kf-alerta">${IC.info}<p><b>Versão em testes.</b> O app ainda está em desenvolvimento, sem cobrança: telas e funções podem mudar. Guarde uma cópia dos dados importantes.</p></div>
      <h3 class="kf-sub">Termos e políticas</h3>
      <dl class="kf-dados"><div><dt>Termos de uso</dt><dd>Ainda não publicados: o app está em fase de testes.</dd></div>
        <div><dt>Privacidade</dt><dd>O resumo de como o app trata os seus dados está em <b>Privacidade e segurança</b>.</dd></div></dl>
      ${novidadesDaVersao() ? `<h3 class="kf-sub">Novidades desta versão</h3>${listaNovidades(novidadesDaVersao())}` : ''}
      ${apoioAtivo() ? `<h3 class="kf-sub">Apoie o criador</h3><p class="kf-ajuda">O ${esc(C.nome)} é gratuito. Gostando do app? Pague um chopp para o criador!</p><button type="button" class="kf-btn kf-sec" data-kf="apoio">${IC.chopp}Pagar um chopp</button>` : ''}
      ${outros.length ? `<h3 class="kf-sub">Outros apps da família</h3><ul class="kf-apps">${outros.map(f => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener"><b>${esc(f.nome)}</b><span>${esc(f.resumo)}</span>${IC.externo}</a></li>`).join('')}</ul>` : ''}
      <p class="kf-rodape">${esc(C.nome)} ${esc(C.versao)} · Kit Fácil ${VERSAO}</p>`;
  }
  function abrirSobre() {
    abrirDialogo({ titulo: 'Sobre o aplicativo', nome: 'sobre',
      corpo: `${sobreHTML()}<h3 class="kf-sub">Seus dados e sua privacidade</h3><ul class="kf-lista">${itensPrivacidade().map(t => `<li>${esc(t)}</li>`).join('')}</ul>`,
      pe: `<button type="button" class="kf-btn kf-pri" data-kf-fechar>Fechar</button>` });
  }
  /* bloco antigo da tela de Ajustes (mantido para quem ainda usa) */
  function ajudaHTML() { return escolhasHTML(); }

  /* ================= tema: automático, claro ou escuro (vale só neste aparelho) ================= */
  const TEMAS = [['auto', 'Automático'], ['claro', 'Claro'], ['escuro', 'Escuro']];
  const tema = {
    chave: '', cores: { claro: '#FFFFFF', escuro: '#000000' }, valor: 'auto', ouvindo: false,
    iniciar({ chave, cores }) {
      this.chave = chave; if (cores) this.cores = cores;
      const p = ler(chave, {}) || {};
      this.valor = ['auto', 'claro', 'escuro'].includes(p.tema) ? p.tema : 'auto';
      this.aplicar();
      if (!this.ouvindo) {
        this.ouvindo = true;
        try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (this.valor === 'auto') this.aplicar(); }); } catch {}
      }
    },
    escuro() { return this.valor === 'escuro' || (this.valor === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); },
    aplicar() {
      const r = document.documentElement;
      if (this.valor === 'claro') r.setAttribute('data-theme', 'light'); else if (this.valor === 'escuro') r.setAttribute('data-theme', 'dark'); else r.removeAttribute('data-theme');
      $$('meta[name="theme-color"]').forEach(m => m.remove());
      const m = document.createElement('meta'); m.name = 'theme-color'; m.content = this.escuro() ? this.cores.escuro : this.cores.claro; document.head.appendChild(m);
    },
    definir(v) {
      if (!['auto', 'claro', 'escuro'].includes(v)) return;
      this.valor = v;
      const p = ler(this.chave, {}) || {}; p.tema = v; gravar(this.chave, p);
      this.aplicar();
      $$('[data-kf="tema"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      resumoAjustes('aparencia', this.nome());
    },
    nome() { return { auto: 'Automático, segue o aparelho', claro: 'Claro', escuro: 'Escuro' }[this.valor]; },
    seletorHTML() {
      return `<div class="kf-seg" role="group" aria-label="Tema">${TEMAS.map(([k, l]) => `<button type="button" data-kf="tema" data-v="${k}" aria-pressed="${this.valor === k}">${l}</button>`).join('')}</div>
        <p class="kf-ajuda">No automático, o app segue o tema do aparelho. Vale só para este aparelho.</p>`;
    },
  };

  /* ================= instalar na tela de início ================= */
  let pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pedidoInstalar = e; $$('[data-kf-instalar-bloco]').forEach(el => { el.outerHTML = instalarHTML(); }); });
  function instalarHTML() {
    if (instalado()) return '';
    return `<div data-kf-instalar-bloco class="kf-pilha">${pedidoInstalar ? `<p class="kf-ajuda">Abre como aplicativo, em tela cheia, e funciona sem internet.</p><button type="button" class="kf-btn kf-pri" data-kf="instalar">${IC.celular}Instalar o ${esc(C.nome)}</button>`
      : ehIOS() ? `<p class="kf-ajuda">No iPhone, abra este endereço no Safari, toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</p>`
      : `<p class="kf-ajuda">Abre como aplicativo e funciona sem internet. No Android, use <b>Instalar app</b> no menu do Chrome. No computador, use o ícone de instalar na barra de endereço.</p>`}</div>`;
  }
  async function instalar() {
    const e = pedidoInstalar; if (!e) return;
    pedidoInstalar = null;
    try { e.prompt(); await e.userChoice; } catch {}
    $$('[data-kf-instalar-bloco]').forEach(el => { el.outerHTML = instalarHTML(); });
  }

  /* ================= cópia de segurança, armazenamento e apagar dados ================= */
  /* formato padrão: { formato: 'copia-facil', app, esquema, versaoApp, em, dados } */
  function copiaEnvelope(dados, esquema = 1) {
    return { formato: 'copia-facil', app: C.app, esquema, versaoApp: C.versao, em: new Date().toISOString(), dados };
  }
  function baixar(nome, blob) {
    try {
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return true;
    } catch { avisar('Não foi possível baixar o arquivo neste navegador.'); return false; }
  }
  function baixarCopia(dados, esquema) {
    const d = new Date(), dia = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const ok = baixar(`${C.app}-copia-${dia}.json`, new Blob([JSON.stringify(copiaEnvelope(dados, esquema), null, 1)], { type: 'application/json' }));
    if (ok) avisar('Cópia baixada.');
    return ok;
  }
  /* lê um arquivo de cópia: devolve o envelope padrão, { antigo: json } para formatos antigos, ou null */
  async function lerCopia(arquivo, { antigos = false } = {}) {
    let j; try { j = JSON.parse(await arquivo.text()); } catch { return null; }
    if (j && j.formato === 'copia-facil' && j.app === C.app && j.dados) return j;
    return antigos && j && typeof j === 'object' ? { antigo: j } : null;
  }
  const prefixosApp = () => [C.prefixo, `kitfacil.${C.app}.`];
  const prefixosFamilia = () => [...FAMILIA.map(f => f.prefixo), 'kitfacil.', C.prefixo];
  function bytesDe(prefixos) {
    let n = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (prefixos.some(p => k.startsWith(p))) n += (k.length + (localStorage.getItem(k) || '').length) * 2;
      }
    } catch {}
    return n;
  }
  const tamanho = n => n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1).replace('.', ',')} MB`;
  function armazenamentoHTML() {
    const meu = bytesDe(prefixosApp()), todos = bytesDe(prefixosFamilia());
    return `<p class="kf-ajuda">O ${esc(C.nome)} ocupa <b>${tamanho(meu)}</b> neste navegador. Os apps do projeto dividem o mesmo espaço, de cerca de 5 MB, e juntos usam ${tamanho(todos)}.</p>`;
  }
  let apagando = false;
  function apagarDadosDoAparelho() {
    const S = syncAtual, nuvem = S && S.ligada();
    confirmar({ titulo: 'Apagar os dados deste aparelho?', ok: 'Apagar deste aparelho', perigo: true,
      texto: `Tudo o que o ${C.nome} guardou neste navegador sai daqui${C.exemploDados ? `: ${C.exemploDados}` : ''}, além das preferências. ${nuvem ? 'A cópia na nuvem e os outros aparelhos continuam como estão. Para trazer os dados de volta, conecte a sincronização de novo.' : 'Sem a sincronização ligada, isso não tem volta: baixe uma cópia de segurança antes, se quiser.'}`,
      aoConfirmar: () => {
        apagando = true;
        if (S) S._parar();
        const pre = prefixosApp(), chaves = [];
        try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (pre.some(p => k.startsWith(p))) chaves.push(k); } } catch {}
        chaves.forEach(k => { try { localStorage.removeItem(k); } catch {} });
        try { sessionStorage.clear(); } catch {}
        location.replace(location.pathname + location.search);
      } });
  }

  /* ================= área superior direita: Ajustes, nuvem e balão ================= */
  /* Estado da nuvem, igual nos três apps: nunca mostra "sincronizado" com alterações pendentes ou com falha. */
  const ESTADOS = {
    sincronizado: { rotulo: 'Sincronizado', selo: '<path d="M3.2 6.3 5.2 8.3 8.9 4.3"/>' },
    sincronizando: { rotulo: 'Sincronizando', selo: '<path d="M9 6a3 3 0 1 1-.9-2.1"/><path d="M8.6 1.6v2.6H6"/>' },
    pendente: { rotulo: 'Alterações a enviar', selo: '<path d="M6 9.2V3.4M3.7 5.6 6 3.3l2.3 2.3"/>' },
    erro: { rotulo: 'Erro na sincronização', selo: '<path d="M6 2.8v4"/><path d="M6 9.1v.2"/>' },
    offline: { rotulo: 'Sem internet', selo: '' },
    desligada: { rotulo: 'Sincronização desligada', selo: '<path d="M3.3 6h5.4"/>' },
  };
  function estadoNuvem() {
    const S = syncAtual;
    if (!S || !S.ligada()) return 'desligada';
    const s = S.situacao();
    if (s === 'busy') return 'sincronizando';
    if (s === 'offline' || navigator.onLine === false) return 'offline';
    if (s === 'error') return 'erro';
    if (S.estado.sujo || !S.estado.lastSync) return 'pendente';
    return 'sincronizado';
  }
  function detalheNuvem(e = estadoNuvem()) {
    const S = syncAtual;
    return {
      sincronizado: `Tudo sincronizado ${S && S.estado.lastSync ? haQuanto(S.estado.lastSync) : ''}. Os seus aparelhos têm os mesmos dados.`,
      sincronizando: 'Enviando e recebendo as alterações dos seus aparelhos.',
      pendente: 'Há alterações deste aparelho esperando para ir para a nuvem. Elas sobem em instantes.',
      erro: S ? S.textoErro() : 'Não foi possível sincronizar.',
      offline: 'Sem conexão com a internet. As alterações ficam guardadas neste aparelho e sobem quando a conexão voltar.',
      desligada: `Os dados ficam só neste aparelho. Ligue a sincronização para usar o ${C.nome} no celular, no tablet e no computador.`,
    }[e];
  }
  function iconeNuvem(e) {
    const sel = ESTADOS[e].selo;
    return `<svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true">${P.nuvem}${e === 'offline' ? '<path d="M3.5 3.5l17 17"/>' : ''}</svg>${sel ? `<span class="kf-selo" aria-hidden="true"><svg viewBox="0 0 12 12">${sel}</svg></span>` : ''}`;
  }
  function botaoNuvem() {
    const e = estadoNuvem(), r = ESTADOS[e].rotulo;
    return `<button type="button" class="kf-topo-btn kf-nuvem" data-kf="nuvem" data-kf-nuvem data-estado="${e}" aria-label="${esc(`Sincronização: ${r}. Ver detalhes`)}" title="${esc(`Sincronização: ${r}`)}">${iconeNuvem(e)}</button>`;
  }
  /* Área superior, igual nos três apps: chopp · nuvem · balão.
     o = { principal: true } nas telas principais (mostra o chopp); { principal: false } nas telas internas (só nuvem e balão).
     O antigo { ajustes: true/false } continua valendo como principal/interna. Ajustes fica na navegação (KitFacil.nav.ajustes). */
  function topoHTML(o = {}) {
    const principal = o.principal != null ? !!o.principal : o.ajustes !== false;
    return `<div class="kf-topo" data-kf-topo>${principal && apoioAtivo() ? botaoApoio() : ''}<span class="kf-topo-par">${botaoNuvem()}<button type="button" class="kf-topo-btn${fila.quantos() ? ' kf-com-pendente' : ''}" data-kf="feedback" aria-label="Avaliação e feedback" title="Avaliação e feedback">${IC.balao}<span class="kf-ponto" aria-hidden="true"></span></button></span></div>`;
  }
  function atualizarTopo() {
    const e = estadoNuvem(), r = ESTADOS[e].rotulo, det = detalheNuvem(e);
    $$('[data-kf-nuvem]').forEach(b => {
      if (b.dataset.estado !== e) { b.dataset.estado = e; b.innerHTML = iconeNuvem(e); }
      b.setAttribute('aria-label', `Sincronização: ${r}. Ver detalhes`); b.title = `Sincronização: ${r}`;
    });
    $$('[data-kf-sync-status]').forEach(el => { el.textContent = det; el.classList.toggle('kf-ruim', e === 'erro'); });
    const ult = syncAtual && syncAtual.estado.lastSync ? maiuscula(haQuanto(syncAtual.estado.lastSync)) : 'Nunca';
    $$('[data-kf-ultima]').forEach(el => { el.textContent = ult; });
    $$('[data-kf-estado-nuvem]').forEach(el => { if (el.dataset.estado !== e || el.dataset.det !== det) el.outerHTML = estadoNuvemHTML(); });
    const em = !!(C.emAjustes && C.emAjustes());
    $$('[data-kf="ajustes"]').forEach(b => { b.setAttribute('aria-current', em ? 'page' : 'false'); if (b.getAttribute('role') === 'tab') b.setAttribute('aria-selected', String(em)); });
    $$('[data-kf="feedback"]').forEach(b => b.classList.toggle('kf-com-pendente', !!fila.quantos()));
    resumoAjustes('sincronizacao', resumoSincronizacao());
    resumoAjustes('conta', resumoConta());
    if (atual && atual.nome === 'nuvem' && document.contains(atual.dlg)) pintarDialogoNuvem(atual.dlg);
  }
  function estadoNuvemHTML() {
    const e = estadoNuvem(), det = detalheNuvem(e);
    return `<div class="kf-estado" data-kf-estado-nuvem data-estado="${e}" data-det="${esc(det)}" role="status"><span class="kf-nuvem kf-estado-ic" data-estado="${e}">${iconeNuvem(e)}</span><div><b>${ESTADOS[e].rotulo}</b><p>${esc(det)}</p></div></div>`;
  }
  function pintarDialogoNuvem(d) {
    const S = syncAtual, e = estadoNuvem(), est = S ? S.estado : {};
    const linhas = [
      ['Conta', S && S.ligada() ? `GitHub @${est.login}` : 'Não conectada'],
      ['Última sincronização', est.lastSync ? maiuscula(haQuanto(est.lastSync)) : 'Nunca'],
      ['Este aparelho', !S || !S.ligada() ? 'Os dados ficam só aqui' : est.sujo || !est.lastSync ? 'Tem alterações esperando envio' : 'Nada pendente'],
    ];
    $('.kf-dlg-corpo', d).innerHTML = `${estadoNuvemHTML()}<dl class="kf-dados">${linhas.map(([a, b]) => `<div><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
    const principal = e === 'desligada' ? `<button type="button" class="kf-btn kf-pri" data-kf="sync-ativar">Ativar sincronização</button>`
      : est.err === 'auth' ? `<button type="button" class="kf-btn kf-pri" data-kf="sync-ativar">Colar chave nova</button>`
      : e === 'sincronizando' ? `<button type="button" class="kf-btn kf-pri" data-kf-fechar>Fechar</button>`
      : `<button type="button" class="kf-btn kf-pri" data-kf="sync-agora">${e === 'erro' || e === 'offline' ? 'Tentar de novo' : 'Sincronizar agora'}</button>`;
    const pe = $('.kf-dlg-pe', d), foco = pe.contains(document.activeElement);
    pe.innerHTML = `<button type="button" class="kf-btn kf-sec" data-kf="ajustes-sincronizacao">Ver nos Ajustes</button>${principal}`;
    if (foco) { const b = $('.kf-btn.kf-pri', pe); if (b) b.focus({ preventScroll: true }); }
  }
  function abrirDialogoNuvem() {
    abrirDialogo({ titulo: 'Sincronização', classe: 'kf-curto', nome: 'nuvem', corpo: '', pe: '<span></span>', aoMontar: d => pintarDialogoNuvem(d) });
  }
  function irAjustes(secao) {
    if (typeof C.abrirAjustes === 'function') C.abrirAjustes(secao);
    if (secao) requestAnimationFrame(() => abrirSecao(secao));
  }

  /* ================= navegação: item Ajustes ================= */
  /* Ajustes fica na navegação: último item da barra de baixo (celular e tablet) e do trilho lateral (computador).
     tipo 'nav' ou 'trilho'; o = { role: 'tab' } quando a navegação do app é uma lista de abas (tablist). */
  function navAjustesHTML(tipo = 'nav', o = {}) {
    const em = !!(C.emAjustes && C.emAjustes());
    const role = o.role ? ` role="${esc(o.role)}"${o.role === 'tab' ? ` aria-selected="${em}"` : ''}` : '';
    const id = o.id ? ` id="${esc(o.id)}"` : '';
    return tipo === 'trilho'
      ? `<button type="button" class="kf-trilho-it kf-trilho-ajustes" data-kf="ajustes"${id}${role} aria-current="${em ? 'page' : 'false'}">${IC.ajustes}<span>Ajustes</span></button>`
      : `<button type="button" class="kf-nav-it" data-kf="ajustes"${id}${role} aria-current="${em ? 'page' : 'false'}"><span class="kf-nav-ic">${IC.ajustes}</span><span class="kf-nav-l">Ajustes</span></button>`;
  }

  /* ================= apoio ao criador: "Pague um chopp para o criador!" ================= */
  const apoioAtivo = () => !!(C.apoio && String(C.apoio.chave || '').trim());
  const botaoApoio = () => `<button type="button" class="kf-topo-btn kf-chopp" data-kf="apoio" aria-label="Pague um chopp para o criador" title="Pague um chopp para o criador">${IC.chopp}</button>`;
  /* código Pix copia e cola (BR Code, padrão EMV do Banco Central), sem valor: quem paga escolhe quanto */
  const semAcento = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 .\-]/g, '').trim();
  const campo = (id, v) => id + String(v.length).padStart(2, '0') + v;
  function crc16(t) {
    let c = 0xFFFF;
    for (let i = 0; i < t.length; i++) { c ^= t.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; }
    return c.toString(16).toUpperCase().padStart(4, '0');
  }
  function codigoPix({ chave, nome, cidade, txid = '***' } = C.apoio) {
    const conta = campo('00', 'br.gov.bcb.pix') + campo('01', String(chave).trim());
    const corpo = campo('00', '01') + campo('26', conta) + campo('52', '0000') + campo('53', '986') + campo('58', 'BR')
      + campo('59', (semAcento(nome).toUpperCase() || 'CRIADOR').slice(0, 25)) + campo('60', (semAcento(cidade).toUpperCase() || 'BRASIL').slice(0, 15))
      + campo('62', campo('05', txid)) + '6304';
    return corpo + crc16(corpo);
  }
  let qrPromessa = null;
  function carregarQR() {
    if (global.qrcode) return Promise.resolve(global.qrcode);
    if (!qrPromessa) qrPromessa = new Promise((ok, falhou) => {
      const s = document.createElement('script'); s.src = QR_LIB; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = () => global.qrcode ? ok(global.qrcode) : falhou(new Error('qr')); s.onerror = () => { qrPromessa = null; falhou(new Error('qr')); };
      document.head.appendChild(s);
    });
    return qrPromessa;
  }
  function abrirApoio() {
    if (!apoioAtivo()) return;
    const codigo = codigoPix();
    abrirDialogo({ titulo: 'Pague um chopp para o criador!', classe: 'kf-curto kf-apoio', nome: 'apoio',
      corpo: `<p class="kf-texto">Gostando do ${esc(C.nome)}? O app é gratuito e feito por uma pessoa só. Se ele ajuda você, pague um chopp para o criador pelo Pix. Qualquer valor ajuda.</p>
        <div class="kf-qr" data-kf-qr role="img" aria-label="QR code do Pix do criador"><span class="kf-carregando">Preparando o QR code…</span></div>
        <p class="kf-ajuda">Abra o app do seu banco, escolha <b>Pix</b> e leia o QR code, ou copie o código e cole em <b>Pix copia e cola</b>.</p>
        <p class="kf-ajuda">É opcional: o ${esc(C.nome)} continua igual para todos, pagando ou não.</p>`,
      pe: `<button type="button" class="kf-btn kf-sec" data-kf-pix-chave>${IC.copiar}Copiar chave</button><button type="button" class="kf-btn kf-pri" data-kf-pix-codigo autofocus>${IC.copiar}Copiar código Pix</button>`,
      aoMontar: d => {
        $('[data-kf-pix-codigo]', d).onclick = () => copiar(codigo, 'Código Pix copiado. Cole no app do seu banco.');
        $('[data-kf-pix-chave]', d).onclick = () => copiar(String(C.apoio.chave).trim(), 'Chave Pix copiada.');
        const caixa = $('[data-kf-qr]', d);
        carregarQR().then(qrcode => {
          if (!document.contains(caixa)) return;
          const q = qrcode(0, 'M'); q.addData(codigo); q.make();
          caixa.innerHTML = q.createSvgTag({ cellSize: 4, margin: 3, scalable: true });
        }).catch(() => { if (document.contains(caixa)) caixa.innerHTML = '<span class="kf-ajuda">Sem internet para mostrar o QR code agora. Use o botão Copiar código Pix.</span>'; });
      } });
  }

  /* ================= novidades da versão e boas-vindas no primeiro uso ================= */
  /* novidades: [{ versao: '1.3.0', itens: ['…', '…'] }] em KitFacil.iniciar. A janela aparece uma vez, na primeira
     abertura depois de atualizar; em Sobre o aplicativo a lista fica sempre à mão.
     boasVindas: { novo: () => true se a pessoa nunca usou o app, passos: [[titulo, texto], …], exemplo: () => {…},
     rotuloExemplo: 'Ver exemplo' }: aparece uma vez, só para quem nunca usou o app. Sem passos, só informa quem é novo
     (o app tem a própria tela de primeiro uso) e as novidades não aparecem para essa pessoa. */
  const chaveVisto = () => `kitfacil.${C.app}.visto`;
  const novidadesDaVersao = () => { const n = (C.novidades || []).find(x => x && x.versao === C.versao); return n && Array.isArray(n.itens) && n.itens.length ? n : null; };
  const listaNovidades = n => `<ul class="kf-lista kf-novidades">${n.itens.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  function abrirNovidades() {
    const n = novidadesDaVersao(); if (!n) return false;
    abrirDialogo({ titulo: `Novidades do ${C.nome}`, classe: 'kf-curto', nome: 'novidades',
      corpo: `<p class="kf-texto">O app foi atualizado para a versão ${esc(C.versao)}. O que mudou:</p>${listaNovidades(n)}`,
      pe: `<button type="button" class="kf-btn kf-pri" data-kf-fechar autofocus>Entendi</button>` });
    return true;
  }
  function abrirBoasVindas() {
    const b = C.boasVindas; if (!b) return false;
    const passos = (b.passos || []).filter(x => x && x[0]);
    // app com tela própria de primeiro uso (boasVindas só com "novo"): o kit não abre outra janela por cima
    if (!passos.length) return false;
    abrirDialogo({ titulo: `Boas-vindas ao ${C.nome}`, classe: 'kf-curto kf-boas-vindas', nome: 'boas-vindas',
      corpo: `${C.resumo ? `<p class="kf-texto">${esc(C.resumo)}</p>` : ''}${passos.length ? `<ol class="kf-passos">${passos.map(([t, d]) => `<li><b>${esc(t)}</b>${d ? `<span>${esc(d)}</span>` : ''}</li>`).join('')}</ol>` : ''}
        <p class="kf-ajuda">Os dados ficam neste aparelho. Para usar no celular, no tablet e no computador, ligue a sincronização no ícone da nuvem.</p>`,
      pe: `${b.exemplo ? `<button type="button" class="kf-btn kf-sec" data-kf-exemplo>${esc(b.rotuloExemplo || 'Ver exemplo')}</button>` : ''}<button type="button" class="kf-btn kf-pri" data-kf-fechar autofocus>Começar</button>`,
      aoMontar: d => { const e = $('[data-kf-exemplo]', d); if (e) e.onclick = () => { fecharDialogo(true); try { b.exemplo(); } catch (x) { console.warn(x); } }; } });
    return true;
  }
  function primeiraAbertura(tentativa = 0) {
    if (!C.app) return;
    // nos testes automáticos (navegador controlado) as janelas automáticas só abrem quando o teste pede
    if (navigator.webdriver && !global.KF_TESTE_ABERTURA) return;
    // espera o app terminar de abrir as janelas dele (link de conexão, guia, primeiro uso próprio)
    if ((dialogoAberto() || (C.ocupado && C.ocupado())) && tentativa < 20) { setTimeout(() => primeiraAbertura(tentativa + 1), 1500); return; }
    const visto = ler(chaveVisto(), null);
    gravar(chaveVisto(), C.versao);
    if (visto === C.versao || dialogoAberto()) return;
    let novo = false; try { novo = !!(C.boasVindas && C.boasVindas.novo && C.boasVindas.novo()); } catch {}
    if (visto === null && novo) { abrirBoasVindas(); return; }
    if (visto !== null || !novo) abrirNovidades();
  }

  /* ================= tela de Ajustes em guias ================= */
  /* As guias comuns ficam sempre nesta ordem, com estes nomes e ícones, nos três apps.
     As guias próprias de cada app vêm depois, num grupo com o nome do app. */
  const SECOES = [
    { id: 'conta', titulo: 'Conta e perfil', icone: P.pessoa },
    { id: 'sincronizacao', titulo: 'Sincronização e armazenamento', icone: P.nuvem },
    { id: 'aparencia', titulo: 'Aparência', icone: P.aparencia },
    { id: 'preferencias', titulo: 'Preferências gerais', icone: P.preferencias },
    { id: 'notificacoes', titulo: 'Notificações', icone: P.sino },
    { id: 'privacidade', titulo: 'Privacidade e segurança', icone: P.escudo },
    { id: 'feedback', titulo: 'Avaliação e feedback', icone: P.balao },
    { id: 'sobre', titulo: 'Sobre o aplicativo', icone: P.info },
  ];
  const resumoConta = () => syncAtual && syncAtual.ligada() ? `Sem cadastro · GitHub @${syncAtual.estado.login}` : 'Sem cadastro · dados neste aparelho';
  const resumoSincronizacao = () => syncAtual && syncAtual.ligada() ? ESTADOS[estadoNuvem()].rotulo : 'Desligada · dados só neste aparelho';
  function resumoAjustes(id, texto) { if (texto == null) return; $$(`[data-kf-aj-resumo="${id}"]`).forEach(el => { el.textContent = texto; }); }
  const bloco = (titulo, corpo, classe = '') => corpo ? `<div class="kf-bloco ${classe}">${titulo ? `<h3>${esc(titulo)}</h3>` : ''}${corpo}</div>` : '';
  function conteudoComum(id, o) {
    const S = syncAtual, ligada = S && S.ligada(), extra = (o.extras || {})[id] || '';
    if (id === 'conta') return bloco('Sua conta', ligada
      ? `<p class="kf-texto">Você usa o ${esc(C.nome)} sem criar cadastro. Para sincronizar os seus aparelhos, o app usa a sua conta GitHub <b>@${esc(S.estado.login)}</b>.</p><button type="button" class="kf-btn kf-sec" data-kf-aj-ir="sincronizacao">${IC.nuvem}Gerenciar a sincronização</button>`
      : `<p class="kf-texto">Você usa o ${esc(C.nome)} sem criar cadastro: os dados ficam neste aparelho.</p><p class="kf-ajuda">Para usar o app em vários aparelhos, ligue a sincronização com a sua conta GitHub (gratuita).</p><button type="button" class="kf-btn kf-sec" data-kf="sync-ativar">${IC.nuvem}Ligar a sincronização</button>`) + extra;
    if (id === 'sincronizacao') return bloco('Sincronização entre aparelhos', `${estadoNuvemHTML()}${S ? S.cartaoHTML() : ''}`)
      + bloco('Armazenamento neste aparelho', armazenamentoHTML())
      + (C.copia ? bloco('Cópia de segurança', `<p class="kf-ajuda">${esc(C.copia.descricao || 'Baixe um arquivo com os seus dados e guarde onde quiser.')} ${ligada ? 'Com a sincronização ligada, os dados já ficam na nuvem: a cópia é uma garantia extra.' : 'Sem a sincronização, os dados ficam só neste aparelho: guarde uma cópia de vez em quando.'}</p>
          <div class="kf-acoes"><button type="button" class="kf-btn kf-sec" data-kf="copia-baixar">${IC.baixar}Baixar cópia</button><button type="button" class="kf-btn kf-sec" data-kf="copia-restaurar">${IC.subir}Restaurar cópia</button></div>
          <input type="file" accept=".json,application/json" data-kf-copia-arquivo hidden aria-label="Arquivo da cópia de segurança">`) : '') + extra;
    if (id === 'aparencia') return bloco('Tema', tema.seletorHTML()) + extra;
    if (id === 'preferencias') {
      let zona = ''; try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
      return bloco('Idioma e região', `<dl class="kf-dados"><div><dt>Idioma</dt><dd>Português (Brasil)</dd></div><div><dt>Moeda</dt><dd>Real (R$)</dd></div><div><dt>Data e hora</dt><dd>As do aparelho${zona ? ` (${esc(zona.replace(/_/g, ' '))})` : ''}</dd></div></dl><p class="kf-ajuda">Outros idiomas ainda não estão disponíveis.</p>`)
        + bloco('Usar como aplicativo', instalarHTML() || `<p class="kf-ajuda">O ${esc(C.nome)} já está instalado neste aparelho e funciona sem internet.</p>`) + extra;
    }
    if (id === 'notificacoes') return bloco('Notificações', `<p class="kf-texto">${esc(C.textos.notificacoes || `O ${C.nome} não envia notificações para o aparelho. Os avisos aparecem na tela enquanto o app está aberto.`)}</p>`) + extra;
    if (id === 'privacidade') return bloco('Seus dados', `<ul class="kf-lista">${itensPrivacidade().map(t => `<li>${esc(t)}</li>`).join('')}</ul>`)
      + bloco('Segurança', ligada
        ? `<p class="kf-ajuda">A chave da sincronização fica guardada só neste aparelho e dá acesso apenas aos gists da sua conta. Não envie a chave nem o link de outro aparelho para outras pessoas.</p><button type="button" class="kf-btn kf-sec" data-kf="sync-sair">Desconectar este aparelho</button>`
        : `<p class="kf-ajuda">Nenhuma conta está conectada neste aparelho. Os dados não saem daqui, a não ser quando você compartilha um arquivo ou envia uma avaliação.</p>`)
      + extra
      + bloco('Apagar os dados deste aparelho', `<p class="kf-ajuda">Tira deste navegador tudo o que o ${esc(C.nome)} guardou. Útil antes de devolver ou emprestar o aparelho.</p><button type="button" class="kf-btn kf-perigo-sec" data-kf="apagar-aparelho">${IC.lixo}Apagar dados deste aparelho</button>`);
    if (id === 'feedback') return bloco('', `<p class="kf-texto">Sua mensagem vai direto para quem faz o ${esc(C.nome)}. O balão no alto da tela abre as mesmas opções.</p>${escolhasHTML()}`) + extra;
    if (id === 'sobre') return bloco('', sobreHTML()) + extra;
    return extra;
  }
  function secaoAtiva() { const s = history.state; return s && typeof s.kfAj === 'string' ? s.kfAj : ''; }
  /* o = { extras: { idDaGuia: html }, resumos: { idDaGuia: texto }, produto: [{ id, titulo, icone, resumo, html }] } */
  function ajustesHTML(o = {}) {
    const produto = (o.produto || []).filter(p => p && p.id && p.titulo);
    const todas = [...SECOES, ...produto];
    let ativa = secaoAtiva();
    if (ativa && !todas.some(s => s.id === ativa)) ativa = '';
    const resumos = { conta: resumoConta(), sincronizacao: resumoSincronizacao(), aparencia: tema.nome(), preferencias: 'Idioma, região e instalação',
      notificacoes: 'Sem notificações no aparelho', privacidade: 'Seus dados, segurança e apagar dados', feedback: resumoFeedback(), sobre: `Versão ${C.versao}`, ...(o.resumos || {}) };
    const item = s => `<li><button type="button" class="kf-aj-item" data-kf-aj-ir="${esc(s.id)}" aria-controls="kf-aj-${esc(s.id)}"${s.id === ativa ? ' aria-current="true"' : ''}>
        <span class="kf-aj-ic"><svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true">${s.icone || P.ajustes}</svg></span>
        <span class="kf-aj-tx"><b>${esc(s.titulo)}</b><small data-kf-aj-resumo="${esc(s.id)}">${esc(s.resumo != null ? s.resumo : resumos[s.id] || '')}</small></span>${IC.chev}</button></li>`;
    const secao = (s, corpo) => `<section class="kf-aj-sec${s.id === ativa ? ' kf-aberta' : ''}" id="kf-aj-${esc(s.id)}" data-kf-aj-sec="${esc(s.id)}" aria-labelledby="kf-aj-t-${esc(s.id)}">
        <div class="kf-aj-sec-h"><button type="button" class="kf-aj-voltar" data-kf-aj-voltar>${IC.voltar}Ajustes</button><h2 id="kf-aj-t-${esc(s.id)}" tabindex="-1">${esc(s.titulo)}</h2></div>
        <div class="kf-aj-corpo">${corpo}</div></section>`;
    return `<div class="kf-aj" data-kf-aj data-ativa="${esc(ativa)}">
      <div class="kf-aj-grade">
        <nav class="kf-aj-lista" aria-label="Guias dos Ajustes">
          <h1 class="kf-aj-h">Ajustes</h1>
          <p class="kf-aj-grupo" id="kf-aj-g1">Geral</p>
          <ul aria-labelledby="kf-aj-g1">${SECOES.map(item).join('')}</ul>
          ${produto.length ? `<p class="kf-aj-grupo" id="kf-aj-g2">${esc(C.nome)}</p><ul aria-labelledby="kf-aj-g2">${produto.map(item).join('')}</ul>` : ''}
          <p class="kf-aj-versao">${esc(C.nome)} ${esc(C.versao)}</p>
        </nav>
        <div class="kf-aj-paineis">${SECOES.map(s => secao(s, conteudoComum(s.id, o))).join('')}${produto.map(p => secao(p, p.html || '')).join('')}</div>
      </div></div>`;
  }
  const largo = root => root.getBoundingClientRect().width >= 720;
  function marcarAjustes(root) {
    const ativa = root.dataset.ativa || '';
    const vis = ativa || (largo(root) ? (($('.kf-aj-sec', root) || {}).dataset || {}).kfAjSec : '');
    $$('[data-kf-aj-ir]', root).forEach(b => { if (b.closest('.kf-aj-lista')) { if (b.dataset.kfAjIr === vis) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); } });
    $$('.kf-aj-sec', root).forEach(s => s.classList.toggle('kf-aberta', s.dataset.kfAjSec === ativa));
  }
  function abrirSecao(id, { foco = true } = {}) {
    const root = $('[data-kf-aj]');
    if (!root || !$(`[data-kf-aj-sec="${CSS.escape(id)}"]`, root)) return false;
    const muda = root.dataset.ativa !== id;
    root.dataset.ativa = id;
    marcarAjustes(root);
    if (muda) {
      const st = { ...(history.state || {}), kfAj: id };
      if (largo(root)) { delete st.kfAjPush; history.replaceState(st, ''); }
      else { st.kfAjPush = true; history.pushState(st, ''); }
    }
    const sec = $(`[data-kf-aj-sec="${CSS.escape(id)}"]`, root);
    if (!largo(root)) window.scrollTo(0, 0);
    else { const r = sec.getBoundingClientRect(); if (r.top < 0 || r.top > window.innerHeight * .6) sec.scrollIntoView({ block: 'start' }); }
    if (foco) { const h = $('h2', sec); try { h.focus({ preventScroll: true }); } catch {} }
    return true;
  }
  function voltarLista(root) {
    const id = root.dataset.ativa;
    if (history.state && history.state.kfAjPush) { history.back(); return; }
    const st = { ...(history.state || {}) }; delete st.kfAj; delete st.kfAjPush;
    history.replaceState(st, '');
    root.dataset.ativa = ''; marcarAjustes(root); window.scrollTo(0, 0);
    const b = $(`.kf-aj-lista [data-kf-aj-ir="${CSS.escape(id || '')}"]`, root); if (b) b.focus({ preventScroll: true });
  }
  window.addEventListener('popstate', () => {
    const root = $('[data-kf-aj]'); if (!root) return;
    const antes = root.dataset.ativa;
    root.dataset.ativa = secaoAtiva(); marcarAjustes(root);
    if (antes && !root.dataset.ativa) { const b = $(`.kf-aj-lista [data-kf-aj-ir="${CSS.escape(antes)}"]`, root); if (b) b.focus({ preventScroll: true }); }
  });
  window.addEventListener('resize', () => { const root = $('[data-kf-aj]'); if (root) marcarAjustes(root); });
  /* depois de desenhar a tela de Ajustes, o app chama ajustes.ligar(raiz) */
  function ligarAjustes(root = document) {
    const r = root.matches && root.matches('[data-kf-aj]') ? root : $('[data-kf-aj]', root);
    if (r) marcarAjustes(r);
  }

  /* ================= sincronização entre aparelhos ================= */
  /* Os dados vão para um gist secreto da conta GitHub do usuário, criptografados no aparelho (AES-GCM 256,
     chave derivada do código de acesso com PBKDF2). Cada app decide como junta os dados (função aplicar);
     o kit cuida da conexão, da criptografia, do envio, do estado da nuvem e dos textos. O formato do arquivo é o mesmo
     das versões anteriores do Elétrica Fácil e do Estudo Fácil, então aparelhos com versões diferentes continuam se entendendo. */
  let syncAtual = null;
  function criarSync(cfg) {
    const ARQ = cfg.app + '.json';
    const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=' + encodeURIComponent(cfg.nome);
    const est = Object.assign({ token: '', gistId: '', login: '', lastSync: 0, err: '', st: {}, del: {}, tipOff: false, sujo: 0 }, ler(cfg.chave, {}) || {});
    if (!est.st || typeof est.st !== 'object') est.st = {};
    if (!est.del || typeof est.del !== 'object') est.del = {};
    let timer = null, ocupado = null, deNovo = false, chaveC = null, pendente = false;
    let situacao = est.err ? (est.err === 'offline' ? 'offline' : 'error') : 'ok';
    const ligada = () => !!est.token && !apagando;
    const salvar = () => { if (!apagando) gravar(cfg.chave, est); };
    const avisa = m => (cfg.toast || avisar)(m);
    /* o app chama agendar() a cada alteração: a nuvem passa a "pendente" até a próxima sincronização dar certo */
    function agendar(ms = 2500) {
      if (!ligada()) return;
      est.sujo = Date.now(); salvar();
      clearTimeout(timer); timer = setTimeout(() => agora(), ms);
      atualizarTopo();
    }

    const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
    const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    async function chaveCripto() {
      if (chaveC && chaveC.t === est.token && chaveC.l === est.login) return chaveC.k;
      const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(est.token), 'PBKDF2', false, ['deriveKey']);
      const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: new TextEncoder().encode(cfg.app + ':' + (est.login || '').toLowerCase()), iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      chaveC = { t: est.token, l: est.login, k };
      return k;
    }
    async function selar(obj) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await chaveCripto(), new TextEncoder().encode(JSON.stringify(obj)));
      return JSON.stringify({ app: cfg.app, v: 1, enc: 'AES-GCM', iv: b64(iv), data: b64(new Uint8Array(data)) });
    }
    async function abrir(texto) {
      let j; try { j = JSON.parse(texto); } catch { throw Object.assign(new Error('formato'), { code: 'format' }); }
      if (!j || j.app !== cfg.app || !j.data) throw Object.assign(new Error('formato'), { code: 'format' });
      try {
        const claro = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(j.iv) }, await chaveCripto(), unb64(j.data));
        return JSON.parse(new TextDecoder().decode(claro));
      } catch { throw Object.assign(new Error('chave'), { code: 'key' }); }
    }
    async function gh(caminho, opt = {}, token = est.token) {
      let r;
      try {
        r = await fetch('https://api.github.com' + caminho, { cache: 'no-store', ...opt,
          headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token, ...(opt.body ? { 'Content-Type': 'application/json' } : {}) } });
      } catch { throw Object.assign(new Error('offline'), { code: 'offline' }); }
      if (r.status === 401) throw Object.assign(new Error('auth'), { code: 'auth' });
      if (r.status === 404) throw Object.assign(new Error('404'), { code: '404' });
      if (!r.ok) throw Object.assign(new Error('http ' + r.status), { code: r.status === 403 ? 'scope' : 'http' });
      return { json: await r.json(), headers: r.headers };
    }
    async function acharGist() {
      for (let pg = 1; pg <= 10; pg++) {
        const { json } = await gh(`/gists?per_page=100&page=${pg}`);
        const g = json.find(x => x.files && x.files[ARQ]);
        if (g) return g.id;
        if (json.length < 100) return '';
      }
      return '';
    }
    async function lerRemoto() {
      const { json } = await gh('/gists/' + est.gistId);
      const f = json.files && json.files[ARQ];
      if (!f) throw Object.assign(new Error('404'), { code: '404' });
      let texto = f.content;
      if (f.truncated) { try { texto = await (await fetch(f.raw_url, { cache: 'no-store' })).text(); } catch { throw Object.assign(new Error('offline'), { code: 'offline' }); } }
      return abrir(texto);
    }
    async function gravarRemoto(obj) {
      const files = { [ARQ]: { content: await selar(obj) } };
      if (est.gistId) {
        try { await gh('/gists/' + est.gistId, { method: 'PATCH', body: JSON.stringify({ files }) }); return; }
        catch (e) { if (e.code !== '404') throw e; }
      }
      const { json } = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: `${cfg.nome} · dados do app, criptografados (não apague)`, public: false, files }) });
      est.gistId = json.id;
    }
    function agora(opts = {}) {
      if (!ligada()) return Promise.resolve(false);
      if (ocupado) { deNovo = true; return ocupado; }
      clearTimeout(timer);
      if (cfg.carimbar) cfg.carimbar();
      const inicio = Date.now();
      ocupado = (async () => {
        definirSituacao('busy');
        let mudou = false, ok = false;
        try {
          if (!est.gistId) est.gistId = await acharGist();
          let remoto = null;
          if (est.gistId) {
            try { remoto = await lerRemoto(); }
            catch (e) {
              if (e.code === '404') est.gistId = '';
              // chave nova (a antiga venceu): a nuvem é regravada com os dados deste aparelho
              else if (e.code === 'key' || e.code === 'format') remoto = null;
              else throw e;
            }
          }
          if (remoto) mudou = !!cfg.aplicar(remoto, { primeira: !est.lastSync });
          const saida = cfg.pacote();
          if (!remoto || !cfg.mesmo(saida, remoto)) await gravarRemoto(saida);
          est.lastSync = Date.now(); est.err = ''; ok = true;
          // o que mudou durante a sincronização continua pendente para a próxima
          if (est.sujo && est.sujo <= inicio) est.sujo = 0;
          salvar();
          definirSituacao('ok');
        } catch (e) {
          est.err = e.code || 'http';
          salvar();
          definirSituacao(est.err === 'offline' ? 'offline' : 'error');
          if (opts.manual) avisa(textoErro());
        }
        salvar();
        if (mudou) aposRemoto(opts.quiet);
        return ok;
      })();
      return ocupado.finally(() => { ocupado = null; if (deNovo) { deNovo = false; agendar(400); } });
    }
    const estaOcupado = () => dialogoAberto() || (cfg.ocupado ? !!cfg.ocupado() : false);
    function aposRemoto(quiet) {
      if (estaOcupado()) { pendente = true; return; }
      pendente = false;
      if (cfg.redesenhar) cfg.redesenhar();
      if (!quiet) avisa('Atualizado com seus outros aparelhos.');
    }
    setInterval(() => { if (pendente && !estaOcupado()) aposRemoto(true); }, 1500);
    function textoErro() {
      return { offline: 'Sem internet agora. Sincroniza quando a conexão voltar.',
        auth: 'A chave do GitHub não vale mais. Crie uma nova e cole em Ajustes, Sincronização e armazenamento.',
        scope: 'A chave do GitHub não tem a permissão gist. Crie outra marcando gist.' }[est.err] || 'Não foi possível sincronizar agora. Tente de novo em instantes.';
    }
    function texto() { return detalheNuvem(); }
    const rotuloCurto = () => ESTADOS[estadoNuvem()].rotulo;
    function definirSituacao(s) {
      situacao = s;
      if (cfg.aoEstado) { try { cfg.aoEstado(estadoNuvem()); } catch (e) { console.warn(e); } }
      atualizarTopo();
    }
    /* chave já usada por outro app da família neste aparelho (os apps dividem o mesmo endereço) */
    function chaveIrma() {
      for (const f of FAMILIA) {
        if (f.app === cfg.app) continue;
        const s = ler(f.prefixo + 'sync', null);
        if (s && s.token && s.login) return { token: s.token, login: s.login, nome: f.nome };
      }
      return null;
    }
    async function conectar(token) {
      token = String(token || '').trim().replace(/\s/g, '');
      if (!/^(ghp_|github_pat_|gho_)\w{20,}$/.test(token)) { avisa('Essa não parece uma chave do GitHub. Ela começa com ghp_.'); return false; }
      let login = '';
      try {
        const { json, headers } = await gh('/user', {}, token);
        const escopos = headers.get('x-oauth-scopes');
        if (escopos !== null && !/\bgist\b/.test(escopos)) { avisa('Essa chave não tem a permissão gist. Crie outra marcando gist.'); return false; }
        login = json.login || '';
      } catch (e) {
        avisa(e.code === 'offline' ? 'Sem internet. Conecte quando estiver on-line.' : 'O GitHub não aceitou essa chave. Confira se copiou inteira.');
        return false;
      }
      const mesma = est.login && est.login.toLowerCase() === login.toLowerCase();
      // trocar a chave na mesma conta mantém o histórico; outra conta começa do zero
      Object.assign(est, { token, login, err: '' }, mesma ? {} : { gistId: '', lastSync: 0 });
      chaveC = null; salvar();
      atualizarTopo();
      const tinha = est.lastSync;
      const ok = await agora({ quiet: true });
      if (ok) avisa(tinha ? 'Chave atualizada.' : (cfg.textoLigada ? cfg.textoLigada() : 'Sincronização ligada. Seus aparelhos agora têm os mesmos dados.'));
      else avisa(textoErro());
      if (cfg.redesenhar) cfg.redesenhar();
      atualizarTopo();
      return true;
    }
    function dialogoConectar() {
      const irma = !ligada() ? chaveIrma() : null;
      abrirDialogo({ titulo: 'Usar em vários aparelhos', classe: 'kf-sync', nome: 'conectar',
        corpo: `${irma ? `<div class="kf-aviso kf-ok">${IC.check}<div><p><b>Você já sincroniza o ${esc(irma.nome)} neste aparelho.</b> Dá para usar a mesma chave, da conta @${esc(irma.login)}. Os dados do ${esc(cfg.nome)} ficam num arquivo separado.</p><button type="button" class="kf-btn kf-pri kf-p" data-kf-irma>Usar a mesma chave</button></div></div>` : ''}
          <ol class="kf-passos">
            <li><b>Crie uma chave de acesso no GitHub</b><span>Na página que vai abrir, em <b>Expiration</b> escolha <b>No expiration</b>. Deixe marcada só a opção <b>gist</b> e toque em <b>Generate token</b>, no fim da página. Se ainda não tem conta no GitHub, crie uma (é gratuita).</span>
              <a class="kf-btn kf-sec kf-p" href="${TOKEN_URL}" target="_blank" rel="noopener">${IC.externo}Abrir o GitHub</a></li>
            <li><b>Copie a chave e cole aqui</b><span>Ela começa com <b>ghp_</b>. A mesma chave serve para os três apps do projeto.</span>
              <input id="kf-token" class="kf-entrada" type="text" placeholder="ghp_…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Chave do GitHub"></li>
            <li><b>Nos outros aparelhos</b><span>Depois de conectar, toque em <b>Outro aparelho</b> para mandar um link para você mesmo, ou cole a mesma chave.</span></li>
          </ol>
          <p class="kf-ajuda">${esc(cfg.dados ? maiuscula(cfg.dados) : 'Os dados')} ficam num gist secreto da sua conta, criptografados com a sua chave. O gist não aparece no seu perfil e só os seus aparelhos conseguem ler.</p>`,
        pe: `<button type="button" class="kf-btn kf-sec" data-kf-fechar>Cancelar</button><button type="button" class="kf-btn kf-pri" data-kf-conectar>Conectar</button>`,
        aoMontar: d => {
          const bt = $('[data-kf-conectar]', d), inp = $('#kf-token', d);
          const ir = async v => {
            bt.disabled = true; bt.textContent = 'Conectando…';
            if (await conectar(v ?? inp.value)) fecharDialogo(true);
            else if (document.contains(bt)) { bt.disabled = false; bt.textContent = 'Conectar'; }
          };
          bt.onclick = () => ir();
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ir(); } });
          const bi = $('[data-kf-irma]', d); if (bi) bi.onclick = () => ir(irma.token);
        } });
    }
    function dialogoLink() {
      const link = `${location.origin}${location.pathname}#/conectar/${encodeURIComponent(est.token)}`;
      abrirDialogo({ titulo: 'Conectar outro aparelho', classe: 'kf-curto', nome: 'link',
        corpo: `<p class="kf-texto">Mande este link para você mesmo e abra no outro aparelho. Ele entra com os mesmos dados.</p>
          <div class="kf-aviso kf-ruim">${IC.alerta}<p><b>O link dá acesso aos seus dados.</b> Não envie para outras pessoas.</p></div>
          <p class="kf-ajuda">Se no outro aparelho o app estiver instalado na tela de início, abra o app, vá em Ajustes, Sincronização e armazenamento, e cole a chave.</p>`,
        pe: `<button type="button" class="kf-btn kf-sec" data-kf-chave>${IC.copiar}Copiar chave</button><button type="button" class="kf-btn kf-pri" data-kf-link>${IC.link}Enviar link</button>`,
        aoMontar: d => {
          $('[data-kf-chave]', d).onclick = () => copiar(est.token, 'Chave copiada.');
          $('[data-kf-link]', d).onclick = async () => {
            const t = `Link para conectar o ${cfg.nome} neste aparelho: ${link}`;
            if (navigator.share) { try { await navigator.share({ text: t }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
            copiar(link, 'Link copiado. Cole numa conversa com você mesmo.');
          };
        } });
    }
    function desconectar() {
      confirmar({ titulo: 'Desconectar este aparelho?', texto: 'Os dados continuam neste aparelho e na nuvem, mas as mudanças deixam de passar de um para o outro.', ok: 'Desconectar', perigo: true,
        aoConfirmar: () => {
          Object.assign(est, { token: '', gistId: '', lastSync: 0, err: '', sujo: 0 }); chaveC = null; salvar();
          situacao = 'ok';
          if (cfg.redesenhar) cfg.redesenhar();
          atualizarTopo();
          avisa('Aparelho desconectado.');
        } });
    }
    function resumo() { return ligada() ? `Ligada · @${est.login}` : 'Desligada · use o app em vários aparelhos'; }
    /* conteúdo do cartão de sincronização da tela de Ajustes (o kit põe o estado da nuvem antes dele) */
    function cartaoHTML() {
      if (!ligada()) return `<p class="kf-ajuda">Conecte sua conta GitHub e tenha ${esc(cfg.dados || 'os mesmos dados')} no celular, no tablet e no computador. O que você muda num aparelho aparece nos outros.</p>
        ${cfg.observacao ? `<p class="kf-ajuda">${esc(cfg.observacao)}</p>` : ''}
        <button type="button" class="kf-btn kf-pri" data-kf="sync-ativar">${IC.nuvem}Ativar sincronização</button>`;
      return `<dl class="kf-dados"><div><dt>Conta</dt><dd>GitHub <b>@${esc(est.login)}</b>${est.err === 'auth' ? ' · <b class="kf-ruim">parada</b>' : ''}</dd></div>
          <div><dt>Última sincronização</dt><dd data-kf-ultima>${est.lastSync ? esc(maiuscula(haQuanto(est.lastSync))) : 'Nunca'}</dd></div></dl>
        <p class="kf-so-leitor" data-kf-sync-status aria-live="polite">${esc(texto())}</p>
        ${cfg.observacao ? `<p class="kf-ajuda">${esc(cfg.observacao)}</p>` : ''}
        ${est.err === 'auth' ? `<button type="button" class="kf-btn kf-pri" data-kf="sync-ativar">Colar chave nova</button>` : ''}
        <div class="kf-acoes"><button type="button" class="kf-btn kf-sec" data-kf="sync-agora">${IC.atualizar}Sincronizar agora</button><button type="button" class="kf-btn kf-sec" data-kf="sync-link">${IC.celular}Outro aparelho</button></div>
        <button type="button" class="kf-btn kf-link" data-kf="sync-sair">Desconectar este aparelho</button>`;
    }
    /* link "Conectar outro aparelho": a chave vem depois do #, que não sai do aparelho */
    function tokenDoLink() {
      const m = location.hash.match(/^#\/conectar\/(.+)$/);
      if (!m) return '';
      try { return decodeURIComponent(m[1]); } catch { return ''; }
    }
    function iniciarSync({ token = '', silencioso = true, textoConfirmar } = {}) {
      if (token && token !== est.token) confirmar({ titulo: 'Conectar este aparelho?', texto: textoConfirmar || 'Os dados deste aparelho se juntam aos da nuvem.', ok: 'Conectar', aoConfirmar: () => conectar(token) });
      else if (token) avisa('Este aparelho já está conectado.');
      else if (ligada()) agora({ quiet: silencioso });
    }
    function parar() { clearTimeout(timer); timer = null; }
    document.addEventListener('visibilitychange', () => {
      if (!ligada()) return;
      if (document.visibilityState === 'visible') { if (Date.now() - (est.lastSync || 0) > 10000) agora({ quiet: false }); }
      else if (timer) agora();
    });
    window.addEventListener('online', () => { if (ligada()) agora(); });
    window.addEventListener('storage', e => { if (e.key === cfg.chave) { const n = ler(cfg.chave, {}) || {}; Object.assign(est, n); chaveC = null; atualizarTopo(); } });
    setInterval(() => { if (ligada() && document.visibilityState === 'visible' && !ocupado) agora(); }, 60000);
    setInterval(() => { if ($('[data-kf-estado-nuvem]') || (atual && atual.nome === 'nuvem')) atualizarTopo(); }, 30000);
    const api = { estado: est, ligada, salvar, agendar, agora, situacao: () => situacao, texto, rotuloCurto, resumo, cartaoHTML,
      dialogoConectar, dialogoLink, desconectar, conectar, tokenDoLink, iniciar: iniciarSync, textoErro, _parar: parar };
    syncAtual = api;
    return api;
  }

  /* ================= ações dos botões do kit (data-kf="…") ================= */
  document.addEventListener('click', e => {
    if (!e.target.closest) return;
    const ir = e.target.closest('[data-kf-aj-ir]');
    if (ir) { e.preventDefault(); abrirSecao(ir.dataset.kfAjIr); return; }
    const vo = e.target.closest('[data-kf-aj-voltar]');
    if (vo) { e.preventDefault(); const root = vo.closest('[data-kf-aj]'); if (root) voltarLista(root); return; }
    const b = e.target.closest('[data-kf]');
    if (!b) return;
    const a = b.dataset.kf;
    const S = syncAtual;
    const acoes = {
      avaliar: () => abrirFeedback({ tipo: 'avaliar' }),
      problema: () => abrirFeedback({ tipo: 'problema' }),
      feedback: () => abrirEscolhaFeedback(),
      nuvem: () => abrirDialogoNuvem(),
      ajustes: () => {
        // na navegação, tocar em Ajustes já aberto volta para a lista de guias (como qualquer item da barra)
        if (b.closest('.kf-nav,.kf-trilho') && C.emAjustes && C.emAjustes()) { const root = $('[data-kf-aj]'); if (root && root.dataset.ativa && !largo(root)) voltarLista(root); return; }
        if (typeof C.abrirAjustes === 'function') C.abrirAjustes();
      },
      apoio: () => abrirApoio(),
      novidades: () => abrirNovidades(),
      'ajustes-sincronizacao': () => { fecharDialogo(true); irAjustes('sincronizacao'); },
      sobre: () => abrirSobre(),
      tema: () => tema.definir(b.dataset.v),
      instalar: () => instalar(),
      'sync-ativar': () => S && S.dialogoConectar(),
      'sync-agora': async () => { if (S && await S.agora({ manual: true, quiet: true })) avisar('Tudo sincronizado.'); },
      'sync-link': () => S && S.dialogoLink(),
      'sync-sair': () => S && S.desconectar(),
      'copia-baixar': () => { if (C.copia && C.copia.baixar) C.copia.baixar(); },
      // o ouvinte vai direto no campo: se o app redesenhar a tela enquanto o seletor de arquivos está aberto
      // (no celular a página fica escondida), o campo antigo sai da página e o aviso não chegaria ao documento
      'copia-restaurar': () => { const i = b.closest('.kf-bloco') && $('[data-kf-copia-arquivo]', b.closest('.kf-bloco')); if (i) { i.addEventListener('change', aoEscolherCopia); i.click(); } },
      'apagar-aparelho': () => apagarDadosDoAparelho(),
    };
    if (!acoes[a]) return;
    e.preventDefault();
    acoes[a]();
  });
  function aoEscolherCopia(e) {
    if (e.kfCopia) return; // o mesmo aviso pode passar pelo campo e pelo documento
    e.kfCopia = true;
    const i = e.target, f = i.files && i.files[0]; i.value = '';
    if (f && C.copia && C.copia.restaurar) C.copia.restaurar(f);
  }
  document.addEventListener('change', e => { const i = e.target; if (i && i.matches && i.matches('[data-kf-copia-arquivo]')) aoEscolherCopia(e); });

  global.KitFacil = Object.freeze({
    VERSAO, FAMILIA, IC, iniciar, avisar, esc, canon, novoId, haQuanto,
    dialogo: { abrir: abrirDialogo, fechar: fecharDialogo, aberto: dialogoAberto, confirmar },
    copiar,
    feedback: { abrir: abrirFeedback, escolha: abrirEscolhaFeedback, pendentes: () => fila.quantos(), reenviar: () => fila.tentar(), _enviar: enviarRegistro, _fila: fila, _campos: camposFS, CATEGORIAS, GRAVIDADES },
    sobre: { abrir: abrirSobre },
    ajudaHTML,
    topo: { html: topoHTML, atualizar: atualizarTopo, estado: estadoNuvem, ESTADOS },
    nav: { ajustes: navAjustesHTML },
    apoio: { abrir: abrirApoio, ativo: apoioAtivo, codigo: codigoPix },
    novidades: { abrir: abrirNovidades, daVersao: novidadesDaVersao },
    boasVindas: { abrir: abrirBoasVindas },
    nuvem: { abrir: abrirDialogoNuvem, estado: estadoNuvem, detalhe: detalheNuvem },
    ajustes: { SECOES, html: ajustesHTML, ligar: ligarAjustes, abrir: abrirSecao, ir: irAjustes, resumo: resumoAjustes },
    tema,
    instalarHTML,
    copia: { envelope: copiaEnvelope, baixar: baixarCopia, ler: lerCopia },
    armazenamento: { bytes: () => bytesDe(prefixosApp()), apagar: apagarDadosDoAparelho },
    sync: { criar: criarSync },
  });
})(window);
