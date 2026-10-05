# Onde mexer

**Texto de interface** — `src/shared/strings/`
- `dominio.ts`: vocabulário do produto ("lista de exigências", "remessa", motivos de reprovação…). Trocar um termo aqui troca em todas as telas.
- `eventos.ts`: as frases do histórico das fichas ("vinculou a lista de exigências…").
- `pages/*.ts`: textos de cada página. `layout.ts`: menu e sidebar. `ui.ts`: componentes base. `status.ts`: rótulos dos badges e tags.

**Dados de exemplo** — `src/mocks/`
- Um arquivo por domínio: `obras.ts`, `fornecedores.ts`, `exigencias.ts`, `documentos.ts`, `arquivos.ts` (documentos de funcionário: envios e arquivos), `historico.ts`.
- `exemplos.ts`: o conteúdo que preenche os formulários e drawers ao abrir (cadastro de fornecedor, nova lista, novo documento, vínculos).
- `historico.ts` também guarda o tempo médio de análise por período (Relatórios).
- `tempo.ts`: o "hoje" da demonstração (16/09/2026). Esperas e vencimentos são calculados a partir dele. Com a API, "hoje" é a data do navegador.
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

**Ações em memória** — `src/mocks/store.ts` (`datasetStore`). Cada feature tem um hook de ações (`useDecisoes`, `useVinculosObra`, `useAcoesFornecedor`, `useAcoesLista`…) que altera a store; o F5 volta tudo ao exemplo. Com a API ligada, `useAcoesFornecedor` chama o back e recarrega o fornecedor de lá.

**API** — ligada por `VITE_USE_API=true` em `.env.local` (modelo em `.env.example`); detalhes em `INTEGRACAO.md`.
- Endereço do back: `VITE_API_URL` (o proxy do Vite em `vite.config.ts` repassa `/api` para ele).
- Chamadas: `src/entities/fornecedor/api.ts` e `src/entities/obra/api.ts`. Formato do back: `dto.ts`; tradução para o front: `mapper.ts` (inclusive `Material`/`Servico` ↔ `material`/`servico`).
- Mensagens de erro da API, por código: `src/shared/strings/api.ts`.
- Carregamento no boot: `src/mocks/hidratacao.ts`. Documentos, envios e histórico de demonstração sobre os dados reais: `src/mocks/gerar.ts`.

**Navegação da análise** — a origem (fila, fornecedor ou obra) viaja na URL (`?de=`); helpers em `src/shared/lib/origem.ts` e `paths.ts`. A sequência "3 de 7" e o avanço depois de decidir estão em `src/features/analise/hooks/useSequencia.ts` e `useAvancar.ts`.

**Estados para revisão** — `/_estados` (lista em `src/pages/estados/catalogo.ts`; textos em `src/shared/strings/pages/estados.ts`).
