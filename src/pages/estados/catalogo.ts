import {
  aguardandoAcesso,
  fornecedoresDaObra,
  listasDaObra,
  obrasDoFornecedor,
  statusDocumento,
  totalPendenciasDaObra,
  type Dataset,
  type DocumentoEmpresa,
  type EnvioArquivos,
} from '@/entities';
import { formatCnpj, paths, type Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';

type ChaveEstado = keyof typeof strings.pages.estados.estados;
type ChaveGrupo = keyof typeof strings.pages.estados.grupos;

export type EntradaCatalogo = { chave: ChaveEstado; para: string };
export type GrupoCatalogo = { chave: ChaveGrupo; entradas: EntradaCatalogo[] };

/** Id que não existe: o link cai no estado "não encontrado" quando os dados atuais não têm um exemplo daquele caso. */
const SEM_EXEMPLO = 'sem-exemplo';
const DOC_VAZIO: DocumentoEmpresa = { id: SEM_EXEMPLO, fornecedorId: SEM_EXEMPLO, tipoDocumentoId: '', status: 'pendente', enviosAnteriores: [] };
const ENVIO_VAZIO: EnvioArquivos = { id: SEM_EXEMPLO, fornecedorId: SEM_EXEMPLO, tipoDocumentoId: '', enviadoEm: '', prioridade: 'normal' };

const origemFornecedor = (id: string): Origem => ({ tipo: 'fornecedor', id, aba: 'documentos' });

/**
 * Exemplos de cada caso, escolhidos nos dados atuais. Desde a Fase 2 fornecedores e obras
 * vêm da API e a demonstração é gerada sobre eles: os ids mudam com a base, então o catálogo
 * procura, em vez de fixar ids.
 */
function exemplos(ds: Dataset) {
  const docs = ds.documentos;
  const docAnalise = docs.find((d) => d.status === 'emAnalise' && d.validadeInformada) ?? docs.find((d) => d.status === 'emAnalise') ?? DOC_VAZIO;
  const semValidade = docs.find((d) => d.status === 'emAnalise' && !d.validadeInformada);
  const docVencido = docs.find((d) => statusDocumento(d, ds.hoje) === 'vencido') ?? DOC_VAZIO;

  const arquivosDe = (envio: EnvioArquivos) => ds.arquivos.filter((a) => a.envioId === envio.id);
  const envioMisto =
    ds.envios.find((e) => {
      const status = new Set(arquivosDe(e).map((a) => a.status));
      return status.has('emAnalise') && status.size > 1;
    }) ?? ENVIO_VAZIO;
  const doMisto = arquivosDe(envioMisto);
  const emAnalise = doMisto.filter((a) => a.status === 'emAnalise');

  const obrasComPendencia = [...ds.obras].sort((a, b) => totalPendenciasDaObra(ds, b.id) - totalPendenciasDaObra(ds, a.id));
  const obraPrincipal = obrasComPendencia[0]?.id ?? SEM_EXEMPLO;
  const aguardando = ds.fornecedores.find(aguardandoAcesso);
  const primeiro = ds.fornecedores[0];

  return {
    docAnalise,
    docSemValidade: semValidade?.id ?? SEM_EXEMPLO,
    fornecedorSemValidade: semValidade?.fornecedorId ?? SEM_EXEMPLO,
    docRenovacao: docs.find((d) => d.renovacao)?.id ?? SEM_EXEMPLO,
    docAprovado: docs.find((d) => statusDocumento(d, ds.hoje) === 'aprovado') ?? DOC_VAZIO,
    docReprovado: docs.find((d) => d.status === 'reprovado') ?? DOC_VAZIO,
    docVencido,
    obraDoVencido: obrasDoFornecedor(ds, docVencido.fornecedorId)[0]?.id ?? SEM_EXEMPLO,
    envioMisto: envioMisto.id,
    fornecedorDoMisto: envioMisto.fornecedorId,
    arquivoEmAnalise: emAnalise[0]?.id ?? SEM_EXEMPLO,
    arquivoParaReprovar: emAnalise[1]?.id ?? emAnalise[0]?.id ?? SEM_EXEMPLO,
    arquivoDecidido: doMisto.find((a) => a.status === 'reprovado')?.id ?? doMisto.find((a) => a.status !== 'emAnalise')?.id ?? SEM_EXEMPLO,
    envioEmAnalise: ds.envios.find((e) => e.id !== envioMisto.id && arquivosDe(e).every((a) => a.status === 'emAnalise'))?.id ?? SEM_EXEMPLO,
    envioDecidido: ds.envios.find((e) => arquivosDe(e).every((a) => a.status !== 'emAnalise')) ?? ENVIO_VAZIO,
    obraPrincipal,
    obraUmaLista: ds.obras.find((o) => listasDaObra(ds, o.id).length === 1)?.id ?? obraPrincipal,
    obraSemLista: ds.obras.find((o) => listasDaObra(ds, o.id).length === 0)?.id ?? obraPrincipal,
    obraSemPendencias: ds.obras.find((o) => fornecedoresDaObra(ds, o.id).length > 0 && totalPendenciasDaObra(ds, o.id) === 0)?.id ?? obraPrincipal,
    obraComSeguranca: ds.obraListas.find((ol) => ol.listaId === 'seg-trabalho')?.obraId ?? SEM_EXEMPLO,
    fornecedorBloqueado: ds.fornecedores.find((f) => f.bloqueado)?.id ?? SEM_EXEMPLO,
    fornecedorAguardando: aguardando?.id ?? SEM_EXEMPLO,
    buscaAguardando: aguardando?.razaoSocial.split(' ')[0] ?? '',
    inicioCnpj: primeiro ? formatCnpj(primeiro.cnpj).slice(0, 10) : '',
    cnpjExistente: primeiro?.cnpj ?? '',
  };
}

/** Cada estado revisável, com o endereço que abre direto nele, a partir dos dados atuais. */
export function montarCatalogo(ds: Dataset): readonly GrupoCatalogo[] {
  const e = exemplos(ds);
  const PGR = paths.analise(e.docAnalise.id);
  const ASO = paths.envio(e.envioMisto);
  const MIRANTE = paths.obra(e.obraPrincipal);
  // Fornecedor com documento de funcionário em estados diferentes (o caso mais completo da ficha).
  const CONSTRUTORA = paths.fornecedor(e.fornecedorDoMisto === SEM_EXEMPLO ? e.docAnalise.fornecedorId : e.fornecedorDoMisto);
  const CERAMICA = paths.fornecedor(e.fornecedorAguardando);
  const SEGURANCA = paths.lista('seg-trabalho');

  return [
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
        { chave: 'filaObra', para: `${paths.fila}?obra=${e.obraPrincipal}` },
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
        { chave: 'anRenovacao', para: paths.analise(e.docRenovacao) },
        { chave: 'anSemValidade', para: paths.analise(e.docSemValidade) },
        { chave: 'anLeitura', para: paths.analise(e.docAprovado.id, origemFornecedor(e.docAprovado.fornecedorId)) },
        { chave: 'anLeituraReprovado', para: paths.analise(e.docReprovado.id, origemFornecedor(e.docReprovado.fornecedorId)) },
        { chave: 'anLeituraVencido', para: paths.analise(e.docVencido.id, origemFornecedor(e.docVencido.fornecedorId)) },
        { chave: 'anNaoEncontrado', para: paths.analise('documento-inexistente') },
        { chave: 'anCarregando', para: `${PGR}?estado=carregando` },
        { chave: 'anErro', para: `${PGR}?estado=erro` },
      ],
    },
    {
      chave: 'origem',
      entradas: [
        { chave: 'orFila', para: PGR },
        { chave: 'orFornecedor', para: paths.analise(e.docAnalise.id, origemFornecedor(e.docAnalise.fornecedorId)) },
        { chave: 'orObra', para: paths.analise(e.docVencido.id, { tipo: 'obra', id: e.obraDoVencido, aba: 'pendencias' }) },
        { chave: 'orFimFornecedor', para: paths.analise(e.docSemValidade, origemFornecedor(e.fornecedorSemValidade)) },
      ],
    },
    {
      chave: 'envio',
      entradas: [
        { chave: 'enAso', para: ASO },
        { chave: 'enDrawer', para: `${ASO}?arquivo=${e.arquivoEmAnalise}` },
        { chave: 'enDrawerDecidido', para: `${ASO}?arquivo=${e.arquivoDecidido}` },
        { chave: 'enModalReprovar', para: `${ASO}?reprovar=${e.arquivoParaReprovar}` },
        { chave: 'enOutro', para: paths.envio(e.envioEmAnalise) },
        { chave: 'enLeitura', para: paths.envio(e.envioDecidido.id, origemFornecedor(e.envioDecidido.fornecedorId)) },
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
        { chave: 'foUltimaLista', para: `${paths.obra(e.obraUmaLista)}?aba=exigencias` },
        { chave: 'foSemLista', para: `${paths.obra(e.obraSemLista)}?aba=exigencias` },
        { chave: 'foSemPendencias', para: `${paths.obra(e.obraSemPendencias)}?aba=pendencias` },
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
        { chave: 'flBuscaCnpj', para: `${paths.fornecedores}?busca=${encodeURIComponent(e.inicioCnpj)}` },
        { chave: 'flAguardando', para: `${paths.fornecedores}?busca=${encodeURIComponent(e.buscaAguardando)}` },
        { chave: 'flModalReenviar', para: `${paths.fornecedores}?reenviar=${e.fornecedorAguardando}` },
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
        { chave: 'fnDuplicado', para: `${paths.novoFornecedor}?cnpj=${e.cnpjExistente}` },
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
        { chave: 'ffDados', para: `${CONSTRUTORA}?aba=dados` },
        { chave: 'ffModalEditar', para: `${CONSTRUTORA}?modal=editar` },
        { chave: 'ffModalBloquear', para: `${CONSTRUTORA}?modal=bloquear` },
        { chave: 'ffBloqueado', para: paths.fornecedor(e.fornecedorBloqueado) },
        { chave: 'ffModalReenviar', para: `${CERAMICA}?aba=contatos&modal=reenviar` },
        { chave: 'ffSemArquivos', para: paths.fornecedor(e.fornecedorBloqueado) },
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
        { chave: 'clModalRemover', para: `${SEGURANCA}?remover=${e.obraComSeguranca}` },
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
  }
