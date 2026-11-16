import type { ListaExigencias } from '../listaExigencias';

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
