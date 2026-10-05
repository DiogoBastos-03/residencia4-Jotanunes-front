import type { IsoDate } from '../common';
import type { DocumentoEmpresa, StatusDocumento, StatusEnvio } from '../documento';
import { diasEntre, JANELA_VENCIMENTO_DIAS } from './dates';

/** Converte o status do envio no status exibido, considerando a validade. */
export function statusPorValidade(status: StatusEnvio, validade: IsoDate | undefined, hoje: IsoDate): StatusDocumento {
  if (status !== 'aprovado' || !validade) return status;
  const restantes = diasEntre(hoje, validade);
  if (restantes < 0) return 'vencido';
  if (restantes <= JANELA_VENCIMENTO_DIAS) return 'venceEmBreve';
  return 'aprovado';
}

export function statusDocumento(doc: DocumentoEmpresa | undefined, hoje: IsoDate): StatusDocumento {
  if (!doc) return 'pendente';
  return statusPorValidade(doc.status, doc.validade, hoje);
}

/** Conta como "em dia" para a regra de fornecedor apto. */
export function estaEmDia(status: StatusDocumento): boolean {
  return status === 'aprovado' || status === 'venceEmBreve';
}

/** Conta como pendência: o que falta enviar, o que foi reprovado e o que venceu. */
export function ehPendencia(status: StatusDocumento): status is 'pendente' | 'reprovado' | 'vencido' {
  return status === 'pendente' || status === 'reprovado' || status === 'vencido';
}
