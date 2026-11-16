import { z } from 'zod';

/** Peças comuns a todos os módulos do contrato. */

/** IDs são GUID. z.guid() aceita qualquer GUID no formato 8-4-4-4-12 (inclusive os do seed, que não são UUID v4). */
export const guid = z.guid();

/**
 * Datas em ISO 8601 UTC. O contrato (seção 1) diz "com Z", mas a API publicada ainda
 * devolve sem fuso ("2026-01-05T09:00:00"). Aceita os dois; sem fuso é lido como UTC
 * (`momentoDeUtc`). Divergência registrada em INTEGRACAO.md.
 */
export const dataHoraUtc = z.iso.datetime({ local: true, offset: true });

/** Só data, YYYY-MM-DD — usada apenas no `deadlineAt` da postergação. */
export const dataSimples = z.iso.date();

/** Maior pageSize aceito pelas listagens (seção 2.2). */
export const PAGE_SIZE_MAX = 50;

/** Envelope das listagens paginadas: { items, totalCount, page, pageSize }. */
export function paginaSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    totalCount: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(PAGE_SIZE_MAX),
  });
}

/** Query de paginação (page ≥ 1; pageSize 1..50). */
export type PaginacaoQuery = { page?: number; pageSize?: number };

/** Paginação do lado do front (pagina/porPagina), para as funções de api. */
export type ListagemPaginada = { pagina?: number; porPagina?: number };
