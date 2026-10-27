# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`.

## 2.5.0 · 2026-10-26

Adequação às diretrizes do Projeto Integrador.

- **Avaliar o app e relatar problemas:** formulário padrão do projeto (nota, tipo, mensagem e contato opcional) em
  Ajustes → Ajude a melhorar, com fila no aparelho quando estiver sem internet.
- **Sobre e privacidade:** versão do app, onde ficam os dados (inclusive os dos clientes) e os outros apps do projeto.
- **Aparência:** tema claro, escuro ou automático, em Ajustes.
- **Sincronização:** passa a usar o motor comum do projeto (Kit Fácil). O arquivo no gist é o mesmo, então aparelhos
  com a versão anterior continuam sincronizando. Se você já usa outro app do projeto com sincronização neste aparelho,
  dá para aproveitar a mesma chave. Correção: depois de excluir um preço que já tinha sido alterado, os aparelhos regravavam o gist a cada sincronização.
- **Acessibilidade:** o zoom com dois dedos deixou de ser limitado.
- O app instalado pode girar a tela (útil no tablet).
- Para quem desenvolve: Kit Fácil em `comum/`, `npm start`, `npm test` (testes automáticos no navegador),
  `npm run verificar`, README e este histórico.

## 2.4

Versão anterior: telas compactas com seções recolhíveis e escolha entre orçamento e relatório; ambientes,
deslocamento, adicionais, proposta em PDF e WhatsApp com Pix, recibo, sincronização por gist e uso sem internet.
