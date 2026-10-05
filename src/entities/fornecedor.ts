import type { IsoDate, TipoFornecimento } from './common';

export type Contato = {
  papel: 'principal' | 'seguranca';
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
};

export type Fornecedor = {
  id: string;
  razaoSocial: string;
  /** Só dígitos. Formate com formatCnpj. */
  cnpj: string;
  tipo: TipoFornecimento;
  email: string;
  desde: IsoDate;
  bloqueado: boolean;
  contatos: readonly Contato[];
};

/** Fornecedor em uma obra — a obra é o que liga fornecedor e lista de exigências. */
export type VinculoObra = {
  fornecedorId: string;
  obraId: string;
  servicoContratado: string;
  inicio: IsoDate;
  fim: IsoDate;
  vinculadoEm: IsoDate;
  /** Funcionários em campo acompanhados nesta obra. */
  funcionariosEmCampo: number;
};

/** Situação calculada: apto tem todos os obrigatórios aprovados e dentro da validade. */
export type SituacaoFornecedor = 'apto' | 'comPendencia' | 'bloqueado';
