import { momentoDeUtc } from '../lib/datasApi';
import type { TipoFornecimento } from '../common';
import type { Exigencia, ListaDaObra, ListaDetalhe, ListaResumo, VersaoLista } from './model';
import type { ConstructionWorkflow, WorkflowDetail, WorkflowDocument, WorkflowListItem, WorkflowType, WorkflowVersionDetail } from './schema';

export const tipoDaApi = (t: WorkflowType): TipoFornecimento => (t === 'Material' ? 'material' : 'servico');
export const tipoParaApi = (t: TipoFornecimento): WorkflowType => (t === 'material' ? 'Material' : 'Servico');

export const listaResumoDaApi = (dto: WorkflowListItem): ListaResumo => ({ id: dto.workFlowId, nome: dto.name, tipo: tipoDaApi(dto.type) });

const exigenciaDaApi = (d: WorkflowDocument): Exigencia => ({ definicaoId: d.documentDefinitionId, ordem: d.displayOrder, obrigatoria: d.required });

export function versaoDaApi(dto: WorkflowVersionDetail): VersaoLista {
  return {
    id: dto.workFlowVersionId,
    numero: dto.version,
    exigencias: dto.documents.map(exigenciaDaApi).sort((a, b) => a.ordem - b.ordem),
    criadaEm: momentoDeUtc(dto.createdAt),
  };
}

export function listaDetalheDaApi(dto: WorkflowDetail): ListaDetalhe {
  return {
    id: dto.workFlowId,
    nome: dto.name,
    tipo: tipoDaApi(dto.type),
    criadaEm: momentoDeUtc(dto.createdAt),
    atualizadaEm: momentoDeUtc(dto.updatedAt),
    vigente: versaoDaApi(dto.currentVersion),
  };
}

export const listaDaObraDaApi = (dto: ConstructionWorkflow): ListaDaObra => ({
  id: dto.workFlowId,
  nome: dto.name,
  tipo: tipoDaApi(dto.type),
  versaoId: dto.workFlowVersionId,
  versao: dto.version,
});

/**
 * Exigências na ordem da tela → corpo da API. A posição na tela vira o displayOrder (1, 2, 3…):
 * assim nunca há ordem repetida nem negativa (INVALID_DISPLAY_ORDER).
 */
export function exigenciasParaApi(itens: ReadonlyArray<{ definicaoId: string; obrigatoria: boolean }>): WorkflowDocument[] {
  return itens.map((e, i) => ({ documentDefinitionId: e.definicaoId, displayOrder: i + 1, required: e.obrigatoria }));
}
