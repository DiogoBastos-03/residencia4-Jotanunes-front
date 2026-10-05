import {
  forneceTipo,
  alcanceNaObra,
  composicaoLista,
  fornecedoresDaObra,
  listasAplicaveisNaObra,
  listasDaObra,
  pendenciasDaObra,
  resolverEvento,
  resumoFornecedor,
  type Dataset,
  type ListaExigencias,
  type TipoFornecimento,
} from '@/entities';
import { useDatasetQuery } from '@/mocks';
import type { FichaObra } from '../types';

function documentosDoTipo(listas: ListaExigencias[], tipo: TipoFornecimento): string[] {
  return [
    ...new Set(
      listas.filter((l) => l.tipo === tipo).flatMap((l) => l.itens.map((i) => i.tipoDocumentoId)),
    ),
  ];
}

function carregar(ds: Dataset, id: string): FichaObra | null {
  const obra = ds.obras.find((o) => o.id === id);
  if (!obra) return null;
  const listas = listasDaObra(ds, id);
  const fornecedores = fornecedoresDaObra(ds, id);
  const pendencias = pendenciasDaObra(ds, id);

  return {
    obra,
    listas: listas.map((lista) => {
      const alcance = alcanceNaObra(ds, lista.id, id);
      return {
        lista,
        composicao: composicaoLista(lista),
        vinculadaEm: ds.obraListas.find((ol) => ol.obraId === id && ol.listaId === lista.id)?.vinculadaEm ?? obra.recebidaEm ?? ds.hoje,
        aplicaA: alcance.aplica,
        fornecedoresNaObra: alcance.total,
      };
    }),
    fornecedores: fornecedores.flatMap((fornecedor) => {
      const vinculo = ds.vinculos.find((v) => v.obraId === id && v.fornecedorId === fornecedor.id);
      return vinculo
        ? [
            {
              fornecedor,
              vinculo,
              listasAplicaveis: listasAplicaveisNaObra(ds, fornecedor.id, id).length,
              listasNaObra: listas.length,
              resumo: resumoFornecedor(ds, fornecedor.id),
            },
          ]
        : [];
    }),
    pendencias,
    totalPendencias: pendencias.reduce((t, g) => t + g.pendencias.length, 0),
    historico: ds.eventos
      .filter((e) => e.obraId === id)
      .sort((a, b) => b.quando.localeCompare(a.quando))
      .map((e) => resolverEvento(ds, e)),
    listasDisponiveis: ds.listas
      .filter((l) => l.situacao === 'ativo' && !listas.includes(l))
      .map((lista) => ({ lista, composicao: composicaoLista(lista) })),
    fornecedoresDisponiveis: ds.fornecedores.filter((f) => !fornecedores.includes(f)),
    fornecedoresPorTipo: {
      servico: fornecedores.filter((f) => forneceTipo(f, 'servico')).length,
      material: fornecedores.filter((f) => forneceTipo(f, 'material')).length,
    },
    documentosExigidosPorTipo: { servico: documentosDoTipo(listas, 'servico'), material: documentosDoTipo(listas, 'material') },
  };
}

/** Ficha completa de uma obra. `null` se não existe. */
export function useObra(id: string) {
  return useDatasetQuery(`obra-${id}`, (ds) => carregar(ds, id));
}
