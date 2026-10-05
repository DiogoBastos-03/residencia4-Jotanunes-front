# API interna — leitura do backend

> Levantamento feito **só por leitura** do código do backend. Nenhum arquivo dele foi alterado.
> Não existem pastas `back/` e `front/` neste diretório. Considerei:
> - **back** = `../residenciaIV-api-interna-dev`
> - **front** = este projeto, `Jnunes-front`
>
> Os caminhos de arquivo abaixo são relativos a `residenciaIV-api-interna-dev/`.

---

## 1. Stack

| Item | O que é | De onde tirei |
|---|---|---|
| Linguagem / runtime | C# em **.NET 10** (`net10.0`) | `src/api/Api.csproj`, `src/modules/*/*.csproj` |
| Framework | ASP.NET Core Web API com **controllers** (`[ApiController]`) | `src/api/Program.cs` |
| ORM | **EF Core 10** (`Microsoft.EntityFrameworkCore.SqlServer` 10.0.12), um `DbContext` por módulo | `src/modules/*/infrastructure/database/*DbContext.cs` |
| Banco | **SQL Server 2022** | `docker-compose.yaml` |
| Documentação | Swashbuckle 10.2.3 (`/swagger`) + `Microsoft.AspNetCore.OpenApi` (`/openapi/v1.json`), **só em Development** | `Program.cs` |
| JSON | `System.Text.Json` padrão (**camelCase**), enums como **string** (`JsonStringEnumConverter`, inteiros recusados) | `Program.cs` |
| Erros | `ProblemDetails` via `GlobalExceptionHandler` | `src/infrastructure/http/` |
| Arquitetura | Monólito modular: `src/modules/enterprise`, `src/modules/construction`, `src/shared`, `src/infrastructure` | solução `ResidenciaIVApiInterna.slnx` |
| Testes | xUnit, só de casos de uso/domínio (sem testes HTTP) | `tests/Enterprise.Tests`, `tests/Construction.Tests` |

Existe também um `domain.cml` (Context Mapper) descrevendo o domínio inteiro planejado — empresas, listas (“workflows”), envios, documentos, autenticação. **A maior parte do que está nele não existe em código** (ver seção 8).

---

## 2. Como rodar, do zero

### Opção A — tudo no Docker (mais simples)

Pré-requisito: Docker com Compose.

```bash
cd residenciaIV-api-interna-dev
docker compose up --build
```

O que acontece:
1. Sobe `sqlserver` (porta **1433**). Na **primeira** vez que o volume é criado, o entrypoint customizado (`docker/sqlserver/entrypoint.sh`) roda `docker/sqlserver/init/schema.sql` e depois `seed.sql`, e grava um marcador `/var/opt/mssql/data/.schema_applied` para não rodar de novo.
2. Quando o banco fica saudável (healthcheck), sobe `api`: imagem `mcr.microsoft.com/dotnet/sdk:10.0`, código montado como volume, `dotnet watch run --project src/api/Api.csproj --no-launch-profile` (recarrega ao editar).

**A API fica em `http://localhost:5057`** (container escuta em 8080, mapeado para 5057).
Swagger: `http://localhost:5057/swagger`.

> O `docker/api/Dockerfile` tem `EXPOSE 5001`, mas isso não é usado: a porta real no container é a 8080 (padrão do .NET 8+), e o compose mapeia `5057:8080`.

### Opção B — banco no Docker, API local

Pré-requisito: **.NET 10 SDK** instalado.

```bash
cd residenciaIV-api-interna-dev
docker compose up -d sqlserver
dotnet restore ResidenciaIVApiInterna.slnx
dotnet run --project src/api/Api.csproj --launch-profile http
```

**A API fica em `http://localhost:5192`** (perfil `http` de `src/api/Properties/launchSettings.json`).
Com `--launch-profile https`: `https://localhost:7004` e `http://localhost:5192` — nesse caso o `UseHttpsRedirection` redireciona chamadas http para https.

### Migrations

**Não há migrations do EF.** O schema é criado só pelo `schema.sql` do container. Para recriar o banco do zero (schema + seed de novo):

