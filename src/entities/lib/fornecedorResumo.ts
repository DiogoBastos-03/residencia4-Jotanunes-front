import type { Dataset } from '../dataset';
import type { SituacaoFornecedor } from '../fornecedor';
import { documentosExigidos, listasAplicaveis, obrasDoFornecedor } from './aplicabilidade';
import { estaEmDia, statusDocumento } from './status';

export type ResumoFornecedor = {
  obras: number;
  listasAplicaveis: number;
  obrigatoriosEmDia: number;
  obrigatoriosTotal: number;
  situacao: SituacaoFornecedor;
};

/**
 * Documentos conta só os obrigatórios da empresa, nas listas que se aplicam.
 * O item de funcionários não entra na conta de fornecedor apto.
 */
export function resumoFornecedor(ds: Dataset, fornecedorId: string): ResumoFornecedor {
  const fornecedor = ds.fornecedores.find((f) => f.id === fornecedorId);
  const obrigatorios = documentosExigidos(ds, fornecedorId).filter((d) => d.obrigatoriedade === 'obrigatorio');
  const emDia = obrigatorios.filter((d) =>
    estaEmDia(
      statusDocumento(
        ds.documentos.find((doc) => doc.fornecedorId === fornecedorId && doc.tipoDocumentoId === d.tipoDocumentoId),
        ds.hoje,
      ),
    ),
  ).length;
  const situacao: SituacaoFornecedor = fornecedor?.bloqueado
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
