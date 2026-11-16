import { Skeleton, SkeletonTable, Stack } from '@/shared/ui';

export function ObraSkeleton() {
  return (
    <Stack>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-96 max-w-full" />
      <SkeletonTable rows={6} columns={4} />
    </Stack>
  );
}
