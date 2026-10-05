import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { strings } from '@/shared/strings';
import { Toast, type ToastTone } from './Toast';

type ToastItem = { id: number; message: string; tone: ToastTone };

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(0);

  const dismiss = useCallback(() => setToast(null), []);

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, tone });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), DURATION);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

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
          <div key={toast.id} className="pointer-events-auto">
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
