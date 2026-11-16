import { z } from 'zod';
import { dataHoraUtc, guid } from '@/shared/api';

/** Módulo `archive` do contrato (seção 6). Só consulta: nenhuma rota aceita upload. */

export const documentScopeSchema = z.enum(['Enterprise', 'Employee']);
export type DocumentScope = z.infer<typeof documentScopeSchema>;

export const documentSubmissionStatusSchema = z.enum(['Pending', 'Approved', 'Rejected', 'RevisionRequired', 'Cancelled']);
export type DocumentSubmissionStatus = z.infer<typeof documentSubmissionStatusSchema>;

// 6.1 GET /enterprises/{id}/archive
export const archiveQuerySchema = z.object({
  documentDefinitionId: guid.optional(),
  scope: documentScopeSchema.optional(),
  status: documentSubmissionStatusSchema.optional(),
  /** Mês de referência, ex.: "2026-09". */
  competency: z.string().optional(),
});
export type ArchiveQuery = z.infer<typeof archiveQuerySchema>;

export const archiveDocumentSchema = z.object({
  documentSubmissionId: guid,
  documentDefinitionId: guid,
  documentDefinitionName: z.string(),
  status: documentSubmissionStatusSchema,
  competency: z.string().nullable(),
  expiresAt: dataHoraUtc.nullable(),
  lastSendAt: dataHoraUtc,
});
export type ArchiveDocument = z.infer<typeof archiveDocumentSchema>;

export const archiveGroupSchema = z.object({
  scope: documentScopeSchema,
  /** Sempre mascarado ("***.456.789-**"); null no escopo Enterprise. */
  employeeCpf: z.string().nullable(),
  employeeName: z.string().nullable(),
  documents: z.array(archiveDocumentSchema),
});
export type ArchiveGroup = z.infer<typeof archiveGroupSchema>;

export const archiveResponseSchema = z.array(archiveGroupSchema);
export type ArchiveResponse = z.infer<typeof archiveResponseSchema>;

// 6.2 GET .../view-url — vale 5 minutos; nunca guardar.
export const viewUrlResponseSchema = z.object({ url: z.url(), expiresAt: dataHoraUtc });
export type ViewUrlResponse = z.infer<typeof viewUrlResponseSchema>;

// 6.3 POST .../batch-download — resposta é binário (application/zip), não JSON.
export const batchDownloadRequestSchema = z.object({ documentSubmissionIds: z.array(guid).min(1).max(50) });
export type BatchDownloadRequest = z.infer<typeof batchDownloadRequestSchema>;
