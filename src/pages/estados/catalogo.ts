import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';

type ChaveEstado = keyof typeof strings.pages.estados.estados;
type ChaveGrupo = keyof typeof strings.pages.estados.grupos;

export type EntradaCatalogo = { chave: ChaveEstado; para: string };
export type GrupoCatalogo = { chave: ChaveGrupo; entradas: EntradaCatalogo[] };

const PGR = paths.analise('doc-construtora-exemplo-pgr');
const ASO = paths.envio('env-0911-construtora-aso');
const DA_CONSTRUTORA = { tipo: 'fornecedor' as const, id: 'construtora-exemplo', aba: 'documentos' };
const DO_MIRANTE = { tipo: 'obra' as const, id: 'ob-2401', aba: 'pendencias' };
const MIRANTE = paths.obra('ob-2401');
const CONSTRUTORA = paths.fornecedor('construtora-exemplo');
const CERAMICA = paths.fornecedor('ceramica-vale-ipojuca');
const SEGURANCA = paths.lista('seg-trabalho');

/** Cada estado revisável, com o endereço que abre direto nele. */
export const CATALOGO: readonly GrupoCatalogo[] = [
  {
    chave: 'base',
    entradas: [
      { chave: 'componentes', para: paths.componentes },
      { chave: 'naoEncontrada', para: '/endereco-que-nao-existe' },
      { chave: 'menuMovel', para: paths.visaoGeral },
    ],
  },
  {
    chave: 'visaoGeral',
    entradas: [
      { chave: 'vgDados', para: paths.visaoGeral },
      { chave: 'vgCarregando', para: `${paths.visaoGeral}?estado=carregando` },
      { chave: 'vgErro', para: `${paths.visaoGeral}?estado=erro` },
      { chave: 'vgVazio', para: `${paths.visaoGeral}?estado=vazio` },
    ],
  },
  {
    chave: 'fila',
    entradas: [
      { chave: 'filaItens', para: paths.fila },
      { chave: 'filaUrgentes', para: `${paths.fila}?tipo=urgentes` },
      { chave: 'filaObra', para: `${paths.fila}?obra=ob-2403` },
      { chave: 'filaSemResultado', para: `${paths.fila}?busca=Cimentos` },
      { chave: 'filaVazia', para: `${paths.fila}?estado=vazio` },
      { chave: 'filaCarregando', para: `${paths.fila}?estado=carregando` },
      { chave: 'filaErro', para: `${paths.fila}?estado=erro` },
    ],
  },
  {
    chave: 'analise',
    entradas: [
      { chave: 'anDecidindo', para: PGR },
      { chave: 'anReprovando', para: `${PGR}?painel=reprovar` },
      { chave: 'anModalAprovar', para: `${PGR}?modal=aprovar` },
      { chave: 'anModalReprovar', para: `${PGR}?modal=reprovar` },
      { chave: 'anAvanca', para: `${PGR}?modal=aprovar` },
      { chave: 'anFormVazio', para: `${PGR}?form=vazio` },
      { chave: 'anRenovacao', para: paths.analise('doc-eletrica-aracaju-fgts') },
      { chave: 'anSemValidade', para: paths.analise('doc-hidro-norte-contrato-social') },
      { chave: 'anLeitura', para: paths.analise('doc-construtora-exemplo-cnd-federal', DA_CONSTRUTORA) },
      { chave: 'anLeituraReprovado', para: paths.analise('doc-pinturas-litoral-apolice-rc', { tipo: 'fornecedor', id: 'pinturas-litoral', aba: 'documentos' }) },
      { chave: 'anLeituraVencido', para: paths.analise('doc-construtora-exemplo-fgts', DA_CONSTRUTORA) },
      { chave: 'anNaoEncontrado', para: paths.analise('documento-inexistente') },
      { chave: 'anCarregando', para: `${PGR}?estado=carregando` },
      { chave: 'anErro', para: `${PGR}?estado=erro` },
    ],
  },
  {
    chave: 'origem',
    entradas: [
      { chave: 'orFila', para: PGR },
      { chave: 'orFornecedor', para: paths.analise('doc-construtora-exemplo-pgr', DA_CONSTRUTORA) },
      { chave: 'orObra', para: paths.analise('doc-construtora-exemplo-fgts', DO_MIRANTE) },
      { chave: 'orFimFornecedor', para: paths.analise('doc-hidro-norte-contrato-social', { tipo: 'fornecedor', id: 'hidro-norte', aba: 'documentos' }) },
    ],
  },
  {
    chave: 'envio',
    entradas: [
      { chave: 'enAso', para: ASO },
      { chave: 'enDrawer', para: `${ASO}?arquivo=arq-env-0911-construtora-aso-2` },
      { chave: 'enDrawerDecidido', para: `${ASO}?arquivo=arq-env-0911-construtora-aso-12` },
      { chave: 'enModalReprovar', para: `${ASO}?reprovar=arq-env-0911-construtora-aso-6` },
      { chave: 'enOutro', para: paths.envio('env-0914-vale-verde-epi') },
      { chave: 'enLeitura', para: paths.envio('env-0520-construtora-epi', DA_CONSTRUTORA) },
      { chave: 'enNaoEncontrado', para: paths.envio('envio-inexistente') },
      { chave: 'enCarregando', para: `${ASO}?estado=carregando` },
      { chave: 'enErro', para: `${ASO}?estado=erro` },
    ],
  },
  {
    chave: 'obras',
    entradas: [
      { chave: 'obLista', para: paths.obras },
      { chave: 'obVazia', para: `${paths.obras}?estado=vazio` },
      { chave: 'obCarregando', para: `${paths.obras}?estado=carregando` },
      { chave: 'obErro', para: `${paths.obras}?estado=erro` },
    ],
  },
  {
    chave: 'obra',
    entradas: [
      { chave: 'foFornecedores', para: MIRANTE },
      { chave: 'foExigencias', para: `${MIRANTE}?aba=exigencias` },
      { chave: 'foPendencias', para: `${MIRANTE}?aba=pendencias` },
      { chave: 'foHistorico', para: `${MIRANTE}?aba=historico` },
      { chave: 'foDrawerFornecedor', para: `${MIRANTE}?drawer=fornecedor` },
      { chave: 'foDrawerFornecedorVazio', para: `${MIRANTE}?drawer=fornecedor&form=vazio` },
      { chave: 'foDrawerLista', para: `${MIRANTE}?aba=exigencias&drawer=lista` },
      { chave: 'foModalDesvincular', para: `${MIRANTE}?aba=exigencias&desvincular=hab-material` },
      { chave: 'foUltimaLista', para: `${paths.obra('ob-2313')}?aba=exigencias` },
      { chave: 'foSemLista', para: `${paths.obra('ob-2404')}?aba=exigencias` },
      { chave: 'foSemPendencias', para: `${paths.obra('ob-2403')}?aba=pendencias` },
      { chave: 'foPendenciaLeitura', para: `${MIRANTE}?aba=pendencias` },
      { chave: 'foNaoEncontrada', para: paths.obra('obra-inexistente') },
      { chave: 'foCarregando', para: `${MIRANTE}?estado=carregando` },
      { chave: 'foErro', para: `${MIRANTE}?estado=erro` },
    ],
  },
  {
    chave: 'fornecedores',
    entradas: [
      { chave: 'flLista', para: paths.fornecedores },
      { chave: 'flSituacao', para: `${paths.fornecedores}?situacao=comPendencia` },
      { chave: 'flTipo', para: `${paths.fornecedores}?tipo=material` },
      { chave: 'flBuscaCnpj', para: `${paths.fornecedores}?busca=12.345.678` },
      { chave: 'flAguardando', para: `${paths.fornecedores}?busca=Cer%C3%A2mica` },
      { chave: 'flModalReenviar', para: `${paths.fornecedores}?reenviar=ceramica-vale-ipojuca` },
      { chave: 'flSemResultado', para: `${paths.fornecedores}?busca=Construtora%20Inexistente` },
      { chave: 'flVazia', para: `${paths.fornecedores}?estado=vazio` },
      { chave: 'flCarregando', para: `${paths.fornecedores}?estado=carregando` },
      { chave: 'flErro', para: `${paths.fornecedores}?estado=erro` },
    ],
  },
  {
    chave: 'fornecedorNovo',
    entradas: [
      { chave: 'fnPreenchido', para: paths.novoFornecedor },
      { chave: 'fnVazio', para: `${paths.novoFornecedor}?form=vazio` },
      { chave: 'fnErros', para: `${paths.novoFornecedor}?form=vazio` },
      { chave: 'fnDuplicado', para: `${paths.novoFornecedor}?cnpj=12345678000190` },
      { chave: 'fnCadastrado', para: paths.novoFornecedor },
    ],
  },
  {
    chave: 'fornecedor',
    entradas: [
      { chave: 'ffDocumentos', para: CONSTRUTORA },
      { chave: 'ffExigencias', para: `${CONSTRUTORA}?aba=exigencias` },
      { chave: 'ffObras', para: `${CONSTRUTORA}?aba=obras` },
      { chave: 'ffDocsFuncionario', para: CONSTRUTORA },
      { chave: 'ffHistorico', para: `${CONSTRUTORA}?aba=historico` },
      { chave: 'ffContatos', para: `${CONSTRUTORA}?aba=contatos` },
      { chave: 'ffModalEditar', para: `${CONSTRUTORA}?modal=editar` },
      { chave: 'ffModalBloquear', para: `${CONSTRUTORA}?modal=bloquear` },
      { chave: 'ffBloqueado', para: paths.fornecedor('pinturas-litoral') },
      { chave: 'ffModalReenviar', para: `${CERAMICA}?aba=contatos&modal=reenviar` },
      { chave: 'ffSemArquivos', para: paths.fornecedor('pinturas-litoral') },
      { chave: 'ffNaoEncontrado', para: paths.fornecedor('fornecedor-inexistente') },
      { chave: 'ffCarregando', para: `${CONSTRUTORA}?estado=carregando` },
      { chave: 'ffErro', para: `${CONSTRUTORA}?estado=erro` },
    ],
  },
  {
    chave: 'listas',
    entradas: [
      { chave: 'liLista', para: paths.exigencias },
      { chave: 'liVazia', para: `${paths.exigencias}?estado=vazio` },
      { chave: 'liCarregando', para: `${paths.exigencias}?estado=carregando` },
      { chave: 'liErro', para: `${paths.exigencias}?estado=erro` },
    ],
  },
  {
    chave: 'novaLista',
    entradas: [
      { chave: 'nlServico', para: paths.novaLista },
      { chave: 'nlMaterial', para: `${paths.novaLista}?tipo=material` },
      { chave: 'nlVazio', para: `${paths.novaLista}?form=vazio` },
      { chave: 'nlDrawers', para: paths.novaLista },
    ],
  },
  {
    chave: 'lista',
    entradas: [
      { chave: 'clItens', para: SEGURANCA },
      { chave: 'clDrawerDocumento', para: `${SEGURANCA}?drawer=empresa` },
      { chave: 'clDrawerEditarDocumento', para: `${SEGURANCA}?drawer=empresa&item=st-1` },
      { chave: 'clDrawerFuncionario', para: `${SEGURANCA}?drawer=funcionario&item=st-5` },
      { chave: 'clDrawerNovoFuncionario', para: `${SEGURANCA}?drawer=funcionario` },
      { chave: 'clDrawerObras', para: `${SEGURANCA}?drawer=obras` },
      { chave: 'clModalRemover', para: `${SEGURANCA}?remover=ob-2403` },
      { chave: 'clUnica', para: paths.lista('hab-servico') },
      { chave: 'clMaterial', para: paths.lista('hab-material') },
      { chave: 'clNaoEncontrada', para: paths.lista('lista-inexistente') },
      { chave: 'clCarregando', para: `${SEGURANCA}?estado=carregando` },
      { chave: 'clErro', para: `${SEGURANCA}?estado=erro` },
    ],
  },
  {
    chave: 'relatorios',
    entradas: [
      { chave: 'rlTrinta', para: paths.relatorios },
      { chave: 'rlNoventa', para: `${paths.relatorios}?periodo=90d` },
      { chave: 'rlAno', para: `${paths.relatorios}?periodo=ano` },
      { chave: 'rlExportar', para: paths.relatorios },
      { chave: 'rlVazio', para: `${paths.relatorios}?estado=vazio` },
      { chave: 'rlCarregando', para: `${paths.relatorios}?estado=carregando` },
      { chave: 'rlErro', para: `${paths.relatorios}?estado=erro` },
    ],
  },
];
