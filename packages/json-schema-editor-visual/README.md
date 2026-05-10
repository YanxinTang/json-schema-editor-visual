# @tyx1703/json-schema-editor-visual

A React component for visually editing JSON Schema.

## Peer Dependencies

- `react` ^18 or ^19
- `react-dom` ^18 or ^19
- `antd` ^5 or ^6
- `@ant-design/icons` ^5 or ^6

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

### Controlled Component

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

## Development

This project is a pnpm monorepo.

```bash
pnpm install          # Install dependencies
pnpm run build        # Build the library
pnpm run dev          # Watch mode
pnpm run test         # Unit tests (Rstest)
pnpm e2e              # Build + e2e tests (Playwright)
```
