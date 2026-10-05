import type { ComposicaoLista, ListaExigencias, Obra, TipoDocumento } from '@/entities';

export type LinhaLista = {
  lista: ListaExigencias;
  composicao: ComposicaoLista;
  obras: number;
  alcance: number;
};

export type ObraParaVincular = { obra: Obra; jaVinculada: boolean; fornecedoresDoTipo: number };

export type DetalheLista = LinhaLista & {
  obrasVinculadas: Obra[];
  /** Todas as obras, para o drawer de vincular. */
  obrasParaVincular: ObraParaVincular[];
  tiposDocumento: readonly TipoDocumento[];
};
