import { z } from 'zod';
import { acervoApi, type DocumentoAcervo } from '@/entities/acervo';
import { listaApi } from '@/entities/exigencias';
import { tipoDocumentoApi } from '@/entities/tipoDocumento';
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
const docPendente = () => acharDocumento((d, e) => e === 'empresa' && d.status === 'emAnalise', 'exigência pendente');
/** Outra pendente (reprovada), para o cenário do prazo no passado não esbarrar na que já foi postergada. */
const docReprovado = () => acharDocumento((d, e) => e === 'empresa' && d.status === 'reprovado', 'exigência reprovada');
/** Exigência atendida: aprovada e ainda válida. */
const docAtendido = () =>
  acharDocumento((d, e) => e === 'empresa' && d.status === 'aprovado' && (d.validade === null || d.validade > new Date().toISOString().slice(0, 10)), 'exigência atendida');

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

// ——— Vínculo empresa ↔ obra: pares buscados na própria API ———

async function primeiraObra(): Promise<string> {
  const id = (await obraApi.listar({ porPagina: 50 })).itens[0]?.id;
  if (!id) throw new SemDado(t.semDado('obra'));
  return id;
}

/** Uma empresa já vinculada à primeira obra (para o 409 e para escolher quem não está). */
async function vinculoExistente(): Promise<{ obraId: string; fornecedorId: string }> {
  const obraId = await primeiraObra();
  const fornecedorId = (await fornecedorApi.listar({ obraIds: [obraId], porPagina: 50 })).itens[0]?.id;
  if (!fornecedorId) throw new SemDado(t.semDado('empresa vinculada a uma obra'));
  return { obraId, fornecedorId };
}

/** Uma empresa ativa que ainda não está na primeira obra. */
async function vinculoLivre(): Promise<{ obraId: string; fornecedorId: string }> {
  const obraId = await primeiraObra();
  const naObra = new Set((await fornecedorApi.listar({ obraIds: [obraId], porPagina: 50 })).itens.map((f) => f.id));
  const livre = (await fornecedorApi.listar({ bloqueado: false, porPagina: 50 })).itens.find((f) => !naObra.has(f.id));
  if (!livre) throw new SemDado(t.semDado('empresa ativa fora da obra'));
  return { obraId, fornecedorId: livre.id };
}

const VINCULO = (obraId: string) => `${PREFIXO}/construction/constructions/${obraId}/enterprises`;

// ——— Módulo workflow: dados de apoio buscados na própria API ———

const W = `${PREFIXO}/workflow`;
const LISTA_INEXISTENTE = 999999;

async function primeiroTipoDoc() {
  const d = (await tipoDocumentoApi.listar({ porPagina: 50 })).itens[0];
  if (!d) throw new SemDado(t.semDado('tipo de documento'));
  return d;
}

async function doisTiposDoc() {
  const [a, b] = (await tipoDocumentoApi.listar({ porPagina: 50 })).itens;
  if (!a || !b) throw new SemDado(t.semDado('dois tipos de documento'));
  return [a, b] as const;
}

async function primeiraLista() {
  const l = (await listaApi.listar({ porPagina: 50 })).itens[0];
  if (!l) throw new SemDado(t.semDado('lista de exigências'));
  return l;
}

/** Uma obra que já usa alguma lista (para os 409 do vínculo). */
async function obraComLista() {
  for (const o of (await obraApi.listar({ porPagina: 50 })).itens) {
    const listas = await listaApi.daObra(o.id);
    if (listas[0]) return { obraId: o.id, lista: listas[0] };
  }
  throw new SemDado(t.semDado('obra com lista de exigências'));
}

