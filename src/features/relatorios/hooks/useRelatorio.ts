import { pendenciasDaObra, vencidosRecentes, vencimentosProximos, type Dataset, type PeriodoRelatorio } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { Relatorio } from '../types';

function carregar(ds: Dataset, periodo: PeriodoRelatorio): Relatorio {
  return {
    periodo,
    pendencias: ds.obras
      .map((obra) => {
        const grupos = pendenciasDaObra(ds, obra.id);
        return { obra, total: grupos.reduce((t, g) => t + g.pendencias.length, 0), fornecedores: grupos.length };
      })
      .filter((l) => l.total > 0)
      .sort((a, b) => b.total - a.total),
    tempos: ds.temposAnalise
      .filter((t) => t.periodo === periodo)
      .flatMap((t) => {
        const lista = ds.listas.find((l) => l.id === t.listaId);
        return lista ? [{ lista, diasMedios: t.diasMedios, acimaDaMeta: t.acimaDaMeta }] : [];
      }),
    // Os que vencem em 30 dias, e depois os que já venceram e seguem pendentes.
    vencimentos: [...vencimentosProximos(ds), ...vencidosRecentes(ds)],
  };
}

export function useRelatorio(periodo: PeriodoRelatorio) {
  const ds = useStore(datasetStore);
  return useMockQuery(`relatorio-${periodo}`, () => carregar(ds, periodo), {
    version: ds,
    empty: { periodo, pendencias: [], tempos: [], vencimentos: [] },
  });
}
