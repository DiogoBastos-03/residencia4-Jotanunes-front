import { dominio } from '../dominio';

/** Visão geral (/). */
export const visaoGeralPage = {
  title: 'Visão geral',
  subtitle: (dataPorExtenso: string) => `${dataPorExtenso} — situação da documentação dos fornecedores.`,
  metricas: {
    aguardando: 'Aguardando análise',
    aguardandoHint: (n: number) =>
      n === 0 ? 'nenhum esperando há mais de 2 dias' : `${n} esperando há mais de 2 dias`,
    analisados: 'Analisados hoje',
    analisadosHint: (aprovados: number, reprovados: number) =>
      `${dominio.plural(aprovados, 'aprovado', 'aprovados')} • ${dominio.plural(reprovados, 'reprovado', 'reprovados')}`,
    aptos: 'Fornecedores aptos',
    aptosHint: (total: number) => `de ${total} cadastrados`,
    vencendo: 'Vencendo em 30 dias',
    vencendoHint: (fornecedores: number) => `em ${dominio.fornecedores(fornecedores)}`,
  },
  obras: {
    title: 'Obras em execução',
    action: 'Ver todas as obras',
    fornecedores: 'Fornecedores',
    listas: 'Listas',
    pendencias: 'Pendências',
    semLista: 'Sem lista de exigências',
    emptyTitle: 'Nenhuma obra em execução',
    emptyDescription: 'Quando a integração enviar uma obra em execução, ela aparece aqui com seus fornecedores e pendências.',
  },
  fila: {
    title: 'Fila prioritária',
    action: 'Ver fila completa',
    emptyTitle: 'A fila está vazia',
    emptyDescription: 'Nenhum documento ou envio espera decisão. Novos envios dos fornecedores aparecem aqui primeiro.',
  },
  vencimentos: {
    title: 'Vencimentos próximos',
    renovacao: 'nova versão em análise',
    emptyTitle: 'Nada vence nos próximos 30 dias',
    emptyDescription: 'Quando um documento aprovado estiver a 30 dias do vencimento, ele aparece aqui para a equipe cobrar a renovação.',
  },
  analises: {
    title: 'Últimas análises',
    emptyTitle: 'Nenhuma análise hoje',
    emptyDescription: 'As decisões tomadas hoje pela equipe aparecem aqui. Comece pela fila de análise.',
    emptyAction: 'Abrir a fila',
  },
} as const;
