import { useFornecedoresDaObra } from '@/entities/fornecedor';
import { useObrasApi } from '@/entities/obra';
import { juntar, useResultado, type QueryResult } from '@/shared/lib';
import type { FichaObra } from '../types';

/**
 * Ficha da obra: o nome (da listagem GET /constructions — não há rota de detalhe) e os
 * fornecedores vinculados (GET /enterprises?constructionIds=<obra>). `null` se a obra não está na listagem.
 */
export function useObra(id: string): QueryResult<FichaObra | null> {
  const obras = useObrasApi();
  const fornecedores = useFornecedoresDaObra(id);
  const consulta = juntar(obras, fornecedores, (o, f): FichaObra | null => {
    const obra = o.itens.find((x) => x.id === id);
    return obra ? { obra, fornecedores: f.itens } : null;
  });
  return useResultado(consulta);
}