```bash
docker compose down -v
docker compose up --build
```

### Testes

```bash
dotnet test ResidenciaIVApiInterna.slnx
```

> `src/api/Api.http` é o arquivo de template do .NET (`GET /weatherforecast`) — essa rota não existe.

---

## 3. Banco

- **SQL Server 2022 Developer** (`mcr.microsoft.com/mssql/server:2022-latest`), container `residenciaiv-sqlserver`, banco `ResidenciaIV`, usuário `sa`.
- Sobe pelo Docker (seção 2). Rodar local sem Docker funciona desde que você execute `schema.sql` e `seed.sql` à mão e ajuste a connection string.
- `src/infrastructure/database/postgress/schema.txt` é um rascunho antigo em DBML com tipos de Postgres. **Não é usado.**

### Seed (`docker/sqlserver/init/seed.sql`)

| Tabela | Conteúdo |
|---|---|
| `tb_enterprise_type` | 1 = Material, 2 = Servico (vem do `schema.sql`) |
| `tb_enterprise` | **10 empresas** (Alfa … Kappa), ids `a1000000-0000-0000-0000-0000000000NN`; Epsilon (05) e Iota (09) inativas |
| `tb_enterprise_type_enterprise` | tipos de cada empresa (algumas têm os dois) |
| `tb_construction` | **4 obras** (Residencial Jardim das Flores, Edifício Comercial Centro, Condomínio Parque das Águas, Torre Empresarial Atlântico), ids `a2000000-…` |
| `tb_construction_enterprise` | **11 vínculos** empresa ↔ obra |

**Sem seed:** listas (workflows), tipos de documento, formatos, envios, versões, status de envio, metas de score, pessoas/funcionários, usuários de empresa. As tabelas de status (`tb_workflow_submission_status`, `tb_document_submission_status`, `tb_score_status`) e de formato (`tb_document_format`) existem vazias.

---

## 4. Variáveis de ambiente

| Variável | Para quê | Valor padrão |
|---|---|---|
| `MSSQL_SA_PASSWORD` | senha do `sa` no container e na connection string do compose | `YourStrong!Passw0rd` (fallback no `docker-compose.yaml`) |
| `ConnectionStrings__Default` | connection string usada pelos dois módulos | No compose: `Server=sqlserver,1433;Database=ResidenciaIV;User Id=sa;Password=${MSSQL_SA_PASSWORD};TrustServerCertificate=True;`. Local: vem de `appsettings.Development.json` (`Server=localhost,1433;…`). **Em `appsettings.json` (Production) não há padrão** — sem a variável a API sobe mas falha na primeira consulta. |
| `ASPNETCORE_ENVIRONMENT` | liga Swagger/OpenAPI e escolhe `appsettings.Development.json` | `Development` no Dockerfile e no `launchSettings.json`. Fora disso, `Production` (sem Swagger). |
| `ASPNETCORE_URLS` / `ASPNETCORE_HTTP_PORTS` | porta | Não definidas; no container vale o padrão 8080, local vale o `launchSettings.json`. |

`ACCEPT_EULA=Y` e `MSSQL_PID=Developer` estão fixos no compose.

---

## 5. CORS

**Não está configurado.** `Program.cs` não chama `AddCors` nem `UseCors`. Logo, o front no Vite (`http://localhost:5173`) chamando `http://localhost:5057` ou `:5192` é **bloqueado pelo navegador** (sem `Access-Control-Allow-Origin`; preflight de `POST`/`PATCH`/`PUT` com JSON também falha).

O que precisaria mudar no back (descrição, **não alterei**):
1. Em `Program.cs`, registrar uma política, por exemplo `builder.Services.AddCors(o => o.AddPolicy("front", p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()))` — com a origem vinda de configuração para outros ambientes.
2. Chamar `app.UseCors("front")` **antes** de `app.MapControllers()` (e antes do `UseHttpsRedirection`, para o preflight não ser redirecionado).
3. Expor `Location` em `WithExposedHeaders("Location")` se o front quiser ler o header do `201`.

