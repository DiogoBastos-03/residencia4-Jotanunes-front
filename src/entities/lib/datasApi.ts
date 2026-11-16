import { format, isValid, parseISO } from 'date-fns';
import type { IsoDate } from '../common';

/**
 * Datas da API. Dois formatos, tratados explicitamente:
 * - data e hora em UTC, com ou sem Z ("2026-11-09T18:30:00Z" ou "2026-11-09T18:30:00") → convertida para o horário local;
 * - só data ("2026-11-30"), apenas no `deadlineAt` da postergação → mantida como dia, sem fuso.
 */

/** Sem Z nem deslocamento, o horário é UTC (o back grava em UTC). */
const TEM_FUSO = /(Z|[+-]\d{2}:?\d{2})$/i;

function utc(valor: string): Date {
  const data = parseISO(TEM_FUSO.test(valor) ? valor : `${valor}Z`);
  if (!isValid(data)) throw new RangeError(`Data inválida da API: ${valor}`);
  return data;
}

/** "2026-11-09T18:30:00Z" → "2026-11-09T15:30" (horário local). */
export function momentoDeUtc(valor: string): IsoDate {
  return format(utc(valor), "yyyy-MM-dd'T'HH:mm");
}

/** "2026-11-09T18:30:00Z" → "2026-11-09" (dia local). */
export function diaDeUtc(valor: string): IsoDate {
  return format(utc(valor), 'yyyy-MM-dd');
}

/** Dia do front ("2026-11-30" ou "2026-11-30T10:00") → "2026-11-30", para campos só-data como `deadlineAt`. */
export function paraDataSimples(dia: IsoDate): string {
  return dia.slice(0, 10);
}
