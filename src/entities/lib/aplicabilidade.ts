import type { Obrigatoriedade } from '../common';
import type { Dataset } from '../dataset';
import type { EscopoItem, ItemExigido, ListaExigencias } from '../listaExigencias';
import { forneceTipo } from '../fornecedor/model';
import type { Obra } from '../obra';

export function listasDaObra(ds: Dataset, obraId: string): ListaExigencias[] {
  const ids = ds.obraListas.filter((ol) => ol.obraId === obraId).map((ol) => ol.listaId);
  return ds.listas.filter((l) => ids.includes(l.id));
}

export function obrasDaLista(ds: Dataset, listaId: string): Obra[] {
  const ids = ds.obraListas.filter((ol) => ol.listaId === listaId).map((ol) => ol.obraId);
  return ds.obras.filter((o) => ids.includes(o.id));
}

export function obrasDoFornecedor(ds: Dataset, fornecedorId: string): Obra[] {
  const ids = ds.vinculos.filter((v) => v.fornecedorId === fornecedorId).map((v) => v.obraId);
  return ds.obras.filter((o) => ids.includes(o.id));
}

export function fornecedoresDaObra(ds: Dataset, obraId: string) {
  const ids = ds.vinculos.filter((v) => v.obraId === obraId).map((v) => v.fornecedorId);
  return ds.fornecedores.filter((f) => ids.includes(f.id));
}

/** Listas da obra que valem para o fornecedor: as de um tipo que ele fornece. */
export function listasAplicaveisNaObra(ds: Dataset, fornecedorId: string, obraId: string): ListaExigencias[] {
  const fornecedor = ds.fornecedores.find((f) => f.id === fornecedorId);
  if (!fornecedor) return [];
  return listasDaObra(ds, obraId).filter((l) => forneceTipo(fornecedor, l.tipo));
}

/** Listas de outro tipo, exigidas em obras do fornecedor — simplesmente ignoradas. */
export function listasIgnoradas(ds: Dataset, fornecedorId: string): Array<{ lista: ListaExigencias; obras: Obra[] }> {
  const fornecedor = ds.fornecedores.find((f) => f.id === fornecedorId);
  if (!fornecedor) return [];
  const mapa = new Map<string, { lista: ListaExigencias; obras: Obra[] }>();
  for (const obra of obrasDoFornecedor(ds, fornecedorId)) {
    for (const lista of listasDaObra(ds, obra.id)) {
      if (forneceTipo(fornecedor, lista.tipo)) continue;
      const atual = mapa.get(lista.id) ?? { lista, obras: [] };
      atual.obras.push(obra);
      mapa.set(lista.id, atual);
    }
  }
  return [...mapa.values()];
}

export type ListaAplicavel = { lista: ListaExigencias; obras: Obra[] };

/** Listas aplicáveis ao fornecedor, com as obras em que cada uma vale para ele. */
export function listasAplicaveis(ds: Dataset, fornecedorId: string): ListaAplicavel[] {
  const mapa = new Map<string, ListaAplicavel>();
  for (const obra of obrasDoFornecedor(ds, fornecedorId)) {
    for (const lista of listasAplicaveisNaObra(ds, fornecedorId, obra.id)) {
      const atual = mapa.get(lista.id) ?? { lista, obras: [] };
      atual.obras.push(obra);
      mapa.set(lista.id, atual);
    }
  }
  return ds.listas.filter((l) => mapa.has(l.id)).flatMap((l) => {
    const item = mapa.get(l.id);
    return item ? [item] : [];
  });
}

export type DocumentoExigido = {
  tipoDocumentoId: string;
  nome: string;
  escopo: EscopoItem;
  obrigatoriedade: Obrigatoriedade;
  item: ItemExigido;
  /** Listas que exigem este documento do fornecedor. */
  listas: ListaExigencias[];
  /** Obras em que o documento é exigido do fornecedor. */
  obras: Obra[];
};

/** Itens exigidos do fornecedor — um por tipo de documento, valendo para todas as obras. */
export function documentosExigidos(ds: Dataset, fornecedorId: string): DocumentoExigido[] {
  const mapa = new Map<string, DocumentoExigido>();
  for (const { lista, obras } of listasAplicaveis(ds, fornecedorId)) {
    for (const item of lista.itens) {
      const nome = ds.tiposDocumento.find((t) => t.id === item.tipoDocumentoId)?.nome ?? item.tipoDocumentoId;
      const atual = mapa.get(item.tipoDocumentoId);
      if (!atual) {
        mapa.set(item.tipoDocumentoId, {
          tipoDocumentoId: item.tipoDocumentoId,
          nome,
          escopo: item.escopo,
          obrigatoriedade: item.obrigatoriedade,
          item,
          listas: [lista],
          obras: [...obras],
        });
        continue;
      }
      atual.listas.push(lista);
      if (item.obrigatoriedade === 'obrigatorio') atual.obrigatoriedade = 'obrigatorio';
      for (const obra of obras) if (!atual.obras.includes(obra)) atual.obras.push(obra);
    }
  }
  return [...mapa.values()];
}

export function nomeDoTipoDocumento(ds: Dataset, tipoDocumentoId: string): string {
  return ds.tiposDocumento.find((t) => t.id === tipoDocumentoId)?.nome ?? tipoDocumentoId;
}
