import { Link, type LinkProps } from 'react-router';
import { Icon, type HeroIcon } from './Icon';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: HeroIcon;
  fullWidth?: boolean;
};

/** Link de navegação com a aparência de Button. */
export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  icon,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, fullWidth, typeof className === 'string' ? className : undefined)} {...rest}>
      {icon && <Icon icon={icon} size={size === 'md' ? 20 : 16} />}
      {children}
    </Link>
  );
}
