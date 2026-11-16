import type { FornecedorResumo, ObraResumo } from '@/entities';

/** Linha da lista de obras: a obra como a API devolve e quantos fornecedores ela tem. */
export type LinhaObra = { obra: ObraResumo; fornecedores: number };

/** Ficha da obra: só o que a API fornece. */
export type FichaObra = { obra: ObraResumo; fornecedores: FornecedorResumo[] };
