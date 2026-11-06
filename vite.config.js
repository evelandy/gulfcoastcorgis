import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        -> normal static build in /dist (deploy to Netlify, Vercel, S3, etc.)
// `npm run build:single` -> everything inlined into one index.html (handy for quick previews)
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  base: '/',
  server: {
    port: 5173,
    // When your backend is running locally (e.g. Express on :4000), requests to /api
    // are forwarded there, so you can set VITE_API_URL=/api during development.
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
}));
