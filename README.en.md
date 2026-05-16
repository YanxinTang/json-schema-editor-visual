# @tyx1703/json-schema-editor-visual

[中文](./README.md) | [English](./README.en.md)

A React component for visually editing JSON Schema.

## Install

```bash
pnpm add @tyx1703/json-schema-editor-visual
```

## Usage

### Basic

```jsx
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';

export default () => {
  return <JsonSchemaEditorVisual />;
};
```

### Mock Data

Pass a `mock` array to display a mock data column in the editor.

```jsx
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';

const MOCK_SOURCE = [
  { name: '字符串', mock: '@string' },
  { name: '自然数', mock: '@natural' },
  { name: '布尔', mock: '@boolean' },
  { name: 'email', mock: '@email' },
  { name: '日期', mock: '@date' },
];

export default () => {
  return <JsonSchemaEditorVisual mock={MOCK_SOURCE} />;
};
```

### Events

Use `data` to initialize and `onChange` to receive schema updates.

```jsx
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';

const data = `{"type":"object","title":"title","properties":{"field_1":{"type":"string","title":"field_1_title","description":"field_1_description"}},"required":["field_1"]}`;

export default () => {
  return (
    <JsonSchemaEditorVisual
      data={data}
      onChange={(value) => console.log('value: ', value)}
    />
  );
};
```

### i18n

The component reads the locale from antd's `ConfigProvider`. Wrap with `ConfigProvider` and pass a locale to switch language.

```jsx
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';

export default () => {
  return (
    <ConfigProvider locale={zhCN}>
      <JsonSchemaEditorVisual />
    </ConfigProvider>
  );
};
```

The component defaults to Chinese (`zh_CN`) when the antd locale starts with `zh`, and English (`en_US`) otherwise.

## API

| Prop         | Type                       | Default | Description                                                                                 |
| ------------ | -------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `data`       | `string`                   | —       | JSON Schema string to initialize the editor                                                 |
| `onChange`   | `(schema: string) => void` | —       | Callback fired when the schema changes                                                      |
| `showEditor` | `boolean`                  | `true`  | Show/hide the left-side JSON source editor panel                                            |
| `format`     | `Format`                   | `[]`    | Custom format options (`{ name: string; title?: string }[]`)                                |
| `mock`       | `MockSource`               | —       | Mock data source; when provided, a mock column appears (`{ name: string; mock: string }[]`) |

## Migrating from json-schema-editor-visual

This is a fork of [Open-Federation/json-schema-editor-visual](https://github.com/Open-Federation/json-schema-editor-visual) with a redesigned API.

### Install

```bash
# old
npm install json-schema-editor-visual

# new
pnpm add @tyx1703/json-schema-editor-visual
```

### Factory function → Component

```jsx
// old
const schemaEditor = require('json-schema-editor-visual/dist/main.js');
const SchemaEditor = schemaEditor({ lang: 'zh_CN' });

// new
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';
```

### Locale via ConfigProvider

```jsx
// old
const SchemaEditor = schemaEditor({ lang: 'zh_CN' });

// new
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

<ConfigProvider locale={zhCN}>
  <JsonSchemaEditorVisual />
</ConfigProvider>;
```

### Mock & Format → Props

```jsx
// old
const SchemaEditor = schemaEditor({ mock: MOCK, format: FORMAT });

// new
<JsonSchemaEditorVisual mock={MOCK} format={FORMAT} />;
```

### CSS — no longer needed

```jsx
// old — required
import 'antd/dist/antd.css';
require('json-schema-editor-visual/dist/main.css');

// new — nothing to import
```

### Breaking changes summary

| Change        | Old                            | New                                  |
| ------------- | ------------------------------ | ------------------------------------ |
| Package name  | `json-schema-editor-visual`    | `@tyx1703/json-schema-editor-visual` |
| Export        | Factory `schemaEditor(config)` | Direct component                     |
| Locale        | `{ lang: 'zh_CN' }`            | antd `ConfigProvider`                |
| Mock / Format | Factory options                | Component props                      |
| CSS import    | Manual `main.css`              | Not needed                           |
| React         | >=16.9.0                       | ^18 or ^19                           |
| antd          | 4                              | ^5 or ^6                             |
| Editor        | Ace                            | Monaco                               |
| Model API     | `Model.schema`                 | Removed                              |

## Development

This project is a pnpm monorepo.

```bash
pnpm install                           # Install dependencies
pnpm -F @tyx1703/json-schema-editor-visual build   # Build the library
pnpm -F @tyx1703/json-schema-editor-visual dev     # Watch mode
pnpm -F @tyx1703/json-schema-editor-visual test    # Unit tests (Rstest)
pnpm e2e                               # Build + E2E tests (Playwright)
pnpm -F docs doc                       # Start docs dev server
```
