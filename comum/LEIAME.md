# Kit Fácil (pasta `comum/`)

Código e regras comuns aos apps do Projeto Integrador. **Esta pasta é igual no Conta Fácil, no Elétrica Fácil e no
Estudo Fácil.** Não altere só num repositório: siga o item 10 do [PADRAO.md](PADRAO.md) e rode `npm run verificar`.

| Arquivo | Para quê |
|---|---|
| `kit-facil.js` | avaliação e feedback, Sobre e privacidade, tema, instalar, cópia de segurança e o motor de sincronização |
| `kit-facil.css` | aparência dos componentes do kit (usa as variáveis `--kf-*` de cada app) |
| `PADRAO.md` | o padrão do Projeto Integrador |
| `regras-firestore-feedback.txt` | regra do Firestore que recebe as avaliações (colar no console do Firebase) |
| `servidor.mjs` | servidor local (`npm start`) |
| `verificar.mjs` | verificação do padrão (`npm run verificar`) |
| `testar.mjs` | roda os testes do kit e do app (`npm test`) |
| `MANIFESTO.json` | impressão digital dos arquivos acima, para saber se as três cópias são iguais |
| `testes/` | testes do kit e o ambiente de testes comum (GitHub e Firestore simulados) |

## Como o app usa o kit

```html
<link rel="stylesheet" href="comum/kit-facil.css">
<script src="comum/kit-facil.js"></script>
```

```js
KitFacil.iniciar({
  app: 'eletrica-facil', nome: 'Elétrica Fácil', versao: VERSAO,
  resumo: 'Orçamentos de elétrica prontos em minutos.',
  icone: 'icons/icon-192.png',
  tela: () => route().name,            // vai junto da avaliação
  toast: msg => toast(msg),            // usa o aviso do próprio app
  exemploDados: 'os orçamentos e os dados dos clientes',
  privacidade: ['Os orçamentos, a tabela de preços e os dados dos clientes ficam neste aparelho.'],
});
KitFacil.tema.iniciar({ chave: 'eletricafacil.pref', cores: { claro: '#EFEEE9', escuro: '#0E0D0A' } });
```

| Recurso | Uso |
|---|---|
| Avaliar / relatar problema | botões com `data-kf="avaliar"` ou `data-kf="problema"`, ou `KitFacil.feedback.abrir({ tipo })` |
| Bloco pronto para Ajustes | `KitFacil.ajudaHTML()` |
| Sobre e privacidade | `data-kf="sobre"` ou `KitFacil.sobre.abrir()` |
| Tema | `KitFacil.tema.seletorHTML()` |
| Instalar | `KitFacil.instalarHTML()` (vazio quando já instalado) |
| Cópia de segurança | `KitFacil.copia.baixar(dados, esquema)`, `await KitFacil.copia.ler(arquivo)` |
| Janela e confirmação | `KitFacil.dialogo.abrir({ titulo, corpo, pe, aoMontar })`, `KitFacil.dialogo.confirmar({ … })` |

### Sincronização

```js
const SY = KitFacil.sync.criar({
  app: 'eletrica-facil', nome: 'Elétrica Fácil', chave: 'eletricafacil.sync',
  dados: 'os orçamentos, preços e ajustes',      // usado nos textos
  carimbar: () => {},                            // marca a hora das mudanças (opcional)
  aplicar: (remoto, { primeira }) => mudou,      // junta o que veio da nuvem; devolve true se mudou algo
  pacote: () => ({ … , st: SY.estado.st, del: SY.estado.del }),  // o que vai para a nuvem
  mesmo: (pacote, remoto) => boolean,            // evita gravar o que já está igual
  redesenhar: () => rerender(),                  // depois de conectar, desconectar ou receber mudanças
  aoEstado: s => {},                             // 'ok' | 'busy' | 'offline' | 'error' (ícone na barra)
  ocupado: () => boolean,                        // adia o redesenho enquanto a pessoa digita
});
SY.cartaoHTML();        // conteúdo do cartão "Usar em vários aparelhos"
SY.agendar(); SY.agora(); SY.ligada(); SY.texto(); SY.resumo();
SY.iniciar({ token: SY.tokenDoLink(), silencioso: true, textoConfirmar: '…' });
```

`SY.estado` guarda `{ token, gistId, login, lastSync, err, st, del }` em `<prefixo>sync`; `st` e `del` são as horas
de mudança e de exclusão de cada registro, usadas pelo app em `aplicar`.
