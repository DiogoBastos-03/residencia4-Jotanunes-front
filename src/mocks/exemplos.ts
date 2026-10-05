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

/** Cadastro de fornecedor preenchido (CNPJ com dígitos válidos, ainda não cadastrado). */
export const exemploNovoFornecedor = {
  cnpj: '45987321000160',
  razaoSocial: 'Revest Nordeste Revestimentos Ltda.',
  telefone: '8132447788',
  email: 'contato@revestnordeste.com.br',
  tipos: ['servico'],
  obraId: 'ob-2401',
  servicoContratado: 'Revestimento cerâmico das áreas comuns',
} as const;

/** Nova lista de exigências preenchida — itens do protótipo. */
export const exemploNovaLista = {
  nome: 'Segurança do trabalho — instalações elétricas',
  situacao: 'ativo',
  tipo: 'servico',
  descricao: 'Programas de segurança, seguro e as pessoas que trabalham com eletricidade no canteiro.',
  itensDe: 'seg-trabalho',
  obraIds: ['ob-2401', 'ob-2402'],
  prazoEnvioDias: 30,
  lembretesDias: [15, 7, 2],
} as const;

/** Drawer "Novo documento exigido" preenchido. */
export const exemploNovoDocumento = {
  nome: 'Certidão Negativa Estadual',
  obrigatoriedade: 'obrigatorio',
  validade: 'comData',
  avisoDias: 30,
  formatos: 'pdfImagem',
  instrucoes: 'Envie a certidão emitida nos últimos 60 dias.',
} as const;

/** Drawer "Vincular a obras" preenchido. */
export const exemploVincularObras = ['ob-2404', 'ob-2312'] as const;

/** Drawer "Novo documento de funcionário" preenchido. */
export const exemploNovoDocumentoFuncionario = {
  nome: 'Certificado NR-10 – Segurança em eletricidade',
  obrigatoriedade: 'obrigatorio',
  validade: 'comData',
  avisoDias: 30,
  formatos: 'pdf',
  instrucoes: 'Envie um arquivo por funcionário, com o nome da pessoa no nome do arquivo.',
} as const;
