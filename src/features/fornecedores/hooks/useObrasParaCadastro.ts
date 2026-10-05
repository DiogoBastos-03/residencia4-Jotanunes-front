import { listasDaObra } from '@/entities';
import { datasetStore, exemploNovoFornecedor } from '@/mocks';
import { useStore, USAR_API } from '@/shared/lib';
import type { NovoFornecedor, ObraParaCadastro } from '../types';

/**
 * Obras que ainda recebem fornecedores (não concluídas), com as listas de cada uma.
 * Com a API não há como criar o vínculo: a lista vem vazia e o bloco fica desabilitado.
 */
export function useObrasParaCadastro(): { obras: ObraParaCadastro[]; podeVincular: boolean } {
  const ds = useStore(datasetStore);
  if (USAR_API) return { obras: [], podeVincular: false };
  return { obras: ds.obras.filter((o) => o.situacao !== 'concluida').map((obra) => ({ obra, listas: listasDaObra(ds, obra.id) })), podeVincular: true };
}

/** Exemplo que preenche o cadastro ao abrir. Com a API, sem obra (não dá para vincular). */
export function useExemploNovoFornecedor(): NovoFornecedor {
  const e = exemploNovoFornecedor;
  return { ...e, tipos: [...e.tipos], obraId: USAR_API ? '' : e.obraId, servicoContratado: USAR_API ? '' : e.servicoContratado };
}

export const NOVO_FORNECEDOR_VAZIO: NovoFornecedor = {
  cnpj: '',
  razaoSocial: '',
  telefone: '',
  email: '',
  tipos: [],
  obraId: '',
  servicoContratado: '',
};
