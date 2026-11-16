import type { Dataset } from '../dataset';
import { documentosExigidos, listasAplicaveis, obrasDoFornecedor } from './aplicabilidade';
import { estaEmDia, statusDocumento } from './status';

/**
 * Situação documental (apto / com pendência), calculada sobre documentos. Não vem da API:
 * só as telas fora de uso a usam. Volta com o acervo (Fase 3).
 */
export type SituacaoDocumental = 'apto' | 'comPendencia' | 'bloqueado';

export type ResumoFornecedor = {
  obras: number;
  listasAplicaveis: number;
  obrigatoriosEmDia: number;
  obrigatoriosTotal: number;
  situacao: SituacaoDocumental;
};

/**
 * Documentos conta só os obrigatórios da empresa, nas listas que se aplicam.
 * Documento de funcionário não entra na conta de fornecedor apto.
 */
export function resumoFornecedor(ds: Dataset, fornecedorId: string): ResumoFornecedor {
  const fornecedor = ds.fornecedores.find((f) => f.id === fornecedorId);
  const obrigatorios = documentosExigidos(ds, fornecedorId).filter((d) => d.escopo === 'empresa' && d.obrigatoriedade === 'obrigatorio');
  const emDia = obrigatorios.filter((d) =>
    estaEmDia(
      statusDocumento(
        ds.documentos.find((doc) => doc.fornecedorId === fornecedorId && doc.tipoDocumentoId === d.tipoDocumentoId),
        ds.hoje,
      ),
    ),
  ).length;
  const situacao: SituacaoDocumental = fornecedor?.bloqueado
    ? 'bloqueado'
    : emDia === obrigatorios.length
      ? 'apto'
      : 'comPendencia';
  return {
    obras: obrasDoFornecedor(ds, fornecedorId).length,
    listasAplicaveis: listasAplicaveis(ds, fornecedorId).length,
    obrigatoriosEmDia: emDia,
    obrigatoriosTotal: obrigatorios.length,
    situacao,
  };
}

export function documentoDoFornecedor(ds: Dataset, fornecedorId: string, tipoDocumentoId: string) {
  return ds.documentos.find((d) => d.fornecedorId === fornecedorId && d.tipoDocumentoId === tipoDocumentoId);
}
