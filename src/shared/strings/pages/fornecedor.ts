import { dominio } from '../dominio';

/** Ficha do fornecedor (/fornecedores/:id). */
export const fornecedorPage = {
  voltar: 'Fornecedores',
  subtitle: { desde: (data: string) => `fornecedor desde ${data}` },
  bloquear: 'Bloquear fornecedor',
  desbloquear: 'Desbloquear',
  cobrar: 'Cobrar pendências',
  cobrarToast: (n: number) =>
    n === 0 ? 'Nada a cobrar: os documentos obrigatórios estão em dia' : `Cobrança enviada para ${dominio.plural(n, 'documento pendente', 'documentos pendentes')}`,
  reenviar: 'Reenviar acesso',
  abasLabel: 'Seções do fornecedor',
  abas: { documentos: 'Documentos', exigencias: 'Exigências', obras: 'Obras', historico: 'Histórico', contatos: 'Contatos' },
  naoEncontradoTitle: 'Fornecedor não encontrado',
  naoEncontradoDescription: 'O endereço pode estar incorreto. Volte para a lista e busque pelo nome ou CNPJ.',
  naoEncontradoAction: 'Ver fornecedores',
  documentos: {
    intro: 'O documento da empresa é enviado uma vez e vale para todas as obras que o exigem.',
    meta: (obras: string[], emDia: number, total: number) =>
      `exigido em ${obras.length === 1 ? `1 obra (${obras[0] ?? ''})` : dominio.obras(obras.length)} • ${emDia} de ${total} obrigatórios em dia`,
    caption: (lista: string) => `Documentos de ${lista}`,
    colunas: { documento: 'Documento', tipo: 'Tipo', status: 'Status', validade: 'Validade', ultimo: 'Último envio' },
    semValidade: 'Sem validade',
    naoEnviado: 'Ainda não enviado',
    analisar: 'Analisar',
    ver: 'Ver',
    funcionario: {
      caption: (lista: string) => `Documentos de funcionário de ${lista}`,
      colunas: { documento: 'Documento de funcionário', tipo: 'Tipo', arquivos: 'Arquivos', situacao: 'Situação', ultimo: 'Último envio' },
      analisar: 'Analisar',
      ver: 'Ver arquivos',
      nota: 'Documento de funcionário aceita vários arquivos, cada um analisado e com validade própria. Não entra na conta de fornecedor apto.',
    },
    vazioTitle: 'Nenhuma lista de exigências se aplica a este fornecedor',
    vazioDescription: 'Ele ainda não está em nenhuma obra com lista do mesmo tipo. Vincule-o a uma obra na ficha da obra.',
  },
  exigencias: {
    intro: 'Estas exigências vêm das obras em que a empresa está. Para mudar, mude as listas de exigências da obra.',
    caption: 'Listas de exigências aplicáveis',
    colunas: { lista: 'Lista de exigências', tipo: 'Tipo', obras: 'Obras em que se aplica', itens: 'Itens exigidos', situacao: 'Situação' },
    ignoradasTitle: 'Ignoradas por tipo',
    ignorada: (lista: string, tipoLista: string, obras: number, razao: string, tipoFornecedor: string) =>
      `${lista} (${tipoLista}), exigida em ${dominio.obras(obras)} desta empresa. Não se aplica porque a ${razao} é fornecedora de ${tipoFornecedor}.`,
    vazioTitle: 'Nenhuma exigência para este fornecedor',
    vazioDescription: 'As exigências aparecem quando a empresa está em uma obra com lista de exigências do mesmo tipo.',
  },
  obras: {
    caption: 'Obras do fornecedor',
    colunas: { obra: 'Obra', codigo: 'Código', servico: 'Serviço contratado', periodo: 'Período', listas: 'Listas aplicáveis', situacao: 'Situação da obra' },
    abrir: 'Abrir obra',
    vazioTitle: 'Ainda não está em nenhuma obra',
    vazioDescription: 'Vincule o fornecedor na ficha da obra. A partir daí ele recebe as exigências das listas do mesmo tipo.',
    verObras: 'Ver obras',
  },
  historico: {
    vazioTitle: 'Nada registrado ainda',
    vazioDescription: 'Envios, decisões e vínculos com obras aparecem aqui.',
  },
  contatos: {
    principal: 'Contato principal',
    seguranca: 'Segurança do trabalho',
    nome: 'Nome',
    cargo: 'Cargo',
    email: 'E-mail',
    telefone: 'Telefone',
    acesso: 'Acesso ao portal',
    acessou: (data: string) => `Primeiro acesso em ${data}.`,
    aguardando: (data: string) => `Convite enviado em ${data}. Ainda não entrou no portal.`,
    semConvite: 'Cadastrado sem convite. Envie o convite para o fornecedor entrar no portal.',
    emailConvite: 'E-mail do convite',
  },
} as const;
