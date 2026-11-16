import type { TipoFornecimento } from '../common';
import { diaDeUtc, momentoDeUtc } from '../lib/datasApi';
import type { FornecedorCadastro, FornecedorResumo, Pagina } from './model';
import { normalizarTipos } from './model';
import type {
  ChangeEnterpriseTypesRequest,
  EnterpriseDetail,
  EnterpriseListItem,
  EnterpriseListQuery,
  EnterprisePage,
  EnterpriseType,
  RegisterEnterpriseRequest,
  UpdateEnterpriseRequest,
} from './schema';

/** O único lugar que traduz o tipo do back para o do front, e vice-versa. */
const TIPO_DA_API: Readonly<Record<EnterpriseType, TipoFornecimento>> = { Material: 'material', Servico: 'servico' };
const TIPO_PARA_API: Readonly<Record<TipoFornecimento, EnterpriseType>> = { material: 'Material', servico: 'Servico' };

export function tiposDaApi(tipos: readonly EnterpriseType[]): TipoFornecimento[] {
  return normalizarTipos(tipos.map((t) => TIPO_DA_API[t]));
}

export function tiposParaApi(tipos: readonly TipoFornecimento[]): EnterpriseType[] {
  return normalizarTipos(tipos).map((t) => TIPO_PARA_API[t]);
}

/** `active` fica aqui: acima desta camada só existe `bloqueado`. */
export function fornecedorResumoDaApi(dto: EnterpriseListItem): FornecedorResumo {
  return { id: dto.enterpriseId, razaoSocial: dto.enterpriseName, cnpj: dto.cnpj, tipos: tiposDaApi(dto.types), bloqueado: !dto.active };
}

export function fornecedorCadastroDaApi(dto: EnterpriseDetail): FornecedorCadastro {
  return {
    id: dto.enterpriseId,
    razaoSocial: dto.enterpriseName,
    cnpj: dto.cnpj,
    tipos: tiposDaApi(dto.types),
    bloqueado: !dto.active,
    telefone: dto.phone,
    email: dto.email,
    desde: diaDeUtc(dto.createdAt),
    atualizadoEm: momentoDeUtc(dto.updatedAt),
  };
}

export function paginaFornecedoresDaApi(dto: EnterprisePage): Pagina<FornecedorResumo> {
  return { itens: dto.items.map(fornecedorResumoDaApi), total: dto.totalCount, pagina: dto.page, porPagina: dto.pageSize };
}

// — Do front para a API —

export type FiltrosFornecedores = {
  tipo?: TipoFornecimento;
  bloqueado?: boolean;
  obraIds?: readonly string[];
  pagina?: number;
  porPagina?: number;
};

export function filtrosParaApi(f: FiltrosFornecedores): EnterpriseListQuery {
  return {
    type: f.tipo ? TIPO_PARA_API[f.tipo] : undefined,
    active: f.bloqueado === undefined ? undefined : !f.bloqueado,
    constructionIds: f.obraIds && f.obraIds.length > 0 ? [...f.obraIds] : undefined,
    page: f.pagina,
    pageSize: f.porPagina,
  };
}

export type DadosCadastroFornecedor = {
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  tipos: readonly TipoFornecimento[];
};

export function cadastroParaApi(d: DadosCadastroFornecedor): RegisterEnterpriseRequest {
  return { enterpriseName: d.razaoSocial.trim(), cnpj: d.cnpj, phone: d.telefone, email: d.email.trim(), enterpriseTypes: tiposParaApi(d.tipos) };
}

export type DadosEdicaoFornecedor = Partial<Pick<DadosCadastroFornecedor, 'razaoSocial' | 'telefone' | 'email'>>;

/** Só manda o que veio: no PATCH, campo omitido fica como está. */
export function edicaoParaApi(d: DadosEdicaoFornecedor): UpdateEnterpriseRequest {
  const corpo: UpdateEnterpriseRequest = {};
  if (d.razaoSocial !== undefined) corpo.enterpriseName = d.razaoSocial.trim();
  if (d.telefone !== undefined) corpo.phone = d.telefone;
  if (d.email !== undefined) corpo.email = d.email.trim();
  return corpo;
}

export function tiposRequestParaApi(tipos: readonly TipoFornecimento[]): ChangeEnterpriseTypesRequest {
  return { enterpriseTypes: tiposParaApi(tipos) };
}
