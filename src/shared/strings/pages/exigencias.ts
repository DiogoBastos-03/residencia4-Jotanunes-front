import { dominio } from '../dominio';

/** Listas de exigências (/exigencias). */
export const exigenciasPage = {
  title: 'Listas de exigências',
  subtitle: 'Definem o que os fornecedores de cada tipo precisam enviar nas obras em que a lista vale',
  nova: 'Nova lista de exigências',
  valeEm: (n: number) => `vale em ${dominio.obras(n)}`,
  alcanca: (n: number, tipo: string) => `alcança ${dominio.fornecedores(n)} de ${tipo}`,
  configurar: 'Configurar',
  nota: 'Lista de exigências vale em obras. Fornecedor está em obras. A obra é o que liga os dois, e cada lista só cria exigência para fornecedores do mesmo tipo.',
  criadaToast: 'Lista de exigências criada e vinculada às obras',
  vazioTitle: 'Nenhuma lista de exigências',
  vazioDescription: 'Crie a primeira lista: diga o que os fornecedores precisam enviar e em quais obras ela vale.',
} as const;

/** Nova lista de exigências (/exigencias/nova). */
export const novaListaPage = {
  voltar: 'Listas de exigências',
  title: 'Nova lista de exigências',
  subtitle: 'A lista é um conjunto de itens exigidos. Ela passa a valer nas obras que você escolher, para os fornecedores do mesmo tipo.',
  limpar: 'Limpar',
  cancelar: 'Cancelar',
  criar: 'Criar lista',
  erros: 'Revise os campos marcados antes de criar a lista.',
  identificacao: {
    title: '1. Identificação',
    nome: 'Nome da lista',
    nomePlaceholder: 'Ex.: Segurança do trabalho em obra',
    nomeErro: 'Dê um nome à lista.',
    situacao: 'Situação ao criar',
    situacoes: { ativo: 'Ativa', rascunho: 'Rascunho' },
    tipo: 'Tipo de lista',
    servico: 'Serviço',
    servicoDesc: 'Empresas que executam serviço na obra e colocam pessoas em campo',
    material: 'Material',
    materialDesc: 'Empresas que fornecem material e não executam serviço',
    tipoNota: 'A lista só cria exigência para fornecedores do mesmo tipo. Não pode ser alterado depois de criada.',
    descricao: 'Descrição que aparece para o fornecedor',
    descricaoPlaceholder: 'Explique para que servem estes documentos.',
  },
  itens: {
    title: '2. Itens exigidos',
    description: 'Documento da empresa: um arquivo, que vale para todas as obras. Documento de funcionário: vários arquivos no mesmo item, cada um analisado sozinho.',
    remover: 'Remover',
    vazio: 'Nenhum item ainda. Adicione pelo menos um documento.',
    itensErro: 'Adicione pelo menos um item.',
  },
  obras: {
    title: '3. Obras em que esta lista vale',
    description: 'Uma lista precisa valer em pelo menos uma obra para começar a exigir alguma coisa.',
    buscaLabel: 'Buscar obra',
    buscaPlaceholder: 'Buscar obra',
    resumo: (obras: number, fornecedores: number, tipo: string) =>
      `${dominio.plural(obras, 'obra selecionada', 'obras selecionadas')} • ${dominio.fornecedores(fornecedores)} de ${tipo} alcançados`,
    nenhuma: 'Nenhuma obra selecionada: a lista é criada, mas não exige nada até valer em uma obra.',
    semResultado: 'Nenhuma obra com esse nome ou código.',
  },
  prazo: {
    title: '4. Prazo e acompanhamento',
    prazo: 'Prazo sugerido para envio',
    prazos: (dias: number) => `${dias} dias após a vinculação`,
    lembretes: 'Lembretes automáticos',
    lembretesOpcoes: { tres: '15, 7 e 2 dias antes do prazo', dois: '7 e 2 dias antes do prazo', nenhum: 'Sem lembretes' },
    notaTitle: 'O prazo não trava o fornecedor',
    nota: 'Passado o prazo, os documentos não enviados continuam pendentes e entram nos relatórios de cobrança. O fornecedor pode enviar depois, pular os opcionais ou não enviar nada. O bloqueio é sempre decisão manual da equipe.',
  },
} as const;

