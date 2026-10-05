import { listasDaObra } from '@/entities';
import { datasetStore, exemploNovoFornecedor } from '@/mocks';
import { useStore } from '@/shared/lib';
import type { NovoFornecedor, ObraParaCadastro } from '../types';

/** Obras que ainda recebem fornecedores (não concluídas), com as listas de cada uma. */
export function useObrasParaCadastro(): ObraParaCadastro[] {
  const ds = useStore(datasetStore);
  return ds.obras.filter((o) => o.situacao !== 'concluida').map((obra) => ({ obra, listas: listasDaObra(ds, obra.id) }));
}

/** Exemplo que preenche o cadastro ao abrir. */
export function useExemploNovoFornecedor(): NovoFornecedor {
  const e = exemploNovoFornecedor;
  return { ...e, contato: { ...e.contato } };
}

export const NOVO_FORNECEDOR_VAZIO: NovoFornecedor = {
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  tipo: 'servico',
  contato: { nome: '', cargo: '', email: '', telefone: '' },
  enviarConvite: true,
  obraId: '',
  servicoContratado: '',
};
