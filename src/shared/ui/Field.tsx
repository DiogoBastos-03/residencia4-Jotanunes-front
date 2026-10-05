import { useId, type ReactNode } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { Icon } from './Icon';

export type FieldControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  invalid: boolean;
};

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

/** Rótulo + controle + dica ou mensagem de erro, ligados por id. */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-1.5 block text-label font-medium text-ink-2">
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-label text-danger">
          <Icon icon={ExclamationCircleIcon} size={16} />
          <span>{error}</span>
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-1.5 text-label text-ink-4">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
