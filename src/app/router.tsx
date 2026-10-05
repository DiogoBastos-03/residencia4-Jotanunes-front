import { createBrowserRouter } from 'react-router';
import { ComponentesPage } from '@/pages/componentes/ComponentesPage';
import { NaoEncontradaPage } from '@/pages/nao-encontrada/NaoEncontradaPage';
import { VisaoGeralPage } from '@/pages/visao-geral/VisaoGeralPage';
import { FilaPage } from '@/pages/fila/FilaPage';
import { AnalisePage } from '@/pages/analise/AnalisePage';
import { EnvioPage } from '@/pages/envio/EnvioPage';
import { EstadosPage } from '@/pages/estados/EstadosPage';
import { ObrasPage } from '@/pages/obras/ObrasPage';
import { ObraPage } from '@/pages/obra/ObraPage';
import { FornecedoresPage } from '@/pages/fornecedores/FornecedoresPage';
import { FornecedorNovoPage } from '@/pages/fornecedor-novo/FornecedorNovoPage';
import { FornecedorPage } from '@/pages/fornecedor/FornecedorPage';
import { ExigenciasPage } from '@/pages/exigencias/ExigenciasPage';
import { NovaListaPage } from '@/pages/nova-lista/NovaListaPage';
import { ListaPage } from '@/pages/lista/ListaPage';
import { RelatoriosPage } from '@/pages/relatorios/RelatoriosPage';
import { paths } from '@/shared/lib';
import { AppLayout } from './layout/AppLayout';

export const router = createBrowserRouter([
  // Amostra do design system — disponível também no build enquanto o sistema não tem páginas.
  { path: paths.componentes, element: <ComponentesPage /> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <VisaoGeralPage /> },
      { path: 'fila', element: <FilaPage /> },
      { path: 'fila/envio/:id', element: <EnvioPage /> },
      { path: 'fila/:id', element: <AnalisePage /> },
      { path: 'obras', element: <ObrasPage /> },
      { path: 'obras/:id', element: <ObraPage /> },
      { path: 'fornecedores', element: <FornecedoresPage /> },
      { path: 'fornecedores/novo', element: <FornecedorNovoPage /> },
      { path: 'fornecedores/:id', element: <FornecedorPage /> },
      { path: 'exigencias', element: <ExigenciasPage /> },
      { path: 'exigencias/nova', element: <NovaListaPage /> },
      { path: 'exigencias/:id', element: <ListaPage /> },
      { path: 'relatorios', element: <RelatoriosPage /> },
      // Ferramenta de revisão — disponível também no build durante a fase de revisão.
      { path: '_estados', element: <EstadosPage /> },
      { path: '*', element: <NaoEncontradaPage /> },
    ],
  },
]);
