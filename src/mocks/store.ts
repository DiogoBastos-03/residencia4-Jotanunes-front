import { documentosExigidos, hojeLocal, type Dataset } from '@/entities';
import { createStore, USAR_API } from '@/shared/lib';
import { montarDocumentos } from './documentos';
import { listas, tiposDocumento } from './exigencias';
import { fornecedores, vinculos } from './fornecedores';
import { montarArquivos } from './arquivos';
import { analises, montarEventos, temposAnalise } from './historico';
import { obraListas, obras } from './obras';
import { AGORA, HOJE } from './tempo';

/**
 * Demonstração completa (VITE_USE_API=false): fornecedores e obras fictícios.
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

/**
 * Com a API (VITE_USE_API=true): começa só com o que não depende de fornecedor nem de obra
 * (listas de exigências, tipos de documento, tempos de análise). Fornecedores, obras e
 * vínculos chegam na hidratação (./hidratacao.ts); o resto é gerado sobre eles (./gerar.ts).
 * "Hoje" é o do navegador, para as validades geradas fazerem sentido.
 */
function datasetVazioApi(): Dataset {
  return {
    ...hojeLocal(),
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
  };
}

/** Dados vivos da sessão: as ações da interface alteram esta store. Some no F5. */
export const datasetStore = createStore<Dataset>(USAR_API ? datasetVazioApi() : datasetDemonstracao());
