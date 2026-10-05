import { alcanceDaLista, composicaoLista, obrasDaLista, type Dataset } from '@/entities';
import { useDatasetQuery } from '@/mocks';
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
  return useDatasetQuery('listas', (ds) => carregarListas(ds), { empty: [] });
}
