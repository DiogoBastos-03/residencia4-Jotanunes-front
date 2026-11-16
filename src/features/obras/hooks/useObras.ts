import type { ObraResumo } from '@/entities';
import { useObrasApi, useVinculosApi } from '@/entities/obra';
import { juntar, useResultado } from '@/shared/lib';
import type { LinhaObra } from '../types';

/** Obras da API (id e nome), com quantos fornecedores cada uma tem (filtro por obra da API). */
export function useObras() {
  const obras = useObrasApi();
  const vinculos = useVinculosApi(obras.data?.itens);
  const consulta = juntar(obras, vinculos, (o, v): LinhaObra[] =>
    o.itens.map((obra: ObraResumo) => ({ obra, fornecedores: v.filter((x) => x.obraId === obra.id).length })),
  );
  return useResultado(consulta, { empty: [] });
}
