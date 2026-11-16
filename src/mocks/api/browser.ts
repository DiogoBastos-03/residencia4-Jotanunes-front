import { getResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { estadoMockDeRede } from './estado';
import { handlers } from './handlers';

/**
 * Plano B para navegador sem service worker (ex.: navegadores embutidos): troca o `fetch`
 * global por um que pergunta primeiro aos mesmos handlers. O que eles não tratam
 * (assets, HMR) segue para o fetch original.
 */
function responderPeloFetch(): void {
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const resposta = await getResponse(handlers, new Request(input, init));
    return resposta ?? original(input, init);
  };
}

/** Liga o MSW no navegador. Chamado no boot (src/main.tsx) quando VITE_API_MOCK=true, antes de renderizar. */
export async function iniciarMockDeRede(): Promise<void> {
  const worker = setupWorker(...handlers);
  try {
    await worker.start({
      // Só as chamadas da API passam pelos handlers; o resto (assets, fontes, HMR) segue direto.
      onUnhandledRequest: 'bypass',
      quiet: true,
    });
    estadoMockDeRede.ativo = true;
  } catch (erro) {
    responderPeloFetch();
    estadoMockDeRede.ativo = true;
    estadoMockDeRede.viaFetch = true;
    estadoMockDeRede.motivo = erro instanceof Error ? erro.message : String(erro);
    console.warn('[MSW] Service worker indisponível; o mock responde trocando o fetch.', erro);
  }
}
