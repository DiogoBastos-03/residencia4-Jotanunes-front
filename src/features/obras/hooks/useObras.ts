import { fornecedoresDaObra, funcionariosEmCampoNaObra, listasDaObra, totalPendenciasDaObra, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { LinhaObra } from '../types';

export function carregarObras(ds: Dataset): LinhaObra[] {
  return ds.obras.map((obra) => ({
    obra,
    listas: listasDaObra(ds, obra.id).length,
    fornecedores: fornecedoresDaObra(ds, obra.id).length,
    funcionarios: funcionariosEmCampoNaObra(ds, obra.id),
    pendencias: totalPendenciasDaObra(ds, obra.id),
  }));
}

/** Obras recebidas da integração, com as contagens de cada uma. */
export function useObras() {
  const ds = useStore(datasetStore);
  return useMockQuery('obras', () => carregarObras(ds), { version: ds, empty: [] });
}
