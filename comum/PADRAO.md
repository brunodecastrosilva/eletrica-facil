# Padrão do Projeto Integrador

Regras comuns do **Conta Fácil**, do **Elétrica Fácil** e do **Estudo Fácil** e de qualquer app novo do projeto.
Este arquivo fica em `comum/PADRAO.md`, igual nos três repositórios, junto com o **Kit Fácil** (o código comum).

Versão do padrão: 2.1 · Kit Fácil 2.1.0 · outubro de 2026.

Acima deste padrão estão as **Leis Globais do Projeto Integrador** (projeto Integrador no Claude): se algo aqui contrariar uma lei, vale a lei.

Princípio: **os apps são percebidos como uma família.** A estrutura, os nomes, os ícones, a ordem dos Ajustes, a área
superior e o comportamento são iguais; cada app mantém a sua cor de destaque, a sua marca e as suas funções.

---

## 1. Apps e repositórios

| App | Repositório (público, em testes) | Endereço | Prefixo dos dados |
|---|---|---|---|
| Conta Fácil | `brunodecastrosilva/conta-facil` | `…github.io/conta-facil/` | `contafacil.` |
| Elétrica Fácil | `brunodecastrosilva/eletrica-facil` | `…github.io/eletrica-facil/` | `eletricafacil.` |
| Estudo Fácil | `brunodecastrosilva/estudo-facil` | `…github.io/estudo-facil/` | `estudofacil.` |

Cada app tem o seu repositório, a sua versão e o seu histórico. O que é comum fica copiado na pasta `comum/` de cada um,
sem dependência entre repositórios: um app nunca carrega arquivos de outro.

Os três apps dividem o mesmo endereço (`brunodecastrosilva.github.io`). Por isso:

- tudo o que o app guarda no navegador usa o prefixo do app (`contafacil.draft`, `eletricafacil.quotes`…);
- o service worker de cada app só apaga e só responde pelo que é dele (cache `<app>-<versão>`, pasta do app);
- a chave da sincronização (`<prefixo>sync`) pode ser reaproveitada por outro app da família no mesmo aparelho;
- o `manifest.webmanifest` de cada app tem `"id": "/<app>/"`, com `start_url` e `scope` dentro da pasta do app.
  Com `"id": "./"` os três apps ficam com a mesma identidade e o Chrome diz que um já está instalado quando o outro está.
  O `npm run verificar` confere.

Os repositórios são públicos e **sem licença** (todos os direitos reservados). O GitHub é o ambiente de testes, sem data
para acabar; depois, os apps vão para as lojas de apps.

## 2. Estrutura de cada repositório

```
index.html             o app (estrutura, estilo e código; o Estudo Fácil divide o código em vários .js)
sw.js                  uso sem internet; cache "<app>-<versão>"
manifest.webmanifest   instalação na tela de início
icons/                 ícones do app (192, 512, maskable e apple-touch-icon)
comum/                 Kit Fácil e este padrão — IGUAL nos três repositórios
tests/                 testes automáticos do app
package.json           comandos padrão (sem dependências de produção)
README.md              o que o app faz, como usar, rodar, testar e publicar
CHANGELOG.md           o que mudou em cada versão
```

Nada de etapa de build: o que está no repositório é o que vai para o GitHub Pages.
Bibliotecas de terceiros (QR code, PDF) entram por CDN com versão fixa e só quando a função é usada.

## 3. Comandos padrão

Precisam do Node 22 ou mais novo. Os testes usam o Playwright (`npm install` e `npx playwright install chromium` na primeira vez).

| Comando | O que faz |
|---|---|
| `npm start` | sobe o app em `http://localhost:8080/<app>/`, o mesmo caminho do GitHub Pages |
| `npm test` | roda os testes do Kit Fácil e do app num Chromium, sem internet (GitHub e Firebase simulados) |
| `npm run verificar` | confere o padrão: pasta `comum/` igual nas três cópias, ausência de segredos, versão consistente, arquivos do service worker, idioma, zoom liberado e a interface comum (fonte, moldura, área superior e Ajustes em guias) |

