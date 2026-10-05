import { useId, type ReactNode } from 'react';
import { cn } from '@/shared/lib';

type BlockProps = {
  title: ReactNode;
  /** Ação à direita do cabeçalho. */
  action?: ReactNode;
  description?: ReactNode;
  /** Corpo com padding de 16. Desligue quando o corpo for uma lista de linhas. */
  padded?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Cartão com cabeçalho (título + ação), corpo flexível e rodapé ancorado embaixo. */
export function Block({ title, action, description, padded = false, footer, children, className }: BlockProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex h-full min-w-0 flex-col overflow-hidden rounded-control border border-border bg-surface', className)}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-block font-semibold">
            {title}
          </h2>
          {description && <p className="mt-1 text-support text-ink-3">{description}</p>}
        </div>
        {action && <div className="flex-none">{action}</div>}
      </header>
      <div className={cn('flex-1', padded && 'p-4')}>{children}</div>
      {footer && <footer className="mt-auto border-t border-border px-4 py-3">{footer}</footer>}
    </section>
  );
}
