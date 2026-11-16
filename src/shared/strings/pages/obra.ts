/** Ficha da obra (/obras/:id). */
export const obraPage = {
  voltar: 'Obras',
  vincular: 'Vincular fornecedor',
  naoEncontradaTitle: 'Obra não encontrada',
  naoEncontradaDescription: 'O endereço pode estar incorreto ou a obra saiu da integração. Volte para a lista de obras.',
  naoEncontradaAction: 'Ver todas as obras',
  listas: {
    title: 'Listas de exigências',
    descricao: 'Cada lista vale para os fornecedores do mesmo tipo desta obra. No máximo uma de material e uma de serviço.',
    colunas: { lista: 'Lista', tipo: 'Vale para', versao: 'Versão em uso' },
    versao: (n: string) => `versão ${n}`,
    abrir: 'Abrir lista',
    vincular: 'Vincular lista',
    vazioTitle: 'Nenhuma lista nesta obra',
    vazioDescription: 'Sem lista, os fornecedores desta obra não têm documentos a entregar.',
  },
  fornecedores: {
    caption: 'Fornecedores da obra',
    colunas: { fornecedor: 'Fornecedor', cnpj: 'CNPJ', tipo: 'Tipo', situacao: 'Situação' },
    desvincular: 'Desvincular',
    vazioTitle: 'Nenhum fornecedor nesta obra',
    vazioDescription: 'Vincule os fornecedores que trabalham nesta obra.',
  },
} as const;
