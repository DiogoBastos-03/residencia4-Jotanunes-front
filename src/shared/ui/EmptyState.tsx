import type { ReactNode } from 'react';
import { InboxIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { Icon, type HeroIcon } from './Icon';

type EmptyStateProps = {
  title: string;
  /** Diga o que fazer, não só que está vazio. */
  description: ReactNode;
  icon?: HeroIcon;
  action?: ReactNode;
  /** Com borda própria (padrão) ou solto dentro de um cartão existente. */
  framed?: boolean;
  className?: string;
};

export function EmptyState({ title, description, icon = InboxIcon, action, framed = true, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center px-5 py-18 text-center max-sm:py-12',
        framed && 'rounded-control border border-border',
        className,
      )}
    >
      <Icon icon={icon} size={24} className="text-ink-4" />
      <h2 className="mt-3 text-block font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-120 text-body text-ink-3">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
