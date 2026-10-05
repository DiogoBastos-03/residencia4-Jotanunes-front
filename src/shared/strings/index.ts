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
import { fornecedoresPage, modalBloquear, modalReenviarAcesso } from './pages/fornecedores';
import { fornecedorNovoPage } from './pages/fornecedorNovo';
import { fornecedorPage } from './pages/fornecedor';
import {
  drawerDocumento,
  drawerVincularObras,
  exigenciasPage,
  listaPage,
  novaListaPage,
} from './pages/exigencias';
import { relatoriosPage } from './pages/relatorios';
import { filaPage } from './pages/fila';
import { envioPage } from './pages/envio';
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
  modais: { reenviarAcesso: modalReenviarAcesso, bloquear: modalBloquear },
  drawers: { documento: drawerDocumento, vincularObras: drawerVincularObras },
  dominio,
  eventos,
  pages: {
    componentes: componentesPage,
    naoEncontrada: naoEncontradaPage,
    visaoGeral: visaoGeralPage,
    fila: filaPage,
    analise: analisePage,
    envio: envioPage,
    estados: estadosPage,
    obras: obrasPage,
    obra: obraPage,
    fornecedores: fornecedoresPage,
    fornecedorNovo: fornecedorNovoPage,
    fornecedor: fornecedorPage,
    exigencias: exigenciasPage,
    novaLista: novaListaPage,
    lista: listaPage,
    relatorios: relatoriosPage,
  },
} as const;

export type { StatusKey, TagKey } from './status';
