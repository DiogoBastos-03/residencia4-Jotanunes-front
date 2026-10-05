import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';

type ChaveEstado = keyof typeof strings.pages.estados.estados;
type ChaveGrupo = keyof typeof strings.pages.estados.grupos;

export type EntradaCatalogo = { chave: ChaveEstado; para: string };
export type GrupoCatalogo = { chave: ChaveGrupo; entradas: EntradaCatalogo[] };

const PGR = paths.analise('doc-construtora-exemplo-pgr');
const REMESSA = paths.remessa('rem-0911-construtora');
const MIRANTE = paths.obra('ob-2401');

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
      { chave: 'anAprovado', para: `${PGR}?modal=aprovar` },
      { chave: 'anFormVazio', para: `${PGR}?form=vazio` },
      { chave: 'anRenovacao', para: paths.analise('doc-eletrica-aracaju-fgts') },
      { chave: 'anSemValidade', para: paths.analise('doc-hidro-norte-contrato-social') },
      { chave: 'anNaoEncontrado', para: paths.analise('documento-inexistente') },
      { chave: 'anCarregando', para: `${PGR}?estado=carregando` },
      { chave: 'anErro', para: `${PGR}?estado=erro` },
    ],
  },
  {
    chave: 'remessa',
    entradas: [
      { chave: 'reTabela', para: REMESSA },
      { chave: 'reDrawer', para: `${REMESSA}?pessoa=func-marcos-lima` },
      { chave: 'reDrawerConcluido', para: `${REMESSA}?pessoa=func-jose-souza` },
      { chave: 'reOutra', para: paths.remessa('rem-0914-vale-verde') },
      { chave: 'reNaoEncontrada', para: paths.remessa('remessa-inexistente') },
      { chave: 'reCarregando', para: `${REMESSA}?estado=carregando` },
      { chave: 'reErro', para: `${REMESSA}?estado=erro` },
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
      { chave: 'foFuncionarios', para: `${MIRANTE}?aba=funcionarios` },
      { chave: 'foPendencias', para: `${MIRANTE}?aba=pendencias` },
      { chave: 'foHistorico', para: `${MIRANTE}?aba=historico` },
      { chave: 'foDrawerFornecedor', para: `${MIRANTE}?drawer=fornecedor` },
      { chave: 'foDrawerFornecedorVazio', para: `${MIRANTE}?drawer=fornecedor&form=vazio` },
      { chave: 'foDrawerLista', para: `${MIRANTE}?aba=exigencias&drawer=lista` },
      { chave: 'foModalDesvincular', para: `${MIRANTE}?aba=exigencias&desvincular=hab-material` },
      { chave: 'foUltimaLista', para: `${paths.obra('ob-2313')}?aba=exigencias` },
      { chave: 'foSemLista', para: `${paths.obra('ob-2404')}?aba=exigencias` },
      { chave: 'foSemFuncionarios', para: `${paths.obra('ob-2312')}?aba=funcionarios` },
      { chave: 'foSemPendencias', para: `${paths.obra('ob-2403')}?aba=pendencias` },
      { chave: 'foDrawerPessoa', para: `${MIRANTE}?aba=funcionarios&pessoa=func-jose-souza` },
      { chave: 'foNaoEncontrada', para: paths.obra('obra-inexistente') },
      { chave: 'foCarregando', para: `${MIRANTE}?estado=carregando` },
      { chave: 'foErro', para: `${MIRANTE}?estado=erro` },
    ],
  },
];
