import type { ArquivoFuncionario, EnvioArquivos } from '../arquivo';
import type { Dataset } from '../dataset';
import { statusArquivo } from './status';

export type ResumoArquivos = {
  total: number;
  aprovados: number;
  emAnalise: number;
  reprovados: number;
  vencidos: number;
};

export function resumoArquivos(arquivos: readonly ArquivoFuncionario[], hoje: string): ResumoArquivos {
  const status = arquivos.map((a) => statusArquivo(a, hoje));
  return {
    total: arquivos.length,
    aprovados: status.filter((s) => s === 'aprovado' || s === 'venceEmBreve').length,
    emAnalise: status.filter((s) => s === 'emAnalise').length,
    reprovados: status.filter((s) => s === 'reprovado').length,
    vencidos: status.filter((s) => s === 'vencido').length,
  };
}

/** Arquivos e envios de um item de documento de funcionário, do mais recente para o mais antigo. */
export function arquivosDoItem(
  ds: Dataset,
  fornecedorId: string,
  tipoDocumentoId: string,
): { arquivos: ArquivoFuncionario[]; envios: EnvioArquivos[] } {
  const envios = ds.envios
    .filter((e) => e.fornecedorId === fornecedorId && e.tipoDocumentoId === tipoDocumentoId)
    .sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
  return {
    envios,
    arquivos: ds.arquivos.filter((a) => a.fornecedorId === fornecedorId && a.tipoDocumentoId === tipoDocumentoId),
  };
}
