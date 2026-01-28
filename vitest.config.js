import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    include: ['**/__tests__/**/*.js', '**/*.spec.js'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/archive/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.config.js',
        '**/dist/',
        'server.cjs',
        'e2e/',
        'archive/'
      ]
    }
  }
})
