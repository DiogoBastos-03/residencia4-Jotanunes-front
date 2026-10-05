import type { IsoDate } from './common';

export type SituacaoObra = 'emExecucao' | 'planejamento' | 'concluida';

/** Obra recebida da integração. Ninguém cria nem edita obra neste sistema. */
export type Obra = {
  id: string;
  codigo: string;
  nome: string;
  cidade: string;
  uf: string;
  situacao: SituacaoObra;
  recebidaEm: IsoDate;
};

/** Lista de exigências vinculada a uma obra. */
export type ObraLista = {
  obraId: string;
  listaId: string;
  vinculadaEm: IsoDate;
};
