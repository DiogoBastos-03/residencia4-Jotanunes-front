import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buscarTodasAsPaginas, queryKeys } from '@/shared/api';
import { tipoDocumentoApi } from './api';
import type { DadosDefinicao } from './mapper';
import type { DefinicaoDocumento } from './model';

/** Formatos aceitos (ativos). Mudam pouco: ficam 5 min sem buscar de novo. */
export function useFormatosApi() {
  return useQuery({ queryKey: queryKeys.formatos(), queryFn: ({ signal }) => tipoDocumentoApi.listarFormatos(signal), staleTime: 5 * 60_000 });
}

/** Todos os tipos de documento (página a página, até 200). A busca por nome da tela é no cliente. */
export function useDefinicoesApi() {
  return useQuery({
    queryKey: queryKeys.tiposDocumento.lista(),
    queryFn: ({ signal }) => buscarTodasAsPaginas((pagina, porPagina) => tipoDocumentoApi.listar({ pagina, porPagina }, signal)),
  });
}

export function useDefinicaoDetalhe(id: string | null) {
  return useQuery({
    queryKey: queryKeys.tiposDocumento.detalhe(id ?? ''),
    queryFn: ({ signal }) => tipoDocumentoApi.detalhar(id ?? '', signal),
    enabled: id !== null,
  });
}

function useInvalidar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.tiposDocumento.todos });
}

export function useCriarDefinicao() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (dados: DadosDefinicao) => tipoDocumentoApi.criar(dados), onSuccess: () => invalidar() });
}

export function useEditarDefinicao() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ atual, dados }: { atual: DefinicaoDocumento; dados: DadosDefinicao }) => tipoDocumentoApi.editar(atual, dados),
    onSuccess: (mudou) => (mudou ? invalidar() : undefined),
  });
}
