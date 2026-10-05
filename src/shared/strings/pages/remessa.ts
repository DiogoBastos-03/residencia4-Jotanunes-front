import { dominio } from '../dominio';

/** Remessa de funcionários (/fila/remessa/:id). */
export const remessaPage = {
  voltar: 'Voltar para a fila',
  subtitle: (fornecedor: string, obra: string, item: string, lista: string, data: string) =>
    `${fornecedor} • ${obra} • ${item}, da lista ${lista} • enviada em ${data}`,
  metricas: { aprovados: 'Aprovados', aguardando: 'Aguardando análise', reprovados: 'Reprovados' },
  caption: 'Funcionários da remessa',
  colunas: { funcionario: 'Funcionário', cpf: 'CPF', funcao: 'Função', documentos: 'Documentos', situacao: 'Situação' },
  analisar: 'Analisar',
  ver: 'Ver',
  rodape: 'Concluir encerra a remessa. Os funcionários reprovados continuam pendentes para reenvio.',
  rodapeAguardando: (n: number) =>
    `${dominio.plural(n, 'funcionário ainda aguarda', 'funcionários ainda aguardam')} análise. Concluir agora encerra a remessa assim mesmo; quem não foi analisado fica pendente.`,
  concluir: 'Concluir remessa',
  concluida: 'Remessa concluída e fornecedor avisado',
  naoEncontradaTitle: 'Esta remessa não está mais na fila',
  naoEncontradaDescription: 'A remessa pode ter sido concluída ou o endereço está incorreto. Volte para a fila e escolha outro item.',
  naoEncontradaAction: 'Voltar para a fila',
  drawer: {
    cpf: 'CPF',
    telefone: 'Telefone',
    funcao: 'Função',
    obra: 'Obra',
    remessaOrigem: 'Remessa de origem',
    remessaOrigemValor: (n: number, data: string) => `${dominio.remessa(n)} • ${data}`,
    itemOrigem: 'Item de origem',
    itemOrigemValor: (item: string, lista: string) => `${item} — ${lista}`,
    documentos: 'Documentos da pessoa',
    naoEnviado: 'Não enviado',
    aprovarDoc: (doc: string) => `Aprovar ${doc}`,
    reprovarDoc: (doc: string) => `Reprovar ${doc}`,
    aprovar: 'Aprovar',
    reprovar: 'Reprovar',
    cancelar: 'Cancelar',
    concluir: 'Concluir funcionário',
    fechar: 'Fechar',
    concluido: 'Funcionário concluído',
    pendentesAviso: (n: number) =>
      `${dominio.plural(n, 'documento ainda está', 'documentos ainda estão')} em análise. Ao concluir, eles são aprovados.`,
    jaConcluido: 'Este funcionário já foi analisado nesta remessa.',
  },
} as const;
