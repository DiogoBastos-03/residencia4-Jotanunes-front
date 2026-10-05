import { campo, listaDe, numero, objeto, type Leitor } from './json';

/** Página como o back devolve (PagedResult), já lida. */
export type Pagina<T> = { items: T[]; totalCount: number; page: number; pageSize: number };

/** Maior página que o back aceita (PageRequest.MAX_PAGE_SIZE). */
export const TAMANHO_MAXIMO_PAGINA = 50;

/**
 * Busca todas as páginas em sequência. As telas derivam tudo de um conjunto completo
 * de dados, e o back não tem busca por texto: filtro e busca no servidor entram
 * quando o back expuser — aí esta função deixa de ser usada pelas listagens.
 */
export async function buscarTodas<T>(buscarPagina: (page: number, pageSize: number) => Promise<Pagina<T>>): Promise<T[]> {
  const itens: T[] = [];
  let page = 1;
  for (;;) {
    const pagina = await buscarPagina(page, TAMANHO_MAXIMO_PAGINA);
    itens.push(...pagina.items);
    if (pagina.items.length === 0 || itens.length >= pagina.totalCount) return itens;
    page += 1;
  }
}

/** Lê o PagedResult<T> do back: { items, totalCount, page, pageSize }. */
export function lerPagina<T>(item: Leitor<T>): Leitor<Pagina<T>> {
  return (valor, caminho) => {
    const o = objeto(valor, caminho);
    return {
      items: campo(o, 'items', listaDe(item), caminho),
      totalCount: campo(o, 'totalCount', numero, caminho),
      page: campo(o, 'page', numero, caminho),
      pageSize: campo(o, 'pageSize', numero, caminho),
    };
  };
}
