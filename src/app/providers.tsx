import type { ReactNode } from 'react';
import { ToastProvider } from '@/shared/ui';

export function AppProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
