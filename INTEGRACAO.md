# Integração com a API interna

O front agora usa a API real (`../residenciaIV-api-interna-dev`) **no que ela já tem**: fornecedores, obras e o vínculo entre eles (só leitura). O resto continua sendo demonstração, mas gerado **sobre os fornecedores e obras reais**.

Nenhum arquivo do back foi alterado. Conferi isso comparando o checksum de todos os arquivos-fonte antes e depois: os 92 são idênticos. O `docker compose up` gerou `bin/` e `obj/` dentro de `src/` do back. São artefatos de build, o `.gitignore` do back já os ignora e não são arquivos-fonte.

## Como ligar

```bash
# no back (precisa do Docker; em Mac com Apple Silicon, com o Rosetta ligado no Docker Desktop)
cd ../residenciaIV-api-interna-dev
docker compose up --build

# no front
cp .env.example .env.local   # VITE_API_URL=http://localhost:5057 e VITE_USE_API=true
npm run dev
```

- `VITE_USE_API=true`: fornecedores, obras e vínculos vêm do banco.
- `VITE_USE_API=false` (ou sem `.env.local`): tudo volta à demonstração de antes, com os 41 fornecedores fictícios e as contagens do protótipo.
- O back não tem CORS. O Vite repassa `/api` para `VITE_API_URL` (proxy em `vite.config.ts`), então a chamada é same-origin. Isso vale para `npm run dev`. Um build estático (`npm run build`) servido sem proxy não alcança a API.

---

## 1. O que vem do banco e o que é demonstração, tela por tela

| Tela | Do banco | Demonstração (gerada sobre os dados reais) |
|---|---|---|
| **Visão geral** | contagem de fornecedores cadastrados; nomes de fornecedores e obras | fila prioritária, analisados hoje, aptos (dependem de documentos), vencimentos |
| **Fila de análise** | nomes de fornecedores e obras; quem está em qual obra | todos os itens da fila (documentos e envios) |
| **Análise / Remessa** | fornecedor e obra | documento, arquivos, decisões, envios anteriores. Aprovar e reprovar alteram só a memória. |
| **Obras** | lista de obras (nome), quantos fornecedores cada uma tem | listas de exigências da obra, pendências. Código, cidade e data de recebimento não existem no back e aparecem como "—". |
| **Ficha da obra** | nome, fornecedores vinculados | listas, pendências, histórico. **Vincular fornecedor fica indisponível.** Serviço contratado e período aparecem como "—". |
| **Fornecedores** | lista inteira: razão social, CNPJ, tipos, bloqueado, nº de obras. Filtros de situação "bloqueado" e de tipo usam dado real. | "apto / com pendência" e "x de y documentos" |
| **Ficha do fornecedor** | cabeçalho (razão social, CNPJ, tipos, telefone, e-mail, desde, bloqueado); aba Obras (quais obras) | abas Documentos, Exigências e Histórico. Aba Contatos fica vazia (o back não tem contatos). |
| **Cadastrar fornecedor** | grava no banco (POST) | — (o bloco Obra fica desabilitado) |
| **Editar dados / Bloquear / Desbloquear** | gravam no banco (PATCH dados, PUT tipos, PATCH status) | — |
| **Exigências, Nova lista, Configurar lista** | alcance (quantos fornecedores de cada tipo em cada obra) | as listas em si e o vínculo lista ↔ obra |
| **Relatórios** | nomes de obras e fornecedores | pendências, tempos de análise, vencimentos |

A demonstração vem de um gerador determinístico (`src/mocks/gerar.ts`). Ele usa um hash do id, sem `Math.random`, então o mesmo fornecedor gera sempre os mesmos documentos e recarregar a página não muda a tela. As datas acompanham o "hoje" do navegador, para validades e esperas fazerem sentido. Há sempre pelo menos um documento de funcionário com arquivos em estados diferentes (aprovado, em análise, reprovado, vencido).

