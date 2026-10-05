import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type InlineProps = {
  gap?: 'xs' | 'sm' | 'md';
  align?: 'center' | 'start' | 'end' | 'baseline';
  justify?: 'start' | 'between' | 'end';
  wrap?: boolean;
  children: ReactNode;
  className?: string;
};

const GAP = { xs: 'gap-1.5', sm: 'gap-2', md: 'gap-3' } as const;
const ALIGN = { center: 'items-center', start: 'items-start', end: 'items-end', baseline: 'items-baseline' } as const;
const JUSTIFY = { start: 'justify-start', between: 'justify-between', end: 'justify-end' } as const;

/** Linha horizontal de elementos. */
export function Inline({ gap = 'sm', align = 'center', justify = 'start', wrap = true, children, className }: InlineProps) {
  return (
    <div className={cn('flex min-w-0', GAP[gap], ALIGN[align], JUSTIFY[justify], wrap && 'flex-wrap', className)}>
      {children}
    </div>
  );
}
