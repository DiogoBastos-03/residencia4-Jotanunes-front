import { paraDataSimples } from '../lib/datasApi';
import type { LinhaPendencias, Postergacao } from './model';
import type { PendingPanelRow, PostponeRequest } from './schema';

export function linhaDaApi(r: PendingPanelRow): LinhaPendencias {
  return {
    fornecedorId: r.enterpriseId,
    fornecedorNome: r.enterpriseName,
    pendentes: r.pendingCount,
    aVencer: r.upcomingCount,
    vencidas: r.expiredCount,
    postergadas: r.postponedCount,
  };
}

/** `deadlineAt` é só data: nunca mandar hora nem fuso. */
export function postergacaoParaApi(p: Postergacao): PostponeRequest {
  return { deadlineAt: paraDataSimples(p.prazo), reason: p.motivo.trim() };
}
