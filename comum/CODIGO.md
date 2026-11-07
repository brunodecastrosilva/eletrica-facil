# Código do Projeto Fácil

Versão **3.0** · 07/11/2026 · Kit Fácil **2.13.0**

Substitui as Leis Globais do Projeto Integrador (v2.8) e o Padrão do Projeto Integrador (2.11). O histórico, as exceções
aprovadas, a situação da propagação, as decisões de produto e a tabela de correspondência entre as leis antigas e os
artigos ficam no documento **Registros do Código**, no projeto Integrador.

Este arquivo fica igual em três lugares: no projeto Integrador (`claude/codigo-do-projeto-facil.md`), na pasta `comum/`
de cada repositório (`comum/CODIGO.md`) e, sem os anexos, nas instruções do Projeto de cada app no claude.ai.

---

## TÍTULO I — DISPOSIÇÕES PRELIMINARES

### CAPÍTULO I — Do objeto e da abrangência

**Art. 1º** Este Código estabelece as regras comuns dos aplicativos do Projeto Fácil: o que eles devem ser, como devem
ser feitos e como o Claude deve trabalhar neles.

**Art. 2º** Este Código vale para:

I – o Conta Fácil;

II – o Elétrica Fácil;

III – o Estudo Fácil;

IV – o Guitarra Fácil;

V – qualquer aplicativo novo do Projeto Fácil, desde a sua criação.

**Parágrafo único.** O Projeto CCOE não segue este Código, por decisão do Bruno.

**Art. 3º** Os aplicativos são percebidos como uma família: a estrutura, os nomes, os ícones, a ordem dos Ajustes, a
barra de cima e o comportamento são iguais; cada aplicativo mantém a sua cor, a sua marca e as suas funções.

### CAPÍTULO II — Da hierarquia e da interpretação

**Art. 4º** As regras do Projeto Fácil estão em dois níveis:

I – este Código, com os seus anexos;

II – as regras de cada aplicativo, escritas em artigos nas instruções do Projeto do aplicativo no claude.ai e
detalhadas no README e no CHANGELOG do repositório.

§ 1º Em caso de conflito, prevalece este Código.

§ 2º Os artigos dizem o que fazer e como fazer, em linguagem comum. Os anexos trazem os detalhes técnicos (medidas,
cores, nomes de funções e de arquivos) e podem mudar sem alterar os artigos, desde que não os contrariem.

§ 3º Se um anexo contrariar um artigo, vale o artigo, e o anexo deve ser corrigido.

**Art. 5º** Um aplicativo só pode deixar de seguir uma regra deste Código quando houver justificativa técnica ou
comercial, aprovada pelo Bruno e registrada:

I – na seção "Exceções ao padrão" do README do aplicativo;

II – no CHANGELOG do aplicativo;

III – na lista de exceções aprovadas dos Registros do Código.

**Parágrafo único.** Exceção sem os três registros não vale.

**Art. 6º** Arquivo antigo de um Projeto que contradiga este Código é histórico; vale o Código.

### CAPÍTULO III — Da alteração do Código

**Art. 7º** Este Código só é alterado no projeto Integrador, por decisão do Bruno.

§ 1º A proposta de alteração pode nascer no Integrador ou chegar de um Projeto de aplicativo como "Proposta para o
Integrador", dizendo o que mudar, por quê e o impacto em cada aplicativo.

§ 2º Os Projetos dos aplicativos não alteram este Código por conta própria.

**Art. 8º** Toda alteração aprovada termina com:

I – o Código atualizado e a versão nova;

II – o registro da mudança nos Registros do Código;

III – a cópia nova em `comum/CODIGO.md` dos quatro repositórios, conforme o Art. 30;

IV – as instruções dos Projetos dos aplicativos atualizadas, mantendo as regras de cada aplicativo;

V – a situação da propagação marcada nos Registros do Código.

**Art. 9º** Os Projetos dos aplicativos não leem o projeto Integrador nem a memória dele. Tudo o que precisa valer lá
tem de estar nas instruções deles.

---

## TÍTULO II — DO PRODUTO

### CAPÍTULO I — Da finalidade

**Art. 10.** Todo aplicativo é feito para o mercado e para uso de terceiros, não para uso pessoal.

**Parágrafo único.** Desde o início, cada aplicativo considera a usabilidade, a confiabilidade, a segurança, a
escalabilidade, a facilidade de manutenção e a viabilidade comercial.

**Art. 11.** A fase de testes não tem data para acabar. O GitHub é o ambiente de testes; depois, os aplicativos são
publicados oficialmente nas lojas de aplicativos.

### CAPÍTULO II — Da gratuidade e do apoio voluntário

**Art. 12.** Os aplicativos são gratuitos, e nenhuma função depende de pagamento.

**Art. 13.** Todos os aplicativos têm o mesmo convite de apoio: "Gostando do app? Pague um chopp para o criador!".

§ 1º O convite é um ícone de caneca de chopp na barra de cima, entre a nuvem e o balão, só nas telas principais, com a
mesma cor e o mesmo traço dos outros ícones. Há um atalho também em *Sobre o aplicativo*.

§ 2º Tocar no ícone abre a janela com o QR code do Pix e um só botão, "Copiar código Pix".

