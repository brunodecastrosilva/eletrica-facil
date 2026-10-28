# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`.

## 2.6.0 · 2026-10-27

Padronização da interface e dos Ajustes com o Conta Fácil e o Estudo Fácil (Kit Fácil 2).

- **Alto da tela:** Ajustes, a **nuvem** e o **balão** ficam no canto direito, iguais nos três apps (no orçamento e na
  proposta, só a nuvem e o balão). A nuvem mostra o estado real da sincronização; tocar nela mostra a conta,
  a última sincronização e as ações.
- **Balão:** escolha entre **Avaliar o app** (nota de 1 a 5 e comentário opcional) e **Relatar um problema**
  (descrição, com categoria e gravidade opcionais).
- **Navegação:** Ajustes saiu da barra de baixo e passou para a engrenagem do topo, como nos outros apps.
  No computador, Orçamentos e Preços ficam num menu lateral.
- **Ajustes em guias:** as oito guias comuns da família e as guias do Elétrica Fácil (Pix, Veículo e deslocamento,
  Adicionais, Orçamento novo e Textos dos documentos). No computador, a lista e a guia ficam lado a lado.
  "Seus dados" foi para Conta e perfil; "Instalar" foi para Preferências gerais.
- **Cópia de segurança:** agora no formato comum da família; as cópias feitas nas versões anteriores continuam
  sendo aceitas na restauração.
- **Privacidade e segurança:** novo botão para apagar os dados deste aparelho (não mexe na nuvem).
- **Fonte comum da família** (Atkinson Hyperlegible, feita para leitura fácil) e cores de aviso, erro e sucesso iguais nos três apps.
- O título "Tabela de preços" desceu para a página, e a barra de cima mostra a marca, como nas outras telas principais.

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
