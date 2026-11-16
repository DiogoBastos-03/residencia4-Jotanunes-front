# Mock de rede (MSW) da API interna

Os handlers de `handlers.ts` implementam **todas** as rotas de `contrato-api-interna.md` (inclusive `/health`), com os formatos documentados. Liga no boot quando `VITE_API_MOCK=true` (`src/main.tsx` → `browser.ts`).

## De onde vêm os dados

`dados.ts` monta um "banco" em memória a partir do **conjunto fictício** (`src/mocks/ficticio.ts`), no formato da API. Desde a Fase 2, as telas leem fornecedores e obras daqui, pela rede, como leriam da API real:

| Entidade | Origem | IDs |
|---|---|---|
| Empresas | os 41 fornecedores | `e0000000-0000-4000-8000-0000000000NN` |
| Obras | as 10 obras | `c0000000-…` |
| Vínculo empresa ↔ obra | os vínculos | — |
| Tipos de documento | os tipos das listas de exigências | `d0000000-…` |
| Envios (acervo) | documentos da empresa enviados + cada arquivo de funcionário | `50000000-…` |

- Status: `aprovado` → `Approved`, `emAnalise` → `Pending`, `reprovado` → `Rejected`. Documento nunca enviado não aparece no acervo.
- Funcionário: o nome sai do nome do arquivo (`aso-jose-souza.pdf` → "Jose Souza"); o CPF é mascarado e estável.
- **"Hoje" do mock é 16/09/2026**, o mesmo da demonstração. Vale para o painel de pendências e para a postergação.
- Mutações (cadastro, edição, tipos, status, postergação) ficam na memória do handler e somem no F5. Cadastro, edição e bloqueio feitos nas telas passam por aqui e aparecem nas telas (as queries são invalidadas e buscam de novo).

## Erros forçados

Alguns códigos não são alcançáveis por nenhuma entrada JSON (o 400 do ASP.NET pega antes) ou exigem uma falha do servidor. Para esses, o cliente manda o cabeçalho **`X-Mock-Code: <CODE>`**, que só existe no mock: o handler responde aquele code, com o status e o formato do contrato. A `/_api` usa isso nos botões marcados "erro forçado". `definirCenarioMock()` (em `src/shared/api/client.ts`) liga o cabeçalho; ele nunca é enviado com `VITE_API_MOCK=false`.

## O que dispara cada erro

### Gerais

| Entrada | Resposta |
|---|---|
| GUID inválido na URL (ex.: `/enterprises/abc`) | 404 **sem corpo** |
| JSON malformado no corpo | 400, `errors.$` |
| `page` não numérico | 400, `errors.page` |
| `page` < 1 | 422 `INVALID_PAGE` |
| `pageSize` < 1 ou > 50 | 422 `INVALID_PAGE_SIZE` |
| Cabeçalho `X-Mock-Code: INTERNAL_ERROR` | 500 `INTERNAL_ERROR` |

### Empresas

| Rota | Entrada | Resposta |
|---|---|---|
| POST `/enterprises` | `enterpriseName` ausente ou fora de 2–255; `cnpj` fora de 14–18 caracteres; `phone` ausente ou vazio; `email` sem `@`; `enterpriseTypes` ausente ou vazio | 400 com `errors` por campo |
| POST `/enterprises` | tipo desconhecido (`["Outro"]`) | 400, `errors["$.enterpriseTypes[0]"]` |
| POST `/enterprises` | nome só com espaços (`"     "`) | 422 `INVALID_ENTERPRISE_NAME` |
| POST `/enterprises` | CNPJ com dígito verificador errado (`11.222.333/0001-80`) | 422 `INVALID_CNPJ` |
| POST `/enterprises` | telefone fora das regras (`0000000000`, celular sem 9) | 422 `INVALID_PHONE` |
| POST `/enterprises` | e-mail sem domínio com ponto (`a@semponto`) | 422 `INVALID_EMAIL` |
| POST `/enterprises` | CNPJ válido já cadastrado (cadastre duas vezes o mesmo) | 409 `CNPJ_ALREADY_REGISTERED` |
| POST `/enterprises`, PUT `/types` | `X-Mock-Code: ENTERPRISE_TYPE_REQUIRED` | 422 `ENTERPRISE_TYPE_REQUIRED` |
| POST `/enterprises`, PUT `/types` | `X-Mock-Code: INVALID_ENTERPRISE_TYPE` | 422 `INVALID_ENTERPRISE_TYPE` |
| GET `/enterprises` | `active=talvez`, `type=Outro`, `constructionIds=abc` | 400 |
| GET/PATCH `/enterprises/{id}`, PUT `/types`, PATCH `/status`, GET `/archive` | GUID que não existe (`ffffffff-ffff-4fff-bfff-ffffffffffff`) | 404 `ENTERPRISE_NOT_FOUND` |
| PATCH `/enterprises/{id}` | `email: "x"`, `enterpriseName: "a"` | 400 |
| PATCH `/enterprises/{id}` | `phone: "12345"` / `email: "a@b"` / nome só espaços | 422 `INVALID_PHONE` / `INVALID_EMAIL` / `INVALID_ENTERPRISE_NAME` |
| PUT `/types` | `enterpriseTypes: []` ou tipo desconhecido | 400 |
| PATCH `/status` | `{}` ou `active` não booleano | 400 |

