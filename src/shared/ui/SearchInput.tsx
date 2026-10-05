import type { InputHTMLAttributes } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { controlClasses } from './controlStyles';
import { Icon } from './Icon';

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Rótulo acessível (o campo não tem rótulo visível). */
  label: string;
  wrapperClassName?: string;
};

export function SearchInput({ label, wrapperClassName, className, ...rest }: SearchInputProps) {
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <Icon
        icon={MagnifyingGlassIcon}
        size={16}
        className="pointer-events-none absolute top-3 left-3 text-ink-4"
      />
      <input
        type="search"
        aria-label={label}
        className={controlClasses(false, cn('h-10 pr-3 pl-9 max-md:min-h-tap', className))}
        {...rest}
      />
    </div>
  );
}
