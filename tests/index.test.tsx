import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import schemaEditor from '../src';

describe('JsonSchemaReactEditor', () => {
  test('初始状态渲染', async () => {
    const SchemaEditor = schemaEditor();
    render(<SchemaEditor />);

    // 顶部导入按钮
    expect(
      screen.getByRole('button', { name: 'Import JSON' }),
    ).toBeInTheDocument();
    // root 输入框（禁用）
    expect(screen.getByDisplayValue('root')).toBeDisabled();
    // 类型选择器 object
    expect(screen.getByText('object')).toBeInTheDocument();
    // title 输入框
    expect(screen.getByDisplayValue('title')).toBeInTheDocument();
    // description 输入框
    expect(screen.getByPlaceholderText('description')).toBeInTheDocument();
    // 根节点展开图标
    expect(screen.getByRole('img', { name: 'caret-down' })).toBeInTheDocument();
    // 设置按钮
    expect(screen.getByRole('img', { name: 'setting' })).toBeInTheDocument();
    // 新增按钮
    expect(screen.getByRole('img', { name: 'plus' })).toBeInTheDocument();
  });
});
