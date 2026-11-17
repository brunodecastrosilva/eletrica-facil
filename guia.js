/* Elétrica Fácil · roteiro do guia: um só, do começo ao fim, na ordem de uso (Código, Arts. 77 a 80).
   Cada passo faz a função de verdade, numa demonstração que não grava nada (casca.js troca os dados e devolve no fim).
   Só o envio (PDF e WhatsApp) é mostrado sem tocar: ele abriria outro app do aparelho. */
'use strict';
const gVisivel = e => !!e && e.getClientRects().length > 0;
// espera um elemento à vista que tenha o texto (acha a linha certa de uma lista pelo nome)
async function gTexto(m, sel, txt, prazo = 3500) {
  const fim = Date.now() + prazo, alvo = fold(txt);
  for (;;) {
    m.vivo();
    const e = $$(sel).find(x => gVisivel(x) && fold(x.innerText).includes(alvo));
    if (e) return e;
    if (Date.now() > fim) throw new Error(`guia: não achei "${txt}" em ${sel}`);
    await new Promise(r => setTimeout(r, 60));
  }
}
const gPainel = p => `details[data-panel$=":${p}"]`;
async function gAbrir(m, p) { const d = await m.acha(gPainel(p)); if (!KitFacil.secao.aberta(d)) { await m.tocar(gPainel(p) + ' > summary', { depois: KitFacil.movimento.ms + 120 }); } return d; }
async function gRecolher(m, p) { const d = $(gPainel(p)); if (d && KitFacil.secao.aberta(d)) await m.tocar(gPainel(p) + ' > summary', { depois: KitFacil.movimento.ms + 120 }); }
const gOrc = () => quotes.find(q => !q.example);
// põe a tela certa sem dedo, quando o passo recomeça depois de um "voltar"
async function gNaFolha(m) { const q = gOrc(); if (q && route().name !== 'quote') { go('/q/' + q.id, true); await m.espera(300); } await m.acha('.blocos'); }
async function gNaTabela(m) { const q = gOrc(); if (q && route().name !== 'montar') { abrirTabela(q, 'svc', ''); await m.espera(300); } await m.acha('#mt-lista'); }
async function gIrPelaBarra(m, id, sel) { if (!$(sel) || !gVisivel($(sel))) { const b = $(`#kf-nav-${id}`), t = $(`#kf-trilho-${id}`); await m.tocar(gVisivel(b) ? b : t, { depois: 520 }); } return m.acha(sel); }
async function gIrPorMais(m, id, sel) {
  if ($(sel) && gVisivel($(sel))) return m.acha(sel);
  const t = $(`#kf-trilho-${id}`); if (gVisivel(t)) { await m.tocar(t, { depois: 520 }); return m.acha(sel); }
  await gIrPelaBarra(m, 'mais', '.kf-mais'); await m.tocar(`.kf-mais [data-kf-ir="${id}"]`, { depois: 520 }); return m.acha(sel);
}

