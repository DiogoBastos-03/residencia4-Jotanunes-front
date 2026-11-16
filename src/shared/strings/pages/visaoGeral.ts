import { dominio } from '../dominio';

/** Visão geral (/). Só contas sobre o que a API devolve. */
export const visaoGeralPage = {
  title: 'Visão geral',
  subtitle: 'Resumo do cadastro de empresas e das obras da integração.',
  metricas: {
    empresas: 'Empresas',
    empresasHint: (servico: number, material: number) => `${servico} de serviço • ${material} de material`,
    ativas: 'Ativas',
    bloqueadas: 'Bloqueadas',
    obras: 'Obras',
  },
  porObra: {
    title: 'Empresas por obra',
    action: 'Ver todas as obras',
    quantidade: (n: number) => dominio.fornecedores(n),
    emptyTitle: 'Nenhuma obra recebida ainda',
    emptyDescription: 'Quando a integração enviar a primeira obra, ela aparece aqui com as empresas vinculadas.',
  },
} as const;
