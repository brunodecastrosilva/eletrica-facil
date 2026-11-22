// Gera icones.js a partir dos SVG da Lucide copiados em icones/lucide (licença ISC em icones/lucide/LICENSE).
// Uso: node ferramentas/icones.mjs   (nada é baixado: os SVG já estão no repositório; o app não usa CDN para ícones)
import { readFileSync, writeFileSync } from 'node:fs';
const IC = { inicio: 'house', docs: 'file-text', lista: 'list', precos: 'tag', mais: 'ellipsis', soma: 'plus', menos: 'minus', voltar: 'arrow-left', seta: 'chevron-right',
  certo: 'check', x: 'x', busca: 'search', enviar: 'send', conversa: 'message-circle', carta: 'mail', pdf: 'file-down', qr: 'qr-code', recibo: 'receipt', pessoa: 'user',
  lapis: 'pencil', lixo: 'trash-2', copia: 'copy', ver: 'eye', desfazer: 'undo-2', recusa: 'circle-x', relogio: 'clock', dia: 'calendar', escudo: 'shield-check',
  caixa: 'package', nota: 'sticky-note', desconto: 'percent', dinheiro: 'banknote', raio: 'zap', guia: 'compass', exemplo: 'sparkles', imagem: 'image', ajuste: 'sliders-horizontal', casa: 'house' };
const PIC = { tomada: 'plug', lampada: 'lightbulb', quadro: 'square-power', chuveiro: 'shower-head', fiacao: 'cable', interfone: 'phone', laudo: 'clipboard-check', visita: 'map-pin',
  material: 'package', ventilador: 'fan', ar: 'air-vent', solar: 'sun', ferramenta: 'wrench', casa: 'house', raio: 'zap', camera: 'cctv', portao: 'fence', bomba: 'droplets' };
const AJ = { cobranca: 'clock', pix: 'qr-code', padrao: 'file-plus', raio: 'zap' };
const dentro = n => readFileSync(new URL(`../icones/lucide/${n}.svg`, import.meta.url), 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').replace(/\s*\n\s*/g, '').replace(/ \/>/g, '/>');
const lin = (o, f) => Object.entries(o).map(([k, n]) => `  ${k}: ${f}('${dentro(n)}'),`).join('\n');
writeFileSync(new URL('../icones.js', import.meta.url), `/* Elétrica Fácil · ícones: todos da Lucide (https://lucide.dev, licença ISC, em icones/lucide/LICENSE).
   Os SVG ficam copiados em icones/lucide; este arquivo é gerado por ferramentas/icones.mjs (não edite à mão).
   Mesma grade de 24, traço de 2 e pontas redondas em todo o app (Código, Art. 57, parágrafo único).
   O Pix aparece como QR code, nunca com o símbolo do Banco Central (Regras do app, Art. 12). */
'use strict';
const ic = d => \`<svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">\${d}</svg>\`;
const IC = {
${lin(IC, 'ic')}
};
// ícones das categorias (Somar serviço e o escolher ícone da categoria): os mesmos de linha, um pouco maiores pelo CSS
const pic = d => \`<svg class="kf-i pic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">\${d}</svg>\`;
const PIC = {
${lin(PIC, 'pic')}
};
// guias do app em Ajustes: o Kit pede só o desenho de dentro do ícone
const ICONES_AJ = {
${Object.entries(AJ).map(([k, n]) => `  ${k}: '${dentro(n)}',`).join('\n')}
};
const PIC_NOMES = { tomada: 'Tomada', lampada: 'Lâmpada', quadro: 'Quadro', chuveiro: 'Chuveiro', fiacao: 'Fiação', interfone: 'Interfone', laudo: 'Laudo', visita: 'Visita', material: 'Material', ventilador: 'Ventilador', ar: 'Ar-condicionado', solar: 'Energia solar', ferramenta: 'Ferramenta', casa: 'Casa', raio: 'Raio', camera: 'Câmera', portao: 'Portão', bomba: 'Bomba ou motor' };
const picDe = k => PIC[k] || PIC.raio;
`);
console.log('icones.js gerado:', Object.keys(IC).length, 'ícones e', Object.keys(PIC).length, 'de categoria');
