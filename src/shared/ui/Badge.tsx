import type { ReactNode } from 'react';
import { CubeIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { strings, type StatusKey } from '@/shared/strings';
import { Icon, type HeroIcon } from './Icon';

export type Tone = 'ok' | 'review' | 'pending' | 'warn' | 'danger' | 'expired' | 'primary';

/** Cada status resolve o próprio par de cores. */
export const STATUS_TONE: Record<StatusKey, Tone> = {
  aprovado: 'ok',
  apto: 'ok',
  ativo: 'ok',
  emExecucao: 'ok',
  emAnalise: 'review',
  servico: 'review',
  concluida: 'review',
  aguardandoAcesso: 'review',
  emDia: 'ok',
  pendente: 'pending',
  normal: 'pending',
  material: 'pending',
  planejamento: 'pending',
  rascunho: 'pending',
  semArquivos: 'pending',
  venceEmBreve: 'warn',
  comPendencia: 'warn',
  semLista: 'warn',
  reprovado: 'danger',
  bloqueado: 'danger',
  urgente: 'danger',
  vencido: 'expired',
  funcionarios: 'primary',
};

export const TONE_CLASS: Record<Tone, string> = {
  ok: 'bg-ok-bg text-ok',
  review: 'bg-review-bg text-review',
  pending: 'bg-pending-bg text-pending',
  warn: 'bg-warn-bg text-warn',
  danger: 'bg-danger-bg text-danger',
  expired: 'bg-expired-bg text-expired',
  primary: 'bg-primary-soft text-primary-hover',
};

const STATUS_ICON: Partial<Record<StatusKey, HeroIcon>> = {
  servico: WrenchScrewdriverIcon,
  material: CubeIcon,
  semLista: ExclamationTriangleIcon,
};

type BadgeProps = {
  status: StatusKey;
  /** Substitui o rótulo padrão do status, mantendo as cores. */
  children?: ReactNode;
  className?: string;
};

export function Badge({ status, children, className }: BadgeProps) {
  const icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        'tabular inline-flex items-center gap-1 whitespace-nowrap rounded-badge px-1.75 py-1 text-label font-medium',
        TONE_CLASS[STATUS_TONE[status]],
        className,
      )}
    >
      {icon && <Icon icon={icon} size={12} />}
      {children ?? strings.status[status]}
    </span>
  );
}
