import type { Dataset } from '@/entities';
import { useDatasetQuery } from '@/mocks';
import type { ResumoAnalisesHoje } from '../types';

const LIMITE_RECENTES = 5;

function carregar(ds: Dataset): ResumoAnalisesHoje {
  const hoje = ds.analises
    .filter((a) => a.quando.startsWith(ds.hoje))
    .sort((a, b) => b.quando.localeCompare(a.quando))
    .flatMap((a) => {
      const fornecedor = ds.fornecedores.find((f) => f.id === a.fornecedorId);
      return fornecedor ? [{ ...a, fornecedor }] : [];
    });
  return {
    recentes: hoje.slice(0, LIMITE_RECENTES),
    total: hoje.length,
    aprovados: hoje.filter((a) => a.resultado === 'aprovado').length,
    reprovados: hoje.filter((a) => a.resultado === 'reprovado').length,
  };
}

export function useAnalisesHoje() {
  return useDatasetQuery('analises-hoje', (ds) => carregar(ds), {
    empty: { recentes: [], total: 0, aprovados: 0, reprovados: 0 },
  });
}
