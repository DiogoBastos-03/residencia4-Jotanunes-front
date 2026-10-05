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

/** "10/2026" → "2026-10-01"; null se inválido. */
export function parseMonthBr(texto: string): string | null {
  const m = /^(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const mes = Number(m[1]);
  return mes >= 1 && mes <= 12 ? `${m[2]}-${m[1]}-01` : null;
}

/** Máscara de digitação mm/aaaa. */
export function maskMonthBr(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 6);
  return d.replace(/^(\d{2})(\d)/, '$1/$2');
}
