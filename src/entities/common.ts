/** Data no formato ISO: yyyy-MM-dd ou yyyy-MM-ddTHH:mm. */
export type IsoDate = string;

/** Tipo de fornecimento: vale para fornecedor e para lista de exigências. */
export type TipoFornecimento = 'servico' | 'material';

export type Obrigatoriedade = 'obrigatorio' | 'opcional';
