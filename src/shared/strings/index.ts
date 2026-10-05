import { common } from './common';
import { statusLabels, tagLabels } from './status';
import { ui } from './ui';
import { dominio } from './dominio';
import { eventos } from './eventos';
import { layout } from './layout';
import { analisePage } from './pages/analise';
import { estadosPage } from './pages/estados';
import { obrasPage } from './pages/obras';
import { obraPage } from './pages/obra';
import { filaPage } from './pages/fila';
import { remessaPage } from './pages/remessa';
import { componentesPage } from './pages/componentes';
import { naoEncontradaPage } from './pages/naoEncontrada';
import { visaoGeralPage } from './pages/visaoGeral';

/**
 * Todo texto de interface da aplicação. Para trocar o vocabulário do produto,
 * edite estes arquivos — nunca escreva texto direto no JSX.
 */
export const strings = {
  common,
  status: statusLabels,
  tags: tagLabels,
  ui,
  layout,
  dominio,
  eventos,
  pages: {
    componentes: componentesPage,
    naoEncontrada: naoEncontradaPage,
    visaoGeral: visaoGeralPage,
    fila: filaPage,
    analise: analisePage,
    remessa: remessaPage,
    estados: estadosPage,
    obras: obrasPage,
    obra: obraPage,
  },
} as const;

export type { StatusKey, TagKey } from './status';
