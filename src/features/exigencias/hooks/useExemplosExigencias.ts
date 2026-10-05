import type { EscopoItem } from '@/entities';
import { datasetStore, exemploNovaLista, exemploNovoDocumento, exemploNovoDocumentoFuncionario, exemploVincularObras } from '@/mocks';
import { useStore } from '@/shared/lib';
import { itensDaLista, novoIdItem } from '../lib';
import type { ItemRascunho, NovaLista } from '../types';

/** Conteúdo de exemplo da Nova lista e dos drawers. "Limpar" mostra o estado vazio. */
export function useExemplosExigencias() {
  const ds = useStore(datasetStore);
  const origem = ds.listas.find((l) => l.id === exemploNovaLista.itensDe);
  const novaLista: NovaLista = {
    nome: exemploNovaLista.nome,
    situacao: exemploNovaLista.situacao,
    tipo: exemploNovaLista.tipo,
    descricao: exemploNovaLista.descricao,
    itens: origem ? itensDaLista(ds, origem).map((i) => ({ ...i, id: novoIdItem('nl') })) : [],
    obraIds: [...exemploNovaLista.obraIds],
    prazoEnvioDias: exemploNovaLista.prazoEnvioDias,
    lembretesDias: [...exemploNovaLista.lembretesDias],
  };
  const novoDocumento = (escopo: EscopoItem): ItemRascunho => ({
    id: novoIdItem('doc'),
    escopo,
    ...(escopo === 'empresa' ? exemploNovoDocumento : exemploNovoDocumentoFuncionario),
  });
  return { novaLista, novoDocumento, obrasParaVincular: exemploVincularObras };
}

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
