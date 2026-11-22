/* Elétrica Fácil 5 · roteiro do guia: um só, do começo ao fim, na ordem de uso (Código, Arts. 77 a 80).
   Cada passo faz a função de verdade, numa demonstração que não grava nada (casca.js troca os dados e devolve no fim).
   Só o envio (PDF e WhatsApp) é mostrado sem tocar: ele abriria outro app do aparelho.
   Cada passo se põe no lugar sozinho, porque a pessoa pode voltar um passo. */
'use strict';
const gVisivel = e => !!e && e.getClientRects().length > 0;
const gDoc = () => docs.find(d => !d.exemplo);
// põe o documento da demonstração na tela, sem dedo, quando o passo recomeça depois de um "voltar"
async function gNoDoc(m) { const d = gDoc(); if (d && (rota().nome !== 'doc' || rota().id !== d.id)) { ir('/d/' + d.id, true); await m.espera(300); } return m.acha('#pe-doc'); }
async function gPelaBarra(m, id, sel) { if (!gVisivel($(sel))) { const b = $(`#kf-nav-${id}`), t = $(`#kf-trilho-${id}`); await m.tocar(gVisivel(b) ? b : t, { depois: 520 }); } return m.acha(sel); }
async function gSomar(m) { await gNoDoc(m); if (!gVisivel($('#so-q'))) await m.tocar('#conteudo [data-somar]', { depois: 600 }); return m.acha('#so-q'); }

