import type { Dataset } from '../dataset';
import { forneceTipo } from '../fornecedor/model';
import type { ListaExigencias } from '../listaExigencias';
import { fornecedoresDaObra, obrasDaLista } from './aplicabilidade';

export type ComposicaoLista = {
  /** Documentos da empresa obrigatórios. */
  documentosObrigatorios: number;
  /** Documentos da empresa opcionais. */
  documentosOpcionais: number;
  /** Itens de documento de funcionário (obrigatórios e opcionais). */
  documentosFuncionario: number;
  total: number;
};

export function composicaoLista(lista: ListaExigencias): ComposicaoLista {
  const empresa = lista.itens.filter((i) => i.escopo === 'empresa');
  return {
    documentosObrigatorios: empresa.filter((i) => i.obrigatoriedade === 'obrigatorio').length,
    documentosOpcionais: empresa.filter((i) => i.obrigatoriedade === 'opcional').length,
    documentosFuncionario: lista.itens.filter((i) => i.escopo === 'funcionario').length,
    total: lista.itens.length,
  };
}

/** Fornecedores do mesmo tipo da lista, nas obras em que ela vale. */
export function alcanceDaLista(ds: Dataset, listaId: string): number {
  const lista = ds.listas.find((l) => l.id === listaId);
  if (!lista) return 0;
  const ids = new Set<string>();
  for (const obra of obrasDaLista(ds, listaId)) {
    for (const f of fornecedoresDaObra(ds, obra.id)) if (forneceTipo(f, lista.tipo)) ids.add(f.id);
  }
  return ids.size;
}

/** Na obra, quantos fornecedores recebem as exigências da lista. */
export function alcanceNaObra(ds: Dataset, listaId: string, obraId: string): { aplica: number; total: number } {
  const lista = ds.listas.find((l) => l.id === listaId);
  const fornecedores = fornecedoresDaObra(ds, obraId);
  return { aplica: fornecedores.filter((f) => lista !== undefined && forneceTipo(f, lista.tipo)).length, total: fornecedores.length };
}
