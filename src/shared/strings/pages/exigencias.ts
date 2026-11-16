import { dominio } from '../dominio';

/** Rótulo do número de versão do back (decimal 1.00, 2.00…): mostra "1", "2"… */
export const numeroVersao = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** Exigências (/exigencias): listas de exigências. */
export const exigenciasPage = {
  title: 'Listas de exigências',
  subtitle: 'Cada lista vale para um tipo de fornecedor e diz quais documentos ele precisa entregar nas obras em que ela estiver.',
  nova: 'Nova lista',
  buscaLabel: 'Buscar lista pelo nome',
  buscaPlaceholder: 'Buscar pelo nome',
  filtrosLabel: 'Tipo da lista',
  filtros: { todos: 'Todas', servico: 'Serviço', material: 'Material' },
  caption: 'Listas de exigências',
  colunas: { nome: 'Lista', tipo: 'Vale para fornecedores de' },
  abrir: 'Abrir lista',
  total: (n: number) => dominio.plural(n, 'lista', 'listas'),
  vaziaTitle: 'Nenhuma lista de exigências ainda',
  vaziaDescription: 'Crie a primeira: escolha o tipo de fornecedor e os documentos que ele precisa entregar.',
  semResultadoTitle: 'Nenhuma lista encontrada',
  semResultadoDescription: 'Nenhuma lista com esse nome e esse tipo.',
  limparFiltros: 'Limpar filtros',
} as const;

/** Editor das exigências (documentos de uma versão), usado na nova lista e na edição. */
export const editorExigencias = {
  title: 'Documentos exigidos',
  descricao: 'A ordem aqui é a ordem em que o fornecedor vê os documentos.',
  adicionar: 'Adicionar documento',
  escolha: 'Escolha um tipo de documento…',
  adicionarBotao: 'Adicionar',
  todosIncluidos: 'Todos os tipos de documento já estão na lista.',
  semTipos: 'Nenhum tipo de documento cadastrado. Cadastre em "Tipos de documento".',
  caption: 'Documentos exigidos pela lista',
  colunas: { ordem: '#', documento: 'Documento', obrigatorio: 'Obrigatório', acoes: 'Ações' },
  obrigatorio: (nome: string) => `${nome} é obrigatório`,
  subir: (nome: string) => `Subir ${nome}`,
  descer: (nome: string) => `Descer ${nome}`,
  remover: (nome: string) => `Remover ${nome}`,
  vazio: 'Nenhum documento ainda. Adicione pelo menos um.',
} as const;

/** Nova lista (/exigencias/nova). */
export const novaListaPage = {
  voltar: 'Listas de exigências',
  title: 'Nova lista de exigências',
  subtitle: 'Nome, tipo de fornecedor e os documentos exigidos. Dá para já vincular a uma obra.',
  identificacao: '1. Identificação',
  nome: 'Nome da lista',
  tipo: 'Vale para fornecedores de',
  tipos: {
    servico: { title: 'Serviço', description: 'Aplica-se a fornecedores de serviço das obras em que a lista estiver.' },
    material: { title: 'Material', description: 'Aplica-se a fornecedores de material das obras em que a lista estiver.' },
  },
  documentos: '2. Documentos exigidos',
  obra: '3. Obra (opcional)',
  obraDescricao: 'Se escolher uma obra, a lista já nasce vinculada a ela e os fornecedores ativos do mesmo tipo passam a segui-la.',
  obraCampo: 'Obra',
  nenhuma: 'Nenhuma agora',
  obraSemVaga: (tipo: string) => `Nenhuma obra está livre para uma lista de ${tipo}: cada obra tem no máximo uma lista de cada tipo.`,
  prazo: 'Prazo de entrega dos documentos (dias)',
  prazoHint: 'De 1 a 9999 dias, para os fornecedores da obra.',
  cancelar: 'Cancelar',
  salvar: 'Criar lista',
  salvando: 'Criando…',
  alertaTitle: 'Não foi possível criar a lista',
  alertaErrosTitle: 'Revise os campos marcados',
  alertaErros: 'Alguns campos obrigatórios estão vazios ou inválidos.',
  toast: (nome: string) => `Lista "${nome}" criada na versão 1`,
  toastObra: (nome: string, obra: string, empresas: number) =>
    `Lista "${nome}" criada na versão 1 e vinculada a ${obra}: ${dominio.plural(empresas, 'fornecedor passou', 'fornecedores passaram')} a segui-la`,
} as const;

