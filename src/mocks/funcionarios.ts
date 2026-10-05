import type { DocumentoFuncionario, Funcionario, Remessa, StatusEnvio } from '@/entities';

export const remessas: readonly Remessa[] = [
  { id: 'rem-0911-construtora', fornecedorId: 'construtora-exemplo', obraId: 'ob-2401', listaId: 'seg-trabalho', itemId: 'st-5', enviadaEm: '2026-09-11T14:03', situacao: 'emAnalise', prioridade: 'urgente' },
  { id: 'rem-0914-vale-verde', fornecedorId: 'transportes-vale-verde', obraId: 'ob-2403', listaId: 'seg-trabalho', itemId: 'st-5', enviadaEm: '2026-09-14T10:15', situacao: 'emAnalise', prioridade: 'normal' },
  { id: 'rem-0915-engemax', fornecedorId: 'engemax', obraId: 'ob-2403', listaId: 'seg-trabalho', itemId: 'st-5', enviadaEm: '2026-09-15T08:20', situacao: 'emAnalise', prioridade: 'normal' },
  { id: 'rem-0520-construtora', fornecedorId: 'construtora-exemplo', obraId: 'ob-2402', listaId: 'seg-trabalho', itemId: 'st-5', enviadaEm: '2026-05-20T09:40', situacao: 'concluida', prioridade: 'normal' },
  { id: 'rem-0402-eletrica', fornecedorId: 'eletrica-aracaju', obraId: 'ob-2401', listaId: 'seg-trabalho', itemId: 'st-5', enviadaEm: '2026-04-02T15:10', situacao: 'concluida', prioridade: 'normal' },
];

type Docs = Partial<Record<'aso' | 'epi' | 'rg-cnh' | 'nr35', StatusEnvio>>;

function arquivoPessoa(doc: string, nome: string): string {
  const partes = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(' ');
  const curto = `${partes[0] ?? ''}-${partes[partes.length - 1] ?? ''}`;
  const extensao = doc === 'rg-cnh' ? 'jpg' : 'pdf';
  const prefixo = { aso: 'aso', epi: 'ficha-epi', 'rg-cnh': 'cnh', nr35: 'nr35' }[doc] ?? doc;
  return `${prefixo}-${curto}.${extensao}`;
}

function documentos(nome: string, docs: Docs, validadeAso = '2027-03-10'): DocumentoFuncionario[] {
  return Object.entries(docs).map(([id, status]) => ({
    documentoExigidoId: id,
    arquivo: arquivoPessoa(id, nome),
    status,
    validade: id === 'aso' ? validadeAso : id === 'nr35' ? '2027-05-20' : undefined,
  }));
}

const TODOS_APROVADOS: Docs = { aso: 'aprovado', epi: 'aprovado', 'rg-cnh': 'aprovado', nr35: 'aprovado' };
const TODOS_EM_ANALISE: Docs = { aso: 'emAnalise', epi: 'emAnalise', 'rg-cnh': 'emAnalise', nr35: 'emAnalise' };
const SEM_NR35_APROVADOS: Docs = { aso: 'aprovado', epi: 'aprovado', 'rg-cnh': 'aprovado' };
const SEM_NR35_EM_ANALISE: Docs = { aso: 'emAnalise', epi: 'emAnalise', 'rg-cnh': 'emAnalise' };

type Linha = [id: string, nome: string, cpf: string, telefone: string, funcao: string, status: StatusEnvio, docs: Docs];

function pessoas(remessa: Remessa, linhas: readonly Linha[]): Funcionario[] {
  return linhas.map(([id, nome, cpf, telefone, funcao, status, docs]) => ({
    id,
    fornecedorId: remessa.fornecedorId,
    obraId: remessa.obraId,
    remessaId: remessa.id,
    nome,
    cpf,
    telefone,
    funcao,
    status,
    documentos: documentos(nome, docs),
  }));
}

function remessa(id: string): Remessa {
  const encontrada = remessas.find((r) => r.id === id);
  if (!encontrada) throw new Error(`Remessa ${id} não existe nos mocks.`);
  return encontrada;
}

/** Remessa com 8 funcionários — exatamente a do protótipo. */
const CONSTRUTORA_MIRANTE: readonly Linha[] = [
  ['func-jose-souza', 'José Carlos de Souza', '12345678900', '(81) 99876-1234', 'Mestre de obras', 'aprovado', TODOS_APROVADOS],
  ['func-marcos-lima', 'Marcos Vinícius Lima', '23456789011', '(81) 99765-2345', 'Pedreiro', 'emAnalise', { aso: 'reprovado', epi: 'aprovado', 'rg-cnh': 'aprovado', nr35: 'aprovado' }],
  ['func-antonio-silva', 'Antônio Pereira da Silva', '34567890122', '(81) 99654-3456', 'Pedreiro', 'aprovado', TODOS_APROVADOS],
  ['func-rafael-barbosa', 'Rafael Gomes Barbosa', '45678901233', '(81) 99543-4567', 'Servente', 'emAnalise', { aso: 'emAnalise', 'rg-cnh': 'emAnalise' }],
  ['func-edson-santos', 'Edson Araújo Santos', '56789012344', '(81) 99432-5678', 'Carpinteiro', 'aprovado', TODOS_APROVADOS],
  ['func-paulo-nogueira', 'Paulo Henrique Nogueira', '67890123455', '(81) 99321-6789', 'Armador', 'emAnalise', TODOS_EM_ANALISE],
  ['func-cicero-costa', 'Cícero Bezerra da Costa', '78901234566', '(81) 99210-7890', 'Pedreiro', 'aprovado', TODOS_APROVADOS],
  ['func-wellington-duarte', 'Wellington Duarte', '89012345677', '(81) 99109-8901', 'Servente', 'reprovado', { aso: 'reprovado', epi: 'aprovado', 'rg-cnh': 'aprovado' }],
];