/** Configuração da lista (/exigencias/:id). */
export const listaPage = {
  voltar: 'Listas de exigências',
  subtitle: (itens: number, obras: number, alcance: number, tipo: string) =>
    `${dominio.plural(itens, 'item exigido', 'itens exigidos')} • vale em ${dominio.obras(obras)} • alcança ${dominio.fornecedores(alcance)} de ${tipo}`,
  vincularObras: 'Vincular a obras',
  adicionarDocumento: 'Adicionar documento da empresa',
  adicionarFuncionario: 'Adicionar documento de funcionário',
  caption: 'Itens exigidos',
  colunas: { item: 'Item exigido', tipo: 'Tipo de item', obrig: 'Obrigatoriedade', validade: 'Validade', aviso: 'Aviso de vencimento' },
  comData: 'Com data',
  porArquivo: 'Por arquivo',
  semValidade: 'Sem validade',
  aviso: (dias: number) => `${dias} dias antes`,
  editar: 'Editar',
  obrasTitle: 'Obras em que esta lista vale',
  obrasDescription: (tipo: string, outro: string) =>
    `Nestas obras, os fornecedores de ${tipo} recebem estas exigências. Os de ${outro} ignoram esta lista.`,
  remover: 'Remover desta obra',
  removerUnica: 'Única lista da obra',
  obrasVazioTitle: 'Esta lista não vale em nenhuma obra',
  obrasVazioDescription: 'Enquanto não valer em uma obra, ela não exige nada de ninguém. Vincule a uma obra para começar.',
  naoEncontradaTitle: 'Lista de exigências não encontrada',
  naoEncontradaDescription: 'O endereço pode estar incorreto. Volte para as listas de exigências.',
  naoEncontradaAction: 'Ver listas de exigências',
  salvoToast: 'Item atualizado na lista de exigências',
  documentoToast: 'Documento adicionado à lista de exigências',
  funcionarioToast: 'Documento de funcionário adicionado à lista de exigências',
  obrasToast: (n: number) => (n === 1 ? 'Lista vinculada à obra selecionada' : 'Lista vinculada às obras selecionadas'),
  modalRemover: {
    title: 'Remover a lista desta obra?',
    texto: (lista: string, obra: string, fornecedores: number, tipo: string) =>
      fornecedores === 0
        ? `${lista} deixa de valer em ${obra}. Nenhum fornecedor de ${tipo} desta obra é afetado.`
        : `${lista} deixa de valer em ${obra}. ${fornecedores === 1 ? 'O fornecedor' : `Os ${fornecedores} fornecedores`} de ${tipo} desta obra ${fornecedores === 1 ? 'para' : 'param'} de receber estas exigências.`,
    nota: 'Os documentos já enviados continuam no histórico. Toda obra precisa de pelo menos uma lista de exigências, então a última não pode ser removida.',
    cancelar: 'Cancelar',
    confirmar: 'Desvincular',
    toast: 'Lista de exigências removida da obra',
  },
} as const;

/** Drawer de documento exigido (novo ou edição). */
export const drawerDocumento = {
  tituloNovo: { empresa: 'Novo documento da empresa', funcionario: 'Novo documento de funcionário' },
  tituloEditar: { empresa: 'Editar documento da empresa', funcionario: 'Editar documento de funcionário' },
  subtitle: (escopo: string, lista: string) => `${escopo} • ${lista}`,
  escopoNota: {
    empresa: 'O fornecedor envia um arquivo, que vale para todas as obras que o exigem.',
    funcionario: 'O fornecedor envia quantos arquivos precisar, ao longo do tempo. Cada arquivo é analisado sozinho.',
  },
  nome: 'Nome do documento',
  nomePlaceholder: { empresa: 'Ex.: Certidão Negativa Estadual', funcionario: 'Ex.: Certificado NR-10 dos funcionários' },
  nomeErro: 'Dê um nome ao documento.',
  nomeDuplicado: 'Esta lista já exige um documento com esse nome.',
  tipo: 'Tipo',
  obrigatoriedades: { obrigatorio: 'Obrigatório', opcional: 'Opcional' },
  validade: { empresa: 'Exige validade', funcionario: 'Exige validade por arquivo' },
  validades: { comData: 'Sim, com data', semValidade: 'Não' },
  aviso: 'Avisar antes de vencer',
  avisos: (dias: number) => `${dias} dias`,
  formatos: 'Formatos aceitos',
  formatosOpcoes: { pdfImagem: 'PDF, JPG ou PNG', pdf: 'Somente PDF' },
  instrucoes: 'Instruções para o fornecedor (opcional)',
  instrucoesPlaceholder: 'Ex.: envie a certidão emitida nos últimos 60 dias.',
  impactoTitle: 'Impacto nos fornecedores',
  impacto: (fornecedores: number, tipo: string, obras: number, escopo: 'empresa' | 'funcionario') =>
    obras === 0
      ? 'Esta lista ainda não vale em nenhuma obra: ninguém recebe esta pendência por enquanto.'
      : escopo === 'empresa'
        ? `${dominio.fornecedores(fornecedores)} de ${tipo}, nas ${dominio.obras(obras)} em que esta lista vale, passarão a ter esta pendência no portal. Quem já enviou o mesmo documento por outra obra não precisa enviar de novo.`
        : `${dominio.fornecedores(fornecedores)} de ${tipo}, nas ${dominio.obras(obras)} em que esta lista vale, passarão a ter este item no portal e podem enviar quantos arquivos precisarem.`,
  impactoRascunho: 'Os fornecedores das obras escolhidas passam a ter esta pendência quando a lista for criada.',
  limpar: 'Limpar campos',
  cancelar: 'Cancelar',
  adicionar: 'Adicionar documento',
  salvar: 'Salvar alterações',
} as const;

/** Drawer de vincular lista a obras. */
export const drawerVincularObras = {
  title: 'Vincular a obras',
  subtitle: (lista: string, tipo: string) => `${lista} • ${tipo}`,
  buscaLabel: 'Buscar obra',
  buscaPlaceholder: 'Buscar obra por nome ou código',
  obras: 'Obras',
  jaVinculada: 'Já vinculada',
  semResultado: 'Nenhuma obra com esse nome ou código.',
  resumo: 'Resumo',
  nenhuma: 'Nenhuma obra selecionada.',
  resumoTexto: (obras: number, fornecedores: number, tipo: string) =>
    `${dominio.plural(obras, 'obra selecionada', 'obras selecionadas')} • ${dominio.fornecedores(fornecedores)} de ${tipo} passam a ter estas exigências.`,
  limpar: 'Limpar seleção',
  cancelar: 'Cancelar',
  confirmar: (n: number) => (n === 0 ? 'Vincular a obras' : `Vincular a ${dominio.obras(n)}`),
} as const;
