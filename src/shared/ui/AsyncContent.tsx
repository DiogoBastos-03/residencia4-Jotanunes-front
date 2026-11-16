import type { ReactNode } from 'react';
import { ApiError } from '@/shared/api';
import type { QueryResult } from '@/shared/lib';
import { ErrorState } from './ErrorState';
import { SkeletonRegion } from './SkeletonRegion';

type AsyncContentProps<T> = {
  query: QueryResult<T>;
  /** Esqueleto com a geometria final do conteúdo. */
  skeleton: ReactNode;
  /** compact: erro em uma linha, para caber dentro de um cartão pequeno. */
  errorVariant?: 'block' | 'compact';
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
};

/**
 * Carregando → esqueleto; erro → tentar de novo; vazio → explicação; dados → conteúdo.
 * Erro da API mostra a mensagem do `code` (tabela de src/shared/strings/erros.ts).
 */
export function AsyncContent<T>({ query, skeleton, errorVariant = 'block', isEmpty, empty, children }: AsyncContentProps<T>) {
  if (query.error) {
    const descricao = query.error instanceof ApiError ? query.error.mensagem : undefined;
    return <ErrorState variant={errorVariant} description={descricao} onRetry={query.refetch} />;
  }
  if (query.isLoading || query.data === undefined) return <SkeletonRegion>{skeleton}</SkeletonRegion>;
  if (isEmpty?.(query.data) && empty) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
