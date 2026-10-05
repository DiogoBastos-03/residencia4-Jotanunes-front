/** Mensagens dos erros da API, por código devolvido pelo back (ProblemDetails.code). */
export const api = {
  erros: {
    CNPJ_ALREADY_REGISTERED: 'Este CNPJ já está cadastrado.',
    INVALID_CNPJ: 'CNPJ inválido. Confira os 14 dígitos.',
    INVALID_PHONE: 'Telefone inválido. Informe DDD e número, com 10 ou 11 dígitos.',
    INVALID_EMAIL: 'E-mail inválido.',
    INVALID_ENTERPRISE_TYPE: 'Escolha pelo menos um tipo de fornecedor.',
    INVALID_PAGE: 'Página inválida.',
    INVALID_PAGE_SIZE: 'Tamanho de página inválido.',
    ENTERPRISE_NOT_FOUND: 'Este fornecedor não existe mais na API.',
    INTERNAL_ERROR: 'Não foi possível salvar. Verifique se o nome, o telefone ou o e-mail já estão em uso.',
  },
  /** 400 sem campo reconhecido. */
  validacao: 'A API recusou alguns dados. Revise os campos marcados.',
  /** 5xx sem ProblemDetails: o proxy não alcançou a API. */
  semResposta: 'A API não respondeu. Confira se ela está no ar e tente de novo.',
  respostaInvalida: 'A API respondeu num formato inesperado.',
  generico: (status: number) => `A API recusou a operação (erro ${status}).`,
} as const;
