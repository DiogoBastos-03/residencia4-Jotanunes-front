import { useCallback, useId, useRef, type ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn, EXIT_MS, useBodyScrollLock, useEscapeKey, useExitTransition, useFocusTrap } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { IconButton } from './IconButton';
import { Portal } from './Portal';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Botões alinhados à direita. */
  footer: ReactNode;
  children?: ReactNode;
};

/** Diálogo centralizado de 440px; abaixo disso, margem de 16px nas laterais. */
export function Modal({ open, onClose, title, description, footer, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const close = useCallback(() => onClose(), [onClose]);

  const { mounted, exiting } = useExitTransition(open, EXIT_MS.modal);
  useEscapeKey(open, close);
  useFocusTrap(panelRef, open && mounted);
  useBodyScrollLock(mounted);

  if (!mounted) return null;

  return (
    <Portal>
      <div
        className={cn(
          'fixed inset-0 z-30 flex items-center justify-center bg-veil px-4',
          exiting ? 'animate-veil-out' : 'animate-veil-in',
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={strings.ui.modal.close}
          className="absolute inset-0 size-full cursor-default"
          onClick={close}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'relative max-h-full w-full max-w-modal overflow-y-auto rounded-card border border-border bg-surface p-5 shadow-modal',
            exiting ? 'animate-modal-out' : 'animate-modal-in',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-block font-semibold">
              {title}
            </h2>
            <IconButton icon={XMarkIcon} label={strings.ui.modal.close} variant="ghost" size="sm" onClick={close} className="-mt-1 -mr-1" />
          </div>
          {description && (
            <p id={descriptionId} className="mt-2 text-body text-ink-3">
              {description}
            </p>
          )}
          {children && <div className="mt-3">{children}</div>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">{footer}</div>
        </div>
      </div>
    </Portal>
  );
}