## 2. Arquivos, por camada

### Configuração
- **Criados:** `.env.example`, `.env.local` (ignorado pelo git), `src/vite-env.d.ts` (tipos de `VITE_API_URL` e `VITE_USE_API`).
- **Alterados:** `vite.config.ts` (`loadEnv` + proxy `/api`), `.gitignore` (`.env.local`, `.env.*.local`).

### shared
- **Criados:**
  - `shared/lib/http.ts`: fetch com base `/api`, JSON, `AbortSignal`, 204 sem corpo; erro vira `ApiError`.
  - `shared/lib/apiError.ts`: lê ProblemDetails (`code`) e ValidationProblemDetails (`errors` → `fieldErrors`) e normaliza as chaves do back (`EnterpriseName`, `$.enterpriseTypes[0]` → `enterpriseName`, `enterpriseTypes`).
  - `shared/lib/json.ts`: leitores que validam a resposta, sem asserção de tipo.
  - `shared/lib/paginacao.ts`: `PagedResult` e `buscarTodas`.
  - `shared/lib/useQuery.ts`: mesmo contrato do `useMockQuery`, para dado assíncrono, e honra `?estado=`.
  - `shared/lib/config.ts`: `USAR_API`.
  - `shared/strings/api.ts`: tradução de cada `code`.
- **Alterados:**
  - `shared/lib/format.ts`: `telefoneValido`, com as mesmas regras do back.
  - `shared/lib/index.ts`.
  - `shared/strings/*`: textos novos (telefone, tipos, motivos de indisponível, modal de edição).
  - `shared/ui/Badge.tsx`: `BadgeGroup`, para os dois chips de tipo.
  - `shared/ui/ChoiceCard.tsx`: prop `multiple`, que troca o rádio por checkbox no seletor de tipos.

### entities
- **Criados:**
  - `entities/fornecedor/{dto,mapper,api,index}.ts`: as 6 chamadas de fornecedor.
  - `entities/obra/{dto,mapper,api,index}.ts`: a chamada de obra.
  - O total são as 7 chamadas.
- **Movidos:** `entities/fornecedor.ts` → `entities/fornecedor/model.ts`; `entities/obra.ts` → `entities/obra/model.ts`.
- **Alterados:**
  - `entities/lib/dates.ts`: `lerDataApi` acrescenta `Z` quando a data vem sem fuso; também `diaDaApi`, `momentoDaApi` e `hojeLocal`.
  - `entities/lib/aplicabilidade.ts` e `entities/lib/listas.ts`: a lista se aplica se o fornecedor *fornece* o tipo dela.
  - `entities/index.ts`.
- Nenhum componente ou página importa `http.ts` ou `dto.ts`. Só `entities/*/api.ts` e `entities/*/mapper.ts` usam esses arquivos.

### mocks (fonte de dados)
- **Criados:**
  - `mocks/store.ts`: `datasetStore`. Começa com a demonstração completa, ou só com listas e tipos de documento quando a API está ligada.
  - `mocks/hidratacao.ts`: carga do banco no boot (`garantirDataset`) e `recarregarFornecedor` depois de mutação.
  - `mocks/gerar.ts`: gerador de demonstração.
  - `mocks/useDatasetQuery.ts`: escolhe `useQuery` (API) ou `useMockQuery` (demonstração) no build.
- **Alterados:**
  - `mocks/index.ts` e `mocks/fornecedores.ts` (`tipos`, `telefone`).
  - `mocks/exemplos.ts`: exemplo de cadastro sem contato.
  - `mocks/historico.ts`: ignora vínculo e obra sem data.
  - `mocks/arquivos.ts`: exporta `PESSOAS`.

