import { alcanceDaLista, composicaoLista, obrasDaLista, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { LinhaLista } from '../types';

export function carregarListas(ds: Dataset): LinhaLista[] {
  return ds.listas.map((lista) => ({
    lista,
    composicao: composicaoLista(lista),
    obras: obrasDaLista(ds, lista.id).length,
    alcance: alcanceDaLista(ds, lista.id),
  }));
}

/** Listas de exigências com composição e em quantas obras valem. */
export function useListas() {
  const ds = useStore(datasetStore);
  return useMockQuery('listas', () => carregarListas(ds), { version: ds, empty: [] });
}
