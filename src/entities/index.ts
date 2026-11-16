export type { TipoFornecimento } from './common';
export type { Obra, ObraResumo} from './obra';
export type { ListaExigencias } from './listaExigencias';
export type { Contato, Fornecedor, FornecedorCadastro, FornecedorResumo, SituacaoFornecedor, VinculoObra } from './fornecedor';
export { aguardandoAcesso, forneceTipo, normalizarTipos, situacaoDe } from './fornecedor';
export type {
  DecisaoRegistrada,
  DocumentoEmpresa,
  MotivoReprovacao,
  StatusDocumento,
} from './documento';
export type { ArquivoFuncionario, EnvioArquivos } from './arquivo';
export type { PeriodoRelatorio } from './historico';
export type { Dataset } from './dataset';

export { diasEntre } from './lib/dates';
export { ehPendencia, estaEmDia, statusArquivo, statusDocumento } from './lib/status';
export {
  documentosExigidos,
  listasAplicaveis,
  listasAplicaveisNaObra,
  listasDaObra,
  listasIgnoradas,
  nomeDoTipoDocumento,
  obrasDoFornecedor,
  type DocumentoExigido,
  type ListaAplicavel,
} from './lib/aplicabilidade';
export { documentoDoFornecedor, resumoFornecedor, type ResumoFornecedor } from './lib/fornecedorResumo';
export { arquivosDoItem, resumoArquivos, type ResumoArquivos } from './lib/arquivos';
export { montarFila, type EntradaFila} from './lib/fila';
export {
  pendenciasDaObra,
} from './lib/pendencias';
export { vencidosRecentes, vencimentosProximos, type Vencimento } from './lib/vencimentos';
export { composicaoLista } from './lib/listas';
export { resolverEvento, type EventoResolvido } from './lib/eventos';
