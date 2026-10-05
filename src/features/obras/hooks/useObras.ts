import { fornecedoresDaObra, listasDaObra, totalPendenciasDaObra, type Dataset } from '@/entities';
import { useDatasetQuery } from '@/mocks';
import type { LinhaObra } from '../types';

export function carregarObras(ds: Dataset): LinhaObra[] {
  return ds.obras.map((obra) => ({
    obra,
    listas: listasDaObra(ds, obra.id).length,
    fornecedores: fornecedoresDaObra(ds, obra.id).length,
    pendencias: totalPendenciasDaObra(ds, obra.id),
  }));
}

/** Obras recebidas da integração, com as contagens de cada uma. */
export function useObras() {
  return useDatasetQuery('obras', (ds) => carregarObras(ds), { empty: [] });
}
