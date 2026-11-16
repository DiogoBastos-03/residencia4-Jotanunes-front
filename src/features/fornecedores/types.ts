import type {
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
  FornecedorCadastro,
  FornecedorResumo,
  ObraResumo,
  StatusDocumento,
  SituacaoFornecedor,
  TipoFornecimento,
  VinculoObra,
} from '@/entities';

// ——— Telas em uso: só dados da API ———

/** Linha da lista: o fornecedor como a listagem da API devolve, mais quantas obras ele tem (filtro por obra da API). */
export type LinhaFornecedor = { fornecedor: FornecedorResumo; obras: number };

export type FiltroSituacao = 'todos' | SituacaoFornecedor;
export type FiltroTipo = 'todos' | TipoFornecimento;

export type ListaFornecedores = {
  linhas: LinhaFornecedor[];
  porSituacao: Record<FiltroSituacao, number>;
  porTipo: { servico: number; material: number };
};

/** Ficha do fornecedor: o detalhe da API e as obras dele (GET /constructions?enterpriseId=). */
export type FichaCadastral = { cadastro: FornecedorCadastro; obras: ObraResumo[] };

/** Cadastro: exatamente o que o POST /enterprises aceita. */
export type NovoFornecedor = {
  cnpj: string;
  razaoSocial: string;
  telefone: string;
  email: string;
  tipos: TipoFornecimento[];
  /** Vínculo opcional, feito depois do cadastro (POST …/constructions/{obraId}/enterprises). Vazio: sem vínculo. */
  obraId: string;
  prazoDias: string;
};

/** Edição dos dados da empresa e dos tipos. */
export type EdicaoFornecedor = {
  razaoSocial: string;
  telefone: string;
  email: string;
  tipos: TipoFornecimento[];
};

/** Campos dos formulários de fornecedor que podem ter erro. */
export type CampoFormFornecedor = 'cnpj' | 'razaoSocial' | 'telefone' | 'email' | 'tipos' | 'prazo';

export type ErrosFormFornecedor = Partial<Record<CampoFormFornecedor, string>>;

// ——— Fora de uso: ficha documental, montada sobre o dataset em memória ———
// Alimentava as abas Documentos, Exigências, Histórico e Contatos, que saíram da interface
// até a API ter os endpoints (ver src/pages/fornecedor/FornecedorPage.tsx).

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

