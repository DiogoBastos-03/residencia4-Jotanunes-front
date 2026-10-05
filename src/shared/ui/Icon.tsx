import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/shared/lib';

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

export type IconSize = 12 | 16 | 18 | 20 | 24;

/** Espessura de traço por tamanho, igual ao protótipo. */
const STROKE: Record<IconSize, number> = { 12: 2.5, 16: 2.2, 18: 2, 20: 1.8, 24: 1.5 };

const SIZE_CLASS: Record<IconSize, string> = {
  12: 'size-3',
  16: 'size-4',
  18: 'size-4.5',
  20: 'size-5',
  24: 'size-6',
};

type IconProps = {
  icon: HeroIcon;
  size?: IconSize;
  className?: string;
};

/** Ícone heroicons outline com tamanho e traço do design system. Sempre decorativo. */
export function Icon({ icon: Svg, size = 16, className }: IconProps) {
  return (
    <Svg
      aria-hidden="true"
      focusable="false"
      strokeWidth={STROKE[size]}
      className={cn('flex-none', SIZE_CLASS[size], className)}
    />
  );
}
