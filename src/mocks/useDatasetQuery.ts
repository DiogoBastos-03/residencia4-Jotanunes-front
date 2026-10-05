import type { Dataset } from '@/entities';
import { useMockQuery, useQuery, useStore, USAR_API, type QueryResult } from '@/shared/lib';
import { garantirDataset } from './hidratacao';
import { datasetStore } from './store';

type Options<T> = { empty?: T; simulate?: boolean };

/**
 * Lê uma visão do dataset com o contrato { data, isLoading, error, refetch }.
 * Com a API, espera a hidratação (carregando → esqueleto; falha → erro com "tentar de novo");
 * sem a API, é o mock de sempre. As telas não sabem de onde o dado veio.
 * A escolha é fixa no build (VITE_USE_API), então a ordem dos hooks nunca muda.
 */
export const useDatasetQuery: <T>(key: string, selecionar: (ds: Dataset) => T, options?: Options<T>) => QueryResult<T> = USAR_API
  ? function useDatasetDaApi(key, selecionar, options = {}) {
      const ds = useStore(datasetStore);
      return useQuery(
        key,
        async () => {
          await garantirDataset();
          return selecionar(datasetStore.get());
        },
        { ...options, version: ds },
      );
    }
  : function useDatasetDoMock(key, selecionar, options = {}) {
      const ds = useStore(datasetStore);
      return useMockQuery(key, () => selecionar(ds), { ...options, version: ds });
    };
