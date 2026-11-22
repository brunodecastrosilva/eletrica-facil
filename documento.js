/* Elétrica Fácil 5 · os documentos que saem do app: orçamento e relatório em PDF, recibo, mensagem de WhatsApp,
   código do Pix e cópia de segurança. Tudo é feito no aparelho; só sai quando a pessoa compartilha. */
'use strict';

/* ================= Pix: o código vem do Kit; o app nunca desenha o símbolo do Pix (Regras do app, Art. 12) ================= */
const codigoPix = valor => ajustes.pix ? KitFacil.pix.codigo({ chave: KitFacil.pix.chave(ajustes.pix), nome: ajustes.empresa || ajustes.nome || 'Recebedor', cidade: ajustes.cidade, valor }) : '';

/* ================= valor por extenso (recibo) ================= */
function extenso(centavos) {
  const U = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const D = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const C = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  const tri = n => {
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100), r = n % 100, p = [];
    if (c) p.push(C[c]);
    if (r) p.push(r < 20 ? U[r] : D[Math.floor(r / 10)] + (r % 10 ? ' e ' + U[r % 10] : ''));
    return p.join(' e ');
  };
  const inteiro = n => {
    const G = [[Math.floor(n / 1e6) % 1000, 'milhão', 'milhões'], [Math.floor(n / 1e3) % 1000, 'mil', 'mil'], [n % 1000, '', '']].filter(g => g[0] > 0);
    return G.map((g, i) => {
      let w = g[1] === 'mil' && g[0] === 1 ? 'mil' : tri(g[0]) + (g[1] ? ' ' + (g[0] === 1 ? g[1] : g[2]) : '');
      if (i > 0) w = (i === G.length - 1 && (g[0] < 100 || g[0] % 100 === 0) ? ' e ' : ' ') + w;
      return w;
    }).join('');
  };
  const r = Math.floor(centavos / 100), cc = centavos % 100;
  let s = '';
  if (r) s = inteiro(r) + (r >= 1e6 && r % 1e6 === 0 ? ' de' : '') + (r === 1 ? ' real' : ' reais');
  if (cc) s += (s ? ' e ' : '') + tri(cc) + (cc === 1 ? ' centavo' : ' centavos');
  return s || 'zero real';
}

