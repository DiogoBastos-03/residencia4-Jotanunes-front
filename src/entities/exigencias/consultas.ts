import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, buscarTodasAsPaginas, queryKeys } from '@/shared/api';
import type { TipoFornecimento } from '../common';
import { listaApi, type ItemExigencia, type NovaListaApi } from './api';

/** Listagem com os filtros do back (tipo e nome), todas as páginas até 200. */
export function useListasApi(filtros: { tipo?: TipoFornecimento; nome?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.listas.lista(filtros),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => listaApi.listar({ ...filtros, pagina, porPagina }, signal)),
    // Ao trocar o filtro, a tabela atual fica até a nova chegar.
    placeholderData: keepPreviousData,
  });
}

export function useListaDetalhe(id: number) {
  return useQuery({ queryKey: queryKeys.listas.detalhe(id), queryFn: ({ signal }) => listaApi.detalhar(id, signal), enabled: Number.isInteger(id) && id > 0 });
}

export function useVersoesLista(id: number) {
  return useQuery({ queryKey: queryKeys.listas.versoes(id), queryFn: ({ signal }) => listaApi.versoes(id, signal), enabled: Number.isInteger(id) && id > 0 });
}

export function useListasDaObra(obraId: string) {
  return useQuery({ queryKey: queryKeys.listas.daObra(obraId), queryFn: ({ signal }) => listaApi.daObra(obraId, signal) });
}

/** Listas de várias obras de uma vez (para saber que tipos cada obra já tem). */
export function useListasDasObras(obraIds: readonly string[]) {
  return useQueries({
    queries: obraIds.map((obraId) => ({ queryKey: queryKeys.listas.daObra(obraId), queryFn: ({ signal }: { signal: AbortSignal }) => listaApi.daObra(obraId, signal) })),
  });
}

/**
 * Toda mudança de lista invalida a família ['listas']: listagem, ficha, versões e as listas das obras
 * (a obra passa a seguir a versão nova). A contagem de obras do fornecedor não muda.
 */
function useInvalidar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.listas.todos });
}

/** Erro que mostra que a tela estava desatualizada: busca de novo. */
const estadoMudou = (e: unknown) =>
  e instanceof ApiError && (e.code === 'WORKFLOW_NOT_FOUND' || e.code === 'WORKFLOW_ALREADY_IN_CONSTRUCTION' || e.code === 'CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE');

export function useCriarLista() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (nova: NovaListaApi) => listaApi.criar(nova), onSuccess: () => invalidar(), onError: (e) => (estadoMudou(e) ? invalidar() : undefined) });
}

export function useRenomearLista() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: ({ id, nome }: { id: number; nome: string }) => listaApi.renomear(id, nome), onSuccess: () => invalidar() });
}

export function useEditarExigencias() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, exigencias }: { id: number; exigencias: ItemExigencia[] }) => listaApi.editarExigencias(id, exigencias),
    onSuccess: () => invalidar(),
  });
}

export function useVincularListaAObra() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ obraId, listaId, prazoDias }: { obraId: string; listaId: number; prazoDias: number }) => listaApi.vincularAObra(obraId, listaId, prazoDias),
    onSuccess: () => invalidar(),
    onError: (e) => (estadoMudou(e) ? invalidar() : undefined),
  });
}
