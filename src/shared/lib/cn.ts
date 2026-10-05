type ClassValue = string | number | bigint | boolean | null | undefined;

/** Junta classes ignorando valores falsos. */
export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}