/* ================= PDF (jsPDF, com versão fixa e impressão digital; só é baixado quando a função é usada) ================= */
let pdfPronto = null;
function carregarPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (!pdfPronto) pdfPronto = new Promise((ok, falhou) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.crossOrigin = 'anonymous'; s.integrity = 'sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk'; // impressão digital (SRI)
    s.onload = () => window.jspdf && window.jspdf.jsPDF ? ok(window.jspdf.jsPDF) : falhou(new Error('jspdf'));
    s.onerror = () => { pdfPronto = null; falhou(new Error('jspdf')); };
    document.head.appendChild(s);
  });
  return pdfPronto;
}
// as fontes padrão do PDF só têm o alfabeto latino básico
const pdfLimpo = s => String(s ?? '').replace(/[‒-―−]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/[•●]/g, '-').replace(/[^\u0000-ÿ]/g, '');
const PC = { tinta: [11, 17, 40], apoio: [81, 92, 125], linha: [222, 226, 238], suave: [244, 245, 249], volt: [255, 210, 31] };
const RAIO_PDF = [[13.5, 1.5], [3.8, 13.6], [10.7, 13.6], [9.6, 22.5], [20.2, 9.5], [13.1, 9.5]];
function pdfKit(JsPDF) {
  const doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
  const W = 210, H = 297, M = 16, CW = W - 2 * M;
  const fonte = (tam, forte, ital) => { doc.setFont('helvetica', forte ? (ital ? 'bolditalic' : 'bold') : (ital ? 'italic' : 'normal')); doc.setFontSize(tam); };
  const txt = (s, x, y, o = {}) => { fonte(o.tam || 10, o.forte, o.ital); doc.setTextColor(...(o.cor || PC.tinta)); doc.text(pdfLimpo(s), x, y, { align: o.lado || 'left' }); };
  const quebra = (s, w, tam, forte) => { fonte(tam, forte); return doc.splitTextToSize(pdfLimpo(s), w); };
  const lh = tam => tam * 0.3528 * 1.34;
  const rotulo = (t, x, y, lado) => txt(t.toUpperCase(), x, y, { tam: 7.5, forte: true, cor: PC.apoio, lado });
  return { doc, W, H, M, CW, fonte, txt, quebra, lh, rotulo };
}
function pdfRaio(doc, x, y, tam) {
  const s = tam / 24, pts = RAIO_PDF.map(([a, b]) => [x + a * s, y + b * s]);
  doc.lines(pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]), pts[0][0], pts[0][1], [1, 1], 'F', true);
}
function pdfCabecalho(K, tipo, numero, extra) {
  const { doc, M, CW, txt, quebra } = K, s = ajustes, topo = M;
  // uma informação por linha; a marca vai do topo do nome até a base da última linha
  const subs = [s.empresa && s.nome ? s.nome : '', s.fone ? fone(s.fone) : '', s.email, s.doc ? cpfCnpj(s.doc) : '', s.registro, s.cidade].filter(Boolean);
  const NS = 13.5, SS = 8.8, NL = 5.6, SL = 4.1, cap = NS * 0.3528 * 0.718;
  const prop = s.logo ? (s.logoProp || 1) : 1;
  const nomes = quebra(s.empresa || s.nome || 'Seu nome ou empresa', CW - Math.min(44, 18 * prop) - 55, NS, true).slice(0, 2);
  const ultimo = cap + (nomes.length - 1) * NL;
  const altTxt = subs.length ? ultimo + 5.4 + (subs.length - 1) * SL : ultimo;
  const h = Math.min(22, Math.max(altTxt, 12)), caixa = Math.max(h, altTxt);
  const topoTxt = topo + (caixa - altTxt) / 2, topoLogo = topo + (caixa - h) / 2;
  let w = h;
  if (s.logo) {
    w = Math.min(44, h * prop); const hh = w / prop;
    try { doc.addImage(s.logo, 'PNG', M, topoLogo + (h - hh) / 2, w, hh); } catch { w = 0; }
  } else {
    doc.setFillColor(...PC.volt); doc.roundedRect(M, topoLogo, h, h, h * 0.24, h * 0.24, 'F');
    doc.setFillColor(...PC.tinta); pdfRaio(doc, M + h * 0.15, topoLogo + h * 0.15, h * 0.7);
  }
  const x = M + (w ? w + 5 : 0);
  let ly = topoTxt + cap;
  nomes.forEach(t => { txt(t, x, ly, { tam: NS, forte: true }); ly += NL; });
  ly += 5.4 - NL;
  subs.forEach(t => { txt(t, x, ly, { tam: SS, cor: PC.apoio }); ly += SL; });
  const rx = M + CW;
  const kl = quebra(tipo, 46, 8, true), ko = (kl.length - 1) * 3.6;
  kl.forEach((t, k) => txt(t, rx, topo + 4.2 + k * 3.6, { tam: 8, forte: true, cor: PC.apoio, lado: 'right' }));
  txt(numero, rx, topo + 11.4 + ko, { tam: 16, forte: true, lado: 'right' });
  let ry = topo + 16.6 + ko;
  extra.forEach(t => { txt(t, rx, ry, { tam: 8.8, cor: PC.apoio, lado: 'right' }); ry += 4.1; });
  const yy = Math.max(topo + caixa + 1, ry - 1.2) + 3.5;
  doc.setFillColor(...PC.volt); doc.rect(M, yy, CW, 1.6, 'F');
  return yy + 8;
}
function pdfRodape(K, esquerda) {
  const { doc, H, M, CW, txt } = K, n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...PC.linha); doc.setLineWidth(0.2); doc.line(M, H - 14, M + CW, H - 14);
    txt(esquerda, M, H - 9.5, { tam: 7.8, cor: PC.apoio });
    if (n > 1) txt(`Página ${i} de ${n}`, M + CW, H - 9.5, { tam: 7.8, cor: PC.apoio, lado: 'right' });
  }
}
function pdfQR(doc, m, x, y, tam) {
  const cel = tam / (m.n + 4);
  doc.setFillColor(255, 255, 255); doc.rect(x, y, tam, tam, 'F'); doc.setFillColor(0, 0, 0);
  for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) if (m.dark(r, c)) doc.rect(x + (c + 2) * cel, y + (r + 2) * cel, cel + 0.02, cel + 0.02, 'F');
}
/* o orçamento (antes do serviço) e o relatório (cobrança do que foi feito) saem da mesma folha */
async function montarPDF(d) {
  const JsPDF = await carregarPDF();
  const c = conta(d), rel = d.tipo === 'rel', cob = cobrarAgora(d, c);
  const pix = cob.v > 0 && d.etapa !== 'recusado' ? codigoPix(cob.v) : '';
  let qr = null; if (pix) { try { qr = await KitFacil.pix.matriz(pix); } catch {} }
  const K = pdfKit(JsPDF), { doc, H, M, CW, txt, quebra, lh, rotulo } = K;
  let y = pdfCabecalho(K, TIPO[d.tipo].titulo, numTxt(d), [dataBR(dataDoc(d))]);
  const fundo = H - 19;
  const cabe = h => { if (y + h > fundo) { doc.addPage(); y = M + 2; return true; } return false; };

  // cliente e serviço
  const colW = (CW - 10) / 2, rx = M + colW + 10;
  let ly = y, ry = y;
  rotulo('Cliente', M, ly); ly += 5.4;
  quebra(d.cliente.nome || 'Cliente', colW, 11.5, true).forEach(t => { txt(t, M, ly, { tam: 11.5, forte: true }); ly += lh(11.5); });
  [d.cliente.doc ? cpfCnpj(d.cliente.doc) : '', d.cliente.fone ? fone(d.cliente.fone) : '', d.cliente.end].filter(Boolean).forEach(v => quebra(v, colW, 9.3).forEach(t => { txt(t, M, ly, { tam: 9.3, cor: PC.apoio }); ly += lh(9.3); }));
  rotulo(rel ? 'Serviço executado' : 'Serviço', rx, ry); ry += 5.4;
  quebra(d.titulo || 'Serviços elétricos', colW, 11.5, true).forEach(t => { txt(t, rx, ry, { tam: 11.5, forte: true }); ry += lh(11.5); });
  if (rel && d.feito) { txt(`Executado em ${dataBR(d.feito)}`, rx, ry, { tam: 9.3, cor: PC.apoio }); ry += lh(9.3); }
  y = Math.max(ly, ry) + 5;

  // tabela de itens
  const xQ = M + CW - 62, xU = M + CW - 30, xT = M + CW - 2.5, wD = xQ - M - 24;
  const cabTabela = () => {
    doc.setFillColor(...PC.suave); doc.rect(M, y, CW, 7.5, 'F');
    rotulo('Descrição', M + 2.5, y + 5); rotulo('Qtd.', xQ, y + 5, 'right'); rotulo('Unitário', xU, y + 5, 'right'); rotulo('Total', xT, y + 5, 'right');
    y += 12;
  };
  cabe(22); cabTabela();
  // o cliente vê preço fechado por serviço; o tempo só aparece no diagnóstico (linhasCliente, em motor.js)
  // com cômodos, cada grupo abre com o nome e o subtotal (Sala · R$ 300,00)
  const LC = linhasCliente(d, c), TG = totaisGrupo(LC); let gAtual = null;
  LC.forEach(l => {
    if (l.grupo && l.grupo !== gAtual) {
      gAtual = l.grupo; if (cabe(14)) cabTabela();
      y += 2; txt(`${l.grupo.toUpperCase()} · ${BRL(TG[l.grupo])}`, M + 2.5, y, { tam: 9.4, forte: true }); y += 6;
    }
    const L = quebra(l.nome, wD, 10), S = l.sub ? quebra(l.sub, wD, 8.6) : [], h = L.length * lh(10) + S.length * lh(8.6) + 3.2;
    if (cabe(h)) cabTabela();
    L.forEach((t, k) => txt(t, M + 2.5, y + k * lh(10), { tam: 10 }));
    S.forEach((t, k) => txt(t, M + 2.5, y + L.length * lh(10) + k * lh(8.6), { tam: 8.6, cor: PC.apoio }));
    if (l.qtd) { txt(l.qtd, xQ, y, { tam: 10, lado: 'right' }); txt(l.pu, xU, y, { tam: 10, cor: PC.apoio, lado: 'right' }); }
    txt(BRL(l.total), xT, y, { tam: 10, forte: true, lado: 'right' });
    y += h - 1.6;
    doc.setDrawColor(...PC.linha); doc.setLineWidth(0.2); doc.line(M, y - 2.2, M + CW, y - 2.2);
    y += 2.2;
  });
  if (!d.linhas.length) { txt('Nenhum serviço somado.', M + 2.5, y, { tam: 10, cor: PC.apoio }); y += 7; }

  // totais
  y += 1.5;
  const tx = M + CW - 84;
  cabe((c.desc ? 12 : 0) + (c.pago ? 12 : 0) + 16);
  const lin = (r, v) => { txt(r, tx, y, { tam: 10, cor: PC.apoio }); txt(v, xT, y, { tam: 10, lado: 'right' }); y += 6; };
  if (c.desc) { lin('Valor do serviço', BRL(c.sub)); lin(descTxt(d).slice(0, 34), '- ' + BRL(c.desc)); }
  doc.setFillColor(...PC.volt); doc.roundedRect(tx - 4, y - 5.2, 88, 11, 1.8, 1.8, 'F');
  txt('TOTAL', tx, y + 1.8, { tam: 9, forte: true }); txt(BRL(c.total), xT, y + 2.2, { tam: 14, forte: true, lado: 'right' });
  y += 12.5;
  if (c.pago) { lin('Já recebido', BRL(c.pago)); lin('Falta receber', BRL(c.falta)); }
  y += 4;

  // condições
  const bloco = (titulo, texto) => {
    const L = quebra(String(texto).trim(), CW, 9.6);
    cabe(8 + Math.min(L.length, 3) * lh(9.6));
    rotulo(titulo, M, y); y += 5.2;
    L.forEach(t => { cabe(lh(9.6)); txt(t, M, y, { tam: 9.6 }); y += lh(9.6); });
    y += 3.4;
  };
  bloco('Pagamento', pagTxt(d, c));
  if (!rel) bloco('Validade', `Este orçamento vale até ${dataBR(validoAte(d))}.`);
  if (d.garantia > 0) bloco('Garantia', `${plural(d.garantia, 'dia', 'dias')} para o serviço executado, a contar da conclusão. Não cobre mau uso nem alterações feitas por terceiros.`);
  if (d.obs.trim()) bloco('Observações', d.obs);

  // Pix: QR code e copia e cola do que cobrar agora
  if (pix) {
    cabe(42);
    doc.setFillColor(...PC.suave); doc.roundedRect(M, y, CW, 38, 2.4, 2.4, 'F');
    const qx = M + 4, tx2 = qr ? M + 42 : M + 5;
    if (qr) pdfQR(doc, qr, qx, y + 3, 32);
    txt('PAGUE COM PIX', tx2, y + 8.5, { tam: 8, forte: true, cor: PC.apoio });
    txt(BRL(cob.v), tx2, y + 16, { tam: 15, forte: true });
    txt(`Valor de ${cob.que === 'a entrada' ? 'entrada' : cob.que === 'o restante' ? 'restante' : 'total'}. ${qr ? 'Aponte a câmera para o QR code ou use o código:' : 'Pix copia e cola:'}`, tx2, y + 21.5, { tam: 8.6, cor: PC.apoio });
    doc.setFont('courier', 'normal'); doc.setFontSize(7.2); doc.setTextColor(...PC.tinta);
    doc.splitTextToSize(pix, M + CW - 5 - tx2).slice(0, 4).forEach((t, k) => doc.text(t, tx2, y + 26.5 + k * 3.2));
    y += 42;
  }
  // de acordo (só o orçamento)
  if (!rel) {
    cabe(22); y += 15;
    const w = (CW - 14) / 2;
    doc.setDrawColor(...PC.tinta); doc.setLineWidth(0.3); doc.line(M, y, M + w, y); doc.line(M + w + 14, y, M + CW, y);
    txt(ajustes.nome || ajustes.empresa || 'Prestador', M, y + 4.6, { tam: 9, forte: true });
    txt(d.cliente.nome ? `De acordo: ${d.cliente.nome}` : 'De acordo do cliente', M + w + 14, y + 4.6, { tam: 9, forte: true });
  }
  pdfRodape(K, `${nomeDoc(d)}${d.cliente.nome ? ' · ' + d.cliente.nome : ''}`);
  return doc.output('blob');
}
async function montarRecibo(d, p) {
  const JsPDF = await carregarPDF();
  const K = pdfKit(JsPDF), { doc, M, CW, txt, quebra, rotulo } = K, s = ajustes;
  let y = pdfCabecalho(K, 'RECIBO', numTxt(d), [dataBR(p.em)]);
  doc.setFillColor(...PC.volt); doc.roundedRect(M + CW - 70, y, 70, 17, 1.8, 1.8, 'F');
  rotulo('Valor', M + CW - 66, y + 5.5);
  txt(BRL(p.v), M + CW - 4, y + 13, { tam: 16, forte: true, lado: 'right' });
  y += 30;
  const corpo = `Recebi de ${d.cliente.nome || 'cliente'}${d.cliente.doc ? ', ' + cpfCnpj(d.cliente.doc) + ',' : ''} a importância de ${BRL(p.v)}, ${extenso(p.v)}, referente a ${(d.titulo || 'serviços elétricos').trim()} (${nomeDoc(d).toLowerCase()}).`;
  quebra(corpo, CW, 12).forEach(t => { txt(t, M, y, { tam: 12 }); y += 6.6; });
  y += 3;
  txt(`Forma de pagamento: ${p.meio}.`, M, y, { tam: 12 }); y += 14;
  txt(`${s.cidade ? s.cidade + ', ' : ''}${dataLonga(p.em)}.`, M, y, { tam: 12 }); y += 32;
  const cx = M + CW / 2;
  doc.setDrawColor(...PC.tinta); doc.setLineWidth(0.3); doc.line(cx - 48, y, cx + 48, y);
  txt(s.nome || s.empresa || 'Assinatura', cx, y + 5.5, { tam: 10.5, forte: true, lado: 'center' });
  const sub = [s.empresa && s.nome ? s.empresa : '', s.doc ? cpfCnpj(s.doc) : ''].filter(Boolean).join(' · ');
  if (sub) txt(sub, cx, y + 10.5, { tam: 9, cor: PC.apoio, lado: 'center' });
  pdfRodape(K, `Recibo ${numTxt(d)}${d.cliente.nome ? ' · ' + d.cliente.nome : ''}`);
  return doc.output('blob');
}

