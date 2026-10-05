import { common } from './common';
import { statusLabels, tagLabels } from './status';
import { ui } from './ui';
import { componentesPage } from './pages/componentes';

/**
 * Todo texto de interface da aplicação. Para trocar o vocabulário do produto,
 * edite estes arquivos — nunca escreva texto direto no JSX.
 */
export const strings = {
  common,
  status: statusLabels,
  tags: tagLabels,
  ui,
  pages: {
    componentes: componentesPage,
  },
} as const;

export type { StatusKey, TagKey } from './status';