§ 3º A chave Pix é aleatória, nunca CPF, telefone ou e-mail. O nome no código Pix é não pessoal ("PROJETO FACIL").

§ 4º O convite não abre sozinho, não interrompe tarefas e não bloqueia nada.

### CAPÍTULO III — Do idioma e dos textos

**Art. 14.** Os aplicativos são só em português do Brasil, por enquanto.

**Art. 15.** Os textos seguem estas regras:

I – frases curtas, tom direto e respeitoso;

II – botões com verbo ("Salvar", "Enviar", "Ativar sincronização") e sem descrição dentro: só o rótulo; a explicação,
quando precisa, fica fora do botão;

III – mensagem de erro diz o que fazer;

IV – os nomes das guias dos Ajustes, dos estados da nuvem e das opções do balão são exatamente os deste Código.

### CAPÍTULO IV — Da acessibilidade

**Art. 16.** A acessibilidade é obrigatória em todas as telas:

I – idioma da página marcado como português do Brasil e zoom livre;

II – rótulo visível em todo campo; botão só com ícone tem nome para o leitor de tela;

III – foco visível em tudo que é clicável;

IV – alvos de toque de pelo menos 44 px e campos com letra de 16 px;

V – contraste AA nos textos;

VI – informação nunca só pela cor;

VII – movimento reduzido respeitado;

VIII – modo escuro em todas as telas;

IX – janelas com o foco preso dentro, Esc fecha e o foco volta para quem abriu.

---

## TÍTULO III — DOS REPOSITÓRIOS E DA PUBLICAÇÃO

### CAPÍTULO I — Dos repositórios

**Art. 17.** Cada aplicativo tem o seu repositório no GitHub (Anexo I), público e sem licença: todos os direitos
reservados.

**Art. 18.** Os repositórios são independentes:

I – nenhum aplicativo carrega arquivo de outro;

II – o que é comum fica copiado na pasta `comum/` de cada repositório, idêntica nos quatro;

III – cada aplicativo tem a sua versão e o seu histórico.

**Art. 19.** Nada de credenciais, chaves, senhas ou dados pessoais reais no repositório.

**Parágrafo único.** A configuração web do Firebase é pública por natureza; a proteção é feita pelas regras do
Firestore.

**Art. 20.** Como os aplicativos dividem o mesmo endereço (`brunodecastrosilva.github.io`):

I – tudo o que o aplicativo guarda no navegador usa o prefixo do aplicativo (Anexo I);

II – o manifesto de cada aplicativo tem identidade, início e escopo na pasta do próprio aplicativo, nunca `./`;

III – o service worker de cada aplicativo só apaga e só responde pelo que é dele.

**Art. 21.** Não há etapa de build: o que está no repositório é o que vai para o ar. Bibliotecas de terceiros entram
por CDN, com versão fixa, só quando a função é usada.

### CAPÍTULO II — Da versão e da publicação

**Art. 22.** A versão segue o formato `maior.menor.correção` e é igual em quatro lugares: `package.json`, a constante
`VERSAO` do código, o cache do service worker e o topo do CHANGELOG.

**Art. 23.** Antes de publicar:

I – rodar a verificação do padrão e os testes automáticos (Anexo VII);

II – abrir o aplicativo no celular e no computador;

III – conferir o modo escuro.

**Art. 24.** Publicar é enviar direto para a branch `main`, sem repositório nem branch de homologação.

**Art. 25.** Cada versão nova:

I – informa as novidades ao Kit, com as mesmas linhas do CHANGELOG escritas para quem usa;

II – leva o commit em português, dizendo o que muda para quem usa;

III – atualiza o arquivo de contexto do Projeto do aplicativo.

**Art. 26.** Dado novo guardado em servidor só entra com prazo de guarda definido neste Código.

### CAPÍTULO III — Do Kit Fácil

**Art. 27.** O Kit Fácil é o código comum da pasta `comum/`: sistema de design, barra de cima, Ajustes, avaliação,
sincronização, apoio, janelas, avisos, listas, datas, guia e a verificação do padrão (Anexo II).

**Art. 28.** Os aplicativos usam as peças do Kit em vez de criar versões próprias.

**Art. 29.** Se uma solução de um aplicativo servir aos outros, ela vira padrão no Integrador, como proposta. Soluções
divergentes sem motivo não são aceitas.

**Art. 30.** Para mudar o Kit:

I – alterar a pasta `comum/` de um repositório e subir a versão do Kit quando mudar comportamento;

II – gerar de novo o manifesto da pasta `comum/`;

III – copiar a pasta `comum/` inteira para os outros repositórios;

IV – em cada um, rodar a verificação e os testes, subir a versão do aplicativo se ele mudou para quem usa e registrar
no CHANGELOG.

**Parágrafo único.** O Claude de um Projeto de aplicativo não altera `comum/` só para aquele aplicativo; se o comum
precisa mudar, escreve uma Proposta para o Integrador.

**Art. 31.** Aplicativo novo copia a pasta `comum/`, o modelo do `package.json`, do service worker e do README, entra
na família do Kit e na regra do Firestore e monta a moldura, os Ajustes e a abertura deste Código (Anexo VII).

---

