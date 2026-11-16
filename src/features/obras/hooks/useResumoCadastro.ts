import { forneceTipo } from '@/entities';
import { useFornecedoresApi } from '@/entities/fornecedor';
import { useObrasApi, useVinculosApi } from '@/entities/obra';
import { juntar, useResultado } from '@/shared/lib';
import type { LinhaObra } from '../types';

export type ResumoCadastro = {
  empresas: { total: number; ativas: number; bloqueadas: number; servico: number; material: number };
  /** Cada obra com quantas empresas estão vinculadas a ela. */
  obras: LinhaObra[];
};

const VAZIO: ResumoCadastro = { empresas: { total: 0, ativas: 0, bloqueadas: 0, servico: 0, material: 0 }, obras: [] };

/** Visão geral: contas feitas só sobre as listagens da API (empresas, obras e o filtro por obra). */
export function useResumoCadastro() {
  const fornecedores = useFornecedoresApi();
  const obras = useObrasApi();
  const vinculos = useVinculosApi(obras.data?.itens);
  const consulta = juntar(fornecedores, juntar(obras, vinculos, (o, v) => ({ o, v })), (f, { o, v }): ResumoCadastro => ({
    empresas: {
      total: f.itens.length,
      ativas: f.itens.filter((x) => !x.bloqueado).length,
      bloqueadas: f.itens.filter((x) => x.bloqueado).length,
      // Empresa dos dois tipos conta nos dois.
      servico: f.itens.filter((x) => forneceTipo(x, 'servico')).length,
      material: f.itens.filter((x) => forneceTipo(x, 'material')).length,
    },
    obras: o.itens.map((obra) => ({ obra, fornecedores: v.filter((x) => x.obraId === obra.id).length })),
  }));
  return useResultado(consulta, { empty: VAZIO });
}
