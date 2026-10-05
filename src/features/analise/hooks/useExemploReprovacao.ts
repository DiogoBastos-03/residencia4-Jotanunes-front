import type { MotivoReprovacao } from '@/entities';
import { exemplosFormulario } from '@/mocks';

/** Motivo e observação de exemplo que preenchem o formulário de reprovação. */
export function useExemploReprovacao(): { motivo: MotivoReprovacao; observacao: string } {
  return exemplosFormulario.reprovacao;
}
