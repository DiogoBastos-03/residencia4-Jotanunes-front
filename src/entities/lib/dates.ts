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

const TEM_FUSO = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Data e hora vindas da API. O back grava em UTC, mas devolve sem fuso
 * ("2026-01-05T09:00:00"); sem offset, a data é tratada como UTC (acrescenta Z).
 * Use isto em todo mapeamento de data da API — nunca `new Date(s)` direto.
 */
export function lerDataApi(valor: string): Date {
  const data = parseISO(TEM_FUSO.test(valor) ? valor : `${valor}Z`);
  if (Number.isNaN(data.getTime())) throw new RangeError(`Data inválida vinda da API: ${valor}`);
  return data;
}

/** Data da API como IsoDate local, só o dia ("2026-01-05"). */
export function diaDaApi(valor: string): IsoDate {
  return format(lerDataApi(valor), 'yyyy-MM-dd');
}

/** Data da API como IsoDate local com hora ("2026-01-05T06:00"). */
export function momentoDaApi(valor: string): IsoDate {
  return format(lerDataApi(valor), "yyyy-MM-dd'T'HH:mm");
}

/** "Hoje" e "agora" do relógio do navegador, no formato do Dataset. */
export function hojeLocal(agora: Date = new Date()): { hoje: IsoDate; agora: IsoDate } {
  return { hoje: format(agora, 'yyyy-MM-dd'), agora: format(agora, "yyyy-MM-dd'T'HH:mm") };
}
