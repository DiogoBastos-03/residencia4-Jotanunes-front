import { cn } from '@/shared/lib';

/**
 * primary: ação principal (grafite). secondary: ação com borda. tertiary: ação discreta.
 * link: ação em texto. danger: SÓ no botão que confirma uma ação destrutiva.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link' | 'danger';
export type ButtonSize = 'sm' | 'md';

const BASE =
  'focus-ring inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-control text-support font-semibold disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45';

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'interactive-press border border-action bg-action text-white hover:not-disabled:border-action-hover hover:not-disabled:bg-action-hover active:not-disabled:border-action-pressed active:not-disabled:bg-action-pressed',
  secondary:
    'interactive-press border border-border-strong bg-surface text-ink-2 hover:not-disabled:bg-action-soft hover:not-disabled:text-ink active:not-disabled:bg-action-soft',
  tertiary: 'interactive-color border border-transparent bg-transparent text-ink-3 hover:not-disabled:bg-action-soft hover:not-disabled:text-ink-2',
  link: 'interactive-color border border-transparent bg-transparent text-ink underline-offset-2 hover:not-disabled:underline',
  danger:
    'interactive-press border border-destructive bg-destructive text-white hover:not-disabled:border-destructive-hover hover:not-disabled:bg-destructive-hover active:not-disabled:bg-destructive-hover',
};

const SIZE: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { sm: 'h-8 px-3 max-md:min-h-tap', md: 'h-10 px-4 max-md:min-h-tap' },
  secondary: { sm: 'h-8 px-3 max-md:min-h-tap', md: 'h-10 px-4 max-md:min-h-tap' },
  tertiary: { sm: 'h-8 px-2 max-md:min-h-tap', md: 'h-10 px-3 max-md:min-h-tap' },
  link: { sm: 'h-8 px-0 max-md:min-h-tap', md: 'h-10 px-0 max-md:min-h-tap' },
  danger: { sm: 'h-8 px-3 max-md:min-h-tap', md: 'h-10 px-4 max-md:min-h-tap' },
};

export function buttonClasses(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  fullWidth = false,
  className?: string,
): string {
  return cn(BASE, VARIANT[variant], SIZE[variant][size], fullWidth && 'w-full', className);
}