## TÍTULO IV — DOS DADOS

### CAPÍTULO I — Do armazenamento e da sincronização

**Art. 32.** Os dados ficam no aparelho, no armazenamento do navegador, com o prefixo do aplicativo. O aplicativo
funciona sem conta e sem internet.

**Art. 33.** A sincronização entre aparelhos é opcional e igual em todos os aplicativos (Anexo III):

I – os dados vão para um gist secreto na conta GitHub da própria pessoa;

II – o conteúdo é criptografado no aparelho; o GitHub só vê texto embaralhado;

III – cada registro guarda a hora da última mudança, e, ao juntar, a mudança mais recente vence, registro a registro;

IV – exclusões ficam marcadas para não voltarem num aparelho que estava desligado;

V – o código de acesso fica só no aparelho, com permissão apenas de gist, e a mesma chave serve para todos os
aplicativos.

**Art. 34.** Não sincronizam, de propósito:

I – as preferências do aparelho, como o tema;

II – a comanda aberta do Conta Fácil, que se divide entre celulares pela comanda ao vivo;

III – o orçamento de exemplo do Elétrica Fácil.

**Art. 35.** A nuvem no alto da tela mostra sempre o estado real da sincronização, em um destes seis estados:
Sincronizado, Sincronizando, Alterações a enviar, Erro na sincronização, Sem internet e Sincronização desligada.

§ 1º Cada estado tem forma própria, e o nome para o leitor de tela diz o estado por extenso.

§ 2º Tocar na nuvem abre a janela com o estado, a conta, a última sincronização e a ação certa para o momento.

**Art. 36.** Todo aplicativo oferece cópia de segurança em arquivo, para baixar e restaurar, em *Ajustes →
Sincronização e armazenamento*.

**Art. 37.** O login próprio (por exemplo, com e-mail ou Google) é o caminho recomendado para a versão comercial,
mantendo a mesma regra de junção por registro. Pedir conta GitHub é aceito na fase de testes.

### CAPÍTULO II — Dos dados em servidor e da privacidade

**Art. 38.** Guarda-se no servidor só o necessário; dado que perdeu a função sai na hora.

**Art. 39.** Prazos de guarda no Firebase:

I – avaliações e relatos de problema: 2 anos;

II – comanda ao vivo: apagada quando o anfitrião encerra; a nunca encerrada vence 30 dias depois de criada.

**Parágrafo único.** No plano gratuito o Firebase não aceita exclusão automática; a limpeza dos vencidos é manual, uma
vez por mês, com o passo a passo da pasta `comum/`.

**Art. 40.** *Ajustes → Privacidade e segurança* diz, em linguagem simples, onde ficam os dados do aplicativo.

**Art. 41.** Os termos de uso e a política de privacidade ficam em nome de Bruno de Castro Silva, com o contato
cas_bruno@outlook.com, e são publicados depois de revisão jurídica. Até lá, *Sobre o aplicativo* informa que ainda não
foram publicados.

**Art. 42.** Texto vindo de quem usa é sempre protegido antes de ir para a tela.

---

## TÍTULO V — DA AVALIAÇÃO E DO FEEDBACK

**Art. 43.** Todo aplicativo tem o mesmo mecanismo de avaliação e feedback, pelo balão no alto da tela e por *Ajustes →
Avaliação e feedback*.

**Art. 44.** O balão abre a escolha entre duas opções:

I – **Avaliar o app**: nota de 1 a 5 estrelas, obrigatória, com tipo de comentário, comentário e contato opcionais;

II – **Relatar um problema**: descrição obrigatória, com categoria, gravidade, contato e informações técnicas.

**Art. 45.** O aplicativo e a versão vão sempre, sem a pessoa digitar. As informações técnicas só vão se a pessoa
deixar marcado. Não se aceitam anexos.

**Art. 46.** As mensagens vão para o Firestore do projeto (Anexo IV). Sem internet, ficam numa fila no aparelho e são
reenviadas depois. A tela nunca diz "enviado" sem a confirmação do servidor.

---

## TÍTULO VI — DA INTERFACE

### CAPÍTULO I — Da família visual

**Art. 47.** Todos os aplicativos usam o mesmo sistema de design do Kit: fonte Atkinson Hyperlegible, tamanhos de
texto, espaços, cantos, cores de estado e ícones comuns (Anexo II).

**Art. 48.** Cada aplicativo muda apenas:

I – a cor de destaque e os neutros tingidos por ela (Anexo I);

II – a marca (ícone e nome);

III – as guias próprias dos Ajustes;

IV – opcionalmente, o tema de fábrica e uma fonte de caráter só nos títulos, na marca e nos números grandes.

**Parágrafo único.** Os três temas (Automático, Claro e Escuro) continuam disponíveis em todos os aplicativos.

**Art. 49.** A mesma ideia tem o mesmo ícone em todos os aplicativos: controles deslizantes para Ajustes, caneca para o
chopp, nuvem para a sincronização e balão para a avaliação.

### CAPÍTULO II — Da moldura

**Art. 50.** A barra de cima das telas principais tem só:

I – à esquerda, a marca, com o ícone e o nome do aplicativo, visíveis também no celular;

