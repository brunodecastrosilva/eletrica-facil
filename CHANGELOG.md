# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`.

## 2.13.0 · 2026-10-30

- **Data da aprovação:** usa o calendário do próprio app (o mesmo do prazo), sem datas futuras, no lugar do
  calendário do sistema. Nenhuma tela do app usa mais a lista ou o calendário do sistema.
- **Comprei:** na caixa de uma ferramenta que está em Quero comprar, o botão Comprei pede marca e modelo (com a
  quantidade da lista) e passa a ferramenta para Minhas ferramentas, tirando-a da lista de compras.
- **Kit Fácil 2.5.0:** a lista de escolha e o movimento das seções saíram do app e passaram para o Kit, iguais nos três
  apps (Leis Globais, lei 10). Para quem usa, nada muda no Elétrica Fácil.

## 2.12.0 · 2026-10-30

- **Listas de escolha do próprio app:** todas as listas suspensas (unidade, prazo, categoria, material, ferramenta,
  ambiente) passam a ser desenhadas pelo app, iguais em iPhone, Android e computador. A lista abre na própria tela,
  com a opção escolhida marcada; funciona com teclado (setas, Enter, Esc) e leitor de tela.
- **Ferramentas:** três listas, **Minhas ferramentas**, **Quero comprar** e **Ferramentas cadastradas** (o catálogo
  do app mais as que você criou). Os botões de estado saíram da lista: cada linha tem a seta de abrir e leva à caixa
  da ferramenta, onde você diz se ela é sua (marca, modelo e quantidade) ou se quer comprar.
- **Várias do mesmo tipo:** dá para ter, por exemplo, dois multímetros de marcas ou modelos diferentes. Cadastrar de
  novo a mesma marca e modelo soma na quantidade.
- **Mesmo padrão em todo o app:** Nova ferramenta, Novo material no estoque e Novo item em Preços começam pela
  categoria e seguem para o item. As linhas que abrem alguma coisa (Preços, Estoque, Ferramentas) têm a seta à direita.
- Quem usava a 2.9 a 2.11 tem as ferramentas convertidas sozinhas. Atualize todos os aparelhos sincronizados para a
  2.12: uma versão anterior não entende o formato novo das ferramentas.

## 2.11.0 · 2026-10-30

- **Seções do orçamento:** o botão Próximo saiu; basta tocar na seção que você quer abrir. A animação ficou mais
  lenta e suave (abre e pousa devagar), e a rolagem segue o mesmo relógio da seção.
- **Correção no tablet e no computador:** quando todas as seções cabem na tela, a seção aberta não sobe além do
  possível e a tela não dá mais o tranco no fim da animação.
- **Ferramentas pré-cadastradas:** mais de 50 ferramentas de eletricista em 8 categorias (medição e teste, alicates,
  chaves, furação e corte, passagem de fios, instalação e acabamento, acesso, EPI). Cada uma fica como Não tenho,
  Tenho (com quantidade) ou Quero comprar; o toque no estado troca. Filtros Tenho, Quero comprar e Todas, e busca.
- **Estoque integrado aos Preços:** o material novo no estoque começa pela categoria e depois pelo material da tabela
  de Preços dessa categoria (com o preço e a unidade de lá). Material ou categoria nova entra também em Preços.
- **Lista de compras:** botão na Gestão com o material que chegou ao mínimo (com quantidade sugerida) e as
  ferramentas marcadas como Quero comprar; marque o que vai, ajuste as quantidades e copie ou mande pelo WhatsApp.
- **Prazo padrão:** em Ajustes, Orçamento novo, o prazo (quantidade e unidade) com que todo orçamento começa.
- **Correção:** a 2.10 trocava por 1 dia útil o prazo em texto dos orçamentos antigos (ex.: "2 dias úteis"); o prazo
  original volta sozinho.
- **Correção:** no estoque, a quantidade 0 (material que acabou) era recusada.

## 2.10.0 · 2026-10-30

- **Prazo de execução integrado às datas:** o prazo tem quantidade e unidade (dias úteis, dias corridos, semanas ou
  meses) e fica junto do calendário, na seção Pagamento, datas e garantia. Ao tocar no dia de início, o app marca os
  dias do prazo: dias úteis pulam sábados, domingos e feriados nacionais (que aparecem marcados no calendário).
  Depois é só tocar num dia para pôr ou tirar. Mudar o prazo remarca a partir do mesmo início.
