/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço da API para o proxy do Vite (só usado em vite.config.ts). */
  readonly VITE_API_URL?: string;
  /** "true": fornecedores e obras vêm da API; qualquer outro valor: tudo é demonstração. */
  readonly VITE_USE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