II – à direita, nesta ordem: nuvem, chopp e balão, com a mesma cor e o mesmo traço.

§ 1º Nas telas internas, a barra de cima tem só voltar, título, nuvem e balão.

§ 2º Nenhum ícone a mais: as ações próprias do aplicativo ficam na tela.

§ 3º O balão mostra um ponto quando há mensagem guardada à espera de envio.

**Art. 51.** No celular e no tablet, a navegação é uma barra fixa embaixo; no computador, um trilho lateral com a marca
e todas as seções.

**Art. 52.** A barra de baixo tem no máximo 5 posições, sem encolher nem cortar nomes:

I – com até 5 itens, todos aparecem;

II – com mais, aparecem as 4 seções principais e "Mais", que lista o resto;

III – Ajustes é sempre o último, da barra ou do "Mais"; no computador, fica no pé do trilho.

**Art. 53.** Barras e botões fixos do aplicativo ficam acima da navegação de baixo e, no computador, começam depois do
trilho.

### CAPÍTULO III — Dos Ajustes

**Art. 54.** Os Ajustes têm oito guias comuns, nesta ordem e com estes nomes:

I – Conta e perfil;

II – Sincronização e armazenamento;

III – Aparência;

IV – Preferências gerais;

V – Notificações;

VI – Privacidade e segurança;

VII – Avaliação e feedback;

VIII – Sobre o aplicativo.

§ 1º Depois delas vêm as guias próprias do aplicativo, num grupo com o nome dele, sem mudar a ordem, os nomes nem os
componentes das guias comuns.

§ 2º Conteúdo próprio do aplicativo numa guia comum entra como extra dessa guia.

§ 3º No celular, a guia abre em tela cheia e o voltar retorna à lista; em telas largas, lista e guia ficam lado a lado.

**Art. 55.** A última opção de *Privacidade e segurança* é **Restaurar padrões de fábrica**, igual em todos os
aplicativos: o aplicativo volta como novo neste aparelho, sem dados nem ajustes; a nuvem e os outros aparelhos não
mudam.

**Parágrafo único.** Para isso funcionar, tudo o que o aplicativo guarda no navegador usa o prefixo do aplicativo.

### CAPÍTULO IV — Das telas principais

**Art. 56.** Toda tela principal tem:

I – título grande, igual ao nome do item na navegação, com uma linha de apoio dizendo para que a tela serve;

II – no máximo um botão de criar, com verbo ou "Novo/Nova", que flutua acima da barra de baixo no celular e no tablet,
sem cobrir o fim da lista, e fica no cabeçalho ou no topo da lista no computador;

III – lista vazia que explica o que aparece ali e o que fazer para começar.

**Parágrafo único.** As ações das telas internas (⋯, editar) ficam na barra de baixo da tela.

### CAPÍTULO V — Dos componentes

**Art. 57.** Cada coisa tem um só jeito, igual em todos os aplicativos:

I – trocar a parte de uma mesma tela: **guias do Kit**, sublinhadas na cor de destaque;

II – filtrar uma lista ou escolher um valor: **segmento**, com o escolhido claro;

III – escolher um item numa lista de dados: **lista suspensa** do Kit;

IV – marcar várias pessoas ou coisas: **lista de marcar**, uma linha por item;

V – resumo de valores: **lista vertical**, rótulo à esquerda e valor à direita;

VI – grupos de dados: **seções que abrem e fecham**, uma embaixo da outra;

VII – aviso dentro da tela: **faixa** do Kit, com no máximo um botão, contornado;

VIII – confirmar antes de apagar: **janela de confirmação** do Kit.

**Art. 58.** Há uma só cor de botão principal, a de destaque, para a ação principal da tela; os demais botões são
contornados. Botões, segmentos e cartões seguem as medidas comuns do Kit (Anexo II).

**Art. 59.** Nada lado a lado: dados nunca ficam em vários cartões, chips ou quadrinhos lado a lado, em nenhuma
largura de tela.

**Parágrafo único.** Podem ficar lado a lado só os controles: segmento, botões de ação no pé e a área da barra de cima.

**Art. 60.** Avisos rápidos e janelas são só os do Kit. Nenhum aplicativo tem aviso ou janela própria.

**Art. 61.** Nenhum aplicativo mostra a lista de escolha, o calendário nem o relógio do sistema: usa os do Kit, iguais
em todo aparelho.

**Parágrafo único.** A exceção, campo a campo, exige justificativa no README.

**Art. 62.** Seções que abrem e fecham usam a seção do Kit, sem botão "Próximo": a pessoa toca na seção que quer.

**Art. 63.** Cadastro de item que pertence a uma categoria segue a ordem 1. Categoria, 2. Item; linhas que abrem
alguma coisa têm a seta à direita.

### CAPÍTULO VI — Do movimento

**Art. 64.** Tudo o que muda na tela se move com o movimento comum do Kit (Anexo V): menus, trocas de tela e de guia,
seções, listas, calendário, janelas e avisos.

§ 1º Quem pede movimento reduzido vê a troca direta.

§ 2º O aplicativo não cria animação própria para essas situações.

### CAPÍTULO VII — Da web e da responsividade

