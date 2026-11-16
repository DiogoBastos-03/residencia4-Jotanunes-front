/** Ficha da obra (/obras/:id). */
export const obraPage = {
  voltar: 'Obras',
  naoEncontradaTitle: 'Obra não encontrada',
  naoEncontradaDescription: 'O endereço pode estar incorreto ou a obra saiu da integração. Volte para a lista de obras.',
  naoEncontradaAction: 'Ver todas as obras',
  fornecedores: {
    caption: 'Fornecedores da obra',
    colunas: { fornecedor: 'Fornecedor', cnpj: 'CNPJ', tipo: 'Tipo', situacao: 'Situação' },
    abrir: 'Abrir ficha',
    vazioTitle: 'Nenhum fornecedor nesta obra',
    vazioDescription: 'Nenhuma empresa do cadastro está vinculada a esta obra.',
  },
} as const;
