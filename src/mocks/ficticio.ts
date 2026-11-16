import { documentosExigidos, type Dataset } from '@/entities';
import { montarArquivos } from './arquivos';
import { montarDocumentos } from './documentos';
import { listas, tiposDocumento } from './exigencias';
import { fornecedores, vinculos } from './fornecedores';
import { analises, montarEventos, temposAnalise } from './historico';
import { obraListas, obras } from './obras';
import { AGORA, HOJE } from './tempo';

/**
 * Conjunto fictício completo (41 fornecedores, 10 obras, documentos montados à mão).
 * A partir da Fase 2 as telas NÃO leem mais daqui: ele só alimenta o banco do MSW
 * (src/mocks/api/dados.ts), que serve fornecedores e obras pela rede quando VITE_API_MOCK=true.
 */
export function datasetFicticio(): Dataset {
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
