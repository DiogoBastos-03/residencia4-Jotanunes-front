import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn, EXIT_MS } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Toast, type ToastTone } from './Toast';

type ToastItem = { id: number; message: string; tone: ToastTone; saindo: boolean };

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** O aviso some em 3,2s. */
const DURATION = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timers = useRef<number[]>([]);
  const nextId = useRef(0);

  const limpar = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const dismiss = useCallback(() => {
    limpar();
    setToast((atual) => (atual ? { ...atual, saindo: true } : null));
    timers.current.push(window.setTimeout(() => setToast(null), EXIT_MS.toast));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      limpar();
      nextId.current += 1;
      setToast({ id: nextId.current, message, tone, saindo: false });
      timers.current.push(window.setTimeout(dismiss, DURATION));
    },
    [dismiss],
  );

  useEffect(() => limpar, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-label={strings.ui.toast.region}
        className="pointer-events-none fixed right-5 bottom-5 z-40 max-sm:right-4 max-sm:bottom-4 max-sm:left-4"
      >
        {toast && (
          <div
            key={toast.id}
            className={cn('pointer-events-auto', toast.saindo ? 'animate-toast-out' : 'animate-toast-in')}
          >
            <Toast message={toast.message} tone={toast.tone} onDismiss={dismiss} />
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  return context;
}
