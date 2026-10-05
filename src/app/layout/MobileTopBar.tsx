import { Bars3Icon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { IconButton } from '@/shared/ui';
import { BrandMark } from './BrandMark';

/** Topo da área de conteúdo até 1024px: botão do menu + marca. */
export function MobileTopBar({ onOpenMenu, menuOpen }: { onOpenMenu: () => void; menuOpen: boolean }) {
  return (
    <div className="-mx-5 -mt-5 mb-5 flex items-center gap-3 border-b border-border px-5 py-3 nav:hidden">
      <IconButton
        icon={Bars3Icon}
        label={strings.layout.openMenu}
        aria-expanded={menuOpen}
        aria-haspopup="dialog"
        onClick={onOpenMenu}
      />
      <BrandMark compact />
    </div>
  );
}
