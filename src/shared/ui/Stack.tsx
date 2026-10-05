import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type StackProps = {
  /** sm 8 · md 12 (entre blocos empilhados) · lg 16 · xl 20. */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
};

const GAP = { sm: 'gap-2', md: 'gap-3', lg: 'gap-4', xl: 'gap-5' } as const;

export function Stack({ gap = 'md', children, className, as: Tag = 'div' }: StackProps) {
  return <Tag className={cn('flex min-w-0 flex-col', GAP[gap], className)}>{children}</Tag>;
}