const CONSTRUTORA_JARDINS: readonly Linha[] = [
  ['func-joao-ferreira', 'João Batista Ferreira', '90123456788', '(81) 99011-2233', 'Encarregado de obra', 'aprovado', TODOS_APROVADOS],
  ['func-manoel-alves', 'Manoel Alves Pinheiro', '01234567899', '(81) 98922-3344', 'Pedreiro', 'aprovado', SEM_NR35_APROVADOS],
  ['func-francisco-melo', 'Francisco de Assis Melo', '11223344556', '(81) 98833-4455', 'Pedreiro', 'aprovado', SEM_NR35_APROVADOS],
  ['func-adriano-rocha', 'Adriano Rocha Lima', '22334455667', '(81) 98744-5566', 'Azulejista', 'aprovado', TODOS_APROVADOS],
  ['func-genival-santana', 'Genival Santana', '33445566778', '(81) 98655-6677', 'Servente', 'aprovado', SEM_NR35_APROVADOS],
  ['func-luiz-tavares', 'Luiz Carlos Tavares', '44556677889', '(81) 98566-7788', 'Pintor', 'aprovado', TODOS_APROVADOS],
  ['func-roberto-macena', 'Roberto Macena', '55667788990', '(81) 98477-8899', 'Servente', 'aprovado', SEM_NR35_APROVADOS],
];

const VALE_VERDE_VILA: readonly Linha[] = [
  ['func-sergio-andrade', 'Sérgio Andrade Leite', '61728394051', '(81) 99234-1100', 'Motorista de caminhão', 'emAnalise', SEM_NR35_EM_ANALISE],
  ['func-everton-lira', 'Everton Lira da Silva', '72839405162', '(81) 99345-2211', 'Motorista de caminhão', 'emAnalise', SEM_NR35_EM_ANALISE],
  ['func-claudio-moura', 'Cláudio Moura', '83940516273', '(81) 99456-3322', 'Operador de retroescavadeira', 'emAnalise', SEM_NR35_EM_ANALISE],
  ['func-ivanildo-reis', 'Ivanildo Reis', '94051627384', '(81) 99567-4433', 'Ajudante de carga', 'emAnalise', SEM_NR35_EM_ANALISE],
];

const ENGEMAX_VILA: readonly Linha[] = [
  ['func-diego-barreto', 'Diego Barreto Campos', '10293847561', '(81) 99678-5544', 'Montador de estruturas', 'emAnalise', TODOS_EM_ANALISE],
  ['func-thiago-arruda', 'Thiago Arruda', '29384756172', '(81) 99789-6655', 'Montador de estruturas', 'emAnalise', TODOS_EM_ANALISE],
  ['func-marcelo-pimentel', 'Marcelo Pimentel', '38475617283', '(81) 99890-7766', 'Soldador', 'emAnalise', TODOS_EM_ANALISE],
  ['func-anderson-freitas', 'Anderson Freitas Lopes', '47561728394', '(81) 99901-8877', 'Soldador', 'emAnalise', TODOS_EM_ANALISE],
  ['func-josias-carvalho', 'Josias Carvalho', '56172839405', '(81) 98012-9988', 'Encarregado de montagem', 'emAnalise', TODOS_EM_ANALISE],
  ['func-renato-guedes', 'Renato Guedes', '61728394016', '(81) 98123-0099', 'Ajudante', 'emAnalise', SEM_NR35_EM_ANALISE],
];

const ELETRICA_MIRANTE: readonly Linha[] = [
  ['func-gilberto-cavalcanti', 'Gilberto Ramos Cavalcanti', '13579246801', '(81) 98234-5612', 'Eletricista', 'aprovado', TODOS_APROVADOS],
  ['func-ricardo-ferraz', 'Ricardo Ferraz', '24681357902', '(81) 98345-6723', 'Eletricista', 'aprovado', TODOS_APROVADOS],
  ['func-jailson-moura', 'Jailson Moura', '35792468013', '(81) 98456-7834', 'Auxiliar de eletricista', 'aprovado', SEM_NR35_APROVADOS],
];

export const funcionarios: readonly Funcionario[] = [
  ...pessoas(remessa('rem-0911-construtora'), CONSTRUTORA_MIRANTE),
  ...pessoas(remessa('rem-0520-construtora'), CONSTRUTORA_JARDINS),
  ...pessoas(remessa('rem-0914-vale-verde'), VALE_VERDE_VILA),
  ...pessoas(remessa('rem-0915-engemax'), ENGEMAX_VILA),
  // O ASO de Gilberto venceu em 06/09 — vira pendência da Elétrica Aracaju no Mirante.
  ...pessoas(remessa('rem-0402-eletrica'), ELETRICA_MIRANTE).map((f) =>
    f.id === 'func-gilberto-cavalcanti'
      ? { ...f, documentos: documentos(f.nome, TODOS_APROVADOS, '2026-09-06') }
      : f,
  ),
];
