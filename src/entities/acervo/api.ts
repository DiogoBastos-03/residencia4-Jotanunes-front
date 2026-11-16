import { http, PREFIXO } from '@/shared/api';
import { filtrosAcervoParaApi, grupoAcervoDaApi, linkDaApi } from './mapper';
import type { ArquivoBaixado, FiltrosAcervo, GrupoAcervo, LinkVisualizacao } from './model';
import { archiveResponseSchema, viewUrlResponseSchema, type BatchDownloadRequest } from './schema';

const base = (fornecedorId: string) => `${PREFIXO}/enterprises/${fornecedorId}/archive`;

/** Módulo archive (3 rotas). */
export const acervoApi = {
  /** GET /enterprises/{id}/archive — grupos por escopo (empresa; um por funcionário). */
  async listar(fornecedorId: string, filtros: FiltrosAcervo = {}, signal?: AbortSignal): Promise<GrupoAcervo[]> {
    const r = await http.json('GET', base(fornecedorId), archiveResponseSchema, { query: filtrosAcervoParaApi(filtros), signal });
    return r.map(grupoAcervoDaApi);
  },

  /**
   * GET .../documents/{id}/view-url. O link expira em 5 minutos: chame a cada visualização,
   * nunca guarde nem coloque em cache (por isso não há query key para ele).
   */
  async linkVisualizacao(fornecedorId: string, documentoId: string, signal?: AbortSignal): Promise<LinkVisualizacao> {
    return linkDaApi(await http.json('GET', `${base(fornecedorId)}/documents/${documentoId}/view-url`, viewUrlResponseSchema, { signal }));
  },

  /**
   * POST .../documents/batch-download — até 50 documentos num .zip (binário, não JSON).
   * O nome do arquivo vem do Content-Disposition. Arquivo expurgado fica de fora, listado no manifesto.txt.
   */
  baixarEmLote(fornecedorId: string, documentoIds: readonly string[], signal?: AbortSignal): Promise<ArquivoBaixado> {
    const corpo: BatchDownloadRequest = { documentSubmissionIds: [...documentoIds] };
    return http.arquivo('POST', `${base(fornecedorId)}/documents/batch-download`, 'documentos.zip', { body: corpo, signal });
  },
};
