import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Só no `npm run dev`: a API do Render não manda cabeçalho CORS para http://localhost,
  // então o navegador barra a chamada direta. Com API_PROXY_ALVO definido, o Vite repassa
  // /api e /health para lá; aí VITE_API_URL aponta para o próprio dev server.
  // Não começa com VITE_, então nunca vai para o bundle.
  const alvo = loadEnv(mode, process.cwd(), '').API_PROXY_ALVO;
  const proxy = alvo
    ? Object.fromEntries(
        ['/api', '/health'].map((p) => [
          p,
          { target: alvo, changeOrigin: true, secure: true },
        ]),
      )
    : undefined;
  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    build: {
      rolldownOptions: {
        output: {
          // Bibliotecas num pedaço separado: o código da aplicação muda mais que elas.
          codeSplitting: {
            // Só as bibliotecas da aplicação. MSW e devtools (e o que elas puxam) ficam nos pedaços sob demanda.
            groups: [
              {
                name: 'vendor',
                test: /node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser|@tanstack[\\/](react-)?query(-core)?[\\/]|zod|date-fns|@heroicons)[\\/]/,
              },
            ],
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
