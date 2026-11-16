export type { Obra, ObraLista, ObraResumo, SituacaoObra } from './model';
export { obraApi } from './api';
export type { DadosVinculo, FiltrosObras, ResultadoVinculo } from './mapper';
export * as obraSchemas from './schema';
export { useObrasApi, useObrasDoFornecedor, useVinculosApi, useVincularFornecedor, useDesvincularFornecedor, type VinculoApi } from './consultas';