### features
- **fornecedores:**
  - **Criados:** `lib.ts` (validação e `errosDaApi`, que define onde cada erro aparece) e `components/ModalEditarFornecedor.tsx`.
  - **Removido:** `novo/BlocoContato.tsx`.
  - **Renomeado:** `novo/BlocoTipo.tsx` → `novo/SeletorTipos.tsx` (múltipla escolha, usado no cadastro e na edição).
  - **Alterados:** `useAcoesFornecedor` (chama a API e recarrega), formulário e blocos do cadastro, `ModalBloquear` (estado "enviando" e erro), `AbaContatos` (estado vazio e acesso indisponível), `ModalReenviarAcesso`, tabela, filtros, hooks de leitura e `types.ts`.
- **analise, exigencias, obras, relatorios:** os hooks de leitura passaram para `useDatasetQuery`. Também mudou o que mostra campo opcional ("—" ou some), a contagem por tipo ("contém") e, em `obras/AbaFornecedores` e `DrawerVincularFornecedor`, os chips de tipo e o botão desabilitado.

### app e pages
- **Alterados:**
  - `app/providers.tsx`: hidratação começa no boot.
  - `pages/fornecedor/FornecedorPage.tsx`: telefone, chips, "Editar dados", desbloquear assíncrono.
  - `pages/obra/ObraPage.tsx`: cabeçalho sem os campos que faltam e vínculo indisponível.
  - `pages/estados/*`: entrada nova "Modal: editar dados" e aviso no modo API. Agora são 116 estados.

### Documentação
- `INTEGRACAO.md` (este arquivo) e `EDITAR.md` (seção "API").

## 3. O que mudou no modelo do front por causa do back

| Mudança | Por quê | O que afetou |
|---|---|---|
| `tipo` → `tipos: readonly TipoFornecimento[]` (1 ou 2, sem repetição, ordem fixa) | No back a empresa pode ser de material **e** de serviço | Aplicabilidade: a lista vale se o tipo dela está em `tipos`. Filtro por tipo passou a "contém". Contadores por tipo contam o fornecedor dos dois tipos nos dois. Tabela, ficha e drawer mostram dois chips. Cadastro e edição usam múltipla escolha (mínimo 1). Os textos "é fornecedor de serviço e material" juntam os tipos. |
| `telefone: string` (só dígitos, 10 ou 11) em `Fornecedor` | No back o telefone é da empresa e obrigatório | Campo no cadastro, no bloco Identificação, e na edição. Aparece no cabeçalho da ficha. A validação local repete a do back. |
| `bloqueado` continua; vem de `!active` | Fronteira, não modelo | `active` só existe em `entities/fornecedor/{dto,mapper,api}.ts` |
| `nomeFantasia?`, `acessoPortal?` opcionais; `contatos` vazio | Não existem na API | Aba Contatos com estado vazio. Acesso ao portal indisponível com motivo. "Aguardando 1º acesso" só existe na demonstração. |
| `desde` vem de `createdAt` (só a data, no fuso local) | — | — |
| `VinculoObra`: `servicoContratado`, `inicio`, `fim`, `vinculadoEm` opcionais | O vínculo no back só tem as duas pontas | Colunas "Serviço contratado" e "Período" mostram "—". Vínculo sem data não gera evento no histórico. |
| `Obra`: `codigo`, `cidade`, `uf`, `recebidaEm` opcionais | A obra no back só tem id e nome | "—" nas tabelas. Nas linhas de texto e no cabeçalho da ficha o campo some. A exportação CSV fica com código vazio. |
| Cadastro sem contatos, sem nome fantasia e sem convite | O POST só aceita `enterpriseName`, `cnpj`, `phone`, `email`, `enterpriseTypes` | O bloco "Contato e primeiro acesso" saiu. Os blocos agora são Identificação, Tipo e Obra. |
| Datas da API com `Z` quando vêm sem fuso | O back grava em UTC e devolve sem fuso | Só em `entities/lib/dates.ts` (`lerDataApi`). Nada faz `new Date(s)` direto em dado da API. |
| `Material`/`Servico` ↔ `material`/`servico` | Enum do back | Mapa explícito único em `entities/fornecedor/mapper.ts` |

