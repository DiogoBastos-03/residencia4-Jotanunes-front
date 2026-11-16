import { useQuery } from '@tanstack/react-query';
import { buscarTodasAsPaginas, queryKeys } from '@/shared/api';
import { fornecedorApi } from './api';
import type { FornecedorCadastro } from './model';

/** A listagem completa (todas as páginas). Busca e filtros são aplicados no front. */
const TODAS = { todas: true } as const;

/** Todos os fornecedores (GET /enterprises, página a página, até 200). */
export function useFornecedoresApi() {
  return useQuery({
    queryKey: queryKeys.fornecedores.lista(TODAS),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => fornecedorApi.listar({ pagina, porPagina }, signal)),
  });
}

/** Detalhe (GET /enterprises/{id}): telefone, e-mail e datas, que a listagem não traz. */
export function useFornecedorDetalhe(id: string) {
  return useQuery<FornecedorCadastro>({
    queryKey: queryKeys.fornecedores.detalhe(id),
    queryFn: ({ signal }) => fornecedorApi.detalhar(id, signal),
  });
}

/** Fornecedores de uma obra (GET /enterprises?constructionIds=<obra>). */
export function useFornecedoresDaObra(obraId: string) {
  return useQuery({
    queryKey: queryKeys.fornecedores.lista({ obraIds: [obraId] }),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => fornecedorApi.listar({ obraIds: [obraId], pagina, porPagina }, signal)),
  });
}
