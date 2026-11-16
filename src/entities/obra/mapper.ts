import type { Pagina } from '../fornecedor/model';
import type { ObraResumo } from './model';
import type { TipoFornecimento } from '../common';
import type { AddEnterpriseToConstructionRequest, AddEnterpriseToConstructionResponse, ConstructionListItem, ConstructionListQuery, ConstructionPage } from './schema';

export function obraDaApi(dto: ConstructionListItem): ObraResumo {
  return { id: dto.constructionId, nome: dto.constructionName };
}

export function paginaObrasDaApi(dto: ConstructionPage): Pagina<ObraResumo> {
  return { itens: dto.items.map(obraDaApi), total: dto.totalCount, pagina: dto.page, porPagina: dto.pageSize };
}

export type FiltrosObras = { fornecedorId?: string; pagina?: number; porPagina?: number };

export function filtrosObrasParaApi(f: FiltrosObras): ConstructionListQuery {
  return { enterpriseId: f.fornecedorId, page: f.pagina, pageSize: f.porPagina };
}

export type DadosVinculo = { fornecedorId: string; prazoDias: number };

export function vinculoParaApi(d: DadosVinculo): AddEnterpriseToConstructionRequest {
  return { enterpriseId: d.fornecedorId, limitExpiresDays: d.prazoDias };
}

/** O que o vínculo fez: quantos workflows da obra a empresa passou a seguir e quais tipos dela ficaram sem workflow. */
export type ResultadoVinculo = { workflowsAtribuidos: number; tiposSemWorkflow: TipoFornecimento[] };

export function resultadoVinculoDaApi(dto: AddEnterpriseToConstructionResponse): ResultadoVinculo {
  return {
    workflowsAtribuidos: dto.assignedWorkFlowIds.length,
    tiposSemWorkflow: dto.typesWithoutWorkflow.map((t): TipoFornecimento => (t === 1 ? 'material' : 'servico')),
  };
}
