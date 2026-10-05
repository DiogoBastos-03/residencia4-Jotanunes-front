import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type TextProps = {
  /** body 14 · support 13 · label 12. */
  size?: 'body' | 'support' | 'label';
  tone?: 'default' | 'soft' | 'muted' | 'faint';
  weight?: 'normal' | 'medium' | 'semibold';
  as?: 'p' | 'span' | 'div';
  children: ReactNode;
  className?: string;
};

const SIZE = { body: 'text-body', support: 'text-support', label: 'text-label' } as const;
const TONE = { default: 'text-ink', soft: 'text-ink-2', muted: 'text-ink-3', faint: 'text-ink-4' } as const;
const WEIGHT = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold' } as const;

/** Texto corrido nos tamanhos do design system. */
export function Text({ size = 'body', tone = 'default', weight = 'normal', as: Tag = 'p', children, className }: TextProps) {
  return <Tag className={cn(SIZE[size], TONE[tone], WEIGHT[weight], className)}>{children}</Tag>;
}