const GUIA = [
  { t: 'Comece pela tabela', d: 'No Início, toque em Novo orçamento. Ele já abre na sua tabela de preços.',
    acao: async m => { await m.tocar('[data-novo]', { depois: 700 }); await m.apontar('#mt-lista', 1500); } },
  { t: 'Cada toque soma um', d: 'Escolha a parte da tabela e toque no + do serviço. Três toques, três tomadas.',
    acao: async m => {
      await gNaTabela(m); await m.tocar(await gTexto(m, '#mt-tira button', 'Tomadas e interruptores'), { depois: 500 });
      const mais = async () => $('.mt-mais', await gTexto(m, '.mt-row', 'Instalação de tomada ou interruptor'));
      await m.tocar(await mais(), { depois: 380 }); await m.tocar(await mais(), { depois: 380 }); await m.tocar(await mais(), { depois: 500 });
      await m.apontar('#mt-pe', 1400);
    } },
  { t: 'Veja o orçamento', d: 'O total fica no pé. Toque em Ver orçamento: o nome do cliente fica para a proposta.',
    acao: async m => { await gNaTabela(m); await m.tocar('[data-ver]', { depois: 900 }); } },
  { t: 'Material sugerido', d: 'O app sugere o material de cada serviço. Aceite, mude a quantidade ou deixe para depois.', se: () => true,
    acao: async m => {
      const j = await m.acha('.kf-dlg', { opcional: true, prazo: 1800 });
      if (j && $('[data-ok]', j)) { await m.apontar('.kf-dlg .kf-dlg-corpo', 1500); await m.tocar('.kf-dlg [data-ok]', { depois: 700 }); await m.some('.kf-dlg'); }
      await gNaFolha(m); await gAbrir(m, 'items'); await m.apontar(gPainel('items'), 1500);
    } },
  { t: 'Acerte a quantidade', d: 'Use − e + na linha do item. O total, embaixo, muda na hora.',
    acao: async m => { await gNaFolha(m); await gAbrir(m, 'items'); await gAbrir(m, 'svc'); await m.tocar(gPainel('svc') + ' [data-dq="1"]', { depois: 420 }); await m.tocar(gPainel('svc') + ' [data-dq="1"]', { depois: 500 }); await m.apontar('.bb-total', 1500); } },
  { t: 'Separe por ambiente', d: 'Sala, cozinha, quartos: ligue a chave para orçar cômodo por cômodo.',
    acao: async m => { await gNaFolha(m); await gAbrir(m, 'items'); await m.apontar('#q-rooms', 1200, { opcional: true }); const c = $('#q-rooms'); if (c && !c.checked) { await m.tocar('#q-rooms', { depois: 900 }); } await m.apontar(gPainel('items'), 1600); const c2 = $('#q-rooms'); if (c2 && c2.checked) await m.tocar('#q-rooms', { depois: 900 }); await gRecolher(m, 'items'); } },
  { t: 'Cobre o deslocamento', d: 'Em Valores, informe a distância. O app calcula pelo consumo do veículo e o combustível.',
    acao: async m => { await gNaFolha(m); await gAbrir(m, 'val'); await m.tocar('[data-trip]', { depois: 800 }); await m.digitar('#tp-km', '12'); await m.apontar('.kf-dlg [data-use]', 1300); await m.tocar('.kf-dlg [data-use]', { depois: 700 }); await m.some('.kf-dlg'); await m.apontar('[data-trip]', 1300); } },
  { t: 'Adicionais, desconto e impostos', d: 'Urgência, noite e fim de semana somam na mão de obra. Desconto e impostos, você escolhe em cada orçamento.',
    acao: async m => { await gNaFolha(m); await gAbrir(m, 'val'); await m.tocar('[data-x="urgent"]', { depois: 700 }); await m.apontar('[data-x="urgent"]', 1200); await m.tocar('[data-x="urgent"]', { depois: 500 });
      await m.digitar('#q-disc', '2000'); await m.tocar('[data-tx="fora"]', { depois: 800 }); await m.apontar('[data-tx="fora"]', 1200); await m.tocar('[data-tx="sem"]', { depois: 500 }); await gRecolher(m, 'val'); } },
  { t: 'Pagamento, prazo e garantia', d: 'Escolha a forma de pagamento e toque no dia de início. O app marca os dias do prazo.',
    acao: async m => { await gNaFolha(m); await gAbrir(m, 'cond'); await m.tocar('[data-pm="avista"]', { depois: 700 }); await m.tocar('[data-pm="entrada"]', { depois: 700 });
      const dia = $$('[data-cal]:not([disabled])').filter(gVisivel)[3]; if (dia) { await m.tocar(dia, { depois: 700 }); await m.apontar('#cal', 1400, { opcional: true }); } await gRecolher(m, 'cond'); } },
  { t: 'Observações', d: 'Diga o que fica fora do orçamento. Os textos prontos entram com um toque.',
    acao: async m => { await gNaFolha(m); await gAbrir(m, 'notes'); await m.tocar('[data-note="0"]', { depois: 700 }); await m.apontar('#q-notes', 1300); await gRecolher(m, 'notes'); } },
  { t: 'Veja a proposta', d: 'Só agora o app pede o nome do cliente. É assim que ele recebe a proposta.',
    acao: async m => { await gNaFolha(m); await m.tocar('[data-preview]', { depois: 800 }); const n = await m.acha('.kf-dlg #q-name', { opcional: true, prazo: 1500 }); if (n) { await m.digitar('#q-name', 'Mariana Souza'); await m.tocar('.kf-dlg [data-ok]', { depois: 800 }); } await m.apontar('.paper', 1800); } },
  { t: 'Envie ao cliente', d: 'Enviar PDF manda o arquivo; WhatsApp abre a conversa com a mensagem pronta. Aqui, só mostramos os botões.',
    acao: async m => { const q = gOrc(); if (route().name !== 'preview') { go('/q/' + q.id + '/proposta', true); await m.espera(300); } await m.apontar('[data-pdf]', 1300); await m.apontar('[data-wa]', 1300, { opcional: true });
      await m.tocar('[data-back]', { depois: 700 }); await m.tocar('[data-menu]', { depois: 700 }); await m.tocar('.kf-dlg [data-o="status"]', { depois: 700 }); await m.tocar('.kf-dlg [data-s="enviado"]', { depois: 800 }); await m.some('.kf-dlg'); } },
  { t: 'A resposta do cliente', d: 'Enviou? Marque quando o cliente aprovar ou recusar. O app guarda a data.',
    acao: async m => { await gNaFolha(m); await m.apontar('.banner [data-st="aprovado"]', 1200); await m.tocar('.banner [data-st="aprovado"]', { depois: 800 }); const ok = await m.acha('.kf-dlg [data-ok]', { opcional: true, prazo: 1500 }); if (ok) { await m.tocar(ok, { depois: 800 }); await m.some('.kf-dlg'); } await m.apontar('.banner', 1500, { opcional: true }); } },
  { t: 'Conclua o serviço', d: 'Terminou? Marque como concluído. O orçamento vira relatório, com o que foi feito e os testes.',
    acao: async m => { await gNaFolha(m); await m.tocar('.banner [data-st="concluido"]', { depois: 900 }); const no = await m.acha('.kf-dlg [data-no], .kf-dlg [data-ok]', { opcional: true, prazo: 1500 }); if (no) { await m.tocar(no, { depois: 800 }); await m.some('.kf-dlg'); } await m.apontar('.blocos', 1600); } },
  { t: 'Recibo', d: 'No menu do orçamento, gere o recibo do que recebeu, em PDF.',
    acao: async m => { await gNaFolha(m); await m.tocar('[data-menu]', { depois: 700 }); await m.tocar('.kf-dlg [data-o="receipt"]', { depois: 900 }); await m.apontar('.kf-dlg .kf-dlg-corpo', 1600); await m.fechar(); } },
  { t: 'Seus orçamentos', d: 'Em Orçamentos, tudo fica separado por situação. Filtre ou busque pelo cliente ou pelo serviço.',
    acao: async m => { await gIrPelaBarra(m, 'orcamentos', '#q-list'); await m.apontar('#q-list', 1400); await m.tocar('[data-filter="concluido"]', { depois: 700 }); await m.tocar('[data-filter="todos"]', { depois: 500 }); } },
  { t: 'Sua tabela de preços', d: 'Em Tabela, toque num preço para mudar. Os em cinza vêm com o app; os seus ficam em preto.',
    acao: async m => { await gIrPelaBarra(m, 'precos', '#pr-list'); await m.apontar('#pr-meus', 1300, { opcional: true }); await m.tocar(await gTexto(m, '#pr-tira button', 'Iluminação'), { depois: 600 });
      await m.apontar('#pr-list', 1500); await m.apontar('[data-new-price]', 1200, { opcional: true }); } },
  { t: 'Gestão', d: 'Materiais em estoque, suas ferramentas e o checklist de ida e volta da obra.',
    acao: async m => { await gIrPorMais(m, 'gestao', '#g-body'); await m.apontar('#g-body', 1300); await m.tocar('[data-aba="ferramentas"]', { depois: 800 }); await m.apontar('#g-body', 1200); await m.tocar('[data-aba="checklist"]', { depois: 800 }); await m.apontar('#g-body', 1200); await m.tocar('[data-aba="estoque"]', { depois: 500 }); } },
  { t: 'Conquistas', d: 'Cada passo bem dado acende uma lâmpada. O varal balança com o celular. Toque numa lâmpada, gire e toque de novo: ela pisca.', se: () => jogoLigado(),
    acao: async m => { await gIrPorMais(m, 'conquistas', '.varal'); await m.apontar('.nivel-card', 1300); await m.apontar('.varal', 1500); await m.tocar('[data-lp="pix"]', { depois: 900 }); await m.apontar('.kf-dlg .ef-o3d', 1600); await m.tocar('.kf-dlg .lp-palco', { depois: 900 }); await m.fechar(); } },
  { t: 'Ajustes', d: 'Seus dados, o Pix, o veículo, os adicionais e os textos dos documentos ficam nos Ajustes.',
    acao: async m => { if (route().name !== 'settings') { const t = $('#kf-trilho-ajustes'); if (gVisivel(t)) await m.tocar(t, { depois: 600 }); else { await gIrPelaBarra(m, 'mais', '.kf-mais'); await m.tocar('.kf-mais [data-kf="ajustes"]', { depois: 700 }); } } await m.apontar('[data-kf-aj]', 1800, { opcional: true }); } },
  { t: 'Nuvem, presente e balão', d: 'No alto: a sincronização entre aparelhos, o presente para o criador e a sua avaliação.',
    acao: async m => { await gIrPelaBarra(m, 'inicio', '.arranque'); await m.apontar('[data-kf-nuvem]', 1300, { opcional: true }); await m.apontar('[data-kf="apoio"]', 1300, { opcional: true }); await m.apontar('[data-kf="feedback"]', 1300, { opcional: true }); } },
  { t: 'E um raio de surpresa', d: 'De vez em quando, um raio rasga a tela. É só uma gracinha, e dá para desligar nos Ajustes.', se: () => Raio.ligado() && !semMovimento(),
    acao: async m => { await gIrPelaBarra(m, 'inicio', '.arranque'); await m.espera(300); Raio.cair({ forcar: true }); await m.espera(1200); } },
];
