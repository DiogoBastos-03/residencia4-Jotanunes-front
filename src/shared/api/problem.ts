import { z } from 'zod';
import { strings } from '@/shared/strings';

/** Códigos de erro da seção 8 do contrato da API interna. */
export const CODIGOS_CONTRATO = [
  'ENTERPRISE_NOT_FOUND',
  'DOCUMENT_NOT_FOUND',
  'REQUIREMENT_NOT_FOUND',
  'CNPJ_ALREADY_REGISTERED',
  'DOCUMENT_PURGED',
  'INVALID_CNPJ',
  'INVALID_PHONE',
  'INVALID_EMAIL',
  'INVALID_ENTERPRISE_NAME',
  'ENTERPRISE_TYPE_REQUIRED',
  'INVALID_ENTERPRISE_TYPE',
  'INVALID_PAGE',
  'INVALID_PAGE_SIZE',
  'EMPTY_BATCH',
  'BATCH_TOO_LARGE',
  'REQUIREMENT_NOT_POSTPONABLE',
  'REQUIREMENT_ALREADY_POSTPONED',
  'POSTPONEMENT_DEADLINE_IN_PAST',
  'REQUIREMENT_NOT_POSTPONED',
  // Vínculo empresa ↔ obra (lido do código do back: AddEnterpriseToConstructionUseCase,
  // RemoveEnterpriseFromConstructionUseCase e WorkflowAssignmentServiceImpl).
  'CONSTRUCTION_NOT_FOUND',
  'ENTERPRISE_ALREADY_IN_CONSTRUCTION',
  'ENTERPRISE_INACTIVE',
  'ENTERPRISE_NOT_IN_CONSTRUCTION',
  'INVALID_LIMIT_EXPIRES_DAYS',
  // Listas de exigências (workflows), tipos de documento e formatos — módulo workflow do back.
  'WORKFLOW_NOT_FOUND',
  'WORKFLOW_WITHOUT_VERSION',
  'INVALID_WORKFLOW_TYPE',
  'INVALID_WORKFLOW_NAME',
  'REQUIREMENTS_REQUIRED',
  'INVALID_DOCUMENT_REQUIREMENT',
  'DUPLICATED_REQUIREMENT',
  'INVALID_DISPLAY_ORDER',
  'WORKFLOW_ALREADY_IN_CONSTRUCTION',
  'CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE',
  'DOCUMENT_DEFINITION_NOT_FOUND',
  'DOCUMENT_DEFINITION_NAME_ALREADY_EXISTS',
  'INVALID_DOCUMENT_DEFINITION_NAME',
  'INVALID_DOCUMENT_DEFINITION_DESCRIPTION',
  'INVALID_MAX_SIZE',
  'EXPIRATION_POLICY_REQUIRED',
  'FORMATS_REQUIRED',
  'DOCUMENT_FORMAT_NOT_FOUND',
  'INVALID_VALIDITY_DAYS',
  'INVALID_EXPIRATION_INPUT',
  'INTERNAL_ERROR',
] as const;

/**
 * Códigos criados pelo front:
 * - VALIDATION_ERROR: 400 de validação (nesta API o 400 vem sem `code` e com title em inglês);
 * - NETWORK_ERROR: falha de rede ou timeout (status 0);
 * - INVALID_RESPONSE: a resposta não bateu com o schema Zod do contrato.
 */
export const CODIGOS_FRONT = ['VALIDATION_ERROR', 'NETWORK_ERROR', 'INVALID_RESPONSE'] as const;

export type CodigoContrato = (typeof CODIGOS_CONTRATO)[number];
export type CodigoErro = CodigoContrato | (typeof CODIGOS_FRONT)[number];

/** O mapa de mensagens tem que cobrir todos os códigos — o compilador confere. */
const MENSAGENS: Readonly<Record<CodigoErro, string>> = strings.errosApi.porCodigo;

const CODIGOS: ReadonlySet<string> = new Set<string>([...CODIGOS_CONTRATO, ...CODIGOS_FRONT]);

