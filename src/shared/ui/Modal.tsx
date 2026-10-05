import { useCallback, useId, useRef, type ReactNode } from 'react';
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/shared/lib';
import { strings } from '@/shared/strings';
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

  useEscapeKey(open, close);
  useFocusTrap(panelRef, open);
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-veil px-4">
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
          className="relative max-h-full w-full max-w-modal overflow-y-auto rounded-card border border-border bg-surface p-5 shadow-modal"
        >
          <h2 id={titleId} className="text-block font-semibold">
            {title}
          </h2>
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
