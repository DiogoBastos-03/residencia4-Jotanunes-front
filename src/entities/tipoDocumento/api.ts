import { http, PREFIXO, type ListagemPaginada } from '@/shared/api';
import type { Pagina } from '../fornecedor/model';
import { definicaoDaApi, definicaoDetalheDaApi, edicaoDefinicaoParaApi, formatoDaApi, novaDefinicaoParaApi, type DadosDefinicao } from './mapper';
import type { DefinicaoDocumento, DefinicaoDocumentoDetalhe, FormatoArquivo } from './model';
import { createDocumentDefinitionResponseSchema, documentDefinitionDetailSchema, documentDefinitionPageSchema, documentFormatListSchema } from './schema';

const BASE = `${PREFIXO}/workflow`;

export const tipoDocumentoApi = {
  /** GET /workflow/document-formats — só os ativos, por nome. */
  async listarFormatos(signal?: AbortSignal): Promise<FormatoArquivo[]> {
    return (await http.json('GET', `${BASE}/document-formats`, documentFormatListSchema, { signal })).map(formatoDaApi);
  },

  /** GET /workflow/document-definitions (paginado; filtro por nome). */
  async listar(filtros: ListagemPaginada & { nome?: string } = {}, signal?: AbortSignal): Promise<Pagina<DefinicaoDocumento>> {
    const r = await http.json('GET', `${BASE}/document-definitions`, documentDefinitionPageSchema, {
      query: { name: filtros.nome, page: filtros.pagina, pageSize: filtros.porPagina },
      signal,
    });
    return { itens: r.items.map(definicaoDaApi), total: r.totalCount, pagina: r.page, porPagina: r.pageSize };
  },

  async detalhar(id: string, signal?: AbortSignal): Promise<DefinicaoDocumentoDetalhe> {
    return definicaoDetalheDaApi(await http.json('GET', `${BASE}/document-definitions/${id}`, documentDefinitionDetailSchema, { signal }));
  },

  /** POST → id criado. */
  async criar(dados: DadosDefinicao, signal?: AbortSignal): Promise<string> {
    const r = await http.json('POST', `${BASE}/document-definitions`, createDocumentDefinitionResponseSchema, { body: novaDefinicaoParaApi(dados), signal });
    return r.documentDefinitionId;
  },

  /** PATCH só com o que mudou. Resolve false sem chamar a API quando nada mudou. */
  async editar(atual: DefinicaoDocumento, dados: DadosDefinicao, signal?: AbortSignal): Promise<boolean> {
    const corpo = edicaoDefinicaoParaApi(atual, dados);
    if (Object.keys(corpo).length === 0) return false;
    await http.semCorpo('PATCH', `${BASE}/document-definitions/${atual.id}`, { body: corpo, signal });
    return true;
  },
};