- **Conferência do prazo:** o app avisa quando os dias marcados não conferem com o prazo (ou passam do fim de um
  prazo em semanas ou meses) e oferece o prazo que cobre os dias marcados.
- **Sem data retroativa:** o orçamento não deixa marcar dias que já passaram; um rascunho ou orçamento enviado com
  datas vencidas pede um novo início. O relatório continua aceitando só dias que já passaram.
- **Baixa no estoque:** ao concluir um serviço, abre a janela Dar baixa no estoque com o material do orçamento que
  está no estoque, a quantidade usada (ajustável) e quanto sobra. Desfazer a conclusão devolve o material.
- **Estoque baixo:** cada material pode ter o campo "Avisar quando chegar a". No mínimo (ou zerado), ele aparece em
  Para repor, no alto do estoque, e com aviso ao montar o orçamento.
- **Animação:** abrir e fechar seções ficou mais suave e no mesmo ritmo da rolagem. O título da seção não salta
  mais quando o resumo de uma linha aparece ou some.
- A proposta, o PDF e o WhatsApp mostram o prazo com a unidade e os dias de serviço de forma resumida.

## 2.9.0 · 2026-10-30

- **Gestão (nova guia na barra de baixo, entre Preços e Ajustes):**
  - **Estoque:** o material que você tem guardado, com marca (opcional), quantidade, unidade, custo de compra e preço de
    repasse, com a margem calculada. O material do estoque é o mesmo item da tabela de Preços: o repasse é o preço que
    vai para o orçamento, e a lista de material do orçamento mostra quanto há em estoque.
  - **Ferramentas:** as que você tem (com quantidade e marca opcional) e as que quer comprar; o botão Comprei passa uma
    ferramenta da lista de compras para Tenho.
  - **Checklist:** uma lista fixa para conferir antes de ir para a obra e antes de voltar. Os itens que ficam na obra
    (material usado) só aparecem na ida. Dá para adicionar todas as ferramentas de uma vez e desmarcar tudo no fim.
  - Estoque, ferramentas e checklist entram na sincronização e na cópia de segurança.
- **Dias de serviço:** o orçamento e o relatório têm o campo de dias de serviço e um calendário para marcar cada dia,
  inclusive dias não seguidos. Se a quantidade não conferir com os dias marcados, o app avisa e oferece a correção.
  A proposta, o relatório, o PDF e a mensagem do WhatsApp mostram os dias marcados.
- **Proposta:** novo botão Concluir e voltar à lista, que confirma que o orçamento foi salvo. No alto do orçamento,
  "Salvo" confirma cada alteração guardada no aparelho.
- **Botão Próximo:** a seção seguinte abre com uma animação suave e a tela acompanha, sem saltos. Abrir e fechar
  qualquer seção também ficou suave. Quem pede movimento reduzido no aparelho vê a troca sem animação.
- **Tela inicial:** os filtros ficam na ordem Todos, Em aberto, Concluídos e Recusados, e a lista abre em Todos.
- **Unidades novas:** peça, par, rolo, caixa, pacote, barra, quilo e litro.
- **Correção:** depois de mexer num orçamento, um toque podia abrir a mesma tela várias vezes, e a seta Voltar
  precisava de vários toques para sair.
- **Correção:** os botões de mais e menos não cabiam nos campos de quantidade em telas pequenas.
- **Correção:** no celular pequeno, o botão ⋯ da barra da proposta passava da borda da tela.

## 2.8.1 · 2026-10-30

- Ajustes internos do Kit Fácil, sem mudança para quem usa.
- Kit Fácil 2.4.0: tira partes antigas que nenhum app usava mais (`ajudaHTML`, `kf-marca-compacta`, a opção `topo.html({ ajustes })`).

## 2.8.0 · 2026-10-29

- O botão Novo orçamento (e Novo item, na tabela de preços) não cobre mais o fim da lista. No computador, ele fica no topo da lista.
- Listas vazias explicam o que aparece ali e o que fazer, no mesmo formato nos três apps.
- Janelas e avisos iguais aos dos outros apps.
- Boas-vindas uma vez só: a tela inicial já mostra os passos e o orçamento de exemplo.
- Botões, filtros e links maiores, mais fáceis de tocar (no mínimo 44 px).
- Kit Fácil 2.3.0: cabeçalho de tela, botão de criar, estado vazio, aviso com ação e janela com subtítulo, altura e largura, comuns aos três apps.

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
