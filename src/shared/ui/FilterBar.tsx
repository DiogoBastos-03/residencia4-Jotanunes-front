import { cn } from '@/shared/lib';

export type FilterOption<V extends string> = {
  value: V;
  label: string;
  count?: number;
};

type FilterBarProps<V extends string> = {
  /** Nome acessível do grupo de filtros. */
  label: string;
  options: readonly FilterOption<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
};

/** Faixa colada de filtros com divisórias de 1px. Rola na horizontal sem barra. */
export function FilterBar<V extends string>({ label, options, value, onChange, className }: FilterBarProps<V>) {
  return (
    <div className={cn('no-scrollbar max-w-full overflow-x-auto', className)}>
      <div role="group" aria-label={label} className="inline-flex overflow-hidden rounded-control border border-border">
        {options.map((option, index) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'focus-ring interactive-color tabular h-8.5 whitespace-nowrap px-3 text-support max-md:min-h-tap',
                index > 0 && 'border-l border-border',
                active
                  ? 'bg-action-soft font-semibold text-ink'
                  : 'bg-surface font-medium text-ink-3 hover:bg-surface-2 hover:text-ink-2',
              )}
            >
              {option.label}
              {option.count !== undefined && ` ${option.count}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
