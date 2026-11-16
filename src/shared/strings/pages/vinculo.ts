import { dominio } from '../dominio';

/** Vínculo entre fornecedor e obra — modais usados na ficha da obra e na ficha do fornecedor. */
export const modalVincular = {
  titleFornecedor: 'Vincular fornecedor à obra',
  titleObra: 'Vincular a uma obra',
  descricaoFornecedor: (obra: string) => `O fornecedor passa a constar em ${obra}.`,
  descricaoObra: (razao: string) => `${razao} passa a constar na obra escolhida.`,
  fornecedor: 'Fornecedor',
  obra: 'Obra',
  escolha: 'Escolha…',
  prazo: 'Prazo de entrega dos documentos (dias)',
  prazoHint: 'De 1 a 9999 dias, contados a partir de hoje.',
  semFornecedores: 'Todos os fornecedores ativos já estão nesta obra.',
  semObras: 'Este fornecedor já está em todas as obras.',
  cancelar: 'Cancelar',
  confirmar: 'Vincular',
  confirmando: 'Vinculando…',
  erroTitle: 'Não foi possível vincular',
  toast: (workflows: number, semWorkflow: string | null) =>
    [
      `Vínculo criado. Passou a seguir ${dominio.plural(workflows, 'workflow', 'workflows')} da obra.`,
      semWorkflow ? `A obra não tem workflow para ${semWorkflow}.` : '',
    ]
      .filter(Boolean)
      .join(' '),
} as const;

export const modalDesvincular = {
  title: 'Desvincular fornecedor da obra?',
  texto: (razao: string, obra: string) => `${razao} deixa de constar em ${obra}.`,
  alerta: 'Os vínculos dele com os workflows desta obra são encerrados, menos os que outra obra dele também usa. Dá para vincular de novo depois.',
  cancelar: 'Cancelar',
  confirmar: 'Desvincular',
  confirmando: 'Desvinculando…',
  erroTitle: 'Não foi possível desvincular',
  toast: 'Fornecedor desvinculado da obra',
} as const;
