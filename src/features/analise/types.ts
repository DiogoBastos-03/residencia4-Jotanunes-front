import type {
  DocumentoEmpresa,
  Obra,
  StatusDocumento,
  DocumentoExigido,
  EntradaFila,
  EntradaFilaRemessa,
  Funcionario,
  ItemFuncionarios,
  Analise,
  Fornecedor,
  ListaExigencias,
  TempoAnalise,
} from '@/entities';

export type FiltroFila = 'todos' | 'documentos' | 'funcionarios' | 'urgentes';

export type ContagemFila = Record<FiltroFila, number>;

export type Fila = {
  entradas: EntradaFila[];
  contagem: ContagemFila;
  /** Esperando há mais de 2 dias. */
  atrasadas: number;
};

export type DetalheEnvio = {
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
  /** Última decisão sobre este documento, quando já foi analisado. */
  decisao: Analise | undefined;
  /** Próximo item da fila depois deste. */
  proximo: EntradaFila | undefined;
};

export type PessoaNaRemessa = {
  funcionario: Funcionario;
  enviados: number;
  exigidos: number;
};

export type DetalheRemessa = {
  entrada: EntradaFilaRemessa;
  item: ItemFuncionarios;
  pessoas: PessoaNaRemessa[];
  aprovados: number;
  aguardando: number;
  reprovados: number;
};

export type AnaliseComFornecedor = Analise & { fornecedor: Fornecedor };

export type ResumoAnalisesHoje = {
  recentes: AnaliseComFornecedor[];
  total: number;
  aprovados: number;
  reprovados: number;
};

export type TempoAnaliseLista = TempoAnalise & { lista: ListaExigencias };
