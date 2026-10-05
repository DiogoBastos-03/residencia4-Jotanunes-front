import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { Icon } from './Icon';

type ChoiceCardProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description: string;
  disabled?: boolean;
  /** Várias podem ser marcadas (checkbox nativo por baixo) — ex.: fornecedor de serviço e de material. */
  multiple?: boolean;
};

/** Opção em forma de cartão (rádio nativo por baixo; checkbox com `multiple`). Selecionado: borda e fundo grafite suave. */
export function ChoiceCard({ name, value, checked, onChange, title, description, disabled = false, multiple = false }: ChoiceCardProps) {
  return (
    <label
      className={cn(
        'interactive-color flex h-full gap-2.5 rounded-control border px-4 py-3 has-[:focus-visible]:shadow-focus',
        checked ? 'border-action bg-action-soft' : 'border-border-strong bg-surface hover:border-ink-4',
        disabled && 'cursor-not-allowed opacity-45',
      )}
    >
      <input
        type={multiple ? 'checkbox' : 'radio'}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex size-4.5 flex-none items-center justify-center rounded-badge border text-white',
          checked ? 'border-action bg-action' : 'border-border-strong bg-surface',
        )}
      >
        {checked && <Icon icon={CheckIcon} size={12} />}
      </span>
      <span className="min-w-0">
        <span className="block text-body font-semibold text-ink">{title}</span>
        <span className="mt-0.75 block text-support leading-[1.35] text-ink-3">{description}</span>
      </span>
    </label>
  );
}
