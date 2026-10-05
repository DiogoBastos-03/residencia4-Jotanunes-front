import type { IsoDate } from './common';
import type { StatusEnvio } from './documento';

export type DocumentoFuncionario = {
  documentoExigidoId: string;
  arquivo?: string;
  status: StatusEnvio;
  validade?: IsoDate;
};

export type Funcionario = {
  id: string;
  fornecedorId: string;
  obraId: string;
  remessaId: string;
  nome: string;
  /** Só dígitos. */
  cpf: string;
  telefone: string;
  funcao: string;
  status: StatusEnvio;
  documentos: readonly DocumentoFuncionario[];
};

/** Remessa: o fornecedor envia várias pessoas de uma vez para um item de funcionários. */
export type Remessa = {
  id: string;
  fornecedorId: string;
  obraId: string;
  listaId: string;
  itemId: string;
  enviadaEm: IsoDate;
  situacao: 'emAnalise' | 'concluida';
  prioridade: 'urgente' | 'normal';
};
