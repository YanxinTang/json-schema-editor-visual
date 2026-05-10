import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
  },
  projects: [
    {
      name: 'react18-antd5',
      use: { baseURL: 'http://localhost:3001' },
    },
    {
      name: 'react19-antd6',
      use: { baseURL: 'http://localhost:3002' },
    },
  ],
  webServer: [
    {
      command: 'pnpm dev:e2e',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      cwd: './fixtures/react18-antd5',
    },
    {
      command: 'pnpm dev:e2e',
      port: 3002,
      reuseExistingServer: !process.env.CI,
      cwd: './fixtures/react19-antd6',
    },
  ],
});
