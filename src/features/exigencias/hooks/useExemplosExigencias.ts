import type { EscopoItem } from '@/entities';
import { novoIdItem } from '../lib';
import type { ItemRascunho, NovaLista } from '../types';

export const NOVA_LISTA_VAZIA: NovaLista = {
  nome: '',
  situacao: 'ativo',
  tipo: 'servico',
  descricao: '',
  itens: [],
  obraIds: [],
  prazoEnvioDias: 30,
  lembretesDias: [15, 7, 2],
};

/**
 * Valores iniciais da Nova lista e dos drawers (telas fora de uso até haver endpoint de listas).
 * Sem exemplo inventado: tudo começa vazio.
 */
export function useExemplosExigencias() {
  const novoDocumento = (escopo: EscopoItem): ItemRascunho => ({
    id: novoIdItem('doc'),
    escopo,
    nome: '',
    obrigatoriedade: 'obrigatorio',
    validade: 'comData',
    formatos: 'pdfImagem',
  });
  return { novaLista: NOVA_LISTA_VAZIA, novoDocumento, obrasParaVincular: [] satisfies string[] };
}
