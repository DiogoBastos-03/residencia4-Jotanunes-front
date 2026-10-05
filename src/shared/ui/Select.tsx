import type { SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { controlClasses } from './controlStyles';
import { Icon } from './Icon';

export type SelectOption = { value: string; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> & {
  options: readonly SelectOption[];
  invalid?: boolean;
  size?: 'sm' | 'md';
  /** Classe do contêiner (largura). */
  wrapperClassName?: string;
};

export function Select({
  options,
  invalid = false,
  size = 'md',
  className,
  wrapperClassName,
  ...rest
}: SelectProps) {
  return (
    <div className={cn('relative', wrapperClassName ?? 'w-full')}>
      <select
        aria-invalid={invalid || undefined}
        className={controlClasses(
          invalid,
          cn(
            'appearance-none pr-9',
            size === 'md' ? 'h-10 pl-3' : 'h-9 pl-2.5 text-support text-ink-2 max-md:min-h-tap',
            className,
          ),
        )}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        icon={ChevronDownIcon}
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-3"
      />
    </div>
  );
}
