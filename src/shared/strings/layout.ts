/** Textos do layout da aplicação: sidebar, navegação e barra móvel. */
export const layout = {
  skipToContent: 'Pular para o conteúdo',
  navLabel: 'Navegação principal',
  nav: {
    visaoGeral: 'Visão geral',
    fila: 'Fila de análise',
    obras: 'Obras',
    fornecedores: 'Fornecedores',
    exigencias: 'Exigências',
    relatorios: 'Relatórios',
  },
  queueCount: (n: number) => (n === 1 ? '1 item na fila' : `${n} itens na fila`),
  footerTitle: 'Acesso interno',
  footerText: 'Uso restrito à equipe de Suprimentos',
  openMenu: 'Abrir menu',
  closeMenu: 'Fechar menu',
  menuDialog: 'Menu',
} as const;
