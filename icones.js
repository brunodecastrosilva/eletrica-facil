/* Elétrica Fácil 5 · ícones do app, desenhados para ele.
   Dois jogos, com o mesmo traço:
   - IC: ícones de linha, na grade de 24, traço de 2 e pontas redondas (Código, Art. 57, parágrafo único);
   - PIC: pictogramas das categorias de preços, na grade de 48, em dois tons: contorno, uma área tingida e um detalhe cheio.
   O Pix aparece como QR code, nunca com o símbolo do Banco Central (Regras do app, Art. 12). */
'use strict';
const ic = d => `<svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const IC = {
  inicio: ic('<path d="M4 11.2 12 4l8 7.2"/><path d="M6 9.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.800"/><path d="M13.200 11.500 10.500 15h3l-1 3.500"/>'),
  docs: ic('<path d="M8 3.500h7.500L19 7v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.500a2 2 0 0 1 2-2z"/><path d="M15 3.500V7.500h4"/><path d="M9.500 12h6M9.500 15.500h4"/>'),
  precos: ic('<path d="M12.600 3.500H19a1.500 1.500 0 0 1 1.500 1.500v6.400a1.500 1.500 0 0 1-.440 1.060l-7.500 7.500a1.500 1.500 0 0 1-2.120 0l-6.400-6.400a1.500 1.500 0 0 1 0-2.120l7.500-7.500a1.500 1.500 0 0 1 1.060-.440z"/><circle cx="16" cy="8" r="1.300"/>'),
  mais: ic('<circle cx="5.500" cy="12" r="1.200"/><circle cx="12" cy="12" r="1.200"/><circle cx="18.500" cy="12" r="1.200"/>'),
  soma: ic('<path d="M12 5v14M5 12h14"/>'),
  menos: ic('<path d="M5 12h14"/>'),
  voltar: ic('<path d="M14.500 5.500 8 12l6.500 6.500"/>'),
  seta: ic('<path d="M9.500 5.500 16 12l-6.500 6.500"/>'),
  certo: ic('<path d="M5 12.500 10 17.500 19 7.500"/>'),
  x: ic('<path d="M6 6l12 12M18 6 6 18"/>'),
  busca: ic('<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>'),
  enviar: ic('<path d="M20.500 3.500 10.500 13.500"/><path d="M20.500 3.500 14 20.500l-3.500-7-7-3.500z"/>'),
  conversa: ic('<path d="M20 11.500a8 8 0 0 1-11.800 7L4 19.500l1.100-4A8 8 0 1 1 20 11.500z"/>'),
  carta: ic('<rect x="3.500" y="5.500" width="17" height="13" rx="2"/><path d="M4 7.500l8 6 8-6"/>'),
  pdf: ic('<path d="M7 3.500h7.500L18 7v11.500a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><path d="M14 3.500V7.500h4"/><path d="M12 11v5.500M9.500 14.200 12 16.700l2.500-2.500"/>'),
  qr: ic('<rect x="3.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="13.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="3.500" y="13.500" width="7" height="7" rx="1.500"/><path d="M13.500 13.500h3.200v3.200h-3.200z"/><path d="M20.500 17.200v3.300h-3.300"/>'),
  recibo: ic('<path d="M6 3.500h12v17l-2.400-1.600-2.400 1.600-2.400-1.600-2.400 1.600L6 20.500z"/><path d="M9 8.500h6M9 12h6M9 15.500h3"/>'),
  pessoa: ic('<circle cx="12" cy="8" r="3.700"/><path d="M4.500 20a7.500 7.500 0 0 1 15 0"/>'),
  lapis: ic('<path d="M4 20l1-4.500L16.500 4a2.100 2.100 0 0 1 3 3L8 18.500z"/><path d="M14.500 6l3 3"/>'),
  lixo: ic('<path d="M4.500 7h15"/><path d="M9.500 7V4.500h5V7"/><path d="M6.500 7l.8 12a1.500 1.500 0 0 0 1.500 1.400h6.400a1.500 1.500 0 0 0 1.500-1.400l.8-12"/><path d="M10 11v5.500M14 11v5.500"/>'),
  copia: ic('<rect x="8.500" y="8.500" width="12" height="12" rx="2"/><path d="M15.500 8.500V5.500a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>'),
  ver: ic('<path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z"/><circle cx="12" cy="12" r="2.800"/>'),
  desfazer: ic('<path d="M8.500 5 4 9.500 8.500 14"/><path d="M4 9.500h10a5.500 5.500 0 0 1 0 11h-3"/>'),
  recusa: ic('<circle cx="12" cy="12" r="8.500"/><path d="M6.200 6.200l11.600 11.600"/>'),
  relogio: ic('<circle cx="12" cy="12" r="8.500"/><path d="M12 7v5.300l3.300 2"/>'),
  dia: ic('<rect x="3.500" y="5" width="17" height="15.500" rx="2"/><path d="M3.500 9.500h17M8 3v4M16 3v4"/>'),
  escudo: ic('<path d="M12 3.500 19 6v5.500c0 4.200-2.800 7.600-7 9-4.200-1.400-7-4.800-7-9V6z"/><path d="M9 12l2.200 2.200 3.800-4.200"/>'),
  caixa: ic('<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>'),
  nota: ic('<path d="M4.500 6.500h15M4.500 11h15M4.500 15.500h9"/>'),
  desconto: ic('<path d="M18.500 5.500 5.500 18.500"/><circle cx="7.500" cy="7.500" r="2.500"/><circle cx="16.500" cy="16.500" r="2.500"/>'),
  dinheiro: ic('<rect x="2.500" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.700"/><path d="M6 9.500v5M18 9.500v5"/>'),
  raio: ic('<path d="M13.500 2.500 4.500 13.500h6l-1 8 9-11.500h-6z"/>'),
  guia: ic('<circle cx="12" cy="12" r="8.500"/><path d="M10.200 8.300 15.500 12l-5.300 3.700z"/>'),
  exemplo: ic('<path d="M12 3.500l2.500 5.200 5.700.8-4.100 4 1 5.700L12 16.500l-5.100 2.700 1-5.700-4.100-4 5.700-.8z"/>'),
  imagem: ic('<rect x="3.500" y="4.500" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.700"/><path d="M4 17.500l5-4.500 4 3.500 2.500-2 4.500 4"/>'),
  ajuste: ic('<path d="M4 7.500h9M17.500 7.500H20M4 16.500h2.500M11 16.500h9"/><circle cx="15.200" cy="7.500" r="2.300"/><circle cx="8.700" cy="16.500" r="2.300"/>'),
  casa: ic('<path d="M4 11.200 12 4l8 7.200"/><path d="M6 9.800V20h12V9.800"/>'),
};

/* pictogramas das categorias: .pt-l é o contorno, .pt-f a área tingida e .pt-s o detalhe cheio */
const pic = d => `<svg class="pic" viewBox="0 0 48 48" aria-hidden="true">${d}</svg>`;
const L = d => `<path class="pt-l" d="${d}"/>`, F = d => `<path class="pt-f" d="${d}"/>`;
const PIC = {
  tomada: pic(`<rect class="pt-l" x="5.500" y="5.500" width="37" height="37" rx="10"/>${F('M10.500 24l6.200-10.500h14.600L37.500 24l-6.200 10.500H16.700z')}${L('M10.500 24l6.200-10.500h14.600L37.500 24l-6.200 10.500H16.700z')}<circle class="pt-s" cx="17.500" cy="23" r="2.300"/><circle class="pt-s" cx="30.500" cy="23" r="2.300"/><circle class="pt-s" cx="24" cy="26.800" r="2.300"/>`),
  lampada: pic(`${F('M24 5.500a12.500 12.500 0 0 0-7.300 22.700c1.700 1.200 2.800 2.900 2.800 5.300h9c0-2.400 1.100-4.100 2.800-5.300A12.500 12.500 0 0 0 24 5.500z')}${L('M24 5.500a12.500 12.500 0 0 0-7.300 22.700c1.700 1.200 2.800 2.900 2.800 5.300h9c0-2.400 1.100-4.100 2.800-5.300A12.500 12.500 0 0 0 24 5.500z')}${L('M19.500 38h9M21.500 42.500h5')}${L('M20 20.500l4 4 4-4M24 24.500v9')}`),
  quadro: pic(`<rect class="pt-l" x="7.500" y="5.500" width="33" height="37" rx="5"/><rect class="pt-f" x="12.500" y="12.500" width="23" height="16" rx="2.500"/><rect class="pt-l" x="12.500" y="12.500" width="23" height="16" rx="2.500"/>${L('M20.200 12.500v16M27.800 12.500v16')}<rect class="pt-s" x="14.800" y="17" width="3.200" height="6.500" rx="1.200"/><rect class="pt-s" x="22.400" y="17" width="3.200" height="6.500" rx="1.200"/><rect class="pt-s" x="30" y="17" width="3.200" height="6.500" rx="1.200"/>${L('M13.500 35.500h12')}`),
  chuveiro: pic(`${L('M8.500 9.500H19a8.500 8.500 0 0 1 8.500 8.500v2.500')}${F('M16.500 20.500h22l-3 7.500h-16z')}${L('M16.500 20.500h22l-3 7.500h-16z')}${L('M21.500 33v3.500M27.500 33v6M33.500 33v3.500M24.500 41v2.500M30.500 43v1.500')}<circle class="pt-s" cx="8.500" cy="9.500" r="2.300"/>`),
  fiacao: pic(`<rect class="pt-f" x="4.500" y="16" width="19" height="16" rx="4"/><rect class="pt-l" x="4.500" y="16" width="19" height="16" rx="4"/>${L('M23.500 20h5.500c4.500 0 5.500-6 10-6M23.500 24h15.500M23.500 28h5.500c4.500 0 5.500 6 10 6')}<circle class="pt-s" cx="41" cy="14" r="2.500"/><circle class="pt-s" cx="41" cy="24" r="2.500"/><circle class="pt-s" cx="41" cy="34" r="2.500"/>`),
  interfone: pic(`<rect class="pt-l" x="12.500" y="4.500" width="23" height="39" rx="6"/>${L('M19 12h10M19 16.500h10')}<circle class="pt-f" cx="24" cy="26" r="4.800"/><circle class="pt-l" cx="24" cy="26" r="4.800"/><circle class="pt-s" cx="24" cy="36.500" r="2.300"/>`),
  laudo: pic(`<rect class="pt-l" x="9.500" y="8.500" width="29" height="34" rx="5"/><rect class="pt-f" x="17.500" y="4.500" width="13" height="8" rx="2.500"/><rect class="pt-l" x="17.500" y="4.500" width="13" height="8" rx="2.500"/>${L('M16.500 25.500l5 5 10-10.500M16.500 36.500h15')}`),
  visita: pic(`<circle class="pt-f" cx="24" cy="27" r="15"/><circle class="pt-l" cx="24" cy="27" r="15"/>${L('M20 5.500h8M24 5.500V12M36 13l2.500-2.500')}${L('M24 18.500V27l5.500 3.500')}<circle class="pt-s" cx="24" cy="27" r="2"/>`),
  material: pic(`${F('M24 5 41 13 24 21 7 13z')}${L('M24 5 41 13v22l-17 8-17-8V13z')}${L('M7 13l17 8 17-8M24 21v22')}${L('M15.500 9l17 8v6')}`),
  ventilador: pic(`<g transform="rotate(0 24 24)">${F('M24 21.500c-5.500-3.500-7.500-10.500-4-15.500 7 .500 11 7 8.500 13.500z')}${L('M24 21.500c-5.500-3.500-7.500-10.500-4-15.500 7 .500 11 7 8.500 13.500z')}</g><g transform="rotate(120 24 24)">${F('M24 21.500c-5.500-3.500-7.500-10.500-4-15.500 7 .500 11 7 8.500 13.500z')}${L('M24 21.500c-5.500-3.500-7.500-10.500-4-15.500 7 .500 11 7 8.500 13.500z')}</g><g transform="rotate(240 24 24)">${F('M24 21.500c-5.500-3.500-7.500-10.500-4-15.500 7 .500 11 7 8.500 13.500z')}${L('M24 21.500c-5.500-3.500-7.500-10.500-4-15.500 7 .500 11 7 8.500 13.500z')}</g><circle class="pt-s" cx="24" cy="24" r="3.400"/>`),
  ar: pic(`<rect class="pt-f" x="4.500" y="10.500" width="39" height="16" rx="5"/><rect class="pt-l" x="4.500" y="10.500" width="39" height="16" rx="5"/>${L('M10.500 21h27')}<circle class="pt-s" cx="36.500" cy="15.500" r="1.800"/>${L('M14 32c0 3.500-2.500 4.500-2.500 8M24 32v8.500M34 32c0 3.500 2.500 4.500 2.500 8')}`),
  solar: pic(`<circle class="pt-s" cx="24" cy="10" r="4"/>${L('M24 2.500v1.500M16.500 5l1 1M31.500 5l-1 1M14 10h1.500M32.500 10H34')}${F('M11.500 21.500h25l5.500 20H6z')}${L('M11.500 21.500h25l5.500 20H6z')}${L('M24 21.500v20M9 31h30')}`),
  ferramenta: pic(`<g transform="rotate(45 24 24)"><rect class="pt-f" x="19.500" y="25" width="9" height="19" rx="4"/><rect class="pt-l" x="19.500" y="25" width="9" height="19" rx="4"/>${L('M24 25V7.500M21 4.500h6v3h-6z')}</g>`),
  casa: pic(`${L('M5.500 23 24 7l18.500 16')}${L('M10.500 19.500V41h27V19.500')}${F('M19.500 41V29.500h9V41z')}${L('M19.500 41V29.500h9V41')}<circle class="pt-s" cx="24" cy="18.500" r="2.200"/>`),
  raio: pic(`${F('M27.500 4 9.500 27h11.500l-2.500 17 19.500-24.500H26z')}${L('M27.500 4 9.500 27h11.500l-2.500 17 19.500-24.500H26z')}`),
  camera: pic(`${L('M7.500 9.500h33')}${F('M11.500 9.500v9.500a12.500 12.500 0 0 0 25 0V9.500z')}${L('M11.500 9.500v9.500a12.500 12.500 0 0 0 25 0V9.500')}<circle class="pt-l" cx="24" cy="19.500" r="5.200"/><circle class="pt-s" cx="24" cy="19.500" r="2"/>${L('M14 38.500c2.500 2.500 6 4 10 4s7.500-1.500 10-4')}`),
  portao: pic(`${L('M6.500 10v32M41.500 10v32')}<rect class="pt-f" x="6.500" y="17" width="35" height="19" rx="1"/>${L('M6.500 17h35M6.500 36h35M15.200 17v19M24 17v19M32.800 17v19')}<circle class="pt-s" cx="6.500" cy="8" r="2.300"/><circle class="pt-s" cx="41.500" cy="8" r="2.300"/>`),
  bomba: pic(`<circle class="pt-f" cx="21" cy="26" r="12.500"/><circle class="pt-l" cx="21" cy="26" r="12.500"/><circle class="pt-s" cx="21" cy="26" r="3"/>${L('M21 13.500V6.500h18M33.500 26h9M12 40.500h18')}${L('M21 19v-1.500M21 34.500V33M14 26h-1.500M29.500 26H28')}`),
};
const PIC_NOMES = { tomada: 'Tomada', lampada: 'Lâmpada', quadro: 'Quadro', chuveiro: 'Chuveiro', fiacao: 'Fiação', interfone: 'Interfone', laudo: 'Laudo', visita: 'Visita', material: 'Material', ventilador: 'Ventilador', ar: 'Ar-condicionado', solar: 'Energia solar', ferramenta: 'Ferramenta', casa: 'Casa', raio: 'Raio', camera: 'Câmera', portao: 'Portão', bomba: 'Bomba ou motor' };
const picDe = k => PIC[k] || PIC.raio;
