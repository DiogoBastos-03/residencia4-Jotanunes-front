import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Icon, type HeroIcon } from './Icon';

type InfoNoteProps = {
  title?: ReactNode;
  children: ReactNode;
  icon?: HeroIcon;
  /** Ação à direita (ex.: link para ver mais). */
  action?: ReactNode;
  className?: string;
};

/** Caixa cinza de apoio: explica uma regra do produto. */
export function InfoNote({ title, children, icon, action, className }: InfoNoteProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-control border border-border bg-surface-2 px-4 py-3',
        className,
      )}
    >
      {icon && <Icon icon={icon} size={16} className="mt-0.5 text-ink-3" />}
      <div className="min-w-0 flex-1">
        {title && <p className="text-body font-semibold text-ink">{title}</p>}
        <div className={cn('text-support leading-[1.35] text-ink-3', title && 'mt-1')}>{children}</div>
      </div>
      {action && <div className="flex-none">{action}</div>}
    </div>
  );
}
