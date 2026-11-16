import { http as rest, HttpResponse, type HttpResponseResolver } from 'msw';
import { CODIGOS_CONTRATO, PAGE_SIZE_MAX, PREFIXO, type CodigoContrato } from '@/shared/api';
import { cnpjValido, telefoneValido } from '@/shared/lib';
import { env } from '@/shared/config/env';
import { db, exigenciasDaEmpresa, guidDe, HOJE_MOCK, type EmpresaMock, type EnvioMock } from './dados';
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

export const handlers = [
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
