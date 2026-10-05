import type { IsoDate } from './common';
import type { DecisaoRegistrada, Prioridade, StatusEnvio } from './documento';

/** Um envio do fornecedor para um item de documento de funcionário: vários arquivos de uma vez. */
export type EnvioArquivos = {
  id: string;
  fornecedorId: string;
  tipoDocumentoId: string;
  enviadoEm: IsoDate;
  prioridade: Prioridade;
};

/** Cada arquivo é analisado sozinho e tem a sua própria validade. Identifica-se pelo nome. */
export type ArquivoFuncionario = {
  id: string;
  envioId: string;
  fornecedorId: string;
  tipoDocumentoId: string;
  nome: string;
  tamanhoKb: number;
  status: Exclude<StatusEnvio, 'pendente'>;
  /** Validade que o fornecedor informou ao enviar. */
  validadeInformada?: IsoDate;
  /** Validade confirmada na aprovação. */
  validade?: IsoDate;
  decisao?: DecisaoRegistrada;
};
