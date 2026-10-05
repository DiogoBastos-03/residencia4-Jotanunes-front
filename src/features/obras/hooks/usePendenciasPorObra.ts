import { pendenciasDaObra, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { PendenciasPorObra } from '../types';

function carregar(ds: Dataset): PendenciasPorObra[] {
  return ds.obras
    .map((obra) => {
      const grupos = pendenciasDaObra(ds, obra.id);
      return { obra, total: grupos.reduce((t, g) => t + g.pendencias.length, 0), fornecedores: grupos.length };
    })
    .filter((linha) => linha.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** Pendências abertas em cada obra, da maior para a menor. */
export function usePendenciasPorObra() {
  const ds = useStore(datasetStore);
  return useMockQuery('pendencias-por-obra', () => carregar(ds), { version: ds, empty: [] });
}
