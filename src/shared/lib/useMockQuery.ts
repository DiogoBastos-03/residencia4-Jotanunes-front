import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

export type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  /** Tenta de novo (usado pelo botão do estado de erro). */
  refetch: () => void;
};

/** Estados forçados pela URL (?estado=…), usados pela revisão em /_estados. */
export type EstadoSimulado = 'carregando' | 'erro' | 'vazio';

export const PARAM_ESTADO = 'estado';

const LATENCIA_MS = 350;

type Options<T> = {
  /** Valor devolvido quando a URL pede ?estado=vazio. */
  empty?: T;
  /** Desligue para dados de apoio que não devem obedecer à simulação (ex.: contador da sidebar). */
  simulate?: boolean;
  /** Quando muda (ex.: os dados em memória foram alterados), recalcula sem voltar a carregar. */
  version?: unknown;
};

function lerEstado(valor: string | null): EstadoSimulado | null {
  return valor === 'carregando' || valor === 'erro' || valor === 'vazio' ? valor : null;
}

/**
 * Lê dados mockados com a mesma forma que uma chamada de API terá:
 * { data, isLoading, error }. Quando o backend existir, troca-se só o corpo do hook da feature.
 */
export function useMockQuery<T>(key: string, loader: () => T, options: Options<T> = {}): QueryResult<T> {
  const [params] = useSearchParams();
  const estado = options.simulate === false ? null : lerEstado(params.get(PARAM_ESTADO));
  const [pronto, setPronto] = useState<{ key: string; falhou: boolean } | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const temVazio = 'empty' in options;
  const vazio = options.empty;

  useEffect(() => {
    setPronto(null);
    if (estado === 'carregando') return;
    const timer = window.setTimeout(
      () => setPronto({ key, falhou: estado === 'erro' && tentativa === 0 }),
      LATENCIA_MS,
    );
    return () => window.clearTimeout(timer);
  }, [key, estado, tentativa]);

  const carregado = pronto !== null && pronto.key === key;

  const resultado = useMemo((): { data: T | undefined; error: Error | null } => {
    if (!carregado) return { data: undefined, error: null };
    if (pronto.falhou) return { data: undefined, error: new Error('Falha simulada ao carregar.') };
    if (estado === 'vazio' && temVazio) return { data: vazio, error: null };
    try {
      return { data: loader(), error: null };
    } catch (error) {
      return { data: undefined, error: error instanceof Error ? error : new Error(String(error)) };
    }
    // O loader muda a cada render; `version` é o que diz quando recalcular.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregado, pronto, estado, temVazio, options.version, key]);

  const refetch = useCallback(() => setTentativa((t) => t + 1), []);

  return { data: resultado.data, isLoading: !carregado, error: resultado.error, refetch };
}
