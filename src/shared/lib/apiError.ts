import { strings } from '@/shared/strings';

const MENSAGENS: ReadonlyMap<string, string> = new Map(Object.entries(strings.api.erros));

/**
 * Erro devolvido pela API, já traduzido. Entende as duas formas de erro do back:
 * - ProblemDetails { type, title, status, code, traceId } → `code`
 * - ValidationProblemDetails { …, errors: { campo: string[] } } → `fieldErrors`
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  /** Campos recusados na validação (400), com o nome em camelCase como no corpo da requisição. */
  readonly fieldErrors: Readonly<Record<string, readonly string[]>> | undefined;

  constructor(status: number, code?: string, fieldErrors?: Record<string, string[]>) {
    super(mensagem(status, code, fieldErrors));
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** Monta o erro a partir do status e do corpo (já lido como JSON, ou undefined). */
  static deResposta(status: number, corpo: unknown): ApiError {
    if (typeof corpo !== 'object' || corpo === null) return new ApiError(status);
    const code = 'code' in corpo && typeof corpo.code === 'string' ? corpo.code : undefined;
    const errors = 'errors' in corpo ? lerErros(corpo.errors) : undefined;
    return new ApiError(status, code, errors);
  }
}

function mensagem(status: number, code: string | undefined, fieldErrors: Record<string, string[]> | undefined): string {
  const traduzida = code ? MENSAGENS.get(code) : undefined;
  if (traduzida) return traduzida;
  if (status === 400 && fieldErrors) return strings.api.validacao;
  // 500 com ProblemDetails é o back; 5xx sem corpo é o proxy sem a API do outro lado.
  if (status >= 500) return code ? strings.api.erros.INTERNAL_ERROR : strings.api.semResposta;
  if (status === 0) return strings.api.semResposta;
  return strings.api.generico(status);
}

/**
 * Normaliza as chaves de `errors`: o back usa o nome da propriedade em C# ("EnterpriseName")
 * ou o caminho do JSON ("$.enterpriseTypes[0]"). Aqui vira o nome do campo no corpo ("enterpriseName").
 */
function lerErros(valor: unknown): Record<string, string[]> | undefined {
  if (typeof valor !== 'object' || valor === null) return undefined;
  const erros: Record<string, string[]> = {};
  for (const [chave, mensagens] of Object.entries(valor)) {
    const nome = chave.replace(/^\$\.?/, '').split(/[.[]/)[0] ?? '';
    const campo = nome ? nome.charAt(0).toLowerCase() + nome.slice(1) : '';
    const lista = Array.isArray(mensagens) ? mensagens.filter((m): m is string => typeof m === 'string') : [];
    erros[campo] = [...(erros[campo] ?? []), ...lista];
  }
  return erros;
}
