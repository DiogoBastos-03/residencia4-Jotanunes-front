import { createBrowserRouter } from 'react-router';
import { ComponentesPage } from '@/pages/componentes/ComponentesPage';
import { NaoEncontradaPage } from '@/pages/nao-encontrada/NaoEncontradaPage';
import { VisaoGeralPage } from '@/pages/visao-geral/VisaoGeralPage';
import { FilaPage } from '@/pages/fila/FilaPage';
import { AnalisePage } from '@/pages/analise/AnalisePage';
import { RemessaPage } from '@/pages/remessa/RemessaPage';
import { EstadosPage } from '@/pages/estados/EstadosPage';
import { ObrasPage } from '@/pages/obras/ObrasPage';
import { ObraPage } from '@/pages/obra/ObraPage';
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
      { path: 'fila/remessa/:id', element: <RemessaPage /> },
      { path: 'fila/:id', element: <AnalisePage /> },
      { path: 'obras', element: <ObrasPage /> },
      { path: 'obras/:id', element: <ObraPage /> },
      // Ferramenta de revisão — disponível também no build durante a fase de revisão.
      { path: '_estados', element: <EstadosPage /> },
      { path: '*', element: <NaoEncontradaPage /> },
    ],
  },
]);
