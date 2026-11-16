import { z } from 'zod';
import { dataSimples, guid } from '@/shared/api';

/** Módulo `expiration` do contrato (seção 7). */

// 7.1 GET /pending-panel — não é paginado.
export const pendingPanelRowSchema = z.object({
  enterpriseId: guid,
  enterpriseName: z.string(),
  pendingCount: z.number().int().nonnegative(),
  upcomingCount: z.number().int().nonnegative(),
  expiredCount: z.number().int().nonnegative(),
  postponedCount: z.number().int().nonnegative(),
});
export type PendingPanelRow = z.infer<typeof pendingPanelRowSchema>;

export const pendingPanelResponseSchema = z.array(pendingPanelRowSchema);

// 7.2 POST /pending-panel/requirements/{id}/postpone — deadlineAt é SÓ DATA (YYYY-MM-DD).
export const postponeRequestSchema = z.object({
  deadlineAt: dataSimples,
  reason: z.string().max(500).optional(),
});
export type PostponeRequest = z.infer<typeof postponeRequestSchema>;
