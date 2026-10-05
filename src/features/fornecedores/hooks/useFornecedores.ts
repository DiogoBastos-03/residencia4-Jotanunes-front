import { aguardandoAcesso, forneceTipo, resumoFornecedor, type Dataset } from '@/entities';
import { useDatasetQuery } from '@/mocks';
import type { ListaFornecedores } from '../types';

export function carregarFornecedores(ds: Dataset): ListaFornecedores {
  const linhas = ds.fornecedores.map((fornecedor) => ({
    fornecedor,
    resumo: resumoFornecedor(ds, fornecedor.id),
    aguardandoAcesso: aguardandoAcesso(fornecedor),
  }));
  return {
    linhas,
    porSituacao: {
      todos: linhas.length,
      apto: linhas.filter((l) => l.resumo.situacao === 'apto').length,
      comPendencia: linhas.filter((l) => l.resumo.situacao === 'comPendencia').length,
      bloqueado: linhas.filter((l) => l.resumo.situacao === 'bloqueado').length,
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
  porSituacao: { todos: 0, apto: 0, comPendencia: 0, bloqueado: 0 },
  porTipo: { servico: 0, material: 0 },
};

export function useFornecedores() {
  return useDatasetQuery('fornecedores', (ds) => carregarFornecedores(ds), { empty: VAZIO });
}
