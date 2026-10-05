import { cn } from '@/shared/lib';

/** Bloco cinza pulsante. Dimensione com classes de largura/altura. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block animate-skeleton rounded-badge bg-surface-3', className)} />;
}
