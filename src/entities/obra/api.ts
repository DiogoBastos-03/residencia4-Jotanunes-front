import { http } from '@/shared/lib/http';
import { buscarTodas, lerPagina } from '@/shared/lib/paginacao';
import { lerConstructionListItem } from './dto';
import { obraDaApi } from './mapper';
import type { Obra } from './model';

const BASE = '/v1/internal/constructions';
const pagina = lerPagina(lerConstructionListItem);

/** A única chamada de obra (construction) do back. */
export const obraApi = {
  /** GET /constructions, todas as páginas; com `enterpriseId`, só as obras daquele fornecedor. */
  async listar(filtro: { enterpriseId?: string } = {}, signal?: AbortSignal): Promise<Obra[]> {
    const itens = await buscarTodas(async (page, pageSize) =>
      pagina(await http.get(BASE, { query: { page, pageSize, enterpriseId: filtro.enterpriseId }, signal }), 'constructions'),
    );
    return itens.map(obraDaApi);
  },
};
