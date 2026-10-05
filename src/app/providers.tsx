import { useEffect, type ReactNode } from 'react';
import { garantirDataset } from '@/mocks';
import { USAR_API } from '@/shared/lib';
import { ToastProvider } from '@/shared/ui';

export function AppProviders({ children }: { children: ReactNode }) {
  // Com a API, a hidratação começa no boot — inclusive em telas sem consulta (ex.: cadastro).
  // Se falhar, cada tela mostra o próprio erro com "Tentar de novo".
  useEffect(() => {
    if (USAR_API) garantirDataset().catch(() => undefined);
  }, []);
  return <ToastProvider>{children}</ToastProvider>;
}
