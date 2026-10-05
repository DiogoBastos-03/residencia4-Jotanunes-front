export type { IsoDate, TipoFornecimento, Obrigatoriedade } from './common';
export type { Obra, ObraLista, SituacaoObra } from './obra';
export { obraApi } from './obra';
export type { EscopoItem, ExigenciaValidade, ItemExigido, ListaExigencias, SituacaoLista, TipoDocumento } from './listaExigencias';
export type {
  AcessoPortal,
  CampoFornecedor,
  Contato,
  DadosCadastroFornecedor,
  DadosEdicaoFornecedor,
  Fornecedor,
  SituacaoFornecedor,
  VinculoObra,
} from './fornecedor';
export { aguardandoAcesso, camposRecusados, forneceTipo, fornecedorApi, normalizarTipos } from './fornecedor';
export type {
  DecisaoRegistrada,
  DocumentoEmpresa,
  EnvioAnterior,
  MotivoReprovacao,
  Prioridade,
  Renovacao,
  StatusDocumento,
  StatusEnvio,
} from './documento';
export type { ArquivoFuncionario, EnvioArquivos } from './arquivo';
export type { AcaoEvento, Analise, AutorEvento, EventoHistorico, PeriodoRelatorio, TempoAnalise } from './historico';
export type { Dataset } from './dataset';

export { diasEntre, somarDias, hojeLocal, lerDataApi, JANELA_VENCIMENTO_DIAS } from './lib/dates';
export { ehPendencia, estaEmDia, statusArquivo, statusDocumento, statusPorValidade } from './lib/status';
export {
  documentosExigidos,
  fornecedoresDaObra,
  listasAplicaveis,
  listasAplicaveisNaObra,
  listasDaObra,
  listasIgnoradas,
  nomeDoTipoDocumento,
  obrasDaLista,
  obrasDoFornecedor,
  type DocumentoExigido,
  type ListaAplicavel,
} from './lib/aplicabilidade';
export { documentoDoFornecedor, resumoFornecedor, type ResumoFornecedor } from './lib/fornecedorResumo';
export { arquivosDoItem, resumoArquivos, type ResumoArquivos } from './lib/arquivos';
export { montarFila, type EntradaFila, type EntradaFilaDocumento, type EntradaFilaEnvio } from './lib/fila';
export {
  pendenciasDaObra,
  totalPendenciasDaObra,
  type GrupoPendencias,
  type Pendencia,
  type StatusPendencia,
} from './lib/pendencias';
export { vencidosRecentes, vencimentosProximos, type Vencimento } from './lib/vencimentos';
export { alcanceDaLista, alcanceNaObra, composicaoLista, type ComposicaoLista } from './lib/listas';
export { resolverEvento, type AcaoResolvida, type AutorResolvido, type EventoResolvido } from './lib/eventos';
