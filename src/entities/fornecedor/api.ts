import { http } from '@/shared/lib/http';
import { buscarTodas, lerPagina } from '@/shared/lib/paginacao';
import type { TipoFornecimento } from '../common';
import {
  lerEnterpriseDetail,
  lerEnterpriseListItem,
  lerRegisterEnterpriseOutput,
  type ChangeEnterpriseStatusRequestDto,
  type ChangeEnterpriseTypesRequestDto,
} from './dto';
import {
  cadastroParaApi,
  edicaoParaApi,
  fornecedorDaApi,
  tiposParaApi,
  type DadosCadastroFornecedor,
  type DadosEdicaoFornecedor,
} from './mapper';
import type { Fornecedor } from './model';

const BASE = '/v1/internal/enterprises';
const paginaDeItens = lerPagina(lerEnterpriseListItem);

type FiltroListagem = { constructionIds?: readonly string[] };

/** As chamadas de fornecedor (enterprise) do back. Recebem e devolvem tipos do front. */
export const fornecedorApi = {
  /** GET /enterprises, todas as páginas. Devolve só os ids: o item da lista não tem telefone, e-mail nem data. */
  async listarIds(filtro: FiltroListagem = {}, signal?: AbortSignal): Promise<string[]> {
    const itens = await buscarTodas(async (page, pageSize) =>
      paginaDeItens(await http.get(BASE, { query: { page, pageSize, constructionIds: filtro.constructionIds }, signal }), 'enterprises'),
    );
    return itens.map((i) => i.enterpriseId);
  },

  /** GET /enterprises/{id}. */
  async detalhar(id: string, signal?: AbortSignal): Promise<Fornecedor> {
    return fornecedorDaApi(lerEnterpriseDetail(await http.get(`${BASE}/${id}`, { signal }), 'enterprise'));
  },

  /** POST /enterprises. Devolve o id criado. */
  async cadastrar(dados: DadosCadastroFornecedor): Promise<string> {
    return lerRegisterEnterpriseOutput(await http.post(BASE, cadastroParaApi(dados)), 'registerEnterprise').enterpriseId;
  },

  /** PATCH /enterprises/{id}. Não chama a API se nada mudou. */
  async editarDados(atual: Fornecedor, dados: DadosEdicaoFornecedor): Promise<void> {
    const corpo = edicaoParaApi(atual, dados);
    if (Object.keys(corpo).length > 0) await http.patch(`${BASE}/${atual.id}`, corpo);
  },

  /** PUT /enterprises/{id}/types. */
  async trocarTipos(id: string, tipos: readonly TipoFornecimento[]): Promise<void> {
    const corpo: ChangeEnterpriseTypesRequestDto = { enterpriseTypes: tiposParaApi(tipos) };
    await http.put(`${BASE}/${id}/types`, corpo);
  },

  /** PATCH /enterprises/{id}/status — bloquear é { active: false }. */
  async definirBloqueio(id: string, bloqueado: boolean): Promise<void> {
    const corpo: ChangeEnterpriseStatusRequestDto = { active: !bloqueado };
    await http.patch(`${BASE}/${id}/status`, corpo);
  },
};