**Art. 65.** Todo aplicativo é um aplicativo web completo, que funciona do celular ao computador nas telas de
referência do Anexo VII, sem rolagem lateral.

**Art. 66.** Todo aplicativo é instalável e abre sem internet depois da primeira visita.

---

## TÍTULO VII — DA ABERTURA DO APLICATIVO E DO GUIA

### CAPÍTULO I — Da abertura

**Art. 67.** Nenhum aplicativo tem tela de primeiro uso. Quem abre o aplicativo pela primeira vez já vê a tela inicial
normal, com as listas vazias explicando como começar (Art. 56, III).

**Art. 68.** Toda vez que o aplicativo abre, aparece a janela do Kit com o nome do aplicativo, o que ele faz numa
linha e três pontos, com os botões "Fazer o guia" e "Começar".

§ 1º Na primeira vez, a janela tem o título "Boas-vindas ao <aplicativo>", lembra que os dados ficam no aparelho e,
se o aplicativo tiver exemplo, traz o botão do exemplo.

§ 2º A pessoa pode desligar a janela na própria janela ("Mostrar esta apresentação ao abrir o app") ou em *Ajustes →
Preferências gerais → Ao abrir o app*.

§ 3º Na primeira abertura depois de uma atualização, a janela de novidades aparece no lugar dela, uma vez.

§ 4º Ajuste que antes era pedido numa tela de primeiro uso começa com um valor padrão e se muda nos Ajustes.

### CAPÍTULO II — Do guia

**Art. 69.** Todo aplicativo tem o guia interativo do Kit em dois níveis, mostrados em lista, só com o nome:

I – **Simplificado**: poucos passos, só com destaque;

II – **Completo**: o aplicativo faz cada ação na tela, ao vivo, numa demonstração que não salva nada.

**Art. 70.** No guia completo:

I – a pessoa lê o passo antes, e a ação só começa quando ela toca em "Mostrar";

II – o ritmo é calmo, com um dedo que se move até o alvo e toca;

III – todo passo tem ação, inclusive a troca de tela, feita tocando na barra, como a pessoa faria.

**Art. 71.** O destaque do guia aponta partes pequenas da tela (campo, botão, cabeçalho), acompanha a rolagem sem
atraso, fica acima das janelas abertas pelo guia, e o cartão do guia nunca cobre o destaque.

**Art. 72.** Função nova entra no guia na mesma versão.

---

## TÍTULO VIII — DA CONDUTA DO CLAUDE

**Art. 73.** Este Título vale no Integrador e em todos os Projetos dos aplicativos.

**Art. 74.** **Perguntar antes de presumir.** Sempre que houver dúvida, lacuna ou ambiguidade no pedido, nas regras ou
no código, o Claude pergunta antes de seguir, de forma objetiva e com opções quando possível.

**Parágrafo único.** Só segue sem perguntar quando o Bruno não está presente (tarefa agendada ou sem resposta): aí toma
a leitura mais razoável, diz qual foi e registra a dúvida.

**Art. 75.** **Reportar e propor sempre.** O Claude informa os erros que encontrar, mesmo fora do que foi pedido, e
propõe melhorias de qualquer espécie: design e experiência de uso, funções novas, melhorias das existentes, código,
segurança e textos.

**Parágrafo único.** As propostas vêm separadas do que foi feito, no fim da entrega, e só são aplicadas com o "sim" do
Bruno.

**Art. 76.** **Opções com imagem.** Sempre que o Bruno precisar escolher entre opções, cada opção vem com um desenho de
verdade que a represente: maquete da tela, ícone, esquema, diagrama ou comparação ilustrada.

§ 1º O desenho é feito com a ferramenta de visual da conversa (ou, sem ela, um artefato), em cartões lado a lado, um
por opção, com a letra, um nome curto e uma linha de explicação, e a opção recomendada marcada com borda e o selo
"Recomendada"; telas no formato do aparelho, com as cores reais do aplicativo.

§ 2º Só depois do desenho vem a pergunta, citando as letras.

§ 3º Nunca se usa desenho feito de caracteres, tabela de texto, bloco de código ou a prévia de texto da caixa de
pergunta como se fosse a imagem.

§ 4º Quando a opção não é de tela, o desenho mostra o efeito de cada uma: fluxo, antes e depois ou quadro comparativo.

**Art. 77.** **Revisar a redação.** Sempre que for oportuno, ao mexer numa tela, num guia, num aviso ou num documento,
o Claude revisa os textos que encontrar e propõe redações mais claras, concisas e precisas, com o texto atual e a
alternativa lado a lado.

**Parágrafo único.** Como toda proposta, só entra com o "sim" do Bruno; erro de texto que o próprio Claude acabou de
introduzir é corrigido na hora e informado.

**Art. 78.** Antes de qualquer mudança, o Claude confere se ela respeita este Código. Se não respeitar, avisa e propõe
uma alternativa compatível.

**Art. 79.** No Integrador, o Claude não desenvolve função de um aplicativo só; decide-se o que vale para todos. Antes
de propor mudança, diz qual artigo é afetado e o impacto em cada aplicativo. Pedido específico de um aplicativo vai
para o Projeto daquele aplicativo ou vira proposta de padrão, se servir aos outros.

---

