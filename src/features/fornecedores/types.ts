import type {
  CampoFornecedor,
  DocumentoEmpresa,
  DocumentoExigido,
  EventoResolvido,
  Fornecedor,
  ListaAplicavel,
  ListaExigencias,
  Obra,
  ResumoFornecedor,
  ResumoArquivos,
  EnvioArquivos,
  StatusDocumento,
  SituacaoFornecedor,
  TipoFornecimento,
  Vencimento,
  VinculoObra,
} from '@/entities';

export type LinhaFornecedor = { fornecedor: Fornecedor; resumo: ResumoFornecedor; aguardandoAcesso: boolean };

export type FiltroSituacao = 'todos' | SituacaoFornecedor;
export type FiltroTipo = 'todos' | TipoFornecimento;

export type ListaFornecedores = {
  linhas: LinhaFornecedor[];
  porSituacao: Record<FiltroSituacao, number>;
  porTipo: { servico: number; material: number };
};

export type DocumentoNaFicha = {
  exigido: DocumentoExigido;
  documento: DocumentoEmpresa | undefined;
  status: StatusDocumento;
  /** Há uma versão em análise na fila (primeiro envio ou renovação). */
  naFila: boolean;
};

/** Documento de funcionário: vários arquivos, nunca completo — o status é um resumo. */
export type DocumentoFuncionarioNaFicha = {
  exigido: DocumentoExigido;
  resumo: ResumoArquivos;
  /** Envio a abrir: o que tem arquivo em análise, ou o mais recente. */
  envioAlvo: EnvioArquivos | undefined;
  ultimoEnvio: string | undefined;
};

export type GrupoDocumentos = {
  aplicavel: ListaAplicavel;
  documentos: DocumentoNaFicha[];
  funcionario: DocumentoFuncionarioNaFicha[];
  obrigatoriosEmDia: number;
  obrigatoriosTotal: number;
};

export type ObraDoFornecedor = { obra: Obra; vinculo: VinculoObra; listasAplicaveis: number; listasNaObra: number };

export type FichaFornecedor = {
  fornecedor: Fornecedor;
  resumo: ResumoFornecedor;
  aguardandoAcesso: boolean;
  grupos: GrupoDocumentos[];
  ignoradas: Array<{ lista: ListaExigencias; obras: Obra[] }>;
  obras: ObraDoFornecedor[];
  historico: EventoResolvido[];
  /** Documentos obrigatórios com pendência (pendente, reprovado ou vencido) — o que a cobrança envia. */
  pendenciasParaCobrar: number;
};

export type Vencimentos = { proximos: Vencimento[]; vencidos: Vencimento[] };

/** Obra que pode ser escolhida no cadastro, com as listas que ela tem. */
export type ObraParaCadastro = { obra: Obra; listas: ListaExigencias[] };

/** Cadastro: só o que a API aceita (razão social, CNPJ, telefone, e-mail, tipos) e a obra, quando houver como vincular. */
export type NovoFornecedor = {
  cnpj: string;
  razaoSocial: string;
  telefone: string;
  email: string;
  tipos: TipoFornecimento[];
  /** Só nos dados de demonstração: a API não cria vínculo com obra. */
  obraId: string;
  servicoContratado: string;
};

/** Edição: o que a API deixa mudar depois do cadastro. */
export type EdicaoFornecedor = {
  razaoSocial: string;
  telefone: string;
  email: string;
  tipos: TipoFornecimento[];
};

/** Campos dos formulários de fornecedor que podem ter erro. */
export type CampoFormFornecedor = CampoFornecedor | 'servico';

export type ErrosFormFornecedor = Partial<Record<CampoFormFornecedor, string>>;