Alternativa sem tocar no back: proxy do Vite (`server.proxy` de `/api` para `http://localhost:5057`) — a chamada passa a ser same-origin.

---

## 6. Autenticação

**Não existe.** Nenhum `AddAuthentication`/`AddAuthorization`/`[Authorize]`; **todas as rotas são públicas**. Não há como obter token.

O que existe só como intenção: tabela `tb_enterprise_user` (`password_hash`, `password_provisol`, `last_log`) e o bounded context `Auth` no `domain.cml` (login do **fornecedor** no portal). Nada disso tem código. Também **não há modelo de usuário interno** (analista da JotaNunes) — nem tabela.

---

## 7. Endpoints

Todos sob `api/v1/internal`. Corpo e resposta em JSON camelCase; enums como string. Formatos tirados dos DTOs/records em `src/modules/*/application/dto` e `presentation/dto`.

**Paginação** (`src/shared/application/PagedResult.cs`, `PageRequest.cs`): resposta `{ items: T[], totalCount: number, page: number, pageSize: number }`. `page ≥ 1`, `1 ≤ pageSize ≤ 50`; fora disso **422** com `code` `INVALID_PAGE` / `INVALID_PAGE_SIZE`.

**Erros**: `ProblemDetails` `{ type, title, status, code, traceId }` — `code` é extensão do `GlobalExceptionHandler` (`AppException` → status próprio; `DomainException` → **422**; qualquer outra → **500** `INTERNAL_ERROR`). Erros de validação de modelo (`[Required]`, `[EmailAddress]`, enum inválido, JSON inválido) → **400** `ValidationProblemDetails` `{ type, title, status, errors: { campo: string[] }, traceId }`, sem `code`.

**Datas**: `DateTime` sem fuso. Ao ler do banco (coluna `datetime`) saem como `"2026-01-05T09:00:00"`, **sem `Z`**, embora sejam gravadas em UTC.

| Método | Caminho | Rota / query | Corpo | Resposta |
|---|---|---|---|---|
| `POST` | `/api/v1/internal/enterprises` | — | `{ enterpriseName: string (2–255), cnpj: string (14–18 chars, aceita máscara), phone: string, email: string, enterpriseTypes: ("Material"\|"Servico")[] (≥1) }` | **201** `{ enterpriseId: guid }` + header `Location` → GET por id. **409** `CNPJ_ALREADY_REGISTERED`. **422** `INVALID_CNPJ`, `INVALID_PHONE`, `INVALID_EMAIL`, `INVALID_ENTERPRISE_TYPE` e regras de nome. **500** se nome, telefone ou e-mail já existirem (só o CNPJ é checado antes; os outros únicos estouram no banco). |
| `GET` | `/api/v1/internal/enterprises` | query `type` (`Material`\|`Servico`), `active` (bool), `constructionIds` (guid, repetido: `?constructionIds=a&constructionIds=b`), `page` (1), `pageSize` (20) | — | **200** `PagedResult<{ enterpriseId: guid, enterpriseName: string, cnpj: string (14 dígitos), types: ("Material"\|"Servico")[], active: boolean }>`, ordenado por `enterpriseName`. Sem busca por texto. |
| `GET` | `/api/v1/internal/enterprises/{enterpriseId:guid}` | rota `enterpriseId` | — | **200** `{ enterpriseId, enterpriseName, cnpj, phone (só dígitos), email (minúsculo), types: string[], active: boolean, createdAt, updatedAt }`. **404** `ENTERPRISE_NOT_FOUND`. |
| `PATCH` | `/api/v1/internal/enterprises/{enterpriseId:guid}` | rota `enterpriseId` | `{ enterpriseName?: string (2–255), phone?: string, email?: string }` — campo ausente/null não muda | **204** sem corpo. **404**, **422** (validação de domínio), **500** em duplicidade de nome/telefone/e-mail. |
| `PUT` | `/api/v1/internal/enterprises/{enterpriseId:guid}/types` | rota `enterpriseId` | `{ enterpriseTypes: ("Material"\|"Servico")[] (≥1) }` — substitui a lista | **204**. **404**, **422** `INVALID_ENTERPRISE_TYPE`. |
| `PATCH` | `/api/v1/internal/enterprises/{enterpriseId:guid}/status` | rota `enterpriseId` | `{ active: boolean }` (obrigatório; ausente → 400) | **204**. **404**. |
| `GET` | `/api/v1/internal/constructions` | query `enterpriseId` (guid, opcional), `page` (1), `pageSize` (20) | — | **200** `PagedResult<{ constructionId: guid, constructionName: string }>`, ordenado por nome. |

