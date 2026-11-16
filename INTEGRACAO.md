# Integração com a API interna — estado atual

**16/11/2026.** O painel interno mostra **somente** o que vem da API. Telas sem endpoint saíram do menu e das rotas.

**Fonte da verdade:**
- O código do back, em `../residenciaIV-api-interna`, branch `main`, commit `c242815`.
- O `contrato-api-interna.md` está desatualizado e não cobre o módulo `workflow` nem o vínculo empresa ↔ obra.

## Telas e de onde vem cada dado

| Tela | Endpoints | O que mostra / oferece |
|---|---|---|
| Visão geral | `GET /enterprises`, `GET /constructions`, `GET /enterprises?constructionIds=` | Empresas (total, ativas, bloqueadas, por tipo), obras, empresas por obra |
| Fornecedores | `GET /enterprises` (+ filtro por obra para contar obras) | Razão social, CNPJ, tipos, nº de obras, bloqueado. Filtros tipo e ativo/bloqueado, busca no cliente |
| Ficha do fornecedor | `GET /enterprises/{id}`, `GET /constructions?enterpriseId=`, `PATCH`, `PUT /types`, `PATCH /status`, vínculo com obra | Abas **Dados** e **Obras**; editar, bloquear, desbloquear, vincular e desvincular obra |
| Cadastrar fornecedor | `POST /enterprises` (+ vínculo opcional) | Razão social, CNPJ, telefone, e-mail, tipos e obra opcional |
| Obras | `GET /constructions` (+ filtro por obra) | Nome e nº de fornecedores |
| Ficha da obra | `GET /constructions`, `GET /enterprises?constructionIds=`, `GET/POST /workflow/constructions/{id}/workflows`, vínculo com fornecedor | Nome, **listas de exigências** em uso (com versão), fornecedores; vincular lista, vincular/desvincular fornecedor |
| Exigências | `GET /workflow/workflows?type=&name=` | Listas com filtro por tipo e busca por nome (no back) |
| Nova lista | `POST /workflow/workflows` | Nome, tipo, documentos exigidos, obra e prazo opcionais |
| Ficha da lista | `GET /workflow/workflows/{id}`, `…/versions`, `PATCH`, `PUT …/requirements` | Versão vigente, documentos, histórico de versões; renomear; editar exigências (gera versão) |
| Tipos de documento | `GET /workflow/document-definitions`, `…/{id}`, `POST`, `PATCH`, `GET /workflow/document-formats` | Validade, tamanho, formatos, reaproveitável; criar e editar |

## O que volta em qual fase

| Fica fora até haver endpoint | Onde está o código | Volta quando |
|---|---|---|
| Aba **Documentos** da ficha do fornecedor | `features/fornecedores/components/AbaDocumentos.tsx`, `hooks/useFichaDocumental.ts` | Fase 3: acervo (`GET /enterprises/{id}/archive`) funcionando (hoje dá 500) |
| Aba **Exigências** da ficha do fornecedor | `AbaExigenciasFornecedor.tsx` | Quando houver rota "exigências de um fornecedor" (hoje só o painel de pendências, que vem vazio) |
| Aba **Histórico** | `AbaHistoricoFornecedor.tsx` | Endpoint de eventos/histórico |
| Aba **Contatos** e "Reenviar acesso" | `AbaContatos.tsx`, `ModalEditarContato.tsx`, `ModalReenviarAcesso.tsx` | Endpoints de contatos e de convite ao portal |
| Fila de análise, Análise do documento, Remessa | `pages/fila`, `pages/analise`, `pages/envio`, `features/analise` | Endpoints de fila e de decisão de análise |
| Relatórios | `pages/relatorios`, `features/relatorios` | Endpoints de relatórios |
| Painel de pendências e postergação | `entities/pendencias` (camada pronta, sem tela) | Fase 3, quando o painel devolver dados |
| ~~Exigências (listas) e tipos de documento~~ | — | **Voltaram nas Partes B e C** |

