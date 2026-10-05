import type { ListaExigencias, Obra, PeriodoRelatorio, Vencimento } from '@/entities';

export type PendenciasDaObra = { obra: Obra; total: number; fornecedores: number };
export type TempoDaLista = { lista: ListaExigencias; diasMedios: number; acimaDaMeta: boolean };

export type Relatorio = {
  periodo: PeriodoRelatorio;
  pendencias: PendenciasDaObra[];
  tempos: TempoDaLista[];
  vencimentos: Vencimento[];
};
