import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  projects: [
    {
      name: 'node',
      extends: withRslibConfig(),
      exclude: ['**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
      setupFiles: ['./rstest.setup.ts'],
    },
    {
      name: 'browser',
      extends: withRslibConfig(),
      include: ['**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
      browser: {
        enabled: true,
        provider: 'playwright',
      },
    },
  ],
  source: {
    define: {
      TEST: JSON.stringify(true),
    },
  },
});
