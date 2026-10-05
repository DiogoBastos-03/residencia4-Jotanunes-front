import type { ArquivoFuncionario, DecisaoRegistrada, DocumentoExigido, EnvioArquivos, Fornecedor } from '@/entities';

type Status = ArquivoFuncionario['status'];

const ANALISTAS = ['Marina Duarte', 'Rodrigo Alves', 'Camila Rocha'] as const;

/** Nomes que aparecem nos arquivos — o arquivo se identifica pelo próprio nome. */
const PESSOAS = [
  'jose-souza', 'marcos-lima', 'antonio-silva', 'rafael-barbosa', 'edson-santos', 'paulo-nogueira', 'cicero-costa',
  'joao-ferreira', 'manoel-pinheiro', 'francisco-melo', 'adriano-rocha', 'wellington-duarte', 'genival-santana',
  'luiz-tavares', 'roberto-macena', 'sergio-leite', 'everton-lira', 'claudio-moura', 'ivanildo-reis', 'diego-campos',
  'thiago-arruda', 'marcelo-pimentel', 'anderson-lopes', 'josias-carvalho', 'renato-guedes', 'gilberto-cavalcanti',
  'ricardo-ferraz', 'jailson-moura', 'fabio-medeiros', 'heitor-gondim',
] as const;

const PREFIXO: Record<string, string> = { aso: 'aso', epi: 'ficha-epi', 'rg-cnh': 'rg-cnh', nr35: 'nr35' };
const VALIDADES = ['2027-03-12', '2027-04-08', '2027-05-21', '2027-06-14', '2027-07-02', '2027-08-19', '2027-09-05'];

