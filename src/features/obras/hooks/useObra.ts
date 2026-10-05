import {
  alcanceNaObra,
  composicaoLista,
  documentosDaPessoa,
  fornecedoresDaObra,
  funcionariosEmCampoNaObra,
  listasAplicaveisNaObra,
  listasDaObra,
  pendenciasDaObra,
  resolverEvento,
  resumoFornecedor,
  type Dataset,
  type ListaExigencias,
  type TipoFornecimento,
} from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { FichaObra } from '../types';

function documentosDoTipo(listas: ListaExigencias[], tipo: TipoFornecimento): string[] {
  return [
    ...new Set(
      listas.filter((l) => l.tipo === tipo).flatMap((l) => l.itens.flatMap((i) => (i.kind === 'documento' ? [i.tipoDocumentoId] : []))),
    ),
  ];
}

function carregar(ds: Dataset, id: string): FichaObra | null {
  const obra = ds.obras.find((o) => o.id === id);
  if (!obra) return null;
  const listas = listasDaObra(ds, id);
  const fornecedores = fornecedoresDaObra(ds, id);
  const pendencias = pendenciasDaObra(ds, id);
  const remessa = ds.remessas.filter((r) => r.obraId === id).sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))[0];
  const fornecedorRemessa = remessa ? ds.fornecedores.find((f) => f.id === remessa.fornecedorId) : undefined;

  return {
    obra,
    listas: listas.map((lista) => {
      const alcance = alcanceNaObra(ds, lista.id, id);
      return {
        lista,
        composicao: composicaoLista(lista),
        vinculadaEm: ds.obraListas.find((ol) => ol.obraId === id && ol.listaId === lista.id)?.vinculadaEm ?? obra.recebidaEm,
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
    funcionariosEmCampo: funcionariosEmCampoNaObra(ds, id),
    remessaRecente:
      remessa && fornecedorRemessa
        ? {
            fornecedor: fornecedorRemessa,
            pessoas: ds.funcionarios
              .filter((f) => f.remessaId === remessa.id)
              .map((funcionario) => ({ funcionario, ...documentosDaPessoa(ds, funcionario) })),
          }
        : null,
    temItemFuncionarios: listas.some((l) => l.itens.some((i) => i.kind === 'funcionarios')),
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
      servico: fornecedores.filter((f) => f.tipo === 'servico').length,
      material: fornecedores.filter((f) => f.tipo === 'material').length,
    },
    documentosExigidosPorTipo: { servico: documentosDoTipo(listas, 'servico'), material: documentosDoTipo(listas, 'material') },
  };
}

/** Ficha completa de uma obra. `null` se não existe. */
export function useObra(id: string) {
  const ds = useStore(datasetStore);
  return useMockQuery(`obra-${id}`, () => carregar(ds, id), { version: ds });
}
