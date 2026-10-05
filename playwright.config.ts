import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// .env.e2e: cuentas de prueba (no se commitea). .env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
dotenv.config({ path: '.env.e2e' });
dotenv.config();

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

const desktop = { viewport: { width: 1280, height: 800 } };
const mobile = {
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

export default defineConfig({
  testDir: './e2e',
  // Todas las specs comparten la base real y una cuenta por proyecto: nada corre en paralelo.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: BASE_URL,
    locale: 'es-AR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npx vite --port=${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'setup-desktop', testMatch: /auth\.setup\.ts/, use: { ...desktop } },
    {
      name: 'desktop',
      dependencies: ['setup-desktop'],
      testIgnore: /auth\.setup\.ts/,
      use: { ...desktop, storageState: 'e2e/.auth/desktop.json' },
    },
    { name: 'setup-mobile', testMatch: /auth\.setup\.ts/, use: { ...mobile } },
    {
      name: 'mobile',
      dependencies: ['setup-mobile'],
      testIgnore: /auth\.setup\.ts/,
      use: { ...mobile, storageState: 'e2e/.auth/mobile.json' },
    },
  ],
});