## Partes B e C — parametrização documental (16/11/2026)

Módulo `workflow` do back, lido inteiro: 4 controllers, DTOs, 13 casos de uso, entidades, value objects e services de validação.

### Rotas, como estão no código

Prefixo `/api/v1/internal/workflow`. O id da lista ("workflow") é **inteiro**; o da versão é GUID. Enum de tipo como string (`"Material"`, `"Servico"`) no corpo; na query o back aceita também `1`/`2`.

| Método e caminho | Corpo | Respostas |
|---|---|---|
| `GET /document-formats` | — | 200 `[{ documentFormatId, name, icon, type }]` (só ativos, por nome) |
| `GET /document-definitions?name=&page=&pageSize=` | — | 200 página de `{ documentDefinitionId, name, description, maxSizeBytes, canReuse, expiresInDays\|null, acceptedFormatIds }` |
| `GET /document-definitions/{id}` | — | 200 o mesmo + `createdAt`, `updatedAt`. 404 `DOCUMENT_DEFINITION_NOT_FOUND` |
| `POST /document-definitions` | `name` (≤100), `description` (obrigatória, pode ser vazia, ≤255), `maxSizeBytes`, `canReuse`, `expiresInDays` (null = não vence), `acceptedFormatIds` (≥1) | 201 `{ documentDefinitionId }`. 400. 422 `INVALID_VALIDITY_DAYS`, `INVALID_DOCUMENT_DEFINITION_NAME`, `INVALID_DOCUMENT_DEFINITION_DESCRIPTION`, `INVALID_MAX_SIZE` (1 byte–20 MB), `FORMATS_REQUIRED`. 409 `DOCUMENT_DEFINITION_NAME_ALREADY_EXISTS`. 404 `DOCUMENT_FORMAT_NOT_FOUND` |
| `PATCH /document-definitions/{id}` | parcial; `neverExpires: true` remove a validade | 204. 422 `INVALID_EXPIRATION_INPUT` (validade e `neverExpires` juntos), 404, 409, 422/404 como no POST. Corpo sem campos: 204 sem gravar |
| `GET /workflows?type=&name=&page=&pageSize=` | — | 200 página de `{ workFlowId, name, type }` |
| `GET /workflows/{id}` | — | 200 `{ workFlowId, name, type, createdAt, updatedAt, currentVersion: { workFlowVersionId, version, documents[{ documentDefinitionId, displayOrder, required }], createdAt } }`. 404 `WORKFLOW_NOT_FOUND`. 500 `WORKFLOW_WITHOUT_VERSION` |
| `GET /workflows/{id}/versions` | — | 200 lista de versões. 404 |
| `POST /workflows` | `name` (≤150), `type`, `documents` (≥1), `constructionId?`, `limitExpiresDays?` (obrigatório e 1–9999 **só com obra**; sem obra é ignorado) | 201 `{ workFlowId, workFlowVersionId, assignedEnterpriseIds }`. 400. 422 `INVALID_DOCUMENT_REQUIREMENT`, `INVALID_DISPLAY_ORDER`, `DUPLICATED_REQUIREMENT`, `INVALID_WORKFLOW_NAME`. 404 `DOCUMENT_DEFINITION_NOT_FOUND`, `CONSTRUCTION_NOT_FOUND`. 409 `CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE` |
| `PATCH /workflows/{id}` | `{ name }` | 204. 400. 404. Não cria versão |
| `PUT /workflows/{id}/requirements` | `{ documents }` | 200 `{ workFlowId, workFlowVersionId, version }`. Exigências iguais às vigentes devolvem a vigente (não cria versão). 400, 404, 422 como no POST |
| `GET /constructions/{obraId}/workflows` | — | 200 `[{ workFlowId, name, type, workFlowVersionId, version }]` (a versão em uso). 404 `CONSTRUCTION_NOT_FOUND` |
| `POST /constructions/{obraId}/workflows` | `{ workFlowId, limitExpiresDays }` (1–9999) | 201 `{ workFlowVersionId, assignedEnterpriseIds }`. 400. 404 `WORKFLOW_NOT_FOUND`, `CONSTRUCTION_NOT_FOUND`. 409 `WORKFLOW_ALREADY_IN_CONSTRUCTION`, `CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE` |

