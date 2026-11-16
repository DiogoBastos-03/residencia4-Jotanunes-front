import { documentosExigidos, statusDocumento, type Dataset, type StatusEnvio } from '@/entities';
import type { DocumentScope, DocumentSubmissionStatus } from '@/entities/acervo/schema';
import type { EnterpriseType } from '@/entities/fornecedor/schema';
import { datasetFicticio } from '../ficticio';
import { HOJE } from '../tempo';

/**
 * Banco em memória do MSW, montado a partir do conjunto fictício (src/mocks/ficticio.ts),
 * no formato da API. As mutações (cadastro, edição, postergação) vivem aqui e somem no F5.
 * As telas leem estes dados pela rede, como leriam da API real.
 */

/** "Hoje" do mock = o da demonstração (16/09/2026), para vencimentos e prazos baterem com as telas. */
export const HOJE_MOCK = HOJE;

const pad12 = (n: number) => String(n).padStart(12, '0');
/** GUIDs estáveis por família: e… empresa, c… obra, d… tipo de documento, 5… envio. */
export const guidDe = (familia: 'e' | 'c' | 'd' | '5', n: number) => `${familia}0000000-0000-4000-8000-${pad12(n)}`;

export type EmpresaMock = {
  enterpriseId: string;
  enterpriseName: string;
  cnpj: string;
  phone: string;
  email: string;
  types: EnterpriseType[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ObraMock = { constructionId: string; constructionName: string };

export type EnvioMock = {
  documentSubmissionId: string;
  enterpriseId: string;
  scope: DocumentScope;
  employeeName: string | null;
  employeeCpf: string | null;
  documentDefinitionId: string;
  documentDefinitionName: string;
  status: DocumentSubmissionStatus;
  competency: string | null;
  expiresAt: string | null;
  lastSendAt: string;
  /** Arquivo removido do storage: view-url dá 410 e o lote o deixa de fora. */
  purged: boolean;
};

export type PostergacaoMock = { deadlineAt: string; reason: string | undefined };

const STATUS: Readonly<Record<Exclude<StatusEnvio, 'pendente'>, DocumentSubmissionStatus>> = {
  aprovado: 'Approved',
  emAnalise: 'Pending',
  reprovado: 'Rejected',
};

/** "2026-09-14T08:42" (local da demo) → "2026-09-14T08:42:00Z". */
const utc = (iso: string) => (iso.length === 10 ? `${iso}T00:00:00Z` : `${iso.slice(0, 16)}:00Z`);

/** Antes disto, o arquivo foi expurgado (para DOCUMENT_PURGED ser alcançável). */
const LIMITE_EXPURGO = '2024-06-01';

const PREFIXOS = ['ficha-epi', 'rg-cnh', 'nr35', 'aso'];
function pessoaDoArquivo(nome: string): string {
  const semExt = nome.replace(/\.[a-z]+$/, '');
  const prefixo = PREFIXOS.find((p) => semExt.startsWith(`${p}-`));
  const slug = prefixo ? semExt.slice(prefixo.length + 1) : semExt;
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function montar(ds: Dataset) {
  const idEmpresa = new Map<string, string>();
  const empresas: EmpresaMock[] = ds.fornecedores.map((f, i) => {
    const id = guidDe('e', i + 1);
    idEmpresa.set(f.id, id);
    const criado = `${f.desde.slice(0, 10)}T12:00:00Z`;
    return {
      enterpriseId: id,
      enterpriseName: f.razaoSocial,
      cnpj: f.cnpj,
      phone: f.telefone,
      email: f.email,
      types: f.tipos.map((t): EnterpriseType => (t === 'material' ? 'Material' : 'Servico')),
      active: !f.bloqueado,
      createdAt: criado,
      updatedAt: criado,
    };
  });

  const idObra = new Map<string, string>();
  const obras: ObraMock[] = ds.obras.map((o, i) => {
    const id = guidDe('c', i + 1);
    idObra.set(o.id, id);
    return { constructionId: id, constructionName: o.nome };
  });

  const vinculos = ds.vinculos.flatMap((v) => {
    const e = idEmpresa.get(v.fornecedorId);
    const c = idObra.get(v.obraId);
    return e && c ? [{ enterpriseId: e, constructionId: c }] : [];
  });

  const idTipo = new Map<string, string>();
  ds.tiposDocumento.forEach((t, i) => idTipo.set(t.id, guidDe('d', i + 1)));
  const nomeTipo = (id: string) => ds.tiposDocumento.find((t) => t.id === id)?.nome ?? id;

  let seq = 0;
  const envios: EnvioMock[] = [];
  for (const d of ds.documentos) {
    const e = idEmpresa.get(d.fornecedorId);
    const def = idTipo.get(d.tipoDocumentoId);
    if (!e || !def || d.status === 'pendente' || !d.enviadoEm) continue;
    envios.push({
      documentSubmissionId: guidDe('5', ++seq),
      enterpriseId: e,
      scope: 'Enterprise',
      employeeName: null,
      employeeCpf: null,
      documentDefinitionId: def,
      documentDefinitionName: nomeTipo(d.tipoDocumentoId),
      status: STATUS[d.status],
      competency: null,
      expiresAt: d.validade ? utc(d.validade) : null,
      lastSendAt: utc(d.enviadoEm),
      purged: d.enviadoEm < LIMITE_EXPURGO,
    });
  }
  const cpfs = new Map<string, string>();
  for (const a of ds.arquivos) {
    const e = idEmpresa.get(a.fornecedorId);
    const def = idTipo.get(a.tipoDocumentoId);
    const envio = ds.envios.find((x) => x.id === a.envioId);
    if (!e || !def || !envio) continue;
    const nome = pessoaDoArquivo(a.nome);
    const chave = `${e}|${nome}`;
    if (!cpfs.has(chave)) cpfs.set(chave, `***.${String(100 + ((cpfs.size * 37) % 900))}.${String(100 + ((cpfs.size * 53) % 900))}-**`);
    envios.push({
      documentSubmissionId: guidDe('5', ++seq),
      enterpriseId: e,
      scope: 'Employee',
      employeeName: nome,
      employeeCpf: cpfs.get(chave) ?? null,
      documentDefinitionId: def,
      documentDefinitionName: nomeTipo(a.tipoDocumentoId),
      status: STATUS[a.status],
      competency: envio.enviadoEm.slice(0, 7),
      expiresAt: a.validade ? utc(a.validade) : null,
      lastSendAt: utc(envio.enviadoEm),
      purged: envio.enviadoEm < LIMITE_EXPURGO,
    });
  }

  return { empresas, obras, vinculos, envios, idEmpresa };
}

const ficticio = datasetFicticio();
const inicial = montar(ficticio);

/** Estado mutável do mock (some no F5). */
export const db = {
  empresas: inicial.empresas,
  obras: inicial.obras,
  vinculos: inicial.vinculos,
  envios: inicial.envios,
  postergacoes: new Map<string, PostergacaoMock>(),
  proximoId: inicial.empresas.length + 1,
};

/**
 * Situação de cada exigência de empresa (escopo Enterprise), para o painel de pendências.
 * Calculada com as mesmas regras das telas (src/entities/lib), a partir do dataset da demonstração.
 */
export function exigenciasDaEmpresa(enterpriseId: string): Array<{ situacao: 'pendente' | 'aVencer' | 'vencida' | 'atendida'; envioId: string | null }> {
  const ds = ficticio;
  const fornecedor = ds.fornecedores.find((f) => inicial.idEmpresa.get(f.id) === enterpriseId);
  if (!fornecedor) return [];
  return documentosExigidos(ds, fornecedor.id)
    .filter((x) => x.escopo === 'empresa' && x.obrigatoriedade === 'obrigatorio')
    .map((x) => {
      const doc = ds.documentos.find((d) => d.fornecedorId === fornecedor.id && d.tipoDocumentoId === x.tipoDocumentoId);
      const s = statusDocumento(doc, HOJE_MOCK);
      const envio = db.envios.find((e) => e.enterpriseId === enterpriseId && e.scope === 'Enterprise' && e.documentDefinitionName === x.nome) ?? null;
      const situacao = s === 'venceEmBreve' ? 'aVencer' : s === 'vencido' ? 'vencida' : s === 'aprovado' ? 'atendida' : 'pendente';
      return { situacao, envioId: envio?.documentSubmissionId ?? null };
    });
}
