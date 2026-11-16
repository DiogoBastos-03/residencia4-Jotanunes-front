# Integração com a API interna — estado atual

**Fase 2 concluída (16/11/2026): fornecedores e obras vêm da API.** O resto das telas continua em demonstração, agora gerada a partir do que a API devolveu.

A especificação é `../contrato-api-interna.md`, gerado da branch `dev` do back (commit `47cf912`). Ele fica na pasta acima do projeto, não na raiz de `Jnunes-front-interno`.

## Parte A — vínculo fornecedor ↔ obra (16/11/2026)

Fonte da verdade: o código do back (`../residenciaIV-api-interna`, branch `main`, commit `c242815`). O `contrato-api-interna.md` está desatualizado e não descreve estas rotas.

### Rotas, como estão no código

| Método e caminho | Corpo | Respostas |
|---|---|---|
| `POST /api/v1/internal/construction/constructions/{constructionId}/enterprises` (`ConstructionEnterpriseController.Add`) | `{ enterpriseId: Guid, limitExpiresDays: int }`, os dois obrigatórios; `limitExpiresDays` com `[Range(1, 9999)]` | **201** `{ assignedWorkFlowIds: int[], typesWithoutWorkflow: int[] }` (tipos: 1 = Material, 2 = Servico), com `Location` para `/constructions?enterpriseId=`. **400** `errors` por campo (`EnterpriseId`, `LimitExpiresDays`; mensagens já em português). **404** `CONSTRUCTION_NOT_FOUND`. **409** `ENTERPRISE_ALREADY_IN_CONSTRUCTION`. **404** `ENTERPRISE_NOT_FOUND`. **422** `ENTERPRISE_INACTIVE`. **422** `INVALID_LIMIT_EXPIRES_DAYS` (domínio; na prática o 400 vem antes). **404 sem corpo** se o id da URL não é GUID |
| `DELETE /api/v1/internal/construction/constructions/{constructionId}/enterprises/{enterpriseId}` (`.Remove`) | — | **204**. **404** `ENTERPRISE_NOT_IN_CONSTRUCTION`. **404 sem corpo** se algum id não é GUID |
| `GET /api/v1/internal/constructions?enterpriseId=&page=&pageSize=` (`ConstructionController.List`) | — | **200** página de `{ constructionId, constructionName }` (sem mudança) |

Ordem das verificações no POST (`AddEnterpriseToConstructionUseCase` → `WorkflowAssignmentServiceImpl`): validação 400 → obra existe → já vinculada (409) → empresa existe (404) → empresa ativa (422) → prazo (422) → grava os vínculos com os workflows atuais da obra que tenham um dos tipos da empresa (quem já segue o workflow por outra obra não ganha outro) → grava a linha em `tb_construction_enterprise`. São dois módulos **sem transação** entre eles (comentado no próprio código, "item 31 das pendências").

No DELETE: confere só o vínculo; encerra (com data de fim) os vínculos da empresa com os workflows da obra, menos os que outra obra dela também usa; apaga a linha da obra. Os vínculos com workflow ficam como histórico — **não são apagados**.

Erros: `AppException` e `DomainException` viram ProblemDetails com `code` no `GlobalExceptionHandler` (o de domínio sempre 422). Estas rotas não exigem o cabeçalho `X-Internal-User-Id`.

### Conferência com a API publicada

Todas as respostas acima foram provocadas na API do Render e batem com o código (status, `code` e title). Única observação, coerente com o código mas fácil de estranhar: **DELETE com obra inexistente responde `ENTERPRISE_NOT_IN_CONSTRUCTION`**, não `CONSTRUCTION_NOT_FOUND`, porque o caso de uso só confere o vínculo. Nenhuma divergência entre código e API publicada.

### O que mudou na interface