> Atenção: os CNPJs dos 10 primeiros fornecedores (os do protótipo, ex.: `12345678000190`) **não têm dígito verificador válido**. Reenviar um deles dá 422 `INVALID_CNPJ`, não 409.

### Obras

| Entrada | Resposta |
|---|---|
| `enterpriseId=abc` | 400 |

### Vínculo empresa ↔ obra

Mesma ordem do back: 400 → `CONSTRUCTION_NOT_FOUND` → `ENTERPRISE_ALREADY_IN_CONSTRUCTION` → `ENTERPRISE_NOT_FOUND` → `ENTERPRISE_INACTIVE`. O mock não tem workflows: devolve `assignedWorkFlowIds: []` e todos os tipos da empresa em `typesWithoutWorkflow`.

| Rota | Entrada | Resposta |
|---|---|---|
| POST `/construction/constructions/{id}/enterprises` | `{}`; `limitExpiresDays` fora de 1–9999 | 400 (`EnterpriseId`, `LimitExpiresDays`) |
| POST | obra que não existe | 404 `CONSTRUCTION_NOT_FOUND` |
| POST | empresa já na obra | 409 `ENTERPRISE_ALREADY_IN_CONSTRUCTION` |
| POST | empresa que não existe | 404 `ENTERPRISE_NOT_FOUND` |
| POST | empresa bloqueada | 422 `ENTERPRISE_INACTIVE` |
| POST | `X-Mock-Code: INVALID_LIMIT_EXPIRES_DAYS` | 422 (o 400 vem antes em qualquer entrada JSON) |
| DELETE `/construction/constructions/{id}/enterprises/{empresa}` | vínculo que não existe (inclusive obra inexistente) | 404 `ENTERPRISE_NOT_IN_CONSTRUCTION` |

### Acervo

| Rota | Entrada | Resposta |
|---|---|---|
| GET `/archive` | `status=Aprovado`, `scope=Outro`, `documentDefinitionId=abc` | 400 |
| GET `/view-url` | envio que não existe ou é de outra empresa | 404 `DOCUMENT_NOT_FOUND` |
| GET `/view-url` | envio com último envio antes de 01/06/2024 (arquivo expurgado) | 410 `DOCUMENT_PURGED` |
| POST `/batch-download` | `documentSubmissionIds` ausente ou com GUID inválido | 400 |
| POST `/batch-download` | lista vazia | 422 `EMPTY_BATCH` |
| POST `/batch-download` | mais de 50 IDs distintos | 422 `BATCH_TOO_LARGE` |
| POST `/batch-download` | algum ID inexistente ou de outra empresa | 404 `DOCUMENT_NOT_FOUND` |
| POST `/batch-download` | algum ID expurgado | 200; o arquivo fica de fora e o `.zip` traz `manifesto.txt` |

O link de visualização aponta para `https://storage.mock.local/...` e expira em 5 minutos.

### Painel de pendências

O painel conta só as exigências **obrigatórias de documento da empresa** de cada fornecedor:
- pendente = nunca enviada, ou com o último envio não aprovado;
- a vencer = aprovada, vencendo em até 30 dias;
- vencida = aprovada já vencida;
- postergada = tem postergação ativa no mock.

Empresa sem nada nessas situações não aparece.

| Rota | Entrada | Resposta |
|---|---|---|
| POST `/postpone` | `deadlineAt` ausente ou fora de `YYYY-MM-DD`; `reason` > 500 caracteres | 400 |
| POST `/postpone` | envio que não existe, ou de funcionário | 404 `REQUIREMENT_NOT_FOUND` |
| POST `/postpone` | `deadlineAt` ≤ 16/09/2026 | 422 `POSTPONEMENT_DEADLINE_IN_PAST` |
| POST `/postpone` | envio já postergado | 422 `REQUIREMENT_ALREADY_POSTPONED` |
| POST `/postpone` | envio aprovado e não vencido | 422 `REQUIREMENT_NOT_POSTPONABLE` |
| POST `/cancel-postponement` | envio que não existe | 404 `REQUIREMENT_NOT_FOUND` |
| POST `/cancel-postponement` | envio sem postergação ativa | 422 `REQUIREMENT_NOT_POSTPONED` |

A ordem das verificações na postergação é: 404 → prazo no passado → já postergada → não postergável. O contrato não define essa ordem.

## Navegador sem service worker

Se o service worker não registrar (ex.: navegador embutido do Claude), o boot entra no plano B: `browser.ts` troca o `fetch` global por um que pergunta primeiro aos mesmos handlers (`getResponse` do MSW). As telas e a `/_api` funcionam igual; a `/_api` mostra um aviso dizendo que o mock está no plano B.
