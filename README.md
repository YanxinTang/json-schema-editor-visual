# @tyx1703/json-schema-editor-visual

[中文](./README.md) | [English](./README.en.md)

一个用于可视化编辑 JSON Schema 的 React 组件。

## 安装

```bash
pnpm add @tyx1703/json-schema-editor-visual
```

## 用法

### 基础用法

```jsx
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';

export default () => {
  return <JsonSchemaEditorVisual />;
};
```

### Mock 数据

传入 `mock` 数组可在编辑器中显示 Mock 数据列。

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

### 事件

使用 `data` 初始化，通过 `onChange` 接收 Schema 变更。

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

### 国际化

组件从 antd 的 `ConfigProvider` 读取语言环境。使用 `ConfigProvider` 包裹并传入 locale 即可切换语言。

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

当 antd locale 以 `zh` 开头时，组件默认显示中文（`zh_CN`），否则显示英文（`en_US`）。

## API

| 属性         | 类型                       | 默认值 | 说明                                                                  |
| ------------ | -------------------------- | ------ | --------------------------------------------------------------------- |
| `data`       | `string`                   | —      | 用于初始化编辑器的 JSON Schema 字符串                                 |
| `onChange`   | `(schema: string) => void` | —      | Schema 变更时的回调                                                   |
| `showEditor` | `boolean`                  | `true` | 是否显示左侧 JSON 源码编辑面板                                        |
| `format`     | `Format`                   | `[]`   | 自定义 format 选项（`{ name: string; title?: string }[]`）            |
| `mock`       | `MockSource`               | —      | Mock 数据源；传入后显示 Mock 列（`{ name: string; mock: string }[]`） |

## 从 json-schema-editor-visual 迁移

本项目是 [Open-Federation/json-schema-editor-visual](https://github.com/Open-Federation/json-schema-editor-visual) 的 fork，API 已重新设计。

### 安装

```bash
# 旧版
npm install json-schema-editor-visual

# 新版
pnpm add @tyx1703/json-schema-editor-visual
```

### 工厂函数 → 组件

```jsx
// 旧版
const schemaEditor = require('json-schema-editor-visual/dist/main.js');
const SchemaEditor = schemaEditor({ lang: 'zh_CN' });

// 新版
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';
```

### 通过 ConfigProvider 设置语言

```jsx
// 旧版
const SchemaEditor = schemaEditor({ lang: 'zh_CN' });

// 新版
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

<ConfigProvider locale={zhCN}>
  <JsonSchemaEditorVisual />
</ConfigProvider>;
```

### Mock & Format → Props

```jsx
// 旧版
const SchemaEditor = schemaEditor({ mock: MOCK, format: FORMAT });

// 新版
<JsonSchemaEditorVisual mock={MOCK} format={FORMAT} />;
```

### CSS — 不再需要

```jsx
// 旧版 — 需要手动引入
import 'antd/dist/antd.css';
require('json-schema-editor-visual/dist/main.css');

// 新版 — 无需引入
```

### 破坏性变更总结

| 变更        | 旧版                            | 新版                                 |
| ----------- | ------------------------------- | ------------------------------------ |
| 包名        | `json-schema-editor-visual`     | `@tyx1703/json-schema-editor-visual` |
| 导出方式    | 工厂函数 `schemaEditor(config)` | 直接导出组件                         |
| 语言设置    | `{ lang: 'zh_CN' }`             | antd `ConfigProvider`                |
| Mock/Format | 工厂函数选项                    | 组件 Props                           |
| CSS 引入    | 手动引入 `main.css`             | 不需要                               |
| React       | >=16.9.0                        | ^18 或 ^19                           |
| antd        | 4                               | ^5 或 ^6                             |
| 编辑器      | Ace                             | Monaco                               |
| Model API   | `Model.schema`                  | 已移除                               |

## 开发

本项目使用 pnpm monorepo。

```bash
pnpm install                           # 安装依赖
pnpm -F @tyx1703/json-schema-editor-visual build   # 构建
pnpm -F @tyx1703/json-schema-editor-visual dev     # 监听模式
pnpm -F @tyx1703/json-schema-editor-visual test    # 单元测试（Rstest）
pnpm e2e                               # 构建 + E2E 测试（Playwright）
pnpm -F docs doc                       # 启动文档开发服务器
```