/** Ficha da lista (/exigencias/:id). */
export const listaPage = {
  voltar: 'Listas de exigências',
  tipo: (tipo: string) => `Vale para fornecedores de ${tipo}`,
  criada: (data: string) => `criada em ${data}`,
  renomear: 'Renomear',
  editarExigencias: 'Editar exigências',
  vigente: (versao: string, data: string) => `Versão ${versao} em vigor desde ${data}`,
  caption: (versao: string) => `Documentos exigidos na versão ${versao}`,
  colunas: { ordem: '#', documento: 'Documento', exigencia: 'Exigência', validade: 'Validade', formatos: 'Formatos aceitos' },
  obrigatorio: 'Obrigatório',
  opcional: 'Opcional',
  versoes: 'Versões',
  versoesDescricao: 'Cada alteração das exigências cria uma versão nova; as anteriores ficam guardadas e não mudam.',
  versao: (n: string) => `Versão ${n}`,
  versaoAtual: 'Em vigor',
  versaoResumo: (data: string, n: number) => `${data} • ${dominio.plural(n, 'documento', 'documentos')}`,
  documentoRemovido: 'Tipo de documento não encontrado',
  naoEncontradaTitle: 'Lista não encontrada',
  naoEncontradaDescription: 'O endereço pode estar incorreto. Volte para as listas de exigências.',
  naoEncontradaAction: 'Ver listas',
} as const;

export const modalRenomearLista = {
  title: 'Renomear lista',
  descricao: 'O nome muda em todas as obras que usam a lista. Não cria versão nova.',
  nome: 'Nome da lista',
  cancelar: 'Cancelar',
  salvar: 'Salvar nome',
  salvando: 'Salvando…',
  erroTitle: 'Não foi possível renomear',
  toast: 'Lista renomeada',
  semMudanca: 'Nada foi alterado',
} as const;

export const drawerEditarExigencias = {
  title: 'Editar exigências',
  subtitle: (nome: string) => nome,
  aviso: (atual: string, nova: string) =>
    `Salvar não altera a versão ${atual}: cria a versão ${nova}. A versão ${atual} fica guardada como estava, e as obras que usam a lista passam a seguir a versão ${nova}.`,
  cancelar: 'Cancelar',
  salvar: (nova: string) => `Criar versão ${nova}`,
  salvando: 'Salvando…',
  erroTitle: 'Não foi possível salvar',
  toast: (versao: string) => `Versão ${versao} criada`,
  semMudanca: (versao: string) => `Nada mudou: a lista continua na versão ${versao}`,
} as const;

/** Vincular lista a uma obra (ficha da obra). */
export const modalVincularLista = {
  title: 'Vincular lista de exigências',
  descricao: (obra: string) => `Os fornecedores ativos de ${obra} com o mesmo tipo da lista passam a segui-la.`,
  lista: 'Lista de exigências',
  escolha: 'Escolha…',
  opcao: (nome: string, tipo: string) => `${nome} (${tipo})`,
  prazo: 'Prazo de entrega dos documentos (dias)',
  prazoHint: 'De 1 a 9999 dias, para os fornecedores da obra.',
  regra: 'Cada obra tem no máximo uma lista de material e uma de serviço.',
  cancelar: 'Cancelar',
  confirmar: 'Vincular lista',
  confirmando: 'Vinculando…',
  erroTitle: 'Não foi possível vincular',
  toast: (lista: string, empresas: number) => `"${lista}" vinculada: ${dominio.plural(empresas, 'fornecedor passou', 'fornecedores passaram')} a segui-la`,
} as const;
