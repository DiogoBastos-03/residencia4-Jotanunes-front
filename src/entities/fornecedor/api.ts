import { http, PREFIXO } from '@/shared/api';
import type { TipoFornecimento } from '../common';
import {
  cadastroParaApi,
  edicaoParaApi,
  filtrosParaApi,
  fornecedorCadastroDaApi,
  paginaFornecedoresDaApi,
  tiposRequestParaApi,
  type DadosCadastroFornecedor,
  type DadosEdicaoFornecedor,
  type FiltrosFornecedores,
} from './mapper';
import type { FornecedorCadastro, FornecedorResumo, Pagina } from './model';
import { enterpriseDetailSchema, enterprisePageSchema, registerEnterpriseResponseSchema, type ChangeEnterpriseStatusRequest } from './schema';

const BASE = `${PREFIXO}/enterprises`;

/** Módulo enterprise (6 rotas). Recebem e devolvem tipos do front; as respostas são validadas pelo Zod. */
export const fornecedorApi = {
  /** POST /enterprises → id criado. */
  async cadastrar(dados: DadosCadastroFornecedor, signal?: AbortSignal): Promise<string> {
    const r = await http.json('POST', BASE, registerEnterpriseResponseSchema, { body: cadastroParaApi(dados), signal });
    return r.enterpriseId;
  },

  /** GET /enterprises (paginado, até 50 por página). */
  async listar(filtros: FiltrosFornecedores = {}, signal?: AbortSignal): Promise<Pagina<FornecedorResumo>> {
    const q = filtrosParaApi(filtros);
    return paginaFornecedoresDaApi(await http.json('GET', BASE, enterprisePageSchema, { query: q, signal }));
  },

  /** GET /enterprises/{id}. */
  async detalhar(id: string, signal?: AbortSignal): Promise<FornecedorCadastro> {
    return fornecedorCadastroDaApi(await http.json('GET', `${BASE}/${id}`, enterpriseDetailSchema, { signal }));
  },

  /** PATCH /enterprises/{id} — só os campos informados mudam. */
  editar(id: string, dados: DadosEdicaoFornecedor, signal?: AbortSignal): Promise<void> {
    return http.semCorpo('PATCH', `${BASE}/${id}`, { body: edicaoParaApi(dados), signal });
  },

  /** PUT /enterprises/{id}/types — substitui a lista inteira. */
  trocarTipos(id: string, tipos: readonly TipoFornecimento[], signal?: AbortSignal): Promise<void> {
    return http.semCorpo('PUT', `${BASE}/${id}/types`, { body: tiposRequestParaApi(tipos), signal });
  },

  /** PATCH /enterprises/{id}/status — bloquear é { active: false }. */
  definirBloqueio(id: string, bloqueado: boolean, signal?: AbortSignal): Promise<void> {
    const corpo: ChangeEnterpriseStatusRequest = { active: !bloqueado };
    return http.semCorpo('PATCH', `${BASE}/${id}/status`, { body: corpo, signal });
  },
};
