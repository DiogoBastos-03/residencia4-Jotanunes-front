import { alcanceDaLista, composicaoLista, fornecedoresDaObra, listasDaObra, obrasDaLista, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import { itensDaLista } from '../lib';
import type { DetalheLista } from '../types';

function carregar(ds: Dataset, id: string): DetalheLista | null {
  const lista = ds.listas.find((l) => l.id === id);
  if (!lista) return null;
  const vinculadas = obrasDaLista(ds, id);
  const doTipo = (obraId: string) => fornecedoresDaObra(ds, obraId).filter((f) => f.tipo === lista.tipo).length;
  return {
    lista,
    composicao: composicaoLista(lista),
    obras: vinculadas.length,
    alcance: alcanceDaLista(ds, id),
    itens: itensDaLista(ds, lista),
    obrasVinculadas: vinculadas.map((obra) => ({ obra, unica: listasDaObra(ds, obra.id).length <= 1, fornecedoresDoTipo: doTipo(obra.id) })),
    obrasParaVincular: ds.obras.map((obra) => ({ obra, jaVinculada: vinculadas.includes(obra), fornecedoresDoTipo: doTipo(obra.id) })),
  };
}

/** Configuração de uma lista de exigências. `null` se não existe. */
export function useLista(id: string) {
  const ds = useStore(datasetStore);
  return useMockQuery(`lista-${id}`, () => carregar(ds, id), { version: ds });
}
