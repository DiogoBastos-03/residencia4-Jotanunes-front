import type { ConstructionListItemDto } from './dto';
import type { Obra } from './model';

/**
 * Item da API → Obra. Código, cidade, UF e data de recebimento não existem no back e
 * ficam vazios. A situação também não existe: toda obra da API é tratada como em execução,
 * para que entre nas telas de acompanhamento e no cadastro.
 */
export function obraDaApi(dto: ConstructionListItemDto): Obra {
  return { id: dto.constructionId, nome: dto.constructionName, situacao: 'emExecucao' };
}
