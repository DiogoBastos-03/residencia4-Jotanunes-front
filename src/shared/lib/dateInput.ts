import { format, isValid, parse } from 'date-fns';
import type { DatePattern } from './format';
import { formatDate } from './format';

/** "30/09/2027" → "2027-09-30"; null se a data não existe. */
export function parseDateBr(texto: string): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto.trim())) return null;
  const data = parse(texto.trim(), 'dd/MM/yyyy', new Date());
  return isValid(data) ? format(data, 'yyyy-MM-dd') : null;
}

/** Máscara de digitação dd/mm/aaaa. */
export function maskDateBr(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  return d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

/** "2027-09-30" → "30/09/2027". */
export function isoToBr(iso: string | undefined, pattern: DatePattern = 'date'): string {
  return iso ? formatDate(iso, pattern) : '';
}

