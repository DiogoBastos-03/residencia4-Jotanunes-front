import { diaDeUtc, momentoDeUtc } from '../lib/datasApi';
import type { DocumentoAcervo, EscopoAcervo, FiltrosAcervo, GrupoAcervo, LinkVisualizacao, StatusAcervo } from './model';
import type { ArchiveDocument, ArchiveGroup, ArchiveQuery, DocumentScope, DocumentSubmissionStatus, ViewUrlResponse } from './schema';

const ESCOPO_DA_API: Readonly<Record<DocumentScope, EscopoAcervo>> = { Enterprise: 'empresa', Employee: 'funcionario' };
const ESCOPO_PARA_API: Readonly<Record<EscopoAcervo, DocumentScope>> = { empresa: 'Enterprise', funcionario: 'Employee' };

const STATUS_DA_API: Readonly<Record<DocumentSubmissionStatus, StatusAcervo>> = {
  Pending: 'emAnalise',
  Approved: 'aprovado',
  Rejected: 'reprovado',
  RevisionRequired: 'emRevisao',
  Cancelled: 'cancelado',
};
const STATUS_PARA_API: Readonly<Record<StatusAcervo, DocumentSubmissionStatus>> = {
  emAnalise: 'Pending',
  aprovado: 'Approved',
  reprovado: 'Rejected',
  emRevisao: 'RevisionRequired',
  cancelado: 'Cancelled',
};

function documentoDaApi(d: ArchiveDocument): DocumentoAcervo {
  return {
    id: d.documentSubmissionId,
    tipoDocumentoId: d.documentDefinitionId,
    tipoDocumentoNome: d.documentDefinitionName,
    status: STATUS_DA_API[d.status],
    competencia: d.competency,
    validade: d.expiresAt ? diaDeUtc(d.expiresAt) : null,
    ultimoEnvio: momentoDeUtc(d.lastSendAt),
  };
}

export function grupoAcervoDaApi(g: ArchiveGroup): GrupoAcervo {
  return {
    escopo: ESCOPO_DA_API[g.scope],
    funcionario: g.scope === 'Employee' ? { nome: g.employeeName ?? '', cpfMascarado: g.employeeCpf ?? '' } : null,
    documentos: g.documents.map(documentoDaApi),
  };
}

export function filtrosAcervoParaApi(f: FiltrosAcervo): ArchiveQuery {
  return {
    documentDefinitionId: f.tipoDocumentoId,
    scope: f.escopo ? ESCOPO_PARA_API[f.escopo] : undefined,
    status: f.status ? STATUS_PARA_API[f.status] : undefined,
    competency: f.competencia,
  };
}

export function linkDaApi(r: ViewUrlResponse): LinkVisualizacao {
  return { url: r.url, expiraEm: momentoDeUtc(r.expiresAt) };
}
