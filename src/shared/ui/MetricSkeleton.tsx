import { Skeleton } from './Skeleton';

/** Uma célula de métrica carregando, com a mesma altura de Metric. */
export function MetricSkeleton() {
  return (
    <div className="flex h-metric flex-col bg-surface p-4 max-sm:h-16 max-sm:flex-row max-sm:items-center max-sm:justify-between">
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="mt-auto h-8 w-16 max-sm:mt-0" />
      <Skeleton className="mt-2 h-3 w-1/2 max-sm:hidden" />
    </div>
  );
}
