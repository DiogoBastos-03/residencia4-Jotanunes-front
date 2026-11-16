import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { IsoDate } from '../common';

export function diasEntre(de: IsoDate, ate: IsoDate): number {
  return differenceInCalendarDays(parseISO(ate), parseISO(de));
}

/** Janela padrão de "vence em breve". */
export const JANELA_VENCIMENTO_DIAS = 30;