- **Ficha da obra:** lista os fornecedores vinculados (razão social, CNPJ, tipos, bloqueado) com **"Vincular fornecedor"** no topo e **"Desvincular"** em cada linha (a linha abre a ficha do fornecedor).
  - O modal de vincular pede o fornecedor e o **prazo de entrega dos documentos em dias** (1–9999), campo obrigatório da API.
  - Só oferece fornecedores **ativos** que ainda não estão na obra: o back recusa inativo (422) e repetido (409).
  - O desvincular pede confirmação no modal destrutivo do projeto (mesmo padrão do "Bloquear").
  - Depois de vincular, o toast diz o que a API devolveu: quantos workflows da obra o fornecedor passou a seguir e, se for o caso, para qual tipo dele a obra não tem workflow.
- **Ficha do fornecedor, aba Obras:** o endpoint opera pelos dois lados (obra no caminho, empresa no corpo), então a aba ganhou **"Vincular a uma obra"** e **"Desvincular"** por linha. Fornecedor bloqueado não tem o botão de vincular (o back recusaria); desvincular continua, porque o DELETE não confere se a empresa está ativa.
- **Cadastro de fornecedor:** voltou o bloco **"3. Obra (opcional)"** com obra e prazo. Fluxo: `POST /enterprises` e, se escolheu obra, o `POST` do vínculo.
  - **Decisão:** fazer no mesmo fluxo, com a falha parcial tratada. Se o vínculo falhar, o fornecedor já existe: a tela **não** diz "pronto". Ela abre a ficha dele na aba Obras (que lê a API e mostra que não há obra) com um aviso de erro dizendo que o vínculo não foi feito e por quê.
  - Achei seguro porque nada fica escondido: o estado mostrado é sempre o da API, e o vínculo pode ser refeito na própria aba.
- **Invalidação:** depois de vincular ou desvincular, invalida `['fornecedores']` (fornecedores da obra, contagens por obra da lista e da visão geral, detalhe) e `['obras']` (obras do fornecedor). Também invalida quando a API responde que o estado mudou por fora (409 já vinculada, 404 não está na obra, 422 inativa, 404 obra ou empresa): o modal mostra o erro e a lista atrás já se corrige.
- **Erros:** os 5 códigos novos estão em `src/shared/strings/erros.ts`. No modal, prazo vai ao lado do campo; o resto vai no alerta do topo.
- **Removido por falta de suporte:** nada desta área estava na tela sem suporte. O "Vincular fornecedor" antigo (com serviço contratado e período) já tinha saído na etapa anterior; o novo só tem o que o POST aceita.

### O que o back oferece nesta área e não foi implementado

- **`assignedWorkFlowIds` (ids):** a tela mostra só a quantidade. Os ids não têm nome sem os endpoints de workflow, e workflows/listas de exigências estão fora do escopo desta parte.
- **`limitExpiresDays` por vínculo não é lido de volta:** não há rota que devolva o prazo de um vínculo existente, então a tela não o mostra depois.

### Verificação

| # | Passo | Resultado |
|---|---|---|
| 1 | `typecheck` e `build` | ✅ limpos |
| 2 | Mock (`VITE_API_MOCK=true`) | ✅ Vincular e desvincular nas duas fichas; cadastro com obra (sucesso e falha parcial forçada); 10 cenários novos na `/_api` rodados contra os handlers, todos com o status e o `code` do back |
| 3 | API real: obra bate com a API | ✅ Residencial Jardim das Flores: Alfa, Beta, Gama — igual a `GET /enterprises?constructionIds=` |
| 4 | API real: vincular e persistir | ✅ Delta Elétrica vinculada pela ficha da obra (prazo 30); a API respondeu 1 workflow atribuído; após recarregar, continua lá |
| 5 | API real: desvincular o mesmo | ✅ Delta desvinculada pela ficha do fornecedor (aba Obras); sumiu da obra |
| 6 | API real: erros na tela | ✅ 409 `ENTERPRISE_ALREADY_IN_CONSTRUCTION`, 404 `ENTERPRISE_NOT_FOUND` e 404 `ENTERPRISE_NOT_IN_CONSTRUCTION`, cada um com a mensagem da tabela no modal |
| 7 | 390 px | ✅ Sem rolagem horizontal na ficha da obra, na aba Obras, no cadastro, na `/_api` e com o modal aberto |

