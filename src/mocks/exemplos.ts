/**
 * Conteúdo de exemplo que preenche os formulários ao abrir — é o que a revisão
 * vai ler. O botão "Limpar" de cada formulário mostra o estado vazio.
 */
export const exemplosFormulario = {
  reprovacao: {
    motivo: 'faltaAssinatura',
    observacao:
      'O arquivo veio sem a assinatura do responsável técnico na última página. Envie o documento completo e assinado.',
  },
} as const;

/** Exemplos que preenchem os drawers da ficha da obra. */
export const exemplosObra = {
  vinculoFornecedor: {
    fornecedorId: 'cimentos-nordeste',
    servicoContratado: 'Cimento e argamassa',
    inicio: '2026-10-01',
    fim: '2027-12-01',
  },
  listasParaVincular: ['obras-publicas'],
} as const;
