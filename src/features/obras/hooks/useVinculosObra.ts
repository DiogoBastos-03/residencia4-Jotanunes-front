import { useCallback } from 'react';
import { datasetStore } from '@/mocks';
import { strings } from '@/shared/strings';
import type { NovoVinculo } from '../types';

const VOCE = strings.dominio.usuarioAtual;

/** Vínculos da obra com fornecedores e listas. Alteram os dados em memória. */
export function useVinculosObra() {
  const vincularFornecedor = useCallback((novo: NovoVinculo) => {
    datasetStore.set((ds) => ({
      ...ds,
      vinculos: [...ds.vinculos, { ...novo, vinculadoEm: ds.agora }],
      eventos: [
        {
          id: `ev-vinculo-${novo.fornecedorId}-${novo.obraId}-${ds.eventos.length}`,
          quando: ds.agora,
          autor: { kind: 'pessoa' as const, nome: VOCE },
          acao: { tipo: 'fornecedorVinculado' as const, fornecedorId: novo.fornecedorId, obraId: novo.obraId },
          obraId: novo.obraId,
          fornecedorId: novo.fornecedorId,
        },
        ...ds.eventos,
      ],
    }));
  }, []);

  const vincularListas = useCallback((obraId: string, listaIds: readonly string[]) => {
    if (listaIds.length === 0) return;
    datasetStore.set((ds) => ({
      ...ds,
      obraListas: [...ds.obraListas, ...listaIds.map((listaId) => ({ obraId, listaId, vinculadaEm: ds.agora }))],
      eventos: [
        {
          id: `ev-listas-${obraId}-${ds.eventos.length}`,
          quando: ds.agora,
          autor: { kind: 'pessoa' as const, nome: VOCE },
          acao: { tipo: 'listasVinculadas' as const, listaIds, obraId },
          obraId,
        },
        ...ds.eventos,
      ],
    }));
  }, []);

  /** Toda obra precisa de pelo menos uma lista: a última não sai. */
  const desvincularLista = useCallback((obraId: string, listaId: string) => {
    datasetStore.set((ds) => {
      if (ds.obraListas.filter((ol) => ol.obraId === obraId).length <= 1) return ds;
      return {
        ...ds,
        obraListas: ds.obraListas.filter((ol) => !(ol.obraId === obraId && ol.listaId === listaId)),
        eventos: [
          {
            id: `ev-desvinculo-${obraId}-${listaId}-${ds.eventos.length}`,
            quando: ds.agora,
            autor: { kind: 'pessoa' as const, nome: VOCE },
            acao: { tipo: 'listaDesvinculada' as const, listaId, obraId },
            obraId,
          },
          ...ds.eventos,
        ],
      };
    });
  }, []);

  return { vincularFornecedor, vincularListas, desvincularLista };
}
