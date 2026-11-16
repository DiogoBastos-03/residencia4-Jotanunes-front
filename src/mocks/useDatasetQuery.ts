import type { Dataset } from '@/entities';
import { useMockQuery, useStore, type QueryResult } from '@/shared/lib';
import { datasetStore, estadoBaseStore } from './store';

type Options<T> = { empty?: T; simulate?: boolean };

/**
 * Lê uma visão do dataset com o contrato { data, isLoading, error, refetch }.
 * Enquanto a base da API (fornecedores, obras, vínculos) não chegou, está carregando;
 * se ela falhou, devolve o erro com o "tentar de novo" da própria query. Depois disso,
 * é a leitura em memória de sempre — que continua obedecendo ao ?estado= da /_estados.
 */
export function useDatasetQuery<T>(key: string, selecionar: (ds: Dataset) => T, options: Options<T> = {}): QueryResult<T> {
  const ds = useStore(datasetStore);
  const base = useStore(estadoBaseStore);
  const leitura = useMockQuery(key, () => selecionar(ds), { ...options, version: ds });
  if (base.status === 'carregando') return { data: undefined, isLoading: true, error: null, refetch: leitura.refetch };
  if (base.status === 'erro') return { data: undefined, isLoading: false, error: base.erro, refetch: base.tentarDeNovo };
  return leitura;
}
