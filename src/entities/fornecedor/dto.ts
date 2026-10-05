import { booleano, campo, listaDe, objeto, texto, umDe, type Leitor } from '@/shared/lib/json';

/**
 * Formas exatas do back (src/modules/enterprise, ver API.md seção 7), em camelCase.
 * Só a camada de mapeamento e a de api usam estes tipos.
 */

export const ENTERPRISE_TYPES = ['Material', 'Servico'] as const;
export type EnterpriseTypeDto = (typeof ENTERPRISE_TYPES)[number];

/** GET /enterprises — item da página. */
export type EnterpriseListItemDto = {
  enterpriseId: string;
  enterpriseName: string;
  cnpj: string;
  types: EnterpriseTypeDto[];
  active: boolean;
};

/** GET /enterprises/{id}. Datas sem fuso, gravadas em UTC. */
export type EnterpriseDetailDto = {
  enterpriseId: string;
  enterpriseName: string;
  cnpj: string;
  phone: string;
  email: string;
  types: EnterpriseTypeDto[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** POST /enterprises — corpo. */
export type RegisterEnterpriseRequestDto = {
  enterpriseName: string;
  cnpj: string;
  phone: string;
  email: string;
  enterpriseTypes: EnterpriseTypeDto[];
};

/** POST /enterprises — resposta 201. */
export type RegisterEnterpriseOutputDto = { enterpriseId: string };

/** PATCH /enterprises/{id} — campo ausente não muda. */
export type UpdateEnterpriseDataRequestDto = { enterpriseName?: string; phone?: string; email?: string };

/** PUT /enterprises/{id}/types — substitui a lista. */
export type ChangeEnterpriseTypesRequestDto = { enterpriseTypes: EnterpriseTypeDto[] };

/** PATCH /enterprises/{id}/status. */
export type ChangeEnterpriseStatusRequestDto = { active: boolean };

const tipos = listaDe(umDe(ENTERPRISE_TYPES));

export const lerEnterpriseListItem: Leitor<EnterpriseListItemDto> = (valor, caminho) => {
  const o = objeto(valor, caminho);
  return {
    enterpriseId: campo(o, 'enterpriseId', texto, caminho),
    enterpriseName: campo(o, 'enterpriseName', texto, caminho),
    cnpj: campo(o, 'cnpj', texto, caminho),
    types: campo(o, 'types', tipos, caminho),
    active: campo(o, 'active', booleano, caminho),
  };
};

export const lerEnterpriseDetail: Leitor<EnterpriseDetailDto> = (valor, caminho) => {
  const o = objeto(valor, caminho);
  return {
    enterpriseId: campo(o, 'enterpriseId', texto, caminho),
    enterpriseName: campo(o, 'enterpriseName', texto, caminho),
    cnpj: campo(o, 'cnpj', texto, caminho),
    phone: campo(o, 'phone', texto, caminho),
    email: campo(o, 'email', texto, caminho),
    types: campo(o, 'types', tipos, caminho),
    active: campo(o, 'active', booleano, caminho),
    createdAt: campo(o, 'createdAt', texto, caminho),
    updatedAt: campo(o, 'updatedAt', texto, caminho),
  };
};

export const lerRegisterEnterpriseOutput: Leitor<RegisterEnterpriseOutputDto> = (valor, caminho) => ({
  enterpriseId: campo(objeto(valor, caminho), 'enterpriseId', texto, caminho),
});
