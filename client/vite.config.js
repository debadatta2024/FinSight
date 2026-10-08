import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, any request starting with /api is forwarded to the Express
// server. The browser thinks everything is one origin, so there are no CORS issues.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
