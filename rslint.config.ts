import { defineConfig, ts, reactPlugin } from '@rslint/core';

export default defineConfig([
  ts.configs.recommended,
  reactPlugin.configs.recommended,
]);
