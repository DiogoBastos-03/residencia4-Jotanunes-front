import { http, PREFIXO } from '@/shared/api';
import type { Pagina } from '../fornecedor/model';
import { filtrosObrasParaApi, paginaObrasDaApi, resultadoVinculoDaApi, vinculoParaApi, type DadosVinculo, type FiltrosObras, type ResultadoVinculo } from './mapper';
import type { ObraResumo } from './model';
import { addEnterpriseToConstructionResponseSchema, constructionPageSchema } from './schema';

/** Rota do vínculo: o controller fica em `construction/constructions` (com o segmento `construction` a mais). */
const VINCULO = (obraId: string) => `${PREFIXO}/construction/constructions/${obraId}/enterprises`;

/** Módulo construction (1 rota). */
export const obraApi = {
  /** GET /constructions (paginado; filtro por fornecedor). */
  async listar(filtros: FiltrosObras = {}, signal?: AbortSignal): Promise<Pagina<ObraResumo>> {
    const r = await http.json('GET', `${PREFIXO}/constructions`, constructionPageSchema, { query: filtrosObrasParaApi(filtros), signal });
    return paginaObrasDaApi(r);
  },

  /** POST …/construction/constructions/{obraId}/enterprises → 201. */
  async vincularFornecedor(obraId: string, dados: DadosVinculo, signal?: AbortSignal): Promise<ResultadoVinculo> {
    const r = await http.json('POST', VINCULO(obraId), addEnterpriseToConstructionResponseSchema, { body: vinculoParaApi(dados), signal });
    return resultadoVinculoDaApi(r);
  },

  /** DELETE …/construction/constructions/{obraId}/enterprises/{fornecedorId} → 204. */
  desvincularFornecedor(obraId: string, fornecedorId: string, signal?: AbortSignal): Promise<void> {
    return http.semCorpo('DELETE', `${VINCULO(obraId)}/${fornecedorId}`, { signal });
  },
};