let sequencia = 0;
/** Nome de teste único: a API real não tem exclusão, então tudo que for criado fica marcado como teste. */
const marca = () => `TESTE /_api ${new Date().toISOString().slice(0, 19)} #${++sequencia}`;

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
    chave: 'vincular',
    metodo: 'POST',
    caminho: `${PREFIXO}/construction/constructions/{constructionId}/enterprises`,
    cenarios: [
      {
        // Deixa o banco como estava: vincula, guarda a resposta e remove o vínculo criado.
        chave: 'vinculoCriado',
        executar: async () => {
          const v = await vinculoLivre();
          const r = await obraApi.vincularFornecedor(v.obraId, { fornecedorId: v.fornecedorId, prazoDias: 30 });
          await obraApi.desvincularFornecedor(v.obraId, v.fornecedorId);
          return r;
        },
      },
      { chave: 'v400', executar: async () => http.json('POST', VINCULO(await primeiraObra()), qualquer, { body: {} }) },
      { chave: 'obraInexistente', executar: async () => obraApi.vincularFornecedor(GUID_INEXISTENTE, { fornecedorId: (await vinculoLivre()).fornecedorId, prazoDias: 30 }) },
      { chave: 'empresaInexistente', executar: async () => obraApi.vincularFornecedor(await primeiraObra(), { fornecedorId: GUID_INEXISTENTE, prazoDias: 30 }) },
      {
        chave: 'jaNaObra',
        executar: async () => {
          const v = await vinculoExistente();
          return obraApi.vincularFornecedor(v.obraId, { fornecedorId: v.fornecedorId, prazoDias: 30 });
        },
      },
      {
        chave: 'empresaInativa',
        executar: async () => {
          const obraId = await primeiraObra();
          const bloqueada = (await fornecedorApi.listar({ bloqueado: true, porPagina: 50 })).itens[0];
          if (!bloqueada) throw new SemDado(t.semDado('empresa bloqueada'));
          return obraApi.vincularFornecedor(obraId, { fornecedorId: bloqueada.id, prazoDias: 30 });
        },
      },
      // O [Range(1, 9999)] do request dá 400 antes; o 422 do domínio só sai forçado no mock.
      { chave: 'prazoInvalido', forcar: 'INVALID_LIMIT_EXPIRES_DAYS', executar: async () => obraApi.vincularFornecedor(await primeiraObra(), { fornecedorId: GUID_INEXISTENTE, prazoDias: 30 }) },
      { chave: 'v404SemCorpo', executar: () => http.json('POST', VINCULO('abc'), qualquer, { body: {} }) },
    ],
  },
  {
    chave: 'desvincular',
    metodo: 'DELETE',
    caminho: `${PREFIXO}/construction/constructions/{constructionId}/enterprises/{enterpriseId}`,
    cenarios: [
      {
        chave: 'vinculoRemovido',
        executar: async () => {
          const v = await vinculoLivre();
          await obraApi.vincularFornecedor(v.obraId, { fornecedorId: v.fornecedorId, prazoDias: 30 });
          return obraApi.desvincularFornecedor(v.obraId, v.fornecedorId);
        },
      },
      {
        chave: 'naoEstaNaObra',
        executar: async () => {
          const v = await vinculoLivre();
          return obraApi.desvincularFornecedor(v.obraId, v.fornecedorId);
        },
      },
    ],
  },
  {
    chave: 'formatos',
    metodo: 'GET',
    caminho: `${W}/document-formats`,
    cenarios: [{ chave: 'ok', executar: () => tipoDocumentoApi.listarFormatos() }],
  },
  {
    chave: 'tiposDoc',
    metodo: 'GET',
    caminho: `${W}/document-definitions`,
    cenarios: [
      { chave: 'ok', executar: () => tipoDocumentoApi.listar() },
      { chave: 'filtros', executar: async () => tipoDocumentoApi.listar({ nome: (await primeiroTipoDoc()).nome.slice(0, 2) }) },
      { chave: 'pageSize', executar: () => tipoDocumentoApi.listar({ porPagina: 100 }) },
    ],
  },
  {
    chave: 'tipoDocDetalhe',
    metodo: 'GET',
    caminho: `${W}/document-definitions/{id}`,
    cenarios: [
      { chave: 'ok', executar: async () => tipoDocumentoApi.detalhar((await primeiroTipoDoc()).id) },
      { chave: 'docInexistente', executar: () => tipoDocumentoApi.detalhar(GUID_INEXISTENTE) },
    ],
  },
  {
    chave: 'tipoDocCriar',
    metodo: 'POST',
    caminho: `${W}/document-definitions`,
    cenarios: [
      {
        chave: 'criadoGrava',
        executar: () => tipoDocumentoApi.criar({ nome: marca(), descricao: 'Criado pela /_api', tamanhoMaxBytes: 1048576, reaproveitavel: false, validadeDias: 30, formatoIds: [1] }),
      },
      { chave: 'v400', executar: () => http.json('POST', `${W}/document-definitions`, qualquer, { body: {} }) },
      {
        chave: 'nomeRepetido',
        executar: async () => tipoDocumentoApi.criar({ nome: (await primeiroTipoDoc()).nome, descricao: '', tamanhoMaxBytes: 1000, reaproveitavel: false, validadeDias: null, formatoIds: [1] }),
      },
      { chave: 'tamanhoInvalido', executar: () => tipoDocumentoApi.criar({ nome: marca(), descricao: '', tamanhoMaxBytes: 0, reaproveitavel: false, validadeDias: null, formatoIds: [1] }) },
      { chave: 'validadeInvalida', executar: () => tipoDocumentoApi.criar({ nome: marca(), descricao: '', tamanhoMaxBytes: 1000, reaproveitavel: false, validadeDias: 0, formatoIds: [1] }) },
      { chave: 'formatosObrigatorios', executar: () => tipoDocumentoApi.criar({ nome: marca(), descricao: '', tamanhoMaxBytes: 1000, reaproveitavel: false, validadeDias: null, formatoIds: [0] }) },
      { chave: 'formatoInexistente', executar: () => tipoDocumentoApi.criar({ nome: marca(), descricao: '', tamanhoMaxBytes: 1000, reaproveitavel: false, validadeDias: null, formatoIds: [99] }) },
    ],
  },
  {
    chave: 'tipoDocEditar',
    metodo: 'PATCH',
    caminho: `${W}/document-definitions/{id}`,
    cenarios: [
      { chave: 'semMudanca204', executar: async () => http.semCorpo('PATCH', `${W}/document-definitions/${(await primeiroTipoDoc()).id}`, { body: {} }) },
      { chave: 'docInexistente', executar: () => http.semCorpo('PATCH', `${W}/document-definitions/${GUID_INEXISTENTE}`, { body: { name: 'x' } }) },
      { chave: 'validadeDupla', executar: async () => http.semCorpo('PATCH', `${W}/document-definitions/${(await primeiroTipoDoc()).id}`, { body: { expiresInDays: 10, neverExpires: true } }) },
      {
        chave: 'nomeRepetido',
        executar: async () => {
          const [a, b] = await doisTiposDoc();
          return http.semCorpo('PATCH', `${W}/document-definitions/${a.id}`, { body: { name: b.nome } });
        },
      },
    ],
  },
  {
    chave: 'listas',
    metodo: 'GET',
    caminho: `${W}/workflows`,
    cenarios: [
      { chave: 'ok', executar: () => listaApi.listar() },
      { chave: 'filtros', executar: () => listaApi.listar({ tipo: 'material', nome: 'padr' }) },
      { chave: 'v400', executar: () => http.json('GET', `${W}/workflows`, qualquer, { query: { type: 'Outro' } }) },
    ],
  },
  {
    chave: 'listaDetalhe',
    metodo: 'GET',
    caminho: `${W}/workflows/{workFlowId}`,
    cenarios: [
      { chave: 'ok', executar: async () => listaApi.detalhar((await primeiraLista()).id) },
      { chave: 'listaInexistente', executar: () => listaApi.detalhar(LISTA_INEXISTENTE) },
      { chave: 'semVersao', forcar: 'WORKFLOW_WITHOUT_VERSION', executar: async () => listaApi.detalhar((await primeiraLista()).id) },
    ],
  },
  {
    chave: 'listaVersoes',
    metodo: 'GET',
    caminho: `${W}/workflows/{workFlowId}/versions`,
    cenarios: [
      { chave: 'ok', executar: async () => listaApi.versoes((await primeiraLista()).id) },
      { chave: 'listaInexistente', executar: () => listaApi.versoes(LISTA_INEXISTENTE) },
    ],
  },
  {
    chave: 'listaCriar',
    metodo: 'POST',
    caminho: `${W}/workflows`,
    cenarios: [
      { chave: 'criadoGrava', executar: async () => listaApi.criar({ nome: marca(), tipo: 'material', exigencias: [{ definicaoId: (await primeiroTipoDoc()).id, obrigatoria: true }] }) },
      { chave: 'v400', executar: () => http.json('POST', `${W}/workflows`, qualquer, { body: {} }) },
      {
        chave: 'docInexistente',
        executar: () => listaApi.criar({ nome: marca(), tipo: 'material', exigencias: [{ definicaoId: GUID_INEXISTENTE, obrigatoria: true }] }),
      },
      {
        chave: 'duplicado',
        executar: async () => {
          const d = await primeiroTipoDoc();
          return http.json('POST', `${W}/workflows`, qualquer, {
            body: { name: marca(), type: 'Material', documents: [{ documentDefinitionId: d.id, displayOrder: 1, required: true }, { documentDefinitionId: d.id, displayOrder: 2, required: true }] },
          });
        },
      },
      {
        chave: 'ordemRepetida',
        executar: async () => {
          const [a, b] = await doisTiposDoc();
          return http.json('POST', `${W}/workflows`, qualquer, {
            body: { name: marca(), type: 'Material', documents: [{ documentDefinitionId: a.id, displayOrder: 1, required: true }, { documentDefinitionId: b.id, displayOrder: 1, required: true }] },
          });
        },
      },
      {
        chave: 'obraSemPrazo',
        executar: async () => {
          const d = await primeiroTipoDoc();
          const obraId = await primeiraObra();
          return http.json('POST', `${W}/workflows`, qualquer, { body: { name: marca(), type: 'Material', constructionId: obraId, documents: [{ documentDefinitionId: d.id, displayOrder: 1, required: true }] } });
        },
      },
      {
        chave: 'tipoNaObra',
        executar: async () => {
          const { obraId, lista } = await obraComLista();
          return listaApi.criar({ nome: marca(), tipo: lista.tipo, exigencias: [{ definicaoId: (await primeiroTipoDoc()).id, obrigatoria: true }], obra: { id: obraId, prazoDias: 30 } });
        },
      },
      {
        chave: 'obraInexistente',
        executar: async () => listaApi.criar({ nome: marca(), tipo: 'material', exigencias: [{ definicaoId: (await primeiroTipoDoc()).id, obrigatoria: true }], obra: { id: GUID_INEXISTENTE, prazoDias: 30 } }),
      },
      { chave: 'nomeLista', forcar: 'INVALID_WORKFLOW_NAME', executar: async () => listaApi.criar({ nome: marca(), tipo: 'material', exigencias: [{ definicaoId: (await primeiroTipoDoc()).id, obrigatoria: true }] }) },
    ],
  },
  {
    chave: 'listaRenomear',
    metodo: 'PATCH',
    caminho: `${W}/workflows/{workFlowId}`,
    cenarios: [
      {
        chave: 'renomeiaGrava',
        executar: async () => {
          const l = await primeiraLista();
          return listaApi.renomear(l.id, l.nome);
        },
      },
      { chave: 'v400', executar: async () => http.semCorpo('PATCH', `${W}/workflows/${(await primeiraLista()).id}`, { body: { name: '   ' } }) },
      { chave: 'listaInexistente', executar: () => listaApi.renomear(LISTA_INEXISTENTE, 'x') },
    ],
  },
  {
    chave: 'listaExigencias',
    metodo: 'PUT',
    caminho: `${W}/workflows/{workFlowId}/requirements`,
    cenarios: [
      {
        chave: 'mesmaVersao',
        executar: async () => {
          const l = await listaApi.detalhar((await primeiraLista()).id);
          return listaApi.editarExigencias(l.id, l.vigente.exigencias.map((e) => ({ definicaoId: e.definicaoId, obrigatoria: e.obrigatoria })));
        },
      },
      { chave: 'v400', executar: async () => http.json('PUT', `${W}/workflows/${(await primeiraLista()).id}/requirements`, qualquer, { body: {} }) },
      { chave: 'listaInexistente', executar: async () => listaApi.editarExigencias(LISTA_INEXISTENTE, [{ definicaoId: (await primeiroTipoDoc()).id, obrigatoria: true }]) },
      {
        chave: 'duplicado',
        executar: async () => {
          const d = await primeiroTipoDoc();
          return http.json('PUT', `${W}/workflows/${(await primeiraLista()).id}/requirements`, qualquer, {
            body: { documents: [{ documentDefinitionId: d.id, displayOrder: 1, required: true }, { documentDefinitionId: d.id, displayOrder: 2, required: true }] },
          });
        },
      },
    ],
  },
  {
    chave: 'listasObra',
    metodo: 'GET',
    caminho: `${W}/constructions/{constructionId}/workflows`,
    cenarios: [
      { chave: 'ok', executar: async () => listaApi.daObra(await primeiraObra()) },
      { chave: 'obraInexistente', executar: () => listaApi.daObra(GUID_INEXISTENTE) },
    ],
  },
  {
    chave: 'listaVincularObra',
    metodo: 'POST',
    caminho: `${W}/constructions/{constructionId}/workflows`,
    cenarios: [
      { chave: 'v400', executar: async () => http.json('POST', `${W}/constructions/${await primeiraObra()}/workflows`, qualquer, { body: {} }) },
      { chave: 'listaInexistente', executar: async () => listaApi.vincularAObra(await primeiraObra(), LISTA_INEXISTENTE, 30) },
      { chave: 'obraInexistente', executar: async () => listaApi.vincularAObra(GUID_INEXISTENTE, (await primeiraLista()).id, 30) },
      {
        chave: 'listaNaObra',
        executar: async () => {
          const { obraId, lista } = await obraComLista();
          return listaApi.vincularAObra(obraId, lista.id, 30);
        },
      },
      {
        chave: 'tipoNaObra',
        executar: async () => {
          // Uma obra com lista de um tipo e outra lista do mesmo tipo que ela não usa.
          const todas = (await listaApi.listar({ porPagina: 50 })).itens;
          for (const o of (await obraApi.listar({ porPagina: 50 })).itens) {
            for (const usada of await listaApi.daObra(o.id)) {
              const outra = todas.find((l) => l.tipo === usada.tipo && l.id !== usada.id);
              if (outra) return listaApi.vincularAObra(o.id, outra.id, 30);
            }
          }
          throw new SemDado(t.semDado('outra lista do mesmo tipo de uma obra'));
        },
      },
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
      { chave: 'jaPostergada', executar: async () => pendenciasApi.postergar((await docPendente()).doc.id, { prazo: '2099-12-31', motivo: 'Aguardando emissão pelo órgão.' }) },
      { chave: 'v400', executar: async () => http.json('POST', `${PREFIXO}/pending-panel/requirements/${(await docPendente()).doc.id}/postpone`, qualquer, { body: { deadlineAt: '30/11/2026' } }) },
      { chave: 'v404', executar: () => pendenciasApi.postergar(GUID_INEXISTENTE, { prazo: '2099-12-31', motivo: 'Aguardando emissão pelo órgão.' }) },
      { chave: 'naoPostergavel', executar: async () => pendenciasApi.postergar((await docAtendido()).doc.id, { prazo: '2099-12-31', motivo: 'Aguardando emissão pelo órgão.' }) },
      { chave: 'prazoPassado', executar: async () => pendenciasApi.postergar((await docReprovado()).doc.id, { prazo: '2020-01-01', motivo: 'Aguardando emissão pelo órgão.' }) },
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
