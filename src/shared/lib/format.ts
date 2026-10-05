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

/** Confere os dígitos verificadores do CNPJ. */
export function cnpjValido(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (base: string, pesos: number[]) => {
    const soma = base.split('').reduce((t, n, i) => t + Number(n) * (pesos[i] ?? 0), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = calc(d.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(d.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d.endsWith(`${d1}${d2}`);
}

/**
 * Telefone com as mesmas regras do back (Phone): 10 ou 11 dígitos, DDD sem zero
 * e, com 11 dígitos, o terceiro é 9 (celular).
 */
export function telefoneValido(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  if (d.startsWith('0') || d.charAt(1) === '0') return false;
  return d.length === 10 || d.charAt(2) === '9';
}
