import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      // Garde Next qui interdit l'import côté client : sans objet dans les tests.
      'server-only': path.resolve(import.meta.dirname, 'src/tests/stubs/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
  },
})