Só isso. **Não existe** endpoint de: detalhe de obra, cadastro/edição de obra, vínculo empresa↔obra, listas de exigências, tipos de documento, envios, arquivos, análise/decisão, histórico, relatórios, convite/portal, login.

Todos os formatos acima vieram do código. Não houve item marcado como “não deu para determinar”; a única inferência é a presença de `type`/`traceId` no `ProblemDetails`, que vem do `AddProblemDetails()` padrão do ASP.NET, não de código do projeto.

---

## 8. Pronto de verdade × esqueleto

**Pronto (código + testes de caso de uso):**
- Empresa: cadastrar, listar com filtros e paginação, detalhar, editar dados, trocar tipos, ativar/desativar. Validação real de CNPJ (dígitos verificadores), telefone e e-mail.
- Obra: listar (paginado, filtro por empresa) e usar o vínculo obra↔empresa como filtro na listagem de empresas.

**Pendências declaradas no próprio código:**
- `TODO RF17`: ao cadastrar empresa, gerar as exigências de documento a partir dos tipos — não feito.
- `TODO KAN-22`: ao desativar empresa, desativar a credencial do portal — não feito.

**Só no banco (`schema.sql`), sem nenhuma linha de C#:** listas (`tb_workflow*`), versões de lista, vínculos de lista com obra e com empresa, tipos de documento (`tb_document_definition*`), formatos, metas de score, envios e versões (`tb_*_submission*`), análise por IA, pessoa/funcionário/contratação, usuário de empresa.

**Só no `domain.cml`, nem tabela:** papel de usuário interno, autenticação.

**Lacunas visíveis:** sem CORS, sem auth, `Api.http` desatualizado, duplicidades que viram 500, datas sem fuso.

---

## Divergências: modelo do back × `src/entities`

Convenção: **back** = tabela/DTO; **front** = tipo em `src/entities`. “Só existe no front” quer dizer que o back não tem nem tabela.

### Gerais

1. **Idioma dos nomes**: back em inglês (`enterprise`, `construction`, `workflow`, `document_definition`, `submission`); front em português (`Fornecedor`, `Obra`, `ListaExigencias`, `TipoDocumento`, `DocumentoEmpresa`). Toda resposta precisa de mapeamento.
2. **IDs**: back usa `guid` (empresa, obra, versão de lista, envio) e `int` (lista, tipo de documento, pessoa, status); front usa `string` com slugs legíveis. `string` acomoda os dois, mas mocks e rotas que dependem dos slugs mudam.
3. **Enums**: back em PascalCase sem acento (`"Material"`, `"Servico"`) ou em lookup tables sem seed; front em camelCase minúsculo (`'material'`, `'servico'`, `'emAnalise'`).
4. **Datas**: back devolve `DateTime` sem fuso (`"2026-01-05T09:00:00"`); front assume `IsoDate` e em alguns lugares só data (`YYYY-MM-DD`).
5. **Quem decidiu**: back não tem usuário interno. Tudo que no front mostra analista (`decisao.por`, `Analise.analista`, autor `pessoa` em eventos) não tem fonte.

### Fornecedor (`Fornecedor`) × `tb_enterprise` / `EnterpriseDetailOutput`

