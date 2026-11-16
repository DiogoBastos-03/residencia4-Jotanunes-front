import { BuildingOffice2Icon, BuildingStorefrontIcon, ClipboardDocumentListIcon, DocumentTextIcon, ExclamationTriangleIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import type { HeroIcon } from '@/shared/ui';
import { paths } from '@/shared/lib';

export type NavItem = {
  to: string;
  label: string;
  icon: HeroIcon;
  /** Só fica ativo na rota exata. */
  end?: boolean;
};

/**
 * Só as telas que têm API. Fila de análise e Relatórios estão fora do menu (e das rotas,
 * ver src/app/router.tsx) até os endpoints existirem. Ao voltar a Fila, volta junto o
 * contador dela neste menu (era o hook useQueueCount de src/features/analise).
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: paths.visaoGeral, label: strings.layout.nav.visaoGeral, icon: Squares2X2Icon, end: true },
  { to: paths.pendencias, label: strings.layout.nav.pendencias, icon: ExclamationTriangleIcon },
  { to: paths.obras, label: strings.layout.nav.obras, icon: BuildingOffice2Icon },
  { to: paths.fornecedores, label: strings.layout.nav.fornecedores, icon: BuildingStorefrontIcon },
  { to: paths.exigencias, label: strings.layout.nav.exigencias, icon: ClipboardDocumentListIcon },
  { to: paths.tiposDocumento, label: strings.layout.nav.tiposDocumento, icon: DocumentTextIcon },
];
