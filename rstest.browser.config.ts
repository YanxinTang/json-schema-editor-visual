import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: ['**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
  extends: withRslibConfig(),
  browser: {
    enabled: true,
    provider: 'playwright',
  },
});
