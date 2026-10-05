import { vencidosRecentes, vencimentosProximos } from '@/entities';
import { useDatasetQuery } from '@/mocks';
import type { Vencimentos } from '../types';

/** Documentos aprovados que vencem em 30 dias e os que venceram há pouco. */
export function useVencimentos() {
  return useDatasetQuery<Vencimentos>(
    'vencimentos',
    (ds) => ({ proximos: vencimentosProximos(ds), vencidos: vencidosRecentes(ds) }),
    { empty: { proximos: [], vencidos: [] } },
  );
}
