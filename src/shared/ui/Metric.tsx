import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import type { Tone } from './Badge';

const DOT: Record<Tone, string> = {
  ok: 'bg-ok',
  review: 'bg-review',
  pending: 'bg-pending',
  warn: 'bg-warn',
  danger: 'bg-danger',
  expired: 'bg-expired',
  primary: 'bg-primary',
};

type MetricProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** Quadradinho de cor antes do rótulo. */
  tone?: Tone;
  /** Número em vermelho — pede atenção. */
  highlight?: boolean;
};

export function Metric({ label, value, hint, tone, highlight = false }: MetricProps) {
  return (
    <div className="flex h-metric min-w-0 flex-col bg-surface p-4">
      <dt className="flex items-center gap-2">
        {tone && <span aria-hidden="true" className={cn('size-2 flex-none', DOT[tone])} />}
        <span className="text-label font-medium text-ink-2">{label}</span>
      </dt>
      <dd className={cn('tabular mt-auto text-display font-semibold', highlight && 'text-primary')}>{value}</dd>
      {hint && <dd className="text-label text-ink-3">{hint}</dd>}
    </div>
  );
}
