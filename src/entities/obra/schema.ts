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
