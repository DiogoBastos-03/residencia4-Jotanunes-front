import type { InputHTMLAttributes, ReactNode } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { Icon } from './Icon';

type CheckboxBoxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Marcado e travado: aparece cinza (ex.: "já vinculada"). */
  locked?: boolean;
};

/** Só o quadrado 18px. Use dentro de um <label> que dê o texto. */
export function CheckboxBox({ locked = false, className, disabled, checked, ...rest }: CheckboxBoxProps) {
  return (
    <span className={cn('relative inline-flex size-4.5 flex-none', className)}>
      <input
        type="checkbox"
        disabled={disabled || locked}
        checked={locked ? true : checked}
        className={cn(
          'peer focus-ring interactive-color absolute inset-0 m-0 appearance-none rounded-badge border',
          locked
            ? 'border-border-strong bg-border-strong'
            : 'border-border-strong bg-surface checked:border-action checked:bg-action hover:not-disabled:not-checked:border-ink-4 disabled:opacity-45',
        )}
        {...rest}
      />
      <Icon
        icon={CheckIcon}
        size={12}
        className="pointer-events-none absolute inset-0 m-auto hidden text-white peer-checked:block"
      />
    </span>
  );
}

type CheckboxProps = CheckboxBoxProps & {
  label: ReactNode;
  description?: ReactNode;
};

/** Caixa de seleção com rótulo clicável. Alvo mínimo de 44px no celular. */
export function Checkbox({ label, description, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-start gap-2.5 max-md:min-h-tap max-md:items-center', className)}>
      <CheckboxBox {...rest} className="mt-px max-md:mt-0" />
      <span className="min-w-0">
        <span className="block text-body text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-support text-ink-3">{description}</span>}
      </span>
    </label>
  );
}
