import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/shared/lib';

export type TabItem<V extends string> = { value: V; label: string };

type TabsProps<V extends string> = {
  label: string;
  items: readonly TabItem<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Conteúdo da aba ativa. */
  children: ReactNode;
  className?: string;
};

/** Abas com sublinhado vermelho. Setas ←/→, Home e End navegam entre abas. */
export function Tabs<V extends string>({ label, items, value, onChange, children, className }: TabsProps<V>) {
  const baseId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusAt(index: number) {
    const count = items.length;
    const next = items[(index + count) % count];
    if (!next) return;
    onChange(next.value);
    refs.current[(index + count) % count]?.focus();
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight') focusAt(index + 1);
    else if (event.key === 'ArrowLeft') focusAt(index - 1);
    else if (event.key === 'Home') focusAt(0);
    else if (event.key === 'End') focusAt(items.length - 1);
    else return;
    event.preventDefault();
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="no-scrollbar flex overflow-x-auto border-b border-border">
        {items.map((item, index) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.value)}
              onKeyDown={(event) => handleKey(event, index)}
              className={cn(
                'focus-ring interactive-color -mb-px mr-5 h-10 flex-none whitespace-nowrap border-b-2 px-0.5 text-support font-semibold last:mr-0 max-md:h-tap',
                selected ? 'border-action text-ink' : 'border-transparent text-ink-3 hover:text-ink-2',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        key={value}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${value}`}
        className="animate-tab-in"
      >
        {children}
      </div>
    </div>
  );
}