/* ================= salvar e compartilhar arquivos ================= */
let arquivoPendente = null;
const slug = s => dobra(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const nomeArquivo = (tipo, d) => `${tipo}-${d.exemplo ? 'exemplo' : String(d.num || 0).padStart(4, '0')}${d.cliente.nome ? '-' + slug(d.cliente.nome) : ''}.pdf`;
async function entregarArquivo(nome, blob) {
  const arquivo = new File([blob], nome, { type: blob.type || 'application/octet-stream' });
  if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
    try { await navigator.share({ files: [arquivo] }); return true; }
    catch (e) {
      if (e && e.name === 'AbortError') return false;
      // no iPhone o menu só abre logo depois de um toque; se o PDF demorou, oferece um toque novo
      if (e && e.name === 'NotAllowedError') { arquivoPendente = arquivo; aviso('Arquivo pronto.', { label: 'Compartilhar', run: () => { const f = arquivoPendente; arquivoPendente = null; if (f) navigator.share({ files: [f] }).catch(() => {}); } }); return true; }
    }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  return true;
}
// gera o PDF com o botão avisando; devolve true quando o arquivo saiu
async function gerarPDF(botao, fazer, nome) {
  const antes = botao && botao.innerHTML;
  if (botao) { botao.disabled = true; botao.textContent = 'Gerando…'; }
  let ok = false;
  try { ok = await entregarArquivo(nome, await fazer()); }
  catch (e) { console.warn(e); aviso('Não foi possível gerar o PDF. Na primeira vez, o app precisa de internet.'); }
  if (botao && botao.isConnected) { botao.disabled = false; botao.innerHTML = antes; }
  return ok;
}

/* ================= mensagem para o WhatsApp ================= */
function linkWhats(telefone, texto) {
  let t = soDigitos(telefone);
  if (t.length === 10 || t.length === 11) t = '55' + t;
  return `https://wa.me/${t.length >= 12 ? t : ''}?text=${encodeURIComponent(texto)}`;
}
const assinatura = () => [ajustes.nome, ajustes.empresa && ajustes.empresa !== ajustes.nome ? ajustes.empresa : '', ajustes.fone ? fone(ajustes.fone) : ''].filter(Boolean);
function mensagem(d) {
  const c = conta(d), rel = d.tipo === 'rel', cob = cobrarAgora(d, c), nome = primeiroNome(d.cliente.nome);
  const L = [`Olá${nome ? ', ' + nome : ''}!`, rel ? `Segue o relatório do serviço${d.feito ? ' executado em ' + dataBR(d.feito) : ''}${d.titulo ? ': ' + d.titulo : ''}.` : `Segue o orçamento${d.titulo ? ' de ' + d.titulo : ''}.`, ''];
  const LC = linhasCliente(d, c), TG = totaisGrupo(LC); let g0 = null;
  LC.forEach(l => { if (l.grupo && l.grupo !== g0) { g0 = l.grupo; L.push('', `*${l.grupo}* · ${BRL(TG[l.grupo])}`); } L.push(`• ${l.qtd ? l.qtd + ' · ' : ''}${l.nome}${l.sub ? ` (${l.sub})` : ''}: ${BRL(l.total)}`); });
  L.push('');
  if (c.desc) L.push(`Valor do serviço: ${BRL(c.sub)}`, `${descTxt(d)}: - ${BRL(c.desc)}`);
  L.push(`*Total: ${BRL(c.total)}*`, pagTxt(d, c));
  if (!rel) L.push(`Válido até ${dataBR(validoAte(d))}.`);
  if (d.garantia > 0) L.push(`Garantia: ${plural(d.garantia, 'dia', 'dias')}.`);
  if (d.obs.trim()) L.push('', d.obs.trim());
  if (ajustes.pix && cob.v > 0) L.push('', `Pix (${cob.que}, ${BRL(cob.v)}): ${ajustes.pix}`);
  const a = assinatura(); if (a.length) L.push('', a.join(' · '));
  return L.join('\n');
}
function mensagemRecibo(d, p) {
  const nome = primeiroNome(d.cliente.nome), a = assinatura();
  return [`Olá${nome ? ', ' + nome : ''}!`, `Recebi ${BRL(p.v)} (${p.meio.toLowerCase()}) em ${dataBR(p.em)}, referente a ${(d.titulo || 'serviços elétricos').trim()}. Obrigado!`, ...(a.length ? ['', a.join(' · ')] : [])].join('\n');
}

/* ================= cópia de segurança no formato comum da família ================= */
function baixarCopia() {
  const env = KitFacil.copia.envelope({ ajustes, cats, precos, docs: docs.filter(d => !d.exemplo) }, 4);
  entregarArquivo(`eletrica-facil-copia-${dataISO()}.json`, new Blob([JSON.stringify(env, null, 1)], { type: 'application/json' }));
}
async function restaurarCopia(arquivo) {
  const j = await KitFacil.copia.ler(arquivo);
  const D = j && j.esquema === 4 && j.dados && Array.isArray(j.dados.docs) && Array.isArray(j.dados.precos) && Array.isArray(j.dados.cats) ? j.dados : null;
  if (!D) { aviso(j && j.esquema && j.esquema < 4 ? 'Essa cópia é de uma versão anterior do Elétrica Fácil e não abre nesta.' : 'Esse arquivo não é uma cópia do Elétrica Fácil.'); return; }
  confirmar('Restaurar a cópia?', `O arquivo tem ${plural(D.docs.length, 'documento', 'documentos')} e ${plural(D.precos.length, 'preço', 'preços')}. Os dados deste aparelho${SY.ligada() ? ' e dos outros aparelhos conectados' : ''} serão substituídos.`, 'Restaurar cópia', () => {
    ajustes = acertaAjustes(D.ajustes); cats = D.cats.map(acertaCat); precos = D.precos.map(acertaPreco); acertaCatalogo();
    docs = D.docs.map(acertaDoc).filter(d => !d.exemplo); docs.forEach(d => { d.mudou = Date.now(); }); // a cópia restaurada passa a valer também nos outros aparelhos
    ajustes.seq = Math.max(ajustes.seq, 0, ...docs.map(d => d.num || 0));
    salvarAjustes(); salvarPrecos(); salvarDocs(); redesenhar(); aviso('Cópia restaurada.');
  }, { perigo: false, desfaz: 'Não dá para desfazer.' });
}
