import type { MotivoReprovacao } from '@/entities';

/**
 * Valores iniciais do formulário de reprovação (tela fora de uso até a Fase 3).
 * Sem exemplo inventado: começa com o primeiro motivo e sem observação.
 */
export function useExemploReprovacao(): { motivo: MotivoReprovacao; observacao: string } {
  return { motivo: 'ilegivel', observacao: '' };
}