### Regras do domínio e como a tela as respeita

| Regra (onde está no back) | Na tela |
|---|---|
| **Versionamento** (`WorkFlowVersion.CreateNext`, `WorkflowVersionNumber.Next` = atual + 1,00): alterar as exigências cria versão nova; a anterior nunca muda | O drawer "Editar exigências" avisa antes de salvar ("cria a versão N+1; a N fica guardada") e o botão diz "Criar versão N+1". Depois, o toast mostra o número **que a API devolveu**. A ficha lista todas as versões |
| Exigências iguais às vigentes não criam versão (`HasSameRequirements`) | O botão fica desabilitado enquanto nada mudou; se a API devolver a mesma versão, o toast diz "Nada mudou: continua na versão N" |
| Mudar a versão **move as obras e os vínculos abertos** para a nova (`UpdateWorkflowRequirementsUseCase`) | O aviso diz isso; a ficha da obra passa a mostrar a versão nova (invalidação de `['listas']`) |
| Renomear não cria versão (`RenameWorkflowUseCase`) | O modal diz isso |
| **Tipo** (`WorkFlowEnterpriseType` Material = 1, Servico = 2): a lista se aplica às empresas da obra ativas e com o tipo dela (`ConstructionAssignmentBuilder`) | O tipo aparece em toda lista ("Vale para fornecedores de…"). O toast do vínculo diz quantos fornecedores passaram a segui-la (`assignedEnterpriseIds`) |
| **Uma lista de cada tipo por obra** (`EnsureConstructionCanUseTypeAsync`) e a mesma lista não entra duas vezes | "Vincular lista" só oferece listas que a obra não usa e de tipo que ela ainda não tem; sem nenhuma, o botão não aparece. Na nova lista, só as obras livres para o tipo escolhido |
| Documento repetido (`DUPLICATED_REQUIREMENT`) e ordem repetida ou negativa (`INVALID_DISPLAY_ORDER`) | O editor só oferece tipos que ainda não estão na lista; a ordem é a posição na tela (1, 2, 3…) |
| Prazo só com obra (`CreateWorkflowRequest.Validate`) | O campo de prazo só aparece depois de escolher a obra; sem obra, o prazo nem é enviado |
| Tipo de documento: nome único, tamanho 1 byte–20 MB, validade 1–9999 dias ou "não vence", ≥1 formato ativo | Validação local igual; validade é escolha "Vence (dias) / Não vence", e "Não vence" vira `neverExpires: true` no PATCH (nunca junto com os dias). O PATCH leva só os campos que mudaram |
| Não existe excluir lista, excluir tipo nem desvincular lista de obra | Nenhum botão para isso |

### Divergências entre o código e a API publicada

- **Nenhuma** nas respostas: todas as rotas e os erros provocáveis sem gravar batem com o código (status, `code` e title).
- **Busca por nome sem diferenciar maiúsculas.** Vale para listas e tipos (`name=Padr` acha "padrão"). O código usa `Contains`, então a diferença vem do collation do banco. O MSW imita.
- **Não conferido:** se o nome único de tipo de documento diferencia maiúsculas no banco (`FindByNameAsync` usa `==`). Testar exigiria gravar. O MSW compara exato.
- **Erros que nenhuma entrada JSON alcança**, porque o `[Required]` e o `[StringLength]` dão 400 antes: `INVALID_WORKFLOW_NAME`, `REQUIREMENTS_REQUIRED`, `INVALID_WORKFLOW_TYPE`, `INVALID_DOCUMENT_DEFINITION_NAME`, `INVALID_DOCUMENT_DEFINITION_DESCRIPTION`, `EXPIRATION_POLICY_REQUIRED`. Na `/_api` saem forçados no mock.

