import { createBrowserRouter } from 'react-router';
import { ComponentesPage } from '@/pages/componentes/ComponentesPage';
import { NaoEncontradaPage } from '@/pages/nao-encontrada/NaoEncontradaPage';
import { VisaoGeralPage } from '@/pages/visao-geral/VisaoGeralPage';
import { EstadosPage } from '@/pages/estados/EstadosPage';
import { ApiPage } from '@/pages/api/ApiPage';
import { ObrasPage } from '@/pages/obras/ObrasPage';
import { ObraPage } from '@/pages/obra/ObraPage';
import { FornecedoresPage } from '@/pages/fornecedores/FornecedoresPage';
import { FornecedorNovoPage } from '@/pages/fornecedor-novo/FornecedorNovoPage';
import { FornecedorPage } from '@/pages/fornecedor/FornecedorPage';
import { ExigenciasPage } from '@/pages/exigencias/ExigenciasPage';
import { NovaListaPage } from '@/pages/nova-lista/NovaListaPage';
import { ListaPage } from '@/pages/lista/ListaPage';
import { TiposDocumentoPage } from '@/pages/tipos-documento/TiposDocumentoPage';
import { PendenciasPage } from '@/pages/pendencias/PendenciasPage';
import { paths } from '@/shared/lib';
import { AppLayout } from './layout/AppLayout';

/**
 * Só as telas com API. Fora das rotas (e do menu) até os endpoints existirem — os arquivos
 * continuam em src/pages e src/features; quem abrir a URL cai em "não encontrado":
 * - fila, fila/:id (Análise do documento), fila/envio/:id (Remessa) — FilaPage, AnalisePage,
 *   EnvioPage: quando houver endpoints de fila e de decisão de análise.
 * - relatorios — RelatoriosPage: quando houver endpoints de relatórios.
 * Exigências (listas e tipos de documento) voltaram nas Partes B e C, sobre o módulo workflow do back.
 */
export const router = createBrowserRouter([
  // Amostra do design system — disponível também no build enquanto o sistema não tem páginas.
  { path: paths.componentes, element: <ComponentesPage /> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <VisaoGeralPage /> },
      { path: 'obras', element: <ObrasPage /> },
      { path: 'obras/:id', element: <ObraPage /> },
      { path: 'fornecedores', element: <FornecedoresPage /> },
      { path: 'fornecedores/novo', element: <FornecedorNovoPage /> },
      { path: 'fornecedores/:id', element: <FornecedorPage /> },
      { path: 'exigencias', element: <ExigenciasPage /> },
      { path: 'exigencias/nova', element: <NovaListaPage /> },
      { path: 'exigencias/:id', element: <ListaPage /> },
      { path: 'tipos-de-documento', element: <TiposDocumentoPage /> },
      { path: 'pendencias', element: <PendenciasPage /> },
      // Ferramenta de revisão — disponível também no build durante a fase de revisão.
      { path: '_estados', element: <EstadosPage /> },
      { path: '_api', element: <ApiPage /> },
      { path: '*', element: <NaoEncontradaPage /> },
    ],
  },
]);
