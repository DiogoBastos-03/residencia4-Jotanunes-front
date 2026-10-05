import type { ButtonHTMLAttributes } from 'react';
import { Icon, type HeroIcon } from './Icon';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: HeroIcon;
  fullWidth?: boolean;
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  fullWidth = false,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, fullWidth, className)} {...rest}>
      {icon && <Icon icon={icon} size={size === 'md' ? 20 : 16} />}
      {children}
    </button>
  );
}
