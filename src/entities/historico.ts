import type { IsoDate } from './common';
import type { MotivoReprovacao } from './documento';

/** Decisão tomada pela equipe de Suprimentos. */
export type Analise = {
  id: string;
  quando: IsoDate;
  analista: string;
  /** Nome do documento analisado, como aparece para a equipe. */
  documento: string;
  fornecedorId: string;
  resultado: 'aprovado' | 'reprovado';
  /** Documento da empresa analisado, quando houver. */
  documentoId?: string;
  /** Arquivo de documento de funcionário analisado, quando houver. */
  arquivoId?: string;
  motivo?: MotivoReprovacao;
  observacao?: string;
};

export type AutorEvento =
  | { kind: 'pessoa'; nome: string }
  | { kind: 'fornecedor'; fornecedorId: string }
  | { kind: 'sistema' }
  | { kind: 'integracao' };

/** O que aconteceu. O texto exibido é montado em shared/strings. */
export type AcaoEvento =
  | { tipo: 'documentoEnviado'; documento: string }
  | { tipo: 'arquivosEnviados'; quantidade: number; documento: string }
  | { tipo: 'documentoVencido'; documento: string; fornecedorId: string }
  | { tipo: 'documentoAprovado'; documento: string }
  | { tipo: 'documentoReprovado'; documento: string; motivo: MotivoReprovacao }
  | { tipo: 'fornecedorVinculado'; fornecedorId: string; obraId: string }
  | { tipo: 'listasVinculadas'; listaIds: readonly string[]; obraId: string }
  | { tipo: 'listaDesvinculada'; listaId: string; obraId: string }
  | { tipo: 'obraRecebida'; obraId: string };

export type EventoHistorico = {
  id: string;
  quando: IsoDate;
  autor: AutorEvento;
  acao: AcaoEvento;
  /** Aparece no histórico da obra. */
  obraId?: string;
  /** Aparece no histórico do fornecedor. */
  fornecedorId?: string;
};

export type PeriodoRelatorio = '30d' | '90d' | 'ano';

export type TempoAnalise = {
  periodo: PeriodoRelatorio;
  listaId: string;
  diasMedios: number;
  /** Acima da meta de análise. */
  acimaDaMeta: boolean;
};
