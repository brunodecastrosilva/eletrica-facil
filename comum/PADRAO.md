# Padrão do Projeto Integrador

Regras comuns do **Conta Fácil**, do **Elétrica Fácil** e do **Estudo Fácil** e de qualquer app novo do projeto.
Este arquivo fica em `comum/PADRAO.md`, igual nos três repositórios, junto com o **Kit Fácil** (o código comum).

Versão do padrão: 1.0 · Kit Fácil 1.0.0 · outubro de 2026.

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
- a chave da sincronização (`<prefixo>sync`) pode ser reaproveitada por outro app da família no mesmo aparelho.

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
| `npm run verificar` | confere o padrão: pasta `comum/` igual nas três cópias, ausência de segredos, versão consistente, arquivos do service worker, idioma e zoom liberado |

## 4. Versão e publicação

- Versão no formato `maior.menor.correção` (por exemplo, `2.5.0`).
- A versão aparece em quatro lugares, sempre iguais (o `npm run verificar` confere):
  `package.json`, a constante `VERSAO` do código, o cache do `sw.js` (`<app>-<versão>`) e o topo do `CHANGELOG.md`.
- Os arquivos `.js` próprios do app são carregados com `?v=<versão>` quando a página os lista.
- Antes de publicar: `npm run verificar`, `npm test`, abrir o app no celular e no computador, conferir o modo escuro.
- Publicar = enviar para a branch `main`. O GitHub Pages atualiza sozinho; o service worker baixa a versão nova na próxima abertura.
- Commits em português, no imperativo ou descritivos, dizendo o que muda para quem usa ("Avaliação e feedback no app").

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
  para servidor nenhum) ou colar a chave em Ajustes;
- a chave pede só a permissão `gist`.

O que **não** sincroniza, de propósito: preferências do aparelho (tema), a comanda aberta do Conta Fácil (para dividir a
mesma comanda entre celulares, use a comanda ao vivo) e o orçamento de exemplo do Elétrica Fácil.

Cada app decide como junta os próprios dados (funções `carimbar`, `aplicar`, `pacote` e `mesmo` passadas ao motor).
O formato do arquivo no gist é o mesmo das versões anteriores: aparelhos com versões diferentes continuam se entendendo.

> Limite conhecido: pedir uma conta GitHub e um código de acesso é aceitável na fase de testes, mas é uma barreira para o
> público geral. Para a versão comercial, o caminho recomendado é login próprio (por exemplo, Firebase Authentication
> com e-mail ou Google) mantendo a mesma regra de junção por registro.

**Cópia de segurança.** Ajustes → Cópia de segurança: baixar e restaurar um arquivo `.json`.
Formato padrão para cópias novas: `{ formato: "copia-facil", app, esquema, versaoApp, em, dados }` (`KitFacil.copia`).
Os apps continuam lendo os formatos antigos que já tinham.

## 6. Avaliação e feedback

Mesmo formulário, mesmos campos e mesmo destino em todos os apps (`KitFacil.feedback`).

**Onde fica.** Ajustes → *Ajude a melhorar* (Avaliar o app, Relatar um problema) e na janela *Sobre e privacidade*.

**Campos (esquema 1)**

| Campo | Conteúdo |
|---|---|
| `esquema` | 1 |
| `app`, `versao` | qual app e qual versão |
| `nota` | 1 a 5 estrelas (0 = sem nota) |
| `tipo` | `avaliacao` (só a nota), `elogio`, `sugestao`, `critica` ou `problema` |
| `mensagem` | até 2.000 caracteres (obrigatória em sugestão, crítica e problema) |
| `contato` | opcional, até 120 caracteres (e-mail ou WhatsApp para resposta) |
| `tela` | em que tela a pessoa estava |
| `tecnico` | só se a pessoa deixar marcado: sistema, navegador, tamanho da tela, app instalado ou não, idioma e últimos erros |
| `enviadoEm` | data e hora do aparelho |

**Destino.** Coleção `feedback` do Firestore do projeto no Firebase (plano gratuito), pela API REST, sem biblioteca extra.
A regra em `comum/regras-firestore-feedback.txt` só aceita registros nesse formato e não deixa ninguém ler pelos apps.
As avaliações são lidas no console do Firebase.

**Entrega.** Se não sair (sem internet ou regra ainda não publicada), a mensagem fica numa fila no aparelho e o app tenta
de novo ao abrir e quando a conexão volta (até 30 tentativas ou 60 dias). A tela nunca diz "enviado" sem a confirmação do servidor.
Cada mensagem tem um identificador próprio, então reenviar não duplica.

## 7. Identidade visual e experiência

**Cada app tem a sua cara; a estrutura é a mesma.**

| | Conta Fácil | Elétrica Fácil | Estudo Fácil |
|---|---|---|---|
| Ideia | comanda de boteco | ferramenta de obra | caderno e marca-texto |
| Cor de destaque (`--kf-accent`) | verde azulejo `#1D5A3B` | amarelo de segurança `#FFC400` | azul caneta `#2742D3` |
| Fontes | Bricolage Grotesque, Figtree | Archivo, Barlow | Atkinson Hyperlegible |

