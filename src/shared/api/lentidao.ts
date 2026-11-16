import { createStore, useStore } from '@/shared/lib';

/** A partir de quanto tempo uma requisição em andamento conta como lenta. */
export const LIMIAR_LENTIDAO_MS = 4_000;

/** Quantas requisições estão em andamento há mais de LIMIAR_LENTIDAO_MS. */
const lentas = createStore(0);

/**
 * Marca o início de uma requisição. Se ela passar do limiar, conta como lenta até terminar.
 * Devolve a função a chamar quando ela terminar (com sucesso ou não).
 */
export function acompanharLentidao(): () => void {
  let contou = false;
  const timer = setTimeout(() => {
    contou = true;
    lentas.set((n) => n + 1);
  }, LIMIAR_LENTIDAO_MS);
  return () => {
    clearTimeout(timer);
    if (contou) lentas.set((n) => n - 1);
  };
}

/** true enquanto houver requisição lenta — no Render Free, é o serviço acordando. Lentidão não é erro. */
export function useServicoAcordando(): boolean {
  return useStore(lentas) > 0;
}