### Telas

| Tela | O que tem |
|---|---|
| **Exigências** (`/exigencias`) | Listas (nome e tipo); filtro por tipo e busca por nome **no back** (`type` e `name`), com 300 ms de espera na digitação |
| **Nova lista** (`/exigencias/nova`) | Nome, tipo, documentos (escolher, obrigatório/opcional, ordenar, remover), obra e prazo opcionais |
| **Ficha da lista** (`/exigencias/:id`) | Tipo, criada em, versão vigente com a data, documentos na ordem (com validade e formatos do tipo), todas as versões; Renomear e Editar exigências |
| **Tipos de documento** (`/tipos-de-documento`, novo) | Nome e descrição, validade, tamanho máximo, formatos, reaproveitável; busca no cliente; Novo e Editar (drawer com criado/atualizado em) |
| **Ficha da obra** | Bloco "Listas de exigências" (lista, tipo, versão em uso) e "Vincular lista" (lista + prazo) |

**Criar lista já vinculada a uma obra:** ofereci, porque o back faz tudo numa chamada só (sem falha parcial). O prazo só aparece com obra escolhida e só vai no corpo nesse caso.

**Componentes antigos de exigências:** o modelo antigo (escopo empresa/funcionário, validade por item, lembretes, prazo de envio, alcance) não bate com a API. A feature antiga e suas 3 páginas foram apagadas e refeitas sobre `entities/exigencias` e `entities/tipoDocumento`.

### Camada de dados

- **`entities/tipoDocumento`:** formatos e tipos de documento.
- **`entities/exigencias`:** listas, versões e listas da obra.
- **Cada entidade tem:** `schema.ts` (Zod), `mapper.ts`, `api.ts` e `consultas.ts`, com as queries e as mutações.
- **Query keys:** `queryKeys.listas` (tudo sob `['listas']`), `queryKeys.tiposDocumento` e `queryKeys.formatos`.
- **Invalidação:**
  - Qualquer mudança em lista (criar, renomear, nova versão, vincular a obra) invalida `['listas']`: listagem, ficha, versões e as listas de todas as obras.
  - Mudança em tipo de documento invalida `['tiposDocumento']`.
  - Os erros que mostram estado velho (`WORKFLOW_NOT_FOUND`, 409 do vínculo) também invalidam.
- **Mensagens:** os 20 códigos novos estão em `src/shared/strings/erros.ts`. Os erros vão para o campo certo (nome, tipo, documentos, obra/lista, prazo, tamanho, validade, formatos).

### MSW e `/_api`

**MSW:**
- Todas as 13 rotas, com a mesma ordem de verificação dos casos de uso.
- Dados: os 4 formatos, os tipos de documento (os mesmos ids do acervo), "Material padrão" e "Serviço padrão" e o uso delas nas obras.
- O vínculo empresa ↔ obra da Parte A agora devolve os workflows reais da obra no `assignedWorkFlowIds`.

**`/_api`:**
- 13 rotas novas, com 48 cenários, rodados contra o MSW: todos com o status e o `code` do back.
- Os de sucesso que gravam avisam no rótulo ("grava; a API não tem exclusão").
- O de exigências usa as mesmas exigências da versão vigente: confere a regra sem criar versão.

### Verificação

