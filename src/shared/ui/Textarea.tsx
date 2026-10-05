import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import { controlClasses } from './controlStyles';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ invalid = false, className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, cn('block resize-none px-3 py-2.5', className))}
      {...rest}
    />
  );
}