const GUIA = [
  { t: 'Primeiro, a sua hora', d: 'Ela é a base dos preços. Cada serviço guarda um tempo, e o preço é o tempo vezes a sua hora.',
    acao: async m => { await gPelaBarra(m, 'precos', '#conteudo .hora-pn'); await m.apontar('#conteudo .hora-pn', 1900); } },
  { t: 'Comece pelo +', d: 'O + cria o documento. Orçamento é para antes do serviço; relatório, para cobrar o que já foi feito.',
    acao: async m => {
      if (rota().nome !== 'inicio') { ir('/', true); await m.espera(300); }
      const b = $('#kf-nav-novo'), t = $('#kf-trilho-novo');
      await m.tocar(gVisivel(b) ? b : t, { depois: 600 }); await m.apontar('.kf-dlg .opcoes', 1500);
      await m.tocar('.kf-dlg [data-novo-tipo="orc"]', { depois: 900 });
    } },
  { t: 'Primeiro, o cliente', d: 'Nome, telefone e endereço do serviço. Saem no documento e deixam o orçamento valendo como manda a lei.',
    acao: async m => {
      if (!$('#cl-nome')) { fecharJanela(true); ir('/', true); await m.espera(300); novoDocumento('orc'); await m.espera(900); }
      await m.digitar('#cl-nome', 'Mariana Souza'); await m.digitar('#cl-fone', '11988887777'); await m.digitar('#cl-end', 'Rua das Acácias, 120');
      await m.tocar('.kf-dlg [data-salvar]', { depois: 700 }); await m.acha('#pe-doc');
    } },
  { t: 'Some os serviços', d: 'Toque em Somar serviço. Os seus preços aparecem em blocos. Cada toque no + soma um.',
    acao: async m => {
      await gSomar(m); await m.apontar('.kf-dlg .blocos', 1400);
      await m.tocar('.kf-dlg [data-cat="c-tomadas"]', { depois: 600 });
      const mais = '.kf-dlg [data-soma="p-tomadas-1"]';
      await m.tocar(mais, { depois: 320 }); await m.tocar(mais, { depois: 320 }); await m.tocar(mais, { depois: 500 });
      await m.apontar('#so-conta', 1400);
    } },
  { t: 'Ou busque pelo nome', d: 'A busca acha qualquer serviço ou material dos seus preços.', continua: true,
    acao: async m => {
      await gSomar(m); await m.digitar('#so-q', 'chuveiro');
      await m.tocar('.kf-dlg [data-soma="p-aparelhos-1"]', { depois: 500 });
      await m.fechar(); await m.apontar('#conteudo .itens', 1500);
    } },
  { t: 'Defeito desconhecido? Cobre pelo tempo', d: 'O diagnóstico entra pelo tempo que levou. O deslocamento é uma linha própria, por ida.',
    acao: async m => {
      await gSomar(m); await m.tocar('.kf-dlg [data-diag="60"]', { depois: 500 }); await m.tocar('.kf-dlg [data-ida="1"]', { depois: 500 });
      await m.apontar('#so-conta', 1300); await m.fechar(); await m.apontar('#conteudo .itens', 1500);
    } },
  { t: 'Na visita, levante por cômodo', d: 'Escolha o cômodo e some o que há para fazer. Conte também o material: a lista de compras sai pronta.',
    acao: async m => { await gNoDoc(m); await m.apontar('#conteudo [data-levantar], #conteudo .sec-g', 1900); } },
  { t: 'Mude a quantidade ou o preço', d: 'Toque numa linha para mudar. Ali também fica a condição: normal, difícil ou muito difícil.',
    acao: async m => {
      await gNoDoc(m); await m.tocar('#conteudo .itens .item:nth-child(2)', { depois: 600 });
      await m.apontar('.kf-dlg .kf-quantidade', 1200); await m.tocar('.kf-dlg [data-kf-passo="1"]', { depois: 400 });
      await m.tocar('.kf-dlg [data-salvar]', { depois: 600 });
    } },
  { t: 'Combine o pagamento', d: 'À vista, com entrada ou a combinar. Validade, garantia, desconto e observações ficam logo abaixo.',
    acao: async m => {
      await gNoDoc(m); await m.tocar('#conteudo [data-j="pag"]', { depois: 600 });
      await m.tocar('.kf-dlg [data-pag="entrada"]', { depois: 600 }); await m.apontar('.kf-dlg [role="status"]', 1500); await m.fechar();
    } },
  { t: 'Combine o prazo', d: 'O orçamento diz quando o serviço começa e quantos dias leva. A lei pede as datas de início e término.',
    acao: async m => {
      await gNoDoc(m); await m.tocar('#conteudo [data-j="prazo"]', { depois: 700 });
      const d = getDoc(rota().id); if (d && !d.inicio) { d.inicio = Date.now() + 3 * 864e5; tocarDoc(d); }
      await m.tocar('.kf-dlg [data-pz="2"]', { depois: 600 }); await m.apontar('.kf-dlg [role="status"]', 1500); fecharJanela(true); await m.espera(400);
    } },
  { t: 'Envie ao cliente', d: 'O botão do pé é sempre o próximo passo. O documento sai com o cliente, o prazo e a garantia da lei.',
    acao: async m => {
      await gNoDoc(m); await m.apontar('#pe-doc .pe-in', 1300);
      await m.tocar('#pe-doc [data-prox="enviar"]', { depois: 600 }); await m.digitar('#ev-nome', 'Mariana Souza');
      await m.apontar('.kf-dlg .envios', 1700); await m.tocar('.kf-dlg [data-ja]', { depois: 800 });
    } },
  { t: 'O cliente aprovou', d: 'Quando ele responder, toque em Aprovou. Se ele recusar, a opção fica nos três pontinhos.',
    acao: async m => { await gNoDoc(m); await m.apontar('#conteudo .trilha', 1300); await m.tocar('#pe-doc [data-prox="aprovou"]', { depois: 800 }); } },
  { t: 'Receba por Pix', d: 'Em Receber, o QR code já sai com o valor. Depois, registre o que entrou.',
    acao: async m => {
      await gNoDoc(m); await m.tocar('#pe-doc [data-prox="receber"]', { depois: 700 });
      await m.apontar('#rc-pix', 1500, { opcional: true, prazo: 900 }); await m.apontar('#rc-v', 1200);
      await m.tocar('.kf-dlg [data-recebi]', { depois: 800 });
    } },
  { t: 'Mande o recibo', d: 'O pé mostra o que ainda falta. Cada pagamento tem o seu recibo, em PDF ou em mensagem.',
    acao: async m => {
      await gNoDoc(m); await m.apontar('#pe-doc .pe-total', 1300);
      await m.tocar('#conteudo [data-recibo]', { depois: 600 }); await m.apontar('.kf-dlg .envios', 1500); await m.fechar();
    } },
  { t: 'Acompanhe no Início', d: 'O Início mostra quanto há para receber e os documentos em andamento.',
    acao: async m => {
      if (rota().nome !== 'inicio') { ir('/', true); await m.espera(350); }
      await m.apontar('#conteudo .painel', 1700); await m.apontar('#conteudo .docs .doc', 1300);
    } },
  { t: 'Ajuste os seus preços', d: 'Em Preços, toque num bloco e mude o valor. Dá para criar as suas categorias.',
    acao: async m => {
      await gPelaBarra(m, 'precos', '#conteudo .blocos'); await m.tocar('#conteudo [data-cat="c-iluminacao"]', { depois: 600 });
      await m.tocar('#conteudo [data-preco="p-iluminacao-1"]', { depois: 600 }); await m.apontar('#pr-p', 1500); await m.fechar();
    } },
  { t: 'Seu nome e seu Pix', d: 'Em Mais, Ajustes: os seus dados saem nos documentos, e a chave Pix faz o QR code.',
    acao: async m => { if (rota().nome !== 'mais') { ir('/mais', true); await m.espera(350); } await m.apontar('#conteudo .kf-mais [data-kf="ajustes"]', 1900); } },
];
