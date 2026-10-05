/** De onde a análise foi aberta. Ela volta para lá e percorre os documentos de lá. */
export type Origem = { tipo: 'fila' } | { tipo: 'fornecedor'; id: string; aba?: string } | { tipo: 'obra'; id: string; aba?: string };

export const PARAM_ORIGEM = 'de';

export function serializarOrigem(origem: Origem): string {
  if (origem.tipo === 'fila') return 'fila';
  return [origem.tipo, origem.id, origem.aba].filter(Boolean).join(':');
}

export function lerOrigem(valor: string | null): Origem {
  if (!valor) return { tipo: 'fila' };
  const [tipo, id, aba] = valor.split(':');
  if ((tipo === 'fornecedor' || tipo === 'obra') && id) return aba ? { tipo, id, aba } : { tipo, id };
  return { tipo: 'fila' };
}
