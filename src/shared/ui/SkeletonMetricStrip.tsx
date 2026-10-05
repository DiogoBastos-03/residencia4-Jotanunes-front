import { cn } from '@/shared/lib';
import { Skeleton } from './Skeleton';

const COLUMNS = {
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

export function SkeletonMetricStrip({ columns = 4 }: { columns?: 3 | 4 }) {
  return (
    <div className={cn('grid gap-px overflow-hidden rounded-control border border-border bg-border', COLUMNS[columns])}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="flex h-metric flex-col bg-surface p-4 max-sm:h-16 max-sm:flex-row max-sm:items-center max-sm:justify-between">
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="mt-auto h-8 w-16 max-sm:mt-0" />
          <Skeleton className="mt-2 h-3 w-1/2 max-sm:hidden" />
        </div>
      ))}
    </div>
  );
}
