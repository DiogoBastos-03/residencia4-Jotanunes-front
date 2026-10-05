import { montarFila, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { Fila } from '../types';

const VAZIA: Fila = {
  entradas: [],
  contagem: { todos: 0, empresa: 0, funcionario: 0, urgentes: 0 },
  atrasadas: 0,
};

export function carregarFila(ds: Dataset): Fila {
  const entradas = montarFila(ds);
  return {
    entradas,
    contagem: {
      todos: entradas.length,
      empresa: entradas.filter((e) => e.kind === 'documento').length,
      funcionario: entradas.filter((e) => e.kind === 'envio').length,
      urgentes: entradas.filter((e) => e.prioridade === 'urgente').length,
    },
    atrasadas: entradas.filter((e) => e.esperaDias > 2).length,
  };
}

/** Fila de análise: documentos, renovações e envios de documento de funcionário esperando decisão. */
export function useFila() {
  const ds = useStore(datasetStore);
  return useMockQuery('fila', () => carregarFila(ds), { version: ds, empty: VAZIA });
}
