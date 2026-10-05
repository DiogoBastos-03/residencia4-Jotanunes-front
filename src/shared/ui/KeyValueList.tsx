import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

export type KeyValueItem = {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** No layout stacked, ocupa a linha inteira. */
  full?: boolean;
};

type KeyValueListProps = {
  items: readonly KeyValueItem[];
  /** columns: rótulo à esquerda (100px). stacked: grade 2 colunas com rótulo acima. */
  layout?: 'columns' | 'stacked';
  className?: string;
};

export function KeyValueList({ items, layout = 'columns', className }: KeyValueListProps) {
  if (layout === 'stacked') {
    return (
      <dl className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>
        {items.map((item) => (
          <div key={item.key} className={cn('min-w-0', item.full && 'sm:col-span-2')}>
            <dt className="text-label font-medium text-ink-2">{item.label}</dt>
            <dd className="mt-1 text-body break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className={cn('grid grid-cols-[100px_minmax(0,1fr)] items-baseline gap-2.5', className)}>
      {items.map((item) => (
        <div key={item.key} className="contents">
          <dt className="text-label font-medium text-ink-2">{item.label}</dt>
          <dd className="min-w-0 text-body break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
