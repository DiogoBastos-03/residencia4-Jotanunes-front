import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';

const MAX_TENTATIVAS = 2;

/** Repete só falha de rede e erro 5xx; 4xx (e resposta fora do contrato) nunca. */
function deveRepetir(tentativas: number, erro: unknown): boolean {
  if (tentativas >= MAX_TENTATIVAS) return false;
  return erro instanceof ApiError && (erro.code === 'NETWORK_ERROR' || erro.status >= 500);
}

export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: deveRepetir,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
