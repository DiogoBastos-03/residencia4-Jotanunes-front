# Onde mexer

**Texto de interface** — `src/shared/strings/`
- `dominio.ts`: vocabulário do produto ("lista de exigências", "remessa", motivos de reprovação…). Trocar um termo aqui troca em todas as telas.
- `eventos.ts`: as frases do histórico das fichas ("vinculou a lista de exigências…").
- `pages/*.ts`: textos de cada página. `layout.ts`: menu e sidebar. `ui.ts`: componentes base. `status.ts`: rótulos dos badges e tags.

**Dados** — fornecedores e obras vêm da API (ou do MSW, com `VITE_API_MOCK=true`); o resto é demonstração.
- `src/mocks/gerar.ts`: gera, de forma determinística (hash do id, sem `Math.random`), documentos, arquivos, análises, histórico, contatos, acesso ao portal, código/cidade/situação da obra e período do contrato, sobre os fornecedores e obras que a API devolveu. Para mudar a distribuição de situações, mexa nos perfis `situacaoEmDia` / `situacaoMista` e nas proporções de lá.
- `src/app/SincronizarDemonstracao.tsx`: lê a API (TanStack Query) e aplica no `datasetStore` com `sincronizar`.
- `src/mocks/ficticio.ts` e os arquivos por domínio (`obras.ts`, `fornecedores.ts`, `documentos.ts`, `arquivos.ts`, `historico.ts`): o conjunto fictício que alimenta o **MSW** (`src/mocks/api/dados.ts`), não mais as telas.
- `exigencias.ts`: listas de exigências e tipos de documento (ainda sem API).
- `exemplos.ts`: o conteúdo que preenche os formulários e drawers ao abrir. Ids de obra do exemplo que não existem na base são trocados pelas primeiras obras disponíveis.
- `tempo.ts`: `relogioDoDia()` — o "hoje" é o do navegador, com hora fixa (08:00) para a tela não mudar a cada recarga.
- Contagens (fila, "5 de 9", aptos, pendências, vencimentos) não são digitadas: saem dos dados, por `src/entities/lib/`.

**Cor, raio, sombra, tipografia, espaçamento fixo** — `src/app/styles/theme.css`, bloco `@theme`.
- Vermelho da marca (`primary`) só na logo, no item ativo do menu, no contador da fila e na tag "Funcionários".
- Ação é grafite (`action-*`). Perigo (`destructive`) só no botão que confirma ação destrutiva.

**Hover e transição** — `src/app/styles/theme.css`
- Durações, curvas e escalas: tokens `--duration-*`, `--ease-ui`, `--scale-*` no `@theme`.
- Comportamentos: utilitárias `interactive-lift` (cartão), `interactive-press` (botão), `interactive-icon`, `interactive-row` (linha), `interactive-file`, `interactive-color`.
- Entrada e saída de drawer, modal, toast e aba: `--animate-*` e os `@keyframes` no mesmo bloco.
- Movimento reduzido: `src/app/styles/reset.css` e os blocos `prefers-reduced-motion` de cada utilitária.

**Logo** — `src/app/brand/`. Um arquivo com "simbolo" ou "symbol" no nome é a versão só do símbolo; qualquer outro é a versão com o nome. Lido por `src/shared/ui/Logo.tsx`.

**Ações** — cadastro, edição, tipos e bloqueio de fornecedor vão para a API (`src/features/fornecedores/hooks/useMutacoesFornecedor.ts`, com invalidação das queries). As demais (`useDecisoes`, `useVinculosObra`, `useAcoesFornecedor` para convite e contatos, `useAcoesLista`…) alteram o `datasetStore` em memória; o F5 desfaz.

**Exigências e tipos de documento** — `src/entities/exigencias` e `src/entities/tipoDocumento` (schema, mapper, api, consultas); telas em `src/features/exigencias` e `src/features/tiposDocumento`. Versão da lista: o back numera; a tela só mostra o que a API devolve.

**API** — `.env.local` (modelo em `.env.example`) com `VITE_API_URL` e `VITE_API_MOCK`, validadas em `src/shared/config/env.ts` (na Vercel, cadastre as duas). Cliente e erros em `src/shared/api/`; mensagens de erro por `code` em `src/shared/strings/erros.ts`; contratos por módulo em `src/entities/<módulo>/{schema,api,mapper,model}.ts`; mock de rede em `src/mocks/api/` (gatilhos de erro no README de lá). Para testar cada rota: `/_api`. Estado completo (o que é API e o que é demonstração) em `INTEGRACAO.md`.

**Publicação** — `vercel.json` reescreve todas as rotas para `/index.html`. `/_componentes`, `/_estados` e `/_api` existem também na build de produção.

**Navegação da análise** — a origem (fila, fornecedor ou obra) viaja na URL (`?de=`); helpers em `src/shared/lib/origem.ts` e `paths.ts`. A sequência "3 de 7" e o avanço depois de decidir estão em `src/features/analise/hooks/useSequencia.ts` e `useAvancar.ts`.

**Estados para revisão** — `/_estados` (lista em `src/pages/estados/catalogo.ts`; textos em `src/shared/strings/pages/estados.ts`).
