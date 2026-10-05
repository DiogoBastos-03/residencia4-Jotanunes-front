import type { IsoDate } from './common';

export type StatusEnvio = 'aprovado' | 'emAnalise' | 'reprovado' | 'pendente';

/** Status exibido: o aprovado vira "vence em breve" ou "vencido" pela data. */
export type StatusDocumento = StatusEnvio | 'venceEmBreve' | 'vencido';

export type Prioridade = 'urgente' | 'normal';

export type MotivoReprovacao = 'ilegivel' | 'foraValidade' | 'incorreto' | 'faltaAssinatura';

/** Quem decidiu, quando e por quê — mostrado no modo leitura da análise. */
export type DecisaoRegistrada = {
  por: string;
  em: IsoDate;
  motivo?: MotivoReprovacao;
  observacao?: string;
};

export type EnvioAnterior = {
  arquivo: string;
  enviadoEm: IsoDate;
  resultado: 'aprovado' | 'reprovado';
};

/** Versão nova enviada enquanto a atual continua valendo (renovação). */
export type Renovacao = {
  arquivo: string;
  tamanhoKb: number;
  enviadoEm: IsoDate;
  prioridade: Prioridade;
  paginas?: number;
  /** Validade que o fornecedor informou ao enviar. */
  validadeInformada?: IsoDate;
};

/**
 * Documento da empresa: enviado uma vez, vale para todas as obras que o exigem.
 * Há no máximo um por fornecedor e tipo de documento.
 */
export type DocumentoEmpresa = {
  id: string;
  fornecedorId: string;
  tipoDocumentoId: string;
  status: StatusEnvio;
  validade?: IsoDate;
  arquivo?: string;
  tamanhoKb?: number;
  enviadoEm?: IsoDate;
  /** Desde quando o item está em aberto (pendente ou reprovado). */
  pendenteDesde?: IsoDate;
  prioridade?: Prioridade;
  paginas?: number;
  /** Validade que o fornecedor informou ao enviar — a equipe confirma ou corrige na análise. */
  validadeInformada?: IsoDate;
  renovacao?: Renovacao;
  /** Última decisão sobre a versão em vigor. */
  decisao?: DecisaoRegistrada;
  enviosAnteriores: readonly EnvioAnterior[];
};
