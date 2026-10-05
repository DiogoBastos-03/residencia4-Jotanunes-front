import { dominio } from '../dominio';

/** Relatórios (/relatorios). */
export const relatoriosPage = {
  title: 'Relatórios',
  subtitle: 'Acompanhamento da análise e dos vencimentos',
  periodoLabel: 'Período do tempo de análise',
  periodos: { '30d': 'Últimos 30 dias', '90d': 'Últimos 90 dias', ano: 'Este ano' },
  exportar: 'Exportar',
  exportadoToast: 'Relatório exportado em CSV',
  arquivo: (data: string) => `relatorio-fornecedores-${data}.csv`,
  pendencias: {
    title: 'Pendências por obra',
    description: 'Documentos pendentes, reprovados ou vencidos que entram na cobrança.',
    linha: (fornecedores: number) => `em ${dominio.fornecedores(fornecedores)}`,
    total: (n: number) => dominio.pendencias(n),
    vazioTitle: 'Nenhuma pendência em aberto',
    vazioDescription: 'Todos os fornecedores estão com os documentos exigidos em dia.',
  },
  tempos: {
    title: 'Tempo médio de análise por lista de exigências',
    dias: (d: number) => `${d.toFixed(1).replace('.', ',')} ${d < 2 ? 'dia' : 'dias'}`,
    acimaDaMeta: 'acima da meta de 2 dias',
    vazioTitle: 'Nenhuma análise no período',
    vazioDescription: 'Escolha um período maior para ver o tempo médio de análise.',
  },
  vencimentos: {
    title: 'Vencimentos nos próximos 30 dias',
    caption: 'Documentos que vencem nos próximos 30 dias',
    colunas: { data: 'Data', documento: 'Documento', fornecedor: 'Fornecedor', faltam: 'Faltam', situacao: 'Situação' },
    vazioTitle: 'Nada vence nos próximos 30 dias',
    vazioDescription: 'Quando um documento aprovado estiver a 30 dias do vencimento, ele aparece aqui.',
  },
  csv: {
    pendencias: ['Pendências por obra'],
    pendenciasCabecalho: ['Obra', 'Código', 'Pendências', 'Fornecedores com pendência'],
    tempos: ['Tempo médio de análise (dias)'],
    temposCabecalho: ['Lista de exigências', 'Tipo', 'Dias'],
    vencimentos: ['Vencimentos nos próximos 30 dias'],
    vencimentosCabecalho: ['Data', 'Documento', 'Fornecedor', 'Faltam'],
  },
} as const;
