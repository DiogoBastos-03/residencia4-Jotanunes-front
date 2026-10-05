import { useMemo } from 'react';
import {
  arquivosDoItem,
  documentosExigidos,
  listasAplicaveis,
  montarFila,
  pendenciasDaObra,
  type Dataset,
} from '@/entities';
import { datasetStore } from '@/mocks';
import { useStore, type Origem } from '@/shared/lib';
import type { Alvo } from '../lib';
import type { Sequencia } from '../types';

/** Documentos do fornecedor na ordem da ficha: por lista de exigências, empresa e depois funcionário. */
function alvosDoFornecedor(ds: Dataset, fornecedorId: string): Alvo[] {
  const exigidos = documentosExigidos(ds, fornecedorId);
  const vistos = new Set<string>();
  const alvos: Alvo[] = [];
  for (const { lista } of listasAplicaveis(ds, fornecedorId)) {
    const itens = [...lista.itens].sort((a, b) => (a.escopo === b.escopo ? 0 : a.escopo === 'empresa' ? -1 : 1));
    for (const item of itens) {
      if (vistos.has(item.tipoDocumentoId) || !exigidos.some((e) => e.tipoDocumentoId === item.tipoDocumentoId)) continue;
      vistos.add(item.tipoDocumentoId);
      if (item.escopo === 'empresa') {
        const doc = ds.documentos.find((d) => d.fornecedorId === fornecedorId && d.tipoDocumentoId === item.tipoDocumentoId);
        if (doc) alvos.push({ kind: 'documento', id: doc.id, pendente: doc.status === 'emAnalise' || Boolean(doc.renovacao) });
        continue;
      }
      const { arquivos, envios } = arquivosDoItem(ds, fornecedorId, item.tipoDocumentoId);
      const comAnalise = envios.find((e) => arquivos.some((a) => a.envioId === e.id && a.status === 'emAnalise'));
      const envio = comAnalise ?? envios[0];
      if (envio) alvos.push({ kind: 'envio', id: envio.id, pendente: Boolean(comAnalise) });
    }
  }
  return alvos;
}

/** Pendências da obra que têm algo para abrir (documento reprovado ou vencido, arquivos enviados). */
function alvosDaObra(ds: Dataset, obraId: string): Alvo[] {
  return pendenciasDaObra(ds, obraId).flatMap((g) =>
    g.pendencias.flatMap((p): Alvo[] => {
      if (p.kind === 'empresa') return p.documentoId ? [{ kind: 'documento', id: p.documentoId, pendente: false }] : [];
      return p.envioId ? [{ kind: 'envio', id: p.envioId, pendente: ds.arquivos.some((a) => a.envioId === p.envioId && a.status === 'emAnalise') }] : [];
    }),
  );
}

export function montarSequencia(ds: Dataset, origem: Origem, atualId: string): Sequencia {
  const alvos: Alvo[] =
    origem.tipo === 'fila'
      ? montarFila(ds).map((e) => ({ kind: e.kind, id: e.id, pendente: true }))
      : origem.tipo === 'fornecedor'
        ? alvosDoFornecedor(ds, origem.id)
        : alvosDaObra(ds, origem.id);
  // Fora da sequência (ex.: já saiu da fila), "próximo" leva ao primeiro da origem.
  const indice = alvos.findIndex((a) => a.id === atualId);
  return {
    alvos,
    indice,
    anterior: indice > 0 ? alvos[indice - 1] : undefined,
    proximo: indice >= 0 ? alvos[indice + 1] : alvos[0],
    origemNome:
      origem.tipo === 'fornecedor'
        ? ds.fornecedores.find((f) => f.id === origem.id)?.razaoSocial
        : origem.tipo === 'obra'
          ? ds.obras.find((o) => o.id === origem.id)?.nome
          : undefined,
  };
}

/** Sequência de documentos da origem, para "3 de 7", anterior e próximo. */
export function useSequencia(origem: Origem, atualId: string): Sequencia {
  const ds = useStore(datasetStore);
  return useMemo(() => montarSequencia(ds, origem, atualId), [ds, origem, atualId]);
}

/** Lê a sequência no momento da decisão (antes de ela mudar). */
export function sequenciaAgora(origem: Origem, atualId: string): Sequencia {
  return montarSequencia(datasetStore.get(), origem, atualId);
}
