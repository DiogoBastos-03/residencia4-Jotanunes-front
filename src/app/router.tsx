import { createBrowserRouter, Navigate } from 'react-router';
import { ComponentesPage } from '@/pages/componentes/ComponentesPage';

const devRoutes = import.meta.env.DEV ? [{ path: '/_componentes', element: <ComponentesPage /> }] : [];

export const router = createBrowserRouter([
  ...devRoutes,
  { path: '*', element: <Navigate to="/_componentes" replace /> },
]);
