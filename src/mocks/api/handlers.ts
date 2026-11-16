import { http as rest, HttpResponse, type HttpResponseResolver } from 'msw';
import { CODIGOS_CONTRATO, PAGE_SIZE_MAX, PREFIXO, type CodigoContrato } from '@/shared/api';
import { cnpjValido, telefoneValido } from '@/shared/lib';
import { env } from '@/shared/config/env';
import { db, exigenciasDaEmpresa, guidDe, HOJE_MOCK, type DefinicaoMock, type DocumentoListaMock, type EmpresaMock, type EnvioMock, type VersaoMock } from './dados';
import { montarZip } from './zip';

/**
 * Handlers do MSW para TODAS as rotas do contrato da API interna (inclusive /health),
 * com as mesmas regras de validação e os mesmos erros. Quais entradas disparam quais
 * erros está em ./README.md.
 */

const API = `${env.apiUrl}${PREFIXO}`;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ehGuid = (v: unknown): v is string => typeof v === 'string' && GUID.test(v);

// ——— Respostas de erro, nos formatos da seção 2.1 ———

const STATUS_DO_CODIGO: Readonly<Record<CodigoContrato, number>> = {
  ENTERPRISE_NOT_FOUND: 404,
  DOCUMENT_NOT_FOUND: 404,
  REQUIREMENT_NOT_FOUND: 404,
  CNPJ_ALREADY_REGISTERED: 409,
  DOCUMENT_PURGED: 410,
  INVALID_CNPJ: 422,
  INVALID_PHONE: 422,
  INVALID_EMAIL: 422,
  INVALID_ENTERPRISE_NAME: 422,
  ENTERPRISE_TYPE_REQUIRED: 422,
  INVALID_ENTERPRISE_TYPE: 422,
  INVALID_PAGE: 422,
  INVALID_PAGE_SIZE: 422,
  EMPTY_BATCH: 422,
  BATCH_TOO_LARGE: 422,
  REQUIREMENT_NOT_POSTPONABLE: 422,
  REQUIREMENT_ALREADY_POSTPONED: 422,
  POSTPONEMENT_DEADLINE_IN_PAST: 422,
  REQUIREMENT_NOT_POSTPONED: 422,
  CONSTRUCTION_NOT_FOUND: 404,
  ENTERPRISE_ALREADY_IN_CONSTRUCTION: 409,
  ENTERPRISE_INACTIVE: 422,
  ENTERPRISE_NOT_IN_CONSTRUCTION: 404,
  INVALID_LIMIT_EXPIRES_DAYS: 422,
  WORKFLOW_NOT_FOUND: 404,
  WORKFLOW_WITHOUT_VERSION: 500,
  INVALID_WORKFLOW_TYPE: 422,
  INVALID_WORKFLOW_NAME: 422,
  REQUIREMENTS_REQUIRED: 422,
  INVALID_DOCUMENT_REQUIREMENT: 422,
  DUPLICATED_REQUIREMENT: 422,
  INVALID_DISPLAY_ORDER: 422,
  WORKFLOW_ALREADY_IN_CONSTRUCTION: 409,
  CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE: 409,
  DOCUMENT_DEFINITION_NOT_FOUND: 404,
  DOCUMENT_DEFINITION_NAME_ALREADY_EXISTS: 409,
  INVALID_DOCUMENT_DEFINITION_NAME: 422,
  INVALID_DOCUMENT_DEFINITION_DESCRIPTION: 422,
  INVALID_MAX_SIZE: 422,
  EXPIRATION_POLICY_REQUIRED: 422,
  FORMATS_REQUIRED: 422,
  DOCUMENT_FORMAT_NOT_FOUND: 404,
  INVALID_VALIDITY_DAYS: 422,
  INVALID_EXPIRATION_INPUT: 422,
  INTERNAL_ERROR: 500,
};

/** Title em português, como o back manda (pode mudar; o front decide pelo `code`). */
const TITULO: Readonly<Record<CodigoContrato, string>> = {
  ENTERPRISE_NOT_FOUND: 'Empresa não encontrada.',
  DOCUMENT_NOT_FOUND: 'Documento não encontrado.',
  REQUIREMENT_NOT_FOUND: 'Exigência não encontrada.',
  CNPJ_ALREADY_REGISTERED: 'CNPJ já cadastrado.',
  DOCUMENT_PURGED: 'O arquivo do documento foi expurgado.',
  INVALID_CNPJ: 'CNPJ inválido.',
  INVALID_PHONE: 'Telefone inválido.',
  INVALID_EMAIL: 'E-mail inválido.',
  INVALID_ENTERPRISE_NAME: 'Nome da empresa inválido.',
  ENTERPRISE_TYPE_REQUIRED: 'Informe ao menos um tipo de empresa.',
  INVALID_ENTERPRISE_TYPE: 'Tipo de empresa inválido.',
  INVALID_PAGE: 'Página inválida.',
  INVALID_PAGE_SIZE: 'Tamanho de página inválido.',
  EMPTY_BATCH: 'Nenhum documento informado.',
  BATCH_TOO_LARGE: 'Limite de documentos por lote excedido.',
  REQUIREMENT_NOT_POSTPONABLE: 'A exigência não está pendente nem vencida.',
  REQUIREMENT_ALREADY_POSTPONED: 'A exigência já possui postergação ativa.',
  POSTPONEMENT_DEADLINE_IN_PAST: 'O prazo precisa ser posterior a hoje.',
  REQUIREMENT_NOT_POSTPONED: 'A exigência não possui postergação ativa.',
  CONSTRUCTION_NOT_FOUND: 'Obra não encontrada.',
  ENTERPRISE_ALREADY_IN_CONSTRUCTION: 'Esta empresa já está nesta obra.',
  ENTERPRISE_INACTIVE: 'Empresa inativa.',
  ENTERPRISE_NOT_IN_CONSTRUCTION: 'Esta empresa não está nesta obra.',
  INVALID_LIMIT_EXPIRES_DAYS: 'Prazo de entrega deve estar entre 1 e 9999 dias.',
  WORKFLOW_NOT_FOUND: 'Workflow não encontrado.',
  WORKFLOW_WITHOUT_VERSION: 'Workflow sem versão cadastrada.',
  INVALID_WORKFLOW_TYPE: 'Tipo de workflow inválido.',
  INVALID_WORKFLOW_NAME: 'Nome do workflow inválido.',
  REQUIREMENTS_REQUIRED: 'A lista deve ter ao menos um documento.',
  INVALID_DOCUMENT_REQUIREMENT: 'Documento da lista inválido.',
  DUPLICATED_REQUIREMENT: 'O mesmo documento não pode aparecer duas vezes na lista.',
  INVALID_DISPLAY_ORDER: 'Dois documentos não podem ter a mesma ordem de exibição.',
  WORKFLOW_ALREADY_IN_CONSTRUCTION: 'Esta obra já usa este workflow.',
  CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE: 'Esta obra já usa um workflow deste tipo.',
  DOCUMENT_DEFINITION_NOT_FOUND: 'Tipo de documento não encontrado.',
  DOCUMENT_DEFINITION_NAME_ALREADY_EXISTS: 'Já existe um tipo de documento com este nome.',
  INVALID_DOCUMENT_DEFINITION_NAME: 'Nome do tipo de documento inválido.',
  INVALID_DOCUMENT_DEFINITION_DESCRIPTION: 'Descrição do tipo de documento inválida.',
  INVALID_MAX_SIZE: 'Tamanho máximo deve estar entre 1 byte e 20MB.',
  EXPIRATION_POLICY_REQUIRED: 'Política de validade é obrigatória.',
  FORMATS_REQUIRED: 'Informe ao menos um formato de documento válido.',
  DOCUMENT_FORMAT_NOT_FOUND: 'Formato de documento não encontrado.',
  INVALID_VALIDITY_DAYS: 'Prazo de validade deve estar entre 1 e 9999 dias.',
  INVALID_EXPIRATION_INPUT: 'Informe um prazo de validade ou que o documento não expira, não os dois.',
  INTERNAL_ERROR: 'Erro interno no servidor.',
};

