import type { IsoDate, TipoFornecimento } from '../common';

export type Contato = {
  papel: 'principal' | 'seguranca';
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
};

export type AcessoPortal = {
  /** null: cadastrado sem enviar convite. */
  convidadoEm: IsoDate | null;
  emailConvite: string;
  acessouEm?: IsoDate;
};

export type Fornecedor = {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  acessoPortal: AcessoPortal;
  /** Só dígitos. Formate com formatCnpj. */
  cnpj: string;
  /** Um ou dois tipos, sem repetição — a empresa pode fornecer material e serviço. */
  tipos: readonly TipoFornecimento[];
  /** Telefone da empresa, só dígitos (10 ou 11). Formate com formatPhone. */
  telefone: string;
  email: string;
  desde: IsoDate;
  bloqueado: boolean;
  contatos: readonly Contato[];
};

export type VinculoObra = {
  fornecedorId: string;
  obraId: string;
  servicoContratado: string;
  inicio: IsoDate;
  fim: IsoDate;
  vinculadoEm: IsoDate;
};

/** Situação cadastral, como a API informa (`active`). */
export type SituacaoFornecedor = 'ativo' | 'bloqueado';

export function situacaoDe(fornecedor: Pick<Fornecedor, 'bloqueado'>): SituacaoFornecedor {
  return fornecedor.bloqueado ? 'bloqueado' : 'ativo';
}

/** Convidado e ainda sem entrar no portal. */
export function aguardandoAcesso(fornecedor: Pick<Fornecedor, 'acessoPortal'>): boolean {
  return !fornecedor.acessoPortal.acessouEm;
}

/** A lista (ou o filtro) de um tipo vale para o fornecedor que fornece aquele tipo. */
export function forneceTipo(fornecedor: Pick<Fornecedor, 'tipos'>, tipo: TipoFornecimento): boolean {
  return fornecedor.tipos.includes(tipo);
}

/** Ordem fixa (serviço antes de material) e sem repetição. */
export function normalizarTipos(tipos: readonly TipoFornecimento[]): TipoFornecimento[] {
  return (['servico', 'material'] as const).filter((t) => tipos.includes(t));
}

/** Fornecedor como a listagem da API devolve (sem telefone, e-mail nem datas). */
export type FornecedorResumo = Pick<Fornecedor, 'id' | 'razaoSocial' | 'cnpj' | 'tipos' | 'bloqueado'>;

/** Fornecedor como o detalhe da API devolve. Contatos, nome fantasia e acesso ao portal não existem na API. */
export type FornecedorCadastro = FornecedorResumo & Pick<Fornecedor, 'telefone' | 'email' | 'desde'> & { atualizadoEm: IsoDate };

/** Uma página de resultados. */
export type Pagina<T> = { itens: T[]; total: number; pagina: number; porPagina: number };
