import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { Icon } from './Icon';

type Back = {
  to: string;
  label: string;
  /** crumb: link de texto acima do título. icon: botão quadrado à esquerda do título. */
  style?: 'crumb' | 'icon';
};

type PageHeaderProps = {
  title: ReactNode;
  /** page: título de página (28). subpage: página interna (24). */
  level?: 'page' | 'subpage';
  back?: Back;
  /** Badges ao lado do título. */
  badges?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, level = 'page', back, badges, subtitle, actions }: PageHeaderProps) {
  const crumb = back && back.style !== 'icon';
  const iconBack = back && back.style === 'icon';

  return (
    <header>
      {crumb && (
        <Link
          to={back.to}
          className="focus-ring interactive-color -mx-1 inline-flex items-center gap-1.5 rounded-control px-1 text-support font-medium text-ink-3 hover:text-ink-2 max-md:min-h-tap"
        >
          <Icon icon={ArrowLeftIcon} size={16} />
          {back.label}
        </Link>
      )}
      <div
        className={cn(
          'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between',
          crumb && 'mt-2',
        )}
      >
        <div className={cn('flex min-w-0 gap-3', iconBack ? 'items-start lg:items-center' : '')}>
          {iconBack && (
            <Link
              to={back.to}
              aria-label={back.label}
              title={back.label}
              className="focus-ring interactive-icon inline-flex size-8 flex-none items-center justify-center rounded-control border border-border-strong bg-surface text-ink-2 max-md:size-tap"
            >
              <Icon icon={ArrowLeftIcon} size={20} />
            </Link>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className={cn('font-semibold', level === 'page' ? 'text-page' : 'text-subpage')}>{title}</h1>
              {badges}
            </div>
            {subtitle && <div className="mt-1 text-support text-ink-3">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 lg:flex-none">{actions}</div>}
      </div>
    </header>
  );
}
