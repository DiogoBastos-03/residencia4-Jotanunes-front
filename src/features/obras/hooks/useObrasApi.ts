import { useQuery } from '@tanstack/react-query';
import { fornecedorApi } from '@/entities/fornecedor';
import { obraApi, type ObraResumo } from '@/entities/obra';
import { buscarTodasAsPaginas, queryKeys } from '@/shared/api';

const TODAS = { todas: true } as const;

/** Todas as obras da API (GET /constructions, página a página, até 200). Só id e nome. */
export function useObrasApi() {
  return useQuery({
    queryKey: queryKeys.obras.lista(TODAS),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => obraApi.listar({ pagina, porPagina }, signal)),
  });
}

export type VinculoApi = { fornecedorId: string; obraId: string };

/**
 * Quem está em cada obra. A API não tem rota de vínculo: ele sai do filtro
 * GET /enterprises?constructionIds=<obra>, uma chamada por obra (em paralelo).
 */
export function useVinculosApi(obras: readonly ObraResumo[] | undefined) {
  const obraIds = obras?.map((o) => o.id) ?? [];
  return useQuery({
    queryKey: queryKeys.fornecedores.porObras(obraIds),
    enabled: obras !== undefined,
    queryFn: async ({ signal }): Promise<VinculoApi[]> => {
      const porObra = await Promise.all(
        obraIds.map(async (obraId) => {
          const r = await buscarTodasAsPaginas((pagina, porPagina) => fornecedorApi.listar({ obraIds: [obraId], pagina, porPagina }, signal));
          return r.itens.map((f) => ({ fornecedorId: f.id, obraId }));
        }),
      );
      return porObra.flat();
    },
  });
}
