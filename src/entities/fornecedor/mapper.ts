import type { TipoFornecimento } from '../common';
import { diaDaApi } from '../lib/dates';
import type {
  EnterpriseDetailDto,
  EnterpriseTypeDto,
  RegisterEnterpriseRequestDto,
  UpdateEnterpriseDataRequestDto,
} from './dto';
import type { Fornecedor } from './model';

/** O único lugar que traduz o tipo do back para o do front, e vice-versa. */
const TIPO_DA_API: Readonly<Record<EnterpriseTypeDto, TipoFornecimento>> = { Material: 'material', Servico: 'servico' };
const TIPO_PARA_API: Readonly<Record<TipoFornecimento, EnterpriseTypeDto>> = { material: 'Material', servico: 'Servico' };

/** Ordem fixa (serviço antes de material) e sem repetição. */
export function normalizarTipos(tipos: readonly TipoFornecimento[]): TipoFornecimento[] {
  return (['servico', 'material'] as const).filter((t) => tipos.includes(t));
}

export function tiposDaApi(tipos: readonly EnterpriseTypeDto[]): TipoFornecimento[] {
  return normalizarTipos(tipos.map((t) => TIPO_DA_API[t]));
}

export function tiposParaApi(tipos: readonly TipoFornecimento[]): EnterpriseTypeDto[] {
  return normalizarTipos(tipos).map((t) => TIPO_PARA_API[t]);
}

/**
 * Detalhe da API → Fornecedor. `active` fica aqui: acima desta camada só existe `bloqueado`.
 * Campos sem fonte na API: nome fantasia (vazio), contatos (lista vazia), acesso ao portal (ausente).
 */
export function fornecedorDaApi(dto: EnterpriseDetailDto): Fornecedor {
  return {
    id: dto.enterpriseId,
    razaoSocial: dto.enterpriseName,
    nomeFantasia: undefined,
    acessoPortal: undefined,
    cnpj: dto.cnpj.replace(/\D/g, ''),
    tipos: tiposDaApi(dto.types),
    telefone: dto.phone.replace(/\D/g, ''),
    email: dto.email,
    desde: diaDaApi(dto.createdAt),
    bloqueado: !dto.active,
    contatos: [],
  };
}

/** O que o formulário de cadastro manda — só o que o back aceita. */
export type DadosCadastroFornecedor = {
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  tipos: readonly TipoFornecimento[];
};

export function cadastroParaApi(dados: DadosCadastroFornecedor): RegisterEnterpriseRequestDto {
  return {
    enterpriseName: dados.razaoSocial.trim(),
    cnpj: dados.cnpj.replace(/\D/g, ''),
    phone: dados.telefone.replace(/\D/g, ''),
    email: dados.email.trim(),
    enterpriseTypes: tiposParaApi(dados.tipos),
  };
}

export type DadosEdicaoFornecedor = Pick<DadosCadastroFornecedor, 'razaoSocial' | 'telefone' | 'email'>;

/** Só manda o que mudou: no PATCH do back, campo ausente não muda. */
export function edicaoParaApi(atual: Fornecedor, dados: DadosEdicaoFornecedor): UpdateEnterpriseDataRequestDto {
  const corpo: UpdateEnterpriseDataRequestDto = {};
  const razao = dados.razaoSocial.trim();
  const telefone = dados.telefone.replace(/\D/g, '');
  const email = dados.email.trim();
  if (razao !== atual.razaoSocial) corpo.enterpriseName = razao;
  if (telefone !== atual.telefone) corpo.phone = telefone;
  if (email !== atual.email) corpo.email = email;
  return corpo;
}

/** Campos do formulário que a API pode recusar num 400. */
export type CampoFornecedor = 'razaoSocial' | 'cnpj' | 'telefone' | 'email' | 'tipos';

const CAMPO_DA_API: Readonly<Record<string, CampoFornecedor>> = {
  enterpriseName: 'razaoSocial',
  cnpj: 'cnpj',
  phone: 'telefone',
  email: 'email',
  enterpriseTypes: 'tipos',
};

/** Traduz `fieldErrors` do ApiError (nomes do back) para os campos do formulário. */
export function camposRecusados(fieldErrors: Readonly<Record<string, readonly string[]>> | undefined): CampoFornecedor[] {
  if (!fieldErrors) return [];
  return [...new Set(Object.keys(fieldErrors).flatMap((chave) => {
    const campo = CAMPO_DA_API[chave];
    return campo ? [campo] : [];
  }))];
}