Detalhe dos erros do passo 6:
- O 409 e o 404 de empresa foram provocados injetando no select do modal um id que a tela não ofereceria. O back recusa antes de gravar, então não houve escrita.
- O 404 do desvínculo veio de um modal deixado aberto numa aba enquanto o mesmo vínculo era removido em outra.

**Estado do banco real:**
- Os vínculos fornecedor ↔ obra estão iguais aos de antes do teste: conferi as 4 obras antes e depois.
- **Criado e removido:** o vínculo Delta Elétrica ↔ Residencial Jardim das Flores.
- **O que fica:** pelo desenho do back, o vínculo da Delta com o workflow da obra criado no POST **não é apagado** pelo DELETE, só encerrado com data de fim (histórico). Não há rota para apagá-lo.
- **Fora desta parte:** a empresa "Revest Nordeste Revestimentos Ltda." criada na Fase 2 continua no banco.

**Fora do escopo, notado na `/_api`:** o cenário de pendências "REQUIREMENT_NOT_POSTPONABLE" não acha dado no fixture atual do MSW.

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

| Variável | Valor | Para quê |
|---|---|---|
| `VITE_API_URL` | `https://residenciaiv-api-interna-latest.onrender.com` | URL base da API (sem `/api/v1/internal`) |
| `VITE_API_MOCK` | `true` / `false` | `true`: o MSW responde na rede, com os dados fictícios (é o que a Vercel roda hoje); `false`: as chamadas vão para a URL real |
| `API_PROXY_ALVO` | opcional, só no `npm run dev` | Repassa `/api` e `/health` do dev server para a API (ver abaixo). Não começa com `VITE_`, nunca vai para o bundle |

- As duas `VITE_` são validadas com Zod no boot, em `src/shared/config/env.ts`. Esse é o único arquivo que lê `import.meta.env`.
- A escolha mock × real acontece só no boot (`src/main.tsx`). O código das telas é o mesmo nos dois modos: sempre chama a API pelo `fetch`; com o mock, quem responde é o MSW.
- **Na Vercel, as duas `VITE_` precisam estar cadastradas.**

### Rodar local contra a API real

A API do Render não manda cabeçalho CORS para `http://localhost`. O navegador barra a chamada direta. Para desenvolver contra a API real, use o proxy do Vite (no `.env.local`):

```
VITE_API_MOCK=false
VITE_API_URL=http://localhost:5173
API_PROXY_ALVO=https://residenciaiv-api-interna-latest.onrender.com
```

Conferir: **`/_api`** lista as 14 rotas do contrato, com 55 cenários; **`/_estados`** lista os estados de cada tela, com link direto.

## O que vem da API e o que é demonstração (Fase 2)

### Como funciona

```
API (ou MSW) ──TanStack Query──► SincronizarDemonstracao ──sincronizar()──► datasetStore ──► telas
                 │                                                                   ▲
                 └── detalhe e mutações de fornecedor ──────────────────────────────┘ (ficha e formulários)
```

- **Leitura** (`src/features/*/hooks`):
  - `useFornecedoresApi` busca todas as páginas de `GET /enterprises`, com `pageSize` 50, até o `totalCount`.
  - `useObrasApi` faz o mesmo em `GET /constructions`.
  - `useVinculosApi` busca `GET /enterprises?constructionIds=<obra>`, uma vez por obra. A API não tem rota de vínculo; é ela que diz quem está em qual obra.
  - `useFornecedorDetalhe` lê `GET /enterprises/{id}`.
  - Tudo fica no cache do Query (`queryKeys` da Fase 1).
- **Base → telas** (`src/app/SincronizarDemonstracao.tsx`): a cada resposta nova, aplica a base sobre o dataset em memória com `sincronizar` (`src/mocks/gerar.ts`, função pura e idempotente).
  - Antes da primeira carga, toda tela que usa o dataset fica em "carregando".
  - Se a carga falha, mostram o estado de erro com "Tentar de novo", que refaz as queries (`useDatasetQuery`).
- **Demonstração determinística**:
  - A "sorte" vem de um hash FNV-1a do id. Não usa `Math.random`.
  - O "hoje" é o do navegador, com hora fixa (08:00). Recarregar a página não muda a tela.
  - O que já foi gerado ou decidido na sessão não é refeito: só o que falta é gerado (fornecedor novo, tipo trocado).
