import { documentosExigidos, type Dataset } from '@/entities';
import { createStore } from '@/shared/lib';
import { montarDocumentos } from './documentos';
import { listas, tiposDocumento } from './exigencias';
import { fornecedores, vinculos } from './fornecedores';
import { funcionarios, remessas } from './funcionarios';
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
  remessas,
  funcionarios,
  analises,
  eventos: montarEventos(obras, obraListas, vinculos),
  temposAnalise,
};

/**
 * Conjunto completo de dados mockados. Os documentos são montados a partir do
 * que cada fornecedor deve, para que contagens e situações batam entre as telas.
 */
export const dataset: Dataset = {
  ...base,
  documentos: montarDocumentos(fornecedores, (id) => documentosExigidos(base, id)),
};

/** Dados vivos da sessão: as ações da interface alteram esta store. Some no F5. */
export const datasetStore = createStore<Dataset>(dataset);
export { exemplosFormulario, exemplosObra } from './exemplos';
