import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, buscarTodasAsPaginas, queryKeys } from '@/shared/api';
import { fornecedorApi } from '../fornecedor/api';
import { obraApi } from './api';
import type { ObraResumo } from './model';

const TODAS = { todas: true } as const;

/** Todas as obras (GET /constructions, página a página, até 200). Só id e nome. */
export function useObrasApi() {
  return useQuery({
    queryKey: queryKeys.obras.lista(TODAS),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => obraApi.listar({ pagina, porPagina }, signal)),
  });
}

/** Obras de um fornecedor (GET /constructions?enterpriseId=). */
export function useObrasDoFornecedor(fornecedorId: string) {
  return useQuery({
    queryKey: queryKeys.obras.lista({ fornecedorId }),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => obraApi.listar({ fornecedorId, pagina, porPagina }, signal)),
  });
}

export type VinculoApi = { fornecedorId: string; obraId: string };

/**
 * Quem está em cada obra, para as contagens das listas. A API não tem rota de vínculo:
 * ele sai do filtro GET /enterprises?constructionIds=<obra>, uma chamada por obra (em paralelo).
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

/**
 * Vínculo e desvínculo mudam: os fornecedores da obra, as obras do fornecedor e as contagens
 * (filtro por obra da listagem de empresas). Invalida as duas famílias; nada é editado no cache à mão.
 */
function useInvalidarVinculos() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.fornecedores.todos }),
      queryClient.invalidateQueries({ queryKey: queryKeys.obras.todos }),
    ]);
}

/**
 * Erro que mostra que a tela estava desatualizada (outra pessoa vinculou, desvinculou, bloqueou ou
 * apagou): busca de novo, para a lista não continuar mentindo.
 */
const estadoMudou = (e: unknown) =>
  e instanceof ApiError &&
  (e.code === 'ENTERPRISE_ALREADY_IN_CONSTRUCTION' ||
    e.code === 'ENTERPRISE_NOT_IN_CONSTRUCTION' ||
    e.code === 'ENTERPRISE_INACTIVE' ||
    e.code === 'ENTERPRISE_NOT_FOUND' ||
    e.code === 'CONSTRUCTION_NOT_FOUND');

/** POST …/construction/constructions/{obraId}/enterprises { enterpriseId, limitExpiresDays }. */
export function useVincularFornecedor() {
  const invalidar = useInvalidarVinculos();
  return useMutation({
    mutationFn: ({ obraId, fornecedorId, prazoDias }: { obraId: string; fornecedorId: string; prazoDias: number }) =>
      obraApi.vincularFornecedor(obraId, { fornecedorId, prazoDias }),
    onSuccess: () => invalidar(),
    onError: (e) => (estadoMudou(e) ? invalidar() : undefined),
  });
}

/** DELETE …/construction/constructions/{obraId}/enterprises/{fornecedorId}. */
export function useDesvincularFornecedor() {
  const invalidar = useInvalidarVinculos();
  return useMutation({
    mutationFn: ({ obraId, fornecedorId }: { obraId: string; fornecedorId: string }) => obraApi.desvincularFornecedor(obraId, fornecedorId),
    onSuccess: () => invalidar(),
    onError: (e) => (estadoMudou(e) ? invalidar() : undefined),
  });
}
