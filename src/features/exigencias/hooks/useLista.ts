import { alcanceDaLista, composicaoLista, fornecedoresDaObra, obrasDaLista, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { DetalheLista } from '../types';

function carregar(ds: Dataset, id: string): DetalheLista | null {
  const lista = ds.listas.find((l) => l.id === id);
  if (!lista) return null;
  const obrasVinculadas = obrasDaLista(ds, id);
  return {
    lista,
    composicao: composicaoLista(lista),
    obras: obrasVinculadas.length,
    alcance: alcanceDaLista(ds, id),
    obrasVinculadas,
    obrasParaVincular: ds.obras.map((obra) => ({
      obra,
      jaVinculada: obrasVinculadas.includes(obra),
      fornecedoresDoTipo: fornecedoresDaObra(ds, obra.id).filter((f) => f.tipo === lista.tipo).length,
    })),
    tiposDocumento: ds.tiposDocumento,
  };
}

/** Configuração de uma lista de exigências. `null` se não existe. */
export function useLista(id: string) {
  const ds = useStore(datasetStore);
  return useMockQuery(`lista-${id}`, () => carregar(ds, id), { version: ds });
}