| # | Passo | Resultado |
|---|---|---|
| 1 | `typecheck`, `build`, `knip` | ✅ limpos |
| 2 | Mock | ✅ Listas, ficha, editar exigências (versão 2 criada e a obra passou a segui-la), tipos de documento, `/_api`, `/_estados` |
| 3 | API real: listas | ✅ "Material padrão" e "Serviço padrão" |
| 4 | API real: tipos de documento | ✅ ASO, CTPS, NF, RG, com validade, tamanho, formatos (nomes do `document-formats`) e reaproveitável |
| 5 | API real: lista de teste | ✅ Criada (versão 1), renomeada (continuou na versão 1), exigências editadas → **versão 2**, as duas versões na ficha |
| 6 | API real: tipo de teste | ✅ Criado (30 dias, 1 MB, PDF) e editado: o PATCH levou só `{"neverExpires":true,"acceptedFormatIds":[1,2]}` |
| 7 | API real: lista na obra | ✅ Lista de teste vinculada a Edifício Comercial Centro; a API respondeu 1 fornecedor (Theta, o de material da obra) e a ficha da obra mostra a lista na versão 2 |
| 8 | API real: erros na tela | ✅ Tipo com nome "ASO" → 409 no campo Nome; vincular a "Serviço padrão" à obra que já a usa → 409 no campo; lista inexistente → 404 no alerta; ficha de lista inexistente (`/exigencias/999999` e `/exigencias/abc`) → "Lista não encontrada" |
| 9 | 390 px | ✅ Sem rolagem horizontal nas 4 telas novas, na ficha da obra e nos drawers |

Detalhe do passo 8:
- Os 409 do vínculo e o 404 foram provocados injetando no select do modal um id que a tela não ofereceria.
- O back recusa antes de gravar, então esses testes não escreveram nada.

### O que ficou no banco real (não há rota de exclusão)

- **Tipo de documento:** "TESTE Claude (Partes B e C) - tipo de documento".
  - Id `127c3e92-779c-4087-afd0-296e87dfbfc0`.
  - Hoje está como "não vence", PDF e PNG, 1 MB.
- **Lista de exigências:** "TESTE Claude (Partes B e C) - lista renomeada".
  - `workFlowId` 3, tipo Material.
  - Versão 1 com 2 documentos (o tipo de teste e NF opcional) e versão 2 com 3 (+ RG).
- **Uso da lista na obra Edifício Comercial Centro**, na versão 2, com o vínculo da Theta Aço e Ferragens ao workflow (prazo 30 dias).
  - **Consequência:** essa obra não aceita outra lista de Material enquanto não houver rota de desvínculo.
- **Intactos:** "Material padrão" e "Serviço padrão" (versão 1, sem alteração) e os tipos ASO, CTPS, NF e RG. Os PATCH de teste nos tipos existentes foram erros ou corpo vazio, sem gravação.

### O que o back oferece nesta área e não foi implementado

- **Ícone e tipo MIME dos formatos (`icon`, `type`):** a tela mostra só o nome. O ícone é um nome de ícone do back (`file-pdf`) que não existe no design system.
- **Obras que usam uma lista:** não há rota. Daria para descobrir chamando `GET /constructions/{id}/workflows` obra a obra; não fiz por ser N chamadas para um dado que a API não oferece direto.
- **Ids das empresas vinculadas (`assignedEnterpriseIds`) e da versão (`workFlowVersionId`):** a tela usa só a contagem e o número da versão.

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

## Etapa de limpeza: só dados da API (16/11/2026)

Princípio: se o dado não vem de um endpoint que existe e funciona, não aparece. Sem valor inventado nem placeholder.

### Tela por tela

