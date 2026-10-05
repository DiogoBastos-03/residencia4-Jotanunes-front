import type { Obrigatoriedade, TipoFornecimento } from './common';

/** Catálogo de documentos. O mesmo documento pode ser exigido por várias listas. */
export type TipoDocumento = {
  id: string;
  nome: string;
};

export type ExigenciaValidade = 'comData' | 'semValidade';

/**
 * empresa: um arquivo, que vale para todas as obras.
 * funcionario: vários arquivos no mesmo item, aceitos ao longo do tempo, cada um analisado e com validade própria.
 */
export type EscopoItem = 'empresa' | 'funcionario';

export type ItemExigido = {
  id: string;
  tipoDocumentoId: string;
  escopo: EscopoItem;
  obrigatoriedade: Obrigatoriedade;
  /** Para documento de funcionário, a validade é de cada arquivo. */
  validade: ExigenciaValidade;
  /** Dias de antecedência do aviso de vencimento (só com validade). */
  avisoDias?: number;
  formatos: 'pdfImagem' | 'pdf';
  instrucoes?: string;
};

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