| Front | Back | Divergência |
|---|---|---|
| `id: string` | `enterpriseId: guid` | nome e tipo |
| `razaoSocial` | `enterpriseName` | nome |
| `nomeFantasia?` | — | só existe no front |
| `cnpj` (só dígitos) | `cnpj` (só dígitos na resposta) | igual |
| `tipo: 'servico' \| 'material'` (**um**) | `types: ("Material"\|"Servico")[]` (**um ou mais**) | **cardinalidade diferente**: no back uma empresa pode ser de material e serviço ao mesmo tempo. Afeta filtros, ficha, cadastro, e qual lista de exigências se aplica. |
| `email` | `email` | igual (back normaliza para minúsculo, único no banco) |
| — | `phone` (obrigatório, único, 10–11 dígitos) | só existe no back, no nível da empresa |
| `contatos: Contato[]` (`papel principal/seguranca`, `nome`, `cargo`, `email`, `telefone`) | — | só existe no front; back não tem contato de pessoa |
| `desde` | `createdAt` | nome; o front trata como “fornecedor desde”, o back é data de criação do registro |
| — | `updatedAt` | só no back |
| `bloqueado: boolean` | `active: boolean` | **semântica invertida**: `bloqueado = !active` |
| `acessoPortal { convidadoEm, emailConvite, acessouEm? }` | `tb_enterprise_user` (`password_provisol`, `last_log`) — sem endpoint | front tem convite; back tem senha provisória e último login, sem convite nem e-mail de convite, e nada exposto |
| `SituacaoFornecedor` derivada (`apto`/`comPendencia`/`bloqueado`) | — | front deriva dos documentos; back não tem documentos implementados, então não há como derivar |
| busca por texto (nome/CNPJ) na tela | listagem sem busca textual | falta parâmetro no back |
| contagem por obra, pendências, etc. na lista | `EnterpriseListItem` só tem `id`, nome, cnpj, tipos, `active` | front precisa de agregados que o back não devolve |

### Obra (`Obra`) × `tb_construction` / `ConstructionListItem`

| Front | Back | Divergência |
|---|---|---|
| `id` | `constructionId: guid` | nome e tipo |
| `nome` | `constructionName` | nome |
| `codigo` | — | só no front |
| `cidade`, `uf` | — | só no front |
| `situacao: 'emExecucao' \| 'planejamento' \| 'concluida'` | — | só no front |
| `recebidaEm` | — | só no front (back não tem nem `created_at` na obra) |
| ficha da obra (detalhe) | — | back não tem GET por id de obra |

### Vínculo fornecedor ↔ obra (`VinculoObra`) × `tb_construction_enterprise`

| Front | Back | Divergência |
|---|---|---|
| `fornecedorId`, `obraId` | `enterprise_id`, `construction_id` (+ `construction_enterprise_id` guid) | nomes; back tem id próprio do vínculo |
| `vinculadoEm` | `created_at` | nome |
| `servicoContratado`, `inicio`, `fim` | — | só no front |
| criar/remover vínculo | — | sem endpoint; o vínculo só é lido, como filtro |

### Lista de exigências (`ListaExigencias`) × `tb_workflow` + `tb_workflow_version`

| Front | Back | Divergência |
|---|---|---|
| lista única, editável | `workflow` (int) + `workflow_version` (guid, número decimal) com índice único `(workflow_id, version)` | **back é versionado**; front não tem versão. Editar no front = criar versão no back. |
| `nome` | `workflow_name` | nome |
| `tipo: TipoFornecimento` (um) | `tb_workflow_enterprise_type` (N:N com tipos) | lista no back vale para **vários** tipos |
| — | `workflow_type_owner_id` (no `domain.cml`: `EMPRESA` / `EMPREGADO`) | **back define empresa/funcionário na lista inteira**; front define por item (`ItemExigido.escopo`). Uma lista nossa com itens dos dois escopos vira duas listas lá. |
| `descricao` | — | só no front |
| `situacao: 'ativo' \| 'rascunho'` | — | só no front |
| `prazoEnvioDias` | `tb_enterprise_workflow_version.limit_expires_days` | back guarda **por empresa**, não na lista |
| `lembretesDias[]` | — | só no front |
| vínculo lista ↔ obra (`ObraLista { obraId, listaId, vinculadaEm }`) | `tb_construction_workflow_version` (obra ↔ **versão** da lista) | back liga à versão, não à lista; sem data de vínculo |
| — | `tb_enterprise_workflow_version` (empresa ↔ versão, com `start_dt`, `end_dt`, `limit_expires_days`) | **só no back**: atribuição explícita de lista a empresa. No front a aplicabilidade é **derivada** (obra da empresa + tipo da lista, em `entities/lib/aplicabilidade.ts`). |