| Tela | Saiu | Ficou / entrou |
|---|---|---|
| **Menu** | Fila de análise (e o contador dela), Exigências, Relatórios | Visão geral, Obras, Fornecedores. Exigências e Tipos de documento voltaram nas Partes B e C |
| **Visão geral** | Aguardando análise, analisados hoje, aptos, vencendo em 30 dias, fila prioritária, vencimentos próximos, últimas análises, obras em execução, a data do "hoje" | Empresas (com serviço/material), ativas, bloqueadas, obras, empresas por obra |
| **Fornecedores** | Situação apto/com pendência, listas aplicáveis, "3 de 5" documentos, "Aguardando 1º acesso", reenviar, nota sobre documentos, filtro por situação documental | Razão social, CNPJ, tipos, nº de obras, bloqueado. Filtros: tipo e ativo/bloqueado; contadores total/ativos/bloqueados; busca por nome e CNPJ |
| **Ficha do fornecedor** | Abas Documentos, Exigências, Histórico, Contatos; "Reenviar acesso", "Cobrar pendências"; serviço contratado, período e data de vínculo; "fornecedor desde", telefone e e-mail no cabeçalho | Cabeçalho: nome, CNPJ, tipos, bloqueado. Abas **Dados** (nome, CNPJ, telefone, e-mail, tipos, criado e atualizado em) e **Obras** (só o nome) |
| **Cadastrar fornecedor** | Nome fantasia, contato, convite, exemplo pré-preenchido | Razão social, CNPJ, telefone, e-mail, tipos. A obra opcional voltou na Parte A |
| **Obras** | Código, cidade, UF, situação, listas, pendências | Nome e nº de fornecedores |
| **Ficha da obra** | Métricas, abas Exigências/Pendências/Histórico, drawers e modais antigos, código, cidade, "recebida em" | Nome e fornecedores vinculados; vínculo (Parte A) e listas (Partes B e C) |
| **Fila, Análise, Remessa, Relatórios** | Saíram das rotas e do menu; a URL cai em "não encontrado" | Arquivos mantidos, com comentário em `src/app/router.tsx` |

### Limpeza de código

**Apagado:**
- O gerador de demonstração (`gerar.ts`) e o sincronizador (`SincronizarDemonstracao.tsx`).
- Os dados fictícios de documentos, envios, análises, histórico, listas e exemplos (`src/mocks/*.ts`).
- Os componentes da visão geral e da ficha da obra que só serviam a eles.

**O MSW continua:**
- Os dados dele estão em `src/mocks/api/fixtures.ts` e `dados.ts`.
- Só o mock de rede os lê (modo `VITE_API_MOCK=true`).

**Fora das rotas, mas compilando:**
- O `datasetStore` e o `useDatasetQuery` continuam, vazios, para as telas que estão fora das rotas compilarem.

**Situação do fornecedor:**
- `SituacaoFornecedor` agora é `'ativo' | 'bloqueado'`.
- O cálculo apto/com pendência virou `SituacaoDocumental` e só as telas fora de uso o usam.

**Hooks de consulta:**
- Ficam em `entities/*/consultas.ts`.
- Assim as features de obra e fornecedor usam umas às outras sem import circular.

**knip:**
- O `npx knip` sai limpo.
- `knip.jsonc` declara como entrada as telas fora de uso.
- Também marca como API pública o design system e a camada da Fase 1. Esses têm exports sem uso de propósito: componentes e tipos do contrato.
- As fontes e o Tailwind são importados pelo CSS, que o knip não lê.

### Revisão contra a API real

Todas as telas foram abertas com `VITE_API_MOCK=false`, pelo proxy, e conferidas com `curl` na mesma API:
- 12 empresas: 10 ativas, 2 bloqueadas (Epsilon e Iota), 9 de serviço e 7 de material.
- 4 obras, com 3/2/3/3 fornecedores.
- Ficha da Theta: obras Edifício Comercial Centro e Torre Empresarial Atlântico.

Todo número e texto de dado na tela tem origem numa resposta da API.

**Busca por dado inventado no projeto:**
- Fora de `src/mocks/api/` (fixture do MSW) não sobrou nada.
- Ficaram os textos de exemplo da página `/_componentes`, que é a vitrine do design system e não lê dados.

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

## Histórico: verificação da Fase 2 (antes da limpeza)

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
- Limpeza (16/11/2026): só dados da API; gerador de demonstração removido.
- Parte A (16/11/2026): vínculo fornecedor ↔ obra.
- Partes B e C (16/11/2026): tipos de documento, formatos, listas de exigências com versões, lista na obra.
- Fase 3 (próxima): acervo, visualização, download em lote, painel de pendências e postergação.
