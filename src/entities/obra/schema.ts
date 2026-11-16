import { z } from 'zod';
import { guid, paginaSchema } from '@/shared/api';

/** Módulo `construction` do contrato (seção 5). */

export const constructionListQuerySchema = z.object({
  enterpriseId: guid.optional(),
  page: z.number().int().optional(),
  pageSize: z.number().int().optional(),
});
export type ConstructionListQuery = z.infer<typeof constructionListQuerySchema>;

export const constructionListItemSchema = z.object({ constructionId: guid, constructionName: z.string() });
export type ConstructionListItem = z.infer<typeof constructionListItemSchema>;

export const constructionPageSchema = paginaSchema(constructionListItemSchema);
export type ConstructionPage = z.infer<typeof constructionPageSchema>;

// ——— Vínculo empresa ↔ obra (ConstructionEnterpriseController) ———
// POST   /api/v1/internal/construction/constructions/{constructionId}/enterprises
// DELETE /api/v1/internal/construction/constructions/{constructionId}/enterprises/{enterpriseId}

export const addEnterpriseToConstructionRequestSchema = z.object({
  enterpriseId: guid,
  /** Prazo, em dias, para a empresa entregar os documentos dos workflows da obra (1–9999). */
  limitExpiresDays: z.number().int().min(1).max(9999),
});
export type AddEnterpriseToConstructionRequest = z.infer<typeof addEnterpriseToConstructionRequestSchema>;

/** Tipos de empresa como número: 1 = Material, 2 = Servico. */
export const enterpriseTypeIdSchema = z.union([z.literal(1), z.literal(2)]);

export const addEnterpriseToConstructionResponseSchema = z.object({
  /** Workflows da obra que a empresa passou a seguir. */
  assignedWorkFlowIds: z.array(z.number().int()),
  /** Tipos da empresa sem workflow nesta obra. */
  typesWithoutWorkflow: z.array(enterpriseTypeIdSchema),
});
export type AddEnterpriseToConstructionResponse = z.infer<typeof addEnterpriseToConstructionResponseSchema>;