let traco = 0;
const traceId = () => `00-${String(++traco).padStart(32, '0')}-${'0'.repeat(16)}-01`;

function problema(code: CodigoContrato): HttpResponse<string> {
  const status = STATUS_DO_CODIGO[code];
  return new HttpResponse(
    JSON.stringify({ type: `https://tools.ietf.org/html/rfc9110#section-15.5`, title: TITULO[code], status, code, traceId: traceId() }),
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

/** 400 do ASP.NET: sem `code`, title em inglês, `errors` por campo. */
function validacao(errors: Record<string, string[]>): HttpResponse<string> {
  return new HttpResponse(
    JSON.stringify({
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors,
      traceId: traceId(),
    }),
    { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

/** GUID inválido na URL: 404 sem corpo (a rota exige GUID). */
const naoEncontradoSemCorpo = () => new HttpResponse(null, { status: 404 });

/** Cenário forçado pela /_api (cabeçalho X-Mock-Code, só no mock). */
function forcado(request: Request): HttpResponse<string> | null {
  const code = request.headers.get('X-Mock-Code');
  const valido = CODIGOS_CONTRATO.find((c) => c === code);
  return valido ? problema(valido) : null;
}

type Corpo = { ok: true; valor: unknown } | { ok: false; resposta: HttpResponse<string> };

async function lerCorpo(request: Request): Promise<Corpo> {
  const texto = await request.text();
  try {
    return { ok: true, valor: texto ? JSON.parse(texto) : undefined };
  } catch {
    return { ok: false, resposta: validacao({ $: ['The JSON value could not be parsed.'] }) };
  }
}

function objeto(v: unknown): Record<string, unknown> | null {
  return typeof v === 'object' && v !== null && !Array.isArray(v) ? Object.fromEntries(Object.entries(v)) : null;
}

// ——— Paginação (seção 2.2) ———

type Paginacao = { ok: true; page: number; pageSize: number } | { ok: false; resposta: HttpResponse<string> };

function paginacao(url: URL): Paginacao {
  const ler = (nome: 'page' | 'pageSize', padrao: number) => {
    const bruto = url.searchParams.get(nome);
    if (bruto === null || bruto === '') return { valor: padrao, erro: null };
    return /^-?\d+$/.test(bruto) ? { valor: Number(bruto), erro: null } : { valor: padrao, erro: `The value '${bruto}' is not valid.` };
  };
  const page = ler('page', 1);
  const pageSize = ler('pageSize', 20);
  const erros: Record<string, string[]> = {};
  if (page.erro) erros.page = [page.erro];
  if (pageSize.erro) erros.pageSize = [pageSize.erro];
  if (Object.keys(erros).length) return { ok: false, resposta: validacao(erros) };
  if (page.valor < 1) return { ok: false, resposta: problema('INVALID_PAGE') };
  if (pageSize.valor < 1 || pageSize.valor > PAGE_SIZE_MAX) return { ok: false, resposta: problema('INVALID_PAGE_SIZE') };
  return { ok: true, page: page.valor, pageSize: pageSize.valor };
}

function paginar<T>(itens: readonly T[], page: number, pageSize: number) {
  return { items: itens.slice((page - 1) * pageSize, page * pageSize), totalCount: itens.length, page, pageSize };
}

const porNome = (a: string, b: string) => a.localeCompare(b, 'pt-BR');

// ——— Validações de empresa (atributos → 400; domínio → 422) ———

const TIPOS = ['Material', 'Servico'] as const;
const emailAtributo = (v: string) => /^[^@]+@[^@]+$/.test(v); // [EmailAddress] do .NET: só exige um @ no meio
const emailDominio = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

function lerTipos(valor: unknown, erros: Record<string, string[]>): Array<(typeof TIPOS)[number]> | null {
  if (!Array.isArray(valor)) {
    erros.EnterpriseTypes = ['The EnterpriseTypes field is required.'];
    return null;
  }
  const tipos: Array<(typeof TIPOS)[number]> = [];
  valor.forEach((v: unknown, i) => {
    const t = TIPOS.find((x) => x === v);
    if (t) tipos.push(t);
    else erros[`$.enterpriseTypes[${i}]`] = ['The JSON value could not be converted to EnterpriseType.'];
  });
  if (valor.length === 0) erros.EnterpriseTypes = ["The field EnterpriseTypes must be a type with a minimum length of '1'."];
  return tipos;
}

function validarNome(v: unknown, erros: Record<string, string[]>, obrigatorio: boolean) {
  if (v === undefined || v === null) {
    if (obrigatorio) erros.EnterpriseName = ['The EnterpriseName field is required.'];
    return;
  }
  if (typeof v !== 'string' || v.length < 2 || v.length > 255) erros.EnterpriseName = ['The field EnterpriseName must be a string with a minimum length of 2 and a maximum length of 255.'];
}

function validarEmail(v: unknown, erros: Record<string, string[]>, obrigatorio: boolean) {
  if (v === undefined || v === null) {
    if (obrigatorio) erros.Email = ['The Email field is required.'];
    return;
  }
  if (typeof v !== 'string' || !emailAtributo(v)) erros.Email = ['The Email field is not a valid e-mail address.'];
}

const empresaPorId = (id: string) => db.empresas.find((e) => e.enterpriseId === id);
const agoraUtc = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const soDigitos = (v: string) => v.replace(/\D/g, '');

// ——— Handlers ———

type Params = Record<string, string | readonly string[]>;
type Resolver = HttpResponseResolver<Params>;

/** Envolve o handler: aplica o cenário forçado antes de tudo. */
const comCenario =
  (fn: Resolver): Resolver =>
  (info) =>
    forcado(info.request) ?? fn(info);

const param = (params: Params, nome: string) => {
  const v = params[nome];
  return typeof v === 'string' ? v : '';
};


// ——— Módulo workflow (listas de exigências, tipos de documento, formatos) ———
// Mesmas regras e ordem de verificação do código do back (use cases e entidades de src/modules/workflow).

const WF = `${API}/workflow`;
const MAX_TAMANHO = 20 * 1024 * 1024;
const ehInteiro = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
/** [Required] do ASP.NET: string ausente, vazia ou só com espaços é recusada. */
const textoPreenchido = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

const versaoAtual = (workFlowId: number): VersaoMock | undefined =>
  db.versoes.filter((v) => v.workFlowId === workFlowId).sort((a, b) => b.version - a.version)[0];

/** Versões em uso na obra: a maior de cada workflow (ListCurrentByConstructionAsync). */
function usosAtuais(obraId: string): VersaoMock[] {
  const daObra = db.usos.filter((u) => u.constructionId === obraId).flatMap((u) => db.versoes.filter((v) => v.workFlowVersionId === u.workFlowVersionId));
  return daObra.filter((v) => !daObra.some((o) => o.workFlowId === v.workFlowId && o.version > v.version));
}

function definicaoParaApi(d: DefinicaoMock, comDatas: boolean) {
  const { createdAt, updatedAt, ...resto } = d;
  return comDatas ? { ...resto, createdAt, updatedAt } : resto;
}

function versaoParaApi(v: VersaoMock) {
  return { workFlowVersionId: v.workFlowVersionId, version: v.version, documents: [...v.documents].sort((a, b) => a.displayOrder - b.displayOrder), createdAt: v.createdAt };
}

/** Itens de documento: 400 de campo obrigatório por item (Documents[i].X), como o model binding faz. */
function validarDocumentos(v: unknown, erros: Record<string, string[]>): unknown[] {
  if (!Array.isArray(v) || v.length === 0) {
    erros.Documents = [v === undefined || v === null ? 'A lista de documentos é obrigatória.' : 'Informe ao menos um documento.'];
    return [];
  }
  v.forEach((item, i) => {
    const o = objeto(item);
    if (!o) return; // item nulo segue: o domínio recusa com INVALID_DOCUMENT_REQUIREMENT
    if (o.documentDefinitionId === undefined || o.documentDefinitionId === null) erros[`Documents[${i}].DocumentDefinitionId`] = ['O tipo de documento é obrigatório.'];
    else if (!ehGuid(o.documentDefinitionId)) erros[`$.documents[${i}].documentDefinitionId`] = ['The JSON value could not be converted to System.Nullable`1[System.Guid].'];
    if (o.displayOrder === undefined || o.displayOrder === null) erros[`Documents[${i}].DisplayOrder`] = ['A ordem de exibição é obrigatória.'];
    else if (!ehInteiro(o.displayOrder)) erros[`$.documents[${i}].displayOrder`] = ['The JSON value could not be converted to System.Nullable`1[System.Int32].'];
    if (o.required === undefined || o.required === null) erros[`Documents[${i}].Required`] = ['Informe se o documento é obrigatório.'];
    else if (typeof o.required !== 'boolean') erros[`$.documents[${i}].required`] = ['The JSON value could not be converted to System.Nullable`1[System.Boolean].'];
  });
  return v;
}

/** DocumentRequirement + WorkFlowVersion.ValidateRequirements + EnsureDocumentsExistAsync. */
function requisitos(lista: unknown[]): { ok: true; docs: DocumentoListaMock[] } | { ok: false; resposta: HttpResponse<string> } {
  const docs: DocumentoListaMock[] = [];
  for (const item of lista) {
    const o = objeto(item);
    if (!o || o.documentDefinitionId === '00000000-0000-0000-0000-000000000000') return { ok: false, resposta: problema('INVALID_DOCUMENT_REQUIREMENT') };
    if (ehInteiro(o.displayOrder) && o.displayOrder < 0) return { ok: false, resposta: problema('INVALID_DISPLAY_ORDER') };
    docs.push({ documentDefinitionId: String(o.documentDefinitionId), displayOrder: Number(o.displayOrder), required: o.required === true });
  }
  if (new Set(docs.map((d) => d.documentDefinitionId)).size !== docs.length) return { ok: false, resposta: problema('DUPLICATED_REQUIREMENT') };
  if (new Set(docs.map((d) => d.displayOrder)).size !== docs.length) return { ok: false, resposta: problema('INVALID_DISPLAY_ORDER') };
  if (docs.some((d) => !db.definicoes.some((x) => x.documentDefinitionId === d.documentDefinitionId))) return { ok: false, resposta: problema('DOCUMENT_DEFINITION_NOT_FOUND') };
  return { ok: true, docs: docs.sort((a, b) => a.displayOrder - b.displayOrder) };
}

/** EnsureConstructionCanUseTypeAsync: obra existe → já usa este workflow → já tem um do tipo. */
function obraPodeUsar(obraId: string, tipo: 'Material' | 'Servico', workFlowId: number | null): HttpResponse<string> | null {
  if (!db.obras.some((o) => o.constructionId === obraId)) return problema('CONSTRUCTION_NOT_FOUND');
  const atuais = usosAtuais(obraId);
  if (workFlowId !== null && atuais.some((v) => v.workFlowId === workFlowId)) return problema('WORKFLOW_ALREADY_IN_CONSTRUCTION');
  if (atuais.some((v) => db.workflows.find((w) => w.workFlowId === v.workFlowId)?.type === tipo)) return problema('CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE');
  return null;
}

/** Empresas da obra que seguem a lista: ativas e com o tipo dela (ConstructionAssignmentBuilder). */
function empresasQueSeguem(obraId: string, tipo: 'Material' | 'Servico'): string[] {
  const daObra = new Set(db.vinculos.filter((v) => v.constructionId === obraId).map((v) => v.enterpriseId));
  return db.empresas.filter((e) => daObra.has(e.enterpriseId) && e.active && e.types.includes(tipo)).map((e) => e.enterpriseId);
}

const novaVersaoId = () => guidDe('5', db.proximaVersao++);

/** Enum na query: o model binding aceita o nome (sem diferenciar maiúsculas) ou o número. */
function tipoDaQuery(v: string): 'Material' | 'Servico' | null {
  const t = v.trim().toLowerCase();
  return t === 'material' || t === '1' ? 'Material' : t === 'servico' || t === '2' ? 'Servico' : null;
}

function validarDefinicao(b: Record<string, unknown>, erros: Record<string, string[]>, criando: boolean) {
  if (criando && !textoPreenchido(b.name)) erros.Name = ['O nome é obrigatório.'];
  else if (typeof b.name === 'string' && b.name.length > 100) erros.Name = ['O nome deve ter no máximo 100 caracteres.'];
  if (criando && typeof b.description !== 'string') erros.Description = ['A descrição é obrigatória.'];
  else if (typeof b.description === 'string' && b.description.length > 255) erros.Description = ['A descrição deve ter no máximo 255 caracteres.'];
  if (criando && (b.maxSizeBytes === undefined || b.maxSizeBytes === null)) erros.MaxSizeBytes = ['O tamanho máximo é obrigatório.'];
  if (criando && (b.canReuse === undefined || b.canReuse === null)) erros.CanReuse = ['Informe se o documento pode ser reaproveitado.'];
  if (b.acceptedFormatIds !== undefined && b.acceptedFormatIds !== null) {
    if (!Array.isArray(b.acceptedFormatIds) || b.acceptedFormatIds.length === 0) erros.AcceptedFormatIds = ['Informe ao menos um formato aceito.'];
  } else if (criando) erros.AcceptedFormatIds = ['Informe ao menos um formato aceito.'];
}

const formatosDe = (v: unknown): number[] => (Array.isArray(v) ? v.filter(ehInteiro) : []);

const handlersWorkflow = [
  rest.get(`${WF}/document-formats`, comCenario(() =>
    HttpResponse.json(db.formatos.filter((f) => f.active).sort((a, b) => porNome(a.name, b.name)).map(({ active: _a, ...f }) => f)),
  )),

  rest.get(`${WF}/document-definitions`, comCenario(({ request }) => {
    const url = new URL(request.url);
    const p = paginacao(url);
    if (!p.ok) return p.resposta;
    const nome = url.searchParams.get('name')?.toLowerCase() ?? '';
    const lista = db.definicoes.filter((d) => d.name.toLowerCase().includes(nome)).sort((a, b) => porNome(a.name, b.name));
    return HttpResponse.json(paginar(lista.map((d) => definicaoParaApi(d, false)), p.page, p.pageSize));
  })),

  rest.get(`${WF}/document-definitions/:id`, comCenario(({ params }) => {
    const id = param(params, 'id');
    if (!ehGuid(id)) return naoEncontradoSemCorpo();
    const d = db.definicoes.find((x) => x.documentDefinitionId === id);
    return d ? HttpResponse.json(definicaoParaApi(d, true)) : problema('DOCUMENT_DEFINITION_NOT_FOUND');
  })),

  // CreateDocumentDefinitionUseCase: 400 → validade → entidade (nome, descrição, tamanho, formatos) → nome livre (409) → formatos ativos (404).
  rest.post(`${WF}/document-definitions`, comCenario(async ({ request }) => {
    const corpo = await lerCorpo(request);
    if (!corpo.ok) return corpo.resposta;
    const b = objeto(corpo.valor) ?? {};
    const erros: Record<string, string[]> = {};
    validarDefinicao(b, erros, true);
    if (Object.keys(erros).length) return validacao(erros);
    const dias = b.expiresInDays;
    if (dias !== undefined && dias !== null && (!ehInteiro(dias) || dias < 1 || dias > 9999)) return problema('INVALID_VALIDITY_DAYS');
    const nome = String(b.name).trim();
    const tamanho = Number(b.maxSizeBytes);
    if (tamanho <= 0 || tamanho > MAX_TAMANHO) return problema('INVALID_MAX_SIZE');
    const formatos = [...new Set(formatosDe(b.acceptedFormatIds))];
    if (formatos.length === 0 || formatos.some((f) => f <= 0)) return problema('FORMATS_REQUIRED');
    if (db.definicoes.some((d) => d.name === nome)) return problema('DOCUMENT_DEFINITION_NAME_ALREADY_EXISTS');
    if (formatos.some((f) => !db.formatos.some((x) => x.documentFormatId === f && x.active))) return problema('DOCUMENT_FORMAT_NOT_FOUND');
    const agora = agoraUtc();
    const nova: DefinicaoMock = {
      documentDefinitionId: crypto.randomUUID(),
      name: nome,
      description: String(b.description).trim(),
      maxSizeBytes: tamanho,
      canReuse: b.canReuse === true,
      expiresInDays: ehInteiro(dias) ? dias : null,
      acceptedFormatIds: formatos,
      createdAt: agora,
      updatedAt: agora,
    };
    db.definicoes.push(nova);
    return HttpResponse.json({ documentDefinitionId: nova.documentDefinitionId }, { status: 201 });
  })),

  // UpdateDocumentDefinitionUseCase: 400 → validade + "não vence" juntos (422) → validade → 404 → nada a mudar (204) → entidade → nome → formatos novos ativos.
  rest.patch(`${WF}/document-definitions/:id`, comCenario(async ({ request, params }) => {
    const id = param(params, 'id');
    if (!ehGuid(id)) return naoEncontradoSemCorpo();
    const corpo = await lerCorpo(request);
    if (!corpo.ok) return corpo.resposta;
    const b = objeto(corpo.valor) ?? {};
    const erros: Record<string, string[]> = {};
    validarDefinicao(b, erros, false);
    if (Object.keys(erros).length) return validacao(erros);
    const dias = b.expiresInDays;
    if (dias !== undefined && dias !== null && b.neverExpires === true) return problema('INVALID_EXPIRATION_INPUT');
    if (dias !== undefined && dias !== null && (!ehInteiro(dias) || dias < 1 || dias > 9999)) return problema('INVALID_VALIDITY_DAYS');
    const d = db.definicoes.find((x) => x.documentDefinitionId === id);
    if (!d) return problema('DOCUMENT_DEFINITION_NOT_FOUND');
    const nada = [b.name, b.description, b.maxSizeBytes, b.canReuse, b.acceptedFormatIds].every((v) => v === undefined || v === null) && (dias === undefined || dias === null) && b.neverExpires !== true;
    if (nada) return new HttpResponse(null, { status: 204 });
    const nome = typeof b.name === 'string' ? b.name.trim() : d.name;
    if (typeof b.name === 'string' && (nome === '' || nome.length > 100)) return problema('INVALID_DOCUMENT_DEFINITION_NAME');
    if (typeof b.maxSizeBytes === 'number' && (b.maxSizeBytes <= 0 || b.maxSizeBytes > MAX_TAMANHO)) return problema('INVALID_MAX_SIZE');
    const formatos = b.acceptedFormatIds !== undefined && b.acceptedFormatIds !== null ? [...new Set(formatosDe(b.acceptedFormatIds))] : d.acceptedFormatIds;
    if (formatos.length === 0 || formatos.some((f) => f <= 0)) return problema('FORMATS_REQUIRED');
    if (typeof b.name === 'string' && db.definicoes.some((x) => x.name === nome && x.documentDefinitionId !== id)) return problema('DOCUMENT_DEFINITION_NAME_ALREADY_EXISTS');
    const adicionados = formatos.filter((f) => !d.acceptedFormatIds.includes(f));
    if (adicionados.some((f) => !db.formatos.some((x) => x.documentFormatId === f && x.active))) return problema('DOCUMENT_FORMAT_NOT_FOUND');
    Object.assign(d, {
      name: nome,
      description: typeof b.description === 'string' ? b.description.trim() : d.description,
      maxSizeBytes: typeof b.maxSizeBytes === 'number' ? b.maxSizeBytes : d.maxSizeBytes,
      canReuse: typeof b.canReuse === 'boolean' ? b.canReuse : d.canReuse,
      expiresInDays: ehInteiro(dias) ? dias : b.neverExpires === true ? null : d.expiresInDays,
      acceptedFormatIds: formatos,
      updatedAt: agoraUtc(),
    });
    return new HttpResponse(null, { status: 204 });
  })),

  rest.get(`${WF}/workflows`, comCenario(({ request }) => {
    const url = new URL(request.url);
    const tipoBruto = url.searchParams.get('type');
    const tipo = tipoBruto === null || tipoBruto === '' ? null : tipoDaQuery(tipoBruto);
    if (tipoBruto && !tipo) return validacao({ type: [`The value '${tipoBruto}' is not valid.`] });
    const p = paginacao(url);
    if (!p.ok) return p.resposta;
    const nome = url.searchParams.get('name')?.toLowerCase() ?? '';
    const lista = db.workflows
      .filter((w) => (!tipo || w.type === tipo) && w.name.toLowerCase().includes(nome))
      .sort((a, b) => porNome(a.name, b.name))
      .map((w) => ({ workFlowId: w.workFlowId, name: w.name, type: w.type }));
    return HttpResponse.json(paginar(lista, p.page, p.pageSize));
  })),

  rest.get(`${WF}/workflows/:id`, comCenario(({ params }) => {
    const id = Number(param(params, 'id'));
    if (!Number.isInteger(id)) return naoEncontradoSemCorpo();
    const w = db.workflows.find((x) => x.workFlowId === id);
    if (!w) return problema('WORKFLOW_NOT_FOUND');
    const v = versaoAtual(id);
    if (!v) return problema('WORKFLOW_WITHOUT_VERSION');
    return HttpResponse.json({ workFlowId: w.workFlowId, name: w.name, type: w.type, createdAt: w.createdAt, updatedAt: w.updatedAt, currentVersion: versaoParaApi(v) });
  })),

  rest.get(`${WF}/workflows/:id/versions`, comCenario(({ params }) => {
    const id = Number(param(params, 'id'));
    if (!Number.isInteger(id)) return naoEncontradoSemCorpo();
    if (!db.workflows.some((x) => x.workFlowId === id)) return problema('WORKFLOW_NOT_FOUND');
    return HttpResponse.json(db.versoes.filter((v) => v.workFlowId === id).sort((a, b) => a.version - b.version).map(versaoParaApi));
  })),

  // CreateWorkflowUseCase: 400 (inclui prazo obrigatório com obra) → nome → requisitos → documentos existem → obra (prazo, existe, tipo) → grava.
  rest.post(`${WF}/workflows`, comCenario(async ({ request }) => {
    const corpo = await lerCorpo(request);
    if (!corpo.ok) return corpo.resposta;
    const b = objeto(corpo.valor) ?? {};
    const erros: Record<string, string[]> = {};
    if (!textoPreenchido(b.name)) erros.Name = ['O nome é obrigatório.'];
    else if (b.name.length > 150) erros.Name = ['O nome deve ter no máximo 150 caracteres.'];
    if (b.type === undefined || b.type === null) erros.Type = ['O tipo do workflow é obrigatório.'];
    else if (b.type !== 'Material' && b.type !== 'Servico') erros['$.type'] = ['The JSON value could not be converted to System.Nullable`1[Api.Modules.Workflow.Domain.Enums.WorkFlowEnterpriseType].'];
    const lista = validarDocumentos(b.documents, erros);
    const obraId = b.constructionId === undefined || b.constructionId === null ? null : b.constructionId;
    if (obraId !== null && !ehGuid(obraId)) erros['$.constructionId'] = ['The JSON value could not be converted to System.Nullable`1[System.Guid].'];
    if (Object.keys(erros).length) return validacao(erros);
    // IValidatableObject: só roda depois que os atributos passaram.
    if (obraId !== null) {
      if (b.limitExpiresDays === undefined || b.limitExpiresDays === null) return validacao({ LimitExpiresDays: ['O prazo de entrega é obrigatório quando a obra é informada.'] });
      if (!ehInteiro(b.limitExpiresDays) || b.limitExpiresDays < 1 || b.limitExpiresDays > 9999) return validacao({ LimitExpiresDays: ['O prazo de entrega deve estar entre 1 e 9999 dias.'] });
    }
    const tipo = b.type === 'Material' ? 'Material' : 'Servico';
    const r = requisitos(lista);
    if (!r.ok) return r.resposta;
    if (obraId !== null) {
      const recusa = obraPodeUsar(String(obraId), tipo, null);
      if (recusa) return recusa;
    }
    const agora = agoraUtc();
    const id = db.proximoWorkflowId++;
    db.workflows.push({ workFlowId: id, name: String(b.name).trim(), type: tipo, createdAt: agora, updatedAt: agora });
    const versao: VersaoMock = { workFlowVersionId: novaVersaoId(), workFlowId: id, version: 1, documents: r.docs, createdAt: agora };
    db.versoes.push(versao);
    const empresas = obraId !== null ? empresasQueSeguem(String(obraId), tipo) : [];
    if (obraId !== null) db.usos.push({ constructionId: String(obraId), workFlowVersionId: versao.workFlowVersionId });
    return HttpResponse.json({ workFlowId: id, workFlowVersionId: versao.workFlowVersionId, assignedEnterpriseIds: empresas }, { status: 201 });
  })),

  rest.patch(`${WF}/workflows/:id`, comCenario(async ({ request, params }) => {
    const id = Number(param(params, 'id'));
    if (!Number.isInteger(id)) return naoEncontradoSemCorpo();
    const corpo = await lerCorpo(request);
    if (!corpo.ok) return corpo.resposta;
    const b = objeto(corpo.valor) ?? {};
    if (!textoPreenchido(b.name)) return validacao({ Name: ['O nome é obrigatório.'] });
    if (b.name.length > 150) return validacao({ Name: ['O nome deve ter no máximo 150 caracteres.'] });
    const w = db.workflows.find((x) => x.workFlowId === id);
    if (!w) return problema('WORKFLOW_NOT_FOUND');
    w.name = b.name.trim();
    w.updatedAt = agoraUtc();
    return new HttpResponse(null, { status: 204 });
  })),

  // UpdateWorkflowRequirementsUseCase: igual à vigente → devolve a vigente; senão versão + 1, e as obras que usavam a vigente passam para a nova.
  rest.put(`${WF}/workflows/:id/requirements`, comCenario(async ({ request, params }) => {
    const id = Number(param(params, 'id'));
    if (!Number.isInteger(id)) return naoEncontradoSemCorpo();
    const corpo = await lerCorpo(request);
    if (!corpo.ok) return corpo.resposta;
    const b = objeto(corpo.valor) ?? {};
    const erros: Record<string, string[]> = {};
    const lista = validarDocumentos(b.documents, erros);
    if (Object.keys(erros).length) return validacao(erros);
    if (!db.workflows.some((x) => x.workFlowId === id)) return problema('WORKFLOW_NOT_FOUND');
    const atual = versaoAtual(id);
    if (!atual) return problema('WORKFLOW_WITHOUT_VERSION');
    const r = requisitos(lista);
    if (!r.ok) return r.resposta;
    const igual =
      atual.documents.length === r.docs.length &&
      [...atual.documents].sort((a, b) => a.displayOrder - b.displayOrder).every((d, i) => {
        const n = r.docs[i];
        return n !== undefined && n.documentDefinitionId === d.documentDefinitionId && n.displayOrder === d.displayOrder && n.required === d.required;
      });
    if (igual) return HttpResponse.json({ workFlowId: id, workFlowVersionId: atual.workFlowVersionId, version: atual.version });
    const nova: VersaoMock = { workFlowVersionId: novaVersaoId(), workFlowId: id, version: atual.version + 1, documents: r.docs, createdAt: agoraUtc() };
    db.versoes.push(nova);
    for (const u of db.usos.filter((x) => x.workFlowVersionId === atual.workFlowVersionId)) db.usos.push({ constructionId: u.constructionId, workFlowVersionId: nova.workFlowVersionId });
    return HttpResponse.json({ workFlowId: id, workFlowVersionId: nova.workFlowVersionId, version: nova.version });
  })),

  rest.get(`${WF}/constructions/:obraId/workflows`, comCenario(({ params }) => {
    const obraId = param(params, 'obraId');
    if (!ehGuid(obraId)) return naoEncontradoSemCorpo();
    if (!db.obras.some((o) => o.constructionId === obraId)) return problema('CONSTRUCTION_NOT_FOUND');
    return HttpResponse.json(
      usosAtuais(obraId).flatMap((v) => {
        const w = db.workflows.find((x) => x.workFlowId === v.workFlowId);
        return w ? [{ workFlowId: w.workFlowId, name: w.name, type: w.type, workFlowVersionId: v.workFlowVersionId, version: v.version }] : [];
      }),
    );
  })),

  // AssignWorkflowToConstructionUseCase: 400 → prazo → workflow (404) → versão → obra (404, 409, 409) → grava.
  rest.post(`${WF}/constructions/:obraId/workflows`, comCenario(async ({ request, params }) => {
    const obraId = param(params, 'obraId');
    if (!ehGuid(obraId)) return naoEncontradoSemCorpo();
    const corpo = await lerCorpo(request);
    if (!corpo.ok) return corpo.resposta;
    const b = objeto(corpo.valor) ?? {};
    const erros: Record<string, string[]> = {};
    if (b.workFlowId === undefined || b.workFlowId === null) erros.WorkFlowId = ['O workflow é obrigatório.'];
    else if (!ehInteiro(b.workFlowId)) erros['$.workFlowId'] = ['The JSON value could not be converted to System.Nullable`1[System.Int32].'];
    if (b.limitExpiresDays === undefined || b.limitExpiresDays === null) erros.LimitExpiresDays = ['O prazo de entrega é obrigatório.'];
    else if (!ehInteiro(b.limitExpiresDays) || b.limitExpiresDays < 1 || b.limitExpiresDays > 9999) erros.LimitExpiresDays = ['O prazo de entrega deve estar entre 1 e 9999 dias.'];
    if (Object.keys(erros).length) return validacao(erros);
    const w = db.workflows.find((x) => x.workFlowId === b.workFlowId);
    if (!w) return problema('WORKFLOW_NOT_FOUND');
    const atual = versaoAtual(w.workFlowId);
    if (!atual) return problema('WORKFLOW_WITHOUT_VERSION');
    const recusa = obraPodeUsar(obraId, w.type, w.workFlowId);
    if (recusa) return recusa;
    db.usos.push({ constructionId: obraId, workFlowVersionId: atual.workFlowVersionId });
    return HttpResponse.json({ workFlowVersionId: atual.workFlowVersionId, assignedEnterpriseIds: empresasQueSeguem(obraId, w.type) }, { status: 201 });
  })),
];

export const handlers = [
  ...handlersWorkflow,
  rest.get(`${env.apiUrl}/health`, () => new HttpResponse('Healthy', { headers: { 'Content-Type': 'text/plain' } })),

  // 4.1 Cadastrar empresa
  rest.post(
    `${API}/enterprises`,
    comCenario(async ({ request }) => {
      const corpo = await lerCorpo(request);
      if (!corpo.ok) return corpo.resposta;
      const b = objeto(corpo.valor) ?? {};
      const erros: Record<string, string[]> = {};
      validarNome(b.enterpriseName, erros, true);
      if (typeof b.cnpj !== 'string' || b.cnpj.length < 14 || b.cnpj.length > 18) erros.Cnpj = ['The field Cnpj must be a string with a minimum length of 14 and a maximum length of 18.'];
      // [Required] do ASP.NET recusa também a string vazia (conferido na API publicada).
      if (typeof b.phone !== 'string' || b.phone.trim() === '') erros.Phone = ['The Phone field is required.'];
      validarEmail(b.email, erros, true);
      const tipos = lerTipos(b.enterpriseTypes, erros);
      if (Object.keys(erros).length) return validacao(erros);

      const nome = typeof b.enterpriseName === 'string' ? b.enterpriseName.trim() : '';
      const cnpj = typeof b.cnpj === 'string' ? soDigitos(b.cnpj) : '';
      const phone = typeof b.phone === 'string' ? b.phone : '';
      const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
      if (nome.length < 2) return problema('INVALID_ENTERPRISE_NAME');
      if (!cnpjValido(cnpj)) return problema('INVALID_CNPJ');
      if (!telefoneValido(phone) || /[^\d\s()-]/.test(phone)) return problema('INVALID_PHONE');
      if (!emailDominio(email)) return problema('INVALID_EMAIL');
      if (!tipos || tipos.length === 0) return problema('ENTERPRISE_TYPE_REQUIRED');
      if (db.empresas.some((e) => e.cnpj === cnpj)) return problema('CNPJ_ALREADY_REGISTERED');

      const agora = agoraUtc();
      const nova: EmpresaMock = {
        enterpriseId: guidDe('e', db.proximoId++),
        enterpriseName: nome,
        cnpj,
        phone: soDigitos(phone),
        email,
        types: [...new Set(tipos)],
        active: true,
        createdAt: agora,
        updatedAt: agora,
      };
      db.empresas.push(nova);
      return HttpResponse.json(
        { enterpriseId: nova.enterpriseId },
        { status: 201, headers: { Location: `${PREFIXO}/enterprises/${nova.enterpriseId}` } },
      );
    }),
  ),

  // 4.2 Listar empresas
  rest.get(
    `${API}/enterprises`,
    comCenario(({ request }) => {
      const url = new URL(request.url);
      const erros: Record<string, string[]> = {};
      const type = url.searchParams.get('type');
      const tipo = type === null ? null : (TIPOS.find((t) => t.toLowerCase() === type.toLowerCase()) ?? null);
      if (type !== null && !tipo) erros.type = [`The value '${type}' is not valid.`];
      const active = url.searchParams.get('active');
      if (active !== null && !/^(true|false)$/i.test(active)) erros.active = [`The value '${active}' is not valid.`];
      const obras = url.searchParams.getAll('constructionIds');
      obras.forEach((o, i) => {
        if (!ehGuid(o)) erros[`constructionIds[${i}]`] = [`The value '${o}' is not valid.`];
      });
      if (Object.keys(erros).length) return validacao(erros);
      const p = paginacao(url);
      if (!p.ok) return p.resposta;

      const ligadas = new Set(db.vinculos.filter((v) => obras.includes(v.constructionId)).map((v) => v.enterpriseId));
      const lista = db.empresas
        .filter((e) => !tipo || e.types.includes(tipo))
        .filter((e) => active === null || e.active === (active.toLowerCase() === 'true'))
        .filter((e) => obras.length === 0 || ligadas.has(e.enterpriseId))
        .sort((a, b) => porNome(a.enterpriseName, b.enterpriseName))
        .map((e) => ({ enterpriseId: e.enterpriseId, enterpriseName: e.enterpriseName, cnpj: e.cnpj, types: e.types, active: e.active }));
      return HttpResponse.json(paginar(lista, p.page, p.pageSize));
    }),
  ),

  // 4.3 Detalhe
  rest.get(
    `${API}/enterprises/:enterpriseId`,
    comCenario(({ params }) => {
      const id = param(params, 'enterpriseId');
      if (!ehGuid(id)) return naoEncontradoSemCorpo();
      const e = empresaPorId(id);
      return e ? HttpResponse.json(e) : problema('ENTERPRISE_NOT_FOUND');
    }),
  ),

  // 4.4 Editar dados
  rest.patch(
    `${API}/enterprises/:enterpriseId`,
    comCenario(async ({ request, params }) => {
      const id = param(params, 'enterpriseId');
      if (!ehGuid(id)) return naoEncontradoSemCorpo();
      const corpo = await lerCorpo(request);
      if (!corpo.ok) return corpo.resposta;
      const b = objeto(corpo.valor) ?? {};
      const erros: Record<string, string[]> = {};
      validarNome(b.enterpriseName, erros, false);
      validarEmail(b.email, erros, false);
      if (b.phone !== undefined && b.phone !== null && typeof b.phone !== 'string') erros.Phone = ['The Phone field is not valid.'];
      if (Object.keys(erros).length) return validacao(erros);
      const e = empresaPorId(id);
      if (!e) return problema('ENTERPRISE_NOT_FOUND');
      if (typeof b.enterpriseName === 'string' && b.enterpriseName.trim().length < 2) return problema('INVALID_ENTERPRISE_NAME');
      if (typeof b.phone === 'string' && (!telefoneValido(b.phone) || /[^\d\s()-]/.test(b.phone))) return problema('INVALID_PHONE');
      if (typeof b.email === 'string' && !emailDominio(b.email)) return problema('INVALID_EMAIL');
      if (typeof b.enterpriseName === 'string') e.enterpriseName = b.enterpriseName.trim();
      if (typeof b.phone === 'string') e.phone = soDigitos(b.phone);
      if (typeof b.email === 'string') e.email = b.email.trim().toLowerCase();
      if (Object.keys(b).length) e.updatedAt = agoraUtc();
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  // 4.5 Trocar tipos
  rest.put(
    `${API}/enterprises/:enterpriseId/types`,
    comCenario(async ({ request, params }) => {
      const id = param(params, 'enterpriseId');
      if (!ehGuid(id)) return naoEncontradoSemCorpo();
      const corpo = await lerCorpo(request);
      if (!corpo.ok) return corpo.resposta;
      const erros: Record<string, string[]> = {};
      const tipos = lerTipos((objeto(corpo.valor) ?? {}).enterpriseTypes, erros);
      if (Object.keys(erros).length) return validacao(erros);
      const e = empresaPorId(id);
      if (!e) return problema('ENTERPRISE_NOT_FOUND');
      if (!tipos || tipos.length === 0) return problema('ENTERPRISE_TYPE_REQUIRED');
      e.types = [...new Set(tipos)];
      e.updatedAt = agoraUtc();
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  // 4.6 Ativar / desativar
  rest.patch(
    `${API}/enterprises/:enterpriseId/status`,
    comCenario(async ({ request, params }) => {
      const id = param(params, 'enterpriseId');
      if (!ehGuid(id)) return naoEncontradoSemCorpo();
      const corpo = await lerCorpo(request);
      if (!corpo.ok) return corpo.resposta;
      const active = (objeto(corpo.valor) ?? {}).active;
      if (typeof active !== 'boolean') return validacao({ Active: ['The Active field is required.'] });
      const e = empresaPorId(id);
      if (!e) return problema('ENTERPRISE_NOT_FOUND');
      if (e.active !== active) {
        e.active = active;
        e.updatedAt = agoraUtc();
      }
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  // 5.1 Obras
  rest.get(
    `${API}/constructions`,
    comCenario(({ request }) => {
      const url = new URL(request.url);
      const enterpriseId = url.searchParams.get('enterpriseId');
      if (enterpriseId !== null && !ehGuid(enterpriseId)) return validacao({ enterpriseId: [`The value '${enterpriseId}' is not valid.`] });
      const p = paginacao(url);
      if (!p.ok) return p.resposta;
      const daEmpresa = new Set(db.vinculos.filter((v) => v.enterpriseId === enterpriseId).map((v) => v.constructionId));
      const lista = db.obras.filter((o) => enterpriseId === null || daEmpresa.has(o.constructionId)).sort((a, b) => porNome(a.constructionName, b.constructionName));
      return HttpResponse.json(paginar(lista, p.page, p.pageSize));
    }),
  ),

  // Vínculo empresa ↔ obra — mesmas regras e mesma ordem de verificação do back
  // (AddEnterpriseToConstructionUseCase e WorkflowAssignmentServiceImpl):
  // 400 de validação → 404 obra → 409 já vinculada → 404 empresa → 422 empresa inativa → 201.
  rest.post(
    `${API}/construction/constructions/:constructionId/enterprises`,
    comCenario(async ({ request, params }) => {
      const obraId = param(params, 'constructionId');
      if (!ehGuid(obraId)) return naoEncontradoSemCorpo();
      const corpo = await lerCorpo(request);
      if (!corpo.ok) return corpo.resposta;
      const b = objeto(corpo.valor) ?? {};
      const erros: Record<string, string[]> = {};
      if (b.enterpriseId === undefined || b.enterpriseId === null) erros.EnterpriseId = ['A empresa é obrigatória.'];
      else if (!ehGuid(b.enterpriseId)) erros['$.enterpriseId'] = ['The JSON value could not be converted to System.Nullable`1[System.Guid].'];
      if (b.limitExpiresDays === undefined || b.limitExpiresDays === null) erros.LimitExpiresDays = ['O prazo de entrega é obrigatório.'];
      else if (typeof b.limitExpiresDays !== 'number' || !Number.isInteger(b.limitExpiresDays)) erros['$.limitExpiresDays'] = ['The JSON value could not be converted to System.Nullable`1[System.Int32].'];
      else if (b.limitExpiresDays < 1 || b.limitExpiresDays > 9999) erros.LimitExpiresDays = ['O prazo de entrega deve estar entre 1 e 9999 dias.'];
      if (Object.keys(erros).length) return validacao(erros);

      const empresaId = typeof b.enterpriseId === 'string' ? b.enterpriseId : '';
      if (!db.obras.some((o) => o.constructionId === obraId)) return problema('CONSTRUCTION_NOT_FOUND');
      if (db.vinculos.some((v) => v.constructionId === obraId && v.enterpriseId === empresaId)) return problema('ENTERPRISE_ALREADY_IN_CONSTRUCTION');
      const empresa = empresaPorId(empresaId);
      if (!empresa) return problema('ENTERPRISE_NOT_FOUND');
      if (!empresa.active) return problema('ENTERPRISE_INACTIVE');

      db.vinculos.push({ enterpriseId: empresaId, constructionId: obraId });
      // Workflows atuais da obra com um dos tipos da empresa; os tipos dela sem workflow na obra (1 = Material, 2 = Servico).
      const daObra = usosAtuais(obraId).flatMap((v) => db.workflows.filter((w) => w.workFlowId === v.workFlowId));
      const seguidos = daObra.filter((w) => empresa.types.includes(w.type));
      return HttpResponse.json(
        {
          assignedWorkFlowIds: seguidos.map((w) => w.workFlowId),
          typesWithoutWorkflow: empresa.types.filter((t) => !seguidos.some((w) => w.type === t)).map((t) => (t === 'Material' ? 1 : 2)),
        },
        { status: 201, headers: { Location: `${API}/constructions?enterpriseId=${empresaId}` } },
      );
    }),
  ),
  rest.delete(
    `${API}/construction/constructions/:constructionId/enterprises/:enterpriseId`,
    comCenario(({ params }) => {
      const obraId = param(params, 'constructionId');
      const empresaId = param(params, 'enterpriseId');
      if (!ehGuid(obraId) || !ehGuid(empresaId)) return naoEncontradoSemCorpo();
      // Como no back: só confere o vínculo (obra inexistente também dá ENTERPRISE_NOT_IN_CONSTRUCTION).
      const i = db.vinculos.findIndex((v) => v.constructionId === obraId && v.enterpriseId === empresaId);
      if (i < 0) return problema('ENTERPRISE_NOT_IN_CONSTRUCTION');
      db.vinculos.splice(i, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  // 6.1 Acervo
  rest.get(
    `${API}/enterprises/:enterpriseId/archive`,
    comCenario(({ request, params }) => {
      const id = param(params, 'enterpriseId');
      if (!ehGuid(id)) return naoEncontradoSemCorpo();
      const url = new URL(request.url);
      const erros: Record<string, string[]> = {};
      const def = url.searchParams.get('documentDefinitionId');
      if (def !== null && !ehGuid(def)) erros.documentDefinitionId = [`The value '${def}' is not valid.`];
      const scope = url.searchParams.get('scope');
      if (scope !== null && !['Enterprise', 'Employee'].includes(scope)) erros.scope = [`The value '${scope}' is not valid.`];
      const status = url.searchParams.get('status');
      if (status !== null && !['Pending', 'Approved', 'Rejected', 'RevisionRequired', 'Cancelled'].includes(status)) erros.status = [`The value '${status}' is not valid.`];
      if (Object.keys(erros).length) return validacao(erros);
      if (!empresaPorId(id)) return problema('ENTERPRISE_NOT_FOUND');
      const competency = url.searchParams.get('competency');

      const docs = db.envios.filter(
        (e) =>
          e.enterpriseId === id &&
          (def === null || e.documentDefinitionId === def) &&
          (scope === null || e.scope === scope) &&
          (status === null || e.status === status) &&
          (competency === null || e.competency === competency),
      );
      const doc = (e: EnvioMock) => ({
        documentSubmissionId: e.documentSubmissionId,
        documentDefinitionId: e.documentDefinitionId,
        documentDefinitionName: e.documentDefinitionName,
        status: e.status,
        competency: e.competency,
        expiresAt: e.expiresAt,
        lastSendAt: e.lastSendAt,
      });
      const grupos: unknown[] = [];
      const daEmpresa = docs.filter((d) => d.scope === 'Enterprise');
      if (daEmpresa.length) grupos.push({ scope: 'Enterprise', employeeCpf: null, employeeName: null, documents: daEmpresa.map(doc) });
      const pessoas = new Map<string, EnvioMock[]>();
      for (const d of docs.filter((x) => x.scope === 'Employee')) {
        const chave = `${d.employeeName ?? ''}|${d.employeeCpf ?? ''}`;
        pessoas.set(chave, [...(pessoas.get(chave) ?? []), d]);
      }
      for (const lista of pessoas.values()) {
        const primeiro = lista[0];
        if (primeiro) grupos.push({ scope: 'Employee', employeeCpf: primeiro.employeeCpf, employeeName: primeiro.employeeName, documents: lista.map(doc) });
      }
      return HttpResponse.json(grupos);
    }),
  ),

  // 6.2 Link de visualização (vale 5 minutos)
  rest.get(
    `${API}/enterprises/:enterpriseId/archive/documents/:documentSubmissionId/view-url`,
    comCenario(({ params }) => {
      const id = param(params, 'enterpriseId');
      const docId = param(params, 'documentSubmissionId');
      if (!ehGuid(id) || !ehGuid(docId)) return naoEncontradoSemCorpo();
      const envio = db.envios.find((e) => e.documentSubmissionId === docId && e.enterpriseId === id);
      if (!envio) return problema('DOCUMENT_NOT_FOUND');
      if (envio.purged) return problema('DOCUMENT_PURGED');
      const expira = new Date(Date.now() + 5 * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
      return HttpResponse.json({ url: `https://storage.mock.local/documentos/${docId}.pdf?X-Amz-Expires=300&X-Amz-Signature=mock`, expiresAt: expira });
    }),
  ),

  // 6.3 Download em lote (.zip)
  rest.post(
    `${API}/enterprises/:enterpriseId/archive/documents/batch-download`,
    comCenario(async ({ request, params }) => {
      const id = param(params, 'enterpriseId');
      if (!ehGuid(id)) return naoEncontradoSemCorpo();
      const corpo = await lerCorpo(request);
      if (!corpo.ok) return corpo.resposta;
      const ids = (objeto(corpo.valor) ?? {}).documentSubmissionIds;
      if (!Array.isArray(ids)) return validacao({ DocumentSubmissionIds: ['The DocumentSubmissionIds field is required.'] });
      const invalidos: Record<string, string[]> = {};
      ids.forEach((v: unknown, i) => {
        if (!ehGuid(v)) invalidos[`$.documentSubmissionIds[${i}]`] = ['The JSON value could not be converted to System.Guid.'];
      });
      if (Object.keys(invalidos).length) return validacao(invalidos);
      const unicos = [...new Set(ids.filter(ehGuid))];
      if (unicos.length === 0) return problema('EMPTY_BATCH');
      if (unicos.length > 50) return problema('BATCH_TOO_LARGE');
      const envios = unicos.map((d) => db.envios.find((e) => e.documentSubmissionId === d && e.enterpriseId === id));
      if (envios.some((e) => !e)) return problema('DOCUMENT_NOT_FOUND');
      const presentes = envios.filter((e): e is EnvioMock => e !== undefined);
      const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const arquivos = presentes
        .filter((e) => !e.purged)
        .map((e) => ({ nome: `${slug(e.documentDefinitionName)}-${e.documentSubmissionId}.pdf`, conteudo: `Arquivo de demonstração do envio ${e.documentSubmissionId}.` }));
      const expurgados = presentes.filter((e) => e.purged);
      if (expurgados.length) {
        arquivos.push({
          nome: 'manifesto.txt',
          conteudo: ['Documentos que não entraram (arquivo expurgado):', ...expurgados.map((e) => `- ${e.documentDefinitionName} (${e.documentSubmissionId})`)].join('\n'),
        });
      }
      return new HttpResponse(montarZip(arquivos), {
        headers: { 'Content-Type': 'application/zip', 'Content-Disposition': "attachment; filename=documentos.zip; filename*=UTF-8''documentos.zip" },
      });
    }),
  ),

  // 7.1 Painel de pendências
  rest.get(
    `${API}/pending-panel`,
    comCenario(() => {
      const linhas = db.empresas.flatMap((e) => {
        const exigencias = exigenciasDaEmpresa(e.enterpriseId);
        const conta = { pendingCount: 0, upcomingCount: 0, expiredCount: 0, postponedCount: 0 };
        for (const x of exigencias) {
          if (x.envioId && db.postergacoes.has(x.envioId)) conta.postponedCount += 1;
          else if (x.situacao === 'pendente') conta.pendingCount += 1;
          else if (x.situacao === 'aVencer') conta.upcomingCount += 1;
          else if (x.situacao === 'vencida') conta.expiredCount += 1;
        }
        const total = conta.pendingCount + conta.upcomingCount + conta.expiredCount + conta.postponedCount;
        return total > 0 ? [{ enterpriseId: e.enterpriseId, enterpriseName: e.enterpriseName, ...conta }] : [];
      });
      return HttpResponse.json(linhas.sort((a, b) => porNome(a.enterpriseName, b.enterpriseName)));
    }),
  ),

  // 7.2 Postergar
  rest.post(
    `${API}/pending-panel/requirements/:documentSubmissionId/postpone`,
    comCenario(async ({ request, params }) => {
      const docId = param(params, 'documentSubmissionId');
      if (!ehGuid(docId)) return naoEncontradoSemCorpo();
      const corpo = await lerCorpo(request);
      if (!corpo.ok) return corpo.resposta;
      const b = objeto(corpo.valor) ?? {};
      const erros: Record<string, string[]> = {};
      const deadline = b.deadlineAt;
      if (typeof deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(deadline) || Number.isNaN(Date.parse(`${deadline}T00:00:00Z`))) {
        erros.DeadlineAt = ['The DeadlineAt field must be a date in the format YYYY-MM-DD.'];
      }
      if (b.reason !== undefined && b.reason !== null && (typeof b.reason !== 'string' || b.reason.length > 500)) {
        erros.Reason = ['The field Reason must be a string with a maximum length of 500.'];
      }
      if (Object.keys(erros).length || typeof deadline !== 'string') return validacao(erros);
      const envio = db.envios.find((e) => e.documentSubmissionId === docId && e.scope === 'Enterprise');
      if (!envio) return problema('REQUIREMENT_NOT_FOUND');
      if (deadline <= HOJE_MOCK) return problema('POSTPONEMENT_DEADLINE_IN_PAST');
      if (db.postergacoes.has(docId)) return problema('REQUIREMENT_ALREADY_POSTPONED');
      const vencida = envio.expiresAt !== null && envio.expiresAt.slice(0, 10) < HOJE_MOCK;
      if (envio.status === 'Approved' && !vencida) return problema('REQUIREMENT_NOT_POSTPONABLE');
      db.postergacoes.set(docId, { deadlineAt: deadline, reason: typeof b.reason === 'string' ? b.reason : undefined });
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  // 7.3 Cancelar postergação
  rest.post(
    `${API}/pending-panel/requirements/:documentSubmissionId/cancel-postponement`,
    comCenario(({ params }) => {
      const docId = param(params, 'documentSubmissionId');
      if (!ehGuid(docId)) return naoEncontradoSemCorpo();
      if (!db.envios.some((e) => e.documentSubmissionId === docId && e.scope === 'Enterprise')) return problema('REQUIREMENT_NOT_FOUND');
      if (!db.postergacoes.delete(docId)) return problema('REQUIREMENT_NOT_POSTPONED');
      return new HttpResponse(null, { status: 204 });
    }),
  ),
];
