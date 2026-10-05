import { useCallback } from 'react';
import type { ItemExigido, TipoDocumento } from '@/entities';
import { datasetStore } from '@/mocks';
import { strings } from '@/shared/strings';
import { deRascunho } from '../lib';
import type { ItemRascunho, NovaLista } from '../types';

const VOCE = strings.dominio.usuarioAtual;

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Ações sobre listas de exigências. Alteram os dados em memória; todas as telas recalculam. */
export function useAcoesLista() {
  /** Adiciona o item, ou substitui o de mesmo id. */
  const salvarItem = useCallback((listaId: string, rascunho: ItemRascunho) => {
    datasetStore.set((ds) => {
      const { item, tipos } = deRascunho(ds, rascunho);
      return {
        ...ds,
        tiposDocumento: tipos,
        listas: ds.listas.map((l) => {
          if (l.id !== listaId) return l;
          const existe = l.itens.some((i) => i.id === item.id);
          return { ...l, itens: existe ? l.itens.map((i) => (i.id === item.id ? item : i)) : [...l.itens, item] };
        }),
      };
    });
  }, []);

  const vincularObras = useCallback((listaId: string, obraIds: readonly string[]) => {
    if (obraIds.length === 0) return;
    datasetStore.set((ds) => ({
      ...ds,
      obraListas: [...ds.obraListas, ...obraIds.map((obraId) => ({ obraId, listaId, vinculadaEm: ds.agora }))],
      eventos: [
        ...obraIds.map((obraId, i) => ({
          id: `ev-lista-obra-${listaId}-${obraId}-${ds.eventos.length + i}`,
          quando: ds.agora,
          autor: { kind: 'pessoa' as const, nome: VOCE },
          acao: { tipo: 'listasVinculadas' as const, listaIds: [listaId], obraId },
          obraId,
        })),
        ...ds.eventos,
      ],
    }));
  }, []);

  /** Toda obra precisa de pelo menos uma lista: a última não sai. */
  const removerDaObra = useCallback((listaId: string, obraId: string) => {
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

  /** Cria a lista e a vincula às obras escolhidas. Devolve o id. */
  const criarLista = useCallback((nova: NovaLista): string => {
    let id = slug(nova.nome) || 'lista';
    datasetStore.set((ds) => {
      const base = id;
      let n = 2;
      while (ds.listas.some((l) => l.id === id)) id = `${base}-${n++}`;
      let tipos: readonly TipoDocumento[] = ds.tiposDocumento;
      const itens: ItemExigido[] = nova.itens.map((rascunho) => {
        const r = deRascunho({ ...ds, tiposDocumento: tipos }, rascunho);
        tipos = r.tipos;
        return r.item;
      });
      return {
        ...ds,
        tiposDocumento: tipos,
        listas: [
          ...ds.listas,
          {
            id,
            nome: nova.nome.trim(),
            tipo: nova.tipo,
            descricao: nova.descricao.trim(),
            situacao: nova.situacao,
            itens,
            prazoEnvioDias: nova.prazoEnvioDias,
            lembretesDias: nova.lembretesDias,
          },
        ],
        obraListas: [...ds.obraListas, ...nova.obraIds.map((obraId) => ({ obraId, listaId: id, vinculadaEm: ds.agora }))],
      };
    });
    return id;
  }, []);

  return { salvarItem, vincularObras, removerDaObra, criarLista };
}
