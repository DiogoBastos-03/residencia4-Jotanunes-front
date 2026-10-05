import { cn } from '@/shared/lib';

export type HistoryItem = { id: string; quando: string; autor: string; descricao: string };

/** Linha do tempo: quando · quem · o que fez. */
export function HistoryList({ items, className }: { items: readonly HistoryItem[]; className?: string }) {
  return (
    <ol className={cn('rounded-control border border-border', className)}>
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0 max-sm:flex-col max-sm:gap-0.5">
          <span className="tabular w-32.5 flex-none text-support text-ink-4">{item.quando}</span>
          <span className="min-w-0 text-body">
            <span className="font-medium">{item.autor}</span> {item.descricao}
          </span>
        </li>
      ))}
    </ol>
  );
}
