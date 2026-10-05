import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { lerOrigem, PARAM_ORIGEM, type Origem } from '@/shared/lib';

/** De onde a análise foi aberta (?de=). Sem parâmetro, é a fila. */
export function useOrigem(): Origem {
  const [params] = useSearchParams();
  const valor = params.get(PARAM_ORIGEM);
  return useMemo(() => lerOrigem(valor), [valor]);
}
