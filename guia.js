/* Elétrica Fácil · roteiro do guia: um só, do começo ao fim, na ordem de uso (Código, Arts. 77 a 80).
   Cada passo faz a função de verdade, numa demonstração que não grava nada (casca.js troca os dados e devolve no fim).
   Só o envio (PDF e WhatsApp) é mostrado sem tocar: ele abriria outro app do aparelho.
   Versão 3: o roteiro segue a folha (o documento do cliente é a tela) e o botão amarelo do pé, passo a passo. */
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
const gOrc = () => quotes.find(q => !q.example);
const gJanelaFecha = async m => { if (KitFacil.dialogo.aberto()) { await m.fechar(); await m.some('.kf-dlg'); } };
// põe a tela certa sem dedo, quando o passo recomeça depois de um "voltar"
async function gNaFolha(m) { const q = gOrc(); if (q && route().name !== 'quote') { go('/q/' + q.id, true); await m.espera(300); } await m.acha('#fo-folha'); }
async function gNoSomar(m) { await gNaFolha(m); if (!$('#mt-lista')) { await m.tocar('#fo-folha [data-add="svc"]', { depois: 700 }); } await m.acha('#mt-lista'); }
async function gJanela(m, tipo, sel) { await gNaFolha(m); if (!$(sel)) { await gJanelaFecha(m); await m.tocar(`#fo-folha [data-j="${tipo}"]`, { depois: 700 }); } return m.acha(sel); }
async function gIrPelaBarra(m, id, sel) { if (!$(sel) || !gVisivel($(sel))) { const b = $(`#kf-nav-${id}`), t = $(`#kf-trilho-${id}`); await m.tocar(gVisivel(b) ? b : t, { depois: 520 }); } return m.acha(sel); }
async function gIrPorMais(m, id, sel) {
  if ($(sel) && gVisivel($(sel))) return m.acha(sel);
  const t = $(`#kf-trilho-${id}`); if (gVisivel(t)) { await m.tocar(t, { depois: 520 }); return m.acha(sel); }
  await gIrPelaBarra(m, 'mais', '.kf-mais'); await m.tocar(`.kf-mais [data-kf-ir="${id}"]`, { depois: 520 }); return m.acha(sel);
}

