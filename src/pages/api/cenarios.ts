import { z } from 'zod';
import { acervoApi, type DocumentoAcervo } from '@/entities/acervo';
import { fornecedorApi } from '@/entities/fornecedor';
import { obraApi } from '@/entities/obra';
import { pendenciasApi } from '@/entities/pendencias';
import { http, PREFIXO, verificarSaude, type CodigoContrato } from '@/shared/api';
import { strings } from '@/shared/strings';

const t = strings.pages.api;

type ChaveRota = keyof typeof t.rotas;
type ChaveCenario = keyof typeof t.cenarios;

export type Cenario = {
  chave: ChaveCenario;
  /** Código forçado no MSW (cabeçalho X-Mock-Code) — para os erros que nenhuma entrada natural alcança. */
  forcar?: CodigoContrato;
  executar: () => Promise<unknown>;
};

export type Rota = { chave: ChaveRota; metodo: string; caminho: string; cenarios: Cenario[] };

/** Erro de montagem do cenário (faltou um dado para usar). Não é erro da API. */
export class SemDado extends Error {}

// ——— Dados de apoio, buscados na própria API (servem para o mock e para a API real) ———

const GUID_INEXISTENTE = 'ffffffff-ffff-4fff-bfff-ffffffffffff';
const qualquer = z.unknown();

let empresas: string[] | null = null;
async function idsEmpresas(): Promise<string[]> {
  empresas ??= (await fornecedorApi.listar({ porPagina: 50 })).itens.map((f) => f.id);
  return empresas;
}

async function primeiraEmpresa(): Promise<string> {
  const id = (await idsEmpresas())[0];
  if (!id) throw new SemDado(t.semDado('empresa'));
  return id;
}

/** Procura, nas empresas, um documento do acervo que satisfaça a condição. */
async function acharDocumento(cond: (d: DocumentoAcervo, escopo: 'empresa' | 'funcionario') => boolean, oque: string) {
  for (const empresa of await idsEmpresas()) {
    const grupos = await acervoApi.listar(empresa);
    for (const g of grupos) {
      const doc = g.documentos.find((d) => cond(d, g.escopo));
      if (doc) return { empresa, doc };
    }
  }
  throw new SemDado(t.semDado(oque));
}

const docQualquer = () => acharDocumento(() => true, 'documento');
const docNaoExpurgado = () => acharDocumento((d) => d.ultimoEnvio >= '2024-06', 'documento disponível');
const docExpurgado = () => acharDocumento((d) => d.ultimoEnvio < '2024-06', 'documento expurgado');
/** Exigência de empresa pendente (último envio não aprovado). */
const docPendente = () => acharDocumento((d, e) => e === 'empresa' && (d.status === 'emAnalise' || d.status === 'reprovado'), 'exigência pendente');
/** Exigência atendida: aprovada e sem validade (não vence). */
const docAtendido = () => acharDocumento((d, e) => e === 'empresa' && d.status === 'aprovado' && d.validade === null, 'exigência atendida');

