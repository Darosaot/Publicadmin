/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    include: ['tests/engine/**/*.test.ts'],
    environment: 'node',
    /**
     * The balance sweeps in `autoplay.test.ts` play tens of thousands of simulated months, and
     * they get slower every time the corpus or the engine grows. Vitest's 5s default was tuned
     * for unit tests; leaving it there means a real regression and a slightly larger content pack
     * fail the build identically, which teaches everyone to ignore the failure.
     */
    testTimeout: 30_000,
  },
});
