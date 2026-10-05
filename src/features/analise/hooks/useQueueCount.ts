import { montarFila } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';

/** Contador da sidebar. Não obedece aos estados simulados da página. */
export function useQueueCount() {
  const ds = useStore(datasetStore);
  return useMockQuery('fila-contagem', () => montarFila(ds).length, { simulate: false, version: ds });
}
