import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      // O back não tem CORS: o Vite repassa /api para ele e a chamada fica same-origin.
      // As rotas do back já começam com /api, então não há rewrite.
      proxy: {
        '/api': { target: env.VITE_API_URL ?? 'http://localhost:5057', changeOrigin: true },
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // Bibliotecas num pedaço separado: o código da aplicação muda mais que elas.
          codeSplitting: {
            groups: [{ name: 'vendor', test: /node_modules/ }],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
