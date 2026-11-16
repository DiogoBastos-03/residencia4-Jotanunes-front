import { useFornecedorDetalhe } from '@/entities/fornecedor';
import { useObrasDoFornecedor } from '@/entities/obra';
import { ApiError } from '@/shared/api';
import { juntar, useResultado, type Consulta, type QueryResult } from '@/shared/lib';
import type { FichaCadastral } from '../types';

/**
 * Ficha do fornecedor: GET /enterprises/{id} e GET /constructions?enterpriseId={id}.
 * `null` quando a API diz que o fornecedor não existe (404 com ENTERPRISE_NOT_FOUND,
 * ou 404 sem corpo quando o id nem é GUID).
 */
export function useFornecedor(id: string): QueryResult<FichaCadastral | null> {
  const detalhe = useFornecedorDetalhe(id);
  const obras = useObrasDoFornecedor(id);
  const naoExiste = detalhe.error instanceof ApiError && detalhe.error.status === 404;
  const ficha = juntar(detalhe, obras, (cadastro, o): FichaCadastral | null => ({ cadastro, obras: o.itens }));
  const consulta: Consulta<FichaCadastral | null> = naoExiste ? { data: null, error: null, isPending: false, refetch: detalhe.refetch } : ficha;
  return useResultado(consulta);
}
