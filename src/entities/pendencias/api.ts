import { http, PREFIXO } from '@/shared/api';
import { linhaDaApi, postergacaoParaApi } from './mapper';
import type { LinhaPendencias, Postergacao } from './model';
import { pendingPanelResponseSchema } from './schema';

const BASE = `${PREFIXO}/pending-panel`;

/** Módulo expiration (3 rotas). A exigência é identificada pelo envio mais recente do tipo (documentSubmissionId). */
export const pendenciasApi = {
  /** GET /pending-panel — uma linha por fornecedor com exigência vigente. */
  async painel(signal?: AbortSignal): Promise<LinhaPendencias[]> {
    return (await http.json('GET', BASE, pendingPanelResponseSchema, { signal })).map(linhaDaApi);
  },

  /** POST /pending-panel/requirements/{id}/postpone. */
  postergar(documentoId: string, postergacao: Postergacao, signal?: AbortSignal): Promise<void> {
    return http.semCorpo('POST', `${BASE}/requirements/${documentoId}/postpone`, { body: postergacaoParaApi(postergacao), signal });
  },

  /** POST /pending-panel/requirements/{id}/cancel-postponement — sem corpo. */
  cancelarPostergacao(documentoId: string, signal?: AbortSignal): Promise<void> {
    return http.semCorpo('POST', `${BASE}/requirements/${documentoId}/cancel-postponement`, { signal });
  },
};
