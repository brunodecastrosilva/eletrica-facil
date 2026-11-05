# Elétrica Fácil

Orçamentos de elétrica prontos em minutos, direto no celular, no tablet ou no computador.

**Fase de testes** · versão 2.21.0 · app web em <https://brunodecastrosilva.github.io/eletrica-facil/>

Faz parte do **Projeto Integrador** (Conta Fácil, Elétrica Fácil e Estudo Fácil) e segue o padrão comum descrito em
[`comum/PADRAO.md`](comum/PADRAO.md).

## O que o app faz

- Monte o orçamento escolhendo serviços e materiais da sua tabela de preços
- Separe por ambiente (sala, cozinha, quartos…) e confira o total de cada item, também em PDF
- Defina o prazo (dias úteis, dias corridos, semanas ou meses; o padrão fica em Ajustes) e toque no início: o app marca os dias no calendário, pulando fins de semana e feriados, e confere se fecha; o orçamento não aceita datas passadas
- Preços que vêm com o app em cinza claro; ao mudar o valor, ficam em preto
- Pagamento à vista (com desconto à vista), com entrada, no cartão (sem juros, taxa da maquininha ou juros ao mês; sem juros até N×; débito) ou a combinar; outras formas que o cliente pode escolher aparecem na proposta
- Calcule o deslocamento pela distância, consumo do veículo e preço do combustível
- Aplique adicionais de urgência, período noturno e fim de semana sobre a mão de obra
- Envie a proposta em PDF (folha A4) ou pelo WhatsApp, com QR code do Pix da entrada
- Acompanhe o que está aguardando resposta, aprovado e concluído; gere relatório técnico e recibo no fim do serviço
- **Gestão:** Materiais (Em estoque, Repor e Catálogo; várias marcas por material, com quantidade e custo; repasse, margem e mínimo), ferramentas em Minhas ferramentas (com marca, modelo e quantidade, várias do mesmo tipo), Quero comprar e Ferramentas cadastradas (mais de 50 já vêm no app), lista de compras para copiar ou mandar pelo WhatsApp, e checklist fixo para conferir na ida e na volta da obra. O material do estoque é o mesmo da tabela de Preços; ao concluir um serviço, o app oferece dar baixa no material usado, e o que chega ao mínimo entra em Para repor
- **Use em vários aparelhos (opcional):** orçamentos, preços e ajustes sincronizados, criptografados, num gist secreto da sua conta GitHub
- **Avalie o app e relate problemas** pelo balão no alto da tela (ou em Ajustes → Avaliação e feedback)
- **Nuvem no alto da tela:** mostra se os dados estão sincronizados, sincronizando, pendentes, com erro ou sem internet
- **Ajustes na barra de baixo** (no computador, no pé do menu lateral), com as mesmas guias nos três apps
- **Pague um chopp para o criador!** O app é gratuito; o chopp no alto da tela, entre a nuvem e o balão, abre o Pix (QR code e copia e cola), se você quiser apoiar
- **Novidades:** depois de cada atualização, o app mostra uma vez o que mudou
- Listas de escolha desenhadas pelo próprio app e o mesmo caminho (categoria, depois item) para cadastrar preço, material e ferramenta
- Tema claro, escuro ou automático; funciona sem internet depois da primeira visita

## Como usar

Abra o endereço em qualquer navegador, no celular, no tablet ou no computador. Para instalar:

- **iPhone:** no Safari, toque em **Compartilhar → Adicionar à Tela de Início**
- **Android:** no Chrome, menu **⋮ → Instalar app**
- **Computador:** ícone de instalar na barra de endereço do Chrome ou do Edge

Sem a sincronização, os dados ficam só no aparelho; toque na **nuvem** no alto da tela (ou vá em **Ajustes → Sincronização e armazenamento**).

## Onde ficam os dados

