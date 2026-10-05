import { campo, objeto, texto, type Leitor } from '@/shared/lib/json';

/** GET /constructions — item da página (ver API.md seção 7). A obra só tem id e nome no back. */
export type ConstructionListItemDto = { constructionId: string; constructionName: string };

export const lerConstructionListItem: Leitor<ConstructionListItemDto> = (valor, caminho) => {
  const o = objeto(valor, caminho);
  return {
    constructionId: campo(o, 'constructionId', texto, caminho),
    constructionName: campo(o, 'constructionName', texto, caminho),
  };
};
