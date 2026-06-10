import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginApiDocgen } from '@rspress/plugin-api-docgen';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginWorkspaceDev } from 'rsbuild-plugin-workspace-dev';

export default defineConfig({
  root: path.join(__dirname, 'src'),
  base: '/json-schema-editor-visual/',
  title: 'JsonSchemaEditorVisual',
  lang: 'zh',
  builderConfig: {
    plugins: [
      pluginWorkspaceDev({
        startCurrent: true,
      }),
    ],
  },
  plugins: [
    pluginApiDocgen({
      entries: {
        JsonSchemaEditorVisual: '../react/src/index.tsx',
      },
      apiParseTool: 'react-docgen-typescript',
    }),
    pluginPreview(),
  ],
  mediumZoom: {
    selector: '.rspress-doc img:not(.nointeractive)',
  },
});
