import type {
  DocumentoEmpresa,
  DocumentoExigido,
  EventoHistorico,
  Fornecedor,
  Funcionario,
  ListaAplicavel,
  ListaExigencias,
  Obra,
  ResumoFornecedor,
  ResumoFuncionarios,
  StatusDocumento,
  SituacaoFornecedor,
  Vencimento,
  VinculoObra,
} from '@/entities';

export type LinhaFornecedor = { fornecedor: Fornecedor; resumo: ResumoFornecedor };

export type FiltroSituacao = 'todos' | SituacaoFornecedor;

export type ListaFornecedores = {
  linhas: LinhaFornecedor[];
  porSituacao: Record<FiltroSituacao, number>;
  porTipo: { servico: number; material: number };
};

export type DocumentoNaFicha = {
  exigido: DocumentoExigido;
  documento: DocumentoEmpresa | undefined;
  status: StatusDocumento;
};

export type GrupoDocumentos = {
  aplicavel: ListaAplicavel;
  documentos: DocumentoNaFicha[];
  obrigatoriosEmDia: number;
  obrigatoriosTotal: number;
  temFuncionarios: boolean;
};

export type ObraDoFornecedor = { obra: Obra; vinculo: VinculoObra; listasAplicaveis: number; listasNaObra: number };

export type FichaFornecedor = {
  fornecedor: Fornecedor;
  resumo: ResumoFornecedor;
  grupos: GrupoDocumentos[];
  ignoradas: Array<{ lista: ListaExigencias; obras: Obra[] }>;
  obras: ObraDoFornecedor[];
  funcionarios: Funcionario[];
  resumoFuncionarios: ResumoFuncionarios;
  historico: EventoHistorico[];
  /** Documentos obrigatórios com pendência (pendente, reprovado ou vencido) — o que a cobrança envia. */
  pendenciasParaCobrar: number;
};

export type Vencimentos = { proximos: Vencimento[]; vencidos: Vencimento[] };
