import type { Obrigatoriedade, TipoFornecimento } from './common';

/** Catálogo de documentos. O mesmo documento pode ser exigido por várias listas. */
export type TipoDocumento = {
  id: string;
  nome: string;
};

export type ExigenciaValidade = 'comData' | 'semValidade';

export type ItemDocumento = {
  id: string;
  kind: 'documento';
  tipoDocumentoId: string;
  obrigatoriedade: Obrigatoriedade;
  validade: ExigenciaValidade;
  /** Dias de antecedência do aviso de vencimento (só com validade). */
  avisoDias?: number;
  formatos: 'pdfImagem' | 'pdf';
  instrucoes?: string;
};

export type CampoPessoa = 'cpf' | 'nome' | 'telefone' | 'funcao' | 'obra';

export type DocumentoPessoaExigido = {
  id: string;
  nome: string;
  obrigatoriedade: Obrigatoriedade;
  validade: ExigenciaValidade;
  avisoDias?: number;
};

/** Item de funcionários: acompanhado por pessoa, não entra na conta de fornecedor apto. */
export type ItemFuncionarios = {
  id: string;
  kind: 'funcionarios';
  nome: string;
  obrigatoriedade: Obrigatoriedade;
  camposPessoa: readonly CampoPessoa[];
  documentosPessoa: readonly DocumentoPessoaExigido[];
  limitePorRemessa: number | null;
  envioDeUmaVez: boolean;
};

export type ItemExigido = ItemDocumento | ItemFuncionarios;

export type SituacaoLista = 'ativo' | 'rascunho';

export type ListaExigencias = {
  id: string;
  nome: string;
  tipo: TipoFornecimento;
  descricao: string;
  situacao: SituacaoLista;
  itens: readonly ItemExigido[];
  prazoEnvioDias: number;
  lembretesDias: readonly number[];
};
