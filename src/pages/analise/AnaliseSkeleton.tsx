import { Skeleton, SkeletonBlock, Stack } from '@/shared/ui';

/** Mesma geometria da análise: título, visualizador e coluna de 380px. */
export function AnaliseSkeleton() {
  return (
    <Stack>
      <Skeleton className="h-8 w-2/3 max-w-140" />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_var(--spacing-review-aside)]">
        <Skeleton className="h-140 w-full max-lg:h-100" />
        <Stack>
          <SkeletonBlock rows={3} />
          <SkeletonBlock rows={2} />
        </Stack>
      </div>
    </Stack>
  );
}
