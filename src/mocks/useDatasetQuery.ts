import type { Dataset } from '@/entities';
import { useMockQuery, useStore, type QueryResult } from '@/shared/lib';
import { datasetStore } from './store';

type Options<T> = { empty?: T; simulate?: boolean };

/**
 * Lê uma visão do dataset com o contrato { data, isLoading, error, refetch }.
 * Quando houver API, troca-se o corpo deste hook; as telas não mudam.
 */
export function useDatasetQuery<T>(key: string, selecionar: (ds: Dataset) => T, options: Options<T> = {}): QueryResult<T> {
  const ds = useStore(datasetStore);
  return useMockQuery(key, () => selecionar(ds), { ...options, version: ds });
}
