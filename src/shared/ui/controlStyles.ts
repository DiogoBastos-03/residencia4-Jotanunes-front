import { cn } from '@/shared/lib';

/** Base comum de Input, Select e Textarea. */
export function controlClasses(invalid: boolean, className?: string): string {
  return cn(
    'focus-field interactive-color w-full rounded-control border bg-surface text-body text-ink placeholder:text-ink-4',
    'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-4',
    invalid ? 'border-danger' : 'border-border-strong hover:not-disabled:not-focus:border-ink-4',
    className,
  );
}
