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
      use: { baseURL: 'http://localhost:4001' },
    },
    {
      name: 'react19-antd6',
      use: { baseURL: 'http://localhost:4002' },
    },
  ],
  webServer: [
    {
      command: 'pnpm build && pnpm preview',
      port: 4001,
      reuseExistingServer: !process.env.CI,
      cwd: './fixtures/react18-antd5',
    },
    {
      command: 'pnpm build && pnpm preview',
      port: 4002,
      reuseExistingServer: !process.env.CI,
      cwd: './fixtures/react19-antd6',
    },
  ],
});