- **Busca e filtros**: são feitos no front sobre a lista inteira.
  - A busca para em 200 itens.
  - Acima disso, a tela de fornecedores mostra um aviso discreto de lista parcial.
  - A busca vai para o servidor quando o back tiver o parâmetro (comentário em `src/shared/api/paginas.ts`).
- **Mutações** (`src/features/fornecedores/hooks/useMutacoesFornecedor.ts`, `useMutation`):
  - **Cadastro:** `POST /enterprises`.
  - **Edição:** `PATCH /enterprises/{id}` só com os campos que mudaram, e `PUT /types` se os tipos mudaram.
  - **Bloqueio:** `PATCH /status` com `{active:false}` para bloquear e `{active:true}` para desbloquear.
  - Depois de cada uma, `invalidateQueries(['fornecedores'])`: a listagem, o detalhe e os vínculos buscam de novo. Nada é editado no cache à mão e não há atualização otimista.
  - Os botões mostram "Cadastrando…", "Salvando…" ou "Bloqueando…" e voltam ao normal em qualquer saída, inclusive em erro.
- **Erros** (`errosDaApi` em `src/features/fornecedores/lib.ts`):
  - **400 com `errors`:** cada campo recusado ganha a mensagem dele ao lado. O texto do ASP.NET vem em inglês, então a mensagem sai de `errosApi.porCampo`.
  - **409 `CNPJ_ALREADY_REGISTERED`** e **422 `INVALID_CNPJ`:** erro no campo CNPJ.
  - **422 `INVALID_PHONE`, `INVALID_EMAIL`, `INVALID_ENTERPRISE_NAME`, `ENTERPRISE_TYPE_REQUIRED` e `INVALID_ENTERPRISE_TYPE`:** erro no campo correspondente.
  - **404 na ficha** (`ENTERPRISE_NOT_FOUND`, ou 404 sem corpo quando o id não é GUID): tela "Fornecedor não encontrado".
  - **Rede e 5xx:** estado de erro com "Tentar de novo" e a mensagem do `code`.
  - Todas as mensagens vêm de `src/shared/strings/erros.ts`.
- **Cold start do Render**:
  - O timeout é de 65 s.
  - Requisição que passa de 4 s mostra, acima do esqueleto, a linha "Acordando o serviço, isso pode levar alguns segundos.", que some quando a resposta chega (`src/shared/api/lentidao.ts` e `SkeletonRegion`).
  - Lentidão não vira erro.

### Tela por tela

| Tela | Da API | Demonstração |
|---|---|---|
| **Fornecedores** (lista) | Quais fornecedores existem, razão social, CNPJ, tipos e bloqueio | Situação (apto/pendência), contagem de documentos, listas aplicáveis, "Aguardando 1º acesso" |
| **Ficha do fornecedor** | Cabeçalho (razão social, CNPJ, tipos, situação bloqueado, telefone, e-mail, "fornecedor desde") e a **aba Dados** (nova), toda do `GET /enterprises/{id}` | Abas Documentos, Exigências, Obras, Histórico e Contatos; "Reenviar acesso"; "Cobrar pendências" |
| **Cadastrar fornecedor** | CNPJ, razão social, telefone, e-mail e tipos (POST) | Nome fantasia, contato, convite e obra. Ficam em memória, presos ao id que a API devolveu, e somem no F5 |
| **Editar dados / Bloquear / Desbloquear** | Tudo (PATCH, PUT, PATCH status) | — |
| **Obras** (lista) | Quais obras existem, nome e fornecedores de cada uma | Código, cidade, situação, listas de exigências, pendências |
| **Ficha da obra** | Nome e fornecedores vinculados | O resto. "Vincular fornecedor" continua só em memória (não há rota) |
| **Visão geral, Fila, Análise, Envio, Exigências, Relatórios** | Indiretamente: são calculadas sobre os fornecedores e obras da API | Todo o conteúdo |
| **`/_estados`** | — | O catálogo agora é montado a partir dos dados carregados (procura um exemplo de cada caso em vez de fixar ids). As descrições deixaram de citar empresas fictícias |
| **`/_api`** | Inalterada. Com o service worker indisponível, avisa que o mock está no plano B | — |

