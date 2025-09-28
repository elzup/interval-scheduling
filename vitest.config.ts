import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        branches: 90,
        functions: 100,
        lines: 95,
        statements: 95
      },
      exclude: ['src/**/*.d.ts', 'src/__tests__/**']
    }
  }
})