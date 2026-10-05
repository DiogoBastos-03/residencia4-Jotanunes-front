import type {
  ComposicaoLista,
  EscopoItem,
  ExigenciaValidade,
  ListaExigencias,
  Obra,
  Obrigatoriedade,
  SituacaoLista,
  TipoFornecimento,
} from '@/entities';

export type LinhaLista = {
  lista: ListaExigencias;
  composicao: ComposicaoLista;
  obras: number;
  alcance: number;
};

/** Item exigido em edição — com o nome por extenso, antes de virar item do catálogo. */
export type ItemRascunho = {
  id: string;
  escopo: EscopoItem;
  nome: string;
  obrigatoriedade: Obrigatoriedade;
  validade: ExigenciaValidade;
  avisoDias?: number;
  formatos: 'pdfImagem' | 'pdf';
  instrucoes?: string;
};


export type ObraDaLista = {
  obra: Obra;
  /** Esta é a única lista da obra: não pode sair. */
  unica: boolean;
  /** Fornecedores do tipo da lista nesta obra. */
  fornecedoresDoTipo: number;
};

export type ObraParaVincular = { obra: Obra; jaVinculada: boolean; fornecedoresDoTipo: number };

export type DetalheLista = LinhaLista & {
  itens: ItemRascunho[];
  obrasVinculadas: ObraDaLista[];
  /** Todas as obras, para o drawer de vincular. */
  obrasParaVincular: ObraParaVincular[];
};

export type NovaLista = {
  nome: string;
  situacao: SituacaoLista;
  tipo: TipoFornecimento;
  descricao: string;
  itens: ItemRascunho[];
  obraIds: string[];
  prazoEnvioDias: number;
  lembretesDias: number[];
};
