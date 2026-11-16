import { lazy, Suspense, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { env } from '@/shared/config/env';
import { ToastProvider } from '@/shared/ui';
import { criarQueryClient } from './queryClient';

/** Devtools só em desenvolvimento — o import dinâmico mantém a lib fora da build de produção. */
const Devtools = env.dev
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : null;

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(criarQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
      {Devtools && (
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
