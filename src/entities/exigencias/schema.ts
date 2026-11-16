import { z } from 'zod';
import { dataHoraUtc, guid, paginaSchema } from '@/shared/api';

/**
 * Listas de exigências = "workflows" do back (lido do código: WorkflowController,
 * ConstructionWorkflowController, WorkFlow, WorkFlowVersion, WorkflowVersionNumber).
 * GET   /api/v1/internal/workflow/workflows?type=&name=&page=&pageSize=
 * GET   /api/v1/internal/workflow/workflows/{id}
 * GET   /api/v1/internal/workflow/workflows/{id}/versions
 * POST  /api/v1/internal/workflow/workflows
 * PATCH /api/v1/internal/workflow/workflows/{id}                 (renomear)
 * PUT   /api/v1/internal/workflow/workflows/{id}/requirements    (gera versão nova)
 * GET   /api/v1/internal/workflow/constructions/{obraId}/workflows
 * POST  /api/v1/internal/workflow/constructions/{obraId}/workflows
 * O id da lista é inteiro (gerado pelo banco); o da versão é GUID.
 */

/** Enum como string no JSON (JsonStringEnumConverter sem inteiros). */
export const workflowTypeSchema = z.enum(['Material', 'Servico']);
export type WorkflowType = z.infer<typeof workflowTypeSchema>;

export const workflowListItemSchema = z.object({ workFlowId: z.number().int(), name: z.string(), type: workflowTypeSchema });
export type WorkflowListItem = z.infer<typeof workflowListItemSchema>;
export const workflowPageSchema = paginaSchema(workflowListItemSchema);
export type WorkflowPage = z.infer<typeof workflowPageSchema>;

export const workflowDocumentSchema = z.object({ documentDefinitionId: guid, displayOrder: z.number().int(), required: z.boolean() });
export type WorkflowDocument = z.infer<typeof workflowDocumentSchema>;

/** Número da versão é decimal no back (1.00, 2.00…): cada versão nova soma 1. */
export const workflowVersionDetailSchema = z.object({
  workFlowVersionId: guid,
  version: z.number(),
  documents: z.array(workflowDocumentSchema),
  createdAt: dataHoraUtc,
});
export type WorkflowVersionDetail = z.infer<typeof workflowVersionDetailSchema>;
export const workflowVersionListSchema = z.array(workflowVersionDetailSchema);

export const workflowDetailSchema = z.object({
  workFlowId: z.number().int(),
  name: z.string(),
  type: workflowTypeSchema,
  createdAt: dataHoraUtc,
  updatedAt: dataHoraUtc,
  currentVersion: workflowVersionDetailSchema,
});
export type WorkflowDetail = z.infer<typeof workflowDetailSchema>;

export type CreateWorkflowRequest = {
  name: string;
  type: WorkflowType;
  documents: WorkflowDocument[];
  /** Opcional: já vincula a lista a esta obra. Sem obra, o back ignora o prazo. */
  constructionId?: string;
  limitExpiresDays?: number;
};
export const createWorkflowResponseSchema = z.object({
  workFlowId: z.number().int(),
  workFlowVersionId: guid,
  /** Empresas da obra vinculadas à lista; vazio sem obra. */
  assignedEnterpriseIds: z.array(guid),
});

export const workflowVersionResponseSchema = z.object({ workFlowId: z.number().int(), workFlowVersionId: guid, version: z.number() });

export const constructionWorkflowSchema = z.object({
  workFlowId: z.number().int(),
  name: z.string(),
  type: workflowTypeSchema,
  workFlowVersionId: guid,
  version: z.number(),
});
export const constructionWorkflowListSchema = z.array(constructionWorkflowSchema);
export type ConstructionWorkflow = z.infer<typeof constructionWorkflowSchema>;

export const assignWorkflowResponseSchema = z.object({ workFlowVersionId: guid, assignedEnterpriseIds: z.array(guid) });
