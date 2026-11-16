import { http, PREFIXO, type ListagemPaginada } from '@/shared/api';
import type { TipoFornecimento } from '../common';
import type { Pagina } from '../fornecedor/model';
import { exigenciasParaApi, listaDaObraDaApi, listaDetalheDaApi, listaResumoDaApi, tipoParaApi, versaoDaApi } from './mapper';
import type { ListaDaObra, ListaDetalhe, ListaResumo, VersaoLista } from './model';
import {
  assignWorkflowResponseSchema,
  constructionWorkflowListSchema,
  createWorkflowResponseSchema,
  workflowDetailSchema,
  workflowPageSchema,
  workflowVersionListSchema,
  workflowVersionResponseSchema,
  type CreateWorkflowRequest,
} from './schema';

const BASE = `${PREFIXO}/workflow`;

export type ItemExigencia = { definicaoId: string; obrigatoria: boolean };
export type FiltrosListas = ListagemPaginada & { tipo?: TipoFornecimento; nome?: string };
export type NovaListaApi = { nome: string; tipo: TipoFornecimento; exigencias: ItemExigencia[]; obra?: { id: string; prazoDias: number } };

export const listaApi = {
  /** GET /workflow/workflows — filtros do back: tipo e nome (contém). */
  async listar(f: FiltrosListas = {}, signal?: AbortSignal): Promise<Pagina<ListaResumo>> {
    const r = await http.json('GET', `${BASE}/workflows`, workflowPageSchema, {
      query: { type: f.tipo ? tipoParaApi(f.tipo) : undefined, name: f.nome || undefined, page: f.pagina, pageSize: f.porPagina },
      signal,
    });
    return { itens: r.items.map(listaResumoDaApi), total: r.totalCount, pagina: r.page, porPagina: r.pageSize };
  },

  async detalhar(id: number, signal?: AbortSignal): Promise<ListaDetalhe> {
    return listaDetalheDaApi(await http.json('GET', `${BASE}/workflows/${id}`, workflowDetailSchema, { signal }));
  },

  /** Todas as versões, como o back devolve. */
  async versoes(id: number, signal?: AbortSignal): Promise<VersaoLista[]> {
    return (await http.json('GET', `${BASE}/workflows/${id}/versions`, workflowVersionListSchema, { signal })).map(versaoDaApi);
  },

  /** POST → id da lista e quantas empresas da obra foram vinculadas (0 sem obra). */
  async criar(nova: NovaListaApi, signal?: AbortSignal): Promise<{ id: number; empresasVinculadas: number }> {
    const corpo: CreateWorkflowRequest = {
      name: nova.nome.trim(),
      type: tipoParaApi(nova.tipo),
      documents: exigenciasParaApi(nova.exigencias),
      // Sem obra, o prazo não vai (o back o ignoraria).
      ...(nova.obra ? { constructionId: nova.obra.id, limitExpiresDays: nova.obra.prazoDias } : {}),
    };
    const r = await http.json('POST', `${BASE}/workflows`, createWorkflowResponseSchema, { body: corpo, signal });
    return { id: r.workFlowId, empresasVinculadas: r.assignedEnterpriseIds.length };
  },

  renomear(id: number, nome: string, signal?: AbortSignal): Promise<void> {
    return http.semCorpo('PATCH', `${BASE}/workflows/${id}`, { body: { name: nome.trim() }, signal });
  },

  /**
   * PUT …/requirements. Exigências iguais às da versão vigente não criam versão: o back devolve a
   * vigente. Por isso devolve o número e se ele mudou em relação ao anterior.
   */
  async editarExigencias(id: number, exigencias: ItemExigencia[], signal?: AbortSignal): Promise<{ versao: number; versaoId: string }> {
    const r = await http.json('PUT', `${BASE}/workflows/${id}/requirements`, workflowVersionResponseSchema, { body: { documents: exigenciasParaApi(exigencias) }, signal });
    return { versao: r.version, versaoId: r.workFlowVersionId };
  },

  /** Listas em uso na obra, na versão vigente de cada uma. */
  async daObra(obraId: string, signal?: AbortSignal): Promise<ListaDaObra[]> {
    return (await http.json('GET', `${BASE}/constructions/${obraId}/workflows`, constructionWorkflowListSchema, { signal })).map(listaDaObraDaApi);
  },

  /** POST /workflow/constructions/{obraId}/workflows → quantas empresas da obra passaram a seguir a lista. */
  async vincularAObra(obraId: string, listaId: number, prazoDias: number, signal?: AbortSignal): Promise<{ empresasVinculadas: number }> {
    const r = await http.json('POST', `${BASE}/constructions/${obraId}/workflows`, assignWorkflowResponseSchema, {
      body: { workFlowId: listaId, limitExpiresDays: prazoDias },
      signal,
    });
    return { empresasVinculadas: r.assignedEnterpriseIds.length };
  },
};
