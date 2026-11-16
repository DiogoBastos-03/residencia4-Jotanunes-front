import { dominio } from '../dominio';

/** Fornecedores (/fornecedores). */
export const fornecedoresPage = {
  title: 'Fornecedores',
  subtitle: (n: number) => `${dominio.plural(n, 'empresa cadastrada', 'empresas cadastradas')} no portal`,
  cadastrar: 'Cadastrar fornecedor',
  searchLabel: 'Buscar fornecedor',
  searchPlaceholder: 'Buscar por nome ou CNPJ',
  filtrosLabel: 'Filtrar por situação',
  filtros: { todos: 'Todos', apto: 'Aptos', comPendencia: 'Com pendência', bloqueado: 'Bloqueados' },
  tipoLabel: 'Filtrar por tipo',
  tipos: { todos: 'Todos os tipos', servico: (n: number) => `Serviço ${n}`, material: (n: number) => `Material ${n}` },
  caption: 'Fornecedores cadastrados',
  colunas: {
    fornecedor: 'Fornecedor',
    cnpj: 'CNPJ',
    tipo: 'Tipo',
    obras: 'Obras',
    listas: 'Listas aplicáveis',
    documentos: 'Documentos',
    situacao: 'Situação',
  },
  obras: (n: number) => dominio.obras(n),
  abrir: 'Abrir ficha',
  reenviar: 'Reenviar acesso',
  listaParcial: (carregados: number, total: number) =>
    `Mostrando os primeiros ${carregados} de ${total} fornecedores. A busca e os filtros valem só para estes.`,
  nota: 'Documentos conta só os obrigatórios da empresa, nas listas de exigências que se aplicam a ela. Fornecedor apto tem todos aprovados e dentro da validade.',
  novoToast: (razao: string) => `${razao} cadastrado`,
  novoToastConvite: (email: string) => `Fornecedor cadastrado e convite enviado para ${email}`,
  semResultadoTitle: 'Nenhum fornecedor com estes filtros',
  semResultadoDescription: 'Troque a situação, o tipo ou apague a busca. Para incluir uma empresa nova, use "Cadastrar fornecedor".',
  limparFiltros: 'Limpar filtros',
  vazioTitle: 'Nenhum fornecedor cadastrado',
  vazioDescription: 'Cadastre a primeira empresa: ela recebe um convite para o portal e passa a ver as exigências das obras em que estiver.',
} as const;

/** Modal de reenviar primeiro acesso — usado na lista e na ficha. */
export const modalReenviarAcesso = {
  title: 'Reenviar primeiro acesso?',
  texto: (razao: string, email: string) => `${razao} recebe um novo convite em ${email}. O link enviado antes deixa de valer.`,
  ultimoEnvio: (data: string) => `Convite anterior enviado em ${data}, ainda sem acesso ao portal.`,
  nuncaEnviado: 'O convite ainda não tinha sido enviado.',
  email: 'E-mail do convite',
  emailErro: 'Informe um e-mail válido.',
  cancelar: 'Cancelar',
  confirmar: 'Reenviar convite',
  toast: (email: string) => `Convite reenviado para ${email}`,
} as const;

/** Modal de bloquear fornecedor. */
export const modalBloquear = {
  title: 'Bloquear fornecedor?',
  texto: (razao: string) => `${razao} deixa de aparecer como apta para novas contratações até regularizar a documentação.`,
  alerta: 'O fornecedor continua acessando o portal para enviar documentos.',
  cancelar: 'Cancelar',
  confirmar: 'Bloquear',
  confirmando: 'Bloqueando…',
  erroTitle: 'Não foi possível bloquear',
  toast: 'Fornecedor bloqueado para novas contratações',
  desbloqueadoToast: 'Fornecedor desbloqueado',
  desbloqueando: 'Desbloqueando…',
  erroDesbloquear: (mensagem: string) => `Não foi possível desbloquear. ${mensagem}`,
} as const;

/** Modal de editar os dados do fornecedor (razão social, telefone, e-mail e tipos). */
export const modalEditarFornecedor = {
  title: 'Editar dados do fornecedor',
  descricao: 'O CNPJ não muda. Contatos de pessoas se editam na aba Contatos.',
  tipos: 'Tipo de fornecimento',
  cancelar: 'Cancelar',
  salvar: 'Salvar',
  salvando: 'Salvando…',
  erroTitle: 'Não foi possível salvar',
  toast: 'Dados do fornecedor atualizados',
  semMudanca: 'Nada foi alterado',
} as const;

/** Modal de editar (ou criar) um contato da empresa. */
export const modalEditarContato = {
  titlePrincipal: 'Contato principal',
  titleSeguranca: 'Contato de segurança do trabalho',
  descricao: (razao: string) => `Quem responde pela ${razao} neste assunto.`,
  cargo: 'Cargo (opcional)',
  telefone: 'Telefone (opcional)',
  nomeErro: 'Informe o nome do contato.',
  emailErro: 'Informe um e-mail válido.',
  cancelar: 'Cancelar',
  salvar: 'Salvar contato',
  toast: 'Contato salvo',
} as const;
