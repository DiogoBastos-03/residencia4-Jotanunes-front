import type { Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { TempoAnaliseLista } from '../types';

function carregar(ds: Dataset): TempoAnaliseLista[] {
  return ds.temposAnalise.flatMap((t) => {
    const lista = ds.listas.find((l) => l.id === t.listaId);
    return lista ? [{ ...t, lista }] : [];
  });
}

/** Tempo médio de análise por lista de exigências. */
export function useTemposAnalise() {
  const ds = useStore(datasetStore);
  return useMockQuery('tempos-analise', () => carregar(ds), { version: ds, empty: [] });
}