### Item exigido (`ItemExigido`) × `tb_workflow_version_document` + `tb_document_definition`

| Front | Back | Divergência |
|---|---|---|
| `id` | `workflow_version_document_id` | nome/tipo |
| `tipoDocumentoId` | `document_definition_id` | nome |
| `obrigatoriedade: 'obrigatorio' \| 'opcional'` | `required: bit` | enum × boolean |
| — | `display_order` | só no back (front usa a ordem do array) |
| `escopo: 'empresa' \| 'funcionario'` | (no nível da lista, ver acima) | lugar diferente |
| `validade: 'comData' \| 'semValidade'` | `document_definition.expires_in_days` (null = não vence) | **no back a validade é do tipo de documento, em dias fixos**; no front é do item e a data vem do fornecedor/analista |
| `avisoDias?` | — | só no front |
| `formatos: 'pdfImagem' \| 'pdf'` | `tb_document_definition_acepted_format` → `tb_document_format` (PDF/PNG/JPEG/DOCX pelo `domain.cml`; tabela vazia) | **N:N com formatos soltos** × dois presets; back aceita DOCX |
| `instrucoes?` | — (há `document_definition.description`, que é do tipo, não do item) | lugar diferente |
| — | `max_size_bytes`, `can_reuse` (no tipo de documento) | só no back |
| — | `tb_document_definition_exemple` (arquivo de exemplo com `embedding`) e `tb_score_goals` (faixa de score) | só no back (análise por IA) |

### Tipo de documento (`TipoDocumento`) × `tb_document_definition`

| Front | Back | Divergência |
|---|---|---|
| `{ id, nome }` | `{ document_definition_id: int, name (único), description, max_size_bytes, can_reuse, expires_in_days }` | back é bem mais rico; regras de validade e formato ficam aqui, não no item |

### Documento da empresa (`DocumentoEmpresa`) × `tb_workflow_submission` + `tb_document_submission` + `tb_document_submission_version`

| Front | Back | Divergência |
|---|---|---|
| documento solto por `(fornecedorId, tipoDocumentoId)` | `document_submission` dentro de um `workflow_submission` (empresa + **versão de lista** + funcionário opcional) | **back agrupa por envio da lista**; front não tem esse agrupador. O mesmo tipo de documento pode aparecer em duas listas e, no back, serão duas submissões (a menos que `can_reuse`). |
| `status: 'aprovado' \| 'emAnalise' \| 'reprovado' \| 'pendente'` | status por **versão** (`tb_document_submission_status`, vazia). Pelo `domain.cml`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `REVISION_REQUIRED` | valores diferentes. `PENDING` do back ≈ nosso `emAnalise` (enviado, aguardando)? Nosso `pendente` (nada enviado) é **ausência de envio** no back. `CANCELLED` e `REVISION_REQUIRED` não existem no front. |
| — | status do envio da lista inteira (`workflow_submission.status_id`, mesmo enum) | só no back |
| `'venceEmBreve' \| 'vencido'` (derivados) | `document_submission.expires_at` | dá para derivar no front a partir de `expires_at`; nome diferente de `validade` |
| `validade?` / `validadeInformada?` | `expires_at` (um só) | back tem uma data; front separa a informada pelo fornecedor da confirmada pelo analista |
| `arquivo`, `tamanhoKb`, `paginas?` | `version.path`, `version.hash`, `version.metadata` (JSON livre) | back guarda caminho + hash; nome, tamanho e páginas só se vierem no `metadata` (formato **não definido**) |
| `enviadoEm` | `document_submission.last_send_at` / `version.created_at` | nome |
| `pendenteDesde?` | `document_submission.created_at`? | não há equivalente direto |
| `prioridade?: 'urgente' \| 'normal'` | — | só no front |
| `renovacao?` (versão nova aguardando, convivendo com a vigente) | várias `document_submission_version` com `is_current` | **modelo diferente**: back tem N versões e marca a corrente; front tem “vigente + renovação + enviosAnteriores” |
| `enviosAnteriores[] { arquivo, enviadoEm, resultado }` | versões não correntes | dá para montar a partir das versões, se cada uma tiver status |
| `decisao? { por, em, motivo?, observacao? }` | — | **só no front**: back não guarda quem decidiu, quando, motivo nem observação humana |
| `MotivoReprovacao` (`ilegivel`, `foraValidade`, `incorreto`, `faltaAssinatura`) | — | só no front |
| — | `tb_document_submission_ia` (`tokens_used`, `observation`, `score`) | só no back: análise automática por IA |

