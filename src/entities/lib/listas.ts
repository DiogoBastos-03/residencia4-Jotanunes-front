import type { Dataset } from '../dataset';
import type { ListaExigencias } from '../listaExigencias';
import { fornecedoresDaObra, obrasDaLista } from './aplicabilidade';

export type ComposicaoLista = {
  documentosObrigatorios: number;
  documentosOpcionais: number;
  itensFuncionarios: number;
  total: number;
};

export function composicaoLista(lista: ListaExigencias): ComposicaoLista {
  const docs = lista.itens.filter((i) => i.kind === 'documento');
  return {
    documentosObrigatorios: docs.filter((i) => i.obrigatoriedade === 'obrigatorio').length,
    documentosOpcionais: docs.filter((i) => i.obrigatoriedade === 'opcional').length,
    itensFuncionarios: lista.itens.filter((i) => i.kind === 'funcionarios').length,
    total: lista.itens.length,
  };
}

/** Fornecedores do mesmo tipo da lista, nas obras em que ela vale. */
export function alcanceDaLista(ds: Dataset, listaId: string): number {
  const lista = ds.listas.find((l) => l.id === listaId);
  if (!lista) return 0;
  const ids = new Set<string>();
  for (const obra of obrasDaLista(ds, listaId)) {
    for (const f of fornecedoresDaObra(ds, obra.id)) if (f.tipo === lista.tipo) ids.add(f.id);
  }
  return ids.size;
}

/** Na obra, quantos fornecedores recebem as exigências da lista. */
export function alcanceNaObra(ds: Dataset, listaId: string, obraId: string): { aplica: number; total: number } {
  const lista = ds.listas.find((l) => l.id === listaId);
  const fornecedores = fornecedoresDaObra(ds, obraId);
  return { aplica: fornecedores.filter((f) => f.tipo === lista?.tipo).length, total: fornecedores.length };
}
