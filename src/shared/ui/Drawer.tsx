import { useCallback, useId, useRef, type ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { IconButton } from './IconButton';
import { Portal } from './Portal';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rodapé fixo — normalmente Cancelar + ação principal. */
  footer?: ReactNode;
  children: ReactNode;
};

/** Painel lateral de 480px com véu. Tela cheia abaixo de 640px. */
export function Drawer({ open, onClose, title, subtitle, footer, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const subtitleId = useId();
  const close = useCallback(() => onClose(), [onClose]);

  useEscapeKey(open, close);
  useFocusTrap(panelRef, open);
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-20 bg-veil">
        <button
          type="button"
          tabIndex={-1}
          aria-label={strings.ui.drawer.close}
          className="absolute inset-0 size-full cursor-default"
          onClick={close}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={subtitle ? subtitleId : undefined}
          className="absolute inset-y-0 right-0 flex w-drawer max-w-full flex-col border-l border-border bg-surface max-sm:w-full max-sm:border-l-0"
        >
          <div className="flex items-start gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-block font-semibold">
                {title}
              </h2>
              {subtitle && (
                <p id={subtitleId} className="mt-0.75 text-support text-ink-3">
                  {subtitle}
                </p>
              )}
            </div>
            <IconButton icon={XMarkIcon} label={strings.ui.drawer.close} variant="ghost" size="sm" onClick={close} />
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>
          )}
        </div>
      </div>
    </Portal>
  );
}
