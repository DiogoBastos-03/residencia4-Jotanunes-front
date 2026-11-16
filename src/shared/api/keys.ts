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
  acervo: {
    todos: ['acervo'] as const,
    doFornecedor: <F extends object>(fornecedorId: string, filtros: F) => ['acervo', fornecedorId, filtros] as const,
  },
  pendencias: {
    todos: ['pendencias'] as const,
    painel: () => ['pendencias', 'painel'] as const,
  },
} as const;
