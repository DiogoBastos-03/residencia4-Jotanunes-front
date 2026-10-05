import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type BlockRowProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li';
};

/** Linha de lista dentro de Block: divisória de 1px, sem borda na última. */
export function BlockRow({ children, className, as: Tag = 'div' }: BlockRowProps) {
  return (
    <Tag className={cn('flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0', className)}>
      {children}
    </Tag>
  );
}
