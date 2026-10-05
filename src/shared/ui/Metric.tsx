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
};

export function Metric({ label, value, hint, tone }: MetricProps) {
  return (
    <div className="flex h-metric min-w-0 flex-col bg-surface p-4 max-sm:h-auto max-sm:flex-row max-sm:flex-wrap max-sm:items-center max-sm:gap-x-3 max-sm:py-3">
      <dt className="flex items-center gap-2">
        {tone && <span aria-hidden="true" className={cn('size-2 flex-none', DOT[tone])} />}
        <span className="text-label font-medium text-ink-2">{label}</span>
      </dt>
      <dd className="tabular mt-auto text-display font-semibold max-sm:mt-0 max-sm:ml-auto max-sm:text-page">{value}</dd>
      {hint && <dd className="text-label text-ink-3 max-sm:-mt-1 max-sm:basis-full">{hint}</dd>}
    </div>
  );
}
