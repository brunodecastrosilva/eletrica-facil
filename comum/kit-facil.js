/* Kit Fácil · padrão comum do Projeto Integrador (Conta Fácil, Elétrica Fácil, Estudo Fácil).
   A mesma cópia fica na pasta comum/ dos três repositórios. Para mudar: altere uma cópia, copie para as
   outras duas e rode `npm run verificar` em cada repositório (o MANIFESTO.json acusa cópias diferentes).
   Sem dependências e sem etapa de build: script clássico que cria window.KitFacil.

   O que tem aqui:
   - avaliação e feedback (mesmos campos em todos os apps, envio com fila para quando estiver sem internet)
   - Sobre e privacidade (versão, onde ficam os dados, outros apps)
   - tema claro, escuro ou automático
   - sincronização entre aparelhos por um gist secreto e criptografado na conta GitHub do usuário
   - janelas (diálogos) acessíveis, avisos e cópia de segurança em arquivo */
(function (global) {
  'use strict';
  const VERSAO = '1.0.0';

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

  /* ================= utilidades ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ler = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  const canon = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, key) => (o[key] = x[key], o), {}) : x);
  const pad = n => String(n).padStart(2, '0');
  const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
  function novoId() {
    try { if (crypto.randomUUID) return crypto.randomUUID(); } catch {}
    const b = crypto.getRandomValues(new Uint8Array(16));
    return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  const instalado = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch { return false; } };
  const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const svg = p => `<svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const IC = {
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    estrela: '<svg class="kf-i kf-estrela" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>',
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    nuvem: svg('<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z"/>'),
    celular: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>'),
    copiar: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
    link: svg('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
    externo: svg('<path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
    msg: svg('<path d="M20 15.5a2 2 0 0 1-2 2H8.5L4 21V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M8.5 9h7M8.5 12.5h4.5"/>'),
    alerta: svg('<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.1"/>'),
    email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
  };

  /* ================= configuração do app ================= */
  const C = {
    app: '', nome: '', versao: '', resumo: '', icone: 'icons/icon-192.png',
    tela: () => '', toast: null, privacidade: [], suporteEmail: '', feedback: { ...DESTINO_PADRAO },
  };
  let iniciado = false;
  function iniciar(o) {
    Object.assign(C, o || {});
    C.feedback = { ...DESTINO_PADRAO, ...((o && o.feedback) || {}) };
    if (!C.app || !C.nome || !C.versao) console.warn('KitFacil.iniciar: informe app, nome e versao');
    raiz();
    if (!iniciado) {
      iniciado = true;
      capturarErros();
      window.addEventListener('online', () => fila.tentar());
      setTimeout(() => fila.tentar(), 4000);
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
  function abrirDialogo({ titulo, corpo, pe = '', aoMontar, aoFechar, classe = '' }) {
    const origem = atual ? atual.origem : document.activeElement;
    fecharDialogo(true);
    const idT = 'kf-t-' + Math.random().toString(36).slice(2, 8);
    const wrap = document.createElement('div');
    wrap.className = 'kf-ov';
    wrap.innerHTML = `<div class="kf-dlg ${esc(classe)}" role="dialog" aria-modal="true" aria-labelledby="${idT}" tabindex="-1">
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
    atual = { el: wrap, dlg, origem, aoFechar };
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
       mensagem (até 2000), contato? (até 120), tela? (até 60), tecnico? { plataforma, navegador, tela, janela, instalado, idioma, erros },
       enviadoEm (data e hora do aparelho) } */
  const TIPOS = [['elogio', 'Elogio'], ['sugestao', 'Sugestão'], ['critica', 'Crítica'], ['problema', 'Problema']];
  const NOTAS = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Ótimo'];
  const LIM = { mensagem: 2000, contato: 120, tela: 60 };
  const DICAS = {
    '': 'Conte o que achou, o que falta ou o que pode melhorar.',
    elogio: 'O que você mais gosta no app?',
    sugestao: 'Que função ou mudança ajudaria você?',
    critica: 'O que está atrapalhando ou incomodando?',
    problema: 'O que aconteceu? Conte o que estava fazendo e o que esperava que acontecesse.',
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
  async function enviarRegistro(reg) {
    const d = C.feedback || {};
    if (d.tipo !== 'firestore' || !d.projeto || !d.chaveApi) return 'recusado';
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(d.projeto)}/databases/(default)/documents/${encodeURIComponent(d.colecao || 'feedback')}?documentId=${encodeURIComponent(reg.id)}&key=${encodeURIComponent(d.chaveApi)}`;
    let r;
    try { r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: camposFS(reg.dados) }), cache: 'no-store' }); }
    catch { return navigator.onLine === false ? 'offline' : 'falha'; }
    if (r.ok || r.status === 409) return 'ok'; // 409: já tinha chegado numa tentativa anterior
    if (r.status === 400 || r.status === 401 || r.status === 403 || r.status === 404) return 'recusado';
    return 'falha';
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
  const textoPendentes = n => n ? `${plural(n, 'mensagem guardada', 'mensagens guardadas')} neste aparelho, à espera de envio.` : '';
  function pintarPendentes() {
    const n = fila.quantos();
    $$('[data-kf-pendentes]').forEach(el => { el.textContent = textoPendentes(n); el.hidden = !n; });
  }
  function textoDoRegistro(dados) {
    const linhas = [`${C.nome} ${C.versao}`, `Tipo: ${(TIPOS.find(t => t[0] === dados.tipo) || ['', 'Avaliação'])[1]}`];
    if (dados.nota) linhas.push(`Nota: ${dados.nota} de 5 (${NOTAS[dados.nota - 1]})`);
    if (dados.mensagem) linhas.push('', dados.mensagem);
    if (dados.contato) linhas.push('', `Contato: ${dados.contato}`);
    if (dados.tecnico) linhas.push('', `Aparelho: ${dados.tecnico.plataforma}, ${dados.tecnico.navegador}, tela ${dados.tecnico.tela}${dados.tecnico.instalado ? ', app instalado' : ''}`);
    return linhas.join('\n');
  }
  function abrirFeedback(opcoes = {}) {
    const tipo0 = TIPOS.some(t => t[0] === opcoes.tipo) ? opcoes.tipo : '';
    const titulo = tipo0 === 'problema' ? 'Relatar um problema' : `Avaliar o ${C.nome}`;
    const corpo = `<form class="kf-form" id="kf-form" novalidate>
      <p class="kf-texto">${tipo0 === 'problema' ? `Conte o que deu errado no ${esc(C.nome)}. Quanto mais detalhes, mais rápido dá para corrigir.` : `Sua opinião ajuda a melhorar o ${esc(C.nome)}. Leva menos de um minuto.`}</p>
      <fieldset class="kf-campo">
        <legend class="kf-rotulo">Como está sendo usar o app?${tipo0 === 'problema' ? ' <span class="kf-opcional">(opcional)</span>' : ''}</legend>
        <div class="kf-estrelas">${NOTAS.map((n, i) => `<input type="radio" name="kf-nota" id="kf-n${i + 1}" value="${i + 1}" class="kf-so-leitor"><label for="kf-n${i + 1}" title="${n}"><span class="kf-so-leitor">${i + 1} de 5, ${n}</span>${IC.estrela}</label>`).join('')}</div>
        <span class="kf-ajuda" data-kf-nota-txt aria-live="polite">Toque numa estrela para dar sua nota.</span>
      </fieldset>
      <fieldset class="kf-campo">
        <legend class="kf-rotulo">Sobre o que você quer falar?</legend>
        <div class="kf-opcoes">${TIPOS.map(([k, l]) => `<label class="kf-opcao"><input type="radio" name="kf-tipo" value="${k}"${k === tipo0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
      </fieldset>
      <div class="kf-campo">
        <label class="kf-rotulo" for="kf-msg">Sua mensagem</label>
        <textarea id="kf-msg" class="kf-entrada" rows="4" maxlength="${LIM.mensagem}" placeholder="${esc(DICAS[tipo0])}"></textarea>
        <span class="kf-ajuda kf-contador" data-kf-cont aria-live="polite">0 de ${LIM.mensagem} caracteres</span>
      </div>
      <div class="kf-campo">
        <label class="kf-rotulo" for="kf-contato">Contato para resposta <span class="kf-opcional">(opcional)</span></label>
        <input id="kf-contato" class="kf-entrada" type="text" maxlength="${LIM.contato}" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="E-mail ou WhatsApp">
        <span class="kf-ajuda">Preencha só se quiser resposta.</span>
      </div>
      <label class="kf-check"><input type="checkbox" id="kf-tec" checked><span>Enviar informações técnicas: versão do app, tipo de aparelho, navegador e tamanho da tela${tipo0 === 'problema' ? ', e os últimos erros do app' : ''}. Ajudam a resolver problemas.</span></label>
      <details class="kf-det"><summary>O que é enviado e para onde</summary>
        <p class="kf-ajuda">A nota, o tipo, a mensagem, o contato (se você preencher), a versão do app e a tela em que você está, com as informações técnicas se a opção acima estiver marcada. Tudo vai para o banco de dados do projeto no Firebase (Google), usado só para melhorar os apps. Não enviamos seus dados do app, como ${esc(C.exemploDados || 'os registros que você guarda nele')}.</p></details>
      <p class="kf-erro-form" data-kf-erro role="alert" hidden></p>
    </form>`;
    abrirDialogo({ titulo, corpo, classe: 'kf-feedback',
      pe: `<button type="button" class="kf-btn kf-sec" data-kf-fechar>Cancelar</button><button type="submit" form="kf-form" class="kf-btn kf-pri" data-kf-enviar>Enviar</button>`,
      aoMontar: d => {
        const form = $('#kf-form', d), msg = $('#kf-msg', d), cont = $('[data-kf-cont]', d), notaTxt = $('[data-kf-nota-txt]', d), erro = $('[data-kf-erro]', d);
        const nota = () => +((($('input[name="kf-nota"]:checked', d) || {}).value) || 0);
        const tipo = () => (($('input[name="kf-tipo"]:checked', d) || {}).value) || '';
        const pintar = () => {
          const n = nota();
          $$('.kf-estrelas label', d).forEach((l, i) => l.classList.toggle('kf-on', i < n));
          notaTxt.textContent = n ? `${n} de 5: ${NOTAS[n - 1]}` : 'Toque numa estrela para dar sua nota.';
          msg.placeholder = DICAS[tipo()] || DICAS[''];
          erro.hidden = true;
        };
        d.addEventListener('change', e => { if (e.target.name === 'kf-nota' || e.target.name === 'kf-tipo') pintar(); });
        msg.addEventListener('input', () => { cont.textContent = `${msg.value.length} de ${LIM.mensagem} caracteres`; erro.hidden = true; });
        form.addEventListener('submit', async e => {
          e.preventDefault();
          const n = nota(), t = tipo(), texto = msg.value.trim(), contato = $('#kf-contato', d).value.trim();
          const falta = !n && !texto ? 'Dê uma nota ou escreva uma mensagem.' : (t && t !== 'elogio' && !texto) ? 'Escreva uma mensagem contando os detalhes.' : '';
          if (falta) { erro.textContent = falta; erro.hidden = false; (texto ? $('input[name="kf-nota"]', d) : msg).focus(); return; }
          const dados = { esquema: 1, app: C.app, versao: String(C.versao).slice(0, 20), nota: n, tipo: t || 'avaliacao', mensagem: texto.slice(0, LIM.mensagem), enviadoEm: new Date().toISOString() };
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
      ? `<div class="kf-fim"><span class="kf-fim-ic kf-ok">${IC.check}</span><p class="kf-texto"><b>Obrigado! Recebemos sua mensagem.</b></p><p class="kf-texto">${dados.contato ? 'Se precisar, respondemos no contato que você deixou.' : 'Ela vai ajudar a decidir as próximas melhorias.'}</p></div>`
      : `<div class="kf-fim"><span class="kf-fim-ic kf-alerta">${r === 'offline' ? IC.nuvem : IC.alerta}</span>
          <p class="kf-texto"><b>${r === 'offline' ? 'Você está sem internet.' : 'Não foi possível enviar agora.'}</b></p>
          <p class="kf-texto">A mensagem ficou guardada neste aparelho e o app envia sozinho ${r === 'offline' ? 'quando a conexão voltar' : 'numa próxima tentativa'}.</p></div>`;
    const pe = ok ? `<button type="button" class="kf-btn kf-pri" data-kf-fechar autofocus>Fechar</button>`
      : `<button type="button" class="kf-btn kf-sec" data-kf-copiar>${IC.copiar}Copiar mensagem</button>${C.suporteEmail ? `<a class="kf-btn kf-sec" href="mailto:${esc(C.suporteEmail)}?subject=${encodeURIComponent(C.nome + ' ' + C.versao)}&body=${encodeURIComponent(textoDoRegistro(dados))}">${IC.email}Enviar por e-mail</a>` : ''}<button type="button" class="kf-btn kf-pri" data-kf-fechar autofocus>Fechar</button>`;
    abrirDialogo({ titulo: ok ? 'Mensagem enviada' : 'Mensagem guardada', corpo, pe, classe: 'kf-curto',
      aoMontar: d => { const c = $('[data-kf-copiar]', d); if (c) c.onclick = () => copiar(textoDoRegistro(dados), 'Mensagem copiada.'); } });
  }

  /* ================= Sobre e privacidade ================= */
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
    l.push('Avaliações (opcional): só o que você escreve no formulário de avaliação, com a nota, a versão do app e, se você permitir, informações técnicas do aparelho, vai para o banco de dados do projeto no Firebase (Google). O contato só vai se você preencher.');
    l.push('Sem anúncios, sem rastreamento de uso e sem venda de dados.');
    return l;
  }
  function abrirSobre() {
    const outros = irmaos();
    const corpo = `<div class="kf-sobre-cab"><img src="${esc(C.icone)}" alt="" width="56" height="56"><div><b>${esc(C.nome)}</b><span>Versão ${esc(C.versao)}</span></div></div>
      ${C.resumo ? `<p class="kf-texto">${esc(C.resumo)}</p>` : ''}
      <div class="kf-aviso kf-alerta">${IC.info}<p><b>Versão em testes.</b> O app ainda está em desenvolvimento: telas e funções podem mudar. Guarde uma cópia dos dados importantes.</p></div>
      <h3 class="kf-sub">Seus dados e sua privacidade</h3>
      <ul class="kf-lista">${itensPrivacidade().map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      <h3 class="kf-sub">Ajude a melhorar</h3>
      <div class="kf-acoes"><button type="button" class="kf-btn kf-sec" data-kf="avaliar">${IC.estrela}Avaliar o app</button><button type="button" class="kf-btn kf-sec" data-kf="problema">${IC.alerta}Relatar um problema</button></div>
      ${outros.length ? `<h3 class="kf-sub">Outros apps</h3><ul class="kf-apps">${outros.map(f => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener"><b>${esc(f.nome)}</b><span>${esc(f.resumo)}</span>${IC.externo}</a></li>`).join('')}</ul>` : ''}
      <p class="kf-rodape">${esc(C.nome)} ${esc(C.versao)} · Kit Fácil ${VERSAO}</p>`;
    abrirDialogo({ titulo: 'Sobre e privacidade', corpo, pe: `<button type="button" class="kf-btn kf-pri" data-kf-fechar>Fechar</button>` });
  }
  /* bloco pronto para a tela de Ajustes: avaliar, relatar problema e sobre */
  function ajudaHTML() {
    const n = fila.quantos();
    return `<p class="kf-ajuda">Conte o que achou, sugira melhorias ou relate um problema. Sua mensagem vai direto para quem faz o app.</p>
      <div class="kf-acoes"><button type="button" class="kf-btn kf-sec" data-kf="avaliar">${IC.estrela}Avaliar o app</button><button type="button" class="kf-btn kf-sec" data-kf="problema">${IC.alerta}Relatar um problema</button></div>
      <p class="kf-ajuda" data-kf-pendentes aria-live="polite"${n ? '' : ' hidden'}>${textoPendentes(n)}</p>
      <button type="button" class="kf-btn kf-link" data-kf="sobre">${IC.info}Sobre e privacidade</button>`;
  }

  /* ================= tema: automático, claro ou escuro (vale só neste aparelho) ================= */
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
    },
    seletorHTML() {
      return `<div class="kf-seg" role="group" aria-label="Tema">${[['auto', 'Automático'], ['claro', 'Claro'], ['escuro', 'Escuro']].map(([k, l]) => `<button type="button" data-kf="tema" data-v="${k}" aria-pressed="${this.valor === k}">${l}</button>`).join('')}</div>
        <p class="kf-ajuda">No automático, o app segue o tema do aparelho. Vale só para este aparelho.</p>`;
    },
  };

  /* ================= instalar na tela de início ================= */
  let pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pedidoInstalar = e; $$('[data-kf-instalar-bloco]').forEach(el => { el.outerHTML = instalarHTML(); }); });
  function instalarHTML() {
    if (instalado()) return '';
    return `<div data-kf-instalar-bloco>${pedidoInstalar ? `<p class="kf-ajuda">Abre como aplicativo, em tela cheia, e funciona sem internet.</p><button type="button" class="kf-btn kf-pri" data-kf="instalar">${IC.celular}Instalar o ${esc(C.nome)}</button>`
      : ehIOS() ? `<p class="kf-ajuda">No iPhone, abra este endereço no Safari, toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</p>`
      : `<p class="kf-ajuda">Abre como aplicativo e funciona sem internet. No Android, use <b>Instalar app</b> no menu do Chrome. No computador, use o ícone de instalar na barra de endereço.</p>`}</div>`;
  }
  async function instalar() {
    const e = pedidoInstalar; if (!e) return;
    pedidoInstalar = null;
    try { e.prompt(); await e.userChoice; } catch {}
    $$('[data-kf-instalar-bloco]').forEach(el => { el.outerHTML = instalarHTML(); });
  }

  /* ================= cópia de segurança em arquivo ================= */
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
  /* lê um arquivo de cópia padrão; devolve null se não for do app */
  async function lerCopia(arquivo) {
    let j; try { j = JSON.parse(await arquivo.text()); } catch { return null; }
    if (!j || j.formato !== 'copia-facil' || j.app !== C.app || !j.dados) return null;
    return j;
  }

  /* ================= sincronização entre aparelhos ================= */
  /* Os dados vão para um gist secreto da conta GitHub do usuário, criptografados no aparelho (AES-GCM 256,
     chave derivada do código de acesso com PBKDF2). Cada app decide como junta os dados (função aplicar);
     o kit cuida da conexão, da criptografia, do envio e dos textos. O formato do arquivo é o mesmo das versões
     anteriores do Elétrica Fácil e do Estudo Fácil, então aparelhos com versões diferentes continuam se entendendo. */
  let syncAtual = null;
  function criarSync(cfg) {
    const ARQ = cfg.app + '.json';
    const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=' + encodeURIComponent(cfg.nome);
    const est = Object.assign({ token: '', gistId: '', login: '', lastSync: 0, err: '', st: {}, del: {}, tipOff: false }, ler(cfg.chave, {}) || {});
    if (!est.st || typeof est.st !== 'object') est.st = {};
    if (!est.del || typeof est.del !== 'object') est.del = {};
    let timer = null, ocupado = null, deNovo = false, chaveC = null, pendente = false;
    let situacao = est.err ? (est.err === 'offline' ? 'offline' : 'error') : 'ok';
    const ligada = () => !!est.token;
    const salvar = () => gravar(cfg.chave, est);
    const avisa = m => (cfg.toast || avisar)(m);
    function agendar(ms = 2500) { if (!ligada()) return; clearTimeout(timer); timer = setTimeout(() => agora(), ms); }

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
          definirSituacao('ok');
        } catch (e) {
          est.err = e.code || 'http';
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
        auth: 'A chave do GitHub não vale mais. Crie uma nova e cole em Ajustes, Sincronização.',
        scope: 'A chave do GitHub não tem a permissão gist. Crie outra marcando gist.' }[est.err] || 'Não foi possível sincronizar agora. Tente de novo em instantes.';
    }
    function haQuanto(ts) {
      const m = Math.round((Date.now() - ts) / 6e4);
      if (m < 1) return 'agora mesmo';
      if (m < 60) return `há ${m} min`;
      const d = new Date(ts), hm = `${pad(d.getHours())}h${pad(d.getMinutes())}`;
      return d.toDateString() === new Date().toDateString() ? `hoje às ${hm}` : `em ${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${hm}`;
    }
    function texto() {
      if (situacao === 'busy') return 'Sincronizando…';
      if (situacao !== 'ok') return textoErro();
      return est.lastSync ? `Tudo sincronizado, ${haQuanto(est.lastSync)}.` : 'Conectado.';
    }
    const rotuloCurto = () => situacao === 'ok' ? 'Sincronizado' : situacao === 'busy' ? 'Sincronizando' : situacao === 'offline' ? 'Sem internet' : 'Sincronização parada';
    function definirSituacao(s) {
      situacao = s;
      $$('[data-kf-sync-status]').forEach(el => { el.textContent = texto(); el.classList.toggle('kf-ruim', s === 'error'); });
      if (cfg.aoEstado) { try { cfg.aoEstado(s); } catch (e) { console.warn(e); } }
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
      const tinha = est.lastSync;
      const ok = await agora({ quiet: true });
      if (ok) avisa(tinha ? 'Chave atualizada.' : (cfg.textoLigada ? cfg.textoLigada() : 'Sincronização ligada. Seus aparelhos agora têm os mesmos dados.'));
      else avisa(textoErro());
      if (cfg.redesenhar) cfg.redesenhar();
      return true;
    }
    function dialogoConectar() {
      const irma = !ligada() ? chaveIrma() : null;
      abrirDialogo({ titulo: 'Usar em vários aparelhos', classe: 'kf-sync',
        corpo: `${irma ? `<div class="kf-aviso kf-ok">${IC.check}<div><p><b>Você já sincroniza o ${esc(irma.nome)} neste aparelho.</b> Dá para usar a mesma chave, da conta @${esc(irma.login)}. Os dados do ${esc(cfg.nome)} ficam num arquivo separado.</p><button type="button" class="kf-btn kf-pri kf-p" data-kf-irma>Usar a mesma chave</button></div></div>` : ''}
          <ol class="kf-passos">
            <li><b>Crie uma chave de acesso no GitHub</b><span>Na página que vai abrir, em <b>Expiration</b> escolha <b>No expiration</b>. Deixe marcada só a opção <b>gist</b> e toque em <b>Generate token</b>, no fim da página. Se ainda não tem conta no GitHub, crie uma (é gratuita).</span>
              <a class="kf-btn kf-sec kf-p" href="${TOKEN_URL}" target="_blank" rel="noopener">${IC.externo}Abrir o GitHub</a></li>
            <li><b>Copie a chave e cole aqui</b><span>Ela começa com <b>ghp_</b>.</span>
              <input id="kf-token" class="kf-entrada" type="text" placeholder="ghp_…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Chave do GitHub"></li>
            <li><b>Nos outros aparelhos</b><span>Depois de conectar, toque em <b>Outro aparelho</b> para mandar um link para você mesmo, ou cole a mesma chave.</span></li>
          </ol>
          <p class="kf-ajuda">${esc(cfg.dados ? cfg.dados.charAt(0).toUpperCase() + cfg.dados.slice(1) : 'Os dados')} ficam num gist secreto da sua conta, criptografados com a sua chave. O gist não aparece no seu perfil e só os seus aparelhos conseguem ler.</p>`,
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
      abrirDialogo({ titulo: 'Conectar outro aparelho', classe: 'kf-curto',
        corpo: `<p class="kf-texto">Mande este link para você mesmo e abra no outro aparelho. Ele entra com os mesmos dados.</p>
          <div class="kf-aviso kf-ruim">${IC.alerta}<p><b>O link dá acesso aos seus dados.</b> Não envie para outras pessoas.</p></div>
          <p class="kf-ajuda">Se no outro aparelho o app estiver instalado na tela de início, abra o app, vá em Ajustes, Usar em vários aparelhos, e cole a chave.</p>`,
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
          Object.assign(est, { token: '', gistId: '', lastSync: 0, err: '' }); chaveC = null; salvar();
          definirSituacao('ok');
          if (cfg.redesenhar) cfg.redesenhar();
          avisa('Aparelho desconectado.');
        } });
    }
    function resumo() { return ligada() ? `Ligada · @${est.login}` : 'Desligada · use o app em vários aparelhos'; }
    /* conteúdo do cartão de sincronização da tela de Ajustes (o app põe o título e a moldura) */
    function cartaoHTML() {
      if (!ligada()) return `<p class="kf-ajuda">Conecte sua conta GitHub e tenha ${esc(cfg.dados || 'os mesmos dados')} no celular, no tablet e no computador. O que você muda num aparelho aparece nos outros.</p>
        ${cfg.observacao ? `<p class="kf-ajuda">${esc(cfg.observacao)}</p>` : ''}
        <p class="kf-ajuda">Sem a sincronização, os dados ficam só neste aparelho.</p>
        <button type="button" class="kf-btn kf-pri" data-kf="sync-ativar">${IC.nuvem}Ativar sincronização</button>`;
      return `<p class="kf-ajuda">Conta GitHub <b>@${esc(est.login)}</b>${est.err === 'auth' ? ' · <b class="kf-ruim">parada</b>' : ''}.</p>
        <p class="kf-ajuda${situacao === 'error' ? ' kf-ruim' : ''}" data-kf-sync-status aria-live="polite">${esc(texto())}</p>
        ${cfg.observacao ? `<p class="kf-ajuda">${esc(cfg.observacao)}</p>` : ''}
        ${est.err === 'auth' ? `<button type="button" class="kf-btn kf-pri" data-kf="sync-ativar">Colar chave nova</button>` : ''}
        <div class="kf-acoes"><button type="button" class="kf-btn kf-sec" data-kf="sync-agora">${IC.nuvem}Sincronizar agora</button><button type="button" class="kf-btn kf-sec" data-kf="sync-link">${IC.celular}Outro aparelho</button></div>
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
    document.addEventListener('visibilitychange', () => {
      if (!ligada()) return;
      if (document.visibilityState === 'visible') { if (Date.now() - (est.lastSync || 0) > 10000) agora({ quiet: false }); }
      else if (timer) agora();
    });
    window.addEventListener('online', () => { if (ligada()) agora(); });
    window.addEventListener('storage', e => { if (e.key === cfg.chave) { const n = ler(cfg.chave, {}) || {}; Object.assign(est, n); chaveC = null; } });
    setInterval(() => { if (ligada() && document.visibilityState === 'visible' && !ocupado) agora(); }, 60000);
    const api = { estado: est, ligada, salvar, agendar, agora, situacao: () => situacao, texto, rotuloCurto, resumo, cartaoHTML,
      dialogoConectar, dialogoLink, desconectar, conectar, tokenDoLink, iniciar: iniciarSync, textoErro };
    syncAtual = api;
    return api;
  }

  /* ================= ações dos botões do kit (data-kf="…") ================= */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-kf]');
    if (!b) return;
    const a = b.dataset.kf;
    const S = syncAtual;
    const acoes = {
      avaliar: () => abrirFeedback(),
      problema: () => abrirFeedback({ tipo: 'problema' }),
      sobre: () => abrirSobre(),
      tema: () => tema.definir(b.dataset.v),
      instalar: () => instalar(),
      'sync-ativar': () => S && S.dialogoConectar(),
      'sync-agora': async () => { if (S && await S.agora({ manual: true, quiet: true })) avisar('Tudo sincronizado.'); },
      'sync-link': () => S && S.dialogoLink(),
      'sync-sair': () => S && S.desconectar(),
    };
    if (!acoes[a]) return;
    e.preventDefault();
    acoes[a]();
  });

  global.KitFacil = Object.freeze({
    VERSAO, FAMILIA, IC, iniciar, avisar, esc, canon, novoId,
    dialogo: { abrir: abrirDialogo, fechar: fecharDialogo, aberto: dialogoAberto, confirmar },
    copiar,
    feedback: { abrir: abrirFeedback, pendentes: () => fila.quantos(), reenviar: () => fila.tentar(), _enviar: enviarRegistro, _fila: fila, _campos: camposFS },
    sobre: { abrir: abrirSobre },
    ajudaHTML,
    tema,
    instalarHTML,
    copia: { envelope: copiaEnvelope, baixar: baixarCopia, ler: lerCopia },
    sync: { criar: criarSync },
  });
})(window);