/** CNPJ válido e novo a cada clique. */
function cnpjNovo(): string {
  const base = String(Date.now()).slice(-8).padStart(8, '0') + '0001';
  const dv = (s: string, pesos: number[]) => {
    const r = s.split('').reduce((n, c, i) => n + Number(c) * (pesos[i] ?? 0), 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = dv(`${base}${d1}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return `${base}${d1}${d2}`;
}

const cadastroValido = () => ({ razaoSocial: 'Empresa Teste da Verificação', cnpj: cnpjNovo(), telefone: '7933334444', email: 'teste@verificacao.com.br', tipos: ['servico' as const] });

const E = `${PREFIXO}/enterprises`;

// ——— Catálogo ———

export const ROTAS: readonly Rota[] = [
  { chave: 'health', metodo: 'GET', caminho: '/health', cenarios: [{ chave: 'ok', executar: () => verificarSaude() }] },
  {
    chave: 'cadastrar',
    metodo: 'POST',
    caminho: `${E}`,
    cenarios: [
      { chave: 'criado', executar: () => fornecedorApi.cadastrar(cadastroValido()) },
      { chave: 'v400', executar: () => http.json('POST', E, qualquer, { body: { enterpriseName: 'X', email: 'sem-arroba', enterpriseTypes: ['Outro'] } }) },
      {
        // Cadastra e repete o mesmo CNPJ (os CNPJs dos fornecedores do protótipo não têm dígito verificador válido).
        chave: 'v409',
        executar: async () => {
          const dados = cadastroValido();
          await fornecedorApi.cadastrar(dados);
          return fornecedorApi.cadastrar(dados);
        },
      },
      { chave: 'cnpj', executar: () => fornecedorApi.cadastrar({ ...cadastroValido(), cnpj: '11.222.333/0001-80' }) },
      { chave: 'phone', executar: () => fornecedorApi.cadastrar({ ...cadastroValido(), telefone: '0000000000' }) },
      { chave: 'email', executar: () => fornecedorApi.cadastrar({ ...cadastroValido(), email: 'contato@semponto' }) },
      {
        // Só espaços: passa no tamanho (400) e cai na regra de domínio. Vai cru, porque o mapper apara espaços.
        chave: 'nome',
        executar: () => http.json('POST', E, qualquer, { body: { enterpriseName: '     ', cnpj: cnpjNovo(), phone: '7933334444', email: 'a@b.com.br', enterpriseTypes: ['Servico'] } }),
      },
      { chave: 'tipoObrigatorio', forcar: 'ENTERPRISE_TYPE_REQUIRED', executar: () => fornecedorApi.cadastrar(cadastroValido()) },
      { chave: 'tipoInvalido', forcar: 'INVALID_ENTERPRISE_TYPE', executar: () => fornecedorApi.cadastrar(cadastroValido()) },
      { chave: 'v500', forcar: 'INTERNAL_ERROR', executar: () => fornecedorApi.cadastrar(cadastroValido()) },
    ],
  },
  {
    chave: 'listar',
    metodo: 'GET',
    caminho: E,
    cenarios: [
      { chave: 'ok', executar: () => fornecedorApi.listar({ porPagina: 5 }) },
      {
        chave: 'filtros',
        executar: async () => {
          const obra = (await obraApi.listar({ porPagina: 2 })).itens.map((o) => o.id);
          return fornecedorApi.listar({ tipo: 'material', bloqueado: false, obraIds: obra, porPagina: 10 });
        },
      },
      { chave: 'v400', executar: () => http.json('GET', E, qualquer, { query: { active: 'talvez' } }) },
      { chave: 'page', executar: () => fornecedorApi.listar({ pagina: 0 }) },
      { chave: 'pageSize', executar: () => fornecedorApi.listar({ porPagina: 51 }) },
    ],
  },
  {
    chave: 'detalhar',
    metodo: 'GET',
    caminho: `${E}/{enterpriseId}`,
    cenarios: [
      { chave: 'ok', executar: async () => fornecedorApi.detalhar(await primeiraEmpresa()) },
      { chave: 'v404', executar: () => fornecedorApi.detalhar(GUID_INEXISTENTE) },
      { chave: 'v404SemCorpo', executar: () => fornecedorApi.detalhar('abc') },
    ],
  },
  {
    chave: 'editar',
    metodo: 'PATCH',
    caminho: `${E}/{enterpriseId}`,
    cenarios: [
      { chave: 'semCorpo204', executar: async () => fornecedorApi.editar(await primeiraEmpresa(), { telefone: '(79) 3333-4444' }) },
      { chave: 'v400', executar: async () => http.json('PATCH', `${E}/${await primeiraEmpresa()}`, qualquer, { body: { email: 'x' } }) },
      { chave: 'v404', executar: () => fornecedorApi.editar(GUID_INEXISTENTE, { telefone: '7933334444' }) },
      { chave: 'phone', executar: async () => fornecedorApi.editar(await primeiraEmpresa(), { telefone: '12345' }) },
    ],
  },
  {
    chave: 'tipos',
    metodo: 'PUT',
    caminho: `${E}/{enterpriseId}/types`,
    cenarios: [
      { chave: 'semCorpo204', executar: async () => fornecedorApi.trocarTipos(await primeiraEmpresa(), ['material', 'servico']) },
      { chave: 'v400', executar: async () => http.json('PUT', `${E}/${await primeiraEmpresa()}/types`, qualquer, { body: { enterpriseTypes: [] } }) },
      { chave: 'v404', executar: () => fornecedorApi.trocarTipos(GUID_INEXISTENTE, ['servico']) },
    ],
  },
  {
    chave: 'status',
    metodo: 'PATCH',
    caminho: `${E}/{enterpriseId}/status`,
    cenarios: [
      { chave: 'semCorpo204', executar: async () => fornecedorApi.definirBloqueio(await primeiraEmpresa(), false) },
      { chave: 'v400', executar: async () => http.json('PATCH', `${E}/${await primeiraEmpresa()}/status`, qualquer, { body: {} }) },
      { chave: 'v404', executar: () => fornecedorApi.definirBloqueio(GUID_INEXISTENTE, true) },
    ],
  },
  {
    chave: 'obras',
    metodo: 'GET',
    caminho: `${PREFIXO}/constructions`,
    cenarios: [
      { chave: 'ok', executar: () => obraApi.listar() },
      { chave: 'filtros', executar: async () => obraApi.listar({ fornecedorId: await primeiraEmpresa() }) },
      { chave: 'v400', executar: () => http.json('GET', `${PREFIXO}/constructions`, qualquer, { query: { enterpriseId: 'abc' } }) },
      { chave: 'pageSize', executar: () => obraApi.listar({ porPagina: 100 }) },
    ],
  },
  {
    chave: 'acervo',
    metodo: 'GET',
    caminho: `${E}/{enterpriseId}/archive`,
    cenarios: [
      { chave: 'ok', executar: async () => acervoApi.listar((await docQualquer()).empresa) },
      {
        chave: 'filtros',
        executar: async () => acervoApi.listar((await acharDocumento((_d, e) => e === 'funcionario', 'documento de funcionário')).empresa, { escopo: 'funcionario', status: 'aprovado' }),
      },
      { chave: 'v400', executar: async () => http.json('GET', `${E}/${await primeiraEmpresa()}/archive`, qualquer, { query: { status: 'Aprovado' } }) },
      { chave: 'v404', executar: () => acervoApi.listar(GUID_INEXISTENTE) },
    ],
  },
  {
    chave: 'viewUrl',
    metodo: 'GET',
    caminho: `${E}/{enterpriseId}/archive/documents/{documentSubmissionId}/view-url`,
    cenarios: [
      {
        chave: 'ok',
        executar: async () => {
          const { empresa, doc } = await docNaoExpurgado();
          return acervoApi.linkVisualizacao(empresa, doc.id);
        },
      },
      { chave: 'v404', executar: async () => acervoApi.linkVisualizacao(await primeiraEmpresa(), GUID_INEXISTENTE) },
      {
        chave: 'v410',
        executar: async () => {
          const { empresa, doc } = await docExpurgado();
          return acervoApi.linkVisualizacao(empresa, doc.id);
        },
      },
    ],
  },
  {
    chave: 'lote',
    metodo: 'POST',
    caminho: `${E}/{enterpriseId}/archive/documents/batch-download`,
    cenarios: [
      {
        chave: 'ok',
        executar: async () => {
          const { empresa } = await docQualquer();
          const ids = (await acervoApi.listar(empresa)).flatMap((g) => g.documentos.map((d) => d.id)).slice(0, 5);
          return acervoApi.baixarEmLote(empresa, ids);
        },
      },
      { chave: 'v400', executar: async () => http.json('POST', `${E}/${await primeiraEmpresa()}/archive/documents/batch-download`, qualquer, { body: { documentSubmissionIds: ['abc'] } }) },
      { chave: 'v404', executar: async () => acervoApi.baixarEmLote(await primeiraEmpresa(), [GUID_INEXISTENTE]) },
      { chave: 'vazio', executar: async () => acervoApi.baixarEmLote(await primeiraEmpresa(), []) },
      {
        chave: 'grande',
        executar: async () => {
          const ids = Array.from({ length: 51 }, (_, i) => `aaaaaaaa-aaaa-4aaa-8aaa-${String(i).padStart(12, '0')}`);
          return acervoApi.baixarEmLote(await primeiraEmpresa(), ids);
        },
      },
    ],
  },
  { chave: 'painel', metodo: 'GET', caminho: `${PREFIXO}/pending-panel`, cenarios: [{ chave: 'ok', executar: () => pendenciasApi.painel() }] },
  {
    chave: 'postergar',
    metodo: 'POST',
    caminho: `${PREFIXO}/pending-panel/requirements/{documentSubmissionId}/postpone`,
    cenarios: [
      { chave: 'semCorpo204', executar: async () => pendenciasApi.postergar((await docPendente()).doc.id, { prazo: '2099-12-31', motivo: 'Aguardando emissão pelo órgão.' }) },
      { chave: 'jaPostergada', executar: async () => pendenciasApi.postergar((await docPendente()).doc.id, { prazo: '2099-12-31' }) },
      { chave: 'v400', executar: async () => http.json('POST', `${PREFIXO}/pending-panel/requirements/${(await docPendente()).doc.id}/postpone`, qualquer, { body: { deadlineAt: '30/11/2026' } }) },
      { chave: 'v404', executar: () => pendenciasApi.postergar(GUID_INEXISTENTE, { prazo: '2099-12-31' }) },
      { chave: 'naoPostergavel', executar: async () => pendenciasApi.postergar((await docAtendido()).doc.id, { prazo: '2099-12-31' }) },
      { chave: 'prazoPassado', executar: async () => pendenciasApi.postergar((await docPendente()).doc.id, { prazo: '2020-01-01' }) },
    ],
  },
  {
    chave: 'cancelar',
    metodo: 'POST',
    caminho: `${PREFIXO}/pending-panel/requirements/{documentSubmissionId}/cancel-postponement`,
    cenarios: [
      { chave: 'semCorpo204', executar: async () => pendenciasApi.cancelarPostergacao((await docPendente()).doc.id) },
      { chave: 'naoPostergada', executar: async () => pendenciasApi.cancelarPostergacao((await docPendente()).doc.id) },
      { chave: 'v404', executar: () => pendenciasApi.cancelarPostergacao(GUID_INEXISTENTE) },
    ],
  },
];