### Documento de funcionário (`EnvioArquivos`, `ArquivoFuncionario`) × `tb_person` / `tb_employee` / `tb_hiring` + submission

| Front | Back | Divergência |
|---|---|---|
| sem cadastro de pessoa; arquivos identificados pelo **nome do arquivo** | `tb_person` (`name`, `cpf` único, `phone`), `tb_employee`, `tb_hiring` (empresa, `finish_at`) | **divergência de modelo**: o back tem cadastro de funcionário com CPF e contratação — exatamente o que removemos do front na última correção. |
| um documento de funcionário = vários arquivos, cada um decidido | `workflow_submission.employee_id` → **uma submissão por funcionário** | back trata documento de funcionário como submissão por pessoa; front, como envio com N arquivos sem dono |
| `EnvioArquivos { fornecedorId, tipoDocumentoId, enviadoEm, prioridade }` | — | não há “lote de arquivos” no back |
| `ArquivoFuncionario.status` (aprovado/emAnalise/reprovado) por arquivo | status por versão de `document_submission` | granularidade diferente |

### Análise, histórico e relatórios

| Front | Back | Divergência |
|---|---|---|
| `Analise { quando, analista, documento, resultado, motivo?, observacao? }` | — (só a análise de IA) | só no front |
| `EventoHistorico` (9 tipos de ação, autor pessoa/fornecedor/sistema/integração) | — | só no front; nenhum log de eventos no back |
| `TempoAnalise { periodo, listaId, diasMedios, acimaDaMeta }` | — | só no front; sem relatórios |
| fila de análise (derivada em `entities/lib/fila.ts`) | — | sem endpoint de fila |

### Tamanho da integração, em resumo

- **Encaixa com mapeamento simples:** listagem/detalhe/cadastro/edição/ativação de fornecedor (mudando `tipo` → lista de tipos, `bloqueado` → `!active`, contatos e nome fantasia ficam sem fonte) e listagem de obras (só nome).
- **Precisa de decisão de modelo antes de qualquer código:**
  1. Fornecedor com **mais de um tipo**.
  2. Escopo empresa/funcionário **por lista** (back) × **por item** (front).
  3. Listas **versionadas** e atribuídas **explicitamente** a empresas (back) × aplicabilidade **derivada** de obra + tipo (front).
  4. Validade e formatos no **tipo de documento** (back) × no **item** (front).
  5. **Funcionário com CPF** (back) × arquivos sem dono (front).
  6. Status `PENDING/APPROVED/REJECTED/CANCELLED/REVISION_REQUIRED` × `pendente/emAnalise/aprovado/reprovado`.
  7. Decisão humana (quem, quando, motivo) e prioridade **não existem** no back.
- **Não existe no back nem como tabela:** campos de obra além do nome, dados do vínculo (serviço/período), contatos, convite do portal, situação/descrição/lembretes da lista, motivo de reprovação, histórico, relatórios, usuário interno.
- **Existe em tabela mas sem nenhum endpoint:** listas, tipos de documento, envios, versões, funcionários. Ou seja: das 13 telas do front, só **Fornecedores**, **Cadastrar fornecedor**, parte da **Ficha do fornecedor** e a lista de **Obras** têm API hoje. Fila, Análise, Remessa, Ficha da obra, Exigências e Relatórios não têm.