## 4. Versão e publicação

- Versão no formato `maior.menor.correção` (por exemplo, `2.6.0`).
- A versão aparece em quatro lugares, sempre iguais (o `npm run verificar` confere):
  `package.json`, a constante `VERSAO` do código, o cache do `sw.js` (`<app>-<versão>`) e o topo do `CHANGELOG.md`.
- Os arquivos `.js` próprios do app são carregados com `?v=<versão>` quando a página os lista.
- Antes de publicar: `npm run verificar`, `npm test`, abrir o app no celular e no computador, conferir o modo escuro.
- Publicar = enviar para a branch `main`, direto (não há repositório nem branch de homologação, por decisão do projeto). O GitHub Pages atualiza sozinho; o service worker baixa a versão nova na próxima abertura.
- Cada versão nova informa as **novidades** em `KitFacil.iniciar({ novidades: [{ versao, itens }] })`, com as mesmas
  linhas do CHANGELOG escritas para quem usa (item 6A).
- Commits em português, dizendo o que muda para quem usa ("Ajustes em guias, iguais nos três apps").

## 5. Dados e sincronização entre aparelhos

**Onde ficam os dados.** No aparelho, no armazenamento do navegador (`localStorage`), com o prefixo do app.
O app funciona sem conta e sem internet.

**Sincronização (opcional, igual nos três apps).** Motor `KitFacil.sync`:

- os dados vão para um **gist secreto** na conta GitHub do usuário, no arquivo `<app>.json`;
- o conteúdo é **criptografado no aparelho** (AES-GCM de 256 bits; chave derivada do código de acesso do GitHub com
  PBKDF2-SHA-256, 150 mil iterações, sal `<app>:<login>`); o GitHub só vê um texto embaralhado;
- cada registro (orçamento, comanda, edital, preço, campo dos ajustes…) guarda a hora da última mudança;
  ao juntar, **a mudança mais recente vence**, registro a registro; exclusões ficam marcadas por 400 dias para não
  "ressuscitarem" num aparelho que estava desligado;
- sincroniza 2,5 s depois de cada mudança, ao abrir o app, ao voltar para ele, quando a internet volta e a cada minuto com o app aberto;
- o código de acesso fica só no aparelho. Para levar a outro aparelho: link `#/conectar/<chave>` (depois do `#`, nunca vai
  para servidor nenhum) ou colar a chave. A mesma chave serve para os três apps;
- a chave pede só a permissão `gist`.

O que **não** sincroniza, de propósito: preferências do aparelho (tema, som do fim do tempo), a comanda aberta do Conta Fácil
(para dividir a mesma comanda entre celulares, use a comanda ao vivo) e o orçamento de exemplo do Elétrica Fácil.

Cada app decide como junta os próprios dados (funções `carimbar`, `aplicar`, `pacote` e `mesmo` passadas ao motor).
O formato do arquivo no gist é o mesmo das versões anteriores: aparelhos com versões diferentes continuam se entendendo.

> Limite conhecido: pedir uma conta GitHub e um código de acesso é aceitável na fase de testes, mas é uma barreira para o
> público geral. Para a versão comercial, o caminho recomendado é login próprio (por exemplo, Firebase Authentication
> com e-mail ou Google) mantendo a mesma regra de junção por registro.

**Estado da nuvem.** O ícone de nuvem no alto da tela mostra sempre o estado real, calculado pelo motor:

