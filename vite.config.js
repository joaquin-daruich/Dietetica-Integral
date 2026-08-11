import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:3000', // Puerto por defecto donde Netlify CLI corre las funciones
        changeOrigin: true,
      },
    },
  },
});