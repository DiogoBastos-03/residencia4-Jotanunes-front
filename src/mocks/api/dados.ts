import type { DocumentScope, DocumentSubmissionStatus } from '@/entities/acervo/schema';
import type { EnterpriseType } from '@/entities/fornecedor/schema';
import { DEFINICOES, EMPRESAS, FUNCIONARIOS, HOJE_MOCK, OBRAS, VINCULOS } from './fixtures';

export { HOJE_MOCK };

/**
 * Banco em memória do MSW, montado a partir de ./fixtures.ts no formato da API.
 * As mutações (cadastro, edição, postergação) vivem aqui e somem no F5.
 * As telas leem estes dados pela rede, como leriam da API real.
 */

const pad12 = (n: number) => String(n).padStart(12, '0');
/** GUIDs estáveis por família: e… empresa, c… obra, d… definição de documento, 5… envio. */
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

/** FNV-1a: o mesmo índice dá sempre o mesmo envio. */
function sorteio(...partes: Array<string | number>): number {
  let h = 0x811c9dc5;
  for (const c of partes.join('|')) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
  return h;
}

function somarDias(dia: string, n: number): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const utc = (dia: string, hora = '10:00') => `${dia}T${hora}:00Z`;

/** Antes disto, o arquivo foi expurgado (para DOCUMENT_PURGED ser alcançável). */
const LIMITE_EXPURGO = '2024-06-01';

const ENTERPRISE = DEFINICOES.map((d, i) => ({ ...d, id: guidDe('d', i + 1) })).filter((d) => d.escopo === 'Enterprise');
const EMPLOYEE = DEFINICOES.map((d, i) => ({ ...d, id: guidDe('d', i + 1) })).filter((d) => d.escopo === 'Employee');

/**
 * Situação de cada definição de empresa para uma empresa. Sorteio fixo por (empresa, definição):
 * aprovado (válido, vencendo ou vencido), em análise, reprovado, nunca enviado, ou aprovado
 * antigo e expurgado.
 */
type Sorteada = { status: DocumentSubmissionStatus; enviadoEm: string; validade: string | null } | null;
function sortearEnvio(empresa: number, definicao: number): Sorteada {
  const r = sorteio(empresa, definicao) % 20;
  if (r < 2) return null;
  if (r === 2) return { status: 'Approved', enviadoEm: '2024-03-12', validade: somarDias(HOJE_MOCK, -400) };
  if (r < 5) return { status: 'Pending', enviadoEm: somarDias(HOJE_MOCK, -(1 + (r % 5))), validade: null };
  if (r < 7) return { status: 'Rejected', enviadoEm: somarDias(HOJE_MOCK, -(3 + r)), validade: null };
  if (r < 9) return { status: 'Approved', enviadoEm: somarDias(HOJE_MOCK, -380), validade: somarDias(HOJE_MOCK, -(5 + r)) };
  if (r < 12) return { status: 'Approved', enviadoEm: somarDias(HOJE_MOCK, -330), validade: somarDias(HOJE_MOCK, 3 + r) };
  return { status: 'Approved', enviadoEm: somarDias(HOJE_MOCK, -(20 + r * 9)), validade: somarDias(HOJE_MOCK, 60 + r * 11) };
}

function montar() {
  const empresas: EmpresaMock[] = EMPRESAS.map((e, i) => {
    const criado = utc(e.desde, '12:00');
    return {
      enterpriseId: guidDe('e', i + 1),
      enterpriseName: e.nome,
      cnpj: e.cnpj,
      phone: `813${String(2000000 + i * 7919).slice(-7)}`,
      email: `contato@${e.dominio}`,
      types: [e.tipo],
      active: !e.bloqueada,
      createdAt: criado,
      updatedAt: criado,
    };
  });
  const obras: ObraMock[] = OBRAS.map((nome, i) => ({ constructionId: guidDe('c', i + 1), constructionName: nome }));
  const vinculos = VINCULOS.flatMap(([e, c]) => {
    const empresa = empresas[e];
    const obra = obras[c];
    return empresa && obra ? [{ enterpriseId: empresa.enterpriseId, constructionId: obra.constructionId }] : [];
  });

  let seq = 0;
  const envios: EnvioMock[] = [];
  empresas.forEach((empresa, i) => {
    ENTERPRISE.forEach((def, j) => {
      const s = sortearEnvio(i, j);
      if (!s) return;
      envios.push({
        documentSubmissionId: guidDe('5', ++seq),
        enterpriseId: empresa.enterpriseId,
        scope: 'Enterprise',
        employeeName: null,
        employeeCpf: null,
        documentDefinitionId: def.id,
        documentDefinitionName: def.nome,
        status: s.status,
        competency: null,
        expiresAt: s.validade ? utc(s.validade, '00:00') : null,
        lastSendAt: utc(s.enviadoEm),
        purged: s.enviadoEm < LIMITE_EXPURGO,
      });
    });
    // Documentos de funcionário só nas empresas de serviço.
    if (!empresa.types.includes('Servico')) return;
    FUNCIONARIOS.slice(0, 2 + (i % 4)).forEach((nome, k) => {
      EMPLOYEE.forEach((def, j) => {
        const r = sorteio(i, k, j, 'func') % 10;
        const enviadoEm = somarDias(HOJE_MOCK, -(2 + r * 7));
        envios.push({
          documentSubmissionId: guidDe('5', ++seq),
          enterpriseId: empresa.enterpriseId,
          scope: 'Employee',
          employeeName: nome,
          employeeCpf: `***.${String(100 + ((i * 37 + k * 11) % 900))}.${String(100 + ((i * 53 + k * 7) % 900))}-**`,
          documentDefinitionId: def.id,
          documentDefinitionName: def.nome,
          status: r < 6 ? 'Approved' : r < 8 ? 'Pending' : 'Rejected',
          competency: enviadoEm.slice(0, 7),
          expiresAt: r < 6 ? utc(somarDias(HOJE_MOCK, 30 + r * 40), '00:00') : null,
          lastSendAt: utc(enviadoEm),
          purged: false,
        });
      });
    });
  });

  return { empresas, obras, vinculos, envios };
}

const inicial = montar();

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
 * Situação de cada exigência de empresa (escopo Enterprise), para o painel de pendências:
 * nunca enviada ou não aprovada → pendente; aprovada vencida → vencida; vencendo em até 30 dias → aVencer.
 */
export function exigenciasDaEmpresa(enterpriseId: string): Array<{ situacao: 'pendente' | 'aVencer' | 'vencida' | 'atendida'; envioId: string | null }> {
  if (!db.empresas.some((e) => e.enterpriseId === enterpriseId)) return [];
  const limite = somarDias(HOJE_MOCK, 30);
  return ENTERPRISE.map((def) => {
    const envio = db.envios.find((e) => e.enterpriseId === enterpriseId && e.scope === 'Enterprise' && e.documentDefinitionId === def.id) ?? null;
    if (!envio || envio.status !== 'Approved') return { situacao: 'pendente', envioId: envio?.documentSubmissionId ?? null };
    const validade = envio.expiresAt?.slice(0, 10) ?? null;
    const situacao = validade === null ? 'atendida' : validade < HOJE_MOCK ? 'vencida' : validade <= limite ? 'aVencer' : 'atendida';
    return { situacao, envioId: envio.documentSubmissionId };
  });
}