## 4. O que ficou indisponível por falta de endpoint, e onde o usuário vê o motivo

| Ação | Onde | Como aparece |
|---|---|---|
| Vincular fornecedor a uma obra (no cadastro) | Cadastrar fornecedor → bloco "3. Obra" | Bloco desabilitado, com a nota "Indisponível: a API ainda não tem endpoint para vincular fornecedor a obra…" |
| Vincular fornecedor a uma obra (na obra) | Ficha da obra | Botão "Vincular fornecedor" desabilitado (no topo e no estado vazio da aba), com nota logo abaixo do cabeçalho |
| Convite e reenvio de primeiro acesso | Ficha do fornecedor → aba Contatos → "Acesso ao portal" | Botão "Reenviar acesso" desabilitado e a nota "Sem endpoint de convite na API…" |
| Contatos da empresa | Ficha do fornecedor → aba Contatos | Estado vazio "Nenhum contato cadastrado", explicando que a API não guarda contatos |
| Código, cidade, situação e data de recebimento da obra | Obras, ficha da obra, Relatórios | "—" nas tabelas; somem do cabeçalho e das linhas de texto |
| Serviço contratado e período do vínculo | Ficha da obra (aba Fornecedores) e ficha do fornecedor (aba Obras) | "—" |

Continuam funcionando **só em memória**, como antes: decisões de análise, listas de exigências (criar, editar, vincular à obra), "Cobrar pendências".

## 5. O que o back precisaria para a próxima etapa, por ordem de impacto

1. **CORS** (`AddCors` com a origem do front e `UseCors` antes de `MapControllers`). Hoje o front só funciona pelo proxy do Vite. Sem CORS não há deploy do front separado.
2. **Busca por texto e filtros na listagem de fornecedores** (`?q=` em nome e CNPJ, `?situacao=`), mais telefone, e-mail e `createdAt` no item da lista. Hoje o front baixa todas as páginas e ainda faz um GET por fornecedor para ter telefone e e-mail: com 10 empresas são 15 chamadas no boot, mas com 1.000 não escala.
3. **Endpoint de vínculo obra ↔ fornecedor**: criar e remover, de preferência com serviço contratado e período, e um GET que devolva os vínculos de uma vez. Hoje o vínculo sai de um `?constructionIds=` por obra.
4. **Detalhe da obra** (`GET /constructions/{id}`) com código, cidade/UF e situação.
5. **Listas de exigências**: CRUD de `workflow` e `workflow_version`, itens e vínculo com obras, e a decisão de modelo do API.md (versionamento, escopo por lista × por item, validade no tipo × no item).
6. **Envios**: documentos, versões, arquivos e envio de documento de funcionário. Inclui decidir entre funcionário com CPF (back) ou arquivo sem dono (front).
7. **Decisão do analista**: aprovar ou reprovar com quem, quando, motivo e observação. Pede um usuário interno, que o back não tem. Com isso vêm a fila, o histórico e os relatórios.
8. Menores: duplicidade de nome, telefone ou e-mail volta 500 (deveria ser 409 com `code`); datas sem fuso; `Api.http` desatualizado; `EXPOSE 5001` no Dockerfile.

## 6. O que decidi por conta própria, e por quê

