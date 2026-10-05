import { cn, formatDate } from '@/shared/lib';

/** Quadrado de data (dia + mês) dos vencimentos. Em âmbar quando está perto. */
export function DataBox({ data, alerta }: { data: string; alerta: boolean }) {
  return (
    <span
      className={cn(
        'flex size-10.5 flex-none flex-col items-center justify-center rounded-control',
        alerta ? 'bg-warn-bg text-warn' : 'border border-border bg-surface-2 text-ink-3',
      )}
    >
      <span className="tabular text-body leading-[15px] font-semibold">{formatDate(data, 'day')}</span>
      <span className="text-tag font-medium">{formatDate(data, 'monthShort')}</span>
    </span>
  );
}