| Dado | Onde fica |
|---|---|
| Orçamentos, dados dos clientes, tabela de preços (com o estoque), ferramentas, checklist e ajustes | neste aparelho (armazenamento do navegador, chaves `eletricafacil.*`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho (AES-256) |
| Propostas, relatórios e recibos em PDF | gerados no aparelho; só saem quando o usuário compartilha |
| Avaliações e relatos de problema enviados | Firestore do projeto no Firebase (Google), coleção `feedback`; apagados depois de 2 anos |

O app guarda dados pessoais dos clientes de quem usa (nome, telefone, endereço, CPF ou CNPJ).
A guia **Ajustes → Privacidade e segurança** explica isso para quem usa o app.

## Para desenvolver

O app não tem etapa de build nem dependências: o que está no repositório é o que vai para o ar.
O Node (22 ou mais novo) só é usado para o servidor local, os testes e a verificação do padrão.

```bash
npm start                         # abre em http://localhost:8080/eletrica-facil/
npm install                       # primeira vez: instala o Playwright, usado nos testes
npx playwright install chromium   # primeira vez: baixa o navegador dos testes
npm test                          # testes do Kit Fácil e do app, sem internet
npm run verificar                 # padrão do Projeto Integrador, segredos e versão
```

Os testes simulam o GitHub (sincronização) e o Firebase (avaliações); nada toca nos dados reais.
O modo sem internet (service worker) só funciona em `https`, ou seja, no endereço publicado.

## Interface

- **Seções:** um só modelo de seção em todo o app (o cartão de `panel()`: título, resumo de uma linha, contador ou valor e seta), em qualquer nível e também nas janelas; cada uma abre e fecha sozinha (`KitFacil.secao`), todas começam fechadas e a busca abre as que têm resultado
- **Escolhas em linhas:** nada de botões lado a lado; escolhas são linhas (`linha()` / `linhas()`): bolinha para uma, caixa de marcar para várias, seta para o que abre a próxima etapa, + para o que entra direto. Filtros curtos e a entrada em % usam segmentos (`.seg`). Rascunho no Início: arrastar para a esquerda mostra Excluir, com Desfazer

Segue o padrão comum da família (veja [`comum/PADRAO.md`](comum/PADRAO.md)):

- **Alto da tela, à direita:** Ajustes, nuvem da sincronização e balão de avaliação, nessa ordem. No orçamento e na
  proposta, só a nuvem e o balão (o Voltar e o menu do orçamento ficam à esquerda deles)
- **Navegação:** Orçamentos, Preços e Gestão na barra de baixo (celular e tablet) ou no menu lateral (computador, a partir de 1024 px), com Ajustes por último
- **Ajustes:** as oito guias comuns e as guias próprias **Pix**, **Veículo e deslocamento**, **Adicionais**,
  **Orçamento novo** e **Textos dos documentos**. "Seus dados na proposta" (nome, contato, CPF ou CNPJ e logotipo) fica em Conta e perfil.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | o app inteiro: estrutura, estilo e código |
| `comum/` | **Kit Fácil**: sistema de design comum, barra superior, Ajustes, avaliação, sincronização e o padrão do projeto. Igual nos três apps: não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Serviços externos e configuração

| Serviço | Para quê | Custo | O que configurar |
|---|---|---|---|
| GitHub (gist) | sincronização entre aparelhos | gratuito | nada no projeto; cada pessoa usa a própria conta |
| Firebase (projeto `conta-facil-2c1f9`, compartilhado pelo projeto) | receber as avaliações | plano gratuito | publicar a regra de [`comum/regras-firestore-feedback.txt`](comum/regras-firestore-feedback.txt) |
| Google Fonts, cdnjs | fontes, QR code e PDF | gratuito | nada |

## Exceções ao padrão

- **Contraste dos preços de fábrica (lei 7, contraste AA):** os preços que vêm com o app aparecem em cinza claro
  (`--ref`: `#A6A193` no tema claro, 2,6:1 sobre o branco; `#6E6A5D` no escuro, 3,3:1), abaixo dos 4,5:1 do AA.
  Justificativa (decisão do Bruno, 03/11/2026): o cinza é a única indicação de que o preço ainda é o de fábrica e precisa
  se destacar claramente do preto dos preços do usuário; o mais claro que passa no AA ficava escuro demais. Para não
  depender só da cor: o leitor de tela diz "preço que vem com o app" e a nota no fim de Preços explica o cinza. A levar
  ao Integrador para registro.

- **Lista de escolha, calendário e relógio do Kit perto do pé da tela:** o Kit só rola quando a lista passa do fim da
  janela do navegador; dentro de uma janela do app, a lista pode ficar atrás do rodapé (e, na página, atrás das barras de
  baixo). O app completa: depois de abrir, rola o que falta para o último item aparecer (correção em `index.html`, sem
  mexer no `comum/`). A levar ao Integrador como correção do Kit, para os quatro apps.

## Publicação

GitHub Pages a partir da branch `main`, pasta raiz. Antes de publicar: `npm run verificar` e `npm test`, e confira o app
no celular e no computador. O que mudou em cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

## Uso do código

O código está público durante a fase de testes, sem licença de uso definida: todos os direitos reservados.
