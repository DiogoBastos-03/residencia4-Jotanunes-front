import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type HeadingProps = {
  level?: 2 | 3;
  children: ReactNode;
  className?: string;
};

/** Título de bloco (16/600). */
export function Heading({ level = 2, children, className }: HeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return <Tag className={cn('text-block font-semibold', className)}>{children}</Tag>;
}
