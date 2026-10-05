import { Link, type LinkProps } from 'react-router';
import { cn } from '@/shared/lib';

type CardLinkProps = LinkProps & { padded?: boolean };

/** Cartão inteiro clicável: cresce 1% no hover, encolhe ao pressionar. */
export function CardLink({ padded = true, className, ...rest }: CardLinkProps) {
  return (
    <Link
      className={cn(
        'focus-ring interactive-lift flex h-full min-w-0 flex-col rounded-control border border-border bg-surface',
        padded && 'p-4',
        typeof className === 'string' ? className : undefined,
      )}
      {...rest}
    />
  );
}
