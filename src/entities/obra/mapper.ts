import type { Pagina } from '../fornecedor/model';
import type { ObraResumo } from './model';
import type { ConstructionListItem, ConstructionListQuery, ConstructionPage } from './schema';

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
