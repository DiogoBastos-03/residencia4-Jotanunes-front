import { PARAM_ORIGEM, serializarOrigem, type Origem } from './origem';

function comOrigem(caminho: string, origem?: Origem): string {
  return origem && origem.tipo !== 'fila' ? `${caminho}?${PARAM_ORIGEM}=${encodeURIComponent(serializarOrigem(origem))}` : caminho;
}

/** Endereços das rotas. Use estas funções em vez de montar URL à mão. */
export const paths = {
  visaoGeral: '/',
  fila: '/fila',
  /** Análise de um documento da empresa, lembrando de onde veio. */
  analise: (id: string, origem?: Origem) => comOrigem(`/fila/${id}`, origem),
  /** Envio de documentos de funcionário (vários arquivos), lembrando de onde veio. */
  envio: (id: string, origem?: Origem) => comOrigem(`/fila/envio/${id}`, origem),
  obras: '/obras',
  obra: (id: string, aba?: string) => (aba ? `/obras/${id}?aba=${aba}` : `/obras/${id}`),
  fornecedores: '/fornecedores',
  novoFornecedor: '/fornecedores/novo',
  fornecedor: (id: string, aba?: string) => (aba ? `/fornecedores/${id}?aba=${aba}` : `/fornecedores/${id}`),
  exigencias: '/exigencias',
  novaLista: '/exigencias/nova',
  lista: (id: string) => `/exigencias/${id}`,
  relatorios: '/relatorios',
  estados: '/_estados',
  componentes: '/_componentes',
  /** Endereço da origem, na aba em que estava. */
  origem: (origem: Origem): string =>
    origem.tipo === 'fila' ? '/fila' : origem.tipo === 'fornecedor' ? paths.fornecedor(origem.id, origem.aba) : paths.obra(origem.id, origem.aba),
} as const;
