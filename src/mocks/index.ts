import { documentosExigidos, type Dataset } from '@/entities';
import { createStore } from '@/shared/lib';
import { montarDocumentos } from './documentos';
import { listas, tiposDocumento } from './exigencias';
import { fornecedores, vinculos } from './fornecedores';
import { montarArquivos } from './arquivos';
import { analises, montarEventos, temposAnalise } from './historico';
import { obraListas, obras } from './obras';
import { AGORA, HOJE } from './tempo';

const base: Dataset = {
  hoje: HOJE,
  agora: AGORA,
  obras,
  obraListas,
  listas,
  tiposDocumento,
  fornecedores,
  vinculos,
  documentos: [],
  envios: [],
  arquivos: [],
  analises,
  eventos: montarEventos(obras, obraListas, vinculos),
  temposAnalise,
};

/**
 * Conjunto completo de dados mockados. Os documentos são montados a partir do
 * que cada fornecedor deve, para que contagens e situações batam entre as telas.
 */
const exigidosDe = (id: string) => documentosExigidos(base, id);

export const dataset: Dataset = {
  ...base,
  documentos: montarDocumentos(fornecedores, exigidosDe),
  ...montarArquivos(fornecedores, exigidosDe),
};

/** Dados vivos da sessão: as ações da interface alteram esta store. Some no F5. */
export const datasetStore = createStore<Dataset>(dataset);
export {
  exemplosFormulario,
  exemplosObra,
  exemploNovoFornecedor,
  exemploNovaLista,
  exemploNovoDocumento,
  exemploNovoDocumentoFuncionario,
  exemploVincularObras,
} from './exemplos';
