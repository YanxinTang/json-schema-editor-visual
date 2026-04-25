import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.{idea,git,cache,output,temp}/**',
    '**/*.browser.{test,spec}.?(c|m)[jt]s?(x)',
  ],
  extends: withRslibConfig(),
  setupFiles: ['./rstest.setup.ts'],
});
