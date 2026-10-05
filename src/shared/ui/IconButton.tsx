import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import { Icon, type HeroIcon } from './Icon';

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  icon: HeroIcon;
  /** Texto acessível — obrigatório, porque o botão não tem rótulo visível. */
  label: string;
  variant?: 'secondary' | 'ghost';
  size?: 'sm' | 'md';
};

const VARIANT = {
  secondary: 'border border-border-strong bg-surface text-ink-2',
  ghost: 'border border-transparent bg-transparent text-ink-3',
} as const;

const SIZE = {
  sm: 'size-7 max-md:size-tap',
  md: 'size-8 max-md:size-tap',
} as const;

export function IconButton({
  icon,
  label,
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'focus-ring interactive-icon inline-flex flex-none items-center justify-center rounded-control disabled:cursor-not-allowed disabled:opacity-45',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      <Icon icon={icon} size={size === 'md' ? 20 : 16} />
    </button>
  );
}
