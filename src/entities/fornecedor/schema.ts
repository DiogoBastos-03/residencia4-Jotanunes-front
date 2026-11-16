import { z } from 'zod';
import { dataHoraUtc, guid, paginaSchema } from '@/shared/api';

/** Módulo `enterprise` do contrato (seção 4). Os tipos são inferidos destes schemas. */

export const enterpriseTypeSchema = z.enum(['Material', 'Servico']);
export type EnterpriseType = z.infer<typeof enterpriseTypeSchema>;

// 4.1 POST /enterprises
export const registerEnterpriseRequestSchema = z.object({
  enterpriseName: z.string().min(2).max(255),
  cnpj: z.string().min(14).max(18),
  phone: z.string(),
  email: z.email(),
  enterpriseTypes: z.array(enterpriseTypeSchema).min(1),
});
export type RegisterEnterpriseRequest = z.infer<typeof registerEnterpriseRequestSchema>;

export const registerEnterpriseResponseSchema = z.object({ enterpriseId: guid });
export type RegisterEnterpriseResponse = z.infer<typeof registerEnterpriseResponseSchema>;

// 4.2 GET /enterprises
export const enterpriseListQuerySchema = z.object({
  type: enterpriseTypeSchema.optional(),
  active: z.boolean().optional(),
  constructionIds: z.array(guid).optional(),
  page: z.number().int().optional(),
  pageSize: z.number().int().optional(),
});
export type EnterpriseListQuery = z.infer<typeof enterpriseListQuerySchema>;

export const enterpriseListItemSchema = z.object({
  enterpriseId: guid,
  enterpriseName: z.string(),
  /** Só dígitos. */
  cnpj: z.string().regex(/^\d{14}$/),
  types: z.array(enterpriseTypeSchema),
  active: z.boolean(),
});
export type EnterpriseListItem = z.infer<typeof enterpriseListItemSchema>;

export const enterprisePageSchema = paginaSchema(enterpriseListItemSchema);
export type EnterprisePage = z.infer<typeof enterprisePageSchema>;

// 4.3 GET /enterprises/{id}
export const enterpriseDetailSchema = z.object({
  enterpriseId: guid,
  enterpriseName: z.string(),
  cnpj: z.string().regex(/^\d{14}$/),
  /** Só dígitos. */
  phone: z.string().regex(/^\d{10,11}$/),
  email: z.string(),
  types: z.array(enterpriseTypeSchema),
  active: z.boolean(),
  createdAt: dataHoraUtc,
  updatedAt: dataHoraUtc,
});
export type EnterpriseDetail = z.infer<typeof enterpriseDetailSchema>;

// 4.4 PATCH /enterprises/{id} — campo omitido ou null fica como está.
export const updateEnterpriseRequestSchema = z.object({
  enterpriseName: z.string().min(2).max(255).nullish(),
  phone: z.string().nullish(),
  email: z.email().nullish(),
});
export type UpdateEnterpriseRequest = z.infer<typeof updateEnterpriseRequestSchema>;

// 4.5 PUT /enterprises/{id}/types
export const changeEnterpriseTypesRequestSchema = z.object({ enterpriseTypes: z.array(enterpriseTypeSchema).min(1) });
export type ChangeEnterpriseTypesRequest = z.infer<typeof changeEnterpriseTypesRequestSchema>;

// 4.6 PATCH /enterprises/{id}/status
export const changeEnterpriseStatusRequestSchema = z.object({ active: z.boolean() });
export type ChangeEnterpriseStatusRequest = z.infer<typeof changeEnterpriseStatusRequestSchema>;
