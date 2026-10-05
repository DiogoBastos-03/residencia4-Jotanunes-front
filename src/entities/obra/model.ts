import type { IsoDate } from '../common';

export type SituacaoObra = 'emExecucao' | 'planejamento' | 'concluida';

/**
 * Obra. Na API a obra só tem id e nome: código, cidade, UF e data de recebimento
 * existem só nos dados de demonstração.
 */
export type Obra = {
  id: string;
  codigo?: string;
  nome: string;
  cidade?: string;
  uf?: string;
  situacao: SituacaoObra;
  recebidaEm?: IsoDate;
};

export type ObraLista = {
  obraId: string;
  listaId: string;
  vinculadaEm: IsoDate;
};
