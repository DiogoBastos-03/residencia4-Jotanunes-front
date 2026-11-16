/** Textos dos componentes base (shared/ui). */
export const ui = {
  drawer: {
    close: 'Fechar painel',
  },
  modal: {
    close: 'Fechar',
  },
  toast: {
    region: 'Avisos',
    dismiss: 'Fechar aviso',
  },
  table: {
    actions: 'Ações',
  },
  skeleton: {
    loading: 'Carregando conteúdo',
    acordando: 'Acordando o serviço, isso pode levar alguns segundos.',
  },
  errorState: {
    title: 'Não foi possível carregar estas informações',
    description: 'A conexão com o servidor falhou. Os dados não foram alterados.',
    retry: 'Tentar de novo',
    compact: 'Não foi possível carregar.',
  },
  field: {
    optional: '(opcional)',
  },
  pageHeader: {
    back: 'Voltar',
  },
} as const;
