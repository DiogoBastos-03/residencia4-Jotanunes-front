import { useCallback, useState } from 'react';
import { Outlet } from 'react-router';
import { useQueueCount } from '@/features/analise';
import { strings } from '@/shared/strings';
import { MobileSidebar } from './MobileSidebar';
import { MobileTopBar } from './MobileTopBar';
import { Sidebar } from './Sidebar';

/**
 * Sidebar + área de conteúdo, com padding 12 na app e gap 8 entre as duas.
 * Acima de 1024px a sidebar é fixa e o conteúdo rola dentro do cartão;
 * até 1024px a sidebar vira off-canvas e a página rola normalmente.
 */
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { data: queueCount } = useQueueCount();

  return (
    <div className="flex min-h-dvh gap-2 bg-app p-3 nav:h-dvh">
      <a
        href="#conteudo"
        className="focus-ring sr-only z-50 rounded-control bg-surface px-4 py-2 text-support font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {strings.layout.skipToContent}
      </a>
      <Sidebar queueCount={queueCount} className="hidden nav:flex" />
      <MobileSidebar open={menuOpen} onClose={closeMenu} queueCount={queueCount} />
      <main
        id="conteudo"
        tabIndex={-1}
        className="relative min-w-0 flex-1 rounded-card border border-border bg-surface p-5 outline-none nav:overflow-y-auto"
      >
        <MobileTopBar onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
        <Outlet />
      </main>
    </div>
  );
}
