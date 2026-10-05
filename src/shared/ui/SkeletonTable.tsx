import { Skeleton } from './Skeleton';

type SkeletonTableProps = {
  rows?: number;
  columns?: number;
};

const WIDTHS = ['w-4/5', 'w-3/5', 'w-2/3', 'w-1/2', 'w-3/4', 'w-2/5'];

/** Esqueleto com a mesma geometria da Table (e dos cartões no celular). */
export function SkeletonTable({ rows = 6, columns = 6 }: SkeletonTableProps) {
  const rowList = Array.from({ length: rows }, (_, r) => r);
  const colList = Array.from({ length: columns }, (_, c) => c);
  return (
    <>
      <div className="hidden overflow-hidden rounded-control border border-border lg:block">
        <div className="flex h-9 items-center gap-4 bg-surface-2 px-4">
          {colList.map((c) => (
            <Skeleton key={c} className="h-2.5 flex-1" />
          ))}
        </div>
        {rowList.map((r) => (
          <div key={r} className="flex h-12 items-center gap-4 border-t border-border px-4">
            {colList.map((c) => (
              <div key={c} className="flex-1">
                <Skeleton className={`h-3 ${WIDTHS[(r + c) % WIDTHS.length] ?? 'w-1/2'}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 lg:hidden">
        {rowList.slice(0, 4).map((r) => (
          <div key={r} className="rounded-control border border-border p-4">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
            <Skeleton className="mt-3 h-11 w-full" />
          </div>
        ))}
      </div>
    </>
  );
}
