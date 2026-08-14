import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * The smoke test runs against the production bundle, not the dev server, so it exercises what
 * actually ships. Chromium comes from the preinstalled browser set — @playwright/test is pinned
 * to the version that matches it, so nothing is downloaded.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list']],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    // Bind explicitly to IPv4 rather than letting `vite preview` default to `localhost`. On CI
    // runners `localhost` resolves to the IPv6 loopback first, so the server listens on ::1 while
    // Playwright polls 127.0.0.1 and the run dies on a bare "timed out waiting for webServer".
    command: `npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Surface the server's own output, so a future failure says why instead of just that it timed out.
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
