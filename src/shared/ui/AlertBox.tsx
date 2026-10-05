import type { ReactNode } from 'react';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { Icon } from './Icon';

type AlertBoxProps = {
  variant: 'error' | 'warning';
  title?: ReactNode;
  children: ReactNode;
  /** Mostra o ícone à esquerda. */
  withIcon?: boolean;
  className?: string;
};

const VARIANT = {
  error: { box: 'bg-danger-bg text-danger', icon: ExclamationCircleIcon },
  warning: { box: 'bg-warn-bg text-warn', icon: ExclamationTriangleIcon },
} as const;

/** Faixa de alerta: erro (vermelho) ou atenção (âmbar). */
export function AlertBox({ variant, title, children, withIcon = false, className }: AlertBoxProps) {
  const { box, icon } = VARIANT[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={cn('flex items-start gap-2.5 rounded-control px-4 py-3 text-body', box, className)}
    >
      {withIcon && <Icon icon={icon} size={16} className="mt-0.5" />}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  );
}