function ehCodigo(valor: string | undefined): valor is CodigoErro {
  return valor !== undefined && CODIGOS.has(valor);
}

/** ProblemDetails do ASP.NET, lido com folga: qualquer campo pode faltar. */
const problemSchema = z.looseObject({
  title: z.string().optional(),
  status: z.number().optional(),
  code: z.string().optional(),
  traceId: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

type DadosErro = {
  status: number;
  code?: string;
  title: string;
  errors?: Readonly<Record<string, readonly string[]>>;
  traceId?: string;
};

/**
 * Todo erro que sai da camada de API. O corpo cru nunca sobe acima daqui:
 * quem chama decide pelo `code` e mostra `mensagem`.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Código do contrato, ou VALIDATION_ERROR / NETWORK_ERROR / INVALID_RESPONSE. Ausente em 404 sem corpo. */
  readonly code: string | undefined;
  /** Title do ProblemDetails (em português nos erros de negócio; em inglês no 400). */
  readonly title: string;
  /** Erros de validação do 400, por campo — chave como o back mandou ("Email", "$.enterpriseTypes[0]"). */
  readonly errors: Readonly<Record<string, readonly string[]>> | undefined;
  readonly traceId: string | undefined;

  constructor(dados: DadosErro) {
    super(dados.title);
    this.name = 'ApiError';
    this.status = dados.status;
    this.code = dados.code;
    this.title = dados.title;
    this.errors = dados.errors;
    this.traceId = dados.traceId;
  }

  /** Monta o erro a partir do status e do corpo já lido (JSON, ou undefined se não havia corpo). */
  static deResposta(status: number, corpo: unknown): ApiError {
    const lido = problemSchema.safeParse(corpo);
    const p = lido.success ? lido.data : {};
    const validacao = status === 400 && !p.code;
    return new ApiError({
      status,
      // 400 sem code → VALIDATION_ERROR; 5xx sem code → INTERNAL_ERROR (seção 2.1).
      code: p.code ?? (validacao ? 'VALIDATION_ERROR' : status >= 500 ? 'INTERNAL_ERROR' : undefined),
      title: p.title ?? `HTTP ${status}`,
      errors: p.errors,
      traceId: p.traceId,
    });
  }

  static deRede(motivo: 'falha' | 'timeout'): ApiError {
    return new ApiError({ status: 0, code: 'NETWORK_ERROR', title: motivo === 'timeout' ? 'Timeout' : 'Network error' });
  }

  static respostaInvalida(status: number, detalhe: string): ApiError {
    return new ApiError({ status, code: 'INVALID_RESPONSE', title: detalhe });
  }

  /** Mensagem em português para mostrar ao usuário. */
  get mensagem(): string {
    return ehCodigo(this.code) ? MENSAGENS[this.code] : strings.errosApi.generico(this.status);
  }

  /**
   * Erros de um campo do corpo, pelo nome em camelCase ("email", "enterpriseTypes").
   * Aceita as chaves como o ASP.NET manda: "Email" ou "$.enterpriseTypes[0]".
   */
  errosDoCampo(campo: string): readonly string[] {
    if (!this.errors) return [];
    return Object.entries(this.errors).flatMap(([chave, msgs]) => (normalizarCampo(chave) === campo ? msgs : []));
  }

  /** Campos (camelCase) com erro de validação. */
  get camposComErro(): string[] {
    return [...new Set(Object.keys(this.errors ?? {}).map(normalizarCampo))];
  }
}

function normalizarCampo(chave: string): string {
  const nome = chave.replace(/^\$\.?/, '').split(/[.[]/)[0] ?? '';
  return nome.charAt(0).toLowerCase() + nome.slice(1);
}

/** Mensagem para qualquer erro (ApiError ou não). */
export function mensagemDoErro(erro: unknown): string {
  return erro instanceof ApiError ? erro.mensagem : strings.errosApi.porCodigo.NETWORK_ERROR;
}