function somarUmDia(iso: string, hora: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${hora}`;
}

type Lote = {
  envio: EnvioArquivos;
  /** Pessoas do lote, em ordem; cada uma vira um arquivo. */
  pessoas: readonly string[];
  /** Status por posição; o que faltar é "aprovado". */
  status?: Partial<Record<number, Status>>;
  comValidade: boolean;
  /** Validade fixa para uma posição (ex.: um ASO já vencido). */
  validadeEm?: Partial<Record<number, string>>;
  decisoes?: Partial<Record<number, DecisaoRegistrada>>;
};

function arquivosDoLote(lote: Lote, base: number): ArquivoFuncionario[] {
  const { envio } = lote;
  return lote.pessoas.map((pessoa, i) => {
    const status = lote.status?.[i] ?? 'aprovado';
    const validade = lote.comValidade ? (lote.validadeEm?.[i] ?? VALIDADES[(i + base) % VALIDADES.length]) : undefined;
    const decisao =
      lote.decisoes?.[i] ??
      (status === 'emAnalise'
        ? undefined
        : { por: ANALISTAS[(i + base) % ANALISTAS.length] ?? 'Marina Duarte', em: somarUmDia(envio.enviadoEm, `${String(9 + (i % 7)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`) });
    return {
      id: `arq-${envio.id}-${i + 1}`,
      envioId: envio.id,
      fornecedorId: envio.fornecedorId,
      tipoDocumentoId: envio.tipoDocumentoId,
      nome: `${PREFIXO[envio.tipoDocumentoId] ?? envio.tipoDocumentoId}-${pessoa}.${envio.tipoDocumentoId === 'rg-cnh' ? 'jpg' : 'pdf'}`,
      tamanhoKb: 140 + ((i * 53 + base * 17) % 900),
      status,
      validadeInformada: validade,
      validade: status === 'aprovado' ? validade : undefined,
      decisao,
    };
  });
}

/** Lotes com situação específica — o do protótipo e os que alimentam a fila e as pendências. */
const LOTES: readonly Lote[] = [
  // ASO dos funcionários da Construtora Exemplo: 12 arquivos, 9 aprovados, 2 em análise, 1 reprovado.
  {
    envio: { id: 'env-0911-construtora-aso', fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'aso', enviadoEm: '2026-09-11T14:03', prioridade: 'urgente' },
    pessoas: ['jose-souza', 'marcos-lima', 'antonio-silva', 'rafael-barbosa', 'edson-santos', 'paulo-nogueira', 'cicero-costa', 'joao-ferreira', 'manoel-pinheiro', 'francisco-melo', 'adriano-rocha', 'wellington-duarte'],
    status: { 1: 'emAnalise', 5: 'emAnalise', 11: 'reprovado' },
    comValidade: true,
    decisoes: { 11: { por: 'Rodrigo Alves', em: '2026-09-16T13:48', motivo: 'ilegivel', observacao: 'O arquivo está cortado na metade de baixo. Envie o ASO inteiro, com o carimbo do médico.' } },
  },
  {
    envio: { id: 'env-0520-construtora-epi', fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'epi', enviadoEm: '2026-05-20T09:40', prioridade: 'normal' },
    pessoas: PESSOAS.slice(0, 12),
    comValidade: false,
  },
  {
    envio: { id: 'env-0520-construtora-rg', fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'rg-cnh', enviadoEm: '2026-05-20T09:42', prioridade: 'normal' },
    pessoas: PESSOAS.slice(0, 12),
    comValidade: false,
  },
  {
    envio: { id: 'env-0520-construtora-nr35', fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'nr35', enviadoEm: '2026-05-20T09:45', prioridade: 'normal' },
    pessoas: ['jose-souza', 'antonio-silva', 'edson-santos', 'cicero-costa', 'joao-ferreira', 'adriano-rocha'],
    comValidade: true,
  },
  // Elétrica Aracaju: um ASO venceu em 06/09 — vira pendência no Mirante.
  {
    envio: { id: 'env-0402-eletrica-aso', fornecedorId: 'eletrica-aracaju', tipoDocumentoId: 'aso', enviadoEm: '2026-04-02T15:10', prioridade: 'normal' },
    pessoas: ['gilberto-cavalcanti', 'ricardo-ferraz', 'jailson-moura', 'fabio-medeiros', 'heitor-gondim'],
    comValidade: true,
    validadeEm: { 0: '2026-09-06' },
  },
  // Engemax: renovação dos ASOs em análise.
  {
    envio: { id: 'env-1010-engemax-aso', fornecedorId: 'engemax', tipoDocumentoId: 'aso', enviadoEm: '2025-10-10T10:00', prioridade: 'normal' },
    pessoas: ['diego-campos', 'thiago-arruda', 'marcelo-pimentel', 'anderson-lopes', 'josias-carvalho', 'renato-guedes'],
    comValidade: true,
    validadeEm: { 0: '2026-12-10', 1: '2026-12-10', 2: '2026-12-10', 3: '2026-12-10', 4: '2026-12-10', 5: '2026-12-10' },
  },
  {
    envio: { id: 'env-0915-engemax-aso', fornecedorId: 'engemax', tipoDocumentoId: 'aso', enviadoEm: '2026-09-15T08:20', prioridade: 'normal' },
    pessoas: ['diego-campos', 'thiago-arruda', 'marcelo-pimentel', 'anderson-lopes', 'josias-carvalho', 'renato-guedes'],
    status: { 0: 'emAnalise', 1: 'emAnalise', 2: 'emAnalise', 3: 'emAnalise', 4: 'emAnalise', 5: 'emAnalise' },
    comValidade: true,
  },
  // Transportes Vale Verde: fichas de EPI novas em análise.
  {
    envio: { id: 'env-0914-vale-verde-epi', fornecedorId: 'transportes-vale-verde', tipoDocumentoId: 'epi', enviadoEm: '2026-09-14T10:15', prioridade: 'normal' },
    pessoas: ['sergio-leite', 'everton-lira', 'claudio-moura', 'ivanildo-reis'],
    status: { 0: 'emAnalise', 1: 'emAnalise', 2: 'emAnalise', 3: 'emAnalise' },
    comValidade: false,
  },
];

/** Fornecedores sem nenhum arquivo enviado (aparecem como pendência). */
const SEM_ARQUIVOS = new Set(['pinturas-litoral', 'impermeabilizadora-capibaribe']);

/**
 * Monta envios e arquivos: os lotes específicos e, para os demais documentos de funcionário
 * obrigatórios, um envio aprovado com alguns arquivos.
 */
export function montarArquivos(
  fornecedores: readonly Fornecedor[],
  exigidosDe: (fornecedorId: string) => DocumentoExigido[],
): { envios: EnvioArquivos[]; arquivos: ArquivoFuncionario[] } {
  const envios: EnvioArquivos[] = [];
  const arquivos: ArquivoFuncionario[] = [];

  LOTES.forEach((lote, i) => {
    envios.push(lote.envio);
    arquivos.push(...arquivosDoLote(lote, i));
  });

  fornecedores.forEach((fornecedor, fi) => {
    if (SEM_ARQUIVOS.has(fornecedor.id)) return;
    exigidosDe(fornecedor.id)
      .filter((d) => d.escopo === 'funcionario')
      .forEach((exigido, di) => {
        const jaTem = LOTES.some((l) => l.envio.fornecedorId === fornecedor.id && l.envio.tipoDocumentoId === exigido.tipoDocumentoId);
        if (jaTem || (exigido.obrigatoriedade === 'opcional' && fi % 2 === 1)) return;
        const quantidade = 3 + ((fi + di) % 6);
        const inicio = (fi * 3 + di) % (PESSOAS.length - quantidade);
        const lote: Lote = {
          envio: {
            id: `env-${fornecedor.id}-${exigido.tipoDocumentoId}`,
            fornecedorId: fornecedor.id,
            tipoDocumentoId: exigido.tipoDocumentoId,
            enviadoEm: `${fornecedor.desde}T${String(9 + (di % 8)).padStart(2, '0')}:15`,
            prioridade: 'normal',
          },
          pessoas: PESSOAS.slice(inicio, inicio + quantidade),
          comValidade: exigido.item.validade === 'comData',
        };
        envios.push(lote.envio);
        arquivos.push(...arquivosDoLote(lote, fi + di));
      });
  });

  return { envios, arquivos };
}
