import { Skeleton } from './Skeleton';

/** Esqueleto de Block: cabeçalho + linhas. */
export function SkeletonBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-control border border-border">
      <div className="flex h-12 items-center border-b border-border px-4">
        <Skeleton className="h-4 w-40" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-16 items-center gap-3 border-b border-border px-4 last:border-b-0">
          <div className="flex-1">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="mt-2 h-3 w-2/5" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
