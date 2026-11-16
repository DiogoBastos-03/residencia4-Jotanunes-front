import type { IsoDate } from '../common';

/** Formato de arquivo aceito (PDF, PNG…). Só os ativos vêm da API. */
export type FormatoArquivo = { id: number; nome: string; icone: string; tipo: string };

/** Tipo de documento que uma lista de exigências pode pedir. */
export type DefinicaoDocumento = {
  id: string;
  nome: string;
  descricao: string;
  tamanhoMaxBytes: number;
  /** O mesmo arquivo pode ser reaproveitado em outra exigência. */
  reaproveitavel: boolean;
  /** Dias de validade a partir da emissão; null = não vence. */
  validadeDias: number | null;
  formatoIds: number[];
};

export type DefinicaoDocumentoDetalhe = DefinicaoDocumento & { criadoEm: IsoDate; atualizadoEm: IsoDate };

/** Limite do back (RNF03): 20 MB. */
export const TAMANHO_MAX_BYTES = 20 * 1024 * 1024;
