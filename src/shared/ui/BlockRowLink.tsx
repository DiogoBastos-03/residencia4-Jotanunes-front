import { Link, type LinkProps } from 'react-router';
import { cn } from '@/shared/lib';

/** Linha de Block que leva a outra tela: a linha inteira é o alvo; destaca, não cresce. */
export function BlockRowLink({ className, ...rest }: LinkProps) {
  return (
    <Link
      className={cn(
        'focus-ring interactive-row flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 max-md:flex-wrap',
        typeof className === 'string' ? className : undefined,
      )}
      {...rest}
    />
  );
}
