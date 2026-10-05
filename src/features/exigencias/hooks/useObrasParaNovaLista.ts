import { forneceTipo, fornecedoresDaObra } from '@/entities';
import { useDatasetQuery } from '@/mocks';

/** Obras para escolher em "Nova lista de exigências", com quantos fornecedores de cada tipo há em cada uma. */
export function useObrasParaNovaLista() {
  return useDatasetQuery(
    'obras-nova-lista',
    (ds) =>
      ds.obras.map((obra) => {
        const fornecedores = fornecedoresDaObra(ds, obra.id);
        return {
          obra,
          servico: fornecedores.filter((f) => forneceTipo(f, 'servico')).length,
          material: fornecedores.filter((f) => forneceTipo(f, 'material')).length,
        };
      }),
    { empty: [] },
  );
}
