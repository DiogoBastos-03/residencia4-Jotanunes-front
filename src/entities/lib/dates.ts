import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { IsoDate } from '../common';

export function diasEntre(de: IsoDate, ate: IsoDate): number {
  return differenceInCalendarDays(parseISO(ate), parseISO(de));
}

export function somarDias(data: IsoDate, dias: number): IsoDate {
  return format(addDays(parseISO(data), dias), 'yyyy-MM-dd');
}

/** Janela padrão de "vence em breve". */
export const JANELA_VENCIMENTO_DIAS = 30;
