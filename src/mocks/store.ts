import { documentosExigidos, type Dataset } from '@/entities';
import { createStore } from '@/shared/lib';
import { montarDocumentos } from './documentos';
import { listas, tiposDocumento } from './exigencias';
import { fornecedores, vinculos } from './fornecedores';
import { montarArquivos } from './arquivos';
import { analises, montarEventos, temposAnalise } from './historico';
import { obraListas, obras } from './obras';
import { AGORA, HOJE } from './tempo';

/**
 * Conjunto único de dados de demonstração: fornecedores e obras fictícios.
 * Os documentos são montados a partir do que cada fornecedor deve, para que contagens
 * e situações batam entre as telas.
 */
function datasetDemonstracao(): Dataset {
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
  const exigidosDe = (id: string) => documentosExigidos(base, id);
  return { ...base, documentos: montarDocumentos(fornecedores, exigidosDe), ...montarArquivos(fornecedores, exigidosDe) };
}

/** Dados vivos da sessão: as ações da interface alteram esta store. Some no F5. */
export const datasetStore = createStore<Dataset>(datasetDemonstracao());
