import { documentosDaPessoa, itemFuncionarios, montarFila, type EntradaFilaRemessa, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { DetalheRemessa } from '../types';

function carregar(ds: Dataset, id: string): DetalheRemessa | null {
  const entrada = montarFila(ds).find((e): e is EntradaFilaRemessa => e.kind === 'remessa' && e.id === id);
  const item = entrada ? itemFuncionarios(entrada.lista) : undefined;
  if (!entrada || !item) return null;
  const pessoas = ds.funcionarios
    .filter((f) => f.remessaId === id)
    .map((funcionario) => ({ funcionario, ...documentosDaPessoa(ds, funcionario) }));
  return {
    entrada,
    item,
    pessoas,
    aprovados: pessoas.filter((p) => p.funcionario.status === 'aprovado').length,
    aguardando: pessoas.filter((p) => p.funcionario.status === 'emAnalise').length,
    reprovados: pessoas.filter((p) => p.funcionario.status === 'reprovado').length,
  };
}

/** Remessa de funcionários aberta na fila. `null` se não existe. */
export function useRemessa(id: string) {
  const ds = useStore(datasetStore);
  return useMockQuery(`remessa-${id}`, () => carregar(ds, id), { version: ds });
}
