import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type MetricStripProps = {
  /** 4 métricas: 4 colunas → 2x2 → empilhado. 3 métricas: 3 colunas → empilhado. */
  columns?: 3 | 4;
  children: ReactNode;
  className?: string;
};

const COLUMNS = {
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

/** Faixa colada de métricas. As divisórias de 1px vêm do gap sobre o fundo de borda. */
export function MetricStrip({ columns = 4, children, className }: MetricStripProps) {
  return (
    <dl
      className={cn(
        'grid gap-px overflow-hidden rounded-control border border-border bg-border',
        COLUMNS[columns],
        className,
      )}
    >
      {children}
    </dl>
  );
}