## TÍTULO IX — DISPOSIÇÕES FINAIS E TRANSITÓRIAS

**Art. 80.** A revisão dos aplicativos é feita um por vez. Até a vez de cada aplicativo, pode ainda haver nele:

I – dados lado a lado (Art. 59);

II – o guia em três níveis (Essencial, Exploração e Completo), no lugar dos dois níveis do Art. 69.

**Parágrafo único.** O Conta Fácil já cumpre os dois. Na vez de cada aplicativo, o que restar é trocado.

**Art. 81.** Os pontos em aberto, os erros encontrados e as propostas ficam na revisão geral do Integrador
(`claude/revisao-geral.md`).

**Art. 82.** Este Código entra em vigor em 07/11/2026. As Leis Globais v2.8 e o Padrão 2.11 passam a ser histórico.

---
---

# ANEXOS TÉCNICOS

Os anexos detalham os artigos. Mudam sem alterar os artigos, desde que não os contrariem (Art. 4º, § 2º).

## ANEXO I — Aplicativos, repositórios e identidade

| Aplicativo | Repositório | Endereço | Prefixo dos dados | Destaque (`--kf-accent`) | Ideia visual | Tema de fábrica | Fonte dos títulos |
|---|---|---|---|---|---|---|---|
| Conta Fácil | `brunodecastrosilva/conta-facil` | `…github.io/conta-facil/` | `contafacil.` | verde azulejo `#1D5A3B` | comanda de boteco | Automático | Atkinson |
| Elétrica Fácil | `brunodecastrosilva/eletrica-facil` | `…github.io/eletrica-facil/` | `eletricafacil.` | amarelo de segurança `#FFC400` | ferramenta de obra | Automático | Atkinson |
| Estudo Fácil | `brunodecastrosilva/estudo-facil` | `…github.io/estudo-facil/` | `estudofacil.` | azul caneta `#2742D3` | caderno e marca-texto | Automático | Atkinson |
| Guitarra Fácil | `brunodecastrosilva/guitarra-facil` | `…github.io/guitarra-facil/` | `guitarrafacil.` | grafite `#2B2B30`, com o vermelho do pedal | pedal de efeito sobre amplificador | Escuro | Big Shoulders Display (700 a 900) |

**Manifesto:** `"id": "/<app>/"`, com `start_url` e `scope` dentro da pasta do app. **Service worker:** cache
`<app>-<versão>`. **Chave da sincronização:** `<prefixo>sync`, reaproveitável por outro app da família no mesmo aparelho.
**Firebase:** projeto `conta-facil-2c1f9` (comanda ao vivo do Conta Fácil e avaliações de todos), plano gratuito.

**Guias próprias nos Ajustes**

| Aplicativo | Guias próprias | Extras nas guias comuns |
|---|---|---|
| Conta Fácil | Comandas (comanda ao vivo, guia do app, atalho para Cadastros) | Conta e perfil: "Você nas comandas" |
| Elétrica Fácil | Pix · Veículo e deslocamento · Adicionais · Orçamento novo · Textos dos documentos | Conta e perfil: "Seus dados na proposta" |
| Estudo Fácil | Rotina e metas · Revisões | Notificações: som e vibração no fim do tempo · Privacidade e segurança: apagar todos os dados, inclusive na nuvem |
| Guitarra Fácil | Menu e efeitos · Prática | — |

## ANEXO II — Sistema de design e peças do Kit

**Estrutura de cada repositório:** `index.html` (o Estudo Fácil divide o código em vários `.js`, carregados com
`?v=<versão>`), `sw.js`, `manifest.webmanifest`, `icons/` (192, 512, maskable e apple-touch-icon), `comum/` (Kit Fácil
e este Código), `tests/`, `package.json` (sem dependências de produção), `README.md`, `CHANGELOG.md`.

**Tokens comuns** (`comum/kit-facil.css`; o app não redefine):

