import { useEffect } from 'react';
import { useFornecedoresApi } from '@/features/fornecedores';
import { useObrasApi, useVinculosApi } from '@/features/obras';
import { datasetStore, estadoBaseStore, sincronizar } from '@/mocks';

/**
 * Liga a API ao dataset das telas. Lê, com TanStack Query, a base que a API tem
 * (fornecedores, obras e quem está em cada obra) e, a cada resposta nova, aplica-a sobre
 * o dataset em memória (`sincronizar`, função pura). As telas leem o dataset; as de
 * fornecedor também leem a API direto (detalhe e mutações).
 *
 * Depois de uma mutação, as queries invalidadas buscam de novo e este componente
 * reaplica a base — nunca se edita o cache à mão.
 */
export function SincronizarDemonstracao() {
  const fornecedores = useFornecedoresApi();
  const obras = useObrasApi();
  const vinculos = useVinculosApi(obras.data?.itens);

  const f = fornecedores.data;
  const o = obras.data;
  const v = vinculos.data;
  useEffect(() => {
    if (!f || !o || !v) return;
    datasetStore.set((ds) => sincronizar(ds, { fornecedores: f.itens, obras: o.itens, vinculos: v }));
    estadoBaseStore.set(() => ({ status: 'pronto', parcial: f.parcial }));
  }, [f, o, v]);

  // Falha só conta antes da primeira carga: depois dela, um refetch que falha mantém os dados.
  const queries = [fornecedores, obras, vinculos];
  const falha = queries.find((q) => q.error && q.data === undefined)?.error ?? null;
  const buscando = queries.some((q) => q.isFetching);
  const refetchFornecedores = fornecedores.refetch;
  const refetchObras = obras.refetch;
  const refetchVinculos = vinculos.refetch;
  const obrasCarregadas = o !== undefined;
  useEffect(() => {
    if (estadoBaseStore.get().status === 'pronto') return;
    if (falha && !buscando) {
      estadoBaseStore.set(() => ({
        status: 'erro',
        erro: falha,
        tentarDeNovo: () => {
          estadoBaseStore.set(() => ({ status: 'carregando' }));
          void refetchFornecedores();
          void refetchObras();
          if (obrasCarregadas) void refetchVinculos();
        },
      }));
    } else if (buscando) {
      estadoBaseStore.set((atual) => (atual.status === 'carregando' ? atual : { status: 'carregando' }));
    }
  }, [falha, buscando, refetchFornecedores, refetchObras, refetchVinculos, obrasCarregadas]);

  return null;
}