| Estado (`data-estado`) | Texto na tela | Quando | Selo no ícone |
|---|---|---|---|
| `sincronizado` | Sincronizado | conectado, sem mudanças por enviar, último envio confirmado | verde, com ✓ |
| `sincronizando` | Sincronizando | conversando com o GitHub agora | cor de destaque do app, setas girando |
| `pendente` | Alterações a enviar | há mudança neste aparelho que ainda não foi enviada (ou nunca sincronizou) | amarelo, com seta para cima |
| `erro` | Erro na sincronização | a última tentativa falhou (chave recusada, limite do GitHub, servidor fora) | vermelho, com "!"; a nuvem fica vermelha |
| `offline` | Sem internet | o aparelho está sem internet | nuvem cinza cortada por um traço |
| `desligada` | Sincronização desligada | a sincronização não foi ativada neste aparelho | cinza, com "–" |

O estado nunca depende só da cor: cada um tem forma própria e o nome acessível do botão diz o estado por extenso.

Tocar na nuvem abre uma janela com o estado, a conta, a última sincronização e a ação certa para o momento
(Ativar sincronização, Sincronizar agora, Tentar de novo, Colar chave nova) e um atalho para *Ajustes → Sincronização e armazenamento*.

**Cópia de segurança.** *Ajustes → Sincronização e armazenamento → Cópia de segurança*: baixar e restaurar um arquivo `.json`.
Formato padrão: `{ formato: "copia-facil", app, esquema, versaoApp, em, dados }` (`KitFacil.copia`).
Os apps continuam lendo os formatos antigos que já tinham.

## 6. Avaliação e feedback

Mesmo fluxo, mesmos componentes, mesma validação e mesmo destino em todos os apps (`KitFacil.feedback`).

**Onde fica.** No **balão** do alto da tela (em todas as telas principais e internas) e em *Ajustes → Avaliação e feedback*.
O balão abre a escolha entre duas opções:

| Opção | Campos | Obrigatório |
|---|---|---|
| **Avaliar o app** | nota de 1 a 5 estrelas; tipo do comentário (elogio, sugestão, crítica); comentário; contato | a nota |
| **Relatar um problema** | categoria (algo não funciona, erro ou travamento, dados ou sincronização, tela ou texto, outro); gravidade (baixa, média, alta); descrição; contato; informações técnicas | a descrição |

O app e a versão vão sempre, sem a pessoa digitar. As informações técnicas (sistema, navegador, tamanho da tela,
app instalado ou não, idioma e últimos erros) vão só se a pessoa deixar marcado — já vem marcado no relato de problema
e desmarcado na avaliação. **Anexos não são aceitos**: guardar arquivos exigiria o Firebase Storage (custo e cuidado
com dados pessoais em capturas de tela); quem precisar mandar uma imagem deixa o contato e recebe resposta.

**Campos gravados (esquema 1)**

| Campo | Conteúdo |
|---|---|
| `esquema` | 1 |
| `app`, `versao` | qual app e qual versão |
| `nota` | 1 a 5 estrelas (0 no relato de problema) |
| `tipo` | `avaliacao` (só a nota), `elogio`, `sugestao`, `critica` ou `problema` |
| `mensagem` | até 2.000 caracteres |
| `categoria`, `gravidade` | só no relato de problema, se escolhidos |
| `contato` | opcional, até 120 caracteres (e-mail ou WhatsApp para resposta) |
| `tela` | em que tela a pessoa estava |
| `tecnico` | só se a pessoa deixar marcado |
| `enviadoEm` | data e hora do aparelho |

**Destino.** Coleção `feedback` do Firestore do projeto no Firebase (plano gratuito), pela API REST, sem biblioteca extra.
A regra em `comum/regras-firestore-feedback.txt` só aceita registros nesse formato e não deixa ninguém ler pelos apps.
As avaliações são lidas no console do Firebase. Enquanto a regra nova não estiver publicada, o relato com categoria e
gravidade é reenviado com essas duas informações no início do texto, e nada se perde.

**Entrega.** Se não sair (sem internet ou regra ainda não publicada), a mensagem fica numa fila no aparelho, o balão ganha
um ponto de aviso e o app tenta de novo ao abrir e quando a conexão volta (até 30 tentativas ou 60 dias). A tela nunca diz
"enviado" sem a confirmação do servidor. Cada mensagem tem um identificador próprio, então reenviar não duplica.

