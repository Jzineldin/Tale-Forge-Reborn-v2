import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/**/*.d.ts',
        'src/test/**',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/**/stories/**',
        'src/**/pages/**',
        'src/**/routes/**',
        'src/**/layout/**',
        'src/**/navigation/**',
        'src/**/templates/**',
      ],
    },
  },
});