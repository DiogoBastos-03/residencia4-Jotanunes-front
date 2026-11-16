/**
 * Mensagens de erro da API, por `code` (seção 8 do contrato da API interna),
 * mais os códigos internos do front. Nenhuma mensagem de erro fica fora daqui.
 */
export const errosApi = {
  porCodigo: {
    // — Contrato, seção 8 —
    ENTERPRISE_NOT_FOUND: 'Fornecedor não encontrado.',
    DOCUMENT_NOT_FOUND: 'Documento não encontrado para este fornecedor.',
    REQUIREMENT_NOT_FOUND: 'Exigência não encontrada. Atualize a página: pode ter chegado um envio mais recente.',
    CNPJ_ALREADY_REGISTERED: 'Este CNPJ já está cadastrado.',
    DOCUMENT_PURGED: 'O arquivo deste documento não está mais disponível: foi removido do armazenamento.',
    INVALID_CNPJ: 'CNPJ inválido. Confira os 14 dígitos.',
    INVALID_PHONE: 'Telefone inválido. Informe DDD e número, com 10 ou 11 dígitos; celular começa com 9.',
    INVALID_EMAIL: 'E-mail inválido.',
    INVALID_ENTERPRISE_NAME: 'Razão social inválida. Use de 2 a 255 caracteres, sem ser só espaços.',
    ENTERPRISE_TYPE_REQUIRED: 'Escolha pelo menos um tipo de fornecimento.',
    INVALID_ENTERPRISE_TYPE: 'Tipo de fornecimento inválido. Use material ou serviço.',
    INVALID_PAGE: 'Página inválida.',
    INVALID_PAGE_SIZE: 'Quantidade por página inválida. Use de 1 a 50.',
    EMPTY_BATCH: 'Escolha pelo menos um documento para baixar.',
    BATCH_TOO_LARGE: 'Dá para baixar até 50 documentos de uma vez.',
    REQUIREMENT_NOT_POSTPONABLE: 'Só dá para postergar exigência pendente ou vencida.',
    REQUIREMENT_ALREADY_POSTPONED: 'Esta exigência já tem uma postergação ativa.',
    POSTPONEMENT_DEADLINE_IN_PAST: 'O novo prazo precisa ser depois de hoje.',
    REQUIREMENT_NOT_POSTPONED: 'Esta exigência não tem postergação ativa para cancelar.',
    INTERNAL_ERROR: 'Algo deu errado do nosso lado. Tente de novo em instantes.',
    // — Internos do front —
    VALIDATION_ERROR: 'Alguns campos foram recusados. Revise os campos marcados.',
    NETWORK_ERROR: 'Não foi possível falar com o servidor. Confira a conexão e tente de novo.',
    INVALID_RESPONSE: 'O servidor respondeu num formato inesperado.',
  },
  /**
   * 400 de validação (sem `code`): o ASP.NET manda o texto em inglês, por campo.
   * O front mostra, ao lado de cada campo recusado, a mensagem daqui.
   */
  porCampo: {
    razaoSocial: 'Razão social recusada. Use de 2 a 255 caracteres.',
    cnpj: 'CNPJ recusado. Informe os 14 dígitos.',
    telefone: 'Telefone recusado. Informe DDD e número.',
    email: 'E-mail recusado. Confira o endereço.',
    tipos: 'Escolha pelo menos um tipo de fornecimento.',
  },
  /** Código desconhecido ou erro sem código (ex.: 404 sem corpo). */
  generico: (status: number) => (status === 404 ? 'Não encontrado.' : `Não foi possível concluir a operação (erro ${status}).`),
} as const;
