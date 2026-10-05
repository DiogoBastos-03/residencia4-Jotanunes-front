import type {
  ComposicaoLista,
  EventoResolvido,
  Fornecedor,
  Funcionario,
  GrupoPendencias,
  ListaExigencias,
  Obra,
  ResumoFornecedor,
  TipoFornecimento,
  VinculoObra,
} from '@/entities';

export type LinhaObra = {
  obra: Obra;
  listas: number;
  fornecedores: number;
  funcionarios: number;
  pendencias: number;
};

export type ListaComComposicao = { lista: ListaExigencias; composicao: ComposicaoLista };

export type ListaNaObra = ListaComComposicao & {
  vinculadaEm: string;
  /** Fornecedores desta obra que recebem as exigências da lista. */
  aplicaA: number;
  fornecedoresNaObra: number;
};

export type FornecedorNaObra = {
  fornecedor: Fornecedor;
  vinculo: VinculoObra;
  /** Listas da obra que se aplicam a este fornecedor. */
  listasAplicaveis: number;
  listasNaObra: number;
  resumo: ResumoFornecedor;
};

export type PessoaNaObra = { funcionario: Funcionario; enviados: number; exigidos: number };

export type FichaObra = {
  obra: Obra;
  listas: ListaNaObra[];
  fornecedores: FornecedorNaObra[];
  funcionariosEmCampo: number;
  /** Pessoas da remessa mais recente desta obra. */
  remessaRecente: { fornecedor: Fornecedor; pessoas: PessoaNaObra[] } | null;
  /** Alguma lista desta obra pede cadastro de funcionários. */
  temItemFuncionarios: boolean;
  pendencias: GrupoPendencias[];
  totalPendencias: number;
  historico: EventoResolvido[];
  /** Listas ativas que ainda não valem nesta obra. */
  listasDisponiveis: ListaComComposicao[];
  /** Fornecedores que ainda não estão nesta obra. */
  fornecedoresDisponiveis: Fornecedor[];
  fornecedoresPorTipo: Record<TipoFornecimento, number>;
  /** Documentos que as listas atuais já exigem de cada tipo — para contar os "novos". */
  documentosExigidosPorTipo: Record<TipoFornecimento, string[]>;
};

export type PendenciasPorObra = { obra: Obra; total: number; fornecedores: number };

export type NovoVinculo = {
  obraId: string;
  fornecedorId: string;
  servicoContratado: string;
  /** yyyy-MM-01 */
  inicio: string;
  fim: string;
};
