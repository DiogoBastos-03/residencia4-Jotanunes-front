import { PAGE_SIZE_MAX } from './schemas';

/** Até quantos itens uma listagem completa busca, página a página. */
export const TETO_LISTAGEM = 200;

export type ListagemCompleta<T> = {
  itens: T[];
  /** totalCount informado pela API. */
  total: number;
  /** true quando o total passou do teto e a busca parou antes do fim. */
  parcial: boolean;
};

/**
 * Busca todas as páginas de uma listagem, em sequência, com pageSize 50, até o totalCount.
 * Para em TETO_LISTAGEM itens e marca o resultado como parcial.
 *
 * Por que trazer tudo: a API ainda não tem busca por texto, então filtro e busca são feitos
 * no front sobre a lista inteira. Quando o back expuser o parâmetro de busca, a listagem passa
 * a ser paginada no servidor e este teto deixa de ser necessário.
 */
export async function buscarTodasAsPaginas<T>(
  buscarPagina: (pagina: number, porPagina: number) => Promise<{ itens: T[]; total: number }>,
): Promise<ListagemCompleta<T>> {
  const itens: T[] = [];
  let total = 0;
  for (let pagina = 1; ; pagina++) {
    const p = await buscarPagina(pagina, PAGE_SIZE_MAX);
    total = p.total;
    itens.push(...p.itens);
    if (p.itens.length === 0 || itens.length >= total || itens.length >= TETO_LISTAGEM) break;
  }
  return { itens: itens.slice(0, TETO_LISTAGEM), total, parcial: total > Math.min(itens.length, TETO_LISTAGEM) };
}
