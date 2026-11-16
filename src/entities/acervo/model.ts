import type { IsoDate } from '../common';

export type EscopoAcervo = 'empresa' | 'funcionario';

/**
 * Situação da versão atual de um documento no acervo. Atenção: `Pending` da API é
 * "recebido, aguardando análise" — no front, `emAnalise`, não o nosso `pendente` (nada enviado).
 */
export type StatusAcervo = 'emAnalise' | 'aprovado' | 'reprovado' | 'emRevisao' | 'cancelado';

export type DocumentoAcervo = {
  /** documentSubmissionId — usar no link de visualização e no download em lote. */
  id: string;
  tipoDocumentoId: string;
  tipoDocumentoNome: string;
  status: StatusAcervo;
  /** Mês de referência ("2026-09"), quando houver. */
  competencia: string | null;
  validade: IsoDate | null;
  ultimoEnvio: IsoDate;
};

export type GrupoAcervo = {
  escopo: EscopoAcervo;
  /** null nos documentos da empresa. CPF sempre mascarado pela API. */
  funcionario: { nome: string; cpfMascarado: string } | null;
  documentos: DocumentoAcervo[];
};

export type FiltrosAcervo = {
  tipoDocumentoId?: string;
  escopo?: EscopoAcervo;
  status?: StatusAcervo;
  competencia?: string;
};

/** Link assinado, válido por 5 minutos. Peça outro a cada visualização. */
export type LinkVisualizacao = { url: string; expiraEm: IsoDate };

export type ArquivoBaixado = { blob: Blob; nomeArquivo: string };
