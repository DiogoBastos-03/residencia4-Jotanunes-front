import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/theme.css';
import './app/styles/reset.css';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado.');
const container = root;

/**
 * Boot em etapas: valida as variáveis de ambiente, liga o MSW (se VITE_API_MOCK=true)
 * e só então carrega e renderiza a aplicação. Se a configuração estiver errada,
 * mostra a mensagem em vez de deixar a tela em branco.
 */
async function iniciar() {
  try {
    const { env } = await import('./shared/config/env');
    if (env.apiMock) {
      const { iniciarMockDeRede } = await import('./mocks/api/browser');
      await iniciarMockDeRede();
    }
    const { App } = await import('./app/App');
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (erro) {
    const aviso = document.createElement('pre');
    aviso.setAttribute('role', 'alert');
    aviso.style.cssText = 'margin:24px;padding:16px;white-space:pre-wrap;font:13px/1.5 ui-monospace,monospace;border:1px solid currentColor;border-radius:4px';
    aviso.textContent = erro instanceof Error ? erro.message : String(erro);
    container.replaceChildren(aviso);
    throw erro;
  }
}

void iniciar();
