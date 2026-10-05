import { vencidosRecentes, vencimentosProximos } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { Vencimentos } from '../types';

/** Documentos aprovados que vencem em 30 dias e os que venceram há pouco. */
export function useVencimentos() {
  const ds = useStore(datasetStore);
  return useMockQuery<Vencimentos>(
    'vencimentos',
    () => ({ proximos: vencimentosProximos(ds), vencidos: vencidosRecentes(ds) }),
    { version: ds, empty: { proximos: [], vencidos: [] } },
  );
}
