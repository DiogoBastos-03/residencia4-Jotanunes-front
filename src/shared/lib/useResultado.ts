import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PARAM_ESTADO, type EstadoSimulado, type QueryResult } from './useMockQuery';

/** O mínimo de uma consulta (TanStack Query ou composição de várias) que a tela precisa. */
export type Consulta<T> = {
  data: T | undefined;
  error: Error | null;
  isPending: boolean;
  refetch: () => unknown;
};

/** Junta duas consultas: carregando se alguma carrega, erro se alguma falhou, dado quando as duas têm. */
export function juntar<A, B, R>(a: Consulta<A>, b: Consulta<B>, combinar: (a: A, b: B) => R): Consulta<R> {
  return {
    data: a.data !== undefined && b.data !== undefined ? combinar(a.data, b.data) : undefined,
    error: a.error ?? b.error,
    isPending: a.isPending || b.isPending,
    refetch: () => {
      if (a.error || a.data === undefined) void a.refetch();
      if (b.error || b.data === undefined) void b.refetch();
    },
  };
}

function lerEstado(valor: string | null): EstadoSimulado | null {
  return valor === 'carregando' || valor === 'erro' || valor === 'vazio' ? valor : null;
}

type Opcoes<T> = {
  /** Valor devolvido quando a URL pede ?estado=vazio (revisão em /_estados). */
  empty?: T;
};

/**
 * Converte uma consulta da API no contrato { data, isLoading, error, refetch } que o
 * AsyncContent usa. Também obedece ao ?estado=carregando|erro|vazio da /_estados:
 * "erro" falha até o primeiro "Tentar de novo".
 */
export function useResultado<T>(consulta: Consulta<T>, opcoes: Opcoes<T> = {}): QueryResult<T> {
  const [params] = useSearchParams();
  const estado = lerEstado(params.get(PARAM_ESTADO));
  const [tentou, setTentou] = useState(false);
  const refetchSimulado = useCallback(() => setTentou(true), []);

  if (estado === 'carregando') return { data: undefined, isLoading: true, error: null, refetch: refetchSimulado };
  if (estado === 'erro' && !tentou) return { data: undefined, isLoading: false, error: new Error('Falha simulada ao carregar.'), refetch: refetchSimulado };
  const refetch = () => void consulta.refetch();
  if (consulta.data === undefined && consulta.error) return { data: undefined, isLoading: false, error: consulta.error, refetch };
  if (consulta.data === undefined) return { data: undefined, isLoading: true, error: null, refetch };
  if (estado === 'vazio' && 'empty' in opcoes) return { data: opcoes.empty, isLoading: false, error: null, refetch };
  return { data: consulta.data, isLoading: false, error: null, refetch };
}
