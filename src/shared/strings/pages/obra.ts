/** Ficha da obra (/obras/:id). */
export const obraPage = {
  voltar: 'Obras',
  vincular: 'Vincular fornecedor',
  naoEncontradaTitle: 'Obra não encontrada',
  naoEncontradaDescription: 'O endereço pode estar incorreto ou a obra saiu da integração. Volte para a lista de obras.',
  naoEncontradaAction: 'Ver todas as obras',
  fornecedores: {
    caption: 'Fornecedores da obra',
    colunas: { fornecedor: 'Fornecedor', cnpj: 'CNPJ', tipo: 'Tipo', situacao: 'Situação' },
    desvincular: 'Desvincular',
    vazioTitle: 'Nenhum fornecedor nesta obra',
    vazioDescription: 'Vincule os fornecedores que trabalham nesta obra.',
  },
} as const;