**Variáveis do padrão (tokens).** Todo app define, no `:root`, as variáveis `--kf-*` a partir da própria paleta
(claro e escuro). Os componentes do Kit Fácil usam só essas variáveis:

`--kf-bg`, `--kf-surface`, `--kf-surface-2`, `--kf-line`, `--kf-line-2`, `--kf-ink`, `--kf-muted`,
`--kf-accent`, `--kf-accent-ink`, `--kf-accent-soft`, `--kf-focus`, `--kf-ok`, `--kf-ok-soft`, `--kf-warn`, `--kf-warn-soft`,
`--kf-bad`, `--kf-bad-soft`, `--kf-star`, `--kf-scrim`, `--kf-shadow`, `--kf-font`, `--kf-font-display`, `--kf-r-lg`, `--kf-r-btn`, `--kf-r-campo`.

**Componentes comuns (Kit Fácil):** janela (diálogo) que sobe do pé da tela no celular e fica no centro em telas largas;
botões `kf-btn` (`kf-pri` principal, `kf-sec` contorno, `kf-perigo`, `kf-link`); campos `kf-entrada`; nota em estrelas;
escolha em pílulas; seletor de tema; avisos `kf-aviso` (`kf-ok`, `kf-alerta`, `kf-ruim`); passos numerados.

**Tela de Ajustes, sempre com estas seções** (além das próprias do app):
*Usar em vários aparelhos* · *Aparência* (Automático, Claro, Escuro) · *Cópia de segurança* · *Ajude a melhorar* ·
*Instalar o app* (quando não instalado) · *Sobre e privacidade* · versão no rodapé.

**Navegação.** Celular: barra de seções fixa (embaixo no Elétrica e no Estudo; abas no topo no Conta Fácil) e janelas que
sobem do pé da tela. Computador: mesma estrutura centralizada (o Estudo Fácil usa trilho lateral a partir de 1024 px).
O botão Voltar do navegador fecha a tela atual; Esc fecha janelas.

**Camadas (z-index):** 20–30 barras fixas · 45–80 janelas do app · 85 janelas do Kit Fácil · 95 avisos rápidos (toast).

**Textos.** Português do Brasil, frases curtas, tom direto e respeitoso; botões com verbo ("Salvar", "Enviar", "Ativar
sincronização"); mensagens de erro dizem o que fazer ("Sem internet agora. Sincroniza quando a conexão voltar.").

**Acessibilidade (obrigatório):**

- `<html lang="pt-BR">`; zoom livre (sem `maximum-scale=1` nem `user-scalable=no`);
- campos com rótulo visível ou `aria-label`; botões só com ícone com `aria-label`;
- foco visível em tudo que é clicável; janelas com `role="dialog"`, `aria-modal`, foco preso dentro, Esc fecha e o foco volta para quem abriu;
- alvos de toque com pelo menos 44 px; campos com fonte de 16 px (o iPhone não dá zoom sozinho ao tocar);
- contraste AA nos textos; informação nunca só pela cor; `prefers-reduced-motion` respeitado; modo escuro em todas as telas.

## 8. Web e responsividade

Todo app é um app web completo (não existe versão "só celular"). Telas de referência nos testes:
celular 390 × 844, tablet 820 × 1180 e computador 1440 × 900. Nenhuma tela pode ter rolagem lateral.
Respeitar as áreas seguras (`env(safe-area-inset-*)`). O app é instalável (PWA) e abre sem internet depois da primeira visita.

## 9. Segurança e privacidade

- Nunca guardar no repositório: códigos de acesso, senhas, chaves privadas, dados pessoais reais. `npm run verificar` procura.
- A configuração web do Firebase (`apiKey`, `projectId`) é pública por natureza; a proteção são as regras do Firestore.
  Recomendado: restringir a chave por referenciador (`https://brunodecastrosilva.github.io/*`) e ativar o App Check.
- O código de acesso do GitHub fica só no aparelho, com permissão apenas de `gist`.
- Texto vindo do usuário é sempre escapado antes de ir para a tela (`esc`).
- A janela *Sobre e privacidade* diz, em linguagem simples, onde ficam os dados de cada app. Antes de vender ou divulgar
  amplamente, revisar com assessoria jurídica: termos de uso e política de privacidade conforme a LGPD
  (o Elétrica Fácil guarda dados de clientes do usuário: nome, telefone, endereço e CPF/CNPJ).

## 10. Como mudar o Kit Fácil

1. Altere `comum/` num dos repositórios e aumente a `VERSAO` em `comum/kit-facil.js` quando mudar comportamento.
2. Rode `node comum/verificar.mjs --gerar` para atualizar o `comum/MANIFESTO.json`.
3. Copie a pasta `comum/` inteira para os outros dois repositórios.
4. Em cada um: `npm run verificar` e `npm test`; aumente a versão do app se ele mudou para quem usa; registre no CHANGELOG.

## 11. App novo no projeto

Copiar a pasta `comum/`, o `package.json` (trocando nome e versão), o modelo do `sw.js` e a estrutura do README;
incluir o app em `FAMILIA` (em `kit-facil.js`) e na regra do Firestore (`app in [...]`); ligar as variáveis `--kf-*`;
montar a tela de Ajustes com as seções do item 7; chamar `KitFacil.iniciar` com nome, versão e o que o app guarda.
