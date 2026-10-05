import { cn } from '@/shared/lib';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link';
export type ButtonSize = 'sm' | 'md';

const BASE =
  'focus-ring inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-control text-support font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'border border-primary bg-primary text-white hover:not-disabled:border-primary-hover hover:not-disabled:bg-primary-hover',
  secondary: 'border border-border-strong bg-surface text-ink-2 hover:not-disabled:bg-surface-2 hover:not-disabled:text-ink',
  tertiary: 'border border-transparent bg-transparent text-ink-3 hover:not-disabled:bg-surface-2 hover:not-disabled:text-ink-2',
  link: 'border border-transparent bg-transparent text-primary-hover hover:not-disabled:text-primary',
};

const SIZE: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { sm: 'h-8 px-3 max-md:min-h-tap', md: 'h-10 px-4 max-md:min-h-tap' },
  secondary: { sm: 'h-8 px-3 max-md:min-h-tap', md: 'h-10 px-4 max-md:min-h-tap' },
  tertiary: { sm: 'h-8 px-2 max-md:min-h-tap', md: 'h-10 px-3 max-md:min-h-tap' },
  link: { sm: 'h-8 px-0 max-md:min-h-tap', md: 'h-10 px-0 max-md:min-h-tap' },
};

export function buttonClasses(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  fullWidth = false,
  className?: string,
): string {
  return cn(BASE, VARIANT[variant], SIZE[variant][size], fullWidth && 'w-full', className);
}
