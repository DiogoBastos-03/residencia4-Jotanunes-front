/**
 * Fábrica central das query keys do TanStack Query. Nada de string solta nas telas:
 * invalide por prefixo (ex.: queryKeys.fornecedores.todos) depois de cada mutação.
 * O link de visualização do acervo NÃO tem key: ele expira em 5 minutos e é pedido a cada clique.
 */
export const queryKeys = {
  health: () => ['health'] as const,
  fornecedores: {
    todos: ['fornecedores'] as const,
    lista: <F extends object>(filtros: F) => ['fornecedores', 'lista', filtros] as const,
    detalhe: (id: string) => ['fornecedores', 'detalhe', id] as const,
    /** Fornecedores de cada obra (?constructionIds=), que dão o vínculo fornecedor ↔ obra. */
    porObras: (obraIds: readonly string[]) => ['fornecedores', 'porObras', obraIds] as const,
  },
  obras: {
    todos: ['obras'] as const,
    lista: <F extends object>(filtros: F) => ['obras', 'lista', filtros] as const,
  },
  /** Listas de exigências (workflows). Tudo sob ['listas']: uma versão nova invalida lista, ficha, versões e obras. */
  listas: {
    todos: ['listas'] as const,
    lista: <F extends object>(filtros: F) => ['listas', 'lista', filtros] as const,
    detalhe: (id: number) => ['listas', 'detalhe', id] as const,
    versoes: (id: number) => ['listas', 'versoes', id] as const,
    daObra: (obraId: string) => ['listas', 'daObra', obraId] as const,
  },
  tiposDocumento: {
    todos: ['tiposDocumento'] as const,
    lista: () => ['tiposDocumento', 'lista'] as const,
    detalhe: (id: string) => ['tiposDocumento', 'detalhe', id] as const,
  },
  formatos: () => ['formatos'] as const,
  acervo: {
    todos: ['acervo'] as const,
    doFornecedor: <F extends object>(fornecedorId: string, filtros: F) => ['acervo', fornecedorId, filtros] as const,
  },
  pendencias: {
    todos: ['pendencias'] as const,
    painel: () => ['pendencias', 'painel'] as const,
  },
} as const;
