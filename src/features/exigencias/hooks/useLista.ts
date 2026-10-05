import { alcanceDaLista, forneceTipo, composicaoLista, fornecedoresDaObra, listasDaObra, obrasDaLista, type Dataset } from '@/entities';
import { useDatasetQuery } from '@/mocks';
import { itensDaLista } from '../lib';
import type { DetalheLista } from '../types';

function carregar(ds: Dataset, id: string): DetalheLista | null {
  const lista = ds.listas.find((l) => l.id === id);
  if (!lista) return null;
  const vinculadas = obrasDaLista(ds, id);
  const doTipo = (obraId: string) => fornecedoresDaObra(ds, obraId).filter((f) => forneceTipo(f, lista.tipo)).length;
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
  return useDatasetQuery(`lista-${id}`, (ds) => carregar(ds, id));
}
