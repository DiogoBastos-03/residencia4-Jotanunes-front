import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

/** Geist Mono 13/500 — só para CNPJ, CPF, código de obra e datas em tabela. */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-support font-medium text-ink-3', className)}>{children}</span>;
}