## 6A. Apoio ao criador, novidades e boas-vindas (Kit Fácil 2.1)

**Apoio ao criador (lei 13).** Os apps são gratuitos e nenhuma função depende de pagamento. O convite é o mesmo nos três:
"Gostando do app? Pague um chopp para o criador!" (`KitFacil.apoio`).

- ícone de caneca de chopp na área superior, primeiro à esquerda da nuvem, **só nas telas principais**;
  atalho também em *Sobre o aplicativo*;
- tocar abre a janela "Pague um chopp para o criador!" com o QR code do Pix e os botões **Copiar código Pix**
  (copia e cola) e **Copiar chave**; não abre sozinho, não interrompe tarefas e não bloqueia nada;
- a chave Pix é **aleatória** (nunca CPF, telefone ou e-mail no código público). Chave, nome e cidade ficam em
  `APOIO_PADRAO`, no `kit-facil.js`, iguais para os três apps; sem chave, o chopp não aparece;
- o código copia e cola segue o padrão BR Code do Banco Central, sem valor (quem paga escolhe);
- o QR code usa a biblioteca `qrcode-generator` 1.4.4 do cdnjs, carregada só quando a janela abre; sem internet, a janela
  mostra o aviso e o código continua copiável.

**Novidades.** Na primeira abertura depois de uma atualização, a janela "Novidades do <app>" mostra o que mudou, uma vez
só (chave `kitfacil.<app>.visto`). A lista também fica em *Sobre o aplicativo → Novidades desta versão*.

**Boas-vindas.** Quem nunca usou o app vê, uma vez, a janela "Boas-vindas ao <app>" com o resumo, os primeiros passos e,
se o app tiver, o botão do exemplo (`KitFacil.iniciar({ boasVindas: { novo, passos, exemplo, rotuloExemplo } })`).
Quem vê as boas-vindas não vê as novidades na mesma abertura. Exceção registrada: o Estudo Fácil tem uma tela própria de
primeiro uso (escolha do edital e da rotina), que faz esse papel.

## 7. Interface comum

### 7.1 Moldura (igual nos três apps)

| | Celular e tablet (até 1023 px) | Computador (1024 px ou mais) |
|---|---|---|
| Barra de cima (`kf-barra`) | marca à esquerda; à direita, a área superior (7.2) | só a área superior, à direita (a marca vai para o trilho) |
| Navegação | barra fixa embaixo (`kf-nav`), ícone + nome, item atual destacado com a cor do app; **Ajustes é o último item** | trilho lateral fixo de 240 px (`kf-trilho`), com a marca e as seções; **Ajustes fica no pé do trilho** |
| Telas internas (um orçamento, uma proposta) | Voltar + título à esquerda; ações da tela; nuvem e balão à direita; a navegação de baixo pode sumir para dar lugar à barra de ações da tela | o trilho continua visível |

- **Ajustes fica na navegação**, em todos os apps: último item da barra de baixo e, no computador, no pé do trilho
  (`KitFacil.nav.ajustes('nav')` e `KitFacil.nav.ajustes('trilho')`). O item fica destacado enquanto os Ajustes estão
  abertos; tocar nele de novo volta para a lista de guias.
- A página usa `body.kf-casca`; no computador o conteúdo começa depois do trilho e fica centralizado no espaço que sobra.
- Barras e botões fixos do app (barra de total, botão flutuante, avisos) sobem acima da navegação de baixo e,
  no computador, começam depois do trilho.
- Quando o app precisa de uma ação própria na barra de cima (o Estudo Fácil tem *Desempenho*), ela fica à esquerda da
  área superior; abaixo de 400 px a marca mostra só o ícone (`kf-marca-compacta`), com o nome mantido para leitores de tela.

