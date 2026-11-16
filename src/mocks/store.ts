import type { Dataset } from '@/entities';
import { createStore } from '@/shared/lib';
import { listas, tiposDocumento } from './exigencias';
import { temposAnalise } from './historico';
import { relogioDoDia } from './tempo';

/**
 * Dados vivos da sessão. Começa só com o que não depende de fornecedor nem de obra
 * (listas de exigências, tipos de documento, tempos de análise). Fornecedores, obras e
 * vínculos chegam da API (src/app/SincronizarDemonstracao.tsx); documentos, envios,
 * análises e histórico são gerados sobre eles (./gerar.ts). As ações de demonstração
 * (análise, listas, contatos) alteram esta store e somem no F5.
 */
export const datasetStore = createStore<Dataset>({
  ...relogioDoDia(),
  obras: [],
  obraListas: [],
  listas,
  tiposDocumento,
  fornecedores: [],
  vinculos: [],
  documentos: [],
  envios: [],
  arquivos: [],
  analises: [],
  eventos: [],
  temposAnalise,
});

/** Situação da carga da base (fornecedores, obras e vínculos da API), lida por useDatasetQuery. */
export type EstadoBase =
  | { status: 'carregando' }
  | { status: 'erro'; erro: Error; tentarDeNovo: () => void }
  | { status: 'pronto'; parcial: boolean };

export const estadoBaseStore = createStore<EstadoBase>({ status: 'carregando' });