### O que ainda é demonstração (sem rota no contrato)

- Documentos, envios, arquivos de funcionário, análise (aprovar/reprovar), fila, histórico e relatórios.
- Listas de exigências e o vínculo lista ↔ obra.
- Contatos, convite e acesso ao portal; nome fantasia.
- Código, cidade e situação da obra; serviço contratado e período do vínculo.
- Vincular fornecedor a uma obra (o drawer da obra e a obra escolhida no cadastro).
- Fase 3 (fora desta fase): acervo, visualização, download em lote, painel de pendências, postergação.

### Mock de rede nesta fase

- O MSW serve os 41 fornecedores e as 10 obras fictícias, com GUIDs. As telas leem esses dados pela rede, como na API real.
- Cadastro, edição e bloqueio passam pelos handlers e somem no F5.
- **Navegador sem service worker** (ex.: o navegador embutido do Claude): o boot troca o `fetch` por um que consulta os mesmos handlers (`getResponse` do MSW). Antes da Fase 2 a tela ficava sem resposta; agora funciona igual.

## Camada de API (Fase 1)

### Configuração e cliente — `src/shared/`

| Arquivo | O que faz |
|---|---|
| `config/env.ts` | Valida `VITE_API_URL` e `VITE_API_MOCK` |
| `api/client.ts` | `fetch` com base URL, JSON e `AbortSignal`. Timeout de 65 s (o Render Free acorda em até ~1 min). 204 sem corpo, texto (`/health`) e binário com o nome lido do `Content-Disposition`. Valida toda resposta JSON com o schema Zod |
| `api/problem.ts` | `ApiError { status, code, title, errors, traceId }`, mais `mensagem`, `errosDoCampo(campo)` e `camposComErro` |
| `api/schemas.ts` | GUID, data/hora UTC, data simples e o envelope de paginação (até 50 por página) |
| `api/keys.ts` | Fábrica das query keys (`queryKeys.fornecedores.lista(filtros)`, …) |
| `api/health.ts` | `GET /health` |
| `strings/erros.ts` | Mensagem em português para cada `code` |

Regras do `ApiError`, conforme a seção 2.1 do contrato:
- **Erro de negócio:** guarda o `code` do ProblemDetails.
- **400 sem `code`:** vira `VALIDATION_ERROR` e guarda o `errors`. A chave chega como o ASP.NET manda (`Email`, `$.enterpriseTypes[0]`); `errosDoCampo('email')` normaliza.
- **5xx sem `code`:** vira `INTERNAL_ERROR`.
- **Rede ou timeout:** status 0 e `NETWORK_ERROR`.
- **Resposta fora do contrato:** `INVALID_RESPONSE`, com o caminho do campo que falhou no `title`.
- **404 sem corpo** (GUID inválido na URL): fica sem `code` e mostra a mensagem genérica.

### Contratos por módulo — `src/entities/`

Cada módulo tem `schema.ts` (Zod; os tipos vêm de `z.infer`), `api.ts` (chama e valida), `mapper.ts` (API → domínio em português) e `model.ts`.

| Módulo do contrato | Pasta | Rotas | Funções |
|---|---|---|---|
| enterprise | `entities/fornecedor` | 6 | `fornecedorApi.cadastrar`, `listar`, `detalhar`, `editar`, `trocarTipos`, `definirBloqueio` |
| construction | `entities/obra` | 1 | `obraApi.listar` |
| archive | `entities/acervo` (novo) | 3 | `acervoApi.listar`, `linkVisualizacao` (nunca em cache), `baixarEmLote` (binário) |
| expiration | `entities/pendencias` (novo) | 3 | `pendenciasApi.painel`, `postergar`, `cancelarPostergacao` |

