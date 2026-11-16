import type { IsoDate } from '../common';

/** Uma linha do painel de pendências: um fornecedor, com as contagens de cada situação. */
export type LinhaPendencias = {
  fornecedorId: string;
  fornecedorNome: string;
  /** Nunca enviadas, ou com o último envio não aprovado, sem postergação ativa. */
  pendentes: number;
  /** Aprovadas que vencem em até 30 dias. */
  aVencer: number;
  vencidas: number;
  postergadas: number;
};

export type Postergacao = {
  /** Dia (yyyy-MM-dd), posterior a hoje. O prazo vale até o fim desse dia. */
  prazo: IsoDate;
  /** Até 500 caracteres. Vai para o fornecedor. */
  motivo?: string;
};
