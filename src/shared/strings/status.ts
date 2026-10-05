/**
 * Rótulo de cada status exibido em Badge. A chave é o identificador estável
 * usado no código e nos dados; o valor é o texto de interface.
 */
export const statusLabels = {
  aprovado: 'Aprovado',
  emAnalise: 'Em análise',
  pendente: 'Pendente',
  venceEmBreve: 'Vence em breve',
  reprovado: 'Reprovado',
  vencido: 'Vencido',
  apto: 'Apto',
  comPendencia: 'Com pendência',
  bloqueado: 'Bloqueado',
  ativo: 'Ativo',
  rascunho: 'Rascunho',
  urgente: 'Urgente',
  normal: 'Normal',
  servico: 'Serviço',
  material: 'Material',
  emExecucao: 'Em execução',
  planejamento: 'Planejamento',
  concluida: 'Concluída',
  semLista: 'Sem lista de exigências',
  funcionarios: 'Funcionários',
} as const;

export type StatusKey = keyof typeof statusLabels;

/** Rótulos das tags pequenas (11px). */
export const tagLabels = {
  obrigatorio: 'Obrigatório',
  opcional: 'Opcional',
  funcionarios: 'Funcionários',
  sempreObrigatorio: 'sempre obrigatório',
  vaiSeAplicar: 'Vai se aplicar',
  naoSeAplica: 'Não se aplica',
} as const;

export type TagKey = keyof typeof tagLabels;
