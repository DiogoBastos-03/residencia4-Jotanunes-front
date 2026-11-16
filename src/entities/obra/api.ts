import { http, PREFIXO } from '@/shared/api';
import type { Pagina } from '../fornecedor/model';
import { filtrosObrasParaApi, paginaObrasDaApi, type FiltrosObras } from './mapper';
import type { ObraResumo } from './model';
import { constructionPageSchema } from './schema';

/** Módulo construction (1 rota). */
export const obraApi = {
  /** GET /constructions (paginado; filtro por fornecedor). */
  async listar(filtros: FiltrosObras = {}, signal?: AbortSignal): Promise<Pagina<ObraResumo>> {
    const r = await http.json('GET', `${PREFIXO}/constructions`, constructionPageSchema, { query: filtrosObrasParaApi(filtros), signal });
    return paginaObrasDaApi(r);
  },
};
