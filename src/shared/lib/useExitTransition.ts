import { useEffect, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Mantém um overlay montado durante a animação de saída.
 * `exiting` fica true pelo tempo da saída; com movimento reduzido, some na hora.
 */
export function useExitTransition(open: boolean, exitMs: number): { mounted: boolean; exiting: boolean } {
  const [mounted, setMounted] = useState(open);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setExiting(false);
      return;
    }
    if (!mounted) return;
    setExiting(true);
    const timer = window.setTimeout(
      () => {
        setMounted(false);
        setExiting(false);
      },
      prefersReducedMotion() ? 0 : exitMs,
    );
    return () => window.clearTimeout(timer);
  }, [open, mounted, exitMs]);

  return { mounted: open || mounted, exiting: !open && mounted && exiting };
}

/** Durações de saída, iguais às do tema. */
export const EXIT_MS = { drawer: 180, modal: 150, toast: 150 } as const;
