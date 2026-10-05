import { useSearchParams } from 'react-router';
import type { PeriodoRelatorio } from '@/entities';

const PERIODOS: readonly PeriodoRelatorio[] = ['30d', '90d', 'ano'];

/** Período do relatório na URL (?periodo=). */
export function usePeriodo(): [PeriodoRelatorio, (p: PeriodoRelatorio) => void] {
  const [params, setParams] = useSearchParams();
  const periodo = PERIODOS.find((p) => p === params.get('periodo')) ?? '30d';
  const setPeriodo = (p: PeriodoRelatorio) =>
    setParams(
      (atual) => {
        const proximo = new URLSearchParams(atual);
        if (p === '30d') proximo.delete('periodo');
        else proximo.set('periodo', p);
        return proximo;
      },
      { replace: true },
    );
  return [periodo, setPeriodo];
}

export function ehPeriodo(valor: string): valor is PeriodoRelatorio {
  return PERIODOS.some((p) => p === valor);
}