- **"Editar dados" virou um modal na ficha do fornecedor** (razão social, telefone, e-mail, tipos; CNPJ fixo). As mutações "editar dados" e "trocar tipos" não tinham nenhuma tela. Não é tela nova: é um modal com os componentes que já existiam.
- **Nome fantasia saiu do cadastro.** Não é campo de contato, mas o back também não aceita esse campo, então seria perdido em silêncio.
- **Com a API, o cadastro abre vazio.** Na demonstração continua preenchido com o exemplo. Com o banco de verdade, o exemplo vira registro real, e depois do primeiro uso o CNPJ dele já existe e a tela abriria com erro.
- **Obra da API entra como "em execução".** O back não tem situação de obra, e sem uma situação as obras sumiriam da Visão geral e do cadastro. Está documentado no `mapper` da obra.
- **"Hoje" no modo API é a data do navegador.** Na demonstração continua 16/09/2026. Com dados reais, criados hoje, uma data fixa no passado deixaria fornecedores "desde" o futuro.
- **Decisões "de hoje" na demonstração ficam antes do horário atual.** Elas dependem da hora em que a página carregou, então a mesma recarga no mesmo dia pode deslocar alguns minutos nos horários de hoje. Os documentos e status não mudam.
- **Telefone validado no front com as mesmas regras do back** (DDD sem zero, celular com 9). Assim o erro aparece no campo antes de chegar ao 422.
- **Desbloquear não tem modal.** Um erro da API ali aparece como aviso (toast de erro).
- **409 na edição vai para o topo do modal**, porque o CNPJ não é editável ali.
- **Busca de detalhes em lotes de 6 em paralelo** no boot, para não serializar uma chamada por fornecedor.
- **`/_estados` continua sendo o catálogo da demonstração.** Com a API, os ids fictícios (ex.: `construtora-exemplo`) não existem no banco e a página mostra um aviso dizendo isso. Os estados `?estado=carregando|erro|vazio` funcionam nos dois modos.
- **Gerador:** um envio de funcionário com arquivos já decididos nunca é de hoje. Isso evitava decisões com data de amanhã, que encontrei na verificação e corrigi.

## 7. Verificação

| # | Passo | Resultado |
|---|---|---|
| 1 | `docker compose up --build` e os dois `curl` | ✅ 10 empresas e 4 obras do seed. Antes foi preciso ligar o Rosetta no Docker Desktop: a imagem do SQL Server é só amd64. |
| 2 | `npm run typecheck` e `npm run build` | ✅ os dois limpos |
| 3 | Todas as telas pela interface | ✅ Fornecedores (lista, filtros de situação e tipo, busca), ficha (5 abas), cadastro, bloquear/desbloquear, editar, Obras e ficha da obra (4 abas), Fila, Análise (documento e envio, com uma aprovação), Exigências, lista, nova lista, Relatórios. Nenhuma tela em branco e nenhum erro de JavaScript no console. Os únicos registros de erro foram as respostas 409, 500 e 502 provocadas nos passos 5 e 6. |
| 4 | Cadastro real, depois recarregar | ✅ "Revest Nordeste" (serviço e material) aparece depois do F5 e existe no banco |
| 5 | CNPJ repetido; CNPJ inválido | ✅ Repetido já conhecido: erro no campo e alerta com link. Repetido criado por fora depois do carregamento: o 409 da API vira erro no campo CNPJ. CNPJ inválido: "CNPJ inválido. Confira os 14 dígitos." Também testados: 500 (nome repetido) como mensagem no topo do cadastro e do modal; o botão sai de "Cadastrando…" em todos os casos. |
| 6 | `docker compose stop api` e recarregar | ✅ Estado de erro com "Tentar de novo". Depois de `docker compose start api`, "Tentar de novo" carrega sem F5. |
| 7 | `VITE_USE_API=false` | ✅ Demonstração intacta: fila 12, 41 fornecedores (34 aptos), 9 vencendo, "Dados: demonstração". Sem erros no console. |
| 8 | 390 px | ✅ ficha do fornecedor, cadastro, modal de edição e ficha da obra, sem rolagem horizontal |

**Dados de teste que ficaram no banco local:**
- "Revest Nordeste Revestimentos Ltda." (CNPJ 45.987.321/0001-60). Foi editado durante o teste: telefone (81) 99988-7766, só serviço.
- "Cadastro Paralelo Ltda." (CNPJ 55.667.788/0001-86), criado por `curl` para provocar o 409.

Para voltar ao seed: `docker compose down -v && docker compose up --build`.
