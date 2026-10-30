# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`.

## 2.7.4 · 2026-10-29

- Kit Fácil 2.2.0 (regra nova da barra de baixo; neste app, com 3 itens, nada muda na tela).

## 2.7.3 · 2026-10-29

- No alto da tela, a nova ordem é nuvem, chopp e balão, com o chopp na mesma cor dos outros ícones.
- A janela do chopp ficou mais simples: um só botão, Copiar código Pix.
- Kit Fácil 2.1.3.

## 2.7.2 · 2026-10-29

- **Prazo de guarda:** Avaliações e relatos de problema enviados ao criador agora são apagados depois de 2 anos. Veja em Ajustes, Privacidade e segurança.
- Kit Fácil 2.1.2.

## 2.7.1 · 2026-10-29

- **Pague um chopp para o criador!** O chopp passa a aparecer no alto da tela (e em *Sobre o aplicativo*), com QR code e Pix copia e cola. É opcional: o app continua gratuito e igual para todos.
- Kit Fácil 2.1.1.

## 2.7.0 · 2026-10-28

Kit Fácil 2.1, igual nos três apps (Leis Globais v1.5 do Projeto Integrador).

- **Ajustes na barra de baixo:** Ajustes deixa o alto da tela e vira o último item da barra de baixo, depois de Orçamentos e Preços; no computador, fica no pé do menu lateral. Tocar de novo volta para a lista de guias.
- **Alto da tela:** chopp, nuvem e balão, nessa ordem. Dentro de um orçamento, só a nuvem e o balão.
- **Pague um chopp para o criador!** Janela com QR code e Pix copia e cola, também em *Sobre o aplicativo*. É opcional: o app continua gratuito e igual para todos. O ícone aparece quando a chave Pix do criador for cadastrada no Kit.
- **Novidades:** depois de cada atualização, o app mostra uma vez o que mudou; a lista fica em *Sobre o aplicativo*.
- **Boas-vindas:** quem abre o app pela primeira vez vê os três primeiros passos e o atalho para o orçamento de exemplo.
- **Correção:** o manifesto agora tem identidade própria (`/eletrica-facil/`). Antes, o Chrome podia achar que o Elétrica Fácil já estava instalado quando outro app da família estava. Quem já instalou o app pode precisar instalar de novo.

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
