import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type GridProps = {
  /** 2 colunas (1 abaixo de 1024). */
  columns?: 2;
  children: ReactNode;
  className?: string;
};

/**
 * Fileira de cartões lado a lado. align-items stretch: os filhos (Card, Block)
 * já são h-full flex-col, então terminam na mesma linha.
 */
export function Grid({ columns = 2, children, className }: GridProps) {
  return (
    <div
      className={cn(
        'grid items-stretch gap-3',
        columns === 2 && 'grid-cols-1 lg:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
