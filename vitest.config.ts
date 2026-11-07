import { defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// One test run for the whole repo. "source" makes workspace packages resolve to
// their .ts source, so tests never need a prebuild.
const conditions = ['source', ...defaultServerConditions];

export default defineConfig({
  resolve: { conditions },
  ssr: { resolve: { conditions } },
  test: {
    projects: [
      ...['shared', 'config', 'server'].map((name) => ({
        extends: true as const,
        test: { name, root: name, environment: 'node' as const },
      })),
      'client',
    ],
  },
});
