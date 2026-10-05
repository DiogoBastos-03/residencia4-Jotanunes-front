import type {
  Analise,
  ArquivoFuncionario,
  DocumentoEmpresa,
  DocumentoExigido,
  EntradaFila,
  EnvioArquivos,
  Fornecedor,
  ListaExigencias,
  Obra,
  ResumoArquivos,
  StatusDocumento,
} from '@/entities';
import type { Alvo } from './lib';

export type FiltroFila = 'todos' | 'empresa' | 'funcionario' | 'urgentes';

export type ContagemFila = Record<FiltroFila, number>;

export type Fila = {
  entradas: EntradaFila[];
  contagem: ContagemFila;
  /** Esperando há mais de 2 dias. */
  atrasadas: number;
};

/** Documento da empresa aberto na análise — em análise (decidir) ou já decidido (leitura). */
export type DetalheDocumento = {
  documento: DocumentoEmpresa;
  exigido: DocumentoExigido;
  fornecedor: Fornecedor;
  lista: ListaExigencias;
  obraPrincipal: Obra;
  obrasExtras: number;
  /** Ainda espera decisão (primeiro envio ou nova versão). */
  emAnalise: boolean;
  renovacao: boolean;
  status: StatusDocumento;
  arquivo: string;
  tamanhoKb: number;
  paginas: number;
  enviadoEm: string;
  esperaDias: number;
  validadeInformada: string | undefined;
};

export type ArquivoNaAnalise = { arquivo: ArquivoFuncionario; status: StatusDocumento };

/** Envio de documento de funcionário: os arquivos daquele envio, cada um com sua decisão. */
export type DetalheEnvioArquivos = {
  envio: EnvioArquivos;
  exigido: DocumentoExigido;
  fornecedor: Fornecedor;
  lista: ListaExigencias;
  arquivos: ArquivoNaAnalise[];
  resumoEnvio: ResumoArquivos;
  /** Somando todos os envios do item. */
  resumoItem: ResumoArquivos;
  emAnalise: boolean;
};

/** Onde estamos na sequência da origem: "3 de 7", anterior e próximo. */
export type Sequencia = {
  alvos: Alvo[];
  indice: number;
  anterior: Alvo | undefined;
  proximo: Alvo | undefined;
  /** Nome da origem para a migalha (fornecedor ou obra); undefined na fila. */
  origemNome: string | undefined;
};

export type AnaliseComFornecedor = Analise & { fornecedor: Fornecedor };

export type ResumoAnalisesHoje = {
  recentes: AnaliseComFornecedor[];
  total: number;
  aprovados: number;
  reprovados: number;
};
