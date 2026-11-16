import { z } from 'zod';

/**
 * Variáveis de ambiente, validadas no boot. É o ÚNICO arquivo que lê import.meta.env.
 * Faltou alguma? O boot para com uma mensagem dizendo qual (ver src/main.tsx).
 */
const esquema = z.object({
  VITE_API_URL: z.url({ error: 'VITE_API_URL precisa ser uma URL completa, ex.: https://residenciaiv-api-interna-latest.onrender.com' }),
  VITE_API_MOCK: z.enum(['true', 'false'], { error: 'VITE_API_MOCK precisa ser "true" ou "false"' }),
});

export class EnvInvalidoError extends Error {
  constructor(readonly problemas: string[]) {
    super(`Configuração inválida:\n${problemas.map((p) => `- ${p}`).join('\n')}\nConfira .env.local (modelo em .env.example) ou as variáveis do ambiente de deploy.`);
    this.name = 'EnvInvalidoError';
  }
}

export type Env = {
  /** URL base da API, sem barra no fim. */
  apiUrl: string;
  /** true: as chamadas são respondidas pelo MSW (src/mocks/api). */
  apiMock: boolean;
  /** Build de desenvolvimento (npm run dev). */
  dev: boolean;
};

function ler(): Env {
  const resultado = esquema.safeParse(import.meta.env);
  if (!resultado.success) {
    throw new EnvInvalidoError(resultado.error.issues.map((i) => `${i.path.join('.') || 'env'}: ${i.message}`));
  }
  return {
    apiUrl: resultado.data.VITE_API_URL.replace(/\/+$/, ''),
    apiMock: resultado.data.VITE_API_MOCK === 'true',
    dev: import.meta.env.DEV,
  };
}

export const env: Env = ler();
