import type { Dataset } from '@/entities';
import { useMockQuery, useStore, type QueryResult } from '@/shared/lib';
import { datasetStore } from './store';

type Options<T> = { empty?: T; simulate?: boolean };

/** FORA DE USO pelas telas em uso. Lê uma visão do dataset em memória (ver ./store.ts). */
export function useDatasetQuery<T>(key: string, selecionar: (ds: Dataset) => T, options: Options<T> = {}): QueryResult<T> {
  const ds = useStore(datasetStore);
  return useMockQuery(key, () => selecionar(ds), { ...options, version: ds });
}