### 7.2 Área superior direita

Sempre no canto superior direito, nesta ordem e lado a lado: **chopp** · **nuvem** · **balão**
(`KitFacil.topo.html({ principal: true })`). Nas telas internas, só nuvem e balão (`{ principal: false }`).

- área de toque de 44 × 44 px, ícones de 24 px, distância de no máximo 24 px da borda direita;
- nomes acessíveis: "Pague um chopp para o criador"; "Sincronização: <estado>. Ver detalhes"; "Avaliação e feedback";
- o balão mostra um ponto quando há mensagem guardada à espera de envio.

### 7.3 Tela de Ajustes

Lista de guias à esquerda (ou em tela cheia no celular) e a guia aberta à direita (`KitFacil.ajustes`):

1. **Conta e perfil** — sem cadastro; conta GitHub da sincronização, quando ligada; dados do perfil próprios do app
2. **Sincronização e armazenamento** — estado da nuvem, conta, última sincronização, ações; espaço usado neste aparelho; cópia de segurança
3. **Aparência** — tema Automático, Claro ou Escuro
4. **Preferências gerais** — idioma, moeda, data e hora; instalar o app
5. **Notificações** — o que o app avisa e como (nenhum app envia notificações para o aparelho hoje)
6. **Privacidade e segurança** — onde ficam os dados, segurança da chave, desconectar, apagar os dados deste aparelho
7. **Avaliação e feedback** — as mesmas duas opções do balão
8. **Sobre o aplicativo** — versão, fase de testes, termos e políticas, novidades desta versão, apoio ao criador, outros apps da família, versão do Kit Fácil

