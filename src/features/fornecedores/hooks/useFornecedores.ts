import { resumoFornecedor, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { ListaFornecedores } from '../types';

export function carregarFornecedores(ds: Dataset): ListaFornecedores {
  const linhas = ds.fornecedores.map((fornecedor) => ({ fornecedor, resumo: resumoFornecedor(ds, fornecedor.id) }));
  return {
    linhas,
    porSituacao: {
      todos: linhas.length,
      apto: linhas.filter((l) => l.resumo.situacao === 'apto').length,
      comPendencia: linhas.filter((l) => l.resumo.situacao === 'comPendencia').length,
      bloqueado: linhas.filter((l) => l.resumo.situacao === 'bloqueado').length,
    },
    porTipo: {
      servico: linhas.filter((l) => l.fornecedor.tipo === 'servico').length,
      material: linhas.filter((l) => l.fornecedor.tipo === 'material').length,
    },
  };
}

const VAZIO: ListaFornecedores = {
  linhas: [],
  porSituacao: { todos: 0, apto: 0, comPendencia: 0, bloqueado: 0 },
  porTipo: { servico: 0, material: 0 },
};

export function useFornecedores() {
  const ds = useStore(datasetStore);
  return useMockQuery('fornecedores', () => carregarFornecedores(ds), { version: ds, empty: VAZIO });
}
