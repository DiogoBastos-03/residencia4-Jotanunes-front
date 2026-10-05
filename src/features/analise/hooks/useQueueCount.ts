import { montarFila } from '@/entities';
import { useDatasetQuery } from '@/mocks';

/** Contador da sidebar. Não obedece aos estados simulados da página. */
export function useQueueCount() {
  return useDatasetQuery('fila-contagem', (ds) => montarFila(ds).length, { simulate: false });
}
