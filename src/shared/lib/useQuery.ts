import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PARAM_ESTADO, type EstadoSimulado, type QueryResult } from './useMockQuery';

/** Mesmo atraso da falha simulada do useMockQuery. */
const LATENCIA_ERRO_MS = 350;

type Options<T> = {
  /** Valor devolvido quando a URL pede ?estado=vazio. */
  empty?: T;
  /** Desligue para dados de apoio que não devem obedecer à simulação (ex.: contador da sidebar). */
  simulate?: boolean;
  /** Quando muda, busca de novo mantendo o dado atual na tela (sem voltar ao esqueleto). */
  version?: unknown;
};

type Estado<T> = { key: string; data: T | undefined; error: Error | null; pronto: boolean };

function lerEstado(valor: string | null): EstadoSimulado | null {
  return valor === 'carregando' || valor === 'erro' || valor === 'vazio' ? valor : null;
}

function comoErro(erro: unknown): Error {
  return erro instanceof Error ? erro : new Error(String(erro));
}

/**
 * Dado assíncrono com o mesmo contrato de useMockQuery: { data, isLoading, error, refetch }.
 * Continua obedecendo ?estado=carregando|erro|vazio, para a revisão em /_estados.
 */
export function useQuery<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: Options<T> = {},
): QueryResult<T> {
  const [params] = useSearchParams();
  const estado = options.simulate === false ? null : lerEstado(params.get(PARAM_ESTADO));
  const [tentativa, setTentativa] = useState(0);
  const [atual, setAtual] = useState<Estado<T>>({ key, data: undefined, error: null, pronto: false });
  // O fetcher muda a cada render; quem diz quando buscar de novo são key, version e tentativa.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });
  const temVazio = 'empty' in options;
  const vazio = options.empty;

  useEffect(() => {
    if (estado === 'carregando') {
      setAtual({ key, data: undefined, error: null, pronto: false });
      return;
    }
    if (estado === 'erro' && tentativa === 0) {
      setAtual({ key, data: undefined, error: null, pronto: false });
      const timer = window.setTimeout(
        () => setAtual({ key, data: undefined, error: new Error('Falha simulada ao carregar.'), pronto: true }),
        LATENCIA_ERRO_MS,
      );
      return () => window.clearTimeout(timer);
    }
    // Mesma chave e sem erro: mantém o dado na tela enquanto busca de novo.
    setAtual((anterior) => (anterior.key === key && anterior.pronto && !anterior.error ? anterior : { key, data: undefined, error: null, pronto: false }));
    const controller = new AbortController();
    fetcherRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setAtual({ key, data, error: null, pronto: true });
      },
      (erro: unknown) => {
        if (!controller.signal.aborted) setAtual({ key, data: undefined, error: comoErro(erro), pronto: true });
      },
    );
    return () => controller.abort();
  }, [key, estado, tentativa, options.version]);

  const refetch = useCallback(() => setTentativa((t) => t + 1), []);

  const carregado = atual.key === key && atual.pronto;
  if (!carregado) return { data: undefined, isLoading: true, error: null, refetch };
  if (atual.error) return { data: undefined, isLoading: false, error: atual.error, refetch };
  return { data: estado === 'vazio' && temVazio ? vazio : atual.data, isLoading: false, error: null, refetch };
}
