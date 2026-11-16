import type { IsoDate, TipoFornecimento } from '../common';

/** Lista de exigências como a listagem devolve. O tipo decide a quais fornecedores ela se aplica. */
export type ListaResumo = { id: number; nome: string; tipo: TipoFornecimento };

/** Um documento exigido pela lista, na ordem de exibição. */
export type Exigencia = { definicaoId: string; ordem: number; obrigatoria: boolean };

/** Versão da lista: imutável; alterar as exigências cria a próxima. */
export type VersaoLista = { id: string; numero: number; exigencias: Exigencia[]; criadaEm: IsoDate };

export type ListaDetalhe = ListaResumo & { criadaEm: IsoDate; atualizadaEm: IsoDate; vigente: VersaoLista };

/** Lista em uso numa obra, na versão que a obra segue. */
export type ListaDaObra = ListaResumo & { versaoId: string; versao: number };
