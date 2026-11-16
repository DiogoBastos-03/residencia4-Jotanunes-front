import { z } from 'zod';
import { dataHoraUtc, guid, paginaSchema } from '@/shared/api';

/**
 * Módulo `workflow` do back, parte de documentos (lido do código: DocumentFormatController,
 * DocumentDefinitionController, DocumentDefinition, ExpirationPolicy).
 * GET   /api/v1/internal/workflow/document-formats
 * GET   /api/v1/internal/workflow/document-definitions?name=&page=&pageSize=
 * GET   /api/v1/internal/workflow/document-definitions/{id}
 * POST  /api/v1/internal/workflow/document-definitions
 * PATCH /api/v1/internal/workflow/document-definitions/{id}
 */

export const documentFormatSchema = z.object({
  documentFormatId: z.number().int(),
  name: z.string(),
  icon: z.string(),
  type: z.string(),
});
export const documentFormatListSchema = z.array(documentFormatSchema);
export type DocumentFormat = z.infer<typeof documentFormatSchema>;

const documentDefinitionBase = {
  documentDefinitionId: guid,
  name: z.string(),
  description: z.string(),
  maxSizeBytes: z.number().int(),
  canReuse: z.boolean(),
  /** null: o documento não vence. */
  expiresInDays: z.number().int().nullable(),
  acceptedFormatIds: z.array(z.number().int()),
};

export const documentDefinitionListItemSchema = z.object(documentDefinitionBase);
export type DocumentDefinitionListItem = z.infer<typeof documentDefinitionListItemSchema>;

export const documentDefinitionPageSchema = paginaSchema(documentDefinitionListItemSchema);
export type DocumentDefinitionPage = z.infer<typeof documentDefinitionPageSchema>;

export const documentDefinitionDetailSchema = z.object({ ...documentDefinitionBase, createdAt: dataHoraUtc, updatedAt: dataHoraUtc });
export type DocumentDefinitionDetail = z.infer<typeof documentDefinitionDetailSchema>;

/** POST: nome (≤100), descrição (≤255, pode ser vazia), tamanho (1 byte–20 MB), reaproveitável, validade (null = não vence) e formatos (≥1). */
export type CreateDocumentDefinitionRequest = {
  name: string;
  description: string;
  maxSizeBytes: number;
  canReuse: boolean;
  expiresInDays: number | null;
  acceptedFormatIds: number[];
};

export const createDocumentDefinitionResponseSchema = z.object({ documentDefinitionId: guid });

/** PATCH: edição parcial; campo ausente não muda. neverExpires=true remove a validade (não junto com expiresInDays). */
export type UpdateDocumentDefinitionRequest = {
  name?: string;
  description?: string;
  maxSizeBytes?: number;
  canReuse?: boolean;
  expiresInDays?: number;
  neverExpires?: boolean;
  acceptedFormatIds?: number[];
};
