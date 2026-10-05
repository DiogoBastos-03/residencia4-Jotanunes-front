import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/shared/lib';
import { controlClasses } from './controlStyles';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  mono?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export function Input({ invalid = false, mono = false, className, type = 'text', ...rest }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, cn('h-10 px-3', mono && 'font-mono font-medium', className))}
      {...rest}
    />
  );
}
