import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/theme.css';
import './app/styles/reset.css';
import { App } from './app/App';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
