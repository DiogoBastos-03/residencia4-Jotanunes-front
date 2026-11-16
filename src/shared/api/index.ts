export { http, PREFIXO, nomeDoArquivo, observarRespostas, definirCenarioMock, type OpcoesRequisicao, type RespostaObservada } from './client';
export { ApiError, mensagemDoErro, CODIGOS_CONTRATO, CODIGOS_FRONT, type CodigoContrato, type CodigoErro } from './problem';
export { guid, dataHoraUtc, dataSimples, paginaSchema, PAGE_SIZE_MAX, type PaginacaoQuery, type ListagemPaginada } from './schemas';
export { queryKeys } from './keys';
export { verificarSaude } from './health';
export { buscarTodasAsPaginas } from './paginas';
export { useServicoAcordando } from './lentidao';
