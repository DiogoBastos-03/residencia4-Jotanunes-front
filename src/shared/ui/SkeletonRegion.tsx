import type { ReactNode } from 'react';
import { strings } from '@/shared/strings';

/** Envolve um esqueleto de página: anuncia o carregamento uma vez só. */
export function SkeletonRegion({ children, label = strings.ui.skeleton.loading }: { children: ReactNode; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  );
}
