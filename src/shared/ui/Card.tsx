import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** outer: cartão de página (raio 6). inner: caixa dentro da página (raio 4). */
  level?: 'outer' | 'inner';
  /** Fundo cinza de apoio. */
  muted?: boolean;
  padded?: boolean;
  as?: 'div' | 'section' | 'article';
};

/** Cartão sem sombra, com borda de 1px. Sempre flex-col e h-full para alinhar em grade. */
export function Card({
  level = 'inner',
  muted = false,
  padded = true,
  as: Tag = 'div',
  className,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        'flex h-full min-w-0 flex-col border border-border',
        level === 'outer' ? 'rounded-card' : 'rounded-control',
        muted ? 'bg-surface-2' : 'bg-surface',
        padded && (level === 'outer' ? 'p-5' : 'p-4'),
        className,
      )}
      {...rest}
    />
  );
}
