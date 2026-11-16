import { http } from './client';

/** GET /health — responde "Healthy" em texto puro. */
export function verificarSaude(signal?: AbortSignal): Promise<string> {
  return http.texto('GET', '/health', { signal });
}
