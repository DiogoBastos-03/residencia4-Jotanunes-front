import { ApiError } from './apiError';

const BASE_URL = '/api';

type ValorQuery = string | number | boolean | readonly string[] | undefined;

type Opcoes = {
  query?: Record<string, ValorQuery>;
  body?: unknown;
  signal?: AbortSignal;
};

function montarUrl(caminho: string, query: Opcoes['query']): string {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor === undefined) continue;
    // Listas viram parâmetro repetido: ?constructionIds=a&constructionIds=b
    if (Array.isArray(valor)) valor.forEach((v: string) => params.append(chave, v));
    else params.append(chave, String(valor));
  }
  const qs = params.toString();
  return `${BASE_URL}${caminho}${qs ? `?${qs}` : ''}`;
}

async function lerCorpo(resposta: Response): Promise<unknown> {
  if (resposta.status === 204) return undefined;
  const tipo = resposta.headers.get('content-type') ?? '';
  if (!tipo.includes('json')) return undefined;
  const texto = await resposta.text();
  return texto ? JSON.parse(texto) : undefined;
}

/**
 * Chamada à API pelo proxy do Vite (/api → back). Devolve o corpo como `unknown`
 * — quem chama valida a forma (ver shared/lib/json.ts). 204 devolve undefined.
 * Qualquer status fora de 2xx vira ApiError, já traduzido.
 */
async function requisitar(metodo: string, caminho: string, opcoes: Opcoes = {}): Promise<unknown> {
  let resposta: Response;
  try {
    resposta = await fetch(montarUrl(caminho, opcoes.query), {
      method: metodo,
      headers: opcoes.body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
      signal: opcoes.signal,
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') throw erro;
    throw new ApiError(0);
  }
  let corpo: unknown;
  try {
    corpo = await lerCorpo(resposta);
  } catch {
    corpo = undefined;
  }
  if (!resposta.ok) throw ApiError.deResposta(resposta.status, corpo);
  return corpo;
}

export const http = {
  get: (caminho: string, opcoes?: Omit<Opcoes, 'body'>) => requisitar('GET', caminho, opcoes),
  post: (caminho: string, body: unknown, opcoes?: Omit<Opcoes, 'body'>) => requisitar('POST', caminho, { ...opcoes, body }),
  put: (caminho: string, body: unknown, opcoes?: Omit<Opcoes, 'body'>) => requisitar('PUT', caminho, { ...opcoes, body }),
  patch: (caminho: string, body: unknown, opcoes?: Omit<Opcoes, 'body'>) => requisitar('PATCH', caminho, { ...opcoes, body }),
};
