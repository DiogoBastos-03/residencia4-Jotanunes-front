import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { strings, type TagKey } from '@/shared/strings';

const KIND_CLASS: Record<TagKey, string> = {
  obrigatorio: 'bg-pending-bg text-pending',
  opcional: 'bg-surface-2 text-ink-3 ring-1 ring-inset ring-border',
  funcionarios: 'bg-primary-soft text-primary-hover',
  sempreObrigatorio: 'bg-pending-bg text-pending',
  vaiSeAplicar: 'bg-ok-bg text-ok',
  naoSeAplica: 'bg-surface-2 text-ink-3',
};

type TagProps = {
  kind: TagKey;
  children?: ReactNode;
  className?: string;
};

/** Etiqueta de 11px: obrigatoriedade e marcações curtas. */
export function Tag({ kind, children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap rounded-badge px-1.5 py-0.5 text-tag font-medium',
        KIND_CLASS[kind],
        className,
      )}
    >
      {children ?? strings.tags[kind]}
    </span>
  );
}
