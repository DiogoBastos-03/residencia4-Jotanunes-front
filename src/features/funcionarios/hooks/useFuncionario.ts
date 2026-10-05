import { itemFuncionarios, statusPorValidade, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { FichaFuncionario } from '../types';

function carregar(ds: Dataset, id: string): FichaFuncionario | null {
  const funcionario = ds.funcionarios.find((f) => f.id === id);
  const remessa = ds.remessas.find((r) => r.id === funcionario?.remessaId);
  const fornecedor = ds.fornecedores.find((f) => f.id === funcionario?.fornecedorId);
  const obra = ds.obras.find((o) => o.id === funcionario?.obraId);
  const lista = ds.listas.find((l) => l.id === remessa?.listaId);
  const item = lista ? itemFuncionarios(lista) : undefined;
  if (!funcionario || !remessa || !fornecedor || !obra || !lista || !item) return null;
  return {
    funcionario,
    fornecedor,
    obra,
    remessa,
    remessaTamanho: ds.funcionarios.filter((f) => f.remessaId === remessa.id).length,
    lista,
    item,
    documentos: item.documentosPessoa.map((exigido) => {
      const enviado = funcionario.documentos.find((d) => d.documentoExigidoId === exigido.id);
      return { exigido, enviado, status: enviado ? statusPorValidade(enviado.status, enviado.validade, ds.hoje) : 'pendente' };
    }),
  };
}

/** Documentos de uma pessoa (drawer). `null` se não existe. */
export function useFuncionario(id: string | null) {
  const ds = useStore(datasetStore);
  return useMockQuery(`funcionario-${id ?? 'nenhum'}`, () => (id ? carregar(ds, id) : null), { version: ds });
}