Como os dados mudam entre a API e o domínio:
- **Enums:** `Material`/`Servico` ↔ `material`/`servico`; `active` ↔ `bloqueado` (invertido).
- **Datas:** UTC com Z vira horário local. `deadlineAt` é tratado à parte, sempre como só data (`yyyy-MM-dd`), sem fuso.
- **CNPJ e telefone:** chegam e ficam só com dígitos; a máscara é do front.
- **`constructionIds`:** vai na query como parâmetro repetido.
- **`model.ts` de fornecedor e obra:** ganharam tipos novos (`FornecedorResumo`, `FornecedorCadastro`, `Pagina<T>`, `ObraResumo`) para o recorte que a API devolve; os tipos de domínio que já existiam continuam.

### TanStack Query — `src/app/`

- `queryClient.ts` com estes padrões:
  - sem refetch ao focar a janela;
  - `staleTime` de 30 s;
  - retry (até 2) **só** em `NETWORK_ERROR` e 5xx, nunca em 4xx nem em `INVALID_RESPONSE`;
  - mutações sem retry.
- Provider em `providers.tsx`. As devtools só carregam em desenvolvimento.

### Mock de rede — `src/mocks/api/`

- O MSW implementa todas as rotas, com as mesmas validações.
- Os dados saem do conjunto fictício (`src/mocks/ficticio.ts`), convertido para o formato da API.
- Todo código de erro do contrato é alcançável. Os que nenhuma entrada JSON alcança usam o cabeçalho de teste `X-Mock-Code`, que só existe no mock.
- A tabela de gatilhos está em `src/mocks/api/README.md`.
- O MSW, as devtools e o que eles puxam ficam fora do pedaço `vendor`: só carregam com `VITE_API_MOCK=true` ou em desenvolvimento.

## Verificação da Fase 2

| # | Passo | Resultado |
|---|---|---|
| 1 | `typecheck` e `build` | ✅ limpos |
| 2 | Mock: números coerentes | ✅ Ver detalhe abaixo da tabela |
| 3 | Determinismo | ✅ `sincronizar` duas vezes sobre a mesma base dá dataset idêntico; aplicado de novo sobre o resultado, não muda nada |
| 4 | API real: listagem | ✅ 11 empresas, começando por "Admin" e "Alfa Materiais de Construção"; 4 obras, 11 vínculos |
| 5 | API real: ficha | ✅ Aba Dados e cabeçalho com dados reais (telefone, e-mail, datas); demais abas com demonstração |
| 6 | API real: cadastro | ✅ "Revest Nordeste Revestimentos Ltda." (CNPJ 45.987.321/0001-60) criada pela tela; depois do reload, 12 empresas |
| 7 | API real: editar, bloquear, desbloquear | ✅ Pela tela, em sequência: telefone para (81) 98765-4321 e e-mail para financeiro@revestnordeste.com.br, depois bloquear, depois desbloquear. Cada passo conferido com reload |
| 8 | API real: erros | ✅ Ver detalhe abaixo da tabela |
| 9 | "Acordando o serviço" | ✅ Com o `fetch` atrasado 9 s no navegador: o aviso não aparece em 1 s nem em 3 s, aparece em 5 s e 6,5 s, e some quando a ficha carrega. O Render estava acordado durante o teste, então o cold start real não foi observado |
| 10 | Offline | ✅ Com `VITE_API_URL` apontando para uma porta fechada: estado de erro com a mensagem de `NETWORK_ERROR`; "Tentar de novo" volta a carregar e mostra o erro de novo |
| 11 | `/_estados` e `/_api` | ✅ Todos os links da `/_estados` resolvem para dados existentes; amostra de 10 aberta, cada um no estado certo (inclusive "não encontrado"). `/_api` responde, inclusive com erro forçado |
| 12 | 390 px | ✅ Sem rolagem horizontal em visão geral, fornecedores, ficha (Documentos e Dados), cadastro, obras, ficha da obra, fila, `/_estados` e `/_api` |

**Detalhe do passo 2 (mock):**
- 41 fornecedores: 24 aptos, 16 com pendência e 1 bloqueado.
- Os mesmos 88 da fila aparecem no contador do menu, na visão geral e na fila; a soma por obra também dá 88.
- 62 documentos vencendo em 30 dias na visão geral, iguais à contagem do dataset.
- Documentos: 209 aprovados, 62 vencendo, 19 vencidos, 24 em análise, 21 reprovados e 27 pendentes.
- 11 envios de funcionário com arquivos em estados diferentes.

