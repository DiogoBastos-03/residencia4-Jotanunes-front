import type { Dataset, ItemExigido, ListaExigencias } from '@/entities';
import type { ItemRascunho } from './types';

/** Item da lista → rascunho (com o nome do documento por extenso). */
export function paraRascunho(ds: Dataset, item: ItemExigido): ItemRascunho {
  const nome = ds.tiposDocumento.find((t) => t.id === item.tipoDocumentoId)?.nome ?? item.tipoDocumentoId;
  const { tipoDocumentoId: _id, ...resto } = item;
  return { ...resto, nome };
}

export function itensDaLista(ds: Dataset, lista: ListaExigencias): ItemRascunho[] {
  return lista.itens.map((item) => paraRascunho(ds, item));
}

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Rascunho → item da lista, registrando o documento no catálogo se for novo. */
export function deRascunho(ds: Dataset, item: ItemRascunho): { item: ItemExigido; tipos: Dataset['tiposDocumento'] } {
  const existente = ds.tiposDocumento.find((t) => t.nome.toLowerCase() === item.nome.trim().toLowerCase());
  const tipoId = existente?.id ?? `doc-${slug(item.nome)}`;
  const tipos = existente ? ds.tiposDocumento : [...ds.tiposDocumento, { id: tipoId, nome: item.nome.trim() }];
  const { nome: _nome, ...resto } = item;
  return { item: { ...resto, tipoDocumentoId: tipoId }, tipos };
}

let contador = 0;
/** Id para um item recém-criado na interface. */
export function novoIdItem(prefixo: string): string {
  contador += 1;
  return `${prefixo}-novo-${Date.now().toString(36)}-${contador}`;
}
