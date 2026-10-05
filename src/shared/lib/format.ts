import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** 12345678000190 → 12.345.678/0001-90. Aceita valor parcial (máscara de digitação). */
export function formatCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/** 12345678900 → 123.456.789-00. Aceita valor parcial. */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** (81) 99876-1234 / (81) 3244-7788. Aceita valor parcial. */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export type DatePattern = 'date' | 'dateTime' | 'monthYear' | 'day' | 'monthShort' | 'long' | 'time';

const PATTERNS: Record<DatePattern, string> = {
  date: 'dd/MM/yyyy',
  dateTime: "dd/MM/yyyy, HH:mm",
  monthYear: 'MM/yyyy',
  day: 'dd',
  monthShort: 'MMM',
  long: "EEEE, d 'de' MMMM 'de' yyyy",
  time: 'HH:mm',
};

/** Formata uma data ISO (yyyy-MM-dd ou yyyy-MM-ddTHH:mm) no padrão brasileiro. */
export function formatDate(iso: string, pattern: DatePattern = 'date'): string {
  const text = format(parseISO(iso), PATTERNS[pattern], { locale: ptBR });
  return pattern === 'long' ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
