import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api';
import { pendenciasApi } from './api';

/** GET /pending-panel — não é paginado; o back calcula na hora (situação derivada, nunca gravada). */
export function usePainelPendencias() {
  return useQuery({ queryKey: queryKeys.pendencias.painel(), queryFn: ({ signal }) => pendenciasApi.painel(signal) });
}

// Postergar e cancelar postergação: só a camada de API (pendenciasApi.postergar / cancelarPostergacao),
// sem hook nem tela. As rotas pedem o id do envio mais recente do documento, e nenhuma rota da API
// devolve envios hoje (acervo dá 500, a fila de análise vem vazia, o painel não traz ids). Quando houver,
// a mutação entra aqui, invalidando queryKeys.pendencias.todos. Ver INTEGRACAO.md.
