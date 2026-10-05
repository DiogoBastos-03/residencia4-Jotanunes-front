import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Button } from './Button';
import { Icon } from './Icon';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
  framed?: boolean;
  /** compact: uma linha, para dentro de cartões pequenos (métricas, blocos). */
  variant?: 'block' | 'compact';
  className?: string;
};

/** Falha ao carregar, com botão para tentar de novo. */
export function ErrorState({
  title = strings.ui.errorState.title,
  description = strings.ui.errorState.description,
  onRetry,
  framed = true,
  variant = 'block',
  className,
}: ErrorStateProps) {
  if (variant === 'compact') {
    return (
      <div role="alert" className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 bg-surface p-4 text-support text-ink-3', className)}>
        <Icon icon={ExclamationTriangleIcon} size={16} className="text-danger" />
        <span>{strings.ui.errorState.compact}</span>
        <Button variant="link" size="sm" onClick={onRetry}>
          {strings.ui.errorState.retry}
        </Button>
      </div>
    );
  }
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center px-5 py-18 text-center max-sm:py-12',
        framed && 'rounded-control border border-border',
        className,
      )}
    >
      <Icon icon={ExclamationTriangleIcon} size={24} className="text-danger" />
      <h2 className="mt-3 text-block font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-120 text-body text-ink-3">{description}</p>
      <div className="mt-4">
        <Button variant="secondary" icon={ArrowPathIcon} onClick={onRetry}>
          {strings.ui.errorState.retry}
        </Button>
      </div>
    </div>
  );
}
