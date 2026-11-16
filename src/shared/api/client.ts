import type { z } from 'zod';
import { env } from '@/shared/config/env';
import { acompanharLentidao } from './lentidao';
import { ApiError } from './problem';

/** Timeout padrão. Alto de propósito: no plano Free do Render a 1ª chamada após um tempo parado leva até ~1 min. */
const TIMEOUT_MS = 65_000;

/** Prefixo das rotas de negócio (a /health fica fora). */
export const PREFIXO = '/api/v1/internal';

type ValorQuery = string | number | boolean | readonly string[] | undefined | null;

export type OpcoesRequisicao = {
  query?: Record<string, ValorQuery>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
};

// ——— Instrumentação (só para a rota de verificação /_api) ———

export type RespostaObservada = { metodo: string; url: string; status: number; corpo: unknown };
const observadores = new Set<(r: RespostaObservada) => void>();

/** Recebe cada resposta (status e corpo cru). Usado só pela /_api para mostrar o que veio da rede. */
export function observarRespostas(cb: (r: RespostaObservada) => void): () => void {
  observadores.add(cb);
  return () => observadores.delete(cb);
}

/**
 * Cenário de teste do MSW: força um `code` do contrato na próxima resposta (cabeçalho só lido
 * pelos handlers de src/mocks/api). Nunca é enviado para a API real.
 */
let cenarioMock: string | null = null;
export function definirCenarioMock(code: string | null): void {
  cenarioMock = env.apiMock ? code : null;
}

// ——— Núcleo ———

function montarUrl(caminho: string, query: OpcoesRequisicao['query']): string {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor === undefined || valor === null) continue;
    // Lista vira parâmetro repetido: ?constructionIds=a&constructionIds=b
    if (Array.isArray(valor)) valor.forEach((v: string) => params.append(chave, v));
    else params.append(chave, String(valor));
  }
  const qs = params.toString();
  return `${env.apiUrl}${caminho}${qs ? `?${qs}` : ''}`;
}

async function lerCorpo(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const texto = await res.text();
  if (!texto) return undefined;
  const tipo = res.headers.get('content-type') ?? '';
  if (!tipo.includes('json')) return texto;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

/** Faz a requisição. Status fora de 2xx vira ApiError; rede e timeout viram NETWORK_ERROR. Devolve a Response (corpo ainda não lido). */
async function requisitar(metodo: string, caminho: string, opcoes: OpcoesRequisicao = {}): Promise<Response> {
  const timeout = AbortSignal.timeout(opcoes.timeoutMs ?? TIMEOUT_MS);
  const signal = opcoes.signal ? AbortSignal.any([opcoes.signal, timeout]) : timeout;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json';
  if (cenarioMock) headers['X-Mock-Code'] = cenarioMock;
  const url = montarUrl(caminho, opcoes.query);

  let res: Response;
  const terminou = acompanharLentidao();
  try {
    res = await fetch(url, { method: metodo, headers, body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body), signal });
  } catch (erro) {
    // Cancelamento pedido por quem chamou (ex.: TanStack Query) segue como AbortError.
    if (opcoes.signal?.aborted) throw erro;
    throw ApiError.deRede(timeout.aborted ? 'timeout' : 'falha');
  } finally {
    terminou();
  }
  if (!res.ok) {
    const corpo = await lerCorpo(res).catch(() => undefined);
    observadores.forEach((cb) => cb({ metodo, url, status: res.status, corpo }));
    throw ApiError.deResposta(res.status, corpo);
  }
  return res;
}

/** Valida o corpo com o schema; falha vira INVALID_RESPONSE dizendo o caminho do campo. */
function validar<S extends z.ZodType>(schema: S, corpo: unknown, status: number, rota: string): z.infer<S> {
  const r = schema.safeParse(corpo);
  if (r.success) return r.data;
  const detalhes = r.error.issues.slice(0, 3).map((i) => `${i.path.length ? i.path.join('.') : '(raiz)'}: ${i.message}`);
  throw ApiError.respostaInvalida(status, `${rota} — ${detalhes.join('; ')}`);
}

export const http = {
  /** Resposta JSON, validada pelo schema. */
  async json<S extends z.ZodType>(metodo: string, caminho: string, schema: S, opcoes?: OpcoesRequisicao): Promise<z.infer<S>> {
    const res = await requisitar(metodo, caminho, opcoes);
    const corpo = await lerCorpo(res);
    observadores.forEach((cb) => cb({ metodo, url: res.url, status: res.status, corpo }));
    return validar(schema, corpo, res.status, `${metodo} ${caminho}`);
  },

  /** Resposta sem corpo (204). */
  async semCorpo(metodo: string, caminho: string, opcoes?: OpcoesRequisicao): Promise<void> {
    const res = await requisitar(metodo, caminho, opcoes);
    observadores.forEach((cb) => cb({ metodo, url: res.url, status: res.status, corpo: undefined }));
  },

  /** Resposta em texto puro (/health). */
  async texto(metodo: string, caminho: string, opcoes?: OpcoesRequisicao): Promise<string> {
    const res = await requisitar(metodo, caminho, opcoes);
    const corpo = await res.text();
    observadores.forEach((cb) => cb({ metodo, url: res.url, status: res.status, corpo }));
    return corpo;
  },

  /** Resposta binária, com o nome do arquivo lido do Content-Disposition. */
  async arquivo(metodo: string, caminho: string, nomePadrao: string, opcoes?: OpcoesRequisicao): Promise<{ blob: Blob; nomeArquivo: string }> {
    const res = await requisitar(metodo, caminho, opcoes);
    const blob = await res.blob();
    const nomeArquivo = nomeDoArquivo(res.headers.get('content-disposition')) ?? nomePadrao;
    observadores.forEach((cb) => cb({ metodo, url: res.url, status: res.status, corpo: { blob: `${blob.type} — ${blob.size} bytes`, nomeArquivo } }));
    return { blob, nomeArquivo };
  },
};

/** filename*=UTF-8''nome tem preferência sobre filename=nome. */
export function nomeDoArquivo(disposition: string | null): string | null {
  if (!disposition) return null;
  const estendido = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition)?.[1];
  if (estendido) {
    try {
      return decodeURIComponent(estendido.trim());
    } catch {
      return estendido.trim();
    }
  }
  return /filename\s*=\s*"?([^";]+)"?/i.exec(disposition)?.[1]?.trim() ?? null;
}