| Grupo | Valores |
|---|---|
| Fonte | Atkinson Hyperlegible Next (`--kf-font`, `--kf-font-display`) e Mono (`--kf-font-mono`), do Google Fonts: `family=Atkinson+Hyperlegible+Mono:wght@400..700&family=Atkinson+Hyperlegible+Next:wght@400..800` |
| Texto | `--kf-t-tela` 28 · `--kf-t-secao` 21 · `--kf-t-cartao` 17 · `--kf-t-corpo` 16 · `--kf-t-apoio` 14 · `--kf-t-legenda` 12,5 px |
| Espaços | `--kf-e-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 24 · `-6` 32 px |
| Cantos | `--kf-r-sm` 8 · `--kf-r-btn` 12 · `--kf-r-campo` 12 · `--kf-r-md` 16 · `--kf-r-lg` 22 · `--kf-r-cartao` 16 px |
| Botões | `--kf-btn-h` 48 px · `--kf-btn-h-p` 40 px |
| Moldura | `--kf-barra-h` 60 · `--kf-nav-h` 64 · `--kf-trilho-w` 240 · `--kf-alvo` 44 px; computador a partir de 1024 px |
| Estados | `--kf-ok`, `--kf-warn`, `--kf-bad` e os fundos `-soft`; `--kf-star`; segmento escolhido `--kf-seg-on` |
| Camadas | 20 barra de cima e trilho · 25–30 navegação, barras fixas e botão de criar (29) · 85 janelas · 95 avisos |

**Variáveis que o app liga** (claro e escuro): `--kf-bg`, `--kf-surface`, `--kf-surface-2`, `--kf-line`, `--kf-line-2`,
`--kf-ink`, `--kf-muted`, `--kf-accent`, `--kf-accent-ink`, `--kf-accent-soft`, `--kf-accent-texto`, `--kf-focus`,
`--kf-scrim`, `--kf-shadow`. Tema de fábrica: `KitFacil.tema.iniciar({ chave, cores, padrao: 'escuro' })`; o app escuro
de fábrica põe `data-theme="dark"` na tag `<html>`. Fonte dos títulos: licença livre (SIL OFL), no mesmo `<link>` da
Atkinson, com a Atkinson logo depois na lista, legível em 20 px, com acentos.

**Peças do Kit**

| Peça | Função ou classe | Regras |
|---|---|---|
| Barra de cima | `KitFacil.topo.html({ principal })` | área de toque 44 × 44, ícones de 24 px, até 24 px da borda; nomes acessíveis "Sincronização: <estado>. Ver detalhes", "Pague um chopp para o criador", "Avaliação e feedback" |
| Navegação | `kf-barra`, `kf-nav`, `kf-trilho`, `body.kf-casca`; `KitFacil.nav.ajustes('nav' \| 'trilho')`; seções do "Mais" com `data-kf-mais` | |
| Ajustes | `KitFacil.ajustes` (guias comuns e próprias, `extras`) | |
| Cabeçalho de tela | `KitFacil.ui.cabecalho({ titulo, sub, acoes, criar })` | |
| Botão de criar | `KitFacil.ui.criar({ rotulo, attrs })` | o Kit reserva espaço no pé da página |
| Estado vazio | `KitFacil.ui.vazio({ titulo, texto, acao })` | |
| Guias | `KitFacil.ui.abas({ itens: [[id, nome, n]], atual, rotulo, dado })` | `role="tablist"` só no Kit; contagem "Nome · n" |
| Segmento | `kf-seg` | escolhido com `--kf-seg-on` |
| Faixa | `KitFacil.ui.faixa({ tipo, html, acao })` | tipos dica, info, alerta, erro, ok |
| Botões | `kf-btn` + `kf-pri`, `kf-sec`, `kf-perigo`, `kf-perigo-sec`, `kf-link` | |
| Campos | `kf-entrada`, `kf-rotulo`, `kf-ajuda`, `kf-opcional`, `kf-check` | |
| Cartão | `kf-cartao`, `kf-bloco`, `kf-dados` | |
| Lista de escolha | `<select>` comum, trocada pelo Kit (`KitFacil.escolha`) | opção vazia `<option value="" hidden>`; exceção com `data-kf-nativa` |
| Data | `<input type="date">`, trocado pelo Kit (`KitFacil.data`) | Hoje e Limpar; valor AAAA-MM-DD |
| Hora | `<input type="time">`, trocado pelo Kit (`KitFacil.hora`) | passo de 5 min por padrão; valor HH:MM |
| Seções | `<details data-kf-secao>`, `data-kf-secao="grupo"`, `KitFacil.secao` | |
| Janelas | `KitFacil.dialogo.abrir({ titulo, sub, corpo, pe, classe, aoMontar, aoFechar })`, `.confirmar` | `kf-alto`, `kf-largo` |
| Aviso rápido | `KitFacil.avisar(msg, { label, run })` | some em 3,2 s (6 s com ação) |
| Ícones | traço de 2 px, 24 × 24 (`kf-i`) | |
| Apoio | `KitFacil.apoio`; chave, nome e cidade em `APOIO_PADRAO` | BR Code sem valor; QR com `qrcode-generator` 1.4.4 do cdnjs |

## ANEXO III — Sincronização e cópia de segurança

- Motor `KitFacil.sync`; arquivo `<app>.json` num gist secreto.
- Criptografia AES-GCM de 256 bits; chave derivada do código de acesso com PBKDF2-SHA-256, 150 mil iterações, sal
  `<app>:<login>`.
- Exclusões marcadas por 400 dias.
- Sincroniza 2,5 s depois de cada mudança, ao abrir, ao voltar para o app, quando a internet volta e a cada minuto.
- Levar a outro aparelho: link `#/conectar/<chave>` ou colar a chave.
- Cada app passa ao motor as funções `carimbar`, `aplicar`, `pacote` e `mesmo`.

| Estado (`data-estado`) | Texto | Selo |
|---|---|---|
| `sincronizado` | Sincronizado | verde, com ✓ |
| `sincronizando` | Sincronizando | cor de destaque, setas girando |
| `pendente` | Alterações a enviar | amarelo, seta para cima |
| `erro` | Erro na sincronização | vermelho, com "!" |
| `offline` | Sem internet | nuvem cinza cortada |
| `desligada` | Sincronização desligada | cinza, com "–" |

**Cópia de segurança:** `{ formato: "copia-facil", app, esquema, versaoApp, em, dados }` (`KitFacil.copia`); os apps
continuam lendo os formatos antigos.

## ANEXO IV — Avaliação e feedback

