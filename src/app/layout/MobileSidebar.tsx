import { useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn, EXIT_MS, useBodyScrollLock, useEscapeKey, useExitTransition, useFocusTrap } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { IconButton, Portal } from '@/shared/ui';
import { Sidebar } from './Sidebar';

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
  queueCount: number | undefined;
};

/** Sidebar off-canvas (até 1024px): véu, Esc e clique fora fecham; foco preso enquanto aberta. */
export function MobileSidebar({ open, onClose, queueCount }: MobileSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { mounted, exiting } = useExitTransition(open, EXIT_MS.drawer);
  useEscapeKey(open, onClose);
  useFocusTrap(panelRef, open && mounted);
  useBodyScrollLock(mounted);

  if (!mounted) return null;

  return (
    <Portal>
      <div className={cn('fixed inset-0 z-30 bg-veil nav:hidden', exiting ? 'animate-veil-out' : 'animate-veil-in')}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={strings.layout.closeMenu}
          className="absolute inset-0 size-full cursor-default"
          onClick={onClose}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={strings.layout.menuDialog}
          className="absolute inset-y-3 left-3 flex items-start gap-2"
        >
          <Sidebar queueCount={queueCount} onNavigate={onClose} className="h-full overflow-y-auto" />
          <IconButton icon={XMarkIcon} label={strings.layout.closeMenu} onClick={onClose} />
        </div>
      </div>
    </Portal>
  );
}
