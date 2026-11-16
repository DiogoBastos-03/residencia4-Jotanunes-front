import { useQuery } from '@tanstack/react-query';
import { fornecedorApi, type FornecedorCadastro } from '@/entities/fornecedor';
import { buscarTodasAsPaginas, queryKeys } from '@/shared/api';

/** A listagem completa (todas as páginas). Filtros e busca são aplicados no front. */
const TODAS = { todas: true } as const;

/**
 * Todos os fornecedores da API (GET /enterprises, página a página, até 200).
 * É a base da tela de fornecedores e da demonstração gerada sobre ela.
 */
export function useFornecedoresApi() {
  return useQuery({
    queryKey: queryKeys.fornecedores.lista(TODAS),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => fornecedorApi.listar({ pagina, porPagina }, signal)),
  });
}

/** Lista parcial: a API tem mais de 200 fornecedores e a busca parou no teto. */
export function useListagemParcial(): { parcial: boolean; total: number; carregados: number } {
  const { data } = useFornecedoresApi();
  return { parcial: data?.parcial ?? false, total: data?.total ?? 0, carregados: data?.itens.length ?? 0 };
}

/** Detalhe de um fornecedor (GET /enterprises/{id}): telefone, e-mail e datas, que a listagem não traz. */
export function useFornecedorDetalhe(id: string) {
  return useQuery<FornecedorCadastro>({
    queryKey: queryKeys.fornecedores.detalhe(id),
    queryFn: ({ signal }) => fornecedorApi.detalhar(id, signal),
  });
}