const GUIA = [
  { t: 'Comece pela folha', d: 'Em Orçamentos, toque em Novo orçamento. Ele abre na folha que o cliente vai receber.',
    acao: async m => { await m.tocar('[data-novo]', { depois: 700 }); await m.apontar('#fo-folha', 1500); } },
  { t: 'Some o primeiro serviço', d: 'O tracejado é seu e não sai no documento. Toque em Somar serviço para abrir a sua tabela.',
    acao: async m => { await gNaFolha(m); await m.tocar('#fo-folha [data-add="svc"]', { depois: 700 }); await m.apontar('#mt-lista', 1400); } },
  { t: 'Cada toque soma um', d: 'Abra a parte da tabela e toque no + do serviço. Três toques, três tomadas.',
    acao: async m => {
      await gNoSomar(m);
      const sec = await gTexto(m, '#mt-lista [data-cat]', 'Tomadas e interruptores'); if (sec.getAttribute('aria-expanded') !== 'true') await m.tocar(sec, { depois: 500 });
      const mais = async () => $('.mt-mais', await gTexto(m, '.mt-row', 'Instalação de tomada ou interruptor'));
      await m.tocar(await mais(), { depois: 380 }); await m.tocar(await mais(), { depois: 380 }); await m.tocar(await mais(), { depois: 500 });
      await m.apontar('#mt-pe', 1400);
    } },
  { t: 'Busque na tabela', d: 'A busca acha serviço e material juntos. Escreva um pedaço do nome e toque no +.',
    acao: async m => {
      await gNoSomar(m); await m.digitar('#mt-q', 'chuveiro'); await m.apontar('#mt-lista', 1300);
      await m.tocar($('.mt-mais', await gTexto(m, '.mt-row', 'Instalação de chuveiro elétrico')), { depois: 600 });
      const b = $('#mt-q'); if (b) { b.value = ''; b.dispatchEvent(new Event('input', { bubbles: true })); } await m.espera(300);
    } },
  { t: 'Material sugerido', d: 'Feche a janela: os serviços já estão na folha. O app sugere o material de cada um.',
    acao: async m => {
      if ($('#mt-lista')) { await m.fechar(); await m.espera(700); }
      const j = await m.acha('.kf-dlg', { opcional: true, prazo: 1800 });
      if (j && $('[data-ok]', j)) { await m.apontar('.kf-dlg .kf-dlg-corpo', 1500); await m.tocar('.kf-dlg [data-ok]', { depois: 700 }); await m.some('.kf-dlg'); }
      await gNaFolha(m); await m.apontar('#fo-folha', 1500);
    } },
  { t: 'Mexa numa linha, no lugar', d: 'Toque numa linha: a quantidade e o preço mudam ali mesmo. O total, no pé, acompanha.',
    acao: async m => {
      await gNaFolha(m); await gJanelaFecha(m);
      if (!$('#fo-folha .ed')) await m.tocar('#fo-folha [data-ln]', { depois: 600 });
      await m.tocar('[data-edq="1"]', { depois: 420 }); await m.tocar('[data-edq="1"]', { depois: 500 }); await m.apontar('#fo-visor .bb-total', 1300);
    } },
  { t: 'Guarde o preço na tabela', d: 'Mudou o preço numa linha? Ele vale só nesta proposta, até você tocar em Guardar na tabela.',
    acao: async m => {
      await gNaFolha(m); if (!$('#fo-folha .ed')) await m.tocar('#fo-folha [data-ln]', { depois: 600 });
      await m.digitar('#ed-p', '7000'); const p = $('#ed-p'); if (p) p.dispatchEvent(new Event('change', { bubbles: true })); await m.espera(300);
      const g = await m.acha('[data-ed-guardar]', { opcional: true, prazo: 1500 }); if (g) { await m.apontar('[data-ed-guardar]', 1200); await m.tocar('[data-ed-guardar]', { depois: 700 }); }
      const ln = $('#fo-folha .ln.on'); if (ln) await m.tocar(ln, { depois: 500 });
    } },
  { t: 'Cobre o deslocamento', d: 'Em Acertar o total, informe a distância. O app calcula pelo consumo do veículo e o combustível.',
    acao: async m => { await gJanela(m, 'total', '#fo-jan [data-trip]'); await m.tocar('#fo-jan [data-trip]', { depois: 800 }); await m.digitar('#tp-km', '12'); await m.apontar('.kf-dlg [data-use]', 1300); await m.tocar('.kf-dlg [data-use]', { depois: 700 }); await m.some('.kf-dlg'); await m.apontar('#fo-folha .tts', 1300); } },
  { t: 'Adicional, desconto e imposto', d: 'Urgência, noite e fim de semana somam na mão de obra. Desconto e imposto, você escolhe em cada orçamento.',
    acao: async m => { await gJanela(m, 'total', '#fo-jan [data-x="urgent"]'); await m.tocar('#fo-jan [data-x="urgent"]', { depois: 700 }); await m.apontar('#fo-jan [data-x="urgent"]', 1200); await m.tocar('#fo-jan [data-x="urgent"]', { depois: 500 });
      await m.digitar('#q-disc', '2000'); await m.tocar('#fo-jan [data-tx="fora"]', { depois: 800 }); await m.apontar('#fo-jan [data-tx="fora"]', 1200); await m.tocar('#fo-jan [data-tx="sem"]', { depois: 500 }); await gJanelaFecha(m); } },
  { t: 'Pagamento', d: 'À vista, com entrada, no cartão ou a combinar. O resumo mostra quanto e quando o cliente paga.',
    acao: async m => { await gJanela(m, 'pag', '#fo-jan [data-pm]'); await m.tocar('#fo-jan [data-pm="avista"]', { depois: 700 }); await m.tocar('#fo-jan [data-pm="entrada"]', { depois: 700 }); await m.apontar('#pay-sum', 1300, { opcional: true }); await gJanelaFecha(m); } },
  { t: 'Prazo e datas', d: 'Toque no dia de início. O app marca os dias do prazo, pulando fins de semana e feriados.',
    acao: async m => { await gJanela(m, 'prazo', '#fo-jan #cal');
      const dia = $$('#fo-jan [data-cal]:not([disabled])').filter(gVisivel)[3]; if (dia) { await m.tocar(dia, { depois: 700 }); await m.apontar('#cal', 1400, { opcional: true }); } await gJanelaFecha(m); } },
  { t: 'Observações', d: 'Diga o que fica fora do orçamento. Os textos prontos entram com um toque.',
    acao: async m => { await gJanela(m, 'obs', '#fo-jan #q-notes'); await m.tocar('#fo-jan [data-note="0"]', { depois: 700 }); await m.apontar('#q-notes', 1300); await gJanelaFecha(m); } },
  { t: 'Ambientes e outras opções', d: 'No botão ⋯: separar por ambiente, material por conta do cliente, PDF, duplicar e excluir.',
    acao: async m => { await gNaFolha(m); await gJanelaFecha(m); await m.tocar('#fo-visor [data-menu]', { depois: 700 }); await m.apontar('.kf-dlg #q-rooms', 1200, { opcional: true }); await m.apontar('.kf-dlg #q-matcli', 1200, { opcional: true }); await m.apontar('.kf-dlg .opts', 1300, { opcional: true }); await gJanelaFecha(m); } },
  { t: 'Envie ao cliente', d: 'O botão amarelo é o próximo passo. Toque em Enviar: só agora o app pede o nome do cliente.',
    acao: async m => { await gNaFolha(m); await gJanelaFecha(m); await m.tocar('#fo-visor [data-prox="enviar"]', { depois: 800 }); await m.digitar('.kf-dlg #q-name', 'Mariana Souza'); await m.apontar('.kf-dlg [data-pdf]', 1300); await m.apontar('.kf-dlg [data-wa]', 1300, { opcional: true });
      // o envio abriria outro app do aparelho: aqui o guia só marca como enviado
      await gJanelaFecha(m); const q = gOrc(); if (q && q.status === 'rascunho') { setStatus(q, 'enviado'); rerender(); } await m.apontar('#fo-bd', 1400); } },
  { t: 'A resposta do cliente', d: 'Enviado. O botão amarelo virou Aprovou: toque quando o cliente aceitar. O app guarda a data.',
    acao: async m => { await gNaFolha(m); await gJanelaFecha(m); await m.tocar('#fo-visor [data-prox="aprovou"]', { depois: 800 }); const ok = await m.acha('.kf-dlg [data-ok]', { opcional: true, prazo: 1500 }); if (ok) { await m.tocar(ok, { depois: 800 }); await m.some('.kf-dlg'); } await m.apontar('#fo-bd', 1500, { opcional: true }); } },
  { t: 'Conclua o serviço', d: 'Terminou? Toque em Concluir. A folha vira o relatório, e o material sai do estoque.',
    acao: async m => { await gNaFolha(m); await gJanelaFecha(m); await m.tocar('#fo-visor [data-prox="concluir"]', { depois: 900 }); await m.apontar('.kf-dlg .kf-dlg-corpo', 1300, { opcional: true }); await m.tocar('.kf-dlg [data-ok]', { depois: 800 }); await m.some('.kf-dlg'); await m.apontar('#fo-folha', 1600); } },
  { t: 'O relatório', d: 'No relatório, conte o que encontrou e o que fez. Um toque preenche com os serviços lançados.',
    acao: async m => { await gJanela(m, 'tec:work', '#fo-jan #q-work'); const b = await m.acha('#fo-jan [data-work-items]', { opcional: true, prazo: 1200 }); if (b) { await m.tocar(b, { depois: 700 }); await m.apontar('#q-work', 1400, { opcional: true }); } await gJanelaFecha(m); } },
  { t: 'Receba', d: 'Agora o botão amarelo é Receber: o QR code do Pix e o registro do pagamento ficam juntos.',
    acao: async m => { await gNaFolha(m); await gJanelaFecha(m); const b = await m.acha('#fo-visor [data-prox="receber"]', { opcional: true, prazo: 1500 }); if (!b) return;
      await m.tocar(b, { depois: 900 }); await m.apontar('.kf-dlg .rc-qr', 1400, { opcional: true }); await m.apontar('.kf-dlg #pg-v', 1300, { opcional: true }); await m.tocar('.kf-dlg [data-ok]', { depois: 800 }); await m.some('.kf-dlg'); await m.apontar('#fo-bd', 1400, { opcional: true }); } },
  { t: 'Recibo', d: 'Conta acertada. O último passo é o Recibo, em PDF, com o valor por extenso.',
    acao: async m => { await gNaFolha(m); await gJanelaFecha(m); await m.tocar('#fo-visor [data-prox="recibo"]', { depois: 900 }); await m.apontar('.kf-dlg .kf-dlg-corpo', 1600); await gJanelaFecha(m); } },
  { t: 'Seus orçamentos', d: 'Orçamentos abre o app: tudo por etapa, do rascunho ao que falta receber, com o resumo do mês.',
    acao: async m => { await gJanelaFecha(m); await gIrPelaBarra(m, 'orcamentos', '#q-list'); await m.apontar('#q-list', 1500); await m.apontar('.vs', 1400, { opcional: true }); } },
  { t: 'Sua tabela de preços', d: 'Em Tabela, toque num preço para mudar. Letra fina: vem com o app. Letra forte: é o seu.',
    acao: async m => { await gIrPelaBarra(m, 'precos', '#pr-list'); await m.apontar('#pr-meus', 1300, { opcional: true }); const sec = await gTexto(m, '#pr-list [data-cat]', 'Iluminação'); if (sec.getAttribute('aria-expanded') !== 'true') await m.tocar(sec, { depois: 600 });
      await m.apontar('#pr-list', 1500); await m.apontar('[data-new-price]', 1200, { opcional: true }); } },
  { t: 'Obra', d: 'O que levar para a obra, o que comprar, o estoque de material e as suas ferramentas.',
    acao: async m => { await gIrPelaBarra(m, 'obra', '#g-body'); await m.apontar('#g-body', 1200); await m.tocar('[data-aba="comprar"]', { depois: 800 }); await m.tocar('[data-aba="estoque"]', { depois: 800 }); await m.apontar('#g-body', 1200); await m.tocar('[data-aba="ferramentas"]', { depois: 800 }); await m.tocar('[data-aba="levar"]', { depois: 500 }); } },
  { t: 'Conquistas', d: 'Cada passo bem dado acende uma lâmpada. O varal balança com o celular. Toque numa lâmpada, gire e toque de novo: ela pisca.', se: () => jogoLigado(),
    acao: async m => { await gIrPorMais(m, 'conquistas', '.varal'); await m.apontar('.nivel-card', 1300); await m.apontar('.varal', 1500); await m.tocar('[data-lp="pix"]', { depois: 900 }); await m.apontar('.kf-dlg .ef-o3d', 1600); await m.tocar('.kf-dlg .lp-palco', { depois: 900 }); await m.fechar(); } },
  { t: 'Ajustes', d: 'Seus dados, o Pix, o veículo, os adicionais e os textos dos documentos ficam nos Ajustes.',
    acao: async m => { if (route().name !== 'settings') { const t = $('#kf-trilho-ajustes'); if (gVisivel(t)) await m.tocar(t, { depois: 600 }); else { await gIrPelaBarra(m, 'mais', '.kf-mais'); await m.tocar('.kf-mais [data-kf="ajustes"]', { depois: 700 }); } } await m.apontar('[data-kf-aj]', 1800, { opcional: true }); } },
  { t: 'Nuvem, presente e balão', d: 'No alto: a sincronização entre aparelhos, o presente para o criador e a sua avaliação.',
    acao: async m => { await gIrPelaBarra(m, 'orcamentos', '.page.orc'); await m.apontar('[data-kf-nuvem]', 1300, { opcional: true }); await m.apontar('[data-kf="apoio"]', 1300, { opcional: true }); await m.apontar('[data-kf="feedback"]', 1300, { opcional: true }); } },
  { t: 'E um raio de surpresa', d: 'De vez em quando, um raio rasga a tela. É só enfeite, e dá para desligar nos Ajustes.', se: () => Raio.ligado() && !semMovimento(),
    acao: async m => { await gIrPelaBarra(m, 'orcamentos', '.page.orc'); await m.espera(300); Raio.cair({ forcar: true }); await m.espera(1300); } },
];
