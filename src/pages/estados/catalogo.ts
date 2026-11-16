import type { FornecedorResumo, ObraResumo } from '@/entities';
import type { VinculoApi } from '@/entities/obra';
import { formatCnpj, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';

type ChaveEstado = keyof typeof strings.pages.estados.estados;
type ChaveGrupo = keyof typeof strings.pages.estados.grupos;

export type EntradaCatalogo = { chave: ChaveEstado; para: string };
export type GrupoCatalogo = { chave: ChaveGrupo; entradas: EntradaCatalogo[] };

/** Id que não existe: o link cai em "não encontrado" quando a base atual não tem exemplo daquele caso. */
const SEM_EXEMPLO = 'sem-exemplo';

export type BaseCatalogo = { fornecedores: readonly FornecedorResumo[]; obras: readonly ObraResumo[]; vinculos: readonly VinculoApi[]; listaId: number | null };

/** Cada estado revisável, com o endereço que abre direto nele. Os ids saem das respostas da API. */
export function montarCatalogo(base: BaseCatalogo): readonly GrupoCatalogo[] {
  const comObra = new Set(base.vinculos.map((v) => v.fornecedorId));
  const comFornecedor = new Set(base.vinculos.map((v) => v.obraId));
  const fornecedor = base.fornecedores.find((f) => comObra.has(f.id)) ?? base.fornecedores[0];
  const bloqueado = base.fornecedores.find((f) => f.bloqueado);
  const semObra = base.fornecedores.find((f) => !comObra.has(f.id));
  const obra = base.obras.find((o) => comFornecedor.has(o.id)) ?? base.obras[0];
  const obraVazia = base.obras.find((o) => !comFornecedor.has(o.id));

  const FICHA = paths.fornecedor(fornecedor?.id ?? SEM_EXEMPLO);
  const OBRA = paths.obra(obra?.id ?? SEM_EXEMPLO);
  const LISTA = paths.lista(base.listaId ?? SEM_EXEMPLO);

  return [
    {
      chave: 'base',
      entradas: [
        { chave: 'componentes', para: paths.componentes },
        { chave: 'naoEncontrada', para: '/endereco-que-nao-existe' },
        { chave: 'foraDeUso', para: '/fila' },
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
        { chave: 'foFornecedores', para: OBRA },
        { chave: 'foSemFornecedores', para: paths.obra(obraVazia?.id ?? obra?.id ?? SEM_EXEMPLO) },
        { chave: 'foNaoEncontrada', para: paths.obra('obra-inexistente') },
        { chave: 'foCarregando', para: `${OBRA}?estado=carregando` },
        { chave: 'foErro', para: `${OBRA}?estado=erro` },
      ],
    },
    {
      chave: 'fornecedores',
      entradas: [
        { chave: 'flLista', para: paths.fornecedores },
        { chave: 'flBloqueados', para: `${paths.fornecedores}?situacao=bloqueado` },
        { chave: 'flTipo', para: `${paths.fornecedores}?tipo=material` },
        { chave: 'flBuscaCnpj', para: `${paths.fornecedores}?busca=${encodeURIComponent(fornecedor ? formatCnpj(fornecedor.cnpj).slice(0, 10) : '')}` },
        { chave: 'flSemResultado', para: `${paths.fornecedores}?busca=Empresa%20Inexistente` },
        { chave: 'flVazia', para: `${paths.fornecedores}?estado=vazio` },
        { chave: 'flCarregando', para: `${paths.fornecedores}?estado=carregando` },
        { chave: 'flErro', para: `${paths.fornecedores}?estado=erro` },
      ],
    },
    {
      chave: 'fornecedorNovo',
      entradas: [
        { chave: 'fnVazio', para: paths.novoFornecedor },
        { chave: 'fnErros', para: paths.novoFornecedor },
        { chave: 'fnDuplicado', para: `${paths.novoFornecedor}?cnpj=${fornecedor?.cnpj ?? ''}` },
        { chave: 'fnCadastrado', para: paths.novoFornecedor },
      ],
    },
    {
      chave: 'fornecedor',
      entradas: [
        { chave: 'ffDados', para: FICHA },
        { chave: 'ffObras', para: `${FICHA}?aba=obras` },
        { chave: 'ffSemObras', para: `${paths.fornecedor(semObra?.id ?? SEM_EXEMPLO)}?aba=obras` },
        { chave: 'ffModalEditar', para: `${FICHA}?modal=editar` },
        { chave: 'ffModalBloquear', para: `${FICHA}?modal=bloquear` },
        { chave: 'ffBloqueado', para: paths.fornecedor(bloqueado?.id ?? SEM_EXEMPLO) },
        { chave: 'ffNaoEncontrado', para: paths.fornecedor('fornecedor-inexistente') },
        { chave: 'ffCarregando', para: `${FICHA}?estado=carregando` },
        { chave: 'ffErro', para: `${FICHA}?estado=erro` },
      ],
    },
    {
      chave: 'listas',
      entradas: [
        { chave: 'liLista', para: paths.exigencias },
        { chave: 'liTipo', para: `${paths.exigencias}?tipo=material` },
        { chave: 'liSemResultado', para: `${paths.exigencias}?busca=Lista%20Inexistente` },
        { chave: 'liVazia', para: `${paths.exigencias}?estado=vazio` },
        { chave: 'liCarregando', para: `${paths.exigencias}?estado=carregando` },
        { chave: 'liErro', para: `${paths.exigencias}?estado=erro` },
      ],
    },
    { chave: 'novaLista', entradas: [{ chave: 'nlVazio', para: paths.novaLista }] },
    {
      chave: 'lista',
      entradas: [
        { chave: 'clFicha', para: LISTA },
        { chave: 'clNaoEncontrada', para: paths.lista(999999) },
        { chave: 'clCarregando', para: `${LISTA}?estado=carregando` },
        { chave: 'clErro', para: `${LISTA}?estado=erro` },
      ],
    },
    {
      chave: 'tiposDocumento',
      entradas: [
        { chave: 'tdLista', para: paths.tiposDocumento },
        { chave: 'tdVazia', para: `${paths.tiposDocumento}?estado=vazio` },
        { chave: 'tdCarregando', para: `${paths.tiposDocumento}?estado=carregando` },
        { chave: 'tdErro', para: `${paths.tiposDocumento}?estado=erro` },
      ],
    },
  ];
}