Depois delas, num grupo com o nome do app, as **guias próprias**. Elas não mudam a ordem, os nomes, os ícones nem os
componentes das guias comuns; conteúdo extra do app numa guia comum entra pelo campo `extras` (por exemplo, "Seus dados
na proposta" do Elétrica Fácil em Conta e perfil).

| App | Guias próprias | Extras nas guias comuns |
|---|---|---|
| Conta Fácil | Comandas (comanda ao vivo, guia do app, atalho para Cadastros) | Conta e perfil: "Você nas comandas" |
| Elétrica Fácil | Pix · Veículo e deslocamento · Adicionais · Orçamento novo · Textos dos documentos | Conta e perfil: "Seus dados na proposta" (nome, contato, CPF/CNPJ, logotipo) |
| Estudo Fácil | Rotina e metas · Revisões | Notificações: som e vibração no fim do tempo · Privacidade e segurança: apagar todos os dados (inclusive na nuvem) |

Comportamento: no celular, tocar numa guia abre a guia em tela cheia com "‹ Ajustes" no alto, e o Voltar do aparelho
volta para a lista; a partir de 720 px de largura da área de conteúdo, lista e guia ficam lado a lado (a primeira guia já
aberta) e trocar de guia não empilha o histórico. Cada guia da lista tem uma linha de resumo que acompanha as mudanças.

### 7.4 Sistema de design (`comum/kit-facil.css`)

**Comum a todos os apps** (definido no kit; o app não redefine):

| Grupo | Tokens |
|---|---|
| Fonte | Atkinson Hyperlegible Next (`--kf-font`, `--kf-font-display`) e Mono (`--kf-font-mono`), carregadas do Google Fonts com `family=Atkinson+Hyperlegible+Mono:wght@400..700&family=Atkinson+Hyperlegible+Next:wght@400..800`. Exceção documentada: o cupom do Conta Fácil usa IBM Plex Mono, que imita papel de impressora térmica |
| Tamanhos de texto | `--kf-t-tela` 28 · `--kf-t-secao` 21 · `--kf-t-cartao` 17 · `--kf-t-corpo` 16 · `--kf-t-apoio` 14 · `--kf-t-legenda` 12,5 px |
| Espaços | múltiplos de 4: `--kf-e-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 24 · `-6` 32 px |
| Cantos | `--kf-r-sm` 8 · `--kf-r-btn` 12 · `--kf-r-campo` 12 · `--kf-r-md` 16 · `--kf-r-lg` 22 px |
| Moldura | `--kf-barra-h` 60 · `--kf-nav-h` 64 · `--kf-trilho-w` 240 · `--kf-alvo` 44 px |
| Estados | `--kf-ok` (sucesso), `--kf-warn` (aviso, pendente), `--kf-bad` (erro, ação destrutiva) e os fundos `-soft`; `--kf-star` (estrelas). Claro e escuro |

**De cada app** (ligado no `:root` do app, claro e escuro): a cor de destaque e os neutros tingidos por ela.

| | Conta Fácil | Elétrica Fácil | Estudo Fácil |
|---|---|---|---|
| Ideia | comanda de boteco | ferramenta de obra | caderno e marca-texto |
| Destaque (`--kf-accent`) | verde azulejo `#1D5A3B` | amarelo de segurança `#FFC400` | azul caneta `#2742D3` |
| Neutros | fundo esverdeado | fundo cimento | fundo papel azulado |

Variáveis que o app liga: `--kf-bg`, `--kf-surface`, `--kf-surface-2`, `--kf-line`, `--kf-line-2`, `--kf-ink`,
`--kf-muted`, `--kf-accent`, `--kf-accent-ink`, `--kf-accent-soft`, `--kf-accent-texto` (destaque legível sobre o fundo),
`--kf-focus`, `--kf-scrim`, `--kf-shadow`. As cores de estado do próprio app (`--ok`, `--bad`, `--warn`…) apontam
para as do kit, para sucesso, aviso e erro serem iguais na família.

**Componentes:**

| Componente | Classe ou função | Regras |
|---|---|---|
| Botões | `kf-btn` + `kf-pri` (principal, um por área), `kf-sec` (contorno), `kf-perigo` / `kf-perigo-sec` (destrutivo), `kf-link` | altura mínima 44 px; verbo no rótulo |
| Campos | `kf-entrada`, `kf-rotulo`, `kf-ajuda`, `kf-opcional`, `kf-check` | rótulo visível; fonte de 16 px; ajuda abaixo |
| Escolhas | pílulas `kf-opcoes`, segmentos `kf-seg`, estrelas `kf-estrelas`, escolhas grandes `kf-escolha` | teclado e leitor de tela funcionam (rádios de verdade) |
| Janelas | `KitFacil.dialogo.abrir`, `.confirmar` | sobe do pé da tela no celular, no centro em telas largas; foco preso; Esc fecha; o foco volta para quem abriu |
| Blocos | `kf-bloco` (título `h3`), `kf-dados` (lista de rótulo e valor) | |
| Estados | carregando `kf-carregando`; sucesso `kf-fim`; aviso `kf-aviso` (`kf-ok`, `kf-alerta`, `kf-ruim`); vazio `kf-vazio`; estado da nuvem `kf-estado` | a mensagem diz o que aconteceu e o que fazer; nunca só pela cor |
| Aviso rápido | o `toast` do app | some sozinho; ação opcional ("Desfazer") |
| Ícones | traço de 2 px, cantos arredondados, 24 × 24 (`kf-i`) | mesmo ícone para a mesma ideia nos três apps (controles deslizantes = Ajustes, caneca = chopp, nuvem = sincronização, balão = avaliação) |

**Camadas (z-index):** 20 barra de cima e trilho · 25–30 navegação e barras fixas · 45–80 janelas do app ·
85 janelas do Kit Fácil · 95 avisos rápidos (toast).

### 7.5 Textos

Português do Brasil, frases curtas, tom direto e respeitoso; botões com verbo ("Salvar", "Enviar", "Ativar
sincronização"); mensagens de erro dizem o que fazer ("Sem internet agora. Sincroniza quando a conexão voltar.").
Os nomes das guias, dos estados da nuvem e das opções do balão são exatamente os deste documento.

### 7.6 Acessibilidade (obrigatório)

- `<html lang="pt-BR">`; zoom livre (sem `maximum-scale=1` nem `user-scalable=no`);
- campos com rótulo visível ou `aria-label`; botões só com ícone com `aria-label`;
- foco visível em tudo que é clicável; janelas com `role="dialog"`, `aria-modal`, foco preso dentro, Esc fecha e o foco volta para quem abriu;
- alvos de toque com pelo menos 44 px; campos com fonte de 16 px (o iPhone não dá zoom sozinho ao tocar);
- contraste AA nos textos; informação nunca só pela cor; `prefers-reduced-motion` respeitado; modo escuro em todas as telas.

## 8. Web e responsividade

Todo app é um app web completo (não existe versão "só celular"). Telas de referência nos testes:
celular pequeno 360 × 740, celular 390 × 844, tablet 820 × 1180 e computador 1440 × 900. Nenhuma tela pode ter rolagem lateral.
Os testes de cada app conferem a área superior (`conferirTopo`), o item Ajustes na navegação (`conferirNavAjustes`),
as guias dos Ajustes (`guiasAjustes`) e a navegação (barra de baixo ou trilho) nesses tamanhos. Respeitar as áreas seguras (`env(safe-area-inset-*)`).
O app é instalável (PWA) e abre sem internet depois da primeira visita.

## 9. Segurança e privacidade

- Nunca guardar no repositório: códigos de acesso, senhas, chaves privadas, dados pessoais reais. `npm run verificar` procura.
- A configuração web do Firebase (`apiKey`, `projectId`) é pública por natureza; a proteção são as regras do Firestore.
  Recomendado: restringir a chave por referenciador (`https://brunodecastrosilva.github.io/*`) e ativar o App Check.
- O código de acesso do GitHub fica só no aparelho, com permissão apenas de `gist`.
- Texto vindo do usuário é sempre escapado antes de ir para a tela (`esc`).
- *Ajustes → Privacidade e segurança* diz, em linguagem simples, onde ficam os dados de cada app e permite apagar os
  dados do aparelho. Antes de vender ou divulgar amplamente, revisar com assessoria jurídica: termos de uso e política de
  privacidade conforme a LGPD (o Elétrica Fácil guarda dados de clientes do usuário: nome, telefone, endereço e CPF/CNPJ).
  Enquanto não existirem, *Sobre o aplicativo* diz "Termos de uso: ainda não publicados". Os rascunhos (em nome do criador,
  contato cas_bruno@outlook.com) ficam no projeto Integrador, à espera de revisão jurídica.

## 10. Como mudar o Kit Fácil

1. Altere `comum/` num dos repositórios e aumente a `VERSAO` em `comum/kit-facil.js` quando mudar comportamento.
2. Rode `node comum/verificar.mjs --gerar` para atualizar o `comum/MANIFESTO.json`.
3. Copie a pasta `comum/` inteira para os outros dois repositórios.
4. Em cada um: `npm run verificar` e `npm test`; aumente a versão do app se ele mudou para quem usa; registre no CHANGELOG.

## 11. App novo no projeto

Copiar a pasta `comum/`, o `package.json` (trocando nome e versão), o modelo do `sw.js` e a estrutura do README;
incluir o app em `FAMILIA` (em `kit-facil.js`) e na regra do Firestore (`app in [...]`); ligar as variáveis `--kf-*`;
`manifest.webmanifest` com `"id": "/<app>/"`; montar a moldura do item 7.1 com a área superior do 7.2 e o item Ajustes
na navegação; montar os Ajustes com `KitFacil.ajustes.html` (guias comuns e as guias próprias); chamar
`KitFacil.iniciar` com nome, versão, `abrirAjustes`, `emAjustes`, `copia`, `novidades`, `boasVindas` e o que o app guarda.