`KitFacil.feedback`; coleção `feedback` do Firestore, pela API REST; regra em `comum/regras-firestore-feedback.txt`
(só aceita registros neste formato; ninguém lê pelos apps; as avaliações são lidas no console).

| Campo | Conteúdo |
|---|---|
| `esquema` | 1 |
| `app`, `versao` | qual app e qual versão |
| `nota` | 1 a 5 (0 no relato de problema) |
| `tipo` | `avaliacao`, `elogio`, `sugestao`, `critica` ou `problema` |
| `mensagem` | até 2.000 caracteres |
| `categoria`, `gravidade` | só no relato: algo não funciona, erro ou travamento, dados ou sincronização, tela ou texto, outro; baixa, média, alta |
| `contato` | opcional, até 120 caracteres |
| `tela` | tela em que a pessoa estava |
| `tecnico` | sistema, navegador, tela, app instalado ou não, idioma e últimos erros, só se marcado (marcado no relato, desmarcado na avaliação) |
| `enviadoEm` | data e hora do aparelho |

Fila: até 30 tentativas ou 60 dias; identificador próprio por mensagem, sem duplicar.

## ANEXO V — Movimento

Curva `cubic-bezier(.45,0,.2,1)` (`KitFacil.movimento`).

| O quê | Como | Duração |
|---|---|---|
| Seções e rolagem até um título | `KitFacil.secao` | 560 ms (`movimento.ms`) |
| Troca de tela | `KitFacil.movimento.entrar(area, { de: 'tela' })` | 280 ms (`movimento.curto`) |
| Guias dos Ajustes, mês do calendário | `de: 'lado'` | 280 ms |
| Listas, calendário, menus | descem ao abrir, sobem ao fechar | 280 / 200 ms |
| Janelas | sobem do pé e saem descendo | 240 / 200 ms |
| Avisos rápidos | sobem e aparecem | 280 ms |
| Item atual da navegação | a cor desliza | 280 ms |

O que sai é um "fantasma" desenhado pelo Kit; o elemento de verdade sai na hora, então o código e os testes não
esperam a animação.

## ANEXO VI — Abertura e guia

```
KitFacil.iniciar({
  app, nome, versao, icone, resumo, tela, abrirAjustes, emAjustes, copia, privacidade, textos,
  novidades: [{ versao, itens: [...] }],                       // janela "Novidades do <app>", uma vez por versão
  boasVindas: { novo: () => bool, exemplo: () => {}, rotuloExemplo },   // só diz quem é novo e o exemplo
  apresentacao: { frase, pontos: [[titulo, texto], ...] },     // abre em toda abertura (Art. 68)
  guia: { niveis: [{ nome: 'Simplificado' }, { nome: 'Completo' }], explicacao, passos, preparar, fim, semPassos, ocupado },
})
```

- Chaves: `kitfacil.<app>.visto` (última versão vista) e `kitfacil.<app>.apresentacao` (ligada ou não; volta de fábrica).
- Desde o Kit 2.13 não existe tela própria de primeiro uso: com `boasVindas.novo()` verdadeiro na primeira abertura, a
  apresentação abre com o título "Boas-vindas ao <app>" e o botão do exemplo, se houver.
- Passo do guia: `{ nivel, niveis?: [n], t, d, sel, alt, ir: () => {}, se: () => bool, acao?: async m => {}, fim? }`.
- "Mãos" do guia ao vivo (`m`): `apontar`, `tocar` (com `semClique`), `digitar`, `escolher`, `arrastar`, `esperar`,
  `destacar` e `voltar`. Movimento reduzido: o dedo não desliza e as esperas ficam curtas.
- Guia em três níveis (transitório, Art. 80): `nivel` 1 Essencial, 2 Exploração, 3 Completo, somados.

## ANEXO VII — Comandos, verificação e testes

Node 22 ou mais novo; testes com Playwright (Chromium).

| Comando | O que faz |
|---|---|
| `npm start` | sobe o app em `http://localhost:8080/<app>/` |
| `npm test` | testes do Kit e do app, sem internet (GitHub e Firebase simulados) |
| `npm run verificar` | pasta `comum/` igual, sem segredos, versão nos quatro lugares, arquivos do service worker, idioma, zoom, fonte, moldura, barra de cima, Ajustes em guias e componentes nas medidas do Kit |

- Telas de referência: 360 × 740, 390 × 844, 820 × 1180 e 1440 × 900; áreas seguras respeitadas.
- Testes comuns: `conferirTopo`, `conferirNavAjustes`, `guiasAjustes` e o teste de tela principal do Kit.
- Mudar o Kit: alterar `comum/` num repositório, `node comum/verificar.mjs --gerar`, copiar `comum/` para os outros,
  `npm run verificar` e `npm test` em todos.
- App novo: copiar `comum/`, o `package.json` (nome e versão), o modelo do `sw.js` e do README; incluir o app em
  `FAMILIA` (`kit-facil.js`) e na regra do Firestore (`app in [...]`); ligar as variáveis `--kf-*`; manifesto com
  `"id": "/<app>/"`; montar a moldura, a barra de cima e os Ajustes; chamar `KitFacil.iniciar` como no Anexo VI.
