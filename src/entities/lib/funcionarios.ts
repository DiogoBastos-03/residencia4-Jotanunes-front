import type { Dataset } from '../dataset';
import type { Funcionario } from '../funcionario';
import { itemFuncionarios } from './aplicabilidade';
import { statusPorValidade } from './status';

export type ResumoFuncionarios = {
  total: number;
  obras: number;
  emDia: number;
  emAnalise: number;
  comPendencia: number;
};

export function resumoFuncionariosDoFornecedor(ds: Dataset, fornecedorId: string): ResumoFuncionarios {
  const lista = ds.funcionarios.filter((f) => f.fornecedorId === fornecedorId);
  return {
    total: lista.length,
    obras: new Set(lista.map((f) => f.obraId)).size,
    emDia: lista.filter((f) => f.status === 'aprovado').length,
    emAnalise: lista.filter((f) => f.status === 'emAnalise').length,
    comPendencia: lista.filter((f) => f.status === 'reprovado' || f.status === 'pendente').length,
  };
}

/** Quantos documentos obrigatórios da pessoa estão enviados, do total exigido. */
export function documentosDaPessoa(ds: Dataset, funcionario: Funcionario): { enviados: number; exigidos: number } {
  const remessa = ds.remessas.find((r) => r.id === funcionario.remessaId);
  const lista = ds.listas.find((l) => l.id === remessa?.listaId);
  const item = lista ? itemFuncionarios(lista) : undefined;
  const exigidos = item?.documentosPessoa.length ?? 0;
  const enviados = funcionario.documentos.filter(
    (d) => d.arquivo && statusPorValidade(d.status, d.validade, ds.hoje) !== 'vencido',
  ).length;
  return { enviados, exigidos };
}

export function funcionariosEmCampoNaObra(ds: Dataset, obraId: string): number {
  return ds.vinculos.filter((v) => v.obraId === obraId).reduce((total, v) => total + v.funcionariosEmCampo, 0);
}
