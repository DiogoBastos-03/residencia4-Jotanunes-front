import { fornecedoresDaObra } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';

/** Obras para escolher em "Nova lista de exigências", com quantos fornecedores de cada tipo há em cada uma. */
export function useObrasParaNovaLista() {
  const ds = useStore(datasetStore);
  return useMockQuery(
    'obras-nova-lista',
    () =>
      ds.obras.map((obra) => {
        const fornecedores = fornecedoresDaObra(ds, obra.id);
        return {
          obra,
          servico: fornecedores.filter((f) => f.tipo === 'servico').length,
          material: fornecedores.filter((f) => f.tipo === 'material').length,
        };
      }),
    { version: ds, empty: [] },
  );
}
