import react from '@vitejs/plugin-react';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  // "source" makes @app/shared resolve to its .ts source (no prebuild needed).
  resolve: { conditions: ['source', ...defaultClientConditions] },
  ssr: { resolve: { conditions: ['source', ...defaultServerConditions] } },
  server: {
    port: 5173,
    proxy: { '/api': API_URL, '/health': API_URL, '/mcp': API_URL },
  },
  test: { environment: 'node' },
});
