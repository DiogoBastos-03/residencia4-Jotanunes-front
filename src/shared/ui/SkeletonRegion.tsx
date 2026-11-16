import type { ReactNode } from 'react';
import { useServicoAcordando } from '@/shared/api';
import { strings } from '@/shared/strings';

/**
 * Envolve um esqueleto de página: anuncia o carregamento uma vez só.
 * Se alguma requisição passa de 4 s (o Render Free acordando), mostra uma linha discreta
 * acima do esqueleto; ela some quando a resposta chega. Lentidão não é erro.
 */
export function SkeletonRegion({ children, label = strings.ui.skeleton.loading }: { children: ReactNode; label?: string }) {
  const acordando = useServicoAcordando();
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {acordando && <p className="mb-3 text-support text-ink-3">{strings.ui.skeleton.acordando}</p>}
      {children}
    </div>
  );
}
