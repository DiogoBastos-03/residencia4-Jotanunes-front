import {
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import type { HeroIcon } from '@/shared/ui';
import { paths } from '@/shared/lib';

export type NavItem = {
  to: string;
  label: string;
  icon: HeroIcon;
  /** Só fica ativo na rota exata. */
  end?: boolean;
  /** Mostra o contador da fila. */
  queueCount?: boolean;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { to: paths.visaoGeral, label: strings.layout.nav.visaoGeral, icon: Squares2X2Icon, end: true },
  { to: paths.fila, label: strings.layout.nav.fila, icon: QueueListIcon, queueCount: true },
  { to: paths.obras, label: strings.layout.nav.obras, icon: BuildingOffice2Icon },
  { to: paths.fornecedores, label: strings.layout.nav.fornecedores, icon: BuildingStorefrontIcon },
  { to: paths.exigencias, label: strings.layout.nav.exigencias, icon: ClipboardDocumentListIcon },
  { to: paths.relatorios, label: strings.layout.nav.relatorios, icon: ChartBarIcon },
];
