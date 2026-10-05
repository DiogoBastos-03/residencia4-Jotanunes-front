/** Endereços das rotas. Use estas funções em vez de montar URL à mão. */
export const paths = {
  visaoGeral: '/',
  fila: '/fila',
  analise: (id: string) => `/fila/${id}`,
  remessa: (id: string) => `/fila/remessa/${id}`,
  obras: '/obras',
  obra: (id: string) => `/obras/${id}`,
  fornecedores: '/fornecedores',
  novoFornecedor: '/fornecedores/novo',
  fornecedor: (id: string) => `/fornecedores/${id}`,
  exigencias: '/exigencias',
  novaLista: '/exigencias/nova',
  lista: (id: string) => `/exigencias/${id}`,
  relatorios: '/relatorios',
  estados: '/_estados',
  componentes: '/_componentes',
} as const;
