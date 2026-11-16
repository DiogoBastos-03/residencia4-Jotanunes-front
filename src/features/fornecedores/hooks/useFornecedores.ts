import { forneceTipo, type FornecedorResumo } from '@/entities';
import { useFornecedoresApi } from '@/entities/fornecedor';
import { useObrasApi, useVinculosApi, type VinculoApi } from '@/entities/obra';
import { juntar, useResultado } from '@/shared/lib';
import type { ListaFornecedores } from '../types';

export function montarLista(fornecedores: readonly FornecedorResumo[], vinculos: readonly VinculoApi[]): ListaFornecedores {
  const linhas = fornecedores.map((fornecedor) => ({
    fornecedor,
    obras: vinculos.filter((v) => v.fornecedorId === fornecedor.id).length,
  }));
  return {
    linhas,
    porSituacao: {
      todos: linhas.length,
      ativo: linhas.filter((l) => !l.fornecedor.bloqueado).length,
      bloqueado: linhas.filter((l) => l.fornecedor.bloqueado).length,
    },
    porTipo: {
      // Fornecedor dos dois tipos conta nos dois.
      servico: linhas.filter((l) => forneceTipo(l.fornecedor, 'servico')).length,
      material: linhas.filter((l) => forneceTipo(l.fornecedor, 'material')).length,
    },
  };
}

const VAZIO: ListaFornecedores = {
  linhas: [],
  porSituacao: { todos: 0, ativo: 0, bloqueado: 0 },
  porTipo: { servico: 0, material: 0 },
};

/** Fornecedores da API, com quantas obras cada um tem (a partir do filtro por obra da API). */
export function useFornecedores() {
  const fornecedores = useFornecedoresApi();
  const obras = useObrasApi();
  const vinculos = useVinculosApi(obras.data?.itens);
  const consulta = juntar(fornecedores, juntar(obras, vinculos, (_o, v) => v), (f, v) => montarLista(f.itens, v));
  return useResultado(consulta, { empty: VAZIO });
}

/** A API tem mais de 200 fornecedores e a busca parou no teto: a lista é parcial. */
export function useListagemParcial(): { parcial: boolean; total: number; carregados: number } {
  const { data } = useFornecedoresApi();
  return { parcial: data?.parcial ?? false, total: data?.total ?? 0, carregados: data?.itens.length ?? 0 };
}
