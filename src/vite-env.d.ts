/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Validada em src/shared/config/env.ts — não leia direto. */
  readonly VITE_API_URL?: string;
  /** Validada em src/shared/config/env.ts — não leia direto. */
  readonly VITE_API_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
