import type { EntradaFila } from '@/entities';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';

/** Endereço de análise de um item da fila. */
export function rotaDaEntrada(entrada: EntradaFila): string {
  return entrada.kind === 'remessa' ? paths.remessa(entrada.id) : paths.analise(entrada.id);
}

/** Nome do item: o documento, ou "Remessa com N funcionários". */
export function nomeDaEntrada(entrada: EntradaFila): string {
  return entrada.kind === 'remessa' ? strings.dominio.remessa(entrada.funcionarios) : entrada.documentoNome;
}

export type FiltrosFila = {
  tipo: 'todos' | 'documentos' | 'funcionarios' | 'urgentes';
  obraId: string;
  busca: string;
};

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Aplica tipo, obra e busca (fornecedor, obra ou documento, sem acento). */
export function filtrarFila(entradas: readonly EntradaFila[], filtros: FiltrosFila): EntradaFila[] {
  const termo = normalizar(filtros.busca.trim());
  return entradas.filter((e) => {
    if (filtros.tipo === 'documentos' && e.kind !== 'documento') return false;
    if (filtros.tipo === 'funcionarios' && e.kind !== 'remessa') return false;
    if (filtros.tipo === 'urgentes' && e.prioridade !== 'urgente') return false;
    if (filtros.obraId && e.obraPrincipal.id !== filtros.obraId) return false;
    if (!termo) return true;
    return [e.fornecedor.razaoSocial, e.obraPrincipal.nome, nomeDaEntrada(e), e.lista.nome].some((campo) =>
      normalizar(campo).includes(termo),
    );
  });
}
