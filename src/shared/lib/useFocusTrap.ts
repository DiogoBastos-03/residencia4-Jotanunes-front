import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Prende o foco dentro de `ref` enquanto `active`. Ao abrir, foca o primeiro
 * elemento (ou `initialFocus`); ao fechar, devolve o foco a quem estava focado antes.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  initialFocus?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const first = initialFocus?.current ?? focusables(container)[0] ?? container;
    first.focus();

    function handle(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !container) return;
      const items = focusables(container);
      const head = items[0];
      const tail = items[items.length - 1];
      if (!head || !tail) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault();
        head.focus();
      }
    }

    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('keydown', handle);
      if (trigger && document.contains(trigger)) trigger.focus();
    };
  }, [active, ref, initialFocus]);
}