**Detalhe do passo 8 (API real):**
- O 409 foi provocado com o CNPJ da Alfa (válido e já cadastrado). O erro foi para o campo CNPJ.
- Dígito verificador errado deu 422 `INVALID_CNPJ`, no campo CNPJ.
- Telefone inválido deu 422 `INVALID_PHONE`, no campo telefone.
- Um 400 com 5 campos recusados pôs mensagem em cada campo.
- O 404 da ficha foi testado de dois jeitos: GUID inexistente e id que não é GUID.
- Todos estes foram executados chamando as funções da camada direto (Node), porque na tela a validação local pega antes (ver abaixo).

**Na tela, a validação local pega antes da API:**
- **CNPJ já cadastrado:** a checagem ao digitar já marca o campo (com link para a ficha) e não envia. O 409 da API continua mapeado para o mesmo campo, para o caso de o CNPJ ter sido cadastrado por outra pessoa depois da carga.
- **Dígito do CNPJ errado e telefone/e-mail fora do formato:** também são barrados no front, com a mesma mensagem por campo.

## Divergências e lacunas entre o contrato e o que o front precisa

1. **Datas sem `Z`.**
   - O contrato diz UTC com `Z`, mas a API publicada devolve `createdAt`/`updatedAt` sem fuso (`"2026-01-05T09:00:00"`).
   - O schema aceita os dois formatos e trata o sem fuso como UTC.
   - Antes da correção, o detalhe falhava com `INVALID_RESPONSE`.
2. **400 em inglês.**
   - As mensagens de validação do ASP.NET vêm em inglês.
   - O front ignora o texto e usa a mensagem do campo (`errosApi.porCampo`).
3. **Telefone vazio.**
   - A API publicada dá 400 para `phone: ""` (`[Required]` do ASP.NET recusa string vazia).
   - O mock aceitava. O handler foi corrigido.
4. **Não há rota de vínculo empresa ↔ obra.**
   - O vínculo é lido com uma chamada a `GET /enterprises?constructionIds=` por obra.
   - Não dá para criar vínculo: a obra escolhida no cadastro e o "Vincular fornecedor" da obra ficam só em memória.
5. **A listagem de empresas não traz telefone, e-mail nem datas.**
   - A ficha faz uma chamada a mais (detalhe).
   - A lista não mostra esses campos.
6. **Não há busca por texto na listagem.**
   - Filtro e busca são feitos no front sobre a lista inteira, até 200 itens.
7. **CORS.**
   - A API do Render não libera `http://localhost`. O proxy do Vite (`API_PROXY_ALVO`) resolve no desenvolvimento.
   - Precisa estar liberada a origem da Vercel quando ela rodar com `VITE_API_MOCK=false`.
8. **Fornecedor "Admin" na base.**
   - É uma empresa de seed com os dois tipos e sem obra.
   - Aparece como apto, com "0 de 0" documentos.
9. **Da Fase 1, continuam valendo:**
   - Não há lista de exigências por fornecedor nem `documentSubmissionId` para exigência nunca enviada.
   - Os status do acervo não batem um a um com os do front.
   - `ENTERPRISE_TYPE_REQUIRED` e `INVALID_ENTERPRISE_TYPE` são inalcançáveis por JSON (o 400 vem antes).
   - O contrato não define a ordem das verificações.
   - Os CNPJs dos 10 fornecedores do protótipo não têm dígito verificador válido.

## Histórico

- Out/2026: uma primeira integração (só fornecedores e obras, sem Zod nem Query) foi feita e depois removida, para o painel ir para a Vercel 100% em demonstração.
- Fase 1 (16/11/2026): camada de API completa, mock na rede, rota `/_api`. Nenhuma tela mudou.
- Fase 2 (16/11/2026): fornecedores e obras pela API com TanStack Query; cadastro, edição, tipos e bloqueio pela API; demonstração determinística gerada sobre a base; aba Dados; aviso de cold start; `/_estados` dinâmica.
- Fase 3 (próxima): acervo, visualização, download em lote, painel de pendências e postergação.
