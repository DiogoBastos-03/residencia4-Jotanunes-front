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
  /** Não existe na API: vem vazio para fornecedores do banco. */
  nomeFantasia?: string;
  /** Não existe na API (não há endpoint de convite): ausente para fornecedores do banco. */
  acessoPortal?: AcessoPortal;
  /** Só dígitos. Formate com formatCnpj. */
  cnpj: string;
  /** Um ou dois tipos, sem repetição — a empresa pode fornecer material e serviço. */
  tipos: readonly TipoFornecimento[];
  /** Telefone da empresa, só dígitos (10 ou 11). Formate com formatPhone. */
  telefone: string;
  email: string;
  desde: IsoDate;
  bloqueado: boolean;
  /** Não existe na API: lista vazia para fornecedores do banco. */
  contatos: readonly Contato[];
};

/**
 * Fornecedor numa obra. Na API o vínculo só tem as duas pontas: serviço, período
 * e data do vínculo existem só nos dados de demonstração.
 */
export type VinculoObra = {
  fornecedorId: string;
  obraId: string;
  servicoContratado?: string;
  inicio?: IsoDate;
  fim?: IsoDate;
  vinculadoEm?: IsoDate;
};

export type SituacaoFornecedor = 'apto' | 'comPendencia' | 'bloqueado';

/** Convidado e ainda sem entrar no portal. Sem acesso registrado (fornecedor da API), não está aguardando. */
export function aguardandoAcesso(fornecedor: Pick<Fornecedor, 'acessoPortal'>): boolean {
  return fornecedor.acessoPortal !== undefined && !fornecedor.acessoPortal.acessouEm;
}

/** A lista (ou o filtro) de um tipo vale para o fornecedor que fornece aquele tipo. */
export function forneceTipo(fornecedor: Pick<Fornecedor, 'tipos'>, tipo: TipoFornecimento): boolean {
  return fornecedor.tipos.includes(tipo);
}
